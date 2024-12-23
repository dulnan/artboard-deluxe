import { inlineStyleOverrider } from '../../helpers/inlineStyleOverrider'
import type { ArtboardLoopContext } from '../../types'
import { defineArtboardPlugin } from '../defineArtboardPlugin'

/**
 * Sets the artboard state as CSS custom properties/variables on the given element or root element.
 */
export const cssProperties = defineArtboardPlugin<{
  /**
   * The element on which the CSS properties should be set.
   * Falls back to the root element.
   */
  element?: HTMLElement

  /**
   * How precise the set values should be.
   *
   * A value of 1 (default) means that only whole pixels are applied (e.g. 20px).
   * A value of 0.5 means the values are rounded to the next 0.5 increment (e.g. 20.5px or 21px).
   * A value of 10 would round to 20px, 30px, 0px, etc.
   */
  precision?: number

  /**
   * Adds unitless property values.
   *
   * If true, instead of `--artboard-offset-x: -582px` it will set `--artboard-offset-x: -582`.
   * Useful if you want to do CSS calculations with purely numeric values.
   */
  unitless?: boolean

  /**
   * Set's the --artboard-offset-x property.
   */
  setOffsetX?: boolean

  /**
   * Set's the --artboard-offset-y property.
   */
  setOffsetY?: boolean

  /**
   * Set's the --artboard-scale property.
   */
  setScale?: boolean

  /**
   * Restore original CSS properties on destroy.
   *
   * If true, the plugin will restore the CSS properties to their value before the plugin was initialised.
   */
  restoreProperties?: boolean
}>(function (artboard, options) {
  const element = options.get('element') || artboard.getRootElement()
  const style = inlineStyleOverrider(element)

  function getValue(v: number): number | string {
    if (options.should('unitless')) {
      return v.toString()
    }

    return v
  }

  function loop(ctx: ArtboardLoopContext) {
    const precision = options.get('precision', 0.5)
    if (options.should('setOffsetX', true)) {
      const x = getValue(Math.ceil(ctx.offset.x / precision) * precision)
      style.setProperty('--artboard-offset-x', x)
    }

    if (options.should('setOffsetY', true)) {
      const y = getValue(Math.ceil(ctx.offset.y / precision) * precision)
      style.setProperty('--artboard-offset-y', y)
    }

    if (options.should('setScale', true)) {
      style.setProperty('--artboard-scale', ctx.scale.toString())
    }
  }

  function destroy() {
    if (options.should('restoreProperties')) {
      style.restore()
    }
  }

  return {
    destroy,
    loop,
  }
})
