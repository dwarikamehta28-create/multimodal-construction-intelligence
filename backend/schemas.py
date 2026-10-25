
from typing import Literal

from pydantic import BaseModel, Field


class Hazard(BaseModel):
    hazard_type: str = Field(description="Type of potential construction hazard")
    severity: Literal["low", "medium", "high", "unknown"] = "unknown"
    description: str
    recommended_action: str


class CrackAnalysis(BaseModel):
    crack_type: str = Field(description="Observed or suspected crack type")
    severity: Literal["low", "medium", "high", "unknown"] = "unknown"
    possible_causes: list[str] = Field(default_factory=list)
    recommended_action: str


class ConstructionAnalysisResponse(BaseModel):
    analysis_type: Literal["safety", "crack", "general"] = "general"
    summary: str
    hazards: list[Hazard] = Field(default_factory=list)
    cracks: list[CrackAnalysis] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)
    model_used: str = "not_integrated"
