# createArtboard()

This creates a new artboard instance. The artboard instance itself does not
implement any interactions - these are handled by plugins. However, for any
potential interaction, the artboard instance provides a method to call, such as
setting the offset, applying momentum, scaling around a point, etc.

## Arguments

### rootElement

The root element. When using the [dom plugin](/plugins/dom) this is the root
element that should contain the artboard element. When using canvas rendering,
this should be the actual `<canvas>` element.

### plugins

The plugins to initialise the artboard with.

```typescript
import { createArtboard, mouse } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'), [mouse()])
```

To add or remove plugins on an already created artboard instance:

```typescript
import { createArtboard, mouse } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'))

const mousePlugin = mouse()
artboard.addPlugin(mousePlugin)
artboard.removePlugin(mousePlugin)
```

### options

@TODO

## Event Listeners

The `createArtboard()` method won't add any event listeners - this is
exclusively done by the plugins, such as [touch()](/plugins/touch) or
[mouse()](/plugins/mouse).

## ResizeObserver

When the artboard is initialised, it will observe the size of the provided root
element. The size is initially set immediately, afterwards the ResizeObserver
callbacks are debounced for performance reasons.

When the size changes, the state of the artboard is recalculated. If the new
state results in an invalid offset it will be adjusted to the nearest possible
value that lies within the boundaries.

## Nested Artboards

While it is technically possible to nest multiple artboards within each other,
it's not fully supported yet, as some calculations assume the root element to
not be scaled.
