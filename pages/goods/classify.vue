<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-box" :style="{'padding-top': statusBarHeight + 'px', 'background': 'rgba(255, 255, 255,' + navbarTrans + ')'}">
      <view class="bg-mk"></view>
      <view class="bg-mk2"></view>
      <view class="bg-img">
        <lazy-image v-if="classifyList[classifyIdx].img" :src="classifyList[classifyIdx].img" />
        <lazy-image v-else :src="'/static/img/inset/map.jpg'" />
      </view>
      <view class="nav-back df" :style="{'height': titleBarHeight + 'px'}" @tap="navBack">
        <image src="/static/img/back.png" style="width:34rpx;height:34rpx"></image>
      </view>
      
      <!-- 一级分类滚动区域 -->
      <scroll-view scroll-x="true" class="classify-scroll">
        <view class="one-box df">
          <view 
            v-for="(item, index) in classifyList" 
            :key="index" 
            :class="['one-item', 'df', index == classifyIdx ? 'active' : '']" 
            :data-idx="index" 
            :data-type="1" 
            @tap="classifyClick">
            {{ item.name }}
          </view>
          <view style="flex-shrink:0;width:15rpx;height:15rpx"></view>
        </view>
      </scroll-view>
      
      <!-- 二级分类滚动区域 -->
      <scroll-view 
        scroll-x="true" 
        class="classify-scroll" 
        :style="{'height': classifyList[classifyIdx].children.length ? '68rpx' : '0px'}">
        <view class="two-box df">
          <view 
            v-for="(item, index) in classifyList[classifyIdx].children" 
            :key="index" 
            class="two-item" 
            :style="{'color': index == classifyChildrenIdx ? '#000' : '#999'}" 
            :data-idx="index" 
            :data-type="2" 
            @tap="classifyClick">
            {{ item.name }}
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 内容区域 -->
    <view 
      class="content-box" 
      :style="{
        'padding-top': classifyList[classifyIdx].children.length 
          ? 'calc(' + (statusBarHeight + titleBarHeight) + 'px + 168rpx)' 
          : 'calc(' + (statusBarHeight + titleBarHeight) + 'px + 100rpx)'
      }">
      <!-- 加载中状态 -->
      <view class="heio df" :style="{'height': isThrottling || loadStatus == 'loading' ? '0px' : '60rpx'}">
        <uni-load-more v-if="true" status="loading"></uni-load-more>
      </view>
      
      <!-- 商品列表 -->
      <view class="goods-box">
        <block v-if="!isEmpty">
          <view 
            v-for="(item, index) in list" 
            :key="index" 
            class="goods-item" 
            :data-url="'goods/details?id=' + item.id" 
            @tap="navigateToFun">
            <view class="goods-img">
              <view class="goods-img-item">
                <lazy-image :src="item.imgs[0]"></lazy-image>
              </view>
            </view>
            <view class="goods-name ohto2">{{ item.name }}</view>
            <view class="goods-price">
              <money :price="item.product.price"></money>
              <view class="price-h" style="text-decoration:line-through">¥{{ item.product.line_price }}</view>
              <view class="price-h">{{ item.buy ? item.buy + '人已买' : item.cart + item.browse + '人想买' }}</view>
            </view>
            <view class="goods-tag df">
              <view 
                v-for="(tag, tagIndex) in item.tags" 
                :key="tagIndex" 
                class="tag-item">
                {{ tag }}
              </view>
            </view>
          </view>
        </block>
      </view>
      
      <!-- 空状态 -->
      <view v-if="isEmpty" class="empty-box df">
        <image src="/static/img/empty.png" />
        <view class="e1">暂无推荐商品</view>
        <view class="e2">正在为您制造更多美好的商品</view>
      </view>
      
      <!-- 加载更多 -->
      <uni-load-more :status="loadStatus"></uni-load-more>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js'
import * as api from '@/config/api.js'
import lazyImage from '@/components/lazyImage/lazyImage.vue'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'
import money from '@/components/money/money.vue'

const app = getApp();

export default {
  components: {
    lazyImage,
    uniLoadMore,
    money
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      isOrder: false,
      navbarTrans: 0,
      classifyList: [
        {
          id: 1,
          name: "推荐",
          img: "",
          children: []
        }
      ],
      classifyIdx: 0,
      classifyChildrenIdx: -1,
      isThrottling: false,
      list: [],
      page: 1,
      isEmpty: false,
      loadStatus: "more",
      // Mock数据
      mockData: {
        // 分类数据
        classifyList: [
          {
            id: 1,
            name: "推荐",
            img: "/static/img/avatar.png",
            children: []
          },
          {
            id: 2,
            name: "女装",
            img: "/static/img/avatar.png",
            children: [
              { id: 21, name: "T恤" },
              { id: 22, name: "裙装" },
              { id: 23, name: "裤装" },
              { id: 24, name: "套装" },
              { id: 25, name: "外套" }
            ]
          },
          {
            id: 3,
            name: "男装",
            img: "/static/img/avatar.png",
            children: [
              { id: 31, name: "T恤" },
              { id: 32, name: "裤装" },
              { id: 33, name: "衬衫" },
              { id: 34, name: "外套" }
            ]
          },
          {
            id: 4,
            name: "鞋包",
            img: "/static/img/avatar.png",
            children: [
              { id: 41, name: "女鞋" },
              { id: 42, name: "男鞋" },
              { id: 43, name: "双肩包" },
              { id: 44, name: "手提包" }
            ]
          },
          {
            id: 5,
            name: "配饰",
            img: "/static/img/avatar.png",
            children: [
              { id: 51, name: "项链" },
              { id: 52, name: "手链" },
              { id: 53, name: "耳饰" },
              { id: 54, name: "帽子" }
            ]
          }
        ],
        // 商品列表数据
        goodsList: {
          // 推荐商品
          1: [
            {
              id: 101,
              name: "夏季新款连衣裙气质淑女温柔风碎花裙",
              imgs: ["/static/img/avatar.png"],
              product: {
                price: "169.00",
                line_price: "269.00"
              },
              tags: ["新品", "包邮"],
              buy: 156,
              cart: 20,
              browse: 358
            },
            {
              id: 102,
              name: "高腰阔腿牛仔裤女夏季薄款宽松直筒",
              imgs: ["/static/img/avatar.png"],
              product: {
                price: "128.00",
                line_price: "198.00"
              },
              tags: ["热卖", "包邮"],
              buy: 239,
              cart: 45,
              browse: 520
            },
            {
              id: 103,
              name: "小香风短袖t恤女2023新款夏季宽松上衣",
              imgs: ["/static/img/avatar.png"],
              product: {
                price: "79.00",
                line_price: "129.00"
              },
              tags: ["折扣", "包邮"],
              buy: 315,
              cart: 67,
              browse: 782
            },
            {
              id: 104,
              name: "轻奢品牌小白鞋女夏季新款透气板鞋",
              imgs: ["/static/img/avatar.png"],
              product: {
                price: "299.00",
                line_price: "459.00"
              },
              tags: ["限量", "包邮"],
              buy: 98,
              cart: 32,
              browse: 256
            }
          ],
          // 女装T恤
          21: [
            {
              id: 201,
              name: "纯棉短袖T恤女装夏季薄款宽松圆领打底衫",
              imgs: ["/static/img/avatar.png"],
              product: {
                price: "69.00",
                line_price: "99.00"
              },
              tags: ["新款", "纯棉"],
              buy: 234,
              cart: 56,
              browse: 467
            },
            {
              id: 202,
              name: "设计感小众短袖T恤女装夏季新款韩版上衣",
              imgs: ["/static/img/avatar.png"],
              product: {
                price: "89.00",
                line_price: "139.00"
              },
              tags: ["ins风", "宽松"],
              buy: 178,
              cart: 43,
              browse: 385
            }
          ],
          // 男装T恤
          31: [
            {
              id: 301,
              name: "夏季薄款男士短袖T恤纯棉圆领体恤衫",
              imgs: ["/static/img/avatar.png"],
              product: {
                price: "79.00",
                line_price: "119.00"
              },
              tags: ["纯棉", "透气"],
              buy: 256,
              cart: 48,
              browse: 512
            }
          ]
        }
      }
    }
  },
  onLoad() {
    this.getClassifyList()
  },
  methods: {
    getClassifyList() {
      let that = this
      
      // 检查API是否可用
      if (api.default && api.default.api && api.default.api.classifyListUrl) {
        request(api.default.api.classifyListUrl).then(function(res) {
          if (res.code == 200) {
            that.classifyList = res.data
            that.goodsList()
          }
        })
      } else {
        // 使用mock数据
        setTimeout(() => {
          that.classifyList = that.mockData.classifyList
          that.goodsList()
        }, 500)
      }
    },
    
    goodsList() {
      let that = this
      that.isEmpty = false
      
      let classifyId = that.classifyList[that.classifyIdx].id
      if (that.classifyChildrenIdx != -1) {
        classifyId = that.classifyList[that.classifyIdx].children[that.classifyChildrenIdx].id
      }
      
      // 检查API是否可用
      if (api.default && api.default.api && api.default.api.goodsListUrl) {
        request(api.default.api.goodsListUrl, {
          page: that.page,
          classify_type: that.classifyChildrenIdx != -1 ? 1 : 0,
          classify_id: classifyId
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
          } else {
            that.loadStatus = "no-more"
          }
        })
      } else {
        // 使用mock数据
        setTimeout(() => {
          that.isThrottling = true
          that.loadStatus = "more"
          
          // 尝试获取当前分类的商品
          let mockGoods = that.mockData.goodsList[classifyId] || []
          
          // 模拟分页
          const pageSize = 4
          const startIndex = (that.page - 1) * pageSize
          const endIndex = startIndex + pageSize
          const pageData = mockGoods.slice(startIndex, endIndex)
          
          if (pageData.length > 0) {
            if (that.page == 1) {
              that.list = pageData
            } else {
              that.list = that.list.concat(pageData)
            }
          } else if (that.page == 1) {
            that.isEmpty = true
          } else {
            that.loadStatus = "no-more"
          }
        }, 500)
      }
    },
    
    classifyClick(e) {
      let dataset = e.currentTarget.dataset
      
      if (dataset.type == 1) {
        this.classifyIdx = dataset.idx
        this.classifyChildrenIdx = -1
      }
      
      if (dataset.type == 2) {
        this.classifyChildrenIdx = dataset.idx
      }
      
      this.isThrottling = false
      this.page = 1
      this.goodsList()
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
          url: "/pages/tabbar/shop"
        })
      }
    }
  },
  onPageScroll(e) {
    var opacity = (e.scrollTop > 150 ? 150 : e.scrollTop) / 150
    this.navbarTrans = opacity
  },
  onReachBottom() {
    if (this.list.length) {
      this.loadStatus = "loading"
      this.page = this.page + 1
      this.goodsList()
    }
  }
}
</script>

<style>
page {
  background: #f8f8f8;
}

.nav-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 99;
  box-sizing: border-box;
}

.nav-box .nav-back {
  padding: 0 30rpx;
}

.bg-mk, .bg-mk2, .bg-img {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.bg-mk {
  z-index: -1;
  background: linear-gradient(to left, rgba(255, 255, 255, .3), #fff);
}

.bg-mk2 {
  z-index: -1;
  background: linear-gradient(to bottom, rgba(255, 255, 255, .3), #fff, #fff);
}

.bg-img {
  z-index: -2;
}

.nav-box .classify-scroll {
  width: 100%;
  white-space: nowrap;
  transition: all .3s ease-in-out;
  overflow: hidden;
}

.classify-scroll .one-box {
  width: calc(100% - 30rpx);
  padding: 0 15rpx;
  height: 100rpx;
}

.one-box .one-item {
  flex-shrink: 0;
  margin: 0 15rpx;
  padding: 0 30rpx;
  height: 68rpx;
  font-size: 20rpx;
  font-weight: 700;
  background: #f8f8f8;
  border-radius: 68rpx;
  justify-content: center;
}

.one-box .active {
  color: #fff;
  background: #000;
}

.classify-scroll .two-box {
  width: 100%;
  height: 68rpx;
}

.two-box .two-item {
  flex-shrink: 0;
  padding: 0 30rpx;
  height: 68rpx;
  line-height: 68rpx;
  font-size: 24rpx;
  font-weight: 700;
  transition: color .3s ease-in-out;
}

.content-box {
  width: 100%;
  transition: all .3s ease-in-out;
}

.goods-box {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.goods-box .goods-item {
  width: calc(50% - 15rpx);
  margin: 10rpx 0 0 10rpx;
  background: #fff;
  border-radius: 8rpx;
  overflow: hidden;
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

/* 空状态样式 */
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

/* 辅助类 */
.df {
  display: flex;
  align-items: center;
}

.ohto2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.heio {
  width: 100%;
  justify-content: center;
  transition: all .3s ease-in-out;
  overflow: hidden;
}
</style> 