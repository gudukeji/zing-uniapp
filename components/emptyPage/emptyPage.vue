<template>
  <view class="empty-page">
    <view class="empty-content">
      <image
        :src="image"
        mode="aspectFit"
        class="empty-image"
        :style="{ width: imageSize, height: imageSize }"
      />
      <view class="empty-title">{{ title }}</view>
      <view v-if="description" class="empty-description">{{ description }}</view>
      <view v-if="buttonText" class="empty-button" @tap="handleButtonClick">
        {{ buttonText }}
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'EmptyPage',
  props: {
    // 标题
    title: {
      type: String,
      default: '暂无数据'
    },
    // 描述文字
    description: {
      type: String,
      default: ''
    },
    // 图片地址
    image: {
      type: String,
      default: '/static/img/empty.png'
    },
    // 图片尺寸
    imageSize: {
      type: String,
      default: '300rpx'
    },
    // 按钮文字
    buttonText: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleButtonClick() {
      this.$emit('buttonClick');
    }
  }
}
</script>

<style scoped>
/* 基础样式 - 参考 details.vue 的 empty-box 样式 */
.empty-page {
  width: 100%;
  padding: 100rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

/* 图片样式 - 参考 details.vue */
.empty-image {
  width: 300rpx;
  height: 300rpx;
  margin-bottom: 30rpx;
  opacity: 0.8;
}

/* 标题样式 - 参考 details.vue 的 .e1 */
.empty-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 10rpx;
  line-height: 1.4;
}

/* 描述样式 - 参考 details.vue 的 .e2 */
.empty-description {
  margin-top: 10rpx;
  color: #999;
  font-size: 26rpx;
  line-height: 1.5;
  margin-bottom: 40rpx;
  max-width: 500rpx;
  text-align: center;
}

/* 按钮样式 - 参考 details.vue 的 retry-btn */
.empty-button {
  margin-top: 40rpx;
  width: 200rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
  background: #007aff;
  border-radius: 40rpx;
  transition: all 0.3s ease;
}

.empty-button:active {
  background: #0056cc;
  transform: scale(0.95);
}

/* 工具类 */
.df {
  display: flex;
  align-items: center;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .empty-title {
    color: #fff;
  }

  .empty-description {
    color: #ccc;
  }

  .empty-page {
    background-color: #1a1a1a;
  }
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
  .empty-image {
    width: 250rpx;
    height: 250rpx;
  }

  .empty-title {
    font-size: 28rpx;
  }

  .empty-description {
    font-size: 24rpx;
    padding: 0 40rpx;
  }
}

/* 小程序兼容性 */
/* #ifdef MP */
.empty-page {
  box-sizing: border-box;
}
/* #endif */

/* H5 兼容性 */
/* #ifdef H5 */
.empty-button {
  cursor: pointer;
  user-select: none;
}
/* #endif */
</style>
