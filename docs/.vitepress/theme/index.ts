import DefaultTheme from 'vitepress/theme'
import CodePen from './components/CodePen.vue'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx)
    ctx.app.component('CodePen', CodePen)
  },
}
