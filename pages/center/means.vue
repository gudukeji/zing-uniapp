<template>
	<view>
		<form @submit="formSubmit">
	<view class="container">
		<!-- <navbar></navbar> -->
				<!-- <view class="title-box" :style="{'margin-top': statusBarHeight + titleBarHeight + 'px'}">
			<view>完善你的资料📸</view>
			<view>让大家更好地了解你</view>
		</view>
				 -->
				<!-- 相册模块 -->
				<view class="album-section" >
					<view class="album-title">我的照片📸 ({{userInfo.avatar ? backgroundImages.length + 1 : backgroundImages.length}}/6)</view>
					<view class="album-desc">封面头像需上传你的清晰无遮挡照片，否则无法为你推荐优质的朋友！
						<text class="change-avatar" @tap="changeProfilePhoto">更换头像</text>
			</view>
					
					<view class="photo-grid" id="photoGrid">
						<!-- 封面头像 -->
						<view class="photo-item cover-photo" 
							@tap="userInfo.avatar ? showPhotoMenu({type: '头像', url: userInfo.avatar}, -1) : changeProfilePhoto()"
						>
							<block v-if="userInfo.avatar">
								<image class="photo-image" :src="userInfo.avatar" mode="aspectFill"></image>
								<view class="photo-tag">头像</view>
							</block>
							<block v-else>
								<view class="photo-placeholder">
									<image class="photo-icon" src="/static/img/avatar.png"></image>
									<view class="photo-type">我的头像</view>
									<view class="photo-boost">+10%</view>
								</view>
							</block>
						</view>
						
						<!-- 生活照 -->
						<view class="photo-item" 
							@tap="hasPhotoOfType('生活照') ? showPhotoMenu(getPhotoObject('生活照'), getPhotoIndex('生活照')) : addPhotoByType('生活照')"
						>
							<block v-if="hasPhotoOfType('生活照')">
								<image class="photo-image" :src="getPhotoByType('生活照')" mode="aspectFill"></image>
							</block>
							<block v-else>
								<view class="photo-placeholder">
									<image class="photo-icon" src="/static/img/photo-life.png"></image>
									<view class="photo-type">有趣的生活照</view>
									<view class="photo-boost">+5%</view>
								</view>
							</block>
						</view>
						
						<!-- 旅行照 -->
						<view class="photo-item" 
							@tap="hasPhotoOfType('旅行照') ? showPhotoMenu(getPhotoObject('旅行照'), getPhotoIndex('旅行照')) : addPhotoByType('旅行照')"
						>
							<block v-if="hasPhotoOfType('旅行照')">
								<image class="photo-image" :src="getPhotoByType('旅行照')" mode="aspectFill"></image>
							</block>
							<block v-else>
								<view class="photo-placeholder">
									<image class="photo-icon" src="/static/img/photo-travel.png"></image>
									<view class="photo-type">好看的旅行照</view>
									<view class="photo-boost">+5%</view>
								</view>
							</block>
						</view>
						
						<!-- 才艺照 -->
						<view class="photo-item" 
							@tap="hasPhotoOfType('才艺照') ? showPhotoMenu(getPhotoObject('才艺照'), getPhotoIndex('才艺照')) : addPhotoByType('才艺照')"
						>
							<block v-if="hasPhotoOfType('才艺照')">
								<image class="photo-image" :src="getPhotoByType('才艺照')" mode="aspectFill"></image>
							</block>
							<block v-else>
								<view class="photo-placeholder">
									<image class="photo-icon" src="/static/img/photo-talent.png"></image>
									<view class="photo-type">独一无二的才艺</view>
									<view class="photo-boost">+5%</view>
								</view>
							</block>
						</view>
						
						<!-- 回忆照 -->
						<view class="photo-item" 
							@tap="hasPhotoOfType('回忆照') ? showPhotoMenu(getPhotoObject('回忆照'), getPhotoIndex('回忆照')) : addPhotoByType('回忆照')"
						>
							<block v-if="hasPhotoOfType('回忆照')">
								<image class="photo-image" :src="getPhotoByType('回忆照')" mode="aspectFill"></image>
							</block>
							<block v-else>
								<view class="photo-placeholder">
									<image class="photo-icon" src="/static/img/photo-memory.png"></image>
									<view class="photo-type">美好的回忆瞬间</view>
									<view class="photo-boost">+5%</view>
								</view>
							</block>
						</view>
						
						<!-- 美食/宠物照 -->
						<view class="photo-item" 
							@tap="hasPhotoOfType('美食宠物照') ? showPhotoMenu(getPhotoObject('美食宠物照'), getPhotoIndex('美食宠物照')) : addPhotoByType('美食宠物照')"
						>
							<block v-if="hasPhotoOfType('美食宠物照')">
								<image class="photo-image" :src="getPhotoByType('美食宠物照')" mode="aspectFill"></image>
							</block>
							<block v-else>
								<view class="photo-placeholder">
									<image class="photo-icon" src="/static/img/photo-food.png"></image>
									<view class="photo-type">最爱的美食/宠物</view>
									<view class="photo-boost">+5%</view>
								</view>
							</block>
						</view>
					</view>
				</view>
				
				<!-- 其他个人信息字段 -->
				<view class="df sp">
					<view class="title-label w50">昵称</view>
					<view class="title-label w50">性别</view>
				</view>
				
				<view class="df sp">
		<input 
			type="nickname" 
						name="nickname"
						class="input-box w50" 
			@blur="nameBlur" 
			maxlength="16" 
			placeholder="怎么称呼你" 
			v-model="userInfo.nickname"
		/>
					<view class="input-box w50 df" @tap="genderPopupClick(true)">
						<view :style="{'color': userInfo.sex !== undefined ? '#000' : '#999'}">
							<block v-if="userInfo.sex === 1">男</block>
							<block v-else-if="userInfo.sex === 2">女</block>
							<block v-else>未知</block>
						</view>
						<image src="/static/img/x.png" style="width:24rpx;height:24rpx"></image>
					</view>
				</view>
				
				<view class="title-label">关于我</view>
		<textarea 
			@blur="introBlur" 
			class="textarea-box" 
			:show-confirm-bar="false" 
			cursor-spacing="30" 
			maxlength="100" 
			placeholder="添加个人简介，让大家认识你..." 
			auto-height 
			v-model="userInfo.about_me"
		></textarea>
		
				<!-- 新增兴趣标签选择器 -->
				<view class="title-label">我的标签</view>
				<view class="input-box df" @tap="newTagsPopupClick(true)">
					<view :style="{'color': userInfo.interest_tags && userInfo.interest_tags.length > 0 ? '#000' : '#999'}">
						<block v-if="userInfo.interest_tags && userInfo.interest_tags.length > 0">
							{{userInfo.interest_tags.join('、')}}
						</block>
						<block v-else>点击选择标签</block>
					</view>
					<image src="/static/img/x.png" style="width:24rpx;height:24rpx"></image>
		</view>
		
				<!-- 生日和星座放在一排 -->
				<view class="df sp">
					<view class="title-label w50">生日</view>
					<view class="title-label w50">星座</view>
				</view>
				
				<view class="df sp">
					<view class="input-box w50 df" @tap="birthdayPopupClick(true)">
					<view :style="{'color': userInfo.birthday ? '#000' : '#999'}">
						{{formattedBirthday || '点击选择'}}
				</view>
					<image src="/static/img/x.png" style="width:24rpx;height:24rpx"></image>
				</view>
					<view class="input-box w50 df">
					<view :style="{'color': userInfo.constellation !== null ? '#000' : '#999'}">
						{{userInfo.constellation !== null ? getConstellationName(userInfo.constellation) : '选择生日后自动生成'}}
						</view>
			</view>
				</view>
				
				<!-- 学校和家乡放在一排 -->
				<view class="df sp">
					<view class="title-label w50">学校</view>
					<view class="title-label w50">家乡</view>
				</view>
				
				<view class="df sp">
				<input 
						class="input-box w50" 
					maxlength="30" 
					placeholder="填写你的学校" 
					v-model="userInfo.school"
				/>
				<input 
						class="input-box w50" 
					maxlength="30" 
					placeholder="填写你的家乡" 
					v-model="userInfo.hometown"
				/>
				</view>
				
				<!-- 新增字段：职业 -->
				<view class="title-label">职业</view>
				<input 
					class="input-box" 
					maxlength="30" 
					placeholder="填写你的职业" 
					v-model="userInfo.occupation"
				/>
				
				<!-- 新增字段：身高和体重 -->
				<view class="df sp">
					<view class="title-label w50">身高(cm)</view>
					<view class="title-label w50">体重(kg)</view>
			</view>
				
				<view class="df sp">
					<input 
						class="input-box w50" 
						type="digit" 
						maxlength="5" 
						placeholder="填写身高" 
						v-model="userInfo.height"
					/>
					<input 
						class="input-box w50" 
						type="digit" 
						maxlength="5" 
						placeholder="填写体重" 
						v-model="userInfo.weight"
					/>
		</view>
		
		<view class="title-label">手机号</view>
		<view class="input-box df">
			<view>{{userInfo.phone || '未绑定'}}</view>
			<button class="input-btn df" open-type="getPhoneNumber" @getphonenumber="bindMobileClick">
				<image src="/static/img/dh.png"></image>
				<text>{{userInfo.phone ? '换绑' : '绑定'}}</text>
			</button>
		</view>
		
		<view class="title-label">实名认证</view>
		<view class="input-box df">
			<view>{{getAuthStatusText()}}</view>
			<view class="input-btn df" @tap="goToRealAuth">
				<image src="/static/img/verified.png"></image>
				<text>{{userInfo.auth_status === 2 ? '完成' : '认证'}}</text>
			</view>
		</view>
		
		<view class="title-label">IP属地</view>
		<view class="input-box df">
			<view>{{userInfo.residence_name || userInfo.province || '未知'}}</view>
			<view class="input-btn df" @tap="refreshIpClick">
				<image src="/static/img/ip.png"></image>
				<text>刷新</text>
			</view>
		</view>
		<view class="input-tips">
			IP属地说明：为维护网络安全、保障良好生态和社区的真实性，根据网络运营商数据，展示用户IP属地信息。
		</view>
				
				<!-- 底部操作按钮 -->
				<view class="footer-box bfw bUp">
					<view class="footer-item df">
						<view class="btn bg2" @tap="saveAllChanges">保存</view>
					</view>
				</view>
				
				<!-- 生日选择弹窗 -->
				<uni-popup ref="birthdayPopup" type="bottom" :safe-area="false">
					<view class="popup-box">
						<view class="popup-top df">
							<view class="popup-title">
								<view class="t1">选择生日</view>
								<view class="t2">请选择您的出生日期</view>
							</view>
							<view class="popup-close df" @tap="birthdayPopupClick(false)">
								<image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
							</view>
						</view>
						<picker-view
							class="birthday-picker"
							:indicator-style="'height: 50px;'"
							:value="birthdayPickerValue"
							@change="birthdayPickerChange"
						>
							<picker-view-column>
								<view class="picker-item" v-for="(item, index) in years" :key="index">{{item}}年</view>
							</picker-view-column>
							<picker-view-column>
								<view class="picker-item" v-for="(item, index) in months" :key="index">{{item}}月</view>
							</picker-view-column>
							<picker-view-column>
								<view class="picker-item" v-for="(item, index) in days" :key="index">{{item}}日</view>
							</picker-view-column>
						</picker-view>
						<view class="popup-btn" @tap="confirmBirthday">确认保存</view>
					</view>
				</uni-popup>
		
		<!-- 年龄选择弹窗 -->
		<uni-popup ref="agePopup" type="bottom" :safe-area="false">
			<view class="popup-box">
				<view class="popup-top df">
					<view class="popup-title">
								<view class="t1">选择兴趣爱好</view>
								<view class="t2">可选择多个标签 ({{selectedTags.length}}/5)</view>
					</view>
					<view class="popup-close df" @tap="agePopupClick(false)">
						<image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
					</view>
				</view>
						
						<!-- 标签分类导航 -->
						<scroll-view class="tag-categories" scroll-x="true" show-scrollbar="false">
					<view 
								v-for="(category, index) in tagCategories" 
						:key="index" 
								:class="['category-item', currentCategoryIndex === index ? 'category-active' : '']"
								@tap="switchCategory(index)"
								style="position: relative;"
							>
								{{category.name}}
								<text v-if="category.tags && category.tags.length > 0" 
									style="font-size: 20rpx; margin-left: 6rpx; opacity: 0.8;"
								>({{category.tags.length}})</text>
							</view>
						</scroll-view>
						
						<!-- 标签内容区 -->
						<swiper class="tags-swiper" :current="currentCategoryIndex" @change="swiperChange">
							<swiper-item v-for="(category, index) in tagCategories" :key="index">
								<scroll-view class="tags-scroll" scroll-y="true">
									<view class="tags-box">
										<view v-if="!category.tags || category.tags.length === 0" class="no-tags">
											该分类暂无标签
										</view>
										<view 
											v-for="(item, itemIndex) in category.tags" 
											:key="itemIndex" 
											:class="['tag-item', selectedTags.includes(item) ? 'tagactive' : '']"
											@tap="toggleTag(item)"
					>
						{{item}}
					</view>
				</view>
								</scroll-view>
							</swiper-item>
						</swiper>
						
						<view class="popup-btn" @tap="confirmTags">确认保存</view>
					</view>
				</uni-popup>
				
				<!-- 性别选择弹窗 -->
				<uni-popup ref="genderPopup" type="bottom" :safe-area="false">
					<view class="popup-box">
						<view class="popup-top df">
							<view class="popup-title">
								<view class="t1">选择性别</view>
								<view class="t2">请选择您的性别</view>
							</view>
							<view class="popup-close df" @tap="genderPopupClick(false)">
								<image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
							</view>
						</view>
						<view class="gender-box">
							<view 
								@tap="genderItemClick(1)" 
								:class="['gender-item', 'df', tempGender == 1 ? 'active-1' : '']"
							>
								<image src="/static/img/nan.png"></image>
								<text>男</text>
							</view>
							<view 
								@tap="genderItemClick(2)" 
								:class="['gender-item', 'df', tempGender == 2 ? 'active-2' : '']"
							>
								<image src="/static/img/nv.png"></image>
								<text>女</text>
							</view>
							<view 
								@tap="genderItemClick(0)" 
								:class="['gender-item', 'df', tempGender == 0 ? 'active-1' : '']"
							>
								<text>未知</text>
							</view>
						</view>
						<view class="popup-btn" @tap="confirmGender">确认保存</view>
			</view>
		</uni-popup>
		
		<!-- 提示弹窗 -->
				<uni-popup ref="tipsPopup" type="center" :mask-background-color="'rgba(0, 0, 0, 0.3)'">
			<view class="tips-box df">
				<view class="tips-item">{{tipsTitle}}</view>
			</view>
		</uni-popup>
				
				<!-- 底部安全区域，防止内容被底部按钮遮挡 -->
				<view class="bottom-safe-area"></view>
				
				<!-- canvas用于图片处理 -->
				<canvas canvas-id="canvas" v-if="canvasStatus"
					:style="{width: canvasWidth + 'px', height: canvasHeight + 'px', position: 'absolute', left:'-100000px', top:'-100000px'}"></canvas>
				
				<!-- 新增标签选择弹窗 -->
				<uni-popup ref="newTagsPopup" type="bottom" :safe-area="false">
					<view class="popup-box">
						<view class="popup-top df">
							<view class="popup-title">
								<view class="t1">选择我的标签</view>
								<view class="t2">可选择多个标签 ({{selectedNewTags.length}}/5)</view>
							</view>
							<view class="popup-close df" @tap="newTagsPopupClick(false)">
								<image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
							</view>
						</view>
						
						<!-- 标签分类导航 -->
						<scroll-view class="tag-categories" scroll-x="true" show-scrollbar="false">
							<view 
								v-for="(category, index) in newTagCategories" 
								:key="index" 
								:class="['category-item', newCategoryIndex === index ? 'category-active' : '']"
								@tap="switchNewCategory(index)"
								style="position: relative;"
							>
								{{category.name}}
								<text v-if="category.tags && category.tags.length > 0" 
									style="font-size: 20rpx; margin-left: 6rpx; opacity: 0.8;"
								>({{category.tags.length}})</text>
							</view>
						</scroll-view>
						
						<!-- 标签内容区 -->
						<swiper class="tags-swiper" :current="newCategoryIndex" @change="newSwiperChange">
							<swiper-item v-for="(category, index) in newTagCategories" :key="index">
								<scroll-view class="tags-scroll" scroll-y="true">
									<view class="tags-box">
										<view v-if="!category.tags || category.tags.length === 0" class="no-tags">
											该分类暂无标签
										</view>
										<view 
											v-for="(item, itemIndex) in category.tags" 
											:key="itemIndex" 
											:class="['tag-item', selectedNewTags.includes(item) ? 'tagactive' : '']"
											@tap="toggleNewTag(item)"
										>
											{{item}}
										</view>
									</view>
								</scroll-view>
							</swiper-item>
						</swiper>
						
						<view class="popup-btn" @tap="confirmNewTags">确认保存</view>
					</view>
				</uni-popup>
			</view>
		</form>
	</view>
</template>

<script>
import { getMyTags, updateUserTags, getUserSocialInfo, updateUserSocialInfo, getTagsWithCategories } from '@/api/social.js'
import navbar from '@/components/navbar/navbar.vue'
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
import { toLogin } from '@/libs/login.js'

const app = getApp();

export default {
	components: {
		navbar,
		uniPopup
	},
	data() {
		// 获取当前日期相关数据，用于生日选择器
		const date = new Date();
		const currentYear = date.getFullYear();
		const years = Array.from({ length: 100 }, (_, i) => currentYear - 99 + i);
		const months = Array.from({ length: 12 }, (_, i) => i + 1);
		const days = Array.from({ length: 31 }, (_, i) => i + 1);
		
		// 初始化生日选择器的默认值（25岁，1月1日）
		const defaultYearIndex = years.findIndex(year => year === currentYear - 25);
		
		return {
			userInfo: {
				avatar: "",
				nickname: "",
				about_me: "",
				sex: 0,
				birthday: "",
				constellation: null,
				school: "",
				hometown: "",
				occupation: "",
				residence_lat: 0,
				residence_lng: 0,
				residence_name: "",
				interest_tags: [], // 标签数组
			},
			// 照片相关
			backgroundImages: [],
			photoTypes: ['生活照', '旅行照', '才艺照', '回忆照', '美食宠物照'],
			
			// 生日选择器
			years,
			months,
			days,
			birthdayPickerValue: [defaultYearIndex, 0, 0],
			
			// 优化的标签状态管理
			tagState: {
				selectedTags: [],        // 当前选中的标签
				myTags: [],             // 我的标签数据
				categories: [],         // 标签分类数据
				currentCategoryIndex: 0, // 当前分类索引
				isLoading: false        // 加载状态
			},

			// 优化的UI状态管理
			uiState: {
				canvasStatus: false,
				canvasWidth: 0,
				canvasHeight: 0,
				tempGender: undefined,   // 临时存储性别选择
				tipsTitle: ''           // 提示标题
			},

			// 防抖和性能优化
			debounceTimers: {
				save: null,
				upload: null
			}
		}
	},
	computed: {
		// 格式化生日显示
		formattedBirthday() {
			if (!this.userInfo.birthday) return '';
			
			// 处理时间戳格式
			if (typeof this.userInfo.birthday === 'number' || !isNaN(this.userInfo.birthday)) {
					const timestamp = parseInt(this.userInfo.birthday);
					const date = new Date(timestamp * 1000);
				return this.formatDate(date);
			}
			
			return this.userInfo.birthday;
		},
		
		// 获取当前分类的标签
		currentCategoryTags() {
			const currentCategory = this.tagState.categories[this.tagState.currentCategoryIndex];
			return currentCategory?.tags || [];
		}
	},
	onLoad() {
		// 统一加载数据
		this.initializeData();
	},

	onShow() {
		// 每次显示页面时检查用户是否切换
		this.checkUserChange();
	},
	methods: {
		// 检查用户是否切换
		async checkUserChange() {
			try {
				// 获取当前登录用户的ID和token
				const currentUserId = this.$store.state.app.uid;
				const currentToken = this.$store.state.app.token;

				// 检查是否有有效的登录状态
				if (!currentToken || !currentUserId) {
					console.log('用户未登录，跳转到登录页');
					toLogin();
					return;
				}

				// 如果用户ID发生变化，或者页面数据为空，重新加载数据
				if (!this.userInfo.uid || currentUserId !== this.userInfo.uid) {
					console.log('检测到用户切换或数据为空，重新加载数据');
					console.log('当前用户ID:', currentUserId, '页面用户ID:', this.userInfo.uid);
					await this.refreshUserData();
				}
			} catch (error) {
				console.error('检查用户切换失败:', error);
			}
		},

		// 刷新用户数据
		async refreshUserData() {
			try {
				uni.showLoading({
					title: '刷新数据...',
					mask: true
				});

				// 重新获取用户信息和相关数据
				await Promise.all([
					this.getUserInfo(),
					this.loadMyTags()
				]);

			} catch (error) {
				console.error('刷新用户数据失败:', error);
				uni.showToast({
					title: '刷新失败，请重试',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},

		// 统一初始化数据
		async initializeData() {
			try {
				// 显示加载中
				uni.showLoading({
					title: '加载中...',
					mask: true
				});
				
				// 并行加载数据
				await Promise.all([
					this.getUserInfo(),
					this.loadTagCategories(),
					this.loadMyTags(), // 添加加载我的标签
					this.getUserLocation()
				]);
				
			} catch (error) {
				console.error('初始化数据失败:', error);
				uni.showToast({
					title: '加载失败，请重试',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		
		// 获取用户信息
		async getUserInfo() {
			try {
				const res = await getUserSocialInfo();
				if (res.code === 200 && res.data) {
					console.log('获取用户信息成功:', res.data);

					// 完全替换用户信息，避免保留上一个用户的数据
					this.userInfo = res.data;

					// 初始化标签选择
					if (res.data.interest_tags) {
						this.tagState.selectedTags = [...res.data.interest_tags];
					} else {
						this.tagState.selectedTags = []; // 清空标签选择
					}

					// 清空背景图片数据，避免显示上一个用户的图片
					this.backgroundImages = res.data.background_images || [];

					// 保存到本地
					uni.setStorageSync('USER_INFO', res.data);
				}
			} catch (error) {
				console.error('获取用户信息失败:', error);
				throw error;
			}
		},
		
		// 优化的标签加载方法
		async loadTagCategories() {
			if (this.tagState.isLoading) return;
			this.tagState.isLoading = true;

			try {
				const res = await getTagsWithCategories();
				if (res.code === 200 && res.data) {
					this.processNewTagsData(res.data);
				}
			} catch (error) {
				console.error('加载标签分类失败:', error);
				throw error;
			} finally {
				this.tagState.isLoading = false;
			}
		},

		// 防抖处理方法
		debounce(func, delay = 300, timerKey = 'default') {
			if (this.debounceTimers[timerKey]) {
				clearTimeout(this.debounceTimers[timerKey]);
			}

			this.debounceTimers[timerKey] = setTimeout(() => {
				func.call(this);
				this.debounceTimers[timerKey] = null;
			}, delay);
		},

		// 统一的错误处理方法
		handleError(error, context = '操作') {
			console.error(`${context}失败:`, error);

			let message = `${context}失败，请稍后重试`;
			if (error.message) {
				message = error.message;
			} else if (error.msg) {
				message = error.msg;
			}

			uni.showToast({
				title: message,
				icon: 'none',
				duration: 2000
			});
		},

		// 优化的照片处理方法
		hasPhotoOfType(type) {
			return this.backgroundImages.some(img => img.type === type);
		},

		getPhotoByType(type) {
			const photo = this.backgroundImages.find(img => img.type === type);
			return photo ? photo.url : '';
		},

		getPhotoObject(type) {
			return this.backgroundImages.find(img => img.type === type) || null;
		},

		getPhotoIndex(type) {
			return this.backgroundImages.findIndex(img => img.type === type);
		},
		
		// 处理标签数据
		processNewTagsData(data) {
			try {
				const tagsArray = Array.isArray(data) ? data : (data.list || data.data || []);
				
				this.newTagCategories = tagsArray.map(category => {
					const tags = this.extractTags(category);
					const originalTags = this.getOriginalTags(category);
					
					return {
						id: category.id || 0,
						name: category.name || '未分类',
						tags: tags || [],
						originalTags: originalTags || []
					};
				}).filter(category => category.tags && category.tags.length > 0);
			} catch (error) {
				console.error('处理标签数据失败:', error);
				this.newTagCategories = [];
			}
		},
		
		// 提取标签名称
		extractTags(category) {
			if (Array.isArray(category.tags)) {
				return category.tags.map(tag => typeof tag === 'string' ? tag : tag.name);
			}
			if (Array.isArray(category.tag_list)) {
				return category.tag_list.map(tag => typeof tag === 'string' ? tag : tag.name);
			}
			if (Array.isArray(category.tagList)) {
				return category.tagList.map(tag => typeof tag === 'string' ? tag : tag.name);
			}
			return category.name ? [category.name] : [];
		},
		
		// 获取原始标签数据
		getOriginalTags(category) {
			if (Array.isArray(category.tags)) return category.tags;
			if (Array.isArray(category.tag_list)) return category.tag_list;
			if (Array.isArray(category.tagList)) return category.tagList;
			return category.name ? [category] : [];
		},
		
		// 格式化日期
		formatDate(date) {
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const day = date.getDate().toString().padStart(2, '0');
			return `${year}-${month}-${day}`;
		},
		
		// 获取用户位置信息
		getUserLocation() {
			// 先尝试从缓存获取
			const cachedLatitude = uni.getStorageSync('residence_lat');
			const cachedLongitude = uni.getStorageSync('residence_lng');
			
			if (cachedLatitude && cachedLongitude) {
				this.userInfo.residence_lat = parseFloat(cachedLatitude);
				this.userInfo.residence_lng = parseFloat(cachedLongitude);
				console.log('个人资料页：从缓存获取到用户位置:', this.userInfo.residence_lat, this.userInfo.residence_lng);
				
				// 如果有缓存的地址信息，先使用缓存
				const cachedAddress = uni.getStorageSync('residence_name');
				if (cachedAddress) {
					this.userInfo.residence_name = cachedAddress;
					this.userInfo.province = cachedAddress;
					console.log('从缓存获取到地址:', cachedAddress);
				} else {
					// 根据经纬度获取地址
					this.getAddressFromLocation(this.userInfo.residence_lat, this.userInfo.residence_lng);
				}
				return;
			}
			
			// 缓存中没有位置信息，尝试获取当前位置
			console.log('个人资料页：开始获取用户位置信息');
			
			// #ifdef H5
			// 检查是否在微信环境中
			const ua = navigator.userAgent.toLowerCase();
			const isWeixin = ua.indexOf('micromessenger') !== -1;
			
			if (isWeixin && this.$wechat && this.$wechat.isWeixin()) {
				// 微信环境下使用微信API获取位置
				this.$wechat.location().then(res => {
					this.userInfo.residence_lat = res.latitude;
					this.userInfo.residence_lng = res.longitude;
					// 保存到缓存
					uni.setStorageSync('residence_lat', res.latitude);
					uni.setStorageSync('residence_lng', res.longitude);
					console.log('个人资料页：微信获取位置成功:', res.latitude, res.longitude);
					
					// 根据经纬度获取地址
					this.getAddressFromLocation(res.latitude, res.longitude);
				}).catch(err => {
					console.log('个人资料页：微信获取位置失败，使用默认位置:', err);
					this.setDefaultLocation();
				});
			} else {
			// #endif
				// 非微信环境或APP环境使用uni.getLocation
				uni.getLocation({
					type: 'wgs84',
					success: (res) => {
						this.userInfo.residence_lat = res.latitude;
						this.userInfo.residence_lng = res.longitude;
						// 保存到缓存
						uni.setStorageSync('residence_lat', res.latitude);
						uni.setStorageSync('residence_lng', res.longitude);
						console.log('个人资料页：uni.getLocation获取位置成功:', res.latitude, res.longitude);
						
						// 根据经纬度获取地址
						this.getAddressFromLocation(res.latitude, res.longitude);
					},
					fail: (err) => {
						console.log('个人资料页：获取位置失败，使用默认位置:', err);
						this.setDefaultLocation();
					}
				});
			// #ifdef H5
			}
			// #endif
		},
		
		// 设置默认位置（广州）
		setDefaultLocation() {
			this.userInfo.residence_lat = 23.12908; // 广州纬度
			this.userInfo.residence_lng = 113.26436; // 广州经度
			this.userInfo.residence_name = "广东省广州市";
			this.userInfo.province = "广东省广州市";
			// 保存到缓存
			uni.setStorageSync('residence_lat', this.userInfo.residence_lat);
			uni.setStorageSync('residence_lng', this.userInfo.residence_lng);
			uni.setStorageSync('residence_name', this.userInfo.residence_name);
			console.log('个人资料页：使用默认位置（广州）:', this.userInfo.residence_lat, this.userInfo.residence_lng);
			console.log('设置默认地址:', this.userInfo.residence_name);
		},
		
		// 强制刷新位置信息
		refreshLocation() {
			console.log('个人资料页：强制刷新位置信息');
			// 清除缓存的位置信息
			uni.removeStorageSync('residence_lat');
			uni.removeStorageSync('residence_lng');
			uni.removeStorageSync('residence_name');
			// 重新获取位置
			this.getUserLocation();
		},
		
		// 根据经纬度获取地址信息（逆地理编码）
		getAddressFromLocation(latitude, longitude) {
			console.log('开始逆地理编码，经纬度:', latitude, longitude);
			
			// 使用腾讯地图逆地理编码API
			uni.request({
				url: 'https://apis.map.qq.com/ws/geocoder/v1/',
				data: {
					location: `${latitude},${longitude}`,
					key: 'F7LBZ-NLU6D-6524Z-PK6ZQ-D47AJ-KRB2I', // 腾讯地图API key
					get_poi: 0
				},
				success: (res) => {
					console.log('逆地理编码响应:', res.data);
					if (res.data.status === 0 && res.data.result) {
						const result = res.data.result;
						const address = result.address;
						const province = result.ad_info.province;
						const city = result.ad_info.city;
						const district = result.ad_info.district;
						
						// 组合地址信息
						let fullAddress = '';
						if (province && city) {
							if (province === city) {
								// 直辖市情况
								fullAddress = province + (district || '');
							} else {
								// 普通省市情况
								fullAddress = province + city + (district || '');
							}
						} else {
							// 备用方案
							fullAddress = address || '未知位置';
						}
						
						// 更新地址信息
						this.userInfo.residence_name = fullAddress;
						this.userInfo.province = fullAddress;
						
						// 保存到缓存
						uni.setStorageSync('residence_name', fullAddress);
						
						console.log('逆地理编码成功，地址:', fullAddress);
						this.opTipsPopup('位置获取成功: ' + fullAddress);
					} else {
						console.error('逆地理编码失败:', res.data);
						this.setFallbackAddress();
					}
				},
				fail: (err) => {
					console.error('逆地理编码请求失败:', err);
					this.setFallbackAddress();
				}
			});
		},
		
		// 设置备用地址
		setFallbackAddress() {
			// 如果逆地理编码失败，使用默认地址
			const defaultAddress = "位置获取中...";
			this.userInfo.residence_name = defaultAddress;
			this.userInfo.province = defaultAddress;
			console.log('设置备用地址:', defaultAddress);
		},
		
		// 同步位置信息到userInfo
		syncLocationInfo() {
			// 从缓存获取位置信息
			const cachedLatitude = uni.getStorageSync('residence_lat');
			const cachedLongitude = uni.getStorageSync('residence_lng');
			const cachedAddress = uni.getStorageSync('residence_name');
			
			if (cachedLatitude && cachedLongitude) {
				// 如果userInfo中没有位置信息，则更新
				if (!this.userInfo.residence_lat || !this.userInfo.residence_lng) {
					this.userInfo.residence_lat = parseFloat(cachedLatitude);
					this.userInfo.residence_lng = parseFloat(cachedLongitude);
					console.log('同步位置信息到userInfo:', this.userInfo.residence_lat, this.userInfo.residence_lng);
				}
				
				// 同步地址信息
				if (cachedAddress && !this.userInfo.residence_name) {
					this.userInfo.residence_name = cachedAddress;
					this.userInfo.province = cachedAddress;
					console.log('同步地址信息到userInfo:', cachedAddress);
				}
			} else {
				// 如果缓存中没有位置信息，获取位置
				this.getUserLocation();
			}
		},
		
		// 统一的缓存解析方法
		getUserInfoFromCache() {
			let userInfo = uni.getStorageSync('USER_INFO') || {};
			
			// 如果缓存返回字符串，先解析它
			if (typeof userInfo === 'string') {
				try {
					userInfo = JSON.parse(userInfo);
				} catch (e) {
					console.error('解析USER_INFO缓存失败:', e);
					userInfo = {};
				}
			}
			
			return userInfo;
		},
		
		// 处理背景图片数据
		handleBackgroundImages() {
			if (this.userInfo.home_background) {
				try {
					// 尝试解析JSON
					if (typeof this.userInfo.home_background === 'string') {
						this.backgroundImages = JSON.parse(this.userInfo.home_background);
					} else if (Array.isArray(this.userInfo.home_background)) {
						this.backgroundImages = this.userInfo.home_background;
					}
				} catch (e) {
					console.error('解析背景图片数据失败', e);
					this.backgroundImages = [];
				}
			} else {
				this.backgroundImages = [];
			}
		},
		
		// 检查是否有指定类型的照片
		hasPhotoOfType(type) {
			return this.backgroundImages.some(item => item.type === type);
		},
		
		// 获取指定类型的照片URL
		getPhotoByType(type) {
			const photo = this.backgroundImages.find(item => item.type === type);
			return photo ? photo.url : '';
		},
		
		// 获取指定类型的照片对象
		getPhotoObject(type) {
			return this.backgroundImages.find(item => item.type === type) || null;
		},
		
		// 获取指定类型的照片索引
		getPhotoIndex(type) {
			return this.backgroundImages.findIndex(item => item.type === type);
		},
		
		// 根据类型添加照片
		addPhotoByType(type) {
			let that = this;
			
			// 如果没有指定类型，弹出选择类型的菜单
			if (!type) {
				const photoTypes = ['生活照', '旅行照', '才艺照', '回忆照', '美食宠物照'];
				// 过滤出已经有的类型
				const existingTypes = this.backgroundImages.map(item => item.type);
				const availableTypes = photoTypes.filter(t => !existingTypes.includes(t));
				
				if (availableTypes.length === 0) {
					this.opTipsPopup('已经添加了所有类型的照片');
					return;
				}
				
				uni.showActionSheet({
					itemList: availableTypes,
					success: (res) => {
						const selectedType = availableTypes[res.tapIndex];
						that.chooseAndUploadPhoto(selectedType);
					}
				});
				return;
			}
			
			// 如果指定了类型，直接选择照片
			that.chooseAndUploadPhoto(type);
		},
		
		// 选择并上传照片
		chooseAndUploadPhoto(type) {
			let that = this;
			that.canvasStatus = true;
			that.$util.uploadImageChange('upload/image', (res) => {
				// 如果已经有这个类型的照片，先删除
				that.backgroundImages = that.backgroundImages.filter(item => item.type !== type);
				// 添加新照片
				that.backgroundImages.push({
					type: type,
					url: res.data.url
				});
				that.canvasStatus = false;
				that.opTipsPopup('上传成功');
			}, (res) => {
				that.canvasStatus = false;
				that.opTipsPopup('上传失败');
			}, (res) => {
				that.canvasWidth = res.w;
				that.canvasHeight = res.h;
			});
		},
		
		// 更换头像
		changeProfilePhoto() {
			let that = this;
			this.canvasStatus = true;
			
			that.$util.uploadImageChange('upload/image', (res) => {
				that.canvasStatus = false;
				
				// 只在本地更新头像，不发送到服务器
				that.userInfo.avatar = res.data.url;
				
				// 提示用户需要点击保存按钮
				that.opTipsPopup('头像已选择，点击保存按钮生效');
			}, (res) => {
				that.canvasStatus = false;
				that.opTipsPopup('头像选择取消');
			}, (res) => {
				that.canvasWidth = res.w;
				that.canvasHeight = res.h;
			});
		},
		
		// 微信头像获取（小程序专用）
		onChooseAvatar(e) {
			const that = this;
			const { avatarUrl } = e.detail;
			
			this.$util.uploadImgs('upload/image', avatarUrl, (res) => {
				// 仅在本地更新头像，不发送到服务器
				that.userInfo.avatar = res.data.url;
				that.opTipsPopup('头像已选择，点击保存按钮生效');
			}, (err) => {
				console.log(err);
				this.opTipsPopup('头像上传失败');
			});
		},
		
		nameBlur() {
			// 在有了保存按钮后，不需要在失去焦点时立即保存
			// 仅记录修改状态，由用户决定何时保存
		},
		
		introBlur() {
			// 在有了保存按钮后，不需要在失去焦点时立即保存
			// 仅记录修改状态，由用户决定何时保存
		},
		
		userUpInfo(type = 0) {
			let that = this;
			
			// 先处理背景图片数据
			that.userInfo.home_background = JSON.stringify(that.backgroundImages);
			
			// 尝试使用真实API
			if (api.default && api.default.api && api.default.api.editUserInfoUrl) {
				request(api.default.api.editUserInfoUrl, {
					type: type,
					name: that.userInfo.name,
					intro: that.userInfo.intro,
					avatar: that.userInfo.avatar,
					gender: that.userInfo.gender,
					age: that.userInfo.age,
					// 新增字段
					school: that.userInfo.school,
					hometown: that.userInfo.hometown,
					occupation: that.userInfo.occupation,
					height: that.userInfo.height,
					weight: that.userInfo.weight,
					birthday: that.userInfo.birthday,
					home_background: that.userInfo.home_background
				}, "POST").then(function(res) {
					if (res.code == 200) {
						let userInfo = that.getUserInfoFromCache();
						userInfo = {...userInfo, ...that.userInfo};
						uni.setStorageSync('USER_INFO', userInfo);
						that.originalUserInfo = JSON.parse(JSON.stringify(that.userInfo)); // 更新原始信息
					}
					that.opTipsPopup(res.msg);
				});
			} else {
				// 使用Mock数据
				setTimeout(() => {
					let userInfo = that.getUserInfoFromCache();
					userInfo = {
						...userInfo,
						name: that.userInfo.name,
						intro: that.userInfo.intro,
						avatar: that.userInfo.avatar,
						gender: that.userInfo.gender,
						age: that.userInfo.age,
						// 新增字段
						school: that.userInfo.school,
						hometown: that.userInfo.hometown,
						profession: that.userInfo.profession,
						height: that.userInfo.height,
						weight: that.userInfo.weight,
						birthday: that.userInfo.birthday,
						home_background: that.userInfo.home_background
					};
					uni.setStorageSync('USER_INFO', userInfo);
					that.originalUserInfo = JSON.parse(JSON.stringify(userInfo)); // 更新原始信息
					
					const messages = [
						'个人信息更新成功',
						'昵称修改成功',
						'简介修改成功',
						'头像更新成功',
						'性别设置成功',
						'年龄设置成功'
					];
					that.opTipsPopup(messages[type] || messages[0]);
				}, 300);
			}
		},
		
		// 保存所有修改
		saveAllChanges() {
			const that = this;
			uni.showLoading({
				title: '保存中...',
				mask: true
			});
			
			// 处理背景图片数据，确保以JSON字符串形式提交
			const homeBackground = typeof that.backgroundImages === 'string' 
				? that.backgroundImages 
				: JSON.stringify(that.backgroundImages);
			
			// 准备要提交的所有数据
			const submitData = {
				// 用户基本信息
				avatar: that.userInfo.avatar,
				nickname: that.userInfo.nickname,
				birthday: that.userInfo.birthday,
				
				// 社交信息
				sex: that.userInfo.sex,
				about_me: that.userInfo.about_me,
				school: that.userInfo.school,
				hometown: that.userInfo.hometown,
				occupation: that.userInfo.occupation,
				height: that.userInfo.height,
				weight: that.userInfo.weight,
				home_background: homeBackground,
				constellation: that.userInfo.constellation,
				
				// 位置信息 - 提交residence字段
				residence_lat: that.userInfo.residence_lat || 0,
				residence_lng: that.userInfo.residence_lng || 0,
				residence_name: that.userInfo.residence_name || ""
			};
			
			console.log('提交的用户数据:', JSON.stringify(submitData));
			console.log('包含的位置信息:');
			console.log('- residence_lat:', submitData.residence_lat);
			console.log('- residence_lng:', submitData.residence_lng);
			console.log('- residence_name:', submitData.residence_name);
			
			// 使用单一接口更新所有信息
			updateUserSocialInfo(submitData).then(res => {
				console.log('保存用户信息结果:', JSON.stringify(res));
				
				// 检查是否有标签需要更新
				if (that.selectedTagIds && that.selectedTagIds.length > 0) {
					// 提交标签数据
					return updateUserTags(that.selectedTagIds).then(tagRes => {
						console.log('标签更新结果:', JSON.stringify(tagRes));
						return { userResult: res, tagResult: tagRes };
					}).catch(tagErr => {
						console.error('标签更新失败:', tagErr);
						return { userResult: res, tagError: tagErr };
					});
				} else {
					// 没有标签需要更新
					return { userResult: res };
				}
			}).then(results => {
				uni.hideLoading();
				
				// 检查用户信息更新结果
				if (results.userResult && (results.userResult.code == 200 || results.userResult.status == 200)) {
					// 检查标签更新结果
					if (results.tagResult && (results.tagResult.code != 200 && results.tagResult.status != 200)) {
						that.opTipsPopup('用户信息已保存，但标签更新失败');
					} else if (results.tagError) {
						that.opTipsPopup('用户信息已保存，但标签更新出错');
					} else {
						that.opTipsPopup('所有信息保存成功，位置信息已更新');
					}
					
					// 清空标签ID缓存
					that.selectedTagIds = [];
					
					// 保存成功后，更新originalUserInfo以便与编辑中的数据比较
					that.originalUserInfo = JSON.parse(JSON.stringify(that.userInfo));
					
					// 更新本地存储的用户信息
					let cachedUserInfo = that.getUserInfoFromCache();
					cachedUserInfo = {...cachedUserInfo, ...that.userInfo};
					uni.setStorageSync('USER_INFO', cachedUserInfo);
					
					// 保存成功后，可以尝试刷新IP属地信息
					setTimeout(() => {
						that.refreshIpClick();
					}, 1000);
				} else {
					that.opTipsPopup(results.userResult?.msg || '保存失败，请稍后重试');
				}
			}).catch(err => {
				uni.hideLoading();
				console.error('保存失败:', err);
				that.opTipsPopup('保存失败: ' + (typeof err === 'string' ? err : '网络错误'));
			});
		},
		
		genderPopupClick(isOpen) {
			if (isOpen) {
				this.tempGender = this.userInfo.sex; // 初始化临时选择为当前性别
				this.$refs.genderPopup.open();
			} else {
				this.$refs.genderPopup.close();
			}
		},
		
		// 点击年龄项，临时选择
		ageItemClick(age) {
			this.tempAge = age;
		},
		
		// 确认选择年龄
		confirmAge() {
			if (this.tempAge) {
				this.userInfo.age = this.tempAge;
				this.tempAge = null;
			}
			this.$refs.agePopup.close();
		},
		
		// 年龄选择弹窗
		agePopupClick(isOpen) {
			const that = this;
			if (isOpen) {
				// 先显示加载中
				uni.showLoading({
					title: '加载兴趣标签中...',
					mask: true
				});
				
				// 强制重新加载标签数据
				that.tagCategories = []; // 清空已有数据，强制重新获取
				
				// 使用API获取标签数据
				getTagsWithCategories().then(function(res) {
					console.log('兴趣标签接口原始响应:', JSON.stringify(res));
					
					// 检查响应是否成功
					const isSuccess = res.code == 200 || res.status == 200 || res.msg === 'success';
					
					if (isSuccess && res.data) {
						// 检查数据是否为空数组
						if (Array.isArray(res.data) && res.data.length === 0) {
							uni.hideLoading();
							that.opTipsPopup('暂无标签数据，请联系管理员添加标签');
							return;
						}
						
						// 使用处理方法处理API返回的数据
						that.processTagsData(res)
							.then(() => {
								// 加载完成后初始化已选标签
								that.initializeSelectedTags();
								uni.hideLoading();
								that.$refs.agePopup.open();
							})
							.catch(err => {
								console.error('处理标签数据失败:', err);
								uni.hideLoading();
								that.opTipsPopup('标签数据处理失败: ' + (err.message || '未知错误'));
							});
					} else {
						console.error('加载标签失败:', res.msg || '未知错误');
						uni.hideLoading();
						that.opTipsPopup('标签加载失败: ' + (res.msg || '未知错误'));
					}
				}).catch((err) => {
					console.error('加载兴趣标签错误:', err);
					uni.hideLoading();
					that.opTipsPopup('网络错误，请稍后重试');
				});
			} else {
				that.$refs.agePopup.close();
			}
		},
		
		// 处理标签数据的新方法，可以处理任何格式的响应
		processTagsData(response) {
			const that = this;
			return new Promise((resolve, reject) => {
				try {
					console.log('处理标签数据开始:', JSON.stringify(response));
					
					// 检查响应格式
					if (!response || typeof response !== 'object') {
						console.error('响应数据不是对象');
						reject(new Error('响应数据不是对象'));
						return;
					}
					
					// 获取数据部分
					let data = response.data;
					
					// 确保数据是数组
					if (!data || !Array.isArray(data)) {
						console.error('响应数据格式不正确，data不是数组');
						reject(new Error('响应数据格式不正确，data不是数组'));
						return;
					}
					
					// 检查数组是否为空
					if (data.length === 0) {
						console.error('API返回的标签数据为空数组');
						reject(new Error('API返回的标签数据为空数组'));
						return;
					}
					
					// 初始化标签名到ID的映射
					that.tagNameToIdMap = {};
					
					// 处理分类数据
					that.tagCategories = data.map(category => {
						if (!category || typeof category !== 'object') {
							console.error('分类数据无效:', category);
							return {
								name: '未知分类',
								id: 0,
								tags: [],
								tagsData: []
							};
						}
						
						// 确保标签数组存在
						const categoryTags = Array.isArray(category.tags) ? category.tags : [];
						console.log(`分类[${category.name}]的原始标签数据:`, JSON.stringify(categoryTags));
						
						// 从标签对象中提取名称列表
						const tagNames = categoryTags.map(tag => {
							if (tag && typeof tag === 'object' && tag.name) {
								// 同时更新映射
								if (tag.id) {
									that.tagNameToIdMap[tag.name] = tag.id;
									console.log(`添加API返回的标签映射: ${tag.name} => ${tag.id}`);
								}
								return tag.name;
							}
							console.warn('发现无效标签:', tag);
							return null;
						}).filter(name => name !== null);
						
						console.log(`分类[${category.name}]的标签名称:`, tagNames.join(', ') || '无标签');
						
						return {
							name: category.name || '未命名分类',
							id: category.id || 0,
							tags: tagNames,       // 标签名称数组用于UI显示
							tagsData: categoryTags // 保存原始标签数据包含ID
						};
					});
					
					console.log('API返回的标签分类初步处理结果:', JSON.stringify(that.tagCategories));
					
					// 移除空标签的分类（可选，根据需要决定是否保留空分类）
					const allCategories = [...that.tagCategories]; // 保存完整数据
					that.tagCategories = that.tagCategories.filter(category => 
						category.tags && category.tags.length > 0
					);
					
					console.log('过滤后的标签分类结构:', JSON.stringify(that.tagCategories));
					console.log('API返回的标签ID映射:', that.tagNameToIdMap);
					
					if (that.tagCategories.length === 0) {
						console.warn('所有分类都没有标签，尝试使用原始分类');
						// 如果过滤后没有分类了，使用原始分类
						if (allCategories.length > 0) {
							that.tagCategories = allCategories;
							console.log('使用完整分类(含空标签分类):', JSON.stringify(that.tagCategories));
						} else {
							console.warn('API返回的原始分类也为空');
							reject(new Error('API返回的分类数据无效'));
							return;
						}
					}
					
					// 加载我的标签
					that.loadMyTags();
					console.log('API标签数据处理完成');
					resolve();
				} catch (error) {
					console.error('处理API标签数据时出错:', error);
					reject(error);
				}
			});
		},
		
		// 初始化已选标签
		initializeSelectedTags() {
			// 如果已有年龄标签，初始化为已选中状态
			if (this.userInfo.age) {
				this.selectedTags = this.userInfo.age.split(', ').filter(tag => tag);
				console.log('从用户信息初始化已选标签:', this.selectedTags);
			} else {
				this.selectedTags = [];
			}
		},
		
		// 加载标签分类
		loadTagCategories() {
			const that = this;
			console.log('开始加载兴趣标签分类和列表');
			
			// 返回Promise以便外部等待加载完成
			return new Promise((resolve, reject) => {
				// 使用新的合并接口
				getTagsWithCategories().then(function(res) {
					console.log('兴趣标签接口原始响应:', JSON.stringify(res));
					
					// 检查响应是否成功 - 增加更多成功状态的检查
					const isSuccess = res.code == 200 || res.status == 200 || res.msg === 'success';
					
					if (isSuccess) {
						// 检查数据是否存在
						if (!res.data) {
							console.log('API响应成功但数据为空');
							that.opTipsPopup('标签数据为空');
							resolve([]); // 空数据视为成功但无数据
							return;
						}
						
						// 检查数据是否为空数组
						if (Array.isArray(res.data) && res.data.length === 0) {
							console.log('API返回的标签数据为空数组');
							that.opTipsPopup('暂无标签数据');
							resolve([]); // 空数组视为成功但无数据
							return;
						}
						
						// 使用新的处理方法
						that.processTagsData(res)
							.then(resolve)
							.catch(error => {
								console.error('处理标签数据出错:', error);
								that.opTipsPopup('标签数据格式错误');
								resolve([]); // 数据处理错误视为成功但无有效数据
							});
					} else {
						console.error('加载标签分类和列表失败:', res.msg || '未知错误');
						that.opTipsPopup('标签数据加载失败: ' + (res.msg || '未知错误'));
						reject(new Error(res.msg || '加载标签失败'));
					}
				}).catch((err) => {
					console.error('加载兴趣标签分类和列表错误:', err);
					that.opTipsPopup('网络错误，请稍后重试');
					reject(err);
				});
			});
		},
		
		// 加载标签列表
		loadTagsList() {
			const that = this;
			console.log('开始加载兴趣标签列表');
			
			// 初始化标签名到ID的映射
			that.tagNameToIdMap = {};
			
			// 使用API加载标签列表
			getTagsWithCategories().then(function(res) {
				if (res.code == 200 && res.data) {
					that.processTagsData(res)
						.then(() => {
							uni.hideLoading();
							console.log('标签列表加载完成');
						})
						.catch(err => {
							console.error('标签数据处理错误:', err);
							uni.hideLoading();
							that.opTipsPopup('标签数据处理错误');
						});
				} else {
					console.error('获取标签列表失败:', res.msg);
					uni.hideLoading();
					that.opTipsPopup('获取标签失败: ' + (res.msg || '未知错误'));
				}
			}).catch(err => {
				console.error('获取标签列表请求错误:', err);
				uni.hideLoading();
				that.opTipsPopup('网络错误，请稍后重试');
			});
		},
		
		// 加载我的标签
		async loadMyTags() {
			try {
				const res = await getMyTags();
				console.log('获取我的标签返回数据:', JSON.stringify(res));
				
				if (res.status === 200 && res.data) {
					// 处理标签数据
					this.myTags = res.data;
					// 更新选中的标签
					this.selectedTags = res.data.map(tag => tag.name);
					this.selectedNewTags = [...this.selectedTags];
					
					// 更新userInfo中的标签
					this.userInfo.interest_tags = this.selectedTags;
					
					return res.data;
				}
				return [];
			} catch (error) {
				console.error('加载我的标签失败:', error);
				return [];
			}
		},
		
		// 根据星座值获取星座名称
		getConstellationName(value) {
			const constellations = [
				'水瓶座', '双鱼座', '白羊座', '金牛座', 
				'双子座', '巨蟹座', '狮子座', '处女座', 
				'天秤座', '天蝎座', '射手座', '摩羯座'
			];
			
			if (value !== null && value >= 0 && value < constellations.length) {
				return constellations[value];
			}
			return '未知';
		},
		
		// 表单提交
		formSubmit(e) {
			let that = this;
			let value = e.detail.value;
			
			if (!value.nickname) {
				return that.opTipsPopup('请输入昵称');
			}
			
			// 更新用户信息
			that.userInfo.nickname = value.nickname;
			
			// 保存全部修改
			that.saveAllChanges();
		},
		
		/**
		 * 创建默认的标签数据并返回，但不设置到tagCategories
		 * @param {Boolean} returnOnly - 是否仅返回数据而不设置到全局
		 * @return {Array} 默认标签数据数组
		 */
		// 已删除createDefaultTagData方法

		/**
		 * 创建默认的标签数据
		 * 当接口加载失败时使用此方法
		 */
		// 已删除createDefaultTagsData方法
		
		// 生日相关方法
		birthdayPopupClick(isOpen) {
			const that = this;
			if (isOpen) {
				// 初始化生日选择器
				that.initBirthdayPicker();
				that.$refs.birthdayPopup.open();
			} else {
				that.$refs.birthdayPopup.close();
			}
		},
		
		// 初始化生日选择器
		initBirthdayPicker() {
			// 如果用户已有生日，根据已有生日设置选择器
			if (this.userInfo.birthday) {
				try {
					let year, month, day;
					
					// 检查是否为时间戳格式
					if (typeof this.userInfo.birthday === 'number' || 
						(typeof this.userInfo.birthday === 'string' && !isNaN(this.userInfo.birthday) && !this.userInfo.birthday.includes('-'))) {
						// 将时间戳转换为日期对象（假设是秒级时间戳）
						const timestamp = parseInt(this.userInfo.birthday);
						const date = new Date(timestamp * 1000);
						
						year = date.getFullYear();
						month = date.getMonth() + 1; // 月份从0开始，需要加1
						day = date.getDate();
					} else {
						// 解析日期字符串 "YYYY-MM-DD"
						const parts = this.userInfo.birthday.split('-');
						if (parts.length !== 3) return;
						
						year = parseInt(parts[0]);
						month = parseInt(parts[1]);
						day = parseInt(parts[2]);
					}
					
					// 找到对应的索引
					const yearIndex = this.years.findIndex(y => y === year);
					const monthIndex = this.months.findIndex(m => m === month);
					const dayIndex = this.days.findIndex(d => d === day);
					
					// 更新选择器值
					if (yearIndex !== -1 && monthIndex !== -1 && dayIndex !== -1) {
						this.birthdayPickerValue = [yearIndex, monthIndex, dayIndex];
						console.log('初始化生日选择器:', this.birthdayPickerValue, `(${year}-${month}-${day})`);
					}
				} catch (e) {
					console.error('初始化生日选择器出错:', e);
				}
			}
		},
		
		birthdayPickerChange(e) {
			this.birthdayPickerValue = e.detail.value;
		},
		
		// 从生日字符串计算星座
		calculateConstellationFromBirthday() {
			if (!this.userInfo.birthday) return;
			
			try {
				let month, day;
				
				// 检查是否为时间戳格式
				if (typeof this.userInfo.birthday === 'number' || 
					(typeof this.userInfo.birthday === 'string' && !isNaN(this.userInfo.birthday) && !this.userInfo.birthday.includes('-'))) {
					// 将时间戳转换为日期对象（假设是秒级时间戳）
					const timestamp = parseInt(this.userInfo.birthday);
					const date = new Date(timestamp * 1000);
					
					month = date.getMonth() + 1; // 月份从0开始，需要加1
					day = date.getDate();
					
					console.log(`从时间戳 ${this.userInfo.birthday} 解析出生日: ${month}月${day}日`);
				} else {
					// 解析日期字符串 "YYYY-MM-DD"
					const parts = this.userInfo.birthday.split('-');
					if (parts.length !== 3) return;
					
					month = parseInt(parts[1], 10);
					day = parseInt(parts[2], 10);
				}
				
				// 计算星座
				const constellation = this.calculateConstellation(month, day);
				this.userInfo.constellation = constellation.value;
				
				console.log('从生日计算星座:', constellation.name, '(值:', constellation.value, ')');
				
				// 如果星座不存在，或与生日不匹配，更新到服务器
				if (this.originalUserInfo.constellation === null || 
					this.originalUserInfo.constellation !== constellation.value) {
					
					console.log('更新星座信息到服务器');
					
					// 准备提交的数据
					const submitData = {
						constellation: constellation.value
					};
					
					// 调用更新接口
					updateUserSocialInfo(submitData).then(res => {
						console.log('星座更新结果:', JSON.stringify(res));
					}).catch(err => {
						console.error('星座更新错误:', err);
					});
				}
			} catch (e) {
				console.error('计算星座时出错:', e);
			}
		},
		
		// 计算星座
		calculateConstellation(month, day) {
			// 星座日期边界
			const constellationDates = [
				{ name: '水瓶座', start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
				{ name: '双鱼座', start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
				{ name: '白羊座', start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
				{ name: '金牛座', start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
				{ name: '双子座', start: { month: 5, day: 21 }, end: { month: 6, day: 21 } },
				{ name: '巨蟹座', start: { month: 6, day: 22 }, end: { month: 7, day: 22 } },
				{ name: '狮子座', start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
				{ name: '处女座', start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
				{ name: '天秤座', start: { month: 9, day: 23 }, end: { month: 10, day: 23 } },
				{ name: '天蝎座', start: { month: 10, day: 24 }, end: { month: 11, day: 22 } },
				{ name: '射手座', start: { month: 11, day: 23 }, end: { month: 12, day: 21 } },
				{ name: '摩羯座', start: { month: 12, day: 22 }, end: { month: 1, day: 19 } }
			];
			
			// 循环判断日期所属星座
			for (let i = 0; i < constellationDates.length; i++) {
				const constellation = constellationDates[i];
				
				// 特殊处理摩羯座（跨年）
				if (i === 11) {
					if ((month === 12 && day >= constellation.start.day) || 
						(month === 1 && day <= constellation.end.day)) {
						return { name: constellation.name, value: i };
					}
				} 
				// 处理其他星座
				else if ((month === constellation.start.month && day >= constellation.start.day) || 
						(month === constellation.end.month && day <= constellation.end.day)) {
					return { name: constellation.name, value: i };
				}
			}
			
			// 默认返回水瓶座（异常情况）
			return { name: '水瓶座', value: 0 };
		},
		
		// 确认生日选择
		confirmBirthday() {
			const that = this;
			const year = this.years[this.birthdayPickerValue[0]];
			const month = this.months[this.birthdayPickerValue[1]];
			const day = this.days[this.birthdayPickerValue[2]];
			
			// 创建日期对象
			const birthdayDate = new Date(year, month - 1, day); // 月份需要减1
			
			// 转换为时间戳（秒级）
			const birthdayTimestamp = Math.floor(birthdayDate.getTime() / 1000);
			
			// 格式化为YYYY-MM-DD用于显示
			const formattedBirthday = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
			
			// 计算星座并更新
			const constellation = this.calculateConstellation(month, day);
			
			// 更新本地用户信息（保存时间戳格式）
			that.userInfo.birthday = birthdayTimestamp;
			that.userInfo.constellation = constellation.value;
			
			
			// 关闭弹窗
			this.$refs.birthdayPopup.close();
		},
		
		// 绑定手机号
		bindMobileClick(e) {
			let that = this;
			if (e.detail.errMsg == 'getPhoneNumber:ok') {
				uni.showLoading({
					title: that.userInfo.phone ? '换绑授权中...' : '绑定授权中...',
					mask: true
				});
				
				// 使用实际的绑定手机号API
				that.$util.userBindingPhone(e.detail).then(res => {
					uni.hideLoading();
					if (res.code == 200) {
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
			}
		},
		
		// 刷新IP属地
		refreshIpClick() {
			let that = this;
			uni.showLoading({
				title: '刷新中...',
				mask: true
			});
			
			// 先尝试重新获取位置信息
			const cachedLatitude = uni.getStorageSync('residence_lat');
			const cachedLongitude = uni.getStorageSync('residence_lng');
			
			if (cachedLatitude && cachedLongitude) {
				// 如果有缓存的位置，重新进行逆地理编码
				that.getAddressFromLocation(parseFloat(cachedLatitude), parseFloat(cachedLongitude));
				uni.hideLoading();
				return;
			}
			
			// 如果没有位置缓存，先获取位置再刷新
			that.getUserLocation();
			
			// 同时调用后端接口刷新IP属地
			getUserSocialInfo().then(function(res) {
				uni.hideLoading();
				if (res.code == 200) {
					// 更新用户信息
					const userData = res.data;
					uni.setStorageSync('USER_INFO', userData);
					
					// 如果后端返回了位置信息，使用后端的
					if (userData.residence_name) {
						that.userInfo.residence_name = userData.residence_name;
						that.userInfo.province = userData.residence_name;
					}
					if (userData.province && !userData.residence_name) {
						that.userInfo.province = userData.province;
					}
					
					that.originalUserInfo = JSON.parse(JSON.stringify(userData));
					that.opTipsPopup('IP属地刷新成功');
				} else {
					that.opTipsPopup(res.msg || 'IP属地刷新失败');
				}
			}).catch(err => {
				uni.hideLoading();
				that.opTipsPopup('刷新失败: ' + (typeof err === 'string' ? err : '网络错误'));
			});
		},
		
		// 获取实名认证状态文本
		getAuthStatusText() {
			switch (this.userInfo.auth_status) {
				case 0: return '未认证';
				case 1: return '审核中';
				case 2: return '已认证';
				case 3: return '认证失败';
				default: return '未认证';
			}
		},
		
		// 跳转到实名认证页面
		goToRealAuth() {
			uni.navigateTo({
				url: '/pages/setting/realname'
			});
		},
		
		// 显示提示弹窗
		opTipsPopup(msg, duration = 2000) {
			let that = this;
			that.tipsTitle = msg;
			that.$refs.tipsPopup.open();
			setTimeout(function() {
				that.$refs.tipsPopup.close();
			}, duration);
		},
		
		// 点击性别项，临时选择
		genderItemClick(gender) {
			this.tempGender = gender;
		},
		
		// 确认选择性别
		confirmGender() {
			if (this.tempGender !== null) {
				// 只更新本地状态，不提交到服务器
				this.userInfo.sex = this.tempGender;
				this.opTipsPopup('性别选择已更新，点击保存按钮生效');
			}
			this.$refs.genderPopup.close();
		},
		
		// 切换标签
		toggleTag(tag) {
			console.log('切换标签:', tag);
			console.log('当前已选择标签:', JSON.stringify(this.selectedTags));
			
			if (!tag) {
				console.error('无效的标签名称');
				this.opTipsPopup('标签无效');
				return;
			}
			
			// 检查标签是否存在于映射中
			const tagId = this.getTagIdByName(tag);
			console.log('标签ID:', tagId);
			
			if (this.selectedTags.includes(tag)) {
				this.selectedTags = this.selectedTags.filter(t => t !== tag);
				console.log('取消选择后的标签:', JSON.stringify(this.selectedTags));
				this.opTipsPopup(`已取消选择 ${tag}`);
			} else if (this.selectedTags.length < 5) {
				this.selectedTags.push(tag);
				console.log('选择后的标签:', JSON.stringify(this.selectedTags));
				this.opTipsPopup(`已选择 ${tag}`);
			} else {
				this.opTipsPopup('最多只能选择5个兴趣标签');
			}
		},
		
		// 切换标签分类
		switchCategory(index) {
			this.currentCategoryIndex = index;
		},
		
		// 滑动切换分类
		swiperChange(e) {
			this.currentCategoryIndex = e.detail.current;
		},
		
		// 确认选择标签
		confirmTags() {
			const that = this;
			if (that.selectedTags.length > 5) {
				that.opTipsPopup('最多只能选择5个兴趣标签');
				return;
			}
			
			// 保存标签到用户信息
			that.userInfo.age = that.selectedTags.join(', ');
			
			// 获取标签ID列表
			const tagIds = [];
			const tagNames = [];
			
			// 尝试从选择的标签名称获取ID
			for (const tagName of that.selectedTags) {
				const tagId = that.getTagIdByName(tagName);
				if (tagId) {
					tagIds.push(tagId);
					tagNames.push(tagName);
					console.log(`成功添加标签 "${tagName}" 的ID: ${tagId}`);
				} else {
					console.warn(`无法找到标签 "${tagName}" 的ID`);
				}
			}
			
			console.log('选中的标签:', tagNames);
			console.log('标签ID列表:', tagIds);
			
			if (tagIds.length === 0 && that.selectedTags.length > 0) {
				console.error('无法获取任何标签ID，可能是数据结构问题');
				that.opTipsPopup('标签数据异常，请稍后重试');
				return;
			}
			
			// 调用更新标签接口
			uni.showLoading({
				title: '保存兴趣标签中...',
				mask: true
			});
			
			updateUserTags(tagIds).then(function(res) {
					uni.hideLoading();
				if (res.code == 200) {
					// 显示保存成功提示
					that.opTipsPopup('兴趣标签更新成功', 3000);
					
					// 刷新用户信息
					getUserSocialInfo().then(function(result) {
						if (result.code == 200) {
							console.log('刷新用户信息成功:', result.data);
							uni.setStorageSync('USER_INFO', result.data);
							that.userInfo = result.data;
							that.originalUserInfo = JSON.parse(JSON.stringify(result.data));
							that.handleBackgroundImages();
						}
					});
				} else {
					console.error('标签更新失败:', res);
					that.opTipsPopup('标签更新失败: ' + (res.msg || ''));
				}
			}).catch((err) => {
				uni.hideLoading();
				console.error('标签更新错误:', err);
				that.opTipsPopup('标签更新失败: 网络错误');
			});
			
			that.$refs.agePopup.close();
		},
		
		// 根据标签名获取标签ID
		getTagIdByName(tagName) {
			if (!tagName) {
				console.error('标签名为空');
				return null;
			}
			
			console.log('查找标签ID，标签名:', tagName);
			
			// 先从映射中查找
			if (this.tagNameToIdMap && this.tagNameToIdMap[tagName]) {
				console.log('从映射中找到ID:', this.tagNameToIdMap[tagName]);
				return this.tagNameToIdMap[tagName];
			}
			
			// 如果映射中没有，遍历所有分类查找
			for (const category of this.tagCategories) {
				if (category.tagsData && Array.isArray(category.tagsData)) {
					for (const tag of category.tagsData) {
						if (tag && tag.name === tagName) {
							// 找到了标签，更新映射并返回ID
							this.tagNameToIdMap[tagName] = tag.id;
							console.log('在分类中找到ID:', tag.id);
							return tag.id;
						}
					}
				}
			}
			
			// 如果找不到匹配的标签ID，打印警告并返回null
			console.warn(`未找到标签 "${tagName}" 的ID`);
			return null;
		},
		
		previewImage(url) {
			// 实现图片预览功能
			if (!url) return;
			
			uni.previewImage({
				urls: [url],
				current: url
			});
		},
		
		// 显示照片长按菜单
		showPhotoMenu(photo, index) {
			// 实现照片长按菜单功能
			if (!photo) return;
			
			// 确定是否为头像
			const isAvatar = index === -1 || photo.type === '头像';
			const menuItems = isAvatar ? ['查看大图', '更换头像'] : ['查看大图', '删除', '设为头像'];
			
			uni.showActionSheet({
				itemList: menuItems,
				success: (res) => {
					if (isAvatar) {
						switch(res.tapIndex) {
							case 0: // 查看大图
								this.previewImage(photo.url);
								break;
							case 1: // 更换头像
								this.changeProfilePhoto();
								break;
						}
					} else {
						switch(res.tapIndex) {
							case 0: // 查看大图
								this.previewImage(photo.url);
								break;
							case 1: // 删除
								uni.showModal({
									title: '确认删除',
									content: '确定要删除这张照片吗？',
									success: (res) => {
										if (res.confirm) {
											this.backgroundImages.splice(index, 1);
											this.opTipsPopup('照片已删除');
										}
									}
								});
								break;
							case 2: // 设为头像
								uni.showModal({
									title: '设为头像',
									content: '确定要将此照片设为头像吗？',
									success: (res) => {
										if (res.confirm) {
											// 保存原头像URL
											const oldAvatar = this.userInfo.avatar;
											
											// 将当前照片设为头像
											this.userInfo.avatar = photo.url;
											
											// 如果原头像存在且不是默认头像，将其添加到照片列表中
											if (oldAvatar && !oldAvatar.includes('/static/img/avatar.png')) {
												// 将原头像添加为当前照片类型
												this.backgroundImages[index].url = oldAvatar;
											}
											
											this.opTipsPopup('已设为头像，点击保存按钮生效');
										}
									}
								});
								break;
						}
					}
				}
			});
		},
		
		// 拖动相关变量
		dragStart(e) {
			// 记录开始拖动的元素索引
			this.dragStartIndex = parseInt(e.currentTarget.dataset.index);
			this.isDragging = true;
			
			// 记录触摸的起始位置
			this.startX = e.touches[0].clientX;
			this.startY = e.touches[0].clientY;
		},
		
		dragMove(e) {
			if (!this.isDragging) return;
			
			// 计算移动距离
			const moveX = e.touches[0].clientX - this.startX;
			const moveY = e.touches[0].clientY - this.startY;
			
			// 如果移动距离太小，不处理
			if (Math.abs(moveX) < 10 && Math.abs(moveY) < 10) return;
			
			// 防止长按菜单弹出
			this.isDragging = true;
			
			// 获取当前触摸位置下的元素
			const touch = e.touches[0];
			const element = document.elementFromPoint(touch.clientX, touch.clientY);
			
			if (element) {
				// 查找最近的photo-item元素
				let photoItem = element.closest('.photo-item');
				if (photoItem && photoItem.dataset && photoItem.dataset.index !== undefined) {
					const targetIndex = parseInt(photoItem.dataset.index);
					
					// 如果拖到了不同的位置，进行交换
					if (targetIndex !== this.dragStartIndex && targetIndex >= 0 && targetIndex < this.backgroundImages.length) {
						// 保存临时变量
						const temp = this.backgroundImages[this.dragStartIndex];
						
						// 从数组中移除拖动项
						this.backgroundImages.splice(this.dragStartIndex, 1);
						
						// 在目标位置插入
						this.backgroundImages.splice(targetIndex, 0, temp);
						
						// 更新开始拖动的索引为新位置
						this.dragStartIndex = targetIndex;
					}
				}
			}
		},
		
		dragEnd(e) {
			this.isDragging = false;
		},
		
		newTagsPopupClick(isOpen) {
			if (isOpen) {
				// 显示加载中
				uni.showLoading({
					title: '加载标签中...',
					mask: true
				});
				
				// 先加载所有标签数据
				getTagsWithCategories().then(res => {
					console.log('获取标签数据响应:', JSON.stringify(res));
					
					// 检查响应是否成功
					const isSuccess = res.code == 200 || res.status == 200 || res.msg === 'success';
					
					if (isSuccess && res.data) {
						// 检查数据是否为空数组
						if (Array.isArray(res.data) && res.data.length === 0) {
							uni.hideLoading();
							this.opTipsPopup('暂无标签数据，请联系管理员添加标签');
							return;
						}
						
						console.log('处理从API获取的标签数据');
						// 处理API返回的标签数据
						try {
							if (Array.isArray(res.data)) {
								this.processNewTagsData(res.data);
							} else if (typeof res.data === 'object') {
								const dataArray = res.data.list || res.data.data || Object.values(res.data);
								if (Array.isArray(dataArray) && dataArray.length > 0) {
									this.processNewTagsData(dataArray);
								} else {
									console.error('无法从对象中提取标签数组');
									uni.hideLoading();
									this.opTipsPopup('标签数据格式错误');
									return;
								}
							} else {
								console.error('未知的数据格式:', typeof res.data);
								uni.hideLoading();
								this.opTipsPopup('标签数据格式不支持');
								return;
							}
						} catch (err) {
							console.error('处理标签数据时出错:', err);
							uni.hideLoading();
							this.opTipsPopup('标签数据处理失败');
							return;
						}
						
						// 加载我的标签，然后初始化并显示弹窗
						this.loadMyTagsOnly()
							.catch(err => {
								console.error('加载我的标签失败，但继续使用已加载的标签:', err);
							})
							.finally(() => {
								this.initializeNewSelectedTags();
								uni.hideLoading();
								this.$refs.newTagsPopup.open();
							});
					} else {
						console.error('获取标签数据失败，状态码:', res.code || res.status);
						uni.hideLoading();
						this.opTipsPopup('标签数据获取失败: ' + (res.msg || '未知错误'));
					}
				}).catch(err => {
					console.error('获取标签数据请求错误:', err);
					uni.hideLoading();
					this.opTipsPopup('网络错误，请稍后重试');
				});
			} else {
				this.$refs.newTagsPopup.close();
			}
		},
		
		// 处理新标签数据
		processNewTagsData(data) {
			console.log('开始处理标签数据:', typeof data === 'object' ? (Array.isArray(data) ? '数组格式' : '对象格式') : typeof data);
			
			if (!Array.isArray(data)) {
				console.error(`标签数据不是数组格式`);
				// 如果不是数组，尝试将其转换为数组
				if (data && typeof data === 'object') {
					// 尝试提取数组数据
					data = data.list || data.data || Object.values(data);
					if (!Array.isArray(data)) {
						console.error(`无法将数据转换为数组`);
						return;
					}
				} else {
					console.error(`数据格式无效，无法处理`);
					return;
				}
			}
			
			console.log(`处理API数据数组，长度:`, data.length);
			
			// 重置或初始化标签分类数组
			this.newTagCategories = [];
			
			// 处理标签分类和标签
			this.newTagCategories = data.map(category => {
				// 如果是简单的标签对象，创建一个默认分类
				if (category && category.name && category.id && !category.tags) {
					return {
						id: 0,
						name: '标签',
						tags: [category.name],
						originalTags: [category]
					};
				}
				
				// 确保标签数组存在
				let tags = [];
				if (Array.isArray(category.tags)) {
					tags = category.tags;
				} else if (category.tag_list && Array.isArray(category.tag_list)) {
					tags = category.tag_list;
				} else if (category.tagList && Array.isArray(category.tagList)) {
					tags = category.tagList;
				}
				
				console.log(`API分类[${category.name}]的标签数量:`, tags.length);
				
				// 从标签对象中提取名称列表
				const tagNames = tags.map(tag => {
					if (typeof tag === 'string') {
						return tag;
					} else if (tag && tag.name) {
						return tag.name;
					}
					return null;
				}).filter(name => name !== null);
				
				return {
					id: category.id || 0,
					name: category.name || '未命名分类',
					tags: tagNames,
					originalTags: tags
				};
			});
			
			// 过滤掉没有标签的分类
			this.newTagCategories = this.newTagCategories.filter(category => 
				category.tags && category.tags.length > 0
			);
			
			console.log(`处理后的API标签分类数量:`, this.newTagCategories.length);
			if (this.newTagCategories.length === 0) {
				console.error(`没有有效的API标签分类`);
				return;
			}
			
			// 初始化已选标签
			this.initializeNewSelectedTags();
			
			console.log(`API标签处理完成`);
		},
		
		// 初始化已选标签
		initializeNewSelectedTags() {
			const that = this;
			
			console.log('初始化已选标签开始...');
			console.log('现有标签ID:', that.selectedTagIds);
			console.log('现有已选标签名称:', that.selectedNewTags);
			
			// 如果有标签ID，根据ID查找对应的标签名称
			if (that.selectedTagIds && that.selectedTagIds.length > 0) {
				console.log('根据标签ID初始化选中状态:', that.selectedTagIds);
				
				// 清空已选标签名称
				that.selectedNewTags = [];
				
				// 遍历所有分类，查找匹配ID的标签
				that.newTagCategories.forEach(category => {
					if (category.originalTags && Array.isArray(category.originalTags)) {
						category.originalTags.forEach(tag => {
							// 检查标签是否有ID字段
							const tagId = tag.id || tag.tag_id;
							if (tagId && that.selectedTagIds.includes(tagId)) {
								if (tag.name) {
									that.selectedNewTags.push(tag.name);
									console.log(`找到标签: ${tag.name}, ID: ${tagId}`);
								}
							}
						});
					}
				});
				
				console.log('根据ID找到的标签名称:', that.selectedNewTags);
				
				// 如果通过ID没有找到标签名称，尝试使用之前保存的名称
				if (that.selectedNewTags.length === 0 && that.userInfo.age) {
					console.log('通过ID没有找到标签，尝试从userInfo.age获取');
					that.selectedNewTags = that.userInfo.age.split(', ').filter(tag => tag);
					console.log('从userInfo.age获取的标签:', that.selectedNewTags);
				}
				
				// 更新userInfo.age字段
				if (that.selectedNewTags.length > 0) {
					that.userInfo.age = that.selectedNewTags.join(', ');
				}
			}
			// 如果没有标签ID但有age字段，尝试从age中解析
			else if (that.userInfo.age) {
				console.log('从userInfo.age初始化标签');
				that.selectedNewTags = that.userInfo.age.split(', ').filter(tag => tag);
				console.log('从用户信息字符串初始化标签:', that.selectedNewTags);
				
				// 尝试根据标签名称查找对应的ID
				that.selectedTagIds = [];
				that.selectedNewTags.forEach(tagName => {
					const tagId = that.getNewTagIdByName(tagName);
					if (tagId) {
						that.selectedTagIds.push(tagId);
						console.log(`找到标签"${tagName}"的ID: ${tagId}`);
					} else {
						console.log(`未找到标签"${tagName}"的ID`);
					}
				});
				
				console.log('根据名称找到的标签ID:', that.selectedTagIds);
			} 
			else {
				console.log('没有已选标签信息');
				that.selectedNewTags = [];
				that.selectedTagIds = [];
			}
			
			console.log('初始化已选标签完成, 标签数量:', that.selectedNewTags.length);
		},
		
		switchNewCategory(index) {
			this.newCategoryIndex = index;
		},
		
		toggleNewTag(tag) {
			console.log('切换标签:', tag);
			console.log('当前已选择标签:', JSON.stringify(this.selectedNewTags));
			
			if (!tag) {
				console.error('无效的标签名称');
				this.opTipsPopup('标签无效');
				return;
			}
			
			// 检查标签是否存在于标签库中
			const tagId = this.getNewTagIdByName(tag);
			
			if (tagId) {
				console.log('找到标签ID:', tagId);
				
				if (this.selectedNewTags.includes(tag)) {
					// 取消选择标签
					this.selectedNewTags = this.selectedNewTags.filter(t => t !== tag);
					
					// 同时从标签ID数组中移除
					this.selectedTagIds = this.selectedTagIds.filter(id => id !== tagId);
					
					console.log('取消选择后的标签:', JSON.stringify(this.selectedNewTags));
					console.log('取消选择后的标签ID:', JSON.stringify(this.selectedTagIds));
					this.opTipsPopup(`已取消选择 ${tag}`);
				} else if (this.selectedNewTags.length < 5) {
					// 选择标签
					this.selectedNewTags.push(tag);
					
					// 同时添加到标签ID数组
					this.selectedTagIds.push(tagId);
					
					console.log('选择后的标签:', JSON.stringify(this.selectedNewTags));
					console.log('选择后的标签ID:', JSON.stringify(this.selectedTagIds));
					this.opTipsPopup(`已选择 ${tag}`);
				} else {
					this.opTipsPopup('最多只能选择5个兴趣标签');
				}
			} else {
				console.error('标签在系统中不存在:', tag);
				this.opTipsPopup('该标签不存在或已被删除');
			}
		},
		
		confirmNewTags() {
			const that = this;
			if (that.selectedNewTags.length > 5) {
				that.opTipsPopup('最多只能选择5个兴趣标签');
				return;
			}
			
			// 显示加载中
			uni.showLoading({
				title: '保存中...',
				mask: true
			});
			
			// 获取选中标签的ID列表
			const tagIds = that.selectedNewTags.map(tagName => {
				for (const category of that.newTagCategories) {
					if (category.originalTags) {
						const tagObj = category.originalTags.find(t => t.name === tagName);
						if (tagObj) return tagObj.id;
					}
				}
				return null;
			}).filter(id => id !== null);
			
			// 保存标签
			updateUserTags(tagIds).then(res => {
				if (res.code === 200) {
					// 更新本地数据
					that.userInfo.interest_tags = [...that.selectedNewTags];
					
					// 更新本地存储
					const cachedUserInfo = uni.getStorageSync('USER_INFO');
					if (cachedUserInfo) {
						cachedUserInfo.interest_tags = [...that.selectedNewTags];
						uni.setStorageSync('USER_INFO', cachedUserInfo);
					}
					
					// 发送事件通知列表页面更新
					uni.$emit('updateUserTags', {
						tags: that.selectedNewTags,
						userId: that.userInfo.id
					});
					
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
			
			// 关闭弹窗
			that.$refs.newTagsPopup.close();
				} else {
					throw new Error(res.msg || '保存失败');
				}
			}).catch(err => {
				console.error('更新标签失败:', err);
				uni.showToast({
					title: err.message || '保存失败，请重试',
					icon: 'none'
				});
			}).finally(() => {
				uni.hideLoading();
			});
		},
		
		// 获取新标签的ID
		getNewTagIdByName(tagName) {
			if (!tagName) {
				console.error('标签名为空');
				return null;
			}
			
			console.log('查找新标签ID，标签名:', tagName);
			
			// 遍历所有分类查找
			for (const category of this.newTagCategories) {
				if (category.originalTags && Array.isArray(category.originalTags)) {
					// 在原始标签数组中查找
					for (const tag of category.originalTags) {
						if (tag && tag.name === tagName) {
							console.log('在新分类中找到ID:', tag.id);
							return tag.id;
						}
					}
				}
			}
			
			// 如果找不到匹配的标签ID，返回null
			console.warn(`未找到新标签 "${tagName}" 的ID`);
			return null;
		},
		
		newSwiperChange(e) {
			this.newCategoryIndex = e.detail.current;
		},
		
		// 获取用户信息
		getUserInfo() {
			const that = this;
			
			return new Promise((resolve, reject) => {
				getUserSocialInfo().then(function(res) {
					if (res.code == 200 || res.status == 200) {
						console.log('刷新用户信息成功:', JSON.stringify(res.data));
						const userData = res.data || res.result;
						if (userData) {
							uni.setStorageSync('USER_INFO', userData);
							that.userInfo = userData;
							that.originalUserInfo = JSON.parse(JSON.stringify(userData));
							
							// 如果有生日但没有星座，计算星座
							if (that.userInfo.birthday && that.userInfo.constellation === null) {
								that.calculateConstellationFromBirthday();
							}
							
							// 处理背景图片
							that.handleBackgroundImages();
							
							resolve(userData);
						}
					} else {
						console.error('获取用户信息失败:', res.msg || '未知错误');
						reject(new Error(res.msg || '获取用户信息失败'));
					}
				}).catch(err => {
					console.error('获取用户信息错误:', err);
					reject(err);
				});
			});
		},
		
		// 不覆盖当前正在编辑的内容的刷新方法
		refreshUserInfoWithoutOverwrite() {
			const that = this;
			
			// 保存当前正在编辑的头像
			const currentAvatar = that.userInfo.avatar;
			
			// 获取用户信息
			getUserSocialInfo().then(function(res) {
				if (res.code == 200 || res.status == 200) {
					console.log('刷新用户信息成功:', JSON.stringify(res.data));
					const userData = res.data || res.result;
					if (userData) {
						// 保留当前正在编辑的头像
						userData.avatar = currentAvatar;
						
						// 更新存储和视图
						uni.setStorageSync('USER_INFO', userData);
						
						// 合并数据，保留当前编辑的内容
						that.userInfo = {
							...userData,
							avatar: currentAvatar // 确保头像不被覆盖
						};
						
						// 处理背景图片
						that.handleBackgroundImages();
					}
				}
			}).catch(err => {
				console.error('刷新用户信息失败:', err);
			});
		},
		
		// 仅加载我的标签数据，不更新用户信息
		loadMyTagsOnly() {
			const that = this;
			
			console.log('开始加载我的标签数据...');
			
			// 返回Promise以便外部等待加载完成
			return new Promise((resolve, reject) => {
				// 使用getMyTags接口获取我的标签
				getMyTags().then(function(res) {
					console.log('获取我的标签响应:', JSON.stringify(res));
					
					if (!res || typeof res !== 'object') {
						console.error('响应不是一个有效对象');
						reject(new Error('响应格式无效'));
						return;
					}
					
					if (res.code == 200 || res.status == 200) {
						// 提取标签数据
						let tagData = res.data || res.result;
						
						// 检查标签数据格式
						if (tagData) {
							// 如果不是数组但是对象，尝试提取数组
							if (!Array.isArray(tagData) && typeof tagData === 'object') {
								tagData = tagData.list || tagData.data || Object.values(tagData);
							}
							
							// 确保是数组
							if (Array.isArray(tagData) && tagData.length > 0) {
								console.log('成功获取我的标签，数量:', tagData.length);
								
								// 保存标签ID
								that.selectedTagIds = tagData.map(tag => {
									if (typeof tag === 'object' && tag.id) {
										return tag.id;
									} else if (typeof tag === 'number') {
										return tag;
									}
									return null;
								}).filter(id => id !== null);
								
								console.log('保存已选标签ID:', that.selectedTagIds);
								
								// 从API返回的数据中提取标签名称
								const tagNames = tagData.map(tag => {
									if (typeof tag === 'string') {
										return tag;
									} else if (tag && tag.name) {
										return tag.name;
									}
									return null;
								}).filter(name => name !== null);
								
								that.selectedNewTags = tagNames;
								
								console.log('从API获取的已选标签:', tagNames);
								resolve(tagData);
							} else {
								console.log('API返回的标签数据为空或格式不是数组');
								that.selectedNewTags = [];
								that.selectedTagIds = [];
								resolve([]);
							}
						} else {
							console.log('API返回的标签数据为空');
							that.selectedNewTags = [];
							that.selectedTagIds = [];
							resolve([]);
						}
					} else {
						console.error('加载我的标签失败:', res.msg || '未知错误');
						reject(new Error(res.msg || '加载标签失败'));
					}
				}).catch((err) => {
					console.error('加载我的标签请求错误:', err);
					reject(err);
				});
			});
		},
		// 加载新标签数据
		loadNewTagsData() {
			const that = this;
			console.log('开始加载新标签数据');
			
			// 返回Promise以便外部等待加载完成
			return new Promise((resolve, reject) => {
				// 使用API获取标签数据
				getTagsWithCategories().then(function(res) {
					console.log('标签数据接口原始响应:', JSON.stringify(res));
					
					// 检查响应是否成功
					const isSuccess = res.code == 200 || res.status == 200 || res.msg === 'success';
					
					if (isSuccess) {
						// 检查数据是否存在
						if (!res.data) {
							console.log('API响应成功但数据为空');
							that.opTipsPopup('标签数据为空');
							resolve([]); // 空数据视为成功但无数据
							return;
						}
						
						// 检查数据是否为空数组
						if (Array.isArray(res.data) && res.data.length === 0) {
							console.log('API返回的标签数据为空数组');
							that.opTipsPopup('暂无标签数据');
							resolve([]); // 空数组视为成功但无数据
							return;
						}
						
						try {
							// 处理API返回的标签数据
							if (Array.isArray(res.data)) {
								that.processNewTagsData(res.data);
								resolve(res.data);
							} else {
								console.log('标签数据格式不是数组，尝试处理对象格式');
								that.processNewTagsData(res.data);
								resolve(res.data);
							}
						} catch (err) {
							console.error('处理新标签数据时出错:', err);
							that.opTipsPopup('标签数据处理失败');
							resolve([]); // 处理错误视为成功但无有效数据
						}
					} else {
						console.error('加载新标签数据失败:', res.msg || '未知错误');
						that.opTipsPopup('标签数据加载失败: ' + (res.msg || '未知错误'));
						reject(new Error(res.msg || '加载标签失败'));
					}
				}).catch((err) => {
					console.error('加载新标签数据请求错误:', err);
					that.opTipsPopup('网络错误，请稍后重试');
					reject(err);
				});
			});
		}
	}
}
</script>

<style>
/* 保持原有的CSS类名，只添加性能优化 */
.container{
	width: calc(100% - 60rpx);
	padding: 0 30rpx 60rpx;
}
.title-box{
	padding: 20rpx 0;
	font-size: 40rpx;
	font-weight: 700;
}

/* 相册部分样式 */
.album-section {
	margin: 30rpx 0;
	width: 100%;
}
.album-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
	color: #333;
}
.album-desc {
	font-size: 24rpx;
	color: #999;
	margin-bottom: 20rpx;
	line-height: 1.4;
}
.change-avatar {
	color: #FA5150;
	margin-left: 10rpx;
	font-weight: bold;
}
.photo-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	margin-top: 20rpx;
}
.photo-item {
	position: relative;
	width: 220rpx;
	height: 220rpx;
	margin-bottom: 20rpx;
	border-radius: 12rpx;
	overflow: hidden;
	border: 2rpx dashed #ddd;
}
.photo-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.photo-tag {
	position: absolute;
	top: 10rpx;
	left: 10rpx;
	background-color: rgba(0, 0, 0, 0.6);
	color: #fff;
	font-size: 20rpx;
	padding: 4rpx 12rpx;
	border-radius: 10rpx;
	font-weight: normal;
}
.photo-boost {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	background-color: #FA5150;
	color: #fff;
	font-size: 22rpx;
	padding: 8rpx 0;
	text-align: center;
}
.photo-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	background-color: #f5f5f5;
}
.photo-icon {
	width: 60rpx;
	height: 60rpx;
	margin-bottom: 10rpx;
}
.photo-type {
	color: #666;
	font-size: 24rpx;
	margin-bottom: 10rpx;
	text-align: center;
	padding: 0 10rpx;
	font-weight: normal;
}
.avatar-box{
	margin: 10rpx 0 0;
	width: 180rpx;
	height: 180rpx;
	padding: 0;
	background: none;
	position: relative;
}
.avatar-box .avatar{
	width: 100%;
	height: 100%;
	background: #f8f8f8;
	border-radius: 50%;
}
.avatar-box .icon{
	position: absolute;
	right: 0;
	bottom: 0;
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	justify-content: center;
	background: #000;
	border: 4rpx solid #fff;
}
.title-label{
	width: calc(100% - 48rpx);
	padding: 30rpx 24rpx 12rpx;
	color: #999;
	font-size: 24rpx;
	font-weight: 700;
}
.subtitle {
	font-weight: normal;
	font-size: 20rpx;
	margin-left: 10rpx;
}
.w50{
	width: calc(50% - 80rpx) !important;
}
.w70{
	width: calc(70% - 15rpx) !important;
}
.w25{
	width: calc(25% - 15rpx) !important;
}
.sp{
	justify-content: space-between;
}
.age{
	width: calc(50% - 75rpx) !important;
}
.gender-box{
	padding: 20rpx 0;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
}
.gender-box .active-1{
	border-color: #fa5150 !important;
	background: rgba(250, 81, 80, 0.125);
}
.gender-box .active-2{
	border-color: #4cd964 !important;
	background: rgba(76, 217, 100, 0.125);
}
.gender-box .gender-item{
	height: 90rpx;
	width: 180rpx;
	border-radius: 24rpx;
	border-width: 4rpx;
	border-style: solid;
	border-color: #f5f5f5;
	justify-content: center;
	margin: 10rpx;
}
.gender-box .gender-item image{
	width: 44rpx;
	height: 44rpx;
	margin-right: 10rpx;
}
.input-box{
	width: calc(100% - 68rpx);
	padding: 0 30rpx;
	height: 90rpx;
	line-height: 90rpx;
	font-size: 28rpx;
	font-weight: 700;
	border: 4rpx solid #f5f5f5;
	border-radius: 24rpx;
	justify-content: space-between;
}
.textarea-box{
	width: calc(100% - 68rpx);
	padding: 20rpx 30rpx;
	min-height: 90rpx;
	line-height: 48rpx;
	color: #000;
	font-size: 28rpx;
	font-weight: 700;
	border: 4rpx solid #f5f5f5;
	border-radius: 24rpx;
}
.input-btn{
	width: 90rpx;
	height: 90rpx;
	font-size: 24rpx;
	justify-content: space-between;
	margin: 0;
	padding: 0;
	background: #fff;
}
.input-btn image{
	margin-right: 8rpx;
	width: 32rpx;
	height: 32rpx;
}
.input-tips{
	margin-top: 20rpx;
	color: #999;
	font-size: 18rpx;
}
.popup-box{
	width: calc(100% - 40rpx);
	padding: 20rpx;
	background: #fff;
	border-radius: 30rpx 30rpx 0 0;
	position: relative;
	overflow: hidden;
}
.popup-box .popup-top{
	width: calc(100% - 20rpx);
	padding: 10rpx;
	justify-content: space-between;
}
.popup-top .popup-title .t1{
	font-size: 38rpx;
	font-weight: 700;
}
.popup-top .popup-title .t2{
	color: #999;
	font-size: 20rpx;
	font-weight: 300;
}
.popup-top .popup-close{
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	background: #f8f8f8;
	justify-content: center;
	transform: rotate(45deg);
}
.popup-box .popup-btn{
	margin: 40rpx 10rpx;
	width: calc(100% - 20rpx);
	height: 90rpx;
	line-height: 90rpx;
	text-align: center;
	font-size: 24rpx;
	font-weight: 700;
	color: #fff;
	background: #000;
	border-radius: 90rpx;
}
.popup-box .age-box{
	padding: 20rpx 0;
	display: flex;
	flex-wrap: wrap;
}
.age-box .age-item{
	margin: 10rpx;
	padding: 30rpx 40rpx;
	color: #000;
	border-width: 4rpx;
	border-style: solid;
	border-color: #f5f5f5;
	font-size: 24rpx;
	font-weight: 700;
	border-radius: 30rpx;
}
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
.df{
	display: flex;
	align-items: center;
}

/* 底部按钮样式 */
.footer-box {
	position: fixed;
	z-index: 99;
	bottom: 0;
	left: 0;
	width: 100%;
	padding-bottom: env(safe-area-inset-bottom);
}

.footer-box .footer-item {
	width: calc(100% - 60rpx);
	padding: 20rpx 30rpx;
	justify-content: center;
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

.bfw {
	background: #fff;
}

.bUp {
	box-shadow: 0 -2px 5px 0 rgba(0, 0, 0, 0.05);
}

/* 增加一些缺失的样式类 */
button {
	padding: 0;
	background-color: transparent;
}
button::after {
	border: none;
}
image {
	max-width: 100%;
	max-height: 100%;
}

/* 生日选择器样式 */
.birthday-picker {
	width: 100%;
	height: 400rpx;
	margin-top: 20rpx;
}
.picker-item {
	height: 50px;
	line-height: 50px;
	text-align: center;
	font-size: 28rpx;
}

/* 年龄标签样式 */
.age-tags {
	display: flex;
	flex-wrap: wrap;
	margin: 10rpx 0 20rpx;
}
.age-tag {
	padding: 10rpx 30rpx;
	margin: 10rpx;
	background-color: #f5f5f5;
	border-radius: 40rpx;
	font-size: 26rpx;
	color: #666;
}
.age-tag-active {
	background-color: #000;
	color: #fff;
}

/* 标签相关样式 */
.tags-box {
	padding: 20rpx 10rpx;
	display: flex;
	flex-wrap: wrap;
	max-height: 500rpx;
	overflow-y: auto;
}
.tag-item {
	padding: 16rpx 30rpx;
	margin: 10rpx;
	background-color: #f5f5f5;
	border-radius: 40rpx;
	font-size: 26rpx;
	color: #666;
}
.tagactive {
	background-color: #000;
	color: #fff;
}
.tag-categories {
	white-space: nowrap;
	padding: 20rpx 0;
	border-bottom: 1px solid #f0f0f0;
}
.category-item {
	display: inline-block;
	padding: 16rpx 30rpx;
	margin: 0 10rpx;
	background-color: #f5f5f5;
	border-radius: 40rpx;
	font-size: 26rpx;
	color: #666;
}
.category-active {
	background-color: #000;
	color: #fff;
}

/* 标签内容区 */
.tags-swiper {
	height: 400rpx;
	margin-top: 20rpx;
}
.tags-scroll {
	height: 100%;
}

.no-tags {
	text-align: center;
	color: #999;
	font-size: 28rpx;
	padding: 30rpx 0;
	width: 100%;
}

/* 底部安全区域 */
.bottom-safe-area {
	height: 150rpx;
	width: 100%;
}

/* 新增照片按钮样式 */
.add-photo {
	border: 2rpx dashed #ccc;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #f9f9f9;
}
.add-icon {
	font-size: 60rpx;
	color: #999;
	text-align: center;
	line-height: 1;
}
.add-text {
	font-size: 24rpx;
	color: #999;
	margin-top: 10rpx;
}

.photo-button {
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	background: none;
	border: none;
	line-height: normal;
	position: relative;
	display: block;
}

.photo-button::after {
	border: none;
}

.category-item {
	display: inline-block;
	padding: 16rpx 30rpx;
	margin: 0 10rpx;
	background-color: #f5f5f5;
	border-radius: 40rpx;
	font-size: 26rpx;
	color: #666;
}
.category-active {
	background-color: #000;
	color: #fff;
}

.category-item {
	display: inline-block;
	padding: 16rpx 30rpx;
	margin: 0 10rpx;
	background-color: #f5f5f5;
	border-radius: 40rpx;
	font-size: 26rpx;
	color: #666;
}
.category-active {
	background-color: #000;
	color: #fff;
}
.category-count {
	font-size: 20rpx;
	margin-left: 6rpx;
	opacity: 0.8;
}
</style>