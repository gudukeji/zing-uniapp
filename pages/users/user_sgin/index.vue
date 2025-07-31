<template>
	<view class="sign-page" :style="colorStyle">
		<!-- 主要内容区域 -->
		<view class="main-content">
			<!-- 顶部背景区域 -->
			<view class="header-bg">
				<!-- 连续签到天数显示 -->
				<view class="continuous-days">
					<view class="days-label">连续签到</view>
					<view class="days-number">{{ continuousSignDays }}</view>
					<view class="days-unit">天</view>
				</view>

				<!-- 中央签到日历图标 -->
				<view class="calendar-icon">
					<view class="calendar-header">
						<view class="calendar-pin left-pin"></view>
						<view class="calendar-pin right-pin"></view>
						<view class="calendar-title">已累计签到</view>
					</view>
					<view class="calendar-body">
						<view class="calendar-number">{{ continuousSignDays }}</view>
						<view class="calendar-unit">天</view>
					</view>
				</view>

				<!-- 右侧数据 -->
				<view class="right-stats">
					<view class="stat-item">
						<view class="stat-number">{{ getTodaySignReward('integral') }}</view>
						<view class="stat-label">签到领积分</view>
					</view>
					<view class="stat-item">
						<view class="stat-number">{{ getTodaySignReward('experience') }}</view>
						<view class="stat-label">签到领经验</view>
					</view>
				</view>

				<!-- 查看签到日历按钮 -->
				<view class="calendar-btn" @click="showCalendar">
					查看我的签到日历 >
				</view>

				<!-- 签到提醒开关 -->
				<view class="remind-switch" v-if="signRemindSwitch == 1">
					<view class="switch-label">签到提醒</view>
					<view class="custom-switch" :class="{ active: remindStatus }" @click="toggleCustomRemind">
						<view class="switch-handle"></view>
					</view>
				</view>
			</view>

			<!-- 签到按钮 -->
			<view class="sign-button-container">
				<button class="sign-button" v-if="checkSign" disabled>{{ $t(`今日已签到`) }}</button>
				<form @submit="goSign" v-else>
					<button class="sign-button" formType="submit">{{ $t(`立即签到`) }}</button>
				</form>
			</view>

			<!-- 日期滑动区域 -->
			<view class="date-slider">
				<scroll-view
					class="date-scroll"
					scroll-x="true"
					:scroll-left="scrollLeft"
					@scroll="onDateScroll"
					v-if="allDates.length > 0"
				>
					<view class="date-container">
						<view
							class="date-item"
							v-for="(date, index) in allDates"
							:key="index"
							:class="{ 'signed': date.signed, 'today': date.isToday }"
						>
							<view class="date-icon">
								<image v-if="date.signed" src="/static/img/sign-icon-03.png" class="sign-icon"></image>
								<image v-else src="/static/img/sign-icon-01.png" class="sign-icon"></image>
							</view>
							<view class="date-text">{{ date.day }}/{{ date.month }}</view>
						</view>
					</view>
				</scroll-view>

				<!-- 无数据提示 -->
				<view v-if="allDates.length === 0" class="no-data" style="text-align: center; padding: 40rpx; color: #999;">
					暂无签到数据
				</view>
			</view>
		</view>

		<!-- 签到记录 -->
		<view class="sign-records">
			<view class="records-header">
				<view class="records-title">签到记录</view>
				<view class="records-more" @click="goSignList">更多 ></view>
			</view>
			<view class="records-list" v-if="signList.length">
				<view class="record-item" v-for="(item, index) in signList.slice(0, 10)" :key="index">
					<view class="record-icon">
						<image src="/static/img/sign-icon-04.png"></image>
					</view>
					<view class="record-info">
						<view class="record-title">{{ item.title }}</view>
						<view class="record-date">{{ item.add_time }}</view>
					</view>
					<view class="record-reward">+{{ item.number }} <image src="/static/img/sign-icon-01.png"></image></view>
				</view>
			</view>
		</view>

		<!-- 签到日历弹窗 -->
		<view class="calendar-modal" v-if="showCalendarModal" @click="hideCalendar">
			<view class="calendar-content" @click.stop>
				<view class="calendar-modal-header">
					<view class="modal-title">
						已连续签到<text class="highlight-number">{{ continuousSignDays }}</text>天
					</view>
				</view>
				<view class="calendar-nav">
					<view class="nav-btn" @click="prevMonth">
						<text class="nav-arrow">‹</text>
					</view>
					<view class="nav-title">{{ currentYear }}年{{ currentMonth }}月</view>
					<view class="nav-btn" @click="nextMonth">
						<text class="nav-arrow">›</text>
					</view>
				</view>
				<view class="calendar-grid">
					<view class="weekdays">
						<view class="weekday" v-for="day in weekdays" :key="day">{{ day }}</view>
					</view>
					<view class="calendar-dates">
						<view
							class="calendar-date"
							v-for="date in calendarDates"
							:key="date.key"
							:class="{
								'signed': date.signed && !date.isEmpty,
								'today': date.isToday && !date.isEmpty,
								'empty': date.isEmpty
							}"
						>
							<view v-if="!date.isEmpty" class="date-number">{{ date.day }}</view>
							<image v-if="date.signed && !date.isEmpty" src="/static/img/sign-icon-03.png" class="sign-icon"></image>
							<text v-if="date.signed && !date.isEmpty" class="status-text">已签</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 签到成功提示 -->
		<view class="sign-success-modal" v-if="active" @click="close">
			<view class="success-content">
				<view class="success-icon">
					<image src="/static/img/sign-icon-04.png"></image>
				</view>
				<view class="success-text">签到成功</view>
				<view class="success-reward">获得{{ integral }}积分</view>
				<view class="success-btn" @click="close">好的</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		toLogin
	} from '@/libs/login.js';
	import {
		mapGetters
	} from 'vuex';
	import {
		postSignUser,
		getSignConfig,
		getSignList,
		setSignIntegral,
		changeRemindStatus
	} from '@/api/user.js';
	import {
		setFormId,
		colorChange
	} from '@/api/api.js';
	import colors from '@/mixins/color';
	// #ifdef MP
	import authorize from '@/components/Authorize';
	// #endif
	import config from '@/config/app';
	const { HTTP_REQUEST_URL } = config;
	export default {
		components: {
			// #ifdef MP
			authorize
			// #endif
		},
		mixins: [colors],
		data() {
			return {
				active: false,
				userInfo: {},
				signCount: [],
				signSystemList: [],
				signList: [],
				integral: 0,
				isAuto: false, //没有授权的不会自动授权
				isShowAuth: false, //是否隐藏授权
				sign_index: 0,
				picUrl: [],
				imgHost: HTTP_REQUEST_URL,
				sginBg: '',
				sginTip: '',
				signMode: 0, // 0月签到 1周签到
				nextContinuousDays: 0,
				nextCumulativeDays: 0,
				continuousSignDays: 0,
				signRemindSwitch: 0,
				checkSign: 0,
				remindStatus: false,
				weekArr: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
				// 新增数据
				showCalendarModal: false,
				currentDateIndex: 0,
				currentYear: new Date().getFullYear(),
				currentMonth: new Date().getMonth() + 1,
				weekdays: ['日', '一', '二', '三', '四', '五', '六'],
				monthsData: [],
				calendarDates: [],
				signGivePoint: 0,
				// 连续日期数据
				allDates: [],
				scrollLeft: 0
			};
		},
		computed: mapGetters(['isLogin']),
		watch: {
			isLogin: {
				handler: function(newV, oldV) {
					if (newV) {
						this.getUserInfo();
						this.getSignSysteam();
						this.getSignList();
					}
				},
				deep: true
			}
		},
		onLoad() {
			if (this.isLogin) {
				this.getColor();
				this.getUserInfo();
				this.getSignSysteam();
				this.getSignList();
			} else {
				toLogin();
			}
		},
		methods: {
			/**
			 * 安全设置导航栏颜色
			 * @param {String} frontColor 前景色
			 * @param {String} backgroundColor 背景色
			 */
			safeSetNavigationBarColor(frontColor = '#ffffff', backgroundColor = '#1db0fc') {
				// 验证颜色值格式
				const colorRegex = /^#[0-9A-Fa-f]{6}$/;

				if (!colorRegex.test(frontColor)) {
					console.warn('前景色格式错误:', frontColor);
					frontColor = '#ffffff';
				}

				if (!colorRegex.test(backgroundColor)) {
					console.warn('背景色格式错误:', backgroundColor);
					backgroundColor = '#1db0fc';
				}

				try {
					uni.setNavigationBarColor({
						frontColor: frontColor,
						backgroundColor: backgroundColor
					});
				} catch (error) {
					console.error('设置导航栏颜色失败:', error);
				}
			},
			/**
			 * 授权回调
			 */
			onLoadFun: function() {
				this.getUserInfo();
				this.getSignSysteam();
				this.getSignList();
				// initCalendarData 会在 getSignSysteam 完成后自动调用
			},
			// 授权关闭
			authColse: function(e) {
				this.isShowAuth = e;
			},
			// 显示日历弹窗
			showCalendar() {
				this.showCalendarModal = true;
				this.generateCalendarDates();
			},
			// 隐藏日历弹窗
			hideCalendar() {
				this.showCalendarModal = false;
			},
			// 初始化日历数据
			initCalendarData() {
				if (!this.signSystemList || this.signSystemList.length === 0) {
					this.allDates = [];
					this.monthsData = [];
					return;
				}

				// 生成连续的日期数据
				this.allDates = [];
				let todayIndex = -1;

				// 遍历所有周的数据，生成连续的日期列表
				for (let weekIndex = 0; weekIndex < this.signSystemList.length; weekIndex++) {
					const weekData = this.signSystemList[weekIndex];

					for (let dayData of weekData) {
						// 解析日期字符串 "7.25" -> 月.日
						const [month, day] = dayData.day.split('.');

						const dateItem = {
							day: parseInt(day),
							month: parseInt(month),
							year: 2025,
							isToday: dayData.sign_day,
							signed: dayData.is_sign,
							date: new Date(2025, parseInt(month) - 1, parseInt(day)),
							point: dayData.point || 0
						};

						this.allDates.push(dateItem);

						// 记录今天的位置
						if (dayData.sign_day) {
							todayIndex = this.allDates.length - 1;
						}
					}
				}

				// 自动滚动到今天的位置
				if (todayIndex >= 0) {
					// 每个日期项宽度约100rpx，居中显示今天
					this.scrollLeft = Math.max(0, (todayIndex - 3) * 100);
				}

				// 保持原有的monthsData结构，用于其他功能
				this.generateMonthsDataFromAllDates();
			},

			// 从连续日期数据生成周数据（保持兼容性）
			generateMonthsDataFromAllDates() {
				this.monthsData = [];

				// 按7天一组分割数据
				for (let i = 0; i < this.allDates.length; i += 7) {
					const weekDates = this.allDates.slice(i, i + 7);
					this.monthsData.push({
						year: 2025,
						month: 7,
						dates: weekDates,
						weekIndex: Math.floor(i / 7)
					});
				}
			},
			// 生成月份数据（已移至initCalendarData方法中）
			generateMonthData(date) {
				return { year: 2025, month: 7, dates: [] };
			},
			// 检查日期是否已签到
			isDateSigned(date) {
				// 根据signSystemList数据判断签到状态
				if (!this.signSystemList || this.signSystemList.length === 0) {
					return false;
				}

				const targetDate = new Date(date);
				const targetMonth = targetDate.getMonth() + 1; // getMonth()返回0-11，需要+1
				const targetDay = targetDate.getDate();

				// 检查signSystemList中的签到数据
				for (let weekData of this.signSystemList) {
					for (let dayData of weekData) {
						// 解析日期字符串 "7.25" -> 月.日
						if (dayData.day && dayData.day.includes('.')) {
							const [month, day] = dayData.day.split('.');
							const dataMonth = parseInt(month);
							const dataDay = parseInt(day);

							// 匹配年月日
							if (dataMonth === targetMonth && dataDay === targetDay) {
								return dayData.is_sign || false;
							}
						}
					}
				}

				return false;
			},
			// 日期滑动改变（保留兼容性）
			onDateChange(e) {
				this.currentDateIndex = e.detail.current;
			},

			// 日期滚动事件
			onDateScroll(e) {
				this.scrollLeft = e.detail.scrollLeft;
			},

			// 获取今日签到奖励
			getTodaySignReward(type) {
				if (!this.signSystemList || this.signSystemList.length === 0) {
					return 0;
				}

				// 查找今天的数据
				for (let weekData of this.signSystemList) {
					for (let dayData of weekData) {
						if (dayData.sign_day) { // 找到今天的数据
							if (type === 'integral') {
								// 根据接口数据，这里可能需要根据实际情况调整
								// 暂时返回固定值，因为接口中point都是0
								return this.signGivePoint || 10;
							} else if (type === 'experience') {
								// 经验值，暂时返回固定值
								return 5;
							}
						}
					}
				}

				// 如果没找到今天的数据，返回默认值
				if (type === 'integral') {
					return this.signGivePoint || 10;
				} else if (type === 'experience') {
					return 5;
				}

				return 0;
			},
			// 生成日历日期
			generateCalendarDates() {
				const year = this.currentYear;
				const month = this.currentMonth - 1;
				const firstDay = new Date(year, month, 1);
				const daysInMonth = new Date(year, month + 1, 0).getDate();
				const startWeekday = firstDay.getDay(); // 获取1号是星期几 (0=周日, 1=周一, ..., 6=周六)

				const dates = [];
				const today = new Date();

				// 添加空白占位符，确保1号显示在正确的星期位置
				for (let i = 0; i < startWeekday; i++) {
					dates.push({
						day: '',
						key: `empty-${i}`,
						isEmpty: true,
						signed: false,
						isToday: false
					});
				}

				// 添加当前月的日期
				for (let day = 1; day <= daysInMonth; day++) {
					const currentDate = new Date(year, month, day);
					const isToday = currentDate.toDateString() === today.toDateString();
					const signed = this.isDateSigned(currentDate);

					dates.push({
						day: day,
						key: `current-${day}`,
						isEmpty: false,
						signed: signed,
						isToday: isToday
					});
				}

				this.calendarDates = dates;
			},
			// 上一个月
			prevMonth() {
				if (this.currentMonth === 1) {
					this.currentMonth = 12;
					this.currentYear--;
				} else {
					this.currentMonth--;
				}
				this.generateCalendarDates();
			},
			// 下一个月
			nextMonth() {
				if (this.currentMonth === 12) {
					this.currentMonth = 1;
					this.currentYear++;
				} else {
					this.currentMonth++;
				}
				this.generateCalendarDates();
			},

			getColor() {
				colorChange('color_change').then((res) => {
					this.sginBg = `${this.imgHost}/statics/images/sgin_bg_${res.data.status}.png`;
					this.sginTip = `${this.imgHost}/statics/images/sgin_tip_${res.data.status}.png`;
					let theme = ['#1db0fc', '#42CA4D', '#e93323', '#ff448f', '#FE5C2D'];

					// 确保状态值在有效范围内，防止数组越界
					const statusIndex = res.data.status - 1;
					const backgroundColor = (statusIndex >= 0 && statusIndex < theme.length)
						? theme[statusIndex]
						: theme[0]; // 默认使用第一个颜色

					// 使用安全的导航栏颜色设置函数
					this.safeSetNavigationBarColor('#ffffff', backgroundColor);
				}).catch((error) => {
					console.error('获取颜色配置失败:', error);
					// 设置默认导航栏颜色
					this.safeSetNavigationBarColor('#ffffff', '#1db0fc');
				});
			},
			/**
			 * 获取签到配置
			 */
			getSignSysteam: function() {
				let that = this;
				getSignConfig().then((res) => {
					if (!res.data.signStatus) {
						return that.$util.Tips({
							title: that.$t(`签到功能已关闭`)
						}, {
							tab: 3
						});
					}
					that.$set(that, 'signSystemList', res.data.signList);
					that.signMode = res.data.signMode;
					that.nextContinuousDays = res.data.nextContinuousDays;
					that.nextCumulativeDays = res.data.nextCumulativeDays;
					that.continuousSignDays = res.data.continuousSignDays;
					that.signRemindSwitch = res.data.signRemindSwitch;
					that.checkSign = res.data.checkSign;
					that.remindStatus = !!res.data.signRemindStatus;
					that.signGivePoint = res.data.signGivePoint || 0;
					that.signCount = that.PrefixInteger(res.data.cumulativeSignDays, 4);

					// 数据加载完成后，重新生成月份数据
					that.initCalendarData();
				});
			},
			changeRemind(e) {
				let status = e.detail.value ? 1 : 0;
				changeRemindStatus(status).then((res) => {
					console.log(res);
				});
			},
			getTypeImg(type, isSgin) {
				let src;
				if (isSgin) {
					src = `${this.imgHost}/statics/images/sgin_suc_1.png`;
					return src;
				}
				switch (type) {
					case 1:
						src = `${this.imgHost}/statics/images/sgin_icon_1.png`;
						break;
					case 2:
						src = `${this.imgHost}/statics/images/sgin_icon_2.png`;
						break;
					case 3:
						src = `${this.imgHost}/statics/images/sgin_icon_3.png`;
						break;
					case 4:
						src = `${this.imgHost}/statics/images/sgin_icon_3.png`;
						break;
				}
				return src;
			},
			/**
			 * 去签到记录页面
			 *
			 */
			goSignList: function() {
				uni.navigateTo({
					url: '/pages/users/user_sgin_list/index'
				});
			},
			/**
			 * 获取用户信息
			 */
			getUserInfo: function() {
				let that = this;
				postSignUser({
					sign: 1
				}).then((res) => {
					// res.data.integral = parseInt(res.data.integral);
					// let sum_sgin_day = res.data.sum_sgin_day;
					// that.$set(that, 'userInfo', res.data);
					// // that.signCount = that.PrefixInteger(sum_sgin_day, 4);
					// that.sign_index = res.data.sign_num;
				});
			},

			/**
			 * 获取签到列表
			 *
			 */
			getSignList: function() {
				let that = this;
				getSignList({
					page: 1,
					limit: 8
				}).then((res) => {
					that.$set(that, 'signList', res.data);
				});
			},
			/**
			 * 数字转中文
			 *
			 */
			Rp: function(n) {
				let cnum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
				let s = '';
				n = '' + n; // 数字转为字符串
				for (let i = 0; i < n.length; i++) {
					s += cnum[parseInt(n.charAt(i))];
				}
				return s;
			},
			/**
			 * 数字分割为数组
			 * @param int num 需要分割的数字
			 * @param int length 需要分割为n位数组
			 */
			PrefixInteger: function(num, length) {
				return (Array(length).join('0') + num).slice(-length).split('');
			},

			/**
			 * 用户签到
			 */
			goSign: function(e) {
				let that = this;
				if (that.checkSign) {
					return this.$util.Tips({
						title: that.$t(`您今日已签到!`)
					});
				}
				setSignIntegral()
					.then((res) => {
						that.active = true;
						that.integral = res.data.integral;
						// 签到成功后重新获取数据
						that.getSignSysteam();
						that.getSignList();
					})
					.catch((err) => {
						return this.$util.Tips({
							title: err
						});
					});
			},
			/**
			 * 自定义开关点击事件
			 */
			toggleCustomRemind: function() {
				let status = this.remindStatus ? 0 : 1;
				changeRemindStatus(status).then(() => {
					this.remindStatus = !!status;
					this.$util.Tips({
						title: status ? '开启签到提醒成功' : '关闭签到提醒成功'
					});
				}).catch(err => {
					this.$util.Tips({
						title: err.message || '操作失败'
					});
				});
			},
			/**
			 * 关闭签到提示
			 */
			close: function() {
				this.active = false;
			}
		}
	};
</script>

<style scoped lang="scss">
	/* #ifndef APP-NVUE */
	page {
		background-color: #f5f5f5 !important;
	}
	/* #endif */

	.sign-page {
		min-height: 100vh;
		/* #ifdef H5 */
		background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #FFFFFF 100%);
		/* #endif */
		/* #ifdef MP */
		background: linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 50%, #FFFFFF 100%);
		/* #endif */
		/* #ifdef APP-PLUS */
		background-color: #87CEEB;
		/* #endif */
	}

	/* #ifdef APP-PLUS */
	.sign-page::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #FFFFFF 100%);
		z-index: -1;
	}
	/* #endif */

	.main-content {
		position: relative;
		padding: 40rpx 30rpx;
		/* #ifdef APP-PLUS */
		z-index: 1;
		/* #endif */
	}

	.header-bg {
		position: relative;
		height: 320rpx;
		padding: 40rpx 0;
		overflow: visible;
	}

	/* 连续签到天数 */
	.continuous-days {
		position: absolute;
		left: 40rpx;
		top: 40rpx;
		width: 120rpx;
		height: 120rpx;
		text-align: center;
		background: linear-gradient(135deg, #FFE4E1 0%, #FFF0F5 100%);
		border-radius: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		/* #ifdef H5 */
		box-shadow: 0 6rpx 20rpx rgba(255, 107, 107, 0.2);
		/* #endif */
		/* #ifdef MP */
		box-shadow: 0 6rpx 20rpx rgba(255, 107, 107, 0.2);
		/* #endif */
		/* #ifdef APP-PLUS */
		border: 2rpx solid #FFB6C1;
		z-index: 2;
		/* #endif */

		.days-label {
			font-size: 18rpx;
			color: #FF6B6B;
			font-weight: 500;
			margin-bottom: 4rpx;
			letter-spacing: 1rpx;
			/* #ifdef MP */
			font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
			/* #endif */
		}

		.days-number {
			font-size: 44rpx;
			font-weight: bold;
			color: #FF1744;
			line-height: 1;
			margin-bottom: 2rpx;
			/* #ifdef MP */
			font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
			/* #endif */
		}

		.days-unit {
			font-size: 18rpx;
			color: #FF6B6B;
			font-weight: 500;
			letter-spacing: 1rpx;
			/* #ifdef MP */
			font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
			/* #endif */
		}
	}

	/* 中央日历图标 */
	.calendar-icon {
		position: absolute;
		left: 50%;
		top: 20rpx;
		/* #ifdef H5 */
		transform: translateX(-50%);
		/* #endif */
		/* #ifndef H5 */
		margin-left: -100rpx;
		/* #endif */
		width: 200rpx;
		height: 200rpx;
		/* #ifdef APP-PLUS */
		z-index: 2;
		/* #endif */

		.calendar-header {
			position: relative;
			/* #ifdef H5 */
			background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
			/* #endif */
			/* #ifdef MP */
			background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
			/* #endif */
			/* #ifdef APP-PLUS */
			background-color: #FF6B6B;
			/* #endif */
			border-radius: 20rpx 20rpx 8rpx 8rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			.calendar-pin {
				position: absolute;
				top: -10rpx;
				width: 16rpx;
				height: 30rpx;
				background: #FFF;
				border-radius: 8rpx;

				&.left-pin {
					left: 30rpx;
				}

				&.right-pin {
					right: 30rpx;
				}
			}

			.calendar-title {
				font-size: 20rpx;
				color: #FFF;
				font-weight: 500;
				/* #ifdef MP */
				font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
				/* #endif */
			}
		}

		.calendar-body {
			background: #FFF;
			border-radius: 8rpx 8rpx 20rpx 20rpx;
			height: 140rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			/* #ifdef H5 */
			box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
			/* #endif */
			/* #ifdef MP */
			box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
			/* #endif */
			/* #ifdef APP-PLUS */
			border: 1rpx solid #f0f0f0;
			/* #endif */

			.calendar-number {
				font-size: 60rpx;
				font-weight: bold;
				color: #FF6B6B;
				line-height: 1.2;
				/* #ifdef MP */
				font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
				/* #endif */
			}

			.calendar-unit {
				font-size: 24rpx;
				color: #666;
				margin-top: 8rpx;
				/* #ifdef MP */
				font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
				/* #endif */
			}
		}
	}

	/* 右侧统计数据 */
	.right-stats {
		position: absolute;
		right: 40rpx;
		top: 40rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		/* #ifdef APP-PLUS */
		z-index: 2;
		/* #endif */

		.stat-item {
			text-align: center;

			.stat-number {
				width: 60rpx;
				height: 60rpx;
				background: rgba(255, 255, 255, 0.9);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 24rpx;
				font-weight: bold;
				color: #FF6B6B;
				margin: 0 auto 8rpx;
				/* #ifdef H5 */
				box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
				/* #endif */
				/* #ifdef MP */
				box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
				/* #endif */
				/* #ifdef APP-PLUS */
				border: 1rpx solid #f0f0f0;
				/* #endif */
			}

			.stat-label {
				font-size: 18rpx;
				color: #666;
				white-space: nowrap;
				/* #ifdef MP */
				font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
				/* #endif */
			}
		}
	}

	/* 查看日历按钮 */
	.calendar-btn {
		position: absolute;
		left: 50%;
		bottom: 40rpx;
		/* #ifdef H5 */
		transform: translateX(-50%);
		/* #endif */
		/* #ifndef H5 */
		margin-left: -80rpx;
		/* #endif */
		background: rgba(255, 255, 255, 0.9);
		padding: 16rpx 32rpx;
		border-radius: 40rpx;
		font-size: 24rpx;
		color: #666;
		/* #ifdef H5 */
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
		/* #endif */
		/* #ifdef MP */
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
		/* #endif */
		/* #ifdef APP-PLUS */
		border: 1rpx solid #e0e0e0;
		z-index: 2;
		/* #endif */
	}

	/* 签到提醒开关 */
	.remind-switch {
		position: absolute;
		right: 0;
		top: 60%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #F8E8FF 0%, #E8F4FD 100%);
		padding: 15rpx 20rpx;
		border-radius: 30rpx 0 0 30rpx;
		width: 100rpx;
		height: 80rpx;
		z-index: 10;
		/* #ifdef H5 */
		box-shadow: -4rpx 4rpx 15rpx rgba(0, 0, 0, 0.08);
		/* #endif */
		/* #ifdef MP */
		box-shadow: -4rpx 4rpx 15rpx rgba(0, 0, 0, 0.08);
		/* #endif */
		/* #ifdef APP-PLUS */
		border: 1rpx solid #e0e0e0;
		border-right: none;
		/* #endif */

		.switch-label {
			font-size: 20rpx;
			color: #D2691E;
			font-weight: 600;
			margin-bottom: 6rpx;
			text-align: center;
			/* #ifdef MP */
			font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
			/* #endif */
		}

		/* 自定义开关样式 */
		.custom-switch {
			position: relative;
			width: 50rpx;
			height: 26rpx;
			background: #E0E0E0;
			border-radius: 13rpx;
			transition: all 0.3s ease;
			flex-shrink: 0;

			&.active {
				background: linear-gradient(135deg, #FF69B4, #FFB347);
			}

			.switch-handle {
				position: absolute;
				top: 2rpx;
				left: 2rpx;
				width: 22rpx;
				height: 22rpx;
				background: #FFF;
				border-radius: 50%;
				transition: all 0.3s ease;
				/* #ifdef H5 */
				box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
				/* #endif */
				/* #ifdef MP */
				box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
				/* #endif */
				/* #ifdef APP-PLUS */
				border: 1rpx solid #ddd;
				/* #endif */
			}

			&.active .switch-handle {
				left: 26rpx;
			}
		}
	}

	/* 签到按钮 */
	.sign-button-container {
		margin: 40rpx 0 40rpx;
		padding: 0 30rpx;
		display: flex;
		justify-content: center;
		/* #ifdef APP-PLUS */
		z-index: 2;
		position: relative;
		/* #endif */

		.sign-button {
			width: 85%;
			max-width: 600rpx;
			height: 100rpx;
			/* #ifdef H5 */
			background: linear-gradient(135deg, #FFB347 0%, #FF69B4 100%);
			/* #endif */
			/* #ifdef MP */
			background: linear-gradient(135deg, #FFB347 0%, #FF69B4 100%);
			/* #endif */
			/* #ifdef APP-PLUS */
			background: linear-gradient(135deg, #FFB347 0%, #FF69B4 100%);
			/* #endif */
			border-radius: 50rpx;
			border: none;
			font-size: 32rpx;
			font-weight: bold;
			color: #FFF;
			letter-spacing: 2rpx;
			/* #ifdef H5 */
			box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.4);
			/* #endif */
			/* #ifdef MP */
			box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.4);
			/* #endif */
			/* #ifdef APP-PLUS */
			box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.4);
			/* #endif */
			/* #ifdef MP */
			font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
			/* #endif */
			transition: all 0.3s ease;

			&:active {
				transform: translateY(2rpx);
				/* #ifdef H5 */
				box-shadow: 0 6rpx 20rpx rgba(255, 105, 180, 0.3);
				/* #endif */
				/* #ifdef MP */
				box-shadow: 0 6rpx 20rpx rgba(255, 105, 180, 0.3);
				/* #endif */
				/* #ifdef APP-PLUS */
				box-shadow: 0 6rpx 20rpx rgba(255, 105, 180, 0.3);
				/* #endif */
			}

			&:disabled {
				opacity: 0.7;
				transform: none;
				/* 保持渐变色，只是降低透明度 */
			}
		}
	}
	/* 日期滑动区域 */
	.date-slider {
		margin: 40rpx 0;
		background: #FFF;
		border-radius: 20rpx;
		padding: 20rpx;
		/* #ifdef H5 */
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
		/* #endif */
		/* #ifdef MP */
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
		/* #endif */
		/* #ifdef APP-PLUS */
		border: 1rpx solid #f0f0f0;
		/* #endif */

		.date-scroll {
			height: 120rpx;
			white-space: nowrap;
		}

		.date-container {
			display: flex;
			align-items: center;
			padding: 0 20rpx;
			height: 100%;
		}

		.date-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 100rpx;
			flex-shrink: 0;
			margin-right: 20rpx;

			&:last-child {
				margin-right: 0;
			}

			&.signed {
				.date-text {
					color: #FF6B6B;
					font-weight: bold;
				}
			}

			&.today .date-text {
				color: #FF6B6B;
				font-weight: bold;
			}

			.date-icon {
				width: 60rpx;
				height: 60rpx;
				margin-bottom: 8rpx;

				.sign-icon {
					width: 100%;
					height: 100%;
				}
			}

			.date-text {
				font-size: 20rpx;
				color: #666;
				text-align: center;
				/* #ifdef MP */
				font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
				/* #endif */
			}
		}
	}

	/* 签到记录 */
	.sign-records {
		background: #FFF;
		border-radius: 20rpx;
		margin: 20rpx 30rpx;
		padding: 30rpx;
		/* #ifdef H5 */
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
		/* #endif */
		/* #ifdef MP */
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
		/* #endif */
		/* #ifdef APP-PLUS */
		border: 1rpx solid #f0f0f0;
		/* #endif */

		.records-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;

			.records-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				/* #ifdef MP */
				font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
				/* #endif */
			}

			.records-more {
				font-size: 24rpx;
				color: #999;
				/* #ifdef MP */
				font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
				/* #endif */
			}
		}

		.records-list {
			.record-item {
				display: flex;
				align-items: center;
				padding: 20rpx 0;
				border-bottom: 1rpx solid #F5F5F5;

				&:last-child {
					border-bottom: none;
				}

				.record-icon {
					width: 60rpx;
					height: 60rpx;
					margin-right: 20rpx;

					image {
						width: 100%;
						height: 100%;
						/* #ifdef APP-PLUS */
						border-radius: 8rpx;
						/* #endif */
					}
				}

				.record-info {
					flex: 1;

					.record-title {
						font-size: 28rpx;
						color: #333;
						margin-bottom: 8rpx;
						/* #ifdef MP */
						font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
						/* #endif */
					}

					.record-date {
						font-size: 24rpx;
						color: #999;
						/* #ifdef MP */
						font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
						/* #endif */
					}
				}

				.record-reward {
					display: flex;
					align-items: center;
					font-size: 28rpx;
					font-weight: bold;
					color: #FF6B6B;
					/* #ifdef MP */
					font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
					/* #endif */

					image {
						width: 32rpx;
						height: 32rpx;
						margin-left: 8rpx;
					}
				}
			}
		}
	}

	/* 日历弹窗 */
	.calendar-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-end;
		z-index: 1000;
		/* #ifdef APP-PLUS */
		justify-content: center;
		align-items: center;
		/* #endif */

		.calendar-content {
			width: 100%;
			background: linear-gradient(135deg, #F8FFFE 0%, #F0F8FF 100%);
			/* #ifndef APP-PLUS */
			border-radius: 40rpx 40rpx 0 0;
			/* #endif */
			/* #ifdef APP-PLUS */
			border-radius: 30rpx;
			margin: 0 40rpx;
			/* #endif */
			padding: 50rpx 30rpx 60rpx;
			/* #ifdef H5 */
			box-shadow: 0 -10rpx 40rpx rgba(0, 0, 0, 0.1);
			/* #endif */
			/* #ifdef MP */
			box-shadow: 0 -10rpx 40rpx rgba(0, 0, 0, 0.1);
			/* #endif */
			/* #ifdef APP-PLUS */
			max-height: 80vh;
			overflow-y: auto;
			box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.15);
			/* #endif */

			.calendar-modal-header {
				text-align: center;
				margin-bottom: 40rpx;

				.modal-title {
					font-size: 32rpx;
					font-weight: 500;
					color: #666;
					/* #ifdef MP */
					font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
					/* #endif */

					.highlight-number {
						color: #FF6B6B;
						font-weight: bold;
						font-size: 36rpx;
					}
				}
			}

			.calendar-nav {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 40rpx;

				.nav-btn {
					width: 60rpx;
					height: 60rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					background: linear-gradient(135deg, #FFE8E8, #FFF0F0);
					border-radius: 50%;
					/* #ifdef H5 */
					box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.15);
					/* #endif */
					/* #ifdef MP */
					box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.15);
					/* #endif */
					/* #ifdef APP-PLUS */
					border: 1rpx solid #FFD0D0;
					/* #endif */

					.nav-arrow {
						font-size: 28rpx;
						color: #FF6B6B;
						font-weight: bold;
						/* #ifdef MP */
						font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
						/* #endif */
					}
				}

				.nav-title {
					font-size: 36rpx;
					font-weight: bold;
					color: #FF6B6B;
					/* #ifdef MP */
					font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
					/* #endif */
				}
			}

			.calendar-grid {
				.weekdays {
					display: flex;
					margin-bottom: 30rpx;

					.weekday {
						flex: 1;
						text-align: center;
						font-size: 26rpx;
						color: #999;
						padding: 20rpx 0;
						font-weight: 500;
						/* #ifdef MP */
						font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
						/* #endif */
					}
				}

				.calendar-dates {
					display: grid;
					grid-template-columns: repeat(7, 1fr);
					gap: 15rpx;
					padding: 0 10rpx;

					.calendar-date {
						height: 120rpx;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						position: relative;
						border-radius: 20rpx;





						&.today {
							background: #FF6B6B;
							border: 2rpx solid #FF6B6B;
							border-radius: 20rpx;
							/* #ifdef H5 */
							box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
							/* #endif */
							/* #ifdef MP */
							box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
							/* #endif */
							/* #ifdef APP-PLUS */
							border: 2rpx solid #FF6B6B;
							/* #endif */

							.date-number {
								color: #FFF;
								font-weight: bold;
							}
						}

						&.signed {
							background: linear-gradient(135deg, #FFE8E8, #FFF0F0);
							border: 2rpx solid #FFD0D0;
							border-radius: 20rpx;
							/* #ifdef H5 */
							box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.15);
							/* #endif */
							/* #ifdef MP */
							box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.15);
							/* #endif */
							/* #ifdef APP-PLUS */
							border: 2rpx solid #FFD0D0;
							/* #endif */

							.date-number {
								opacity: 0;
								visibility: hidden;
							}

							.sign-icon {
								position: absolute;
								top: 37%;
								left: 50%;
								transform: translate(-50%, -50%);
								width: 50rpx;
								height: 50rpx;
								z-index: 2;
							}

							.status-text {
								font-size: 20rpx;
								color: #FF6B6B;
								font-weight: 500;
								margin-top: 8rpx;
							}
						}

						.date-number {
							font-size: 30rpx;
							color: #333;
							text-align: center;
							font-weight: 500;
						}

						.date-status {
							position: absolute;
							bottom: 5rpx;

							.status-text {
								font-size: 18rpx;
								color: #FF6B6B;
								background: rgba(255, 107, 107, 0.1);
								padding: 2rpx 8rpx;
								border-radius: 10rpx;
							}
						}
					}
				}
			}
		}
	}

	/* 签到成功弹窗 */
	.sign-success-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1001;

		.success-content {
			background: #FFF;
			border-radius: 20rpx;
			padding: 60rpx 40rpx;
			text-align: center;
			margin: 0 60rpx;
			/* #ifdef H5 */
			box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.2);
			/* #endif */
			/* #ifdef MP */
			box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.2);
			/* #endif */
			/* #ifdef APP-PLUS */
			border: 1rpx solid #e0e0e0;
			/* #endif */

			.success-icon {
				margin-bottom: 30rpx;

				image {
					width: 120rpx;
					height: 120rpx;
				}
			}

			.success-text {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 20rpx;
				/* #ifdef MP */
				font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
				/* #endif */
			}

			.success-reward {
				font-size: 28rpx;
				color: #FF6B6B;
				margin-bottom: 40rpx;
				/* #ifdef MP */
				font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
				/* #endif */
			}

			.success-btn {
				/* #ifdef H5 */
				background: linear-gradient(135deg, #FFB347, #FF8C42);
				/* #endif */
				/* #ifdef MP */
				background: linear-gradient(135deg, #FFB347, #FF8C42);
				/* #endif */
				/* #ifdef APP-PLUS */
				background-color: #FFB347;
				/* #endif */
				color: #FFF;
				font-size: 28rpx;
				font-weight: bold;
				padding: 20rpx 60rpx;
				border-radius: 40rpx;
				border: none;
				/* #ifdef MP */
				font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
				/* #endif */
			}
		}
	}
	</style>
	