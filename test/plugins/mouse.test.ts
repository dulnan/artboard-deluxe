// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mouse } from '~/plugins/mouse'
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
    cancelable: true,
    pointerType: 'mouse',
    clientX: 100,
    clientY: 100,
    ...options,
  })
}

describe('mouse plugin', () => {
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

  describe('drag interaction', () => {
    it('starts dragging on primary button pointerdown', () => {
      plugin = initPlugin(mouse(), artboard)

      rootEl.dispatchEvent(createPointerEvent('pointerdown', { buttons: 1 }))

      // prepareForDrag calls cancelAnimation, setInteraction('dragging'), etc.
      expect(artboard.cancelAnimation).toHaveBeenCalled()
      expect(artboard.setInteraction).toHaveBeenCalledWith('dragging')
    })

    it('calls setDirectionOffset during drag', () => {
      plugin = initPlugin(mouse(), artboard)

      rootEl.dispatchEvent(
        createPointerEvent('pointerdown', {
          buttons: 1,
          clientX: 50,
          clientY: 50,
        }),
      )

      const moveEvent = createPointerEvent('pointermove', {
        clientX: 100,
        clientY: 120,
        buttons: 1,
      })
      // Add pageX/pageY for getEventCoords
      Object.defineProperty(moveEvent, 'pageX', { value: 100 })
      Object.defineProperty(moveEvent, 'pageY', { value: 120 })
      document.dispatchEvent(moveEvent)

      expect(artboard.setDirectionOffset).toHaveBeenCalled()
    })

    it('starts momentum on pointerup after drag', () => {
      plugin = initPlugin(mouse(), artboard)

      const downEvent = createPointerEvent('pointerdown', {
        buttons: 1,
        clientX: 50,
        clientY: 50,
      })
      Object.defineProperty(downEvent, 'pageX', { value: 50 })
      Object.defineProperty(downEvent, 'pageY', { value: 50 })
      rootEl.dispatchEvent(downEvent)

      const upEvent = createPointerEvent('pointerup', {
        clientX: 100,
        clientY: 100,
      })
      Object.defineProperty(upEvent, 'pageX', { value: 100 })
      Object.defineProperty(upEvent, 'pageY', { value: 100 })
      window.dispatchEvent(upEvent)

      expect(artboard.startMomentum).toHaveBeenCalled()
    })

    it('ignores non-mouse pointer events', () => {
      plugin = initPlugin(mouse(), artboard)

      rootEl.dispatchEvent(
        createPointerEvent('pointerdown', { pointerType: 'touch', buttons: 1 }),
      )

      expect(artboard.cancelAnimation).not.toHaveBeenCalled()
    })
  })

  describe('middle mouse button (auxiliary)', () => {
    it('allows dragging with auxiliary button even with useSpacebar', () => {
      plugin = initPlugin(mouse({ useSpacebar: true }), artboard)

      rootEl.dispatchEvent(createPointerEvent('pointerdown', { buttons: 4 }))

      expect(artboard.cancelAnimation).toHaveBeenCalled()
      expect(artboard.setInteraction).toHaveBeenCalledWith('dragging')
    })
  })

  describe('useSpacebar option', () => {
    it('does not start drag on primary click without spacebar when useSpacebar is true', () => {
      plugin = initPlugin(mouse({ useSpacebar: true }), artboard)

      rootEl.dispatchEvent(createPointerEvent('pointerdown', { buttons: 1 }))

      // setMomentum is called regardless, but drag should not start
      // (no pointermove listener added because canDrag is false)
      // Verify by moving and checking that setDirectionOffset is NOT called
      const moveEvent = createPointerEvent('pointermove', {
        clientX: 200,
        clientY: 200,
        buttons: 1,
      })
      Object.defineProperty(moveEvent, 'pageX', { value: 200 })
      Object.defineProperty(moveEvent, 'pageY', { value: 200 })
      document.dispatchEvent(moveEvent)

      expect(artboard.setDirectionOffset).not.toHaveBeenCalled()
    })

    it('starts drag when spacebar is pressed and useSpacebar is true', () => {
      plugin = initPlugin(mouse({ useSpacebar: true }), artboard)

      // Press space
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))

      rootEl.dispatchEvent(createPointerEvent('pointerdown', { buttons: 1 }))

      expect(artboard.setInteraction).toHaveBeenCalledWith('dragging')
    })
  })

  describe('setCursor option', () => {
    it('sets cursor to move when spacebar is pressed and setCursor is true', () => {
      plugin = initPlugin(
        mouse({ setCursor: true, useSpacebar: true }),
        artboard,
      )

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))

      expect(rootEl.style.cursor).toBe('move')
    })

    it('restores cursor on space key up', () => {
      rootEl.style.cursor = 'default'
      plugin = initPlugin(
        mouse({ setCursor: true, useSpacebar: true }),
        artboard,
      )

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))
      expect(rootEl.style.cursor).toBe('move')

      document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }))
      expect(rootEl.style.cursor).toBe('default')
    })
  })

  describe('click suppression', () => {
    it('stops click propagation when spacebar is pressed', () => {
      plugin = initPlugin(mouse({ useSpacebar: true }), artboard)

      // Press space
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))

      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
      const stopSpy = vi.spyOn(clickEvent, 'stopImmediatePropagation')
      rootEl.dispatchEvent(clickEvent)

      expect(stopSpy).toHaveBeenCalled()
    })

    it('stops click propagation during momentum', () => {
      vi.mocked(artboard.getInteraction).mockReturnValue('momentum')
      plugin = initPlugin(mouse(), artboard)

      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
      const stopSpy = vi.spyOn(clickEvent, 'stopImmediatePropagation')
      rootEl.dispatchEvent(clickEvent)

      expect(stopSpy).toHaveBeenCalled()
    })
  })

  describe('destroy', () => {
    it('removes all event listeners', () => {
      plugin = initPlugin(mouse(), artboard)
      plugin.destroy()

      rootEl.dispatchEvent(createPointerEvent('pointerdown', { buttons: 1 }))

      expect(artboard.cancelAnimation).not.toHaveBeenCalled()
    })

    it('restores original cursor', () => {
      rootEl.style.cursor = 'pointer'
      plugin = initPlugin(mouse({ setCursor: true }), artboard)
      plugin.destroy()

      expect(rootEl.style.cursor).toBe('pointer')
    })
  })
})
