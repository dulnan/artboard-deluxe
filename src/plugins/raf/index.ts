import { defineArtboardPlugin } from '../defineArtboardPlugin'

/**
 * Registers a requestAnimationFrame callback for the artboard.
 */
export const raf = defineArtboardPlugin<{
  /**
   * Cap the frame rate to the given value (e.g. 30, 60, 120).
   *
   * When set, artboard.loop() is only called when the elapsed time since the
   * last frame exceeds the target interval. Useful for debugging frame-rate
   * dependent behavior.
   *
   * When not set, artboard.loop() is called on every animation frame.
   */
  fps?: number
}>(function (artboard, options) {
  let rafId: number | null = null
  const fpsInterval = options.computed((opts) =>
    opts?.fps ? 1000 / opts.fps : 0,
  )
  let lastTime = 0

  function loop(currentTime: number) {
    const interval = fpsInterval.value
    if (interval) {
      if (currentTime - lastTime >= interval) {
        lastTime = currentTime - ((currentTime - lastTime) % interval)
        artboard.loop(currentTime)
      }
    } else {
      artboard.loop(currentTime)
    }
    rafId = window.requestAnimationFrame(loop)
  }

  function destroy() {
    if (rafId) {
      window.cancelAnimationFrame(rafId)
    }
  }

  rafId = window.requestAnimationFrame(loop)

  return {
    options,
    destroy,
  }
})
