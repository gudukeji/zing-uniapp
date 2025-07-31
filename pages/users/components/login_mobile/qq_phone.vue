<template>
	<view v-if="isPhoneBox">
		<view class="mobile-bg"></view>
		<view class="mobile-mask animated" :class="{slideInUp:isUp}">
			<view class="info-box">
				<image :src="logoUrl"></image>
				<view class="title">{{$t(`获取授权`)}}</view>
				<view class="sub-title">{{$t(`获取手机号授权`)}}</view>
			</view>
			<view class="btn-submit df" open-type="getPhoneNumber" @getphonenumber="getphonenumber">{{$t(`获取手机号`)}}</view>
		</view>
	</view>
</template>
<script>
	const app = getApp();
	import Routine from '@/libs/routine';
	import {
		loginMobile,
		getCodeApi,
		getUserInfo
	} from "@/api/user";
	import {
		getUserSocialInfo
	} from '@/api/social.js';
	import {
		getLogo,
		silenceAuth,
		routineBindingPhone
	} from '@/api/public';
	import {
		qqAuthBindingPhone
	} from '@/api/qq';
	export default {
		name: 'qq_phone',
		props: {
			isPhoneBox: {
				type: Boolean,
				default: false
			},
			logoUrl: {
				type: String,
				default: ''
			},
			authKey: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				isUp: false,
				userInfo: {},
			};
		},
		watch: {
			isPhoneBox: {
				handler(newV, oldV) {
					this.isUp = newV;
				},
				deep: true
			}
		},
		methods: {
			// QQ小程序获取手机号码
			getphonenumber(e) {
				uni.showLoading({
					title: this.$t(`正在登录中`)
				});
				Routine.getCode()
					.then(code => {
						this.getUserPhoneNumber(e.detail.encryptedData, e.detail.iv, code);
					})
					.catch(error => {
						uni.hideLoading();
					});
			},
			// QQ小程序获取手机号码回调
			getUserPhoneNumber(encryptedData, iv, code) {
				qqAuthBindingPhone(code, iv, encryptedData, app.globalData.code, app.globalData.spid, this.authKey)
					.then(res => {
						let time = res.data.expires_time - this.$Cache.time();
						this.$store.commit('LOGIN', {
							token: res.data.token,
							time: time
						});
						this.$emit('loginSuccess', {
							isStatus: true,
							new_user: res.data.userInfo.new_user
						});
					})
					.catch(res => {
						uni.hideLoading();
					});
			},
			/**
			 * 获取个人用户信息
			 */
			getUserInfo() {
				let that = this;
				// 先获取基础用户信息
				getUserInfo().then(res => {
					that.userInfo = res.data;
					that.$store.commit('SETUID', res.data.uid);
					
					// 再获取用户社交信息（拓展信息）
					getUserSocialInfo()
						.then((socialRes) => {
							uni.hideLoading();
							// 更新用户社交信息到Vuex
							if (socialRes.data) {
								that.$store.commit('UPDATE_USERINFO', socialRes.data);
							}
							
							that.$emit('loginSuccess', {
								isStatus: true,
								new_user: res.data.new_user
							});
						})
						.catch(() => {
							// 即使社交信息获取失败，仍然继续
							uni.hideLoading();
							that.$emit('loginSuccess', {
								isStatus: true,
								new_user: res.data.new_user
							});
						});
				}).catch(err => {
					uni.hideLoading();
					uni.showToast({
						title: err.msg,
						icon: 'none',
						duration: 2000
					});
				});
			}
		}
	};
</script>
<style lang="scss" scoped>
	.mobile-bg {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 95;
		background-color: rgba(0, 0, 0, 0.4);
	}

	.mobile-mask {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		min-height: 600rpx;
		background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
		z-index: 100;
		padding: 60rpx 60rpx 100rpx 60rpx;
	}

	.info-box {
		text-align: center;
		margin-bottom: 60rpx;
	}

	.info-box image {
		width: 120rpx;
		height: 120rpx;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
	}

	.info-box .title {
		font-size: 32rpx;
		font-weight: 700;
		color: #000;
		margin-bottom: 20rpx;
	}

	.info-box .sub-title {
		font-size: 26rpx;
		color: #999;
	}

	.btn-submit {
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

	.df {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.slideInUp {
		animation: slideInUp 0.3s ease-out;
	}

	@keyframes slideInUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
</style>
