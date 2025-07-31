<template>
	<view class="jsfun-record" @tap="showPicker">
		<slot></slot>
		<!-- 遮罩层 -->
		<view class="mask" @tap.stop="closePicker" v-if="visible" @touchmove.stop.prevent="preventMove"></view>
		<!-- 录音控件 -->
		<view class="record-container" :class="{'show': visible}">
			<!-- 录音时长显示 -->
			<view class="time-display">{{formattedTime}}</view>
			<view class="time-hint">最短{{minTime}}秒，最长{{maxTime}}秒</view>
			
			<!-- 录音操作区域 -->
			<view class="record-box">
				<!-- 停止播放按钮 -->
				<span class="control-btn stop-btn" @tap.stop="stopPlayback" v-if="voiceFile && isPlaying"></span>
				<!-- 播放按钮 -->
				<span class="control-btn play-btn" @tap.stop="startPlayback" v-if="voiceFile && !isPlaying"></span>
				
				<!-- 录音按钮 -->
				<canvas 
					class="record-canvas" 
					canvas-id="recordCanvas" 
					@touchstart="handleTouchStart" 
					@longpress="startRecording" 
					@touchend="stopRecording" 
					@touchmove.stop.prevent="preventMove"
				>
					<span class="record-indicator" :class="{'recording': isRecording}"></span>
				</canvas>
				
				<!-- 确认按钮 -->
				<span class="control-btn confirm-btn" @tap.stop="confirmRecording" v-if="voiceFile"></span>
			</view>
			
			<view class="instruction-text">长按录音</view>
		</view>
	</view>
</template>

<script>
// 录音管理器兼容性处理
let recorderManager = null;
let audioContext = null;

// #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
if (typeof uni.getRecorderManager === 'function') {
	recorderManager = uni.getRecorderManager();
}
// #endif

// #ifdef H5
// H5环境下的录音处理
if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
	// 支持录音
} else {
	console.warn('当前环境不支持录音功能');
}
// #endif

export default {
	name: 'jc-record',
	props: {
		voicePath: {
			type: String,
			default: ''
		},
		maxTime: {
			type: Number,
			default: 15
		},
		minTime: {
			type: Number,
			default: 5
		},
		autoShow: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			visible: false,
			isRecording: false,
			isPlaying: false,
			recordTime: 0,
			playbackTime: 0,
			voiceFile: '',
			
			// 定时器
			recordTimer: null,
			playbackTimer: null,
			animationTimer: null,
			
			// Canvas相关
			canvasContext: null,
			canvasWidth: 0,
			canvasHeight: 0,
			centerX: 0,
			centerY: 0,
			indicatorRadius: 0,
			
			// 动画参数
			animationAngle: -0.5,
			frameInterval: 50
		}
	},
	computed: {
		formattedTime() {
			const time = this.isPlaying ? this.playbackTime : this.recordTime;
			const minutes = Math.floor(time / 60);
			const seconds = time % 60;
			return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
	},
	mounted() {
		this.initializeComponent();
	},
	beforeDestroy() {
		this.cleanup();
	},
	methods: {
		// 组件初始化
		async initializeComponent() {
			// 不进行权限检查，直接初始化基础功能
			this.setupAudioContext();
			this.setupRecorderEvents();
			this.setupCanvasDimensions();

			if (this.autoShow) {
				this.$nextTick(() => this.showPicker());
			}
		},
		
		// 请求录音权限
		async requestPermissions() {
  try {
    await uni.authorize({ scope: 'scope.record' });
    // 授权成功
  } catch (error) {
    // 授权失败，提示并引导用户去设置
    uni.showModal({
      title: '权限申请',
      content: '需要录音权限才能使用此功能，请在设置中开启录音权限',
      showCancel: true,
      success: (res) => {
        if (res.confirm) {
          uni.openSetting();
        }
      }
    });
  }
		},
		
		// 设置音频上下文
		setupAudioContext() {
			audioContext = uni.createInnerAudioContext();
			audioContext.onEnded(() => {
				this.isPlaying = false;
				this.playbackTime = 0;
				this.clearTimer('playbackTimer');
			});
			audioContext.onError((error) => {
				this.handleAudioError(error);
			});
		},
		
		// 设置录音事件
		setupRecorderEvents() {
			if (!recorderManager) {
				console.warn('录音管理器不可用');
				return;
			}

			recorderManager.onStop((result) => {
				this.voiceFile = result.tempFilePath;
				this.$emit('recorded', result.tempFilePath);
			});

			recorderManager.onError((error) => {
				this.handleRecordError(error);
			});
		},
		
		// 设置Canvas尺寸
		setupCanvasDimensions() {
			this.$nextTick(() => {
				const query = uni.createSelectorQuery().in(this);
				
				// 获取Canvas尺寸
				query.select('.record-canvas').boundingClientRect((rect) => {
					if (rect) {
						this.canvasWidth = rect.width;
						this.canvasHeight = rect.height;
						this.centerX = rect.width / 2;
						this.centerY = rect.height / 2;
						this.canvasContext = uni.createCanvasContext('recordCanvas', this);
					}
				});
				
				// 获取录音指示器尺寸
				query.select('.record-indicator').boundingClientRect((rect) => {
					if (rect) {
						this.indicatorRadius = rect.width / 2 + 4;
					}
				});
				
				query.exec();
			});
		},
		
		// 显示录音面板
		showPicker() {
			this.visible = true;
			this.$emit('show');
		},
		
		// 关闭录音面板
		closePicker() {
			this.visible = false;
			this.resetState();
			this.$emit('close');
		},
		
		// 重置状态
		resetState() {
			this.stopPlayback();
			this.voiceFile = '';
			this.recordTime = 0;
			this.playbackTime = 0;
			this.clearAllTimers();
			this.clearCanvas();
		},
		
		// 触摸开始
		handleTouchStart() {
			this.stopPlayback();
			this.voiceFile = '';
			this.recordTime = 0;
		},
		
		// 开始录音
		startRecording() {
			if (this.isRecording) return;
			
			this.isRecording = true;
			this.recordTime = 0;
			
			// 开始录音
			if (!recorderManager) {
				uni.showToast({
					title: '当前环境不支持录音',
					icon: 'none'
				});
				return;
			}

			recorderManager.start({
				duration: this.maxTime * 1000,
				sampleRate: 16000,
				numberOfChannels: 1,
				encodeBitRate: 96000,
				format: 'mp3'
			});
			
			// 开始计时
			this.recordTimer = setInterval(() => {
				this.recordTime++;
				if (this.recordTime >= this.maxTime) {
					this.stopRecording();
				}
			}, 1000);
			
			// 开始动画
			this.startRecordingAnimation();
		},
		
		// 停止录音
		stopRecording() {
			if (!this.isRecording) return;
			
			const recordDuration = this.recordTime;
			this.isRecording = false;
			this.clearTimer('recordTimer');
			this.clearTimer('animationTimer');
			this.clearCanvas();
			
			// 检查录音时长
			if (recordDuration < this.minTime) {
				if (recordDuration <= 0) return;
				
				uni.showToast({
					title: `录音时长不能少于${this.minTime}秒`,
					icon: 'none'
				});
				this.recordTime = 0;
				return;
			}
			
			if (recorderManager) {
				recorderManager.stop();
			}
		},
		
		// 开始录音动画
		startRecordingAnimation() {
			if (!this.canvasContext) return;
			
			// 绘制背景圆环
			this.drawBackgroundCircle();
			
			// 重置动画角度
			this.animationAngle = -0.5;
			
			// 开始进度动画
			this.animationTimer = setInterval(() => {
				this.drawProgressCircle();
			}, this.frameInterval);
		},
		
		// 绘制背景圆环
		drawBackgroundCircle() {
			this.canvasContext.beginPath();
			this.canvasContext.setStrokeStyle('#fe3b54');
			this.canvasContext.setGlobalAlpha(0.3);
			this.canvasContext.setLineWidth(3);
			this.canvasContext.arc(this.centerX, this.centerY, this.indicatorRadius, 0, 2 * Math.PI);
			this.canvasContext.stroke();
			this.canvasContext.draw();
		},
		
		// 绘制进度圆环
		drawProgressCircle() {
			this.canvasContext.beginPath();
			this.canvasContext.setStrokeStyle('#fe3b54');
			this.canvasContext.setGlobalAlpha(1);
			this.canvasContext.setLineWidth(3);
			
			const endAngle = this.animationAngle + (2 / (this.maxTime * 1000 / this.frameInterval));
			this.canvasContext.arc(
				this.centerX, 
				this.centerY, 
				this.indicatorRadius, 
				-0.5 * Math.PI, 
				endAngle * Math.PI, 
				false
			);
			
			this.canvasContext.stroke();
			this.canvasContext.draw(true);
			
			this.animationAngle = endAngle;
		},
		
		// 清除Canvas
		clearCanvas() {
			if (!this.canvasContext) return;
			
			this.canvasContext.setFillStyle('#fff');
			this.canvasContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
			this.canvasContext.draw();
		},
		
		// 开始播放
		startPlayback() {
			if (!this.voiceFile || this.isPlaying) return;
			
			audioContext.src = this.voiceFile;
			audioContext.stop(); // 确保之前的播放已停止
			audioContext.play();
			
			this.isPlaying = true;
			this.playbackTime = this.recordTime;
			
			// 播放倒计时
			this.playbackTimer = setInterval(() => {
				this.playbackTime--;
				if (this.playbackTime <= 0) {
					this.stopPlayback();
				}
			}, 1000);
		},
		
		// 停止播放
		stopPlayback() {
			if (audioContext) {
				audioContext.stop();
			}
			this.isPlaying = false;
			this.playbackTime = 0;
			this.clearTimer('playbackTimer');
		},
		
		// 确认录音
		confirmRecording() {
			if (!this.voiceFile) return;
			
			this.$emit('confirm', this.voiceFile);
			this.closePicker();
		},
		
		// 清除指定定时器
		clearTimer(timerName) {
			if (this[timerName]) {
				clearInterval(this[timerName]);
				this[timerName] = null;
			}
		},
		
		// 清除所有定时器
		clearAllTimers() {
			this.clearTimer('recordTimer');
			this.clearTimer('playbackTimer');
			this.clearTimer('animationTimer');
		},
		
		// 处理录音错误
		handleRecordError(error) {
			this.isRecording = false;
			this.clearAllTimers();
			this.clearCanvas();
			
			uni.showToast({
				title: '录音失败，请重试',
				icon: 'none'
			});
			
			this.$emit('error', { type: 'record', error });
		},
		
		// 处理音频错误
		handleAudioError(error) {
			this.isPlaying = false;
			this.clearTimer('playbackTimer');
			
			uni.showToast({
				title: '播放失败',
				icon: 'none'
			});
			
			this.$emit('error', { type: 'audio', error });
		},
		
		// 阻止默认事件
		preventMove() {
			return false;
		},
		
		// 组件清理
		cleanup() {
			this.clearAllTimers();
			if (audioContext) {
				audioContext.destroy();
				audioContext = null;
			}
		}
	}
}
</script>

<style>
/* 小程序兼容：将SCSS嵌套语法改为普通CSS */
.jsfun-record .mask {
	position: fixed;
	z-index: 1000;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
}

.jsfun-record .record-container {
	position: fixed;
	z-index: 1001;
	right: 0;
	left: 0;
	bottom: 0;
	min-height: 600rpx;
	background: #fff;
	text-align: center;
	transition: transform 0.3s ease;
	transform: translateY(100%);
	border-radius: 20rpx 20rpx 0 0;
	padding: 40rpx 0;
	padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.jsfun-record .record-container.show {
	transform: translateY(0);
}

.jsfun-record .time-display {
	font-size: 60rpx;
	color: #000;
	line-height: 100rpx;
	margin-top: 20rpx;
	font-weight: 500;
}

.jsfun-record .time-hint {
	color: #999;
	font-size: 28rpx;
	margin-bottom: 30rpx;
}

.jsfun-record .record-box {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx 0;
	flex: 1;
}

.jsfun-record .record-canvas {
	position: relative;
	width: 200rpx;
	height: 200rpx;
	margin: 0 60rpx;
	z-index: 10;
}

.jsfun-record .record-canvas .record-indicator {
	position: absolute;
	top: 20rpx;
	left: 20rpx;
	width: 160rpx;
	height: 160rpx;
	border: 1px dashed #fe3b54;
	border-radius: 50%;
	background: #fe3b54 url(../../static/jc-record/recording.png) no-repeat center;
	background-size: 50%;
	z-index: 100;
	transition: all 0.2s ease;
}

.jsfun-record .record-canvas .record-indicator.recording {
	transform: scale(1.05);
	box-shadow: 0 0 20rpx rgba(254, 59, 84, 0.3);
}

.jsfun-record .control-btn {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background-size: 100%;
	cursor: pointer;
	transition: transform 0.2s ease;
}

.jsfun-record .control-btn:active {
	transform: scale(0.95);
}

.jsfun-record .stop-btn {
	background-image: url(../../static/jc-record/stop.png);
}

.jsfun-record .play-btn {
	background-image: url(../../static/jc-record/play.png);
}

.jsfun-record .confirm-btn {
	background-image: url(../../static/jc-record/confirm.png);
}

.jsfun-record .instruction-text {
	color: #666;
	font-size: 28rpx;
	margin-top: 30rpx;
	margin-bottom: 0;
}

/* 平台兼容性样式 */
/* #ifdef H5 */
.jsfun-record .record-container {
	padding-bottom: 60rpx !important;
}
/* #endif */

/* #ifdef MP-WEIXIN */
.jsfun-record .record-container {
	padding-bottom: calc(40rpx + env(safe-area-inset-bottom, 0rpx)) !important;
}
/* #endif */

/* #ifdef APP-PLUS */
.jsfun-record .record-container {
	padding-bottom: calc(40rpx + env(safe-area-inset-bottom, 0rpx)) !important;
}
/* #endif */

/* 小屏幕设备适配 */
@media screen and (max-height: 667px) {
	.jsfun-record .record-container {
		min-height: 500rpx;
		padding: 30rpx 0;
		padding-bottom: calc(30rpx + env(safe-area-inset-bottom, 0rpx));
	}

	.jsfun-record .time-display {
		font-size: 50rpx;
		margin-top: 10rpx;
	}

	.jsfun-record .record-canvas {
		width: 160rpx;
		height: 160rpx;
	}

	.jsfun-record .record-canvas .record-indicator {
		top: 15rpx;
		left: 15rpx;
		width: 130rpx;
		height: 130rpx;
	}
}
</style>