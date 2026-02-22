import { describe, it, expect, vi, beforeEach } from 'vitest'

import { WheelNormalizer } from '~/helpers/wheel'

// Mock userAgent before importing WheelNormalizer.
vi.mock('~/helpers/userAgent', () => ({
  isMac: () => false,
}))

function createWheelEvent(
  overrides: Partial<WheelEvent> & { deltaX?: number; deltaY?: number } = {},
): WheelEvent {
  return {
    deltaX: 0,
    deltaY: 0,
    deltaZ: 0,
    deltaMode: 0,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: false,
    timeStamp: 0,
    ...overrides,
  } as WheelEvent
}

describe('WheelNormalizer', () => {
  let normalizer: WheelNormalizer

  beforeEach(() => {
    normalizer = new WheelNormalizer()
  })

  it('passes through deltas for a simple scroll event', () => {
    const result = normalizer.onWheel(
      createWheelEvent({ deltaX: 0, deltaY: 10, timeStamp: 0 }),
    )
    expect(result.x).toBe(0)
    expect(result.y).toBe(10)
    expect(result.z).toBe(0)
  })

  it('computes deltaZ for ctrl+wheel (pinch zoom)', () => {
    const result = normalizer.onWheel(
      createWheelEvent({ deltaY: 5, ctrlKey: true, timeStamp: 0 }),
    )
    expect(result.z).toBeCloseTo(0.05) // 5 / 100
  })

  it('clamps deltaZ to MAX_ZOOM_STEP / 100', () => {
    const result = normalizer.onWheel(
      createWheelEvent({ deltaY: 100, ctrlKey: true, timeStamp: 0 }),
    )
    // MAX_ZOOM_STEP = 10, sign = 1, so deltaZ = 10/100 = 0.1
    expect(result.z).toBeCloseTo(0.1)
  })

  it('computes negative deltaZ for ctrl+wheel scroll up', () => {
    const result = normalizer.onWheel(
      createWheelEvent({ deltaY: -5, ctrlKey: true, timeStamp: 0 }),
    )
    expect(result.z).toBeCloseTo(-0.05)
  })

  it('swaps deltaX and deltaY on shift+wheel (non-Mac)', () => {
    const result = normalizer.onWheel(
      createWheelEvent({
        deltaX: 0,
        deltaY: 10,
        shiftKey: true,
        timeStamp: 0,
      }),
    )
    // deltaX should get the deltaY value, deltaY should be 0
    expect(result.x).toBe(10)
    expect(result.y).toBe(0)
  })

  it('detects vertical direction after multiple vertical events', () => {
    // Need DETECTION_THRESHOLD (3) events to detect direction.
    for (let i = 0; i < 3; i++) {
      normalizer.onWheel(
        createWheelEvent({ deltaX: 0, deltaY: 10, timeStamp: i * 20 }),
      )
    }

    const result = normalizer.onWheel(
      createWheelEvent({ deltaX: 5, deltaY: 10, timeStamp: 100 }),
    )
    expect(result.direction).toBe('vertical')
    // When direction is vertical, x is zeroed
    expect(result.x).toBe(0)
  })

  it('detects horizontal direction after multiple horizontal events', () => {
    for (let i = 0; i < 3; i++) {
      normalizer.onWheel(
        createWheelEvent({ deltaX: 10, deltaY: 0, timeStamp: i * 20 }),
      )
    }

    const result = normalizer.onWheel(
      createWheelEvent({ deltaX: 10, deltaY: 5, timeStamp: 100 }),
    )
    expect(result.direction).toBe('horizontal')
    // When direction is horizontal, y is zeroed
    expect(result.y).toBe(0)
  })

  it('resets direction after DIRECTION_LOCK_DURATION expires', () => {
    // Establish a vertical direction.
    for (let i = 0; i < 3; i++) {
      normalizer.onWheel(
        createWheelEvent({ deltaX: 0, deltaY: 10, timeStamp: i * 20 }),
      )
    }

    // Wait longer than DIRECTION_LOCK_DURATION (500ms).
    const result = normalizer.onWheel(
      createWheelEvent({ deltaX: 10, deltaY: 0, timeStamp: 700 }),
    )
    // Direction should have been reset and not yet re-detected (not enough new events).
    expect(result.direction).toBe('none')
  })

  it('switches direction after enough contrary events', () => {
    // Establish horizontal direction.
    for (let i = 0; i < 3; i++) {
      normalizer.onWheel(
        createWheelEvent({ deltaX: 10, deltaY: 0, timeStamp: i * 20 }),
      )
    }

    // Send CONTRARY_EVENTS_THRESHOLD (6) vertical events.
    for (let i = 0; i < 6; i++) {
      normalizer.onWheel(
        createWheelEvent({
          deltaX: 0,
          deltaY: 10,
          timeStamp: 100 + i * 20,
        }),
      )
    }

    // After enough contrary events, direction should switch.
    const result = normalizer.onWheel(
      createWheelEvent({
        deltaX: 0,
        deltaY: 10,
        timeStamp: 300,
      }),
    )
    expect(result.direction).toBe('vertical')
  })

  it('reset clears all state', () => {
    for (let i = 0; i < 3; i++) {
      normalizer.onWheel(
        createWheelEvent({ deltaX: 10, deltaY: 0, timeStamp: i * 20 }),
      )
    }

    normalizer.reset()

    // After reset, direction is none and buffer is empty.
    const result = normalizer.onWheel(
      createWheelEvent({ deltaX: 0, deltaY: 10, timeStamp: 100 }),
    )
    expect(result.direction).toBe('none')
  })

  it('filters out expired events from buffer', () => {
    // EVENT_EXPIRY_TIME is 500ms.
    normalizer.onWheel(
      createWheelEvent({ deltaX: 10, deltaY: 0, timeStamp: 0 }),
    )
    normalizer.onWheel(
      createWheelEvent({ deltaX: 10, deltaY: 0, timeStamp: 100 }),
    )

    // After 600ms, old events should be expired.
    const result = normalizer.onWheel(
      createWheelEvent({ deltaX: 0, deltaY: 10, timeStamp: 600 }),
    )
    // Only 1 event in buffer now, not enough for direction detection.
    expect(result.direction).toBe('none')
  })
})
