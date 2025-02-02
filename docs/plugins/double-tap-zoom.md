# doubleTapZoom()

Adds a "double tap to zoom" interaction on touch devices.

<CodePen id="xbKdmQZ" />

## Usage

No additional markup or CSS is needed.

```typescript
import { createArtboard, doubleTapZoom, raf } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'), [
  doubleTapZoom(),
  raf(),
])
```

## Options

[See all options](/api/functions/doubleTapZoom.html#parameters)

### animation

You can override the default animation between zoom levels using the `animation`
option.

```typescript
doubleTapZoom({
  animation: {
    duration: 500,
    easing: 'easeInOutExpo',
  },
})
```
