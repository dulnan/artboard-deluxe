// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { keyboard } from '~/plugins/keyboard'
import {
  createMockArtboard,
  initPlugin,
  type TestPluginInstance,
} from '../_setup'
import type { Artboard } from '~/types'

function dispatchKey(
  code: string,
  options?: Partial<KeyboardEventInit>,
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    code,
    bubbles: true,
    ...options,
  })
  vi.spyOn(event, 'preventDefault')
  document.dispatchEvent(event)
  return event
}

describe('keyboard plugin', () => {
  let artboard: Artboard
  let plugin: TestPluginInstance

  beforeEach(() => {
    artboard = createMockArtboard()
    plugin = initPlugin(keyboard(), artboard)
  })

  afterEach(() => {
    plugin.destroy()
  })

  it('calls scrollDown when ArrowDown is pressed', () => {
    dispatchKey('ArrowDown')
    expect(artboard.scrollDown).toHaveBeenCalledOnce()
  })

  it('calls scrollUp when ArrowUp is pressed', () => {
    dispatchKey('ArrowUp')
    expect(artboard.scrollUp).toHaveBeenCalledOnce()
  })

  it('calls scrollLeft when ArrowLeft is pressed', () => {
    dispatchKey('ArrowLeft')
    expect(artboard.scrollLeft).toHaveBeenCalledOnce()
  })

  it('calls scrollRight when ArrowRight is pressed', () => {
    dispatchKey('ArrowRight')
    expect(artboard.scrollRight).toHaveBeenCalledOnce()
  })

  it('calls scrollToTop when Home is pressed', () => {
    dispatchKey('Home')
    expect(artboard.scrollToTop).toHaveBeenCalledOnce()
  })

  it('calls scrollToEnd when End is pressed', () => {
    dispatchKey('End')
    expect(artboard.scrollToEnd).toHaveBeenCalledOnce()
  })

  it('calls scrollPageUp when PageUp is pressed', () => {
    dispatchKey('PageUp')
    expect(artboard.scrollPageUp).toHaveBeenCalledOnce()
  })

  it('calls scrollPageDown when PageDown is pressed', () => {
    dispatchKey('PageDown')
    expect(artboard.scrollPageDown).toHaveBeenCalledOnce()
  })

  it('does nothing for unmapped keys', () => {
    const event = dispatchKey('KeyA')
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(artboard.scrollDown).not.toHaveBeenCalled()
  })

  it('calls preventDefault for matched keys', () => {
    const event = dispatchKey('ArrowDown')
    expect(event.preventDefault).toHaveBeenCalledOnce()
  })

  describe('modifier keys', () => {
    it('does not call resetZoom for Digit0 without modifier', () => {
      dispatchKey('Digit0')
      expect(artboard.resetZoom).not.toHaveBeenCalled()
    })

    it('calls resetZoom for Digit0 with ctrlKey', () => {
      dispatchKey('Digit0', { ctrlKey: true })
      expect(artboard.resetZoom).toHaveBeenCalledOnce()
    })

    it('calls resetZoom for Digit0 with metaKey', () => {
      dispatchKey('Digit0', { metaKey: true })
      expect(artboard.resetZoom).toHaveBeenCalledOnce()
    })

    it('calls scaleToFit for Digit1 with ctrlKey', () => {
      dispatchKey('Digit1', { ctrlKey: true })
      expect(artboard.scaleToFit).toHaveBeenCalledOnce()
    })

    it('does not call scaleToFit for Digit1 without modifier', () => {
      dispatchKey('Digit1')
      expect(artboard.scaleToFit).not.toHaveBeenCalled()
    })
  })

  describe('modifier option', () => {
    afterEach(() => {
      plugin.destroy()
    })

    it('checks altKey when modifier is set to alt', () => {
      plugin.destroy()
      artboard = createMockArtboard()
      plugin = initPlugin(keyboard({ modifier: 'alt' }), artboard)

      // ctrlKey should not work now
      dispatchKey('Digit0', { ctrlKey: true })
      expect(artboard.resetZoom).not.toHaveBeenCalled()

      // altKey should work
      dispatchKey('Digit0', { altKey: true })
      expect(artboard.resetZoom).toHaveBeenCalledOnce()
    })

    it('checks metaKey when modifier is set to meta', () => {
      plugin.destroy()
      artboard = createMockArtboard()
      plugin = initPlugin(keyboard({ modifier: 'meta' }), artboard)

      dispatchKey('Digit0', { ctrlKey: true })
      expect(artboard.resetZoom).not.toHaveBeenCalled()

      dispatchKey('Digit0', { metaKey: true })
      expect(artboard.resetZoom).toHaveBeenCalledOnce()
    })

    it('checks only ctrlKey when modifier is set to ctrl', () => {
      plugin.destroy()
      artboard = createMockArtboard()
      plugin = initPlugin(keyboard({ modifier: 'ctrl' }), artboard)

      dispatchKey('Digit0', { metaKey: true })
      expect(artboard.resetZoom).not.toHaveBeenCalled()

      dispatchKey('Digit0', { ctrlKey: true })
      expect(artboard.resetZoom).toHaveBeenCalledOnce()
    })
  })

  describe('custom keymap', () => {
    it('uses custom keymap instead of defaults', () => {
      plugin.destroy()
      artboard = createMockArtboard()
      plugin = initPlugin(
        keyboard({
          keymap: {
            Space: ['zoomIn'],
            KeyR: ['resetZoom'],
          },
        }),
        artboard,
      )

      // Default mapping should no longer work
      dispatchKey('ArrowDown')
      expect(artboard.scrollDown).not.toHaveBeenCalled()

      // Custom mappings should work
      dispatchKey('Space')
      expect(artboard.zoomIn).toHaveBeenCalledOnce()

      dispatchKey('KeyR')
      expect(artboard.resetZoom).toHaveBeenCalledOnce()
    })
  })

  describe('destroy', () => {
    it('removes the event listener so subsequent keys have no effect', () => {
      plugin.destroy()

      dispatchKey('ArrowDown')
      expect(artboard.scrollDown).not.toHaveBeenCalled()
    })
  })
})
