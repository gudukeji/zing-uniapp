<template>
  <view class="container">
    <view class="content-box">
      <!-- 调试信息 -->
      <view v-if="false" class="debug-info" style="padding: 20rpx; background: #f0f0f0; margin-bottom: 20rpx; border-radius: 10rpx;">
        <text style="font-size: 24rpx; color: #666;">调试信息：</text>
        <text style="font-size: 24rpx; color: #333;">signList长度: {{signList.length}}</text>
        <text style="font-size: 24rpx; color: #333;">loading: {{loading}}</text>
        <text style="font-size: 24rpx; color: #333;">isLogin: {{isLogin}}</text>
        <text style="font-size: 24rpx; color: #333;">数据: {{JSON.stringify(signList)}}</text>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading && signList.length === 0" class="loading-container">
        <view class="loading-indicator"></view>
      </view>

      <!-- 签到记录列表 -->
      <view v-else-if="signList.length > 0" class="sign-list">
        <view v-for="(item, index) in signList" :key="index" class="month-group">
          <!-- 月份标题 -->
          <view class="month-title">{{item.month}}</view>

          <!-- 签到记录项 -->
          <view class="sign-items">
            <view
              v-for="(record, recordIndex) in item.list"
              :key="recordIndex"
              class="sign-item"
            >
              <view class="sign-info">
                <view class="sign-title">{{$t(record.title)}}</view>
                <view class="sign-date">{{record.add_time}}</view>
              </view>
              <view class="sign-reward">
                <text class="reward-text">+{{record.number}}</text>
                <image class="reward-icon" src="/static/img/sign-icon-01.png"></image>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部加载状态 -->
        <view class="load-more">
          <view v-if="loading" class="loading-text">加载中...</view>
          <view v-else-if="loadend" class="no-more-text">没有更多内容</view>
          <view v-else class="load-more-text" @tap="getSignMoneList">加载更多</view>
        </view>
      </view>

      <!-- 空状态 -->
      <emptyPage
        v-else
        title="暂无签到记录"
        description="快去签到获得奖励吧"
        buttonText="去签到"
        @buttonClick="goToSign"
      />
    </view>

    <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
      <view class="tips-box df">
        <view class="tips-item bfh">{{ tipsTitle }}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
	import { getSignMonthList } from '@/api/user.js';
	import { toLogin } from '@/libs/login.js';
	 import { mapGetters } from "vuex";
	 import emptyPage from '@/components/emptyPage/emptyPage.vue';
	 // #ifdef MP
	 import authorize from '@/components/Authorize';
	 // #endif
	export default {
		components: {
			emptyPage,
			// #ifdef MP
			authorize
			// #endif
		},
		data() {
			return {
				tipsTitle: '',
				loading: false,
				loadend: false,
				loadtitle: this.$t(`加载更多`),
				page: 1,
				limit: 8,
				signList: [],
				isAuto: false, //没有授权的不会自动授权
				isShowAuth: false //是否隐藏授权
			};
		},
		computed: mapGetters(['isLogin']),
		watch:{
			isLogin:{
				handler:function(newV,oldV){
					if(newV){
						this.getSignMoneList();
					}
				},
				deep:true
			}
		},
		onLoad(){
			if(this.isLogin){
				this.getSignMoneList();
			}else{
				toLogin();
			}
		},
		onPullDownRefresh() {
			this.page = 1;
			this.loadend = false;
			this.signList = [];
			this.getSignMoneList();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		onReachBottom: function () {
		    if (!this.loadend && !this.loading) {
		      this.getSignMoneList();
		    }
		  },
		methods: {
			// 显示提示信息
			opTipsPopup(msg) {
				this.tipsTitle = msg;
				this.$refs.tipsPopup.open();
				setTimeout(() => {
					this.$refs.tipsPopup.close();
				}, 2000);
			},

			/**
			 *
			 * 授权回调
			*/
			onLoadFun:function(){
				this.getSignMoneList();
			},
			// 授权关闭
			authColse:function(e){
				this.isShowAuth = e
			},
			  /**
			     * 获取签到记录列表
			    */
			    getSignMoneList:function(){
			      let that=this;
			      if(that.loading) return;
			      if(that.loadend) return;
				  that.loading = true;
				  that.loadtitle = "";
			      getSignMonthList({ page: that.page, limit: that.limit }).then(res=>{
			        console.log('签到记录API响应:', res);
			        let list = res.data || [];
			        let loadend = list.length < that.limit;

			        // 如果是第一页，直接赋值；否则合并数据
			        if (that.page === 1) {
			          that.signList = list;
			        } else {
			          that.signList = that.signList.concat(list);
			        }

					that.$set(that,'signList',that.signList);
					that.page++;
					that.loadend = loadend;
					that.loading = false;
					that.loadtitle = loadend ? that.$t(`我也是有底线的`) : that.$t(`加载更多`);

					console.log('处理后的签到列表:', that.signList);
			      }).catch(err=>{
			        console.error('获取签到记录失败:', err);
					that.loading = false;
					that.loadtitle = that.$t(`加载更多`);
			      });
			    },

			    // 去签到
			    goToSign() {
			      uni.navigateTo({
			        url: '/pages/users/user_sgin/index'
			      });
			    }
		}
	}
</script>

<style>
.content-box {
  width: calc(100% - 60rpx);
  padding: 30rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

/* 加载中状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60rpx;
  margin-bottom: 20rpx;
}
.loading-indicator {
  width: 30rpx;
  height: 30rpx;
  border: 3rpx solid #f3f3f3;
  border-top: 3rpx solid #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 签到记录列表样式 */
.sign-list {
  width: 100%;
}

.month-group {
  margin-bottom: 40rpx;
}

.month-title {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
  padding-left: 10rpx;
}

.sign-items {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.sign-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.sign-item:last-child {
  border-bottom: none;
}

.sign-info {
  flex: 1;
}

.sign-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.sign-date {
  font-size: 26rpx;
  color: #999;
}

.sign-reward {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.reward-text {
  font-size: 32rpx;
  color: #ff6b35;
  font-weight: bold;
}

.reward-icon {
  width: 40rpx;
  height: 40rpx;
}

/* 底部加载状态 */
.load-more {
  text-align: center;
  padding: 40rpx 0;
}

.loading-text,
.no-more-text,
.load-more-text {
  font-size: 28rpx;
  color: #999;
}

.load-more-text {
  color: #007aff;
}

/* 空状态 */
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

.df {
  display: flex;
  align-items: center;
}
.bfh {
  background: #000;
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
}
.tips-box {
  justify-content: center;
  width: 100%;
}
</style>
