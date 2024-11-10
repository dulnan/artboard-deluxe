import { defineArtboardPlugin, inlineStyleOverrider } from 'artboard-deluxe'

export const zoomOverlay = defineArtboardPlugin<{
  element: HTMLElement
  fontSize?: number
}>(function (artboard, options) {
  const element = options.getRequired('element')

  const styles = inlineStyleOverrider(element)
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
    destroy() {
      styles.restore()
    },
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
