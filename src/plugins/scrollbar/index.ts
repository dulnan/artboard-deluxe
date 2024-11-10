import { defineArtboardPlugin } from '../defineArtboardPlugin'
import type { ArtboardLoopContext } from '../../types'
import { inlineStyleOverrider } from '../../helpers/inlineStyleOverrider'

export type ScrollbarOrientation = 'x' | 'y'

export const scrollbar = defineArtboardPlugin<{
  /** The element representing the scrollbar. */
  element: HTMLElement

  /** The element or selector representing the scrollbar thumb. */
  thumbElement?: string | HTMLElement

  /** The orientation. */
  orientation: ScrollbarOrientation

  /** The minimum size of the thumb. */
  minThumbSize?: number

  /**
   * Whether to restore the original styles after destroying the plugin instance.
   */
  restoreStyles?: boolean
}>(function (artboard, options) {
  const elScrollbar: HTMLElement = options.get('element')
  const elButton = options.getElement(
    'thumbElement',
    '.artboard-thumb',
    elScrollbar,
  )
  const styleOverrider = inlineStyleOverrider(elButton)

  let scrollbarSize = 300
  let scrollStart = 0
  let thumbStart = 0
  let maxOffset = 0
  let thumbOffset = 0
  let scrollThumbSize = 0
  let scrollSize = 0

  function onSizeChange(entry: ResizeObserverEntry) {
    if (entry.target !== elScrollbar) {
      return
    }

    const size = entry?.contentBoxSize?.[0]
    if (!size) {
      return
    }
    const orientation = options.get('orientation')

    scrollbarSize = orientation === 'y' ? size.blockSize : size.inlineSize
  }

  function onClickScrollbar(e: MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    const orientation = options.get('orientation')
    if (orientation === 'y') {
      if (e.offsetY < thumbOffset) {
        artboard.scrollPageUp()
      } else {
        artboard.scrollPageDown()
      }
      return
    }

    if (e.offsetX < thumbOffset) {
      artboard.scrollPageLeft()
    } else {
      artboard.scrollPageRight()
    }
  }

  function getOffsetFromThumb(newThumb: number): number {
    const maxThumb = scrollbarSize - scrollThumbSize
    const newScrollProgress = newThumb / maxThumb
    const newScrollOffset = newScrollProgress * scrollSize
    return newScrollOffset + maxOffset
  }

  function onThumbMouseMove(e: MouseEvent) {
    if (e.buttons === 0) {
      onMouseUp()
      return
    }
    const diff = scrollStart - getMouseCoordinate(e)
    const newThumb = Math.max(
      Math.min(-thumbStart + diff, 0),
      -(scrollbarSize - scrollThumbSize),
    )
    const newOffset = getOffsetFromThumb(newThumb)
    const orientation = options.get('orientation')
    if (orientation === 'x') {
      artboard.setOffset(newOffset, null, true)
    } else {
      artboard.setOffset(null, newOffset, true)
    }
  }

  function getMouseCoordinate(e: MouseEvent): number {
    const orientation = options.get('orientation')
    return orientation === 'y' ? e.clientY : e.clientX
  }

  function onMouseUp() {
    document.removeEventListener('pointermove', onThumbMouseMove, {
      capture: true,
    })
    document.removeEventListener('pointerup', onMouseUp, {
      capture: true,
    })
  }

  function onThumbMouseDown(e: MouseEvent) {
    artboard.cancelAnimation()
    artboard.setInteraction()
    e.stopPropagation()
    e.preventDefault()
    e.stopImmediatePropagation()
    scrollStart = getMouseCoordinate(e)
    thumbStart = thumbOffset
    document.addEventListener('pointerup', onMouseUp, {
      passive: false,
      capture: true,
    })

    document.addEventListener('pointermove', onThumbMouseMove, {
      passive: false,
      capture: true,
    })
    onThumbMouseMove(e)
  }

  function applyStyles() {
    const scrollThumbSizeRounded = Math.round(scrollThumbSize)
    const orientation = options.get('orientation')
    const property = orientation === 'y' ? 'height' : 'width'
    styleOverrider.set(property, scrollThumbSizeRounded)

    const thumbOffsetRounded = Math.round(thumbOffset)
    const x = orientation === 'y' ? 0 : thumbOffsetRounded
    const y = orientation === 'x' ? 0 : thumbOffsetRounded
    styleOverrider.setTransform(x, y)
  }

  function loop(ctx: ArtboardLoopContext) {
    const orientation = options.get('orientation')
    const minThumbSize = options.get('minThumbSize', 32)
    const rootSize =
      orientation === 'x' ? ctx.rootSize.width : ctx.rootSize.height
    const offset = orientation === 'x' ? ctx.offset.x : ctx.offset.y
    const min = orientation === 'x' ? ctx.boundaries.xMin : ctx.boundaries.yMin
    const max = orientation === 'x' ? ctx.boundaries.xMax : ctx.boundaries.yMax

    maxOffset = max
    scrollSize = maxOffset - min
    scrollThumbSize = Math.max(
      Math.min((rootSize / scrollSize) * rootSize, rootSize * 0.9),
      minThumbSize,
    )
    const maxScrollbarSize = scrollbarSize - scrollThumbSize
    const scrollTop = scrollSize - (offset - min)
    const scrollProgress = 1 - (offset - min) / scrollSize

    let thumbOffsetRounded =
      Math.min(Math.max(scrollProgress, 0), 1) * maxScrollbarSize

    if (scrollProgress < 0) {
      const overscroll = Math.abs(Math.max(scrollTop, -400)) / 400
      scrollThumbSize = Math.max(
        scrollThumbSize - 100 * overscroll,
        minThumbSize,
      )
      thumbOffsetRounded = 0
    } else if (scrollProgress > 1) {
      const overscroll = Math.min(scrollTop - scrollSize, 400) / 400
      scrollThumbSize = Math.max(
        scrollThumbSize - 100 * overscroll,
        minThumbSize,
      )
      thumbOffsetRounded = scrollbarSize - scrollThumbSize
    }

    thumbOffset = thumbOffsetRounded
    applyStyles()
  }

  artboard.observeSize(elScrollbar)
  elButton.addEventListener('pointerdown', onThumbMouseDown, {
    capture: true,
  })
  elScrollbar.addEventListener('pointerdown', onClickScrollbar)

  function destroy() {
    artboard.unobserveSize(elScrollbar)
    elButton.removeEventListener('pointerdown', onThumbMouseDown, {
      capture: true,
    })
    elScrollbar.removeEventListener('pointerdown', onClickScrollbar)
    document.removeEventListener('pointerup', onMouseUp, {
      capture: true,
    })
    document.removeEventListener('pointermove', onThumbMouseMove, {
      capture: true,
    })
    if (options.should('restoreStyles')) {
      styleOverrider.restore()
    }
  }

  styleOverrider.setMultiple({
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 'auto',
    right: 'auto',
  })

  return {
    destroy,
    loop,
    onSizeChange,
  }
})
