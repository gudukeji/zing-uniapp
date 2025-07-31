// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 主题设置（需要持久化）
    theme: {
      mode: 'light', // light | dark
      primaryColor: '#007AFF'
    },

    // 全局加载状态（需要跨组件共享）
    loading: {
      global: false
    }
  }),

  getters: {
    // 是否为暗黑模式
    isDarkMode: (state) => state.theme.mode === 'dark',

    // 全局是否加载中
    isGlobalLoading: (state) => state.loading.global,

    // 以下getter提供便捷的系统信息访问（不存储状态）
    systemInfo: () => uni.getSystemInfoSync(),

    // 是否为移动端
    isMobile: () => {
      const platform = uni.getSystemInfoSync().platform
      return ['ios', 'android'].includes(platform)
    },

    // 安全区域高度
    safeAreaHeight: () => {
      const systemInfo = uni.getSystemInfoSync()
      return (systemInfo.statusBarHeight || 20) + 44
    }
  },

  actions: {
    // 设置主题
    setTheme(theme) {
      this.theme = { ...this.theme, ...theme }

      // 同步到本地存储
      uni.setStorageSync('app_theme', this.theme)
    },

    // 切换主题模式
    toggleThemeMode() {
      this.theme.mode = this.theme.mode === 'light' ? 'dark' : 'light'
      this.setTheme(this.theme)
    },

    // 设置全局加载状态
    setGlobalLoading(loading) {
      this.loading.global = loading
    },

    // 从本地存储初始化
    initFromStorage() {
      try {
        // 恢复主题设置
        const theme = uni.getStorageSync('app_theme')
        if (theme) {
          this.theme = { ...this.theme, ...theme }
        }
      } catch (error) {
        console.warn('从本地存储初始化应用状态失败:', error)
      }
    },

    // 重置应用状态
    reset() {
      this.theme = {
        mode: 'light',
        primaryColor: '#007AFF'
      }
      this.loading = {
        global: false
      }
      uni.removeStorageSync('app_theme')
    }
  }
})
