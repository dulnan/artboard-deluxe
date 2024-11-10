import { defineArtboardPlugin } from '../defineArtboardPlugin'

/**
 * Registers a requestAnimationFrame callback for the artboard.
 */
export const raf = defineArtboardPlugin(function (artboard) {
  let rafId: number | null = null

  function loop(currentTime: number) {
    artboard.loop(currentTime)
    rafId = window.requestAnimationFrame(loop)
  }

  function destroy() {
    if (rafId) {
      window.cancelAnimationFrame(rafId)
    }
  }

  rafId = window.requestAnimationFrame(loop)

  return {
    destroy,
  }
})
