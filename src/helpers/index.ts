import type { PossibleDragEventPosition, Direction } from '../types'
import type {
  Boundaries,
  Coord,
  Edge,
  Origin,
  Rectangle,
} from '../types/geometry'

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

export function clamp(a: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, a))
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
  if (isTouchEvent(e)) {
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

function isTouchEvent(e: unknown): e is TouchEvent {
  return window.TouchEvent && e instanceof TouchEvent
}

export function withPrecision(value: number, precision: number): number {
  return Math.ceil(value / precision) * precision
}

/**
 * Parse the origin, e.g.:
 * "top-left" => [0, 0]
 * "center-center" => [0.5, 0.5],
 * etc.
 */
export function parseOrigin(origin: Origin): Coord {
  const [vertical, horizontal] = origin.split('-') as [string, string]

  const x =
    horizontal === 'left' ? 0 : horizontal === 'center' ? 0.5 : /* 'right' */ 1

  const y =
    vertical === 'top' ? 0 : vertical === 'center' ? 0.5 : /* 'bottom' */ 1

  return { x, y }
}

export function withDefault(
  v: number | null | undefined,
  defaultValue: number,
): number {
  if (v === undefined || v === null) {
    return defaultValue
  }

  return Number.isNaN(v) ? defaultValue : v
}

/**
 * Convert the `margin` option into a normalized object with
 * top/right/bottom/left all defined (defaults to 0).
 */
export function parseEdges(v?: Partial<Edge> | number, defaultValue = 0): Edge {
  if (typeof v === 'number') {
    return {
      top: v,
      right: v,
      bottom: v,
      left: v,
    }
  }

  if (!v) {
    return {
      top: defaultValue,
      right: defaultValue,
      bottom: defaultValue,
      left: defaultValue,
    }
  }

  return {
    top: withDefault(v.top, defaultValue),
    right: withDefault(v.right, defaultValue),
    bottom: withDefault(v.bottom, defaultValue),
    left: withDefault(v.left, defaultValue),
  }
}

export function asValidNumber(
  value?: number | null | string,
  defaultValue = 0,
): number {
  // No value provided.
  if (value === null || value === undefined) {
    return defaultValue
  }

  // Try to parse the string to a number and call the method again.
  if (typeof value === 'string') {
    return asValidNumber(parseFloat(value))
  }

  if (Number.isNaN(value)) {
    return defaultValue
  }

  return value
}
