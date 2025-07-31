<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="nav-box" :style="{'padding-top': statusBarHeight + 'px'}">
      <view class="nav-item df" :style="{'width': '100%', 'height': titleBarHeight + 'px'}">
        <view class="nav-back df" @tap="goBack">
          <image src="/static/img/back.png" style="width:34rpx;height:34rpx"></image>
        </view>
        <view class="nav-publish" :style="publishButtonStyle">
          <view
            class="publish-btn"
            :class="{ 'publish-btn-disabled': isContentEmpty }"
            @tap="handlePublish">
            {{ publishButtonText }}
          </view>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-box" :style="{'margin-top': statusBarHeight + titleBarHeight + 'px'}">
      <!-- 文本编辑区 -->
      <view class="textarea-container">
        <!-- 透明的textarea用于输入 -->
        <textarea
          class="textarea-input"
          :show-confirm-bar="false"
          maxlength="2000"
          cursor-spacing="30"
          auto-height
          placeholder="填写笔记内容"
          v-model="content"
          @input="contentInput"
          @focus="onTextareaFocus"
          @blur="onTextareaBlur"
          :focus="autoFocus">
        </textarea>

        <!-- 覆盖层：显示带颜色的文本 -->
        <view class="text-overlay" :class="{ 'overlay-focused': isEditing }">
          <view class="formatted-content">
            <text
              v-for="(segment, index) in contentSegments"
              :key="index"
              :class="segment.isMention ? 'mention-text' : 'normal-text'"
            >{{ segment.text }}</text>
            <!-- 占位符文本 -->
            <text v-if="!content" class="placeholder-text">填写笔记内容</text>
          </view>
        </view>

        <!-- @用户标签显示 -->
        <view v-if="mentionUsers.length > 0" class="mention-tags">
          <!-- 已@的用户标签 -->
          <view
            v-for="(user, index) in mentionUsers"
            :key="user.uid"
            class="mention-tag"
            @tap="removeMentionUser(user.uid)"
          >
            <image :src="user.avatar" class="mention-avatar" mode="aspectFill"></image>
            <text class="mention-nickname">@{{ user.nickname }}</text>
            <text class="mention-delete">×</text>
          </view>
        </view>
      </view>
      
      <!-- 多媒体内容区域 -->
      <scroll-view v-if="type != 0" scroll-x="true" class="scroll-box">
        <view class="scroll-item">
          <!-- 图片类型 -->
          <block v-if="type == 2">
            <view v-for="(item, index) in imgs" :key="index" class="img-box">
              <image :src="item.url" mode="aspectFill" @tap="previewClick" :data-i="index"></image>
              <view class="del df" @tap="delClick(0, index)">
                <image src="/static/img/tabbar/33.png"></image>
              </view>
              <view v-if="imgs.length > 1" class="sort df">
                <view 
                  class="sort-item df" 
                  :style="{'color': index > 0 ? '#fff' : '#cecece'}" 
                  @tap="onSort(index, 0)">
                  ←
                </view>
                <view 
                  class="sort-item df" 
                  :style="{'color': index < imgs.length - 1 ? '#fff' : '#cecece'}" 
                  @tap="onSort(index, 1)">
                  →
                </view>
              </view>
            </view>
            
            <view class="img-box file-add df" @tap="addImgClick(1)">
              <image src="/static/img/tabbar/3.png"></image>
              <text>选择图片</text>
            </view>
            <view style="flex-shrink:0;width:20rpx;height:20rpx"></view>
          </block>
          
          <!-- 视频类型 -->
          <view v-if="type == 3" class="video-box df">
            <!-- 未上传视频 -->
            <view v-if="!video.url" class="video-item file-add df" @tap="chooseVideo">
              <image src="/static/img/tabbar/3.png"></image>
              <text>选择视频，建议时长</text>
              <text>60秒以内</text>
            </view>
            
            <!-- 已上传视频 -->
            <block v-else>
              <view class="video-item">
                <video 
                  :src="video.url" 
                  :custom-cache="false"
                  :controls="true"
                  :show-center-play-btn="true"
                  :show-play-btn="true"
                  :show-fullscreen-btn="true"
                  :show-progress="true"
                  :enable-progress-gesture="true"
                  :object-fit="'contain'"
                  @error="onVideoError"
                  @load="onVideoLoad"
                  style="width: 100%; height: 100%; border-radius: 8rpx;">
                </video>
                <view class="del df" @tap="delClick(1)">
                  <image src="/static/img/tabbar/33.png"></image>
                </view>
              </view>
                
              <!-- 视频封面管理 -->
              <view v-if="video.cover" class="video-item">
                <image :src="video.cover" mode="aspectFill"></image>
                <view class="del df" @tap="delClick(2)">
                  <image src="/static/img/tabbar/33.png"></image>
                </view>
              </view>
              <view v-else class="video-item file-add df" @tap="addImgClick(2)">
                <image src="/static/img/tabbar/3.png"></image>
                <text>添加封面</text>
              </view>
            </block>
          </view>
          
          <!-- 音频类型 -->
          <block v-if="type == 4">
            <!-- 未上传音频 -->
            <view v-if="!audio.url" class="audio-box file-add df" @tap="addFileClick">
              <image src="/static/img/tabbar/3.png"></image>
              <text>上传音频，支持格式mp3和m4a</text>
            </view>
            
            <!-- 已上传音频 -->
            <view v-else class="file-audio df">
              <image class="audio-bg" :src="audio.cover"></image>
              <view class="audio-mb"></view>
              
              <!-- 音频封面 -->
              <view v-if="audio.cover" class="audio-left">
                <image :src="audio.cover"></image>
                <image class="icon xwb" src="/static/img/audio.png"></image>
                <view class="del df" @tap="delClick(3)">
                  <image src="/static/img/tabbar/33.png"></image>
                </view>
              </view>
              <view v-else class="audio-left file-add df" @tap="addImgClick(3)">
                <image src="/static/img/tabbar/3.png"></image>
                <text>上传封面</text>
              </view>
              
              <!-- 音频信息 -->
              <view style="width:calc(100% - 268rpx)">
                <input 
                  class="audio-t1" 
                  placeholder="点击填写音频名称" 
                  placeholder-class="aph" 
                  v-model="audio.name" />
                <input 
                  class="audio-t2" 
                  placeholder="点击填写音频信息" 
                  placeholder-class="aph" 
                  v-model="audio.intro" />
              </view>
              
              <view class="del df" @tap="delClick(4)">
                <image src="/static/img/tabbar/33.png"></image>
              </view>
            </view>
          </block>
        </view>
      </scroll-view>
      
      <!-- 投票组件预览 -->
      <VoteComponent
        v-if="showVote && previewVoteInfo"
        :voteInfo="previewVoteInfo"
        :showDelete="true"
        :disabled="true"
        @vote-delete="deleteVote"
      />
      
      <!-- 底部选择区域 -->
      <view class="content-item df">
        <!-- 位置选择 -->
        <view 
          :class="['tag-item', 'df', adds.name ? 'selected' : 'unselected']" 
          style="border-radius:64rpx; margin-right: 16rpx;" 
          @tap="locationClick">
          <image 
            class="icon location-icon" 
            src="/static/img/wz.png" 
            :style="{
              'border-radius': '50%',
              'background': '#f8f8f8',
              'opacity': adds.name ? '1' : '0.6'
            }">
          </image>
          <text 
            :style="{'color': adds.name ? '#000' : '#999'}"
            :title="adds.address"
            class="location-text">
            {{ adds.name || '添加位置' }}
          </text>
        </view>
        
        <!-- 圈子选择 -->
        <view 
          :class="['tag-item', 'df', circle.name ? 'selected' : 'unselected']" 
          style="border-radius:64rpx" 
          @tap="upPopupClick(true)">
          <image 
            class="icon" 
            :src="circle.avatar || '/static/img/qz2.png'" 
            :style="{
              'border-radius': '50%',
              'background': '#f8f8f8',
              'opacity': circle.name ? '1' : '0.6'
            }">
          </image>
          <text :style="{'color': circle.name ? '#000' : '#999'}">{{ circle.name || '选择圈子' }}</text>
        </view>
      </view>
    </view>
    
    <!-- 标签区域 -->
    <view class="tags-box" v-if="(activity && activity.id) || goods.length > 0 || selectedTopics.length > 0">
      <!-- 活动标签 - 仅在已选择时显示 -->
      <view v-if="activity && activity.id" class="tag-item df" @tap="activityPopupClick(true)" style="border-radius:64rpx">
        <image 
          class="icon" 
          :src="activity.img" 
          style="border-radius:50%;background:#f8f8f8">
        </image>
        <text style="color:#000">{{ activity.name }}</text>
      </view>
      
      <!-- 已添加商品标签 -->
      <view v-for="(v, index) in goods" :key="'goods-'+index" class="tag-item df" style="border-radius:64rpx">
        <image 
          class="icon" 
          :src="v.product_img" 
          mode="aspectFill" 
          style="border-radius:50%;background:#f8f8f8">
        </image>
        <text style="color:#000">{{ v.goods_name }}</text>
      </view>
      
      <!-- 已选话题标签 -->
      <view v-for="(topic, index) in selectedTopics" :key="'topic-'+index" class="tag-item df" style="border-radius:64rpx">
        <image 
          class="icon" 
          :src="topic.icon" 
          mode="aspectFill" 
          style="border-radius:50%;background:#f8f8f8">
        </image>
        <text style="color:#000">#{{ topic.name }}#</text>
        <view class="tag-delete" @tap="removeSelectedTopic(index)">
          <text>×</text>
        </view>
      </view>
    </view>
    
    <!-- 多媒体工具栏 -->
    <view class="media-toolbar-fixed" :style="{ bottom: keyboardHeight + 'px' }" :class="{ 'keyboard-active': keyboardHeight > 0 }">
      <view class="toolbar-box">
        <!-- 图片上传按钮 -->
        <view class="toolbar-item" @tap="addImgClick(1)">
          <image src="/static/img/add/photo.png" mode="aspectFit"></image>
        </view>
        
        <!-- 视频上传按钮 -->
        <view class="toolbar-item" @tap="chooseVideo">
          <image src="/static/img/add/publish-video.png" mode="aspectFit"></image>
        </view>
        
        <!-- 话题按钮 -->
        <view class="toolbar-item" @tap="topicPopupClick(true)">
          <image src="/static/img/add/publish_topic.png" mode="aspectFit"></image>
        </view>
        
        <!-- @用户按钮 -->
        <view class="toolbar-item" @tap="showFollowUsers">
          <image src="/static/img/add/publish_at.png" mode="aspectFit"></image>
        </view>
        
        <!-- 表情按钮 -->
        <view :class="['toolbar-item', showEmojiPanel ? 'active' : '']" @tap="toggleEmojiPanel">
          <image src="/static/img/add/emoji.png" mode="aspectFit"></image>
        </view>
        
        <!-- 更多按钮 -->
        <view class="toolbar-item" @tap="toggleMoreOptions">
          <image src="/static/img/add/add.png" mode="aspectFit"></image>
        </view>
      </view>
      
      <!-- 更多选项菜单 -->
      <view class="more-options-panel" :class="{ 'expanded': showMoreOptions }">
        <view class="more-options-row">
          <!-- 音频按钮 -->
          <view class="toolbar-item" @tap="handleMediaClick(7)">
            <image src="/static/img/add/voice.png" mode="aspectFit"></image>
            <text class="toolbar-label">音频</text>
          </view>
          
          <!-- 投票按钮 -->
          <view class="toolbar-item" @tap="handleMediaClick(8)">
            <image src="/static/img/tp.png" mode="aspectFit"></image>
            <text class="toolbar-label">投票</text>
          </view>
          
          <!-- 选择活动按钮 -->
          <view class="toolbar-item" @tap="activityPopupClick(true)">
            <image src="/static/img/huodong.png" mode="aspectFit"></image>
            <text class="toolbar-label">活动</text>
          </view>
          
          <!-- 添加商品按钮 -->
          <view class="toolbar-item" @tap="shopPopupClick(true)">
            <image src="/static/img/shangping.png" mode="aspectFit"></image>
            <text class="toolbar-label">商品</text>
          </view>
        </view>
      </view>
      
      <!-- 表情面板 -->
      <emoji-panel
        v-if="showEmojiPanel"
        :show="showEmojiPanel"
        :content="content"
        @select="onSelectEmoji"
        @select-gif="onSelectGif"
        @delete="onDeleteEmoji"
        @send="onSendComment"
      ></emoji-panel>

      <!-- @用户搜索面板 - 固定在工具栏上方，横向滑动 -->
      <view v-if="showUserSearch" class="mention-user-panel" :style="{ bottom: keyboardHeight + 'px' }">
        <!-- 关闭按钮 -->
        <view class="popup-close df" @tap="closeMentionPanel">
          <text>×</text>
        </view>

        <view v-if="searchUserList.length === 0 && !isSearchingUser" class="empty-mention-users">
          <text v-if="searchUserKeyword.trim()">暂无此用户，请核对</text>
          <text v-else>暂无关注用户</text>
        </view>

        <view v-if="isSearchingUser" class="loading-mention-users">
          <text>加载中...</text>
        </view>

        <scroll-view
          v-if="searchUserList.length > 0"
          class="mention-user-scroll"
          scroll-x="true"
          :show-scrollbar="false"
        >
          <view class="mention-user-list-horizontal">
            <view
              v-for="(user, index) in searchUserList"
              :key="user.uid"
              class="mention-user-card"
              @tap="selectUserForMention(user)"
            >
              <image :src="user.avatar" class="mention-user-avatar" mode="aspectFill"></image>
              <text class="mention-user-nickname">{{ user.nickname }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 商品选择弹窗 -->
    <uni-popup ref="shopPopup" type="bottom" :safe-area="false">
      <view class="popup-box">
        <view class="popup-top df">
          <view class="popup-title">
            <view class="t1">选择商品</view>
            <view class="t2">轻触下方名称以选择相应商品</view>
          </view>
          <view class="popup-close df" @tap="shopPopupClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
          </view>
        </view>
        
        <view class="popup-search df">
          <input 
            @confirm="searchClick" 
            focus="true" 
            confirm-type="search" 
            placeholder="输入关键词搜索商品" 
            placeholder-class="search-ph" 
            v-model="kw" />
          <view class="search-btn" @tap="searchClick">搜索</view>
        </view>
        
        <view class="popup-scroll">
          <view v-if="goodsList.length <= 0" class="empty-box df">
            <image src="/static/img/empty.png" />
            <view class="e1">暂无商品</view>
            <view class="e2">正在为您制造更多美好的商品</view>
          </view>
          
          <view class="circle-box">
            <view 
              v-for="(item, index) in goodsList" 
              :key="index" 
              :class="['circle-item', 'df', item.selected ? 'active' : '']" 
              style="border-radius:16rpx" 
              :data-idx="index" 
              @tap="goodsClick">
              <image :src="item.product_img" style="border-radius:8rpx" mode="aspectFill"></image>
              <text>{{ item.goods_name }}</text>
            </view>
          </view>
        </view>
        
        <view class="popup-btn" @tap="shopPopupClick(false)">确认保存</view>
      </view>
    </uni-popup>
    
    <!-- 圈子选择弹窗 -->
    <uni-popup ref="upPopup" type="bottom" :safe-area="false">
      <view class="popup-box">
        <view class="popup-top df">
          <view class="popup-title">
            <view class="t1">选择一个圈子</view>
            <view class="t2">轻触下方名称以选择相应圈子</view>
          </view>
          <view class="popup-close df" @tap="upPopupClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
          </view>
        </view>
        
        <view class="popup-scroll">
          <view v-if="circleList.length <= 0" class="empty-box df">
            <image src="/static/img/empty.png" />
            <view class="e1">暂无圈子</view>
            <view class="e2">还没有加入任何圈子，加入后即可发布</view>
          </view>
          
          <view class="circle-box">
            <view 
              v-for="(item, index) in circleList" 
              :key="index" 
              :class="['circle-item', 'df', circle.id == item.id ? 'active' : '']" 
              :data-idx="index" 
              @tap="circleClick">
              <image :src="item.avatar" mode="aspectFill"></image>
              <text>{{ item.name }}</text>
            </view>
          </view>
        </view>
        
        <view class="popup-btn" @tap="upPopupClick(false)">确认保存</view>
      </view>
    </uni-popup>
    
    <!-- 活动选择弹窗 -->
    <uni-popup ref="activityPopup" type="bottom" :safe-area="false">
      <view class="popup-box">
        <view class="popup-top df">
          <view class="popup-title">
            <view class="t1">选择一个活动</view>
            <view class="t2">轻触下方名称以选择相应活动</view>
          </view>
          <view class="popup-close df" @tap="activityPopupClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
          </view>
        </view>
        
        <view class="popup-scroll">
          <view v-if="activityList.length <= 0" class="empty-box df">
            <image src="/static/img/empty.png" />
            <view class="e1">暂无活动</view>
            <view class="e2">还没有可参与的活动</view>
          </view>
          
          <view class="circle-box">
            <view 
              v-for="(item, index) in activityList" 
              :key="index" 
              :class="['circle-item', 'df', activity.id == item.id ? 'active' : '']" 
              :data-idx="index" 
              @tap="activityClick">
              <image :src="item.img" mode="aspectFill"></image>
              <text>{{ item.name }}</text>
            </view>
          </view>
        </view>
        
        <view class="popup-btn" @tap="activityPopupClick(false)">确认保存</view>
      </view>
    </uni-popup>
    
    <!-- 话题选择弹窗 -->
    <uni-popup ref="topicPopup" type="bottom" :safe-area="false">
      <view class="popup-box">
        <view class="popup-top df">
          <view class="popup-title">
            <view class="t1">选择一个话题</view>
            <view class="t2">轻触下方名称以选择相应话题</view>
          </view>
          <view class="popup-close df" @tap="topicPopupClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
          </view>
        </view>
        
        <view class="popup-search df">
          <input 
            @confirm="searchTopics" 
            focus="true" 
            confirm-type="search" 
            placeholder="输入关键词搜索话题" 
            placeholder-class="search-ph" 
            v-model="topicKeyword" />
          <view class="search-btn" @tap="searchTopics">搜索</view>
        </view>
        
        <view class="popup-scroll">
          <emptyPage
            v-if="topicList.length <= 0"
            title="暂无话题"
            description="暂时没有找到相关话题"
          />
          
          <view class="topic-box">
            <view 
              v-for="(item, index) in topicList" 
              :key="index" 
              class="topic-item df" 
              @tap="topicClick(item)">
              <view class="topic-tag">#</view>
              <view class="topic-content">
                <view class="topic-name">{{ item.title }}</view>
                <view class="topic-desc">{{ item.description || '暂无描述' }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 用户选择弹窗 -->
    <uni-popup ref="userPopup" type="bottom" :safe-area="false">
      <view class="popup-box">
        <view class="popup-top df">
          <view class="popup-title">
            <view class="t1">选择要@的好友</view>
            <view class="t2">轻触下方名称以选择相应好友</view>
          </view>
          <view class="popup-close df" @tap="userPopupClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
          </view>
        </view>
        
        <view class="popup-search df">
          <input 
            @confirm="searchUsers" 
            focus="true" 
            confirm-type="search" 
            placeholder="输入关键词搜索好友" 
            placeholder-class="search-ph" 
            v-model="userKeyword" />
          <view class="search-btn" @tap="searchUsers">搜索</view>
        </view>
        
        <view class="popup-scroll">
          <view v-if="userList.length <= 0" class="empty-box df">
            <image src="/static/img/empty.png" />
            <view class="e1">暂无好友</view>
            <view class="e2">还没有添加任何好友</view>
          </view>
          
          <view class="circle-box">
            <view 
              v-for="(item, index) in userList" 
              :key="index" 
              class="circle-item df" 
              :data-idx="index" 
              @tap="userClick(item)">
              <image :src="item.avatar" mode="aspectFill"></image>
              <text>{{ item.nickname }}</text>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 录音弹窗 -->
    <uni-popup ref="recordPopup" type="bottom" :safe-area="false">
      <jc-record
        ref="jcRecord"
        :voicePath="audio.url"
        :maxTime="60"
        :minTime="1"
        :autoShow="true"
        @confirm="onRecordConfirm"
        @show="onRecordShow"
        @close="onRecordClose"
      >
        <view class="centerwz">录制语音</view>
      </jc-record>
    </uni-popup>
    
    <!-- 提示弹窗 -->
    <uni-popup ref="tipsPopup" type="center" :mask-click="true">
      <view class="tips-box df">
        <view class="tips-item">{{ tipsTitle }}</view>
      </view>
    </uni-popup>
    
    <!-- 添加canvas元素用于图片压缩 -->
    <canvas canvas-id="canvas" v-if="canvasStatus"
      :style="{width: canvasWidth + 'px', height: canvasHeight + 'px',position: 'absolute',left:'-100000px',top:'-100000px'}"></canvas>
    
    <!-- 投票弹窗 -->
    <uni-popup ref="votePopup" type="bottom" :safe-area="false">
      <view class="popup-box vote-popup">
        <view class="popup-top df">
          <view class="popup-title">
            <view class="t1">投票</view>
          </view>
          <view class="popup-close df" @tap="votePopupClick(false)">
            <image src="/static/img/tabbar/3.png" style="width:20rpx;height:20rpx"></image>
          </view>
        </view>
        
        <!-- 投票标题输入 -->
        <view class="vote-title-input">
          <input 
            placeholder="添加标题（20个汉字内）" 
            maxlength="20" 
            v-model="voteData.title"
            class="vote-input"
          />
        </view>
        
        <!-- 投票选项列表 -->
        <view class="vote-options">
          <view 
            v-for="(option, index) in voteData.options" 
            :key="index" 
            class="vote-option-item"
          >
            <input 
              :placeholder="'选项' + (index + 1) + '（10个汉字以内）'" 
              maxlength="10" 
              v-model="voteData.options[index]"
              class="vote-option-input"
            />
            <view class="vote-option-delete" @tap="deleteVoteOption(index)">
              <view class="delete-circle">
                <view class="delete-line"></view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 添加选项按钮 -->
        <view class="vote-add-option" @tap="addVoteOption">
          <text class="vote-add-icon">+</text>
          <text class="vote-add-text">添加一个选项</text>
        </view>
        
        <!-- 底部按钮区 -->
        <view class="vote-bottom-btns">
          <view class="vote-cancel-btn" @tap="votePopupClick(false)">取消</view>
          <view class="vote-confirm-btn" @tap="confirmVote">确定</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>
<script>
import jcRecord from '../../components/jc-record/jc-record.vue'
import emojiPanel from '../../components/emoji-panel/emoji-panel.vue'
import emptyPage from '@/components/emptyPage/emptyPage.vue'
import VoteComponent from '@/components/vote-component/vote-component.vue'

// 导入社交相关API
import { publishDynamic, getTopicList, getSocialFollowList, getJoinedCircles, searchUsers } from '@/api/social.js'

// 引入Pinia stores
import { useUserStore } from '@/stores/user.js'

export default {
  components: {
    jcRecord,
    emojiPanel,
    emptyPage,
    VoteComponent
  },
  data() {
    return {
      // Pinia stores实例
      userStore: useUserStore(),

      navbarHeight: 0, // 导航栏总高度
      capsuleInfo: null, // 胶囊按钮信息
      isUser: false,
              id: 0,
        content: "",
        type: 2, // 默认显示为图片动态样式，鼓励用户上传图片 (1-纯文本,2-图片,3-视频,4-音频)
      order_id: "",
      order_type: 0,
      goods: [],
      imgs: [],
      video: {
        high: 0,
        wide: 0,
        url: "",
        cover: ""
      },
      audio: {
        cover: "",
        url: "",
        name: "",
        intro: "",
        size: 0
      },
      adds: {
        name: "",
        address: "",
        latitude: "",
        longitude: ""
      },
      circle: {
        id: "",
        name: "",
        avatar: ""
      },
      activity: {
        id: "",
        name: "",
        img: ""
      },
      circleList: [],
      goodsList: [],
      activityList: [],
      kw: "",
      tipsTitle: "",
      keyboardHeight: 0,
      userKeyword: "",
      topicKeyword: "",
      userList: [],
      topicList: [],
      showMoreOptions: false,
      isRecording: false,
      canvasStatus: false,
      canvasWidth: 0,
      canvasHeight: 0,
      // 表情面板相关
      showEmojiPanel: false,
      emojiMap: {}, // 表情映射
      commentImage: null, // 评论图片
      // 草稿相关
      draftKey: 'note_draft',
      saveTimer: null, // 用于防抖的定时器
      contentProcessTimer: null, // 内容处理防抖定时器
      searchThrottleTimer: null, // 搜索节流定时器
      isPublished: false, // 标识是否已成功发布
      autoFocus: true, // 自动聚焦，页面加载时自动调起输入法
      // 弹窗管理
      currentPopup: null, // 当前打开的弹窗
      // H5键盘监听方法
      handleWindowResize: null,
      // 已选话题
      selectedTopics: [],
      // 投票相关数据
      showVote: false, // 控制投票组件显示
      voteData: {
        title: "",
        options: ["", ""], // 默认两个选项
        expireTime: 7 // 默认7天后过期
      },
      // @用户相关数据
      showUserSearch: false, // 显示用户搜索面板
      searchUserKeyword: '', // 搜索用户关键词
      searchUserList: [], // 搜索到的用户列表
      mentionUsers: [], // 已@的用户列表
      cursorPosition: 0, // 当前光标位置
      isSearchingUser: false, // 是否正在搜索用户
      isEditing: false, // 是否处于编辑模式
      mentionPanelClosed: false, // 用户是否手动关闭了@用户面板
      excludedMentions: [], // 被排除的@文本（用户关闭面板后的@文本）
      // 性能优化缓存
      _segmentCache: null, // contentSegments缓存
      _segmentCacheKey: '', // 缓存键
    }
  },
  computed: {
    // 将内容分段，区分普通文本和@用户文本（优化版本）
    contentSegments() {
      if (!this.content) return [];

      // 创建缓存键
      const cacheKey = `${this.content}_${JSON.stringify(this.mentionUsers)}_${JSON.stringify(this.excludedMentions)}`;

      // 如果缓存存在且键匹配，直接返回缓存
      if (this._segmentCache && this._segmentCacheKey === cacheKey) {
        return this._segmentCache;
      }

      const segments = [];
      const mentionPattern = /@([^\s@]+)/g;
      let lastIndex = 0;
      let match;

      // 预处理用户昵称映射，提高查找性能
      const userNicknameSet = new Set(this.mentionUsers.map(user => user.nickname));

      // 预处理排除映射，提高查找性能
      const excludedMap = new Map();
      this.excludedMentions.forEach(excluded => {
        excludedMap.set(`${excluded.position}_${excluded.text}`, true);
      });

      while ((match = mentionPattern.exec(this.content)) !== null) {
        // 添加@符号前的普通文本
        const beforeText = this.content.substring(lastIndex, match.index);
        if (beforeText) {
          segments.push({
            text: beforeText,
            isMention: false
          });
        }

        // 添加@用户文本
        const mentionText = match[0]; // @用户名
        const nickname = match[1]; // 用户名
        const isKnownUser = userNicknameSet.has(nickname);

        // 检查是否是被排除的@文本（用户关闭面板后的@文本）
        const isExcluded = excludedMap.has(`${match.index}_${mentionText}`);

        segments.push({
          text: mentionText,
          isMention: !isExcluded && isKnownUser, // 如果被排除，则不显示为@用户
          isKnownUser: isKnownUser
        });

        lastIndex = match.index + match[0].length;
      }

      // 添加剩余的普通文本
      const remainingText = this.content.substring(lastIndex);
      if (remainingText) {
        segments.push({
          text: remainingText,
          isMention: false
        });
      }

      const result = segments.length > 0 ? segments : [{
        text: this.content,
        isMention: false
      }];

      // 缓存结果
      this._segmentCache = result;
      this._segmentCacheKey = cacheKey;

      return result;
    },
    // 判断内容是否为空
    isContentEmpty() {
      const hasContent = this.content && this.content.trim();
      const hasImages = this.imgs && this.imgs.length > 0;
      const hasVideo = this.video && this.video.url;
      const hasAudio = this.audio && this.audio.url;
      const hasVote = this.showVote && this.voteData.title;

      return !hasContent && !hasImages && !hasVideo && !hasAudio && !hasVote;
    },

    // 发布按钮文本
    publishButtonText() {
      if (this.isContentEmpty) {
        return '发布';
      }

      // 根据内容类型显示不同文本
      if (this.video.url) {
        return '发布';
      } else if (this.audio.url) {
        return '发布';
      } else if (this.imgs.length > 0) {
        return '发布';
      } else if (this.showVote) {
        return '发布';
      } else {
        return '发布';
      }
    },

    // 发布按钮样式（根据胶囊按钮位置动态计算）
    publishButtonStyle() {
      const style = {};

      // #ifdef MP-WEIXIN
      if (this.capsuleInfo && this.capsuleInfo.width > 0) {
        // 设置右边距，确保不与胶囊按钮重叠
        // 胶囊按钮宽度 + 额外间距
        const marginRight = this.capsuleInfo.width + 16;
        style.paddingRight = marginRight + 'px';
        console.log('发布按钮右边距:', marginRight + 'px');
      } else {
        // 默认边距
        style.paddingRight = '88px'; // 默认预留空间
      }
      // #endif

      // #ifndef MP-WEIXIN
      style.paddingRight = '30rpx';
      // #endif

      return style;
    },

    // 投票预览信息
    previewVoteInfo() {
      if (!this.showVote || !this.voteData.title) {
        return null;
      }

      // 过滤空选项
      const options = (this.voteData.options || []).map(opt => (opt || '').trim()).filter(opt => opt);

      if (options.length < 2) {
        return null;
      }

      // 构造预览数据结构
      return {
        vote: {
          id: 'preview',
          title: this.voteData.title
        },
        options: options.map((text, index) => ({
          id: index + 1,
          option_text: text,
          percent: 0
        })),
        user_selected: null,
        total: 0
      };
    }
  },
  created() {
    // 初始化 Pinia stores
    this.userStore.initFromStorage();

    // 检查用户登录状态
    if (this.$store.state.app.token || this.userStore.isLoggedIn) {
      this.isUser = true;
    }

    // 初始化导航栏高度
    this.initNavbar();

    // 初始化表情映射
    this.initEmojiMap();
  },
  onLoad(option) {
    let that = this;
    
    // 检查是否已登录
    if (that.$store.state.app.token) {
      that.isUser = true;
    }
    
    // 解析传入参数
    if (option.id) {
      that.id = option.id;
    }
    
    if (option.type) {
      that.type = option.type;
    }
    
    if (option.order_id) {
      that.order_id = option.order_id;
    }
    
    if (option.order_type) {
      that.order_type = option.order_type;
    }
    
    // 加载话题列表
    that.loadTopics();
    
    // 监听键盘高度变化 - 添加平台兼容性检查
    // #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
    if (typeof uni.onKeyboardHeightChange === 'function') {
      uni.onKeyboardHeightChange(res => {
        that.keyboardHeight = res.height;
        console.log('键盘高度变化:', res.height);
      });
    }
    // #endif
    
    // 为了兼容性，同时监听页面滚动时的键盘状态
    // #ifdef H5
    this.handleWindowResize = () => {
      // H5环境下通过窗口大小变化判断键盘状态
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.clientHeight;
      const heightDiff = documentHeight - windowHeight;
      
      if (heightDiff > 150) { // 键盘弹起
        that.keyboardHeight = heightDiff;
      } else { // 键盘收起
        that.keyboardHeight = 0;
      }
    };
    window.addEventListener('resize', this.handleWindowResize);
    // #endif
    
    // 加载草稿
    that.loadDraft();
    
    // 延迟设置自动聚焦，确保页面渲染完成
    setTimeout(() => {
      that.autoFocus = true;
    }, 300);
  },
  onShow() {
    // 每次页面显示时检查用户登录状态
    if (this.$store.state.app.token) {
      this.isUser = true;
    } else {
      this.isUser = false;
    }
  },
  
  // 监听页面隐藏
  onHide() {
    // 页面隐藏时自动保存草稿（如果未成功发布）
    if (!this.isPublished) {
      this.saveDraft();
    }
  },
  
  // 监听页面卸载
  onUnload() {
    // 页面卸载时自动保存草稿（如果未成功发布）
    if (!this.isPublished) {
      this.saveDraft();
    }

    // 清除所有定时器
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }

    if (this.contentProcessTimer) {
      clearTimeout(this.contentProcessTimer);
      this.contentProcessTimer = null;
    }

    if (this.searchThrottleTimer) {
      clearTimeout(this.searchThrottleTimer);
      this.searchThrottleTimer = null;
    }

    // 清理缓存
    this.clearSegmentCache();

    // 清除键盘监听
    // #ifdef H5
    if (this.handleWindowResize) {
      window.removeEventListener('resize', this.handleWindowResize);
      this.handleWindowResize = null;
    }
    // #endif
  },
  methods: {
    // 初始化导航栏
    initNavbar() {
      // 获取系统信息
      const systemInfo = uni.getSystemInfoSync();
      this.statusBarHeight = systemInfo.statusBarHeight || 20;
      
      // 获取胶囊按钮信息
      // #ifdef MP-WEIXIN
      try {
        this.capsuleInfo = uni.getMenuButtonBoundingClientRect();
        console.log('获取胶囊按钮信息:', this.capsuleInfo);

        if (this.capsuleInfo && this.capsuleInfo.width > 0) {
          // 计算标题栏高度：胶囊按钮高度 + 上下边距
          const capsuleTop = this.capsuleInfo.top - this.statusBarHeight;
          this.titleBarHeight = this.capsuleInfo.height + capsuleTop * 2;

          console.log('胶囊按钮信息详细:', {
            width: this.capsuleInfo.width,
            height: this.capsuleInfo.height,
            left: this.capsuleInfo.left,
            right: this.capsuleInfo.right,
            top: this.capsuleInfo.top,
            bottom: this.capsuleInfo.bottom
          });
          console.log('计算的标题栏高度:', this.titleBarHeight);

          // 强制更新视图，确保计算属性重新计算
          this.$nextTick(() => {
            console.log('胶囊按钮信息设置完成，触发视图更新');
            this.$forceUpdate();
          });
        } else {
          this.titleBarHeight = 44;
          console.log('未获取到有效的胶囊按钮信息，使用默认标题栏高度');
        }
      } catch (e) {
        console.error('获取胶囊按钮信息失败:', e);
        this.titleBarHeight = 44;
      }
      // #endif
      
      // #ifdef MP-ALIPAY
      this.titleBarHeight = 48;
      // #endif
      
      // #ifdef APP-PLUS
      this.titleBarHeight = 44;
      // #endif
      
      // #ifdef H5
      this.titleBarHeight = 44;
      // #endif
      
      // #ifndef MP-WEIXIN || MP-ALIPAY || APP-PLUS || H5
      this.titleBarHeight = 44;
      // #endif
      
      console.log('导航栏配置:', {
        statusBarHeight: this.statusBarHeight,
        titleBarHeight: this.titleBarHeight,
        platform: systemInfo.platform
      });
    },
    
    // 返回上一页
    goBack() {
      // 如果有内容，提示用户是否保存草稿
      if (this.content.trim() || this.imgs.length > 0 || this.video.url || this.audio.url) {
        uni.showModal({
          title: '提示',
          content: '是否保存草稿？',
          success: (res) => {
            if (res.confirm) {
              this.saveDraft();
            }
            uni.navigateBack();
          }
        });
      } else {
        uni.navigateBack();
      }
    },
    
    // 跳转到完善资料页面
    navigateToComplete() {
      uni.navigateTo({
        url: '/pages/center/means'
      });
    },

    // 处理发布按钮点击
    handlePublish() {
      // 防止内容为空时点击
      if (this.isContentEmpty) {
        this.opTipsPopup("请添加一些内容再发布哦～");
        return;
      }

      // 调用发布方法
      this.saveDynamic(1);
    },
    
    // 初始化表情映射
    initEmojiMap() {
      try {
        // 尝试从本地存储获取表情映射
        const emojiMapStr = uni.getStorageSync('emoji_map');
        if (emojiMapStr) {
          this.emojiMap = JSON.parse(emojiMapStr);
          console.log('表情映射加载成功，总数:', Object.keys(this.emojiMap).length);
        } else {
          // 如果本地没有，可以从表情组件获取
          // 这里可以添加默认的表情映射
          console.log('未找到表情映射，将使用默认映射');
          this.emojiMap = {};
        }
      } catch (e) {
        console.error('初始化表情映射失败', e);
        this.emojiMap = {};
      }
    },
    
    // 内容输入
    contentInput(e) {
      const value = e.detail.value;
      const cursor = e.detail.cursor || 0;

      this.content = value;
      this.cursorPosition = cursor;

      // 使用防抖优化性能
      this.debouncedContentProcess(value, cursor);
    },

    // 防抖处理内容变化
    debouncedContentProcess(value, cursor) {
      // 清除之前的定时器
      if (this.contentProcessTimer) {
        clearTimeout(this.contentProcessTimer);
      }

      // 设置新的定时器
      this.contentProcessTimer = setTimeout(() => {
        // 清理无效的排除记录
        this.cleanupExcludedMentions();

        // 检测@用户输入
        this.checkMentionInput(value, cursor);

        // 同步更新mentionUsers列表
        this.parseMentionUsersFromContent();

        // 自动保存草稿
        this.autoSaveDraft();
      }, 300); // 300ms防抖
    },


    
    // textarea获取焦点
    onTextareaFocus() {
      console.log('textarea获取焦点');
      this.showEmojiPanel = false;
      this.isEditing = true;
      // 强制更新键盘高度检测
      this.$nextTick(() => {
        setTimeout(() => {
          console.log('当前键盘高度:', this.keyboardHeight);
        }, 300);
      });
    },
    
    // textarea失去焦点
    onTextareaBlur() {
      console.log('textarea失去焦点');
      // 延迟退出编辑模式，避免点击其他元素时立即退出
      setTimeout(() => {
        if (!this.showUserSearch) {
          this.isEditing = false;
        }
      }, 200);
      // 延迟重置键盘高度，避免闪烁
      setTimeout(() => {
        if (this.keyboardHeight > 0) {
          console.log('重置键盘高度');
          this.keyboardHeight = 0;
        }
      }, 100);
    },
    
    // 获取笔记详情
    dynamicInfo() {
      let that = this;
      
      // 使用uni.request直接请求API
      uni.request({
        url: this.$store.state.app.apiUrl + '/note/details',
        method: 'GET',
        data: { id: that.id },
        header: {
          'Authorization': 'Bearer ' + this.$store.state.app.token
        },
        success: (res) => {
          if (res.data && res.data.status === 200) {
            const data = res.data.data;
            that.id = data.id;
            that.type = data.type;
            that.content = data.content;
            that.circle.id = data.circle_id;
            that.circle.name = data.circle_name;
            that.circle.avatar = data.circle_avatar;
            that.activity.id = data.activity_id;
            that.activity.name = data.activity_name;
            that.activity.img = data.activity_img;
            that.adds.name = data.adds_name;
            that.adds.address = data.adds;
            that.adds.latitude = data.lat;
            that.adds.longitude = data.lng;
            
            if (that.type == 1) {
              that.imgs = data.imgs;
            } else if (that.type == 2) {
              that.video.high = data.video.high;
              that.video.wide = data.video.wide;
              that.video.url = data.video.url;
              that.video.cover = data.video.cover;
            } else if (that.type == 3) {
              that.audio.cover = data.audio.cover;
              that.audio.url = data.audio.url;
              that.audio.name = data.audio.name;
              that.audio.intro = data.audio.intro;
              that.audio.size = data.audio.size;
            }
            
            that.order_id = data.order_id;
            that.order_type = data.order_type;
            
            if (that.order_id) {
              that.goods = data.goods;
            }
          }
        },
        fail: (err) => {
          console.error('获取笔记详情失败:', err);
        }
      });
    },
    
    // 获取订单商品
    noteOrderGoods() {
      let that = this;
      
      // 使用uni.request直接请求API
      uni.request({
        url: this.$store.state.app.apiUrl + '/order/goods',
        method: 'GET',
        data: { id: that.order_id },
        header: {
          'Authorization': 'Bearer ' + this.$store.state.app.token
        },
        success: (res) => {
          if (res.data && res.data.status === 200) {
            that.goods = res.data.data;
          }
        },
        fail: (err) => {
          console.error('获取订单商品失败:', err);
        }
      });
    },
    
    // 获取圈子列表
    circleDynamic() {
      let that = this;
      
      // 使用uni.request直接请求API
      uni.request({
        url: this.$store.state.app.apiUrl + '/circle/list',
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + this.$store.state.app.token
        },
        success: (res) => {
          if (res.data && res.data.status === 200) {
            that.circleList = res.data.data;
          }
        },
        fail: (err) => {
          console.error('获取圈子列表失败:', err);
        }
      });
    },
    
    // 获取话题列表
    loadTopics() {
      let that = this;
      
      // 显示加载中
      uni.showLoading({
        title: '加载中',
        mask: true
      });
      
      // 准备请求参数
      const params = { 
        keyword: that.topicKeyword,
        page: 1,
        limit: 20
      };
      
      // 使用getTopicList API函数获取话题列表
      getTopicList(params)
        .then(res => {
          uni.hideLoading();
          
          if (res.status === 200) {
            // 处理返回的话题数据
            that.topicList = res.data.list || [];
          } else {
            uni.showToast({
              title: res.msg || '获取话题失败',
              icon: 'none'
            });
          }
        })
        .catch(err => {
          uni.hideLoading();
          console.error('获取话题列表失败:', err);
          uni.showToast({
            title: '获取话题失败',
            icon: 'none'
          });
        });
    },
    
    // 搜索话题
    searchTopics() {
      this.loadTopics();
    },
    
    // 保存笔记
    saveDynamic(status) {
      let that = this;
      
      // 验证表单
      if (that.content.trim() === "") {
        return that.opTipsPopup("请输入内容");
      }
      
      // 根据实际内容判断最终发布类型
      let finalType;
      if (that.type == 3 && that.video.url) {
        finalType = 3; // 视频类型
      } else if (that.type == 4 && that.audio.url) {
        finalType = 4; // 音频类型
      } else if (that.imgs.length > 0) {
        finalType = 2; // 图片类型
      } else {
        finalType = 1; // 文本类型
      }
      
      // 验证视频类型
      if (that.type == 3) {
        if (!that.video.url) {
          return that.opTipsPopup("视频笔记需添加一个视频哦！");
        }
      }

      // 验证音频类型
      if (that.type == 4) {
        if (!that.audio.url) {
          return that.opTipsPopup("音频笔记需添加一个音频哦！");
        }
        // 不验证音频封面和标题，发布时自动使用默认值
      }
      

      
      // 校验投票数据（如有）
      let vote = null;
      let vote_options = null;
      if (that.showVote) {
        if (!that.voteData.title || !that.voteData.title.trim()) {
          return that.opTipsPopup("请输入投票标题");
        }
        // 过滤空选项
        const options = (that.voteData.options || []).map(opt => (opt || '').trim()).filter(opt => opt);
        if (options.length < 2) {
          return that.opTipsPopup("至少需要2个投票选项");
        }
        vote = { title: that.voteData.title.trim() };
        vote_options = options;
      }
      
      // 显示加载中
      uni.showLoading({
        title: status ? "发布中..." : "保存中...",
        mask: true
      });
      
      // 处理表情内容
      const parsedContent = that.parseEmojiContent(that.content);
      
      // 准备请求参数
      let params = {
        id: that.id,
        content: parsedContent, // 使用解析后的内容
        type: finalType, // 使用实际判断的最终类型
        location_name: that.adds.name,
        latitude: that.adds.latitude,
        longitude: that.adds.longitude,
        circle_id: that.circle.id,
        status: status, // 0-草稿，1-发布
        order_id: that.order_id,
        order_type: that.order_type,
        goods: that.goods.map(item => item.id)
      };
      // 如果有投票，添加投票参数
      if (vote && vote_options) {
        params.vote = vote;
        params.vote_options = vote_options;
      }
      
      // 如果有GIF表情，添加到图片中
      if (that.commentImage) {
        if (finalType === 1 || finalType === 2) {
          finalType = 2; // 设置为图片类型 (1-纯文本,2-图片,3-视频,4-音频)
          if (!that.imgs) that.imgs = [];
          that.imgs.push({
            url: that.commentImage,
            wide: 0,
            high: 0
          });
          params.type = finalType;
        }
      }
      
      // 根据最终类型添加不同的媒体数据
      if (finalType == 2) {
        // 图片类型
        params.images = that.imgs.map(img => img.url);
      } else if (finalType == 3) {
        // 视频类型
        if (that.video.url) {
          params.video = that.video.url;
          params.video_cover = that.video.cover || '';
          params.video_width = that.video.wide || 1280;
          params.video_height = that.video.high || 720;
          console.log('视频数据:', {
            url: that.video.url,
            cover: that.video.cover,
            width: that.video.wide,
            height: that.video.high
          });
        }
      } else if (finalType == 4) {
        // 音频类型
        params.audio = that.audio.url;

        // 处理音频封面：如果用户没有上传封面，使用用户头像
        let audioCover = that.audio.cover;
        console.log('当前音频封面:', audioCover);

        if (!audioCover || audioCover.trim() === '') {
          console.log('=== 使用 Pinia 获取用户信息 ===');
          console.log('Pinia userStore:', that.userStore);
          console.log('Pinia 用户信息:', that.userStore.userInfo);
          console.log('Pinia 用户头像:', that.userStore.userInfo?.avatar);
          console.log('Pinia 是否登录:', that.userStore.isLoggedIn);

          // 从 Pinia 获取用户头像
          audioCover = that.userStore.userInfo?.avatar || '';
          console.log('从 Pinia 获取的音频封面:', audioCover);

          // 如果 Pinia 中没有，尝试从缓存获取
          if (!audioCover) {
            const cachedUserInfo = uni.getStorageSync('USER_INFO') || {};
            console.log('缓存的用户信息:', cachedUserInfo);
            audioCover = cachedUserInfo.avatar || '';
            console.log('从缓存获取的音频封面:', audioCover);
          }
        }
        params.audio_cover = audioCover;

        // 处理音频标题：如果用户没有填写标题，使用"用户昵称的录音"
        let audioTitle = that.audio.name;
        console.log('当前音频标题:', audioTitle);

        if (!audioTitle || audioTitle.trim() === '') {
          console.log('=== 使用 Pinia 获取用户昵称 ===');
          console.log('Pinia 用户昵称:', that.userStore.userInfo?.nickname);
          console.log('Pinia 用户姓名:', that.userStore.userInfo?.name);
          console.log('Pinia displayName:', that.userStore.displayName);

          // 从 Pinia 获取用户昵称
          let nickname = that.userStore.userInfo?.nickname || that.userStore.userInfo?.name || that.userStore.displayName;
          console.log('从 Pinia 获取的昵称:', nickname);

          // 如果 Pinia 中没有，尝试从缓存获取
          if (!nickname) {
            const cachedUserInfo = uni.getStorageSync('USER_INFO') || {};
            console.log('缓存的用户信息:', cachedUserInfo);
            nickname = cachedUserInfo.nickname || cachedUserInfo.name || '用户';
            console.log('从缓存获取的昵称:', nickname);
          }

          audioTitle = nickname + '的录音';
          console.log('最终使用的音频标题:', audioTitle);
        }
        params.audio_title = audioTitle;

        params.audio_intro = that.audio.intro;
        console.log('音频数据:', {
          url: that.audio.url,
          cover: audioCover,
          name: audioTitle,
          intro: that.audio.intro
        });
      }

      // 调试：打印发布参数
      console.log('发布动态参数:', params);
      console.log('当前类型:', that.type);
      console.log('最终类型:', finalType);
      console.log('视频数据:', that.video);
      
      // 使用publishDynamic API函数发布动态
      publishDynamic(params)
        .then(res => {
          uni.hideLoading();
          
          // 显示结果提示
          that.opTipsPopup(res.msg || (res.status === 200 ? (status ? '发布成功' : '保存成功') : (status ? '发布失败' : '保存失败')));
          
          // 发布成功后跳转
          if (res.status === 200) {
            console.log('发布成功，准备跳转到个人中心');

            // 标记已成功发布，避免再次保存草稿
            if (status === 1) {
              that.isPublished = true;
            }

            // 清除草稿
            that.clearDraft();

            setTimeout(function() {
              console.log('开始跳转到个人中心');
              uni.reLaunch({
                url: "/pages/index/center",
                success: function() {
                  console.log('跳转到个人中心成功');
                },
                fail: function(err) {
                  console.error('跳转到个人中心失败:', err);
                  // 如果reLaunch失败，尝试使用navigateTo
                  uni.navigateTo({
                    url: "/pages/index/center"
                  });
                }
              });
            }, 1000);
          }
        })
        .catch(err => {
          uni.hideLoading();
          console.error('发布笔记失败:', err);
          that.opTipsPopup('发布失败，请重试');
        });
    },
    
    // 选择视频（使用新的分片上传方法）
    chooseVideo() {
      let that = this;
      
      // 如果之前有图片，清除图片
      if (that.imgs.length > 0) {
        that.imgs = [];
      }
      
      // 如果之前有音频，清除音频
      if (that.audio.url) {
        that.audio = {
          cover: "",
          url: "",
          name: "",
          intro: "",
          size: 0
        };
      }
      
      // 设置为视频类型
      that.type = 3;
      
      // 使用简单的视频上传方法
      that.$util.uploadVideoSimple({
        count: 1,
        sourceType: ['album', 'camera'],
        maxDuration: 60,
        camera: 'back',
        url: 'upload/video',
        name: 'file'
      }, function(res) {
        // 上传成功回调
        console.log('视频上传成功:', res);
        if (res.status === 200 && res.data && (res.data.url || res.data.src)) {
          that.video.url = res.data.url || res.data.src;
          that.video.high = res.data.high || res.data.h || 720; // 使用返回的高度或默认值
          that.video.wide = res.data.wide || res.data.w || 1280; // 使用返回的宽度或默认值
          
          // 强制更新视图
          that.$forceUpdate();
          
          // 处理视频封面
          that.handleVideoCover();
        } else {
          console.error('视频上传响应格式错误:', res);
          that.opTipsPopup("视频上传失败：响应格式错误");
        }
      }, function(err) {
        // 上传失败回调
        console.error('视频上传失败:', err);
        that.opTipsPopup("视频上传失败，请重试");
      });
    },
    
    // 处理视频封面
    handleVideoCover() {
      let that = this;
      
      // 调试信息
      console.log('视频数据:', that.video);
      console.log('视频URL:', that.video.url);
      
      // 如果已经有封面，不需要重新处理
      if (that.video.cover) {
        that.opTipsPopup("视频上传成功");
        return;
      }
      
      // 提示用户添加封面
      uni.showModal({
        title: '视频上传成功',
        content: '是否需要添加视频封面？',
        confirmText: '添加封面',
        cancelText: '稍后添加',
        success: (res) => {
          if (res.confirm) {
            // 用户选择添加封面
            that.addImgClick(2); // 调用添加封面方法
          } else {
            // 用户选择稍后添加
            that.opTipsPopup("视频上传成功，请记得添加封面");
          }
          // 不显示任何提示消息
        }
      });
    },
    
    // 视频加载成功
    onVideoLoad(e) {
      console.log('视频加载成功:', e);
      this.opTipsPopup("视频加载成功");
    },
    
    // 视频加载错误
    onVideoError(e) {
      console.error('视频加载失败:', e);
      this.opTipsPopup("视频加载失败，请检查视频格式");
    },
    
    // 添加图片（支持多选）
    addImgClick(type) {
      let that = this;
      
      if (type == 1) {
        // 上传笔记图片
        that.canvasStatus = true;
        
        // 使用新的简化版上传方法
        that.$util.uploadImageChange({
          url: 'upload/image',
          count: 9 // 支持最多9张图片
        }, function(res) {
          // 如果之前有视频，清除视频
          if (that.video.url) {
            that.video = {
              high: 0,
              wide: 0,
              url: "",
              cover: ""
            };
          }
          
          // 如果之前有音频，清除音频
          if (that.audio.url) {
            that.audio = {
              cover: "",
              url: "",
              name: "",
              intro: "",
              size: 0
            };
          }
          
          // 设置为图片类型
          that.type = 2;
          
          // 处理返回的图片数据
          if (res.data && Array.isArray(res.data)) {
            // 多张图片
            res.data.forEach(img => {
              that.imgs.push({
                url: img.url || img.src,
                wide: img.wide || img.w || 0,
                high: img.high || img.h || 0
              });
            });
            // 移除成功上传提示消息
          } else if (res.data && (res.data.url || res.data.src)) {
            // 单张图片
            that.imgs.push({
              url: res.data.url || res.data.src,
              wide: res.data.wide || res.data.w || 0,
              high: res.data.high || res.data.h || 0
            });
            // 移除成功上传提示消息
          } else if (res.url || res.src) {
            // 兼容旧格式：直接返回图片对象
            that.imgs.push({
              url: res.url || res.src,
              wide: res.wide || res.w || 0,
              high: res.high || res.h || 0
            });
            // 移除成功上传提示消息
          } else {
            console.error('图片数据格式错误:', res);
            that.opTipsPopup('图片上传失败：数据格式错误');
          }
          
          // 强制更新视图
          that.$forceUpdate();
        }, function(err) {
          console.error('图片上传失败:', err);
          that.opTipsPopup('图片上传失败，请重试');
        });
      } else {
        // 上传封面图片 (视频或音频封面)
        this.canvasStatus = true;
        
        that.$util.uploadImageChange({
          url: 'upload/image',
          count: 1 // 封面只选择一张
        }, function(res) {
          console.log('封面上传响应:', res);
          
          let coverUrl = '';
          
          // 尝试从不同位置获取URL
          if (res.data && res.data.url) {
            coverUrl = res.data.url;
          } else if (res.data && res.data.src) {
            coverUrl = res.data.src;
          } else if (res.url) {
            coverUrl = res.url;
          } else if (res.src) {
            coverUrl = res.src;
          }
          
          if (coverUrl) {
            if (type == 2) {
              that.video.cover = coverUrl;
              that.opTipsPopup('视频封面上传成功');
            } else if (type == 3) {
              that.audio.cover = coverUrl;
              that.opTipsPopup('音频封面上传成功');
            }
          } else {
            console.error('无法获取封面URL:', res);
            that.opTipsPopup('封面上传失败：无法获取图片URL');
          }
        }, function(err) {
          console.error('封面上传失败:', err);
          that.opTipsPopup('封面上传失败，请重试');
        });
      }
    },
    
    // 添加音频文件
    addFileClick() {
      const that = this;
      uni.showActionSheet({
        itemList: ['录制音频', '选择音频文件'],
        success: function(res) {
          if (res.tapIndex === 0) {
            // 录制音频
            that.recordPopupClick(true);
          } else if (res.tapIndex === 1) {
            // 选择音频文件
            that.chooseAudioFile();
          }
        }
      });
    },

    // 选择音频文件
    chooseAudioFile() {
      const that = this;

      // #ifdef H5
      // H5环境使用input选择文件
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/mp3,audio/m4a,audio/wav,audio/aac';
      input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
          that.handleAudioFileUpload(file);
        }
      };
      input.click();
      // #endif

      // #ifdef MP-WEIXIN || MP-ALIPAY || APP-PLUS
      // 小程序和APP环境使用uni.chooseMessageFile
      uni.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['mp3', 'm4a', 'wav', 'aac'],
        success: function(res) {
          console.log('选择音频文件成功:', res);
          if (res.tempFiles && res.tempFiles.length > 0) {
            const audioFile = res.tempFiles[0];
            console.log('音频文件信息:', audioFile);

            // 检查文件大小（限制为10MB）
            if (audioFile.size > 10 * 1024 * 1024) {
              uni.showToast({
                title: '音频文件不能超过10MB',
                icon: 'none'
              });
              return;
            }

            // 检查文件类型
            const fileName = audioFile.name || '';
            const fileExt = fileName.split('.').pop().toLowerCase();
            if (!['mp3', 'm4a', 'wav', 'aac'].includes(fileExt)) {
              uni.showToast({
                title: '请选择mp3、m4a、wav或aac格式的音频文件',
                icon: 'none'
              });
              return;
            }

            // 处理音频上传
            that.handleAudioFileUpload(audioFile.path, audioFile.name);
          }
        },
        fail: function(err) {
          console.log('选择音频文件失败:', err);
          uni.showToast({
            title: '选择音频文件失败',
            icon: 'none'
          });
        }
      });
      // #endif
    },

    // 处理音频文件上传（支持录音文件路径和本地文件）
    handleAudioFileUpload(fileOrPath, fileName = '') {
      console.log('开始上传音频文件:', fileOrPath, fileName);
      console.log('文件类型:', typeof fileOrPath);

      const that = this;

      // 如果之前有图片，清除图片
      if (that.imgs.length > 0) {
        that.imgs = [];
      }

      // 如果之前有视频，清除视频
      if (that.video.url) {
        that.video = {
          high: 0,
          wide: 0,
          url: "",
          cover: ""
        };
      }

      // 设置为音频类型
      that.type = 4;

      // #ifdef H5
      // H5环境下，fileOrPath 是 File 对象
      if (typeof File !== 'undefined' && fileOrPath instanceof File) {
        // 检查文件大小（限制为50MB，参考 util.js）
        if (fileOrPath.size > 50 * 1024 * 1024) {
          uni.showToast({
            title: '音频大小不能超过50MB',
            icon: 'none'
          });
          return;
        }

        uni.showLoading({
          title: '音频上传中...',
          mask: true
        });

        // 使用FormData上传，参考 util.js 中的方式
        const formData = new FormData();
        formData.append('file', fileOrPath);
        formData.append('chunkNumber', '1');
        formData.append('currentChunkSize', fileOrPath.size.toString());
        formData.append('chunkSize', fileOrPath.size.toString());
        formData.append('totalChunks', '1');
        formData.append('filename', fileName || fileOrPath.name || `audio_${Date.now()}.mp3`);
        formData.append('md5', '');

        // 使用与视频上传相同的URL构建方式
        // 从 config/app.js 获取正确的服务器地址
        const uploadUrl = this.$store.state.app.baseUrl || 'http://nas4.weiyun6.com:8033';

        fetch(uploadUrl + '/api/upload/audio', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + this.$store.state.app.token
          },
          body: formData
        })
        .then(response => response.json())
        .then(res => {
          uni.hideLoading();
          console.log('H5音频上传响应:', res);
          console.log('响应状态:', res.status);
          console.log('响应数据:', res.data);

          if (res.status === 200 && res.data) {
            // 设置音频信息，根据实际返回的数据结构
            that.audio.url = res.data.file_path || res.data.url;
            that.audio.name = ""; // 音频标题默认不填写
            that.audio.size = fileOrPath.size || 0;

            console.log('设置音频数据:', {
              url: that.audio.url,
              name: that.audio.name,
              size: that.audio.size
            });

            // 音频简介设置为上传时间
            that.audio.intro = "上传于" + new Date().toLocaleString();

            // 不设置默认封面，保持为空
            that.audio.cover = "";

            console.log('最终音频数据:', that.audio);
            console.log('当前类型:', that.type);

            that.opTipsPopup('音频上传成功');
          } else {
            console.error('上传失败，响应:', res);
            throw new Error(res.msg || '上传失败');
          }
        })
        .catch(error => {
          uni.hideLoading();
          console.error('H5音频上传失败:', error);
          that.opTipsPopup('音频上传失败，请重试');
        });

        return;
      }
      // #endif

      // 如果是录音文件路径（字符串），直接使用 uni.uploadFile 上传
      if (typeof fileOrPath === 'string') {
        console.log('处理录音文件上传:', fileOrPath);

        uni.showLoading({
          title: '上传录音中...',
          mask: true
        });

        // 使用与视频上传相同的 URL 构建方式
        // 参考 util.js 中的 HTTP_REQUEST_URL
        const uploadUrl = 'http://nas4.weiyun6.com:8033/api/upload/audio';

        console.log('录音上传请求信息:');
        console.log('- URL:', uploadUrl);
        console.log('- 文件路径:', fileOrPath);
        console.log('- 文件名:', fileName);
        console.log('- Token:', this.$store.state.app.token ? '已设置' : '未设置');

        uni.uploadFile({
          url: uploadUrl,
          filePath: fileOrPath,
          name: 'file',
          formData: {
            chunkNumber: 1,
            currentChunkSize: 0,
            chunkSize: 0,
            totalChunks: 1,
            filename: fileName || `recording_${Date.now()}.mp3`,
            md5: ''
          },
          header: {
            'Authori-zation': 'Bearer ' + this.$store.state.app.token
          },
          success: (uploadRes) => {
            console.log('录音上传完整响应:', uploadRes);
            console.log('- statusCode:', uploadRes.statusCode);
            console.log('- data:', uploadRes.data);
            console.log('- data 类型:', typeof uploadRes.data);
            console.log('- data 长度:', uploadRes.data ? uploadRes.data.length : 0);

            uni.hideLoading();

            try {
              // 检查 HTTP 状态码
              if (uploadRes.statusCode !== 200) {
                throw new Error(`HTTP错误: ${uploadRes.statusCode}`);
              }

              // 检查响应数据是否为空或无效
              if (!uploadRes.data || uploadRes.data.trim() === '') {
                throw new Error('服务器返回空数据');
              }

              const res = JSON.parse(uploadRes.data);
              console.log('解析后的响应:', res);

              if (res.status === 200 && res.data) {
                // 设置音频信息，根据实际返回的数据结构
                that.audio.url = res.data.file_path || res.data.url;
                that.audio.name = ""; // 录音标题默认不填写
                that.audio.size = res.data.size || 0;

                // 音频简介设置为录制时间
                that.audio.intro = "录制于" + new Date().toLocaleString();

                // 不设置默认封面，保持为空
                that.audio.cover = "";

                console.log('录音上传成功，音频数据:', that.audio);
                that.opTipsPopup('录音上传成功');
              } else {
                throw new Error(res.msg || '上传失败');
              }
            } catch (error) {
              console.error('处理录音上传响应失败:', error);
              console.error('原始响应数据:', uploadRes.data);
              console.error('响应状态码:', uploadRes.statusCode);
              that.opTipsPopup('录音上传失败: ' + error.message);
            }
          },
          fail: (error) => {
            console.error('录音上传请求失败:', error);
            uni.hideLoading();
            that.opTipsPopup('录音上传失败，请重试');
          }
        });

        return;
      }

      // #ifdef MP-WEIXIN || MP-ALIPAY || APP-PLUS
      // 小程序和APP环境下，如果是文件选择，使用 util.uploadAudio 方法
      this.$util.uploadAudio({
        url: 'upload/audio',
        name: 'file'
      }, function(res) {
        console.log('音频上传成功:', res);

        // 设置音频信息，根据实际返回的数据结构
        that.audio.url = res.data.file_path || res.data.url;
        that.audio.name = ""; // 音频标题默认不填写
        that.audio.size = res.data.size || 0;

        // 音频简介设置为上传时间
        that.audio.intro = "上传于" + new Date().toLocaleString();

        // 不设置默认封面，保持为空
        that.audio.cover = "";

        that.opTipsPopup('音频上传成功');
      }, function(error) {
        console.error('音频上传失败:', error);
        that.opTipsPopup('音频上传失败，请重试');
      });
      // #endif
    },

    // 录音弹窗控制
    recordPopupClick(isOpen) {
      if (isOpen) {
        this.currentPopup = 'record';
        this.$refs.recordPopup.open();
        // 弹窗打开后，显示录音组件
        this.$nextTick(() => {
          if (this.$refs.jcRecord) {
            this.$refs.jcRecord.showPicker();
          }
        });
      } else {
        this.$refs.recordPopup.close();
        this.currentPopup = null;
      }
    },

    // 录音显示事件
    onRecordShow() {
      this.isRecording = true;
      console.log('录音面板显示');
    },

    // 录音关闭事件
    onRecordClose() {
      this.isRecording = false;
      this.recordPopupClick(false);
      console.log('录音面板关闭');
    },

    // 录音确认事件
    onRecordConfirm(audioPath) {
      console.log('录音确认，音频路径:', audioPath);

      if (!audioPath) {
        this.opTipsPopup('录音无效，请重新录制');
        return;
      }

      // 处理录音上传
      this.handleAudioUpload(audioPath, true);
    },

    // 处理音频上传（录音和本地文件统一处理）
    handleAudioUpload(audioPath, closePopup = false) {
      console.log('开始处理录音上传:', audioPath);

      // 直接调用本地文件上传的方法，使用相同的逻辑
      this.handleAudioFileUpload(audioPath, `recording_${Date.now()}.mp3`);

      // 如果需要关闭弹窗
      if (closePopup) {
        // 延迟关闭弹窗，等待上传完成
        setTimeout(() => {
          this.recordPopupClick(false);
        }, 1000);
      }
    },
    

    
    // 处理媒体按钮点击
    handleMediaClick(type) {
      switch(type) {
        case 7: // 音频
          this.addFileClick();
          break;
        case 8: // 投票
          this.votePopupClick(true);
          break;
        default:
          console.log('未知的媒体类型:', type);
      }
    },
    

    

    

    

    
    // 位置选择
    locationClick() {
      let that = this;
      
      // 显示加载提示
      uni.showLoading({
        title: '正在打开位置选择...',
        mask: true
      });
      
      // 延迟一下再调用，避免界面卡顿
      setTimeout(() => {
        uni.hideLoading();
        
        uni.chooseLocation({
          success: function(res) {
            console.log('位置选择成功:', res);
            that.adds = {
              name: res.name || res.address || '未知位置',
              address: res.address || '',
              latitude: res.latitude || '',
              longitude: res.longitude || ''
            };
            that.opTipsPopup('位置添加成功');
          },
          fail: function(err) {
            console.error('位置选择失败:', err);
            
            // 根据错误类型给出不同提示
            if (err.errMsg) {
              if (err.errMsg.includes('auth') || err.errMsg.includes('permission')) {
                uni.showModal({
                  title: '权限提示',
                  content: '需要获取位置权限才能选择位置，请在浏览器设置中允许位置访问',
                  confirmText: '我知道了',
                  showCancel: false
                });
              } else if (err.errMsg.includes('cancel')) {
                // 用户取消，不显示错误提示
                console.log('用户取消位置选择');
                return;
              } else if (err.errMsg.includes('system')) {
                uni.showModal({
                  title: '系统提示',
                  content: '系统定位服务未开启，请在设置中开启定位服务',
                  confirmText: '我知道了',
                  showCancel: false
                });
              } else {
                that.opTipsPopup('位置选择失败，请重试');
              }
            } else {
              that.opTipsPopup('位置选择失败，请重试');
            }
          }
        });
      }, 300);
    },
    
    // 搜索商品
    searchClick(type = 0) {
      let that = this;
      
      // 已有商品列表并且是手动触发搜索
      if (type == 1 && that.goodsList.length) {
        return;
      }
      
      // 显示加载中
      uni.showLoading({
        title: '加载中',
        mask: true
      });
      
      // 准备请求参数
      const params = { 
        keyword: that.kw,
        page: 1,
        limit: 20
      };
      
      // 发起请求获取商品列表
      uni.request({
        url: that.$store.state.app.apiUrl + '/product/list',
        method: 'GET',
        data: params,
        header: {
          'Authorization': 'Bearer ' + that.$store.state.app.token
        },
        success: (res) => {
          uni.hideLoading();
          
          if (res.data && res.data.status === 200) {
            // 处理返回的商品数据
            that.goodsList = res.data.data.list || [];
          } else {
            uni.showToast({
              title: res.data?.msg || '获取商品列表失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('获取商品列表失败:', err);
          uni.showToast({
            title: '获取商品列表失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 商品弹窗控制
    shopPopupClick(isOpen) {
      if (isOpen) {
        this.openPopup('shop', this.$refs.shopPopup);
        this.searchClick(1);
      } else {
        this.$refs.shopPopup.close();
        this.currentPopup = null;
      }
    },
    
    // 圈子弹窗控制
    upPopupClick(isOpen) {
      if (isOpen) {
        this.openPopup('circle', this.$refs.upPopup);
        this.loadCircles();
      } else {
        this.$refs.upPopup.close();
        this.currentPopup = null;
      }
    },
    
    // 商品选择
    goodsClick(e) {
      const index = e.currentTarget.dataset.idx;
      this.goodsList[index].selected = !this.goodsList[index].selected;
      
      // 更新已选商品列表
      let selectedGoods = [];
      for (let item of this.goodsList) {
        if (item.selected) {
          selectedGoods.push(item);
        }
      }
      this.goods = selectedGoods;
    },
    
    // 圈子选择
    circleClick(e) {
      const index = e.currentTarget.dataset.idx;
      
      if (this.circleList[index].id == this.circle.id) {
        // 取消选择
        this.circle.id = "";
        this.circle.name = "";
        this.circle.avatar = "";
      } else {
        // 选择圈子
        this.circle = {
          id: this.circleList[index].id,
          name: this.circleList[index].name,
          avatar: this.circleList[index].avatar
        };
      }
    },
    
    // 图片预览
    previewClick(e) {
      const index = e.currentTarget.dataset.i;
      let urls = [];
      
      for (let img of this.imgs) {
        urls.push(img.url);
      }
      
      uni.previewImage({
        current: index,
        urls: urls
      });
    },
    
    // 显示操作提示
    opTipsPopup(msg) {
      uni.showToast({
        title: msg,
        icon: 'none',
        duration: 2000
      });
    },
    
    // 处理多媒体点击
    handleMediaClick(type) {
      // 关闭更多菜单
      if (type > 5) {
        this.showMoreOptions = false;
      }

      // 实现多媒体点击逻辑
      switch(type) {
        case 1: // 图片 - 已整合到统一媒体选择器
        case 2: // 视频 - 已整合到统一媒体选择器
          this.chooseMedia();
          break;
        case 3: // 话题 - 已在按钮处理，保留兼容
          this.topicPopupClick(true);
          break;
        case 4: // @好友 - 已在按钮处理，保留兼容
          this.userPopupClick(true);
          break;
        case 7: // 音频
          // 设置为音频类型
          this.type = 4; // 设置为音频类型 (1-纯文本,2-图片,3-视频,4-音频)
          // 只在没有音频时打开录音弹窗
          if (!this.audio.url) {
            this.recordPopupClick(true);
          }
          break;
        case 8: // 投票
          this.votePopupClick(true);
          break;
      }
    },
    
    // 处理多媒体长按 - 已删除长按设置封面功能
    handleMediaLongPress(type) {
      // type参数暂未使用
      // 功能已删除
    },
    
    // 切换更多选项菜单
    toggleMoreOptions() {
      if (this.showMoreOptions) {
        this.showMoreOptions = false;
        this.currentPopup = null;
      } else {
        this.closeAllPopups();
        this.showMoreOptions = true;
        this.currentPopup = 'more';
      }
    },
    
    // 活动弹窗控制
    activityPopupClick(isOpen) {
      if (isOpen) {
        this.openPopup('activity', this.$refs.activityPopup);
        this.loadActivities();
      } else {
        this.$refs.activityPopup.close();
        this.currentPopup = null;
      }
    },
    
    // 加载活动列表
    loadActivities() {
      let that = this;
      
      // 显示加载中
      uni.showLoading({
        title: '加载中',
        mask: true
      });
      
      // 准备请求参数
      const params = { 
        page: 1,
        limit: 20
      };
      
      // 发起请求获取活动列表
      uni.request({
        url: that.$store.state.app.apiUrl + '/activity/list',
        method: 'GET',
        data: params,
        header: {
          'Authorization': 'Bearer ' + that.$store.state.app.token
        },
        success: (res) => {
          uni.hideLoading();
          
          if (res.data && res.data.status === 200) {
            // 处理返回的活动数据
            that.activityList = res.data.data.list || [];
          } else {
            uni.showToast({
              title: res.data?.msg || '获取活动列表失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('获取活动列表失败:', err);
          uni.showToast({
            title: '获取活动列表失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 搜索用户
    searchUsers() {
      this.loadUsers();
    },
    
    // 选择用户
    selectUser(e) {
      const index = e.currentTarget.dataset.idx;
      const user = this.userList[index];
      
      // 插入@用户
      this.content += ` @${user.nickname} `;
      
      // 关闭弹窗
      this.$refs.userPopup.close();
      
      // 提示
      this.opTipsPopup(`已添加@${user.nickname}`);
    },
    
    // 选择话题
    selectTopic(e) {
      const index = e.currentTarget.dataset.idx;
      const topic = this.topicList[index];
      
      // 插入话题标签
      this.content += ` #${topic.name}# `;
      
      // 关闭弹窗
      this.$refs.topicPopup.close();
      
      // 提示
      this.opTipsPopup(`已添加话题#${topic.name}#`);
    },
    
    // 删除已上传文件
    delClick(type, index) {
      let that = this;
      
      uni.showModal({
        title: '提示',
        content: '确定要删除吗？',
        success: (res) => {
          if (res.confirm) {
            switch(type) {
              case 0: // 删除图片
                that.imgs.splice(index, 1);
                // 如果没有图片了，根据其他内容决定类型
                if (that.imgs.length === 0) {
                  if (that.video.url) {
                    that.type = 3; // 视频类型
                  } else if (that.audio.url) {
                    that.type = 4; // 音频类型
                  } else {
                    that.type = 1; // 纯文本类型
                  }
                }
                break;
              case 1: // 删除视频
                that.video = {
                  high: 0,
                  wide: 0,
                  url: "",
                  cover: ""
                };
                // 根据其他内容决定类型
                if (that.imgs.length > 0) {
                  that.type = 2; // 图片类型
                } else if (that.audio.url) {
                  that.type = 4; // 音频类型
                } else {
                  that.type = 1; // 纯文本类型
                }
                break;
              case 2: // 删除视频封面
                that.video.cover = "";
                break;
              case 3: // 删除音频封面
                that.audio.cover = "";
                break;
              case 4: // 删除音频
                that.audio = {
                  cover: "",
                  url: "",
                  name: "",
                  intro: "",
                  size: 0
                };
                // 根据其他内容决定类型
                if (that.imgs.length > 0) {
                  that.type = 2; // 图片类型
                } else if (that.video.url) {
                  that.type = 3; // 视频类型
                } else {
                  that.type = 1; // 纯文本类型
                }
                break;

            }
          }
        }
      });
    },
    
    // 调整图片顺序
    onSort(index, direction) {
      let that = this;
      
      if (direction === 0 && index > 0) {
        // 左移
        const temp = that.imgs[index];
        that.imgs[index] = that.imgs[index - 1];
        that.imgs[index - 1] = temp;
      } else if (direction === 1 && index < that.imgs.length - 1) {
        // 右移
        const temp = that.imgs[index];
        that.imgs[index] = that.imgs[index + 1];
        that.imgs[index + 1] = temp;
      }
      
      // 强制更新数组
      that.imgs = [...that.imgs];
    },
    
    // 加载圈子列表
    loadCircles() {
      let that = this;
      
      // 显示加载中
      uni.showLoading({
        title: '加载中',
        mask: true
      });
      
      // 准备请求参数
      const params = { 
        page: 1,
        limit: 50  // 增加限制数量，获取更多已加入的圈子
      };
      
      // 使用getJoinedCircles API获取我加入的圈子
      getJoinedCircles(params)
        .then(res => {
          uni.hideLoading();
          
          if (res.status === 200) {
            // 处理返回的圈子数据，映射字段名称
            that.circleList = (res.data.list || []).map(item => {
              return {
                id: item.circle_id || item.id,
                name: item.circle_name || item.name,
                avatar: item.circle_avatar || item.avatar,
                description: item.circle_description || item.description,
                member_count: item.member_count || 0
              };
            });
            

          } else {
            uni.showToast({
              title: res.msg || '获取圈子列表失败',
              icon: 'none'
            });
          }
        })
        .catch(err => {
          uni.hideLoading();
          console.error('获取圈子列表失败:', err);
          uni.showToast({
            title: '获取圈子列表失败',
            icon: 'none'
          });
      });
    },
    
    // 活动选择
    activityClick(e) {
      const index = e.currentTarget.dataset.idx;
      
      if (this.activityList[index].id == this.activity.id) {
        // 取消选择
        this.activity = {
          id: "",
          name: "",
          img: ""
        };
      } else {
        // 选择活动
        this.activity = {
          id: this.activityList[index].id,
          name: this.activityList[index].name,
          img: this.activityList[index].img
        };
      }
    },
    
    // 隐藏键盘
    hideKeyboard() {
      uni.hideKeyboard();
      // 同时隐藏表情面板
      this.showEmojiPanel = false;
    },
    
    // 快速插入文本
    handleQuickInsert(text) {
      this.content += text;
    },
    
    // 用户弹窗控制
    userPopupClick(isOpen) {
      if (isOpen) {
        this.openPopup('user', this.$refs.userPopup);
        this.loadUsers();
      } else {
        this.$refs.userPopup.close();
        this.currentPopup = null;
      }
    },
    
    // 话题弹窗控制
    topicPopupClick(status) {
      if (status) {
        this.openPopup('topic', this.$refs.topicPopup);
        this.loadTopics();
      } else {
        this.$refs.topicPopup.close();
        this.currentPopup = null;
      }
    },
    
    // 话题点击
    topicClick(topic) {
      // 只能选择一个话题，替换掉已选的话题
      this.selectedTopics = [{
        id: topic.id,
        name: topic.title,
        icon: topic.icon || '/static/img/topic-icon.png'
      }];
      // 关闭弹窗
      this.$refs.topicPopup.close();
    },
    
    // 移除已选话题
    removeSelectedTopic(index) {
      // 从数组中移除指定索引的话题
      this.selectedTopics.splice(index, 1);
    },
    
    // 用户点击
    userClick(user) {
      // 在内容中插入@用户
      const userTag = `@${user.nickname} `;
      this.content += userTag;
      
      // 关闭弹窗
      this.$refs.userPopup.close();
    },
    
    // 加载用户列表
    loadUsers() {
      let that = this;
      
      // 显示加载中
      uni.showLoading({
        title: '加载中',
        mask: true
      });
      
      // 准备请求参数
      const params = { 
        keyword: that.userKeyword,
        page: 1,
        limit: 20
      };
      
      // 使用getSocialFollowList API获取关注列表作为好友
      getSocialFollowList(params)
        .then(res => {
          uni.hideLoading();
          
          if (res.status === 200) {
            // 处理返回的用户数据
            // 将API返回的字段映射到组件需要的字段
            that.userList = (res.data.list || []).map(item => {
              return {
                id: item.follow_uid,
                nickname: item.follow_nickname,
                avatar: item.follow_avatar
              };
            });
            

          } else {
            uni.showToast({
              title: res.msg || '获取好友列表失败',
              icon: 'none'
            });
          }
        })
        .catch(err => {
          uni.hideLoading();
          console.error('获取好友列表失败:', err);
          uni.showToast({
            title: '获取好友列表失败',
            icon: 'none'
          });
        });
    },
    
    // 删除图片
    deleteImage(index) {
      this.images.splice(index, 1);
    },
    
    // 上传图片
    uploadImage() {
      let that = this;
      that.$util.uploadImageChange('upload/image', function(res) {
        that.images.push(res.data.url);
      });
    },
    
    // 发布笔记
    publishNote() {
      // 验证表单
      if (!this.title.trim()) {
        return this.opTipsPopup('请输入笔记标题');
      }
    },
    
    // 切换表情面板
    toggleEmojiPanel() {
      if (this.showEmojiPanel) {
        this.showEmojiPanel = false;
        this.currentPopup = null;
      } else {
        this.closeAllPopups();
        this.showEmojiPanel = true;
        this.currentPopup = 'emoji';
      }
    },
    
    // 选择表情
    onSelectEmoji(emoji) {
      // 获取表情文本或代码
      const emojiText = emoji.phrase || emoji.alt || emoji.value || '';
      if (emojiText) {
        // 将表情插入到内容中
        this.content += emojiText;
      }
    },
    
    // 选择GIF表情
    onSelectGif(gif) {
      if (gif && gif.url) {
        // 设置评论图片
        this.commentImage = gif.url;
        uni.showToast({
          title: 'GIF表情已添加',
          icon: 'none'
        });
      }
    },
    
    // 删除表情
    onDeleteEmoji() {
      if (this.content.length > 0) {
        // 删除最后一个字符
        this.content = this.content.substring(0, this.content.length - 1);
      }
    },
    
    // 发送评论
    onSendComment() {
      // 调用发布笔记方法
      this.saveDynamic(1);
    },
    
    // 解析表情内容
    parseEmojiContent(content) {
      if (!content) return '';
      
      // 简单的表情解析，将[表情]格式的文本替换为<img>标签
      // 实际应用中可能需要更复杂的解析逻辑
      let parsedContent = content;
      
      // 遍历表情映射
      Object.keys(this.emojiMap).forEach(key => {
        const decodedKey = decodeURIComponent(key);
        const url = this.emojiMap[key];
        
        // 全局替换所有匹配的表情文本
        const regex = new RegExp(decodedKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        parsedContent = parsedContent.replace(regex, `<img class="emoji" src="${url}" alt="${decodedKey}" />`);
      });
      
      return parsedContent;
    },
    
    // 保存草稿
    saveDraft() {
      // 如果已成功发布，不保存草稿
      if (this.isPublished) {
        return;
      }
      
      // 如果内容为空，不保存草稿
      if (!this.content.trim() && this.imgs.length === 0 && !this.video.url && !this.audio.url) {
        return;
      }
      
      // 构建草稿数据
      const draft = {
        content: this.content,
        type: this.type,
        imgs: this.imgs,
        video: this.video,
        audio: this.audio,
        adds: this.adds,
        circle: this.circle,
        activity: this.activity,
        timestamp: Date.now()
      };
      
      // 保存到本地存储
      try {
        uni.setStorageSync(this.draftKey, JSON.stringify(draft));

      } catch (e) {
        console.error('保存草稿失败:', e);
      }
    },
    
    // 加载草稿
    loadDraft() {
      try {
        const draftStr = uni.getStorageSync(this.draftKey);
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          
          // 检查草稿是否超过24小时
          const now = Date.now();
          const draftTime = draft.timestamp || 0;
          const hours24 = 24 * 60 * 60 * 1000;
          
          if (now - draftTime > hours24) {
            // 草稿超过24小时，删除草稿
            this.clearDraft();
            return;
          }
          
          // 询问用户是否加载草稿
          uni.showModal({
            title: '发现草稿',
            content: '是否恢复上次未完成的内容？',
            success: res => {
              if (res.confirm) {
                // 恢复草稿内容
                this.content = draft.content || '';
                this.type = draft.type || 2; // 默认使用图片类型 (1-纯文本,2-图片,3-视频,4-音频)
                this.imgs = draft.imgs || [];
                this.video = draft.video || {
                  high: 0,
                  wide: 0,
                  url: "",
                  cover: ""
                };
                this.audio = draft.audio || {
                  cover: "",
                  url: "",
                  name: "",
                  intro: "",
                  size: 0
                };
                this.adds = draft.adds || {
                  name: "",
                  address: "",
                  latitude: "",
                  longitude: ""
                };
                this.circle = draft.circle || {
                  id: "",
                  name: "",
                  avatar: ""
                };
                this.activity = draft.activity || {};
                
                uni.showToast({
                  title: '草稿已恢复',
                  icon: 'success'
                });
              } else {
                // 用户不需要草稿，清除草稿
                this.clearDraft();
              }
            }
          });
        }
      } catch (e) {
        console.error('加载草稿失败:', e);
      }
    },
    
    // 清除草稿
    clearDraft() {
      try {
        uni.removeStorageSync(this.draftKey);

      } catch (e) {
        console.error('清除草稿失败:', e);
      }
    },
    
    // 关闭所有弹窗
    closeAllPopups() {
      if (this.currentPopup) {
        this.currentPopup = null;
      }
      
      // 关闭所有弹窗
      this.$refs.shopPopup?.close();
      this.$refs.upPopup?.close();
      this.$refs.activityPopup?.close();
      this.$refs.topicPopup?.close();
      this.$refs.userPopup?.close();
      this.$refs.recordPopup?.close();
      
      // 关闭表情面板和更多选项
      this.showEmojiPanel = false;
      this.showMoreOptions = false;
    },
    
    // 打开指定弹窗
    openPopup(popupName, popupRef) {
      // 如果当前有弹窗打开且不是同一个，先关闭
      if (this.currentPopup && this.currentPopup !== popupName) {
        this.closeAllPopups();
      }
      
      this.currentPopup = popupName;
      
      // 延迟打开新弹窗，确保关闭动画完成
      setTimeout(() => {
        if (popupRef) {
          popupRef.open();
        }
      }, this.currentPopup !== popupName ? 200 : 0);
    },
    
    // 投票弹窗控制
    votePopupClick(isOpen) {
      if (isOpen) {
        this.openPopup('vote', this.$refs.votePopup);
      } else {
        this.$refs.votePopup.close();
        this.currentPopup = null;
      }
    },
    
    // 添加投票选项
    addVoteOption() {
      if (this.voteData.options.length < 10) { // 限制最多10个选项
        this.voteData.options.push("");
      } else {
        this.opTipsPopup("最多只能添加10个选项");
      }
    },
    
    // 删除投票选项
    deleteVoteOption(index) {
      if (this.voteData.options.length > 2) { // 至少保留2个选项
        this.voteData.options.splice(index, 1);
      } else {
        this.opTipsPopup("至少需要2个选项");
      }
    },
    
    // 确认投票
    confirmVote() {
      // 验证投票数据
      if (!this.voteData.title.trim()) {
        return this.opTipsPopup("请输入投票标题");
      }
      
      // 验证是否有空选项
      let hasEmptyOption = false;
      for (let option of this.voteData.options) {
        if (!option.trim()) {
          hasEmptyOption = true;
          break;
        }
      }
      
      if (hasEmptyOption) {
        return this.opTipsPopup("选项内容不能为空");
      }
      
      // 显示投票组件
      this.showVote = true;
      
      // 关闭弹窗
      this.votePopupClick(false);
    },
    
    // 删除投票
    deleteVote() {
      console.log('deleteVote方法被调用');
      uni.showModal({
        title: '提示',
        content: '确定要删除投票吗？',
        success: (res) => {
          if (res.confirm) {
            console.log('用户确认删除投票');
            // 隐藏投票组件
            this.showVote = false;

            // 重置投票数据
            this.voteData = {
              title: "",
              options: ["", ""],
              expireTime: 7
            };

            // 显示删除成功提示
            uni.showToast({
              title: '投票已删除',
              icon: 'success'
            });
          }
        }
      });
    },
    onRecordShow() {
      // 录音组件显示时的处理（可选）
    },

    // ==================== @用户相关方法 ====================

    // 检测@用户输入
    checkMentionInput(content, cursor) {
      // 检查光标前是否有@符号
      const beforeCursor = content.substring(0, cursor);
      const atIndex = beforeCursor.lastIndexOf('@');

      if (atIndex !== -1) {
        // 检查@符号后面的内容
        const afterAt = beforeCursor.substring(atIndex + 1);

        // 如果@后面没有空格
        if (!afterAt.includes(' ')) {
          // 检查是否是新输入的@符号（重置关闭状态）
          if (afterAt.length === 0) {
            // 刚输入@符号，重置关闭状态，显示关注用户列表
            this.mentionPanelClosed = false;
            this.searchUserKeyword = '';
            this.searchUsersForMention();
          } else if (!this.mentionPanelClosed) {
            // @后面有字符且面板未被关闭，进行搜索
            this.searchUserKeyword = afterAt;
            this.searchUsersForMention();
          }
        } else {
          // @后面有空格，隐藏搜索面板
          this.hideUserSearch();
        }
      } else {
        // 没有@符号，隐藏搜索面板
        this.hideUserSearch();
      }
    },

    // 搜索用户用于@功能（节流版本）
    searchUsersForMention() {
      // 使用节流优化搜索性能
      if (this.searchThrottleTimer) {
        clearTimeout(this.searchThrottleTimer);
      }

      this.searchThrottleTimer = setTimeout(() => {
        this.performUserSearch();
      }, 200); // 200ms节流
    },

    // 执行用户搜索
    async performUserSearch() {
      if (this.isSearchingUser) return;

      console.log('开始搜索用户，关键词:', this.searchUserKeyword);
      this.isSearchingUser = true;
      this.showUserSearch = true;

      try {
        if (this.searchUserKeyword.trim()) {
          // 有搜索关键词，调用搜索接口
          const res = await searchUsers({
            keyword: this.searchUserKeyword.trim(),
            page: 1,
            limit: 20
          });

          console.log('搜索用户接口响应:', res);
          if (res.status === 200) {
            this.searchUserList = (res.data.list || []).map(item => {
              // 处理头像URL
              let avatarUrl = item.avatar;
              if (avatarUrl && !avatarUrl.startsWith('http')) {
                avatarUrl = avatarUrl.startsWith('/') ?
                  `${this.$baseUrl}${avatarUrl}` :
                  `${this.$baseUrl}/${avatarUrl}`;
              }

              return {
                uid: item.uid,
                nickname: item.nickname,
                avatar: avatarUrl,
                is_follow: false // 搜索结果默认不是关注用户
              };
            });
            console.log('处理后的搜索用户列表:', this.searchUserList);
          } else {
            this.searchUserList = [];
            console.log('搜索用户接口响应异常:', res);
          }
        } else {
          // 没有搜索关键词，显示关注用户列表
          const response = await getSocialFollowList({
            page: 1,
            limit: 50
          });

          console.log('关注用户接口响应:', response);
          if (response.status === 200 && response.data && response.data.list) {
            this.searchUserList = response.data.list.map(item => {
              // 处理头像URL，如果是相对路径则补全
              let avatarUrl = item.follow_avatar;
              if (avatarUrl && !avatarUrl.startsWith('http')) {
                // 如果是相对路径，需要补全域名
                avatarUrl = avatarUrl.startsWith('/') ?
                  `${this.$baseUrl}${avatarUrl}` :
                  `${this.$baseUrl}/${avatarUrl}`;
              }

              return {
                uid: item.follow_uid,
                nickname: item.follow_nickname,
                avatar: avatarUrl,
                is_follow: true // 标记为已关注
              };
            });
            console.log('处理后的关注用户列表:', this.searchUserList);
          } else {
            this.searchUserList = [];
            console.log('关注用户接口响应异常:', response);
          }
        }
      } catch (error) {
        console.error('搜索用户失败:', error);
        this.searchUserList = [];
      } finally {
        this.isSearchingUser = false;
        console.log('搜索完成，面板状态:', {
          showUserSearch: this.showUserSearch,
          searchUserList: this.searchUserList,
          isSearchingUser: this.isSearchingUser
        });
      }
    },



    // 选择用户进行@
    selectUserForMention(user) {
      const beforeCursor = this.content.substring(0, this.cursorPosition);
      const afterCursor = this.content.substring(this.cursorPosition);
      const atIndex = beforeCursor.lastIndexOf('@');

      let newContent;
      let newCursorPosition;

      if (atIndex !== -1) {
        // 检查@符号后面是否有空格，如果有空格说明这个@已经完成，不应该替换
        const afterAt = beforeCursor.substring(atIndex + 1);
        if (afterAt.includes(' ')) {
          // @符号后面有空格，说明是已完成的@用户，直接在光标位置插入新的@用户
          const mentionText = `@${user.nickname} `;
          newContent = beforeCursor + mentionText + afterCursor;
          newCursorPosition = this.cursorPosition + mentionText.length;
        } else {
          // @符号后面没有空格，说明是正在输入的@，可以替换
          const mentionText = `@${user.nickname} `;
          newContent = beforeCursor.substring(0, atIndex) + mentionText + afterCursor;
          newCursorPosition = atIndex + mentionText.length;
        }
      } else {
        // 如果没有@符号，直接在光标位置插入@用户
        const mentionText = `@${user.nickname} `;
        newContent = beforeCursor + mentionText + afterCursor;
        newCursorPosition = this.cursorPosition + mentionText.length;
      }

      this.content = newContent;
      this.cursorPosition = newCursorPosition;

      // 添加到已@用户列表
      if (!this.mentionUsers.find(u => u.uid === user.uid)) {
        this.mentionUsers.push({
          uid: user.uid,
          nickname: user.nickname,
          avatar: user.avatar
        });
      }

      // 清理对应位置的排除记录（如果有的话）
      if (atIndex !== -1) {
        this.excludedMentions = this.excludedMentions.filter(excluded =>
          excluded.position !== atIndex
        );
      }

      // 重置面板关闭状态（用户选择了用户）
      this.mentionPanelClosed = false;

      // 隐藏搜索面板
      this.hideUserSearch();

      // 自动保存草稿
      this.autoSaveDraft();
    },

    // 隐藏用户搜索面板
    hideUserSearch() {
      this.showUserSearch = false;
      this.searchUserKeyword = '';
      this.searchUserList = [];
    },

    // 清理无效的排除记录
    cleanupExcludedMentions() {
      const originalLength = this.excludedMentions.length;

      // 检查排除列表中的@文本是否还存在于当前内容中
      this.excludedMentions = this.excludedMentions.filter(excluded => {
        const actualText = this.content.substring(excluded.position, excluded.position + excluded.text.length);
        return actualText === excluded.text;
      });

      // 如果排除列表发生变化，清理缓存
      if (this.excludedMentions.length !== originalLength) {
        this.clearSegmentCache();
      }
    },

    // 清理分段缓存
    clearSegmentCache() {
      this._segmentCache = null;
      this._segmentCacheKey = '';
    },

    // 关闭@用户面板（处理未选择用户的情况）
    closeMentionPanel() {
      // 标记用户手动关闭了面板
      this.mentionPanelClosed = true;

      // 如果用户输入了@文字但没有选择用户，将其标记为排除的@文本
      if (this.searchUserKeyword.trim()) {
        console.log('用户输入了@文字但未选择用户，保留为纯文本:', this.searchUserKeyword);

        // 找到当前@符号的位置
        const beforeCursor = this.content.substring(0, this.cursorPosition);
        const atIndex = beforeCursor.lastIndexOf('@');

        if (atIndex !== -1) {
          const mentionText = '@' + this.searchUserKeyword;
          // 将这个@文本添加到排除列表中
          this.excludedMentions.push({
            text: mentionText,
            position: atIndex
          });
        }
      }

      // 隐藏面板
      this.hideUserSearch();
    },

    // 显示关注的用户列表
    showFollowUsers() {
      // 重置面板关闭状态，允许重新@用户
      this.mentionPanelClosed = false;
      // 清空搜索关键词，显示关注用户
      this.searchUserKeyword = '';
      this.searchUsersForMention();
    },

    // 自动保存草稿（防抖）
    autoSaveDraft() {
      // 清除之前的定时器
      if (this.saveTimer) {
        clearTimeout(this.saveTimer);
      }

      // 设置新的定时器
      this.saveTimer = setTimeout(() => {
        this.saveDraft();
      }, 1000); // 1秒后保存
    },

    // 删除@用户
    removeMentionUser(uid) {
      // 先找到要删除的用户信息
      const userToRemove = this.mentionUsers.find(user => user.uid === uid);

      if (userToRemove) {
        // 从内容中移除对应的@文本，只处理 @用户名 格式
        const pattern = new RegExp(`@${this.escapeRegExp(userToRemove.nickname)}\\s*`, 'g');
        this.content = this.content.replace(pattern, '');
      }

      // 从已@用户列表中移除
      this.mentionUsers = this.mentionUsers.filter(user => user.uid !== uid);

      // 自动保存草稿
      this.autoSaveDraft();
    },

    // 转义正则表达式特殊字符
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    // 解析内容中的@用户并更新mentionUsers列表
    parseMentionUsersFromContent() {
      // 从内容中提取所有@用户名
      const pattern = /@([^\s@]+)/g;
      const mentionedNicknames = [];
      let match;

      while ((match = pattern.exec(this.content)) !== null) {
        mentionedNicknames.push(match[1]);
      }

      // 只保留在内容中仍然存在的@用户
      this.mentionUsers = this.mentionUsers.filter(user =>
        mentionedNicknames.includes(user.nickname)
      );
    },
  }
}
</script>
<style>
.container {
  padding-bottom: 140rpx; /* 为固定工具栏留出空间，减少空白 */
}

/* 导航栏样式 - 参考details.vue */
.nav-box{
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  width: 100%;
  background: #fff;
  box-sizing: border-box;
}
.nav-item{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-item .nav-back{
  padding: 0 30rpx;
  width: 34rpx;
  height: 100%;
  border-radius: 50%;
}
.nav-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 700;
  text-align: center;
  max-width: 400rpx;
}
.nav-publish {
  padding: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* 非小程序环境的默认内边距 */
/* #ifndef MP-WEIXIN */
.nav-publish {
  padding-right: 30rpx;
}
/* #endif */

.publish-btn {
  position: relative;
  padding: 0 32rpx;
  height: 64rpx;
  min-width: 64rpx;
  border-radius: 32rpx;
  background: #000;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  text-align: center;
  line-height: 64rpx;
  border: none;
  outline: none;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4rpx 16rpx rgba(0, 0, 0, 0.15),
    0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 发光效果 */
.publish-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* 内部高光 */
.publish-btn::after {
  content: '';
  position: absolute;
  top: 2rpx;
  left: 2rpx;
  right: 2rpx;
  height: 30rpx;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.05) 100%);
  border-radius: 30rpx 30rpx 60rpx 60rpx;
  opacity: 0.6;
}

/* 点击效果 */
.publish-btn:active {
  transform: translateY(2rpx) scale(0.98);
  box-shadow:
    0 2rpx 8rpx rgba(0, 0, 0, 0.2),
    0 1rpx 4rpx rgba(0, 0, 0, 0.15);
}

/* 禁用状态 */
.publish-btn-disabled {
  background: #666;
  color: #999;
  cursor: not-allowed;
  box-shadow:
    0 2rpx 8rpx rgba(0, 0, 0, 0.1),
    0 1rpx 4rpx rgba(0, 0, 0, 0.05);
}

.publish-btn-disabled::before {
  display: none;
}

.publish-btn-disabled::after {
  opacity: 0.3;
}

.publish-btn-disabled:active {
  transform: none;
}

/* 小程序环境适配 */
/* #ifdef MP-WEIXIN */
.publish-btn {
  background: #000;
  border: 2rpx solid rgba(255, 255, 255, 0.1);
}

.publish-btn::before {
  background: linear-gradient(45deg,
    rgba(7, 193, 96, 0.1) 0%,
    rgba(0, 174, 66, 0.05) 50%,
    rgba(7, 193, 96, 0.1) 100%);
}
/* #endif */

/* H5环境优化 */
/* #ifdef H5 */
.publish-btn {
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.publish-btn:hover {
  transform: translateY(-2rpx);
  box-shadow:
    0 8rpx 24rpx rgba(0, 0, 0, 0.2),
    0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.publish-btn:hover::before {
  opacity: 1;
}

.publish-btn:hover::after {
  opacity: 0.8;
}
/* #endif */

/* APP环境优化 */
/* #ifdef APP-PLUS */
.publish-btn {
  background: #000;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.publish-btn::before {
  background: linear-gradient(45deg,
    rgba(255, 107, 107, 0.1) 0%,
    rgba(238, 90, 82, 0.05) 50%,
    rgba(255, 107, 107, 0.1) 100%);
}
/* #endif */

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .publish-btn {
    background: #1a1a1a;
    border: 1rpx solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 4rpx 16rpx rgba(0, 0, 0, 0.3),
      0 2rpx 8rpx rgba(0, 0, 0, 0.2);
  }

  .publish-btn-disabled {
    background: #333;
    color: #666;
  }
}

.content-box {
  margin: 30rpx;
  width: calc(100% - 60rpx);
  border-radius: 30rpx;
  position: relative;
}

.textarea-container {
  position: relative;
  width: 100%;
}

/* 透明的textarea用于输入 */
.textarea-input {
  width: calc(100% - 40rpx);
  padding: 20rpx;
  font-size: 28rpx;
  min-height: 280rpx;
  line-height: 1.6;
  color: transparent; /* 文字透明，只显示光标 */
  background: transparent;
  position: relative;
  z-index: 2;
}

/* 文本覆盖层 */
.text-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 40rpx);
  padding: 20rpx;
  font-size: 28rpx;
  min-height: 280rpx;
  line-height: 1.6;
  pointer-events: none; /* 不阻挡textarea的点击 */
  z-index: 1;
}



.formatted-content {
  width: 100%;
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  word-wrap: break-word;
  word-break: break-all;
}

/* 占位符文本样式 */
.placeholder-text {
  color: #999;
  font-size: 28rpx;
}

/* 普通文本样式 */
.normal-text {
  color: #333;
  font-size: 28rpx;
}

/* @用户文本样式 - 蓝色链接样式 */
.mention-text {
  color: #1890ff;
  font-size: 28rpx;
  font-weight: 500;
}

/* 兼容原有的textarea-item样式 */
.content-box .textarea-item {
  width: calc(100% - 40rpx);
  padding: 20rpx;
  font-size: 28rpx;
  min-height: 280rpx;
}

/* @用户标签样式 */
.mention-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding: 0 20rpx 10rpx;
  margin-top: 10rpx;
}



.mention-tag {
  display: flex;
  align-items: center;
  background: #f0f9ff;
  border: 1px solid #07c160;
  border-radius: 20rpx;
  padding: 8rpx 12rpx;
}

.mention-tag:active {
  background: #e6f7ff;
}

.mention-avatar {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  margin-right: 8rpx;
  flex-shrink: 0;
}

.mention-nickname {
  font-size: 24rpx;
  color: #07c160;
  font-weight: 500;
  margin-right: 8rpx;
}

.mention-delete {
  font-size: 28rpx;
  color: #999;
  font-weight: bold;
  width: 24rpx;
  height: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
}

.content-box .scroll-box {
  margin: 20rpx 0;
  white-space: nowrap;
  width: 100%;
}

.scroll-box .scroll-item {
  display: flex;
  padding: 0 20rpx;
}

.scroll-item .del {
  position: absolute;
  z-index: 9;
  top: 8rpx;
  right: 8rpx;
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  justify-content: center;
  transform: rotate(45deg);
  border: 1px solid #fff;
  background: rgba(0, 0, 0, 0.3);
}

.scroll-item .del image {
  width: 18rpx;
  height: 18rpx;
}

.scroll-item .img-box {
  flex-shrink: 0;
  margin-right: 8rpx;
  width: 196rpx;
  height: 196rpx;
  border-radius: 8rpx;
  border: 1px solid #f8f8f8;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.scroll-item .icon {
  color: #999;
  font-size: 36rpx;
  font-weight: 700;
}

.scroll-item image,
.scroll-item video {
  width: 100%;
  height: 100%;
}

.scroll-item .sort {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 196rpx;
  height: 45rpx;
  background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.376));
  border-radius: 0 0 8rpx 8rpx;
}

.scroll-item .sort .sort-item {
  width: 50%;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 700;
}

.scroll-item .video-box {
  width: 100%;
  justify-content: space-between;
}

.video-box .video-item {
  width: calc(50% - 8rpx);
  height: 240rpx;
  border-radius: 8rpx;
  position: relative;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-box .video-item video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8rpx;
}

.video-box .video-item .del {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  z-index: 10;
}

.video-box .video-item .del image {
  width: 20rpx;
  height: 20rpx;
}

.scroll-item .audio-box,
.scroll-item .file-audio {
  width: 100%;
  height: 128rpx;
  border-radius: 8rpx;
}

.scroll-item .file-audio {
  color: #fff;
  position: relative;
  overflow: hidden;
}

.file-audio .audio-left {
  margin-right: 30rpx;
  width: 128rpx;
  height: 128rpx;
  position: relative;
}

.file-audio .audio-left .icon {
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  bottom: 40rpx;
  left: 40rpx;
  width: 48rpx;
  height: 48rpx;
}

.file-audio .audio-bg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
}

.file-audio .audio-mb {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  -webkit-backdrop-filter: saturate(150%) blur(25px);
  backdrop-filter: saturate(150%) blur(25px);
  background: rgba(0, 0, 0, 0.5);
}

.file-audio .audio-t1 {
  font-size: 26rpx;
  font-weight: 700;
}

.file-audio .audio-t2 {
  margin-top: 10rpx;
  opacity: 0.8;
  font-size: 20rpx;
}

.file-audio .aph {
  color: #fff;
}

.scroll-item .file-add {
  flex-direction: column;
  justify-content: center;
  background: #f8f8f8;
  border: 1px solid #f8f8f8;
  font-size: 18rpx;
  color: #000;
}

.scroll-item .file-add image {
  width: 20rpx;
  height: 20rpx;
  margin-bottom: 8rpx;
}

.content-box .content-item {
  width: calc(100% - 40rpx);
  margin: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 16rpx;
}

/* 内容区域的标签项样式调整 */
.content-item .tag-item {
  margin: 0; /* 重置margin，使用gap来控制间距 */
  flex-shrink: 0; /* 防止标签被压缩 */
}

/* 标签区域的标签项保持原有边距 */
.tags-box .tag-item {
  margin: 0 10rpx 10rpx;
}



.tags-box {
  width: calc(100% - 40rpx);
  padding: 0 20rpx;
  display: flex;
  flex-wrap: wrap;
}

.tag-item {
  margin: 0 10rpx 10rpx;
  height: 64rpx;
  border-radius: 16rpx;
  border: 4rpx solid #f5f5f5;
  transition: all 0.2s ease;
}

.tag-item:active {
  transform: scale(0.95);
  background-color: #f8f8f8;
}

/* 已选择状态 */
.tag-item.selected {
  border: 4rpx solid #f5f5f5;
  background-color: #fff;
}

/* 未选择状态 */
.tag-item.unselected {
  border: 4rpx dashed #e0e0e0;
  background-color: #fafafa;
}

.tag-item.unselected:active {
  border-color: #d0d0d0;
  background-color: #f0f0f0;
  transform: scale(0.95);
}

.tag-item .icon {
  margin: 8rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
  transition: opacity 0.2s ease;
}

.tag-item text {
  font-size: 24rpx;
  font-weight: 700;
  margin: 0 16rpx 0 8rpx;
  transition: color 0.2s ease;
}

.tag-delete {
  width: 28rpx;
  height: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8rpx;
}

.tag-delete text {
  font-size: 24rpx;
  color: #999;
  margin: 0;
}

.location-icon {
  padding: 12rpx;
  transition: opacity 0.2s ease;
}

.location-text {
  max-width: 200rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-hk .hk-item .del {
  color: #fa5150;
  font-size: 28rpx;
  font-weight: 700;
  transform: rotate(45deg);
}

.popup-box {
  width: calc(100% - 40rpx);
  padding: 20rpx;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  position: relative;
  overflow: hidden;
}

.popup-box .popup-top {
  width: calc(100% - 20rpx);
  padding: 10rpx;
  justify-content: space-between;
}

.popup-top .popup-title .t1 {
  font-size: 38rpx;
  font-weight: 700;
}

.popup-top .popup-title .t2 {
  color: #999;
  font-size: 20rpx;
  font-weight: 300;
}

.popup-top .popup-close {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f8f8f8;
  justify-content: center;
  transform: rotate(45deg);
}

.popup-box .popup-btn {
  margin: 40rpx 10rpx;
  width: calc(100% - 20rpx);
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
  background: #000;
  border-radius: 100rpx;
}

.popup-box .popup-search {
  margin: 30rpx 10rpx;
  width: calc(100% - 40rpx);
  padding: 0 10rpx;
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.popup-box .popup-search input {
  width: calc(100% - 130rpx);
  margin: 0 20rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.popup-search .search-ph {
  color: #999;
}

.popup-search .search-btn {
  width: 90rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 20rpx;
  font-weight: 700;
  color: #000;
  background: #fff;
  border-radius: 8rpx;
}

.popup-box .popup-scroll {
  width: 100%;
  max-height: 50vh;
  overflow-y: scroll;
}

.popup-box .circle-box {
  display: flex;
  flex-wrap: wrap;
}

.circle-box .circle-item {
  margin: 10rpx;
  padding: 8rpx;
  color: #000;
  border-color: #f8f8f8;
  border-width: 4rpx;
  border-style: solid;
  border-radius: 50rpx;
}

.circle-box .active {
  border-color: #000 !important;
  background: #f8f8f8 !important;
}

.circle-box .circle-item image {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
}

.circle-box .circle-item text {
  margin: 0 16rpx;
  font-size: 26rpx;
  font-weight: 700;
}

.empty-box {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-box image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.empty-box .e1 {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.empty-box .e2 {
  font-size: 24rpx;
  color: #999;
}

.tips-box {
  padding: 20rpx 30rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12rpx;
  justify-content: center;
}

.tips-box .tips-item {
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.df {
  display: flex;
  align-items: center;
}

.ohto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-toolbar-fixed {
  position: fixed;
  left: 0;
  width: 100%;
  background-color: #f8f8f8;
  border-top: 1px solid #e5e5e5;
  z-index: 99;
  box-shadow: 0 -2rpx 6rpx rgba(0, 0, 0, 0.05);
  transition: bottom 0.3s ease;
}

/* 键盘弹起时的样式调整 */
.media-toolbar-fixed.keyboard-active {
  padding-bottom: 0; /* 键盘弹起时移除底部安全区域 */
}

/* 非键盘状态时保持底部安全区域 */
.media-toolbar-fixed:not(.keyboard-active) {
  padding-bottom: env(safe-area-inset-bottom);
}

.toolbar-box {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  min-height: 88rpx;
  position: relative;
}

.toolbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 6rpx;
  border-radius: 12rpx;
  transition: all 0.2s;
  flex: 1;
  max-width: 100rpx;
  min-height: 70rpx;
}

.toolbar-item:active {
  background-color: #eaeaea;
  transform: scale(0.95);
}

.toolbar-item.active {
  background-color: #f0f0f0;
  border-radius: 12rpx;
}

.toolbar-item image {
  width: 44rpx;
  height: 44rpx;
}

.toolbar-item .vote {
  color: #ff9500;
  text-shadow: 0 1rpx 2rpx rgba(255, 149, 0, 0.3);
  font-size: 40rpx;
  font-weight: bold;
  background-color: rgba(255, 149, 0, 0.1);
  border-radius: 50%;
  width: 44rpx;
  height: 44rpx;
  line-height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-options-panel {
  width: 100%;
  background: #f8f8f8;
  border-radius: 0;
  max-height: 0;
  overflow: hidden;
  position: relative;
  top: 0;
  left: 0;
}

.more-options-panel.expanded {
  max-height: 200rpx;
  padding: 20rpx 0;
}

.more-options-row {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin-bottom: 0;
}

.more-options-row .toolbar-item {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 12rpx 6rpx;
  margin: 0 6rpx;
}

.more-options-row .toolbar-item image {
  width: 44rpx;
  height: 44rpx;
}

.toolbar-item.invisible {
  opacity: 0;
  pointer-events: none;
}

/* 话题列表样式 */
.topic-box {
  width: 100%;
  padding: 10rpx;
}

.topic-item {
  width: calc(100% - 40rpx);
  padding: 20rpx;
  border-bottom: 1px solid #f5f5f5;
}

.topic-tag {
  width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  background: #f8f8f8;
  border-radius: 50%;
  font-size: 36rpx;
  font-weight: bold;
  margin-right: 20rpx;
}

.topic-content {
  flex: 1;
}

.topic-name {
  font-size: 28rpx;
  font-weight: 700;
  margin-bottom: 6rpx;
}

.topic-desc {
  font-size: 24rpx;
  color: #999;
}

/* 录音组件样式 */
.record-popup-box {
  padding-bottom: 40rpx;
}

.record-container {
  width: 100%;
  padding: 30rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.record-text {
  font-size: 28rpx;
  color: #333;
  text-align: center;
  padding: 20rpx;
}

/* 投票弹窗样式 */
.vote-popup {
  padding-bottom: 30rpx;
}

.vote-title-input {
  margin: 20rpx 10rpx;
  width: calc(100% - 20rpx);
  border-bottom: 1px solid #f0f0f0;
}

.vote-input {
  width: 100%;
  height: 80rpx;
  font-size: 28rpx;
  font-weight: 500;
  padding: 0 10rpx;
}

.vote-options {
  margin: 20rpx 10rpx;
  width: calc(100% - 20rpx);
}

.vote-option-item {
  position: relative;
  margin-bottom: 20rpx;
  background-color: #f5f6fa;
  border-radius: 16rpx;
  padding: 0 20rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
}

.vote-option-input {
  flex: 1;
  height: 80rpx;
  font-size: 26rpx;
  color: #333;
}

.vote-option-delete {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-circle {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background-color: #ff5252;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-line {
  width: 20rpx;
  height: 4rpx;
  background-color: #fff;
}

.vote-add-option {
  margin: 30rpx 10rpx;
  width: calc(100% - 20rpx);
  height: 80rpx;
  border: 1px dashed #ddd;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.vote-add-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.vote-add-text {
  font-size: 26rpx;
}

.vote-bottom-btns {
  margin-top: 40rpx;
  display: flex;
  justify-content: space-between;
  padding: 0 30rpx;
}

.vote-cancel-btn, .vote-confirm-btn {
  width: 45%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 500;
  border-radius: 40rpx;
}

.vote-cancel-btn {
  color: #666;
  background-color: #f5f5f5;
}

.vote-confirm-btn {
  color: #fff;
  background-color: #000;
}

/* 投票显示样式 */
.vote-display {
  margin: 20rpx 0;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 16rpx;
  width: 100%;
}

.vote-display-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.vote-icon {
  margin-right: 10rpx;
  font-size: 32rpx;
}

.vote-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.vote-display-options {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.vote-display-option {
  padding: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333;
  text-align: center;
}

/* 投票显示样式 */
.vote-box {
  width: 100%;
}

.vote-container {
  width: calc(100% - 40rpx);
  margin: 0 20rpx;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  padding: 20rpx;
  position: relative;
}

.vote-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  position: relative;
}

.vote-title-container {
  display: flex;
  align-items: center;
}

.vote-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
}

.vote-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  text-align: left;
}

.vote-delete {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vote-options {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.vote-option {
  padding: 20rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333;
  text-align: center;
}

.toolbar-label {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #666;
  text-align: center;
  line-height: 1;
}



.empty-users, .loading-users {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx 20rpx;
  color: #999;
  font-size: 26rpx;
}



/* @用户面板样式 - 横向滑动卡片式 */
.mention-user-panel {
  position: fixed;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1rpx solid #e5e5e5;
  z-index: 999;
  padding: 20rpx 0;
  /* 在工具栏上方，工具栏最小高度88rpx + 安全区域 */
  margin-bottom: calc(88rpx + env(safe-area-inset-bottom));
}

/* @用户面板中的关闭按钮定位 */
.mention-user-panel .popup-close {
  position: absolute;
  top: 10rpx;
  right: 20rpx;
  z-index: 1000;
}



.empty-mention-users,
.loading-mention-users {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 横向滚动容器 */
.mention-user-scroll {
  width: 100%;
  height: 120rpx;
  white-space: nowrap;
}

/* 横向用户列表容器 */
.mention-user-list-horizontal {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 120rpx;
  padding: 0 20rpx;
  gap: 20rpx;
}

/* 用户卡片样式 */
.mention-user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100rpx;
  height: 120rpx;
  flex-shrink: 0;
  position: relative;
  border-radius: 12rpx;
  padding: 8rpx;
}

.mention-user-card:active {
  background: #f5f5f5;
}

/* 用户头像 */
.mention-user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-bottom: 8rpx;
  flex-shrink: 0;
  border: 2rpx solid #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 用户昵称 */
.mention-user-nickname {
  font-size: 22rpx;
  color: #333;
  font-weight: 500;
  text-align: center;
  max-width: 80rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}


</style>