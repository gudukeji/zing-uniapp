<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar bfw" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="bar-box df" :style="{'height': titleBarHeight + 'px', 'width': '100%'}">
        <view class="bar-back df" @tap="navBack">
          <image src="/static/img/back.png" style="width:34rpx;height:34rpx"></image>
        </view>
        <view class="bar-title ohto">活动</view>
      </view>
      <view class="nav-box df">
        <view v-for="(item, index) in barList" :key="index" class="nav-item df" @tap="barClick" :data-idx="index">
          <text :style="{'color': index == barIdx ? '#000' : '#999', 'font-size': index == barIdx ? '28rpx' : '26rpx'}">{{item}}</text>
          <view :style="{'opacity': index == barIdx ? 1 : 0}" class="nav-line"></view>
        </view>
      </view>
    </view>
    <view class="content-box" :style="{'margin-top': 'calc(' + (statusBarHeight + titleBarHeight) + 'px + 90rpx)'}">
      <view class="heio" :style="{'height': isThrottling || loadStatus == 'loading' ? '0px' : '60rpx'}">
        <uni-load-more status="loading"></uni-load-more>
      </view>
      <view v-if="isEmpty" class="empty-box df">
        <image src="/static/img/inset/null.png"/>
        <view class="e1">{{barIdx == 0 ? '暂无推荐活动' : '暂无参加活动'}}</view>
        <view class="e2">空空如也，等待探索</view>
      </view>
      <block v-else>
        <view v-for="(item, index) in list" :key="index" class="activity-item df">
          <view class="activity-img" @tap="toActivityDetails" :data-id="item.id">
            <lazy-image :src="item.img"></lazy-image>
            <view class="activity-state df">{{item.status_str ? item.status_str : "加载中"}}</view>
          </view>
          <view class="activity-data">
            <view class="title ohto" @tap="toActivityDetails" :data-id="item.id">{{item.name ? item.name : "活动名称加载中"}}</view>
            <view class="txt df" @tap="toActivityDetails" :data-id="item.id"><image src="/static/img/sj.png"></image><view class="ohto">{{item.activity_time ? item.activity_time : "活动时间加载中"}}</view></view>
            <view class="txt df" @tap="toActivityDetails" :data-id="item.id"><image src="/static/img/wz.png"></image><view class="ohto">{{item.adds_name ? item.adds_name : "活动地址加载中"}}</view></view>
            <view v-if="item.user_count" class="cu-img-group" @tap="toActivityDetails" :data-id="item.id">
              <view v-for="(img, imgIndex) in item.avatar_list" :key="imgIndex" class="cu-img"><image :src="img" mode="aspectFill"></image></view>
              <view class="cu-tit">{{item.user_count}}人已参加</view>
            </view>
            <view v-else class="cu-txt-group" @tap="toActivityDetails" :data-id="item.id">{{item.browse}}人想参加 </view>
            <view class="activity-btn df">
              <button v-if="barIdx == 0" class="btn-item df w100" @tap="toActivityDetails" :data-id="item.id"><text>{{item.is_join ? '查看详情' : '立即参加'}}</text><image class="effect icon" src="/static/img/z.png"></image></button>
              <block v-else>
                <button class="btn-item df" style="width:60rpx" open-type="contact" :send-message-title="item.name" :send-message-path="'/pages/activity/details?id='+item.id" :send-message-img="item.img" :show-message-card="true">
                  <image class="img" src="/static/img/dh.png"></image>
                </button>
                <block v-if="item.product_status == 1 || item.product_status == 3">
                  <button class="btn-item df w50" @tap="refundClick(true, index)">
                    <text v-if="item.product_status == 1">申请售后</text>
                    <text v-else style="color:#FA5150">售后中</text>
                  </button>
                  <button class="btn-item df w50" @tap="ticketClick(true, index)">
                    <text>出示门票</text>
                  </button>
                </block>
                <block v-else-if="item.product_status == 2">
                  <button class="btn-item df" style="width:60rpx" @tap="delActivity" :data-idx="index">
                    <image class="img" src="/static/img/delete.png"></image>
                  </button>
                  <button class="btn-item df w60" @tap="ticketClick(true, index)">
                    <text>出示门票</text>
                  </button>
                </block>
                <block v-else>
                  <button class="btn-item df" style="width:60rpx" @tap="delActivity" :data-idx="index">
                    <image class="img" src="/static/img/delete.png"></image>
                  </button>
                  <button class="btn-item df w60">
                    <text style="color:#999">报名已取消</text>
                  </button>
                </block>
              </block>
            </view>
          </view>
        </view>
      </block>
      <uni-load-more :status="loadStatus"></uni-load-more>
    </view>
    
    <!-- 售后弹窗 -->
    <uni-popup ref="refundPopup" type="bottom" :safe-area="false" class="r">
      <view class="popup-box">
        <view class="popup-top df">
          <view class="popup-title">
            <view class="t1">"{{list[idx] && list[idx].activity_product_name}}"申请售后</view>
            <view class="t2">提交后您可以联系客服为您及时处理</view>
          </view>
          <view class="popup-close df" @tap="refundClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
          </view>
        </view>
        <view class="df" style="position:relative;margin-top:30rpx">
          <input class="popup-input" type="number" :maxlength="list[idx] && list[idx].quantity" :placeholder="'售后票数（最多'+(list[idx] && list[idx].quantity)+'张）'" v-model="refundQuantity"/>
          <view class="popup-input-tips">张</view>
        </view>
        <textarea class="popup-textarea" auto-height placeholder="售后原因（最多200字）" maxlength="200" v-model="refundReason"></textarea>
        <view v-if="list[idx] && list[idx].product_status == 3" class="popup-tips">注：售后中重新提交将会覆盖之前的售后申请。</view>
        <view class="popup-btn df">
          <view class="bg1" @tap="refundClick(false)">取消</view>
          <view class="bg2" @tap="activityRefund">提交</view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 门票弹窗 -->
    <uni-popup ref="ticketPopup" type="bottom" :safe-area="false" class="r">
      <view class="popup-box">
        <view class="popup-top df">
          <view class="popup-title">
            <view class="t1">{{list[idx] && list[idx].activity_product_name}}，共{{list[idx] && list[idx].quantity}}张</view>
            <view class="t2">长按下方门票号码即可复制</view>
          </view>
          <view class="popup-close df" @tap="ticketClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
          </view>
        </view>
        <view class="popup-scroll">
          <view v-for="(code, codeIndex) in (list[idx] && list[idx].code)" :key="codeIndex" class="popup-item">
            <view :class="['code-item', 'df', list[idx] && list[idx].product_status != 1 && 'item-active']">
              <text user-select="true" class="t1">{{code}}</text>
              <text v-if="list[idx] && list[idx].product_status != 1" class="t2">
                {{list[idx] && list[idx].product_status == 2 ? '（已使用）' : list[idx] && list[idx].product_status == 3 ? '（售后中）' : '（已取消）'}}
              </text>
            </view>
          </view>
        </view>
        <view class="popup-tips">注：门票出示并核销后将无法退款，请谨慎操作</view>
        <view class="popup-btn df" @tap="ticketClick(false)">
          <view class="bg1">取消</view>
          <view class="bg2">完成</view>
        </view>
      </view>
    </uni-popup>
    
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
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'

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
      barList: ["全部", "我的"],
      barIdx: 0,
      list: [],
      idx: 0,
      page: 1,
      isThrottling: true,
      isEmpty: false,
      loadStatus: "loading",
      refundQuantity: "",
      refundReason: "",
      tipsTitle: ""
    }
  },
  onLoad(option) {
    if (option.type) {
      this.barIdx = option.type
    }
    this.activityList()
  },
  methods: {
    activityList() {
      let that = this
      // 模拟API请求
      setTimeout(() => {
        that.isThrottling = true
        that.loadStatus = "more"
        
        // 模拟数据
        let data = {
          data: []
        }
        
        if (that.barIdx == 0) {
          // 全部活动
          data.data = [
            {
              id: 1,
              name: "夏季摄影大赛",
              img: "/static/img/avatar.png",
              activity_time: "2023-07-20 14:00-17:00",
              adds_name: "市中心广场",
              status_str: "报名中",
              is_join: false,
              browse: 123,
              user_count: 10,
              avatar_list: ["/static/img/avatar.png", "/static/img/avatar.png"]
            },
            {
              id: 2,
              name: "手工DIY工作坊",
              img: "/static/img/avatar.png",
              activity_time: "2023-07-25 10:00-12:00",
              adds_name: "文创园区5号楼",
              status_str: "报名中",
              is_join: true,
              browse: 89,
              user_count: 15,
              avatar_list: ["/static/img/avatar.png", "/static/img/avatar.png"]
            }
          ]
        } else {
          // 我的活动
          data.data = [
            {
              id: 2,
              name: "手工DIY工作坊",
              img: "/static/img/avatar.png",
              activity_time: "2023-07-25 10:00-12:00",
              adds_name: "文创园区5号楼",
              status_str: "已报名",
              is_join: true,
              product_status: 1,
              order_id: "ORDER12345",
              activity_product_name: "DIY工作坊标准票",
              quantity: 2,
              code: ["TICKET123456", "TICKET123457"],
              avatar_list: ["/static/img/avatar.png", "/static/img/avatar.png"]
            }
          ]
        }
        
        if (data.data.length > 0) {
          if (that.page == 1) {
            that.list = data.data
          } else {
            that.list = that.list.concat(data.data)
          }
          that.isEmpty = false
        } else if (that.page == 1) {
          that.list = []
          that.isEmpty = true
        }
        
        // 第二页没有数据
        if (that.page > 1) {
          that.loadStatus = "noMore"
        }
      }, 500)
    },
    
    delActivity(e) {
      let that = this
      let idx = e.currentTarget.dataset.idx
      
      uni.showModal({
        content: "确定要永久删除该活动吗？",
        confirmColor: "#FA5150",
        success: function(res) {
          if (res.confirm) {
            // 模拟删除成功
            app.globalData.isCenterPage = true
            that.opTipsPopup("删除成功")
            that.list.splice(idx, 1)
            if (that.list.length <= 0) {
              that.isEmpty = true
              that.loadStatus = "more"
            }
          }
        }
      })
    },
    
    activityRefund() {
      let that = this
      if (!that.refundQuantity || that.refundQuantity < 1) {
        return that.opTipsPopup("请填写需要售后的票数")
      }
      if (!that.refundReason) {
        return that.opTipsPopup("请填写售后原因")
      }
      
      // 模拟售后请求
      setTimeout(() => {
        that.opTipsPopup("售后申请已提交，等待审核")
        that.list[that.idx].product_status = 3
        that.$refs.refundPopup.close()
      }, 500)
    },
    
    barClick(e) {
      if (this.isThrottling) {
        this.isThrottling = false
        let idx = e.currentTarget.dataset.idx
        this.barIdx = idx
        this.page = 1
        this.activityList()
      }
    },
    
    toActivityDetails(e) {
      let id = e.currentTarget.dataset.id
      uni.navigateTo({
        url: "/pages/activity/details?id=" + id
      })
    },
    
    refundClick(show, idx = 0) {
      if (!show) {
        this.$refs.refundPopup.close()
      } else {
        this.idx = idx
        this.$refs.refundPopup.open()
      }
    },
    
    ticketClick(show, idx = 0) {
      if (!show) {
        this.$refs.ticketPopup.close()
      } else {
        this.idx = idx
        this.$refs.ticketPopup.open()
      }
    },
    
    opTipsPopup(msg) {
      let that = this
      that.tipsTitle = msg
      that.$refs.tipsPopup.open()
      setTimeout(function() {
        that.$refs.tipsPopup.close()
      }, 2000)
    },
    
    navBack() {
      if (getCurrentPages().length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({
          url: "/pages/index/index"
        })
      }
    }
  },
  
  onReachBottom() {
    if (this.list.length && this.loadStatus !== 'noMore') {
      this.page = this.page + 1
      this.loadStatus = "loading"
      this.activityList()
    }
  }
}
</script>
<style>
.container{width:100%;}
.nav-bar{position:fixed;top:0;left:0;width:100%;z-index:99;box-sizing:border-box;}
.bar-box .bar-back{padding:0 30rpx;width:34rpx;height:100%;}
.bar-box .bar-title{max-width:60%;font-size:32rpx;font-weight:700;}
.nav-box{width:100%;height:80rpx;}
.nav-box .nav-item{padding:0 30rpx;height:100%;flex-direction:column;justify-content:center;position:relative;}
.nav-box .nav-item text{font-weight:700;transition:all .3s ease-in-out;}
.nav-box .nav-line{position:absolute;bottom:12rpx;width:18rpx;height:6rpx;border-radius:6rpx;background:#000;transition:opacity .3s ease-in-out;}
.content-box{width:100%;}
.content-box .activity-item{width:calc(100% - 60rpx);margin:30rpx;}
.activity-item .activity-img{width:275rpx;height:220rpx;border-radius:8rpx;background:#f8f8f8;position:relative;overflow:hidden;}
.activity-img .activity-state{position:absolute;top:15rpx;left:15rpx;width:68rpx;height:38rpx;color:#fff;font-size:16rpx;font-weight:700;background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.16);border-radius:8rpx;justify-content:center;}
.activity-item .activity-data{padding-left:20rpx;width:calc(100% - 295rpx);height:220rpx;display:flex;flex-direction:column;justify-content:space-between;position:relative;}
.activity-data .title{font-size:28rpx;line-height:28rpx;font-weight:700;padding-bottom:12rpx;}
.activity-data .txt{margin-bottom:4rpx;}
.activity-data .txt image{margin-right:8rpx;width:20rpx;height:20rpx;}
.activity-data .txt view{width:calc(100% - 26rpx);color:#999;font-size:20rpx;font-weight:500;}
.activity-data .cu-img-group{margin:8rpx 0 16rpx 16rpx;direction:ltr;unicode-bidi:bidi-override;display:inline-block;}
.cu-img-group .cu-img{width:32rpx;height:32rpx;display:inline-flex;position:relative;margin-left:-16rpx;border:2rpx solid #fff;background:#eee;vertical-align:middle;border-radius:8rpx;border-radius:50%;}
.cu-img-group .cu-img image{width:100%;height:100%;border-radius:8rpx;border-radius:50%;}
.cu-img-group .cu-tit{display:inline-flex;margin-left:8rpx;color:#999;font-size:20rpx;font-weight:500;}
.activity-data .cu-txt-group{margin:8rpx 0 16rpx;font-size:20rpx;font-weight:500;}
.activity-data .activity-btn{width:100%;height:60rpx;justify-content:space-between;}
.activity-btn .btn-item{padding:0;margin:0;height:60rpx;font-size:20rpx;font-weight:700;color:#000;background:#f8f8f8;border-radius:8rpx;justify-content:center;}
.activity-btn .btn-item .icon{margin-left:10rpx;width:20rpx;height:20rpx;}
.activity-btn .btn-item .img{width:24rpx;height:24rpx;}
.w100{width:100%;}
.w50{width:calc(50% - 40rpx);}
.w60{width:calc(100% - 140rpx);}
.popup-box{width:calc(100% - 60rpx);padding:30rpx;background:#fff;border-radius:30rpx 30rpx 0 0;padding-bottom:max(env(safe-area-inset-bottom),30rpx);position:relative;}
.popup-box .popup-top{width:calc(100% - 20rpx);padding:10rpx;justify-content:space-between;}
.popup-top .popup-title .t1{font-size:38rpx;font-weight:700;}
.popup-top .popup-title .t2{color:#999;font-size:20rpx;font-weight:300;}
.popup-top .popup-close{width:48rpx;height:48rpx;border-radius:50%;background:#f8f8f8;justify-content:center;transform:rotate(45deg);}
.popup-box .popup-input,.popup-box .popup-textarea{width:calc(100% - 40rpx);padding:20rpx;border-radius:8rpx;background:#f8f8f8;font-size:24rpx;font-weight:700;}
.popup-box .popup-textarea{margin-top:30rpx;min-height:120rpx;}
.popup-box .popup-input-tips{position:absolute;right:20rpx;color:#999;font-size:24rpx;font-weight:700;}
.popup-box .popup-scroll{width:100%;max-height:50vh;overflow-y:scroll;}
.popup-box .popup-item{margin-top:30rpx;width:calc(100% - 4px);border:2px dashed #f5f5f5;border-radius:16rpx;}
.popup-item .code-item{margin:2px;width:calc(100% - 4px);height:90rpx;justify-content:center;background:#f8f8f8;border-radius:12rpx;}
.popup-item .item-active{color:#ccc;}
.popup-item .code-item .t1{font-size:32rpx;font-weight:bolder;letter-spacing:4rpx;}
.popup-item .code-item .t2{font-size:26rpx;font-weight:300;}
.popup-box .popup-tips{width:100%;margin-top:40rpx;color:#999;font-size:20rpx;text-align:center;}
.popup-box .popup-btn{margin-top:40rpx;width:100%;justify-content:space-between;}
.popup-box .popup-btn view{width:calc(50% - 10rpx);height:90rpx;line-height:90rpx;text-align:center;font-size:24rpx;font-weight:700;border-radius:30rpx;}
.popup-box .popup-btn .bg1{color:#999;background:#f8f8f8;}
.popup-box .popup-btn .bg2{color:#fff;background:#000;}
.tips-box{padding:20rpx 30rpx;border-radius:12rpx;justify-content:center;}
.tips-box .tips-item{color:#fff;font-size:28rpx;font-weight:700;}
.empty-box{flex-direction:column;align-items:center;justify-content:center;padding:100rpx 0;}
.empty-box image{width:200rpx;height:200rpx;margin-bottom:30rpx;}
.empty-box .e1{font-size:28rpx;font-weight:bold;margin-bottom:10rpx;}
.empty-box .e2{font-size:24rpx;color:#999;}
.heio{width:100%;overflow:hidden;transition:height 0.3s;}
.ohto{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bfw{background:#fff;}
.df{display:flex;align-items:center;}
</style> 