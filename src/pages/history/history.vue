<template>
  <view class="container">
    <view class="h1">📅 历史菜单</view>
    <view class="h3-tip">在此查看和复用过去的每日菜单。</view>

    <view v-if="history.length === 0" class="no-history-data">
        尚无历史菜单记录。请在首页选定菜品后点击“✔️ 选定今日菜品”进行记录。
    </view>

    <view v-else class="history-list">
        <view v-for="record in history" :key="record.date" class="history-card">
            <view class="card-header">
                <text class="date-text">🗓️ {{ record.date }}</text>
                <button class="reuse-btn" @click="reusePlan(record.date)">复用今日</button>
            </view>

            <view class="card-content">
                <view v-for="(dishes, type) in record.plan" :key="type" class="meal-plan">
                    <text class="meal-type">{{ getPlanTypeLabel(type) }}：</text>
                    <text class="dishes-list">
                        {{ dishes.length > 0 ? dishes.join('、') : '—' }}
                    </text>
                </view>
            </view>
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
  computed: {
    history() {
      // 历史记录列表，按日期降序排列
      return this.foodStore.dailyMenuHistory;
    }
  },
  methods: {
    getPlanTypeLabel(type) {
      const labels = {
        'breakfast': '早餐',
        'lunch': '午餐',
        'dinner': '晚餐',
      };
      return labels[type] || type;
    },
    
    reusePlan(dateKey) {
      const success = this.foodStore.reuseDailyPlan(dateKey);
      
      if (success) {
        uni.showToast({
          title: `${dateKey} 的菜单已成功复用到今日计划！`,
          icon: 'success',
          duration: 2000
        });
        
        // 跳转回首页
        setTimeout(() => {
          uni.navigateBack();
        }, 1000);
      } else {
        uni.showToast({
          title: '复用失败，找不到该日期记录或菜单已过期',
          icon: 'none'
        });
      }
    }
  }
}
</script>

<style>
.container {
  max-width: 420px; 
  margin: 0 auto; 
  padding: 20px 15px 30px; 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
.h1 { font-size: 24px; font-weight: 700; color: #00bcd4; margin-bottom: 10px; text-align: center; }
.h3-tip { font-size: 14px; color: #999; margin-bottom: 25px; text-align: center; }

.no-history-data {
    text-align: center;
    color: #666;
    padding: 30px;
    background: #f0f0f0;
    border-radius: 10px;
    font-size: 15px;
}

/* 历史卡片样式 */
.history-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.history-card {
    background: white;
    padding: 15px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
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

.date-text {
    font-size: 16px;
    font-weight: bold;
    color: #333;
}

.reuse-btn {
    background: #4caf50;
    color: white;
    font-size: 12px;
    padding: 5px 10px;
    border-radius: 20px;
    line-height: normal;
    height: 30px;
    margin: 0;
}

.card-content {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.meal-plan {
    display: flex;
    font-size: 14px;
    line-height: 1.5;
}

.meal-type {
    font-weight: 600;
    color: #555;
    width: 60px; /* 固定餐次标签宽度 */
    flex-shrink: 0;
}

.dishes-list {
    color: #333;
    flex-grow: 1;
}
</style>