<template>
	<view class="container" :style="colorStyle">
		<navbar></navbar>
		<view class="content-box">
			<view class="logo-box">
				<image src="/static/logo.png" />
			</view>
			<view class="login-box">
				<view class="title">{{$t(`修改密码`)}}</view>
				<view class="sub-title">{{$t(`当前手机号`)}}：{{phone}}</view>
				
				<view class="input-item df">
					<view class="icon-pwd">
						<image src="/static/img/icon-pwd.png"></image>
					</view>
					<input type='password' :placeholder='$t(`设置新密码`)' v-model="password"/>
				</view>
				
				<view class="input-item df">
					<view class="icon-pwd">
						<image src="/static/img/icon-pwd.png"></image>
					</view>
					<input type='password' :placeholder='$t(`确认新密码`)' v-model="qr_password"/>
				</view>
				
				<view class="input-item df">
					<view class="icon-code">
						<image src="/static/img/icon-code.png"></image>
					</view>
					<input type='number' :placeholder='$t(`填写验证码`)' maxlength="6" v-model="captcha"/>
					<view :class="['send-code', disabled ? 'active' : '']" @tap="code">{{text}}</view>
				</view>
				
				<view class="btn-submit df" @tap="editPwd">{{$t(`确认修改`)}}</view>
			</view>
		</view>
		
		<Verify @success="success" :captchaType="captchaType" :imgSize="{ width: '330px', height: '155px' }" ref="verify"></Verify>
	</view>
</template>

<script>
	import sendVerifyCode from "@/mixins/SendVerifyCode";
	import {
		phoneRegisterReset,
		verifyCode
	} from '@/api/api.js';
	import {
		getUserInfo,
		registerVerify
	} from '@/api/user.js';
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
	import Verify from '../components/verify/index.vue';
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
				userInfo: {},
				phone: '',
				password: '',
				captcha: '',
				qr_password: '',
				isAuto: false, //没有授权的不会自动授权
				isShowAuth: false, //是否隐藏授权
				key: '',
			};
		},
		computed: mapGetters(['isLogin']),
		watch: {
			isLogin: {
				handler: function(newV, oldV) {
					if (newV) {
						this.getUserInfo();
					}
				},
				deep: true
			}
		},
		onLoad() {
			if (this.isLogin) {
				this.getUserInfo();
				verifyCode().then(res => {
					this.$set(this, 'key', res.data.key)
				});
			} else {
				toLogin()
			}
		},
		methods: {
			/**
			 * 授权回调
			 */
			onLoadFun: function(e) {
				this.getUserInfo();
			},
			// 授权关闭
			authColse: function(e) {
				this.isShowAuth = e
			},
			/**
			 * 获取个人用户信息
			 */
			getUserInfo: function() {
				let that = this;
				getUserInfo().then(res => {
					let tel = res.data.phone;
					let phone = tel.substr(0, 3) + "****" + tel.substr(7);
					that.$set(that, 'userInfo', res.data);
					that.phone = phone;
				});
			},
			/**
			 * 发送验证码
			 * 
			 */
			async code() {
				let that = this;
				if (!that.userInfo.phone) return that.$util.Tips({
					title: that.$t(`手机号码不存在,无法发送验证码！`)
				});
				this.$refs.verify.show()

			},
			async success(data) {
				let that = this;
				this.$refs.verify.hide()
				await registerVerify({
					phone: that.userInfo.phone,
					type: 'reset',
					key: that.key,
					captchaType: this.captchaType,
					captchaVerification: data.captchaVerification
				}).then(res => {
					this.sendCode()
					that.$util.Tips({
						title: res.msg
					});
				}).catch(err => {
					return that.$util.Tips({
						title: err
					});
				});
			},
			/**
			 * H5登录 修改密码
			 * 
			 */
			editPwd: function(e) {
				let that = this,
					password = e.detail.value.password,
					qr_password = e.detail.value.qr_password,
					captcha = e.detail.value.captcha;
				if (!password) return that.$util.Tips({
					title: that.$t(`请输入新密码`)
				});
				if (qr_password != password) return that.$util.Tips({
					title: that.$t(`两次输入的密码不一致！`)
				});
				if (!captcha) return that.$util.Tips({
					title: that.$t(`请输入验证码`)
				});
				phoneRegisterReset({
					account: that.userInfo.phone,
					captcha: captcha,
					password: password
				}).then(res => {
					return that.$util.Tips({
						title: res.msg
					}, {
						tab: 3,
						url: 1
					});
				}).catch(err => {
					return that.$util.Tips({
						title: err
					});
				});
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

.input-item .icon-pwd,
.input-item .icon-code {
	margin-right: 20rpx;
	width: 36rpx;
	height: 36rpx;
}

.input-item .icon-pwd image,
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
