# scrollbar()

Render a vertical (Y axis) or horizontal (X axis) scrollbar.

## Requirements

- A single DOM element with a width or height
- It should contain an element with the `.artboard-thumb` class
- The plugin will apply `transform` and `width` or `height` (depending on the
  orientation) to the thumb element

## Usage

```html
<div id="scrollbar-x">
  <button class="artboard-thumb" />
</div>
<div id="scrollbar-y">
  <button class="artboard-thumb" />
</div>
```

```css
#scrollbar-y {
  width: 20px;
  height: 100vh;
}

#scrollbar-x {
  width: 100vw;
  height: 20px;
}

#scrollbar-y .artboard-thumb {
  width: 100%;
}

#scrollbar-x .artboard-thumb {
  height: 100%;
}

.artboard-thumb {
  background: black;
}
```

```typescript
import { createArtboard, scrollbar, raf } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'), [
  scrollbar({
    element: document.getElementById('scrollbar-x'),
    orientation: 'x',
  }),
  scrollbar({
    element: document.getElementById('scrollbar-y'),
    orientation: 'y',
  }),
  raf(),
])
```
