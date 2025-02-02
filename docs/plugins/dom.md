# dom()

Use a DOM element as the artboard.

<CodePen id="YPKVdZG" />

## Usage

The artboard element must be a stacking child of the root element:

```html
<div id="rootElement">
  <div id="artboard">Hello World!</div>
</div>
```

```typescript
import { createArtboard, dom } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'), [
  dom({
    element: document.getElementById('artboard'),
  }),
])
```

## Options

[See all options](/api/functions/dom.html#parameters)

### element

The element that represents the artboard.

### setInitTransformFromRect

When enabled the initial offset and scale is calculated based on the current
position of the artboard on the screen. You may use any CSS to position the
artboard initially however you like:

```html
<div id="rootElement">
  <div id="artboard">Hello World!</div>
</div>

<style>
  #artboard {
    position: absolute;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
  }
</style>
```

Here the artboard is centered horizontally in its container. Upon initialisation
the plugin measures the position of the element relative to its root element and
calculates an absolute `translate3d()` and `scale()` value that matches the
position.

### precision

How precise the applied `translate3d()` values should be. A value of `1` means
the values are always rounded to a full integer (e.g. `123`). A value of `0.1`
rounds to e.g. `123.3` and a value of `10` rounds to `120`.

### applyScalePrecision

When set the value for `scale()` is calculated to match the precision. For
example, if your artboard's width is 1000px and the current scale is `0.5006` it
would result in a rendered (visible) width of `500.6px`. When enabling this
option, the plugin will calculate a scale value that results in a width that
matches the configured precision. In this case it would round the scale to
`0.501` so that the rendered width is `501px`.

### restoreStyles

The plugin adds inline styles to the artboard element upon initialisation. You
can enable this option to remove these styles when the plugin or the artboard
instance is destroyed. This also restores any styles prior initialisation:

```html
<div id="rootElement">
  <div id="artboard" style="transform: translateX(calc(100vw - 500px))">
    Hello World!
  </div>
</div>

<script>
  import { createArtboard, dom } from 'artboard-deluxe'

  const artboard = createArtboard(document.getElementById('root'), [
    dom({
      element: document.getElementById('artboard'),
      restoreStyles: true,
    }),
  ])
</script>
```

Once the plugin or artboard instance is destroyed the custom styles applied are
restored.
