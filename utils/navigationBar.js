/**
 * 导航栏工具函数
 * 提供安全的导航栏颜色设置功能，确保兼容性
 */

/**
 * 验证颜色值格式
 * @param {String} color 颜色值
 * @returns {Boolean} 是否为有效的十六进制颜色
 */
export function isValidHexColor(color) {
  return typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * 验证RGB颜色值格式
 * @param {String} color RGB颜色值
 * @returns {Boolean} 是否为有效的RGB颜色
 */
export function isValidRGBColor(color) {
  return typeof color === 'string' && /^RGB\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(color);
}

/**
 * 安全设置导航栏颜色
 * @param {Object} options 配置选项
 * @param {String} options.frontColor 前景色，支持 #000000 和 #ffffff
 * @param {String} options.backgroundColor 背景色，支持十六进制和RGB格式
 * @param {Object} options.animation 动画配置
 * @param {String} options.defaultFrontColor 默认前景色
 * @param {String} options.defaultBackgroundColor 默认背景色
 */
export function safeSetNavigationBarColor(options = {}) {
  const {
    frontColor = '#ffffff',
    backgroundColor = '#ffffff',
    animation = { duration: 300, timingFunc: 'easeIn' },
    defaultFrontColor = '#ffffff',
    defaultBackgroundColor = '#ffffff'
  } = options;

  // 验证前景色（只支持黑白两色）
  let validFrontColor = frontColor;
  if (frontColor !== '#000000' && frontColor !== '#ffffff') {
    console.warn('前景色只支持 #000000 和 #ffffff，当前值:', frontColor);
    validFrontColor = defaultFrontColor;
  }

  // 验证背景色
  let validBackgroundColor = backgroundColor;
  if (!isValidHexColor(backgroundColor) && !isValidRGBColor(backgroundColor)) {
    console.warn('背景色格式错误:', backgroundColor);
    validBackgroundColor = defaultBackgroundColor;
  }

  // 特殊处理：transparent 在某些小程序中不支持
  if (backgroundColor === 'transparent') {
    console.warn('transparent 在某些小程序中不支持，使用默认背景色');
    validBackgroundColor = defaultBackgroundColor;
  }

  try {
    const config = {
      frontColor: validFrontColor,
      backgroundColor: validBackgroundColor
    };

    // 只有在动画配置有效时才添加
    if (animation && typeof animation === 'object') {
      config.animation = animation;
    }

    uni.setNavigationBarColor(config);
  } catch (error) {
    console.error('设置导航栏颜色失败:', error);
    
    // 降级处理：使用最基本的配置
    try {
      uni.setNavigationBarColor({
        frontColor: defaultFrontColor,
        backgroundColor: defaultBackgroundColor
      });
    } catch (fallbackError) {
      console.error('降级设置导航栏颜色也失败:', fallbackError);
    }
  }
}

/**
 * 根据主题状态设置导航栏颜色
 * @param {Number|Boolean} status 状态值，0/false为浅色主题，1/true为深色主题
 * @param {String} lightBgColor 浅色主题背景色
 * @param {String} darkBgColor 深色主题背景色
 */
export function setNavigationBarByTheme(status, lightBgColor = '#ffffff', darkBgColor = '#000000') {
  const isDark = Boolean(status);
  
  safeSetNavigationBarColor({
    frontColor: isDark ? '#ffffff' : '#000000',
    backgroundColor: isDark ? darkBgColor : lightBgColor,
    animation: { duration: 300, timingFunc: 'easeIn' }
  });
}

/**
 * 从主题色数组中安全获取导航栏颜色
 * @param {Array} themeColors 主题色数组
 * @param {Number} index 索引
 * @param {String} defaultColor 默认颜色
 * @param {String} frontColor 前景色
 */
export function setNavigationBarFromTheme(themeColors, index, defaultColor = '#1db0fc', frontColor = '#ffffff') {
  if (!Array.isArray(themeColors) || themeColors.length === 0) {
    console.warn('主题色数组无效');
    safeSetNavigationBarColor({
      frontColor,
      backgroundColor: defaultColor
    });
    return;
  }

  // 确保索引在有效范围内
  const safeIndex = Math.max(0, Math.min(index, themeColors.length - 1));
  const backgroundColor = themeColors[safeIndex] || defaultColor;

  safeSetNavigationBarColor({
    frontColor,
    backgroundColor,
    defaultBackgroundColor: defaultColor
  });
}

/**
 * 小程序兼容性检查
 * @returns {Boolean} 是否支持setNavigationBarColor
 */
export function checkNavigationBarSupport() {
  return typeof uni !== 'undefined' && typeof uni.setNavigationBarColor === 'function';
}

export default {
  safeSetNavigationBarColor,
  setNavigationBarByTheme,
  setNavigationBarFromTheme,
  isValidHexColor,
  isValidRGBColor,
  checkNavigationBarSupport
};
