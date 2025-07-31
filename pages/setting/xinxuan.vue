<template>
  <view>
    <!-- <navbar ref="navbar"></navbar> -->
    <view class="content">
      <mp-html :content="content" :tag-style="tagStyle"></mp-html>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { getUserAgreement } from '@/api/user.js'
import { onLoad } from '@dcloudio/uni-app'
import mpHtml from '@/uni_modules/mp-html/components/mp-html/mp-html.vue'

// 获取app实例
const app = getApp()

// 响应式数据
const content = ref("")
const navH = ref(0)
const tagStyle = ref({
  img: 'width:100%;display:block;',
  table: 'width:100%',
  video: 'width:100%'
})

// 初始化导航栏高度
const initNavHeight = () => {
  // #ifdef MP
  navH.value = app.globalData.navHeight || 88
  // #endif
  // #ifdef H5
  navH.value = 96
  // #endif
  // #ifdef APP-PLUS
  navH.value = 30
  // #endif
}

// 加载用户协议内容
const loadUserAgreement = async (type) => {
  try {
    console.log('开始加载用户协议，类型:', type)
    const res = await getUserAgreement(type)
    console.log('用户协议响应:', res)

    if (res && res.data && res.data.content) {
      content.value = res.data.content
      console.log('内容已设置，长度:', content.value.length)

      // 设置页面标题
      uni.setNavigationBarTitle({
        title: res.data.title || '用户协议'
      })
    } else {
      console.error('响应数据格式错误:', res)
      uni.showToast({
        title: '内容加载失败',
        icon: 'none',
        duration: 2000
      })
    }
  } catch (err) {
    console.error('加载用户协议失败:', err)
    // 显示错误提示
    uni.showToast({
      title: err.message || err || '加载失败',
      icon: 'none',
      duration: 2000
    })
  }
}

// 页面加载生命周期
onLoad((options) => {
  console.log('页面参数:', options)

  // 初始化导航栏高度
  initNavHeight()

  // 加载用户协议内容
  if (options && options.type) {
    loadUserAgreement(options.type)
  } else {
    console.warn('缺少type参数')
    uni.showToast({
      title: '缺少必要参数',
      icon: 'none',
      duration: 2000
    })
  }
})
</script>

<style>
page {
  background: #fff;
}

.content {
  width: calc(100% - 60rpx);
  margin: 0 30rpx;
  font-size: 24rpx;
  line-height: 2;
  padding: 20rpx 0;
  box-sizing: border-box;
}
</style>