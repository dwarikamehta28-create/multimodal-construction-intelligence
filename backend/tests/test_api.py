import pytest

PLAN = {"project_type": "residential", "built_up_area_sqft": 2400, "floors": 2, "quality": "standard", "city": "Indore", "bedrooms": 3, "bathrooms": 2}
VAL = {"city": "Indore", "property_type": "apartment", "area_sqft": 1200, "bedrooms": 2, "age_years": 5, "condition": "good", "amenities": ["lift", "parking"]}


def files(img_bytes, name="site.jpg", n=1):
    return [("images", (name, img_bytes, "image/jpeg")) for _ in range(n)]


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200 and r.json()["mode"] == "demo"


# ---------- safety ----------
def test_safety_with_image(client, img):
    r = client.post("/api/safety", files=files(img()), data={"notes": "upper floor slab"})
    body = r.json()
    assert r.status_code == 200 and body["ok"] and body["mode"] == "demo"
    d = body["data"]
    assert 0 <= d["safety_score"] <= 100 and d["hazards"] and d["ppe_findings"]


def test_safety_text_only(client):
    r = client.post("/api/safety", data={"notes": "workers on scaffold without harness"})
    assert r.status_code == 200 and r.json()["data"]["workers_detected"] == 0


def test_safety_requires_input(client):
    r = client.post("/api/safety", data={"notes": ""})
    assert r.status_code == 422 and r.json()["error"]["code"] == "missing_input"


def test_safety_corrupt_file(client):
    r = client.post("/api/safety", files=files(b"not an image"))
    assert r.status_code == 422 and r.json()["error"]["code"] == "invalid_image"


def test_safety_truncated_image(client, img):
    raw = img((600, 600))
    r = client.post("/api/safety", files=files(raw[: len(raw) // 2]))
    assert r.status_code == 422 and r.json()["error"]["code"] == "invalid_image"


def test_unsupported_format(client, img):
    r = client.post("/api/safety", files=files(img(fmt="BMP"), "x.bmp"))
    assert r.status_code == 415


def test_oversized_upload(client, monkeypatch):
    monkeypatch.setenv("MAX_IMAGE_MB", "1")
    r = client.post("/api/safety", files=files(b"\0" * (1024 * 1024 + 10)))
    assert r.status_code == 413


def test_too_many_images(client, img):
    r = client.post("/api/safety", files=files(img(), n=4))
    assert r.status_code == 422 and r.json()["error"]["code"] == "too_many_images"


def test_low_res_and_flat_image_warnings(client, img):
    r = client.post("/api/safety", files=files(img((100, 100), noise=False)))
    w = " ".join(r.json()["warnings"])
    assert r.status_code == 200 and "low resolution" in w and "little detail" in w


def test_empty_file_field_returns_clean_error(client):
    r = client.post("/api/safety", files=[("images", ("", b"", "application/octet-stream"))], data={"notes": "open trench"})
    assert r.status_code == 422 and r.json()["ok"] is False  # the web UI omits the field when no file is chosen


# ---------- crack ----------
def test_crack_keywords(client, img):
    r = client.post("/api/crack", files=files(img()), data={"notes": "hairline crack on plaster"})
    d = r.json()["data"]
    assert r.status_code == 200 and d["crack_type"] == "hairline" and d["severity"] == "low"


def test_crack_requires_input(client):
    assert client.post("/api/crack", data={}).status_code == 422


# ---------- planning ----------
def test_planning(client):
    r = client.post("/api/planning", json=PLAN)
    d = r.json()["data"]
    assert r.status_code == 200
    c = d["cost"]
    assert sum(i["amount_inr"] for i in c["items"]) == pytest.approx(c["base_cost_inr"], abs=10)
    assert c["total_inr"] == c["base_cost_inr"] + c["contingency_inr"]
    assert d["total_weeks"] == max(t["start_week"] + t["duration_weeks"] for t in d["schedule"])
    plan = d["floor_plan"]
    assert sum(rm["area_sqft"] for rm in plan["rooms"]) == pytest.approx(plan["floor_area_sqft"], abs=len(plan["rooms"]))
    assert all(rm["x"] + rm["w"] <= plan["plot_width_ft"] + 0.5 for rm in plan["rooms"])


@pytest.mark.parametrize("patch", [{"built_up_area_sqft": -5}, {"built_up_area_sqft": 50}, {"floors": 0}, {"floors": 99}, {"quality": "gold"}, {"bedrooms": -1}])
def test_planning_rejects_bad_input(client, patch):
    r = client.post("/api/planning", json={**PLAN, **patch})
    assert r.status_code == 422 and r.json()["ok"] is False


def test_planning_floor_too_small(client):
    r = client.post("/api/planning", json={**PLAN, "built_up_area_sqft": 300, "floors": 10})
    assert r.status_code == 422


@pytest.mark.parametrize("ptype", ["commercial", "industrial"])
def test_planning_other_types(client, ptype):
    assert client.post("/api/planning", json={**PLAN, "project_type": ptype}).status_code == 200


# ---------- valuation ----------
def test_valuation(client):
    d = client.post("/api/valuation", json=VAL).json()["data"]
    assert d["low_inr"] < d["estimated_value_inr"] < d["high_inr"] and d["disclaimer"]


def test_valuation_unknown_city_and_plot(client):
    r = client.post("/api/valuation", json={**VAL, "city": "Smalltown", "property_type": "plot"})
    assert r.status_code == 200


def test_valuation_invalid(client):
    assert client.post("/api/valuation", json={**VAL, "area_sqft": 0}).status_code == 422
    assert client.post("/api/valuation", json={**VAL, "property_type": "castle"}).status_code == 422


# ---------- assistant / knowledge ----------
def test_assistant(client):
    r = client.post("/api/assistant", data={"message": "Pour tomorrow, what to check?", "stage": "structure"})
    assert r.status_code == 200 and r.json()["data"]["checklist"]


def test_assistant_bad_stage(client):
    assert client.post("/api/assistant", data={"message": "hi", "stage": "roof"}).status_code == 422


def test_knowledge(client):
    d = client.post("/api/knowledge", json={"question": "How long should I cure concrete?"}).json()["data"]
    assert "IS 456:2000" in d["standards"]


def test_knowledge_empty(client):
    assert client.post("/api/knowledge", json={"question": " "}).status_code == 422


# ---------- weather ----------
def test_weather(client, monkeypatch):
    from app.services import weather_client

    async def fake(city):
        days = [{"date": f"2026-10-2{i}", "condition": "Rain" if i == 1 else "Clear", "temp_max_c": 32, "temp_min_c": 22,
                 "rain_mm": 14 if i == 1 else 0, "wind_kmh": 10, "suitability": "avoid" if i == 1 else "good", "advice": ""} for i in range(5)]
        return "Indore, India", days

    monkeypatch.setattr(weather_client, "fetch_forecast", fake)
    d = client.post("/api/weather", json={"city": "Indore"}).json()["data"]
    assert len(d["days"]) == 5 and d["days"][1]["suitability"] == "avoid" and all(x["advice"] for x in d["days"])


def test_weather_service_down(client, monkeypatch):
    from app.errors import AppError
    from app.services import weather_client

    async def boom(city):
        raise AppError(503, "weather_unavailable", "down")

    monkeypatch.setattr(weather_client, "fetch_forecast", boom)
    r = client.post("/api/weather", json={"city": "Indore"})
    assert r.status_code == 503 and r.json()["error"]["code"] == "weather_unavailable"
