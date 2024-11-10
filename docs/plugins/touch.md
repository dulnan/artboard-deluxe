# touch()

Allows dragging and scaling the artboard using touch gestures.

## Usage

No additional markup or CSS is needed.

```typescript
import { createArtboard, touch, raf } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'), [
  touch(),
  raf(),
])
```

## Interactions

### Dragging

By default the artboard can be dragged using a single finger. This behaviour can
be changed with the `useTwoTouchScrolling` option.

### Zooming

Zooming is performed using a pinch gesture. For the duration of the gesture the
artboard is scaled around the midpoint of both touch points without animations
or momentum behaviour. Once a finger is lifted, it will fall back to dragging.

The artboard may be scaled past the defined scale boundaries, however once the
min/max boundary is reached, the applied scale is dampened.

Once the pinch gesture is finished the artboard will animate back to the nearest
valid scale.

## Options

### useTwoTouchScrolling

By default the artboard is draggable when using a single touch point. If you
build something like a drawing app, you might want to instead only allow
dragging using two fingers.

```typescript
touch({
  useTwoTouchScrolling: true,
})
```

### velocity

This option allows you to override the settings for the velocity queue. The
velocity queue is responsible for determining how fast the resulting momentum
scroll after a touch gesture is.

```typescript
touch({
  velocity: {
    // Only look at the last 300ms of the touch gesture.
    maxTimeWindow: 300,

    // Require at least a velocity of 1000px/s. Anything below results in a velocity of 0.
    minVelocity: 1000,

    // Limit the max velocity to 12000px/s. Anything above will be kept at 12000.
    maxVelocity: 12000,

    // Multiply the velocity by the given amount. If the measured velocity is 4000, the result would be 6000.
    multiplicator: 1.5,
  },
})
```

### overscaleAnimation

When using a pinch gesture the artboard may be scaled above or below the defined
minScale or maxScale. Once both fingers are lifted, the artboard will animate
back to the nearest valid scale. This option defines which animation to use for
that.

```typescript
touch({
  animation: {
    duration: 300,
    easing: 'easeOutBack',
  },
})
```

### scrollDirectionThreshold

The threshold in degrees for detecting the scroll direction.

A value of 0 means the direction must be perfectly aligned with the desired
axis. In other words: The finger must be swiped in a perfect vertical direction
to lock scrolling on the Y axis or else the artboard can be dragged in any
direction.

A value of 45 means the swipe direction may lie anywhere from -45° to +45° on an
axis to lock the scroll direction on that axis. In other words: Only if you
swipe your finger in a perfect diagonal line is it possible to drag the artboard
in any direction.

## Event Listeners

Listeners for `touchstart`, `touchmove` and `touchend` are added to the root
element.

By default, the artboard can be dragged using a single touch; however, by
setting `useTwoTouchScrolling: true` in the options, you can prevent this
behaviour. By doing so, in order to drag the artboard, at least two touch points
are required.
