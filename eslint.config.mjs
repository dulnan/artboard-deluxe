import withNuxt from './website/.nuxt/eslint.config.mjs'
import tailwind from 'eslint-plugin-tailwindcss'

export default withNuxt([
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        config: './tailwind.config.ts',
      },
    },
  },
])
  .override('nuxt/vue/rules', {
    rules: {
      'vue/no-v-html': 0,
      'vue/no-empty-component-block': 'error',
      'vue/padding-line-between-blocks': 'error',
      'vue/no-v-for-template-key': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/component-api-style': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts',
          },
        },
      ],
      'vue/block-order': [
        'error',
        {
          order: [['script', 'template'], 'style'],
        },
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
          },
        },
      ],
      'vue/no-deprecated-slot-attribute': [
        'error',
        {
          ignore: [],
        },
      ],
    },
  })
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  })
  .override('tailwindcss:rules', {
    rules: {
      'tailwindcss/classnames-order': 'off',
      'tailwindcss/no-custom-classname': 'off',
    },
  })
