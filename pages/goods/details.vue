<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-box df" :style="{'padding-top': statusBarHeight + 'px', 'background': 'rgba(255,255,255,'+ navbarTrans +')'}">
      <view class="nav-back df" :style="{'height': titleBarHeight + 'px'}" @tap="navBack">
        <image src="/static/img/back.png" style="width:34rpx;height:34rpx"></image>
      </view>
      <view v-if="navbarTrans == 1" class="nav-title ohto">{{goodsInfo.name}}</view>
    </view>
    
    <!-- 商品轮播图 -->
    <view class="images-box df">
      <swiper class="images-swiper" circular autoplay @change="imagesSwiper" data-type="1">
        <swiper-item v-for="(item, index) in goodsInfo.imgs" :key="index" :data-idx="index" data-type="1" @tap="imgParamTap">
          <lazy-image :src="item"></lazy-image>
        </swiper-item>
      </swiper>
      
      <!-- 轮播指示器 -->
      <view v-if="goodsInfo.imgs.length" class="indicator">
        <view v-for="(v, index) in goodsInfo.imgs" :key="index" 
              :class="['indicator-item', imgIdx == index && 'act']"
              :style="{'width': 100 / goodsInfo.imgs.length + '%'}">
        </view>
      </view>
    </view>
    
    <!-- 商品信息 -->
    <view class="info-box">
      <!-- 标签 -->
      <view class="tags">
        <view v-for="(tag, index) in goodsInfo.tags" :key="index" class="tag-item">{{tag}}</view>
      </view>
      
      <view class="title">{{goodsInfo.name}}</view>
      <view class="desc">{{goodsInfo.intro}}</view>
      
      <view class="price">
        <money :price="goodsInfo.product[productIdx].price"></money>
        <view v-if="goodsInfo.product[productIdx].line_price" class="price-line" style="text-decoration:line-through">
          ¥{{goodsInfo.product[productIdx].line_price}}
        </view>
        <view class="price-line">
          {{goodsInfo.buy ? goodsInfo.buy + "人已买" : goodsInfo.cart + goodsInfo.browse + "人想买"}}
        </view>
      </view>
    </view>
    
    <!-- 商品规格选择 -->
    <view class="content">
      <view class="content-title">规格</view>
      <scroll-view scroll-x="true">
        <view class="specs-scroll">
          <view v-for="(item, index) in goodsInfo.product" :key="index" 
                class="specs-item" 
                :style="{'border-color': productIdx == index ? '#000' : '#f8f8f8'}"
                @tap="() => productIdx = index">
            <view class="fd df" :data-idx="index" data-type="2" @tap.stop="imgParamTap">
              <image src="/static/img/fd.png" style="width:22rpx;height:22rpx"></image>
            </view>
            <image class="img" :src="item.img" mode="aspectFill"></image>
            <view class="name">
              <view>{{item.name}}</view>
              <view style="margin-top:10rpx">¥ {{item.price}}</view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 数量选择 -->
    <view class="content">
      <view class="content-title">数量</view>
      <view class="quantity-box df">
        <view class="quantity-btn" 
              :style="{'color': quantity > 1 ? '#000' : '#ccc'}" 
              @tap="quantityBtn" 
              data-type="0">－</view>
        <input @blur="quantityBtn" 
               data-type="2" 
               type="number" 
               maxlength="4" 
               v-model="quantity" />
        <view class="quantity-btn" 
              :style="{'color': quantity < goodsInfo.product[productIdx].stock ? '#000' : '#ccc'}" 
              @tap="quantityBtn" 
              data-type="1">＋</view>
      </view>
    </view>
    
    <!-- 评价和商品详情 -->
    <view class="content">
      <view class="content-title">商品详情</view>
      
      <!-- 评价区域 -->
      <view v-if="goodsInfo.comment > 0" class="evaluate df" @tap="toEvaluate">
        <view>评价（{{goodsInfo.comment}}）</view>
        <view class="df">
          <!-- 用户头像 -->
          <view v-if="goodsInfo.comment_user.length > 0" class="cu-img-group">
            <view v-for="(img, index) in goodsInfo.comment_user" :key="index" class="cu-img">
              <image :src="img" mode="aspectFill"></image>
            </view>
          </view>
          <image class="effect" src="/static/img/y.png"></image>
        </view>
      </view>
      
      <!-- 商品详情 -->
      <rich-text :nodes="goodsInfo.details"></rich-text>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="footer-box bUp df">
      <view class="footer-item df">
        <!-- 客服按钮 -->
        <button class="icon-box df"
                open-type="contact"
                :send-message-title="goodsInfo.name"
                :send-message-path="'/pages/goods/details?id=' + goodsInfo.id"
                :send-message-img="goodsInfo.imgs[0]"
                :show-message-card="true">
          <image src="/static/img/kf.png"></image>
          <text>客服</text>
        </button>
        
        <!-- 购物车按钮 -->
        <button class="icon-box df" @tap="toCart">
          <image src="/static/img/gwc1.png"></image>
          <text>购物车</text>
          <view v-if="goodsInfo.cart_count" class="badge">
            {{goodsInfo.cart_count > 99 ? '99+' : goodsInfo.cart_count}}
          </view>
        </button>
        
        <!-- 购买按钮区域 -->
        <view v-if="goodsInfo.type == 2" class="btn df">
          <view @tap="taobaoClick" class="bg1 df" style="width:100%;justify-content:center">
            <image src="/static/img/tb.png" style="width:40rpx;height:40rpx"></image>
            <text style="margin-left:10rpx">复制优惠链接</text>
          </view>
        </view>
        <view v-else class="btn df">
          <view @tap="addCartClick">加入购物车</view>
          <view @tap="buyNowClick" :class="['bg1', goodsInfo.product[productIdx].stock <= 0 && 'bg2']">
            {{goodsInfo.product[productIdx].stock <= 0 ? '暂无库存' : '立即购买'}}
          </view>
        </view>
      </view>
    </view>
    
    <!-- 提示弹窗 -->
    <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
      <view class="tips-box df">
        <view class="tips-item">{{tipsTitle}}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import lazyImage from '@/components/lazyImage/lazyImage.vue'
import money from '@/components/money/money.vue'

const app = getApp()

export default {
  components: {
    lazyImage,
    money
  },
  data() {
    return {
      statusBarHeight: app.globalData.statusBarHeight || 20,
      titleBarHeight: app.globalData.titleBarHeight || 44,
      navbarTrans: 0,
      goodsInfo: {
        id: 1,
        name: "智能手表",
        intro: "支持心率监测、睡眠监测、消息提醒等多种功能",
        imgs: [
          "/static/img/avatar.png",
          "/static/img/avatar.png",
          "/static/img/avatar.png"
        ],
        details: "<p>这是一款功能强大的智能手表，支持心率监测、睡眠监测、消息提醒等多种功能。</p>",
        buy: 1250,
        view: 3560,
        cart: 80,
        comment: 35,
        tags: ["新品", "热卖", "质保"],
        comment_user: [
          "/static/img/avatar.png",
          "/static/img/avatar.png",
          "/static/img/avatar.png"
        ],
        product: [
          {
            id: 101,
            name: "黑色标准版",
            img: "/static/img/avatar.png",
            price: "299.00",
            line_price: "399.00",
            stock: 120
          },
          {
            id: 102,
            name: "白色标准版",
            img: "/static/img/avatar.png",
            price: "299.00",
            line_price: "399.00",
            stock: 85
          },
          {
            id: 103,
            name: "蓝色豪华版",
            img: "/static/img/avatar.png",
            price: "399.00",
            line_price: "499.00",
            stock: 0
          }
        ],
        cart_count: 2,
        type: 1
      },
      imgIdx: 0,
      productIdx: 0,
      quantity: 1,
      tipsTitle: ""
    }
  },
  onLoad(options) {
    // 设置分享菜单 - 仅在小程序环境中有效
    // #ifdef MP
    uni.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    // #endif
    
    // 获取系统信息
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 20;
    this.titleBarHeight = 44;
    
    // 如果有商品ID则加载商品详情
    if (options.id && options.id > 0) {
      this.goodsInfo.id = options.id;
      // 实际应用中这里应该调用接口
    }
  },
  methods: {
    // 添加到购物车
    addCartClick() {
      this.goodsInfo.cart_count = parseInt(this.goodsInfo.cart_count) + 1;
      this.opTipsPopup("共 " + this.quantity + " 件商品已经为您加入购物车 🎉");
      app.globalData.isCenterPage = true;
    },
    
    // 立即购买
    buyNowClick() {
      if(this.goodsInfo.product[this.productIdx].stock > 0) {
        uni.navigateTo({
          url: "/pages/order/settlement?type=1&pid=" + this.goodsInfo.product[this.productIdx].id + "&quantity=" + this.quantity
        });
      } else {
        this.opTipsPopup("该款式已售罄暂时无法购买，请稍后重试！");
      }
    },
    
    // 数量选择
    quantityBtn(e) {
      let type = e.currentTarget.dataset.type;
      
      if(type == 0 && parseInt(this.quantity) <= 1) return;
      
      if(parseInt(this.quantity) > this.goodsInfo.product[this.productIdx].stock) {
        this.quantity = this.goodsInfo.product[this.productIdx].stock;
        this.opTipsPopup("该款式最多可购买 " + this.quantity + " 件！");
      } else if(this.goodsInfo.product[this.productIdx].stock && this.quantity && this.quantity != 0) {
        if(type == 0) {
          this.quantity = parseInt(this.quantity) - 1;
        }
        if(type == 1 && parseInt(this.quantity) < this.goodsInfo.product[this.productIdx].stock) {
          this.quantity = parseInt(this.quantity) + 1;
        }
      } else {
        this.quantity = 1;
      }
    },
    
    // 淘宝链接
    taobaoClick() {
      uni.setClipboardData({
        data: "https://example.com/shopping",
        success: function() {
          uni.hideToast();
        }
      });
      this.opTipsPopup("复制成功，打开手机淘宝即可优惠购！");
    },
    
    // 图片点击
    imgParamTap(e) {
      let type = e.currentTarget.dataset.type;
      let idx = e.currentTarget.dataset.idx;
      let current = "";
      let urls = [];
      
      if(type == 1) {
        current = this.goodsInfo.imgs[idx];
        urls = this.goodsInfo.imgs;
      } else {
        current = this.goodsInfo.product[idx].img;
        urls = [current];
      }
      
      uni.previewImage({
        current: current,
        urls: urls
      });
    },
    
    // 轮播图切换
    imagesSwiper(e) {
      this.imgIdx = e.detail.current;
    },
    
    // 进入购物车
    toCart() {
      uni.navigateTo({
        url: "/pages/goods/cart"
      });
    },
    
    // 进入评价页
    toEvaluate() {
      uni.navigateTo({
        url: "/pages/goods/evaluate?id=" + this.goodsInfo.id + "&name=" + this.goodsInfo.name + "&count=" + this.goodsInfo.comment + "&img=" + this.goodsInfo.imgs[0]
      });
    },
    
    // 返回
    navBack() {
      if (getCurrentPages().length > 1) {
        uni.navigateBack();
      } else {
        uni.switchTab({
          url: "/pages/tabbar/shop"
        });
      }
    },
    
    // 显示提示
    opTipsPopup(msg, isBack = false) {
      this.tipsTitle = msg;
      this.$refs.tipsPopup.open();
      
      setTimeout(() => {
        this.$refs.tipsPopup.close();
        if (isBack) {
          setTimeout(() => {
            this.navBack();
          }, 300);
        }
      }, 2000);
    }
  },
  onPageScroll(e) {
    // 计算导航栏透明度 (0-1)
    let t = (e.scrollTop > 150 ? 150 : e.scrollTop) / 150;
    this.navbarTrans = t;
  },
  onShareAppMessage() {
    return {
      title: this.goodsInfo.name,
      imageUrl: this.goodsInfo.imgs[0],
      path: "/pages/goods/details?id=" + this.goodsInfo.id
    };
  },
  onShareTimeline() {
    return {
      title: this.goodsInfo.name,
      imageUrl: this.goodsInfo.imgs[0],
      query: "id=" + this.goodsInfo.id
    };
  }
}
</script>

<style>
.container{padding-bottom:320rpx}
.nav-box{position:fixed;top:0;left:0;width:100%;z-index:99;box-sizing:border-box}
.nav-box .nav-back{padding:0 30rpx;width:34rpx;height:100%}
.nav-box .nav-title{max-width:60%;font-size:32rpx;font-weight:700}
.images-box{width:100%;flex-direction:column;position:relative}
.images-box .images-swiper{width:100%;height:750rpx;background:#f8f8f8}
.images-box .indicator{position:absolute;bottom:30rpx;display:flex;width:375rpx;height:6rpx;background:rgba(255,255,255,.3);border-radius:6rpx}
.indicator .indicator-item{height:6rpx;border-radius:6rpx}
.indicator .act{background:#fff!important}
.info-box{width:calc(100% - 60rpx);padding:30rpx}
.info-box .title{width:100%;color:#000;font-size:36rpx;font-weight:700}
.info-box .desc{margin-top:10rpx;color:#444;font-size:24rpx;font-weight:500}
.info-box .price{margin-top:20rpx;display:flex;align-items:flex-end}
.price .price-line{margin-left:20rpx;color:#999;font-size:22rpx;line-height:22rpx}
.info-box .tags{padding-bottom:10rpx;width:100%;display:flex;flex-wrap:wrap}
.tags .tag-item{margin:0 10rpx 10rpx 0;height:40rpx;padding:0 12rpx;line-height:40rpx;font-size:18rpx;font-weight:500;background:#f8f8f8;border-radius:8rpx}
.content{width:calc(100% - 60rpx);padding:0 30rpx}
.content .content-title{padding:30rpx 0;color:#999;font-size:24rpx;font-weight:700}
.content .specs-scroll{width:100%;display:flex}
.specs-scroll .specs-item{flex-shrink:0;margin-right:20rpx;background:#fff;width:200rpx;border-radius:8rpx;border-width:1px;border-style:solid;position:relative;overflow:hidden}
.specs-item .fd{position:absolute;z-index:1;top:10rpx;right:10rpx;width:48rpx;height:48rpx;justify-content:center;background:rgba(0,0,0,.3);border-radius:50%}
.specs-item .img{width:200rpx;height:200rpx;display:block}
.specs-item .name{width:calc(100% - 40rpx);margin:20rpx;line-height:30rpx;text-align:center;font-size:20rpx;font-weight:500}
.quantity-box{width:240rpx;height:80rpx;line-height:80rpx;border-radius:40rpx;border:1px solid #f5f5f5;font-size:32rpx;font-weight:700;text-align:center}
.quantity-box input{color:#000;width:80rpx;height:80rpx;line-height:80rpx}
.quantity-box .quantity-btn{width:80rpx;height:80rpx;line-height:80rpx}
.evaluate{margin-bottom:30rpx;width:calc(100% - 60rpx);padding:30rpx;font-size:26rpx;font-weight:700;border-radius:8rpx;background:#f8f8f8;justify-content:space-between}
.evaluate image{width:30rpx;height:30rpx}
.cu-img-group{direction:ltr;unicode-bidi:bidi-override;display:inline-block;margin-right:20rpx}
.cu-img-group .cu-img{width:48rpx;height:48rpx;display:inline-flex;position:relative;margin-left:-24rpx;border:4rpx solid #f8f8f8;background:#f5f5f5;vertical-align:middle;border-radius:50%}
.cu-img-group .cu-img image{width:100%;height:100%;border-radius:50%}
.footer-box{position:fixed;left:0;right:0;bottom:0;z-index:99;border-top:1px solid #f8f8f8;background:rgba(255,255,255,.95);box-sizing:border-box}
.footer-box .footer-item{width:calc(100% - 20rpx);padding:30rpx 10rpx;height:100rpx;justify-content:space-between;padding-bottom:max(env(safe-area-inset-bottom),30rpx)}
.footer-item .icon-box{margin:0;width:82rpx!important;height:100rpx;padding:20rpx 0;flex-direction:column;justify-content:space-between;background:transparent;position:relative}
.footer-item .icon-box image{width:42rpx;height:42rpx}
.footer-item .icon-box text{font-size:14rpx;line-height:14rpx;font-weight:700}
.footer-item .icon-box .badge{position:absolute;top:0;right:0;min-width:30rpx;height:30rpx;line-height:30rpx;text-align:center;font-size:18rpx;font-weight:700;color:#fff;background:#000;border-radius:30rpx;border:4rpx solid #fff}
.footer-item .btn{width:calc(100% - 204rpx);padding:0 20rpx;justify-content:space-between}
.footer-item .btn view{width:calc(50% - 15rpx);height:100rpx;line-height:100rpx;text-align:center;font-size:24rpx;font-weight:700;color:#000;background:#fff;border-radius:60rpx;border:1px solid #000}
.footer-item .btn .bg1{color:#fff;background:#000}
.footer-item .btn .bg2{color:#999;background:#f5f5f5;border:1px solid #f5f5f5}
.tips-box{width:100%;padding:30rpx 0;background:#fff;justify-content:center}
.tips-box .tips-item{color:#333;font-size:28rpx;font-weight:700}
.df{display:flex;align-items:center}
.ohto{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style>