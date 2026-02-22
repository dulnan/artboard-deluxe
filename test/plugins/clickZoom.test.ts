// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { clickZoom } from '~/plugins/clickZoom'
import {
  createMockArtboard,
  initPlugin,
  type TestPluginInstance,
} from '../_setup'
import type { Artboard } from '~/types'

function createPointerEvent(
  type: string,
  options?: Partial<PointerEventInit>,
): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    clientX: 100,
    clientY: 100,
    pointerType: 'mouse',
    ...options,
  })
}

describe('clickZoom plugin', () => {
  let artboard: Artboard
  let rootEl: HTMLElement
  let plugin: TestPluginInstance

  beforeEach(() => {
    artboard = createMockArtboard()
    rootEl = artboard.getRootElement()
    plugin = initPlugin(clickZoom(), artboard)
  })

  afterEach(() => {
    plugin.destroy()
  })

  it('zooms when pointer down and up at the same position', () => {
    rootEl.dispatchEvent(
      createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }),
    )
    rootEl.dispatchEvent(
      createPointerEvent('pointerup', { clientX: 50, clientY: 50 }),
    )

    expect(artboard.scaleAroundPoint).toHaveBeenCalledOnce()
  })

  it('does not zoom when pointer moves more than 10px', () => {
    rootEl.dispatchEvent(
      createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }),
    )
    rootEl.dispatchEvent(
      createPointerEvent('pointerup', { clientX: 65, clientY: 50 }),
    )

    expect(artboard.scaleAroundPoint).not.toHaveBeenCalled()
  })

  it('does not zoom when distance is exactly at the threshold boundary', () => {
    // distance of ~11px diagonal
    rootEl.dispatchEvent(
      createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }),
    )
    rootEl.dispatchEvent(
      createPointerEvent('pointerup', { clientX: 58, clientY: 58 }),
    )

    // sqrt(8^2 + 8^2) ≈ 11.3 > 10
    expect(artboard.scaleAroundPoint).not.toHaveBeenCalled()
  })

  it('zooms when distance is within threshold', () => {
    rootEl.dispatchEvent(
      createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }),
    )
    rootEl.dispatchEvent(
      createPointerEvent('pointerup', { clientX: 55, clientY: 55 }),
    )

    // sqrt(5^2 + 5^2) ≈ 7.07 < 10
    expect(artboard.scaleAroundPoint).toHaveBeenCalledOnce()
  })

  it('does not zoom when wasMomentumScrolling returns true', () => {
    vi.mocked(artboard.wasMomentumScrolling).mockReturnValue(true)

    rootEl.dispatchEvent(
      createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }),
    )
    rootEl.dispatchEvent(
      createPointerEvent('pointerup', { clientX: 50, clientY: 50 }),
    )

    expect(artboard.scaleAroundPoint).not.toHaveBeenCalled()
  })

  it('does not zoom on pointerup without prior pointerdown', () => {
    rootEl.dispatchEvent(
      createPointerEvent('pointerup', { clientX: 50, clientY: 50 }),
    )

    expect(artboard.scaleAroundPoint).not.toHaveBeenCalled()
  })

  describe('touch self-destruct', () => {
    it('destroys itself on touch pointerdown', () => {
      rootEl.dispatchEvent(
        createPointerEvent('pointerdown', { pointerType: 'touch' }),
      )

      // After destroy, mouse events should have no effect
      rootEl.dispatchEvent(
        createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }),
      )
      rootEl.dispatchEvent(
        createPointerEvent('pointerup', { clientX: 50, clientY: 50 }),
      )

      expect(artboard.scaleAroundPoint).not.toHaveBeenCalled()
    })
  })

  describe('target scale logic', () => {
    it('zooms to scale 1 when current scale is less than 1', () => {
      vi.mocked(artboard.getFinalScale).mockReturnValue(0.5)

      rootEl.dispatchEvent(
        createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }),
      )
      rootEl.dispatchEvent(
        createPointerEvent('pointerup', { clientX: 50, clientY: 50 }),
      )

      // Third argument is the target scale
      expect(artboard.scaleAroundPoint).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        1,
        expect.any(Object),
      )
    })

    it('zooms to maxScale when scale is between 1 and threshold', () => {
      // maxScale = 5, threshold = 2.5, so scale 1.5 is between 1 and threshold
      vi.mocked(artboard.getFinalScale).mockReturnValue(1.5)

      rootEl.dispatchEvent(
        createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }),
      )
      rootEl.dispatchEvent(
        createPointerEvent('pointerup', { clientX: 50, clientY: 50 }),
      )

      expect(artboard.scaleAroundPoint).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        5, // maxScale
        expect.any(Object),
      )
    })

    it('zooms to 1 when scale is at or above threshold', () => {
      // maxScale = 5, threshold = 2.5
      vi.mocked(artboard.getFinalScale).mockReturnValue(3)

      rootEl.dispatchEvent(
        createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }),
      )
      rootEl.dispatchEvent(
        createPointerEvent('pointerup', { clientX: 50, clientY: 50 }),
      )

      expect(artboard.scaleAroundPoint).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        1,
        expect.any(Object),
      )
    })
  })

  describe('custom animation option', () => {
    it('passes custom animation to scaleAroundPoint', () => {
      plugin.destroy()
      artboard = createMockArtboard()
      rootEl = artboard.getRootElement()
      const customAnimation = { duration: 300, easing: 'easeOutCubic' as const }
      plugin = initPlugin(clickZoom({ animation: customAnimation }), artboard)

      rootEl.dispatchEvent(
        createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }),
      )
      rootEl.dispatchEvent(
        createPointerEvent('pointerup', { clientX: 50, clientY: 50 }),
      )

      expect(artboard.scaleAroundPoint).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        customAnimation,
      )
    })
  })
})
