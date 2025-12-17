<template>
  <view class="container">
    <view class="header-section">
      <view class="h1">🍓 今天吃什么</view>
      <view class="current-date">{{ currentDate }}</view> 
    </view>
    
    <view class="top-control-bar">
        <view class="diner-mode-selector-compact">
            <view class="mode-title"> 人数：</view>
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
            <button class="total-menu-btn-inline" 
                    @click="showTotalMenu = true"
                    :disabled="!hasPlannedFood">
                 总菜单
            </button>
            
            <button class="total-shopping-btn-inline" 
                    @click="showTotalShoppingList = true"
                    :disabled="!hasPlannedFood">
                 总清单
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
                {{ current === 'breakfast' ? '元气满满的早餐' : '犒劳努力的自己' }}
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

    <view class="btn-group">
      <button class="pick" @click="pickFood" :disabled="isShuffling || !foodStore.menu[current] || foodStore.menu[current].length < dinerCount">
        <view v-if="isShuffling">⏳ 随机中...</view>
        <view v-else>🎲 随机 {{ dinerCount }} 个</view>
      </button>
      
      <button class="add-to-plan" @click="addToPlan" :disabled="isShuffling || pickedFoods.length === 0">
        ✔️ 选定今日菜品 ({{ pickedFoods.length }} 道)
      </button>
      
      <button class="shopping" @click="generateShoppingList" :disabled="isShuffling || pickedFoods.length === 0">🛒 本次清单</button>
      
      <button class="clear-history" @click="clearHistory" :disabled="isShuffling && foodStore.history.length === 0 && !hasPlannedFood">🗑️ 重置今日</button>

      <button class="mall-btn-full" @click="showMallModal = true" :disabled="isShuffling">🌍 全国 15 城商场探店</button>
    </view>

    <view class="shopping-modal-overlay" v-if="shoppingList.length" @click="shoppingList=[]">
      <view class="shopping-modal" @click.stop>
        <view class="h3">🛒 **本次随机菜品** 购买清单</view>
        <view class="materials-list">
          <view v-for="m in shoppingList" :key="m" class="materials-item">• {{ m }}</view>
        </view>
        <button class="close-modal" @click="shoppingList=[]">确认并关闭</button>
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

    <view class="shopping-modal-overlay" v-if="showMallModal" @click="showMallModal = false">
        <view class="shopping-modal mall-modal" @click.stop>
            <view class="h3" style="text-align: center;">🌍 全国美食探店</view>
            <scroll-view scroll-x class="mall-nav">
                <view v-for="city in Object.keys(mallData)" :key="city" 
                      :class="['m-city-tag', { active: selectedCity === city }]"
                      @click="selectedCity = city">{{ city }}</view>
            </scroll-view>
            <view class="mall-res-card">
                <view v-if="mallResult.name">
                    <view class="m-area-tag">{{ mallResult.area }}</view>
                    <view class="m-name">{{ mallResult.name }}</view>
                    <view class="m-tip">✨ 推荐：{{ mallResult.tip }}</view>
                </view>
                <view v-else style="color:#999; padding:20px; text-align:center;">请选择城市并随机</view>
            </view>
            <button @click="pickMall" class="mall-go-btn">🎲 随机选一家</button>
            <button @click="showMallModal = false" class="close-modal" style="background:#999; margin-top:10px;">返回</button>
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
      tabs: [{ key: 'breakfast', label: '早餐' }, { key: 'lunch', label: '午餐' }, { key: 'dinner', label: '晚餐' }],
      current: 'breakfast',
      pickedFoods: [], shoppingList: [], isShuffling: false, shufflingText: '', currentDate: '',
      showTotalShoppingList: false, showTotalMenu: false, dinerCount: 1,
      // 商场功能新增
      showMallModal: false, selectedCity: '北京', mallResult: { name: '', tip: '', area: '' },
      mallData: {
          '北京': [{ name: '四季民福', area: '故宫', tip: '烤鸭' }, { name: '胡大', area: '簋街', tip: '小龙虾' }],
          '上海': [{ name: '费大厨', area: '正大广场', tip: '辣椒炒肉' }],
          '杭州': [{ name: '新白鹿', area: 'in77', tip: '蛋黄鸡翅' }],
          '广州': [{ name: '陶陶居', area: '上下九', tip: '虾饺' }],
          '成都': [{ name: '陶德砂锅', area: '春熙路', tip: '蒜蓉排骨' }],
          '深圳': [{ name: '陈鹏鹏', area: '万象天地', tip: '卤鹅' }],
          '西安': [{ name: '长安大牌档', area: '小寨', tip: '葫芦鸡' }],
          '南京': [{ name: '南京大牌档', area: '老门东', tip: '美龄粥' }],
          '长沙': [{ name: '文和友', area: '五一广场', tip: '口味虾' }],
          '武汉': [{ name: '靓靓蒸虾', area: '江汉路', tip: '油焖大虾' }],
          '重庆': [{ name: '珮姐火锅', area: '洪崖洞', tip: '毛肚' }],
          '苏州': [{ name: '松鹤楼', area: '观前街', tip: '松鼠鳜鱼' }],
          '天津': [{ name: '狗不理', area: '水上公园', tip: '包子' }],
          '厦门': [{ name: '临家', area: '中山路', tip: '姜母鸭' }],
          '大连': [{ name: '品海楼', area: '老虎滩', tip: '脆皮虾' }]
      }
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
                dishes.forEach(item => { if (item.materials) materials.push(...item.materials); });
            }
        }
        return [...new Set(materials)].sort();
    }
  },
  mounted() { this.updateDate(); },
  methods: {
    updateDate() {
        const date = new Date();
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        this.currentDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 星期${weekDays[date.getDay()]}`;
    },
    getLevelCount(l) { return { '低': 1, '中': 2, '高': 3, '极高': 4 }[l] || 1; },
    getPlanTypeLabel(t) { return { 'breakfast': '早餐', 'lunch': '午餐', 'dinner': '晚餐' }[t] || t; },
    addToPlan() {
      if (this.pickedFoods.length === 0) return;
      this.foodStore.addFoodToPlan(this.current, this.pickedFoods); 
      uni.showToast({ title: '已选定', icon: 'success' });
      this.pickedFoods = [];
    },
    pickFood() {
      if (this.isShuffling) return;
      const list = this.foodStore.menu[this.current] || [];
      if (list.length < this.dinerCount) return;
      this.isShuffling = true; this.pickedFoods = []; 
      let count = 0;
      const shuffleInterval = setInterval(() => {
        const randomItem = list[Math.floor(Math.random() * list.length)];
        this.shufflingText = randomItem ? randomItem.name : '...';
        if (++count >= 15) { 
          clearInterval(shuffleInterval);
          this.pickedFoods = this.foodStore.pickFood(this.current, this.dinerCount);
          this.isShuffling = false;
        }
      }, 100);
    },
    switchTab(k) { this.current = k; this.pickedFoods = []; this.isShuffling = false; },
    generateShoppingList() {
        if (this.pickedFoods.length === 0) return;
        this.shoppingList = [...new Set(this.pickedFoods.flatMap(d => d.materials))];
    },
    clearHistory() { this.foodStore.clearHistory(); this.pickedFoods = []; },
    pickMall() { this.mallResult = this.mallData[this.selectedCity][Math.floor(Math.random() * this.mallData[this.selectedCity].length)]; }
  }
}
</script>

<style>
/* --- 您原有的样式 --- */
.container { max-width: 420px; margin: 0 auto; padding: 0 15px 30px; }
.header-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; }
.h1 { font-size: 28px; font-weight: 700; color: #ff69b4; margin-bottom: 5px; }
.current-date { font-size: 14px; color: #666; margin-bottom: 15px; }
.top-control-bar { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f0f0f0; margin-bottom: 15px; }
.diner-mode-selector-compact { display: flex; align-items: center; gap: 8px; }
.mode-options-compact { display: flex; gap: 4px; }
.mode-btn-compact { border: 1px solid #ff69b4; padding: 3px 6px; border-radius: 5px; background: #fff; color: #ff69b4; font-size: 12px; height: 25px; min-width: 25px; display: flex; justify-content: center; align-items: center; }
.mode-btn-compact.active { background: #ff69b4; color: white; }
.plan-buttons-inline { display: flex; gap: 5px; }
.total-menu-btn-inline, .total-shopping-btn-inline { font-size: 9px; padding: 5px 10px; border-radius: 15px; height: 29px; color: white; }
.total-menu-btn-inline { background: #1e90ff; }
.total-shopping-btn-inline { background: #ff9800; }
.today-plan-section { background-color: #f7f7f7; padding: 15px; border-radius: 12px; margin-bottom: 20px; }
.h2-plan-title { font-size: 16px; font-weight: bold; color: #444; margin-bottom: 8px; }
.plan-list-single-meal { background-color: white; padding: 10px; border-radius: 8px; min-height: 40px; }
.plan-dish-item { font-size: 14px; text-align: center; color: #333; }
.tabs { display: flex; gap: 10px; margin: 20px 0; }
.tabs button { flex: 1; border: none; padding: 8px; border-radius: 20px; background: #ffd1dc; color: #333; font-size: 14px; }
.tabs button.active { background: #ff69b4; color: white; }
.card { background: white; border-radius: 15px; box-shadow: 0 8px 15px rgba(0,0,0,0.1); padding: 20px; text-align: center; margin-bottom: 15px; min-height: 250px; display: flex; flex-direction: column; justify-content: center; }
.food-name { font-size: 28px; font-weight: bold; margin-bottom: 15px; }
.nutrition-indicators { display: flex; justify-content: space-around; padding: 10px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-bottom: 15px; }
.btn-group { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; margin-top: 20px; }
.btn-group button { flex: 1 1 48%; border: none; padding: 12px 0; border-radius: 10px; color: white; font-size: 13px; font-weight: bold; }
.pick { background: #4caf50; } .add-to-plan { background: #1e90ff; } .shopping { background: #ff9800; } .clear-history { background: #f44336; }
.mall-btn-full { background: #9c27b0 !important; flex: 1 1 100% !important; margin-top: 5px; }

/* 弹窗核心样式还原 */
.shopping-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.shopping-modal { background: white; padding: 20px; border-radius: 10px; width: 85%; max-height: 70vh; overflow-y: auto; }
.menu-type-block { margin-bottom: 10px; padding: 8px; border: 1px solid #eee; border-radius: 6px; }
.menu-type-title { font-weight: bold; color: #1e90ff; margin-bottom: 5px; display: block; }
.materials-item { display: inline-block; margin: 3px; background: #f5f5f5; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.close-modal { background: #ff69b4; color: white; border: none; padding: 10px; border-radius: 5px; width: 100%; margin-top: 15px; }

/* 探店内部专用样式 */
/* 基础重置 */
* {
    box-sizing: border-box;
}

/* 导航容器 - 现代设计 */
.mall-nav { 
    display: flex;
    overflow-x: auto;
    padding: 15px 5px 20px;
    margin-bottom: 25px;
    border-bottom: none;
    gap: 10px;
    scrollbar-width: none; /* 隐藏滚动条 */
    -ms-overflow-style: none;
}
.mall-nav::-webkit-scrollbar {
    display: none;
}

/* 城市标签 - 卡片式设计 */
.m-city-tag { 
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 24px;
    font-size: 15px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.08);
    color: #495057;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.m-city-tag:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: #d0d0d0;
}
.m-city-tag.active { 
    background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
    color: white;
    border-color: #9c27b0;
    box-shadow: 0 4px 15px rgba(156, 39, 176, 0.3);
    font-weight: 600;
}

/* 商家卡片 - 现代化卡片设计 */
.mall-res-card { 
    min-height: 140px;
    text-align: left;
    background: white;
    border-radius: 20px;
    padding: 25px;
    margin-bottom: 20px;
    border: none;
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    overflow: hidden;
}
.mall-res-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #9c27b0, #e91e63);
}
.mall-res-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
}

/* 商家名称 - 优雅设计 */
.m-name { 
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 12px 0;
    color: #1a1a1a;
    line-height: 1.3;
    display: flex;
    align-items: center;
    gap: 10px;
}
.m-name::before {
    content: '🏬';
    font-size: 20px;
}

/* 区域标签 - 徽章设计 */
.m-area-tag { 
    background: linear-gradient(135deg, #2d3436 0%, #636e72 100%);
    color: white;
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 20px;
    display: inline-block;
    font-weight: 500;
    letter-spacing: 0.5px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 提示信息 - 醒目设计 */
.m-tip { 
    color: #e91e63;
    font-size: 14px;
    margin: 12px 0 0 0;
    font-weight: 600;
    padding: 8px 12px;
    background: linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%);
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}
.m-tip::before {
    content: '🎯';
}

/* 操作按钮 - 现代化按钮 */
.mall-go-btn { 
    width: 100%;
    background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
    color: white;
    border-radius: 14px;
    padding: 16px;
    margin-top: 20px;
    border: none;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
}
.mall-go-btn::after {
    content: '→';
    font-size: 18px;
    transition: transform 0.3s ease;
}
.mall-go-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(156, 39, 176, 0.4);
    background: linear-gradient(135deg, #8e24aa 0%, #6a1b9a 100%);
}
.mall-go-btn:hover::after {
    transform: translateX(5px);
}
.mall-go-btn:active {
    transform: translateY(0);
}

/* 添加装饰元素 */
.mall-res-card::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(233, 30, 99, 0.05) 100%);
    border-radius: 0 0 0 100%;
    pointer-events: none;
}

/* 响应式调整 */
@media (max-width: 480px) {
    .mall-nav {
        padding: 12px 5px 18px;
    }
    .m-city-tag {
        padding: 8px 20px;
        font-size: 14px;
    }
    .mall-res-card {
        padding: 20px;
        border-radius: 18px;
    }
    .m-name {
        font-size: 20px;
    }
    .m-area-tag {
        font-size: 11px;
        padding: 5px 10px;
    }
    .mall-go-btn {
        padding: 14px;
        font-size: 15px;
    }
}
/* --- 点击视觉反馈（变色及缩放） --- */
button:active {
    transform: scale(0.96);
    filter: brightness(0.85);
    transition: all 0.1s;
}

@keyframes blink { 50% { opacity: 0.5; } }
</style>