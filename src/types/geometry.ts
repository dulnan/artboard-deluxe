export type Size = {
  width: number
  height: number
}

export type Coord = {
  x: number
  y: number
}

export type Paddings = {
  top: number
  right: number
  bottom: number
  left: number
}

export type Rectangle = Size & Coord

export type Boundaries = {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

/**
 * The 'origin', similar to how the CSS `transform-origin` property works:
 *   - horizontal: 'left' | 'center' | 'right'
 *   - vertical: 'top' | 'center' | 'bottom'
 */
export type Origin =
  | 'top-left'
  | 'center-left'
  | 'bottom-left'
  | 'top-center'
  | 'center-center'
  | 'bottom-center'
  | 'top-right'
  | 'center-right'
  | 'bottom-right'
