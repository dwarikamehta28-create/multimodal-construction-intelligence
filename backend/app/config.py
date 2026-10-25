import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    llm_provider: str
    anthropic_api_key: str
    gemini_api_key: str
    model: str
    max_image_mb: int
    cors_origins: list


def get_settings() -> Settings:
    """Read settings from the environment on every call (keeps tests simple)."""
    key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    gkey = (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip()
    default = "anthropic" if key else ("gemini" if gkey else "mock")
    provider = (os.getenv("LLM_PROVIDER") or default).strip().lower()
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash") if provider == "gemini" else os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5-5")
    return Settings(
        llm_provider=provider,
        anthropic_api_key=key,
        gemini_api_key=gkey,
        model=model,
        max_image_mb=int(os.getenv("MAX_IMAGE_MB", "5")),
        cors_origins=[o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()],
    )
