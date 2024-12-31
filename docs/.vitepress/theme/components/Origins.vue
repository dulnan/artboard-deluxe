<template>
  <div class="origins">
    <div class="origins-form">
      <label>
        <div>position</div>
        <select v-model="position">
          <option v-for="v in origins" :value="v" :key="'position' + v">
            {{ v }}
          </option>
        </select>
      </label>
      <label>
        <div>origin</div>
        <select v-model="origin">
          <option v-for="v in origins" :value="v" :key="'position' + v">
            {{ v }}
          </option>
        </select>
      </label>
    </div>
    <div class="origins-root">
      <div class="origins-artboard" :class="classes">
        <div class="origins-overlay-wrapper">
          <div class="origins-overlay" :style="style">Overlay</div>
        </div>

        <div class="origins-artboard-label">Artboard</div>
        <div class="origins-root-x" />
        <div class="origins-root-y" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { parseOrigin } from './../../../../src/helpers'

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

const classes = computed(() => {
  const parts = position.value.split('-')
  return ['is-y-' + parts[0], 'is-x-' + parts[1]]
})

const style = computed(() => {
  const parsed = parseOrigin(origin.value)

  const x = parsed.x * -100 + '%'
  const y = parsed.y * -100 + '%'

  return {
    transform: `translate(${x}, ${y})`,
  }
})
</script>

<style lang="postcss">
.origins-root {
  background: var(--vp-c-bg-alt);
  aspect-ratio: 4 / 3;
  outline: 1px solid var(--vp-c-border);
  position: relative;
  --width: 8rem;
  --height: 3rem;
}

.origins-artboard {
  position: absolute;
  background: var(--vp-c-divider);
  width: calc(100% - var(--width) * 2);
  height: calc(100% - var(--height) * 2);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  outline: 1px solid var(--vp-c-border);
  z-index: 50;

  &.is-y-top {
    align-items: flex-start;
  }
  &.is-y-center {
    align-items: center;
  }
  &.is-y-bottom {
    align-items: flex-end;
  }
  &.is-x-left {
    justify-content: flex-start;
  }
  &.is-x-right {
    justify-content: flex-end;
  }
  &.is-x-center {
    justify-content: center;
  }
}

.origins-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
  margin-bottom: 1rem;

  select {
    appearance: auto;
    width: 100%;
    padding: 0.5rem;
    font-size: 1.25rem;
  }

  label {
    > div {
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
  }
}
.origins-overlay {
  position: relative;
  background: var(--vp-c-warning-1);
  color: var(--vp-c-warning-3);
  font-weight: bold;
  font-size: 1.25rem;
  width: var(--width);
  height: var(--height);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.origins-artboard-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 40;
  text-transform: uppercase;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 2px;
  background: var(--vp-c-divider);
}

.origins-overlay-wrapper {
  width: 0px;
  height: 0px;
  position: relative;
}

.origins-root-x,
.origins-root-y {
  position: absolute;
}

.origins-root-x {
  width: calc(100% + var(--width) * 2);
  left: calc(var(--width) * -1);
  height: 1px;
  background: var(--vp-c-border);
  top: 50%;
  z-index: 10;
}

.origins-root-y {
  height: calc(100% + var(--height) * 2);
  top: calc(var(--height) * -1);
  width: 1px;
  background: var(--vp-c-border);
  left: 50%;
  z-index: 10;
}
</style>
