import io
import os

os.environ["LLM_PROVIDER"] = "mock"

import numpy as np  # noqa: E402
import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture
def client():
    return TestClient(app)


def make_image(size=(400, 400), fmt="JPEG", noise=True) -> bytes:
    rng = np.random.default_rng(1)
    arr = rng.integers(60, 255, (size[1], size[0], 3), dtype="uint8") if noise else np.full((size[1], size[0], 3), 120, "uint8")
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format=fmt)
    return buf.getvalue()


@pytest.fixture
def img():
    return make_image
