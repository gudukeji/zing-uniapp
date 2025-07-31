// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import { createPinia } from 'pinia'

// 创建pinia实例
const pinia = createPinia()

// 添加优化的持久化插件
pinia.use(({ store }) => {
  // 定义需要持久化的字段（只保留简化后的字段）
  const persistFields = {
    user: ['userInfo', 'isLogin', 'token'],
    app: ['theme']
  }

  // 防抖保存函数
  let saveTimer = null
  const debouncedSave = (storeId, data) => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      try {
        // 只保存必要的字段，减少存储空间
        const fieldsToSave = persistFields[storeId] || []
        const dataToSave = {}

        fieldsToSave.forEach(field => {
          if (data[field] !== undefined) {
            dataToSave[field] = data[field]
          }
        })

        uni.setStorageSync(`pinia_${storeId}`, JSON.stringify(dataToSave))
      } catch (error) {
        console.warn('Pinia持久化失败:', error)
        // 存储空间不足时，清理旧数据
        if (error.name === 'QuotaExceededError') {
          try {
            uni.removeStorageSync(`pinia_${storeId}`)
            console.log('已清理存储空间，请重新操作')
          } catch (e) {
            console.warn('清理存储失败:', e)
          }
        }
      }
    }, 1000) // 1秒防抖
  }

  // 监听状态变化，防抖保存
  if (store.$id === 'user' || store.$id === 'app') {
    store.$subscribe((mutation, state) => {
      debouncedSave(store.$id, state)
    })
  }

  // 从本地存储恢复状态
  if (store.$id === 'user' || store.$id === 'app') {
    try {
      const savedState = uni.getStorageSync(`pinia_${store.$id}`)
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        store.$patch(parsedState)
      }
    } catch (error) {
      console.warn('Pinia状态恢复失败:', error)
      // 如果恢复失败，清理损坏的数据
      try {
        uni.removeStorageSync(`pinia_${store.$id}`)
      } catch (e) {
        console.warn('清理损坏数据失败:', e)
      }
    }
  }
})

export default pinia
