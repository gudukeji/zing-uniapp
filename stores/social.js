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

export const useSocialStore = defineStore('social', {
  state: () => ({
    // 发布状态（需要跨页面共享）
    publishStatus: {
      isPublishing: false,
      progress: 0,
      error: null
    }
  }),

  getters: {
    // 是否正在发布
    isPublishing: (state) => state.publishStatus.isPublishing,

    // 发布进度
    publishProgress: (state) => state.publishStatus.progress,

    // 发布错误信息
    publishError: (state) => state.publishStatus.error
  },

  actions: {
    // 设置发布状态
    setPublishStatus(status) {
      this.publishStatus = { ...this.publishStatus, ...status }
    },

    // 开始发布
    startPublish() {
      this.publishStatus = {
        isPublishing: true,
        progress: 0,
        error: null
      }
    },

    // 更新发布进度
    updatePublishProgress(progress) {
      this.publishStatus.progress = progress
    },

    // 发布成功
    publishSuccess() {
      this.publishStatus = {
        isPublishing: false,
        progress: 100,
        error: null
      }
    },

    // 发布失败
    publishError(error) {
      this.publishStatus = {
        isPublishing: false,
        progress: 0,
        error
      }
    },

    // 重置发布状态
    resetPublishStatus() {
      this.publishStatus = {
        isPublishing: false,
        progress: 0,
        error: null
      }
    }
  }
})
