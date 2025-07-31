<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="nav-box bfw df" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="nav-back df" :style="{'height': titleBarHeight + 'px'}" @tap="navBack">
        <image src="/static/img/back.png" style="width:34rpx;height:34rpx"></image>
      </view>
      <view class="nav-title">购物车</view>
    </view>
    
    <view class="content" :style="{'padding-top': statusBarHeight + titleBarHeight + 'px'}">
      <!-- 购物车为空时的展示 -->
      <view v-if="isEmpty" class="empty-box df">
        <image src="/static/img/inset/null.png" />
        <view class="e1">购物车空空的</view>
        <view class="e2">去挑点喜欢的商品装满购物车</view>
      </view>
      
      <!-- 购物车有商品时的展示 -->
      <view v-else class="list-box">
        <view class="list-item df" v-for="(item, index) in list" :key="index">
          <!-- 商品选择 -->
          <view class="choose df" @tap="cartCheck" :data-check="item.check" :data-id="item.id">
            <image :src="item.check == 1 ? '/static/img/c1.png' : '/static/img/c.png'"></image>
          </view>
          
          <!-- 商品图片 -->
          <view class="item-img df" @tap="navigateToFun" :data-url="'goods/details?id='+item.goods_id" data-pay="false">
            <image :src="item.product.img" mode="aspectFill"></image>
            <view v-if="item.status_str" class="sold-out df">{{item.status_str}}</view>
          </view>
          
          <!-- 商品信息 -->
          <view class="info">
            <view class="info-sp" style="height:calc(100% - 60rpx)">
              <view style="width:calc(100% - 84rpx)">
                <view class="txt ohto">{{item.goods_name}}</view>
                <view class="df" @tap="openProductClick" :data-id="item.id">
                  <view class="txt-box">
                    {{item.product.name}}
                    <view class="dw df">
                      <image src="/static/img/x.png" style="width:20rpx;height:20rpx"></image>
                    </view>
                  </view>
                </view>
              </view>
              <view class="more" @tap="openMore" :data-id="item.id">
                <image src="/static/img/gd.png" style="width:24rpx;height:24rpx"></image>
              </view>
            </view>
            
            <view class="info-sp" style="align-items:flex-end">
              <money :price="item.product.price"></money>
              
              <!-- 数量控制区域 -->
              <view v-if="item.is_quantity" class="quantity-box df">
                <view class="quantity-btn" 
                      :style="{'color': quantity > 1 ? '#000' : '#ccc'}" 
                      @tap="quantityBtn" 
                      :data-id="item.id" 
                      data-type="0">－</view>
                <input @blur="quantityBtn" 
                       :data-id="item.id" 
                       data-type="2" 
                       type="number" 
                       maxlength="4" 
                       v-model="quantity" />
                <view class="quantity-btn" 
                      :style="{'color': quantity < item.product.stock ? '#000' : '#ccc'}" 
                      @tap="quantityBtn" 
                      :data-id="item.id" 
                      data-type="1">＋</view>
              </view>
              <view v-else class="quantity-box df" @tap="openQuantity" :data-id="item.id">
                <view style="width:80rpx;text-align:center">{{item.quantity}}</view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 订单金额汇总 -->
        <view class="list-count df" style="margin-top:30rpx">
          <text class="t1">实际商品总额</text>
          <view class="df">
            <text class="t3">已选 {{sumCount}} 件</text>
            <money :price="goodsAmount" :qs="'28rpx'" :ts="'18rpx'"></money>
          </view>
        </view>
        
        <view class="list-count df">
          <text class="t1">优惠金额</text>
          <view class="df">
            <text class="t3">立减</text>
            <money :price="discountAmount" :cor="'#999'" :qs="'28rpx'" :ts="'18rpx'"></money>
          </view>
        </view>
        
        <view v-if="appCard" class="list-count df">
          <text class="t1">卡券</text>
          <view class="df">
            <text class="t3" :style="{'color': cardAmount ? '#FA5150' : '#999'}">优惠</text>
            <money :price="cardAmount" :cor="cardAmount ? '#FA5150' : '#999'" :qs="'28rpx'" :ts="'18rpx'"></money>
          </view>
        </view>
        
        <view class="list-count df">
          <text class="t1">运费</text>
          <view class="df">
            <text class="t3">包邮</text>
            <money :price="0.00" :qs="'28rpx'" :ts="'18rpx'"></money>
          </view>
        </view>
        
        <view class="list-count df">
          <text class="t2">总计</text>
          <money :price="orderAmount" :qs="'28rpx'" :ts="'18rpx'"></money>
        </view>
      </view>
    </view>
    
    <!-- 底部操作栏 -->
    <view v-if="!isEmpty" class="footer-box bUp df">
      <view class="footer-all df" @tap="cartCheck" :data-check="allCheck" data-id="-1">
        <image :src="allCheck == 1 ? '/static/img/c1.png' : '/static/img/c.png'"></image>
        <text>全选</text>
      </view>
      
      <view :class="['btn', 'not', checkCount > 0 && 'act']" @tap="navigateToFun" data-url="order/settlement?type=0" data-pay="true">
        <text v-if="orderAmount > 0">¥ {{orderAmount}}</text> 结算 
      </view>
    </view>
    
    <!-- 规格选择弹窗 -->
    <uni-popup ref="goodsPopup" type="bottom" :safe-area="false">
      <view class="goods-box">
        <view class="goods-top df">
          <view class="popup-name">{{goodsName}}</view>
          <view class="popup-close df" @tap="closePopupClick(1)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
          </view>
        </view>
        
        <view class="specs-title">规格</view>
        <view class="specs-overflow">
          <view class="specs-box" style="display:flex;padding:0 10rpx">
            <view 
              v-for="(item, index) in productList" 
              :key="index" 
              class="specs-item" 
              :style="{'border-color': productIdx == index ? '#000' : '#f8f8f8'}"
              @tap="paramClick" 
              :data-idx="index">
              <image class="img" :src="item.img" mode="aspectFill"></image>
              <view class="fd df" @tap.stop="imgParamTap" :data-url="item.img">
                <image src="/static/img/fd.png" style="width:22rpx;height:22rpx"></image>
              </view>
              <view class="name">
                <view>{{item.name}}</view>
                <view style="margin-top:10rpx">¥ {{item.price}}</view>
              </view>
            </view>
            <view style="flex-shrink:0;width:20rpx;height:20rpx"></view>
          </view>
        </view>
        
        <view :class="['btn', 'gtn', productList[productIdx].stock > 0 && 'act']" @tap="cartProductClick">
          {{productList[productIdx].stock > 0 ? '确定' : '暂无库存'}}
        </view>
      </view>
    </uni-popup>
    
    <!-- 删除弹窗 -->
    <uni-popup ref="morePopup" type="bottom" :safe-area="false">
      <view class="popup-box">
        <view class="popup-item df" @tap="cartDelClick">
          <text style="color:#FA5150">删除</text>
          <image src="/static/img/sc.png"></image>
        </view>
        <view class="popup-item" @tap="closePopupClick(2)">
          <text style="color:#999">取消</text>
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
import request from '@/utils/request.js'
import * as api from '@/config/api.js'
import money from '@/components/money/money.vue'

const app = getApp();

export default {
  components: {
    money
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      appCard: app.globalData.isCard || false,
      list: [],
      listIdx: -1,
      quantity: 0,
      goodsAmount: "0.00",
      discountAmount: "0.00",
      orderAmount: "0.00",
      cardAmount: 0,
      allCheck: 0,
      checkCount: 0,
      sumCount: 0,
      listProductIdx: 0,
      productList: [{stock: 1}],
      productIdx: 0,
      goodsName: "",
      isEmpty: false,
      tipsTitle: "",
      mockData: {
        cartItems: [
          {
            id: 1,
            goods_id: 101,
            goods_name: "轻奢真皮小白鞋",
            goods_product_id: 1001,
            check: 1,
            quantity: 2,
            status: 1,
            status_str: "",
            is_quantity: false,
            product: {
              id: 1001,
              name: "白色 39码",
              img: "/static/img/avatar.png",
              price: "299.00",
              line_price: "399.00",
              stock: 10
            }
          },
          {
            id: 2,
            goods_id: 102,
            goods_name: "夏季薄款T恤",
            goods_product_id: 1002,
            check: 1,
            quantity: 1,
            status: 1,
            status_str: "",
            is_quantity: false,
            product: {
              id: 1002,
              name: "蓝色 L码",
              img: "/static/img/avatar.png",
              price: "89.00",
              line_price: "129.00",
              stock: 5
            }
          },
          {
            id: 3,
            goods_id: 103,
            goods_name: "轻便双肩包",
            goods_product_id: 1003,
            check: 0,
            quantity: 1,
            status: 1,
            status_str: "",
            is_quantity: false,
            product: {
              id: 1003,
              name: "黑色 标准款",
              img: "/static/img/avatar.png",
              price: "199.00",
              line_price: "259.00",
              stock: 8
            }
          },
          {
            id: 4,
            goods_id: 104,
            goods_name: "经典牛仔裤",
            goods_product_id: 1004,
            check: 0,
            quantity: 1,
            status: 2,
            status_str: "已售罄",
            is_quantity: false,
            product: {
              id: 1004,
              name: "深蓝 30码",
              img: "/static/img/avatar.png",
              price: "159.00",
              line_price: "199.00",
              stock: 0
            }
          }
        ],
        productVariants: {
          101: [
            {
              id: 1001,
              name: "白色 39码",
              img: "/static/img/avatar.png",
              price: "299.00",
              stock: 10
            },
            {
              id: 1005,
              name: "白色 40码",
              img: "/static/img/avatar.png", 
              price: "299.00",
              stock: 8
            },
            {
              id: 1006,
              name: "黑色 39码",
              img: "/static/img/avatar.png",
              price: "319.00",
              stock: 5
            }
          ]
        },
        cards: [
          {
            card: {
              price: "30.00",
              name: "满300减30券"
            }
          }
        ]
      }
    }
  },
  onLoad() {
    this.goodsCartList()
  },
  onShow() {
    if (app.globalData.isCenterPage) {
      this.goodsCartList()
      app.globalData.isCenterPage = false
    }
  },
  methods: {
    goodsCartList() {
      let that = this
      that.isEmpty = false
      
      if (api.default && api.default.api && api.default.api.goodsCartListUrl) {
        request(api.default.api.goodsCartListUrl).then(function(res) {
          if (res.code == 200 && res.data.length) {
            that.list = res.data
            that.calculate()
          } else {
            that.isEmpty = true
          }
        })
      } else {
        setTimeout(() => {
          if (that.mockData.cartItems.length) {
            that.list = JSON.parse(JSON.stringify(that.mockData.cartItems))
            that.calculate()
          } else {
            that.isEmpty = true
          }
        }, 500)
      }
    },
    
    openProductClick(e) {
      let that = this
      let index = this.getIndex(e.currentTarget.dataset.id)
      that.listIdx = index
      that.goodsName = that.list[index].goods_name
      
      uni.showLoading({
        mask: true
      })
      
      if (api.default && api.default.api && api.default.api.goodsProductUrl) {
        request(api.default.api.goodsProductUrl, {
          id: that.list[index].goods_id
        }).then(function(res) {
          uni.hideLoading()
          that.productList = res.data
          
          for (let i in that.productList) {
            if (that.productList[i].id == that.list[index].goods_product_id) {
              that.listProductIdx = parseInt(i)
              that.productIdx = parseInt(i)
              break
            }
          }
          
          that.$refs.goodsPopup.open()
        })
      } else {
        setTimeout(() => {
          uni.hideLoading()
          const goodsId = that.list[index].goods_id
          
          if (that.mockData.productVariants[goodsId]) {
            that.productList = that.mockData.productVariants[goodsId]
          } else {
            that.productList = [that.list[index].product]
          }
          
          for (let i in that.productList) {
            if (that.productList[i].id == that.list[index].goods_product_id) {
              that.listProductIdx = parseInt(i)
              that.productIdx = parseInt(i)
              break
            }
          }
          
          that.$refs.goodsPopup.open()
        }, 300)
      }
    },
    
    cartProductClick() {
      let that = this
      
      if (that.listProductIdx != that.productIdx) {
        let product = that.productList[that.productIdx]
        
        if (product.stock <= 0) {
          return that.opTipsPopup("该款式已售罄暂时无法购买！")
        }
        
        uni.showLoading({
          mask: true
        })
        
        if (api.default && api.default.api && api.default.api.goodsSaveCartUrl) {
          request(api.default.api.goodsSaveCartUrl, {
            type: 4,
            id: that.list[that.listIdx].id,
            goods_product_id: product.id,
            quantity: that.list[that.listIdx].quantity
          }, "POST").then(function(res) {
            uni.hideLoading()
            app.globalData.isCenterPage = true
            that.goodsCartList()
            that.$refs.goodsPopup.close()
          })
        } else {
          setTimeout(() => {
            uni.hideLoading()
            
            that.list[that.listIdx].product = product
            that.list[that.listIdx].goods_product_id = product.id
            
            app.globalData.isCenterPage = true
            that.calculate()
            that.$refs.goodsPopup.close()
          }, 300)
        }
      } else {
        that.$refs.goodsPopup.close()
      }
    },
    
    cartCheck(e) {
      let that = this
      let index = this.getIndex(e.currentTarget.dataset.id)
      let check = e.currentTarget.dataset.check
      
      if (index >= 0 && that.list[index].status == 2) {
        return that.opTipsPopup("该款式已售罄暂时无法购买！")
      } else if (index >= 0 && that.list[index].status == 3) {
        return that.opTipsPopup("该款式已下架无法购买！")
      }
      
      if (api.default && api.default.api && api.default.api.goodsSaveCartUrl) {
        request(api.default.api.goodsSaveCartUrl, {
          type: index >= 0 ? 1 : 2,
          id: index >= 0 ? that.list[index].id : 0,
          check: check
        }, "POST").then(function(res) {
          if (index >= 0) {
            that.list[index].check = that.list[index].check == 1 ? 0 : 1
          } else {
            that.allCheck = that.allCheck == 1 ? 0 : 1
            
            for (let i in that.list) {
              if (that.list[i].status == 1) {
                that.list[i].check = that.allCheck
              }
            }
          }
          
          that.calculate()
        })
      } else {
        setTimeout(() => {
          if (index >= 0) {
            that.list[index].check = that.list[index].check == 1 ? 0 : 1
          } else {
            that.allCheck = that.allCheck == 1 ? 0 : 1
            
            for (let i in that.list) {
              if (that.list[i].status == 1) {
                that.list[i].check = that.allCheck
              }
            }
          }
          
          that.calculate()
        }, 200)
      }
    },
    
    quantityBtn(e) {
      let that = this
      let index = this.getIndex(e.currentTarget.dataset.id)
      let type = e.currentTarget.dataset.type
      let isNeedUpdate = false
      
      if (that.list[index].status == 2) {
        return that.opTipsPopup("该款式已售罄暂时无法编辑数量！")
      } else if (that.list[index].status == 3) {
        return that.opTipsPopup("该款式已下架无法编辑数量！")
      } else if (type == 0 && parseInt(that.quantity) <= 1) {
        return that.opTipsPopup("就一件了，数量不能再少啦！")
      }
      
      if (parseInt(that.quantity) > parseInt(that.list[index].product.stock)) {
        isNeedUpdate = true
        that.quantity = parseInt(that.list[index].product.stock)
        that.opTipsPopup("购买数量已达到最大库存上限！")
      } else if (that.list[index].status == 1 && that.quantity && that.quantity != 0) {
        isNeedUpdate = true
        
        if (type == 0) {
          that.quantity = parseInt(that.quantity) - 1
        }
        
        if (type == 1 && parseInt(that.quantity) < parseInt(that.list[index].product.stock)) {
          that.quantity = parseInt(that.quantity) + 1
        }
      }
      
      if (isNeedUpdate) {
        if (api.default && api.default.api && api.default.api.goodsSaveCartUrl) {
          request(api.default.api.goodsSaveCartUrl, {
            type: 3,
            id: that.list[index].id,
            quantity: parseInt(that.quantity)
          }, "POST").then(function(res) {
            that.list[index].quantity = parseInt(that.quantity)
            that.calculate()
          })
        } else {
          setTimeout(() => {
            that.list[index].quantity = parseInt(that.quantity)
            that.calculate()
          }, 200)
        }
      }
    },
    
    cartDelClick() {
      let that = this
      
      uni.showLoading({
        mask: true
      })
      
      if (api.default && api.default.api && api.default.api.goodsCartDelUrl) {
        request(api.default.api.goodsCartDelUrl, {
          id: that.list[that.listIdx].id
        }, "POST").then(function(res) {
          uni.hideLoading()
          app.globalData.isCenterPage = true
          
          that.list.splice(that.listIdx, 1)
          
          if (that.list.length > 0) {
            that.calculate()
          } else {
            that.isEmpty = true
          }
          
          that.$refs.morePopup.close()
        })
      } else {
        setTimeout(() => {
          uni.hideLoading()
          app.globalData.isCenterPage = true
          
          that.list.splice(that.listIdx, 1)
          
          if (that.list.length > 0) {
            that.calculate()
          } else {
            that.isEmpty = true
          }
          
          that.$refs.morePopup.close()
        }, 300)
      }
    },
    
    calculate() {
      let that = this
      let goodsAmount = 0
      let discountAmount = 0
      let orderAmount = 0
      let checkCount = 0
      let sumCount = 0
      let invalidCount = 0
      
      for (let item of that.list) {
        if (item.check && item.status == 1) {
          checkCount += 1
          sumCount += parseInt(item.quantity)
          goodsAmount += parseFloat(item.product.line_price * item.quantity)
          discountAmount += parseFloat((item.product.line_price - item.product.price) * item.quantity)
          orderAmount += parseFloat(item.product.price * item.quantity)
        } else if (item.status == 2 || item.status == 3) {
          invalidCount += 1
        }
      }
      
      that.goodsAmount = goodsAmount.toFixed(2)
      that.discountAmount = discountAmount.toFixed(2)
      that.orderAmount = orderAmount.toFixed(2)
      that.checkCount = checkCount
      that.sumCount = sumCount
      
      if (that.list.length == checkCount + invalidCount && checkCount != 0) {
        that.allCheck = 1
      } else {
        that.allCheck = 0
      }
      
      that.useCard()
    },
    
    useCard() {
      let that = this
      
      if (api.default && api.default.api && api.default.api.useCardUrl) {
        request(api.default.api.useCardUrl, {
          product_id: 0,
          amount: that.orderAmount
        }, "POST").then(function(res) {
          if (res.code == 200 && res.data[0]) {
            that.cardAmount = res.data[0].card.price
            let newOrderAmount = that.orderAmount - res.data[0].card.price
            that.orderAmount = newOrderAmount.toFixed(2)
          }
        })
      } else {
        setTimeout(() => {
          if (parseFloat(that.orderAmount) >= 300) {
            that.cardAmount = that.mockData.cards[0].card.price
            let newOrderAmount = parseFloat(that.orderAmount) - parseFloat(that.cardAmount)
            that.orderAmount = newOrderAmount.toFixed(2)
          } else {
            that.cardAmount = 0
          }
        }, 200)
      }
    },
    
    openQuantity(e) {
      let index = this.getIndex(e.currentTarget.dataset.id)
      
      for (let i in this.list) {
        if (index != i) {
          this.list[i].is_quantity = false
        }
      }
      
      this.quantity = this.list[index].quantity
      this.list[index].is_quantity = true
    },
    
    paramClick(e) {
      this.productIdx = e.currentTarget.dataset.idx
    },
    
    openMore(e) {
      this.listIdx = this.getIndex(e.currentTarget.dataset.id)
      this.$refs.morePopup.open()
    },
    
    closePopupClick(type) {
      if (type == 1) {
        this.$refs.goodsPopup.close()
      } else if (type == 2) {
        this.$refs.morePopup.close()
      }
    },
    
    getIndex(id) {
      for (let i in this.list) {
        if (this.list[i].id == id) {
          return i
        }
      }
      return -1
    },
    
    imgParamTap(e) {
      let url = e.currentTarget.dataset.url
      
      uni.previewImage({
        current: url,
        urls: [url]
      })
    },
    
    navigateToFun(e) {
      let url = e.currentTarget.dataset.url
      let pay = e.currentTarget.dataset.pay
      
      if (pay && this.checkCount <= 0) {
        return this.opTipsPopup("没有可结算的商品！")
      }
      
      if (pay && this.orderAmount <= 0) {
        return this.opTipsPopup("结算金额不能小于0.01！")
      }
      
      uni.navigateTo({
        url: "/pages/" + url
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
    },
    
    opTipsPopup(msg) {
      let that = this
      that.tipsTitle = msg
      that.$refs.tipsPopup.open()
      
      setTimeout(function() {
        that.$refs.tipsPopup.close()
      }, 2000)
    }
  }
}
</script>

<style>
.container{padding-bottom:240rpx;}
.btn{height:100rpx;line-height:100rpx;text-align:center;font-size:24rpx;font-weight:bolder;border-radius:50rpx;}
.nav-box{position:fixed;top:0;left:0;width:100%;z-index:99;box-sizing:border-box;}
.nav-box .nav-back{padding:0 30rpx;width:34rpx;height:100%;}
.nav-box .nav-title{font-size:32rpx;font-weight:700;}
.content-box,.list-box{width:100%;}
.list-box .list-item{border-top:1px solid #f8f8f8;width:100%;height:240rpx;position:relative;}
.list-item .choose{width:100rpx;height:100%;justify-content:center;}
.list-item .choose image,.footer-box .footer-all image{width:38rpx;height:38rpx;}
.list-item .item-img{width:180rpx;height:180rpx;justify-content:center;background:#f8f8f8;border-radius:8rpx;position:relative;overflow:hidden;}
.list-item .item-img image{position:absolute;width:100%;height:100%;}
.list-item .item-img .sold-out{position:absolute;z-index:1;padding:0 30rpx;height:40rpx;color:#fff;font-size:20rpx;font-weight:700;border-radius:40rpx;background:rgba(0,0,0,.4);}
.list-item .info{width:calc(100% - 310rpx);height:180rpx;margin-left:30rpx;display:flex;flex-direction:column;justify-content:space-between;}
.list-item .info .info-sp{display:flex;justify-content:space-between;}
.info .info-sp .txt{font-size:24rpx;color:#000;font-weight:700;}
.info .info-sp .txt-box{margin-top:10rpx;padding:0 50rpx 0 20rpx;color:#999;font-size:20rpx;font-weight:700;height:40rpx;line-height:40rpx;border-radius:20rpx;background:#f8f8f8;position:relative;}
.info .info-sp .txt-box .dw{position:absolute;top:0;right:0;width:40rpx;height:40rpx;}
.info .info-sp .more{padding:0 30rpx;z-index:2;}
.info .info-sp .quantity-box{margin-right:30rpx;height:60rpx;line-height:60rpx;border-radius:30rpx;border:1px solid #f8f8f8;font-size:22rpx;font-weight:700;text-align:center;}
.info .info-sp .quantity-box input{width:40rpx;height:60rpx;line-height:60rpx;color:#000;}
.info .info-sp .quantity-box .quantity-btn{width:60rpx;height:60rpx;line-height:60rpx;}
.list-count{width:calc(100% - 60rpx);padding:15rpx 30rpx;justify-content:space-between;font-size:24rpx;}
.list-count .t1{color:#999;}
.list-count .t2{color:#000;}
.list-count .t3{color:#999;font-weight:700;margin-right:10rpx;}
.footer-box{position:fixed;z-index:99;bottom:0;width:calc(100% - 60rpx);padding:30rpx;justify-content:space-between;border-top:1px solid #f8f8f8;background:rgba(255,255,255,.95);padding-bottom:max(env(safe-area-inset-bottom),30rpx);}
.footer-box .footer-all{flex-direction:column;justify-content:center;}
.footer-box .footer-all text{margin-top:10rpx;color:#000;font-size:20rpx;}
.footer-box .not{min-width:150rpx;padding:0 50rpx;color:#999;background:#f8f8f8;}
.footer-box .not text{margin-right:10rpx;}
.act{color:#fff!important;background:#000!important;}
.popup-box{width:100%;background:#fff;border-radius:30rpx 30rpx 0 0;overflow:hidden;}
.popup-box .popup-item{width:calc(100% - 60rpx);padding:30rpx;color:#000;font-size:26rpx;font-weight:700;justify-content:space-between;}
.popup-box .popup-item image{width:36rpx;height:36rpx;}
.popup-box .popup-item:first-child{padding-top:40rpx;}
.popup-box .popup-item:last-child{padding-bottom:80rpx;}
.popup-box .popup-item:hover{background:#f8f8f8;}
.goods-box{width:100%;padding:30rpx 0;background:#fff;border-radius:30rpx 30rpx 0 0;padding-bottom:max(env(safe-area-inset-bottom),30rpx);}
.goods-box .gtn{margin:0 30rpx;width:calc(100% - 60rpx);color:#999;background:#f8f8f8;}
.goods-box .goods-top{width:calc(100% - 60rpx);height:48rpx;padding:0 30rpx;justify-content:space-between;}
.goods-top .popup-name{width:calc(100% - 68rpx);color:#000;font-size:32rpx;font-weight:700;}
.goods-top .popup-close{width:48rpx;height:48rpx;border-radius:50%;background:#f8f8f8;justify-content:center;transform:rotate(45deg);}
.goods-box .specs-title{padding:30rpx;color:#999;font-size:24rpx;font-weight:700;}
.goods-box .specs-overflow{overflow-x:auto;width:100%;padding-bottom:60rpx;}
.specs-box .specs-item{flex-shrink:0;margin-left:20rpx;background:#fff;width:200rpx;border-radius:8rpx;border-width:1px;border-style:solid;position:relative;overflow:hidden;}
.specs-item .fd{position:absolute;z-index:1;top:10rpx;right:10rpx;width:48rpx;height:48rpx;justify-content:center;background:rgba(0,0,0,.3);border-radius:50%;}
.specs-item .img{width:200rpx;height:200rpx;display:block;}
.specs-item .name{width:calc(100% - 40rpx);margin:20rpx;line-height:30rpx;text-align:center;font-size:20rpx;font-weight:500;}
.empty-box{flex-direction:column;align-items:center;justify-content:center;padding:100rpx 0;}
.empty-box image{width:200rpx;height:200rpx;margin-bottom:30rpx;}
.empty-box .e1{font-size:28rpx;font-weight:bold;margin-bottom:10rpx;}
.empty-box .e2{font-size:24rpx;color:#999;}
.tips-box{padding:20rpx 30rpx;border-radius:12rpx;justify-content:center;}
.tips-box .tips-item{color:#fff;font-size:28rpx;font-weight:700;}
.df{display:flex;align-items:center;}
.bUp{box-shadow:0 -2px 5px 0 rgba(0,0,0,0.05);}
.bfw{backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);background:rgba(255,255,255,.8);}
.ohto{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
</style> 