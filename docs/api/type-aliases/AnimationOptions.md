[artboard-deluxe](../globals.md) / AnimationOptions

# AnimationOptions

> **AnimationOptions**: `object`

## Type declaration

### duration?

> `optional` **duration**: `number`

The speed of the animation.

### easing?

> `optional` **easing**: `AnimationEasing`

The easing function to use when animating.

Can either be the name of one of the built in easing functions or a custom function.
If a custom function is provided, it will receive the current progress (a value from 0 to 1) as the only argument and should return the eased progress.

## Defined in

helpers/animation/index.ts:31
