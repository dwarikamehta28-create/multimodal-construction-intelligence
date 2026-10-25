import json

from fastapi import APIRouter

from ..deps import wrap
from ..schemas import Envelope, ValuationNarrative, ValuationRequest, ValuationResult
from ..services import valuation_model as vm
from ..services.llm_client import agenerate
from ..services.prompts import PROMPTS

router = APIRouter()
DISCLAIMER = "Indicative estimate only. Not a certified valuation. Confirm with a registered valuer and recent local sales."


@router.post("/valuation", response_model=Envelope[ValuationResult])
async def valuation(req: ValuationRequest):
    rate, base_value = vm.baseline(req.city, req.property_type, req.area_sqft, req.age_years, req.condition, req.amenities)
    facts = {**req.model_dump(mode="json"), "baseline_rate_inr_per_sqft": rate}
    narrative = await agenerate("valuation", ValuationNarrative, PROMPTS["valuation"], json.dumps(facts), None, {})
    value = round(base_value * (1 + narrative.adjustment_pct / 100))
    low, high = vm.price_range(value, narrative.confidence)
    result = ValuationResult(
        estimated_value_inr=value, low_inr=low, high_inr=high, price_per_sqft_inr=round(value / req.area_sqft),
        baseline_rate_inr=rate, adjustment_pct=narrative.adjustment_pct, factors=narrative.factors,
        comparable_notes=narrative.comparable_notes, confidence=narrative.confidence, disclaimer=DISCLAIMER)
    return wrap(result)
