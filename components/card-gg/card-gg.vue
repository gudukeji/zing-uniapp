<template>
  <view class="gg-box" @tap="toPaths">
    <!-- 用户头像区域 -->
    <view class="gg-avatar" @tap.stop="toPaths" data-type="1">
      <lazyImage :src="userAvatar" br="50%"></lazyImage>
      <view v-if="displayState.isAuthenticated" class="top df">
        <image src="/static/img/rz.png" mode="aspectFit" @error="onAuthIconError"></image>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="gg-item">
      <!-- 用户信息 -->
      <view class="gg-item-user df" style="width:100%" @tap.stop="toPaths" data-type="1">
        <view class="name-container df">
          <view class="name ohto">{{userName}}</view>
          <!-- VIP图标 -->
          <view class="status-icon vip-icon" v-if="userVipInfo.showVip">
            <image :src="userVipInfo.vipIcon"></image>
          </view>
        </view>
        <!-- <view class="tag df">
          <image :src="genderIcon" style="width:100%;height:100%;object-fit:cover;"></image>
          <text v-if="displayState.showAge">{{item.age}}</text>
        </view> -->
        <!-- 关注按钮 -->
        <view :class="followButtonState.className" @tap.stop="followUser" v-if="followButtonState.show">
          {{followButtonState.text}}
        </view>
      </view>
      
      <!-- 时间和浏览信息 -->
      <view class="gg-item-time">{{timeDisplay}} · {{item.user_info.residence_name || ''}} ·  浏览 {{viewsCount}}</view>
      
      <!-- 文本内容 -->
      <view :class="displayState.contentClass" @tap.stop="toDetailsPage">{{item.content}}</view>
      <!-- 媒体内容 -->
      <view v-if="mediaState.showMedia" class="gg-item-file">
        <!-- 单图模式 -->
        <view v-if="mediaState.isSingleImage" :class="mediaState.singleImageClass" @tap.stop="toVideoPage">
          <lazyImage :src="getImages[0]"></lazyImage>
        </view>

        <!-- 多图模式 -->
        <block v-if="mediaState.isMultiImage">
          <view v-for="(img, index) in getImages" :key="index" class="file-img" @tap.stop="toVideoPage">
            <lazyImage :src="img"></lazyImage>
          </view>
          <view v-if="mediaState.showImageCount" class="file-count df">
            <image src="/static/img/i.png"></image>
            <text>{{getImagesCount}}</text>
          </view>
        </block>

        <!-- 视频模式 -->
        <block v-if="mediaState.isVideo">
          <view :class="mediaState.videoContainerClass" @tap.stop="toVideoPage">
            <lazyImage :src="videoCoverSrc"></lazyImage>
          </view>
          <view class="file-video df" :style="mediaState.videoIconStyle">
            <image src="/static/img/v.png"></image>
          </view>
        </block>

        <!-- 音频模式 -->
        <view v-if="mediaState.isAudio" class="file-audio df" @tap.stop="toVideoPage">
          <image class="audio-bg" style="z-index:-2" :src="audioCoverSrc"></image>
          <view class="audio-mb"></view>
          <view class="audio-left">
            <lazyImage :src="audioCoverSrc"></lazyImage>
            <image class="icon" src="/static/img/yw.png"></image>
          </view>
          <view style="width:calc(100% - 300rpx)">
            <view class="audio-t1">{{audioInfo.title}}</view>
            <view class="audio-t2 ohto">{{audioInfo.intro}}</view>
          </view>
          <view class="audio-play">去播放</view>
        </view>
      </view>

      <!-- 关联信息 -->
      <view v-if="displayState.showExtraInfo" class="gg-item-g">
        <!-- 位置信息 -->
        <view v-if="contentChecks.hasLocation" class="g-item df" @tap.stop="opLocationClick">
          <image class="g-item-icon" style="width:30rpx;height:30rpx" src="/static/img/wz.png"></image>
          <text style="padding:0 8rpx;color:#999">{{locationName}}</text>
        </view>
        <!-- 圈子信息 -->
        <view v-if="contentChecks.hasCircle" class="g-item df" style="border-radius:40rpx" data-type="7" @tap.stop="toPaths">
          <view class="g-item-img" style="border-radius:50%">
            <image :src="circleInfo.avatar" style="width:100%;height:100%;object-fit:cover;"></image>
          </view>
          <text style="padding:0 8rpx 0 12rpx">{{circleInfo.name}}</text>
        </view>
        <!-- 话题信息 -->
        <view v-if="contentChecks.hasTopic" class="g-item df" style="border-radius:40rpx" data-type="2" @tap.stop="toPaths">
          <view class="g-item-img" style="border-radius:50%">
            <image :src="(topicsList[0] && topicsList[0].icon) ? topicsList[0].icon : '/static/img/topic_icon.png'" style="width:100%;height:100%;object-fit:cover;"></image>
          </view>
          <text style="padding:0 8rpx 0 12rpx">{{topicTitle(topicsList[0])}}</text>
        </view>

        <!-- 活动信息 -->
        <view v-if="contentChecks.hasActivity" class="g-item df" data-type="6" @tap.stop="toPaths">
          <view class="g-item-img" style="width:50rpx">
            <lazyImage :src="activityImage"></lazyImage>
          </view>
          <text style="padding:0 8rpx 0 12rpx">{{activityName}}</text>
        </view>

        <!-- 商品信息 -->
        <view v-if="contentChecks.hasProduct" class="g-item df" :data-id="productId" data-type="3" @tap.stop="toPaths">
            <view class="g-item-img">
            <lazyImage :src="productImage"></lazyImage>
          </view>
          <text style="padding:0 8rpx 0 12rpx">{{productName}}</text>
        </view>
      </view>
      
      <!-- 投票展示区 -->
      <VoteComponent
        v-if="item.vote_info"
        :voteInfo="item.vote_info"
        @vote-success="handleVoteSuccess"
      />

      <!-- 评论预览 -->
      <view v-if="contentChecks.hasLatestComments" class="gg-item-comment" @tap.stop="toPaths" data-type="4">
        <view class="ohto2">
          <text style="color:#000">{{commentInfo.latestUser}}：</text>{{commentInfo.latestContent}}
        </view>
      </view>
      
      <!-- 底部互动栏 -->
      <view class="gg-item-unm df">
        <!-- 评论按钮 -->
        <view class="unm-item" @tap.stop="toPaths" data-type="4">
          <image src="/static/img/pl.png"></image>
          <text>{{commentCount}} 评论</text>
        </view>
        
        <!-- 点赞按钮 -->
        <view class="unm-item" @tap.stop="handleLike">
          <image v-if="isLiked" class="hi" src="/static/img/dz1.png"></image>
          <image v-else class="hi" src="/static/img/dz.png"></image>
          <text :style="likeState.textStyle">
            {{likeState.countText}} 赞
          </text>
        </view>
        
        <!-- 分享按钮 -->
        <view class="unm-item" @tap.stop="toPaths" data-type="5" style="margin-left:auto">
          <image src="/static/img/fx.png"></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import lazyImage from '@/components/lazyImage/lazyImage'
import VoteComponent from '@/components/vote-component/vote-component.vue'
import { likeDynamic, followUser } from '@/api/social.js'
import { toLogin } from '@/libs/login.js'

// 常量定义
const DYNAMIC_TYPES = {
  TEXT: 1,
  IMAGE: 2,
  VIDEO: 3,
  AUDIO: 4
}

const NAVIGATION_TYPES = {
  USER_PROFILE: 1,
  TOPIC: 2,
  PRODUCT: 3,
  COMMENT: 4,
  SHARE: 5,
  ACTIVITY: 6,
  CIRCLE: 7
}

const DEBOUNCE_DELAYS = {
  LIKE: 300,
  FOLLOW: 500
}

export default {
  name: 'card-gg',
  components: {
    lazyImage,
    VoteComponent
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    idx: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isNoteVideo: (typeof getApp === 'function' && getApp() && getApp().globalData && getApp().globalData.isNoteVideo) || true,
      userId: (uni.getStorageSync('userInfo') && uni.getStorageSync('userInfo').uid) || 0,
      isLiked: false,
      likeCount: 0,
      isProcessing: false, // 防止重复点击
    }
  },
  created() {
    // 创建防抖函数实例
    this.debouncedHandleLike = this.debounce(this.handleLikeAction, DEBOUNCE_DELAYS.LIKE);
    this.debouncedFollowUser = this.debounce(this.followUserAction, DEBOUNCE_DELAYS.FOLLOW);

    // 预加载关键图片
    this.preloadImages();
  },
  mounted() {
  },
  computed: {
    // 基础数据获取 - 统一处理多种数据结构
    itemData() {
      // 合并用户信息，优先使用user_info中的VIP信息
      const userInfo = this.item.user_info || {};
      const userBase = this.item.user || {};
      const mergedUser = { ...userBase, ...userInfo };

      return {
        // 用户信息 - 合并user和user_info，确保VIP信息不丢失
        user: mergedUser,
        // 商品信息
        product: this.item.goods_info || this.item.product_info || {},
        // 活动信息
        activity: this.item.activity || {},
        // 话题信息
        topics: this.item.topic_info || this.item.topics || [],
        // 关注状态
        followStatus: {
          isFollow: this.item.is_follow === 1 || this.item.user_info?.is_follow === 1,
          isMutual: this.item.is_mutual_follow === 1 || this.item.user_info?.is_mutual_follow === 1
        }
      };
    },

    // 性别图标
    genderIcon() {
      return this.item.gender == 0 ? '/static/img/nv.png' : '/static/img/nan.png';
    },

    // 视频封面
    videoCoverSrc() {
      return this.item.video_cover || this.item.video?.cover || '';
    },

    // 音频封面
    audioCoverSrc() {
      return this.item.audio_cover || this.item.audio?.cover || '/static/img/audio_cover.png';
    },

    // 用户头像
    userAvatar() {
      return this.itemData.user.avatar || this.item.avatar || '/static/img/avatar.png';
    },

    // 用户名
    userName() {
      return this.itemData.user.name || this.itemData.user.nickname || this.item.nickname || '用户';
    },

    // 用户VIP信息
    userVipInfo() {
      const user = this.itemData.user;

      // 参考center.vue的VIP判断逻辑：userInfo.is_money_level> 0 && userInfo.svip_open
      const isMoneyLevel = user.is_money_level > 0 || user.is_ever_level > 0; // 付费会员或永久会员
      const svipOpen = user.svip_open > 0 || user.vip === true; // SVIP开启或VIP为true
      const showVipByCenter = isMoneyLevel && svipOpen;

      // 同时检查后端返回的VIP信息
      const hasVip = user.vip || false;
      const vipStatus = user.vip_status || 2;
      const isValidVip = hasVip && (vipStatus === 1 || vipStatus === 3); // 永久会员或未到期会员

      // 使用任一条件满足即显示VIP
      const finalShowVip = showVipByCenter || isValidVip;
      return {
        showVip: finalShowVip,
        vipIcon: '/static/img/svip.gif', // 与center.vue保持一致，使用固定图标
        vipName: user.vip_name || '',
        vipStatus: vipStatus
      };
    },

    // 位置名称
    locationName() {
      return this.item.location_name || this.item.adds_name || '';
    },

    // 话题列表
    topicsList() {
      return this.itemData.topics;
    },

    // 商品信息
    productId() {
      return this.itemData.product.id || '';
    },
    productImage() {
      return this.itemData.product.image || '';
    },
    productName() {
      return this.itemData.product.store_name || '';
    },

    // 活动信息
    activityImage() {
      return this.item.activity_img || this.itemData.activity.img || '/static/img/activity.png';
    },
    activityName() {
      return this.item.activity_name || this.itemData.activity.name || '活动详情';
    },

    // 获取图片数组
    getImages() {
      // 处理imgs字段
      if (this.item.imgs?.length) {
        return this.item.imgs.map(img => typeof img === 'string' ? img : img.url);
      }
      
      // 处理images字段
      if (this.item.images) {
        if (Array.isArray(this.item.images)) {
          return this.item.images;
        }
        
        if (typeof this.item.images === 'string') {
          try {
            return JSON.parse(this.item.images);
          } catch (e) {
            return [this.item.images];
          }
        }
      }
      
      // 处理单个image字段
      if (this.item.image) {
        return [this.item.image];
      }
      
      return [];
    },
    
    // 获取图片数量
    getImagesCount() {
      return this.getImages.length;
    },
    
    // 内容检查 - 统一处理各种内容类型的存在性判断
    contentChecks() {
      return {
        hasLocation: !!(this.item.location_name || this.item.adds_name),
        hasTopic: this.itemData.topics.length > 0,
        hasProduct: !!this.itemData.product.id,
        hasActivity: !!(this.item.activity_id || this.itemData.activity.id),
        hasCircle: this.circleInfo.id > 0,
        hasLatestComments: this.item.latest_comments?.length > 0
      };
    },

    // 圈子信息 - 统一处理圈子相关数据
    circleInfo() {
      const circleData = this.item.circle_info || {};
      return {
        id: parseInt(circleData.circle_id || this.item.circle_id || 0),
        name: circleData.circle_name || this.item.circle_name || '',
        avatar: circleData.circle_avatar || this.item.circle_avatar || '/static/img/qz1.png'
      };
    },

    // 移除冗余的计算属性，直接在模板中使用 contentChecks 和 circleInfo
    
    // 获取视频宽高比
    getVideoRatio() {
      if (this.item.video_width && this.item.video_height) {
        return this.item.video_width / this.item.video_height;
      }
      
      if (this.item.video?.wide && this.item.video?.high) {
        return this.item.video.wide / this.item.video.high;
      }
      
      return 1;
    },
    
    // 获取图片宽高比
    getImageRatio() {
      if (this.item.image_width && this.item.image_height) {
        return this.item.image_width / this.item.image_height;
      }
      
      if (this.getImages.length > 0 && this.item.imgs?.[0]?.wide && this.item.imgs?.[0]?.high) {
        return this.item.imgs[0].wide / this.item.imgs[0].high;
      }
      
      return 1;
    },
    

    
    // 关注按钮状态 - 统一处理关注相关逻辑
    followButtonState() {
      const { isFollow, isMutual } = this.itemData.followStatus;
      const isFollowed = isFollow || isMutual;

      return {
        show: this.item.uid != this.userId,
        isMutual,
        isFollowed,
        className: ['follow-btn', isMutual ? 'mutual' : (isFollowed ? 'active' : '')],
        text: isMutual ? '互相关注' : (isFollowed ? '已关注' : '＋关注')
      };
    },

    // 移除冗余的计算属性，直接在模板中使用 followButtonState
    
    // 媒体内容状态 - 统一处理媒体相关判断
    mediaState() {
      const type = this.item.type;
      const imageCount = this.getImagesCount;
      const videoRatio = this.getVideoRatio;
      const imageRatio = this.getImageRatio;

      return {
        showMedia: type > DYNAMIC_TYPES.TEXT || (this.item.images?.length > 0),
        isSingleImage: type === DYNAMIC_TYPES.IMAGE && imageCount === 1,
        isMultiImage: type === DYNAMIC_TYPES.IMAGE && imageCount > 1,
        isVideo: type === DYNAMIC_TYPES.VIDEO,
        isAudio: type === DYNAMIC_TYPES.AUDIO,
        showImageCount: imageCount > 3,
        singleImageClass: ['file-h', imageRatio > 1 ? 'file-w' : ''],
        videoContainerClass: ['file-h', videoRatio > 1 ? 'file-w' : ''],
        videoIconStyle: { 'left': videoRatio > 1 ? '382rpx' : '282rpx' }
      };
    },

    // 显示状态 - 统一处理显示相关判断
    displayState() {
      const checks = this.contentChecks;

      // 多重检查认证状态，确保兼容不同数据结构
      const authStatus = this.itemData.user.auth_status ||
                        this.item.user_info?.auth_status ||
                        this.item.user?.auth_status ||
                        0;

      const isAuthenticated = authStatus === 2;

      return {
        contentClass: ['gg-item-content', 'ohto2', (this.item.type === DYNAMIC_TYPES.TEXT && !this.item.images) ? 'wlc8' : ''],
        showExtraInfo: checks.hasLocation || checks.hasTopic || checks.hasProduct || checks.hasCircle || this.item.activity_id,
        showAge: this.item.age && this.item.age !== '暂不展示',
        isAuthenticated: isAuthenticated
      };
    },

    // 音频信息
    audioInfo() {
      return {
        title: this.item.audio_title || this.item.audio?.name || '音频',
        intro: this.item.audio?.intro || '点击播放音频'
      };
    },

    // 移除冗余的计算属性，直接在模板中使用对应的状态对象
    
    // 评论相关信息
    commentInfo() {
      const latestComment = this.item.latest_comments?.[0];
      return {
        userName: this.item.comment?.user_name || this.item.comment?.user?.name || '',
        latestUser: latestComment?.nickname || '匿名用户',
        latestContent: latestComment?.content || '无内容'
      };
    },

    // 点赞相关状态
    likeState() {
      const count = this.likeCount || '';
      return {
        textStyle: { 'color': this.isLiked ? '#FA5150' : '#999' },
        countText: this.formatNumber(count, 10000, 'w')
      };
    },





    // 保留常用的显示数据计算属性
    viewsCount() { return this.item.browse || this.item.views || 0; },
    timeDisplay() { return this.item.create_time_str || this.item.create_time || '刚刚'; },
    commentCount() { return this.item.comment_count || this.item.comments || ''; }
  },
  watch: {
    item: {
      handler(newVal) {
        if (newVal) {
          const newIsLiked = newVal.is_like === 1;
          const newLikeCount = parseInt(newVal.likes || 0);

          // 只有当状态真正改变时才更新
          if (this.isLiked !== newIsLiked || this.likeCount !== newLikeCount) {
            this.isLiked = newIsLiked;
            this.likeCount = newLikeCount;
          }
        }
      },
      immediate: true,
      deep: true
    },

    // 监听 isLiked 变化，确保视图更新（添加防抖避免无限循环）
    isLiked: {
      handler(newVal, oldVal) {
        // 只有当值真正改变时才更新视图，避免无限循环
        if (newVal !== oldVal) {
          this.$nextTick(() => {
            this.$forceUpdate();
          });
        }
      }
    }
  },
  methods: {
    // 防抖工具函数
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // 通用数字格式化方法
    formatNumber(num, threshold = 10000, suffix = 'w') {
      if (!num || num < threshold) return num.toString() || '';
      return (num / threshold).toFixed(1) + suffix;
    },

    // 图片预加载优化
    preloadImages() {
      try {
        // 预加载前3张图片
        const imagesToPreload = this.getImages.slice(0, 3);
        imagesToPreload.forEach(src => {
          if (src) {
            // 使用 uni.preloadPage 或简单的图片预加载
            const img = new Image();
            img.src = src;
          }
        });

        // 预加载用户头像
        if (this.userAvatar) {
          const avatarImg = new Image();
          avatarImg.src = this.userAvatar;
        }
      } catch (e) {
      }
    },

    // 安全获取全局数据
    getGlobalData(key, defaultValue) {
      try {
        if (typeof getApp !== 'function') return defaultValue;
        const app = getApp();
        if (!app || !app.globalData) return defaultValue;
        return app.globalData[key] !== undefined ? app.globalData[key] : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    },
    
    // 统一错误处理
    handleError(error, defaultMessage = '操作失败') {
      const message = error?.message || error?.msg || defaultMessage;
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      });
    },

    // 认证图标加载错误处理
    onAuthIconError() {
    },

    // 获取话题标题
    topicTitle(topic) {
      if (!topic) return '';
      return topic.title || topic.name || '';
    },

    // 获取笔记URL - 统一处理不同类型笔记的URL生成
    getNoteUrl(params = '') {
      const isMediaType = this.item.type == 2 || this.item.type == 3 || this.item.type == 4;
      const basePage = isMediaType ? 'note/video' : 'note/details';
      return `${basePage}?id=${this.item.id}${params}`;
    },
    
    /**
     * 处理点赞事件 - 防抖包装器
     */
    handleLike() {
      this.debouncedHandleLike();
    },

    /**
     * 实际的点赞处理逻辑
     */
    handleLikeAction() {
      // 判断用户是否登录
      if (!this.$store.getters.isLogin) {
        toLogin();
        return;
      }
      
      // 防止重复点击
      if (this.isProcessing) return;
      this.isProcessing = true;
      
      const newLikeStatus = !this.isLiked;
      const oldLikeCount = this.likeCount;
      
      // 先更新UI，提高用户体验
      this.isLiked = newLikeStatus;
      this.likeCount = newLikeStatus ? oldLikeCount + 1 : Math.max(0, oldLikeCount - 1);
      
      // 调用点赞API
      likeDynamic({
        id: this.item.id,
        is_like: newLikeStatus ? 1 : 0
      }).then(() => {
        // 点赞成功，通知父组件
        this.$emit('likeback', {
          index: this.idx,
          id: this.item.id,
          isLike: newLikeStatus
        });
      }).catch((error) => {
        // 点赞失败，恢复原状态
        this.isLiked = !newLikeStatus;
        this.likeCount = oldLikeCount;
        this.handleError(error, '点赞失败，请重试');
      }).finally(() => {
        this.isProcessing = false;
      });
    },
    
    /**
     * 处理不同类型的页面导航
     * @param {Object} e - 点击事件对象
     */
    toPaths(e) {
      // 防御性检查 - 确保item存在
      if (!this.item || !this.item.id) return;
      
      // 从事件对象中获取导航类型
      let type = e && e.currentTarget ? parseInt(e.currentTarget.dataset.type) : undefined;

      // 根据内容类型决定跳转页面
      let url;

      // 根据不同的导航类型设置不同的URL
      if (type === NAVIGATION_TYPES.USER_PROFILE) {
        // 类型1: 导航到用户详情页
        if (this.item.uid) {
          url = 'user/details?id=' + this.item.uid;
        }
      } else if (type === NAVIGATION_TYPES.TOPIC) {
        // 类型2: 话题详情页
        if (this.topicsList && this.topicsList.length > 0) {
          const topic = this.topicsList[0];
          const topicId = topic && topic.id ? topic.id : '';
          url = 'topic/details?id=' + topicId;
        }
      } else if (type === NAVIGATION_TYPES.CIRCLE) {
        // 类型7: 圈子详情页
        if (this.contentChecks.hasCircle) {
          url = 'note/circle?id=' + this.circleInfo.id;
        }
      } else if (type === NAVIGATION_TYPES.PRODUCT) {
        // 类型3: 导航到商品详情页，需要从事件中获取商品ID
        let goodsId = e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.id : '';
        if (goodsId) {
          url = 'goods/details?id=' + goodsId;
        }
      } else if (type === NAVIGATION_TYPES.COMMENT) {
        // 类型4: 导航到笔记详情并打开评论区
        url = this.getNoteUrl('&comment=true');
      } else if (type === NAVIGATION_TYPES.SHARE) {
        // 类型5: 导航到笔记详情并打开分享弹窗
        url = this.getNoteUrl('&share=true');
      } else if (type === NAVIGATION_TYPES.ACTIVITY) {
        // 类型6: 导航到活动详情页
        const activityId = this.item.activity_id || this.itemData.activity.id;
        if (activityId) {
          url = 'activity/details?id=' + activityId;
        }
      } else {
        // 默认导航 - 根据内容类型决定
        url = this.getNoteUrl();
      }
      
      // 安全地进行导航
      if (url) {
        try {
          uni.navigateTo({
            url: '/pages/' + url,
            fail: (err) => {
              console.error('页面导航失败:', err);
              // 尝试使用switchTab作为备选方案
              uni.switchTab({
                url: '/pages/index/index',
                fail: () => {
                  console.error('无法导航到页面');
                }
              });
            }
          });
        } catch (e) {
          console.error('导航异常:', e);
        }
      }
    },
    
    // 打开位置
    opLocationClick() {
      // 防御性检查
      if (!this.item) return;
      
      // 获取纬度
      let latitude = 0;
      try {
        if (this.item.latitude) {
          latitude = parseFloat(this.item.latitude);
        } else if (this.item.lat) {
          latitude = parseFloat(this.item.lat);
        }
        
        // 确保latitude是有效数字
        if (isNaN(latitude)) latitude = 0;
      } catch (e) {
        console.error('解析纬度失败:', e);
        latitude = 0;
      }
      
      // 获取经度
      let longitude = 0;
      try {
        if (this.item.longitude) {
          longitude = parseFloat(this.item.longitude);
        } else if (this.item.lng) {
          longitude = parseFloat(this.item.lng);
        }
        
        // 确保longitude是有效数字
        if (isNaN(longitude)) longitude = 0;
      } catch (e) {
        console.error('解析经度失败:', e);
        longitude = 0;
      }
      
      // 如果经纬度都是0，则无法打开位置
      if (latitude === 0 && longitude === 0) {
        uni.showToast({
          title: '位置信息不完整',
          icon: 'none'
        });
        return;
      }
      
      // 安全地打开位置
      try {
        uni.openLocation({
          latitude: latitude,
          longitude: longitude,
          name: this.locationName || '位置',
          address: this.locationName || '位置',
          fail: (err) => {
            console.error('打开位置失败', err);
            uni.showToast({
              title: '无法打开位置信息',
              icon: 'none'
            });
          }
        });
      } catch (e) {
        console.error('打开位置异常:', e);
        uni.showToast({
          title: '无法打开位置信息',
          icon: 'none'
        });
      }
    },
    
    // 关注用户 - 防抖包装器
    followUser() {
      this.debouncedFollowUser();
    },

    // 实际的关注处理逻辑
    followUserAction() {
      // 防御性检查
      if (!this.item || !this.item.uid) {
        return;
      }
      
      // 判断用户是否登录
      if (!this.$store.getters.isLogin) {
        toLogin();
        return;
      }
      
      // 防止重复点击
      if (this.isProcessing) return;
      this.isProcessing = true;
      
      // 获取目标用户ID，确保是整数类型
      const targetUserId = parseInt(this.item.uid);
      
      // 验证用户ID
      if (!targetUserId || targetUserId <= 0) {
        uni.showToast({
          title: "获取用户ID失败",
          icon: "none"
        });
        this.isProcessing = false;
        return;
      }
      
      // 当前的关注状态 - 使用统一的状态管理
      const { isFollow, isMutual } = this.itemData.followStatus;
      const isFollowed = isFollow || isMutual;
      
      // 准备请求参数
      const params = {
        follow_uid: targetUserId, // 目标用户ID
        is_follow: isFollowed ? 0 : 1 // 1:关注 0:取消关注
      };
      
      // 先更新本地UI状态，提升用户体验
      // Vue3兼容：直接赋值替代$set
      if (isFollowed) {
        // 取消关注
        this.item.is_follow = 0;
        this.item.is_mutual_follow = 0;

        // 如果存在user_info，也需要更新
        if (this.item.user_info) {
          this.item.user_info.is_follow = 0;
          this.item.user_info.is_mutual_follow = 0;
        }
      } else {
        // 添加关注
        this.item.is_follow = 1;
        // 互相关注状态需要等待服务器返回

        // 如果存在user_info，也需要更新
        if (this.item.user_info) {
          this.item.user_info.is_follow = 1;
        }
      }
      
      // 显示加载提示 - 使用较短的加载时间，增强用户体验
      uni.showToast({
        title: isFollowed ? "取消关注中..." : "关注中...",
        icon: "none",
        duration: 500
      });
      
      // 调用关注/取消关注API
      followUser(params).then(res => {
        if (res.status === 200) {
          // 处理互相关注状态
          if (res.data && res.data.is_mutual !== undefined) {
            const isMutual = res.data.is_mutual === 1;
            
            // Vue3兼容：直接赋值替代$set
            this.item.is_mutual_follow = isMutual ? 1 : 0;

            // 如果存在user_info，也需要更新
            if (this.item.user_info) {
              this.item.user_info.is_mutual_follow = isMutual ? 1 : 0;
            }
          }
          
          // 向父组件发送关注状态更新事件
          this.$emit('followback', {
            idx: this.idx,
            uid: this.item.uid,
            is_follow: isFollowed ? 0 : 1,
            is_mutual: res.data?.is_mutual || 0
          });
          
          // 显示操作结果提示
          uni.showToast({
            title: isFollowed ? "已取消关注" : "关注成功",
            icon: "none",
            duration: 1500
          });
        } else {
          // 错误处理：恢复原始状态 - Vue3兼容：直接赋值替代$set
          if (isFollowed) {
            // 恢复为已关注状态
            this.item.is_follow = 1;
            if (isMutual) {
              this.item.is_mutual_follow = 1;
            }

            // 如果存在user_info，也需要恢复
            if (this.item.user_info) {
              this.item.user_info.is_follow = 1;
              if (isMutual) {
                this.item.user_info.is_mutual_follow = 1;
              }
            }
          } else {
            // 恢复为未关注状态
            this.item.is_follow = 0;
            this.item.is_mutual_follow = 0;

            // 如果存在user_info，也需要恢复
            if (this.item.user_info) {
              this.item.user_info.is_follow = 0;
              this.item.user_info.is_mutual_follow = 0;
            }
          }
          
          // 显示错误提示
          uni.showToast({
            title: res.msg || "操作失败，请重试",
            icon: "none"
          });
        }
      }).catch((error) => {
        // 错误处理：恢复原始状态 - Vue3兼容：直接赋值替代$set
        if (isFollowed) {
          // 恢复为已关注状态
          this.item.is_follow = 1;
          if (isMutual) {
            this.item.is_mutual_follow = 1;
          }

          // 如果存在user_info，也需要恢复
          if (this.item.user_info) {
            this.item.user_info.is_follow = 1;
            if (isMutual) {
              this.item.user_info.is_mutual_follow = 1;
            }
          }
        } else {
          // 恢复为未关注状态
          this.item.is_follow = 0;
          this.item.is_mutual_follow = 0;

          // 如果存在user_info，也需要恢复
          if (this.item.user_info) {
            this.item.user_info.is_follow = 0;
            this.item.user_info.is_mutual_follow = 0;
          }
        }

        // 使用统一错误处理
        this.handleError(error, "网络错误，请稍后重试");
      }).finally(() => {
        this.isProcessing = false;
      });
    },
    
    // 跳转到视频页面
    toVideoPage() {
      this.navigateToPage(this.getNoteUrl());
    },

    // 跳转到详情页面
    toDetailsPage() {
      this.navigateToPage('note/details?id=' + this.item.id);
    },

    // 统一的页面导航方法
    navigateToPage(url) {
      // 防御性检查
      if (!this.item || !this.item.id || !url) return;

      try {
        uni.navigateTo({
          url: '/pages/' + url,
          fail: (err) => {
            console.error('页面导航失败:', err);
            // 尝试使用switchTab作为备选方案
            uni.switchTab({
              url: '/pages/index/index',
              fail: () => {
                console.error('无法导航到页面');
              }
            });
          }
        });
      } catch (e) {
        console.error('导航异常:', e);
      }
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
  },
  mounted() {
    // 只有在类型未定义时才进行基本检查和设置
    if (!this.item) return;
    
    if (this.item.type === undefined) {
      if (this.item.video || this.item.video_url) {
        this.$set(this.item, 'type', 3); // 视频类型
      } else if (this.item.audio || this.item.audio_cover) {
        this.$set(this.item, 'type', 4); // 音频类型
      } else if (this.getImages && this.getImages.length > 0) {
        this.$set(this.item, 'type', 2); // 图片类型
      } else {
        this.$set(this.item, 'type', 1); // 文本类型
      }
    }
  },
  beforeCreate() {
    // 确保组件在初始化时item不为null
    if (this.$options.propsData && !this.$options.propsData.item) {
      this.$options.propsData.item = {};
    }
  },
  errorCaptured(err, _, info) {
    return false; // 阻止错误继续传播
  }
}
</script>

<style>
.gg-box {
  border-bottom: 1px solid #f8f8f8;
  width: calc(100% - 60rpx);
  padding: 30rpx;
  display: flex;
}

.gg-box .gg-avatar {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  border: 1px solid #f8f8f8;
  position: relative;
}

.gg-avatar .top {
  position: absolute;
  right: -4rpx;
  bottom: -4rpx;
  width: 26rpx;
  height: 26rpx;
  border-radius: 50%;
  justify-content: center;
  background: #000;
}

.gg-avatar .top image {
  width: 100%;
  height: 100%;
}

.gg-box .gg-item {
  width: calc(100% - 88rpx - 2px);
  margin-left: 20rpx;
}

/* 用户名容器 */
.gg-item .gg-item-user .name-container {
  align-items: center;
}

.gg-item .gg-item-user .name {
  color: #000;
  font-size: 28rpx;
  line-height: 34rpx;
  font-weight: 700;
}

/* VIP图标样式 - 参考center.vue */
.gg-item .gg-item-user .status-icon {
  width: 70rpx;
  height: 30rpx;
  margin-right: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gg-item .gg-item-user .vip-icon {
  border-radius: 6rpx;
  padding: 2rpx;
}

.gg-item .gg-item-user .vip-icon image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.gg-item .gg-item-user .tag {
  margin-left: 12rpx;
  padding: 0 6rpx;
  height: 34rpx;
  border-radius: 4rpx;
  background: #f5f5f5;
}

.gg-item-user .tag image {
  margin: 0 3rpx;
  width: 20rpx;
  height: 20rpx;
}

.gg-item-user .tag text {
  margin: 0 3rpx;
  font-size: 18rpx;
}

.gg-item .gg-item-content {
  margin-top: 12rpx;
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

.g-item .g-item-img {
  width: 40rpx;
  height: 40rpx;
  background: #f8f8f8;
  border-radius: 4rpx;
  overflow: hidden;
}

.gg-item .gg-item-time {
  margin-top: 8rpx;
  margin-bottom: 12rpx;
  color: #999;
  font-size: 20rpx;
}

.gg-item .gg-item-comment {
  margin-top: 20rpx;
  width: calc(100% - 40rpx);
  padding: 20rpx;
  color: #999;
  font-size: 24rpx;
  font-weight: 400;
  word-break: break-word;
  white-space: pre-line;
  border-radius: 8rpx;
  background: #f8f8f8;
}

.gg-item .gg-item-unm {
  display: flex;
  align-items: center;
  width: 100%;
}

.gg-item-unm .unm-item {
  margin-top: 30rpx;
  display: flex;
  align-items: center;
}

.gg-item-unm .unm-item image {
  width: 44rpx;
  height: 44rpx;
}

.gg-item-unm .unm-item text {
  margin: 0 30rpx 0 6rpx;
  color: #999;
  font-size: 18rpx;
  font-weight: 700;
}

.wlc8 {
  -webkit-line-clamp: 8 !important;
  line-clamp: 8 !important;
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
  line-clamp: 4;
  -webkit-box-orient: vertical;
}

/* 关注按钮样式 */
.gg-item-user .follow-btn {
  margin-left: auto;
  padding: 0 20rpx;
  height: 48rpx;
  line-height: 48rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: #000;
  background: #f8f8f8;
  text-align: center;
}

.gg-item-user .follow-btn.active {
  color: #999;
  background: #f5f5f5;
}

.gg-item-user .follow-btn.mutual {
  color: #576b95;
  background: rgba(87, 107, 149, 0.1);
}

/* 移除原有 .topic-tag 样式，话题和圈子统一用 g-item/g-item-img/text 结构 */
.topic-tag,
.topic-tag text {
  /* 移除样式 */
  display: none !important;
}

/* 评论样式 */
.gg-item .gg-item-comments {
  margin-top: 20rpx;
  width: calc(100% - 40rpx);
  padding: 20rpx;
  font-size: 24rpx;
  border-radius: 8rpx;
  background: #f8f8f8;
}

.gg-item-comments .comment-item {
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.gg-item-comments .comment-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.gg-item-comments .comment-user {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 6rpx;
}

.gg-item-comments .comment-content {
  font-size: 24rpx;
  color: #666;
  line-height: 32rpx;
  word-break: break-all;
}

.gg-item-comments .comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
}

.gg-item-comments .comment-time {
  font-size: 20rpx;
  color: #999;
}

.gg-item-comments .comment-like {
  display: flex;
  align-items: center;
}

.gg-item-comments .comment-like image {
  width: 28rpx;
  height: 28rpx;
  margin-right: 4rpx;
}

.gg-item-comments .comment-like text {
  font-size: 20rpx;
  color: #999;
}

.gg-item-comments .comment-like text.active {
  color: #FA5150;
}

.gg-item-comments .more-comments {
  margin-top: 15rpx;
  text-align: center;
  font-size: 22rpx;
  color: #576b95;
  padding: 10rpx 0;
}



</style> 