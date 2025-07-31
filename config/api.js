// API接口定义
const api = {
    // 笔记详情相关接口
    dynamicDetailsUrl: 'note/details', // 获取笔记详情
    commentListUrl: 'comment/list', // 获取评论列表
    sonCommentUrl: 'comment/list/son', // 获取子评论列表
    saveCommentUrl: 'comment/save', // 保存评论
    delCommentUrl: 'comment/del', // 删除评论
    delDynamicUrl: 'note/del', // 删除笔记
    dynamicReasonUrl: 'note/report', // 举报笔记
    likeDynamicUrl: 'note/like', // 点赞笔记
    
    // 圈子相关接口
    circleDetailsUrl: 'circle/details', // 圈子详情
    takeColumnUrl: 'circle/take', // 加入圈子
    
    // 动态推荐接口
    dynamicRecommendUrl: 'dynamic/recommend', // 动态推荐
    waterfallRecommendUrl: 'dynamic/waterfall', // 瀑布流推荐
    
    // 上传相关接口
    uploadFileUrl: 'upload/image', // 上传文件
  }
  
  export {
    api
  }
  
  export default {
    api
  }