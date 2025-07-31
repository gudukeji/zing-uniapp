<template>
  <view class="container">
    <view class="nav-box" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="nav-bar df" :style="{'height': titleBarHeight + 'px'}">
        <view class="nav-icon df" data-url="search/index?bar=1" @tap="navigateToFun">
          <image src="/static/img/s.png"></image>
        </view>
        <view v-if="classifyList.length > 1" class="nav-icon df" data-url="goods/classify" @tap="navigateToFun">
          <image src="/static/img/fl.png"></image>
        </view>
        <view class="nav-icon df" data-url="order/index" @tap="navigateToFun">
          <image src="/static/img/dd1.png"></image>
          <view v-if="isOrder" class="microlabel" style="top:12rpx;right:8rpx"></view>
        </view>
        <view v-if="appCard || isCard" :class="['nav-icon', 'df', isCard ? 'animate' : '']" data-url="center/card" @tap="navigateToFun">
          <image src="/static/img/kq1.png"></image>
          <view v-if="isCard" class="microlabel" style="top:12rpx;right:8rpx"></view>
        </view>
        <view class="nav-icon df" data-url="goods/cart" @tap="navigateToFun">
          <image src="/static/img/gwc1.png"></image>
          <view v-if="cartCount > 0" class="msg">{{cartCount}}</view>
        </view>
      </view>
      <view class="nav-classify" :style="{'height': classifyList.length > 1 && classifyScroll ? '68rpx' : '0'}">
        <scroll-view scroll-x="true" class="classify-scroll">
          <view class="classify-box df">
            <view v-for="(item, index) in classifyList" :key="index" class="classify-item" 
                  :style="{'color': index == classifyIdx ? '#000' : '#999', 'font-weight': index == classifyIdx ? 'bold' : '400'}" 
                  :data-idx="index" 
                  @tap="classifyClick">
              {{item.name}}
            </view>
            <view style="flex-shrink:0;width:120rpx;height:68rpx"></view>
          </view>
        </scroll-view>
        <view class="classify-all df" data-url="goods/classify" @tap="navigateToFun">
          <image src="/static/img/fl.png"></image>
          <text>分类</text>
        </view>
      </view>
    </view>
    <view class="content-box" :style="{'padding-top': classifyList.length > 1 ? 'calc(' + (statusBarHeight + titleBarHeight) + 'px + 68rpx)' : 'calc(' + (statusBarHeight + titleBarHeight) + 'px)'}">
      <view class="heio df" :style="{'height': isThrottling || loadStatus == 'loading' ? '0px' : '60rpx'}">
        <uni-load-more v-if="true" status="loading"></uni-load-more>
      </view>
      <view class="goods-box">
        <view v-if="bannerList.length > 0 && 0 == classifyIdx" class="goods-banner">
          <view class="banner-swiper">
            <swiper class="banner-swiper" circular autoplay @change="swiperChange">
              <swiper-item v-for="(item, index) in bannerList" :key="index" :data-url="item.type_url" @tap="bannerClick">
                <lazy-image :src="item.cover"></lazy-image>
              </swiper-item>
            </swiper>
            <view class="swiper-idor df">
              <view v-for="(item, index) in bannerList.length" :key="index" :class="['idor-item', swiperIdx == index ? 'active' : '']"></view>
            </view>
          </view>
        </view>
        <block v-if="!isEmpty">
          <view v-for="(item, index) in list" :key="index" class="goods-item" :data-url="'goods/details?id=' + item.id" @tap="navigateToFun">
            <view class="goods-img">
              <view class="goods-img-item">
                <lazy-image :src="item.imgs[0]"></lazy-image>
              </view>
            </view>
            <view class="goods-name ohto2">{{item.name}}</view>
            <view class="goods-price">
              <money :type="1" :price="item.product.price"></money>
              <view class="price-h" style="text-decoration:line-through">¥{{item.product.line_price}}</view>
              <view class="price-h">{{item.buy ? item.buy + '人已买' : item.cart + item.browse + '人想买'}}</view>
            </view>
            <view class="goods-tag df">
              <view v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag-item">{{tag}}</view>
            </view>
          </view>
        </block>
      </view>
      <view v-if="isEmpty" class="empty-box df">
        <image src="/static/img//null.png"/>
        <view class="e1">暂无推荐商品</view>
        <view class="e2">正在为您制造更多美好的商品</view>
      </view>
      <uni-load-more v-if="true" :status="loadStatus"></uni-load-more>
    </view>
    <tabbar v-if="true" :currentPage="1" :currentMsg="currentMsg"></tabbar>
  </view>
</template>

<script>
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more'
import lazyImage from '@/components/lazyImage/lazyImage'
import money from '@/components/money/money'
import tabbar from '@/components/tabbar/tabbar'
import { getUserSocialInfo } from '@/api/social.js'

// Mock数据 - 用于开发测试
const mockData = {
  // 商品分类数据
  classifyList: [
    { id: 0, name: '推荐' },
    { id: 1, name: '服饰' },
    { id: 2, name: '美妆' },
    { id: 3, name: '数码' },
    { id: 4, name: '家居' },
    { id: 5, name: '食品' },
    { id: 6, name: '母婴' },
    { id: 7, name: '运动' }
  ],
  
  // 轮播图数据
  bannerList: [
    {
      id: 1,
      cover: '/static/img/avatar.png',
      type: 1, // 普通链接
      type_url: 'goods/details?id=1'
    },
    {
      id: 2,
      cover: '/static/img/avatar.png',
      type: 2, // 商品
      type_url: 'goods/details?id=2'
    },
  ],
  

  // 状态信息
  statusInfo: {
    is_order: true,
    is_card: true,
    cart_count: 5
  },
  
  // 商品列表 - 按分类
  goodsList: {
    // 推荐商品
    0: [
      {
        id: 1,
        name: '2023新款连衣裙夏季气质淑女雪纺长裙显瘦温柔风长款仙女裙',
        imgs: ['/static/img/avatar.png', '/static/img/avatar.png'],
        product: {
          price: 199.00,
          line_price: 298.00
        },
        buy: 328,
        cart: 56,
        browse: 1245,
        tags: ['夏季热卖', '气质淑女']
      },
      {
        id: 2,
        name: '轻奢品牌真皮小方包2023新款潮女包单肩斜挎包时尚百搭链条包',
        imgs: ['/static/img/avatar.png', '/static/img/avatar.png'],
        product: {
          price: 398.00,
          line_price: 658.00
        },
        buy: 156,
        cart: 43,
        browse: 876,
        tags: ['轻奢', '真皮']
      },
      {
        id: 3,
        name: '超薄智能手表男士多功能运动防水电子表学生特种兵机械男表',
        imgs: ['/static/img/avatar.png', '/static/img/avatar.png'],
        product: {
          price: 299.00,
          line_price: 399.00
        },
        buy: 268,
        cart: 35,
        browse: 1024,
        tags: ['智能手表', '防水']
      },
      {
        id: 4,
        name: '原创设计师品牌女装小香风外套春秋季新款高端复古港风小个子西装',
        imgs: ['/static/img/avatar.png', '/static/img/avatar.png'],
        product: {
          price: 458.00,
          line_price: 698.00
        },
        buy: 126,
        cart: 28,
        browse: 756,
        tags: ['设计师品牌', '小香风']
      }
    ],
    
    // 服饰类商品
    1: [
      {
        id: 11,
        name: '法式复古裙山本风连衣裙女春秋宽松长袖气质长裙温柔风碎花裙子',
        imgs: ['/static/img/avatar.png', '/static/img/avatar.png'],
        product: {
          price: 189.00,
          line_price: 289.00
        },
        buy: 213,
        cart: 45,
        browse: 980,
        tags: ['法式复古', '碎花裙']
      },
      {
        id: 12,
        name: '小众设计感西装外套女2023春装新款韩版宽松休闲西服上衣',
        imgs: ['/static/img/avatar.png', '/static/img/avatar.png'],
        product: {
          price: 258.00,
          line_price: 428.00
        },
        buy: 109,
        cart: 32,
        browse: 765,
        tags: ['小众设计', '西装外套']
      }
    ],
    
    // 美妆类商品
    2: [
      {
        id: 21,
        name: '日本进口资生堂红腰子精华保湿补水抗皱紧致淡斑修护精华液',
        imgs: ['/static/img/avatar.png', '/static/img/avatar.png'],
        product: {
          price: 699.00,
          line_price: 998.00
        },
        buy: 567,
        cart: 89,
        browse: 2310,
        tags: ['日本进口', '抗皱']
      }
    ]
  }
}

export default {
  components: {
    uniLoadMore,
    lazyImage,
    money,
    tabbar
  },
  data() {
    return {
      statusBarHeight: 20,
      titleBarHeight: 44,
      appCard: false,
      scrollTop: 0,
      currentMsg: 0,
      isOrder: false,
      isCard: false,
      cartCount: 0,
      classifyList: [],
      classifyIdx: 0,
      classifyScroll: true,
      bannerList: [],
      swiperIdx: 0,
      isThrottling: false,
      list: [],
      page: 1,
      isEmpty: false,
      loadStatus: 'more',
      useMockData: process.env.NODE_ENV === 'development' // 开发环境下使用mock数据
    }
  },
  async onLoad() {
    // 开启分享功能 - 添加平台兼容性检查
    try {
      // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
      if (typeof uni.showShareMenu === 'function') {
        uni.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline']
        })
      }
      // #endif
    } catch (e) {
      console.warn('showShareMenu not supported on this platform:', e)
    }

    this.$store.commit('SET_CURRENT_MSG', false)

    // 等待应用初始化完成
    if (this.$onLaunched) {
      await this.$onLaunched
    }

    this.$store.commit('SET_CURRENT_MSG', true)
    
    // 初始化数据
    this.getUserSocialData()
    
    if (this.$store.state.isClassify) {
      this.getClassify()
    }
    
    
    this.getBanner()
    this.goodsList()
  },
  onShow() {
    // 自定义tabbar，不需要隐藏原生tabBar
    // uni.hideTabBar(); // 注释掉，因为使用自定义tabbar
    if (this.$store.state.isCurrentMsg) {
      this.userAvatar = uni.getStorageSync('userInfo')?.avatar || '/static/img/tabbar/4-hl.png'
      this.getUserSocialData()
      this.getBanner()
    }
  },
  onPullDownRefresh() {
    this.refreshPath()
  },
  onPageScroll(e) {
    let that = this
    let scrollTop = parseInt(e.scrollTop)
    
    if (that.scrollTop > scrollTop) {
      that.classifyScroll = true
    } else if (that.scrollTop <= scrollTop && scrollTop > 0) {
      that.classifyScroll = false
    }
    
    setTimeout(function() {
      that.scrollTop = scrollTop
    }, 300)
  },
  onReachBottom() {
    if (this.list && this.list.length) {
      this.loadStatus = 'loading'
      this.page = this.page + 1
      this.goodsList()
    }
  },
  onShareAppMessage() {
    return {
      title: this.$store.state.appXx?.[1] || '小程序示例',
      imageUrl: this.$store.state.appXx?.[2] || '/static/img/avatar.png'
    }
  },
  onShareTimeline() {
    return {
      title: this.$store.state.appXx?.[1] || '小程序示例',
      imageUrl: this.$store.state.appXx?.[2] || '/static/img/avatar.png'
    }
  },
  methods: {
    // 刷新页面数据
    refreshPath() {
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300
      })
      
      this.isThrottling = false
      
      if (this.$store.state.isClassify) {
        this.getClassify()
      }
      
      this.getBanner()
      this.page = 1
      this.goodsList()
      
      uni.stopPullDownRefresh()
    },
    
    // 获取轮播图和状态信息
    getBanner() {
      let that = this
      
      // 使用Mock数据
      if (this.useMockData) {
        setTimeout(() => {
          that.bannerList = mockData.bannerList
          that.isOrder = mockData.statusInfo.is_order
          that.isCard = mockData.statusInfo.is_card
          that.cartCount = mockData.statusInfo.cart_count
        }, 300)
        return
      }
      
      this.$util.request(this.$api.bannerUrl).then(function(res) {
        if (res && res.code == 200) {
          that.bannerList = res.data.banner || []
          that.isOrder = res.data.is_order || false
          that.isCard = res.data.is_card || false
          that.cartCount = res.data.cart_count || 0
        }
      }).catch(function(err) {
        console.log('获取轮播图失败', err)
        // 请求失败时使用Mock数据
        that.bannerList = mockData.bannerList
        that.isOrder = mockData.statusInfo.is_order
        that.isCard = mockData.statusInfo.is_card
        that.cartCount = mockData.statusInfo.cart_count
      })
    },
    
    // 获取商品分类
    getClassify() {
      let that = this
      
      // 使用Mock数据
      if (this.useMockData) {
        setTimeout(() => {
          that.classifyList = mockData.classifyList
        }, 300)
        return
      }
      
      this.$util.request(this.$api.classifyHomeUrl).then(function(res) {
        if (res && res.code == 200) {
          that.classifyList = res.data || []
        }
      }).catch(function(err) {
        console.log('获取商品分类失败', err)
        // 请求失败时使用Mock数据
        that.classifyList = mockData.classifyList
      })
    },
    
    // 获取商品列表
    goodsList() {
      let that = this
      that.isEmpty = false
      
      // 使用Mock数据
      if (this.useMockData) {
        setTimeout(() => {
          // 获取当前分类的商品列表
          const categoryId = that.classifyIdx
          
          // 获取对应分类的商品，如果没有则使用推荐商品
          let mockResult = mockData.goodsList[categoryId] || mockData.goodsList[0]
          
          // 模拟分页加载 - 第二页加载部分数据，第三页无数据
          if (that.page > 1) {
            // 截取前1-2个商品作为第二页
            if (that.page === 2 && mockResult.length > 2) {
              mockResult = mockResult.slice(0, 2)
            } else {
              mockResult = [] // 第三页及以后无数据
            }
          }
          
          // 更新列表数据
          if (mockResult.length > 0) {
            if (that.page === 1) {
              that.list = mockResult
            } else {
              that.list = that.list.concat(mockResult)
            }
            that.isEmpty = false
          } else if (that.page === 1) {
            that.isEmpty = true
            that.list = []
          } else {
            that.loadStatus = 'no-more'
          }
          
          that.isThrottling = true
        }, 500)
        return
      }
      
      // 获取当前分类ID
      let classifyId = that.classifyList.length ? that.classifyList[that.classifyIdx].id : 0
      
      // 请求参数
      let params = {
        page: that.page || 1,
        classify_id: classifyId
      }
      
      this.$util.request(this.$api.goodsListUrl, params).then(function(res) {
        that.isThrottling = true
        that.loadStatus = 'more'
        
        if (res && res.data && res.data.data && res.data.data.length > 0) {
          if (that.page == 1) {
            that.list = res.data.data
          } else {
            that.list = that.list.concat(res.data.data)
          }
          that.page = res.data.current_page || that.page
        } else if (that.page == 1) {
          that.isEmpty = true
          that.list = []
        } else {
          that.loadStatus = 'no-more'
        }
      }).catch(function(err) {
        console.log('获取商品列表失败', err)
        that.isThrottling = true
        
        // 获取当前分类的商品，失败时使用mock数据
        const categoryId = that.classifyIdx
        const mockResult = mockData.goodsList[categoryId] || mockData.goodsList[0]
        
        if (that.page === 1) {
          that.list = mockResult
          that.isEmpty = mockResult.length === 0
        } else {
          that.loadStatus = 'no-more'
        }
      })
    },
    
    // 分类切换
    classifyClick(e) {
      if (!e || !e.currentTarget || !e.currentTarget.dataset) return
      
      this.isThrottling = false
      this.classifyIdx = parseInt(e.currentTarget.dataset.idx) || 0
      this.page = 1
      this.goodsList()
      
      if (this.classifyIdx == 0) {
        this.getBanner()
        if (this.$store.state.isClassify) {
          this.getClassify()
        }
      }
    },
    
    
    // 轮播图点击
    bannerClick(e) {
      if (!e || !e.currentTarget || !e.currentTarget.dataset) return
      
      let url = e.currentTarget.dataset.url
      if (url) {
        uni.navigateTo({
          url: url
        })
      }
    },
    
    // 轮播图切换
    swiperChange(e) {
      this.swiperIdx = e.detail.current || 0
    },
    
    // 页面跳转
    navigateToFun(e) {
      if (!e || !e.currentTarget || !e.currentTarget.dataset || !e.currentTarget.dataset.url) return
      
      uni.navigateTo({
        url: '/pages/' + e.currentTarget.dataset.url
      })
    },
    
    // 获取通知消息数量
    getUserSocialData() {
      let that = this
      
      // 使用Mock数据
      if (this.useMockData) {
        setTimeout(() => {
          that.currentMsg = 3 // 模拟有3条未读消息
        }, 300)
        return
      }
      
      // 使用getUserSocialInfo获取service_num
      getUserSocialInfo().then(function(res) {
        if (res && (res.code == 200 || res.status == 200) && res.data) {
          // 从返回的数据中获取service_num
          if (res.data.service_num !== undefined) {
            that.currentMsg = res.data.service_num;
          }
        }
      }).catch(function(err) {
        console.error('获取消息数量失败', err)
        that.currentMsg = 0
      })
    }
  }
}
</script>

<style>
page{
  background:#f8f8f8
}
.nav-box{
  position:fixed;
  top:0;
  width:100%;
  z-index:99;
  box-sizing:border-box;
  background:#fff
}
.nav-box .nav-bar{
  width:calc(100% - 30rpx);
  padding:0 15rpx
}
.nav-bar .nav-icon{
  padding:0 15rpx;
  height:100%;
  position:relative
}
.nav-icon .msg{
  position:absolute;
  top:0;
  right:0;
  left:calc(50% + 8rpx);
  min-width:30rpx;
  height:30rpx;
  line-height:30rpx;
  text-align:center;
  font-size:18rpx;
  font-weight:700;
  color:#fff;
  background:#000;
  border-radius:30rpx;
  border:4rpx solid #fff
}
.nav-icon image{
  width:46rpx;
  height:46rpx
}
.nav-box .nav-classify{
  width:100%;
  overflow:hidden;
  position:relative;
  transition:height .3s ease-in-out
}
.nav-box .classify-scroll{
  width:100%;
  white-space:nowrap
}
.classify-scroll .classify-box{
  width:100%;
  height:68rpx
}
.classify-box .classify-item{
  flex-shrink:0;
  padding:0 30rpx;
  height:68rpx;
  line-height:68rpx;
  font-size:24rpx;
  transition:all .3s ease-in-out
}
.nav-classify .classify-all{
  position:absolute;
  top:0;
  bottom:0;
  right:0;
  height:68rpx;
  padding:0 30rpx;
  font-size:20rpx;
  font-weight:700;
  background:linear-gradient(to right,rgba(255,255,255,0),#fff 20%);
  justify-content:center
}
.classify-all image{
  margin-right:8rpx;
  width:26rpx;
  height:26rpx
}
.content-box{
  width:100%;
  padding-bottom:180rpx
}
.goods-box{
  width:100%;
  display:flex;
  flex-wrap:wrap
}
.goods-box .goods-banner,
.goods-box .goods-item{
  width:calc(50% - 15rpx);
  margin:10rpx 0 0 10rpx;
  background:#fff;
  border-radius:8rpx;
  overflow:hidden
}
.goods-box .goods-banner{
  padding-top:calc(66.67% - 13.33rpx);
  position:relative
}
.goods-banner .banner-swiper{
  position:absolute;
  top:0;
  right:0;
  bottom:0;
  left:0;
  width:100%;
  height:100%
}
.goods-banner .swiper-idor{
  position:absolute;
  width:100%;
  bottom:20rpx;
  justify-content:center
}
.swiper-idor .idor-item{
  margin:0 6rpx;
  width:8rpx;
  height:8rpx;
  border-radius:8rpx;
  background:rgba(255,255,255,.3);
  transition:all .3s
}
.swiper-idor .active{
  width:24rpx;
  background:rgba(255,255,255,.9)
}

.goods-item .goods-img{
  width:100%;
  padding-top:100%;
  position:relative
}
.goods-img .goods-img-item{
  position:absolute;
  top:0;
  right:0;
  bottom:0;
  left:0;
  width:100%;
  height:100%
}
.goods-item .goods-name{
  width:calc(100% - 40rpx);
  margin:15rpx 20rpx;
  font-size:26rpx;
  line-height:36rpx;
  font-weight:500
}
.goods-item .goods-price{
  width:calc(100% - 30rpx);
  margin:0 20rpx 20rpx;
  display:flex;
  align-items:flex-end
}
.goods-price .price-h{
  margin-left:15rpx;
  color:#999;
  font-size:20rpx;
  line-height:20rpx
}
.goods-item .goods-tag{
  width:calc(100% - 30rpx);
  margin:0 15rpx 15rpx;
  display:flex;
  flex-wrap:wrap
}
.goods-tag .tag-item{
  margin:0 5rpx 5rpx;
  height:40rpx;
  padding:0 12rpx;
  line-height:40rpx;
  font-size:18rpx;
  font-weight:500;
  background:#f8f8f8;
  border-radius:8rpx
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
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.empty-box {
  flex-direction: column;
  padding: 120rpx 0;
}
.empty-box image {
  width: 280rpx;
  height: 280rpx;
}
.empty-box .e1 {
  margin-top: 40rpx;
  font-size: 32rpx;
  font-weight: bold;
}
.empty-box .e2 {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #999;
}
.heio {
  justify-content: center;
}
.microlabel {
  position: absolute;
  width: 18rpx;
  height: 18rpx;
  background: #fa5150;
  border-radius: 50%;
  border: 4rpx solid #fff;
}
</style>
