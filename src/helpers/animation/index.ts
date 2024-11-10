import { lerp } from './../'
import { EASINGS, type AnimationEasing } from '../easing'
import type { ArtboardState } from '../../types'
import type { Coord } from '../../types/geometry'

export type ArtboardAnimation = Coord & {
  key: string

  /** The target scale for the animation. */
  scale: number

  /** The offset X value when the animation started. */
  startX: number

  /** The offset Y value when the animation started. */
  startY: number

  /** The scale value when the animation started. */
  startScale: number

  /** The easing method to use for the animation. */
  easing: AnimationEasing

  /** The timestamp when the animation started. */
  startTime: number

  /** The duration of the animation. */
  duration: number
}

export type AnimationOptions = {
  /**
   * The easing function to use when animating.
   *
   * Can either be the name of one of the built in easing functions or a custom function.
   * If a custom function is provided, it will receive the current progress (a value from 0 to 1) as the only argument and should return the eased progress.
   */
  easing?: AnimationEasing

  /** The speed of the animation. */
  duration?: number
}

/**
 * Iterates the current animation.
 *
 * @returns {boolean} Whether the animation is finished.
 */
export function applyAnimation(
  state: ArtboardState,
  currentTime: number,
  animation: ArtboardAnimation,
): boolean {
  if (!animation.startTime) {
    animation.startTime = currentTime
  }

  const elapsedTime = currentTime - animation.startTime
  const progress = Math.min(elapsedTime / animation.duration, 1)
  const easedProgress =
    typeof animation.easing === 'string'
      ? EASINGS[animation.easing](progress)
      : animation.easing(progress)

  const x = lerp(animation.startX, animation.x, easedProgress)
  const y = lerp(animation.startY, animation.y, easedProgress)
  state.offset.x = x
  state.offset.y = y

  state.scale = lerp(animation.startScale, animation.scale, easedProgress)

  // Set the final state of the animation when we've reached the end.
  if (progress >= 1) {
    state.offset.x = animation.x
    state.offset.y = animation.y
    state.scale = animation.scale
    return true
  }

  return false
}
