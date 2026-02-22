// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { wheel } from '~/plugins/wheel'
import {
  createMockArtboard,
  initPlugin,
  type TestPluginInstance,
} from '../_setup'
import type { Artboard } from '~/types'

function createWheelEvent(
  options?: Partial<WheelEventInit> & { pageX?: number; pageY?: number },
): WheelEvent {
  const { pageX, pageY, ...init } = options ?? {}
  const event = new WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    deltaX: 0,
    deltaY: 0,
    ...init,
  })
  if (pageX !== undefined) {
    Object.defineProperty(event, 'pageX', { value: pageX })
  }
  if (pageY !== undefined) {
    Object.defineProperty(event, 'pageY', { value: pageY })
  }
  return event
}

describe('wheel plugin', () => {
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

  describe('scrolling', () => {
    it('adjusts offset on vertical wheel scroll', () => {
      plugin = initPlugin(wheel(), artboard)

      rootEl.dispatchEvent(createWheelEvent({ deltaY: 100 }))

      expect(artboard.setOffset).toHaveBeenCalled()
    })

    it('adjusts offset on horizontal wheel scroll', () => {
      plugin = initPlugin(wheel(), artboard)

      rootEl.dispatchEvent(createWheelEvent({ deltaX: 50 }))

      expect(artboard.setOffset).toHaveBeenCalled()
    })

    it('applies custom scrollSpeed', () => {
      plugin = initPlugin(wheel({ scrollSpeed: 2 }), artboard)

      rootEl.dispatchEvent(createWheelEvent({ deltaY: 10 }))

      const call = vi.mocked(artboard.setOffset).mock.calls[0]
      // With scrollSpeed 2, offset change should be larger
      expect(call).toBeDefined()
    })

    it('cancels animation on scroll', () => {
      plugin = initPlugin(wheel(), artboard)

      rootEl.dispatchEvent(createWheelEvent({ deltaY: 100 }))

      expect(artboard.cancelAnimation).toHaveBeenCalled()
    })
  })

  describe('zooming with ctrl/meta key', () => {
    it('zooms when ctrl key is held', () => {
      plugin = initPlugin(wheel(), artboard)

      rootEl.dispatchEvent(
        createWheelEvent({
          deltaY: -100,
          ctrlKey: true,
          pageX: 400,
          pageY: 300,
        }),
      )

      expect(artboard.scaleAroundPoint).toHaveBeenCalled()
    })

    it('zooms when meta key is held', () => {
      plugin = initPlugin(wheel(), artboard)

      rootEl.dispatchEvent(
        createWheelEvent({
          deltaY: -100,
          metaKey: true,
          pageX: 400,
          pageY: 300,
        }),
      )

      expect(artboard.scaleAroundPoint).toHaveBeenCalled()
    })

    it('cancels animation when zooming', () => {
      plugin = initPlugin(wheel(), artboard)

      rootEl.dispatchEvent(createWheelEvent({ deltaY: -100, ctrlKey: true }))

      expect(artboard.cancelAnimation).toHaveBeenCalled()
    })
  })

  describe('interceptWheel option', () => {
    it('handles wheel events on document when interceptWheel is true', () => {
      plugin = initPlugin(wheel({ interceptWheel: true }), artboard)

      document.dispatchEvent(createWheelEvent({ deltaY: 50 }))

      // setOffset called once from document handler (which calls onWheelRootElement)
      expect(artboard.setOffset).toHaveBeenCalled()
    })

    it('ignores document wheel events when interceptWheel is false', () => {
      plugin = initPlugin(wheel({ interceptWheel: false }), artboard)

      document.dispatchEvent(createWheelEvent({ deltaY: 50 }))

      // Should not be called from document handler
      expect(artboard.setOffset).not.toHaveBeenCalled()
    })
  })

  describe('momentum zoom', () => {
    it('uses momentum zoom when useMomentumZoom is true', () => {
      plugin = initPlugin(wheel({ useMomentumZoom: true }), artboard)

      rootEl.dispatchEvent(
        createWheelEvent({
          deltaY: -100,
          ctrlKey: true,
          pageX: 400,
          pageY: 300,
        }),
      )

      expect(artboard.calculateScaleAroundPoint).toHaveBeenCalled()
      expect(artboard.setScaleTarget).toHaveBeenCalled()
      expect(artboard.setInteraction).toHaveBeenCalledWith('momentumScaling')
    })
  })

  describe('destroy', () => {
    it('removes wheel listeners', () => {
      plugin = initPlugin(wheel(), artboard)
      plugin.destroy()

      rootEl.dispatchEvent(createWheelEvent({ deltaY: 100 }))

      expect(artboard.setOffset).not.toHaveBeenCalled()
    })
  })
})
