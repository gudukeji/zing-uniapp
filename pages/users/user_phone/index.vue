<template>
	<view class="container" :style="colorStyle">
		<navbar></navbar>
		<view class="content-box">
			<view class="logo-box">
				<image src="/static/logo.png" />
			</view>
			<view class="login-box">
				<view class="title">绑定手机号</view>
				<view class="sub-title">为了提供更好的服务，需要绑定您的手机号</view>
				
				<view class="input-item df">
					<view class="icon-mobile">
						<image src="/static/img/icon-mobile.png"></image>
					</view>
					<input type='number' :placeholder='$t(`填写手机号码`)' v-model="phone" maxlength="11"/>
				</view>
				
				<view class="input-item df">
					<view class="icon-code">
						<image src="/static/img/icon-code.png"></image>
					</view>
					<input type='number' :placeholder='$t(`填写验证码`)' maxlength="6" v-model="captcha"/>
					<view :class="['send-code', disabled ? 'active' : '']" @tap="code">{{text}}</view>
				</view>
				
				<view class="tips-text">* 绑定后，可使用手机号码直接登录</view>
				
				<view class="btn-submit df" @tap="editPwd">{{$t(`确认绑定`)}}</view>
			</view>
		</view>
		
		<Verify @success="success" :captchaType="captchaType" :imgSize="{ width: '330px', height: '155px' }" ref="verify"></Verify>
	</view>
</template>

<script>
	import sendVerifyCode from "@/mixins/SendVerifyCode";
	import Verify from '../components/verify/index.vue';
	import {
		registerVerify,
		bindingUserPhone,
		verifyCode,
		updatePhone
	} from '@/api/api.js';
	import {
		toLogin
	} from '@/libs/login.js';
	import {
		mapGetters
	} from "vuex";
	// #ifdef MP
	import authorize from '@/components/Authorize';
	// #endif
	import colors from '@/mixins/color.js';
	export default {
		mixins: [sendVerifyCode, colors],
		components: {
			// #ifdef MP
			authorize,
			// #endif
			Verify
		},
		data() {
			return {
				phone: '',
				captcha: '',
				isAuto: false, //没有授权的不会自动授权
				isShowAuth: false, //是否隐藏授权
				key: '',
				authKey: '',
				type: 0
			};
		},
		computed: mapGetters(['isLogin']),
		onLoad(options) {
			if (this.isLogin) {
				verifyCode().then(res => {
					this.$set(this, 'key', res.data.key)
				});
				this.authKey = options.key || '';
				this.url = options.url || '';
			} else {
				toLogin();
			}
			this.type = options.type || 0
		},
		methods: {
			onLoadFun: function() {},
			// 授权关闭
			authColse: function(e) {
				this.isShowAuth = e
			},
			editPwd: function() {
				let that = this;
				if (!that.phone) return that.$util.Tips({
					title: that.$t(`请填写手机号码`)
				});
				if (!(/^1(3|4|5|7|8|9|6)\d{9}$/i.test(that.phone))) return that.$util.Tips({
					title: that.$t(`请输入正确的手机号码`)
				});
				if (!that.captcha) return that.$util.Tips({
					title: that.$t(`请填写验证码`)
				});
				if (this.type == 0) {
					bindingUserPhone({
						phone: that.phone,
						captcha: that.captcha
					}).then(res => {
						if (res.data !== undefined && res.data.is_bind) {
							uni.showModal({
								title: that.$t(`是否绑定账号`),
								content: res.msg,
								confirmText: that.$t(`绑定`),
								success(res) {
									if (res.confirm) {
										bindingUserPhone({
											phone: that.phone,
											captcha: that.captcha,
											step: 1
										}).then(res => {
											return that.$util.Tips({
												title: res.msg,
												icon: 'success'
											}, {
												tab: 5,
												url: '/pages/users/user_info/index'
											});
										}).catch(err => {
											return that.$util.Tips({
												title: err
											});
										})
									} else if (res.cancel) {
										return that.$util.Tips({
											title: that.$t(`您已取消绑定！`)
										}, {
											tab: 5,
											url: '/pages/users/user_info/index'
										});
									}
								}
							});
						} else
							return that.$util.Tips({
								title: that.$t(`绑定成功`),
								icon: 'success'
							}, {
								tab: 5,
								url: '/pages/users/user_info/index'
							});
					}).catch(err => {
						return that.$util.Tips({
							title: err
						});
					})
				} else {
					updatePhone({
						phone: that.phone,
						captcha: that.captcha,
					}).then(res => {
						return that.$util.Tips({
							title: res.msg,
							icon: 'success'
						}, {
							tab: 5,
							url: '/pages/users/user_info/index'
						});
					}).catch(error => {
						return that.$util.Tips({
							title: error,
						});
					})
				}
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
			}
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
	margin-top: 30px;
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

.df {
	display: flex;
	align-items: center;
}
</style>
