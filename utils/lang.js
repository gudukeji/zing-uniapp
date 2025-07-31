import { createI18n } from 'vue-i18n'
import Cache from '@/utils/cache.js';

let lang = '';
// #ifdef MP || APP-PLUS
lang = Cache.has('locale') ? Cache.get('locale') : 'zh-CN';
// #endif
// #ifdef H5
lang = Cache.has('locale') ? Cache.get('locale') : navigator.language;
// #endif

const i18n = createI18n({
	locale: lang,
	fallbackLocale: 'zh-CN',
	messages: uni.getStorageSync('localeJson') || {},
	legacy: false, // Vue3 Composition API模式
	globalInjection: true, // 全局注入$t函数
	silentTranslationWarn: true, // 去除国际化警告
	silentFallbackWarn: true, // 去除回退警告
	missingWarn: false, // 去除缺失翻译警告
	fallbackWarn: false, // 去除回退警告
})

export default i18n
