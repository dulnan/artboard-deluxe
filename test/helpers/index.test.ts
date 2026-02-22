import { describe, it, expect } from 'vitest'
import {
  dampen,
  dampenRelative,
  lerp,
  clamp,
  limitOffset,
  getDirection,
  calculateCenterPosition,
  parseOrigin,
  withDefault,
  parseEdges,
  asValidNumber,
  withPrecision,
  adjustScaleForPrecision,
} from '~/helpers/index'

describe('lerp', () => {
  it('returns start when t is 0', () => {
    expect(lerp(10, 20, 0)).toBe(10)
  })

  it('returns end when t is 1', () => {
    expect(lerp(10, 20, 1)).toBe(20)
  })

  it('returns midpoint when t is 0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50)
  })

  it('works with negative values', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0)
  })
})

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
  })

  it('clamps to min', () => {
    expect(clamp(-1, 0, 1)).toBe(0)
  })

  it('clamps to max', () => {
    expect(clamp(2, 0, 1)).toBe(1)
  })

  it('uses default min=0 and max=1', () => {
    expect(clamp(-0.5)).toBe(0)
    expect(clamp(1.5)).toBe(1)
    expect(clamp(0.7)).toBe(0.7)
  })
})

describe('dampen', () => {
  it('returns value unchanged when within bounds', () => {
    expect(dampen(50, 0, 100, 0.5)).toBe(50)
  })

  it('dampens value below min', () => {
    const result = dampen(-10, 0, 100, 0.5)
    // overshoot = -10, result = 0 + (-10 * 0.5) = -5
    expect(result).toBe(-5)
  })

  it('dampens value above max', () => {
    const result = dampen(110, 0, 100, 0.5)
    // overshoot = 10, result = 100 + (10 * 0.5) = 105
    expect(result).toBe(105)
  })

  it('returns boundary value when factor is 0', () => {
    expect(dampen(-10, 0, 100, 0)).toBe(0)
    expect(dampen(110, 0, 100, 0)).toBe(100)
  })
})

describe('dampenRelative', () => {
  it('returns value unchanged when within bounds', () => {
    expect(dampenRelative(50, 0, 100, 0.5)).toBe(50)
  })

  it('dampens value below min with relative factor', () => {
    const result = dampenRelative(-10, 0, 100, 0.5)
    // overshoot = -10, result = 0 + (-10 * 0.5) / (1 + 10/100) = -5/1.1
    expect(result).toBeCloseTo(-5 / 1.1)
  })

  it('dampens value above max with relative factor', () => {
    const result = dampenRelative(110, 0, 100, 0.5)
    expect(result).toBeCloseTo(100 + (10 * 0.5) / (1 + 10 / 100))
  })
})

describe('limitOffset', () => {
  const boundaries = { xMin: -100, xMax: 100, yMin: -50, yMax: 50 }

  it('returns unchanged coords when within boundaries', () => {
    expect(limitOffset(0, 0, boundaries)).toEqual({ x: 0, y: 0 })
  })

  it('clamps x to boundaries', () => {
    expect(limitOffset(-200, 0, boundaries)).toEqual({ x: -100, y: 0 })
    expect(limitOffset(200, 0, boundaries)).toEqual({ x: 100, y: 0 })
  })

  it('clamps y to boundaries', () => {
    expect(limitOffset(0, -100, boundaries)).toEqual({ x: 0, y: -50 })
    expect(limitOffset(0, 100, boundaries)).toEqual({ x: 0, y: 50 })
  })
})

describe('getDirection', () => {
  it('detects horizontal movement', () => {
    const result = getDirection({ x: 0, y: 0 }, { x: 100, y: 0 }, 30)
    expect(result).toBe('horizontal')
  })

  it('detects vertical movement', () => {
    const result = getDirection({ x: 0, y: 0 }, { x: 0, y: 100 }, 30)
    expect(result).toBe('vertical')
  })

  it('detects diagonal movement as both', () => {
    const result = getDirection({ x: 0, y: 0 }, { x: 100, y: 100 }, 30)
    expect(result).toBe('both')
  })

  it('detects negative horizontal movement', () => {
    const result = getDirection({ x: 100, y: 0 }, { x: 0, y: 0 }, 30)
    expect(result).toBe('horizontal')
  })

  it('detects negative vertical movement', () => {
    const result = getDirection({ x: 0, y: 100 }, { x: 0, y: 0 }, 30)
    expect(result).toBe('vertical')
  })
})

describe('calculateCenterPosition', () => {
  const viewport = { x: 0, y: 0, width: 1000, height: 800 }

  it('centers in viewport with no blocking rects', () => {
    const result = calculateCenterPosition([], viewport, 200)
    expect(result.centerX).toBeCloseTo(400)
    expect(result.availableWidth).toBe(1000)
  })

  it('shifts center when a blocking rect is on the left', () => {
    const blockingRects = [{ x: 0, y: 0, width: 300, height: 800 }]
    const result = calculateCenterPosition(blockingRects, viewport, 200)
    // Available space is from 300 to 1000
    expect(result.centerX).toBeGreaterThan(400)
  })

  it('ignores blocking rects that cover most of the viewport', () => {
    const blockingRects = [{ x: 0, y: 0, width: 900, height: 50 }]
    const result = calculateCenterPosition(blockingRects, viewport, 200)
    // Should be same as no blocking rects since this covers >85% width
    expect(result.centerX).toBeCloseTo(400)
  })
})

describe('parseOrigin', () => {
  it('parses top-left', () => {
    expect(parseOrigin('top-left')).toEqual({ x: 0, y: 0 })
  })

  it('parses center-center', () => {
    expect(parseOrigin('center-center')).toEqual({ x: 0.5, y: 0.5 })
  })

  it('parses bottom-right', () => {
    expect(parseOrigin('bottom-right')).toEqual({ x: 1, y: 1 })
  })

  it('parses top-center', () => {
    expect(parseOrigin('top-center')).toEqual({ x: 0.5, y: 0 })
  })

  it('parses center-left', () => {
    expect(parseOrigin('center-left')).toEqual({ x: 0, y: 0.5 })
  })
})

describe('withDefault', () => {
  it('returns value when defined', () => {
    expect(withDefault(42, 0)).toBe(42)
  })

  it('returns default for null', () => {
    expect(withDefault(null, 10)).toBe(10)
  })

  it('returns default for undefined', () => {
    expect(withDefault(undefined, 10)).toBe(10)
  })

  it('returns default for NaN', () => {
    expect(withDefault(NaN, 10)).toBe(10)
  })

  it('returns 0 when value is 0', () => {
    expect(withDefault(0, 10)).toBe(0)
  })
})

describe('parseEdges', () => {
  it('returns uniform edges from a number', () => {
    expect(parseEdges(20)).toEqual({
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    })
  })

  it('returns defaults when no value provided', () => {
    expect(parseEdges(undefined, 5)).toEqual({
      top: 5,
      right: 5,
      bottom: 5,
      left: 5,
    })
  })

  it('returns zero defaults when nothing provided', () => {
    expect(parseEdges()).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
  })

  it('fills missing edge values with default', () => {
    expect(parseEdges({ top: 10, left: 20 }, 0)).toEqual({
      top: 10,
      right: 0,
      bottom: 0,
      left: 20,
    })
  })

  it('uses all provided edge values', () => {
    expect(parseEdges({ top: 1, right: 2, bottom: 3, left: 4 })).toEqual({
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    })
  })
})

describe('asValidNumber', () => {
  it('returns the number when valid', () => {
    expect(asValidNumber(42)).toBe(42)
  })

  it('returns default for null', () => {
    expect(asValidNumber(null, 5)).toBe(5)
  })

  it('returns default for undefined', () => {
    expect(asValidNumber(undefined, 5)).toBe(5)
  })

  it('returns default for NaN', () => {
    expect(asValidNumber(NaN, 5)).toBe(5)
  })

  it('parses a string to number', () => {
    expect(asValidNumber('3.14')).toBeCloseTo(3.14)
  })

  it('returns default for non-numeric string', () => {
    expect(asValidNumber('abc', 7)).toBe(7)
  })

  it('returns 0 as default when no default provided', () => {
    expect(asValidNumber(null)).toBe(0)
  })
})

describe('withPrecision', () => {
  it('rounds up to precision', () => {
    expect(withPrecision(7, 5)).toBe(10)
  })

  it('returns value when already at precision', () => {
    expect(withPrecision(10, 5)).toBe(10)
  })

  it('rounds up small remainder', () => {
    expect(withPrecision(11, 10)).toBe(20)
  })
})

describe('adjustScaleForPrecision', () => {
  it('snaps scale so that size * scale is a multiple of precision', () => {
    const result = adjustScaleForPrecision(100, 1.5, 1)
    // 100 * 1.5 = 150, round to nearest 1 = 150, so 150/100 = 1.5
    expect(result).toBeCloseTo(1.5)
  })

  it('adjusts scale for non-trivial precision', () => {
    const result = adjustScaleForPrecision(100, 1.03, 10)
    // 100 * 1.03 = 103, Math.round(103/10)*10 = 100, so 100/100 = 1.0
    expect(result).toBeCloseTo(1.0)
  })
})
