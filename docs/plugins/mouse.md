# mouse()

Allows dragging the artboard using the mouse.

## Usage

No additional markup or CSS is needed.

```typescript
import { createArtboard, mouse, raf } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'), [
  mouse(),
  raf(),
])
```

## Options

[See all options](/api/functions/mouse.html#parameters)

### useSpacebar

By default the artboard is draggable by clicking and dragging. You can instead
change this behaviour to also require that the space bar key is pressed:

```typescript
mouse({
  useSpacebar: true,
})
```

## Event Listeners

The plugin adds `pointerdown`, `pointermove` and `pointerup` event listeners.

It also adds a `keydown` and `keyup` event listener to the document. However,
these won't do anything if the `useSpacebar` option is set to false.

In addition, a `click` event listener is added on the root element. It's purpose
is to prevent triggering a click on things like links or buttons inside the
artboard if the click happens during or right after an interaction such as
momentum scrolling.

It should be possible to use links, buttons, input fields, etc. within the
artboard. However, if the main purpose of your app is to interact with the
artboard (such as a drawing app), it's probably best to use the `useSpacebar`
option. That way any interaction with the mouse will work without issues.
