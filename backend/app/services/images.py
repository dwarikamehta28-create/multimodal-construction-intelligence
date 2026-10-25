import base64
import io
from dataclasses import dataclass, field

from PIL import Image, ImageFilter, ImageStat

from ..config import get_settings
from ..errors import AppError

Image.MAX_IMAGE_PIXELS = 40_000_000
ALLOWED_FORMATS = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp"}
MAX_SIDE = 1568
MAX_IMAGES = 3


@dataclass
class ProcessedImage:
    name: str
    b64: str
    media_type: str
    width: int
    height: int
    warnings: list = field(default_factory=list)


def _process(raw: bytes, name: str) -> ProcessedImage:
    try:
        with Image.open(io.BytesIO(raw)) as im:
            fmt = im.format
            if fmt not in ALLOWED_FORMATS:
                raise AppError(415, "unsupported_image", f"'{name}' must be a JPEG, PNG or WebP image.")
            im.load()  # raises on truncated / incomplete files
            img = im.convert("RGB")
    except AppError:
        raise
    except Exception:
        raise AppError(422, "invalid_image", f"'{name}' could not be read. The file may be corrupted or incomplete.")

    w, h = img.size
    warnings = []
    if min(w, h) < 200:
        warnings.append(f"'{name}' is low resolution ({w}x{h}). Results may be unreliable.")
    gray = img.convert("L")
    if ImageStat.Stat(gray).mean[0] < 35:
        warnings.append(f"'{name}' is very dark. Hazards or cracks may be missed.")
    edges = gray.filter(ImageFilter.FIND_EDGES).crop((1, 1, max(w - 1, 2), max(h - 1, 2)))  # PIL leaves border pixels unfiltered
    if ImageStat.Stat(edges).var[0] < 15:
        warnings.append(f"'{name}' has very little detail (blurry or blank). Results may be unreliable.")

    img.thumbnail((MAX_SIDE, MAX_SIDE))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return ProcessedImage(name, base64.b64encode(buf.getvalue()).decode(), "image/jpeg", w, h, warnings)


async def process_uploads(files) -> list:
    if len(files) > MAX_IMAGES:
        raise AppError(422, "too_many_images", f"Upload at most {MAX_IMAGES} images per request.")
    limit = get_settings().max_image_mb * 1024 * 1024
    out = []
    for f in files:
        raw = await f.read(limit + 1)
        if not raw:
            raise AppError(422, "empty_file", f"'{f.filename}' is empty.")
        if len(raw) > limit:
            raise AppError(413, "file_too_large", f"'{f.filename}' is larger than {get_settings().max_image_mb} MB.")
        out.append(_process(raw, f.filename or "image"))
    return out
