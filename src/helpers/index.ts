import type { PossibleDragEventPosition, Direction } from '../types'
import type { Boundaries, Coord, Rectangle } from '../types/geometry'

export function adjustScaleForPrecision(
  size: number,
  currentScale: number,
  precision: number,
): number {
  const scaledSize = size * currentScale
  const targetSize = Math.round(scaledSize / precision) * precision
  return targetSize / size
}

export function dampenRelative(
  value: number,
  min: number,
  max: number,
  factor: number,
): number {
  if (value < min) {
    const overshoot = value - min
    return min + (overshoot * factor) / (1 + Math.abs(overshoot) / (max - min))
  } else if (value > max) {
    const overshoot = value - max
    return max + (overshoot * factor) / (1 + Math.abs(overshoot) / (max - min))
  }

  return value
}

export function dampen(
  value: number,
  min: number,
  max: number,
  factor: number,
): number {
  if (value < min) {
    const overshoot = value - min
    return min + overshoot * factor
  } else if (value > max) {
    const overshoot = value - max
    return max + overshoot * factor
  }

  return value
}

export function lerp(s: number, e: number, t: number) {
  return s * (1 - t) + e * t
}

export function invlerp(x: number, y: number, a: number) {
  return clamp((a - x) / (y - x))
}

export function clamp(a: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, a))
}

export function range(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  a: number,
) {
  return lerp(x2, y2, invlerp(x1, y1, a))
}

/**
 * Calculate the ideal X coordinate for placing a rectangle.
 *
 * Coordinates are assumed to be 0,0 for top-left. The method returns a number
 * that can be used to set the
 */
export function calculateCenterPosition(
  // Rectangles that block the viewport.
  blockingRects: Rectangle[],
  // The viewport in which the center should be determined.
  // Note that this may not correspond to the actual browser viewport.
  viewport: Rectangle,
  // The width to use when determining the center.
  widthToPlace: number,
): { centerX: number; availableWidth: number } {
  // The center of the viewport.
  const viewportCenterX = (viewport.x + viewport.width) / 2

  // The amount of pixels a blocking rect must be away from the center so it
  // affects positioning.
  const blockingThreshold = viewport.width / 7

  const x = blockingRects.reduce((acc, rect) => {
    // If the rectangle is left of the center.
    if (
      rect.x < viewportCenterX &&
      viewportCenterX - rect.x > blockingThreshold &&
      rect.x + rect.width > acc
    ) {
      return rect.x + rect.width
    }
    return acc
  }, viewport.x)

  const availableWidth = blockingRects.reduce((acc, rect) => {
    // If the rectangle is right of the center.
    if (
      rect.x > viewportCenterX &&
      rect.x - viewportCenterX > blockingThreshold &&
      rect.x < acc
    ) {
      return rect.x
    }
    return acc
  }, viewport.width + viewport.x)

  // Calculate the center X.
  const centerX = (x + availableWidth) / 2 - widthToPlace / 2 - viewport.x

  return { centerX, availableWidth: availableWidth - x }
}

export function getMidpoint(touches: PossibleDragEventPosition): Coord {
  const x = touches[0].clientX
  const y = touches[0].clientY
  if (touches.length === 1) {
    return {
      x,
      y,
    }
  }
  return {
    x: (x + touches[1].clientX) / 2,
    y: (y + touches[1].clientY) / 2,
  }
}

export function getDistance(a: Coord, b: Coord): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function getTouchDistance(touches: PossibleDragEventPosition): number {
  return getDistance(
    {
      x: touches[0].clientX,
      y: touches[0].clientY,
    },
    {
      x: touches[1].clientX,
      y: touches[1].clientY,
    },
  )
}

/**
 * Limites the given coordinates to the current boundaries.
 *
 * @param x - The x coordinate.
 * @param y - The y coordinate.
 * @returns The coordinates limited to the current boundaries.
 */
export function limitOffset(
  x: number,
  y: number,
  boundaries: Boundaries,
): Coord {
  return {
    x: clamp(x, boundaries.xMin, boundaries.xMax),
    y: clamp(y, boundaries.yMin, boundaries.yMax),
  }
}

export function getDirection(a: Coord, b: Coord, threshold: number): Direction {
  const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI

  const isHorizontal =
    (angle >= -threshold && angle <= threshold) ||
    angle >= 180 - threshold ||
    angle <= -180 + threshold

  const isVertical =
    (angle >= 90 - threshold && angle <= 90 + threshold) ||
    (angle >= -90 - threshold && angle <= -90 + threshold)

  if (isHorizontal && !isVertical) {
    return 'horizontal'
  } else if (!isHorizontal && isVertical) {
    return 'vertical'
  }

  return 'both'
}

export function getEventCoords(e: MouseEvent | TouchEvent): Coord {
  if (e instanceof TouchEvent) {
    return {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY,
    }
  }
  return {
    x: e.pageX,
    y: e.pageY,
  }
}
