<template>
  <view class="container">
<!--    <navbar :bg="1"></navbar> -->
    <view class="title-box">
      <view>设置 ⚙️</view>
    </view>
    
    <!-- 用户信息区域 -->
    <view class="table">个人信息</view>
    <view class="list-box">
      <button class="list df" data-url="center/means" @tap="navigateToFun">
        <image class="icon" src="/static/img/setting/1.png"></image>
        <view class="list-item df bb1">
          <view class="title">个人资料</view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>
      
      <button class="list df">
        <image class="icon" src="/static/img/setting/2.png"></image>
        <view class="list-item df bb1">
          <view class="title">手机号码</view>
          <!-- #ifdef MP-WEIXIN -->
          <button class="input-btn" open-type="getPhoneNumber" @getphonenumber="getphonenumber" v-if="!userInfo.phone">
            <text class="right-text">点击绑定手机号</text>
            <image src="/static/img/x.png"></image>
          </button>
          <!-- #endif -->

          <!-- #ifdef MP-QQ -->
          <navigator url="/pages/users/user_phone/index" hover-class="none" class="input-btn" v-if="!userInfo.phone">
            <text class="right-text">点击绑定手机号</text>
            <image src="/static/img/x.png"></image>
          </navigator>
          <!-- #endif -->

          <!-- #ifdef H5 || APP-PLUS -->
          <navigator url="/pages/users/user_phone/index" hover-class="none" class="input-btn" v-if="!userInfo.phone">
            <text class="right-text">点击绑定手机号</text>
            <image src="/static/img/x.png"></image>
          </navigator>
          <!-- #endif -->
          <view class="right-area" v-else>
            <text class="right-text">{{userInfo.phone}}</text>
            <text class="iconfont icon-suozi"></text>
            <image src="/static/img/x.png"></image>
          </view>
        </view>
      </button>
        
      <!-- #ifdef H5 -->
      <button class="list df" data-url="users/user_pwd_edit/index" @tap="navigateToFun" v-if="userInfo.phone && !isWeixinEnv()">
        <image class="icon" src="/static/img/setting/4.png"></image>
        <view class="list-item df bb1">
          <view class="title">密码</view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>
      <!-- #endif -->

      <!-- #ifdef APP-PLUS -->
      <button class="list df" data-url="users/user_pwd_edit/index" @tap="navigateToFun" v-if="userInfo.phone">
        <image class="icon" src="/static/img/setting/4.png"></image>
        <view class="list-item df bb1">
          <view class="title">密码</view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>
      <!-- #endif -->

      <button class="list df" data-url="users/user_phone/index?type=1" @tap="navigateToFun" v-if="userInfo.phone">
        <image class="icon" src="/static/img/setting/5.png"></image>
        <view class="list-item df">
          <view class="title">更换手机号码</view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>
    </view>
    
    <!-- 账号切换区域 -->
    <view class="wrapper" v-if="switchUserInfo.length > 1">
      <view class='title'>账号切换</view>
      <view class='wrapList'>
        <view class='item' :class='index==userIndex?"on":""' v-for="(item,index) in switchUserInfo" :key='index' @tap="switchAccounts(index)">
          <view class='picTxt acea-row row-between-wrapper'>
            <view class='pictrue acea-row row-center-wrapper'>
              <image :src='item.avatar' mode=""></image>
            </view>
            <view class='text'>
              <view class='name line1'>{{item.nickname}}</view>
              <view class='phone'>{{item.phone}}</view>
            </view>
          </view>
          <view class='bnt acea-row row-center-wrapper' v-if='index!=userIndex'>切换</view>
          <view class='currentBnt acea-row row-center-wrapper' v-else>当前</view>
        </view>
      </view>
    </view>
    
    <view class="table">账号管理</view>
    <view class="list-box">
      <button class="list df" data-url="center/address" @tap="navigateToFun">
        <image class="icon" src="/static/img/setting/102.png"></image>
        <view class="list-item df bb1">
          <view class="title">收货地址</view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>

      <button class="list df" data-url="setting/realname" @tap="navigateToFun">
        <image class="icon" src="/static/img/setting/8.png"></image>
        <view class="list-item df bb1">
          <view class="title">实名认证</view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>

      <button class="list df" data-url="center/invoice" @tap="navigateToFun" v-if="userInfo.invioce_func">
        <image class="icon" src="/static/img/setting/103.png"></image>
        <view class="list-item df bb1">
          <view class="title">发票管理</view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>

      <button class="list df" data-url="setting/logout" @tap="navigateToFun">
        <image class="icon" src="/static/img/setting/104.png"></image>
        <view class="list-item df">
          <view class="title">注销账号</view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>
    </view>
    
    <view class="table">通用</view>
    <view class="list-box">
      <!-- 语言切换 -->
      <view class="list df" v-if="langArray.length > 0">
        <image class="icon" src="/static/img/setting/6.png"></image>
        <view class="list-item df bb1">
          <view class="title">语言切换</view>
          <picker @change="bindPickerChange" range-key="name" :value="langIndex" :range="langArray">
            <view class="right-area">
              <text class="right-text">{{langArray[langIndex] ? langArray[langIndex].name : '中文'}}</text>
              <image src="/static/img/x.png"></image>
            </view>
          </picker>
        </view>
      </view>

      <button class="list df" open-type="contact">
        <image class="icon" src="/static/img/setting/1.png"></image>
        <view class="list-item df bb1">
          <view class="title">在线客服</view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>

      <!-- #ifdef APP-PLUS -->
      <button class="list df" data-url="setting/privacy" @tap="navigateToFun">
        <image class="icon" src="/static/img/setting/101.png"></image>
        <view class="list-item df bb1">
          <view class="title">隐私与显示设置</view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>
      <!-- #endif -->

      <!-- #ifndef APP-PLUS -->
      <button class="list df" data-url="setting/privacy" @tap="navigateToFun">
        <image class="icon" src="/static/img/setting/101.png"></image>
        <view class="list-item df">
          <view class="title">隐私与显示设置</view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>
      <!-- #endif -->
      
      <!-- #ifdef APP-PLUS -->
      <view class="list df" @click="initData">
        <image class="icon" src="/static/img/setting/2.png"></image>
        <view class="list-item df bb1">
          <view class="title">缓存大小</view>
          <view class="right-area">
            <text class="right-text">{{fileSizeString}}</text>
            <image src="/static/img/x.png"></image>
          </view>
        </view>
      </view>

      <view class="list df" @click="updateApp">
        <image class="icon" src="/static/img/setting/3.png"></image>
        <view class="list-item df bb1">
          <view class="title">当前版本</view>
          <view class="right-area">
            <text class="right-text">{{version}}</text>
            <image src="/static/img/x.png"></image>
          </view>
        </view>
      </view>
      <!-- #endif -->
      
    </view>
    
    <view class="table">关于</view>
    <view class="list-box">
      <button class="list df" data-url="setting/xinxuan?type=3" @tap="navigateToFun">
        <image class="icon" src="/static/img/setting/6.png"></image>
        <view class="list-item df bb1">
          <view class="title">隐私政策</view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>

      <button class="list df" data-url="setting/xinxuan?type=4" @tap="navigateToFun">
        <image class="icon" src="/static/img/setting/7.png"></image>
        <view class="list-item df">
          <view class="title">用户协议</view>
          <image src="/static/img/x.png"></image>
        </view>
      </button>
      
    </view>
    
    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <button class="logout-btn" @click="outLogin">
        <image class="logout-icon" src="/static/img/setting/5.png"></image>
        <text class="logout-text">退出登录</text>
      </button>
    </view>
    
    <!-- #ifdef APP-PLUS -->
    <app-update ref="appUpdate" :force="true" :tabbar="false" :getVer='true' @isNew="isNew"></app-update>
    <!-- #endif -->
  </view>
</template>

<script>
import navbar from '@/components/navbar/navbar.vue'
import {
  getUserInfo,
  getLogout,
  mpBindingPhone,
  getLangList,
  getLangJson
} from '@/api/user.js'
import {
  switchH5Login,
  siteConfig
} from '@/api/api.js';
import {
  toLogin
} from '@/libs/login.js';
import {
  mapGetters
} from "vuex";
// 引入 Pinia stores
import { useUserStore } from '@/stores/user.js'
import { useAppStore } from '@/stores/app.js'
// #ifdef MP
import Routine from '@/libs/routine';
// #endif
// #ifdef H5
import wechat from '@/libs/wechat.js';
// #endif
import Cache from '@/utils/cache';
import colors from '@/mixins/color.js';
import i18n from '@/utils/lang.js';
// #ifdef APP-PLUS
import appUpdate from "@/components/update/app-update.vue";
// #endif

const app = getApp()

export default {
  components: {
    navbar,
    // #ifdef APP-PLUS
    appUpdate
    // #endif
  },
  mixins: [colors],
  // #ifdef H5
  beforeCreate() {
    this.$wechat = wechat;
  },
  // #endif
  data() {
    return {
      statusBarHeight: 0,
      titleBarHeight: 0,
      appBq: [],
      userInfo: {}, // 用户信息
      fileSizeString: '', // 缓存大小
      version: '', // 版本号
      loginType: 'h5', // 登录类型
      userIndex: 0, // 当前账号索引
      switchUserInfo: [], // 账号切换列表

      // 语言切换相关
      langArray: [], // 可用语言列表
      langIndex: 0, // 当前语言索引

      // Pinia stores
      userStore: useUserStore(),
      appStore: useAppStore(),

    }
  },
  computed: mapGetters(['isLogin']),
  watch: {
    isLogin: {
      handler: function(newV, oldV) {
        if (newV) {
          this.getUserInfo();
        }
      },
      deep: true
    }
  },
  onLoad() {
    let that = this
    
    // 初始化状态栏高度
    // #ifdef MP-WEIXIN || MP-QQ || MP-TOUTIAO
    that.statusBarHeight = app.globalData?.statusBarHeight || uni.getSystemInfoSync().statusBarHeight || 20
    that.titleBarHeight = app.globalData?.titleBarHeight || 44
    // #endif
    
    // #ifdef H5 || APP-PLUS
    that.statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20
    that.titleBarHeight = 44
    // #endif
    
    // 检查登录状态
    if (this.isLogin) {
      // 尝试从API获取数据
      that.getConfigData()
      that.getUserInfo()
      that.getLangList() // 获取语言列表

      // #ifdef APP-PLUS
      that.formatSize()
      // 获取版本号
      plus.runtime.getProperty(plus.runtime.appid, (inf) => {
        that.version = inf.version;
      });
      // #endif
    } else {
      toLogin();
    }
  },
  onUnload() {
    // 页面卸载
  },
  onShow() {
    // 页面显示时可以重新获取用户信息
  },
  methods: {
    // 获取用户信息 (参考用户页面)
    getUserInfo: function() {
      let that = this;
      
      // 检查登录状态
      if (!this.isLogin) {
        console.log('用户未登录');
        that.showToast('请先登录');
        return;
      }
      
      // 检查token
      const token = this.$store.state.app.token;
      console.log('当前token:', token);
      
      if (!token) {
        console.log('没有token');
        that.showToast('登录已过期，请重新登录');
        return;
      }
      
      getUserInfo().then(res => {
        console.log('getUserInfo success:', res);
        that.$set(that, 'userInfo', res.data);
        
        // 处理账号切换相关数据
        let switchUserInfo = res.data.switchUserInfo || [];
        for (let i = 0; i < switchUserInfo.length; i++) {
          if (switchUserInfo[i].uid == that.userInfo.uid) that.userIndex = i;
          // 切割h5用户；user_type状态：h5、routine（小程序）、wechat（公众号）；注：只有h5未注册手机号时，h5才可和小程序或是公众号数据想通；
          //#ifdef H5
          if (
            !that.$wechat.isWeixin() &&
            switchUserInfo[i].user_type != "h5" &&
            switchUserInfo[i].phone === ""
          )
            switchUserInfo.splice(i, 1);
          //#endif
        }
        that.$set(that, "switchUserInfo", switchUserInfo);
      }).catch(err => {
        console.error('获取用户信息失败:', err);
        // 显示具体的错误信息
        that.showToast('获取用户信息失败: ' + (err.msg || err.message || '网络错误'));
      });
    },
    
    // 获取配置数据
    getConfigData() {
      let that = this
      
      // 使用导入的siteConfig API获取配置
      siteConfig().then(res => {
        if (res.code == 200) {
          if (res.data.app_xcx) {
            app.globalData.appXx = res.data.app_xcx
          }
          if (res.data.app_bq) {
            app.globalData.appBq = res.data.app_bq
            that.appBq = res.data.app_bq
            that.appBq[4] = that.appBq[4] ? that.appBq[4] : "https://example.com"
          }
          if (res.data.upload_type) {
            app.globalData.uploadType = res.data.upload_type
          }
        } else {
          console.warn('获取配置数据失败，使用默认配置')
        }
      }).catch((err) => {
        console.warn('获取配置数据失败:', err)
      })
    },
    
    
    // 账号切换功能
    switchAccounts: function(index) {
      let userInfo = this.switchUserInfo[index],
          that = this;
      that.userIndex = index;
      if (that.switchUserInfo.length <= 1) return true;
      if (userInfo === undefined) return that.showToast('切换的账号不存在');
      
      if (userInfo.user_type === 'h5') {
        uni.showLoading({
          title: '正在切换中'
        });
        // 使用switchH5Login API进行账号切换
        switchH5Login().then(res => {
          uni.hideLoading();
          that.$store.commit("LOGIN", {
            'token': res.data.token,
            'time': Cache.strTotime(res.data.expires_time) - Cache.time()
          });
          that.getUserInfo();
        }).catch(err => {
          uni.hideLoading();
          return that.showToast(err);
        })
      } else {
        that.$store.commit("LOGOUT");
        uni.showLoading({
          title: '正在切换中'
        });
        toLogin();
      }
    },
    
    // 导航到指定页面
    navigateToFun(e) {
      let url = "/pages/" + e.currentTarget.dataset.url
      uni.navigateTo({
        url: url
      })
    },
    
    // 退出登录
    outLogin: function() {
      let that = this;
      uni.showModal({
        title: '提示',
        content: '确认退出登录？',
        success: function(res) {
          if (res.confirm) {
            uni.showLoading({
              title: '正在退出...',
              mask: true
            });

            getLogout()
              .then(res => {
                that.performLogout();
              })
              .catch(err => {
                console.warn('服务端登出失败，继续执行本地登出:', err);
                // 即使接口失败也要清除本地状态
                that.performLogout();
              });
          }
        }
      });
    },

    // 执行登出操作
    performLogout() {
      try {
        // 1. 清理 Pinia 状态（包含完整的存储清理）
        if (this.userStore && this.userStore.logout) {
          this.userStore.logout();
          console.log('Pinia 登出完成');
        }

        // 2. 清理 Vuex 状态
        this.$store.commit("LOGOUT");
        console.log('Vuex 登出完成');

        // 3. 额外清理一些可能遗漏的存储
        const additionalKeys = [
          'pinia_user',
          'pinia_app',
          'authIng',
          'user_cancel_agreement',
          'APP_STATE'
        ];

        additionalKeys.forEach(key => {
          try {
            uni.removeStorageSync(key);
          } catch (e) {
            console.warn(`清理额外存储 ${key} 失败:`, e);
          }
        });

        uni.hideLoading();

        // 4. 跳转到首页
        uni.reLaunch({
          url: '/pages/index/index'
        });

        console.log('登出流程完成');

      } catch (error) {
        console.error('登出过程中发生错误:', error);
        uni.hideLoading();

        // 即使出错也要跳转
        uni.reLaunch({
          url: '/pages/index/index'
        });
      }
    },
    
    // #ifdef APP-PLUS
    // 获取缓存大小
    formatSize() {
      let that = this;
      plus.cache.calculate(function(size) {
        let sizeCache = parseInt(size);
        if (sizeCache == 0) {
          that.fileSizeString = "0B";
        } else if (sizeCache < 1024) {
          that.fileSizeString = sizeCache + "B";
        } else if (sizeCache < 1048576) {
          that.fileSizeString = (sizeCache / 1024).toFixed(2) + "KB";
        } else if (sizeCache < 1073741824) {
          that.fileSizeString = (sizeCache / 1048576).toFixed(2) + "MB";
        } else {
          that.fileSizeString = (sizeCache / 1073741824).toFixed(2) + "GB";
        }
      });
    },
    
    // 清理缓存
    initData() {
      uni.showModal({
        title: '清除缓存',
        content: '确定清楚本地缓存数据吗？',
        success: (res) => {
          if (res.confirm) {
            this.clearCache()
            this.formatSize()
          }
        }
      });
    },
    
    // 执行清理缓存
    clearCache() {
      let that = this;
      let os = plus.os.name;
      if (os == 'Android') {
        let main = plus.android.runtimeMainActivity();
        let sdRoot = main.getCacheDir();
        let files = plus.android.invoke(sdRoot, "listFiles");
        let len = files.length;
        for (let i = 0; i < len; i++) {
          let filePath = '' + files[i];
          plus.io.resolveLocalFileSystemURL(filePath, function(entry) {
            if (entry.isDirectory) {
              entry.removeRecursively(function(entry) {
                uni.showToast({
                  title: '缓存清理完成',
                  duration: 2000
                });
                that.formatSize();
              }, function(e) {
                console.log(e.message)
              });
            } else {
              entry.remove();
            }
          }, function(e) {});
        }
      } else {
        plus.cache.clear(function() {
          uni.showToast({
            title: '缓存清理完成',
            duration: 2000
          });
          that.formatSize();
        });
      }
    },
    
    // 检查更新
    updateApp() {
      // #ifdef APP-PLUS
      console.log('updateApp 方法被调用 - APP环境');
      console.log('appUpdate 组件引用:', this.$refs.appUpdate);

      if (!this.$refs.appUpdate) {
        console.error('appUpdate 组件引用不存在');
        uni.showToast({
          title: '更新组件未找到',
          icon: 'none'
        });
        return;
      }

      if (typeof this.$refs.appUpdate.update !== 'function') {
        console.error('appUpdate.update 方法不存在');
        console.log('appUpdate 组件方法列表:', Object.keys(this.$refs.appUpdate));
        uni.showToast({
          title: '更新方法不存在',
          icon: 'none'
        });
        return;
      }

      try {
        this.$refs.appUpdate.update();
        console.log('调用 appUpdate.update() 成功');
      } catch (error) {
        console.error('调用 appUpdate.update() 失败:', error);
        uni.showToast({
          title: '更新检查失败: ' + error.message,
          icon: 'none'
        });
      }
      // #endif

      // #ifndef APP-PLUS
      console.log('updateApp 方法被调用 - 非APP环境');
      uni.showToast({
        title: '仅在APP中支持版本更新',
        icon: 'none'
      });
      // #endif
    },
    
    // 检查是否为最新版本的回调
    isNew() {
      this.showToast({
        title: '当前为最新版本'
      });
    },
    // #endif
    
    // 微信小程序获取手机号
    getphonenumber(e) {
      if (e.detail.errMsg == 'getPhoneNumber:ok') {
        Routine.getCode()
          .then(code => {
            let data = {
              code,
              iv: e.detail.iv,
              encryptedData: e.detail.encryptedData,
            }
            mpBindingPhone(data).then(res => {
              this.getUserInfo()
              this.showToast({
                title: res.msg,
                icon: 'success'
              });
            }).catch(err => {
              return this.showToast(err);
            })
          })
          .catch(error => {
            uni.hideLoading();
          });
      }
    },
    
    // #ifdef H5
    isWeixinEnv() {
      return this.$wechat && this.$wechat.isWeixin();
    },
    // #endif
    
    // #ifndef H5
    isWeixinEnv() {
      return false;
    },
    // #endif
    
    // 获取语言列表
    getLangList() {
      const that = this;
      getLangList().then(res => {
        that.langArray = res.data || [];
        that.setCurrentLang();
      }).catch(err => {
        console.error('获取语言列表失败:', err);
      });
    },

    // 设置当前语言索引 - 使用Vue3兼容的方式
    setCurrentLang() {
      this.langArray.map((item, i) => {
        // Vue3中使用全局i18n实例获取当前语言
        if (i18n.global.locale.value == item.value) {
          this.langIndex = i;
        }
      });
    },

    // 语言切换事件处理 - 使用Vue3兼容的方式
    bindPickerChange(e) {
      this.langIndex = e.detail.value;
      const selectedLang = this.langArray[this.langIndex].value;

      Cache.set('locale', selectedLang);
      getLangJson().then(res => {
        uni.setStorageSync('localeJson', res.data);

        // Vue3中使用全局i18n实例进行语言设置
        if (res.data[selectedLang]) {
          i18n.global.setLocaleMessage(selectedLang, res.data[selectedLang]);
          i18n.global.locale.value = selectedLang;
        }

        this.$nextTick(() => {
          // #ifdef APP-PLUS
          // APP端需要强制更新页面以确保语言切换生效
          this.$forceUpdate();
          // #endif

          this.showToast('语言切换成功');
        });
      });
    },

    // 通用提示函数
    showToast(options) {
      if (typeof options === 'string') {
        uni.showToast({
          title: options,
          icon: 'none',
          duration: 2000
        });
      } else {
        const { title, icon = 'none', success } = options;
        uni.showToast({
          title: title,
          icon: icon,
          duration: 2000,
          success: success
        });
      }
    }
  }
}
</script>

<style>
page {
  background: #f8f8f8;
  padding: 0 30rpx;
  box-sizing: border-box;
  overflow-x: hidden;
}

.container {
  background: #f8f8f8;
  min-height: 100vh;
  /* 底部安全区域适配 */
  padding-bottom: env(safe-area-inset-bottom, 0rpx);
  padding-bottom: constant(safe-area-inset-bottom, 0rpx);
  box-sizing: border-box;
}

.title-box {
	padding: 20rpx 0;
	font-size: 40rpx;
	font-weight: bold;
}

.table {
	padding: 30rpx 0;
	color: #999;
	font-size: 24rpx;
	font-weight: 500;
}

.list-box {
  width: 100%;
  border-radius: 24rpx;
  overflow: hidden;
  box-sizing: border-box; 
}

.list-box .list {
	margin: 0;
	padding: 0;
	width: 100%;
	background: #fff!important;
	border-radius: 0;
}

.list-box .list:last-child {
	border-bottom: none;
}

.list-box .list .icon {
	margin: 0 30rpx;
	width: 38rpx;
	height: 38rpx;
}

.list-box .list-item {
	width: calc(100% - 98rpx);
	padding: 28rpx 28rpx 28rpx 0;
	justify-content: space-between;
}

.list-box .list-item .title {
	font-size: 24rpx;
	font-weight: 500;
}

/* 右侧内容区域 - 简化样式 */
.list-box .list-item .right-area {
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

/* 右侧文字样式 */
.list-box .list-item .right-text {
	color: #868686;
	font-size: 24rpx;
	margin-right: 10rpx;
}

/* 箭头图标样式 */
.list-box .list-item image {
	width: 24rpx;
	height: 24rpx;
	transform: rotate(-90deg);
}

/* 特殊图标（如锁定图标）样式 */
.list-box .list-item .iconfont {
	font-size: 18rpx;
	color: #ccc;
	margin-right: 10rpx;
}

/* 选择器样式 */
.list-box .list-item picker {
	display: flex;
	justify-content: flex-end;
}

/* 导航器样式 */
navigator.input-btn {
	display: flex !important;
	align-items: center;
	justify-content: flex-end;
	text-decoration: none;
}

/* 按钮样式 */
.input-btn {
	background: transparent !important;
	border: none !important;
	color: #868686 !important;
	font-size: 24rpx !important;
	text-align: right;
	padding: 0 !important;
	margin: 0 !important;
	line-height: normal !important;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.input-btn::after {
	border: none !important;
}

/* 按钮内的文字样式 */
.input-btn .right-text {
	color: #868686;
	font-size: 24rpx;
	margin-right: 10rpx;
}

/* 按钮内的图标样式 */
.input-btn .iconfont {
	font-size: 20rpx;
	color: #ccc;
	margin-right: 10rpx;
}

/* 退出登录按钮样式 */
.logout-section {
  margin-top: 30rpx;
  padding-bottom: 30rpx;
  /* 底部安全区域适配 */
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  padding-bottom: calc(30rpx + constant(safe-area-inset-bottom)); /* iOS < 11.2 兼容 */
}

/* 针对不同平台的安全区域优化 */
/* #ifdef H5 */
.logout-section {
  /* H5端在有底部导航栏的设备上需要额外间距 */
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom, 0rpx));
  padding-bottom: calc(30rpx + constant(safe-area-inset-bottom, 0rpx));
}
/* #endif */

/* #ifdef MP */
.logout-section {
  /* 小程序端通常不需要安全区域处理，但保留基础间距 */
  padding-bottom: 30rpx;
}
/* #endif */

/* #ifdef APP-PLUS */
.logout-section {
  /* APP端需要考虑状态栏和底部安全区域 */
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom, 20rpx));
  padding-bottom: calc(30rpx + constant(safe-area-inset-bottom, 20rpx));
}
/* #endif */

.logout-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 690rpx;
  height: 90rpx;
  border-radius: 45rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
}

.logout-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.4);
}

.logout-btn::after {
  border: none;
}

.logout-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
  filter: brightness(0) invert(1);
}

.logout-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
}

.version {
	padding: 60rpx 0;
	flex-direction: column;
	justify-content: center;
}

.version image {
	margin-right: 10rpx;
	width: 20rpx;
	height: 20rpx;
}

.version text {
	color: #999;
	font-size: 18rpx;
}

.df {
  display: flex;
  align-items: center;
}

.acea-row {
  display: flex;
  flex-direction: row;
}

.row-center-wrapper {
  justify-content: center;
}

.row-between-wrapper {
  justify-content: space-between;
}

.row-middle {
  align-items: center;
}

.bb1 {
  border-bottom: 1px solid #f8f8f8;
}

/* 图标样式 */
.iconfont {
	font-size: 24rpx;
	color: #ccc;
}

.icon-xiangyou::before {
	content: '>';
}

.icon-suozi::before {
	content: '🔒';
}

/* 列表项间距调整 */
.list-box .list:not(:last-child) .list-item {
	border-bottom: 1px solid #f8f8f8;
}

.list-box .list:last-child .list-item {
	border-bottom: none;
}

/* 账号切换样式 */
.wrapper {
  margin: 10rpx 0;
  background-color: #fff;
  padding: 36rpx 30rpx 13rpx 30rpx;
  border-radius: 16rpx;
}

.wrapper .title {
  margin-bottom: 30rpx;
  font-size: 32rpx;
  color: #282828;
  font-weight: bold;
}

.wrapper .wrapList .item {
  width: 690rpx;
  height: 160rpx;
  background-color: #f8f8f8;
  border-radius: 20rpx;
  margin-bottom: 22rpx;
  padding: 0 30rpx;
  position: relative;
  border: 2rpx solid #f8f8f8;
  box-sizing: border-box;
}

.wrapper .wrapList .item.on {
  border-color: var(--view-theme);
  border-radius: 20rpx;
  background-color: #fff9f9;
}

.wrapper .wrapList .item .picTxt {
  width: 445rpx;
}

.wrapper .wrapList .item .picTxt .pictrue {
  width: 96rpx;
  height: 96rpx;
  position: relative;
}

.wrapper .wrapList .item .picTxt .pictrue image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.wrapper .wrapList .item .picTxt .text {
  width: 325rpx;
}

.wrapper .wrapList .item .picTxt .text .name {
  width: 100%;
  font-size: 30rpx;
  color: #282828;
}

.wrapper .wrapList .item .picTxt .text .phone {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.wrapper .wrapList .item .bnt {
  font-size: 24rpx;
  border-radius: 27rpx;
  width: 140rpx;
  height: 54rpx;
  border: 2rpx solid var(--view-theme);
  color: var(--view-theme);
  background-color: #fff;
}

.wrapper .wrapList .item .currentBnt {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 26rpx;
  background-color: rgba(233, 51, 35, 0.1);
  width: 140rpx;
  height: 48rpx;
  border-radius: 0 20rpx 0 20rpx;
  color: var(--view-theme);
}

/* 输入框焦点样式 */
.list-box .list-item .input input:focus {
	color: #333;
}

/* 禁用状态样式 */
.list-box .list-item .input input[disabled] {
	color: #ccc;
}

/* 表单区域样式 */
form {
	margin-bottom: 20rpx;
}


/* 选择器样式 */
picker {
  display: flex;
  justify-content: flex-end;
}

/* 锁定图标样式 */
.icon-suozi {
  font-size: 18rpx !important;
  color: #ccc !important;
  margin-right: 10rpx;
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
  .list-box .list-item .title {
    font-size: 22rpx;
  }

  .list-box .list-item .right-text {
    font-size: 22rpx;
  }

  .input-btn .right-text {
    font-size: 22rpx;
  }
}

/* 针对不同平台的样式适配 */
/* #ifdef MP-WEIXIN */
button {
  background-color: transparent !important;
}
/* #endif */

/* #ifdef H5 */
button::after {
  background-color: transparent;
  border: none;
}
/* #endif */

/* #ifdef APP-PLUS */
button::after {
  border: none;
}
/* #endif */
</style> 