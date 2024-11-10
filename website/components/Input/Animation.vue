<template>
  <div>
    <div class="text-[24px] leading-[20px]">
      <div class="font-bold">{{ title }}</div>
      <div>{{ description }}</div>

      <div>
        <InputSelect
          title="Easing"
          :default-value="defaultValue.easing as string"
          :options="easingOptions"
          class="mt-16"
          @update="easing = $event"
        />
        <InputRange
          title="Duration"
          :default-value="defaultValue.duration"
          min="50"
          max="2000"
          step="50"
          suffix="ms"
          class="mt-16"
          @update="duration = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnimationOptions } from '../../../src/helpers/animation'
import { EASINGS, type AnimationEasing } from '../../../src/helpers/easing'

const props = defineProps<{
  type: string
  title: string
  description: string
  defaultValue: Required<AnimationOptions>
}>()

const easingOptions = Object.keys(EASINGS)

const easing = ref(props.defaultValue.easing as string)
const duration = ref(props.defaultValue.duration)

const emit = defineEmits<{
  (e: 'update', value: Required<AnimationOptions>): void
}>()

const animationOptions = computed<Required<AnimationOptions>>(() => {
  return {
    easing: easing.value as AnimationEasing,
    duration: duration.value,
  }
})

watch(animationOptions, function (newValue) {
  emit('update', newValue)
})
</script>
