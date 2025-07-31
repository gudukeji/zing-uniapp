<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-box df" :style="{'padding-top': statusBarHeight + 'px', 'background': 'rgba(255, 255, 255,' + navbarTrans + ')'}">
      <view class="nav-back df" :style="{'height': titleBarHeight + 'px'}" @tap="navBack">
        <image :class="[navbarTrans != 1 ? 'xwb' : '']" :src="navbarTrans == 1 ? '/static/img/z.png' : '/static/img/z1.png'" style="width:34rpx;height:34rpx"></image>
      </view>
      <view v-if="navbarTrans == 1" class="nav-title ohto">{{userInfo.name}}</view>
    </view>
    
    <!-- 用户信息 -->
    <view class="user-box" :style="{'padding-top': statusBarHeight + titleBarHeight + 'px'}">
      <view class="user-bg"></view>
      <view class="user-img" style="z-index:-2">
        <!-- 背景轮播区域 -->
        <view v-if="backgroundImages.length > 0" class="background-carousel">
          <view 
            v-for="(img, index) in backgroundImages" 
            :key="index"
            class="carousel-item"
            :class="{'active': index === currentBgIndex}"
          >
            <lazy-image :src="img.url" mode="aspectFill"></lazy-image>
          </view>
          <!-- 轮播指示器 -->
          <view v-if="backgroundImages.length > 1" class="carousel-indicators">
            <view 
              v-for="(item, index) in backgroundImages" 
              :key="index"
              class="indicator"
              :class="{'active': index === currentBgIndex}"
              @tap="switchBackground(index)"
            ></view>
          </view>
        </view>
        <!-- 默认头像背景 -->
        <view v-else class="default-background">
          <lazy-image :src="userInfo.avatar || '/static/img/avatar.png'" mode="aspectFill"></lazy-image>
        </view>
      </view>
      <view class="user-top df" :style="userTopStyle">
        <view class="avatar">
          <lazy-image :src="userInfo.avatar"></lazy-image>
        </view>
        <view :class="['btn', followBtnClass]" @tap="followClick">
          {{followBtnText}}
        </view>
      </view>
      <view class="user-name">{{userInfo.name}}</view>
      <view v-if="userInfo.intro" class="user-intro">
        <text user-select="true">{{userInfo.intro}}</text>
      </view>
      <view class="user-tag df">
        <view v-if="userInfo.gender != undefined || userInfo.sex != undefined" class="tag-item df">
          <image :src="(userInfo.gender == 1 || userInfo.sex == 1) ? '/static/img/nan.png' : '/static/img/nv.png'"></image>
        </view>
        <view v-if="userInfo.constellation_label" class="tag-item df">
          {{userInfo.constellation_label}}
        </view>
        <view v-else-if="userInfo.age && userInfo.age != '暂不展示'" class="tag-item df">
          {{userInfo.age}}
        </view>
        <view class="tag-item df">IP属地：{{userInfo.province || '未知'}}</view>
      </view>
      <view class="user-num df">
        <view class="num-item df" data-type="0" @tap="toFollow">
          <text class="t1">{{userInfo.follow_count}}</text>
          <text>关注</text>
        </view>
        <view class="num-item df" data-type="1" @tap="toFollow">
          <text class="t1">{{userInfo.fans_count}}</text>
          <text>粉丝</text>
        </view>
        <view class="num-item df" @tap="likePopupClick(true)">
          <text class="t1">{{userInfo.like_count_str}}</text>
          <text>获赞</text>
        </view>
        <view class="num-item df" @tap="visitorPopupClick(true)">
          <text class="t1">{{userInfo.visitor_count || 0}}</text>
          <text>访客</text>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-box">
      <!-- 圈子信息 -->
      <view v-if="userInfo.circle.length" class="block-box">
        <view class="block-title">{{userInfo.name}} 加入的圈子</view>
        <scroll-view scroll-x="true" style="width:100%;white-space:nowrap">
          <view class="circle-box">
            <view v-for="(item, index) in userInfo.circle" 
                  :key="index" 
                  class="circle-item df" 
                  :data-url="'note/circle?id=' + item.id" 
                  @tap="navigateToFun">
              <image class="circle-avatar" :src="item.avatar" mode="aspectFill"></image>
              <view class="circle-name ohto">{{item.name}}</view>
            </view>
            <view style="flex-shrink:0;width:15rpx;height:15rpx"></view>
          </view>
        </scroll-view>
      </view>
      
      <!-- 导航栏选项 -->
      <view class="bar-box df" :style="{'top': statusBarHeight + titleBarHeight - 1 + 'px'}">
        <view v-for="(item, index) in barList" 
              :key="index" 
              class="bar-item df" 
              @tap="barClick" 
              :data-idx="index">
          <text :style="{
            'color': index == barIdx ? '#000' : '#999',
            'font-size': index == barIdx ? '28rpx' : '26rpx'
          }">{{item}}</text>
          <view :style="{'opacity': index == barIdx ? 1 : 0}" class="bar-line"></view>
        </view>
      </view>
      
      <!-- 加载中提示 -->
      <view v-if="loadStatus == 'loading' && !isThrottling" class="loading-box df">
        <uni-load-more :status="loadStatus"></uni-load-more>
      </view>
      
      <!-- 错误状态提示 -->
      <emptyPage
        v-if="hasError"
        title="加载失败"
        :description="errorMessage || '网络连接异常，请稍后重试'"
        image="/static/img/empty.png"
        buttonText="重新加载"
        @buttonClick="retryLoad"
      />

      <!-- 空内容提示 -->
      <emptyPage
        v-else-if="isEmpty && !hasError"
        :title="barIdx == 0 ? '暂无笔记内容' : '暂无喜欢的内容'"
        :description="userInfo.name + (barIdx == 0 ? ' 还没有发布过' : ' 还没有点赞')"
        image="/static/img/empty.png"
      />

      <!-- 隐私设置提示 -->
      <emptyPage
        v-else-if="barIdx == 1 && userInfo.privacy.like == 0"
        title="点赞内容不可见"
        description="该用户已将点赞设为私密"
        image="/static/img/empty.png"
      />
      
      <!-- 内容列表 -->
      <view v-else-if="list.length > 0" :class="[isWaterfall ? 'dynamic-box' : '']">
        <waterfall v-if="isWaterfall" :note="list" :page="page"></waterfall>
        <block v-else>
          <block v-for="(item, index) in list" :key="index">
            <card-gg :item="item" :idx="index" @likeback="likeClick" @followback="followBack"></card-gg>
          </block>
        </block>
        <!-- 底部加载更多状态 -->
        <view v-if="loadStatus !== 'loading'" class="load-more-box">
        <uni-load-more :status="loadStatus"></uni-load-more>
        </view>
      </view>
    </view>
    
    <!-- 获赞弹窗 -->
    <uni-popup ref="likePopup">
      <view class="like-popup">
        <image class="like-img" src="/static/img/like-big.png" mode="aspectFill"></image>
        <view class="like-content">
          <text>"</text>{{userInfo.name}}<text>"</text>共获得 {{userInfo.like_count}} 个赞
        </view>
        <view class="like-btn" @tap="likePopupClick(false)">确认</view>
      </view>
    </uni-popup>
    
    <!-- 提示弹窗 -->
    <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
      <view class="tips-box df">
        <view class="tips-item">{{tipsTitle}}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import lazyImage from '@/components/lazyImage/lazyImage'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'
import waterfall from '@/components/waterfall/waterfall'
import cardGg from '@/components/card-gg/card-gg'
import emptyPage from '@/components/emptyPage/emptyPage.vue'
import { getUserHomepage, getOtherUserDynamicList, followUser, getLikeDynamicList } from '@/api/social.js'
import { useUserStore } from '@/stores/user.js'
import { toLogin } from '@/libs/login.js'

export default {
  components: {
    lazyImage,
    uniLoadMore,
    waterfall,
    cardGg,
    emptyPage
  },
  data() {
    return {
      userStore: useUserStore(),
      statusBarHeight: this.$store?.state?.statusBarHeight || 20,
      titleBarHeight: this.$store?.state?.titleBarHeight || 44,
      menuButtonWidth: 0, // 胶囊按钮宽度，用于计算右边距
      navbarTrans: 0,
      userInfo: {
        id: 0,
        uid: 0,
        avatar: "",
        name: "昵称加载中",
        nickname: "",
        intro: "",
        about_me: "",
        gender: 0,
        sex: 0,
        age: "",
        constellation: 0,
        constellation_label: "",
        province: "",
        follow_count: 0,
        fans_count: 0,
        like_count: 0,
        like_count_str: 0,
        visitor_count: 0, // 访客总数
        is_follow: 0,
        is_mutual_follow: 0,
        circle: [],
        user_id_number: "",
        privacy: {
          like: 1,
          follow: 1,
          fans: 1,
          visitors: 1,
          search: 1,
          phone: 1
        },
        home_background: "[]",
        visitors: [], // 访客记录
        // VIP相关信息
        vip: false,
        vip_id: 0,
        vip_icon: '',
        vip_name: '',
        vip_status: 2,
        svip_open: false,
        is_ever_level: 0,
        is_money_level: 0,
        overdue_time: 0
      },
      barList: ["笔记", "赞过"],
      barIdx: 0,
      isThrottling: false,
      list: [],
      page: 1,
      isEmpty: false,
      loadStatus: "loading",
      tipsTitle: "",
      isWaterfall: false,
      backgroundImages: [],
      currentBgIndex: 0,
      carouselTimer: null,
      userId: 0,
      isFollowing: false,
      limit: 10,
      isLoading: false,
      isProcessing: false,
      // 页面状态管理
      pageLoaded: false,
      userLoaded: false,
      // 错误状态
      hasError: false,
      errorMessage: ""
    }
  },
  computed: {
    isLogin() {
      return this.userStore.isLoggedIn;
    },
    loginUserId() {
      return this.userStore.uid || 0;
    },
    
    // 关注按钮样式
    followBtnClass() {
      // 检查是否为互相关注
      if (parseInt(this.userInfo.is_mutual_follow) === 1) {
        return 'mutual';
      } 
      // 检查是否已关注
      else if (this.isFollowing || parseInt(this.userInfo.is_follow) === 1) {
        return 'active';
      } 
      // 未关注状态
      else {
        return '';
      }
    },
    
    // 关注按钮文本
    followBtnText() {
      // 检查是否为互相关注
      if (parseInt(this.userInfo.is_mutual_follow) === 1) {
        return '互相关注';
      }
      // 检查是否已关注
      else if (this.isFollowing || parseInt(this.userInfo.is_follow) === 1) {
        return '已关注';
      }
      // 未关注状态
      else {
        return '＋关注';
      }
    },

    // 用户顶部容器样式（根据胶囊按钮位置动态计算）
    userTopStyle() {
      const style = {};

      // #ifdef MP-WEIXIN
      if (this.menuButtonWidth > 0) {
        // 设置右边距，确保关注按钮不与胶囊按钮重叠
        style.paddingRight = this.menuButtonWidth + 'px';
        console.log('用户顶部容器右边距:', this.menuButtonWidth + 'px');
      } else {
        // 默认边距
        style.paddingRight = '88px';
      }
      // #endif

      // #ifndef MP-WEIXIN
      style.paddingRight = '30rpx';
      // #endif

      return style;
    }
  },
  async onLoad(options) {
    // 获取胶囊按钮位置信息
    this.getMenuButtonInfo();

    // 显示分享菜单 - 添加平台兼容性检查
    try {
      // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
      if (typeof uni.showShareMenu === 'function') {
        uni.showShareMenu()
      }
      // #endif
    } catch (e) {
      console.warn('showShareMenu not supported on this platform:', e)
    }

    // 等待应用初始化完成
    await this.$onLaunched
    
    console.log('页面onLoad参数:', options);
    
    try {
      // 同时支持id和user_id参数
      const userId = options?.id || options?.user_id || options?.uid || 0;
      
      if (userId) {
        // 确保ID为数字类型
        this.userId = parseInt(userId);
        
        if (isNaN(this.userId) || this.userId <= 0) {
          console.error('用户ID无效:', userId);
          this.opTipsPopup("用户ID无效", true);
          return;
        }
        
        // 检查是否是查看自己的页面
        const loginUserId = this.loginUserId || uni.getStorageSync('uid') || 0;
        const isSelfProfile = this.userId === parseInt(loginUserId);
        
        console.log('加载用户ID:', this.userId, '是否自己:', isSelfProfile);
        
        // 如果是查看自己的页面，可以添加一些特殊处理
        if (isSelfProfile) {
          this.barList = ["笔记", "赞过"]; // 确保可以看到自己的点赞
        } else {
          this.barList = ["笔记", "赞过"]; // 其他用户的点赞可能受隐私设置影响
        }
        
        // 调用获取用户详情方法
        this.getUserInfo();
        this.loadDynamicList();
      } else {
        console.error('缺少用户ID参数');
        this.opTipsPopup("用户状态异常或已注销！", true);
      }
    } catch (e) {
      console.error('onLoad异常:', e);
      this.opTipsPopup("加载用户信息失败", true);
    }
  },
  onUnload() {
    // 页面卸载时清理轮播定时器
    this.clearCarouselTimer();
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
            // 胶囊右侧到屏幕右侧的距离 + 额外的间距
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

    /**
     * 获取用户信息
     */
    getUserInfo() {
      console.log('开始获取用户信息, userId:', this.userId);
      
      // 确保userId有效
      if (!this.userId || this.userId <= 0) {
        console.error('获取用户信息失败: 用户ID无效', this.userId);
        this.opTipsPopup("用户ID无效", true);
        return;
      }
      
      // 显示加载状态
      uni.showLoading({
        title: '加载中...',
        mask: true
      });
      
      // 简化调用，后端会自动获取当前登录用户ID
      getUserHomepage({
        user_id: this.userId
      }).then(res => {
        console.log('获取用户信息成功:', res);
        if (res.data) {
          // 保存原始数据
          this.userInfo = res.data;
          
          // 处理ID字段
          if (!this.userInfo.id && this.userInfo.uid) {
            this.userInfo.id = this.userInfo.uid;
          }
          
          // 处理昵称字段
          if (!this.userInfo.name && this.userInfo.nickname) {
            this.userInfo.name = this.userInfo.nickname;
          }
          
          // 处理简介字段
          if (!this.userInfo.intro && this.userInfo.about_me) {
            this.userInfo.intro = this.userInfo.about_me;
          }
          
          // 确保关注状态是数字类型
          this.userInfo.is_follow = parseInt(this.userInfo.is_follow || 0);
          this.userInfo.is_mutual_follow = parseInt(this.userInfo.is_mutual_follow || 0);
          
          // 设置关注状态
          this.isFollowing = this.userInfo.is_follow === 1;
          
          // 处理隐私设置 - 使用新的字段格式
          if (!this.userInfo.privacy) {
            this.userInfo.privacy = {
              like: 1,
              follow: 1,
              fans: 1,
              visitors: 1,
              search: 1,
              phone: 1
            };
          } else {
            // 确保所有隐私字段都存在，使用新字段格式的默认值
            this.userInfo.privacy = {
              like: this.userInfo.privacy.like !== undefined ? this.userInfo.privacy.like : 1,
              follow: this.userInfo.privacy.follow !== undefined ? this.userInfo.privacy.follow : 1,
              fans: this.userInfo.privacy.fans !== undefined ? this.userInfo.privacy.fans : 1,
              visitors: this.userInfo.privacy.visitors !== undefined ? this.userInfo.privacy.visitors : 1,
              search: this.userInfo.privacy.search !== undefined ? this.userInfo.privacy.search : 1,
              phone: this.userInfo.privacy.phone !== undefined ? this.userInfo.privacy.phone : 1
            };
          }

          // 处理访客记录（只有查看自己主页时才有数据）
          if (res.data.visitors && Array.isArray(res.data.visitors)) {
            this.userInfo.visitors = res.data.visitors;
            console.log('获取到访客记录:', res.data.visitors.length, '条');
          } else {
            this.userInfo.visitors = [];
          }

          // 处理VIP信息
          if (res.data.vip !== undefined) {
            this.userInfo.vip = res.data.vip;
            this.userInfo.vip_id = res.data.vip_id || 0;
            this.userInfo.vip_icon = res.data.vip_icon || '';
            this.userInfo.vip_name = res.data.vip_name || '';
            this.userInfo.vip_status = res.data.vip_status || 2;
            this.userInfo.svip_open = res.data.svip_open || false;
            this.userInfo.is_ever_level = res.data.is_ever_level || 0;
            this.userInfo.is_money_level = res.data.is_money_level || 0;
            this.userInfo.overdue_time = res.data.overdue_time || 0;
            console.log('获取到VIP信息:', {
              vip: this.userInfo.vip,
              vip_name: this.userInfo.vip_name,
              vip_status: this.userInfo.vip_status,
              svip_open: this.userInfo.svip_open
            });
          }

          console.log('处理后的用户信息:', {
            id: this.userInfo.id,
            name: this.userInfo.name,
            is_follow: this.userInfo.is_follow,
            is_mutual_follow: this.userInfo.is_mutual_follow,
            isFollowing: this.isFollowing,
            privacy: this.userInfo.privacy,
            visitorsCount: this.userInfo.visitors.length,
            vip: this.userInfo.vip,
            vip_status: this.userInfo.vip_status
          });

          console.log('隐私设置详情:', {
            follow: this.userInfo.privacy.follow,
            fans: this.userInfo.privacy.fans,
            visitors: this.userInfo.privacy.visitors,
            search: this.userInfo.privacy.search,
            phone: this.userInfo.privacy.phone,
            like: this.userInfo.privacy.like
          });
          
          // 处理背景图片
          this.updateBackgroundImages();
          
          // 设置页面标题
          uni.setNavigationBarTitle({
            title: this.userInfo.name || '用户详情'
          });
        } else {
          console.error('获取用户信息返回数据为空');
          this.opTipsPopup("获取用户信息失败", true);
        }
      }).catch(err => {
        console.error('获取用户信息失败', err);
        this.opTipsPopup("获取用户信息失败: " + (err.msg || "网络错误"), true);
      }).finally(() => {
        uni.hideLoading();
      });
    },
    
    /**
     * 加载用户动态列表
     */
    loadDynamicList() {
      if (this.isLoading || this.loadStatus === 'noMore') return;
      
      this.isLoading = true;
      this.loadStatus = 'loading';
      
      // 判断是否是查看"赞过"标签，且是查看自己的页面
      const isLikedTab = this.barIdx === 1;
      const isOwnProfile = this.userId === this.loginUserId;
      
      let apiCall;
      
      if (isLikedTab) {
        // "赞过"标签，调用getLikeDynamicList接口
        console.log('加载点赞动态列表 - 用户ID:', this.userId);
        apiCall = getLikeDynamicList(this.userId, {
          page: this.page,
          limit: this.limit
        });
      } else {
        // "笔记"标签，查看用户发布的动态列表
        console.log('加载用户动态列表, userId:', this.userId, 'barIdx:', this.barIdx);
        apiCall = getOtherUserDynamicList(this.userId, {
          page: this.page,
          limit: this.limit
        });
      }
      
      apiCall.then(res => {
        console.log('动态列表接口返回:', res);
        const list = res.data.list || [];
        
        if (this.page === 1) {
          this.list = list;
          this.isEmpty = list.length === 0;
        } else {
          this.list = [...this.list, ...list];
        }
        
        this.loadStatus = list.length < this.limit ? 'noMore' : 'more';
        this.page++;
        
        // 如果是第一页且有数据，判断是否需要使用瀑布流布局
        if (this.page === 2 && list.length > 0) {
          // 检查是否有图片或视频内容
          const hasMediaContent = list.some(item => 
            item.type === 2 || item.type === 3 || 
            (item.images && item.images.length > 0)
          );
          this.isWaterfall = hasMediaContent;
        }
      }).catch(err => {
        console.error('获取动态列表失败', err);
        this.loadStatus = 'more';
        
        // 如果是点赞列表且出错，可能需要特殊处理
        if (isLikedTab && !isOwnProfile) {
          // 检查是否是隐私设置问题
          if (err.code === 403 || err.status === 403) {
            this.opTipsPopup("该用户已将点赞设为私密");
          } else {
            uni.showToast({
              title: '加载失败，请重试',
              icon: 'none'
            });
          }
        } else {
          uni.showToast({
            title: '加载失败，请重试',
            icon: 'none'
          });
        }
      }).finally(() => {
        this.isLoading = false;
        uni.stopPullDownRefresh();
      });
    },
    
    /**
     * 处理关注/取消关注
     */
    handleFollow() {
      if (!this.isLogin) {
        toLogin();
        return;
      }
      
      // 防止重复点击
      if (this.isProcessing) return;
      this.isProcessing = true;
      
      // 获取目标用户ID，确保是整数类型
      const targetUserId = parseInt(this.userId);
      
      // 验证用户ID
      if (!targetUserId || targetUserId <= 0) {
        uni.showToast({
          title: "获取用户ID失败",
          icon: "none"
        });
        console.error('关注操作失败: 无效的用户ID', targetUserId);
        this.isProcessing = false;
        return;
      }
      
      // 当前的关注状态
      const isMutual = parseInt(this.userInfo.is_mutual_follow) === 1;
      const isFollowed = parseInt(this.userInfo.is_follow) === 1 || isMutual;
      
      console.log('当前关注状态:', {isFollowed, isMutual, targetUserId});
      
      // 先更新UI状态
      this.$set(this.userInfo, 'is_follow', isFollowed ? 0 : 1);
      
      // 如果取消关注，也需要更新互相关注状态
      if (isFollowed) {
        this.$set(this.userInfo, 'is_mutual_follow', 0);
      }
      
      this.isFollowing = !isFollowed;
      
      // 显示加载提示
      uni.showToast({
        title: isFollowed ? "取消关注中..." : "关注中...",
        icon: "none",
        duration: 500
      });
      
      // 准备请求参数 - 修复参数名问题
      const params = {
        follow_uid: targetUserId,  // 修改为follow_uid，与card-gg.vue保持一致
        is_follow: isFollowed ? 0 : 1
      };
      
      console.log('发送关注请求参数:', JSON.stringify(params));
      
      followUser(params).then(res => {
        console.log('关注接口返回:', res);
        
        if (res.status === 200) {
          // 处理互相关注状态
          if (res.data && res.data.is_mutual !== undefined) {
            const isMutual = parseInt(res.data.is_mutual) === 1;
            
            // 更新用户信息中的互相关注状态
            this.$set(this.userInfo, 'is_mutual_follow', isMutual ? 1 : 0);
            console.log('更新互相关注状态:', this.userInfo.is_mutual_follow);
          }
          
          // 更新粉丝数量
          if (res.data && res.data.fans_count !== undefined) {
            this.$set(this.userInfo, 'fans_count', res.data.fans_count);
          } else {
            // 如果接口没有返回粉丝数，手动更新
            const currentFansCount = parseInt(this.userInfo.fans_count) || 0;
            this.$set(this.userInfo, 'fans_count', isFollowed ? Math.max(0, currentFansCount - 1) : currentFansCount + 1);
          }
          
          uni.showToast({
            title: isFollowed ? '已取消关注' : '关注成功',
            icon: 'none'
          });
        } else {
          // 恢复原状态 - Vue3兼容：直接赋值替代$set
          this.userInfo.is_follow = isFollowed ? 1 : 0;
          if (isMutual) {
            this.userInfo.is_mutual_follow = isMutual ? 1 : 0;
          }
          this.isFollowing = isFollowed;
          
          uni.showToast({
            title: res.msg || '操作失败，请重试',
            icon: 'none'
          });
        }
      }).catch(err => {
        // 失败时恢复状态 - Vue3兼容：直接赋值替代$set
        this.userInfo.is_follow = isFollowed ? 1 : 0;
        if (isMutual) {
          this.userInfo.is_mutual_follow = isMutual ? 1 : 0;
        }
        this.isFollowing = isFollowed;
        
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        console.error('关注操作异常:', err);
      }).finally(() => {
        this.isProcessing = false;
      });
    },
    
    /**
     * 处理点赞回调
     */
    likeClick(e) {
      const { id, isLike } = e;
      // 点赞状态已经在组件内部处理，这里可以做额外操作
      console.log('点赞状态变更', id, isLike);
    },
    
    /**
     * 处理关注回调
     */
    followBack(e) {
      const { idx, uid, is_follow, is_mutual } = e;
      console.log('关注状态回调', { idx, uid, is_follow, is_mutual });
      
      // 更新列表中对应项的关注状态
      if (this.list[idx]) {
        this.$set(this.list[idx], 'is_follow', is_follow);
        this.$set(this.list[idx], 'is_mutual_follow', is_mutual);
        
        // 如果有user_info字段，也要更新
        if (this.list[idx].user_info) {
          this.$set(this.list[idx].user_info, 'is_follow', is_follow);
          this.$set(this.list[idx].user_info, 'is_mutual_follow', is_mutual);
        }
      }
    },
    
    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
      console.log('下拉刷新');
      
      // 重置分页状态
      this.page = 1;
      this.list = [];
      this.isEmpty = false;
      this.loadStatus = 'loading';
      
      // 重新获取用户信息和动态列表
      Promise.all([
        this.getUserInfo(),
        this.loadDynamicList()
      ]).finally(() => {
        uni.stopPullDownRefresh();
      });
    },
    
    /**
     * 触底加载更多
     */
    onReachBottom() {
      console.log('触底加载更多, 当前页:', this.page, '加载状态:', this.loadStatus);
      
      // 只有在有数据且不是加载中状态时才加载更多
      if (this.loadStatus === 'more' && !this.isLoading) {
      this.loadDynamicList();
      }
    },
    barClick(e) {
      // 防止重复点击
      if (this.isThrottling) return;
      
      const newBarIdx = parseInt(e.currentTarget.dataset.idx);
      
      // 如果点击的是当前标签，不做任何操作
      if (newBarIdx === this.barIdx) return;
      
      this.isThrottling = true;
      this.barIdx = newBarIdx;
      
      console.log('切换标签:', this.barIdx, '用户ID:', this.userId, '登录用户ID:', this.loginUserId);
      
      // 检查隐私设置：只有查看其他人的"赞过"时才需要检查隐私设置
      const isOtherUserLikedTab = this.barIdx === 1 && this.userId !== this.loginUserId;
      if (isOtherUserLikedTab && this.userInfo.privacy && this.userInfo.privacy.like === 0) {
        console.log('该用户的点赞内容不可见');
        this.isEmpty = true;
        this.isThrottling = false;
        return;
      }
      
      // 显示加载状态
      uni.showLoading({
        title: '加载中...',
        mask: true
      });
      
      // 重置分页和状态
      this.page = 1;
      this.list = [];
      this.isEmpty = false;
      this.loadStatus = 'loading';
      this.isWaterfall = false; // 重置瀑布流状态
      
      // 加载数据
      this.loadDynamicList();
      
      // 重置节流状态
      setTimeout(() => {
        this.isThrottling = false;
        uni.hideLoading();
      }, 300);
    },
    followClick() {
      // 直接调用handleFollow处理关注逻辑
      this.handleFollow();
    },
    toFollow(e) {
      let type = e.currentTarget.dataset.type

      // 使用新的隐私字段进行权限检查
      if (type == 0) {
        // 查看关注列表 - 检查 follow 字段
        if (this.userInfo.privacy.follow == 0) {
          return this.opTipsPopup("由于该用户隐私设置，关注列表不可见")
        }
      } else if (type == 1) {
        // 查看粉丝列表 - 检查 fans 字段
        if (this.userInfo.privacy.fans == 0) {
          return this.opTipsPopup("由于该用户隐私设置，粉丝列表不可见")
        }
      }

      uni.navigateTo({
        url: "/pages/center/follow?type=" + type + "&id=" + this.userInfo.id + "&name=" + this.userInfo.name
      })
    },
    likePopupClick(show) {
      if (!show) {
        this.$refs.likePopup.close()
      }
      if (show) {
        this.$refs.likePopup.open()
      }
    },

    // 访客点击处理
    visitorPopupClick(show) {
      if (!show) {
        return
      }

      // 检查访客隐私设置
      if (this.userInfo.privacy.visitors == 0) {
        return this.opTipsPopup("由于该用户隐私设置，访客记录不可见")
      }

      // 只有查看自己的主页时才能看访客列表
      if (this.userInfo.id != this.loginUserId) {
        return this.opTipsPopup("只能查看自己的访客记录")
      }

      // 显示访客数量提示
      uni.showToast({
        title: `共有 ${this.userInfo.visitor_count || 0} 位访客`,
        icon: 'none'
      })

      // TODO: 如果需要访客列表页面，可以添加跳转
      // uni.navigateTo({
      //   url: "/pages/user/visitors?id=" + this.userInfo.id
      // })
    },
    navigateToFun(e) {
      uni.navigateTo({
        url: "/pages/" + e.currentTarget.dataset.url
      })
    },
    navBack() {
      if (getCurrentPages().length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({
          url: "/pages/index/index"
        })
      }
    },
    opTipsPopup(msg, back) {
      let that = this
      that.tipsTitle = msg
      that.$refs.tipsPopup.open()
      
      setTimeout(function() {
        that.$refs.tipsPopup.close()
        if (back) {
          that.navBack()
        }
      }, 2000)
    },
    navigationBarColor(color) {
      uni.setNavigationBarColor({
        frontColor: color,
        backgroundColor: "RGB(255,255,255)",
        animation: {
          duration: 400,
          timingFunc: "easeIn"
        }
      })
    },
    switchBackground(index) {
      this.currentBgIndex = index
      // 重新启动轮播定时器
      this.startCarousel()
    },
    updateBackgroundImages() {
      try {
        console.log('处理用户背景图片数据:', this.userInfo.home_background);
        
        // 清空当前背景图片数组
        this.backgroundImages = [];
        
        // 如果存在背景图片数据
        if (this.userInfo.home_background) {
          let bgImages = [];
          
          // 尝试解析JSON字符串
          if (typeof this.userInfo.home_background === 'string') {
            try {
              // 先检查是否是空字符串或"[]"
              if (this.userInfo.home_background.trim() === '' || this.userInfo.home_background.trim() === '[]') {
                bgImages = [];
              } else {
              bgImages = JSON.parse(this.userInfo.home_background);
              console.log('解析背景图片JSON成功:', bgImages);
              }
            } catch (error) {
              console.error('解析背景图片JSON失败:', error);
              // 如果解析失败，可能是单个图片URL
              if (this.userInfo.home_background.trim().startsWith('http')) {
                bgImages = [{ url: this.userInfo.home_background }];
              }
            }
          } 
          // 如果已经是数组，直接使用
          else if (Array.isArray(this.userInfo.home_background)) {
            bgImages = this.userInfo.home_background;
          }
          
          // 确保每个背景图片对象都有url属性
          this.backgroundImages = bgImages.filter(item => item && item.url && item.url.trim() !== '');
        }
        
        // 如果没有背景图片，使用用户头像作为背景
        if (this.backgroundImages.length === 0) {
          const avatarUrl = this.userInfo.avatar || '/static/img/default-bg.png';
          this.backgroundImages = [{ url: avatarUrl }];
        }
        
        console.log('处理后的背景图片数组:', this.backgroundImages);
        
        // 重置轮播索引
        this.currentBgIndex = 0;
        
        // 只有当有多张图片时才启动轮播
        if (this.backgroundImages.length > 1) {
          this.startCarousel();
        } else {
          this.clearCarouselTimer();
        }
      } catch (error) {
        console.error('处理背景图片数据异常:', error);
        // 出错时使用默认背景
        this.backgroundImages = [{ url: this.userInfo.avatar || '/static/img/default-bg.png' }];
        this.currentBgIndex = 0;
        this.clearCarouselTimer();
      }
    },
    // 启动背景轮播
    startCarousel() {
      this.clearCarouselTimer();
      
      // 如果有多张图片才启动轮播
      if (this.backgroundImages.length > 1) {
        this.carouselTimer = setInterval(() => {
          this.nextBackground();
        }, 4000); // 每4秒切换一次
      }
    },
    // 清理轮播定时器
    clearCarouselTimer() {
      if (this.carouselTimer) {
        clearInterval(this.carouselTimer);
        this.carouselTimer = null;
      }
    },
    // 下一张背景
    nextBackground() {
      if (this.backgroundImages.length > 0) {
        this.currentBgIndex = (this.currentBgIndex + 1) % this.backgroundImages.length;
      }
  },
    
    /**
     * 重试加载
     */
    retryLoad() {
      this.hasError = false;
      this.errorMessage = "";
      this.page = 1;
      this.list = [];
      this.isEmpty = false;
      this.loadStatus = 'loading';
      
      // 重新加载数据
      this.getUserInfo();
      this.loadDynamicList();
    },
    
    /**
     * 设置错误状态
     */
    setError(message) {
      this.hasError = true;
      this.errorMessage = message;
      this.loadStatus = 'more';
    },
    
    /**
     * 清除错误状态
     */
    clearError() {
      this.hasError = false;
      this.errorMessage = "";
    }
  },
  onPageScroll(e) {
    let frontColor = "#ffffff"
    let ratio = (e.scrollTop > 180 ? 180 : e.scrollTop) / 180
    
    if (ratio >= 1) {
      frontColor = "#000000"
    }
    
    this.navbarTrans = ratio
    this.navigationBarColor(frontColor)
  },
  onShareAppMessage: function() {
    return {
      title: this.userInfo.name + " 的个人名片",
      imageUrl: this.userInfo.avatar,
      path: "/pages/user/details?id=" + this.userInfo.id
    }
  },
  onShareTimeline() {
    return {
      title: this.userInfo.name + " 的个人名片",
      imageUrl: this.userInfo.avatar,
      query: "id=" + this.userInfo.id
    }
  }
}
</script>

<style>
.nav-box{
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
}
.nav-box .nav-back{
  padding: 0 30rpx;
  width: 34rpx;
}
.nav-box .nav-title{
  max-width: 60%;
  font-size: 32rpx;
  font-weight: 700;
}
.user-box{
  width: calc(100% - 60rpx);
  padding: 60rpx 30rpx;
  color: #fff;
  position: relative;
  overflow: hidden;
}
.user-box .user-img, .user-box .user-bg{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.user-box .user-bg{
  z-index: -1;
  background: rgba(0, 0, 0, .5);
}
.user-box .user-top{
  width: 100%;
  justify-content: space-between;
}
.user-top .avatar{
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #f5f5f5;
  overflow: hidden;
}
.user-top .btn{
  padding: 0 30rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: #000;
  background: #fff;
}
.user-top .active{
  color: rgba(255, 255, 255, .52);
  background: rgba(255, 255, 255, .1);
}
.user-top .mutual{
  color: #576b95;
  background: rgba(255, 255, 255, .2);
}
.user-box .user-name{
  margin: 20rpx 0 10rpx;
  width: 100%;
  font-size: 34rpx;
  font-weight: 700;
}
.user-box .user-intro{
  width: 100%;
  word-break: break-word;
  white-space: pre-line;
}
.user-box .user-intro text{
  color: #ccc;
  font-size: 24rpx;
  font-weight: 400;
}
.user-box .user-tag{
  margin: 20rpx 0;
  width: 100%;
}
.user-tag .tag-item{
  margin-right: 16rpx;
  height: 44rpx;
  padding: 0 14rpx;
  border-radius: 8rpx;
  background: rgba(255, 255, 255, .1);
  font-weight: 500;
  font-size: 20rpx;
  justify-content: center;
}
.user-tag .tag-item image{
  width: 24rpx;
  height: 24rpx;
}
.user-num .num-item{
  margin-right: 30rpx;
  font-size: 20rpx;
  font-weight: 300;
  color: #ccc;
}
.user-num .num-item .t1{
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  margin-right: 6rpx;
}
.content-box{
  margin-top: -30rpx;
  background: #fff;
  padding: 30rpx 0;
  border-radius: 30rpx 30rpx 0 0;
}
.block-box .block-title{
  padding: 0 30rpx;
  font-size: 26rpx;
  font-weight: 700;
}
.block-box .circle-box{
  width: calc(100% - 20rpx);
  padding: 30rpx 10rpx;
  display: flex;
}
.circle-box .circle-item{
  flex-shrink: 0;
  margin: 0 10rpx;
  flex-direction: column;
  justify-content: center;
}
.circle-item .circle-avatar{
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #f8f8f8;
}
.circle-item .circle-name{
  margin-top: 15rpx;
  width: 120rpx;
  color: #999;
  font-size: 20rpx;
  text-align: center;
}
.bar-box{
  position: -webkit-sticky;
  position: sticky;
  left: 0;
  z-index: 99;
  margin-top: -1px;
  width: 100%;
  height: 80rpx;
  background: #fff;
}
.bar-box .bar-item{
  padding: 0 30rpx;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  position: relative;
}
.bar-box .bar-item text{
  font-weight: 700;
  transition: all .3s ease-in-out;
}
.bar-item .bar-line{
  position: absolute;
  bottom: 12rpx;
  width: 18rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #000;
  transition: opacity .3s ease-in-out;
}
.content-box .dynamic-box{
  width: calc(100% - 16rpx);
  padding: 22rpx 8rpx 0;
}
.loading-box {
  width: 100%;
  padding: 60rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.load-more-box {
  width: 100%;
  padding: 30rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
.error-box{
  width: 100%;
  padding: 100rpx 0;
  flex-direction: column;
}
.error-box image{
  width: 300rpx;
  height: 300rpx;
  margin-bottom: 30rpx;
}
.error-box .e1{
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
}
.error-box .e2{
  margin-top: 10rpx;
  color: #999;
  font-size: 26rpx;
  text-align: center;
  padding: 0 60rpx;
}
.error-box .retry-btn{
  margin-top: 40rpx;
  width: 200rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
  background: #007aff;
  border-radius: 40rpx;
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
.xwb{
  filter: invert(1);
}
.background-carousel {
  position: relative;
  width: 100%;
  height: 100%;
}
.carousel-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}
.carousel-item.active {
  opacity: 1;
}
.carousel-indicators {
  position: absolute;
  bottom: 20rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}
.indicator {
  width: 12rpx;
  height: 4rpx;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 2rpx;
  margin: 0 4rpx;
  cursor: pointer;
}
.indicator.active {
  background-color: #fff;
}
.default-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.like-popup{
  width: 400rpx;
  background: #fff;
  padding: 30rpx;
  border-radius: 30rpx;
  overflow: hidden;
}
.like-popup .like-img{
  margin: 0 40rpx;
  width: 320rpx;
  height: 200rpx;
}
.like-popup .like-content{
  margin: 20rpx 0 40rpx;
  width: 100%;
  color: #333;
  font-size: 26rpx;
  text-align: center;
}
.like-popup .like-btn{
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
</style> 