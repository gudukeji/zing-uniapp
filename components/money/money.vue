<template>
  <view class="money-box">
    <view class="unit" :style="{'font-size': ts, 'line-height': ts, 'color': cor}">¥</view>
    <view class="sale" :style="{'font-size': qs, 'line-height': qs, 'color': cor}">{{ qsHandle(price) }}</view>
    <view class="unit" :style="{'font-size': ts, 'line-height': ts, 'color': cor}">{{ tsHandle(price) }}</view>
  </view>
</template>

<script>
export default {
  name: 'money',
  props: {
    type: {
      type: Number,
      default: 0
    },
    price: {
      type: [String, Number],
      default: '0.00'
    },
    qs: {
      type: String,
      default: '38rpx'
    },
    ts: {
      type: String,
      default: '22rpx'
    },
    cor: {
      type: String,
      default: '#000'
    }
  },
  methods: {
    qsHandle(price) {
      return parseInt(String(price));
    },
    tsHandle(price) {
      var decimalPart = parseFloat(String(price)).toFixed(2).slice(-2);
      
      if (this.type == 1 && decimalPart === '00') {
        return '';
      } else if (this.type == 1 && decimalPart[1] === '0') {
        return '.' + decimalPart[0];
      } else {
        return '.' + decimalPart;
      }
    }
  }
}
</script>

<style>
.money-box {
  display: flex;
  align-items: flex-end;
  font-weight: bolder;
}

.money-box .sale {
  margin: 0 2rpx;
}

.money-box .unit {
  margin-bottom: 2rpx;
}
</style> 