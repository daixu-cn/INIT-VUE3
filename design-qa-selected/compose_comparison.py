from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent
DESKTOP_REFERENCE = Path(
    "/Users/jianvey/.codex/generated_images/019fe465-a565-7800-b2b4-19ae3b58e075/exec-3dd16560-194a-479c-b7ee-a1d36794a5ee.png"
)
MOBILE_REFERENCE = Path(
    "/Users/jianvey/.codex/generated_images/019fe465-a565-7800-b2b4-19ae3b58e075/exec-f245b3fc-6bca-4837-810c-5f3f9cecf2ec.png"
)


def cover(image: Image.Image, size: tuple[int, int], centering=(0.5, 0.5)) -> Image.Image:
    return ImageOps.fit(image.convert("RGB"), size, method=Image.Resampling.LANCZOS, centering=centering)


def stitch_story(width: int, sections: list[tuple[str, int, tuple[float, float]]]) -> Image.Image:
    story = Image.new("RGB", (width, sum(height for _, height, _ in sections)), "#020b0e")
    top = 0
    for filename, height, centering in sections:
        with Image.open(ROOT / filename) as source:
            frame = cover(source, (width, height), centering)
        story.paste(frame, (0, top))
        top += height
    return story


def comparison(reference: Image.Image, implementation: Image.Image, output: str) -> None:
    width, height = reference.size
    implementation = cover(implementation, (width, height))
    label_height = 52
    gap = 20
    canvas = Image.new("RGB", (width * 2 + gap, height + label_height), "#071014")
    canvas.paste(reference.convert("RGB"), (0, label_height))
    canvas.paste(implementation, (width + gap, label_height))
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default(size=18)
    draw.text((20, 16), "REFERENCE", fill="#a9d9d1", font=font)
    draw.text((width + gap + 20, 16), "IMPLEMENTATION", fill="#a9d9d1", font=font)
    canvas.save(ROOT / output, quality=94)


desktop_story = stitch_story(
    864,
    [
        ("desktop-hero.png", 506, (0.5, 0.5)),
        ("desktop-voice.png", 335, (0.5, 0.52)),
        ("desktop-memory.png", 379, (0.5, 0.5)),
        ("desktop-characters.png", 385, (0.5, 0.5)),
        ("desktop-download.png", 216, (0.5, 0.72)),
    ],
)
desktop_story.save(ROOT / "desktop-story.png", quality=94)

with Image.open(DESKTOP_REFERENCE) as desktop_reference:
    comparison(desktop_reference.convert("RGB"), desktop_story, "desktop-comparison.png")

mobile_story = stitch_story(
    837,
    [
        ("mobile-hero.png", 580, (0.5, 0.43)),
        ("mobile-voice.png", 288, (0.5, 0.45)),
        ("mobile-memory.png", 344, (0.5, 0.46)),
        ("mobile-characters.png", 396, (0.5, 0.48)),
        ("mobile-download.png", 272, (0.5, 0.52)),
    ],
)
mobile_story.save(ROOT / "mobile-story.png", quality=94)

with Image.open(MOBILE_REFERENCE) as mobile_reference:
    comparison(mobile_reference.convert("RGB"), mobile_story, "mobile-comparison.png")
