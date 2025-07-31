<template>
  <view class="share-container" v-if="show">
    <view class="share-mask" @tap.stop="close"></view>
    <view class="share-content">
      <!-- 标题栏 -->
      <view class="share-header">
        <text class="share-title">分享至</text>
        <view class="popup-close df" @tap.stop="close">
          <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
        </view>
      </view>
      
      <!-- 人员列表 - 可左右滑动 -->
      <scroll-view scroll-x="true" class="person-scroll" show-scrollbar="false">
        <view class="person-list">
          <view class="person-item" v-for="(person, index) in personList" :key="index" @tap="handleShareToPerson(person)">
            <view class="person-avatar">
              <image :src="person.avatar" mode="aspectFill"></image>
              <view v-if="person.online" class="person-online-dot" :style="{'background': '#4CD964'}"></view>
            </view>
            <view class="person-name ohto">{{person.name}}</view>
            <view class="person-tips">
              <text>好友</text>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <!-- 第一条分割线 -->
      <view class="divider-line"></view>
      
      <!-- 分享选项 -->
      <scroll-view scroll-x="true" class="share-scroll" show-scrollbar="false">
        <view class="share-list">
          <!-- 第一行分享选项 - 社交平台分享 -->
          <!-- #ifndef H5 -->
          <view class="share-item" v-if="showWeixinButton" @tap="shareToWeixin">
            <view class="share-icon-bg" style="background-color: #50c332">
              <image :src="getIconSrc('wechat')" class="share-icon" mode="aspectFit"></image>
            </view>
            <text class="share-text">微信好友</text>
          </view>
          <!-- #endif -->
          
          <!-- #ifdef MP -->
          <button class="share-item share-button" open-type="share" hover-class="none" @tap="shareToMPFriend">
            <view class="share-icon-bg" style="background-color: #50c332">
              <image :src="getIconSrc('wechat')" class="share-icon" mode="aspectFit"></image>
            </view>
            <text class="share-text">发送给朋友</text>
          </button>
          <!-- #endif -->
          
          <!-- #ifdef APP-PLUS -->
          <view class="share-item" v-for="(provider, index) in providerList" :key="index" @tap="shareToProvider(provider)">
            <view class="share-icon-bg" :style="getProviderStyle(provider)">
              <image :src="getProviderIcon(provider)" class="share-icon" mode="aspectFit"></image>
            </view>
            <text class="share-text">{{provider.name}}</text>
          </view>
          <!-- #endif -->
          
          <!-- 复制口令 - 支持所有平台 -->
          <view class="share-item copy-data" v-if="showCopyCommand" :data-clipboard-text="shareData.command_word || generateCommandWord()" @tap="copyCommand">
            <view class="share-icon-bg" style="background-color: #f8f8f8">
              <image :src="getIconSrc('copy')" class="share-icon" mode="aspectFit"></image>
            </view>
            <text class="share-text">复制口令</text>
          </view>
          
          <view class="share-item" @tap="generatePoster">
            <view class="share-icon-bg" style="background-color: #f8f8f8">
              <image :src="getIconSrc('poster')" class="share-icon" mode="aspectFit"></image>
            </view>
            <text class="share-text">生成海报</text>
          </view>
          
          <view class="share-item" @tap="copyLink">
            <view class="share-icon-bg" style="background-color: #f8f8f8">
              <image :src="getIconSrc('link')" class="share-icon" mode="aspectFit"></image>
            </view>
            <text class="share-text">复制链接</text>
          </view>
        </view>
      </scroll-view>
      
      <!-- 第二条分割线 -->
      <view class="divider-line"></view>
      
      <!-- 第二行分享选项 - 功能操作 -->
      <scroll-view scroll-x="true" class="share-scroll" show-scrollbar="false">
        <view class="share-list">
          <view class="share-item" v-for="(item, index) in computedBottomItems" :key="index" @tap="handleAction(item)">
            <view class="share-icon-bg bottom-icon" :class="{'delete-item': item.type === 'delete'}">
              <image :src="getIconSrc(item.icon)" class="share-icon" mode="aspectFit"></image>
            </view>
            <text class="share-text" :class="{'delete-text': item.type === 'delete'}">{{item.name}}</text>
          </view>
        </view>
      </scroll-view>
      
      <!-- 底部安全距离 -->
      <view class="safe-bottom"></view>
    </view>
    
    <!-- 海报展示弹窗 -->
    <view class="poster-popup" v-if="posterImageStatus">
      <image src="/static/img/poster-close.png" class="close" @tap="posterImageClose"></image>
      <image class="poster-img" :src="posterImage"></image>
      <!-- #ifndef H5 -->
      <view class="save-poster" @tap="savePosterPath">保存到手机</view>
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <view class="keep">长按图片可以保存到手机</view>
      <!-- #endif -->
    </view>
    <view class="mask" v-if="posterImageStatus" @tap="posterImageClose"></view>
    <canvas class="canvas" canvas-id="myCanvas" v-if="canvasStatus"></canvas>
    
    <!-- #ifdef H5 -->
    <!-- 发送给朋友图片 -->
    <view class="share-box" v-if="H5ShareBox">
      <image :src="imgHost + '/statics/images/share-info.png'" @tap="H5ShareBox = false"></image>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
// #ifdef H5
// 不再使用clipboard.js，直接使用原生clipboard API和备用方案
// #endif

// 统一导入appConfig，避免条件编译作用域问题
import appConfig from '@/config/app.js';
const { HTTP_REQUEST_URL } = appConfig;

// #ifdef APP-PLUS
const { TOKENNAME } = appConfig;
// #endif

export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    // 分享数据信息
    shareData: {
      type: Object,
      default: () => ({
        title: '默认标题',
        description: '默认描述',
        image: '/static/img/avatar.png',
        link: '',
        command_word: ''
      })
    },
    // 笔记信息
    noteInfo: {
      type: Object,
      default: () => ({})
    },
    // 当前用户ID
    userId: {
      type: [Number, String],
      default: 0
    },
    // 分享类型 goods: 商品分享, note: 笔记分享
    shareType: {
      type: String,
      default: 'note'
    }
  },
  data() {
    return {
      imgHost: HTTP_REQUEST_URL,
      // 人员列表
      personList: [
        { id: 1, name: '好友1', avatar: '/static/img/avatar.png', online: true },
        { id: 2, name: '好友2', avatar: '/static/img/avatar.png', online: false },
        { id: 3, name: '好友3', avatar: '/static/img/avatar.png', online: true },
        { id: 4, name: '好友4', avatar: '/static/img/avatar.png', online: false },
        { id: 5, name: '好友5', avatar: '/static/img/avatar.png', online: true },
        { id: 6, name: '好友6', avatar: '/static/img/avatar.png', online: true },
        { id: 7, name: '好友7', avatar: '/static/img/avatar.png', online: false },
        { id: 8, name: '好友8', avatar: '/static/img/avatar.png', online: true },
        { id: 9, name: '好友9', avatar: '/static/img/avatar.png', online: false },
        { id: 10, name: '好友10', avatar: '/static/img/avatar.png', online: true }
      ],
      // 第二行分享选项 - 功能操作
      bottomItems: [],
      // 默认图标映射
      defaultIcons: {
        forward: '/static/img/fx.png',
        wechat: '/static/img/wz.png',
        moments: '/static/img/pl.png',
        qq: '/static/img/dz.png',
        qzone: '/static/img/dz1.png',
        poster: '/static/img/gd.png',
        link: '/static/img/z.png',
        copy: '/static/img/bj.png',
        dislike: '/static/img/sc.png',
        money: '/static/img/bj.png',
        report: '/static/img/setting/5.png',
        miniapp: '/static/img/xcx.png',
        edit: '/static/img/bj.png',
        delete: '/static/img/sc.png'
      },
      // 举报原因列表
      reportReasons: ["违法违规", "色情低俗", "账号诈骗", "侵犯权益", "骚扰谩骂", "内容抄袭", "其他"],
      
      // 海报相关数据
      posterImageStatus: false,
      posterImage: '',
      canvasStatus: false,
      H5ShareBox: false,
      
      // 微信状态
      weixinStatus: false,
      showWeixinButton: false,

      // 分享相关数据
      providerList: [], // 分享提供商列表
      shareType: 0 // 分享类型：0-图文，1-文字，2-图片，5-小程序
    };
  },
  computed: {
    // 动态计算底部操作项
    computedBottomItems() {
      // 检查是否有笔记信息，如果有则显示笔记相关操作
      if (this.noteInfo && this.noteInfo.id) {
        const isCircle = this.noteInfo.type === 'circle';
        const isOwner = this.noteInfo.uid && this.noteInfo.uid == this.userId;

        const items = [
          { name: '不喜欢', icon: 'dislike', bgColor: '#f8f8f8', type: 'dislike' },
          { name: '举报', icon: 'report', bgColor: '#f8f8f8', type: 'report' }
        ];

        // 如果是作者本人或圈主，添加编辑和删除功能
        if (isOwner) {
          const editText = isCircle ? '编辑圈子' : '编辑';
          const deleteText = isCircle ? '删除圈子' : '删除';

          items.splice(-1, 0,
            { name: editText, icon: 'edit', bgColor: '#f8f8f8', type: 'edit' },
            { name: deleteText, icon: 'delete', bgColor: '#f8f8f8', type: 'delete' }
          );
        }

        return items;
      } else {
        // 如果没有笔记信息，返回通用操作项
        return [
          { name: '复制链接', icon: 'link', bgColor: '#f8f8f8', type: 'copy-link' },
          { name: '举报', icon: 'report', bgColor: '#f8f8f8', type: 'report' }
        ];
      }
    },
    
    // 是否显示复制口令按钮
    showCopyCommand() {
      // 如果有现成的口令，直接显示
      if (this.shareData.command_word) {
        return true;
      }
      
      // 如果有分享数据，可以生成口令
      if (this.shareData.title || this.shareData.link || this.noteInfo.id) {
        return true;
      }
      
      return false;
    }
  },
  mounted() {
    this.initClipboard();
    this.checkWeixinStatus();
    this.getShareProviders();
  },
  methods: {
    close() {
      this.$emit('close');
    },
    
    // 初始化剪贴板功能
    initClipboard() {
      // #ifdef H5
      // 不再使用clipboard.js，直接在copyCommand方法中处理复制
      // 这个方法现在主要用于初始化其他功能
      // #endif
    },
    
    // 检查微信状态
    checkWeixinStatus() {
      // #ifdef H5
      if (this.$wechat && this.$wechat.isWeixin()) {
        this.weixinStatus = true;
        this.showWeixinButton = true;
      }
      // #endif
    },

    // 获取分享提供商
    getShareProviders() {
      // #ifdef APP-PLUS
      uni.getProvider({
        service: 'share',
        success: (e) => {
          console.log('获取分享提供商成功', e);
          let data = [];
          for (let i = 0; i < e.provider.length; i++) {
            switch (e.provider[i]) {
              case 'weixin':
                data.push({
                  name: '分享到微信好友',
                  id: 'weixin',
                  sort: 0
                });
                data.push({
                  name: '分享到微信朋友圈',
                  id: 'weixin',
                  type: 'WXSenceTimeline',
                  sort: 1
                });
                break;
              case 'sinaweibo':
                data.push({
                  name: '分享到新浪微博',
                  id: 'sinaweibo',
                  sort: 2
                });
                break;
              case 'qq':
                data.push({
                  name: '分享到QQ',
                  id: 'qq',
                  sort: 3
                });
                break;
              default:
                break;
            }
          }
          this.providerList = data.sort((x, y) => {
            return x.sort - y.sort;
          });
        },
        fail: (e) => {
          console.log('获取分享通道失败', e);
          uni.showModal({
            content: '获取分享通道失败',
            showCancel: false
          });
        }
      });
      // #endif
    },
    
    // 获取图标源，确保始终有图标显示
    getIconSrc(icon) {
      if (icon.startsWith('/')) {
        // 如果是完整路径，尝试直接使用
        return icon;
      } else {
        // 否则使用默认图标映射
        return this.defaultIcons[icon] || '/static/img/avatar.png';
      }
    },

    // 获取提供商图标
    getProviderIcon(provider) {
      switch (provider.id) {
        case 'weixin':
          return provider.type === 'WXSenceTimeline' ? this.defaultIcons.moments : this.defaultIcons.wechat;
        case 'qq':
          return this.defaultIcons.qq;
        case 'sinaweibo':
          return '/static/img/weibo.png';
        default:
          return this.defaultIcons.wechat;
      }
    },

    // 获取提供商样式
    getProviderStyle(provider) {
      switch (provider.id) {
        case 'weixin':
          return provider.type === 'WXSenceTimeline' ? 'background-color: #87d068' : 'background-color: #50c332';
        case 'qq':
          return 'background-color: #12b7f5';
        case 'sinaweibo':
          return 'background-color: #ff8200';
        default:
          return 'background-color: #50c332';
      }
    },

    // 分享到指定提供商
    shareToProvider(provider) {
      // #ifdef APP-PLUS
      this.performShare(provider);
      // #endif
    },

    // 执行分享操作
    async performShare(provider) {
      // #ifdef APP-PLUS
      console.log('分享通道:', provider.id, '分享类型:', this.shareType);

      // 验证分享内容
      const shareText = this.shareData.title || this.shareData.description || '';
      const shareImage = this.shareData.image || '';

      if (!shareText && (this.shareType === 1 || this.shareType === 0)) {
        uni.showModal({
          content: '分享内容不能为空',
          showCancel: false
        });
        return;
      }

      if (!shareImage && (this.shareType === 2 || this.shareType === 0)) {
        uni.showModal({
          content: '分享图片不能为空',
          showCancel: false
        });
        return;
      }

      let shareOptions = {
        provider: provider.id,
        scene: provider.type && provider.type === 'WXSenceTimeline' ? 'WXSenceTimeline' : 'WXSceneSession',
        type: this.shareType,
        success: (res) => {
          console.log('分享成功', res);
          uni.showModal({
            content: '已分享',
            showCancel: false
          });
          this.close();
        },
        fail: (err) => {
          console.log('分享失败', err);
          uni.showModal({
            content: err.errMsg || '分享失败',
            showCancel: false
          });
        },
        complete: () => {
          console.log('分享操作结束');
        }
      };

      // 根据分享类型设置参数
      switch (this.shareType) {
        case 0: // 图文分享
          shareOptions.summary = shareText;
          shareOptions.imageUrl = shareImage;
          shareOptions.title = this.shareData.title || '精彩内容分享';
          shareOptions.href = this.shareData.link || '';
          break;
        case 1: // 文字分享
          shareOptions.summary = shareText;
          break;
        case 2: // 图片分享
          shareOptions.imageUrl = shareImage;
          break;
        case 5: // 小程序分享
          shareOptions.imageUrl = shareImage || '/static/img/avatar.png';
          shareOptions.title = this.shareData.title || '精彩内容分享';
          shareOptions.miniProgram = {
            id: 'gh_33446d7f7a26', // 小程序原始ID，需要替换为实际的
            path: '/pages/index/index', // 小程序页面路径
            webUrl: this.shareData.link || '',
            type: 0 // 0-正式版，1-测试版，2-体验版
          };
          break;
        default:
          break;
      }

      // iOS平台图文分享需要压缩图片
      if (shareOptions.type === 0 && plus.os.name === 'iOS') {
        shareOptions.imageUrl = await this.compressImage(shareOptions.imageUrl);
      }

      // QQ文字分享需要特殊处理
      if (shareOptions.type === 1 && shareOptions.provider === 'qq') {
        shareOptions.href = this.shareData.link || '';
        shareOptions.title = this.shareData.title || '精彩内容分享';
      }

      uni.share(shareOptions);
      // #endif
    },
    
    // 处理分享给特定人员
    handleShareToPerson(person) {
      console.log('分享给:', person.name);
      uni.showToast({
        title: `分享给${person.name}`,
        icon: 'none'
      });
      this.$emit('share-to-person', person);
    },
    
    // 分享到微信好友 (H5)
    shareToWeixin() {
      // #ifdef H5
      if (this.weixinStatus) {
        this.H5ShareBox = true;
        this.shareToWeixinSDK();
      } else {
        uni.showToast({
          title: '请在微信中打开',
          icon: 'none'
        });
      }
      // #endif
    },
    
    // 小程序分享好友
    shareToMPFriend() {
      console.log('小程序分享好友');
      this.close();
    },
    
    // APP分享（兼容旧接口）
    appShare(scene) {
      // #ifdef APP-PLUS
      const provider = {
        id: 'weixin',
        type: scene === 'WXSenceTimeline' ? 'WXSenceTimeline' : undefined,
        name: scene === 'WXSenceTimeline' ? '分享到微信朋友圈' : '分享到微信好友'
      };
      this.shareToProvider(provider);
      // #endif
    },
    
    // 微信SDK分享
    shareToWeixinSDK() {
      // #ifdef H5
      if (this.$wechat && this.$wechat.isWeixin()) {
        const configAppMessage = {
          desc: this.shareData.description || '默认描述',
          title: this.shareData.title || '默认标题',
          link: this.shareData.link || location.href,
          imgUrl: this.shareData.image || '/static/img/avatar.png'
        };
        this.$wechat
          .wechatEvevt(['updateAppMessageShareData', 'updateTimelineShareData', 'onMenuShareAppMessage', 'onMenuShareTimeline'], configAppMessage)
          .then((res) => {
            console.log('微信分享配置成功', res);
          })
          .catch((err) => {
            console.log('微信分享配置失败', err);
          });
      }
      // #endif
    },
    
    // 生成口令
    generateCommandWord() {
      if (this.shareData.command_word) {
        return this.shareData.command_word;
      }
      
      // 根据分享类型生成不同的口令
      let commandWord = '';
      if (this.shareType === 'note') {
        const title = this.noteInfo.title || this.shareData.title || '精彩内容';
        const id = this.noteInfo.id || '';
        commandWord = `#${title}# 快来看看这个精彩内容！复制这条消息，打开APP查看详情。ID:${id}`;
      } else if (this.shareType === 'goods') {
        const title = this.shareData.title || '商品分享';
        const link = this.shareData.link || '';
        commandWord = `#${title}# 发现好物推荐！复制这条消息，打开APP查看详情。${link}`;
      } else {
        const title = this.shareData.title || '精彩内容';
        commandWord = `#${title}# 快来看看这个精彩内容！`;
      }
      
      return commandWord;
    },
    
    // 复制口令
    copyCommand() {
      const commandWord = this.shareData.command_word || this.generateCommandWord();
      
      // #ifdef H5
      // H5环境下如果支持 clipboard.js，会自动处理
      // 这里作为备用方案
      if (navigator.clipboard) {
        navigator.clipboard.writeText(commandWord).then(() => {
          uni.showToast({
            title: '口令复制成功',
            icon: 'success'
          });
          this.close();
        }).catch(() => {
          // 使用传统方法
          this.fallbackCopy(commandWord);
        });
      } else {
        this.fallbackCopy(commandWord);
      }
      // #endif
      
      // #ifndef H5
      uni.setClipboardData({
        data: commandWord,
        success: () => {
          uni.showToast({
            title: '口令复制成功',
            icon: 'success'
          });
          this.close();
        },
        fail: () => {
          uni.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      });
      // #endif
    },
    
    // H5备用复制方法
    fallbackCopy(text) {
      // #ifdef H5
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          uni.showToast({
            title: '口令复制成功',
            icon: 'success'
          });
          this.close();
        } else {
          uni.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      } catch (err) {
        uni.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
      document.body.removeChild(textArea);
      // #endif
    },
    
    // 生成海报
    generatePoster() {
      console.log('生成海报');
      this.canvasStatus = true;
      this.close();
      
      // 模拟海报生成过程
      setTimeout(() => {
        this.posterImage = this.shareData.image || '/static/img/avatar.png';
        this.posterImageStatus = true;
        this.canvasStatus = false;
      }, 2000);
      
      this.$emit('generate-poster', this.shareData);
    },
    
    // 关闭海报
    posterImageClose() {
      this.posterImageStatus = false;
    },
    
    // 保存海报到手机
    savePosterPath() {
      // #ifdef MP || APP-PLUS
      uni.getSetting({
        success: (res) => {
          if (!res.authSetting['scope.writePhotosAlbum']) {
            uni.authorize({
              scope: 'scope.writePhotosAlbum',
              success: () => {
                this.saveImage();
              },
              fail: () => {
                uni.showToast({
                  title: '需要授权保存相册',
                  icon: 'none'
                });
              }
            });
          } else {
            this.saveImage();
          }
        }
      });
      // #endif
    },
    
    // 保存图片
    saveImage() {
      uni.saveImageToPhotosAlbum({
        filePath: this.posterImage,
        success: () => {
          this.posterImageClose();
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });
        },
        fail: () => {
          uni.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 复制链接
    copyLink() {
      let shareUrl;
      if (this.shareType === 'note') {
      if (this.noteInfo.type === 'circle') {
        shareUrl = this.noteInfo.share_url || `/pages/note/circle?id=${this.noteInfo.id}`;
      } else {
        shareUrl = `/pages/note/details?id=${this.noteInfo.id}`;
        }
      } else {
        shareUrl = this.shareData.link || location.href;
      }
      
      uni.setClipboardData({
        data: shareUrl,
        success: () => {
          uni.showToast({ title: '链接已复制', icon: 'success' });
          this.close();
        },
        fail: () => {
          uni.showToast({ title: '复制失败', icon: 'none' });
        }
      });
    },
    
    handleAction(item) {
      // 处理功能操作逻辑
      console.log('执行操作:', item.name, item.type);

      switch(item.type) {
        case 'dislike':
          this.markDislike();
          break;
        case 'report':
          this.showReportModal();
          break;
        case 'edit':
          this.editNote();
          break;
        case 'delete':
          this.deleteNote();
          break;
        case 'copy-link':
          this.copyLink();
          break;
        default:
          console.log('未知操作类型:', item.type);
      }
    },
    
    // 标记不感兴趣
    markDislike() {
      const isCircle = this.noteInfo.type === 'circle';
      const content = isCircle ? '确定标记该圈子为不感兴趣吗？' : '确定标记为不感兴趣吗？';
      const successText = isCircle ? '已标记该圈子为不感兴趣' : '已标记为不感兴趣';
      
      uni.showModal({
        title: '确认操作',
        content: content,
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: successText, icon: 'success' });
            this.close();
            this.$emit('dislike', this.noteInfo.id);
          }
        }
      });
    },
    
    // 显示举报弹窗
    showReportModal() {
      uni.showActionSheet({
        itemList: this.reportReasons,
        success: (res) => {
          const reason = this.reportReasons[res.tapIndex];
          this.reportNote(reason);
        }
      });
    },
    
    // 举报笔记
    reportNote(reason) {
      console.log('举报笔记:', reason);
      uni.showLoading({ title: '举报中...', mask: true });
      
      // 发送举报事件给父组件处理
      this.$emit('report', {
        noteId: this.noteInfo.id,
        reason: reason,
        noteInfo: this.noteInfo
      });
      
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({ title: '举报成功', icon: 'success' });
        this.close();
      }, 1000);
    },
    
    // 编辑笔记
    editNote() {
      this.close();
      this.$emit('edit', this.noteInfo.id);
    },

    // 复制链接
    copyLink() {
      const link = this.shareData.link || '';
      if (!link) {
        uni.showToast({
          title: '暂无链接可复制',
          icon: 'none'
        });
        return;
      }

      // #ifdef H5
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
          uni.showToast({
            title: '链接复制成功',
            icon: 'success'
          });
          this.close();
        }).catch(() => {
          this.fallbackCopyText(link);
        });
      } else {
        this.fallbackCopyText(link);
      }
      // #endif

      // #ifndef H5
      uni.setClipboardData({
        data: link,
        success: () => {
          uni.showToast({
            title: '链接复制成功',
            icon: 'success'
          });
          this.close();
        },
        fail: () => {
          uni.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      });
      // #endif
    },

    // 降级复制方法
    fallbackCopyText(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          uni.showToast({
            title: '链接复制成功',
            icon: 'success'
          });
          this.close();
        } else {
          uni.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      } catch (err) {
        uni.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
      document.body.removeChild(textArea);
    },
    
    // 删除笔记或圈子
    deleteNote() {
      const isCircle = this.noteInfo.type === 'circle';
      const content = isCircle ? '确认要永久删除这个圈子吗？删除后圈子内的所有内容都将清空。' : '确认要永久删除这篇笔记吗？';

      uni.showModal({
        title: '确认删除',
        content: content,
        confirmColor: '#FA5150',
        success: (res) => {
          if (res.confirm) {
            this.close();
            this.$emit('delete', this.noteInfo.id);
          }
        }
      });
    },

    // 压缩图片（参考1.vue的实现）
    compressImage(imageUrl) {
      // #ifdef APP-PLUS
      console.log('开始压缩图片');
      return new Promise((resolve) => {
        if (!imageUrl) {
          resolve(imageUrl);
          return;
        }

        const localPath = plus.io.convertAbsoluteFileSystem(imageUrl.replace('file://', ''));
        console.log('图片路径:', localPath);

        plus.io.resolveLocalFileSystemURL(localPath, (entry) => {
          entry.file((file) => {
            console.log('图片文件信息:', JSON.stringify(file));
            if (file.size > 20480) { // 压缩后size大于20KB
              plus.zip.compressImage({
                src: imageUrl,
                dst: imageUrl.replace('.jpg', '_compressed.jpg').replace('.JPG', '_compressed.JPG'),
                width: '10%',
                height: '10%',
                quality: 1,
                overwrite: true
              }, (event) => {
                console.log('压缩成功，新大小:', event.size);
                const newImg = imageUrl.replace('.jpg', '_compressed.jpg').replace('.JPG', '_compressed.JPG');
                resolve(newImg);
              }, (error) => {
                console.log('压缩失败:', error);
                uni.showModal({
                  content: '分享图片太大，需要重新选择图片！',
                  showCancel: false
                });
                resolve(imageUrl); // 压缩失败时返回原图
              });
            } else {
              resolve(imageUrl); // 图片大小符合要求
            }
          });
        }, (error) => {
          console.log('读取文件失败:', error.message);
          uni.showModal({
            content: '分享图片处理失败！',
            showCancel: false
          });
          resolve(imageUrl); // 处理失败时返回原图
        });
      });
      // #endif

      // #ifndef APP-PLUS
      return Promise.resolve(imageUrl);
      // #endif
    },

    // 设置分享类型
    setShareType(type) {
      this.shareType = type;
    }
  }
};
</script>

<style scoped>
.share-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
}

.share-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.6);
}

.share-content {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: #ffffff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.share-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 90rpx;
  border-bottom: 1rpx solid #f2f2f2;
}

.share-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.popup-close {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f8f8f8;
  justify-content: center;
}

/* 分割线样式 */
.divider-line {
  height: 1px;
  background-color: #eeeeee;
  width: 100%;
}

/* 人员列表样式 */
.person-scroll {
  width: 100%;
  white-space: nowrap;
  padding: 30rpx 0;
  background-color: #ffffff;
}

.person-list {
  width: 100%;
  display: flex;
  padding: 0 10rpx;
}

.person-item {
  flex-shrink: 0;
}

.person-avatar {
  margin: 0 20rpx;
  width: 116rpx;
  height: 116rpx;
  border-radius: 50%;
  background: #f8f8f8;
  border: 2rpx solid #f5f5f5;
  position: relative;
}

.person-avatar image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.person-online-dot {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
  z-index: 10;
}

.person-name {
  margin: 20rpx 0 10rpx;
  width: 160rpx;
  color: #000;
  font-weight: 500;
  font-size: 24rpx;
  line-height: 24rpx;
  text-align: center;
}

.person-tips {
  width: 160rpx;
  color: #999;
  font-size: 18rpx;
  line-height: 18rpx;
  font-weight: 300;
  text-align: center;
}

.ohto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 分享选项滚动样式 */
.share-scroll {
  width: 100%;
  white-space: nowrap;
  padding: 30rpx 0;
  background-color: #ffffff;
}

.share-list {
  display: flex;
  padding: 0 10rpx;
}

.share-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 20rpx;
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  color: inherit;
}

.share-button {
  background: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 20rpx !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}

.share-button::after {
  border: none !important;
}

.share-icon-bg {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;
}

.bottom-icon {
  background-color: #f8f8f8 !important;
}

.delete-item {
  background-color: #fff2f2 !important;
}

.share-icon {
  width: 50rpx;
  height: 50rpx;
}

.share-text {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  width: 120rpx;
  margin-top: 8rpx;
}

.delete-text {
  color: #ff4757 !important;
}

.safe-bottom {
  height: 34rpx;
  height: calc(34rpx + env(safe-area-inset-bottom));
}

/* 海报相关样式 */
.poster-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
}

.poster-popup .close {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 20rpx;
}

.poster-img {
  max-width: 80%;
  max-height: 70%;
  border-radius: 10rpx;
}

.save-poster {
  margin-top: 40rpx;
  padding: 20rpx 40rpx;
  background-color: #007aff;
  color: white;
  border-radius: 50rpx;
  font-size: 28rpx;
}

.keep {
  margin-top: 40rpx;
  color: white;
  font-size: 28rpx;
  text-align: center;
}

.canvas {
  position: fixed;
  top: -9999rpx;
  left: -9999rpx;
  width: 750rpx;
  height: 1334rpx;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 299;
  background-color: rgba(0, 0, 0, 0.6);
}

/* H5分享图片 */
.share-box {
  z-index: 1000;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.share-box image {
  width: 100%;
  height: 100%;
}
</style>