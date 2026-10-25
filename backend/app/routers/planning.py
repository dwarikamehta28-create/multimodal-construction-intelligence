import json

from fastapi import APIRouter

from ..deps import wrap
from ..errors import AppError, LLMError
from ..schemas import Envelope, PlanningNarrative, PlanningRequest, PlanningResult
from ..services import estimator
from ..services.llm_client import agenerate
from ..services.prompts import PROMPTS

router = APIRouter()


def _clean_schedule(tasks):
    ids = {t.id for t in tasks}
    for t in tasks:
        t.depends_on = [d for d in t.depends_on if d in ids and d != t.id]
    return tasks


@router.post("/planning", response_model=Envelope[PlanningResult])
async def planning(req: PlanningRequest):
    floor_area = req.built_up_area_sqft / req.floors
    if floor_area < 100:
        raise AppError(422, "invalid_input", "Each floor must be at least 100 sq ft. Reduce floors or increase the area.")

    materials = estimator.estimate_materials(req.built_up_area_sqft, req.quality)
    cost = estimator.estimate_cost(req.built_up_area_sqft, req.project_type, req.quality, req.city, req.floors)
    plan = estimator.build_floor_plan(req.project_type, floor_area, req.bedrooms, req.bathrooms)

    facts = {**req.model_dump(mode="json"), "materials": materials, "total_cost_inr": cost["total_inr"]}
    ctx = {"area": req.built_up_area_sqft, "floors": req.floors, "project_type": req.project_type, "quality": req.quality}
    warnings = []
    try:
        narrative = await agenerate("planning", PlanningNarrative, PROMPTS["planning"], json.dumps(facts), None, ctx)
        if not narrative.schedule:
            raise LLMError("empty schedule")
    except LLMError:
        from ..services import mock_data
        narrative = PlanningNarrative.model_validate(mock_data.planning(ctx))
        warnings.append("AI schedule was unavailable, so a standard template schedule is shown.")

    schedule = _clean_schedule(narrative.schedule)
    total_weeks = max(t.start_week + t.duration_weeks for t in schedule)
    result = PlanningResult(summary=narrative.summary, materials=materials, cost=cost, schedule=schedule,
                            total_weeks=total_weeks, floor_plan=plan, risks=narrative.risks, assumptions=narrative.assumptions)
    return wrap(result, warnings)
