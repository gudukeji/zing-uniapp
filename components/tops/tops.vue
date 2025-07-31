<template>
  <view class="tops-container">
    <!-- 酷枪话题区域 -->
    <view class="topic-section">
      <!-- 标题栏 -->
      <view class="topic-header">
        <view class="topic-title">
          <image class="topic-icon" src="/static/img/topic_hot.png" mode="aspectFit"></image>
          <text class="title-text">酷枪话题</text>
        </view>
        <view class="topic-more" @tap="goToTopicList">
          <text>查看榜单</text>
          <image class="arrow-icon" src="/static/img/arrow_right.png" mode="aspectFit"></image>
        </view>
      </view>

      <!-- 话题列表 -->
      <view class="topic-list">
        <!-- 左侧主要话题列表 -->
        <view class="topic-main">
          <view
            v-for="(topic, index) in mainTopics"
            :key="topic.id || index"
            class="topic-item"
            @tap="goToTopic(topic)"
          >
            <view class="topic-content">
              <text class="topic-hash">#</text>
              <text class="topic-name">{{ topic.name }}</text>
            </view>
            <view class="topic-stats">
              <text class="stats-text">{{ formatNumber(topic.count) }} 互动</text>
            </view>
          </view>
        </view>

        <!-- 右侧次要话题列表 -->
        <view class="topic-side">
          <view
            v-for="(topic, index) in sideTopics"
            :key="topic.id || index"
            class="topic-item-side"
            @tap="goToTopic(topic)"
          >
            <view class="topic-content-side">
              <text class="topic-hash-side">#</text>
              <text class="topic-name-side">{{ topic.name }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 追剧推荐区域 -->
    <view v-if="shouldShowDrama" class="drama-section">
      <!-- 标题栏 -->
      <view class="drama-header">
        <view class="drama-title">
          <text class="title-text">追剧儿童欢乐多</text>
        </view>
        <view class="drama-close" @tap="closeDramaSection">
          <image class="close-icon" src="/static/img/close.png" mode="aspectFit"></image>
        </view>
      </view>

      <!-- 描述文字 -->
      <view class="drama-desc">
        <text>热播大剧！社区圈子陪你追得停不下来📺</text>
      </view>

      <!-- 剧集卡片列表 -->
      <view class="drama-cards">
        <swiper
          class="drama-swiper"
          :indicator-dots="true"
          :autoplay="false"
          :circular="false"
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#ffffff"
        >
          <swiper-item v-for="(page, pageIndex) in dramaPages" :key="pageIndex">
            <view class="drama-page">
              <view
                v-for="(drama, index) in page"
                :key="drama.id || index"
                class="drama-card"
                @tap="goToDrama(drama)"
              >
                <view class="drama-cover">
                  <lazyImage :src="drama.cover" :br="'8rpx'"></lazyImage>
                  <view v-if="drama.isJoined" class="joined-mark">
                    <image src="/static/img/check.png" mode="aspectFit"></image>
                  </view>
                </view>
                <view class="drama-info">
                  <text class="drama-name">{{ drama.name }}</text>
                  <text class="drama-members">{{ formatNumber(drama.memberCount) }}圈友</text>
                </view>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <!-- 一键加入按钮 -->
      <view class="join-all-btn" @tap="joinAllDramas">
        <text>一键加入</text>
      </view>
    </view>
  </view>
</template>

<script>
import lazyImage from '@/components/lazyImage/lazyImage'
import { useUserStore } from '@/stores/user.js'
import { toLogin } from '@/libs/login.js'

export default {
  name: 'tops',
  components: {
    lazyImage
  },
  props: {
    // 话题数据
    topics: {
      type: Array,
      default: () => []
    },
    // 剧集数据
    dramas: {
      type: Array,
      default: () => []
    },
    // 是否显示追剧区域
    showDramaSection: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      userStore: useUserStore(),
      // 默认话题数据
      defaultTopics: [
        { id: 1, name: '小敏家实时追剧盖楼', count: 934 },
        { id: 2, name: '偶像剧里的超白目表情包', count: 1801 },
        { id: 3, name: '找到你的专属星座表情...', count: 1100 },
        { id: 4, name: '新年', count: 0 },
        { id: 5, name: '酷跑', count: 0 },
        { id: 6, name: '追光', count: 0 }
      ],
      // 默认剧集数据
      defaultDramas: [
        {
          id: 1,
          name: '大湾区吹水圈',
          cover: '/static/img/drama1.jpg',
          memberCount: 138612,
          isJoined: true
        },
        {
          id: 2,
          name: '甜宠瞬间不...',
          cover: '/static/img/drama2.jpg',
          memberCount: 123262,
          isJoined: true
        },
        {
          id: 3,
          name: '我的刷剧片单',
          cover: '/static/img/drama3.jpg',
          memberCount: 147542,
          isJoined: true
        },
        {
          id: 4,
          name: '我正在追的剧',
          cover: '/static/img/drama4.jpg',
          memberCount: 86409,
          isJoined: true
        }
      ],
      showDrama: true
    }
  },
  computed: {
    // 话题列表
    topicList() {
      return this.topics.length > 0 ? this.topics : this.defaultTopics;
    },

    // 主要话题（左侧显示，前3个）
    mainTopics() {
      return this.topicList.slice(0, 3);
    },

    // 次要话题（右侧显示，后3个）
    sideTopics() {
      return this.topicList.slice(3, 6);
    },

    // 剧集列表
    dramaList() {
      return this.dramas.length > 0 ? this.dramas : this.defaultDramas;
    },

    // 分页显示剧集（每页4个）
    dramaPages() {
      const pageSize = 4;
      const pages = [];
      for (let i = 0; i < this.dramaList.length; i += pageSize) {
        pages.push(this.dramaList.slice(i, i + pageSize));
      }
      return pages;
    },

    // 是否显示追剧区域
    shouldShowDrama() {
      return this.showDramaSection && this.showDrama;
    }
  },
  methods: {
    // 格式化数字
    formatNumber(num) {
      if (!num) return '0';
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
      }
      return num.toString();
    },

    // 跳转到话题详情
    goToTopic(topic) {
      if (!topic || !topic.id) return;

      try {
        uni.navigateTo({
          url: `/pages/topic/details?id=${topic.id}&name=${encodeURIComponent(topic.name)}`,
          fail: (err) => {
            console.error('跳转话题页面失败:', err);
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      } catch (e) {
        console.error('跳转话题页面异常:', e);
      }
    },

    // 跳转到话题榜单
    goToTopicList() {
      try {
        uni.navigateTo({
          url: '/pages/topic/index',
          fail: (err) => {
            console.error('跳转话题榜单失败:', err);
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      } catch (e) {
        console.error('跳转话题榜单异常:', e);
      }
    },

    // 跳转到剧集圈子
    goToDrama(drama) {
      if (!drama || !drama.id) return;

      try {
        uni.navigateTo({
          url: `/pages/note/circle?id=${drama.id}`,
          fail: (err) => {
            console.error('跳转剧集圈子失败:', err);
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      } catch (e) {
        console.error('跳转剧集圈子异常:', e);
      }
    },

    // 关闭追剧区域
    closeDramaSection() {
      this.showDrama = false;
      this.$emit('close-drama');
    },

    // 一键加入所有剧集
    joinAllDramas() {
      // 检查登录状态
      if (!this.userStore.isLoggedIn) {
        toLogin();
        return;
      }

      uni.showToast({
        title: '加入成功',
        icon: 'success'
      });

      // 触发加入事件
      this.$emit('join-all', this.dramaList);
    }
  }
}
</script>

<style scoped>
.tops-container {
  width: 100%;
  background: #fff;
}

/* 话题区域样式 */
.topic-section {
  padding: 24rpx 30rpx;
  border-bottom: 20rpx solid #f8f8f8;
}

.topic-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.topic-title {
  display: flex;
  align-items: center;
}

.topic-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 12rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #000;
}

.topic-more {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 24rpx;
}

.arrow-icon {
  width: 24rpx;
  height: 24rpx;
  margin-left: 8rpx;
}

.topic-list {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/* 左侧主要话题区域 */
.topic-main {
  flex: 1;
  margin-right: 40rpx;
}

.topic-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.topic-item:last-child {
  border-bottom: none;
}

.topic-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.topic-hash {
  font-size: 30rpx;
  font-weight: 700;
  color: #000;
  margin-right: 6rpx;
}

.topic-name {
  font-size: 30rpx;
  color: #000;
  font-weight: 500;
  line-height: 1.2;
}

.topic-stats {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
}

.stats-text {
  font-size: 24rpx;
  color: #999;
  white-space: nowrap;
}

/* 右侧次要话题区域 */
.topic-side {
  width: 200rpx;
  display: flex;
  flex-direction: column;
}

.topic-item-side {
  padding: 12rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.topic-item-side:last-child {
  border-bottom: none;
}

.topic-content-side {
  display: flex;
  align-items: center;
}

.topic-hash-side {
  font-size: 30rpx;
  font-weight: 700;
  color: #000;
  margin-right: 6rpx;
}

.topic-name-side {
  font-size: 30rpx;
  color: #000;
  font-weight: 500;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 追剧区域样式 */
.drama-section {
  padding: 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.drama-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.drama-title .title-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
}

.drama-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  width: 32rpx;
  height: 32rpx;
}

.drama-desc {
  margin-bottom: 30rpx;
}

.drama-desc text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 36rpx;
}

.drama-cards {
  margin-bottom: 40rpx;
}

.drama-swiper {
  height: 320rpx;
}

.drama-page {
  display: flex;
  justify-content: space-between;
  padding: 0 10rpx;
}

.drama-card {
  width: 160rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.drama-cover {
  width: 120rpx;
  height: 160rpx;
  border-radius: 8rpx;
  overflow: hidden;
  position: relative;
  margin-bottom: 16rpx;
}

.joined-mark {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 32rpx;
  height: 32rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.joined-mark image {
  width: 20rpx;
  height: 20rpx;
}

.drama-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.drama-name {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
  margin-bottom: 8rpx;
  max-width: 140rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drama-members {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
}

.join-all-btn {
  width: 100%;
  height: 88rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.join-all-btn text {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
}

/* 轮播图指示器样式调整 */
.drama-swiper ::v-deep .uni-swiper-dots {
  bottom: -40rpx;
}

.drama-swiper ::v-deep .uni-swiper-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin: 0 6rpx;
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
  .drama-page {
    padding: 0 5rpx;
  }

  .drama-card {
    width: 140rpx;
  }

  .drama-cover {
    width: 100rpx;
    height: 140rpx;
  }
}

/* H5端适配 */
/* #ifdef H5 */
.topic-section {
  padding: 15px;
}

.drama-section {
  padding: 15px;
}

.topic-item {
  padding: 10px 0;
}
/* #endif */

/* 小程序端适配 */
/* #ifdef MP */
.drama-swiper {
  height: 320rpx;
}
/* #endif */

/* APP端适配 */
/* #ifdef APP-PLUS */
.join-all-btn {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background: rgba(255, 255, 255, 0.3);
}
/* #endif */
</style>