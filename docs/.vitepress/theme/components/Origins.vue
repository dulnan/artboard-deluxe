<template>
  <div class="origins">
    <div class="origins-form">
      <label>
        <div>Position</div>
        <select v-model="position">
          <option
            v-for="origin in origins"
            :value="origin"
            :key="'position' + origin"
          >
            {{ origin }}
          </option>
        </select>
      </label>
      <label>
        <div>Position</div>
        <select v-model="origin">
          <option
            v-for="origin in origins"
            :value="origin"
            :key="'position' + origin"
          >
            {{ origin }}
          </option>
        </select>
      </label>
    </div>
    <div class="origins-root">
      <div class="origins-artboard">
        <div>This is the artboard</div>
        <div class="origins-overlay">Overlay</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const origins = [
  'top-left',
  'center-left',
  'bottom-left',
  'top-center',
  'center-center',
  'bottom-center',
  'top-right',
  'center-right',
  'bottom-right',
] as const

type Origin = (typeof origins)[number]

const position = ref<Origin>('top-left')
const origin = ref<Origin>('top-left')

const style = computed(() => {
  const styles: Record<string, string> = {}

  switch (position.value) {
    case 'top-right':
      styles.top = '0px'
      styles.right = '0px'
    case 'top-left':
      styles.top = '0px'
      styles.left = '0px'
  }

  return styles
})
</script>

<style lang="postcss">
.origins {
}
.origins-root {
  background: var(--vp-c-bg-alt);
  aspect-ratio: 4 / 3;
  position: relative;
}

.origins-artboard {
  position: absolute;
  background: var(--vp-c-divider);
  width: 50%;
  aspect-ratio: inherit;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.origins-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
  margin-bottom: 1rem;
}
.origins-overlay {
  position: absolute;
  background: var(--vp-c-warning-1);
  color: var(--vp-c-warning-3);
  font-weight: bold;
  font-size: 1.25rem;
  padding: 0.5rem;
}
</style>
