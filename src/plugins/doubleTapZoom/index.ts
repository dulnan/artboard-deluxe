import { defineArtboardPlugin } from '../defineArtboardPlugin'
import { getDistance, getEventCoords } from '../../helpers'
import type { Coord } from '../../types/geometry'
import type { AnimationOptions } from '../../helpers/animation'

/**
 * Zooms the artboard using a double tap gesture.
 *
 * Note that this plugin only handles touch events. For mouse support, use
 * the clickZoom plugin.
 */
export const doubleTapZoom = defineArtboardPlugin<{
  animation?: AnimationOptions
}>(function (artboard, options) {
  const rootEl = artboard.getRootElement()

  // The timestamp of the last touch event.
  let startTime = 0
  // The artboard offset of the last touch event.
  let startOffset: Coord | null = null

  function onTouchStart(e: TouchEvent) {
    // In case of multi touch, don't do anything so we don't interfer with
    // the pinch gesture.
    if (e.touches.length !== 1) {
      return
    }

    // Calculate the duration between the last two taps.
    const duration = e.timeStamp - startTime

    // Only trigger zoom if the duration is below the given threshold.
    if (duration < 300 && startOffset) {
      // Calculate the distance of the original artboard offset to the
      // current offset. If the distance is below the given threshold,
      // trigger the zoom. We do that because the user may have performed a
      // swipe gesture which resulted in momentum scrolling and then stops the
      // momentum scrolling by tapping once. In this case the duration would
      // be below our threshold. But we don't want to trigger zoom in this
      // case.
      const distance = getDistance(startOffset, artboard.getOffset())
      if (distance < 10) {
        doZoom(getEventCoords(e))
        return
      }
    }

    startTime = e.timeStamp
    startOffset = artboard.getOffset()
  }

  function doZoom(coords: Coord) {
    const currentScale = artboard.getFinalScale()
    const targetScale = currentScale >= 3 ? 1 : 6
    const animation = options.get('animation', {
      duration: 500,
      easing: 'easeInOutExpo',
    })
    artboard.scaleAroundPoint(coords.x, coords.y, targetScale, animation)
  }

  function destroy(): void {
    rootEl.removeEventListener('touchstart', onTouchStart)
  }

  rootEl.addEventListener('touchstart', onTouchStart)

  return {
    destroy,
  }
})
