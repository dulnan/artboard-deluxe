<template>
  <div class="input-color col-span-2 row-span-2 relative">
    <label
      class="size-full block cursor-pointer"
      :style="{
        background: inputValue,
      }"
    >
      <input
        v-model="inputValue"
        type="color"
        class="appearance-none border-none outline-none shadow-none opacity-0 absolute top-0 left-0 cursor-pointer"
      />
    </label>
  </div>
</template>

<script lang="ts" setup>
import { hexToRgb, rgbToHex } from '~/helper/colors'

const value = defineModel<string | undefined | null>({
  default: '',
})

const inputValue = computed({
  get() {
    return rgbToHex(value.value || '')
  },
  set(v: string) {
    value.value = hexToRgb(v)
  },
})
</script>

<style lang="postcss">
.input-color {
  border: var(--window-border-size) solid black;
  box-shadow:
    calc(var(--window-border-size) * -1) 0 0px 0px #acacac,
    calc(var(--window-border-size) * -1) calc(var(--window-border-size) * -1)
      0px 0px #acacac,
    0 calc(var(--window-border-size) * -1) 0px 0px #acacac,
    0 var(--window-border-size) 0px 0px white,
    var(--window-border-size) 0 0px 0px white,
    var(--window-border-size) var(--window-border-size) 0px 0px white;

  label {
    @apply border-[2px] border-white;
  }
}
</style>
