<template>
  <section class="section pb-0 relative z-50">
    <div class="grid grid-cols-3 gap-32">
      <div
        v-for="(image, i) in images"
        :key="i"
        class="bg-secondary aspect-[4/3] image-icon flex items-center justify-center"
      >
        <img :src="image" class="size-full image-pixelated" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ImageScrollbar from '~/assets/images/plugin-scrollbar.png'
import ImageOverview from '~/assets/images/plugin-overview.png'
import ImageKeyboard from '~/assets/images/plugin-keyboard.png'

const images = [ImageScrollbar, ImageOverview, ImageKeyboard]
</script>

<style lang="postcss">
.image-icon {
  mask-image: url('~/assets/mask-plugin.png');
  mask-size: 100% 100%;
}
</style>
