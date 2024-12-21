[artboard-deluxe](../globals.md) / touch

# touch()

> **touch**(`options`?): [`ArtboardPluginDefinition`](../type-aliases/ArtboardPluginDefinition.md)\<\{ `overscaleAnimation`: `Required`\<[`AnimationOptions`](../type-aliases/AnimationOptions.md)\>; `scrollDirectionThreshold`: `number`; `useTwoTouchScrolling`: `boolean`; `velocity`: `Partial`\<`VelocityQueueOptions`\>; \}\>

## Parameters

### options?

#### overscaleAnimation

`Required`\<[`AnimationOptions`](../type-aliases/AnimationOptions.md)\>

The options for the animation that scales to the nearest valid scale value within the min and max scale when overscaling.

#### scrollDirectionThreshold

`number`

The threshold for detecting the scroll direction.

A value of 0 means the angle of the swipe gesture must be perfectly
diagonal (e.g. 45°, 135°, etc.) to start a "free moving" drag. A value of 1
means the artboard can be moved freely at all times.

The default value is 0.7 which feels natural for most cases. Choose a lower
value if your artboard's height is much larger than its width. That way it
mostly scrolls vertically. Choose a higher value if the artboard's width
and height is mostly equal and scrolling in all directions is more common.

#### useTwoTouchScrolling

`boolean`

Whether to require two touch points to interact with the artboard.

The default is false, which will scroll the artboard using a single touch
point. Set this to true to require two touch points, which will scale and
scroll the artboard at the same time. Useful if you have some sort of
drawing app where a single touch should not trigger scrolling.

#### velocity

`Partial`\<`VelocityQueueOptions`\>

Options for the velocity queue.

## Returns

[`ArtboardPluginDefinition`](../type-aliases/ArtboardPluginDefinition.md)\<\{ `overscaleAnimation`: `Required`\<[`AnimationOptions`](../type-aliases/AnimationOptions.md)\>; `scrollDirectionThreshold`: `number`; `useTwoTouchScrolling`: `boolean`; `velocity`: `Partial`\<`VelocityQueueOptions`\>; \}\>

## Defined in

plugins/touch/index.ts:13
