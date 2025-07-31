<template>
  <view class="container">
    <view class="nav-bar bfw" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="bar-box df" :style="{'height': titleBarHeight + 'px', 'width': '100%'}">
        <view class="bar-back df" @tap="goBack">
          <image src="/static/img/z.png" style="width:34rpx;height:34rpx"></image>
        </view>
        <view class="bar-title ohto">我的纸条</view>
        <view class="notification-btn df">
          <text class="notification-icon">🔔</text>
        </view>
      </view>
      <view class="nav-box df">
        <view
          v-for="(item, index) in barList"
          :key="index"
          class="nav-item df"
          @tap="switchTab"
          :data-idx="index">
          <text :style="{'color': index == currentTab ? '#000' : '#999', 'font-size': index == currentTab ? '28rpx' : '26rpx'}">
            {{ item }}
          </text>
          <view :style="{'opacity': index == currentTab ? 1 : 0}" class="nav-line"></view>
        </view>
      </view>
    </view>

    <view class="content-box" :style="{'margin-top': 'calc(' + (statusBarHeight + titleBarHeight) + 'px + 90rpx)'}">
      <!-- 自定义加载指示器 -->
      <view v-if="loading" class="loading-container">
        <view class="loading-indicator"></view>
      </view>

      <emptyPage
        v-if="isEmpty"
        :title="currentTab == 0 ? '还没有发布过纸条' : '还没有抽到纸条'"
        description="空空如也，等待探索"
        image="/static/img/empty.png"
        :buttonText="currentTab == 0 ? '去发布纸条' : '去抽取纸条'"
        @buttonClick="goToMain"
      />

      <block v-else>
        <view class="paper-list">
          <view
            class="paper-item"
            v-for="item in currentPaperList"
            :key="item.id"
            @click="viewPaperDetail(item)"
          >
            <!-- 用户信息 -->
            <view class="user-info">
              <view class="avatar">
                <image :src="item.avatar || '/static/default-avatar.png'" class="avatar-img"></image>
              </view>
              <view class="user-details">
                <view class="username">{{item.nickname}}</view>
                <view class="user-meta">
                  <text class="gender-icon">{{getGenderIcon(item.sex)}}</text>
                  <text class="age">{{item.age}} · {{item.location}}</text>
                </view>
              </view>
              <view class="type-tag" :class="'type-' + item.type">
                <text class="type-icon">{{getTypeIcon(item.type)}}</text>
                <text class="type-text">{{getTypeText(item.type)}}</text>
              </view>
            </view>

            <!-- 纸条内容 -->
            <view class="paper-content">
              <text class="content-text">{{item.content}}</text>
            </view>

            <!-- 状态信息 -->
            <view class="paper-status">
              <text class="status-text">{{getStatusText(item)}}</text>
              <text class="time-text">{{formatTime(item.create_time)}}</text>
            </view>

            <!-- 回应统计 -->
            <view class="response-info" @click.stop="viewResponses(item)">
              <text class="response-text">共{{item.response_count}}条回应</text>
              <text class="arrow-icon">›</text>
            </view>

            <!-- 回应按钮 -->
            <view class="reply-btn" @click.stop="quickReply(item)">
              <text class="reply-text">回应</text>
            </view>
          </view>
        </view>
      </block>

      <!-- 底部加载状态显示 -->
      <view v-if="currentPaperList.length > 0 && loadStatus === 'noMore'" style="text-align: center; padding: 20rpx 0; color: #999; font-size: 24rpx;">
        没有更多数据了
      </view>
    </view>

    <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
      <view class="tips-box df">
        <view class="tips-item bfh">{{ tipsTitle }}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { getMyTreeHoleBoxList, getMyDrawnBoxList } from '@/api/social.js'
import { checkLogin, toLogin } from '@/libs/login.js'
import emptyPage from '@/components/emptyPage/emptyPage.vue'

export default {
  name: 'MyTreeHole',
  components: {
    emptyPage
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      barList: ['我的纸条', '抽到的纸条'],
      currentTab: 1, // 0-我的纸条 1-抽到的纸条
      myPapers: [], // 我发布的纸条
      drawnPapers: [], // 我抽到的纸条
      loading: false,
      isEmpty: false,
      loadStatus: 'more',
      tipsTitle: '',
      paperList: [ // 模拟数据，用于测试
        {
          id: 1,
          type: 4, // 语音纸条
          content: '',
          nickname: '幽默的麻雀',
          avatar: '',
          sex: 1,
          age: 19,
          location: 'Sub',
          response_count: 1,
          create_time: '2024-01-20 21:09',
          status: 'received', // received-已收到 sent-已发送
          voice_duration: 23
        },
        {
          id: 2,
          type: 1, // 问题
          content: '又爱违者的暂哥滴落我哦',
          nickname: '优雅的巨蜥',
          avatar: '',
          sex: 1,
          age: 24,
          location: 'Sub',
          response_count: 7,
          create_time: '2024-01-20 16:55',
          status: 'received',
          received_count: 53
        },
        {
          id: 3,
          type: 1, // 问题
          content: '有没有资深玩家，做过提高身体阅值的系统脱敏训练，我过相关经验的留言，请简单描述，谢谢！',
          nickname: '忧伤的鲨鱼',
          avatar: '',
          sex: 1,
          age: 37,
          location: 'Dom',
          response_count: 6,
          create_time: '2024-01-20 15:54',
          status: 'received',
          received_count: 91
        }
      ]
    }
  },
  computed: {
    // 当前显示的纸条列表
    currentPaperList() {
      if (this.currentTab === 0) {
        return this.myPapers.length > 0 ? this.myPapers : []
      } else {
        return this.drawnPapers.length > 0 ? this.drawnPapers : []
      }
    }
  },
  onLoad() {
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return
    }
    this.loadData()
  },
  onShow() {
    // 每次显示页面时检查登录状态
    if (!this.checkLoginStatus()) {
      return
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },

    async loadData() {
      if (this.currentTab === 0) {
        await this.loadMyPapers()
      } else {
        await this.loadDrawnPapers()
      }
    },

    async loadMyPapers() {
      console.log('=== 加载我的纸条 ===')
      this.loading = true

      try {
        const params = {
          page: 1,
          limit: 20
        }
        console.log('请求参数:', params)

        const result = await getMyTreeHoleBoxList(params)
        console.log('我的纸条API响应:', result)

        if (result.status === 200 && result.data) {
          this.myPapers = result.data.list || []
          this.isEmpty = this.myPapers.length === 0
          console.log('我的纸条数据:', this.myPapers)

          if (this.myPapers.length > 0) {
            uni.showToast({
              title: `加载了${this.myPapers.length}条纸条`,
              icon: 'none'
            })
          }
        } else {
          this.isEmpty = true
          throw new Error(result.msg || '获取我的纸条失败')
        }
      } catch (error) {
        console.error('加载我的纸条失败:', error)
        uni.showToast({
          title: error.message || '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    async loadDrawnPapers() {
      console.log('=== 加载抽到的纸条 ===')
      this.loading = true

      try {
        const params = {
          page: 1,
          limit: 20
        }
        console.log('请求参数:', params)

        const result = await getMyDrawnBoxList(params)
        console.log('抽到的纸条API响应:', result)

        if (result.status === 200 && result.data) {
          this.drawnPapers = result.data.list || []
          this.isEmpty = this.drawnPapers.length === 0
          console.log('抽到的纸条数据:', this.drawnPapers)

          if (this.drawnPapers.length > 0) {
            uni.showToast({
              title: `加载了${this.drawnPapers.length}条纸条`,
              icon: 'none'
            })
          }
        } else {
          this.isEmpty = true
          throw new Error(result.msg || '获取抽到的纸条失败')
        }
      } catch (error) {
        console.error('加载抽到的纸条失败:', error)
        uni.showToast({
          title: error.message || '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    async switchTab(e) {
      // 获取点击的标签索引
      const clickIdx = parseInt(e.currentTarget.dataset.idx);

      // 如果点击的是当前选中的标签，不重复加载
      if (clickIdx === this.currentTab) {
        return;
      }

      this.currentTab = clickIdx;
      this.isEmpty = false;
      await this.loadData();
    },
    
    getGenderIcon(sex) {
      return sex === 1 ? '♂' : sex === 2 ? '♀' : '⚪'
    },
    
    getTypeIcon(type) {
      const icons = {
        1: '❓',
        2: '🤫', 
        3: '🌠',
        4: '🎵'
      }
      return icons[type] || '📝'
    },
    
    getTypeText(type) {
      const texts = {
        1: '问题咨询',
        2: '秘密',
        3: '心愿',
        4: '语音纸条'
      }
      return texts[type] || '纸条'
    },
    
    getStatusText(item) {
      if (this.currentTab === 0) {
        // 我的纸条
        return `已被${item.received_count || 0}人抽取`
      } else {
        // 抽到的纸条
        return `已被${item.received_count || 0}人抽取`
      }
    },
    
    formatTime(timeStr) {
      const now = new Date()
      const time = new Date(timeStr)
      const diff = now - time
      const minutes = Math.floor(diff / (1000 * 60))

      if (minutes < 60) {
        return `${minutes}分钟前`
      } else if (minutes < 1440) {
        return `${Math.floor(minutes / 60)}小时前`
      } else {
        return `${Math.floor(minutes / 1440)}天前`
      }
    },

    // 统一错误处理
    handleError(error, defaultMessage = '操作失败') {
      console.error('错误处理:', error)

      let message = defaultMessage

      if (typeof error === 'string') {
        message = error
      } else if (error && typeof error === 'object') {
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
          message = '网络连接异常，请检查网络设置'
        } else if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
          message = '请求超时，请稍后重试'
        } else {
          message = error.msg || error.message || error.data?.msg || defaultMessage
        }
      }

      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      })

      return message
    },

    // 检查登录状态
    checkLoginStatus() {
      const isLoggedIn = checkLogin() && this.$store.state.app.token

      if (!isLoggedIn) {
        uni.showModal({
          title: '提示',
          content: '请先登录后查看纸条',
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

    viewPaperDetail(item) {
      console.log('查看纸条详情:', item)
      console.log('当前tab:', this.currentTab === 0 ? '我的纸条' : '抽到的纸条')

      if (!item.id) {
        uni.showToast({
          title: '纸条ID不存在',
          icon: 'none'
        })
        return
      }

      console.log('跳转到详情页面，ID:', item.id)

      // 跳转到详情页面
      uni.navigateTo({
        url: `/pages/note/detail?id=${item.id}`
      })
    },

    viewResponses(item) {
      // 查看回应列表 - 跳转到详情页面
      uni.navigateTo({
        url: `/pages/note/paper-detail?id=${item.id}&type=${item.type}`
      })
    },

    quickReply(item) {
      // 快捷回应 - 跳转到弹窗
      uni.navigateTo({
        url: `/pages/note/tree-hole-detail?id=${item.id}&type=${item.type}`
      })
    },
    
    goToMain() {
      uni.navigateTo({
        url: '/pages/note/manghe'
      })
    },

    // 显示提示信息
    opTipsPopup(msg) {
      this.tipsTitle = msg;
      this.$refs.tipsPopup.open();
      setTimeout(() => {
        this.$refs.tipsPopup.close();
      }, 2000);
    }
  }
}
</script>

<style>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 99;
  box-sizing: border-box;
}
.bar-box .bar-back {
  padding: 0 30rpx;
  width: 34rpx;
  height: 100%;
}
.bar-box .bar-title {
  max-width: 60%;
  font-size: 32rpx;
  font-weight: 700;
  flex: 1;
  text-align: center;
}
.nav-box {
  width: 100%;
  height: 80rpx;
}
.nav-box .nav-item {
  padding: 0 30rpx;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  position: relative;
}
.nav-box .nav-item text {
  font-weight: 700;
  transition: all .3s ease-in-out;
}
.nav-box .nav-line {
  position: absolute;
  bottom: 12rpx;
  width: 18rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #000;
  transition: opacity .3s ease-in-out;
}
.content-box {
  width: calc(100% - 60rpx);
  padding: 30rpx;
}

.notification-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon {
  font-size: 32rpx;
}

/* 加载中状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60rpx;
  margin-bottom: 20rpx;
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

.paper-list {
  width: 100%;
}

/* 纸条项 */
.paper-item {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.gender-icon {
  color: #666;
  font-size: 24rpx;
}

.age {
  color: #666;
  font-size: 24rpx;
}

.type-tag {
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.type-1 { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); }
.type-2 { background: linear-gradient(135deg, #EC4899 0%, #BE185D 100%); }
.type-3 { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
.type-4 { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }

.type-icon,
.type-text {
  color: #fff;
  font-size: 24rpx;
  font-weight: 500;
}

/* 纸条内容 */
.paper-content {
  margin-bottom: 24rpx;
}

.content-text {
  color: #333;
  font-size: 28rpx;
  line-height: 1.6;
}

/* 状态信息 */
.paper-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.status-text {
  color: #999;
  font-size: 24rpx;
}

.time-text {
  color: #999;
  font-size: 24rpx;
}

/* 回应信息 */
.response-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-top: 1rpx solid #f0f0f0;
  margin-bottom: 24rpx;
}

.response-text {
  color: #333;
  font-size: 28rpx;
}

.arrow-icon {
  color: #999;
  font-size: 32rpx;
}

/* 回应按钮 */
.reply-btn {
  width: 100%;
  height: 72rpx;
  background: #f8f9fa;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.reply-btn:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.reply-text {
  color: #666;
  font-size: 28rpx;
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  color: #666;
  font-size: 28rpx;
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
  margin-bottom: 30rpx;
}

.empty-btn {
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  border-radius: 48rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 92, 246, 0.3);
}

.empty-btn-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
}

.df {
  display: flex;
  align-items: center;
}
.bfw {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(255,255,255,.8);
}
.bfh {
  background: #000;
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
}
.tips-box {
  justify-content: center;
  width: 100%;
}
.ohto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>
