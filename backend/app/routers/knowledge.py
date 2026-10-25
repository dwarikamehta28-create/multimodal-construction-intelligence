from fastapi import APIRouter

from ..deps import wrap
from ..schemas import Envelope, KnowledgeRequest, KnowledgeResult
from ..services.llm_client import agenerate
from ..services.prompts import PROMPTS

router = APIRouter()


@router.post("/knowledge", response_model=Envelope[KnowledgeResult])
async def knowledge(req: KnowledgeRequest):
    text = f"Level: {req.level}\nQuestion: {req.question}"
    result = await agenerate("knowledge", KnowledgeResult, PROMPTS["knowledge"], text, None, {"question": req.question})
    return wrap(result)
