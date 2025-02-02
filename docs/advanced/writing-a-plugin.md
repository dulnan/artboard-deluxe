# Writing a Plugin

You can easily create your own plugins to implement new features or extend the
behaviour.

## Define Plugin

Use the `defineArtboardPlugin` method to define your plugin. If requires a
single argument which is a function that should return the plugin.

The returned plugin should implement a `destroy()` method which is called when
the plugin is destroyed.

You may define the type for the plugin options as a generic argument. The
options are wrapped in a helper instance and can be accessed using
`options.get()`.

## Example

This example plugin displays the current scale of the artboard as a human
readable zoom percentage level in a div. The zoom level is displayed in the
provided HTML element.

```typescript
import { defineArtboardPlugin, inlineStyleOverrider } from 'artboard-deluxe'

export const zoomOverlay = defineArtboardPlugin<{
  element: HTMLElement
  fontSize?: number
}>(function (artboard, options) {
  // Get a required option. This will throw an error if the option is not defined.
  const element = options.getRequired('element')

  // Allow overriding element styles and restore them when the plugin is destroyed.
  const styles = inlineStyleOverrider(element)

  // Override some styles on the element.
  styles.setMultiple({
    position: 'absolute',
    top: 0,
    left: 0,
    transformOrigin: '0 0',
    pointerEvents: 'none',
    background: 'white',
    color: 'black',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 6,
    paddingBottom: 6,
  })

  let prevZoom = 0

  return {
    // Return the options helper.
    options,

    // Restore the original styles that may have been overriden.
    destroy() {
      styles.restore()
    },

    // Method called in a requestAnimationFrame callback.
    loop(ctx) {
      if (!ctx.artboardSize) {
        return
      }

      styles.set('fontSize', options.get('fontSize', 20))

      const x = Math.max(Math.round(ctx.offset.x), 0)
      const y = Math.max(Math.round(ctx.offset.y), 0)

      styles.setTransform(x, y)
      const zoom = Math.round(ctx.scale * 100)

      // Prevent updating DOM when there was no change.
      if (prevZoom === zoom) {
        return
      }

      element.innerHTML = `${zoom}%`
      prevZoom = zoom
    },
  }
})
```

You can then import the plugin and use it like this:

```typescript
import { createArtboard } from 'artboard-deluxe'
import { zoomOverlay } from './zoomOverlay'

const zoomElement = document.getElementById('zoom-overlay')

const artboard = createArtboard(document.body, [
  zoomOverlay({ element: zoomElement }),
])
```

## Plugin methods

Your plugin may return the following methods:

### loop()

Called in a requestAnimationFrame callback. The method receives a single
argument `ctx` that contains the state of the artboard at the time of the
animation frame.

### destroy()

Called when the plugin is destroyed. Allows you to remove event listeners or
clean up the DOM.

### onSizeChange()

Called when the size of an element is changed according to `ResizeObserver`. To
observe an element's size, you can do:

```typescript
artboard.observeSize(element)
```

And in your onSizeChange method:

```typescript
function onSizeChange(entry: ResizeObserverEntry) {
  if (entry.target !== element) {
    return
  }

  // Do something.
}
```

## Types

The library export some helper types for plugins:

### PluginOptions

This type "extracts" the options of a plugin:

```typescript
import { defineArtboardPlugin, type PluginOptions } from 'artboard-deluxe'

const myPlugin = defineArtboardPlugin<{ myOption: string }>(
  function (artboard, options) {
    return {
      options,
    }
  },
)

// Resulting type: { myOption: string }
type MyPluginOptions = PluginOptions<ReturnType<typeof myPlugin>>
```

## PluginInstance

The type for a fully initialised plugin instance.

```typescript
import {
  defineArtboardPlugin,
  createArtboard,
  type PluginInstance,
} from 'artboard-deluxe'

const myPlugin = defineArtboardPlugin<
  { myOption: string },
  { returnSomething: () => string }
>(function (artboard, options) {
  function returnSomething() {
    return 'Foobar'
  }

  return {
    options,
    returnSomething,
  }
})

const artboard = createArtboard()

// Create a type for an instance of your plugin.
type MyPluginInstance = PluginInstance<ReturnType<typeof myPlugin>>

const instance: MyPluginInstance = artboard.addPlugin(
  myPlugin({ myOption: 'Hello' }),
)
```

All options and additional returned properties/methods (`returnSomething()` in
our case) are properly typed:

```typescript
// Access plugin methods.
console.log(instance.returnSomething())

// Access fully typed options.
console.log(instance.options.get('myOption'))
```
