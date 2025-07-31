<template>
  <view class="container">
    <view class="nav-bar bfw" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="bar-box df" :style="{'height': titleBarHeight + 'px', 'width': '100%'}">
        <view class="bar-back df" @tap="goBack">
          <image src="/static/img/z.png" style="width:34rpx;height:34rpx"></image>
        </view>
        <view class="bar-title ohto">纸条详情</view>
        <view class="nav-action df" @tap="showMoreActions">
          <text>⋯</text>
        </view>
      </view>
    </view>

    <view class="content-box" :style="{'margin-top': 'calc(' + (statusBarHeight + titleBarHeight) + 'px + 20rpx)'}">
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <view class="loading-indicator"></view>
      </view>

      <!-- 纸条内容 -->
      <view v-else-if="boxData.id" class="content">
      <!-- 纸条信息 -->
      <view class="box-card">
        <!-- 用户信息 -->
        <view class="user-info">
          <view class="avatar">
            <image :src="boxData.avatar || '/static/default-avatar.png'" class="avatar-img"></image>
          </view>
          <view class="user-details">
            <view class="username">{{boxData.nickname || '匿名用户'}}</view>
            <view class="user-meta">
              <text class="gender-icon">{{getGenderIcon(boxData.sex)}}</text>
              <text class="age">{{boxData.age || '未知'}} · {{boxData.location || 'Sub'}}</text>
            </view>
          </view>
          <view class="type-tag" :class="'type-' + boxData.type">
            <text class="type-icon">{{getTypeIcon(boxData.type)}}</text>
            <text class="type-text">{{getTypeText(boxData.type)}}</text>
          </view>
        </view>

        <!-- 纸条内容 -->
        <view class="box-content">
          <!-- 文字内容 -->
          <view v-if="boxData.type !== 4" class="text-content">
            <text class="content-text">{{boxData.content}}</text>
          </view>
          
          <!-- 语音内容 -->
          <view v-else class="voice-content">
            <view class="voice-player" @tap="toggleVoice">
              <text class="voice-icon">{{isPlaying ? '⏸️' : '▶️'}}</text>
              <text class="voice-duration">{{boxData.voice_duration}}s</text>
            </view>
          </view>
        </view>

        <!-- 时间信息 -->
        <view class="time-info">
          <text class="time-text">{{formatTime(boxData.create_time)}}</text>
        </view>
      </view>

      <!-- 回应区域 -->
      <view class="response-section">
        <view class="section-title">
          <text>回应 ({{responses.length}})</text>
        </view>

        <!-- 隐私保护提示 -->
        <view v-if="!isAuthor && responses.length > 0" class="privacy-notice">
          <text class="notice-icon">🔒</text>
          <text class="notice-text">为保护用户隐私，除了您自己的回应外，其他回应者信息将显示为匿名</text>
        </view>

        <!-- 回应列表 -->
        <view class="response-list">
          <view 
            v-for="item in responses" 
            :key="item.id"
            class="response-item"
          >
            <view class="response-user">
              <!-- 纸条作者和回应者本人可以看到真实信息 -->
              <image
                :src="canViewResponseUserInfo(item) ? (item.avatar || '/static/images/def_avatar.png') : '/static/images/def_avatar.png'"
                class="response-avatar"
              ></image>
              <text class="response-username">
                {{canViewResponseUserInfo(item) ? item.nickname : '匿名用户'}}
              </text>
              <text class="response-time">{{formatTime(item.create_time)}}</text>
              <!-- 标识自己的回应 -->
              <text v-if="currentUserId && item.uid === currentUserId" class="my-response-tag">我的回应</text>
            </view>
            <view class="response-content">
              <text>{{item.content}}</text>
            </view>
          </view>
        </view>

        <!-- 回应输入 -->
        <view class="response-input">
          <textarea 
            class="input-area" 
            placeholder="写下你的回应..." 
            maxlength="200" 
            v-model="responseText"
          />
          <view class="input-actions">
            <text class="char-count">{{responseText.length}}/200</text>
            <view class="send-btn" :class="{'active': canSend}" @tap="sendResponse">
              <text>发送</text>
            </view>
          </view>
        </view>
      </view>
    </view>

      <!-- 错误状态 -->
      <view v-else class="error-state">
        <text class="error-icon">😕</text>
        <text class="error-text">纸条不存在或已被删除</text>
        <view class="error-btn" @tap="goBack">
          <text>返回</text>
        </view>
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
import { getTreeHoleBoxDetail, responseTreeHoleBox, getTreeHoleResponseList } from '@/api/social.js'
import { checkLogin, toLogin } from '@/libs/login.js'
import { getUserInfo } from '@/api/user.js'

export default {
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      tipsTitle: '',
      boxId: 0,
      boxData: {},
      responses: [],
      responseText: '',
      loading: false,
      isPlaying: false,
      currentUserId: null // 当前用户ID
    }
  },
  computed: {
    canSend() {
      return this.responseText.trim().length >= 5
    },

    // 判断当前用户是否为纸条作者
    isAuthor() {
      return this.boxData && this.currentUserId && this.boxData.uid === this.currentUserId
    }
  },

  async onLoad(options) {
    console.log('=== 纸条详情页面加载 ===')
    console.log('页面参数:', options)

    // 获取当前用户信息
    await this.getCurrentUser()

    if (options.id) {
      this.boxId = parseInt(options.id)
      this.loadBoxDetail()
    } else {
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      })
    }
  },

  methods: {
    // 判断是否可以查看回应者信息
    canViewResponseUserInfo(responseItem) {
      // 纸条作者可以查看所有回应者信息
      if (this.isAuthor) {
        return true
      }

      // 用户可以查看自己的回应信息
      if (this.currentUserId && responseItem.uid === this.currentUserId) {
        return true
      }

      // 其他情况不能查看
      return false
    },
    goBack() {
      uni.navigateBack()
    },

    // 获取当前用户信息
    async getCurrentUser() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo && userInfo.uid) {
          this.currentUserId = userInfo.uid
          console.log('当前用户ID:', this.currentUserId)
        } else {
          // 如果本地没有，尝试从API获取
          const result = await getUserInfo()
          if (result.status === 200 && result.data) {
            this.currentUserId = result.data.uid
            console.log('从API获取用户ID:', this.currentUserId)
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },

    showMoreActions() {
      uni.showActionSheet({
        itemList: ['举报', '分享'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.reportBox()
          } else if (res.tapIndex === 1) {
            this.shareBox()
          }
        }
      })
    },

    async loadBoxDetail() {
      console.log('=== 加载纸条详情 ===')
      console.log('纸条ID:', this.boxId)
      
      this.loading = true
      
      try {
        const result = await getTreeHoleBoxDetail(this.boxId)
        console.log('详情API响应:', result)

        if (result.status === 200 && result.data) {
          this.boxData = result.data
          console.log('纸条数据:', this.boxData)
          
          // 加载回应列表
          this.loadResponses()
        } else {
          throw new Error(result.msg || '获取纸条详情失败')
        }
      } catch (error) {
        console.error('加载纸条详情失败:', error)
        uni.showToast({
          title: error.message || '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    async loadResponses() {
      try {
        const result = await getTreeHoleResponseList({
          box_id: this.boxId,
          page: 1,
          limit: 50
        })

        if (result.status === 200 && result.data) {
          this.responses = result.data.list || []
          console.log('回应列表:', this.responses)
        }
      } catch (error) {
        console.error('加载回应列表失败:', error)
      }
    },

    async sendResponse() {
      if (!this.canSend) {
        return
      }

      // 检查登录状态
      if (!checkLogin()) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再回应',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              toLogin()
            }
          }
        })
        return
      }

      try {
        const result = await responseTreeHoleBox({
          box_id: this.boxId,
          content: this.responseText.trim()
        })

        if (result.status === 200) {
          uni.showToast({
            title: '回应成功',
            icon: 'success'
          })
          
          this.responseText = ''
          this.loadResponses() // 重新加载回应列表
        } else {
          throw new Error(result.msg || '回应失败')
        }
      } catch (error) {
        console.error('发送回应失败:', error)
        uni.showToast({
          title: error.message || '回应失败',
          icon: 'none'
        })
      }
    },

    toggleVoice() {
      // TODO: 实现语音播放功能
      this.isPlaying = !this.isPlaying
      uni.showToast({
        title: this.isPlaying ? '开始播放' : '暂停播放',
        icon: 'none'
      })
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

    formatTime(time) {
      if (!time) return ''
      
      const now = new Date()
      const createTime = new Date(time)
      const diff = now - createTime
      const minutes = Math.floor(diff / 60000)
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`
      return `${Math.floor(minutes / 1440)}天前`
    },

    reportBox() {
      uni.showToast({
        title: '举报功能开发中',
        icon: 'none'
      })
    },

    shareBox() {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
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
.nav-action {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  padding: 0 30rpx;
}
.content-box {
  width: calc(100% - 60rpx);
  padding: 30rpx;
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

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.error-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.error-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.error-btn {
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  border-radius: 25rpx;
  color: white;
}

.content {
  width: 100%;
}

.box-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20rpx;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.user-meta {
  font-size: 24rpx;
  color: #999;
}

.type-tag {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.type-1 { background: #e3f2fd; color: #1976d2; }
.type-2 { background: #fce4ec; color: #c2185b; }
.type-3 { background: #f3e5f5; color: #7b1fa2; }
.type-4 { background: #e8f5e8; color: #388e3c; }

.box-content {
  margin-bottom: 20rpx;
}

.content-text {
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
}

.voice-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.voice-player {
  display: flex;
  align-items: center;
  gap: 20rpx;
  font-size: 28rpx;
}

.time-info {
  text-align: right;
}

.time-text {
  font-size: 24rpx;
  color: #999;
}

.response-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

/* 隐私保护提示 */
.privacy-notice {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.notice-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  color: #6c757d;
}

.notice-text {
  font-size: 24rpx;
  color: #6c757d;
  line-height: 1.4;
}

.response-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.response-user {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.response-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 15rpx;
}

.response-username {
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 20rpx;
}

.response-time {
  font-size: 24rpx;
  color: #999;
}

.my-response-tag {
  font-size: 20rpx;
  color: #007aff;
  background: #e3f2fd;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  margin-left: 12rpx;
}

.response-content {
  font-size: 28rpx;
  line-height: 1.5;
  color: #333;
}

.response-input {
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.input-area {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 24rpx;
  color: #999;
}

.send-btn {
  padding: 16rpx 32rpx;
  background: #e9ecef;
  border-radius: 20rpx;
  color: #999;
  font-size: 28rpx;
}

.send-btn.active {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
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
