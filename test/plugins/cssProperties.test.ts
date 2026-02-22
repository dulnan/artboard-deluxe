// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { cssProperties } from '~/plugins/cssProperties'
import {
  createMockArtboard,
  createLoopContext,
  initPlugin,
  type TestPluginInstance,
} from '../_setup'
import type { Artboard } from '~/types'

describe('cssProperties plugin', () => {
  let artboard: Artboard
  let rootEl: HTMLElement
  let plugin: TestPluginInstance

  beforeEach(() => {
    artboard = createMockArtboard()
    rootEl = artboard.getRootElement()
  })

  afterEach(() => {
    plugin.destroy()
  })

  describe('setting CSS properties via loop()', () => {
    it('sets offset-x and offset-y properties', () => {
      plugin = initPlugin(
        cssProperties({
          properties: ['--artboard-offset-x', '--artboard-offset-y'],
        }),
        artboard,
      )
      const ctx = createLoopContext({ offset: { x: 150, y: -300 } })
      plugin.loop(ctx)

      expect(rootEl.style.getPropertyValue('--artboard-offset-x')).toBe('150px')
      expect(rootEl.style.getPropertyValue('--artboard-offset-y')).toBe(
        '-300px',
      )
    })

    it('sets scale property without px suffix', () => {
      plugin = initPlugin(
        cssProperties({ properties: ['--artboard-scale'] }),
        artboard,
      )
      const ctx = createLoopContext({ scale: 2.5 })
      plugin.loop(ctx)

      expect(rootEl.style.getPropertyValue('--artboard-scale')).toBe('2.5')
    })

    it('sets artboard size properties', () => {
      plugin = initPlugin(
        cssProperties({
          properties: ['--artboard-size-width', '--artboard-size-height'],
        }),
        artboard,
      )
      const ctx = createLoopContext({
        artboardSize: { width: 1200, height: 800 },
      })
      plugin.loop(ctx)

      expect(rootEl.style.getPropertyValue('--artboard-size-width')).toBe(
        '1200px',
      )
      expect(rootEl.style.getPropertyValue('--artboard-size-height')).toBe(
        '800px',
      )
    })

    it('sets root size properties', () => {
      plugin = initPlugin(
        cssProperties({
          properties: ['--artboard-root-width', '--artboard-root-height'],
        }),
        artboard,
      )
      const ctx = createLoopContext({
        rootSize: { width: 1024, height: 768 },
      })
      plugin.loop(ctx)

      expect(rootEl.style.getPropertyValue('--artboard-root-width')).toBe(
        '1024px',
      )
      expect(rootEl.style.getPropertyValue('--artboard-root-height')).toBe(
        '768px',
      )
    })

    it('handles null artboardSize gracefully', () => {
      plugin = initPlugin(
        cssProperties({
          properties: ['--artboard-size-width', '--artboard-size-height'],
        }),
        artboard,
      )
      const ctx = createLoopContext({ artboardSize: null })
      plugin.loop(ctx)

      expect(rootEl.style.getPropertyValue('--artboard-size-width')).toBe('0px')
      expect(rootEl.style.getPropertyValue('--artboard-size-height')).toBe(
        '0px',
      )
    })
  })

  describe('only requested properties are set', () => {
    it('only sets offset-x when that is the only property requested', () => {
      plugin = initPlugin(
        cssProperties({ properties: ['--artboard-offset-x'] }),
        artboard,
      )
      const ctx = createLoopContext({ offset: { x: 42, y: 99 } })
      plugin.loop(ctx)

      expect(rootEl.style.getPropertyValue('--artboard-offset-x')).toBe('42px')
      expect(rootEl.style.getPropertyValue('--artboard-offset-y')).toBe('')
      expect(rootEl.style.getPropertyValue('--artboard-scale')).toBe('')
    })
  })

  describe('precision option', () => {
    it('rounds to whole pixels with precision 1', () => {
      plugin = initPlugin(
        cssProperties({
          properties: ['--artboard-offset-x'],
          precision: 1,
        }),
        artboard,
      )
      const ctx = createLoopContext({ offset: { x: 123.7, y: 0 } })
      plugin.loop(ctx)

      expect(rootEl.style.getPropertyValue('--artboard-offset-x')).toBe('124px')
    })

    it('rounds to 0.5 increments with precision 0.5', () => {
      plugin = initPlugin(
        cssProperties({
          properties: ['--artboard-offset-x'],
          precision: 0.5,
        }),
        artboard,
      )
      const ctx = createLoopContext({ offset: { x: 123.3, y: 0 } })
      plugin.loop(ctx)

      expect(rootEl.style.getPropertyValue('--artboard-offset-x')).toBe(
        '123.5px',
      )
    })

    it('rounds to tens with precision 10', () => {
      plugin = initPlugin(
        cssProperties({
          properties: ['--artboard-offset-x'],
          precision: 10,
        }),
        artboard,
      )
      const ctx = createLoopContext({ offset: { x: 123, y: 0 } })
      plugin.loop(ctx)

      expect(rootEl.style.getPropertyValue('--artboard-offset-x')).toBe('130px')
    })
  })

  describe('unitless option', () => {
    it('produces values without px suffix when unitless is true', () => {
      plugin = initPlugin(
        cssProperties({
          properties: ['--artboard-offset-x', '--artboard-offset-y'],
          unitless: true,
        }),
        artboard,
      )
      const ctx = createLoopContext({ offset: { x: 100, y: 200 } })
      plugin.loop(ctx)

      expect(rootEl.style.getPropertyValue('--artboard-offset-x')).toBe('100')
      expect(rootEl.style.getPropertyValue('--artboard-offset-y')).toBe('200')
    })

    it('scale is always without px suffix regardless of unitless', () => {
      plugin = initPlugin(
        cssProperties({
          properties: ['--artboard-scale'],
          unitless: false,
        }),
        artboard,
      )
      const ctx = createLoopContext({ scale: 1.5 })
      plugin.loop(ctx)

      expect(rootEl.style.getPropertyValue('--artboard-scale')).toBe('1.5')
    })
  })

  describe('element option', () => {
    it('falls back to artboard root element when no element option', () => {
      plugin = initPlugin(
        cssProperties({ properties: ['--artboard-offset-x'] }),
        artboard,
      )
      const ctx = createLoopContext({ offset: { x: 42, y: 0 } })
      plugin.loop(ctx)

      expect(rootEl.style.getPropertyValue('--artboard-offset-x')).toBe('42px')
    })

    it('uses provided element option instead of root', () => {
      const customEl = document.createElement('div')
      plugin = initPlugin(
        cssProperties({
          properties: ['--artboard-offset-x'],
          element: customEl,
        }),
        artboard,
      )
      const ctx = createLoopContext({ offset: { x: 77, y: 0 } })
      plugin.loop(ctx)

      expect(customEl.style.getPropertyValue('--artboard-offset-x')).toBe(
        '77px',
      )
      expect(rootEl.style.getPropertyValue('--artboard-offset-x')).toBe('')
    })
  })

  describe('restoreProperties option', () => {
    it('restores original CSS property values on destroy when enabled', () => {
      rootEl.style.setProperty('--artboard-offset-x', '999px')

      plugin = initPlugin(
        cssProperties({
          properties: ['--artboard-offset-x'],
          restoreProperties: true,
        }),
        artboard,
      )

      const ctx = createLoopContext({ offset: { x: 42, y: 0 } })
      plugin.loop(ctx)
      expect(rootEl.style.getPropertyValue('--artboard-offset-x')).toBe('42px')

      plugin.destroy()
      expect(rootEl.style.getPropertyValue('--artboard-offset-x')).toBe('999px')
    })

    it('does not restore properties when option is not set', () => {
      rootEl.style.setProperty('--artboard-offset-x', '999px')

      plugin = initPlugin(
        cssProperties({
          properties: ['--artboard-offset-x'],
        }),
        artboard,
      )

      const ctx = createLoopContext({ offset: { x: 42, y: 0 } })
      plugin.loop(ctx)
      plugin.destroy()

      // Should keep the last set value, not restore
      expect(rootEl.style.getPropertyValue('--artboard-offset-x')).toBe('42px')
    })
  })
})
