<template>
	<view class="container" :style="colorStyle">
		<navbar></navbar>
		<view class="content-box" :style="{'margin-top': statusBarHeight + 'px'}">
			<view class="logo-box">
				<image :src="configData.wap_login_logo" />
			</view>
				
			<view class="login-box">
				<view class="sub-title">{{configData.site_name}}</view>
				
				<!-- #ifdef MP-QQ -->
				<template v-if="configData.qq_mini_program_force_userinfo">
					<button class="btn-submit df" v-if="bindPhone" open-type="getPhoneNumber" @getphonenumber="getphonenumber">{{$t(`授权登录`)}}</button>
					<button class="btn-submit df" v-else-if="!bindPhone" open-type="getUserInfo" @getuserinfo="getuserinfo">{{$t(`授权登录`)}}</button>
				</template>

				<view class="btn-submit phone-btn df" v-if="configData.phone_auth_switch" @tap="phoneLogin">{{$t(`手机号登录`)}}</view>
				<!-- #endif -->
				
				<view class="agreement" v-if="!canGetPrivacySetting">
					<checkbox-group @tap.stop='ChangeIsDefault'>
						<label class="df">
							<checkbox :class="inAnimation ? 'trembling' : ''" @animationend='inAnimation=false' :checked="protocol ? true : false" style="transform:scale(0.7)"/>
							<view class="agreement-text">
								{{$t(`已阅读并同意`)}}
								<text @tap.stop="privacy(4)">{{$t(`《用户协议》`)}}</text>
								{{$t(`与`)}}
								<text @tap.stop="privacy(3)">{{$t(`《隐私协议》`)}}</text>
							</view>
						</label>
					</checkbox-group>
				</view>
			</view>
		</view>
		
		<block v-if="isUp">
			<mobileLogin :isUp="isUp" :canClose="canClose" @close="maskClose" :authKey="authKey" @qqPhone="qqPhone"></mobileLogin>
		</block>
		<block v-if="isPhoneBox">
			<routinePhone :logoUrl="logoUrl" :isPhoneBox="isPhoneBox" @loginSuccess="bindPhoneClose" :authKey="authKey">
			</routinePhone>
		</block>
		<block>
			<editUserModal :isShow="isShow" @closeEdit="closeEdit" @editSuccess="editSuccess">
			</editUserModal>
		</block>
		<!-- #ifdef MP-QQ -->
		<privacyAgreementPopup v-if="canGetPrivacySetting" @onReject="onReject" @onAgree="onAgree">
		</privacyAgreementPopup>
		<!-- #endif -->
	</view>
</template>

<script>
	const app = getApp();
	let statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 'px';
	import mobileLogin from '../components/login_mobile/index.vue';
	import routinePhone from '../components/login_mobile/qq_phone.vue';
	import editUserModal from '@/components/eidtUserModal/index.vue'
	import privacyAgreementPopup from '@/components/privacyAgreementPopup/index.vue'
	import {
		getLogo,
		silenceAuth,
		routineBindingPhone,
		wechatAuthV2,
		authType,
		authLogin,
		wechatAuthLogin
	} from '@/api/public';
	import {
		qqSilenceAuth,
		qqAuthLogin,
		qqAuthBindingPhone,
		getQQConfig
	} from '@/api/qq';
	import cacheConfig from '@/config/cache.js';
	const {
		LOGO_URL,
		EXPIRES_TIME,
		USER_INFO,
		STATE_R_KEY
	} = cacheConfig;
	import {
		getUserInfo
	} from '@/api/user.js';
	import {
		getUserSocialInfo
	} from '@/api/social.js';
	import Routine from '@/libs/routine';
	import wechat from '@/libs/wechat';
	import colors from '@/mixins/color.js';
	import Auth from '@/libs/wechat.js';
	import appConfig from '@/config/app.js';
	const { HTTP_REQUEST_URL } = appConfig;
	import {
		isWeixin
	} from "@/utils";
	import Cache from '@/utils/cache';
	export default {
		mixins: [colors],
		data() {
			return {
				imgHost: HTTP_REQUEST_URL,
				isUp: false,
				canClose: true,
				phone: '',
				statusBarHeight: statusBarHeight,
				isHome: false,
				isPhoneBox: false,
				protocol: false,
				isShow: false,
				isLogin: false,
				logoUrl: '',
				code: '',
				authKey: '',
				options: '',
				userInfo: {},
				codeNum: 0,
				canUseGetUserProfile: false,
				canGetPrivacySetting: false,
				inAnimation: false,
				colorStatus: uni.getStorageSync('color_status'),
				mp_is_new: this.$Cache.get('MP_VERSION_ISNEW') || false,
				configData: Cache.get('BASIC_CONFIG'),
				bindPhone: false
			};
		},
		components: {
			mobileLogin,
			routinePhone,
			editUserModal,
			privacyAgreementPopup
		},
		onLoad(options) {
			if (uni.getUserProfile) {
				this.canUseGetUserProfile = true
			}
			// #ifdef MP-QQ
			if (qq.getPrivacySetting) {
				this.canGetPrivacySetting = true
			}
			// #endif
			let that = this;
			// #ifdef MP-QQ
			this.userLogin()
			// #endif
			let pages = getCurrentPages();
			let prePage = pages[pages.length - 2];
			if (prePage && prePage.route == 'pages/order_addcart/order_addcart') {
				this.isHome = true;
			} else {
				this.isHome = false;
			}
		},
		methods: {
			onAgree() {
				this.protocol = true
			},

			// QQ小程序登录
			userLogin() {
				Routine.getCode()
					.then(code => {
						qqSilenceAuth(code, app.globalData.code, app.globalData.spid)
							.then(res => {
								uni.hideLoading();
								this.authKey = res.data.key;
								this.bindPhone = res.data.bindPhone;
							})
							.catch(err => {
								uni.hideLoading();
								uni.showToast({
									title: err,
									icon: 'none',
									duration: 2000
								});
							});
					})
					.catch(err => {
						console.log(err);
					});
			},
			// QQ小程序获取用户信息
			getuserinfo(e) {
				if (!this.protocol) {
					uni.showToast({
						title: this.$t('请先阅读并同意协议'),
						icon: 'none',
						duration: 2000
					});
					return
				}

				if (e.detail.errMsg === 'getUserInfo:ok') {
					uni.showLoading({
						title: this.$t(`正在登录中`)
					});

					// 使用用户信息进行登录
					qqAuthLogin({
						key: this.authKey,
						iv: e.detail.iv,
						encryptedData: e.detail.encryptedData
					}).then(res => {
						let time = res.data.expires_time - this.$Cache.time();
						this.$store.commit('LOGIN', {
							token: res.data.token,
							time: time
						});
						this.getUserInfo(res.data.userInfo.new_user)
					}).catch(err => {
						uni.hideLoading();
						uni.showToast({
							title: err,
							icon: 'none',
							duration: 2000
						});
					});
				} else {
					// 用户拒绝授权，使用普通登录
					this.getAuthLogin();
				}
			},
			// QQ小程序获取手机号码
			getphonenumber(e) {
				console.log('QQ小程序手机号授权回调:', e);
				console.log('e.detail:', e.detail);
				console.log('encryptedData:', e.detail.encryptedData);
				console.log('iv:', e.detail.iv);
				console.log('errMsg:', e.detail.errMsg);

				if (!this.protocol) {
					uni.showToast({
						title: this.$t('请先阅读并同意协议'),
						icon: 'none',
						duration: 2000
					});
					return
				}

				if (e.detail.errMsg !== 'getPhoneNumber:ok') {
					console.log('手机号授权失败:', e.detail.errMsg);
					uni.showToast({
						title: '获取手机号失败: ' + e.detail.errMsg,
						icon: 'none',
						duration: 3000
					});
					return;
				}

				if (!e.detail.encryptedData || !e.detail.iv) {
					console.log('手机号加密数据为空');
					uni.showToast({
						title: '手机号数据获取失败',
						icon: 'none',
						duration: 2000
					});
					return;
				}

				uni.showLoading({
					title: this.$t(`正在登录中`)
				});

				Routine.getCode()
					.then(qqCode => {
						console.log('获取到QQ登录code:', qqCode);
						this.getUserPhoneNumber(e.detail.encryptedData, e.detail.iv, qqCode);
					})
					.catch(error => {
						console.log('获取QQ登录code失败:', error);
						uni.hideLoading();
						uni.showToast({
							title: '获取授权码失败',
							icon: 'none',
							duration: 2000
						});
					});
			},
			// QQ小程序获取手机号码回调
			getUserPhoneNumber(encryptedData, iv, qqCode) {
				console.log('调用绑定手机号接口参数:', {
					code: qqCode,
					iv: iv,
					encryptedData: encryptedData,
					spread_code: app.globalData.code,
					spread_spid: app.globalData.spid,
					key: this.authKey
				});

				qqAuthBindingPhone(qqCode, iv, encryptedData, app.globalData.code, app.globalData.spid, this.authKey)
					.then(res => {
						console.log('绑定手机号成功:', res);
						let time = res.data.expires_time - this.$Cache.time();
						this.$store.commit('LOGIN', {
							token: res.data.token,
							time: time
						});
						this.getUserInfo(res.data.userInfo.new_user)
					})
					.catch(err => {
						console.log('绑定手机号失败:', err);
						uni.hideLoading();
						uni.showToast({
							title: err,
							icon: 'none',
							duration: 3000
						});
					});
			},
			getAuthLogin() {
				if (!this.authKey) return
				if (!this.protocol) {
					uni.showToast({
						title: this.$t('请先阅读并同意协议'),
						icon: 'none',
						duration: 2000
					});
					return
				}
				uni.showLoading({
					title: this.$t(`正在登录中`)
				});
				qqAuthLogin({
					key: this.authKey
				}).then(res => {
					let time = res.data.expires_time - this.$Cache.time();
					this.$store.commit('LOGIN', {
						token: res.data.token,
						time: time
					});
					this.getUserInfo(res.data.userInfo.new_user)
				}).catch(err => {
					uni.hideLoading();
					uni.showToast({
						title: err,
						icon: 'none',
						duration: 2000
					});
				});
			},
			ChangeIsDefault(e) {
				this.$set(this, 'protocol', !this.protocol);
			},
			editSuccess() {
				this.isShow = false
			},
			phoneLogin() {
				uni.navigateTo({
					url: `/pages/users/binding_phone/index?authKey=${this.authKey}&pageType=0`
				})
			},
			closeEdit() {
				this.isShow = false
				uni.showToast({
					title: this.$t(`登录成功`),
					icon: 'success',
					duration: 2000
				});

				// 登录成功后跳转到消息页面
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/index/center'
					});
				}, 2000);
			},
			onReject() {
				uni.navigateBack();
			},
			// #ifdef MP-QQ
			back() {
				if (this.isLogin) {
					this.$store.commit('LOGIN', {
						token: '',
						time: 0
					});
				}
				uni.navigateBack();
			},
			// #endif
			// #ifndef MP-QQ
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
			// #endif
			home() {
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			// 弹窗关闭
			maskClose(new_user) {
				this.isUp = false;
				// #ifdef MP-QQ
				if (new_user) {
					this.isShow = true
				}
				// #endif
			},
			bindPhoneClose(data) {
				this.isPhoneBox = false;
				if (data.isStatus) {
					// #ifdef MP-QQ
					this.getUserInfo(data.new_user)
					// #endif
					// #ifndef MP-QQ
					uni.showToast({
						title: this.$t(`登录成功`),
						icon: 'success',
						duration: 2000
					});

					// 登录成功后跳转到消息页面
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/index/center'
						});
					}, 2000);
					// #endif
				}
			},
			// #ifdef MP-QQ
			// QQ小程序获取手机号码
			getphonenumber(e) {
				if (!this.protocol) {
					uni.showToast({
						title: this.$t('请先阅读并同意协议'),
						icon: 'none',
						duration: 2000
					});
					return
				}
				uni.showLoading({
					title: this.$t(`正在登录中`)
				});
				Routine.getCode()
					.then(code => {
						this.getUserPhoneNumber(e.detail.encryptedData, e.detail.iv, code);
					})
					.catch(error => {
						uni.$emit('closePage', false);
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
						this.$Cache.clear('snsapiKey');
						this.getUserInfo(res.data.bindName)
					})
					.catch(res => {
						uni.hideLoading();
					});
			},
			// #endif
			/**
			 * 获取个人用户信息
			 */
			getUserInfo(new_user, back_url) {
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
							
							if (new_user) {
								this.isShow = true
							} else {
								// 显示登录成功提示
								uni.showToast({
									title: that.$t(`登录成功`),
									icon: 'success',
									duration: 2000
								});

								// 登录成功后跳转
								setTimeout(() => {
									// #ifdef MP-QQ
									// QQ小程序环境跳转到消息页面
									uni.reLaunch({
										url: '/pages/index/center'
									});
									// #endif
									// #ifndef MP-QQ
									// 非QQ小程序环境跳转到个人中心或指定页面
									const targetUrl = back_url || '/pages/index/center';
									uni.reLaunch({
										url: targetUrl
									});
									// #endif
								}, 2000);
							}
						})
						.catch(() => {
							// 即使社交信息获取失败，仍然继续
							uni.hideLoading();
							if (new_user) {
								this.isShow = true
							} else {
								// 显示登录成功提示
								uni.showToast({
									title: that.$t(`登录成功`),
									icon: 'success',
									duration: 2000
								});

								// 登录成功后跳转
								setTimeout(() => {
									// #ifdef MP-QQ
									// QQ小程序环境跳转到消息页面
									uni.reLaunch({
										url: '/pages/index/center'
									});
									// #endif
									// #ifndef MP-QQ
									// 非QQ小程序环境跳转到个人中心或指定页面
									const targetUrl = back_url || '/pages/index/center';
									uni.reLaunch({
										url: targetUrl
									});
									// #endif
								}, 2000);
							}
						});
				}).catch(err => {
					uni.hideLoading();
					uni.showToast({
						title: err.msg,
						icon: 'none',
						duration: 2000
					});
				});
			},
			privacy(type) {
				uni.navigateTo({
					url: "/pages/users/privacy/index?type=" + type
				})
			},
			// 输入手机号后的回调
			qqPhone() {
				this.$Cache.clear('snsapiKey');
				this.isUp = false;
				uni.showToast({
					title: this.$t(`登录成功`),
					icon: 'none'
				});
				setTimeout(res => {
					uni.reLaunch({
						url: '/pages/index/center'
					});
				}, 800);
			}
		}
	};
</script>

<style lang="scss">
.container {
	width: 100%;
	background: #fff;
	height: 100vh;
	overflow: hidden;
}

.content-box {
	width: 100%;
}

.logo-box {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	/* #ifdef APP-VUE */
	margin-top: 50rpx;
	/* #endif */
	/* #ifndef APP-VUE */
	margin-top: 200rpx;
	/* #endif */
	margin-bottom: 60rpx;
}

.logo-box image {
	width: 180rpx;
	height: 180rpx;
	border-radius: 20rpx;
}

.login-box {
	width: calc(100% - 60rpx);
	margin: 30rpx;
}

.login-box .title {
	font-size: 40rpx;
	font-weight: 700;
	color: #000;
	text-align: center;
}

.login-box .sub-title {
	margin-top: 20rpx;
	font-size: 26rpx;
	color: #999;
	text-align: center;
	margin-bottom: 80rpx;
}

.login-box .btn-submit {
	margin-top: 40rpx;
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
	border: none;
	outline: none;
	padding: 0;
}

.login-box .btn-submit::after {
	border: none;
}

.login-box .phone-btn {
	background: #fff;
	color: #333;
	border: 1px solid #e4e4e4;
}

.login-box .agreement {
	margin-top: 60rpx;
	font-size: 24rpx;
	color: #999;
	text-align: center;
}

.agreement .agreement-text {
	font-size: 24rpx;
	color: #999;
}

.agreement-text text {
	color: #576b95;
}

.df {
	display: flex;
	align-items: center;
	justify-content: center;
}

.trembling {
	animation: shake 0.6s;
}

@keyframes shake {
	0%, 100% { transform: translateX(0); }
	10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
	20%, 40%, 60%, 80% { transform: translateX(5px); }
}
</style>
