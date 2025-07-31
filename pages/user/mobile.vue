<template>
  <view class="container">
    <navbar></navbar>
    <view class="content-box" :style="{'margin-top': statusBarHeight + titleBarHeight + 'px'}">
      <view class="login-box">
        <view class="title">绑定手机号</view>
        <view class="sub-title">为了提供更好的服务，需要绑定您的手机号</view>
        
        <view class="input-item df">
          <view class="icon-mobile">
            <image src="/static/img/icon-mobile.png"></image>
          </view>
          <input type="number" maxlength="11" placeholder="请输入手机号码" v-model="mobile" @input="mobileInput"/>
        </view>
        
        <view class="input-item df">
          <view class="icon-code">
            <image src="/static/img/icon-code.png"></image>
          </view>
          <input type="number" maxlength="6" placeholder="验证码" v-model="code"/>
          <view :class="['send-code', isSend ? 'active' : '']" @tap="getCode">{{sendText}}</view>
        </view>
        
        <view class="tips-text">* 绑定后，可使用手机号码直接登录</view>
        
        <view class="btn-submit df" @tap="submitClick">确认绑定</view>
        
        <view class="agreement">
          <checkbox-group @change="checkboxChange">
            <label class="df">
              <checkbox :checked="isCheck" style="transform:scale(0.7)"/>
              <view class="agreement-text">
                已阅读并同意
                <text @tap.stop="toAgreement('privacy')">《隐私协议》</text>
                <text @tap.stop="toAgreement('user')">《用户协议》</text>
              </view>
            </label>
          </checkbox-group>
        </view>
      </view>
    </view>
    
    <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
      <view class="tips-box df">
        <view class="tips-item">{{tipsTitle}}</view>
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
      mobile: '',
      code: '',
      isSend: true,
      sendText: '获取验证码',
      second: 60,
      isCheck: false,
      tipsTitle: ''
    }
  },
  methods: {
    mobileInput(e) {
      this.mobile = e.detail.value
    },
    getCode() {
      let self = this
      if (!self.isSend) return
      
      if (!self.mobile || !/^1[3-9]\d{9}$/.test(self.mobile)) {
        return self.opTipsPopup('请输入正确的手机号')
      }
      
      self.isSend = false
      request(api.sendMsgCodeUrl, {
        mobile: self.mobile
      }, 'POST').then(function(res) {
        if (res.code == 200) {
          self.opTipsPopup('验证码发送成功')
          self.timer()
        } else {
          self.isSend = true
          self.opTipsPopup(res.msg)
        }
      })
    },
    timer() {
      let self = this
      let interval = setInterval(function() {
        self.second--
        self.sendText = self.second + 's'
        
        if (self.second <= 0) {
          clearInterval(interval)
          self.sendText = '获取验证码'
          self.second = 60
          self.isSend = true
        }
      }, 1000)
    },
    checkboxChange(e) {
      this.isCheck = e.detail.value.length > 0
    },
    submitClick() {
      let self = this
      
      if (!self.mobile || !/^1[3-9]\d{9}$/.test(self.mobile)) {
        return self.opTipsPopup('请输入正确的手机号')
      }
      
      if (!self.code) {
        return self.opTipsPopup('请输入验证码')
      }
      
      if (!self.isCheck) {
        return self.opTipsPopup('请阅读并同意协议')
      }
      
      uni.showLoading({
        mask: true
      })
      
      request(api.bindMobileUrl, {
        mobile: self.mobile,
        code: self.code
      }, 'POST').then(function(res) {
        uni.hideLoading()
        
        if (res.code == 200) {
          self.opTipsPopup('绑定成功')
          getApp().globalData.isAddress = true
          
          setTimeout(function() {
            uni.navigateBack()
          }, 1500)
        } else {
          self.opTipsPopup(res.msg)
        }
      })
    },
    toAgreement(type) {
      uni.navigateTo({
        url: '/pages/user/agreement?type=' + type
      })
    },
    opTipsPopup(msg) {
      let self = this
      self.tipsTitle = msg
      self.$refs.tipsPopup.open()
      
      setTimeout(function() {
        self.$refs.tipsPopup.close()
      }, 2000)
    }
  }
}
</script>

<style>
.container {
  width: 100%;
  background: #fff;
}
.login-box {
  width: calc(100% - 60rpx);
  margin: 30rpx;
}
.login-box .title {
  font-size: 40rpx;
  font-weight: 700;
  color: #000;
}
.login-box .sub-title {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #999;
}
.login-box .input-item {
  margin-top: 60rpx;
  padding: 0 30rpx;
  width: calc(100% - 60rpx);
  height: 100rpx;
  border-radius: 100rpx;
  background: #f8f8f8;
  position: relative;
}
.input-item .icon-mobile,
.input-item .icon-code {
  margin-right: 20rpx;
  width: 36rpx;
  height: 36rpx;
}
.input-item .icon-mobile image,
.input-item .icon-code image {
  width: 100%;
  height: 100%;
}
.input-item input {
  width: calc(100% - 56rpx);
  height: 100%;
  font-size: 28rpx;
}
.input-item .send-code {
  position: absolute;
  right: 30rpx;
  width: 180rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  background: #000;
  color: #fff;
  border-radius: 30rpx;
}
.input-item .send-code.active {
  background: #f5f5f5;
  color: #999;
}
.login-box .tips-text {
  margin-top: 30rpx;
  font-size: 24rpx;
  color: #999;
}
.login-box .btn-submit {
  margin-top: 60rpx;
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
  background: #000;
  color: #fff;
  border-radius: 100rpx;
  justify-content: center;
}
.login-box .agreement {
  margin-top: 30rpx;
  font-size: 24rpx;
  color: #999;
}
.agreement .agreement-text {
  font-size: 24rpx;
  color: #999;
}
.agreement-text text {
  color: #576b95;
}
.tips-box {
  margin: 0 auto;
  padding: 30rpx;
  font-size: 28rpx;
  color: #fff;
  background: rgba(0,0,0,.6);
  border-radius: 12rpx;
  justify-content: center;
}
.df {
  display: flex;
  align-items: center;
}
</style> 