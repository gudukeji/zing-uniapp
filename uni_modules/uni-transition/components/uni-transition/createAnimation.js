export const createAnimation = function(option, _this) {
  if (!_this) return;
  clearTimeout(_this.timer);
  return new Animation(option, _this);
}

const animateTypes1 = ['matrix', 'matrix3d', 'rotate', 'rotate3d', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scale3d',
  'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'translate', 'translate3d', 'translateX', 'translateY',
  'translateZ'
]

const animateTypes2 = ['opacity', 'backgroundColor']
const animateTypes3 = ['width', 'height', 'left', 'right', 'top', 'bottom']
const animateTypes = [...animateTypes1, ...animateTypes2, ...animateTypes3]

class Animation {
  constructor(option, _this) {
    this.options = option
    this.$$ = _this
    this.animation = uni.createAnimation({
      ...option
    })
    this.currentStepAnimates = {}
    this.next = 0
    this.isEnd = false
  }

  _nvuePushAnimates(type, args) {
    let aniObj = this.currentStepAnimates[this.next]
    let styles = {}
    if (!aniObj) {
      styles = {
        styles: {},
        config: {}
      }
    } else {
      styles = aniObj
    }
    if (animateTypes1.includes(type)) {
      if (!styles.styles.transform) {
        styles.styles.transform = ''
      }
      let unit = ''
      if (type === 'rotate') {
        unit = 'deg'
      }
      styles.styles.transform += `${type}(${args + unit}) `
    } else {
      styles.styles[type] = `${args}`
    }
    this.currentStepAnimates[this.next] = styles
  }

  _animateRun(styles = {}, config = {}) {
    let ref = this.$.$refs['ani'].ref
    if (!ref) return
    return new Promise((resolve, reject) => {
      nvueAnimation.transition(ref, {
        styles,
        ...config
      }, res => {
        resolve()
      })
    })
  }

  _nvueNextAnimate(animates, step = 0, fn) {
    let obj = animates[step]
    if (obj) {
      let {
        styles,
        config
      } = obj
      this._animateRun(styles, config).then(() => {
        step += 1
        this._nvueNextAnimate(animates, step, fn)
      })
    } else {
      this.currentStepAnimates = {}
      typeof fn === 'function' && fn()
      this.isEnd = true
    }
  }

  step(config = {}) {
    this.animation.step(config)
    return this
  }

  run(fn) {
    this.$$.animationData = this.animation.export()
    this.$$.timer = setTimeout(() => {
      typeof fn === 'function' && fn()
    }, this.$$.durationTime)
  }
}

animateTypes.forEach(type => {
  Animation.prototype[type] = function (...args) {
    this.animation[type](...args)
    return this
  }
}) 