<template>
  <header class="relative">
    <div
      class="relative bg-gradient-to-l from-primary to-secondary content-header-image pointer-events-none select-none"
    >
      <img
        src="~/assets/images/header.png"
        class="image-pixelated relative w-full mix-blend-luminosity"
        width="1408"
        height="736"
      />
    </div>
    <div class="section pt-0 z-30 relative mt-[-160px]">
      <h1 class="text-5xl font-alliance">
        <span class="text-primary">Artboard</span>
        <span class="text-secondary">Deluxe</span>
        <sup class="text-[24px] font-sans font-bold top-[-79px]"
          >v{{ config.public.version }}</sup
        >
      </h1>
      <div class="h-64 flex items-center w-[700px]">
        <p class="text-3xl font-serif text-stone-700">
          Drag, zoom, scroll any DOM element or canvas.
        </p>
      </div>

      <div class="mt-64">
        <ul class="flex gap-32 text-xl">
          <li>
            <a class="link" href="https://www.github.com/dulnan/artboard-deluxe"
              >GitHub</a
            >
          </li>
          <li>
            <a class="link" href="https://www.npmjs.com/package/artboard-deluxe"
              >NPM</a
            >
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig()
</script>

<style lang="postcss">
.content-header-image {
  &:after {
    content: '';
    @apply absolute bottom-[-12px] left-0 w-full h-24 bg-white z-10;
  }
}
</style>
