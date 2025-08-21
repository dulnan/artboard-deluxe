<template>
  <WindowPane
    title="Toolbar"
    class="grid-area-t toolbar lg:fixed lg:top-0 lg:left-0 lg:w-[190px] lg:h-[calc(100vh-140px)] lg:translate-x-40 lg:translate-y-[90px]"
    icon="toolbar"
    :min-width="150"
    :min-height="250"
  >
    <div class="toolbar-buttons overflow-hidden" @wheel="onWheel">
      <button class="button hidden lg:flex" @click="$emit('zoom-out')">
        <SpriteSymbol name="zoom-out" />
        <span>Zoom out</span>
      </button>
      <button class="button hidden lg:flex" @click="$emit('zoom-in')">
        <SpriteSymbol name="zoom-in" />
        <span>Zoom in</span>
      </button>

      <button class="button flex is-active" @click="$emit('reset-zoom')">
        <SpriteSymbol name="reset-zoom" />
        <span>Reset Zoom</span>
      </button>
      <button class="button flex" @click="$emit('scale-to-fit')">
        <SpriteSymbol name="scale-to-fit" />
        <span>Scale to Fit</span>
      </button>
      <button class="button flex" @click="$emit('scroll-into-view')">
        <SpriteSymbol name="scroll-into-view" />
        <span>Scroll into View</span>
      </button>
      <button class="button flex" @click="$emit('erase')">
        <SpriteSymbol name="erase" />
        <span>Erase</span>
      </button>
    </div>

    <template #footer>
      <div>
        <div class="toolbar-colors lg:mt-window size-60 lg:size-auto">
          <ToolbarColor
            v-model="primary"
            name="primary"
            class="col-start-1 row-start-1 z-30"
          />
          <ToolbarColor
            v-model="secondary"
            name="secondary"
            class="col-start-2 row-start-2"
          />
          <button @click="swapColors">
            <SpriteSymbol name="swap" class="size-20 lg:size-24" />
          </button>
          <button @click="randomize">
            <SpriteSymbol name="dice" class="size-20 lg:size-24" />
          </button>
        </div>
      </div>
    </template>
  </WindowPane>
</template>

<script setup lang="ts">
import { useCssVar } from '@vueuse/core'
import { hexToRgb, HTML_COLORS } from '~/helper/colors'

defineEmits([
  'zoom-in',
  'zoom-out',
  'reset-zoom',
  'scale-to-fit',
  'erase',
  'scroll-into-view',
])

const COLORS = Object.entries(HTML_COLORS).map(([name, hex]) => {
  return {
    name,
    rgb: hexToRgb(hex),
  }
})

const primary = useCssVar('--color-primary', null, {
  initialValue: '197 54 9',
})
const secondary = useCssVar('--color-secondary', null, {
  initialValue: '5 53 115',
})

function swapColors() {
  const a = primary.value
  primary.value = secondary.value
  secondary.value = a
}

function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomColor(exclude?: string): string {
  while (true) {
    const color = COLORS[randomInteger(0, COLORS.length - 1)]!.rgb
    if (color !== exclude) {
      return color
    }
  }
}

function randomize() {
  const a = getRandomColor()
  const b = getRandomColor(a)
  primary.value = a
  secondary.value = b
}

function onWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) {
    return
  }

  e.stopPropagation()
}
</script>

<style lang="postcss">
.toolbar {
  container-type: inline-size;
  @apply flex flex-row lg:flex-col gap-window overflow-hidden lg:gap-0;
}
.toolbar-buttons {
  @apply flex gap-4 lg:grid flex-1 lg:gap-8 contain-paint will-change-transform h-full lg:h-auto;

  .button {
    @apply whitespace-nowrap px-8;
    @apply text-lg lg:px-[8px] lg:py-[9px] gap-2 lg:gap-[9px] lg:w-full items-center justify-center;
    font-size: 14px;
    line-height: 10px;
    @apply flex-col flex-1;

    @screen lg {
      font-size: 28px;
      line-height: 28px;
      @apply h-auto w-auto pt-12;
    }

    span {
      @apply mt-[2px];
    }

    svg {
      @apply size-[21px] lg:size-[32px] xl:size-[42px];
      image-rendering: pixelated;
    }
  }

  @container (min-width: 300px) {
    @apply grid-cols-2;
  }

  @container (min-width: 450px) {
    @apply grid-cols-3;
  }

  @container (min-width: 600px) {
    @apply grid-cols-4;
  }

  @container (min-width: 750px) {
    @apply grid-cols-5;
  }

  @container (min-width: 900px) {
    @apply grid-cols-6;
  }
}

.toolbar-colors {
  @apply inline-grid;
  grid-template-columns: repeat(3, 20px);
  grid-template-rows: repeat(3, 20px);
  @screen lg {
    grid-template-columns: repeat(3, 24px);
    grid-template-rows: repeat(3, 24px);
  }
}

.toolbar {
  /* @apply flex items-center md:block flex-1 w-full gap-window md:gap-0; */
}
</style>
