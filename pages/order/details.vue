<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-box bf8" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="nav-item df" :style="{'height': titleBarHeight + 'px', 'width': '100%'}">
        <view class="back df" @tap="navBack">
          <image src="/static/img/back.png" style="width:34rpx;height:34rpx"></image>
        </view>
        <view class="nav-title">{{orderInfo.status_str}}</view>
      </view>
    </view>
    
    <view class="content" :style="{'padding-top': statusBarHeight + titleBarHeight + 'px'}">
      <view class="w100p30">
        <image class="map-bg" src="/static/img/inset/map.jpg" mode="widthFix"></image>
        <view class="mask-bg"></view>
        <view class="title">收货地址</view>
        <view class="adds-box">
          <view class="adds-item">
            <view class="nm">{{orderInfo.user_name}} {{orderInfo.user_mobile}}</view>
            <view>{{orderInfo.user_adds}}</view>
            <view v-if="orderInfo.express" class="express">
              订单由<text user-select="true">{{orderInfo.express}}：{{orderInfo.express_no}}</text>为您配送到家
            </view>
          </view>
          <view class="adds-icon df">
            <view></view>
          </view>
        </view>
      </view>
      
      <view class="w100p30">
        <view class="title">商品清单</view>
        <view 
          v-for="(item, index) in orderInfo.goods" 
          :key="index" 
          class="goods-item" 
          :data-url="'goods/details?id='+item.goods_id" 
          @tap="navigateToFun">
          <image :src="item.product_img" mode="aspectFill"></image>
          <view class="goods-info">
            <view class="t1 ohto">{{item.goods_name}}</view>
            <view class="t2 ohto">{{item.product_name}}</view>
            <view class="goods-info-bom">
              <view class="sum" style="margin-right:20rpx">{{item.quantity}}×</view>
              <money :price="item.product_price"></money>
              <view v-if="item.status == 2" class="sum" style="margin-left:20rpx">已退款</view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="w100p30">
        <view class="title">订单信息</view>
        <view class="list-item df" style="margin-top:15rpx">
          <view>订单号</view>
          <view class="list-right df" :data-nt="orderInfo.order_no">
            <text class="zs" user-select="true">{{orderInfo.order_no}}</text>
          </view>
        </view>
        
        <view class="list-item df">
          <view>实际商品总额</view>
          <view class="list-right df">
            <text class="zs">共{{orderInfo.goods_count}}件</text>
            <money :price="orderInfo.goods_amount" cor="#999" qs="28rpx" ts="18rpx"></money>
          </view>
        </view>
        
        <view v-if="orderInfo.discount_amount" class="list-item df">
          <view>优惠金额</view>
          <view class="list-right df">
            <text class="zs">立减</text>
            <money :price="orderInfo.discount_amount" cor="#999" qs="28rpx" ts="18rpx"></money>
          </view>
        </view>
        
        <view v-if="orderInfo.card_price" class="list-item df">
          <view>卡券</view>
          <view class="list-right df">
            <text class="zs">优惠</text>
            <money :price="orderInfo.card_price" cor="#999" qs="28rpx" ts="18rpx"></money>
          </view>
        </view>
        
        <view class="list-item df">
          <view>运费</view>
          <view class="list-right df">
            <text class="zs">包邮</text>
            <money :price="orderInfo.express_amount" cor="#999" qs="28rpx" ts="18rpx"></money>
          </view>
        </view>
        
        <view class="list-item df">
          <view>总计</view>
          <view class="list-right df">
            <money :price="orderInfo.order_amount" qs="28rpx" ts="18rpx"></money>
          </view>
        </view>
        
        <view class="list-item df">
          <view>下单时间</view>
          <view class="list-right df">
            <text class="zs">{{orderInfo.create_time}}</text>
          </view>
        </view>
        
        <view v-if="orderInfo.ship_time_str" class="list-item df">
          <view>发货时间</view>
          <view class="list-right df">
            <text class="zs">{{orderInfo.ship_time_str}}</text>
          </view>
        </view>
        
        <view v-if="orderInfo.confirm_time_str" class="list-item df">
          <view>确认收货时间</view>
          <view class="list-right df">
            <text class="zs">{{orderInfo.confirm_time_str}}</text>
          </view>
        </view>
      </view>
      
      <view class="w100p30">
        <view class="title">备注信息</view>
        <view class="list-item" style="margin-top:15rpx;display:flex">
          <view>
            <text user-select="true">{{orderInfo.remark ? orderInfo.remark : '无'}}</text>
            <view style="font-size:16rpx;margin-top:10rpx;color:#999">注：如需修改请联系客服</view>
          </view>
        </view>
      </view>
      
      <view class="footer df">
        <button class="icon-box df" open-type="contact" 
          :send-message-title="orderInfo.order_no" 
          :send-message-path="'/pages/order/details?id='+orderInfo.id" 
          :show-message-card="true">
          <image src="/static/img/kf.png"></image>
          <text>客服</text>
        </button>
        
        <view class="footer-btn df">
          <view v-if="orderInfo.status == 0 || orderInfo.status == 4 || orderInfo.status == 5" 
            class="df btn1" data-type="0" @tap="editClick">
            <text>删除</text>
          </view>
          
          <view v-if="!(orderInfo.status != 1 && orderInfo.status != 2 || orderInfo.pay_status != 1 && orderInfo.pay_status != 0)" 
            class="df btn1" data-type="1" @tap="editClick">
            <text>取消订单</text>
          </view>
          
          <view v-if="(orderInfo.pay_status == 1 || orderInfo.pay_status == 3) && orderInfo.status == 3" 
            class="df btn1" @tap="orderRefundClick(true)">
            <text>申请售后</text>
          </view>
          
          <view v-if="orderInfo.status == 2" 
            class="df btn2" @tap="urgeDeliveryClick">
            <text>催发货</text>
          </view>
          
          <view v-if="orderInfo.status == 3" 
            class="df btn2" data-type="2" @tap="editClick">
            <text>确认收货</text>
          </view>
          
          <view v-if="orderInfo.status == 4" 
            class="df btn2" @tap="openOrderNote">
            <text>评价</text>
          </view>
          
          <view v-if="orderInfo.status == 1 && orderInfo.pay_status == 0" 
            class="df btn2" @tap="paymentClick">
            <image src="/static/img/pay.png"></image>
            <text>支付</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 申请售后弹窗 -->
    <uni-popup ref="refundPopup" type="bottom" :safe-area="false">
      <view class="popup-box">
        <view class="popup-top df">
          <view class="popup-title">
            <view class="t1">申请售后</view>
            <view class="t2">提交后您可以联系客服为您及时处理</view>
          </view>
          <view class="popup-close df" @tap="orderRefundClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
          </view>
        </view>
        
        <view class="popup-item">
          <view class="popup-type df" style="margin-top:20rpx">
            <view :class="[refundType == 0 ? 'active' : '']" @tap="refundType = 0">未收到货</view>
            <view :class="[refundType == 1 ? 'active' : '']" @tap="refundType = 1">已收到货</view>
          </view>
          
          <view v-if="refundType == 1" class="popup-adds">
            <text class="a1" user-select="true">收件人：{{orderInfo.refund[0]}}     收件电话：{{orderInfo.refund[1]}}</text>
            <text class="a1" user-select="true" style="margin-top:8rpx">收件地址：{{orderInfo.refund[2]}}</text>
            <text class="a2">如您已收到货物，请通过上方收件地址寄回货物</text>
          </view>
          
          <view v-if="refundType == 1" class="popup-wl df">
            <input placeholder="寄回物流名称" v-model="refundExpress"/>
            <input placeholder="寄回物流单号" v-model="refundExpressNo"/>
          </view>
          
          <textarea class="popup-textarea" auto-height="true" placeholder="售后原因（最多200字）" maxlength="200" v-model="refundReason"></textarea>
        </view>
        
        <view class="popup-btn" @tap="refundClick">确认提交</view>
      </view>
    </uni-popup>
    
    <!-- 评价弹窗 -->
    <uni-popup ref="notePopup" type="center">
      <view class="note-box">
        <view class="note-add df" @tap="toOrderNote(1)">
          <image src="/static/img/tw.png"></image>
          <text>图文评价</text>
        </view>
        <view class="note-add df" @tap="toOrderNote(2)">
          <image src="/static/img/sp.png"></image>
          <text>视频评价</text>
        </view>
        <view class="note-add df" @tap="toOrderNote(3)">
          <image src="/static/img/yw.png"></image>
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
import request from '@/utils/request.js'
import * as api from '@/config/api.js'
import money from '@/components/money/money.vue'

const app = getApp()

export default {
  components: {
    money
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      orderInfo: {
        id: 0,
        status_str: "状态加载中",
        address: "",
        adds_mobile: "",
        adds_name: "",
        express: "",
        express_no: "",
        order_no: "",
        goods_count: 0,
        goods_amount: "0.00",
        order_amount: "0.00",
        discount_amount: "0.00",
        express_amount: "0.00",
        pay_status: 0,
        create_time: "",
        ship_time_str: "",
        confirm_time_str: "",
        remark: "",
        status: 0,
        refund: ["", "", ""],
        user_name: "",
        user_mobile: "",
        user_adds: "",
        goods: []
      },
      refundType: 0,
      refundExpress: "",
      refundExpressNo: "",
      refundReason: "",
      tipsTitle: "",
      
      // Mock数据
      mockOrderDetails: {
        id: 123456,
        status_str: "待收货",
        address: "广东省广州市天河区天河路123号",
        adds_mobile: "13800138000",
        adds_name: "张三",
        express: "顺丰速运",
        express_no: "SF1234567890123",
        order_no: "202305201234567890",
        goods_count: 3,
        goods_amount: "599.00",
        order_amount: "599.00",
        discount_amount: "100.00",
        express_amount: "0.00",
        pay_status: 1,
        create_time: "2023-05-20 12:34:56",
        ship_time_str: "2023-05-21 10:24:36",
        confirm_time_str: "",
        remark: "请尽快发货，谢谢！",
        status: 3,
        refund: ["张小姐", "13912345678", "广东省广州市天河区天河路789号"],
        user_name: "张三",
        user_mobile: "13800138000",
        user_adds: "广东省广州市天河区天河路123号",
        goods: [
          {
            goods_id: 1001,
            goods_name: "2023夏季新款连衣裙",
            product_name: "白色 L码",
            product_img: "/static/img/avatar.png",
            product_price: "299.00",
            quantity: 1,
            status: 0
          },
          {
            goods_id: 1002,
            goods_name: "轻薄透气运动鞋",
            product_name: "黑色 40码",
            product_img: "/static/img/avatar.png",
            product_price: "199.00",
            quantity: 1,
            status: 0
          },
          {
            goods_id: 1003,
            goods_name: "时尚斜挎小包",
            product_name: "米色 标准",
            product_img: "/static/img/avatar.png",
            product_price: "101.00",
            quantity: 1,
            status: 0
          }
        ]
      }
    }
  },
  onLoad(options) {
    if (options.id) {
      this.orderInfo.id = options.id
      this.orderDetails()
    } else {
      this.opTipsPopup("未找到订单，请稍后重试！", true)
    }
  },
  methods: {
    // 获取订单详情
    orderDetails() {
      let that = this
      
      // 检查API是否可用
      if (api.api && api.api.orderDetailsUrl) {
        request(api.api.orderDetailsUrl, {
          id: that.orderInfo.id
        }).then(function(res) {
          if (res.code == 200) {
            that.orderInfo = res.data
          } else {
            that.opTipsPopup(res.msg, true)
          }
        })
      } else {
        // 使用Mock数据
        setTimeout(() => {
          that.orderInfo = that.mockOrderDetails
        }, 500)
      }
    },
    
    // 支付订单
    paymentClick() {
      let that = this
      
      uni.showLoading({
        title: "唤起支付中..",
        mask: true
      })
      
      // 检查API是否可用
      if (api.api && api.api.orderPaymentUrl) {
        request(api.api.orderPaymentUrl, {
          id: that.orderInfo.id
        }, "POST").then(function(res) {
          uni.hideLoading()
          
          let payData = res.data
          uni.requestPayment({
            provider: "weixin",
            timeStamp: payData.timestamp,
            nonceStr: payData.nonceStr,
            package: payData.package,
            signType: payData.signType,
            paySign: payData.paySign,
            success: function() {
              that.opTipsPopup("支付成功，我们会尽快为您发货 🎉")
              that.orderInfo.pay_status = 1
              that.orderInfo.status = 2
              that.orderInfo.status_str = "待发货"
            }
          })
        })
      } else {
        // 模拟支付流程
        setTimeout(() => {
          uni.hideLoading()
          
          uni.showModal({
            title: '模拟支付',
            content: '这是一个模拟的支付流程，点击确定将模拟支付成功',
            success: function(res) {
              if (res.confirm) {
                that.opTipsPopup("支付成功，我们会尽快为您发货 🎉")
                that.orderInfo.pay_status = 1
                that.orderInfo.status = 2
                that.orderInfo.status_str = "待发货"
              }
            }
          })
        }, 1000)
      }
    },
    
    // 编辑订单（删除、取消、确认收货）
    editClick(e) {
      let that = this
      let type = e.currentTarget.dataset.type
      let refund = 0
      
      // 订单已支付且为待发货状态时，申请售后需要退款
      if (type == 1 && that.orderInfo.pay_status == 1 && that.orderInfo.status == 2) {
        refund = 1
      }
      
      uni.showLoading({
        mask: true
      })
      
      // 检查API是否可用
      if (api.api && api.api.editOrderUrl) {
        request(api.api.editOrderUrl, {
          id: that.orderInfo.id,
          type: type,
          refund: refund
        }, "POST").then(function(res) {
          uni.hideLoading()
          that.opTipsPopup(res.msg)
          
          if (res.code == 200) {
            if (type == 0) {
              app.globalData.isCenterPage = true
              that.opTipsPopup(res.msg, true)
              return
            }
            
            if (type == 1) {
              that.orderInfo.status = 0
              that.orderInfo.status_str = "已取消"
            } else if (type == 3) {
              that.orderInfo.status = 4
              that.orderInfo.status_str = "待评价"
            }
          }
        })
      } else {
        // 模拟编辑流程
        setTimeout(() => {
          uni.hideLoading()
          
          if (type == 0) {
            app.globalData.isCenterPage = true
            that.opTipsPopup("订单已删除", true)
            return
          }
          
          if (type == 1) {
            that.orderInfo.status = 0
            that.orderInfo.status_str = "已取消"
            that.opTipsPopup("订单已取消")
          } else if (type == 2) {
            that.orderInfo.status = 4
            that.orderInfo.status_str = "待评价"
            that.opTipsPopup("已确认收货")
          }
        }, 800)
      }
    },
    
    // 提交售后申请
    refundClick() {
      let that = this
      
      if (that.refundType == 1 && !that.refundExpress) {
        that.opTipsPopup("请填写寄回物流名称")
        return
      }
      
      if (that.refundType == 1 && !that.refundExpressNo) {
        that.opTipsPopup("请填写寄回物流单号")
        return
      }
      
      if (!that.refundReason) {
        that.opTipsPopup("请填写售后原因")
        return
      }
      
      uni.showLoading({
        mask: true
      })
      
      // 检查API是否可用
      if (api.api && api.api.refundOrderUrl) {
        request(api.api.refundOrderUrl, {
          id: that.orderInfo.id,
          type: that.refundType,
          express: that.refundExpress,
          express_no: that.refundExpressNo,
          reason: that.refundReason
        }, "POST").then(function(res) {
          uni.hideLoading()
          that.opTipsPopup(res.msg)
          
          if (res.code == 200) {
            that.orderInfo.pay_status = 2
            that.orderInfo.status_str = that.orderInfo.status_str + "（售后中）"
            that.$refs.refundPopup.close()
          }
        })
      } else {
        // 模拟售后申请流程
        setTimeout(() => {
          uni.hideLoading()
          that.opTipsPopup("售后申请已提交，请等待商家处理")
          that.orderInfo.pay_status = 2
          that.orderInfo.status_str = that.orderInfo.status_str + "（售后中）"
          that.$refs.refundPopup.close()
        }, 800)
      }
    },
    
    // 打开/关闭售后弹窗
    orderRefundClick(isOpen) {
      if (isOpen) {
        this.$refs.refundPopup.open()
      } else {
        this.$refs.refundPopup.close()
      }
    },
    
    // 打开评价弹窗
    openOrderNote() {
      this.$refs.notePopup.open()
    },
    
    // 跳转到评价页面
    toOrderNote(type) {
      uni.navigateTo({
        url: "/pages/note/add?type=" + type + "&oid=" + this.orderInfo.id
      })
    },
    
    // 催发货
    urgeDeliveryClick() {
      this.opTipsPopup("操作成功，我们会尽快为您发货 🎉")
      
      // 检查API是否可用
      if (api.api && api.api.editOrderUrl) {
        request(api.api.editOrderUrl, {
          id: this.orderInfo.id,
          type: 3,
          refund: 0
        }, "POST")
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
.nav-box {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
  box-sizing: border-box;
}
.nav-box .back {
  padding: 0 30rpx;
  height: 100%;
  justify-content: center;
}
.nav-box .nav-title {
  font-size: 32rpx;
  font-weight: 700;
}
.w100p30 {
  z-index: 1;
  margin: 20rpx 20rpx 0;
  width: calc(100% - 80rpx);
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
.adds-box {
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.adds-box .adds-item {
  width: calc(100% - 60rpx);
  font-size: 24rpx;
  font-weight: 300;
}
.adds-box .adds-item .nm {
  padding: 20rpx 0 10rpx;
  font-size: 32rpx;
  font-weight: 700;
}
.adds-item .express {
  margin-top: 20rpx;
  width: 100%;
  font-size: 26rpx;
}
.adds-item .express text {
  margin: 0 8rpx;
  font-weight: 700;
}
.adds-box .adds-icon {
  margin: 0 10rpx 20rpx 0;
  width: 40rpx;
  height: 40rpx;
  background: #000;
  justify-content: center;
  border-radius: 20rpx 20rpx 4rpx;
  box-shadow: 8rpx 8rpx 8rpx -4rpx rgba(0, 0, 0, .1);
  transform: rotate(45deg);
}
.adds-box .adds-icon view {
  width: 16rpx;
  height: 16rpx;
  background: #fff;
  border-radius: 50%;
}
.goods-item {
  padding-top: 30rpx;
  display: flex;
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
  align-items: center;
  justify-content: flex-end;
}
.goods-info .goods-info-bom .sum {
  color: #999;
  font-size: 20rpx;
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
.footer {
  position: fixed;
  z-index: 99;
  bottom: 0;
  left: 0;
  width: calc(100% - 20rpx);
  padding: 20rpx 10rpx;
  background-color: #fff;
  border-top: 2rpx solid #f5f5f5;
  padding-bottom: env(safe-area-inset-bottom);
}
.footer .icon-box {
  margin: 0;
  width: 80rpx !important;
  height: 88rpx;
  padding: 10rpx 0;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0);
  position: relative;
}
.footer .icon-box image {
  width: 40rpx;
  height: 40rpx;
}
.footer .icon-box text {
  line-height: 18rpx;
  font-size: 18rpx;
}
.footer .footer-btn {
  width: calc(100% - 80rpx);
  justify-content: flex-end;
}
.footer-btn view {
  margin: 0 10rpx;
  padding: 0 40rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 24rpx;
  font-weight: bolder;
  border-radius: 40rpx;
}
.footer-btn view image {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
}
.footer-btn .btn1 {
  color: #999;
  border: 2rpx solid #F5F5F5;
}
.footer-btn .btn2 {
  color: #fff;
  background: #000;
  border: 2rpx solid #000;
}
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
.popup-box {
  width: calc(100% - 40rpx);
  padding: 20rpx;
  background: #fff;
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
  background: #f8f8f8;
  justify-content: center;
  transform: rotate(45deg);
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
.popup-item {
  width: calc(100% - 20rpx);
  padding: 10rpx;
}
.popup-item .popup-type view {
  margin-right: 20rpx;
  padding: 0 40rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 20rpx;
  font-weight: 700;
  border-radius: 8rpx;
  border: 1px solid #f5f5f5;
}
.popup-item .popup-type .active {
  border: 1px solid #000;
  background: rgba(0, 0, 0, .125);
}
.popup-item .popup-textarea,
.popup-item .popup-adds {
  margin-top: 30rpx;
  width: calc(100% - 40rpx);
  padding: 20rpx;
  border-radius: 8rpx;
  background: #f8f8f8;
}
.popup-item .popup-textarea {
  font-size: 24rpx;
  font-weight: 700;
  min-height: 120rpx;
}
.popup-item .popup-adds {
  display: flex;
  flex-direction: column;
}
.popup-item .popup-adds .a1 {
  font-size: 24rpx;
  font-weight: 700;
}
.popup-item .popup-adds .a2 {
  padding-top: 10rpx;
  color: #999;
  font-size: 20rpx;
  font-weight: 300;
}
.popup-item .popup-wl {
  margin-top: 30rpx;
  width: 100%;
  justify-content: space-between;
}
.popup-item .popup-wl input {
  width: calc(50% - 50rpx);
  padding: 20rpx;
  border-radius: 8rpx;
  background: #f8f8f8;
  font-size: 24rpx;
  font-weight: 700;
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
.bf8 {
  background: #f8f8f8;
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