import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/flume/',
  plugins: [vue()],
  server: {
    port: 8101,
    open: true
  }
})
