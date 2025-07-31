<template>
  <view class="tabbar df">
    <!-- 添加内容弹出层 -->
    <view v-if="isAdd" class="tabbar-add df bfh" :class="{'fade-in': !isAddBg, 'fade-out': isAddBg}" @touchmove.stop.prevent @tap="handleAdd">
      <view class="content-wrapper">
        <!-- 头部标题区域 -->
        <view class="add-header">
          <view class="header-content">
            <view class="add-title">发布内容 <text class="add-plus">+</text></view>
            <view class="add-subtitle">{{currentAppXx}}</view>
          </view>
          <view class="header-image">
            <image src="/static/img/fbt.png" mode="aspectFit"></image>
          </view>
        </view>

        <!-- 发布选项区域 - 1、2、1布局 -->
        <view class="card-container" @tap.stop @touchmove.stop.prevent>
          <!-- 图文卡片 -->
          <view
            :class="['card', 'cream-card', { 'active-state': activeStates.card }]"
            @tap.stop="toAdd(1)"
            @touchstart="handleTouchStart('card')"
            @touchend="handleTouchEnd('card')">
            <view class="card-left">
              <image src="/static/img/tw.png"></image>
            </view>
            <view class="card-content">
              <view class="card-title">发布图文</view>
              <view class="card-subtitle">分享精彩瞬间</view>
            </view>
            <view class="card-right">
              <image src="/static/img/z1.png"></image>
            </view>
          </view>
          
          <!-- 视频和音频选项 -->
          <view class="two-column-container">
            <view
              :class="['two-column-card', 'video-card', { 'active-state': activeStates.twoColumnCard }]"
              @tap.stop="toAdd(2)"
              @touchstart="handleTouchStart('twoColumnCard')"
              @touchend="handleTouchEnd('twoColumnCard')">
              <view class="card-content-left">
                <view class="two-column-card-title">发视频</view>
                <view class="two-column-card-desc">记录精彩瞬间</view>
              </view>
              <view class="card-content-right">
                <image src="/static/img/sp.png"></image>
              </view>
            </view>
            <view
              :class="['two-column-card', 'audio-card', { 'active-state': activeStates.twoColumnCard }]"
              @tap.stop="toAdd(3)"
              @touchstart="handleTouchStart('twoColumnCard')"
              @touchend="handleTouchEnd('twoColumnCard')">
              <view class="card-content-left">
                <view class="two-column-card-title">发音频</view>
                <view class="two-column-card-desc">分享好声音</view>
              </view>
              <view class="card-content-right">
                <image src="/static/img/yw.png"></image>
              </view>
            </view>
          </view>
          
          <!-- 圈子卡片 -->
          <view class="card mint-card" @tap.stop="toAdd(5)">
            <view class="card-left">
              <image src="/static/img/qz.png"></image>
            </view>
            <view class="card-content">
              <view class="card-title">创建圈子</view>
              <view class="card-subtitle">一起交流讨论</view>
            </view>
            <view class="card-right">
              <image src="/static/img/z1.png"></image>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <view class="tabbar-box df" :class="{'bfw tb-bs': !isAddBtn}">
      <!-- 首页按钮 -->
      <view
        :class="['tabbar-item', 'df', { 'active-state': activeStates.tabbarItem }]"
        @tap="toTabbar(0)"
        @touchstart="handleTouchStart('tabbarItem')"
        @touchend="handleTouchEnd('tabbarItem')"
        v-if="!isAddBtn">
        <image class="icon" :src="0 === currentPage ? tabBar[0].selectedIconPath : tabBar[0].iconPath"></image>
      </view>

      <!-- 购物车按钮 -->
      <view
        :class="['tabbar-item', 'df', { 'active-state': activeStates.tabbarItem }]"
        @tap="toTabbar(1)"
        @touchstart="handleTouchStart('tabbarItem')"
        @touchend="handleTouchEnd('tabbarItem')"
        v-if="!isAddBtn">
        <image class="icon" :src="1 === currentPage ? tabBar[1].selectedIconPath : tabBar[1].iconPath"></image>
        <view v-if="showCartBadge && cartBadgeCount > 0" class="msg" :style="{'padding': cartBadgeCount > 9 ? '0 10rpx' : '0'}">
          {{cartBadgeCount > 99 ? '99+' : cartBadgeCount}}
        </view>
      </view>

      <!-- 中间添加按钮 -->
      <view
        :class="['tabbar-item', 'df', { 'active-state': activeStates.tabbarItem }]"
        @tap="toTabbar(2)"
        @touchstart="handleTouchStart('tabbarItem')"
        @touchend="handleTouchEnd('tabbarItem')">
        <view class="add df" :style="{
          'background': isAddBtn ? '#fff' : '#000',
          'transform': isAddBtn ? 'rotate(225deg)' : 'rotate(0deg)'
        }">
          <image :src="isAddBtn ? tabBar[2].selectedIconPath : tabBar[2].iconPath"></image>
        </view>
      </view>

      <!-- 消息按钮 -->
      <view class="tabbar-item df" @tap="toTabbar(3)" v-if="!isAddBtn">
        <image class="icon" :src="3 === currentPage ? tabBar[3].selectedIconPath : tabBar[3].iconPath"></image>
        <view v-if="currentMsg > 0" class="msg">
          {{currentMsg > 99 ? '99+' : currentMsg}}
        </view>
      </view>

      <!-- 个人中心按钮 -->
      <view class="tabbar-item df" @tap="toTabbar(4)" v-if="!isAddBtn">
        <image class="icon" :src="4 === currentPage ? tabBar[4].selectedIconPath : tabBar[4].iconPath"></image>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, defineProps, defineEmits } from 'vue'

// 定义 props
const props = defineProps({
  currentPage: {
    type: Number,
    default: 0
  },
  currentMsg: {
    type: Number,
    default: 0
  }
})

// 定义 emits
const emit = defineEmits(['refresh'])

// 响应式数据
const appXx = ref({3: "下面选择您要发布的类型"})
const isAdd = ref(false)
const isAddBtn = ref(false)
const isAddBg = ref(false)
const isLoggedIn = ref(false)
const loginCheckTimer = ref(null)
const cartBadgeCount = ref(0)
const showCartBadge = ref(false)

// 防止重复点击
const lastClickTime = ref(0)

// 点击状态管理（小程序兼容性）
const activeStates = reactive({
  tabbarItem: false,
  card: false,
  twoColumnCard: false
})

// 静态配置数据
const tabBar = reactive([
  {
    selectedIconPath: "/static/img/tabbar/1.png",
    iconPath: "/static/img/tabbar/11.png",
    pagePath: "/pages/index/index"
  },
  {
    selectedIconPath: "/static/img/tabbar/2.png",
    iconPath: "/static/img/tabbar/22.png",
    pagePath: "/pages/index/dynamic"
  },
  {
    selectedIconPath: "/static/img/tabbar/3.png",
    iconPath: "/static/img/tabbar/33.png"
  },
  {
    selectedIconPath: "/static/img/tabbar/4.png",
    iconPath: "/static/img/tabbar/44.png",
    pagePath: "/pages/index/message"
  },
  {
    selectedIconPath: "/static/img/tabbar/5.png",
    iconPath: "/static/img/tabbar/55.png",
    pagePath: "/pages/index/center"
  }
])

// 计算属性
const currentAppXx = computed(() => {
  return appXx.value[3] || "下面选择您要发布的类型"
})

// 安全获取全局数据的方法
const getGlobalData = (key, defaultValue) => {
  try {
    if (typeof getApp !== 'function') return defaultValue
    const app = getApp()
    if (!app || !app.globalData) return defaultValue
    return app.globalData[key] !== undefined ? app.globalData[key] : defaultValue
  } catch (e) {
    console.warn('获取全局数据失败:', e)
    return defaultValue
  }
}

// 方法定义
const handleAdd = (e) => {
  // 阻止事件冒泡和默认行为
  if (e) {
    e.stopPropagation()
    e.preventDefault()
  }

  setBarColor("#000000")
  isAddBg.value = true
  isAddBtn.value = false

  setTimeout(() => {
    isAdd.value = false
    isAddBg.value = false
  }, 300)
}



// 点击状态处理函数（小程序兼容性）
const handleTouchStart = (type) => {
  activeStates[type] = true
}

const handleTouchEnd = (type) => {
  setTimeout(() => {
    activeStates[type] = false
  }, 150) // 150ms后恢复状态
}

// 导航处理函数
const navigateToPage = (targetUrl) => {
  return new Promise((resolve, reject) => {
    uni.reLaunch({
      url: targetUrl,
      success: resolve,
      fail: (err) => {
        // 降级处理
        uni.redirectTo({
          url: targetUrl,
          success: resolve,
          fail: (redirectErr) => {
            uni.navigateTo({
              url: targetUrl,
              success: resolve,
              fail: reject
            })
          }
        })
      }
    })
  })
}

const toTabbar = async (index) => {
  // 防止重复点击 - 减少延迟到100ms，提升响应速度
  const now = Date.now()
  if (now - lastClickTime.value < 100) return
  lastClickTime.value = now

  // 更新 appXx 配置
  appXx.value = getGlobalData('appXx', {3: "下面选择您要发布的类型"})

  if (index != props.currentPage && index != 2) {
    // 自定义 tabbar 页面切换
    const targetUrl = tabBar[index].pagePath

    try {
      await navigateToPage(targetUrl)
      console.log('页面切换成功:', targetUrl)
    } catch (err) {
      console.error('页面跳转失败:', err)
      uni.showToast({
        title: '页面跳转失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }
  } else if (index == 2 && isAdd.value) {
    // 如果点击中间按钮且已展开，则收起
    handleAdd()
  } else if (index == 2 && !isAdd.value) {
    // 如果点击中间按钮且未展开，则展开
    isAdd.value = true
    isAddBtn.value = true
    setBarColor("#ffffff")
  } else if (index == props.currentPage && (index == 0 || index == 1)) {
    // 如果在首页或动态页点击当前页，则刷新
    console.log('点击当前页面，触发刷新')
    emit('refresh')
  }
}

const toAdd = (type) => {
  console.log('toAdd 被调用，类型:', type)
  setBarColor("#000000")

  if (type === 5) {
    // 创建圈子
    console.log('准备跳转到圈子创建页面')
    uni.navigateTo({
      url: "/pages/center/circle-create",
      success: () => {
        console.log('圈子创建页面跳转成功')
        isAdd.value = false
        isAddBtn.value = false
      },
      fail: (err) => {
        console.error('navigateTo失败:', err)
        // 如果页面不存在，给用户提示
        uni.showToast({
          title: '功能开发中',
          icon: 'none'
        })
        isAdd.value = false
        isAddBtn.value = false
      }
    })
  } else {
    // 发布动态
    uni.navigateTo({
      url: "/pages/note/add",
      success: () => {
        console.log('笔记发布页面跳转成功')
        isAdd.value = false
        isAddBtn.value = false
      },
      fail: (err) => {
        uni.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
        isAdd.value = false
        isAddBtn.value = false
      }
    })
  }
}

const setBarColor = (color) => {
  // #ifdef MP-WEIXIN
  uni.setNavigationBarColor({
    frontColor: color,
    backgroundColor: "RGB(255,255,255)",
    animation: {
      duration: 300,
      timingFunc: "easeIn"
    }
  })
  // #endif
}

// 检查全局登录状态
const checkGlobalLoginStatus = () => {
  try {
    // 检查token和用户信息
    const token = uni.getStorageSync('token')
    const userInfo = uni.getStorageSync('userInfo')

    // 确定当前登录状态
    const currentLoginStatus = !!(token && userInfo && userInfo.uid)

    // 如果状态发生变化，广播事件
    if (isLoggedIn.value !== currentLoginStatus) {
      isLoggedIn.value = currentLoginStatus
      // 广播登录状态变化事件
      if (uni.$emit) {
        uni.$emit('loginStateChanged', currentLoginStatus)
      }
    }
  } catch (error) {
    console.warn('检查登录状态失败:', error)
  }
}

// 处理登录状态变化
const handleLoginStateChanged = (loginStatus) => {
  isLoggedIn.value = !!loginStatus
}

// 处理购物车数量更新
const handleCartBadgeUpdate = (data) => {
  if (data && typeof data === 'object') {
    cartBadgeCount.value = data.count || 0
    showCartBadge.value = data.show || false
  }
}

// 生命周期钩子
onMounted(() => {
  // 检查全局登录状态
  checkGlobalLoginStatus()

  // 监听登录状态变化事件
  if (uni.$on) {
    uni.$on('loginStateChanged', handleLoginStateChanged)
    uni.$on('updateCartBadge', handleCartBadgeUpdate)
  }

  // 定期检查登录状态 - 降低频率以提升性能
  loginCheckTimer.value = setInterval(() => {
    checkGlobalLoginStatus()
  }, 60000) // 每60秒检查一次，减少性能消耗
})

onBeforeUnmount(() => {
  // 清除定时器
  if (loginCheckTimer.value) {
    clearInterval(loginCheckTimer.value)
    loginCheckTimer.value = null
  }

  // 移除事件监听
  if (uni.$off) {
    uni.$off('loginStateChanged', handleLoginStateChanged)
    uni.$off('updateCartBadge', handleCartBadgeUpdate)
  }
})
</script>

<style>
/* APP端兼容性优化 - 移除CSS变量，使用具体值 */

.tabbar{
  position: fixed;
  z-index: 998;
  width: 100%;
  /* APP端兼容性：条件编译底部安全区域 */
  /* #ifdef APP-PLUS */
  bottom: 50rpx;
  /* #endif */
  /* #ifndef APP-PLUS */
  bottom: max(env(safe-area-inset-bottom), 50rpx);
  /* #endif */
  box-sizing: border-box;
  justify-content: center;
  pointer-events: none; /* 优化性能，只有子元素可点击 */
}

.tabbar-box{
  z-index: 998;
  width: calc(100% - 120rpx);
  height: 100rpx;
  border-radius: 50rpx;
  justify-content: space-around;
  /* APP端兼容性：条件编译backdrop-filter */
  /* #ifndef APP-PLUS */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  /* #endif */
  pointer-events: auto; /* 恢复点击事件 */
  transition: all 0.3s ease; /* 添加过渡动画 */
}

.tb-bs{
  box-shadow: 0 0 24rpx rgba(0, 0, 0, 0.06);
  border: 1px solid #f8f8f8;
}

.tabbar-box .tabbar-item{
  width: 20%;
  height: 100rpx;
  justify-content: center;
  position: relative;
  transition: transform 0.2s ease; /* 添加点击反馈动画 */
  cursor: pointer;
}

/* 小程序兼容性：使用class替代:active伪类 */
.tabbar-item.active-state {
  transform: scale(0.95); /* 点击时缩放效果 */
}

.tabbar-item .icon{
  width: 48rpx;
  height: 48rpx;
  transition: opacity 0.2s ease; /* 图标切换动画 */
}

.tabbar-item .msg{
  position: absolute;
  top: 18rpx;
  left: calc(50% + 8rpx);
  min-width: 34rpx;
  height: 34rpx;
  line-height: 34rpx;
  text-align: center;
  font-size: 18rpx;
  font-weight: 700;
  color: #fff;
  background: #fa5150;
  border-radius: 34rpx;
  border: 2rpx solid #fff;
}

.tabbar-item .add{
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  justify-content: center;
  transition: all 0.3s ease-in-out;
}

.tabbar-item .add image{
  width: 16rpx;
  height: 16rpx;
}

.tabbar .tabbar-add{
  position: fixed;
  z-index: 997;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-image: linear-gradient(to bottom, rgb(173 173 173 / 95%), rgb(25 25 25 / 95%));
  /* APP端兼容性：条件编译backdrop-filter */
  /* #ifndef APP-PLUS */
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  /* #endif */

  /* 只添加阻止事件穿透的属性 */
  pointer-events: auto;
  /* #ifdef H5 */
  touch-action: none;
  /* #endif */
}

.content-wrapper {
  width: 100%;
  padding-top: 180rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 头部标题区域 */
.add-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  padding-top: 90rpx;
}

.header-content {
  flex: 1;
}

.header-image {
  width: 300rpx;
  height: 300rpx;
}

.header-image image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.add-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
}

.add-plus {
  margin-left: 8rpx;
  font-weight: normal;
}

.add-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

/* 新增卡片样式 */
.card-container {
  width: 80%;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  margin-top: 240rpx;
  pointer-events: auto; /* 确保容器可以传递点击事件 */
}

/* 卡片通用样式 */
.card {
  display: flex;
  align-items: center;
  border-radius: 20rpx;
  padding: 30rpx;
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  pointer-events: auto; /* 确保卡片可以被点击 */
}

/* 小程序兼容性：使用class替代:active伪类 */
.card.active-state {
  transform: scale(0.98);
  background-color: rgba(255, 255, 255, 0.15);
}

.cream-card {
  background-color: rgba(255, 255, 255, 0.15);
}

.mint-card {
  background-color: rgba(255, 255, 255, 0.15);
}

.card-left {
  width: 60rpx;
  height: 60rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.card-left image {
  width: 40rpx;
  height: 40rpx;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
}

.card-subtitle {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 6rpx;
}

.card-right {
  width: 36rpx;
  height: 36rpx;
  transform: rotate(180deg);
}

.card-right image {
  width: 100%;
  height: 100%;
}

/* 两列卡片布局 */
.two-column-container {
  display: flex;
  width: 100%;
  gap: 20rpx;
}

.two-column-card {
  flex: 1;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  cursor: pointer;
  pointer-events: auto; /* 确保两列卡片可以被点击 */
}

/* 小程序兼容性：使用class替代:active伪类 */
.two-column-card.active-state {
  transform: scale(0.98);
}

.video-card {
  background-color: rgba(76, 130, 219, 0.3);
}

.audio-card {
  background-color: rgba(245, 166, 35, 0.3);
}

.card-content-left {
  flex: 1;
}

.two-column-card-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.two-column-card-desc {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 6rpx;
}

.card-content-right {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content-right image {
  width: 40rpx;
  height: 40rpx;
}

.close-btn image {
  width: 24rpx;
  height: 24rpx;
}

.df{
  display: flex;
  align-items: center;
}

.bfh{
  background: rgba(0, 0, 0, 0.8);
}

.bfw{
  background: #fff;
}

/* 动画优化 - APP端兼容性 */
.fade-in{
  animation: fadeIn 0.3s forwards;
}

.fade-out{
  animation: fadeOut 0.3s forwards;
}

@keyframes fadeIn{
  from{
    opacity: 0;
    transform: translateY(10rpx);
  }
  to{
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut{
  from{
    opacity: 1;
    transform: translateY(0);
  }
  to{
    opacity: 0;
    transform: translateY(10rpx);
  }
}
</style>