# Getting Started

```bash
npm install --save artboard-deluxe
```

## Minimal example

```html
<div id="root">
  <div id="artboard">Hello World!</div>
</div>

<style>
  #root {
    position: relative;
    width: 500px;
    height: 500px;
  }

  #artboard {
    background: white;
  }
</style>

<script>
  import { createArtboard, dom, mouse, wheel, raf } from 'artboard-deluxe'

  const artboard = createArtboard(document.getElementById('root'), [
    dom({ element: document.getElementById('artboard') }),
    mouse(),
    wheel(),
    raf(),
  ])
</script>
```
