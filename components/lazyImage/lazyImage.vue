<template>
  <view class="lazy-image" ref="imageWrapper" :style="{'border-radius': br}">
    <image 
      :src="src || '/static/img/load.png'" 
      :style="{'opacity': loaded ? 1 : 0, 'transition': 'opacity .3s ease-in-out'}" 
      @load="onImageLoad" 
      @error="onImageError"
      mode="aspectFill"/>
    <view v-if="error" class="err"></view>
  </view>
</template>

<script>
export default {
  name: 'lazyImage',
  props: {
    src: {
      type: String,
      default: '',
      required: false
    },
    br: {
      type: String,
      default: undefined,
      required: false
    }
  },
  data() {
    return {
      loaded: false,
      error: false
    }
  },
  watch: {
    src: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.resetLoadingState();
        }
      },
      immediate: false
    }
  },
  mounted() {
    this.resetLoadingState();
  },
  methods: {
    // 重置加载状态
    resetLoadingState() {
      if (!this.src) {
        this.loaded = true;
        this.error = false;
      } else {
        this.loaded = false;
        this.error = false;
      }
    },
    // 图片加载成功
    onImageLoad() {
      this.loaded = true;
      this.error = false;
    },
    // 图片加载失败
    onImageError() {
      this.error = true;
      this.loaded = true; // 即使出错也标记为已加载，显示错误占位图
      console.log('Image load error:', this.src);
    }
  }
}
</script>

<style scoped>
.lazy-image{position:relative;width:100%;height:100%;overflow:hidden;background:#f8f8f8;}
.lazy-image image{width:100%;height:100%;}
.lazy-image .err{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(248,248,248,0.7) url('/static/img/load.png') no-repeat center/50%;}
</style> 