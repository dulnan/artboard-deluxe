import { dampenRelative } from '.'
import type { Artboard } from '../types'
import type { Coord } from '../types/geometry'

/**
 * Prepare the artboard state for a drag start.
 *
 * @returns The offset to use for calculating the drag.
 */
export function prepareForDrag(artboard: Artboard): Coord {
  const initialOffset = { ...artboard.getOffset() }
  const boundaries = artboard.getBoundaries()

  artboard.cancelAnimation()
  artboard.setInteraction('dragging')
  artboard.setMomentum()
  artboard.setTouchDirection('none')

  const dampedX = dampenRelative(
    initialOffset.x,
    boundaries.xMin,
    boundaries.xMax,
    artboard.options.springDamping,
  )

  const dampedY = dampenRelative(
    initialOffset.y,
    boundaries.yMin,
    boundaries.yMax,
    artboard.options.springDamping,
  )

  // Calculate the starting offset for the drag.
  // This is needed because the drag might start while momentum scrolling
  // outside the boundaries. This applies different damping/friction than
  // during dragging. To properly calculate the starting offset we have to
  // basically reverse the applied damping.
  initialOffset.x +=
    (initialOffset.x - dampedX) / artboard.options.springDamping
  initialOffset.y +=
    (initialOffset.y - dampedY) / artboard.options.springDamping

  // Set the offset.
  artboard.setOffset(initialOffset.x, initialOffset.y)
  return initialOffset
}
