"""Baseline property valuation. The LLM only supplies a bounded adjustment (+/-15%)."""
CITY_RATE = {  # indicative INR per sq ft for a standard apartment
    "mumbai": 22000, "delhi": 12000, "bengaluru": 9000, "bangalore": 9000, "pune": 7500, "hyderabad": 7000,
    "chennai": 7500, "kolkata": 6500, "ahmedabad": 5000, "jaipur": 4500, "indore": 4200, "bhopal": 3800,
    "lucknow": 4500,
}
DEFAULT_RATE = 4000
TYPE_FACTOR = {"apartment": 1.0, "independent_house": 1.1, "villa": 1.35, "plot": 0.6, "commercial": 1.5}
CONDITION_FACTOR = {"poor": 0.85, "fair": 0.95, "good": 1.0, "excellent": 1.08}


def baseline(city, property_type, area, age_years, condition, amenities):
    rate = CITY_RATE.get(city.strip().lower(), DEFAULT_RATE) * TYPE_FACTOR[property_type]
    if property_type != "plot":
        rate *= 1 - min(age_years * 0.01, 0.30)
        rate *= CONDITION_FACTOR[condition]
        rate *= 1 + min(len(amenities) * 0.01, 0.08)
    return round(rate), round(rate * area)


def price_range(value, confidence):
    spread = 0.10 if confidence >= 0.5 else 0.15
    return round(value * (1 - spread)), round(value * (1 + spread))
