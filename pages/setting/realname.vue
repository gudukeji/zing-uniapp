<template>
	<view class="page-wrapper">
		<!-- Scrollable content area -->
		<scroll-view scroll-y class="content-scroll">
			<view class="container">
				<view class="title-box">
					<view>请填写真实身份信息</view>
				</view>
				<view class="input-tips" style="color:#FA5150">
					注：因监管部门要求，社区类产品需实名后使用，绑定手机号即可发布动态、评论、参加活动等。认证信息将用于平台服务，与账号唯一绑定，无法解绑。我们会对信息进行严格保密。
				</view>
				<!-- 表单区域 -->
				<view class="form-section">
					<!-- 手机号显示 -->
					<view class="title-label">手机号</view>
					<view class="input-box df">
						<view>{{userInfo.phone || '未绑定'}}</view>
						<button class="input-btn df" open-type="getPhoneNumber" @getphonenumber="bindMobileClick">
							<image src="/static/img/dh.png"></image>
							<text>{{userInfo.phone ? '换绑' : '绑定'}}</text>
						</button>
					</view>			
					<view class="title-label">证件类型</view>
					<view class="input-box">
						<view class="value">居民身份证</view>
					</view>
					
					<view class="title-label">真实姓名</view>
					<input 
						class="input-box" 
						v-model="real_name" 
						:disabled="isReadonly"
						placeholder="请填写真实姓名" 
						maxlength="20"
						@blur="nameBlur"
					/>
					
					<view class="title-label">身份证号</view>
					<input 
						class="input-box" 
						v-model="id_card_number" 
						:disabled="isReadonly"
						placeholder="请填写身份证号码" 
						maxlength="18"
						@blur="idCardBlur"
					/>
					
					<!-- 状态提示 -->
					<view v-if="auth_status === 3 && verify_remark" class="fail-reason">
						审核失败：{{verify_remark}}
					</view>
					<view v-if="auth_status === 2" class="success-msg">
						已认证，无法修改
					</view>
					<view v-if="auth_status === 1" class="pending-msg">
						已提交，等待审核
					</view>
				</view>
				
				<!-- 协议勾选 -->
				<view class="protocol-row" v-if="auth_status !== 2">
					<checkbox-group @change="onCheckboxChange">
						<label class="df">
							<checkbox :checked="checked ? true : false" :disabled="isReadonly" style="transform:scale(0.7)"/>
							<text class="protocol-text">我已阅读并同意 <text class="protocol-link" @tap="openProtocol">《实名认证服务协议》</text></text>
						</label>
					</checkbox-group>
				</view>
				
				<!-- 撤销申请按钮 -->
				<view v-if="auth_status === 1" class="cancel-section">
					<view class="footer-item df">
						<button class="btn cancel-btn" @tap="onCancel" :disabled="loading">
							撤销申请
						</button>
					</view>
				</view>
				
				<!-- 底部安全区域 - 为固定底部按钮留出空间 -->
				<view class="bottom-safe-area"></view>
			</view>
		</scroll-view>
		
		<!-- Fixed footer -->
		<view class="footer-box bfw bUp">
			<view class="footer-item df">
				<button class="btn" :class="auth_status === 2 ? 'btn-gray' : 'bg2'" @tap="onSubmit" :disabled="loading || auth_status === 2">
					{{loading ? '提交中...' : getButtonText()}}
				</button>
			</view>
		</view>
		
		<!-- 提示弹窗 -->
		<uni-popup ref="tipsPopup" type="center" >
			<view class="tips-box df">
				<view class="tips-item">{{tipsTitle}}</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import { getRealAuthInfo, submitRealAuth, cancelRealAuth, getUserSocialInfo } from '@/api/social.js'
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'

export default {
	components: {
		uniPopup
	},
	data() {
		return {
			real_name: '',
			id_card_number: '',
			checked: false,
			auth_status: 0, // 0未认证 1待审核 2已认证 3失败
			verify_remark: '',
			loading: false,
			tipsTitle: "",
			userInfo: {
				phone: ''
			}
		}
	},
	computed: {
		isReadonly() {
			return this.auth_status === 2 || this.auth_status === 1;
		},
		canSubmit() {
			// 如果已认证，不能提交
			if (this.auth_status === 2) return false;
			
			return this.real_name && this.id_card_number && !this.isReadonly && !this.loading;
		}
	},
	onLoad() {
		// 显示加载中
		uni.showLoading({
			title: '加载中...',
			mask: true
		});
		
		// 并行加载数据
		Promise.all([
			this.loadAuthInfo(),
			this.loadUserInfo()
		]).catch(err => {
			console.error('初始化数据失败:', err);
			this.opTipsPopup('加载失败，请重试');
		}).finally(() => {
			uni.hideLoading();
		});
	},
	methods: {
		// 加载认证信息
		loadAuthInfo() {
			const that = this;
			return new Promise((resolve, reject) => {
				getRealAuthInfo().then(res => {
					// 检查是否成功 - 增加多种成功状态的检查
					const isSuccess = res.code === 200 || res.status === 200 || res.msg === 'success';
					
					if (isSuccess) {
						if (res.data) {
							that.auth_status = res.data.auth_status || 0;
							that.real_name = res.data.real_name || '';
							that.id_card_number = res.data.id_card_number || '';
							that.verify_remark = res.data.auth_remark || res.data.verify_remark || '';
							
							console.log('获取认证信息成功:', res.data);
						}
						resolve(res.data || {});
					} else {
						console.error('获取认证信息失败:', res.msg);
						reject(new Error(res.msg || '获取认证信息失败'));
					}
				}).catch(err => {
					console.error('获取认证信息请求错误:', err);
					reject(err);
				});
			});
		},
		
		// 加载用户信息
		loadUserInfo() {
			const that = this;
			// 先尝试从store获取用户信息
			const storeUserInfo = this.$store.state.userInfo;
			if (storeUserInfo && storeUserInfo.phone) {
				this.userInfo.phone = storeUserInfo.phone;
			}
			
			// 返回Promise以便与Promise.all一起使用
			return new Promise((resolve, reject) => {
				// 调用API获取用户社交信息
				getUserSocialInfo().then(res => {
					// 检查是否成功 - 增加多种成功状态的检查
					const isSuccess = res.code === 200 || res.status === 200 || res.msg === 'success';
					
					if (isSuccess) {
						if (res.data) {
							console.log('获取用户信息成功:', res.data);
							// 更新用户信息
							that.userInfo = {
								...that.userInfo,
								...res.data
							};
							// 保存到本地
							uni.setStorageSync('USER_INFO', res.data);
						}
						resolve(res.data || {});
					} else {
						console.error('获取用户信息失败:', res.msg);
						reject(new Error(res.msg || '获取用户信息失败'));
					}
				}).catch(err => {
					console.error('获取用户信息请求错误:', err);
					reject(err);
				});
			});
		},
		
		// 获取按钮文本
		getButtonText() {
			// 如果手机号未绑定，显示绑定手机号
			if (!this.userInfo.phone) {
				return '请先绑定手机号';
			}
			
			// 如果基本数据未填写，显示提示
			if (!this.real_name || !this.id_card_number) {
				return '请填写认证信息';
			}
			
			switch (this.auth_status) {
				case 0: return '提交认证';
				case 1: return '审核中';
				case 2: return '已认证';
				case 3: return '重新提交';
				default: return '提交认证';
			}
		},
		
		// 姓名输入验证
		nameBlur() {
			// 只在姓名不为空且长度不足时才提示
			if (this.real_name && this.real_name.trim() && this.real_name.length < 2) {
				this.opTipsPopup('姓名长度不能少于2个字符');
			}
		},
		
		// 身份证号输入验证
		idCardBlur() {
			console.log('身份证号失去焦点验证:', this.id_card_number);
			// 只在身份证号不为空且格式不正确时才提示
			if (this.id_card_number && this.id_card_number.trim() && !this.validateIdCard(this.id_card_number)) {
				this.opTipsPopup('身份证号格式不正确');
			}
		},
		
		// 身份证号验证
		validateIdCard(idCard) {
			// 基本格式验证
			if (!/^\d{17}[\dXx]$/.test(idCard)) {
				return false;
			}
			
			// 校验码验证
			const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
			const verify = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
			
			let sum = 0;
			for (let i = 0; i < 17; i++) {
				sum += parseInt(idCard[i]) * factor[i];
			}
			
			const check = verify[sum % 11];
			return idCard[17].toUpperCase() === check;
		},
		
		// 提交认证
		onSubmit() {
			// 如果已认证，不允许提交
			if (this.auth_status === 2) {
				this.opTipsPopup('您已完成认证，无需重复提交');
				return;
			}
			
			// 检查手机号是否已绑定
			if (!this.userInfo.phone) {
				this.opTipsPopup('请先绑定手机号后再进行实名认证');
				return;
			}
			
			// 表单验证
			if (!this.real_name.trim()) {
				this.opTipsPopup('请输入真实姓名');
				return;
			}
			
			if (!this.id_card_number.trim()) {
				this.opTipsPopup('请输入身份证号');
				return;
			}
			
			if (!this.validateIdCard(this.id_card_number)) {
				this.opTipsPopup('身份证号格式不正确');
				return;
			}
			
			if (!this.checked && this.auth_status !== 2) {
				this.opTipsPopup('请先同意实名认证服务协议');
				return;
			}
			
			// 检查是否正在加载
			if (this.loading) return;
			
			const that = this;
			this.loading = true;
			submitRealAuth({ 
				real_name: this.real_name.trim(), 
				id_card_number: this.id_card_number.trim() 
			}).then(res => {
				// 检查是否成功 - 增加多种成功状态的检查
				const isSuccess = res.code === 200 || res.status === 200 || res.msg === 'success';
				
				if (isSuccess) {
					that.opTipsPopup('提交成功，等待审核');
					
					// 刷新认证信息和用户信息
					Promise.all([
						that.loadAuthInfo(),
						that.loadUserInfo()
					]).catch(err => {
						console.error('刷新数据失败:', err);
					});
				} else {
					that.opTipsPopup(res.msg || '提交失败');
				}
			}).catch(err => {
				that.opTipsPopup('提交失败: ' + (err && err.msg ? err.msg : '网络错误'));
			}).finally(() => {
				that.loading = false;
			});
		},
		
		// 撤销申请
		onCancel() {
			const that = this;
			uni.showModal({
				title: '确认撤销',
				content: '确定要撤销认证申请吗？撤销后可以重新提交。',
				success: (res) => {
					if (res.confirm) {
						that.loading = true;
						cancelRealAuth().then(res => {
							// 检查是否成功 - 增加多种成功状态的检查
							const isSuccess = res.code === 200 || res.status === 200 || res.msg === 'success';
							
							if (isSuccess) {
								that.opTipsPopup('撤销成功');
								
								// 刷新认证信息和用户信息
								Promise.all([
									that.loadAuthInfo(),
									that.loadUserInfo()
								]).catch(err => {
									console.error('刷新数据失败:', err);
								});
							} else {
								that.opTipsPopup(res.msg || '撤销失败');
							}
						}).catch(err => {
							that.opTipsPopup('撤销失败: ' + (err && err.msg ? err.msg : '网络错误'));
						}).finally(() => {
							that.loading = false;
						});
					}
				}
			});
		},
		
		// 打开协议
		openProtocol() {
			uni.navigateTo({ 
				url: '/pages/setting/xinxuan?type=5' 
			});
		},
		
		// 复选框变化处理
		onCheckboxChange(e) {
			console.log('协议勾选变化:', !this.checked, '->', this.checked);
			this.$set(this, 'checked', !this.checked);
		},
		
		// 显示提示弹窗
		opTipsPopup(msg, duration = 2000) {
			this.tipsTitle = msg;
			this.$refs.tipsPopup.open();
			setTimeout(() => {
				this.$refs.tipsPopup.close();
			}, duration);
		},
		
		// 绑定手机号
		bindMobileClick(e) {
			let that = this;
			if (e.detail.errMsg === 'getPhoneNumber:ok') {
				// 获取到手机号，调用后端接口绑定
				uni.showLoading({
					title: that.userInfo.phone ? '换绑授权中...' : '绑定授权中...',
					mask: true
				});
				
				// 使用实际的绑定手机号API
				that.$util.userBindingPhone(e.detail).then(res => {
					uni.hideLoading();
					// 检查是否成功 - 增加多种成功状态的检查
					const isSuccess = res.code == 200 || res.status == 200 || res.msg === 'success';
					
					if (isSuccess) {
						// 更新用户信息
						that.userInfo.phone = res.data.phone || res.data.mobile;
						// 提示成功
						that.opTipsPopup(res.msg || '手机号绑定成功');
					} else {
						that.opTipsPopup(res.msg || '绑定失败');
					}
				}).catch(err => {
					uni.hideLoading();
					that.opTipsPopup('绑定失败: ' + (typeof err === 'string' ? err : '网络错误'));
				});
			} else {
				that.opTipsPopup('获取手机号失败');
			}
		}
	}
}
</script>

<style scoped>
.page-wrapper {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #fff;
	position: relative;
}

.content-scroll {
	flex: 1;
	overflow-y: auto;
}

.container {
	width: calc(100% - 60rpx);
	padding: 0 30rpx;
	background: #fff;
}

.title-box {
	padding: 20rpx 0;
	font-size: 40rpx;
	font-weight: 700;
}

.title-box view:last-child {
	font-size: 24rpx;
	color: #999;
	font-weight: normal;
	margin-top: 10rpx;
}

.desc {
	color: #888;
	font-size: 24rpx;
	margin-bottom: 30rpx;
	line-height: 1.4;
}

.form-section {
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
	padding: 20rpx 0 10rpx 0;
	margin-bottom: 30rpx;
}

.title-label {
	width: calc(100% - 48rpx);
	padding: 30rpx 24rpx 12rpx;
	color: #999;
	font-size: 24rpx;
	font-weight: 700;
}

.input-box {
	width: calc(100% - 68rpx);
	padding: 0 30rpx;
	height: 90rpx;
	line-height: 90rpx;
	font-size: 28rpx;
	font-weight: 700;
	border: 4rpx solid #f5f5f5;
	border-radius: 24rpx;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.input-box[disabled] {
	background: #f8f8f8;
	color: #bbb;
}

.value {
	color: #333;
	font-size: 28rpx;
}

.fail-reason {
	color: #fa5150;
	font-size: 24rpx;
	margin: 10rpx 24rpx 20rpx;
	padding: 20rpx;
	background: rgba(250, 81, 80, 0.1);
	border-radius: 12rpx;
}

.success-msg {
	color: #4cd964;
	font-size: 24rpx;
	margin: 10rpx 24rpx 20rpx;
	padding: 20rpx;
	background: rgba(76, 217, 100, 0.1);
	border-radius: 12rpx;
}

.pending-msg {
	color: #faad14;
	font-size: 24rpx;
	margin: 10rpx 24rpx 20rpx;
	padding: 20rpx;
	background: rgba(250, 173, 20, 0.1);
	border-radius: 12rpx;
}

.protocol-row {
	display: flex;
	align-items: center;
	margin: 20rpx 0;
	font-size: 24rpx;
	color: #999;
}

.protocol-text {
	font-size: 24rpx;
	color: #999;
}

.protocol-link {
	color: #576b95;
}

/* 底部按钮样式 */
.footer-box {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	padding-bottom: env(safe-area-inset-bottom);
	background: #fff;
	z-index: 99;
}

.footer-box .footer-item {
	width: calc(100% - 60rpx);
	padding: 20rpx 30rpx;
	justify-content: center;
	box-sizing: border-box;
}

.footer-item .btn {
	width: calc(100% - 30rpx);
	height: 90rpx;
	line-height: 90rpx;
	text-align: center;
	font-size: 28rpx;
	font-weight: 700;
	border-radius: 45rpx;
}

.bg2 {
	color: #fff;
	background: #000;
}

.bg2[disabled] {
	background: #ccc !important;
	color: #fff !important;
	opacity: 0.6;
}

.btn-gray {
	background: #ccc !important;
	color: #fff !important;
	opacity: 0.6;
	cursor: not-allowed;
}

button[disabled] {
	background: #ccc !important;
	color: #fff !important;
	opacity: 0.6;
}

.cancel-section {
	margin: 20rpx 0 40rpx;
	width: 100%;
}

.cancel-btn {
	color: #666;
	background: #f5f5f5;
	border: 2rpx solid #ddd;
}

.cancel-btn[disabled] {
	background: #f0f0f0;
	color: #ccc;
}

.bfw {
	background: #fff;
}

.bUp {
	box-shadow: 0 -2px 5px 0 rgba(0, 0, 0, 0.05);
}

/* 提示弹窗样式 */
.tips-box {
	padding: 20rpx 30rpx;
	border-radius: 12rpx;
	justify-content: center;
	margin-top: 40rpx;
}

.tips-box .tips-item {
	color: #fff;
	font-size: 28rpx;
	font-weight: 600;
	text-align: center;
}

.df {
	display: flex;
	align-items: center;
}

/* 底部安全区域 */
.bottom-safe-area {
	height: 150rpx;
	width: 100%;
	margin-bottom: env(safe-area-inset-bottom);
}

/* 输入框样式优化 */
input {
	border: none;
	background: transparent;
	outline: none;
	width: 100%;
}

input[disabled] {
	color: #bbb;
}

/* 复选框样式 */
checkbox {
	transform: scale(0.8);
}

/* 手机号绑定按钮样式 */
.input-btn {
	width: 90rpx;
	height: 90rpx;
	font-size: 24rpx;
	justify-content: space-between;
	margin: 0;
	padding: 0;
	background: #fff;
}

.input-btn image {
	margin-right: 8rpx;
	width: 32rpx;
	height: 32rpx;
}

.input-tips {
	color: #999;
	font-size: 24rpx;
	margin-bottom: 20rpx;
}

/* Adjust the protocol row spacing */
.protocol-row {
	display: flex;
	align-items: center;
	margin: 20rpx 0;
	font-size: 24rpx;
	color: #999;
}

/* Ensure the footer button has proper spacing */
.footer-box .footer-item {
	width: calc(100%);
	padding: 20rpx 30rpx;
	justify-content: center;
	box-sizing: border-box;
}

/* Add box shadow to make the footer stand out */
.bUp {
	box-shadow: 0 -2px 5px 0 rgba(0, 0, 0, 0.05);
}
</style>
