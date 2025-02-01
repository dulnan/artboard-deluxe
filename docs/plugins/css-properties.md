# cssProperties()

Adds and updates CSS properties that contain artboard state.

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
  cssProperties({
    properties: [
      '--artboard-offset-x',
      '--artboard-offset-y',
      '--artboard-scale',
      '--artboard-size-width',
      '--artboard-size-height',
    ],
  }),
])
```

## Properties

By default no properties are set unless explicitly enabled via the `properties`
option. The following CSS properties can be set:

### `--artboard-offset-x`

The current x offset of the artboard in pixels.

### `--artboard-offset-y`

The current y offset of the artboard in pixels.

### `--artboard-scale`

The current scale of the artboard.

### `--artboard-size-width`

The width of the artboard in pixels.

### `--artboard-size-height`

The height of the artboard in pixels.

## Options

[See all options](/api/functions/cssProperties.html#parameters)
