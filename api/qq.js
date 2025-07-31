// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import request from '@/utils/request';

/**
 * QQ小程序授权登录
 * @param {Object} data 
 */
export function qqAuth(data) {
	return request.post('qq/auth', data, {
		noAuth: true
	});
}

/**
 * 获取QQ小程序配置
 * @returns {*}
 */
export function getQQConfig() {
	return request.get('qq/config', {}, {
		noAuth: true
	});
}

/**
 * QQ小程序获取手机号
 * @param {Object} data 
 */
export function getPhoneNumber(data) {
	return request.post('qq/phone', data, {
		noAuth: true
	});
}

/**
 * 获取QQ小程序订阅消息模板
 * @returns {*}
 */
export function getQQSubscribeTemplates() {
	return request.get('qq/subscribe_templates', {}, {
		noAuth: true
	});
}

/**
 * 检查QQ小程序订阅授权状态
 * @param {Array} templateIds 
 */
export function checkQQSubscribeAuth(templateIds) {
	return request.post('qq/check_subscribe_auth', {
		template_ids: templateIds
	}, {
		noAuth: true
	});
}

/**
 * QQ小程序手机号登录
 * @param {Object} data 
 */
export function qqPhoneLogin(data) {
	return request.post('qq/phone_login', data, {
		noAuth: true
	});
}

/**
 * QQ小程序绑定手机号
 * @param {Object} data 
 */
export function qqBindingPhone(data) {
	return request.post('qq/binding_phone', data, {
		noAuth: true
	});
}

/**
 * 获取QQ小程序授权类型
 * @param {Object} data 
 */
export function qqAuthType(data) {
	return request.get('qq/auth_type', data, {
		noAuth: true
	});
}

/**
 * QQ小程序授权登录
 * @param {Object} data 
 */
export function qqAuthLogin(data) {
	return request.get('qq/auth_login', data, {
		noAuth: true
	});
}

/**
 * QQ小程序静默授权
 * @param {String} code 
 * @param {String} spread_code 
 * @param {Number} spread_spid 
 */
export function qqSilenceAuth(code, spread_code = '', spread_spid = 0) {
	return qqAuthType({
		code,
		spread_code,
		spread_spid
	});
}

/**
 * QQ小程序授权绑定手机号
 * @param {String} code 
 * @param {String} iv 
 * @param {String} encryptedData 
 * @param {String} spread_code 
 * @param {Number} spread_spid 
 * @param {String} key 
 */
export function qqAuthBindingPhone(code, iv, encryptedData, spread_code = '', spread_spid = 0, key = '') {
	return qqBindingPhone({
		code,
		iv,
		encryptedData,
		spread_code,
		spread_spid,
		key
	});
}

/**
 * QQ小程序手机验证码登录
 * @param {String} key 
 * @param {String} phone 
 * @param {String} captcha 
 * @param {String} spread_code 
 * @param {Number} spread_spid 
 * @param {String} code 
 */
export function qqPhoneCaptchaLogin(key, phone, captcha, spread_code = '', spread_spid = 0, code = '') {
	return qqPhoneLogin({
		key,
		phone,
		captcha,
		spread_code,
		spread_spid,
		code
	});
}
