import { defineArtboardPlugin } from '../defineArtboardPlugin'
import type { ArtboardLoopContext } from '../../types'
import { inlineStyleOverrider } from '../../helpers/inlineStyleOverrider'
import type { Coord, Size } from '../../types/geometry'

type OverviewOptions = {
  element: HTMLElement

  /** The element or selector for the artboard element in the overview. */
  artboardElement?: HTMLElement | string

  /** The element or selector for the visible area element in the overview. */
  visibleAreaElement?: HTMLElement | string

  /** The padding to apply inside the overview element, in pixels. */
  padding?: number

  /**
   * Whether to restore the original styles after destroying the plugin instance.
   */
  restoreStyles?: boolean

  /**
   * If enabled the height of the overview element is adjusted automatically
   * to the size of the artboard.
   *
   * The element must have a width. The height is calculated based on the
   * aspect ratio of the artboard.
   */
  autoHeight?: boolean
}

export const overview = defineArtboardPlugin<OverviewOptions>(
  function (artboard, options) {
    /** The overview element. */
    const overviewEl = options.getRequired('element')

    /** The width of the overview element. */
    let overviewWidth = overviewEl.offsetWidth

    /** The height of the overview element. */
    let overviewHeight = overviewEl.offsetHeight

    /** The overview artboard element that represents the size of the artboard. */
    const overviewArtboardEl = options.getElement(
      'artboardElement',
      '.artboard-overview-artboard',
      overviewEl,
    )

    /** The element that represents the visible area of the artboard. */
    const overviewVisibleEl = options.getElement(
      'visibleAreaElement',
      '.artboard-overview-visible',
      overviewEl,
    )

    const overviewElStyleOverrider = inlineStyleOverrider(overviewEl)
    const artboardElStyleOverrider = inlineStyleOverrider(overviewArtboardEl)
    const visibileEllStyleOverrider = inlineStyleOverrider(overviewVisibleEl)

    /** Whether the user is currently dragging the visible area. */
    let isDragging = false

    /** The mouse coordinates where the drag interaction started. */
    let dragStartCoords: Coord = { x: 0, y: 0 }

    /** The coordinates of the visible area when the drag interaction started. */
    let initialVisibleArea: Coord = { x: 0, y: 0 }

    let currentArtboardScale = artboard.getScale()
    let currentScale = artboard.getScale()
    let visibleArea = { x: 0, y: 0, width: 0, height: 0 }

    function onSizeChange(entry: ResizeObserverEntry) {
      if (entry.target !== overviewEl) {
        return
      }
      const size = entry?.contentRect
      if (!size) {
        return
      }

      overviewWidth = size.width
      overviewHeight = size.height
    }

    /** Removes all event listeners and cleans up. */
    function destroy() {
      overviewEl.removeEventListener('pointerdown', onPointerDown)
      overviewEl.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
      artboard.unobserveSize(overviewEl)
      if (options.should('restoreStyles')) {
        overviewElStyleOverrider.restore()
        visibileEllStyleOverrider.restore()
        artboardElStyleOverrider.restore()
      }
    }

    function applyArtboardStyles(
      x: number,
      y: number,
      width: number,
      height: number,
    ) {
      artboardElStyleOverrider.setTransform(x, y)
      artboardElStyleOverrider.set('width', width)
      artboardElStyleOverrider.set('height', height)
    }

    function applyVisibleStyles(
      x: number,
      y: number,
      width: number,
      height: number,
    ) {
      const newX = Math.max(-100, x)
      const newY = Math.max(-100, y)

      visibileEllStyleOverrider.setTransform(newX, newY)
      visibileEllStyleOverrider.set('width', Math.round(width - (newX - x)))
      visibileEllStyleOverrider.set('height', Math.round(height - (newY - y)))
    }

    function getOverviewHeight(
      autoHeight: boolean,
      artboardSize: Size,
      padding: number,
    ) {
      if (autoHeight) {
        const artboardAspect = artboardSize.width / artboardSize.height
        const availableWidth = overviewWidth - padding * 2
        const height = availableWidth / artboardAspect
        return height + padding * 2
      }

      return overviewHeight
    }

    /** Main animation loop. */
    function loop(ctx: ArtboardLoopContext): void {
      const { rootSize, artboardSize, scale, offset } = ctx

      if (!artboardSize) {
        throw new Error('Overview plugin can not be used with infinite canvas.')
      }

      const autoHeight = options.should('autoHeight')

      const padding = options.get('padding', 20)

      // Minimal available size for the artboard in the overview (in pixels).
      const minimalAvailableWidth = 1
      const minimalAvailableHeight = 1

      let adjustedPaddingX = padding
      let adjustedPaddingY = padding

      // Total desired padding on each axis.
      const totalDesiredPaddingX = padding * 2
      const totalDesiredPaddingY = padding * 2

      const actualOverviewHeight = getOverviewHeight(
        autoHeight,
        artboardSize,
        padding,
      )

      // Maximum total padding that can be applied without making the available sizes negative.
      const maxTotalPaddingX = overviewWidth - minimalAvailableWidth
      const maxTotalPaddingY = actualOverviewHeight - minimalAvailableHeight

      // Adjust padding for x-axis.
      if (totalDesiredPaddingX > maxTotalPaddingX) {
        const ratioX = maxTotalPaddingX / totalDesiredPaddingX
        adjustedPaddingX = Math.max(1, padding * ratioX)
      }

      // Adjust padding for y-axis.
      if (totalDesiredPaddingY > maxTotalPaddingY) {
        const ratioY = maxTotalPaddingY / totalDesiredPaddingY
        adjustedPaddingY = Math.max(1, padding * ratioY)
      }

      // Calculate available width and height after adjusted padding.
      const availableWidth = overviewWidth - adjustedPaddingX * 2
      const availableHeight = actualOverviewHeight - adjustedPaddingY * 2

      // Calculate aspect ratio.
      const artboardAspect = artboardSize.width / artboardSize.height
      const availableAspect = availableWidth / availableHeight

      // Calculate the scale so that the artboard fits within the available space.
      const artboardScale =
        artboardAspect > availableAspect
          ? availableWidth / artboardSize.width
          : availableHeight / artboardSize.height

      // Calculate the size of the artboard.
      const artboardWidth = artboardSize.width * artboardScale
      const artboardHeight = artboardSize.height * artboardScale

      // Center the artboard element in the available space.
      const artboardX = adjustedPaddingX + (availableWidth - artboardWidth) / 2
      const artboardY =
        adjustedPaddingY + (availableHeight - artboardHeight) / 2

      applyArtboardStyles(
        Math.round(artboardX),
        Math.round(artboardY),
        Math.round(artboardWidth),
        Math.round(artboardHeight),
      )

      const newVisibleArea = {
        x: -offset.x / scale,
        y: -offset.y / scale,
        width: rootSize.width / scale,
        height: rootSize.height / scale,
      }

      // Calculate the size of the visible area element.
      const visibleWidth = newVisibleArea.width * artboardScale
      const visibleHeight = newVisibleArea.height * artboardScale

      // Calculate the position of the visible area element.
      const visibleX = artboardX + newVisibleArea.x * artboardScale
      const visibleY = artboardY + newVisibleArea.y * artboardScale

      applyVisibleStyles(
        Math.round(visibleX),
        Math.round(visibleY),
        Math.round(visibleWidth),
        Math.round(visibleHeight),
      )

      if (autoHeight) {
        overviewElStyleOverrider.set('height', actualOverviewHeight)
      }

      // Store current values for use in event handlers
      currentArtboardScale = artboardScale
      currentScale = scale
      visibleArea = newVisibleArea
    }

    /** Check if the event originated from within the visible area button. */
    function isInsideButton(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement) && !(target instanceof SVGElement)) {
        return false
      }

      let parent: HTMLElement | SVGElement | null = target

      while (parent) {
        if (parent === overviewVisibleEl) {
          return true
        } else if (parent === overviewEl) {
          return false
        }

        parent = parent.parentElement
      }

      return false
    }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault()
      e.stopPropagation()
    }

    /** Callback for the pointerdown event. */
    function onPointerDown(e: MouseEvent): void {
      if (!(e.target instanceof HTMLElement)) {
        return
      }

      e.preventDefault()
      e.stopPropagation()
      artboard.cancelAnimation()
      artboard.setInteraction('none')

      if (!isInsideButton(e.target)) {
        moveVisibleEl(e)
      }

      isDragging = true
      dragStartCoords = { x: e.clientX, y: e.clientY }
      const offset = artboard.getOffset()
      initialVisibleArea = {
        x: -offset.x / currentScale,
        y: -offset.y / currentScale,
      }

      document.addEventListener('pointermove', onPointerMove, {
        capture: true,
      })
      document.addEventListener('pointerup', onPointerUp, {
        capture: true,
      })
    }

    /**
     * Adjust the offset so that the visible area element is centered around the
     * coordinates of the click.
     */
    function moveVisibleEl(e: MouseEvent): void {
      if (isDragging) {
        return
      }

      // Click coordinates relative to the artboard element.
      const rect = overviewArtboardEl.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      // Convert to artboard coordinates.
      const clickXArtboard = clickX / currentArtboardScale
      const clickYArtboard = clickY / currentArtboardScale

      // Calculate the new visible area position to center around the click point.
      const newVisibleAreaX = clickXArtboard - visibleArea.width / 2
      const newVisibleAreaY = clickYArtboard - visibleArea.height / 2

      const x = -newVisibleAreaX * currentScale
      const y = -newVisibleAreaY * currentScale
      artboard.setOffset(x, y, true)
    }

    /** Callback for the pointermove event. */
    function onPointerMove(e: PointerEvent): void {
      if (!isDragging) {
        return
      }

      e.stopPropagation()
      e.preventDefault()

      // Calculate the mouse movement delta.
      const deltaX = e.clientX - dragStartCoords.x
      const deltaY = e.clientY - dragStartCoords.y

      // Convert to artboard coordinates.
      const deltaVisibleAreaX = deltaX / currentArtboardScale
      const deltaVisibleAreaY = deltaY / currentArtboardScale

      // Calculate the new visible area position.
      const newVisibleAreaX = initialVisibleArea.x + deltaVisibleAreaX
      const newVisibleAreaY = initialVisibleArea.y + deltaVisibleAreaY

      const x = -newVisibleAreaX * currentScale
      const y = -newVisibleAreaY * currentScale
      artboard.setOffset(x, y, true)
    }

    /** Callback for the pointerup event. */
    function onPointerUp(e: PointerEvent): void {
      e.preventDefault()
      e.stopPropagation()
      isDragging = false
      document.removeEventListener('pointermove', onPointerMove, {
        capture: true,
      })
      document.removeEventListener('pointerup', onPointerUp, {
        capture: true,
      })
    }

    if (overviewEl.style.position === 'static') {
      overviewElStyleOverrider.set('position', 'relative')
    }

    artboardElStyleOverrider.setMultiple({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 'auto',
      bottom: 'auto',
      transformOrigin: '0 0',
      pointerEvents: 'none',
      overflow: 'hidden',
    })

    visibileEllStyleOverrider.setMultiple({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 'auto',
      bottom: 'auto',
      transformOrigin: '0 0',
      cursor: 'move',
    })

    overviewEl.addEventListener('pointerdown', onPointerDown)
    overviewEl.addEventListener('touchstart', onTouchStart)

    artboard.observeSize(overviewEl)

    return {
      destroy,
      loop,
      onSizeChange,
    }
  },
)
