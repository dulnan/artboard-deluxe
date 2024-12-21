[artboard-deluxe](../globals.md) / ArtboardLoopContext

# ArtboardLoopContext

> **ArtboardLoopContext**: `object`

The animation-relevant state of the artboard at the time the animation frame
was issued. These values might differ to the ones obtained using
artboard.getOffset(), etc.

## Type declaration

### artboardSize

> **artboardSize**: [`Size`](Size.md) \| `null`

The (unscaled) size of the artboard.

When the artboard instance is initialised, the size of the artboard is null.
When using the dom plugin, the size is set automatically from the artboard DOM
element.

When not using the dom plugin to render on a canvas, the size is available only
when calling `artboard.setArtboardSize()`.

### boundaries

> **boundaries**: [`Boundaries`](Boundaries.md)

The min/max boundaries for the artboard offset.

### currentTime

> **currentTime**: `number`

The current timestamp for this animation iteration.

When using the raf() plugin, this is the timestamp provided by the browser to the requestAnimationFrame callback.
When manually calling `artboard.loop()` this will be the same value you pass as the argument to the loop method.

### offset

> **offset**: [`Coord`](Coord.md)

The current artboard offset.

During overscrolling the offset values can go outside the defined boundaries.

### rootSize

> **rootSize**: [`Size`](Size.md)

The size of the root element.

### scale

> **scale**: `number`

The current scale.

During a pinch gesture the scale value can go below minScale or above maxScale.

## Defined in

types/index.ts:343
