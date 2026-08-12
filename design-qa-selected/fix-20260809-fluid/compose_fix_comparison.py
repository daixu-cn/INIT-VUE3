from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent
BEFORE_LINES = Path(
    "/Users/jianvey/Library/Application Support/CleanShot/media/media_lotE7xcLVJ/CleanShot 2026-08-09 at 15.50.51@2x.png"
)
BEFORE_DOWNLOAD = Path(
    "/Users/jianvey/Library/Application Support/CleanShot/media/media_2OZRgjAcMH/CleanShot 2026-08-09 at 15.50.59@2x.png"
)


def fit(path: Path, size: tuple[int, int], centering=(0.5, 0.5)) -> Image.Image:
    with Image.open(path) as image:
        return ImageOps.fit(
            image.convert("RGB"),
            size,
            method=Image.Resampling.LANCZOS,
            centering=centering,
        )


canvas = Image.new("RGB", (1940, 820), "#071014")
draw = ImageDraw.Draw(canvas)
font = ImageFont.load_default(size=18)

draw.text((20, 16), "BEFORE: FLUID LINES", fill="#a9d9d1", font=font)
draw.text((1000, 16), "AFTER: FLUID LINES", fill="#a9d9d1", font=font)
canvas.paste(fit(BEFORE_LINES, (940, 340)), (20, 52))

with Image.open(ROOT / "after-memory.png") as memory:
    memory = memory.convert("RGB")
    memory_crop = memory.crop((0, int(memory.height * 0.72), memory.width, memory.height))
    canvas.paste(ImageOps.fit(memory_crop, (940, 165)), (1000, 52))

with Image.open(ROOT / "after-characters.png") as characters:
    characters = characters.convert("RGB")
    character_crop = characters.crop((0, 0, characters.width, int(characters.height * 0.3)))
    canvas.paste(ImageOps.fit(character_crop, (940, 165)), (1000, 227))

draw.text((20, 420), "BEFORE: DOWNLOAD ALIGNMENT", fill="#a9d9d1", font=font)
draw.text((1000, 420), "AFTER: DOWNLOAD ALIGNMENT", fill="#a9d9d1", font=font)
canvas.paste(fit(BEFORE_DOWNLOAD, (940, 340)), (20, 456))
canvas.paste(fit(ROOT / "after-download.png", (940, 340), (0.5, 0.62)), (1000, 456))

canvas.save(ROOT / "comparison.png", quality=94)
