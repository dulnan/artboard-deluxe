<template>
  <div
    class="relative bg-silver grid grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto] grid-rows-[1fr_auto_auto] md:grid-rows-[1fr_auto] overflow-hidden"
  >
    <div class="col-start-1 col-span-3 row-start-3 relative z-50 md:hidden">
      <button
        class="button w-full text-xl font-bold py-12"
        @click="optionsVisible = !optionsVisible"
      >
        Toggle Options
      </button>
    </div>
    <div
      v-show="optionsVisible"
      class="w-full md:w-[400px] bg-silver relative z-[100] col-start-1 col-span-3 md:col-span-1 row-start-1 row-span-2 options-pane overflow-y-scroll md:!block overscroll-contain"
      @wheel="onWheel"
    >
      <ClientOnly v-if="isReady">
        <PluginOptions
          name="createArtboard"
          :plugin="artboard"
          :options="artboardOptions"
          open
        />
        <PluginOptions
          name="clickZoom"
          :plugin="pluginClickZoom"
          :options="clickZoomOptions"
        />
        <PluginOptions
          name="mouse"
          :plugin="pluginMouse"
          :options="mouseOptions"
        />
        <PluginOptions
          name="touch"
          :plugin="pluginTouch"
          :options="touchOptions"
        />

        <PluginOptions
          name="wheel"
          :plugin="pluginWheel"
          :options="wheelOptions"
        />

        <PluginOptions
          name="scrollbar"
          :plugin="[scrollbarPluginX, scrollbarPluginY]"
          :options="scrollbarOptions"
        />

        <PluginOptions name="dom" :plugin="pluginDom" :options="domOptions" />
      </ClientOnly>
    </div>
    <div
      ref="rootEl"
      class="relative col-start-1 md:col-start-2 row-start-1 col-span-2 row-span-2 cursor-zoom-in grid items-center justify-center"
    >
      <img
        ref="image"
        src="~/assets/images/amiga500.jpg"
        width="2531"
        height="1965"
        class="artboard-image image-pixelated touch-none pointer-events-none"
      />

      <div class="absolute bottom-0 right-8 md:text-xl">
        Image: © Bill Bertram 2006
      </div>

      <div ref="zoomOverlayEl" class="font-mono absolute" />
    </div>
    <div
      ref="scrollbarX"
      class="col-start-1 md:col-start-2 col-span-1 row-start-2 overflow-hidden group relative z-50 h-28"
    >
      <button
        class="artboard-thumb block opacity-50 group-hover:opacity-100 py-8"
      >
        <div class="bg-black h-12 border border-white" />
      </button>
    </div>
    <div
      ref="scrollbarY"
      class="col-start-3 row-start-1 overflow-hidden group relative z-50 w-28"
    >
      <button
        class="artboard-thumb block opacity-50 group-hover:opacity-100 px-8"
      >
        <div class="bg-black w-12 border border-white h-full" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  createArtboard,
  mouse,
  wheel,
  keyboard,
  scrollbar,
  touch,
  dom,
  raf,
  clickZoom,
  doubleTapZoom,
  type Rectangle,
  type Artboard,
  type PluginScrollbar,
  type PluginMouse,
  type PluginWheel,
  type PluginTouch,
  type PluginKeyboard,
  type PluginDom,
  type PluginClickZoom,
  type PluginDoubleTapZoom,
} from 'artboard-deluxe'
import {
  defineAnimationOption,
  defineBooleanOption,
  defineRangeOption,
  defineVelocityOption,
} from '~/helper/pluginOptions'

import { zoomOverlay } from '~/artboardPlugins/zoomOverlay'

const isReady = ref(false)
const optionsVisible = ref(false)
const zoomOverlayEl = ref<HTMLElement>()

const optionsRect = ref<Rectangle>({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
})

const optionsCodeRect = ref<Rectangle>({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
})

const artboardOptions = [
  defineRangeOption(
    'overscrollBounds',
    'How much of the artboard should remain visible when overscrolling.',
    0,
    400,
    1,
    400,
    'px',
  ),
  defineRangeOption(
    'margin',
    'The margin used when aligning the artboard (press Ctrl+1 to test).',
    0,
    100,
    1,
    10,
    'px',
  ),
  defineRangeOption(
    'scrollStepAmount',
    'The amount to scroll per step when using the keyboard.',
    16,
    512,
    1,
    256,
    'px',
  ),
  defineRangeOption(
    'minScale',
    'The minimum amount the artboard can scale.',
    0.02,
    1,
    0.01,
    0.1,
  ),
  defineRangeOption(
    'maxScale',
    'The maximum amount the artboard can scale.',
    1,
    26,
    0.01,
    12,
  ),
  defineRangeOption(
    'momentumDeceleration',
    'The deceleration of the momentum scrolling.',
    0.7,
    0.999,
    0.001,
    0.95,
  ),

  defineRangeOption(
    'springDamping',
    'How much damping to apply when overscrolling.',
    0.1,
    1,
    0.01,
    0.5,
  ),
]

const scrollbarOptions = [
  defineRangeOption(
    'minThumbSize',
    'The minimum size of the thumb.',
    20,
    500,
    1,
    100,
    'px',
  ),
]

const wheelOptions = [
  defineRangeOption(
    'scrollSpeed',
    'The scroll speed multiplicator when using the mouse wheel.',
    0.1,
    2,
    0.01,
    1,
  ),
  defineRangeOption(
    'wheelZoomFactor',
    'How much the artboard should be zoomed using the scroll wheel.',
    0.01,
    2,
    0.01,
    0.8,
  ),
  defineBooleanOption('interceptWheel', 'Intercept all wheel events.', true),
  defineBooleanOption(
    'useMomentumScroll',
    'Apply momentum scrolling when using wheel.',
    true,
  ),
  defineBooleanOption(
    'useMomentumZoom',
    'Apply momentum zooming when using wheel.',
    true,
  ),
]

const mouseOptions = [
  defineBooleanOption(
    'setCursor',
    'Set a dragging cursor on the root element.',
    false,
  ),
  defineBooleanOption(
    'useSpacebar',
    'Only allow dragging while holding the spacebar.',
    false,
  ),
  defineRangeOption(
    'scrollDirectionThreshold',
    'The threshold for detecting the scroll direction.',
    0,
    45,
    1,
    30,
    '°',
  ),
  defineVelocityOption(
    'velocity',
    'Options for the velocity queue to determine momentum direction.',
    {
      maxTimeWindow: 200,
      maxVelocity: 6000,
      minVelocity: 10,
      multiplicator: 1.2,
    },
  ),
]

const domOptions = [
  defineRangeOption(
    'precision',
    'How precise the translate3d() values should be.',
    0.1,
    15,
    0.1,
    1,
  ),
]

const clickZoomOptions = [
  defineAnimationOption('animation', 'The animation to apply when zooming.', {
    duration: 500,
    easing: 'easeInOutExpo',
  }),
]

const touchOptions = [
  defineBooleanOption(
    'twoTouchScrolling',
    'Require two touch points to scroll.',
    true,
  ),
  defineAnimationOption(
    'overscaleAnimation',
    'Options when animating back to within boundaries after overscaling.',
    {
      duration: 300,
      easing: 'easeOutBack',
    },
  ),
  defineVelocityOption(
    'velocity',
    'Options for the velocity queue to determine momentum direction.',
    {
      maxTimeWindow: 210,
      maxVelocity: 5000,
      minVelocity: 20,
      multiplicator: 1.35,
    },
  ),
  defineRangeOption(
    'scrollDirectionThreshold',
    'The threshold for detecting the scroll direction.',
    0,
    45,
    1,
    30,
    '°',
  ),
]

function getBlockingRects(): Rectangle[] {
  return [optionsRect.value, optionsCodeRect.value]
}

const optionsCodeGetBlockingRects = computed(() => {
  return [optionsRect.value, optionsCodeRect.value]
    .map((rect) => {
      const values = [rect.x, rect.y, rect.width, rect.height]
        .map((v) => `<span class="code-value">${v}</span>`)
        .join(', ')
      return `[${values}]`
    })
    .join(',\n    ')
})

const optionsCodeOptions = computed(() => {
  return ''
  // const num = numericInputs
  //   .map((input) => {
  //     return `  <span class="code-property">${input.title}</span>: <span class="code-value">${input.value.value}</span>,`
  //   })
  //   .join('\n')
  //
  // const checkbox = booleanInputs
  //   .map((input) => {
  //     return `  <span class="code-property">${input.title}</span>: <span class="code-value">${input.value.value ? 'true' : 'false'}</span>,`
  //   })
  //   .join('\n')
  //
  // return num + '  \n' + checkbox
})

const optionsCode = computed(() => {
  return `const options: ArtboardOptions = {\n${optionsCodeOptions.value}\n  <span class="code-property">getBlockingRects</span>: () => [\n    ${optionsCodeGetBlockingRects.value}\n  ]\n}`
})

const rootEl = ref<HTMLDivElement>()
const image = ref<HTMLImageElement>()
const scrollbarX = ref<HTMLDivElement>()
const scrollbarY = ref<HTMLDivElement>()

let artboard: Artboard | null = null
let scrollbarPluginX: PluginScrollbar | null = null
let scrollbarPluginY: PluginScrollbar | null = null
let pluginMouse: PluginMouse | null = null
let pluginWheel: PluginWheel | null = null
let pluginTouch: PluginTouch | null = null
let pluginKeyboard: PluginKeyboard | null = null
let pluginDom: PluginDom | null = null
let pluginClickZoom: PluginClickZoom | null = null
let pluginDoubleTapZoom: PluginDoubleTapZoom | null = null

function onWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) {
    return
  }

  e.stopPropagation()
}

onMounted(() => {
  if (!image.value || !rootEl.value) {
    return
  }
  pluginMouse = mouse()
  pluginWheel = wheel()
  pluginTouch = touch()
  pluginKeyboard = keyboard()
  pluginDom = dom({ element: image.value, setInitTransformFromRect: true })
  pluginClickZoom = clickZoom()
  pluginDoubleTapZoom = doubleTapZoom()

  artboard = createArtboard(
    rootEl.value,
    [
      pluginMouse,
      pluginWheel,
      pluginTouch,
      pluginKeyboard,
      pluginDom,
      pluginClickZoom,
      pluginDoubleTapZoom,
      raf(),
    ],
    {
      getBlockingRects,
    },
  )
  if (zoomOverlayEl.value) {
    artboard.addPlugin(
      zoomOverlay({
        element: zoomOverlayEl.value,
      }),
    )
  }
  if (scrollbarX.value) {
    scrollbarPluginX = scrollbar({
      element: scrollbarX.value,
      orientation: 'x',
    })
    artboard.addPlugin(scrollbarPluginX)
  }
  if (scrollbarY.value) {
    scrollbarPluginY = scrollbar({
      element: scrollbarY.value,
      orientation: 'y',
    })
    artboard.addPlugin(scrollbarPluginY)
  }
  isReady.value = true

  console.log(optionsCode.value)
})

onBeforeUnmount(() => {
  if (artboard) {
    artboard.destroy()
  }
})
</script>

<style lang="postcss">
.options-pane {
  border-right: 8px ridge #eee;
  background: #cccccc;
}
</style>
