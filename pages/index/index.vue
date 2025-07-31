<template>
  <view class="container">
    <!-- 顶部自定义导航栏 -->
    <view class="nav-box" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="bar-box" :style="{'height': titleBarHeight + 'px'}">
        <image class="bar-logo" src="/static/img/logo3.png" mode="heightFix"></image>
        <view class="bar-icons" :style="{'padding-right': menuButtonWidth + 'px'}">
          <image class="bar-icon" src="/static/img/s.png" @tap="onSearch"></image>
          <image class="bar-icon" src="/static/img/qd.png" @tap="onSignIn"></image>
          <!-- <image class="bar-icon" src="/static/img/user2.png"></image> -->
        </view>
      </view>
    </view>

    <!-- 主要内容区 -->
    <view class="content-box" :style="{'padding-top': (statusBarHeight + titleBarHeight) + 'px'}">
      <scroll-view 
        scroll-y="true" 
        @scrolltolower="onReachEnd" 
        class="content-scroll"
        :show-scrollbar="true"
      >
        <!-- 达人卡片和右侧功能区 -->
        <view class="feature-grid">
          <!-- 使用新的布局模式 -->
          <view class="grid-layout">
            <!-- 顶部布局：左边一个，右边两个 -->
            <view class="top-grid">
              <!-- 左侧卡片 - 在线匹配 -->
              <view class="left-item blue" @tap="navigateToFeature('match')">
                <view class="feature-content">
                  <view class="feature-title">在线匹配</view>
                  <view class="feature-subtitle">今天还有25次机会</view>
                  <view class="feature-btn">开始匹配</view>
                </view>
                <view class="feature-bubble"></view>
              </view>
              
              <!-- 右侧两个卡片 -->
              <view class="right-stack">
                <!-- 缘分恋爱卡片 - 粉色 -->
                <view class="right-item pink" @tap="navigateToFeature('love')">
                  <view class="feature-content">
                    <view class="feature-title">树洞盲盒</view>
                    <view class="feature-subtitle">发现附近缘分</view>
                  </view>
                  <view class="feature-icon heart-icon">
                    <image src="/static/img/logo.png" mode="aspectFit"></image>
                  </view>
                  <view class="feature-bubble"></view>
                </view>
                
                <!-- 声音匹配卡片 - 绿色 -->
                <view class="right-item green" @tap="navigateToFeature('voice')">
                  <view class="feature-content">
                    <view class="feature-title">声音匹配</view>
                    <view class="feature-subtitle">选择你的声音恋人</view>
                  </view>
                  <view class="feature-icon">
                    <image src="/static/img/logo.png" mode="aspectFit"></image>
                  </view>
                  <view class="feature-bubble"></view>
                </view>
              </view>
            </view>
            
            <!-- 底部一排三个卡片 -->
            <view class="bottom-row">
              <!-- 语音通话卡片 - 紫色 -->
              <view class="bottom-item purple" @tap="navigateToFeature('call')">
                <view class="feature-content">
                  <view class="feature-title">语音通话</view>
                  <view class="feature-subtitle">还有3次机会</view>
                </view>
                <view class="feature-icon">
                  <image src="/static/img/logo.png" mode="aspectFit"></image>
                </view>
                <view class="feature-bubble"></view>
              </view>
              
              <!-- 兴趣群聊卡片 - 粉红色 -->
              <view class="bottom-item hot-pink" @tap="navigateToFeature('group')">
                <view class="feature-content">
                  <view class="feature-title">兴趣群聊</view>
                  <view class="feature-subtitle">总有人懂你</view>
                </view>
                <view class="feature-icon">
                  <image src="/static/img/logo.png" mode="aspectFit"></image>
                </view>
                <view class="feature-bubble"></view>
              </view>
              
              <!-- 互动游戏卡片 - 青色 -->
              <view class="bottom-item cyan" @tap="navigateToFeature('game')">
                <view class="feature-content">
                  <view class="feature-title">互动游戏</view>
                  <view class="feature-subtitle">找游戏伙伴</view>
                </view>
                <view class="feature-icon">
                  <image src="/static/img/logo.png" mode="aspectFit"></image>
                </view>
                <view class="feature-bubble"></view>
              </view>
            </view>
          </view>
        </view>

        <!-- 圈子推荐区域 -->
        <view class="popular-section">
          <view class="popular-title">
            <text>圈子推荐</text>
          </view>
          <scroll-view scroll-x="true" class="scroll-box" style="height: 246rpx">
            <view class="circle-box">
              <view v-for="(item, index) in circle" :key="index" class="circle-item" :data-url="'note/circle?id=' + item.id" @tap="navigateToFun">
                <view class="circle-item-top">
                  <image :src="item.circle_avatar || item.avatar" mode="aspectFill"></image>
                  <view v-if="item.is_official == 1" class="circle-item-tag" style="background: url(/static/img/gf.png) 0% 0% / 100% 100%;"></view>
                  <view v-else-if="item.is_hot == 1" class="circle-item-tag" style="background: url(/static/img/tj.png) 0% 0% / 100% 100%;"></view>
                </view>
                
                <view class="circle-name ohto">{{item.circle_name || item.name}}</view>
                <view class="circle-tips">
                  <text v-if="item.dynamic_count">{{item.dynamic_count}}更新</text>
                  <text v-else-if="item.member_count || item.user_count">{{item.member_count || item.user_count}}新圈友</text>
                  <text v-else>推荐的圈子</text>
                </view>
              </view>
              <view class="circle-item" data-url="center/circle" @tap="navigateToFun">
                <view class="circle-item-top">
                  <image class="icon" src="/static/img/more.png"></image>
                </view>
                <view class="circle-name">更多圈子</view>
              </view>
              <view class="circle-item" style="width:10rpx"></view>
            </view>
          </scroll-view>
        </view>

        <!-- 一起玩区域 -->
        <view class="playwith-section">
          <!-- TAB栏 -->
          <view class="playwith-tabs">
            <view 
              v-for="(tab, idx) in playTabs" 
              :key="idx" 
              class="playwith-tab" 
              :class="{'active': playTabIndex === idx}"
              @tap="playTabIndex = idx"
            >
              <text>{{tab}}</text>
              <view v-if="playTabIndex === idx" class="active-line"></view>
            </view>
          </view>
          <!-- TAB内容 -->
          <view class="playwith-tab-content">
            <view v-if="playTabIndex === 0">
              <!-- 个人卡片风格内容 -->
              <view class="profile-card">
                <view class="profile-header">
                  <image class="profile-avatar" src="/static/img/logo.png"></image>
                  <view class="profile-info">
                    <view class="profile-title">
                      <text class="profile-name">张见秋.</text>
                      <text class="profile-gender female">♀ 25</text>
                    </view>
                    <view class="profile-status-row">
                      <text class="profile-status online">● 在线</text>
                      <text class="profile-status city">同城</text>
                      <text class="profile-status">巨蟹座</text>
                      <text class="profile-status">享受单身</text>
                    </view>
                    <view class="profile-tags">
                      <text class="profile-tag">软萌妹子</text>
                      <text class="profile-tag">人皮话多</text>
                      <text class="profile-tag">投猫子</text>
                      <text class="profile-tag">无辣不欢</text>
                    </view>
                  </view>
                  <view class="profile-hi-btn">Hi</view>
                </view>
                <view class="profile-voice">
                  <view class="voice-btn">
                    <image src="/static/img/play.png" class="voice-icon"></image>
                    <text>06'</text>
                  </view>
                </view>
                <view class="profile-desc">别叫我闭嘴</view>
                <view class="profile-photos">
                  <image class="profile-photo" src="/static/img/logo.png"></image>
                  <image class="profile-photo" src="/static/img/logo.png"></image>
                </view>
              </view>
            </view>
            <view v-else-if="playTabIndex === 1">
              <!-- 附近内容 -->
              <view class="playwith-card shadow">
                <image class="playwith-avatar" src="/static/img/logo.png"></image>
                <view class="playwith-info">
                  <view class="playwith-name">小明</view>
                  <view class="playwith-score">
                    <text class="star">★</text>4.7 (980)
                  </view>
                  <view class="playwith-game">🎮 王者荣耀</view>
                  <view class="playwith-desc">附近的玩家，快来组队！</view>
                </view>
              </view>
            </view>
            <view v-else-if="playTabIndex === 2">
              <!-- 最新内容 -->
              <view class="playwith-card shadow">
                <image class="playwith-avatar" src="/static/img/logo.png"></image>
                <view class="playwith-info">
                  <view class="playwith-name">小红</view>
                  <view class="playwith-score">
                    <text class="star">★</text>4.9 (1500)
                  </view>
                  <view class="playwith-game">🎮 英雄联盟手游</view>
                  <view class="playwith-desc">新加入的小伙伴，欢迎！</view>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 底部留白区域，避免内容被底部遮挡 -->
        <view style="height: 100rpx;"></view>
      </scroll-view>
    </view>
    
    <!-- 添加底部tabbar -->
    <tabbar :currentPage="0" :currentMsg="currentMsg"></tabbar>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import tabbar from '@/components/tabbar/tabbar'
import { getHotCircles as fetchHotCircles } from '@/api/social.js'

// 定义组件名称
defineOptions({
  name: 'TabbarIndex'
})

// 获取store和当前实例
const store = useStore()
const instance = getCurrentInstance()

// 响应式数据
const statusBarHeight = ref(store?.state?.statusBarHeight || 20)
const titleBarHeight = ref(store?.state?.titleBarHeight || 44)
const menuButtonWidth = ref(0) // 胶囊按钮右边距
const playTabs = ref(['推荐', '附近', '最新'])
const playTabIndex = ref(0)
const currentMsg = ref(0)
const games = ref([])
const circle = ref([])

// 方法定义
// 获取胶囊按钮位置信息
const getMenuButtonInfo = () => {
  // 尝试获取胶囊按钮信息
  try {
    // 微信小程序环境
    if (uni.canIUse('getMenuButtonBoundingClientRect')) {
      const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
      if (menuButtonInfo) {
        // 设置右边距，确保不与胶囊按钮重叠
        // 胶囊右侧到屏幕右侧的距离 + 额外的间距
        menuButtonWidth.value = menuButtonInfo.width + 16;
      }
    }
  } catch (e) {
    // 如果不是小程序环境或获取失败，设置默认值
    menuButtonWidth.value = 88; // 默认预留空间
  }
}

// 搜索点击事件
const onSearch = () => {
  uni.navigateTo({
    url: '/pages/search/index'
  });
}

// 签到点击事件
const onSignIn = () => {
  uni.navigateTo({
    url: '/pages/users/user_sgin/index'
  });
}

// 滚动到底部时触发
const onReachEnd = () => {
  console.log('滚动到底部');
}

// 从store获取消息数量
const getCurrentMsg = () => {
  if (store && store.state && store.state.app) {
    const userInfo = uni.getStorageSync('USER_INFO') || {};
    currentMsg.value = userInfo.service_num || 0;
  }
}

// 导航到功能页面
const navigateToFun = (e) => {
  const url = e.currentTarget.dataset.url;
  if (url) {
    uni.navigateTo({
      url: '/pages/' + url
    });
  }
}

// 导航到特定功能
const navigateToFeature = (type) => {
  console.log('Navigate to feature:', type);
  // 根据type跳转到不同的页面
  let url = '';
  switch (type) {
    case 'match':
      url = 'match/index';
      break;
    case 'love':
      url = 'note/manghe';
      break;
    case 'voice':
      url = 'voice/index';
      break;
    case 'call':
      url = 'call/index';
      break;
    case 'group':
      url = 'group/index';
      break;
    case 'game':
      url = 'game/index';
      break;
    default:
      break;
  }
  if (url) {
    uni.navigateTo({
      url: '/pages/' + url
    });
  }
}

// 获取热门圈子
const getHotCircles = () => {
  // 调用热门圈子接口
  fetchHotCircles()
    .then(res => {
      if (res.status === 200 && res.data) {
        // 处理圈子数据，确保字段兼容
        circle.value = res.data.map(item => {
          return {
            id: item.id,
            circle_name: item.circle_name || item.name,
            circle_avatar: item.circle_avatar || item.avatar,
            name: item.circle_name || item.name, // 兼容字段
            avatar: item.circle_avatar || item.avatar, // 兼容字段
            is_hot: item.is_hot || 0,
            is_official: item.is_official || 0,
            dynamic_count: item.dynamic_count || 0,
            member_count: item.member_count || 0,
            user_count: item.member_count || 0 // 兼容字段
          };
        });
      }
    })
    .catch(err => {
      console.log('获取热门圈子失败', err);
      // 保留默认数据
    });
}

// 生命周期钩子 - onLoad 等价于 onMounted
onMounted(() => {
  // 自定义tabbar，不需要隐藏原生tabbar
  // uni.hideTabBar(); // 注释掉，因为使用自定义tabbar

  // 获取胶囊按钮位置信息
  getMenuButtonInfo();

  // 获取消息数量
  getCurrentMsg();

  // 获取热门圈子数据
  getHotCircles();
})
</script>

<style>
.container { 
  background: #ffffff; 
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden; /* Prevent horizontal scrolling */
}
.content-box {
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* Prevent horizontal overflow */
  position: relative;
  z-index: 1;
  will-change: transform;
  padding-left: 10rpx;
  padding-right: 10rpx;
  box-sizing: border-box; /* Include padding in width calculation */
}
.content-scroll {
  height: 100%;
  -webkit-overflow-scrolling: touch;
}
.nav-box {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 99;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
  transform: translateZ(0);
  will-change: transform;
}
.bar-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
}
.bar-logo {
  height: 48rpx;
  width: 120rpx;
}
.bar-title { flex: 1; text-align: center; font-size: 34rpx; font-weight: bold; color: #222; letter-spacing: 2rpx; }
.bar-icons {
  display: flex;
  align-items: center;
  gap: 32rpx;
}
.bar-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.bar-icon:active {
  background: #f0f0f0;
}

.shadow {
  box-shadow: 0 4rpx 24rpx rgba(45,156,250,0.10);
}
.top-section {
  display: flex;
  justify-content: space-between;
  margin: 10rpx 0 20rpx;
  padding: 0 5rpx;
}
.influencer-card { 
  background: #2d9cfa; 
  border-radius: 20rpx; 
  padding: 15rpx; 
  width: 42%; 
  color: #fff; 
  position: relative; 
}
.avatar { width: 100rpx; height: 100rpx; border-radius: 20rpx; }
.voice-time { position: absolute; left: 15rpx; top: 15rpx; background: #fff; color: #2d9cfa; border-radius: 20rpx; padding: 2rpx 10rpx; font-size: 22rpx; }
.name { font-size: 32rpx; font-weight: bold; margin-top: 10rpx; }
.desc { font-size: 24rpx; margin-top: 4rpx; }
.right-func { 
  width: 52%;
  display: flex; 
  flex-direction: column; 
  justify-content: space-between;
}
.func-box {
  margin-bottom: 10rpx;
  padding: 12rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 24rpx rgba(45,156,250,0.10);
}
.func-title { font-size: 24rpx; font-weight: bold; margin-bottom: 6rpx; }
.func-avatars { display: flex; }
.func-avatar { width: 32rpx; height: 32rpx; border-radius: 50%; margin-right: 6rpx; }
.func-status { font-size: 22rpx; }
.closed { color: #b0b0b0; }
.online { color: #ffb800; }

.popular-section { margin: 20rpx 10rpx 30rpx; }
.popular-title { display: flex; justify-content: space-between; align-items: center; font-size: 32rpx; font-weight: bold; margin-bottom: 16rpx; }
.all-btn { color: #2d9cfa; font-size: 24rpx; }

/* 圈子相关样式 */
.scroll-box{
  width:100%;
  white-space:nowrap;
  overflow:hidden;
  transition:height .45s ease-in-out
}

.circle-box{
  width: 100%;
  display: flex;
  padding: 30rpx 10rpx;
  box-sizing: border-box; /* Include padding in width calculation */
}

.circle-box .circle-item{
  flex-shrink:0
}

.circle-item .circle-item-top{
  margin:0 20rpx;
  width:116rpx;
  height:116rpx;
  border-radius:50%;
  background:#f8f8f8;
  border:2rpx solid #f5f5f5;
  position:relative
}

.circle-item-top image{
  width:100%;
  height:100%;
  border-radius:50%
}

.circle-item-top .icon{
  margin:34rpx;
  width:48rpx;
  height:48rpx
}

.circle-item-top .circle-item-tag{
  position:absolute;
  right:0;
  bottom:0;
  width:24rpx;
  height:24rpx;
  border-radius:50%;
  border:6rpx solid #fff
}

.circle-item .circle-name{
  margin: 20rpx 0 10rpx;
  width: 160rpx;
  color: #000;
  font-weight: 500;
  font-size: 24rpx;
  line-height: 24rpx;
  text-align: center;
  box-sizing: border-box; /* Include padding in width calculation */
}

.circle-item .circle-tips{
  width: 160rpx;
  color: #999;
  font-size: 18rpx;
  line-height: 18rpx;
  font-weight: 300;
  text-align: center;
  box-sizing: border-box; /* Include padding in width calculation */
}

.playwith-section { margin: 20rpx 10rpx 30rpx; }
.playwith-title { font-size: 32rpx; font-weight: bold; margin-bottom: 16rpx; }
.playwith-tabs {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}
.playwith-tab {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  color: #999;
  padding: 20rpx 0;
  font-weight: 500;
  position: relative;
  transition: all 0.3s ease;
}
.playwith-tab.active {
  color: #000;
  font-weight: 700;
  transform: scale(1.05);
}
.playwith-tab .active-line {
  position: absolute;
  bottom: -5rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 30rpx;
  height: 6rpx;
  background-color: #000;
  border-radius: 3rpx;
  transition: all 0.3s ease;
}
.playwith-tab-content {
  /* 可加切换动画 */
}

/* 个人卡片样式 */
.profile-card {
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 24rpx rgba(45,156,250,0.10);
  padding: 32rpx 24rpx 24rpx 24rpx;
  margin-bottom: 24rpx;
}
.profile-header {
  display: flex;
  align-items: flex-start;
  position: relative;
}
.profile-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}
.profile-info {
  flex: 1;
}
.profile-title {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
}
.profile-name {
  margin-right: 12rpx;
}
.profile-gender {
  font-size: 24rpx;
  color: #ff7eb3;
}
.profile-gender.female {
  color: #ff7eb3;
}
.profile-status-row {
  margin-top: 8rpx;
  display: flex;
  gap: 12rpx;
}
.profile-status {
  font-size: 22rpx;
  color: #888;
  background: #f5f6fa;
  border-radius: 8rpx;
  padding: 2rpx 12rpx;
}
.profile-status.online {
  color: #2ecc71;
  background: #eaffea;
}
.profile-status.city {
  color: #2d9cfa;
  background: #eaf6ff;
}
.profile-tags {
  margin-top: 8rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}
.profile-tag {
  font-size: 20rpx;
  color: #666;
  background: #f5f6fa;
  border-radius: 8rpx;
  padding: 2rpx 10rpx;
}
.profile-hi-btn {
  position: absolute;
  right: 0;
  top: 0;
  background: linear-gradient(90deg,#5b8cff,#b36fff);
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 16rpx;
  padding: 8rpx 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(91,140,255,0.10);
}
.profile-voice {
  margin-top: 20rpx;
}
.voice-btn {
  display: flex;
  align-items: center;
  background: #f5f6fa;
  border-radius: 20rpx;
  width: 90rpx;
  padding: 6rpx 12rpx;
  color: #222;
  font-size: 22rpx;
  font-weight: bold;
}
.voice-icon {
  width: 28rpx;
  height: 28rpx;
  margin-right: 8rpx;
}
.profile-desc {
  margin-top: 18rpx;
  font-size: 26rpx;
  color: #222;
  font-weight: 500;
}
.profile-photos {
  margin-top: 12rpx;
  display: flex;
  gap: 12rpx;
}
.profile-photo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  object-fit: cover;
}

/* 一起玩卡片样式 */
.playwith-card {
  display: flex;
  padding: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 24rpx rgba(45,156,250,0.10);
}
.playwith-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  margin-right: 20rpx;
}
.playwith-info {
  flex: 1;
}
.playwith-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
}
.playwith-score {
  color: #ffb800;
  font-size: 26rpx;
  margin-bottom: 4rpx;
}
.playwith-game {
  font-size: 24rpx;
  color: #2d9cfa;
  margin-bottom: 4rpx;
}
.playwith-desc {
  font-size: 24rpx;
  color: #888;
}
.star {
  color: #ffb800;
}

/* 优化性能相关样式 */
.hardware-accelerated {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}

/* 卡片渐入动画 */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.ohto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 添加底部tabbar相关样式 */
.df {
  display: flex;
  align-items: center;
}

/* 新增功能卡片样式 */
.feature-grid {
  padding: 15rpx; /* 减小内边距 */
}

/* 新的网格布局样式 */
.grid-layout {
  display: flex;
  flex-direction: column;
  gap: 15rpx; /* 减小间距 */
}

/* 顶部网格：左一右二 */
.top-grid {
  display: flex;
  gap: 15rpx; /* 减小间距 */
  height: 220rpx; /* 减小高度 */
}

.left-item {
  flex: 1;
  border-radius: 20rpx;
  padding: 20rpx; /* 减小内边距 */
  position: relative;
  overflow: hidden;
}

.right-stack {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15rpx; /* 减小间距 */
}

.right-item {
  flex: 1;
  border-radius: 20rpx;
  padding: 15rpx; /* 减小内边距 */
  position: relative;
  overflow: hidden;
}

/* 底部一行三个 */
.bottom-row {
  display: flex;
  gap: 15rpx; /* 减小间距 */
}

.bottom-item {
  flex: 1;
  border-radius: 20rpx;
  padding: 15rpx; /* 减小内边距 */
  position: relative;
  overflow: hidden;
  min-height: 90rpx; /* 减小最小高度 */
}

.feature-bubble {
  position: absolute;
  right: 15rpx;
  bottom: 15rpx;
  width: 80rpx; /* 减小气泡大小 */
  height: 80rpx; /* 减小气泡大小 */
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  z-index: 0;
}

.feature-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  z-index: 2;
  position: relative;
}

.feature-title {
  font-size: 28rpx; /* 减小字体大小 */
  font-weight: bold;
  color: #fff;
  margin-bottom: 6rpx; /* 减小下边距 */
}

.feature-subtitle {
  font-size: 20rpx; /* 减小字体大小 */
  color: rgba(255, 255, 255, 0.8);
}

.feature-btn {
  background: #ffffff;
  color: #0099ff;
  font-size: 24rpx; /* 减小字体大小 */
  font-weight: bold;
  border-radius: 50rpx;
  padding: 6rpx 24rpx; /* 减小内边距 */
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  margin-top: 15rpx; /* 减小上边距 */
}

.feature-icon {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  z-index: 1;
}

.feature-icon image {
  width: 50rpx; /* 减小图标大小 */
  height: 50rpx; /* 减小图标大小 */
}

.heart-icon image {
  width: 40rpx; /* 减小图标大小 */
  height: 40rpx; /* 减小图标大小 */
}

/* Card colors */
.blue {
  background: #0099ff;
}

.pink {
  background: #ff66cc;
}

.green {
  background: #33cc99;
}

.purple {
  background: #9966ff;
}

.hot-pink {
  background: #ff6699;
}

.cyan {
  background: #00cccc;
}
</style>