
import os
import logging

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types

from backend.schemas import ConstructionAnalysisResponse

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Construction Intelligence Platform",
    description="AI-powered multimodal construction analysis API",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY) if API_KEY else None
MODEL_NAME = "gemini-3.8-flash"


@app.get("/")
def home():
    return {
        "message": "Construction Intelligence Platform API is running!",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/analyze/image", response_model=ConstructionAnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="Gemini API key is missing. Add GEMINI_API_KEY to the root .env file.",
        )

    allowed_types = {"image/jpeg", "image/png", "image/webp"}

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Upload a JPG, PNG, or WebP image.",
        )

    image_data = await file.read()

    if not image_data:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    if len(image_data) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image size must not exceed 10 MB.",
        )

    prompt = """
    Analyze this uploaded image for construction-related information.

    Return a JSON response matching the provided schema.
    - Choose analysis_type as safety, crack, or general.
    - Describe only visible evidence. Do not claim a crack or hazard exists
      when the image does not clearly support that conclusion.
    - Populate hazards and cracks only when relevant visible evidence exists.
    - Include practical recommendations and clear limitations.
    - If this is not a construction-related image, state that in the summary.
    - Never claim this is a certified structural inspection or safety approval.
    - Set model_used to the model name provided by the application.
    """

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=image_data,
                    mime_type=file.content_type,
                ),
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ConstructionAnalysisResponse,
                temperature=0.2,
            ),
        )

        if not response.text:
            raise ValueError("The model returned an empty response.")

        result = ConstructionAnalysisResponse.model_validate_json(response.text)
        result.model_used = MODEL_NAME
        return result

    except Exception as exc:
        logger.exception("Gemini image analysis failed")
        raise HTTPException(
            status_code=502,
            detail=f"Image analysis failed: {str(exc)[:300]}",
        ) from exc
