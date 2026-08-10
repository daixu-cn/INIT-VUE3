<template>
  <canvas ref="canvas" class="voice-wave" width="1" height="1" aria-hidden="true" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue"

const props = withDefaults(
  defineProps<{
    active?: boolean
    color?: string
    density?: number
    energy?: number
    suspended?: boolean
    variant?: "bars" | "line" | "hybrid"
  }>(),
  {
    active: true,
    color: "#63a99a",
    density: 84,
    energy: 1,
    suspended: false,
    variant: "bars",
  },
)

const canvas = ref<HTMLCanvasElement>()
let animationFrame = 0
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
let reducedMotionQuery: MediaQueryList | undefined
let context: CanvasRenderingContext2D | null = null
let isVisible = false
let canvasWidth = 0
let canvasHeight = 0
let pixelRatio = 1
let lastFrameTime = 0
let startTime = performance.now()

function gaussian(value: number, center: number, width: number) {
  const distance = value - center
  return Math.exp(-(distance * distance) / (2 * width * width))
}

function noise(seed: number) {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1
}

function syncCanvasSize() {
  const target = canvas.value
  if (!target) return false

  context ??= target.getContext("2d", { alpha: true })
  if (!context) return false

  canvasWidth = Math.round(target.clientWidth)
  canvasHeight = Math.round(target.clientHeight)
  if (canvasWidth <= 0 || canvasHeight <= 0) return false

  const requestedPixelRatio = Math.min(
    window.devicePixelRatio || 1,
    props.variant === "hybrid" ? 1 : 1.35,
  )
  pixelRatio = Math.max(0.4, Math.min(requestedPixelRatio, 2048 / canvasWidth, 720 / canvasHeight))
  const pixelWidth = Math.max(1, Math.round(canvasWidth * pixelRatio))
  const pixelHeight = Math.max(1, Math.round(canvasHeight * pixelRatio))

  if (target.width !== pixelWidth || target.height !== pixelHeight) {
    target.width = pixelWidth
    target.height = pixelHeight
  }

  return true
}

function scheduleFrame() {
  if (props.active && !props.suspended && isVisible && !reducedMotionQuery?.matches) {
    animationFrame = requestAnimationFrame(draw)
  }
}

function draw(time = performance.now()) {
  if (!isVisible || !context || canvasWidth <= 0 || canvasHeight <= 0) return

  const isHeavyVoiceField = props.variant === "hybrid"
  const frameInterval = 1000 / (isHeavyVoiceField ? 30 : 36)
  if (props.active && time - lastFrameTime < frameInterval) {
    scheduleFrame()
    return
  }
  lastFrameTime = time

  const width = canvasWidth
  const height = canvasHeight

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.clearRect(0, 0, width, height)
  context.strokeStyle = props.color
  context.lineCap = "round"

  const elapsed = (time - startTime) / 1000
  const count = Math.max(20, props.density)
  const gap = width / count
  const center = height / 2

  if (props.variant !== "bars") {
    const glow = context.createLinearGradient(0, 0, width, 0)
    glow.addColorStop(0, "transparent")
    glow.addColorStop(0.18, props.color)
    glow.addColorStop(0.82, props.color)
    glow.addColorStop(1, "transparent")
    context.globalAlpha = 0.16
    context.fillStyle = glow
    context.shadowColor = props.color
    context.shadowBlur = 14
    context.fillRect(0, center - 0.6, width, 1.2)

    context.shadowColor = props.color
    context.shadowBlur = Math.min(isHeavyVoiceField ? 8 : 18, height * 0.12)
    context.globalCompositeOperation = "lighter"

    const layerCount = isHeavyVoiceField ? 2 : 3
    for (let layer = 0; layer < layerCount; layer += 1) {
      const layerOffset = layer * 0.72
      const layerScale = 1 - layer * 0.2
      context.globalAlpha = 0.62 - layer * 0.16
      context.lineWidth = Math.max(0.7, 1.6 - layer * 0.3)
      context.beginPath()

      for (let index = 0; index <= count * 2; index += 1) {
        const progress = index / (count * 2)
        const x = progress * width
        const centerDistance = Math.abs(progress - 0.52)
        const centerEnvelope = Math.exp(-(centerDistance * centerDistance) / 0.11)
        const calm = props.variant === "line" || props.active ? 1 : 0.32
        const wave =
          Math.sin(progress * 17 + elapsed * 1.2 + layerOffset) * 0.54 +
          Math.sin(progress * 31 - elapsed * 0.72 + layerOffset) * 0.19
        const y = center + wave * height * 0.22 * centerEnvelope * calm * props.energy * layerScale

        if (index === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }

      context.stroke()
    }

    const particleCount = isHeavyVoiceField
      ? Math.min(48, Math.max(28, Math.round(count * 0.36)))
      : Math.min(96, Math.max(48, Math.round(count * 0.52)))
    context.fillStyle = props.color
    context.shadowBlur = Math.min(11, height * 0.08)

    for (let index = 0; index < particleCount; index += 1) {
      const progress = (index + noise(index + 8) * 0.72) / particleCount
      const x = progress * width
      const envelope =
        gaussian(progress, 0.5, 0.25) * 0.72 +
        gaussian(progress, 0.17, 0.1) * 0.28 +
        gaussian(progress, 0.82, 0.11) * 0.24
      const drift = Math.sin(progress * 24 + elapsed * 0.9 + index) * height * 0.08
      const scatter = (noise(index + 41) - 0.5) * height * 0.52 * envelope
      const y = center + drift + scatter
      const radius = 0.5 + noise(index + 73) * 1.2

      context.globalAlpha = (0.18 + noise(index + 19) * 0.55) * Math.min(1, props.energy)
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    }

    context.shadowBlur = 0
    context.globalCompositeOperation = "source-over"
  }

  if (props.variant === "line") {
    context.globalAlpha = 1
    scheduleFrame()
    return
  }

  context.shadowColor = props.color
  context.shadowBlur = isHeavyVoiceField ? 0 : 4

  const barStep = isHeavyVoiceField ? 2 : 1
  for (let index = 0; index <= count; index += barStep) {
    const x = index * gap
    const progress = index / count
    const envelope =
      gaussian(progress, 0.5, 0.055) * 1.34 +
      gaussian(progress, 0.19, 0.075) * 0.28 +
      gaussian(progress, 0.8, 0.085) * 0.24 +
      gaussian(progress, 0.5, 0.29) * 0.12
    const pulse =
      Math.sin(index * 0.72 + elapsed * 3.2) * 0.42 +
      Math.sin(index * 0.21 - elapsed * 1.9) * 0.31 +
      Math.sin(index * 1.37 + elapsed * 1.1) * 0.18
    const energy = props.active ? 0.54 + pulse : 0.2
    const amplitude = Math.max(2, height * envelope * Math.abs(energy) * 0.52 * props.energy)

    context.globalAlpha = 0.18 + envelope * 0.75
    context.lineWidth = Math.max(1, gap * 0.22)
    context.beginPath()
    context.moveTo(x, center - amplitude)
    context.lineTo(x, center + amplitude)
    context.stroke()
  }

  context.globalAlpha = 1
  context.shadowBlur = 0
  scheduleFrame()
}

function releaseSurface() {
  cancelAnimationFrame(animationFrame)
  animationFrame = 0
  canvasWidth = 0
  canvasHeight = 0
  if (canvas.value) {
    canvas.value.width = 1
    canvas.value.height = 1
  }
}

function restart() {
  cancelAnimationFrame(animationFrame)
  animationFrame = 0
  if (!isVisible || document.hidden || !syncCanvasSize()) return
  startTime = performance.now()
  lastFrameTime = 0
  draw()
}

function handleVisibilityChange() {
  if (document.hidden) releaseSurface()
  else if (isVisible) restart()
}

watch(
  () => [props.active, props.color, props.density, props.energy, props.suspended, props.variant],
  restart,
)

onMounted(() => {
  reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
  resizeObserver = new ResizeObserver(() => {
    if (isVisible && !document.hidden) restart()
  })
  if (canvas.value) resizeObserver.observe(canvas.value)
  intersectionObserver = new IntersectionObserver(
    entries => {
      const nextVisible = entries[0]?.isIntersecting ?? false
      if (nextVisible === isVisible) return
      isVisible = nextVisible
      if (isVisible && !document.hidden) restart()
      else releaseSurface()
    },
    { rootMargin: "8% 0px", threshold: 0 },
  )
  if (canvas.value) intersectionObserver.observe(canvas.value)
  document.addEventListener("visibilitychange", handleVisibilityChange)
})

onBeforeUnmount(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange)
  releaseSurface()
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
})
</script>

<style scoped>
.voice-wave {
  display: block;
  width: 100%;
  height: 100%;
  contain: strict;
  pointer-events: none;
}
</style>
