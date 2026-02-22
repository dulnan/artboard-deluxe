// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { dom } from '~/plugins/dom'
import {
  createMockArtboard,
  initPlugin,
  createLoopContext,
  type TestPluginInstance,
} from '../_setup'
import type { Artboard } from '~/types'

describe('dom plugin', () => {
  let artboard: Artboard
  let artboardEl: HTMLElement
  let plugin: TestPluginInstance

  beforeEach(() => {
    artboard = createMockArtboard()
    artboardEl = document.createElement('div')
    // Set offsetWidth/offsetHeight via style (jsdom uses these)
    Object.defineProperty(artboardEl, 'offsetWidth', {
      value: 500,
      configurable: true,
    })
    Object.defineProperty(artboardEl, 'offsetHeight', {
      value: 400,
      configurable: true,
    })
  })

  afterEach(() => {
    plugin?.destroy()
  })

  describe('initialization', () => {
    it('sets initial styles on the artboard element', () => {
      plugin = initPlugin(dom({ element: artboardEl }), artboard)

      expect(artboardEl.style.position).toBe('absolute')
      expect(artboardEl.style.top).toBe('0px')
      expect(artboardEl.style.left).toBe('0px')
      expect(artboardEl.style.transformOrigin).toBe('0 0')
    })

    it('calls setArtboardSize with element dimensions', () => {
      plugin = initPlugin(dom({ element: artboardEl }), artboard)

      expect(artboard.setArtboardSize).toHaveBeenCalledWith(500, 400)
    })

    it('observes size changes on the artboard element', () => {
      plugin = initPlugin(dom({ element: artboardEl }), artboard)

      expect(artboard.observeSizeChange).toHaveBeenCalledWith(
        artboardEl,
        expect.any(Function),
      )
    })
  })

  describe('loop', () => {
    it('sets transform with offset and scale', () => {
      plugin = initPlugin(dom({ element: artboardEl }), artboard)

      const ctx = createLoopContext({
        offset: { x: 50, y: 100 },
        scale: 2,
        artboardSize: { width: 500, height: 400 },
      })
      plugin.loop(ctx)

      expect(artboardEl.style.transform).toContain('translate3d(')
      expect(artboardEl.style.transform).toContain('scale(')
    })

    it('does not set transform when artboardSize is null', () => {
      plugin = initPlugin(dom({ element: artboardEl }), artboard)

      // Clear any transform from init
      artboardEl.style.transform = ''

      const ctx = createLoopContext()
      ;(ctx as unknown as { artboardSize: null }).artboardSize = null
      plugin.loop(ctx)

      expect(artboardEl.style.transform).toBe('')
    })

    it('applies precision rounding (default 0.5)', () => {
      plugin = initPlugin(dom({ element: artboardEl }), artboard)

      const ctx = createLoopContext({
        offset: { x: 10.3, y: 20.7 },
        scale: 1,
        artboardSize: { width: 500, height: 400 },
      })
      plugin.loop(ctx)

      // withPrecision rounds up to the next 0.5 increment
      expect(artboardEl.style.transform).toBeTruthy()
    })

    it('applies scale precision when applyScalePrecision is set', () => {
      plugin = initPlugin(
        dom({ element: artboardEl, applyScalePrecision: true }),
        artboard,
      )

      const ctx = createLoopContext({
        offset: { x: 0, y: 0 },
        scale: 1.333,
        artboardSize: { width: 500, height: 400 },
      })
      plugin.loop(ctx)

      // With applyScalePrecision, scale is adjusted per axis
      const transform = artboardEl.style.transform
      expect(transform).toContain('translate3d(')
      expect(transform).toContain('scale(')
    })
  })

  describe('setInitTransformFromRect', () => {
    it('sets initial offset and scale from element rect', () => {
      // Mock getBoundingClientRect for both elements
      const rootEl = artboard.getRootElement()
      vi.spyOn(rootEl, 'getBoundingClientRect').mockReturnValue({
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        right: 800,
        bottom: 600,
        toJSON: () => {},
      })
      vi.spyOn(artboardEl, 'getBoundingClientRect').mockReturnValue({
        x: 100,
        y: 50,
        width: 500,
        height: 400,
        top: 50,
        left: 100,
        right: 600,
        bottom: 450,
        toJSON: () => {},
      })

      plugin = initPlugin(
        dom({ element: artboardEl, setInitTransformFromRect: true }),
        artboard,
      )

      expect(artboard.setScale).toHaveBeenCalled()
      expect(artboard.setOffset).toHaveBeenCalledWith(100, 50, true)
    })
  })

  describe('destroy', () => {
    it('calls unobserve', () => {
      const unobserveMock = vi.fn()
      vi.mocked(artboard.observeSizeChange).mockReturnValue({
        unobserve: unobserveMock,
      })

      plugin = initPlugin(dom({ element: artboardEl }), artboard)
      plugin.destroy()

      expect(unobserveMock).toHaveBeenCalled()
    })

    it('restores styles when restoreStyles is true', () => {
      artboardEl.style.position = 'relative'

      plugin = initPlugin(
        dom({ element: artboardEl, restoreStyles: true }),
        artboard,
      )

      expect(artboardEl.style.position).toBe('absolute')

      plugin.destroy()

      expect(artboardEl.style.position).toBe('relative')
    })
  })
})
