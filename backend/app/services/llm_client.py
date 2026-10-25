"""Single entry point for all AI calls.

generate() builds the prompt, calls the multimodal model, extracts JSON,
validates it against a Pydantic schema and retries once with the validation
error if the model's output is malformed. In demo mode (no API key) it returns
deterministic sample data from mock_data so the whole app still runs."""
import json
import re

from starlette.concurrency import run_in_threadpool

from ..config import get_settings
from ..errors import LLMError
from . import mock_data

SYSTEM_BASE = (
    "You are a senior construction engineer and site-safety officer advising teams in India. "
    "Reply with ONE JSON object and nothing else: no prose, no markdown fences. "
    "The JSON must follow the schema below exactly. Use only what you can see or are told; "
    "never invent measurements, and say so in the relevant field when something is unclear. "
    "Be practical and concise. Reference Indian standards (IS 456, IS 800, NBC 2016, BOCW rules) where relevant. "
    "You support, but never replace, a licensed structural engineer."
)
MAX_ATTEMPTS = 2


def _extract_json(text: str) -> dict:
    text = re.sub(r"```(?:json)?", "", text).strip()
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end <= start:
        raise ValueError("no JSON object found in reply")
    return json.loads(text[start : end + 1])


def _complete(system: str, messages: list) -> str:
    if get_settings().llm_provider == "gemini":
        return _complete_gemini(system, messages)
    return _complete_anthropic(system, messages)


def _to_gemini_contents(messages: list) -> list:
    out = []
    for m in messages:
        parts = []
        if isinstance(m["content"], str):
            parts.append({"text": m["content"]})
        else:
            for b in m["content"]:
                if b["type"] == "text":
                    parts.append({"text": b["text"]})
                elif b["type"] == "image":
                    parts.append({"inline_data": {"mime_type": b["source"]["media_type"], "data": b["source"]["data"]}})
        out.append({"role": "model" if m["role"] == "assistant" else "user", "parts": parts})
    return out


def _complete_gemini(system: str, messages: list) -> str:
    import httpx

    s = get_settings()
    if not s.gemini_api_key:
        raise LLMError("GEMINI_API_KEY is not set on the server.", 503, "ai_unavailable")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{s.model}:generateContent"
    body = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": _to_gemini_contents(messages),
        "generationConfig": {"responseMimeType": "application/json", "maxOutputTokens": 8192, "temperature": 0.3},
    }
    try:
        r = httpx.post(url, json=body, headers={"x-goog-api-key": s.gemini_api_key}, timeout=90.0)
    except httpx.HTTPError:
        raise LLMError("Could not reach the AI service. Check your internet connection.", 503, "ai_unavailable")
    if r.status_code in (400, 401, 403):
        raise LLMError("Gemini rejected the request. Check that GEMINI_API_KEY and GEMINI_MODEL are correct.", 502, "ai_auth")
    if r.status_code == 429:
        raise LLMError("Gemini rate limit or quota reached. Wait a minute and try again.", 503, "ai_rate_limit")
    if r.status_code != 200:
        raise LLMError(f"The AI service returned an error ({r.status_code}).")
    try:
        parts = r.json()["candidates"][0]["content"]["parts"]
        return "".join(p.get("text", "") for p in parts)
    except (KeyError, IndexError, ValueError):
        return ""  # blocked or empty reply: handled by the retry logic


def _complete_anthropic(system: str, messages: list) -> str:
    import anthropic

    s = get_settings()
    if not s.anthropic_api_key:
        raise LLMError("ANTHROPIC_API_KEY is not set on the server.", 503, "ai_unavailable")
    client = anthropic.Anthropic(api_key=s.anthropic_api_key, timeout=90.0)
    try:
        resp = client.messages.create(model=s.model, max_tokens=4096, system=system, messages=messages)
    except anthropic.APIConnectionError:
        raise LLMError("Could not reach the AI service. Try again shortly.", 503, "ai_unavailable")
    except anthropic.APIStatusError as e:
        raise LLMError(f"The AI service returned an error ({e.status_code}).")
    return "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")


def generate(task, schema, instructions, user_text, images=None, mock_ctx=None):
    s = get_settings()
    if s.llm_provider == "mock":
        return schema.model_validate(mock_data.MOCKS[task](mock_ctx or {}))

    system = f"{SYSTEM_BASE}\n\n{instructions}\n\nJSON Schema:\n{json.dumps(schema.model_json_schema())}"
    content = [
        {"type": "image", "source": {"type": "base64", "media_type": im.media_type, "data": im.b64}}
        for im in (images or [])
    ]
    content.append({"type": "text", "text": user_text})
    messages = [{"role": "user", "content": content}]

    last_error = ""
    for _ in range(MAX_ATTEMPTS):
        raw = _complete(system, messages)
        try:
            return schema.model_validate(_extract_json(raw))
        except Exception as e:  # invalid JSON or schema mismatch
            last_error = str(e)[:500]
            messages += [
                {"role": "assistant", "content": raw or "(empty)"},
                {"role": "user", "content": f"That reply was invalid: {last_error}\nReturn only the corrected JSON object."},
            ]
    raise LLMError("The AI returned an unusable response. Please try again.")


async def agenerate(*args, **kwargs):
    return await run_in_threadpool(generate, *args, **kwargs)
