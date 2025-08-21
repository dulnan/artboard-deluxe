import { useWindowSize } from '@vueuse/core'

export default function () {
  const { width } = useWindowSize()

  const isMobile = computed(() => {
    return width.value < 1024
  })

  return { isMobile }
}
