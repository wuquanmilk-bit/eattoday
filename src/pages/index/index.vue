<template>
  <view class="container">
    <view class="header-section">
      <view class="h1">🍓 今天吃什么</view>
      <view class="current-date">{{ currentDate }}</view> 
    </view>
    
    <view class="top-control-bar">
        <view class="diner-mode-selector-compact">
            <view class="mode-title">👤 人数：</view>
            <view class="mode-options-compact">
                <button v-for="n in 5" 
                        :key="n" 
                        :class="['mode-btn-compact', {'active': dinerCount === n}]"
                        @click="dinerCount = n"
                        :disabled="isShuffling">
                    {{ n }}
                </button>
            </view>
        </view>
        
        <view class="plan-buttons-inline">
            <button class="total-history-btn-inline"
                    @click="goToHistory">
                📅 历史
            </button>
            <button class="total-menu-btn-inline" 
                    @click="showTotalMenu = true"
                    :disabled="!hasPlannedFood">
                👀 总菜单
            </button>
            
            </view>
    </view>

    <view class="section-card today-plan-section">
        <view class="h2-plan-title">
            🗓️ {{ getPlanTypeLabel(current) }} 已定菜品 ({{ foodStore.todayPlan[current].length }} 道)
        </view>
        
        <view class="plan-list-single-meal">
            <view v-if="foodStore.todayPlan[current] && foodStore.todayPlan[current].length > 0">
                 <view v-for="(dish, index) in foodStore.todayPlan[current]" :key="index" class="plan-dish-item">
                    {{ dish.name }}
                 </view>
            </view>
            <view v-else class="plan-dish-empty">
                {{ current === 'breakfast' ? '点个元气满满的早餐' : '吃好每一餐...' }}
            </view>
        </view>
    </view>
    
    <view class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        :class="{ active: current === t.key }"
        @click="switchTab(t.key)"
        :disabled="isShuffling"
      >
        {{ t.label }}
      </button>
    </view>

    <view class="card-wrapper">
      <transition-group name="shuffle" tag="div">
          
        <view class="card" v-for="dish in pickedFoods" :key="dish.name">
          <view class="food-name">{{ dish.name }}</view>
          
          <view class="nutrition-indicators">
            <view class="indicator-item">
              <view class="icon-label">热量</view>
              <view class="icon-display calorie">
                <text v-for="i in getLevelCount(dish.nutrition.calorie)" :key="'c' + i" class="icon-chili">🌶️</text>
              </view>
            </view>
            <view class="indicator-item">
              <view class="icon-label">蛋白</view>
              <view class="icon-display protein">
                <text v-for="i in getLevelCount(dish.nutrition.protein)" :key="'p' + i" class="icon-muscle">💪</text>
              </view>
            </view>
            <view class="indicator-item">
              <view class="icon-label">脂肪</view>
              <view class="icon-display fat">
                <text v-for="i in getLevelCount(dish.nutrition.fat)" :key="'f' + i" class="icon-drop">💧</text>
              </view>
            </view>
          </view>
  
          <view class="materials">
            <view class="materials-title">🧺 食材</view>
            <view class="materials-list">
              <view v-for="m in dish.materials" :key="m" class="materials-item">• {{ m }}</view>
            </view>
          </view>
        </view>
        
        <view class="card shuffling-card" v-if="isShuffling && pickedFoods.length === 0" key="shuffling-placeholder">
          <view class="food-name blinking">{{ shufflingText || '🤔 随机中...' }}</view>
        </view>

        <view class="card empty-card" 
              v-else-if="!isShuffling && pickedFoods.length === 0 && (!foodStore.menu[current] || foodStore.menu[current].length === 0)"
              key="empty-menu-placeholder">
          <view class="food-name">当前菜单为空 🥺</view>
          <view class="materials-title">请添加菜品</view>
        </view>
      </transition-group>
    </view>

    <view class="btn-group main-actions">
      <button class="pick" @click="pickFood" :disabled="isShuffling || !foodStore.menu[current] || foodStore.menu[current].length < dinerCount">
        <view v-if="isShuffling">⏳ 随机中...</view>
        <view v-else>🎲 随机 {{ dinerCount }} 个</view>
      </button>
      
      <button class="add-to-plan" @click="addToPlan" :disabled="isShuffling || pickedFoods.length === 0">
        ✔️ 选定今日菜品 ({{ pickedFoods.length }} 道)
      </button>
    </view>

    <view class="btn-group list-actions">
      <button class="shopping" @click="generateShoppingList" :disabled="isShuffling || pickedFoods.length === 0">🛒 本次清单</button>
      
      <button class="total-shopping-btn" 
              @click="showTotalShoppingList = true"
              :disabled="isShuffling || !hasPlannedFood">
          🛒 总清单
      </button>
    </view>
    
    <view class="btn-group-single-row">
        <button class="clear-history" @click="clearHistory" :disabled="isShuffling && foodStore.history.length === 0 && !hasPlannedFood">
            🗑️ 重置今日
        </button>
    </view>
    <view class="shopping-modal-overlay" v-if="shoppingList.length" @click="shoppingList=[]">
      <view class="shopping-modal" @click.stop>
        <view class="h3">🛒 **本次随机菜品** 购买清单</view>
        <view class="materials-list">
          <view v-for="m in shoppingList" :key="m" class="materials-item">• {{ m }}</view>
        </view>
        <button class="close-modal" @click="shoppingList=[]">关闭</button>
      </view>
    </view>
    
    <view class="shopping-modal-overlay" v-if="showTotalMenu" @click="showTotalMenu=false">
      <view class="shopping-modal" @click.stop>
        <view class="h3">📋 **今日三餐总菜单**</view>
        <view class="total-menu-content">
            <view v-for="(planDishes, type) in foodStore.todayPlan" :key="type" class="menu-type-block">
                <view class="menu-type-title">{{ getPlanTypeLabel(type) }}：</view> 
                
                <view class="food-list-block" v-if="planDishes && planDishes.length > 0">
                    <view v-for="(dish, index) in planDishes" :key="index" class="plan-food-item">
                        <text class="food-name-display"> - {{ dish.name }}</text>
                    </view>
                </view>
                <view v-else class="no-food">未选定菜品</view>
            </view>
        </view>
        <button class="close-modal" @click="showTotalMenu=false">关闭</button>
      </view>
    </view>
    
    <view class="shopping-modal-overlay" v-if="showTotalShoppingList" @click="showTotalShoppingList=false">
      <view class="shopping-modal" @click.stop>
        <view class="h3">🛍️ **今日三餐总购买清单**</view>
        <view v-if="totalShoppingList.length > 0">
            <view class="materials-list total-list">
              <view v-for="m in totalShoppingList" :key="m" class="materials-item">• {{ m }}</view>
            </view>
        </view>
        <view v-else class="no-data">
            请先选定您的**早餐、午餐和晚餐**。
        </view>
        <button class="close-modal" @click="showTotalShoppingList=false">关闭</button>
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
  data() {
    return {
      tabs: [
        { key: 'breakfast', label: '早餐' },
        { key: 'lunch', label: '午餐' },
        { key: 'dinner', label: '晚餐' }
      ],
      current: 'breakfast',
      pickedFoods: [], 
      shoppingList: [],
      isShuffling: false, 
      shufflingText: '',
      currentDate: '', 
      showTotalShoppingList: false,
      showTotalMenu: false,
      dinerCount: 1, 
    }
  },
  computed: {
    hasPlannedFood() {
        return this.foodStore.todayPlan.breakfast.length > 0 || 
               this.foodStore.todayPlan.lunch.length > 0 || 
               this.foodStore.todayPlan.dinner.length > 0;
    },
    totalShoppingList() {
        const materials = [];
        for (const type in this.foodStore.todayPlan) {
            const dishes = this.foodStore.todayPlan[type];
            if (dishes && dishes.length) {
                dishes.forEach(item => {
                    if (item.materials && item.materials.length) {
                        materials.push(...item.materials);
                    }
                });
            }
        }
        const uniqueMaterials = [...new Set(materials)];
        return uniqueMaterials.sort();
    }
  },
  mounted() {
    this.updateDate();
  },
  methods: {
    updateDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        const dayOfWeek = weekDays[date.getDay()];
        this.currentDate = `${year}年${month}月${day}日 星期${dayOfWeek}`;
    },
    
    getLevelCount(level) {
      const map = { '低': 1, '中': 2, '高': 3, '极高': 4, 'default': 1 };
      return map[level] || map['default'];
    },
    
    getPlanTypeLabel(type) {
      const labels = {
        'breakfast': '早餐',
        'lunch': '午餐',
        'dinner': '晚餐',
      };
      return labels[type] || type;
    },

    addToPlan() {
      if (this.pickedFoods.length === 0) {
        uni.showToast({ title: '请先随机抽取菜品', icon: 'none' });
        return;
      }
      this.foodStore.addFoodToPlan(this.current, this.pickedFoods); 
      uni.showToast({ title: `已将 ${this.pickedFoods.length} 道菜品选定为今日菜单`, icon: 'success' });
      this.pickedFoods = [];
    },

    pickFood() {
      if (this.isShuffling) return;
      
      const list = this.foodStore.menu[this.current] || [];
      if (list.length < this.dinerCount) {
          uni.showToast({ title: `菜单中菜品不足 ${this.dinerCount} 道，请减少人数或添加菜品`, icon: 'none' });
          return;
      }
      
      this.isShuffling = true;
      this.pickedFoods = []; 

      let count = 0;
      const shuffleInterval = setInterval(() => {
        const randomItem = list[Math.floor(Math.random() * list.length)];
        this.shufflingText = randomItem ? randomItem.name : '思考中...';
        count++;

        if (count >= 15) { 
          clearInterval(shuffleInterval);
          this.shufflingText = '';
          this.pickedFoods = this.foodStore.pickFood(this.current, this.dinerCount);
          this.isShuffling = false;
          
          if (this.pickedFoods.length === 0) {
              uni.showToast({ title: '菜单为空，请添加菜品', icon: 'error' });
          }
        }
      }, 100);
    },
    
    switchTab(key) {
      this.current = key
      this.pickedFoods = [] 
      this.shoppingList = []
      this.isShuffling = false
    },
    
    generateShoppingList() {
      if (this.pickedFoods.length === 0) return
      
      const materials = [];
      this.pickedFoods.forEach(dish => {
          materials.push(...dish.materials);
      });
      
      const uniqueMaterials = [...new Set(materials)];
      this.shoppingList = uniqueMaterials;
    },
    
    clearHistory() {
      this.foodStore.clearHistory() 
      this.pickedFoods = []
      this.shoppingList = []
      uni.showToast({ title: '今日计划与历史记录已重置', icon: 'success' });
    },
    
    // 跳转到历史记录页面
    goToHistory() {
        uni.navigateTo({
            url: '/pages/history/history' 
        });
    }
  }
}
</script>

<style>
/* 容器和基础样式 */
.container {
  max-width: 420px; 
  margin: 0 auto; 
  padding: 0 15px 30px; 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* 标题/日期居中区域 */
.header-section {
    /* 核心修复：强制容器使用 Flex 布局并居中内容 */
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    
    margin-bottom: 20px;
}
.h1 { 
    font-size: 28px; 
    font-weight: 700; 
    color: #ff69b4; 
    margin-bottom: 5px; 
}
.current-date { 
    font-size: 14px; 
    color: #666; 
    margin-bottom: 10px; 
}


/* 顶部控制条样式 */
.top-control-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    margin-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}

/* 用餐人数 (左侧) */
.diner-mode-selector-compact {
    display: flex;
    align-items: center;
    gap: 8px;
}
.diner-mode-selector-compact .mode-title {
    font-size: 14px;
    color: #333;
    font-weight: bold;
    white-space: nowrap;
}
.mode-options-compact {
    display: flex;
    gap: 4px; 
}
.mode-btn-compact {
    border: 1px solid #ff69b4;
    padding: 3px 6px; 
    border-radius: 5px; 
    background: #fff;
    color: #ff69b4;
    font-size: 12px;
    line-height: normal;
    transition: all 0.2s;
    height: 25px; 
    min-width: 25px; 
    display: flex;
    justify-content: center;
    align-items: center;
}
.mode-btn-compact.active {
    background: #ff69b4;
    color: white;
    box-shadow: 0 1px 3px rgba(255, 105, 180, 0.5);
}
.mode-btn-compact[disabled] {
    opacity: 0.5;
    background: #eee;
    color: #999;
}

/* 总菜单和总清单按钮 (右侧) */
.plan-buttons-inline {
    display: flex;
    gap: 5px;
}
.total-menu-btn-inline, .total-history-btn-inline {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 15px;
    line-height: normal;
    height: 25px;
    margin: 0;
    white-space: nowrap; 
}
.total-history-btn-inline {
    background: #00bcd4; /* 青色，代表时间或日历 */
    color: white;
}
.total-menu-btn-inline {
    background: #1e90ff;
    color: white;
}

/* 移除 .total-shopping-btn-inline 的颜色定义，因为按钮已移动 */
/* .total-shopping-btn-inline { background: #ff9800; color: white; } */

.total-menu-btn-inline[disabled], .total-history-btn-inline[disabled] {
    background: #ccc;
    color: #999;
}


/* 今日计划区域样式 */
.today-plan-section {
    background-color: #f7f7f7;
    padding: 10px 15px 15px 15px; 
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
.h2-plan-title {
    font-size: 16px; 
    font-weight: bold;
    color: #444;
    margin-bottom: 8px; 
    padding-top: 5px; 
}
.plan-list-single-meal {
    background-color: white;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #eee;
    min-height: 40px; 
}
.plan-dish-item {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    padding: 3px 0;
    text-align: center;
}
.plan-dish-empty {
    color: #999;
    text-align: center;
    padding: 5px 0;
    font-size: 14px;
}


/* Tabs 切换样式 */
.tabs {
  display: flex;
  justify-content: center; gap: 10px; margin: 20px 0;
}
.tabs button {
  flex: 1; 
  border: none; padding: 8px 16px; border-radius: 20px;
  background: #ffd1dc; color: #333; transition: background 0.2s, transform 0.1s;
  line-height: normal; font-size: 14px;
}
.tabs button.active { background: #ff69b4; color: white; }
.tabs button:active { transform: scale(0.98); }
.tabs button[disabled] { background: #eee; color: #999; }


/* 菜品卡片样式 */
.card-wrapper {
    position: relative;
    min-height: 300px; 
}
.card {
    position: relative; 
    margin-bottom: 15px; 
    display: flex;
    flex-direction: column; justify-content: center;
    min-height: 250px; background: white; border-radius: 15px; box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    padding: 20px; text-align: center;
}
.food-name { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 15px; transition: color 0.3s; }
.shuffling-card .food-name { color: #ff69b4; animation: blink 1s step-end infinite; }
@keyframes blink { 50% { opacity: 0.5; } }

.nutrition-indicators {
    display: flex; justify-content: space-around;
    padding: 10px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-bottom: 15px;
}
.indicator-item { text-align: center; flex: 1; }
.icon-label { font-size: 12px; color: #999; margin-bottom: 5px; }
.icon-display { font-size: 18px; }
.materials-title { font-size: 14px; font-weight: bold; color: #ff69b4; margin-bottom: 8px; }
.materials-list { display: flex; flex-wrap: wrap; justify-content: center; }
.materials-item { font-size: 13px; color: #666; margin: 3px 5px; background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }


/* 【修改：底部按钮组样式】 */

/* 按钮组样式 - 用于两列按钮 (Row 1 & 2) */
.btn-group {
  display: flex;
  flex-wrap: wrap; 
  justify-content: space-between;
  gap: 8px; 
  margin-top: 10px; 
}
.btn-group.main-actions {
    margin-top: 20px; /* 调整与卡片区的距离 */
}
.btn-group button {
  flex: 1 1 48%; 
  border: none; padding: 12px 0; border-radius: 10px;
  color: white; font-size: 13px; 
  font-weight: bold; transition: transform 0.1s ease;
  line-height: normal;
}
.btn-group button:active { transform: scale(0.98); }
.btn-group button[disabled] { background: #ccc !important; }

/* 按钮颜色 */
.btn-group .pick { background: #4caf50; } 
.btn-group .add-to-plan { background: #1e90ff; } 
.btn-group .shopping { background: #ff9800; } 
.btn-group .total-shopping-btn { background: #ff9800; } /* 移动后的总清单按钮颜色 */


/* 【新增样式】按钮组 - 单行居中（重置按钮） */
.btn-group-single-row {
    display: flex;
    justify-content: center; /* 居中按钮 */
    margin-top: 10px; 
    margin-bottom: 20px;
}
.btn-group-single-row button {
    flex-basis: 98%; 
    max-width: 300px; /* 设置最大宽度以避免过宽 */
    border: none; padding: 12px 0; border-radius: 10px;
    color: white; font-size: 14px; 
    font-weight: bold; transition: transform 0.1s ease;
    line-height: normal;
}
.btn-group-single-row button:active { transform: scale(0.98); } 
.btn-group-single-row button[disabled] { background: #ccc !important; }

.btn-group-single-row .clear-history { background: #f44336; } 


/* 模态框通用样式 */
.shopping-modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
}
.shopping-modal {
  background: white; padding: 20px; border-radius: 10px; max-width: 80%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); text-align: left;
  max-height: 70vh; 
  overflow-y: auto; 
}
.shopping-modal .h3 { font-size: 18px; font-weight: bold; color: #ff69b4; margin-bottom: 10px; }
.shopping-modal .materials-list { justify-content: flex-start; margin-bottom: 15px; }
.shopping-modal .materials-item { margin: 5px 0; background: #eee; padding: 4px 8px; border-radius: 4px; }

/* 总清单特殊样式 */
.total-list {
    flex-direction: column; 
    align-items: flex-start;
}
.total-list .materials-item {
    width: 100%; 
}
.no-data {
    color: #999;
    padding: 20px;
    text-align: center;
}
.close-modal { 
    background: #ff69b4; color: white; border: none; padding: 8px 15px; 
    border-radius: 5px; font-size: 14px; width: 100%; margin-top: 15px;
}

/* 总菜单样式 */
.total-menu-content {
    padding: 10px 0;
}
.menu-type-block {
    margin-bottom: 10px;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #f0f0f0;
}
.menu-type-title {
    font-size: 16px;
    font-weight: bold;
    color: #1e90ff;
    margin-bottom: 5px;
    display: block; 
    width: 100%; 
}
.plan-food-item {
    font-size: 15px;
    color: #333;
    padding: 2px 0;
    font-weight: 500;
}
.plan-food-item .food-name-display {
    display: block; 
    padding: 2px 0;
}
.no-food {
    font-size: 14px;
    color: #999;
}
</style>