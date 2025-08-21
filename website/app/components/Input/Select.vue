<template>
  <label class="block">
    <div class="text-[24px] leading-[20px]">
      <div class="font-bold">{{ title }}</div>
      <div v-if="description">{{ description }}</div>
    </div>

    <select v-model="value" class="select mt-8">
      <option
        v-for="option in optionsMapped"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title: string
  description?: string
  defaultValue: string
  options: Record<string, string> | string[]
}>()

const optionsMapped = computed(() => {
  if (Array.isArray(props.options)) {
    return props.options.map((value) => {
      return {
        label: value,
        value,
      }
    })
  }

  return Object.entries(props.options).map(([value, label]) => {
    return {
      value,
      label,
    }
  })
})

const value = ref(props.defaultValue)

const emit = defineEmits<{
  (e: 'update', value: string): void
}>()

watch(value, function (newValue) {
  emit('update', newValue)
})
</script>

<style lang="postcss">
.select {
  @apply appearance-none w-full;
  @apply bg-white h-32 px-8;
  border: var(--window-border-size) solid #454545;
  box-shadow:
    calc(var(--window-border-size) * -1) 0 0px 0px #acacac,
    calc(var(--window-border-size) * -1) calc(var(--window-border-size) * -1)
      0px 0px #acacac,
    0 calc(var(--window-border-size) * -1) 0px 0px #acacac,
    0 var(--window-border-size) 0px 0px white,
    var(--window-border-size) 0 0px 0px white,
    var(--window-border-size) var(--window-border-size) 0px 0px white;
}
</style>
