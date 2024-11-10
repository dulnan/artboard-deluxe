import packageJson from './../package.json'
import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss', 'nuxt-svg-icon-sprite'],
  ssr: true,

  runtimeConfig: {
    public: {
      version: packageJson.version,
    },
  },

  alias: {
    'artboard-deluxe': fileURLToPath(
      new URL('./../src/index.ts', import.meta.url),
    ),
  },

  watch: [fileURLToPath(new URL('./../src/', import.meta.url))],

  vite: {
    server: {
      watch: {
        usePolling: true,
      },
    },
  },

  rootDir: './website',

  app: {
    head: {
      title: 'Artboard Deluxe',
      script: [
        {
          innerHTML: `
document.documentElement.style.setProperty("--init-window-width", window.innerWidth);
`,
        },
      ],
    },
  },

  svgIconSprite: {
    sprites: {
      default: {
        importPatterns: ['./assets/icons-pixel/**/*.svg'],
      },
    },
  },

  typescript: {
    tsConfig: {
      include: [
        './../node_modules/@kayahr/aseprite/lib/main/aseprite.json.d.ts',
      ],
    },
  },

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/', '/404.html', '/playground', '/2d-canvas'],
    },
  },
})
