[artboard-deluxe](../globals.md) / ArtboardScrollIntoViewOptions

# ArtboardScrollIntoViewOptions

> **ArtboardScrollIntoViewOptions**: [`AnimationOptions`](AnimationOptions.md) & `object`

Options for scrolling an area of the artboard into view.

## Type declaration

### axis?

> `optional` **axis**: `"x"` \| `"y"` \| `"both"`

Which axis to scroll.

### behavior?

> `optional` **behavior**: `"smooth"` \| `"instant"` \| `"auto"`

The scroll behaviour.

- Smooth: Always animates the transition.
- Instant: Directly apply the transform and scale.
- Auto: Uses smooth, but switches to instant if an animation is currently
  running.

### scale?

> `optional` **scale**: `"none"` \| `"full"` \| `"blocking"`

Define whether the artboard should be scaled.

- None: Keeps the current artboard scale.
- Full: Scales the artboard so that the target element fully covers the
  available space.
- Blocking: Scales the artboard so that the target element covers the
  non-blocking area.

## Defined in

types/index.ts:312
