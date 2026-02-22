import { describe, it, expect } from 'vitest'
import { EASINGS } from '~/helpers/easing'

const easingNames = Object.keys(EASINGS) as (keyof typeof EASINGS)[]

describe('easing functions', () => {
  describe.each(easingNames)('%s', (name) => {
    const fn = EASINGS[name]

    it('returns 0 at input 0', () => {
      expect(fn(0)).toBeCloseTo(0)
    })

    it('returns 1 at input 1', () => {
      expect(fn(1)).toBeCloseTo(1)
    })

    it('returns values in a reasonable range for inputs between 0 and 1', () => {
      for (let t = 0.1; t <= 0.9; t += 0.1) {
        const result = fn(t)
        // Allow some overshoot for elastic/back easings
        expect(result).toBeGreaterThan(-0.5)
        expect(result).toBeLessThan(1.5)
      }
    })
  })

  it('linear returns input unchanged', () => {
    expect(EASINGS.linear(0)).toBe(0)
    expect(EASINGS.linear(0.25)).toBe(0.25)
    expect(EASINGS.linear(0.5)).toBe(0.5)
    expect(EASINGS.linear(0.75)).toBe(0.75)
    expect(EASINGS.linear(1)).toBe(1)
  })

  it('easeOutCubic is above linear for mid values', () => {
    expect(EASINGS.easeOutCubic(0.5)).toBeGreaterThan(0.5)
  })

  it('easeInSine is below linear for mid values', () => {
    expect(EASINGS.easeInSine(0.5)).toBeLessThan(0.5)
  })
})
