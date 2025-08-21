<template>
  <div
    ref="container"
    class="relative z-10 w-full draw-canvas border-y border-y-stone-600 touch-manipulation"
    :style="{
      aspectRatio: `${width} / ${height}`,
    }"
    :class="{
      'outline outline-4 outline-primary': isDrawing,
    }"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    @touchmove="onTouchMove"
    @mousemove="onMouseMove"
    @mousedown="onMouseDown"
  >
    <div class="grid-overlay absolute top-0 left-0 size-full z-[100]" />
    <canvas
      ref="canvasInterface"
      class="z-40 absolute top-0 left-0 size-full image-pixelated"
      :width="interfaceWidth"
      :height="interfaceHeight"
    />
    <canvas
      ref="canvasTemp"
      class="absolute top-0 size-full z-30 image-pixelated"
    />
    <canvas
      ref="canvasDrawing"
      class="absolute top-0 size-full z-20 image-pixelated"
      :width="width"
      :height="height"
    />

    <Teleport to="body">
      <div
        v-if="isDrawing && isMobile"
        class="fixed top-[15px] left-[15px] right-[29px] z-[999999999] window"
      >
        <div class="window-inner">
          <button
            class="button px-12 text-xl w-full py-16"
            @click.prevent="isDrawing = false"
          >
            Exit Drawing Mode
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport v-if="overviewCanvas" :to="overviewCanvas">
      <div
        class="grid-overlay absolute top-0 left-0 size-full z-[100] border-y border-y-stone-600"
      />
      <canvas
        ref="canvasOverview"
        class="relative top-0 size-full z-20 image-pixelated"
        :width="width"
        :height="height"
      />
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { useCssVar, useRafFn } from '@vueuse/core'
import { rgbToHex } from '~/helper/colors'
import pixelLogo from '~/assets/pixel-logo.png'

const props = defineProps<{
  scale: number
  mock?: boolean
  overviewCanvas: HTMLElement | null | undefined
}>()

const width = ref(44)
const height = ref(22)

const interfaceWidth = computed(() => width.value * 32)
const interfaceHeight = computed(() => height.value * 32)

const container = ref<HTMLDivElement | null>(null)
const canvasInterface = ref<HTMLCanvasElement | null>(null)
const canvasDrawing = ref<HTMLCanvasElement | null>(null)
const canvasTemp = ref<HTMLCanvasElement | null>(null)
const canvasOverview = ref<HTMLCanvasElement | null>(null)

const mouseX = ref(0)
const mouseY = ref(0)
const pressed = ref(false)

const { isMobile } = useViewport()

const isDrawing = defineModel<boolean>()

function onTouchMove(e: TouchEvent) {
  if (!isDrawing.value) {
    return
  }

  if (e.touches.length !== 1) {
    pressed.value = false
    return
  }

  e.preventDefault()
  e.stopPropagation()
  const touch = e.touches[0]
  if (!touch) {
    return
  }

  pressed.value = true
  mouseX.value = touch.pageX
  mouseY.value = touch.pageY
}

function onMouseMove(e: MouseEvent) {
  if (isMobile.value) {
    return
  }

  mouseX.value = e.x
  mouseY.value = e.y
}

function onMouseUp(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  pressed.value = false
}

function onMouseDown(e: MouseEvent) {
  if (isMobile.value) {
    return
  }

  e.stopPropagation()
  e.preventDefault()
  pressed.value = true

  window.addEventListener('mouseup', onMouseUp)
}

let touchStartTime = 0

function onTouchStart(e: TouchEvent) {
  pressed.value = false
  if (!isDrawing.value) {
    const now = performance.now()
    if (!touchStartTime) {
      touchStartTime = now
      return
    }
    if (now - touchStartTime < 500) {
      isDrawing.value = true
    }
    touchStartTime = now
    return
  }

  if (e.touches.length === 2) {
    return
  }

  mouseX.value = e.touches[0]!.pageX
  mouseY.value = e.touches[0]!.pageY

  e.preventDefault()
  e.stopPropagation()
  pressed.value = true
}

function onTouchEnd() {
  pressed.value = false
}

const color = useCssVar('--color-primary', null, {
  observe: true,
})

const colorHex = computed(() => {
  return color.value ? rgbToHex(color.value) : 'black'
})

function forEachContext(cb: (ctx: CanvasRenderingContext2D) => void) {
  const ctxA = canvasDrawing.value?.getContext('2d')
  if (ctxA) {
    cb(ctxA)
  }

  const ctxB = canvasOverview.value?.getContext('2d')
  if (ctxB) {
    cb(ctxB)
  }
}

function erase() {
  forEachContext((ctx) =>
    ctx.clearRect(0, 0, interfaceWidth.value, interfaceHeight.value),
  )
  pixels.fill('')
}

function getRootElement(): HTMLElement | null {
  return container.value
}

let prevX: number | null = null
let prevY: number | null = null

function drawInterface() {
  const ctx = canvasInterface.value?.getContext('2d')
  if (!ctx || !canvasInterface.value) {
    return ctx
  }

  const rect = canvasInterface.value.getBoundingClientRect()

  const x = Math.floor((mouseX.value / props.scale - rect.x / props.scale) / 32)
  const y = Math.floor((mouseY.value / props.scale - rect.y / props.scale) / 32)

  ctx.clearRect(0, 0, interfaceWidth.value, interfaceHeight.value)

  ctx.lineWidth = 3

  ctx.strokeRect(x * 32 + 1.5, y * 32 + 1.5, 29, 29)
}

const pixels: string[] = Array.from({
  length: width.value * height.value,
}).map(() => '')

function setPixel(x: number, y: number) {
  const index = x + y * width.value
  const pixel = pixels[index]

  if (pixel === colorHex.value) {
    return
  }

  pixels[index] = colorHex.value

  forEachContext((ctx) => {
    ctx.fillStyle = colorHex.value
    ctx.fillRect(x, y, 1, 1)
  })
}

function drawPixel() {
  if (!pressed.value || !canvasDrawing.value) {
    return
  }
  if (prevX === null) {
    prevX = mouseX.value
  }

  if (prevY === null) {
    prevY = mouseY.value
  }

  const rect = canvasDrawing.value.getBoundingClientRect()

  const x = Math.floor((mouseX.value / props.scale - rect.x / props.scale) / 32)
  const y = Math.floor((mouseY.value / props.scale - rect.y / props.scale) / 32)

  setPixel(x, y)
}

useRafFn(() => {
  drawPixel()
  drawInterface()
})

async function drawInitLogo() {
  const offscreen = new OffscreenCanvas(width.value, height.value)
  const response = await fetch(pixelLogo)
  const blob = await response.blob()
  const imageBitmap = await createImageBitmap(blob)
  const ctx = offscreen.getContext('2d')
  if (!ctx) {
    return
  }
  ctx.drawImage(imageBitmap, 0, 0)
  const imgData = ctx?.getImageData(0, 0, width.value, height.value).data

  for (let i = 0; i < imgData.length; i = i + 4) {
    const pixel = imgData[i]
    if (pixel === 0) {
      const x = (i / 4) % width.value
      const y = Math.floor(i / 4 / width.value)
      setPixel(x, y)
    }
  }
}

onMounted(async () => {
  await drawInitLogo()
})

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', onMouseUp)
})

defineExpose({ erase, getRootElement })
</script>

<style lang="postcss">
.grid-overlay {
  background-image: url('~/assets/grid.png');
  background-size: 32px 32px;
}
</style>
