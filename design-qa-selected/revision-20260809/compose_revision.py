from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent
REFERENCE = Path(
    "/Users/jianvey/.codex/attachments/bb8f94fb-88ad-4117-9dc2-b80c2fdc6aeb/image-1.png"
)


def cover(image: Image.Image, size: tuple[int, int], centering=(0.5, 0.5)) -> Image.Image:
    return ImageOps.fit(
        image.convert("RGB"),
        size,
        method=Image.Resampling.LANCZOS,
        centering=centering,
    )


def stitch_story(
    width: int, sections: list[tuple[str, int, tuple[float, float]]]
) -> Image.Image:
    story = Image.new("RGB", (width, sum(height for _, height, _ in sections)), "#020b0e")
    top = 0
    for filename, height, centering in sections:
        with Image.open(ROOT / filename) as source:
            frame = cover(source, (width, height), centering)
        story.paste(frame, (0, top))
        top += height
    return story


desktop_story = stitch_story(
    864,
    [
        ("desktop-hero.png", 506, (0.5, 0.5)),
        ("desktop-voice.png", 335, (0.5, 0.5)),
        ("desktop-memory.png", 379, (0.5, 0.5)),
        ("desktop-characters.png", 385, (0.5, 0.5)),
        ("desktop-download.png", 216, (0.5, 0.72)),
    ],
)
desktop_story.save(ROOT / "desktop-story.png", quality=94)

with Image.open(REFERENCE) as reference:
    reference = reference.convert("RGB")
    label_height = 52
    gap = 20
    canvas = Image.new(
        "RGB",
        (reference.width * 2 + gap, reference.height + label_height),
        "#071014",
    )
    canvas.paste(reference, (0, label_height))
    canvas.paste(desktop_story, (reference.width + gap, label_height))
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default(size=18)
    draw.text((20, 16), "REFERENCE", fill="#a9d9d1", font=font)
    draw.text((reference.width + gap + 20, 16), "IMPLEMENTATION", fill="#a9d9d1", font=font)
    canvas.save(ROOT / "desktop-comparison.png", quality=94)

mobile_board = Image.new("RGB", (820, 1740), "#071014")
mobile_board_draw = ImageDraw.Draw(mobile_board)
mobile_board_font = ImageFont.load_default(size=18)
mobile_board_draw.text((20, 16), "MOBILE 390 x 844", fill="#a9d9d1", font=mobile_board_font)
for index, filename in enumerate(
    ["mobile-hero.png", "mobile-voice.png", "mobile-memory.png", "mobile-characters.png"]
):
    with Image.open(ROOT / filename) as source:
        x = 20 + (index % 2) * 400
        y = 52 + (index // 2) * 844
        mobile_board.paste(source.convert("RGB"), (x, y))
mobile_board.save(ROOT / "mobile-board.png", quality=94)
