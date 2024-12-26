import DefaultTheme from 'vitepress/theme'
import CodePen from './components/CodePen.vue'
import Origins from './components/Origins.vue'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx)
    ctx.app.component('CodePen', CodePen)
    ctx.app.component('Origins', Origins)
  },
}
