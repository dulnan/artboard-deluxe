import { defineConfig } from 'vitepress'
import container from 'markdown-it-container';
import { renderSandbox } from 'vitepress-plugin-sandpack';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Artboard",
  description: "Artboard Documentation",
  base: '/docs',
  outDir: './../website/.output/public/docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: 'https://artboard-deluxe.dulnan.net' },
      { text: 'Reference', link: 'https://artboard-deluxe.dulnan.net/reference' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        link: '/',
      },
      {
        text: 'Create Artboard',
        items: [
          { text: 'createArtboard', link: '/create-artboard/basics' },
          { text: 'DOM', link: '/create-artboard/dom' },
          { text: 'Canvas (2D / WebGL)', link: '/create-artboard/canvas' }
        ]
      },
      {
        text: 'Plugins',
        items: [
          { text: 'clickZoom', link: '/plugins/click-zoom' },
          { text: 'dom', link: '/plugins/dom' },
          { text: 'doubleTapZoom', link: '/plugins/double-tap-zoom' },
          { text: 'keyboard', link: '/plugins/keyboard' },
          { text: 'mouse', link: '/plugins/mouse' },
          { text: 'overview', link: '/plugins/overview' },
          { text: 'raf', link: '/plugins/raf' },
          { text: 'scrollbar', link: '/plugins/scrollbar' },
          { text: 'touch', link: '/plugins/touch' },
          { text: 'wheel', link: '/plugins/wheel' },
        ]
      },
      {
        text: 'Advanced',
        items: [
          { text: 'Updating Options', link: '/advanced/updating-options' },
          { text: 'Writing a Plugin', link: '/advanced/writing-a-plugin' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/dulnan/dragboard' }
    ]
  },
  markdown: {
    config(md) {
      md
        // the second parameter is html tag name
        .use(container, 'sandbox', {
          render (tokens, idx) {
            return renderSandbox(tokens, idx, 'sandbox');
          },
        });
    },
  },
})
