import json

from fastapi import APIRouter

from ..deps import wrap
from ..errors import LLMError
from ..schemas import Envelope, WeatherNarrative, WeatherRequest, WeatherResult
from ..services import weather_client
from ..services.llm_client import agenerate
from ..services.prompts import PROMPTS

router = APIRouter()


@router.post("/weather", response_model=Envelope[WeatherResult])
async def weather(req: WeatherRequest):
    location, days = await weather_client.fetch_forecast(req.city)
    ctx = {"days": days, "activity": req.activity}
    warnings = []
    try:
        n = await agenerate("weather", WeatherNarrative, PROMPTS["weather"],
                            json.dumps({"activity": req.activity, "forecast": days}), None, ctx)
    except LLMError:
        n = WeatherNarrative.model_validate(weather_client.rule_based_narrative(days, req.activity))
        warnings.append("AI advice was unavailable, so rule-based advice is shown.")
    fallback = weather_client.rule_based_narrative(days, req.activity)["day_advice"]
    for i, d in enumerate(days):
        d["advice"] = n.day_advice[i] if i < len(n.day_advice) and n.day_advice[i] else fallback[i]
    result = WeatherResult(location=location, summary=n.summary, days=days,
                           work_recommendations=n.work_recommendations, material_precautions=n.material_precautions)
    return wrap(result, warnings)
