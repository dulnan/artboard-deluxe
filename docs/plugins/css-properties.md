# cssProperties()

Adds and updates CSS properties containing the artboard state.

## Usage

No additional markup or CSS is needed.

```typescript
import {
  createArtboard,
  raf,
  cssProperties,
  mouse,
  wheel,
} from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'), [
  raf(),
  mouse(),
  wheel(),
  cssProperties(),
])
```

## Properties

### `--artboard-offset-x`

The current x offset of the artboard.

### `--artboard-offset-y`

The current y offset of the artboard.

### `--artboard-scale`

The current scale of the artboard.
