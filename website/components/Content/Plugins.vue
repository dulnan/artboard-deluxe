<template>
  <section class="section pb-0 relative z-50">
    <h2>Plugins</h2>

    <div class="grid grid-cols-9 gap-x-16">
      <button
        v-for="plugin in plugins"
        :key="plugin.title"
        @click="activePluginId = plugin.name"
      >
        <div
          class="aspect-square flex items-center justify-center image-icon"
          :class="
            plugin.name === activePluginId
              ? 'bg-secondary'
              : 'bg-secondary/10 hover:bg-secondary/20'
          "
        >
          <div>
            <SpriteSymbol
              :name="plugin.icon"
              class="size-[42px]"
              :class="
                plugin.name === activePluginId ? 'text-white' : 'text-secondary'
              "
            />
          </div>
        </div>
        <h3 class="font-sans font-bold text-xl mt-8 text-center leading-none">
          <span>{{ plugin.title }}</span>
        </h3>
      </button>
    </div>

    <div v-if="activePlugin" class="mt-32 grid grid-cols-9 gap-16">
      <div class="col-span-5">
        <h3 class="font-sans text-4xl text-primary font-bold leading-[48px]">
          {{ activePlugin.titleLong }}
        </h3>
        <p class="font-sans text-3xl text-stone-700 font-bold">
          {{ activePlugin.text }}
        </p>

        <ul class="flex gap-16 text-xl my-32">
          <li>
            <a :href="getSourceLink(activePlugin.name)" class="link text-xl"
              >Source</a
            >
          </li>
          <li>
            <a :href="getDocsLink(activePlugin.name)" class="link text-xl"
              >Docs</a
            >
          </li>
        </ul>
      </div>

      <div class="code col-span-4 border-image-draw p-8">
        <code
          class="whitespace-pre"
          v-text="getMarkup(activePlugin.name, activePlugin.options)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { NuxtSvgSpriteSymbol } from '#nuxt-svg-sprite/runtime'

type Plugin = {
  title: string
  titleLong: string
  name: string
  text: string
  icon: NuxtSvgSpriteSymbol
  options?: Record<string, string>
  isPrimary?: boolean
}

const plugins: Plugin[] = [
  {
    title: 'Scrollbar',
    titleLong: 'Scrollbar',
    name: 'scrollbar',
    text: 'Renders a horizontal or vertical scrollbar.',
    icon: 'scrollbar',
    options: {
      element: 'scrollbarElement',
      orientation: `'x'`,
    },
  },
  {
    title: 'Overview',
    titleLong: 'Overview',
    name: 'overview',
    text: 'Renders an overview pane of the viewport and artboard.',
    icon: 'plugin-overview',
    options: {
      element: 'overviewElement',
    },
  },
  {
    title: 'Keyboard',
    titleLong: 'Keyboard Shortcuts',
    name: 'keyboard',
    icon: 'keyboard',
    text: 'Interact with the artboard using the keyboard.',
  },
  {
    title: 'Mouse',
    titleLong: 'Mouse Interactions',
    name: 'mouse',
    text: 'Use the mouse to move the artboard.',
    icon: 'cursor',
    options: {
      setCursor: 'true',
      noSpaceBar: 'true',
    },
  },
  {
    title: 'Touch',
    titleLong: 'Touch Interactions',
    name: 'touch',
    icon: 'pinch-to-zoom',
    text: 'Use touch gestures to move and zoom the artboard.',
  },
  {
    title: 'DOM',
    titleLong: 'DOM Element as Artboard',
    name: 'dom',
    text: 'Use a DOM element as the artboard.',
    icon: 'dom',
    options: {
      element: 'artboardElement',
    },
  },
  {
    title: 'Wheel',
    titleLong: 'Mouse Wheel for Scrolling and Zooming',
    name: 'wheel',
    icon: 'mouse',
    text: 'Use the mouse wheel to scroll and zoom.',
  },

  {
    title: 'Click to Zoom',
    titleLong: 'Click to Zoom',
    name: 'clickZoom',
    icon: 'click',
    text: 'Click on the artboard to zoom in and out.',
  },
  {
    title: 'Double Tap',
    titleLong: 'Double Tap to Zoom',
    name: 'doubleTapZoom',
    icon: 'tap',
    text: 'Double tap on the artboard to zoom in and out.',
  },
].map((plugin, index) => {
  return {
    ...plugin,
    icon: plugin.icon as NuxtSvgSpriteSymbol,
    isPrimary: index % 2 === 0,
  } as Plugin
})

const activePluginId = useState('activePluginId', () => plugins[0].name)

const activePlugin = computed(() => {
  if (!activePluginId.value) {
    return
  }

  return plugins.find((v) => v.name === activePluginId.value)
})

function getSourceLink(name: string) {
  return `https://www.github.com/dulnan/artboard-deluxe/blob/main/src/plugins/${name}/index.ts`
}

function getDocsLink(name: string) {
  return `/docs/plugins/${name}`
}

function getPluginInit(name: string, options?: Record<string, string>) {
  if (!options) {
    return `${name}()`
  }
  const optionsStrings: string[] = []
  Object.entries(options).forEach(([property, value]) => {
    optionsStrings.push(`${property}: ${value}`)
  })

  const joined = optionsStrings.join(',\n      ')

  return `${name}({\n      ${joined}\n    })`
}

function getMarkup(name: string, options?: Record<string, string>) {
  const pluginInit = getPluginInit(name, options)
  return `import { 
  createArtboard, 
  ${name} 
} from 'artboard-deluxe'

const artboard = createArtboard(
  rootElement, 
  [
    ${pluginInit}
  ]
)`
}
</script>
