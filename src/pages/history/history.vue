<template>
  <view class="container">
    <view class="header-section">
      <view class="h1">📅 历史菜单回顾</view>
    </view>
    
    <view v-if="foodStore.dailyMenuHistory.length === 0" class="empty-state">
      <text class="emoji">👀</text>
      <text class="message">暂无历史菜单记录。</text>
      <text class="tip">请在首页选定菜品后，系统会自动保存您的每日菜单。</text>
      <button @click="goBack" class="back-btn">返回首页</button>
    </view>

    <view v-else class="history-list">
      <view v-for="record in foodStore.dailyMenuHistory" :key="record.date" class="history-card">
        <view class="card-header">
          <text class="date-label">{{ formatDisplayDate(record.date) }}</text>
          <button @click="reusePlan(record.date)" class="reuse-btn">✨ 复用此菜单</button>
        </view>
        
        <view class="meal-plan">
          <view v-for="(dishes, type) in record.plan" :key="type" class="meal-block">
            <text class="meal-type">{{ getPlanTypeLabel(type) }}：</text>
            <text v-if="dishes.length > 0" class="dish-names">{{ dishes.join('、') }}</text>
            <text v-else class="dish-names no-dish">-- 未选定 --</text>
          </view>
        </view>
      </view>
      
      <view class="history-tip">
          <text>Tip: 历史记录自动保存。</text>
      </view>
    </view>
    
  </view>
</template>

<script>
import { useFoodStore } from '../../stores/food'

export default {
  setup() {
    const foodStore = useFoodStore()
    return { foodStore }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    getPlanTypeLabel(type) {
      const labels = {
        'breakfast': '早餐',
        'lunch': '午餐',
        'dinner': '晚餐',
      };
      return labels[type] || type;
    },
    
    formatDisplayDate(dateKey) {
        // 将 YYYY-MM-DD 格式化为 MM月DD日
        const [year, month, day] = dateKey.split('-');
        return `${month}月${day}日 (${year})`;
    },
    
    reusePlan(dateKey) {
      if (this.foodStore.reuseDailyPlan(dateKey)) {
        uni.showToast({
          title: '已成功复用此菜单',
          icon: 'success',
          duration: 1500
        });
        // 成功复用后，返回主页
        uni.navigateBack();
      } else {
        uni.showToast({
          title: '复用失败，菜单数据缺失',
          icon: 'error'
        });
      }
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 420px; 
  margin: 0 auto; 
  padding: 0 15px 30px; 
}
.header-section {
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    margin-bottom: 25px;
    padding-top: 15px;
}
.h1 { 
    font-size: 24px; 
    font-weight: 700; 
    color: #00bcd4; /* 与首页历史按钮颜色保持一致 */
}

/* 历史列表样式 */
.history-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}
.history-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    padding: 15px;
    border-left: 5px solid #00bcd4;
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 10px;
}
.date-label {
    font-size: 16px;
    font-weight: bold;
    color: #333;
}
.reuse-btn {
    background: #ff69b4;
    color: white;
    font-size: 12px;
    padding: 5px 10px;
    border-radius: 20px;
    line-height: normal;
    transition: transform 0.1s;
}
.reuse-btn:active {
    transform: scale(0.98);
}

.meal-plan {
    display: flex;
    flex-direction: column;
    gap: 5px;
}
.meal-block {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
}
.meal-type {
    font-weight: bold;
    color: #555;
    flex-shrink: 0;
    width: 60px; /* 确保类型标签宽度固定 */
}
.dish-names {
    color: #333;
    flex-grow: 1;
}
.no-dish {
    color: #999;
    font-style: italic;
}

.history-tip {
    font-size: 12px;
    color: #888;
    text-align: center;
    margin-top: 20px;
}

/* 记录为空时的状态 */
.empty-state {
    text-align: center;
    padding: 40px 20px;
    background: #f8f8f8;
    border-radius: 10px;
    margin-top: 50px;
}
.empty-state .emoji {
    display: block;
    font-size: 40px;
    margin-bottom: 10px;
}
.empty-state .message {
    display: block;
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
}
.empty-state .tip {
    display: block;
    font-size: 14px;
    color: #999;
    margin-bottom: 20px;
}
.empty-state .back-btn {
    background: #00bcd4;
    color: white;
    padding: 8px 20px;
    border-radius: 25px;
    font-size: 15px;
    line-height: normal;
}
</style>