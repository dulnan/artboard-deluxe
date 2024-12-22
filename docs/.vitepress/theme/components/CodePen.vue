<template>
  <iframe
    height="800"
    style="width: 100%"
    scrolling="no"
    title="Untitled"
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
