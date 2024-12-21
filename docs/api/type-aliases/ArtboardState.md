[artboard-deluxe](../globals.md) / ArtboardState

# ArtboardState

> **ArtboardState**: `object`

## Type declaration

### animation

> **animation**: `ArtboardAnimation` \| `null`

The target state for the current animation.

### artboardSize

> **artboardSize**: [`Size`](Size.md) \| `null`

The native size of the artboard (without any scaling).

### interaction

> **interaction**: [`Interaction`](Interaction.md)

The current interaction.

### lastAnimateToTimestamp

> **lastAnimateToTimestamp**: `number`

The timestamp of the last call to animateTo().

### lastLoopTimestamp

> **lastLoopTimestamp**: `number`

The timestamp of the last animation loop.

### momentum

> **momentum**: [`Momentum`](Momentum.md) \| `null`

The calculated velocity of a drag gesture.

### momentumStopTimestamp

> **momentumStopTimestamp**: `number`

The timestamp when momentum was stopped.

### offset

> **offset**: [`Coord`](Coord.md)

The current arboard offset/translation.

### rootRect

> **rootRect**: `DOMRect`

The position of the root element relative to the viewport.

### rootSize

> **rootSize**: [`Size`](Size.md)

The native size of the root element.

### scale

> **scale**: `number`

The current scale of the artboard.

### scaleVelocity

> **scaleVelocity**: [`ScaleTarget`](ScaleTarget.md) \| `null`

The current scaling velocity.

### touchDirection

> **touchDirection**: [`Direction`](Direction.md)

The detected touch direction.

## Defined in

types/index.ts:1012
