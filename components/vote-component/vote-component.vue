<template>
  <view v-if="voteInfo" class="vote-box">
    <view class="vote-container">
      <view class="vote-header">
        <view class="vote-title-container">
          <image class="vote-icon" src="/static/img/toupiao.png" mode="aspectFit"></image>
          <text class="vote-title">{{ voteInfo.vote.title }}</text>
        </view>
        <!-- 删除按钮（仅在编辑模式下显示） -->
        <view v-if="showDelete" class="vote-delete" @tap="handleDelete">
          <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx;transform:rotate(45deg)"></image>
        </view>
      </view>
      <view class="vote-options">
        <!-- 未投票时 -->
        <template v-if="!voteInfo.user_selected">
          <view 
            v-for="(option, idx) in voteInfo.options" 
            :key="option.id || idx" 
            class="vote-option vote-option-unvoted"
            @tap="handleVote(option.id)">
            <text class="vote-content">{{ option.option_text }}</text>
          </view>
        </template>
        <!-- 已投票时 -->
        <template v-else>
          <view 
            v-for="(option, idx) in voteInfo.options" 
            :key="option.id || idx" 
            class="vote-option vote-option-unvoted">
            <view class="vote-row">
              <view class="vote-left">
                <view v-if="voteInfo.user_selected === option.id" class="vote-checked-icon">
                  <image src="/static/img/c1.png" style="width:30rpx;height:30rpx;"></image>
                </view>
                <text class="vote-content">{{ option.option_text }}</text>
              </view>
              <text class="vote-percent">{{ option.percent }}%</text>
            </view>
            <view class="vote-bar-bg">
              <view class="vote-bar" :style="{
                width: option.percent + '%',
                background: voteInfo.user_selected === option.id ? '#ffd600' : '#eaeaea'
              }"></view>
            </view>
          </view>
        </template>
      </view>
      <view class="vote-people">{{ votePeopleText }}</view>
    </view>
  </view>
</template>

<script>
import { vote } from '@/api/social.js'
import { toLogin } from '@/libs/login.js'

export default {
  name: 'VoteComponent',
  props: {
    // 投票信息对象
    voteInfo: {
      type: Object,
      default: null
    },
    // 是否显示删除按钮（编辑模式）
    showDelete: {
      type: Boolean,
      default: false
    },
    // 是否禁用投票（已投票或其他原因）
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      voting: false // 投票进行中状态
    }
  },
  computed: {
    // 参与投票人数文本
    votePeopleText() {
      if (!this.voteInfo) return '';
      const total = this.voteInfo.total || 0;
      return this.formatNumber(total, 10000, '万') + '人参与了投票';
    }
  },
  methods: {
    // 数字格式化
    formatNumber(num, threshold = 10000, suffix = 'w') {
      if (!num || num < threshold) return num.toString() || '';
      return (num / threshold).toFixed(1) + suffix;
    },

    // 处理投票点击
    async handleVote(optionId) {
      // 检查是否已投票或禁用状态
      if (this.voting || this.voteInfo.user_selected || this.disabled) {
        return;
      }

      // 检查登录状态
      if (!this.$store.getters.isLogin) {
        toLogin();
        return;
      }

      this.voting = true;
      
      try {
        const voteId = this.voteInfo.vote.id;
        const res = await vote({ 
          vote_id: voteId, 
          option_id: optionId 
        });
        
        if (res.status === 200 && res.data && res.data.vote_info) {
          // 发送投票成功事件给父组件
          this.$emit('vote-success', {
            voteInfo: res.data.vote_info,
            optionId: optionId
          });
          
          uni.showToast({ 
            title: '投票成功', 
            icon: 'none' 
          });
        } else {
          uni.showToast({ 
            title: res.msg || '投票失败', 
            icon: 'none' 
          });
        }
      } catch (error) {
        console.error('投票失败:', error);
        uni.showToast({ 
          title: error.message || '投票失败', 
          icon: 'none' 
        });
      } finally {
        this.voting = false;
      }
    },

    // 处理删除投票
    handleDelete() {
      console.log('VoteComponent: handleDelete被调用');
      // 直接触发删除事件，让父组件处理确认逻辑
      this.$emit('vote-delete');
      console.log('VoteComponent: vote-delete事件已发送');
    }
  }
}
</script>

<style scoped>
/* 投票展示样式 */
.vote-box {
  width: 100%;
  margin-top: 16rpx;
}

.vote-container {
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  position: relative;
}

.vote-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 20rpx;
}

.vote-title-container {
  display: flex;
  align-items: center;
  flex: 1;
}

.vote-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
}

.vote-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  text-align: left;
  white-space: normal;
  word-break: break-word;
}

.vote-delete {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10rpx;
  position: relative;
  z-index: 10;
  cursor: pointer;
  transition: background 0.2s;
}

.vote-delete:hover {
  background: #e8e8e8;
}

.vote-delete:active {
  transform: scale(0.95);
}

.vote-options {
  display: flex;
  flex-direction: column;
  padding: 0 0;
}

.vote-option-unvoted {
  background: #fff;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 18rpx;
  border: none;
  box-shadow: none;
  text-align: center;
  transition: background 0.2s, border 0.2s;
  margin-left: 20rpx;
  margin-right: 20rpx;
  position: relative;
  min-height: 66rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.vote-row {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
}

.vote-left {
  display: flex;
  align-items: center;
}

.vote-bar-bg {
  border-radius: 18px;
  font-size: 17px;
  color: #333;
  margin-bottom: 10px;
  border: none;
  box-shadow: none;
  text-align: center;
  transition: background 0.2s, border 0.2s;
  margin-left: 11px;
  margin-right: 11px;
  min-height: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 11px;
  box-sizing: border-box;
}

.vote-bar {
  height: 100%;
  border-radius: 32rpx;
  transition: width 0.3s;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
}

.vote-checked-icon {
  width: 28rpx;
  height: 28rpx;
  background: #ffd600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10rpx;
}

.vote-checked-icon image {
  width: 20rpx;
  height: 20rpx;
  display: block;
}

.vote-content {
  font-size: 26rpx;
  color: #333;
  text-align: left;
  white-space: normal;
  word-break: break-word;
  font-weight: 500;
}

.vote-percent {
  font-size: 26rpx;
  color: #000000;
  text-align: right;
  margin-left: 12rpx;
  min-width: 48rpx;
  flex-shrink: 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-weight: 500;
  margin-right: 40rpx;
  position: relative;
}

.vote-people {
  margin-top: 16rpx;
  color: #999;
  font-size: 24rpx;
  text-align: left;
  padding-left: 20rpx;
  padding-bottom: 20rpx;
}
</style>
