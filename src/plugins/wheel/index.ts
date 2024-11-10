import type { Coord } from '../../types/geometry'
import { defineArtboardPlugin } from '../defineArtboardPlugin'

export const wheel = defineArtboardPlugin<{
  /** The scroll speed when using the mouse wheel. */
  scrollSpeed?: number

  /**
   * If set to true, the wheel event listener for scrolling will be added to
   * the document, preventing any other scrolling from occuring.
   *
   * If this option is set, to enable scrolling for elements that overlay the
   * artboard/root element, you need to manually add a wheel event listener to
   * this element and call event.stopPropagation().
   */
  interceptWheel?: boolean

  /**
   * How much the artboard should be zoomed using the scroll wheel.
   *
   * The higher the value, the more the artboard is zoomed.
   */
  wheelZoomFactor?: number

  /**
   * Enable momentum scrolling when using the scroll wheel.
   */
  useMomentumScroll?: boolean

  /**
   * Enable momentum zooming when using the scroll wheel.
   */
  useMomentumZoom?: boolean
}>(function (artboard, options) {
  const rootEl = artboard.getRootElement()

  function getDelta(e: WheelEvent): Coord {
    if (e.shiftKey) {
      return {
        x: e.deltaY,
        y: 0,
      }
    }

    return {
      x: e.deltaX,
      y: e.deltaY,
    }
  }

  function onWheelRootElement(e: WheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      artboard.cancelAnimation()
      e.preventDefault()
      e.stopPropagation()

      doZoom(e.pageX, e.pageY, e.deltaY * -1)
      return
    }
    const scrollSpeed = options.get('scrollSpeed', 1)

    e.preventDefault()
    e.stopPropagation()
    const delta = getDelta(e)
    if (options.should('useMomentumScroll')) {
      const velocity = artboard.getMomentum() || { x: 0, y: 0 }
      artboard.setInteraction('momentum')
      artboard.setMomentum(
        velocity.x - delta.x * scrollSpeed * 9.6,
        velocity.y - delta.y * scrollSpeed * 9.6,
        0.9,
      )
    } else {
      const offset = artboard.getOffset()
      artboard.cancelAnimation()
      artboard.setInteraction('none')
      artboard.setOffset(
        offset.x + -(delta.x * scrollSpeed),
        offset.y + -(delta.y * scrollSpeed),
        true,
      )
    }
  }

  /**
   * @param x - The x coordinates relative to the page.
   * @param y - The y coordinates relative to the page.
   * @param delta - The amount to zoom.
   */
  function doZoom(x: number, y: number, delta: number) {
    const wheelZoomFactor = options.get('wheelZoomFactor', 1.2)
    const scaleFactor = Math.exp(delta * wheelZoomFactor * 0.0008)
    if (options.should('useMomentumZoom')) {
      const currentTarget =
        artboard.getInteraction() === 'momentumScaling'
          ? artboard.getScaleTarget()
          : undefined

      const newScale =
        (currentTarget?.scale || artboard.getScale()) * scaleFactor

      const offsetToUse = currentTarget
        ? { x: currentTarget.x, y: currentTarget.y }
        : undefined
      const velocity = artboard.calculateScaleAroundPoint(
        x,
        y,
        newScale,
        offsetToUse,
        currentTarget?.scale,
      )
      artboard.setScaleTarget(velocity.x, velocity.y, velocity.scale)
      artboard.setInteraction('momentumScaling')
    } else {
      const newScale = artboard.getScale() * scaleFactor
      artboard.scaleAroundPoint(x, y, newScale)
    }
  }

  function onWheelDocument(e: WheelEvent) {
    if (!options.should('interceptWheel')) {
      return
    }

    onWheelRootElement(e)
  }

  document.addEventListener('wheel', onWheelDocument, {
    passive: false,
  })

  rootEl.addEventListener('wheel', onWheelRootElement, {
    passive: false,
  })

  function destroy() {
    rootEl.removeEventListener('wheel', onWheelRootElement)
    document.removeEventListener('wheel', onWheelDocument)
  }

  return {
    destroy,
  }
})
