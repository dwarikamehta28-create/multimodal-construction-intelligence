from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile

from ..deps import clean_text, prepare_inputs, wrap
from ..schemas import Envelope, SafetyResult
from ..services.llm_client import agenerate
from ..services.prompts import PROMPTS

router = APIRouter()


@router.post("/safety", response_model=Envelope[SafetyResult])
async def safety(images: Optional[list[UploadFile]] = File(default=None), notes: str = Form(""), site_context: str = Form("")):
    notes = clean_text(notes, 3000, "notes")
    site_context = clean_text(site_context, 500, "site_context")
    processed, warnings = await prepare_inputs(images, notes)
    text = f"Site context: {site_context or 'not given'}\nNotes: {notes or 'none'}\nImages attached: {len(processed)}"
    result = await agenerate("safety", SafetyResult, PROMPTS["safety"], text, processed, {"notes": notes, "images": len(processed)})
    return wrap(result, warnings)
