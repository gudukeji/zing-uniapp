<template>
  <view class="tree-hole-container">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="star star1"></view>
      <view class="star star2"></view>
      <view class="star star3"></view>
      <view class="star star4"></view>
      <view class="star star5"></view>
    </view>

    <!-- 顶部导航 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-left"></text>
      </view>
      <view class="header-title">
        <view class="title-circle">
          <text class="title-text">树洞盲盒</text>
        </view>
      </view>
      <view class="header-placeholder"></view>
    </view>

    <!-- 我的纸条按钮 - 右侧中间 -->
    <view class="my-box-floating-btn" @click="goMyBox">
      <view class="floating-btn-icon">📝</view>
      <text class="floating-btn-text">我的纸条</text>
    </view>

    <!-- 类型选择器 -->
    <view class="type-selector">
      <!-- 波浪背景 -->
      <view class="wave-bg">
        <view class="wave wave1"></view>
        <view class="wave wave2"></view>
        <view class="wave wave3"></view>
      </view>

      <view
        class="type-item"
        :class="{active: currentType === item.value}"
        v-for="(item, index) in typeList"
        :key="item.value"
        :style="{animationDelay: index * 0.2 + 's'}"
        @click="selectType(item.value)"
      >
        <view class="type-circle">
          <view class="icon-glow"></view>
          <text class="type-icon">{{item.icon}}</text>
        </view>
        <text class="type-name">{{item.name}}</text>
      </view>
    </view>

    <!-- 主要盲盒区域 -->
    <view class="main-box-area">
      <!-- 魔法光环 -->
      <view class="magic-circle">
        <view class="magic-ring ring1"></view>
        <view class="magic-ring ring2"></view>
        <view class="magic-ring ring3"></view>
      </view>

      <!-- 盲盒容器 -->
      <view class="box-container" @click="drawBox">
        <view class="box-glow"></view>
        <view class="box-3d">
          <view class="box-face box-front">
            <view class="question-container">
              <text class="box-question">?</text>
              <view class="question-sparkles">
                <view class="sparkle sparkle1">✨</view>
                <view class="sparkle sparkle2">✨</view>
                <view class="sparkle sparkle3">✨</view>
              </view>
            </view>
          </view>
          <view class="box-face box-top"></view>
          <view class="box-face box-right"></view>
        </view>

        <!-- 增强纸条效果 -->
        <view class="papers">
          <view class="paper paper1">
            <view class="paper-content">💭</view>
          </view>
          <view class="paper paper2">
            <view class="paper-content">🤫</view>
          </view>
          <view class="paper paper3">
            <view class="paper-content">🌟</view>
          </view>
          <view class="paper paper4">
            <view class="paper-content">🎵</view>
          </view>
          <view class="paper paper5">
            <view class="paper-content">💝</view>
          </view>
        </view>
      </view>

      <!-- 增强提示文字 -->
      <view class="hint-text">
        <view class="hint-decoration left"></view>
        <text class="hint-icon">💝</text>
        <text class="hint-content">倾听秘密，邂逅缘分</text>
        <text class="hint-icon">💝</text>
        <view class="hint-decoration right"></view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <view class="action-btn draw-btn" @click="drawBox">
        <text class="btn-text">抽取纸条</text>
      </view>
      <view class="action-btn publish-btn" @click="publishBox">
        <text class="btn-text">放入纸条</text>
      </view>
    </view>

    <!-- 底部说明 -->
    <view class="bottom-tip">
      <text class="tip-text">如何投送纸条呢</text>
      <text class="tip-icon">?</text>
    </view>

    <!-- 纸条详情弹窗 -->
    <view v-if="showDetailModal" class="detail-modal">
      <!-- 背景遮罩 -->
      <view class="modal-overlay" @click="closeDetailModal"></view>

      <!-- 弹窗内容 -->
      <view class="modal-content">
        <!-- 顶部装饰 -->
        <view class="modal-header">
          <view class="paper-icon">📄</view>
          <view class="sparkles">
            <text class="sparkle">✨</text>
            <text class="sparkle">✨</text>
          </view>
        </view>

        <!-- 标题 -->
        <view class="modal-title">
          <text>抽到纸条啦～</text>
          <view class="info-icon">ⓘ</view>
        </view>

        <!-- 用户信息卡片 -->
        <view v-if="currentBoxData" class="user-card">
          <view class="user-avatar">
            <image :src="currentBoxData.avatar || '/static/default-avatar.png'" class="avatar-image"></image>
          </view>
          <view class="user-info-text">
            <view class="user-name">{{currentBoxData.nickname || '匿名用户'}}</view>
            <view class="user-details">
              <text class="gender">{{getGenderIcon(currentBoxData.sex)}}</text>
              <text class="age-location">{{currentBoxData.age || '24'}} · {{currentBoxData.location || 'Sub'}}</text>
            </view>
          </view>
          <view class="type-badge" :class="'badge-type-' + currentBoxData.type">
            <text class="badge-icon">{{getTypeIcon(currentBoxData.type)}}</text>
            <text class="badge-text">{{getTypeText(currentBoxData.type)}}</text>
          </view>
        </view>

        <!-- 纸条内容 -->
        <view v-if="currentBoxData" class="paper-content">
          <!-- 文字内容 -->
          <view v-if="currentBoxData.type !== 4" class="content-text">
            {{currentBoxData.content}}
          </view>

          <!-- 语音内容 -->
          <view v-else class="voice-section">
            <view class="voice-player" @click="toggleVoice">
              <text class="voice-icon">{{isPlaying ? '⏸️' : '▶️'}}</text>
              <text class="voice-duration">{{currentBoxData.voice_duration}}s</text>
            </view>
          </view>
        </view>

        <!-- 回应区域 -->
        <view class="response-section">
          <view class="response-header">
            <text class="response-count">共 {{responseCount}} 条回应</text>
          </view>

          <!-- 回应输入框 -->
          <view class="response-input">
            <textarea
              class="input-field"
              placeholder="礼貌和真诚，才能收获对方的好感哦～"
              maxlength="100"
              v-model="responseText"
            />
            <view class="input-counter">{{responseText.length}}/100</view>
          </view>
        </view>

        <!-- 底部按钮 -->
        <view class="bottom-actions">
          <view class="action-button secondary" @click="returnBox">
            <text>放回</text>
          </view>
          <view class="action-button primary" @click="sendResponse">
            <text>回应</text>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
import { drawTreeHoleBox, responseTreeHoleBox, returnTreeHoleBox } from '@/api/social.js'
import { checkLogin, toLogin } from '@/libs/login.js'

export default {
  name: 'TreeHoleBox',
  data() {
    return {
      currentType: 0, // 0-随机 1-问题 2-秘密 3-心愿 4-语音
      typeList: [
        { value: 0, name: '随机', icon: '🎲' },
        { value: 1, name: '问题', icon: '❓' },
        { value: 2, name: '秘密', icon: '🤫' },
        { value: 3, name: '心愿', icon: '🌠' },
        { value: 4, name: '语音', icon: '🎵' }
      ],
      showDetailModal: false, // 是否显示详情弹窗
      currentBoxData: null, // 当前抽取的纸条数据
      currentDrawId: null, // 当前抽取记录ID
      isPlaying: false, // 语音播放状态
      responseText: '', // 回应内容
      responseCount: 0 // 回应数量
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },

    // 前往我的盲盒
    goMyBox() {
      uni.navigateTo({
        url: '/pages/note/my-tree-hole'
      })
    },

    // 选择类型
    selectType(type) {
      this.currentType = type
      // TODO: 根据类型筛选盲盒
    },

    // 抽取盲盒
    async drawBox() {
      console.log('=== 开始抽取盲盒 ===')
      console.log('当前选择类型:', this.currentType)

      // 检查登录状态
      if (!this.checkLoginStatus()) {
        return
      }

      uni.showToast({
        title: '正在为您抽取纸条...',
        icon: 'loading'
      })

      try {
        // 调用API抽取盲盒
        const requestData = {
          type: this.currentType // 根据当前选择的类型抽取
        }
        console.log('抽取请求参数:', requestData)

        const result = await drawTreeHoleBox(requestData)
        console.log('抽取API响应:', result)

        if (result.status === 200 && result.data) {
          console.log('抽取成功，纸条数据:', result.data)
          this.currentBoxData = result.data
          this.currentDrawId = result.data.draw_id || null // 保存抽取记录ID
          this.responseCount = result.data.response_count || 0

          uni.hideToast()
          uni.showToast({
            title: '抽取成功！',
            icon: 'success'
          })

          // 显示详情弹窗
          setTimeout(() => {
            this.showDetailModal = true
          }, 1500)
        } else {
          throw new Error(result.msg || '抽取失败')
        }
      } catch (error) {
        console.error('抽取盲盒失败:', error)
        uni.hideToast()

        // 显示具体错误信息
        uni.showToast({
          title: error.message || '抽取失败，请稍后重试',
          icon: 'none',
          duration: 2000
        })

        // 如果是网络错误或服务器错误，可以考虑使用模拟数据
        if (error.message && error.message.includes('网络')) {
          console.log('网络错误，使用模拟数据')
          this.showMockData()
        }
      }
    },

    // 关闭详情弹窗
    closeDetailModal() {
      this.showDetailModal = false
      this.currentBoxData = null
      this.currentDrawId = null
      this.isPlaying = false
      this.responseText = ''
      this.responseCount = 0
    },

    // 放回纸条
    async returnBox() {
      if (!this.currentDrawId) {
        uni.showToast({
          title: '抽取记录不存在',
          icon: 'none'
        })
        return
      }

      uni.showModal({
        title: '确认放回',
        content: '确定要放回这张纸条吗？放回后将不再显示在您的抽取列表中。',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: '正在放回...'
              })

              console.log('放回纸条，draw_id:', this.currentDrawId)
              const result = await returnTreeHoleBox(this.currentDrawId)

              uni.hideLoading()

              if (result.status === 200) {
                uni.showToast({
                  title: '已放回纸条',
                  icon: 'success'
                })

                setTimeout(() => {
                  this.closeDetailModal()
                }, 1500)
              } else {
                throw new Error(result.msg || '放回失败')
              }
            } catch (error) {
              console.error('放回纸条失败:', error)
              uni.hideLoading()

              uni.showToast({
                title: error.message || '放回失败，请稍后重试',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    // 发送回应
    async sendResponse() {
      if (!this.responseText.trim()) {
        uni.showToast({
          title: '请输入回应内容',
          icon: 'none'
        })
        return
      }

      if (this.responseText.length < 5) {
        uni.showToast({
          title: '回应内容至少5个字符',
          icon: 'none'
        })
        return
      }

      if (!this.currentBoxData || !this.currentBoxData.id) {
        uni.showToast({
          title: '纸条信息不存在',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({
          title: '正在发送回应...'
        })

        const responseData = {
          box_id: this.currentBoxData.id,
          content: this.responseText.trim()
        }

        // 如果有抽取记录ID，添加到请求中
        if (this.currentDrawId) {
          responseData.draw_id = this.currentDrawId
        }

        console.log('发送回应，参数:', responseData)
        const result = await responseTreeHoleBox(responseData)

        uni.hideLoading()

        if (result.status === 200) {
          uni.showToast({
            title: '回应成功',
            icon: 'success'
          })

          // 保存box_id，避免在setTimeout中访问已清空的数据
          const boxId = this.currentBoxData.id

          // 跳转到详情页面
          setTimeout(() => {
            this.closeDetailModal()
            uni.navigateTo({
              url: `/pages/note/detail?id=${boxId}`
            })
          }, 1500)
        } else {
          throw new Error(result.msg || '回应失败')
        }
      } catch (error) {
        console.error('发送回应失败:', error)
        uni.hideLoading()

        uni.showToast({
          title: error.message || '回应失败，请稍后重试',
          icon: 'none'
        })
      }
    },

    // 切换语音播放
    toggleVoice() {
      if (!this.currentBoxData || !this.currentBoxData.voice_url) {
        uni.showToast({
          title: '暂无语音内容',
          icon: 'none'
        })
        return
      }

      this.isPlaying = !this.isPlaying

      if (this.isPlaying) {
        // TODO: 实现语音播放
        uni.showToast({
          title: '开始播放语音',
          icon: 'none'
        })
      } else {
        // TODO: 停止语音播放
        uni.showToast({
          title: '停止播放语音',
          icon: 'none'
        })
      }
    },

    // 获取性别图标
    getGenderIcon(sex) {
      return sex === 1 ? '♂' : sex === 2 ? '♀' : '⚪'
    },

    // 获取类型图标
    getTypeIcon(type) {
      const icons = {
        1: '❓',
        2: '🤫',
        3: '🌠',
        4: '🎵'
      }
      return icons[type] || '📝'
    },

    // 获取类型文本
    getTypeText(type) {
      const texts = {
        1: '问题咨询',
        2: '秘密',
        3: '心愿',
        4: '语音纸条'
      }
      return texts[type] || '纸条'
    },



    // 获取随机内容
    getRandomContent(type) {
      const contents = {
        1: ['有什么好的学习方法吗？', '如何提高工作效率？', '怎样保持健康的生活习惯？'],
        2: ['其实我一直很喜欢你', '我有一个不为人知的梦想', '有些话我一直不敢说出口'],
        3: ['希望能找到真爱', '想要环游世界', '希望家人身体健康'],
        4: ['这是一条语音纸条', '听听我的心声吧', '用声音传递温暖']
      }
      const typeContents = contents[type] || ['这是一张神秘的纸条']
      return typeContents[Math.floor(Math.random() * typeContents.length)]
    },

    // 获取随机昵称
    getRandomNickname() {
      const adjectives = ['优雅的', '神秘的', '可爱的', '勇敢的', '温柔的', '聪明的']
      const animals = ['小猫', '小狗', '兔子', '熊猫', '狐狸', '小鸟']
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
      const animal = animals[Math.floor(Math.random() * animals.length)]
      return adj + animal
    },

    // 发布盲盒
    publishBox() {
      // 检查登录状态
      if (!this.checkLoginStatus()) {
        return
      }

      uni.navigateTo({
        url: '/pages/note/publish-tree-hole-simple'
      })
    },

    // 检查登录状态
    checkLoginStatus() {
      console.log('=== 主页登录状态检查 ===')

      const checkLoginResult = checkLogin()
      const storeToken = this.$store?.state?.app?.token
      const isLoggedIn = checkLoginResult && storeToken

      console.log('checkLogin()结果:', checkLoginResult)
      console.log('store token:', storeToken)
      console.log('最终登录状态:', isLoggedIn)

      if (!isLoggedIn) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再使用此功能',
          confirmText: '去登录',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              toLogin()
            }
          }
        })
        return false
      }

      return true
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
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-hole-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #6B46C1 0%, #3B1F8B 50%, #1E0A4F 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰星星 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.star {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.3) 100%);
  border-radius: 50%;
  animation: twinkle 3s infinite;
  box-shadow: 0 0 20rpx rgba(255, 255, 255, 0.5);
}

.star1 {
  top: 15%; left: 10%;
  animation-delay: 0s;
  background: radial-gradient(circle, rgba(168, 85, 247, 1) 0%, rgba(168, 85, 247, 0.3) 100%);
  box-shadow: 0 0 20rpx rgba(168, 85, 247, 0.5);
}

.star2 {
  top: 25%; right: 15%;
  animation-delay: 0.8s;
  background: radial-gradient(circle, rgba(236, 72, 153, 1) 0%, rgba(236, 72, 153, 0.3) 100%);
  box-shadow: 0 0 20rpx rgba(236, 72, 153, 0.5);
}

.star3 {
  top: 55%; left: 20%;
  animation-delay: 1.6s;
  background: radial-gradient(circle, rgba(245, 158, 11, 1) 0%, rgba(245, 158, 11, 0.3) 100%);
  box-shadow: 0 0 20rpx rgba(245, 158, 11, 0.5);
}

.star4 {
  top: 75%; right: 25%;
  animation-delay: 2.4s;
  background: radial-gradient(circle, rgba(34, 197, 94, 1) 0%, rgba(34, 197, 94, 0.3) 100%);
  box-shadow: 0 0 20rpx rgba(34, 197, 94, 0.5);
}

.star5 {
  top: 40%; left: 70%;
  animation-delay: 1.2s;
  background: radial-gradient(circle, rgba(59, 130, 246, 1) 0%, rgba(59, 130, 246, 0.3) 100%);
  box-shadow: 0 0 20rpx rgba(59, 130, 246, 0.5);
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1) rotate(0deg);
  }
  25% {
    opacity: 0.8;
    transform: scale(1.3) rotate(90deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.5) rotate(180deg);
  }
  75% {
    opacity: 0.8;
    transform: scale(1.3) rotate(270deg);
  }
}

/* 顶部导航 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80rpx 40rpx 40rpx;
  position: relative;
  z-index: 10;
}

.back-btn {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10rpx);
}

.back-btn .iconfont {
  color: #fff;
  font-size: 32rpx;
}

.header-title {
  flex: 1;
  display: flex;
  justify-content: center;
}

.title-circle {
  background: linear-gradient(135deg, #A855F7 0%, #EC4899 100%);
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(168, 85, 247, 0.3);
}

.title-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.header-placeholder {
  width: 80rpx;
  height: 80rpx;
}

/* 我的纸条浮动按钮 - 右侧中间 */
.my-box-floating-btn {
  position: fixed;
  right: 40rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #A855F7 0%, #EC4899 100%);
  border-radius: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8rpx 32rpx rgba(168, 85, 247, 0.4),
    0 0 60rpx rgba(168, 85, 247, 0.2);
  backdrop-filter: blur(10rpx);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  z-index: 100;
  transition: all 0.3s ease;
  animation: floatingPulse 3s ease-in-out infinite;
}

.my-box-floating-btn:active {
  transform: translateY(-50%) scale(0.9);
}

.floating-btn-icon {
  font-size: 32rpx;
  margin-bottom: 8rpx;
}

.floating-btn-text {
  color: #fff;
  font-size: 20rpx;
  font-weight: 500;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

@keyframes floatingPulse {
  0%, 100% {
    transform: translateY(-50%) scale(1);
    box-shadow:
      0 8rpx 32rpx rgba(168, 85, 247, 0.4),
      0 0 60rpx rgba(168, 85, 247, 0.2);
  }
  50% {
    transform: translateY(-50%) scale(1.05);
    box-shadow:
      0 12rpx 40rpx rgba(168, 85, 247, 0.6),
      0 0 80rpx rgba(168, 85, 247, 0.4);
  }
}

/* 类型选择器 */
.type-selector {
  display: flex;
  justify-content: space-around;
  padding: 60rpx 40rpx;
  position: relative;
  z-index: 10;
  overflow: hidden;
}

/* 波浪背景 */
.wave-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.wave {
  position: absolute;
  top: 50%;
  left: -100%;
  width: 200%;
  height: 200rpx;
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  border-radius: 50%;
  animation: waveMove 4s ease-in-out infinite;
}

.wave1 {
  animation-delay: 0s;
  background: linear-gradient(90deg,
    transparent,
    rgba(168, 85, 247, 0.2),
    transparent
  );
}

.wave2 {
  animation-delay: 1.3s;
  background: linear-gradient(90deg,
    transparent,
    rgba(236, 72, 153, 0.2),
    transparent
  );
}

.wave3 {
  animation-delay: 2.6s;
  background: linear-gradient(90deg,
    transparent,
    rgba(245, 158, 11, 0.2),
    transparent
  );
}

@keyframes waveMove {
  0% {
    left: -100%;
    transform: translateY(-50%) scaleY(0.5);
  }
  50% {
    left: 0%;
    transform: translateY(-50%) scaleY(1);
  }
  100% {
    left: 100%;
    transform: translateY(-50%) scaleY(0.5);
  }
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.4s ease;
  position: relative;
  z-index: 2;
  animation: typeFloat 3s ease-in-out infinite;
}

.type-item.active .type-circle {
  background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
  transform: scale(1.2);
  box-shadow:
    0 8rpx 32rpx rgba(245, 158, 11, 0.6),
    0 0 60rpx rgba(245, 158, 11, 0.3);
}

.type-item.active .icon-glow {
  opacity: 1;
  transform: scale(1.5);
}

.type-circle {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  backdrop-filter: blur(15rpx);
  transition: all 0.4s ease;
  position: relative;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.icon-glow {
  position: absolute;
  top: -10rpx;
  left: -10rpx;
  right: -10rpx;
  bottom: -10rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: all 0.4s ease;
}

.type-icon {
  font-size: 36rpx;
  position: relative;
  z-index: 1;
}

.type-name {
  color: #fff;
  font-size: 24rpx;
  opacity: 0.9;
  font-weight: 500;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

@keyframes typeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

/* 主要盲盒区域 */
.main-box-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  position: relative;
  z-index: 10;
}

/* 魔法光环 */
.magic-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.magic-ring {
  position: absolute;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  animation: magicRotate 8s linear infinite;
}

.ring1 {
  width: 400rpx;
  height: 400rpx;
  top: -200rpx;
  left: -200rpx;
  animation-duration: 8s;
}

.ring2 {
  width: 500rpx;
  height: 500rpx;
  top: -250rpx;
  left: -250rpx;
  animation-duration: 12s;
  animation-direction: reverse;
}

.ring3 {
  width: 600rpx;
  height: 600rpx;
  top: -300rpx;
  left: -300rpx;
  animation-duration: 16s;
}

@keyframes magicRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.box-container {
  position: relative;
  margin-bottom: 60rpx;
  z-index: 2;
}

.box-glow {
  position: absolute;
  top: -50rpx;
  left: -50rpx;
  right: -50rpx;
  bottom: -50rpx;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

/* 3D盲盒效果 */
.box-3d {
  width: 300rpx;
  height: 300rpx;
  position: relative;
  transform-style: preserve-3d;
  animation: float 3s ease-in-out infinite;
  cursor: pointer;
}

.box-face {
  position: absolute;
  width: 300rpx;
  height: 300rpx;
  background: linear-gradient(135deg, #A855F7 0%, #EC4899 100%);
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.box-front {
  transform: translateZ(150rpx);
  border-radius: 20rpx;
}

.box-top {
  transform: rotateX(90deg) translateZ(150rpx);
  background: linear-gradient(135deg, #C084FC 0%, #F472B6 100%);
}

.box-right {
  transform: rotateY(90deg) translateZ(150rpx);
  background: linear-gradient(135deg, #9333EA 0%, #DB2777 100%);
}

.question-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.box-question {
  color: #fff;
  font-size: 120rpx;
  font-weight: bold;
  text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
  animation: questionPulse 2s ease-in-out infinite;
}

.question-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.sparkle {
  position: absolute;
  font-size: 24rpx;
  animation: sparkleFloat 3s ease-in-out infinite;
}

.sparkle1 {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.sparkle2 {
  top: 30%;
  right: 20%;
  animation-delay: 1s;
}

.sparkle3 {
  bottom: 20%;
  left: 30%;
  animation-delay: 2s;
}

@keyframes questionPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes sparkleFloat {
  0%, 100% {
    opacity: 0.5;
    transform: translateY(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: translateY(-10rpx) rotate(180deg);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotateY(0deg); }
  50% { transform: translateY(-20rpx) rotateY(10deg); }
}

/* 增强纸条效果 - 完全居中 */
.papers {
  position: absolute;
  top: -60rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 300rpx;
  height: 200rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.paper {
  width: 50rpx;
  height: 100rpx;
  background: #fff;
  border-radius: 8rpx 8rpx 0 0;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.3);
  animation: paperFloat 3s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(255, 255, 255, 0.8);
  position: relative;
}

.paper-content {
  font-size: 20rpx;
  margin-top: 15rpx;
}

.paper1 {
  animation-delay: 0s;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
}

.paper2 {
  animation-delay: 0.4s;
  background: linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%);
}

.paper3 {
  animation-delay: 0.8s;
  background: linear-gradient(135deg, #FCE7F3 0%, #F9A8D4 100%);
}

.paper4 {
  animation-delay: 1.2s;
  background: linear-gradient(135deg, #F3E8FF 0%, #C4B5FD 100%);
}

.paper5 {
  animation-delay: 1.6s;
  background: linear-gradient(135deg, #ECFDF5 0%, #86EFAC 100%);
}

@keyframes paperFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 0.8;
  }
  25% {
    transform: translateY(-15rpx) rotate(3deg) scale(1.05);
    opacity: 1;
  }
  50% {
    transform: translateY(-25rpx) rotate(-2deg) scale(1.1);
    opacity: 0.9;
  }
  75% {
    transform: translateY(-15rpx) rotate(1deg) scale(1.05);
    opacity: 1;
  }
}

/* 为不同位置的纸条添加不同的动画变化 */
.paper1 {
  animation-name: paperFloat1;
}

.paper2 {
  animation-name: paperFloat2;
}

.paper3 {
  animation-name: paperFloat3;
}

.paper4 {
  animation-name: paperFloat4;
}

.paper5 {
  animation-name: paperFloat5;
}

@keyframes paperFloat1 {
  0%, 100% { transform: translateY(0) rotate(-2deg) scale(1); opacity: 0.8; }
  50% { transform: translateY(-18rpx) rotate(2deg) scale(1.06); opacity: 1; }
}

@keyframes paperFloat2 {
  0%, 100% { transform: translateY(0) rotate(1deg) scale(1); opacity: 0.8; }
  50% { transform: translateY(-22rpx) rotate(-3deg) scale(1.08); opacity: 1; }
}

@keyframes paperFloat3 {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.9; }
  50% { transform: translateY(-25rpx) rotate(0deg) scale(1.1); opacity: 1; }
}

@keyframes paperFloat4 {
  0%, 100% { transform: translateY(0) rotate(-1deg) scale(1); opacity: 0.8; }
  50% { transform: translateY(-22rpx) rotate(3deg) scale(1.08); opacity: 1; }
}

@keyframes paperFloat5 {
  0%, 100% { transform: translateY(0) rotate(2deg) scale(1); opacity: 0.8; }
  50% { transform: translateY(-18rpx) rotate(-2deg) scale(1.06); opacity: 1; }
}

/* 增强提示文字 */
.hint-text {
  display: flex;
  align-items: center;
  gap: 16rpx;
  position: relative;
  padding: 20rpx 40rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50rpx;
  backdrop-filter: blur(10rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.hint-decoration {
  width: 40rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  position: relative;
}

.hint-decoration.left {
  animation: decorationGlow 3s ease-in-out infinite;
}

.hint-decoration.right {
  animation: decorationGlow 3s ease-in-out infinite reverse;
}

@keyframes decorationGlow {
  0%, 100% { opacity: 0.3; transform: scaleX(1); }
  50% { opacity: 1; transform: scaleX(1.5); }
}

.hint-icon {
  font-size: 32rpx;
  animation: pulse 2s infinite;
}

.hint-content {
  color: rgba(255, 255, 255, 0.95);
  font-size: 28rpx;
  font-weight: 500;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
  letter-spacing: 2rpx;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 底部操作按钮 */
.bottom-actions {
  display: flex;
  gap: 40rpx;
  padding: 0 60rpx 40rpx;
  position: relative;
  z-index: 10;
}

.action-btn {
  flex: 1;
  height: 100rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.action-btn::after {
  content: '';
  position: absolute;
  top: -2rpx;
  left: -2rpx;
  right: -2rpx;
  bottom: -2rpx;
  background: linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD);
  background-size: 400% 400%;
  border-radius: 50rpx;
  z-index: -1;
  animation: gradientShift 3s ease infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-btn:active::before {
  transform: translateX(100%);
}

.action-btn:active::after {
  opacity: 1;
}

.action-btn:active {
  transform: scale(0.95);
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.draw-btn {
  background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
  box-shadow:
    0 8rpx 32rpx rgba(245, 158, 11, 0.4),
    0 0 60rpx rgba(245, 158, 11, 0.2);
  animation: btnGlow1 2s ease-in-out infinite;
}

.publish-btn {
  background: linear-gradient(135deg, #EC4899 0%, #A855F7 100%);
  box-shadow:
    0 8rpx 32rpx rgba(236, 72, 153, 0.4),
    0 0 60rpx rgba(236, 72, 153, 0.2);
  animation: btnGlow2 2s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes btnGlow1 {
  0%, 100% {
    box-shadow:
      0 8rpx 32rpx rgba(245, 158, 11, 0.4),
      0 0 60rpx rgba(245, 158, 11, 0.2);
  }
  50% {
    box-shadow:
      0 12rpx 40rpx rgba(245, 158, 11, 0.6),
      0 0 80rpx rgba(245, 158, 11, 0.4);
  }
}

@keyframes btnGlow2 {
  0%, 100% {
    box-shadow:
      0 8rpx 32rpx rgba(236, 72, 153, 0.4),
      0 0 60rpx rgba(236, 72, 153, 0.2);
  }
  50% {
    box-shadow:
      0 12rpx 40rpx rgba(236, 72, 153, 0.6),
      0 0 80rpx rgba(236, 72, 153, 0.4);
  }
}

.btn-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  position: relative;
  z-index: 1;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
  letter-spacing: 2rpx;
}

/* 底部说明 */
.bottom-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 40rpx;
  position: relative;
  z-index: 10;
}

.tip-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
}

.tip-icon {
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .type-selector {
    padding: 40rpx 20rpx;
  }

  .type-circle {
    width: 80rpx;
    height: 80rpx;
  }

  .type-icon {
    font-size: 28rpx;
  }

  .box-3d {
    width: 250rpx;
    height: 250rpx;
  }

  .box-face {
    width: 250rpx;
    height: 250rpx;
  }

  .box-question {
    font-size: 100rpx;
  }
}

/* 详情弹窗样式 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10rpx);
}

.modal-content {
  position: relative;
  width: 680rpx;
  max-height: 85vh;
  background: white;
  border-radius: 24rpx;
  padding: 0;
  margin: 0 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
  overflow: hidden;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(100rpx) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  text-align: center;
  padding: 40rpx 0 20rpx;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.paper-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.sparkles {
  position: absolute;
  top: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 40rpx;
}

.sparkle {
  font-size: 32rpx;
  animation: sparkle 2s infinite;
  color: white;
}

.sparkle:nth-child(2) {
  animation-delay: 1s;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.modal-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  padding: 30rpx 40rpx 20rpx;
}

.info-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #ccc;
  color: white;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 用户卡片 */
.user-card {
  display: flex;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20rpx;
  background: #f5f5f5;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.user-info-text {
  flex: 1;
}

.user-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.user-details {
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.gender {
  color: #ff69b4;
}

.age-location {
  color: #999;
}

.type-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.badge-type-1 {
  background: #e3f2fd;
  color: #1976d2;
}

.badge-type-2 {
  background: #fce4ec;
  color: #c2185b;
}

.badge-type-3 {
  background: #f3e5f5;
  color: #7b1fa2;
}

.badge-type-4 {
  background: #fff3e0;
  color: #f57c00;
}

/* 纸条内容 */
.paper-content {
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.content-text {
  color: #333;
  font-size: 28rpx;
  line-height: 1.6;
}

.voice-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
}

.voice-player {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 40rpx;
  background: #f5f5f5;
  border-radius: 50rpx;
  color: #333;
  font-size: 28rpx;
}

/* 回应区域 */
.response-section {
  padding: 30rpx 40rpx;
}

.response-header {
  margin-bottom: 20rpx;
}

.response-count {
  font-size: 26rpx;
  color: #666;
  font-weight: bold;
}

.response-input {
  position: relative;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 20rpx;
}

.input-field {
  width: 100%;
  min-height: 120rpx;
  font-size: 26rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
}

.input-counter {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
  font-size: 22rpx;
  color: #999;
}

/* 底部按钮 */
.bottom-actions {
  display: flex;
  padding: 30rpx 40rpx;
  gap: 20rpx;
}

.action-button {
  flex: 1;
  padding: 24rpx;
  border-radius: 25rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: bold;
}

.action-button.secondary {
  background: #f5f5f5;
  color: #666;
}

.action-button.primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  color: white;
  box-shadow: 0 8rpx 20rpx rgba(139, 92, 246, 0.3);
}
</style>