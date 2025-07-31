<template>
	<view class="container">
		<navbar></navbar>
		<view class="content-box" :style="{'margin-top': statusBarHeight + 'px'}">
			<view class="login-box">
				<view class="title">
					{{pageType == 1 ? $t('绑定手机号') : $t('手机号登录')}}
				</view>
				<view class="sub-title">
					{{pageType == 1 ? $t('登录注册需绑定手机号') : $t('首次登录会自动注册')}}
				</view>
				
				<view class="input-item df">
					<view class="icon-mobile">
						<image src="/static/img/icon-mobile.png"></image>
					</view>
					<input type='number' :placeholder='$t(`填写手机号码`)' v-model="phone" :maxlength="11"/>
				</view>
				
				<view class="input-item df">
					<view class="icon-code">
						<image src="/static/img/icon-code.png"></image>
					</view>
					<input type='number' :placeholder='$t(`填写验证码`)' :maxlength="6" v-model="captcha"/>
					<view :class="['send-code', disabled ? 'active' : '']" @tap="code">{{text}}</view>
				</view>
				
				<view class="tips-text" v-if="pageType == 0">* {{$t(`首次登录将自动创建账号`)}}</view>
				
				<view class="btn-submit df" @tap="submitData">
					{{$t(`${pageType == 1 ? '绑定手机号' : '立即登录'}`)}}
				</view>
				
				<view class="agreement" v-if="pageType == 0 && !canGetPrivacySetting">
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
		
		<Verify @success="success" :captchaType="'clickWord'" :imgSize="{ width: '330px', height: '155px' }" ref="verify"></Verify>
		<editUserModal :isShow="isShow" @closeEdit="closeEdit" @editSuccess="editSuccess">
		</editUserModal>
		<!-- #ifdef MP -->
		<privacyAgreementPopup v-if="canGetPrivacySetting" @onReject="onReject" @onAgree="onAgree">
		</privacyAgreementPopup>
		<!-- #endif -->
	</view>
</template>

<script>
	const app = getApp();
	let statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 'px';
	import sendVerifyCode from "@/mixins/SendVerifyCode";
	import colors from '@/mixins/color.js';
	import editUserModal from '@/components/eidtUserModal/index.vue'
	import privacyAgreementPopup from '@/components/privacyAgreementPopup/index.vue'
	import {
		bindingUserPhone,
		verifyCode,
		registerVerify,
		updatePhone
	} from '@/api/api.js';
	import {
	loginMobile,
	getCodeApi,
	getUserInfo,
	phoneSilenceAuth
} from "@/api/user.js";
import {
	getUserSocialInfo
} from '@/api/social.js';
	import {
		phoneLogin,
		wechatBindingPhone
	} from '@/api/public.js'
	import {
		qqPhoneCaptchaLogin
	} from '@/api/qq.js'
	import Routine from '@/libs/routine';
	import Verify from '../components/verify/index.vue';
	import Cache from '@/utils/cache';
	export default {
		mixins: [sendVerifyCode, colors],
		components: {
			Verify,
			editUserModal,
			privacyAgreementPopup
		},
		data() {
			return {
				statusBarHeight: statusBarHeight,
				pageType: 1, // 0 登录 1 绑定手机
				phone: '',
				captcha: '',
				text: '获取验证码',
				isShow: false,
				protocol: false,
				inAnimation: false,
				authKey: "",
				backUrl: "",
				pageTitle: '绑定手机号',
				configData: Cache.get('BASIC_CONFIG'),
				canGetPrivacySetting: false,
			}
		},
		onLoad(options) {
			if (options.authKey) {
				this.authKey = options.authKey
			}
			// #ifdef MP
			if (wx.getPrivacySetting) {
				this.canGetPrivacySetting = true
			}
			// #endif

			this.backUrl = options.backUrl || ''
			if (options.pageType) {
				this.pageType = options.pageType || 1
				this.pageTitle = options.pageType == 1 ? '绑定手机号' : '手机号登录'
			}
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
			submitData() {
				let that = this;
				if (this.pageType == 0) {
					this.isLogin()
					return
				}
				if (!this.rules()) return
				if (!this.authKey) {
					let key = this.$Cache.get('snsapiKey');
					this.phoneAuth(key)
				} else {
					this.phoneAuth(this.authKey)
				}
			},
			rules() {
				let that = this;
				if (!this.protocol && this.pageType == 0) {
					uni.showToast({
						title: this.$t('请先阅读并同意协议'),
						icon: 'none',
						duration: 2000
					});
					return false
				}
				if (!that.phone) {
					that.$util.Tips({
						title: that.$t(`请填写手机号码`)
					});
					return false
				}
				if (!(/^1(3|4|5|7|8|9|6)\d{9}$/i.test(that.phone))) {
					that.$util.Tips({
						title: that.$t(`请输入正确的手机号码`)
					});
					return false
				}
				if (!that.captcha) {
					return that.$util.Tips({
						title: that.$t(`请填写验证码`)
					});
					return false
				}
				return true
			},
			isLogin() {
				if (!this.rules()) return

				uni.showLoading({
					title: this.$t(`正在登录中`)
				});
				Routine.getCode()
					.then(code => {
						phoneLogin({
								code,
								spread_spid: app.globalData.spid,
								spread_code: app.globalData.code,
								phone: this.phone,
								captcha: this.captcha,
							}).then(res => {
								uni.hideLoading();
								let time = res.data.expires_time - this.$Cache.time();
								this.$store.commit('LOGIN', {
									token: res.data.token,
									time: time
								});
								this.getUserInfo(res.data.bindName);
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
						console.log(err)
					});
			},
			phoneAuth(key) {
				uni.showLoading({
					title: this.$t(`正在登录中`)
				});
				let met
				// #ifdef MP-WEIXIN
				met = phoneLogin
				// #endif
				// #ifdef MP-QQ
				met = qqPhoneCaptchaLogin
				// #endif
				// #ifndef MP
				met = wechatBindingPhone
				// #endif
				met({
					phone: this.phone,
					captcha: this.captcha,
					key
				}).then(res => {
					let time = res.data.expires_time - this.$Cache.time();
					this.$store.commit('LOGIN', {
						token: res.data.token,
						time: time
					});
					this.getUserInfo(res.data.bindName);
				}).catch(error => {
					uni.hideLoading()
					this.$util.Tips({
						title: error
					})
				})
			},
			/**
			 * 获取个人用户信息
			 */
			getUserInfo(new_user) {
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
								// #ifdef MP
								that.$util.Tips({
									title: that.$t(`登录成功`),
									icon: 'success'
								}, {
									tab: 3,
									url: this.configData.wechat_auth_switch ? 2 : 1
								});
								// #endif
								// #ifndef MP
								that.$util.Tips({
									title: that.$t(`登录成功`),
									icon: 'success'
								}, {
									tab: 4,
									url: this.backUrl || 'pages/user/index'
								});
								// #endif
							}
						})
						.catch(() => {
							// 即使社交信息获取失败，仍然继续
							uni.hideLoading();
							if (new_user) {
								this.isShow = true
							} else {
								// #ifdef MP
								that.$util.Tips({
									title: that.$t(`登录成功`),
									icon: 'success'
								}, {
									tab: 3,
									url: this.configData.wechat_auth_switch ? 2 : 1
								});
								// #endif
								// #ifndef MP
								that.$util.Tips({
									title: that.$t(`登录成功`),
									icon: 'success'
								}, {
									tab: 4,
									url: this.backUrl || 'pages/user/index'
								});
								// #endif
							}
						});
				});
			},
			success(data) {
				this.$refs.verify.hide()
				let that = this;
				verifyCode().then(res => {
					registerVerify(that.phone, 'reset', res.data.key, this.captchaType, data.captchaVerification)
						.then(res => {
							that.$util.Tips({
								title: res.msg
							});
							that.sendCode();
						}).catch(err => {
							return that.$util.Tips({
								title: err
							});
						});
				});
			},
			/**
			 * 发送验证码
			 *
			 */
			async code() {
				let that = this;
				if (!that.phone) return that.$util.Tips({
					title: that.$t(`请填写手机号码`)
				});
				if (!(/^1(3|4|5|7|8|9|6)\d{9}$/i.test(that.phone))) return that.$util.Tips({
					title: that.$t(`请输入正确的手机号码`)
				});
				this.$refs.verify.show();
				return;
			},
			ChangeIsDefault() {
				this.$set(this, 'protocol', !this.protocol);
			},
			closeEdit() {
				this.isShow = false
				this.$util.Tips({
					title: this.$t(`登录成功`),
					icon: 'success'
				}, {
					tab: 3,
					url: 2
				});
			},
			editSuccess() {
				this.isShow = false
			},
			back() {
				uni.navigateBack({
					delta: this.configData.wechat_auth_switch ? 2 : 1
				})
			},
			privacy(type) {
				uni.navigateTo({
					url: "/pages/users/privacy/index?type=" + type
				})
			},
		}
	}
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

.df {
	display: flex;
	align-items: center;
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
