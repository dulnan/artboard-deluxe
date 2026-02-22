import { describe, it, expect } from 'vitest'
import { applyMomentum, applyScaleMomentum } from '~/helpers/momentum'
import type { ArtboardState } from '~/types'
import type { Boundaries } from '~/types/geometry'

/**
 * Create a minimal ArtboardState with only the fields used by momentum functions.
 */
function createState(
  overrides: Partial<
    Pick<
      ArtboardState,
      'offset' | 'scale' | 'momentum' | 'scaleVelocity' | 'lastLoopTimestamp'
    >
  > = {},
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

const WIDE_BOUNDARIES: Boundaries = {
  xMin: -10000,
  xMax: 10000,
  yMin: -10000,
  yMax: 10000,
}

const TIGHT_BOUNDARIES: Boundaries = {
  xMin: -100,
  xMax: 100,
  yMin: -50,
  yMax: 50,
}

/**
 * Simulate applyMomentum for a fixed duration at a given fps.
 * Returns the final state and number of frames where momentum was still active.
 */
function simulateMomentum(
  fps: number,
  durationSeconds: number,
  initialState: Partial<
    Pick<
      ArtboardState,
      'offset' | 'scale' | 'momentum' | 'scaleVelocity' | 'lastLoopTimestamp'
    >
  >,
  boundaries: Boundaries,
): { state: ArtboardState; activeFrames: number } {
  const deltaTime = 1 / fps
  const state = createState(initialState)
  let currentTime = state.lastLoopTimestamp
  let activeFrames = 0

  const totalFrames = Math.round(durationSeconds * fps)
  for (let i = 0; i < totalFrames; i++) {
    currentTime += deltaTime
    const done = applyMomentum(state, currentTime, boundaries)
    state.lastLoopTimestamp = currentTime
    if (!done) {
      activeFrames++
    } else {
      break
    }
  }

  return { state, activeFrames }
}

/**
 * Simulate applyScaleMomentum for a fixed duration at a given fps.
 */
function simulateScaleMomentum(
  fps: number,
  durationSeconds: number,
  initialState: Partial<
    Pick<
      ArtboardState,
      'offset' | 'scale' | 'momentum' | 'scaleVelocity' | 'lastLoopTimestamp'
    >
  >,
  minScale: number,
  maxScale: number,
): { state: ArtboardState; activeFrames: number } {
  const deltaTime = 1 / fps
  const state = createState(initialState)
  let currentTime = state.lastLoopTimestamp
  let activeFrames = 0

  const totalFrames = Math.round(durationSeconds * fps)
  for (let i = 0; i < totalFrames; i++) {
    currentTime += deltaTime
    const done = applyScaleMomentum(state, currentTime, minScale, maxScale)
    state.lastLoopTimestamp = currentTime
    if (!done) {
      activeFrames++
    } else {
      break
    }
  }

  return { state, activeFrames }
}

const FPS_VALUES = [30, 60, 120]

describe('applyMomentum', () => {
  it('final offset is frame-rate independent with wide boundaries', () => {
    const results = FPS_VALUES.map((fps) =>
      simulateMomentum(
        fps,
        2,
        {
          offset: { x: 0, y: 0 },
          momentum: { x: 1000, y: 500, deceleration: 0.95 },
          lastLoopTimestamp: 0,
        },
        WIDE_BOUNDARIES,
      ),
    )

    const offsets = results.map((r) => r.state.offset)

    // All fps results should be within 2% of each other.
    for (let i = 1; i < offsets.length; i++) {
      const ref = offsets[0]!
      const cur = offsets[i]!
      expect(cur.x).toBeCloseTo(ref.x, -1)
      expect(cur.y).toBeCloseTo(ref.y, -1)
      // Relative tolerance: within 2%.
      if (Math.abs(ref.x) > 1) {
        expect(Math.abs(cur.x - ref.x) / Math.abs(ref.x)).toBeLessThan(0.02)
      }
      if (Math.abs(ref.y) > 1) {
        expect(Math.abs(cur.y - ref.y) / Math.abs(ref.y)).toBeLessThan(0.02)
      }
    }
  })

  it('final offset is frame-rate independent with tight boundaries (dampening)', () => {
    const results = FPS_VALUES.map((fps) =>
      simulateMomentum(
        fps,
        2,
        {
          offset: { x: 0, y: 0 },
          momentum: { x: 1000, y: 500, deceleration: 0.95 },
          lastLoopTimestamp: 0,
        },
        TIGHT_BOUNDARIES,
      ),
    )

    const offsets = results.map((r) => r.state.offset)

    for (let i = 1; i < offsets.length; i++) {
      const ref = offsets[0]!
      const cur = offsets[i]!
      // With dampening the tolerance is slightly wider but still consistent.
      if (Math.abs(ref.x) > 1) {
        expect(Math.abs(cur.x - ref.x) / Math.abs(ref.x)).toBeLessThan(0.05)
      }
      if (Math.abs(ref.y) > 1) {
        expect(Math.abs(cur.y - ref.y) / Math.abs(ref.y)).toBeLessThan(0.05)
      }
    }
  })

  it('momentum completes at roughly the same time regardless of fps', () => {
    const results = FPS_VALUES.map((fps) =>
      simulateMomentum(
        fps,
        5,
        {
          offset: { x: 0, y: 0 },
          momentum: { x: 1000, y: 500, deceleration: 0.95 },
          lastLoopTimestamp: 0,
        },
        WIDE_BOUNDARIES,
      ),
    )

    // Convert active frames to duration in seconds.
    const durations = results.map((r, i) => r.activeFrames / FPS_VALUES[i]!)

    // All durations should be within 0.1s of each other.
    for (let i = 1; i < durations.length; i++) {
      expect(Math.abs(durations[i]! - durations[0]!)).toBeLessThan(0.1)
    }
  })

  it('returns true immediately when momentum is null', () => {
    const state = createState({ momentum: null, lastLoopTimestamp: 0 })
    const done = applyMomentum(state, 0.016, WIDE_BOUNDARIES)
    expect(done).toBe(true)
  })

  it('returns true and clears momentum when deltaTime > 0.5s', () => {
    const state = createState({
      momentum: { x: 1000, y: 500, deceleration: 0.95 },
      lastLoopTimestamp: 0,
    })
    const done = applyMomentum(state, 1000, WIDE_BOUNDARIES)
    expect(done).toBe(true)
    expect(state.momentum).toBe(null)
  })
})

describe('applyScaleMomentum', () => {
  it('final scale and offset are frame-rate independent', () => {
    const results = FPS_VALUES.map((fps) =>
      simulateScaleMomentum(
        fps,
        2,
        {
          offset: { x: 100, y: 100 },
          scale: 1,
          scaleVelocity: { x: 200, y: 200, scale: 2 },
          lastLoopTimestamp: 0,
        },
        0.1,
        5,
      ),
    )

    const states = results.map((r) => r.state)

    for (let i = 1; i < states.length; i++) {
      const ref = states[0]!
      const cur = states[i]!
      // Scale should converge to the same value.
      expect(cur.scale).toBeCloseTo(ref.scale, 1)
      // Offsets should converge to the same values.
      expect(cur.offset.x).toBeCloseTo(ref.offset.x, 0)
      expect(cur.offset.y).toBeCloseTo(ref.offset.y, 0)
    }
  })

  it('max scale decay is frame-rate independent', () => {
    const maxScale = 3
    const results = FPS_VALUES.map((fps) =>
      simulateScaleMomentum(
        fps,
        2,
        {
          offset: { x: 0, y: 0 },
          scale: 5,
          scaleVelocity: { x: 0, y: 0, scale: 5 },
          lastLoopTimestamp: 0,
        },
        0.1,
        maxScale,
      ),
    )

    const scales = results.map(
      (r) => r.state.scaleVelocity?.scale ?? r.state.scale,
    )

    // All should decay to similar values.
    for (let i = 1; i < scales.length; i++) {
      const ref = scales[0]!
      const cur = scales[i]!
      if (Math.abs(ref) > 0.01) {
        expect(Math.abs(cur - ref) / Math.abs(ref)).toBeLessThan(0.02)
      }
    }
  })

  it('returns true immediately when scaleVelocity is null', () => {
    const state = createState({ scaleVelocity: null, lastLoopTimestamp: 0 })
    const done = applyScaleMomentum(state, 0.016, 0.1, 5)
    expect(done).toBe(true)
  })

  it('returns true and clears scaleVelocity when deltaTime > 0.5s', () => {
    const state = createState({
      scaleVelocity: { x: 200, y: 200, scale: 2 },
      lastLoopTimestamp: 0,
    })
    const done = applyScaleMomentum(state, 1000, 0.1, 5)
    expect(done).toBe(true)
    expect(state.scaleVelocity).toBe(null)
  })
})
