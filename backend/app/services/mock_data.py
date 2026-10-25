"""Deterministic sample outputs used in demo mode (no API key). They follow the
same schemas as live AI output so the UI and tests exercise the real contract."""
from . import estimator, weather_client


def safety(ctx):
    img = ctx.get("images", 0) > 0
    return {
        "summary": "Several fall-from-height and housekeeping risks are visible, and PPE use is inconsistent."
        if img else "Text-only review: based on the description, edge protection and PPE need verification on site.",
        "overall_risk": "high", "safety_score": 58 if img else 50, "workers_detected": 3 if img else 0,
        "hazards": [
            {"type": "Unprotected edge", "description": "Slab edge without guard rails or toe boards.", "severity": "high",
             "location_hint": "Upper floor, open side", "corrective_action": "Install double guard rails and toe boards before any work continues."},
            {"type": "Scaffolding", "description": "Scaffold ties and base plates look inadequate.", "severity": "high",
             "location_hint": "Facade", "corrective_action": "Have a competent person inspect and tag the scaffold."},
            {"type": "Housekeeping", "description": "Loose material and offcuts on the walkway.", "severity": "medium",
             "location_hint": "Ground level access", "corrective_action": "Clear and stack materials; keep a 1 m walkway."},
        ],
        "ppe_findings": [
            {"item": "Helmet", "status": "compliant", "note": ""},
            {"item": "Hi-vis vest", "status": "missing", "note": "One worker without a vest."},
            {"item": "Safety harness", "status": "unclear", "note": "Not visible for work at height."},
            {"item": "Safety shoes", "status": "compliant", "note": ""},
        ],
        "immediate_actions": ["Stop work at the open edge until guard rails are fitted.", "Hold a toolbox talk on PPE and work at height.",
                              "Inspect the scaffold before the next shift."],
        "image_quality": {"usable": True, "notes": "Demo output. Add ANTHROPIC_API_KEY for real image analysis."},
        "confidence": 0.62 if img else 0.35,
    }


_CRACKS = {
    "hairline": ("hairline", "low", 0.2, False, "monitor"),
    "vertical": ("vertical", "medium", 1.0, False, "repair_soon"),
    "horizontal": ("horizontal", "high", 2.5, True, "consult_engineer"),
    "diagonal": ("diagonal", "high", 3.0, True, "consult_engineer"),
    "stair": ("stair_step", "high", 3.5, True, "consult_engineer"),
    "map": ("map_pattern", "low", 0.3, False, "monitor"),
}


def crack(ctx):
    notes = (ctx.get("notes") or "").lower()
    key = next((k for k in _CRACKS if k in notes), "diagonal")
    kind, sev, width, concern, urgency = _CRACKS[key]
    return {
        "summary": f"A {kind.replace('_', ' ')} crack is likely present (demo estimate).", "crack_detected": True,
        "crack_type": kind, "severity": sev, "estimated_width_mm": width, "structural_concern": concern,
        "probable_causes": ["Differential settlement of the foundation", "Thermal movement or shrinkage", "Overloading or poor curing"],
        "recommended_actions": ["Mark and date the crack ends and measure the width with a crack gauge.",
                                "Seal with a flexible filler after the cause is confirmed.",
                                "Get a structural engineer to inspect if the crack is widening."],
        "urgency": urgency, "monitoring_advice": "Measure weekly for a month. Escalate if the width grows or water seeps through.",
        "image_quality": {"usable": True, "notes": "Demo output. Add ANTHROPIC_API_KEY for real image analysis."},
        "confidence": 0.6,
    }


def planning(ctx):
    area, floors = ctx["area"], ctx["floors"]
    return {
        "summary": f"{floors}-floor {ctx['project_type']} project of {area:,.0f} sq ft at {ctx['quality']} quality. "
                   "Structure and finishing drive most of the duration.",
        "schedule": estimator.template_schedule(area, floors),
        "risks": ["Monsoon delays to excavation and concreting", "Price swings in steel and cement",
                  "Late approvals or utility connections", "Labour availability during festival seasons"],
        "assumptions": ["Single contractor with adequate labour", "Soil is suitable for conventional footings",
                        "Indicative rates; confirm with local quotes", "No basement or special structures"],
    }


def valuation(ctx):
    return {
        "adjustment_pct": 2.0,
        "factors": [{"name": "Locality", "impact": "neutral", "note": "No locality data in demo mode."},
                    {"name": "Amenities", "impact": "positive", "note": "Listed amenities add modest value."},
                    {"name": "Age and condition", "impact": "negative", "note": "Depreciation applied in the baseline."}],
        "comparable_notes": "Demo mode: no live comparables. Check recent registered sales nearby.", "confidence": 0.5,
    }


def assistant(ctx):
    stage = ctx.get("stage", "structure")
    checks = {
        "foundation": ["Check excavation depth and soil bearing", "Verify PCC thickness and reinforcement cover", "Dewater before pouring"],
        "structure": ["Verify bar spacing and cover blocks", "Check formwork alignment and props", "Cast cubes for every pour"],
        "masonry": ["Check mortar mix and joint thickness", "Verify lintel levels", "Keep walls plumb"],
        "finishing": ["Check surface levels before tiling", "Test waterproofing with a ponding test", "Snag walls and ceilings"],
    }
    return {
        "answer": f"For the {stage} stage, focus on quality checks before the next pour or closing-up. Review reinforcement, alignment and curing today.",
        "action_items": [{"task": "Walk the site and photograph any defects", "priority": "high"},
                        {"task": "Confirm material delivery for tomorrow", "priority": "medium"}],
        "checklist": checks.get(stage, checks["structure"]),
        "flags": ["Do not pour concrete without an approved pre-pour check."],
        "follow_up_questions": ["What is the planned pour or work for tomorrow?", "Are there any open inspection comments?"],
    }


def weather(ctx):
    return weather_client.rule_based_narrative(ctx["days"], ctx.get("activity", "site work"))


_KB = [
    (("cur",), {"answer": "Curing keeps concrete moist so cement hydrates fully and reaches design strength. Start 12-24 hours after placing and continue for at least 7 days (10 for blended cements or hot weather).",
                "key_points": ["Use ponding, wet hessian or curing compound", "Never let the surface dry out in the first days", "Protect from direct sun and wind"],
                "standards": ["IS 456:2000"], "related_topics": ["Slump test", "Cube testing"], "caution": ""}),
    (("slump", "workab"), {"answer": "The slump test measures concrete workability. A cone is filled in three layers, tamped, lifted, and the drop in height is measured.",
                           "key_points": ["Typical slump 50-100 mm for beams and slabs", "Reject mixes outside the specified range", "Do not add water on site to raise slump"],
                           "standards": ["IS 1199"], "related_topics": ["Water-cement ratio", "Cube testing"], "caution": ""}),
    (("cover",), {"answer": "Cover is the concrete layer between the steel and the surface. It protects steel from corrosion and fire.",
                  "key_points": ["Mild exposure: 20 mm for slabs and 30 mm for beams (typical)", "Use proper cover blocks, not bricks", "Cover increases with exposure severity"],
                  "standards": ["IS 456:2000"], "related_topics": ["Corrosion", "Exposure conditions"], "caution": "Confirm cover from the structural drawings."}),
    (("foundation", "footing"), {"answer": "Foundations spread building loads to the soil. The type depends on soil bearing capacity, loads and water table.",
                                 "key_points": ["Get a soil investigation for multi-storey buildings", "Keep footings below the weathering and shrinkage zone", "Provide a damp-proof course at plinth"],
                                 "standards": ["IS 1904", "IS 6403"], "related_topics": ["Soil testing", "Plinth beam"], "caution": "Foundation design needs a structural engineer."}),
]


def knowledge(ctx):
    q = (ctx.get("question") or "").lower()
    for keys, out in _KB:
        if any(k in q for k in keys):
            return out
    return {"answer": "Demo mode has a small built-in knowledge base (curing, slump, cover, foundations). Add ANTHROPIC_API_KEY for full answers.",
            "key_points": ["Ask about curing, slump test, cover or foundations to see sample answers"],
            "standards": [], "related_topics": ["Curing", "Slump test", "Cover to reinforcement"], "caution": ""}


MOCKS = {"safety": safety, "crack": crack, "planning": planning, "valuation": valuation, "assistant": assistant,
         "weather": weather, "knowledge": knowledge}
