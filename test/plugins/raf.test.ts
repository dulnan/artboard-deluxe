// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { raf } from '~/plugins/raf'
import {
  createMockArtboard,
  initPlugin,
  type TestPluginInstance,
} from '../_setup'
import type { Artboard } from '~/types'

describe('raf plugin', () => {
  let artboard: Artboard
  let plugin: TestPluginInstance
  let rafCallback: ((time: number) => void) | null = null
  let rafId = 1

  beforeEach(() => {
    rafCallback = null
    rafId = 1
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb
      return rafId++
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    artboard = createMockArtboard()
  })

  afterEach(() => {
    plugin?.destroy()
    vi.restoreAllMocks()
  })

  it('calls requestAnimationFrame on init to start the loop', () => {
    plugin = initPlugin(raf(), artboard)
    expect(window.requestAnimationFrame).toHaveBeenCalledOnce()
  })

  it('calls artboard.loop(currentTime) on each animation frame', () => {
    plugin = initPlugin(raf(), artboard)

    // Simulate first frame
    rafCallback!(16.67)
    expect(artboard.loop).toHaveBeenCalledWith(16.67)

    // Simulate second frame
    rafCallback!(33.34)
    expect(artboard.loop).toHaveBeenCalledWith(33.34)
    expect(artboard.loop).toHaveBeenCalledTimes(2)
  })

  it('schedules next frame after each callback', () => {
    plugin = initPlugin(raf(), artboard)
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)

    rafCallback!(16.67)
    // After executing the callback, another rAF should be scheduled
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2)
  })

  it('calls cancelAnimationFrame on destroy', () => {
    plugin = initPlugin(raf(), artboard)
    plugin.destroy()
    expect(window.cancelAnimationFrame).toHaveBeenCalled()
  })

  describe('fps option', () => {
    it('skips frames arriving too soon when fps is set to 30', () => {
      plugin = initPlugin(raf({ fps: 30 }), artboard)

      // 1000/30 ≈ 33.33ms interval for 30fps
      // First frame at 34ms - elapsed (34) >= interval (33.33), calls loop
      rafCallback!(34)
      expect(artboard.loop).toHaveBeenCalledTimes(1)

      // Frame at 40ms - only ~6ms since last, should be skipped
      rafCallback!(40)
      expect(artboard.loop).toHaveBeenCalledTimes(1)

      // Frame at 50ms - only ~16ms since last, should be skipped
      rafCallback!(50)
      expect(artboard.loop).toHaveBeenCalledTimes(1)

      // Frame at 68ms - ~34ms since last, should call loop
      rafCallback!(68)
      expect(artboard.loop).toHaveBeenCalledTimes(2)
    })

    it('calls artboard.loop on every frame without fps option', () => {
      plugin = initPlugin(raf(), artboard)

      rafCallback!(16)
      rafCallback!(32)
      rafCallback!(48)

      expect(artboard.loop).toHaveBeenCalledTimes(3)
    })
  })
})
