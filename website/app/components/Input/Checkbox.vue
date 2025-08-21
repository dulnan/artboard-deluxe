<template>
  <label class="block clear-both">
    <div class="text-[24px] leading-[20px]">
      <div class="checkbox float-right">
        <input :id="id" v-model.lazy="value" :name="id" type="checkbox" />
        <SpriteSymbol name="check" />
      </div>
      <div class="font-bold">{{ title }}</div>
      <div>{{ description }}</div>
    </div>
  </label>
</template>

<script lang="ts" setup>
const props = defineProps<{
  type: string
  title: string
  description: string
  defaultValue: boolean
}>()

const value = ref(props.defaultValue)

const emit = defineEmits<{
  (e: 'update', value: boolean): void
}>()

watch(value, function (newValue) {
  emit('update', newValue)
})

const id = useId()
</script>

<style lang="postcss">
.checkbox {
  @apply relative;
  input {
    @apply appearance-none size-24 bg-white;

    @apply bg-white;
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

  svg {
    @apply absolute top-0 left-0 size-full hidden;
  }

  input:checked + svg {
    @apply block;
  }
}
</style>
