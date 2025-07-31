// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import appConfig from '@/config/app.js';
const {
	HTTP_REQUEST_URL,
	HEADER,
	TOKENNAME,
	TIMEOUT
} = appConfig;
import {
	toLogin,
	checkLogin
} from '../libs/login';
import store from '../store';
import i18n from './lang.js';

/**
 * 发送请求
 */
function baseRequest(url, method, data, {
	noAuth = false,
	noVerify = false
}) {
	let Url = HTTP_REQUEST_URL,
		header = HEADER;

	if (!noAuth) {
		//登录过期自动登录
		if (!store.state.app.token && !checkLogin()) {
			toLogin();
			return Promise.reject({
				msg: i18n.t(`未登录`)
			});
		}
	}
	if (store.state.app.token) header[TOKENNAME] = 'Bearer ' + store.state.app.token;

	return new Promise((reslove, reject) => {
		if (uni.getStorageSync('locale')) {
			header['Cb-lang'] = uni.getStorageSync('locale')
		}
		uni.request({
			url: Url + '/api/' + url,
			method: method || 'GET',
			header: header,
			data: data || {},
			timeout: TIMEOUT,
			success: (res) => {
				if (noVerify)
					reslove(res.data, res);
				else if (res.data.status == 200)
					reslove(res.data, res);
				else if ([110002, 110003, 110004].indexOf(res.data.status) !== -1) {
					toLogin();
					reject(res.data);
				} else if (res.data.status == 100103) {
					uni.showModal({
						title: i18n.t(`提示`),
						content: res.data.msg,
						showCancel: false,
						confirmText: i18n.t(`我知道了`)
					});
					reject(res.data);
				} else {
					// 统一错误格式，确保返回对象而不是字符串
					const errorData = {
						status: res.data.status || 400,
						msg: res.data.msg || i18n.t(`系统错误`),
						data: res.data.data || null,
						code: res.data.code || res.data.status || 400
					};

					// 调试信息
					console.log('API错误响应:', {
						url: url,
						status: res.data.status,
						msg: res.data.msg,
						errorData: errorData
					});

					reject(errorData);
				}
			},
			fail: (error) => {
				// 统一网络错误格式
				const errorData = {
					status: 0,
					msg: i18n.t(`请求失败`),
					code: 'NETWORK_ERROR',
					data: null,
					error: error
				};

				// #ifdef APP-PLUS
				reject(errorData);
				// #endif
				// #ifndef APP-PLUS
				reject(errorData);
				// #endif
			}
		})
	});
}

const request = {};

['options', 'get', 'post', 'put', 'head', 'delete', 'trace', 'connect'].forEach((method) => {
	request[method] = (api, data, opt) => baseRequest(api, method, data, opt || {})
});



export default request;