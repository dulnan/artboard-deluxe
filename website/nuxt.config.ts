import packageJson from './../package.json'
import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    'nuxt-svg-icon-sprite',
    'nuxt-schema-org',
  ],
  ssr: true,

  site: {
    title: 'Artboard Deluxe',
    description: 'Modular TypeScript artboard library',
    indexable: true,
    trailingSlash: false,
    url: 'https://artboard-deluxe.dulnan.net',
  },

  schemaOrg: {
    reactive: false,
  },

  runtimeConfig: {
    public: {
      version: packageJson.version,
    },
  },

  tailwindcss: {
    cssPath: './app/assets/css/tailwind.css',
  },

  alias: {
    'artboard-deluxe': fileURLToPath(
      new URL('./../src/index.ts', import.meta.url),
    ),
    '#library': fileURLToPath(new URL('./../src', import.meta.url)),
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
      meta: [
        {
          property: 'og:image',
          content: '/og.jpg',
        },
      ],
    },
  },

  svgIconSprite: {
    sprites: {
      default: {
        importPatterns: ['./app/assets/icons-pixel/**/*.svg'],
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
