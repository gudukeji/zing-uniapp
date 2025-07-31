<template>
  <view class="container">
    <!-- 自定义顶部导航 -->
    <view class="nav-box df" :style="{'padding-top': statusBarHeight + 'px', 'background': 'rgba(255, 255, 255,' + navbarTrans + ')'}">
      <view class="nav-back df" :style="{'height': titleBarHeight + 'px'}" @tap="navBack">
        <image :class="navbarTrans != 1 ? '' : 'xwb'" :src="navbarTrans == 1 ? '/static/img/z.png' : '/static/img/z1.png'"></image>
      </view>
      <view v-if="navbarTrans == 1" class="nav-title ohto">{{activityInfo.name}}</view>
    </view>

    <!-- 轮播图 -->
    <swiper class="swiper-box" circular @change="swiperChange">
      <swiper-item v-for="(item, index) in activityInfo.imgs" :key="index" class="swiper-item" @tap="swiperClick" :data-i="index">
        <lazy-image :src="item"></lazy-image>
      </swiper-item>
    </swiper>
    <view class="indicator df">
      <block v-if="activityInfo.imgs.length > 1">
        <view v-for="(item, index) in activityInfo.imgs.length" :key="index" :class="['indicator-item', swiperIdx == index ? 'active' : '']"></view>
      </block>
    </view>

    <!-- 内容区域 -->
    <view class="content-box">
      <view class="content-bar df" :style="{'top': statusBarHeight + titleBarHeight - 1 + 'px'}">
        <view class="df" style="height:100%;margin-left:15rpx">
          <view v-for="(item, index) in barList" :key="index" class="bar-nav df" @tap="barClick" :data-idx="index">
            <text :style="{'color': index == barIdx ? '#000' : '#999', 'font-size': index == barIdx ? '28rpx' : '26rpx'}">{{item}}</text>
            <view :style="{'opacity': index == barIdx ? 1 : 0}" class="line"></view>
          </view>
        </view>
        <view class="df" style="margin-right:30rpx">
          <view :class="['bar-btn', 'df', activityInfo.status == 1 ? 's1' : '', activityInfo.status == 2 ? 's2' : '']">
            <text style="margin-left:0">{{activityInfo.status_str}}</text>
          </view>
          <view class="bar-btn df" @tap="openActivityNote" style="margin:0 15rpx">
            <image class="avatar" :src="userAvatar" mode="aspectFill"></image>
            <text>＋笔记</text>
          </view>
          <view class="bar-btn df" @tap="shareClick(true)">
            <image class="icon" src="/static/img/fx1.png"></image>
            <text>分享</text>
          </view>
        </view>
      </view>

      <!-- 详情内容 -->
      <view v-if="barIdx == 0" class="content-item">
        <view v-if="activityInfo.is_join" class="joins-box df" @tap="navigateToFun" data-url="activity/index?type=1">
          <view class="txt df">
            <image class="avatar" :src="userAvatar" mode="aspectFill"></image>
            <text>您已参加该活动，前往查看门票</text>
          </view>
          <view class="arr effect df">
            <image src="/static/img/arrow.png"></image>
          </view>
        </view>
        <view class="info-map">
          <image class="bg" src="/static/img/inset/map.jpg" mode="aspectFill" style="z-index:-2"></image>
          <view class="mk"></view>
          <view class="info-item" @tap="openLocationClick">
            <view class="info-item-tit"> 地点：<text user-select="true">{{activityInfo.adds_name}}</text></view>
            <view class="info-item-tit"> 时间：<text user-select="true">{{activityInfo.activity_time}}</text></view>
            <view class="df" style="justify-content:space-between">
              <view v-if="activityInfo.user_count" class="cu-img-group">
                <view v-for="(img, index) in activityInfo.avatar_list" :key="index" class="img-group">
                  <image :src="img" mode="aspectFill"></image>
                </view>
                <view class="img-tit">{{activityInfo.user_count}}人已参加</view>
              </view>
              <view v-else class="info-item-tit">
                <text>{{activityInfo.browse}}人想参加</text>
              </view>
              <view class="adds-box df">
                <image src="/static/img/hd.png"></image>
              </view>
            </view>
          </view>
        </view>
        <view class="info-title">{{activityInfo.name}}</view>
        <view class="info-intro">
          <rich-text :nodes="activityInfo.intro" @tap="onRichTextTap"></rich-text>
        </view>
      </view>

      <!-- 相关笔记 -->
      <view v-else :class="isWaterfall ? 'dynamic-box' : ''">
        <view v-if="isEmpty" class="empty-box df">
          <image src="/static/img/inset/null.png"/>
          <view class="e1">暂无相关笔记</view>
          <view class="e2">空空如也，等待探索</view>
        </view>
        <waterfall v-if="isWaterfall" :note="list" :page="page"></waterfall>
        <block v-else>
          <block v-for="(item, index) in list" :key="index">
            <card-gg @likeback="likeClick" :item="item" :idx="index"></card-gg>
          </block>
        </block>
        <uni-load-more :status="loadStatus"></uni-load-more>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer-box bfw bUp">
      <view class="btn-box df">
        <view v-if="!isUser" class="btn-item df" @tap="navigateToFun" data-url="center/means" style="width:calc(100% - 120rpx);justify-content:center">
          <text>完善账号资料后即可参加活动，去完善</text>
          <view class="arr effect df" style="margin-left:20rpx">
            <image src="/static/img/y.png"></image>
          </view>
        </view>
        <block v-else>
          <view class="btn-price">
            <view class="df" style="height:48rpx">
              <view class="nian">优惠价</view>
              <money :price="activityInfo.product[productIdx].price"></money>
            </view>
            <view class="through">原价：¥{{activityInfo.product[productIdx].line_price}}</view>
          </view>
          <view class="btn-item df" @tap="registerClick(true)">
            <image class="icon" src="/static/img/hd.png"></image>
            <text>立即参加</text>
          </view>
        </block>
      </view>
    </view>

    <!-- 报名弹窗 -->
    <uni-popup ref="registerPopup" type="bottom" :safe-area="false">
      <view class="popup-box">
        <view class="popup-top df">
          <view class="popup-title">
            <view class="t1">参加活动</view>
            <view class="t2">购买<text>"</text>{{activityInfo.name}}<text>"</text>的门票</view>
          </view>
          <view class="popup-close df" @tap="registerClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"/>
          </view>
        </view>
        <scroll-view scroll-x="true" class="scroll-box">
          <view class="product-box">
            <view v-for="(item, index) in activityInfo.product" :key="index" :class="['product-item', productIdx == index ? 'active' : '']" @tap="productIdx = index">
              <view class="tag">剩余{{item.stock}}张</view>
              <view class="name">{{item.name}}</view>
              <view class="time">报名截止时间：{{activityInfo.start_time}}</view>
              <view style="display:flex;align-items:flex-end">
                <money :price="item.price"></money>
                <view class="td-lt">¥{{item.line_price}}</view>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="quantity-box df">
          <view class="quantity-tit">门票数（人）</view>
          <view class="quantity-item df">
            <view class="quantity-btn" :style="{'color': quantity > 1 ? '#000' : '#ccc'}" @tap="quantityBtn(0)">－ </view>
            <input @blur="quantityBtn(2)" type="number" maxlength="2" :value="quantity" @input="quantity = $event.detail.value"/>
            <view class="quantity-btn" :style="{'color': quantity < activityInfo.product[productIdx].stock ? '#000' : '#ccc'}" @tap="quantityBtn(1)">＋ </view>
          </view>
        </view>
        <view class="quantity-box df">
          <view class="quantity-tit">支付金额</view>
          <money :price="activityInfo.product[productIdx].price * quantity"></money>
        </view>
        <button class="popup-btn df" @tap="wxPayClick">
          <image src="/static/img/pay.png"></image>
          <text>确认支付</text>
        </button>
      </view>
    </uni-popup>

    <!-- 分享弹窗 -->
    <uni-popup ref="sharePopup" class="r">
      <view class="share-popup">
        <image class="share-img" src="/static/img/inset/share.jpg"></image>
        <view class="share-tips">
          <text>点击页面右上角</text>
          <image src="/static/img/xcx.png"></image>
          <text style="margin-left:78rpx">即可转发给朋友、分享到朋友圈、复制链接分享等操作。</text>
        </view>
        <view class="share-btn" @tap="shareClick(false)">确认</view>
      </view>
    </uni-popup>

    <!-- 笔记发布类型弹窗 -->
    <uni-popup ref="notePopup" type="center">
      <view class="note-box">
        <view class="note-add df" @tap="toActivityNote(1)">
          <image src="/static/img/tw.png"></image>
          <text>图文笔记</text>
        </view>
        <view class="note-add df" @tap="toActivityNote(2)">
          <image src="/static/img/sp.png"></image>
          <text>视频笔记</text>
        </view>
        <view class="note-add df" @tap="toActivityNote(3)">
          <image src="/static/img/yw.png"></image>
          <text>音文笔记</text>
        </view>
      </view>
    </uni-popup>

    <!-- 提示弹窗 -->
    <uni-popup ref="tipsPopup" type="top" mask-background-color="rgba(0, 0, 0, 0)">
      <view class="tips-box df">
        <view class="tips-item">{{tipsTitle}}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'
import lazyImage from '@/components/lazyImage/lazyImage.vue'
import money from '@/components/money/money.vue'
import waterfall from '@/components/waterfall/waterfall.vue'
import cardGg from '@/components/card-gg/card-gg.vue'

const app = getApp();

export default {
  components: {
    uniLoadMore,
    lazyImage,
    money,
    waterfall,
    cardGg
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      isUser: false,
      navbarTrans: 0,
      userAvatar: "",
      barList: ["详情", "笔记"],
      barIdx: 0,
      shareView: false,
      activityInfo: {
        id: 0,
        imgs: [],
        name: "名称加载中",
        intro: "介绍加载中",
        activity_time: "时间加载中",
        adds_name: "地址加载中",
        status_str: "加载中",
        start_time: "时间加载中",
        is_join: false,
        user_count: 0,
        browse: 1,
        status: 1,
        product: [{
          name: "名称加载中",
          price: "0.00",
          line_price: "0.00",
          stock: 1
        }]
      },
      productIdx: 0,
      isQuantity: false,
      quantity: 1,
      swiperIdx: 0,
      list: [],
      page: 1,
      isEmpty: false,
      loadStatus: "more",
      tipsTitle: "",
      isWaterfall: false
    };
  },
  async onLoad(option) {
    // 显示分享菜单 - 添加平台兼容性检查
    try {
      // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
      if (typeof uni.showShareMenu === 'function') {
        uni.showShareMenu();
      }
      // #endif
    } catch (e) {
      console.warn('showShareMenu not supported on this platform:', e)
    }

    await this.$onLaunched;

    if (option.id) {
      this.activityInfo.id = option.id;
      this.activityDetails();
      if (option.share) {
        this.shareView = true;
      }
      this.userAvatar = uni.getStorageSync("userInfo").avatar || "/static/img/avatar.png";
    } else {
      this.opTipsPopup("活动异常或已被下架，请稍后重试！", true);
    }
  },
  onShow() {
    const userInfo = uni.getStorageSync("userInfo");
    if (userInfo && userInfo.mobile) {
      this.isUser = true;
    }
  },
  methods: {
    activityDetails() {
      // 模拟API请求获取活动详情
      setTimeout(() => {
        // 模拟数据
        const activityData = {
          id: this.activityInfo.id,
          imgs: ["/static/img/avatar.png", "/static/img/avatar.png"],
          name: "夏季摄影大赛",
          intro: "这是一场摄影爱好者的盛会，将在市中心广场举办。参赛者需携带自己的设备，活动现场将有专业摄影师指导。\n\n获奖者将有机会获得丰厚奖品，作品也将在展览厅展出一个月。\n\n欢迎各位摄影爱好者参加！",
          activity_time: "2023-07-20 14:00-17:00",
          adds_name: "市中心广场",
          status_str: "报名中",
          start_time: "2023-07-19 23:59:59",
          is_join: false,
          user_count: 15,
          browse: 123,
          status: 1,
          lat: "39.908823",
          lng: "116.397470",
          avatar_list: ["/static/img/avatar.png", "/static/img/avatar.png", "/static/img/avatar.png"],
          product: [
            {
              id: 101,
              name: "普通票",
              price: "19.90",
              line_price: "39.90",
              stock: 20
            },
            {
              id: 102,
              name: "VIP票",
              price: "49.90",
              line_price: "99.90",
              stock: 10
            }
          ]
        };
        
        this.activityInfo = activityData;
        
        if (this.shareView) {
          this.shareClick(true);
        }
        
        this.navigationBarColor("#ffffff");
      }, 500);
    },
    
    dynamicRecommend() {
      let that = this;
      that.loadStatus = "loading";
      that.isEmpty = false;
      that.isWaterfall = app.globalData.isWaterfall || false;
      
      // 模拟获取相关笔记
      setTimeout(() => {
        if (that.page == 1) {
          that.list = [
            {
              id: 201,
              uid: 1001,
              user: {
                id: 1001,
                name: "摄影爱好者",
                avatar: "/static/img/avatar.png"
              },
              title: "参加了摄影活动的感受",
              content: "今天参加了一场很棒的摄影活动，学到了很多技巧...",
              imgs: ["/static/img/avatar.png"], 
              like_count: 25,
              comment_count: 8,
              is_like: false
            },
            {
              id: 202,
              uid: 1002,
              user: {
                id: 1002,
                name: "风景摄影师",
                avatar: "/static/img/avatar.png"
              },
              title: "分享几张活动中拍摄的照片",
              content: "这些是我在活动中拍摄的几张照片，欢迎大家点评...",
              imgs: ["/static/img/avatar.png", "/static/img/avatar.png"],
              like_count: 36,
              comment_count: 12,
              is_like: false
            }
          ];
          that.isEmpty = false;
        } else if (that.page == 2) {
          that.list.push({
            id: 203,
            uid: 1003,
            user: {
              id: 1003,
              name: "手机摄影达人",
              avatar: "/static/img/avatar.png"
            },
            title: "用手机也能拍出好照片",
            content: "今天的活动中学到了很多用手机拍出专业效果的技巧...",
            imgs: ["/static/img/avatar.png"],
            like_count: 18,
            comment_count: 5,
            is_like: false
          });
        } else {
          // 没有更多数据
          that.loadStatus = "noMore";
        }
        
        if (that.list.length === 0) {
          that.isEmpty = true;
        }
        
        that.loadStatus = "more";
      }, 500);
    },
    
    wxPayClick() {
      let that = this;
      
      // 模拟支付请求
      uni.showLoading({
        title: '正在支付...'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        
        // 模拟微信支付流程
        uni.showModal({
          title: '支付确认',
          content: '是否确认支付' + (that.activityInfo.product[that.productIdx].price * that.quantity) + '元？',
          success: function(res) {
            if (res.confirm) {
              app.globalData.isCenterPage = true;
              that.$refs.registerPopup.close();
              that.opTipsPopup("购买成功！正在为您出票...");
              
              setTimeout(function() {
                uni.navigateTo({
                  url: "/pages/activity/index?type=1"
                });
              }, 2000);
            }
          }
        });
      }, 500);
    },
    
    barClick(e) {
      this.barIdx = e.currentTarget.dataset.idx;
      if (this.barIdx == 1) {
        this.page = 1;
        this.list = [];
        this.dynamicRecommend();
      }
    },
    
    quantityBtn(t) {
      if (t == 1 && this.quantity < this.activityInfo.product[this.productIdx].stock) {
        this.quantity = parseInt(this.quantity) + 1;
      } else if (t == 0 && this.quantity != 1) {
        this.quantity = parseInt(this.quantity) - 1;
      } else if (t == 2 && this.quantity <= 0) {
        this.quantity = 1;
      } else if (t == 2 && this.quantity > this.activityInfo.product[this.productIdx].stock) {
        this.quantity = this.activityInfo.product[this.productIdx].stock;
      }
    },
    
    swiperClick(e) {
      let i = e.currentTarget.dataset.i;
      uni.previewImage({
        current: i,
        urls: this.activityInfo.imgs
      });
    },
    
    swiperChange(e) {
      this.swiperIdx = e.detail.current;
    },
    
    openLocationClick() {
      // 调用地图查看位置
      uni.openLocation({
        latitude: parseFloat(this.activityInfo.lat),
        longitude: parseFloat(this.activityInfo.lng),
        name: this.activityInfo.adds_name
      });
    },
    
    openActivityNote() {
      this.$refs.notePopup.open();
    },
    
    toActivityNote(type) {
      if (this.activityInfo.is_join) {
        uni.navigateTo({
          url: "/pages/note/add?type=" + type + 
               "&aid=" + this.activityInfo.id + 
               "&aname=" + this.activityInfo.name + 
               "&aimg=" + this.activityInfo.imgs[0]
        });
      } else {
        this.opTipsPopup("未参加该活动无法发布相关笔记！");
      }
    },
    
    registerClick(show) {
      if (!show) {
        this.$refs.registerPopup.close();
        return;
      }
      
      let msg = "活动 " + this.activityInfo.status_str + " 无法参加！";
      if (this.activityInfo.status != 1) {
        return this.opTipsPopup(msg);
      }
      
      this.$refs.registerPopup.open();
    },
    
    shareClick(show) {
      if (!show) {
        this.$refs.sharePopup.close();
      } else {
        this.$refs.sharePopup.open();
      }
    },
    
    likeClick(e) {
      this.list[e.idx].is_like = e.is_like;
      this.list[e.idx].like_count = e.like_count;
    },
    
    onRichTextTap() {
      const intro = this.activityInfo.intro;
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      const imageUrls = [];
      
      let match;
      while ((match = imgRegex.exec(intro)) !== null) {
        imageUrls.push(match[1]);
      }
      
      if (imageUrls.length) {
        uni.previewImage({
          current: 0,
          urls: imageUrls
        });
      }
    },
    
    navigateToFun(e) {
      let url = e.currentTarget.dataset.url;
      uni.navigateTo({
        url: "/pages/" + url
      });
    },
    
    navBack() {
      if (getCurrentPages().length > 1) {
        uni.navigateBack();
      } else {
        uni.switchTab({
          url: "/pages/index/index"
        });
      }
    },
    
    opTipsPopup(title, isNeedBack = false) {
      this.tipsTitle = title;
      this.$refs.tipsPopup.open();
      
      setTimeout(() => {
        this.$refs.tipsPopup.close();
        if (isNeedBack) {
          this.navBack();
        }
      }, 2000);
    },
    
    navigationBarColor(frontColor) {
      uni.setNavigationBarColor({
        frontColor: frontColor,
        backgroundColor: "RGB(255,255,255)",
        animation: {
          duration: 400,
          timingFunc: "easeIn"
        }
      });
    }
  },
  onReachBottom() {
    if (!this.isEmpty && this.list.length && this.barIdx == 1) {
      this.page = this.page + 1;
      this.dynamicRecommend();
    }
  },
  onPageScroll(e) {
    let frontColor = "#ffffff";
    const scrollTop = e.scrollTop > 150 ? 150 : e.scrollTop;
    const opacity = scrollTop / 150;
    
    if (opacity >= 1) {
      frontColor = "#000000";
    }
    
    this.navbarTrans = opacity;
    this.navigationBarColor(frontColor);
  },
  onShareAppMessage() {
    return {
      title: this.activityInfo.name,
      imageUrl: this.activityInfo.imgs[0],
      path: "/pages/activity/details?id=" + this.activityInfo.id + "&share=1"
    };
  },
  onShareTimeline() {
    return {
      title: this.activityInfo.name,
      imageUrl: this.activityInfo.imgs[0],
      query: "id=" + this.activityInfo.id
    };
  }
};
</script>

<style>
.container {
  width: 100%;
  padding-bottom: calc(env(safe-area-inset-bottom) + 160rpx);
}
.nav-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 99;
  box-sizing: border-box;
}
.nav-box .nav-back {
  padding: 0 30rpx;
  width: 34rpx;
  height: 100%;
}
.nav-box .nav-back image {
  width: 34rpx;
  height: 34rpx;
}
.nav-box .nav-title {
  max-width: 60%;
  font-size: 32rpx;
  font-weight: 700;
}
.swiper-box {
  z-index: -1;
  width: 100%;
  height: auto;
  aspect-ratio: 5/4;
  overflow: hidden;
}
.swiper-box .swiper-item {
  width: 100%;
  height: 100%;
}
.indicator {
  margin-top: -68rpx;
  width: 100%;
  justify-content: center;
}
.indicator .indicator-item {
  z-index: 1;
  margin: 0 6rpx;
  width: 8rpx;
  height: 8rpx;
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}
.indicator .active {
  width: 24rpx;
  background: rgba(255, 255, 255, 0.9);
}
.arr {
  width: 44rpx;
  height: 44rpx;
  background: #fff;
  border-radius: 50%;
  justify-content: center;
}
.arr image {
  width: 20rpx;
  height: 20rpx;
}
.content-box {
  width: 100%;
  padding-top: 30rpx;
}
.content-box .content-bar {
  position: -webkit-sticky;
  position: sticky;
  left: 0;
  z-index: 99;
  width: 100%;
  height: 100rpx;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  justify-content: space-between;
}
.content-bar .bar-nav {
  padding: 0 15rpx;
  height: 80rpx;
  flex-direction: column;
  justify-content: center;
  position: relative;
}
.content-bar .bar-nav text {
  font-weight: 700;
  transition: all 0.3s ease-in-out;
}
.content-bar .bar-nav .line {
  position: absolute;
  bottom: 12rpx;
  width: 18rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #000;
  transition: opacity 0.3s ease-in-out;
}
.content-bar .bar-btn {
  padding: 0 16rpx;
  height: 50rpx;
  line-height: 50rpx;
  border-radius: 8rpx;
  background: #fff;
  border: 1px solid #f5f5f5;
}
.bar-btn text {
  margin-left: 8rpx;
  font-size: 20rpx;
  font-weight: 700;
}
.bar-btn .avatar {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
}
.bar-btn .icon {
  width: 20rpx;
  height: 20rpx;
}
.content-bar .s1 {
  color: #fa5150;
  background: rgba(250, 81, 80, 0.082);
  border: 1px solid #FA515015;
}
.content-bar .s2 {
  color: #000;
  background: rgba(0, 0, 0, 0.082);
  border: 1px solid #000;
}
.content-box .content-item {
  width: calc(100% - 60rpx);
  padding: 0 30rpx;
}
.content-box .dynamic-box {
  width: calc(100% - 16rpx);
  padding: 0 8rpx;
}
.content-box .joins-box {
  margin-bottom: 30rpx;
  width: calc(100% - 60rpx);
  padding: 30rpx;
  background: #000;
  border-radius: 8rpx;
  justify-content: space-between;
}
.content-box .joins-box .txt {
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
}
.content-box .joins-box .txt image {
  margin-right: 8rpx;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
}
.content-box .info-map {
  width: calc(100% - 2px);
  border-radius: 8rpx;
  border: 1px solid #f5f5f5;
  position: relative;
  overflow: hidden;
}
.content-box .info-map .bg, .content-box .info-map .mk {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.content-box .info-map .mk {
  z-index: -1;
  background-image: linear-gradient(45deg, #fff, rgba(255, 255, 255, 0.6));
}
.content-box .info-item {
  width: calc(100% - 60rpx);
  padding: 30rpx;
  font-weight: 700;
}
.info-item .info-item-tit {
  color: #999;
  font-size: 24rpx;
  margin-bottom: 8rpx;
}
.info-item .info-item-tit text {
  color: #000;
}
.info-item .adds-box {
  width: 44rpx;
  height: 44rpx;
  justify-content: center;
  border-radius: 22rpx 22rpx 4rpx;
  box-shadow: 5px 5px 5px -4px rgba(0, 0, 0, 0.1);
  background: #000;
  transform: rotate(45deg);
}
.info-item .adds-box image {
  width: 24rpx;
  height: 24rpx;
  transform: rotate(-45deg);
}
.info-item .cu-img-group {
  margin-left: 16rpx;
  direction: ltr;
  unicode-bidi: bidi-override;
  display: inline-block;
}
.cu-img-group .img-group {
  width: 32rpx;
  height: 32rpx;
  display: inline-flex;
  position: relative;
  margin-left: -16rpx;
  border: 2rpx solid #f8f8f8;
  background: #eee;
  vertical-align: middle;
  border-radius: 8rpx;
  border-radius: 50%;
}
.cu-img-group .img-group image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
  border-radius: 50%;
}
.cu-img-group .img-tit {
  display: inline-flex;
  margin-left: 8rpx;
  color: #999;
  font-size: 20rpx;
}
.content-box .info-title {
  margin: 30rpx 0;
  width: 100%;
  font-size: 32rpx;
  font-weight: 700;
}
.content-box .info-intro {
  width: 100%;
  color: #333;
  font-size: 26rpx;
  font-weight: 400;
  word-break: break-word;
  white-space: pre-line;
}
.footer-box {
  position: fixed;
  z-index: 99;
  left: 0;
  bottom: 0;
  width: calc(100% - 60rpx);
  padding: 30rpx;
  border-top: 1px solid #f8f8f8;
  padding-bottom: max(env(safe-area-inset-bottom), 30rpx);
}
.btn-box {
  width: 100%;
  justify-content: space-between;
}
.btn-box .btn-price {
  height: 100rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.btn-price .nian {
  margin-right: 6rpx;
  font-size: 20rpx;
  font-weight: 700;
}
.btn-price .through {
  color: #999;
  font-size: 20rpx;
  text-decoration: line-through;
}
.btn-box .btn-item {
  padding: 0 60rpx;
  height: 100rpx;
  font-size: 24rpx;
  color: #fff;
  font-weight: 700;
  background: #000;
  border-radius: 100rpx;
}
.btn-box .btn-means {
  padding: 0 30rpx;
  height: 90rpx;
  font-size: 20rpx;
  font-weight: 700;
  background: #f5f5f5;
  border-radius: 100rpx;
}
.btn-box .btn-means image {
  margin-right: 12rpx;
  width: 20rpx;
  height: 20rpx;
}
.btn-box .btn-item .icon {
  margin-right: 12rpx;
  width: 32rpx;
  height: 32rpx;
}
.popup-box {
  width: calc(100% - 60rpx);
  padding: 30rpx;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding-bottom: max(env(safe-area-inset-bottom), 60rpx);
  position: relative;
}
.popup-box .popup-top {
  width: 100%;
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
  margin: 60rpx 0 30rpx;
  width: 100%;
  height: 100rpx;
  font-size: 24rpx;
  color: #fff;
  font-weight: 700;
  background: #000;
  border-radius: 100rpx;
  justify-content: center;
}
.popup-box .popup-btn image {
  margin-right: 12rpx;
  width: 32rpx;
  height: 32rpx;
}
.scroll-box {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
}
.popup-box .product-box {
  width: 100%;
  padding: 46rpx 0 30rpx;
  display: flex;
}
.product-box .product-item {
  flex-shrink: 0;
  margin-right: 20rpx;
  padding: 36rpx 20rpx 20rpx;
  border-radius: 8rpx;
  background: #f8f8f8;
  border: 1px solid #f8f8f8;
  position: relative;
}
.product-box .active {
  background: #fff;
  border: 1px solid #000;
}
.product-item .tag {
  position: absolute;
  top: -16rpx;
  left: -1px;
  padding: 0 16rpx;
  height: 32rpx;
  line-height: 32rpx;
  text-align: center;
  font-size: 18rpx;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(to right, #000, #555);
  border-radius: 24rpx 32rpx 32rpx 0rpx;
}
.product-item .name {
  font-size: 24rpx;
  line-height: 24rpx;
  font-weight: 500;
}
.product-item .time {
  margin: 15rpx 0;
  font-weight: 300;
  font-size: 20rpx;
  line-height: 20rpx;
}
.product-item .td-lt {
  margin-left: 15rpx;
  color: #999;
  font-size: 20rpx;
  line-height: 20rpx;
  text-decoration: line-through;
}
.popup-box .quantity-box {
  padding: 30rpx 0;
  width: 100%;
  justify-content: space-between;
  border-top: 1px solid #f8f8f8;
}
.quantity-box .quantity-tit {
  font-size: 24rpx;
}
.quantity-box .quantity-item {
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 32rpx;
  border: 1px solid #f5f5f5;
  font-size: 24rpx;
  font-weight: 700;
  text-align: center;
}
.quantity-item input {
  width: 48rpx;
  height: 64rpx;
  line-height: 64rpx;
  color: #000;
}
.quantity-item .quantity-btn {
  width: 64rpx;
  height: 64rpx;
  line-height: 64rpx;
}
.share-popup {
  background: #fff;
  border-radius: 30rpx;
  padding: 30rpx;
  overflow: hidden;
}
.share-popup .share-img {
  width: 473rpx;
  height: 237.5rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
  display: block;
}
.share-popup .share-tips {
  margin: 30rpx 0;
  width: 473rpx;
  font-size: 26rpx;
  line-height: 48rpx;
  position: relative;
}
.share-popup .share-tips image {
  position: absolute;
  top: 0;
  width: 48rpx;
  height: 48rpx;
  margin: 0 15rpx;
}
.share-popup .share-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
  background: #000;
  border-radius: 16rpx;
}
.note-box {
  padding: 15rpx;
  background: #fff;
  border-radius: 30rpx;
}
.note-box .note-add {
  margin: 30rpx;
  width: 400rpx;
  height: 90rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
  background: #000;
  border-radius: 45rpx;
  justify-content: center;
}
.note-box .note-add image {
  margin-right: 10rpx;
  width: 40rpx;
  height: 40rpx;
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
  padding: 20rpx 30rpx;
  border-radius: 12rpx;
  justify-content: center;
}
.tips-box .tips-item {
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}
.xwb {
  filter: brightness(0);
}
.df {
  display: flex;
  align-items: center;
}
.bfw {
  background: #fff;
}
.bUp {
  box-shadow: 0 -2px 5px 0 rgba(0, 0, 0, 0.05);
}
.ohto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.effect {
  transition: all 0.3s ease-in-out;
}
</style> 