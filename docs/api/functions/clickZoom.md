[artboard-deluxe](../globals.md) / clickZoom

# clickZoom()

> **clickZoom**(`options`?): [`ArtboardPluginDefinition`](../type-aliases/ArtboardPluginDefinition.md)\<\{ `animation`: `Required`\<[`AnimationOptions`](../type-aliases/AnimationOptions.md)\>; \}\>

Implements a "click to zoom".

Note this plugin only handles click events originating from mouse pointers.
For touch devices, use the doubleTapToZoom plugin.

## Parameters

### options?

#### animation

`Required`\<[`AnimationOptions`](../type-aliases/AnimationOptions.md)\>

## Returns

[`ArtboardPluginDefinition`](../type-aliases/ArtboardPluginDefinition.md)\<\{ `animation`: `Required`\<[`AnimationOptions`](../type-aliases/AnimationOptions.md)\>; \}\>

## Example

```typescript
import { createArtboard, clickZoom } from 'artboard-deluxe'

const root = document.elementById('root')
const artboard = createArtboard(root, [clickZoom()])
```

## Defined in

plugins/clickZoom/index.ts:20
