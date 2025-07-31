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
	export default {
		name: 'routine_phone',
		props: {
			isPhoneBox: {
				type: Boolean,
				default: false,
			},
			logoUrl: {
				type: String,
				default: '',
			},
			authKey: {
				type: String,
				default: '',
			}
		},

		data() {
			return {
				keyCode: '',
				account: '',
				codeNum: '',
				isStatus: false
			}
		},
		mounted() {},
		methods: {
			// #ifdef MP
			// 小程序获取手机号码
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
			// 小程序获取手机号码回调
			getUserPhoneNumber(encryptedData, iv, code) {
				routineBindingPhone({
						encryptedData: encryptedData,
						iv: iv,
						code: code,
						spread_spid: app.globalData.spid,
						spread_code: app.globalData.code,
						key: this.authKey
					})
					.then(res => {
						let time = res.data.expires_time - this.$Cache.time();
						this.$store.commit('LOGIN', {
							token: res.data.token,
							time: time
						});
						// this.getUserInfo();
						this.$emit('loginSuccess', {
							isStatus: true,
							new_user: res.data.userInfo.new_user
						})
					})
					.catch(res => {
						uni.hideLoading();
					});
			},
			/**
			 * 获取个人用户信息
			 */
			getUserInfo: function() {
				let that = this;
				// 先获取基础用户信息
				getUserInfo().then(res => {
					that.userInfo = res.data
					that.$store.commit("SETUID", res.data.uid);
					
					// 再获取用户社交信息（拓展信息）
					getUserSocialInfo()
						.then((socialRes) => {
							uni.hideLoading();
							// 更新用户社交信息到Vuex
							if (socialRes.data) {
								that.$store.commit("UPDATE_USERINFO", socialRes.data);
							}
							
							that.isStatus = true
							this.close(res.data.new_user || 0)
						})
						.catch(() => {
							// 即使社交信息获取失败，仍然继续
							uni.hideLoading();
							that.isStatus = true
							this.close(res.data.new_user || 0)
						});
				});
			},
			// #endif
			close(new_user) {
				this.$emit('close', {
					isStatus: this.isStatus,
					new_user
				})
			}
		}
	}
</script>

<style lang="scss">
	.mobile-bg {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 19;
	}

	.mobile-mask {
		z-index: 20;
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		padding: 67rpx 30rpx;
		background: #fff;
		border-radius: 40rpx 40rpx 0 0;
		box-sizing: border-box;
	}

	.info-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.info-box image {
		width: 150rpx;
		height: 150rpx;
		border-radius: 20rpx;
	}

	.info-box .title {
		margin-top: 30rpx;
		margin-bottom: 20rpx;
		font-size: 40rpx;
		font-weight: 700;
		color: #000;
	}

	.info-box .sub-title {
		font-size: 26rpx;
		color: #999;
	}

	.btn-submit {
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

	.df {
		display: flex;
		align-items: center;
	}

	.animated {
		animation-duration: .4s;
	}

	@keyframes slideInUp {
		from {
			transform: translate3d(0, 100%, 0);
		}
		to {
			transform: translate3d(0, 0, 0);
		}
	}
</style>
