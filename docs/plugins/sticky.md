# sticky()

Makes an element stick to the artboard at a given position.

## Usage

The element's absolute origin must be in the top left corner of the root
element. This is automatically the case if the element is placed as a direct
child of the root element.

Note that the plugin will set a CSS `position` value of `absolute` on the
element.

### Example with `dom()` plugin

<CodePen id="RNbLLQg" />

Here the sticky element with class `overlay` is a direct child of the root
element.

```html
<div id="root" class="relative">
  <div id="artboard">This is the artboard.</div>
  <div id="overlay">Hello World</div>
</div>
```

```typescript
import { createArtboard, raf, sticky, mouse, dom } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'), [
  dom({
    element: document.getElementById('artboard'),
  }),
  raf(),
  mouse(),
  sticky({
    target: document.getElementById('overlay'),
  }),
])
```

### Example with `<canvas>`

<CodePen id="GgKMMvv" />

Since the root element is the `<canvas>` we can't add a child to it. However, we
can wrap both the canvas and the sticky element in another element that has
`position: relative`.

```html
<div class="relative">
  <canvas id="root" width="1200" height="800"></canvas>
  <div id="overlay">Hello World</div>
</div>
```

## Positioning

There are four options that let you define how the sticky element should be
positioned. `position` and `origin` define the general location of the element.

<Origins />

### position

This defines the position of the element relative to the artboard. Can either be
a string value such as `top-left` or `center-center` or an object with
coordinates, e.g. `{ x: 250, y: 300 }`.

A value of `top-left` would equal `{ x: 0, y: 0 }` and a value of
`center-center` would equal `{ x: 500, y: 500 }` (assuming the size of the
artboard is 1000 x 1000).

### origin

This defines where the origin is of the element relative to the calulcated
position.

For example, when `position` is `center-center` and `origin` is `center-center`,
the element will be centered perfectly within the artboard. If `position` is
`bottom-right` and `origin` is `top-left`, the element's left-top corner
overlaps the bottom-right corner of the artboard.

### margin

Adds an additional margin to the element. Can be a number (e.g. `margin: 20`) to
add a margin on all edges or an object (e.g.
`margin: { top: 20, bottom: 40, left: 20, right: 30 }`) for individual margins
per edge.

### keepVisible

When set to `true`, the element will always remain visible and stick to the
edges of the root element.

## Options

[See all options](/api/functions/sticky.html#parameters)
