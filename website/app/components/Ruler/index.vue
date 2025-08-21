<template>
  <div
    ref="containerX"
    class="grid-area-x relative bg-white"
    :style="{
      height: `var(--ruler-size-px)`,
    }"
  >
    <ClientOnly>
      <canvas
        id="ruler-x"
        ref="canvasX"
        :width="width"
        :height="SIZE"
        class="border-b border-b-black absolute top-0 left-0 size-full"
      />
    </ClientOnly>
  </div>
  <div
    ref="containerY"
    class="grid-area-y relative bg-white"
    :style="{
      width: `var(--ruler-size-px)`,
    }"
  >
    <ClientOnly>
      <canvas
        id="ruler-y"
        ref="canvasY"
        :width="SIZE"
        :height="height"
        class="border-r border-r-black absolute top-0 left-0 size-full"
      />
    </ClientOnly>
  </div>
  <div
    id="ruler-box"
    class="bg-white border-b border-r border-b-black border-r-black grid-area-n"
    :style="{
      width: `var(--ruler-size-px)`,
      height: `var(--ruler-size-px)`,
    }"
  />
</template>

<script lang="ts" setup>
import { useElementSize, useRafFn } from '@vueuse/core'

const props = defineProps<{
  scale: number
  x: number
  y: number
  mouseX: number
  mouseY: number
}>()

const { isMobile } = useViewport()

const SIZE = computed(() => {
  return isMobile.value ? 16 : 24
})

const containerX = ref<HTMLDivElement | null>(null)
const containerY = ref<HTMLDivElement | null>(null)

const canvasX = ref<HTMLCanvasElement | null>(null)
const canvasY = ref<HTMLCanvasElement | null>(null)

const { width } = useElementSize(containerX)
const { height } = useElementSize(containerY)

// Base step in artboard coordinates (e.g., 128 artboard units)
const BASE_STEP = 256

function drawMarks(ctx: CanvasRenderingContext2D, stepWidth: number) {
  ctx.clearRect(0, 0, width.value, SIZE.value)
  ctx.fillStyle = 'black'

  const x = Math.round(props.x)

  const adjustedStep =
    BASE_STEP * Math.pow(2, Math.ceil(Math.log2(128 / stepWidth)))

  // Number of steps to draw on the canvas
  const stepsX = Math.ceil(width.value / (adjustedStep * props.scale))

  // Calculate offset based on artboard x position
  const offsetX = Math.round(x) % (adjustedStep * props.scale)

  // Draw the major ruler ticks
  for (let i = -1; i < stepsX; i++) {
    const currentMark = offsetX + i * adjustedStep * props.scale

    // Draw major tick (black)
    ctx.fillRect(currentMark, 0, 1, SIZE.value)

    const quarterStep = (adjustedStep * props.scale) / 4

    // 25% mark.
    ctx.fillRect(currentMark + quarterStep, 15, 1, 10)

    // 50% mark.
    ctx.fillRect(
      currentMark + 2 * quarterStep,
      SIZE.value / 2,
      1,
      SIZE.value / 2,
    )

    // 75% mark.
    ctx.fillRect(currentMark + 3 * quarterStep, 15, 1, 10)
  }
}

function drawMarksY(ctx: CanvasRenderingContext2D, stepWidth: number) {
  ctx.fillStyle = 'white'
  ctx.clearRect(0, 0, SIZE.value, height.value)
  ctx.fillStyle = 'black'

  const y = Math.round(props.y)

  const adjustedStep =
    BASE_STEP * Math.pow(2, Math.ceil(Math.log2(128 / stepWidth)))

  // Number of steps to draw on the canvas
  const stepsY = Math.ceil(height.value / (adjustedStep * props.scale))

  // Calculate offset based on artboard x position
  const offsetY = Math.round(y) % (adjustedStep * props.scale)

  // Draw the major ruler ticks
  for (let i = -1; i < stepsY; i++) {
    const currentMark = offsetY + i * adjustedStep * props.scale

    // Draw major tick (black)
    ctx.fillRect(0, currentMark, SIZE.value, 1)

    const quarterStep = (adjustedStep * props.scale) / 4

    // 25% mark.
    ctx.fillRect(15, currentMark + quarterStep, 10, 1)

    // 50% mark.
    ctx.fillRect(
      SIZE.value / 2,
      currentMark + 2 * quarterStep,
      SIZE.value / 2,
      1,
    )

    // 75% mark.
    ctx.fillRect(15, currentMark + 3 * quarterStep, 10, 1)
  }
}

useRafFn(() => {
  const ctxX = canvasX.value?.getContext('2d')
  const ctxY = canvasY.value?.getContext('2d')

  if (!ctxX || !ctxY) {
    return
  }

  ctxY.fillStyle = 'white'

  ctxY.fillRect(0, 0, SIZE.value, height.value)

  ctxX.fillStyle = 'black'

  // Calculate real step width on the canvas
  const realStepWidth = BASE_STEP * props.scale

  drawMarks(ctxX, realStepWidth)
  drawMarksY(ctxY, realStepWidth)

  // ctxX.lineWidth = 1
  // ctxX.strokeStyle = '#333333'
  // ctxX.beginPath()
  // ctxX.setLineDash([2, 2])
  // ctxX.moveTo(props.mouseX, -2)
  // ctxX.lineTo(props.mouseX, SIZE)
  // ctxX.stroke()
})
</script>
