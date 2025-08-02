<!--
  个人中心页面 - 优化版本
  
  主要优化内容：
  1. 登录状态检查优化：
     - 添加10秒内不重复检查的机制
     - 缓存登录状态，避免频繁检查
     - 使用状态跟踪，减少不必要的API调用
  
  2. 页面刷新优化：
     - 增加防抖时间到1秒
     - 添加页面初始化状态跟踪
     - 优化onShow生命周期，避免重复初始化
  
  3. 数据加载优化：
     - 静默刷新机制，只刷新必要数据
     - 访问记录频率限制（1分钟内不重复记录）
     - 优化加载状态管理，避免状态冲突
  
  4. 导航栏优化：
     - 减少不必要的颜色变化调用
     - 添加状态跟踪，只在必要时更新
  
  5. 错误处理优化：
     - 区分不同类型的错误，避免不必要的提示
     - 优化重试机制
  
  这些优化将显著减少页面的频繁刷新和登录检查，提升用户体验。
-->
<template>
  <view class="container" :class="{'no-scroll': showSidebar}">
    <view class="nav-box" :style="{'padding-top': statusBarHeight + 'px', 'background': 'rgba(255,255,255,'+ navbarTrans +')'}">
      <view class="nav-item df" :style="{'height': titleBarHeight + 'px'}">
        <view class="nav-menu-btn" @tap="toggleSidebar">
          <image src="/static/img/menu.png"></image>
        </view>
        <view class="ohto df" :style="{'transform': 'translateY('+ ((1-navbarTrans) * 30) +'px)', 'opacity': navbarTrans}">
          <image :src="userInfo.avatar" mode="aspectFill" class="nav-user-avatar"></image>
          <text>{{userInfo.nickname}}</text>
        </view>
      </view>
    </view>
    <view class="user-box" :style="{'padding-top': statusBarHeight + titleBarHeight + 'px'}">
      <view class="user-bg"></view>
      <view class="user-img" style="z-index:-2">
        <lazy-image :src="userInfo.avatar || '/static/img/avatar.png'" mode="aspectFill"></lazy-image>
      </view>
      <view class="user-top df" @tap="handleUserTopClick" style="position: relative; padding-right: 40rpx; padding-top: 40rpx;">
        <view class="avatar-wrapper" @tap.stop="handleAvatarClick">
          <view class="avatar">
            <lazy-image :src="userInfo.avatar || '/static/img/avatar.png'"></lazy-image>

          </view>
        </view>
        <view class="user-info" @tap.stop="handleUserInfoClick">
          <view class="user-name-row df">
            <text class="user-name-text">{{userInfo.nickname}}</text>
            <view class="status-icon vip-icon" v-if="userInfo.is_money_level> 0 && userInfo.svip_open">
              <image src="/static/img/svip.gif"></image>
            </view>
            <view class="status-icon verified-icon" v-if="userInfo.is_verified">
              <image src="/static/img/rz.png"></image>
            </view>
          </view>
          <view class="user-id-row df">
            <view v-if="userInfo.sex != 2" class="sex-icon df">
              <image :src="userInfo.sex == 1 ? '/static/img/nan.png' : '/static/img/nv.png'"></image>
            </view>
            <text class="user-id">ID: {{userInfo.user_id_number}}</text>
          </view>
        </view>
        <view class="right-arrow">
          <image src="/static/img/x.png" mode="aspectFit"></image>
        </view>
      </view>

      <view class="user-num-wrap df">
        <view class="user-num df">
          <view class="num-item df" @tap="toFollowList(0)">
            <text class="t1">{{userInfo.follow_count}}</text>
            <text class="t2">关注</text>
          </view>
          <view class="num-item df" @tap="toFollowList(1)">
            <text class="t1">{{userInfo.fans_count}}</text>
            <text class="t2">粉丝</text>
          </view>
          <view class="num-item df" @tap="likePopupClick(true)">
            <text class="t1">{{userInfo.like_count_str}}</text>
            <text class="t2">获赞</text>
          </view>
          <view class="num-item df visitor-item" data-url="center/visitor" @tap="navigateToFun">
            <text class="t1">{{userInfo.visitor_count}}</text>
            <text class="t2">访客</text>
            <view v-if="userInfo.visitor_badge" class="badge">+{{userInfo.visitor_badge > 99 ? '99+' : userInfo.visitor_badge}}</view>
          </view>
        </view>
      </view>
      <view class="tag-wrapper">
        <view v-if="userInfo.interest_tags && userInfo.interest_tags.length" class="user-tag df">
          <view v-for="(tag, index) in userInfo.interest_tags" :key="index" class="tag-item df">
            <text>{{tag}}</text>
          </view>
        </view>
        <view v-else class="tag-empty">
          <text>添加兴趣标签，让大家更了解你</text>
        </view>
        <view class="user-actions df">
          <view class="btn-icon" data-url="setting/index" @tap="navigateToFun">
            <image src="/static/img/setting/104.png"></image>
          </view>
        </view>
      </view>
      <view class="user-intro" data-url="center/means" @tap="navigateToFun">
        <text class="intro-text" user-select="true">{{userInfo.about_me ? userInfo.about_me : "添加个人简介，让大家认识你..."}}</text>
        <view class="more-btn">
          <image src="/static/img/more.png" mode="aspectFit"></image>
        </view>
      </view>
      

    </view>
    <scroll-view scroll-x="true" class="user-block">
      <view class="block-box">
        <view v-if="userInfo.activity_count" class="block-item df" data-url="activity/index?type=1" @tap="navigateToFun">
          <view class="block-title" style="margin-right:68rpx">
            <view class="t1">活动</view>
            <view class="t2">{{userInfo.activity_count ? '共' + userInfo.activity_count + '个活动' : '没有参加活动'}}</view>
          </view>
          <view class="cu-group df">
            <view class="cu-item" :style="{'background': userInfo.activity_img ? '#CECECE' : '#000'}">
              <image v-if="!userInfo.activity_img" class="icon" src="/static/img/hd.png"></image>
              <image v-else class="img" :src="userInfo.activity_img" mode="aspectFill"></image>
            </view>
            <view class="cu-lump1"></view>
            <view class="cu-lump2"></view>
          </view>
          <image class="block-icon" src="/static/img/x.png"></image>
        </view>
        <view v-for="(item, index) in blockList" :key="index" class="block-item df" :data-url="item.url" @tap="navigateToFun">
          <view class="block-title" style="margin-right:68rpx">
            <view class="t1">{{item.name}}</view>
            <view v-if="item.count" class="t2">
              共{{item.count}}{{index == 0 ? '个圈子' : index == 1 ? '件商品' : '笔订单'}}
            </view>
            <view v-else class="t2">
              {{index == 0 ? '没有加入圈子' : index == 1 ? '购物车空空的' : '订单空空的'}}
            </view>
          </view>
          <view class="cu-group df">
            <view class="cu-item" :style="{'background': item.img ? '#CECECE' : '#000'}">
              <image v-if="!item.img" class="icon" :src="item.icon"></image>
              <image v-else class="img" :src="item.img" mode="aspectFill"></image>
            </view>
            <view class="cu-lump1"></view>
            <view class="cu-lump2"></view>
          </view>
          <image class="block-icon" src="/static/img/x.png"></image>
        </view>
        <view v-if="appCard || userInfo.card_count" class="block-item df" data-url="center/card?type=1" @tap="navigateToFun">
          <view class="block-title" style="margin-right:68rpx">
            <view class="t1">卡券</view>
            <view class="t2">{{userInfo.card_count ? '共' + userInfo.card_count + '张卡券' : '暂无可用卡券'}}</view>
          </view>
          <view class="cu-group df">
            <view class="cu-item" style="background:#000">
              <image class="icon" src="/static/img/kq.png"></image>
            </view>
            <view class="cu-lump1"></view>
            <view class="cu-lump2"></view>
          </view>
          <image class="block-icon" src="/static/img/x.png"></image>
        </view>
        <view style="flex-shrink:0;width:15rpx;height:15rpx"></view>
      </view>
    </scroll-view>
    <view class="bar-box df" :style="{'top': statusBarHeight + titleBarHeight - 1 + 'px'}">
      <view v-for="(item, index) in barList" :key="index" class="bar-item df" @tap="barClick" :data-idx="index">
        <text :style="{'color': index == barIdx ? '#000' : '#999', 'font-size': index == barIdx ? '28rpx' : '26rpx'}">{{item}}</text>
        <view :style="{'opacity': index == barIdx ? 1 : 0}" class="bar-line"></view>
      </view>
    </view>
    <!-- 优化的加载状态显示 - 有缓存数据时不显示 -->
    <view class="loading-indicator df" :style="{'height': (!isThrottling && (loadStatus == 'loading' || loadingState.pullRefresh) && list.length === 0) ? '60rpx' : '0px'}">
      <uni-load-more v-if="!isThrottling && (loadStatus == 'loading' || loadingState.pullRefresh) && list.length === 0" :status="'loading'"></uni-load-more>
    </view>

    <view class="content-container">
      <!-- 未登录状态 -->
      <emptyPage
        v-if="!isLogin"
        :title="getUnloginTitle()"
        :description="getUnloginDescription()"
        image="/static/img/empty.png"
        buttonText="立即登录"
        @buttonClick="handleLogin"
      />

      <!-- 已登录但为空状态 -->
      <emptyPage
        v-else-if="isEmpty && !loadingState.dynamicList"
        :title="getEmptyTitle()"
        :description="getEmptySubtitle()"
        image="/static/img/empty.png"
      />

      <!-- 加载中状态 -->
      <view v-else-if="loadingState.dynamicList && list.length === 0" class="loading-state df">
        <uni-load-more :status="'loading'"></uni-load-more>
        <view class="loading-text">正在加载内容...</view>
      </view>

      <!-- 内容列表 -->
      <block v-else>
        <block v-for="(item, index) in list" :key="item.id || index">
          <card-gg v-if="barIdx == 1" :item="item" :idx="index"></card-gg>
          <card-wd v-else :item="item" :idx="index" :bar="barIdx" @delback="delClick"></card-wd>
        </block>
      </block>

      <!-- 底部加载更多状态 -->
      <uni-load-more v-if="list.length > 0" :status="loadStatus"></uni-load-more>
    </view>
    <uni-popup ref="likePopup" class="r">
      <view class="like-popup">
        <image class="like-img" src="/static/img/inset/like.png" mode="aspectFill"></image>
        <view class="like-content"><text>"</text>{{userInfo.nickname}}<text>"</text>共获得 {{userInfo.like_count || 0}} 个赞 </view>
        <view class="like-btn" @tap="likePopupClick(false)">确认</view>
      </view>
    </uni-popup>
    <tabbar :currentPage="4" :currentMsg="currentMsg" :userAvatar="userInfo.avatar"></tabbar>
    <view class="sidebar-menu" :class="{'active': showSidebar}">
      <view class="sidebar-header" :style="{'padding-top': statusBarHeight + 10 + 'px'}">
        <view class="sidebar-user-info">
          <image :src="userInfo.avatar || '/static/img/avatar.png'" mode="aspectFill" class="sidebar-avatar"></image>
          <view class="sidebar-user-details">
            <view class="sidebar-user-name">{{userInfo.nickname}}</view>
            <view class="user-status">
              <view class="status-item" v-if="userInfo.is_money_level> 0 && userInfo.svip_open">
                <image src="/static/img/svip.gif" class="status-icon"></image>
              </view>
              <view class="status-item verified-tag" v-if="userInfo.is_verified">
                <image src="/static/img/rz.png" class="status-icon"></image>
                <text>已认证</text>
              </view>
            </view>
          </view>
        </view>
        <view class="close-btn df" @tap="toggleSidebar">
          <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx;"></image>
        </view>
      </view>
      <view class="member-card">
        <view class="member-status">
          <view v-if="userInfo.vip_status == 1" class="member-label">永久会员</view>
          <view v-else-if="userInfo.vip_status == 3" class="member-label">
            会员到期：{{ formatDate(userInfo.overdue_time) }}
          </view>
          <view v-else-if="userInfo.vip_status == -1" class="member-label">会员已过期</view>
          <view v-else-if="userInfo.vip_status == 2" class="member-label">未开通会员</view>
          <view v-if="userInfo.vip_status != 1" class="member-price" @tap="goToVipPage">¥3.8续费</view>
        </view>
        <view class="member-benefits">
          <text class="member-rights" @tap="goToVipPage">会员权益 | 领取我的等级特权</text>
        </view>
        <view class="member-desc">专属优惠，VIP低至¥88，畅听1年！</view>
      </view>
      <scroll-view scroll-y class="sidebar-scroll">
        <view class="sidebar-content">
          <view class="menu-section">
            <view class="section-title">我的服务</view>
            <view class="menu-grid">
            <view 
                v-for="(item, index) in sidebarMenu" 
                :key="'menu-' + index" 
                class="grid-item" 
              :data-url="item.url" 
              @tap="navigateToFun">
                <view class="grid-icon-wrapper">
                  <image :src="item.icon" class="grid-icon"></image>
                  <view v-if="item.badge" class="grid-badge">{{item.badge}}</view>
              </view>
                <text class="grid-text">{{item.name}}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="sidebar-footer">
        <view class="bottom-nav df">
          <view class="bottom-nav-item df" @tap="handleBottomNav('scan')">
            <view class="nav-icon-box df">
              <image src="/static/img/scan.png" class="nav-icon"></image>
            </view>
            <text class="nav-text">扫一扫</text>
          </view>
          <view class="bottom-nav-item df" @tap="handleBottomNav('help')">
            <view class="nav-icon-box df">
              <image src="/static/img/kf.png" class="nav-icon"></image>
            </view>
            <text class="nav-text">帮助与客服</text>
          </view>
          <view class="bottom-nav-item df" @tap="handleBottomNav('setting')">
            <view class="nav-icon-box df">
              <image src="/static/img/setting/104.png" class="nav-icon"></image>
            </view>
            <text class="nav-text">设置</text>
          </view>
        </view>
        <view class="copyright-text">© {{currentYear}} 个人中心</view>
      </view>
    </view>
    <view class="sidebar-mask" v-if="showSidebar" @tap="toggleSidebar" @touchmove.stop.prevent @touchstart.stop @touchend.stop></view>
  </view>
</template>

<script>
import lazyImage from '@/components/lazyImage/lazyImage'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more'
import cardWd from '@/components/card-wd/card-wd'
import cardGg from '@/components/card-gg/card-gg'
import tabbar from '@/components/tabbar/tabbar'
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
import emptyPage from '@/components/emptyPage/emptyPage.vue'
import { getMenuList, setVisit } from '@/api/user.js'
import { getMyDynamicList, likeDynamic, deleteDynamic, getUserSocialInfo, getLikeDynamicList, getVisitorDetails } from '@/api/social.js'
import { toLogin } from '@/libs/login.js'
import { mapGetters } from "vuex"
// 引入Pinia stores
import { useUserStore } from '@/stores/user.js'
import { useAppStore } from '@/stores/app.js'
import { useSocialStore } from '@/stores/social.js'

export default {
  components: {
    lazyImage,
    uniLoadMore,
    cardWd,
    cardGg,
    tabbar,
    uniPopup,
    emptyPage
  },
  computed: {
    ...mapGetters({
      isLogin: 'isLogin'
    }),

    // Pinia stores实例
    userStore() {
      return useUserStore()
    },
    appStore() {
      return useAppStore()
    },
    socialStore() {
      return useSocialStore()
    }
  },
  data() {
    return {
      // Pinia stores实例将在computed中定义

      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      currentMsg: 0,
      currentYear: new Date().getFullYear(),
      scrollTop: 0,
      navbarTrans: 0,
      userInfo: {
        avatar: "",
        nickname: "您还未登录哦~",
        follow_count: 0,
        fans_count: 0,
        like_count: 0,
        like_count_str: "0",
        visitor_count: 0,
        visitor_badge: 0,
        is_verified: 0,
        is_money_level: 0,
        svip_open: 0,
        sex: 0,
        user_id_number: "",
        about_me: "",
        interest_tags: [],
        vip_status: 0,
        overdue_time: "",
        card_count: 0,
        activity_count: 0,
        activity_img: ""
      },
      blockList: [
        {name: '圈子', img: '', icon: '/static/img/qz.png', url: 'center/circle?type=1', count: 0},
        {name: '购物车', img: '', icon: '/static/img/gwc.png', url: 'goods/cart', count: 0},
        {name: '订单', img: '', icon: '/static/img/dd.png', url: 'order/index', count: 0}
      ],
      barList: ['笔记', '赞过'],
      barIdx: 0,
      list: [],
      page: 1,
      totalCount: 0,
      isEmpty: false,
      loadStatus: 'more',
      showSidebar: false,
      sidebarMenu: [],
      isLoading: false,
      isThrottling: false,
      appCard: true,

      // 优化后的数据管理变量
      lastRefreshTime: 0,
      refreshInterval: 300000, // 5分钟刷新间隔

      // 优化的加载状态管理 - 避免状态冲突，使用语义化命名
      loadingState: {
        userInfo: false,        // 用户信息加载状态
        dynamicList: false,     // 动态列表加载状态
        pullRefresh: false,     // 下拉刷新状态
        loadMore: false         // 加载更多状态
      },

      // 简化的定时器管理
      refreshTimer: null,

      // 简化的缓存策略
      cacheTimeout: 300000, // 5分钟统一缓存时间
      lastRefreshTime: 0,   // 最后刷新时间

      // tab数据缓存
      tabDataCache: {
        0: { data: [], timestamp: 0, totalCount: 0 }, // 笔记数据缓存
        1: { data: [], timestamp: 0, totalCount: 0 }  // 点赞数据缓存
      },

      // 错误重试机制
      retryConfig: {
        maxRetries: 3,
        retryDelay: 1000,
        currentRetries: {
          userInfo: 0,
          dynamicList: 0
        }
      },

      // 新增：登录状态检查优化
      loginCheckState: {
        lastCheckTime: 0,
        checkInterval: 10000, // 10秒内不重复检查
        isChecking: false,
        lastLoginState: null
      },

      // 新增：页面状态管理
      pageState: {
        isInitialized: false,
        lastVisitTime: 0,
        visitInterval: 60000, // 1分钟内不重复记录访问
        hasShown: false
      },

      // 新增：导航栏状态跟踪
      lastNavColorState: false
    }
  },
  onPullDownRefresh() {
    // 使用缓存的登录状态检查，避免重复检查
    const isLoggedIn = this.checkLoginStatus();
    if (!isLoggedIn) {
      uni.stopPullDownRefresh();
      return;
    }
    
    // 如果正在刷新中，直接停止下拉刷新
    if (this.loadingState.pullRefresh) {
      uni.stopPullDownRefresh();
      return;
    }
    
    this.refreshData(true);
  },
  onLoad() {
    this.navigationBarColor(0);

    // 初始化Pinia stores（这会从存储恢复状态并同步到Vuex）
    this.initPiniaStores();

    // 注册事件监听
    uni.$on('loginStateChanged', this.handleLoginStateChanged);
    uni.$on('userInfoUpdated', this.handleUserInfoUpdate);

    // 先加载缓存数据，提升首屏体验
    this.loadUserFromCache();

    // 等待状态同步完成后再检查登录状态
    this.$nextTick(() => {
      // 检查登录状态（使用优化后的检查方法）
      const isLoggedIn = this.checkLoginStatus(true);
      
      if (isLoggedIn) {
        // 异步初始化页面数据
        this.initPageData();
      } else {
        // 未登录状态，设置页面为已初始化，避免重复检查
        this.pageState.isInitialized = true;
      }
    });
  },
  onUnload() {
    uni.$off('userInfoUpdated', this.handleUserInfoUpdate);
    uni.$off('loginStateChanged', this.handleLoginStateChanged);
    
    // 清除所有定时器
    this.clearAllTimers();
  },
  onShow() {
    this.navigationBarColor(0);

    // 清理过期的tab数据缓存
    this.cleanExpiredTabCache();

    // 优化：只在必要时检查登录状态和刷新数据
    this.handlePageShow();
  },
  methods: {
    // 新增：优化页面显示处理
    handlePageShow() {
      // 检查是否已经初始化过
      if (!this.pageState.isInitialized) {
        this.pageState.isInitialized = true;
        this.initPageData();
        return;
      }

      // 检查登录状态变化
      const currentLoginState = this.isLogin && this.$store.state.app.token;
      if (this.loginCheckState.lastLoginState !== currentLoginState) {
        this.loginCheckState.lastLoginState = currentLoginState;
        
        if (currentLoginState) {
          // 登录状态变为已登录，静默刷新数据
          this.silentRefresh();
        } else {
          // 登录状态变为未登录，重置数据
          this.resetUserInfo();
        }
      }

      // 记录访问（限制频率）
      this.recordVisitIfNeeded();
    },

    // 新增：静默刷新数据
    async silentRefresh() {
      if (this.loadingState.pullRefresh || this.loadingState.userInfo) {
        return;
      }

      try {
        // 只刷新用户信息，不刷新列表数据
        await this.getUserSocialInfo(true);
      } catch (error) {
        console.log('静默刷新失败:', error);
      }
    },

    // 新增：记录访问（带频率限制）
    recordVisitIfNeeded() {
      const now = Date.now();
      if (now - this.pageState.lastVisitTime > this.pageState.visitInterval) {
        this.pageState.lastVisitTime = now;
        this.setVisit();
      }
    },

    // 简化的Pinia stores初始化
    initPiniaStores() {
      // 从本地存储初始化状态
      this.userStore.initFromStorage()
      this.appStore.initFromStorage()

      console.log('Pinia stores初始化完成:', {
        主题模式: this.appStore.theme.mode,
        用户登录状态: this.userStore.isLoggedIn
      })
    },

    // 使用本地缓存替代Pinia缓存
    cacheDynamicDataToLocal() {
      if (this.list.length > 0) {
        const cacheKey = `dynamic_cache_${this.barIdx === 0 ? 'notes' : 'likes'}`
        const cacheData = {
          data: this.list.slice(0, 20), // 只缓存前20条
          timestamp: Date.now(),
          totalCount: this.totalCount
        }

        try {
          uni.setStorageSync(cacheKey, JSON.stringify(cacheData))
          console.log('动态数据已缓存到本地:', {
            类型: this.barIdx === 0 ? 'notes' : 'likes',
            数据量: this.list.length
          })
        } catch (error) {
          console.warn('缓存数据失败:', error)
        }
      }
    },

    // 从本地缓存加载数据
    loadDataFromLocalCache() {
      const cacheKey = `dynamic_cache_${this.barIdx === 0 ? 'notes' : 'likes'}`

      try {
        const cacheStr = uni.getStorageSync(cacheKey)
        if (!cacheStr) return false

        const cache = JSON.parse(cacheStr)
        const now = Date.now()
        const timeout = 300000 // 5分钟

        // 检查缓存是否过期
        if (now - cache.timestamp > timeout) {
          uni.removeStorageSync(cacheKey)
          return false
        }

        this.list = [...cache.data]
        this.totalCount = cache.totalCount
        this.isEmpty = this.list.length === 0
        this.loadStatus = this.list.length >= this.totalCount ? 'noMore' : 'more'

        console.log('从本地缓存加载数据:', {
          类型: this.barIdx === 0 ? 'notes' : 'likes',
          数据量: this.list.length,
          缓存时间: new Date(cache.timestamp).toLocaleString()
        })

        return true
      } catch (error) {
        console.warn('加载缓存数据失败:', error)
        return false
      }
    },

    // 优化：统一登录状态检查
    checkLoginStatus(redirectToLogin = false) {
      const now = Date.now();
      
      // 频率限制：10秒内不重复检查
      if (now - this.loginCheckState.lastCheckTime < this.loginCheckState.checkInterval) {
        return this.loginCheckState.lastLoginState;
      }

      this.loginCheckState.lastCheckTime = now;
      this.loginCheckState.isChecking = true;

      // 简化的登录状态检查，主要使用Vuex
      const isLoggedIn = this.isLogin && this.$store.state.app.token;

      console.log('登录状态检查结果:', {
        登录状态: isLoggedIn,
        Token存在: !!this.$store.state.app.token,
        是否重定向: redirectToLogin
      });

      // #ifdef H5 || APP-PLUS
      if (!isLoggedIn && redirectToLogin) {
        console.log('未登录，跳转到登录页面');
        toLogin();
        this.loginCheckState.isChecking = false;
        return false;
      }
      // #endif

      this.loginCheckState.lastLoginState = isLoggedIn;
      this.loginCheckState.isChecking = false;
      return isLoggedIn;
    },
    
    // 清除定时器
    clearAllTimers() {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
    },

    // 优化：防抖刷新方法
    debounceRefresh() {
      // 如果正在刷新或检查中，直接返回
      if (this.loadingState.pullRefresh || this.loginCheckState.isChecking) {
        console.log('正在刷新或检查中，跳过防抖刷新');
        return;
      }

      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
      }

      this.refreshTimer = setTimeout(() => {
        // 再次检查是否正在刷新
        if (!this.loadingState.pullRefresh && !this.loginCheckState.isChecking) {
          this.refreshData();
        }
      }, 1000); // 增加防抖时间到1秒
    },

    // 优化：数据刷新检查
    checkAndRefreshData() {
      if (!this.checkLoginStatus()) {
        return;
      }

      const now = Date.now();

      // 检查是否需要刷新（统一5分钟缓存）
      if (now - this.lastRefreshTime > this.cacheTimeout) {
        this.refreshData();
      }
    },
    
    async initPageData() {
      try {
        // 异步获取侧边栏菜单（优化：使用缓存）
        this.getSidebarMenu().catch(err => {
          console.log('获取侧边栏菜单失败:', err);
        });

        if (!this.isLogin) {
          this.isEmpty = true;
          this.list = [];
          return;
        }

        // 并行加载用户信息和动态列表
        await Promise.allSettled([
          this.getUserSocialInfo(false),
          this.loadTabData({ isRefresh: false, silent: false })
        ]);

      } catch (error) {
        console.error('页面初始化失败:', error);
        this.showErrorToast('页面加载失败，请稍后重试');
      } finally {
        // 异步记录访问
        this.$nextTick(() => {
          this.recordVisitIfNeeded();
        });
      }
    },

    // 错误处理方法
    handleUserInfoError(error) {
      console.error('用户信息加载失败:', error);
      // 用户信息加载失败时的降级处理
      if (!this.userInfo.nickname || this.userInfo.nickname === "您还未登录哦~") {
        this.userInfo.nickname = "加载失败";
        this.userInfo.avatar = "/static/img/avatar.png";
      }
    },

    handleDynamicListError(error) {
      console.error('动态列表加载失败:', error);
      // 动态列表加载失败时的处理
      if (this.list.length === 0) {
        this.isEmpty = true;
        this.loadStatus = 'more';
      }
    },

    showErrorToast(message, duration = 2000) {
      uni.showToast({
        title: message,
        icon: 'none',
        duration: duration
      });
    },
    
    loadUserFromCache() {
      try {
        const cachedUserInfo = uni.getStorageSync('USER_INFO');
        if (cachedUserInfo && typeof cachedUserInfo === 'object') {
          this.userInfo = {...this.userInfo, ...cachedUserInfo};
          this.$store.commit("UPDATE_USERINFO", cachedUserInfo);
          this.userClick();
        } else if (typeof cachedUserInfo === 'string') {
          try {
            const parsedInfo = JSON.parse(cachedUserInfo);
            this.userInfo = {...this.userInfo, ...parsedInfo};
            this.$store.commit("UPDATE_USERINFO", parsedInfo);
            this.userClick();
          } catch (e) {
            console.error('解析缓存用户信息失败:', e);
          }
        }
      } catch (e) {
        console.error('读取缓存用户信息失败:', e);
      }
    },

    // 清理过期的tab数据缓存
    cleanExpiredTabCache() {
      const now = Date.now();
      Object.keys(this.tabDataCache).forEach(key => {
        const cache = this.tabDataCache[key];
        if (cache.timestamp && (now - cache.timestamp > this.cacheTimeout)) {
          this.tabDataCache[key] = { data: [], timestamp: 0, totalCount: 0 };
        }
      });
    },
    
    async refreshData(isPullDown = false) {
      // 防止重复刷新
      if (this.loadingState.pullRefresh) {
        console.log('刷新已在进行中，跳过本次刷新');
        if (isPullDown) {
          uni.stopPullDownRefresh();
        }
        return;
      }

      // 检查登录状态
      if (!this.checkLoginStatus()) {
        if (isPullDown) {
          uni.stopPullDownRefresh();
        }
        return;
      }

      // 设置刷新状态
      this.loadingState.pullRefresh = true;

      try {
        // 重置页码
        this.page = 1;

        // 优化：等待所有正在进行的请求完成，避免状态冲突
        await this.waitForLoadingComplete();

        // 串行执行，避免状态冲突
        await this.getUserSocialInfo(false).catch(err => {
          console.error('刷新用户信息失败:', err);
        });

        await this.loadTabData({ isRefresh: true, silent: false }).catch(err => {
          console.error('刷新动态列表失败:', err);
        });

        // 更新最后刷新时间
        this.lastRefreshTime = Date.now();

      } finally {
        this.loadingState.pullRefresh = false;
        if (isPullDown) {
          uni.stopPullDownRefresh();
        }
      }
    },

    // 新增：等待所有加载完成
    async waitForLoadingComplete(maxWait = 3000) {
      const startTime = Date.now();
      while ((this.loadingState.userInfo || this.loadingState.dynamicList) &&
             (Date.now() - startTime < maxWait)) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    },
    
    handleLoginStateChanged(isLoggedIn) {
      // 更新登录状态缓存
      this.loginCheckState.lastLoginState = isLoggedIn;
      
      if (isLoggedIn) {
        // 登录状态变更为已登录，刷新数据
        this.getUserSocialInfo(true).catch(err => {
          console.log('登录状态变更后刷新用户信息失败:', err);
        });
        this.loadTabData({ isRefresh: false, silent: true }).catch(err => {
          if (err.message !== '正在加载中') {
            console.log('登录状态变更后刷新动态列表失败:', err);
          }
        });
      } else {
        // 登录状态变更为未登录，重置用户信息
        this.resetUserInfo();
      }
    },
    
    resetUserInfo() {
      this.userInfo = {
        avatar: '/static/img/avatar.png',
        nickname: '未登录',
        about_me: '', 
        follow_count: 0,
        fans_count: 0,
        like_count: 0,
        like_count_str: '0',
        visitor_count: 0,
        visitor_badge: 0
      };
      this.$store.commit("LOGOUT");
      
      // 重置数据状态
      this.list = [];
      this.isEmpty = true;
      this.loadStatus = 'more';
      this.page = 1;
      
      // 重置加载状态
      Object.keys(this.loadingState).forEach(key => {
        this.loadingState[key] = false;
      });

      // 重置刷新时间
      this.lastRefreshTime = 0;
    },
    
    handleApiError(err) {
      if (err && (err.statusCode === 401 || err.code === 401 || err.status === 401)) {
        uni.showToast({
          title: '登录信息已过期，请重新登录',
          icon: 'none',
          duration: 2000
        });
        this.resetUserInfo();
        setTimeout(() => toLogin(), 1500);
        return true;
      }
      return false;
    },
    
    async getUserSocialInfo(silent = false, retryCount = 0) {
      // 防止重复请求
      if (this.loadingState.userInfo) {
        const errorMsg = '正在加载中';
        if (!silent) {
          this.showErrorToast('用户信息加载中，请稍候', 1500);
        }
        return Promise.reject(new Error(errorMsg));
      }

      // 检查登录状态（使用缓存的检查结果）
      const isLoggedIn = this.checkLoginStatus();
      if (!isLoggedIn) {
        const errorMsg = '未登录';
        if (!silent) {
          console.log('用户未登录，跳过获取用户信息');
        }
        return Promise.reject(new Error(errorMsg));
      }

      // 设置加载状态
      this.loadingState.userInfo = true;

      // 非静默模式下显示加载提示
      if (!silent) {
        uni.showLoading({
          title: '加载中...',
          mask: false
        });
      }

      try {
        const res = await getUserSocialInfo();

        // 更新请求时间
        this.lastRefreshTime = Date.now();

        if (res.status === 200 || res.code === 200) {
          const socialData = res.data;

          // 数据处理
          if (socialData.like_count !== undefined) {
            socialData.like_count_str = socialData.like_count > 999 ?
              (socialData.like_count/1000).toFixed(1) + 'k' :
              socialData.like_count.toString();
          }

          if (!socialData.uid && this.$store.state.app.userInfo?.uid) {
            socialData.uid = this.$store.state.app.userInfo.uid;
          }

          // 更新用户信息
          this.userInfo = {...this.userInfo, ...socialData};
          this.$store.commit("UPDATE_USERINFO", socialData);
          this.userClick();

          if (socialData.service_num !== undefined) {
            this.currentMsg = socialData.service_num;
          }

          // 重置重试计数
          this.retryConfig.currentRetries.userInfo = 0;

          return socialData;
        } else {
          throw new Error(res.msg || '获取用户信息失败');
        }

      } catch (err) {
        // 处理API错误
        if (this.handleApiError(err)) {
          return Promise.reject(err);
        }

        // 重试机制
        if (retryCount < this.retryConfig.maxRetries && !silent) {
          console.log(`用户信息获取失败，正在重试 ${retryCount + 1}/${this.retryConfig.maxRetries}`);

          await new Promise(resolve =>
            setTimeout(resolve, this.retryConfig.retryDelay * (retryCount + 1))
          );

          return this.getUserSocialInfo(silent, retryCount + 1);
        }

        // 降级处理
        if (this.$store.state.app.userInfo && !this.userInfo.nickname) {
          this.userInfo = {...this.userInfo, ...this.$store.state.app.userInfo};
          this.userClick();
        }

        throw err;

      } finally {
        this.loadingState.userInfo = false;
        if (!silent) {
          uni.hideLoading();
        }
      }
    },
    
    getUserInfo(silent = false) {
      return this.getUserSocialInfo(silent);
    },
    
    // 优化：统一的数据加载方法
    async loadTabData(options = {}) {
      const {
        tabIndex = this.barIdx,
        isRefresh = false,
        silent = false,
        retryCount = 0
      } = options;

      // 检查登录状态（使用缓存的检查结果）
      const isLoggedIn = this.checkLoginStatus();
      if (!isLoggedIn) {
        this.resetTabState();
        return Promise.reject(new Error('未登录状态'));
      }

      // 防止重复请求
      if (this.loadingState.dynamicList) {
        const errorMsg = '正在加载中';
        if (!silent) {
          this.showErrorToast('动态列表加载中，请稍候', 1500);
        }
        return Promise.reject(new Error(errorMsg));
      }

      // 设置加载状态
      this.loadingState.dynamicList = true;
      if (!silent) {
        this.loadStatus = 'loading';
      }

      // 重置页码
      if (isRefresh) this.page = 1;

      try {
        const res = await this.getTabApiData(tabIndex);
        return this.handleApiResponse(res, isRefresh, silent);
      } catch (err) {
        return this.handleApiError(err, silent, retryCount, options);
      } finally {
        this.loadingState.dynamicList = false;
      }
    },

    // 优化：根据tab获取对应的API数据
    async getTabApiData(tabIndex) {
      const loginUserId = this.$store.state.app.uid || 0;
      const params = { page: this.page, limit: 10 };

      switch (tabIndex) {
        case 0:
          return await getMyDynamicList(params);
        case 1:
          return await getLikeDynamicList(loginUserId, params);
        default:
          throw new Error(`未知的tabIndex: ${tabIndex}`);
      }
    },

    // 优化：统一的API响应处理
    handleApiResponse(res, isRefresh, silent = false) {
      if (!silent) {
        this.loadStatus = 'more';
      }

      if (res.status == 200 && res.data) {
        this.updateListData(res.data, isRefresh);
        this.cacheDynamicDataToLocal(); // 使用本地缓存
        this.updateStoreState();
        this.retryConfig.currentRetries.dynamicList = 0;
        return res.data;
      } else {
        throw new Error(res.msg || '获取数据失败');
      }
    },

    // 优化：统一的列表数据更新
    updateListData(data, isRefresh) {
      if (data.list && data.list.length > 0) {
        if (this.page == 1 || isRefresh) {
          this.list = data.list;
        } else {
          this.list.push(...data.list);
        }

        if (data.count !== undefined) {
          this.totalCount = data.count;
        }
        this.isEmpty = false;
      } else if (this.page == 1) {
        this.isEmpty = true;
        this.list = [];
      }
    },

    // 优化：统一的缓存数据更新
    updateCacheData() {
      if (this.page === 1) {
        this.tabDataCache[this.barIdx] = {
          data: [...this.list],
          timestamp: Date.now(),
          totalCount: this.totalCount
        };
      }
    },

    // 优化：统一的API错误处理
    async handleApiError(err, silent, retryCount, originalOptions) {
      if (!silent) {
        this.loadStatus = 'more';
      }

      // 处理401错误
      if (err && (err.statusCode === 401 || err.code === 401 || err.status === 401)) {
        this.handleApiError({status: 401});
        throw err;
      }

      // 重试机制
      if (retryCount < this.retryConfig.maxRetries && !silent) {
        console.log(`数据获取失败，正在重试 ${retryCount + 1}/${this.retryConfig.maxRetries}`);

        await new Promise(resolve =>
          setTimeout(resolve, this.retryConfig.retryDelay * (retryCount + 1))
        );

        return this.loadTabData({
          ...originalOptions,
          retryCount: retryCount + 1
        });
      }

      // 最终失败处理
      if (this.page == 1 && !silent) {
        this.resetTabState();
      }

      this.updateStoreState();
      throw err;
    },

    // 优化：重置tab状态的统一方法
    resetTabState() {
      this.isEmpty = true;
      this.list = [];
      this.loadStatus = 'more';
    },

    // 保持向后兼容的方法
    async userDynamic(isRefresh = false, silent = false, retryCount = 0) {
      return this.loadTabData({ isRefresh, silent, retryCount });
    },
    
    updateStoreState() {
      // 通过 mutation 更新状态，而不是直接修改
      try {
        if (typeof this.$store.state.app.isCurrentMsg !== 'undefined') {
          this.$store.commit('SET_CURRENT_MSG', true);
        }
        // 如果需要 isCenterPage 状态，需要先在 store 中定义对应的 mutation
        // this.$store.commit('SET_CENTER_PAGE', false);
      } catch (error) {
        console.warn('更新 store 状态失败:', error.message);
      }
    },
    
    // 优化：标签切换逻辑
    async barClick(e) {
      if (this.isThrottling || this.loadingState.dynamicList) return;

      const newBarIdx = parseInt(e.currentTarget.dataset.idx);
      if (newBarIdx === this.barIdx) return;

      this.isThrottling = true;
      const oldBarIdx = this.barIdx;
      this.barIdx = newBarIdx;
      this.page = 1;

      try {
        // 检查缓存
        if (this.hasFreshCache(newBarIdx)) {
          this.loadFromCache(newBarIdx);
          this.finishTabSwitch(100);
        } else {
          // 加载新数据
          await this.loadTabData({
            tabIndex: newBarIdx,
            isRefresh: true
          });
          this.finishTabSwitch(300);
        }
      } catch (error) {
        console.error('切换标签失败:', error);
        // 回滚到原来的标签
        this.barIdx = oldBarIdx;
        this.showErrorToast('切换失败，请稍后重试');
        this.finishTabSwitch(100);
      }
    },

    // 优化：检查缓存是否新鲜
    hasFreshCache(tabIndex) {
      const cacheData = this.tabDataCache[tabIndex];
      const now = Date.now();
      return cacheData &&
             cacheData.timestamp &&
             (now - cacheData.timestamp < this.cacheTimeout) &&
             cacheData.data.length > 0;
    },

    // 优化：从缓存加载数据
    loadFromCache(tabIndex) {
      const cacheData = this.tabDataCache[tabIndex];
      this.list = [...cacheData.data];
      this.totalCount = cacheData.totalCount;
      this.isEmpty = this.list.length === 0;
      this.loadStatus = this.list.length >= this.totalCount ? 'noMore' : 'more';
    },

    // 优化：完成标签切换
    finishTabSwitch(delay = 100) {
      setTimeout(() => {
        this.isThrottling = false;
      }, delay);
    },
    
    delClick(e) {
      uni.showModal({
        content: '确定删除该笔记吗？',
        confirmColor: '#FA5150',
        success: (res) => {
          if (res.confirm) {
            deleteDynamic(this.list[e.idx].id).then(res => {
              if (res.status == 200) {
                this.list.splice(e.idx, 1);
                if (this.list.length <= 0) {
                  this.isEmpty = true;
                }
                uni.showToast({title: '删除成功', icon: 'success'});
              } else {
                uni.showToast({title: res.msg || '删除失败', icon: 'none'});
              }
            }).catch(() => {
              uni.showToast({title: '删除失败，请重试', icon: 'none'});
            });
          }
        }
      });
    },
    
    likePopupClick(open) {
      if (open) {
        this.$refs.likePopup.open();
      } else {
        this.$refs.likePopup.close();
      }
    },
    
    navigateToFun(e) {
      // 统一登录状态检查
      if (!this.checkLoginStatus(true)) {
        return;
      }
      
      if (this.showSidebar) {
        this.showSidebar = false;
      }
      
      const url = e.currentTarget.dataset.url;
      if (url === 'center/visitor') {
        this.getVisitorList();
      }
      
      uni.navigateTo({url: '/pages/' + url});
    },
    
    toFollowList(type) {
      // 统一登录状态检查
      if (!this.checkLoginStatus(true)) {
        return;
      }
      
      uni.navigateTo({
        url: `/pages/center/follow?type=${type}&id=${this.userInfo.uid}&name=${this.userInfo.nickname}`
      });
    },
    
    userClick() {
      this.blockList[0].img = this.userInfo.circle_img || '';
      this.blockList[0].count = this.userInfo.circle_count || 0;
      this.blockList[1].img = this.userInfo.cart_img || '';
      this.blockList[1].count = this.userInfo.cart_count || 0;
      this.blockList[2].img = this.userInfo.order_img || '';
      this.blockList[2].count = this.userInfo.order_count || 0;
    },
    
    navigationBarColor(status) {
      // 验证并设置导航栏颜色
      const frontColor = status ? '#000000' : '#ffffff';
      const backgroundColor = '#ffffff'; // 使用白色背景替代transparent，确保兼容性

      // 验证颜色值格式
      if (/^#[0-9A-Fa-f]{6}$/.test(frontColor) && /^#[0-9A-Fa-f]{6}$/.test(backgroundColor)) {
        uni.setNavigationBarColor({
          frontColor: frontColor,
          backgroundColor: backgroundColor,
          animation: {duration: 300, timingFunc: 'easeIn'}
        });
      } else {
        console.warn('导航栏颜色值格式错误:', { frontColor, backgroundColor });
      }
    },
    
    getSidebarMenu() {
      // 检查缓存是否有效
      const cachedMenu = uni.getStorageSync('SIDEBAR_MENU');
      const now = Date.now();

      if (cachedMenu && cachedMenu.timestamp && (now - cachedMenu.timestamp < this.cacheTimeout)) {
        // 使用缓存数据
        this.sidebarMenu = cachedMenu.data || [];
        return Promise.resolve(this.sidebarMenu);
      }
      
      return new Promise((resolve, reject) => {
      getMenuList().then(res => {
          
        if (res.data && res.data.routine_my_menus) {
          let storeMenu = [];
          let sidebarMenus = [];
          
          res.data.routine_my_menus.forEach((el) => {
            const menuItem = {
                name: el.name,
                icon: el.pic,
                url: el.url.replace('/pages/', ''),
                badge: ""
            };
            
            if (el.url == '/pages/admin/order/index' || 
                el.url == '/pages/admin/order_cancellation/index' || 
                el.name == '客服接待') {
              storeMenu.push(menuItem);
            } else {
              sidebarMenus.push(menuItem);
            }
          });
          
          this.sidebarMenu = [...sidebarMenus, ...storeMenu];
            
            // 缓存菜单数据
            uni.setStorageSync('SIDEBAR_MENU', {
              data: this.sidebarMenu,
              timestamp: now
            });
            
            resolve(this.sidebarMenu);
          } else {
            reject(new Error('获取菜单数据失败'));
        }
        }).catch(err => {
          reject(err);
        });
      });
    },

    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
      this.$store.commit('SET_PREVENT_SCROLL', this.showSidebar);
      
      // #ifdef H5
      document.body.style.overflow = this.showSidebar ? 'hidden' : '';
      // #endif
    },

    getVisitorList() {
      this.userInfo.visitor_badge = 0;
      this.$store.commit("UPDATE_USERINFO", this.userInfo);

      getVisitorDetails({page: 1, limit: 20, type: 0}).then((res) => {
        const emptyData = {visitors: [], total: 0, has_more: false};

        if (res.status === 200 || res.code === 200) {
          const resData = res.data || {};
          this.userInfo.visitor_count = resData.total || 0;
          this.userInfo.visitor_badge = 0;
          this.$store.commit("UPDATE_USERINFO", this.userInfo);

          // 计算是否还有更多数据
          const hasMore = resData.page * resData.limit < resData.total;

          uni.$emit('updateVisitorList', {
            visitors: resData.list || [],
            total: resData.total || 0,
            has_more: hasMore,
            page: resData.page || 1,
            limit: resData.limit || 20
          });
        } else {
          this.userInfo.visitor_count = 0;
          this.userInfo.visitor_badge = 0;
          this.$store.commit("UPDATE_USERINFO", this.userInfo);
          uni.$emit('updateVisitorList', emptyData);
        }
      }).catch((error) => {
        console.error('获取访客列表失败:', error);
        this.userInfo.visitor_count = 0;
        this.userInfo.visitor_badge = 0;
        this.$store.commit("UPDATE_USERINFO", this.userInfo);
        uni.$emit('updateVisitorList', {visitors: [], total: 0, has_more: false});
      });
    },

    setVisit() {
      setVisit({url: '/pages/tabbar/center'}).catch(() => {});
    },

    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp * 1000);
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
    },
    
    goToVipPage() {
      // 统一登录状态检查
      if (!this.checkLoginStatus(true)) {
        return;
      }
      uni.navigateTo({url: '/pages/annex/vip_paid/index'});
    },

    handleUserInfoUpdate() {
      this.loadUserFromCache();
    },

    handleBottomNav(type) {
      // 统一登录状态检查
      if (!this.checkLoginStatus(true)) {
        return;
      }

      this.showSidebar = false;

      switch(type) {
        case 'scan':
          // #ifdef APP-PLUS || MP-WEIXIN
          uni.scanCode({
            success: (res) => {
              if(res.result) {
                uni.showToast({title: '扫码成功', icon: 'success'});
              }
            },
            fail: () => {
              uni.showToast({title: '扫码失败', icon: 'none'});
            }
          });
          // #endif
          
          // #ifdef H5
          uni.showToast({title: 'H5环境不支持扫码功能', icon: 'none'});
          // #endif
          break;
          
        case 'help':
          uni.navigateTo({url: '/pages/setting/service'});
          break;
          
        case 'setting':
          uni.navigateTo({url: '/pages/setting/index'});
          break;
      }
    },

    // 模板辅助方法
    getEmptyTitle() {
      const titles = ['暂无笔记内容', '暂无喜欢的内容'];
      return titles[this.barIdx] || '暂无内容';
    },

    getEmptySubtitle() {
      if (this.barIdx === 1) {
        return '快在推荐中寻找更多笔记吧';
      }
      return '发笔记，记录灵感日常';
    },

    // 未登录状态的标题和描述
    getUnloginTitle() {
      const titles = ['登录后查看我的笔记', '登录后查看我的点赞'];
      return titles[this.barIdx] || '登录后查看内容';
    },

    getUnloginDescription() {
      if (this.barIdx === 1) {
        return '登录账号，查看你点赞过的内容';
      }
      return '登录账号，查看你发布的笔记';
    },

    handleLogin() {
      toLogin();
    },

    // 处理用户头像点击
    handleAvatarClick() {
      if (!this.isLogin) {
        this.handleLogin();
        return;
      }

      // 已登录状态下，跳转到个人资料页面
      uni.navigateTo({
        url: '/pages/center/means'
      });
    },

    // 处理用户信息区域点击
    handleUserInfoClick() {
      if (!this.isLogin) {
        this.handleLogin();
        return;
      }

      // 已登录状态下，跳转到个人资料页面
      uni.navigateTo({
        url: '/pages/center/means'
      });
    },

    // 处理用户顶部区域点击
    handleUserTopClick() {
      if (!this.isLogin) {
        // 未登录状态，跳转到登录页面
        this.handleLogin();
        return;
      }

      // 已登录状态，跳转到个人资料页面
      uni.navigateTo({
        url: '/pages/center/means'
      });
    }
  },
  // 优化：加载更多逻辑
  async onReachBottom() {
    // 防止重复加载或已经加载完所有数据
    if (this.loadingState.dynamicList || this.loadingState.loadMore || this.loadStatus === 'noMore') {
      return;
    }

    // 检查是否还有更多数据
    if (this.list.length && this.list.length < this.totalCount) {
      this.loadingState.loadMore = true;
      this.loadStatus = 'loading';
      const currentPage = this.page;
      this.page++;

      try {
        await this.loadTabData({ isRefresh: false, silent: false });
      } catch (err) {
        console.log('加载更多数据失败:', err);
        this.page = currentPage;
        this.loadStatus = 'more';

        if (err.message !== '正在加载中' && err.message !== '未登录状态') {
          this.showErrorToast('加载更多失败，请稍后再试', 2000);
        }
      } finally {
        this.loadingState.loadMore = false;
      }
    } else if (this.list.length >= this.totalCount && this.list.length > 0) {
      this.loadStatus = 'noMore';
    }
  },
  onPageScroll(e) {
    if (this.showSidebar) {
      return;
    }
    
    this.scrollTop = e.scrollTop;
    
    const threshold = this.statusBarHeight + this.titleBarHeight + 80;
    const newNavbarTrans = this.scrollTop <= threshold ? 
      Math.min(this.scrollTop / threshold, 1) : 1;
    
    // 只有当透明度变化超过阈值时才更新
    if (Math.abs(newNavbarTrans - this.navbarTrans) > 0.05) {
      this.navbarTrans = newNavbarTrans;
    }
    
    // 优化导航栏颜色变化，减少不必要的调用
    const shouldShowDarkNav = this.scrollTop > threshold;
    if (this.lastNavColorState !== shouldShowDarkNav) {
      this.lastNavColorState = shouldShowDarkNav;
      this.navigationBarColor(shouldShowDarkNav ? 1 : 0);
    }
  }
}
</script>

<style>
.nav-box{
  position:fixed;
  z-index:99;
  top:0;
  left:0;
  width:100%;
  box-sizing:border-box;
  transition:all .3s ease-in-out
}
.nav-box .nav-item{
  position: relative;
  width: 100%;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.nav-box .nav-item .ohto{
  max-width: 420rpx;
  font-size: 26rpx;
  font-weight: 700;
  transition: all 0.3s ease-in-out;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.nav-user-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}
.user-box{
  width:calc(100% - 60rpx);
  padding:60rpx 30rpx;
  color:#fff;
  position:relative;
  overflow:hidden
}
.user-box .user-img,
.user-box .user-bg{
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:100%
}
.user-box .user-bg{
  z-index:-1;
  /* 优化性能：条件编译backdrop-filter */
  /* #ifndef APP-PLUS */
  -webkit-backdrop-filter:saturate(150%) blur(25px);
  backdrop-filter:saturate(150%) blur(25px);
  /* #endif */
  background:rgba(0,0,0,.6)
}
.user-box .user-top{
  width:100%;
  justify-content:space-between
}
.user-top .avatar{
  width:140rpx;
  height:140rpx;
  border-radius:50%;
  background:#fff;
  border:2px solid #f5f5f5;
  overflow:hidden
}
.user-box .user-name{
  margin:20rpx 0 10rpx;
  width:100%;
  font-size:34rpx;
  font-weight:700
}
.user-box .user-intro{
  width:100%;
  word-break:break-word;
  white-space:pre-line
}
.user-box .user-intro text{
  color:#ccc;
  font-size:24rpx;
  font-weight:400
}
.user-box .user-tag{
  margin:20rpx 0;
  width:100%
}
.user-tag .tag-item{
  margin-right:16rpx;
  height:44rpx;
  padding:0 14rpx;
  border-radius:8rpx;
  background:rgba(255,255,255,.15);
  font-weight:500;
  font-size:20rpx;
  justify-content:center
}
.user-tag .tag-item image{
  width:24rpx;
  height:24rpx
}
.user-num-wrap {
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}
.user-num {
  flex: 1;
}
.user-num .num-item {
  margin-right: 30rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.user-num .num-item .t1 {
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}
.user-num .num-item .t2 {
  font-size: 20rpx;
  font-weight: 300;
  color: #ccc;
}
.visitor-item {
  position: relative;
}
.visitor-item .badge {
  position: absolute;
  top: -12rpx;
  right: -28rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 6rpx;
  background: #ff3a3a;
  color: #fff;
  border-radius: 16rpx;
  font-size: 20rpx;
  text-align: center;
  line-height: 32rpx;
  z-index: 2;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}
.user-actions {
  align-items: center;
}
.btn-item {
  padding: 0 30rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 700;
}
.bg1 {
  color: #fff;
  background: rgba(255,255,255,.15);
}
.btn-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 8rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20rpx;
}
.btn-icon image {
  width: 32rpx;
  height: 32rpx;
}
.user-block{
  margin-top:-30rpx;
  width:100%;
  white-space:nowrap;
  background:#fff;
  border-radius:30rpx 30rpx 0 0
}
.user-block .block-box{
  width:100%;
  padding:30rpx 15rpx;
  display:flex
}
.block-box .block-item{
  flex-shrink:0;
  margin:0 15rpx;
  padding:24rpx;
  background:#f8f8f8;
  border-radius:16rpx;
  justify-content:space-between;
  position:relative
}
.block-item .block-title .t1{
  font-size:26rpx;
  font-weight:700
}
.block-item .block-title .t2{
  margin-top:4rpx;
  color:#999;
  font-size:16rpx;
  font-weight:300
}
.block-item .cu-group{
  position:relative;
  right:38rpx
}
.cu-group .cu-item{
  z-index:3;
  width:68rpx;
  height:68rpx;
  border-radius:8rpx;
  overflow:hidden
}
.cu-group .cu-item .icon{
  margin:18rpx;
  width:32rpx;
  height:32rpx
}
.cu-group .cu-item .img{
  width:100%;
  height:100%
}
.cu-group .cu-lump2{
  position:absolute;
  z-index:2;
  left:18rpx;
  width:58rpx;
  height:58rpx;
  border-radius:8rpx;
  background:#dbdbdb
}
.cu-group .cu-lump1{
  position:absolute;
  z-index:1;
  left:38rpx;
  width:48rpx;
  height:48rpx;
  border-radius:8rpx;
  background:#eaeaea
}
.block-item .block-icon{
  position:absolute;
  right:12rpx;
  width:20rpx;
  height:20rpx;
  transform:rotate(-90deg)
}
.bar-box{
  position:sticky;
  left:0;
  z-index:99;
  margin-top:-1px;
  width:100%;
  height:80rpx;
  background:#fff
}
.bar-box .bar-item{
  padding:0 30rpx;
  height:100%;
  flex-direction:column;
  justify-content:center;
  position:relative
}
.bar-box .bar-item text{
  font-weight:700;
  transition:all .3s ease-in-out
}
.bar-item .bar-line{
  position:absolute;
  bottom:12rpx;
  width:18rpx;
  height:6rpx;
  border-radius:6rpx;
  background:#000;
  transition:opacity .3s ease-in-out
}
/* 优化的CSS类名 */
.content-container{
  padding-bottom:180rpx
}
.like-popup{
  background:#fff;
  width:400rpx;
  padding:30rpx;
  border-radius:30rpx;
  overflow:hidden
}
.like-popup .like-img{
  margin:0 40rpx;
  width:320rpx;
  height:200rpx
}
.like-popup .like-content{
  margin:20rpx 0 40rpx;
  width:100%;
  color:#333;
  font-size:26rpx;
  text-align:center
}
.like-popup .like-btn{
  width:100%;
  height:80rpx;
  line-height:80rpx;
  text-align:center;
  font-size:24rpx;
  font-weight:700;
  color:#fff;
  background:#000;
  border-radius:16rpx
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
.empty-state {
  flex-direction: column;
  padding: 120rpx 0;
}
.empty-state image {
  width: 280rpx;
  height: 280rpx;
}
.empty-state .empty-title {
  margin-top: 40rpx;
  font-size: 32rpx;
  font-weight: bold;
}
.empty-state .empty-subtitle {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #999;
}

/* 重试按钮样式已删除 */

.loading-state {
  flex-direction: column;
  padding: 120rpx 0;
}

.loading-text {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #999;
}
.loading-indicator {
  justify-content: center;
}
.nav-menu-btn {
  position: absolute;
  left: 30rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  -webkit-tap-highlight-color: transparent;
}
.nav-menu-btn image {
  width: 24rpx;
  height: 24rpx;
}
.nav-menu-btn:active {
  background: rgba(0,0,0,0.5);
}
.sidebar-menu {
  position: fixed;
  top: 0;
  left: -75%;
  width: 75%;
  height: 100%;
  max-height: 100vh;
  background: #fff;
  z-index: 999;
  box-shadow: 2rpx 0 10rpx rgba(0,0,0,0.1);
  transform: translateX(0);
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-menu.active {
  transform: translateX(100%);
}

.sidebar-header {
  flex-shrink: 0;
  padding: 30rpx;
  border-bottom: 1px solid #f5f5f5;
  position: relative; /* 为关闭按钮提供定位基准 */
}

.sidebar-user-info {
  display: flex;
  align-items: center;
}

.sidebar-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.sidebar-user-details {
  flex: 1;
  overflow: hidden;
}

.sidebar-user-name {
  font-size: 30rpx;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.user-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 4rpx 10rpx;
  border-radius: 20rpx;
  margin-right: 12rpx;
  font-size: 20rpx;
  margin-top: 4rpx;
}

.status-icon {
  width: 80rpx;
  height: 40rpx;
  margin-right: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon image {
  width: 80rpx;
  height: 36rpx;
  display: block; /* 确保图片正确显示 */
}


.member-card {
  flex-shrink: 0;
  margin: 0 30rpx 20rpx;
  padding: 30rpx 20rpx;
  background: #2c2c2c;
  border-radius: 16rpx;
  color: #fff;
}

.member-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.member-label {
  font-size: 30rpx;
  font-weight: bold;
}

.member-price {
  padding: 6rpx 20rpx;
  background: #fff;
  color: #333;
  border-radius: 30rpx;
  font-size: 22rpx;
}

.member-benefits {
  margin-bottom: 10rpx;
}

.member-rights {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
}

.member-desc {
  margin-top: 16rpx;
  font-size: 22rpx;
  color: rgba(255,255,255,0.7);
}

.sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.sidebar-content {
  padding: 16rpx 0 200rpx;
  background-color: #f7f7f7;
}

/* 菜单部分样式 */
.menu-section {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}

.section-title {
  padding: 20rpx 30rpx 10rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
}

/* 菜单宫格样式 */
.menu-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 10rpx;
  background-color: #fff;
}

.grid-item {
  width: 33.33%;
  text-align: center;
  padding: 20rpx 0;
  position: relative;
}

.grid-item:active {
  background-color: #f8f8f8;
}

.grid-icon-wrapper {
  position: relative;
  margin: 0 auto 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-icon {
  width: 50rpx;
  height: 50rpx;
}

.grid-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 6rpx;
  background: #ff3a3a;
  color: #fff;
  border-radius: 16rpx;
  font-size: 20rpx;
  text-align: center;
  line-height: 32rpx;
  z-index: 2;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}

.grid-text {
  font-size: 24rpx;
  color: #333;
  display: block;
  padding: 0 10rpx;
}

.sidebar-footer {
  flex-shrink: 0;
  background: #fff;
}

.bottom-nav {
  width: 100%;
  height: 120rpx;
  justify-content: space-around;
  padding: 0;
  background-color: #f7f7f7;
}

.bottom-nav-item {
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.nav-icon-box {
  width: 50rpx;
  height: 50rpx;
  justify-content: center;
  align-items: center;
}

.nav-icon {
  width: 44rpx;
  height: 44rpx;
}

.nav-text {
  font-size: 22rpx;
  color: #666;
  margin-top: 8rpx;
}

.copyright-text {
  text-align: center;
  color: #999;
  font-size: 20rpx;
  padding: 10rpx 0 30rpx;
}

.sidebar-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0,0,0,0.5);
  z-index: 998;
  touch-action: none;
}

.no-scroll {
  overflow: hidden !important;
}

.container.no-scroll,
.container[style*="position: fixed"] {
  position: fixed !important;
  left: 0 !important;
  width: 100% !important;
  overflow: hidden !important;
  touch-action: none !important;
  height: 100vh !important;
}

.container[style*="position: fixed"] .user-box,
.container[style*="position: fixed"] .nav-box {
  transform: none !important;
}

@media screen and (max-height: 667px) {
  .sidebar-scroll {
    height: calc(100vh - 350rpx - 170rpx);
  }
}

.sidebar-item:active {
  background-color: #f8f8f8;
}

.menu-group {
  margin-bottom: 0;
  margin: 0 20rpx;
  border-radius: 16rpx;
  background-color: #fff;
  overflow: hidden;
}

.menu-divider {
  height: 16rpx;
  background-color: #f7f7f7;
  margin: 0;
  width: 100%;
}

.close-btn {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

button, 
.btn, 
.nav-menu-btn, 
view[role="button"] {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.user-top {
  width: 100%;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.avatar-wrapper {
  position: relative;
  margin-right: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #f5f5f5;
  overflow: hidden;
  position: relative;
}

.profile-percent {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  background: #ff6600;
  border-radius: 12rpx;
  padding: 4rpx 10rpx;
  display: flex;
  align-items: center;
  font-size: 20rpx;
  color: #fff;
  z-index: 2;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}

.edit-icon {
  width: 24rpx;
  height: 24rpx;
  margin-right: 4rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 20rpx;
}

.user-name-row {
  align-items: center;
  margin-bottom: 10rpx;
}

.user-name-text {
  font-size: 34rpx;
  font-weight: 700;
  color: #fff;
  margin-right: 12rpx;
}

.status-icon {
  width: 80rpx;
  height: 40rpx;
  margin-right: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon image {
  width: 80rpx;
  height: 36rpx;
  display: block; /* 确保图片正确显示 */
}

.user-id {
  font-size: 22rpx;
  color: rgba(255,255,255,0.6);
}

.user-id-row {
  align-items: center;
  margin-top: 8rpx;
}

.sex-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
  background: rgba(255,255,255,0.15);
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
}

.sex-icon image {
  width: 20rpx;
  height: 20rpx;
}

.vip-icon {
  border-radius: 6rpx;
  padding: 2rpx;
}

.verified-icon {
  border-radius: 6rpx;
  padding: 2rpx;
}

.tag-wrapper {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.tag-scroll-view {
  width: calc(100% - 70rpx);
  white-space: nowrap;
}

.tag-add-btn {
  position: absolute;
  right: 0rpx;
  width: 46rpx;
  height: 46rpx;
  border-radius: 46rpx;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-add-btn text {
  font-size: 40rpx;
  color: #666;
  font-weight: 300;
}

.tag-add-empty {
  width: 100%;
  height: 60rpx;
  background: #f8f8f8;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-add-empty text {
  color: #999;
  font-size: 26rpx;
}

.tag-empty {
  flex: 1;
  height: 60rpx;
  background: rgba(255,255,255,.15);
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.tag-empty text {
  color: rgba(255,255,255,0.6);
  font-size: 24rpx;
}

.user-tag {
  flex-wrap: nowrap;
  padding: 0;
  margin-top: 0;
}

.tag-wrapper .user-tag {
  display: inline-flex;
  padding-right: 20rpx;
}

.tag-wrapper .tag-item {
  margin-right: 20rpx;
  flex-shrink: 0;
}

.menu-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx 10rpx;
  background-color: #fff;
}

.grid-item {
  width: 33.33%;
  text-align: center;
  padding: 20rpx 0;
  position: relative;
}

.grid-icon {
  width: 50rpx;
  height: 50rpx;
}

.grid-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 6rpx;
  background: #ff3a3a;
  color: #fff;
  border-radius: 16rpx;
  font-size: 20rpx;
  text-align: center;
  line-height: 32rpx;
  z-index: 2;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}

.grid-text {
  font-size: 24rpx;
  color: #333;
  display: block;
  padding: 0 10rpx;
}

.profile-progress {
  position: absolute;
  top: -8rpx;
  left: -8rpx;
  right: -8rpx;
  bottom: -8rpx;
  z-index: 10;
}

.progress-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.6);
  border-radius: 20rpx;
  padding: 4rpx 8rpx;
  backdrop-filter: blur(10rpx);
}

.progress-text {
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  line-height: 1;
}

.avatar {
  position: relative;
}

.user-box .user-intro{
  width:100%;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.user-box .user-intro .intro-text{
  color:#ccc;
  font-size:24rpx;
  font-weight:400;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  flex: 1;
}
.user-box .user-intro .more-btn{
  position: absolute;
  right: 0;
  top: 0;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-box .user-intro .more-btn image{
  width: 32rpx;
  height: 32rpx;
}

.user-box .user-top{
  width:100%;
  justify-content:space-between;
  position: relative;
  padding-right: 40rpx;
}
.user-box .user-top .right-arrow {
  position: absolute;
  right: 0;
  top: 50%;
  display: flex;
  -webkit-transform: translateY(-50%) rotate(270deg);
  transform: translateY(-50%) rotate(270deg)
}
.user-box .user-top .right-arrow image {
  width: 140rpx;
  height: 40rpx;
}

.stat-box {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: calc(100% - 60rpx);
  padding: 20rpx 0;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
  margin: 20rpx auto;
  position: relative;
}

.stat-divider {
  width: 1px;
  height: 60rpx;
  background-color: rgba(255, 255, 255, 0.2);
}

.stat-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
  padding: 10rpx 0;
}

.stat-icon {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stat-icon .iconfont {
  font-size: 36rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8rpx;
  line-height: 1;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1;
}

.user-num-wrap {
  width: 100%;
}

.stat-badge {
  position: absolute;
  top: -8rpx;
  right: -10rpx;
  min-width: 30rpx;
  height: 30rpx;
  line-height: 30rpx;
  padding: 0 6rpx;
  background-color: #ff3a3a;
  color: #ffffff;
  font-size: 16rpx;
  border-radius: 15rpx;
  text-align: center;
}

.stat-icon .icon-like {
  color: #ff7ca8;
  font-size: 42rpx;
}

.stat-icon .icon-eye {
  color: #e3d6ff;
  font-size: 42rpx;
}

.stat-icon .icon-heart {
  color: #e3d6ff;
  font-size: 42rpx;
}

.stat-like-text {
  color: #ff7ca8;
  font-size: 42rpx;
}

.stat-eye-text {
  color: #e3d6ff;
  font-size: 42rpx;
}

.stat-heart-text {
  color: #e3d6ff;
  font-size: 42rpx;
}
</style>