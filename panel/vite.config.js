import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: '../panel_web',  // 确保输出到正确目录
    assetsDir: 'assets',     // 静态资源目录
    emptyOutDir: true        // 清空输出目录
  }
})
