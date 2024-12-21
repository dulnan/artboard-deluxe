[artboard-deluxe](../globals.md) / Artboard

# Artboard

> **Artboard**: `object`

The artboard instance.

## Type declaration

### options

> **options**: `Options`

The artboard options.

### addPlugin()

Add a plugin.

Use this method if you conditionally need to add or remove plugins.

#### Parameters

##### plugin

[`ArtboardPluginDefinition`](ArtboardPluginDefinition.md)\<`any`\>

The plugin to add.

#### Returns

`object`

##### destroy()?

> `optional` **destroy**: () => `void`

Remove event listeners and clean up.

###### Returns

`void`

##### loop()?

> `optional` **loop**: (`ctx`) => `void`

Called in the main animation loop.

Receives the state of the artboard at the time of the animation loop as an argument.

###### Parameters

###### ctx

[`ArtboardLoopContext`](ArtboardLoopContext.md)

###### Returns

`void`

##### onSizeChange()?

> `optional` **onSizeChange**: (`entry`) => `void`

Called when the size of an element previously observed using `artboard.observeSize()` changes.

###### Parameters

###### entry

`ResizeObserverEntry`

###### Returns

`void`

#### Example

```typescript
import { createArtboard, mouse } from 'artboard-deluxe'

const artboard = createArtboard(document.body)
const mousePlugin = mouse()
artboard.addPlugin(mousePlugin)
```

### animateOrJumpBy()

Animate or jump by the given offset.

If there is an animation running currently and it's last animation frame timestamp is less than 300ms ago, the animation will be stopped and the offset applied immediately.

#### Parameters

##### providedX?

How much pixels on the X axis to jump.

`null` | `number`

##### providedY?

How much pixels on the y axis to jump.

`null` | `number`

##### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

#### Returns

`void`

### animateOrJumpTo()

Animate or scroll to the given offset.

If there is an animation running currently and it's last animation frame timestamp is less than 300ms ago, the animation will be stopped and the offset applied immediately.

#### Parameters

##### providedX?

The new offset on the x axis.

`null` | `number`

##### providedY?

The new offset on the y axis.

`null` | `number`

##### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

#### Returns

`void`

### animateTo()

Animate to the given state.

If an animation is currently running, it will be overriden.
If momentum scrolling is currently applied, it will be stopped.

#### Parameters

##### key

`string`

The name of the animation.

##### x

`number`

The target x offset.

##### y

`number`

The target y offset.

##### targetScale?

`number`

The target scale.

##### options?

The animation options.

`null` | [`AnimationOptions`](AnimationOptions.md)

#### Returns

`void`

### animateToBoundary()

Starts an animation if the current offset and scale of the artboard is
outside the possible boundaries.

#### Returns

`void`

### calculateScaleAroundPoint()

Scales around the given point and returns what the offset should be so that the point remains centered.

#### Parameters

##### pageX

`number`

The x coordinate relative to the page.

##### pageY

`number`

The y coordinate relative to the page.

##### targetScale

`number`

The target scale.

##### providedOffset?

[`Coord`](Coord.md)

##### providedScale?

`number`

#### Returns

[`Coord`](Coord.md) & `object`

### cancelAnimation()

Cancels the current animation.

#### Returns

`void`

### destroy()

Destroys the artboard instance, removes all event listeners, plugins and observers.

#### Returns

`void`

### getAnimation()

Get the currently running animation.

#### Returns

`null` \| `ArtboardAnimation`

The animation if it exists.

### getArtboardSize()

Returns the size of the artboard.

When using "infinite mode" (without any artboard size) this value will be null.

#### Returns

`null` \| [`Size`](Size.md)

The artboard size.

### getBoundaries()

Get the current boundaries.

#### Parameters

##### providedTargetScale?

`number`

Calculate the boundaries if the given scale were applied.

#### Returns

[`Boundaries`](Boundaries.md)

The boundaries.

### getCenterX()

Returns the x offset that perfectly centers the artboard within the
possible bounds.

If the getBlockingRects option is provided, the method will also take
blocking rects into account, if possible.

#### Parameters

##### targetScale?

`number`

The target scale for which to calculate the offset.

#### Returns

`number`

The x offset.

### getFinalOffset()

Get the final offset. If there is currently an animation, the method will return the target offset of the animation.

#### Returns

[`Coord`](Coord.md)

The offset.

### getFinalScale()

If there is an animation running, it returns the target scale of the animation.
Else the current applied scale is returned.

#### Returns

`number`

The finale scale of the artboard.

### getInteraction()

Returns the current artboard interaction.

#### Returns

[`Interaction`](Interaction.md)

The current interaction.

### getMomentum()

Get the current velocity.

#### Returns

`null` \| [`Coord`](Coord.md)

The velocity.

### getOffset()

Get the current applied offset of the artboard.

#### Returns

[`Coord`](Coord.md)

The offset.

### getRootElement()

Returns the root element.

#### Returns

`HTMLElement`

The root element.

### getRootSize()

Returns the size of the root element.

#### Returns

[`Size`](Size.md)

The size of the root element.

### getScale()

Get the current applied scale of the artboard.

#### Returns

`number`

The current applied scale of the artboard.

### getScaleTarget()

Get the current target scale.

Returns null when there is no target scale.

#### Returns

`null` \| [`ScaleTarget`](ScaleTarget.md)

The target scale.

### getTouchDirection()

Get the current touch direction.

#### Returns

[`Direction`](Direction.md)

The touch direction.

### loop()

The main animation handler.

This method should be called from within a requestAnimationFrame callback.
The method updates the internal state, applies momentum scrolling and
animations.

The method returns a snapshot of the state at the time of the animation
frame. For the best experience you should use these values as the
"source of truth", for example when using a canvas for rendering.

#### Parameters

##### currentTime

`number`

The current time.

#### Returns

[`ArtboardLoopContext`](ArtboardLoopContext.md)

The loop context that contains a snapshot of the state that is applied.

#### Example

```typescript
import { createArtboard, dom } from 'artboard-deluxe'

const artboard = createArtboard(
  document.body,
  [
    dom(document.getElementById('artboard')))
  ]
)

function loop(timestamp: number) {
  artboard.loop(timestamp)
  window.requestAnimationFrame(loop)
}

loop()
```

### observeSize()

Observe the size of the given element.

#### Parameters

##### element

`HTMLElement`

The element to observe.

#### Returns

`void`

### removePlugin()

Removes a previously added plugin.

#### Parameters

##### plugin

The plugin to remove. Must be the same instance that has been added using addPlugin.

###### destroy

() => `void`

Remove event listeners and clean up.

###### loop

(`ctx`) => `void`

Called in the main animation loop.

Receives the state of the artboard at the time of the animation loop as an argument.

###### onSizeChange

(`entry`) => `void`

Called when the size of an element previously observed using `artboard.observeSize()` changes.

#### Returns

`void`

#### Example

```typescript
import { createArtboard, clickZoom } from 'artboard-deluxe'

const artboard = createArtboard(document.body)
const plugin = clickZoom()
artboard.addPlugin(plugin)

function disableClickZoom() {
  artboard.removePlugin(plugin)
}
```

### resetZoom()

Reset zoom and center artboard on the x axis.

#### Parameters

##### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

#### Returns

`void`

### scaleAroundPoint()

Scale the artboard around the given point.

#### Parameters

##### pageX

`number`

The x coordinate relative to the page.

##### pageY

`number`

The y coordinate relative to the page.

##### targetScale

`number`

The target scale.

##### animation?

If provided, the scale is animated.

`boolean` | [`AnimationOptions`](AnimationOptions.md)

#### Returns

`void`

### scaleToFit()

Scale the artboard so it fits within the height of the root element.

#### Parameters

##### options?

[`AnimationOptions`](AnimationOptions.md)

Animation options.

#### Returns

`void`

### scrollDown()

Scroll down one step.

#### Parameters

##### amount?

`number`

##### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

#### Returns

`void`

### scrollElementIntoView()

Scrolls the given element into view.

Only elements that are either a direct child of the root element or elements that are anchored to the artboard's location can be scrolled into view.

#### Parameters

##### targetEl

`HTMLElement`

The element to scroll into view.

##### options?

[`ArtboardScrollIntoViewOptions`](ArtboardScrollIntoViewOptions.md)

Options for the scroll behaviour.

#### Returns

`void`

### scrollIntoView()

Scrolls the given rectangle into view.

The rectangle's coordinates and sizes should be relative to the artboard,
_not_ the result of getBoundingClientRect(). For example, if the artboard
is 1000x1000 big and it contains a 500x500 rectangle that is centered
horizontally with a 50px margin on top, the value for targetRect would be:
{ x: 250 // Because (1000 - 500) / 2 = 250, y: 50, width: 500, height: 500,
}

#### Parameters

##### targetRect

[`Rectangle`](Rectangle.md)

The rectangle to scroll into view. The coordinates and size of the rectangle should be uncaled and relative to the artboard.

##### options?

[`ArtboardScrollIntoViewOptions`](ArtboardScrollIntoViewOptions.md)

Options for the scroll behaviour and animation.

#### Returns

`void`

### scrollLeft()

Scroll left one step.

#### Parameters

##### amount?

`number`

##### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

#### Returns

`void`

### scrollPageDown()

Scroll down by one page.

#### Parameters

##### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

#### Returns

`void`

### scrollPageLeft()

Scroll left by one page.

#### Parameters

##### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

#### Returns

`void`

### scrollPageRight()

Scroll right by one page.

#### Parameters

##### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

#### Returns

`void`

### scrollPageUp()

#### Call Signature

Scroll one page up.

##### Parameters

###### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

##### Returns

`void`

#### Call Signature

Scroll up by one page.

##### Parameters

###### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

##### Returns

`void`

### scrollRight()

Scroll right one step.

#### Parameters

##### amount?

`number`

##### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

#### Returns

`void`

### scrollToEnd()

Scroll to the end of the artboard.

#### Parameters

##### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

#### Returns

`void`

### scrollToTop()

Scroll to the top of the artboard.

#### Parameters

##### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

#### Returns

`void`

### scrollUp()

Scroll up one step.

#### Parameters

##### amount?

`number`

##### options?

[`AnimationOptions`](AnimationOptions.md)

The animation options.

#### Returns

`void`

### setArtboardSize()

Set the artboard size.

When using the dom plugin, the artboard size is already set and updated automatically.
Without the plugin (e.g. when using a canvas) it's expected to set the size manually.

#### Parameters

##### width

`number`

##### height

`number`

#### Returns

`void`

### setDirectionOffset()

Updates the offset based on the current touchDirection.

For example, if the current touchDirection is 'vertical', then only the Y offset is updated.

#### Parameters

##### x

`number`

The new x offset.

##### y

`number`

The new y offset.

#### Returns

`void`

### setInteraction()

Set the current interaction.

#### Parameters

##### interaction?

[`Interaction`](Interaction.md)

The new interaction.

#### Returns

`void`

### setMomentum()

#### Call Signature

Update the current velocity.

If an argument is null, the current velocity value for that axis is kept.

##### Parameters

###### x

`number`

The velocity on the x axis.

###### y

`number`

The velocity on the y axis.

###### deceleration?

`number`

##### Returns

`void`

#### Call Signature

Stop momentum.

##### Returns

`void`

### setOffset()

Set the offset.

#### Parameters

##### providedX?

The new x offset.

`null` | `number`

##### providedY?

The new y offset.

`null` | `number`

##### immediate?

`boolean`

If set the offset is applied immediately.

#### Returns

`void`

### setOption()

Update a single option.

#### Type Parameters

• **T** *extends* keyof [`ArtboardOptions`](ArtboardOptions.md)

#### Parameters

##### key

`T`

The name of the option to set.

##### value

[`ArtboardOptions`](ArtboardOptions.md)\[`T`\]

The value of the option to set.

#### Returns

`void`

#### Example

Update the minScale option when the viewport changes.

```typescript
import { createArtboard } from 'artboard-deluxe'

function getMinScale() {
  const isMobile = window.innerWidth < 768
  return isMobile ? 1 : 0.1
}

const artboard = createArtboard(document.body, [], {
  minScale: getMinScale(),
})

function onViewportChange() {
  artboard.setOption('minScale', getMinScale())
}
```

### setOptions()

Update all options.

Note that this will reset option properties back to defaults if they are
missing from the provided options.

#### Parameters

##### options

[`ArtboardOptions`](ArtboardOptions.md)

The full options to update.

#### Returns

`void`

#### Example

```typescript
import { createArtboard, type ArtboardOptions } from 'artboard-deluxe'

function getOptions(): ArtboardOptions {
  const isMobile = window.innerWidth < 768
  const minScale = isMobile ? 1 : 0.1
  const maxScale = isMobile ? 5 : 10
  return {
    minScale,
    maxScale
  }
}

const artboard = createArtboard(document.body, [], getOptions())

function updateOptions() {
  artboard.setOptions(getOptions())
}
```

### setScale()

Set the scale of the artboard.

#### Parameters

##### newScale

`number`

The new scale to set.

##### immediate?

`boolean`

If true, the scale is applied immediately.

#### Returns

`void`

### setScaleTarget()

Set the scale target.

#### Parameters

##### x

`number`

The target x offset.

##### y

`number`

The target y offset.

##### scale

`number`

The target scale.

#### Returns

`void`

### setTouchDirection()

Set the current touch direction.

#### Parameters

##### direction?

[`Direction`](Direction.md)

The new touch direction. Defaults to 'none'.

#### Returns

`void`

### startMomentum()

Apply the given momentum.

#### Parameters

##### velocity?

[`Coord`](Coord.md)

The momentum to apply. If undefined, the velocity is reset and no momentum scrolling is applied.

#### Returns

`void`

### unobserveSize()

Stop observing the size of the given element.

#### Parameters

##### element

`HTMLElement`

The element to stop observing the size.

#### Returns

`void`

### wasMomentumScrolling()

Determine whether the interaction before the current was momentum scrolling.

This is used by plugins such as the `mouse()` plugin to prevent clicking on an element of the artboard if the user was previously momentum scrolling and clicking to stop the animation.

#### Returns

`boolean`

True if the previous interaction was momentum scrolling.

### zoomIn()

Zoom in the artboard by the given amount.

#### Parameters

##### delta?

`number`

The amount to zoom in.

#### Returns

`void`

### zoomOut()

Zoom out the artboard by the given amount.

#### Parameters

##### delta?

`number`

The amount to zoom out.

#### Returns

`void`

## Defined in

types/index.ts:410
