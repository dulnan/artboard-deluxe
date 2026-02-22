// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sticky } from '~/plugins/sticky'
import {
  createMockArtboard,
  initPlugin,
  createLoopContext,
  type TestPluginInstance,
} from '../_setup'
import type { Artboard } from '~/types'
import type { Rectangle } from '~/types/geometry'

describe('sticky plugin', () => {
  let artboard: Artboard
  let targetEl: HTMLElement
  let plugin: TestPluginInstance<{ getRect: () => Rectangle }>

  beforeEach(() => {
    artboard = createMockArtboard()
    targetEl = document.createElement('div')
    Object.defineProperty(targetEl, 'offsetWidth', {
      value: 200,
      configurable: true,
    })
    Object.defineProperty(targetEl, 'offsetHeight', {
      value: 100,
      configurable: true,
    })
  })

  afterEach(() => {
    plugin?.destroy()
  })

  describe('initialization with HTMLElement', () => {
    it('sets initial positioning styles on target', () => {
      plugin = initPlugin(sticky({ target: targetEl }), artboard)

      expect(targetEl.style.position).toBe('absolute')
      // jsdom normalizes '0' to '0px' for top/left
      expect(targetEl.style.top).toBe('0px')
      expect(targetEl.style.left).toBe('0px')
    })

    it('observes size changes on the target element', () => {
      plugin = initPlugin(sticky({ target: targetEl }), artboard)

      expect(artboard.observeSizeChange).toHaveBeenCalledWith(
        targetEl,
        expect.any(Function),
      )
    })
  })

  describe('initialization with Size object', () => {
    it('does not set styles when target is a Size object', () => {
      const sizeTarget = { width: 200, height: 100 }
      plugin = initPlugin(sticky({ target: sizeTarget }), artboard)

      // No observeSizeChange for non-element targets
      // (one call from the artboard mock default, but not for the target)
      expect(artboard.observeSizeChange).not.toHaveBeenCalled()
    })
  })

  describe('loop — positioning', () => {
    it('positions at top-left by default', () => {
      plugin = initPlugin(sticky({ target: targetEl }), artboard)

      const ctx = createLoopContext({
        offset: { x: 50, y: 30 },
        scale: 1,
        artboardSize: { width: 1000, height: 800 },
      })
      plugin.loop(ctx)

      // Position = origin(0,0) * artboardSize + offset + margin - size * origin
      // = 0 + 50 + 0 - 0 = 50 (x), 0 + 30 + 0 - 0 = 30 (y)
      const rect = plugin.getRect()
      expect(rect.x).toBeCloseTo(50, 0)
      expect(rect.y).toBeCloseTo(30, 0)
    })

    it('positions at center-center', () => {
      plugin = initPlugin(
        sticky({
          target: targetEl,
          position: 'center-center',
          origin: 'center-center',
        }),
        artboard,
      )

      const ctx = createLoopContext({
        offset: { x: 0, y: 0 },
        scale: 1,
        artboardSize: { width: 1000, height: 800 },
      })
      plugin.loop(ctx)

      const rect = plugin.getRect()
      // position at center of artboard (500, 400) minus origin offset (100, 50)
      expect(rect.x).toBeCloseTo(400, 0)
      expect(rect.y).toBeCloseTo(350, 0)
    })

    it('scales position with artboard scale', () => {
      plugin = initPlugin(sticky({ target: targetEl }), artboard)

      const ctx = createLoopContext({
        offset: { x: 0, y: 0 },
        scale: 2,
        artboardSize: { width: 1000, height: 800 },
      })
      plugin.loop(ctx)

      // At top-left with scale 2, position should still be offset (0, 0)
      const rect = plugin.getRect()
      expect(rect.x).toBeCloseTo(0, 0)
      expect(rect.y).toBeCloseTo(0, 0)
    })

    it('applies margin', () => {
      plugin = initPlugin(sticky({ target: targetEl, margin: 10 }), artboard)

      const ctx = createLoopContext({
        offset: { x: 0, y: 0 },
        scale: 1,
        artboardSize: { width: 1000, height: 800 },
      })
      plugin.loop(ctx)

      const rect = plugin.getRect()
      // Origin top-left => margin adds left (10) and top (10)
      expect(rect.x).toBeCloseTo(10, 0)
      expect(rect.y).toBeCloseTo(10, 0)
    })

    it('does nothing when enabled is false', () => {
      plugin = initPlugin(
        sticky({ target: targetEl, enabled: false }),
        artboard,
      )

      const ctx = createLoopContext({
        offset: { x: 100, y: 200 },
        scale: 1,
        artboardSize: { width: 1000, height: 800 },
      })
      plugin.loop(ctx)

      // getRect should still return last coords (0, 0 since no loop ran)
      const rect = plugin.getRect()
      expect(rect.x).toBe(0)
      expect(rect.y).toBe(0)
    })
  })

  describe('keepVisible option', () => {
    it('clamps position within root bounds', () => {
      plugin = initPlugin(
        sticky({ target: targetEl, keepVisible: true }),
        artboard,
      )

      // Offset way off screen to the left
      const ctx = createLoopContext({
        offset: { x: -5000, y: -5000 },
        scale: 1,
        artboardSize: { width: 1000, height: 800 },
        rootSize: { width: 800, height: 600 },
      })
      plugin.loop(ctx)

      const rect = plugin.getRect()
      // Should be clamped to at least 0 (margin.left default 0)
      expect(rect.x).toBeGreaterThanOrEqual(0)
      expect(rect.y).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getRect', () => {
    it('returns current position and size', () => {
      plugin = initPlugin(sticky({ target: targetEl }), artboard)

      const ctx = createLoopContext({
        offset: { x: 10, y: 20 },
        scale: 1,
        artboardSize: { width: 1000, height: 800 },
      })
      plugin.loop(ctx)

      const rect = plugin.getRect()
      expect(rect.width).toBe(200)
      expect(rect.height).toBe(100)
      expect(rect).toHaveProperty('x')
      expect(rect).toHaveProperty('y')
    })
  })

  describe('destroy', () => {
    it('calls unobserve for element target', () => {
      const unobserveMock = vi.fn()
      vi.mocked(artboard.observeSizeChange).mockReturnValue({
        unobserve: unobserveMock,
      })

      plugin = initPlugin(sticky({ target: targetEl }), artboard)
      plugin.destroy()

      expect(unobserveMock).toHaveBeenCalled()
    })

    it('restores styles when restoreStyles is true', () => {
      targetEl.style.position = 'relative'

      plugin = initPlugin(
        sticky({ target: targetEl, restoreStyles: true }),
        artboard,
      )

      expect(targetEl.style.position).toBe('absolute')

      plugin.destroy()

      expect(targetEl.style.position).toBe('relative')
    })
  })
})
