<template>
  <view class="container">
    <!-- 选项卡 -->
    <view class="tab-bar">
      <view
        v-for="(tab, index) in tabList"
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === index }"
        @tap="switchTab(index)"
      >
        <text class="tab-text">{{ tab }}</text>
        <view class="tab-line" v-if="currentTab === index"></view>
      </view>
    </view>

    <!-- 访客统计 -->
    <view class="visitor-stats">
      <view class="stats-item">
        <text class="stats-number">{{ totalVisitors }}</text>
        <text class="stats-label">{{ currentTab === 0 ? '总访客数' : '总浏览数' }}</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-number">{{ todayVisitors }}</text>
        <text class="stats-label">{{ currentTab === 0 ? '今日访客' : '今日浏览' }}</text>
      </view>
    </view>

    <!-- 访客列表 -->
    <view class="visitor-list">
      <!-- 空状态 -->
      <emptyPage
        v-if="isEmpty && !loading"
        title="暂无访客记录"
        description="快去分享你的主页吸引更多访客吧~"
        image="/static/img/empty.png"
      />

      <!-- 访客列表 -->
      <view v-else class="visitor-list-content">
        <view
          v-for="(visitor, index) in visitorList"
          :key="visitor.visitor_uid || index"
          class="visitor-item"
          @tap="goToUserProfile(visitor.visitor_uid)"
        >
          <view class="visitor-row">
            <view class="avatar-wrapper">
              <image
                :src="visitor.avatar || '/static/img/avatar.png'"
                class="visitor-avatar"
                mode="aspectFill"
              ></image>
              <!-- VIP标识 -->
              <view v-if="visitor.vip" class="vip-badge">
                <image :src="visitor.vip_icon" class="vip-icon"></image>
              </view>
            </view>

            <view class="visitor-info">
              <view class="visitor-name-row">
                <text class="visitor-name">{{ visitor.nickname || '匿名用户' }}</text>
                <!-- 性别图标 -->
                <image
                  v-if="visitor.sex === 1"
                  src="/static/img/male.png"
                  class="gender-icon"
                ></image>
                <image
                  v-else-if="visitor.sex === 2"
                  src="/static/img/female.png"
                  class="gender-icon"
                ></image>
                <!-- 认证标识 -->
                <image
                  v-if="visitor.auth_status === 2"
                  src="/static/img/rz.png"
                  class="auth-icon"
                ></image>
              </view>

              <!-- 访问信息 -->
              <view class="visit-info">
                <text class="visit-time">{{ formatVisitTime(visitor.last_visit_time_str || visitor.last_visit_time) }}</text>
                <text class="visit-count">访问{{ visitor.visit_count }}次</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <uni-load-more
      v-if="!isEmpty"
      :status="loadStatus"
      :content-text="loadText"
      @clickLoadMore="loadMore"
    ></uni-load-more>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow, onHide, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { useStore } from 'vuex'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more'
import emptyPage from '@/components/emptyPage/emptyPage.vue'
import { getVisitorDetails } from '@/api/social.js'

// 定义组件名称
defineOptions({
  name: 'VisitorPage'
})

// 使用store
const store = useStore()

// 计算属性
const isLogin = computed(() => store.getters.isLogin)
const userInfo = computed(() => store.getters.userInfo)

// 响应式数据
const tabList = ref(['谁看过我', '我看过谁'])
const currentTab = ref(0)
const visitorList = ref([])
const page = ref(1)
const limit = ref(20)
const totalVisitors = ref(0)
const todayVisitors = ref(0)
const loading = ref(false)
const isEmpty = ref(false)
const loadStatus = ref('more') // more, loading, noMore
const dataFromCenter = ref(false) // 标记是否从center页面获取了数据

// 加载文本配置
const loadText = reactive({
  contentdown: '上拉显示更多',
  contentrefresh: '正在加载...',
  contentnomore: '没有更多数据了'
})

// 初始化页面
const initPage = () => {
  if (!isLogin.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }

  // 延迟加载，等待可能的center页面数据传递
  setTimeout(() => {
    if (visitorList.value.length === 0) {
      loadVisitorData()
    }
  }, 100)
}

// 切换选项卡
const switchTab = (index) => {
  if (currentTab.value === index || loading.value) return

  currentTab.value = index
  page.value = 1
  visitorList.value = []
  isEmpty.value = false
  loadStatus.value = 'more'
  dataFromCenter.value = false // 重置标志位

  // 重新加载数据
  loadVisitorData(true)
}

// 加载访客数据
const loadVisitorData = async (isRefresh = false) => {
  if (loading.value) return

  if (isRefresh) {
    page.value = 1
    visitorList.value = []
    isEmpty.value = false
    loadStatus.value = 'more'
  }

  loading.value = true

  try {
    const res = await getVisitorDetails({
      page: page.value,
      limit: limit.value,
      type: currentTab.value // 0-谁看过我，1-我看过谁
    })

    if (res.status === 200 || res.code === 200) {
      const data = res.data || {}
      const list = data.list || []

      if (isRefresh) {
        visitorList.value = list
      } else {
        visitorList.value = [...visitorList.value, ...list]
      }

      totalVisitors.value = data.total || 0
      calculateTodayVisitors(list)

      // 判断是否还有更多数据
      const hasMore = page.value * limit.value < totalVisitors.value
      if (!hasMore) {
        loadStatus.value = 'noMore'
      }

      // 判断是否为空
      isEmpty.value = visitorList.value.length === 0

    } else {
      handleLoadError(res.msg || '获取访客数据失败')
    }

  } catch (error) {
    handleLoadError('网络错误，请稍后重试')
  } finally {
    loading.value = false

    if (isRefresh) {
      uni.stopPullDownRefresh()
    }
  }
}

// 处理加载错误
const handleLoadError = (message) => {
  uni.showToast({
    title: message,
    icon: 'none'
  })

  if (page.value === 1) {
    isEmpty.value = true
  }
}

// 计算今日访客数
const calculateTodayVisitors = (list) => {
  const today = new Date()
  const todayStr = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0')

  todayVisitors.value = list.filter(visitor => {
    // 处理datetime字符串格式 "2025-07-20 22:21:57"
    if (typeof visitor.last_visit_time_str === 'string') {
      const visitDate = visitor.last_visit_time_str.split(' ')[0] // 获取日期部分
      return visitDate === todayStr
    } else if (typeof visitor.last_visit_time === 'string') {
      const visitDate = visitor.last_visit_time.split(' ')[0] // 获取日期部分
      return visitDate === todayStr
    }
    return false
  }).length
}

// 刷新数据
const refreshData = () => {
  loadVisitorData(true)
}

// 加载更多
const loadMore = () => {
  if (loadStatus.value === 'noMore' || loading.value) return

  loadStatus.value = 'loading'
  page.value++
  loadVisitorData()
}

// 处理从center页面传来的访客数据更新
const handleVisitorUpdate = (data) => {
  if (data && data.visitors && !dataFromCenter.value) {
    visitorList.value = data.visitors
    totalVisitors.value = data.total || 0
    calculateTodayVisitors(data.visitors)
    isEmpty.value = visitorList.value.length === 0

    // 更新分页信息
    if (data.page) {
      page.value = data.page
    }
    if (data.limit) {
      limit.value = data.limit
    }

    // 更新加载状态
    loadStatus.value = data.has_more ? 'more' : 'noMore'

    // 标记已从center获取数据
    dataFromCenter.value = true
  }
}

// 跳转到用户主页
const goToUserProfile = (uid) => {
  if (!uid) return

  uni.navigateTo({
    url: `/pages/user/details?uid=${uid}`
  })
}

// 格式化访问时间
const formatVisitTime = (timeStr) => {
  if (!timeStr) return ''

  // 处理字符串时间格式 "2025-07-20 22:21:57"
  let visitTime
  if (typeof timeStr === 'string') {
    visitTime = new Date(timeStr).getTime()
  } else if (typeof timeStr === 'number') {
    // 如果是时间戳，判断是秒还是毫秒
    visitTime = timeStr > 1000000000000 ? timeStr : timeStr * 1000
  } else {
    return ''
  }

  const now = Date.now()
  const diff = now - visitTime

  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes}分钟前`
  }

  // 小于1天
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}小时前`
  }

  // 小于7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }

  // 超过7天显示具体日期
  const date = new Date(visitTime)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

// 生命周期钩子
onLoad(() => {
  initPage()
})

onShow(() => {
  // 监听从center页面传来的访客数据更新
  uni.$on('updateVisitorList', handleVisitorUpdate)

  // 如果是从其他页面返回，且没有数据，则重新加载
  if (visitorList.value.length === 0 && !loading.value) {
    loadVisitorData(true)
  }
})

onHide(() => {
  // 移除事件监听
  uni.$off('updateVisitorList', handleVisitorUpdate)
})

onPullDownRefresh(() => {
  refreshData()
})

onReachBottom(() => {
  loadMore()
})

// 组件卸载时清理
onUnmounted(() => {
  uni.$off('updateVisitorList', handleVisitorUpdate)
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 选项卡样式 */
.tab-bar {
  display: flex;
  background: white;
  padding: 0 20rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  position: relative;
}

.tab-text {
  font-size: 28rpx;
  color: #999;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-item.active .tab-text {
  color: #333;
  font-weight: bold;
}

.tab-line {
  position: absolute;
  bottom: 0;
  width: 60rpx;
  height: 4rpx;
  background: #333;
  border-radius: 2rpx;
}

/* 访客统计 */
.visitor-stats {
  display: flex;
  background: white;
  padding: 20rpx 30rpx;
  margin-bottom: 10rpx;
  align-items: center;
  justify-content: center;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stats-number {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.2;
}

.stats-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}

.stats-divider {
  width: 1rpx;
  height: 40rpx;
  background-color: #eee;
}

/* 访客列表 */
.visitor-list {
  flex: 1;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
}

/* 访客列表 */
.visitor-list-content {
  background: white;
}

.visitor-item {
  border-bottom: 1rpx solid #f0f0f0;
}

.visitor-item:last-child {
  border-bottom: none;
}

/* 访客行信息 */
.visitor-row {
  display: flex;
  align-items: center;
  padding: 20rpx;
}

.avatar-wrapper {
  position: relative;
  margin-right: 20rpx;
}

.visitor-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.vip-badge {
  position: absolute;
  bottom: -3rpx;
  right: -3rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vip-icon {
  width: 18rpx;
  height: 18rpx;
}

.visitor-info {
  flex: 1;
}

.visitor-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.visitor-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-right: 8rpx;
}

.gender-icon,
.auth-icon {
  width: 24rpx;
  height: 24rpx;
  margin-left: 6rpx;
}

/* 访问信息 */
.visit-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.visit-time {
  font-size: 24rpx;
  color: #666;
  margin-right: 20rpx;
}

.visit-count {
  font-size: 24rpx;
  color: #1890ff;
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
  .visitor-row {
    padding: 15rpx 20rpx;
  }

  .visitor-avatar {
    width: 70rpx;
    height: 70rpx;
  }

  .visitor-name {
    font-size: 26rpx;
  }

  .visitor-stats {
    padding: 15rpx 20rpx;
  }

  .stats-number {
    font-size: 32rpx;
  }

  .tab-text {
    font-size: 26rpx;
  }
}
</style>