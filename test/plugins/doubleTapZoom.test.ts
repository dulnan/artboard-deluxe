// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { doubleTapZoom } from '~/plugins/doubleTapZoom'
import {
  createMockArtboard,
  initPlugin,
  type TestPluginInstance,
} from '../_setup'
import type { Artboard } from '~/types'

function createTouchEvent(
  type: string,
  options?: {
    timeStamp?: number
    touches?: Array<{ pageX: number; pageY: number }>
  },
): TouchEvent {
  const touches = (options?.touches ?? [{ pageX: 100, pageY: 100 }]).map(
    (t) => ({ ...t, clientX: t.pageX, clientY: t.pageY }),
  )

  const event = new Event(type, { bubbles: true }) as Event & {
    touches: typeof touches
    pageX: number
    pageY: number
  }
  event.touches = touches
  // getEventCoords falls through to the MouseEvent branch in jsdom
  // (no window.TouchEvent), so it reads e.pageX / e.pageY
  event.pageX = touches[0]!.pageX
  event.pageY = touches[0]!.pageY
  Object.defineProperty(event, 'timeStamp', {
    value: options?.timeStamp ?? 0,
    writable: false,
  })

  return event as unknown as TouchEvent
}

describe('doubleTapZoom plugin', () => {
  let artboard: Artboard
  let rootEl: HTMLElement
  let plugin: TestPluginInstance

  beforeEach(() => {
    artboard = createMockArtboard()
    rootEl = artboard.getRootElement()
    plugin = initPlugin(doubleTapZoom(), artboard)
  })

  afterEach(() => {
    plugin.destroy()
  })

  it('does not zoom on a single tap', () => {
    rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 100 }))

    expect(artboard.scaleAroundPoint).not.toHaveBeenCalled()
  })

  it('zooms on two taps within 300ms at same offset', () => {
    rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 100 }))
    rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 350 }))

    expect(artboard.scaleAroundPoint).toHaveBeenCalledOnce()
  })

  it('does not zoom when taps are more than 300ms apart', () => {
    rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 100 }))
    rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 500 }))

    expect(artboard.scaleAroundPoint).not.toHaveBeenCalled()
  })

  it('ignores multi-touch events', () => {
    const multiTouch = createTouchEvent('touchstart', {
      timeStamp: 100,
      touches: [
        { pageX: 100, pageY: 100 },
        { pageX: 200, pageY: 200 },
      ],
    })

    rootEl.dispatchEvent(multiTouch)
    rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 200 }))

    // First event was multi-touch so startTime was not set, second tap has no prior single tap
    expect(artboard.scaleAroundPoint).not.toHaveBeenCalled()
  })

  it('suppresses zoom when offset changes between taps (distance >= 10)', () => {
    // First tap records offset as { x: 0, y: 0 } (default mock)
    rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 100 }))

    // Simulate offset change (e.g. momentum scroll moved the artboard)
    vi.mocked(artboard.getOffset).mockReturnValue({ x: 15, y: 0 })

    rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 200 }))

    expect(artboard.scaleAroundPoint).not.toHaveBeenCalled()
  })

  describe('target scale', () => {
    it('zooms to 1 when currentScale >= 3', () => {
      vi.mocked(artboard.getFinalScale).mockReturnValue(3)

      rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 100 }))
      rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 200 }))

      expect(artboard.scaleAroundPoint).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        1,
        expect.any(Object),
      )
    })

    it('zooms to 6 when currentScale < 3', () => {
      vi.mocked(artboard.getFinalScale).mockReturnValue(1)

      rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 100 }))
      rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 200 }))

      expect(artboard.scaleAroundPoint).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        6,
        expect.any(Object),
      )
    })
  })

  it('passes custom animation option to scaleAroundPoint', () => {
    plugin.destroy()
    artboard = createMockArtboard()
    rootEl = artboard.getRootElement()
    const customAnimation = { duration: 300, easing: 'easeOutCubic' as const }
    plugin = initPlugin(doubleTapZoom({ animation: customAnimation }), artboard)

    rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 100 }))
    rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 200 }))

    expect(artboard.scaleAroundPoint).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      customAnimation,
    )
  })

  it('removes touchstart listener on destroy', () => {
    plugin.destroy()

    rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 100 }))
    rootEl.dispatchEvent(createTouchEvent('touchstart', { timeStamp: 200 }))

    expect(artboard.scaleAroundPoint).not.toHaveBeenCalled()
  })
})
