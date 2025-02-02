import { isMac } from '../../helpers/userAgent'
import type { Coord } from '../../types/geometry'
import { defineArtboardPlugin } from '../defineArtboardPlugin'

// Reasonable defaults
const MAX_ZOOM_STEP = 10

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
  const IS_MAC = isMac()

  // Adapted from https://stackoverflow.com/a/13650579
  /** @internal */
  function getDelta(event: WheelEvent): Coord & { z: number } {
    let { deltaY, deltaX } = event
    let deltaZ = 0

    // wheeling
    if (event.ctrlKey || event.altKey || event.metaKey) {
      deltaZ =
        (Math.abs(deltaY) > MAX_ZOOM_STEP
          ? MAX_ZOOM_STEP * Math.sign(deltaY)
          : deltaY) / 100
    } else {
      if (event.shiftKey && !IS_MAC) {
        deltaX = deltaY
        deltaY = 0
      }
    }

    return { x: deltaX, y: deltaY, z: -deltaZ }
  }

  function onWheelRootElement(e: WheelEvent) {
    const delta = getDelta(e)
    if (e.ctrlKey || e.metaKey) {
      artboard.cancelAnimation()
      e.preventDefault()
      e.stopPropagation()

      doZoom(e.pageX, e.pageY, delta.z)
      return
    }
    const scrollSpeed = options.get('scrollSpeed', 1)

    e.preventDefault()
    e.stopPropagation()

    const useMomentumScroll = options.should('useMomentumScroll')

    if (useMomentumScroll && !IS_MAC) {
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
        !useMomentumScroll,
      )
    }
  }

  /**
   * @param x - The x coordinates relative to the page.
   * @param y - The y coordinates relative to the page.
   * @param delta - The amount to zoom.
   */
  function doZoom(x: number, y: number, delta: number) {
    const wheelZoomFactor = options.get('wheelZoomFactor', 0.8)
    const scaleFactor = Math.exp(delta * wheelZoomFactor)
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
    options,
    destroy,
  }
})
