<template>
  <view class="container">
    <view class="title-box">
      <view>隐私与显示设置 🔏️</view>
    </view>
    
    <view class="table">隐私设置</view>
    <view class="list-box">
      <view class="list df">
        <image class="icon" src="/static/img/setting/101.png"></image>
        <view class="list-item df bb1">
          <view class="title">
            <view class="t1">允许别人查看我的粉丝</view>
            <view class="t2">他人是否可以查看我的粉丝列表</view>
          </view>
          <switch :checked="!!privacySettings.showFans" @change="switchPrivacy('showFans')" color="#000" style="transform:scale(0.8)"/>
        </view>
      </view>
      
      <view class="list df">
        <image class="icon" src="/static/img/setting/102.png"></image>
        <view class="list-item df bb1">
          <view class="title">
            <view class="t1">允许别人查看我的关注</view>
            <view class="t2">他人是否可以查看我的关注列表</view>
          </view>
          <switch :checked="!!privacySettings.showFollows" @change="switchPrivacy('showFollows')" color="#000" style="transform:scale(0.8)"/>
        </view>
      </view>

      <view class="list df">
        <image class="icon" src="/static/img/setting/103.png"></image>
        <view class="list-item df bb1">
          <view class="title">
            <view class="t1">允许别人查看我的访客</view>
            <view class="t2">他人是否可以查看谁访问过我的主页</view>
          </view>
          <switch :checked="!!privacySettings.showVisitors" @change="switchPrivacy('showVisitors')" color="#000" style="transform:scale(0.8)"/>
        </view>
      </view>

      <view class="list df">
        <image class="icon" src="/static/img/setting/104.png"></image>
        <view class="list-item df">
          <view class="title">
            <view class="t1">允许被搜索到</view>
            <view class="t2">是否允许其他用户通过搜索找到我</view>
          </view>
          <switch :checked="!!privacySettings.allowSearch" @change="switchPrivacy('allowSearch')" color="#000" style="transform:scale(0.8)"/>
        </view>
      </view>
    </view>
    
    <view class="table">瀑布流设置</view>
    <view class="list-box">
      <view class="list df">
        <image class="icon" src="/static/img/setting/201.png"></image>
        <view class="list-item df bb1">
          <view class="title">
            <view class="t1">动态瀑布流</view>
            <view class="t2">首页是否显示动态瀑布流</view>
          </view>
          <switch :checked="!!flowSettings.dynamicFlow" @change="switchFlow('dynamicFlow')" color="#000" style="transform:scale(0.8)"/>
        </view>
      </view>

      <view class="list df">
        <image class="icon" src="/static/img/setting/202.png"></image>
        <view class="list-item df">
          <view class="title">
            <view class="t1">圈子瀑布流</view>
            <view class="t2">圈子页面是否显示瀑布流布局</view>
          </view>
          <switch :checked="!!flowSettings.circleFlow" @change="switchFlow('circleFlow')" color="#000" style="transform:scale(0.8)"/>
        </view>
      </view>
    </view>
    
    <view class="description-box">
      <view class="description-title">关于瀑布流布局</view>
      <view class="description-content">
        瀑布流布局是一种多列布局，内容按照从上到下、从左到右的顺序进行排列。它能够更好地展示图片内容，提高浏览效率，但也会消耗更多的流量。
      </view>
    </view>
       <!-- #ifdef MP -->   
    <view class="table">其他</view>
    <view class="list-box">
      <button class="list df" open-type="openSetting">
        <image class="icon" src="/static/img/setting/105.png"></image>
        <view class="list-item df bb1">
          <view class="title">
            <view class="t1">系统权限</view>
          </view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>
    </view>
          <!-- #endif -->
    
    <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
      <view class="tips-box df">
        <view class="tips-item">{{uiState.tipsTitle}}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useStore } from 'vuex'
import navbar from '@/components/navbar/navbar.vue'
import { updatePrivacySettings, updateFlowSettings } from '@/api/social.js'

// uni-popup 通过 easycom 自动导入，无需手动导入

// 获取 store 实例
const store = useStore()

// 响应式数据
const statusBarHeight = computed(() => store.state.statusBarHeight || 20)
const titleBarHeight = computed(() => store.state.titleBarHeight || 44)

const privacySettings = reactive({
  showFans: 1,
  showFollows: 1,
  showVisitors: 1,
  allowSearch: 1,
  showPhone: 1
})

const flowSettings = reactive({
  dynamicFlow: true,
  circleFlow: true
})

// UI状态管理
const uiState = reactive({
  tipsTitle: "",
  privacyLoading: false,
  flowLoading: false
})

// 弹窗引用
const tipsPopup = ref(null)

// 防抖定时器
const debounceTimers = reactive({
  privacy: null,
  flow: null
})

// 防抖处理方法
const debounce = (func, delay = 300, timerKey = 'default') => {
  if (debounceTimers[timerKey]) {
    clearTimeout(debounceTimers[timerKey])
  }

  debounceTimers[timerKey] = setTimeout(() => {
    func()
    debounceTimers[timerKey] = null
  }, delay)
}

// 统一的错误处理方法
const handleError = (error, context = '操作') => {
  console.error(`${context}失败:`, error)

  let message = `${context}失败，请稍后重试`
  if (error.message) {
    message = error.message
  } else if (error.msg) {
    message = error.msg
  }

  showTip(message)
}

// 显示提示信息
const showTip = (msg) => {
  uiState.tipsTitle = msg
  tipsPopup.value.open()

  setTimeout(() => {
    tipsPopup.value.close()
  }, 2000)
}

// 优化的缓存解析方法
const getUserInfoFromCache = () => {
  try {
    let userInfo = uni.getStorageSync('USER_INFO') || {}

    // 如果缓存返回字符串，先解析它
    if (typeof userInfo === 'string') {
      userInfo = JSON.parse(userInfo)
    }

    // 确保返回的是对象
    return typeof userInfo === 'object' && userInfo !== null ? userInfo : {}
  } catch (e) {
    console.error('解析USER_INFO缓存失败:', e)
    return {}
  }
}

// 安全的JSON解析方法
const safeJsonParse = (data, defaultValue = {}) => {
  try {
    if (typeof data === 'string') {
      return JSON.parse(data)
    } else if (typeof data === 'object' && data !== null) {
      return data
    }
    return defaultValue
  } catch (e) {
    console.error('JSON解析失败:', e)
    return defaultValue
  }
}

// 从本地缓存加载配置 - 优先使用新字段格式
const loadFromCache = () => {
  try {
    // 获取本地存储的用户信息
    const userInfo = getUserInfoFromCache()
    console.log('从缓存加载用户信息:', userInfo)

    // 优先从新字段格式读取隐私设置
    if (userInfo.show_fans !== undefined || userInfo.show_follows !== undefined) {
      // 使用新的字段格式，确保转换为整型
      privacySettings.showFans = parseInt(userInfo.show_fans) || 1
      privacySettings.showFollows = parseInt(userInfo.show_follows) || 1
      privacySettings.showVisitors = parseInt(userInfo.show_visitors) || 1
      privacySettings.allowSearch = parseInt(userInfo.allow_search) || 1
      privacySettings.showPhone = parseInt(userInfo.show_phone) || 1

      console.log('从新字段格式加载隐私设置:', privacySettings)
    } else if (userInfo.privacy_settings) {
      // 兼容旧的JSON格式
      const cachedPrivacySettings = safeJsonParse(userInfo.privacy_settings, {})
      if (Object.keys(cachedPrivacySettings).length > 0) {
        // 确保转换为整型
        privacySettings.showFans = parseInt(cachedPrivacySettings.showFans) || 1
        privacySettings.showFollows = parseInt(cachedPrivacySettings.showFollows) || 1
        privacySettings.showVisitors = parseInt(cachedPrivacySettings.showVisitors) || 1
        privacySettings.allowSearch = parseInt(cachedPrivacySettings.allowSearch) || 1
        privacySettings.showPhone = parseInt(cachedPrivacySettings.showPhone) || 1
        console.log('从旧格式加载隐私设置:', privacySettings)
      }
    } else {
      console.log('缓存中没有隐私设置，使用默认值')
    }

    // 优先从新字段格式读取瀑布流设置
    if (userInfo.dynamic_flow !== undefined || userInfo.circle_flow !== undefined) {
      // 使用新的字段格式，转换为前端使用的布尔值
      flowSettings.dynamicFlow = userInfo.dynamic_flow === 1
      flowSettings.circleFlow = userInfo.circle_flow === 1

      console.log('从新字段格式加载瀑布流设置:', flowSettings)
    } else if (userInfo.flow_settings) {
      // 兼容旧的JSON格式
      const cachedFlowSettings = safeJsonParse(userInfo.flow_settings, {})
      if (Object.keys(cachedFlowSettings).length > 0) {
        const normalizedSettings = {
          dynamicFlow: Boolean(cachedFlowSettings.dynamicFlow),
          circleFlow: Boolean(cachedFlowSettings.circleFlow)
        }
        Object.assign(flowSettings, normalizedSettings)
        console.log('从旧格式加载瀑布流设置:', flowSettings)
      }
    } else {
      console.log('缓存中没有瀑布流设置，使用默认值:', flowSettings)
    }
  } catch (e) {
    console.error('从缓存加载配置出错:', e)
  }
}

// 更新本地缓存方法 - 支持新的字段格式
const updateLocalCache = (settingType, data) => {
  try {
    // 先获取当前缓存
    const userInfo = getUserInfoFromCache()
    console.log(`更新${settingType}缓存`)

    if (settingType === 'privacy_settings') {
      // 更新隐私设置的新字段格式，确保转换为整型
      userInfo.show_fans = parseInt(data.showFans) || 0
      userInfo.show_follows = parseInt(data.showFollows) || 0
      userInfo.show_visitors = parseInt(data.showVisitors) || 0
      userInfo.allow_search = parseInt(data.allowSearch) || 0
      userInfo.show_phone = parseInt(data.showPhone) || 0

      // 保持旧格式兼容（可选）
      userInfo.privacy_settings = data

      console.log('更新隐私设置字段:', {
        show_fans: userInfo.show_fans,
        show_follows: userInfo.show_follows,
        show_visitors: userInfo.show_visitors,
        allow_search: userInfo.allow_search,
        show_phone: userInfo.show_phone
      })
    } else if (settingType === 'flow_settings') {
      // 更新瀑布流设置的新字段格式，确保转换为整型
      userInfo.dynamic_flow = data.dynamicFlow ? 1 : 0
      userInfo.circle_flow = data.circleFlow ? 1 : 0

      // 保持旧格式兼容（可选）
      userInfo.flow_settings = {
        dynamicFlow: Boolean(data.dynamicFlow),
        circleFlow: Boolean(data.circleFlow)
      }

      console.log('更新瀑布流设置字段:', {
        dynamic_flow: userInfo.dynamic_flow,
        circle_flow: userInfo.circle_flow
      })
    }

    // 保存回缓存
    uni.setStorageSync('USER_INFO', userInfo)
    console.log(`${settingType}缓存更新完成`)

    // 通知其他页面用户信息已更新
    uni.$emit('userInfoUpdated', {
      type: settingType,
      data: userInfo
    })

    // 触发瀑布流设置更新事件
    if (settingType === 'flow_settings') {
      uni.$emit('flowSettingsUpdated', {
        dynamic_flow: userInfo.dynamic_flow,
        circle_flow: userInfo.circle_flow,
        // 兼容旧格式
        dynamicFlow: Boolean(userInfo.dynamic_flow),
        circleFlow: Boolean(userInfo.circle_flow)
      })

      // 更新全局状态
      try {
        store.commit('UPDATE_FLOW_SETTINGS', userInfo.flow_settings)
        console.log('全局状态更新完成:', userInfo.flow_settings)
      } catch (error) {
        console.warn('更新全局状态失败:', error.message)
      }
    }
  } catch (e) {
    console.error('更新本地缓存失败:', e)
  }
}

// 获取设置项的显示名称
const getSettingDisplayName = (type, isEnabled) => {
  const names = {
    showVisitors: '访客查看',
    allowSearch: '搜索发现',
    showFans: '粉丝查看',
    showFollows: '关注查看',
    dynamicFlow: '动态瀑布流',
    circleFlow: '圈子瀑布流'
  }

  const status = isEnabled ? '开启' : '关闭'
  return `${names[type] || type}已${status}`
}

// 优化的切换隐私设置
const switchPrivacy = (type) => {
  if (uiState.privacyLoading) return

  // 使用防抖处理，避免快速点击
  debounce(() => {
    uiState.privacyLoading = true

    // 确保当前值是整型，然后切换
    const currentValue = parseInt(privacySettings[type]) || 0
    const newValue = currentValue ? 0 : 1

    // 立即更新本地状态
    privacySettings[type] = newValue

    // 立即更新本地缓存
    updateLocalCache('privacy_settings', privacySettings)

    // 准备请求数据 - 确保所有字段都是整型
    const requestData = {
      show_fans: parseInt(privacySettings.showFans) || 0,
      show_follows: parseInt(privacySettings.showFollows) || 0,
      show_visitors: parseInt(privacySettings.showVisitors) || 0,
      allow_search: parseInt(privacySettings.allowSearch) || 0,
      show_phone: parseInt(privacySettings.showPhone) || 0
    }

    console.log('提交隐私设置数据:', requestData)

    // 静默提交到服务器，不阻塞用户界面
    updatePrivacySettings(requestData).then(res => {
      if (res.code === 200) {
        // 显示成功提示
        showTip(getSettingDisplayName(type, privacySettings[type]))

        // 注意：后端现在直接返回成功状态，不返回数据
        // 本地数据已经在提交前更新，无需再次更新
        console.log('隐私设置更新成功')
      }
    }).catch(error => {
      // 如果提交失败，回滚本地状态
      privacySettings[type] = privacySettings[type] ? 0 : 1
      updateLocalCache('privacy_settings', privacySettings)
      handleError(error, '隐私设置更新')
    }).finally(() => {
      uiState.privacyLoading = false
    })
  }, 300, 'privacy')
}

// 优化的切换瀑布流设置
const switchFlow = (type) => {
  if (uiState.flowLoading) return

  // 使用防抖处理，避免快速点击
  debounce(() => {
    uiState.flowLoading = true

    // 确保当前值是布尔值，然后切换
    const currentValue = Boolean(flowSettings[type])
    const newValue = !currentValue

    console.log('瀑布流设置变更:', type, '从', currentValue, '到', newValue)

    // 立即更新本地状态
    flowSettings[type] = newValue

    // 立即更新本地缓存
    updateLocalCache('flow_settings', flowSettings)

    // 准备请求数据 - 转换为整型
    const requestData = {
      dynamic_flow: flowSettings.dynamicFlow ? 1 : 0,
      circle_flow: flowSettings.circleFlow ? 1 : 0
    }

    console.log('提交瀑布流设置数据:', requestData)

    // 静默提交到服务器，不阻塞用户界面
    updateFlowSettings(requestData).then(res => {
      if (res.code === 200) {
        // 显示成功提示
        showTip(getSettingDisplayName(type, flowSettings[type]))

        // 注意：后端现在直接返回成功状态，不返回数据
        // 本地数据已经在提交前更新，无需再次更新
        console.log('瀑布流设置更新成功')
      }
    }).catch(error => {
      // 如果提交失败，回滚本地状态
      flowSettings[type] = !flowSettings[type]
      updateLocalCache('flow_settings', flowSettings)
      handleError(error, '瀑布流设置更新')
    }).finally(() => {
      uiState.flowLoading = false
    })
  }, 300, 'flow')
}

// 清理定时器
const clearTimers = () => {
  Object.keys(debounceTimers).forEach(key => {
    if (debounceTimers[key]) {
      clearTimeout(debounceTimers[key])
      debounceTimers[key] = null
    }
  })
}

// 生命周期 - 页面加载时
onMounted(() => {
  // 立即从缓存加载数据
  loadFromCache()
})

// 生命周期 - 页面卸载时
onUnmounted(() => {
  clearTimers()
})
</script>

<style>
page {
  background: #f8f8f8;
  padding: 0 30rpx;
  box-sizing: border-box;
  overflow-x: hidden; 
}

.title-box {
	padding: 20rpx 0;
	font-size: 40rpx;
	font-weight: bold;
}

.table {
	padding: 30rpx 0;
	color: #999;
	font-size: 24rpx;
	font-weight: 500;
}

.list-box {
  width: 100%;
  border-radius: 24rpx;
  overflow: hidden;
  box-sizing: border-box; 
  margin-bottom: 20rpx;
}

.list-box .list {
	margin: 0;
	padding: 0;
	width: 100%;
	background: #fff!important;
	border-radius: 0;
}


.list-box .list:last-child {
  border-bottom: none;
}

.list-box .list .icon {
  margin: 0 30rpx;
  width: 38rpx;
  height: 38rpx;
}

.list-box .list-item {
  width: calc(100% - 98rpx);
  padding: 30rpx 30rpx 30rpx 0;
  justify-content: space-between;
  border-bottom: 1px solid #f8f8f8;
}

.list-item .title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.list-item .title .t1 {
  font-size: 24rpx;
  font-weight: 500;
  line-height: 48rpx;
}

.list-item .title .t2 {
  color: #999;
  font-size: 18rpx;
  font-weight: 300;
  line-height: 18rpx;
}

.list-box .list-item image {
  width: 24rpx;
  height: 24rpx;
  transform: rotate(-90deg);
}

.description-box {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.description-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.description-content {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}

.version {
  padding: 60rpx 0;
  flex-direction: column;
  justify-content: center;
}

.version image {
  margin-right: 10rpx;
  width: 20rpx;
  height: 20rpx;
}

.version text {
  color: #999;
  font-size: 18rpx;
}

.tips-box {
  padding: 20rpx 30rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12rpx;
  justify-content: center;
}

.tips-box .tips-item {
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.df {
  display: flex;
  align-items: center;
}
</style> 