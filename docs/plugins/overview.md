# overview()

Renders an interactive "bird's-eye view" of the artboard, its parent element and
the visible area.

## Requirements

- A single DOM element that has a width and height, containing:
  - an element with class `artboard-overview-artboard` that is used to display
    the artboard
  - an element with class `artboard-overview-visible` that is used to display
    the visible portion of the artboard relative to the artboard's root element

## Markup

```html
<div id="overview">
  <div class="artboard-overview-artboard"></div>
  <button class="artboard-overview-visible" />
</div>
```

```css
#overview {
  position: relative;
  width: 500px;
  height: 500px;
}

.artboard-overview-artboard {
  background: white;
}

.artboard-overview-visible {
  border: 1px solid black;
}
```

```typescript
import { createArtboard, overview, raf } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'), [
  overview({ element: document.getElementById('overview') }),
  raf(),
])
```

### Markup with opacity

If you want to "grey out" the non-visible portion, you can wrap the
`artboard-overview-visible` element in another element and use CSS.

```html
<div id="overview">
  <div class="artboard-overview-artboard"></div>
  <div class="artboard-overview-overlay">
    <button class="artboard-overview-visible" />
  </div>
</div>
```

```css
#overview {
  position: absolute;
  width: 500px;
  height: 500px;
}

.artboard-overview-artboard {
  background: white;
}

.artboard-overview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  mix-blend-mode: multiply;
}

.artboard-overview-visible {
  background: white;
}
```
