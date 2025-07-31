
<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-box" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="nav-item df" :style="{'width': '100%', 'height': titleBarHeight + 'px'}">
        <view class="nav-back df" @tap="navBack">
          <image src="/static/img/z.png" style="width:34rpx;height:34rpx"></image>
        </view>
        <view class="nav-user df">
          <view class="user-info df" :data-url="'user/details?id='+noteInfo.uid" @tap="navigateToFun">
            <image class="nav-user-avatar" :src="noteInfo.user_info.avatar" mode="aspectFill"></image>
            <view>
              <view class="nav-user-name ohto">{{noteInfo.user_info.nickname}}</view>
              <view v-if="noteInfo.location_name" class="nav-user-adds df" @tap.stop="openLocationClick">
                <image src="/static/img/wz.png"></image>
                <text>{{noteInfo.location_name}}</text>
              </view>
            </view>
          </view>
        </view>
        <!-- 关注按钮移到最右边 -->
        <view class="nav-follow" :style="followButtonStyle" v-if="noteInfo.uid && noteInfo.uid != userId">
          <view
            :class="['follow-btn-right', isFollowing ? 'active' : '', followInProgress ? 'loading' : '']"
            @tap.stop="followUser">
            <text v-if="!followInProgress">{{isFollowing ? '已关注' : '＋关注'}}</text>
            <text v-else>{{isFollowing ? '取消中...' : '关注中...'}}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-box" :style="{'margin-top': statusBarHeight + titleBarHeight + 'px', 'width': '100%'}">

      <!-- 图片类型 - 优化条件判断，使用计算属性 -->
      <block v-if="isImageNote && ((noteInfo.images && noteInfo.images.length > 0) || (noteInfo.imgs && noteInfo.imgs.length > 0))">
        <!-- 轮播图 -->
        <swiper 
          class="swiper-box" 
          :style="{'height': isHigh()}" 
          circular 
          @change="swiperChange">
          <swiper-item 
            v-for="(item, index) in noteInfo.type == 1 ? noteInfo.imgs : noteInfo.images" 
            :key="index" 
            class="swiper-item" 
            :data-i="index" 
            @tap="swiperClick">
            <image class="swiper-image" mode="aspectFill" :src="getImageSrc(item)"></image>
          </swiper-item>
        </swiper>
        
        <!-- 图片计数器 - 兼容type=1和type=2 -->
        <view v-if="(noteInfo.images && noteInfo.images.length > 1) || (noteInfo.imgs && noteInfo.imgs.length > 1)"
              class="current df" :style="{'top': 'calc('+(statusBarHeight+titleBarHeight)+'px + 20rpx)'}">
          {{swiperIdx+1}}/{{noteInfo.type == 1 ? noteInfo.imgs.length : noteInfo.images.length}}
        </view>
        
        <!-- 自定义指示器 - 兼容type=1和type=2 -->
        <view v-if="(noteInfo.images && noteInfo.images.length > 1) || (noteInfo.imgs && noteInfo.imgs.length > 1)" 
              class="indicator df">
            <view 
            v-for="(item, index) in noteInfo.type == 1 ? noteInfo.imgs : noteInfo.images" 
              :key="index" 
            :class="['indicator-item', index == swiperIdx ? 'active' : '']"
            :style="{
              'width': 'calc(100% / ' + (noteInfo.type == 1 ? noteInfo.imgs.length : noteInfo.images.length) + ' - 5px)'
            }">
            </view>
        </view>
      </block>
      
      <!-- 视频类型 - 类型3，优化条件判断 -->
      <video v-if="isVideoNote && noteInfo.video" class="video-box" :src="noteInfo.video" :poster="noteInfo.video_cover" show-mute-btn="true" autoplay custom-cache="false"></video>
      
      <!-- 音频类型 - 类型4，只有音频动态时才渲染 -->
      <view v-if="isAudioNote" class="audio-box df" :style="{'margin-top': '30rpx', 'margin-bottom': '30rpx'}">
        <image class="audio-bg" :src="noteInfo.audio_cover || '/static/img/audio_default_cover.png'" mode="aspectFill"></image>
        <view class="audio-mb"></view>
        <view class="audio-left">
          <image class="audio-left" :src="noteInfo.audio_cover || '/static/img/audio_default_cover.png'" mode="aspectFill"></image>
          <image class="icon" src="/static/img/yw.png"></image>
        </view>
        <view style="width:calc(100% - 338rpx)">
          <view class="audio-t1">{{noteInfo.audio_title || '未知音频'}}</view>
          <view class="audio-t2">{{noteInfo.content || '无描述信息'}}</view>
        </view>
        <view v-if="noteInfo.audio" class="audio-play" @tap="audioBgClick">
          <view v-if="bgAudioStatus" class="icon">
            <play :color="'#fff'"></play>
          </view>
          <image v-else class="icon" src="/static/img/a.png"></image>
        </view>
        <view v-else class="audio-error">
          <text>音频不可用</text>
        </view>
      </view>
      
      <!-- 内容文本区域（所有类型都显示） -->
      <view class="info-box">
        <!-- 文本内容 -->
        <view class="info-content">
          <text user-select="true">{{noteInfo.content}}</text>
        </view>
        
        <!-- 标签区域 -->
        <view v-if="noteInfo.topic_info && noteInfo.topic_info.length > 0 || hasCircle() || noteInfo.goods_info || noteInfo.activity_name" class="info-tag">
          <!-- 位置信息 -->
          <view v-if="noteInfo.location_name" class="tag-item df" @tap.stop="openLocationClick">
            <image class="icon" style="width:32rpx;height:32rpx" src="/static/img/wz.png"></image>
            <text style="padding:0 8rpx">{{noteInfo.location_name}}</text>
          </view>
          
          <!-- 话题标签 -->
          <view 
            v-for="(topic, topicIndex) in noteInfo.topic_info" 
            :key="'topic-'+topicIndex"
            class="tag-item df" 
            style="border-radius:40rpx" 
            :data-url="'topic/details?id='+topic.id"
            @tap="navigateToFun">
            <image class="icon" style="border-radius:50%" :src="topic.icon || '/static/img/topic_icon.png'" mode="aspectFill"></image>
            <text>{{topic.title}}</text>
          </view>
          
          <!-- 圈子标签 -->
          <view 
            v-if="hasCircle()" 
            class="tag-item df" 
            style="border-radius:40rpx" 
            :data-url="'note/circle?id='+getCircleId()" 
            @tap="navigateToFun">
            <image class="icon" style="border-radius:50%" :src="getCircleAvatar()" mode="aspectFill"></image>
            <text>{{getCircleName()}}</text>
          </view>
          
          <!-- 活动标签 -->
          <view 
            v-if="noteInfo.activity_name" 
            class="tag-item df" 
            :data-url="'activity/details?id='+noteInfo.activity_id" 
            @tap="navigateToFun">
            <image class="icon" style="border-radius:4rpx;width:50rpx" mode="aspectFill" :src="noteInfo.activity_img"></image>
            <text>{{noteInfo.activity_name}}</text>
          </view>
          
          <!-- 商品标签 -->
            <view 
            v-if="noteInfo.goods_info" 
              class="tag-item df" 
            :data-url="'goods/details?id='+noteInfo.goods_info.id" 
              @tap="navigateToFun">
            <image class="icon" style="border-radius:4rpx" :src="noteInfo.goods_info.image" mode="aspectFill"></image>
            <text>{{noteInfo.goods_info.name || noteInfo.goods_info.store_name}}</text>
            </view>
        </view>
      <!-- 投票展示区 -->
      <VoteComponent
        v-if="noteInfo.vote_info"
        :voteInfo="noteInfo.vote_info"
        @vote-success="handleVoteSuccess"
      />
        <!-- 底部信息 -->
        <view class="more df">
          <view class="more-left">{{noteInfo.create_time}} · {{noteInfo.province}} · 浏览 {{noteInfo.views}}</view>
          <image @tap="shareClick(true)" class="more-right" src="/static/img/gd.png"></image>
        </view>
      </view>
    </view>
    
    <!-- 评论区域 -->
    <view class="comment-box" id="commentId">
      <view class="comment-top df">
        <view class="top-title">{{noteInfo.comments ? '评论 '+noteInfo.comments : '暂无评论'}}</view>
        <view class="top-btn df">
          <view class="btn-active" :style="{'left': cType == 0 ? '6rpx' : '74rpx'}"></view>
          <view class="btn-item" :style="{'color': cType == 0 ? '#000' : '#999'}" @tap="commentClick(0)">默认 </view>
          <view class="btn-item" :style="{'color': cType == 1 ? '#000' : '#999'}" @tap="commentClick(1)">最新 </view>
        </view>
      </view>
      
      <!-- 评论为空 -->
      <view v-if="isEmpty" class="empty-box df">
        <image src="/static/img/empty.png"/>
        <view class="e1">期待你的评论</view>
        <view class="e2">发条评论表达你的想法吧</view>
      </view>
      
      <!-- 评论列表 -->
      <block v-else>
        <view v-for="(item, index) in commentList" :key="index" class="comment-item df">
          <!-- 评论头像 -->
          <view class="comment-avatar" :data-url="'user/details?id='+item.uid" @tap="navigateToFun">
            <lazy-image :src="item.avatar || '/static/img/default.png'"></lazy-image>
          </view>
          
          <!-- 评论内容 -->
          <view class="comment-info">
            <view class="comment-info-top df" :data-url="'user/details?id='+item.uid" @tap="navigateToFun">
              <view class="user-info-left">
                <view v-if="noteInfo.uid == item.uid" class="zz">作者</view>
                <view v-else-if="userId == item.uid" class="wo">我</view>
                {{item.nickname || '用户'}}
              </view>
              <!-- 点赞图标按钮 -->
              <view v-if="!item.delete_time" class="like-icon" @tap.stop="toggleCommentLike(item.id, item.is_like)">
                <image :src="item.is_like == 1 ? '/static/img/dz1.png' : '/static/img/dz.png'" mode="aspectFill"></image>
                <text v-if="item.likes > 0">{{item.likes}}</text>
              </view>
            </view>
            <!-- 评论内容点击回复 -->
            <view :class="['comment-info-content', (item.status != 5 || item.delete_time) && 'db']" @tap.stop="handleCommentClick($event, 1, item.uid, item.id, item.nickname || '用户', index, -1)">
              <rich-text 
                v-if="!item.delete_time" 
                :nodes="parseEmojiContent(item.content)" 
                user-select="true"
                @itemclick="onEmojiClick"
                class="comment-rich-text"
                :show-with-animation="false"
                :selectable="true"
              ></rich-text>
              <text v-else class="deleted-comment">(该评论已被删除)</text>
              <!-- 显示评论图片 -->
              <image 
                v-if="item.image && !item.delete_time" 
                class="comment-image" 
                mode="widthFix" 
                :src="item.image" 
                @tap.stop="previewCommentImage(item.image)"
                lazy-load
              ></image>
            </view>
                          <view class="comment-info-bottom df">
                <text>{{item.create_time}} {{item.province || ''}}</text>
                <!-- 回复按钮 -->
                <view v-if="!item.delete_time" @tap.stop="handleCommentClick($event, 1, item.uid, item.id, item.nickname || '用户', index, -1)">回复</view>
                <view v-if="userId == item.uid && item.status == 5 && !item.delete_time" @tap.stop="delComment" :data-id="item.id" :data-idx="index" data-i="-1">删除</view>
              </view>
            
            <!-- 回复列表 -->
            <template v-if="item.replies && item.replies.length > 0">
              <view v-for="(v, i) in sortRepliesByTime(item.replies)" :key="i" class="comment-item df">
                <view class="comment-avatar-z" :data-url="'user/details?id='+v.uid" @tap="navigateToFun">
                  <lazy-image :src="v.avatar || '/static/img/default.png'"></lazy-image>
                </view>
                
                <view class="comment-info" style="width:calc(100% - 68rpx)">
                  <view class="comment-info-top-z df">
                    <view class="user-info-left">
                      <view v-if="noteInfo.uid == v.uid" class="zz">作者</view>
                      <view v-else-if="userId == v.uid" class="wo">我</view>
                      <view class="nn ohto" :data-url="'user/details?id='+v.uid" @tap="navigateToFun">
                        {{v.nickname || '用户'}}
                      </view>
                      <!-- 显示回复关系 -->
                      <template v-if="v.reply_id && v.reply_id !== item.id">
                        <text> ▶ </text>
                        <view class="nn ohto" :data-url="'user/details?id='+v.reply_uid" @tap="navigateToFun">
                          {{v.reply_nickname || '用户'}}
                        </view>
                      </template>
                      <text>: </text>
                    </view>
                    <!-- 点赞图标按钮 -->
                    <view v-if="!v.delete_time" class="like-icon" @tap.stop="toggleCommentLike(v.id, v.is_like)">
                      <image :src="v.is_like == 1 ? '/static/img/dz1.png' : '/static/img/dz.png'" mode="aspectFill"></image>
                      <text v-if="v.likes > 0">{{v.likes}}</text>
                    </view>
                  </view>
                  
                                      <!-- 回复内容点击回复 -->
                    <view :class="['comment-info-content', (v.status != 5 || v.delete_time) && 'db', v.is_system_message && 'system-message']" @tap.stop="handleCommentClick($event, 1, v.uid, item.id, v.nickname || '用户', index, getReplyIndex(item.replies, v.id))">
                      <rich-text 
                        v-if="!v.delete_time && !v.is_system_message" 
                        :nodes="parseEmojiContent(v.content)" 
                        user-select="true"
                        @itemclick="onEmojiClick"
                        class="comment-rich-text reply-rich-text"
                        :show-with-animation="false"
                        :selectable="true"
                      ></rich-text>
                      <text v-else-if="v.delete_time" class="deleted-comment">(该评论已被删除)</text>
                      <text v-else-if="v.is_system_message" class="system-message">{{v.content}}</text>
                      <!-- 显示评论图片 -->
                      <image 
                        v-if="v.image && !v.delete_time" 
                        class="comment-image reply-comment-image" 
                        mode="widthFix" 
                        :src="v.image" 
                        @tap.stop="previewCommentImage(v.image)"
                        lazy-load
                      ></image>
                    </view>
                  
                  <view class="comment-info-bottom df">
                    <text>{{v.create_time}} {{v.province || ''}}</text>
                    <!-- 回复按钮 -->
                    <view v-if="!v.delete_time" @tap.stop="handleCommentClick($event, 1, v.uid, item.id, v.nickname || '用户', index, getReplyIndex(item.replies, v.id))">回复</view>
                    <view v-if="userId == v.uid && v.status == 5 && !v.delete_time" 
                          @tap.stop="delComment" :data-id="v.id" :data-idx="index" :data-i="getReplyIndex(item.replies, v.id)">
                      删除
                    </view>
                  </view>
                </view>
              </view>
            </template>
              
            <!-- 展开/加载回复按钮 -->
            <view v-if="item.reply_count > (item.replies ? item.replies.length : 0)" class="unfold" 
                  :data-id="item.id" :data-idx="index" @tap="loadAllReplies">
              <view v-if="item.loading_replies" class="loading-text">
                <image class="loading-icon" src="/static/img/loading.gif"></image>
                加载中...
              </view>
              <text v-else>
                <template v-if="!item.replies || item.replies.length === 0">
                  查看 {{item.reply_count}} 条回复
                </template>
                <template v-else-if="item.has_more_replies">
                  加载更多回复 ({{item.replies.length}}/{{item.reply_count}})
                </template>
                <template v-else>
                  已加载全部回复
                </template>
              </text>
            </view>
          </view>
        </view>
      </block>
      
      <!-- 加载更多 -->
      <uni-load-more v-if="loadStatus != 'no-more'" :status="loadStatus"></uni-load-more>
      <view v-else class="no-more">- THE END -</view>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="footer-box bUp">
      <view class="footer-item df">
        <view v-if="!isUser" class="footer-means df" data-url="center/means" @tap="navigateToFun">
          <text>完善账号资料后即可评论</text>
        </view>
        <view v-else class="footer-comment df" @tap="handleCommentClick($event)">
          <image :src="userAvatar || '/static/img/default.png'" mode="aspectFill"></image>
          <view class="ohto">{{comtext ? comtext : comtips}}</view>
        </view>
        <view class="df">
          <!-- 底部评论按钮 -->
          <view class="footer-icon" @tap="handleCommentClick($event)">
            <image src="/static/img/pl.png"></image>
            <text>{{noteInfo.comments ? noteInfo.comments : ''}} 评论</text>
          </view>
          <view class="footer-icon" @tap="likeDynamic">
            <image v-if="noteInfo.is_like == 1" class="hi" src="/static/img/dz1.png"></image>
            <image v-else class="hi" src="/static/img/dz.png"></image>
            <text v-if="noteInfo.likes < 10000">{{noteInfo.likes ? noteInfo.likes : ''}} 赞</text>
            <text v-else>{{noteInfo.like_count_str}} 赞</text>
          </view>
          <view class="footer-icon" @tap="shareClick(true)">
            <image src="/static/img/fx.png"></image>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 评论弹窗 -->
    <view v-if="isComment" class="popup-comment-mask" @tap="closeComment"></view>
    
    <!-- 评论输入组件 -->
    <comment-input 
      :show="isComment" 
      :placeholder="comtips"
      :focus="isFocus"
      ref="commentInput"
      @blur="closeComment"
      @send="handleCommentSubmit"
    ></comment-input>
    
    <!-- 更多弹窗功能已集成到分享组件中 -->
    
    <!-- 分享组件 -->
    <SharePanel 
      :show="isShareVisible" 
      :noteInfo="noteInfo"
      :userId="userId"
      @close="closeShare"
      @edit="handleEdit"
      @delete="handleDelete"
      @report="handleReport"
      @dislike="handleDislike"
    ></SharePanel>
    
    <!-- 提示弹窗 -->
    <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
      <view class="tips-box df">
        <view class="tips-item">{{tipsTitle}}</view>
      </view>
    </uni-popup>
    
    <!-- 表情预览弹窗 -->
    <view v-if="previewEmojiData" class="emoji-preview-popup" @tap="previewEmojiData = null">
      <image 
        class="emoji-preview-image" 
        :src="previewEmojiData.url" 
        mode="aspectFit"
      ></image>
    </view>
  </view>
</template>

<script>
import lazyImage from '@/components/lazyImage/lazyImage'
import play from '@/components/play/play'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'
import SharePanel from '@/components/share/index.vue'
import CommentInput from '@/components/comment-input/comment-input.vue'
import VoteComponent from '@/components/vote-component/vote-component.vue'
import sinaEmoji from '@/components/emoji-panel/sina.js'
import {
  getDynamicDetail,
  likeDynamic,
  deleteDynamic,
  getCommentsList,
  getCommentReplies,
  addComment,
  deleteComment,
  likeComment,
  unlikeComment,
  followUser,
  reportDynamic
} from '@/api/social.js'

export default {
  name: 'NoteDetails',
  components: {
    lazyImage,
    play,
    uniLoadMore,
    VoteComponent,
    SharePanel,
    CommentInput
  },
  watch: {
    // 监听swiperIdx的变化
    swiperIdx(newVal, oldVal) {
      if (newVal !== oldVal) {
        // 强制重新渲染指示器
        this.$forceUpdate()
      }
    }
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      menuButtonWidth: 0, // 胶囊按钮宽度，用于计算右边距
      keyboardHeight: 0,
      userId: 0,
      isUser: false,
      userName: "",
      userNickname: "",
      userAvatar: "/static/img/default.png", // 设置默认头像
      isFollowing: false,
      followChecked: false,
      isLoadingChildReplies: false,
      commentsCache: {}, // 初始化评论缓存对象
      commentCache: {}, // 初始化回复缓存对象
      noteInfo: {
        id: 0,
        uid: 0,
        user_id: 0,
        type: 0,
        user_info: {
          nickname: "昵称加载中",
          avatar: "/static/img/default.png" // 设置默认头像
        },
        content: "内容加载中",
        comments: 0,
        likes: 0,
        views: 0,
        is_like: false,
        create_time: "日期",
        location_name: "",
        province: "IP属地",
        images: [],
        video: "",
        video_cover: "",
        audio: null
      },
      swiperIdx: 0,
      isEmpty: false,
      commentView: false,
      shareView: false,
      commentList: [],
      cType: 0,
      isThrottling: true,
      cIdx: -1,
      cI: -1,
      page: 1,
      sonPage: 1,
      limit: 10,
      loadStatus: "loading",
      cCId: 0,
      cUId: 0,
      isComment: false,           // 评论框是否显示
      isFocus: false,             // 是否有焦点
      comtips: "说点什么...",     // 提示文字
      comtext: "",                // 评论内容
      commentActioning: false,    // 评论操作进行中
      commentSource: null,        // 评论来源
      commentBlurTimer: null,     // 控制失焦关闭的定时器
      
      // 音频相关状态 - 只有音频动态时才初始化
      bgAudioStatus: false,
      bgAudioManager: null,
      audioRetryCount: 0,
      audioPlayingId: '',
      
      tipsTitle: "",
      isSubmittingComment: false, // 是否正在提交评论
      isOpeningComment: false,    // 是否正在打开评论框
      isLoadingReplies: false,    // 是否正在加载回复
      isDeletingComment: false,   // 是否正在删除评论
      likeThrottling: false,      // 点赞防抖
      isShareVisible: false,      // 分享面板显示状态
      replyIndices: new Map(),    // 存储回复ID到索引的映射
      imagesLoaded: false,        // 图片是否已加载
      followInProgress: false,    // 关注操作进行中
      likeInProgress: false,      // 点赞操作进行中
      commentInProgress: false,   // 评论操作进行中
      debounceTimer: null,
      lastScrollTop: 0,
      
      commentImage: null,
      atUserList: [],
      
      // 表情相关优化
      emojiMap: new Map(), // 表情映射缓存，提高查找性能
      parsedContentCache: new Map(), // 解析内容缓存
      emojiClickTimer: null, // 表情点击防抖定时器
      isEmojiLoading: false, // 表情加载状态
      previewEmojiData: null, // 预览表情数据
      maxCacheSize: 200, // 最大缓存条目数
      
      // 性能优化相关
      isPageActive: true, // 页面是否活跃
      performanceTimer: null, // 性能监控定时器
      lazyLoadObserver: null, // 懒加载观察器
      debug: true, // 是否开启调试日志
    }
  },
  computed: {
    // 空状态判断
    showEmptyState() {
      return this.isEmpty && this.page === 1;
    },
    
    // 处理头像展示
    formattedUserAvatar() {
      return this.userAvatar || '/static/img/default.png';
    },
    
    // 发送按钮图标
    sendButtonSrc() {
      return this.comtext.length ? '/static/img/fs1.png' : '/static/img/fs.png';
    },
    
    // 是否为音频动态
    isAudioNote() {
      return this.noteInfo.type === 4;
    },
    
    // 是否为视频动态
    isVideoNote() {
      return this.noteInfo.type === 3;
    },
    
    // 是否为图片动态
    isImageNote() {
      return this.noteInfo.type === 1 || this.noteInfo.type === 2;
    },

    // 关注按钮样式（根据胶囊按钮位置动态计算）
    followButtonStyle() {
      const style = {};

      // #ifdef MP-WEIXIN
      if (this.menuButtonWidth > 0) {
        // 设置右边距，确保关注按钮不与胶囊按钮重叠
        style.paddingRight = this.menuButtonWidth + 'px';
        console.log('关注按钮右边距:', this.menuButtonWidth + 'px');
      } else {
        // 默认边距
        style.paddingRight = '88px';
      }
      // #endif

      // #ifndef MP-WEIXIN
      style.paddingRight = '30rpx';
      // #endif

      return style;
    },

    // 判断是否有任何操作在进行中
    anyActionInProgress() {
      return this.followInProgress || this.likeInProgress || this.commentInProgress;
    },

    // 表情缓存统计（用于性能监控）
    emojiCacheInfo() {
      return {
        emojiMapSize: this.emojiMap.size,
        parsedContentCacheSize: this.parsedContentCache.size,
        cacheHitRate: this.parsedContentCache.size > 0 ? 
          (this.parsedContentCache.size / (this.parsedContentCache.size + 10)).toFixed(2) : '0.00'
      };
    },
    
    // 页面性能统计
    pagePerformanceInfo() {
      return {
        commentCacheSize: Object.keys(this.commentCache).length,
        replyIndicesSize: this.replyIndices.size,
        isPageActive: this.isPageActive
      };
    },

  },
  async onLoad(options) {
    console.log('页面加载参数:', options);

    // 获取胶囊按钮位置信息
    this.getMenuButtonInfo();

    // 标记页面为活跃状态
    this.isPageActive = true;
    
    // 判断平台兼容性，只在支持分享菜单的平台调用
    if (uni.showShareMenu && typeof uni.showShareMenu === 'function') {
      uni.showShareMenu();
    }
    
    // 等待小程序初始化完成
    await this.$onLaunched;
    console.log('小程序初始化完成');
    
    // 初始化表情映射缓存
    this.initEmojiMap();
    
    // 加载最近使用的表情
    this.loadRecentEmojis();
    
    if (options.id) {
      console.log('获取到笔记ID:', options.id);
      this.noteInfo.id = options.id;
      
      // 是否从评论跳转
      if (options.comment) {
        this.commentView = !!options.comment;
        console.log('从评论跳转');
      }
      
      // 是否分享来源
      if (options.share) {
        this.shareView = !!options.share;
        console.log('从分享跳转');
      }
      
      // 先获取用户信息，再获取笔记详情
      console.log('开始获取用户信息');
      this.userInfoHandle();
      
      // 获取笔记详情
      console.log('开始获取笔记详情');
      this.dynamicDetails();
    } else {
      console.error('未提供笔记ID');
      this.opTipsPopup("笔记异常或已被删除，请稍后重试！", true);
    }
  },
  
  onShow() {
    // 标记页面为活跃状态
    this.isPageActive = true;
    
    // 更新用户信息（静默更新，避免重复请求）
    this.userInfoHandle();
    
    // 如果是音频动态且之前正在播放，恢复播放状态检查
    if (this.isAudioNote && this.bgAudioManager) {
      this.checkAudioStatus();
    }
  },
  
  onHide() {
    // 标记页面为非活跃状态
    this.isPageActive = false;
    
    // 只有音频类型才处理音频暂停
    if (this.isAudioNote && this.bgAudioManager && this.bgAudioStatus) {
      this.pauseAudio();
    }
  },
  
  mounted() {
    // 判断平台兼容性，只在支持页面滚动监听的平台添加监听
    if (uni.onPageScroll && typeof uni.onPageScroll === 'function') {
      uni.onPageScroll(this.handlePageScroll);
    }
    
    // 初始化懒加载
    this.initLazyLoad();
  },
  
  beforeUnmount() { // Vue3: beforeDestroy改为beforeUnmount
    // 标记页面为非活跃状态
    this.isPageActive = false;

    // 清理所有资源
    this.cleanupResources();
  },
  methods: {
    // 获取胶囊按钮位置信息
    getMenuButtonInfo() {
      // 尝试获取胶囊按钮信息
      try {
        // 微信小程序环境
        if (uni.canIUse('getMenuButtonBoundingClientRect')) {
          const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
          if (menuButtonInfo) {
            // 设置右边距，确保不与胶囊按钮重叠
            // 胶囊按钮宽度 + 额外间距
            this.menuButtonWidth = menuButtonInfo.width + 16;
            console.log('获取胶囊按钮信息成功:', menuButtonInfo);
            console.log('计算的右边距:', this.menuButtonWidth);
          }
        }
      } catch (e) {
        // 如果不是小程序环境或获取失败，设置默认值
        this.menuButtonWidth = 88; // 默认预留空间
        console.log('获取胶囊按钮信息失败，使用默认值:', this.menuButtonWidth);
      }
    },

    // 添加调试日志函数
    debugLog(...args) {
      if (this.debug) {
        console.log('[Details]', ...args);
      }
    },
    
    // 加载最近使用的表情
    loadRecentEmojis() {
      try {
        const recentEmojisStr = uni.getStorageSync('recent_emojis');
        if (recentEmojisStr) {
          this.recentEmojis = JSON.parse(recentEmojisStr);
        }
      } catch (e) {
        console.error('加载表情记录失败', e);
      }
    },
    
    // 初始化懒加载
    initLazyLoad() {
      // 这里可以添加图片懒加载逻辑
      console.log('初始化懒加载');
    },
    
    // 清理所有资源
    cleanupResources() {
      console.log('清理页面资源');
      
    // 判断平台兼容性，只在支持页面滚动监听的平台移除监听
    if (uni.offPageScroll && typeof uni.offPageScroll === 'function') {
      uni.offPageScroll(this.handlePageScroll);
    }
    
      // 销毁音频实例（只有音频动态时才执行）
      if (this.isAudioNote) {
    this.destroyAudioInstance();
      }
      
      // 清除所有定时器
      this.clearAllTimers();
      
      // 清除表情相关定时器和缓存
      this.cleanupEmojiResources();
      
      // 清理懒加载观察器
      if (this.lazyLoadObserver) {
        this.lazyLoadObserver.disconnect();
        this.lazyLoadObserver = null;
      }
    },
    
    // 清除所有定时器
    clearAllTimers() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
      if (this.commentBlurTimer) {
        clearTimeout(this.commentBlurTimer);
        this.commentBlurTimer = null;
      }
      
      if (this.performanceTimer) {
        clearTimeout(this.performanceTimer);
        this.performanceTimer = null;
      }
      
    if (this.imageCheckInterval) {
      clearInterval(this.imageCheckInterval);
      this.imageCheckInterval = null;
    }
    },
    
    // 清理表情相关资源
    cleanupEmojiResources() {
    if (this.emojiClickTimer) {
      clearTimeout(this.emojiClickTimer);
      this.emojiClickTimer = null;
    }
    
    // 清理表情缓存以释放内存
    this.clearEmojiCache();
  },
    
    // 检查是否有圈子
    hasCircle() {
      // 新的 circle_info 结构
      if (this.noteInfo.circle_info && this.noteInfo.circle_info.circle_id > 0) {
        return true;
      }
      // 兼容旧的直接字段结构
      if (this.noteInfo.circle_id && this.noteInfo.circle_id > 0) {
        return true;
      }
      return false;
    },
    
    // 获取圈子ID
    getCircleId() {
      if (this.noteInfo.circle_info && this.noteInfo.circle_info.circle_id) {
        return this.noteInfo.circle_info.circle_id;
      }
      return this.noteInfo.circle_id || 0;
    },
    
    // 获取圈子名称
    getCircleName() {
      if (this.noteInfo.circle_info && this.noteInfo.circle_info.circle_name) {
        return this.noteInfo.circle_info.circle_name;
      }
      return this.noteInfo.circle_name || '';
    },
    
    // 获取圈子头像
    getCircleAvatar() {
      if (this.noteInfo.circle_info && this.noteInfo.circle_info.circle_avatar) {
        return this.noteInfo.circle_info.circle_avatar;
      }
      return this.noteInfo.circle_avatar || '/static/img/qz1.png';
    },
    
    // 计算图片高度
    isHigh() {
      let height = "750rpx"; // 默认高度
      
      // 处理不同情况下的图片数组，兼容两种格式
      const imageArray = this.noteInfo.type === 1 ? this.noteInfo.imgs : this.noteInfo.images;
      
      // 确保有图片数组且索引有效
      if (imageArray && imageArray.length > 0 && imageArray[this.swiperIdx]) {
        const currentImage = imageArray[this.swiperIdx];
        let wide = 750; // 默认宽度
        let high = 750; // 默认高度
        
        // 获取宽高
        if (typeof currentImage === 'object') {
          wide = currentImage.wide || currentImage.width || 750;
          high = currentImage.high || currentImage.height || 750;
        }
        
        // 计算合适的高度
        if (wide && high) {
          // 计算高宽比例
          let ratio = high / wide;
          let calcHeight = Math.floor(750 * ratio);
          
          // 限制高度在合理范围内
          if (calcHeight > 1200) calcHeight = 1200;
          if (calcHeight < 500) calcHeight = 500;
          
          height = calcHeight + "rpx";
        }
      }
      
      return height;
    },
    
    // 获取用户信息
    userInfoHandle() {
      try {
        // 统一从本地存储获取用户信息，保持一致性
      let userInfo = uni.getStorageSync("USER_INFO") || {};
      console.log('本地存储用户数据类型:', typeof userInfo);
      
      // 确保userInfo是对象类型
      if (typeof userInfo === 'string') {
        try {
          userInfo = JSON.parse(userInfo);
          console.log('已将字符串解析为对象');
        } catch (e) {
          console.error('解析用户数据失败:', e);
          userInfo = {};
        }
      }
      
        // 从Vuex获取用户ID作为备用
        const storeUid = this.$store.state.app?.uid || 0;
      
        // 优先使用本地缓存中的用户信息，Vuex作为备用
      this.userId = userInfo.uid || userInfo.id || storeUid || 0;
      this.userAvatar = userInfo.avatar || '';
      this.userNickname = userInfo.nickname || '';
      
      // 判断用户是否完善资料 - 需要有用户ID和手机号
      const hasUserId = this.userId > 0;
      const hasPhone = !!userInfo.phone;
      this.isUser = hasUserId && hasPhone;
      
        console.log('用户信息处理完成:', {
        userId: this.userId,
        userAvatar: this.userAvatar,
        userNickname: this.userNickname,
        hasUserId: hasUserId,
        hasPhone: hasPhone,
        isUser: this.isUser
      });
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 设置默认值
        this.userId = 0;
        this.userAvatar = '';
        this.userNickname = '';
        this.isUser = false;
      }
    },
    
    
    // 获取笔记详情
    dynamicDetails() {
      // 显示加载状态
      uni.showLoading({
        title: '加载中',
        mask: true
      });
      
      this.debugLog('请求笔记详情，笔记ID:', this.noteInfo.id);
      
      getDynamicDetail(this.noteInfo.id)
        .then(res => {
          uni.hideLoading();
          this.debugLog('获取到笔记详情数据:', res);
          
          if (res.status === 200 && res.data && res.data.detail) {
            const detail = res.data.detail;
            
            // 检查笔记状态
            if ((detail.status == 2 || detail.status == 3) && this.userId != detail.uid) {
              return this.opTipsPopup("笔记审核中或已被删除，请稍后重试！", true);
            }
            
            // 处理话题信息
            if (detail.topic_id) {
              try {
                detail.topic_id = JSON.parse(detail.topic_id);
              } catch (e) {
                detail.topic_id = [];
              }
            }
            
            // 处理话题详情
            if (detail.topic_info && Array.isArray(detail.topic_info)) {
              detail.topic_info = detail.topic_info.map(topic => ({
                id: topic.id,
                title: topic.title
              }));
            } else {
              detail.topic_info = [];
            }
            
            // 处理商品信息
            if (detail.goods_info) {
              detail.goods_info = {
                id: detail.goods_info.id,
                image: detail.goods_info.image,
                store_name: detail.goods_info.store_name,
                price: detail.goods_info.price
              };
            }
            
            // 处理圈子信息
            if (detail.circle_info) {
              detail.circle_info = {
                circle_id: detail.circle_info.circle_id || 0,
                circle_name: detail.circle_info.circle_name || '',
                circle_avatar: detail.circle_info.circle_avatar || ''
              };
            }
            
            // 处理用户信息
            if (detail.user_info) {
              detail.user_info = {
                uid: detail.user_info.uid,
                nickname: detail.user_info.nickname || '用户',
                avatar: detail.user_info.avatar || '/static/img/default.png',
                is_follow: !!detail.user_info.is_follow,
                is_mutual_follow: !!detail.user_info.is_mutual_follow
              };
            } else {
              detail.user_info = {
                uid: detail.uid,
                nickname: '用户',
                avatar: '/static/img/default.png',
                is_follow: false,
                is_mutual_follow: false
              };
            }
            
            // 处理图片数据
            if (detail.images) {
              if (typeof detail.images === 'string') {
                try {
                  detail.images = JSON.parse(detail.images);
                } catch (e) {
                  detail.images = detail.images ? [detail.images] : [];
                }
              }
              // 确保images是数组
              if (!Array.isArray(detail.images)) {
                detail.images = [];
              }
            } else {
              detail.images = [];
            }
            
            // 更新笔记数据
            this.noteInfo = {
              ...this.noteInfo,
              ...detail,
              // 确保基础字段存在
              id: detail.id,
              uid: detail.uid,
              type: detail.type || 0,
              content: detail.content || '',
              location_name: detail.location_name || '',
              latitude: detail.latitude || '',
              longitude: detail.longitude || '',
              create_time: detail.create_time || '',
              update_time: detail.update_time || '',
              likes: parseInt(detail.likes) || 0,
              comments: parseInt(detail.comments) || 0,
              views: parseInt(detail.views) || 0,
              shares: parseInt(detail.shares) || 0,
              is_like: !!detail.is_like,
              status: detail.status || 0,
              is_show: detail.is_show || 0,
              visibility: detail.visibility || 0,
              is_top: detail.is_top || 0,
              video: detail.video || '',
              video_cover: detail.video_cover || '',
              audio: detail.audio || '',
              audio_cover: detail.audio_cover || '',
              audio_title: detail.audio_title || '',
              product_id: detail.product_id || 0,
              circle_id: detail.circle_id || 0
            };
            
            this.debugLog('更新后的笔记数据:', this.noteInfo);
            
            // 处理媒体数据
            this.processMediaData();
            
            // 加载评论列表
            this.getCommentList();
            
            // 处理分享
            if (this.shareView) {
              this.shareClick(true);
            }
            
            // 同步关注状态
            if (this.noteInfo.user_info) {
              this.isFollowing = !!this.noteInfo.user_info.is_follow;
              this.followChecked = true;
              this.debugLog('关注状态:', this.isFollowing);
            }
          } else {
            this.debugLog('获取笔记失败:', res.msg);
            this.opTipsPopup(res.msg || "获取笔记失败", true);
          }
        })
        .catch(err => {
          uni.hideLoading();
          this.debugLog('获取笔记失败:', err);
          this.handleError(err, "获取笔记失败，请稍后重试！");
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack();
          }, 2000);
        });
    },
    
        // 抽取媒体处理逻辑
    processMediaData() {
      try {
        this.debugLog('开始处理媒体数据，笔记类型:', this.noteInfo.type);
      
      // 根据类型处理不同的媒体数据
      switch (this.noteInfo.type) {
          case 1: // 单图
          case 2: // 多图
          this.processImageData();
          break;
          case 3: // 视频
          this.processVideoData();
          break;
          case 4: // 音频
          this.processAudioData();
          break;
        default:
            this.debugLog('未知的媒体类型:', this.noteInfo.type);
            // 尝试自动判断类型
            if (this.noteInfo.video) {
              this.noteInfo.type = 3;
              this.processVideoData();
            } else if (this.noteInfo.audio) {
              this.noteInfo.type = 4;
              this.processAudioData();
            } else if (this.noteInfo.images && this.noteInfo.images.length) {
              this.noteInfo.type = this.noteInfo.images.length > 1 ? 2 : 1;
              this.processImageData();
            }
        }
      } catch (error) {
        this.debugLog('处理媒体数据失败:', error);
      }
    },
    
    // 处理图片数据
    processImageData() {
      this.debugLog('处理图片数据');
      
      try {
        // 确保images是数组
        let images = this.noteInfo.images;
        if (!Array.isArray(images)) {
          images = [];
        }
        
        // 处理每张图片
        this.noteInfo.images = images.map(img => {
          if (typeof img === 'string') {
            return {
              url: img,
              wide: 750,
              high: 750
            };
          }
          return img;
        });
        
        this.debugLog('图片数据处理完成，数量:', this.noteInfo.images.length);
      } catch (e) {
        this.debugLog('处理图片数据失败:', e);
        this.noteInfo.images = [];
      }
    },
    
    // 处理视频数据
    processVideoData() {
      console.log('处理视频数据:', this.noteInfo.video);
      
      // 确保视频封面存在
      if (!this.noteInfo.video_cover && this.noteInfo.video && this.noteInfo.video.cover) {
        this.noteInfo.video_cover = this.noteInfo.video.cover;
      }
      
      // 确保视频URL存在
      if (!this.noteInfo.video && this.noteInfo.video_url) {
        this.noteInfo.video = this.noteInfo.video_url;
      }
    },
    
    // 处理音频数据 - 只有音频动态时才执行
    processAudioData() {
      if (!this.isAudioNote) {
        console.log('非音频动态，跳过音频数据处理');
        return;
      }
      
      console.log('处理音频数据:', this.noteInfo.audio);
      
      // 确保封面图存在
      if (!this.noteInfo.audio_cover) {
        this.noteInfo.audio_cover = '/static/img/audio_default_cover.png';
      }
      
      // 确保标题存在
      if (!this.noteInfo.audio_title) {
        this.noteInfo.audio_title = '音频';
      }
      
      // 初始化音频状态
      this.initAudioState();
    },
    
    // 初始化音频状态 - 只有音频动态时才调用
    initAudioState() {
      if (!this.isAudioNote) return;
      
      console.log('初始化音频状态');
      
      // 重置音频相关状态
      this.bgAudioStatus = false;
      this.bgAudioManager = null;
      this.audioRetryCount = 0;
      this.audioPlayingId = '';
    },
    
    // 标准化图片数组
    normalizeImageArray(originalImages) {
          // 确保图片字段是数组
          if (!originalImages) {
            console.log('图片数据为空，初始化为空数组');
        return [];
          } 
      
          // 解析JSON字符串
      if (typeof originalImages === 'string') {
            console.log('图片数据是字符串，尝试解析JSON');
            if (originalImages.startsWith('[')) {
              try {
                originalImages = JSON.parse(originalImages);
                console.log('JSON解析成功:', originalImages);
              } catch (parseErr) {
                console.error('JSON解析失败:', parseErr);
                originalImages = [originalImages];
              }
            } else {
              console.log('图片数据是单个字符串，转换为数组');
              originalImages = [originalImages];
            }
          }
          
          // 确保是数组类型并标准化每个图片对象
          if (Array.isArray(originalImages)) {
            console.log('处理图片数组，数量:', originalImages.length);
        return originalImages.map((img, index) => {
              console.log(`处理第${index+1}张图片:`, img);
              if (typeof img === 'string') {
                return { url: img, wide: 750, high: 750 };
              } else if (img && typeof img === 'object') {
                // 确保即使对象中缺少某些属性，也能正常工作
                const imgObj = {
                  url: img.url || img.path || img.src || img.image || '',
                  wide: parseInt(img.wide || img.width || 750),
                  high: parseInt(img.high || img.height || 750)
                };
                console.log(`图片${index+1}处理结果:`, imgObj);
                return imgObj;
              }
              return { url: '', wide: 750, high: 750 };
            }).filter(img => !!img.url); // 过滤掉没有URL的图片
          } else {
            console.log('图片数据不是数组，初始化为空数组');
        return [];
        }
    },
    
    // 处理通用数据
    processCommonData() {
      // 确保user_info对象存在
      if (!this.noteInfo.user_info) {
        this.noteInfo.user_info = {
          nickname: "用户",
          avatar: "/static/img/default.png"
        };
      }
      
      // 确保avatar字段存在
      if (!this.noteInfo.user_info.avatar) {
        this.noteInfo.user_info.avatar = "/static/img/default.png";
      }
      
      // 确保comments字段存在且为数字
      if (this.noteInfo.comments === undefined || this.noteInfo.comments === null) {
        this.noteInfo.comments = 0;
      } else if (typeof this.noteInfo.comments === 'string') {
        this.noteInfo.comments = parseInt(this.noteInfo.comments) || 0;
      }
      
      // 确保uid字段存在
      if (!this.noteInfo.uid && this.noteInfo.user_id) {
        this.noteInfo.uid = this.noteInfo.user_id;
      }
      
      console.log('通用数据处理完成');
    },
    
    // 获取评论列表 - 优化版本
    getCommentList() {
      // 防止重复加载
      if (this.isLoadingComments) {
        this.debugLog('正在加载评论，跳过重复请求');
        return;
      }
      
      // 如果已经加载完所有评论，不再请求
      if (this.loadStatus === "no-more" && this.page > 1) {
        this.debugLog('已无更多评论，跳过请求');
        return;
      }
      
      this.isLoadingComments = true;
      
      // 第一页加载时显示加载状态，滚动加载更多时不显示全屏加载
      if (this.page === 1) {
        uni.showLoading({
          title: '加载中',
          mask: true
        });
        } else {
        // 设置加载中状态
          this.loadStatus = "loading";
      }
      
      // 准备请求参数
      const params = {
        type: 0, // 动态评论类型
        page: this.page || 1,
        sort_type: this.cType || 0 // 0-热门，1-最新
      };
      
      this.debugLog('获取评论列表', {
        动态ID: this.noteInfo.id,
        页码: params.page,
        排序方式: params.sort_type === 0 ? '热门' : '最新'
      });
      
      // 调用评论列表API
      getCommentsList(this.noteInfo.id, params)
        .then(res => {
          if (this.page === 1) {
            uni.hideLoading();
          }
          
          this.isLoadingComments = false;
          
          if (res.status === 200) {
            this.debugLog('评论列表获取成功', res.data);
            
            const list = res.data.list || [];
            
            // 更新评论总数
            if (res.data.total !== undefined && res.data.total !== null) {
              this.noteInfo.comments = parseInt(res.data.total) || 0;
              this.debugLog('从API获取总评论数', this.noteInfo.comments);
            } else if (res.data.count !== undefined && res.data.count !== null) {
              this.noteInfo.comments = parseInt(res.data.count) || 0;
              this.debugLog('从API获取总评论数(count字段)', this.noteInfo.comments);
            }
            
            // 处理评论列表数据
            const processedList = list.map(item => {
              return {
                ...item,
                user_info: {
                  uid: item.uid || 0,
                  nickname: item.user_info?.nickname || '用户',
                  avatar: item.user_info?.avatar || '/static/img/default.png'
                },
                reply_count: parseInt(item.reply_count) || 0,
                like_count: parseInt(item.like_count) || 0,
                is_like: !!item.is_like,
                create_time: item.create_time || '',
                content: item.content || '',
                images: Array.isArray(item.images) ? item.images : [],
                replies: Array.isArray(item.replies) ? item.replies.map(reply => ({
                  ...reply,
                  user_info: {
                    uid: reply.uid || 0,
                    nickname: reply.user_info?.nickname || '用户',
                    avatar: reply.user_info?.avatar || '/static/img/default.png'
                  },
                  reply_user_info: reply.reply_user_info ? {
                    uid: reply.reply_user_info.uid || 0,
                    nickname: reply.reply_user_info.nickname || '用户'
                  } : null,
                  like_count: parseInt(reply.like_count) || 0,
                  is_like: !!reply.is_like,
                  create_time: reply.create_time || '',
                  content: reply.content || ''
                })) : []
              };
            });
            
            // 更新评论列表
            if (this.page === 1) {
              // 第一页：直接替换列表
              this.commentList = processedList;
              // 设置是否为空状态
              this.isEmpty = processedList.length === 0;
            } else {
              // 加载更多：追加到列表
              this.commentList = [...this.commentList, ...processedList];
            }
            
            // 更新分页状态
            if (list.length < 10) { // 本页不足10条，说明没有更多了
              this.loadStatus = "no-more";
            } else {
              this.loadStatus = "more";
            }
            
            // 缓存第一页数据
            if (this.page === 1) {
              const cacheKey = `comments_${this.noteInfo.id}_${this.cType}_${this.page}`;
              this.commentsCache[cacheKey] = {
                list: processedList,
                isEmpty: this.isEmpty,
                loadStatus: this.loadStatus,
                totalComments: this.noteInfo.comments
              };
            }
            
            this.debugLog('评论列表更新完成', {
              当前页码: this.page,
              评论总数: this.commentList.length,
              加载状态: this.loadStatus,
              是否为空: this.isEmpty
            });
          } else {
            this.debugLog('评论列表获取失败', res);
            this.loadStatus = "no-more";
            uni.showToast({
              title: res.msg || '获取评论失败',
              icon: 'none'
            });
          }
        })
        .catch(err => {
          if (this.page === 1) {
            uni.hideLoading();
          }

          this.isLoadingComments = false;
          this.loadStatus = "no-more";
          this.debugLog('获取评论列表异常', err);

          // 使用统一错误处理
          const errorMsg = this.handleError(err, '获取评论失败');
          uni.showToast({
            title: errorMsg,
            icon: 'none'
          });
        });
    },
    // 处理投票成功事件
    handleVoteSuccess(data) {
      // 更新本地数据
      this.noteInfo.vote_info = data.voteInfo;
    },
    // 加载评论回复（分页方式）
loadAllReplies(e) {
  let id = parseInt(e.currentTarget.dataset.id) || 0
  let idx = parseInt(e.currentTarget.dataset.idx) || 0
  
  console.log('加载评论回复:', {
    commentId: id,
    commentIndex: idx
  });
  
  // 防止重复点击
  if (this.isLoadingReplies) return
  this.isLoadingReplies = true
  
  // 显示加载中状态
  const commentItem = this.commentList[idx]
  if (commentItem) {
    this.$set(commentItem, 'loading_replies', true)
  }
  
  // 获取当前评论的回复页码
  const currentPage = parseInt(commentItem.replyPage) || 1;
  
  // 生成缓存键
  const cacheKey = `replies_${id}_${currentPage}`;
  
  // 检查缓存
  if (this.commentCache[cacheKey]) {
    console.log('使用缓存中的回复数据');
    this.handleAllRepliesData(this.commentCache[cacheKey], idx, currentPage);
    return;
  }
  
  // 请求参数
  const params = {
    parent_id: parseInt(id) || 0,
    page: currentPage,
    limit: 3, // 每次只加载少量数据
    sort_type: 1 // 按时间最新排序
  };
  
  console.log('获取回复请求参数:', params);
  
  // 发起请求
  getCommentReplies(params)
    .then(res => {
      if (res.status === 200) {
        console.log('获取到回复数据:', res.data);
        
        // 缓存结果
        this.commentCache[cacheKey] = res.data;
        
        // 处理回复数据
        this.handleAllRepliesData(res.data, idx, currentPage);
      } else {
        // 移除加载状态
        if (commentItem) {
          this.$set(commentItem, 'loading_replies', false);
        }
        this.isLoadingReplies = false;
        
        uni.showToast({
          title: res.msg || '获取回复失败',
          icon: 'none'
        });
      }
    })
    .catch(err => {
      console.error('获取回复失败:', err);
      
      // 移除加载状态
      if (commentItem) {
        this.$set(commentItem, 'loading_replies', false);
      }
      this.isLoadingReplies = false;
      
      uni.showToast({
        title: '获取回复失败',
        icon: 'none'
      });
    });
},
    
    // 加载子回复列表 - 扁平化处理
    loadChildrenReplies(e) {
      let parentId = parseInt(e.currentTarget.dataset.parentId) || 0
      let replyId = parseInt(e.currentTarget.dataset.replyId) || 0
      let idx = parseInt(e.currentTarget.dataset.idx) || 0
      let replyIndex = parseInt(e.currentTarget.dataset.replyIndex) || 0
      
      console.log('加载子回复:', {
        parentId,
        replyId,
        commentIndex: idx,
        replyIndex
      });
      
      // 防止重复点击
      if (this.isLoadingChildReplies) return
      this.isLoadingChildReplies = true
      
      // 获取当前回复的子回复页码
      const commentItem = this.commentList[idx];
      const replyItem = commentItem.replies[replyIndex];
      const currentPage = parseInt(replyItem.childrenPage) || 1;
      
      // 显示加载中状态
      this.$set(replyItem, 'loading_children', true);
      
      // 生成缓存键
      const cacheKey = `replies_${parentId}_${replyId}_${currentPage}_2`;
      
      // 检查是否有缓存
      if (this.commentCache[cacheKey]) {
        console.log('使用缓存中的子回复数据');
        this.handleChildrenRepliesData(this.commentCache[cacheKey], idx, replyIndex, currentPage);
        return;
      }
      
      // 请求参数 - 使用统一接口
      const params = {
        parent_id: parseInt(parentId) || 0,     // 父评论ID
        reply_id: parseInt(replyId) || 0,       // 回复ID
        reply_type: parseInt(2),           // 回复类型：2=子回复
        page: parseInt(currentPage) || 1,       // 页码
        limit: parseInt(10),               // 每页数量
        sort_type: parseInt(0)             // 默认热门排序
      };
      
      console.log('获取子回复请求参数:', params);
      
      // 发起请求
      getCommentReplies(params)
        .then(res => {
          // 移除加载状态
          this.$set(replyItem, 'loading_children', false);
          this.isLoadingChildReplies = false;
          
          console.log('获取子回复响应:', res);
          
          if (res.status === 200) {
            // 缓存结果
            this.commentCache[cacheKey] = res.data;
            
            // 处理子回复数据
            this.handleChildrenRepliesData(res.data, idx, replyIndex, currentPage);
          } else {
            uni.showToast({
              title: res.msg || '获取子回复失败',
              icon: 'none'
            });
          }
        })
        .catch(err => {
          // 移除加载状态
          this.$set(replyItem, 'loading_children', false);
          this.isLoadingChildReplies = false;
          
          console.error('获取子回复失败:', err)
          uni.showToast({
            title: '获取子回复失败',
            icon: 'none'
          })
        });
    },
    
          // 处理回复数据（分页方式）
    handleAllRepliesData(data, idx, page) {
      if (this.commentList[idx]) {
        const commentItem = this.commentList[idx];
        const replies = data.list || [];
        
        console.log('获取到回复数据:', replies);
        
        // 如果是第一页，直接替换现有回复列表
        if (page === 1) {
          this.$set(commentItem, 'replies', replies);
        } else {
          // 否则追加到现有列表
          // 避免重复添加已加载的回复
          const existingIds = (commentItem.replies || []).map(r => r.id);
          const newReplies = replies.filter(r => !existingIds.includes(r.id));
          
          this.$set(commentItem, 'replies', [...(commentItem.replies || []), ...newReplies]);
        }
        
        // 更新回复页码
        this.$set(commentItem, 'replyPage', page + 1);
        
        // 标记是否有更多回复
        // 如果已加载的回复数量等于或超过总回复数，设置为无更多回复
        const replyCount = parseInt(data.count || 0);
        const currentLoadedCount = commentItem.replies ? commentItem.replies.length : 0;
        
        // 判断是否已加载全部回复
        const hasNoMoreReplies = replies.length < 3 || currentLoadedCount >= replyCount;
        this.$set(commentItem, 'has_more_replies', !hasNoMoreReplies);
        
        // 更新总回复数
        if (data.count !== undefined) {
          this.$set(commentItem, 'reply_count', replyCount);
        }
        
        // 更新回复索引映射
        this.updateReplyIndices(commentItem.replies);
        
        // 移除加载状态
        this.$set(commentItem, 'loading_replies', false);
        this.isLoadingReplies = false;
      }
    },
    
    // 处理子回复数据
    handleChildrenRepliesData(data, idx, replyIndex, page) {
      if (this.commentList[idx] && this.commentList[idx].replies[replyIndex]) {
        const replyItem = this.commentList[idx].replies[replyIndex];
        
        // 获取原始子回复列表
        const childReplies = data.list || [];
        
        // 处理子回复数据，设置正确的回复关系
        childReplies.forEach(child => {
          // 设置回复目标信息，保存回复对象的昵称
          child.reply_nickname = replyItem.nickname || '用户';
          
          // 将所有子回复直接添加到一级评论的replies中，扁平化处理
          this.commentList[idx].replies.push(child);
        });
        
        // 更新回复索引映射
        this.updateReplyIndices(this.commentList[idx].replies);
        
        // 更新子回复已加载标记
        this.$set(replyItem, 'has_more_children', false);
        
        // 移除加载状态
        this.$set(replyItem, 'loading_children', false);
        this.isLoadingChildReplies = false;
      }
    },
    
    // 递归更新回复索引映射
    updateReplyIndices(replies) {
      if (!replies || !replies.length) return;
      
      replies.forEach((reply, index) => {
        this.replyIndices.set(reply.id, index);
        
        // 递归处理子回复
        if (reply.children && reply.children.length) {
          this.updateReplyIndices(reply.children);
        }
      });
    },
    
    // 获取子评论（分页加载，已被loadAllReplies替代，保留作为备用）
    sonComment(e) {
      let id = e.currentTarget.dataset.id
      let idx = e.currentTarget.dataset.idx
      
      console.log('获取子评论:', {
        commentId: id,
        commentIndex: idx,
        currentPage: this.sonPage
      });
      
      // 防止重复点击
      if (this.isLoadingReplies) return
      this.isLoadingReplies = true
      
      // 显示加载中状态
      const commentItem = this.commentList[idx]
      if (commentItem) {
        this.$set(commentItem, 'loading_replies', true)
      }
      
      // 更新子评论加载页码
      this.sonPage = this.sonPage + 1
      
      // 生成缓存键
      const cacheKey = `reply_${id}_${this.sonPage}`;
      
      // 检查是否有缓存
      if (this.commentCache[cacheKey]) {
        console.log('使用缓存中的回复数据');
        this.handleReplyData(this.commentCache[cacheKey], idx);
        return;
      }
      
      // 请求参数 - 与CommentController.php中的getReplies方法参数匹配
      const params = {
        parent_id: id,           // 父评论ID
        page: this.sonPage,      // 页码
        limit: 10,               // 每页数量
        sort_type: 1             // 排序类型：1=最新(创建时间)
      };
      
      console.log('回复请求参数:', params);
      
      // 发起请求
      getCommentReplies(params)
        .then(res => {
          // 移除加载状态
          if (commentItem) {
            this.$set(commentItem, 'loading_replies', false)
          }
          this.isLoadingReplies = false
          
          console.log('获取回复响应:', res);
          
          if (res.status === 200) {
            // 缓存结果
            this.commentCache[cacheKey] = res.data;
            
            // 处理回复数据
            this.handleReplyData(res.data, idx);
          } else {
            uni.showToast({
              title: res.msg || '获取回复失败',
              icon: 'none'
            });
          }
        })
        .catch(err => {
          // 移除加载状态
          if (commentItem) {
            this.$set(commentItem, 'loading_replies', false)
          }
          this.isLoadingReplies = false
          
          console.error('获取回复失败:', err)
          uni.showToast({
            title: '获取回复失败',
            icon: 'none'
          })
        })
    },
    
    // 处理回复数据
    handleReplyData(data, idx) {
      const list = data.list || [];
      
      if (this.commentList[idx]) {
        // 确保replies数组存在
        if (!this.commentList[idx].replies) {
          this.commentList[idx].replies = [];
        }
        
        // 记录之前的回复数量
        const previousReplyCount = this.commentList[idx].replies.length;
        
        // 追加到现有列表
        this.commentList[idx].replies = [...this.commentList[idx].replies, ...list];
        
        // 更新回复索引映射
        list.forEach((reply, i) => {
          this.replyIndices.set(reply.id, previousReplyCount + i);
        });
        
        // 更新子评论数量
        if (data.count !== undefined && data.count !== null) {
          this.commentList[idx].reply_count = parseInt(data.count) || 0;
        } else {
          this.commentList[idx].reply_count = this.commentList[idx].replies.length;
        }
        
        // 判断是否已加载全部回复
        if (list.length < 10 || this.commentList[idx].replies.length >= this.commentList[idx].reply_count) {
          this.$set(this.commentList[idx], 'all_replies_loaded', true);
        }
      }
    },
    
    // 切换评论排序
    commentClick(type) {
      if (!this.isThrottling || this.commentInProgress) return
      
      // 如果切换到相同类型，不重复加载
      if (this.cType === type) return
      
      this.isThrottling = false
      this.cType = type
      this.page = 1
      this.loadStatus = "loading"
      
      // 重置评论列表
      this.commentList = []
      this.isEmpty = false
      
      this.getCommentList()
      
      // 设置延时，允许在一段时间后再次切换
      setTimeout(() => {
        this.isThrottling = true
      }, 500)
    },
    
    // 打开评论框
    openComment(e) {
      // 如果没有事件对象，创建一个空对象模拟
      e = e || { currentTarget: { dataset: { type: 0 } } };
      
      // 阻止事件冒泡
      e.stopPropagation && e.stopPropagation();
      
      console.log('尝试打开评论框，用户状态:', {
        isUser: this.isUser,
        userId: this.userId,
        userInfo: {
          avatar: this.userAvatar,
          nickname: this.userNickname
        }
      });
      
      if (!this.isUser) {
        console.log('用户未完善资料，无法评论');
        this.opTipsPopup("完善账号资料后即可评论！")
        setTimeout(() => {
          uni.navigateTo({
            url: "/pages/center/means"
          })
        }, 1000)
        return
      }
      
      let dataset = e.currentTarget.dataset || {};
      let type = dataset.type || 0;
      let uid = dataset.uid || 0;
      let cid = dataset.cid || 0;
      let name = dataset.name || "";
      
      this.cIdx = dataset.idx !== undefined ? dataset.idx : -1;
      this.cI = dataset.i !== undefined ? dataset.i : -1;
      
      // 强制关闭再打开，解决偶尔无法弹出的问题
      this.isComment = false;
      
      // 重置状态变量
      this.isSubmittingComment = false;
      
      // 设置评论目标信息
      if (type == 1) {
        this.cCId = cid;
        this.cUId = uid;
        this.comtips = "回复：" + name;
      } else {
        this.cCId = 0;
        this.cUId = 0;
        this.comtips = "说点什么...";
      }
      
      // 使用nextTick确保DOM已更新
      this.$nextTick(() => {
        // 先显示评论框，再延迟聚焦
        this.isComment = true;
        
        // 延迟聚焦，确保键盘能弹出
        setTimeout(() => {
          this.isFocus = true;
          
          // 再次确认评论框已显示
          if (!this.isComment) {
            this.isComment = true;
          }
        }, 150);
      });
    },
    

    
    // 删除评论
    delComment(e) {
      let self = this
      let idx = e.currentTarget.dataset.idx
      let i = e.currentTarget.dataset.i
      let commentId = e.currentTarget.dataset.id
      
      // 防止重复点击
      if (self.isDeletingComment) return
      
      uni.showModal({
        content: "确定要永久删除该评论吗？",
        confirmColor: "#FA5150",
        success: function(res) {
          if (res.confirm) {
            self.isDeletingComment = true
            
            uni.showLoading({
              title: '删除中',
              mask: true
            })
            
            // 使用新的删除评论API接口
            deleteComment(commentId).then(res => {
              uni.hideLoading()
              self.isDeletingComment = false
              
              if (res.status === 200) {
                // 减少评论总数
                if (self.noteInfo.comments > 0) {
                  self.noteInfo.comments--
                }
              
              // 更新评论状态
              if (i == -1) {
                  // 主评论被删除
                self.commentList[idx].delete_time = new Date().toISOString() // 设置删除时间
                self.commentList[idx].status = 0 // 设置删除状态
              } else {
                  // 确保replies数组存在
                  if (self.commentList[idx].replies && self.commentList[idx].replies.length > i) {
                    self.commentList[idx].replies[i].delete_time = new Date().toISOString() // 设置删除时间
                    self.commentList[idx].replies[i].status = 0 // 设置删除状态
                    
                    // 子评论被删除，也要减少对应的计数
                    if (self.commentList[idx].reply_count > 0) {
                      // 减少回复计数
                      self.commentList[idx].reply_count--
                    }
                  }
                }
                self.opTipsPopup("删除成功")
              } else {
                self.opTipsPopup(res.msg || "删除失败")
              }
            }).catch(err => {
              uni.hideLoading()
              self.isDeletingComment = false
              self.handleError(err, "删除失败")
            })
          }
        }
      })
    },
    
    // 点赞/取消点赞评论
    toggleCommentLike(commentId, isCurrentlyLiked) {
      if (!this.isUser) {
        this.opTipsPopup("请先完善账号资料")
        return
      }
      
      // 防止频繁点击
      if (this.likeThrottling) return
      this.likeThrottling = true
      
      // 500ms后恢复
      setTimeout(() => {
        this.likeThrottling = false
      }, 500)
      
      // 将布尔值转换为0/1格式
      const currentLikeState = isCurrentlyLiked ? 1 : 0;
      const newLikeState = currentLikeState ? 0 : 1;
      
      // 优先更新UI状态，让用户感觉响应迅速
      // 遍历更新评论列表中的点赞状态
      for (let i = 0; i < this.commentList.length; i++) {
        const comment = this.commentList[i]
        
        // 更新主评论
        if (comment.id === commentId) {
          comment.is_like = newLikeState
          if (newLikeState) {
            comment.likes = (comment.likes || 0) + 1
          } else if (comment.likes > 0) {
            comment.likes--
          }
          break // 找到了主评论，可以跳出循环
        }
        
        // 更新回复评论
        if (comment.replies && comment.replies.length > 0) {
          for (let j = 0; j < comment.replies.length; j++) {
            const reply = comment.replies[j]
            if (reply.id === commentId) {
              reply.is_like = newLikeState
              if (newLikeState) {
                reply.likes = (reply.likes || 0) + 1
              } else if (reply.likes > 0) {
                reply.likes--
              }
              break // 找到了回复，可以跳出内部循环
            }
          }
        }
      }
      
      // 后台执行API调用
      if (currentLikeState) {
        // 如果当前已点赞，则取消点赞
        unlikeComment(commentId)
          .then(res => {
            // 点赞成功，不需要操作
          })
          .catch(err => {
            // 恢复状态
            this.restoreCommentLikeStatus(commentId, currentLikeState)
            this.handleError(err, "操作失败，请重试")
          })
      } else {
        // 如果当前未点赞，则点赞
        likeComment(commentId)
          .then(res => {
            // 点赞成功，不需要操作
          })
          .catch(err => {
            // 恢复状态
            this.restoreCommentLikeStatus(commentId, currentLikeState)
            this.handleError(err, "操作失败，请重试")
          })
      }
    },
    
    // 恢复评论点赞状态（操作失败时）
    restoreCommentLikeStatus(commentId, originalLikeState) {
      // 操作失败时恢复状态
      for (let i = 0; i < this.commentList.length; i++) {
        const comment = this.commentList[i]
        
        // 还原主评论
        if (comment.id === commentId) {
          comment.is_like = originalLikeState
          if (originalLikeState === 1) {
            if (comment.likes > 0) comment.likes--
          } else {
            comment.likes++
          }
          break // 找到后跳出循环
        }
        
        // 还原回复评论
        if (comment.replies && comment.replies.length > 0) {
          for (let j = 0; j < comment.replies.length; j++) {
            const reply = comment.replies[j]
            if (reply.id === commentId) {
              reply.is_like = originalLikeState
              if (originalLikeState === 1) {
                if (reply.likes > 0) reply.likes--
              } else {
                reply.likes++
              }
              break // 找到后跳出循环
            }
          }
        }
      }
    },
    
    // 删除笔记
    delDynamic() {
      let self = this
      
      uni.showModal({
        content: "确认要永久删除这篇笔记吗？",
        confirmColor: "#FA5150",
        success: function(res) {
          if (res.confirm) {
            uni.showLoading({
              mask: true
            })
            
            // 使用导入的API方法
            deleteDynamic(self.noteInfo.id).then(res => {
              uni.hideLoading()
              getApp().globalData.isCenterPage = true
              
              if (res.status === 200) {
                self.opTipsPopup("删除成功", true)
              } else {
                self.opTipsPopup(res.msg || "删除失败")
              }
            }).catch(err => {
              uni.hideLoading()
              self.handleError(err, "删除失败")
            })
          }
        }
      })
    },
    
    // 举报笔记
    reasonClick(reason) {
      let self = this
      
      uni.showLoading({
        mask: true
      })
      
      // 获取合适的图片URL
      let imageUrl = ''
      if (self.noteInfo.type == 2 && self.noteInfo.images && self.noteInfo.images.length > 0) {
        imageUrl = self.noteInfo.images[0].url
      } else if (self.noteInfo.type == 3 && self.noteInfo.video && self.noteInfo.video_cover) {
        imageUrl = self.noteInfo.video_cover
      } else if (self.noteInfo.type == 4 && self.noteInfo.audio && self.noteInfo.audio.cover) {
        imageUrl = self.noteInfo.audio.cover
      }
      
      // 使用新的API调用方式
      reportDynamic(
        reason,
        self.noteInfo.id,
        self.noteInfo.uid,
        self.noteInfo.content,
        imageUrl
      ).then(res => {
        uni.hideLoading()
        self.opTipsPopup(res.msg || "举报成功")
        self.menuPopupClick(false)
      }).catch(err => {
        uni.hideLoading()
        self.handleError(err, '举报失败')
      })
    },
    
    // 点赞笔记
    likeDynamic() {
      if (this.likeInProgress) return;
      this.likeInProgress = true;

      // 更新点赞状态 - 使用0和1替代布尔值，与后端一致
      const currentLikeState = this.noteInfo.is_like ? 1 : 0;
      const newLikeState = currentLikeState ? 0 : 1;
      const oldLikes = this.noteInfo.likes;

      // 立即更新UI - 保存为0或1
      this.noteInfo.is_like = newLikeState;
      this.noteInfo.likes = newLikeState ? oldLikes + 1 : oldLikes - 1;

      // API调用
      likeDynamic({
        id: this.noteInfo.id,
        is_like: newLikeState // 直接使用0或1
      })
      .then(res => {
        // 成功，无需处理
      })
      .catch(err => {
        // 失败，恢复状态
        this.noteInfo.is_like = currentLikeState;
        this.noteInfo.likes = oldLikes;
        this.handleError(err, '操作失败，请重试');
      })
      .finally(() => {
        // 设置短时间防抖
        setTimeout(() => {
          this.likeInProgress = false;
        }, 500);
      });
    },
    
    // 关注/取消关注用户
    followUser() {
      if (!this.noteInfo.uid || this.followInProgress) return;

      this.followInProgress = true;

      // 立即更新UI状态
      const newFollowState = !this.isFollowing;
      const oldFollowState = this.isFollowing;

      this.isFollowing = newFollowState;

      // 同步更新用户信息
      if (this.noteInfo.user_info) {
        this.noteInfo.user_info.is_follow = newFollowState;
      }

      // API调用
      followUser({
        follow_uid: this.noteInfo.uid,
        is_follow: newFollowState ? 1 : 0
      })
      .then(res => {
        // 成功无需处理
      })
      .catch(err => {
        // 失败恢复状态
        this.isFollowing = oldFollowState;
        if (this.noteInfo.user_info) {
          this.noteInfo.user_info.is_follow = oldFollowState;
        }
        this.handleError(err, "操作失败，请重试");
      })
      .finally(() => {
        // 设置短时间防抖
        setTimeout(() => {
          this.followInProgress = false;
        }, 500);
      });
    },
    
    // 点击图片预览
    swiperClick(e) {
      // 确保是图片类型 (兼容两种图片类型)
      if (this.noteInfo.type !== 2 && this.noteInfo.type !== 1) return
      
      let i = e.currentTarget.dataset.i
      let urls = []
      
      // 根据类型确定使用的图片数组
      const imageArray = this.noteInfo.type === 1 ? this.noteInfo.imgs : this.noteInfo.images
      
      // 处理不同格式的图片数组
      if (imageArray && imageArray.length > 0) {
        if (typeof imageArray[0] === 'string') {
          // 如果是字符串数组，直接使用
          urls = imageArray
        } else {
          // 如果是对象数组，提取url字段
          for (let item of imageArray) {
            const imageUrl = this.getImageSrc(item);
            if (imageUrl) {
              urls.push(imageUrl)
            }
          }
        }
      }
      
      // 确保有可预览的图片URL
      if (urls.length === 0) {
        console.error('没有可预览的图片URL');
        return;
      }
      
      // 调用预览API
      uni.previewImage({
        current: urls[i] || urls[0],
        urls: urls
      })
    },
    
    // 关闭评论框
    closeComment(e) {
      // 阻止事件冒泡
      e && e.stopPropagation && e.stopPropagation();
      
      console.log('手动关闭评论框');
      
      // 如果正在提交评论，不关闭
      if (this.isSubmittingComment) {
        return;
      }
      
      // 清除blur定时器
      if (this.commentBlurTimer) {
        clearTimeout(this.commentBlurTimer);
        this.commentBlurTimer = null;
      }
      
      // 设置为非评论操作状态
      this.commentActioning = false;
      
      // 关闭评论框和焦点
      this.isComment = false;
      this.isFocus = false;
      
      // 清空输入内容
      this.comtext = "";
    },
    
    // 轮播图切换
    swiperChange(e) {
      // 立即更新索引，确保指示器更新
      setTimeout(() => {
      this.swiperIdx = e.detail.current
        // 强制视图更新
        this.$forceUpdate()
      }, 0)
    },
    
    // 打开位置
    openLocationClick() {
      uni.openLocation({
        latitude: parseFloat(this.noteInfo.latitude),
        longitude: parseFloat(this.noteInfo.longitude),
        name: this.noteInfo.location_name
      })
    },
    
    // 更多弹窗功能已移至分享组件
    
    // 分享
    shareClick(show) {
      this.isShareVisible = show;
    },
    
    // 关闭分享面板
    closeShare() {
      this.isShareVisible = false;
    },
    
    // 处理编辑笔记
    handleEdit(noteId) {
      uni.navigateTo({
        url: `/pages/note/add?id=${noteId}`
      });
    },
    
    // 处理删除笔记
    handleDelete(noteId) {
      this.delDynamic();
    },
    
    // 处理举报笔记
    handleReport(reportData) {
      this.reasonClick(reportData.reason);
    },
    
    // 处理不感兴趣
    handleDislike(noteId) {
      console.log('标记不感兴趣:', noteId);
      // 这里可以添加具体的不感兴趣处理逻辑
    },
    
        // 页面跳转
    navigateToFun(e) {
      uni.navigateTo({
        url: "/pages/" + e.currentTarget.dataset.url
      })
    },
    
    // 初始化表情映射缓存
    initEmojiMap() {
      if (this.emojiMap.size > 0) return; // 避免重复初始化
      
      try {
        // 将表情数组转换为Map，提高查找性能
        sinaEmoji.forEach(emoji => {
          if (emoji && emoji.phrase) {
            this.emojiMap.set(emoji.phrase, emoji);
          }
        });
        console.log('表情映射缓存初始化完成，共', this.emojiMap.size, '个表情');
      } catch (error) {
        console.error('初始化表情映射失败:', error);
      }
    },

    // 优化后的表情内容解析
    parseEmojiContent(text) {
      if (!text || typeof text !== 'string') return [];
      
      // 检查缓存
      const cacheKey = text;
      if (this.parsedContentCache.has(cacheKey)) {
        return this.parsedContentCache.get(cacheKey);
      }
      
      const nodes = [];
      let lastIndex = 0;
      
      // 优化后的正则表达式，更精确匹配表情格式
      const regex = /\[([^\[\]]{1,10})\]/g;
      let match;
      
      try {
      while ((match = regex.exec(text)) !== null) {
        // 添加表情前的文本
        if (match.index > lastIndex) {
            const textContent = text.substring(lastIndex, match.index);
            if (textContent) {
          nodes.push({
            type: 'text',
                text: textContent
          });
            }
        }
        
          // 使用Map快速查找表情
          const emojiPhrase = match[0];
          const emoji = this.emojiMap.get(emojiPhrase);
        
                      if (emoji && emoji.url) {
              // 添加表情图片，强制固定尺寸
          nodes.push({
            type: 'image',
            attrs: {
              src: emoji.url,
                  class: 'emoji-img',
                  style: 'width: 32rpx !important; height: 32rpx !important; max-width: 32rpx !important; max-height: 32rpx !important; min-width: 32rpx !important; min-height: 32rpx !important; vertical-align: middle; margin: 0 4rpx; display: inline-block; border-radius: 4rpx; object-fit: cover;',
                  'data-emoji': emojiPhrase,
                  'data-url': emoji.url
            }
          });
        } else {
            // 如果没找到对应表情，保留原文本
          nodes.push({
            type: 'text',
              text: emojiPhrase
          });
        }
        
        lastIndex = regex.lastIndex;
      }
      
      // 添加剩余的文本
      if (lastIndex < text.length) {
          const remainingText = text.substring(lastIndex);
          if (remainingText) {
        nodes.push({
          type: 'text',
              text: remainingText
            });
          }
        }
        
        // 缓存解析结果，控制缓存大小
        this.cacheEmojiParseResult(cacheKey, nodes);
      
      return nodes;
      } catch (error) {
        console.error('解析表情内容出错:', error);
        // 出错时返回纯文本
        return [{
          type: 'text',
          text: text
        }];
      }
    },
    
    // 缓存表情解析结果
    cacheEmojiParseResult(cacheKey, nodes) {
      if (this.parsedContentCache.size >= this.maxCacheSize) {
        // 删除最旧的缓存项
        const firstKey = this.parsedContentCache.keys().next().value;
        this.parsedContentCache.delete(firstKey);
      }
      this.parsedContentCache.set(cacheKey, nodes);
    },

    // 优化后的表情内容解析（用于rich-text组件）
    parseEmojiContentForRichText(text) {
      if (!text || typeof text !== 'string') return text;
      
      // 检查缓存
      const cacheKey = `richtext_${text}`;
      if (this.parsedContentCache.has(cacheKey)) {
        return this.parsedContentCache.get(cacheKey);
      }
      
      try {
                 // 直接替换文本中的表情标记为HTML图片标签
         let processedText = text.replace(/\[([^\[\]]{1,10})\]/g, (match) => {
           const emoji = this.emojiMap.get(match);
           if (emoji && emoji.url) {
             return `<img src="${emoji.url}" class="emoji-img-inline" style="width: 32rpx !important; height: 32rpx !important; max-width: 32rpx !important; max-height: 32rpx !important; min-width: 32rpx !important; min-height: 32rpx !important; vertical-align: middle; margin: 0 4rpx; display: inline-block; border-radius: 4rpx; object-fit: cover;" data-emoji="${match}" />`;
           }
           return match;
         });
        
        // 缓存结果
        if (this.parsedContentCache.size >= this.maxCacheSize) {
          const firstKey = this.parsedContentCache.keys().next().value;
          this.parsedContentCache.delete(firstKey);
        }
        this.parsedContentCache.set(cacheKey, processedText);
        
        return processedText;
      } catch (error) {
        console.error('解析表情内容出错:', error);
        return text;
      }
    },

    // 表情点击预览（可选功能）
    onEmojiClick(event) {
      // 防抖处理
      if (this.emojiClickTimer) {
        clearTimeout(this.emojiClickTimer);
      }
      
      this.emojiClickTimer = setTimeout(() => {
        const target = event.target || event.currentTarget;
        const emojiPhrase = target.getAttribute('data-emoji');
        const emojiUrl = target.getAttribute('data-url');
        
        if (emojiPhrase && emojiUrl) {
          // 显示表情预览或复制功能
          this.showEmojiPreview(emojiPhrase, emojiUrl);
        }
      }, 300);
    },

    // 显示表情预览
    showEmojiPreview(phrase, url) {
      this.previewEmojiData = {
        phrase,
        url,
        timestamp: Date.now()
      };
      
      // 可以实现长按复制表情等功能
      uni.showActionSheet({
        itemList: ['复制表情', '查看大图'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 复制表情文字
            uni.setClipboardData({
              data: phrase,
              success: () => {
                uni.showToast({
                  title: '表情已复制',
                  icon: 'success'
                });
              }
            });
          } else if (res.tapIndex === 1) {
            // 预览表情大图
            uni.previewImage({
              urls: [url],
              current: url
            });
          }
        }
      });
    },

    // 清理表情缓存
    clearEmojiCache() {
      this.parsedContentCache.clear();
      console.log('表情缓存已清理');
    },

    // 获取表情缓存统计
    getEmojiCacheStats() {
      return {
        emojiMapSize: this.emojiMap.size,
        parsedContentCacheSize: this.parsedContentCache.size,
        maxCacheSize: this.maxCacheSize
      };
    },

    // 强制应用表情样式（运行时修复）
    forceApplyEmojiStyles() {
      this.$nextTick(() => {
        try {
          // 获取所有表情图片元素
          const emojiImages = uni.createSelectorQuery().in(this)
            .selectAll('image[data-emoji], img[data-emoji]')
            .exec((res) => {
              if (res && res[0]) {
                res[0].forEach((node, index) => {
                  // 通过选择器强制设置样式
                  uni.createSelectorQuery().in(this)
                    .select(`image[data-emoji]:nth-child(${index + 1}), img[data-emoji]:nth-child(${index + 1})`)
                    .fields({
                      node: true,
                      size: true
                    })
                    .exec((nodeRes) => {
                      if (nodeRes && nodeRes[0] && nodeRes[0].node) {
                        const node = nodeRes[0].node;
                        // 强制设置样式
                        node.style.width = '32rpx';
                        node.style.height = '32rpx';
                        node.style.maxWidth = '32rpx';
                        node.style.maxHeight = '32rpx';
                        node.style.minWidth = '32rpx';
                        node.style.minHeight = '32rpx';
                        node.style.objectFit = 'cover';
                      }
                    });
                });
              }
            });
        } catch (error) {
          console.warn('强制应用表情样式失败:', error);
        }
      });
    },

    // 聚焦评论框
    focusClick(e) {
      console.log("评论框获得焦点", e.detail);
      
      // 记录键盘高度
      if (e.detail && e.detail.height !== undefined) {
        this.keyboardHeight = e.detail.height;
      }
    },
    
    // 返回上一页
    navBack() {
      if (getCurrentPages().length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({
          url: "/pages/index/index"
        })
      }
    },
    
    // 处理音频URL
    formatAudioUrl(url) {
      if (!url) return '';
      
      // 如果URL不是以http开头，尝试添加协议
      if (!url.startsWith('http')) {
        // 如果以//开头，添加https:
        if (url.startsWith('//')) {
          return 'https:' + url;
        }
        // 如果以/开头，可能是相对路径，尝试添加完整域名
        if (url.startsWith('/')) {
          return 'https://yourdomain.com' + url; // 替换为实际的域名
        }
        // 其他情况，假设是相对路径
        return 'https://yourdomain.com/' + url; // 替换为实际的域名
      }
      
      return url;
    },
    
    // 音频播放 - 只有音频动态时才执行
    audioBgClick() {
      // 确保是音频类型
      if (!this.isAudioNote) {
        console.log('非音频动态，不执行音频播放逻辑');
        return;
      }
      
      try {
        // 处理音频播放状态
        if (this.bgAudioStatus) {
          // 当前正在播放，需要暂停
          this.pauseAudio();
        } else {
          // 当前已暂停，需要播放
          this.playAudio();
        }
      } catch (e) {
        console.error('音频控制异常:', e);
        this.handleAudioError();
      }
    },
    
    // 暂停音频
    pauseAudio() {
      if (!this.isAudioNote || !this.bgAudioManager) return;
      
      try {
            this.bgAudioManager.pause();
            this.bgAudioStatus = false;
            console.log('音频已暂停');
      } catch (e) {
        console.error('暂停音频失败:', e);
        this.handleAudioError();
          }
    },
    
    // 播放音频 - 只有音频动态时才执行
    playAudio() {
      // 确保是音频类型才执行播放逻辑
      if (!this.isAudioNote) {
        console.log('非音频动态，不执行音频播放逻辑');
        return;
      }
      
          // 检查音频URL是否存在
          if (!this.noteInfo.audio) {
            return this.opTipsPopup("音频资源不可用");
          }
          
      // 如果已有实例，尝试继续播放
      if (this.bgAudioManager) {
            try {
              console.log('继续播放现有音频');
              this.bgAudioManager.play();
              this.bgAudioStatus = true;
          return;
            } catch (e) {
              console.error('播放现有音频失败，重新创建:', e);
              // 播放失败则重新创建
          this.createAudioInstance();
        }
      } else {
        // 创建新的音频实例
        this.createAudioInstance();
      }
    },
    
    // 创建音频实例 - 只有音频动态时才执行
    createAudioInstance() {
      if (!this.isAudioNote) return;
      
      try {
        // 显示加载中提示
        uni.showToast({
          title: '加载音频中...',
          icon: 'loading',
          mask: true
        });
        
        // 根据平台使用不同的音频播放方式
        // #ifdef APP-PLUS || MP
        // 获取全局唯一的背景音频管理器（仅小程序和APP支持）
        this.bgAudioManager = uni.getBackgroundAudioManager();
        
        // 设置音频属性（这些属性是backgroundAudioManager必须设置的）
        this.bgAudioManager.title = this.noteInfo.audio_title || '音频';
        this.bgAudioManager.singer = this.noteInfo.user_info.nickname || '未知作者';
        this.bgAudioManager.coverImgUrl = this.noteInfo.audio_cover || '/static/img/audio_default_cover.png';
        
        // 可选属性
        this.bgAudioManager.epname = '笔记音频';
        // #endif
        
        // #ifdef H5
        // H5平台使用普通音频上下文
        this.bgAudioManager = uni.createInnerAudioContext();
        this.bgAudioManager.autoplay = true;
        // #endif
        
        // 记录当前播放的音频ID，用于对比检查
        this.audioPlayingId = this.noteInfo.id + '_' + Date.now();
        const currentAudioId = this.audioPlayingId;
        
        // 设置事件监听
        this.setupAudioListeners(currentAudioId);
        
        // 设置音频源必须放在最后，因为设置src后会自动开始播放
        const audioUrl = this.formatAudioUrl(this.noteInfo.audio);
        this.bgAudioManager.src = audioUrl;
        
      } catch (e) {
        console.error('创建音频实例异常:', e);
        this.handleAudioError();
      }
    },
    
    // 设置音频事件监听 - 只有音频动态时才执行
    setupAudioListeners(currentAudioId) {
      if (!this.isAudioNote || !this.bgAudioManager) return;
      
      try {
        this.bgAudioManager.onPlay(() => {
          // 检查是否仍是当前音频
          if (this.audioPlayingId !== currentAudioId) return;
          
          uni.hideToast();
          this.bgAudioStatus = true;
          console.log('音频开始播放');
        });
        
        this.bgAudioManager.onError((err) => {
          // 检查是否仍是当前音频
          if (this.audioPlayingId !== currentAudioId) return;
          
          console.error('音频播放错误:', err);
          this.handleAudioError(err);
        });
        
        this.bgAudioManager.onEnded(() => {
          if (this.audioPlayingId !== currentAudioId) return;
          console.log('音频播放结束');
          this.bgAudioStatus = false;
        });
        
        this.bgAudioManager.onStop(() => {
          if (this.audioPlayingId !== currentAudioId) return;
          console.log('音频播放停止');
          this.bgAudioStatus = false;
        });
        
        this.bgAudioManager.onPause(() => {
          if (this.audioPlayingId !== currentAudioId) return;
          console.log('音频播放暂停');
          this.bgAudioStatus = false;
        });
        
        this.bgAudioManager.onWaiting(() => {
          if (this.audioPlayingId !== currentAudioId) return;
          console.log('音频加载中');
        });
        
        this.bgAudioManager.onCanplay(() => {
          if (this.audioPlayingId !== currentAudioId) return;
          console.log('音频可以播放');
          uni.hideToast();
        });
        
      } catch (e) {
        console.error('设置音频监听器失败:', e);
        this.handleAudioError();
      }
    },
    
    // 处理音频错误
    handleAudioError(err = null) {
      if (!this.isAudioNote) return;
      
          uni.hideToast();
          this.bgAudioStatus = false;
      
      // 根据错误码显示不同提示
      let errorMsg = "音频播放失败，请稍后重试";
      if (err && err.errCode) {
        switch(err.errCode) {
          case 10001: errorMsg = "系统错误，请重启应用"; break;
          case 10002: errorMsg = "网络错误，请检查网络连接"; break;
          case 10003: errorMsg = "音频文件错误，请更换音频"; break;
          case 10004: errorMsg = "音频格式不支持"; break;
          default: errorMsg = "音频播放失败，错误码: " + err.errCode;
        }
      }
      this.opTipsPopup(errorMsg);
      
      // 重置音频相关状态
      this.bgAudioManager = null;
      this.audioPlayingId = '';
    },
    
    // 检查音频状态 - 只有音频动态时才执行
    checkAudioStatus() {
      if (!this.isAudioNote || !this.bgAudioManager) return;
      
      try {
        // 检查音频管理器状态并同步到页面状态
        // 这里可以添加具体的状态检查逻辑
        console.log('检查音频状态');
      } catch (e) {
        console.error('检查音频状态失败:', e);
        }
    },
    
    // 销毁音频实例 - 只有音频动态时才执行
    destroyAudioInstance() {
      if (!this.isAudioNote) {
        console.log('非音频动态，不执行音频销毁逻辑');
        return;
      }
      
      console.log('销毁音频实例');
      
      if (this.bgAudioManager) {
        try {
          // 停止音频播放
          if (this.bgAudioStatus) {
            this.bgAudioManager.stop();
          }
          
          // #ifdef H5
          // H5平台需要销毁音频实例
          if (typeof this.bgAudioManager.destroy === 'function') {
            this.bgAudioManager.destroy();
          }
          // #endif
          
          // #ifdef MP-WEIXIN
          // 微信小程序需要先取消监听事件再销毁
          try {
            if (this.bgAudioManager.offPlay) {
              this.bgAudioManager.offPlay();
              this.bgAudioManager.offPause();
              this.bgAudioManager.offStop();
              this.bgAudioManager.offEnded();
              this.bgAudioManager.offTimeUpdate();
              this.bgAudioManager.offWaiting();
              this.bgAudioManager.offCanplay();
              this.bgAudioManager.offError();
            }
          } catch (e) {
            console.error('微信小程序取消音频事件监听失败:', e);
          }
          // #endif
          
          // 将引用置为null
          this.bgAudioManager = null;
          this.bgAudioStatus = false;
          this.audioPlayingId = '';
          
          console.log('音频实例销毁完成');
        } catch (e) {
          console.error('处理音频实例销毁过程中出错:', e);
          this.bgAudioManager = null;
          this.bgAudioStatus = false;
          this.audioPlayingId = '';
        }
      }
    },
    
    // 输入框失焦处理
    textareaBlur(e) {
      // 标记当前坐标，用于判断是否点击了发送按钮
      this.lastTouchX = e && e.detail && e.detail.x;
      this.lastTouchY = e && e.detail && e.detail.y;
      
      // 延时关闭时间延长，确保有足够时间点击发送按钮
      setTimeout(() => {
        // 如果此时没有点击发送按钮，则关闭评论框
        if (this.isComment && !this.isSubmittingComment) {
          this.isComment = false;
          this.isFocus = false;
        }
      }, 500); // 延长到500ms，给用户更多时间点击发送按钮
    },
    openFooterComment() {
      if (!this.isUser) {
        this.opTipsPopup("完善账号资料后即可评论！")
        setTimeout(() => {
          uni.navigateTo({
            url: "/pages/center/means"
          })
        }, 1000)
        return
      }
      
      // 清除回复目标信息
      this.cCId = 0
      this.cUId = 0
      this.cIdx = -1
      this.cI = -1
      this.comtips = "说点什么..."
      
      // 重置状态变量
      this.isSubmittingComment = false
      
      // 直接显示评论框，不设置焦点
      this.isComment = true
      console.log("底部评论框已显示")
      
      // 不再主动设置焦点，避免微信小程序的focus问题
      // 用户可以点击输入框手动获取焦点
    },
    // 统一处理评论点击
    handleCommentClick(event, type = 0, uid = 0, cid = 0, name = "", idx = -1, i = -1) {
      console.log('点击评论/回复', {type, uid, cid, name, idx, i});
      
      // 阻止事件冒泡
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
      
      // 检查登录状态
      if (!this.isUser) {
        console.log('用户未完善资料，检查原因:', {
          userId: this.userId,
          hasToken: !!this.$store.state.app.token,
          hasPhone: this.$store.state.app.userInfo ? !!this.$store.state.app.userInfo.phone : false
        });
        
        this.opTipsPopup("完善账号资料后即可评论！");
        setTimeout(() => {
          uni.navigateTo({
            url: "/pages/center/means"
          });
        }, 1000);
        return;
      }
      
      // 防止重复点击
      if (this.isOpeningComment) return;
      this.isOpeningComment = true;
      
      // 设置数据
      this.cIdx = idx;
      this.cI = i;
      this.cCId = cid;
      this.cUId = uid;
      
      // 设置文字提示
      if (type === 1 && name) {
        this.comtips = "回复：" + name;
      } else {
        this.comtips = "说点什么...";
      }
      
      // 清空内容
      this.comtext = "";
      
      // 重置提交状态
      this.isSubmittingComment = false;
      
      // 显示评论框
      this.isComment = true;
      console.log("评论框已显示");
      
      // 延时重置状态，防止多次点击
      setTimeout(() => {
        this.isOpeningComment = false;
      }, 500);
    },
    // 处理评论框失焦事件
    handleBlur() {
      console.log("评论框失焦");
      
      // 不会自动关闭，需要用户手动关闭或发送评论
    },
    
    // 预览评论图片
    previewCommentImage(image) {
      uni.previewImage({
        urls: [image],
        current: image
      });
    },

    
    // 创建默认评论数据（当API返回为空时）
    createDefaultCommentData(content, imageUrl) {
      // 生成更安全的临时ID，避免冲突
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 获取用户地理位置信息（如果有的话）
      const userProvince = this.noteInfo?.province || this.$store.state.app?.userInfo?.province || '';
      
      // 创建完整的评论数据结构
      const commentData = {
        id: tempId, // 使用更安全的临时ID
        uid: this.userId,
        nickname: this.userNickname || '用户',
        avatar: this.userAvatar || '/static/img/default.png',
        content: content || '',
        image: imageUrl || '', // 评论图片URL
        create_time: this.formatDate(new Date()),
        likes: 0,
        like_count: 0, // 兼容不同字段名
        is_like: false,
        status: 5, // 正常状态：5
        province: userProvince,
        delete_time: null, // 删除时间，用于标记是否被删除
        replies: [], // 初始化回复数组
        reply_count: 0, // 回复数量
        has_more_replies: false, // 是否有更多回复
        replyPage: 1, // 回复页码
        loading_replies: false // 是否正在加载回复
      };
      
      console.log('创建默认评论数据:', commentData);
      return commentData;
    },
    
    // 格式化日期为字符串
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    
    // 处理评论成功
    processCommentSuccess(commentData) {
      console.log("处理评论成功", {
        commentData,
        cIdx: this.cIdx,
        cI: this.cI,
        noteInfoComments: this.noteInfo.comments
      });
      
      // 确保commentData存在
      if (!commentData) {
        console.error("评论数据为空，无法处理");
        return;
      }
      
      // 增加评论总数
      this.noteInfo.comments = (this.noteInfo.comments || 0) + 1;
      
      // 处理回复评论
      if (this.cIdx >= 0) {
        console.log("处理回复评论", this.cIdx);
        
        if (!this.commentList[this.cIdx].replies) {
          this.commentList[this.cIdx].replies = [];
        }
        if (this.commentList[this.cIdx].reply_count === undefined) {
          this.commentList[this.cIdx].reply_count = 0;
        }
        
        // 设置回复目标信息
        if (this.cUId) {
          // 获取被回复用户的昵称
          const nickname = this.comtips.replace("回复：", "");
          commentData.reply_uid = this.cUId;
          commentData.reply_nickname = nickname;
        }
        
        // 添加回复
        this.commentList[this.cIdx].replies.push(commentData);
        this.commentList[this.cIdx].reply_count++;
        
        // 更新回复索引映射
        this.replyIndices.set(commentData.id, this.commentList[this.cIdx].replies.length - 1);
        
        // 强制更新视图
        this.$forceUpdate();
        
        console.log("回复评论处理完成", {
          回复数量: this.commentList[this.cIdx].reply_count,
          回复列表: this.commentList[this.cIdx].replies.length
        });
      }
      // 处理新评论
      else {
        console.log("处理新评论");
        
        if (this.isEmpty || this.commentList.length === 0) {
          this.isEmpty = false;
          this.commentList = [];
          console.log("重置评论列表");
        }
        
        // 初始化回复数据
        commentData.replies = [];
        commentData.reply_count = 0;
        
        // 添加到列表头部
        this.commentList.unshift(commentData);
        
        // 强制更新视图
        this.$forceUpdate();
        
        console.log("新评论处理完成", {
          评论列表长度: this.commentList.length,
          评论总数: this.noteInfo.comments
        });
      }
    },
    // 优化页面滚动事件处理
    handlePageScroll(e) {
      // 保存滚动位置以优化性能
      if (!e || !this.isPageActive) return; // 确保有事件对象且页面活跃
      
      const scrollTop = e.scrollTop;
      const direction = scrollTop > this.lastScrollTop ? 'down' : 'up';
      this.lastScrollTop = scrollTop;
      
      // 只在滚动方向为向下且不在加载状态时预加载评论
      if (direction === 'down' && !this.commentInProgress &&
          scrollTop > 300 && this.loadStatus === 'more') {
        this.preloadComments();
      }
    },
    
    // 预加载评论 - 性能优化
    preloadComments() {
      // 使用防抖减少请求频率
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      
      this.debounceTimer = setTimeout(() => {
        // 判断是否需要加载更多
        if (this.page > 1 && !this.commentCache[this.page + 1]) {
          // 预加载下一页评论但不显示
          this.fetchCommentsForPage(this.page + 1, true);
        }
      }, 300);
    },
    // 统一错误处理方法
    handleError(error, defaultMessage = '操作失败') {
      console.error('错误处理:', error);

      let message = defaultMessage;

      // 如果是字符串，直接使用
      if (typeof error === 'string') {
        message = error;
      }
      // 如果是对象，尝试获取错误信息
      else if (error && typeof error === 'object') {
        message = error.msg || error.message || error.data?.msg || defaultMessage;
      }

      this.opTipsPopup(message);
      return message;
    },

    // 显示提示
    opTipsPopup(msg, back = false) {
      let self = this

      console.log("显示提示", msg, back);

      self.tipsTitle = msg
      self.$refs.tipsPopup.open()

      setTimeout(() => {
        self.$refs.tipsPopup.close()
        if (back) {
          self.navBack()
        }
      }, 2000)
    },
    
    // 获取回复索引 - 使用Map提高效率
    getReplyIndex(replies, replyId) {
      // 优先使用Map快速查找
      if (this.replyIndices.has(replyId)) {
        return this.replyIndices.get(replyId);
      }
      
      // 兜底使用遍历方式
      for (let i = 0; i < replies.length; i++) {
        if (replies[i].id === replyId) {
          // 更新Map以便下次快速查找
          this.replyIndices.set(replyId, i);
          return i;
        }
      }
      return -1;
    },
    
    // 排序回复 - 改进排序算法，处理可能的日期格式问题和嵌套回复
    sortRepliesByTime(replies) {
      if (!replies || !replies.length) return [];
      
      // 避免修改原数组
      const sorted = [...replies].sort((a, b) => {
        // 根据回复层级对回复进行分组排序
        // 先判断是否为嵌套回复
        if (a.is_nested && !b.is_nested) return 1; // 非嵌套回复排在前面
        if (!a.is_nested && b.is_nested) return -1; // 非嵌套回复排在前面
        
        // 如果是同一类型的回复，再按时间排序
        
        // 尝试转换日期字符串为时间戳
        let timeA, timeB;
        
        try {
          // 后端改为datetime格式，不需要替换-为/
          timeA = new Date(a.create_time).getTime();
        } catch(e) {
          timeA = 0;
        }
        
        try {
          // 后端改为datetime格式，不需要替换-为/
          timeB = new Date(b.create_time).getTime();
        } catch(e) {
          timeB = 0;
        }
        
        // 如果转换成功则比较时间戳，否则按原始字符串比较
        if (!isNaN(timeA) && !isNaN(timeB)) {
          return timeA - timeB;
        } else {
          // 兜底比较方案
          return (a.create_time || '').localeCompare(b.create_time || '');
        }
      });
      
      return sorted;
    },
    
    // 销毁音频实例
    destroyAudioInstance() {
      console.log('销毁音频实例');
      if (this.bgAudioManager) {
        try {
          // 停止音频播放
          if (this.bgAudioStatus) {
            this.bgAudioManager.stop();
          }
          
          // #ifdef H5
          // H5平台需要销毁音频实例
          if (typeof this.bgAudioManager.destroy === 'function') {
            this.bgAudioManager.destroy();
          }
          // #endif
          
          // 将引用置为null
          this.bgAudioManager = null;
          this.bgAudioStatus = false;
        } catch (e) {
          console.error('处理音频实例销毁过程中出错:', e);
          this.bgAudioManager = null;
          this.bgAudioStatus = false;
        }
      }
    },
    // 获取图片路径
    getImageSrc(item) {
      // 处理不同格式的图片数据
      let url = '';
      
      // 如果传入了字符串，直接使用
      if (typeof item === 'string') {
        url = item;
        console.log('图片URL是字符串:', url);
      } 
      // 如果传入对象，尝试获取url属性
      else if (item && typeof item === 'object') {
        // 尝试多种可能的属性名
        url = item.url || item.path || item.src || item.image || '';
        console.log('图片URL从对象中提取:', url, '原对象:', item);
      }
      
      // URL格式优化处理
      if (url) {
        // 处理缺少协议的URL (如 //example.com/image.jpg)
        if (url.startsWith('//')) {
          console.log('处理无协议URL:', url);
          url = 'https:' + url;
        }
        
        // 处理相对路径 (确保以/开头的相对路径)
        if (!url.startsWith('http') && !url.startsWith('data:')) {
          // 确保静态资源路径正确
          if (url.startsWith('/static')) {
            console.log('使用静态资源路径:', url);
            return url;
          }
          
          // 添加前缀斜杠
          if (!url.startsWith('/')) {
            console.log('添加前缀斜杠:', url);
            url = '/' + url;
          }
        }
      }
      
      // 提供默认图片作为备选
      const finalUrl = url || '/static/img/default_img.png';
      console.log('最终图片URL:', finalUrl);
      return finalUrl;
    },
    // 获取分享图片URL
    getShareImageUrl() {
      if (this.noteInfo.type == 2) {
        if (this.noteInfo.images && this.noteInfo.images.length > 0) {
          const firstImage = this.noteInfo.images[0];
          if (typeof firstImage === 'string') {
            return firstImage;
          } else if (firstImage.url) {
            return firstImage.url;
          }
        }
        return '';
      } else if (this.noteInfo.type == 3) {
        return this.noteInfo.video_cover || '';
      } else if (this.noteInfo.type == 4) {
        return this.noteInfo.audio_cover || '';
      }
      return '';
    },
    // 显示表情面板
    toggleEmoji() {
      this.isFocus = false;
      setTimeout(() => {
        this.showEmoji = !this.showEmoji;
        // 加载最近使用的表情
        if(this.showEmoji) {
          try {
            const recentEmojiStr = uni.getStorageSync('recent_emojis');
            if(recentEmojiStr) {
              this.recentEmojis = JSON.parse(recentEmojiStr);
            }
          } catch(e) {
            console.error('读取最近使用表情失败', e);
          }
        }
      }, 100);
    },
    // 选择表情
    selectEmoji(emoji) {
      // 将表情添加到文本内容中
      this.comtext += emoji.alt;
      
      // 添加到最近使用的表情
      if (!this.recentEmojis.find(item => item.url === emoji.url)) {
        this.recentEmojis.unshift(emoji);
        if (this.recentEmojis.length > 20) {
          this.recentEmojis.pop();
        }
      }
      
      // 保存到本地存储
      try {
        uni.setStorageSync('recent_emojis', JSON.stringify(this.recentEmojis));
      } catch (e) {
        console.error('保存表情记录失败', e);
      }
    },
    // 选择GIF表情
    selectGif(gif) {
      // 将选择的GIF表情插入到评论中
      console.log('选择了GIF表情', gif);
      // TODO: 实现GIF表情功能
      uni.showToast({
        title: 'GIF表情功能开发中',
        icon: 'none'
      });
    },
          // 处理评论提交
    handleCommentSubmit(commentData) {
      if (this.isSubmittingComment) return;
      this.isSubmittingComment = true;
      
      // 获取评论内容和图片
      const content = commentData.content.trim();
      const image = commentData.image;
      
      // 如果没有内容和图片，不提交
      if (!content && !image) {
        this.isSubmittingComment = false;
        return;
      }
      
      // 准备评论数据
      const commentParams = {
        type: 0,                 // 评论类型：0-动态
        target_id: this.noteInfo.id,
        content: content,        // 保留原始表情格式如[微笑]
        reply_id: this.cCId || 0, // 父评论ID（后端会自动处理parent_id）
        image: image || ''        // 图片字段
      };
      
      console.log('提交评论参数:', commentParams);
      
      // 提交评论
      addComment(commentParams)
        .then(res => {
          console.log('评论提交响应:', res);
          
          try {
            if (res.status === 200) {
              // 更新评论计数
              this.noteInfo.comments = (this.noteInfo.comments || 0) + 1;
              
              // 优先使用服务器返回的评论数据，如果没有则创建默认数据
              let commentData = res.data || this.createDefaultCommentData(content, image);
              
              console.log('使用的评论数据:', commentData);
              
              // 如果是回复评论
              if (this.cCId) {
                // 查找父评论
                const parentComment = this.commentList.find(item => item.id === this.cCId);
                if (parentComment) {
                  // 确保replies数组存在
                  if (!parentComment.replies) {
                    parentComment.replies = [];
                  }
                  
                  // 添加回复到父评论的回复列表
                  parentComment.replies.unshift({
                    id: commentData.id,
                    pid: this.cCId,
                    uid: this.userId,
                    nickname: this.userNickname,
                    avatar: this.userAvatar,
                    content: content,
                    image: image, // 修改为image字段，与后端接口一致
                    create_time: '刚刚',
                    province: this.noteInfo.province || '',
                    likes: 0,
                    is_like: false,
                    status: 5,
                    reply_uid: this.cUId,
                    reply_content: this.commentSource && this.commentSource.nickname ? this.commentSource.nickname + ': ' + (this.commentSource.content || '') : ''
                  });
                  
                  // 更新回复计数
                  parentComment.reply_count = (parentComment.reply_count || 0) + 1;
                }
              } else {
                // 添加新评论到列表顶部
                this.commentList.unshift({
                  id: commentData.id,
                  uid: this.userId,
                  nickname: this.userNickname,
                  avatar: this.userAvatar,
                  content: content,
                  image: image, // 修改为image字段，与后端接口一致
                  create_time: '刚刚',
                  province: this.noteInfo.province || '',
                  likes: 0,
                  is_like: false,
                  status: 5,
                  replies: [],
                  reply_count: 0
                });
              }
              
              // 关闭评论框
              this.closeComment();
              
              // 显示成功提示
              this.opTipsPopup('评论成功');
              
              // 如果评论列表为空，刷新页面
              if (this.isEmpty) {
                this.isEmpty = false;
              }
            } else {
              // 评论失败，显示服务器返回的错误信息
              this.opTipsPopup(res.msg || '评论失败，请重试');
            }
          } catch (error) {
            console.error('处理评论响应时出错:', error);
            this.opTipsPopup('评论处理失败，请重试');
          }
        })
        .catch(err => {
          // 评论失败
          console.error('评论提交失败:', err);
          this.handleError(err, '评论失败，请重试');
        })
        .finally(() => {
          this.isSubmittingComment = false;
        });
    },
    
    // 关闭评论输入框
    closeComment() {
      // 如果正在提交评论，不关闭
      if (this.isSubmittingComment) {
        return;
      }
      
      // 清除blur定时器
      if (this.commentBlurTimer) {
        clearTimeout(this.commentBlurTimer);
        this.commentBlurTimer = null;
      }
      
      // 关闭评论框和焦点
      this.isComment = false;
      this.isFocus = false;
      
      // 重置评论相关状态
      this.comtext = "";
      this.commentImage = null;
    },
    // 关闭@用户选择弹窗
    closeAtUsers() {
      this.$refs.atUserPopup.close();
    },
    
    // 这些方法已移至评论输入组件中
    
      // 处理表情解析
  parseEmojiContent(content) {
    if (!content) return '';
    
    try {
      // 替换所有表情标记为HTML图片标签
      let replacedStr = content.replace(/\[([^(\]|\[)]*)\]/g, (item, index) => {
        // 查找对应的表情
        const emoji = sinaEmoji.find(e => e.phrase === item);
        
        if (emoji) {
          // 使用表情的url属性
          return `<img src="${emoji.url}" style="width: 28rpx; height: 28rpx; vertical-align: middle; display:inline-block;">`;
        }
        
        // 如果没有找到对应表情,返回原字符串
        return item;
      });
      
      // 将文本包装在span中，确保文本和表情在同一行显示
      return '<span style="display:inline;">' + replacedStr + '</span>';
    } catch (error) {
      console.error('解析表情出错:', error);
      // 发生错误时返回原内容，确保至少显示文本
      return '<span style="display:inline;">' + content + '</span>';
    }
  },
    
    // 解析评论中的表情
    parseCommentEmoji(comment) {
      if(!comment || !comment.content) return comment;
      
      // 创建一个新的对象避免直接修改原对象
      let newComment = JSON.parse(JSON.stringify(comment));
      
      // 直接使用parseEmojiContent处理内容
      newComment.parsedContent = this.parseEmojiContent(newComment.content);
      
      return newComment;
    },
    
  },
  // 触底加载更多
  onReachBottom() {
    // 检查是否可以加载更多
    if (!this.isEmpty &&
        this.commentList.length > 0 &&
        this.loadStatus === "more" &&
        this.isThrottling &&
        !this.commentInProgress) {
      
      this.page = this.page + 1
      this.loadStatus = "loading"
      this.getCommentList()
    }
  },
  // 分享设置
  onShareAppMessage: function() {
    return {
      title: this.noteInfo.content,
      imageUrl: this.getShareImageUrl(),
      path: "/pages/note/details?id=" + this.noteInfo.id
    }
  },
  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: this.noteInfo.content,
      imageUrl: this.getShareImageUrl(),
      query: "id=" + this.noteInfo.id
    }
  },
  // 微信小程序页面卸载
  onUnload() {
    console.log('页面卸载，释放资源');
    this.cleanupResources();
  },
  
  // 微信小程序页面隐藏
  onHide() {
    console.log('页面隐藏');
    
    // 标记页面为非活跃状态
    this.isPageActive = false;
    
    // 只有音频动态才处理音频暂停
    if (this.isAudioNote && this.bgAudioManager && this.bgAudioStatus) {
      this.pauseAudio();
    }
  },
  


}
</script>

<style>
/* 全局表情样式重置 - 确保尺寸一致 */
page image[data-emoji],
page img[data-emoji],
.container image[data-emoji],
.container img[data-emoji] {
  width: 32rpx !important;
  height: 32rpx !important;
  max-width: 32rpx !important;
  max-height: 32rpx !important;
  min-width: 32rpx !important;
  min-height: 32rpx !important;
  object-fit: cover !important;
  display: inline-block !important;
  vertical-align: middle !important;
  margin: 0 4rpx !important;
  border-radius: 4rpx !important;
}

.nav-box{
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  width: 100%;
  background: #fff;
  box-sizing: border-box;
}
.nav-item .nav-back{
  padding: 0 30rpx;
  width: 34rpx;
  height: 100%;
  border-radius: 50%;
}
.nav-item{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-user .nav-user-avatar{
  margin-right: 15rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f8f8f8;
  border: 1px solid #f5f5f5;
}
.nav-user .nav-user-name{
  max-width: 150rpx;
  font-size: 26rpx;
  font-weight: 700;
}
.nav-user .nav-user-adds image{
  width: 18rpx;
  height: 18rpx;
}
.nav-user .nav-user-adds text{
  margin-left: 4rpx;
  color: #999;
  font-size: 18rpx;
  font-weight: 500;
}
.nav-user{
  flex: 1;
  justify-content: flex-start;
  padding-right: 10rpx;
}
.nav-user .user-info{
  display: flex;
  align-items: center;
}
.nav-user .follow-btn{
  margin-left: 20rpx;
  padding: 0 20rpx;
  height: 48rpx;
  line-height: 48rpx;
  border-radius: 48rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: #f8f8f8;
  background: #555555;
  text-align: center;
  transition: all 0.3s;
}
.nav-user .follow-btn.active{
  color: #999;
  background: rgba(0, 0, 0, 0.08);
}

/* 导航栏右侧关注按钮容器 */
.nav-follow {
  padding: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* 非小程序环境的默认内边距 */
/* #ifndef MP-WEIXIN */
.nav-follow {
  padding-right: 30rpx;
}
/* #endif */

/* 导航栏右侧关注按钮容器 */
.nav-follow {
  padding: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* 非小程序环境的默认内边距 */
/* #ifndef MP-WEIXIN */
.nav-follow {
  padding-right: 30rpx;
}
/* #endif */

/* 导航栏右侧关注按钮样式 - 符合项目整体风格 */
.follow-btn-right {
  position: relative;
  padding: 0 24rpx;
  height: 56rpx;
  min-width: 100rpx;
  border-radius: 28rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--view-main-start, #FF6151) 0%, var(--view-main-over, #e93323) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4rpx 12rpx var(--view-op-ten, rgba(233, 51, 35, 0.3)),
    0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: none;
  overflow: hidden;
}

/* 按钮按下效果 */
.follow-btn-right:active {
  transform: translateY(1rpx);
  box-shadow:
    0 2rpx 8rpx var(--view-op-ten, rgba(233, 51, 35, 0.4)),
    0 1rpx 4rpx rgba(0, 0, 0, 0.15);
}

/* 已关注状态 */
.follow-btn-right.active {
  color: #666;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  box-shadow:
    0 2rpx 8rpx rgba(0, 0, 0, 0.08),
    0 1rpx 4rpx rgba(0, 0, 0, 0.05);
}

/* 已关注状态按下效果 */
.follow-btn-right.active:active {
  background: linear-gradient(135deg, #e8e8e8 0%, #ddd 100%);
  transform: translateY(1rpx);
}

/* 按钮悬停效果（H5端） */
/* #ifdef H5 */
.follow-btn-right:hover {
  transform: translateY(-1rpx);
  box-shadow:
    0 6rpx 16rpx var(--view-op-ten, rgba(233, 51, 35, 0.4)),
    0 3rpx 8rpx rgba(0, 0, 0, 0.12);
}

.follow-btn-right.active:hover {
  box-shadow:
    0 4rpx 12rpx rgba(0, 0, 0, 0.12),
    0 2rpx 6rpx rgba(0, 0, 0, 0.08);
}
/* #endif */

/* 按钮加载状态 */
.follow-btn-right.loading {
  pointer-events: none;
  opacity: 0.7;
}

.follow-btn-right.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20rpx;
  height: 20rpx;
  margin: -10rpx 0 0 -10rpx;
  border: 2rpx solid transparent;
  border-top: 2rpx solid currentColor;
  border-radius: 50%;
  animation: button-loading 1s linear infinite;
}

@keyframes button-loading {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 关注按钮脉冲动画 - 吸引用户注意 */
.follow-btn-right:not(.active)::before {
  content: '';
  position: absolute;
  top: -2rpx;
  left: -2rpx;
  right: -2rpx;
  bottom: -2rpx;
  border-radius: 30rpx;
  background: linear-gradient(135deg, var(--view-main-start, #FF6151) 0%, var(--view-main-over, #e93323) 100%);
  opacity: 0;
  z-index: -1;
  animation: follow-pulse 2s ease-in-out infinite;
}

@keyframes follow-pulse {
  0%, 100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.05);
  }
}

/* 响应式设计 - 小屏幕适配 */
@media (max-width: 750rpx) {
  .follow-btn-right {
    padding: 0 20rpx;
    height: 52rpx;
    min-width: 90rpx;
    font-size: 22rpx;
  }
}

/* 主题色适配 - 蓝色主题 */
.theme-blue .follow-btn-right:not(.active) {
  background: linear-gradient(135deg, #40D1F4 0%, #1DB0FC 100%);
  box-shadow:
    0 4rpx 12rpx rgba(29, 176, 252, 0.3),
    0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.theme-blue .follow-btn-right:not(.active)::before {
  background: linear-gradient(135deg, #40D1F4 0%, #1DB0FC 100%);
}

/* 主题色适配 - 绿色主题 */
.theme-green .follow-btn-right:not(.active) {
  background: linear-gradient(135deg, #70E038 0%, #42CA4D 100%);
  box-shadow:
    0 4rpx 12rpx rgba(66, 202, 77, 0.3),
    0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.theme-green .follow-btn-right:not(.active)::before {
  background: linear-gradient(135deg, #70E038 0%, #42CA4D 100%);
}

/* 主题色适配 - 粉色主题 */
.theme-pink .follow-btn-right:not(.active) {
  background: linear-gradient(135deg, #FF67AD 0%, #FF448F 100%);
  box-shadow:
    0 4rpx 12rpx rgba(255, 68, 143, 0.3),
    0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.theme-pink .follow-btn-right:not(.active)::before {
  background: linear-gradient(135deg, #FF67AD 0%, #FF448F 100%);
}

/* 主题色适配 - 橙色主题 */
.theme-orange .follow-btn-right:not(.active) {
  background: linear-gradient(135deg, #FF9445 0%, #FE5C2D 100%);
  box-shadow:
    0 4rpx 12rpx rgba(254, 92, 45, 0.3),
    0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.theme-orange .follow-btn-right:not(.active)::before {
  background: linear-gradient(135deg, #FF9445 0%, #FE5C2D 100%);
}

/* 点击效果 */
.follow-btn-right:active {
  transform: translateY(1rpx) scale(0.98);
  box-shadow:
    0 2rpx 6rpx rgba(102, 126, 234, 0.2),
    0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

/* 小程序环境适配 */
/* #ifdef MP-WEIXIN */
.follow-btn-right {
  background: linear-gradient(135deg, #07c160 0%, #00ae52 100%);
  box-shadow:
    0 4rpx 12rpx rgba(7, 193, 96, 0.3),
    0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.follow-btn-right.active {
  background: linear-gradient(135deg, #666 0%, #555 100%);
}
/* #endif */

/* H5环境优化 */
/* #ifdef H5 */
.follow-btn-right {
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.follow-btn-right:hover {
  transform: translateY(-1rpx);
  box-shadow:
    0 6rpx 16rpx rgba(102, 126, 234, 0.4),
    0 3rpx 8rpx rgba(0, 0, 0, 0.15);
}
/* #endif */
.avatar-info{
  margin-left: 20rpx;
}
.content-box .swiper-box{
  z-index: 1;
  width: 100%;
  transition: height .3s;
  overflow: hidden;
  background-color: #f8f8f8;
}

.swiper-box .swiper-item{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 图片样式 */
.swiper-image {
  width: 100%;
  height: 100%;
  display: block;
}
.content-box .current{
  position: absolute;
  z-index: 1;
  right: 15rpx;
  padding: 0 15rpx;
  height: 40rpx;
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  background: rgba(0, 0, 0, .4);
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 40rpx;
}
.content-box .indicator{
  margin: -40rpx 30rpx 0;
  width: calc(100% - 60rpx);
  height: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 10;
}
.indicator .indicator-item{
  z-index: 1;
  margin: 0 2.5px;
  height: 3px;
  border-radius: 3px;
  background: rgba(255, 255, 255, .3);
  transition: background-color 0.3s;
}

.indicator .indicator-item.active{
  background: rgba(255, 255, 255, .9);
}
.content-box .video-box{
  width: 100%;
  height: 421.875rpx;
}
.content-box .audio-box{
  width: calc(100% - 60rpx);
  margin: 0 30rpx;
  height: 180rpx;
  color: #fff;
  border-radius: 8rpx;
  position: relative;
  overflow: hidden;
}
.audio-box .audio-left{
  margin-right: 30rpx;
  width: 180rpx;
  height: 180rpx;
  position: relative;
}
.audio-box .audio-left .icon{
  position: absolute;
  top: 65rpx;
  right: 65rpx;
  bottom: 65rpx;
  left: 65rpx;
  width: 50rpx;
  height: 50rpx;
}
.audio-box .audio-bg{
  position: absolute;
  top: 0;
  left: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
}
.audio-box .audio-mb{
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  -webkit-backdrop-filter: saturate(150%) blur(25px);
  backdrop-filter: saturate(150%) blur(25px);
  background: rgba(0, 0, 0, .5);
}
.audio-box .audio-t1{
  font-size: 32rpx;
  font-weight: 700;
}
.audio-box .audio-t2{
  margin-top: 12rpx;
  opacity: .8;
  font-size: 24rpx;
}
.audio-box .audio-play{
  margin: 0 30rpx;
  width: 68rpx;
  height: 68rpx;
  background: rgba(255, 255, 255, .15);
  border-radius: 50%;
}
.audio-box .audio-play .icon{
  margin: 20rpx;
  width: 28rpx;
  height: 28rpx;
}
.content-box .info-box{
  width: calc(100% - 60rpx);
  padding: 30rpx;
}
.info-box .info-content{
  width: 100%;
  word-break: break-word;
  white-space: pre-line;
}
.info-box .info-content text{
  font-size: 28rpx;
  font-weight: 400;
}
.info-box .info-tag{
  margin-top: 20rpx;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}
.info-tag .tag-item{
  margin: 10rpx 10rpx 0 0;
  padding: 8rpx;
  height: 40rpx;
  border-radius: 8rpx;
  background: #f8f8f8;
}
.info-tag .tag-item .icon{
  width: 40rpx;
  height: 40rpx;
}
.info-tag .tag-item text{
  font-size: 20rpx;
  padding: 0 8rpx 0 12rpx;
}
.info-box .more{
  padding: 30rpx 0;
  width: 100%;
  justify-content: space-between;
  border-bottom: 1px solid #f8f8f8;
  position: relative;
}
.info-box .more .more-left{
  color: #999;
  font-size: 20rpx;
}
.info-box .more .more-right{
  position: absolute;
  right: -30rpx;
  padding: 20rpx 30rpx;
  width: 24rpx;
  height: 24rpx;
}
.comment-box{
  width: calc(100% - 60rpx);
  padding: 0 30rpx 120px;
}
.comment-box .comment-top{
  width: 100%;
  justify-content: space-between;
}
.comment-top .top-title{
  font-size: 26rpx;
  font-weight: 700;
}
.comment-top .top-btn{
  width: 136rpx;
  padding: 6rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
  position: relative;
}
.comment-top .top-btn .btn-item, .comment-top .top-btn .btn-active{
  width: 68rpx;
  height: 44rpx;
}
.comment-top .top-btn .btn-item{
  z-index: 2;
  line-height: 44rpx;
  text-align: center;
  font-size: 20rpx;
  font-weight: 500;
  transition: color .3s;
}
.comment-top .top-btn .btn-active{
  position: absolute;
  z-index: 1;
  background: #fff;
  border-radius: 4rpx;
  transition: left .3s;
}
.comment-box .comment-item{
  width: 100%;
  margin-top: 30rpx;
  justify-content: space-between;
  align-items: flex-start !important;
}
.comment-item .comment-avatar, .comment-item .comment-avatar-z{
  background: #f8f8f8;
  border: 1px solid #f5f5f5;
  border-radius: 50%;
  overflow: hidden;
}
.comment-item .comment-avatar{
  width: 64rpx;
  height: 64rpx;
}
.comment-item .comment-avatar-z{
  width: 44rpx;
  height: 44rpx;
}
.comment-item .comment-info{
  width: calc(100% - 88rpx);
}
.unfold{
  padding: 20rpx 68rpx;
  color: #4e6ef2;
  font-size: 24rpx;
  font-weight: 700;
  transition: opacity 0.3s;
}
.unfold:active {
  opacity: 0.7;
}
.comment-info .comment-info-top{
  font-size: 24rpx;
  color: #999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.comment-info .user-info-left {
  display: flex;
  align-items: center;
}

.comment-info .like-icon {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.comment-info .like-icon image {
  width: 32rpx;
  height: 32rpx;
  margin-right: 4rpx;
}

.comment-info .like-icon text {
  font-size: 20rpx;
  color: #999;
}
.comment-info .comment-info-top-z {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.comment-info .comment-info-top-z view{
  max-width: 230rpx;
  font-size: 22rpx;
  color: #999;
}
.comment-info .comment-info-top-z text{
  margin-right: 8rpx;
  color: #333;
  font-size: 22rpx;
  font-weight: 500;
}
.comment-info .nn, .comment-info .zz, .comment-info .wo{
  margin-right: 8rpx;
}
.comment-info .zz{
  color: #FA5150 !important;
  font-weight: 700;
}
.comment-info .wo{
  color: #000 !important;
  font-weight: 700;
}
.comment-info .db{
  color: #ccc !important;
}
.comment-info .comment-info-content{
  word-break: break-word;
  white-space: pre-wrap;
}
.comment-info .comment-info-content text{
  color: #333;
  font-size: 26rpx;
  font-weight: 400;
  display: inline;
}
.comment-info .comment-info-bottom{
  margin-top: 15rpx;
  color: #999;
  font-size: 20rpx;
}
.comment-info .comment-info-bottom view{
  margin-left: 30rpx;
  font-weight: 700;
}

/* 嵌套回复样式 */
/* 嵌套回复样式已移除，使用扁平化结构 */

.comment-box .no-more{
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  color: #999;
  font-size: 20rpx;
}
.footer-box{
  position: fixed;
  z-index: 99;
  left: 0;
  bottom: 0;
  width: calc(100% - 20rpx);
  padding: 20rpx 10rpx;
  background: #fff;
  border-top: 1px solid #f8f8f8;
  padding-bottom: max(env(safe-area-inset-bottom), 20rpx);
}
.footer-box .footer-item{
  width: 100%;
  height: 80rpx;
  justify-content: space-between;
}
.footer-means{
  margin-left: 20rpx;
  padding: 0 30rpx;
  height: 80rpx;
  font-size: 20rpx;
  font-weight: 700;
  background: #f8f8f8;
  border-radius: 40rpx;
}
.footer-means image{
  margin-left: 10rpx;
  width: 20rpx;
  height: 20rpx;
}
.footer-comment{
  margin-left: 20rpx;
  width: 280rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #f8f8f8;
  border-radius: 40rpx;
}
.footer-comment image{
  margin: 0 20rpx 0 10rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
}
.footer-comment view{
  max-width: calc(100% - 120rpx);
  color: #999;
  font-size: 24rpx;
  font-weight: 400;
  word-break: break-word;
  white-space: pre-line;
  display: block;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 1;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
}
.footer-item .footer-icon{
  padding: 16rpx 20rpx;
  display: flex;
}
.footer-item .footer-icon image{
  width: 48rpx;
  height: 48rpx;
}
.footer-item .footer-icon text{
  margin-left: 10rpx;
  color: #999;
  font-size: 18rpx;
  font-weight: 700;
}
.popup-comment-mask{
  position: fixed;
  z-index: 998;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.01); /* 几乎透明的背景，只为捕获点击事件 */
}
.popup-comment{
  position: fixed;
  z-index: 999;
  left: 0;
  bottom: 0;
  width: 100%;
  background: #fff;
  border-top: 1px solid #f1f1f1;
  display: flex;
  flex-direction: column;
}
.popup-comment .send{
  margin: 0 0 15rpx 30rpx;
  width: 48rpx;
  height: 48rpx;
}
.popup-comment .comment-textarea{
  width: calc(100% - 98rpx);
  padding: 10rpx 20rpx;
  background: #f8f8f8;
  border-radius: 30rpx;
}
.popup-comment .comment-textarea textarea{
  width: 100%;
  line-height: 32rpx;
  min-height: 96rpx;
  max-height: 320rpx;
  font-size: 26rpx;
}
.popup-comment .comment-icon{
  width: calc(100% - 20rpx);
  padding: 30rpx 10rpx;
}
.share-popup{
  background: #fff;
  border-radius: 30rpx;
  padding: 30rpx;
  overflow: hidden;
}
.share-popup .share-img{
  width: 473rpx;
  height: 237.5rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
  display: block;
}
.share-popup .share-tips{
  margin: 30rpx 0;
  width: 473rpx;
  font-size: 26rpx;
  line-height: 48rpx;
  position: relative;
}
.share-popup .share-tips image{
  position: absolute;
  top: 0;
  width: 48rpx;
  height: 48rpx;
  margin: 0 15rpx;
}
.share-popup .share-btn{
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
  background: #000;
  border-radius: 16rpx;
}
.more-popup{
  width: 100%;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
}
.more-popup .more-tips{
  width: calc(100% - 60rpx);
  padding: 20rpx 30rpx;
  font-size: 20rpx;
  color: #999;
  background: #f8f8f8;
}
.more-popup .more-item{
  width: calc(100% - 60rpx);
  padding: 30rpx;
  font-size: 26rpx;
  font-weight: 700;
  justify-content: space-between;
}
.more-popup .more-item:first-child{
  padding-top: 40rpx;
}
.more-popup .more-item:last-child{
  padding-bottom: 40rpx;
}
.more-popup .more-item:hover{
  background: #f8f8f8;
}
.more-popup .more-item image{
  width: 36rpx;
  height: 36rpx;
}
.empty-box{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}
.empty-box image{
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}
.empty-box .e1{
  font-size: 28rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}
.empty-box .e2{
  font-size: 24rpx;
  color: #999;
}
.tips-box{
  justify-content: center;
  width: 100%;
}
.tips-box .tips-item{
  background: #000;
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
}
.df{
  display: flex;
  align-items: center;
}
.ohto{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bUp{
  transition: bottom .3s;
}

/* 点赞按钮样式 */
.like-action {
  margin-left: 24rpx;
  font-size: 24rpx;
  color: #999;
}

.like-text {
  color: #999;
}

.like-text.liked {
  color: #FA5150;
}

.like-icon text {
  color: #999;
}

.like-icon image {
  width: 32rpx;
  height: 32rpx;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 20rpx;
}

.loading-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 10rpx;
}

.load-more-children {
  padding: 10rpx 0 10rpx 60rpx;
  font-size: 24rpx;
  color: #4e6ef2;
}



.audio-error {
  margin: 0 30rpx;
  width: 68rpx;
  height: 68rpx;
  background: rgba(255, 255, 255, .15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-error text {
  color: #ff4d4f;
  font-size: 20rpx;
  text-align: center;
}

.send-button-wrapper {
  padding: 8rpx;
  margin: 0 0 15rpx 30rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button-wrapper {
  padding: 8rpx;
  margin: 0 0 15rpx 30rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.send-button-wrapper.active {
  background-color: #ff4081;
  border-radius: 50%;
}

.send-button-wrapper .send {
  width: 48rpx;
  height: 48rpx;
}




/* 图片容器样式 */
/* 删除多余样式，使用上面的样式统一处理 */

/* 评论输入框样式已移至组件中 */

/* 表情面板样式已移至组件中 */

.at-user-popup {
  position: fixed;
  z-index: 999;
  left: 0;
  width: 100%;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.close-btn {
  width: 80rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
  color: #999;
  font-size: 24rpx;
  font-weight: 700;
  border-radius: 48rpx;
  border: 1px solid #f5f5f5;
}

.user-list {
  margin-top: 10rpx;
}

.user-item {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 10rpx;
}

.user-name {
  max-width: 200rpx;
  font-size: 26rpx;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-users {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  color: #999;
  font-size: 20rpx;
}

/* 评论图片样式 */
.comment-image {
  margin-top: 10rpx;
  max-width: 200rpx;
  max-height: 200rpx;
  border-radius: 8rpx;
  transition: transform 0.2s ease;
}

.comment-image:active {
  transform: scale(0.95);
}

.reply-comment-image {
  max-width: 160rpx;
  max-height: 160rpx;
}

/* 表情显示优化样式 */
.comment-rich-text {
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}

.reply-rich-text {
  font-size: 24rpx;
}

/* 表情图片样式 - 强制固定尺寸 */
.emoji-img, .emoji-img-inline {
  width: 32rpx !important;
  height: 32rpx !important;
  max-width: 32rpx !important;
  max-height: 32rpx !important;
  min-width: 32rpx !important;
  min-height: 32rpx !important;
  vertical-align: middle !important;
  margin: 0 4rpx !important;
  display: inline-block !important;
  border-radius: 4rpx !important;
  object-fit: cover !important;
  transition: transform 0.1s ease;
}

.emoji-img:active, .emoji-img-inline:active {
  transform: scale(1.1);
}

/* 回复中的表情稍小一些 */
.reply-rich-text .emoji-img,
.reply-rich-text .emoji-img-inline {
  width: 28rpx !important;
  height: 28rpx !important;
  max-width: 28rpx !important;
  max-height: 28rpx !important;
  min-width: 28rpx !important;
  min-height: 28rpx !important;
  margin: 0 2rpx !important;
}

/* 删除的评论样式 */
.deleted-comment {
  color: #ccc !important;
  font-style: italic;
}

/* 表情加载失败的占位样式 */
.emoji-img-error {
  width: 32rpx;
  height: 32rpx;
  background-color: #f5f5f5;
  border-radius: 4rpx;
  display: inline-block;
  vertical-align: middle;
  margin: 0 4rpx;
  position: relative;
}

.emoji-img-error::after {
  content: '😊';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20rpx;
  opacity: 0.5;
}

/* 评论内容整体优化 */
.comment-info-content {
  margin-top: 8rpx;
  padding: 4rpx 0;
  border-radius: 4rpx;
  transition: background-color 0.2s ease;
}

.comment-info-content:active {
  background-color: rgba(0, 0, 0, 0.02);
}

/* 强制表情尺寸一致 - 更高优先级选择器 */
.comment-rich-text image[data-emoji],
.comment-rich-text img[data-emoji],
.reply-rich-text image[data-emoji],
.reply-rich-text img[data-emoji] {
  width: 32rpx !important;
  height: 32rpx !important;
  max-width: 32rpx !important;
  max-height: 32rpx !important;
  min-width: 32rpx !important;
  min-height: 32rpx !important;
  object-fit: cover !important;
  display: inline-block !important;
  vertical-align: middle !important;
  margin: 0 4rpx !important;
  border-radius: 4rpx !important;
}

/* 回复中的表情强制尺寸 */
.reply-rich-text image[data-emoji],
.reply-rich-text img[data-emoji] {
  width: 28rpx !important;
  height: 28rpx !important;
  max-width: 28rpx !important;
  max-height: 28rpx !important;
  min-width: 28rpx !important;
  min-height: 28rpx !important;
  margin: 0 2rpx !important;
}

/* 通用表情图片强制样式 */
rich-text image[data-emoji],
rich-text img[data-emoji] {
  width: 32rpx !important;
  height: 32rpx !important;
  max-width: 32rpx !important;
  max-height: 32rpx !important;
  min-width: 32rpx !important;
  min-height: 32rpx !important;
  object-fit: cover !important;
  display: inline-block !important;
  vertical-align: middle !important;
}

/* 响应式表情大小 */
@media screen and (max-width: 750rpx) {
  .emoji-img, .emoji-img-inline {
    width: 28rpx !important;
    height: 28rpx !important;
    max-width: 28rpx !important;
    max-height: 28rpx !important;
    min-width: 28rpx !important;
    min-height: 28rpx !important;
  }
  
  .reply-rich-text .emoji-img,
  .reply-rich-text .emoji-img-inline {
    width: 24rpx !important;
    height: 24rpx !important;
    max-width: 24rpx !important;
    max-height: 24rpx !important;
    min-width: 24rpx !important;
    min-height: 24rpx !important;
  }
}

/* 表情预览弹窗样式 */
.emoji-preview-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12rpx;
  padding: 20rpx;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

.emoji-preview-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.emoji-tabs {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 20rpx;
  border-bottom: 1rpx solid #f1f1f1;
}

.emoji-tabs-inner {
  display: flex;
  justify-content: space-between;
}

.emoji-tab-item {
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  color: #999;
}

.emoji-tab-item.active {
  border-bottom: 2rpx solid #ff4d6a;
  color: #ff4d6a;
}

.emoji-content {
  flex: 1;
  padding: 20rpx;
}

.empty-emoji {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 24rpx;
}

.emoji-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 20rpx;
  border-top: 1rpx solid #f1f1f1;
}

.emoji-backspace {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-backspace image {
  width: 44rpx;
  height: 44rpx;
}

.emoji-send {
  width: 120rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  background-color: #f5f5f5;
  color: #ccc;
  font-size: 28rpx;
  border-radius: 32rpx;
}

.emoji-send.active {
  background-color: #ff4d6a;
  color: #fff;
}

.gif-search {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64rpx;
  border-bottom: 1rpx solid #f1f1f1;
}

.gif-search image {
  width: 44rpx;
  height: 44rpx;
}

.gif-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gif-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}



</style> 