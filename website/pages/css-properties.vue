<template>
  <div
    ref="rootEl"
    class="relative bg-black overflow-hidden css-properties-root size-full"
    :style="{
      '--total-planets': TOTAL,
      '--width': width,
      '--height': height,
      '--size': size,
    }"
  >
    <div class="bg-black absolute top-0 left-0 size-full inner">
      <div
        v-for="n in TOTAL"
        :key="'planet-' + n"
        class="planet"
        :class="'is-' + (n - 1)"
        :style="{
          '--index': n - 1,
        }"
      />
    </div>
    <!-- <div -->
    <!--   class="absolute top-0 left-0 overlay bg-blue text-white font-bold text-3xl px-12 leading-none py-4 flex items-center justify-center" -->
    <!-- > -->
    <!--   <span -->
    <!--     >Inifinite mode using var(--artboard-offset-x), var(--artboard-offset-y) -->
    <!--     and var(--artboard-scale) only.</span -->
    <!--   > -->
    <!-- </div> -->
  </div>
</template>

<script setup lang="ts">
import { useRafFn } from '@vueuse/core'
import {
  createArtboard,
  mouse,
  wheel,
  touch,
  raf,
  keyboard,
  cssProperties,
  type Artboard,
} from 'artboard-deluxe'

const rootEl = ref<HTMLDivElement>()

const TOTAL = 60

const width = ref(1200)
const height = ref(1200)
const artboardScale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)

const size = computed(() => {
  return width.value / 8
})

let artboard: Artboard | null = null

useRafFn(() => {
  if (!artboard) {
    return
  }

  const offset = artboard.getOffset()
  const scale = artboard.getScale()
  offsetX.value = offset.x
  offsetY.value = offset.y
  artboardScale.value = scale
})

onMounted(() => {
  if (!rootEl.value) {
    return
  }

  const rect = rootEl.value.getBoundingClientRect()
  width.value = Math.round(rect.width)
  height.value = Math.round(rect.height)

  artboard = createArtboard(
    rootEl.value,
    [
      mouse(),
      wheel({
        useMomentumZoom: true,
        useMomentumScroll: true,
        interceptWheel: true,
      }),
      touch(),
      raf(),
      keyboard(),
      cssProperties({
        unitless: true,
        precision: 1,
      }),
    ],
    {
      maxScale: 20,
      minScale: 1,
    },
  )
})

onBeforeUnmount(() => {
  if (artboard) {
    artboard.destroy()
  }
})
</script>

<style lang="postcss" scoped>
.css-properties-root {
  --artboard-offset-x: 0px;
  --artboard-offset-y: 0px;
  --artboard-scale: 1;

  > div.inner {
    filter: blur(5vw) contrast(200%);
  }
}

.planet {
  @apply absolute top-0 left-0;
  width: calc(var(--size) * 1px);
  height: calc(var(--size) * 1px);
  image-rendering: pixelated;
  border-radius: 100%;

  --alpha: sqrt(2);
  --beta: sqrt(3);
  --size-scaled: calc(var(--size) * var(--artboard-scale) * 1.25);

  --base-y: calc(
    mod(var(--index) * var(--beta), 1) * var(--width) * var(--artboard-scale)
  );
  --progress-y: calc(
    var(--artboard-offset-y) + var(--size-scaled) + var(--base-y)
  );
  --max-y: calc((var(--height) + var(--size)) * var(--artboard-scale));
  --py: calc(var(--progress-y) / var(--max-y));
  --wraps-y: calc(round(down, var(--py), 1));

  --variation-x: calc(
    sin((var(--wraps-y) * var(--index)) * 13348) * var(--width) *
      var(--artboard-scale)
  );

  --base-x: calc(
    mod(var(--index) * var(--alpha), 1) * var(--width) * var(--artboard-scale)
  );
  --progress-x: calc(
    var(--artboard-offset-x) + var(--size-scaled) + var(--base-x) +
      var(--variation-x)
  );
  --max-x: calc((var(--width) + var(--size)) * var(--artboard-scale));

  --translate-x: calc(
    mod(var(--progress-x), var(--max-x)) - var(--size-scaled)
  );

  --translate-y: calc(
    mod(var(--progress-y), var(--max-y)) - var(--size-scaled)
  );

  --r: calc((sin(var(--wraps-y) * 9283 + var(--index) * 3001) + 1) * 127.5);
  --g: calc((sin(var(--wraps-y) * 5921 + var(--index) * 3121) + 1) * 127.5);
  --b: calc((sin(var(--wraps-y) * 3919 + var(--index) * 2237) + 1) * 127.5);

  background: rgb(var(--r) var(--g) var(--b));

  transform: translate(
      calc(var(--translate-x) * 1px),
      calc(var(--translate-y) * 1px)
    )
    scale(calc(var(--artboard-scale)));
  transform-origin: top left;
}
</style>
