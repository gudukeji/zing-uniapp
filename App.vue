<script setup>
import { reactive, computed, watch, getCurrentInstance } from 'vue'
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useStore } from 'vuex'
import appConfig from './config/app.js'
const { HTTP_REQUEST_URL } = appConfig
import { basicConfig, remoteRegister } from '@/api/public'
import Routine from './libs/routine.js'
import { silenceBindingSpread, initWorkermanUrl } from '@/utils'
import { colorChange, getCrmebCopyRight } from '@/api/api.js'
import { getLangJson, getLangVersion } from '@/api/user.js'
import Cache from '@/utils/cache'
import themeList from '@/utils/theme'
import i18n from '@/utils/lang.js'

// 获取当前实例和store
const instance = getCurrentInstance()
const store = useStore()

// 应用配置 - 根据uni-app最佳实践
const APP_CONFIG = {
  name: 'CRMEB社交电商',
  version: '3.0.0',
  debug: process.env.NODE_ENV === 'development',
  // 性能监控配置
  performance: {
    enableMonitoring: true,
    reportInterval: 30000 // 30秒上报一次
  },
  // 错误处理配置
  errorHandling: {
    enableReporting: true,
    maxRetries: 3
  },
  // getApp()支持配置
  getAppSupport: {
    enableGlobalMethods: true,
    enablePerformanceMonitor: true,
    enableDebugInfo: true
  }
}

// Promise.allSettled polyfill - 确保兼容性
if (!Promise.allSettled) {
	Promise.allSettled = function(promises) {
		return Promise.all(
			promises.map(promise =>
				Promise.resolve(promise)
					.then(value => ({ status: 'fulfilled', value }))
					.catch(reason => ({ status: 'rejected', reason }))
			)
		)
	}
}

// 兼容性工具函数：获取启动/进入参数
const getCompatibleEnterOptions = () => {
	try {
		// #ifdef MP-WEIXIN
		if (typeof uni.getEnterOptionsSync === 'function') {
			return uni.getEnterOptionsSync()
		}
		if (typeof wx.getEnterOptionsSync === 'function') {
			return wx.getEnterOptionsSync()
		}
		// #endif

		// #ifdef MP-QQ
		// QQ小程序使用getLaunchOptionsSync
		if (typeof uni.getLaunchOptionsSync === 'function') {
			return uni.getLaunchOptionsSync()
		}
		if (typeof qq.getLaunchOptionsSync === 'function') {
			return qq.getLaunchOptionsSync()
		}
		// #endif

		// #ifdef H5 || APP-PLUS
		if (typeof uni.getEnterOptionsSync === 'function') {
			return uni.getEnterOptionsSync()
		}
		// #endif

		return null
	} catch (error) {
		console.warn('获取启动参数失败:', error)
		return null
	}
}

// 全局数据 - 使用更清晰的结构
const globalData = reactive({
	// 用户相关
	user: {
		spid: 0,
		isLogin: false,
		userInfo: {},
		locale: ''
	},
	// 应用状态
	app: {
		code: 0,
		isIframe: false,
		tabbarShow: true,
		windowHeight: 0,
		navHeight: 0,
		navH: 0
	},
	// 菜单和配置
	config: {
		MyMenus: [],
		basicConfig: null,
		colorStatus: null,
		viewColor: null
	}
})

// 计算属性
const isLogin = computed(() => store.getters.isLogin)
const cartNum = computed(() => store.getters.cartNum)

// 性能监控
const performanceMonitor = {
	startTime: Date.now(),
	metrics: reactive({
		appLaunchTime: 0,
		firstPageLoadTime: 0,
		apiCallCount: 0,
		errorCount: 0
	}),

	// 记录应用启动时间
	recordLaunchTime() {
		this.metrics.appLaunchTime = Date.now() - this.startTime
	},

	// 记录首页加载时间
	recordFirstPageLoad() {
		this.metrics.firstPageLoadTime = Date.now() - this.startTime
	},

	// 增加API调用计数
	incrementApiCall() {
		this.metrics.apiCallCount++
	},

	// 增加错误计数
	incrementError() {
		this.metrics.errorCount++
	}
}

// 错误处理函数
const handleError = (error, context = '') => {
	// 增加错误计数
	performanceMonitor.incrementError()

	if (APP_CONFIG.debug) {
		console.error(`[${context}] Error:`, error)
	}

	// 错误上报
	if (APP_CONFIG.errorHandling.enableReporting) {
		reportError(error, context)
	}
}

// 错误上报函数
const reportError = (error, context) => {
	try {
		// 这里可以集成第三方错误监控服务
		const errorInfo = {
			message: error.message || String(error),
			stack: error.stack,
			context,
			timestamp: Date.now(),
			userAgent: navigator?.userAgent || 'unknown',
			url: window?.location?.href || 'app',
			userId: globalData.user.userInfo?.uid || 'anonymous'
		}

		// 可以发送到错误监控服务
		// errorReportingService.report(errorInfo)

		if (APP_CONFIG.debug) {
			console.log('Error reported:', errorInfo)
		}
	} catch (reportError) {
		if (APP_CONFIG.debug) {
			console.error('Failed to report error:', reportError)
		}
	}
}

// 监听器 - 登录状态变化
watch(isLogin, (newValue, oldValue) => {
	try {
		globalData.user.isLogin = newValue
		if (newValue) {
			// 登录成功后的处理
			// this.getCartNum()
		} else {
			// 退出登录后清理数据
			store.commit('indexData/setCartNum', '')
			globalData.user.userInfo = {}
		}
	} catch (error) {
		handleError(error, 'Login Status Watch')
	}
}, { immediate: true })

// 监听器 - 购物车数量变化
watch(cartNum, (newCart) => {
	try {
		const cartCount = Number(newCart) || 0
		store.commit('indexData/setCartNum', cartCount.toString())

		// 通知自定义tabbar更新购物车数量
		uni.$emit('updateCartBadge', {
			count: cartCount,
			show: cartCount > 0
		})
	} catch (error) {
		handleError(error, 'Cart Number Watch')
	}
}, { immediate: true })

// 处理推广参数
const handleSpreadParams = (queryData) => {
	try {
		// 处理spread参数
		if (queryData.query.spread) {
			Cache.set('spread', queryData.query.spread)
			globalData.user.spid = queryData.query.spread
			globalData.user.pid = queryData.query.spread
			silenceBindingSpread(globalData)
		}

		// 处理spid参数
		if (queryData.query.spid) {
			Cache.set('spread', queryData.query.spid)
			globalData.user.spid = queryData.query.spid
			globalData.user.pid = queryData.query.spid
			silenceBindingSpread(globalData)
		}
	} catch (error) {
		handleError(error, 'Handle Spread Params')
	}
}

// 处理小程序场景值
const handleMiniProgramScene = (queryData) => {
	// #ifdef MP
	try {
		if (queryData.query.scene) {
			const util = instance.appContext.config.globalProperties.$util
			const param = util.getUrlParams(decodeURIComponent(queryData.query.scene))

			if (param.pid) {
				Cache.set('spread', param.pid)
				globalData.user.spid = param.pid
				globalData.user.pid = param.pid
			} else {
				// 处理不同的小程序场景值
				const sceneHandlers = {
					1047: () => globalData.app.code = queryData.query.scene, // 扫描小程序码
					1048: () => globalData.app.code = queryData.query.scene, // 长按图片识别小程序码
					1049: () => globalData.app.code = queryData.query.scene, // 手机相册选取小程序码
					1001: () => globalData.user.spid = queryData.query.scene  // 直接进入小程序
				}

				const handler = sceneHandlers[queryData.scene]
				if (handler) {
					handler()
				}
			}
			silenceBindingSpread(globalData)
		}
	} catch (error) {
		handleError(error, 'Handle MiniProgram Scene')
	}
	// #endif
}

// onShow 生命周期
const handleShow = () => {
	try {
		// 使用兼容性函数获取启动参数
		const queryData = getCompatibleEnterOptions()

		// 处理推广参数
		if (queryData) {
			handleSpreadParams(queryData)
			// 处理小程序场景值
			handleMiniProgramScene(queryData)
		}

	} catch (error) {
		handleError(error, 'App Show')
	}
}

// 初始化基础配置
const initBasicConfig = async () => {
	try {
		const res = await basicConfig()
		globalData.config.basicConfig = res.data
		uni.setStorageSync('BASIC_CONFIG', res.data)
		return res.data
	} catch (error) {
		handleError(error, 'Init Basic Config')
		return null
	}
}

// 初始化主题配置
const initThemeConfig = async () => {
	try {
		const res = await colorChange('color_change')
		const themeMap = {
			1: 'blue',
			2: 'green',
			3: 'red',
			4: 'pink',
			5: 'orange'
		}

		const status = res.data.status
		const themeKey = themeMap[status] || 'red'
		const selectedTheme = themeList[themeKey]

		// 保存配置
		uni.setStorageSync('is_diy', res.data.is_diy)
		uni.setStorageSync('color_status', status)
		uni.setStorageSync('viewColor', selectedTheme)

		// 更新全局数据
		globalData.config.colorStatus = status
		globalData.config.viewColor = selectedTheme

		// 发送事件通知
		uni.$emit('is_diy', res.data.is_diy)
		uni.$emit('ok', selectedTheme, status)

		return { status, selectedTheme }
	} catch (error) {
		handleError(error, 'Init Theme Config')
		return null
	}
}

// 处理H5特殊逻辑
const handleH5Logic = (option) => {
	// #ifdef H5
	try {
		// 检查是否为iframe模式
		globalData.app.isIframe = option.query?.mdType === 'iframeWindow'

		// 处理远程登录
		if (!isLogin.value && option.query?.remote_token) {
			handleRemoteRegister(option.query.remote_token)
		}
	} catch (error) {
		handleError(error, 'Handle H5 Logic')
	}
	// #endif
}

// onLaunch 生命周期
const handleLaunch = async (option) => {
	try {
		// 初始化Workerman URL，避免循环依赖问题
		initWorkermanUrl()

		// 并行初始化基础配置
		const configPromises = [
			initBasicConfig(),
			initThemeConfig()
		]

		// 处理H5特殊逻辑
		handleH5Logic(option)

		// 等待基础配置完成
		try {
			await Promise.allSettled(configPromises)
		} catch (error) {
			console.warn('基础配置初始化部分失败:', error)
			// 继续执行，不阻断应用启动
		}

		// 初始化语言配置
		await initLanguageConfig()

		// 初始化系统信息
		initSystemInfo()

		// 处理平台特定逻辑
		await handlePlatformSpecificLogic(option)

		// 获取版权信息
		initCopyRight()

		// 记录应用启动完成时间
		performanceMonitor.recordLaunchTime()

		// 启动性能监控
		if (APP_CONFIG.performance.enableMonitoring) {
			startPerformanceMonitoring()
		}

		// 设置全局错误处理
		setupGlobalErrorHandling()

	} catch (error) {
		handleError(error, 'App Launch')
	}
}

// 启动性能监控
const startPerformanceMonitoring = () => {
	if (!APP_CONFIG.performance.enableMonitoring) return

	// 定期上报性能数据
	setInterval(() => {
		const metrics = {
			...performanceMonitor.metrics,
			memoryUsage: getMemoryUsage(),
			timestamp: Date.now()
		}

		if (APP_CONFIG.debug) {
			console.log('Performance metrics:', metrics)
		}

		// 这里可以上报到性能监控服务
		// performanceService.report(metrics)
	}, APP_CONFIG.performance.reportInterval)
}

// 获取内存使用情况
const getMemoryUsage = () => {
	try {
		// #ifdef H5
		if (performance?.memory) {
			return {
				used: performance.memory.usedJSHeapSize,
				total: performance.memory.totalJSHeapSize,
				limit: performance.memory.jsHeapSizeLimit
			}
		}
		// #endif

		// #ifdef APP-PLUS
		// 可以通过plus API获取内存信息
		// #endif

		return null
	} catch (error) {
		return null
	}
}

// 设置全局错误处理
const setupGlobalErrorHandling = () => {
	// #ifdef H5
	if (typeof window !== 'undefined') {
		// 捕获未处理的Promise错误
		window.addEventListener('unhandledrejection', (event) => {
			handleError(event.reason, 'Unhandled Promise Rejection')
		})

		// 捕获全局JavaScript错误
		window.addEventListener('error', (event) => {
			handleError(event.error || event.message, 'Global Error')
		})
	}
	// #endif
}

// 初始化语言配置
const initLanguageConfig = async () => {
	try {
		const res = await getLangVersion()
		const version = res.data.version
		const currentVersion = uni.getStorageSync('LANG_VERSION')

		// 获取当前用户选择的语言
		const userLocale = Cache.get('locale')

		if (version !== currentVersion) {
			// 版本更新时，重新获取语言包
			const langRes = await getLangJson()
			const langData = langRes.data || {}

			// 如果用户之前选择了语言，优先使用用户选择的语言
			let targetLang = userLocale
			if (!targetLang || !langData[targetLang]) {
				// 如果没有用户选择的语言或语言包中不存在，使用第一个可用语言
				targetLang = Object.keys(langData)[0]
			}

			if (targetLang) {
				Cache.set('locale', targetLang)
				globalData.user.locale = targetLang

				// 设置国际化语言包 - 直接使用导入的i18n实例
				if (langData[targetLang]) {
					i18n.global.setLocaleMessage(targetLang, langData[targetLang])
					i18n.global.locale.value = targetLang
				}
			}

			uni.setStorageSync('localeJson', langData)
			uni.setStorageSync('LANG_VERSION', version)
		} else {
			// 版本未更新时，确保当前语言设置正确
			if (userLocale) {
				const storedLangData = uni.getStorageSync('localeJson') || {}
				if (storedLangData[userLocale]) {
					// 设置国际化语言包 - 直接使用导入的i18n实例
					i18n.global.setLocaleMessage(userLocale, storedLangData[userLocale])
					i18n.global.locale.value = userLocale
					globalData.user.locale = userLocale
				}
			}
		}
	} catch (error) {
		handleError(error, 'Init Language Config')
	}
}

// 初始化系统信息
const initSystemInfo = () => {
	try {
		// #ifdef APP-PLUS || H5
		uni.getSystemInfo({
			success: function (res) {
				// 设置窗口高度
				globalData.app.windowHeight = res.windowHeight + 'px'

				// 计算导航高度
				globalData.app.navHeight = res.statusBarHeight * (750 / res.windowWidth) + 91
			},
			fail: (error) => {
				handleError(error, 'Get System Info')
			}
		})
		// #endif

		// #ifdef MP
		// 获取菜单按钮信息
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
		globalData.app.navH = menuButtonInfo.top * 2 + menuButtonInfo.height / 2

		// 检查小程序版本
		const version = uni.getSystemInfoSync().SDKVersion
		const isNewVersion = Routine.compareVersion(version, '2.21.3') >= 0
		Cache.set('MP_VERSION_ISNEW', isNewVersion)
		// #endif

	} catch (error) {
		handleError(error, 'Init System Info')
	}
}
// 处理平台特定逻辑
const handlePlatformSpecificLogic = async (option) => {
	try {
		// #ifdef MP
		await handleMiniProgramLogic(option)
		// #endif

		// #ifdef H5
		handleH5SpecificLogic()
		// #endif
	} catch (error) {
		handleError(error, 'Handle Platform Specific Logic')
	}
}

// 处理小程序特定逻辑
const handleMiniProgramLogic = async (option) => {
	// #ifdef MP
	try {
		// 检查配置
		if (!HTTP_REQUEST_URL) {
			console.error(
				"请配置根目录下的config.js文件中的 'HTTP_REQUEST_URL'\n\n请修改开发者工具中【详情】->【AppID】改为自己的Appid\n\n请前往后台【小程序】->【小程序配置】填写自己的 appId and AppSecret"
			)
			return false
		}

		// 处理小程序更新 - 使用兼容性函数
		const startParamObj = getCompatibleEnterOptions()

		// 检查更新管理器和场景值
		// #ifdef MP-WEIXIN
		if (startParamObj && wx.canIUse && wx.canIUse('getUpdateManager') && startParamObj.scene !== 1154) {
			handleMiniProgramUpdate()
		}
		// #endif

		// #ifdef MP-QQ
		// QQ小程序的更新检查逻辑
		if (startParamObj && qq.canIUse && qq.canIUse('getUpdateManager') && startParamObj.scene !== 1154) {
			handleMiniProgramUpdate()
		}
		// #endif

		return true
	} catch (error) {
		handleError(error, 'Handle MiniProgram Logic')
		return false
	}
	// #endif
}

// 处理小程序更新
const handleMiniProgramUpdate = () => {
	// #ifdef MP
	try {
		const updateManager = wx.getUpdateManager()

		updateManager.onCheckForUpdate((res) => {
			if (res.hasUpdate) {
				updateManager.onUpdateReady(() => {
					wx.showModal({
						title: '更新提示',
						content: '新版本已经下载好，是否重启当前应用？',
						success(modalRes) {
							if (modalRes.confirm) {
								updateManager.applyUpdate()
							}
						}
					})
				})

				updateManager.onUpdateFailed(() => {
					wx.showModal({
						title: '发现新版本',
						content: '请删除当前小程序，重新搜索打开...'
					})
				})
			}
		})
	} catch (error) {
		handleError(error, 'Handle MiniProgram Update')
	}
	// #endif
}

// 处理H5特定逻辑
const handleH5SpecificLogic = () => {
	// #ifdef H5
	try {
		// 添加统计脚本
		if (HTTP_REQUEST_URL && typeof document !== 'undefined') {
			const script = document.createElement('script')
			script.src = `${HTTP_REQUEST_URL}/api/get_script`
			script.onerror = () => {
				if (APP_CONFIG.debug) {
					console.warn('Failed to load analytics script')
				}
			}
			document.head.appendChild(script)
		}
	} catch (error) {
		handleError(error, 'Handle H5 Specific Logic')
	}
	// #endif
}

// 初始化版权信息
const initCopyRight = async () => {
	try {
		const res = await getCrmebCopyRight()
		uni.setStorageSync('copyRight', res.data)
	} catch (error) {
		handleError(error, 'Init CopyRight')
	}
}

// 远程注册处理
const handleRemoteRegister = async (remote_token) => {
	try {
		const res = await remoteRegister({ remote_token })
		const data = res.data

		if (data.get_remote_login_url) {
			// #ifdef H5
			if (typeof location !== 'undefined') {
				location.href = data.get_remote_login_url
			}
			// #endif
		} else {
			// 登录成功
			store.commit('LOGIN', {
				token: data.token,
				time: data.expires_time - Cache.time()
			})
			store.commit('SETUID', data.userInfo.uid)

			// 更新全局用户信息
			globalData.user.isLogin = true
			globalData.user.userInfo = data.userInfo

			// #ifdef H5
			if (typeof location !== 'undefined') {
				location.reload()
			}
			// #endif
		}
	} catch (error) {
		handleError(error, 'Remote Register')
	}
}

// onHide 生命周期
const handleHide = () => {
	try {
		// #ifdef H5
		Cache.clear('snsapiKey')
		// #endif
	} catch (error) {
		handleError(error, 'App Hide')
	}
}

// 应用状态持久化
const saveAppState = () => {
	try {
		const appState = {
			user: globalData.user,
			config: globalData.config,
			timestamp: Date.now()
		}
		uni.setStorageSync('APP_STATE', appState)
	} catch (error) {
		handleError(error, 'Save App State')
	}
}

// 恢复应用状态
const restoreAppState = () => {
	try {
		const savedState = uni.getStorageSync('APP_STATE')
		if (savedState && savedState.timestamp) {
			// 检查状态是否过期（24小时）
			const isExpired = Date.now() - savedState.timestamp > 24 * 60 * 60 * 1000

			if (!isExpired) {
				// 恢复用户状态
				if (savedState.user) {
					Object.assign(globalData.user, savedState.user)
				}

				// 恢复配置状态
				if (savedState.config) {
					Object.assign(globalData.config, savedState.config)
				}

				return true
			}
		}
		return false
	} catch (error) {
		handleError(error, 'Restore App State')
		return false
	}
}

// 增强的onShow处理
const enhancedHandleShow = () => {
	try {
		// 恢复应用状态
		restoreAppState()

		// 执行原有的Show逻辑
		handleShow()

		// 记录首页加载时间
		performanceMonitor.recordFirstPageLoad()

	} catch (error) {
		handleError(error, 'Enhanced App Show')
	}
}

// 增强的onHide处理
const enhancedHandleHide = () => {
	try {
		// 保存应用状态
		saveAppState()

		// 执行原有的Hide逻辑
		handleHide()

	} catch (error) {
		handleError(error, 'Enhanced App Hide')
	}
}

// 注册应用生命周期钩子 - 修复uni.onAppLaunch错误
// 在uni-app的<script setup>中，应该使用以下方式：

// 应用启动生命周期
onLaunch((options) => {
	handleLaunch(options)
})

// 应用显示生命周期
onShow((options) => {
	enhancedHandleShow(options)
})

// 应用隐藏生命周期
onHide(() => {
	enhancedHandleHide()
})

// 根据uni-app文档优化getApp()支持
// 暴露全局数据和方法到应用实例，确保getApp()可以正确访问
const setupGlobalApp = () => {
	const app = getCurrentInstance()
	if (app?.appContext?.app) {
		// 设置全局数据 - 支持getApp().globalData访问
		app.appContext.app.globalData = globalData

		// 设置全局方法
		const globalProperties = app.appContext.app.config.globalProperties
		globalProperties.handleRemoteRegister = handleRemoteRegister
		globalProperties.APP_CONFIG = APP_CONFIG
		globalProperties.handleError = handleError

		// 添加便捷的全局方法
		globalProperties.$globalData = globalData
		globalProperties.$performanceMonitor = performanceMonitor

		// 设置应用版本信息
		app.appContext.app.version = APP_CONFIG.version
		app.appContext.app.name = APP_CONFIG.name

		// 添加全局工具方法 - 可通过getApp()访问
		app.appContext.app.utils = {
			// 获取用户信息
			getUserInfo: () => globalData.user.userInfo,
			// 检查登录状态
			isUserLoggedIn: () => globalData.user.isLogin,
			// 获取应用配置
			getAppConfig: () => APP_CONFIG,
			// 获取性能数据
			getPerformanceMetrics: () => performanceMonitor.metrics,
			// 更新用户信息
			updateUserInfo: (userInfo) => {
				globalData.user.userInfo = { ...globalData.user.userInfo, ...userInfo }
			},
			// 清理用户数据
			clearUserData: () => {
				globalData.user.isLogin = false
				globalData.user.userInfo = {}
				globalData.user.spid = 0
			},
			// 获取主题配置
			getThemeConfig: () => globalData.config.viewColor,
			// 获取基础配置
			getBasicConfig: () => globalData.config.basicConfig
		}

		return app.appContext.app
	}
	return null
}

// 执行全局应用设置
const appInstance = setupGlobalApp()

// 确保在应用启动后可以通过getApp()访问
if (appInstance) {
	// 添加调试信息（仅开发环境）
	if (APP_CONFIG.debug) {
		console.log('✅ App.vue: 全局数据已设置，可通过getApp().globalData访问')
		console.log('📊 性能监控已启用，可通过getApp().$performanceMonitor访问')
	}
}
</script>

<style>

/* #ifndef MP-WEIXIN */
* {
	font-family: PingFang SC-Regular, PingFang SC;
}
/* #endif */

/* #ifdef MP-WEIXIN */
page, view, text, button, input, textarea, picker, scroll-view, swiper, image, video, audio {
	font-family: PingFang SC-Regular, PingFang SC;
}
/* #endif */
/*
 * CRMEB社交电商 - 全局样式
 * 基于uni-app框架的响应式设计
 */

/* 滚动条样式 - 兼容性优化 */
/* #ifndef MP-WEIXIN */
.uni-scroll-view::-webkit-scrollbar,
::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
	color: transparent;
}
/* #endif */

/* 背景样式 */
.bfw {
	background: #fff;
}

.bf8 {
	background: rgba(248, 248, 248, 0.95);
	-webkit-backdrop-filter: blur(10px);
	backdrop-filter: blur(10px);
}

.bfh {
	background: rgba(0, 0, 0, 0.95);
	-webkit-backdrop-filter: blur(30px);
	backdrop-filter: blur(30px);
}

/* 阴影效果 */
.xwb {
	filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25));
}

/* 文本溢出处理 */
.ohto {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.ohto2 {
	display: block;
	white-space: pre-line;
	display: -webkit-box;
	overflow: hidden;
	-webkit-line-clamp: 2;
	line-clamp: 2; /* 标准属性 */
	text-overflow: ellipsis;
	-webkit-box-orient: vertical;
}

/* 微标签样式 */
.microlabel {
	position: absolute;
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: #fa5150;
	border-width: 4rpx;
	border-style: solid;
	border-color: #fff;
}

/* 空状态样式 */
.empty-box {
	width: 100%;
	padding: 160rpx 0;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.empty-box image {
	width: 160rpx;
	height: 160rpx;
}

.empty-box .e1 {
	padding: 20rpx 0 10rpx;
	font-size: 26rpx;
	font-weight: 600;
}

.empty-box .e2 {
	color: #999;
	font-size: 20rpx;
	font-weight: 300;
}

/* 按钮重置 */
button::after {
	border-radius: 0;
	border: none;
}

/* 图片样式 */
img,
[alt],
img[alt] {
	max-width: 100%;
	height: auto;
	display: block;
}

/* 动画容器 */
.heio {
	justify-content: center;
	overflow: hidden;
	transition: height 0.45s ease-in-out;
}

/* 动画定义 */
@keyframes fadeIn {
	0% { opacity: 0; }
	100% { opacity: 1; }
}

@keyframes fadeOut {
	0% { opacity: 1; }
	100% { opacity: 0; }
}

@keyframes wobble {
	10% { transform: rotate(15deg); }
	20% { transform: rotate(-10deg); }
	30% { transform: rotate(5deg); }
	40% { transform: rotate(-5deg); }
	50%, 100% { transform: rotate(0); }
}

@keyframes likes {
	0% { transform: scale(1); }
	25% { transform: scale(1.2); }
	50% { transform: scale(0.95); }
	100% { transform: scale(1); }
}

@keyframes btnEffect {
	0% { transform: translate(0); }
	10% { transform: translate(4px); }
	20% { transform: translate(-2px); }
	30% { transform: translate(4px); }
	40% { transform: translate(-2px); }
	50% { transform: translate(0); }
}

@keyframes bottomUp {
	0% { bottom: -240rpx; }
	100% { bottom: 0; }
}

/* 动画类 */
.fade-in { animation: fadeIn 0.3s ease; }
.fade-out { animation: fadeOut 0.3s ease; }
.animate { animation: wobble 1.5s 0.15s linear infinite; }
.hi { animation: likes 0.45s ease-in-out; }
.effect { animation: btnEffect 3s both infinite; }
.bUp { animation: bottomUp 0.6s ease; }

/* 提示框样式 */
.tips-box {
	margin-top: 12vh;
	width: 100%;
	justify-content: center;
}

.tips-box .tips-item {
	padding: 0 50rpx;
	height: 100rpx;
	line-height: 100rpx;
	font-size: 24rpx;
	font-weight: 700;
	color: #fff;
	background: rgba(0, 0, 0, 0.85);
	border-radius: 50rpx;
}

/* 响应式设计 - 适配不同屏幕尺寸 */
@media screen and (max-width: 750rpx) {
	.tips-box {
		margin-top: 8vh;
	}

	.empty-box {
		padding: 120rpx 0;
	}
}
</style>
