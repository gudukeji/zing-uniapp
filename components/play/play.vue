<template>
  <view class="play df">
    <view class="play-chunk1" :style="{'background': color}"></view>
    <view class="play-chunk2" :style="{'background': color}"></view>
    <view class="play-chunk3" :style="{'background': color}"></view>
  </view>
</template>

<script>
export default {
  name: 'play',
  props: {
    color: {
      type: String,
      default: '#000'
    }
  }
}
</script>

<style>
.play {
  height: 100%;
  justify-content: space-between;
}
.play .play-chunk1,
.play .play-chunk2,
.play .play-chunk3 {
  width: calc(33.33% - 4rpx);
  border-radius: 50px;
  animation: wave 1s linear infinite;
}
.play .play-chunk1 {
  animation-delay: 0s;
}
.play .play-chunk2 {
  animation-delay: 0.33s;
}
.play .play-chunk3 {
  animation-delay: 0.66s;
}
@keyframes wave {
  0% {
    height: 20%;
  }
  50% {
    height: 100%;
  }
  to {
    height: 20%;
  }
}
.df {
  display: flex;
  align-items: center;
}
</style> 