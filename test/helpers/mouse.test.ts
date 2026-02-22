import { describe, it, expect } from 'vitest'
import { MOUSE_BUTTONS } from '~/helpers/mouse'

describe('MOUSE_BUTTONS', () => {
  it('has the correct values per MDN spec', () => {
    expect(MOUSE_BUTTONS.NONE).toBe(0)
    expect(MOUSE_BUTTONS.PRIMARY).toBe(1)
    expect(MOUSE_BUTTONS.SECONDARY).toBe(2)
    expect(MOUSE_BUTTONS.AUXILIARY).toBe(4)
    expect(MOUSE_BUTTONS.FOURTH).toBe(8)
    expect(MOUSE_BUTTONS.FIFTH).toBe(16)
  })

  it('is frozen', () => {
    expect(Object.isFrozen(MOUSE_BUTTONS)).toBe(true)
  })

  it('values are powers of 2 (bitfield)', () => {
    const values = Object.values(MOUSE_BUTTONS).filter((v) => v > 0)
    for (const v of values) {
      expect(v & (v - 1)).toBe(0) // Power of 2 check
    }
  })
})
