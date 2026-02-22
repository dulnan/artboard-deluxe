// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { overview } from '~/plugins/overview'
import {
  createMockArtboard,
  initPlugin,
  createLoopContext,
  type TestPluginInstance,
} from '../_setup'
import type { Artboard } from '~/types'

function createOverviewElements(): {
  overviewEl: HTMLElement
  artboardEl: HTMLElement
  visibleEl: HTMLElement
} {
  const overviewEl = document.createElement('div')
  const artboardEl = document.createElement('div')
  const visibleEl = document.createElement('div')

  artboardEl.classList.add('artboard-overview-artboard')
  visibleEl.classList.add('artboard-overview-visible')

  overviewEl.appendChild(artboardEl)
  overviewEl.appendChild(visibleEl)

  Object.defineProperty(overviewEl, 'offsetWidth', {
    value: 200,
    configurable: true,
  })
  Object.defineProperty(overviewEl, 'offsetHeight', {
    value: 150,
    configurable: true,
  })

  return { overviewEl, artboardEl, visibleEl }
}

describe('overview plugin', () => {
  let artboard: Artboard
  let overviewEl: HTMLElement
  let artboardEl: HTMLElement
  let visibleEl: HTMLElement
  let plugin: TestPluginInstance

  beforeEach(() => {
    artboard = createMockArtboard()
    const els = createOverviewElements()
    overviewEl = els.overviewEl
    artboardEl = els.artboardEl
    visibleEl = els.visibleEl
  })

  afterEach(() => {
    plugin?.destroy()
  })

  describe('initialization', () => {
    it('sets initial styles on artboard element', () => {
      plugin = initPlugin(overview({ element: overviewEl }), artboard)

      expect(artboardEl.style.position).toBe('absolute')
      expect(artboardEl.style.top).toBe('0px')
      expect(artboardEl.style.left).toBe('0px')
      expect(artboardEl.style.transformOrigin).toBe('0 0')
      expect(artboardEl.style.pointerEvents).toBe('none')
    })

    it('sets initial styles on visible area element', () => {
      plugin = initPlugin(overview({ element: overviewEl }), artboard)

      expect(visibleEl.style.position).toBe('absolute')
      expect(visibleEl.style.top).toBe('0px')
      expect(visibleEl.style.left).toBe('0px')
      expect(visibleEl.style.transformOrigin).toBe('0 0')
      expect(visibleEl.style.cursor).toBe('move')
    })

    it('observes size changes on the overview element', () => {
      plugin = initPlugin(overview({ element: overviewEl }), artboard)

      expect(artboard.observeSizeChange).toHaveBeenCalledWith(
        overviewEl,
        expect.any(Function),
      )
    })

    it('sets position relative on static overview element', () => {
      overviewEl.style.position = 'static'

      plugin = initPlugin(overview({ element: overviewEl }), artboard)

      expect(overviewEl.style.position).toBe('relative')
    })

    it('does not override non-static position', () => {
      overviewEl.style.position = 'fixed'

      plugin = initPlugin(overview({ element: overviewEl }), artboard)

      expect(overviewEl.style.position).toBe('fixed')
    })
  })

  describe('loop — layout', () => {
    it('sizes and positions the artboard representation', () => {
      plugin = initPlugin(overview({ element: overviewEl }), artboard)

      const ctx = createLoopContext({
        artboardSize: { width: 1000, height: 800 },
        rootSize: { width: 800, height: 600 },
        scale: 1,
        offset: { x: 0, y: 0 },
      })
      plugin.loop(ctx)

      // The artboard element should have width and height set
      expect(artboardEl.style.width).toBeTruthy()
      expect(artboardEl.style.height).toBeTruthy()
    })

    it('sizes and positions the visible area', () => {
      plugin = initPlugin(overview({ element: overviewEl }), artboard)

      const ctx = createLoopContext({
        artboardSize: { width: 1000, height: 800 },
        rootSize: { width: 800, height: 600 },
        scale: 1,
        offset: { x: -100, y: -50 },
      })
      plugin.loop(ctx)

      expect(visibleEl.style.width).toBeTruthy()
      expect(visibleEl.style.height).toBeTruthy()
      expect(visibleEl.style.transform).toBeTruthy()
    })

    it('throws when artboardSize is null (infinite canvas)', () => {
      plugin = initPlugin(overview({ element: overviewEl }), artboard)

      const ctx = createLoopContext()
      ;(ctx as unknown as { artboardSize: null }).artboardSize = null

      expect(() => plugin.loop(ctx)).toThrow(
        'Overview plugin can not be used with infinite canvas.',
      )
    })
  })

  describe('autoHeight option', () => {
    it('sets height on the overview element when autoHeight is true', () => {
      plugin = initPlugin(
        overview({ element: overviewEl, autoHeight: true }),
        artboard,
      )

      const ctx = createLoopContext({
        artboardSize: { width: 1000, height: 500 },
        rootSize: { width: 800, height: 600 },
        scale: 1,
        offset: { x: 0, y: 0 },
      })
      plugin.loop(ctx)

      expect(overviewEl.style.height).toBeTruthy()
    })

    it('respects maxHeight when autoHeight is true', () => {
      plugin = initPlugin(
        overview({ element: overviewEl, autoHeight: true, maxHeight: 100 }),
        artboard,
      )

      // With a very tall artboard, calculated height would exceed maxHeight
      const ctx = createLoopContext({
        artboardSize: { width: 100, height: 2000 },
        rootSize: { width: 800, height: 600 },
        scale: 1,
        offset: { x: 0, y: 0 },
      })
      plugin.loop(ctx)

      const height = parseFloat(overviewEl.style.height)
      expect(height).toBeLessThanOrEqual(100)
    })
  })

  describe('pointer interactions', () => {
    it('cancels animation on pointerdown', () => {
      plugin = initPlugin(overview({ element: overviewEl }), artboard)

      const event = new PointerEvent('pointerdown', {
        bubbles: true,
        clientX: 50,
        clientY: 50,
      })
      // Need target to be an HTMLElement
      overviewEl.dispatchEvent(event)

      expect(artboard.cancelAnimation).toHaveBeenCalled()
    })

    it('moves visible area to click position when clicking outside visible area', () => {
      plugin = initPlugin(overview({ element: overviewEl }), artboard)

      // Run loop first to set up internal state
      const ctx = createLoopContext({
        artboardSize: { width: 1000, height: 800 },
        rootSize: { width: 800, height: 600 },
        scale: 1,
        offset: { x: 0, y: 0 },
      })
      plugin.loop(ctx)

      // Click on the artboard element (outside visible area)
      vi.spyOn(artboardEl, 'getBoundingClientRect').mockReturnValue({
        x: 0,
        y: 0,
        width: 200,
        height: 150,
        top: 0,
        left: 0,
        right: 200,
        bottom: 150,
        toJSON: () => {},
      })

      const event = new PointerEvent('pointerdown', {
        bubbles: true,
        clientX: 50,
        clientY: 50,
      })
      overviewEl.dispatchEvent(event)

      expect(artboard.setOffset).toHaveBeenCalled()
    })

    it('sets up drag on pointerdown and updates offset on pointermove', () => {
      plugin = initPlugin(overview({ element: overviewEl }), artboard)

      // Run loop to establish internal state
      const ctx = createLoopContext({
        artboardSize: { width: 1000, height: 800 },
        rootSize: { width: 800, height: 600 },
        scale: 1,
        offset: { x: 0, y: 0 },
      })
      plugin.loop(ctx)

      // Start drag on visible area
      overviewEl.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          clientX: 50,
          clientY: 50,
        }),
      )

      // Move pointer
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          clientX: 70,
          clientY: 60,
        }),
      )

      expect(artboard.setOffset).toHaveBeenCalled()
    })

    it('stops dragging on pointerup', () => {
      plugin = initPlugin(overview({ element: overviewEl }), artboard)

      const ctx = createLoopContext({
        artboardSize: { width: 1000, height: 800 },
        rootSize: { width: 800, height: 600 },
        scale: 1,
        offset: { x: 0, y: 0 },
      })
      plugin.loop(ctx)

      overviewEl.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          clientX: 50,
          clientY: 50,
        }),
      )

      document.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          clientX: 50,
          clientY: 50,
        }),
      )

      // After pointerup, further moves should not update offset
      vi.mocked(artboard.setOffset).mockClear()
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          clientX: 100,
          clientY: 100,
        }),
      )

      expect(artboard.setOffset).not.toHaveBeenCalled()
    })

    it('prevents default on touchstart', () => {
      plugin = initPlugin(overview({ element: overviewEl }), artboard)

      const event = new Event('touchstart', { bubbles: true, cancelable: true })
      const preventSpy = vi.spyOn(event, 'preventDefault')
      overviewEl.dispatchEvent(event)

      expect(preventSpy).toHaveBeenCalled()
    })
  })

  describe('destroy', () => {
    it('calls unobserve', () => {
      const unobserveMock = vi.fn()
      vi.mocked(artboard.observeSizeChange).mockReturnValue({
        unobserve: unobserveMock,
      })

      plugin = initPlugin(overview({ element: overviewEl }), artboard)
      plugin.destroy()

      expect(unobserveMock).toHaveBeenCalled()
    })

    it('restores styles when restoreStyles is true', () => {
      artboardEl.style.position = 'relative'
      visibleEl.style.cursor = 'default'

      plugin = initPlugin(
        overview({ element: overviewEl, restoreStyles: true }),
        artboard,
      )

      expect(artboardEl.style.position).toBe('absolute')
      expect(visibleEl.style.cursor).toBe('move')

      plugin.destroy()

      expect(artboardEl.style.position).toBe('relative')
      expect(visibleEl.style.cursor).toBe('default')
    })

    it('removes event listeners', () => {
      plugin = initPlugin(overview({ element: overviewEl }), artboard)
      plugin.destroy()

      vi.mocked(artboard.cancelAnimation).mockClear()

      overviewEl.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          clientX: 50,
          clientY: 50,
        }),
      )

      expect(artboard.cancelAnimation).not.toHaveBeenCalled()
    })
  })
})
