<template>
  <details class="plugin-options border-b border-b-gray-400" :open="open">
    <summary
      class="font-sans text-[30px] leading-none select-none cursor-pointer p-16 font-bold"
    >
      <div class="flex items-center justify-between">{{ name }}</div>
    </summary>
    <div class="grid p-16">
      <div v-for="option in options" :key="option.title" class="plugin-option">
        <InputCheckbox
          v-if="option.type === 'boolean'"
          v-bind="option"
          :default-value="pluginOptions[option.title]"
          @update="setValue(option.title, $event)"
        />
        <InputRange
          v-else-if="option.type === 'range'"
          v-bind="option"
          :default-value="pluginOptions[option.title]"
          @update="setValue(option.title, $event)"
        />
        <InputAnimation
          v-else-if="option.type === 'animation'"
          v-bind="option"
          :default-value="pluginOptions[option.title]"
          @update="setValue(option.title, $event)"
        />
        <InputVelocity
          v-else-if="option.type === 'velocity'"
          v-bind="option"
          :default-value="pluginOptions[option.title]"
          @update="setValue(option.title, $event)"
        />
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-explicit-any: 0 */
import type { PluginOption } from '~/helper/pluginOptions'
import type { Artboard, ArtboardPluginDefinition } from '#library/types'

const props = defineProps<{
  name: string
  plugin:
    | ArtboardPluginDefinition<any, any>
    | null
    | Array<ArtboardPluginDefinition<any, any> | null>
    | Artboard
  options: PluginOption[]
  open?: boolean
}>()

let timeout: number | null = null

function persist() {
  if (timeout) {
    window.clearTimeout(timeout)
  }

  timeout = window.setTimeout(() => {
    localStorage.setItem('options_' + props.name, JSON.stringify(pluginOptions))
  }, 500)
}

function getPersistedOptions(): Record<string, any> {
  try {
    const data = localStorage.getItem('options_' + props.name)
    if (data) {
      return JSON.parse(data)
    }
  } catch {
    // Noop.
  }

  return {}
}

const persistedOptions = getPersistedOptions()

const pluginOptions: Record<string, any> = props.options.reduce<
  Record<string, any>
>((acc, v) => {
  const persisted = persistedOptions[v.title]
  const value =
    persisted !== undefined && persisted !== null ? persisted : v.defaultValue
  acc[v.title] = value
  return acc
}, {})

function updateOptions() {
  const plugins = Array.isArray(props.plugin) ? props.plugin : [props.plugin]
  plugins.forEach((plugin) => {
    if (plugin) {
      Object.entries(pluginOptions).forEach(([property, value]) => {
        // @ts-ignore
        plugin.options.set(property, value)
      })
    }
  })

  persist()
}

function setValue(title: string, value: any) {
  pluginOptions[title] = value
  updateOptions()
}

onMounted(() => {
  if (props.plugin) {
    updateOptions()
  }
})
</script>

<style lang="postcss">
.plugin-option {
  @apply pb-16 mb-16 border-b-[4px] border-b-white;
  border-bottom-style: groove;

  &:last-child {
    border-bottom: 0px;
    margin-bottom: 0;
    padding-bottom: 0px;
  }
}

.plugin-options {
  summary {
    &::-webkit-details-marker,
    &::marker {
      @apply hidden;
      content: '';
    }

    div {
      &:after {
        content: '+';
        @apply block;
      }
    }
  }

  &[open] {
    summary {
      div {
        &:after {
          content: '-';
        }
      }
    }
  }
}
</style>
