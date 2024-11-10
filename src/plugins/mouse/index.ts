import { defineArtboardPlugin } from '../defineArtboardPlugin'
import { getDirection, getEventCoords } from '../../helpers'
import type { Coord } from '../../types/geometry'
import {
  createVelocityQueue,
  type VelocityQueueOptions,
} from '../../helpers/queue'
import { prepareForDrag } from '../../helpers/artboard'

export const mouse = defineArtboardPlugin<{
  /**
   * Whether to set the cursor on the root element to indicate when dragging.
   *
   * Note by default this is disabled because changing the cursor can trigger style recalculation, see https://gist.github.com/paulirish/5d52fb081b3570c81e3a/565c05680b27c9cfd9f5e971d295cd558c3e1843.
   */
  setCursor?: boolean

  /**
   * Only allow dragging while holding the spacebar.
   */
  useSpacebar?: boolean

  /**
   * Options for the velocity queue.
   */
  velocity?: Partial<VelocityQueueOptions>

  scrollDirectionThreshold?: number
}>(function (artboard, options) {
  const rootEl = artboard.getRootElement()

  // The element that was previously focused.
  let prevFocusedElement: HTMLElement | null = null

  // Whether the user is currently pressing the space key.
  let isPressingSpace: boolean = false

  // The original cursor of the root element before starting the dragging.
  const originalCursor = rootEl.style.cursor

  // Initial coordinates when dragging started.
  let initialTouchPoint: null | Coord = null

  // The initial offset when dragging started.
  let initialOffset: null | Coord = null

  function getQueueOptions(): VelocityQueueOptions {
    const velocityQueueOptions = options.get('velocity', {})
    return {
      maxTimeWindow: velocityQueueOptions.maxTimeWindow || 200,
      maxVelocity: velocityQueueOptions.maxVelocity || 6000,
      minVelocity: velocityQueueOptions.minVelocity || 300,
      multiplicator: velocityQueueOptions.multiplicator || 1.2,
    }
  }

  const velocityQueue = createVelocityQueue(getQueueOptions())

  function onClick(e: MouseEvent) {
    const interaction = artboard.getInteraction()
    if (
      isPressingSpace ||
      interaction === 'momentum' ||
      artboard.wasMomentumScrolling()
    ) {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
    }
  }

  function destroy(): void {
    window.removeEventListener('pointerup', onPointerUp, {
      capture: true,
    })
    rootEl.removeEventListener('pointerdown', onPointerDown, {
      capture: true,
    })
    rootEl.removeEventListener('click', onClick, {
      capture: true,
    })
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('keyup', onKeyUp)
    document.removeEventListener('pointermove', onPointerMove)
    // Restore the original cursor of the root element.
    rootEl.style.cursor = originalCursor
  }

  /**
   * @param e - The keyboard event.
   */
  function onKeyDown(e: KeyboardEvent) {
    if (artboard.getInteraction() !== 'none') {
      e.preventDefault()
      e.stopPropagation()
    }
    if (e.code === 'Space') {
      if (!isPressingSpace && options.should('setCursor')) {
        rootEl.style.cursor = 'move'
      }
      isPressingSpace = true
    }
  }

  /**
   * @param e - The keyboard event.
   */
  function onKeyUp(e: KeyboardEvent) {
    if (e.code === 'Space') {
      if (isPressingSpace && options.should('setCursor')) {
        rootEl.style.cursor = originalCursor
      }
      isPressingSpace = false
      if (prevFocusedElement) {
        prevFocusedElement.focus()
        prevFocusedElement = null
      }
    }
  }

  /**
   * @param e - The mouse event.
   */
  function onPointerDown(e: PointerEvent) {
    if (e.pointerType !== 'mouse') {
      return
    }
    e.stopPropagation()
    artboard.setMomentum()
    const canDrag = isPressingSpace || !options.should('useSpacebar')
    if (canDrag) {
      e.preventDefault()
      if (document.activeElement instanceof HTMLElement) {
        prevFocusedElement = document.activeElement
        document.activeElement.blur()
      }
    }
    document.removeEventListener('pointermove', onPointerMove)
    if (artboard.getInteraction() === 'momentum' || canDrag) {
      e.preventDefault()
    }

    if ((e.buttons === 1 && canDrag) || (e.buttons === 2 && !isPressingSpace)) {
      e.preventDefault()
      velocityQueue.init(getQueueOptions())
      initialOffset = prepareForDrag(artboard)
      initialTouchPoint = getEventCoords(e)
      document.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp, {
        capture: true,
      })
    }
  }

  /**
   * @param e - The mouse event.
   */
  function onPointerMove(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || !initialOffset) {
      return
    }
    if (!isPressingSpace && options.should('useSpacebar')) {
      onPointerUp(e)
      return
    }

    if (!initialTouchPoint) {
      return
    }

    const coords = getEventCoords(e)
    velocityQueue.add(coords)

    if (artboard.getTouchDirection() === 'none') {
      const direction = getDirection(
        coords,
        initialTouchPoint,
        options.get('scrollDirectionThreshold', 20),
      )
      artboard.setTouchDirection(direction)
    }

    artboard.setDirectionOffset(
      initialOffset.x + coords.x - initialTouchPoint.x,
      initialOffset.y + coords.y - initialTouchPoint.y,
    )
  }

  /**
   * @param touches - The touches.
   */
  function onPointerUp(e: PointerEvent) {
    if (e.pointerType !== 'mouse') {
      return
    }
    document.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp, {
      capture: true,
    })
    if (!initialTouchPoint) {
      return
    }

    // Add the end position too, so that the velocity is properly calculated.
    velocityQueue.add(getEventCoords(e))
    artboard.startMomentum(velocityQueue.getVelocity())
    initialTouchPoint = null
  }

  rootEl.addEventListener('pointerdown', onPointerDown, {
    passive: false,
    capture: false,
  })
  document.addEventListener('keydown', onKeyDown, {
    passive: false,
  })
  document.addEventListener('keyup', onKeyUp, {
    passive: false,
  })
  rootEl.addEventListener('click', onClick, {
    capture: true,
  })

  return {
    destroy,
  }
})
