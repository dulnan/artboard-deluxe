# Options for createArtboard()

## initTransform

The initial x, y and scale value to apply.

### Example

```typescript
{ x: 0, y: 400, scale: 1.5 }
```

## overscrollBounds

How much of the artboard should remain visible when overscrolling.

A value of 0 means the artboard can be dragged right to every edge of the root
element. A value of e.g. 100 means that there is always at least 100px of the
artboard visible. A negative value means the artboard can be dragged outside the
root element.

### Example

```typescript
100
```

You can also provide an object with top, right, bottom and left properties to
define individual values per edge.

```typescript
{ top: 20, bottom: 20, left: 100, right: 100 }
```

## margin

The margin used when aligning the artboard, for example when calling the
`scaleToFit()` method. In this case, a value of `0` would scale the artboard to
fill all the available width or height. A value of `50` would scale it so that
there is at least 50px between the artboard and the root element.

## scrollStepAmount

The amount to scroll per step, in pixels. This is used by methods like
`artboard.scrollUp()`.

## minScale

The minimum scale value.

## maxScale

The maximum scale value.

## momentumDeceleration

The default deceleration for momentum animations. The default value is `0.96`. A
higher value will result in a longer animation.

## direction

Which directions the artboard may move. Possible values are `'none'`,
`'horizontal'`, `'vertical'` or `'both'` (default).

## springDamping

How much damping to apply when overscrolling. A value of `1` means there is no
damping applied and a value of `0` means it's not possible to overscroll.

To see the effect of this option try to drag the artboard past its possible
boundaries. Once you "overscroll" the damping is applied.

## getBlockingRects

A method that can return an array of rectangles (relative to the viewport) which
may overlap with the root element and/or artboard.

Methods like `artboard.scaleToFit()` will use this information to find the ideal
offset and scale for the artboard so that it isn't overlapped by any of the
blocking rects.

### Example

```typescript
function getBlockingRects() {
  const toolbar = document.getElementById('toolbar')
  const rect = toolbar.getBoundingClientRect()
  return [rect]
}
```

## rootClientRectMaxStale

How often the getBoundingClientRect() method should be called on the root
element, in milliseconds (defaults to `5000`).

Some calculations require knowing the exact location of the root element
relative to the viewport. For this it will call getBoundingClientRect() on the
root element. However, doing this too much can have a negative impact on
performance, which is why the position is cached for the configured duration.

If you anticipate that the root element regularly changes its position relative
to the viewport, you may set a lower value. If the position rarely or never
changes, you may set a high value.

Note the position is always updated when the ResizeObserver callback is
triggered for the root element.
