<template>
  <view class="container">
    <navbar></navbar>
    <view class="content-box" :style="{'margin-top': statusBarHeight + titleBarHeight + 'px'}">
      <!-- 支付金额 -->
      <view class="price-box">
        <view class="price-title">支付金额</view>
        <view class="price-value">
          <text>¥</text>
          {{orderMoney}}
        </view>
      </view>
      
      <!-- 支付方式 -->
      <view class="pay-box">
        <view class="pay-title">支付方式</view>
        <view class="pay-list">
          <view 
            class="pay-item df"
            :class="{'pay-active': payType === 1}"
            @tap="changePayType(1)">
            <view class="pay-item-left df">
              <image src="/static/img/icon-wxpay.png"></image>
              <view class="pay-item-name">微信支付</view>
            </view>
            <view class="pay-item-right">
              <image :src="payType === 1 ? '/static/img/checked.png' : '/static/img/unchecked.png'"></image>
            </view>
          </view>
          
          <view 
            class="pay-item df"
            :class="{'pay-active': payType === 2}"
            @tap="changePayType(2)">
            <view class="pay-item-left df">
              <image src="/static/img/icon-alipay.png"></image>
              <view class="pay-item-name">支付宝支付</view>
            </view>
            <view class="pay-item-right">
              <image :src="payType === 2 ? '/static/img/checked.png' : '/static/img/unchecked.png'"></image>
            </view>
          </view>
          
          <view 
            class="pay-item df"
            :class="{'pay-active': payType === 3}"
            @tap="changePayType(3)">
            <view class="pay-item-left df">
              <image src="/static/img/icon-balance.png"></image>
              <view class="pay-item-name">余额支付</view>
            </view>
            <view class="pay-item-right">
              <view class="balance-text" v-if="userInfo.balance">余额：¥{{userInfo.balance}}</view>
              <image :src="payType === 3 ? '/static/img/checked.png' : '/static/img/unchecked.png'"></image>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部按钮 -->
    <view class="footer-box">
      <view class="footer-btn" @tap="submitPay">确认支付</view>
    </view>
    
    <!-- 支付密码弹窗 -->
    <uni-popup ref="passwordPopup" type="bottom">
      <view class="password-box">
        <view class="password-title">请输入支付密码</view>
        <view class="password-close" @tap="closePassword">
          <image src="/static/img/close.png"></image>
        </view>
        <view class="password-price">¥{{orderMoney}}</view>
        
        <view class="password-input">
          <view class="input-item" v-for="(item, index) in passwordArray" :key="index">
            <text v-if="passwordValue.length > index">●</text>
          </view>
          
          <input 
            class="pwd-input"
            type="number"
            maxlength="6"
            focus="true"
            :value="passwordValue"
            @input="passwordInput"
          />
        </view>
        
        <view class="password-tip">忘记密码？<text @tap="toResetPassword">重置密码</text></view>
      </view>
    </uni-popup>
    
    <!-- 提示弹窗 -->
    <uni-popup ref="tipsPopup" type="center">
      <view class="tips-box">
        <view class="tips-title">{{tipsTitle}}</view>
        <view class="tips-btn df">
          <view @tap="closeTipsPopup">确定</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>

import { request } from '@/config/util.js'

export default {
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      orderId: 0,
      orderMoney: '0.00',
      payType: 1, // 1-微信支付 2-支付宝支付 3-余额支付
      userInfo: {
        balance: '0.00'
      },
      passwordValue: '',
      passwordArray: new Array(6),
      tipsTitle: ''
    }
  },
  onLoad(options) {
    if (options.id && options.id > 0) {
      this.orderId = options.id
      this.orderMoney = options.money || '0.00'
      this.getUserInfo()
    } else {
      this.opTipsPopup('参数错误')
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },
  methods: {
    // 获取用户信息
    getUserInfo() {
      let self = this
      request(api.userInfoUrl).then(function(res) {
        if (res.code == 200) {
          self.userInfo = res.data
        }
      })
    },
    // 切换支付方式
    changePayType(type) {
      this.payType = type
    },
    // 提交支付
    submitPay() {
      if (this.payType === 3) {
        // 余额支付，需要验证密码
        this.openPassword()
      } else {
        // 微信支付或支付宝支付
        this.callPayment()
      }
    },
    // 调起支付
    callPayment() {
      let self = this
      uni.showLoading({
        mask: true
      })
      
      request(api.payOrderUrl, {
        id: self.orderId,
        pay_type: self.payType
      }).then(function(res) {
        uni.hideLoading()
        
        if (res.code == 200) {
          if (self.payType === 1) {
            // 微信支付
            uni.requestPayment({
              provider: 'wxpay',
              ...res.data,
              success: function() {
                self.paySuccess()
              },
              fail: function(err) {
                console.log('支付失败：', err)
              }
            })
          } else if (self.payType === 2) {
            // 支付宝支付
            uni.requestPayment({
              provider: 'alipay',
              ...res.data,
              success: function() {
                self.paySuccess()
              },
              fail: function(err) {
                console.log('支付失败：', err)
              }
            })
          } else if (self.payType === 3) {
            // 余额支付
            self.closePassword()
            self.paySuccess()
          }
        } else {
          self.opTipsPopup(res.msg)
        }
      })
    },
    // 支付成功
    paySuccess() {
      uni.showToast({
        title: '支付成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/order/success?id=' + this.orderId
        })
      }, 1500)
    },
    // 打开密码输入框
    openPassword() {
      this.passwordValue = ''
      this.$refs.passwordPopup.open()
    },
    // 关闭密码输入框
    closePassword() {
      this.$refs.passwordPopup.close()
    },
    // 密码输入
    passwordInput(e) {
      this.passwordValue = e.detail.value
      
      // 密码输入完成后自动提交
      if (this.passwordValue.length === 6) {
        // 验证支付密码
        let self = this
        
        uni.showLoading({
          mask: true
        })
        
        request(api.verifyPasswordUrl, {
          password: self.passwordValue
        }).then(function(res) {
          uni.hideLoading()
          
          if (res.code == 200) {
            // 密码正确，继续支付流程
            self.callPayment()
          } else {
            // 密码错误
            self.passwordValue = ''
            self.opTipsPopup(res.msg)
          }
        })
      }
    },
    // 跳转重置密码
    toResetPassword() {
      this.closePassword()
      uni.navigateTo({
        url: '/pages/center/password'
      })
    },
    // 提示弹窗
    opTipsPopup(title) {
      this.tipsTitle = title
      this.$refs.tipsPopup.open()
    },
    // 关闭提示弹窗
    closeTipsPopup() {
      this.$refs.tipsPopup.close()
    }
  }
}
</script>

<style>
.container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 120rpx;
}
.content-box {
  width: 100%;
}
.price-box {
  padding: 60rpx 30rpx;
  background: #fff;
  text-align: center;
}
.price-box .price-title {
  font-size: 28rpx;
  color: #666;
}
.price-box .price-value {
  margin-top: 20rpx;
  font-size: 80rpx;
  font-weight: 700;
}
.price-value text {
  font-size: 40rpx;
  margin-right: 10rpx;
}
.pay-box {
  margin: 20rpx 30rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 30rpx;
}
.pay-box .pay-title {
  font-size: 30rpx;
  font-weight: 700;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #f5f5f5;
}
.pay-box .pay-list {
  margin-top: 20rpx;
}
.pay-list .pay-item {
  padding: 20rpx 0;
  justify-content: space-between;
  border-bottom: 1px solid #f5f5f5;
}
.pay-list .pay-item:last-child {
  border-bottom: none;
}
.pay-item .pay-item-left {
  flex: 1;
}
.pay-item-left image {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}
.pay-item-left .pay-item-name {
  font-size: 28rpx;
}
.pay-item .pay-item-right {
  display: flex;
  align-items: center;
}
.pay-item-right .balance-text {
  margin-right: 20rpx;
  font-size: 24rpx;
  color: #666;
}
.pay-item-right image {
  width: 40rpx;
  height: 40rpx;
}
.footer-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: calc(100% - 80rpx);
  padding: 20rpx 40rpx;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}
.footer-box .footer-btn {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  background: #000;
  border-radius: 50rpx;
  margin: 10rpx 0;
}
.password-box {
  position: relative;
  padding: 30rpx;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
}
.password-box .password-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 20rpx;
}
.password-box .password-close {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f8f8f8;
  justify-content: center;
  transform: rotate(45deg);
}
.password-close image {
  width: 20rpx;
  height: 20rpx;
}
.password-box .password-price {
  margin: 30rpx 0;
  text-align: center;
  font-size: 40rpx;
  font-weight: 700;
}
.password-box .password-input {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 0 auto;
  width: 600rpx;
  height: 100rpx;
}
.password-input .input-item {
  width: 90rpx;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 40rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
}
.password-input .pwd-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  z-index: 2;
}
.password-box .password-tip {
  margin: 30rpx 0;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}
.password-tip text {
  color: #000;
  text-decoration: underline;
}
.tips-box {
  width: 500rpx;
  padding: 50rpx 30rpx;
  background: #fff;
  border-radius: 20rpx;
}
.tips-box .tips-title {
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
}
.tips-box .tips-btn {
  margin-top: 30rpx;
  justify-content: center;
}
.tips-btn view {
  padding: 0 60rpx;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
  background: #000;
  border-radius: 70rpx;
}
.df {
  display: flex;
  align-items: center;
}
</style> 