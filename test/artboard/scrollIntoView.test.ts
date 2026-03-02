// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { createArtboard } from '~/artboard/createArtboard'
import type { Artboard } from '~/types'

// jsdom does not provide ResizeObserver.
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof globalThis.ResizeObserver

/**
 * Creates a real artboard instance for testing scrollIntoView.
 *
 * We use a real artboard because scrollIntoView is a closure-based function
 * that accesses internal state (offset, scale, rootSize, options).
 */
function createTestArtboard(
  rootWidth = 1000,
  rootHeight = 800,
  opts: { margin?: number; maxScale?: number } = {},
): Artboard {
  const rootEl = document.createElement('div')

  // jsdom doesn't compute layout, so we stub offsetWidth/offsetHeight.
  Object.defineProperty(rootEl, 'offsetWidth', { value: rootWidth })
  Object.defineProperty(rootEl, 'offsetHeight', { value: rootHeight })

  const artboard = createArtboard(rootEl, [], {
    margin: opts.margin ?? 0,
    maxScale: opts.maxScale ?? 10,
  })

  return artboard
}

describe('scrollIntoView', () => {
  let artboard: Artboard

  beforeEach(() => {
    artboard = createTestArtboard()
  })

  describe('default centering (block: center, inline: center)', () => {
    it('centers a target rect in the viewport', () => {
      artboard.scrollIntoView(
        { x: 100, y: 100, width: 200, height: 200 },
        { behavior: 'instant' },
      )

      const offset = artboard.getOffset()
      // center: offsetX = (1000 - 200) / 2 - 100 = 300
      // center: offsetY = (800 - 200) / 2 - 100 = 200
      expect(offset.x).toBeCloseTo(300)
      expect(offset.y).toBeCloseTo(200)
    })

    it('preserves backward compatibility with no new options', () => {
      artboard.scrollIntoView(
        { x: 50, y: 50, width: 400, height: 300 },
        { behavior: 'instant' },
      )

      const offset = artboard.getOffset()
      // center: offsetX = (1000 - 400) / 2 - 50 = 250
      // center: offsetY = (800 - 300) / 2 - 50 = 200
      expect(offset.x).toBeCloseTo(250)
      expect(offset.y).toBeCloseTo(200)
    })
  })

  describe('block alignment', () => {
    it('block: start aligns target top with viewport top', () => {
      artboard.scrollIntoView(
        { x: 0, y: 100, width: 200, height: 200 },
        { behavior: 'instant', block: 'start' },
      )

      const offset = artboard.getOffset()
      // start: offsetY = 0 - 100 = -100
      expect(offset.y).toBeCloseTo(-100)
    })

    it('block: end aligns target bottom with viewport bottom', () => {
      artboard.scrollIntoView(
        { x: 0, y: 100, width: 200, height: 200 },
        { behavior: 'instant', block: 'end' },
      )

      const offset = artboard.getOffset()
      // end: offsetY = 0 + 800 - 200 - 100 = 500
      expect(offset.y).toBeCloseTo(500)
    })

    it('block: center centers target vertically', () => {
      artboard.scrollIntoView(
        { x: 0, y: 100, width: 200, height: 200 },
        { behavior: 'instant', block: 'center' },
      )

      const offset = artboard.getOffset()
      // center: offsetY = (800 - 200) / 2 - 100 = 200
      expect(offset.y).toBeCloseTo(200)
    })

    it('block: nearest does not scroll when target is visible', () => {
      // First position the target so it's visible.
      artboard.setOffset(-100, -100)

      artboard.scrollIntoView(
        { x: 100, y: 100, width: 200, height: 200 },
        { behavior: 'instant', block: 'nearest', inline: 'nearest' },
      )

      const offset = artboard.getOffset()
      // Target occupies y: -100 + 100 = 0 to 200. Viewport is 0..800. Visible.
      expect(offset.y).toBeCloseTo(-100)
    })

    it('block: nearest aligns start when target overflows on top', () => {
      // Target is above the viewport.
      artboard.setOffset(0, 500)

      artboard.scrollIntoView(
        { x: 0, y: 600, width: 200, height: 200 },
        { behavior: 'instant', block: 'nearest', inline: 'nearest' },
      )

      const offset = artboard.getOffset()
      // Target start in viewport: 500 + 600 = 1100. That's past the viewport end (800).
      // Overflows end → align end: 0 + 800 - 200 - 600 = 0
      expect(offset.y).toBeCloseTo(0)
    })

    it('block: nearest aligns start when target is larger than viewport', () => {
      artboard.setOffset(0, 0)

      artboard.scrollIntoView(
        { x: 0, y: 100, width: 200, height: 1000 },
        { behavior: 'instant', block: 'nearest' },
      )

      const offset = artboard.getOffset()
      // Target (1000) > viewport (800) → align start: 0 - 100 = -100
      expect(offset.y).toBeCloseTo(-100)
    })
  })

  describe('auto alignment', () => {
    it('block: auto centers when target fits in viewport', () => {
      artboard.scrollIntoView(
        { x: 0, y: 100, width: 200, height: 200 },
        { behavior: 'instant', block: 'auto' },
      )

      const offset = artboard.getOffset()
      // 200 < 800 → center: offsetY = (800 - 200) / 2 - 100 = 200
      expect(offset.y).toBeCloseTo(200)
    })

    it('block: auto aligns start when target is larger than viewport', () => {
      artboard.scrollIntoView(
        { x: 0, y: 100, width: 200, height: 1000 },
        { behavior: 'instant', block: 'auto' },
      )

      const offset = artboard.getOffset()
      // 1000 > 800 → start: offsetY = 0 - 100 = -100
      expect(offset.y).toBeCloseTo(-100)
    })

    it('inline: auto centers when target fits in viewport', () => {
      artboard.scrollIntoView(
        { x: 200, y: 0, width: 300, height: 200 },
        { behavior: 'instant', inline: 'auto' },
      )

      const offset = artboard.getOffset()
      // 300 < 1000 → center: offsetX = (1000 - 300) / 2 - 200 = 150
      expect(offset.x).toBeCloseTo(150)
    })

    it('inline: auto aligns start when target is larger than viewport', () => {
      artboard.scrollIntoView(
        { x: 200, y: 0, width: 1200, height: 200 },
        { behavior: 'instant', inline: 'auto' },
      )

      const offset = artboard.getOffset()
      // 1200 > 1000 → start: offsetX = 0 - 200 = -200
      expect(offset.x).toBeCloseTo(-200)
    })

    it('auto respects padding when deciding fit', () => {
      // Target is 900px wide. Without padding it fits in 1000px viewport.
      // With 100px padding on each side, effective width is 800px → doesn't fit.
      artboard.scrollIntoView(
        { x: 0, y: 0, width: 900, height: 200 },
        { behavior: 'instant', inline: 'auto', padding: 100 },
      )

      const offset = artboard.getOffset()
      // 900 > 800 (effective) → start: offsetX = 100 - 0 = 100
      expect(offset.x).toBeCloseTo(100)
    })
  })

  describe('inline alignment', () => {
    it('inline: start aligns target left with viewport left', () => {
      artboard.scrollIntoView(
        { x: 200, y: 0, width: 300, height: 200 },
        { behavior: 'instant', inline: 'start' },
      )

      const offset = artboard.getOffset()
      // start: offsetX = 0 - 200 = -200
      expect(offset.x).toBeCloseTo(-200)
    })

    it('inline: end aligns target right with viewport right', () => {
      artboard.scrollIntoView(
        { x: 200, y: 0, width: 300, height: 200 },
        { behavior: 'instant', inline: 'end' },
      )

      const offset = artboard.getOffset()
      // end: offsetX = 0 + 1000 - 300 - 200 = 500
      expect(offset.x).toBeCloseTo(500)
    })
  })

  describe('padding', () => {
    it('uniform padding reduces effective viewport', () => {
      artboard.scrollIntoView(
        { x: 100, y: 100, width: 200, height: 200 },
        { behavior: 'instant', padding: 50 },
      )

      const offset = artboard.getOffset()
      // effectiveWidth = 1000 - 50 - 50 = 900
      // effectiveHeight = 800 - 50 - 50 = 700
      // center: offsetX = 50 + (900 - 200) / 2 - 100 = 50 + 350 - 100 = 300
      // center: offsetY = 50 + (700 - 200) / 2 - 100 = 50 + 250 - 100 = 200
      expect(offset.x).toBeCloseTo(300)
      expect(offset.y).toBeCloseTo(200)
    })

    it('per-edge padding is applied correctly', () => {
      artboard.scrollIntoView(
        { x: 100, y: 100, width: 200, height: 200 },
        {
          behavior: 'instant',
          padding: { top: 100, right: 0, bottom: 0, left: 0 },
        },
      )

      const offset = artboard.getOffset()
      // effectiveHeight = 800 - 100 - 0 = 700
      // center: offsetY = 100 + (700 - 200) / 2 - 100 = 100 + 250 - 100 = 250
      expect(offset.y).toBeCloseTo(250)
      // X is unchanged (no padding on x): center = (1000 - 200)/2 - 100 = 300
      expect(offset.x).toBeCloseTo(300)
    })

    it('padding affects start alignment', () => {
      artboard.scrollIntoView(
        { x: 100, y: 100, width: 200, height: 200 },
        {
          behavior: 'instant',
          block: 'start',
          inline: 'start',
          padding: 50,
        },
      )

      const offset = artboard.getOffset()
      // start: offsetX = 50 - 100 = -50
      // start: offsetY = 50 - 100 = -50
      expect(offset.x).toBeCloseTo(-50)
      expect(offset.y).toBeCloseTo(-50)
    })

    it('padding affects end alignment', () => {
      artboard.scrollIntoView(
        { x: 100, y: 100, width: 200, height: 200 },
        {
          behavior: 'instant',
          block: 'end',
          inline: 'end',
          padding: 50,
        },
      )

      const offset = artboard.getOffset()
      // effectiveWidth = 900, effectiveHeight = 700
      // end: offsetX = 50 + 900 - 200 - 100 = 650
      // end: offsetY = 50 + 700 - 200 - 100 = 450
      expect(offset.x).toBeCloseTo(650)
      expect(offset.y).toBeCloseTo(450)
    })
  })

  describe('padding with scale: full', () => {
    it('uses effective viewport for scaling', () => {
      artboard.scrollIntoView(
        { x: 0, y: 0, width: 500, height: 500 },
        { behavior: 'instant', scale: 'full', padding: 100 },
      )

      const scale = artboard.getScale()
      // effectiveWidth = 1000 - 200 = 800
      // effectiveHeight = 800 - 200 = 600
      // scaleX = 800 / 500 = 1.6, scaleY = 600 / 500 = 1.2
      // min(1.6, 1.2, 10) = 1.2
      expect(scale).toBeCloseTo(1.2)
    })
  })

  describe('axis restriction', () => {
    it('axis: x only scrolls horizontally', () => {
      artboard.setOffset(0, 42)

      artboard.scrollIntoView(
        { x: 200, y: 200, width: 100, height: 100 },
        { behavior: 'instant', axis: 'x' },
      )

      const offset = artboard.getOffset()
      // X should be centered: (1000 - 100) / 2 - 200 = 250
      expect(offset.x).toBeCloseTo(250)
      // Y should remain unchanged.
      expect(offset.y).toBeCloseTo(42)
    })

    it('axis: y only scrolls vertically', () => {
      artboard.setOffset(42, 0)

      artboard.scrollIntoView(
        { x: 200, y: 200, width: 100, height: 100 },
        { behavior: 'instant', axis: 'y' },
      )

      const offset = artboard.getOffset()
      // X should remain unchanged.
      expect(offset.x).toBeCloseTo(42)
      // Y should be centered: (800 - 100) / 2 - 200 = 150
      expect(offset.y).toBeCloseTo(150)
    })
  })

  describe('scale: full without padding', () => {
    it('scales to fit the target in the viewport', () => {
      artboard.scrollIntoView(
        { x: 0, y: 0, width: 2000, height: 1600 },
        { behavior: 'instant', scale: 'full' },
      )

      const scale = artboard.getScale()
      // scaleX = 1000 / 2000 = 0.5, scaleY = 800 / 1600 = 0.5
      expect(scale).toBeCloseTo(0.5)
    })

    it('respects margin when scaling', () => {
      const ab = createTestArtboard(1000, 800, { margin: 50 })
      ab.scrollIntoView(
        { x: 0, y: 0, width: 1000, height: 800 },
        { behavior: 'instant', scale: 'full' },
      )

      const scale = ab.getScale()
      // scaleX = (1000 - 100) / 1000 = 0.9, scaleY = (800 - 100) / 800 = 0.875
      expect(scale).toBeCloseTo(0.875)
    })
  })

  describe('nearest on both axes', () => {
    it('does not scroll when target is fully visible', () => {
      // Place the target at (0, 0) with size 200x200.
      // With offset (0, 0), target appears at 0..200 in viewport — fully visible.
      artboard.setOffset(0, 0)

      artboard.scrollIntoView(
        { x: 0, y: 0, width: 200, height: 200 },
        { behavior: 'instant', block: 'nearest', inline: 'nearest' },
      )

      const offset = artboard.getOffset()
      expect(offset.x).toBeCloseTo(0)
      expect(offset.y).toBeCloseTo(0)
    })
  })
})
