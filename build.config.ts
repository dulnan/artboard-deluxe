import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  replace: {
    'import.meta.dev': 'undefined',
  },
  // If entries is not provided, will be automatically inferred from package.json
  entries: [
    {
      input: './src/index',
      outDir: './dist',
    },
  ],

  outDir: 'dist',

  rollup: {
    emitCJS: true,
    esbuild: {
      minify: false,
    },
  },

  // Generates .d.ts declaration file
  declaration: true,
})
