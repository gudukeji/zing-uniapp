<template>
  <view class="container">
    <navbar></navbar>
    <view class="content-box" :style="{'margin-top': statusBarHeight + titleBarHeight + 'px'}">
      <emptyPage
        v-if="isEmpty"
        title="暂无收货地址"
        description="可新建地址或使用微信地址"
        buttonText="新建地址"
        @buttonClick="addAddress"
      />
      <block v-else>
        <view v-for="(item, index) in addressList" :key="index" class="list" :data-id="item.id" @tap="currentPages($event)">
          <view class="list-item">
            <view class="name">{{ item.real_name }}</view>
            <view class="mobile">{{ item.phone }}</view>
            <view class="adds">{{ item.province }} {{ item.city }} {{ item.district }}</view>
            <view class="adds">{{ item.detail }}</view>
            <view class="df" style="margin-top:30rpx" :data-idx="index" @tap.stop="defaultAddsClick($event)">
              <image :src="item.is_default == 1 ? '/static/img/c1.png' : '/static/img/c.png'" style="width:28rpx;height:28rpx"></image>
              <text style="margin-left:12rpx;color:#000;font-size:24rpx">设为默认</text>
            </view>
          </view>
          <image class="list-editor" src="/static/img/bj.png" :data-idx="index" @tap.stop="updateAddsClick($event)"></image>
        </view>
      </block>
      <uni-load-more :status="loadStatus"></uni-load-more>
    </view>
    <view class="btn-box">
      <view @tap="popupClick(true)" class="bg1">新建地址</view>
      <!-- #ifdef MP -->
      <view @tap="weixinAddsClick" class="bg2">使用微信地址</view>
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <view v-if="this.$wechat && this.$wechat.isWeixin()" @tap="weixinAddsClick" class="bg2">使用微信地址</view>
      <!-- #endif -->
    </view>
    <uni-popup ref="addsPopup" type="bottom" :safe-area="false" class="r">
      <view class="popup-box">
        <view class="popup-top df">
          <view class="popup-title">
            <view class="t1">{{ id > 0 ? '编辑地址' : '新建地址' }}</view>
            <view class="t2">请仔细核对地址信息后保存</view>
          </view>
          <view class="popup-close df" @tap="popupClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
          </view>
        </view>
        <view class="popup-adds">
          <view class="adds-tit">收货人</view>
          <input class="adds-item" cursor-spacing="20" type="text" placeholder="点击输入名字" placeholder-class="apc" v-model="real_name" />
        </view>
        <view class="popup-adds">
          <view class="adds-tit">手机号码</view>
          <input class="adds-item" cursor-spacing="20" maxlength="11" type="number" placeholder="点击输入手机号" placeholder-class="apc" v-model="phone" />
        </view>
        <view class="popup-adds">
          <view class="adds-tit">地区</view>
          <picker @change="bindPickerChange" :value="valueRegion" mode="multiSelector" @columnchange="bindMultiPickerColumnChange" :range="multiArray">
            <view class="adds-item ohto">
              <text v-if="region[0] !== '省'">{{ region[0] }} {{ region[1] }} {{ region[2] }}</text>
              <text v-else>点击选择</text>
            </view>
          </picker>
        </view>
        <view class="popup-adds">
          <view class="adds-tit">详细地址</view>
          <input class="adds-item" cursor-spacing="20" type="text" placeholder="点击输入详细地址" placeholder-class="apc" v-model="detail" />
        </view>
        <view class="popup-default" @tap="ChangeIsDefault">
          <checkbox-group>
            <checkbox :checked="is_default ? true : false" />
            <text>设置为默认地址</text>
          </checkbox-group>
        </view>
        <view class="popup-btn bg1" @tap="confirmAdds">确认保存</view>
        <view v-if="id > 0" @tap="delAddsClick" class="popup-btn" style="color:#FA5150;height:48rpx;line-height:48rpx">删除</view>
      </view>
    </uni-popup>
    <uni-popup ref="tipsPopup" type="top" mask-background-color="rgba(0, 0, 0, 0)">
      <view class="tips-box df">
        <view class="tips-item">{{ tipsTitle }}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { 
  getAddressList, 
  setAddressDefault, 
  delAddress, 
  editAddress,
  getAddressDetail 
} from '@/api/user.js'
import { getCity } from '@/api/api.js'
import { toLogin } from '@/libs/login.js'
import { mapGetters } from 'vuex'
import navbar from '@/components/navbar/navbar.vue'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
import emptyPage from '@/components/emptyPage/emptyPage.vue'

export default {
  components: {
    navbar,
    uniLoadMore,
    uniPopup,
    emptyPage
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      od: 0,
      id: 0,
      idx: -1,
      addressList: [],
      real_name: '',
      phone: '',
      detail: '',
      is_default: false,
      isEmpty: false,
      loadStatus: 'loading',
      tipsTitle: '',
      
      // 地区选择相关
      region: ['省', '市', '区'],
      valueRegion: [0, 0, 0],
      multiArray: [],
      multiIndex: [0, 0, 0],
      district: [],
      cityId: 0,
      
      // 分页相关
      page: 1,
      limit: 20,
      loading: false,
      loadend: false,
      loadTitle: '加载更多'
    }
  },
  computed: {
    ...mapGetters(['isLogin'])
  },
  onLoad(options) {
    if (this.isLogin) {
      if (options.od) {
        this.od = options.od;
      }
      this.getAddressList(true);
      this.getCityList();
    } else {
      toLogin();
    }
  },
  onShow() {
    if (this.isLogin) {
      this.getAddressList(true);
    }
  },
  methods: {
    // 获取地址列表 - 完全参考 user_address_list 页面
    getAddressList(isPage) {
      let that = this;
      if (isPage) {
        that.loadend = false;
        that.page = 1;
        that.$set(that, 'addressList', []);
      }
      if (that.loading) return;
      if (that.loadend) return;
      
      that.loading = true;
      that.loadTitle = '';
      
      getAddressList({
        page: that.page,
        limit: that.limit
      }).then(res => {
        let list = res.data;
        let loadend = list.length < that.limit;
        
        // 使用SplitArray方法合并数组 - 参考页面的实现
        that.addressList = that.SplitArray(list, that.addressList);
        that.$set(that, 'addressList', that.addressList);
        
        that.isEmpty = that.addressList.length === 0;
        that.loadend = loadend;
        that.loadTitle = loadend ? '我也是有底线的' : '加载更多';
        that.loadStatus = loadend ? 'noMore' : 'more';
        that.page = that.page + 1;
        that.loading = false;
      }).catch(err => {
        that.loading = false;
        that.loadStatus = 'more';
        that.loadTitle = '加载更多';
        // 参考页面不显示错误提示，只是静默处理
      });
    },
    
    // 添加SplitArray工具方法 - 参考页面使用的数组合并方法
    SplitArray(list, arr) {
      if (!Array.isArray(list)) return arr || [];
      if (!Array.isArray(arr)) return list;
      return arr.concat(list);
    },
    
    // 获取城市列表 - 参考 user_address 页面
    getCityList() {
      let that = this;
      getCity().then(res => {
        that.district = res.data;
        that.initialize();
      }).catch(err => {
        console.error('获取城市列表失败:', err);
      });
    },
    
    // 初始化地区选择器 - 参考 user_address 页面
    initialize() {
      let that = this;
      let province = [];
      let city = [];
      let area = [];
      
      if (!that.district || that.district.length === 0) return;
      
      let cityChildren = that.district[0].c || [];
      let areaChildren = cityChildren.length ? (cityChildren[0].c || []) : [];
      
      that.district.forEach((item, i) => {
        province.push(item.n);
        if (item.n === that.region[0]) {
          that.valueRegion[0] = i;
          that.multiIndex[0] = i;
        }
      });
      
      if (that.district[that.valueRegion[0]] && that.district[that.valueRegion[0]].c) {
        that.district[that.valueRegion[0]].c.forEach((item, i) => {
          if (that.region[1] === item.n) {
            that.valueRegion[1] = i;
            that.multiIndex[1] = i;
          }
          city.push(item.n);
        });
      }
      
      if (that.district[that.valueRegion[0]] && 
          that.district[that.valueRegion[0]].c && 
          that.district[that.valueRegion[0]].c[that.valueRegion[1]] && 
          that.district[that.valueRegion[0]].c[that.valueRegion[1]].c) {
        that.district[that.valueRegion[0]].c[that.valueRegion[1]].c.forEach((item, i) => {
          if (that.region[2] === item.n) {
            that.valueRegion[2] = i;
            that.multiIndex[2] = i;
          }
          area.push(item.n);
        });
      }
      
      that.multiArray = [province, city, area];
    },
    
    // 地区选择改变 - 参考 user_address 页面
    bindPickerChange(e) {
      let multiIndex = this.multiIndex;
      let province = this.district[multiIndex[0]] || { c: [] };
      let city = province.c[multiIndex[1]] || { v: 0 };
      let multiArray = this.multiArray;
      let value = e.detail.value;
      
      this.region = [multiArray[0][value[0]], multiArray[1][value[1]], multiArray[2][value[2]]];
      this.cityId = city.v;
      this.valueRegion = [0, 0, 0];
      this.initialize();
    },
    
    // 地区选择列改变 - 参考 user_address 页面
    bindMultiPickerColumnChange(e) {
      let that = this;
      let column = e.detail.column;
      let value = e.detail.value;
      let currentCity = that.district[value] || { c: [] };
      let multiArray = that.multiArray;
      let multiIndex = that.multiIndex;
      
      multiIndex[column] = value;
      
      switch (column) {
        case 0:
          let areaList = currentCity.c[0] || { c: [] };
          multiArray[1] = currentCity.c.map((item) => {
            return item.n;
          });
          multiArray[2] = areaList.c.map((item) => {
            return item.n;
          });
          break;
        case 1:
          let cityList = that.district[multiIndex[0]].c[multiIndex[1]].c || [];
          multiArray[2] = cityList.map((item) => {
            return item.n;
          });
          break;
        case 2:
          break;
      }
      
      that.multiArray = multiArray;
      that.multiIndex = multiIndex;
    },
    
    // 确认添加/编辑地址 - 完全参考 user_address 页面的 formSubmit 方法
    confirmAdds() {
      let that = this;
      
      if (!that.real_name.trim()) return that.Tips({
        title: '请填写收货人姓名'
      });
      if (!that.phone) return that.Tips({
        title: '请填写联系电话'
      });
      if (!/^1(3|4|5|7|8|9|6)\d{9}$/i.test(that.phone)) return that.Tips({
        title: '请输入正确的手机号码'
      });
      if (that.region[0] === '省') return that.Tips({
        title: '请选择所在地区'
      });
      if (!that.detail.trim()) return that.Tips({
        title: '请填写详细地址'
      });
      
      // 完全按照参考页面的参数结构
      let value = {
        id: that.id,
        real_name: that.real_name,
        phone: that.phone,
        address: {
          province: that.region[0],
          city: that.region[1],
          district: that.region[2],
          city_id: that.cityId
        },
        detail: that.detail,
        is_default: that.is_default ? 1 : 0
      };
      
      // 如果是第一个地址，自动设为默认
      if (that.addressList.length === 0) {
        value.is_default = 1;
      }
      
      uni.showLoading({
        title: '保存中',
        mask: true
      });
      
      editAddress(value).then(res => {
        uni.hideLoading();
        
        // 完全参考页面的提示方式
        if (that.id) {
          that.Tips({
            title: '修改成功',
            icon: 'success'
          });
        } else {
          that.Tips({
            title: '添加成功',
            icon: 'success'
          });
        }
        
        setTimeout(function() {
          that.getAddressList(true);
          that.$refs.addsPopup.close();
        }, 1000);
      }).catch(err => {
        uni.hideLoading();
        return that.Tips({
          title: err
        });
      });
    },
    
    // 编辑地址 - 参考 user_address_list 页面
    updateAddsClick(e) {
      let idx = e.currentTarget.dataset.idx;
      let item = this.addressList[idx];
      
      this.idx = idx;
      this.id = item.id;
      this.real_name = item.real_name;
      this.phone = item.phone;
      this.region = [item.province, item.city, item.district];
      this.detail = item.detail;
      this.is_default = item.is_default === 1;
      this.cityId = item.city_id || 0;
      
      this.initialize();
      this.$refs.addsPopup.open();
    },
    
    // 删除地址 - 参考 user_address_list 页面
    delAddsClick() {
      let that = this;
      
      uni.showModal({
        content: '您确定要删除这个收货地址吗？',
        success: function(res) {
          if (res.confirm) {
            delAddress(that.id).then(res => {
              that.Tips({
                title: '删除成功',
                icon: 'success'
              }, function() {
                that.getAddressList(true);
                that.$refs.addsPopup.close();
              });
            }).catch(err => {
              return that.Tips({
                title: err
              });
            });
          }
        }
      });
    },
    
    // 设置默认地址 - 完全参考 user_address_list 页面的 radioChange 方法
    defaultAddsClick(e) {
      let that = this;
      let idx = e.currentTarget.dataset.idx;
      let address = that.addressList[idx];
      
      if (address == undefined) return that.Tips({
        title: '您设置的默认地址不存在!'
      });
      
      setAddressDefault(address.id).then(res => {
        // 完全按照参考页面的方式更新本地数据
        for (let i = 0, len = that.addressList.length; i < len; i++) {
          if (i == idx) that.addressList[i].is_default = true;
          else that.addressList[i].is_default = false;
        }
        that.Tips({
          title: '设置成功',
          icon: 'success'
        }, function() {
          that.$set(that, 'addressList', that.addressList);
        });
      }).catch(err => {
        return that.Tips({
          title: err
        });
      });
    },
    
    // 使用微信地址 - 完全参考 user_address 和 user_address_list 页面
    weixinAddsClick() {
      let that = this;
      
      // #ifdef MP
      // 完全参考 user_address_list 页面的 getWxAddress 方法
      uni.authorize({
        scope: 'scope.address',
        success: function(res) {
          uni.chooseAddress({
            success: function(res) {
              let addressP = {};
              addressP.province = res.provinceName;
              addressP.city = res.cityName;
              addressP.district = res.countyName;
              
              // 完全按照参考页面的参数结构调用 editAddress
              editAddress({
                address: addressP,
                is_default: 1,
                real_name: res.userName,
                post_code: res.postalCode,
                phone: res.telNumber,
                detail: res.detailInfo,
                id: 0,
                type: 1
              }).then(res => {
                that.Tips({
                  title: '添加成功',
                  icon: 'success'
                }, function() {
                  that.getAddressList(true);
                });
              }).catch(err => {
                return that.Tips({
                  title: err
                });
              });
            },
            fail: function(err) {
              if (err.errMsg == 'chooseAddress:cancel') return that.Tips({
                title: '取消选择'
              });
            }
          });
        },
        fail: function(res) {
          uni.showModal({
            title: '您已拒绝导入微信地址权限',
            content: '是否进入权限管理，调整授权？',
            success(res) {
              if (res.confirm) {
                uni.openSetting({
                  success: function(res) {}
                });
              } else if (res.cancel) {
                return that.Tips({
                  title: '已取消！'
                });
              }
            }
          });
        }
      });
      // #endif
      
      // #ifdef H5
      // 完全参考 user_address_list 页面的 getAddress 方法
      if (this.$wechat && this.$wechat.isWeixin()) {
        this.$wechat.openAddress().then(userInfo => {
          editAddress({
            real_name: userInfo.userName,
            phone: userInfo.telNumber,
            address: {
              province: userInfo.provinceName,
              city: userInfo.cityName,
              district: userInfo.countryName
            },
            detail: userInfo.detailInfo,
            post_code: userInfo.postalCode,
            is_default: 1,
            type: 1
          }).then(() => {
                      that.Tips({
            title: '添加成功',
            icon: 'success'
          }, function() {
            that.getAddressList(true);
          });
        }).catch(err => {
          return that.Tips({
            title: err || '添加失败'
          });
        });
        });
      } else {
        that.Tips({
          title: '请在微信中打开'
        });
      }
      // #endif
      
      // #ifdef APP-PLUS
      that.Tips({
        title: 'APP暂不支持微信地址导入'
      });
      // #endif
    },
    
    // 弹窗控制
    popupClick(show) {
      if (show) {
        this.id = 0;
        this.real_name = '';
        this.phone = '';
        this.region = ['省', '市', '区'];
        this.detail = '';
        this.is_default = false;
        this.valueRegion = [0, 0, 0];
        this.multiIndex = [0, 0, 0];
        this.initialize();
        this.$refs.addsPopup.open();
      } else {
        this.$refs.addsPopup.close();
      }
    },
    
    // 选择地址返回
    currentPages(e) {
      let id = e.currentTarget.dataset.id;
      if (this.od && id) {
        var pages = getCurrentPages();
        if (pages.length > 1) {
          pages[pages.length - 2].$vm.addressInfo(id);
        }
        uni.navigateBack();
      }
    },
    
    // 提示弹窗 - 兼容原有方式和参考页面的 $util.Tips 方式
    opTipsPopup(title) {
      let that = this;
      that.tipsTitle = title;
      that.$refs.tipsPopup.open();
      setTimeout(function() {
        that.$refs.tipsPopup.close();
      }, 2000);
    },
    
    // Tips 工具方法 - 替代 $util.Tips
    Tips(options, callback) {
      if (typeof options === 'string') {
        options = { title: options };
      }
      
      if (options.icon === 'success') {
        uni.showToast({
          title: options.title,
          icon: 'success',
          duration: 2000,
          success: function() {
            if (callback && typeof callback === 'function') {
              setTimeout(callback, 2000);
            }
          }
        });
      } else {
        uni.showToast({
          title: options.title,
          icon: 'none',
          duration: 2000,
          success: function() {
            if (callback && typeof callback === 'function') {
              setTimeout(callback, 2000);
            }
          }
        });
      }
    },
    
    // 修改默认地址状态
    ChangeIsDefault() {
      this.is_default = !this.is_default;
    },
    
    // 获取单个地址详情 - 参考 user_address 页面
    getUserAddress() {
      if (!this.id) return false;
      let that = this;
      getAddressDetail(this.id).then(res => {
        let region = [res.data.province, res.data.city, res.data.district];
        that.real_name = res.data.real_name;
        that.phone = res.data.phone;
        that.detail = res.data.detail;
        that.is_default = res.data.is_default;
        that.$set(that, 'region', region);
        that.cityId = res.data.city_id;
      }).catch(err => {
        that.Tips({
          title: err || '获取地址详情失败'
        });
      });
    },

    // 新建地址
    addAddress() {
      this.addsPopupClick(true);
    }
  },
  
  // 触底加载更多
  onReachBottom() {
    this.getAddressList();
  }
}
</script>

<style>
.container {
  width: 100%;
  padding-bottom: 320rpx;
}
.list {
  border-top: 1px solid #f8f8f8;
  width: calc(100% - 60rpx);
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
}
.list .list-editor {
  width: 34rpx;
  height: 34rpx;
}
.list .list-item {
  font-size: 24rpx;
}
.list .list-item .name {
  color: #000;
  font-weight: 700;
}
.list .list-item .mobile {
  margin-top: 20rpx;
  color: #000;
}
.list .list-item .adds {
  color: #999;
}
.btn-box {
  position: fixed;
  z-index: 99;
  left: 30rpx;
  right: 30rpx;
  bottom: 60rpx;
  width: calc(100% - 60rpx);
}
.btn-box view {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  border-radius: 100rpx;
  border: 1px solid #000;
}
.bg1 {
  color: #fff;
  background: #000;
}
.bg2 {
  margin-top: 30rpx;
  color: #000;
  background: #fff;
}
.popup-box {
  width: calc(100% - 40rpx);
  padding: 20rpx;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  position: relative;
  overflow: hidden;
}
.popup-box .popup-top {
  width: calc(100% - 20rpx);
  padding: 10rpx;
  justify-content: space-between;
}
.popup-top .popup-title .t1 {
  font-size: 38rpx;
  font-weight: 700;
}
.popup-top .popup-title .t2 {
  color: #999;
  font-size: 20rpx;
  font-weight: 300;
}
.popup-top .popup-close {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f8f8f8;
  justify-content: center;
  transform: rotate(45deg);
}
.popup-box .popup-btn {
  margin: 40rpx 10rpx;
  width: calc(100% - 20rpx);
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  border-radius: 100rpx;
}
.popup-adds .adds-tit {
  padding: 30rpx 10rpx 0;
  color: #999;
  font-size: 20rpx;
  font-weight: 500;
}
.popup-adds .adds-item {
  width: calc(100% - 20rpx);
  margin: 0 10rpx;
  height: 70rpx;
  line-height: 70rpx;
  color: #000;
  font-size: 28rpx;
  font-weight: 700;
}
.popup-default {
  padding: 30rpx 10rpx;
  display: flex;
  align-items: center;
}
.popup-default checkbox-group {
  display: flex;
  align-items: center;
}
.popup-default checkbox {
  margin-right: 15rpx;
}
.popup-default text {
  font-size: 28rpx;
  color: #000;
}
.apc {
  color: #000;
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
.ohto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tips-box {
  padding: 20rpx 30rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12rpx;
  justify-content: center;
}
.tips-box .tips-item {
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}
.df {
  display: flex;
  align-items: center;
  }
</style> 