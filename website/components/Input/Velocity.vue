<template>
  <div>
    <div class="text-[24px] leading-[20px]">
      <div class="font-bold">{{ title }}</div>
      <div>{{ description }}</div>

      <div>
        <InputRange
          title="velocity.maxTimeWindow"
          description="The time window to use to determine the velocity."
          :default-value="maxTimeWindow"
          min="50"
          max="1000"
          step="10"
          suffix="ms"
          class="mt-16"
          @update="maxTimeWindow = $event"
        />

        <InputRange
          title="velocity.minVelocity"
          :default-value="minVelocity"
          description="The minimum velocity required to trigger momentum scrolling."
          min="50"
          max="5000"
          step="10"
          suffix="px/s"
          class="mt-16"
          @update="minVelocity = $event"
        />

        <InputRange
          title="velocity.maxVelocity"
          description="The maximum velocity to use."
          :default-value="maxVelocity"
          min="1000"
          max="20000"
          step="10"
          suffix="px/s"
          class="mt-16"
          @update="maxVelocity = $event"
        />

        <InputRange
          title="velocity.multiplicator"
          description="The multiplicator to apply on the final velocity."
          :default-value="multiplicator"
          min="1"
          max="10"
          step="0.01"
          class="mt-16"
          @update="multiplicator = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VelocityQueueOptions } from '../../../src/helpers/queue'

const props = defineProps<{
  type: string
  title: string
  description: string
  defaultValue: Required<VelocityQueueOptions>
}>()

const maxTimeWindow = ref(props.defaultValue.maxTimeWindow)
const minVelocity = ref(props.defaultValue.minVelocity)
const maxVelocity = ref(props.defaultValue.maxVelocity)
const multiplicator = ref(props.defaultValue.multiplicator)

const emit = defineEmits<{
  (e: 'update', value: Required<VelocityQueueOptions>): void
}>()

const animationOptions = computed<Required<VelocityQueueOptions>>(() => {
  return {
    maxTimeWindow: maxTimeWindow.value,
    minVelocity: minVelocity.value,
    maxVelocity: maxVelocity.value,
    multiplicator: multiplicator.value,
  }
})

watch(animationOptions, function (newValue) {
  emit('update', newValue)
})
</script>
