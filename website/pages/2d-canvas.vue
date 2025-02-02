<template>
  <div class="relative canvas-2d-scene" :style="sceneStyle as any">
    <div ref="root" class="grid-area-c relative">
      <div class="absolute top-0 left-0 size-full">
        <canvas
          ref="canvas"
          v-bind="canvasAttributes"
          class="size-full image-pixelated"
          @mousedown="onPointerDown"
          @touchstart="onTouchStart"
        />
      </div>
    </div>
    <ScrollbarComponent
      ref="scrollbarX"
      orientation="x"
      class="grid-area-w relative z-50"
      @up="artboard?.scrollLeft()"
      @down="artboard?.scrollRight()"
    />
    <ScrollbarComponent
      ref="scrollbarY"
      orientation="y"
      class="grid-area-h relative z-50"
      @up="artboard?.scrollUp()"
      @down="artboard?.scrollDown()"
    />

    <Toolbar
      key="toolbar"
      @reset-zoom="artboard?.resetZoom()"
      @scale-to-fit="artboard?.scaleToFit()"
      @erase="erase"
      @zoom-in="artboard?.zoomIn()"
      @zoom-out="artboard?.zoomOut()"
      @scroll-into-view="scrollIntoView"
    />

    <OverviewComponent
      ref="overviewComponent"
      key="overview"
      v-slot="{ width: overviewWidth, height: overviewHeight }"
    >
      <canvas
        ref="overviewCanvas"
        class="image-pixelated"
        :width="overviewWidth.value"
        :height="overviewHeight.value"
      />
    </OverviewComponent>
  </div>
</template>

<script setup lang="ts">
import { notNullish, useCssVar, useElementSize } from '@vueuse/core'
import ScrollbarComponent from './../components/Scrollbar/index.vue'
import OverviewComponent from './../components/Overview/index.vue'
import {
  type Rectangle,
  type Artboard,
  type PluginSticky,
  keyboard,
  scrollbar,
  overview,
  mouse,
  touch,
  wheel,
  createArtboard,
  sticky,
} from 'artboard-deluxe'
import { rgbToHex } from '~/helper/colors'
import { isInsideRect } from '~/helper'
import type { CSSProperties } from 'vue'

const scrollbarX = ref<InstanceType<typeof ScrollbarComponent> | null>(null)
const scrollbarY = ref<InstanceType<typeof ScrollbarComponent> | null>(null)
const overviewComponent = ref<InstanceType<typeof OverviewComponent> | null>(
  null,
)
const root = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()
const overviewCanvas = ref<HTMLCanvasElement>()
const { width, height } = useElementSize(root)

const canvasAttributes = computed(() => {
  return {
    width: Math.round(width.value),
    height: Math.round(height.value),
  }
})

const color = useCssVar('--color-primary', null, {
  observe: true,
})

const colorHex = computed(() => {
  return color.value ? rgbToHex(color.value) : 'black'
})

let offscreenCurrent: OffscreenCanvas | null = null
let offscreenImage: OffscreenCanvas | null = null

let offsetX = 0
let offsetY = 0

const shouldRender = computed(() => width.value && height.value)

function eraseImage(canvas?: OffscreenCanvas | null) {
  canvas
    ?.getContext('2d')
    ?.clearRect(0, 0, canvasSize.value.width, canvasSize.value.width)
}

function erase() {
  eraseImage(offscreenImage)
  drawnBounds.hasDrawn = false
  drawnBounds.x = 9999
  drawnBounds.y = 9999
  drawnBounds.width = 0
  drawnBounds.height = 0
}

function scrollIntoView() {
  if (!artboard) {
    return
  }

  if (drawnBounds.hasDrawn) {
    artboard.scrollIntoView(
      {
        x: drawnBounds.x,
        y: drawnBounds.y,
        width: drawnBounds.width - drawnBounds.x,
        height: drawnBounds.height - drawnBounds.y,
      },
      {
        scale: 'blocking',
      },
    )
    return
  }

  artboard.scrollIntoView(
    {
      ...artboardSize.value,
      x: 0,
      y: 0,
    },
    {
      scale: 'blocking',
    },
  )
}

const artboardSize = ref({
  width: 1200,
  height: 800,
})

const dpi = 0.25

const canvasSize = computed(() => ({
  width: artboardSize.value.width * dpi,
  height: artboardSize.value.height * dpi,
}))

const drawnBounds = {
  hasDrawn: false,
  x: 9999,
  y: 9999,
  width: 0,
  height: 0,
}

const brushSize = 40

let artboard: Artboard | null = null
let stickyPlugin: PluginSticky | null = null
let raf: null | number = null

let mouseXRelative = 0
let mouseYRelative = 0
let mouseX = 0
let mouseY = 0
let mouseXPage = 0
let mouseYPage = 0
let mouseXPageStart = 0
let mouseYPageStart = 0
let handleOffsetX = 0
let handleOffsetY = 0

const mode = ref<'drawing' | 'resize' | 'none'>('none')

const isDrawing = computed(() => mode.value === 'drawing')
const isResizing = computed(() => mode.value === 'resize')

const isIntersectingResizer = ref(false)

const sceneStyle = computed<Partial<CSSProperties>>(() => {
  return {
    cursor:
      isResizing.value || isIntersectingResizer.value
        ? 'se-resize'
        : 'crosshair',
  }
})

let points: { x: number; y: number }[] = []

function abortTouch() {
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchMove)
  onPointerUp()
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length > 1) {
    return abortTouch()
  }
  e.preventDefault()
  if (isDrawing.value) {
    return
  }

  const touch = e.touches[0]

  mode.value = 'drawing'
  updateMousePosition(touch.pageX, touch.pageY)
  points.push({ x: mouseX, y: mouseY })
  points.push({ x: mouseX, y: mouseY })

  window.addEventListener('touchmove', onTouchMove)
  window.addEventListener('touchend', onTouchEnd)
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length > 1) {
    return abortTouch()
  }
  const touch = e.touches[0]
  updateMousePosition(touch.pageX, touch.pageY)

  if (!isDrawing.value) {
    return
  }
  points.push({ x: mouseX, y: mouseY })
}

function onTouchEnd() {
  abortTouch()
}

let resizeHandleRect: Rectangle = {
  x: 0,
  y: 0,
  width: 20,
  height: 20,
}

let newWidth = 0
let newHeight = 0

function onPointerDown(e: MouseEvent) {
  e.preventDefault()
  window.addEventListener('mouseup', onPointerUp)
  mouseXPageStart = e.pageX
  mouseYPageStart = e.pageY
  if (isInsideRect(e.pageX, e.pageY, resizeHandleRect)) {
    mode.value = 'resize'
    handleOffsetX = resizeHandleRect.x - mouseXPageStart
    handleOffsetY = resizeHandleRect.y - mouseYPageStart
    return
  }
  mode.value = 'drawing'
  updateMousePosition(e.pageX, e.pageY)
  points.push({ x: mouseX, y: mouseY })
  points.push({ x: mouseX, y: mouseY })
}

function onPointerMove(e: MouseEvent) {
  updateMousePosition(e.pageX, e.pageY)

  if (!isDrawing.value) {
    return
  }
  points.push({ x: mouseX, y: mouseY })
}

function onPointerUp() {
  if (isResizing.value) {
    if (artboard) {
      artboardSize.value.width = newWidth / artboardScale
      artboardSize.value.height = newHeight / artboardScale
      artboard.setArtboardSize(
        artboardSize.value.width,
        artboardSize.value.height,
      )

      if (offscreenImage && offscreenCurrent) {
        const image = offscreenImage.getContext('2d')
          ? offscreenImage.transferToImageBitmap()
          : null
        offscreenImage.width = canvasSize.value.width
        offscreenImage.height = canvasSize.value.height
        offscreenCurrent.width = canvasSize.value.width
        offscreenCurrent.height = canvasSize.value.height
        if (image) {
          offscreenImage.getContext('2d')?.drawImage(image, 0, 0)
        }
      }
    }
  }
  mode.value = 'none'
  points = []

  if (offscreenCurrent && offscreenImage) {
    offscreenImage.getContext('2d')?.drawImage(offscreenCurrent, 0, 0)
    eraseImage(offscreenCurrent)
  }
  window.removeEventListener('mouseup', onPointerUp)
}

function loop(currentTime: number) {
  if (!artboard) return

  if (!stickyPlugin) return

  const loopContext = artboard.loop(currentTime)
  const ctx = canvas.value?.getContext('2d')
  artboardScale = loopContext.scale
  artboardOffsetX = loopContext.offset.x
  artboardOffsetY = loopContext.offset.y
  const isDragging = artboard.getInteraction() === 'dragging'

  if (!ctx) {
    return
  }
  ctx.imageSmoothingEnabled = false

  const x = Math.round(loopContext.offset.x)
  const y = Math.round(loopContext.offset.y)
  const w = Math.round(loopContext.artboardSize!.width * loopContext.scale)
  const h = Math.round(loopContext.artboardSize!.height * loopContext.scale)

  // Clear the canvas.
  ctx.clearRect(0, 0, width.value, height.value)

  // Draw the background.
  ctx.fillStyle = '#ddddd7'
  ctx.fillRect(0, 0, width.value, height.value)

  // Draw the shadow.
  const SHADOW_SIZE = 4
  ctx.fillStyle = '#bbbbaf'
  ctx.fillRect(
    x + SHADOW_SIZE,
    y + SHADOW_SIZE,
    w + SHADOW_SIZE,
    h + SHADOW_SIZE,
  )

  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.lineWidth = 2
  ctx.strokeStyle = 'black'
  ctx.fill()
  ctx.stroke()

  if (isDrawing.value) {
    draw(brushSize * dpi)
  }

  if (offscreenCurrent && offscreenImage) {
    ctx.drawImage(
      offscreenImage,
      0,
      0,
      canvasSize.value.width,
      canvasSize.value.height,
      x,
      y,
      w,
      h,
    )
    ctx.drawImage(
      offscreenCurrent,
      0,
      0,
      canvasSize.value.width,
      canvasSize.value.height,
      x,
      y,
      w,
      h,
    )
  }

  const stickyRect = stickyPlugin.getRect()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.beginPath()
  ctx.rect(stickyRect.x, stickyRect.y, stickyRect.width, stickyRect.height)
  ctx.fill()

  ctx.font = '27px Pixel Code'
  ctx.fillStyle = 'black'
  ctx.textRendering = 'optimizeSpeed'
  ctx.fillText('2D Canvas', stickyRect.x + 9, stickyRect.y + 29)

  // Draw brush preview.
  if (!isResizing.value && !isDragging) {
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.arc(
      mouseXRelative,
      mouseYRelative,
      (brushSize * loopContext.scale) / 2,
      0,
      2 * Math.PI,
    )
    ctx.stroke()
  }

  if (drawnBounds.hasDrawn) {
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.rect(
      loopContext.offset.x + drawnBounds.x * artboardScale,
      loopContext.offset.y + drawnBounds.y * artboardScale,
      (drawnBounds.width - drawnBounds.x) * artboardScale,
      (drawnBounds.height - drawnBounds.y) * artboardScale,
    )
    ctx.stroke()
    ctx.setLineDash([])
  }

  const overviewCtx = overviewCanvas.value?.getContext('2d')

  if (
    overviewCtx &&
    overviewCanvas.value &&
    offscreenImage &&
    offscreenCurrent
  ) {
    overviewCtx.imageSmoothingEnabled = false
    overviewCtx.clearRect(
      0,
      0,
      overviewCanvas.value.width,
      overviewCanvas.value.height,
    )
    overviewCtx.drawImage(
      offscreenImage,
      0,
      0,
      canvasSize.value.width,
      canvasSize.value.height,
      0,
      0,
      overviewCanvas.value.width,
      overviewCanvas.value.height,
    )
    overviewCtx.drawImage(
      offscreenCurrent,
      0,
      0,
      canvasSize.value.width,
      canvasSize.value.height,
      0,
      0,
      overviewCanvas.value.width,
      overviewCanvas.value.height,
    )
  }

  // Draw resize handle.

  resizeHandleRect = {
    x: x + w + offsetX,
    y: y + h + offsetY,
    width: 20,
    height: 20,
  }

  if (
    isInsideRect(mouseXPage, mouseYPage, resizeHandleRect) ||
    isResizing.value
  ) {
    isIntersectingResizer.value = true
    ctx.fillStyle = colorHex.value
  } else {
    isIntersectingResizer.value = false
    ctx.fillStyle = 'black'
  }

  if (isResizing.value) {
    const scale = dpi / artboardScale
    newWidth = Math.max(
      Math.round(Math.round((mouseXPage - x + handleOffsetX) * scale) / scale),
      10 / scale,
    )
    newHeight = Math.max(
      Math.round(
        Math.round((mouseYPage - y - offsetY + handleOffsetY) * scale) / scale,
      ),
      10 / scale,
    )
    ctx.beginPath()
    ctx.rect(x, y, newWidth, newHeight)
    ctx.stroke()
    ctx.fillRect(x + newWidth, y + newHeight, 22, 22)

    ctx.font = '27px Pixel Code'
    ctx.fillStyle = 'black'
    ctx.textRendering = 'optimizeSpeed'
    ctx.fillText(
      `${Math.round(newWidth * scale)}x${Math.round(newHeight * scale)}`,
      x + newWidth + 29,
      y + newHeight + 21,
    )
  } else {
    ctx.fillRect(x + w, y + h, 20, 20)
  }

  raf = window.requestAnimationFrame(loop)
}

let artboardOffsetX = 0
let artboardOffsetY = 0
let artboardScale = 1

function updateMousePosition(pageX: number, pageY: number) {
  if (!artboard) return

  const x = pageX - offsetX
  const y = pageY - offsetY
  mouseXPage = pageX
  mouseYPage = pageY

  const artboardMouseX = (x - artboardOffsetX) / artboardScale
  const artboardMouseY = (y - artboardOffsetY) / artboardScale

  mouseX = artboardMouseX * dpi
  mouseY = artboardMouseY * dpi
  mouseXRelative = x
  mouseYRelative = y

  if (!isDrawing.value) {
    return
  }
  drawnBounds.hasDrawn = true
  const r = brushSize / 2
  if (artboardMouseX < drawnBounds.x + r) {
    drawnBounds.x = Math.max(artboardMouseX - r, 0)
  }
  if (artboardMouseX > drawnBounds.width - r) {
    drawnBounds.width = Math.min(artboardMouseX + r, artboardSize.value.width)
  }
  if (artboardMouseY < drawnBounds.y + r) {
    drawnBounds.y = Math.max(artboardMouseY - r, 0)
  }
  if (artboardMouseY > drawnBounds.height - r) {
    drawnBounds.height = Math.min(artboardMouseY + r, artboardSize.value.height)
  }
}

type Point = {
  x: number
  y: number
}

function midPointBtw(p1: Point, p2: Point) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
  }
}

function draw(brushWidth: number) {
  const ctx = offscreenCurrent?.getContext('2d')

  if (!ctx || points.length < 2) {
    return
  }

  eraseImage(offscreenCurrent)
  ctx.imageSmoothingEnabled = false

  ctx.beginPath()
  ctx.lineWidth = brushWidth
  ctx.strokeStyle = colorHex.value
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  let p1 = points[0]
  let p2 = points[1]
  ctx.moveTo(p2.x, p2.y)
  ctx.beginPath()

  for (let i = 1, len = points.length; i < len; i++) {
    const midPoint = midPointBtw(p1, p2)
    ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y)
    p1 = points[i]
    p2 = points[i + 1]
  }
  ctx.lineTo(p1.x, p1.y)
  ctx.stroke()
}

const { isMobile } = useViewport()

function getBlockingRects(): Rectangle[] {
  if (isMobile.value) {
    return []
  }
  return [...document.querySelectorAll('.blocking-rect')]
    .map((el) => {
      if (el instanceof HTMLElement) {
        return el.getBoundingClientRect()
      }
      return null
    })
    .filter(notNullish)
}

function initArtboard() {
  if (!canvas.value) return

  offscreenCurrent = new OffscreenCanvas(
    canvasSize.value.width,
    canvasSize.value.height,
  )
  offscreenImage = new OffscreenCanvas(
    canvasSize.value.width,
    canvasSize.value.height,
  )

  artboard = createArtboard(
    canvas.value,
    [
      mouse({
        useSpacebar: true,
      }),
      touch({
        useTwoTouchScrolling: true,
      }),
      wheel({
        useMomentumZoom: true,
        useMomentumScroll: true,
        interceptWheel: true,
      }),
      keyboard(),
    ],
    {
      initTransform: {
        scale: 1,
        x: width.value / 2 - artboardSize.value.width / 2,
        y: height.value / 2 - artboardSize.value.height / 2,
      },
      getBlockingRects,
      maxScale: 15,
    },
  )

  artboard.setArtboardSize(artboardSize.value.width, artboardSize.value.height)

  stickyPlugin = artboard.addPlugin(
    sticky({
      target: {
        width: 179,
        height: 40,
      },
      origin: 'bottom-left',
      margin: 0,
      keepVisible: true,
      precision: 1,
    }),
  )

  if (scrollbarY.value) {
    const el = scrollbarY.value.getElement()
    if (el) {
      artboard.addPlugin(
        scrollbar({
          element: el,
          orientation: 'y',
        }),
      )
    }
  }

  if (scrollbarX.value) {
    const el = scrollbarX.value.getElement()
    if (el) {
      artboard.addPlugin(
        scrollbar({
          element: el,
          orientation: 'x',
        }),
      )
    }
  }

  if (overviewComponent.value) {
    const el = overviewComponent.value.getElement()
    if (el) {
      artboard.addPlugin(overview({ element: el }))
    }
  }

  raf = window.requestAnimationFrame(loop)
}

watch(shouldRender, initArtboard)

onMounted(() => {
  window.addEventListener('mousemove', onPointerMove)
  if (root.value) {
    const rect = root.value.getBoundingClientRect()
    offsetX = rect.x
    offsetY = rect.y
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('mouseup', onPointerUp)
  if (raf) {
    window.cancelAnimationFrame(raf)
  }

  if (artboard) {
    artboard.destroy()
  }
})
</script>

<style lang="postcss">
.canvas-2d-scene {
  @apply grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto 1fr auto;

  grid-template-areas:
    'C H'
    'C H'
    'W O'
    'T T';
}
</style>
