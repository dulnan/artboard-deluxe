<template>
  <section class="relative overflow-hidden section-usage section-border">
    <div class="section relative z-30">
      <h2>Usage</h2>

      <div class="grid grid-cols-3 gap-32 items-stretch">
        <div class="code col-span-2 border-image-draw p-32">
          <code class="whitespace-pre" v-text="markup" />
        </div>
        <aside class="text-xl">
          <ol class="ordered-list">
            <li>npm install --save artboard-deluxe</li>
            <li>Wrap the artboard element in a root element</li>
            <li>Create Artboard instance</li>
          </ol>
        </aside>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
const markup = `<div id="root">
  <div id="artboard">Hello World!</div>
</div>

<script>
import { 
  createArtboard,
  dom,
  mouse,
  wheel,
  raf
} from 'artboard-deluxe'

const artboard = createArtboard(
  document.getElementById('root'),
  [
    dom({ element: document.getElementById('artboard') }),
    mouse(),
    wheel(),
    raf()
  ]
)
</${'script'}>

<style>
#root {
  position: relative;
  width: 500px;
  height: 500px;
}
</style>`
</script>

<style lang="postcss">
.table {
  @apply text-left;

  tr {
    @apply border-b border-b-stone-400 border-dashed;
  }

  td,
  th {
    @apply pt-32 pb-[31px] align-top min-h-[96px];
  }

  div {
    @apply text-xl;
  }
}

.ordered-list {
  counter-reset: ol;

  li {
    @apply relative pl-48 mb-32;
    &:before {
      counter-increment: ol;
      content: counter(ol);
      @apply absolute left-0 top-[-4px] bg-primary;
      color: white;
      width: 32px;
      height: 32px;
      text-align: center;
      font-weight: bold;
      line-height: 10px;
      padding-top: 13px;
      border-radius: 10px;
      font-size: 0.8em;
      background-image: url('~/assets/circle.png');
      background-size: 32px 32px;
    }

    &:nth-child(1):before {
      @apply pr-[2px];
    }

    &:nth-child(4):before {
      @apply pr-[2.5px];
    }
  }
}
</style>
