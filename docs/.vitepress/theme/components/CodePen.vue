<template>
  <iframe
    class="codepen-iframe"
    scrolling="no"
    title="CodePen Example"
    :src="src"
    frameborder="no"
    loading="lazy"
    allowtransparency="true"
    allowfullscreen="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
}>()

const src = computed(() => {
  return `https://codepen.io/dulnan/embed/${props.id}?default-tab=&theme-id=dark`
})
</script>

<style>
.codepen-iframe {
  width: 100%;
  aspect-ratio: 1;
}
</style>
