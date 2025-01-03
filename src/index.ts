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
import type { PluginOptions } from './types'

// Types.
export type {
  Artboard,
  ArtboardLoopContext,
  ArtboardOptions,
  ArtboardPlugin,
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

export type {
  Boundaries,
  Coord,
  Paddings,
  Rectangle,
  Size,
} from './types/geometry'
export type { AnimationOptions } from './helpers/animation'

// Plugin types.
export type PluginClickZoom = ReturnType<typeof clickZoom>
export type PluginCssProperties = ReturnType<typeof cssProperties>
export type PluginDom = ReturnType<typeof dom>
export type PluginDoubleTapZoom = ReturnType<typeof doubleTapZoom>
export type PluginKeyboard = ReturnType<typeof keyboard>
export type PluginMouse = ReturnType<typeof mouse>
export type PluginOverview = ReturnType<typeof overview>
export type PluginRaf = ReturnType<typeof raf>
export type PluginScrollbar = ReturnType<typeof scrollbar>
export type PluginTouch = ReturnType<typeof touch>
export type PluginWheel = ReturnType<typeof wheel>

// Plugin option types.
export type PluginClickZoomOptions = PluginOptions<PluginClickZoom>
export type PluginCssPropertiesOptions = PluginOptions<PluginCssProperties>
export type PluginDomOptions = PluginOptions<PluginDom>
export type PluginDoubleTapZoomOptions = PluginOptions<PluginDoubleTapZoom>
export type PluginKeyboardOptions = PluginOptions<PluginKeyboard>
export type PluginMouseOptions = PluginOptions<PluginMouse>
export type PluginOverviewOptions = PluginOptions<PluginOverview>
export type PluginScrollbarOptions = PluginOptions<PluginScrollbar>
export type PluginTouchOptions = PluginOptions<PluginTouch>
export type PluginWheelOptions = PluginOptions<PluginWheel>

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
  type InlineStyleOverrider,
}
