<template>
  <view class="container">
    <view class="nav-bar bfw" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="bar-box df" :style="{'height': titleBarHeight + 'px', 'width': '100%'}">
        <view class="bar-back df" @tap="navBack">
          <image src="/static/img/z.png" style="width:34rpx;height:34rpx"></image>
        </view>
        <view class="bar-title ohto">圈子</view>
      </view>
      <view class="nav-box df">
        <view 
          v-for="(item, index) in barList" 
          :key="index" 
          class="nav-item df" 
          @tap="barClick" 
          :data-idx="index">
          <text :style="{'color': index == barIdx ? '#000' : '#999', 'font-size': index == barIdx ? '28rpx' : '26rpx'}">
            {{ item }}
          </text>
          <view :style="{'opacity': index == barIdx ? 1 : 0}" class="nav-line"></view>
        </view>
      </view>
    </view>
    
    <view class="content-box" :style="{'margin-top': 'calc(' + (statusBarHeight + titleBarHeight) + 'px + 90rpx)'}">
      <!-- 自定义加载指示器 -->
      <view v-if="showLoading" class="loading-container">
        <view class="loading-indicator"></view>
      </view>
      
      <view v-if="isEmpty" class="empty-box df">
        <image src="/static/img/empty.png"/>
        <view class="e1">{{ barIdx == 0 ? '暂无推荐圈子' : '暂无加入圈子' }}</view>
        <view class="e2">空空如也，等待探索</view>
      </view>
      
      <block v-else>
        <view 
          v-for="(item, index) in list" 
          :key="index" 
          class="list-box df" 
          :data-id="item.id" 
          @tap="toCircle">
          <view class="list-avatar">
            <lazy-image :src="item.circle_avatar || item.avatar" :br="'168rpx'"></lazy-image>
            <view v-if="item.is_official == 1" class="tag" style="background: url(/static/img/gf.png) 0% 0% / 100% 100%;"></view>
            <view v-else-if="item.is_hot == 1" class="tag" style="background: url(/static/img/tj.png) 0% 0% / 100% 100%;"></view>
          </view>
          <view class="list-item">
            <view class="name ohto2">{{ item.circle_name || item.name }}</view>
            <view class="intro ohto2">{{ item.circle_description || item.intro }}</view>
            <view v-if="item.member_count > 0" class="cu-img-group">
              <view v-for="(member, imgIndex) in item.recent_members" :key="imgIndex" class="cu-img" v-if="imgIndex < 3">
                <image :src="member.avatar" mode="aspectFill"></image>
              </view>
              <view class="cu-txt">{{ item.member_count }}人加入 · {{ item.dynamic_count || 0 }}篇笔记</view>
              <view class="view-count" v-if="item.view_count">· 访问 {{ item.view_count }}</view>
            </view>
            <view class="recent-topics" v-if="item.recent_topics && item.recent_topics.length">
              <view class="recent-title">最近话题：</view>
              <view class="topic-item" v-for="(topic, topicIndex) in item.recent_topics" :key="topicIndex">
                {{topic}}
              </view>
            </view>
          </view>
        </view>
      </block>
      
      <!-- 底部加载状态显示 -->
      <view v-if="list.length > 0 && loadStatus === 'noMore'" style="text-align: center; padding: 20rpx 0; color: #999; font-size: 24rpx;">
        没有更多数据了
      </view>
    </view>
    
    <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
      <view class="tips-box df">
        <view class="tips-item bfh">{{ tipsTitle }}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import lazyImage from '@/components/lazyImage/lazyImage'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'
import { getCircleList, getMyCircles, getJoinedCircles } from '@/api/social'

const app = getApp();

export default {
  components: {
    lazyImage,
    uniLoadMore
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      barList: ['全部', '我的'],
      barIdx: 0,
      list: [],
      page: 1,
      limit: 10,
      totalCount: 0,
      isEmpty: false,
      isThrottling: true,
      loadStatus: 'more',
      tipsTitle: '',
      showLoading: false,
      loadingTimer: null,
      debounceTimer: null
    }
  },
  onLoad(option) {
    if (option && option.type) {
      this.barIdx = parseInt(option.type) || 0
    }
    this.getCircleData()
  },
  // 开启下拉刷新
  onPullDownRefresh() {
    if (this.loadStatus !== 'loading') {
      this.page = 1;
      this.getCircleData();
    } else {
      uni.stopPullDownRefresh();
    }
  },
  methods: {
    // 获取圈子数据
    getCircleData() {
      let that = this;
      that.isThrottling = false;
      
      // 设置为加载中状态
      that.loadStatus = 'loading';
      
      // 延迟显示加载指示器，避免短时间内的闪烁
      if (that.loadingTimer) {
        clearTimeout(that.loadingTimer);
      }
      that.loadingTimer = setTimeout(() => {
        if (that.loadStatus === 'loading') {
          that.showLoading = true;
        }
      }, 300);
      
      // 请求参数
      const params = {
        page: that.page,
        limit: that.limit
      };
      
      // 根据标签选择API
      let apiMethod;
      if (that.barIdx === 0) {
        // 全部圈子
        apiMethod = getCircleList;
      } else {
        // 我的圈子 - 这里可以调用我创建的圈子或者我加入的圈子，根据实际需求调整
        // 目前先使用加入的圈子，如果需要同时显示创建的和加入的，可以并发请求后合并
        apiMethod = getJoinedCircles;
      }
      
      // 调用API
      apiMethod(params).then(res => {
        that.isThrottling = true;
        that.loadStatus = "more";
        
        // 清除加载定时器并隐藏加载指示器
        if (that.loadingTimer) {
          clearTimeout(that.loadingTimer);
          that.loadingTimer = null;
        }
        that.showLoading = false;
        
        // 停止下拉刷新
        uni.stopPullDownRefresh();
        
        if (res.status === 200 && res.data) {
          // 处理返回的数据
          const responseData = res.data;
          
          if (responseData.list && responseData.list.length > 0) {
            if (that.page == 1) {
              that.list = responseData.list;
            } else {
              that.list = that.list.concat(responseData.list);
            }
            
            // 更新总记录数
            if (responseData.count !== undefined) {
              that.totalCount = responseData.count;
            }
            
            that.isEmpty = false;
          } else if (that.page == 1) {
            that.isEmpty = true;
            that.list = [];
          }
          
          // 判断是否还有更多数据
          if (that.list.length >= that.totalCount && that.list.length > 0) {
            that.loadStatus = "noMore";
          }
        } else {
          if (that.page == 1) {
            that.isEmpty = true;
            that.list = [];
          }
          that.opTipsPopup(res.msg || "获取数据失败");
        }
      }).catch(err => {
        that.isThrottling = true;
        that.loadStatus = "more";
        
        // 清除加载定时器并隐藏加载指示器
        if (that.loadingTimer) {
          clearTimeout(that.loadingTimer);
          that.loadingTimer = null;
        }
        that.showLoading = false;
        
        // 停止下拉刷新
        uni.stopPullDownRefresh();
        
        if (that.page == 1) {
          that.isEmpty = true;
          that.list = [];
        }
        
        that.opTipsPopup("网络错误，请稍后重试");
        console.error('获取圈子列表失败:', err);
      });
    },
    
    // 标签切换
    barClick(e) {
      // 如果正在请求数据或节流状态为false，不处理点击
      if (!this.isThrottling || this.loadStatus === 'loading') {
        return;
      }
      
      // 获取点击的标签索引
      const clickIdx = parseInt(e.currentTarget.dataset.idx);
      
      // 如果点击的是当前选中的标签，不重复加载
      if (clickIdx === this.barIdx) {
        return;
      }
      
      // 使用防抖处理，避免快速重复点击
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      
      this.debounceTimer = setTimeout(() => {
        this.isThrottling = false;
        this.barIdx = clickIdx;
        this.page = 1;
        this.loadStatus = "loading";
        
        // 重置列表数据，立即显示空状态，提高用户体验
        this.list = [];
        
        // 获取数据
        this.getCircleData();
      }, 100);
    },
    
    // 跳转到圈子详情
    toCircle(e) {
      // 安全检查参数
      if (!e || !e.currentTarget || !e.currentTarget.dataset || !e.currentTarget.dataset.id) {
        this.opTipsPopup('圈子信息无效');
        return;
      }
      
      const id = parseInt(e.currentTarget.dataset.id);
      
      // 检查圈子ID是否有效
      if (!id || id <= 0) {
        this.opTipsPopup('圈子ID无效');
        return;
      }
      
      uni.navigateTo({
        url: '/pages/note/circle?id=' + id,
        fail: () => {
          this.opTipsPopup('页面跳转失败');
        }
      });
    },
    
    // 返回上一页
    navBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack({
          fail: () => {
            uni.switchTab({
              url: '/pages/user/index'
            });
          }
        });
      } else {
        uni.switchTab({
          url: '/pages/user/index'
        });
      }
    },
    
    // 显示提示信息
    opTipsPopup(msg) {
      this.tipsTitle = msg;
      this.$refs.tipsPopup.open();
      setTimeout(() => {
        this.$refs.tipsPopup.close();
      }, 2000);
    }
  },
  
  onReachBottom() {
    // 如果当前状态是加载中，不触发加载更多
    if (this.loadStatus === "loading") {
      return;
    }
    
    // 如果未到达最大数量，加载更多
    if (this.isThrottling && this.list.length && this.list.length < this.totalCount) {
      this.page = this.page + 1;
      this.loadStatus = "loading";
      this.getCircleData();
    } else if (this.list.length >= this.totalCount && this.list.length > 0) {
      this.loadStatus = "noMore";
    }
  },
  
  onUnload() {
    // 组件卸载时清除定时器
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}
</script>

<style>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 99;
  box-sizing: border-box;
}
.bar-box .bar-back {
  padding: 0 30rpx;
  width: 34rpx;
  height: 100%;
}
.bar-box .bar-title {
  max-width: 60%;
  font-size: 32rpx;
  font-weight: 700;
}
.nav-box {
  width: 100%;
  height: 80rpx;
}
.nav-box .nav-item {
  padding: 0 30rpx;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  position: relative;
}
.nav-box .nav-item text {
  font-weight: 700;
  transition: all .3s ease-in-out;
}
.nav-box .nav-line {
  position: absolute;
  bottom: 12rpx;
  width: 18rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #000;
  transition: opacity .3s ease-in-out;
}
.content-box {
  width: calc(100% - 60rpx);
  padding: 30rpx;
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

.list-box {
  width: 100%;
  padding-bottom: 30rpx;
  justify-content: space-between;
}
.list-box .list-avatar {
  width: 168rpx;
  height: 168rpx;
  border-radius: 50%;
  background: #f8f8f8;
  border: 1px solid #f8f8f8;
  position: relative;
}
.list-avatar .tag {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
}
.list-box .list-item {
  width: calc(100% - 198rpx);
  margin-left: 30rpx;
}
.list-item .name {
  font-size: 32rpx;
  font-weight: 700;
}
.list-item .intro {
  margin: 10rpx 0 20rpx;
  color: #999;
  font-size: 24rpx;
}
.cu-img-group {
  direction: ltr;
  unicode-bidi: bidi-override;
  display: inline-block;
  margin-left: 16rpx;
}
.cu-img-group .cu-img {
  width: 32rpx;
  height: 32rpx;
  display: inline-flex;
  position: relative;
  margin-left: -16rpx;
  border: 4rpx solid #fff;
  background: #f8f8f8;
  vertical-align: middle;
  border-radius: 50%;
}
.cu-img-group .cu-img image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.cu-img-group .cu-txt {
  margin-left: 10rpx;
  display: inline-flex;
  color: #999;
  font-size: 20rpx;
  font-weight: 700;
}
.view-count {
  display: inline-flex;
  color: #999;
  font-size: 20rpx;
  font-weight: 500;
  margin-left: 4rpx;
}
.df {
  display: flex;
  align-items: center;
}
.bfw {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(255,255,255,.8);
}
.bfh {
  background: #000;
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
}
.empty-box {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}
.empty-box image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}
.empty-box .e1 {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}
.empty-box .e2 {
  font-size: 24rpx;
  color: #999;
}
.tips-box {
  justify-content: center;
  width: 100%;
}
.ohto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ohto2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
}
.heio {
  width: 100%;
  overflow: hidden;
  transition: height 0.3s;
  justify-content: center;
}

.tags-box {
  display: flex;
  flex-wrap: wrap;
  margin: 6rpx 0;
}

.tag-item {
  font-size: 20rpx;
  color: #666;
  margin-right: 12rpx;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
}

.recent-topics {
  margin-top: 8rpx;
}

.recent-title {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.topic-item {
  font-size: 20rpx;
  color: #666;
  background: #f8f8f8;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-bottom: 4rpx;
  margin-right: 8rpx;
  display: inline-block;
}
</style>