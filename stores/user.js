// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import { defineStore } from 'pinia'
import { getUserInfo } from '@/api/user.js'
import Cache from '@/utils/cache.js'
import cacheConfig from '@/config/cache.js'

const { UID, LOGIN_STATUS, USER_INFO } = cacheConfig

export const useUserStore = defineStore('user', {
  state: () => ({
    // 核心用户信息（只保留必要字段）
    userInfo: {
      uid: 0,
      nickname: '',
      avatar: '',
      phone: '',
      // 社交相关
      like_count: 0,
      follow_count: 0,
      fans_count: 0,
      visitor_count: 0,
      visitor_badge: 0,
      // VIP状态
      vip_status: 0,
      // 推广员状态
      is_promoter: 0,
      // 用户等级
      level: 0,
      exp_name: '',
      exp_num: 0
      // 移除了大量业务相关字段，这些应该在具体业务页面中获取
      // 如：integral, now_money, brokerage_price, pay_count, order_count, coupon_count 等
    },

    // 登录状态
    isLogin: false,
    token: ''
  }),

  getters: {
    // 是否已登录
    isLoggedIn: (state) => state.isLogin && !!state.token,

    // 用户ID
    uid: (state) => state.userInfo.uid || state.uid || 0,

    // 用户昵称（带默认值）
    displayName: (state) => state.userInfo.nickname || '未登录用户',
    
    // 用户头像（带默认值）
    displayAvatar: (state) => state.userInfo.avatar || '/static/img/avatar.png',
    
    // 是否为VIP用户
    isVip: (state) => state.userInfo.vip_status === 1,
    
    // 是否为推广员
    isPromoter: (state) => state.userInfo.is_promoter === 1,
    
    // 用户等级信息
    levelInfo: (state) => ({
      level: state.userInfo.level,
      exp_name: state.userInfo.exp_name,
      exp_num: state.userInfo.exp_num
    }),
    
    // 用户统计信息
    statsInfo: (state) => ({
      like_count: state.userInfo.like_count,
      follow_count: state.userInfo.follow_count,
      fans_count: state.userInfo.fans_count,
      visitor_count: state.userInfo.visitor_count
    })
  },

  actions: {
    // 设置登录状态
    setLoginStatus(status) {
      this.isLogin = status
      if (!status) {
        this.token = ''
        this.resetUserInfo()
      }
    },

    // 设置token
    setToken(token) {
      this.token = token
      this.isLogin = !!token

      // 同步到uni-app的全局存储（兼容旧系统）
      if (token) {
        uni.setStorageSync('token', token) // 新系统
        Cache.set(LOGIN_STATUS, token) // 旧系统兼容
      } else {
        uni.removeStorageSync('token')
        Cache.clear(LOGIN_STATUS)
      }
    },

    // 更新用户信息
    updateUserInfo(userInfo) {
      // 验证输入数据 - 确保是有效的对象且不是数组
      if (!userInfo || typeof userInfo !== 'object' || Array.isArray(userInfo)) {
        console.warn('updateUserInfo: 无效的用户信息数据', {
          userInfo: userInfo,
          type: typeof userInfo,
          isArray: Array.isArray(userInfo),
          isNull: userInfo === null,
          isUndefined: userInfo === undefined
        });
        return;
      }

      // 合并用户信息，确保数据完整性
      const updatedInfo = { ...this.userInfo, ...userInfo };

      // 确保关键字段存在
      if (!updatedInfo.uid && userInfo.uid) {
        updatedInfo.uid = userInfo.uid;
      }

      this.userInfo = updatedInfo;

      console.log('updateUserInfo: 用户信息验证通过并已更新:', {
        uid: this.userInfo.uid,
        nickname: this.userInfo.nickname
      });

      // 同步到uni-app的全局存储
      try {
        uni.setStorageSync('USER_INFO', this.userInfo);
        console.log('用户信息已更新到缓存:', {
          uid: this.userInfo.uid,
          nickname: this.userInfo.nickname,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('保存用户信息到缓存失败:', error);

        // 如果是存储空间不足，尝试清理
        if (error.name === 'QuotaExceededError') {
          this.clearStorageCache();
          // 重试保存
          try {
            uni.setStorageSync('USER_INFO', this.userInfo);
          } catch (retryError) {
            console.error('重试保存用户信息失败:', retryError);
          }
        }
      }
    },

    // 重置用户信息
    resetUserInfo() {
      this.userInfo = {
        uid: 0,
        nickname: '',
        avatar: '',
        phone: '',
        like_count: 0,
        follow_count: 0,
        fans_count: 0,
        visitor_count: 0,
        visitor_badge: 0,
        vip_status: 0,
        is_promoter: 0,
        level: 0,
        exp_name: '',
        exp_num: 0
      }

      // 清除本地存储
      uni.removeStorageSync('USER_INFO')
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const res = await getUserInfo()
        if (res.status === 200) {
          this.updateUserInfo(res.data)
          return res.data
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },

    // 登出
    logout() {
      console.log('开始执行登出流程...');

      // 1. 重置 Pinia 状态
      this.setLoginStatus(false)
      this.setToken('')
      this.resetUserInfo()

      // 2. 清除 uni-app 存储
      const uniStorageKeys = [
        'token',
        USER_INFO,
        UID,
        'pinia_user',
        'pinia_app',
        'USER_INFO', // 确保清理
        'UID',       // 确保清理
        'authIng',
        'snsapiCode'
      ];

      uniStorageKeys.forEach(key => {
        try {
          uni.removeStorageSync(key);
          console.log(`已清理 uni 存储: ${key}`);
        } catch (error) {
          console.warn(`清理 uni 存储 ${key} 失败:`, error);
        }
      });

      // 3. 清除 Cache 存储
      const cacheKeys = [
        LOGIN_STATUS,
        USER_INFO,
        UID,
        'snsapiCode',
        'EXPIRES_TIME',
        'STATE_R_KEY'
      ];

      cacheKeys.forEach(key => {
        try {
          Cache.clear(key);
          console.log(`已清理 Cache 存储: ${key}`);
        } catch (error) {
          console.warn(`清理 Cache 存储 ${key} 失败:`, error);
        }
      });

      // 4. 强制清理 Pinia 自动保存的状态（延迟执行，确保状态重置完成）
      setTimeout(() => {
        try {
          uni.removeStorageSync('pinia_user');
          uni.removeStorageSync('pinia_app');
          console.log('已强制清理 Pinia 自动保存状态');
        } catch (error) {
          console.warn('强制清理 Pinia 状态失败:', error);
        }
      }, 100);

      console.log('用户已登出，所有存储已清理');
    },

    // 设置用户ID
    setUid(uid) {
      this.userInfo.uid = uid
      this.uid = uid // 同时更新根级别的uid

      // 保存到本地存储
      try {
        uni.setStorageSync(UID, uid)
        Cache.set(UID, uid)
      } catch (error) {
        console.warn('保存用户ID失败:', error)
      }
    },



    // 从本地存储初始化状态
    initFromStorage() {
      try {
        // 恢复token（优先从新系统，兼容旧系统）
        let token = uni.getStorageSync('token') || Cache.get(LOGIN_STATUS)
        if (token) {
          this.setToken(token)
          console.log('Token已恢复:', { hasToken: !!token, tokenLength: token?.length });
        } else {
          console.log('未找到有效的token');
        }

        // 恢复用户信息
        try {
          // 首先尝试从 uni-app 存储获取
          let userInfo = uni.getStorageSync(USER_INFO);

          // 如果没有获取到，尝试从 Cache 获取
          if (!userInfo) {
            userInfo = Cache.get(USER_INFO, true);
          }

          // 如果获取到了用户信息，处理数据格式
          if (userInfo) {
            console.log('恢复的用户信息调试:', {
              type: typeof userInfo,
              isArray: Array.isArray(userInfo),
              hasUid: !!(userInfo && userInfo.uid),
              uid: userInfo.uid,
              nickname: userInfo.nickname
            });

            // 如果是字符串，尝试解析为对象
            if (typeof userInfo === 'string') {
              try {
                userInfo = JSON.parse(userInfo);
                console.log('用户信息JSON解析成功:', {
                  uid: userInfo.uid,
                  nickname: userInfo.nickname
                });
              } catch (parseError) {
                console.error('用户信息JSON解析失败:', parseError);
                return;
              }
            }

            // 调用 updateUserInfo 更新用户信息
            this.updateUserInfo(userInfo);
          }
        } catch (error) {
          console.error('恢复用户信息时发生错误:', error);
        }

        // 恢复用户ID
        const uid = uni.getStorageSync(UID) || Cache.get(UID)
        if (uid) {
          this.userInfo.uid = uid
          console.log('用户ID已恢复:', uid);
        }

        // 验证登录状态
        const isLoggedIn = this.isLogin && !!this.token && !!this.userInfo.uid
        console.log('登录状态验证:', {
          isLogin: this.isLogin,
          hasToken: !!this.token,
          hasUid: !!this.userInfo.uid,
          finalStatus: isLoggedIn
        });

      } catch (error) {
        console.warn('从本地存储初始化用户状态失败:', error)

        // 如果是存储空间不足，尝试清理
        if (error.name === 'QuotaExceededError') {
          this.clearStorageCache()
        }
      }
    },

    // 清理存储缓存
    clearStorageCache() {
      try {
        // 清理非关键数据
        const keysToRemove = [
          'pinia_social',
          'SIDEBAR_MENU',
          'APP_STATE',
          'BASIC_CONFIG'
        ]

        keysToRemove.forEach(key => {
          try {
            uni.removeStorageSync(key)
          } catch (e) {
            console.warn(`清理${key}失败:`, e)
          }
        })

        console.log('已清理存储缓存')
      } catch (error) {
        console.warn('清理存储缓存失败:', error)
      }
    }
  }
})
