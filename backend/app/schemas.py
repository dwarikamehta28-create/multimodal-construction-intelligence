"""Strict JSON contracts. Every AI response is validated against these models,
so the frontend always receives the same shape. Enum-like fields are lenient:
an unexpected value from the model is coerced to a safe default instead of
breaking the UI."""
import re
from datetime import date
from typing import Annotated, Generic, Literal, Optional, TypeVar

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field


class Base(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)


def lenient(allowed, default):
    def _v(v):
        if isinstance(v, str):
            s = v.strip().lower().replace(" ", "_").replace("-", "_")
            if s in allowed:
                return s
        return default

    return BeforeValidator(_v)


def _conf(v):
    try:
        f = float(v)
    except (TypeError, ValueError):
        return 0.5
    if f > 1:
        f /= 100
    return min(max(f, 0.0), 1.0)


def _score(v):
    try:
        return int(min(max(float(v), 0), 100))
    except (TypeError, ValueError):
        return 50


def _count(v):
    try:
        return max(int(float(v)), 0)
    except (TypeError, ValueError):
        return 0


def _opt_float(v):
    if v is None or isinstance(v, (int, float)):
        return v
    m = re.search(r"\d+(\.\d+)?", str(v))
    return float(m.group()) if m else None


def _pct(v):
    try:
        return min(max(float(v), -15.0), 15.0)
    except (TypeError, ValueError):
        return 0.0


Conf = Annotated[float, BeforeValidator(_conf)]
Score = Annotated[int, BeforeValidator(_score)]
Count = Annotated[int, BeforeValidator(_count)]
OptFloat = Annotated[Optional[float], BeforeValidator(_opt_float)]
Sev = Annotated[Literal["low", "medium", "high", "critical"], lenient(("low", "medium", "high", "critical"), "medium")]

T = TypeVar("T")


class Envelope(Base, Generic[T]):
    ok: bool = True
    mode: Literal["live", "demo"]
    engine: str
    warnings: list[str] = Field(default_factory=list)
    data: T


class ImageQuality(Base):
    usable: bool = True
    notes: str = ""


# ---------------- Safety ----------------
class Hazard(Base):
    type: str
    description: str
    severity: Sev = "medium"
    location_hint: str = ""
    corrective_action: str = ""


class PPEFinding(Base):
    item: str
    status: Annotated[Literal["compliant", "missing", "unclear"], lenient(("compliant", "missing", "unclear"), "unclear")] = "unclear"
    note: str = ""


class SafetyResult(Base):
    summary: str
    overall_risk: Sev = "medium"
    safety_score: Score = 50
    workers_detected: Count = 0
    hazards: list[Hazard] = Field(default_factory=list)
    ppe_findings: list[PPEFinding] = Field(default_factory=list)
    immediate_actions: list[str] = Field(default_factory=list)
    image_quality: ImageQuality = Field(default_factory=ImageQuality)
    confidence: Conf = 0.5


# ---------------- Crack ----------------
CRACK_TYPES = ("hairline", "vertical", "horizontal", "diagonal", "stair_step", "map_pattern", "shrinkage", "settlement", "none", "unclear")
URGENCY = ("monitor", "repair_soon", "immediate", "consult_engineer")


class CrackResult(Base):
    summary: str
    crack_detected: bool = False
    crack_type: Annotated[Literal[CRACK_TYPES], lenient(CRACK_TYPES, "unclear")] = "unclear"
    severity: Annotated[Literal["none", "low", "medium", "high", "critical"], lenient(("none", "low", "medium", "high", "critical"), "medium")] = "medium"
    estimated_width_mm: OptFloat = None
    structural_concern: bool = False
    probable_causes: list[str] = Field(default_factory=list)
    recommended_actions: list[str] = Field(default_factory=list)
    urgency: Annotated[Literal[URGENCY], lenient(URGENCY, "consult_engineer")] = "consult_engineer"
    monitoring_advice: str = ""
    image_quality: ImageQuality = Field(default_factory=ImageQuality)
    confidence: Conf = 0.5


# ---------------- Planning ----------------
class PlanningRequest(Base):
    project_type: Literal["residential", "commercial", "industrial"] = "residential"
    built_up_area_sqft: float = Field(gt=100, le=1_000_000)
    floors: int = Field(1, ge=1, le=40)
    quality: Literal["economy", "standard", "premium", "luxury"] = "standard"
    city: str = Field("", max_length=80)
    bedrooms: int = Field(2, ge=0, le=12)
    bathrooms: int = Field(2, ge=0, le=12)
    start_date: Optional[date] = None
    notes: str = Field("", max_length=2000)


class Material(Base):
    name: str
    quantity: float
    unit: str


class CostItem(Base):
    category: str
    amount_inr: float
    share_pct: float


class CostBreakdown(Base):
    items: list[CostItem]
    base_cost_inr: float
    contingency_inr: float
    total_inr: float
    per_sqft_inr: float


class Task(Base):
    id: int
    name: str
    phase: str = ""
    start_week: int = Field(0, ge=0)
    duration_weeks: int = Field(1, ge=1)
    depends_on: list[int] = Field(default_factory=list)


class Room(Base):
    name: str
    x: float
    y: float
    w: float
    d: float
    area_sqft: float


class FloorPlan(Base):
    plot_width_ft: float
    plot_depth_ft: float
    floor_area_sqft: float
    rooms: list[Room]


class PlanningNarrative(Base):
    summary: str
    schedule: list[Task] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)


class PlanningResult(Base):
    summary: str
    materials: list[Material]
    cost: CostBreakdown
    schedule: list[Task]
    total_weeks: int
    floor_plan: FloorPlan
    risks: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)


# ---------------- Valuation ----------------
PROPERTY_TYPES = ("apartment", "independent_house", "villa", "plot", "commercial")


class ValuationRequest(Base):
    city: str = Field(min_length=2, max_length=80)
    locality: str = Field("", max_length=120)
    property_type: Literal[PROPERTY_TYPES] = "apartment"
    area_sqft: float = Field(gt=50, le=1_000_000)
    bedrooms: int = Field(2, ge=0, le=15)
    age_years: int = Field(0, ge=0, le=150)
    condition: Literal["poor", "fair", "good", "excellent"] = "good"
    amenities: list[str] = Field(default_factory=list, max_length=20)
    notes: str = Field("", max_length=1500)


class ValuationFactor(Base):
    name: str
    impact: Annotated[Literal["positive", "negative", "neutral"], lenient(("positive", "negative", "neutral"), "neutral")] = "neutral"
    note: str = ""


class ValuationNarrative(Base):
    adjustment_pct: Annotated[float, BeforeValidator(_pct)] = 0.0
    factors: list[ValuationFactor] = Field(default_factory=list)
    comparable_notes: str = ""
    confidence: Conf = 0.5


class ValuationResult(Base):
    estimated_value_inr: float
    low_inr: float
    high_inr: float
    price_per_sqft_inr: float
    baseline_rate_inr: float
    adjustment_pct: float
    factors: list[ValuationFactor] = Field(default_factory=list)
    comparable_notes: str = ""
    confidence: Conf = 0.5
    disclaimer: str


# ---------------- Assistant ----------------
class ActionItem(Base):
    task: str
    priority: Annotated[Literal["low", "medium", "high"], lenient(("low", "medium", "high"), "medium")] = "medium"


class AssistantResult(Base):
    answer: str
    action_items: list[ActionItem] = Field(default_factory=list)
    checklist: list[str] = Field(default_factory=list)
    flags: list[str] = Field(default_factory=list)
    follow_up_questions: list[str] = Field(default_factory=list)


# ---------------- Weather ----------------
SUITABILITY = ("good", "caution", "avoid")


class WeatherDay(Base):
    date: str
    condition: str
    temp_max_c: float
    temp_min_c: float
    rain_mm: float
    wind_kmh: float
    suitability: Annotated[Literal[SUITABILITY], lenient(SUITABILITY, "caution")] = "caution"
    advice: str = ""


class WeatherNarrative(Base):
    summary: str
    work_recommendations: list[str] = Field(default_factory=list)
    material_precautions: list[str] = Field(default_factory=list)
    day_advice: list[str] = Field(default_factory=list)


class WeatherRequest(Base):
    city: str = Field(min_length=2, max_length=80)
    activity: str = Field("general site work", max_length=200)


class WeatherResult(Base):
    location: str
    summary: str
    days: list[WeatherDay]
    work_recommendations: list[str] = Field(default_factory=list)
    material_precautions: list[str] = Field(default_factory=list)


# ---------------- Knowledge ----------------
class KnowledgeRequest(Base):
    question: str = Field(min_length=3, max_length=1000)
    level: Literal["student", "site_engineer", "expert"] = "site_engineer"


class KnowledgeResult(Base):
    answer: str
    key_points: list[str] = Field(default_factory=list)
    standards: list[str] = Field(default_factory=list)
    related_topics: list[str] = Field(default_factory=list)
    caution: str = ""
