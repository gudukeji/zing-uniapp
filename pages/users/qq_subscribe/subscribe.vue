<template>
	<view class="subscribe-page">
		<view class="header">
			<text class="title">订阅消息设置</text>
		</view>
		
		<view class="subscribe-content">
			<view class="section">
				<text class="section-title">订单相关通知</text>
				
				<view class="setting-item" v-for="(item, index) in subscribeSettings" :key="index">
					<view class="setting-info">
						<text class="setting-name">{{item.name}}</text>
						<text class="setting-desc">{{item.desc}}</text>
					</view>
					<switch :checked="item.enabled" @change="toggleSubscribe(index, $event)" />
				</view>
			</view>
			
			<view class="tips">
				<text class="tips-title">温馨提示：</text>
				<text class="tips-content">
					• 订阅消息可以帮助您及时了解订单状态
					• 您可以随时在此页面管理订阅设置
					• 取消订阅不会影响您的正常购物
				</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			subscribeSettings: [
				{
					name: '订单支付成功',
					desc: '订单支付完成后通知您',
					enabled: true,
					templateId: 'order_pay_success'
				},
				{
					name: '订单发货通知',
					desc: '商品发货时及时通知您',
					enabled: true,
					templateId: 'order_deliver_success'
				},
				{
					name: '订单收货提醒',
					desc: '提醒您确认收货',
					enabled: false,
					templateId: 'order_take_success'
				}
			]
		}
	},
	
	onLoad() {
		this.loadSubscribeSettings();
	},
	
	methods: {
		loadSubscribeSettings() {
			// 从本地存储加载订阅设置
			const settings = uni.getStorageSync('qq_subscribe_settings');
			if (settings) {
				this.subscribeSettings = settings;
			}
		},
		
		toggleSubscribe(index, event) {
			this.subscribeSettings[index].enabled = event.detail.value;
			this.saveSubscribeSettings();
		},
		
		saveSubscribeSettings() {
			// 保存订阅设置到本地存储
			uni.setStorageSync('qq_subscribe_settings', this.subscribeSettings);
			
			uni.showToast({
				title: '设置已保存',
				icon: 'success',
				duration: 1500
			});
		}
	}
}
</script>

<style scoped>
.subscribe-page {
	background: #f5f5f5;
	min-height: 100vh;
}

.header {
	background: white;
	padding: 40rpx;
	text-align: center;
	border-bottom: 1rpx solid #eee;
}

.title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.subscribe-content {
	padding: 40rpx;
}

.section {
	background: white;
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 30rpx;
	display: block;
}

.setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
	border-bottom: none;
}

.setting-info {
	flex: 1;
}

.setting-name {
	display: block;
	font-size: 30rpx;
	color: #333;
	margin-bottom: 10rpx;
}

.setting-desc {
	display: block;
	font-size: 24rpx;
	color: #999;
}

.tips {
	background: white;
	border-radius: 20rpx;
	padding: 40rpx;
}

.tips-title {
	font-size: 28rpx;
	color: #333;
	font-weight: bold;
	display: block;
	margin-bottom: 20rpx;
}

.tips-content {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
}
</style>
