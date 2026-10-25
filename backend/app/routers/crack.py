from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile

from ..deps import clean_text, prepare_inputs, wrap
from ..schemas import CrackResult, Envelope
from ..services.llm_client import agenerate
from ..services.prompts import PROMPTS

router = APIRouter()


@router.post("/crack", response_model=Envelope[CrackResult])
async def crack(images: Optional[list[UploadFile]] = File(default=None), notes: str = Form(""), element: str = Form("")):
    notes = clean_text(notes, 3000, "notes")
    element = clean_text(element, 120, "element")
    processed, warnings = await prepare_inputs(images, notes)
    text = f"Building element: {element or 'not given'}\nNotes: {notes or 'none'}\nImages attached: {len(processed)}"
    result = await agenerate("crack", CrackResult, PROMPTS["crack"], text, processed, {"notes": notes, "images": len(processed)})
    return wrap(result, warnings)
