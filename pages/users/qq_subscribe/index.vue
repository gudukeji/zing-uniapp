<template>
	<view class="subscribe-container">
		<view class="header">
			<text class="title">QQ小程序订阅消息</text>
		</view>
		
		<view class="content">
			<view class="tip">
				<text>为了给您提供更好的服务，请允许接收以下消息通知：</text>
			</view>
			
			<view class="subscribe-list">
				<view class="subscribe-item" v-for="(item, index) in subscribeList" :key="index">
					<view class="item-icon">📢</view>
					<view class="item-content">
						<text class="item-title">{{item.title}}</text>
						<text class="item-desc">{{item.desc}}</text>
					</view>
				</view>
			</view>
			
			<view class="btn-container">
				<button class="subscribe-btn" @tap="requestSubscribe">
					订阅消息
				</button>
				<button class="skip-btn" @tap="skipSubscribe">
					暂不订阅
				</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			subscribeList: [
				{
					title: '订单支付成功通知',
					desc: '订单支付成功后及时通知您'
				},
				{
					title: '订单发货通知',
					desc: '商品发货后第一时间通知您'
				},
				{
					title: '订单收货提醒',
					desc: '提醒您及时确认收货'
				}
			]
		}
	},
	methods: {
		requestSubscribe() {
			// QQ小程序订阅消息
			// #ifdef MP-QQ
			qq.requestSubscribeMessage({
				tmplIds: [
					'订单支付成功模板ID',
					'订单发货成功模板ID', 
					'订单收货成功模板ID'
				],
				success: (res) => {
					console.log('订阅成功:', res);
					this.goBack();
				},
				fail: (err) => {
					console.log('订阅失败:', err);
					this.goBack();
				}
			});
			// #endif
		},
		
		skipSubscribe() {
			this.goBack();
		},
		
		goBack() {
			uni.navigateBack({
				delta: 1
			});
		}
	}
}
</script>

<style scoped>
.subscribe-container {
	padding: 40rpx;
	background: #f5f5f5;
	min-height: 100vh;
}

.header {
	text-align: center;
	margin-bottom: 60rpx;
}

.title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.content {
	background: white;
	border-radius: 20rpx;
	padding: 40rpx;
}

.tip {
	margin-bottom: 40rpx;
	text-align: center;
}

.tip text {
	color: #666;
	font-size: 28rpx;
}

.subscribe-list {
	margin-bottom: 60rpx;
}

.subscribe-item {
	display: flex;
	align-items: center;
	padding: 30rpx 0;
	border-bottom: 1rpx solid #eee;
}

.subscribe-item:last-child {
	border-bottom: none;
}

.item-icon {
	font-size: 40rpx;
	margin-right: 20rpx;
}

.item-content {
	flex: 1;
}

.item-title {
	display: block;
	font-size: 30rpx;
	color: #333;
	margin-bottom: 10rpx;
}

.item-desc {
	display: block;
	font-size: 24rpx;
	color: #999;
}

.btn-container {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.subscribe-btn {
	background: #07c160;
	color: white;
	border: none;
	border-radius: 10rpx;
	padding: 20rpx;
	font-size: 32rpx;
}

.skip-btn {
	background: #f0f0f0;
	color: #666;
	border: none;
	border-radius: 10rpx;
	padding: 20rpx;
	font-size: 32rpx;
}
</style>
