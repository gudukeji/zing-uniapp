<template>
  <view v-if="showPopup" class="uni-popup" :class="[popupstyle, isDesktop ? 'fixforpc-z-index' : '']">
    <view @touchstart="touchstart">
      <uni-transition v-if="maskShow" key="1" :name="'mask'" :mode-class="'fade'" :styles="maskClass" 
        :duration="duration" :show="showTrans" @click="onTap" />
      <uni-transition v-if="showTrans" key="2" :mode-class="ani" :name="'content'" :styles="transClass" 
        :duration="duration" :show="showTrans" @click="onTap">
        <view :style="getStyles" class="uni-popup__wrapper" :class="[popupstyle]" @tap="clear">
          <slot />
        </view>
      </uni-transition>
    </view>
  </view>
</template>

<script>
import uniTransition from '@/uni_modules/uni-transition/components/uni-transition/uni-transition.vue'

export default {
  name: "uniPopup",
  components: {
    uniTransition
  },
  emits: ['change', 'maskClick'],
  props: {
    animation: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: "center"
    },
    isMaskClick: {
      type: Boolean,
      default: null
    },
    maskClick: {
      type: Boolean,
      default: null
    },
    backgroundColor: {
      type: String,
      default: "none"
    },
    safeArea: {
      type: Boolean,
      default: true
    },
    maskBackgroundColor: {
      type: String,
      default: "rgba(0, 0, 0, 0.4)"
    },
    borderRadius: {
      type: String,
      default: "0"
    }
  },
  watch: {
    type: {
      handler: function(type) {
        if (this.config[type]) {
          this[this.config[type]](true)
        }
      },
      immediate: true
    },
    isDesktop: {
      handler: function(newVal) {
        if (this.config[newVal]) {
          this[this.config[this.type]](true)
        }
      },
      immediate: true
    },
    maskClick: {
      handler: function(val) {
        this.mkclick = val
      },
      immediate: true
    },
    isMaskClick: {
      handler: function(val) {
        this.mkclick = val
      },
      immediate: true
    },
    showPopup(show) {}
  },
  data() {
    return {
      duration: 300,
      ani: [],
      showPopup: false,
      showTrans: false,
      popupWidth: 0,
      popupHeight: 0,
      config: {
        top: "top",
        bottom: "bottom",
        center: "center",
        left: "left",
        right: "right",
        message: "top",
        dialog: "center",
        share: "bottom"
      },
      maskClass: {
        position: "fixed",
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)"
      },
      transClass: {
        position: "fixed",
        left: 0,
        right: 0,
        backgroundColor: "transparent",
        borderRadius: "0"
      },
      maskShow: true,
      mkclick: true,
      popupstyle: "top"
    }
  },
  computed: {
    getStyles() {
      let styles = {
        backgroundColor: this.bg
      }
      styles = Object.assign(styles, {
        borderRadius: this.borderRadius
      })
      return styles
    },
    isDesktop() {
      return this.popupWidth >= 500 && this.popupHeight >= 500
    },
    bg() {
      if (this.backgroundColor === '' || this.backgroundColor === 'none') {
        return 'transparent'
      }
      return this.backgroundColor
    }
  },
  mounted() {
    const info = uni.getSystemInfoSync()
    this.popupWidth = info.windowWidth
    this.popupHeight = info.windowHeight + (info.windowTop || 0)
    if (info.safeArea && this.safeArea) {
      this.safeAreaInsets = info.screenHeight - info.safeArea.bottom
    } else {
      this.safeAreaInsets = 0
    }
  },
  unmounted() {
    this.setH5Visible()
  },
  activated() {
    // 应用程序从后台前台激活时触发
    this.setH5Visible(!this.showPopup)
  },
  deactivated() {
    // 应用程序从前台切换到后台时触发
    this.setH5Visible(true)
  },
  created() {
    if (this.isMaskClick === null && this.maskClick === null) {
      this.mkclick = true
    } else {
      this.mkclick = this.isMaskClick !== null ? this.isMaskClick : this.maskClick
    }
    if (this.animation) {
      this.duration = 300
    } else {
      this.duration = 0
    }
    this.messageChild = null
    this.clearPropagation = false
    this.maskClass.backgroundColor = this.maskBackgroundColor
  },
  methods: {
    setH5Visible(visible = true) {
      // 处理 H5 平台下应用从后台切换到前台的问题
    },
    closeMask() {
      this.maskShow = false
    },
    disableMask() {
      this.mkclick = false
    },
    clear(e) {
      e.stopPropagation()
      this.clearPropagation = true
    },
    open(type) {
      if (this.showPopup) {
        return
      }
      let valid = ['top', 'center', 'bottom', 'left', 'right', 'message', 'dialog', 'share']
      if (type && valid.indexOf(type) !== -1) {
        this.type = type
      }
      if (this.config[this.type]) {
        this[this.config[this.type]]()
        this.$emit('change', {
          show: true,
          type: this.type
        })
      } else {
        console.error('缺少类型：', this.type)
      }
    },
    close(type) {
      this.showTrans = false
      this.$emit('change', {
        show: false,
        type: this.type
      })
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.showPopup = false
      }, 300)
    },
    touchstart() {
      this.clearPropagation = false
    },
    onTap() {
      if (this.clearPropagation) {
        this.clearPropagation = false
        return
      }
      this.$emit('maskClick')
      if (this.mkclick) {
        this.close()
      }
    },
    /**
     * 顶部弹出样式处理
     */
    top(type) {
      this.popupstyle = this.isDesktop ? 'fixforpc-top' : 'top'
      this.ani = ['slide-top']
      this.transClass = {
        position: 'fixed',
        left: 0,
        right: 0,
        backgroundColor: this.bg,
        borderRadius: this.borderRadius || '0'
      }
      if (!type) {
        this.showPopup = true
        this.showTrans = true
        this.$nextTick(() => {
          if (this.messageChild && this.type === 'message') {
            this.messageChild.timerClose()
          }
        })
      }
    },
    /**
     * 底部弹出样式处理
     */
    bottom(type) {
      this.popupstyle = 'bottom'
      this.ani = ['slide-bottom']
      this.transClass = {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: this.safeAreaInsets + 'px',
        backgroundColor: this.bg,
        borderRadius: this.borderRadius || '0'
      }
      if (!type) {
        this.showPopup = true
        this.showTrans = true
      }
    },
    /**
     * 中间弹出样式处理
     */
    center(type) {
      this.popupstyle = 'center'
      this.ani = ['fade']
      this.transClass = {
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: this.borderRadius || '0'
      }
      if (!type) {
        this.showPopup = true
        this.showTrans = true
      }
    },
    left(type) {
      this.popupstyle = 'left'
      this.ani = ['slide-left']
      this.transClass = {
        position: 'fixed',
        left: 0,
        bottom: 0,
        top: 0,
        backgroundColor: this.bg,
        borderRadius: this.borderRadius || '0',
        display: 'flex',
        flexDirection: 'column'
      }
      if (!type) {
        this.showPopup = true
        this.showTrans = true
      }
    },
    right(type) {
      this.popupstyle = 'right'
      this.ani = ['slide-right']
      this.transClass = {
        position: 'fixed',
        bottom: 0,
        right: 0,
        top: 0,
        backgroundColor: this.bg,
        borderRadius: this.borderRadius || '0',
        display: 'flex',
        flexDirection: 'column'
      }
      if (!type) {
        this.showPopup = true
        this.showTrans = true
      }
    }
  }
}
</script>

<style>
.uni-popup {
  position: fixed;
  z-index: 99;
}

.uni-popup.top,
.uni-popup.left,
.uni-popup.right {
  top: 0;
}

.uni-popup .uni-popup__wrapper {
  display: block;
  position: relative;
  /* iphonex 等安全区设置，底部安全区适配 */
}

.uni-popup .uni-popup__wrapper.left,
.uni-popup .uni-popup__wrapper.right {
  padding-top: 0;
  flex: 1;
}

.fixforpc-z-index {
  /* #ifndef APP-NVUE */
  z-index: 999;
  /* #endif */
}

.fixforpc-top {
  top: 0;
}
</style> 