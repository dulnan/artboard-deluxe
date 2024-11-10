<template>
  <div class="scrollbar" :class="'is-' + orientation">
    <button class="scrollbar-page-up" @click="$emit('up')">
      <div class="scrollbar-button-inner">
        <div class="scrollbar-button-inner-border" />
        <div class="scrollbar-button-inner-border" />
      </div>
    </button>
    <div
      ref="el"
      class="scrollbar-inner"
      :class="'is-' + orientation"
      @touchstart.prevent
    >
      <button :class="'is-' + orientation" class="artboard-thumb">
        <div class="scrollbar-button-inner">
          <div class="scrollbar-button-inner-border" />
          <div class="scrollbar-button-inner-border" />
        </div>
        <div class="scrollbar-button-grab" :class="'is-' + orientation">
          <div />
          <div />
          <div />
          <div />
        </div>
      </button>
    </div>
    <button class="scrollbar-page-down" @click="$emit('down')">
      <div class="scrollbar-button-inner">
        <div class="scrollbar-button-inner-border" />
        <div class="scrollbar-button-inner-border" />
      </div>
    </button>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  orientation: 'x' | 'y'
}>()

defineEmits(['up', 'down'])

const el = ref<HTMLElement | null>(null)

function getElement() {
  return el.value
}

defineExpose({ getElement })
</script>

<style lang="postcss">
.scrollbar {
  @apply grid border border-black;
  --button-border-size: 2px;

  &.is-x {
    @apply grid-cols-[auto_1fr_auto];
    border-bottom: 0;
    margin-left: -1px;
    margin-right: -1px;

    > button:first-child {
      @apply border-r border-r-black;
      &:before {
        @apply -rotate-90;
      }
    }

    > button:last-child {
      @apply border-l border-l-black;
      &:before {
        @apply rotate-90;
      }
    }
  }

  &.is-y {
    @apply grid-rows-[auto_1fr_auto];
    margin-top: -1px;
    margin-bottom: -1px;

    > button:first-child {
      @apply border-b border-b-black;
    }

    > button:last-child {
      @apply border-t border-t-black;
      &:before {
        @apply rotate-180;
      }
    }
  }

  > button {
    @apply relative;
    background: #e3e2e0;
    height: var(--scrollbar-size-px);
    width: var(--scrollbar-size-px);
    box-sizing: content-box;

    &:active {
      .scrollbar-button-inner {
        @apply rotate-180 bg-black/5;
      }
    }

    &:before {
      content: '';
      background-image: url('~/assets/icons/scrollbar-caret.svg');
      background-size: 100% 100%;
      @apply absolute top-0 left-0 size-full z-[5000];
    }
  }
}

.scrollbar-inner {
  @apply relative transition overflow-hidden z-[1000];
  background: #b7b7b7;
  contain: strict;
  box-shadow: 2px 2px 2px inset rgba(0, 0, 0, 0.2);
  .artboard-thumb {
    @apply block;
    @apply bg-primary;
    will-change: height, width, transform;
    /* @apply bg-secondary; */

    &.is-x {
      @apply border-x border-x-black;
      box-shadow: 2px 0px 2px rgba(0, 0, 0, 0.2);
    }

    &.is-y {
      @apply border-y border-y-black;
      box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
    }

    &:before {
      content: '';
    }

    @apply flex items-center justify-center;

    .scrollbar-button-grab {
      @apply w-[14px] grid gap-3 relative z-50;

      > div {
        @apply h-[1.5px] bg-white/70;
        box-shadow: 1px 1px 0 0px rgba(0, 0, 0, 0.7);
        border-left: 2px solid white;
      }

      &.is-x {
        @apply rotate-90;
      }
    }

    .scrollbar-button-inner {
      @apply bg-white/20;
    }
  }

  &.is-y {
    width: var(--scrollbar-size-px);
    top: 0;
    bottom: 0;
    right: 0;

    button {
      @apply w-full;
    }
  }

  &.is-x {
    height: var(--scrollbar-size-px);
    left: 0;
    right: 0;
    bottom: 0;
    button {
      @apply h-full;
    }
  }
}

.scrollbar-button-inner {
  @apply absolute size-full top-0 left-0 z-10;
}
.scrollbar-button-inner-border {
  @apply absolute size-full top-0 left-0 z-40;

  &:before,
  &:after {
    content: '';
    @apply absolute;
  }

  &:first-child {
    &:before,
    &:after {
      @apply top-0 left-0 bg-white/70;
    }
    &:before {
      width: 100%;
      height: var(--button-border-size);
    }

    &:after {
      width: var(--button-border-size);
      height: 100%;
    }
  }

  &:last-child {
    &:before,
    &:after {
      @apply bottom-0 right-0 bg-black/20;
    }
    &:before {
      width: 100%;
      height: var(--button-border-size);
    }

    &:after {
      width: var(--button-border-size);
      height: 100%;
    }
  }
}
</style>
