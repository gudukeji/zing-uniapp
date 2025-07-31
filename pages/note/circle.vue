<template>
    <view class="container">
      <!-- 导航栏 -->
      <view class="nav-box df" :style="{'padding-top': statusBarHeight + 'px', 'background': 'rgba(255, 255, 255,' + navbarTrans + ')'}">
        <view class="nav-back df" :style="{'height': titleBarHeight + 'px'}" @tap="navBack">
          <image src="/static/img/back.png" style="width:34rpx;height:34rpx"></image>
        </view>
        <view v-if="navbarTrans == 1" class="nav-title ohto">{{ circleInfo.circle_name || circleInfo.name }}</view>
      </view>
      
          <!-- 圈子头部区域 - 沉浸式全屏设计 -->
      <view class="circle-header">
        <!-- 主背景容器 - 从屏幕顶部开始 -->
        <view class="images-box df">
          <!-- 圈子背景图片容器 -->
          <view class="circle-image-container">
            <lazy-image
              v-if="circleInfo.circle_background || circleInfo.circle_avatar"
              :src="circleInfo.circle_background || circleInfo.circle_avatar"
              class="circle-bg-image"
              mode="aspectFill"
              @tap="previewCircleImage">
            </lazy-image>

            <!-- 默认背景 -->
            <view v-else class="default-bg"></view>

            <!-- 背景遮罩层 -->
            <view class="bg-overlay"></view>

          </view>
        </view>
        
        <!-- 圈子信息叠加层 -->
        <view class="circle-info-overlay" :style="{'padding-top': statusBarHeight + titleBarHeight + 40 + 'rpx'}">
          <view class="circle-main-info df">
            <!-- 圈子头像 -->
            <view class="circle-avatar">
              <image 
                v-if="!showLoading"
                :src="circleInfo.circle_avatar || '/static/img/avatar.png'" 
                mode="aspectFill"
                class="avatar-img">
              </image>
              <view v-else class="skeleton-avatar"></view>
          </view>
            
            <!-- 圈子名称和统计信息 -->
            <view class="circle-details">
              <view class="circle-name">
                <text v-if="!showLoading">{{ circleInfo.circle_name || circleInfo.name || '圈子加载中...' }}</text>
                <view v-else class="skeleton-text"></view>
              </view>
              <view class="circle-stats df">
                <text v-if="!showLoading" class="stat-item">{{ circleInfo.dynamic_count || 0 }}篇笔记</text>
                <text v-if="!showLoading" class="stat-divider">·</text>
                <text v-if="!showLoading" class="stat-item">{{ circleInfo.member_count || 0 }}人加入</text>
                <text v-if="!showLoading && circleInfo.view_count" class="stat-divider">·</text>
                <text v-if="!showLoading && circleInfo.view_count" class="stat-item">访问 {{ circleInfo.view_count }}</text>
                <!-- 骨架屏 -->
                <view v-if="showLoading" class="skeleton-stats">
                  <view class="skeleton-item"></view>
                  <view class="skeleton-item"></view>
                  <view class="skeleton-item"></view>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 圈子描述 -->
          <view class="circle-description" v-if="!showLoading && (circleInfo.circle_description || circleInfo.intro)">
            <text>{{ circleInfo.circle_description || circleInfo.intro }}</text>
          </view>
          
          <!-- 圈子公告 -->
          <view class="circle-notice" v-if="!showLoading && circleInfo.circle_notice">
            <text>【公告】{{ circleInfo.circle_notice }}</text>
          </view>
          
          <!-- 操作按钮 -->
          <view class="btn-box df">
            <!-- 加载中状态 -->
            <view v-if="showLoading" class="btn df bg1 loading">
              <view class="loading-dots">
                <view class="dot"></view>
                <view class="dot"></view>
                <view class="dot"></view>
              </view>
            </view>

            <!-- 正常状态 -->
            <template v-else>
              <!-- 加入/已加入按钮 -->
              <view
                @tap="handleJoinCircle"
                :class="['btn', 'df', 'bg1', circleInfo.is_joined ? 'joined-state' : '']">
                <!-- 未加入时显示成员头像 -->
                <view v-if="!circleInfo.is_joined && circleInfo.recent_members && circleInfo.recent_members.length > 0" class="cu-img-group">
                  <view
                    v-for="(member, index) in circleInfo.recent_members.slice(0, 3)"
                    :key="index"
                    class="cu-img">
                    <image :src="member.avatar || '/static/img/avatar.png'" mode="aspectFill"></image>
                  </view>
                </view>
                <text>{{ circleInfo.is_joined ? "已加入" : "加入圈子" }}</text>
              </view>

              <!-- 分享按钮 -->
              <view
                @tap="shareClick(true)"
                :class="['btn', 'df', 'bg2', circleInfo.is_joined ? 'share-expanded' : '']">
                <image src="/static/img/fx1.png" class="icon"></image>
                <text v-show="circleInfo.is_joined">分享</text>
              </view>
            </template>
          </view>
          </view>
        </view>
        
        <!-- 分类标签 -->
      <view class="bar-box df">
          <view 
            v-for="(item, index) in barList" 
            :key="index" 
            class="bar-item df" 
            @tap="barClick" 
            :data-idx="index">
            <text :style="{
              'color': index == barIdx ? '#000' : '#999',
              'font-size': index == barIdx ? '28rpx' : '26rpx'
            }">{{ item }}</text>
            <view :style="{'opacity': index == barIdx ? 1 : 0}" class="bar-line"></view>
          </view>
      </view>
      <!-- 规则tab内容 -->
      <view v-if="barIdx === barList.length - 1" class="rule-box">
        <view class="rule-title">小圈规则</view>
        <view class="rule-list">
          <view class="rule-item">
            <view class="rule-tag tag-orange">适合人群</view>
            <text class="rule-text">性格属性有K8倾向，以及喜欢和K8做朋友的圈友。性格属性有K8倾向，以及喜欢和K8做朋友的圈友。</text>
          </view>
          <view class="rule-item">
            <view class="rule-tag tag-orange">提倡内容</view>
            <text class="rule-text">分享记录猫咪生活，如猫咪的想法、装扮、吐槽等。</text>
          </view>
          <view class="rule-item">
            <view class="rule-tag tag-orange">禁止内容</view>
            <text class="rule-text">广告/引流贴，或与圈子主题毫不相关的内容，看到直接删除。</text>
          </view>
        </view>
        <view class="rule-team-title df">
          <text>管理团队</text>
          <view class="rule-team-all" @tap="goToAllMembers">全部成员</view>
        </view>
        <view class="rule-team-list">
          <view class="member-item df" v-for="(member, idx) in adminMembers" :key="'admin-'+idx" @tap="goToUserProfile(member.uid)">
            <image class="avatar" :src="member.user_avatar || '/static/img/avatar.png'"></image>
            <view class="info">
              <view class="name df">
                <text>{{member.user_nickname}}</text>
                <view v-if="member.role_type === 3" class="role-tag owner">圈主</view>
                <view v-else-if="member.role_type === 2" class="role-tag admin">管理员</view>
              </view>
              <view class="meta df">
                <text :class="['gender', member.gender==='男' ? 'male' : 'female']">{{member.gender==='男'?'♂':'♀'}}</text>
                <text class="contrib">加入时间：{{formatJoinTime(member.join_time)}}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 推荐、最新内容区域（barIdx>0时显示） -->
      <view v-else class="content-area">
        <!-- 加载中提示 -->
        <view v-if="showLoading" class="loading-container">
          <view class="loading-indicator"></view>
        </view>
        
        <!-- 空状态 -->
        <view v-if="isEmpty" class="empty-box df">
          <image src="/static/img/empty.png"/>
          <view class="e1">{{ (circleInfo.circle_name || circleInfo.name || '该圈子') }} 暂无笔记</view>
          <view class="e2">{{ circleInfo.is_joined ? '快来发布第一篇圈内笔记吧' : '加入圈子即可发布圈内笔记' }}</view>
        </view>
        
        <!-- 笔记列表 -->
        <view v-else :class="[isWaterfall ? 'dynamic-box' : '']">
          <!-- 瀑布流布局 -->
          <waterfall
            v-if="isWaterfall"
            :activity="[]"
            :note="list"
            :page="page"
            @likeback="waterfallLikeClick"
            @followback="followClick"
          ></waterfall>

          <!-- 普通列表布局 -->
          <block v-else>
            <card-gg
              v-for="(item, index) in list"
              :key="index"
              @likeback="likeClick"
              :item="item"
              :idx="index"
              @update="onCardUpdate"
              @refresh="fetchList"
            ></card-gg>
          </block>
        </view>
        
        <!-- 加载更多 -->
        <view v-if="list.length > 0 && loadStatus === 'noMore'" style="text-align: center; padding: 20rpx 0; color: #999; font-size: 24rpx;">
          没有更多数据了
      </view>
          </view>
      
      <!-- 分享组件 -->
      <share-component 
        :show="showShare"
        :noteInfo="circleShareInfo"
        :userId="userId"
        @close="closeShare"
        @share="handleShare"
        @dislike="handleDislike"
        @report="handleReport"
        @edit="handleEdit"
        @delete="handleDelete">
      </share-component>
      
      <!-- 提示弹窗 -->
      <uni-popup ref="tipsPopup" type="top" :mask-background-color="'rgba(0, 0, 0, 0)'">
        <view class="tips-box df">
          <view class="tips-item">{{ tipsTitle }}</view>
        </view>
      </uni-popup>
    </view>
  </template>
  
  <script>

  import lazyImage from '@/components/lazyImage/lazyImage.vue'
  import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'
  import waterfall from '@/components/waterfall/waterfall.vue'
  import cardGg from '@/components/card-gg/card-gg.vue'
  import shareComponent from '@/components/share/index.vue'
  import { getCircleDetail, joinCircle, exitCircle, getCircleDynamicList, getCircleMemberList } from '@/api/social'

  const app = getApp();
  
  export default {
    components: {
      lazyImage,
      uniLoadMore,
      waterfall,
      cardGg,
      shareComponent
    },
    data() {
      return {
        statusBarHeight: this.$store.state.statusBarHeight || 20,
        titleBarHeight: this.$store.state.titleBarHeight || 44,
  
        navbarTrans: 0,
        barList: ["推荐", "最新", "规则"],
        barIdx: 0,
        circleId: 0,
        circleInfo: {
          id: 0,
          circle_name: '',
          circle_avatar: '',
          circle_background: '',
          circle_description: '',
          circle_notice: '',
          member_count: 0,
          dynamic_count: 0,
          view_count: 0,
          is_joined: false,
          user_role: 0,
          recent_members: []
        },
        list: [],
        page: 1,
        limit: 10,
        totalCount: 0,
        isThrottling: true,
        isEmpty: false,
        loadStatus: "more",
        tipsTitle: "",
        isWaterfall: false,
        showLoading: true, // 初始状态设为加载中
        loadingTimer: null,
        debounceTimer: null,
        showShare: false,
        userId: 0,
        adminMembers: [], // 管理团队成员列表
        // 缓存相关
        cacheKey: '',
        lastUpdateTime: 0
      }
    },
    computed: {
      // 圈子分享信息，转换为分享组件需要的格式
      circleShareInfo() {
        return {
          id: this.circleInfo.id || this.circleId,
          uid: this.circleInfo.creator_id || this.circleInfo.uid, // 圈主ID
          title: this.circleInfo.circle_name || this.circleInfo.name,
          content: this.circleInfo.circle_description || this.circleInfo.intro,
          image: this.circleInfo.circle_avatar,
          type: 'circle', // 标识这是圈子类型
          share_url: `/pages/note/circle?id=${this.circleId}`
        };
      }
    },
    onLoad(options) {
      // 开启分享功能 - 仅在小程序环境中有效
      // #ifdef MP
      uni.showShareMenu();
      // #endif
      
      // 获取用户信息 - 优先从Vuex获取，其次从storage获取
      const userInfo = uni.getStorageSync('userInfo');
      const vuexUid = this.$store.state.app.uid;
      this.userId = vuexUid || (userInfo && userInfo.uid) || 0;

      // 加载瀑布流设置
      this.loadFlowSettings();

      // 注册事件监听 - 参考 dynamic.vue 实现
      uni.$on('flowSettingsUpdated', this.handleFlowSettingsUpdate);
      uni.$on('userInfoUpdated', this.handleUserInfoUpdate);

      if (options.id) {
        this.circleId = parseInt(options.id);
        this.circleInfo.id = this.circleId;
        this.cacheKey = `circle_${this.circleId}`;

        // 检查缓存
        this.checkCache();

        this.getCircleDetail();
      } else {
        this.opTipsPopup("圈子ID不存在", true);
      }
    },
    methods: {
      // 检查缓存
      checkCache() {
        try {
          const cached = uni.getStorageSync(this.cacheKey);
          const now = Date.now();

          // 缓存有效期5分钟
          if (cached && cached.timestamp && (now - cached.timestamp < 5 * 60 * 1000)) {
            this.circleInfo = { ...this.circleInfo, ...cached.data };
            this.lastUpdateTime = cached.timestamp;
          }
        } catch (e) {
          console.warn('读取缓存失败:', e);
        }
      },

      // 更新缓存
      updateCache(data) {
        try {
          const cacheData = {
            data: data,
            timestamp: Date.now()
          };
          uni.setStorageSync(this.cacheKey, cacheData);
          this.lastUpdateTime = cacheData.timestamp;
        } catch (e) {
          console.warn('更新缓存失败:', e);
        }
      },

      // 预览圈子背景图片
      previewCircleImage() {
        if (this.circleInfo.circle_background || this.circleInfo.circle_avatar) {
          const imageUrl = this.circleInfo.circle_background || this.circleInfo.circle_avatar;
          uni.previewImage({
            current: imageUrl,
            urls: [imageUrl]
          });
        }
      },
      
      // 获取圈子详情
      async getCircleDetail() {
        try {
          this.showLoading = true;

          const res = await getCircleDetail(this.circleId);

          if (res.status === 200 && res.data) {
            // 处理圈子信息
            const newCircleInfo = {
              ...this.circleInfo,
              ...res.data,
              id: res.data.id || this.circleId
            };
            this.circleInfo = newCircleInfo;

            // 更新缓存
            this.updateCache(newCircleInfo);

            // 并行获取圈子动态和管理团队成员
            await Promise.all([
              this.getCircleDynamic(),
              this.getAdminMembers()
            ]);
          } else {
            this.opTipsPopup(res.msg || "获取圈子详情失败", true);
          }
        } catch (err) {
          console.error('获取圈子详情失败:', err);
          this.handleError(err, "网络错误，请稍后重试");
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack();
          }, 2000);
        } finally {
          this.showLoading = false;
        }
      },
      
      // 获取圈子动态
      async getCircleDynamic() {
        this.isThrottling = false;
        this.loadStatus = 'loading';

        // 刷新瀑布流设置 - 参考 dynamic.vue 实现
        if (this.page === 1) {
          this.refreshFlowSettings();
        }

        // 延迟显示加载指示器，避免短时间内的闪烁
        if (this.loadingTimer) {
          clearTimeout(this.loadingTimer);
        }
        this.loadingTimer = setTimeout(() => {
          if (this.loadStatus === 'loading') {
            this.showLoading = true;
          }
        }, 300);

        // 构建请求参数
        const params = {
          page: this.page,
          limit: this.limit,
          circle_id: this.circleId,
          type: this.barIdx === 0 ? 'recommend' : 'latest', // 0=推荐, 1=最新
          uid: this.userId // 传递用户ID用于获取点赞和关注状态
        };
        

        
        try {
          // 调用圈子动态列表API
          const res = await getCircleDynamicList(params);

          if (res.status === 200 && res.data) {
            const responseData = res.data;

            if (responseData.list && responseData.list.length > 0) {
              // 处理动态数据，确保包含圈子信息
              const formattedList = responseData.list.map(item => ({
                ...item,
                circle_id: this.circleId,
                circle_name: this.circleInfo.circle_name,
                circle_avatar: this.circleInfo.circle_avatar
              }));

              if (this.page == 1) {
                this.list = formattedList;
              } else {
                this.list = this.list.concat(formattedList);
              }

              // 更新总记录数
              if (responseData.count !== undefined) {
                this.totalCount = responseData.count;
              }

              this.isEmpty = false;
            } else if (this.page == 1) {
              this.isEmpty = true;
              this.list = [];
            }

            // 判断是否还有更多数据
            if (this.list.length >= this.totalCount && this.list.length > 0) {
              this.loadStatus = "noMore";
            }
          } else {
            if (this.page == 1) {
              this.isEmpty = true;
              this.list = [];
            }
            // 不显示错误提示，保持静默
          }
        } catch (err) {
          if (this.page == 1) {
            this.isEmpty = true;
            this.list = [];
          }

          console.error('获取圈子动态失败:', err);

          // 只在首次加载失败时显示错误提示
          if (this.page === 1) {
            this.handleError(err, '获取圈子动态失败，请稍后重试');
          }
        } finally {
          this.isThrottling = true;
          this.loadStatus = "more";

          // 清除加载定时器并隐藏加载指示器
          if (this.loadingTimer) {
            clearTimeout(this.loadingTimer);
            this.loadingTimer = null;
          }
          this.showLoading = false;
        }
      },
      // 获取管理团队成员
      async getAdminMembers() {
        try {

          
          const res = await getCircleMemberList({ 
            circle_id: this.circleId, 
            page: 1, 
            limit: 50,
          });
          

          
          if (res.status === 200 && res.data && res.data.list) {
            // 按角色排序：圈主在前，管理员在后
            const adminList = res.data.list.filter(member => member.role_type === 2 || member.role_type === 3);
            this.adminMembers = adminList.sort((a, b) => {
              // 圈主(3)排在管理员(2)前面
              if (a.role_type === 3 && b.role_type === 2) return -1;
              if (a.role_type === 2 && b.role_type === 3) return 1;
              return 0;
            });
          }
        } catch (e) {
          console.error('获取管理团队成员失败:', e);
          // 管理团队获取失败不影响主要功能，只记录错误
          this.handleError(e, '获取管理团队信息失败');
        }
      },
      // 加入/退出圈子
      async handleJoinCircle() {
        // 检查登录状态 - 优先从Vuex获取
        const userInfo = uni.getStorageSync('userInfo');
        const vuexUid = this.$store.state.app.uid;
        const currentUserId = vuexUid || (userInfo && userInfo.uid) || 0;

        if (!currentUserId) {
          this.opTipsPopup("请先登录");
          return;
        }

        try {
          uni.showLoading({
            title: this.circleInfo.is_joined ? '退出中...' : '加入中...',
            mask: true
          });

          const apiMethod = this.circleInfo.is_joined ? exitCircle : joinCircle;
          const params = {
            circle_id: this.circleId
          };

          const res = await apiMethod(params);

          if (res.status === 200) {
            // 更新加入状态
            this.circleInfo.is_joined = !this.circleInfo.is_joined;

            // 更新成员数量
            if (this.circleInfo.is_joined) {
              this.circleInfo.member_count += 1;
              this.opTipsPopup("已成功加入圈子");
            } else {
              this.circleInfo.member_count = Math.max(0, this.circleInfo.member_count - 1);
              this.opTipsPopup("已退出圈子");
            }

            // 标记需要刷新圈子列表
            app.globalData.isCenterPage = true;
          } else {
            this.opTipsPopup(res.msg || "操作失败，请重试");
          }
        } catch (err) {
          console.error('圈子操作失败:', err);
          this.handleError(err, "网络错误，请稍后重试");
        } finally {
          uni.hideLoading();
        }
      },
      
      // 切换分类标签
      barClick(e) {
        const clickIdx = parseInt(e.currentTarget.dataset.idx);
        if (clickIdx === this.barIdx) return;

        // 防抖处理
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }

        this.barIdx = clickIdx;

        if (clickIdx < this.barList.length - 1) {
          // 推荐/最新tab才加载内容
          this.debounceTimer = setTimeout(() => {
            this.isThrottling = false;
            this.page = 1;
            this.loadStatus = "loading";
            this.list = [];
            this.getCircleDynamic();
          }, 100);
        }
      },
      goToAllMembers() {
        // 跳转到全部成员页面
        uni.navigateTo({ url: '/pages/note/circlemember?id=' + this.circleId });
      },
      // 跳转到用户主页
      goToUserProfile(uid) {
        uni.navigateTo({
          url: `/pages/user/details?id=${uid}`
        });
      },
      // 格式化加入时间
      formatJoinTime(timeStr) {
        if (!timeStr) return '';
        const date = new Date(timeStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },
      
      // 分享控制
      shareClick(isOpen) {
        this.showShare = isOpen;
      },
      
      // 关闭分享弹窗
      closeShare() {
        this.showShare = false;
      },
      
      // 处理分享事件
      handleShare(type) {
        console.log('分享圈子:', type, this.circleInfo);
        uni.showToast({
          title: '分享成功',
          icon: 'success'
        });
        this.showShare = false;
      },
      
      // 处理不感兴趣
      handleDislike(circleId) {
        console.log('标记圈子不感兴趣:', circleId);
        this.showShare = false;
      },
      
      // 处理举报
      handleReport(reportData) {
        console.log('举报圈子:', reportData);
        uni.showToast({
          title: '举报成功',
          icon: 'success'
        });
        this.showShare = false;
      },
      
      // 处理编辑（如果是圈主）
      handleEdit(circleId) {
        console.log('编辑圈子:', circleId);
        // 跳转到圈子编辑页面
        uni.navigateTo({
          url: `/pages/circle/edit?id=${circleId}`
        });
        this.showShare = false;
      },
      
      // 处理删除（如果是圈主）
      handleDelete(circleId) {
        console.log('删除圈子:', circleId);
        uni.showModal({
          title: '确认删除',
          content: '确定要删除这个圈子吗？删除后不可恢复。',
          confirmColor: '#FA5150',
          success: (res) => {
            if (res.confirm) {
              // 调用删除圈子的API
              this.deleteCircle(circleId);
            }
          }
        });
        this.showShare = false;
      },
      
      // 删除圈子
      deleteCircle() {
        uni.showLoading({
          title: '删除中...',
          mask: true
        });
        
        // 这里调用删除圈子的API
        // deleteCircle(this.circleInfo.id).then(res => {
        //   uni.hideLoading();
        //   if (res.status === 200) {
        //     this.opTipsPopup('删除成功', true);
        //   } else {
        //     this.handleError(res, '删除失败');
        //   }
        // }).catch(err => {
        //   uni.hideLoading();
        //   console.error('删除圈子失败:', err);
        //   this.handleError(err, '网络错误，请稍后重试');
        // });
        
        // 临时模拟成功
        setTimeout(() => {
          uni.hideLoading();
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
          setTimeout(() => {
            this.navBack();
          }, 1500);
        }, 1000);
      },
      
      // 点赞回调
      likeClick(e) {
        if (!e || !this.list || !this.list[e.idx]) return;
        
        this.list[e.idx].is_like = e.is_like;
        this.list[e.idx].like_count = e.like_count;
        
        // 更新like_count_str
        this.list[e.idx].like_count_str = String(e.like_count);
      },
      
      // 返回上一页
      navBack() {
        if (getCurrentPages().length > 1) {
          uni.navigateBack();
        } else {
          uni.switchTab({
            url: "/pages/index/index"
          });
        }
      },
      
      // 统一错误处理方法
      handleError(error, defaultMessage = '操作失败') {
        console.error('错误处理:', error);

        let message = defaultMessage;

        // 如果是字符串，直接使用
        if (typeof error === 'string') {
          message = error;
        }
        // 如果是对象，尝试获取错误信息
        else if (error && typeof error === 'object') {
          // 网络错误处理
          if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
            message = '网络连接异常，请检查网络设置';
          }
          // 超时错误处理
          else if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
            message = '请求超时，请稍后重试';
          }
          // 其他错误
          else {
            message = error.msg || error.message || error.data?.msg || defaultMessage;
          }
        }

        this.opTipsPopup(message);
        return message;
      },

      // 提示弹窗
      opTipsPopup(msg, isBack = false) {
        let that = this;
        that.tipsTitle = msg;
        that.$refs.tipsPopup.open();

        setTimeout(function() {
          that.$refs.tipsPopup.close();

          if (isBack) {
            that.navBack();
          }
        }, 2000);
      },

      // 刷新列表数据
      fetchList() {
        this.page = 1;
        this.getCircleDynamic();
      },

      // 加载瀑布流设置 - 参考 dynamic.vue 实现
      loadFlowSettings() {
        try {
          const userInfo = this.getUserInfoFromCache();

          // 使用新的字段格式读取圈子瀑布流设置，直接使用整型比较
          const circleFlow = userInfo.circle_flow !== undefined ?
            userInfo.circle_flow : 1; // 默认开启

          const oldWaterfall = this.isWaterfall;

          // 圈子页面根据 circle_flow 设置决定
          this.isWaterfall = circleFlow === 1;

          // 如果设置发生变化，强制更新视图
          if (oldWaterfall !== this.isWaterfall) {
            this.$forceUpdate();
          }

          return {
            circleFlow,
            dynamicFlow: userInfo.dynamic_flow !== undefined ? userInfo.dynamic_flow : 1
          };
        } catch (e) {
          this.isWaterfall = false;
          return { circleFlow: 0, dynamicFlow: 0 };
        }
      },

      // 获取用户信息缓存 - 参考 dynamic.vue 实现
      getUserInfoFromCache() {
        try {
          let userInfo = uni.getStorageSync('USER_INFO') || {};

          // 如果缓存返回字符串，先解析它
          if (typeof userInfo === 'string') {
            userInfo = JSON.parse(userInfo);
          }

          // 确保返回的是对象
          return typeof userInfo === 'object' && userInfo !== null ? userInfo : {};
        } catch (e) {
          console.error('解析USER_INFO缓存失败:', e);
          return {};
        }
      },

      // 刷新瀑布流设置 - 参考 dynamic.vue 实现
      refreshFlowSettings() {
        return new Promise((resolve) => {
          try {
            this.loadFlowSettings();
            resolve(true);
          } catch (error) {
            this.isWaterfall = false;
            resolve(false);
          }
        });
      },

      onCardUpdate({ vote_info, idx }) {
        if (this.list[idx]) {
          this.$set(this.list[idx], 'vote_info', vote_info);
        }
      },

      // 瀑布流点赞回调处理 - 参考 dynamic.vue 实现
      waterfallLikeClick(data) {
        // 瀑布流点赞回调处理 - 与普通点赞处理相同
        this.likeClick(data);
      },

      // 关注回调处理 - 参考 dynamic.vue 实现
      followClick(data) {
        // 处理关注/取消关注逻辑
        console.log('关注操作:', data);
        // 这里可以添加具体的关注处理逻辑
        // 由于圈子页面主要是笔记内容，关注功能可能不是主要功能
        // 如果需要，可以参考 dynamic.vue 中的 followClick 实现
      },

      // 处理用户信息更新 - 参考 dynamic.vue 实现
      handleUserInfoUpdate() {
        // 重新加载瀑布流设置
        this.loadFlowSettings();

        // 如果设置发生变化，可能需要刷新数据
        if (this.list.length === 0) {
          this.fetchList();
        }
      },

      // 处理瀑布流设置更新 - 参考 dynamic.vue 实现
      handleFlowSettingsUpdate(settings) {
        // 保存当前瀑布流状态
        const oldWaterfall = this.isWaterfall;

        // 支持新的字段格式和旧的对象格式，直接使用整型比较
        const circleFlow = settings.circle_flow !== undefined ?
          settings.circle_flow :
          (settings.circleFlow !== undefined ? (settings.circleFlow ? 1 : 0) : 0);

        this.isWaterfall = circleFlow === 1;

        // 如果设置发生变化，刷新数据
        if (oldWaterfall !== this.isWaterfall) {
          // 重置页码
          this.page = 1;

          // 重新加载数据
          this.fetchList();
        }
      }
    },

    onUnload() {
      // 移除事件监听 - 参考 dynamic.vue 实现
      if (uni.$off) {
        uni.$off('flowSettingsUpdated', this.handleFlowSettingsUpdate);
        uni.$off('userInfoUpdated', this.handleUserInfoUpdate);
      }
    },

    onReachBottom() {
      // 如果当前状态是加载中，不触发加载更多
      if (this.loadStatus === "loading") {
        return;
      }
      
      // 如果未到达最大数量，加载更多
      if (this.isThrottling && this.list.length && this.list.length < this.totalCount) {
        this.page = this.page + 1;
        this.loadStatus = "loading";
        this.getCircleDynamic();
      } else if (this.list.length >= this.totalCount && this.list.length > 0) {
        this.loadStatus = "noMore";
      }
    },
    
    onPageScroll(e) {
      const scrollTop = e.scrollTop > 150 ? 150 : e.scrollTop;
      this.navbarTrans = scrollTop / 150;
    },
    
    onUnload() {
      // 组件卸载时清除定时器
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer);
        this.loadingTimer = null;
      }
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
    },
    
    // 分享到微信好友
    onShareAppMessage() {
      return {
        title: this.circleInfo.circle_name || '圈子分享',
        path: "/pages/note/circle?id=" + this.circleId,
        imageUrl: this.circleInfo.circle_avatar || '/static/img/avatar.png'
      };
    },
    
    // 分享到朋友圈
    onShareTimeline() {
      return {
        title: this.circleInfo.circle_name || '圈子分享',
        query: "id=" + this.circleId,
        imageUrl: this.circleInfo.circle_avatar || '/static/img/avatar.png'
      };
    }
  }
  </script>
  
  <style>
  /* 基础样式 */
  .nav-box {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 99;
    box-sizing: border-box;
  }
  
  .nav-box .nav-back {
    padding: 0 30rpx;
    width: 34rpx;
    height: 100%;
  }
  
  .nav-box .nav-title {
    max-width: 60%;
    font-size: 32rpx;
    font-weight: 700;
  }
  
  /* 圈子头部区域 - 参考商品轮播图设计 */
  .circle-header {
    position: relative;
    overflow: hidden;
  }
  
  /* 主背景容器 - 参考商品轮播图样式 */
  .images-box {
    width: 100%;
    flex-direction: column;
    position: relative;
    background: #f8f8f8;
    border-radius: 0 0 24rpx 24rpx;
    overflow: hidden;
  }
  
  /* 圈子背景图片容器 - 沉浸式适中高度 */
  .circle-image-container {
    position: relative;
    width: 100%;
    height: 600rpx; /* 500rpx + 状态栏和导航栏高度 */
    background: #f8f8f8;
    overflow: hidden;
  }
  
  /* 圈子背景图片 */
  .circle-bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    will-change: transform; /* 优化动画性能 */
  }

  /* 默认背景 */
  .default-bg {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  /* 图片点击效果 */
  .circle-image-container:active .circle-bg-image {
    transform: scale(0.98);
  }
  
  /* 装饰指示器 - 参考商品轮播图指示器 */
  .circle-indicator {
    position: absolute;
    bottom: 30rpx;
    right: 30rpx;
    display: flex;
    align-items: center;
    padding: 8rpx 16rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20rpx;
    backdrop-filter: blur(10rpx);
    -webkit-backdrop-filter: blur(10rpx);
  }
  
  .indicator-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
  }
  
  .indicator-dot.active {
    background: #fff;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
  }
  
  /* 沉浸式背景遮罩层 */
  .bg-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      /* 主要渐变 - 从透明到深色 */
      linear-gradient(to bottom, 
        transparent 0%, 
        rgba(0,0,0,0.1) 30%, 
        rgba(0,0,0,0.4) 70%, 
        rgba(0,0,0,0.8) 100%
      ),
      /* 径向渐变 - 增强中心聚焦效果 */
      radial-gradient(circle at center bottom, 
        rgba(0,0,0,0.2) 0%, 
        rgba(0,0,0,0.6) 70%, 
        rgba(0,0,0,0.9) 100%
      ),
      /* 顶部微妙渐变 - 增强层次感 */
      linear-gradient(to bottom,
        rgba(0,0,0,0.1) 0%,
        transparent 25%,
        transparent 75%,
        rgba(0,0,0,0.2) 100%
      );
    
    /* 现代模糊效果 - 增强沉浸感 */
    backdrop-filter: blur(1px) saturate(180%);
    -webkit-backdrop-filter: blur(1px) saturate(180%);
    
    /* 微妙的边缘阴影 */
    box-shadow: 
      inset 0 -80rpx 120rpx -40rpx rgba(0,0,0,0.4),
      inset 0 80rpx 120rpx -40rpx rgba(0,0,0,0.1);
    
    /* 平滑过渡效果 */
    transition: all 0.3s ease-out;
  }
  
  /* 悬停时增强效果（如果需要交互） */
  .circle-header:hover .bg-overlay {
    backdrop-filter: blur(2px) saturate(200%);
    -webkit-backdrop-filter: blur(2px) saturate(200%);
  }
  
  /* 圈子信息叠加层 - 居中显示内容 */
  .circle-info-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 40rpx 30rpx 30rpx;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center; /* 垂直居中 */
  }
  
  .circle-main-info {
    align-items: flex-end;
    margin-bottom: 20rpx;
  }
  
  /* 圈子头像 */
  .circle-avatar {
    margin-right: 20rpx;
  }
  
  .avatar-img {
    width: 120rpx;
    height: 120rpx;
    border-radius: 16rpx;
    border: 4rpx solid rgba(255,255,255,0.3);
  }
  
  /* 圈子详情 */
  .circle-details {
    flex: 1;
  }
  
  .circle-name {
    color: #fff;
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
    text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
  }
  
  .circle-stats {
    color: rgba(255,255,255,0.9);
    font-size: 22rpx;
    line-height: 1.4;
  }
  
  .stat-item {
    font-size: 22rpx;
    font-weight: 400;
    text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
  }
  
  .stat-divider {
    margin: 0 8rpx;
    font-size: 22rpx;
  }
  
  /* 圈子描述和公告 */
  .circle-description,
  .circle-notice {
    color: rgba(255,255,255,0.9);
    font-size: 24rpx;
    line-height: 1.4;
    margin-bottom: 15rpx;
    text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
  }
  
  .circle-notice {
    color: #ffeb3b;
  }
  
  /* 操作按钮 - 参考 pages/note/1.vue 设计 */
  .btn-box {
    width: 100%;
    height: 80rpx;
    justify-content: space-between;
    margin-top: 30rpx;
  }

  .btn-box .btn {
    height: 80rpx;
    font-size: 24rpx;
    font-weight: 700;
    justify-content: center;
    border-radius: 80rpx;
    transition: all 0.3s ease;
    transform: translateZ(0); /* 启用硬件加速 */
    will-change: transform, background-color;
  }

  .btn-box .btn:active {
    transform: scale(0.98);
  }

  .btn-box .btn .icon {
    width: 32rpx;
    height: 32rpx;
  }

  .btn-box .btn text {
    margin: 0 12rpx;
    white-space: nowrap;
  }

  .btn-box .bg1 {
    width: calc(100% - 100rpx);
    color: #000;
    background: #fff;
  }

  .btn-box .bg2 {
    width: 80rpx;
    background: #f8f8f8;
  }

  .btn-box .joined-state {
    color: #000;
    background: #f8f8f8;
    width: calc(50% - 10rpx);
  }

  .btn-box .share-expanded {
    width: calc(50% - 10rpx);
  }
  
  /* 加载状态样式 */
  .btn-box .loading {
    background: #ccc;
    color: transparent;
    pointer-events: none;
  }
  
  .loading-dots {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
  }
  
  .loading-dots .dot {
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    background: #999;
    animation: loadingDot 1.4s infinite ease-in-out;
  }
  
  .loading-dots .dot:nth-child(1) {
    animation-delay: -0.32s;
  }
  
  .loading-dots .dot:nth-child(2) {
    animation-delay: -0.16s;
  }
  
  @keyframes loadingDot {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  /* 骨架屏样式 */
  .skeleton-text {
    width: 200rpx;
    height: 36rpx;
    background: linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.3) 75%);
    background-size: 200% 100%;
    border-radius: 6rpx;
    animation: skeletonLoading 1.5s infinite;
  }
  
  .skeleton-stats {
    display: flex;
    gap: 16rpx;
  }
  
  .skeleton-item {
    width: 80rpx;
    height: 22rpx;
    background: linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.3) 75%);
    background-size: 200% 100%;
    border-radius: 4rpx;
    animation: skeletonLoading 1.5s infinite;
  }
  
  @keyframes skeletonLoading {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  /* 头像骨架屏 */
  .skeleton-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 16rpx;
    background: linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.3) 75%);
    background-size: 200% 100%;
    animation: skeletonLoading 1.5s infinite;
  }
  
  /* 成员头像组样式 */
  .cu-img-group {
    direction: ltr;
    unicode-bidi: bidi-override;
    display: inline-block;
  }

  .cu-img-group .cu-img {
    width: 32rpx;
    height: 32rpx;
    display: inline-flex;
    position: relative;
    margin-left: -16rpx;
    border: 4rpx solid #000;
    background: #111;
    vertical-align: middle;
    border-radius: 50%;
  }

  .cu-img-group .cu-img image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  
  /* 分类标签 - 适应沉浸式设计 */
  .bar-box {
    position: sticky;
    top: 0;
    z-index: 98;
    width: 100%;
    height: 80rpx;
    background: #fff;
    border-bottom: 1rpx solid #f0f0f0;
    margin-top: -24rpx; /* 抵消圆角造成的间隙 */
    border-radius: 24rpx 24rpx 0 0; /* 与图片底部圆角呼应 */
    backdrop-filter: blur(10rpx); /* 毛玻璃效果 */
    -webkit-backdrop-filter: blur(10rpx);
  }
  
  .bar-box .bar-item {
    padding: 0 30rpx;
    height: 100%;
    flex-direction: column;
    justify-content: center;
    position: relative;
  }
  
  .bar-box .bar-item text {
    font-weight: 700;
    transition: all 0.3s ease-in-out;
  }
  
  .bar-item .bar-line {
    position: absolute;
    bottom: 12rpx;
    width: 18rpx;
    height: 6rpx;
    border-radius: 6rpx;
    background: #000;
    transition: opacity 0.3s ease-in-out;
  }
  
  /* 内容区域 */
  .content-area {
    min-height: 600rpx;
    background: #fff;
  }
  
  .dynamic-box {
    width: calc(100% - 16rpx);
    padding: 22rpx 8rpx 0;
  }
  
  /* 加载中状态样式 */
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60rpx;
    margin: 20rpx 0;
  }
  
  .loading-indicator {
    width: 30rpx;
    height: 30rpx;
    border: 3rpx solid #f3f3f3;
    border-top: 3rpx solid #000;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* 空状态 */
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
  
  /* 提示弹窗 */
  .tips-box {
    padding: 20rpx 30rpx;
    border-radius: 12rpx;
    justify-content: center;
  }
  
  .tips-box .tips-item {
    color: #fff;
    font-size: 28rpx;
    font-weight: 700;
  }
  
  /* 工具类 */
  .df {
    display: flex;
    align-items: center;
  }
  
  .ohto {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .rule-box {
    background: #fff;
    padding: 30rpx 30rpx 0 30rpx;
  }
  .rule-title {
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  .rule-list {
    margin-bottom: 30rpx;
  }
  .rule-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16rpx;
  }
  .rule-tag {
    font-size: 20rpx;
    color: #fff;
    border-radius: 8rpx;
    padding: 4rpx 16rpx;
    margin-right: 12rpx;
    margin-top: 2rpx;
    height: 32rpx;
    line-height: 32rpx;
    flex-shrink: 0; /* 防止标签被压缩 */
    white-space: nowrap; /* 防止标签文字换行 */
  }
  .tag-orange {
    background: #ff9500;
  }
  .rule-text {
    font-size: 22rpx;
    color: #333;
    line-height: 32rpx;
    flex: 1; /* 占据剩余空间 */
    word-break: break-all; /* 允许长单词换行 */
    word-wrap: break-word; /* 兼容性更好的换行 */
  }
  .rule-team-title {
    margin: 30rpx 0 10rpx 0;
    font-size: 28rpx;
    font-weight: bold;
    justify-content: space-between;
  }
  .rule-team-all {
  margin-left:12rpx;
  padding:0 12rpx;
  height:40rpx;
  line-height:40rpx;
  font-size:20rpx;
  font-weight:700;
  color:#999;
  background:#f8f8f8;
  border-radius:8rpx
  }
  .rule-team-list {
    margin-bottom: 30rpx;
  }
  .member-item {
    padding: 0 30rpx 0 30rpx;
    margin-bottom: 24rpx;
    display: flex;
    align-items: center;
    position: relative;
  }
  .avatar {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    margin-right: 16rpx;
    background: #f5f5f5;
  }
  .info {
    flex: 1;
    min-width: 0;
  }
  .name {
    font-size: 26rpx;
    font-weight: 700;
    color: #222;
    display: flex;
    align-items: center;
  }
  .role-tag {
    font-size: 20rpx;
    border-radius: 8rpx;
    padding: 2rpx 14rpx;
    margin-left: 12rpx;
    color: #fff;
    font-weight: 400;
  }
  .role-tag.owner {
    background: #ff9500;
  }
  .role-tag.admin {
    background: #3da0ff;
  }
  .meta {
    margin-top: 6rpx;
    font-size: 22rpx;
    color: #999;
    display: flex;
    align-items: center;
  }
  .gender {
    margin-right: 6rpx;
  }
  .male {
    color: #4e6ef2;
  }
  .female {
    color: #fa5a8a;
  }
  .contrib {
    color: #999;
  }
  </style>