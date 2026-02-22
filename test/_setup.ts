import { vi } from 'vitest'
import type {
  Artboard,
  ArtboardLoopContext,
  ArtboardPluginDefinition,
  ArtboardPluginInstance,
} from '~/types'

/**
 * Plugin instance with destroy and loop guaranteed to be defined.
 *
 * All built-in plugins provide both methods, so tests can call them
 * without optional chaining.
 */
export type TestPluginInstance<R extends object = object> = Required<
  Pick<ArtboardPluginInstance, 'destroy' | 'loop'>
> &
  ArtboardPluginInstance<object, R>

export function createMockArtboard(overrides?: Partial<Artboard>): Artboard {
  const rootEl = document.createElement('div')

  const artboard = {
    // State getters
    getOffset: vi.fn(() => ({ x: 0, y: 0 })),
    getFinalOffset: vi.fn(() => ({ x: 0, y: 0 })),
    getScale: vi.fn(() => 1),
    getFinalScale: vi.fn(() => 1),
    getInteraction: vi.fn(() => 'none' as const),
    getArtboardSize: vi.fn(() => ({ width: 1000, height: 1000 })),
    getRootSize: vi.fn(() => ({ width: 800, height: 600 })),
    getRootElement: vi.fn(() => rootEl),
    getBoundaries: vi.fn(() => ({
      xMin: -500,
      xMax: 500,
      yMin: -500,
      yMax: 500,
    })),
    getMomentum: vi.fn(() => null),
    getTouchDirection: vi.fn(() => 'none' as const),
    getScaleTarget: vi.fn(() => null),
    getAnimation: vi.fn(() => null),
    wasMomentumScrolling: vi.fn(() => false),
    getCenterX: vi.fn(() => 0),

    // State setters
    setOffset: vi.fn(),
    setScale: vi.fn(),
    setInteraction: vi.fn(),
    setMomentum: vi.fn(),
    setTouchDirection: vi.fn(),
    setDirectionOffset: vi.fn(),
    setScaleTarget: vi.fn(),
    setArtboardSize: vi.fn(),
    setOptions: vi.fn(),
    setOption: vi.fn(),

    // Actions
    cancelAnimation: vi.fn(),
    animateTo: vi.fn(),
    animateToBoundary: vi.fn(),
    animateOrJumpBy: vi.fn(),
    animateOrJumpTo: vi.fn(),
    scaleAroundPoint: vi.fn(),
    calculateScaleAroundPoint: vi.fn(() => ({ x: 0, y: 0, scale: 1 })),
    startMomentum: vi.fn(),
    scrollIntoView: vi.fn(),
    scrollElementIntoView: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),

    // Scroll methods
    scrollUp: vi.fn(),
    scrollDown: vi.fn(),
    scrollLeft: vi.fn(),
    scrollRight: vi.fn(),
    scrollToTop: vi.fn(),
    scrollToEnd: vi.fn(),
    scrollPageUp: vi.fn(),
    scrollPageDown: vi.fn(),
    scrollPageLeft: vi.fn(),
    scrollPageRight: vi.fn(),
    resetZoom: vi.fn(),
    scaleToFit: vi.fn(),

    // Plugin lifecycle
    addPlugin: vi.fn(),
    removePlugin: vi.fn(),
    destroy: vi.fn(),
    loop: vi.fn(() => ({
      rootSize: { width: 800, height: 600 },
      artboardSize: { width: 1000, height: 1000 },
      scale: 1,
      offset: { x: 0, y: 0 },
      boundaries: { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
      currentTime: 0,
    })),
    observeSizeChange: vi.fn(() => ({ unobserve: vi.fn() })),

    // Options
    options: {
      minScale: 0.1,
      maxScale: 5,
      springDamping: 0.5,
    },

    ...overrides,
  } as unknown as Artboard

  return artboard
}

export function initPlugin<O extends object, R extends object>(
  definition: ArtboardPluginDefinition<O, R>,
  artboard: Artboard,
): TestPluginInstance<R> {
  return definition.init(artboard, definition.options) as TestPluginInstance<R>
}

export function createLoopContext(
  overrides?: Partial<ArtboardLoopContext>,
): ArtboardLoopContext {
  return {
    rootSize: { width: 800, height: 600 },
    artboardSize: { width: 1000, height: 1000 },
    scale: 1,
    offset: { x: 100, y: 200 },
    boundaries: { xMin: -500, xMax: 500, yMin: -500, yMax: 500 },
    currentTime: 0,
    ...overrides,
  }
}
