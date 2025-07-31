<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="nav-box bfw" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="nav-title df" :style="{'height': titleBarHeight + 'px'}">
        <view>消息</view>
        <view class="nav-del df" @tap="allLook">
          <image src="/static/img/qc.png"></image>
        </view>
      </view>
    </view>

    <!-- 功能图标区域 -->
    <view class="icon-section" :style="{'margin-top': 'calc(' + (statusBarHeight + titleBarHeight) + 'px + 20rpx)'}">
      <view class="icon-row">
        <view class="icon-item" @tap="goToLike">
          <view class="icon-wrapper like-icon">
            <image src="/static/img/qz2.png" class="icon-image"></image>
          </view>
          <text class="icon-label">喜欢</text>
        </view>

        <view class="icon-item" @tap="goToComment">
          <view class="icon-wrapper comment-icon">
            <image src="/static/img/qz2.png" class="icon-image"></image>
          </view>
          <text class="icon-label">评论</text>
        </view>

        <view class="icon-item" @tap="goToFavorite">
          <view class="icon-wrapper favorite-icon">
            <image src="/static/img/qz2.png" class="icon-image"></image>
          </view>
          <text class="icon-label">互动</text>
        </view>

        <view class="icon-item" @tap="goToContacts">
          <view class="icon-wrapper contacts-icon">
            <image src="/static/img/qz2.png" class="icon-image"></image>
            <view v-if="contactsCount > 0" class="icon-badge">{{ contactsCount }}</view>
          </view>
          <text class="icon-label">系统</text>
        </view>
      </view>
    </view>
    <!-- 消息列表 -->
    <view class="message-list">
      <emptyPage
        v-if="isEmpty"
        title="暂无相关通知"
        description="在信息爆炸的时代，这里格外宁静"
        image="/static/img/empty.png"
      />

      <block v-else>
        <view v-for="(item, index) in messageList" :key="index" class="message-item" @tap="() => handleMessageClick(item, index)">
          <view class="message-left">
            <view class="message-icon-wrapper" :class="item.iconClass">
              <image src="/static/img/qz2.png" class="message-icon"></image>
            </view>
          </view>

          <view class="message-content">
            <view class="message-header">
              <text class="message-title">{{ item.title }}</text>
              <view class="message-right">
                <text class="message-time">{{ item.time }}</text>
                <view v-if="item.unreadCount > 0" class="message-badge">{{ item.unreadCount }}</view>
              </view>
            </view>
            <view class="message-desc">{{ item.description }}</view>
          </view>
        </view>
      </block>

      <uni-load-more v-if="!isEmpty" :status="loadStatus"></uni-load-more>
    </view>
    <uni-popup ref="morePopup" type="bottom" :safe-area="false">
      <view class="more-popup" catchtouchmove="true">
        <view class="more-item df" @tap="readNotice">
          <text>已读</text>
          <image src="/static/img/temp/mail.png"></image>
        </view>
        <view class="more-item df" @tap="delNotice">
          <text style="color:#FA5150">删除</text>
          <image src="/static/img/temp/del_r.png"></image>
        </view>
        <view class="more-item" @tap="closeMoreClick">
          <text style="color:#999">取消</text>
        </view>
      </view>
    </uni-popup>
    <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
      <view class="tips-box df">
        <view class="tips-item bfh">{{tipsTitle}}</view>
      </view>
    </uni-popup>
    <tabbar v-if="true" :currentPage="3" :currentMsg="currentMsg"></tabbar>
  </view>
</template>

<script>
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more'
import tabbar from '@/components/tabbar/tabbar'
import emptyPage from '@/components/emptyPage/emptyPage.vue'

export default {
  components: {
    uniLoadMore,
    tabbar,
    emptyPage
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      currentMsg: 0,
      contactsCount: 2, // 人脉红点数量
      isEmpty: false,
      loadStatus: 'more',
      tipsTitle: '',
      // 消息列表数据
      messageList: [
        {
          id: 1,
          title: '应用消息',
          description: '生活是流星，开启一段新的旅行',
          time: '18:36',
          unreadCount: 1,
          iconClass: 'app-icon',
          type: 'app'
        },
        {
          id: 2,
          title: '系统公告',
          description: '熟读《图鸟人脉防骗指南》',
          time: '12:29',
          unreadCount: 12,
          iconClass: 'system-icon',
          type: 'system'
        },
        {
          id: 3,
          title: '人脉通知',
          description: '有两位新的朋友申请待通过',
          time: '11:06',
          unreadCount: 2,
          iconClass: 'contact-icon',
          type: 'contact'
        },
        {
          id: 4,
          title: '智能助手',
          description: '人工智能，助力您的魅力值提升',
          time: '10:68',
          unreadCount: 0,
          iconClass: 'ai-icon',
          type: 'ai'
        },
        {
          id: 5,
          title: '付衣衣',
          description: '我喜欢你，就像你喜欢我一样',
          time: '08:26',
          unreadCount: 0,
          iconClass: 'user-icon',
          type: 'user',
          avatar: '/static/img/logo.png'
        }
      ]
    }
  },
  async onLoad() {
    this.$store.commit('SET_CURRENT_MSG', false)
    await this.$onLaunched
    this.$store.commit('SET_CURRENT_MSG', true)

    // 初始化页面数据
    this.initPageData()
  },
  onShow() {
    // 每次显示页面时更新消息数量
    this.initPageData()
  },
  onPullDownRefresh() {
    this.initPageData()
    uni.stopPullDownRefresh()
  },

  onReachBottom() {
    // 这里可以实现加载更多逻辑
    console.log('到达底部，可以加载更多消息')
  },
  onShareAppMessage() {
    return {
      title: this.$store.state.appInfo?.title || '小程序示例',
      imageUrl: this.$store.state.appInfo?.shareImg || '/static/img/temp/1.jpg'
    }
  },
  onShareTimeline() {
    return {
      title: this.$store.state.appInfo?.title || '小程序示例',
      imageUrl: this.$store.state.appInfo?.shareImg || '/static/img/temp/1.jpg'
    }
  },
  methods: {
    // 顶部功能图标点击事件
    goToLike() {
      uni.navigateTo({
        url: '/pages/like/index'
      })
    },

    goToComment() {
      uni.navigateTo({
        url: '/pages/comment/index'
      })
    },

    goToFavorite() {
      uni.navigateTo({
        url: '/pages/favorite/index'
      })
    },

    goToContacts() {
      uni.navigateTo({
        url: '/pages/contacts/index'
      })
    },

    // 消息项点击事件
    handleMessageClick(item, index) {
      // 根据消息类型跳转到不同页面
      switch(item.type) {
        case 'app':
          uni.navigateTo({
            url: '/pages/app-message/index'
          })
          break
        case 'system':
          uni.navigateTo({
            url: '/pages/system-notice/index'
          })
          break
        case 'contact':
          uni.navigateTo({
            url: '/pages/contact-notice/index'
          })
          break
        case 'ai':
          uni.navigateTo({
            url: '/pages/ai-assistant/index'
          })
          break
        case 'user':
          uni.navigateTo({
            url: '/pages/chat/index?userId=' + item.id
          })
          break
        default:
          console.log('未知消息类型')
      }

      // 如果有未读消息，标记为已读
      if (item.unreadCount > 0) {
        this.markAsRead(item, index)
      }
    },

    // 标记消息为已读
    markAsRead(item, index) {
      this.messageList[index].unreadCount = 0
      // 这里可以调用API标记为已读
      console.log('标记消息已读:', item.title)
    },

    // 初始化页面数据
    initPageData() {
      // 计算总的未读消息数量
      this.currentMsg = this.messageList.reduce((total, item) => total + item.unreadCount, 0)

      // 更新全局消息状态
      if (this.currentMsg > 0) {
        this.$store.commit('SET_UNREAD_MESSAGE_COUNT', this.currentMsg)
      }
    },

    // 全部标记为已读
    allLook() {
      if (this.currentMsg === 0) {
        uni.showToast({
          title: '暂无未读消息！',
          icon: 'none'
        })
        return
      }

      // 标记所有消息为已读
      this.messageList.forEach(item => {
        item.unreadCount = 0
      })

      this.currentMsg = 0
      this.contactsCount = 0

      // 更新全局状态
      this.$store.commit('SET_UNREAD_MESSAGE_COUNT', 0)

      uni.showToast({
        title: '已将所有消息标记为已读！',
        icon: 'success'
      })
    },

    // 提示弹窗
    opTipsPopup(title) {
      this.tipsTitle = title
      this.$refs.tipsPopup.open()

      setTimeout(() => {
        this.$refs.tipsPopup.close()
      }, 2000)
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background: #f8f8f8;
}

/* 顶部导航栏 */
.nav-box {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 99;
  box-sizing: border-box;
}

.nav-box .nav-title {
  padding: 0 30rpx;
  font-size: 40rpx;
  font-weight: 700;
}

.nav-title .nav-del {
  margin-left: 15rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #f8f8f8;
  border: 1px solid #f5f5f5;
  justify-content: center;
}

.nav-title .nav-del image {
  width: 28rpx;
  height: 28rpx;
}

.df {
  display: flex;
  align-items: center;
}

.bfw {
  background: #fff;
}

/* 功能图标区域 */
.icon-section {
  padding: 20rpx 30rpx;
  background: #fff;
}

.icon-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.icon-wrapper {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.like-icon {
  background: linear-gradient(135deg, #ff6b9d, #ff8a9b);
}

.comment-icon {
  background: linear-gradient(135deg, #ffd93d, #ffb347);
}

.favorite-icon {
  background: linear-gradient(135deg, #6bcf7f, #4ecdc4);
}

.contacts-icon {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
}

.icon-image {
  width: 48rpx;
  height: 48rpx;
  filter: brightness(0) invert(1);
}

.icon-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 34rpx;
  height: 34rpx;
  line-height: 34rpx;
  text-align: center;
  font-size: 20rpx;
  font-weight: 700;
  color: #fff;
  background: #ff4757;
  border-radius: 34rpx;
  border: 2rpx solid #fff;
}

.icon-label {
  font-size: 24rpx;
  color: #999;
  font-weight: 400;
}

/* 消息列表 */
.message-list {
  background: #fff;
  margin-top: 20rpx;
  padding-bottom: 180rpx;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1px solid #f5f5f5;
}

.message-item:last-child {
  border-bottom: none;
}

.message-left {
  margin-right: 24rpx;
}

.message-icon-wrapper {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-icon {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
}

.system-icon {
  background: linear-gradient(135deg, #ffd93d, #ffb347);
}

.contact-icon {
  background: linear-gradient(135deg, #6bcf7f, #4ecdc4);
}

.ai-icon {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
}

.user-icon {
  background: #f5f5f5;
  border-radius: 50%;
  overflow: hidden;
}

.message-icon {
  width: 40rpx;
  height: 40rpx;
  filter: brightness(0) invert(1);
}

.user-icon .message-icon {
  width: 80rpx;
  height: 80rpx;
  filter: none;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.message-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #000;
}

.message-right {
  display: flex;
  align-items: center;
}

.message-time {
  font-size: 24rpx;
  color: #999;
  margin-right: 12rpx;
}

.message-badge {
  min-width: 34rpx;
  height: 34rpx;
  line-height: 34rpx;
  text-align: center;
  font-size: 20rpx;
  font-weight: 700;
  color: #fff;
  background: #ff4757;
  border-radius: 34rpx;
}

.message-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.4;
}

/* 空状态 */
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  background: #fff;
}

.empty-image {
  width: 280rpx;
  height: 280rpx;
  opacity: 0.6;
}

.empty-title {
  margin-top: 40rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.empty-desc {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #999;
}

/* 弹窗样式 */
.more-popup {
  width: 100%;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  overflow: hidden;
}

.more-popup .more-item {
  width: calc(100% - 60rpx);
  padding: 30rpx;
  font-size: 26rpx;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.more-popup .more-item:first-child {
  padding-top: 40rpx;
}

.more-popup .more-item:last-child {
  padding-bottom: 80rpx;
}

.more-popup .more-item image {
  width: 36rpx;
  height: 36rpx;
}

.tips-box {
  width: 100%;
  display: flex;
  justify-content: center;
}

.tips-item {
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}
</style>
