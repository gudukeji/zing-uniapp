<template>
  <view 
    :class="['nav-bar', bg == 0 ? 'bfw' : '', bg == 1 ? 'bf8' : '']" 
    :style="{'padding-top': statusBarHeight + 'px'}"
  >
    <view class="navbar-item" :style="{'height': titleBarHeight + 'px'}">
      <view class="back-box" :style="{'height': titleBarHeight + 'px'}" @tap="navBack">
        <image src="/static/img/back.png"></image>
      </view>
    </view>
  </view>
</template>

<script>
let sysHeight = uni.getSystemInfoSync().statusBarHeight + 'px';
const app = getApp();

export default {
  name: 'navbar',
  props: {
    bg: {
      type: Number,
      default: 0
    } 
  },
  data() {
    return {
      statusBarHeight: 0,
      titleBarHeight: 44,
      navH: 0,
      sysHeight: sysHeight
    }
  },
  created() {
    this.initNavBarHeight();
  },
  methods: {
    initNavBarHeight() {
      let that = this;
      
      // 获取状态栏高度
      const systemInfo = uni.getSystemInfoSync();
      this.statusBarHeight = systemInfo.statusBarHeight || 0;
      
      // 按照商品详情页的逻辑获取导航栏高度
      // #ifdef MP
      that.navH = app.globalData.navHeight || 0;
      // #endif
      // #ifdef H5
      that.navH = 96;
      // #endif
      // #ifdef APP-PLUS
      that.navH = 30;
      // #endif
      
      // 计算标题栏高度
      if (that.navH > 0) {
        // 有全局导航高度时，用rpx转px
        const rpxRatio = 750 / systemInfo.windowWidth;
        const totalPx = that.navH / rpxRatio;
        this.titleBarHeight = totalPx - this.statusBarHeight;
      } else {
        // 默认高度
        this.titleBarHeight = 44;
      }
      
      // 确保最小高度
      if (this.titleBarHeight < 30) {
        this.titleBarHeight = 44;
      }
    },
    
    navBack() {
      if (getCurrentPages().length > 1) {
        uni.navigateBack();
      } else {
        uni.switchTab({
          url: '/pages/index/index'
        });
      }
    }
  }
}
</script>

<style>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 99;
  box-sizing: border-box;
}

.nav-bar .navbar-item {
  width: 100%;
  display: flex;
  align-items: center;
}

.navbar-item .back-box {
  padding: 0 30rpx;
  display: flex;
  align-items: center;
}

.navbar-item .back-box image {
  width: 34rpx;
  height: 34rpx;
}

.bfw {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(255,255,255,.8);
}

.bf8 {
  background: #f8f8f8;
}
</style> 