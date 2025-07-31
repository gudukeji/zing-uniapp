# Tops 组件使用说明

## 组件介绍

`tops.vue` 是一个话题推荐和追剧推荐的复合组件，包含两个主要区域：

1. **酷枪话题区域** - 显示热门话题列表，支持点击跳转到话题详情
2. **追剧推荐区域** - 显示推荐的剧集圈子，支持轮播展示和一键加入功能

## 组件特性

- ✅ 支持 H5、小程序、APP 多端兼容
- ✅ 响应式布局，适配不同屏幕尺寸
- ✅ 支持自定义数据源
- ✅ 内置默认数据，开箱即用
- ✅ 支持事件回调和页面跳转
- ✅ 优雅的渐变背景和动画效果

## 使用方法

### 1. 基础使用

```vue
<template>
  <view>
    <!-- 基础使用，使用默认数据 -->
    <tops />
  </view>
</template>

<script>
import tops from '@/components/tops/tops.vue'

export default {
  components: {
    tops
  }
}
</script>
```

### 2. 自定义数据

```vue
<template>
  <view>
    <tops 
      :topics="topicList" 
      :dramas="dramaList"
      :showDramaSection="true"
      @close-drama="onCloseDrama"
      @join-all="onJoinAll"
    />
  </view>
</template>

<script>
import tops from '@/components/tops/tops.vue'

export default {
  components: {
    tops
  },
  data() {
    return {
      topicList: [
        { id: 1, name: '自定义话题1', count: 1000 },
        { id: 2, name: '自定义话题2', count: 2000 }
      ],
      dramaList: [
        { 
          id: 1, 
          name: '自定义剧集1', 
          cover: '/path/to/cover1.jpg', 
          memberCount: 50000,
          isJoined: false
        }
      ]
    }
  },
  methods: {
    onCloseDrama() {
      console.log('用户关闭了追剧区域')
    },
    onJoinAll(dramas) {
      console.log('用户一键加入了所有剧集:', dramas)
    }
  }
}
</script>
```

## Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| topics | Array | [] | 话题数据列表 |
| dramas | Array | [] | 剧集数据列表 |
| showDramaSection | Boolean | true | 是否显示追剧推荐区域 |

### topics 数据结构

```javascript
[
  {
    id: 1,           // 话题ID
    name: '话题名称', // 话题名称
    count: 1000      // 互动数量
  }
]
```

### dramas 数据结构

```javascript
[
  {
    id: 1,                    // 剧集ID
    name: '剧集名称',         // 剧集名称
    cover: '/path/to/cover',  // 封面图片路径
    memberCount: 50000,       // 圈友数量
    isJoined: false          // 是否已加入
  }
]
```

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| close-drama | - | 用户点击关闭追剧区域时触发 |
| join-all | dramas | 用户点击一键加入时触发，返回剧集列表 |

## 样式定制

组件使用了 scoped 样式，如需自定义样式，可以通过以下方式：

### 1. 全局样式覆盖

```css
/* 在全局样式文件中 */
.tops-container .topic-section {
  background: #f5f5f5;
}

.tops-container .drama-section {
  background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}
```

### 2. 深度选择器

```vue
<style>
.your-page ::v-deep .tops-container {
  margin: 20rpx;
  border-radius: 16rpx;
}
</style>
```

## 注意事项

1. **图片资源**: 确保 `/static/img/` 目录下有相应的图标文件
2. **页面路由**: 组件内部使用了页面跳转，确保对应的页面路由存在
3. **登录状态**: 一键加入功能需要检查用户登录状态
4. **数据格式**: 传入的数据需要符合指定的数据结构

## 兼容性

- ✅ H5
- ✅ 微信小程序
- ✅ 支付宝小程序
- ✅ APP (iOS/Android)
- ✅ 其他小程序平台

## 布局优化说明

根据用户提供的截图，我们对话题区域进行了以下优化：

### 布局结构调整
- **左右分栏布局**: 左侧显示主要话题（前3个），右侧显示次要话题（后3个）
- **主要话题区域**: 显示话题名称 + 互动数量，支持完整的交互功能
- **次要话题区域**: 仅显示话题名称，节省空间，支持点击跳转

### 样式细节优化
- **字体大小**: 调整为30rpx，更符合截图中的视觉效果
- **间距调整**: 减少padding为12rpx，使布局更紧凑
- **颜色统一**: 话题标签#号使用黑色，与截图保持一致
- **文本处理**: 右侧话题名称支持省略号显示，防止溢出

### 数据结构
```javascript
// 主要话题（左侧显示）
mainTopics: [
  { id: 1, name: '小敏家实时追剧盖楼', count: 934 },
  { id: 2, name: '偶像剧里的超白目表情包', count: 1801 },
  { id: 3, name: '找到你的专属星座表情...', count: 1100 }
]

// 次要话题（右侧显示）
sideTopics: [
  { id: 4, name: '新年', count: 0 },
  { id: 5, name: '酷跑', count: 0 },
  { id: 6, name: '追光', count: 0 }
]
```

## 预览组件

我们提供了一个预览组件 `preview.vue`，可以单独查看话题区域的效果：

```vue
<template>
  <tops :showDramaSection="false" />
</template>
```

## 更新日志

### v1.1.0
- 根据用户截图优化话题区域布局
- 实现左右分栏显示
- 调整字体大小和间距
- 优化文本显示效果

### v1.0.0
- 初始版本发布
- 支持话题推荐和追剧推荐功能
- 多端兼容适配
