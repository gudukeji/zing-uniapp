<template>
	<view class="container">
		<navbar></navbar>
		<view class="content-box" :style="{'margin-top': '30px'}">
			<view class="logo-box">
				<image :src="logoUrl" />
			</view>
			<view class="login-box">
				<view class="title">{{ $t(`账号登录`) }}</view>
				<view class="sub-title">{{ $t(`为了提供更好的服务，请登录您的账号`) }}</view>
				
				<view v-if="current !== 1">
					<view class="input-item df">
						<view class="icon-mobile">
							<image src="/static/phone_1.png"></image>
						</view>
						<input type="text" maxlength="11" :placeholder="$t(`输入手机号码`)" v-model="account" />
					</view>
					
					<view class="input-item df">
						<view class="icon-code">
							<image src="/static/img/sj.png"></image>
						</view>
						<input type="password" :placeholder="$t(`填写登录密码`)" v-model="password" />
					</view>
				</view>
				
				<view v-if="current !== 0 || appLoginStatus || appleLoginStatus">
					<view class="input-item df">
						<view class="icon-mobile">
							<image src="/static/phone_1.png"></image>
						</view>
						<input type="text" :placeholder="$t(`输入手机号码`)" v-model="account" :maxlength="11" />
					</view>
					
					<view class="input-item df">
						<view class="icon-code">
							<image src="/static/code_2.png"></image>
						</view>
						<input type="text" :placeholder="$t(`填写验证码`)" :maxlength="6" v-model="captcha" />
						<view :class="['send-code', disabled ? 'active' : '']" @tap="code">{{text}}</view>
					</view>
				</view>
				
				<view class="tips-text" v-if="current !== 1">* {{ $t(`忘记密码可以使用验证码登录`) }}</view>
				
				<view class="btn-submit df" @tap="loginMobile" v-if="current !== 0">{{ $t(`登录`) }}</view>
				<view class="btn-submit df" @tap="submit" v-if="current === 0">{{ $t(`登录`) }}</view>
				
				<!-- #ifndef APP-PLUS -->
				<view class="login-type-switch">
					<view v-if="current == 0" @tap="current = 1">{{ $t(`验证码登录`) }}</view>
					<view v-if="current == 1" @tap="current = 0">{{ $t(`账号登录`) }}</view>
				</view>
				<!-- #endif -->
				
				<!-- #ifdef APP-PLUS -->
				<view class="appLogin" v-if="!appLoginStatus && !appleLoginStatus">
					<view class="other-login-title">
						<view class="line"></view>
						<view class="text">{{ $t(`其他方式登录`) }}</view>
						<view class="line"></view>
					</view>
					<view class="other-login-methods">
						<view class="login-method" @tap="wxLogin">
							<view class="iconfont icon-s-weixindenglu1"></view>
						</view>
						<view class="login-method" v-if="current == 1" @tap="current = 0">
							<view class="iconfont icon-s-mimadenglu1"></view>
						</view>
						<view class="login-method" v-if="current == 0" @tap="current = 1">
							<view class="iconfont icon-s-yanzhengmadenglu1"></view>
						</view>
						<view class="login-method apple" @tap="appleLogin" v-if="appleShow">
							<view class="iconfont icon-s-pingguo"></view>
						</view>
					</view>
				</view>
				<!-- #endif -->
				
				<view class="agreement">
					<checkbox-group @change="ChangeIsDefault">
						<label class="df">
							<checkbox :checked="protocol ? true : false" :class="inAnimation ? 'trembling' : ''" @animationend="inAnimation = false" style="transform:scale(0.7)"/>
							<view class="agreement-text">
								{{ $t(`已阅读并同意`) }}
								<text @tap.stop="privacy(4)">{{ $t(`《用户协议》`) }}</text>
								{{ $t(`与`) }}
								<text @tap.stop="privacy(3)">{{ $t(`《隐私协议》`) }}</text>
							</view>
						</label>
					</checkbox-group>
				</view>
			</view>
		</view>
		
		<view class="bottom">
			<view class="ver" v-if="copyRight">{{ copyRight }}</view>
			<view v-else class="ver">
				Copyright ©2024 CRMEB. All Rights
			</view>
		</view>
		<Verify @success="success" :captchaType="captchaType" :imgSize="{ width: '330px', height: '155px' }" ref="verify"></Verify>
	</view>
</template>
<script>
import sendVerifyCode from '@/mixins/SendVerifyCode';
import { loginH5, loginMobile, registerVerify, register, getCodeApi, getUserInfo, appleLogin } from '@/api/user';
import { getUserSocialInfo } from '@/api/social.js';
import attrs, { required, alpha_num, chs_phone } from '@/utils/validate';
import { getLogo } from '@/api/public';
// import cookie from "@/utils/store/cookie";
import { VUE_APP_API_URL } from '@/utils';
// #ifdef APP-PLUS
import { wechatAppAuth } from '@/api/api.js';
// #endif
const BACK_URL = 'login_back_url';
import colors from '@/mixins/color.js';
import Verify from '../components/verify/index.vue';
export default {
	name: 'Login',
	components: {
		Verify
	},
	mixins: [sendVerifyCode, colors],
	data: function () {
		return {
			copyRight: '',
			inAnimation: false,
			protocol: false,
			navList: [this.$t(`快速登录`), this.$t(`账号登录`)],
			current: 1,
			account: '',
			password: '',
			captcha: '',
			formItem: 1,
			type: 'login',
			logoUrl: '',
			keyCode: '',
			codeUrl: '',
			codeVal: '',
			isShowCode: false,
			appLoginStatus: false, // 微信登录强制绑定手机号码状态
			appUserInfo: null, // 微信登录保存的用户信息
			appleLoginStatus: false, // 苹果登录强制绑定手机号码状态
			appleUserInfo: null,
			appleShow: false, // 苹果登录版本必须要求ios13以上的
			keyLock: true
		};
	},
	watch: {
		formItem: function (nval, oVal) {
			if (nval == 1) {
				this.type = 'login';
			} else {
				this.type = 'register';
			}
		}
	},
	onLoad() {
		let self = this;
		uni.getSystemInfo({
			success: (res) => {
				if (res.platform.toLowerCase() == 'ios' && this.getSystem(res.system)) {
					self.appleShow = true;
				}
			}
		});
		if (uni.getStorageSync('copyRight').copyrightContext) {
			this.copyRight = uni.getStorageSync('copyRight').copyrightContext;
		}
	},
	mounted() {
		// this.getCode();
		this.getLogoImage();
	},
	methods: {
		ChangeIsDefault(e) {
			this.$set(this, 'protocol', !this.protocol);
		},
		privacy(type) {
			uni.navigateTo({
				url: '/pages/setting/xinxuan?type=' + type
			});
		},
		// IOS 版本号判断
		getSystem(system) {
			let str;
			system.toLowerCase().indexOf('ios') === -1 ? (str = system) : (str = system.split(' ')[1]);
			if (str.indexOf('.')) return str.split('.')[0] >= 13;
			return str >= 13;
		},
		// 苹果登录
		appleLogin() {
			let self = this;
			this.account = '';
			this.captcha = '';
			if (!self.protocol) {
				this.inAnimation = true;
				return self.$util.Tips({
					title: '请先阅读并同意协议'
				});
			}
			uni.showLoading({
				title: this.$t(`登录中`)
			});
			uni.login({
				provider: 'apple',
				timeout: 10000,
				success(loginRes) {
					uni.getUserInfo({
						provider: 'apple',
						success: function (infoRes) {
							self.appleUserInfo = infoRes.userInfo;
							self.appleLoginApi();
						},
						fail() {
							uni.showToast({
								title: self.$t(`获取用户信息失败`),
								icon: 'none',
								duration: 2000
							});
						},
						complete() {
							uni.hideLoading();
						}
					});
				},
				fail(error) {
					console.log(error);
				}
			});
		},
		// 苹果登录Api
		appleLoginApi() {
			let self = this;
			appleLogin({
				openId: self.appleUserInfo.openId,
				email: self.appleUserInfo.email || '',
				phone: this.account,
				captcha: this.captcha
			})
				.then(({ data }) => {
					if (data.isbind) {
						uni.showModal({
							title: self.$t(`提示`),
							content: self.$t(`请绑定手机号后，继续操作`),
							showCancel: false,
							success: function (res) {
								if (res.confirm) {
									self.current = 1;
									self.appleLoginStatus = true;
								}
							}
						});
					} else {
						self.$store.commit('LOGIN', {
							token: data.token,
							time: data.expires_time - self.$Cache.time()
						});
						let backUrl = self.$Cache.get(BACK_URL) || '/pages/index/index';
						self.$Cache.clear(BACK_URL);
						self.$store.commit('SETUID', data.userInfo.uid);
						
						// 先获取基础用户信息
						getUserInfo().then(res => {
							// 再获取用户社交信息（拓展信息）
							getUserSocialInfo()
								.then((socialRes) => {
									// 更新用户社交信息到Vuex
									if (socialRes.data) {
										self.$store.commit('UPDATE_USERINFO', socialRes.data);
									}
									// 完成后跳转
									uni.reLaunch({
										url: backUrl
									});
								})
								.catch(() => {
									// 即使社交信息获取失败，仍然跳转
									uni.reLaunch({
										url: backUrl
									});
								});
						}).catch(() => {
							// 即使基础信息获取失败，仍然跳转
							uni.reLaunch({
								url: backUrl
							});
						});
					}
				})
				.catch((error) => {
					uni.showModal({
						title: self.$t(`提示`),
						content: self.$t(`错误信息`) + `${error}`,
						success: function (res) {
							if (res.confirm) {
								console.log(self.$t(`用户点击确定`));
							} else if (res.cancel) {
								console.log(self.$t(`用户点击取消`));
							}
						}
					});
				});
		},
		// App微信登录
		wxLogin() {
			let self = this;
			this.account = '';
			this.captcha = '';
			if (!self.protocol) {
				this.inAnimation = true;
				return self.$util.Tips({
					title: '请先阅读并同意协议'
				});
			}
			uni.showLoading({
				title: self.$t(`登录中`)
			});
			uni.login({
				provider: 'weixin',
				success: function (loginRes) {
					// 获取用户信息
					uni.getUserInfo({
						provider: 'weixin',
						success: function (infoRes) {
							self.appUserInfo = infoRes.userInfo;
							self.wxLoginApi();
						},
						fail() {
							uni.showToast({
								title: self.$t(`获取用户信息失败`),
								icon: 'none',
								duration: 2000
							});
						},
						complete() {
							uni.hideLoading();
						}
					});
				},
				fail() {
					uni.showToast({
						title: self.$t(`登录失败`),
						icon: 'none',
						duration: 2000
					});
				}
			});
		},

		wxLoginApi() {
			let self = this;
			wechatAppAuth({
				userInfo: self.appUserInfo,
				phone: this.account,
				code: this.captcha
			})
				.then(({ data }) => {
					if (data.isbind) {
						uni.showModal({
							title: self.$t(`提示`),
							content: self.$t(`请绑定手机号后，继续操作`),
							showCancel: false,
							success: function (res) {
								if (res.confirm) {
									self.current = 1;
									self.appLoginStatus = true;
								}
							}
						});
					} else {
						self.$store.commit('LOGIN', {
							token: data.token,
							time: data.expires_time - self.$Cache.time()
						});
						let backUrl = self.$Cache.get(BACK_URL) || '/pages/index/index';
						self.$Cache.clear(BACK_URL);
						self.$store.commit('SETUID', data.userInfo.uid);
						
						// 先获取基础用户信息
						getUserInfo().then(res => {
							// 再获取用户社交信息（拓展信息）
							getUserSocialInfo()
								.then((socialRes) => {
									// 更新用户社交信息到Vuex
									if (socialRes.data) {
										self.$store.commit('UPDATE_USERINFO', socialRes.data);
									}
									// 完成后跳转
									uni.reLaunch({
										url: backUrl
									});
								})
								.catch(() => {
									// 即使社交信息获取失败，仍然跳转
									uni.reLaunch({
										url: backUrl
									});
								});
						}).catch(() => {
							// 即使基础信息获取失败，仍然跳转
							uni.reLaunch({
								url: backUrl
							});
						});
					}
				})
				.catch((error) => {
					uni.showModal({
						title: self.$t(`提示`),
						content: self.$t(`错误信息`) + `${error}`,
						success: function (res) {
							if (res.confirm) {
								console.log(self.$t(`用户点击确定`));
							} else if (res.cancel) {
								console.log(self.$t(`用户点击取消`));
							}
						}
					});
				});
		},
		again() {
			this.codeUrl = VUE_APP_API_URL + '/sms_captcha?' + 'key=' + this.keyCode + Date.parse(new Date());
		},
		success(data) {
			this.$refs.verify.hide();
			getCodeApi()
				.then((res) => {
					this.keyCode = res.data.key;
					this.getCode(data);
				})
				.catch((res) => {
					this.$util.Tips({
						title: res
					});
				});
		},
		code() {
			let that = this;
			if (!that.protocol) {
				this.inAnimation = true;
				return that.$util.Tips({
					title: '请先阅读并同意协议'
				});
			}
			if (!that.account)
				return that.$util.Tips({
					title: that.$t(`请填写手机号码`)
				});
			if (!/^1(3|4|5|7|8|9|6)\d{9}$/i.test(that.account))
				return that.$util.Tips({
					title: that.$t(`请输入正确的手机号码`)
				});
			this.$refs.verify.show();
		},
		async getLogoImage() {
			let that = this;
			getLogo(2).then((res) => {
				that.logoUrl = res.data.logo_url;
			});
		},
		async loginMobile() {
			let that = this;
			if (!that.protocol) {
				this.inAnimation = true;
				return that.$util.Tips({
					title: '请先阅读并同意协议'
				});
			}
			if (!that.account)
				return that.$util.Tips({
					title: that.$t(`请填写手机号码`)
				});
			if (!/^1(3|4|5|7|8|9|6)\d{9}$/i.test(that.account))
				return that.$util.Tips({
					title: that.$t(`请输入正确的手机号码`)
				});
			if (!that.captcha)
				return that.$util.Tips({
					title: that.$t(`请填写验证码`)
				});
			if (!/^[\w\d]+$/i.test(that.captcha))
				return that.$util.Tips({
					title: that.$t(`请输入正确的验证码`)
				});
			if (that.appLoginStatus) {
				that.wxLoginApi();
			} else if (that.appleLoginStatus) {
				that.appleLoginApi();
			} else {
				if (this.keyLock) {
					this.keyLock = !this.keyLock;
				} else {
					return that.$util.Tips({
						title: that.$t(`请勿重复点击`)
					});
				}
				loginMobile({
					phone: that.account,
					captcha: that.captcha,
					spread: that.$Cache.get('spread')
				})
					.then((res) => {
						let data = res.data;
						that.$store.commit('LOGIN', {
							token: data.token,
							time: data.expires_time - this.$Cache.time()
						});
						let backUrl = that.$Cache.get(BACK_URL) || '/pages/index/index';
						that.$Cache.clear(BACK_URL);
						// 先获取基础用户信息
						getUserInfo().then((res) => {
							this.keyLock = true;
							that.$store.commit('SETUID', res.data.uid);
							
							// 获取用户社交信息（拓展信息）
							getUserSocialInfo()
								.then((socialRes) => {
									// 更新用户社交信息到Vuex
									if (socialRes.data) {
										that.$store.commit('UPDATE_USERINFO', socialRes.data);
									}
									
									// 处理跳转URL
									if (backUrl.indexOf('/pages/users/login/index') !== -1) {
										backUrl = '/pages/index/index';
									}
									
									// 完成后跳转
									uni.reLaunch({
										url: backUrl
									});
								})
								.catch(() => {
									// 即使社交信息获取失败，仍然跳转
									if (backUrl.indexOf('/pages/users/login/index') !== -1) {
										backUrl = '/pages/index/index';
									}
									uni.reLaunch({
										url: backUrl
									});
								});
						});
					})
					.catch((res) => {
						this.keyLock = true;
						that.$util.Tips({
							title: res
						});
					});
			}
		},
		async register() {
			let that = this;
			if (!that.protocol) {
				this.inAnimation = true;
				return that.$util.Tips({
					title: '请先阅读并同意协议'
				});
			}
			if (!that.account)
				return that.$util.Tips({
					title: that.$t(`请填写手机号码`)
				});
			if (!/^1(3|4|5|7|8|9|6)\d{9}$/i.test(that.account))
				return that.$util.Tips({
					title: that.$t(`请输入正确的手机号码`)
				});
			if (!that.captcha)
				return that.$util.Tips({
					title: that.$t(`请填写验证码`)
				});
			if (!/^[\w\d]+$/i.test(that.captcha))
				return that.$util.Tips({
					title: that.$t(`请输入正确的验证码`)
				});
			if (!that.password)
				return that.$util.Tips({
					title: that.$t(`请填写密码`)
				});
			if (/^([0-9]|[a-z]|[A-Z]){0,6}$/i.test(that.password))
				return that.$util.Tips({
					title: that.$t(`您输入的密码过于简单`)
				});
			register({
				account: that.account,
				captcha: that.captcha,
				password: that.password,
				spread: that.$Cache.get('spread')
			})
				.then((res) => {
					that.$util.Tips({
						title: res
					});
					that.formItem = 1;
				})
				.catch((res) => {
					that.$util.Tips({
						title: res
					});
				});
		},
		async getCode(data) {
			let that = this;
			if (!that.protocol) {
				this.inAnimation = true;
				return that.$util.Tips({
					title: '请先阅读并同意协议'
				});
			}
			if (!that.account)
				return that.$util.Tips({
					title: that.$t(`请填写手机号码`)
				});
			if (!/^1(3|4|5|7|8|9|6)\d{9}$/i.test(that.account))
				return that.$util.Tips({
					title: that.$t(`请输入正确的手机号码`)
				});
			if (that.formItem == 2) that.type = 'register';

			await registerVerify({
				phone: that.account,
				type: that.type,
				key: that.keyCode,
				captchaType: this.captchaType,
				captchaVerification: data.captchaVerification
			})
				.then((res) => {
					this.sendCode();
					that.$util.Tips({
						title: res.msg
					});
				})
				.catch((res) => {
					that.$util.Tips({
						title: res
					});
				});
		},
		navTap: function (index) {
			this.current = index;
		},
		async submit() {
			let that = this;
			if (!that.protocol) {
				this.inAnimation = true;
				return that.$util.Tips({
					title: '请先阅读并同意协议'
				});
			}
			if (!that.account)
				return that.$util.Tips({
					title: that.$t(`请填写账号`)
				});
			if (!/^[\w\d]{5,16}$/i.test(that.account))
				return that.$util.Tips({
					title: that.$t(`请输入正确的账号`)
				});
			if (!that.password)
				return that.$util.Tips({
					title: that.$t(`请填写密码`)
				});
			if (this.keyLock) {
				this.keyLock = !this.keyLock;
			} else {
				return that.$util.Tips({
					title: that.$t(`请勿重复点击`)
				});
			}
			loginH5({
				account: that.account,
				password: that.password,
				spread: that.$Cache.get('spread')
			})
				.then(({ data }) => {
					that.$store.commit('LOGIN', {
						token: data.token,
						time: data.expires_time - this.$Cache.time()
					});
					let backUrl = that.$Cache.get(BACK_URL) || '/pages/index/index';
					that.$Cache.clear(BACK_URL);
					// 先获取基础用户信息
					getUserInfo()
						.then((res) => {
							this.keyLock = true;
							that.$store.commit('SETUID', res.data.uid);
							
							// 获取用户社交信息（拓展信息）
							getUserSocialInfo()
								.then((socialRes) => {
									// 更新用户社交信息到Vuex
									if (socialRes.data) {
										that.$store.commit('UPDATE_USERINFO', socialRes.data);
									}
									// 完成后跳转
									uni.reLaunch({
										url: backUrl
									});
								})
								.catch(() => {
									// 即使社交信息获取失败，仍然跳转
									uni.reLaunch({
										url: backUrl
									});
								});
						})
						.catch((error) => {
							this.keyLock = true;
						});
				})
				.catch((e) => {
					this.keyLock = true;
					that.$util.Tips({
						title: e
					});
				});
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
	margin-bottom: 30rpx;
}

.logo-box image {
	width: 240rpx;
	height: 240rpx;
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

.login-type-switch {
	margin-top: 30rpx;
	text-align: center;
	font-size: 26rpx;
	color: #576b95;
}

.appLogin {
	margin-top: 60rpx;
}

.other-login-title {
	display: flex;
	align-items: center;
	justify-content: center;
}

.other-login-title .line {
	width: 68rpx;
	height: 1rpx;
	background: #ccc;
}

.other-login-title .text {
	margin: 0 20rpx;
	font-size: 24rpx;
	color: #b4b4b4;
}

.other-login-methods {
	display: flex;
	justify-content: center;
	margin-top: 30rpx;
}

.login-method {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 68rpx;
	height: 68rpx;
	border-radius: 50%;
	margin: 0 15rpx;
}

.login-method .iconfont {
	font-size: 40rpx;
	color: #fff;
}

.login-method:nth-child(1) {
	background-color: #61c64f;
}

.login-method:nth-child(2),
.login-method:nth-child(3) {
	background-color: #28b3e9;
}

.login-method.apple {
	background: #000;
}

.bottom {
	position: fixed;
	bottom: 30rpx;
	left: 0;
	width: 100%;
	display: flex;
	justify-content: center;
}

.bottom .ver {
	font-size: 20rpx;
	color: #999;
}

.bottom .ver a {
	color: #999;
	text-decoration: none;
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

.trembling {
	animation: shake 0.6s;
}

@keyframes shake {
	0%, 100% { transform: translateX(0); }
	10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
	20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.df {
	display: flex;
	align-items: center;
}
</style>
