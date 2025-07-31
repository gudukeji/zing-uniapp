<template>
  <view class="preview-container">
    <view class="preview-header">
      <text class="preview-title">Tops 组件预览</text>
      <text class="preview-desc">根据截图优化后的话题区域布局</text>
    </view>
    
    <!-- 只显示话题区域，不显示追剧区域 -->
    <tops :showDramaSection="false" />
    
    <view class="preview-notes">
      <view class="notes-title">优化说明：</view>
      <view class="notes-list">
        <text class="note-item">• 左右分栏布局，左侧显示主要话题（带互动数）</text>
        <text class="note-item">• 右侧显示次要话题（仅显示话题名）</text>
        <text class="note-item">• 调整了字体大小和间距，更符合截图样式</text>
        <text class="note-item">• 话题名称支持省略号显示</text>
        <text class="note-item">• 保持了点击跳转功能</text>
      </view>
    </view>
  </view>
</template>

<script>
import tops from './tops.vue'

export default {
  name: 'TopsPreview',
  components: {
    tops
  }
}
</script>

<style scoped>
.preview-container {
  min-height: 100vh;
  background: #f8f8f8;
}

.preview-header {
  padding: 40rpx 30rpx;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.preview-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #000;
  display: block;
  margin-bottom: 12rpx;
}

.preview-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
}

.preview-notes {
  margin: 30rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
}

.notes-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #000;
  margin-bottom: 20rpx;
}

.notes-list {
  display: flex;
  flex-direction: column;
}

.note-item {
  font-size: 24rpx;
  color: #666;
  line-height: 36rpx;
  margin-bottom: 8rpx;
}
</style>
