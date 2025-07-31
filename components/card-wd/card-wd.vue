<template>
  <view class="gg-box" @tap="toPaths">
    <!-- 用户头像/日期 -->
    <view v-if="bar == 1" class="gg-avatar" @tap.stop="toPaths" data-type="1">
      <lazyImage v-if="item.avatar" :src="item.avatar" br="50%"></lazyImage>
    </view>
    <view v-else class="gg-avatar rq">{{getDay}}</view>
    <view class="timeline-line"></view>
    <!-- 内容区域 -->

    <view class="gg-item">
      <!-- 用户信息/日期 -->
      <view v-if="bar == 1" class="gg-item-name">
        <view class="ohto">{{item.nickname || '用户'}}</view>
        {{formatTime}} · {{item.province || '未知地区'}}
      </view>
      <view v-else class="gg-item-name">
        <text v-if="getStatusText">{{getStatusText}}</text>
        {{formatDate}} · {{item.province || '未知地区'}}
      </view>
      <view  class="cccc">   
      <!-- 笔记内容 -->
      <view :class="['gg-item-content', 'ohto2', item.type == 1 ? 'wlc8' : '']">{{item.content || '无内容'}}</view>
      
      <!-- 图片/视频/音频内容 -->

      <view v-if="item.type > 0" class="gg-item-file">
        <!-- 单图模式 -->
        <view v-if="item.type == 2 && getImages.length == 1" :class="getSingleImageClass">
          <lazyImage :src="getImages[0]"></lazyImage>
        </view>
        
        <!-- 多图模式 -->
        <block v-if="item.type == 2 && getImages.length > 1">
          <view v-for="(img, index) in getImages.slice(0, 3)" :key="index" class="file-img">
            <lazyImage :src="img"></lazyImage>
          </view>
          <view v-if="getImagesCount > 3" class="file-count df">
            <image src="/static/img/i.png"></image>
            <text>{{getImagesCount}}</text>
          </view>
        </block>
        
        <!-- 视频模式 -->
        <block v-if="item.type == 3 && item.video">
          <view :class="getVideoClass">
            <lazyImage :src="item.video_cover || getImages[0] || '/static/img/video_placeholder.png'"></lazyImage>
          </view>
          <view class="file-video df">
            <image src="/static/img/v.png"></image>
          </view>
        </block>
        
        <!-- 音频模式 -->
        <view v-if="item.type == 4 && item.audio" class="file-audio df">
          <image class="audio-bg" style="z-index:-2" :src="item.audio_cover || '/static/img/audio_cover.png'"></image>
          <view class="audio-mb"></view>
          <view class="audio-left">
            <lazyImage :src="item.audio_cover || '/static/img/audio_cover.png'"></lazyImage>
            <image class="icon" src="/static/img/yw.png"></image>
          </view>
          <view style="width:calc(100% - 330rpx)">
            <view class="audio-t1">{{item.audio_title || '音频'}}</view>
            <view class="audio-t2 ohto">{{item.audio_intro || '点击播放音频'}}</view>
          </view>
          <view class="audio-play">去播放</view>
        </view>
      </view>

      <!-- 投票展示区 -->
      <VoteComponent
        v-if="item.vote_info"
        :voteInfo="item.vote_info"
        @vote-success="handleVoteSuccess"
      />

      <!-- 关联信息 -->
      <view v-if="hasLocation || item.topic_info || item.product_info" class="gg-item-g">
        <!-- 位置信息 -->
        <view v-if="hasLocation" class="g-item df" @tap.stop="opLocationClick">
          <image class="g-item-icon" style="width:30rpx;height:30rpx" src="/static/img/wz.png"></image>
          <text style="padding:0 8rpx;color:#999">{{item.location_name}}</text>
        </view>
        
        <!-- 话题信息 -->
        <template v-if="hasTopic">
          <view v-for="(topic, index) in item.topic_info" :key="'topic-'+index" class="g-item df" style="border-radius:40rpx" data-type="2" @tap.stop="toPaths">
            <view class="g-item-img" style="border-radius:50%">
              <lazyImage :src="topic.image || '/static/img/topic_icon.png'" br="50%"></lazyImage>
            </view>
            <text style="padding:0 8rpx 0 12rpx">{{topic.title}}</text>
          </view>
        </template>
        
        <!-- 商品信息 -->
        <view v-if="hasProduct" class="g-item df" :data-id="item.product_info.id" data-type="3" @tap.stop="toPaths">
          <view class="g-item-img">
            <lazyImage :src="item.product_info.image"></lazyImage>
          </view>
          <text style="padding:0 8rpx 0 12rpx">{{item.product_info.store_name}}</text>
        </view>
      </view>
      
      <!-- 互动数据 -->
      <view class="gg-item-unm df">
        <text class="gg-item-unm-txt">评论 {{item.comments || 0}}</text>
        <text class="gg-item-unm-txt">赞 {{item.likes || 0}}</text>
        <text class="gg-item-unm-txt">浏览 {{item.views || 0}}</text>
        <view v-if="bar == 2 || item.uid == currentUid" @tap.stop="delNote" class="gg-item-unm-txt" style="font-weight:bold;color:#FA5150">删除</view>
      </view>
    </view>
  </view>
</view>
</template>

<script>
import lazyImage from '@/components/lazyImage/lazyImage'
import VoteComponent from '@/components/vote-component/vote-component.vue'

export default {
  name: 'card-wd',
  components: {
    lazyImage,
    VoteComponent
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    idx: {
      type: Number,
      default: 0
    },
    bar: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      currentUid: uni.getStorageSync('uid') || 0,
    }
  },
  computed: {
    // 获取日期数字
    getDay() {
      if (!this.item.create_time) return 'N/A';
      
      try {
        const date = new Date(typeof this.item.create_time === 'string' ? 
                             this.item.create_time.replace(/-/g, '/') : 
                             this.item.create_time * 1000);
        return date.getDate();
      } catch(e) {
        return 'N/A';
      }
    },
    
    // 获取状态文本
    getStatusText() {
      const statusMap = {
        0: '待审核',
        1: '已通过',
        2: '未通过',
        3: '草稿'
      };
      return statusMap[this.item.status] || '';
    },
    
    // 格式化日期时间
    formatTime() {
      if (!this.item.create_time) return '';
      
      try {
        // 处理可能的时间格式
        let timestamp;
        if (typeof this.item.create_time === 'string') {
          timestamp = new Date(this.item.create_time.replace(/-/g, '/')).getTime();
        } else if (typeof this.item.create_time === 'number') {
          timestamp = this.item.create_time * 1000; // 秒转毫秒
        } else {
          return '';
        }
        
        const now = new Date().getTime();
        const diff = now - timestamp;
        
        // 小于1分钟
        if (diff < 60 * 1000) {
          return '刚刚';
        }
        // 小于1小时
        else if (diff < 60 * 60 * 1000) {
          return Math.floor(diff / (60 * 1000)) + '分钟前';
        }
        // 小于24小时
        else if (diff < 24 * 60 * 60 * 1000) {
          return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
        }
        // 小于30天
        else if (diff < 30 * 24 * 60 * 60 * 1000) {
          return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前';
        }
        // 大于30天
        else {
          const date = new Date(timestamp);
          return (date.getMonth() + 1) + '月' + date.getDate() + '日';
        }
      } catch(e) {
        return '';
      }
    },
    
    // 格式化年月日
    formatDate() {
      if (!this.item.create_time) return '';
      
      try {
        let timestamp;
        if (typeof this.item.create_time === 'string') {
          timestamp = new Date(this.item.create_time.replace(/-/g, '/')).getTime();
        } else if (typeof this.item.create_time === 'number') {
          timestamp = this.item.create_time * 1000;
        } else {
          return '';
        }
        
        const date = new Date(timestamp);
        return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
      } catch(e) {
        return '';
      }
    },
    
    // 获取图片数组
    getImages() {
      if (!this.item.images) return [];
      
      if (typeof this.item.images === 'string') {
        try {
          return JSON.parse(this.item.images);
        } catch (e) {
          return [];
        }
      }
      
      return Array.isArray(this.item.images) ? this.item.images : [];
    },
    
    // 获取图片数量
    getImagesCount() {
      return this.getImages.length;
    },
    
    // 检查是否有位置
    hasLocation() {
      return this.item.location_name && this.item.location_name.length > 0;
    },
    
    // 检查是否有话题
    hasTopic() {
      return this.item.topic_info && Array.isArray(this.item.topic_info) && this.item.topic_info.length > 0;
    },
    
    // 检查是否有商品
    hasProduct() {
      return this.item.product_info && Object.keys(this.item.product_info).length > 0;
    },
    
    // 获取视频宽高比（参考 card-gg.vue 的实现）
    getVideoRatio() {
      if (this.item.video_width && this.item.video_height) {
        return this.item.video_width / this.item.video_height;
      }

      if (this.item.video?.wide && this.item.video?.high) {
        return this.item.video.wide / this.item.video.high;
      }

      return 1;
    },

    // 获取图片宽高比（参考 card-gg.vue 的实现）
    getImageRatio() {
      // 优先使用 image_width 和 image_height
      if (this.item.image_width && this.item.image_height) {
        return this.item.image_width / this.item.image_height;
      }

      // 尝试从 imgs 数组中获取宽高信息
      if (this.getImages.length > 0 && this.item.imgs?.[0]?.wide && this.item.imgs?.[0]?.high) {
        return this.item.imgs[0].wide / this.item.imgs[0].high;
      }

      // 默认按竖图处理
      return 1;
    },

    // 单图容器类名（参考 card-gg.vue 的逻辑）
    getSingleImageClass() {
      const ratio = this.getImageRatio;
      // 宽高比大于 1.2 时显示为横图，否则显示为竖图
      return ratio > 1.2 ? 'file-w' : 'file-h';
    },

    // 视频容器类名
    getVideoClass() {
      const ratio = this.getVideoRatio;
      // 宽高比大于 1.2 时显示为横图，否则显示为竖图
      return ratio > 1.2 ? 'file-w' : 'file-h';
    }
  },
  methods: {
    toPaths(e) {
      let url = '';
      
      if (this.bar == 2) {
        // 草稿箱，跳转到编辑页面
        url = 'note/add?id=' + this.item.id;
      } else {
        let type = e && e.currentTarget ? e.currentTarget.dataset.type : 0;
        
        if (this.item.type == 2 || this.item.type == 3 || this.item.type == 4) {
  // 图片、视频和音频类型，跳转到视频详情
        url = 'note/video?id=' + this.item.id;
      } else {
  // 文本类型，跳转到普通详情页
        url = 'note/details?id=' + this.item.id;
        }
        
        if (type == 1) {
          // 用户头像点击，跳转到用户详情
          url = 'user/details?id=' + this.item.uid;
        } else if (type == 2) {
          // 话题点击，跳转到话题详情
          const topicId = e.currentTarget.dataset.id || '';
          url = 'topic/details?id=' + topicId;
        } else if (type == 3) {
          // 商品点击，跳转到商品详情
          const goodsId = e.currentTarget.dataset.id || '';
          url = 'goods/details?id=' + goodsId;
        }
      }
      
      uni.navigateTo({
        url: '/pages/' + url
      });
    },
    
    delNote() {
      this.$emit('delback', {
        idx: this.idx
      });
    },
    
    opLocationClick() {
      if (!this.item.latitude || !this.item.longitude) return;

      uni.openLocation({
        latitude: parseFloat(this.item.latitude),
        longitude: parseFloat(this.item.longitude),
        name: this.item.location_name
      });
    },

    // 处理投票成功事件
    handleVoteSuccess(data) {
      // 更新本地数据
      this.item.vote_info = data.voteInfo;

      // 通知父组件
      this.$emit('update', {
        vote_info: data.voteInfo,
        idx: this.idx
      });
    }
  }
}
</script>

<style>
.gg-box {
  position: relative;
  border-bottom: 1px solid #f8f8f8;
  width: calc(100% - 60rpx);
  padding: 30rpx;
  display: flex;
}

.gg-box .gg-avatar {
  position: relative;
  z-index: 1;
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  border: 1px solid #f8f8f8;
  overflow: hidden;
}

.gg-box .rq {
  line-height: 68rpx;
  font-size: 26rpx;
  font-weight: bolder;
  text-align: center;
  color: #fff;
  background: #000;
  border: 1px solid #000;
}

.gg-box .gg-item {
  width: calc(100% - 88rpx - 2px);
  margin-left: 20rpx;
}
.timeline-line {
  position: absolute;
  left: 58rpx;
  top: 120rpx; 
  bottom: 30rpx;
  width: 2rpx;
  background-color: #e5e5e5; 
  z-index: 0;
}

.timeline-line::before {
  content: '';
  position: absolute;
  left: -4rpx;
  top: -4rpx;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background-color: #e5e5e5; 
}

.gg-box:last-child .timeline-line {
  display: none;
}

.gg-item .gg-item-name {
  color: #999;
  font-size: 22rpx;
  line-height: 22rpx;
  font-weight: 300;
  display: flex;
  align-items: flex-end;
}

.gg-item .gg-item-name text {
  margin-right: 20rpx;
  color: #fa5150;
  font-weight: 700;
}

.gg-item .gg-item-name view {
  max-width: 320rpx;
  margin-right: 20rpx;
  color: #000;
  font-size: 28rpx;
  line-height: 28rpx;
  font-weight: 700;
}

.gg-item .gg-item-content {
  margin-top: 15rpx;
  font-size: 26rpx;
  font-weight: 400;
  line-height: 36rpx;
  word-break: break-word;
  white-space: pre-line;
}

.gg-item .gg-item-file {
  margin-top: 20rpx;
  display: flex;
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
}

.gg-item-file .file-h,
.gg-item-file .file-w,
.gg-item-file .file-img {
  border-radius: 8rpx;
  overflow: hidden;
}

.gg-item-file .file-h {
  width: 320rpx;
  height: 420rpx;
}

.gg-item-file .file-w {
  width: 420rpx;
  height: 320rpx;
}

.gg-item-file .file-img {
  width: 196rpx;
  height: 196rpx;
  margin-right: 4rpx;
  margin-bottom: 4rpx;
}

.gg-item-file .file-img:nth-child(3n) {
  margin-right: 0rpx !important;
}

.gg-item-file .file-count {
  position: absolute;
  right: 20rpx;
  bottom: 30rpx;
  padding: 0 10rpx;
  height: 40rpx;
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.6);
  -webkit-backdrop-filter: blur(15px);
  backdrop-filter: blur(15px);
  border-radius: 8rpx;
}

.gg-item-file .file-count image,
.gg-item-file .file-video image {
  width: 20rpx;
  height: 20rpx;
}

.gg-item-file .file-count image {
  margin-right: 10rpx;
}

.gg-item-file .file-video {
  position: absolute;
  top: 20rpx;
  width: 48rpx;
  height: 48rpx;
  background: rgba(0, 0, 0, 0.6);
  justify-content: center;
  border-radius: 50%;
}

.gg-item-file .file-audio {
  width: 100%;
  height: 140rpx;
  border-radius: 8rpx;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.file-audio .audio-left {
  margin-right: 30rpx;
  width: 140rpx;
  height: 140rpx;
  position: relative;
}

.file-audio .audio-left .icon {
  position: absolute;
  top: 45rpx;
  right: 45rpx;
  bottom: 45rpx;
  left: 45rpx;
  width: 50rpx;
  height: 50rpx;
}

.file-audio .audio-bg,
.file-audio .audio-mb {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.file-audio .audio-mb {
  z-index: -1;
  -webkit-backdrop-filter: saturate(150%) blur(25px);
  backdrop-filter: saturate(150%) blur(25px);
  background: rgba(0, 0, 0, 0.5);
}

.file-audio .audio-t1 {
  font-size: 26rpx;
  font-weight: 700;
}

.file-audio .audio-t2 {
  margin-top: 10rpx;
  opacity: 0.8;
  font-size: 20rpx;
}

.file-audio .audio-play {
  margin: 0 30rpx;
  width: 100rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 18rpx;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 60rpx;
}

.gg-item .gg-item-g {
  margin-top: 10rpx;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.gg-item-g .g-item {
  margin: 10rpx 10rpx 0 0;
  padding: 8rpx;
  font-size: 20rpx;
  font-weight: 500;
  border-radius: 8rpx;
  background: #f8f8f8;
}

.g-item .g-item-icon {
  width: 32rpx;
  height: 32rpx;
}

.g-item .g-item-img {
  width: 40rpx;
  height: 40rpx;
  background: #f8f8f8;
  border-radius: 4rpx;
  overflow: hidden;
}

.gg-item-unm .gg-item-unm-txt {
  margin: 20rpx 20rpx 0 0;
  color: #999;
  font-size: 20rpx;
}

.wlc8 {
  -webkit-line-clamp: 8 !important;
}

.df {
  display: flex;
  align-items: center;
}

.ohto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ohto2 {
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

</style> 