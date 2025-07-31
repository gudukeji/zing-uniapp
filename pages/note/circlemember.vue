<template>
  <view class="container">
    <!-- 搜索框 -->
    <view class="search-box df">
      <image src="/static/img/search.png" class="search-icon"></image>
      <input
        class="search-input"
        placeholder="输入昵称搜索成员"
        v-model="search"
        @input="onSearchInput"
        @confirm="onSearchConfirm"
      />
      <view v-if="search" class="clear-btn" @tap="clearSearch">
        <image src="/static/img/close.png" class="clear-icon"></image>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    <!-- 内容区域 -->
    <view v-if="!loading" class="content-area">
      <!-- 空状态 -->
      <view v-if="isEmpty" class="empty-state">
        <image src="/static/img/empty.png" class="empty-icon"></image>
        <text class="empty-text">{{ search ? '未找到相关成员' : '暂无成员' }}</text>
        <text v-if="search" class="empty-tip">试试其他关键词</text>
      </view>

      <!-- 管理团队 -->
      <view v-if="adminList.length > 0" class="section">
        <view class="section-title">
          <text>管理团队</text>
          <text class="member-count">({{ adminList.length }})</text>
        </view>
        <view class="member-list">
          <view
            class="member-item df"
            v-for="(user, idx) in adminList"
            :key="'admin-'+idx"
            @tap="goToUserProfile(user.uid)"
          >
            <image :src="user.user_avatar || '/static/img/avatar.png'" class="avatar" mode="aspectFill"></image>
            <view class="info">
              <view class="name df">
                <text>{{ user.user_nickname || '未知用户' }}</text>
                <view v-if="user.role==='圈主'" class="role-tag owner">圈主</view>
                <view v-else-if="user.role==='管理员'" class="role-tag admin">管理员</view>
                <view v-if="user.is_mute === 1" class="status-tag muted">已禁言</view>
              </view>
              <view class="meta df">
                <text v-if="user.gender" :class="['gender', user.gender==='男' ? 'male' : 'female']">
                  {{ user.gender==='男'?'♂':'♀' }}
                </text>
                <text v-if="user.age" class="age">{{ user.age }}岁</text>
                <text class="contrib">加入时间：{{ formatJoinTime(user.join_time) }}</text>
              </view>
            </view>
            <!-- 操作按钮 -->
            <view
              v-if="user.uid !== getCurrentUserId() && isManager && canManage(user)"
              class="action-buttons"
              @tap.stop="showActionMenu(user)"
            >
              <view class="action-btn">
                <text>管理</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 普通成员 -->
      <view v-if="memberList.length > 0" class="section">
        <view class="section-title">
          <text>普通成员</text>
          <text class="member-count">({{ memberList.length }})</text>
        </view>
        <view class="member-list">
          <view
            class="member-item df"
            v-for="(user, idx) in memberList"
            :key="'member-'+idx"
            @tap="goToUserProfile(user.uid)"
          >
            <image :src="user.user_avatar || '/static/img/avatar.png'" class="avatar" mode="aspectFill"></image>
            <view class="info">
              <view class="name df">
                <text>{{ user.user_nickname || '未知用户' }}</text>
                <view v-if="user.is_mute === 1" class="status-tag muted">已禁言</view>
              </view>
              <view class="meta df">
                <text v-if="user.gender" :class="['gender', user.gender==='男' ? 'male' : 'female']">
                  {{ user.gender==='男'?'♂':'♀' }}
                </text>
                <text v-if="user.age" class="age">{{ user.age }}岁</text>
                <text class="contrib">加入时间：{{ formatJoinTime(user.join_time) }}</text>
              </view>
            </view>
            <!-- 操作按钮 -->
            <view
              v-if="user.uid !== getCurrentUserId() && isManager"
              class="action-buttons"
              @tap.stop="showActionMenu(user)"
            >
              <view class="action-btn">
                <text>管理</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, getCurrentInstance } from 'vue'
import { getCircleMemberList, kickCircleMember, setCircleMemberRole, muteCircleMember, unmuteCircleMember } from '@/api/social.js'

// 获取当前实例
const { proxy } = getCurrentInstance()

// 响应式数据
const search = ref('')
const adminList = ref([])
const memberList = ref([])
const circleId = ref(null)
const allMembers = ref([]) // 用于搜索
const currentUser = ref(null) // 当前用户信息
const selectedMember = ref(null) // 选中的成员
const isManager = ref(false) // 是否有管理权限
const loading = ref(false) // 加载状态
const searchTimer = ref(null) // 搜索防抖定时器
const cacheKey = ref('') // 缓存键
const lastUpdateTime = ref(0) // 最后更新时间
// 计算属性
const isEmpty = computed(() => {
  return !loading.value && adminList.value.length === 0 && memberList.value.length === 0
})

const totalMembers = computed(() => {
  return adminList.value.length + memberList.value.length
})

// 页面加载
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options

  circleId.value = options.id
  cacheKey.value = `circle_members_${circleId.value}`
  getCurrentUser()
  checkCache()
  fetchMembers()
})
// 监听搜索变化
watch(search, (val) => {
  // 防抖处理搜索
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
  searchTimer.value = setTimeout(() => {
    filterMembers(val)
  }, 300)
})
// 检查缓存
const checkCache = () => {
  try {
    const cached = uni.getStorageSync(cacheKey.value)
    const now = Date.now()

    // 缓存有效期3分钟
    if (cached && cached.timestamp && (now - cached.timestamp < 3 * 60 * 1000)) {
      adminList.value = cached.data.adminList || []
      memberList.value = cached.data.memberList || []
      allMembers.value = cached.data.allMembers || { adminList: [], memberList: [] }
      lastUpdateTime.value = cached.timestamp
      checkManagerRole()
    }
  } catch (e) {
    console.warn('读取成员缓存失败:', e)
  }
}

// 更新缓存
const updateCache = () => {
  try {
    const cacheData = {
      data: {
        adminList: adminList.value,
        memberList: memberList.value,
        allMembers: allMembers.value
      },
      timestamp: Date.now()
    }
    uni.setStorageSync(cacheKey.value, cacheData)
    lastUpdateTime.value = cacheData.timestamp
  } catch (e) {
    console.warn('更新成员缓存失败:', e)
  }
}

// 搜索输入处理
const onSearchInput = (e) => {
  search.value = e.detail.value
}

// 搜索确认
const onSearchConfirm = () => {
  filterMembers(search.value)
}

// 清除搜索
const clearSearch = () => {
  search.value = ''
  filterMembers('')
}


// 跳转到用户详情
const goToUserProfile = (uid) => {
  uni.navigateTo({
    url: `/pages/user/details?id=${uid}`
  })
}

// 获取当前用户信息
const getCurrentUser = () => {
  const userInfo = uni.getStorageSync('USER_INFO')
  const vuexUid = proxy.$store.state.app.uid
  currentUser.value = {
    uid: vuexUid || (userInfo && userInfo.uid) || 0
  }
}

// 获取当前用户ID
const getCurrentUserId = () => {
  return currentUser.value ? currentUser.value.uid : 0
}
// 检查当前用户是否为圈主/管理员
const checkManagerRole = () => {
  const userId = getCurrentUserId()
  const admin = adminList.value.find(u => u.uid === userId)
  isManager.value = admin && (admin.role_type === 2 || admin.role_type === 3)

  // 存储当前用户的角色信息
  if (admin) {
    currentUser.value.role_type = admin.role_type
    currentUser.value.role = admin.role
  }
}

// 检查是否可以管理某个成员
const canManage = (member) => {
  const currentUserId = getCurrentUserId()
  const currentUserRole = currentUser.value?.role_type || 0

  // 不能管理自己
  if (member.uid === currentUserId) {
    return false
  }

  // 圈主可以管理所有人
  if (currentUserRole === 3) {
    return true
  }

  // 管理员只能管理普通成员
  if (currentUserRole === 2 && member.role_type === 1) {
    return true
  }

  return false
}
// 显示操作菜单
const showActionMenu = (member) => {
  selectedMember.value = member
  const actions = []

  // 根据成员角色显示不同操作
  if (member.role_type === 1) { // 普通成员
    actions.push('设为管理员')
  } else if (member.role_type === 2) { // 管理员
    actions.push('取消管理员')
  }

  // 根据禁言状态显示对应操作
  if (member.is_mute === 1) {
    actions.push('解除禁言')
  } else {
    actions.push('禁言')
  }

  // 踢出圈子操作
  actions.push('踢出圈子')

  uni.showActionSheet({
    itemList: actions,
    success: (res) => {
      const action = actions[res.tapIndex]
      handleMemberAction(action, member)
    }
  })
}
// 处理成员操作
const handleMemberAction = async (action, member) => {
  try {
    switch (action) {
      case '设为管理员':
        await setMemberRole(member.uid, 2)
        break
      case '取消管理员':
        await setMemberRole(member.uid, 1)
        break
      case '禁言':
        await muteMember(member.uid)
        break
      case '解除禁言':
        await unmuteMember(member.uid)
        break
      case '踢出圈子':
        await kickMember(member.uid)
        break
    }
  } catch (e) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}
// 设置成员角色
const setMemberRole = async (uid, roleType) => {
  uni.showModal({
    title: '确认操作',
    content: roleType === 2 ? '确定要设为管理员吗？' : '确定要取消管理员权限吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await setCircleMemberRole({
            circle_id: parseInt(circleId.value),
            target_uid: parseInt(uid),
            role_type: parseInt(roleType)
          })

          if (result.status === 200) {
            uni.showToast({ title: '操作成功', icon: 'success' })
            fetchMembers() // 刷新成员列表
          } else {
            uni.showToast({ title: result.msg || '操作失败', icon: 'none' })
          }
        } catch (e) {
          uni.showToast({ title: '网络错误', icon: 'none' })
        }
      }
    }
  })
}
// 禁言成员
const muteMember = async (uid) => {
  // 显示禁言原因选择
  uni.showActionSheet({
    itemList: ['发布违规内容', '恶意刷屏', '人身攻击', '其他原因'],
    success: (res) => {
      const reasons = ['发布违规内容', '恶意刷屏', '人身攻击', '其他原因']
      const selectedReason = reasons[res.tapIndex]

      if (selectedReason === '其他原因') {
        // 弹出输入框让用户输入自定义原因
        uni.showModal({
          title: '输入禁言原因',
          editable: true,
          placeholderText: '请输入禁言原因',
          success: async (modalRes) => {
            if (modalRes.confirm && modalRes.content) {
              await executeMuteMember(uid, modalRes.content)
            }
          }
        })
      } else {
        executeMuteMember(uid, selectedReason)
      }
    }
  })
}
// 执行禁言操作
const executeMuteMember = async (uid, reason) => {
  try {
    const result = await muteCircleMember({
      circle_id: parseInt(circleId.value),
      target_uid: parseInt(uid),
      mute_days: parseInt(1),
      reason: reason
    })

    if (result.status === 200) {
      uni.showToast({ title: '禁言成功', icon: 'success' })
      fetchMembers()
    } else {
      uni.showToast({ title: result.msg || '禁言失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}
// 解除禁言
const unmuteMember = async (uid) => {
  try {
    const result = await unmuteCircleMember({
      circle_id: parseInt(circleId.value),
      target_uid: parseInt(uid)
    })

    if (result.status === 200) {
      uni.showToast({ title: '解除禁言成功', icon: 'success' })
      fetchMembers()
    } else {
      uni.showToast({ title: result.msg || '操作失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}
// 踢出成员
const kickMember = async (uid) => {
  // 显示踢出原因选择
  uni.showActionSheet({
    itemList: ['严重违规', '恶意刷屏', '人身攻击', '其他原因'],
    success: (res) => {
      const reasons = ['严重违规', '恶意刷屏', '人身攻击', '其他原因']
      const selectedReason = reasons[res.tapIndex]

      if (selectedReason === '其他原因') {
        // 弹出输入框让用户输入自定义原因
        uni.showModal({
          title: '输入踢出原因',
          editable: true,
          placeholderText: '请输入踢出原因',
          success: async (modalRes) => {
            if (modalRes.confirm && modalRes.content) {
              await executeKickMember(uid, modalRes.content)
            }
          }
        })
      } else {
        executeKickMember(uid, selectedReason)
      }
    }
  })
}
// 执行踢出操作
const executeKickMember = async (uid, reason) => {
  uni.showModal({
    title: '确认踢出',
    content: `确定要踢出该成员吗？原因：${reason}\n此操作不可撤销。`,
    confirmColor: '#FA5150',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await kickCircleMember({
            circle_id: parseInt(circleId.value),
            target_uid: parseInt(uid),
            reason: reason
          })

          if (result.status === 200) {
            uni.showToast({ title: '踢出成功', icon: 'success' })
            fetchMembers()
          } else {
            uni.showToast({ title: result.msg || '踢出失败', icon: 'none' })
          }
        } catch (e) {
          uni.showToast({ title: '网络错误', icon: 'none' })
        }
      }
    }
  })
}
// 获取成员列表
const fetchMembers = async () => {
  try {
    loading.value = true

    const res = await getCircleMemberList({
      circle_id: circleId.value,
      page: 1,
      limit: 500 // 增加限制数量
    })

    if (res.status === 200 && res.data && res.data.list) {
      const list = res.data.list

      // 圈主、管理员、普通成员分组
      const adminListData = []
      const memberListData = []

      list.forEach(user => {
        // 确保用户数据完整性
        const userData = {
          ...user,
          user_avatar: user.user_avatar || '/static/img/avatar.png',
          user_nickname: user.user_nickname || '未知用户',
          gender: user.gender || '',
          age: user.age || '',
          join_time: user.join_time || '',
          is_mute: user.is_mute || 0
        }

        if (user.role_type === 3) {
          adminListData.unshift({ ...userData, role: '圈主' })
        } else if (user.role_type === 2) {
          adminListData.push({ ...userData, role: '管理员' })
        } else {
          memberListData.push(userData)
        }
      })

      adminList.value = adminListData
      memberList.value = memberListData
      allMembers.value = { adminList: adminListData, memberList: memberListData }

      // 更新缓存
      updateCache()

      // 更新管理权限
      checkManagerRole()
    } else {
      throw new Error(res.msg || '获取成员列表失败')
    }
  } catch (e) {
    console.error('获取成员列表失败:', e)
    handleError(e, '成员加载失败')
  } finally {
    loading.value = false
  }
}
// 格式化加入时间
const formatJoinTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
// 统一错误处理
const handleError = (error, defaultMessage = '操作失败') => {
  console.error('错误处理:', error)

  let message = defaultMessage

  if (typeof error === 'string') {
    message = error
  } else if (error && typeof error === 'object') {
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
      message = '网络连接异常，请检查网络设置'
    } else if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
      message = '请求超时，请稍后重试'
    } else {
      message = error.msg || error.message || error.data?.msg || defaultMessage
    }
  }

  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })

  return message
}

// 优化的搜索过滤
const filterMembers = (val) => {
  if (!val || !val.trim()) {
    // 恢复原始分组
    if (allMembers.value.adminList && allMembers.value.memberList) {
      adminList.value = allMembers.value.adminList
      memberList.value = allMembers.value.memberList
    }
    return
  }

  const searchTerm = val.trim().toLowerCase()

  const filter = (arr) => arr.filter(u => {
    const nickname = (u.user_nickname || '').toLowerCase()
    const uid = String(u.uid || '')

    return nickname.includes(searchTerm) || uid.includes(searchTerm)
  })

  adminList.value = filter(allMembers.value.adminList || [])
  memberList.value = filter(allMembers.value.memberList || [])
}

// 页面卸载时清理定时器
onUnmounted(() => {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
    searchTimer.value = null
  }
})
</script>

<style>
.container {
  background: #fff;
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.search-box {
  margin: 30rpx 30rpx 30rpx 30rpx;
  background: #f6f7fa;
  border-radius: 30rpx;
  height: 60rpx;
  align-items: center;
  padding: 0 20rpx;
}
.search-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
}
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 26rpx;
  color: #333;
}
.clear-btn {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10rpx;
}
.clear-icon {
  width: 20rpx;
  height: 20rpx;
}
/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}
.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.loading-text {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #999;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}
.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  opacity: 0.6;
}
.empty-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}
.empty-tip {
  font-size: 24rpx;
  color: #999;
}

/* 内容区域 */
.content-area {
  min-height: 60vh;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #222;
  margin: 30rpx 0 18rpx 30rpx;
  display: flex;
  align-items: center;
}
.member-count {
  font-size: 24rpx;
  color: #999;
  font-weight: normal;
  margin-left: 8rpx;
}
.member-list {
  margin: 0;
}
.member-item {
  padding: 5rpx 25rpx;
  display: flex;
  align-items: center;
  position: relative;
  min-height: 100rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}
.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.name {
  font-size: 28rpx;
  font-weight: 700;
  color: #222;
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}
.role-tag {
  font-size: 20rpx;
  border-radius: 8rpx;
  padding: 2rpx 14rpx;
  margin-left: 12rpx;
  color: #fff;
  font-weight: 400;
}
.role-tag.owner {
  background: #ff9500;
}
.role-tag.admin {
  background: #3da0ff;
}
.status-tag {
  font-size: 20rpx;
  border-radius: 8rpx;
  padding: 2rpx 14rpx;
  margin-left: 12rpx;
  font-weight: 400;
}
.status-tag.muted {
  background: #ff4757;
  color: #fff;
}
.meta {
  font-size: 22rpx;
  color: #999;
  display: flex;
  align-items: center;
  line-height: 1.4;
}
.gender {
  margin-right: 6rpx;
}
.male {
  color: #4e6ef2;
}
.female {
  color: #fa5a8a;
}
.age {
  margin-right: 12rpx;
}
.contrib {
  color: #999;
}
.action-buttons {
  margin-left: 20rpx;
  flex-shrink: 0;
}
.action-btn {
  background: #007aff;
  border-radius: 16rpx;
  padding: 6rpx 16rpx;
  font-size: 22rpx;
  color: #fff;
  min-width: 60rpx;
  text-align: center;
}
.action-btn:active {
  background: #0056cc;
}
.df {
  display: flex;
  align-items: center;
}
</style>
