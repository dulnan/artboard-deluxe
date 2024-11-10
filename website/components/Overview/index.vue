<template>
  <WindowPane
    ref="component"
    title="Overview"
    class="fixed bottom-[113px] right-44 size-[150px] z-[999999999] lg:size-[200px] lg:bottom-[48px] xl:size-[400px] 2xl:bottom-44 hidden 2xl:flex"
    icon="overview"
    :min-width="200"
    :min-height="200"
    header-from-xl
    :class="{
      '!flex': isVisible,
    }"
  >
    <div
      ref="el"
      class="plugin-overview relative bg-silver border border-black overflow-hidden contain-strict size-full"
    >
      <div
        ref="artboard"
        class="artboard-overview-artboard bg-white outline-black outline-1 outline"
      >
        <slot :width="size.width" :height="size.height">
          <Content
            class="origin-top-left h-[4950px] w-[var(--artboard-size-px)]"
            :style="{
              transform: `scale(calc(${size.width.value} / var(--artboard-size))`,
            }"
          >
            <div id="overview-canvas" ref="overviewCanvas" class="relative" />
          </Content>
        </slot>
      </div>
      <div
        class="absolute top-0 left-0 size-full bg-black/50 mix-blend-multiply"
      >
        <button
          class="artboard-overview-visible bg-white will-change-transform"
        />
      </div>
    </div>
  </WindowPane>
  <div class="grid-area-o relative z-50 2xl:hidden">
    <button
      class="size-full flex items-center justify-center button border-b-0"
      @click="isVisible = !isVisible"
    >
      <SpriteSymbol name="overview" class="size-[21px]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'

const artboard = ref<HTMLElement | null>(null)
const overviewCanvas = ref<HTMLElement | null>(null)

const size = useElementSize(artboard)

const isVisible = ref(false)

const el = ref<HTMLElement | null>(null)

function getElement(): HTMLElement | null {
  return el.value
}
function getOverviewCanvas(): HTMLElement | null {
  return overviewCanvas.value
}

defineExpose({ getElement, getOverviewCanvas })
</script>
