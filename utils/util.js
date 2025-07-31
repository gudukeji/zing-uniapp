/**
 * 工具类
 */
import store from '@/store/index.js'
import appConfig from '@/config/app.js'
const { HTTP_REQUEST_URL, TOKENNAME } = appConfig;

export default {
	/**
	 * 提示信息
	 * @param {Object} options 配置项
	 */
	Tips(options) {
		uni.showToast({
			title: options.title,
			icon: options.icon || 'none',
			duration: options.duration || 2000
		});
	},

	/**
	 * 图片上传方法（简化版）
	 * @param {Object} opt 配置项
	 * @param {Function} successCallback 成功回调
	 * @param {Function} errorCallback 失败回调
	 */
	uploadImageChange: function(opt, successCallback, errorCallback, sizeCallback) {
		let that = this;
		if (typeof opt === 'string') {
			let url = opt;
			opt = {};
			opt.url = url;
		}
		let count = opt.count || 1,
			sizeType = opt.sizeType || ['compressed'],
			sourceType = opt.sourceType || ['album', 'camera'],
			uploadUrl = opt.url || '',
			inputName = opt.name || 'pics',
			fileType = opt.fileType || 'image';
		
		uni.chooseImage({
			count: count,
			sizeType: sizeType,
			sourceType: sourceType,
			success: function(res) {
				uni.showLoading({
					title: '图片上传中...',
				});
				
				// 逐个上传图片
				let uploadedCount = 0;
				let totalCount = res.tempFilePaths.length;
				let uploadedImages = [];
				
				function uploadNext(index) {
					if (index >= totalCount) {
						// 所有图片上传完成
						uni.hideLoading();
						if (successCallback) {
							if (uploadedImages.length === 1) {
								// 单张图片时，返回标准格式
								successCallback({
									status: 200,
									data: uploadedImages[0]
								});
							} else {
								successCallback({
									status: 200,
									data: uploadedImages
								});
							}
						}
						return;
					}
					
					let filePath = res.tempFilePaths[index];
					uni.uploadFile({
						url: HTTP_REQUEST_URL + '/api/' + uploadUrl,
						filePath: filePath,
						name: inputName,
						formData: {
							'filename': inputName
						},
						header: {
							[TOKENNAME]: 'Bearer ' + store.state.app.token
						},
						success: function(uploadRes) {
							try {
								let data = JSON.parse(uploadRes.data);
								console.log('上传响应数据:', data);
								
								// 检查响应格式
								if (data.status === 200) {
									let imageUrl = '';
									let imageWide = 0;
									let imageHigh = 0;
									
									// 尝试从不同位置获取URL
									if (data.data && data.data.url) {
										imageUrl = data.data.url;
										imageWide = data.data.wide || data.data.w || 0;
										imageHigh = data.data.high || data.data.h || 0;
									} else if (data.data && data.data.src) {
										imageUrl = data.data.src;
										imageWide = data.data.wide || data.data.w || 0;
										imageHigh = data.data.high || data.data.h || 0;
									} else if (data.url) {
										imageUrl = data.url;
										imageWide = data.wide || data.w || 0;
										imageHigh = data.high || data.h || 0;
									} else if (data.src) {
										imageUrl = data.src;
										imageWide = data.wide || data.w || 0;
										imageHigh = data.high || data.h || 0;
									}
									
									if (imageUrl) {
										uploadedImages.push({
											url: imageUrl,
											wide: imageWide,
											high: imageHigh
										});
									} else {
										console.error('无法从响应中获取图片URL:', data);
									}
								} else {
									console.error('上传响应状态错误:', data);
								}
							} catch (e) {
								console.error('解析上传响应失败:', e, uploadRes.data);
							}
							
							uploadedCount++;
							uploadNext(index + 1);
						},
						fail: function(err) {
							console.error('图片上传失败:', err);
							uploadedCount++;
							uploadNext(index + 1);
						}
					});
				}
				
				uploadNext(0);
			},
			fail: function(err) {
				that.Tips({
					title: err.errMsg || '选择图片失败'
				});
			}
		});
	},

	/**
	 * 简单视频上传方法
	 * @param {Object} opt 配置项
	 * @param {Function} successCallback 成功回调
	 * @param {Function} errorCallback 失败回调
	 */
	uploadVideoSimple: function(opt, successCallback, errorCallback) {
		let that = this;
		if (typeof opt === 'string') {
			let url = opt;
			opt = {};
			opt.url = url;
		}
		
		let count = opt.count || 1,
			sourceType = opt.sourceType || ['album', 'camera'],
			maxDuration = opt.maxDuration || 60,
			camera = opt.camera || 'back',
			uploadUrl = opt.url || 'upload/video',
			inputName = opt.name || 'file';
		
		uni.chooseVideo({
			count: count,
			sourceType: sourceType,
			maxDuration: maxDuration,
			camera: camera,
			success: function(res) {
				// 检查视频大小
				if (res.size && res.size > 100 * 1024 * 1024) {
					that.Tips({
						title: '视频大小不能超过100MB'
					});
					return;
				}
				
				// 检查视频时长
				if (res.duration && res.duration > 60) {
					that.Tips({
						title: '视频时长不能超过60秒'
					});
					return;
				}
				
				uni.showLoading({
					title: '视频上传中...',
					mask: true
				});
				
				// 直接上传视频文件
				uni.uploadFile({
					url: HTTP_REQUEST_URL + '/api/' + uploadUrl,
					filePath: res.tempFilePath,
					name: inputName,
					formData: {
						chunkNumber: 1,
						currentChunkSize: res.size || 0,
						chunkSize: res.size || 0,
						totalChunks: 1,
						filename: `video_${Date.now()}.mp4`,
						md5: ''
					},
					header: {
						[TOKENNAME]: 'Bearer ' + store.state.app.token
					},
											success: function(uploadRes) {
						uni.hideLoading();
						try {
							let data = JSON.parse(uploadRes.data);
							if (data.status === 200 && data.data) {
								// 返回标准格式的数据
								let result = {
									status: 200,
									data: {
										url: data.data.url || data.data.file_path || data.data.src || data.url || data.file_path || data.src,
										high: res.height || 720,
										wide: res.width || 1280,
										size: res.size || 0,
										duration: res.duration || 0
									}
								};
								if (successCallback) successCallback(result);
							} else {
								console.error('视频上传响应格式错误:', data);
								that.Tips({
									title: data.msg || '上传失败'
								});
								if (errorCallback) errorCallback(data);
							}
						} catch (e) {
							console.error('解析视频上传响应失败:', e);
							that.Tips({
								title: '上传失败，请重试'
							});
							if (errorCallback) errorCallback(e);
						}
					},
					fail: function(err) {
						uni.hideLoading();
						that.Tips({
							title: '上传失败，请重试'
						});
						if (errorCallback) errorCallback(err);
					}
				});
			},
			fail: function(err) {
				that.Tips({
					title: err.errMsg || '选择视频失败'
				});
			}
		});
	},

	/**
	 * 保存视频数据
	 * @param {String} videoName 视频名称
	 * @param {String} videoUrl 视频URL
	 * @param {Function} successCallback 成功回调
	 * @param {Function} errorCallback 失败回调
	 */
	saveVideoData: function(videoName, videoUrl, successCallback, errorCallback) {
		let that = this;
		
		uni.request({
			url: HTTP_REQUEST_URL + '/api/upload/video_data_save',
			method: 'POST',
			data: {
				pid: 0,
				video_name: videoName,
				video_path: videoUrl
			},
			header: {
				[TOKENNAME]: 'Bearer ' + store.state.app.token
			},
			success: function(res) {
				uni.hideLoading();
				if (res.statusCode === 200 && res.data.status === 200) {
					if (successCallback) successCallback({
						status: 200,
						data: {
							url: videoUrl,
							name: videoName
						}
					});
				} else {
					that.Tips({
						title: res.data.msg || '保存失败'
					});
					if (errorCallback) errorCallback(res.data);
				}
			},
			fail: function(err) {
				uni.hideLoading();
				that.Tips({
					title: '保存失败，请重试'
				});
				if (errorCallback) errorCallback(err);
			}
		});
	},

	/**
	 * 音频上传方法
	 * @param {Object} opt 配置项
	 * @param {Function} successCallback 成功回调
	 * @param {Function} errorCallback 失败回调
	 */
	uploadAudio: function(opt, successCallback, errorCallback) {
		let that = this;
		if (typeof opt === 'string') {
			let url = opt;
			opt = {};
			opt.url = url;
		}
		
		let count = opt.count || 1,
			sourceType = opt.sourceType || ['album'],
			maxDuration = opt.maxDuration || 300,
			uploadUrl = opt.url || 'upload/audio',
			inputName = opt.name || 'file';
		
		uni.chooseFile({
			count: count,
			type: 'all',
			extension: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'],
			success: function(res) {
				// 检查音频大小
				if (res.tempFiles && res.tempFiles[0] && res.tempFiles[0].size > 50 * 1024 * 1024) {
					that.Tips({
						title: '音频大小不能超过50MB'
					});
					return;
				}
				
				uni.showLoading({
					title: '音频上传中...',
					mask: true
				});
				
				// 上传音频文件
				uni.uploadFile({
					url: HTTP_REQUEST_URL + '/api/' + uploadUrl,
					filePath: res.tempFilePaths[0],
					name: inputName,
					formData: {
						chunkNumber: 1,
						currentChunkSize: res.tempFiles[0].size || 0,
						chunkSize: res.tempFiles[0].size || 0,
						totalChunks: 1,
						filename: res.tempFiles[0].name || `audio_${Date.now()}.mp3`,
						md5: ''
					},
					header: {
						[TOKENNAME]: 'Bearer ' + store.state.app.token
					},
					success: function(uploadRes) {
						uni.hideLoading();
						try {
							let data = JSON.parse(uploadRes.data);
							if (data.status === 200 && data.data) {
								// 返回标准格式的数据
								let result = {
									status: 200,
									data: {
										url: data.data.url || data.data.file_path || data.data.src || data.url || data.file_path || data.src,
										name: res.tempFiles[0].name || '音频文件',
										size: res.tempFiles[0].size || 0
									}
								};
								if (successCallback) successCallback(result);
							} else {
								console.error('音频上传响应格式错误:', data);
								that.Tips({
									title: data.msg || '上传失败'
								});
								if (errorCallback) errorCallback(data);
							}
						} catch (e) {
							console.error('解析音频上传响应失败:', e);
							that.Tips({
								title: '上传失败，请重试'
							});
							if (errorCallback) errorCallback(e);
						}
					},
					fail: function(err) {
						uni.hideLoading();
						that.Tips({
							title: '上传失败，请重试'
						});
						if (errorCallback) errorCallback(err);
					}
				});
			},
			fail: function(err) {
				that.Tips({
					title: err.errMsg || '选择音频失败'
				});
			}
		});
	}
}; 