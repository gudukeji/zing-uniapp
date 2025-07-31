import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni()
  ],

  // 确保Vite构建生效
  build: {
    minify: 'terser'
  },

  // 开发服务器配置
  server: {
    port: 3000,
    host: '0.0.0.0',
    // 修复Windows文件监听问题
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/unpackage/**']
    }
  }
})
