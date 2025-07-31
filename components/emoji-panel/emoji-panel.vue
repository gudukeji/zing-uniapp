<template>
  <view v-if="show" class="emoji-panel">
    <!-- 表情内容区域 -->
    <scroll-view class="emoji-scroll" scroll-y enhanced :show-scrollbar="false">
      <view class="emoji-container">
        <!-- 最近使用的表情 -->
        <view v-if="recentEmojis.length > 0" class="recent-section">
          <view class="section-title">最近使用</view>
          <view class="recent-emojis">
            <view 
              v-for="(emoji, index) in recentEmojis" 
              :key="`recent-${index}`"
              class="emoji-item" 
              @tap.stop="selectEmoji(emoji)"
              @longpress="previewEmoji(emoji)"
            >
              <image 
                class="emoji-image" 
                :src="emoji.url || emoji.icon"
                :lazy-load="true"
                mode="aspectFit"
                @error="onImageError"
              ></image>
            </view>
          </view>
        </view>

        <!-- 分隔线 -->
        <view v-if="recentEmojis.length > 0" class="section-divider"></view>

        <!-- 所有表情 -->
        <view class="all-emojis">
        <view 
            v-for="(emoji, index) in emojiList" 
            :key="`emoji-${index}`"
            class="emoji-item" 
            @tap.stop="selectEmoji(emoji)"
            @longpress="previewEmoji(emoji)"
        >
            <image 
              class="emoji-image" 
              :src="emoji.url || emoji.icon"
              :lazy-load="true"
              mode="aspectFit"
              @error="onImageError"
            ></image>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 表情预览弹窗 -->
    <view v-if="previewEmojiData" class="emoji-preview" @tap="closePreview">
      <view class="preview-content" @tap.stop>
        <image class="preview-image" :src="previewEmojiData.url || previewEmojiData.icon" mode="aspectFit"></image>
        <text class="preview-name">{{previewEmojiData.phrase}}</text>
        <view class="preview-actions">
          <view class="preview-btn" @tap="selectEmoji(previewEmojiData)">发送</view>
          <view class="preview-btn secondary" @tap="closePreview">取消</view>
          </view>
              </view>
          </view>
  </view>
</template>

<script>
// 导入表情列表
import emojiList from './sina.js'

// 缓存键名
const RECENT_EMOJIS_KEY = 'recent_emojis_v2'

export default {
  name: 'EmojiPanel',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    maxRecentCount: {
      type: Number,
      default: 9,
      validator: (value) => value > 0 && value <= 20
    },
    enablePreview: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      emojiList: emojiList || [],
      recentEmojis: [],
      previewEmojiData: null
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.loadRecentEmojis();
      } else {
        this.closePreview();
      }
    }
  },
  methods: {
    // 加载最近使用的表情
    loadRecentEmojis() {
      try {
        const recentEmojiStr = uni.getStorageSync(RECENT_EMOJIS_KEY);
        if (recentEmojiStr) {
          const recentData = JSON.parse(recentEmojiStr);
          if (Array.isArray(recentData)) {
            this.recentEmojis = recentData.slice(0, this.maxRecentCount);
          }
        }
      } catch (e) {
        this.recentEmojis = [];
      }
    },
    
    // 保存最近使用的表情
    saveRecentEmojis() {
      try {
        uni.setStorageSync(RECENT_EMOJIS_KEY, JSON.stringify(this.recentEmojis));
      } catch (e) {
        // 静默失败
      }
    },
    
    // 选择表情
    selectEmoji(emoji) {
      if (!emoji) return;
      
      // 隐藏键盘
      uni.hideKeyboard && uni.hideKeyboard();
      
      // 关闭预览
      this.closePreview();
      
      // 添加到最近使用的表情
      this.addToRecentEmojis(emoji);
      
      // 触发选择事件
      this.$emit('select', emoji);
    },

    // 添加到最近使用
    addToRecentEmojis(emoji) {
      if (!emoji) return;

      // 检查是否已存在
      const existingIndex = this.recentEmojis.findIndex(item => {
        const itemId = item.url || item.icon;
        const emojiId = emoji.url || emoji.icon;
        return itemId === emojiId;
      });
      
      // 如果已存在，移除旧的
      if (existingIndex !== -1) {
        this.recentEmojis.splice(existingIndex, 1);
      }
      
      // 添加到开头
      this.recentEmojis.unshift(emoji);
      
      // 限制数量
      if (this.recentEmojis.length > this.maxRecentCount) {
        this.recentEmojis = this.recentEmojis.slice(0, this.maxRecentCount);
      }
      
      // 保存到本地存储
      this.saveRecentEmojis();
    },

    // 预览表情
    previewEmoji(emoji) {
      if (!this.enablePreview || !emoji) return;
      this.previewEmojiData = emoji;
    },

    // 关闭预览
    closePreview() {
      this.previewEmojiData = null;
    },

    // 图片加载失败
    onImageError() {
      // 静默处理图片加载失败
    }
  }
}
</script>

<style lang="scss">
.emoji-panel {
  width: 100%;
  height: 400rpx;
  background-color: #fff;
  border-top: 1rpx solid #f1f1f1;
  z-index: 999;
  position: relative;
}

.emoji-scroll {
  height: 100%;
}

.emoji-container {
  padding: 20rpx;
}

// 最近使用区域
.recent-section {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 15rpx;
  padding-left: 10rpx;
}

.recent-emojis {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.section-divider {
  height: 1rpx;
  background-color: #f1f1f1;
  margin: 20rpx 0;
}

// 所有表情区域
.all-emojis {
  display: flex;
  flex-wrap: wrap;
  gap: 5rpx;
}

.emoji-item {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  transition: background-color 0.2s ease;
}

.emoji-item:active {
  background-color: #f5f5f5;
}

.emoji-image {
  width: 50rpx;
  height: 50rpx;
  object-fit: contain;
}

/* 预览弹窗样式 */
.emoji-preview {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.preview-content {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx 40rpx;
  margin: 40rpx;
  max-width: 500rpx;
  text-align: center;
  animation: slideUp 0.3s ease;
}

.preview-image {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}

.preview-name {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 40rpx;
}

.preview-actions {
  display: flex;
  gap: 20rpx;
  justify-content: center;
}

/* 小程序兼容：将SCSS嵌套语法改为普通CSS */
.preview-btn {
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  text-align: center;
  transition: all 0.2s ease;
}

.preview-btn:not(.secondary) {
  background-color: #ff4d6a;
  color: #fff;
}

.preview-btn:not(.secondary):active {
  background-color: #e6445e;
}

.preview-btn.secondary {
  background-color: #f5f5f5;
  color: #666;
}

.preview-btn.secondary:active {
  background-color: #e8e8e8;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 暗色主题支持
@media (prefers-color-scheme: dark) {
  .emoji-panel {
    background-color: #1a1a1a;
    border-top-color: #333;
  }
  
  .section-title {
    color: #666;
  }
  
  .section-divider {
    background-color: #333;
  }
  
  .emoji-item:active {
    background-color: #333;
  }
  
  .preview-content {
    background-color: #333;
  }
  
  .preview-name {
    color: #fff;
  }
}
</style>