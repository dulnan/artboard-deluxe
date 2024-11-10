export function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x)
}

export function easeOutBack(x: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1

  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

export function easeOutElastic(x: number): number {
  const c4 = (2 * Math.PI) / 3

  if (x === 0) {
    return 0
  } else if (x === 1) {
    return 1
  }

  return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
}

export function easeOutCirc(x: number): number {
  return Math.sqrt(1 - Math.pow(x - 1, 2))
}

export function easeInOutExpo(x: number): number {
  if (x === 0) {
    return 0
  } else if (x === 1) {
    return 1
  }

  return x < 0.5
    ? Math.pow(2, 20 * x - 10) / 2
    : (2 - Math.pow(2, -20 * x + 10)) / 2
}

export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3)
}

function easeInSine(x: number): number {
  return 1 - Math.cos((x * Math.PI) / 2)
}
function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2
}

function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}

function easeInOutQuart(x: number): number {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
}

function easeInOutCirc(x: number): number {
  return x < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2
}

function easeInOutQuint(x: number): number {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2
}

function linear(x: number): number {
  return x
}

type EasingFunction = (x: number) => number

export const EASINGS = {
  easeInOutExpo,
  easeOutCirc,
  easeOutElastic,
  easeOutQuad,
  easeOutBack,
  easeOutCubic,
  easeInSine,
  easeInOutSine,
  easeInOutQuad,
  easeInOutQuart,
  easeInOutCirc,
  easeInOutQuint,
  linear,
} as const

export type AnimationEasing = keyof typeof EASINGS | EasingFunction
