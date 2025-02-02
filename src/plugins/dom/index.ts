import { defineArtboardPlugin } from '../defineArtboardPlugin'
import type { ArtboardLoopContext } from '../../types'
import { inlineStyleOverrider } from '../../helpers/inlineStyleOverrider'
import { adjustScaleForPrecision, withPrecision } from '../../helpers'

/**
 * The DOM plugin adds support for using a DOM element as the artboard.
 */
export const dom = defineArtboardPlugin<{
  /**
   * The artboard element.
   */
  element: HTMLElement

  /**
   * If set, the initial offset and scale is set based on the current position
   * of the artboard element in the viewport, relative to the root element.
   *
   * Use this if you want to determine the initial position of the artboard
   * using CSS, such as grid, flex or using transform. The plugin will override
   * any applied transform styles when it's initialised.
   */
  setInitTransformFromRect?: boolean

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
   * Calculate the applied scale so that the resulting scaled element's visible size is rounded to the target precision.
   */
  applyScalePrecision?: boolean

  /**
   * Whether to restore the original styles after destroying the plugin instance.
   */
  restoreStyles?: boolean
}>(function (artboard, options) {
  const artboardElement = options.getRequired('element')

  const styleOverrider = inlineStyleOverrider(artboardElement)

  function loop(ctx: ArtboardLoopContext) {
    if (!ctx.artboardSize) {
      return
    }
    const precision = options.get('precision', 0.5)
    const x = withPrecision(ctx.offset.x, precision)
    const y = withPrecision(ctx.offset.y, precision)
    if (options.should('applyScalePrecision')) {
      const scaleX = adjustScaleForPrecision(
        ctx.artboardSize.width,
        ctx.scale,
        precision,
      )
      const scaleY = adjustScaleForPrecision(
        ctx.artboardSize.height,
        ctx.scale,
        precision,
      )
      styleOverrider.setTransform(x, y, scaleX, scaleY)
    } else {
      styleOverrider.setTransform(x, y, ctx.scale)
    }
  }

  const { unobserve } = artboard.observeSizeChange(artboardElement, (entry) => {
    const size = entry.contentBoxSize[0]
    if (entry.target instanceof HTMLImageElement) {
      artboard.setArtboardSize(
        entry.target.naturalWidth,
        entry.target.naturalHeight,
      )
      styleOverrider.set('width', entry.target.naturalWidth)
      styleOverrider.set('height', entry.target.naturalHeight)
      return
    }

    artboard.setArtboardSize(size.inlineSize, size.blockSize)
  })

  function applyInitStyles() {
    styleOverrider.setMultiple({
      position: 'absolute',
      top: '0px',
      left: '0px',
      transformOrigin: '0 0',
    })
  }

  /** Callback for when image is finished loading. */
  function onImageLoaded() {
    if (artboardElement instanceof HTMLImageElement) {
      artboard.setArtboardSize(
        artboardElement.naturalWidth,
        artboardElement.naturalHeight,
      )
      if (options.should('setInitTransformFromRect')) {
        setInitTransformFromRect()
      }
      styleOverrider.set('width', artboardElement.naturalWidth)
      styleOverrider.set('height', artboardElement.naturalHeight)
      styleOverrider.set('maxWidth', 'none')

      applyInitStyles()
    }
  }

  /** Sets the initial transform based on the current visible rect. */
  function setInitTransformFromRect() {
    // Determine the initial offset based on the element's position.
    const artboardRect = artboardElement.getBoundingClientRect()
    const rootRect = artboard.getRootElement().getBoundingClientRect()
    const x = artboardRect.x - rootRect.x
    const y = artboardRect.y - rootRect.y
    const artboardWidth =
      artboardElement instanceof HTMLImageElement
        ? artboardElement.naturalWidth
        : artboardElement.offsetWidth

    const scale = Math.round((artboardRect.width / artboardWidth) * 1000) / 1000
    artboard.setScale(scale, true)
    artboard.setOffset(x, y, true)
  }

  // Special handling for images.
  if (artboardElement instanceof HTMLImageElement) {
    // Image is already fully loaded.
    if (artboardElement.complete) {
      onImageLoaded()
    } else {
      // Wait until image is loaded.
      artboardElement.addEventListener('load', onImageLoaded)
    }
  } else {
    artboard.setArtboardSize(
      artboardElement.offsetWidth,
      artboardElement.offsetHeight,
    )
    if (options.should('setInitTransformFromRect')) {
      setInitTransformFromRect()
    }
    applyInitStyles()
  }

  function destroy() {
    unobserve()
    artboardElement.removeEventListener('load', onImageLoaded)
    if (options.should('restoreStyles')) {
      styleOverrider.restore()
    }
  }

  return {
    options,
    loop,
    destroy,
  }
})
