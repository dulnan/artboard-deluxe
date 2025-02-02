import {
  asValidNumber,
  calculateCenterPosition,
  clamp,
  dampenRelative,
  limitOffset,
} from './../helpers'
import { applyAnimation, type AnimationOptions } from './../helpers/animation'
import { applyMomentum, applyScaleMomentum } from './../helpers/momentum'
import { createOptions } from './options'
import type {
  Artboard,
  ArtboardLoopContext,
  ArtboardOptions,
  ArtboardPluginInstance,
  ArtboardPluginDefinition,
  ArtboardScrollIntoViewOptions,
  ArtboardState,
  Interaction,
  Momentum,
  Direction,
} from './../types'
import type { Boundaries, Coord, Rectangle, Size } from '../types/geometry'

/**
 * Create a new artboard instance.
 */
export function createArtboard(
  /**
   * The root element.
   *
   * Must be an element that creates a new stacking context (e.g. `position: relative`) when using the dom() plugin.
   * When using canvas rendering, this should be the canvas.
   */
  providedRootEl: HTMLElement | HTMLCanvasElement,

  /**
   * The plugins to initialise the artboard with.
   *
   * Plugins can also be added afterwards using the `artboard.addPlugin()` method.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initPlugins: ArtboardPluginDefinition<any, any>[] = [],

  /**
   * The init options.
   *
   * To update options after the artboard is initialised, use the `artboard.setOption()` and `artboard.setOptions()` methods.
   */
  initOptions: ArtboardOptions = {},
): Artboard {
  /**
   * The options manager.
   */
  const options = createOptions(initOptions)

  /**
   * The artboard state.
   */
  const state: ArtboardState = {
    animation: null,
    artboardSize: null,
    interaction: 'none',
    lastAnimateToTimestamp: 0,
    lastLoopTimestamp: 0,
    offset: {
      x: asValidNumber(initOptions?.initTransform?.x, 0),
      y: asValidNumber(initOptions?.initTransform?.y, 0),
    },
    rootRect: providedRootEl.getBoundingClientRect(),
    rootSize: {
      width: providedRootEl.offsetWidth,
      height: providedRootEl.offsetHeight,
    },
    scale: asValidNumber(initOptions?.initTransform?.scale, 1),
    touchDirection: 'none',
    momentum: null,
    momentumStopTimestamp: 0,
    scaleVelocity: null,
  }

  /**
   * The parent/root element that defines the area in which the artboard can be
   * interacted with.
   */
  const rootEl = providedRootEl

  /** Plugins. */
  let plugins: ArtboardPluginInstance[] = []

  let resizeTimeout: number | null = null
  let init = true
  let lastRootRectUpdate = 0

  function handleResize(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
      if (entry.target === rootEl) {
        if (entry.target instanceof HTMLElement) {
          updateRootRect(true)
        }
        const size = entry.contentBoxSize[0]
        if (!size) {
          return
        }

        state.rootSize.width = size.inlineSize
        state.rootSize.height = size.blockSize
      } else {
        // Let plugins handle size changes.
        for (const plugin of plugins) {
          if (plugin.onSizeChange) {
            plugin.onSizeChange(entry)
          }
        }
      }
    }
  }

  /** The ResizeObserver instance. */
  const resizeObserver = new ResizeObserver(function (entries) {
    // Run the observer initially.
    if (init) {
      init = false
      handleResize(entries)
      return
    }

    if (resizeTimeout) {
      window.clearTimeout(resizeTimeout)
    }

    // Debounce the callback.
    resizeTimeout = window.setTimeout(function () {
      handleResize(entries)
    }, 300)
  })

  function setOptions(newOptions: ArtboardOptions) {
    options.setAllOptions(newOptions)
  }

  function setOption<T extends keyof ArtboardOptions>(
    key: T,
    value: ArtboardOptions[T],
  ) {
    options.set(key, value)
  }

  function getScale(): number {
    return state.scale
  }

  function getFinalScale(): number {
    if (state.animation) {
      return state.animation.scale
    } else if (state.scaleVelocity) {
      return state.scaleVelocity.scale
    }
    return state.scale
  }

  function getOffset(): Coord {
    return { ...state.offset }
  }

  function getFinalOffset(): Coord {
    if (state.animation) {
      return {
        x: state.animation.x,
        y: state.animation.y,
      }
    }
    return { ...state.offset }
  }

  function destroy() {
    // Call destroy method on all mounted plugins.
    plugins.forEach((plugin) => {
      if (plugin.destroy) {
        plugin.destroy()
      }
    })

    // Remove resize observer.
    resizeObserver.disconnect()
  }

  function animateToBoundary() {
    const boundaries = getBoundaries()
    const targetX = clamp(state.offset.x, boundaries.xMin, boundaries.xMax)
    const targetY = clamp(state.offset.y, boundaries.yMin, boundaries.yMax)

    if (
      Math.abs(targetX - state.offset.x) > 0.1 ||
      Math.abs(targetY - state.offset.y) > 0.1
    ) {
      setMomentum(state.offset.x - targetX, state.offset.y - targetY)
      setInteraction('momentum')
    }
  }

  function stopMomentum() {
    animateToBoundary()
    setInteraction()
    setTouchDirection()
    state.momentumStopTimestamp = performance.now()
    state.momentum = null
    state.scaleVelocity = null
    state.animation = null
  }

  function loop(currentTime: number): ArtboardLoopContext {
    if (!state.lastLoopTimestamp) {
      state.lastLoopTimestamp = currentTime
    }

    const boundaries = getBoundaries()

    if (state.interaction === 'momentum') {
      const shouldStop = applyMomentum(state, currentTime, boundaries)
      if (shouldStop) {
        stopMomentum()
      }
    } else if (state.interaction === 'momentumScaling') {
      const shouldStop = applyScaleMomentum(
        state,
        currentTime,
        options.minScale,
        options.maxScale,
      )
      if (shouldStop) {
        stopMomentum()
      }
    } else if (state.animation) {
      const isFinished = applyAnimation(state, currentTime, state.animation)
      if (isFinished) {
        state.animation = null
      }
    }

    const ctx: ArtboardLoopContext = {
      rootSize: {
        ...state.rootSize,
      },
      artboardSize: state.artboardSize
        ? {
            ...state.artboardSize,
          }
        : null,
      offset: {
        ...state.offset,
      },
      scale: state.scale,
      boundaries,
      currentTime,
    }

    for (let i = 0; i < plugins.length; i++) {
      if (plugins[i].loop) {
        plugins[i].loop!(ctx)
      }
    }

    state.lastLoopTimestamp = currentTime

    return ctx
  }

  /** Get the center position on the X axis. */
  function getCenterX(targetScale?: number): number {
    if (!state.artboardSize) {
      return state.offset.x
    }
    const scaleToUse = targetScale || state.scale
    const blockingRects = options.blockingRects
    return calculateCenterPosition(
      blockingRects,
      rootEl.getBoundingClientRect(),
      state.artboardSize.width * scaleToUse,
    ).centerX
  }

  /** Animate to a specific position. */
  function animateTo(
    key: string,
    targetX: number,
    targetY: number,
    targetScale?: number,
    animationOptions?: AnimationOptions | null,
  ) {
    setInteraction('none')
    const direction = options.direction
    const x =
      direction === 'both' || direction === 'horizontal'
        ? targetX
        : getCenterX(targetScale)
    const y = direction === 'both' || direction === 'vertical' ? targetY : 0
    state.animation = {
      key,
      x,
      y,
      scale: targetScale || state.scale,
      startX: state.offset.x,
      startY: state.offset.y,
      startScale: state.scale,
      easing: animationOptions?.easing || 'easeOutCubic',
      duration: animationOptions?.duration || 400,
      startTime: 0,
    }
    state.momentum = null
    state.scaleVelocity = null
  }

  /** Get the native size of the artboard. */
  function getArtboardSize(): Size | null {
    if (!state.artboardSize) {
      return null
    }
    return {
      width: state.artboardSize.width,
      height: state.artboardSize.height,
    }
  }

  /** Get the native size of the root element. */
  function getRootSize(): Size {
    return {
      width: state.rootSize.width,
      height: state.rootSize.height,
    }
  }

  function animateOrJumpBy(
    providedX?: number | null,
    providedY?: number | null,
    options?: AnimationOptions,
  ) {
    const x = typeof providedX === 'number' ? providedX : 0
    const y = typeof providedY === 'number' ? providedY : 0
    const diff = performance.now() - state.lastAnimateToTimestamp
    if (diff < 300) {
      setOffset(
        (state.animation?.x || state.offset.x) + x,
        (state.animation?.y || state.offset.y) + y,
        true,
      )
      state.animation = null
    } else {
      const limited = limitOffset(
        state.offset.x + x,
        state.offset.y + y,
        getBoundaries(),
      )
      animateTo('animateOrJumpBy', limited.x, limited.y, state.scale, options)
    }

    state.lastAnimateToTimestamp = performance.now()
  }

  /** Jump to the specified position on the Y axis. */
  function animateOrJumpTo(
    providedX?: number | null,
    providedY?: number | null,
    options?: AnimationOptions,
  ) {
    const x = typeof providedX === 'number' ? providedX : state.offset.x
    const y = typeof providedY === 'number' ? providedY : state.offset.y

    const diff = performance.now() - state.lastAnimateToTimestamp
    if (diff < 300) {
      setOffset(x, y, true)
      state.animation = null
    } else {
      animateTo('animateOrJumpTo', x, y, state.scale, options)
    }
    state.lastAnimateToTimestamp = performance.now()
  }

  /** Scroll up by one page. */
  function scrollPageUp(o?: AnimationOptions) {
    animateOrJumpBy(0, state.rootSize.height, o)
  }

  /** Scroll down by one page. */
  function scrollPageDown(o?: AnimationOptions) {
    animateOrJumpBy(0, -state.rootSize.height, o)
  }

  /** Scroll left by one page. */
  function scrollPageLeft(o?: AnimationOptions) {
    animateOrJumpBy(state.rootSize.width, null, o)
  }

  /** Scroll right by one page. */
  function scrollPageRight(o?: AnimationOptions) {
    animateOrJumpBy(-state.rootSize.width, null, o)
  }

  /** Scroll up one step. */
  function scrollUp(amount?: number, o?: AnimationOptions) {
    animateOrJumpBy(0, amount || options.scrollStepAmount, o)
  }

  /** Scroll down one step. */
  function scrollDown(amount?: number, o?: AnimationOptions) {
    animateOrJumpBy(0, amount || -options.scrollStepAmount, o)
  }

  /** Scroll left one step. */
  function scrollLeft(amount?: number, o?: AnimationOptions) {
    animateOrJumpBy(amount || options.scrollStepAmount, null, o)
  }

  /** Scroll right one step. */
  function scrollRight(amount?: number, o?: AnimationOptions) {
    animateOrJumpBy(amount || -options.scrollStepAmount, null, o)
  }

  /** Scroll to the top of the artboard. */
  function scrollToTop(o?: AnimationOptions) {
    animateOrJumpTo(null, options.margin, o)
  }

  /** Scroll to the end of the artboard. */
  function scrollToEnd(o?: AnimationOptions) {
    if (!state.artboardSize) {
      return
    }
    const v = state.artboardSize.height * state.scale
    const y = -v + state.rootSize.height - options.margin
    animateOrJumpTo(null, y, o)
  }

  function scaleToFit(scrollOptions?: ArtboardScrollIntoViewOptions) {
    if (!state.artboardSize) {
      return
    }

    scrollIntoView(
      {
        x: 0,
        y: 0,
        width: state.artboardSize.width,
        height: state.artboardSize.height,
      },
      {
        scale: 'blocking',
        ...(scrollOptions || {}),
      },
    )
  }

  function resetZoom(o?: AnimationOptions) {
    if (!state.artboardSize) {
      // @TODO: Calculate center and reset scale to 1.
      return
    }

    const animationOptions: AnimationOptions = {
      duration: o?.duration || 300,
      easing: o?.easing,
    }

    // Calculate the center of the viewport in the current scale.
    const viewportCenterY = state.rootSize.height / 2
    const currentCenterOnArtboard =
      (-state.offset.y + viewportCenterY) / state.scale

    // If the height of the artboard is smaller than the visible viewport height
    // always set the position in such a way that it is perfectly centered in the
    // viewport.
    if (state.artboardSize.height < state.rootSize.height) {
      const newYOffset =
        state.rootSize.height / 2 - state.artboardSize.height / 2
      return animateTo(
        'resetZoom',
        getCenterX(1),
        newYOffset,
        1,
        animationOptions,
      )
    }

    // Calculate the new offset so that whatever is in the center of the
    // viewport remains the center after applying the scale.
    const newYOffset = Math.min(
      Math.max(
        -currentCenterOnArtboard + viewportCenterY,
        -state.artboardSize.height +
          state.rootSize.height -
          options.overscrollBounds.top,
      ),
      options.overscrollBounds.top + options.overscrollBounds.bottom,
    )
    animateTo('resetZoom', getCenterX(1), newYOffset, 1, animationOptions)
  }

  /**
   * Calculate the boundaries for the offset.
   *
   * @returns The possible boundaries for the offset.
   */
  function getBoundaries(providedTargetScale?: number): Boundaries {
    if (!state.artboardSize) {
      return {
        xMin: Number.NEGATIVE_INFINITY,
        xMax: Number.POSITIVE_INFINITY,
        yMin: Number.NEGATIVE_INFINITY,
        yMax: Number.POSITIVE_INFINITY,
      }
    }
    const targetScale = providedTargetScale || state.scale
    const artboardWidth = state.artboardSize.width * targetScale
    const artboardHeight = state.artboardSize.height * targetScale

    const bounds = options.overscrollBounds

    const paddingTop = Math.min(bounds.top, state.rootSize.height / 4)
    const paddingBottom = Math.min(bounds.bottom, state.rootSize.height / 4)
    const paddingLeft = Math.min(bounds.left, state.rootSize.width / 4)
    const paddingRight = Math.min(bounds.right, state.rootSize.width / 4)

    const xMin = -artboardWidth + paddingLeft
    const xMax = state.rootSize.width - paddingRight
    const yMin = -artboardHeight + paddingTop
    const yMax = state.rootSize.height - paddingBottom

    return { xMin, xMax, yMin, yMax }
  }

  /**
   * Constrains the scale to the possible range.
   *
   * @param scale - The scale to constrain.
   * @returns The scale within the possible scale range.
   */
  function constrainScale(scale: number): number {
    return clamp(scale, options.minScale, options.maxScale)
  }

  function setScale(newScale: number, immediate?: boolean) {
    if (immediate) {
      state.scale = constrainScale(newScale)
      return
    }
    state.scale = dampenRelative(
      newScale,
      options.minScale,
      options.maxScale,
      0.9,
    )
  }

  function zoomIn(delta = 10) {
    doZoom(state.rootSize.width / 2, state.rootSize.height / 2, delta)
  }

  function zoomOut(delta = -10) {
    doZoom(state.rootSize.width / 2, state.rootSize.height / 2, delta)
  }

  function setOffset(
    providedX?: number | null,
    providedY?: number | null,
    immediate?: boolean,
  ) {
    const direction = options.direction
    const setX = direction === 'both' || direction === 'horizontal'
    const setY = direction === 'both' || direction === 'vertical'
    const x = typeof providedX === 'number' && setX ? providedX : state.offset.x
    const y = typeof providedY === 'number' && setY ? providedY : state.offset.y
    const boundaries = getBoundaries()

    if (immediate) {
      const limited = limitOffset(x, y, boundaries)
      state.offset.x = limited.x
      state.offset.y = limited.y
      return
    }

    state.offset.x = dampenRelative(
      x,
      boundaries.xMin,
      boundaries.xMax,
      options.springDamping,
    )
    state.offset.y = dampenRelative(
      y,
      boundaries.yMin,
      boundaries.yMax,
      options.springDamping,
    )
  }

  /** Cancel the current animation. */
  function cancelAnimation() {
    state.animation = null
    state.momentum = null
  }

  function updateRootRect(force?: boolean) {
    const now = performance.now()
    if (force || now - lastRootRectUpdate > options.rootClientRectMaxStale) {
      state.rootRect = rootEl.getBoundingClientRect()
      lastRootRectUpdate = now
    }
  }

  function calculateScaleAroundPoint(
    pageX: number,
    pageY: number,
    targetScale: number,
    providedOffset?: Coord,
    providedScale?: number,
  ): Coord & { scale: number } {
    updateRootRect()
    const newScale = constrainScale(targetScale)
    const offset = providedOffset || getOffset()
    const scale = providedScale || getScale()
    const x = pageX - state.rootRect.x
    const y = pageY - state.rootRect.y
    const transformedX = (x - offset.x) / scale
    const transformedY = (y - offset.y) / scale

    const targetX = -transformedX * newScale + x
    const targetY = -transformedY * newScale + y

    const limited = limitOffset(targetX, targetY, getBoundaries(newScale))
    return {
      x: limited.x,
      y: limited.y,
      scale: newScale,
    }
  }

  function scaleAroundPoint(
    pageX: number,
    pageY: number,
    targetScale: number,
    animationOptions?: AnimationOptions | boolean,
  ) {
    updateRootRect()
    const newScale = constrainScale(targetScale)
    const x = pageX - state.rootRect.x
    const y = pageY - state.rootRect.y
    const transformedX = (x - state.offset.x) / state.scale
    const transformedY = (y - state.offset.y) / state.scale

    const targetX = -transformedX * newScale + x
    const targetY = -transformedY * newScale + y

    const limited = limitOffset(targetX, targetY, getBoundaries(newScale))

    if (animationOptions) {
      animateTo(
        'scaleAroundPoint',
        limited.x,
        limited.y,
        newScale,
        typeof animationOptions === 'object' ? animationOptions : null,
      )
      return
    }

    setScale(newScale, true)
    setOffset(limited.x, limited.y, true)
  }

  /**
   * @param x - The x coordinates relative to the page.
   * @param y - The y coordinates relative to the page.
   * @param delta - The amount to zoom.
   */
  function doZoom(x: number, y: number, delta: number) {
    const scaleFactor = Math.pow(1.5, Math.sign(delta) / 2)
    const newScale = state.scale * scaleFactor
    scaleAroundPoint(x, y, newScale)
  }

  function scrollIntoView(
    targetRect: Rectangle,
    animationOptions?: ArtboardScrollIntoViewOptions,
  ) {
    // The unscaled size of the target element relative to the artboard.
    const targetWidth = targetRect.width
    const targetHeight = targetRect.height

    // The unscaled position of the element relative to the artboard.
    const targetX = targetRect.x
    const targetY = targetRect.y

    const scaleOption = animationOptions?.scale || 'none'

    const targetScale = (() => {
      if (scaleOption === 'full') {
        // The required scales to fit the target element within the root element.
        const scaleX = (state.rootSize.width - options.margin * 2) / targetWidth
        const scaleY =
          (state.rootSize.height - options.margin * 2) / targetHeight

        // We use the smaller value so that we scale it in such a way that it always fits in the root rect.
        return Math.min(scaleX, scaleY, options.maxScale)
      } else if (scaleOption === 'blocking' && options.hasBlockingRects) {
        const { availableWidth } = calculateCenterPosition(
          options.blockingRects,
          rootEl.getBoundingClientRect(),
          targetWidth,
        )
        const targetScale = (availableWidth - options.margin * 2) / targetWidth
        const scaleY =
          (state.rootSize.height - options.margin * 2) / targetHeight
        return Math.min(targetScale, scaleY, options.maxScale)
      }

      return 1
    })()

    const behavior = animationOptions?.behavior || 'auto'
    const axis = animationOptions?.axis || 'both'
    const scrollX = axis === 'x' || axis === 'both'
    const scrollY = axis === 'y' || axis === 'both'

    const centeredOffsetX = (() => {
      if (scaleOption === 'blocking') {
        return getCenterX(targetScale)
      }
      return scrollX
        ? -(targetX * targetScale) +
            (state.rootSize.width - targetWidth * targetScale) / 2
        : state.offset.x
    })()

    const centeredOffsetY = scrollY
      ? -(targetY * targetScale) +
        (state.rootSize.height - targetHeight * targetScale) / 2
      : state.offset.y

    if (behavior === 'smooth' || (behavior === 'auto' && !state.animation)) {
      animateTo(
        'scrollIntoView',
        centeredOffsetX,
        centeredOffsetY,
        targetScale,
        {
          duration: animationOptions?.duration || 300,
          easing: animationOptions?.easing || 'easeInOutExpo',
        },
      )
      return
    }

    cancelAnimation()
    setOffset(centeredOffsetX, centeredOffsetY, true)
    setScale(targetScale, true)
  }

  function setArtboardSize(width: number, height: number) {
    if (!state.artboardSize) {
      state.artboardSize = {
        width: 0,
        height: 0,
      }
    }
    state.artboardSize.width = width
    state.artboardSize.height = height
  }

  function getRootElement(): HTMLElement {
    return rootEl
  }

  function getInteraction(): Interaction {
    return state.interaction
  }

  function setInteraction(v?: Interaction) {
    const targetInteraction: Interaction = v || 'none'

    // Return if the current interaction is the same.
    if (state.interaction === targetInteraction) {
      return
    }

    if (
      (state.interaction === 'momentum' ||
        state.interaction === 'momentumScaling') &&
      targetInteraction !== 'momentum' &&
      targetInteraction !== 'momentumScaling'
    ) {
      state.momentumStopTimestamp = performance.now()
    }

    state.interaction = targetInteraction
  }

  function getMomentum(): Momentum | null {
    if (state.momentum) {
      return {
        ...state.momentum,
      }
    }

    return null
  }

  function setMomentum(
    momentumX?: number,
    momentumY?: number,
    deceleration?: number,
  ): void {
    if (
      momentumX !== undefined &&
      momentumX !== null &&
      momentumY !== undefined
    ) {
      const direction = options.direction
      const x =
        direction === 'both' || direction === 'horizontal' ? momentumX : 0
      const y = direction === 'both' || direction === 'vertical' ? momentumY : 0
      state.momentum = {
        x,
        y,
        deceleration: deceleration || options.momentumDeceleration,
      }
    } else {
      state.momentum = null
    }
  }

  function getTouchDirection() {
    return state.touchDirection
  }

  function setTouchDirection(v?: Direction) {
    state.touchDirection = v || 'none'
  }

  function startMomentum(velocity?: Coord) {
    const totalVelocity = velocity
      ? Math.abs(velocity.x) + Math.abs(velocity.y)
      : null

    if (!velocity || !totalVelocity) {
      state.momentum = null
      setInteraction('none')
      animateToBoundary()
      return
    }

    const x =
      state.touchDirection === 'horizontal' || state.touchDirection === 'both'
        ? velocity.x
        : 0

    const y =
      state.touchDirection === 'vertical' || state.touchDirection === 'both'
        ? velocity.y
        : 0

    setMomentum(x, y)
    setInteraction('momentum')
  }

  function setDirectionOffset(x: number, y: number) {
    if (state.touchDirection === 'both' || state.touchDirection === 'none') {
      setOffset(x, y)
    } else if (state.touchDirection === 'vertical') {
      setOffset(state.offset.x, y)
    } else if (state.touchDirection === 'horizontal') {
      setOffset(x, state.offset.y)
    }
  }

  function setScaleTarget(newX: number, newY: number, scale: number) {
    const direction = options.direction
    const x =
      direction === 'both' || direction === 'horizontal' ? newX : getCenterX()
    const y = direction === 'both' || direction === 'vertical' ? newY : 0

    if (state.scaleVelocity) {
      state.scaleVelocity.scale = scale
      state.scaleVelocity.x = x
      state.scaleVelocity.y = y
    } else {
      state.scaleVelocity = {
        x,
        y,
        scale,
      }
    }
  }

  function getScaleTarget() {
    if (state.scaleVelocity) {
      return {
        ...state.scaleVelocity,
      }
    }
    return null
  }

  function scrollElementIntoView(
    targetEl: HTMLElement,
    options?: ArtboardScrollIntoViewOptions,
  ) {
    const targetBoundingRect = targetEl.getBoundingClientRect()

    // The unscaled size of the target element relative to the artboard.
    const targetWidth = targetEl.offsetWidth
    const targetHeight = targetEl.offsetHeight

    const scale = getScale()

    // The unscaled position of the element relative to the artboard.
    const targetX =
      (targetBoundingRect.x - state.offset.x - state.rootRect.x) / scale
    const targetY =
      (targetBoundingRect.y - state.offset.y - state.rootRect.y) / scale

    scrollIntoView(
      {
        width: targetWidth,
        height: targetHeight,
        x: targetX,
        y: targetY,
      },
      options,
    )
  }

  function observeSize(el: HTMLElement) {
    resizeObserver.observe(el)
  }

  function unobserveSize(el: HTMLElement) {
    resizeObserver.unobserve(el)
  }

  function getAnimation() {
    if (state.animation) {
      return { ...state.animation }
    }

    return null
  }

  function wasMomentumScrolling() {
    return performance.now() - state.momentumStopTimestamp < 200
  }

  const artboard: Artboard = {
    wasMomentumScrolling,
    addPlugin,
    animateOrJumpBy,
    animateOrJumpTo,
    animateTo,
    animateToBoundary,
    startMomentum,
    cancelAnimation,
    destroy,
    getArtboardSize,
    getCenterX,
    getFinalOffset,
    getFinalScale,
    getInteraction,
    getOffset,
    getRootElement,
    getRootSize,
    getScale,
    getTouchDirection,
    getMomentum,
    getAnimation,
    loop,
    observeSize,
    options,
    removePlugin,
    resetZoom,
    scaleAroundPoint,
    scaleToFit,
    scrollDown,
    scrollElementIntoView,
    scrollIntoView,
    scrollLeft,
    scrollPageDown,
    scrollPageLeft,
    scrollPageRight,
    scrollPageUp,
    scrollRight,
    scrollToEnd,
    scrollToTop,
    scrollUp,
    setArtboardSize,
    setDirectionOffset,
    setInteraction,
    setOffset,
    setOption,
    setOptions,
    setScale,
    setTouchDirection,
    setMomentum,
    unobserveSize,
    zoomIn,
    zoomOut,
    getBoundaries,
    setScaleTarget,
    calculateScaleAroundPoint,
    getScaleTarget,
  }

  function addPlugin<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends ArtboardPluginDefinition<any, any>,
    ReturnType = T extends ArtboardPluginDefinition<infer O, infer R>
      ? ArtboardPluginInstance<O, R>
      : never,
  >(plugin: T): ReturnType {
    const pluginInstance = plugin.init(artboard, plugin.options)
    plugins.push(pluginInstance)
    return pluginInstance as ReturnType
  }

  function removePlugin(plugin: ArtboardPluginInstance) {
    if (plugin.destroy) {
      plugin.destroy()
    }
    plugins = plugins.filter((v) => v !== plugin)
  }

  resizeObserver.observe(rootEl)

  if (initPlugins?.length) {
    initPlugins.forEach((plugin) => addPlugin(plugin))
  }

  return artboard
}
