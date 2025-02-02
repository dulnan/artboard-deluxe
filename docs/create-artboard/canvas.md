# Canvas

You can render your artboard using a canvas. For this you can pass in the
`<canvas>` element as the root element when creating an artboard instance.

Note that the library does not actually render anything on the canvas, it only
manages the interactions and calculates the offset and scale.

<CodePen id="RNbVEEL" />

## Requirements

- A single HTML `<canvas>` element

## Markup

```html
<canvas id="canvas" width="1280" height="768"></canvas>
```

```typescript
import { createArtboard, mouse, wheel } from 'artboard-deluxe'

const canvas = document.getElementById('canvas')
const artboard = createArtboard(canvas, [mouse(), wheel()])

// The size of the "virtual" artboard.
artboard.setArtboardSize(800, 600)

function loop(time) {
  const { offset, scale, artboardSize } = artboard.loop(time)
  const ctx = canvas.getContext('2d')

  // Clear canvas.
  ctx.clearRect(0, 0, 1280, 768)

  // Draw a grey background.
  ctx.fillStyle = 'grey'
  ctx.fillRect(0, 0, 1280, 768)

  // Multiply the current scale with the width and height to get the "actual"
  // size of the artboard as it would appear.
  const width = Math.round(artboardSize!.width * scale)
  const height = Math.round(artboardSize!.height * scale)

  // Draw the artboard.
  ctx.fillStyle = 'white'
  // The offset is always unscaled, so we can keep it like this.
  ctx.fillRect(offset.x, offset.y, width, height)

  window.requestAnimationFrame(loop)
}

window.requestAnimationFrame(loop)
```

## Infinite Mode

By default the artboard size is unlimited, unless explicitly set with
`artboard.setArtboardSize()`. That way the artboard does not have a size and can
be dragged almost infinitely (only limited by `Number.MAX_SAFE_INTEGER`).

A possible use case is to render an "infinite" artboard using WebGL in a
fragment shader. In this case you could use the scale and offset in the shader
to alter the anchor point of the virtual world.

## As a Plugin

You may also implement your drawing logic as a plugin.

::: code-group

```typescript [plugin.ts]
import { defineArtboardPlugin } from 'artboard-deluxe'

export const draw = defineArtboardPlugin(function (artboard, options) {
  const rootElement = artboard.getRootElement()
  if (!(rootElement instanceof HTMLCanvasElement)) {
    throw new Error('Plugin can only be used with canvas rendering.')
  }
  const ctx = rootElement.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get 2D canvas context.')
  }
  return {
    options,
    // Method called in a requestAnimationFrame callback.
    loop(loopContext) {
      if (!loopContext.artboardSize) {
        return
      }

      // Clear canvas.
      ctx.clearRect(0, 0, 1280, 768)

      // Draw a grey background.
      ctx.fillStyle = 'grey'
      ctx.fillRect(0, 0, 1280, 768)

      // Multiply the current scale with the width and height to get the "actual"
      // size of the artboard as it would appear.
      const width = Math.round(loopContext.artboardSize!.width * scale)
      const height = Math.round(loopContext.artboardSize!.height * scale)

      // Draw the artboard.
      ctx.fillStyle = 'white'
      // The offset is always unscaled, so we can keep it like this.
      ctx.fillRect(offset.x, offset.y, width, height)
    },
  }
})
```

```typescript [main.ts]
import { createArtboard, mouse, wheel, raf } from 'artboard-deluxe'
import { draw } from './plugin'

const canvas = document.getElementById('canvas')
const artboard = createArtboard(canvas, [mouse(), wheel(), draw(), raf()])

// The size of the "virtual" artboard.
artboard.setArtboardSize(800, 600)
```

:::
