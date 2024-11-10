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
