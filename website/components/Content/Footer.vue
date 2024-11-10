<template>
  <footer class="mt-[-160px] relative z-10 pointer-events-none select-none">
    <div
      class="bg-gradient-to-tr from-primary to-secondary overflow-hidden content-footer-image"
    >
      <img
        src="~/assets/images/footer.png"
        class="w-full image-pixelated mix-blend-luminosity"
      />
    </div>
  </footer>
</template>

<style lang="postcss">
.content-footer-image {
  &:after {
    content: '';
    @apply absolute top-[-12px] left-0 w-full h-24 bg-white z-10;
  }
}
</style>
