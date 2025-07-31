<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-bar" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="back-box df" :style="{'height': titleBarHeight + 'px', 'width': '100%'}">
        <view class="back-item df" @tap="navBack">
          <image src="/static/img/back.png" style="width:34rpx;height:34rpx"></image>
        </view>
      </view>
      
      <!-- 搜索框 -->
      <view class="nav-search df">
        <input @confirm="searchClick" 
               focus="true" 
               confirm-type="search" 
               placeholder="输入关键词搜索" 
               placeholder-class="ph" 
               v-model="kw"/>
        <view class="btn" @tap="searchClick">搜索</view>
      </view>
      
      <!-- 标签栏 -->
      <view class="bar-box df">
        <view v-for="(item, index) in barList" 
              :key="index" 
              class="bar-item df" 
              @tap="barClick" 
              :data-idx="index">
          <text :style="{'color': index == barIdx ? '#000' : '#999', 'font-size': index == barIdx ? '28rpx' : '26rpx'}">
            {{item}}
          </text>
          <view :style="{'opacity': index == barIdx ? 1 : 0}" class="bar-line"></view>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view :class="['content-box', barIdx == 1 && 'goods']" :style="{'margin-top': 'calc(' + (statusBarHeight + titleBarHeight) + 'px + 200rpx)'}">
      <!-- 空状态 -->
      <emptyPage
        v-if="isEmpty"
        title="没有找到相应内容"
        description="换个词或切换搜索类型试试"
        image="/static/img/empty.png"
      />
      
      <!-- 有内容状态 -->
      <block v-else>
        <!-- 笔记 -->
        <view v-if="barIdx == 0" :class="[isWaterfall && 'dynamic-box']">
          <waterfall v-if="isWaterfall" :note="list" :page="page"></waterfall>
          <block v-else>
            <card-gg v-for="(item, index) in list" 
                     :key="index" 
                     :item="item" 
                     :idx="index" 
                     @likeback="likeClick"
                     @update="onCardUpdate">
            </card-gg>
          </block>
        </view>
        
        <!-- 其他类型搜索结果 -->
        <block v-else>
          <view v-for="(item, index) in list" 
                :key="index" 
                :class="[barIdx == 1 && 'goods-item']" 
                :data-id="item.id" 
                @tap="toNavigate">
            
            <!-- 商品项 -->
            <block v-if="barIdx == 1">
              <view class="goods-img">
                <view class="goods-img-item">
                  <lazy-image :src="item.imgs[0]"></lazy-image>
                </view>
              </view>
              <view class="goods-name ohto2">{{item.name}}</view>
              <view class="goods-price">
                <money :type="1" :price="item.product.price"></money>
                <view class="price-h" style="text-decoration:line-through">¥{{item.product.line_price}}</view>
                <view class="price-h">{{item.buy ? item.buy + "人已买" : item.cart + item.browse + "人想买"}}</view>
              </view>
              <view class="goods-tag df">
                <view v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag-item">{{tag}}</view>
              </view>
            </block>
            
            <!-- 圈子项 -->
            <view v-if="barIdx == 2" class="circle-box df">
              <view class="circle-avatar">
                <lazy-image :src="item.avatar" :br="'168rpx'"></lazy-image>
                <view v-if="item.is_hot" class="tag" style="background:#FA5150"></view>
                <view v-else-if="item.is_new" class="tag" style="background:#4CD964"></view>
              </view>
              <view class="circle-item">
                <view class="name ohto2">{{item.name}}</view>
                <view class="intro ohto2">{{item.intro}}</view>
                <view v-if="item.user_count > 0" class="cu-img-group">
                  <view v-for="(img, imgIndex) in item.user" :key="imgIndex" class="cu-img">
                    <image :src="img" mode="aspectFill"></image>
                  </view>
                  <view class="cu-txt">{{item.user_count}}人加入 · {{item.dynamic_count}}篇笔记 </view>
                </view>
              </view>
            </view>
            
            <!-- 用户项 -->
            <view v-if="barIdx == 3" class="user-box df">
              <view class="user-avatar">
                <lazy-image :src="item.avatar"></lazy-image>
              </view>
              <view class="user-item">
                <view class="name ohto">{{item.name}}</view>
                <view class="unm">笔记 · {{item.dynamic}}｜粉丝 · {{item.fans}}</view>
                <view class="user-tag df" style="width:100%">
                  <view v-if="item.gender != 2" class="tag-item df">
                    <image :src="item.gender == 0 ? '/static/img/nv.png' : '/static/img/nan.png'"></image>
                    <text v-if="item.age && item.age != '暂不展示'" style="margin-left:8rpx">{{item.age}}</text>
                  </view>
                  <view class="tag-item df">IP属地：{{item.province}}</view>
                </view>
              </view>
            </view>
            
            <!-- 活动项 -->
            <view v-if="barIdx >= 4 || barList[barIdx] == '活动'" class="activity-item df">
              <view class="activity-img">
                <lazy-image :src="item.img"></lazy-image>
                <view class="activity-state df">{{item.status_str || "加载中"}}</view>
              </view>
              <view class="activity-data">
                <view class="title ohto" :data-id="item.id">{{item.name || "活动名称加载中"}}</view>
                <view class="txt df" :data-id="item.id">
                  <image src="/static/img/time.png"></image>
                  <view class="ohto">{{item.activity_time || "活动时间加载中"}}</view>
                </view>
                <view class="txt df" :data-id="item.id">
                  <image src="/static/img/location.png"></image>
                  <view class="ohto">{{item.adds_name || "活动地址加载中"}}</view>
                </view>
                <view v-if="item.user_count" class="cu-img-group">
                  <view v-for="(img, imgIndex) in item.avatar_list" :key="imgIndex" class="cu-img">
                    <image :src="img" mode="aspectFill"></image>
                  </view>
                  <view class="cu-tit">{{item.user_count}}人已参加</view>
                </view>
                <view v-else class="cu-txt-group">{{item.browse}}人想参加</view>
                <view class="activity-btn df">
                  <button class="btn-item df w100">
                    <text>{{item.is_join ? "查看详情" : "立即参加"}}</text>
                    <image class="effect icon" src="/static/img/arrow-r.png"></image>
                  </button>
                </view>
              </view>
            </view>
          </view>
        </block>
      </block>
      
      <!-- 加载更多 -->
      <view class="df" style="width:100%;justify-content:center">
        <uni-load-more :status="loadStatus"></uni-load-more>
      </view>
    </view>
    
    <!-- 提示弹窗 -->
    <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
      <view class="tips-box df">
        <view class="tips-item">{{tipsTitle}}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import request from '@/utils/request.js'
import * as api from '@/config/api.js'
import lazyImage from '@/components/lazyImage/lazyImage'
import cardGg from '@/components/card-gg/card-gg.vue'
import money from '@/components/money/money.vue'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'
import waterfall from '@/components/waterfall/waterfall.vue'
import emptyPage from '@/components/emptyPage/emptyPage.vue'

const app = getApp();

export default {
  components: {
    lazyImage,
    cardGg,
    money,
    uniLoadMore,
    waterfall,
    emptyPage
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      kw: "",
      barList: ["笔记", "商品", "圈子", "用户"],
      barIdx: 0,
      isThrottling: true,
      list: [],
      page: 1,
      isEmpty: false,
      loadStatus: "more",
      tipsTitle: "",
      isWaterfall: false,
      
      // 模拟数据 - 笔记
      mockNotes: [
        {
          id: 1001,
          type: 1,
          user_id: 2001,
          avatar: "/static/img/avatar.png",
          nickname: "旅行达人",
          is_follow: false,
          is_like: false,
          content: "今天去了一个超美的地方，分享给大家！这里的风景真的太美了，空气清新，环境宜人。",
          imgs: [
            { url: "/static/img/note1.jpg", wide: 800, high: 1200 },
            { url: "/static/img/note2.jpg", wide: 800, high: 1200 }
          ],
          adds_name: "北京市朝阳区",
          comment_count: 28,
          like_count: 156,
          browse_count: 1024,
          create_time_str: "2小时前"
        },
        {
          id: 1002,
          type: 2,
          user_id: 2002,
          avatar: "/static/img/avatar.png",
          nickname: "美食家",
          is_follow: true,
          is_like: true,
          content: "发现了一家超赞的餐厅，味道真的一级棒！强烈推荐给大家！",
          video: {
            url: "https://example.com/video.mp4",
            cover: "/static/img/video-cover.jpg",
            wide: 540,
            high: 960
          },
          adds_name: "上海市黄浦区",
          comment_count: 42,
          like_count: 267,
          browse_count: 2345,
          create_time_str: "昨天"
        },
        {
          id: 1003,
          type: 1,
          user_id: 2003,
          avatar: "/static/img/avatar.png",
          nickname: "时尚博主",
          is_follow: false,
          is_like: false,
          content: "分享一套今日穿搭，简约而不简单，希望大家喜欢~",
          imgs: [
            { url: "/static/img/note3.jpg", wide: 800, high: 1200 },
            { url: "/static/img/note4.jpg", wide: 800, high: 1200 },
            { url: "/static/img/note5.jpg", wide: 800, high: 1200 }
          ],
          adds_name: "广州市天河区",
          comment_count: 36,
          like_count: 198,
          browse_count: 1876,
          create_time_str: "3天前"
        }
      ],
      
      // 模拟数据 - 商品
      mockGoods: [
        {
          id: 2001,
          name: "2023夏季新款连衣裙",
          imgs: ["/static/img/product1.png"],
          product: {
            price: "199.00",
            line_price: "299.00"
          },
          buy: 128,
          cart: 45,
          browse: 1560,
          tags: ["新品", "热卖"]
        },
        {
          id: 2002,
          name: "轻薄透气运动鞋",
          imgs: ["/static/img/product2.png"],
          product: {
            price: "299.00",
            line_price: "399.00"
          },
          buy: 89,
          cart: 32,
          browse: 980,
          tags: ["限时特价"]
        },
        {
          id: 2003,
          name: "时尚斜挎小包",
          imgs: ["/static/img/product3.png"],
          product: {
            price: "159.00",
            line_price: "259.00"
          },
          buy: 56,
          cart: 28,
          browse: 756,
          tags: ["爆款"]
        }
      ],
      
      // 模拟数据 - 圈子
      mockCircles: [
        {
          id: 3001,
          avatar: "/static/img/circle1.png",
          name: "时尚穿搭圈",
          intro: "分享最新穿搭灵感，让你时刻保持时尚",
          is_hot: true,
          is_new: false,
          user_count: 12560,
          dynamic_count: 3567,
          user: [
            "/static/img/avatar.png",
            "/static/img/avatar.png",
            "/static/img/avatar.png"
          ]
        },
        {
          id: 3002,
          avatar: "/static/img/circle2.png",
          name: "美食爱好者",
          intro: "发现城市隐藏的美食宝藏，享受舌尖上的美味",
          is_hot: false,
          is_new: true,
          user_count: 8934,
          dynamic_count: 2456,
          user: [
            "/static/img/avatar.png",
            "/static/img/avatar.png",
            "/static/img/avatar.png"
          ]
        },
        {
          id: 3003,
          avatar: "/static/img/circle3.png",
          name: "旅行探索家",
          intro: "一起去探索世界的每个角落，记录旅途中的精彩",
          is_hot: true,
          is_new: false,
          user_count: 10238,
          dynamic_count: 2987,
          user: [
            "/static/img/avatar.png",
            "/static/img/avatar.png",
            "/static/img/avatar.png"
          ]
        }
      ],
      
      // 模拟数据 - 用户
      mockUsers: [
        {
          id: 4001,
          avatar: "/static/img/avatar.png",
          name: "时尚达人",
          dynamic: 156,
          fans: 3456,
          gender: 0, // 0-女 1-男 2-未知
          age: 28,
          province: "北京"
        },
        {
          id: 4002,
          avatar: "/static/img/avatar.png",
          name: "美食博主",
          dynamic: 234,
          fans: 5678,
          gender: 1,
          age: 32,
          province: "上海"
        },
        {
          id: 4003,
          avatar: "/static/img/avatar.png",
          name: "旅行摄影师",
          dynamic: 198,
          fans: 4567,
          gender: 1,
          age: 30,
          province: "广州"
        }
      ],
      
      // 模拟数据 - 活动
      mockActivities: [
        {
          id: 5001,
          img: "/static/img/activity1.png",
          status_str: "进行中",
          name: "夏日时尚穿搭分享会",
          activity_time: "2023-07-15 14:00-17:00",
          adds_name: "北京市朝阳区时尚广场B座",
          is_join: false,
          user_count: 156,
          avatar_list: [
            "/static/img/avatar.png",
            "/static/img/avatar.png",
            "/static/img/avatar.png"
          ],
          browse: 2345
        },
        {
          id: 5002,
          img: "/static/img/activity2.png",
          status_str: "即将开始",
          name: "美食品鉴会",
          activity_time: "2023-07-20 18:00-21:00",
          adds_name: "上海市黄浦区美食中心",
          is_join: true,
          user_count: 128,
          avatar_list: [
            "/static/img/avatar.png",
            "/static/img/avatar.png",
            "/static/img/avatar.png"
          ],
          browse: 1987
        },
        {
          id: 5003,
          img: "/static/img/activity3.png",
          status_str: "已结束",
          name: "城市摄影大赛",
          activity_time: "2023-07-01 09:00-17:00",
          adds_name: "广州市天河区摄影艺术中心",
          is_join: false,
          user_count: 0,
          browse: 3456
        }
      ]
    }
  },
  onLoad(options) {
    // 如果有tab参数则切换到对应标签
    if (options.bar) {
      this.barIdx = options.bar
    }
    
    // 检查是否启用活动标签
    if (app.globalData?.isActivity) {
      this.barList.push("活动")
    }
  },
  methods: {
    // 搜索点击
    searchClick() {
      if (!this.kw) {
        return this.opTipsPopup("请输入搜索关键词")
      }
      
      this.isThrottling = false
      this.list = []
      this.page = 1
      this.userSearch()
    },
    
    // 执行搜索
    userSearch() {
      let that = this
      that.loadStatus = "loading"
      that.isEmpty = false
      
      // 处理活动类型
      let searchType = that.barIdx
      if (that.barIdx > 3 && that.barList[that.barIdx] == "活动") {
        searchType = "activity"
      }
      
      // 设置瀑布流显示
      that.isWaterfall = app.globalData?.isWaterfall || false
      
      // 检查API是否可用
      if (api.api) {
        let searchUrl = that.isWaterfall ? api.api.waterfallSearchUrl : api.api.searchUrl
        
        if (searchUrl) {
          request(searchUrl, {
            kw: that.kw,
            page: that.page,
            type: searchType
          }).then(function(res) {
            that.isThrottling = true
            that.loadStatus = "more"
            
            if (res.data.data.length > 0) {
              if (that.page == 1) {
                that.list = res.data.data
              } else {
                that.list = that.list.concat(res.data.data)
              }
              that.page = res.data.current_page
            } else if (that.page == 1) {
              that.isEmpty = true
            }
          })
        } else {
          that.useMockData()
        }
      } else {
        that.useMockData()
      }
    },
    
    // 使用模拟数据
    useMockData() {
      let that = this
      
      setTimeout(() => {
        that.isThrottling = true
        that.loadStatus = "more"
        
        // 根据当前标签选择对应的模拟数据
        let mockData = []
        if (that.barIdx == 0) {
          mockData = that.mockNotes
        } else if (that.barIdx == 1) {
          mockData = that.mockGoods
        } else if (that.barIdx == 2) {
          mockData = that.mockCircles
        } else if (that.barIdx == 3) {
          mockData = that.mockUsers
        } else if (that.barIdx > 3 || that.barList[that.barIdx] == "活动") {
          mockData = that.mockActivities
        }
        
        // 如果有搜索关键词则过滤数据
        if (that.kw) {
          let keyword = that.kw.toLowerCase()
          mockData = mockData.filter(item => {
            // 根据不同类型使用不同的字段搜索
            if (that.barIdx == 0) {
              return item.content.toLowerCase().includes(keyword) || 
                     item.nickname.toLowerCase().includes(keyword)
            } else if (that.barIdx == 1) {
              return item.name.toLowerCase().includes(keyword) || 
                     (item.tags && item.tags.some(tag => tag.toLowerCase().includes(keyword)))
            } else if (that.barIdx == 2) {
              return item.name.toLowerCase().includes(keyword) || 
                     item.intro.toLowerCase().includes(keyword)
            } else if (that.barIdx == 3) {
              return item.name.toLowerCase().includes(keyword) || 
                     item.province.toLowerCase().includes(keyword)
            } else {
              return item.name.toLowerCase().includes(keyword) || 
                     item.adds_name.toLowerCase().includes(keyword)
            }
          })
        }
        
        if (mockData.length > 0) {
          if (that.page == 1) {
            that.list = mockData
          } else {
            that.list = that.list.concat(mockData)
          }
        } else if (that.page == 1) {
          that.isEmpty = true
        }
      }, 500)
    },
    
    // 标签切换
    barClick(e) {
      if (!this.kw) {
        return this.opTipsPopup("请输入搜索关键词")
      }
      
      if (this.isThrottling) {
        this.isThrottling = false
        this.barIdx = e.currentTarget.dataset.idx
        this.list = []
        this.page = 1
        this.userSearch()
      }
    },
    
    // 跳转到详情
    toNavigate(e) {
      let id = e.currentTarget.dataset.id
      let url = "/pages/note/details?id=" + id
      
      if (this.barIdx == 1) {
        url = "/pages/goods/details?id=" + id
      } else if (this.barIdx == 2) {
        url = "/pages/note/circle?id=" + id
      } else if (this.barIdx == 3) {
        url = "/pages/user/details?id=" + id
      } else if (this.barIdx > 3 && this.barList[this.barIdx] == "活动") {
        url = "/pages/activity/details?id=" + id
      }
      
      uni.navigateTo({
        url: url
      })
    },
    
    // 点赞回调
    likeClick(e) {
      this.list[e.idx].is_like = e.is_like
      this.list[e.idx].like_count = e.like_count
    },
    
    // 提示弹窗
    opTipsPopup(msg) {
      let that = this
      that.tipsTitle = msg
      that.$refs.tipsPopup.open()
      
      setTimeout(function() {
        that.$refs.tipsPopup.close()
      }, 2000)
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

    // 刷新列表
    fetchList() {
      this.isThrottling = false
      this.list = []
      this.page = 1
      this.userSearch()
    },

    onCardUpdate({ vote_info, idx }) {
      if (this.list[idx]) {
        this.$set(this.list[idx], 'vote_info', vote_info);
      }
    }
  },
  onReachBottom() {
    // 如果列表有内容，加载更多
    if (this.list.length) {
      this.page = this.page + 1
      this.userSearch(false)
    }
  }
}
</script>

<style>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 99;
  background: #fff;
  box-sizing: border-box;
}

.back-box .back-item {
  padding: 0 30rpx;
  width: 34rpx;
  height: 100%;
}

.nav-bar .nav-search {
  width: 100%;
  padding: 20rpx 0;
}

.nav-bar .nav-search input {
  margin-left: 30rpx;
  width: calc(100% - 200rpx);
  height: 80rpx;
  padding: 0 30rpx;
  font-size: 26rpx;
  font-weight: 700;
  border-radius: 8rpx;
  background: #f8f8f8;
  justify-content: space-between;
}

.nav-bar .nav-search .btn {
  width: 120rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 26rpx;
  font-weight: 700;
}

.nav-bar .nav-search .ph {
  color: #999;
}

.nav-bar .nav-search image {
  width: 38rpx;
  height: 38rpx;
}

.nav-bar .bar-box {
  width: 100%;
  height: 80rpx;
}

.bar-box .bar-item {
  padding: 0 30rpx;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.bar-box .bar-item text {
  font-weight: 700;
  transition: all .3s ease-in-out;
}

.bar-item .bar-line {
  position: absolute;
  bottom: 12rpx;
  width: 18rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #000;
  transition: opacity .3s ease-in-out;
}

.content-box {
  width: 100%;
  padding-bottom: 30rpx;
}

.content-box .dynamic-box {
  width: calc(100% - 16rpx);
  padding: 22rpx 8rpx 0;
}

.goods {
  width: 100%;
  padding: 20rpx 0 0;
  display: flex;
  flex-wrap: wrap;
}

.goods .goods-item {
  width: calc(50% - 19rpx);
  margin: 10rpx 0 0 10rpx;
  background: #fff;
  border-radius: 8rpx;
  overflow: hidden;
  border: 2rpx solid #f5f5f5;
}

.goods-item .goods-img {
  width: 100%;
  padding-top: 100%;
  position: relative;
}

.goods-img .goods-img-item {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.goods-item .goods-name {
  width: calc(100% - 40rpx);
  margin: 15rpx 20rpx;
  font-size: 26rpx;
  line-height: 36rpx;
  font-weight: 500;
}

.goods-item .goods-price {
  width: calc(100% - 30rpx);
  margin: 0 20rpx 20rpx;
  display: flex;
  align-items: flex-end;
}

.goods-price .price-h {
  margin-left: 15rpx;
  color: #999;
  font-size: 20rpx;
  line-height: 20rpx;
}

.goods-item .goods-tag {
  width: calc(100% - 30rpx);
  margin: 0 15rpx 15rpx;
  display: flex;
  flex-wrap: wrap;
}

.goods-tag .tag-item {
  margin: 0 5rpx 5rpx;
  height: 40rpx;
  padding: 0 12rpx;
  line-height: 40rpx;
  font-size: 18rpx;
  font-weight: 500;
  background: #f8f8f8;
  border-radius: 8rpx;
}

.content-box .circle-box {
  width: calc(100% - 60rpx);
  padding: 30rpx 30rpx 10rpx;
  justify-content: space-between;
}

.circle-box .circle-avatar {
  width: 168rpx;
  height: 168rpx;
  border-radius: 50%;
  background: #f8f8f8;
  border: 1px solid #f8f8f8;
  position: relative;
}

.circle-avatar .tag {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
}

.circle-box .circle-item {
  width: calc(100% - 198rpx);
  margin-left: 30rpx;
}

.circle-item .name {
  font-size: 32rpx;
  font-weight: 700;
}

.circle-item .intro {
  margin: 10rpx 0 20rpx;
  color: #999;
  font-size: 24rpx;
}

.cu-img-group {
  direction: ltr;
  unicode-bidi: bidi-override;
  display: inline-block;
  margin-left: 16rpx;
}

.cu-img-group .cu-img {
  width: 32rpx;
  height: 32rpx;
  display: inline-flex;
  position: relative;
  margin-left: -16rpx;
  border: 4rpx solid #fff;
  background: #f8f8f8;
  vertical-align: middle;
  border-radius: 50%;
}

.cu-img-group .cu-img image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.cu-img-group .cu-txt {
  margin-left: 10rpx;
  display: inline-flex;
  color: #999;
  font-size: 20rpx;
  font-weight: 700;
}

.content-box .user-box {
  width: calc(100% - 60rpx);
  padding: 30rpx;
  justify-content: space-between;
}

.user-box .user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 1px solid #f8f8f8;
  overflow: hidden;
}

.user-box .user-item {
  width: calc(100% - 120rpx - 2px);
  margin-left: 20rpx;
}

.user-item .name {
  font-size: 28rpx;
  font-weight: 700;
}

.user-item .unm {
  margin: 5rpx 0 10rpx;
  color: #999;
  font-size: 20rpx;
}

.user-tag .tag-item {
  margin-right: 16rpx;
  height: 44rpx;
  padding: 0 14rpx;
  border-radius: 8rpx;
  background: #f8f8f8;
  font-weight: 500;
  font-size: 20rpx;
  justify-content: center;
}

.user-tag .tag-item image {
  width: 24rpx;
  height: 24rpx;
}

.activity-item {
  width: calc(100% - 60rpx);
  padding: 30rpx;
}

.activity-item .activity-img {
  width: 275rpx;
  height: 220rpx;
  border-radius: 8rpx;
  background: #f8f8f8;
  position: relative;
  overflow: hidden;
}

.activity-img .activity-state {
  position: absolute;
  top: 15rpx;
  left: 15rpx;
  width: 68rpx;
  height: 40rpx;
  color: #fff;
  font-size: 16rpx;
  font-weight: 700;
  border-radius: 8rpx;
  background: rgba(0, 0, 0, .6);
  justify-content: center;
}

.activity-item .activity-data {
  padding-left: 20rpx;
  width: calc(100% - 295rpx);
  height: 220rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.activity-data .title {
  font-size: 28rpx;
  line-height: 28rpx;
  font-weight: 700;
  padding-bottom: 12rpx;
}

.activity-data .txt {
  margin-bottom: 4rpx;
}

.activity-data .txt image {
  margin-right: 8rpx;
  width: 20rpx;
  height: 20rpx;
}

.activity-data .txt view {
  width: calc(100% - 26rpx);
  color: #999;
  font-size: 20rpx;
  font-weight: 500;
}

.activity-data .cu-img-group {
  margin: 8rpx 0 16rpx 16rpx;
  direction: ltr;
  unicode-bidi: bidi-override;
  display: inline-block;
}

.cu-img-group .cu-tit {
  display: inline-flex;
  margin-left: 8rpx;
  color: #999;
  font-size: 20rpx;
  font-weight: 500;
}

.activity-data .cu-txt-group {
  margin: 8rpx 0 16rpx;
  font-size: 20rpx;
  font-weight: 500;
  color: #999;
}

.activity-data .activity-btn {
  width: 100%;
  height: 60rpx;
  justify-content: space-between;
}

.activity-btn .btn-item {
  padding: 0;
  margin: 0;
  height: 60rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: #000;
  background: #f8f8f8;
  border-radius: 8rpx;
  justify-content: center;
}

.activity-btn .btn-item .icon {
  margin-left: 10rpx;
  width: 20rpx;
  height: 20rpx;
}

.activity-btn .btn-item .img {
  width: 24rpx;
  height: 24rpx;
}

.w100 {
  width: 100%;
}

.empty-box {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-box image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.empty-box .e1 {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.empty-box .e2 {
  font-size: 24rpx;
  color: #999;
}

.tips-box {
  padding: 20rpx 30rpx;
  border-radius: 12rpx;
  justify-content: center;
}

.tips-box .tips-item {
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
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
</style>