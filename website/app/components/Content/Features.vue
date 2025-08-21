<template>
  <section class="section py-0">
    <h2>Features</h2>

    <ul class="grid grid-cols-3 gap-32">
      <li v-for="feature in features" :key="feature.title" class="flex gap-16">
        <div
          class="size-80 shrink-0 feature-icon flex items-center justify-center bg-secondary/90 text-white"
        >
          <SpriteSymbol :name="feature.icon" class="size-[42px]" />
        </div>
        <div>
          <h3 class="text-xl font-bold">{{ feature.title }}</h3>
          <p class="text-xl">{{ feature.text }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<script lang="ts" setup>
import type { NuxtSvgSpriteSymbol } from '#nuxt-svg-icon-sprite/runtime'

type Feature = {
  title: string
  text: string
  icon: NuxtSvgSpriteSymbol
}

const features: Feature[] = [
  {
    title: 'Dragging',
    text: 'Drag by pressing Space and clicking or using touch gestures.',
    icon: 'pinch-to-zoom',
  },
  {
    title: 'Zooming',
    text: 'Ctrl/Cmd + scroll wheel to zoom or pinch with two fingers.',
    icon: 'zooming',
  },
  {
    title: 'Keyboard',
    text: 'Use keyboard shortcuts to interact with the artboard.',
    icon: 'keyboard',
  },
  {
    title: 'Animation',
    text: 'Unobtrusive smooth animations to help navigating.',
    icon: 'camera',
  },
  {
    title: 'Performance',
    text: 'Uses CSS transforms, animation loops and passive listeners.',
    icon: 'performance',
  },
  {
    title: 'Modular',
    text: 'Plugins for mouse, touch or wheel interaction.',
    icon: 'island',
  },
]
</script>

<style lang="postcss">
.feature-title {
  font-size: 56px;
  line-height: 56px;
  font-weight: bold;
  font-kerning: none;
}

.feature-icon {
  mask-image: url('~/assets/background-feature.png');
}
</style>
