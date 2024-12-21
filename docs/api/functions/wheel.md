[artboard-deluxe](../globals.md) / wheel

# wheel()

> **wheel**(`options`?): [`ArtboardPluginDefinition`](../type-aliases/ArtboardPluginDefinition.md)\<\{ `interceptWheel`: `boolean`; `scrollSpeed`: `number`; `useMomentumScroll`: `boolean`; `useMomentumZoom`: `boolean`; `wheelZoomFactor`: `number`; \}\>

## Parameters

### options?

#### interceptWheel

`boolean`

If set to true, the wheel event listener for scrolling will be added to
the document, preventing any other scrolling from occuring.

If this option is set, to enable scrolling for elements that overlay the
artboard/root element, you need to manually add a wheel event listener to
this element and call event.stopPropagation().

#### scrollSpeed

`number`

The scroll speed when using the mouse wheel.

#### useMomentumScroll

`boolean`

Enable momentum scrolling when using the scroll wheel.

#### useMomentumZoom

`boolean`

Enable momentum zooming when using the scroll wheel.

#### wheelZoomFactor

`number`

How much the artboard should be zoomed using the scroll wheel.

The higher the value, the more the artboard is zoomed.

## Returns

[`ArtboardPluginDefinition`](../type-aliases/ArtboardPluginDefinition.md)\<\{ `interceptWheel`: `boolean`; `scrollSpeed`: `number`; `useMomentumScroll`: `boolean`; `useMomentumZoom`: `boolean`; `wheelZoomFactor`: `number`; \}\>

## Defined in

plugins/wheel/index.ts:8
