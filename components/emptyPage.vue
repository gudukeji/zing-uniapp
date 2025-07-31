<template>
  <view class="empty-page">
    <view class="empty-icon">
      <text class="icon">📝</text>
    </view>
    <view class="empty-title">
      <text>{{ title || '暂无数据' }}</text>
    </view>
    <view v-if="description" class="empty-description">
      <text>{{ description }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'EmptyPage',
  props: {
    title: {
      type: String,
      default: '暂无数据'
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: '📝'
    }
  }
}
</script>

<style scoped>
.empty-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  min-height: 400rpx;
}

.empty-icon {
  margin-bottom: 30rpx;
}

.empty-icon .icon {
  font-size: 120rpx;
  opacity: 0.3;
}

.empty-title {
  margin-bottom: 20rpx;
}

.empty-title text {
  font-size: 28rpx;
  color: #999;
  text-align: center;
}

.empty-description {
  text-align: center;
}

.empty-description text {
  font-size: 24rpx;
  color: #ccc;
  line-height: 1.5;
}
</style>
