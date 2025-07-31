# Pinia状态管理使用指南

## 概述

本项目已集成Pinia状态管理，与现有的Vuex并存，可以逐步迁移。

## Store结构

```
stores/
├── index.js          # Pinia实例配置
├── user.js           # 用户状态管理
├── app.js            # 应用状态管理
├── social.js         # 社交功能状态管理
└── README.md         # 使用指南
```

## 基本使用

### 1. 在组件中使用

```vue
<template>
  <view>
    <text>用户名：{{ userStore.displayName }}</text>
    <text>是否VIP：{{ userStore.isVip ? '是' : '否' }}</text>
    <button @click="logout">退出登录</button>
  </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user.js'

const userStore = useUserStore()

const logout = () => {
  userStore.logout()
}
</script>
```

### 2. 在Options API中使用

```vue
<script>
import { useUserStore } from '@/stores/user.js'

export default {
  data() {
    return {
      userStore: useUserStore()
    }
  },
  computed: {
    userName() {
      return this.userStore.displayName
    }
  },
  methods: {
    async fetchUserInfo() {
      await this.userStore.fetchUserInfo()
    }
  }
}
</script>
```

## Store详细说明

### 用户Store (useUserStore)

#### State
- `userInfo`: 用户基本信息
- `isLogin`: 登录状态
- `token`: 认证令牌
- `permissions`: 用户权限
- `settings`: 用户设置

#### Getters
- `isLoggedIn`: 是否已登录
- `displayName`: 显示名称
- `displayAvatar`: 显示头像
- `isVip`: 是否VIP用户
- `isPromoter`: 是否推广员

#### Actions
- `setLoginStatus(status)`: 设置登录状态
- `setToken(token)`: 设置令牌
- `updateUserInfo(userInfo)`: 更新用户信息
- `fetchUserInfo()`: 获取用户信息
- `logout()`: 退出登录

### 应用Store (useAppStore)

#### State
- `systemInfo`: 系统信息
- `config`: 应用配置
- `theme`: 主题设置
- `networkStatus`: 网络状态
- `loading`: 加载状态
- `cache`: 缓存管理

#### Getters
- `isDarkMode`: 是否暗黑模式
- `isMobile`: 是否移动端
- `safeAreaHeight`: 安全区域高度
- `isOnline`: 是否在线

#### Actions
- `setTheme(theme)`: 设置主题
- `toggleThemeMode()`: 切换主题模式
- `setGlobalLoading(loading)`: 设置全局加载状态
- `setCache(key, data)`: 缓存数据
- `getCache(key)`: 获取缓存

### 社交Store (useSocialStore)

#### State
- `dynamicCache`: 动态列表缓存
- `topics`: 话题数据
- `circles`: 圈子数据
- `followUsers`: 关注用户
- `publishStatus`: 发布状态

#### Actions
- `setDynamicCache(type, subType, data)`: 设置动态缓存
- `getDynamicCache(type, subType)`: 获取动态缓存
- `setLikeStatus(dynamicId, isLiked)`: 设置点赞状态
- `startPublish()`: 开始发布

## 迁移指南

### 从Vuex迁移到Pinia

#### Vuex写法
```javascript
// 获取状态
this.$store.state.user.userInfo
this.$store.getters.isLogin

// 提交mutation
this.$store.commit('UPDATE_USERINFO', userInfo)

// 分发action
this.$store.dispatch('getUserInfo')
```

#### Pinia写法
```javascript
// 获取状态
const userStore = useUserStore()
userStore.userInfo
userStore.isLoggedIn

// 直接修改状态
userStore.updateUserInfo(userInfo)

// 调用action
userStore.fetchUserInfo()
```

### 渐进式迁移策略

1. **新功能使用Pinia**：所有新开发的功能使用Pinia
2. **保留现有Vuex**：现有功能继续使用Vuex，避免破坏性改动
3. **逐步迁移**：有时间时逐步将Vuex代码迁移到Pinia

## 最佳实践

### 1. Store命名规范
- 使用 `use` + `StoreName` + `Store` 格式
- 例如：`useUserStore`、`useAppStore`

### 2. 状态设计
- 保持状态扁平化
- 使用合理的默认值
- 避免在state中存储计算属性

### 3. Actions设计
- 异步操作放在actions中
- 使用async/await处理异步
- 提供错误处理

### 4. 缓存策略
- 合理设置缓存过期时间
- 及时清理过期缓存
- 避免缓存过多数据

## 调试工具

### 1. Vue DevTools
Pinia完全支持Vue DevTools，可以：
- 查看store状态
- 追踪状态变化
- 时间旅行调试

### 2. 控制台调试
```javascript
// 在控制台中访问store
const userStore = useUserStore()
console.log(userStore.userInfo)
```

## 注意事项

1. **兼容性**：Pinia与Vuex可以并存，不会冲突
2. **持久化**：已配置自动持久化，用户和应用状态会自动保存
3. **性能**：Pinia比Vuex更轻量，性能更好
4. **类型安全**：Pinia提供更好的TypeScript支持

## 示例代码

### 个人中心页面使用Pinia

```vue
<script>
import { useUserStore } from '@/stores/user.js'
import { useAppStore } from '@/stores/app.js'

export default {
  data() {
    return {
      userStore: useUserStore(),
      appStore: useAppStore()
    }
  },
  computed: {
    userInfo() {
      return this.userStore.userInfo
    },
    isLoading() {
      return this.appStore.isGlobalLoading
    }
  },
  async onLoad() {
    // 初始化状态
    this.userStore.initFromStorage()
    this.appStore.initFromStorage()
    
    // 获取用户信息
    if (this.userStore.isLoggedIn) {
      await this.userStore.fetchUserInfo()
    }
  },
  methods: {
    async handleLogin() {
      this.appStore.setGlobalLoading(true)
      try {
        await this.userStore.fetchUserInfo()
      } finally {
        this.appStore.setGlobalLoading(false)
      }
    }
  }
}
</script>
```

这样就完成了Pinia的集成，可以开始在新功能中使用Pinia，同时保持现有代码的稳定性。
