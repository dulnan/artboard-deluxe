// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { scrollbar } from '~/plugins/scrollbar'
import {
  createMockArtboard,
  initPlugin,
  createLoopContext,
  type TestPluginInstance,
} from '../_setup'
import type { Artboard } from '~/types'

function createScrollbarElements(): {
  scrollbarEl: HTMLElement
  thumbEl: HTMLElement
} {
  const scrollbarEl = document.createElement('div')
  const thumbEl = document.createElement('div')
  thumbEl.classList.add('artboard-thumb')
  scrollbarEl.appendChild(thumbEl)
  return { scrollbarEl, thumbEl }
}

describe('scrollbar plugin', () => {
  let artboard: Artboard
  let scrollbarEl: HTMLElement
  let thumbEl: HTMLElement
  let plugin: TestPluginInstance

  beforeEach(() => {
    artboard = createMockArtboard()
    const els = createScrollbarElements()
    scrollbarEl = els.scrollbarEl
    thumbEl = els.thumbEl
  })

  afterEach(() => {
    plugin?.destroy()
  })

  describe('initialization', () => {
    it('sets initial styles on thumb element', () => {
      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'y' }),
        artboard,
      )

      expect(thumbEl.style.position).toBe('absolute')
      expect(thumbEl.style.top).toBe('0px')
      expect(thumbEl.style.left).toBe('0px')
    })

    it('calls artboard.observeSizeChange for the scrollbar element', () => {
      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'y' }),
        artboard,
      )

      expect(artboard.observeSizeChange).toHaveBeenCalledWith(
        scrollbarEl,
        expect.any(Function),
      )
    })
  })

  describe('loop — thumb positioning', () => {
    it('positions thumb based on scroll progress for y orientation', () => {
      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'y' }),
        artboard,
      )

      const ctx = createLoopContext({
        rootSize: { width: 800, height: 600 },
        offset: { x: 0, y: 0 },
        boundaries: { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
      })

      plugin.loop(ctx)

      // Thumb should have a transform set
      expect(thumbEl.style.transform).toBeTruthy()
    })

    it('uses width/x for x orientation', () => {
      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'x' }),
        artboard,
      )

      const ctx = createLoopContext({
        rootSize: { width: 800, height: 600 },
        offset: { x: 0, y: 0 },
        boundaries: { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
      })

      plugin.loop(ctx)

      // Should set width (not height) for x orientation
      expect(thumbEl.style.width).toBeTruthy()
    })

    it('uses height/y for y orientation', () => {
      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'y' }),
        artboard,
      )

      const ctx = createLoopContext({
        rootSize: { width: 800, height: 600 },
        offset: { x: 0, y: 0 },
        boundaries: { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
      })

      plugin.loop(ctx)

      expect(thumbEl.style.height).toBeTruthy()
    })

    it('enforces minThumbSize (default 32)', () => {
      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'y' }),
        artboard,
      )

      // Very large scroll area relative to root => thumb would be tiny
      const ctx = createLoopContext({
        rootSize: { width: 800, height: 100 },
        offset: { x: 0, y: 0 },
        boundaries: { xMin: -5000, xMax: 5000, yMin: -5000, yMax: 5000 },
      })

      plugin.loop(ctx)

      // The height should be at least 32px (minThumbSize)
      const height = parseInt(thumbEl.style.height)
      expect(height).toBeGreaterThanOrEqual(32)
    })

    it('handles overscroll: thumb clamps to start when scrollProgress < 0', () => {
      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'y' }),
        artboard,
      )

      // Offset beyond max boundary => scrollProgress < 0
      const ctx = createLoopContext({
        rootSize: { width: 800, height: 600 },
        offset: { x: 0, y: 600 },
        boundaries: { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
      })

      plugin.loop(ctx)

      // Transform should position thumb at y=0 (clamped to top)
      expect(thumbEl.style.transform).toContain('0px, 0px')
    })
  })

  describe('click on scrollbar', () => {
    it('calls scrollPageUp when clicking above thumb (y orientation)', () => {
      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'y' }),
        artboard,
      )

      // Use rootSize.height=300 to match default scrollbarSize (300).
      // offset=-200 gives scrollProgress≈0.7, placing thumb in the middle.
      const ctx = createLoopContext({
        rootSize: { width: 300, height: 300 },
        offset: { x: 0, y: -200 },
        boundaries: { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
      })
      plugin.loop(ctx)

      const event = new MouseEvent('pointerdown', {
        bubbles: true,
      } as MouseEventInit)
      Object.defineProperty(event, 'offsetY', { value: 0 })
      scrollbarEl.dispatchEvent(event)

      expect(artboard.scrollPageUp).toHaveBeenCalled()
    })

    it('calls scrollPageDown when clicking below thumb (y orientation)', () => {
      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'y' }),
        artboard,
      )

      // First set thumb near the top
      const ctx = createLoopContext({
        rootSize: { width: 800, height: 600 },
        offset: { x: 0, y: 500 },
        boundaries: { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
      })
      plugin.loop(ctx)

      const event = new MouseEvent('pointerdown', {
        bubbles: true,
      } as MouseEventInit)
      Object.defineProperty(event, 'offsetY', { value: 999 })
      scrollbarEl.dispatchEvent(event)

      expect(artboard.scrollPageDown).toHaveBeenCalled()
    })

    it('calls scrollPageLeft when clicking left of thumb (x orientation)', () => {
      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'x' }),
        artboard,
      )

      // Use rootSize.width=300 to match default scrollbarSize (300).
      const ctx = createLoopContext({
        rootSize: { width: 300, height: 300 },
        offset: { x: -200, y: 0 },
        boundaries: { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
      })
      plugin.loop(ctx)

      const event = new MouseEvent('pointerdown', {
        bubbles: true,
      } as MouseEventInit)
      Object.defineProperty(event, 'offsetX', { value: 0 })
      scrollbarEl.dispatchEvent(event)

      expect(artboard.scrollPageLeft).toHaveBeenCalled()
    })

    it('calls scrollPageRight when clicking right of thumb (x orientation)', () => {
      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'x' }),
        artboard,
      )

      const ctx = createLoopContext({
        rootSize: { width: 800, height: 600 },
        offset: { x: 500, y: 0 },
        boundaries: { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
      })
      plugin.loop(ctx)

      const event = new MouseEvent('pointerdown', {
        bubbles: true,
      } as MouseEventInit)
      Object.defineProperty(event, 'offsetX', { value: 999 })
      scrollbarEl.dispatchEvent(event)

      expect(artboard.scrollPageRight).toHaveBeenCalled()
    })
  })

  describe('thumb drag', () => {
    it('calls cancelAnimation and setInteraction on pointerdown on thumb', () => {
      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'y' }),
        artboard,
      )

      const event = new MouseEvent('pointerdown', {
        bubbles: true,
        clientY: 50,
      } as MouseEventInit)

      thumbEl.dispatchEvent(event)

      expect(artboard.cancelAnimation).toHaveBeenCalled()
      expect(artboard.setInteraction).toHaveBeenCalled()
    })

    it('calls setOffset during pointer move after thumb drag', () => {
      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'y' }),
        artboard,
      )

      // Position thumb first so there's scroll context
      const ctx = createLoopContext({
        rootSize: { width: 800, height: 600 },
        offset: { x: 0, y: 0 },
        boundaries: { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
      })
      plugin.loop(ctx)

      // Start drag on thumb (buttons: 1 = primary button held)
      const downEvent = new PointerEvent('pointerdown', {
        bubbles: true,
        clientY: 50,
        buttons: 1,
      })
      thumbEl.dispatchEvent(downEvent)

      // onThumbMouseDown calls onThumbMouseMove(e) immediately at the end,
      // which calculates offset and calls setOffset
      expect(artboard.setOffset).toHaveBeenCalled()
    })
  })

  describe('destroy', () => {
    it('calls unobserve from the size change observer', () => {
      const unobserveMock = vi.fn()
      vi.mocked(artboard.observeSizeChange).mockReturnValue({
        unobserve: unobserveMock,
      })

      plugin = initPlugin(
        scrollbar({ element: scrollbarEl, orientation: 'y' }),
        artboard,
      )

      plugin.destroy()
      expect(unobserveMock).toHaveBeenCalled()
    })

    it('restores original thumb styles when restoreStyles is true', () => {
      // Set some initial styles that should be tracked
      thumbEl.style.position = 'relative'
      thumbEl.style.top = '10px'

      plugin = initPlugin(
        scrollbar({
          element: scrollbarEl,
          orientation: 'y',
          restoreStyles: true,
        }),
        artboard,
      )

      // Plugin overwrites styles
      expect(thumbEl.style.position).toBe('absolute')

      plugin.destroy()

      // Original styles should be restored
      expect(thumbEl.style.position).toBe('relative')
      expect(thumbEl.style.top).toBe('10px')
    })
  })
})
