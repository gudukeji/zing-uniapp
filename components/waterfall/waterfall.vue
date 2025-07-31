<template>
  <view class="waterfall-box">
    <!-- 左侧栏 -->
    <view class="waterfall-item">
      <!-- 活动区域 -->
      <view v-if="activity.length" class="waterfall-activity" style="height:556rpx">
        <swiper class="waterfall-activity-item" circular autoplay>
          <swiper-item v-for="(item, index) in activity" :key="index" :data-url="'activity/details?id=' + item.id" @tap="toPages">
            <view class="waterfall-activity-item">
              <view class="waterfall-activity-img">
                <lazy-image :src="item.img"></lazy-image>
                <view class="zt df">{{item.status_str || "加载中"}}</view>
                <view class="xxbt">
                  <view class="waterfall-activity-name ohto">{{item.name || "活动名称加载中"}}</view>
                  <view class="waterfall-activity-tag df">
                    <image src="/static/img/wz.png" style="margin-right:4rpx"></image>
                    <view class="ohto">{{item.adds_name || "活动地址加载中"}}</view>
                  </view>
                </view>
              </view>
              <view class="waterfall-activity-tag df">
                <image src="/static/img/sj.png" style="margin-right:4rpx"></image>
                <view class="ohto">{{item.activity_time || "活动时间加载中"}}</view>
              </view>
              <view v-if="item.user_count" class="waterfall-activity-group">
                <view v-for="(img, imgIndex) in item.avatar_list" :key="imgIndex" class="group-img">
                  <image :src="img" mode="aspectFill"></image>
                </view>
                <view class="group-tit">{{item.user_count}}人已参加</view>
              </view>
              <view v-else style="margin-left:16rpx;font-size:20rpx">{{item.browse}} 人想参加</view>
              <view class="waterfall-activity-btn small df">
                <text>{{item.is_join ? "查看详情" : "立即参加"}}</text>
                <image class="effect" src="/static/img/z.png" style="margin-left:16rpx"></image>
              </view>
            </view>
          </swiper-item>
        </swiper>
        <view class="waterfall-activity-btn big df" data-url="activity/index?type=0" @tap="toPages">
          <text>查看全部活动</text>
        </view>
      </view>
      
      <!-- 左侧笔记列表 -->
      <view 
        v-for="(v, i) in leftList" 
        :key="i" 
        class="waterfall-note" 
        :style="{'height': v.bgHigh + 'rpx'}" 
        :data-url="(v.type == 2 || v.type == 3 || v.type == 4) ? 'note/video?id=' + v.id : 'note/details?id=' + v.id" 
        @tap="toPages"
      >
        <!-- 纯文本类型 -->
        <view v-if="v.type == 1 && (!v.images || v.images.length === 0)" class="waterfall-note-top text-only" :style="{'height': v.high + 'rpx', 'max-height': v.high + 'rpx', 'overflow': 'hidden'}">
          <view class="waterfall-note-content ohto2 text-content" :style="{'max-height': (v.high - 40) + 'rpx', '-webkit-line-clamp': 'unset'}">{{v.content}}</view>
        </view>
        <!-- 图片、视频类型 -->
        <view v-else-if="v.type != 1" class="waterfall-note-top" :style="{'height': v.high + 'rpx'}">
          <lazy-image 
            v-if="v.type == 2 || v.type == 3" 
            :src="getMediaUrl(v)"
            :style="{'border-radius': '8rpx 8rpx 0 0'}"
          ></lazy-image>
          <image v-if="v.type == 2 && getImageCount(v) > 1" class="xxiv" src="/static/img/i.png"></image>
          <image v-if="v.type == 3" class="xxiv" src="/static/img/v.png"></image>
          
          <!-- 音频类型 -->
          <view v-if="v.type == 4" class="xxa">
            <image class="xxa-bg" style="z-index:-2" :src="v.audio_cover || (v.audio && v.audio.cover ? v.audio.cover : '/static/img/audio_cover.png')"></image>
            <view class="xxa-mb"></view>
            <view class="xxa-top">
              <image class="xxa-top-img" :src="v.audio_cover || (v.audio && v.audio.cover ? v.audio.cover : '/static/img/audio_cover.png')"></image>
              <image class="xxa-icon" src="/static/img/yw.png"></image>
            </view>
            <view class="xxa-t ohto">{{v.audio_title || (v.audio && v.audio.name ? v.audio.name : '音频')}}</view>
            <view class="xxa-tt ohto">{{v.audio_intro || (v.audio && v.audio.intro ? v.audio.intro : '点击播放音频')}}</view>
            <view class="xxa-play df">
              <image src="/static/img/play.png"></image>
              <text>去播放</text>
            </view>
          </view>
          
          <!-- 置顶标记 -->
          <view v-if="v.top || v.is_top" class="xxzd df">置顶</view>
        </view>
        
        <!-- 内容部分 - 只对非纯文本且非音频类型显示 -->
        <view v-if="(v.type != 1 && v.type != 4) || (v.images && v.images.length > 0)" class="waterfall-note-content ohto2" :class="{'wlc1': v.contentOne}">{{v.content}}</view>
        
        <!-- 笔记底部 -->
        <view class="waterfall-note-bottom df">
          <view class="waterfall-note-user df">
            <image :src="getUserAvatar(v)" mode="aspectFill"></image>
            <view class="ohto">{{getUserName(v)}}</view>
          </view>
          <view class="waterfall-note-like df" data-type="1" :data-i="i" @tap.stop="handleLike(v, i)">
            <image v-if="v.is_like" class="hi" src="/static/img/dz1.png"></image>
            <image v-else class="hi" src="/static/img/dz.png"></image>
            <text>{{v.likes || v.like_count || v.like_count_str || 0}}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 右侧栏 -->
    <view class="waterfall-item">
      <!-- 右侧笔记列表 -->
      <view 
        v-for="(v, i) in rightList" 
        :key="i" 
        class="waterfall-note" 
        :style="{'height': v.bgHigh + 'rpx'}" 
        :data-url="(v.type == 2 || v.type == 3 || v.type == 4) ? 'note/video?id=' + v.id : 'note/details?id=' + v.id" 
        @tap="toPages"
      >
        <!-- 纯文本类型 -->
        <view v-if="v.type == 1 && (!v.images || v.images.length === 0)" class="waterfall-note-top text-only" :style="{'height': v.high + 'rpx', 'max-height': v.high + 'rpx', 'overflow': 'hidden'}">
          <view class="waterfall-note-content ohto2 text-content" :style="{'max-height': (v.high - 40) + 'rpx', '-webkit-line-clamp': 'unset'}">{{v.content}}</view>
        </view>
        <!-- 图片、视频类型 -->
        <view v-else-if="v.type != 1" class="waterfall-note-top" :style="{'height': v.high + 'rpx'}">
          <lazy-image 
            v-if="v.type == 2 || v.type == 3" 
            :src="getMediaUrl(v)"
            :style="{'border-radius': '8rpx 8rpx 0 0'}"
          ></lazy-image>
          <image v-if="v.type == 2 && getImageCount(v) > 1" class="xxiv" src="/static/img/i.png"></image>
          <image v-if="v.type == 3" class="xxiv" src="/static/img/v.png"></image>
          
          <!-- 音频类型 -->
          <view v-if="v.type == 4" class="xxa">
            <image class="xxa-bg" style="z-index:-2" :src="v.audio_cover || (v.audio && v.audio.cover ? v.audio.cover : '/static/img/audio_cover.png')"></image>
            <view class="xxa-mb"></view>
            <view class="xxa-top">
              <image class="xxa-top-img" :src="v.audio_cover || (v.audio && v.audio.cover ? v.audio.cover : '/static/img/audio_cover.png')"></image>
              <image class="xxa-icon" src="/static/img/yw.png"></image>
            </view>
            <view class="xxa-t ohto">{{v.audio_title || (v.audio && v.audio.name ? v.audio.name : '音频')}}</view>
            <view class="xxa-tt ohto">{{v.audio_intro || (v.audio && v.audio.intro ? v.audio.intro : '点击播放音频')}}</view>
            <view class="xxa-play df">
              <image src="/static/img/play.png"></image>
              <text>去播放</text>
            </view>
          </view>
          
          <!-- 置顶标记 -->
          <view v-if="v.top || v.is_top" class="xxzd df">置顶</view>
        </view>
        
        <!-- 内容部分 - 只对非纯文本且非音频类型显示 -->
        <view v-if="(v.type != 1 && v.type != 4) || (v.images && v.images.length > 0)" class="waterfall-note-content ohto2" :class="{'wlc1': v.contentOne}">{{v.content}}</view>
        
        <!-- 笔记底部 -->
        <view class="waterfall-note-bottom df">
          <view class="waterfall-note-user df">
            <image :src="getUserAvatar(v)" mode="aspectFill"></image>
            <view class="ohto">{{getUserName(v)}}</view>
          </view>
          <view class="waterfall-note-like df" data-type="2" :data-i="i" @tap.stop="handleLike(v, i)">
            <image v-if="v.is_like" class="hi" src="/static/img/dz1.png"></image>
            <image v-else class="hi" src="/static/img/dz.png"></image>
            <text>{{v.likes || v.like_count || v.like_count_str || 0}}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import lazyImage from '@/components/lazyImage/lazyImage.vue'
import { likeDynamic } from '@/api/social.js'

export default {
  name: 'waterfall',
  components: {
    lazyImage
  },
  props: {
    page: {
      type: Number,
      default: 1
    },
    activity: {
      type: Array,
      default: () => [],
      required: false
    },
    note: {
      type: Array,
      default: () => [],
      required: false
    }
  },
  data() {
    return {
      left: 0,
      right: 0,
      leftList: [],
      rightList: [],
      isNoteVideo: true,
      _lastProcessedLength: 0,

      // 性能优化相关
      renderLeftItems: 10,      // 左侧渲染数量
      renderRightItems: 10,     // 右侧渲染数量
      renderStep: 5,            // 每次增加渲染数量
      maxRenderItems: 50,       // 最大渲染数量

      // 缓存优化
      processedItems: new Map(), // 已处理项目缓存
      layoutCache: new Map(),    // 布局计算缓存

      // 防抖定时器
      layoutTimer: null,

      // 性能监控
      performanceMetrics: {
        layoutTime: 0,
        renderTime: 0,
        lastUpdate: 0
      }
    }
  },
  created() {
    // 尝试从全局获取状态
    try {
      if (typeof getApp === 'function') {
        const app = getApp()
        if (app && app.globalData) {
          this.isNoteVideo = app.globalData.isNoteVideo !== undefined ? app.globalData.isNoteVideo : true
        }
      }
    } catch (e) {
      console.log('获取配置失败', e)
    }
  },
  watch: {
    note: {
      handler(newVal, oldVal) {
        if (!newVal || newVal.length === 0) {
          this.clearLayout();
          return;
        }

        // 防抖处理，避免频繁重新布局
        if (this.layoutTimer) {
          clearTimeout(this.layoutTimer);
        }

        this.layoutTimer = setTimeout(() => {
          this.handleNoteChange(newVal, oldVal);
        }, 100);
      },
      immediate: false,
      deep: false // 不需要深度监听，只监听数组引用变化
    }
  },

  computed: {
    // 虚拟滚动 - 左侧可见列表
    visibleLeftList() {
      return this.leftList.slice(0, this.renderLeftItems);
    },

    // 虚拟滚动 - 右侧可见列表
    visibleRightList() {
      return this.rightList.slice(0, this.renderRightItems);
    },

    // 性能指标
    performanceInfo() {
      return {
        totalItems: this.leftList.length + this.rightList.length,
        renderedItems: this.renderLeftItems + this.renderRightItems,
        cacheSize: this.layoutCache.size,
        lastLayoutTime: this.performanceMetrics.layoutTime
      };
    }
  },

  mounted() {
    // 检查初始数据
    if (this.note && this.note.length > 0) {
      this.xinxuan(this.note);
    }
  },

  methods: {
    // 处理note数据变化
    handleNoteChange(newVal, oldVal) {
      const startTime = Date.now();

      try {
        // 检查是否有新数据需要处理
        const needProcess = this.page === 1 ||
                            !this._lastProcessedLength ||
                            newVal.length > this._lastProcessedLength;

        if (!needProcess) {
          return;
        }

        // 处理数据
        this.xinxuan(newVal);

        // 记录性能指标
        this.performanceMetrics.layoutTime = Date.now() - startTime;
        this.performanceMetrics.lastUpdate = Date.now();

      } catch (error) {
        console.error('瀑布流布局处理失败:', error);
        this.handleLayoutError(error);
      }
    },

    // 清空布局
    clearLayout() {
      this.left = 0;
      this.right = 0;
      this.leftList = [];
      this.rightList = [];
      this._lastProcessedLength = 0;
      this.processedItems.clear();
      this.layoutCache.clear();
    },

    // 处理布局错误
    handleLayoutError(error) {
      console.error('瀑布流布局错误:', error);
      // 重置为安全状态
      this.clearLayout();
    },

    // 获取缓存的布局信息
    getCachedLayout(item) {
      const cacheKey = `${item.id}_${item.type}_${item.content?.length || 0}`;
      return this.layoutCache.get(cacheKey);
    },

    // 缓存布局信息
    setCachedLayout(item, layout) {
      const cacheKey = `${item.id}_${item.type}_${item.content?.length || 0}`;
      this.layoutCache.set(cacheKey, layout);

      // 限制缓存大小
      if (this.layoutCache.size > 200) {
        const firstKey = this.layoutCache.keys().next().value;
        this.layoutCache.delete(firstKey);
      }
    },
    // 获取媒体URL - 根据内容类型返回合适的URL
    getMediaUrl(item) {
      if (!item) return '';
      
      // 图片类型 (type=2 或旧数据中的type=1)
      if (item.type === 2 || item.type === 1) {
        // 优先使用imgs字段
        if (item.imgs?.length) {
          return typeof item.imgs[0] === 'string' ? item.imgs[0] : (item.imgs[0].url || '');
        }
        
        // 处理旧版数据结构中的img对象
        if (item.img?.url) {
          return item.img.url;
        }
        
        // 处理images字段
        if (item.images) {
          if (typeof item.images === 'string') {
            try {
              const images = JSON.parse(item.images);
              return Array.isArray(images) && images.length > 0 ? images[0] : '';
            } catch (e) {
              return item.images;
            }
          } else if (Array.isArray(item.images) && item.images.length > 0) {
            return typeof item.images[0] === 'string' ? item.images[0] : (item.images[0].url || '');
          }
        }
      } 
      // 视频类型 (type=3 或旧数据中的type=2)
      else if (item.type === 3 || item.type === 2) {
        // 优先使用视频封面
        if (item.video_cover) {
          return item.video_cover;
        }
        // 如果是对象形式的video
        if (item.video?.cover) {
          return item.video.cover;
        }
        // 如果是字符串形式且有图片，使用第一张图片作为封面
        if (item.images?.length) {
          return typeof item.images[0] === 'string' ? item.images[0] : (item.images[0].url || '');
        }
      }
      // 音频类型 (type=4 或旧数据中的type=3)
      else if (item.type === 4 || item.type === 3) {
        // 优先使用音频封面
        if (item.audio_cover) {
          return item.audio_cover;
        }
        // 如果是对象形式的audio
        if (item.audio?.cover) {
          return item.audio.cover;
        }
      }
      
      return '';
    },
    
    // 获取图片数量
    getImageCount(item) {
      if (!item) return 0;
      
      // 首先检查imgs字段
      if (item.imgs?.length) {
        return item.imgs.length;
      }
      
      // 兼容旧版数据结构 img_count
      if (item.img_count !== undefined) {
        return parseInt(item.img_count) || 0;
      }
      
      // 检查images字段
      if (item.images) {
        if (Array.isArray(item.images)) {
          return item.images.length;
        }
        
        if (typeof item.images === 'string') {
          try {
            const images = JSON.parse(item.images);
            return Array.isArray(images) ? images.length : 0;
          } catch (e) {
            return item.images.trim() ? 1 : 0;
          }
        }
      }
      
      return 0;
    },
    
    // 获取媒体尺寸信息，返回{width, height, ratio}
    getMediaDimensions(item) {
      if (!item) return { width: 0, height: 0, ratio: 1 };
      
      let width = 0, height = 0, ratio = 1;
      
      // 1. 旧数据结构: 图片类型的img对象
      if (item.img?.wide && item.img?.high && item.img.high > 0) {
        width = item.img.wide;
        height = item.img.high;
        ratio = width / height;
      }
      // 2. 旧数据结构: 视频对象
      else if (item.video?.wide && item.video?.high && item.video.high > 0) {
        width = item.video.wide;
        height = item.video.high;
        ratio = width / height;
      }
      // 3. 新数据结构: imgs数组的第一个元素
      else if (item.imgs?.[0]?.wide && item.imgs?.[0]?.high && item.imgs[0].high > 0) {
        width = item.imgs[0].wide;
        height = item.imgs[0].high;
          ratio = width / height;
        }
      // 4. 新数据结构: 图片宽高信息
      else if (item.image_width && item.image_height && item.image_height > 0) {
        width = item.image_width;
        height = item.image_height;
        ratio = width / height;
      }
      // 5. 新数据结构: 视频宽高信息
      else if (item.video_width && item.video_height && item.video_height > 0) {
        width = item.video_width;
        height = item.video_height;
        ratio = width / height;
      }
      
      // 默认使用1:1比例
      if (ratio <= 0) {
        ratio = 1;
      }
      
      return { width, height, ratio };
    },
    
    // 优化后的瀑布流布局计算
    xinxuan(noteList) {
      const startTime = Date.now();

      // 第一页重置布局
      if (this.page == 1) {
        this.clearLayout();
        if (this.activity.length) {
          this.left = 556;
        }
      } else {
        // 加载更多时只处理新数据
        let existCount = this.leftList.length + this.rightList.length;
        let newCount = noteList.length - existCount;
        if (newCount <= 0) {
          return;
        }
        noteList = noteList.slice(-newCount);
      }

      // 批量处理，提高性能
      this.batchProcessItems(noteList);

      // 更新渲染数量
      this.updateRenderCounts();

      // 记录处理时间
      const processTime = Date.now() - startTime;
      this.performanceMetrics.layoutTime = processTime;

      if (processTime > 100) {
        console.warn('瀑布流布局计算较慢:', processTime + 'ms');
      }
    },

    // 批量处理项目
    batchProcessItems(noteList) {
      // 使用requestAnimationFrame分批处理，避免阻塞UI
      const batchSize = 10;
      let currentIndex = 0;

      const processBatch = () => {
        const endIndex = Math.min(currentIndex + batchSize, noteList.length);

        for (let i = currentIndex; i < endIndex; i++) {
          this.processItem(noteList[i], i);
        }

        currentIndex = endIndex;

        if (currentIndex < noteList.length) {
          // 继续处理下一批
          this.$nextTick(processBatch);
        } else {
          // 处理完成，更新记录
          this._lastProcessedLength = this.leftList.length + this.rightList.length;
        }
      };

      processBatch();
    },

    // 处理单个项目
    processItem(originalItem, index) {
      // 检查缓存
      const cached = this.getCachedLayout(originalItem);
      if (cached) {
        this.addItemToColumn(cached);
        return;
      }

      // 创建副本避免修改原始数据
      let item = { ...originalItem };

      // 计算布局
      const layout = this.calculateItemLayout(item);

      // 缓存结果
      this.setCachedLayout(originalItem, layout);

      // 添加到列
      this.addItemToColumn(layout);
    },

    // 添加项目到列
    addItemToColumn(item) {
      // 决定放在左侧还是右侧 - 总是选择当前高度较小的一列
      if (this.left <= this.right) {
        this.left += item.bgHigh + 8; // 加上间距
        this.leftList.push(item);
      } else {
        this.right += item.bgHigh + 8; // 加上间距
        this.rightList.push(item);
      }
    },

    // 更新渲染数量
    updateRenderCounts() {
      this.renderLeftItems = Math.min(this.leftList.length, this.maxRenderItems);
      this.renderRightItems = Math.min(this.rightList.length, this.maxRenderItems);
    },

    // 计算项目布局
    calculateItemLayout(item) {
      // 瀑布流容器宽度 - 小程序设计宽度为750rpx，每列约占一半减去间距
      const COLUMN_WIDTH = 359; // rpx

      // 确保内容字段
      if (!item.content) {
        item.content = '';
      }

      // 处理数据类型映射 (兼容旧数据结构)
      // 新版: 1=纯文本, 2=图片, 3=视频, 4=音频
      // 旧版: 0=纯文本, 1=图片, 2=视频, 3=音频
      if (item.type === 0) {
        // 旧版纯文本转为新版纯文本
        item.type = 1;
        item.isTextOnly = true;
      } else if (item.type === 1 && item.img) {
        // 旧版图片转为新版图片
        item.type = 2;
      } else if (item.type === 2 && item.video) {
        // 旧版视频转为新版视频
        item.type = 3;
      } else if (item.type === 3 && item.audio) {
        // 旧版音频转为新版音频
        item.type = 4;
      }

      // 如果type未定义，通过内容判断
      if (!item.type) {
        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
          item.type = 2; // 有图片，认为是图片类型
        } else if (item.video || item.video_cover) {
          item.type = 3; // 有视频，认为是视频类型
        } else if (item.audio || item.audio_cover) {
          item.type = 4; // 有音频，认为是音频类型
        } else {
          item.type = 1; // 默认为纯文本类型
        }
      }

      // 计算内容总高度
      let totalHeight = 0;
      let contentHeight = 0;
      let bottomHeight = 60; // 底部区域高度（用户头像和点赞）

      // 根据内容类型计算主要内容区域高度
      if (item.type === 1) {
        // 纯文本类型
        item.isTextOnly = true;

        // 根据文本长度计算高度，参考效果图
        const contentLength = item.content ? Array.from(item.content).length : 0;

        // 根据字符数估算高度
        if (contentLength <= 30) {
          contentHeight = 120; // 短文本
        } else if (contentLength <= 100) {
          contentHeight = 180; // 中等文本
        } else {
          contentHeight = 280; // 长文本，可以显示多行
        }

        // 保存高度
        item.high = contentHeight;
      }
      else if (item.type === 4) {
        // 音频类型 - 固定高度
        contentHeight = 374; // 根据原始组件中音频卡片高度设置
        item.high = contentHeight;
        item.contentOne = true; // 标记不显示额外内容
      }
      else if (item.type === 2 || item.type === 3) {
        // 图片或视频类型
        const dimensions = this.getMediaDimensions(item);

        // 基于宽度计算高度，保持原始比例
        const ratio = dimensions.ratio || 1;

        if (ratio >= 1.5) {
          // 横向图片/视频 (宽/高 >= 1.5)
          contentHeight = Math.round(COLUMN_WIDTH / ratio);
          contentHeight = Math.max(contentHeight, 180); // 最小高度
        } else if (ratio <= 0.7) {
          // 纵向图片/视频 (宽/高 <= 0.7)
          contentHeight = Math.round(COLUMN_WIDTH / ratio);
          contentHeight = Math.min(contentHeight, 400); // 最大高度限制
        } else {
          // 接近方形的图片/视频
          contentHeight = COLUMN_WIDTH;
        }

        // 保存媒体区域高度
        item.high = contentHeight;
      }

      // 计算文本内容额外高度 (仅适用于图片/视频类型)
      let extraContentHeight = 0;
      if ((item.type === 2 || item.type === 3) && item.content) {
        const contentLength = Array.from(item.content).length;

        if (contentLength <= 15) {
          // 内容很短，只占一行
          extraContentHeight = 40;
          item.contentOne = true;
        } else if (contentLength <= 50) {
          // 中等长度，2-3行
          extraContentHeight = 80;
          item.contentOne = false;
        } else {
          // 较长内容，但在UI中通常会被截断
          extraContentHeight = 100;
          item.contentOne = false;
        }
      }

      // 计算关联信息高度
      let relatedInfoHeight = 0;
      let hasRelatedInfo = false;

      // 位置信息
      if (item.location_name || item.adds_name) {
        hasRelatedInfo = true;
      }

      // 话题信息
      if ((item.topic_info && item.topic_info.length) ||
          (item.topics && item.topics.length)) {
        hasRelatedInfo = true;
      }

      // 商品信息
      if (item.product_info || item.goods_info || item.goods || item.order_id) {
        hasRelatedInfo = true;
      }

      // 活动信息
      if (item.activity_id || (item.activity && item.activity.id)) {
        hasRelatedInfo = true;
      }

      // 圈子信息
      if (item.circle_id) {
        hasRelatedInfo = true;
      }

      // 如果有关联信息，添加高度
      if (hasRelatedInfo) {
        relatedInfoHeight = 44; // 通常关联信息只占一行
      }

      // 计算总高度 = 内容高度 + 文本内容高度 + 关联信息高度 + 底部区域高度
      totalHeight = contentHeight + extraContentHeight + relatedInfoHeight + bottomHeight;

      // 保存计算结果
      item.bgHigh = totalHeight;

      // 返回处理后的项目
      return item;
    },

    // 获取媒体尺寸信息
    getMediaDimensions(item) {
      let width = 0;
      let height = 0;
      let ratio = 1;

      // 尝试从不同字段获取尺寸信息
      if (item.image_width && item.image_height) {
        width = item.image_width;
        height = item.image_height;
      } else if (item.video_width && item.video_height) {
        width = item.video_width;
        height = item.video_height;
      } else if (item.video && item.video.wide && item.video.high) {
        width = item.video.wide;
        height = item.video.high;
      } else if (item.imgs && item.imgs[0] && item.imgs[0].wide && item.imgs[0].high) {
        width = item.imgs[0].wide;
        height = item.imgs[0].high;
      } else {
        // 默认尺寸
        width = 359;
        height = 359;
      }

      if (width > 0 && height > 0) {
        ratio = width / height;
      }

      return { width, height, ratio };
    },
    
    /**
     * 处理点赞事件
     * @param {Object} item 动态项目
     * @param {Number} index 索引
     */
    handleLike(item, index) {
      // 判断用户是否登录
      if (!this.$store.getters.isLogin) {
        uni.navigateTo({
          url: '/pages/login/index'
        });
        return;
      }
      
      // 防止重复点击
      if (item.isProcessing) return;
      this.$set(item, 'isProcessing', true);
      
      const newLikeStatus = item.is_like !== 1;
      const oldLikeCount = parseInt(item.likes || 0);
      
      // 先更新UI，提高用户体验
      this.$set(item, 'is_like', newLikeStatus ? 1 : 0);
      this.$set(item, 'likes', newLikeStatus ? oldLikeCount + 1 : Math.max(0, oldLikeCount - 1));
      
      // 调用点赞API
      likeDynamic({
        id: item.id,
        is_like: newLikeStatus ? 1 : 0
      }).then(res => {
        // 点赞成功，通知父组件
        this.$emit('likeback', {
          index: index,
          id: item.id,
          isLike: newLikeStatus
        });
      }).catch(err => {
        // 点赞失败，恢复原状态
        this.$set(item, 'is_like', newLikeStatus ? 0 : 1);
        this.$set(item, 'likes', oldLikeCount);
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }).finally(() => {
        this.$set(item, 'isProcessing', false);
      });
    },
    
    // 页面跳转
    toPages(e) {
      const url = e.currentTarget.dataset.url;
      uni.navigateTo({
        url: '/pages/' + url
      })
    },
    
    // 获取用户头像
    getUserAvatar(item) {
      if (!item) return '/static/img/avatar.png';
      
      // 兼容旧版数据结构
      if (item.user && item.user.avatar) {
        return item.user.avatar;
      }
      
      // 新版数据结构
      if (item.avatar) {
        return item.avatar;
      } else if (item.user_info && item.user_info.avatar) {
        return item.user_info.avatar;
      }
      
      return '/static/img/avatar.png';
    },
    
    // 获取用户名称
    getUserName(item) {
      if (!item) return '用户';
      
      // 兼容旧版数据结构
      if (item.user && item.user.name) {
        return item.user.name;
      }
      
      // 新版数据结构
      if (item.nickname) {
        return item.nickname;
      } else if (item.user && item.user.nickname) {
        return item.user.nickname;
      } else if (item.user_info && item.user_info.nickname) {
        return item.user_info.nickname;
      } else if (item.user_info && item.user_info.name) {
        return item.user_info.name;
      }
      
      return '用户';
    }
  }
}
</script>

<style scoped>
.waterfall-box {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 8rpx;
  box-sizing: border-box;
}

.waterfall-item {
  width: calc(50% - 4rpx);
}

.waterfall-note {
  margin-bottom: 8rpx;
  border-radius: 8rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.03);
}

.waterfall-note .waterfall-note-top {
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #f8f8f8;
}

.waterfall-note-top.text-only {
  background: #f8f8f8;
  padding: 16rpx;
  box-sizing: border-box;
  width: 100%;
  border-radius: 8rpx 8rpx 0 0;
  display: flex;
  flex-direction: column;
}

.text-content {
  margin: 0 !important;
  font-size: 26rpx;
  line-height: 36rpx;
  color: #333;
  word-break: break-word;
  white-space: pre-wrap;
}

.waterfall-note-top .xxiv,
.waterfall-note-top .xxa .xxa-icon {
  filter: drop-shadow(0 2rpx 2rpx rgba(0, 0, 0, 0.2));
}

.waterfall-note-top .xxiv {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 28rpx;
  height: 28rpx;
}

.waterfall-note-top .xxa {
  width: calc(100% - 64rpx);
  height: calc(100% - 64rpx);
  padding: 32rpx;
  position: relative;
  z-index: 1;
  color: #fff;
}

.waterfall-note-top .xxa .xxa-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
  object-fit: cover;
}

.waterfall-note-top .xxa .xxa-mb {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  -webkit-backdrop-filter: saturate(150%) blur(25px);
  backdrop-filter: saturate(150%) blur(25px);
  background: rgba(0, 0, 0, 0.5);
}

.waterfall-note-top .xxa .xxa-top {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  position: relative;
  overflow: hidden;
}

.waterfall-note-top .xxa .xxa-top-img {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
}

.waterfall-note-top .xxa .xxa-icon {
  position: absolute;
  top: 35rpx;
  right: 35rpx;
  bottom: 35rpx;
  left: 35rpx;
  width: 50rpx;
  height: 50rpx;
}

.waterfall-note-top .xxa .xxa-t {
  margin-top: 32rpx;
  font-size: 26rpx;
  font-weight: 700;
}

.waterfall-note-top .xxa .xxa-tt {
  margin: 8rpx 0 32rpx;
  opacity: 0.8;
  font-size: 20rpx;
}

.waterfall-note-top .xxa .xxa-play {
  width: 100%;
  height: 60rpx;
  font-size: 18rpx;
  font-weight: 700;
  border-radius: 60rpx;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
}

.waterfall-note-top .xxa .xxa-play image {
  margin-right: 8rpx;
  width: 16rpx;
  height: 16rpx;
}

.waterfall-note-top .xxzd {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  width: 52rpx;
  height: 32rpx;
  color: #fff;
  font-size: 16rpx;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8rpx;
}

.waterfall-note .waterfall-note-content {
  width: calc(100% - 32rpx);
  margin: 12rpx 16rpx;
  font-size: 26rpx;
  line-height: 36rpx;
  word-break: break-word;
  white-space: pre-line;
  color: #333;
}

.waterfall-note .waterfall-note-bottom {
  width: calc(100% - 32rpx);
  margin: 0 16rpx;
  height: 60rpx;
  justify-content: space-between;
}

.waterfall-note-bottom .waterfall-note-user {
  display: flex;
  align-items: center;
}

.waterfall-note-bottom .waterfall-note-user image {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
}

.waterfall-note-bottom .waterfall-note-like image {
  width: 28rpx;
  height: 28rpx;
}

.waterfall-note .waterfall-note-top,
.waterfall-note-bottom .waterfall-note-user image,
.waterfall-activity .waterfall-activity-item,
.waterfall-activity .big,
.wlc10 {
  background: #f8f8f8;
}

.waterfall-note-bottom .waterfall-note-user view,
.waterfall-note-bottom .waterfall-note-like text {
  margin-left: 8rpx;
  line-height: 32rpx;
}

.waterfall-note-bottom .waterfall-note-user view {
  color: #333;
  max-width: 140rpx;
  font-size: 20rpx;
}

.waterfall-note-bottom .waterfall-note-like text {
  color: #999;
  font-size: 20rpx;
}

.wlc1 {
  -webkit-line-clamp: 1 !important;
}

.ohto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ohto2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.df {
  display: flex;
  align-items: center;
}

/* 活动区域样式调整 */
.waterfall-activity {
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.waterfall-activity-item {
  border-radius: 8rpx 8rpx 0 0;
  overflow: hidden;
}

.waterfall-activity-img {
  position: relative;
  border-radius: 8rpx 8rpx 0 0;
  overflow: hidden;
}

.waterfall-activity .big {
  height: 72rpx;
  border-radius: 0 0 8rpx 8rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
  justify-content: center;
}

/* 图片类卡片的图片样式 */
.lazy-image {
  border-radius: 8rpx 8rpx 0 0;
  overflow: hidden;
}

/* 活动区域更详细样式（从原始组件复制） */
.waterfall-activity .waterfall-activity-item {
  height: 470rpx;
  overflow: hidden;
}

.waterfall-activity-item .waterfall-activity-img {
  margin-bottom: 16rpx;
  width: 100%;
  height: 290rpx;
  position: relative;
}

.waterfall-activity-img .zt {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  width: 68rpx;
  height: 38rpx;
  color: #fff;
  font-size: 16rpx;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8rpx;
  justify-content: center;
}

.waterfall-activity-img .xxbt {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 24rpx 0 8rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.waterfall-activity-img .waterfall-activity-name,
.waterfall-activity-item .waterfall-activity-tag {
  width: calc(100% - 32rpx);
  padding: 0 16rpx 8rpx;
}

.waterfall-activity-img .waterfall-activity-name {
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.waterfall-activity-item .waterfall-activity-tag image,
.waterfall-activity .waterfall-activity-btn image {
  width: 20rpx;
  height: 20rpx;
}

.waterfall-activity-item .waterfall-activity-tag view {
  width: calc(100% - 28rpx);
  color: #999;
  font-size: 20rpx;
  font-weight: 500;
}

.waterfall-activity-group {
  margin-left: 31rpx;
  direction: ltr;
  unicode-bidi: bidi-override;
  display: inline-block;
}

.waterfall-activity-group .group-img {
  width: 32rpx;
  height: 32rpx;
  display: inline-flex;
  position: relative;
  margin-left: -16rpx;
  border: 2rpx solid #f8f8f8;
  background: #fff;
  vertical-align: middle;
  border-radius: 50%;
}

.waterfall-activity-group .group-img image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.waterfall-activity-group .group-tit {
  display: inline-flex;
  margin-left: 8rpx;
  color: #999;
  font-size: 20rpx;
  font-weight: 500;
}

.waterfall-activity .waterfall-activity-btn {
  margin-top: 8rpx;
  font-weight: 700;
  justify-content: center;
}

.waterfall-activity .big {
  width: 100%;
  font-size: 22rpx;
  height: 70rpx;
}

.waterfall-activity .small {
  position: absolute;
  left: 16rpx;
  bottom: 16rpx;
  font-size: 20rpx;
  width: calc(100% - 32rpx);
  height: 60rpx;
  background: #fff;
}
</style> 