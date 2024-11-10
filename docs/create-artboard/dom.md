# DOM

This mode uses two DOM elements to render the artboard:

- The artboard istself
- The direct parent of the artboard element

## Requirements

- The root element should be `position: relative` (or anything that creates a
  new stacking context such as `absolute` or `fixed`)
- The artboard element must be `position: absolute` and anchored to the top left
  using (`top: 0` and `left: 0`)

## Minimal Example

```html
<div id="root">
  <div id="artboard">Hello World!</div>
</div>
```

```css
#root {
  position: relative;
  width: 500px;
  height: 500px;
}

#artboard {
  background: white;
}
```

```typescript
import { createArtboard, dom, mouse, wheel, raf } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'), [
  dom({ element: document.getElementById('artboard') }),
  mouse(),
  wheel(),
  raf(),
])
```

## Event Listeners

For the best user experience, Artboard adds various event listeners to the root
element and the document.
