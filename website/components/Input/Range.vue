<template>
  <label class="block">
    <div class="text-[24px] leading-[20px] mb-16">
      <div class="float-right font-mono text-[13.5px] mt-px leading-none">
        {{ valueFormatted }}
      </div>
      <div class="font-bold">{{ title }}</div>
      <div v-if="description" class="mt-3">{{ description }}</div>
    </div>
    <input
      :id="id"
      v-model.number="value"
      :name="id"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      class="w-full"
    />
  </label>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    defaultValue: number
    max: string | number
    min?: string | number
    step?: string | number
    suffix?: string
  }>(),
  {
    min: '0',
    step: '0.01',
    suffix: '',
    description: '',
  },
)

const emit = defineEmits<{
  (e: 'update', value: number): void
}>()

const value = ref(props.defaultValue)

watch(value, function (newValue) {
  emit('update', newValue)
})

const valueFormatted = computed(() => {
  const decimalPoints = props.step.toString().split('.')[1]?.length || 0
  return (value.value || 0).toFixed(decimalPoints) + props.suffix
})

const id = useId()
</script>

<style lang="postcss">
input[type='range'] {
  @apply appearance-none;

  &::-webkit-slider-thumb {
    @apply appearance-none cursor-ew-resize;
    height: 24px;
    width: 24px;
    @apply bg-secondary;

    border-radius: 0px;
    border: 1px solid rgba(0, 0, 0, 0.1);

    --bs: 0.5px;

    --bs-1: var(--bs);
    --bs-1n: calc(var(--bs) * -1);
    --bs-2: calc(var(--bs) * 2);
    --bs-2n: calc(var(--bs) * -3);

    box-shadow:
      inset var(--bs-1n) var(--bs-1n) 0 var(--bs-1) rgba(0, 0, 0, 0.1),
      inset var(--bs-2n) var(--bs-2n) 0 var(--bs-2) rgba(0, 0, 0, 0.1),
      inset var(--bs-1) var(--bs-1) 0 var(--bs-1) rgba(0, 0, 0, 0.1),
      inset var(--bs-2) var(--bs-2) 0 var(--bs-2) white;

    &:active {
      box-shadow:
        inset var(--bs-1) var(--bs-1) 0 var(--bs-1) rgba(0, 0, 0, 0.1),
        inset var(--bs-2) var(--bs-2) 0 var(--bs-2) rgba(0, 0, 0, 0.1),
        inset var(--bs-1n) var(--bs-1n) 0 var(--bs-1) white,
        inset var(--bs-2n) var(--bs-2n) 0 var(--bs-2) rgba(255, 255, 255, 0.4);
    }

    @screen md {
      --bs: 0.5px;
    }
  }
  &::-webkit-slider-runnable-track {
    @apply appearance-none;
    @apply bg-silver;
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
}
</style>
