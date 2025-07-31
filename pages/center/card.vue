<template>
  <view class="container">
    <view class="nav-bar bf8" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="bar-box df" :style="{'height': titleBarHeight + 'px', 'width': '100%'}">
        <view class="bar-back df" @tap="navBack">
          <image src="/static/img/back.png" style="width:34rpx;height:34rpx"></image>
        </view>
        <view class="bar-title ohto">卡券</view>
      </view>
      <view class="nav-box df">
        <view 
          v-for="(item, index) in barList" 
          :key="index" 
          class="nav-item df" 
          @tap="barClick" 
          :data-idx="index">
          <text :style="{'color': index == barIdx ? '#000' : '#999', 'font-size': index == barIdx ? '28rpx' : '26rpx'}">
            {{ item }}
          </text>
          <view :style="{'opacity': index == barIdx ? 1 : 0}" class="nav-line"></view>
        </view>
      </view>
    </view>
    <view class="content" :style="{'margin-top': 'calc(' + (statusBarHeight + titleBarHeight) + 'px + 90rpx)'}">
      <view v-if="isEmpty" class="empty-box df">
        <image src="/static/img/empty.png" mode="aspectFill"/>
        <view class="e1">暂无卡券</view>
        <view class="e2">空空如也，等待探索</view>
      </view>
      <block v-else>
        <view v-for="(item, index) in list" :key="item.id" class="coupon">
          <image class="coupon-bg" src="/static/img/yhq.png"></image>
          <view class="coupon-item">
            <view class="corner-mark">{{ item.subscript }}</view>
            <view class="t1">{{ item.price }} 元</view>
            <view class="t2">{{ item.intro }}</view>
          </view>
          <view v-if="barIdx == 0" class="validity">领取后 {{ item.validity }} 天内可用</view>
          <view v-if="barIdx == 1" class="validity">有效期：{{ item.neck_create_time }} - {{ item.expire_time }}</view>
          <view v-if="barIdx == 0" class="coupon-btn" @tap="goodsCardNeck" :data-type="1" :data-id="item.id">立即领取</view>
          <view v-if="item.is_usable" class="coupon-err df">已使用或已失效</view>
        </view>
      </block>
      <uni-load-more :status="loadStatus"></uni-load-more>
    </view>
    <view class="code-box df" @tap="exchangeClick(true)">
      <image src="/static/img/kq.png"></image>
      <text>兑换卡券</text>
    </view>
    <uni-popup ref="exchangePopup" type="bottom" :safe-area="false">
      <view class="popup-box">
        <view class="popup-top df">
          <view class="popup-title">
            <view class="t1">兑换卡券</view>
            <view class="t2">一张兑换码仅可使用一次，兑换成功后失效</view>
          </view>
          <view class="popup-close df" @tap="exchangeClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
          </view>
        </view>
        <input class="exchange-input" placeholder="请输入兑换码" cursor-spacing="30px" v-model="code"/>
        <view class="exchange-item">
          <view>1.使用兑换码请注意检查兑换码是否在有效期（客服告知或实体卡卡面为准）内，到期未使用则自动作废；</view>
          <view>2.兑换码确认兑换后，系统会自动为您添加对应优惠券，过程不可逆；</view>
        </view>
        <view class="popup-btn" @tap="goodsCardNeck" :data-type="2" :data-id="0">确认兑换</view>
      </view>
    </uni-popup>
    <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
      <view class="tips-box df">
        <view class="tips-item">{{ tipsTitle }}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import request from '@/utils/request.js'
import * as api from '@/config/api.js'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'

const app = getApp();

export default {
  components: {
    uniLoadMore,
    uniPopup
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      barList: ["领券中心", "我的卡券"],
      barIdx: 0,
      list: [],
      page: 1,
      isEmpty: false,
      loadStatus: "loading",
      code: "",
      isThrottling: true,
      isCode: false,
      tipsTitle: "",
      // Mock数据
      mockCoupons: {
        center: [
          {
            id: 1,
            subscript: "满减券",
            price: "50",
            intro: "满200元可用",
            validity: "30",
            is_usable: false
          },
          {
            id: 2,
            subscript: "折扣券",
            price: "30",
            intro: "全场通用",
            validity: "15",
            is_usable: false
          },
          {
            id: 3,
            subscript: "新人券",
            price: "10",
            intro: "新用户专享",
            validity: "7",
            is_usable: false
          }
        ],
        my: [
          {
            id: 4,
            subscript: "满减券",
            price: "100",
            intro: "满300元可用",
            neck_create_time: "2023-01-01",
            expire_time: "2023-12-31",
            is_usable: false
          },
          {
            id: 5,
            subscript: "折扣券",
            price: "20",
            intro: "特定商品可用",
            neck_create_time: "2023-01-15",
            expire_time: "2023-06-30",
            is_usable: true
          }
        ]
      }
    }
  },
  onLoad(options) {
    if (options.type) {
      this.barIdx = parseInt(options.type);
    }
    this.goodsCardList();
  },
  methods: {
    goodsCardList() {
      let that = this;
      
      // 尝试使用真实API
      if (api.default && api.default.api && api.default.api.goodsCardListUrl) {
        request(api.default.api.goodsCardListUrl, {
          type: that.barIdx,
          page: that.page
        }).then(function(res) {
          that.isThrottling = true;
          that.loadStatus = "more";
          
          if (res.data.data.length > 0) {
            if (that.page == 1) {
              that.list = res.data.data;
            } else {
              that.list = that.list.concat(res.data.data);
            }
            that.page = res.data.current_page;
            that.isEmpty = false;
          } else if (that.page == 1) {
            that.isEmpty = true;
          }
        });
      } else {
        // 使用Mock数据
        setTimeout(() => {
          that.isThrottling = true;
          that.loadStatus = "more";
          
          // 根据当前tab返回不同的数据
          const mockData = that.barIdx == 0 ? that.mockCoupons.center : that.mockCoupons.my;
          
          // 模拟分页
          const pageSize = 5;
          const startIndex = (that.page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const pageData = mockData.slice(startIndex, endIndex);
          
          if (pageData.length > 0) {
            if (that.page == 1) {
              that.list = pageData;
            } else {
              that.list = that.list.concat(pageData);
            }
            that.isEmpty = false;
          } else if (that.page == 1) {
            that.isEmpty = true;
          }
        }, 500);
      }
    },
    
    barClick(e) {
      if (this.isThrottling) {
        this.isThrottling = false;
        this.barIdx = e.currentTarget.dataset.idx;
        this.page = 1;
        this.goodsCardList();
      }
    },
    
    goodsCardNeck(e) {
      let that = this;
      const dataset = e.currentTarget.dataset;
      
      // 验证兑换码
      if (dataset.type == 2 && !that.code) {
        return that.opTipsPopup("请输入兑换码！");
      }
      
      // 尝试使用真实API
      if (api.default && api.default.api && api.default.api.goodsCardNeckUrl) {
        request(api.default.api.goodsCardNeckUrl, {
          id: dataset.id,
          type: dataset.type,
          code: that.code
        }, "POST").then(function(res) {
          that.opTipsPopup(res.msg);
          if (res.code == 200) {
            app.globalData.isCenterPage = true;
            if (dataset.type == 2) {
              that.barIdx = 1;
            }
            that.list = [];
            that.page = 1;
            that.goodsCardList();
            that.$refs.exchangePopup.close();
          }
        });
      } else {
        // 使用Mock数据
        setTimeout(() => {
          if (dataset.type == 1) {
            // 领取优惠券
            const coupon = that.mockCoupons.center.find(item => item.id === dataset.id);
            if (coupon) {
              // 创建一个新的我的优惠券
              const newCoupon = {
                id: 100 + that.mockCoupons.my.length,
                subscript: coupon.subscript,
                price: coupon.price,
                intro: coupon.intro,
                    neck_create_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    expire_time: new Date(Date.now() + coupon.validity * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
                is_usable: false
              };
              
              that.mockCoupons.my.unshift(newCoupon);
              that.opTipsPopup("领取成功");
            }
          } else if (dataset.type == 2) {
            // 兑换优惠券
            // 验证兑换码格式（模拟）
            const validCode = /^[A-Za-z0-9]{6,12}$/.test(that.code);
            
            if (validCode) {
              // 创建一个新的兑换券
              const newCoupon = {
                id: 200 + that.mockCoupons.my.length,
                subscript: "兑换券",
                price: Math.floor(Math.random() * 100) + 10,
                intro: "兑换码" + that.code + "专享",
                    neck_create_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    expire_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
                is_usable: false
              };
              
              that.mockCoupons.my.unshift(newCoupon);
              that.opTipsPopup("兑换成功");
              that.barIdx = 1;
              that.list = [];
              that.page = 1;
              that.goodsCardList();
              that.$refs.exchangePopup.close();
              that.code = "";
            } else {
              that.opTipsPopup("兑换码无效");
            }
          }
        }, 500);
      }
    },
    
    exchangeClick(isOpen) {
      if (isOpen) {
        this.$refs.exchangePopup.open();
        this.isCode = true;
      } else {
        this.$refs.exchangePopup.close();
        this.isCode = false;
      }
    },
    
    opTipsPopup(msg) {
      let that = this;
      that.tipsTitle = msg;
      that.$refs.tipsPopup.open();
      setTimeout(function() {
        that.$refs.tipsPopup.close();
      }, 2000);
    },
    
    navBack() {
      if (getCurrentPages().length > 1) {
        uni.navigateBack();
      } else {
        uni.switchTab({
          url: "/pages/tabbar/center"
        });
      }
    },
    
    // 辅助函数：格式化日期为datetime格式
    formatDate(date) {
      // 直接返回ISO字符串格式化为datetime
      return date.toISOString().slice(0, 19).replace('T', ' ');
    }
  },
  onReachBottom() {
    if (this.list.length) {
      this.page = this.page + 1;
      this.loadStatus = "loading";
      this.goodsCardList();
    }
  }
}
</script>

<style>
page {
	background: #f8f8f8;
	padding-bottom: 100rpx;
}

.container {
	width: 100%;
}

.nav-bar {
	position: fixed;
	top: 0;
	left: 0;
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
	max-width: 60%;
	font-size: 32rpx;
	font-weight: 700;
}

.nav-box {
	width: 100%;
	height: 80rpx;
}

.nav-box .nav-item {
	padding: 0 30rpx;
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

.code-box {
	position: fixed;
	z-index: 99;
	left: 30rpx;
	bottom: max(env(safe-area-inset-bottom), 30rpx);
	width: calc(100% - 60rpx);
	height: 100rpx;
	color: #fff;
	font-size: 24rpx;
	font-weight: 700;
	background: #000;
	border-radius: 100rpx;
	justify-content: center;
}

.code-box image {
	margin-right: 8rpx;
	width: 34rpx;
	height: 34rpx;
}

.content {
	width: calc(100% - 60rpx);
	padding: 30rpx;
}

.coupon {
	margin-bottom: 30rpx;
	width: 100%;
	border-radius: 8rpx;
	background: #fff;
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

.coupon .coupon-item {
	z-index: 2;
	width: calc(100% - 80rpx);
	padding: 50rpx 40rpx 20rpx;
	border-bottom: 2rpx dashed #f8f8f8;
	position: relative;
}

.coupon-item .corner-mark {
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

.coupon-item .t1 {
	width: calc(100% - 200rpx);
	color: #000;
	font-size: 48rpx;
	font-weight: 700;
}

.coupon-item .t2 {
	width: calc(100% - 200rpx);
	margin: 8rpx 0;
	color: #444;
	font-size: 24rpx;
}

.coupon .coupon-btn {
	position: absolute;
	z-index: 9;
	top: calc(50% - 30rpx);
	right: 30rpx;
	width: 140rpx;
	height: 60rpx;
	line-height: 60rpx;
	text-align: center;
	font-size: 20rpx;
	font-weight: 700;
	border-radius: 50rpx;
	color: #fff;
	background: #000;
}

.coupon .validity {
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

.exchange-input {
	margin: 30rpx 10rpx;
	padding: 0 30rpx;
	width: calc(100% - 80rpx);
	height: 100rpx;
	font-size: 28rpx;
	font-weight: 700;
	text-align: center;
	border: 4rpx solid #f5f5f5;
	border-radius: 30rpx;
}

.exchange-item view {
	margin: 10rpx;
	width: calc(100% - 20rpx);
	color: #999;
	font-size: 20rpx;
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

.bf8 {
	background: #f8f8f8;
}
</style> 