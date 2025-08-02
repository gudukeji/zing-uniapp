<template>
  <view class="container">
    <view class="nav-box" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="bar-box df" :style="{'height': titleBarHeight + 'px'}">
        <!-- 水平滚动导航 -->
        <view class="nav-scroll-box">
          <scroll-view 
            id="nav-scroll" 
            scroll-x="true" 
            show-scrollbar="false" 
            class="nav-scroll" 
            :scroll-into-view="'tab' + navIdx"
            scroll-with-animation="true"
          >
            <view class="nav-scroll-content">
              <view 
                v-for="(item, index) in navList" 
                :key="`nav-${index}`" 
                class="nav-item" 
                :class="{'active': navIdx === index}"
                :data-idx="index" 
                :id="'tab' + index"
                @tap="navClick"
              >
                <text>{{item}}</text>
                <view v-if="navIdx === index" class="active-line"></view>
              </view>
            </view>
          </scroll-view>
        </view>
          </view>
        </view>
    
    <view class="content-box" :style="{'padding-top': (statusBarHeight + titleBarHeight) + 'px'}">
      <swiper 
        class="content-swiper" 
        :current="navIdx" 
        @change="swiperChange"
        :style="{'height': contentHeight + 'px'}"
        :duration="300"
        :easing-function="'easeInOutCubic'"
        :skip-hidden-item-layout="true"
        :disable-touch="false"
      >
        <!-- 关注页 -->
        <swiper-item>
          <scroll-view 
            scroll-y="true" 
            @scrolltolower="onReachEnd" 
            @scroll="onScroll"
            class="content-scroll"
            :show-scrollbar="true"
          >
            <!-- 未登录状态 -->
            <emptyPage
              v-if="!isLogin && navIdx === 0"
              title="登录后浏览关注内容"
              description="登录账号，查看关注的好友动态"
              image="/static/img/empty.png"
              buttonText="立即登录"
              @buttonClick="toLogin"
            />
            
            <!-- 空数据状态 -->
            <emptyPage
              v-else-if="isEmpty && navIdx === 0"
              title="暂无关注内容"
              description="去探索，发现新朋友"
              image="/static/img/empty.png"
            />

            <!-- 有数据状态 -->
            <view v-else-if="!isEmpty && list.length > 0">
                <block v-for="(item, index) in displayItems" :key="`item-${item.id || index}`">
                  <card-gg :item="item" :idx="index" @likeback="likeClick" @followback="followClick" @update="onCardUpdate"></card-gg>
              </block>
              <uni-load-more :status="loadStatus"></uni-load-more>
            </view>
          </scroll-view>
        </swiper-item>
        
        <!-- 推荐页 -->
        <swiper-item>
          <scroll-view 
            scroll-y="true" 
            @scrolltolower="onReachEnd" 
            @scroll="onScroll"
            class="content-scroll"
            :show-scrollbar="true"
          >
            <!-- 圈子推荐区域 -->
            <scroll-view v-if="navIdx === 1 && circle.length > 0" scroll-x="true" class="scroll-box" style="height: 246rpx">
              <view class="circle-box">
                <view v-for="(item, index) in circle" :key="`circle-${item.id || index}`" class="circle-item" :data-url="'note/circle?id=' + item.id" @tap="navigateToFun">
                  <view class="circle-item-top">
                    <image :src="item.circle_avatar || item.avatar" mode="aspectFill"></image>
                    <view v-if="item.is_official == 1" class="circle-item-tag" style="background: url(/static/img/gf.png) 0% 0% / 100% 100%;"></view>
                    <view v-else-if="item.is_hot == 1" class="circle-item-tag" style="background: url(/static/img/tj.png) 0% 0% / 100% 100%;"></view>
                  </view>
                  
                  <view class="circle-name ohto">{{item.circle_name || item.name}}</view>
                  <view class="circle-tips">
                    <text v-if="item.dynamic_count">{{item.dynamic_count}}更新</text>
                    <text v-else-if="item.member_count || item.user_count">{{item.member_count || item.user_count}}新圈友</text>
                    <text v-else>推荐的圈子</text>
                  </view>
                </view>
                <view class="circle-item" data-url="center/circle" @tap="navigateToFun">
                  <view class="circle-item-top">
                    <image class="icon" src="/static/img/more.png"></image>
                  </view>
                  <view class="circle-name">更多圈子</view>
                </view>
                <view class="circle-item" style="width:10rpx"></view>
              </view>
            </scroll-view>
            
            <!-- 空数据状态 -->
            <view v-if="isEmpty && navIdx === 1" class="empty-box df">
        <image src="/static/img/empty.png"/>
              <view class="e1">暂无推荐内容</view>
              <view class="e2">去发笔记，或许就上推荐了</view>
      </view>

            <!-- 有数据状态 -->
      <view v-else-if="!isEmpty && list.length > 0" :class="[isWaterfall ? 'dynamic-box' : '']">
              <waterfall v-if="isWaterfall" :activity="[]" :note="displayItems" :page="page" @likeback="waterfallLikeClick" @followback="followClick"></waterfall>
        <block v-else>
                <block v-for="(item, index) in displayItems" :key="`item-${item.id || index}`">
                  <card-gg :item="item" :idx="index" @likeback="likeClick" @followback="followClick" @refresh="fetchList"></card-gg>
          </block>
        </block>
        <uni-load-more :status="loadStatus"></uni-load-more>
      </view>
          </scroll-view>
        </swiper-item>
        
        <!-- 附近页 -->
        <swiper-item>
          <scroll-view 
            scroll-y="true" 
            @scrolltolower="onReachEnd" 
            @scroll="onScroll"
            class="content-scroll"
            :show-scrollbar="true"
          >
            <!-- 空数据状态 -->
            <emptyPage
              v-if="isEmpty && navIdx === 2"
              title="附近暂无内容"
              description="去发笔记，让大家看到你"
              image="/static/img/empty.png"
            />

            <!-- 有数据状态 -->
            <view v-else-if="!isEmpty && list.length > 0" :class="[isWaterfall ? 'dynamic-box' : '']">
              <waterfall v-if="isWaterfall" :activity="[]" :note="displayItems" :page="page" @likeback="waterfallLikeClick" @followback="followClick"></waterfall>
              <block v-else>
                <block v-for="(item, index) in displayItems" :key="`item-${item.id || index}`">
                  <card-gg :item="item" :idx="index" @likeback="likeClick" @followback="followClick" @refresh="fetchList"></card-gg>
                </block>
              </block>
              <uni-load-more :status="loadStatus"></uni-load-more>
            </view>
          </scroll-view>
        </swiper-item>
      </swiper>
    </view>
    <tabbar :currentPage="1" :currentMsg="currentMsg"></tabbar>
  </view>
</template>

<script>
import lazyImage from '@/components/lazyImage/lazyImage'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more'
import waterfall from '@/components/waterfall/waterfall'
import cardGg from '@/components/card-gg/card-gg'
import tabbar from '@/components/tabbar/tabbar'
import emptyPage from '@/components/emptyPage/emptyPage.vue'

// 直接导入所需的API函数，移除未使用的API
import { getDynamicList, getHotCircles } from '@/api/social.js'
import { toLogin } from '@/libs/login.js'
import { useUserStore } from '@/stores/user.js'

// 移除未使用的可见性检测工具
export default {
  components: {
    lazyImage,
    uniLoadMore,
    waterfall,
    cardGg,
    tabbar,
    emptyPage
  },
  data() {
    return {
      userStore: useUserStore(),
      statusBarHeight: this.$store?.state?.statusBarHeight || 20,
      titleBarHeight: this.$store?.state?.titleBarHeight || 44,
      currentMsg: 0,
      userCity: "",
      userUid: 0,
      userLatitude: 0,
      userLongitude: 0,
      // #ifdef H5
      isWeixin: false,
      // #endif
      navList: ["关注", "推荐", "附近"],
      navIdx: 1,
      list: [],

      // 优化后的缓存系统 - 减少内存占用
      cachedData: {
        0: { list: [], page: 1, hasMore: true, lastUpdate: 0, renderItems: 10, totalCount: 0 },
        1: { list: [], page: 1, hasMore: true, lastUpdate: 0, renderItems: 10, totalCount: 0 },
        2: { list: [], page: 1, hasMore: true, lastUpdate: 0, renderItems: 10, totalCount: 0 }
      },

      circle: [], // 圈子数据
      circleLoaded: false, // 圈子是否已加载
      page: 1,
      totalCount: 0, // 总数据量
      isEmpty: false,
      loadStatus: "more",
      isWaterfall: false,
      contentHeight: 0,

      // 加载状态管理 - 参考center.vue
      loadingStates: {
        refresh: false,
        loadMore: false,
        initial: false
      },

      // 防抖定时器 - 提升流畅度
      requestTimers: {
        loadData: null
      },

      // 简化的加载状态管理
      isLoading: false,
      isRefreshing: false,
      isSwitching: false,

      // 优化渲染性能 - 减少初始渲染数量
      renderItems: 10, // 从15减少到10
      renderStep: 5,   // 从10减少到5
      maxRenderItems: 50, // 从100减少到50

      // 基础状态
      _firstLoad: true,
      _lastLoginState: null,
      _navigateLock: false,

      // 缓存配置 - 优化内存使用
      cacheConfig: {
        maxAge: 3 * 60 * 1000,    // 从5分钟减少到3分钟
        maxItems: 30,             // 从50减少到30
        preloadThreshold: 2       // 从3减少到2
      },

      // 性能优化
      debounceTimer: null,
      scrollTimer: null,
      scrollRAF: null,

      // 格式化缓存 - 使用WeakMap减少内存泄漏
      _formattedCache: new Map(),
      _lastListLength: 0,
      _reachEndThrottle: false,

      // 性能监控
      _performanceStart: 0,

      // 新增：虚拟滚动相关
      virtualScroll: {
        itemHeight: 200, // 预估每个item的高度
        visibleCount: 8,  // 可见区域显示的数量
        bufferSize: 4,    // 缓冲区大小
        startIndex: 0,    // 开始索引
        endIndex: 0       // 结束索引
      }
    }
  },
  mounted() {
    this.calcContentHeight();
    this.initPlatformFeatures();
    this.getUserLocation();
    
    // 确保缓存正确初始化
    if (!this._formattedCache) {
      this._formattedCache = new Map();
    }
  },
  beforeDestroy() {
    // 不再解绑事件，统一到onUnload
  },
  async onLoad() {
    // 初始化页面基础设置
    this.calcContentHeight();

    // 注册事件监听
    uni.$on('flowSettingsUpdated', this.handleFlowSettingsUpdate);
    uni.$on('loginStateChanged', this.handleLoginStateChanged);

    // 初始化用户信息
    this.initUserInfoFromCache();
    this._firstLoad = true;
    this._lastLoginState = this.isLogin;

    // 设置导航栏样式
    uni.setNavigationBarColor({
      frontColor: "#000000",
      backgroundColor: "RGB(255,255,255)",
      animation: { duration: 400, timingFunc: "easeIn" }
    });

    // 异步加载数据
    this.$nextTick(() => {
      this.initializePageData().catch(err => {
        this.handleInitError();
      });
    });
  },
  onShow() {
    // 检查登录状态变化
    const token = this.userStore.token;
    const isLoggedIn = this.isLogin && token;

    if (this._lastLoginState !== isLoggedIn) {
      this._lastLoginState = isLoggedIn;
      this.handleLoginStateChange(isLoggedIn);
    }

    // 更新消息数量
    if (isLoggedIn) {
      const userInfo = this.getUserInfoFromCache();
      this.currentMsg = userInfo.service_num || 0;
    }

    // 检查缓存是否需要刷新
    this.checkCacheExpiry();

    // 设置导航栏样式
    uni.setNavigationBarColor({
      frontColor: "#000000",
      backgroundColor: "RGB(255,255,255)",
      animation: { duration: 400, timingFunc: "easeIn" }
    });
  },
  onPullDownRefresh() {
    this.page = 1;
    this.loadStatus = "more";
    this.isEmpty = false;
    this.isRefreshing = true;

    this.loadData(true)
      .catch(() => {
        uni.showToast({
          title: '刷新失败，请稍后再试',
          icon: 'none',
          duration: 2000
        });
      })
      .finally(() => {
        setTimeout(() => {
          this.isRefreshing = false;
          uni.stopPullDownRefresh();
        }, 300);
      });
  },
  onReachBottom() {
    // 直接实现上拉加载逻辑，避免多层调用影响性能
    // 防止重复加载或已经加载完所有数据
    if (this.isLoading || this.loadingStates.loadMore || this.loadStatus === 'noMore') {
      return;
    }

    // 检查登录状态
    const isLoggedIn = this.isLogin && this.$store.state.app.token;

    // 关注页面未登录不加载
    if (this.navIdx === 0 && !isLoggedIn) {
      return;
    }

    // 检查是否还有更多数据
    // 条件：有数据 且 (总数未知 或 当前数据量小于总数) 且 加载状态允许
    const canLoadMore = this.list.length > 0 &&
                       (this.totalCount === 0 || this.list.length < this.totalCount) &&
                       this.loadStatus !== 'noMore';

    if (canLoadMore) {
      this.loadingStates.loadMore = true;
      this.loadStatus = 'loading';
      const currentPage = this.page; // 保存当前页码
      this.page++;

      this.loadData(false, true).catch(err => {
        // 加载失败时恢复页码和状态
        this.page = currentPage;
        this.loadStatus = 'more';

        // 显示友好的错误提示
        if (err.message !== '正在加载中') {
          this.showErrorToast('加载更多失败，请稍后再试', 2000);
        }
      }).finally(() => {
        this.loadingStates.loadMore = false;
      });
    } else if (this.list.length >= this.totalCount && this.list.length > 0) {
      this.loadStatus = 'noMore';
    }
  },
  onShareAppMessage() {
    return {
      title: this.$store.state.appXx[1] || '小程序示例',
      imageUrl: this.$store.state.appXx[2] || '/static/img/avatar.png'
    }
  },
  onShareTimeline() {
    return {
      title: this.$store.state.appXx[1] || '小程序示例',
      imageUrl: this.$store.state.appXx[2] || '/static/img/avatar.png'
    }
  },
  onUnload() {
    try {
      // 移除事件监听
      if (uni.$off) {
        uni.$off('flowSettingsUpdated', this.handleFlowSettingsUpdate);
        uni.$off('loginStateChanged', this.handleLoginStateChanged);
      }

      // 平台特定的清理
      if (this.cleanupPlatformFeatures) {
        this.cleanupPlatformFeatures();
      }

      // 重置状态
      if (this.resetLoadingState) {
        this.resetLoadingState();
      }

      // 清理定时器和内存
      if (this.clearTimers) {
        this.clearTimers();
      }

      if (this.performMemoryCleanup) {
        this.performMemoryCleanup();
      }

      // 清理所有缓存
      this.cachedData = {};
      this._formattedCache = null;
    } catch (error) {
    }
  },
  methods: {
    toLogin() {
      toLogin();
    },

    // 初始化页面数据
    async initializePageData() {
      try {
        this.isLoading = true;

        // 加载基础设置
        this.loadFlowSettings();
        this.getUserLocation();

        // 加载页面内容
        await this.loadData(true);

      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // 处理初始化错误
    handleInitError() {
      this.isEmpty = true;
      this.loadStatus = 'more';

      uni.showModal({
        title: '加载失败',
        content: '页面初始化失败，是否重试？',
        confirmText: '重试',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.initializePageData();
          }
        }
      });
    },

    // 处理登录状态变化
    handleLoginStateChange(isLoggedIn) {
      if (isLoggedIn) {
        // 登录后重新加载关注页数据
        if (this.navIdx === 0) {
          this.clearTabCache(0);
          this.page = 1;
          this.isEmpty = false;
          this.loadStatus = 'loading';
          this.loadData(true);
        }
      } else {
        // 退出登录后清空关注页数据
        if (this.navIdx === 0) {
          this.list = [];
          this.isEmpty = false;
          this.loadStatus = 'more';
        }
      }
    },

    // 检查缓存过期
    checkCacheExpiry() {
      const now = Date.now();
      const currentCache = this.cachedData[this.navIdx];

      if (currentCache && currentCache.lastUpdate) {
        const age = now - currentCache.lastUpdate;
        if (age > this.cacheConfig.maxAge) {
          // 缓存过期，静默刷新
          this.refreshCurrentTab(true);
        }
      }
    },

    // 刷新当前tab
    async refreshCurrentTab(silent = false) {
      if (this.loadingStates.refresh && !silent) return;

      try {
        this.loadingStates.refresh = true;
        this.page = 1;
        await this.loadData(true);
      } catch (error) {
        if (!silent) {
        }
      } finally {
        this.loadingStates.refresh = false;
      }
    },

    // 清空指定tab缓存
    clearTabCache(tabIndex) {
      if (this.cachedData[tabIndex]) {
        this.cachedData[tabIndex] = {
          list: [],
          page: 1,
          hasMore: true,
          lastUpdate: 0,
          renderItems: 15
        };
      }
    },
    
    getUserSocialData() {
      if (!this.isLogin || !this.$store.state.app.token) {
        this.currentMsg = 0;
        this.userUid = 0;
        return Promise.resolve();
      }
      
      const userInfo = this.getUserInfoFromCache();
      this.currentMsg = userInfo.service_num || 0;
      this.userUid = this.userStore.uid || 0;
      
      return Promise.resolve(userInfo);
    },
    
    handleLoginStateChanged(isLoggedIn) {
      if (isLoggedIn) {
        this.userUid = this.$store.state.app.uid || 0;
        
        const userInfo = this.getUserInfoFromCache();
        if (userInfo) {
          this.userCity = userInfo.residence_name || userInfo.city || '广州';
          this.userAvatar = userInfo.avatar || '/static/img/avatar.png';
          this.currentMsg = userInfo.service_num || 0;
        }
        
        this.refreshFlowSettings()
          .then(() => {
            if (this.navIdx === 0) {
              this.cachedData[0] = { list: [], page: 1, hasMore: true, lastUpdate: 0, renderItems: 15, totalCount: 0 };
              this.page = 1;
              this.isEmpty = false;
              this.loadStatus = 'loading';
              this.loadData(true);
            }
          })
          .catch(() => {});
      } else if (!isLoggedIn && this.navIdx === 0) {
        this.list = [];
        this.isEmpty = false;
        this.isWaterfall = false;
        this.currentMsg = 0;
      }
    },
    
    calcContentHeight() {
      const windowHeight = uni.getSystemInfoSync().windowHeight
      const navHeight = this.statusBarHeight + this.titleBarHeight
      this.contentHeight = windowHeight - navHeight
    },
    
    async swiperChange(e) {
      const current = e.detail.current;

      // 避免重复处理相同页签
      if (this.navIdx === current || this.isSwitching) return;

      try {
        this.isSwitching = true;

        // 缓存当前页签数据
        this.saveCurrentTabData();

        // 更新当前页签索引
        this.navIdx = current;

        // 加载瀑布流设置
        this.loadFlowSettings();

        const isLoggedIn = this.isLogin && this.$store.state.app.token;

        // 关注页面未登录特殊处理
        if (current === 0 && !isLoggedIn) {
          this.list = [];
          this.isEmpty = false;
          this.loadStatus = 'more';
          return;
        }

        // 更新用户信息
        if (isLoggedIn) {
          this.initUserInfoFromCache();
        }

        // 推荐页只首次加载圈子
        if (current === 1 && !this.circleLoaded) {
          this.getHotCircles();
          this.circleLoaded = true;
        }

        // 尝试从缓存加载数据
        const cachedData = this.getCachedData();
        if (cachedData && cachedData.list.length > 0) {
          this.list = cachedData.list;
          this.page = cachedData.page;
          this.totalCount = cachedData.totalCount || 0;
          this.isEmpty = false;
          this.loadStatus = cachedData.hasMore ? 'more' : 'noMore';
          // 恢复渲染数量
          this.renderItems = cachedData.renderItems || this.list.length;

          // 检查缓存是否需要刷新
          const now = Date.now();
          const age = now - cachedData.lastUpdate;
          if (age > this.cacheConfig.maxAge / 2) {
            this.refreshCurrentTab(true);
          }
        } else {
          // 没有缓存，重新加载
          this.page = 1;
          this.isEmpty = false;
          this.loadStatus = 'loading';
          this.list = [];
          this.renderItems = 15; // 重置渲染数量
          await this.loadData(true);
        }

      } catch (error) {
        this.handleTabSwitchError();
      } finally {
        this.isSwitching = false;
      }
    },

    // 保存当前tab数据
    saveCurrentTabData() {
      if (this.list.length > 0) {
        const cache = this.cachedData[this.navIdx];
        // 确保缓存对象存在且格式正确
        if (!cache || typeof cache !== 'object' || Array.isArray(cache)) {
          this.cachedData[this.navIdx] = { list: [], page: 1, hasMore: true, lastUpdate: 0, renderItems: 15, totalCount: 0 };
        }

        const validCache = this.cachedData[this.navIdx];
        validCache.list = [...this.list];
        validCache.page = this.page;
        validCache.hasMore = this.loadStatus !== 'noMore';
        validCache.lastUpdate = Date.now();
        validCache.renderItems = this.renderItems; // 保存当前渲染数量
        validCache.totalCount = this.totalCount; // 保存总数据量
      }
    },

    // 处理tab切换错误
    handleTabSwitchError() {
      this.list = [];
      this.isEmpty = true;
      this.loadStatus = 'more';

      uni.showToast({
        title: '切换失败，请重试',
        icon: 'none',
        duration: 2000
      });
    },

    onScroll(e) {
      // 使用节流优化滚动性能
      if (this.scrollRAF) return;

      // 兼容小程序环境
      const animationFrame = this.getAnimationFrame();
      this.scrollRAF = animationFrame(() => {
        this.handleScroll(e);
        this.scrollRAF = null;
      });
    },

    // 新增：处理滚动事件
    handleScroll(e) {
      // 更新虚拟滚动索引
      this.updateVirtualScrollIndices(e.detail.scrollTop);
      
      // 检查是否需要加载更多
      this.checkInViewItems();
    },

    // 新增：更新虚拟滚动索引
    updateVirtualScrollIndices(scrollTop) {
      const { itemHeight, visibleCount, bufferSize } = this.virtualScroll;
      
      // 计算可见区域的开始和结束索引
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        startIndex + visibleCount + bufferSize * 2,
        this.list.length
      );

      // 更新虚拟滚动状态
      this.virtualScroll.startIndex = Math.max(0, startIndex - bufferSize);
      this.virtualScroll.endIndex = endIndex;
    },

    // 获取兼容的动画帧方法
    getAnimationFrame() {
      // #ifdef H5
      return requestAnimationFrame;
      // #endif

      // #ifndef H5
      // 小程序环境使用 setTimeout 模拟，但频率降低
      return (callback) => {
        return setTimeout(callback, 32); // 约30fps，减少CPU占用
      };
      // #endif
    },

    // 获取兼容的取消动画帧方法
    getCancelAnimationFrame() {
      // #ifdef H5
      return cancelAnimationFrame;
      // #endif

      // #ifndef H5
      // 小程序环境使用 clearTimeout
      return clearTimeout;
      // #endif
    },

    checkInViewItems() {
      if (!this.list || this.list.length === 0) return;

      // 只有当需要加载更多时才处理
      if (this.list.length > this.renderItems) {
        const oldRenderItems = this.renderItems;
        this.renderItems = Math.min(this.list.length, this.renderItems + this.renderStep);

        // 避免不必要的强制更新，让 Vue 的响应式系统处理
        if (oldRenderItems !== this.renderItems) {
          // 清除格式化缓存，让计算属性重新计算
          if (this._formattedCache) {
            this._formattedCache.clear();
          }
        }
      }
    },
    

    
    cancelAllRequests() {
      this.requestQueue = []
    },
    
    // 优化的数据加载方法 - 提升上拉加载流畅度
    async loadData(force = false, isLoadMore = false) {
      // 防止重复加载
      if (!force && (this.isLoading || this.isSwitching)) {
        return Promise.resolve(null);
      }

      const isLoggedIn = this.isLogin && this.$store.state.app.token;

      // 关注页面未登录特殊处理
      if (this.navIdx === 0 && !isLoggedIn) {
        this.list = [];
        this.isEmpty = false;
        this.loadStatus = 'more';
        return Promise.resolve(null);
      }

      try {
        // 优化加载状态设置 - 上拉加载时不显示loading
        if (this.page === 1 && !isLoadMore) {
          this.isRefreshing = true;
          if (!this.isLoading) {
            this.showLoadingWithMessage();
          }
        }

        // 上拉加载时不重复设置loading状态
        if (!isLoadMore) {
          this.loadStatus = 'loading';
        }

        // 检查缓存 - 只在首次加载时使用
        const cachedData = this.getCachedData();
        if (cachedData && !force && this.page === 1 && !isLoadMore) {
          this.list = cachedData.list;
          this.totalCount = cachedData.totalCount || 0;
          this.isEmpty = cachedData.list.length === 0;
          this.loadStatus = cachedData.hasMore ? 'more' : 'noMore';
          // 恢复渲染数量
          this.renderItems = cachedData.renderItems || this.list.length;
          return Promise.resolve(cachedData);
        }

        // 优化瀑布流设置加载 - 上拉加载时跳过
        if (isLoggedIn && !isLoadMore) {
          this.refreshFlowSettings();
        }

        // 添加防抖机制 - 提升流畅度
        if (this.requestTimers.loadData) {
          clearTimeout(this.requestTimers.loadData);
        }

        // 上拉加载时减少延迟，提升响应速度
        const delay = isLoadMore ? 50 : 100;
        await new Promise(resolve => {
          this.requestTimers.loadData = setTimeout(resolve, delay);
        });

        // 根据当前tab加载数据
        let result;
        if (this.navIdx === 0) {
          // 关注页面
          const userInfo = this.getUserInfoFromCache();
          this.userUid = userInfo.uid || 0;
          result = await this.dynamicFollow('follow', force);
        } else if (this.navIdx === 1) {
          // 推荐页面
          if (!this.circleLoaded) {
            this.getHotCircles();
            this.circleLoaded = true;
          }
          this.userUid = isLoggedIn ? (this.$store.state.app.uid || 0) : 0;
          result = this.isWaterfall ?
            await this.dynamicRecommendWaterfall(force) :
            await this.dynamicRecommend(force);
        } else if (this.navIdx === 2) {
          // 附近页面
          this.userUid = isLoggedIn ? (this.$store.state.app.uid || 0) : 0;
          result = this.isWaterfall ?
            await this.dynamicRecommendWaterfall(force) :
            await this.dynamicFollow('nearby', force);
        }

        // 清除格式化缓存，确保使用新数据
        if (this._formattedCache) {
          this._formattedCache.clear();
        }

        // 更新缓存
        this.updateCache(result);
        return result;

      } catch (error) {
        this.handleLoadError(error);
        throw error;

      } finally {
        // 优化状态重置 - 上拉加载时避免不必要的操作
        if (!isLoadMore) {
          this.isRefreshing = false;
          uni.hideLoading();
        }
      }
    },

    // 获取缓存数据
    getCachedData() {
      const cache = this.cachedData[this.navIdx];
      // 确保缓存对象存在且格式正确
      if (!cache || typeof cache !== 'object' || Array.isArray(cache) || !cache.list || !cache.list.length) {
        return null;
      }

      const now = Date.now();
      const age = now - (cache.lastUpdate || 0);

      if (age > this.cacheConfig.maxAge) {
        return null; // 缓存过期
      }

      return cache;
    },

    // 更新缓存
    updateCache(data) {
      if (!data) return;

      const cache = this.cachedData[this.navIdx];
      // 确保缓存对象存在且格式正确
      if (!cache || typeof cache !== 'object' || Array.isArray(cache)) {
        this.cachedData[this.navIdx] = { list: [], page: 1, hasMore: true, lastUpdate: 0, renderItems: 15, totalCount: 0 };
      }

      const validCache = this.cachedData[this.navIdx];
      validCache.lastUpdate = Date.now();

      if (this.page === 1) {
        validCache.list = [...this.list];
        validCache.page = 1;
      } else {
        validCache.list = [...this.list];
        validCache.page = this.page;
      }

      validCache.hasMore = this.loadStatus !== 'noMore';
      validCache.renderItems = this.renderItems; // 更新渲染数量

      // 限制缓存大小
      if (validCache.list.length > this.cacheConfig.maxItems) {
        validCache.list = validCache.list.slice(0, this.cacheConfig.maxItems);
        validCache.renderItems = Math.min(validCache.renderItems, validCache.list.length);
      }
    },

    // 增强的错误处理
    handleLoadError(error) {
      this.loadStatus = 'more';

      if (this.page === 1) {
        this.isEmpty = true;
        this.list = [];
      }

      // 根据错误类型显示不同的提示
      const errorMessage = this.getErrorMessage(error);

      // 显示错误提示
      if (error !== 'loadCancelled') {
        setTimeout(() => {
          uni.showModal({
            title: '加载失败',
            content: errorMessage,
            confirmText: '重试',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                this.retryLoad();
              }
            }
          });
        }, 300);
      }
    },

    // 获取错误信息
    getErrorMessage(error) {
      // 如果是字符串，直接返回
      if (typeof error === 'string') {
        return error;
      }

      // 优先使用 msg 字段
      if (error?.msg) {
        return error.msg;
      }

      // 根据错误代码返回对应信息
      if (error?.code) {
        switch (error.code) {
          case 'NETWORK_ERROR':
            return '网络连接异常，请检查网络设置';
          case 'TIMEOUT':
            return '请求超时，请稍后重试';
          case 'SERVER_ERROR':
            return '服务器异常，请稍后重试';
          default:
            return '加载失败，请重试';
        }
      }

      // 根据状态码返回信息
      if (error?.status) {
        if (error.status === 400) {
          return error.msg || '请求参数错误';
        } else if (error.status === 401) {
          return '登录已过期，请重新登录';
        } else if (error.status === 403) {
          return '没有权限访问';
        } else if (error.status === 404) {
          return '请求的资源不存在';
        } else if (error.status >= 500) {
          return '服务器内部错误';
        }
      }

      return error?.message || '无法获取数据，请检查网络连接';
    },

    // 重试加载
    retryLoad() {
      // 重置状态
      this.resetLoadingState();

      // 延迟重试，避免频繁请求
      setTimeout(() => {
        this.loadData(true).catch(err => {
          uni.showToast({
            title: '重试失败，请稍后再试',
            icon: 'none',
            duration: 2000
          });
        });
      }, 500);
    },
    
    likeClick(data) {
      // 点赞回调处理 - 更新对应数据项的点赞状态

      if (data && typeof data.index !== 'undefined' && data.id) {
        // 在原始 list 数据中查找并更新对应项
        const listItem = this.list.find(item => item.id === data.id);

        if (listItem) {
          // 更新点赞状态
          listItem.is_like = data.isLike ? 1 : 0;

          // 更新点赞数量
          if (data.isLike) {
            listItem.likes = (parseInt(listItem.likes) || 0) + 1;
          } else {
            listItem.likes = Math.max(0, (parseInt(listItem.likes) || 0) - 1);
          }

          // 标记该项需要重新格式化
          listItem._formatted = false;

          // 清除格式化缓存，让计算属性重新计算
          if (this._formattedCache) {
            this._formattedCache.clear();
          }

          // 触发响应式更新（避免重复调用$forceUpdate）
          this.$nextTick(() => {
            this.$forceUpdate();
          });
        }
      }
    },

    followClick(data) {
      // 关注回调处理 - 更新对应数据项的关注状态

      if (data && data.uid) {
        // 在原始 list 数据中查找并更新对应用户的所有动态
        this.list.forEach(item => {
          if (item.uid === data.uid) {
            // 更新关注状态
            if (item.user_info) {
              item.user_info.is_follow = data.is_follow;
              item.user_info.is_mutual_follow = data.is_mutual || 0;
            }

            // 如果有 user 字段也要更新
            if (item.user) {
              item.user.is_follow = data.is_follow;
              item.user.is_mutual_follow = data.is_mutual || 0;
            }
          }
        });

        // 清除格式化缓存，让计算属性重新计算
        if (this._formattedCache) {
          this._formattedCache.clear();
        }

        // 触发响应式更新
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      }
    },

    waterfallLikeClick(data) {
      // 瀑布流点赞回调处理 - 与普通点赞处理相同
      this.likeClick(data);
    },
    
    navigateToFun(e) {
      if (!e || !e.currentTarget || !e.currentTarget.dataset || !e.currentTarget.dataset.url) {
        return
      }
      
      if (this._navigateLock) return
      this._navigateLock = true
      
      const url = "/pages/" + e.currentTarget.dataset.url
      
      uni.navigateTo({
        url: url,
        complete: () => {
          setTimeout(() => {
            this._navigateLock = false
          }, 500)
        }
      })
    },
    

    
    loadFlowSettings() {
      try {
        const userInfo = this.getUserInfoFromCache();

        // 使用新的字段格式读取瀑布流设置，直接使用整型比较
        const dynamicFlow = userInfo.dynamic_flow !== undefined ?
          userInfo.dynamic_flow : 1; // 默认开启

        const oldWaterfall = this.isWaterfall;

        // 关注页面不使用瀑布流，其他页面根据设置决定
        if (this.navIdx === 0) {
          // 关注页面始终不使用瀑布流
          this.isWaterfall = false;
        } else {
          // 其他页面根据设置决定：1为开启，0为关闭
          this.isWaterfall = dynamicFlow === 1;
        }

        if (oldWaterfall !== this.isWaterfall) {
          this.$forceUpdate();
        }

        return {
          dynamicFlow,
          circleFlow: userInfo.circle_flow !== undefined ? userInfo.circle_flow : 1
        };
      } catch (e) {
        this.isWaterfall = false;
        return { dynamicFlow: 0, circleFlow: 0 };
      }
    },
    
    refreshFlowSettings() {
      return new Promise((resolve) => {
        try {
          this.loadFlowSettings();
          resolve(true);
        } catch (error) {
          this.isWaterfall = false;
          resolve(false);
        }
      });
    },
    
    dynamicRecommend(forceLoad = false) {
      if (!forceLoad && this.isLoading) {
        return Promise.reject('正在加载中');
      }
      
      this.isLoading = true;
      
      const params = {
        page: this.page,
        limit: 10, // 添加limit参数
        type: 'hot'
      };
      
      return getDynamicList(params)
        .then(res => {
          uni.hideLoading();
          this.isLoading = false;



          if (res.status === 200) {
            const list = res.data.list || [];

            if (this.page === 1) {
              this.list = list;
            } else {
              // 使用push.apply比扩展运算符更高效
              this.list.push(...list);
            }

            // 更新总数据量
            if (res.data.count !== undefined) {
              this.totalCount = res.data.count;
            }

            // 优化加载状态判断
            if (list.length === 0) {
              // 当前页没有数据，说明没有更多了
              this.loadStatus = 'noMore';
            } else if (this.totalCount > 0 && this.list.length >= this.totalCount) {
              // 已加载的数据量达到或超过总数
              this.loadStatus = 'noMore';
            } else if (list.length < 10) {
              // 返回的数据量少于请求的数量，说明没有更多了
              this.loadStatus = 'noMore';
            } else {
              // 还有更多数据
              this.loadStatus = 'more';
            }

            this.isEmpty = list.length === 0 && this.page === 1;

            // 确保renderItems足够显示所有数据
            if (this.list.length > this.renderItems) {
              this.renderItems = this.list.length;
            }

            this.renderMode();

            return res.data;
          } else {
            this.handleApiError(res);
            return Promise.reject(res.msg || '获取推荐失败');
          }
        })
        .catch(err => {
          this.handleApiError(err);
          return Promise.reject(err);
        });
    },
    
    dynamicRecommendWaterfall(forceLoad = false) {
      if (!forceLoad && this.isLoading) {
        return Promise.reject('正在加载中');
      }
      
      this.isLoading = true;
      
      const params = {
        page: this.page,
        limit: 10, // 添加limit参数
        type: 'hot',
        waterfall: 1
      };
      
      return getDynamicList(params).then(res => {
        uni.hideLoading();
        this.isLoading = false;
        
        if (res.status === 200) {
          const list = res.data.list || [];
          
          if (this.page === 1) {
            this.list = list;
          } else {
            // 使用push.apply比扩展运算符更高效
            this.list.push(...list);
          }

          // 更新总数据量
          if (res.data.count !== undefined) {
            this.totalCount = res.data.count;
          }

          // 优化加载状态判断
          if (list.length === 0) {
            // 当前页没有数据，说明没有更多了
            this.loadStatus = 'noMore';
          } else if (this.totalCount > 0 && this.list.length >= this.totalCount) {
            // 已加载的数据量达到或超过总数
            this.loadStatus = 'noMore';
          } else if (list.length < 10) {
            // 返回的数据量少于请求的数量，说明没有更多了
            this.loadStatus = 'noMore';
          } else {
            // 还有更多数据
            this.loadStatus = 'more';
          }

          this.isEmpty = list.length === 0 && this.page === 1;

          // 确保renderItems足够显示所有数据
          if (this.list.length > this.renderItems) {
            this.renderItems = this.list.length;
          }

          this.renderMode();

          return res.data;
        } else {
          this.loadStatus = 'more';
          if (this.page === 1) {
            this.isEmpty = true;
            this.list = [];
          }
          
          uni.showToast({
            title: res.msg || '获取推荐失败',
            icon: 'none',
            duration: 2000
          });
          
          return Promise.reject(res.msg || '获取瀑布流数据失败');
        }
      }).catch(err => {
        uni.hideLoading();
        this.isLoading = false;
        
        this.loadStatus = 'more';
        if (this.page === 1) {
          this.isEmpty = true;
          this.list = [];
        }
        
        uni.showToast({
          title: '网络连接异常，请检查网络设置',
          icon: 'none',
          duration: 3000
        });
        
        return Promise.reject(err);
      });
    },
    
    dynamicFollow(type = 'follow', forceLoad = false) {
      // 关注页面已在loadData中处理了未登录状态，这里不需要再次判断
      // 防止重复加载
      if (!forceLoad && this.isLoading) {
        return Promise.resolve(null); // 返回已解决的Promise，避免未捕获的拒绝
      }
      
      this.isLoading = true;
      
      const params = {
        page: this.page,
        limit: 10, // 添加limit参数
        type: type
      };
      
      if (type === 'nearby') {
        params.longitude = this.userLongitude || 113.26436;
        params.latitude = this.userLatitude || 23.12908;
      }
      
      return getDynamicList(params).then(res => {
        // 确保在任何情况下都重置加载状态
        this.isLoading = false;
        uni.hideLoading();



        if (res.status === 200) {
          const list = res.data.list || [];

          if (this.page === 1) {
            this.list = list;
          } else {
            // 使用push.apply比扩展运算符更高效
            this.list.push(...list);
          }

          // 更新总数据量
          if (res.data.count !== undefined) {
            this.totalCount = res.data.count;
          }

          // 优化加载状态判断
          if (list.length === 0) {
            // 当前页没有数据，说明没有更多了
            this.loadStatus = 'noMore';
          } else if (this.totalCount > 0 && this.list.length >= this.totalCount) {
            // 已加载的数据量达到或超过总数
            this.loadStatus = 'noMore';
          } else if (list.length < 10) {
            // 返回的数据量少于请求的数量，说明没有更多了
            this.loadStatus = 'noMore';
          } else {
            // 还有更多数据
            this.loadStatus = 'more';
          }

          this.isEmpty = list.length === 0 && this.page === 1;

          // 确保renderItems足够显示所有数据
          if (this.list.length > this.renderItems) {
            this.renderItems = this.list.length;
          }

          this.renderMode();

          return res.data;
        } else {
          this.loadStatus = 'more';
          if (this.page === 1) {
            this.isEmpty = true;
            this.list = [];
          }
          
          uni.showToast({
            title: res.msg || '获取动态失败',
            icon: 'none',
            duration: 2000
          });
          
          return Promise.reject(res.msg || '获取动态失败');
        }
      }).catch(err => {
        // 确保在任何情况下都重置加载状态
        this.isLoading = false;
        uni.hideLoading();
        
        this.loadStatus = 'more';
        if (this.page === 1) {
          this.isEmpty = true;
          this.list = [];
        }
        
        // 只在非取消加载的情况下显示错误提示
        if (err !== 'loadCancelled') {
        uni.showToast({
          title: '网络连接异常，请检查网络设置',
          icon: 'none',
          duration: 3000
        });
        }
        
        return Promise.reject(err);
      });
    },
    
    renderMode() {
      if (!this.renderItems || this.renderItems < 10) {
        this.renderItems = 10;
      }
      if (!this.renderStep) {
        this.renderStep = 5;
      }
      
      if (!this.list || this.list.length === 0) {
        return;
      }
      
      this.renderItems = Math.min(this.list.length, this.renderItems);
    },
    
    onReachEnd() {
      // 使用节流避免频繁触发
      if (this._reachEndThrottle) return;
      this._reachEndThrottle = true;

      setTimeout(() => {
        this._reachEndThrottle = false;
      }, 300);

      // 防止重复触发或在已无更多数据时加载
      if (this.isLoading || this.isRefreshing || this.loadStatus === 'noMore') {
        return;
      }

      const isLoggedIn = this.isLogin && this.$store.state.app.token;

      // 关注页面未登录不加载
      if (this.navIdx === 0 && !isLoggedIn) {
        return;
      }

      // 检查是否需要预加载
      const remainingItems = this.list.length - this.renderItems;
      if (remainingItems > this.cacheConfig.preloadThreshold) {
        return;
      }

      // 确保用户ID正确
      if (isLoggedIn && !this.userUid) {
        this.initUserInfoFromCache();
      }

      // 更新页码和状态
      const currentPage = this.page;
      this.page++;
      this.loadStatus = 'loading';

      // 异步加载更多数据，避免阻塞UI
      this.$nextTick(() => {
        this.loadData(true).catch(error => {

          // 恢复页码和状态
          this.page = currentPage;
          this.loadStatus = 'more';

          // 显示错误提示
          uni.showToast({
            title: '加载失败，请重试',
            icon: 'none',
            duration: 2000
          });
        });
      });
    },

    // 显示错误提示
    showErrorToast(message, duration = 2000) {
      uni.showToast({
        title: message,
        icon: 'none',
        duration: duration
      });
    },

    formatDynamicData(data) {
      // 快速检查，避免重复格式化
      if (!data || typeof data !== 'object' || data._formatted) {
        return data;
      }

      // 使用Object.create(null)创建更轻量的对象
      const result = Object.create(null);

      // 批量设置基础属性，减少属性访问次数
      const id = data.id || Date.now() + Math.floor(Math.random() * 1000);
      const type = this.determineContentType(data);
      const user = this.formatUserInfo(data);
      const user_id = data.uid || data.user_id || user?.id || 0;

      // 一次性设置所有属性，避免多次属性赋值
      Object.assign(result, data, {
        id,
        type,
        user,
        user_id,
        uid: user_id,
        like_count: data.like_count || data.likes || 0,
        likes: data.likes || data.like_count || 0,
        comment_count: data.comment_count || data.comments || 0,
        create_time_str: data.create_time_str || data.time_str || data.create_time || '刚刚',
        province: data.province || '',
        browse: data.browse || data.view_count || data.views || 0,
        is_like: data.is_like ? 1 : 0,
        _formatted: true
      });

      // 设置字符串格式 - 使用模板字符串提高性能
      result.like_count_str = `${result.like_count}`;
      result.comment_count_str = `${result.comment_count}`;

      // 格式化媒体内容
      this.formatMediaContent(result);

      // 格式化位置和其他信息
      if (data.adds_name) {
        result.lat = data.lat || 0;
        result.lng = data.lng || 0;
      }

      result.circle_id = data.circle_id || 0;
      result.activity_id = data.activity_id || 0;
      result.order_id = data.order_id || 0;

      // 格式化评论信息 - 优化条件判断
      const comment = data.comment;
      if (comment && typeof comment === 'object' && !comment.user_name && comment.user) {
        result.comment = {
          ...comment,
          user_name: comment.user.name || ''
        };
      }

      return result;
    },

    // 确定内容类型
    determineContentType(data) {
      if (data.type !== undefined) {
        return data.type;
      }

      if (data.video || data.video_url) {
        return 3; // 视频
      } else if (data.audio) {
        return 4; // 音频
      } else if ((data.images && Array.isArray(data.images) && data.images.length > 0) ||
                (data.imgs && Array.isArray(data.imgs) && data.imgs.length > 0)) {
        return 2; // 图片
      } else {
        return 1; // 文本
      }
    },

    // 格式化用户信息
    formatUserInfo(data) {
      if (data.user) {
        return data.user;
      }

      return {
        id: data.uid || data.user_id || 0,
        avatar: data.user_info?.avatar || data.user_avatar || '/static/img/avatar.png',
        name: data.user_info?.nickname || data.user_name || '用户',
        gender: data.user_gender || 1,
        age: data.user_age || ''
      };
    },

    // 格式化媒体内容
    formatMediaContent(result) {
      if (result.type === 2) {
        this.formatImageContent(result);
      } else if (result.type === 3) {
        this.formatVideoContent(result);
      } else if (result.type === 4) {
        this.formatAudioContent(result);
      }
    },

    // 格式化图片内容
    formatImageContent(result) {
      if (!result.imgs || !Array.isArray(result.imgs)) {
        result.imgs = [];

        if (result.images && Array.isArray(result.images)) {
          result.imgs = result.images.map(url => {
            return typeof url === 'string' ? { url } : url;
          });
        }

        if (result.img && result.img.url) {
          const found = result.imgs.some(img => img.url === result.img.url);
          if (!found) {
            result.imgs.unshift(result.img);
          }
        }
      }

      result.imgs = result.imgs.map(img => {
        if (typeof img === 'string') {
          return { url: img, wide: 800, high: 600 };
        }
        return {
          url: img.url || '',
          wide: img.wide || 800,
          high: img.high || 600
        };
      });

      result.img_count = result.imgs.length;
    },

    // 格式化视频内容
    formatVideoContent(result) {
      if (!result.video || typeof result.video === 'string') {
        result.video = {
          url: result.video || result.video_url || '',
          cover: result.video_cover || '',
          wide: result.video_width || 720,
          high: result.video_height || 1280
        };
      }
    },

    // 格式化音频内容
    formatAudioContent(result) {
      if (!result.audio) {
        result.audio = {
          name: result.audio_name || '未知音频',
          intro: result.audio_intro || '暂无简介',
          cover: result.audio_cover || '/static/img/default_bg.jpg'
        };
      }
    },
    touchStart(e) {
      this.touchStartY = e.touches[0].pageY;
    },

    touchMove(e) {
      // 使用 passive 事件监听器优化性能
      e.stopPropagation();
    },
    navClick(e) {
      if (!e?.currentTarget?.dataset) return;

      const index = parseInt(e.currentTarget.dataset.idx || 0);

      // 避免重复处理相同页签
      if (this.navIdx === index || this.isSwitching) return;

      this.switchToTab(index);
    },

    // 切换到指定标签页
    async switchToTab(index) {
      try {
        this.isSwitching = true;

        // 缓存当前数据
        this.saveCurrentTabData();

        // 更新页签索引
        this.navIdx = index;

        // 清除格式化缓存
        if (this._formattedCache) {
          this._formattedCache.clear();
        }

        // 重置页面状态
        this.resetTabState();

        // 关注页面未登录特殊处理
        if (index === 0 && !this.isLogin) {
          this.isEmpty = false;
          this.loadStatus = 'more';
          return;
        }

        // 推荐页只首次加载圈子
        if (index === 1 && !this.circleLoaded) {
          this.getHotCircles();
          this.circleLoaded = true;
        }

        // 加载设置和数据
        this.loadFlowSettings();
        await this.loadData(true);

      } catch (error) {
      } finally {
        this.isSwitching = false;
      }
    },

    // 重置标签页状态
    resetTabState() {
      this.page = 1;
      this.isEmpty = false;
      this.loadStatus = 'loading';
      this.list = [];
      this.renderItems = 15; // 重置渲染数量
    },
    
    clearCache(tabIndex = null) {
      if (tabIndex !== null && typeof tabIndex === 'number') {
        this.cachedData[tabIndex] = {
          list: [],
          page: 1,
          hasMore: true,
          lastUpdate: 0,
          renderItems: 15
        };
      } else {
        this.cachedData = {
          0: { list: [], page: 1, hasMore: true, lastUpdate: 0, renderItems: 15 },
          1: { list: [], page: 1, hasMore: true, lastUpdate: 0, renderItems: 15 },
          2: { list: [], page: 1, hasMore: true, lastUpdate: 0, renderItems: 15 }
        };
      }
    },
    
    // 处理用户信息更新
    handleUserInfoUpdate() {
      // 重新加载瀑布流设置
      this.loadFlowSettings();
      
      // 如果设置发生变化，可能需要刷新数据
      if (this.list.length === 0) {
        this.loadData(true);
      }
    },
    
    // 处理瀑布流设置更新
    handleFlowSettingsUpdate(settings) {
      // 保存当前瀑布流状态
      const oldWaterfall = this.isWaterfall;

      // 关注页面不使用瀑布流，其他页面根据设置决定
      if (this.navIdx === 0) {
        this.isWaterfall = false;
      } else {
        // 支持新的字段格式和旧的对象格式，直接使用整型比较
        const dynamicFlow = settings.dynamic_flow !== undefined ?
          settings.dynamic_flow :
          (settings.dynamicFlow !== undefined ? (settings.dynamicFlow ? 1 : 0) : 0);
        this.isWaterfall = dynamicFlow === 1;
      }

      // 如果设置发生变化，刷新数据
      if (oldWaterfall !== this.isWaterfall) {
        // 清除当前标签页缓存
        this.clearTabCache(this.navIdx);

        // 重置加载状态
        this.resetLoadingState();

        // 重新加载数据
        this.page = 1;
        this.renderItems = 15; // 重置渲染数量
        this.loadData(true).catch(() => {
          // 静默处理错误
        });
      }
    },
    // 添加检查微信环境的方法
    // #ifdef H5
    checkWeixinEnvironment() {
      const ua = navigator.userAgent.toLowerCase();
      this.isWeixin = ua.indexOf('micromessenger') !== -1;
    },
    // #endif
    // 获取并解析用户信息缓存的统一方法
    getUserInfoFromCache() {
      let userInfo = uni.getStorageSync('USER_INFO') || {};
      
      // 如果缓存返回的是字符串，先解析为对象
      if (typeof userInfo === 'string') {
        try {
          userInfo = JSON.parse(userInfo);
        } catch (e) {
          userInfo = {};
        }
      }
      
      return userInfo;
    },
    
    // 添加一个新方法，用于从缓存初始化用户信息
    initUserInfoFromCache() {
      // 统一从Vuex获取用户ID
      this.userUid = this.$store.state.app.uid || 0;
      
      // 设置其他用户信息
      const userInfo = this.getUserInfoFromCache();
      this.userCity = userInfo.residence_name || userInfo.city || '广州';
      this.userAvatar = userInfo.avatar || '/static/img/avatar.png';
      this.currentMsg = userInfo.service_num || 0;
      
      return userInfo;
    },
    
    // 添加刷新用户信息的方法
    refreshUserInfo() {
      const userInfo = this.getUserInfoFromCache();
      this.userAvatar = userInfo.avatar || '/static/img/avatar.png';
      this.userCity = userInfo.residence_name || userInfo.city || '广州';
      this.userUid = this.$store.state.app.uid || 0;
      this.currentMsg = userInfo.service_num || 0;
    },
    // 重置加载状态
    resetLoadingState() {
      this.isLoading = false;
      this.isRefreshing = false;
      this.isSwitching = false;
      uni.hideLoading();
    },

    // 显示带消息的加载提示
    showLoadingWithMessage() {
      const messages = [
        '加载中...',
        '获取最新内容...',
        '正在为您推荐...',
        '加载精彩内容...'
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      uni.showLoading({
        title: randomMessage,
        mask: true
      });
    },

    // 显示成功提示
    showSuccessToast(message = '操作成功') {
      uni.showToast({
        title: message,
        icon: 'success',
        duration: 1500
      });
    },

    // 显示错误提示
    showErrorToast(message = '操作失败') {
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      });
    },

    // 显示网络错误提示
    showNetworkError() {
      uni.showModal({
        title: '网络异常',
        content: '网络连接不稳定，请检查网络设置后重试',
        confirmText: '重试',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.retryLoad();
          }
        }
      });
    },

    // 初始化平台特性
    initPlatformFeatures() {
      // #ifdef H5
      this.checkWeixinEnvironment();
      this.initH5Features();
      // #endif

      // #ifdef MP
      this.initMiniProgramFeatures();
      // #endif

      // #ifdef APP-PLUS
      this.initAppFeatures();
      // #endif
    },

    // #ifdef H5
    initH5Features() {
      // 监听窗口大小变化
      window.addEventListener('resize', this.calcContentHeight);

      // 监听网络状态变化
      window.addEventListener('online', this.handleNetworkChange);
      window.addEventListener('offline', this.handleNetworkChange);

      // 优化H5滚动性能
      this.optimizeH5Scroll();
    },

    optimizeH5Scroll() {
      // 添加滚动优化
      const style = document.createElement('style');
      style.textContent = `
        .content-scroll {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
      `;
      document.head.appendChild(style);
    },

    handleNetworkChange() {
      // 检查 navigator 是否存在（H5 环境）
      if (typeof navigator !== 'undefined' && typeof navigator.onLine !== 'undefined') {
        if (navigator.onLine) {
          this.showSuccessToast('网络已连接');
          // 网络恢复时重新加载数据
          if (this.isEmpty) {
            this.retryLoad();
          }
        } else {
          this.showErrorToast('网络连接断开');
        }
      }
    },
    // #endif

    // #ifdef MP
    initMiniProgramFeatures() {
      // 小程序特有的初始化
      this.optimizeMiniProgramPerformance();
    },

    optimizeMiniProgramPerformance() {
      // 小程序性能优化
      this.renderItems = Math.min(this.renderItems, 20); // 限制渲染数量
      this.renderStep = Math.min(this.renderStep, 5);    // 减少渲染步长
    },
    // #endif

    // #ifdef APP-PLUS
    initAppFeatures() {
      // APP特有的初始化
      this.optimizeAppPerformance();
    },

    optimizeAppPerformance() {
      // APP性能优化
      this.renderItems = Math.min(this.renderItems, 30); // APP可以渲染更多
      this.renderStep = Math.min(this.renderStep, 10);   // 更大的渲染步长
    },
    // #endif

    // 清理平台特性
    cleanupPlatformFeatures() {
      // #ifdef H5
      window.removeEventListener('resize', this.calcContentHeight);
      window.removeEventListener('online', this.handleNetworkChange);
      window.removeEventListener('offline', this.handleNetworkChange);
      // #endif
    },

    // 内存回收机制
    performMemoryCleanup() {
      try {
        // 清理格式化缓存
        if (this._formattedCache) {
          this._formattedCache.clear();
        }

        // 清理过期的缓存数据
        if (this.cachedData && this.cacheConfig) {
          const now = Date.now();
          Object.keys(this.cachedData).forEach(key => {
            const cache = this.cachedData[key];
            if (cache && cache.lastUpdate && (now - cache.lastUpdate) > this.cacheConfig.maxAge * 2) {
              // 清理过期缓存
              cache.list = [];
              cache.lastUpdate = 0;
            }
          });
        }

        // 清理列表中的临时数据
        if (this.list && this.list.length > 0) {
          this.list.forEach(item => {
            // 清理临时属性
            delete item._formatted;
            delete item._temp;
          });
        }

        // 清理定时器
        this.clearTimers();

        // 强制垃圾回收（如果支持）
        // #ifdef H5
        if (typeof window !== 'undefined' && window.gc && typeof window.gc === 'function') {
          try {
            window.gc();
          } catch (gcError) {
            console.warn('强制垃圾回收失败:', gcError);
          }
        }
        // #endif

        // #ifdef APP-PLUS
        if (typeof plus !== 'undefined' && plus.runtime && plus.runtime.gc) {
          try {
            plus.runtime.gc();
          } catch (gcError) {
            console.warn('APP强制垃圾回收失败:', gcError);
          }
        }
        // #endif
      } catch (error) {
        console.warn('内存清理失败:', error);
      }
    },

    // 清理定时器和内存
    clearTimers() {
      try {
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = null;
        }

        if (this.scrollTimer) {
          clearTimeout(this.scrollTimer);
          this.scrollTimer = null;
        }

        if (this.scrollRAF) {
          const cancelFrame = this.getCancelAnimationFrame();
          if (cancelFrame) {
            cancelFrame(this.scrollRAF);
          }
          this.scrollRAF = null;
        }

        // 清理请求定时器
        if (this.requestTimers) {
          Object.keys(this.requestTimers).forEach(key => {
            if (this.requestTimers[key]) {
              clearTimeout(this.requestTimers[key]);
              this.requestTimers[key] = null;
            }
          });
        }
      } catch (error) {
        console.warn('清理定时器失败:', error);
      }
    },

    // 获取热门圈子
    getHotCircles() {
      // 调用热门圈子接口
      getHotCircles() // 移除固定的limit参数，使用接口默认值
        .then(res => {
          if (res.status === 200 && res.data) {
            // 处理圈子数据，确保字段兼容
            this.circle = res.data.map(item => {
              return {
                id: item.id,
                circle_name: item.circle_name || item.name,
                circle_avatar: item.circle_avatar || item.avatar,
                name: item.circle_name || item.name, // 兼容字段
                avatar: item.circle_avatar || item.avatar, // 兼容字段
                is_hot: item.is_hot || false,
                is_new: item.is_new || false,
                dynamic_count: item.dynamic_count || 0,
                member_count: item.member_count || 0,
                user_count: item.member_count || 0, // 兼容字段
                circle_description: item.circle_description || ''
              };
            });
          } else {
            this.circle = [];
          }
        })
        .catch(() => {
          this.circle = [];
        });
    },
    
    // 添加统一的API错误处理方法
    handleApiError(err) {
      // 隐藏加载提示
      uni.hideLoading();
      
      // 重置加载状态
      this.isLoading = false;
      
      // 处理错误
      this.loadStatus = 'more';
      if (this.page === 1) {
        this.isEmpty = true;
        this.list = [];
      }
      
      // 显示错误提示
      uni.showToast({
        title: err.msg || '网络连接异常，请检查网络设置',
        icon: 'none',
        duration: 2000
      });
    },
    
    // 获取用户位置信息 - 参考order_confirm页面的实现
    getUserLocation() {
      // 先尝试从缓存获取
      const cachedLatitude = uni.getStorageSync('user_latitude') || uni.getStorageSync('residence_lat');
      const cachedLongitude = uni.getStorageSync('user_longitude') || uni.getStorageSync('residence_lng');

      if (cachedLatitude && cachedLongitude) {
        this.userLatitude = parseFloat(cachedLatitude);
        this.userLongitude = parseFloat(cachedLongitude);

        // 如果有缓存的地址信息，也获取一下
        const cachedAddress = uni.getStorageSync('residence_name');
        if (cachedAddress) {
          this.userCity = cachedAddress;
        } else {
          // 根据经纬度获取地址
          this.getAddressFromLocation(this.userLatitude, this.userLongitude);
        }
        return;
      }

      // 缓存中没有位置信息，尝试获取当前位置
      this.requestLocation();
    },

    // 请求位置信息 - 参考order_confirm的实现方式
    requestLocation() {
      // #ifdef H5
      // 检查是否在微信环境中
      if (this.$wechat && this.$wechat.isWeixin()) {
        // 微信环境下使用微信API获取位置
        this.$wechat.location().then(res => {
          this.handleLocationSuccess(res);
        }).catch(err => {
          console.log('微信定位失败:', err);
          this.fallbackToUniLocation();
        });
      } else {
        this.fallbackToUniLocation();
      }
      // #endif

      // #ifndef H5
      // 非H5环境直接使用uni.getLocation
      this.fallbackToUniLocation();
      // #endif
    },

    // 使用uni.getLocation获取位置
    fallbackToUniLocation() {
      uni.getLocation({
        type: 'wgs84',
        geocode: true, // 启用逆地理编码
        success: (res) => {
          this.handleLocationSuccess(res);
        },
        fail: (err) => {
          console.log('uni.getLocation失败:', err);
          this.handleLocationError(err);
        }
      });
    },

    // 处理定位成功
    handleLocationSuccess(res) {
      this.userLatitude = res.latitude;
      this.userLongitude = res.longitude;

      // 保存到缓存 - 使用order_confirm相同的key
      uni.setStorageSync('user_latitude', res.latitude);
      uni.setStorageSync('user_longitude', res.longitude);
      // 同时保存到原有的key，保持兼容性
      uni.setStorageSync('residence_lat', res.latitude);
      uni.setStorageSync('residence_lng', res.longitude);

      // 如果返回了地址信息，直接使用
      if (res.address) {
        this.userCity = res.address.city || res.address.district || res.address.province || '';
        if (this.userCity) {
          uni.setStorageSync('residence_name', this.userCity);
        }
      } else {
        // 根据经纬度获取地址
        this.getAddressFromLocation(res.latitude, res.longitude);
      }
    },

    // 处理定位失败
    handleLocationError(err) {
      console.log('定位失败:', err);

      // 根据错误类型给出不同提示
      let errorMsg = '定位失败';
      if (err.errMsg) {
        if (err.errMsg.includes('auth deny')) {
          errorMsg = '定位权限被拒绝，将使用默认位置';
        } else if (err.errMsg.includes('timeout')) {
          errorMsg = '定位超时，将使用默认位置';
        } else if (err.errMsg.includes('fail')) {
          errorMsg = '定位服务不可用，将使用默认位置';
        }
      }

      // 显示提示（可选）
      // uni.showToast({
      //   title: errorMsg,
      //   icon: 'none',
      //   duration: 2000
      // });

      // 设置默认位置
      this.setDefaultLocation();
    },
    
    // 设置默认位置（广州）
    setDefaultLocation() {
      this.userLatitude = 23.12908; // 广州纬度
      this.userLongitude = 113.26436; // 广州经度
      this.userCity = "广东省广州市";
      // 保存到缓存
      uni.setStorageSync('residence_lat', this.userLatitude);
      uni.setStorageSync('residence_lng', this.userLongitude);
      uni.setStorageSync('residence_name', this.userCity);

    },
    
    // 强制刷新位置信息
    refreshLocation() {

      // 清除缓存的位置信息
      uni.removeStorageSync('residence_lat');
      uni.removeStorageSync('residence_lng');
      uni.removeStorageSync('residence_name');
      // 重新获取位置
      this.getUserLocation();
    },
    
    // 根据经纬度获取地址信息（逆地理编码）
    getAddressFromLocation(latitude, longitude) {

      
      // 使用腾讯地图逆地理编码API
      uni.request({
        url: 'https://apis.map.qq.com/ws/geocoder/v1/',
        data: {
          location: `${latitude},${longitude}`,
          key: 'F7LBZ-NLU6D-6524Z-PK6ZQ-D47AJ-KRB2I', // 腾讯地图API key
          get_poi: 0
        },
        success: (res) => {

          if (res.data.status === 0 && res.data.result) {
            const result = res.data.result;
            const province = result.ad_info.province;
            const city = result.ad_info.city;
            const district = result.ad_info.district;
            
            // 组合地址信息
            let fullAddress = '';
            if (province && city) {
              if (province === city) {
                // 直辖市情况
                fullAddress = province + (district || '');
              } else {
                // 普通省市情况
                fullAddress = province + city + (district || '');
              }
            } else {
              // 备用方案
              fullAddress = result.address || '未知位置';
            }
            
            // 更新地址信息
            this.userCity = fullAddress;
            
            // 保存到缓存
            uni.setStorageSync('residence_name', fullAddress);
            
            
          } else {
            
            this.setFallbackAddress();
          }
        },
        fail: () => {
          this.setFallbackAddress();
        }
      });
    },
    
    // 设置备用地址
    setFallbackAddress() {
      // 如果逆地理编码失败，使用默认地址
      const defaultAddress = "广东省广州市";
      this.userCity = defaultAddress;

    },
    // 处理标签更新
    handleTagsUpdate({ tags, userId }) {
      // 更新列表中对应用户的标签
      if (this.displayItems && this.displayItems.length > 0) {
        this.displayItems = this.displayItems.map(item => {
          if (item.user_id === userId || item.id === userId) {
            return {
              ...item,
              interest_tags: tags
            };
          }
          return item;
        });
      }
      
      // 如果需要重新加载列表数据
      this.loadData(true);
    },
    fetchList() {
      this.page = 1;
      this.loadData(true);
    },
    onCardUpdate({ vote_info, idx }) {
      if (this.list[idx]) {
        // Vue3兼容：直接赋值替代$set
        this.list[idx].vote_info = vote_info;
      }
    },
  },
  computed: {
    isLogin() {
      return this.userStore.isLoggedIn;
    },
    // 优化后的显示数据计算，使用更高效的缓存机制
    displayItems() {
      // 如果列表为空，直接返回空数组
      if (!this.list || this.list.length === 0) {
        return [];
      }

      // 确保缓存对象存在
      if (!this._formattedCache) {
        this._formattedCache = new Map();
      }

      // 使用更高效的缓存检查
      const cacheKey = `${this.list.length}_${this.renderItems}`;
      if (this._formattedCache.has(cacheKey)) {
        return this._formattedCache.get(cacheKey);
      }

      // 只处理需要渲染的数据，减少计算量
      const itemsToRender = this.list.slice(0, this.renderItems);
      const formattedItems = itemsToRender.map(item => {
        // 如果已经格式化过，直接返回
        if (item._formatted) {
          return item;
        }
        // 否则进行格式化
        return this.formatDynamicData(item);
      });

      // 缓存结果
      this._formattedCache.set(cacheKey, formattedItems);
      
      // 限制缓存大小，防止内存泄漏
      if (this._formattedCache.size > 10) {
        const firstKey = this._formattedCache.keys().next().value;
        this._formattedCache.delete(firstKey);
      }

      return formattedItems;
    },

    // 新增：虚拟滚动计算属性
    virtualScrollItems() {
      if (!this.list || this.list.length === 0) {
        return [];
      }

      const { startIndex, endIndex } = this.virtualScroll;
      const visibleItems = this.list.slice(startIndex, endIndex);
      
      return visibleItems.map(item => {
        if (item._formatted) {
          return item;
        }
        return this.formatDynamicData(item);
      });
    },

    // 新增：容器高度计算
    containerHeight() {
      return this.list.length * this.virtualScroll.itemHeight;
    },

    // 新增：偏移量计算
    offsetY() {
      return this.virtualScroll.startIndex * this.virtualScroll.itemHeight;
    }
  },
  watch: {
    // 监听isWaterfall变化，清除缓存让Vue自动重新渲染
    isWaterfall() {
      // 清除格式化缓存，让计算属性重新计算
      if (this._formattedCache) {
        this._formattedCache.clear();
      }
    }
  }
}
</script>

<style>
.nav-box{
  position:fixed;
  top:0;
  width:100%;
  z-index:99;
  box-sizing:border-box;
  background:#fff;
  /* 添加硬件加速 */
  transform: translateZ(0);
  will-change: transform;
}
.nav-box .bar-box{
  width:100%;
  position:relative
}
.bar-box .bar-title{
  padding:0 30rpx;
  font-size:32rpx;
  font-weight:700
}
.bar-box .bar-title image{
  margin-left:10rpx;
  width:15rpx;
  height:15rpx;
  transition:transform .3s ease-in-out
}
.bar-box .bar-search{
  padding:0 20rpx;
  width:180rpx;
  height:calc(100% - 24rpx);
  font-size:24rpx;
  font-weight:700;
  color:#999;
  background:#f8f8f8;
  border-radius:50rpx;
  border:1px solid #f5f5f5
}
.bar-box .bar-search image{
  margin-right:10rpx;
  width:30rpx;
  height:30rpx
}

.bar-box .bar-item{
  position:absolute;
  z-index:101;
  left:30rpx;
  padding:0 20rpx;
  flex-direction:column;
  justify-content:center;
  background:#fff;
  border-radius:24rpx;
  box-shadow:0 0 24rpx rgba(0,0,0,.06);
  transition:height .3s ease-in-out;
  overflow:hidden
}
.bar-box .bar-item view{
  padding:0 25rpx 0 15rpx;
  width:140rpx;
  height:70rpx;
  font-size:26rpx;
  font-weight:500;
  border-radius:12rpx;
  justify-content:space-between
}
.bar-box .bar-item image{
  width:24rpx;
  height:24rpx
}
.bar-box .bar-item view:hover{
  background:#f8f8f8
}
.bar-mask{
  position:fixed;
  z-index:100;
  top:0;
  right:0;
  bottom:0;
  left:0;
  width:100%;
  height:100%
}
.content-box{
  width:100%
}

.scroll-box{
  width:100%;
  white-space:nowrap;
  overflow:hidden;
  transition:height .45s ease-in-out
}
.content-box .circle-box{
  width:100%;
  display:flex;
  padding:30rpx 10rpx
}
.circle-box .circle-item{
  flex-shrink:0
}
.circle-item .circle-item-top{
  margin:0 20rpx;
  width:116rpx;
  height:116rpx;
  border-radius:50%;
  background:#f8f8f8;
  border:2rpx solid #f5f5f5;
  position:relative
}
.circle-item-top image{
  width:100%;
  height:100%;
  border-radius:50%
}
.circle-item-top .icon{
  margin:34rpx;
  width:48rpx;
  height:48rpx
}
.circle-item-top .circle-item-tag{
  position:absolute;
  right:0;
  bottom:0;
  width:24rpx;
  height:24rpx;
  border-radius:50%;
  border:6rpx solid #fff
}
.circle-item .circle-name{
  margin:20rpx 0 10rpx;
  width:160rpx;
  color:#000;
  font-weight:500;
  font-size:24rpx;
  line-height:24rpx;
  text-align:center
}
.circle-item .circle-tips{
  width:160rpx;
  color:#999;
  font-size:18rpx;
  line-height:18rpx;
  font-weight:300;
  text-align:center
}
.circle-item .circle-all{
  background:#f8f8f8
}
.content-box .home-title{
  width:calc(100% - 60rpx);
  padding:0 30rpx
}
.home-title .home-title-txt{
  font-weight:700;
  font-size:32rpx
}
.home-title .home-title-all{
  margin-left:12rpx;
  padding:0 12rpx;
  height:40rpx;
  line-height:40rpx;
  font-size:16rpx;
  font-weight:700;
  color:#999;
  background:#f8f8f8;
  border-radius:8rpx
}
.home-activity-item .home-activity-img,
.home-activity-item .home-activity-data{
  width:275rpx;
  height:220rpx;
  border-radius:8rpx;
  position:relative;
  overflow:hidden
}
.home-activity-item .home-activity-data{
  padding:0 30rpx 0 20rpx;
  position:relative
}
.home-activity-img .home-activity-state{
  position:absolute;
  top:16rpx;
  left:16rpx;
  width:68rpx;
  height:38rpx;
  color:#fff;
  font-size:16rpx;
  font-weight:700;
  background:rgba(0,0,0,.4);
  border:1px solid rgba(255,255,255,.16);
  border-radius:8rpx;
  justify-content:center
}
.home-activity-data .home-activity-title{
  font-size:28rpx;
  line-height:28rpx;
  font-weight:700;
  padding-bottom:12rpx
}
.home-activity-data .home-activity-tag view{
  width:calc(100% - 26rpx);
  color:#999;
  font-size:20rpx;
  font-weight:500
}
.home-activity-data .home-cu-img-group{
  margin:8rpx 0 16rpx 16rpx;
  direction:ltr;
  unicode-bidi:bidi-override;
  display:inline-block
}
.home-cu-img-group .home-cu-img{
  width:32rpx;
  height:32rpx;
  display:inline-flex;
  position:relative;
  margin-left:-16rpx;
  border:2rpx solid #fff;
  background:#eee;
  vertical-align:middle;
  border-radius:50%
}
.home-cu-img-group .home-cu-tit{
  display:inline-flex;
  margin-left:8rpx;
  color:#999;
  font-size:20rpx;
  font-weight:500
}
.home-activity-data .home-activity-btn{
  position:absolute;
  bottom:0;
  width:calc(100% - 50rpx);
  height:60rpx;
  font-size:20rpx;
  font-weight:700;
  color:#000;
  background:#f8f8f8;
  border-radius:8rpx;
  justify-content:center
}
.content-box .dynamic-box{
  width:calc(100% - 16rpx);
  padding:8rpx 8rpx 180rpx
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
.empty-box {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.125rem 0;
}
.empty-box image {
  width: 320rpx;
  height: 320rpx;
  opacity: 0.8;
}
.empty-box .e1 {
  margin-top: 50rpx;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}
.empty-box .e2 {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #666;
  line-height: 1.4;
}
.heio {
  justify-content: center;
}

/* 添加新的导航样式 */
.nav-scroll-box {
  flex: 1;
  overflow: hidden;
}

.nav-scroll {
  white-space: nowrap;
  width: 100%;
}

.nav-scroll-content {
  display: flex;
  padding: 0 20rpx;
}

.nav-item {
  position: relative;
  padding: 0 15rpx;
  font-size: 32rpx;
  display: inline-block;
  margin-right: 30rpx;
  /* 添加过渡效果 */
  transition: all 0.3s ease;
  text-align: center;
}

.nav-item.active {
  font-weight: 700;
  color: #000;
  transform: scale(1.05);
}

.nav-item:not(.active) {
  color: #999;
}

.active-line {
  position: absolute;
  bottom: -5rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 30rpx;
  height: 6rpx;
  background-color: #000;
  border-radius: 3rpx;
  /* 添加过渡效果 */
  transition: all 0.3s ease;
}

.content-swiper {
  width: 100%;
  will-change: transform;
  background: #fafafa;
  /* 启用硬件加速 */
  transform: translateZ(0);
}

.content-scroll {
  height: 100%;
  -webkit-overflow-scrolling: touch;
  background: #ffffff;
  /* 优化滚动性能 */
  contain: layout style paint;
  transform: translateZ(0);
}

/* 添加性能优化相关类 */
.hardware-accelerated {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}

/* 优化动画效果 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(30rpx) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-50rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.card-gg-item {
  animation: fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
  /* 优化渲染性能 */
  contain: layout style paint;
  transform: translateZ(0);
}



.circle-item {
  animation: fade-in 0.5s ease-out;
}

.login-btn:hover {
  animation: pulse 1s infinite;
}

/* 图片懒加载占位样式 */
.lazy-image-placeholder {
  background: #f0f0f0;
}

/* 虚拟列表相关样式 */
.virtual-list-container {
  position: relative;
  width: 100%;
}

.virtual-list-item {
  position: absolute;
  width: 100%;
  will-change: transform;
}

/* 提高渲染层级，减少重绘 */
.content-box {
  position: relative;
  z-index: 1;
  will-change: transform;
}

/* 优化图像渲染 */
image {
  will-change: transform;
}

/* 添加页面切换动画 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.3s;
}
.page-transition-enter,
.page-transition-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .nav-item {
    font-size: 30rpx;
    padding: 0 12rpx;
    margin-right: 25rpx;
  }

  .empty-box {
    padding: 120rpx 30rpx 100rpx;
    margin: 30rpx 15rpx;
  }

  .empty-box image {
    width: 280rpx;
    height: 280rpx;
  }

  .login-btn {
    width: 260rpx;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 30rpx;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .nav-box {
    background: #1a1a1a;
  }

  .nav-item.active {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  .nav-item:not(.active) {
    color: #ccc;
  }

  .content-swiper,
  .content-scroll {
    background: #121212;
  }

  .empty-box {
    background: #1e1e1e;
  }

  .empty-box .e1 {
    color: #fff;
  }

  .empty-box .e2 {
    color: #aaa;
  }
}

/* 调试信息样式 */
.debug-info {
  position: fixed;
  top: 100rpx;
  right: 10rpx;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 8rpx 16rpx;
  font-size: 22rpx;
  border-radius: 12rpx;
  z-index: 999;
  backdrop-filter: blur(10rpx);
}

.swiper-box {
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
}

.swiper-item {
  flex: 1;
  flex-direction: row;
  position: relative;
  overflow: visible;
}

.scroll-v {
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* 修复页面高度和滚动问题 */
.content-box {
  width: 100%;
  height: 100%;
  overflow: visible;
  position: relative;
}

/* 优化登录按钮样式 */
.login-btn {
  margin-top: 50rpx;
  width: 280rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #000 0%, #333 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
  border-radius: 44rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 20rpx;
  padding: 0;
  border: none;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.login-btn:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.3);
}

.login-btn:active::before {
  left: 100%;
}

.login-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}

.login-tips {
  font-size: 26rpx;
  color: #888;
  margin-top: 16rpx;
  opacity: 0.8;
}

/* 圈子相关样式 */
.scroll-box{
  width:100%;
  white-space:nowrap;
  overflow:hidden;
  transition:height .45s ease-in-out
}

.circle-box{
  width:100%;
  display:flex;
  padding:30rpx 10rpx
}

.circle-box .circle-item{
  flex-shrink:0
}

.circle-item .circle-item-top{
  margin:0 20rpx;
  width:120rpx;
  height:120rpx;
  border-radius:50%;
  background: linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%);
  border:3rpx solid #fff;
  position:relative;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.circle-item .circle-item-top:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.15);
}

.circle-item-top image{
  width:100%;
  height:100%;
  border-radius:50%;
  object-fit: cover;
}

.circle-item-top .icon{
  margin:36rpx;
  width:48rpx;
  height:48rpx;
  opacity: 0.7;
}

.circle-item-top .circle-item-tag{
  position:absolute;
  right:-2rpx;
  bottom:-2rpx;
  width:28rpx;
  height:28rpx;
  border-radius:50%;
  border:4rpx solid #fff;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.15);
}

.circle-item .circle-name{
  margin:24rpx 0 12rpx;
  width:160rpx;
  color:#333;
  font-weight:600;
  font-size:26rpx;
  line-height:28rpx;
  text-align:center;
}

.circle-item .circle-tips{
  width:160rpx;
  color:#888;
  font-size:20rpx;
  line-height:22rpx;
  font-weight:400;
  text-align:center;
  opacity: 0.8;
}
</style>
