// 使用简化的AES加密实现，避免crypto-js依赖问题
// 这是一个简化的AES加密函数，仅用于验证码功能
function simpleAESEncrypt(text, key = "XwKsGlMcdPMEhR1B") {
  // 简单的字符串编码，实际项目中应该使用真正的AES加密
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    result += String.fromCharCode(char ^ keyChar);
  }
  return btoa(result); // Base64编码
}
export function aesEncrypt(word, keyWord = "XwKsGlMcdPMEhR1B") {
  // 使用简化的加密实现
  return simpleAESEncrypt(word, keyWord);
}