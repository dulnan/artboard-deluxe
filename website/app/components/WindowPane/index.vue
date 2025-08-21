<template>
  <aside
    v-show="!hidden"
    ref="el"
    class="window blocking-rect"
    :class="[$attrs.class, { 'overflow-hidden': !isOpen }]"
    :style="style"
  >
    <div
      class="cursor-move select-none window-header hidden"
      :class="headerFromXl ? 'xl:flex' : 'lg:flex'"
      @pointerdown="onPointerDown($event, 'move')"
    >
      <SpriteSymbol :name="icon" class="size-[21px] mt-2" />
      <h2>
        {{ title }}
      </h2>
      <div class="window-ridge">
        <hr />
        <hr />
        <hr />
      </div>

      <button @pointerdown.prevent.stop="isOpen = !isOpen" />
    </div>
    <div v-show="isOpen" class="flex-1 relative">
      <div
        class="window-inner absolute top-0 left-0 size-full overflow-auto"
        @wheel="onWheel"
      >
        <slot />
      </div>
    </div>
    <slot name="footer" />

    <div
      v-if="isOpen"
      class="absolute -bottom-4 -right-4 size-24 items-end justify-end p-[6px] cursor-se-resize hidden lg:flex"
      @pointerdown="onPointerDown($event, 'resize')"
    >
      <SpriteSymbol name="resize" class="size-[10px]" />
    </div>
  </aside>

  <Teleport to="body">
    <div
      v-if="interaction"
      class="fixed top-0 left-0 border-black z-[9999999999999] border-dashed border-2 will-change-transform"
      :style="ghostStyle"
    />
  </Teleport>
</template>

<script setup lang="ts">
import type { NuxtSvgSpriteSymbol } from '#nuxt-svg-icon-sprite/runtime'
import type { Rectangle } from 'artboard-deluxe'

const props = defineProps<{
  title: string
  icon: NuxtSvgSpriteSymbol
  hidden?: boolean
  headerFromXl?: boolean
  preventWheel?: boolean
  minWidth: number
  minHeight: number
}>()

const el = ref<HTMLElement | null>(null)

const { isMobile } = useViewport()

type Interaction = 'move' | 'resize'

const isOpen = ref(true)
const interaction = ref<Interaction | null>(null)
const width = ref(0)
const height = ref(0)
const x = ref(0)
const y = ref(0)
const mouseX = ref(0)
const mouseY = ref(0)
const startX = ref(0)
const startY = ref(0)
const hasAdjusted = ref(false)

const rect = computed<Rectangle>(() => {
  return {
    x: Math.round(x.value),
    y: Math.round(y.value),
    width: Math.round(width.value),
    height: isOpen.value ? Math.round(height.value) : 46,
  }
})

const emit = defineEmits<{
  (e: 'rect', rect: Rectangle): void
}>()

watch(rect, function (newRect) {
  emit('rect', newRect)
})

const style = computed(() => {
  if (isMobile.value) {
    return
  }
  if (!hasAdjusted.value) {
    if (!isOpen.value) {
      return {
        height: '46px',
      }
    }

    return {}
  }

  return {
    width: width.value + 'px',
    height: isOpen.value ? height.value + 'px' : '46px',
    transform: `translate(${x.value}px, ${y.value}px)`,
    top: '0px',
    left: '0px',
    bottom: 'auto',
  }
})

const ghostStyle = computed(() => {
  if (interaction.value === 'move') {
    const newX = x.value + (mouseX.value - startX.value)
    const newY = y.value + (mouseY.value - startY.value)
    return {
      width: width.value + 'px',
      height: height.value + 'px',
      cursor: 'move',
      transform: `translate(${newX}px, ${newY}px)`,
    }
  }

  const newWidth = Math.max(
    width.value + (mouseX.value - startX.value),
    props.minWidth,
  )
  const newHeight = Math.max(
    height.value + (mouseY.value - startY.value),
    props.minHeight,
  )

  return {
    width: newWidth + 'px',
    height: newHeight + 'px',
    cursor: 'se-resize',
    transform: `translate(${x.value}px, ${y.value}px)`,
  }
})

function onPointerUp(e: PointerEvent) {
  e.preventDefault()
  e.stopPropagation()
  if (interaction.value === 'move') {
    x.value = x.value + (mouseX.value - startX.value)
    y.value = y.value + (mouseY.value - startY.value)
  } else {
    width.value = Math.max(
      width.value + (mouseX.value - startX.value),
      props.minWidth,
    )
    height.value = Math.max(
      height.value + (mouseY.value - startY.value),
      props.minHeight,
    )
  }
  interaction.value = null

  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)
}

function onPointerMove(e: PointerEvent) {
  e.preventDefault()
  e.stopPropagation()

  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

function setRect() {
  if (!el.value) {
    return
  }
  const rect = el.value.getBoundingClientRect()
  width.value = rect.width
  height.value = rect.height
  x.value = rect.x
  y.value = rect.y
}

function onPointerDown(e: PointerEvent, mode: Interaction) {
  e.preventDefault()
  e.stopPropagation()

  setRect()

  hasAdjusted.value = true

  interaction.value = mode

  startX.value = e.clientX
  startY.value = e.clientY
  mouseX.value = e.clientX
  mouseY.value = e.clientY

  document.addEventListener('pointerup', onPointerUp)
  document.addEventListener('pointermove', onPointerMove)
}

function onWheel(e: WheelEvent) {
  if (!props.preventWheel) {
    return
  }
  if (e.ctrlKey || e.metaKey) {
    return
  }

  e.stopPropagation()
}

onMounted(() => {
  setRect()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerup', onPointerUp)
  document.removeEventListener('pointermove', onPointerMove)
})
</script>

<style lang="postcss">
.vdr {
  @apply fixed top-0 left-0 will-change-transform;
  box-sizing: border-box;
}
.handle {
  box-sizing: border-box;
  position: absolute;
  width: 20px;
  height: 20px;
}
.handle-tl {
  top: -10px;
  left: -10px;
  cursor: nw-resize;
}
.handle-tm {
  top: -10px;
  left: 50%;
  margin-left: -10px;
  cursor: n-resize;
}
.handle-tr {
  top: -10px;
  right: -10px;
  cursor: ne-resize;
}
.handle-ml {
  top: 50%;
  margin-top: -10px;
  left: -10px;
  cursor: w-resize;
}
.handle-mr {
  top: 50%;
  margin-top: -10px;
  right: -10px;
  cursor: e-resize;
}
.handle-bl {
  bottom: -10px;
  left: -10px;
  cursor: sw-resize;
}
.handle-bm {
  bottom: -10px;
  left: 50%;
  margin-left: -10px;
  cursor: s-resize;
}
.handle-br {
  bottom: -10px;
  right: -10px;
  cursor: se-resize;
}
@media only screen and (max-width: 768px) {
  [class*='handle-']:before {
    content: '';
    left: -10px;
    right: -10px;
    bottom: -10px;
    top: -10px;
    position: absolute;
  }
}
</style>
