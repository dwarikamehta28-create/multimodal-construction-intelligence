import json

import pytest

from app.errors import LLMError
from app.schemas import CrackResult, SafetyResult
from app.services import estimator, llm_client


def test_schema_is_lenient():
    r = SafetyResult.model_validate({"summary": "x", "overall_risk": "SEVERE", "safety_score": 140, "confidence": 85,
                                     "workers_detected": "3", "ppe_findings": [{"item": "Helmet", "status": "Compliant"}], "extra": 1})
    assert r.overall_risk == "medium" and r.safety_score == 100 and r.confidence == 0.85 and r.workers_detected == 3
    assert r.ppe_findings[0].status == "compliant"


def test_crack_width_parsing():
    assert CrackResult.model_validate({"summary": "s", "estimated_width_mm": "about 0.3 mm", "crack_type": "weird"}).estimated_width_mm == 0.3
    assert CrackResult.model_validate({"summary": "s", "crack_type": "weird"}).crack_type == "unclear"


def test_extract_json_handles_fences():
    assert llm_client._extract_json('Here:\n```json\n{"a": 1}\n```') == {"a": 1}
    with pytest.raises(ValueError):
        llm_client._extract_json("no json")


@pytest.fixture
def live(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "anthropic")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")


def test_llm_retries_after_invalid_json(live, monkeypatch):
    replies = iter(["sorry, here you go", json.dumps({"summary": "ok"})])
    seen = []
    monkeypatch.setattr(llm_client, "_complete", lambda system, messages: (seen.append(len(messages)), next(replies))[1])
    out = llm_client.generate("crack", CrackResult, "", "hi")
    assert out.summary == "ok" and seen == [1, 3]


def test_llm_gives_up_after_retries(live, monkeypatch):
    monkeypatch.setattr(llm_client, "_complete", lambda system, messages: "still not json")
    with pytest.raises(LLMError):
        llm_client.generate("crack", CrackResult, "", "hi")


def test_endpoint_returns_502_on_bad_ai(live, monkeypatch, client):
    monkeypatch.setattr(llm_client, "_complete", lambda system, messages: "{}{")
    r = client.post("/api/knowledge", json={"question": "what is slump"})
    assert r.status_code == 502 and r.json() == {"ok": False, "error": {"code": "ai_error", "message": "The AI returned an unusable response. Please try again."}}


def test_planning_falls_back_when_ai_down(live, monkeypatch, client):
    monkeypatch.setattr(llm_client, "_complete", lambda system, messages: "nope")
    r = client.post("/api/planning", json={"built_up_area_sqft": 1800, "floors": 1})
    assert r.status_code == 200 and r.json()["warnings"] and r.json()["data"]["schedule"]


def test_estimator_scaling():
    small = estimator.estimate_cost(1000, "residential", "standard", "Indore", 1)["total_inr"]
    big = estimator.estimate_cost(2000, "residential", "standard", "Indore", 1)["total_inr"]
    assert big == pytest.approx(small * 2, rel=0.01)
    assert estimator.estimate_cost(1000, "residential", "luxury", "x", 1)["total_inr"] > small


def test_template_schedule_dependencies_valid():
    s = estimator.template_schedule(3000, 3)
    ids = {t["id"] for t in s}
    assert all(d in ids for t in s for d in t["depends_on"])


def test_gemini_message_conversion():
    msgs = [{"role": "user", "content": [{"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": "AAA"}}, {"type": "text", "text": "hi"}]},
            {"role": "assistant", "content": "bad"}, {"role": "user", "content": "fix"}]
    out = llm_client._to_gemini_contents(msgs)
    assert out[0]["parts"][0]["inline_data"]["data"] == "AAA" and out[1]["role"] == "model" and out[2]["parts"][0]["text"] == "fix"


def test_gemini_provider_end_to_end(monkeypatch, client):
    import httpx
    monkeypatch.setenv("LLM_PROVIDER", "")
    monkeypatch.setenv("GEMINI_API_KEY", "g-test")
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    calls = {}

    def fake_post(url, json=None, headers=None, timeout=None):
        calls["url"], calls["headers"], calls["body"] = url, headers, json
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": '{"answer": "Cure for 7 days.", "key_points": ["a"]}'}]}}]})

    monkeypatch.setattr(httpx, "post", fake_post)
    r = client.post("/api/knowledge", json={"question": "how to cure concrete"})
    assert r.status_code == 200 and r.json()["mode"] == "live" and r.json()["engine"] == "gemini-2.5-flash"
    assert r.json()["data"]["answer"] == "Cure for 7 days." and calls["headers"]["x-goog-api-key"] == "g-test"
    assert calls["body"]["generationConfig"]["responseMimeType"] == "application/json"


def test_gemini_error_mapping(monkeypatch, client):
    import httpx
    monkeypatch.setenv("LLM_PROVIDER", "gemini")
    monkeypatch.setenv("GEMINI_API_KEY", "bad")
    for code, expect in ((400, 502), (429, 503)):
        monkeypatch.setattr(httpx, "post", lambda *a, _c=code, **k: httpx.Response(_c, json={}))
        assert client.post("/api/knowledge", json={"question": "slump test"}).status_code == expect
