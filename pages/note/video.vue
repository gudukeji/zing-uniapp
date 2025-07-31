<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-box" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="nav-item df" :style="{'width': '100%', 'height': titleBarHeight + 'px', 'position': 'relative'}">
        <view class="nav-back df" @tap="navBack">
          <image class="xwb" src="/static/img/z.png" style="width:34rpx;height:34rpx"></image>
        </view>
        <!-- 图片计数器 -->
        <view v-if="isImageNote && noteInfo.images && noteInfo.images.length > 1" class="nav-counter">
          {{currentImageIndex + 1}}/{{noteInfo.images.length}}
        </view>
      </view>
    </view>
    
    <!-- 视频播放区 - type=3 视频类型 -->
    <view v-if="isVideoNote && noteInfo.video" class="video-box df" :style="{'height': isCommentPopup ? '30vh' : 'calc(100vh - ' + footerHeight + 'px)'}">
      <video 
        id="myVideo"
        :src="noteInfo.video" 
        :poster="noteInfo.video_cover"
        object-fit="contain"
        autoplay
        play-btn-position="center" 
        :show-fullscreen-btn="false">
      </video>
    </view>
    
    <!-- 图片显示区 - type=2 -->
    <view v-if="isImageNote && noteInfo.images && noteInfo.images.length > 0" 
          :class="[noteInfo.images.length == 1 ? 'image-box df' : 'multi-image-box']" 
          :style="{'height': isCommentPopup ? '30vh' : 'calc(100vh - ' + footerHeight + 'px)'}">
      <!-- 单图显示 -->
      <template v-if="noteInfo.images.length == 1">
      <image 
        :src="noteInfo.images[0]" 
        mode="aspectFit" 
        class="full-image"
        @tap="previewImage(noteInfo.images[0])">
      </image>
      </template>
    
      <!-- 多图显示 -->
      <swiper v-else
        class="image-swiper" 
        :indicator-dots="false" 
        @change="onSwiperChange" 
        circular>
        <swiper-item v-for="(img, index) in noteInfo.images" :key="index">
          <image 
            :src="img" 
            mode="aspectFit" 
            class="swiper-image"
            @tap="previewImage(img, index)">
          </image>
        </swiper-item>
      </swiper>
    </view>
    
    <!-- 音频播放区 - type=4 -->
    <view v-if="isAudioNote" class="audio-player-container" 
          :style="{'height': isCommentPopup ? '30vh' : 'calc(100vh - ' + footerHeight + 'px)'}">
      
      <!-- 背景模糊层 -->
      <view class="audio-bg-blur">
        <lazy-image :src="noteInfo.audio_cover || '/static/img/audio_icon.png'" mode="aspectFill"></lazy-image>
      </view>
      <view class="audio-bg-overlay"></view>
      
      <!-- 音频播放内容 -->
      <view class="audio-player-content">
        <!-- 外圈碟机效果 -->
        <view class="vinyl-outer" :class="{'rotating': bgAudioStatus}">
          <view class="vinyl-groove"></view>
          <view class="vinyl-groove-2"></view>
          <view class="vinyl-groove-3"></view>
          
          <!-- 内圈唱片和封面 -->
          <view class="vinyl-inner" :class="{'rotating-slow': bgAudioStatus}">
            <view class="vinyl-center">
              <view class="album-cover">
                <lazy-image :src="noteInfo.audio_cover || '/static/img/audio_icon.png'" mode="aspectFill"></lazy-image>
              </view>
              <view class="vinyl-dot"></view>
            </view>
          </view>
        </view>
        
        <!-- 音频信息 -->
        <view class="audio-info">
          <view v-if="noteInfo.audio_title" class="audio-title">{{noteInfo.audio_title}}</view>
          <view v-if="noteInfo.user_info" class="audio-artist">{{noteInfo.user_info.nickname || '未知艺术家'}}</view>
        </view>
        
        <!-- 播放控制 -->
        <view class="audio-controls">
          <view class="audio-play-btn" @tap="toggleAudioPlay">
            <image v-if="bgAudioStatus" src="/static/img/pause.png" mode="aspectFit"></image>
            <image v-else src="/static/img/play.png" mode="aspectFit"></image>
          </view>
          
          <!-- 进度条 -->
          <view class="audio-progress-container">
            <view class="audio-time-start">{{formatTime(currentTime)}}</view>
            <view class="audio-progress">
              <slider :value="audioProgress" @change="onAudioProgressChange" 
                      backgroundColor="rgba(255,255,255,0.3)" 
                      activeColor="rgba(255,255,255,0.9)" 
                      block-color="rgba(255,255,255,1)"
                      block-size="24"></slider>
            </view>
            <view class="audio-time-end">{{formatTime(duration)}}</view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-box" :style="{'bottom': footerHeight + 'px'}">
      <view class="nav-user df">
        <view class="user-info df" :data-url="'user/details?id='+noteInfo.uid" @tap="navigateToFun">
          <image class="nav-user-avatar" :src="noteInfo.user_info && noteInfo.user_info.avatar ? noteInfo.user_info.avatar : '/static/img/default.png'" mode="aspectFill"></image>
          <view class="user-text">
            <view class="nav-user-name ohto">{{noteInfo.user_info && noteInfo.user_info.nickname ? noteInfo.user_info.nickname : '用户'}}</view>
            <view class="content-tips">{{noteInfo.create_time}} · {{noteInfo.location_name || 'IP属地'}} · 浏览 {{noteInfo.views || 0}}</view>
          </view>
        </view>
        <!-- 关注按钮 -->
        <view v-if="noteInfo.uid && noteInfo.uid != userId" 
              :class="['follow-btn', isFollowing ? 'active' : '']" 
              @tap.stop="followUser">
          {{isFollowing ? '已关注' : '＋关注'}}
        </view>
      </view>
            
      <view class="content-item">
        <text :class="['content-text', isExpanded ? '' : 'ohto2']">{{noteInfo.content}}</text>
        <view v-if="isContentOverflow && !isExpanded" class="expand-btn" @tap="toggleContent">展开</view>
        <view v-if="isExpanded" class="collapse-btn" @tap="toggleContent">收起</view>
      </view>
      
      <!-- 标签区域 -->
      <view v-if="noteInfo.topic_info && noteInfo.topic_info.length > 0 || noteInfo.goods_info || noteInfo.location_name || hasCircle()" class="content-tag">
        <!-- 位置信息 -->
        <view v-if="noteInfo.location_name" class="tag-item df" @tap.stop="openLocationClick">
          <image class="icon" style="width:32rpx;height:32rpx" src="/static/img/wz.png"></image>
          <text style="padding:0 8rpx">{{noteInfo.location_name}}</text>
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
        
        <!-- 商品标签 -->
        <view 
          v-if="noteInfo.goods_info" 
          class="tag-item df" 
          :data-url="'goods/details?id='+noteInfo.product_id" 
          @tap="navigateToFun">
          <image class="icon" :src="noteInfo.goods_info.image" mode="aspectFill"></image>
          <text>{{noteInfo.goods_info.store_name}}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="footer-box bUp">
      <view class="footer-item df">
        <!-- 完善信息提示 -->
        <view v-if="!isUser" class="footer-means df" data-url="center/means" @tap="navigateToFun">
          <text>完善账号资料后即可评论</text>
        </view>
        <!-- 评论框 -->
        <view v-else class="footer-comment ohto pl-str" data-type="0" data-idx="-1" data-i="-1" @tap="openComment">
          {{comtext ? comtext : comtips}}
        </view>
        
        <!-- 操作按钮组 -->
        <view class="df">
          <view class="footer-icon" @tap="commentPopupClick(true)">
            <image src="/static/img/pl.png"></image>
            <text>{{noteInfo.comments ? noteInfo.comments : ''}} 评论</text>
          </view>
          
          <view class="footer-icon" @tap="likeDynamic">
            <image v-if="noteInfo.is_like == 1" class="hi" src="/static/img/dz1.png"></image>
            <image v-else class="hi" src="/static/img/dz.png"></image>
            <text v-if="noteInfo.likes < 10000">{{noteInfo.likes ? noteInfo.likes : ''}} 赞</text>
            <text v-else>{{formatCount(noteInfo.likes)}} 赞</text>
          </view>
          
          <view class="footer-icon" @tap="openShare">
            <image src="/static/img/fx.png"></image>
          </view>
          

        </view>
      </view>
    </view>
    
    <!-- 评论蒙层 -->
    <view v-if="isComment" class="popup-comment-mask" @tap="closeComment"></view>
    
    <!-- 评论输入框 -->
    <comment-input 
      :show="isComment" 
      :placeholder="comtips"
      :focus="isFocus"
      ref="commentInput"
      @blur="closeComment"
      @send="handleCommentSubmit"
    ></comment-input>
    

    
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
    
    <!-- 评论弹窗 -->
    <uni-popup ref="commentPopup" type="bottom" @maskClick="commentPopupClick(false)" :safe-area="false">
      <view class="comment-box">
        <view class="comment-top df">
          <view class="top-title">{{noteInfo.comments > 0 ? '评论 ' + noteInfo.comments : '暂无评论'}}</view>
          
          <!-- 评论排序切换 -->
          <view class="top-btn df">
            <view class="btn-active" :style="{'left': cType == 0 ? '6rpx' : '74rpx'}"></view>
            <view class="btn-item" :style="{'color': cType == 0 ? '#000' : '#999'}" @tap="commentClick(0)">默认</view>
            <view class="btn-item" :style="{'color': cType == 1 ? '#000' : '#999'}" @tap="commentClick(1)">最新</view>
          </view>
          
          <!-- 关闭按钮 -->
          <view class="top-close df" @tap="commentPopupClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:18rpx;height:18rpx"></image>
          </view>
        </view>
      
        <!-- 评论列表 -->
        <scroll-view class="comment-scroll" scroll-y @scrolltolower="commentReachBottom">
          <!-- 内容详情 -->
          <view v-if="isCommentContent" class="comment-item df">
            <view class="comment-avatar" :data-url="'user/details?id='+noteInfo.uid" @tap="navigateToFun">
              <lazy-image :src="noteInfo.user_info && noteInfo.user_info.avatar ? noteInfo.user_info.avatar : '/static/img/default.png'"></lazy-image>
            </view>
            <view class="comment-info">
              <view class="comment-info-top df" :data-url="'user/details?id='+noteInfo.uid" @tap="navigateToFun">
                <view class="user-info-left">
                  <view class="zz">作者</view> 
                  {{noteInfo.user_info && noteInfo.user_info.nickname ? noteInfo.user_info.nickname : '用户'}}
                </view>
              </view>
              <view class="comment-info-content">
                <text user-select="true">{{noteInfo.content}}</text>
              </view>
              <view class="comment-info-bottom df">
                <text>{{noteInfo.create_time}} · {{noteInfo.location_name || 'IP属地'}} · 浏览 {{noteInfo.views || 0}}</text>
              </view>
            </view>
          </view>
          
          <!-- 空态 -->
          <view v-if="isEmpty" class="empty-box df">
            <image src="/static/img/empty.png"></image>
            <view class="e1">期待你的评论</view>
            <view class="e2">发条评论表达你的想法吧</view>
          </view>
          
          <!-- 评论列表 -->
          <block v-else>
            <view v-for="(item, index) in commentList" :key="index" class="comment-item df">
              <!-- 评论头像 -->
              <view class="comment-avatar" :data-url="'user/details?id='+item.uid" @tap="navigateToFun">
                <lazy-image :src="item.user_info && item.user_info.avatar ? item.user_info.avatar : '/static/img/default.png'"></lazy-image>
              </view>
              
              <!-- 评论内容 -->
              <view class="comment-info">
                <view class="comment-info-top df" :data-url="'user/details?id='+item.uid" @tap="navigateToFun">
                  <view class="user-info-left">
                    <view v-if="noteInfo.uid == item.uid" class="zz">作者</view>
                    <view v-else-if="userId == item.uid" class="wo">我</view> 
                    {{item.user_info && item.user_info.nickname ? item.user_info.nickname : '用户'}}
                  </view>
                  <!-- 点赞图标按钮 -->
                  <view v-if="!item.delete_time" class="like-icon" @tap.stop="toggleCommentLike(item.id, item.is_like)">
                    <image :src="item.is_like == 1 ? '/static/img/dz1.png' : '/static/img/dz.png'" mode="aspectFill"></image>
                    <text v-if="item.like_count > 0 || item.likes > 0">{{item.like_count || item.likes}}</text>
                  </view>
                </view>
                
                <view :class="['comment-info-content', (item.status != 5 || item.delete_time) && 'db']" @tap="openComment" 
                      data-type="1" :data-uid="item.uid" :data-cid="item.id" 
                      :data-name="item.user_info && item.user_info.nickname ? item.user_info.nickname : '用户'" :data-idx="index" data-i="-1">
                  <rich-text 
                    v-if="!item.delete_time" 
                    :nodes="parseEmojiContentForRichText(item.content)" 
                    user-select="true"
                    @itemclick="onEmojiClick"
                    class="comment-rich-text"
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
                  <view v-if="!item.delete_time" @tap="openComment" data-type="1" :data-uid="item.uid" 
                        :data-cid="item.id" :data-name="item.user_info && item.user_info.nickname ? item.user_info.nickname : '用户'" :data-idx="index" data-i="-1">
                    回复
                  </view>
                  <view v-if="userId == item.uid && item.status == 5 && !item.delete_time" 
                        @tap="delComment" :data-id="item.id" :data-idx="index" data-i="-1">
                    删除
                  </view>
                </view>
                
                <!-- 回复列表 - 直接嵌套在评论内部 -->
                <template v-if="item.replies && item.replies.length > 0">
                  <view v-for="(v, i) in sortRepliesByTime(item.replies)" :key="i" class="comment-item df">
                    <view class="comment-avatar-z" :data-url="'user/details?id='+v.uid" @tap="navigateToFun">
                      <lazy-image :src="v.user_info && v.user_info.avatar ? v.user_info.avatar : '/static/img/default.png'"></lazy-image>
                    </view>
                    
                    <view class="comment-info" style="width:calc(100% - 68rpx)">
                      <view class="comment-info-top-z df">
                        <view class="user-info-left">
                          <view v-if="noteInfo.uid == v.uid" class="zz">作者</view>
                          <view v-else-if="userId == v.uid" class="wo">我</view>
                          <view class="nn ohto" :data-url="'user/details?id='+v.uid" @tap="navigateToFun">
                            {{v.user_info && v.user_info.nickname ? v.user_info.nickname : '用户'}}
                          </view>
                          <!-- 显示回复关系 -->
                          <template v-if="v.reply_uid && v.reply_uid !== item.uid">
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
                          <text v-if="v.like_count > 0 || v.likes > 0">{{v.like_count || v.likes}}</text>
                        </view>
                      </view>
                      
                      <view :class="['comment-info-content', (v.status != 5 || v.delete_time) && 'db']" @tap="openComment" 
                            data-type="1" :data-uid="v.uid" 
                            :data-cid="item.id" 
                            :data-name="v.user_info && v.user_info.nickname ? v.user_info.nickname : '用户'" :data-idx="index" :data-i="getReplyIndex(item.replies, v.id)">
                        <rich-text 
                          v-if="!v.delete_time" 
                          :nodes="parseEmojiContentForRichText(v.content)" 
                          user-select="true"
                          @itemclick="onEmojiClick"
                          class="comment-rich-text reply-rich-text"
                        ></rich-text>
                        <text v-else class="deleted-comment">(该评论已被删除)</text>
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
                        <view v-if="!v.delete_time" @tap="openComment" data-type="1" :data-uid="v.uid" 
                              :data-cid="item.id" :data-name="v.user_info && v.user_info.nickname ? v.user_info.nickname : '用户'" :data-idx="index" :data-i="getReplyIndex(item.replies, v.id)">
                          回复
                        </view>
                        <view v-if="userId == v.uid && v.status == 5 && !v.delete_time" 
                              @tap="delComment" :data-id="v.id" :data-idx="index" :data-i="getReplyIndex(item.replies, v.id)">
                          删除
                        </view>
                      </view>
                    </view>
                  </view>
                </template>
                
                <!-- 展开更多回复 -->
                <view v-if="item.reply_count > (item.replies ? item.replies.length : 0)" class="unfold" 
                      :data-id="item.id" :data-idx="index" @tap="sonComment">
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
          
          <!-- 加载状态 -->
          <uni-load-more v-if="loadStatus != 'no-more'" :status="loadStatus"></uni-load-more>
          <view v-else class="no-more">- THE END -</view>
        </scroll-view>
      
        <!-- 评论输入框 -->
        <view class="comment-btn df" data-type="0" data-idx="-1" data-i="-1" @tap="openComment">
          <image :src="userAvatar || '/static/img/default.png'" mode="aspectFill"></image>
          <view class="pl-str ohto" style="width:calc(100% - 120rpx)">{{comtext ? comtext : comtips}}</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import lazyImage from '@/components/lazyImage/lazyImage'
import play from '@/components/play/play'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'
import SharePanel from '@/components/share/index.vue'
import CommentInput from '@/components/comment-input/comment-input.vue'
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
  name: 'VideoDetails',
  components: {
    lazyImage,
    play,
    uniLoadMore,
    SharePanel,
    CommentInput
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
    }
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      keyboardHeight: 0,
      footerHeight: 0,
      userId: 0,           // 用户ID (uid)
      userNickname: "",    // 用户昵称 (nickname)
      userAvatar: "/static/img/default.png", // 设置默认头像
      isUser: false,       // 用户是否完善资料 (根据userId和phone判断)
      isFollowing: false,  // 是否已关注动态作者
      followChecked: false, // 关注状态是否已检查
      actionInProgress: false, // 操作进行中防重复
      likeThrottling: false,   // 点赞防抖
      bgAudioStatus: false,    // 音频播放状态
      bgAudioManager: null,    // 音频管理器
      audioPlayingId: '',      // 当前播放音频ID
      audioProgress: 0,        // 音频播放进度
      currentTime: 0,          // 当前播放时间
      duration: 0,             // 音频总时长
      // 添加加载状态控制
      isLoadingDetail: false,   // 是否正在加载详情
      isLoadingComments: false, // 是否正在加载评论
      isSubmittingComment: false, // 是否正在提交评论
      isDeletingComment: false,   // 是否正在删除评论
      isLoadingReplies: false,    // 是否正在加载回复
      // 缓存相关
      commentsCache: {},          // 评论列表缓存
      commentCache: {},           // 回复列表缓存
      replyIndices: new Map(),    // 回复索引映射
      noteInfo: {
        id: 0,
        uid: 0,
        user_info: {
          uid: 0,
          nickname: "昵称加载中",
          avatar: "/static/img/default.png" // 设置默认头像
        },
        content: "内容加载中",
        type: 0,
        comments: 0,
        likes: 0,
        views: 0,
        shares: 0,
        is_like: false,
        create_time: "日期",
        location_name: "IP属地",
        latitude: "0",
        longitude: "0",
        topic_id: "",
        topic_info: [],
        product_id: 0,
        goods_info: null,
        images: [],
        video: "",
        video_cover: "",
        audio: "",
        audio_title: "",
        audio_cover: ""
      },
      isCommentContent: false,
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
      limit: 10, // 每页评论数量
      loadStatus: "loading",
      cCId: 0,
      cUId: 0,
      isComment: false,
      isFocus: false,
      comtips: "说点什么...",
      comtext: "",
      isCommentPopup: false,
      isFocusPopup: false,
      tipsTitle: "",
      isContentOverflow: false, // 内容是否超出两行
      isExpanded: false,        // 内容是否已展开
      currentImageIndex: 0,      // 当前显示的图片索引
      isShareVisible: false,        // 分享面板显示状态
      debug: true, // 是否开启调试日志
      
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
    }
  },
  async onLoad(options) {
    console.log('页面加载参数:', options);
    
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
    
    // 首先获取用户信息
    this.userInfoHandle();
    
    // 设置动态ID并获取详情
    if (options.id) {
      this.noteInfo.id = options.id;
      this.debugLog('获取到动态ID', this.noteInfo.id);
      
      // 获取动态详情
      this.dynamicDetails();
    } else {
      console.error('未提供动态ID');
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
      return;
    }
    
    // 设置底部安全区域高度
    this.safeAreaBottom = (uni.getSystemInfoSync().safeAreaInsets && uni.getSystemInfoSync().safeAreaInsets.bottom) || 0;
    
    // 计算底部高度
    this.$nextTick(() => {
      uni.createSelectorQuery().in(this)
        .select('.footer-box')
        .boundingClientRect(data => {
          if (data) {
            this.footerHeight = parseInt(data.height);
          }
        })
        .exec();
    });
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
    // 添加调试日志函数
    debugLog(...args) {
      if (this.debug) {
        console.log('[Video]', ...args);
      }
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
        
        this.debugLog('用户信息处理完成', {
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
    
    // 处理媒体数据
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
          // 如果是字符串，尝试解析JSON
          if (typeof images === 'string' && images.startsWith('[')) {
            try {
              images = JSON.parse(images);
            } catch (e) {
              images = [images];
            }
          } else if (images) {
            // 非数组且非空，转为数组
            images = [images];
          } else {
            // 为空，初始化为空数组
            images = [];
          }
        }
        
        // 处理每张图片
        this.noteInfo.images = images.map(img => {
          // 如果是对象，提取URL
          if (img && typeof img === 'object') {
            return img.url || img.src || img.path || img.image || '';
          }
          // 如果是字符串，直接返回
          return img || '';
        }).filter(url => !!url); // 过滤空URL
        
        // 确保所有图片URL都是字符串类型
        this.noteInfo.images = this.noteInfo.images.map(url => {
          return typeof url === 'string' ? url : String(url);
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
      
      // 确保视频URL存在并且是字符串类型
      if (this.noteInfo.video && typeof this.noteInfo.video === 'object') {
        // 如果video是对象，尝试获取其中的URL
        if (this.noteInfo.video.url) {
          this.noteInfo.video = this.noteInfo.video.url;
        } else if (this.noteInfo.video.src) {
          this.noteInfo.video = this.noteInfo.video.src;
        } else if (this.noteInfo.video.path) {
          this.noteInfo.video = this.noteInfo.video.path;
        }
      }
      
      // 确保视频URL存在
      if (!this.noteInfo.video && this.noteInfo.video_url) {
        this.noteInfo.video = this.noteInfo.video_url;
      }
      
      // 确保视频URL是字符串类型
      if (this.noteInfo.video && typeof this.noteInfo.video !== 'string') {
        this.noteInfo.video = String(this.noteInfo.video);
      }
      
      // 确保video_cover是字符串
      if (this.noteInfo.video_cover && typeof this.noteInfo.video_cover === 'object') {
        if (this.noteInfo.video_cover.url) {
          this.noteInfo.video_cover = this.noteInfo.video_cover.url;
        }
      }
      
      // 确保video_cover是字符串类型
      if (this.noteInfo.video_cover && typeof this.noteInfo.video_cover !== 'string') {
        this.noteInfo.video_cover = String(this.noteInfo.video_cover);
      }
    },
    
    // 处理音频数据 - 只有音频动态时才执行
    processAudioData() {
      if (!this.isAudioNote) {
        console.log('非音频动态，跳过音频数据处理');
        return;
      }
      
      console.log('处理音频数据:', this.noteInfo.audio);
      
      // 确保音频URL是字符串
      if (this.noteInfo.audio && typeof this.noteInfo.audio === 'object') {
        if (this.noteInfo.audio.url) {
          this.noteInfo.audio = this.noteInfo.audio.url;
        } else if (this.noteInfo.audio.src) {
          this.noteInfo.audio = this.noteInfo.audio.src;
        } else if (this.noteInfo.audio.path) {
          this.noteInfo.audio = this.noteInfo.audio.path;
        }
      }
      
      // 确保音频URL是字符串类型
      if (this.noteInfo.audio && typeof this.noteInfo.audio !== 'string') {
        this.noteInfo.audio = String(this.noteInfo.audio);
      }
      
      // 确保封面图存在且是字符串
      if (!this.noteInfo.audio_cover) {
        this.noteInfo.audio_cover = '/static/img/audio_default_cover.png';
      } else if (typeof this.noteInfo.audio_cover === 'object') {
        if (this.noteInfo.audio_cover.url) {
          this.noteInfo.audio_cover = this.noteInfo.audio_cover.url;
        }
      }
      
      // 确保封面是字符串类型
      if (this.noteInfo.audio_cover && typeof this.noteInfo.audio_cover !== 'string') {
        this.noteInfo.audio_cover = String(this.noteInfo.audio_cover);
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
    
    // 页面跳转
    navigateToFun(e) {
      uni.navigateTo({
        url: "/pages/" + e.currentTarget.dataset.url
      })
    },
    
    // 打开位置信息
    openLocationClick() {
      if (!this.noteInfo.latitude || !this.noteInfo.longitude) return;
      
      uni.openLocation({
        latitude: parseFloat(this.noteInfo.latitude),
        longitude: parseFloat(this.noteInfo.longitude),
        name: this.noteInfo.location_name
      })
    },
    
    // 打开分享面板
    openShare() {
      this.isShareVisible = true;
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
    
    // 点赞笔记
    likeDynamic() {
      if (this.actionInProgress) return;
      this.actionInProgress = true;
      
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
        this.opTipsPopup('操作失败，请重试');
      })
      .finally(() => {
        // 设置短时间防抖
        setTimeout(() => {
          this.actionInProgress = false;
        }, 500);
      });
    },
    
    // 关注/取消关注用户
    followUser() {
      if (!this.noteInfo.uid || this.actionInProgress) return;
      
      this.actionInProgress = true;
      
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
        this.opTipsPopup("操作失败，请重试");
      })
      .finally(() => {
        // 设置短时间防抖
        setTimeout(() => {
          this.actionInProgress = false;
        }, 500);
      });
    },
    
    // 删除笔记
    delDynamic() {
      let self = this;
      
      uni.showModal({
        content: "确认要永久删除这篇笔记吗？",
        confirmColor: "#FA5150",
        success: function(res) {
          if (res.confirm) {
            uni.showLoading({
              mask: true
            });
            
            // 使用导入的API方法
            deleteDynamic(self.noteInfo.id).then(res => {
              uni.hideLoading();
              getApp().globalData.isCenterPage = true;
              
              if (res.status === 200) {
                self.opTipsPopup("删除成功", true);
              } else {
                self.opTipsPopup(res.msg || "删除失败");
              }
            }).catch(err => {
              uni.hideLoading();
              self.opTipsPopup("删除失败");
            });
          }
        }
      });
    },
    
    // 举报笔记
    reasonClick(reason) {
      let self = this;
      
      uni.showLoading({
        mask: true
      });
      
      // 获取合适的图片URL
      let imageUrl = '';
      if (self.noteInfo.type == 2 && self.noteInfo.images && self.noteInfo.images.length > 0) {
        imageUrl = self.noteInfo.images[0].url;
      } else if (self.noteInfo.type == 3 && self.noteInfo.video && self.noteInfo.video_cover) {
        imageUrl = self.noteInfo.video_cover;
      } else if (self.noteInfo.type == 4 && self.noteInfo.audio && self.noteInfo.audio.cover) {
        imageUrl = self.noteInfo.audio.cover;
      }
      
      // 使用新的API调用方式
      reportDynamic(
        reason,
        self.noteInfo.id,
        self.noteInfo.uid,
        self.noteInfo.content,
        imageUrl
      ).then(res => {
        uni.hideLoading();
        self.opTipsPopup(res.msg || "举报成功");
        self.menuPopupClick(false);
      }).catch(err => {
        uni.hideLoading();
        self.opTipsPopup('举报失败');
      });
    },
    
    // 分享设置
    onShareAppMessage: function() {
      return {
        title: this.noteInfo.content,
        imageUrl: this.getShareImageUrl(),
        path: "/pages/note/video?id=" + this.noteInfo.id
      };
    },
    
    // 分享到朋友圈
    onShareTimeline() {
      return {
        title: this.noteInfo.content,
        imageUrl: this.getShareImageUrl(),
        query: "id=" + this.noteInfo.id
      };
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
    
    // 格式化数字显示
    formatCount(count) {
      if (!count || count < 1000) return count;
      if (count < 10000) return (count / 1000).toFixed(1) + 'k';
      return (count / 10000).toFixed(1) + 'w';
    },
    
    // 格式化时间
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00';
      
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      
      // 准备请求参数 - 与details.vue保持一致
      const params = {
        type: 0, // 动态评论类型
        page: this.page || 1,
        sort_type: this.cType || 0 // 0-默认，1-最新
      };
      
      this.debugLog('获取评论列表', {
        动态ID: this.noteInfo.id,
        页码: params.page,
        排序方式: params.sort_type === 0 ? '默认' : '最新'
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
            
            // 处理评论列表数据 - 与details.vue保持一致的字段名称
            const processedList = list.map(item => {
              // 确保用户信息字段存在
              const avatar = item.avatar || 
                (item.user_info && item.user_info.avatar) || 
                '/static/img/default.png';
                
              const nickname = item.nickname || 
                (item.user_info && item.user_info.nickname) || 
                '用户';
                
              const uid = item.uid || 
                (item.user_info && item.user_info.uid) || 
                0;
              
              return {
                ...item,
                // 确保基本字段存在
                id: item.id || 0,
                uid: uid,
                nickname: nickname,
                avatar: avatar,
                // 保存原始用户信息对象，同时确保字段一致性
                user_info: {
                  uid: uid,
                  nickname: nickname,
                  avatar: avatar
                },
                reply_count: parseInt(item.reply_count) || 0,
                like_count: parseInt(item.like_count) || parseInt(item.likes) || 0,
                likes: parseInt(item.likes) || parseInt(item.like_count) || 0,
                is_like: !!item.is_like,
                create_time: item.create_time || item.add_time || '',
                content: item.content || '',
                image: item.image || '',
                status: item.status || 5,
                delete_time: item.delete_time || null,
                // 处理回复列表
                replies: Array.isArray(item.replies) ? item.replies.map(reply => {
                  // 确保回复的用户信息字段存在
                  const replyAvatar = reply.avatar || 
                    (reply.user_info && reply.user_info.avatar) || 
                    '/static/img/default.png';
                    
                  const replyNickname = reply.nickname || 
                    (reply.user_info && reply.user_info.nickname) || 
                    '用户';
                    
                  const replyUid = reply.uid || 
                    (reply.user_info && reply.user_info.uid) || 
                    0;
                  
                  return {
                    ...reply,
                    id: reply.id || 0,
                    uid: replyUid,
                    nickname: replyNickname,
                    avatar: replyAvatar,
                    user_info: {
                      uid: replyUid,
                      nickname: replyNickname,
                      avatar: replyAvatar
                    },
                    reply_uid: reply.reply_uid || reply.to_uid || 0,
                    reply_nickname: reply.reply_nickname || reply.to_nickname || '',
                    like_count: parseInt(reply.like_count) || parseInt(reply.likes) || 0,
                    likes: parseInt(reply.likes) || parseInt(reply.like_count) || 0,
                    is_like: !!reply.is_like,
                    create_time: reply.create_time || reply.add_time || '',
                    content: reply.content || '',
                    image: reply.image || '',
                    status: reply.status || 5,
                    delete_time: reply.delete_time || null
                  };
                }) : [],
                // 添加回复分页相关字段
                replyPage: 1,
                has_more_replies: item.reply_count > (item.replies ? item.replies.length : 0)
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
            
            // 更新回复索引映射
            this.updateReplyIndices();
            
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
          uni.showToast({
            title: '获取评论失败',
            icon: 'none'
          });
        });
    },
    
    // 切换评论排序
    commentClick(type) {
      if (!this.isThrottling || this.actionInProgress) return;
      
      // 如果切换到相同类型，不重复加载
      if (this.cType === type) return;
      
      this.isThrottling = false;
      this.cType = type;
      this.page = 1;
      this.loadStatus = "loading";
      
      // 重置评论列表
      this.commentList = [];
      this.isEmpty = false;
      
      this.getCommentList();
      
      // 设置延时，允许在一段时间后再次切换
      setTimeout(() => {
        this.isThrottling = true;
      }, 500);
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
    
    // 处理评论提交
    handleCommentSubmit(commentData) {
      if (this.isSubmittingComment) return;
      this.isSubmittingComment = true;
      
      // 获取评论内容和图片
      const content = commentData.content;
      const image = commentData.image;
      
      // 如果没有内容和图片，不提交
      if (!content && !image) {
        this.isSubmittingComment = false;
        return this.opTipsPopup("表达你的态度再评论吧！");
      }
      
      // 显示加载状态
      uni.showLoading({
        title: '发布中',
        mask: true
      });
      
      // 先关闭评论框，避免延迟
      this.isComment = false;
      this.isFocus = false;
      this.showEmoji = false;
      
      // 准备评论数据
      const params = {
        dynamic_id: this.noteInfo.id,
        content: content,
        pid: this.cCId || 0,
        to_uid: this.cUId || 0
      };
      
      // 如果有图片，添加到参数
      if (image) {
        params.image = image;
      }
      
      // 提交评论
      addComment(params)
        .then(res => {
          uni.hideLoading();
          
          if (res.status === 200) {
            // 处理评论数据
            const commentData = res.data || this.createDefaultCommentData(content, image);
            
            // 更新评论计数和列表
            this.processCommentSuccess(commentData);
            
            // 显示成功提示
            this.opTipsPopup('评论成功');
            
            // 如果评论列表为空，刷新页面
            if (this.isEmpty) {
              this.isEmpty = false;
            }
          } else {
            this.opTipsPopup(res.msg || '评论失败');
          }
        })
        .catch(err => {
          uni.hideLoading();
          this.opTipsPopup('评论失败，请重试');
          console.error('评论请求异常', err);
        })
        .finally(() => {
          // 重置状态
          this.isSubmittingComment = false;
          
          // 重置评论目标信息
          this.cCId = 0;
          this.cUId = 0;
          this.comtips = "说点什么...";
          this.comtext = "";
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
    
    // 删除评论
    delComment(e) {
      let self = this;
      let idx = e.currentTarget.dataset.idx;
      let i = e.currentTarget.dataset.i;
      let commentId = e.currentTarget.dataset.id;
      
      // 防止重复点击
      if (self.isDeletingComment) return;
      
      uni.showModal({
        content: "确定要永久删除该评论吗？",
        confirmColor: "#FA5150",
        success: function(res) {
          if (res.confirm) {
            self.isDeletingComment = true;
            
            uni.showLoading({
              title: '删除中',
              mask: true
            });
            
            // 使用新的删除评论API接口
            deleteComment(commentId).then(res => {
              uni.hideLoading();
              self.isDeletingComment = false;
              
              if (res.status === 200) {
                // 减少评论总数
                if (self.noteInfo.comments > 0) {
                  self.noteInfo.comments--;
                }
                
                // 更新评论状态
                if (i == -1) {
                  // 主评论被删除
                  self.commentList[idx].delete_time = new Date().toISOString(); // 设置删除时间
                  self.commentList[idx].status = 0; // 设置删除状态
                } else {
                  // 确保replies数组存在
                  if (self.commentList[idx].replies && self.commentList[idx].replies.length > i) {
                    self.commentList[idx].replies[i].delete_time = new Date().toISOString(); // 设置删除时间
                    self.commentList[idx].replies[i].status = 0; // 设置删除状态
                    
                    // 子评论被删除，也要减少对应的计数
                    if (self.commentList[idx].reply_count > 0) {
                      // 减少回复计数
                      self.commentList[idx].reply_count--;
                    }
                  }
                }
                self.opTipsPopup("删除成功");
              } else {
                self.opTipsPopup(res.msg || "删除失败");
              }
            }).catch(err => {
              uni.hideLoading();
              self.isDeletingComment = false;
              self.opTipsPopup("删除失败");
            });
          }
        }
      });
    },
    
    // 点赞/取消点赞评论
    toggleCommentLike(commentId, isCurrentlyLiked) {
      if (!this.isUser) {
        this.opTipsPopup("请先完善账号资料");
        return;
      }
      
      // 防止频繁点击
      if (this.likeThrottling) return;
      this.likeThrottling = true;
      
      // 500ms后恢复
      setTimeout(() => {
        this.likeThrottling = false;
      }, 500);
      
      // 将布尔值转换为0/1格式
      const currentLikeState = isCurrentlyLiked ? 1 : 0;
      const newLikeState = currentLikeState ? 0 : 1;
      
      // 优先更新UI状态，让用户感觉响应迅速
      // 遍历更新评论列表中的点赞状态
      for (let i = 0; i < this.commentList.length; i++) {
        const comment = this.commentList[i];
        
        // 更新主评论
        if (comment.id === commentId) {
          comment.is_like = newLikeState;
          if (newLikeState) {
            // 处理不同的字段名称
            if (comment.like_count !== undefined) {
              comment.like_count = (comment.like_count || 0) + 1;
            }
            if (comment.likes !== undefined) {
              comment.likes = (comment.likes || 0) + 1;
            }
          } else {
            // 处理不同的字段名称
            if (comment.like_count !== undefined && comment.like_count > 0) {
              comment.like_count--;
            }
            if (comment.likes !== undefined && comment.likes > 0) {
              comment.likes--;
            }
          }
          break; // 找到了主评论，可以跳出循环
        }
        
        // 更新回复评论
        if (comment.replies && comment.replies.length > 0) {
          for (let j = 0; j < comment.replies.length; j++) {
            const reply = comment.replies[j];
            if (reply.id === commentId) {
              reply.is_like = newLikeState;
              if (newLikeState) {
                // 处理不同的字段名称
                if (reply.like_count !== undefined) {
                  reply.like_count = (reply.like_count || 0) + 1;
                }
                if (reply.likes !== undefined) {
                  reply.likes = (reply.likes || 0) + 1;
                }
              } else {
                // 处理不同的字段名称
                if (reply.like_count !== undefined && reply.like_count > 0) {
                  reply.like_count--;
                }
                if (reply.likes !== undefined && reply.likes > 0) {
                  reply.likes--;
                }
              }
              break; // 找到了回复，可以跳出内部循环
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
            this.restoreCommentLikeStatus(commentId, currentLikeState);
            this.opTipsPopup("操作失败，请重试");
          });
      } else {
        // 如果当前未点赞，则点赞
        likeComment(commentId)
          .then(res => {
            // 点赞成功，不需要操作
          })
          .catch(err => {
            // 恢复状态
            this.restoreCommentLikeStatus(commentId, currentLikeState);
            this.opTipsPopup("操作失败，请重试");
          });
      }
    },
    
    // 恢复评论点赞状态（操作失败时）
    restoreCommentLikeStatus(commentId, originalLikeState) {
      // 操作失败时恢复状态
      for (let i = 0; i < this.commentList.length; i++) {
        const comment = this.commentList[i];
        
        // 还原主评论
        if (comment.id === commentId) {
          comment.is_like = originalLikeState;
          if (originalLikeState === 1) {
            // 处理不同的字段名称
            if (comment.like_count !== undefined && comment.like_count > 0) {
              comment.like_count--;
            }
            if (comment.likes !== undefined && comment.likes > 0) {
              comment.likes--;
            }
          } else {
            // 处理不同的字段名称
            if (comment.like_count !== undefined) {
              comment.like_count = (comment.like_count || 0) + 1;
            }
            if (comment.likes !== undefined) {
              comment.likes = (comment.likes || 0) + 1;
            }
          }
          break; // 找到后跳出循环
        }
        
        // 还原回复评论
        if (comment.replies && comment.replies.length > 0) {
          for (let j = 0; j < comment.replies.length; j++) {
            const reply = comment.replies[j];
            if (reply.id === commentId) {
              reply.is_like = originalLikeState;
              if (originalLikeState === 1) {
                // 处理不同的字段名称
                if (reply.like_count !== undefined && reply.like_count > 0) {
                  reply.like_count--;
                }
                if (reply.likes !== undefined && reply.likes > 0) {
                  reply.likes--;
                }
              } else {
                // 处理不同的字段名称
                if (reply.like_count !== undefined) {
                  reply.like_count = (reply.like_count || 0) + 1;
                }
                if (reply.likes !== undefined) {
                  reply.likes = (reply.likes || 0) + 1;
                }
              }
              break; // 找到后跳出循环
            }
          }
        }
      }
    },
    
    // 递归更新回复索引映射
    updateReplyIndices() {
      if (!this.commentList || !this.commentList.length) return;
      
      this.replyIndices = new Map();
      
      this.commentList.forEach((comment, commentIndex) => {
        if (comment.replies && comment.replies.length) {
          comment.replies.forEach((reply, replyIndex) => {
            this.replyIndices.set(reply.id, replyIndex);
          });
        }
      });
      
      this.debugLog('更新回复索引映射完成', {
        索引数量: this.replyIndices.size
      });
    },
    
    // 加载评论回复 - 与details.vue保持一致
    sonComment(e) {
      let id = parseInt(e.currentTarget.dataset.id) || 0;
      let idx = parseInt(e.currentTarget.dataset.idx) || 0;
      
      this.debugLog('加载评论回复:', {
        commentId: id,
        commentIndex: idx
      });
      
      // 防止重复点击
      if (this.isLoadingReplies) return;
      this.isLoadingReplies = true;
      
      // 显示加载中状态
      const commentItem = this.commentList[idx];
      if (commentItem) {
        this.$set(commentItem, 'loading_replies', true);
      }
      
      // 获取当前评论的回复页码
      const currentPage = parseInt(commentItem.replyPage) || 1;
      
      // 生成缓存键
      const cacheKey = `replies_${id}_${currentPage}`;
      
      // 检查缓存
      if (this.commentCache && this.commentCache[cacheKey]) {
        this.debugLog('使用缓存中的回复数据');
        this.handleAllRepliesData(this.commentCache[cacheKey], idx, currentPage);
        return;
      }
      
      // 请求参数 - 与details.vue保持一致
      const params = {
        parent_id: id,           // 父评论ID
        page: currentPage,       // 页码
        limit: 10,               // 每页数量
        sort_type: 1             // 排序类型：1=最新(创建时间)
      };
      
      this.debugLog('回复请求参数:', params);
      
      // 发起请求
      getCommentReplies(params)
        .then(res => {
          if (res.status === 200) {
            this.debugLog('获取到回复数据:', res.data);
            
            // 缓存结果
            if (!this.commentCache) this.commentCache = {};
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
          this.debugLog('获取回复失败:', err);
          
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
    
    // 处理回复数据（分页方式）- 与details.vue保持一致
    handleAllRepliesData(data, idx, page) {
      if (this.commentList[idx]) {
        const commentItem = this.commentList[idx];
        
        // 处理不同的数据结构：有些API返回data.list，有些直接返回data作为列表
        let replies = [];
        if (data.list && Array.isArray(data.list)) {
          replies = data.list;
        } else if (Array.isArray(data)) {
          replies = data;
        } else if (data.data && Array.isArray(data.data)) {
          replies = data.data;
        } else {
          this.debugLog('无法识别的回复数据结构', data);
          replies = [];
        }
        
        this.debugLog('获取到回复数据:', replies);
        
        // 标准化回复数据
        replies = replies.map(reply => {
          // 确保回复的用户信息字段存在
          const replyAvatar = reply.avatar || 
            (reply.user_info && reply.user_info.avatar) || 
            '/static/img/default.png';
            
          const replyNickname = reply.nickname || 
            (reply.user_info && reply.user_info.nickname) || 
            '用户';
            
          const replyUid = reply.uid || 
            (reply.user_info && reply.user_info.uid) || 
            0;
          
          return {
            ...reply,
            id: reply.id || 0,
            uid: replyUid,
            nickname: replyNickname,
            avatar: replyAvatar,
            user_info: {
              uid: replyUid,
              nickname: replyNickname,
              avatar: replyAvatar
            },
            reply_uid: reply.reply_uid || reply.to_uid || 0,
            reply_nickname: reply.reply_nickname || reply.to_nickname || '',
            like_count: parseInt(reply.like_count) || parseInt(reply.likes) || 0,
            likes: parseInt(reply.likes) || parseInt(reply.like_count) || 0,
            is_like: !!reply.is_like,
            create_time: reply.create_time || reply.add_time || '',
            content: reply.content || '',
            image: reply.image || '',
            status: reply.status || 5,
            delete_time: reply.delete_time || null
          };
        });
        
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
        
        // 获取回复总数
        let replyCount = 0;
        if (data.count !== undefined) {
          replyCount = parseInt(data.count) || 0;
        } else if (data.total !== undefined) {
          replyCount = parseInt(data.total) || 0;
        } else {
          replyCount = commentItem.reply_count || 0;
        }
        
        // 标记是否有更多回复
        // 如果已加载的回复数量等于或超过总回复数，设置为无更多回复
        const currentLoadedCount = commentItem.replies ? commentItem.replies.length : 0;
        
        // 判断是否已加载全部回复
        const hasNoMoreReplies = replies.length < 10 || currentLoadedCount >= replyCount;
        this.$set(commentItem, 'has_more_replies', !hasNoMoreReplies);
        
        // 更新总回复数
        this.$set(commentItem, 'reply_count', Math.max(replyCount, currentLoadedCount));
        
        // 更新回复索引映射
        this.updateReplyIndices();
        
        // 移除加载状态
        this.$set(commentItem, 'loading_replies', false);
        this.isLoadingReplies = false;
      }
    },
    
    // 评论加载更多 - 优化版本
    commentReachBottom() {
      // 防止重复触发
      if (this.isLoadingComments) {
        this.debugLog('正在加载评论，跳过触底加载');
        return;
      }
      
      if (!this.isEmpty && this.commentList.length && this.loadStatus !== "no-more") {
        this.debugLog('触底加载更多评论', {
          当前页码: this.page,
          评论总数: this.commentList.length
        });
        
        this.page = this.page + 1;
        this.loadStatus = "loading";
        this.getCommentList();
      } else {
        this.debugLog('无更多评论可加载', {
          isEmpty: this.isEmpty,
          评论数量: this.commentList.length,
          loadStatus: this.loadStatus
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
      if (direction === 'down' && !this.actionInProgress && 
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
    
    // 音频进度变化
    onAudioProgressChange(e) {
      // 确保是音频类型才处理进度变化
      if (!this.isAudioNote) {
        console.log('非音频动态，不处理音频进度变化');
        return;
      }
      
      if (!this.bgAudioManager || !this.duration) return;
      
      const seekTime = (e.detail.value / 100) * this.duration;
      this.bgAudioManager.seek(seekTime);
    },
    
    // 格式化时间显示
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00';
      
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      
      // 准备请求参数 - 与details.vue保持一致
      const params = {
        type: 0, // 动态评论类型
        page: this.page || 1,
        sort_type: this.cType || 0 // 0-默认，1-最新
      };
      
      this.debugLog('获取评论列表', {
        动态ID: this.noteInfo.id,
        页码: params.page,
        排序方式: params.sort_type === 0 ? '默认' : '最新'
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
            
            // 处理评论列表数据 - 与details.vue保持一致的字段名称
            const processedList = list.map(item => {
              // 确保用户信息字段存在
              const avatar = item.avatar || 
                (item.user_info && item.user_info.avatar) || 
                '/static/img/default.png';
                
              const nickname = item.nickname || 
                (item.user_info && item.user_info.nickname) || 
                '用户';
                
              const uid = item.uid || 
                (item.user_info && item.user_info.uid) || 
                0;
              
              return {
                ...item,
                // 确保基本字段存在
                id: item.id || 0,
                uid: uid,
                nickname: nickname,
                avatar: avatar,
                // 保存原始用户信息对象，同时确保字段一致性
                user_info: {
                  uid: uid,
                  nickname: nickname,
                  avatar: avatar
                },
                reply_count: parseInt(item.reply_count) || 0,
                like_count: parseInt(item.like_count) || parseInt(item.likes) || 0,
                likes: parseInt(item.likes) || parseInt(item.like_count) || 0,
                is_like: !!item.is_like,
                create_time: item.create_time || item.add_time || '',
                content: item.content || '',
                image: item.image || '',
                status: item.status || 5,
                delete_time: item.delete_time || null,
                // 处理回复列表
                replies: Array.isArray(item.replies) ? item.replies.map(reply => {
                  // 确保回复的用户信息字段存在
                  const replyAvatar = reply.avatar || 
                    (reply.user_info && reply.user_info.avatar) || 
                    '/static/img/default.png';
                    
                  const replyNickname = reply.nickname || 
                    (reply.user_info && reply.user_info.nickname) || 
                    '用户';
                    
                  const replyUid = reply.uid || 
                    (reply.user_info && reply.user_info.uid) || 
                    0;
                  
                  return {
                    ...reply,
                    id: reply.id || 0,
                    uid: replyUid,
                    nickname: replyNickname,
                    avatar: replyAvatar,
                    user_info: {
                      uid: replyUid,
                      nickname: replyNickname,
                      avatar: replyAvatar
                    },
                    reply_uid: reply.reply_uid || reply.to_uid || 0,
                    reply_nickname: reply.reply_nickname || reply.to_nickname || '',
                    like_count: parseInt(reply.like_count) || parseInt(reply.likes) || 0,
                    likes: parseInt(reply.likes) || parseInt(reply.like_count) || 0,
                    is_like: !!reply.is_like,
                    create_time: reply.create_time || reply.add_time || '',
                    content: reply.content || '',
                    image: reply.image || '',
                    status: reply.status || 5,
                    delete_time: reply.delete_time || null
                  };
                }) : [],
                // 添加回复分页相关字段
                replyPage: 1,
                has_more_replies: item.reply_count > (item.replies ? item.replies.length : 0)
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
            
            // 更新回复索引映射
            this.updateReplyIndices();
            
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
          uni.showToast({
            title: '获取评论失败',
            icon: 'none'
          });
        });
    },
    
    // 切换评论排序
    commentClick(type) {
      if (!this.isThrottling || this.actionInProgress) return;
      
      // 如果切换到相同类型，不重复加载
      if (this.cType === type) return;
      
      this.isThrottling = false;
      this.cType = type;
      this.page = 1;
      this.loadStatus = "loading";
      
      // 重置评论列表
      this.commentList = [];
      this.isEmpty = false;
      
      this.getCommentList();
      
      // 设置延时，允许在一段时间后再次切换
      setTimeout(() => {
        this.isThrottling = true;
      }, 500);
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
    
    // 处理评论提交
    handleCommentSubmit(commentData) {
      if (this.isSubmittingComment) return;
      this.isSubmittingComment = true;
      
      // 获取评论内容和图片
      const content = commentData.content;
      const image = commentData.image;
      
      // 如果没有内容和图片，不提交
      if (!content && !image) {
        this.isSubmittingComment = false;
        return this.opTipsPopup("表达你的态度再评论吧！");
      }
      
      // 显示加载状态
      uni.showLoading({
        title: '发布中',
        mask: true
      });
      
      // 先关闭评论框，避免延迟
      this.isComment = false;
      this.isFocus = false;
      this.showEmoji = false;
      
      // 准备评论数据
      const params = {
        dynamic_id: this.noteInfo.id,
        content: content,
        pid: this.cCId || 0,
        to_uid: this.cUId || 0
      };
      
      // 如果有图片，添加到参数
      if (image) {
        params.image = image;
      }
      
      // 提交评论
      addComment(params)
        .then(res => {
          uni.hideLoading();
          
          if (res.status === 200) {
            // 处理评论数据
            const commentData = res.data || this.createDefaultCommentData(content, image);
            
            // 更新评论计数和列表
            this.processCommentSuccess(commentData);
            
            // 显示成功提示
            this.opTipsPopup('评论成功');
            
            // 如果评论列表为空，刷新页面
            if (this.isEmpty) {
              this.isEmpty = false;
            }
          } else {
            this.opTipsPopup(res.msg || '评论失败');
          }
        })
        .catch(err => {
          uni.hideLoading();
          this.opTipsPopup('评论失败，请重试');
          console.error('评论请求异常', err);
        })
        .finally(() => {
          // 重置状态
          this.isSubmittingComment = false;
          
          // 重置评论目标信息
          this.cCId = 0;
          this.cUId = 0;
          this.comtips = "说点什么...";
          this.comtext = "";
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
    
    // 删除评论
    delComment(e) {
      let self = this;
      let idx = e.currentTarget.dataset.idx;
      let i = e.currentTarget.dataset.i;
      let commentId = e.currentTarget.dataset.id;
      
      // 防止重复点击
      if (self.isDeletingComment) return;
      
      uni.showModal({
        content: "确定要永久删除该评论吗？",
        confirmColor: "#FA5150",
        success: function(res) {
          if (res.confirm) {
            self.isDeletingComment = true;
            
            uni.showLoading({
              title: '删除中',
              mask: true
            });
            
            // 使用新的删除评论API接口
            deleteComment(commentId).then(res => {
              uni.hideLoading();
              self.isDeletingComment = false;
              
              if (res.status === 200) {
                // 减少评论总数
                if (self.noteInfo.comments > 0) {
                  self.noteInfo.comments--;
                }
                
                // 更新评论状态
                if (i == -1) {
                  // 主评论被删除
                  self.commentList[idx].delete_time = new Date().toISOString(); // 设置删除时间
                  self.commentList[idx].status = 0; // 设置删除状态
                } else {
                  // 确保replies数组存在
                  if (self.commentList[idx].replies && self.commentList[idx].replies.length > i) {
                    self.commentList[idx].replies[i].delete_time = new Date().toISOString(); // 设置删除时间
                    self.commentList[idx].replies[i].status = 0; // 设置删除状态
                    
                    // 子评论被删除，也要减少对应的计数
                    if (self.commentList[idx].reply_count > 0) {
                      // 减少回复计数
                      self.commentList[idx].reply_count--;
                    }
                  }
                }
                self.opTipsPopup("删除成功");
              } else {
                self.opTipsPopup(res.msg || "删除失败");
              }
            }).catch(err => {
              uni.hideLoading();
              self.isDeletingComment = false;
              self.opTipsPopup("删除失败");
            });
          }
        }
      });
    },
    
    // 点赞/取消点赞评论
    toggleCommentLike(commentId, isCurrentlyLiked) {
      if (!this.isUser) {
        this.opTipsPopup("请先完善账号资料");
        return;
      }
      
      // 防止频繁点击
      if (this.likeThrottling) return;
      this.likeThrottling = true;
      
      // 500ms后恢复
      setTimeout(() => {
        this.likeThrottling = false;
      }, 500);
      
      // 将布尔值转换为0/1格式
      const currentLikeState = isCurrentlyLiked ? 1 : 0;
      const newLikeState = currentLikeState ? 0 : 1;
      
      // 优先更新UI状态，让用户感觉响应迅速
      // 遍历更新评论列表中的点赞状态
      for (let i = 0; i < this.commentList.length; i++) {
        const comment = this.commentList[i];
        
        // 更新主评论
        if (comment.id === commentId) {
          comment.is_like = newLikeState;
          if (newLikeState) {
            // 处理不同的字段名称
            if (comment.like_count !== undefined) {
              comment.like_count = (comment.like_count || 0) + 1;
            }
            if (comment.likes !== undefined) {
              comment.likes = (comment.likes || 0) + 1;
            }
          } else {
            // 处理不同的字段名称
            if (comment.like_count !== undefined && comment.like_count > 0) {
              comment.like_count--;
            }
            if (comment.likes !== undefined && comment.likes > 0) {
              comment.likes--;
            }
          }
          break; // 找到了主评论，可以跳出循环
        }
        
        // 更新回复评论
        if (comment.replies && comment.replies.length > 0) {
          for (let j = 0; j < comment.replies.length; j++) {
            const reply = comment.replies[j];
            if (reply.id === commentId) {
              reply.is_like = newLikeState;
              if (newLikeState) {
                // 处理不同的字段名称
                if (reply.like_count !== undefined) {
                  reply.like_count = (reply.like_count || 0) + 1;
                }
                if (reply.likes !== undefined) {
                  reply.likes = (reply.likes || 0) + 1;
                }
              } else {
                // 处理不同的字段名称
                if (reply.like_count !== undefined && reply.like_count > 0) {
                  reply.like_count--;
                }
                if (reply.likes !== undefined && reply.likes > 0) {
                  reply.likes--;
                }
              }
              break; // 找到了回复，可以跳出内部循环
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
            this.restoreCommentLikeStatus(commentId, currentLikeState);
            this.opTipsPopup("操作失败，请重试");
          });
      } else {
        // 如果当前未点赞，则点赞
        likeComment(commentId)
          .then(res => {
            // 点赞成功，不需要操作
          })
          .catch(err => {
            // 恢复状态
            this.restoreCommentLikeStatus(commentId, currentLikeState);
            this.opTipsPopup("操作失败，请重试");
          });
      }
    },
    
    // 恢复评论点赞状态（操作失败时）
    restoreCommentLikeStatus(commentId, originalLikeState) {
      // 操作失败时恢复状态
      for (let i = 0; i < this.commentList.length; i++) {
        const comment = this.commentList[i];
        
        // 还原主评论
        if (comment.id === commentId) {
          comment.is_like = originalLikeState;
          if (originalLikeState === 1) {
            // 处理不同的字段名称
            if (comment.like_count !== undefined && comment.like_count > 0) {
              comment.like_count--;
            }
            if (comment.likes !== undefined && comment.likes > 0) {
              comment.likes--;
            }
          } else {
            // 处理不同的字段名称
            if (comment.like_count !== undefined) {
              comment.like_count = (comment.like_count || 0) + 1;
            }
            if (comment.likes !== undefined) {
              comment.likes = (comment.likes || 0) + 1;
            }
          }
          break; // 找到后跳出循环
        }
        
        // 还原回复评论
        if (comment.replies && comment.replies.length > 0) {
          for (let j = 0; j < comment.replies.length; j++) {
            const reply = comment.replies[j];
            if (reply.id === commentId) {
              reply.is_like = originalLikeState;
              if (originalLikeState === 1) {
                // 处理不同的字段名称
                if (reply.like_count !== undefined && reply.like_count > 0) {
                  reply.like_count--;
                }
                if (reply.likes !== undefined && reply.likes > 0) {
                  reply.likes--;
                }
              } else {
                // 处理不同的字段名称
                if (reply.like_count !== undefined) {
                  reply.like_count = (reply.like_count || 0) + 1;
                }
                if (reply.likes !== undefined) {
                  reply.likes = (reply.likes || 0) + 1;
                }
              }
              break; // 找到后跳出循环
            }
          }
        }
      }
    },
    
    // 递归更新回复索引映射
    updateReplyIndices() {
      if (!this.commentList || !this.commentList.length) return;
      
      this.replyIndices = new Map();
      
      this.commentList.forEach((comment, commentIndex) => {
        if (comment.replies && comment.replies.length) {
          comment.replies.forEach((reply, replyIndex) => {
            this.replyIndices.set(reply.id, replyIndex);
          });
        }
      });
      
      this.debugLog('更新回复索引映射完成', {
        索引数量: this.replyIndices.size
      });
    },
    
    // 加载评论回复 - 与details.vue保持一致
    sonComment(e) {
      let id = parseInt(e.currentTarget.dataset.id) || 0;
      let idx = parseInt(e.currentTarget.dataset.idx) || 0;
      
      this.debugLog('加载评论回复:', {
        commentId: id,
        commentIndex: idx
      });
      
      // 防止重复点击
      if (this.isLoadingReplies) return;
      this.isLoadingReplies = true;
      
      // 显示加载中状态
      const commentItem = this.commentList[idx];
      if (commentItem) {
        this.$set(commentItem, 'loading_replies', true);
      }
      
      // 获取当前评论的回复页码
      const currentPage = parseInt(commentItem.replyPage) || 1;
      
      // 生成缓存键
      const cacheKey = `replies_${id}_${currentPage}`;
      
      // 检查缓存
      if (this.commentCache && this.commentCache[cacheKey]) {
        this.debugLog('使用缓存中的回复数据');
        this.handleAllRepliesData(this.commentCache[cacheKey], idx, currentPage);
        return;
      }
      
      // 请求参数 - 与details.vue保持一致
      const params = {
        parent_id: id,           // 父评论ID
        page: currentPage,       // 页码
        limit: 10,               // 每页数量
        sort_type: 1             // 排序类型：1=最新(创建时间)
      };
      
      this.debugLog('回复请求参数:', params);
      
      // 发起请求
      getCommentReplies(params)
        .then(res => {
          if (res.status === 200) {
            this.debugLog('获取到回复数据:', res.data);
            
            // 缓存结果
            if (!this.commentCache) this.commentCache = {};
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
          this.debugLog('获取回复失败:', err);
          
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
    
    // 处理回复数据（分页方式）- 与details.vue保持一致
    handleAllRepliesData(data, idx, page) {
      if (this.commentList[idx]) {
        const commentItem = this.commentList[idx];
        
        // 处理不同的数据结构：有些API返回data.list，有些直接返回data作为列表
        let replies = [];
        if (data.list && Array.isArray(data.list)) {
          replies = data.list;
        } else if (Array.isArray(data)) {
          replies = data;
        } else if (data.data && Array.isArray(data.data)) {
          replies = data.data;
        } else {
          this.debugLog('无法识别的回复数据结构', data);
          replies = [];
        }
        
        this.debugLog('获取到回复数据:', replies);
        
        // 标准化回复数据
        replies = replies.map(reply => {
          // 确保回复的用户信息字段存在
          const replyAvatar = reply.avatar || 
            (reply.user_info && reply.user_info.avatar) || 
            '/static/img/default.png';
            
          const replyNickname = reply.nickname || 
            (reply.user_info && reply.user_info.nickname) || 
            '用户';
            
          const replyUid = reply.uid || 
            (reply.user_info && reply.user_info.uid) || 
            0;
          
          return {
            ...reply,
            id: reply.id || 0,
            uid: replyUid,
            nickname: replyNickname,
            avatar: replyAvatar,
            user_info: {
              uid: replyUid,
              nickname: replyNickname,
              avatar: replyAvatar
            },
            reply_uid: reply.reply_uid || reply.to_uid || 0,
            reply_nickname: reply.reply_nickname || reply.to_nickname || '',
            like_count: parseInt(reply.like_count) || parseInt(reply.likes) || 0,
            likes: parseInt(reply.likes) || parseInt(reply.like_count) || 0,
            is_like: !!reply.is_like,
            create_time: reply.create_time || reply.add_time || '',
            content: reply.content || '',
            image: reply.image || '',
            status: reply.status || 5,
            delete_time: reply.delete_time || null
          };
        });
        
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
        
        // 获取回复总数
        let replyCount = 0;
        if (data.count !== undefined) {
          replyCount = parseInt(data.count) || 0;
        } else if (data.total !== undefined) {
          replyCount = parseInt(data.total) || 0;
        } else {
          replyCount = commentItem.reply_count || 0;
        }
        
        // 标记是否有更多回复
        // 如果已加载的回复数量等于或超过总回复数，设置为无更多回复
        const currentLoadedCount = commentItem.replies ? commentItem.replies.length : 0;
        
        // 判断是否已加载全部回复
        const hasNoMoreReplies = replies.length < 10 || currentLoadedCount >= replyCount;
        this.$set(commentItem, 'has_more_replies', !hasNoMoreReplies);
        
        // 更新总回复数
        this.$set(commentItem, 'reply_count', Math.max(replyCount, currentLoadedCount));
        
        // 更新回复索引映射
        this.updateReplyIndices();
        
        // 移除加载状态
        this.$set(commentItem, 'loading_replies', false);
        this.isLoadingReplies = false;
      }
    },
    
    // 评论加载更多 - 优化版本
    commentReachBottom() {
      // 防止重复触发
      if (this.isLoadingComments) {
        this.debugLog('正在加载评论，跳过触底加载');
        return;
      }
      
      if (!this.isEmpty && this.commentList.length && this.loadStatus !== "no-more") {
        this.debugLog('触底加载更多评论', {
          当前页码: this.page,
          评论总数: this.commentList.length
        });
        
        this.page = this.page + 1;
        this.loadStatus = "loading";
        this.getCommentList();
      } else {
        this.debugLog('无更多评论可加载', {
          isEmpty: this.isEmpty,
          评论数量: this.commentList.length,
          loadStatus: this.loadStatus
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
      if (direction === 'down' && !this.actionInProgress && 
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
    
    // 音频进度变化
    onAudioProgressChange(e) {
      // 确保是音频类型才处理进度变化
      if (!this.isAudioNote) {
        console.log('非音频动态，不处理音频进度变化');
        return;
      }
      
      if (!this.bgAudioManager || !this.duration) return;
      
      const seekTime = (e.detail.value / 100) * this.duration;
      this.bgAudioManager.seek(seekTime);
    },
    
    // 格式化时间显示
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00';
      
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          const emoji = sinaEmoji.find(e => e.phrase === match);
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
    
    // 对回复按时间正序排序（从早到晚）
    sortRepliesByTime(replies) {
      if (!replies || !Array.isArray(replies)) return [];
      
      // 创建副本以避免修改原始数组
      const sortedReplies = [...replies];
      
      // 按创建时间排序（早->晚）
      return sortedReplies.sort((a, b) => {
        // 处理不同的时间格式
        // 后端改为datetime格式，不需要替换-为/
        const timeA = new Date(a.create_time);
        const timeB = new Date(b.create_time);
        
        return timeA - timeB; // 升序（从早到晚）
      });
    },
    
    // 获取回复在原始数组中的索引
    getReplyIndex(replies, replyId) {
      if (!replies || !Array.isArray(replies)) return -1;
      
      for (let i = 0; i < replies.length; i++) {
        if (replies[i].id === replyId) {
          return i;
        }
      }
      
      return -1;
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
    
    // 动态详情获取
    dynamicDetails() {
      // 防止重复加载
      if (this.isLoadingDetail) {
        this.debugLog('正在加载详情，跳过重复请求');
        return;
      }
      
      this.isLoadingDetail = true;
      
      uni.showLoading({
        title: '加载中',
        mask: true
      });
      
      // 获取动态详情
      getDynamicDetail(this.noteInfo.id)
        .then(res => {
          uni.hideLoading();
          this.isLoadingDetail = false;
          
          if (res.status === 200) {
            this.debugLog('动态详情获取成功', res.data);
            
            // 修正：从res.data.detail中获取笔记数据，而不是直接从res.data中获取
            const noteData = res.data.detail || res.data;
            
            // 更新笔记信息
            this.noteInfo = {
              ...this.noteInfo,
              ...noteData,
              user_info: noteData.user_info || {
                uid: noteData.uid || 0,
                nickname: noteData.nickname || '用户',
                avatar: noteData.avatar || '/static/img/default.png'
              },
              comments: parseInt(noteData.comments || 0),
              likes: parseInt(noteData.likes || 0),
              views: parseInt(noteData.views || 0),
              shares: parseInt(noteData.shares || 0),
              is_like: !!noteData.is_like
            };
            
            // 处理不同类型的媒体数据
            this.processCommonData();
            this.processMediaData();
            
            // 设置关注状态
            if (noteData.user_info && noteData.user_info.is_follow !== undefined) {
              this.isFollowing = !!noteData.user_info.is_follow;
              this.followChecked = true;
            }
            
            // 检查内容是否需要展开按钮
            this.$nextTick(() => {
              this.checkContentOverflow();
            });
            
            // 加载评论列表
            this.getCommentList();
          } else {
            this.opTipsPopup(res.msg || '获取动态详情失败', true);
          }
        })
        .catch(err => {
          uni.hideLoading();
          this.isLoadingDetail = false;
          this.opTipsPopup('获取动态详情失败', true);
          this.debugLog('获取动态详情异常', err);
        });
    },
    
    // 检查内容是否超出两行需要显示展开按钮
    checkContentOverflow() {
      try {
        if (!this.noteInfo.content) return;
        
        uni.createSelectorQuery()
          .in(this)
          .select('.content-text')
          .boundingClientRect(rect => {
            if (rect) {
              // 获取文本内容高度
              const lineHeight = parseInt(uni.getSystemInfoSync().fontSizeSetting) * 1.4;
              const maxHeight = lineHeight * 2; // 两行文本的高度
              
              this.isContentOverflow = rect.height > maxHeight;
              this.debugLog('内容高度检查', {
                实际高度: rect.height,
                最大高度: maxHeight,
                是否超出: this.isContentOverflow
              });
            }
          })
          .exec();
      } catch (e) {
        this.debugLog('检查内容溢出异常', e);
      }
    },
    
    // 切换内容展开/收起状态
    toggleContent() {
      this.isExpanded = !this.isExpanded;
    },
    
    // 预览图片
    previewImage(currentImage, index) {
      if (!currentImage) return;
      
      let images = [];
      
      // 获取所有图片URL
      if (this.noteInfo.images && this.noteInfo.images.length > 0) {
        images = this.noteInfo.images.map(img => {
          if (typeof img === 'string') return img;
          return img.url || '';
        }).filter(Boolean);
      }
      
      // 如果没有多张图片，使用当前图片
      if (images.length === 0 && currentImage) {
        images = [currentImage];
      }
      
      uni.previewImage({
        urls: images,
        current: currentImage,
        longPressActions: {
          itemList: ['保存图片', '收藏', '分享'],
          success: (data) => {
            // 处理长按操作
            if (data.tapIndex === 0) {
              // 保存图片
              uni.saveImageToPhotosAlbum({
                filePath: images[data.index],
                success: () => {
                  uni.showToast({ title: '保存成功', icon: 'success' });
                },
                fail: () => {
                  uni.showToast({ title: '保存失败', icon: 'none' });
                }
              });
            }
          }
        }
      });
    },
    
    // 预览评论图片
    previewCommentImage(imageUrl) {
      if (!imageUrl) return;
      
      uni.previewImage({
        urls: [imageUrl],
        current: imageUrl,
        longPressActions: {
          itemList: ['保存图片'],
          success: (data) => {
            if (data.tapIndex === 0) {
              // 保存图片
              uni.saveImageToPhotosAlbum({
                filePath: imageUrl,
                success: () => {
                  uni.showToast({ title: '保存成功', icon: 'success' });
                },
                fail: () => {
                  uni.showToast({ title: '保存失败', icon: 'none' });
                }
              });
            }
          }
        }
      });
    },
    
    // 轮播图切换
    onSwiperChange(e) {
      this.currentImageIndex = e.detail.current;
    },
    
    // 切换音频播放状态
    toggleAudioPlay() {
      // 调用音频控制函数
      this.audioBgClick();
    },
    
    // 打开评论弹窗
    commentPopupClick(isShow) {
      this.isCommentPopup = isShow;
      
      if (isShow) {
        // 当打开评论弹窗时加载评论列表
        if (this.commentList.length === 0) {
          console.log('加载评论列表');
          this.page = 1;
          this.getCommentList();
        }
        
        // 打开评论弹窗
        this.$refs.commentPopup.open();
      } else {
        // 关闭评论弹窗
        this.$refs.commentPopup.close();
      }
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
    }
  }
}
</script>

<style>
page{
  background:#000;
}
.nav-box{
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  box-sizing: border-box;
}
.nav-item .nav-back{
  padding: 0 30rpx;
  width: 34rpx;
  height: 100%;
  border-radius: 50%;
}
.video-box{
  width: 100%;
  transition: height .45s ease-in-out;
}
.video-box video{
  width: 100%;
  height: 100%;
}
.content-box{
  position: fixed;
  z-index: 99;
  left: 0;
  right: 0;
  width: calc(100% - 60rpx);
  margin: 20rpx 30rpx;
  color: #fff;
}
.content-box .nav-user{
  width: 100%;
  justify-content: space-between;
}
.content-box .user-info{
  display: flex;
  align-items: center;
}
.content-box .nav-user .nav-user-avatar{
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255,255,255,.8);
}
.content-box .nav-user .nav-user-name{
  margin-left: 20rpx;
  font-size: 26rpx;
  font-weight: 700;
  opacity: .8;
}
/* 关注按钮样式 */
.content-box .nav-user .follow-btn{
  padding: 0 20rpx;
  height: 48rpx;
  line-height: 48rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8rpx;
  text-align: center;
}
.content-box .nav-user .follow-btn.active{
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
}
.content-box .content-item{
  width: 100%;
  margin: 20rpx 0;
  word-break: break-word;
}
.content-box .content-item text{
  font-size: 28rpx;
  font-weight: 400;
}
.content-box .content-tag{
  margin-bottom: 10rpx;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}
.content-tag .tag-item{
  margin: 0 10rpx 10rpx 0;
  padding: 8rpx;
  height: 40rpx;
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.1);
}
.content-tag .tag-item .icon{
  width: 40rpx;
  height: 40rpx;
  border-radius: 4rpx;
}
.content-tag .tag-item text{
  font-size: 20rpx;
  padding: 0 8rpx 0 12rpx;
}
.content-box .content-tips{
  margin-top: 8rpx;
  opacity: .6;
  font-size: 20rpx;
}
.comment-box{
  width: calc(100% - 60rpx);
  padding: 30rpx;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
}
.comment-box .comment-top{
  width: 100%;
  height: 56rpx;
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
.comment-top .top-close{
  width: 48rpx;
  height: 48rpx;
  background: #f5f5f5;
  border-radius: 50%;
  transform: rotate(45deg);
  justify-content: center;
}
.comment-scroll{
  width: 100%;
  height: calc(70vh - 196rpx);
}
.comment-box .comment-item{
  width: 100%;
  margin-top: 30rpx;
  justify-content: space-between;
  align-items: flex-start!important;
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
  color: #999;
  font-size: 20rpx;
  font-weight: 700;
}
.comment-info .comment-info-top{
  font-size: 24rpx;
  color: #999;
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
  color: #FA5150!important;
  font-weight: 700;
}
.comment-info .wo{
  color: #000!important;
  font-weight: 700;
}
.comment-info .db{
  color: #ccc!important;
}
.comment-info .comment-info-content{
  word-break: break-word;
  white-space: pre-line;
}
.comment-info .comment-info-content text{
  color: #333;
  font-size: 26rpx;
  font-weight: 400;
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
.comment-box .no-more{
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  color: #999;
  font-size: 20rpx;
}
.comment-box .comment-btn{
  width: 100%;
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 40rpx;
}
.comment-box .comment-btn image{
  margin: 0 20rpx 0 10rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
}
.footer-box{
  position: fixed;
  z-index: 99;
  left: 0;
  right: 0;
  bottom: 0;
  width: calc(100% - 30rpx);
  padding: 20rpx 15rpx;
  background: #000;
  padding-bottom: max(env(safe-area-inset-bottom), 20rpx);
}
.footer-box .footer-item{
  width: 100%;
  height: 80rpx;
  justify-content: space-between;
}
.footer-means{
  margin-left: 15rpx;
  padding: 0 30rpx;
  height: 80rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: #fff;
  background: #181818;
  border-radius: 40rpx;
}
.footer-means image{
  margin-left: 10rpx;
  width: 20rpx;
  height: 20rpx;
}
.footer-comment{
  margin-left: 20rpx;
  padding: 0 30rpx;
  width: 200rpx;
  height: 80rpx;
  background: #181818;
  border-radius: 40rpx;
}
.pl-str{
  line-height: 80rpx;
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
  padding: 16rpx 15rpx;
  display: flex;
}
.footer-item .footer-icon image{
  width: 48rpx;
  height: 48rpx;
}
.footer-item .footer-icon text{
  margin-left: 8rpx;
  color: #999;
  font-size: 18rpx;
  font-weight: 700;
}
.popup-comment-mask{
  position: fixed;
  z-index: 99998;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
}
.popup-comment{
  position: fixed;
  z-index: 99999;
  left: 0;
  width: calc(100% - 60rpx);
  padding: 30rpx;
  background: #fff;
  border-top: 1px solid #f8f8f8;
  display: flex;
  align-items: flex-end;
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


.empty-box{
  width: 100%;
  padding: 100rpx 0;
  flex-direction: column;
}
.empty-box image{
  width: 300rpx;
  height: 300rpx;
  margin-bottom: 30rpx;
}
.empty-box .e1{
  font-size: 30rpx;
  font-weight: 700;
}
.empty-box .e2{
  margin-top: 10rpx;
  color: #999;
  font-size: 26rpx;
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
.ohto2{
  display: -webkit-box;
  word-break: break-all;
  text-overflow: ellipsis;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.xwb{
  filter: invert(1);
}

/* 单图样式 */
.image-box {
  width: 100%;
  background: #000;
  transition: height .45s ease-in-out;
  justify-content: center;
  align-items: center;
}

.image-box .full-image {
  width: 100%;
  height: 100%;
}

/* 多图样式 */
.multi-image-box {
  width: 100%;
  background: #000;
  transition: height .45s ease-in-out;
}

.multi-image-box .image-swiper {
  width: 100%;
  height: 100%;
}

.multi-image-box .swiper-image {
  width: 100%;
  height: 100%;
}

.multi-image-box .image-counter {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 4rpx 20rpx;
  border-radius: 30rpx;
  font-size: 20rpx;
}

/* 内容区域调整 */
.nav-counter{
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 24rpx;
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
}

/* 音频播放器样式 */
.audio-player-container {
  position: relative;
  width: 100%;
  background: #000;
  transition: height .45s ease-in-out;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* 背景模糊层 */
.audio-bg-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.audio-bg-blur image {
  width: 100%;
  height: 100%;
}

.audio-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  -webkit-backdrop-filter: saturate(150%) blur(25px);
  backdrop-filter: saturate(150%) blur(25px);
  background: rgba(0, 0, 0, 0.5);
}

/* 音频播放内容 */
.audio-player-content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  width: 100%;
  max-width: 700rpx;
}

/* 碟机外圈 */
.vinyl-outer {
  position: relative;
  width: 400rpx;
  height: 400rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40rpx;
}

/* 外圈刻槽 */
.vinyl-groove {
  position: absolute;
  width: 350rpx;
  height: 350rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  border-style: dashed;
}

.vinyl-groove-2 {
  position: absolute;
  width: 320rpx;
  height: 320rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  border-style: dotted;
}

.vinyl-groove-3 {
  position: absolute;
  width: 290rpx;
  height: 290rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

/* 内圈唱片 */
.vinyl-inner {
  position: relative;
  width: 260rpx;
  height: 260rpx;
  background: rgba(20, 20, 20, 0.8);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 0 30rpx rgba(0, 0, 0, 0.5);
}

.vinyl-center {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 专辑封面 */
.album-cover {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
}

.album-cover image {
  width: 100%;
  height: 100%;
}

/* 中心圆点 */
.vinyl-dot {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  z-index: 2;
}

/* 音频信息 */
.audio-info {
  text-align: center;
  margin-bottom: 40rpx;
  width: 100%;
}

.audio-title {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
  margin-bottom: 10rpx;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-artist {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

/* 播放控制 */
.audio-controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.audio-play-btn {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10rpx);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.audio-play-btn:active {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(0.95);
}

.audio-play-btn image {
  width: 50rpx;
  height: 50rpx;
}

/* 进度条容器 */
.audio-progress-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.audio-time-start,
.audio-time-end {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.7);
  min-width: 80rpx;
}

.audio-progress {
  flex: 1;
  margin: 0 20rpx;
}

/* 旋转动画 */
.rotating {
  animation: rotate 10s linear infinite;
}

.rotating-slow {
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

.comment-info-bottom .delete-btn{
  margin-left: 24rpx;
  font-size: 24rpx;
  color: #999;
}

/* 评论点赞按钮样式 */
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

/* 评论图片样式 */
.comment-image {
  margin-top: 10rpx;
  max-width: 300rpx;
  max-height: 400rpx;
  border-radius: 8rpx;
}

.reply-comment-image {
  max-width: 200rpx;
  max-height: 300rpx;
}

/* 已删除评论样式 */
.deleted-comment {
  color: #ccc;
  font-style: italic;
  font-size: 24rpx;
}

/* 评论富文本样式 */
.comment-rich-text {
  word-break: break-word;
  white-space: pre-wrap;
}

.reply-rich-text {
  font-size: 24rpx;
}

/* 系统消息样式 */
.system-message {
  color: #999;
  font-style: italic;
  font-size: 24rpx;
  background-color: #f8f8f8;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
}

/* 表情预览弹窗 */
.emoji-preview-popup {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.emoji-preview-image {
  width: 60%;
  height: auto;
  max-width: 400rpx;
  max-height: 400rpx;
}

.emoji-img-inline {
  display: inline-block;
  width: 32rpx !important;
  height: 32rpx !important;
  vertical-align: middle;
  margin: 0 4rpx;
}
</style> 