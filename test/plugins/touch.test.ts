// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { touch } from '~/plugins/touch'
import {
  createMockArtboard,
  initPlugin,
  type TestPluginInstance,
} from '../_setup'
import type { Artboard } from '~/types'

function createTouchEvent(
  type: string,
  options?: {
    touches?: Array<{ clientX: number; clientY: number }>
    changedTouches?: Array<{ clientX: number; clientY: number }>
    timeStamp?: number
  },
): TouchEvent {
  const touches = options?.touches ?? [{ clientX: 100, clientY: 100 }]
  const changedTouches = options?.changedTouches ?? touches

  const event = new Event(type, {
    bubbles: true,
    cancelable: true,
  }) as Event & {
    touches: typeof touches
    changedTouches: typeof changedTouches
  }
  event.touches = touches
  event.changedTouches = changedTouches
  event.preventDefault = vi.fn() as typeof event.preventDefault
  event.stopPropagation = vi.fn() as typeof event.stopPropagation
  event.stopImmediatePropagation =
    vi.fn() as typeof event.stopImmediatePropagation
  if (options?.timeStamp !== undefined) {
    Object.defineProperty(event, 'timeStamp', { value: options.timeStamp })
  }
  return event as unknown as TouchEvent
}

describe('touch plugin', () => {
  let artboard: Artboard
  let rootEl: HTMLElement
  let plugin: TestPluginInstance

  beforeEach(() => {
    artboard = createMockArtboard()
    rootEl = artboard.getRootElement()
  })

  afterEach(() => {
    plugin?.destroy()
  })

  describe('single touch drag', () => {
    it('starts drag on single touch', () => {
      plugin = initPlugin(touch(), artboard)

      rootEl.dispatchEvent(
        createTouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 }],
        }),
      )

      // prepareForDrag sets interaction to 'dragging'
      expect(artboard.setInteraction).toHaveBeenCalledWith('dragging')
    })

    it('calls setDirectionOffset on touchmove', () => {
      plugin = initPlugin(touch(), artboard)

      rootEl.dispatchEvent(
        createTouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 }],
        }),
      )

      rootEl.dispatchEvent(
        createTouchEvent('touchmove', {
          touches: [{ clientX: 150, clientY: 120 }],
        }),
      )

      expect(artboard.setDirectionOffset).toHaveBeenCalled()
    })

    it('starts momentum on touchend', () => {
      plugin = initPlugin(touch(), artboard)

      rootEl.dispatchEvent(
        createTouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 }],
        }),
      )

      rootEl.dispatchEvent(
        createTouchEvent('touchmove', {
          touches: [{ clientX: 150, clientY: 120 }],
        }),
      )

      rootEl.dispatchEvent(
        createTouchEvent('touchend', {
          touches: [],
          changedTouches: [{ clientX: 150, clientY: 120 }],
        }),
      )

      expect(artboard.startMomentum).toHaveBeenCalled()
    })
  })

  describe('pinch zoom (two touches)', () => {
    it('records initial touch distance on two-finger touchstart', () => {
      plugin = initPlugin(touch(), artboard)

      rootEl.dispatchEvent(
        createTouchEvent('touchstart', {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
        }),
      )

      // No error thrown and the plugin is ready for scaling
      expect(artboard.getScale).toHaveBeenCalled()
    })

    it('sets scale on two-finger touchmove', () => {
      plugin = initPlugin(touch(), artboard)

      rootEl.dispatchEvent(
        createTouchEvent('touchstart', {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
        }),
      )

      // First touchmove initializes drag state (lastTouch is null) and returns
      rootEl.dispatchEvent(
        createTouchEvent('touchmove', {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
        }),
      )

      // Second touchmove actually processes the scale
      rootEl.dispatchEvent(
        createTouchEvent('touchmove', {
          touches: [
            { clientX: 80, clientY: 80 },
            { clientX: 220, clientY: 220 },
          ],
        }),
      )

      expect(artboard.setScale).toHaveBeenCalled()
      expect(artboard.setInteraction).toHaveBeenCalledWith('scaling')
    })

    it('sets offset during pinch to follow focal point', () => {
      plugin = initPlugin(touch(), artboard)

      rootEl.dispatchEvent(
        createTouchEvent('touchstart', {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
        }),
      )

      rootEl.dispatchEvent(
        createTouchEvent('touchmove', {
          touches: [
            { clientX: 80, clientY: 80 },
            { clientX: 220, clientY: 220 },
          ],
        }),
      )

      expect(artboard.setOffset).toHaveBeenCalled()
    })
  })

  describe('useTwoTouchScrolling option', () => {
    it('ignores single touch when useTwoTouchScrolling is true', () => {
      plugin = initPlugin(touch({ useTwoTouchScrolling: true }), artboard)

      rootEl.dispatchEvent(
        createTouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 }],
        }),
      )

      // prepareForDrag should NOT be called
      expect(artboard.setInteraction).not.toHaveBeenCalledWith('dragging')
    })

    it('ignores single touch move when useTwoTouchScrolling is true', () => {
      plugin = initPlugin(touch({ useTwoTouchScrolling: true }), artboard)

      rootEl.dispatchEvent(
        createTouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 }],
        }),
      )

      const moveEvent = createTouchEvent('touchmove', {
        touches: [{ clientX: 150, clientY: 120 }],
      })

      rootEl.dispatchEvent(moveEvent)

      expect(moveEvent.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('touchend transitions', () => {
    it('transitions from scaling to dragging when one finger lifts', () => {
      plugin = initPlugin(touch(), artboard)

      // Start two-finger gesture
      rootEl.dispatchEvent(
        createTouchEvent('touchstart', {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
        }),
      )

      rootEl.dispatchEvent(
        createTouchEvent('touchmove', {
          touches: [
            { clientX: 80, clientY: 80 },
            { clientX: 220, clientY: 220 },
          ],
        }),
      )

      // Mock that we're now in scaling interaction
      vi.mocked(artboard.getInteraction).mockReturnValue('scaling')

      // One finger lifts
      rootEl.dispatchEvent(
        createTouchEvent('touchend', {
          touches: [{ clientX: 80, clientY: 80 }],
          changedTouches: [{ clientX: 220, clientY: 220 }],
        }),
      )

      expect(artboard.setInteraction).toHaveBeenCalledWith('dragging')
      expect(artboard.setTouchDirection).toHaveBeenCalledWith('both')
    })

    it('stops propagation on touchend during active interaction', () => {
      vi.mocked(artboard.getInteraction).mockReturnValue('dragging')
      plugin = initPlugin(touch(), artboard)

      const endEvent = createTouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 100, clientY: 100 }],
      })

      rootEl.dispatchEvent(endEvent)

      expect(endEvent.stopImmediatePropagation).toHaveBeenCalled()
    })
  })

  describe('destroy', () => {
    it('removes all touch event listeners', () => {
      plugin = initPlugin(touch(), artboard)
      plugin.destroy()

      // Reset the mocks to check nothing fires after destroy
      vi.mocked(artboard.setInteraction).mockClear()
      vi.mocked(artboard.cancelAnimation).mockClear()

      rootEl.dispatchEvent(
        createTouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 }],
        }),
      )

      expect(artboard.setInteraction).not.toHaveBeenCalled()
    })
  })
})
