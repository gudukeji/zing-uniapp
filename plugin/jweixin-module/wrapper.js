// 微信JSSDK ES6模块包装器
// 由于原始的jweixin是UMD格式，我们需要一个包装器来提供ES6模块导出

// 导入原始的jweixin模块（UMD格式）
import './index.js';

// 导出全局的wx对象
const WechatJSSDK = typeof window !== 'undefined' && window.wx ? window.wx : null;

export default WechatJSSDK;
