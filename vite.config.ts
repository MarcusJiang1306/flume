import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'merge-styles',
      writeBundle() {
        const distDir = resolve(__dirname, 'dist')
        
        // 读取 Vue Flow 的样式文件
        const coreStyles = readFileSync(
          resolve(__dirname, 'node_modules/@vue-flow/core/dist/style.css'),
          'utf-8'
        )
        const controlsStyles = readFileSync(
          resolve(__dirname, 'node_modules/@vue-flow/controls/dist/style.css'),
          'utf-8'
        )
        
        // 合并样式
        const mergedStyles = `
/* Vue Flow Core Styles */
${coreStyles}

/* Vue Flow Controls Styles */
${controlsStyles}
        `.trim()
        
        // 写入合并后的样式文件
        writeFileSync(resolve(distDir, 'flume.css'), mergedStyles)
      }
    }
  ],
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
    },
    copyPublicDir: true
  },
  server: {
    port: 8101,
    open: true
  }
})