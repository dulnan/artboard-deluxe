<template>
  <div
    class="relative overflow-hidden grid-cols-[1fr_auto] grid-rows-[1fr_auto] grid"
  >
    <div class="relative overflow-hidden bg-silver col-start-1 row-start-1">
      <div
        id="root"
        ref="rootEl"
        class="root absolute overflow-hidden top-0 left-0 size-full"
      >
        <div
          ref="artboardEl"
          class="bg-white absolute origin-top-left artboard overflow-hidden w-[800px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          :class="artboardClass"
        >
          <slot />
        </div>
      </div>
    </div>

    <ScrollbarComponent
      ref="scrollbarY"
      orientation="y"
      class="col-start-2 row-start-1"
      @up="artboard?.scrollUp()"
      @down="artboard?.scrollDown()"
    />
    <ScrollbarComponent
      ref="scrollbarX"
      orientation="x"
      class="row-start-2 col-span-2"
      @up="artboard?.scrollLeft()"
      @down="artboard?.scrollRight()"
    />
  </div>
</template>

<script setup lang="ts">
import {
  dom,
  mouse,
  wheel,
  touch,
  scrollbar,
  keyboard,
  createArtboard,
  raf,
  type Artboard,
} from 'artboard-deluxe'
import ScrollbarComponent from './../components/Scrollbar/index.vue'

defineProps<{
  artboardClass?: string
}>()

const artboardEl = ref<HTMLDivElement>()
const rootEl = ref<HTMLDivElement>()
const scrollbarY = ref<InstanceType<typeof ScrollbarComponent> | null>(null)
const scrollbarX = ref<InstanceType<typeof ScrollbarComponent> | null>(null)

let artboard: Artboard | null = null

onMounted(() => {
  if (!artboardEl.value || !rootEl.value) {
    return
  }

  artboard = createArtboard(rootEl.value, [
    dom({
      element: artboardEl.value,
      setInitTransformFromRect: true,
      applyScalePrecision: false,
    }),
    mouse(),
    wheel({
      interceptWheel: false,
      useMomentumScroll: true,
      useMomentumZoom: true,
    }),
    touch(),
    keyboard(),
    raf(),
  ])
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

onBeforeUnmount(() => {
  if (artboard) {
    artboard.destroy()
  }
})
</script>
