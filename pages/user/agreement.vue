<template>
  <view class="container">
    <navbar></navbar>
    <view class="content-box" :style="{'margin-top': statusBarHeight + titleBarHeight + 'px'}">
      <view class="title">{{title}}</view>
      <view class="content">
        <rich-text :nodes="content"></rich-text>
      </view>
    </view>
  </view>
</template>

<script>

import { request } from '@/config/util.js'

export default {
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      title: '协议内容',
      content: '',
      type: 'user'
    }
  },
  onLoad(options) {
    if (options.type) {
      this.type = options.type
      this.getAgreement()
    }
  },
  methods: {
    getAgreement() {
      let self = this
      uni.showLoading({
        mask: true
      })
      
      request(api.userAgreementUrl, {
        type: self.type
      }).then(function(res) {
        uni.hideLoading()
        if (res.code == 200) {
          self.title = res.data.title
          self.content = res.data.content
        }
      })
    }
  }
}
</script>

<style>
.container {
  width: 100%;
  background: #fff;
}
.content-box {
  width: calc(100% - 60rpx);
  padding: 30rpx;
}
.title {
  font-size: 34rpx;
  font-weight: 700;
  text-align: center;
  margin-bottom: 30rpx;
}
.content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
}
</style> 