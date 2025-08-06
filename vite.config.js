import { defineConfig } from 'vite'
import { resolve } from 'path'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni()
  ],

  // 路径解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@/components': resolve(__dirname, 'components'),
      '@/utils': resolve(__dirname, 'utils'),
      '@/api': resolve(__dirname, 'api'),
      '@/stores': resolve(__dirname, 'stores'),
      '@/pages': resolve(__dirname, 'pages'),
      '@/static': resolve(__dirname, 'static')
    }
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/uni.scss";`,
        charset: false
      }
    }
  },

  // 构建配置
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 构建目标
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 资源内联阈值
    assetsInlineLimit: 4096
  },

  // 开发服务器配置
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: false,
    cors: true,
    // 修复Windows文件监听问题
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/unpackage/**']
    }
  },

  // 依赖优化
  optimizeDeps: {
    include: [
      'vue',
      'vuex',
      'pinia',
      'vue-i18n'
    ]
  },

  // 环境变量配置
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __UNI_FEATURE_PROMISE__: false
  }
})
