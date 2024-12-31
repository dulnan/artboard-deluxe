import { defineArtboardPlugin } from '../defineArtboardPlugin'
import { inlineStyleOverrider } from '../../helpers/inlineStyleOverrider'
import type { ArtboardLoopContext } from '../../types'
import type { Coord, Edge, Origin } from '../../types/geometry'
import { withPrecision, parseOrigin, parseEdges } from '../../helpers'

type Margin = number | Partial<Edge>

type ComputedPositionOption = {
  type: 'origin' | 'position'
  x: number
  y: number
}

type ComputedOptions = {
  xMargin: number
  yMargin: number
  margin: Edge
  origin: Coord
  position: ComputedPositionOption
  transformOrigin: string
}

/**
 * Anchors an element relative to the artboard with a given `position`,
 * then shifts the element so its `origin` is at that position,
 * applying margins according to which side of the element is anchored.
 */
export const sticky = defineArtboardPlugin<{
  /**
   * The element to make sticky.
   */
  element: HTMLElement

  /**
   * Whether the position styles should be applied.
   * Defaults to `true`.
   */
  enabled?: boolean

  /**
   * The position relative to the artboard.
   *
   * Can be one of the named posistions (such as 'top-left') or an object
   * with x and y coordinates.
   *
   * Defaults to 'north-west'.
   */
  position?:
    | Origin
    | {
        x: number
        y: number
      }

  /**
   * Defines where the element “anchors” relative to `position`,
   * similar to how the CSS transform-origin property works.
   *
   * Defaults to 'top-left'.
   */
  origin?: Origin

  /**
   * The margin to apply after the element's position has been calculated.
   *
   * Can be a number (for all edges) or an object with separate margins for each edge.
   */
  margin?: Margin

  /**
   * If set, the element is always kept visible within the root element's rect.
   */
  keepVisible?: boolean

  /**
   * How precise the translate3d() values should be.
   *
   * A value of 1 (default) means the only whole pixels are applied (e.g. 20px).
   * A value of 0.5 means the values are rounded to the next 0.5 increment (e.g. 20.5px or 21px).
   * A value of 10 would round to 20px, 30px, 0px, etc.
   *
   * Note that internally the offset is kept as a floating point number. The
   * precision only defines how the number is rounded when setting the transform style.
   */
  precision?: number

  /**
   * Whether to restore the original styles after destroying the plugin instance.
   */
  restoreStyles?: boolean
}>(function (artboard, options) {
  const el = options.getRequired('element')
  const style = inlineStyleOverrider(el)

  let elWidth = el.offsetWidth
  let elHeight = el.offsetHeight

  function onSizeChange(entry: ResizeObserverEntry) {
    if (entry.target !== el) return
    const size = entry.borderBoxSize?.[0]
    if (!size) return

    elWidth = size.inlineSize
    elHeight = size.blockSize
  }

  /**
   * Precompute option-based values that don't require artboard state.
   */
  const computed = options.computed<ComputedOptions>(function (o) {
    const originOption = o.origin || 'top-left'
    const origin = parseOrigin(originOption)
    const margin = parseEdges(o.margin)
    const positionOption = o.position || 'top-left'
    const position: ComputedPositionOption =
      typeof positionOption === 'string'
        ? { type: 'origin', ...parseOrigin(positionOption) }
        : { type: 'position', ...positionOption }

    const transformOrigin = originOption.replace('-', ' ')

    let xMargin = 0
    if (origin.x === 0) {
      // Anchor left edge => add margin to the left.
      xMargin += margin.left
    } else if (origin.x === 1) {
      // Anchor right edge => subtract margin on the right.
      xMargin -= margin.right
    }

    let yMargin = 0
    if (origin.y === 0) {
      // Anchor top edge => add margin on top.
      yMargin += margin.top
    } else if (origin.y === 1) {
      // Anchor bottom edge => subtract margin from bottom.
      yMargin -= margin.bottom
    }

    return {
      xMargin,
      yMargin,
      margin,
      origin,
      position,
      transformOrigin,
    }
  })

  function loop(ctx: ArtboardLoopContext) {
    // Return if plugin is disabled.
    if (!options.should('enabled', true)) {
      return
    }

    const artboardWidth = (ctx.artboardSize?.width || 0) * ctx.scale
    const artboardHeight = (ctx.artboardSize?.height || 0) * ctx.scale

    const keepVisible = options.should('keepVisible')

    let x =
      computed.value.position.type === 'origin'
        ? computed.value.position.x * artboardWidth
        : computed.value.position.x * ctx.scale

    let y =
      computed.value.position.type === 'origin'
        ? computed.value.position.y * artboardHeight
        : computed.value.position.y * ctx.scale

    x +=
      ctx.offset.x + computed.value.xMargin - elWidth * computed.value.origin.x
    y +=
      ctx.offset.y + computed.value.yMargin - elHeight * computed.value.origin.y

    // If keepVisible is set, make sure the element always stays visible inside
    // the root element's rect.
    if (keepVisible) {
      x = Math.min(
        Math.max(x, computed.value.margin.left),
        ctx.rootSize.width - elWidth - computed.value.margin.right,
      )
      y = Math.min(
        Math.max(y, computed.value.margin.top),
        ctx.rootSize.height - elHeight - computed.value.margin.bottom,
      )
    }

    const precision = options.get('precision', 0.5)
    style.setTransform(withPrecision(x, precision), withPrecision(y, precision))
    style.set('transformOrigin', computed.value.transformOrigin)
  }

  artboard.observeSize(el)

  function destroy() {
    artboard.unobserveSize(el)
    if (options.should('restoreStyles')) {
      style.restore()
    }
  }

  style.setMultiple({
    position: 'absolute',
    top: '0',
    left: '0',
    right: 'auto',
    bottom: 'auto',
  })

  return {
    destroy,
    loop,
    onSizeChange,
  }
})
