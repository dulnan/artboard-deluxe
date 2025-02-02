# clickZoom()

Adds a "click to zoom" interaction using the mouse.

<CodePen id="WbejLKg" />

## Usage

No additional markup or CSS is needed.

```typescript
import { createArtboard, clickZoom, raf } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'), [
  clickZoom(),
  raf(),
])
```

## Options

[See all options](/api/functions/clickZoom.html#parameters)

### animation

You can override the default animation between zoom levels using the `animation`
option.

```typescript
clickZoom({
  animation: {
    duration: 500,
    easing: 'easeInOutExpo',
  },
})
```
