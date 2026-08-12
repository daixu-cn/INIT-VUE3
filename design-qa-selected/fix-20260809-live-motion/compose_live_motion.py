from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent
SOURCE_LINES = Path(
    "/Users/jianvey/.codex/attachments/24932090-9941-4be2-9799-aa2822ec48c4/image-1.png"
)
SOURCE_DOWNLOAD = Path(
    "/Users/jianvey/.codex/attachments/24932090-9941-4be2-9799-aa2822ec48c4/image-2.png"
)


def crop_fit(path: Path, crop: tuple[int, int, int, int] | None, size: tuple[int, int]) -> Image.Image:
    with Image.open(path) as source:
        image = source.convert("RGB")
        if crop is not None:
            image = image.crop(crop)
        return ImageOps.fit(image, size, method=Image.Resampling.LANCZOS)


canvas = Image.new("RGB", (2240, 1620), "#071014")
draw = ImageDraw.Draw(canvas)
font = ImageFont.load_default(size=21)
small_font = ImageFont.load_default(size=16)

draw.text((30, 22), "SOURCE ISSUE / LIVE IMPLEMENTATION COMPARISON", fill="#a9d9d1", font=font)
draw.text((30, 58), "Source issue", fill="#72978f", font=small_font)
draw.text((660, 58), "Implementation t0", fill="#72978f", font=small_font)
draw.text((1440, 58), "Implementation t+520ms", fill="#72978f", font=small_font)

row_y = 90
row_height = 300
source_width = 600
frame_width = 750

with Image.open(SOURCE_LINES) as source_lines:
    source_size = source_lines.size

rows = [
    (
        "MEMORY LINE — autonomous waveform remains visible",
        SOURCE_LINES,
        (0, 0, source_size[0], int(source_size[1] * 0.62)),
        ROOT / "desktop-memoryscene-t0.jpg",
        ROOT / "desktop-memoryscene-t520.jpg",
        (0, 570, 1440, 842),
    ),
    (
        "CHARACTER LINE — motion continues above the gallery",
        SOURCE_LINES,
        (0, int(source_size[1] * 0.42), source_size[0], source_size[1]),
        ROOT / "desktop-charactersscene-t0.jpg",
        ROOT / "desktop-charactersscene-t520.jpg",
        (0, 55, 1440, 230),
    ),
    (
        "DOWNLOAD LINE + CTA — moving waveform and aligned buttons",
        SOURCE_DOWNLOAD,
        None,
        ROOT / "desktop-downloadscene-t0.jpg",
        ROOT / "desktop-downloadscene-t520.jpg",
        (0, 300, 1440, 790),
    ),
]

for label, source_path, source_crop, frame_a, frame_b, frame_crop in rows:
    draw.text((30, row_y), label, fill="#d9e5e1", font=small_font)
    image_y = row_y + 28
    canvas.paste(crop_fit(source_path, source_crop, (source_width, row_height)), (30, image_y))
    canvas.paste(crop_fit(frame_a, frame_crop, (frame_width, row_height)), (660, image_y))
    canvas.paste(crop_fit(frame_b, frame_crop, (frame_width, row_height)), (1440, image_y))
    row_y = image_y + row_height + 38

draw.text((30, row_y), "MOBILE 390 x 844 — the same three lines animate without overflow", fill="#d9e5e1", font=small_font)
row_y += 30
mobile_files = [
    "mobile-memoryscene-t0.png",
    "mobile-memoryscene-t520.png",
    "mobile-charactersscene-t0.png",
    "mobile-charactersscene-t520.png",
    "mobile-downloadscene-t0.png",
    "mobile-downloadscene-t520.png",
]
for index, filename in enumerate(mobile_files):
    x = 30 + index * 365
    canvas.paste(crop_fit(ROOT / filename, None, (330, 428)), (x, row_y))
    draw.text((x, row_y + 434), "t0" if index % 2 == 0 else "t+520ms", fill="#72978f", font=small_font)

canvas.save(ROOT / "live-motion-comparison.jpg", quality=94, subsampling=0)
