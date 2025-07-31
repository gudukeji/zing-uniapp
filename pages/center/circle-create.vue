<template>
  <view class="container">

    <view class="form-container">
      <!-- 圈子头像和背景 -->
      <view class="form-item">
        <view class="form-label">圈子头像和背景</view>
        <view class="upload-row">
          <!-- 圈子头像 -->
          <view class="upload-item avatar-item">
            <view class="upload-box avatar-box" @tap="chooseAvatar">
              <image v-if="circleAvatar" :src="circleAvatar" mode="aspectFill" class="upload-image"></image>
              <view v-else class="upload-placeholder">
                <text class="upload-icon">+</text>
                <text class="upload-text">圈子头像</text>
              </view>
            </view>
          </view>
          
          <!-- 圈子背景 -->
          <view class="upload-item background-item">
            <view class="upload-box background-box" @tap="chooseBackground">
              <image v-if="circleBackground" :src="circleBackground" mode="aspectFill" class="upload-image"></image>
              <view v-else class="upload-placeholder">
                <text class="upload-icon">+</text>
                <text class="upload-text">圈子背景</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 圈子名称 -->
      <view class="form-item">
        <view class="form-label">圈子名称</view>
        <input class="form-input" placeholder="请输入圈子名称" v-model="circleName" maxlength="20" />
      </view>
      
      <!-- 圈子简介 -->
      <view class="form-item">
        <view class="form-label">圈子简介</view>
        <textarea class="form-textarea" placeholder="请输入圈子简介，让更多人了解你的圈子" maxlength="200" v-model="circleDesc" />
        <view class="form-count">{{circleDesc.length}}/200</view>
      </view>
      
      <!-- 圈子公告 -->
      <view class="form-item">
        <view class="form-label">圈子公告</view>
        <textarea class="form-textarea" placeholder="请输入圈子公告（可选）" maxlength="100" v-model="circleNotice" />
        <view class="form-count">{{circleNotice.length}}/100</view>
      </view>
    </view>
    
    <!-- 提交按钮 -->
    <view class="btn-container">
      <button class="submit-btn" @tap="submitCircle" :disabled="isSubmitting">
        {{isSubmitting ? '创建中...' : '创建圈子'}}
      </button>
    </view>
  </view>
</template>

<script>
import { createCircle } from '@/api/social'

export default {
  data() {
    return {
      circleName: '',
      circleDesc: '',
      circleNotice: '',
      circleAvatar: '',
      circleBackground: '',
      isSubmitting: false
    }
  },
  methods: {
    // 返回上一页
    navBack() {
      uni.navigateBack();
    },
    
    // 选择圈子头像
    chooseAvatar() {
      this.uploadImage('avatar');
    },
    
    // 选择圈子背景
    chooseBackground() {
      this.uploadImage('background');
    },
    
    // 上传图片
    uploadImage(type) {
      // 使用全局上传工具方法
      if (this.$util && this.$util.uploadImageChange) {
        this.$util.uploadImageChange('upload/image', 
          // 上传成功
          (res) => {
            uni.hideLoading();
            if (res.data && res.data.url) {
              if (type === 'avatar') {
                this.circleAvatar = res.data.url;
                uni.showToast({
                  title: '头像上传成功',
                  icon: 'success'
                });
              } else {
                this.circleBackground = res.data.url;
                uni.showToast({
                  title: '背景上传成功',
                  icon: 'success'
                });
              }
            } else {
              console.error('图片上传返回数据异常:', res);
              uni.showToast({
                title: '图片上传失败',
                icon: 'none'
              });
            }
          },
          // 上传失败或取消
          (err) => {
            uni.hideLoading();
            console.log('图片上传取消或失败:', err);
            if (err && err.errMsg && !err.errMsg.includes('cancel')) {
              uni.showToast({
                title: '图片上传失败',
                icon: 'none'
              });
            }
          },
          // 处理图片尺寸
          (res) => {
            if (res && res.w && res.h) {
              console.log(`${type}图片尺寸:`, res.w, 'x', res.h);
            }
          }
        );
      } else {
        // 备用方案：使用原始的chooseImage方法
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            
            // 检查文件大小
            uni.getFileInfo({
              filePath: tempFilePath,
              success: (fileInfo) => {
                const fileSizeMB = fileInfo.size / (1024 * 1024);
                if (fileSizeMB > 5) {
                  uni.showToast({
                    title: '图片大小不能超过5MB',
                    icon: 'none'
                  });
                  return;
                }
                
                // 显示上传进度
                uni.showLoading({
                  title: '上传中...',
                  mask: true
                });
                
                // 上传图片
                uni.uploadFile({
                  url: this.$api.uploadUrl || '/api/upload/image',
                  filePath: tempFilePath,
                  name: 'file',
                  success: (uploadRes) => {
                    uni.hideLoading();
                    try {
                      const data = JSON.parse(uploadRes.data);
                      if (data.code === 200 && data.data && data.data.url) {
                        if (type === 'avatar') {
                          this.circleAvatar = data.data.url;
                          uni.showToast({
                            title: '头像上传成功',
                            icon: 'success'
                          });
                        } else {
                          this.circleBackground = data.data.url;
                          uni.showToast({
                            title: '背景上传成功',
                            icon: 'success'
                          });
                        }
                      } else {
                        throw new Error('上传返回数据异常');
                      }
                    } catch (e) {
                      console.error('图片上传解析失败:', e);
                      uni.showToast({
                        title: '图片上传失败',
                        icon: 'none'
                      });
                    }
                  },
                  fail: (err) => {
                    uni.hideLoading();
                    console.error('图片上传失败:', err);
                    uni.showToast({
                      title: '图片上传失败',
                      icon: 'none'
                    });
                  }
                });
              },
              fail: (err) => {
                console.error('获取文件信息失败:', err);
                uni.showToast({
                  title: '无法获取图片信息',
                  icon: 'none'
                });
              }
            });
          }
        });
      }
    },
    
    // 提交创建圈子
    submitCircle() {
      if (!this.circleName.trim()) {
        uni.showToast({
          title: '请输入圈子名称',
          icon: 'none'
        });
        return;
      }
      
      if (!this.circleDesc.trim()) {
        uni.showToast({
          title: '请输入圈子简介',
          icon: 'none'
        });
        return;
      }
      
      if (!this.circleAvatar) {
        uni.showToast({
          title: '请上传圈子头像',
          icon: 'none'
        });
        return;
      }
      
      this.isSubmitting = true;
      
      const data = {
        circle_name: this.circleName.trim(),
        circle_description: this.circleDesc.trim(),
        circle_notice: this.circleNotice.trim(),
        circle_avatar: this.circleAvatar,
        circle_background: this.circleBackground
      };
      
      createCircle(data).then(res => {
        this.isSubmitting = false;
        
        if (res.status === 200) {
          uni.showToast({
            title: '创建成功',
            icon: 'success'
          });
          
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: res.msg || '创建失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        this.isSubmitting = false;
        console.error('创建圈子失败:', err);
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      });
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 999;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  width: 32rpx;
  height: 32rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.nav-right {
  width: 60rpx;
}

/* 表单容器 */
.form-container {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
}

.form-item {
  margin-bottom: 40rpx;
  position: relative;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  color: #333;
}

/* 上传区域 */
.upload-row {
  display: flex;
  gap: 30rpx;
}

.upload-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 头像区域占1份 */
.avatar-item {
  flex: 1;
}

/* 背景区域占3份 */
.background-item {
  flex: 3;
}

.upload-box {
  width: 100%;
  height: 160rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f8f8f8;
  border: 2rpx dashed #ddd;
  transition: all 0.3s ease;
}

.upload-box:active {
  transform: scale(0.98);
}

.avatar-box {
  border-radius: 20rpx;
}

.background-box {
  border-radius: 12rpx;
}

.upload-image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 48rpx;
  font-weight: 300;
  color: #999;
  margin-bottom: 8rpx;
}

.upload-text {
  font-size: 20rpx;
  color: #999;
  text-align: center;
}

.upload-label {
  font-size: 24rpx;
  color: #666;
  margin-top: 16rpx;
  text-align: center;
}

/* 输入框 */
.form-input {
  width: 100%;
  height: 88rpx;
  border-radius: 12rpx;
  background-color: #f8f8f8;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.form-input:focus {
  background-color: #fff;
  border-color: #333;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  border-radius: 12rpx;
  background-color: #f8f8f8;
  padding: 24rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  line-height: 1.6;
}

.form-textarea:focus {
  background-color: #fff;
  border-color: #333;
}

.form-count {
  position: absolute;
  right: 24rpx;
  bottom: 16rpx;
  font-size: 24rpx;
  color: #999;
}

/* 提交按钮 */
.btn-container {
  margin: 40rpx 20rpx;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, #333 0%, #555 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.submit-btn[disabled] {
  background: #ccc;
  color: #999;
  box-shadow: none;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .upload-row {
    gap: 20rpx;
  }
  
  .upload-box {
    height: 140rpx;
  }
  
  .upload-icon {
    font-size: 40rpx;
  }
  
  .upload-text {
    font-size: 18rpx;
  }
}
</style> 