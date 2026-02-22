import { describe, it, expect, vi } from 'vitest'
import { prepareForDrag } from '~/helpers/artboard'
import type { Artboard } from '~/types'

function createMockArtboard(
  offset = { x: 0, y: 0 },
  boundaries = { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
  springDamping = 0.5,
): Artboard {
  const state = { offset: { ...offset } }

  return {
    getOffset: () => ({ ...state.offset }),
    getBoundaries: () => boundaries,
    cancelAnimation: vi.fn(),
    setInteraction: vi.fn(),
    setMomentum: vi.fn(),
    setTouchDirection: vi.fn(),
    setOffset: vi.fn((x: number, y: number) => {
      state.offset.x = x
      state.offset.y = y
    }),
    options: {
      springDamping,
    },
  } as unknown as Artboard
}

describe('prepareForDrag', () => {
  it('cancels animation and sets interaction to dragging', () => {
    const artboard = createMockArtboard()
    prepareForDrag(artboard)

    expect(artboard.cancelAnimation).toHaveBeenCalled()
    expect(artboard.setInteraction).toHaveBeenCalledWith('dragging')
  })

  it('resets momentum and touch direction', () => {
    const artboard = createMockArtboard()
    prepareForDrag(artboard)

    expect(artboard.setMomentum).toHaveBeenCalled()
    expect(artboard.setTouchDirection).toHaveBeenCalledWith('none')
  })

  it('returns the initial offset when within boundaries', () => {
    const artboard = createMockArtboard({ x: 100, y: 50 })
    const result = prepareForDrag(artboard)

    // When within boundaries, dampenRelative returns the same value,
    // so dampedX = offset.x, and the adjustment is 0.
    expect(result.x).toBeCloseTo(100)
    expect(result.y).toBeCloseTo(50)
  })

  it('calls setOffset with the computed drag start offset', () => {
    const artboard = createMockArtboard({ x: 100, y: 50 })
    const result = prepareForDrag(artboard)

    expect(artboard.setOffset).toHaveBeenCalledWith(result.x, result.y)
  })

  it('adjusts offset when outside boundaries (reverses damping)', () => {
    // Offset is beyond boundary (xMax=500), so dampenRelative will dampen it.
    const artboard = createMockArtboard(
      { x: 600, y: 0 },
      { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
      0.5,
    )
    const result = prepareForDrag(artboard)

    // The offset should be adjusted to reverse the damping effect.
    // dampenRelative(600, -500, 500, 0.5) dampens the 100px overshoot.
    // The result offset will differ from the raw input offset.
    expect(result.x).not.toBe(600)
    expect(artboard.setOffset).toHaveBeenCalled()
  })

  it('returns unchanged offset for y within boundaries', () => {
    const artboard = createMockArtboard(
      { x: 0, y: 200 },
      { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
    )
    const result = prepareForDrag(artboard)
    expect(result.y).toBeCloseTo(200)
  })
})
