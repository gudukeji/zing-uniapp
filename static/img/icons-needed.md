# Tops 组件所需图标文件

为了确保 `tops.vue` 组件正常显示，需要在 `/static/img/` 目录下准备以下图标文件：

## 必需图标

### 话题区域图标
- `topic_hot.png` - 话题热门图标 (建议尺寸: 40x40px)
- `arrow_right.png` - 右箭头图标 (建议尺寸: 24x24px)

### 追剧区域图标
- `close.png` - 关闭按钮图标 (建议尺寸: 32x32px)
- `check.png` - 已加入标记图标 (建议尺寸: 20x20px)

### 默认剧集封面图片
- `drama1.jpg` - 剧集封面1 (建议尺寸: 120x160px)
- `drama2.jpg` - 剧集封面2 (建议尺寸: 120x160px)
- `drama3.jpg` - 剧集封面3 (建议尺寸: 120x160px)
- `drama4.jpg` - 剧集封面4 (建议尺寸: 120x160px)

## 图标设计建议

### 话题热门图标 (topic_hot.png)
- 可以是火焰图标或热门标识
- 颜色建议：橙色或红色
- 风格：简洁、现代

### 右箭头图标 (arrow_right.png)
- 简单的右向箭头
- 颜色：#999999
- 风格：线性或填充

### 关闭按钮图标 (close.png)
- X 形状或圆形关闭图标
- 颜色：白色或浅色
- 背景：透明

### 已加入标记图标 (check.png)
- 对勾图标
- 颜色：白色
- 背景：透明

## 临时解决方案

如果暂时没有这些图标，可以：

1. **使用 Unicode 字符替代**：
   ```vue
   <!-- 替换图标为文字 -->
   <text class="icon-text">🔥</text> <!-- 代替 topic_hot.png -->
   <text class="icon-text">→</text>  <!-- 代替 arrow_right.png -->
   <text class="icon-text">×</text>  <!-- 代替 close.png -->
   <text class="icon-text">✓</text>  <!-- 代替 check.png -->
   ```

2. **使用纯色背景替代剧集封面**：
   ```css
   .drama-cover {
     background: linear-gradient(45deg, #667eea, #764ba2);
   }
   ```

3. **下载免费图标资源**：
   - [Iconfont](https://www.iconfont.cn/)
   - [Feather Icons](https://feathericons.com/)
   - [Heroicons](https://heroicons.com/)

## 注意事项

1. 图标文件格式建议使用 PNG，支持透明背景
2. 图标尺寸要适配不同设备的显示密度
3. 确保图标文件路径正确，避免 404 错误
4. 可以考虑使用 SVG 格式获得更好的缩放效果

## 文件结构示例

```
static/
└── img/
    ├── topic_hot.png
    ├── arrow_right.png
    ├── close.png
    ├── check.png
    ├── drama1.jpg
    ├── drama2.jpg
    ├── drama3.jpg
    └── drama4.jpg
```
