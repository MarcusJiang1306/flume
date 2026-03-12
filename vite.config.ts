import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Flume',
      fileName: (format) => `flume.${format}.js`,
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      external: ['vue', 'pinia', '@vue-flow/core', '@vue-flow/background', '@vue-flow/controls', 'dagre'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia',
          '@vue-flow/core': 'VueFlowCore',
          '@vue-flow/background': 'VueFlowBackground',
          '@vue-flow/controls': 'VueFlowControls',
          dagre: 'dagre'
        }
      }
    }
  },
  server: {
    port: 8101,
    open: true
  }
})
