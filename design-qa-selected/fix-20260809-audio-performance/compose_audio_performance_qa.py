from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent
SOURCE_DOWNLOAD = Path(
    "/Users/jianvey/Library/Application Support/CleanShot/media/media_APcRdGOG9B/CleanShot 2026-08-09 at 16.28.41@2x.png"
)
SOURCE_LINES = Path(
    "/Users/jianvey/Library/Application Support/CleanShot/media/media_kxlrox4UrQ/CleanShot 2026-08-09 at 16.28.55@2x.png"
)


def panel(path: Path, size: tuple[int, int]) -> Image.Image:
    with Image.open(path) as source:
        fitted = ImageOps.contain(source.convert("RGB"), size, method=Image.Resampling.LANCZOS)
    result = Image.new("RGB", size, "#020b0e")
    result.paste(fitted, ((size[0] - fitted.width) // 2, (size[1] - fitted.height) // 2))
    return result


canvas = Image.new("RGB", (2200, 1940), "#071014")
draw = ImageDraw.Draw(canvas)
font = ImageFont.load_default(size=21)
small = ImageFont.load_default(size=16)
mint = "#a9d9d1"
muted = "#72978f"

draw.text((30, 22), "ECHO FLUID AMPLITUDE + AUDIO PERFORMANCE QA", fill=mint, font=font)

draw.text((30, 62), "REPORTED: DOWNLOAD LINE READS AS FLAT", fill=muted, font=small)
draw.text((1130, 62), "IMPLEMENTATION: VISIBLE PEAKS, CTA ALIGNMENT PRESERVED", fill=muted, font=small)
canvas.paste(panel(SOURCE_DOWNLOAD, (1040, 300)), (30, 92))
canvas.paste(panel(ROOT / "desktop-final-download-t0.jpg", (1040, 300)), (1130, 92))

draw.text((30, 420), "REPORTED: MEMORY / CHARACTER LINES HAVE LITTLE AMPLITUDE", fill=muted, font=small)
draw.text((1130, 420), "IMPLEMENTATION: BOTH LINES SHOW CLEAR VERTICAL RHYTHM", fill=muted, font=small)
canvas.paste(panel(SOURCE_LINES, (1040, 300)), (30, 450))
canvas.paste(panel(ROOT / "desktop-final-memory-t0.jpg", (1040, 300)), (1130, 450))

draw.text((30, 778), "AUDIO SECTION BEFORE — 2255 x 705 CANVAS, 6.36 MB", fill=muted, font=small)
draw.text((1130, 778), "AUDIO SECTION AFTER — 1670 x 522 CANVAS, 3.49 MB", fill=muted, font=small)
canvas.paste(panel(ROOT / "audio-before.jpg", (1040, 600)), (30, 808))
canvas.paste(panel(ROOT / "audio-after.jpg", (1040, 600)), (1130, 808))

draw.text((30, 1438), "MOBILE 390 x 844 — AUDIO / MEMORY / CHARACTERS / DOWNLOAD", fill=mint, font=small)
mobile_files = [
    "mobile-audio-after.jpg",
    "mobile-memorythread-t0.jpg",
    "mobile-charactersthread-t0.jpg",
    "mobile-downloadthread-t0.jpg",
]
mobile_labels = ["AUDIO", "MEMORY", "CHARACTERS", "DOWNLOAD"]
for index, (filename, label) in enumerate(zip(mobile_files, mobile_labels)):
    x = 30 + index * 540
    draw.text((x, 1468), label, fill=muted, font=small)
    canvas.paste(panel(ROOT / filename, (500, 430)), (x, 1496))

canvas.save(ROOT / "comparison.jpg", quality=94, subsampling=0)
