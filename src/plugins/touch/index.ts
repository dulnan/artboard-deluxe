import { defineArtboardPlugin } from '../defineArtboardPlugin'
import { getMidpoint, getTouchDistance } from '../../helpers'
import {
  createDirectionQueue,
  createVelocityQueue,
  type VelocityQueueOptions,
} from '../../helpers/queue'
import type { PossibleDragEventPosition, Direction } from '../../types'
import { prepareForDrag } from '../../helpers/artboard'
import type { Coord } from '../../types/geometry'
import type { AnimationOptions } from '../../helpers/animation'

export const touch = defineArtboardPlugin<{
  /**
   * Whether to require two touch points to interact with the artboard.
   *
   * The default is false, which will scroll the artboard using a single touch
   * point. Set this to true to require two touch points, which will scale and
   * scroll the artboard at the same time. Useful if you have some sort of
   * drawing app where a single touch should not trigger scrolling.
   */
  useTwoTouchScrolling?: boolean

  /**
   * Options for the velocity queue.
   */
  velocity?: Partial<VelocityQueueOptions>

  /**
   * The options for the animation that scales to the nearest valid scale value within the min and max scale when overscaling.
   */
  overscaleAnimation?: Required<AnimationOptions>

  /**
   * The threshold for detecting the scroll direction.
   *
   * A value of 0 means the angle of the swipe gesture must be perfectly
   * diagonal (e.g. 45°, 135°, etc.) to start a "free moving" drag. A value of 1
   * means the artboard can be moved freely at all times.
   *
   * The default value is 0.7 which feels natural for most cases. Choose a lower
   * value if your artboard's height is much larger than its width. That way it
   * mostly scrolls vertically. Choose a higher value if the artboard's width
   * and height is mostly equal and scrolling in all directions is more common.
   */
  scrollDirectionThreshold?: number
}>(function (artboard, options) {
  const rootEl = artboard.getRootElement()

  /** The distance of the two fingers when the pinch gesture started. */
  let initialTouchDistance = 1

  /** The artboard scale when the pinch gesture started. */
  let initialScale = 1

  /** The coordinate at which the first touch event fired. */
  let initialTouchPoint: Coord | null = null

  /** The offset at the time the first touch event fired. */
  let initialOffset: Coord = { x: 0, y: 0 }

  /** The last touch coordinate (or the midpoint of two touches when scaling). */
  let lastTouch: Coord | null = null

  /** The timestamp of the last pinch gesture interaction. */
  let lastScaleTimestamp = 0

  /** The center point of the pinch gesture. */
  let scaleMidpoint: Coord | null = null

  /** The touch direction at the start of the touch. */
  let touchStartDirection: Direction | null = null

  let touchStartTime = 0

  /** The queue to determine the touch direction. */
  const directionQueue = createDirectionQueue({
    threshold: options.get('scrollDirectionThreshold', 20),
  })

  function getQueueOptions(): VelocityQueueOptions {
    const velocityQueueOptions = options.get('velocity', {})
    return {
      maxTimeWindow: velocityQueueOptions.maxTimeWindow || 210,
      maxVelocity: velocityQueueOptions.maxVelocity || 5000,
      minVelocity: velocityQueueOptions.minVelocity || 20,
      multiplicator: velocityQueueOptions.multiplicator || 1.35,
    }
  }

  /** The queue containing the last touches to calculate the velocity. */
  const velocityQueue = createVelocityQueue(getQueueOptions())

  function determineTouchStartDirection(): Direction | null {
    // Not momentum scrolling: No initial direction.
    if (artboard.getInteraction() !== 'momentum') {
      return null
    }

    const currentDirection = artboard.getTouchDirection()
    if (currentDirection === 'vertical' || currentDirection === 'horizontal') {
      const velocity = artboard.getMomentum()
      if (velocity) {
        const totalVelocity = Math.abs(velocity.x) + Math.abs(velocity.y)

        // Only if the current total velocity is above a certain threshold
        if (totalVelocity >= 200) {
          return currentDirection
        }
      }
    }

    return null
  }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 1 && !options.should('useTwoTouchScrolling')) {
      onDragStart(e.touches)
      velocityQueue.init(getQueueOptions())
      directionQueue.reset()
      const midpoint = getMidpoint(e.touches)
      velocityQueue.add(midpoint)
      directionQueue.add(midpoint)
    }
    if (e.touches.length === 2) {
      velocityQueue.init(getQueueOptions())
      directionQueue.reset()
      initialTouchDistance = getTouchDistance(e.touches)
      initialScale = artboard.getScale()
    }
  }

  function onTouchMove(e: TouchEvent) {
    const now = performance.now()
    if (options.should('useTwoTouchScrolling') && e.touches.length !== 2) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    if (!lastTouch || !initialTouchPoint) {
      onDragStart(e.touches)
      return
    }

    const scale = artboard.getScale()
    const offset = artboard.getOffset()

    const midpoint = getMidpoint(e.touches)
    const focalPoint = {
      x: (midpoint.x - offset.x) / scale,
      y: (midpoint.y - offset.y) / scale,
    }
    velocityQueue.add(midpoint)

    // Handle scaling.
    if (e.touches.length >= 2) {
      if (artboard.getInteraction() !== 'scaling') {
        artboard.setInteraction('scaling')
        lastTouch = { x: midpoint.x, y: midpoint.y }
      }
      velocityQueue.init(getQueueOptions())

      // Calculate the new scale.
      const newTouchDistance = getTouchDistance(e.touches)
      const scaleFactor = newTouchDistance / initialTouchDistance
      artboard.setScale(initialScale * scaleFactor)

      const diffX = midpoint.x - lastTouch.x
      const diffY = midpoint.y - lastTouch.y

      const updatedScale = artboard.getScale()

      // Adjust offset based on new scale and focal point.
      const newOffsetX = midpoint.x - focalPoint.x * updatedScale
      const newOffsetY = midpoint.y - focalPoint.y * updatedScale
      scaleMidpoint = {
        x: midpoint.x,
        y: midpoint.y,
      }

      artboard.setOffset(newOffsetX + diffX, newOffsetY + diffY, true)
      lastTouch = { x: midpoint.x, y: midpoint.y }
      lastScaleTimestamp = now
      return
    }

    artboard.setInteraction('dragging')

    if (artboard.getTouchDirection() === 'none') {
      if (touchStartDirection && now - touchStartTime <= 300) {
        artboard.setTouchDirection(touchStartDirection)
      } else {
        directionQueue.add(midpoint)
        const possibleDirection = directionQueue.getDirection(true)
        if (possibleDirection) {
          artboard.setTouchDirection(possibleDirection)
        }
      }
    }

    artboard.setDirectionOffset(
      initialOffset.x + midpoint.x - initialTouchPoint.x,
      initialOffset.y + midpoint.y - initialTouchPoint.y,
    )
    lastTouch = { x: midpoint.x, y: midpoint.y }
  }

  function onTouchEnd(e: TouchEvent) {
    if (e.changedTouches.length > 2) {
      return
    }
    const interaction = artboard.getInteraction()
    if (
      interaction === 'dragging' ||
      interaction === 'momentum' ||
      interaction === 'scaling'
    ) {
      e.stopImmediatePropagation()
    }

    // Animate back to within the valid scale boundaries.
    if (e.touches.length <= 1 && scaleMidpoint) {
      applyScaleBoundaries({ ...scaleMidpoint })
    }

    // Do some clean up when we were previously scaling, but have now switched
    // to dragging.
    if (artboard.getInteraction() === 'scaling' && e.touches.length === 1) {
      // After scaling we want to allow any touch direction.
      artboard.setTouchDirection('both')
      artboard.setInteraction('dragging')
      initialTouchPoint = null
      initialOffset = { ...artboard.getOffset() }
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      lastScaleTimestamp = performance.now()
      initialScale = artboard.getScale()
      return
    }

    if (e.touches.length !== 0) {
      return
    }
    artboard.setInteraction('none')

    if (!initialTouchPoint || !lastTouch) {
      return
    }

    // Reset for the next gesture.
    initialTouchPoint = null
    scaleMidpoint = null

    // Calculcate the time passed since the last pinch scale gesture was performed.
    // If the time is below a certain threshold we want to prevent momentum scrolling
    // from happening, because the pinch gesture's two touch points might not end
    // at the exact same time. If we did not do that, then stopping a pinch gesture
    // could accidentally trigger momentum scrolling.
    const timeSinceLastScale = performance.now() - lastScaleTimestamp
    if (timeSinceLastScale < 200) {
      artboard.startMomentum()
      return
    }

    const midpoint = getMidpoint(e.changedTouches)

    if (artboard.getTouchDirection() === 'none') {
      directionQueue.add(midpoint)
      const possibleDirection = directionQueue.getDirection(true)
      if (possibleDirection) {
        artboard.setTouchDirection(possibleDirection)
      }
    }

    // Add the end position too, so that the velocity is properly calculated.
    velocityQueue.add(midpoint)
    artboard.startMomentum(velocityQueue.getVelocity())
  }

  /**
   * Called when a pinch gesture ends. If the current scale at that point is
   * outside the allowed min/max scale range, we animate back to the scale
   * boundaries.
   */
  function applyScaleBoundaries(midpoint: Coord) {
    const scale = artboard.getScale()
    // Nothing to do if we are within the allowed boundaries.
    if (
      scale >= artboard.options.minScale &&
      scale <= artboard.options.maxScale
    ) {
      return
    }

    const offset = artboard.getOffset()
    const targetX = (midpoint.x - offset.x) / scale
    const targetY = (midpoint.y - offset.y) / scale

    const targetScale =
      scale > artboard.options.maxScale
        ? artboard.options.maxScale
        : artboard.options.minScale

    lastTouch = null
    initialTouchPoint = null
    artboard.animateTo(
      'touchScaleBoundaries',
      -targetX * targetScale + midpoint.x,
      -targetY * targetScale + midpoint.y,
      targetScale,
      options.get('overscaleAnimation', {
        duration: 300,
        easing: 'easeOutBack',
      }),
    )
  }

  /**
   * @param touches - The touches.
   */
  function onDragStart(touches: PossibleDragEventPosition) {
    touchStartDirection = determineTouchStartDirection()
    // Important: Use the last touch in the list.
    lastTouch = {
      x: touches[touches.length - 1].clientX,
      y: touches[touches.length - 1].clientY,
    }
    initialTouchPoint = { ...lastTouch }
    touchStartTime = performance.now()
    initialOffset = prepareForDrag(artboard)
    initialScale = artboard.getScale()
    velocityQueue.init(getQueueOptions())
  }

  function destroy() {
    rootEl.removeEventListener('touchstart', onTouchStart)
    rootEl.removeEventListener('touchmove', onTouchMove)
    rootEl.removeEventListener('touchend', onTouchEnd, {
      capture: true,
    })
  }

  rootEl.addEventListener('touchstart', onTouchStart, {
    passive: false,
  })

  rootEl.addEventListener('touchmove', onTouchMove, {
    passive: false,
  })

  rootEl.addEventListener('touchend', onTouchEnd, {
    passive: false,
    capture: true,
  })

  return {
    options,
    destroy,
  }
})
