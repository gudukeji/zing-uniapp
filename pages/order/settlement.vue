<template>
  <view class="container">
    <!-- 导航栏 -->
    <navbar :bg="1"></navbar>
    
    <!-- 收货地址 -->
    <view class="w100p30" :style="{'margin-top': statusBarHeight + titleBarHeight + 'px'}">
      <image class="map-bg" src="/static/img/inset/map.jpg" mode="widthFix"></image>
      <view class="mask-bg"></view>
      <view class="adds-box df" data-url="center/address?od=1" @tap="navigateToFun">
        <view class="adds-item">
          <block v-if="addsInfo.id > 0">
            <view style="font-weight:normal">{{addsInfo.province}} {{addsInfo.city}} {{addsInfo.county}}</view>
            <view class="txt">{{addsInfo.detailed}}</view>
            <view>{{addsInfo.name}} {{addsInfo.mobile}}</view>
          </block>
          <block v-else>
            <view class="txt">请选择收货地址</view>
          </block>
        </view>
        <view class="adds-add" style="padding:20rpx">
          <image src="/static/img/x.png"></image>
        </view>
      </view>
    </view>
    
    <!-- 商品清单 -->
    <view v-if="goodsList.length" class="w100p30">
      <view class="title">商品清单</view>
      <view 
        v-for="(item, index) in goodsList" 
        :key="index" 
        class="goods-item df">
        <image :src="item.product.img" mode="aspectFill"></image>
        <view class="goods-info">
          <view class="t1 ohto">{{item.goods_name}}</view>
          <view class="t2 ohto">{{item.product.name}}</view>
          <view class="goods-info-bom">
            <view class="sum">{{item.quantity}}×</view>
            <money :price="item.product.price"></money>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 价格明细 -->
    <view class="w100p30">
      <view class="title">价格明细</view>
      <view class="list-item df" style="margin-top:15rpx">
        <view>实际商品总额</view>
        <view class="list-right df">
          <text class="zs">共{{orderCount}}件</text>
          <money :price="goodsAmount" qs="28rpx" ts="18rpx"></money>
        </view>
      </view>
      
      <view class="list-item df">
        <view>优惠金额</view>
        <view class="list-right df">
          <text class="zs">立减</text>
          <money :price="discountAmount" cor="#999" qs="28rpx" ts="18rpx"></money>
        </view>
      </view>
      
      <view v-if="appCard" class="list-item df">
        <view>卡券</view>
        <view class="list-right df" @tap="cardPopupClick(true)">
          <text class="zs" :style="{'color': cardAmount ? '#FA5150' : '#999'}">优惠</text>
          <money :price="cardAmount" :cor="cardAmount ? '#FA5150' : '#999'" qs="28rpx" ts="18rpx"></money>
          <text class="zs" style="margin-right:0">（{{cardCount ? '共 ' + cardCount + ' 张可用' : '暂无可用'}}）</text>
          <image class="icon" src="/static/img/x.png"></image>
        </view>
      </view>
      
      <view class="list-item df">
        <view>运费</view>
        <view class="list-right df">
          <text class="zs">包邮</text>
          <money :price="0.00" cor="#999" qs="28rpx" ts="18rpx"></money>
        </view>
      </view>
      
      <view class="list-item df">
        <view>总计</view>
        <view class="list-right df">
          <money :price="orderAmount" qs="28rpx" ts="18rpx"></money>
        </view>
      </view>
    </view>
    
    <!-- 订单备注 -->
    <view class="w100p30">
      <view class="title">订单备注</view>
      <view class="list-item df" style="margin-top:15rpx">
        <textarea auto-height="true" placeholder="选填，订单备注（最多200字）" maxlength="200" v-model="remark"></textarea>
      </view>
    </view>
    
    <!-- 买家须知 -->
    <view class="w100p30">
      <view class="title">买家须知</view>
      <view class="list-item df">
        <view class="list-item-xz" data-url="setting/xinxuan?id=4" @tap="navigateToFun">
          提交订单即表示您同意{{appXx[0]}}的<text>退换货政策</text>
        </view>
      </view>
    </view>
    
    <!-- 底部支付按钮 -->
    <view class="footer df">
      <view class="btn df" @tap="settlementPay">
        <image src="/static/img/pay.png"></image>
        <text>¥ {{orderAmount}}</text>
        <text>支付</text>
      </view>
    </view>
    
    <!-- 卡券弹窗 -->
    <uni-popup ref="cardPopup" type="bottom" :safe-area="false">
      <view class="popup-box">
        <view class="popup-top df">
          <view class="popup-title">
            <view class="t1">选择卡券</view>
            <view class="t2">勾选一张卡券确认后即可使用</view>
          </view>
          <view class="popup-close df" @tap="cardPopupClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
          </view>
        </view>
        
        <view class="popup-scroll">
          <view v-if="cardList.length <= 0" class="empty-box df">
            <image src="/static/empty.png"/>
            <view class="e1">暂无卡券</view>
            <view class="e2">去领券中心，领取或兑换卡券吧</view>
          </view>
          <block v-else>
            <view 
              v-for="(item, index) in cardList" 
              :key="index" 
              class="coupon" 
              :style="{'border-color': item.id == cardSelectId ? '#000' : '#f8f8f8'}" 
              @tap="cardSelectId = item.id">
              <image class="coupon-bg" src="/static/img/coupon-bg.png"></image>
              <view class="coupon-sub">{{item.card.subscript}}</view>
              <view class="coupon-item">
                <view class="coupon-price">{{item.card.price}} 元</view>
                <view class="coupon-intro">{{item.card.intro}}</view>
              </view>
              <view class="coupon-validity">
                有效期：{{item.card.neck_create_time}} - {{item.card.expire_time}}
              </view>
              <view v-if="!item.available" class="coupon-err df">未满足使用条件，不可用</view>
            </view>
          </block>
        </view>
        
        <view class="popup-btn" @tap="cardPopupClick(false)">确认</view>
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
import navbar from '@/components/navbar/navbar.vue'
import money from '@/components/money/money.vue'
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'

const app = getApp()

export default {
  components: {
    navbar,
    money,
    uniPopup
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      appCard: app.globalData?.isCard || false,
      appXx: app.globalData?.appXx || ['商城'],
      type: 0,
      productId: 0,
      quantity: 1,
      addsInfo: {
        id: 0
      },
      goodsList: [],
      orderCount: 0,
      goodsAmount: "0.00",
      discountAmount: "0.00",
      orderAmount: "0.00",
      reserveOrderAmount: "0.00",
      cardAmount: 0,
      cardId: 0,
      cardCount: 0,
      cardSelectId: 0,
      cardList: [],
      remark: "",
      tipsTitle: "",
      
      // Mock数据
      mockGoodsList: [
        {
          goods_id: 1001,
          goods_name: "2023夏季新款连衣裙",
          quantity: 1,
          product: {
            img: "/static/img/avatar.png",
            name: "白色 L码",
            price: "299.00",
            line_price: "399.00"
          }
        },
        {
          goods_id: 1002,
          goods_name: "轻薄透气运动鞋",
          quantity: 1,
          product: {
            img: "/static/img/avatar.png",
            name: "黑色 40码",
            price: "199.00",
            line_price: "299.00"
          }
        }
      ],
      
      mockAddress: {
        id: 1,
        name: "张三",
        mobile: "13800138000",
        province: "广东省",
        city: "广州市",
        county: "天河区",
        detailed: "天河路123号时尚大厦A座2301"
      },
      
      mockCardList: [
        {
          id: 101,
          available: true,
          card: {
            subscript: "满300可用",
            price: "50.00",
            intro: "商城通用满300减50优惠券",
            neck_create_time: "2023-05-01",
            expire_time: "2023-12-31"
          }
        },
        {
          id: 102,
          available: true,
          card: {
            subscript: "无门槛",
            price: "10.00",
            intro: "商城通用无门槛优惠券",
            neck_create_time: "2023-05-01",
            expire_time: "2023-12-31"
          }
        },
        {
          id: 103,
          available: false,
          card: {
            subscript: "满500可用",
            price: "100.00",
            intro: "商城通用满500减100优惠券",
            neck_create_time: "2023-05-01",
            expire_time: "2023-12-31"
          }
        }
      ]
    }
  },
  onLoad(options) {
    if (options.type && options.type == 1) {
      this.type = options.type
      this.productId = options.pid
      this.quantity = options.quantity
    }
    
    this.addressInfo(0)
    this.goodsSettlement()
  },
  methods: {
    // 获取商品结算信息
    goodsSettlement() {
      let that = this
      
      // 检查API是否可用
      if (api.api && api.api.goodsSettlementUrl) {
        request(api.api.goodsSettlementUrl, {
          type: that.type,
          pid: that.productId,
          quantity: that.quantity
        }).then(function(res) {
          if (res.code == 200) {
            that.goodsList = res.data
            that.calculate()
          } else {
            that.opTipsPopup(res.msg, true)
          }
        })
      } else {
        // 使用Mock数据
        setTimeout(() => {
          that.goodsList = that.mockGoodsList
          that.calculate()
        }, 500)
      }
    },
    
    // 结算支付
    settlementPay() {
      let that = this
      
      if (that.orderAmount <= 0) {
        that.opTipsPopup("支付金额不能小于0.01！")
        return
      }
      
      if (that.addsInfo.id <= 0) {
        that.opTipsPopup("请选择一个收货地址！")
        return
      }
      
      uni.showLoading({
        title: "生成订单中..",
        mask: true
      })
      
      // 检查API是否可用
      if (api.api && api.api.settlementPayUrl) {
        request(api.api.settlementPayUrl, {
          type: that.type,
          pid: that.productId,
          quantity: that.quantity,
          aid: that.addsInfo.id,
          cid: that.cardId,
          remark: that.remark
        }, "POST").then(function(res) {
          uni.hideLoading()
          app.globalData.isCenterPage = true
          
          if (res.code == 200) {
            let payData = res.data
            uni.requestPayment({
              provider: "weixin",
              timeStamp: payData.timestamp,
              nonceStr: payData.nonceStr,
              package: payData.package,
              signType: payData.signType,
              paySign: payData.paySign,
              success: function() {
                that.opTipsPopup("下单成功，我们会尽快为您发货 🎉")
                setTimeout(function() {
                  uni.redirectTo({
                    url: "/pages/order/index?idx=2"
                  })
                }, 1000)
              },
              fail: function() {
                that.opTipsPopup("支付失败！")
                setTimeout(function() {
                  uni.redirectTo({
                    url: "/pages/order/index?idx=1"
                  })
                }, 1000)
              }
            })
          } else {
            that.opTipsPopup(res.msg)
          }
        })
      } else {
        // 模拟支付流程
        setTimeout(() => {
          uni.hideLoading()
          app.globalData.isCenterPage = true
          
          uni.showModal({
            title: '模拟支付',
            content: '这是一个模拟的支付流程，点击确定将模拟支付成功',
            success: function(res) {
              if (res.confirm) {
                that.opTipsPopup("下单成功，我们会尽快为您发货 🎉")
                setTimeout(function() {
                  uni.redirectTo({
                    url: "/pages/order/index?idx=2"
                  })
                }, 1000)
              } else {
                that.opTipsPopup("支付失败！")
                setTimeout(function() {
                  uni.redirectTo({
                    url: "/pages/order/index?idx=1"
                  })
                }, 1000)
              }
            }
          })
        }, 1000)
      }
    },
    
    // 获取地址信息
    addressInfo(id) {
      let that = this
      
      uni.showLoading({
        mask: true
      })
      
      // 检查API是否可用
      if (api.api && api.api.userAddressInfoUrl) {
        request(api.api.userAddressInfoUrl, {
          id: id
        }).then(function(res) {
          uni.hideLoading()
          
          if (res.code == 200 && res.data) {
            that.addsInfo = res.data
          }
        })
      } else {
        // 使用Mock数据
        setTimeout(() => {
          uni.hideLoading()
          that.addsInfo = that.mockAddress
        }, 500)
      }
    },
    
    // 计算价格
    calculate() {
      let that = this
      let count = 0
      let goodsAmount = 0
      let discountAmount = 0
      let orderAmount = 0
      
      for (let item of that.goodsList) {
        goodsAmount += parseFloat(item.product.line_price * item.quantity)
        discountAmount += parseFloat((item.product.line_price - item.product.price) * item.quantity)
        orderAmount += parseFloat(item.product.price * item.quantity)
        count += parseInt(item.quantity)
      }
      
      that.goodsAmount = goodsAmount.toFixed(2)
      that.discountAmount = discountAmount.toFixed(2)
      that.orderAmount = orderAmount.toFixed(2)
      that.orderCount = count
      
      if (that.appCard) {
        that.useCard()
      }
    },
    
    // 使用卡券
    useCard() {
      let that = this
      
      // 检查API是否可用
      if (api.api && api.api.useCardUrl) {
        request(api.api.useCardUrl, {
          product_id: that.productId,
          amount: that.orderAmount
        }, "POST").then(function(res) {
          if (res.code == 200 && res.data[0]) {
            that.cardList = res.data[2]
            that.cardCount = res.data[1]
            that.cardSelectId = res.data[0].id
            that.cardId = res.data[0].id
            that.cardAmount = res.data[0].card.price
            that.reserveOrderAmount = that.orderAmount
            
            let newAmount = that.reserveOrderAmount - res.data[0].card.price
            that.orderAmount = newAmount.toFixed(2)
          }
        })
      } else {
        // 使用Mock数据
        setTimeout(() => {
          that.cardList = that.mockCardList
          that.cardCount = that.mockCardList.length
          
          // 默认选择第一张可用卡券
          let availableCard = that.mockCardList.find(card => card.available === true)
          if (availableCard) {
            that.cardSelectId = availableCard.id
            that.cardId = availableCard.id
            that.cardAmount = availableCard.card.price
            that.reserveOrderAmount = that.orderAmount
            
            let newAmount = parseFloat(that.reserveOrderAmount) - parseFloat(availableCard.card.price)
            that.orderAmount = newAmount > 0 ? newAmount.toFixed(2) : "0.01"
          }
        }, 500)
      }
    },
    
    // 卡券弹窗点击
    cardPopupClick(isOpen) {
      if (isOpen) {
        this.$refs.cardPopup.open()
      } else {
        if (this.cardId != this.cardSelectId) {
          for (let item of this.cardList) {
            if (item.id == this.cardSelectId) {
              let newAmount = parseFloat(this.reserveOrderAmount) - parseFloat(item.card.price)
              this.orderAmount = newAmount > 0 ? newAmount.toFixed(2) : "0.01"
              this.cardId = item.id
              this.cardAmount = item.card.price
              break
            }
          }
        }
        this.$refs.cardPopup.close()
      }
    },
    
    // 页面跳转
    navigateToFun(e) {
      uni.navigateTo({
        url: "/pages/" + e.currentTarget.dataset.url
      })
    },
    
    // 返回上一页
    navBack() {
      if (getCurrentPages().length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({
          url: "/pages/tabbar/shop"
        })
      }
    },
    
    // 提示弹窗
    opTipsPopup(msg, isBack = false) {
      let that = this
      that.tipsTitle = msg
      that.$refs.tipsPopup.open()
      
      setTimeout(function() {
        that.$refs.tipsPopup.close()
        
        if (isBack) {
          that.navBack()
        }
      }, 2000)
    }
  }
}
</script>

<style>
page { background: #f8f8f8; }
.container { padding-bottom: 240rpx; }
.w100p30 {
  z-index: 1;
  margin: 20rpx 30rpx;
  width: calc(100% - 100rpx);
  padding: 30rpx 20rpx;
  border-radius: 30rpx;
  background: #fff;
  overflow: hidden;
  position: relative;
}
.title {
  width: 100%;
  color: #000;
  font-size: 26rpx;
  font-weight: 700;
}
.w100p30 .map-bg {
  position: absolute;
  z-index: -2;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
.w100p30 .mask-bg {
  position: absolute;
  z-index: -1;
  right: -2rpx;
  bottom: -2rpx;
  width: calc(100% - 24rpx);
  height: calc(100% - 24rpx);
  border: 14rpx solid #fff;
  border-radius: 30rpx;
  background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, .9), rgba(255, 255, 255, .6));
}
.w100p30 .adds-box {
  z-index: 1;
  width: 100%;
  height: 100%;
  justify-content: space-between;
}
.adds-box .adds-item {
  color: #000;
  font-size: 24rpx;
  font-weight: 700;
}
.adds-box .adds-item .txt {
  padding: 10rpx 0;
  font-size: 32rpx;
}
.adds-box .adds-add image {
  width: 28rpx;
  height: 28rpx;
  transform: rotate(-90deg);
}
.goods-item {
  padding-top: 30rpx;
  justify-content: space-between;
  animation: fadeIn .45s ease;
}
.goods-item image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 8rpx;
}
.goods-item .goods-info {
  width: calc(100% - 160rpx);
  height: 140rpx;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.goods-item .goods-info .t1 {
  color: #000;
  font-size: 26rpx;
}
.goods-item .goods-info .t2 {
  color: #999;
  font-size: 24rpx;
}
.goods-item .goods-info .goods-info-bom {
  margin-top: 25rpx;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}
.goods-info .goods-info-bom .sum {
  margin-right: 20rpx;
  color: #999;
  font-size: 22rpx;
}
.list-item {
  padding: 15rpx 0;
  justify-content: space-between;
  color: #000;
  font-size: 24rpx;
}
.list-item .list-right .zs {
  color: #999;
  margin-right: 10rpx;
}
.list-item .list-right .icon {
  width: 22rpx;
  height: 22rpx;
  transform: rotate(-90deg);
}
.list-item textarea {
  width: calc(100% - 40rpx);
  padding: 20rpx;
  border-radius: 8rpx;
  background: #f8f8f8;
  font-size: 24rpx;
  font-weight: 700;
  min-height: 120rpx;
}
.list-item .list-item-xz {
  margin-top: 15rpx;
  color: #999;
  font-weight: 300;
  font-size: 24rpx;
}
.list-item .list-item-xz text {
  margin-left: 6rpx;
  color: #000;
  font-weight: 500;
  text-decoration: underline;
}
.footer {
  position: fixed;
  z-index: 99;
  bottom: 0;
  left: 0;
  width: calc(100% - 80rpx);
  padding: 30rpx 40rpx;
  flex-direction: column;
  background-color: #fff;
  padding-bottom: max(env(safe-area-inset-bottom), 20rpx);
  border-top: 2rpx solid #f5f5f5;
}
.footer .btn {
  width: 100%;
  height: 100rpx;
  justify-content: center;
  background: #000;
  border-radius: 50rpx;
}
.footer .btn image {
  width: 32rpx;
  height: 32rpx;
}
.footer .btn text {
  margin-left: 12rpx;
  color: #fff;
  font-size: 26rpx;
  font-weight: bolder;
}
.popup-box {
  width: calc(100% - 40rpx);
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 30rpx 30rpx 0 0;
  position: relative;
  overflow: hidden;
}
.popup-box .popup-top {
  width: calc(100% - 20rpx);
  padding: 10rpx;
  justify-content: space-between;
}
.popup-top .popup-title .t1 {
  font-size: 38rpx;
  font-weight: 700;
}
.popup-top .popup-title .t2 {
  color: #999;
  font-size: 20rpx;
  font-weight: 300;
}
.popup-top .popup-close {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #eee;
  justify-content: center;
  transform: rotate(45deg);
}
.popup-box .popup-scroll {
  padding-top: 20rpx;
  width: 100%;
  max-height: 50vh;
  overflow-y: scroll;
}
.popup-scroll .coupon {
  margin: 0 6rpx 30rpx;
  width: calc(100% - 20rpx);
  background: #fff;
  border-width: 4rpx;
  border-style: solid;
  border-radius: 8rpx;
  position: relative;
  overflow: hidden;
}
.coupon .coupon-bg {
  position: absolute;
  z-index: 1;
  right: -90rpx;
  bottom: -120rpx;
  width: 380rpx;
  height: 380rpx;
}
.coupon .coupon-sub {
  position: absolute;
  z-index: 9;
  top: 0;
  left: 0;
  border-radius: 8rpx 0;
  padding: 0rpx 12rpx;
  height: 36rpx;
  line-height: 36rpx;
  text-align: center;
  font-size: 20rpx;
  color: #fa5150;
  background: rgba(250, 81, 80, .125);
}
.coupon .coupon-item {
  z-index: 2;
  width: calc(100% - 80rpx);
  padding: 50rpx 40rpx 20rpx;
  border-bottom: 2rpx dashed #f8f8f8;
  position: relative;
}
.coupon-item .coupon-price {
  width: calc(100% - 200rpx);
  color: #000;
  font-size: 48rpx;
  font-weight: 700;
}
.coupon-item .coupon-intro {
  width: calc(100% - 200rpx);
  margin: 8rpx 0;
  color: #444;
  font-size: 24rpx;
}
.coupon .coupon-validity {
  width: calc(100% - 80rpx);
  padding: 20rpx 40rpx;
  color: #999;
  font-size: 20rpx;
}
.coupon .coupon-err {
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 28rpx;
  font-style: italic;
  font-weight: 700;
  justify-content: center;
  color: #ccc;
  background: rgba(255, 255, 255, .85);
}
.popup-box .popup-btn {
  margin: 40rpx 10rpx;
  width: calc(100% - 20rpx);
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
  background: #000;
  border-radius: 100rpx;
}
.empty-box {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
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
  background: rgba(0, 0, 0, 0.6);
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
</style> 