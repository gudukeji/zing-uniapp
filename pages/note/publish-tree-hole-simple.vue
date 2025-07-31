<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text>←</text>
      </view>
      <text class="nav-title">放入纸条</text>
      <view class="nav-submit" @tap="publishBox">
        <text>{{isSubmitting ? '发布中...' : '发布'}}</text>
      </view>
    </view>
    

    <!-- 内容区域 -->
    <view class="form-container">
      <!-- 类型选择 -->
      <view class="form-item">
        <view class="form-label">纸条类型</view>
        <view class="type-list">
          <view 
            v-for="item in typeList" 
            :key="item.value"
            class="type-item"
            :class="{'active': currentType === item.value}"
            @tap="selectType(item.value)"
          >
            <text class="type-icon">{{item.icon}}</text>
            <text class="type-name">{{item.name}}</text>
          </view>
        </view>
      </view>
      
      <!-- 内容输入 -->
      <view class="form-item">
        <view class="form-label">纸条内容</view>
        <textarea 
          v-if="currentType !== 4"
          class="form-textarea" 
          placeholder="写下你想说的话..." 
          maxlength="500" 
          v-model="content" 
        />
        <view v-else class="voice-section">
          <text>语音功能开发中...</text>
        </view>
        <view v-if="currentType !== 4" class="form-count">{{content.length}}/500</view>
      </view>
      
      <!-- 匿名设置 -->
      <view class="form-item">
        <view class="form-label">发布设置</view>
        <view class="setting-row" @tap="toggleAnonymous">
          <text class="setting-text">匿名发布</text>
          <view class="switch" :class="{'active': isAnonymous}">
            <view class="switch-dot"></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { publishTreeHoleBox } from '@/api/social'
import { checkLogin, toLogin } from '@/libs/login.js'

export default {
  data() {
    return {
      currentType: 1,
      content: '',
      isAnonymous: true,
      isSubmitting: false,
      typeList: [
        { value: 1, name: '问题咨询', icon: '❓' },
        { value: 2, name: '秘密', icon: '🤫' },
        { value: 3, name: '心愿', icon: '🌠' },
        { value: 4, name: '语音纸条', icon: '🎵' }
      ],
      // 调试信息
      debugInfo: {
        checkLoginResult: false,
        storeToken: '',
        localToken: '',
        userInfo: null,
        finalLoginStatus: false,
        apiStatus: '未调用',
        lastError: ''
      }
    }
  },
  onLoad() {
    // 打印登录状态和token调试信息
    this.printLoginDebugInfo()

    if (!this.checkLoginStatus()) {
      return
    }
  },
  methods: {
    // 打印登录调试信息
    printLoginDebugInfo() {
      console.log('=== 登录状态调试信息 ===')

      // 检查checkLogin函数
      const isLoginCheck = checkLogin()
      this.debugInfo.checkLoginResult = isLoginCheck
      console.log('checkLogin()结果:', isLoginCheck)

      // 检查store中的token
      let storeToken = null
      try {
        if (this.$store && this.$store.state && this.$store.state.app) {
          storeToken = this.$store.state.app.token
          this.debugInfo.storeToken = storeToken || '空'
          console.log('$store.state.app.token:', storeToken)
        } else {
          this.debugInfo.storeToken = 'store不存在'
          console.log('$store.state.app 不存在')
        }
      } catch (e) {
        this.debugInfo.storeToken = '获取失败: ' + e.message
        console.log('获取store token失败:', e)
      }

      // 检查本地存储的token
      try {
        const localToken = uni.getStorageSync('token')
        this.debugInfo.localToken = localToken || '空'
        console.log('本地存储token:', localToken)
      } catch (e) {
        this.debugInfo.localToken = '获取失败: ' + e.message
        console.log('获取本地token失败:', e)
      }

      // 检查LOGIN_STATUS_TOKEN
      try {
        const loginStatusToken = uni.getStorageSync('LOGIN_STATUS_TOKEN')
        console.log('LOGIN_STATUS_TOKEN:', loginStatusToken)
      } catch (e) {
        console.log('获取LOGIN_STATUS_TOKEN失败:', e)
      }

      // 检查用户信息
      try {
        const userInfo = uni.getStorageSync('userInfo')
        this.debugInfo.userInfo = userInfo
        console.log('本地用户信息:', userInfo)
      } catch (e) {
        this.debugInfo.userInfo = null
        console.log('获取用户信息失败:', e)
      }

      // 最终登录状态
      const finalLoginStatus = isLoginCheck && storeToken
      this.debugInfo.finalLoginStatus = finalLoginStatus
      console.log('最终登录状态:', finalLoginStatus)
      console.log('=== 调试信息结束 ===')
    },

    checkLoginStatus() {
      const isLoggedIn = checkLogin()
      
      if (!isLoggedIn) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再发布纸条',
          confirmText: '去登录',
          cancelText: '返回',
          success: (res) => {
            if (res.confirm) {
              toLogin()
            } else {
              uni.navigateBack()
            }
          }
        })
        return false
      }
      
      return true
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    selectType(type) {
      this.currentType = type
      this.content = ''
    },
    
    toggleAnonymous() {
      this.isAnonymous = !this.isAnonymous
    },
    
    publishBox() {
      console.log('=== 发布纸条调试信息 ===')

      // 更新调试信息
      this.printLoginDebugInfo()

      // 再次检查登录状态
      const isLoginCheck = checkLogin()
      const storeToken = this.$store?.state?.app?.token
      console.log('发布时登录状态:', isLoginCheck)
      console.log('发布时token:', storeToken)

      if (!this.validateContent()) {
        return
      }

      this.isSubmitting = true
      this.debugInfo.apiStatus = '准备调用API'
      
      const data = {
        type: this.currentType,
        content: this.currentType === 4 ? '' : this.content.trim(),
        voice_url: '',
        voice_duration: 0,
        is_anonymous: this.isAnonymous ? 1 : 0
      }

      console.log('发布数据:', data)
      console.log('调用API: publishTreeHoleBox')
      this.debugInfo.apiStatus = '正在调用API...'

      publishTreeHoleBox(data).then(res => {
        console.log('API响应:', res)
        this.isSubmitting = false
        this.debugInfo.apiStatus = `API成功: ${res.status}`

        if (res.status === 200) {
          this.debugInfo.apiStatus = 'API成功: 200'
          uni.showToast({
            title: '发布成功',
            icon: 'success'
          })

          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          this.debugInfo.apiStatus = `API失败: ${res.status} - ${res.msg}`
          uni.showToast({
            title: res.msg || '发布失败',
            icon: 'none'
          })
        }
      }).catch(err => {
        this.isSubmitting = false
        console.error('发布纸条失败:', err)
        console.log('错误详情:', JSON.stringify(err))

        // 更新调试信息
        this.debugInfo.apiStatus = 'API异常'
        this.debugInfo.lastError = err.message || err.msg || JSON.stringify(err)

        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      })
    },
    
    validateContent() {
      if (this.currentType === 4) {
        uni.showToast({
          title: '语音功能开发中',
          icon: 'none'
        })
        return false
      }
      
      if (!this.content.trim()) {
        uni.showToast({
          title: '请输入纸条内容',
          icon: 'none'
        })
        return false
      }
      
      if (this.content.trim().length < 5) {
        uni.showToast({
          title: '内容太短，至少输入5个字符',
          icon: 'none'
        })
        return false
      }
      
      return true
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
}

.nav-submit {
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  border-radius: 20rpx;
  color: white;
  font-size: 28rpx;
}

.form-container {
  padding: 30rpx;
}

.form-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.type-list {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
}

.type-item {
  flex: 1;
  min-width: 140rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  text-align: center;
  border: 2rpx solid transparent;
}

.type-item.active {
  background: #e6f0ff;
  border-color: #3B82F6;
}

.type-icon {
  display: block;
  font-size: 32rpx;
  margin-bottom: 8rpx;
}

.type-name {
  font-size: 24rpx;
  color: #666;
}

.form-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  line-height: 1.6;
}

.form-count {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.voice-section {
  padding: 60rpx;
  text-align: center;
  color: #999;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-text {
  font-size: 28rpx;
}

.switch {
  width: 80rpx;
  height: 40rpx;
  background: #e9ecef;
  border-radius: 20rpx;
  position: relative;
  transition: all 0.3s ease;
}

.switch.active {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
}

.switch-dot {
  width: 32rpx;
  height: 32rpx;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: all 0.3s ease;
}

.switch.active .switch-dot {
  left: 44rpx;
}

/* 调试信息样式 */
.debug-info {
  background: #fff3cd;
  border: 2rpx solid #ffeaa7;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 20rpx;
}

.debug-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #856404;
  margin-bottom: 16rpx;
  text-align: center;
}

.debug-item {
  font-size: 24rpx;
  color: #856404;
  margin-bottom: 8rpx;
  padding: 8rpx;
  background: rgba(255, 234, 167, 0.3);
  border-radius: 6rpx;
  word-break: break-all;
}
</style>
