import { createArtboard } from './artboard/createArtboard'
import {
  inlineStyleOverrider,
  type InlineStyleOverrider,
} from './helpers/inlineStyleOverrider'
import { clickZoom } from './plugins/clickZoom'
import { cssProperties } from './plugins/cssProperties'
import { defineArtboardPlugin } from './plugins/defineArtboardPlugin'
import { dom } from './plugins/dom'
import { doubleTapZoom } from './plugins/doubleTapZoom'
import { keyboard } from './plugins/keyboard'
import { mouse } from './plugins/mouse'
import { overview } from './plugins/overview'
import { raf } from './plugins/raf'
import { scrollbar } from './plugins/scrollbar'
import { touch } from './plugins/touch'
import { wheel } from './plugins/wheel'
import { sticky } from './plugins/sticky'
import type { PluginInstance, PluginOptions } from './types'

// Types.
export type {
  Artboard,
  ArtboardLoopContext,
  ArtboardOptions,
  ArtboardPluginInstance,
  ArtboardPluginDefinition,
  ArtboardPluginInit,
  ArtboardPluginOptions,
  ArtboardScrollIntoViewOptions,
  ArtboardState,
  Direction,
  Interaction,
  Momentum,
  PossibleBlockingRect,
  ScaleTarget,
} from './types'

export type { Boundaries, Coord, Edge, Rectangle, Size } from './types/geometry'
export type { AnimationOptions } from './helpers/animation'

// Plugin factory types.
export type PluginClickZoomFactory = ReturnType<typeof clickZoom>
export type PluginCssPropertiesFactory = ReturnType<typeof cssProperties>
export type PluginDomFactory = ReturnType<typeof dom>
export type PluginDoubleTapZoomFactory = ReturnType<typeof doubleTapZoom>
export type PluginKeyboardFactory = ReturnType<typeof keyboard>
export type PluginMouseFactory = ReturnType<typeof mouse>
export type PluginOverviewFactory = ReturnType<typeof overview>
export type PluginRafFactory = ReturnType<typeof raf>
export type PluginScrollbarFactory = ReturnType<typeof scrollbar>
export type PluginTouchFactory = ReturnType<typeof touch>
export type PluginWheelFactory = ReturnType<typeof wheel>
export type PluginStickyFactory = ReturnType<typeof sticky>

// Plugin option types.
export type PluginClickZoomOptions = PluginOptions<PluginClickZoomFactory>
export type PluginCssPropertiesOptions =
  PluginOptions<PluginCssPropertiesFactory>
export type PluginDomOptions = PluginOptions<PluginDomFactory>
export type PluginDoubleTapZoomOptions =
  PluginOptions<PluginDoubleTapZoomFactory>
export type PluginKeyboardOptions = PluginOptions<PluginKeyboardFactory>
export type PluginMouseOptions = PluginOptions<PluginMouseFactory>
export type PluginOverviewOptions = PluginOptions<PluginOverviewFactory>
export type PluginScrollbarOptions = PluginOptions<PluginScrollbarFactory>
export type PluginTouchOptions = PluginOptions<PluginTouchFactory>
export type PluginWheelOptions = PluginOptions<PluginWheelFactory>
export type PluginStickyOptions = PluginOptions<PluginStickyFactory>

// Plugin instance types.
export type PluginClickZoom = PluginInstance<PluginClickZoomFactory>
export type PluginCssProperties = PluginInstance<PluginCssPropertiesFactory>
export type PluginDom = PluginInstance<PluginDomFactory>
export type PluginDoubleTapZoom = PluginInstance<PluginDoubleTapZoomFactory>
export type PluginKeyboard = PluginInstance<PluginKeyboardFactory>
export type PluginMouse = PluginInstance<PluginMouseFactory>
export type PluginOverview = PluginInstance<PluginOverviewFactory>
export type PluginRaf = PluginInstance<PluginRafFactory>
export type PluginScrollbar = PluginInstance<PluginScrollbarFactory>
export type PluginTouch = PluginInstance<PluginTouchFactory>
export type PluginWheel = PluginInstance<PluginWheelFactory>
export type PluginSticky = PluginInstance<PluginStickyFactory>

export {
  createArtboard,
  defineArtboardPlugin,
  inlineStyleOverrider,
  clickZoom,
  dom,
  doubleTapZoom,
  keyboard,
  mouse,
  overview,
  scrollbar,
  touch,
  wheel,
  raf,
  cssProperties,
  sticky,
  type InlineStyleOverrider,
  type PluginOptions,
  type PluginInstance,
}
