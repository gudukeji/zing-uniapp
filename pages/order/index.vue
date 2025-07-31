<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-bar bf8" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="bar-box df" :style="{'height': titleBarHeight + 'px', 'width': '100%'}">
        <view class="bar-back df" @tap="navBack">
          <image src="/static/img/z.png" style="width:34rpx;height:34rpx"></image>
        </view>
        <view class="bar-title ohto">订单</view>
      </view>
      
      <!-- 订单状态选项卡 -->
      <view class="nav-box df">
        <view 
          v-for="(item, index) in barList" 
          :key="index"
          class="nav-item df"
          @tap="barClick" 
          :data-idx="index">
          <text :style="{'color': index == barIdx ? '#000' : '#999', 'font-size': index == barIdx ? '28rpx' : '26rpx'}">{{item}}</text>
          <view :style="{'opacity': index == barIdx ? 1 : 0}" class="nav-line"></view>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content df" :style="{'margin-top': 'calc(' + (statusBarHeight + titleBarHeight) + 'px + 80rpx)'}">
      <!-- 加载中状态 -->
      <view class="heio df" :style="{'height': isThrottling || loadStatus == 'loading' ? '0px' : '60rpx'}">
        <uni-load-more v-if="true" status="loading"></uni-load-more>
      </view>
      
      <!-- 空状态 -->
      <emptyPage
        v-if="isEmpty"
        title="暂无相关订单"
        description="去逛逛，挑点喜欢的产品下单吧"
        image="/static/img/empty.png"
        buttonText="去购物"
        @buttonClick="goToShop"
      />
      
      <!-- 订单列表 -->
      <block v-else>
        <view 
          v-for="(item, index) in list" 
          :key="item.id" 
          class="list-box" 
          :data-id="item.id" 
          @tap="toOrderDetails">
          <!-- 订单头部 -->
          <view class="list-top df">
            <text># {{item.order_no}}</text>
            <text style="color:#000;font-size:24rpx">{{item.status_name}}</text>
          </view>
          
          <!-- 订单商品 -->
          <view class="list-info df">
            <view class="list-info-img">
              <image 
                v-for="(img, imgIndex) in item.goods" 
                :key="imgIndex" 
                v-if="imgIndex < 3" 
                :src="img.image" 
                mode="aspectFill"></image>
              <view v-if="item.goods.length > 3" class="mask-img">+{{item.goods.length-3}}</view>
            </view>
            <view class="list-info-pn">
              <money :price="item.pay_price" size="36"></money>
              <view class="num">共{{item.goods_count}}件</view>
            </view>
          </view>
          
          <!-- 物流信息 -->
          <view v-if="item.express" class="list-wuliu df">
            订单由<text>{{item.express}}：{{item.express_no}}</text>为您配送到家
          </view>
          
          <!-- 操作按钮 -->
          <view class="list-btn df">
            <!-- 删除按钮 -->
            <view 
              v-if="item.status == 0 || item.status == 4 || item.status == 5" 
              class="df btn1" 
              :data-idx="index" 
              data-type="0" 
              @tap.stop="editClick">
              <text>删除</text>
            </view>
            
            <!-- 取消订单 -->
            <view 
              v-if="(item.status == 1 || item.status == 2) && (item.pay_status == 1 || item.pay_status == 0)" 
              class="df btn1" 
              :data-idx="index" 
              data-type="1" 
              @tap.stop="editClick">
              <text>取消订单</text>
            </view>
            
            <!-- 催发货 -->
            <view 
              v-if="item.status == 2" 
              class="df btn2" 
              :data-idx="index" 
              @tap.stop="urgeDeliveryClick">
              <text>催发货</text>
            </view>
            
            <!-- 确认收货 -->
            <view 
              v-if="item.status == 3" 
              class="df btn2" 
              :data-idx="index" 
              data-type="2" 
              @tap.stop="editClick">
              <text>确认收货</text>
            </view>
            
            <!-- 评价 -->
            <view 
              v-if="item.status == 4" 
              class="df btn2" 
              :data-idx="index" 
              @tap.stop="openOrderNote">
              <text>评价</text>
            </view>
            
            <!-- 支付 -->
            <view 
              v-if="item.status == 1 && item.pay_status == 0" 
              class="df btn2" 
              :data-id="item.id" 
              @tap.stop="paymentClick">
              <image src="/static/img/z.png"></image>
              <text>支付</text>
            </view>
          </view>
        </view>
        
        <!-- 加载更多 -->
        <uni-load-more v-if="list.length > 0" :status="loadStatus"></uni-load-more>
      </block>
    </view>
    
    <!-- 评价弹窗 -->
    <uni-popup ref="notePopup" type="center">
      <view class="note-box">
        <view class="note-add df" @tap="toOrderNote(1)">
          <image src="/static/img/null.png"></image>
          <text>图文评价</text>
        </view>
        <view class="note-add df" @tap="toOrderNote(2)">
          <image src="/static/img/null.png"></image>
          <text>视频评价</text>
        </view>
        <view class="note-add df" @tap="toOrderNote(3)">
          <image src="/static/img/null.png"></image>
          <text>音文评价</text>
        </view>
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
import navbar from '@/components/navbar/navbar.vue'
import lazyImage from '@/components/lazyImage/lazyImage.vue'
import money from '@/components/money/money.vue'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'
import emptyPage from '@/components/emptyPage/emptyPage.vue'
//import { request, showToast } from '@/config/util.js'
import * as mockData from '@/config/mock.js'

export default {
  components: {
    navbar,
    lazyImage,
    money,
    uniLoadMore,
    emptyPage
  },
  data() {
    return {
      statusBarHeight: 20,
      titleBarHeight: 44,
      barList: ['全部', '待付款', '待发货', '待收货', '评价', '售后'],
      barIdx: 0,
      isThrottling: true,
      list: [],
      listIdx: 0,
      page: 1,
      isEmpty: false,
      loadStatus: 'more',
      tipsTitle: '',
      useMockData: process.env.NODE_ENV === 'development' // 开发环境下使用mock数据
    }
  },
  onLoad(options) {
    // 根据传入参数设置当前标签
    if (options.idx) {
      this.barIdx = parseInt(options.idx)
    }
    
    this.orderList()
  },
  onReachBottom() {
    if (this.list.length) {
      this.loadStatus = 'loading'
      this.page = this.page + 1
      this.orderList()
    }
  },
  methods: {
    // 获取订单列表
    orderList() {
      let that = this
      
      // 使用mock数据
      if (this.useMockData) {
        setTimeout(() => {
          that.isThrottling = true
          that.loadStatus = 'more'
          
          let filteredOrders = [...mockData.orderList]
          
          // 根据选项卡筛选订单
          if (that.barIdx > 0 && that.barIdx <= 5) {
            filteredOrders = filteredOrders.filter(order => 
              order.status == that.barIdx
            )
          }
          
          if (filteredOrders.length > 0) {
            // 模拟分页 - 每页最多3条数据
            const pageSize = 3
            const startIndex = (that.page - 1) * pageSize
            const endIndex = startIndex + pageSize
            const pageData = filteredOrders.slice(startIndex, endIndex)
            
            if (pageData.length > 0) {
              if (that.page === 1) {
                that.list = pageData
              } else {
                that.list = that.list.concat(pageData)
              }
              that.isEmpty = false
              that.loadStatus = endIndex >= filteredOrders.length ? 'noMore' : 'more'
            } else {
              that.loadStatus = 'noMore'
            }
          } else {
            if (that.page === 1) {
              that.isEmpty = true
              that.list = []
            } else {
              that.loadStatus = 'noMore'
            }
          }
        }, 500)
        return
      }
      
      // 正常API请求
      request('order/list', {
        type: that.barIdx,
        page: that.page
      }).then(function(res) {
        that.isThrottling = true
        that.loadStatus = 'more'
        
        if (res.code == 200 && res.data && res.data.data) {
          if (res.data.data.length > 0) {
            if (that.page === 1) {
              that.list = res.data.data
            } else {
              that.list = that.list.concat(res.data.data)
            }
            that.page = res.data.current_page || that.page
            that.isEmpty = false
            
            // 判断是否还有更多数据
            if (res.data.current_page >= res.data.last_page) {
              that.loadStatus = 'noMore'
            }
          } else if (that.page === 1) {
            that.isEmpty = true
            that.list = []
          } else {
            that.loadStatus = 'noMore'
          }
        } else {
          that.loadStatus = 'more'
          showToast(res.msg || '获取订单列表失败')
          
          // API请求失败时使用mock数据
          if (that.page === 1) {
            that.list = mockData.orderList
            that.isEmpty = that.list.length === 0
          }
        }
      }).catch(() => {
        that.isThrottling = true
        
        // API请求异常时使用mock数据
        if (that.page === 1) {
          that.list = [...mockData.orderList]
          that.isEmpty = that.list.length === 0
        }
        that.loadStatus = 'noMore'
      })
    },
    
    // 支付
    paymentClick(e) {
      let that = this
      uni.showLoading({
        title: '唤起支付中..',
        mask: true
      })
      
      if (this.useMockData) {
        setTimeout(() => {
          uni.hideLoading()
          that.opTipsPopup('支付成功，我们会尽快为您发货 🎉')
          that.barIdx = 2
          that.isThrottling = false
          that.page = 1
          that.orderList()
        }, 1000)
        return
      }
      
      request('order/payment', {
        id: e.currentTarget.dataset.id
      }, 'POST').then(function(res) {
        uni.hideLoading()
        
        if (res.code == 200) {
          let payData = res.data
          uni.requestPayment({
            provider: 'weixin',
            timeStamp: payData.timestamp,
            nonceStr: payData.nonceStr,
            package: payData.package,
            signType: payData.signType,
            paySign: payData.paySign,
            success: function() {
              that.opTipsPopup('支付成功，我们会尽快为您发货 🎉')
              that.barIdx = 2
              that.isThrottling = false
              that.page = 1
              that.orderList()
            },
            fail: function() {
              showToast('支付失败或已取消')
            }
          })
        } else {
          showToast(res.msg || '支付异常，请稍后重试')
        }
      }).catch(() => {
        uni.hideLoading()
        showToast('网络异常，请稍后重试')
      })
    },
    
    // 编辑订单(取消订单/确认收货/删除订单)
    editClick(e) {
      let that = this
      let idx = e.currentTarget.dataset.idx
      let type = e.currentTarget.dataset.type
      let refund = 0
      
      // 已付款的订单取消，需退款
      if (type == 1 && that.list[idx].pay_status == 1 && that.list[idx].status == 2) {
        refund = 1
      }
      
      // 确认提示
      let tipText = '确定要'
      if (type == 0) tipText += '删除'
      else if (type == 1) tipText += '取消'
      else if (type == 2) tipText += '确认收货'
      tipText += '吗？'
      
      if (type == 0) tipText += '删除后将无法恢复。'
      
      uni.showModal({
        title: '提示',
        content: tipText,
        success: function(res) {
          if (res.confirm) {
            uni.showLoading({
              mask: true
            })
            
            if (that.useMockData) {
              setTimeout(() => {
                uni.hideLoading()
                
                if (type == 0) {
                  // 删除订单
                  that.list.splice(idx, 1)
                  if (that.list.length <= 0) {
                    that.isEmpty = true
                  }
                  that.opTipsPopup('删除成功')
                } else if (type == 1) {
                  // 取消订单
                  if (that.barIdx == 0) {
                    that.list[idx].status = 0
                    that.list[idx].status_name = '已取消'
                  } else {
                    that.list.splice(idx, 1)
                    if (that.list.length <= 0) {
                      that.isEmpty = true
                    }
                  }
                  that.opTipsPopup('取消成功')
                } else if (type == 2) {
                  // 确认收货
                  if (that.barIdx == 0) {
                    that.list[idx].status = 4
                    that.list[idx].status_name = '待评价'
                  } else {
                    that.list.splice(idx, 1)
                    if (that.list.length <= 0) {
                      that.isEmpty = true
                    }
                  }
                  that.opTipsPopup('确认收货成功')
                }
                
                getApp().globalData.isCenterPage = true
              }, 1000)
              return
            }
            
            request('order/edit', {
              id: that.list[idx].id,
              type: type,
              refund: refund
            }, 'POST').then(function(res) {
              uni.hideLoading()
              that.opTipsPopup(res.msg)
              
              if (res.code == 200) {
                if (that.barIdx == 0 && type == 1) {
                  // 全部订单列表中取消订单
                  that.list[idx].status = 0
                  that.list[idx].status_name = '已取消'
                } else if (that.barIdx == 0 && type == 2) {
                  // 全部订单列表中确认收货
                  that.list[idx].status = 4
                  that.list[idx].status_name = '待评价'
                } else {
                  // 其他标签页中的操作，移除该订单
                  that.list.splice(idx, 1)
                  if (that.list.length <= 0) {
                    that.isEmpty = true
                  }
                  getApp().globalData.isCenterPage = true
                }
              }
            }).catch(() => {
              uni.hideLoading()
              showToast('网络异常，请稍后重试')
            })
          }
        }
      })
    },
    
    // 催发货
    urgeDeliveryClick(e) {
      let idx = e.currentTarget.dataset.idx
      this.opTipsPopup('操作成功，我们会尽快为您发货 🎉')
      
      if (!this.useMockData) {
        request('order/edit', {
          id: this.list[idx].id,
          type: 3,
          refund: 0
        }, 'POST')
      }
    },
    
    // 打开评价选择弹窗
    openOrderNote(e) {
      this.listIdx = e.currentTarget.dataset.idx
      this.$refs.notePopup.open()
    },
    
    // 去评价
    toOrderNote(type) {
      this.$refs.notePopup.close()
      uni.navigateTo({
        url: '/pages/note/add?type=' + type + '&oid=' + this.list[this.listIdx].id
      })
    },
    
    // 查看订单详情
    toOrderDetails(e) {
      uni.navigateTo({
        url: '/pages/order/details?id=' + e.currentTarget.dataset.id
      })
    },
    
    // 切换标签
    barClick(e) {
      if (this.isThrottling) {
        this.barIdx = e.currentTarget.dataset.idx
        this.isThrottling = false
        this.page = 1
        this.orderList()
      }
    },
    
    // 返回上一页
    navBack() {
      if (getCurrentPages().length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({
          url: '/pages/tabbar/center'
        })
      }
    },
    
    // 显示提示
    opTipsPopup(title) {
      let that = this
      that.tipsTitle = title
      that.$refs.tipsPopup.open()

      setTimeout(function() {
        that.$refs.tipsPopup.close()
      }, 2000)
    },

    // 去购物
    goToShop() {
      uni.switchTab({
        url: '/pages/index/shop'
      })
    }
  }
}
</script>

<style>
page {
  background: #f8f8f8;
}

/* 导航栏 */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 99;
  box-sizing: border-box;
}

.bar-box .bar-back {
  padding: 0 30rpx;
  width: 34rpx;
  height: 100%;
}

.bar-box .bar-title {
  font-size: 32rpx;
  font-weight: 700;
}

.nav-box {
  position: sticky;
  left: 0;
  z-index: 99;
  margin-top: -1px;
  width: 100%;
  height: 80rpx;
  justify-content: space-between;
}

.nav-box .nav-item {
  width: 16.66%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.nav-box .nav-item text {
  font-weight: 700;
  transition: all .3s ease-in-out;
}

.nav-box .nav-line {
  position: absolute;
  bottom: 12rpx;
  width: 18rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #000;
  transition: opacity .3s ease-in-out;
}

/* 内容区 */
.content {
  width: 100%;
  flex-direction: column;
}

.list-box {
  margin-top: 30rpx;
  width: calc(100% - 100rpx);
  padding: 30rpx 20rpx;
  border-radius: 30rpx;
  background: #fff;
}

.list-box .list-top {
  width: 100%;
  justify-content: space-between;
}

.list-top text {
  color: #999;
  font-size: 26rpx;
  font-weight: 700;
}

.list-info {
  width: 100%;
  padding: 30rpx 0;
  justify-content: space-between;
}

.list-info .list-info-img {
  display: flex;
  align-items: center;
  position: relative;
}

.list-info .list-info-img image,
.list-info .mask-img {
  width: 130rpx;
  height: 130rpx;
  border-radius: 8rpx;
}

.list-info .list-info-img image {
  margin-right: 8rpx;
  animation: fadeIn .45s ease;
}

.list-info .mask-img {
  position: absolute;
  top: 0;
  right: 8rpx;
  line-height: 130rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
  background: rgba(0, 0, 0, .3);
}

.list-info .list-info-pn {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
}

.list-info-pn .num {
  margin-top: 10rpx;
  color: #999;
  font-size: 20rpx;
  font-weight: 500;
}

.list-wuliu {
  margin-bottom: 30rpx;
  z-index: 1;
  width: calc(100% - 40rpx);
  padding: 20rpx;
  color: #999;
  font-size: 24rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
}

.list-wuliu text {
  margin: 0 10rpx;
  color: #000;
  font-weight: 700;
}

.list-box .list-btn {
  justify-content: flex-end;
}

.list-btn view {
  margin-left: 20rpx;
  padding: 0 30rpx;
  height: 60rpx;
  border-radius: 30rpx;
}

.list-btn view image {
  width: 26rpx;
  height: 26rpx;
  margin-right: 10rpx;
}

.list-btn view text {
  font-size: 20rpx;
  line-height: 20rpx;
  font-weight: 700;
}

.list-btn .btn1 {
  color: #999;
  border: 2rpx solid #F5F5F5;
}

.list-btn .btn2 {
  color: #fff;
  background: #000;
  border: 2rpx solid #000;
}

/* 评价弹窗 */
.note-box {
  padding: 15rpx;
  background: #fff;
  border-radius: 30rpx;
}

.note-box .note-add {
  margin: 30rpx;
  width: 400rpx;
  height: 90rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
  background: #000;
  border-radius: 45rpx;
  justify-content: center;
}

.note-box .note-add image {
  margin-right: 10rpx;
  width: 40rpx;
  height: 40rpx;
}

/* 空状态 */
.empty-box {
  margin-top: 120rpx;
  width: 100%;
  flex-direction: column;
}

.empty-box image {
  width: 240rpx;
  height: 240rpx;
}

.empty-box .e1 {
  margin-top: 30rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.empty-box .e2 {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #999;
}

/* 提示框 */
.tips-box {
  width: 100%;
  justify-content: center;
}

.tips-item {
  background: #000;
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
}

/* 加载动画 */
.heio {
  justify-content: center;
}

/* 通用 */
.df {
  display: flex;
  align-items: center;
}

.bf8 {
  background: #fff;
}

.ohto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style> 