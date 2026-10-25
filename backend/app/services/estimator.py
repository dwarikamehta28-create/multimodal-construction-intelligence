"""Deterministic estimators. Quantities, costs and the floor layout are computed
here (not by the LLM) so numbers are reproducible. Rates are indicative thumb
rules for India; they must be calibrated with local quotes."""
import math

QUALITY_RATE = {"economy": 1500, "standard": 1900, "premium": 2600, "luxury": 3600}  # INR / sq ft
TYPE_FACTOR = {"residential": 1.0, "commercial": 1.15, "industrial": 0.9}
CITY_FACTOR = {
    "mumbai": 1.25, "delhi": 1.15, "bengaluru": 1.15, "bangalore": 1.15, "pune": 1.1, "hyderabad": 1.08,
    "chennai": 1.08, "kolkata": 1.05, "ahmedabad": 1.0, "indore": 0.95, "jaipur": 0.95, "bhopal": 0.93,
    "lucknow": 0.93,
}
MATERIAL_QUALITY = {"economy": 0.95, "standard": 1.0, "premium": 1.08, "luxury": 1.15}
# (name, quantity per sq ft of total built-up area, unit)
MATERIAL_RATES = [
    ("Cement", 0.40, "bags (50 kg)"),
    ("TMT steel", 4.0, "kg"),
    ("Sand", 1.8, "cu ft"),
    ("Coarse aggregate", 1.35, "cu ft"),
    ("Bricks / blocks", 8.0, "nos"),
    ("Flooring tiles", 1.1, "sq ft"),
    ("Paint", 0.12, "litres"),
]
WASTAGE = 1.05
COST_SPLIT = [
    ("Foundation and structure", 38), ("Masonry and plaster", 14), ("Flooring and finishes", 17),
    ("Electrical and plumbing", 14), ("Doors, windows and woodwork", 9), ("Fees and approvals", 3),
    ("Site works and sundries", 5),
]
CONTINGENCY = 0.05


def estimate_materials(total_area, quality):
    f = MATERIAL_QUALITY[quality] * WASTAGE
    return [{"name": n, "quantity": round(total_area * q * f), "unit": u} for n, q, u in MATERIAL_RATES]


def estimate_cost(total_area, project_type, quality, city, floors):
    rate = QUALITY_RATE[quality] * TYPE_FACTOR[project_type] * CITY_FACTOR.get(city.strip().lower(), 1.0)
    if floors > 3:
        rate *= 1.05  # lifts, extra shuttering, vertical transport
    base = total_area * rate
    items = [{"category": c, "amount_inr": round(base * p / 100), "share_pct": float(p)} for c, p in COST_SPLIT]
    cont = round(base * CONTINGENCY)
    total = round(base) + cont
    return {
        "items": items, "base_cost_inr": round(base), "contingency_inr": cont,
        "total_inr": total, "per_sqft_inr": round(total / total_area),
    }


def build_floor_plan(project_type, floor_area, bedrooms, bathrooms):
    if project_type == "residential":
        rooms = [("Living room", 0.17), ("Kitchen", 0.09), ("Dining", 0.08)]
        rooms += [("Master bedroom" if i == 0 else f"Bedroom {i + 1}", 0.17 if i == 0 else 0.14) for i in range(bedrooms)]
        rooms += [(f"Bathroom {i + 1}", 0.04) for i in range(bathrooms)]
        rooms.append(("Passage and utility", 0.08))
    elif project_type == "commercial":
        rooms = [("Reception", 0.12), ("Open workspace", 0.40), ("Cabin A", 0.09), ("Cabin B", 0.09),
                 ("Meeting room", 0.10), ("Pantry", 0.06), ("Washrooms", 0.07), ("Storage", 0.07)]
    else:
        rooms = [("Production hall", 0.62), ("Store", 0.14), ("Office", 0.10), ("Washrooms", 0.04), ("Loading bay", 0.10)]

    total_w = sum(w for _, w in rooms)
    areas = [(n, floor_area * w / total_w) for n, w in rooms]
    width = round(math.sqrt(floor_area * 1.3), 1)
    depth = round(floor_area / width, 1)

    row1, row2, acc = [], [], 0.0
    for n, a in areas:
        (row1 if acc < floor_area / 2 else row2).append((n, a))
        acc += a
    placed, y = [], 0.0
    for row in (row1, row2):
        if not row:
            continue
        h = sum(a for _, a in row) / width
        x = 0.0
        for n, a in row:
            w = a / h
            placed.append({"name": n, "x": round(x, 1), "y": round(y, 1), "w": round(w, 1), "d": round(h, 1), "area_sqft": round(a)})
            x += w
        y += h
    return {"plot_width_ft": width, "plot_depth_ft": depth, "floor_area_sqft": round(floor_area), "rooms": placed}


def template_schedule(total_area, floors):
    """Fallback schedule used in demo mode or if the AI schedule is unusable."""
    scale = max(0.8, min(3.0, total_area / 1800))
    w = lambda base: max(1, round(base * scale))
    tasks, t = [], 0

    def add(name, phase, dur, dep=None, overlap=0):
        nonlocal t
        start = 0 if dep is None else max(0, t - overlap)
        tasks.append({"id": len(tasks) + 1, "name": name, "phase": phase, "start_week": start, "duration_weeks": dur,
                      "depends_on": [] if dep is None else [dep]})
        t = start + dur
        return len(tasks)

    a = add("Site clearing, layout and approvals", "Preparation", w(2))
    b = add("Excavation and foundation", "Foundation", w(4), a)
    c = add("Plinth beam and backfilling", "Foundation", w(2), b)
    prev = c
    for f in range(floors):
        label = "Ground floor" if f == 0 else f"Floor {f}"
        prev = add(f"{label} columns, beams and slab", "Structure", w(4), prev)
    m = add("Brickwork and block masonry", "Envelope", w(4) + floors, prev, overlap=2)
    e = add("Electrical and plumbing rough-in", "Services", w(3), m, overlap=1)
    p = add("Plastering", "Finishes", w(4), e)
    d = add("Flooring and tiling", "Finishes", w(3), p, overlap=1)
    dw = add("Doors, windows and woodwork", "Finishes", w(3), p, overlap=0)
    pt = add("Painting and fixtures", "Finishes", w(3), d)
    add("Testing, snagging and handover", "Handover", 2, pt)
    return tasks
