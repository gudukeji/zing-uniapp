<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-box df" :style="{'padding-top': statusBarHeight + 'px', 'background': 'rgba(255, 255, 255,' + navbarTrans + ')'}">
      <view class="nav-back df" :style="{'height': titleBarHeight + 'px'}" @tap="navBack">
        <image src="/static/img/back.png" style="width:34rpx;height:34rpx"></image>
      </view>
      <view v-if="navbarTrans == 1" class="nav-title ohto">{{ topicInfo.title || '话题详情' }}</view>
    </view>

    <!-- 话题头部区域 -->
    <view class="topic-header">
      <!-- 主背景容器 -->
      <view class="images-box df">
        <!-- 话题背景图片容器 -->
        <view class="topic-image-container">
          <lazy-image
            v-if="topicInfo.cover_image"
            :src="topicInfo.cover_image"
            class="topic-bg-image"
            @tap="previewTopicImage">
          </lazy-image>

          <!-- 背景遮罩层 -->
          <view class="bg-overlay"></view>
        </view>
      </view>

      <!-- 话题信息叠加层 -->
      <view class="topic-info-overlay" :style="{'padding-top': statusBarHeight + titleBarHeight + 160 + 'rpx'}">
        <view class="topic-main-info df">
          <!-- 话题图标 -->
          <view class="topic-icon">
            <view class="icon-wrapper">
              <image src="/static/img/topic_icon.png" class="topic-icon-img" mode="aspectFit"></image>
            </view>
          </view>

          <!-- 话题名称和统计信息 -->
          <view class="topic-details">
            <view class="topic-name">
              <text v-if="!showLoading">{{ topicInfo.title || '话题加载中...' }}</text>
              <view v-else class="skeleton-text"></view>
            </view>

          </view>

          <!-- 分享按钮 -->
          <view class="topic-share-btn" @tap="shareClick(true)">
            <view class="share-btn-wrapper">
              <image src="/static/img/fx1.png" class="share-icon" mode="aspectFit"></image>
            </view>
          </view>
        </view>

        <!-- 话题描述 -->
        <view class="topic-description" v-if="!showLoading && topicInfo.description">
          <text>{{ topicInfo.description }}</text>
        </view>


      </view>
    </view>

    <!-- 分类标签 -->
    <view class="bar-box df">
      <view class="bar-left df">
        <view
          v-for="(item, index) in barList"
          :key="index"
          class="bar-item"
          @tap="barClick"
          :data-idx="index">
          <view class="bar-item-content">
            <text :style="{
              'color': index == barIdx ? '#000' : '#999',
              'font-size': index == barIdx ? '28rpx' : '26rpx'
            }">{{ item }}</text>
            <view :class="['bar-line', { active: index == barIdx }]"></view>
          </view>
        </view>
      </view>

      <!-- 话题统计信息 -->
      <view class="topic-stats-right df">
        <text v-if="!showLoading" class="stat-item">{{ topicInfo.post_count || 0 }}篇</text>
        <text v-if="!showLoading" class="stat-divider">·</text>
        <text v-if="!showLoading" class="stat-item">{{ topicInfo.view_count || 0 }}浏览</text>
        <!-- 骨架屏 -->
        <view v-if="showLoading" class="skeleton-stats">
          <view class="skeleton-item"></view>
          <view class="skeleton-item"></view>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 加载中提示 -->
      <view v-if="showLoading" class="loading-container">
        <view class="loading-indicator"></view>
      </view>

      <!-- 空状态 -->
      <view v-if="isEmpty" class="empty-box df">
        <image src="/static/img/empty.png"/>
        <view class="e1">{{ (topicInfo.title || '该话题') }} 暂无动态</view>
        <view class="e2">快来发布第一篇相关动态吧</view>
      </view>

      <!-- 动态列表 -->
      <view v-else :class="[isWaterfall ? 'dynamic-box' : '']">
        <!-- 瀑布流布局 -->
        <waterfall v-if="isWaterfall" :note="list" :page="page"></waterfall>

        <!-- 普通列表布局 -->
        <block v-else>
          <card-gg
            v-for="(item, index) in list"
            :key="index"
            @likeback="likeClick"
            :item="item"
            :idx="index"
            @update="onCardUpdate"
          ></card-gg>
        </block>
      </view>

      <!-- 加载更多 -->
      <view v-if="list.length > 0 && loadStatus === 'noMore'" style="text-align: center; padding: 20rpx 0; color: #999; font-size: 24rpx;">
        没有更多数据了
      </view>
    </view>

    <!-- 分享组件 -->
    <share-component
      :show="showShare"
      :noteInfo="topicShareInfo"
      :userId="userId"
      @close="closeShare"
      @share="handleShare"
      @dislike="handleDislike"
      @report="handleReport">
    </share-component>

    <!-- 提示弹窗 -->
    <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
      <view class="tips-box df">
        <view class="tips-item">{{ tipsTitle }}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { onLoad, onShow, onHide, onPullDownRefresh, onReachBottom, onPageScroll, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useStore } from 'vuex'
import lazyImage from '@/components/lazyImage/lazyImage.vue'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'
import waterfall from '@/components/waterfall/waterfall.vue'
import cardGg from '@/components/card-gg/card-gg.vue'
import shareComponent from '@/components/share/index.vue'
import { getTopicList, getTopicDetail, getTopicDynamicList } from '@/api/social'

// 定义组件名称
defineOptions({
  name: 'TopicDetails'
})

// 使用store
const store = useStore()

// 计算属性
const statusBarHeight = computed(() => store.state.statusBarHeight || 20)
const titleBarHeight = computed(() => store.state.titleBarHeight || 44)
const userInfo = computed(() => store.state.app.userInfo)
const userId = computed(() => userInfo.value?.uid || 0)

// 响应式数据
const navbarTrans = ref(0)
const barList = ref(["最新", "热门"])
const barIdx = ref(0)
const topicId = ref(0)
const topicInfo = reactive({
  id: 0,
  title: '',
  description: '',
  cover_image: '',
  post_count: 0,
  view_count: 0
})
const list = ref([])
const page = ref(1)
const limit = ref(10)
const totalCount = ref(0)
const isThrottling = ref(true)
const isEmpty = ref(false)
const loadStatus = ref("more")
const tipsTitle = ref("")
const isWaterfall = ref(false)
const showLoading = ref(true)
const loadingTimer = ref(null)
const debounceTimer = ref(null)
const showShare = ref(false)

// 计算属性 - 话题分享信息
const topicShareInfo = computed(() => {
  return {
    id: topicInfo.id || topicId.value,
    title: topicInfo.title,
    content: topicInfo.description,
    image: topicInfo.cover_image,
    type: 'topic',
    share_url: `/pages/topic/details?id=${topicId.value}`
  }
})

// 初始化页面
const initPage = (options) => {
  // 开启分享功能 - 仅在小程序环境中有效
  // #ifdef MP
  uni.showShareMenu()
  // #endif

  if (options && options.id) {
    topicId.value = parseInt(options.id)
    loadTopicDetail()
    loadTopicDynamicList(true)
  } else {
    uni.showToast({
      title: '话题ID不能为空',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
}
// 预览话题背景图片
const previewTopicImage = () => {
  if (topicInfo.cover_image) {
    uni.previewImage({
      current: topicInfo.cover_image,
      urls: [topicInfo.cover_image]
    })
  }
}

// 切换分类标签
const barClick = (e) => {
  const idx = parseInt(e.currentTarget.dataset.idx)
  if (barIdx.value === idx || !isThrottling.value) return

  barIdx.value = idx
  page.value = 1
  list.value = []
  isEmpty.value = false
  loadStatus.value = 'more'

  loadTopicDynamicList(true)
}

// 获取话题详情
const loadTopicDetail = async () => {
  showLoading.value = true

  try {
    const res = await getTopicDetail(topicId.value)
    showLoading.value = false

    if (res.status === 200 && res.data) {
      Object.assign(topicInfo, {
        ...res.data,
        id: res.data.id || topicId.value
      })
    } else {
      uni.showToast({
        title: res.msg || "获取话题详情失败",
        icon: 'none'
      })
    }
  } catch (error) {
    showLoading.value = false
    // 如果话题详情接口失败，回退到话题列表接口
    try {
      const res = await getTopicList({
        page: 1,
        limit: 50,
        keyword: ''
      })

      if (res.status === 200 && res.data && res.data.list) {
        const topic = res.data.list.find(item => item.id == topicId.value)
        if (topic) {
          Object.assign(topicInfo, {
            ...topic,
            id: topic.id || topicId.value
          })
        } else {
          uni.showToast({
            title: "话题不存在",
            icon: 'none'
          })
        }
      } else {
        uni.showToast({
          title: res.msg || "获取话题详情失败",
          icon: 'none'
        })
      }
    } catch (listErr) {
      showLoading.value = false
      uni.showToast({
        title: "网络错误，请稍后重试",
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 2000)
    }
  }
}

// 获取话题下的动态
const loadTopicDynamicList = async (isRefresh = false) => {
  if (!isThrottling.value) return

  isThrottling.value = false
  showLoading.value = true

  // 清空加载定时器
  if (loadingTimer.value) {
    clearTimeout(loadingTimer.value)
    loadingTimer.value = null
  }

  // 设置最小加载时间
  loadingTimer.value = setTimeout(() => {
    showLoading.value = false
  }, 800)

  try {
    const res = await getTopicDynamicList({
      topic_id: topicId.value,
      page: page.value,
      limit: limit.value,
      sort: barIdx.value === 0 ? 'latest' : 'hot'
    })

    // 清除加载定时器
    if (loadingTimer.value) {
      clearTimeout(loadingTimer.value)
      loadingTimer.value = null
    }
    showLoading.value = false

    if (res.status === 200 && res.data) {
      const data = res.data
      const newList = data.list || []

      if (isRefresh || page.value === 1) {
        list.value = newList
      } else {
        list.value = [...list.value, ...newList]
      }

      totalCount.value = data.total || 0
      isEmpty.value = list.value.length === 0

      // 判断是否还有更多数据
      const hasMore = page.value * limit.value < totalCount.value
      loadStatus.value = hasMore ? 'more' : 'noMore'

      // 恢复节流状态
      isThrottling.value = true

      // 停止下拉刷新
      if (isRefresh) {
        uni.stopPullDownRefresh()
      }
    } else {
      handleError(res.msg || '获取话题动态失败')
    }
  } catch (err) {
    // 清除加载定时器
    if (loadingTimer.value) {
      clearTimeout(loadingTimer.value)
      loadingTimer.value = null
    }
    showLoading.value = false
    isThrottling.value = true

    // 停止下拉刷新
    if (isRefresh) {
      uni.stopPullDownRefresh()
    }

    if (page.value === 1) {
      isEmpty.value = true
    }
    handleError(err, '获取话题动态失败，请稍后重试')
  }
}


// 处理错误
const handleError = (error, defaultMessage = '操作失败') => {
  console.error('错误详情:', error)
  const message = error?.msg || error?.message || defaultMessage
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

// 返回上一页
const navBack = () => {
  uni.navigateBack()
}

// 点赞回调
const likeClick = (data) => {
  if (data && data.idx !== undefined) {
    list.value[data.idx] = data.item
  }
}

// 卡片更新回调
const onCardUpdate = (data) => {
  if (data && data.idx !== undefined) {
    list.value[data.idx] = data.item
  }
}

// 关闭分享弹窗
const closeShare = () => {
  showShare.value = false
}

// 处理分享事件
const handleShare = (type) => {
  console.log('分享话题:', type, topicInfo)
  uni.showToast({
    title: '分享成功',
    icon: 'success'
  })
  closeShare()
}

// 处理不喜欢事件
const handleDislike = () => {
  console.log('不喜欢话题:', topicInfo)
  uni.showToast({
    title: '已标记为不感兴趣',
    icon: 'success'
  })
  closeShare()
}

// 处理举报事件
const handleReport = () => {
  console.log('举报话题:', topicInfo)
  uni.showToast({
    title: '举报成功',
    icon: 'success'
  })
  closeShare()
}

// 生命周期钩子
onLoad((options) => {
  initPage(options)
})

onPullDownRefresh(() => {
  page.value = 1
  list.value = []
  isEmpty.value = false
  loadStatus.value = 'more'
  loadTopicDynamicList(true)
})

onReachBottom(() => {
  if (loadStatus.value === 'noMore' || !isThrottling.value) return
  page.value++
  loadStatus.value = 'loading'
  loadTopicDynamicList()
})

onPageScroll((e) => {
  const scrollTop = e.scrollTop > 150 ? 150 : e.scrollTop
  navbarTrans.value = scrollTop / 150
})

onUnmounted(() => {
  // 清理定时器
  if (loadingTimer.value) {
    clearTimeout(loadingTimer.value)
    loadingTimer.value = null
  }
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
    debounceTimer.value = null
  }
})

onShareAppMessage(() => {
  return {
    title: topicInfo.title || '话题分享',
    path: `/pages/topic/details?id=${topicId.value}`,
    imageUrl: topicInfo.cover_image || '/static/img/avatar.png'
  }
})

onShareTimeline(() => {
  return {
    title: topicInfo.title || '话题分享',
    query: "id=" + topicId.value,
    imageUrl: topicInfo.cover_image || '/static/img/avatar.png'
  }
})
</script>

<style>
/* 基础样式 */
.container {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  box-sizing: border-box;
}

.nav-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 99;
  box-sizing: border-box;
}

.nav-box .nav-back {
  padding: 0 30rpx;
  width: 34rpx;
  height: 100%;
}

.nav-box .nav-title {
  max-width: 60%;
  font-size: 32rpx;
  font-weight: 700;
}

/* 话题头部区域 */
.topic-header {
  position: relative;
  overflow: hidden;
}

/* 主背景容器 */
.images-box {
  width: 100%;
  flex-direction: column;
  position: relative;
  background: #f8f8f8;
  border-radius: 0 0 24rpx 24rpx;
  overflow: hidden;
}

/* 话题背景图片容器 */
.topic-image-container {
  position: relative;
  width: 100%;
  height: 400rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* 话题背景图片 */
.topic-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

/* 图片点击效果 */
.topic-image-container:active .topic-bg-image {
  transform: scale(0.98);
}

/* 背景遮罩层 */
.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    linear-gradient(to bottom,
      transparent 0%,
      rgba(0,0,0,0.1) 30%,
      rgba(0,0,0,0.4) 70%,
      rgba(0,0,0,0.8) 100%
    ),
    radial-gradient(circle at center bottom,
      rgba(0,0,0,0.2) 0%,
      rgba(0,0,0,0.6) 70%,
      rgba(0,0,0,0.9) 100%
    );

  backdrop-filter: blur(1px) saturate(180%);
  -webkit-backdrop-filter: blur(1px) saturate(180%);

  box-shadow:
    inset 0 -80rpx 120rpx -40rpx rgba(0,0,0,0.4),
    inset 0 80rpx 120rpx -40rpx rgba(0,0,0,0.1);

  transition: all 0.3s ease-out;
}

/* 话题信息叠加层 */
.topic-info-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 40rpx 30rpx 30rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.topic-main-info {
  align-items: flex-start;
  margin-bottom: 20rpx;
  position: relative;
}

/* 话题图标 */
.topic-icon {
  margin-right: 20rpx;
}



.topic-icon-img {
  width: 60rpx;
  height: 60rpx;
  filter: brightness(0) invert(1);
}

/* 话题详情 */
.topic-details {
  flex: 1;
}

.topic-name {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
}



/* 话题描述 */
.topic-description {
  color: rgba(255,255,255,0.9);
  font-size: 24rpx;
  line-height: 1.4;
  margin-bottom: 15rpx;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
}

/* 话题分享按钮 */
.topic-share-btn {
  position: absolute;
  top: 0;
  right: 0;
}

.share-btn-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 2rpx solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
}

.share-btn-wrapper:active {
  transform: scale(0.95);
  background: rgba(255,255,255,0.3);
}

.share-icon {
  width: 36rpx;
  height: 36rpx;
  filter: brightness(0) invert(1);
}



/* 骨架屏样式 */
.skeleton-text {
  width: 200rpx;
  height: 36rpx;
  background: linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.3) 75%);
  background-size: 200% 100%;
  border-radius: 6rpx;
  animation: skeletonLoading 1.5s infinite;
}

.skeleton-stats {
  display: flex;
  gap: 16rpx;
}

.skeleton-item {
  width: 80rpx;
  height: 22rpx;
  background: linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.3) 75%);
  background-size: 200% 100%;
  border-radius: 4rpx;
  animation: skeletonLoading 1.5s infinite;
}

@keyframes skeletonLoading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 分类标签 */
.bar-box {
  position: sticky;
  top: 0;
  z-index: 98;
  width: 100%;
  height: 80rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  margin-top: -24rpx;
  border-radius: 24rpx 24rpx 0 0;
  justify-content: space-between;
  padding: 0 30rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.bar-left {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.bar-box .bar-item {
  padding: 0 30rpx 0 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 0;
}

.bar-item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.bar-item-content text {
  font-weight: 700;
  transition: all 0.3s ease-in-out;
  margin-bottom: 8rpx;
}

.bar-line {
  width: 18rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #000;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.bar-line.active {
  opacity: 1;
}

/* 话题统计信息 */
.topic-stats-right {
  color: #999;
  font-size: 24rpx;
  line-height: 1.4;
}

.topic-stats-right .stat-item {
  font-size: 24rpx;
  font-weight: 400;
}

.topic-stats-right .stat-divider {
  margin: 0 8rpx;
  font-size: 24rpx;
}

/* 内容区域 */
.content-area {
  min-height: 600rpx;
  background: #fff;
}

.dynamic-box {
  width: calc(100% - 16rpx);
  padding: 22rpx 8rpx 0;
}

/* 加载中状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60rpx;
  margin: 20rpx 0;
}

.loading-indicator {
  width: 30rpx;
  height: 30rpx;
  border: 3rpx solid #f3f3f3;
  border-top: 3rpx solid #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-box {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-box image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.empty-box .e1 {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.empty-box .e2 {
  font-size: 24rpx;
  color: #999;
}

/* 提示弹窗 */
.tips-box {
  padding: 20rpx 30rpx;
  border-radius: 12rpx;
  justify-content: center;
}

.tips-box .tips-item {
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

/* 工具类 */
.df {
  display: flex;
  align-items: center;
}

.ohto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>