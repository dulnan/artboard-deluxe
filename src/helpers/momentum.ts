import { dampen, lerp } from '.'
import type { ArtboardState } from '../types'
import type { Boundaries } from '../types/geometry'

/**
 * Applies the momentum.
 *
 * @returns Whether the momentum animation has reached its end.
 */
export function applyMomentum(
  state: ArtboardState,
  currentTime: number,
  boundaries: Boundaries,
): boolean {
  if (state.momentum === null) {
    return true
  }
  const deltaTime = (currentTime - state.lastLoopTimestamp) / 1000

  if (deltaTime > 0.5) {
    state.momentum = null
    return true
  }

  const inLeft = state.offset.x - boundaries.xMin >= -1.5
  const inRight = state.offset.x - boundaries.xMax <= 1.5
  const inTop = state.offset.y - boundaries.yMin >= -1.5
  const inBottom = state.offset.y - boundaries.yMax <= 1.5

  const deceleration = state.momentum.deceleration

  const appliedDecelerationX = inLeft && inRight ? deceleration : 0.85
  const appliedDecelerationY = inTop && inBottom ? deceleration : 0.85

  // Apply velocity decay.
  state.momentum.x *= appliedDecelerationX
  state.momentum.y *= appliedDecelerationY

  const vxDone = Math.abs(state.momentum.x) < 2
  const vyDone = Math.abs(state.momentum.y) < 2

  if (!vxDone) {
    state.offset.x = dampen(
      state.offset.x + state.momentum.x * deltaTime,
      boundaries.xMin,
      boundaries.xMax,
      appliedDecelerationX,
    )
  }

  if (!vyDone) {
    state.offset.y = dampen(
      state.offset.y + state.momentum.y * deltaTime,
      boundaries.yMin,
      boundaries.yMax,
      appliedDecelerationY,
    )
  }

  // Momentum is finished when the velocity is below a certain threshold and
  // the offset is within the boundaries.
  return vxDone && vyDone && inLeft && inRight && inTop && inBottom
}

export function applyScaleMomentum(
  state: ArtboardState,
  currentTime: number,
  _minScale: number,
  maxScale: number,
): boolean {
  const deceleration = 0.09
  const minThreshold = 0.01

  if (!state.scaleVelocity) {
    return true
  }

  const deltaTime = (currentTime - state.lastLoopTimestamp) / 1000

  if (deltaTime > 0.5) {
    state.scaleVelocity = null
    return true
  }

  if (state.scaleVelocity.scale > maxScale) {
    state.scaleVelocity.scale = state.scaleVelocity.scale * 0.95
  }

  state.offset.x = lerp(state.offset.x, state.scaleVelocity.x, deceleration)
  state.offset.y = lerp(state.offset.y, state.scaleVelocity.y, deceleration)
  state.scale = lerp(state.scale, state.scaleVelocity.scale, deceleration)

  const vxDone = Math.abs(state.scaleVelocity.x - state.offset.x) < minThreshold
  const vyDone = Math.abs(state.scaleVelocity.y - state.offset.y) < minThreshold
  const scaleDone =
    Math.abs(state.scaleVelocity.scale - state.scale) < minThreshold

  const isDone = vxDone && vyDone && scaleDone

  if (isDone) {
    state.offset.x = state.scaleVelocity.x
    state.offset.y = state.scaleVelocity.y
    state.scale = state.scaleVelocity.scale
  }

  return isDone
}
