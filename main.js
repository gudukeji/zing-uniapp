// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import { createApp } from 'vue'
import App from './App.vue'
import store from './store/index.js'
import pinia from './stores/index.js'
import Cache from './utils/cache.js'
import util from './utils/util.js'
import configs from './config/app.js'
import socket from './libs/new_chat.js'
import i18n from './utils/lang.js';
// 创建Vue3应用实例
const app = createApp(App)

// 创建简单的事件总线替代Vue2的事件总线（无需mitt依赖）
const eventBus = {
	events: {},
	$emit(event, ...args) {
		if (this.events[event]) {
			this.events[event].forEach(callback => callback(...args))
		}
	},
	$on(event, callback) {
		if (!this.events[event]) {
			this.events[event] = []
		}
		this.events[event].push(callback)
	},
	$off(event, callback) {
		if (this.events[event]) {
			const index = this.events[event].indexOf(callback)
			if (index > -1) {
				this.events[event].splice(index, 1)
			}
		}
	}
}

// 配置全局属性
app.config.globalProperties.$util = util;
app.config.globalProperties.$config = configs;
app.config.globalProperties.$Cache = Cache;
app.config.globalProperties.$eventHub = eventBus;
app.config.globalProperties.$socket = new socket();
app.config.productionTip = false
//import pageLoading from './components/pageLoading.vue'
//import skeleton from './components/skeleton/index.vue'
//import easyLoadimage from '@/components/easy-loadimage/easy-loadimage.vue'
//Vue.component('skeleton', skeleton)
//Vue.component('pageLoading', pageLoading)
//Vue.component('easyLoadimage', easyLoadimage)



import ActivePermission from './libs/permission.js';
app.config.globalProperties.$permission = ActivePermission;
import {
	Debounce
} from '@/utils/validate.js'
app.config.globalProperties.$Debounce = Debounce
// #ifdef H5
import {
	parseQuery
} from "./utils/index.js";
import Auth from './libs/wechat.js';
import cacheConfig from './config/cache.js';
const { SPREAD } = cacheConfig;
app.config.globalProperties.$wechat = Auth;

let cookieName = "VCONSOLE",
	query = parseQuery(),
	urlSpread = query["spread"],
	vconsole = query[cookieName.toLowerCase()],
	md5Crmeb = "b14d1e9baeced9bb7525ab19ee35f2d2", //CRMEB MD5 加密开启vconsole模式
	md5UnCrmeb = "3dca2162c4e101b7656793a1af20295c"; //UN_CREMB MD5 加密关闭vconsole模式

if (urlSpread !== undefined) {
	var spread = Cache.get(SPREAD);
	urlSpread = parseInt(urlSpread);
	if (!Number.isNaN(urlSpread) && spread !== urlSpread) {
		Cache.set("spread", urlSpread || 0);
	} else if (spread === 0 || typeof spread !== "number") {
		Cache.set("spread", urlSpread || 0);
	}
}

if (vconsole !== undefined) {
	if (vconsole === md5UnCrmeb && Cache.has(cookieName))
		Cache.clear(cookieName);
} else vconsole = Cache.get(cookieName);

// import VConsole from './pages/extension/components/vconsole.min.js'

// if (vconsole !== undefined && vconsole === md5Crmeb) {
// 	Cache.set(cookieName, md5Crmeb, 3600);
// 	let vConsole = new VConsole();
// }

// let snsapiBase = 'snsapi_base';
// Auth.isWeixin() && Auth.oAuth(snsapiBase);

// 记录进入app时的url
if (typeof window.entryUrl === 'undefined' || window.entryUrl === '') {
	window.entryUrl = location.href
}

//全局路由前置守卫
// #endif

App.mpType = 'app'

// 使用插件
app.use(store) // 保留Vuex以兼容现有代码
app.use(pinia) // 新增Pinia状态管理
app.use(i18n)

// 挂载应用
app.mount('#app')