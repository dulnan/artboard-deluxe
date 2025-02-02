# Updating Options

## Plugins

When initialising a plugin, you have access to the `options` instance of the
plugin that can be updated during runtime.

Unless explicitly noted in the option property's description, all options can be
updated at runtime. In general, options that are references to DOM elements can
not be updated after the plugin is initalised.

### Updating a single option

```typescript
import { createArtboard, wheel } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'))

const wheelPlugin = artboard.addPlugin(
  wheel({
    useMomentumScroll: true,
    useMomentumZoom: true,
  }),
)

function toggleMomentum() {
  // Toggle between momentum options.
  wheelPlugin.options.set(
    'useMomentumZoom',
    !wheelPlugin.options.get('useMomentumZoom'),
  )
  wheelPlugin.options.set(
    'useMomentumScroll',
    !wheelPlugin.options.get('useMomentumScroll'),
  )
}

function updateZoomFactor(factor: number) {
  wheelPlugin.options.set('wheelZoomFactor', factor)
}
```

### Updating all options

```typescript
import { createArtboard, wheel, type PluginWheelOptions } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'))

function getOptions(): PluginWheelOptions {
  const input = document.getElementById('zoom-range-input')
  return {
    useMomentumScroll: true,
    useMomentumZoom: true,
    wheelZoomFactor: parseInt(input.value),
  }
}

const wheelPlugin = artboard.addPlugin(wheel(getOptions()))

function updateOptions() {
  wheelPlugin.options.setAll(getOptions())
}
```
