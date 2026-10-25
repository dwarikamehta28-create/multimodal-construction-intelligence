PROMPTS = {
    "safety": (
        "Task: construction site safety and PPE review of the attached site image(s) and notes. "
        "Identify hazards (falls from height, unprotected edges, poor scaffolding, housekeeping, electrical, "
        "excavation, machinery, fire) and PPE status per item (helmet, hi-vis vest, safety shoes, gloves, harness, "
        "eye protection). Rate each hazard low/medium/high/critical and give a concrete corrective action. "
        "safety_score is 0-100 (100 = safe). If the image is unclear or not a construction site, set "
        "image_quality.usable=false and explain in image_quality.notes. Lower confidence when evidence is weak."
    ),
    "crack": (
        "Task: analyse the crack(s) in the attached image(s) and notes. Classify crack_type, severity "
        "(none/low/medium/high/critical), estimate width in mm only if a scale reference is visible (else null), "
        "list probable causes and corrective actions, and set urgency. Hairline cracks under ~0.3 mm are usually "
        "cosmetic; diagonal/stair-step cracks, widths above ~3 mm or cracks in beams/columns need an engineer. "
        "If no crack is visible set crack_detected=false, crack_type='none', severity='none'."
    ),
    "planning": (
        "Task: given project facts and a pre-computed material and cost estimate, write a short summary, a "
        "realistic week-based construction schedule (tasks with id, phase, start_week from 0, duration_weeks, "
        "depends_on ids), the main project risks, and the assumptions. Do NOT recompute costs or quantities."
    ),
    "valuation": (
        "Task: you are given a baseline per-sq-ft rate for the city and property details. Return adjustment_pct "
        "(between -15 and 15) for locality, amenities, condition and any notes, the list of factors with "
        "positive/negative/neutral impact, brief comparable notes and a confidence. Do not return the final price."
    ),
    "assistant": (
        "Task: daily site assistant. Answer the site engineer's question or review the attached photo for the "
        "given construction stage. Give a direct answer, prioritised action items, a short checklist, any red "
        "flags, and up to 3 follow-up questions."
    ),
    "weather": (
        "Task: given a 5-day forecast with pre-computed suitability ratings, write a summary, work "
        "recommendations for the stated activity, material protection precautions, and ONE short advice string "
        "per day in day_advice (same order as the forecast)."
    ),
    "knowledge": (
        "Task: answer the construction knowledge question at the stated level (student, site_engineer, expert). "
        "Give a clear answer, key points, relevant Indian standards (only ones you are sure exist), related "
        "topics and a caution if the topic needs a qualified engineer."
    ),
}
