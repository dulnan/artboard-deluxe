import type { Options } from '../artboard/options'
import type { AnimationOptions, ArtboardAnimation } from '../helpers/animation'
import type { Boundaries, Coord, Edge, Rectangle, Size } from './geometry'

// Extract the plugin options.
export type PluginOptions<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ArtboardPluginDefinition<infer O, any> ? O : never

// Infer a fully initialised plugin instance.
export type PluginInstance<T> =
  T extends ArtboardPluginDefinition<
    infer O extends object,
    infer R extends object
  >
    ? ArtboardPluginInstance<O, R>
    : never

/**
 * Defines possible scroll directions.
 */
export type Direction = 'horizontal' | 'vertical' | 'both' | 'none'

/**
 * A possible return type for the getBlockingRects() method.
 *
 * You may either return an object compatible with `Rectangle` (such as the return value of `element.getBoundingClientRect()`) or an array of four numbers representing `[x, y, width, height]`.
 */
export type PossibleBlockingRect = Rectangle | [number, number, number, number]

/**
 * A fully initialised plugin instance.
 */
export type ArtboardPluginInstance<
  O extends object = object,
  R extends object = object,
> = {
  /**
   * The options helper.
   */
  options: ArtboardPluginOptions<O>
  /**
   * Remove event listeners and clean up.
   */
  destroy?: () => void

  /**
   * Called when the size of an element previously observed using `artboard.observeSize()` changes.
   */
  onSizeChange?: (entry: ResizeObserverEntry) => void

  /**
   * Called in the main animation loop.
   *
   * Receives the state of the artboard at the time of the animation loop as an argument.
   */
  loop?: (ctx: ArtboardLoopContext) => void
} & R

export type ArtboardPluginOptions<T extends object> = {
  /**
   * Get an option value.
   */
  get<K extends keyof T>(key: K): T[K]

  /**
   * Get a required option value. If the option is not set an error is thrown.
   */
  getRequired<K extends keyof T>(key: K): T[K]

  /**
   * Get an option that is either a DOM element or a selector.
   *
   * Throws an error if no element could be found.
   */
  getElement<K extends keyof T>(
    key: K,
    fallbackSelector: string,
    parent: HTMLElement,
  ): HTMLElement

  /**
   * Returns the boolean representation of an option.
   */
  should<K extends keyof T>(key: K, defaultValue?: T[K]): boolean

  /**
   * Get an option value with a default value.
   */
  get<K extends keyof T>(key: K, defaultValue: T[K]): NonNullable<T[K]>

  /**
   * Set an option.
   */
  set<K extends keyof T>(key: K, value: T[K]): void

  /**
   * Set all options at once.
   */
  setAll(newOptions: T): void

  /**
   * Compute and cache a value based on the current options.
   *
   * If any option is changed (via set or setAll), the cache is cleared.
   */
  computed<R>(callback: (options: T) => R): { value: R }
}

export type ArtboardPluginInit<O extends object, R extends object = object> = (
  artboard: Artboard,
  options: ArtboardPluginOptions<O>,
) => ArtboardPluginInstance<O, R>

/**
 * Defines a plugin definition.
 *
 * This is the return value when you create a plugin, e.g. using `mouse()`.
 * The plugin definition can then be passed as the second argument in an array to `createArtboard` or by manually adding the plugin after the artboard has been initialised using `artboard.addPlugin()`.
 */
export type ArtboardPluginDefinition<T extends object, R extends object> = {
  /**
   * The options instance.
   */
  options: ArtboardPluginOptions<T>

  /**
   * The method to initlise the plugin.
   *
   * @internal
   */
  init: ArtboardPluginInit<T, R>
}

/**
 * Options for createArtboard().
 */
export type ArtboardOptions = {
  /**
   * The initial offset.
   *
   * @example
   * ```typescript
   * {
   *   initTransform: {
   *     x: 500,
   *     y: 20,
   *     scale: 1
   *   }
   * }
   * ```
   */
  initTransform?: Coord & { scale: number }

  /**
   * How much of the artboard should remain visible when overscrolling.
   *
   * A value of 0 means the artboard can be dragged right to every edge of the
   * root element. A value of e.g. 100 means that there is always at least 100px
   * of the artboard visible. A negative value means the artboard can be dragged
   * outside the root element.
   *
   * You can also provide an object with top, right, bottom and left properties
   * to define individual values per edge.
   *
   * @example
   * Initialise with same bounds on all edges.
   * ```typescript
   * {
   *   overscrollBounds: 20
   * }
   * ```
   *
   * @example
   * Initialise with individual bounds per edge.
   * ```typescript
   * {
   *   overscrollBounds: {
   *     top: 50,
   *     bottom: 50,
   *     left: 100,
   *     right: 70,
   *   }
   * }
   * ```
   */
  overscrollBounds?: number | Edge

  /**
   * The margin used when aligning the artboard, for example when calling the
   * `scaleToFit()` method. In this case, a value of `0` would scale the artboard to
   * fill all the available width or height. A value of `50` would scale it so that
   * there is at least 50px between the artboard and the root element.
   *
   * @example
   * ```typescript
   * Keeps at least 10px space between the artboard and the root element when aligning.
   * {
   *   margin: 10,
   * }
   * ```
   */
  margin?: number

  /**
   * The amount to scroll per step, in pixels. This is used by methods like
   * `artboard.scrollUp()`.
   *
   * @example
   * Scrolls by 200px when calling for example the scrollUp() method, e.g. when
   * pressing the ArrowUp key.
   * ```typescript
   * {
   *    scrollStepAmount: 200,
   * }
   * ```
   */
  scrollStepAmount?: number

  /**
   * The minimum amount the artboard can scale.
   *
   * @example
   * Prevents scaling below 0.1.
   *
   * ```typescript
   * {
   *    minScale: 0.1,
   * }
   * ```
   */
  minScale?: number

  /**
   * The maximum amount the artboard can scale.
   *
   * @example
   * Prevents scaling above 9.
   * ```typescript
   * {
   *    maxScale: 9,
   * }
   * ```
   */
  maxScale?: number

  /**
   * The deceleration of the momentum scrolling. The higher the value the longer the momentum scrolling is applied.
   *
   * @example
   * ```typescript
   * {
   *    momentumDeceleration: 0.96
   * }
   * ```
   */
  momentumDeceleration?: number

  /**
   * Which directions can be scrolled.
   *
   * Possible values are `'none'`, `'horizontal'`, `'vertical'` or `'both'` (default).
   *
   * @example
   * Restrict scrolling to the Y axis on a mobile viewport.
   * ```typescript
   * {
   *    direction: window.innerWidth < 768 ? 'vertical' : 'both'
   * }
   * ```
   */
  direction?: Direction

  /*
   * How much damping to apply when overscrolling. A value of `1` means there is no
   * damping applied and a value of `0` means it's not possible to overscroll.
   *
   * To see the effect of this option try to drag the artboard past its possible
   * boundaries. Once you "overscroll" the damping is applied.
   *
   * @example
   * ```typescript
   * {
   *    springDamping: 0.5,
   * }
   * ```
   */
  springDamping?: number

  /**
   * A method that should return an array of rectangles (relative to viewport)
   * that in some way overlap the root element.
   *
   * This information is used to center the artboard so that it (ideally)
   * remains as visible as possible.
   *
   * @example
   * ```typescript
   * function getBlockingRects() {
   *   const toolbar = document.getElementById('toolbar')
   *   const rect = toolbar.getBoundingClientRect()
   *   return [rect]
   * }
   * ```
   */
  getBlockingRects?: () => PossibleBlockingRect[]

  /**
   * How often the getBoundingClientRect() method should be called on the
   * root element.
   *
   * Some calculations require knowing the exact location of the root element
   * relative to the viewport. For this it will call getBoundingClientRect()
   * on the root element. However, doing this too much can have a negative
   * impact on performance, which is why this is only done sporadically.
   *
   * If you anticipate that the root element regularly changes its position
   * relative to the viewport, you may set a lower value. If the position
   * rarely or never changes, you may set a high value.
   *
   * Note the position is always updated when the ResizeObserver callback is
   * triggered for the root element.
   *
   * @example
   * Only refresh the root rect every minute.
   *
   * ```typescript
   * {
   *    rootClientRectMaxStale: 60 * 1000,
   * }
   * ```
   */
  rootClientRectMaxStale?: number
}

/**
 * Options for scrolling an area of the artboard into view.
 */
export type ArtboardScrollIntoViewOptions = AnimationOptions & {
  /**
   * Define whether the artboard should be scaled.
   *
   * - None: Keeps the current artboard scale.
   * - Full: Scales the artboard so that the target element fully covers the
   *   available space.
   * - Blocking: Scales the artboard so that the target element covers the
   *   non-blocking area.
   */
  scale?: 'none' | 'full' | 'blocking'

  /**
   * The scroll behaviour.
   *
   * - Smooth: Always animates the transition.
   * - Instant: Directly apply the transform and scale.
   * - Auto: Uses smooth, but switches to instant if an animation is currently
   *   running.
   */
  behavior?: 'smooth' | 'instant' | 'auto'

  /** Which axis to scroll. */
  axis?: 'x' | 'y' | 'both'
}

/**
 * The animation-relevant state of the artboard at the time the animation frame
 * was issued. These values might differ to the ones obtained using
 * artboard.getOffset(), etc.
 */
export type ArtboardLoopContext = {
  /**
   * The size of the root element.
   */
  rootSize: Size

  /**
   * The (unscaled) size of the artboard.
   *
   * When the artboard instance is initialised, the size of the artboard is null.
   * When using the dom plugin, the size is set automatically from the artboard DOM
   * element.
   *
   * When not using the dom plugin to render on a canvas, the size is available only
   * when calling `artboard.setArtboardSize()`.
   */
  artboardSize: Size | null

  /**
   * The current scale.
   *
   * During a pinch gesture the scale value can go below minScale or above maxScale.
   */
  scale: number

  /**
   * The current artboard offset.
   *
   * During overscrolling the offset values can go outside the defined boundaries.
   */
  offset: Coord

  /**
   * The min/max boundaries for the artboard offset.
   */
  boundaries: Boundaries

  /**
   * The current timestamp for this animation iteration.
   *
   * When using the raf() plugin, this is the timestamp provided by the browser to the requestAnimationFrame callback.
   * When manually calling `artboard.loop()` this will be the same value you pass as the argument to the loop method.
   */
  currentTime: number
}

/**
 * The current interaction of the artboard.
 *
 * `'dragging'` - The artboard is being dragged using a mouse or finger.
 * `'scaling'` - The artboard is being scaled using a mouse or finger.
 * `'momentum'` - Momentum scrolling is being applied after a dragging interaction.
 * `'momentumScaling'` - Momentum scaling is being applied after a scaling interaction.
 * `'none'` - THe artboard is not being interacted with.
 */
export type Interaction =
  | 'dragging'
  | 'scaling'
  | 'momentum'
  | 'momentumScaling'
  | 'none'

export type PossibleDragEventPosition = Array<Touch | MouseEvent> | TouchList

/**
 * The artboard instance.
 */
export type Artboard = {
  /**
   * Add a plugin.
   *
   * Use this method if you conditionally need to add or remove plugins.
   *
   * @example
   * ```typescript
   * import { createArtboard, mouse } from 'artboard-deluxe'
   *
   * const artboard = createArtboard(document.body)
   * const mousePlugin = mouse()
   * artboard.addPlugin(mousePlugin)
   * ```
   *
   * @param plugin - The plugin to add.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addPlugin<T extends ArtboardPluginDefinition<any, any>>(
    plugin: T,
  ): T extends ArtboardPluginDefinition<infer O, infer R>
    ? ArtboardPluginInstance<O, R>
    : never

  /**
   * Removes a previously added plugin.
   *
   * @example
   * ```typescript
   * import { createArtboard, clickZoom } from 'artboard-deluxe'
   *
   * const artboard = createArtboard(document.body)
   * const plugin = clickZoom()
   * artboard.addPlugin(plugin)
   *
   * function disableClickZoom() {
   *   artboard.removePlugin(plugin)
   * }
   * ```
   *
   * @param plugin - The plugin to remove. Must be the same instance that has been added using addPlugin.
   */
  removePlugin(plugin: ArtboardPluginInstance): void

  /**
   * Get the current applied scale of the artboard.
   *
   * @returns The current applied scale of the artboard.
   */
  getScale(): number

  /**
   * If there is an animation running, it returns the target scale of the animation.
   * Else the current applied scale is returned.
   *
   * @returns The finale scale of the artboard.
   */
  getFinalScale(): number

  /**
   * Get the current applied offset of the artboard.
   *
   * @returns The offset.
   */
  getOffset(): Coord

  /**
   * Get the final offset. If there is currently an animation, the method will return the target offset of the animation.
   *
   * @returns The offset.
   */
  getFinalOffset(): Coord

  /**
   * Update all options.
   *
   * Note that this will reset option properties back to defaults if they are
   * missing from the provided options.
   *
   * @example
   * ```typescript
   * import { createArtboard, type ArtboardOptions } from 'artboard-deluxe'
   *
   * function getOptions(): ArtboardOptions {
   *   const isMobile = window.innerWidth < 768
   *   const minScale = isMobile ? 1 : 0.1
   *   const maxScale = isMobile ? 5 : 10
   *   return {
   *     minScale,
   *     maxScale
   *   }
   * }
   *
   * const artboard = createArtboard(document.body, [], getOptions())
   *
   * function updateOptions() {
   *   artboard.setOptions(getOptions())
   * }
   * ```
   *
   * @param options - The full options to update.
   */
  setOptions(options: ArtboardOptions): void

  /**
   * Update a single option.
   *
   * @example
   * Update the minScale option when the viewport changes.
   *
   * ```typescript
   * import { createArtboard } from 'artboard-deluxe'
   *
   * function getMinScale() {
   *   const isMobile = window.innerWidth < 768
   *   return isMobile ? 1 : 0.1
   * }
   *
   * const artboard = createArtboard(document.body, [], {
   *   minScale: getMinScale(),
   * })
   *
   * function onViewportChange() {
   *   artboard.setOption('minScale', getMinScale())
   * }
   * ```
   *
   * @param key - The name of the option to set.
   * @param value - The value of the option to set.
   */
  setOption<T extends keyof ArtboardOptions>(
    key: T,
    value: ArtboardOptions[T],
  ): void

  /**
   * Destroys the artboard instance, removes all event listeners, plugins and observers.
   */
  destroy(): void

  /**
   * Starts an animation if the current offset and scale of the artboard is
   * outside the possible boundaries.
   */
  animateToBoundary(): void

  /**
   * The main animation handler.
   *
   * This method should be called from within a requestAnimationFrame callback.
   * The method updates the internal state, applies momentum scrolling and
   * animations.
   *
   * The method returns a snapshot of the state at the time of the animation
   * frame. For the best experience you should use these values as the
   * "source of truth", for example when using a canvas for rendering.
   *
   * @example
   * ```typescript
   * import { createArtboard, dom } from 'artboard-deluxe'
   *
   * const artboard = createArtboard(
   *   document.body,
   *   [
   *     dom(document.getElementById('artboard')))
   *   ]
   * )
   *
   * function loop(timestamp: number) {
   *   artboard.loop(timestamp)
   *   window.requestAnimationFrame(loop)
   * }
   *
   * loop()
   * ```
   *
   * @param currentTime - The current time.
   *
   * @returns The loop context that contains a snapshot of the state that is applied.
   */
  loop(currentTime: number): ArtboardLoopContext

  /**
   * Returns the x offset that perfectly centers the artboard within the
   * possible bounds.
   *
   * If the getBlockingRects option is provided, the method will also take
   * blocking rects into account, if possible.
   *
   * @param targetScale - The target scale for which to calculate the offset.
   *
   * @returns The x offset.
   */
  getCenterX(targetScale?: number): number

  /**
   * Animate to the given state.
   *
   * If an animation is currently running, it will be overriden.
   * If momentum scrolling is currently applied, it will be stopped.
   *
   * @param key - The name of the animation.
   * @param x - The target x offset.
   * @param y - The target y offset.
   * @param targetScale - The target scale.
   * @param options - The animation options.
   */
  animateTo(
    key: string,
    x: number,
    y: number,
    targetScale?: number,
    options?: AnimationOptions | null,
  ): void

  /**
   * Returns the size of the artboard.
   *
   * When using "infinite mode" (without any artboard size) this value will be null.
   *
   * @returns The artboard size.
   */
  getArtboardSize(): Size | null

  /**
   * Returns the size of the root element.
   *
   * @returns The size of the root element.
   */
  getRootSize(): Size

  /**
   * Animate or jump by the given offset.
   *
   * If there is an animation running currently and it's last animation frame timestamp is less than 300ms ago, the animation will be stopped and the offset applied immediately.
   *
   * @param providedX - How much pixels on the X axis to jump.
   * @param providedY - How much pixels on the y axis to jump.
   * @param options - The animation options.
   */
  animateOrJumpBy(
    providedX?: number | null,
    providedY?: number | null,
    options?: AnimationOptions,
  ): void

  /**
   * Animate or scroll to the given offset.
   *
   * If there is an animation running currently and it's last animation frame timestamp is less than 300ms ago, the animation will be stopped and the offset applied immediately.
   *
   * @param providedX - The new offset on the x axis.
   * @param providedY - The new offset on the y axis.
   * @param options - The animation options.
   */
  animateOrJumpTo(
    providedX?: number | null,
    providedY?: number | null,
    options?: AnimationOptions,
  ): void

  /**
   * Scroll one page up.
   *
   * @param options - The animation options.
   */
  scrollPageUp(options?: AnimationOptions): void

  /**
   * Scroll up by one page.
   *
   * @param options - The animation options.
   */
  scrollPageUp(options?: AnimationOptions): void

  /**
   * Scroll down by one page.
   *
   * @param options - The animation options.
   */
  scrollPageDown(options?: AnimationOptions): void

  /**
   * Scroll left by one page.
   *
   * @param options - The animation options.
   */
  scrollPageLeft(options?: AnimationOptions): void

  /**
   * Scroll right by one page.
   *
   * @param options - The animation options.
   */
  scrollPageRight(options?: AnimationOptions): void

  /**
   * Scroll up one step.
   *
   * @param options - The animation options.
   */
  scrollUp(amount?: number, options?: AnimationOptions): void

  /**
   * Scroll down one step.
   *
   * @param options - The animation options.
   */
  scrollDown(amount?: number, options?: AnimationOptions): void

  /**
   * Scroll left one step.
   *
   * @param options - The animation options.
   */
  scrollLeft(amount?: number, options?: AnimationOptions): void

  /**
   * Scroll right one step.
   *
   * @param options - The animation options.
   */
  scrollRight(amount?: number, options?: AnimationOptions): void

  /**
   * Scroll to the top of the artboard.
   *
   * @param options - The animation options.
   */
  scrollToTop(options?: AnimationOptions): void

  /**
   * Scroll to the end of the artboard.
   *
   * @param options - The animation options.
   */
  scrollToEnd(options?: AnimationOptions): void

  /**
   * Scale the artboard so it fits within the height of the root element.
   *
   * @param options - Animation options.
   */
  scaleToFit(options?: AnimationOptions): void

  /**
   * Reset zoom and center artboard on the x axis.
   *
   * @param options - The animation options.
   */
  resetZoom(options?: AnimationOptions): void

  /**
   * Set the scale of the artboard.
   *
   * @param newScale - The new scale to set.
   * @param immediate - If true, the scale is applied immediately.
   */
  setScale(newScale: number, immediate?: boolean): void

  /**
   * Zoom in the artboard by the given amount.
   *
   * @param delta - The amount to zoom in.
   */
  zoomIn(delta?: number): void

  /**
   * Zoom out the artboard by the given amount.
   *
   * @param delta - The amount to zoom out.
   */
  zoomOut(delta?: number): void

  /**
   * Set the offset.
   *
   * @param providedX - The new x offset.
   * @param providedY - The new y offset.
   * @param immediate - If set the offset is applied immediately.
   */
  setOffset(
    providedX?: number | null,
    providedY?: number | null,
    immediate?: boolean,
  ): void

  /**
   * Cancels the current animation.
   */
  cancelAnimation(): void

  /**
   * Scale the artboard around the given point.
   *
   * @param pageX - The x coordinate relative to the page.
   * @param pageY - The y coordinate relative to the page.
   * @param targetScale - The target scale.
   * @param animation - If provided, the scale is animated.
   */
  scaleAroundPoint(
    pageX: number,
    pageY: number,
    targetScale: number,
    animation?: AnimationOptions | boolean,
  ): void

  /**
   * Scales around the given point and returns what the offset should be so that the point remains centered.
   *
   * @param pageX - The x coordinate relative to the page.
   * @param pageY - The y coordinate relative to the page.
   * @param targetScale - The target scale.
   */
  calculateScaleAroundPoint(
    pageX: number,
    pageY: number,
    targetScale: number,
    providedOffset?: Coord,
    providedScale?: number,
  ): Coord & { scale: number }

  /**
   * Scrolls the given rectangle into view.
   *
   * The rectangle's coordinates and sizes should be relative to the artboard,
   * _not_ the result of getBoundingClientRect(). For example, if the artboard
   * is 1000x1000 big and it contains a 500x500 rectangle that is centered
   * horizontally with a 50px margin on top, the value for targetRect would be:
   * { x: 250 // Because (1000 - 500) / 2 = 250, y: 50, width: 500, height: 500,
   * }
   *
   * @param targetRect - The rectangle to scroll into view. The coordinates and size of the rectangle should be uncaled and relative to the artboard.
   * @param options - Options for the scroll behaviour and animation.
   */
  scrollIntoView(
    targetRect: Rectangle,
    options?: ArtboardScrollIntoViewOptions,
  ): void

  /**
   * Set the artboard size.
   *
   * When using the dom plugin, the artboard size is already set and updated automatically.
   * Without the plugin (e.g. when using a canvas) it's expected to set the size manually.
   */
  setArtboardSize(width: number, height: number): void

  /**
   * Observe the size of the given element.
   *
   * @param element - The element to observe.
   */
  observeSize(element: HTMLElement): void

  /**
   * Stop observing the size of the given element.
   *
   * @param element - The element to stop observing the size.
   */
  unobserveSize(element: HTMLElement): void

  /**
   * Returns the root element.
   *
   * @returns The root element.
   */
  getRootElement(): HTMLElement

  /**
   * Returns the current artboard interaction.
   *
   * @returns The current interaction.
   */
  getInteraction(): Interaction

  /**
   * Set the current interaction.
   *
   * @param interaction - The new interaction.
   */
  setInteraction(interaction?: Interaction): void

  /**
   * Get the current velocity.
   *
   * @returns The velocity.
   */
  getMomentum(): Coord | null

  /**
   * Update the current velocity.
   *
   * If an argument is null, the current velocity value for that axis is kept.
   *
   * @param x - The velocity on the x axis.
   * @param y - The velocity on the y axis.
   */
  setMomentum(x: number, y: number, deceleration?: number): void

  /**
   * Stop momentum.
   */
  setMomentum(): void

  /**
   * Get the current touch direction.
   *
   * @returns The touch direction.
   */
  getTouchDirection(): Direction

  /**
   * Set the current touch direction.
   *
   * @param direction - The new touch direction. Defaults to 'none'.
   */
  setTouchDirection(direction?: Direction): void

  /**
   * The artboard options.
   */
  options: Options

  /**
   * Apply the given momentum.
   *
   * @param velocity - The momentum to apply. If undefined, the velocity is reset and no momentum scrolling is applied.
   */
  startMomentum(velocity?: Coord): void

  /**
   * Updates the offset based on the current touchDirection.
   *
   * For example, if the current touchDirection is 'vertical', then only the Y offset is updated.
   *
   * @param x - The new x offset.
   * @param y - The new y offset.
   */
  setDirectionOffset(x: number, y: number): void

  /**
   * Scrolls the given element into view.
   *
   * Only elements that are either a direct child of the root element or elements that are anchored to the artboard's location can be scrolled into view.
   *
   * @param targetEl - The element to scroll into view.
   * @param options - Options for the scroll behaviour.
   */
  scrollElementIntoView(
    targetEl: HTMLElement,
    options?: ArtboardScrollIntoViewOptions,
  ): void

  /**
   * Get the current boundaries.
   *
   * @param providedTargetScale - Calculate the boundaries if the given scale were applied.
   * @returns The boundaries.
   */
  getBoundaries(providedTargetScale?: number): Boundaries

  /**
   * Get the current target scale.
   *
   * Returns null when there is no target scale.
   *
   * @returns The target scale.
   */
  getScaleTarget(): ScaleTarget | null

  /**
   * Set the scale target.
   *
   * @param x - The target x offset.
   * @param y - The target y offset.
   * @param scale - The target scale.
   */
  setScaleTarget(x: number, y: number, scale: number): void

  /**
   * Get the currently running animation.
   *
   * @returns The animation if it exists.
   */
  getAnimation(): ArtboardAnimation | null

  /**
   * Determine whether the interaction before the current was momentum scrolling.
   *
   * This is used by plugins such as the `mouse()` plugin to prevent clicking on an element of the artboard if the user was previously momentum scrolling and clicking to stop the animation.
   *
   * @returns True if the previous interaction was momentum scrolling.
   */
  wasMomentumScrolling(): boolean
}

/**
 * The target of the scale interaction.
 */
export type ScaleTarget = Coord & { scale: number }

/**
 * The current momentum.
 */
export type Momentum = Coord & { deceleration: number }

export type ArtboardState = {
  /**
   * The current arboard offset/translation.
   */
  offset: Coord

  /**
   * The current scale of the artboard.
   */
  scale: number

  /**
   * The target state for the current animation.
   */
  animation: ArtboardAnimation | null

  /**
   * The calculated velocity of a drag gesture.
   */
  momentum: Momentum | null

  /**
   * The timestamp when momentum was stopped.
   */
  momentumStopTimestamp: number

  /**
   * The native size of the artboard (without any scaling).
   */
  artboardSize: Size | null

  /**
   * The current interaction.
   */
  interaction: Interaction

  /**
   * The detected touch direction.
   */
  touchDirection: Direction

  /**
   * The timestamp of the last call to animateTo().
   */
  lastAnimateToTimestamp: number

  /**
   * The timestamp of the last animation loop.
   */
  lastLoopTimestamp: number

  /**
   * The position of the root element relative to the viewport.
   */
  rootRect: DOMRect

  /**
   * The native size of the root element.
   */
  rootSize: Size

  /**
   * The current scaling velocity.
   */
  scaleVelocity: ScaleTarget | null
}
