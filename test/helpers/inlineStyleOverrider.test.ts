// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { inlineStyleOverrider } from '~/helpers/inlineStyleOverrider'

describe('inlineStyleOverrider', () => {
  function createElement(initialStyles: Record<string, string> = {}) {
    const el = document.createElement('div')
    for (const [key, value] of Object.entries(initialStyles)) {
      el.style.setProperty(key, value)
    }
    return el
  }

  describe('set', () => {
    it('sets a string style on the element', () => {
      const el = createElement()
      const overrider = inlineStyleOverrider(el)
      overrider.set('display', 'none')
      expect(el.style.display).toBe('none')
    })

    it('sets a numeric style as pixels', () => {
      const el = createElement()
      const overrider = inlineStyleOverrider(el)
      overrider.set('width', 100)
      expect(el.style.width).toBe('100px')
    })

    it('does not re-set the same value', () => {
      const el = createElement()
      const overrider = inlineStyleOverrider(el)
      overrider.set('display', 'none')
      // Manually change the style to detect if overrider re-sets it.
      el.style.display = 'block'
      overrider.set('display', 'none')
      // Since the previous value was 'none', it should skip and not set again.
      expect(el.style.display).toBe('block')
    })
  })

  describe('setProperty', () => {
    it('sets a custom CSS property', () => {
      const el = createElement()
      const overrider = inlineStyleOverrider(el)
      overrider.setProperty('--my-color', 'red')
      expect(el.style.getPropertyValue('--my-color')).toBe('red')
    })

    it('sets a numeric custom property as pixels', () => {
      const el = createElement()
      const overrider = inlineStyleOverrider(el)
      overrider.setProperty('--my-offset', 42)
      expect(el.style.getPropertyValue('--my-offset')).toBe('42px')
    })

    it('does not re-set the same value', () => {
      const el = createElement()
      const overrider = inlineStyleOverrider(el)
      overrider.setProperty('--my-val', 'first')
      el.style.setProperty('--my-val', 'changed')
      overrider.setProperty('--my-val', 'first')
      expect(el.style.getPropertyValue('--my-val')).toBe('changed')
    })
  })

  describe('setTransform', () => {
    it('sets translate3d transform', () => {
      const el = createElement()
      const overrider = inlineStyleOverrider(el)
      overrider.setTransform(10, 20)
      expect(el.style.transform).toBe('translate3d(10px, 20px, 0px)')
    })

    it('sets translate3d with uniform scale', () => {
      const el = createElement()
      const overrider = inlineStyleOverrider(el)
      overrider.setTransform(10, 20, 1.5)
      expect(el.style.transform).toBe('translate3d(10px, 20px, 0px) scale(1.5)')
    })

    it('sets translate3d with non-uniform scale', () => {
      const el = createElement()
      const overrider = inlineStyleOverrider(el)
      overrider.setTransform(10, 20, 1.5, 2)
      expect(el.style.transform).toBe(
        'translate3d(10px, 20px, 0px) scale(1.5, 2)',
      )
    })
  })

  describe('setMultiple', () => {
    it('sets multiple style properties at once', () => {
      const el = createElement()
      const overrider = inlineStyleOverrider(el)
      overrider.setMultiple({ display: 'flex', overflow: 'hidden' })
      expect(el.style.display).toBe('flex')
      expect(el.style.overflow).toBe('hidden')
    })

    it('ignores undefined values', () => {
      const el = createElement()
      el.style.display = 'block'
      const overrider = inlineStyleOverrider(el)
      overrider.setMultiple({ display: undefined, overflow: 'hidden' })
      expect(el.style.display).toBe('block')
      expect(el.style.overflow).toBe('hidden')
    })
  })

  describe('restore', () => {
    it('restores original inline styles', () => {
      const el = createElement()
      el.style.display = 'block'
      const overrider = inlineStyleOverrider(el)

      overrider.set('display', 'none')
      expect(el.style.display).toBe('none')

      overrider.restore()
      expect(el.style.display).toBe('block')
    })

    it('restores styles to empty string if none existed', () => {
      const el = createElement()
      const overrider = inlineStyleOverrider(el)

      overrider.set('display', 'none')
      overrider.restore()
      expect(el.style.display).toBe('')
    })

    it('restores custom properties', () => {
      const el = createElement({ '--my-color': 'blue' })
      const overrider = inlineStyleOverrider(el)

      overrider.setProperty('--my-color', 'red')
      expect(el.style.getPropertyValue('--my-color')).toBe('red')

      overrider.restore()
      expect(el.style.getPropertyValue('--my-color')).toBe('blue')
    })

    it('restores multiple overridden styles', () => {
      const el = createElement()
      el.style.display = 'block'
      el.style.overflow = 'auto'
      const overrider = inlineStyleOverrider(el)

      overrider.set('display', 'none')
      overrider.set('overflow', 'hidden')
      overrider.restore()

      expect(el.style.display).toBe('block')
      expect(el.style.overflow).toBe('auto')
    })
  })
})
