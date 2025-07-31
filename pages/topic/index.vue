<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-box df" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="nav-back df" :style="{'height': titleBarHeight + 'px'}" @tap="navBack">
        <image src="/static/img/back.png" style="width:34rpx;height:34rpx"></image>
      </view>
      <view class="nav-title">话题列表</view>
    </view>

    <!-- 话题列表 -->
    <view class="topic-list" :style="{'padding-top': statusBarHeight + titleBarHeight + 20 + 'px'}">
      <view
        v-for="(topic, index) in topicList"
        :key="topic.id || index"
        class="topic-item"
        @tap="goToTopicDetail(topic)">
        <view class="topic-content">
          <view class="topic-header">
            <text class="topic-hash">#</text>
            <text class="topic-title">{{ topic.title }}</text>
          </view>
          <view class="topic-stats">
            <text class="stat-text">{{ topic.post_count || 0 }}篇动态</text>
            <text class="stat-divider">·</text>
            <text class="stat-text">{{ topic.view_count || 0 }}次浏览</text>
          </view>
          <view v-if="topic.description" class="topic-desc">{{ topic.description }}</view>
        </view>
        <view class="topic-arrow">
          <image src="/static/img/arrow_right.png" mode="aspectFit"></image>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="topicList.length === 0 && !loading" class="empty-box">
        <image src="/static/img/empty.png"/>
        <text class="empty-text">暂无话题</text>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-box">
        <text>加载中...</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getTopicList } from '@/api/social'

export default {
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      topicList: [],
      loading: false
    }
  },
  onLoad() {
    this.getTopics();
  },
  methods: {
    // 获取话题列表
    getTopics() {
      this.loading = true;
      getTopicList({
        page: 1,
        limit: 20,
        keyword: ''
      }).then(res => {
        this.loading = false;
        if (res.status === 200 && res.data && res.data.list) {
          this.topicList = res.data.list;
        }
      }).catch(err => {
        this.loading = false;
        console.error('获取话题列表失败:', err);
        uni.showToast({
          title: '获取话题列表失败',
          icon: 'none'
        });
      });
    },

    // 跳转到话题详情
    goToTopicDetail(topic) {
      if (!topic || !topic.id) return;

      uni.navigateTo({
        url: `/pages/topic/details?id=${topic.id}`,
        fail: (err) => {
          console.error('跳转话题详情失败:', err);
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    },

    // 返回上一页
    navBack() {
      if (getCurrentPages().length > 1) {
        uni.navigateBack();
      } else {
        uni.switchTab({
          url: "/pages/index/index"
        });
      }
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background: #f8f8f8;
}

.nav-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 99;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.nav-back {
  padding: 0 30rpx;
  width: 34rpx;
  height: 100%;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.topic-list {
  padding: 20rpx;
}

.topic-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.topic-content {
  flex: 1;
}

.topic-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.topic-hash {
  font-size: 32rpx;
  font-weight: bold;
  color: #007AFF;
  margin-right: 8rpx;
}

.topic-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.topic-stats {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.stat-text {
  font-size: 24rpx;
  color: #999;
}

.stat-divider {
  margin: 0 8rpx;
  font-size: 24rpx;
  color: #999;
}

.topic-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}

.topic-arrow {
  width: 32rpx;
  height: 32rpx;
}

.topic-arrow image {
  width: 100%;
  height: 100%;
}

.empty-box {
  display: flex;
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

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.loading-box {
  display: flex;
  justify-content: center;
  padding: 50rpx 0;
}

.loading-box text {
  font-size: 28rpx;
  color: #999;
}

.df {
  display: flex;
  align-items: center;
}
</style>