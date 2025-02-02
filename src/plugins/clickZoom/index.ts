import { defineArtboardPlugin } from '../defineArtboardPlugin'
import { getDistance, getEventCoords } from '../../helpers'
import type { Coord } from '../../types/geometry'
import type { AnimationOptions } from '../../helpers/animation'

/**
 * Implements a "click to zoom".
 *
 * Note this plugin only handles click events originating from mouse pointers.
 * For touch devices, use the doubleTapToZoom plugin.
 *
 * @example
 * ```typescript
 * import { createArtboard, clickZoom } from 'artboard-deluxe'
 *
 * const root = document.elementById('root')
 * const artboard = createArtboard(root, [clickZoom()])
 * ```
 */
export const clickZoom = defineArtboardPlugin<{
  animation?: Required<AnimationOptions>
}>(function (artboard, options) {
  const rootEl = artboard.getRootElement()

  let mouseStartCoords: Coord | null = null

  // If the user is or has performed momentum scrolling, return.
  // We have to do that to prevent zooming when the user has performed
  // momentum scrolling and is clicking in order to stop the momentum
  // scrolling.
  function shouldZoom() {
    return !artboard.wasMomentumScrolling()
  }

  function onPointerDown(e: PointerEvent) {
    if (e.pointerType === 'touch') {
      // This plugin only handles mouse events. We can remove all event
      // listeners when the user is using touch input.
      destroy()
      return
    }

    mouseStartCoords = getEventCoords(e)
  }

  function onPointerUp(e: PointerEvent) {
    if (!mouseStartCoords) {
      return
    }

    const distance = getDistance(mouseStartCoords, getEventCoords(e))

    // User has moved the cursor "too much", so don't zoom.
    if (distance > 10) {
      return
    }

    // Check whether we should zoom at all.
    if (!shouldZoom()) {
      return
    }

    doZoom(mouseStartCoords)
  }

  function getTargetScale() {
    const maxScale = artboard.options.maxScale
    const threshold = maxScale * 0.5
    const currentScale = artboard.getFinalScale()

    if (currentScale < 1) {
      return 1
    }
    return currentScale >= threshold ? 1 : maxScale
  }

  function doZoom(coords: Coord) {
    const animation = options.get('animation', {
      duration: 500,
      easing: 'easeInOutExpo',
    })
    artboard.scaleAroundPoint(coords.x, coords.y, getTargetScale(), animation)
  }

  function destroy(): void {
    rootEl.removeEventListener('pointerdown', onPointerDown)
    rootEl.removeEventListener('pointerup', onPointerUp)
  }

  rootEl.addEventListener('pointerdown', onPointerDown)
  rootEl.addEventListener('pointerup', onPointerUp)

  return {
    options,
    destroy,
  }
})
