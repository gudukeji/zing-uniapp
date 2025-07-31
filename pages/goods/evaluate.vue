<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-box df" :style="{'padding-top': statusBarHeight + 'px', 'background': 'rgba(255,255,255,'+ navbarTrans +')'}">
      <view class="nav-back df" :style="{'height': titleBarHeight + 'px'}" @tap="navBack">
        <image src="/static/img/back.png" style="width:34rpx;height:34rpx"></image>
      </view>
      <view v-if="navbarTrans == 1" class="nav-title ohto">{{goodsInfo.name}}</view>
    </view>
    
    <!-- 背景遮罩 -->
    <view class="bg-mk"></view>
    <view class="bg-mk2"></view>
    <view class="bg-img">
      <lazy-image :src="goodsInfo.img ? goodsInfo.img : '/static/img/a.jpg'"></lazy-image>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-box" :style="{'margin-top': statusBarHeight + titleBarHeight + 'px'}">
      <!-- 商品信息 -->
      <view class="info-box">
        <view class="name">{{goodsInfo.name}}</view>
        <view class="unm df">
          共<text class="tt">{{goodsInfo.count}}</text>条评论
        </view>
      </view>
      
      <!-- 空评价提示 -->
      <view v-if="isEmpty" class="empty-box df">
        <image src="/static/img/empty.png" />
        <view class="e1">{{goodsInfo.name}} 暂无评论</view>
        <view class="e2">成功购买商品即可发布相关评论</view>
      </view>
      
      <!-- 评价列表 -->
      <block v-else>
        <card-gg v-for="(item, index) in list" :key="index" :item="item" :idx="index" @likeback="likeClick"></card-gg>
      </block>
      
      <!-- 加载更多 -->
      <uni-load-more :status="loadStatus"></uni-load-more>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js'
import * as api from '@/config/api.js'
import lazyImage from '@/components/lazyImage/lazyImage.vue'
import cardGg from '@/components/card-gg/card-gg.vue'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'

const app = getApp()

export default {
  components: {
    lazyImage,
    cardGg,
    uniLoadMore
  },
  data() {
    return {
      statusBarHeight: this.$store.state.statusBarHeight || 20,
      titleBarHeight: this.$store.state.titleBarHeight || 44,
      navbarTrans: 0,
      goodsInfo: {
        id: 0,
        img: "",
        name: "名称加载中",
        count: 0
      },
      list: [],
      page: 1,
      isEmpty: false,
      loadStatus: "loading",
      // Mock数据
      mockGoods: [
        {
          id: 1,
          img: "/static/img/temp/goods1.jpg",
          name: "轻奢真皮小白鞋",
          count: 18
        },
        {
          id: 102,
          img: "/static/img/temp/goods2.jpg",
          name: "夏季薄款T恤",
          count: 24
        },
        {
          id: 103,
          img: "/static/img/temp/goods3.jpg",
          name: "轻便双肩包",
          count: 0
        }
      ],
      mockEvaluates: {
  // 商品101的评价数据
  1: [
    // 多图类型
    {
      id: 1001,
      user: {
        id: 10001,
        name: "樱桃小丸子",
        avatar: "/static/img/avatar.png",
        gender: 0,
        age: "25岁"
      },
      user_id: 10001,
      content: "鞋子真的很好看，质量很棒，穿着很舒服，大小也很合适。物流也很快，包装也很好，没有任何破损。非常满意的一次购物体验！",
      imgs: [
        { url: "/static/img/avatar.png", wide: 800, high: 600 },
        { url: "/static/img/avatar.png", wide: 800, high: 600 }
      ],
      img_count: 2,
      create_time_str: "2023-05-16",
      create_time: "2023-05-16",
      province: "广东",
      browse: 156,
      specs: "白色 39码",
      is_like: false,
      like_count: 12,
      comment_count: 5,
      type: 1,
      adds_name: "广州市天河区",
      lat: 23.12911,
      lng: 113.26627,
      comment: {
        user_name: "店家回复",
        content: "感谢您的支持和喜爱，我们会继续提供优质产品！"
      },
      top: false
    },
    
    // 纯文本类型
    {
      id: 1,
      user: {
        id: 10002,
        name: "阳光男孩",
        avatar: "/static/img/avatar.png",
        gender: 1,
        age: "28岁"
      },
      user_id: 10002,
      content: "非常好的购物体验，鞋子质量很好，做工精细，值得推荐！",
      imgs: [],
      img_count: 0,
      create_time_str: "2023-05-10",
      create_time: "2023-05-10",
      province: "北京",
      browse: 89,
      specs: "黑色 42码",
      is_like: true,
      like_count: 8,
      comment_count: 2,
      type: 0,
      topic_info: [
        { id: 201, name: "真皮鞋推荐" },
        { id: 202, name: "男鞋种草" }
      ],
      top: false
    },
    
    // 单图带商品关联
    {
      id: 1,
      user: {
        id: 10003,
        name: "理性消费者",
        avatar: "/static/img/avatar.png",
        gender: 0,
        age: "30岁"
      },
      user_id: 10003,
      content: "鞋子还行吧，没有图片上看起来那么好，但是价格合适，勉强满意。",
      imgs: [
        { url: "/static/img/avatar.png", wide: 600, high: 800 }
      ],
      img_count: 1,
      create_time_str: "2023-05-05",
      create_time: "2023-05-05",
      province: "浙江",
      browse: 67,
      specs: "白色 40码",
      is_like: false,
      like_count: 3,
      comment_count: 1,
      type: 1,
      order_id: 1001,
      goods: [
        {
          goods_id: 301,
          goods_name: "同款黑色款式",
          product_img: "/static/img/avatar.png"
        }
      ],
      comment: {
        user_name: "店家回复",
        content: "亲爱的顾客，感谢您的反馈。我们会不断改进产品质量，欢迎您再次光临！"
      },
      top: false
    },
    
    // 视频类型
    {
      id: 2,
      user: {
        id: 10004,
        name: "挑剔先生",
        avatar: "/static/img/avatar.png",
        gender: 1,
        age: "32岁"
      },
      user_id: 10004,
      content: "不推荐购买，鞋子质量一般，穿着不太舒服，而且颜色和图片有色差。来个开箱视频大家感受一下。",
      imgs: [],
      img_count: 0,
      create_time_str: "2023-04-28",
      create_time: "2023-04-28",
      province: "江苏",
      browse: 203,
      specs: "黑色 41码",
      is_like: false,
      like_count: 5,
      comment_count: 8,
      type: 2,
      video: {
        cover: "/static/img/avatar.png",
        wide: 720,
        high: 1280
      },
      circle_id: 201,
      circle_name: "品质生活圈",
      circle_avatar: "/static/img/avatar.png",
      comment: {
        user_name: "店家回复",
        content: "尊敬的顾客，非常抱歉给您带来不好的体验。请联系客服，我们会为您提供退换货服务。"
      },
      top: false
    },
    
    // 音频类型
    {
      id: 3,
      user: {
        id: 10005,
        name: "时尚达人",
        avatar: "/static/img/avatar.png",
        gender: 0,
        age: "27岁"
      },
      user_id: 10005,
      content: "款式很时尚，和我想象的一样好看！就是物流有点慢。分享一段我的开箱音频。",
      imgs: [
        { url: "/static/img/avatar.png", wide: 800, high: 600 },
        { url: "/static/img/avatar.png", wide: 600, high: 800 }
      ],
      img_count: 2,
      create_time_str: "2023-04-20",
      create_time: "2023-04-20",
      province: "上海",
      browse: 178,
      specs: "白色 38码",
      is_like: true,
      like_count: 15,
      comment_count: 4,
      type: 3,
      audio: {
        name: "鞋子开箱体验",
        cover: "/static/img/avatar.png",
        intro: "分享一下这款鞋子的穿着感受和搭配建议"
      },
      activity_id: 101,
      activity_name: "夏季潮鞋节",
      activity_img: "/static/img/avatar.png",
      top: true
    }
  ],
  
  // 商品102的评价数据
  1: [
    // 多图类型带话题和位置
    {
      id: 2001,
      user: {
        id: 20001,
        name: "时尚博主",
        avatar: "/static/img/avatar.png",
        gender: 0,
        age: "26岁"
      },
      user_id: 20001,
      content: "面料很舒服，款式也很时尚，穿着很凉爽，夏天穿正好。分享几张实拍图给大家参考！",
      imgs: [
        { url: "/static/img/avatar.png", wide: 800, high: 600 },
        { url: "/static/img/avatar.png", wide: 600, high: 800 },
        { url: "/static/img/avatar.png", wide: 800, high: 600 },
        { url: "/static/img/avatar.png", wide: 800, high: 600 }
      ],
      img_count: 4,
      create_time_str: "2023-06-01",
      create_time: "2023-06-01",
      province: "上海",
      browse: 342,
      specs: "蓝色 L码",
      is_like: true,
      like_count: 23,
      comment_count: 7,
      type: 1,
      adds_name: "上海市浦东新区",
      lat: 31.22114,
      lng: 121.53065,
      topic_info: [
        { id: 203, name: "夏季穿搭" },
        { id: 204, name: "舒适面料" }
      ],
      top: true
    },
    
    // 音频类型
    {
      id: 2002,
      user: {
        id: 20002,
        name: "理性购物者",
        avatar: "/static/img/avatar.png",
        gender: 1,
        age: "31岁"
      },
      user_id: 20002,
      content: "衣服质量一般，但是价格便宜，所以还算满意。建议大家洗的时候小心一点，容易掉色。",
      imgs: [],
      img_count: 0,
      create_time_str: "2023-05-25",
      create_time: "2023-05-25",
      province: "广东",
      browse: 156,
      specs: "白色 M码",
      is_like: false,
      like_count: 4,
      comment_count: 2,
      type: 3,
      audio: {
        name: "购物体验分享",
        cover: "/static/img/avatar.png",
        intro: "详细讲解此T恤的材质和洗涤注意事项"
      },
      top: false
    },
    
    // 单图带商品关联
    {
      id: 2,
      user: {
        id: 20003,
        name: "挑剔女王",
        avatar: "/static/img/avatar.png",
        gender: 0,
        age: "29岁"
      },
      user_id: 20003,
      content: "不喜欢，面料有点粗糙，而且洗了一次就变形了，不推荐购买。",
      imgs: [
        { url: "/static/img/avatar.png", wide: 800, high: 600 }
      ],
      img_count: 1,
      create_time_str: "2023-05-18",
      create_time: "2023-05-18",
      province: "浙江",
      browse: 213,
      specs: "黑色 S码",
      is_like: false,
      like_count: 7,
      comment_count: 3,
      type: 1,
      order_id: 2001,
      goods: [
        {
          goods_id: 302,
          goods_name: "加厚款T恤",
          product_img: "/static/img/avatar.png"
        }
      ],
      adds_name: "杭州市西湖区",
      lat: 30.24271,
      lng: 120.14972,
      comment: {
        user_name: "店家回复",
        content: "亲爱的顾客，非常抱歉给您带来不好的体验。请联系客服，我们会为您提供解决方案。"
      },
      top: false
    },
    
    // 视频类型带圈子和活动
    {
      id: 1,
      user: {
        id: 20004,
        name: "视频测评达人",
        avatar: "/static/img/avatar.png",
        gender: 1,
        age: "33岁"
      },
      user_id: 20004,
      content: "做了一个开箱+洗涤测试视频，大家可以看看。总体来说这个价位还是值得的，但有一些小缺点。",
      imgs: [],
      img_count: 0,
      create_time_str: "2023-05-12",
      create_time: "2023-05-12",
      province: "四川",
      browse: 487,
      specs: "蓝色 XL码",
      is_like: true,
      like_count: 42,
      comment_count: 15,
      type: 2,
      video: {
        cover: "/static/img/avatar.png",
        wide: 1920,
        high: 1080
      },
      circle_id: 202,
      circle_name: "测评狂人圈",
      circle_avatar: "/static/img/avatar.png",
      activity_id: 102,
      activity_name: "618好物推荐",
      activity_img: "/static/img/avatar.png",
      comment: {
        user_name: "店家回复",
        content: "感谢您的详细测评！我们会根据您提出的问题进行改进。"
      },
      top: false
    },
    
    // 多图+视频混合类型
    {
      id: 1,
      user: {
        id: 20005,
        name: "亲肤材质控",
        avatar: "/static/img/avatar.png",
        gender: 0,
        age: "28岁"
      },
      user_id: 20005,
      content: "作为一个对面料特别敏感的人，我很满意这件T恤的材质。透气性好，不起球，多次洗涤后依然保持形状。以下是我的详细测评。",
      imgs: [
        { url: "/static/img/avatar.png", wide: 800, high: 600 },
        { url: "/static/img/avatar.png", wide: 800, high: 600 }
      ],
      img_count: 2,
      create_time_str: "2023-05-08",
      create_time: "2023-05-08",
      province: "北京",
      browse: 356,
      specs: "白色 L码",
      is_like: true,
      like_count: 36,
      comment_count: 9,
      type: 2,
      video: {
        cover: "/static/img/avatar.png",
        wide: 1080,
        high: 1920
      },
      adds_name: "北京市朝阳区",
      lat: 39.92148,
      lng: 116.51149,
      topic_info: [
        { id: 205, name: "面料测评" },
        { id: 206, name: "亲肤材质" }
      ],
      comment: {
        user_name: "材质专家",
        content: "很专业的分析，确实这款产品的面料处理工艺很先进！"
      },
      top: false
    }
  ],
  
  // 商品103的评价数据
  103: [
    // 多图带位置和话题
    {
      id: 3,
      user: {
        id: 30001,
        name: "旅行达人",
        avatar: "/static/img/avatar.png",
        gender: 1,
        age: "34岁"
      },
      user_id: 30001,
      content: "这款双肩包我已经背着去了三个国家了，质量非常好，耐用且百搭。内部的分层设计很实用，可以有效整理各种物品。强烈推荐给经常旅行的朋友！",
      imgs: [
        { url: "/static/img/avatar.png", wide: 800, high: 600 },
        { url: "/static/img/avatar.png", wide: 600, high: 800 },
        { url: "/static/img/avatar.png", wide: 800, high: 600 }
      ],
      img_count: 3,
      create_time_str: "2023-06-05",
      create_time: "2023-06-05",
      province: "国外",
      browse: 578,
      specs: "深蓝色",
      is_like: true,
      like_count: 56,
      comment_count: 18,
      type: 1,
      adds_name: "泰国曼谷",
      lat: 13.75398,
      lng: 100.50144,
      topic_info: [
        { id: 207, name: "旅行装备" },
        { id: 208, name: "轻便背包" }
      ],
      comment: {
        user_name: "店家回复",
        content: "感谢您的推荐！希望这款包能继续陪伴您探索更多美丽的地方~"
      },
      top: true
    },
    
    // 视频带圈子
    {
      id: 2,
      user: {
        id: 30002,
        name: "学生党",
        avatar: "/static/img/avatar.png",
        gender: 1,
        age: "22岁"
      },
      user_id: 30002,
      content: "作为一个大学生，这个包的性价比超高！可以装下我所有的教材和笔记本电脑，而且肩带很舒适，长时间背着也不累。唯一的缺点是防水性一般，下雨天需要额外保护。",
      imgs: [],
      img_count: 0,
      create_time_str: "2023-06-03",
      create_time: "2023-06-03",
      province: "江苏",
      browse: 234,
      specs: "黑色",
      is_like: false,
      like_count: 18,
      comment_count: 5,
      type: 2,
      video: {
        cover: "/static/img/avatar.png",
        wide: 720,
        high: 1280
      },
      circle_id: 203,
      circle_name: "大学生活圈",
      circle_avatar: "/static/img/avatar.png",
      comment: {
        user_name: "店家回复",
        content: "感谢您的评价！关于防水问题，我们正在研发新的防水材料，未来的版本会有所改进。"
      },
      top: false
    },
    
    // 视频+图片带活动和商品
    {
      id: 1,
      user: {
        id: 30003,
        name: "户外摄影师",
        avatar: "/static/img/avatar.png",
        gender: 1,
        age: "31岁"
      },
      user_id: 30003,
      content: "非常适合携带摄影器材！我把这个包改造了一下，加了几个内胆，完美适配我的相机和镜头。分享一下我的使用体验和改造过程。",
      imgs: [
        { url: "/static/img/avatar.png", wide: 800, high: 600 },
        { url: "/static/img/avatar.png", wide: 600, high: 800 }
      ],
      img_count: 2,
      create_time_str: "2023-05-30",
      create_time: "2023-05-30",
      province: "云南",
      browse: 389,
      specs: "灰色",
      is_like: true,
      like_count: 87,
      comment_count: 25,
      type: 2,
      video: {
        cover: "/static/img/avatar.png",
        wide: 1920,
        high: 1080
      },
      order_id: 3001,
      goods: [
        {
          goods_id: 303,
          goods_name: "专业摄影包",
          product_img: "/static/img/avatar.png"
        }
      ],
      activity_id: 103,
      activity_name: "创意改造大赛",
      activity_img: "/static/img/avatar.png",
      comment: {
        user_name: "店家回复",
        content: "您的改造非常有创意！感谢分享，这给了我们产品开发的灵感。"
      },
      top: false
    },
    
    // 纯文本带音频
    {
      id: 3004,
      user: {
        id: 30004,
        name: "材质专家",
        avatar: "/static/img/avatar.png",
        gender: 1,
        age: "40岁"
      },
      user_id: 30004,
      content: "从专业角度分析，这款包的面料是高密度尼龙，耐磨性很好，但透气性一般。缝线工艺还不错，整体做工在这个价位算是良心了。如果要提升品质，建议厂家在背部增加透气设计，肩带加厚一些会更舒适。",
      imgs: [],
      img_count: 0,
      create_time_str: "2023-05-25",
      create_time: "2023-05-25",
      province: "北京",
      browse: 267,
      specs: "黑色",
      is_like: true,
      like_count: 45,
      comment_count: 10,
      type: 3,
      audio: {
        name: "面料与工艺分析",
        cover: "/static/img/avatar.png",
        intro: "专业分析这款背包所用材料的优缺点"
      },
      comment: {
        user_name: "店家回复",
        content: "感谢您的专业建议！我们已经记录下来，会在下一代产品中考虑您提出的改进点。"
      },
      top: false
    },
    
    // 单图带位置
    {
      id: 3005,
      user: {
        id: 30005,
        name: "不满意用户",
        avatar: "/static/img/avatar.png",
        gender: 0,
        age: "27岁"
      },
      user_id: 30005,
      content: "用了两周就坏了，拉链质量太差，而且背带接缝处开线了。客服态度还可以，已经申请退款。",
      imgs: [
        { url: "/static/img/avatar.png", wide: 800, high: 600 }
      ],
      img_count: 1,
      create_time_str: "2023-05-20",
      create_time: "2023-05-20",
      province: "浙江",
      browse: 198,
      specs: "蓝色",
      is_like: false,
      like_count: 12,
      comment_count: 8,
      type: 1,
      adds_name: "浙江杭州",
      lat: 30.25961,
      lng: 120.21937,
      comment: {
        user_name: "店家回复",
        content: "非常抱歉给您带来不好的体验。我们已经联系了您，并安排了退款和赠送新品的补偿方案。也感谢您帮助我们发现质量问题。"
      },
      top: false
    }
  ]
}
    }
  },
  onLoad(options) {
    // 获取系统信息
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 20;
    this.titleBarHeight = 44;
    
    if (options.id) {
      this.goodsInfo.id = options.id;
      this.goodsInfo.img = options.img || "";
      this.goodsInfo.name = options.name || "商品名称";
      this.goodsInfo.count = options.count || 0;
      this.goodsDynamic();
    } else {
      this.navBack();
    }
  },
  methods: {
    // 获取评论动态
    goodsDynamic() {
      let that = this
      
      // 检查API是否可用
      if (api.default && api.default.api && api.default.api.goodsDynamicUrl) {
        request(api.default.api.goodsDynamicUrl, {
          id: that.goodsInfo.id,
          page: that.page
        }).then(function(res) {
          if (res.code == 200) {
            that.loadStatus = "more"
            
            if (res.data.data.length > 0) {
              that.list = that.list.concat(res.data.data)
              that.page = res.data.current_page
              that.isEmpty = false
            } else if (that.page == 1) {
              that.isEmpty = true
            }
          }
        })
      } else {
        // 使用mock数据
        setTimeout(() => {
          that.loadStatus = "more"
          
          // 如果没有传入商品信息，使用第一个mock商品
          if (that.goodsInfo.id == 0) {
            const mockGood = that.mockGoods[0]
            that.goodsInfo.id = mockGood.id
            that.goodsInfo.img = mockGood.img
            that.goodsInfo.name = mockGood.name
            that.goodsInfo.count = mockGood.count
          }
          
          // 获取当前商品的评价
          let mockEvaluateList = that.mockEvaluates[that.goodsInfo.id] || []
          
          // 更新评价数量
          that.goodsInfo.count = mockEvaluateList.length
          
          // 模拟分页
          const pageSize = 3
          const startIndex = (that.page - 1) * pageSize
          const endIndex = startIndex + pageSize
          const pageData = mockEvaluateList.slice(startIndex, endIndex)
          
          if (pageData.length > 0) {
            that.list = that.list.concat(pageData)
            that.isEmpty = false
          } else if (that.page == 1) {
            that.isEmpty = true
          }
        }, 500)
      }
    },
    
    // 点赞回调
    likeClick(e) {
      this.list[e.idx].is_like = e.is_like
      this.list[e.idx].like_count = e.like_count
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
    }
  },
  onReachBottom() {
    if (!this.isEmpty && this.list.length) {
      this.loadStatus = "loading"
      this.page = this.page + 1
      this.goodsDynamic()
    }
  },
  onPageScroll(e) {
    // 计算导航栏透明度 (0-1)
    let t = (e.scrollTop > 150 ? 150 : e.scrollTop) / 150;
    this.navbarTrans = t;
  }
}
</script>

<style>
.nav-box{position:fixed;top:0;left:0;width:100%;z-index:99;box-sizing:border-box}
.nav-box .nav-back{padding:0 30rpx;width:34rpx;height:100%}
.nav-box .nav-title{max-width:60%;font-size:32rpx;font-weight:700}
.bg-mk,.bg-mk2,.bg-img{position:absolute;width:100%;height:750rpx;top:0;left:0}
.bg-mk{z-index:-1;background:linear-gradient(to left,rgba(255,255,255,.3),#fff)}
.bg-mk2{z-index:-1;background:linear-gradient(to bottom,rgba(255,255,255,.3),#fff,#fff)}
.bg-img{z-index:-2}
.content-box .info-box{width:calc(100% - 60rpx);margin:0 30rpx 30rpx}
.info-box .name{padding:15rpx 0;font-size:38rpx;font-weight:700}
.info-box .unm{color:#333;font-size:20rpx;line-height:20rpx;font-weight:300}
.info-box .unm .tt{margin:0 8rpx;font-size:24rpx;font-weight:700}
.empty-box{width:100%;height:300rpx;flex-direction:column;justify-content:center}
.empty-box image{width:80rpx;height:80rpx;margin-bottom:30rpx}
.empty-box .e1{color:#666;font-size:28rpx;font-weight:700;margin-bottom:10rpx}
.empty-box .e2{color:#999;font-size:24rpx}
.df{display:flex;align-items:center}
.ohto{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style>