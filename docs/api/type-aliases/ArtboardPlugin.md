[artboard-deluxe](../globals.md) / ArtboardPlugin

# ArtboardPlugin\<T\>

> **ArtboardPlugin**\<`T`\>: `object` & `T`

## Type declaration

### destroy()?

> `optional` **destroy**: () => `void`

Remove event listeners and clean up.

#### Returns

`void`

### loop()?

> `optional` **loop**: (`ctx`) => `void`

Called in the main animation loop.

Receives the state of the artboard at the time of the animation loop as an argument.

#### Parameters

##### ctx

[`ArtboardLoopContext`](ArtboardLoopContext.md)

#### Returns

`void`

### onSizeChange()?

> `optional` **onSizeChange**: (`entry`) => `void`

Called when the size of an element previously observed using `artboard.observeSize()` changes.

#### Parameters

##### entry

`ResizeObserverEntry`

#### Returns

`void`

## Type Parameters

• **T** = `unknown`

## Defined in

types/index.ts:20
