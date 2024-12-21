[artboard-deluxe](../globals.md) / ArtboardOptions

# ArtboardOptions

> **ArtboardOptions**: `object`

Options for createArtboard().

## Type declaration

### direction?

> `optional` **direction**: [`Direction`](Direction.md)

Which directions can be scrolled.

Possible values are `'none'`, `'horizontal'`, `'vertical'` or `'both'` (default).

#### Example

Restrict scrolling to the Y axis on a mobile viewport.
```typescript
{
   direction: window.innerWidth < 768 ? 'vertical' : 'both'
}
```

### getBlockingRects()?

> `optional` **getBlockingRects**: () => [`PossibleBlockingRect`](PossibleBlockingRect.md)[]

A method that should return an array of rectangles (relative to viewport)
that in some way overlap the root element.

This information is used to center the artboard so that it (ideally)
remains as visible as possible.

#### Returns

[`PossibleBlockingRect`](PossibleBlockingRect.md)[]

#### Example

```typescript
function getBlockingRects() {
  const toolbar = document.getElementById('toolbar')
  const rect = toolbar.getBoundingClientRect()
  return [rect]
}
```

### initTransform?

> `optional` **initTransform**: [`Coord`](Coord.md) & `object`

The initial offset.

#### Type declaration

##### scale

> **scale**: `number`

#### Example

```typescript
{
  initTransform: {
    x: 500,
    y: 20,
    scale: 1
  }
}
```

### margin?

> `optional` **margin**: `number`

The margin used when aligning the artboard, for example when calling the
`scaleToFit()` method. In this case, a value of `0` would scale the artboard to
fill all the available width or height. A value of `50` would scale it so that
there is at least 50px between the artboard and the root element.

#### Example

```typescript
Keeps at least 10px space between the artboard and the root element when aligning.
{
  margin: 10,
}
```

### maxScale?

> `optional` **maxScale**: `number`

The maximum amount the artboard can scale.

#### Example

Prevents scaling above 9.
```typescript
{
   maxScale: 9,
}
```

### minScale?

> `optional` **minScale**: `number`

The minimum amount the artboard can scale.

#### Example

Prevents scaling below 0.1.

```typescript
{
   minScale: 0.1,
}
```

### momentumDeceleration?

> `optional` **momentumDeceleration**: `number`

The deceleration of the momentum scrolling. The higher the value the longer the momentum scrolling is applied.

#### Example

```typescript
{
   momentumDeceleration: 0.96
}
```

### overscrollBounds?

> `optional` **overscrollBounds**: `number` \| [`Paddings`](Paddings.md)

How much of the artboard should remain visible when overscrolling.

A value of 0 means the artboard can be dragged right to every edge of the
root element. A value of e.g. 100 means that there is always at least 100px
of the artboard visible. A negative value means the artboard can be dragged
outside the root element.

You can also provide an object with top, right, bottom and left properties
to define individual values per edge.

#### Examples

Initialise with same bounds on all edges.
```typescript
{
  overscrollBounds: 20
}
```

Initialise with individual bounds per edge.
```typescript
{
  overscrollBounds: {
    top: 50,
    bottom: 50,
    left: 100,
    right: 70,
  }
}
```

### rootClientRectMaxStale?

> `optional` **rootClientRectMaxStale**: `number`

How often the getBoundingClientRect() method should be called on the
root element.

Some calculations require knowing the exact location of the root element
relative to the viewport. For this it will call getBoundingClientRect()
on the root element. However, doing this too much can have a negative
impact on performance, which is why this is only done sporadically.

If you anticipate that the root element regularly changes its position
relative to the viewport, you may set a lower value. If the position
rarely or never changes, you may set a high value.

Note the position is always updated when the ResizeObserver callback is
triggered for the root element.

#### Example

Only refresh the root rect every minute.

```typescript
{
   rootClientRectMaxStale: 60 * 1000,
}
```

### scrollStepAmount?

> `optional` **scrollStepAmount**: `number`

The amount to scroll per step, in pixels. This is used by methods like
`artboard.scrollUp()`.

#### Example

Scrolls by 200px when calling for example the scrollUp() method, e.g. when
pressing the ArrowUp key.
```typescript
{
   scrollStepAmount: 200,
}
```

### springDamping?

> `optional` **springDamping**: `number`

## Defined in

types/index.ts:111
