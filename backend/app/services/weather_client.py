import httpx

from ..errors import AppError

GEO = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST = "https://api.open-meteo.com/v1/forecast"
CODES = {0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Fog", 51: "Light drizzle",
         53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 80: "Showers",
         81: "Heavy showers", 82: "Violent showers", 95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with hail"}


def suitability(rain, wind, tmax):
    if rain >= 10 or wind >= 40 or tmax >= 43:
        return "avoid"
    if rain >= 2 or wind >= 28 or tmax >= 38:
        return "caution"
    return "good"


async def fetch_forecast(city: str):
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            g = (await c.get(GEO, params={"name": city, "count": 1})).json()
            if not g.get("results"):
                raise AppError(404, "city_not_found", f"Could not find a place named '{city}'.")
            place = g["results"][0]
            f = (await c.get(FORECAST, params={
                "latitude": place["latitude"], "longitude": place["longitude"], "timezone": "auto", "forecast_days": 5,
                "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
            })).json()
    except AppError:
        raise
    except Exception:
        raise AppError(503, "weather_unavailable", "The weather service is not reachable right now.")
    d = f["daily"]
    days = [{
        "date": d["time"][i], "condition": CODES.get(d["weather_code"][i], "Mixed"),
        "temp_max_c": d["temperature_2m_max"][i], "temp_min_c": d["temperature_2m_min"][i],
        "rain_mm": d["precipitation_sum"][i] or 0.0, "wind_kmh": d["wind_speed_10m_max"][i] or 0.0,
        "suitability": suitability(d["precipitation_sum"][i] or 0, d["wind_speed_10m_max"][i] or 0, d["temperature_2m_max"][i]),
        "advice": "",
    } for i in range(len(d["time"]))]
    name = ", ".join(x for x in (place.get("name"), place.get("admin1"), place.get("country")) if x)
    return name, days


def rule_based_narrative(days, activity="general site work"):
    avoid = [x["date"] for x in days if x["suitability"] == "avoid"]
    caution = [x["date"] for x in days if x["suitability"] == "caution"]
    if avoid:
        summary = f"Poor conditions on {', '.join(avoid)}. Plan {activity} around them."
    elif caution:
        summary = f"Mostly workable, with caution on {', '.join(caution)}."
    else:
        summary = f"Good conditions for {activity} across the next {len(days)} days."
    recs = ["Schedule concreting and plastering on 'good' days only."]
    if avoid:
        recs.append("Avoid crane lifts, scaffolding work and work at height on 'avoid' days.")
    if any(x["temp_max_c"] >= 38 for x in days):
        recs.append("In high heat, shift heavy work to early morning and provide drinking water and shade.")
    mats = ["Cover cement bags and keep them off the ground.", "Protect fresh concrete from rain; cure for at least 7 days."]
    adv = []
    for x in days:
        adv.append({"good": "Normal working conditions.", "caution": "Work with care; protect materials.",
                    "avoid": "Postpone exposed or elevated work."}[x["suitability"]])
    return {"summary": summary, "work_recommendations": recs, "material_precautions": mats, "day_advice": adv}
