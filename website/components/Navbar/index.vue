<template>
  <header class="border-b border-b-black flex items-center">
    <NuxtLink to="/" class="text-[20px] font-alliance leading-none px-16 hidden md:block">
      <span class="text-primary">Artboard</span>
      <span class="text-secondary">Deluxe</span>
    </NuxtLink>
    <nav class="flex h-full">
      <NuxtLink
        v-for="link in links"
        :key="link.title"
        :to="link.path"
        class="navbar-link"
        :class="{
          '!text-black': link.active,
        }"
        >{{ link.title }}</NuxtLink
      >
    </nav>

    <aside class="ml-auto flex items-center">
      <a href="/docs" class="navbar-link" target="_blank">Docs</a>
      <a
        href="https://www.github.com/dulnan/artboard-deluxe"
        class="navbar-link"
        target="_blank"
        >GitHub</a
      >
    </aside>
  </header>
</template>

<script setup lang="ts">
type MenuLink = {
  path: string
  title: string
  active: boolean
}

const route = useRoute()

function defineLink(path: string, title: string): MenuLink {
  return { path, title, active: path === route.path }
}

const links = computed(() => {
  return [
    defineLink('/', 'DOM Rendering'),
    defineLink('/2d-canvas', '2D Canvas'),
    defineLink('/playground', 'Playground'),
  ]
})
</script>

<style lang="postcss">
.navbar-link {
  @apply whitespace-nowrap px-8 md:px-16;
  @apply h-32 md:h-48;
  @apply flex font-sans md:text-lg lg:text-xl font-bold leading-none  items-center  text-stone-500 hover:text-stone-700;
}
</style>
