<template>
  <div class="error-page font-ms">
    <div class="p-[30px]">
      <div class="flex gap-24">
        <div class="shrink-0">
          <img src="~/assets/info.png" width="48" />
        </div>
        <h1 class="text-[32px] leading-[40px]">{{ title }}</h1>
      </div>

      <div class="text-[22px] leading-[30px] max-w-screen-md tracking-[3px]">
        <p v-if="text" class="mt-40">{{ text }}</p>
        <hr class="bg-silver h-[5px] mt-32" />

        <template v-if="error.statusCode === 404">
          <p class="mt-[56px]">Please try the following:</p>
          <ul class="mt-[37px]">
            <li>
              If you typed the page address in the Address bar, make sure that
              it is spelled correctly.
            </li>
            <li>
              <div>
                Open the
                <a href="/">artboard-deluxe.dulnan.net</a>
                home page, and then look for links to the information you want.
              </div>
            </li>
            <li>
              <div>
                Click the
                <a href="javascript:history.back()"
                  ><img src="~/assets/back.png" />Back</a
                >
                button to try another link.
              </div>
            </li>
            <li>
              <div>
                Click
                <a href="https://www.frogfind.com/"
                  ><img src="~/assets/search.png" />Search</a
                >
                to look for information on the Internet.
              </div>
            </li>
          </ul>
        </template>
        <template v-else>
          <p class="mt-[56px]">{{ error.statusMessage }}</p>
          <div class="mt-[56px]" v-html="error.stack" />
        </template>
        <p class="mt-[72px]">
          HTTP {{ error.statusCode }} {{ bottomText }}<br />
          Internet Explorer
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const bottomText = computed(() => {
  if (props.error.statusCode === 404) {
    return '- File not found'
  }

  return ''
})

const title = computed(() => {
  if (props.error.statusCode === 404) {
    return 'The page cannot be found'
  }

  return props.error.name || props.error.statusMessage
})

const text = computed(() => {
  if (props.error.statusCode === 404) {
    return 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'
  }

  return ''
})
</script>

<style lang="postcss">
.error-page {
  ul {
    @apply list-disc;

    li {
      @apply flex ml-[48px] gap-[20px];
      > div {
        flex: 1;
      }
      &:before {
        content: '';
        flex: 0 0 auto;
        @apply size-[13px] mt-[6px];
        background-image: url('~/assets/bullet.png');
        background-size: 100% 100%;
      }
    }
  }

  a {
    color: red;
    @apply underline underline-offset-[6px] decoration-2;

    img {
      @apply size-[32px] mb-[-5px] inline-block mr-[10px];
    }
  }
}
</style>
