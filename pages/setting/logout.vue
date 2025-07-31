<template>
  <view class="container">
    <!-- <navbar :bg="1"></navbar>
    <view class="title-box" :style="{'margin-top': statusBarHeight + titleBarHeight + 'px'}">
      <view>申请注销账号</view>
      <view>过程不可逆，请谨慎操作</view>
    </view> -->
    
    <!-- 使用原生滚动视图，性能更好 -->
    <view class="content-wrapper">
      <!-- 加载状态显示 -->
      <view class="loading-box" v-if="isLoading">
        <view class="loading-icon"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 用户信息区域 -->
      <view class="user-info" v-if="!isLoading && agreementData.avatar">
        <image class="user-avatar" :src="agreementData.avatar" mode="aspectFill"></image>
        <view class="user-name">{{agreementData.name}}</view>
      </view>
      
      <!-- 协议内容显示区域 - 使用简化的内容渲染方式 -->
      <view class="agreement-content" v-if="!isLoading">
        <rich-text :nodes="agreementContent"></rich-text>
      </view>
      
      <!-- 底部安全区域，防止内容被按钮遮挡 -->
      <view class="bottom-safe-area"></view>
    </view>
    
    <view class="footer-box bfw bUp">
      <view class="notice">点击【确认注销】即代表您已经同意《用户注销协议》</view>
      <view class="footer-item">
        <view class="btn-box" @tap="submitClick">确认注销</view>
      </view>
    </view>
    
    <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
      <view class="tips-box df">
        <view class="tips-item">{{tipsTitle}}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import navbar from '@/components/navbar/navbar.vue'
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
import { getUserAgreement, cancelUser } from '@/api/user.js'

// 响应式数据
const statusBarHeight = ref(20)
const titleBarHeight = ref(44)
const tipsTitle = ref("")
const isLoading = ref(true)
const agreementData = ref({
  avatar: '',
  name: '',
  content: ''
})
const agreementContent = ref('') // 使用简化的内容格式

// 获取store实例
const store = useStore()

// 获取弹窗引用
const tipsPopup = ref(null)

// 初始化系统信息
const initSystemInfo = () => {
  try {
    const systemInfo = uni.getSystemInfoSync()
    statusBarHeight.value = systemInfo.statusBarHeight || 20
    titleBarHeight.value = 44
  } catch (error) {
    console.warn('获取系统信息失败:', error)
    statusBarHeight.value = 20
    titleBarHeight.value = 44
  }
}

// 获取协议数据
const getAgreement = () => {
  // 设置一个超时，如果请求时间过长，也显示界面
  const timeout = setTimeout(() => {
    if (isLoading.value) {
      isLoading.value = false
    }
  }, 1500)

  // 检查是否有缓存的协议内容
  const cachedAgreement = uni.getStorageSync('user_cancel_agreement')
  if (cachedAgreement) {
    try {
      const agreementDataParsed = JSON.parse(cachedAgreement)
      agreementData.value = agreementDataParsed
      agreementContent.value = agreementDataParsed.content
      isLoading.value = false
      clearTimeout(timeout)
      return
    } catch (e) {
      console.log('缓存协议解析失败', e)
    }
  }

  // 没有缓存或解析失败，从API获取
  getUserAgreement(5).then(res => {
    clearTimeout(timeout)
    agreementData.value = res.data
    agreementContent.value = res.data.content
    // 缓存协议内容，避免重复加载
    uni.setStorageSync('user_cancel_agreement', JSON.stringify(res.data))
    isLoading.value = false
  }).catch(err => {
    clearTimeout(timeout)
    isLoading.value = false
    tipsTitle.value = "获取协议失败"
    tipsPopup.value.open()
    setTimeout(() => {
      tipsPopup.value.close()
    }, 1500)
  })
}

// 提交注销申请
const submitClick = () => {
  uni.showModal({
    content: "确定要注销账号吗？",
    confirmColor: "#FA5150",
    success: function(res) {
      if (res.confirm) {
        uni.showLoading({
          mask: true
        })

        // 使用真实的注销API
        cancelUser().then(function(res) {
          uni.hideLoading()

          // 清除登录状态
          store.commit("LOGOUT")

          // 显示成功提示
          tipsTitle.value = "账号注销申请已提交，将在7个工作日内处理"
          tipsPopup.value.open()

          // 清除本地存储
          uni.clearStorage()

          setTimeout(function() {
            tipsPopup.value.close()

            // 重定向到首页
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }, 1500)
        }).catch(function(err) {
          uni.hideLoading()
          tipsTitle.value = err || "注销失败，请稍后重试"
          tipsPopup.value.open()

          setTimeout(function() {
            tipsPopup.value.close()
          }, 1500)
        })
      }
    }
  })
}

// 页面挂载时执行
onMounted(() => {
  initSystemInfo()
  getAgreement()
})
</script>

<style>
.container {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
}
.title-box {
  font-size: 40rpx;
  font-weight: 700;
}
/* 内容区域 - 使用原生滚动，性能更好 */
.content-wrapper {
  flex: 1;
  padding: 0 30rpx;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* 增强iOS滚动流畅度 */
}
/* 加载状态 */
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  min-height: 200rpx;
}
.loading-icon {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 20rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #666;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.loading-text {
  font-size: 26rpx;
  color: #666;
}
/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}
.user-avatar {
  width: 76rpx;
  height: 76rpx;
  margin-right: 20rpx;
  border-radius: 50%;
}
.user-name {
  font-size: 28rpx;
  font-weight: 500;
}
/* 协议内容样式 */
.agreement-content {
  margin: 20rpx 0 40rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #333;
}
/* 底部安全区域 */
.bottom-safe-area {
  height: 180rpx;
  width: 100%;
}
.footer-box {
  position: fixed;
  z-index: 99;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  padding: 30rpx;
  box-sizing: border-box;
  /* 底部安全区域适配 */
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom, 0rpx));
  padding-bottom: calc(30rpx + constant(safe-area-inset-bottom, 0rpx)); /* iOS < 11.2 兼容 */
}
.notice {
  color: #999;
  font-size: 24rpx;
  text-align: center;
  margin-bottom: 20rpx;
}
.btn-box {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 24rpx;
  color: #fff;
  font-weight: 700;
  background: #000;
  border-radius: 100rpx;
}
.bfw {
  background: #fff;
}
.bUp {
  box-shadow: 0 -2px 5px 0 rgba(0, 0, 0, 0.05);
}
.df {
  display: flex;
  align-items: center;
}
.tips-box {
  padding: 20rpx 30rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12rpx;
  justify-content: center;
}
.tips-item {
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}
</style> 