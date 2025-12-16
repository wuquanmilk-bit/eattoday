import os
import json
import zipfile

# --- 1. 定义文件内容 ---

# 1.1 Pinia Store 文件 (src/stores/food.js) - 保持不变
FOOD_STORE_CONTENT = """
import { defineStore } from 'pinia'

// --- 默认菜单数据 (包含详细食材和营养估算) ---
const defaultMenu = {
  breakfast: [
    { name: '香菇鸡肉粥', materials: ['大米', '鸡胸肉', '干香菇', '姜', '葱花'], nutrition: { calorie: "低", protein: "高", fat: "低" }, tags: ["清淡", "养胃"] },
    { name: '蔬菜鸡蛋卷', materials: ['鸡蛋', '面粉', '生菜', '胡萝卜丝', '低脂沙拉酱'], nutrition: { calorie: "中", protein: "中", fat: "低" }, tags: ["均衡", "快手"] },
    { name: '全麦牛肉三明治', materials: ['全麦面包', '牛肉片', '芝士片', '番茄', '生菜'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["饱腹", "西方"] },
    { name: '红薯牛奶燕麦粥', materials: ['红薯', '燕麦片', '纯牛奶', '少量蜂蜜'], nutrition: { calorie: "中", protein: "中", fat: "低" }, tags: ["高纤", "健康", "素食"] },
    { name: '豆腐脑配油条', materials: ['豆腐脑', '黄豆', '面粉', '油条', '榨菜'], nutrition: { calorie: "高", protein: "中", fat: "高" }, tags: ["传统", "油炸"] },
  ],
  lunch: [
    { name: '宫保鸡丁', materials: ['鸡腿肉', '花生米', '干辣椒', '花椒', '黄瓜丁', '米饭'], nutrition: { calorie: "高", protein: "高", fat: "中" }, tags: ["川菜", "下饭", "重口"] },
    { name: '清炒虾仁配青豆玉米', materials: ['鲜虾', '青豆', '玉米粒', '鸡蛋清', '姜片', '米饭'], nutrition: { calorie: "低", protein: "高", fat: "低" }, tags: ["清淡", "高蛋白", "健康"] },
    { name: '土豆牛肉咖喱饭', materials: ['牛肉', '土豆', '胡萝卜', '洋葱', '咖喱块', '米饭'], nutrition: { calorie: "高", protein: "中", fat: "中" }, tags: ["日式", "便捷"] },
    { name: '番茄鸡蛋面', materials: ['挂面', '番茄', '鸡蛋', '葱花', '清汤'], nutrition: { calorie: "中", protein: "中", fat: "低" }, tags: ["家常", "暖胃"] },
    { name: '酸辣土豆丝', materials: ['土豆', '醋', '干辣椒', '花椒', '葱'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["素菜", "开胃"] },
  ],
  dinner: [
    { name: '红烧肉', materials: ['五花肉', '冰糖', '酱油', '八角', '桂皮', '米饭'], nutrition: { calorie: "极高", protein: "中", fat: "高" }, tags: ["硬菜", "重口", "高热量"] },
    { name: '蒜蓉西兰花', materials: ['西兰花', '大蒜', '蚝油'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["清淡", "低卡", "素食"] },
    { name: '酸菜鱼', materials: ['巴沙鱼片', '酸菜', '花椒', '干辣椒', '姜片'], nutrition: { calorie: "中", protein: "高", fat: "低" }, tags: ["川菜", "高蛋白"] },
    { name: '麻辣小龙虾', materials: ['小龙虾', '花椒', '干辣椒', '啤酒', '大蒜'], nutrition: { calorie: "高", protein: "高", fat: "中" }, tags: ["宵夜", "海鲜", "麻辣"] },
    { name: '三文鱼牛油果沙拉', materials: ['三文鱼', '牛油果', '生菜', '小番茄', '柠檬汁'], nutrition: { calorie: "中", protein: "高", fat: "高" }, tags: ["轻食", "健康", "西方"] },
  ]
};

// --- 跨平台存储工具 (用于数据持久化，确保用户添加的菜单不丢失) ---
const storage = {
  getItem(key) {
    const data = (typeof uni !== 'undefined' && uni.getStorageSync) 
      ? uni.getStorageSync(key) 
      : (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null)
    return data
  },
  setItem(key, value) {
    const data = JSON.stringify(value)
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(key, data)
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, data)
    }
  },
  removeItem(key) {
    if (typeof uni !== 'undefined' && uni.removeStorageSync) {
      uni.removeStorageSync(key)
    } else if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key)
    }
  }
}

function _saveMenuToStorage(menu) {
  storage.setItem('user-menu-data', menu);
}

const storedMenu = JSON.parse(storage.getItem('user-menu-data') || 'null');

// --- Pinia Store 定义 ---
export const useFoodStore = defineStore('food', {
  state: () => ({
    menu: storedMenu || defaultMenu, 
    history: JSON.parse(storage.getItem('today-food-history') || '[]'),
    recentHistory: [] 
  }),

  actions: {
    pickFood(currentType) {
      const list = this.menu[currentType]
      const available = list.filter(f => !this.recentHistory.includes(f.name))
      const candidates = available.length ? available : list
      const choice = candidates[Math.floor(Math.random() * candidates.length)]

      this.recentHistory.push(choice.name)
      if (this.recentHistory.length > 3) {
        this.recentHistory.shift()
      }

      if (!this.history.includes(choice.name)) {
        this.history.push(choice.name)
        storage.setItem('today-food-history', this.history)
      }
      return choice
    },
    
    clearHistory() {
      // 尽管历史记录不显示了，但清空逻辑和存储仍然保留，以防将来需要
      this.history = []
      this.recentHistory = []
      storage.removeItem('today-food-history')
    },
    
    addFoodItem(type, name, materials, nutrition, tags) {
      if (!this.menu[type]) {
        this.menu[type] = [];
      }
      if (this.menu[type].some(item => item.name === name)) {
        console.warn(`${name} 已经存在于 ${type} 菜单中`);
        return;
      }

      this.menu[type].push({ name, materials, nutrition, tags });
      _saveMenuToStorage(this.menu);
    },

    removeFoodItem(type, name) {
      if (this.menu[type]) {
        const index = this.menu[type].findIndex(item => item.name === name);
        if (index !== -1) {
          this.menu[type].splice(index, 1);
          _saveMenuToStorage(this.menu);
        }
      }
    },
    
    resetMenu() {
        this.menu = JSON.parse(JSON.stringify(defaultMenu)); 
        _saveMenuToStorage(this.menu);
    }
  }
})
"""

# 1.2 主页文件 (src/pages/index/index.vue) - 【菜单管理按钮位置修复】
INDEX_VUE_CONTENT = """
<template>
  <view class="container">
    <view class="h1">🍓 今天吃什么</view>

    <button class="manage-menu" @click="goToSettings" :disabled="isShuffling">
        ⚙️ 管理菜单
    </button>

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

    <transition name="shuffle">
      <view class="card" v-if="food" :key="food.name">
        <view class="food-name">{{ food.name }}</view>
        
        <view class="nutrition-indicators">
          <view class="indicator-item">
            <view class="icon-label">热量</view>
            <view class="icon-display calorie">
              <text v-for="i in getLevelCount(food.nutrition.calorie)" :key="'c' + i" class="icon-chili">🌶️</text>
            </view>
          </view>
          <view class="indicator-item">
            <view class="icon-label">蛋白</view>
            <view class="icon-display protein">
              <text v-for="i in getLevelCount(food.nutrition.protein)" :key="'p' + i" class="icon-muscle">💪</text>
            </view>
          </view>
          <view class="indicator-item">
            <view class="icon-label">脂肪</view>
            <view class="icon-display fat">
              <text v-for="i in getLevelCount(food.nutrition.fat)" :key="'f' + i" class="icon-drop">💧</text>
            </view>
          </view>
        </view>

        <view class="materials">
          <view class="materials-title">🧺 食材</view>
          <view class="materials-list">
            <view v-for="m in food.materials" :key="m" class="materials-item">• {{ m }}</view>
          </view>
        </view>
      </view>
      
      <view class="card shuffling-card" v-else-if="isShuffling">
        <view class="food-name blinking">{{ shufflingText || '🤔 随机中...' }}</view>
      </view>

       <view class="card" v-else-if="!isShuffling && (!foodStore.menu[current] || foodStore.menu[current].length === 0)">
            <view class="food-name">当前菜单为空 🥺</view>
            <view class="materials-title">请点击 **管理菜单** 添加菜品</view>
        </view>
    </transition>

    <view class="btn-group">
      <button class="pick" @click="pickFood" :disabled="isShuffling || !foodStore.menu[current] || foodStore.menu[current].length === 0">
        <view v-if="isShuffling">⏳ 随机中...</view>
        <view v-else>🎲 随机一个</view>
      </button>
      <button class="shopping" @click="generateShoppingList" :disabled="isShuffling || !food">🛒 买菜清单</button>
      <button class="clear-history" @click="clearHistory" :disabled="isShuffling || foodStore.history.length === 0">🗑️ 清空历史</button>
    </view>

    <view class="shopping-modal-overlay" v-if="shoppingList.length" @click="shoppingList=[]">
      <view class="shopping-modal" @click.stop>
        <view class="h3">🛒 购买清单</view>
        <view class="materials-list">
          <view v-for="m in shoppingList" :key="m" class="materials-item">• {{ m }}</view>
        </view>
        <button class="close-modal" @click="shoppingList=[]">关闭</button>
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
      food: null,
      shoppingList: [],
      isShuffling: false, 
      shufflingText: '',
    }
  },
  methods: {
    // 辅助方法：将营养等级文字转换为图标数量
    getLevelCount(level) {
      const map = {
        '低': 1,
        '中': 2,
        '高': 3,
        '极高': 4, // 仅用于热量
        'default': 1
      };
      return map[level] || map['default'];
    },
    
    // 随机选菜逻辑 (不变)
    pickFood() {
      if (this.isShuffling) return;
      
      this.isShuffling = true;
      this.food = null; 

      let count = 0;
      const shuffleInterval = setInterval(() => {
        const list = this.foodStore.menu[this.current] || [];
        const randomItem = list[Math.floor(Math.random() * list.length)];
        this.shufflingText = randomItem ? randomItem.name : '思考中...';
        count++;

        if (count >= 15) { 
          clearInterval(shuffleInterval);
          this.shufflingText = '';
          this.food = this.foodStore.pickFood(this.current);
          this.isShuffling = false;
        }
      }, 100);
    },
    
    // 其他操作 (不变)
    switchTab(key) {
      this.current = key
      this.food = null
      this.shoppingList = []
      this.isShuffling = false
    },
    
    generateShoppingList() {
      if (!this.food) return
      this.shoppingList = this.food.materials
    },
    
    clearHistory() {
      this.foodStore.clearHistory()
      this.food = null 
      this.shoppingList = []
    },
    
    // 导航修复与提示 (不变)
    goToSettings() {
      if (typeof uni !== 'undefined' && uni.navigateTo) {
        uni.navigateTo({
          url: '/pages/settings/settings'
        });
      } else {
        alert('导航失败！当前环境不支持 uni.navigateTo。请在 HBuilderX 中运行App/H5，或配置 Vue Router。');
      }
    }
  }
}
</script>

<style>
/* 全局容器和标题样式 */
.container {
  max-width: 420px; /* 限制最大宽度以模拟手机屏幕 */
  margin: 0 auto; 
  padding: 0 15px 30px; 
}

.h1 {
  font-size: 28px;
  font-weight: bold;
  color: #ff69b4;
  /* 标题居中 */
  margin: 0 auto 20px auto; 
  text-align: center; 
  display: block; 
  width: fit-content; 
}
.h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

/* 菜单管理按钮 */
.manage-menu {
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  background: #ffd1dc;
  color: #ff69b4;
  font-size: 14px;
  margin-top: -10px; /* <-- 调整为 -10px，使其更低 */
  margin-bottom: 20px; 
  transition: transform 0.1s ease;
  line-height: normal;
  
  /* 居中保持不变 */
  display: block; 
  margin-left: auto;
  margin-right: auto;
}
.manage-menu:active {
  transform: scale(0.95);
}

/* Tabs 切换 */
.tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}
.tabs button {
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  background: #ffd1dc;
  color: #333;
  transition: background 0.2s, transform 0.1s;
  line-height: normal;
}
.tabs button.active {
  background: #ff69b4;
  color: white;
}
.tabs button:active {
    transform: scale(0.98);
}

/* 菜品卡片 */
.card {
  background: white;
  padding: 30px 20px;
  border-radius: 20px;
  margin: 20px 0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.food-name {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 15px;
}

/* 营养指标样式 */
.nutrition-indicators {
    display: flex;
    justify-content: space-around;
    padding: 10px 0;
    margin-bottom: 20px;
    border-top: 1px dashed #eee;
    border-bottom: 1px dashed #eee;
}
.indicator-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
}
.icon-label {
    font-size: 12px;
    color: #999;
    margin-bottom: 5px;
}
.icon-display {
    font-size: 16px;
    line-height: 1;
}
.icon-chili { color: #ff4500; }
.icon-muscle { color: #007bff; }
.icon-drop { color: #4682b4; }


/* 食材列表 */
.materials-title {
  font-size: 14px;
  color: #ff69b4;
  margin-bottom: 8px;
}
.materials-list {
  padding: 0;
  margin: 0;
  text-align: left;
}
.materials-item {
  font-size: 14px;
  margin: 4px 0;
  padding: 2px 0;
}

/* 按钮组 */
.btn-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}
.btn-group button {
  flex: 1;
  border: none;
  padding: 12px 0;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: bold;
  transition: transform 0.1s ease;
  line-height: normal;
}
.btn-group button:active {
  transform: scale(0.95);
}
.btn-group .pick { background: #ff69b4; }
.btn-group .shopping { background: #55acee; }
.btn-group .clear-history { background: #aaaaaa; }
.btn-group button[disabled] { background: #ccc; cursor: not-allowed; }

/* 洗牌动画 */
.shuffling-card {
    background-color: #f7f7f7;
    border: 2px dashed #ff69b4;
}
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
.blinking {
  animation: blink 0.5s infinite;
  color: #ff69b4 !important;
  font-size: 26px !important;
}

/* Modal 弹窗 */
.shopping-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.shopping-modal {
  background: white;
  padding: 25px;
  border-radius: 12px;
  max-width: 90%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
.close-modal {
    margin-top: 15px;
    background: #ff69b4;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px;
    line-height: normal;
}

/* 过渡动画 */
.shuffle-enter-active,
.shuffle-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.shuffle-enter-from,
.shuffle-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
"""

# 1.3 菜单管理页文件 (src/pages/settings/settings.vue) - 保持不变
SETTINGS_VUE_CONTENT = """
<template>
  <view class="settings-container">
    <view class="h2">🍽️ 菜单管理</view>

    <view class="section-card add-form">
      <view class="h3">✨ 新增自定义菜品</view>
      
      <view class="input-group">
        <input class="uni-input" v-model="newItem.name" placeholder="菜品名称 (例如: 番茄炒蛋)" />
      </view>
      <view class="input-group">
        <input class="uni-input" v-model="newItem.materialsInput" placeholder="所需食材 (逗号分隔, 例如: 番茄,鸡蛋,葱)" />
      </view>
      
      <view class="input-group uni-select-wrapper">
        <select v-model="newItem.nutrition.calorie" class="uni-select">
          <option disabled value="">热量估算 (Calorie)</option>
          <option value="低">低 (🌶️)</option>
          <option value="中">中 (🌶️🌶️)</option>
          <option value="高">高 (🌶️🌶️🌶️)</option>
          <option value="极高">极高 (🌶️🌶️🌶️🌶️)</option>
        </select>
        <view class="select-arrow">▼</view>
      </view>
      
      <view class="input-group uni-select-wrapper">
        <select v-model="newItem.type" class="uni-select">
          <option disabled value="">请选择餐次</option>
          <option v-for="t in tabs" :key="t.key" :value="t.key">{{ t.label }}</option>
        </select>
        <view class="select-arrow">▼</view>
      </view>
      
      <button class="add-btn" @click="addNewFood" :disabled="!isFormValid">
        + 添加到菜单
      </button>
    </view>
    
    <view class="section-card menu-list">
      <view class="h3">📚 当前菜单列表</view>
      
      <button class="reset-btn" @click="resetMenu">重置为默认菜单</button>

      <view v-for="t in tabs" :key="t.key" class="menu-category">
        <view class="h4">{{ t.label }} ({{ foodStore.menu[t.key] ? foodStore.menu[t.key].length : 0 }})</view>
        
        <view class="food-items-list">
          <view v-if="foodStore.menu[t.key] && foodStore.menu[t.key].length > 0">
              <view v-for="food in foodStore.menu[t.key]" :key="food.name" class="food-item-card">
                <view class="food-info">
                    <view class="food-name-text">{{ food.name }}</view>
                    <view class="materials-text">食材：{{ food.materials.join('、') }}</view>
                </view>
                <button class="delete-btn" @click="removeFood(t.key, food.name)">删除</button>
              </view>
          </view>
          <view v-else class="empty-list">该餐次暂无菜品</view>
        </view>
      </view>
    </view>
    
  </view>
</template>

<script>
import { reactive, computed } from 'vue';
import { useFoodStore } from '../../stores/food';

export default {
  setup() {
    const foodStore = useFoodStore();

    const tabs = [
      { key: 'breakfast', label: '早餐' },
      { key: 'lunch', label: '午餐' },
      { key: 'dinner', label: '晚餐' }
    ];

    const newItem = reactive({
      name: '',
      materialsInput: '', 
      type: '',
      // 简化营养数据：用户只需填写热量，蛋白质/脂肪默认给中低
      nutrition: { calorie: '', protein: '中', fat: '中' }, 
      tags: [] 
    });
    
    const isFormValid = computed(() => {
        return newItem.name.trim() !== '' && 
               newItem.materialsInput.trim() !== '' && 
               newItem.type !== '' && 
               newItem.nutrition.calorie !== '';
    });

    const addNewFood = () => {
      if (!isFormValid.value) return;

      const materialsArray = newItem.materialsInput.split(',').map(m => m.trim()).filter(m => m.length > 0);
      
      foodStore.addFoodItem(
        newItem.type, 
        newItem.name, 
        materialsArray,
        { 
            calorie: newItem.nutrition.calorie,
            protein: '中', 
            fat: '中' 
        },
        newItem.tags
      );
      
      // 清空表单
      newItem.name = '';
      newItem.materialsInput = '';
      newItem.type = '';
      newItem.nutrition.calorie = '';
      
      if (typeof uni !== 'undefined' && uni.showToast) {
         uni.showToast({ title: '添加成功', icon: 'success', duration: 1500 });
      } else {
         alert('添加成功！');
      }
    };

    const removeFood = (type, name) => {
      if (typeof uni !== 'undefined' && uni.showModal) {
         uni.showModal({
            title: '确认删除',
            content: `确定要从菜单中删除 ${name} 吗?`,
            success: (res) => {
                if (res.confirm) {
                    foodStore.removeFoodItem(type, name);
                }
            }
         });
      } else if (confirm(`确定要从菜单中删除 ${name} 吗?`)) {
        foodStore.removeFoodItem(type, name);
      }
    };
    
    const resetMenu = () => {
        if (typeof uni !== 'undefined' && uni.showModal) {
             uni.showModal({
                title: '确认重置',
                content: '确定要将菜单重置为初始默认值吗? 此操作不可撤销。',
                success: (res) => {
                    if (res.confirm) {
                         foodStore.resetMenu();
                         uni.showToast({ title: '菜单已重置', icon: 'none', duration: 1500 });
                    }
                }
             });
        } else if (confirm('确定要将菜单重置为初始默认值吗?')) {
            foodStore.resetMenu();
            alert('菜单已重置');
        }
    }

    return { foodStore, tabs, newItem, addNewFood, removeFood, resetMenu, isFormValid };
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 420px;
  margin: 0 auto;
  padding: 20px 15px;
  text-align: left;
}
.h2 { font-size: 24px; color: #ff69b4; text-align: center; margin-bottom: 25px; font-weight: bold; }
.h3 { font-size: 18px; color: #333; margin-top: 0; padding-bottom: 5px; font-weight: bold; }
.h4 { font-size: 16px; color: #ff69b4; margin-top: 15px; margin-bottom: 8px; font-weight: 600; border-left: 3px solid #ff69b4; padding-left: 10px; }

.section-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  margin-bottom: 25px;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.input-group { position: relative; width: 100%; }
.uni-input {
  padding: 12px 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
}
.uni-select-wrapper {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    background: #fcfcfc;
}
.uni-select {
  appearance: none; -webkit-appearance: none; -moz-appearance: none;
  width: 100%; padding: 12px 30px 12px 10px; border: none; background-color: transparent;
  font-size: 14px;
}
.select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #999; pointer-events: none; }

.add-btn {
  padding: 12px; border: none; border-radius: 8px; background: #ff69b4; color: white;
  transition: transform 0.2s; font-weight: bold;
}
.add-btn:active { transform: scale(0.98); }
.add-btn[disabled] { background: #ccc; cursor: not-allowed; }


.food-items-list { display: flex; flex-direction: column; gap: 10px; }
.food-item-card {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px; background: #fff7fb; border-radius: 8px; border-left: 5px solid #ff69b4;
}
.food-info { flex-grow: 1; }
.food-name-text { font-weight: 600; font-size: 15px; color: #333; }
.materials-text { color: #999; font-size: 12px; margin-top: 3px; }
.delete-btn {
  background: #ff7f7f; color: white; border: none; padding: 6px 12px; border-radius: 5px;
  font-size: 12px; margin-left: 15px; line-height: normal; transition: transform 0.2s;
}
.delete-btn:active { transform: scale(0.95); }

.reset-btn {
    display: block; width: 100%; margin-top: 20px; padding: 10px;
    background: #ffd1dc; color: #ff69b4; border: 1px solid #ff69b4; border-radius: 8px;
    font-weight: bold; transition: background 0.2s, color 0.2s;
}
.reset-btn:active { background: #ff69b4; color: white; }
.empty-list {
    text-align: center;
    color: #999;
    padding: 10px;
    font-style: italic;
}
</style>
"""

# 1.4 - 1.9 其他文件内容保持不变 (main.js, pages.json, etc.)
MAIN_JS_CONTENT = """
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './src/pages/index/index.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
"""

PAGES_JSON_CONTENT = """
{
  "pages":[
    {"path":"pages/index/index","style":{"navigationBarTitleText":"今天吃什么","navigationBarTextStyle":"white","navigationBarBackgroundColor":"#ff69b4","backgroundColor":"#fff7fb"}},
    {"path":"pages/settings/settings","style":{"navigationBarTitleText":"菜单管理","navigationBarTextStyle":"white","navigationBarBackgroundColor":"#ff69b4","backgroundColor":"#fff7fb"}}
  ],
  "globalStyle":{
    "navigationBarTextStyle":"white",
    "navigationBarTitleText":"今天吃什么",
    "navigationBarBackgroundColor":"#ff69b4",
    "backgroundColor":"#fff7fb"
  },
  "uniIdRouter":{}
}
"""

APP_VUE_CONTENT = """
<template><slot /></template><script>export default { onLaunch() {console.log('App Launch')}, onShow() {console.log('App Show')}, onHide() {console.log('App Hide')} }</script><style>body,html{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC';background-color:#fff7fb;}</style>
"""

INDEX_HTML_CONTENT = """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>今天吃什么</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/main.js"></script>
</body>
</html>
"""

VITE_CONFIG_CONTENT = """
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({ base: './', plugins: [vue()], server: { port: 5173 }, build: { target: 'es2015' } })
"""

PACKAGE_JSON_PATH = 'package.json'
try:
    with open(PACKAGE_JSON_PATH, 'r', encoding='utf-8') as f:
        package_data = json.load(f)
except FileNotFoundError:
    package_data = {
      "name": "optimized-what-to-eat-app",
      "version": "1.0.0",
      "scripts": {"dev": "vite", "build": "vite build"},
      "dependencies": {"vue": "^3.4.0"},
      "devDependencies": {"vite": "^5.0.0", "@vitejs/plugin-vue": "^5.0.0"}
    }
if 'dependencies' not in package_data:
    package_data['dependencies'] = {}
package_data['dependencies']['pinia'] = '^2.1.7' 

PACKAGE_JSON_CONTENT = json.dumps(package_data, indent=2, ensure_ascii=False)


# --- 2. 文件路径列表 ---
FILE_MAPPING = {
    'main.js': MAIN_JS_CONTENT,
    'pages.json': PAGES_JSON_CONTENT,
    'index.html': INDEX_HTML_CONTENT,
    'vite.config.js': VITE_CONFIG_CONTENT,
    'App.vue': APP_VUE_CONTENT,
    'package.json': PACKAGE_JSON_CONTENT,
    'src/stores/food.js': FOOD_STORE_CONTENT,
    'src/pages/index/index.vue': INDEX_VUE_CONTENT,
    'src/pages/settings/settings.vue': SETTINGS_VUE_CONTENT,
}

# --- 3. 核心执行逻辑 ---
def generate_and_zip_project(file_map):
    zip_filename = 'optimized_what_to_eat_final_v5.zip'
    temp_dir = 'temp_optimized_project_v5'
    
    os.makedirs(temp_dir, exist_ok=True)
    
    for filepath, content in file_map.items():
        full_path = os.path.join(temp_dir, filepath)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(temp_dir):
            for file in files:
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, temp_dir)
                zf.write(full_path, arcname)

    import shutil
    shutil.rmtree(temp_dir)
    
    print(f"\n🎉 恭喜！项目已设计并打包完成为 '{zip_filename}'")
    print("---------------------------------------------------------")
    print("本次最终修改要点：")
    print("1. **降低** 主页“⚙️ 管理菜单”按钮的位置（`margin-top` 从 `-30px` 调整到 `-10px`）。")
    print("2. 确认标题和按钮都已居中。")
    print("3. 包含完整 Uni-app + Vue3 + Pinia 菜单随机器功能。")


if __name__ == '__main__':
    generate_and_zip_project(FILE_MAPPING)