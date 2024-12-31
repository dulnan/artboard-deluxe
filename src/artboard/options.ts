import { parseEdges, withDefault } from '../helpers'
import type { Edge } from '../types/geometry'
import type { ArtboardOptions, Direction } from './../types'

type OptionsState = {
  options: ArtboardOptions
  overscrollBounds: Edge
}

function createOptions(initOptions?: ArtboardOptions) {
  const state: OptionsState = {
    options: initOptions || {},
    overscrollBounds: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  }

  function calculateOverscrollBounds() {
    state.overscrollBounds = parseEdges(state.options.overscrollBounds, 30)
  }

  function setAllOptions(newOptions?: ArtboardOptions) {
    if (newOptions) {
      state.options = { ...newOptions }
    } else {
      state.options = {}
    }
    calculateOverscrollBounds()
  }

  function set<T extends keyof ArtboardOptions>(
    key: T,
    value: ArtboardOptions[T],
  ) {
    state.options[key] = value
    if (key === 'overscrollBounds') {
      calculateOverscrollBounds()
    }
  }

  calculateOverscrollBounds()

  return {
    setAllOptions,
    set,
    get hasBlockingRects(): boolean {
      return !!state.options.getBlockingRects
    },

    get overscrollBounds(): Edge {
      return state.overscrollBounds
    },

    get minScale(): number {
      return withDefault(state.options.minScale, 0.1)
    },

    get maxScale(): number {
      return withDefault(state.options.maxScale, 5)
    },

    get scrollStepAmount(): number {
      return withDefault(state.options.scrollStepAmount, 256)
    },

    get margin(): number {
      return withDefault(state.options.margin, 20)
    },

    get momentumDeceleration(): number {
      return withDefault(state.options.momentumDeceleration, 0.96)
    },

    get springDamping(): number {
      return withDefault(state.options.springDamping, 0.5)
    },

    get direction(): Direction {
      return state.options.direction || 'both'
    },

    get rootClientRectMaxStale(): number {
      return withDefault(state.options.rootClientRectMaxStale, 5000)
    },

    get blockingRects() {
      if (state.options.getBlockingRects) {
        const rects = state.options.getBlockingRects()
        return rects.map((rect) => {
          if (Array.isArray(rect)) {
            return {
              x: rect[0],
              y: rect[1],
              width: rect[2],
              height: rect[3],
            }
          }
          return rect
        })
      }

      return []
    },
  }
}

type Options = ReturnType<typeof createOptions>

export { createOptions, type Options }
