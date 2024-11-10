<template>
  <div class="relative scene overflow-hidden">
    <Ruler :scale="scale" :x="x" :y="y" :mouse-x="mouseX" :mouse-y="mouseY" />

    <div class="grid-area-m relative overflow-hidden contain-strict">
      <div
        id="root"
        ref="rootEl"
        class="root absolute overflow-hidden top-0 left-0 size-full"
        @click="onClickArtboard"
      >
        <div
          ref="artboardEl"
          class="bg-white absolute top-0 left-0 origin-top-left artboard overflow-hidden w-[var(--artboard-size-px)]"
        >
          <Content>
            <DrawCanvas
              ref="drawCanvas"
              v-model="isDrawing"
              :scale="scale"
              :overview-canvas="overviewCanvas"
            />
          </Content>
        </div>
      </div>
    </div>

    <ScrollbarComponent
      ref="scrollbarY"
      orientation="y"
      class="grid-area-h"
      @up="artboard?.scrollUp()"
      @down="artboard?.scrollDown()"
    />
    <ScrollbarComponent
      ref="scrollbarX"
      orientation="x"
      class="grid-area-w"
      @up="artboard?.scrollLeft()"
      @down="artboard?.scrollRight()"
    />

    <Toolbar
      key="toolbar"
      @reset-zoom="artboard?.resetZoom()"
      @scale-to-fit="artboard?.scaleToFit()"
      @erase="drawCanvas?.erase()"
      @zoom-in="artboard?.zoomIn()"
      @zoom-out="artboard?.zoomOut()"
      @scroll-into-view="scrollIntoView"
    />

    <OverviewComponent ref="overviewComponent" key="overview" />
  </div>
</template>

<script setup lang="ts">
import {
  dom,
  mouse,
  wheel,
  touch,
  scrollbar,
  overview,
  keyboard,
  createArtboard,
  type ArtboardOptions,
  type Rectangle,
  type Artboard,
} from 'artboard-deluxe'
import type DrawCanvas from './../components/DrawCanvas.vue'
import ScrollbarComponent from './../components/Scrollbar/index.vue'
import OverviewComponent from './../components/Overview/index.vue'
import { useMouse } from '@vueuse/core/index.cjs'
import { notNullish } from '@vueuse/core'

const artboardEl = ref<HTMLDivElement>()
const rootEl = ref<HTMLDivElement>()
const drawCanvas = ref<InstanceType<typeof DrawCanvas> | null>(null)
const scrollbarY = ref<InstanceType<typeof ScrollbarComponent> | null>(null)
const scrollbarX = ref<InstanceType<typeof ScrollbarComponent> | null>(null)
const overviewComponent = ref<InstanceType<typeof OverviewComponent> | null>(
  null,
)

const overviewCanvas = computed(() =>
  overviewComponent.value?.getOverviewCanvas(),
)

function onClickArtboard(e: MouseEvent) {
  if (e.target instanceof HTMLElement) {
    const anchor = e.target.closest('a')
    if (anchor instanceof HTMLAnchorElement) {
      const href = anchor.getAttribute('href')
      if (href?.startsWith('#')) {
        const targetElement = artboardEl.value?.querySelector(href)
        if (targetElement instanceof HTMLElement) {
          artboard?.scrollElementIntoView(targetElement, {
            axis: 'y',
          })
          e.preventDefault()
        }
      }
    }
  }
}

const { isMobile } = useViewport()

let artboard: Artboard | null = null
let raf: number | null = null

const isDrawing = ref(false)

const scale = ref(1)
const x = ref(0)
const y = ref(0)
const artboardHeight = ref(0)
const artboardWidth = ref(0)
const rootWidth = ref(0)
const rootHeight = ref(0)

const { x: mouseX, y: mouseY } = useMouse()

function loop(currentTime: number) {
  if (artboard) {
    artboard.loop(currentTime)
    scale.value = artboard.getScale()
    const offset = artboard.getOffset()
    x.value = offset.x
    y.value = offset.y

    const artboardSize = artboard.getArtboardSize()
    if (!artboardSize) {
      return
    }
    artboardHeight.value = artboardSize.height
    artboardWidth.value = artboardSize.width

    const rootSize = artboard.getRootSize()
    rootHeight.value = rootSize.height
    rootWidth.value = rootSize.width
  }

  raf = window.requestAnimationFrame(loop)
}

function scrollIntoView() {
  if (!artboard || !drawCanvas.value) {
    return
  }
  const el = drawCanvas.value.getRootElement()

  if (!el) {
    return
  }

  artboard.scrollElementIntoView(el, {
    scale: 'blocking',
    duration: 1000,
  })
}

function onWindowBeforeUnload() {
  const state: InitState = {
    x: x.value,
    y: y.value,
    scale: scale.value,
  }

  window.localStorage.setItem('artboard_state', JSON.stringify(state))
}

type InitState = {
  x: number
  y: number
  scale: number
}

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

const options = computed<ArtboardOptions>(() => {
  return {
    maxScale: isMobile.value ? 2 : 20,
    twoTouchScrolling: isDrawing.value && isMobile.value,
    interceptWheel: false,
    overscrollBounds: {
      top: 400,
      left: 400,
      bottom: 400,
      right: 400,
    },
  }
})

watch(options, function (newOptions) {
  if (artboard) {
    artboard.setOptions(newOptions)
  }
})

onMounted(() => {
  if (!artboardEl.value || !rootEl.value) {
    return
  }

  window.addEventListener('beforeunload', onWindowBeforeUnload)

  artboard = createArtboard(
    rootEl.value,
    [
      dom({
        element: artboardEl.value,
        setInitTransformFromRect: true,
        applyScalePrecision: false,
      }),
      mouse({
        useSpacebar: true,
      }),
      wheel({
        interceptWheel: true,
        useMomentumScroll: true,
        useMomentumZoom: true,
      }),
      touch(),
      keyboard(),
    ],
    {
      getBlockingRects,
      ...options.value,
      direction: 'both',
    },
  )

  loop(performance.now())
})

watch(scrollbarX, function (component) {
  if (component && artboard) {
    const el = component.getElement()
    if (el) {
      artboard.addPlugin(
        scrollbar({
          element: el,
          orientation: 'x',
        }),
      )
    }
  }
})

watch(scrollbarY, function (component) {
  if (component && artboard) {
    const el = component.getElement()
    if (el) {
      artboard.addPlugin(
        scrollbar({
          element: el,
          orientation: 'y',
        }),
      )
    }
  }
})

watch(overviewComponent, function (component) {
  if (component && artboard) {
    const el = component.getElement()
    if (el) {
      artboard.addPlugin(
        overview({
          element: el,
        }),
      )
    }
  }
})

onBeforeUnmount(() => {
  if (raf) {
    window.cancelAnimationFrame(raf)
  }
  window.removeEventListener('beforeunload', onWindowBeforeUnload)

  if (artboard) {
    artboard.destroy()
  }
})
</script>

<style lang="postcss">
.scene {
  background: #b7b7b7;
  @apply grid;
  grid-template-rows: var(--ruler-size-px) 1fr auto var(--toolbar-size-px);
  grid-template-columns: var(--ruler-size-px) 1fr auto;

  grid-template-areas:
    'N X X'
    'Y M H'
    'Y W O'
    'T T T';
}

.artboard {
  box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 0.2);
  --init-artboard-scale: calc(
    (
        (
            var(--init-window-width) - var(--ruler-size) - var(--scrollbar-size) -
              64
          ) / var(--artboard-size)
      ) * 1
  );
  --init-artboard-offset-x: 32px;
  --init-artboard-offset-y: 32px;
  transform: translate(
      var(--init-artboard-offset-x),
      var(--init-artboard-offset-y)
    )
    scale(var(--init-artboard-scale));

  @screen lg {
    --init-artboard-offset-x: calc(
      50vw - ((var(--artboard-size-px) * var(--init-artboard-scale)) / 2)
    );
  }
  @screen xl {
    --init-artboard-scale: 1;
  }
  outline: 1px solid black;
}

.root {
  background-image: url('~/assets/images/concrete.gif');
  background-size: 378px 256px;
}
</style>
