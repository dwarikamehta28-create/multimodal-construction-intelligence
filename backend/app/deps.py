from typing import Optional

from fastapi import UploadFile

from .config import get_settings
from .errors import AppError
from .services.images import ProcessedImage, process_uploads


def clean_text(value: Optional[str], max_len: int = 3000, field: str = "text") -> str:
    v = (value or "").strip()
    if len(v) > max_len:
        raise AppError(422, "invalid_input", f"{field} is too long (max {max_len} characters).")
    return v


async def prepare_inputs(images: Optional[list[UploadFile]], notes: str, require_any: bool = True):
    files = [f for f in (images or []) if f and f.filename]
    processed: list[ProcessedImage] = await process_uploads(files)
    if require_any and not processed and not notes:
        raise AppError(422, "missing_input", "Add at least one image or a text description.")
    warnings = [w for p in processed for w in p.warnings]
    return processed, warnings


def wrap(data, warnings=None):
    s = get_settings()
    demo = s.llm_provider == "mock"
    return {
        "ok": True,
        "mode": "demo" if demo else "live",
        "engine": "built-in sample engine" if demo else s.model,
        "warnings": warnings or [],
        "data": data,
    }
