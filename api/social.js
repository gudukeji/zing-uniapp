import request from "@/utils/request.js";

// 获取用户社交信息
export function getUserSocialInfo() {
	return request.get('v3/user/social/info');
}

// 更新用户社交信息
export function updateUserSocialInfo(data) {
	return request.post('v3/user/social/update', data);
}

// 获取关注列表
export function getSocialFollowList(data) {
	return request.get('v3/user/social/follow/list', data);
}

// 获取粉丝列表
export function getSocialFansList(data) {
	return request.get('v3/user/social/fans/list', data);
}

// 关注/取消关注用户
export function followUser(data) {
	return request.post('v3/user/social/follow', data);
}

/**
 * 检查是否已关注用户
 * @param {Number} to_uid 被检查的用户ID
 * @returns {Promise}
 */
export function checkIsFollowing(to_uid) {
	return request.get('v3/user/social/is_follow', { to_uid });
}

// 获取用户主页信息（包含访客记录）
export function getUserHomepage(data) {
	return request.get('v3/user/social/homepage', data, {
		noAuth: true, // 不需要登录验证，但登录用户会获得更多功能
	});
}

/**
 * 获取访客详细信息
 * @param {Object} data - 请求参数
 * @param {Number} data.page - 页码，默认1
 * @param {Number} data.limit - 每页数量，默认20
 * @param {Number} data.type - 类型，0-谁看过我，1-我看过谁，默认0
 * @returns {Promise} 返回访客列表数据
 */
export function getVisitorDetails(data = {}) {
	return request.get('v3/user/social/visitors/details', data);
}

/**
 * 获取兴趣标签分类和标签列表（合并接口）
 * @returns {Promise} 返回包含分类和标签的数据
 */
export function getTagsWithCategories() {
	return request.get('v3/user/social/tags/all');
}

/**
 * 获取我的兴趣标签
 * @returns {Promise}
 */
export function getMyTags() {
	return request.get('v3/user/social/tags/my');
}

/**
 * 更新用户兴趣标签
 * @param {Array} tag_ids 标签ID数组
 * @returns {Promise}
 */
export function updateUserTags(tag_ids) {
	return request.post('v3/user/social/tags/update', { label_ids: tag_ids });
}

// 获取我的动态列表
export function getMyDynamicList(data) {
	return request.get('v3/dynamic/my_list', data);
}

// 获取指定用户的动态列表  
export function getUserDynamicList(userId, data) {
	return request.get(`v3/dynamic/user_list/${userId}`, data);
}

// 获取其他用户动态列表（保留向后兼容）
export function getOtherUserDynamicList(userId, data) {
	return request.get(`v3/dynamic/user_list/${userId}`, data, {
		noAuth: true, // 支持未登录用户访问
	});
}

// 发布动态
export function publishDynamic(data) {
	return request.post('v3/dynamic/publish', data);
}

// 更新动态
export function updateDynamic(id, data) {
	return request.post(`v3/dynamic/update/${id}`, data);
}

// 删除动态
export function deleteDynamic(id) {
	return request.post(`v3/dynamic/delete/${id}`);
}

// 点赞/取消点赞
export function likeDynamic(data) {
	return request.post('v3/dynamic/like', data);
}

// 取消点赞动态
export function unlikeDynamic(data) {
	return request.post('v3/dynamic/unlike', data);
}

/**
 * 动态投票
 * @param {Object} data { vote_id, option_id }
 * @returns {Promise}
 */
export function vote(data) {
  return request.post('v3/dynamic/vote', data);
}

// 获取动态详情
export function getDynamicDetail(id) {
  return request.get(`v3/dynamic/detail/${id}`, {}, {
    noAuth: true
  });
}

/**
 * 举报动态
 * @param {String} reason 举报原因
 * @param {Number} dynamic_id 动态ID
 * @param {Number} uid 动态作者ID
 * @param {String} content 动态内容
 * @param {String} image 动态图片
 * @returns {Promise}
 */
export function reportDynamic(reason, dynamic_id, uid, content, image) {
	return request.post('v3/dynamic/report', { 
		reason,
		dynamic_id,
		uid,
		content,
		image
	});
}

// 获取话题列表
export function getTopicList(data) {
	return request.get('v3/dynamic/topic/list', data);
}

// 获取推荐话题
export function getRecommendTopics() {
	return request.get('v3/dynamic/topic/recommend');
}

// 获取话题详情
export function getTopicDetail(id) {
	return request.get(`v3/dynamic/topic/detail/${id}`, {}, {
		noAuth: true
	});
}

// 获取话题下的动态列表
export function getTopicDynamicList(data) {
	return request.get(`v3/dynamic/topic/dynamic/${data.topic_id}`, {
		page: data.page || 1,
		limit: data.limit || 10,
		type: data.type || 'latest',
		keyword: data.keyword || ''
	}, {
		noAuth: true
	});
}

/**
 * 获取用户点赞的动态列表
 * @param {Number} userId 用户ID
 * @param {Object} data 分页参数
 */
export function getLikeDynamicList(userId, data) {
	return request.get(`v3/dynamic/like_list/${userId}`, data, {
		noAuth: true, // 支持未登录用户访问
	});
}


/**
 * 获取用户访客列表
 * @param {Object} data 分页参数
 * @returns {Promise}
 */
export function getVisitorList(data) {
	return request.get('user/visitor/list', data);
}

// 获取评论列表
export function getCommentsList(target_id, data = {}) {
  return request.get(`v3/comment/list/${parseInt(target_id) || 0}`, {
    ...data,
    page: parseInt(data.page) || 1,
    limit: parseInt(data.limit) || 10,
    sort_type: parseInt(data.sort_type) || 0
  }, {
    noAuth: true
  });
}

// 获取评论回复列表
export function getCommentReplies(data) {
  // 确保关键参数为数字类型
  const params = {
    ...data,
    parent_id: parseInt(data.parent_id) || 0,  // 一级评论ID
    page: parseInt(data.page) || 1,
    limit: parseInt(data.limit) || 3,  // 每次只加载少量数据，让用户可以分批查看
    sort_type: parseInt(data.sort_type) || 1  // 默认按时间排序
  };
  return request.get('v3/comment/replies', params, {
    noAuth: true
  });
}

/**
 * 获取用户实名认证信息
 * @returns {Promise}
 */
export function getRealAuthInfo() {
  return request.get('v3/user/real_auth/info');
}

/**
 * 提交实名认证
 * @param {Object} data 包含实名认证信息
 * @param {String} data.real_name 真实姓名
 * @param {String} data.id_card_number 身份证号码
 * @returns {Promise}
 */
export function submitRealAuth(data) {
  return request.post('v3/user/real_auth/submit', data);
}

/**
 * 撤销实名认证申请
 * @returns {Promise}
 */
export function cancelRealAuth() {
  return request.post('v3/user/real_auth/cancel');
}

// 添加评论
export function addComment(data) {
  const target_id = parseInt(data.target_id) || 0;
  const params = {
    type: parseInt(data.type) || 0,
    content: data.content || '',
    reply_id: parseInt(data.reply_id) || 0,
    image: data.image || ''
  };
  return request.post(`v3/comment/add/${target_id}`, params);
}

// 删除评论
export function deleteComment(id) {
  return request.post(`v3/comment/delete/${parseInt(id) || 0}`);
}

// 点赞评论
export function likeComment(id) {
  return request.post(`v3/comment/like/${parseInt(id) || 0}`);
}

// 取消点赞评论
export function unlikeComment(id) {
  return request.post(`v3/comment/unlike/${parseInt(id) || 0}`);
}

/**
 * 获取动态列表
 * @param {Object} data 包含:
 *   - page: 页码
 *   - limit: 每页数量
 *   - type: 类型(1=热门,2=关注,3=附近)
 *   - uid: 用户ID(前端传递，用于后端判断点赞状态)
 *   - waterfall: 瀑布流模式(可选,1=瀑布流)
 * @returns {Promise}
 */
export function getDynamicList(data) {

	
	return request.get('v3/dynamic/list', data, {
		noAuth: true
	});
}

/**
 * 更新隐私设置
 * @param {Object} data 隐私设置参数
 * @returns {Promise}
 *
 * 请求参数：
 * {
 *   show_fans: 1,      // 是否显示粉丝列表 (0否,1是)
 *   show_follows: 1,   // 是否显示关注列表 (0否,1是)
 *   show_visitors: 1,  // 是否显示访客记录 (0否,1是)
 *   allow_search: 1,   // 是否允许被搜索 (0否,1是)
 *   show_phone: 1      // 是否显示手机号 (0否,1是)
 * }
 *
 * 返回数据：接口返回的所有字段值均为整型 0 或 1
 */
export function updatePrivacySettings(data) {
	return request.post('v3/user/social/privacy', data);
}

/**
 * 更新瀑布流设置
 * @param {Object} data 瀑布流设置参数
 * @returns {Promise}
 *
 * 请求参数：
 * {
 *   dynamic_flow: 1,   // 是否开启动态瀑布流 (0否,1是)
 *   circle_flow: 1     // 是否开启圈子瀑布流 (0否,1是)
 * }
 *
 * 返回数据：接口返回的所有字段值均为整型 0 或 1
 */
export function updateFlowSettings(data) {
	return request.post('v3/user/social/flow', data);
}

// ==================== 圈子相关接口 ====================

/**
 * 获取圈子列表
 * @param {Object} data 查询参数
 * @param {Number} data.page 页码，默认1
 * @param {Number} data.limit 每页数量，默认10
 * @param {String} data.keyword 搜索关键词（可选）
 * @param {Number} data.is_hot 是否热门：0=否,1=是（可选）
 * @param {Number} data.is_recommend 是否推荐：0=否,1=是（可选）
 * @returns {Promise}
 */
export function getCircleList(data) {
	return request.get('v3/circle/list', data, {
		noAuth: true
	});
}

/**
 * 获取圈子详情
 * @param {Number} id 圈子ID
 * @returns {Promise}
 */
export function getCircleDetail(id) {
	return request.get(`v3/circle/detail/${id}`, {}, {
		noAuth: true
	});
}

/**
 * 获取热门圈子列表
 * @returns {Promise}
 */
export function getHotCircles() {
  return request.get('v3/circle/hot', {}, {
    noAuth: true
  });
}

/**
 * 获取推荐圈子列表
 * @returns {Promise}
 */
export function getRecommendCircles() {
  return request.get('v3/circle/recommend', {}, {
    noAuth: true
  });
}

/**
 * 创建圈子
 * @param {Object} data 圈子信息
 * @param {String} data.circle_name 圈子名称（必填）
 * @param {String} data.circle_avatar 圈子头像（可选）
 * @param {String} data.circle_background 圈子背景图（可选）
 * @param {String} data.circle_description 圈子描述（可选）
 * @param {String} data.circle_notice 圈子公告（可选）
 * @returns {Promise}
 */
export function createCircle(data) {
	return request.post('v3/circle/create', data);
}

/**
 * 更新圈子信息
 * @param {Number} id 圈子ID
 * @param {Object} data 更新的圈子信息
 * @returns {Promise}
 */
export function updateCircle(id, data) {
	return request.post(`v3/circle/update/${id}`, data);
}

/**
 * 删除圈子
 * @param {Number} id 圈子ID
 * @returns {Promise}
 */
export function deleteCircle(id) {
	return request.post(`v3/circle/delete/${id}`);
}

/**
 * 加入圈子
 * @param {Object} data 加入信息
 * @param {Number} data.circle_id 圈子ID（必填）
 * @param {Number} data.inviter_uid 邀请人用户ID（可选）
 * @returns {Promise}
 */
export function joinCircle(data) {
	return request.post('v3/circle/join', data);
}

/**
 * 退出圈子
 * @param {Object} data 退出信息
 * @param {Number} data.circle_id 圈子ID（必填）
 * @returns {Promise}
 */
export function exitCircle(data) {
	return request.post('v3/circle/exit', data);
}

/**
 * 获取我创建的圈子
 * @param {Object} data 分页参数
 * @param {Number} data.page 页码，默认1
 * @param {Number} data.limit 每页数量，默认10
 * @returns {Promise}
 */
export function getMyCircles(data) {
	return request.get('v3/circle/my', data);
}

/**
 * 获取我加入的圈子
 * @param {Object} data 分页参数
 * @param {Number} data.page 页码，默认1
 * @param {Number} data.limit 每页数量，默认10
 * @returns {Promise}
 */
export function getJoinedCircles(data) {
	return request.get('v3/circle/joined', data);
}

// ==================== 圈子成员管理接口 ====================

/**
 * 获取圈子成员列表
 * @param {Object} data 查询参数
 * @param {Number} data.circle_id 圈子ID（必填）
 * @param {Number} data.page 页码，默认1
 * @param {Number} data.limit 每页数量，默认20
 * @param {Number} data.role_type 角色类型筛选：1=普通成员,2=管理员,3=圈主（可选）
 * @returns {Promise}
 */
export function getCircleMemberList(data) {
	return request.get('v3/circle/member/list', data, {
		noAuth: true
	});
}

/**
 * 踢出圈子成员
 * @param {Object} data 踢出信息
 * @param {Number} data.circle_id 圈子ID（必填）
 * @param {Number} data.target_uid 目标用户ID（必填）
 * @param {String} data.reason 踢出原因（可选）
 * @returns {Promise}
 */
export function kickCircleMember(data) {
	return request.post('v3/circle/member/kick', data);
}

/**
 * 设置圈子成员角色
 * @param {Object} data 角色设置信息
 * @param {Number} data.circle_id 圈子ID（必填）
 * @param {Number} data.target_uid 目标用户ID（必填）
 * @param {Number} data.role_type 角色类型：1=普通成员,2=管理员（必填）
 * @returns {Promise}
 */
export function setCircleMemberRole(data) {
	return request.post('v3/circle/member/set_role', data);
}

/**
 * 禁言圈子成员
 * @param {Object} data 禁言信息
 * @param {Number} data.circle_id 圈子ID（必填）
 * @param {Number} data.target_uid 目标用户ID（必填）
 * @param {Number} data.mute_days 禁言天数，默认1天（可选）
 * @param {String} data.reason 禁言原因（可选）
 * @returns {Promise}
 */
export function muteCircleMember(data) {
	return request.post('v3/circle/member/mute', data);
}

/**
 * 解除圈子成员禁言
 * @param {Object} data 解禁信息
 * @param {Number} data.circle_id 圈子ID（必填）
 * @param {Number} data.target_uid 目标用户ID（必填）
 * @returns {Promise}
 */
export function unmuteCircleMember(data) {
	return request.post('v3/circle/member/unmute', data);
}

/**
 * 获取圈子动态列表
 * @param {Object} data 查询参数
 * @param {Number} data.page 页码，默认1
 * @param {Number} data.limit 每页数量，默认10
 * @param {Number} data.circle_id 圈子ID（必填）
 * @param {String} data.type 类型：recommend=推荐，latest=最新，默认recommend
 * @param {String} data.keyword 搜索关键词（可选）
 * @param {Number} data.status 状态：0=待审核，1=已通过，2=未通过，3=草稿箱，默认1
 * @returns {Promise}
 */
export function getCircleDynamicList(data) {
	return request.get('v3/circle/dynamic/list', data, {
		noAuth: true
	});
}

/**
 * 搜索用户（用于@功能）
 * @param {Object} data 搜索参数
 * @param {String} data.keyword 搜索关键词（必填）
 * @param {Number} data.page 页码，默认1
 * @param {Number} data.limit 每页数量，默认20
 * @returns {Promise}
 */
export function searchUsers(data) {
	return request.get('v3/user/social/search_users', data);
}

// ==================== 树洞盲盒相关接口 ====================

/**
 * 发布树洞盲盒
 * @param {Object} data 盲盒信息
 * @param {Number} data.type 盲盒类型：1-问题 2-秘密 3-心愿 4-语音
 * @param {String} data.content 盲盒内容
 * @param {String} data.voice_url 语音文件URL（type=4时使用）
 * @param {Number} data.voice_duration 语音时长（秒）
 * @param {Number} data.is_anonymous 是否匿名：0-否 1-是
 * @returns {Promise}
 */
export function publishTreeHoleBox(data) {
	return request.post('v3/treehole/publish', data);
}

/**
 * 抽取树洞盲盒
 * @param {Object} data 抽取参数
 * @param {Number} data.type 盲盒类型筛选（可选）：0-随机 1-问题 2-秘密 3-心愿 4-语音
 * @returns {Promise}
 */
export function drawTreeHoleBox(data = {}) {
	return request.post('v3/treehole/draw', data);
}

/**
 * 获取我的树洞盲盒列表
 * @param {Object} data 查询参数
 * @param {Number} data.page 页码，默认1
 * @param {Number} data.limit 每页数量，默认10
 * @param {Number} data.type 类型筛选（可选）：1-问题 2-秘密 3-心愿 4-语音
 * @param {Number} data.status 状态筛选（可选）：1-正常 2-已下架
 * @returns {Promise}
 */
export function getMyTreeHoleBoxList(data) {
	return request.get('v3/treehole/my_list', data);
}

/**
 * 获取我抽到的树洞盲盒列表
 * @param {Object} data 查询参数
 * @param {Number} data.page 页码，默认1
 * @param {Number} data.limit 每页数量，默认10
 * @param {Number} data.is_responded 是否已回应筛选（可选）：0-未回应 1-已回应
 * @returns {Promise}
 */
export function getMyDrawnBoxList(data) {
	return request.get('v3/treehole/drawn_list', data);
}

/**
 * 获取树洞盲盒详情
 * @param {Number} id 盲盒ID
 * @returns {Promise}
 */
export function getTreeHoleBoxDetail(id) {
	return request.get(`v3/treehole/detail/${id}`);
}

/**
 * 回应树洞盲盒
 * @param {Object} data 回应信息
 * @param {Number} data.box_id 盲盒ID
 * @param {Number} data.draw_id 抽取记录ID（可选，一级回应时需要）
 * @param {Number} data.parent_id 父级回应ID（可选，回复时需要）
 * @param {Number} data.reply_to_uid 回复的用户ID（可选，回复时需要）
 * @param {String} data.content 回应内容
 * @param {String} data.voice_url 语音文件URL（可选）
 * @param {Number} data.voice_duration 语音时长（秒，可选）
 * @returns {Promise}
 */
export function responseTreeHoleBox(data) {
	return request.post('v3/treehole/response', data);
}

/**
 * 获取树洞盲盒回应列表
 * @param {Object} data 查询参数
 * @param {Number} data.box_id 盲盒ID
 * @param {Number} data.page 页码，默认1
 * @param {Number} data.limit 每页数量，默认10
 * @param {Number} data.parent_id 父级回应ID（可选，获取子回复时使用）
 * @returns {Promise}
 */
export function getTreeHoleResponseList(data) {
	return request.get('v3/treehole/response_list', data);
}

/**
 * 删除树洞盲盒
 * @param {Number} id 盲盒ID
 * @returns {Promise}
 */
export function deleteTreeHoleBox(id) {
	return request.post(`v3/treehole/delete/${id}`);
}

/**
 * 删除树洞回应
 * @param {Number} id 回应ID
 * @returns {Promise}
 */
export function deleteTreeHoleResponse(id) {
	return request.post(`v3/treehole/response/delete/${id}`);
}

/**
 * 放回树洞盲盒（不再显示在我抽到的列表中）
 * @param {Number} draw_id 抽取记录ID
 * @returns {Promise}
 */
export function returnTreeHoleBox(draw_id) {
	return request.post(`v3/treehole/return/${draw_id}`);
}

/**
 * 获取树洞盲盒统计信息
 * @returns {Promise}
 */
export function getTreeHoleStats() {
	return request.get('v3/treehole/stats');
}


