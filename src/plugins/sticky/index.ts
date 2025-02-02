import { defineArtboardPlugin } from '../defineArtboardPlugin'
import { inlineStyleOverrider } from '../../helpers/inlineStyleOverrider'
import type { ArtboardLoopContext } from '../../types'
import type { Coord, Edge, Origin, Rectangle, Size } from '../../types/geometry'
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
 * then shifts the element so its `origin` is at that position and
 * adding margins according to which side of the element is anchored.
 */
export const sticky = defineArtboardPlugin<
  {
    /**
     * Either a DOM element to make sticky or an object with width and height
     * properties.
     *
     * If an element is provided the plugin will automatially update the style
     * of the element.
     *
     * If an object is provided, the plugin will calculate the x and y
     * coordinates based on the provided size. You can obtain these coordinates
     * by calling getRect() on the plugin instance.
     */
    target: HTMLElement | Size

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
     * Defaults to 'top-left'.
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
  },
  {
    /**
     * Returns the rectangle of the sticky target.
     */
    getRect: () => Rectangle
  }
>(function (artboard, options) {
  const target = options.getRequired('target')
  const style =
    target instanceof HTMLElement ? inlineStyleOverrider(target) : null

  const size: Size =
    target instanceof HTMLElement
      ? { width: target.offsetWidth, height: target.offsetHeight }
      : target

  const coords: Coord = { x: 0, y: 0 }

  function onSizeChange(entry: ResizeObserverEntry) {
    if (entry.target !== target) return
    const newSize = entry.borderBoxSize?.[0]
    if (!newSize) return

    size.width = newSize.inlineSize
    size.height = newSize.blockSize
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

    // Update the size if no HTML element is provided as target.
    if (!(target instanceof HTMLElement)) {
      const newSize = options.get('target') as Size
      size.width = newSize.width
      size.height = newSize.height
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
      ctx.offset.x +
      computed.value.xMargin -
      size.width * computed.value.origin.x
    y +=
      ctx.offset.y +
      computed.value.yMargin -
      size.height * computed.value.origin.y

    // If keepVisible is set, make sure the element always stays visible inside
    // the root element's rect.
    if (keepVisible) {
      x = Math.min(
        Math.max(x, computed.value.margin.left),
        ctx.rootSize.width - size.width - computed.value.margin.right,
      )
      y = Math.min(
        Math.max(y, computed.value.margin.top),
        ctx.rootSize.height - size.height - computed.value.margin.bottom,
      )
    }

    const precision = options.get('precision', 0.5)
    coords.x = withPrecision(x, precision)
    coords.y = withPrecision(y, precision)

    if (style) {
      style.setTransform(coords.x, coords.y)
      style.set('transformOrigin', computed.value.transformOrigin)
    }
  }

  if (target instanceof HTMLElement) {
    artboard.observeSize(target)
  }

  function destroy() {
    if (target instanceof HTMLElement) {
      artboard.unobserveSize(target)
    }
    if (options.should('restoreStyles') && style) {
      style.restore()
    }
  }

  if (style) {
    style.setMultiple({
      position: 'absolute',
      top: '0',
      left: '0',
      right: 'auto',
      bottom: 'auto',
    })
  }

  function getRect(): Rectangle {
    return {
      ...size,
      ...coords,
    }
  }

  return {
    options,
    destroy,
    loop,
    onSizeChange,
    getRect,
  }
})
