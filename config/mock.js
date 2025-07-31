/**
 * 模拟数据配置文件
 * 用于在不调用接口的情况下提供页面展示数据
 */

// 用户信息
export const userInfo = {
  id: 1001,
  nickname: "用户昵称",
  avatar: "/static/img/avatar.png",
  gender: 1,
  age: "90后",
  signature: "这是我的个性签名",
  fans: 128,
  follows: 86,
  likes: 352,
  is_vip: true,
  background: "/static/img/avatar.png"
};

// 圈子列表数据
export const circleList = [
  {
    id: 1,
    name: "美食分享",
    avatar: "/static/img/avatar.png",
    is_hot: true,
    is_new: false,
    dynamic_count: 25,
    user_count: 256,
    intro: "分享美食制作和美食探店经验",
    user: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    tags: ["美食", "烹饪", "探店"],
    recent_topics: ["夏日甜品特辑", "家常菜教程", "城市美食指南"],
    view_count: 1258
  },
  {
    id: 2,
    name: "旅行日记",
    avatar: "/static/img/avatar.png",
    is_hot: false,
    is_new: true,
    dynamic_count: 18,
    user_count: 183,
    intro: "记录旅行见闻，分享旅途趣事",
    user: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    tags: ["旅行", "摄影", "探险"],
    recent_topics: ["周末短途游", "国内小众景点", "旅行装备推荐"],
    view_count: 865
  },
  {
    id: 3,
    name: "生活分享",
    avatar: "/static/img/avatar.png",
    is_hot: true,
    is_new: false,
    dynamic_count: 32,
    user_count: 415,
    intro: "记录日常生活点滴，分享生活妙招",
    user: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    tags: ["生活", "家居", "收纳"],
    recent_topics: ["极简主义生活", "家居改造计划", "工作效率提升"],
    view_count: 1576
  },
  {
    id: 4,
    name: "宠物社区",
    avatar: "/static/img/avatar.png",
    is_hot: false,
    is_new: false,
    dynamic_count: 15,
    user_count: 289,
    intro: "记录与宠物相处的日常，分享饲养经验",
    user: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    tags: ["宠物", "猫咪", "狗狗"],
    recent_topics: ["宠物健康饮食", "有趣训练方法", "萌宠日常"],
    view_count: 952
  },
  {
    id: 5,
    name: "摄影爱好",
    avatar: "/static/img/avatar.png",
    is_hot: false,
    is_new: true,
    dynamic_count: 42,
    user_count: 326,
    intro: "分享摄影技巧和优秀作品，探讨构图与色彩",
    user: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    tags: ["摄影", "器材", "后期"],
    recent_topics: ["城市建筑摄影", "人像摄影指南", "后期调色技巧"],
    view_count: 1123
  },
  {
    id: 6,
    name: "读书会",
    avatar: "/static/img/avatar.png",
    is_hot: true,
    is_new: false,
    dynamic_count: 37,
    user_count: 428,
    intro: "共享阅读心得，推荐好书，一起成长",
    user: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    tags: ["读书", "文学", "成长"],
    recent_topics: ["月度好书推荐", "经典名著解读", "阅读方法分享"],
    view_count: 1345
  },
  {
    id: 7,
    name: "电影爱好者",
    avatar: "/static/img/avatar.png",
    is_hot: false,
    is_new: false,
    dynamic_count: 29,
    user_count: 352,
    intro: "分享观影体验，讨论电影剧情与艺术",
    user: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    tags: ["电影", "影评", "导演"],
    recent_topics: ["年度必看电影", "经典电影回顾", "国产电影发展"],
    view_count: 987
  },
  {
    id: 8,
    name: "健身达人",
    avatar: "/static/img/avatar.png",
    is_hot: true,
    is_new: false,
    dynamic_count: 48,
    user_count: 486,
    intro: "分享健身经验，交流训练方法，共同进步",
    user: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    tags: ["健身", "营养", "减脂"],
    recent_topics: ["居家训练计划", "健身饮食指南", "增肌训练方法"],
    view_count: 1432
  },
  {
    id: 9,
    name: "手工创作",
    avatar: "/static/img/avatar.png",
    is_hot: false,
    is_new: true,
    dynamic_count: 21,
    user_count: 195,
    intro: "分享手工制作过程，交流创意和技巧",
    user: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    tags: ["手工", "DIY", "创意"],
    recent_topics: ["布艺手作教程", "创意纸艺分享", "手工礼物制作"],
    view_count: 768
  },
  {
    id: 10,
    name: "数码科技",
    avatar: "/static/img/avatar.png",
    is_hot: true,
    is_new: false,
    dynamic_count: 53,
    user_count: 512,
    intro: "关注科技动态，分享数码产品使用体验",
    user: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    tags: ["科技", "数码", "评测"],
    recent_topics: ["新品手机评测", "智能家居体验", "数码产品选购指南"],
    view_count: 1678
  },
  {
    id: 11,
    name: "植物爱好者",
    avatar: "/static/img/avatar.png",
    is_hot: false,
    is_new: true,
    dynamic_count: 19,
    user_count: 176,
    intro: "分享养护植物的经验，讨论各类植物品种",
    user: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    tags: ["植物", "园艺", "多肉"],
    recent_topics: ["室内植物养护", "多肉植物品种", "阳台种植蔬果"],
    view_count: 642
  },
  {
    id: 12,
    name: "咖啡爱好者",
    avatar: "/static/img/avatar.png",
    is_hot: false,
    is_new: false,
    dynamic_count: 24,
    user_count: 213,
    intro: "探索咖啡文化，分享冲泡技巧和咖啡馆推荐",
    user: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    tags: ["咖啡", "手冲", "品鉴"],
    recent_topics: ["咖啡豆选购指南", "手冲咖啡技巧", "城市特色咖啡馆"],
    view_count: 895
  }
];

// 活动数据
export const activityList = [
  {
    id: 1,
    name: "春季户外徒步活动",
    img: "/static/img/activity1.png",
    status_str: "进行中",
    activity_time: "2023-05-20 09:00",
    adds_name: "市民公园东门",
    user_count: 28,
    avatar_list: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    browse: 365,
    is_join: false
  },
  {
    id: 2,
    name: "城市摄影大赛",
    img: "/static/img/activity2.png",
    status_str: "报名中",
    activity_time: "2023-06-15 14:00",
    adds_name: "中央美术馆",
    user_count: 16,
    avatar_list: [
      "/static/img/avatar.png",
      "/static/img/avatar.png",
      "/static/img/avatar.png"
    ],
    browse: 245,
    is_join: true
  }
];

// 动态数据
export const dynamicList = [
  {
    id: 1,
    user_id: 101,
    user: {
      id: 101,
      avatar: "/static/img/avatar.png",
      name: "美食达人"
    },
    content: "今天做了超级美味的草莓蛋糕，口感非常好，分享一下制作过程...",
    type: 1, // 图片类型
    like_count: 58,
    comment_count: 12,
    browse: 236,
    is_like: false,
    imgs: [
      {url: "/static/img/avatar.png", wide: 800, high: 600}, 
      {url: "/static/img/avatar.png", wide: 800, high: 600}
    ],
    img_count: 2,
    time_str: '3小时前',
    create_time_d: '19',
    create_time_ym: '05-19',
    create_time_str: '3小时前',
    province: '广州',
    status_text: '',
    circle_id: 1,
    circle_name: "美食分享",
    circle_avatar: "/static/img/avatar.png"
  },
  {
    id: 2,
    user_id: 102,
    user: {
      id: 102,
      avatar: "/static/img/avatar.png",
      name: "旅行爱好者"
    },
    content: "这个周末去了附近的山区，风景真的太美了，强烈推荐给大家...",
    type: 1, // 图片类型
    like_count: 36,
    comment_count: 8,
    browse: 185,
    is_like: false,
    imgs: [
      {url: "/static/img/avatar.png", wide: 800, high: 800}
    ],
    img_count: 1,
    time_str: '昨天',
    create_time_d: '18',
    create_time_ym: '05-18',
    create_time_str: '昨天',
    province: '杭州',
    status_text: '',
    adds_name: '莫干山',
    lat: '30.6184',
    lng: '119.8143'
  },
  {
    id: 3,
    user_id: 103,
    user: {
      id: 103,
      avatar: "/static/img/avatar.png",
      name: "摄影师小明"
    },
    content: "用镜头记录城市中被忽略的角落，发现不一样的美...",
    type: 2, // 视频类型
    like_count: 72,
    comment_count: 18,
    browse: 328,
    is_like: false,
    video: {
      url: "/static/img/avatar.png",
      cover: "/static/img/avatar.png",
      wide: 1280,
      high: 720
    },
    time_str: '3天前',
    create_time_d: '16',
    create_time_ym: '05-16',
    create_time_str: '3天前',
    province: '上海',
    status_text: '',
    circle_id: 5,
    circle_name: "摄影爱好",
    circle_avatar: "/static/img/avatar.png"
  },
  {
    id: 4,
    user_id: 104,
    user: {
      id: 104,
      avatar: "/static/img/avatar.png",
      name: "健身达人"
    },
    content: "坚持训练一个月的效果，从此不再为健身而烦恼！分享几个适合新手的训练动作...",
    type: 1, // 图片类型
    like_count: 95,
    comment_count: 26,
    browse: 412,
    is_like: false,
    imgs: [
      {url: "/static/img/avatar.png", wide: 800, high: 1200},
      {url: "/static/img/avatar.png", wide: 800, high: 1200},
      {url: "/static/img/avatar.png", wide: 800, high: 1200}
    ],
    img_count: 3,
    time_str: '4天前',
    create_time_d: '15',
    create_time_ym: '05-15',
    create_time_str: '4天前',
    province: '北京',
    status_text: '',
    circle_id: 8,
    circle_name: "健身达人",
    circle_avatar: "/static/img/avatar.png"
  },
  {
    id: 5,
    user_id: 105,
    user: {
      id: 105,
      avatar: "/static/img/avatar.png",
      name: "音乐制作人"
    },
    content: "分享一首自己创作的歌曲《春天的约定》，欢迎大家收听和评论",
    type: 3, // 音频类型
    like_count: 64,
    comment_count: 17,
    browse: 276,
    is_like: false,
    audio: {
      url: "/static/img/avatar.png",
      cover: "/static/img/avatar.png",
      name: "春天的约定",
      intro: "原创·5分钟"
    },
    time_str: '5天前',
    create_time_d: '14',
    create_time_ym: '05-14',
    create_time_str: '5天前',
    province: '成都',
    status_text: ''
  }
];

// 商品数据
export const goodsList = [
  {
    id: 1,
    name: "智能手表",
    price: "699.00",
    original_price: "899.00",
    sales: 256,
    image: "/static/img/avatar.png"
  },
  {
    id: 2,
    name: "无线耳机",
    price: "299.00",
    original_price: "399.00",
    sales: 428,
    image: "/static/img/avatar.png"
  },
  {
    id: 3,
    name: "便携充电宝",
    price: "129.00",
    original_price: "159.00",
    sales: 865,
    image: "/static/img/avatar.png"
  }
];

// 商品详情数据
export const goodsDetails = {
  id: 1,
  name: "智能手表 2023新款",
  intro: "多功能运动智能手表，支持心率监测、睡眠分析",
  imgs: ["/static/img/avatar.png", "/static/img/avatar.png", "/static/img/avatar.png"],
  details: "<p style='text-align:center;'><img src='/static/img/avatar.png' /></p><p>商品详情内容</p>",
  view: 2560,
  buy: 389,
  cart: 782,
  comment: 156,
  cart_count: 2,
  type: 0,
  product: [
    {
      id: 1,
      specs_name: "黑色标准版",
      price: "699.00",
      line_price: "899.00",
      stock: 200
    },
    {
      id: 2,
      specs_name: "白色标准版",
      price: "699.00",
      line_price: "899.00",
      stock: 150
    },
    {
      id: 3,
      specs_name: "黑色高级版",
      price: "899.00",
      line_price: "1099.00",
      stock: 100
    }
  ]
};

// 订单数据
export const orderList = [
  {
    id: 10001,
    order_no: "20230501123456",
    status: 1,
    status_name: "待付款",
    goods_price: "699.00",
    pay_price: "699.00",
    create_time: "2023-05-01 12:34:56",
    goods: [
      {
        goods_id: 1,
        goods_name: "智能手表 2023新款",
        image: "/static/img/avatar.png",
        specs_name: "黑色标准版",
        price: "699.00",
        num: 1
      }
    ]
  },
  {
    id: 10002,
    order_no: "20230502123456",
    status: 2,
    status_name: "待发货",
    goods_price: "299.00",
    pay_price: "299.00",
    create_time: "2023-05-02 12:34:56",
    goods: [
      {
        goods_id: 2,
        goods_name: "无线耳机",
        image: "/static/img/avatar.png",
        specs_name: "白色",
        price: "299.00",
        num: 1
      }
    ]
  },
  {
    id: 10003,
    order_no: "20230503123456",
    status: 3,
    status_name: "待收货",
    goods_price: "129.00",
    pay_price: "129.00",
    create_time: "2023-05-03 12:34:56",
    goods: [
      {
        goods_id: 3,
        goods_name: "便携充电宝",
        image: "/static/img/avatar.png",
        specs_name: "10000mAh",
        price: "129.00",
        num: 1
      }
    ]
  }
];

// 评价数据
export const evaluateList = [
  {
    id: 1,
    user_avatar: "/static/img/avatar.png",
    user_name: "用户138****9012",
    content: "商品质量很好，物流很快，包装也很精美，非常满意的一次购物体验！",
    images: ["/static/img/avatar.png", "/static/img/avatar.png"],
    specs_name: "黑色标准版",
    star: 5,
    create_time: "2023-05-05 14:23:45"
  },
  {
    id: 2,
    user_avatar: "/static/img/avatar.png",
    user_name: "用户157****3456",
    content: "手表功能很全面，电池续航也不错，总体使用感受良好。",
    images: ["/static/img/avatar.png"],
    specs_name: "白色标准版",
    star: 4,
    create_time: "2023-05-04 09:12:34"
  },
  {
    id: 3,
    user_avatar: "/static/img/avatar.png",
    user_name: "用户186****7890",
    content: "外观设计很好看，戴着很舒适，对得起这个价格。",
    images: [],
    specs_name: "黑色高级版",
    star: 5,
    create_time: "2023-05-03 18:45:12"
  }
];

// 购物车数据
export const cartList = [
  {
    id: 1,
    goods_id: 1,
    goods_name: "智能手表 2023新款",
    image: "/static/img/avatar.png",
    specs_name: "黑色标准版",
    price: "699.00",
    num: 1,
    checked: true
  },
  {
    id: 2,
    goods_id: 2,
    goods_name: "无线耳机",
    image: "/static/img/avatar.png",
    specs_name: "白色",
    price: "299.00",
    num: 1,
    checked: true
  },
  {
    id: 3,
    goods_id: 3,
    goods_name: "便携充电宝",
    image: "/static/img/avatar.png",
    specs_name: "10000mAh",
    price: "129.00",
    num: 1,
    checked: false
  }
];

// 分类数据
export const classifyList = [
  {
    id: 1,
    name: "电子产品",
    children: [
      {
        id: 101,
        name: "手机",
        image: "/static/img/avatar.png"
      },
      {
        id: 102,
        name: "电脑",
        image: "/static/img/avatar.png"
      },
      {
        id: 103,
        name: "智能手表",
        image: "/static/img/avatar.png"
      }
    ]
  },
  {
    id: 2,
    name: "服装鞋帽",
    children: [
      {
        id: 201,
        name: "男装",
        image: "/static/img/avatar.png"
      },
      {
        id: 202,
        name: "女装",
        image: "/static/img/avatar.png"
      },
      {
        id: 203,
        name: "童装",
        image: "/static/img/avatar.png"
      }
    ]
  },
  {
    id: 3,
    name: "美妆护肤",
    children: [
      {
        id: 301,
        name: "面部护理",
        image: "/static/img/avatar.png"
      },
      {
        id: 302,
        name: "彩妆",
        image: "/static/img/avatar.png"
      },
      {
        id: 303,
        name: "香水",
        image: "/static/img/avatar.png"
      }
    ]
  }
];

// 搜索数据
export const searchData = {
  hot: ["智能手表", "无线耳机", "充电宝", "手机壳", "平板电脑"],
  history: ["运动鞋", "蓝牙音箱", "智能家居"]
};

// 笔记详情数据
export const noteDetail = {
  id: 2,
  user_id: 1002,
  user: {
    id: 1002,
    name: "摄影爱好者",
    avatar: "/static/img/avatar.png"
  },
  content: "分享几张我最近拍摄的照片，希望大家喜欢！这些都是在周末郊游时拍的，大自然的美景真的让人心旷神怡。",
  type: 1, // 图片类型
  imgs: [
    {url: "/static/img/avatar.png", wide: 750, high: 750},
    {url: "/static/img/avatar.png", wide: 750, high: 500},
    {url: "/static/img/avatar.png", wide: 750, high: 1000}
  ],
  comment_count: 32,
  like_count: 156,
  like_count_str: "156",
  is_like: true,
  create_time_str: "2023-05-18",
  province: "上海",
  adds_name: "城市公园",
  lat: "31.230416",
  lng: "121.473701",
  circle_id: 5,
  circle_name: "摄影爱好",
  circle_avatar: "/static/img/avatar.png",
  activity_id: 0,
  activity_name: "",
  activity_img: "",
  browse: 528,
  order_id: 0,
  goods: []
};

// 笔记评论数据
export const noteComments = [
  {
    id: 2001,
    user: {
      id: 1002,
      name: "旅行爱好者",
      avatar: "/static/img/avatar.png"
    },
    content: "照片拍得真美，请问是用什么相机拍的？",
    status: 1,
    create_time_str: "1小时前",
    province: "上海",
    list: [
      {
        id: 3001,
        user: {
          id: 1001,
          name: "城市摄影师",
          avatar: "/static/img/avatar.png"
        },
        content: "@旅行爱好者 谢谢喜欢，用的是索尼A7III",
        status: 1,
        create_time_str: "50分钟前",
        province: "广州",
        reply_name: "旅行爱好者",
        is_reply_to_reply: false
      },
      {
        id: 3002,
        user: {
          id: 1003,
          name: "摄影达人",
          avatar: "/static/img/avatar.png"
        },
        content: "@城市摄影师 这款相机确实不错，我也在用",
        status: 1,
        create_time_str: "30分钟前",
        province: "北京",
        reply_name: "城市摄影师",
        is_reply_to_reply: true
      }
    ],
    list_count: 2
  },
  {
    id: 2002,
    user: {
      id: 1004,
      name: "园艺爱好者",
      avatar: "/static/img/avatar.png"
    },
    content: "公园里的花真漂亮，请问是什么品种的花？",
    status: 1,
    create_time_str: "1小时前",
    province: "杭州",
    list: [],
    list_count: 0
  },
  {
    id: 2003,
    user: {
      id: 1005,
      name: "城市规划师",
      avatar: "/static/img/avatar.png"
    },
    content: "这个公园规划得非常好，环境优美，是我们城市的一张名片。",
    status: 1,
    create_time_str: "2小时前",
    province: "广州",
    list: [],
    list_count: 0
  }
];

// 通用消息数据
export const messageList = {
  // 所有消息
  all: [
    {
      id: 1001,
      launch_id: 2001,
      type: 1, // 笔记类型
      read: 0,
      title: "评论了你的笔记",
      content: "你的摄影技巧太棒了，请问是用什么相机拍摄的？",
      content_url: "/pages/note/details?id=1001",
      avatar_url: "/pages/user/details?id=2001",
      create_time_str: "10分钟前",
      user: {
        avatar: "/static/img/avatar.png",
        name: "小林摄影"
      }
    },
    {
      id: 1002,
      launch_id: 2002,
      type: 2, // 圈子类型
      read: 0,
      title: "加入了你创建的圈子",
      content: "很喜欢\"旅行日记\"这个圈子，期待与大家分享旅行经历！",
      content_url: "/pages/note/circle?id=3001",
      avatar_url: "/pages/user/details?id=2002",
      create_time_str: "30分钟前",
      user: {
        avatar: "/static/img/avatar.png",
        name: "旅行达人"
      }
    },
    {
      id: 1003,
      type: 3, // 购物类型
      read: 1,
      title: "您的订单已发货",
      content: "订单号: 2023112509876，预计3-5天送达，请保持电话畅通。",
      content_url: "/pages/order/details?id=4001",
      create_time_str: "2小时前"
    }
  ],
  // 笔记消息
  note: [
    {
      id: 1001,
      launch_id: 2001,
      type: 1,
      read: 0,
      title: "评论了你的笔记",
      content: "你的摄影技巧太棒了，请问是用什么相机拍摄的？",
      content_url: "/pages/note/details?id=1001",
      avatar_url: "/pages/user/details?id=2001",
      create_time_str: "10分钟前",
      user: {
        avatar: "/static/img/avatar.png",
        name: "小林摄影"
      }
    },
    {
      id: 1004,
      launch_id: 2003,
      type: 1,
      read: 0,
      title: "点赞了你的笔记",
      content: "你分享的美食制作方法我试了一下，效果很棒！",
      content_url: "/pages/note/details?id=1002",
      avatar_url: "/pages/user/details?id=2003",
      create_time_str: "3小时前",
      user: {
        avatar: "/static/img/avatar.png",
        name: "美食家"
      }
    }
  ],
  // 圈子消息
  circle: [
    {
      id: 1002,
      launch_id: 2002,
      type: 2,
      read: 0,
      title: "加入了你创建的圈子",
      content: "很喜欢\"旅行日记\"这个圈子，期待与大家分享旅行经历！",
      content_url: "/pages/note/circle?id=3001",
      avatar_url: "/pages/user/details?id=2002",
      create_time_str: "30分钟前",
      user: {
        avatar: "/static/img/avatar.png",
        name: "旅行达人"
      }
    },
    {
      id: 1006,
      launch_id: 2004,
      type: 2,
      read: 0,
      title: "在圈子中@了你",
      content: "@你 这款相机确实不错，我也入手了一台，拍摄效果很满意。",
      content_url: "/pages/note/circle?id=3002&post=5001",
      avatar_url: "/pages/user/details?id=2004",
      create_time_str: "昨天",
      user: {
        avatar: "/static/img/avatar.png",
        name: "摄影爱好者"
      }
    }
  ],
  // 购物消息
  shop: [
    {
      id: 1003,
      type: 3,
      read: 1,
      title: "您的订单已发货",
      content: "订单号: 2023112509876，预计3-5天送达，请保持电话畅通。",
      content_url: "/pages/order/details?id=4001",
      create_time_str: "2小时前"
    },
    {
      id: 1005,
      type: 3,
      read: 1,
      title: "优惠券到账提醒",
      content: "恭喜您获得满100减20元优惠券一张，有效期7天，请尽快使用。",
      content_url: "/pages/center/card",
      create_time_str: "昨天"
    }
  ]
};

// 用户圈子数据
export const userCircleList = {
  // 用户创建的圈子
  created: [
    {
      id: 3,
      name: "生活分享",
      avatar: "/static/img/avatar.png",
      is_hot: true,
      is_new: false,
      dynamic_count: 32,
      user_count: 415,
      intro: "记录日常生活点滴，分享生活妙招",
      user: [
        "/static/img/avatar.png",
        "/static/img/avatar.png",
        "/static/img/avatar.png"
      ],
      create_time: "2023-01-15"
    },
    {
      id: 8,
      name: "健身达人",
      avatar: "/static/img/avatar.png",
      is_hot: true,
      is_new: false,
      dynamic_count: 48,
      user_count: 486,
      intro: "分享健身经验，交流训练方法，共同进步",
      user: [
        "/static/img/avatar.png",
        "/static/img/avatar.png",
        "/static/img/avatar.png"
      ],
      create_time: "2023-02-20"
    }
  ],
  
  // 用户加入的圈子
  joined: [
    {
      id: 1,
      name: "美食分享",
      avatar: "/static/img/avatar.png",
      is_hot: true,
      is_new: false,
      dynamic_count: 25,
      user_count: 256,
      intro: "分享美食制作和美食探店经验",
      user: [
        "/static/img/avatar.png",
        "/static/img/avatar.png",
        "/static/img/avatar.png"
      ],
      join_time: "2023-03-05"
    },
    {
      id: 5,
      name: "摄影爱好",
      avatar: "/static/img/avatar.png",
      is_hot: false,
      is_new: true,
      dynamic_count: 42,
      user_count: 326,
      intro: "分享摄影技巧和优秀作品，探讨构图与色彩",
      user: [
        "/static/img/avatar.png",
        "/static/img/avatar.png",
        "/static/img/avatar.png"
      ],
      join_time: "2023-04-12"
    },
    {
      id: 10,
      name: "数码科技",
      avatar: "/static/img/avatar.png",
      is_hot: true,
      is_new: false,
      dynamic_count: 53,
      user_count: 512,
      intro: "关注科技动态，分享数码产品使用体验",
      user: [
        "/static/img/avatar.png",
        "/static/img/avatar.png",
        "/static/img/avatar.png"
      ],
      join_time: "2023-04-18"
    }
  ],
  
  // 推荐的圈子
  recommend: [
    {
      id: 2,
      name: "旅行日记",
      avatar: "/static/img/avatar.png",
      is_hot: false,
      is_new: true,
      dynamic_count: 18,
      user_count: 183,
      intro: "记录旅行见闻，分享旅途趣事",
      user: [
        "/static/img/avatar.png",
        "/static/img/avatar.png",
        "/static/img/avatar.png"
      ]
    },
    {
      id: 4,
      name: "宠物社区",
      avatar: "/static/img/avatar.png",
      is_hot: false,
      is_new: false,
      dynamic_count: 15,
      user_count: 289,
      intro: "记录与宠物相处的日常，分享饲养经验",
      user: [
        "/static/img/avatar.png",
        "/static/img/avatar.png",
        "/static/img/avatar.png"
      ]
    },
    {
      id: 6,
      name: "读书会",
      avatar: "/static/img/avatar.png",
      is_hot: true,
      is_new: false,
      dynamic_count: 37,
      user_count: 428,
      intro: "共享阅读心得，推荐好书，一起成长",
      user: [
        "/static/img/avatar.png",
        "/static/img/avatar.png",
        "/static/img/avatar.png"
      ]
    },
    {
      id: 9,
      name: "手工创作",
      avatar: "/static/img/avatar.png",
      is_hot: false,
      is_new: true,
      dynamic_count: 21,
      user_count: 195,
      intro: "分享手工制作过程，交流创意和技巧",
      user: [
        "/static/img/avatar.png",
        "/static/img/avatar.png",
        "/static/img/avatar.png"
      ]
    }
  ]
};

// 圈子详情数据
export const circleDetail = {
  id: 1,
  name: "美食分享",
  avatar: "/static/img/avatar.png",
  background: "/static/img/avatar.png",
  is_hot: true,
  is_new: false,
  dynamic_count: 25,
  user_count: 256,
  intro: "分享美食制作和美食探店经验，交流烹饪技巧和食材选购知识，一起探索美食的无限可能。",
  tags: ["美食", "烹饪", "探店"],
  create_time: "2023-01-15",
  creator: {
    id: 101,
    name: "美食达人",
    avatar: "/static/img/avatar.png"
  },
  is_join: true,
  admin_list: [
    {
      id: 101,
      name: "美食达人",
      avatar: "/static/img/avatar.png"
    },
    {
      id: 102,
      name: "烹饪专家",
      avatar: "/static/img/avatar.png"
    }
  ],
  notice: "欢迎加入美食分享圈子！请遵守社区规则，禁止发布广告和无关内容，共同维护良好的交流环境。",
  posts: [
    {
      id: 1001,
      user: {
        id: 101,
        name: "美食达人",
        avatar: "/static/img/avatar.png"
      },
      content: "分享一道简单又美味的家常菜：蒜蓉西兰花。步骤简单，营养丰富，非常适合工作日的晚餐！",
      images: ["/static/img/avatar.png", "/static/img/avatar.png"],
      create_time: "2023-05-10 14:23",
      like_count: 28,
      comment_count: 12
    },
    {
      id: 1002,
      user: {
        id: 103,
        name: "甜点控",
        avatar: "/static/img/avatar.png"
      },
      content: "周末做了一款草莓慕斯蛋糕，成品非常满意！分享一下制作过程和要点...",
      images: ["/static/img/avatar.png"],
      create_time: "2023-05-09 10:45",
      like_count: 36,
      comment_count: 18
    }
  ]
};

// 评论列表数据
export const commentList = [
  {
    id: 101,
    user: {
      id: 2001,
      name: "评论用户1",
      avatar: "/static/img/avatar.png"
    },
    content: "这些照片拍得真好，光影效果很棒！",
    create_time_str: "2023-05-19",
    province: "北京",
    status: 1,
    list_count: 2,
    list: [
      {
        id: 1011,
        user: {
          id: 1002,
          name: "摄影爱好者",
          avatar: "/static/img/avatar.png"
        },
        content: "谢谢你的赞赏，我会继续努力的！",
        create_time_str: "2023-05-19",
        province: "上海",
        status: 1,
        reply_user: {
          id: 2001,
          name: "评论用户1"
        }
      },
      {
        id: 1012,
        user: {
          id: 2003,
          name: "路人甲",
          avatar: "/static/img/avatar.png"
        },
        content: "我也觉得拍得很好，请问用的什么相机？",
        create_time_str: "2023-05-19",
        province: "广州",
        status: 1,
        reply_user: {
          id: 2001,
          name: "评论用户1"
        }
      }
    ]
  },
  {
    id: 102,
    user: {
      id: 2002,
      name: "评论用户2",
      avatar: "/static/img/avatar.png"
    },
    content: "风景真美，下次有机会我也要去看看！",
    create_time_str: "2023-05-18",
    province: "深圳",
    status: 1,
    list_count: 1,
    list: [
      {
        id: 1021,
        user: {
          id: 1002,
          name: "摄影爱好者",
          avatar: "/static/img/avatar.png"
        },
        content: "欢迎你来玩，这个地方真的很值得一去！",
        create_time_str: "2023-05-18",
        province: "上海",
        status: 1,
        reply_user: {
          id: 2002,
          name: "评论用户2"
        }
      }
    ]
  }
];

// 直播信息数据
export const liveInfo = [
  {
    id: 1,
    title: "正在直播：潮流穿搭分享会",
    path: "note/live?id=1",
    content: "潮流穿搭分享会",
    url: "note/live?id=1",
    status: true
  },
  {
    id: 2,
    title: "正在直播：美妆教程大公开",
    path: "note/live?id=2",
    content: "美妆教程大公开",
    url: "note/live?id=2",
    status: true
  },
  {
    id: 3,
    title: "正在直播：厨艺大师烹饪秀",
    path: "note/live?id=3",
    content: "厨艺大师烹饪秀",
    url: "note/live?id=3",
    status: true
  }
];

// 用户笔记列表
export const userNotes = [
  {
    id: 101,
    type: 1, // 图片类型
    content: '分享一张最近拍摄的照片，城市的夜景真美！',
    imgs: [
      {url: '/static/img/avatar.png', wide: 800, high: 600}
    ],
    img_count: 1,
    view_count: 158,
    browse: 158,
    like_count: 32,
    comment_count: 8,
    time_str: '2小时前',
    create_time_d: '19',
    create_time_ym: '05-19',
    create_time_str: '2小时前',
    province: '广州',
    status_text: '',
    is_like: false,
    user_id: 1001,
    adds_name: '天河公园',
    lat: '23.137903',
    lng: '113.347306',
    circle_id: 5,
    circle_name: '摄影爱好',
    circle_avatar: '/static/img/avatar.png'
  },
  {
    id: 102,
    type: 0, // 纯文本类型
    content: '今天天气真好，心情也跟着好起来了！阳光明媚，微风不燥，是出门散步的好日子。',
    browse: 89,
    view_count: 89,
    like_count: 15,
    comment_count: 3,
    time_str: '昨天',
    create_time_d: '17',
    create_time_ym: '05-17',
    create_time_str: '昨天',
    province: '北京',
    status_text: '',
    is_like: true,
    user_id: 1001
  },
  {
    id: 103,
    type: 1, // 多图类型
    content: '和朋友一起去了新开的咖啡店，环境很不错，推荐给大家~',
    imgs: [
      {url: '/static/img/avatar.png', wide: 800, high: 800},
      {url: '/static/img/avatar.png', wide: 800, high: 800},
      {url: '/static/img/avatar.png', wide: 800, high: 800}
    ],
    img_count: 3,
    browse: 210,
    view_count: 210,
    like_count: 45,
    comment_count: 12,
    time_str: '3天前',
    create_time_d: '15',
    create_time_ym: '05-15',
    create_time_str: '3天前',
    province: '上海',
    status_text: '',
    is_like: false,
    user_id: 1001,
    adds_name: '星巴克咖啡(徐家汇店)',
    lat: '31.193894',
    lng: '121.436806'
  },
  {
    id: 104,
    type: 2, // 视频类型
    content: '分享一段我最近学习的舞蹈视频，喜欢的朋友可以一起交流~',
    video: {
      url: '/static/img/avatar.png',
      cover: '/static/img/avatar.png',
      wide: 720,
      high: 1280
    },
    browse: 315,
    view_count: 315,
    like_count: 67,
    comment_count: 18,
    time_str: '5天前',
    create_time_d: '13',
    create_time_ym: '05-13',
    create_time_str: '5天前',
    province: '深圳',
    status_text: '',
    is_like: false,
    user_id: 1001,
    circle_id: 9,
    circle_name: '舞蹈爱好者',
    circle_avatar: '/static/img/avatar.png'
  },
  {
    id: 105,
    type: 3, // 音频类型
    content: '分享一段我最近录制的钢琴曲，《梦中的婚礼》，希望大家喜欢',
    audio: {
      url: '/static/img/avatar.png',
      cover: '/static/img/avatar.png',
      name: '梦中的婚礼',
      intro: '钢琴曲·3分钟'
    },
    browse: 168,
    view_count: 168,
    like_count: 39,
    comment_count: 8,
    time_str: '1周前',
    create_time_d: '11',
    create_time_ym: '05-11',
    create_time_str: '1周前',
    province: '杭州',
    status_text: '',
    is_like: false,
    user_id: 1001
  },
  {
    id: 106,
    type: 1, // 图片类型(带商品)
    content: '今天收到了上周买的新衣服，质量很好，款式也很好看，分享给大家~',
    imgs: [
      {url: '/static/img/avatar.png', wide: 800, high: 1200},
      {url: '/static/img/avatar.png', wide: 800, high: 1200}
    ],
    img_count: 2,
    browse: 245,
    view_count: 245,
    like_count: 52,
    comment_count: 14,
    time_str: '1周前',
    create_time_d: '10',
    create_time_ym: '05-10',
    create_time_str: '1周前',
    province: '广州',
    status_text: '',
    is_like: false,
    user_id: 1001,
    order_id: 10001,
    goods: [
      {
        goods_id: 1001,
        product_img: '/static/img/avatar.png',
        goods_name: '2023春夏新款连衣裙'
      }
    ]
  }
];

// 用户赞过的内容
export const userLikes = [
  {
    id: 201,
    type: 1, // 图片类型
    user: {
      id: 301,
      avatar: '/static/img/avatar.png',
      name: '摄影爱好者'
    },
    user_id: 301,
    content: '分享一组街拍照片，希望大家喜欢！',
    imgs: [
      {url: '/static/img/avatar.png', wide: 800, high: 600},
      {url: '/static/img/avatar.png', wide: 800, high: 600},
      {url: '/static/img/avatar.png', wide: 800, high: 600}
    ],
    img_count: 3,
    browse: 320,
    view_count: 320,
    like_count: 86,
    comment_count: 24,
    time_str: '1天前',
    create_time_d: '18',
    create_time_ym: '05-18',
    create_time_str: '1天前',
    province: '上海',
    status_text: '',
    is_like: true,
    adds_name: '人民广场',
    lat: '31.23136',
    lng: '121.47528',
    circle_id: 2,
    circle_name: '街拍达人',
    circle_avatar: '/static/img/avatar.png'
  },
  {
    id: 202,
    type: 2, // 视频类型
    user: {
      id: 302,
      avatar: '/static/img/avatar.png',
      name: '美食博主'
    },
    user_id: 302,
    content: '自制美食教程，简单又好吃！学会这道糖醋排骨，在家也能做出饭店的味道！',
    video: {
      url: '/static/img/avatar.png',
      cover: '/static/img/avatar.png',
      wide: 1280,
      high: 720
    },
    browse: 560,
    view_count: 560,
    like_count: 120,
    comment_count: 35,
    time_str: '3天前',
    create_time_d: '16',
    create_time_ym: '05-16',
    create_time_str: '3天前',
    province: '北京',
    status_text: '',
    is_like: true,
    circle_id: 1,
    circle_name: '美食分享',
    circle_avatar: '/static/img/avatar.png'
  },
  {
    id: 203,
    type: 3, // 音频类型
    user: {
      id: 303,
      avatar: '/static/img/avatar.png',
      name: '音乐爱好者'
    },
    user_id: 303,
    content: '翻唱一首《夏天的风》，希望你们喜欢这个版本~',
    audio: {
      url: '/static/img/avatar.png',
      cover: '/static/img/avatar.png',
      name: '夏天的风(翻唱版)',
      intro: '翻唱·4分钟'
    },
    browse: 428,
    view_count: 428,
    like_count: 98,
    comment_count: 27,
    time_str: '4天前',
    create_time_d: '15',
    create_time_ym: '05-15',
    create_time_str: '4天前',
    province: '成都',
    status_text: '',
    is_like: true
  },
  {
    id: 204,
    type: 0, // 纯文本类型
    user: {
      id: 304,
      avatar: '/static/img/avatar.png',
      name: '读书达人'
    },
    user_id: 304,
    content: '今天读完了《活着》这本书，感触很深。余华的文字朴实无华却直击人心。推荐给大家，这是一本能让人思考生命意义的好书。',
    browse: 312,
    view_count: 312,
    like_count: 76,
    comment_count: 19,
    time_str: '5天前',
    create_time_d: '14',
    create_time_ym: '05-14',
    create_time_str: '5天前',
    province: '杭州',
    status_text: '',
    is_like: true,
    circle_id: 6,
    circle_name: '读书会',
    circle_avatar: '/static/img/avatar.png'
  }
];

// 用户草稿箱
export const userDrafts = [
  {
    id: 301,
    type: 0, // 纯文本类型
    content: '这是一篇尚未发布的草稿，记录了一些随手的想法...',
    browse: 0,
    view_count: 0,
    like_count: 0,
    comment_count: 0,
    time_str: '刚刚',
    create_time_d: '19',
    create_time_ym: '05-19',
    create_time_str: '刚刚',
    province: '广州',
    status_text: '草稿',
    is_like: false,
    user_id: 1001
  },
  {
    id: 302,
    type: 1, // 图片类型
    content: '上周去爬山拍的照片，准备整理一下发布...',
    imgs: [
      {url: '/static/img/avatar.png', wide: 800, high: 600},
      {url: '/static/img/avatar.png', wide: 800, high: 600}
    ],
    img_count: 2,
    browse: 0,
    view_count: 0,
    like_count: 0,
    comment_count: 0,
    time_str: '昨天',
    create_time_d: '18',
    create_time_ym: '05-18',
    create_time_str: '昨天',
    province: '广州',
    status_text: '草稿',
    is_like: false,
    user_id: 1001,
    adds_name: '白云山',
    lat: '23.18576',
    lng: '113.29749'
  }
];

// 话题列表数据
export const topicList = [
  {
    id: 1,
    title: "夏日穿搭大赏",
    cover: "/static/img/avatar.png",
    intro: "分享你的夏日穿搭灵感，轻松清爽过夏天",
    user_count: 562,
    post_count: 287,
    view_count: 12893,
    is_hot: true,
    is_new: false,
    tags: ["穿搭", "夏季", "时尚"]
  },
  {
    id: 2,
    title: "居家美食recipes",
    cover: "/static/img/avatar.png",
    intro: "在家也能做出米其林级别的美食",
    user_count: 782,
    post_count: 456,
    view_count: 18652,
    is_hot: true,
    is_new: false,
    tags: ["美食", "烹饪", "家常菜"]
  },
  {
    id: 3,
    title: "城市摄影指南",
    cover: "/static/img/avatar.png",
    intro: "教你如何在城市中发现美丽的画面",
    user_count: 345,
    post_count: 198,
    view_count: 8765,
    is_hot: false,
    is_new: true,
    tags: ["摄影", "城市", "构图"]
  },
  {
    id: 4,
    title: "阅读与生活",
    cover: "/static/img/avatar.png",
    intro: "分享阅读心得，讨论如何将书中智慧融入生活",
    user_count: 429,
    post_count: 233,
    view_count: 9876,
    is_hot: false,
    is_new: false,
    tags: ["阅读", "书籍", "心得"]
  },
  {
    id: 5,
    title: "旅行探险家",
    cover: "/static/img/avatar.png",
    intro: "分享旅行故事，探索世界各地的奇妙风景",
    user_count: 678,
    post_count: 345,
    view_count: 15432,
    is_hot: true,
    is_new: false,
    tags: ["旅行", "探险", "风景"]
  }
];

// 标签列表数据
export const tagList = [
  {
    id: 1,
    name: "美食",
    count: 12897,
    is_hot: true,
    cover: "/static/img/avatar.png"
  },
  {
    id: 2,
    name: "摄影",
    count: 9865,
    is_hot: true,
    cover: "/static/img/avatar.png"
  },
  {
    id: 3,
    name: "旅行",
    count: 8756,
    is_hot: true,
    cover: "/static/img/avatar.png"
  },
  {
    id: 4,
    name: "穿搭",
    count: 7654,
    is_hot: false,
    cover: "/static/img/avatar.png"
  },
  {
    id: 5,
    name: "健身",
    count: 6543,
    is_hot: false,
    cover: "/static/img/avatar.png"
  },
  {
    id: 6,
    name: "读书",
    count: 5432,
    is_hot: false,
    cover: "/static/img/avatar.png"
  },
  {
    id: 7,
    name: "宠物",
    count: 4321,
    is_hot: true,
    cover: "/static/img/avatar.png"
  },
  {
    id: 8,
    name: "手工",
    count: 3210,
    is_hot: false,
    cover: "/static/img/avatar.png"
  }
];

// 优惠券数据
export const couponList = [
  {
    id: 1,
    name: "新人专享券",
    type: 1, // 满减券
    value: 10,
    min_price: 99,
    start_time: "2023-05-01",
    end_time: "2023-05-31",
    status: 1, // 未使用
    is_expired: false,
    category: "全场通用"
  },
  {
    id: 2,
    name: "618活动券",
    type: 1, // 满减券
    value: 50,
    min_price: 299,
    start_time: "2023-06-01",
    end_time: "2023-06-18",
    status: 1, // 未使用
    is_expired: false,
    category: "全场通用"
  },
  {
    id: 3,
    name: "生日专享券",
    type: 2, // 折扣券
    value: 8.5, // 8.5折
    min_price: 0,
    start_time: "2023-05-15",
    end_time: "2023-06-15",
    status: 1, // 未使用
    is_expired: false,
    category: "个护美妆"
  },
  {
    id: 4,
    name: "数码专享券",
    type: 1, // 满减券
    value: 100,
    min_price: 1000,
    start_time: "2023-05-10",
    end_time: "2023-05-20",
    status: 2, // 已使用
    is_expired: true,
    category: "数码电器"
  },
  {
    id: 5,
    name: "服饰专享券",
    type: 1, // 满减券
    value: 30,
    min_price: 199,
    start_time: "2023-05-01",
    end_time: "2023-05-10",
    status: 3, // 已过期
    is_expired: true,
    category: "服饰鞋包"
  }
];

// 用户收藏数据
export const userCollections = [
  {
    id: 1,
    type: 1, // 笔记
    note: {
      id: 101,
      user: {
        id: 301,
        name: "美食达人",
        avatar: "/static/img/avatar.png"
      },
      content: "分享一道简单好吃的家常菜：糖醋排骨，酸甜可口，非常下饭！",
      images: ["/static/img/avatar.png"],
      like_count: 68,
      comment_count: 15,
      time_str: "3天前"
    },
    collect_time: "2023-05-15"
  },
  {
    id: 2,
    type: 2, // 商品
    goods: {
      id: 201,
      name: "无线蓝牙耳机",
      image: "/static/img/avatar.png",
      price: "199.00",
      original_price: "299.00",
      sales: 1256
    },
    collect_time: "2023-05-10"
  },
  {
    id: 3,
    type: 3, // 话题
    topic: {
      id: 301,
      title: "夏日穿搭大赏",
      cover: "/static/img/avatar.png",
      user_count: 562,
      post_count: 287
    },
    collect_time: "2023-05-05"
  },
  {
    id: 4,
    type: 4, // 圈子
    circle: {
      id: 401,
      name: "摄影爱好",
      avatar: "/static/img/avatar.png",
      user_count: 326,
      dynamic_count: 42
    },
    collect_time: "2023-04-28"
  }
];

// 视频笔记数据
export const videoNotes = [
  {
    id: 1,
    user: {
      id: 101,
      name: "美食博主",
      avatar: "/static/img/avatar.png",
      is_follow: false
    },
    content: "15分钟快手料理教程，上班族必备！",
    video: {
      url: "/static/img/avatar.png",
      cover: "/static/img/avatar.png",
      duration: "02:45",
      width: 720,
      height: 1280
    },
    view_count: 2456,
    like_count: 356,
    comment_count: 89,
    share_count: 56,
    time_str: "2小时前",
    tags: ["美食", "快手菜", "家常菜"]
  },
  {
    id: 2,
    user: {
      id: 102,
      name: "健身教练",
      avatar: "/static/img/avatar.png",
      is_follow: true
    },
    content: "10分钟居家徒手训练，每天坚持，30天见效！",
    video: {
      url: "/static/img/avatar.png",
      cover: "/static/img/avatar.png",
      duration: "10:15",
      width: 720,
      height: 1280
    },
    view_count: 3578,
    like_count: 482,
    comment_count: 125,
    share_count: 98,
    time_str: "昨天",
    tags: ["健身", "居家训练", "徒手训练"]
  },
  {
    id: 3,
    user: {
      id: 103,
      name: "旅行vlogger",
      avatar: "/static/img/avatar.png",
      is_follow: false
    },
    content: "探秘小众旅行地，这里的风景美得让人窒息！",
    video: {
      url: "/static/img/avatar.png",
      cover: "/static/img/avatar.png",
      duration: "05:30",
      width: 1280,
      height: 720
    },
    view_count: 1892,
    like_count: 267,
    comment_count: 56,
    share_count: 34,
    time_str: "3天前",
    tags: ["旅行", "风景", "vlog"]
  }
];

// 音频笔记数据
export const audioNotes = [
  {
    id: 1,
    user: {
      id: 201,
      name: "读书达人",
      avatar: "/static/img/avatar.png",
      is_follow: true
    },
    content: "《活着》读书笔记分享，余华的文字总是那么直击人心",
    audio: {
      url: "/static/img/avatar.png",
      cover: "/static/img/avatar.png",
      duration: "15:30",
      name: "《活着》读书笔记",
      intro: "文学作品·15分钟"
    },
    view_count: 1456,
    like_count: 243,
    comment_count: 67,
    share_count: 28,
    time_str: "昨天",
    tags: ["读书", "文学", "余华"]
  },
  {
    id: 2,
    user: {
      id: 202,
      name: "音乐爱好者",
      avatar: "/static/img/avatar.png",
      is_follow: false
    },
    content: "分享一首近期很喜欢的民谣，安静时听特别有感觉",
    audio: {
      url: "/static/img/avatar.png",
      cover: "/static/img/avatar.png",
      duration: "04:25",
      name: "《夏天的风》",
      intro: "民谣·4分钟"
    },
    view_count: 982,
    like_count: 186,
    comment_count: 34,
    share_count: 15,
    time_str: "3天前",
    tags: ["音乐", "民谣", "分享"]
  },
  {
    id: 3,
    user: {
      id: 203,
      name: "心理咨询师",
      avatar: "/static/img/avatar.png",
      is_follow: true
    },
    content: "如何缓解工作压力？听听专业心理咨询师的建议",
    audio: {
      url: "/static/img/avatar.png",
      cover: "/static/img/avatar.png",
      duration: "18:45",
      name: "压力管理指南",
      intro: "心理·18分钟"
    },
    view_count: 2375,
    like_count: 426,
    comment_count: 103,
    share_count: 87,
    time_str: "5天前",
    tags: ["心理", "减压", "职场"]
  }
];

// 系统通知数据
export const systemNotices = [
  {
    id: 1,
    title: "系统升级通知",
    content: "为了提供更好的用户体验，系统将于2023年5月20日凌晨2:00-4:00进行升级维护，期间部分功能可能无法正常使用，请您谅解。",
    time: "2023-05-18 15:30:00",
    is_read: false,
    type: 1 // 系统维护
  },
  {
    id: 2,
    title: "新功能上线通知",
    content: "视频笔记功能已上线，现在您可以上传最长5分钟的视频内容，分享更丰富的生活瞬间。",
    time: "2023-05-15 10:00:00",
    is_read: true,
    type: 2 // 功能更新
  },
  {
    id: 3,
    title: "账号安全提醒",
    content: "系统检测到您的账号于2023年5月12日在非常用设备登录，如非本人操作，请及时修改密码。",
    time: "2023-05-12 20:15:00",
    is_read: true,
    type: 3 // 安全提醒
  },
  {
    id: 4,
    title: "活动邀请函",
    content: "诚邀您参加「夏日摄影大赛」，上传您的作品，赢取丰厚奖品！活动时间：2023年6月1日-6月30日。",
    time: "2023-05-10 14:00:00",
    is_read: false,
    type: 4 // 活动邀请
  }
];

// 收货地址数据
export const addressList = [
  {
    id: 1,
    name: "张三",
    phone: "13812345678",
    province: "广东省",
    city: "广州市",
    district: "天河区",
    address: "五山路华南理工大学A栋123室",
    is_default: true,
    postal_code: "510000",
    tag: "学校"
  },
  {
    id: 2,
    name: "张三",
    phone: "13812345678",
    province: "广东省",
    city: "广州市",
    district: "海珠区",
    address: "新港中路123号A座456室",
    is_default: false,
    postal_code: "510000",
    tag: "家"
  },
  {
    id: 3,
    name: "李四",
    phone: "13987654321",
    province: "广东省",
    city: "深圳市",
    district: "南山区",
    address: "科技园南区T3栋789室",
    is_default: false,
    postal_code: "518000",
    tag: "公司"
  }
];

// 广告/轮播图数据
export const bannerList = [
  {
    id: 1,
    image: "/static/img/avatar.png",
    title: "618年中大促",
    url: "/pages/activity/sale?id=1",
    type: 1 // 活动
  },
  {
    id: 2,
    image: "/static/img/avatar.png",
    title: "新品首发",
    url: "/pages/goods/details?id=101",
    type: 2 // 商品
  },
  {
    id: 3,
    image: "/static/img/avatar.png",
    title: "摄影大赛",
    url: "/pages/activity/photo?id=2",
    type: 1 // 活动
  },
  {
    id: 4,
    image: "/static/img/avatar.png",
    title: "会员专享",
    url: "/pages/user/vip",
    type: 3 // 会员
  }
];

// 用户足迹/浏览历史
export const browseHistory = [
  {
    id: 1,
    type: 1, // 商品
    goods: {
      id: 101,
      name: "无线蓝牙耳机",
      image: "/static/img/avatar.png",
      price: "199.00"
    },
    time: "2023-05-19 15:30:00"
  },
  {
    id: 2,
    type: 2, // 笔记
    note: {
      id: 201,
      title: "城市街拍分享",
      cover: "/static/img/avatar.png",
      user: {
        name: "摄影爱好者",
        avatar: "/static/img/avatar.png"
      }
    },
    time: "2023-05-18 10:15:00"
  },
  {
    id: 3,
    type: 1, // 商品
    goods: {
      id: 102,
      name: "机械键盘",
      image: "/static/img/avatar.png",
      price: "299.00"
    },
    time: "2023-05-17 20:45:00"
  },
  {
    id: 4,
    type: 3, // 店铺
    shop: {
      id: 301,
      name: "数码专营店",
      logo: "/static/img/avatar.png",
      follow_count: 5678
    },
    time: "2023-05-16 14:20:00"
  }
];

// 直播间详情数据
export const liveRoomDetail = {
  id: 1,
  title: "夏季新品服装展示",
  cover: "/static/img/avatar.png",
  start_time: "2023-05-20 20:00:00",
  end_time: "2023-05-20 22:00:00",
  status: 1, // 1-未开始 2-直播中 3-已结束
  viewer_count: 1256,
  like_count: 3578,
  host: {
    id: 101,
    name: "时尚达人",
    avatar: "/static/img/avatar.png",
    fans_count: 12580
  },
  notice: "今晚8点准时开播，带来夏季最新服装展示，还有超值优惠券发放！",
  goods_list: [
    {
      id: 1001,
      name: "夏季薄款T恤",
      image: "/static/img/avatar.png",
      price: "89.00",
      original_price: "129.00"
    },
    {
      id: 1002,
      name: "休闲短裤",
      image: "/static/img/avatar.png",
      price: "129.00",
      original_price: "199.00"
    },
    {
      id: 1003,
      name: "防晒衣",
      image: "/static/img/avatar.png",
      price: "159.00",
      original_price: "259.00"
    }
  ],
  chat_messages: [
    {
      id: 10001,
      user: {
        id: 2001,
        name: "用户A",
        avatar: "/static/img/avatar.png",
        level: 5
      },
      content: "主播好漂亮啊！",
      time: "20:05:30"
    },
    {
      id: 10002,
      user: {
        id: 2002,
        name: "用户B",
        avatar: "/static/img/avatar.png",
        level: 3
      },
      content: "这件T恤有S码吗？",
      time: "20:06:15"
    },
    {
      id: 10003,
      user: {
        id: 101,
        name: "时尚达人",
        avatar: "/static/img/avatar.png",
        level: 10,
        is_host: true
      },
      content: "S码有的，库存充足，大家可以放心下单~",
      time: "20:06:45"
    }
  ]
};

// 视频推荐数据
export const videoRecommend = [
  {
    id: 1,
    title: "如何30天练出马甲线",
    cover: "/static/img/avatar.png",
    duration: "10:25",
    play_count: 25678,
    user: {
      id: 101,
      name: "健身教练小王",
      avatar: "/static/img/avatar.png"
    },
    like_count: 1256,
    comment_count: 356
  },
  {
    id: 2,
    title: "一日三餐健康食谱",
    cover: "/static/img/avatar.png",
    duration: "15:30",
    play_count: 18765,
    user: {
      id: 102,
      name: "营养师小李",
      avatar: "/static/img/avatar.png"
    },
    like_count: 987,
    comment_count: 245
  },
  {
    id: 3,
    title: "10分钟快速妆容教程",
    cover: "/static/img/avatar.png",
    duration: "08:45",
    play_count: 32156,
    user: {
      id: 103,
      name: "美妆博主小张",
      avatar: "/static/img/avatar.png"
    },
    like_count: 2356,
    comment_count: 678
  },
  {
    id: 4,
    title: "夏日街拍穿搭指南",
    cover: "/static/img/avatar.png",
    duration: "12:15",
    play_count: 15678,
    user: {
      id: 104,
      name: "时尚达人小赵",
      avatar: "/static/img/avatar.png"
    },
    like_count: 1123,
    comment_count: 289
  }
];

// 积分商城数据
export const pointsMall = {
  user_points: 1256,
  banner: [
    {
      id: 1,
      image: "/static/img/avatar.png",
      url: "/pages/points_mall/activity?id=1"
    },
    {
      id: 2,
      image: "/static/img/avatar.png",
      url: "/pages/points_mall/activity?id=2"
    }
  ],
  categories: [
    {
      id: 1,
      name: "实物商品",
      icon: "/static/img/avatar.png"
    },
    {
      id: 2,
      name: "优惠券",
      icon: "/static/img/avatar.png"
    },
    {
      id: 3,
      name: "会员特权",
      icon: "/static/img/avatar.png"
    }
  ],
  products: [
    {
      id: 1,
      name: "时尚双肩包",
      image: "/static/img/avatar.png",
      points: 1999,
      original_price: "299.00",
      stock: 100,
      exchange_count: 56
    },
    {
      id: 2,
      name: "无线充电器",
      image: "/static/img/avatar.png",
      points: 999,
      original_price: "129.00",
      stock: 200,
      exchange_count: 128
    },
    {
      id: 3,
      name: "精美保温杯",
      image: "/static/img/avatar.png",
      points: 699,
      original_price: "89.00",
      stock: 150,
      exchange_count: 87
    },
    {
      id: 4,
      name: "满200减50优惠券",
      image: "/static/img/avatar.png",
      points: 299,
      original_price: "50.00",
      stock: 500,
      exchange_count: 356
    }
  ],
  exchange_records: [
    {
      user_avatar: "/static/img/avatar.png",
      product_name: "精美保温杯",
      time: "刚刚"
    },
    {
      user_avatar: "/static/img/avatar.png",
      product_name: "无线充电器",
      time: "5分钟前"
    },
    {
      user_avatar: "/static/img/avatar.png",
      product_name: "满200减50优惠券",
      time: "10分钟前"
    }
  ]
};

// 模拟API响应
export const getMockData = (url, data, method) => {
  // 笔记详情
  if (url === 'note/details' && method === 'GET') {
    return {
      code: 200,
      msg: '获取成功',
      data: noteDetail
    }
  }
  
  // 评论列表
  if (url === 'comment/list' && method === 'GET') {
    return {
      code: 200,
      msg: '获取成功',
      data: {
        data: commentList,
        current_page: 1,
        last_page: 1,
        total: commentList.length
      }
    }
  }
  
  // 子评论列表
  if (url === 'comment/list/son' && method === 'GET') {
    const commentId = data.id
    const parentComment = commentList.find(item => item.id === commentId)
    if (parentComment) {
      return {
        code: 200,
        msg: '获取成功',
        data: {
          data: parentComment.list,
          current_page: 1,
          last_page: 1,
          total: parentComment.list.length
        }
      }
    }
  }
  
  // 保存评论
  if (url === 'comment/save' && method === 'POST') {
    return {
      code: 200,
      msg: '评论成功',
      data: {
        id: Math.floor(Math.random() * 10000),
        user: {
          id: 1001,
          name: "当前用户",
          avatar: "/static/img/avatar1.png"
        },
        content: data.content,
        create_time_str: "刚刚",
        province: "本地",
        status: 1,
        list_count: 0,
        list: []
      }
    }
  }
  
  // 删除评论
  if (url === 'comment/del' && method === 'POST') {
    return {
      code: 200,
      msg: '删除成功'
    }
  }
  
  // 删除笔记
  if (url === 'note/del' && method === 'POST') {
    return {
      code: 200,
      msg: '删除成功'
    }
  }
  
  // 举报笔记
  if (url === 'note/report' && method === 'POST') {
    return {
      code: 200,
      msg: '举报成功'
    }
  }
  
  // 点赞笔记
  if (url === 'note/like' && method === 'POST') {
    return {
      code: 200,
      msg: '操作成功'
    }
  }
  
  // 圈子列表
  if (url === 'circle/list' && method === 'GET') {
    const pageSize = 4
    const page = data.page || 1
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    let list = [...circleList]
    if (data.type === 1) {
      // 我的圈子，显示特定ID的圈子
      const myCircleIds = [1, 3, 5, 8, 10]
      list = list.filter(item => myCircleIds.includes(item.id))
    }
    
    const pageData = list.slice(startIndex, endIndex)
    
    return {
      code: 200,
      msg: '获取成功',
      data: {
        data: pageData,
        current_page: page,
        last_page: Math.ceil(list.length / pageSize),
        total: list.length
      }
    }
  }
  
  // 获取直播信息
  if (url === 'live/details' && method === 'GET') {
    const randomIndex = Math.floor(Math.random() * liveInfo.length);
    const live = liveInfo[randomIndex];
    return {
      code: 200,
      msg: '获取成功',
      data: [live.title, live.path, live.content, live.url, live.status]
    }
  }
  
  // 如果没有匹配的模拟数据，返回null，表示需要进行真实请求
  return null
}

export default {
  userInfo,
  circleList,
  activityList,
  dynamicList,
  goodsList,
  goodsDetails,
  orderList,
  evaluateList,
  cartList,
  classifyList,
  searchData,
  noteDetail,
  noteComments,
  messageList,
  userCircleList,
  circleDetail,
  commentList,
  getMockData,
  liveInfo,
  userNotes,
  userLikes,
  userDrafts,
  
  // 新增数据类型
  topicList,
  tagList,
  couponList,
  userCollections,
  videoNotes,
  audioNotes,
  systemNotices,
  addressList,
  bannerList,
  browseHistory,
  liveRoomDetail,
  videoRecommend,
  pointsMall
} 