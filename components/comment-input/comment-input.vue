<template>
  <view class="comment-input-wrapper" v-if="show">
    <!-- 输入框区域 -->
    <view class="comment-input-box">
      <editor
        id="commentEditor"
        class="comment-editor"
        :placeholder="placeholder"
        :read-only="disabled"
        @ready="onEditorReady"
        @focus="editorFocus"
        @blur="editorBlur"
        @input="onEditorInput"
        aria-label="评论输入框"
        role="textbox"
      ></editor>
    </view>
    
    <!-- 预览已选图片 -->
    <view class="selected-image-preview" v-if="commentImage">
      <image class="selected-image" :src="commentImage" mode="aspectFill" @tap="previewImage"></image>
      <view class="delete-image" @tap="removeCommentImage">×</view>
    </view>
    
    <!-- 工具栏 -->
    <view class="comment-tools-bar">
      <view class="tools-left">
        <view class="tool-item" @tap="showImagePicker">
          <image src="/static/img/add/photo.png"></image>
        </view>
        <view class="tool-item" @tap="showAtUsers">
          <image src="/static/img/add/publish_at.png"></image>
        </view>
        <view class="tool-item" @tap="toggleEmoji">
          <image src="/static/img/add/emoji.png"></image>
        </view>
      </view>
      <view 
        :class="sendBtnClass" 
        @tap.stop="onSendButtonClick" 
        @click.stop="onSendButtonClick"
        @touchend.stop="onSendButtonClick"
      >
        {{ isSubmittingComment ? '发送中...' : '发送' }}
      </view>
    </view>
    
    <!-- 表情面板组件 -->
    <emoji-panel 
      :show="showEmoji" 
      :content="commentText"
      @select="selectEmoji"
      @select-gif="selectGif"
      @delete="deleteEmoji"
    ></emoji-panel>
    
    <!-- @用户选择弹窗 -->
    <uni-popup ref="atUserPopup" type="bottom">
      <view class="at-user-popup">
        <view class="at-user-header">
          <text>选择要@的用户</text>
          <view class="close-btn" @tap="closeAtUsers">关闭</view>
        </view>
        <scroll-view scroll-y class="at-user-list">
          <view 
            class="at-user-item" 
            v-for="(user, index) in atUserList" 
            :key="index"
            @tap="selectAtUser(user)"
          >
            <image class="at-user-avatar" :src="user.avatar"></image>
            <text class="at-user-name">{{user.nickname}}</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick, getCurrentInstance } from 'vue'
import EmojiPanel from '@/components/emoji-panel/emoji-panel.vue'
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
// 导入表情列表
import emojiList from '@/components/emoji-panel/sina.js'

// 定义组件名称
defineOptions({
  name: 'CommentInput'
})

// 定义Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '写评论...'
  },
  focus: {
    type: Boolean,
    default: false
  },
  maxLength: {
    type: Number,
    default: 500,
    validator: (value) => value > 0 && value <= 2000
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// 定义Emits
const emit = defineEmits(['send', 'focus', 'blur', 'editorError'])

// 获取当前实例
const instance = getCurrentInstance()

// 响应式数据
const editorCtx = ref(null)
const commentText = ref('')
const commentImage = ref(null)
const isFocus = ref(false)
const showEmoji = ref(false)
const atUserList = ref([])
const isSubmittingComment = ref(false)
const keepPanelOpen = ref(false)
const hasContent = ref(false)
const lastInputChar = ref('')
const isToggleEmoji = ref(false)
const isToggleAtUser = ref(false)
const isAnyPopupOpen = ref(false)
const isEditorReady = ref(false)
const savedContent = ref(null)

// 表情映射
const emojiMap = reactive({})
const phraseMap = reactive({})
const reverseMap = reactive({})

// 定时器
const inputDebounceTimer = ref(null)
const retryTimer = ref(null)
const retryCount = ref(0)
const observer = ref(null)

// 引用
const atUserPopup = ref(null)

// 计算属性
const sendBtnClass = computed(() => {
  const isActive = hasContent.value && !isSubmittingComment.value
  console.log('发送按钮状态计算:', {
    hasContent: hasContent.value,
    isSubmittingComment: isSubmittingComment.value,
    isActive: isActive
  })

  return {
    'send-btn': true,
    'active': isActive
  }
})

// 监听器
watch(() => props.focus, (val) => {
  isFocus.value = val
}, { immediate: true })

watch(() => props.show, (val) => {
  if (!val) {
    showEmoji.value = false
    isFocus.value = false
  }
}, { immediate: true })

// 初始化表情映射
const initEmojiMap = () => {
  if (!Array.isArray(emojiList) || emojiList.length === 0) {
    console.warn('表情列表为空或格式错误')
    return
  }

  // 清空现有映射
  Object.keys(emojiMap).forEach(key => delete emojiMap[key])
  Object.keys(phraseMap).forEach(key => delete phraseMap[key])
  Object.keys(reverseMap).forEach(key => delete reverseMap[key])

  // 批量处理表情数据
  emojiList.forEach(emoji => {
    const key = emoji.phrase || emoji.alt || emoji.value
    const url = emoji.url || emoji.icon

    if (!key || !url) return

    try {
      // 编码映射
      const encodedKey = encodeURIComponent(key)
      emojiMap[encodedKey] = url

      // 短代码映射
      const bracketKey = key.startsWith('[') ? key : `[${key}]`
      phraseMap[bracketKey] = url

      // 反向映射
      createReverseMapping(url, bracketKey)
    } catch (err) {
      console.warn('处理表情映射出错:', key, err)
    }
  })
}

// 创建反向映射
const createReverseMapping = (url, bracketKey) => {
  // 完整URL映射
  reverseMap[url] = bracketKey

  // 文件名映射
  const urlParts = url.split('/')
  const fileName = urlParts[urlParts.length - 1]
  if (fileName) {
    reverseMap[fileName] = bracketKey
    reverseMap['/' + fileName] = bracketKey
  }

  // 路径段映射
  if (urlParts.length >= 2) {
    reverseMap[urlParts.slice(-2).join('/')] = bracketKey
  }
  if (urlParts.length >= 3) {
    reverseMap[urlParts.slice(-3).join('/')] = bracketKey
  }
}

// 编辑器初始化完成
const onEditorReady = () => {
  console.log('编辑器开始初始化')

  // #ifdef MP-BAIDU
  editorCtx.value = requireDynamicLib('editorLib').createEditorContext('commentEditor')
  isEditorReady.value = true
  console.log('百度小程序编辑器初始化完成')
  // #endif

  // #ifndef MP-BAIDU
  uni.createSelectorQuery()
    .in(instance)
    .select('#commentEditor')
    .context((res) => {
      console.log('编辑器上下文查询结果:', res)
      if (res && res.context) {
        editorCtx.value = res.context
        isEditorReady.value = true
        console.log('编辑器初始化完成')

        // 编辑器准备好后，如果有保存的内容则恢复
        if (savedContent.value) {
          restoreContent()
        }
      } else {
        console.error('编辑器上下文获取失败')
        // 最多重试3次
        if (!retryCount.value) retryCount.value = 0
        if (retryCount.value < 3) {
          retryCount.value++
          retryTimer.value = setTimeout(() => {
            onEditorReady()
          }, 500 * retryCount.value)
        } else {
          console.error('编辑器初始化失败，已达到最大重试次数')
          emit('editorError', '编辑器初始化失败')
        }
      }
    })
    .exec()
  // #endif
}

// 获取当前选区
const getSelection = () => {
  return new Promise((resolve) => {
    if (!editorCtx.value || !isEditorReady.value) {
      resolve(null)
      return
    }

    editorCtx.value.getSelection({
      success: res => resolve(res),
      fail: () => resolve(null)
    })
  })
}

// 获取指定范围的内容
const getContents = (start, end) => {
  return new Promise((resolve) => {
    if (!editorCtx.value || !isEditorReady.value) {
      console.error('编辑器未就绪:', {
        editorCtx: !!editorCtx.value,
        isEditorReady: isEditorReady.value
      })
      resolve(null)
      return
    }

    const options = {
      success: res => {
        console.log('getContents成功:', res)
        resolve(res)
      },
      fail: (err) => {
        console.error('getContents失败:', err)
        resolve(null)
      }
    }

    if (typeof start !== 'undefined' && typeof end !== 'undefined') {
      options.start = start
      options.end = end
    }

    try {
      editorCtx.value.getContents(options)
    } catch (err) {
      console.error('调用getContents异常:', err)
      resolve(null)
    }
  })
}

// 编辑器内容变化
const onEditorInput = async (e) => {
  if (!editorCtx.value || !isEditorReady.value) {
    return
  }

  // 使用防抖避免频繁调用
  if (inputDebounceTimer.value) {
    clearTimeout(inputDebounceTimer.value)
  }

  inputDebounceTimer.value = setTimeout(async () => {
    try {
      // 获取当前内容
      const contents = await getContents()
      if (!contents) return

      // 更新文本内容
      commentText.value = contents.text || ''

      // 检查是否有表情图片
      const hasEmoji = contents.html && contents.html.includes('emoji-img')

      // 更新内容状态 - 使用与发送时相同的逻辑
      const cleanText = commentText.value ? commentText.value.replace(/\n/g, '').trim() : ''
      const hasTextContent = cleanText.length > 0
      const hasImageContent = !!commentImage.value
      hasContent.value = hasTextContent || hasImageContent || hasEmoji

      console.log('内容状态更新:', {
        originalText: commentText.value,
        cleanText: cleanText,
        hasTextContent,
        hasImageContent,
        hasEmoji,
        hasContent: hasContent.value
      })

      // 检测@符号
      const lastCharValue = commentText.value.slice(-1)
      if (lastCharValue === '@' && lastInputChar.value !== '@') {
        showAtUsers()
      }
      lastInputChar.value = lastCharValue

      // 处理删除操作
      if (e && e.detail && (e.detail.keyCode === 8 || e.detail.keyCode === 46)) {
        await handleDelete()
      }
    } catch (err) {
      console.error('处理编辑器内容变化出错:', err)
    }
  }, 150)
}

// 处理删除操作
const handleDelete = async () => {
  if (!editorCtx.value || !isEditorReady.value) return

  try {
    // 获取当前选区
    const selection = await getSelection()
    if (!selection) return

    const { start, end } = selection

    // 检查是否删除的是图片
    const contents = await getContents(Math.max(0, start.offset - 1), end.offset + 1)
    if (!contents || !contents.nodes) return

    const hasEmoji = contents.nodes.some(node =>
      node.name === 'img' && node.attrs && node.attrs.class && node.attrs.class.includes('emoji-img')
    )

    if (hasEmoji) {
      // 直接删除内容,不插入零宽度空格
      editorCtx.value.deleteContents({
        success: () => {
          // 触发内容更新
          onEditorInput()
        }
      })
    }
  } catch (err) {
    console.error('处理删除操作出错:', err)
  }
}

// 编辑器获取焦点
const editorFocus = () => {
  if (!keepPanelOpen.value && !isToggleEmoji.value && !isToggleAtUser.value) {
    showEmoji.value = false
    if (atUserPopup.value) {
      atUserPopup.value.close()
    }
  }
  keepPanelOpen.value = false
  isFocus.value = true

  emit('focus')
}

// 编辑器失去焦点
const editorBlur = () => {
  isFocus.value = false

  // 如果有弹窗打开或正在提交,不触发blur事件
  if (!isAnyPopupOpen.value && !keepPanelOpen.value && !isSubmittingComment.value) {
    // 保存内容
    if (editorCtx.value && isEditorReady.value) {
      editorCtx.value.getContents({
        success: res => {
          savedContent.value = res
        }
      })
    }
    emit('blur')
  }
}

// 显示表情面板
const toggleEmoji = () => {
  keepPanelOpen.value = true
  isToggleEmoji.value = true

  if (isToggleAtUser.value) {
    atUserPopup.value.close()
    isToggleAtUser.value = false
  }

  setTimeout(() => {
    showEmoji.value = !showEmoji.value
    isAnyPopupOpen.value = showEmoji.value

    // 如果关闭表情面板
    if (!showEmoji.value) {
      isToggleEmoji.value = false
      keepPanelOpen.value = false
    }
  }, 100)
}

// 选择表情
const selectEmoji = (emoji) => {
  if (!editorCtx.value || !isEditorReady.value) {
    uni.showToast({
      title: '编辑器未就绪',
      icon: 'none'
    })
    return
  }

  keepPanelOpen.value = true
  isToggleEmoji.value = true

  const url = emoji.url || emoji.icon
  if (!url) return

  // 调试输出
  console.log('插入表情:', {
    url: url,
    phrase: emoji.phrase || emoji.alt || emoji.value,
    mapping: reverseMap[url]
  })

  // 确保表情映射存在
  if (!reverseMap[url]) {
    const key = emoji.phrase || emoji.alt || emoji.value || ''
    if (key) {
      const bracketKey = key.startsWith('[') ? key : `[${key}]`
      reverseMap[url] = bracketKey

      // 同时保存文件名映射
      const fileName = url.split('/').pop()
      reverseMap[fileName] = bracketKey
      reverseMap['/' + fileName] = bracketKey
    }
  }

  try {
    // 插入表情图片
    editorCtx.value.insertImage({
      src: url,
      width: '18px',
      height: '18px',
      extClass: 'emoji-img',
      success: () => {
        onEditorInput()
        setTimeout(() => {
          isToggleEmoji.value = false
        }, 100)
      },
      fail: (err) => {
        console.error('插入表情失败:', err)
        uni.showToast({
          title: '插入表情失败',
          icon: 'none'
        })
      }
    })
  } catch (err) {
    console.error('插入表情出错:', err)
    uni.showToast({
      title: '插入表情失败',
      icon: 'none'
    })
  }
}

// 选择GIF表情
const selectGif = (gif) => {
  keepPanelOpen.value = true

  console.log('选择了GIF表情', gif)

  uni.showToast({
    title: 'GIF表情功能开发中',
    icon: 'none'
  })
}

// 删除表情/文字
const deleteEmoji = () => {
  if (editorCtx.value) {
    editorCtx.value.undo()
  }
}

// 选择@用户
const selectAtUser = (user) => {
  const atText = `@${user.nickname} `

  if (editorCtx.value && isEditorReady.value) {
    // 保存当前内容
    saveContent()

    editorCtx.value.insertText({
      text: atText,
      success: () => {
        onEditorInput()
        closeAtUsers()

        // 延迟聚焦,等待popup完全关闭
        setTimeout(() => {
          if (editorCtx.value && isEditorReady.value) {
            editorCtx.value.focus()
          }
        }, 500)
      },
      fail: (err) => {
        console.error('插入@用户失败:', err)
        // 恢复之前的内容
        restoreContent()
      }
    })
  }
}

// 将HTML内容转换为纯文本，同时处理表情图片
const convertHtmlToText = async (html) => {
  try {
    if (!html) return ''

    console.log('转换前的HTML:', html)

    // 先检查是否包含表情图片
    const hasEmojiImg = html.includes('emoji-img')

    // 如果没有表情图片，直接处理纯文本
    if (!hasEmojiImg) {
      // 移除HTML标签
      let text = html.replace(/<[^>]+>/g, '')

      // 解码HTML实体
      text = text.replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")

      console.log('纯文本转换结果:', text)
      return text.trim()
    }

    // 处理包含表情的内容
    const emojis = []
    const imgRegex = /<img[^>]*class="[^"]*emoji-img[^"]*"[^>]*>/g
    const srcRegex = /src=["']([^"']+)["']/

    let text = html.replace(imgRegex, (imgTag) => {
      console.log('匹配到的表情标签:', imgTag)

      const srcMatch = imgTag.match(srcRegex)
      if (!srcMatch) {
        return '[表情]'
      }

      const src = srcMatch[1]

      // 尝试匹配表情文本
      let emojiText = reverseMap[src]

      if (!emojiText) {
        // 从emojiList中查找
        const emoji = emojiList.find(e => {
          const emojiUrl = e.url || e.icon || ''
          return src === emojiUrl || src.endsWith(emojiUrl.split('/').pop())
        })

        if (emoji) {
          emojiText = emoji.phrase || emoji.alt || emoji.value
        } else {
          emojiText = '[表情]'
        }
      }

      emojis.push(emojiText)
      return emojiText
    })

    // 移除其他HTML标签
    text = text.replace(/<[^>]+>/g, '')

    // 解码HTML实体
    text = text.replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

    console.log('包含表情的转换结果:', text)
    return text.trim() || emojis.join('')

  } catch (err) {
    console.error('转换HTML出错:', err)
    // 如果转换失败，至少返回去除HTML标签的文本
    const fallbackText = html.replace(/<[^>]+>/g, '').trim()
    return fallbackText || '[表情]'
  }
}

// 处理发送按钮点击
const onSendButtonClick = (e) => {
  console.log('=== 发送按钮点击事件触发 ===')
  console.log('点击事件详情:', e)
  console.log('事件类型:', e.type)
  console.log('当前组件状态:', {
    hasContent: hasContent.value,
    isSubmittingComment: isSubmittingComment.value,
    disabled: props.disabled,
    editorReady: isEditorReady.value,
    showEmoji: showEmoji.value,
    isFocus: isFocus.value
  })

  // 阻止事件冒泡
  if (e && e.stopPropagation) {
    e.stopPropagation()
  }
  if (e && e.preventDefault) {
    e.preventDefault()
  }

  // 检查按钮是否可点击
  if (!hasContent.value) {
    console.log('按钮不可点击：没有内容')
    return
  }

  if (isSubmittingComment.value) {
    console.log('按钮不可点击：正在提交中')
    return
  }

  // 调用实际的发送方法
  console.log('准备调用发送方法...')
  handleSendComment()
}

// 发送评论
const handleSendComment = async () => {
  console.log('=== 发送按钮被点击 ===')
  console.log('=== 开始发送评论 ===')
  console.log('编辑器状态:', {
    editorCtx: !!editorCtx.value,
    isEditorReady: isEditorReady.value,
    isSubmittingComment: isSubmittingComment.value
  })

  if (!editorCtx.value || !isEditorReady.value) {
    console.error('编辑器未就绪')
    uni.showToast({
      title: '编辑器未就绪，请稍候',
      icon: 'none'
    })
    return
  }

  if (isSubmittingComment.value) {
    console.log('正在提交中，忽略重复点击')
    return
  }

  try {
    console.log('开始获取编辑器内容...')
    const contents = await getContents()
    console.log('发送时获取到的编辑器内容:', contents)

    if (!contents) {
      console.error('未获取到编辑器内容')
      uni.showToast({
        title: '获取内容失败，请重试',
        icon: 'none'
      })
      return
    }

    const { html, text } = contents

    // 检查是否有表情图片
    const hasEmoji = html && html.includes('emoji-img')

    // 验证是否有内容 - 注意处理换行符
    const cleanText = text ? text.replace(/\n/g, '').trim() : ''
    const hasTextContent = cleanText.length > 0
    const hasImageContent = !!commentImage.value

    console.log('内容检查详情:', {
      originalText: text,
      cleanText: cleanText,
      hasTextContent,
      hasImageContent,
      hasEmoji,
      textLength: cleanText.length,
      commentImage: commentImage.value
    })

    if (!hasTextContent && !hasImageContent && !hasEmoji) {
      console.log('没有任何内容，提示用户')
      uni.showToast({
        title: '请输入评论内容',
        icon: 'none'
      })
      return
    }

    console.log('开始处理评论内容...')
    isSubmittingComment.value = true

    let finalContent = ''

    if (hasTextContent) {
      // 有文字内容，进行转换
      if (hasEmoji) {
        // 有表情，需要转换
        console.log('处理包含表情的文字内容')
        finalContent = await convertHtmlToText(html || '')
      } else {
        // 纯文字，直接使用text并清理换行符
        console.log('处理纯文字内容')
        finalContent = cleanText
      }
    } else if (hasEmoji) {
      // 只有表情
      console.log('处理纯表情内容')
      finalContent = await convertHtmlToText(html || '')
    }

    // 最终内容检查
    if (!finalContent.trim() && !hasImageContent) {
      finalContent = '[表情]' // 备用内容
    }

    console.log('=== 准备发送评论 ===')
    console.log('最终发送内容:', {
      content: finalContent,
      image: commentImage.value || '',
      contentLength: finalContent.length
    })

    // 发送评论事件
    emit('send', {
      content: finalContent.trim(),
      image: commentImage.value || ''
    })

    console.log('评论事件已发送')

    // 显示成功提示
    uni.showToast({
      title: '发送成功',
      icon: 'success',
      duration: 1500
    })

    // 延迟清理，确保事件发送完成
    setTimeout(() => {
      // 重置编辑器内容
      if (editorCtx.value) {
        editorCtx.value.clear()
      }
      commentImage.value = null
      showEmoji.value = false
      hasContent.value = false
      savedContent.value = null
      console.log('评论框状态已重置')
    }, 500)

  } catch (err) {
    console.error('=== 发送评论失败 ===')
    console.error('错误详情:', err)
    uni.showToast({
      title: '发送失败，请重试',
      icon: 'none'
    })
  } finally {
    setTimeout(() => {
      isSubmittingComment.value = false
      console.log('提交状态已重置')
    }, 800)
  }
}

// 清空内容
const clear = () => {
  if (editorCtx.value) {
    editorCtx.value.clear()
  }
  commentImage.value = null
  hasContent.value = false
  savedContent.value = null
}

// 设置评论内容
const setContent = (text) => {
  if (editorCtx.value && text) {
    editorCtx.value.setContents({
      html: text,
      success: () => {
        onEditorInput()
      }
    })
  }
}

// 显示图片选择器
const showImagePicker = () => {
  keepPanelOpen.value = true

  // 关闭表情面板
  showEmoji.value = false

  // 使用全局上传工具方法
  if (instance && instance.appContext.config.globalProperties.$util && instance.appContext.config.globalProperties.$util.uploadImageChange) {
    instance.appContext.config.globalProperties.$util.uploadImageChange('upload/image',
      // 上传成功
      (res) => {
        uni.hideLoading()
        if (res.data && res.data.url) {
          commentImage.value = res.data.url
          hasContent.value = true
          uni.showToast({
            title: '图片已添加',
            icon: 'success'
          })
        } else {
          console.error('图片上传返回数据异常:', res)
          uni.showToast({
            title: '图片添加失败',
            icon: 'none'
          })
        }
      },
      // 上传失败或取消
      (err) => {
        uni.hideLoading()
        console.log('图片上传取消或失败:', err)
      },
      // 处理图片尺寸
      (res) => {
        if (res && res.w && res.h) {
          console.log('图片尺寸:', res.w, 'x', res.h)
        }
      }
    )
  } else {
    // 使用原始的chooseImage方法
    uni.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]

        // 检查文件大小
        uni.getFileInfo({
          filePath: tempFilePath,
          success: (fileInfo) => {
            const fileSizeMB = fileInfo.size / (1024 * 1024)
            if (fileSizeMB > 5) {
              uni.showToast({
                title: '图片大小不能超过5MB',
                icon: 'none'
              })
              return
            }

            // 显示上传进度
            uni.showLoading({
              title: '上传中...',
              mask: true
            })

            // 上传图片
            uni.uploadFile({
              url: (instance && instance.appContext.config.globalProperties.$api && instance.appContext.config.globalProperties.$api.uploadUrl) || '/api/upload/image',
              filePath: tempFilePath,
              name: 'file',
              success: (uploadRes) => {
                uni.hideLoading()
                try {
                  const data = JSON.parse(uploadRes.data)
                  if (data.code === 200 && data.data && data.data.url) {
                    commentImage.value = data.data.url
                    hasContent.value = true
                    uni.showToast({
                      title: '图片已添加',
                      icon: 'success'
                    })
                  } else {
                    throw new Error('上传返回数据异常')
                  }
                } catch (e) {
                  console.error('图片上传解析失败:', e)
                  uni.showToast({
                    title: '图片添加失败',
                    icon: 'none'
                  })
                }
              },
              fail: (err) => {
                uni.hideLoading()
                console.error('图片上传失败:', err)
                uni.showToast({
                  title: '图片上传失败',
                  icon: 'none'
                })
              }
            })
          },
          fail: (err) => {
            console.error('获取文件信息失败:', err)
            uni.showToast({
              title: '无法获取图片信息',
              icon: 'none'
            })
          }
        })
      }
    })
  }
}

// 移除评论图片
const removeCommentImage = () => {
  commentImage.value = null
}

// 关闭@用户选择弹窗
const closeAtUsers = () => {
  isToggleAtUser.value = false
  isAnyPopupOpen.value = showEmoji.value
  atUserPopup.value.close()

  // 恢复保存的内容
  restoreContent()
}

// 显示@用户选择弹窗
const showAtUsers = () => {
  keepPanelOpen.value = true
  isToggleAtUser.value = true

  // 保存当前内容
  saveContent()

  // 关闭表情面板
  if (showEmoji.value) {
    showEmoji.value = false
    isToggleEmoji.value = false
  }

  // 打开@用户选择弹窗
  atUserPopup.value.open()
  isAnyPopupOpen.value = true
}

// 预览图片
const previewImage = () => {
  if (commentImage.value) {
    uni.previewImage({
      urls: [commentImage.value],
      current: commentImage.value
    })
  }
}

// 初始化DOM观察器
const initDOMObserver = () => {
  // #ifdef H5
  if (typeof MutationObserver !== 'undefined') {
    try {
      observer.value = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            handleDOMChange(mutation.addedNodes)
          }
        })
      })

      // 查找编辑器元素
      const editorEl = document.querySelector('#commentEditor')
      if (editorEl) {
        const config = {
          childList: true,
          subtree: true,
          attributes: false, // 不监听属性变化，减少性能开销
          characterData: false // 不监听文本内容变化
        }

        observer.value.observe(editorEl, config)
        console.log('DOM观察器初始化成功')
      }
    } catch (err) {
      console.warn('DOM观察器初始化失败:', err)
    }
  }
  // #endif
}

// 处理DOM变化
const handleDOMChange = (nodes) => {
  // #ifdef H5
  Array.from(nodes).forEach(node => {
    if (node.nodeType === 1) { // 元素节点
      // 处理新插入的元素
      processNewElement(node)
    }
  })
  // #endif
}

// 处理新插入的元素
const processNewElement = (element) => {
  // #ifdef H5
  // 处理图片元素
  if (element.tagName === 'IMG') {
    handleImageElement(element)
  }

  // 递归处理子元素
  if (element.children && element.children.length > 0) {
    Array.from(element.children).forEach(child => {
      processNewElement(child)
    })
  }
  // #endif
}

// 处理图片元素
const handleImageElement = (img) => {
  // #ifdef H5
  // 在H5环境中可以进行DOM操作，但在小程序中通过CSS类来设置样式
  if (img.classList && img.classList.contains('emoji-img')) {
    // 确保表情图片样式正确
    img.style.verticalAlign = 'middle'
    img.style.margin = '0 1px'
    img.style.display = 'inline-block'
  }
  // #endif
}

// 保存编辑器内容
const saveContent = () => {
  if (!editorCtx.value || !isEditorReady.value) return

  editorCtx.value.getContents({
    success: res => {
      savedContent.value = res
    },
    fail: err => {
      console.error('保存内容失败:', err)
    }
  })
}

// 恢复编辑器内容
const restoreContent = () => {
  if (!editorCtx.value || !isEditorReady.value || !savedContent.value) return

  editorCtx.value.setContents({
    html: savedContent.value.html,
    success: () => {
      onEditorInput()
    },
    fail: err => {
      console.error('恢复内容失败:', err)
    }
  })
}

// 添加安全的focus方法
const setEditorFocus = () => {
  if (!editorCtx.value || !isEditorReady.value) return

  try {
    // #ifdef H5
    // H5环境下直接使用DOM focus
    const editor = document.querySelector('#commentEditor')
    if (editor) {
      editor.focus()
      return
    }
    // #endif

    // 其他环境尝试使用editorCtx.focus
    if (typeof editorCtx.value.focus === 'function') {
      editorCtx.value.focus()
    }
  } catch (err) {
    console.error('设置编辑器焦点失败:', err)
  }
}

// 重置组件状态
const resetState = () => {
  commentText.value = ''
  commentImage.value = null
  showEmoji.value = false
  isToggleEmoji.value = false
  isToggleAtUser.value = false
  isAnyPopupOpen.value = false
  keepPanelOpen.value = false
  savedContent.value = null
  lastInputChar.value = ''
  retryCount.value = 0

  // 清理定时器
  if (inputDebounceTimer.value) {
    clearTimeout(inputDebounceTimer.value)
    inputDebounceTimer.value = null
  }
  if (retryTimer.value) {
    clearTimeout(retryTimer.value)
    retryTimer.value = null
  }
}

// 生命周期钩子
onMounted(() => {
  console.log('comment-input组件已挂载')

  // 初始化表情映射
  initEmojiMap()

  // #ifdef H5
  // H5环境使用现代的MutationObserver监听DOM变化
  // 替代已弃用的DOMNodeInserted事件
  nextTick(() => {
    initDOMObserver()
  })
  // #endif
})

onBeforeUnmount(() => {
  // 清理定时器
  if (inputDebounceTimer.value) {
    clearTimeout(inputDebounceTimer.value)
    inputDebounceTimer.value = null
  }
  if (retryTimer.value) {
    clearTimeout(retryTimer.value)
    retryTimer.value = null
  }

  // 清理MutationObserver
  if (observer.value) {
    observer.value.disconnect()
    observer.value = null
  }

  // 清理编辑器上下文
  editorCtx.value = null
})

// 暴露给模板的方法
defineExpose({
  clear,
  setContent,
  resetState,
  setEditorFocus
})
</script>

<style lang="scss">
.comment-input-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  z-index: 999;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.comment-input-box {
  padding: 20rpx;
  background: #f5f5f5;
  position: relative;
}

/* 编辑器样式 */
.comment-editor {
  width: 100%;
  min-height: 60rpx; /* 减小最小高度 */
  max-height: 240rpx; /* 减小最大高度 */
  font-size: 28rpx;
  line-height: 36rpx;
  padding: 10rpx 20rpx;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 8rpx;
}

/* 为编辑器中的表情图片添加样式 */
.emoji-img {
  vertical-align: middle;
  margin: 0 1px;
  display: inline-block;
  transform: translateY(-1px);
  line-height: 1;
  width: 18px !important;
  height: 18px !important;
}

.comment-tools-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 20rpx;
  border-top: 1rpx solid #f1f1f1;
}

.tools-left {
  display: flex;
  align-items: center;
}

.tool-item {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10rpx;
}

.tool-item image {
  width: 44rpx;
  height: 44rpx;
}

.send-btn {
  width: 120rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  background-color: #f5f5f5;
  color: #ccc;
  font-size: 28rpx;
  border-radius: 32rpx;
  cursor: pointer;
  position: relative;
  z-index: 10;
}

.send-btn.active {
  background-color: #ff4d6a;
  color: #fff;
  cursor: pointer;
}

.selected-image-preview {
  padding: 20rpx;
  background: #f5f5f5;
  position: relative;
}

.selected-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  object-fit: cover;
}

.delete-image {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 40rpx;
  height: 40rpx;
  line-height: 36rpx;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  font-size: 32rpx;
}

.at-user-popup {
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.at-user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f1f1f1;
}

.close-btn {
  color: #999;
  font-size: 28rpx;
}

.at-user-list {
  max-height: 600rpx;
}

.at-user-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.at-user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.at-user-name {
  font-size: 28rpx;
}
</style>