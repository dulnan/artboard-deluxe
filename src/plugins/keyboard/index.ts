import { defineArtboardPlugin } from '../defineArtboardPlugin'
import type { Artboard } from '../../types'

type KeyboardModifier = 'ctrl' | 'meta' | 'alt' | 'ctrlmeta'

type PickMatching<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] }

// Extracts all methods that can be called without an argument.
type ExtractMethods<T> = PickMatching<T, () => void>

// Extract methods of the Artboard class.
type ArtboardMethods = ExtractMethods<Artboard>

type Keymap = Record<string, [keyof ArtboardMethods, boolean?]>

const DEFAULT_KEYMAP: Keymap = {
  ArrowDown: ['scrollDown'],
  ArrowUp: ['scrollUp'],
  ArrowLeft: ['scrollLeft'],
  ArrowRight: ['scrollRight'],
  Home: ['scrollToTop'],
  End: ['scrollToEnd'],
  PageUp: ['scrollPageUp'],
  PageDown: ['scrollPageDown'],
  Digit0: ['resetZoom', true],
  Digit1: ['scaleToFit', true],
}

export const keyboard = defineArtboardPlugin<{
  /**
   * The modifier key to check.
   *
   * Defaults to 'ctrl'.
   */
  modifier?: KeyboardModifier

  /**
   * Override the default keymap.
   *
   * Should be an object whose properties are the keyboard code (according to
   * KeyboardEvent['code']) and the values is an array where the first item is
   * the name of the Artboard method to call and the second (optional value) is
   * whether a modifier key is required.
   */
  keymap?: Keymap
}>(function (artboard, options) {
  document.addEventListener('keydown', onKeyDown)

  function destroy() {
    document.removeEventListener('keydown', onKeyDown)
  }

  /** Checks whether the required modifier key has been pressed. */
  function isPressingModifier(e: KeyboardEvent): boolean {
    const modifier = options.get('modifier', 'ctrlmeta')
    if (modifier === 'ctrl') {
      return e.ctrlKey
    } else if (modifier === 'alt') {
      return e.altKey
    } else if (modifier === 'meta') {
      return e.metaKey
    } else if (modifier === 'ctrlmeta') {
      return e.metaKey || e.ctrlKey
    }

    throw new Error('Invalid modifier key.')
  }

  /** Callback for the keydown event listener. */
  function onKeyDown(e: KeyboardEvent) {
    const keymap = options.get('keymap', DEFAULT_KEYMAP)
    if (!artboard) {
      return
    }

    const mapping = keymap[e.code]
    if (!mapping) {
      return
    }

    const method = mapping[0]
    const needsModifier = !!mapping[1]

    if (needsModifier && !isPressingModifier(e)) {
      return
    }

    e.preventDefault()
    artboard[method]()
  }

  return {
    options,
    destroy,
  }
})
