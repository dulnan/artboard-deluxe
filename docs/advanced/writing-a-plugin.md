# Writing a Plugin

You can easily create your own plugins to implement new features or extend the
behaviour.

## Define Plugin

Use the `defineArtboardPlugin` method to define your plugin. If requires a
single argument which is a function that should return the plugin.

The returned plugin may return a `destroy()` method which is called when the
plugin instance is destroyed.

## Plugin Options

You may define the type for the plugin options as the first generic argument.
The options are wrapped in a helper instance and can be accessed using
`options.get()`.
[See all available methods](/api/type-aliases/ArtboardPluginOptions.html#type-declaration)

The plugin must return the options so they're available in the plugin instance.

```typescript
import { defineArtboardPlugin } from 'artboard-deluxe'

export const myPlugin = defineArtboardPlugin<{
  requiredOption: string
  optional?: number
}>(function (artboard, options) {
  // Get a required option. If not provided an error is thrown.
  const requiredOption = options.getRequired('requiredOption')

  // Get an optional option, with a default value as the second argument.
  const options = options.get('optional', 10)

  return {
    options,
  }
})
```

## Custom Methods

Your plugin may also return additional methods that can be called on the plugin
instance. Define the methods as the second generic type argument.

```typescript
import { defineArtboardPlugin } from 'artboard-deluxe'

export const myPlugin = defineArtboardPlugin<
  {
    text: string
  },
  {
    getText: () => string
  }
>(function (artboard, options) {
  return {
    options,
    getText() {
      return 'Your text: ' + options.getRequired('text')
    },
  }
})
```

And later on, when the plugin is initialised:

```typescript
import { createArtboard } from 'artboard-deluxe'
import { myPlugin } from './myPlugin'

const artboard = createArtboard()
const instance = artboard.addPlugin(myPlugin({ text: 'Hello World' }))
console.log(instance.getText())
```

## Example

This example plugin displays the current scale of the artboard as a human
readable zoom percentage level in a div. The zoom level is displayed in the
provided HTML element.

```typescript
import { defineArtboardPlugin, inlineStyleOverrider } from 'artboard-deluxe'

export const zoomOverlay = defineArtboardPlugin<
  {
    element: HTMLElement
    fontSize?: number
  },
  {
    setOpacity: (opacity: number) => void
  }
>(function (artboard, options) {
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

  function setOpacity(opacity: number) {
    style.set('opacity', opacity)
  }

  return {
    // Return the options helper.
    options,

    // Return method declared in the second generic type argument.
    setOpacity,

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

## Helpers

### ResizeObserver

If your plugin needs to react to changes of an element's size, you can register
a callback that is executed when the size changes:

```typescript
artboard.observeSizeChange(element, (entry) => {
  // The ResizeObserverEntry from the ResizeObserver.
  console.log(entry)
})
```

## Built-in Methods

Your plugin may return the following methods:

### loop()

Called in a requestAnimationFrame callback. The method receives a single
argument `ctx` that contains the state of the artboard at the time of the
animation frame. This is where you can update the DOM.

### destroy()

Called when the plugin is destroyed. Allows you to remove event listeners or
clean up the DOM.

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

### PluginInstance

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
