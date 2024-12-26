<template>
  <div class="relative bg-silver h-full overflow-hidden">
    <div ref="rootEl" class="relative h-full">
      <div>
        <button @click="hasMargin = !hasMargin" class="button text-xl">
          Toggle Margin
        </button>
      </div>
      <div
        ref="artboardEl"
        class="w-[1200px] h-[800px] bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 outline outline-black"
      >
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-1 bg-black h-full"
        />
        <div
          class="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-black w-full"
        />
      </div>
      <template v-for="position in origins" :key="position">
        <div
          v-for="origin in origins"
          :id="'direction-' + position + '-' + origin"
          :key="position + origin"
          class="page-sticky-box"
        >
          <div>
            <div>
              <span>position:</span><span>{{ position }}</span>
            </div>
            <div>
              <span>origin:</span><span>{{ origin }}</span>
            </div>
          </div>
        </div>
      </template>

      <div
        v-for="origin in origins"
        :id="'manual-' + origin"
        :key="'manual-' + origin"
        class="page-sticky-box"
      >
        <div>
          <div><span>position:</span><span>{x:200, y:200}</span></div>
          <div>
            <span>origin:</span><span>{{ origin }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  createArtboard,
  mouse,
  wheel,
  dom,
  raf,
  sticky,
  keyboard,
  type Artboard,
  type PluginSticky,
} from 'artboard-deluxe'
import type { Origin } from '../../src/types/geometry'

const rootEl = ref<HTMLDivElement>()
const artboardEl = ref<HTMLDivElement>()

let artboard: Artboard | null = null

const origins: Origin[] = [
  'top-left',
  'center-left',
  'bottom-left',
  'top-center',
  'center-center',
  'bottom-center',
  'top-right',
  'center-right',
  'bottom-right',
]

const hasMargin = ref(false)

const plugins: PluginSticky[] = []

watch(hasMargin, (value) => {
  plugins.forEach((plugin) => {
    plugin.options.set('margin', value ? 30 : 0)
  })
})

onMounted(() => {
  if (!rootEl.value || !artboardEl.value) {
    return
  }
  artboard = createArtboard(rootEl.value, [
    mouse(),
    wheel({
      useMomentumZoom: true,
      useMomentumScroll: true,
    }),
    raf(),
    keyboard(),
    dom({
      element: artboardEl.value,
      setInitTransformFromRect: true,
      precision: 1,
    }),
  ])

  origins.forEach((origin) => {
    origins.forEach((position) => {
      const el = document.getElementById('direction-' + position + '-' + origin)
      if (!el) {
        return
      }

      const plugin = sticky({
        element: el,
        position,
        origin,
        keepVisible: true,
        precision: 1,
        margin: 0,
      })
      artboard?.addPlugin(plugin)
      plugins.push(plugin)
    })

    const el = document.getElementById('manual-' + origin)
    if (!el) {
      return
    }

    const plugin = sticky({
      element: el,
      position: { x: 200, y: 200 },
      origin,
      keepVisible: true,
      precision: 1,
      margin: 0,
    })
    artboard?.addPlugin(plugin)
    plugins.push(plugin)
  })
})

onBeforeUnmount(() => {
  if (artboard) {
    artboard.destroy()
  }
})
</script>

<style lang="postcss">
.page-sticky-box {
  @apply absolute hover:z-50 will-change-transform;
  width: 280px;

  &:hover {
    > div {
      @apply text-white bg-orange  border-orange scale-125;
    }
  }

  > div {
    transform-origin: inherit;
    @apply text-transparent px-12 font-mono py-4 border border-gray-700/20 pointer-events-none;
    @apply transition;
    > div {
      @apply flex justify-between;
    }
  }
}
</style>
