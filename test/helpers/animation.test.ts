import { describe, it, expect } from 'vitest'
import { applyAnimation } from '~/helpers/animation/index'
import type { ArtboardAnimation } from '~/helpers/animation/index'
import type { ArtboardState } from '~/types'

function createState(
  overrides: Partial<Pick<ArtboardState, 'offset' | 'scale'>> = {},
): ArtboardState {
  return {
    offset: { x: 0, y: 0 },
    scale: 1,
    animation: null,
    momentum: null,
    momentumStopTimestamp: 0,
    artboardSize: null,
    interaction: 'none',
    touchDirection: 'none',
    lastAnimateToTimestamp: 0,
    lastLoopTimestamp: 0,
    rootRect: {
      x: 0,
      y: 0,
      width: 1000,
      height: 1000,
      top: 0,
      right: 1000,
      bottom: 1000,
      left: 0,
      toJSON() {},
    } as DOMRect,
    rootSize: { width: 1000, height: 1000 },
    scaleVelocity: null,
    ...overrides,
  }
}

function createAnimation(
  overrides: Partial<ArtboardAnimation> = {},
): ArtboardAnimation {
  return {
    key: 'test',
    x: 100,
    y: 200,
    scale: 2,
    startX: 0,
    startY: 0,
    startScale: 1,
    easing: 'linear',
    startTime: 0,
    duration: 1000,
    ...overrides,
  }
}

describe('applyAnimation', () => {
  it('sets startTime on first call when startTime is 0', () => {
    const state = createState()
    const animation = createAnimation({ startTime: 0 })
    applyAnimation(state, 500, animation)
    expect(animation.startTime).toBe(500)
  })

  it('interpolates offset and scale based on progress', () => {
    const state = createState()
    const animation = createAnimation({ startTime: 1000, duration: 1000 })

    applyAnimation(state, 1500, animation)

    // At 50% progress with linear easing
    expect(state.offset.x).toBeCloseTo(50)
    expect(state.offset.y).toBeCloseTo(100)
    expect(state.scale).toBeCloseTo(1.5)
  })

  it('returns false when animation is in progress', () => {
    const state = createState()
    const animation = createAnimation({ startTime: 1000, duration: 1000 })
    const done = applyAnimation(state, 1500, animation)
    expect(done).toBe(false)
  })

  it('returns true and sets final values when animation completes', () => {
    const state = createState()
    const animation = createAnimation({ startTime: 1000, duration: 1000 })
    const done = applyAnimation(state, 2000, animation)

    expect(done).toBe(true)
    expect(state.offset.x).toBe(100)
    expect(state.offset.y).toBe(200)
    expect(state.scale).toBe(2)
  })

  it('clamps progress to 1 when time exceeds duration', () => {
    const state = createState()
    const animation = createAnimation({ startTime: 1000, duration: 1000 })
    const done = applyAnimation(state, 5000, animation)

    expect(done).toBe(true)
    expect(state.offset.x).toBe(100)
    expect(state.offset.y).toBe(200)
    expect(state.scale).toBe(2)
  })

  it('works with a named easing function', () => {
    const state = createState()
    const animation = createAnimation({
      startTime: 1000,
      duration: 1000,
      easing: 'easeOutCubic',
    })

    applyAnimation(state, 1500, animation)

    // easeOutCubic at 0.5 > 0.5, so offset should be past midpoint
    expect(state.offset.x).toBeGreaterThan(50)
    expect(state.offset.y).toBeGreaterThan(100)
  })

  it('works with a custom easing function', () => {
    const state = createState()
    const animation = createAnimation({
      startTime: 1000,
      duration: 1000,
      easing: (x: number) => x * x, // quadratic ease-in
    })

    applyAnimation(state, 1500, animation)

    // At 50% progress, eased = 0.25
    expect(state.offset.x).toBeCloseTo(25)
    expect(state.offset.y).toBeCloseTo(50)
    expect(state.scale).toBeCloseTo(1.25)
  })
})
