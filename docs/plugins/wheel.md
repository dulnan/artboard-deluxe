# wheel()

Allows scrolling and zooming using a mouse wheel or trackpad.

## Usage

No additional markup or CSS is needed.

```typescript
import { createArtboard, wheel, raf } from 'artboard-deluxe'

const artboard = createArtboard(document.getElementById('root'), [
  wheel(),
  raf(),
])
```

## Interactions

### Scroll

Scrolling is applied in all directions on every wheel event. If the **Shift**
key is held, scrolling is fixed to the X axis.

### Zoom

When the **Ctrl** or **Meta** key is held, the wheel event will trigger zooming.

## Options

### scrollSpeed

A multiplicator for determining the final scroll speed. A value of 1 results in
the same scroll behaviour as if the artboard where scrolled natively by the
browser.

```typescript
wheel({
  // Increase scroll speed when the artboard is very large and it's
  // desireable to quickly scroll around the artboard.
  scrollSpeed: 1.3,
})
```

### interceptWheel

When set, the wheel event listener added to `document` will intercept all wheel
events and prevent any scrolling from occuring. In particular, it prevents the
default zoom beaviour of the browser while holding the Ctrl key.

If you only have a single artboard instance on your page, you can set this to
true for the best experience.

If you have multiple artboard instances, you should set this to false. In this
case only wheel events originating from the root element are used. Wheel events
emitted on other elements will trigger default browser behaviour.

```typescript
wheel({
  interceptWheel: true,
})
```

### wheelZoomFactor

Adjust how much the artboard should be zoomed. The default value is 1. Increase
the value if your artboard is large and having quick zooming is desireable.

```typescript
wheel({
  wheelZoomFactor: 1.3,
})
```

### useMomentumScroll

By default the scroll behaviour using the wheel is close to native browser
scrolling.

By setting this option to true, you can enable momentum scrolling (aka "smooth
scrolling").

```typescript
wheel({
  useMomentumScroll: true,
})
```

### useMomentumZoom

By default the artboard is zoomed instantly when using the wheel. By setting
this to true you can enable momentum zooming, where each wheel event "pushes"
the scale into the given direction.

```typescript
wheel({
  useMomentumZoom: true,
})
```

## Event Listeners

The plugin registers two `wheel` event listeners. The first one is added to the
root element and it handles both scrolling and zooming. The second one is added
to `document`. By default, it will not do anything. If `interceptWheel` is set
to `true`, it will **always** prevent default behaviour and stop further event
propagation. This is so that there is no way for the user to trigger native
browser zooming using the scroll wheel.

This also means that it's not possible to scroll anything in the entire document
when `interceptWheel` is `true`. However, you may still manually add a wheel
event listener to elements that should remain scrollable:

```typescript
const scrollContainer = document.querySelector('.my-scroll-container')
scrollContainer.addEventListener('wheel', function (e) {
  if (e.ctrlKey || e.metaKey) {
    // Return here so that the event is handled by the wheel plugin.
    return
  }

  // Stop the event from bubbling up to the event listener of the plugin.
  // That way the element can be scrolled.
  e.stopPropagation()
})
```

## Multiple artboard instances

When using multiple artboard instances on the same page, you can't set
`interceptWheel` on all of them because it would result in all artboards
scrolling or zooming simultaneously. You have two options to fix this:

### Make one artboard the "main" one

By setting `interceptWheel: true` on only one artboard you can promote one
artboard instance to be the "main" one that will scroll or zoom by default.

### Don't use `interceptWheel`

In this scenario no scrolling or zooming on any artboard will occur unless the
mouse pointer is inside the root element.

To prevent the default zooming behaviour of the browser you can manually prevent
it like this:

```typescript
document.addEventListener('wheel', function (e) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    return
  }
})
```

## Nested artboards

If you want to implement nested artboards, set `interceptWheel` on the **root
artboard**.
