# keyboard()

Adds support for keyboard shortcuts.

::: info

For more flexibility you can also implement your own keyboard event listener,
since all methods are available on the `Artboard` instance, such as
`resetZoom()` or `scrollDown()`.

:::

## Markup

No additional markup or CSS is needed.

```typescript
import { createArtboard, keyboard, raf } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'), [
  keyboard(),
  raf(),
])
```

## Shortcuts

The plugin adds some common shortcuts to interact with the artboard:

- <kbd>ArrowDown</kbd>: Scroll down
- <kbd>ArrowUp</kbd>: Scroll up
- <kbd>ArrowLeft</kbd>: Scroll left
- <kbd>ArrowRight</kbd>: Scroll right
- <kbd>Home</kbd>: Scroll to top
- <kbd>End</kbd>: Scroll to end
- <kbd>PageUp</kbd>: Scroll one page up
- <kbd>PageDown</kbd>: Scroll one page down
- <kbd>Modifier + 0</kbd>: Reset zoom
- <kbd>Modifier + 1</kbd>: Scale to fit

## Modifiers

By default, the plugin uses both the <kbd>Control</kbd> key as the modifier.
This can be changed using the `modifier` option. Possible options are `'ctrl'`,
`'meta'`, `'alt'` or `'ctrlmeta'`.

```typescript
keyboard({
  modifier: 'ctrlmeta', // Allow both Ctrl and Meta.
})
```

## Custom Keymap

You can provide your own mapping for the shortcuts. By doing so you override all
default mappings.

The keymap is an object whose property is the `code` of the pressed key and the
value is an array where the first item is the _name of the method to call_ and
the optional second item is whether it requires pressing the modifier key.

Example:

```typescript
keyboard({
  keymap: {
    // vim style keybindings.
    h: ['scrollLeft'],
    j: ['scrollDown'],
    k: ['scrollUp'],
    l: ['scrollRight'],
    r: ['resetZoom', true], // Use Ctrl + R to reset zoom.
    s: ['scaleToFit', true], // Use Ctrl + S to scale to fit.
  },
})
```
