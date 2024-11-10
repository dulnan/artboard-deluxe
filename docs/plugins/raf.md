# raf()

Implements a `requestAnimationFrame` callback and calls the `artboard.loop()`
method.

## Usage

No additional markup or CSS is needed.

```typescript
import { createArtboard, raf } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('artboard'), [raf()])
```

## Custom

Instead of using this plugin you can also implement your own loop handler.

```typescript
import { createArtboard } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('artboard'))

function loop(time: number) {
  artboard.loop(time)
  window.requestAnimationFrame(loop)
}

window.requestAnimationFrame(loop)
```
