from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile

from ..deps import clean_text, prepare_inputs, wrap
from ..errors import AppError
from ..schemas import AssistantResult, Envelope
from ..services.llm_client import agenerate
from ..services.prompts import PROMPTS

router = APIRouter()
STAGES = {"foundation", "structure", "masonry", "finishing"}


@router.post("/assistant", response_model=Envelope[AssistantResult])
async def assistant(images: Optional[list[UploadFile]] = File(default=None), message: str = Form(""), stage: str = Form("structure")):
    message = clean_text(message, 2000, "message")
    if stage not in STAGES:
        raise AppError(422, "invalid_input", f"stage must be one of: {', '.join(sorted(STAGES))}.")
    processed, warnings = await prepare_inputs(images, message)
    text = f"Stage: {stage}\nQuestion or update: {message or 'Review the attached photo.'}\nImages attached: {len(processed)}"
    result = await agenerate("assistant", AssistantResult, PROMPTS["assistant"], text, processed, {"stage": stage})
    return wrap(result, warnings)
