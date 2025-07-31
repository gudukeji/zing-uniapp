<template>
  <view class="container">
    <view class="nav-bar bfw" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="bar-box df" :style="{'height': titleBarHeight + 'px', 'width': '100%'}">
        <view class="bar-back df" @tap="navBack">
          <image src="/static/img/back.png" style="width:34rpx;height:34rpx"></image>
        </view>
        <view class="bar-title ohto">{{userName}}</view>
      </view>
      <view class="nav-box df">
        <view 
          v-for="(item, index) in barList" 
          :key="index" 
          class="nav-item df" 
          @tap="barClick" 
          :data-idx="index"
        >
          <text :style="{
            'color': index == barIdx ? '#000' : '#999',
            'font-size': index == barIdx ? '28rpx' : '26rpx'
          }">{{item}}</text>
          <view :style="{'opacity': index == barIdx ? 1 : 0}" class="nav-line"></view>
        </view>
      </view>
    </view>
    
    <view class="content-box" :style="{'margin-top': 'calc(' + (statusBarHeight + titleBarHeight) + 'px + 80rpx)'}">
      <!-- 自定义加载指示器 -->
      <view v-if="uiState.showLoading" class="loading-container">
        <view class="loading-indicator"></view>
      </view>
      
      <emptyPage
        v-if="uiState.isEmpty"
        :title="userId ? (barIdx == 0 ? 'TA还没有关注' : 'TA还没有粉丝') : (barIdx == 0 ? '你还没有关注任何人' : '还没有人关注你')"
        :description="userId ? '' : (barIdx == 0 ? '赶快去关注感兴趣的小伙伴吧' : '发笔记，让大家可以关注你')"
        image="/static/img/empty.png"
      />
      
      <block v-else>
        <view 
          v-for="(item, index) in formattedList" 
          :key="index" 
          class="list-box df" 
          @tap="toUser" 
          :data-id="barIdx === 0 ? item.follow_uid : item.uid"
        >
          <view class="list-item df">
            <view class="list-avatar">
              <lazy-image :src="barIdx === 0 ? item.follow_avatar : item.avatar"></lazy-image>
            </view>
            <view class="item-content">
              <view class="name ohto">{{barIdx === 0 ? item.follow_nickname : item.nickname}}</view>
              <view class="intro ohto">{{barIdx === 0 ? item.follow_about_me || '' : item.about_me || ''}}</view>
            </view>
          </view>
          
          <!-- 操作按钮 -->
          <view
            v-if="userId == 0 || userId == myUserId"
            :data-idx="index"
            @tap.stop="followUser"
            :class="getButtonClass(item)"
          >
            {{getButtonText(item)}}
          </view>
        </view>
      </block>
      
      <!-- 底部加载状态显示 -->
      <view v-if="formattedList.length > 0 && dataState.loadStatus === 'noMore'" style="text-align: center; padding: 20rpx 0; color: #999; font-size: 24rpx;">
        没有更多数据了
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom, onUnload } from '@dcloudio/uni-app'
import { useStore } from 'vuex'
import lazyImage from '@/components/lazyImage/lazyImage.vue'
import emptyPage from '@/components/emptyPage/emptyPage.vue'
import { getSocialFollowList, getSocialFansList, followUser as followUserApi } from '@/api/social'

// 使用store
const store = useStore()

// 响应式数据
const statusBarHeight = ref(store.state.statusBarHeight || 20)
const titleBarHeight = ref(store.state.titleBarHeight || 44)
const userId = ref(0) // 查看的用户ID，0表示查看自己的
const myUserId = ref(0) // 当前登录用户的ID
const userName = ref("关注列表")
const barList = ref(["关注", "粉丝"])
const barIdx = ref(0)

// 优化的状态管理
const uiState = reactive({
  isEmpty: false,
  showLoading: false
})

// 数据状态管理
const dataState = reactive({
  list: [],
  page: 1,
  limit: 10,
  totalCount: 0,
  loadStatus: "more"
})

// 定时器管理
const timers = reactive({
  loading: null,
  debounce: null
})

// 计算属性
const formattedList = computed(() => {
  return dataState.list
})

const isLoading = computed(() => {
  return dataState.loadStatus === 'loading'
})

const hasMoreData = computed(() => {
  return dataState.list.length < dataState.totalCount && dataState.list.length > 0
})

// 获取按钮样式类
const getButtonClass = (item) => {
  const baseClass = ['list-btn', 'bg1']
  
  // 如果是关注列表或者已经关注的粉丝，显示为已关注状态
  if (barIdx.value === 0 || (barIdx.value === 1 && item.is_follow === 1)) {
    baseClass.push('bg2')
  }
  
  return baseClass.join(' ')
}

// 获取按钮文本
const getButtonText = (item) => {
  // 互相关注
  if (item.is_mutual === 1) {
    return '互相关注'
  }
  
  // 关注列表中的用户，显示"已关注"
  if (barIdx.value === 0) {
    return '已关注'
  }
  
  // 粉丝列表中的用户
  if (barIdx.value === 1) {
    return item.is_follow === 1 ? '已关注' : '关注'
  }
  
  return '关注'
}

// 防抖处理方法
const debounce = (func, delay = 300) => {
  if (timers.debounce) {
    clearTimeout(timers.debounce)
  }
  
  timers.debounce = setTimeout(() => {
    func()
    timers.debounce = null
  }, delay)
}

// 统一的错误处理方法
const handleError = (error, context = '操作', showToast = true) => {
  console.error(`${context}失败:`, error)
  
  if (showToast) {
    let message = `${context}失败，请稍后重试`
    if (error.message) {
      message = error.message
    } else if (error.msg) {
      message = error.msg
    }
    
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  }
}

// 清理定时器
const clearTimers = () => {
  Object.keys(timers).forEach(key => {
    if (timers[key]) {
      clearTimeout(timers[key])
      timers[key] = null
    }
  })
}

// 获取用户关注/粉丝列表
const getUserFollowList = () => {
  // 防止重复请求 - 如果已经在加载中，直接返回
  if (dataState.loadStatus === 'loading') {
    return
  }
  
  dataState.loadStatus = 'loading'
  
  // 延迟显示加载指示器，避免短时间内的闪烁
  clearTimers()
  timers.loading = setTimeout(() => {
    if (dataState.loadStatus === 'loading') {
      uiState.showLoading = true
    }
  }, 300)
  
  // 请求参数
  const params = {
    page: dataState.page,
    limit: dataState.limit
  }
  
  // 如果是查看他人的关注/粉丝列表，添加用户ID参数
  if (userId.value > 0) {
    params.user_id = userId.value
  }
  
  // 根据标签选择API
  const apiMethod = barIdx.value === 0 ? getSocialFollowList : getSocialFansList
  
  // 调用API
  apiMethod(params).then(res => {
    dataState.loadStatus = "more"
    
    // 清除加载定时器并隐藏加载指示器
    clearTimers()
    uiState.showLoading = false
    
    // 停止下拉刷新
    uni.stopPullDownRefresh()
    
    if (res.status === 200 && res.data) {
      // 处理返回的数据
      const responseData = res.data
      
      if (responseData.list && responseData.list.length > 0) {
        if (dataState.page == 1) {
          dataState.list = responseData.list
        } else {
          dataState.list = dataState.list.concat(responseData.list)
        }
        
        // 更新总记录数
        if (responseData.count !== undefined) {
          dataState.totalCount = responseData.count
        }
        
        uiState.isEmpty = false
      } else if (dataState.page == 1) {
        uiState.isEmpty = true
        dataState.list = []
      }
      
      // 判断是否还有更多数据
      if (dataState.list.length >= dataState.totalCount && dataState.list.length > 0) {
        dataState.loadStatus = "noMore"
      }
    } else {
      if (dataState.page == 1) {
        uiState.isEmpty = true
        dataState.list = []
      }
      handleError({ msg: res.msg || "获取数据失败" }, '获取数据')
    }
  }).catch(error => {
    dataState.loadStatus = "more"
    
    // 清除加载定时器并隐藏加载指示器
    clearTimers()
    uiState.showLoading = false
    
    // 停止下拉刷新
    uni.stopPullDownRefresh()
    
    if (dataState.page == 1) {
      uiState.isEmpty = true
      dataState.list = []
    }
    
    handleError(error, '网络请求')
  })
}

// 关注/取消关注用户
const followUser = (e) => {
  // 安全获取索引
  if (!e || !e.currentTarget || !e.currentTarget.dataset) {
    uni.showToast({
      title: "操作失败，参数错误",
      icon: "none"
    })
    return
  }

  const index = e.currentTarget.dataset.idx

  // 验证数据有效性
  if (index === undefined || !formattedList.value[index]) {
    uni.showToast({
      title: "数据错误，请刷新后重试",
      icon: "none"
    })
    return
  }

  const item = formattedList.value[index]
  // 根据当前标签页确定是否已关注和目标用户ID
  const isFollow = barIdx.value === 0 ? true : (item.is_follow === 1)
  // 获取目标用户ID，确保是整数类型
  const targetUserId = parseInt(barIdx.value === 0 ? item.follow_uid : item.uid)

  // 验证用户ID
  if (!targetUserId || targetUserId <= 0) {
    uni.showToast({
      title: "获取用户ID失败",
      icon: "none"
    })
    console.error('关注操作失败: 无效的用户ID', targetUserId)
    return
  }

  // 请求参数
  const params = {
    follow_uid: targetUserId,
    type: isFollow ? 0 : 1 // 0取消关注，1关注
  }

  uni.showLoading({ title: '处理中...', mask: true })

  // 调用关注/取消关注API
  followUserApi(params).then(res => {
    uni.hideLoading()

    if (res.status === 200) {
      // 关注列表(barIdx=0)中取消关注，直接移除
      if (barIdx.value === 0 && isFollow) {
        dataState.list.splice(index, 1)
        if (dataState.list.length === 0) {
          uiState.isEmpty = true
          dataState.loadStatus = "more"
        }
      }
      // 粉丝列表(barIdx=1)中关注/取消关注，更新状态
      else if (barIdx.value === 1 && dataState.list[index]) {
        // 更新原始列表中的关注状态
        dataState.list[index].is_follow = isFollow ? 0 : 1
        // 如果取消关注了互关粉丝，也要更新互关状态
        if (isFollow && dataState.list[index].is_mutual === 1) {
          dataState.list[index].is_mutual = 0
        }
      }

      // 显示操作结果提示
      uni.showToast({
        title: isFollow ? "已取消关注" : "关注成功",
        icon: "success"
      })
    } else {
      uni.showToast({
        title: res.msg || "操作失败，请重试",
        icon: "none"
      })
    }
  }).catch(error => {
    uni.hideLoading()
    handleError(error, '关注操作')
  })
}

// 标签切换
const barClick = (e) => {
  // 如果正在请求数据，不处理点击
  if (dataState.loadStatus === 'loading') {
    return
  }

  // 获取点击的标签索引
  const clickIdx = parseInt(e.currentTarget.dataset.idx)

  // 如果点击的是当前选中的标签，不重复加载
  if (clickIdx === barIdx.value) {
    return
  }

  // 使用统一的防抖处理
  debounce(() => {
    // 更新状态
    barIdx.value = clickIdx
    dataState.page = 1

    // 更新标题
    if (userId.value > 0) {
      userName.value = userName.value.replace(/(.*?)的(关注|粉丝)/, `$1的${clickIdx == 0 ? '关注' : '粉丝'}`)
    } else {
      userName.value = userName.value.replace(/(.*?)(关注|粉丝)/, `$1${clickIdx == 0 ? '关注' : '粉丝'}`)
    }

    // 重置列表数据和UI状态
    dataState.list = []
    uiState.isEmpty = false

    // 获取数据
    getUserFollowList()
  }, 100)
}

// 查看用户详情
const toUser = (e) => {
  // 安全检查参数
  if (!e || !e.currentTarget || !e.currentTarget.dataset || !e.currentTarget.dataset.id) {
    uni.showToast({
      title: '用户信息无效',
      icon: 'none'
    })
    return
  }

  const userId = parseInt(e.currentTarget.dataset.id)
  // 检查userId是否有效
  if (!userId || userId <= 0) {
    uni.showToast({
      title: '用户ID无效',
      icon: 'none'
    })
    return
  }

  uni.navigateTo({
    url: "/pages/user/details?id=" + userId
  })
}

// 返回
const navBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({
      url: "/pages/user/index"
    })
  }
}

// 页面加载
onLoad((options) => {
  // 设置选项卡索引
  if (options.type) {
    barIdx.value = parseInt(options.type)
  }

  // 获取用户信息 - 优先从store获取
  myUserId.value = parseInt(store.state.app?.uid || 0)

  // 设置查看的用户
  if (options.id) {
    userId.value = parseInt(options.id)
    userName.value = options.name ? options.name + '的' + (barIdx.value == 0 ? '关注' : '粉丝') : (barIdx.value == 0 ? '关注' : '粉丝')
  } else {
    userId.value = 0 // 查看自己的
    const USER_INFO = uni.getStorageSync('USER_INFO')
    const nickname = USER_INFO?.nickname || '我'
    userName.value = nickname + '的' + (barIdx.value == 0 ? '关注' : '粉丝')
  }

  // 获取用户关注/粉丝列表
  getUserFollowList()
})

// 下拉刷新
onPullDownRefresh(() => {
  if (dataState.loadStatus !== 'loading') {
    dataState.page = 1
    getUserFollowList()
  } else {
    // 如果正在加载中，直接停止下拉刷新
    uni.stopPullDownRefresh()
  }
})

// 上拉加载更多
onReachBottom(() => {
  // 如果当前状态是加载中，不触发加载更多
  if (dataState.loadStatus === "loading") {
    return
  }

  // 如果未到达最大数量，加载更多
  if (hasMoreData.value) {
    dataState.page = dataState.page + 1
    dataState.loadStatus = "loading"
    getUserFollowList()
  } else if (dataState.list.length >= dataState.totalCount && dataState.list.length > 0) {
    dataState.loadStatus = "noMore"
  }
})

// 页面卸载
onUnload(() => {
  // 使用统一的定时器清理方法
  clearTimers()
})
</script>

<style>
/* 优化性能：添加will-change和transform3d */
.nav-bar{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 99;
  box-sizing: border-box;
  /* APP端兼容性：条件编译backdrop-filter */
  /* #ifndef APP-PLUS */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  /* #endif */
}
.bar-box .bar-back{
  padding: 0 30rpx;
  width: 34rpx;
  height: 100%;
}
.bar-box .bar-title{
  max-width: 60%;
  font-size: 32rpx;
  font-weight: 700;
}
.nav-box{
  width: 100%;
  height: 80rpx;
}
.nav-box .nav-item{
  padding: 0 30rpx;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  position: relative;
}
.nav-box .nav-item text{
  font-weight: 700;
  transition: all .3s ease-in-out;
}
.nav-box .nav-line{
  position: absolute;
  bottom: 12rpx;
  width: 18rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #000;
  transition: opacity .3s ease-in-out;
}
.content-box{
  width: calc(100% - 80rpx);
  padding: 20rpx 40rpx;
}
/* 加载中状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60rpx;
  margin-bottom: 20rpx;
}
.loading-indicator {
  width: 30rpx;
  height: 30rpx;
  border: 3rpx solid #f3f3f3;
  border-top: 3rpx solid #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.list-box{
  width: 100%;
  padding: 20rpx 0;
  justify-content: space-between;
}
.list-box .list-item{
  width: calc(100% - 120rpx - 2px);
}
.list-item .list-avatar{
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 1px solid #f8f8f8;
  overflow: hidden;
}
.list-item .item-content{
  width: calc(100% - 100rpx);
  margin-left: 20rpx;
}
.item-content .name{
  font-size: 28rpx;
  font-weight: 700;
}
.item-content .intro{
  color: #999;
  font-size: 20rpx;
}
.list-box .list-btn{
  width: 100rpx;
  height: 50rpx;
  line-height: 50rpx;
  text-align: center;
  font-size: 20rpx;
  font-weight: 700;
  border-radius: 8rpx;
}
.bg1{
  color: #999;
  background: #f8f8f8;
}
.bg2{
  color: #fff;
  background: #000;
}
.heio{
  transition: height 0.3s;
}
.empty-box{
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}
.empty-box image{
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}
.empty-box .e1{
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}
.empty-box .e2{
  font-size: 24rpx;
  color: #999;
}
.df{
  display: flex;
  align-items: center;
}
.bfw{
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(255,255,255,.8);
}
.ohto{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
