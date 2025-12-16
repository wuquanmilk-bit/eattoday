import { defineStore } from 'pinia'

// 模拟 uni.getStorageSync 和 uni.setStorageSync
const storage = {
  getItem: (key) => {
    try {
      if (typeof uni !== 'undefined' && uni.getStorageSync) {
        return uni.getStorageSync(key)
      }
      return localStorage.getItem(key)
    } catch (e) {
      console.error('Storage read failed', e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      const data = JSON.stringify(value);
      if (typeof uni !== 'undefined' && uni.setStorageSync) {
        uni.setStorageSync(key, data)
      } else {
        localStorage.setItem(key, data);
      }
    } catch (e) {
      console.error('Storage write failed', e);
    }
  },
  removeItem: (key) => {
    try {
      if (typeof uni !== 'undefined' && uni.removeStorageSync) {
        uni.removeStorageSync(key)
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('Storage remove failed', e);
    }
  }
}

// 私有函数：将菜单保存到本地存储
const _saveMenuToStorage = (menu) => {
  storage.setItem('today-food-menu', menu);
}

// 私有函数：从本地存储加载菜单
const _loadMenuFromStorage = () => {
  const data = storage.getItem('today-food-menu');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object' && parsed.breakfast) {
          return parsed;
      }
    } catch (e) {
      console.error('Failed to parse menu from storage', e);
    }
  }
  return null;
}

// 私有函数：获取当前格式化日期 (YYYY-MM-DD)
const _getCurrentDateKey = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- 默认菜单数据 ---
const defaultMenu = {
  breakfast: [
    { name: '🍜 片儿川面', materials: ['面条', '笋片', '雪菜', '猪肉片', '高汤'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["杭帮", "面食", "经典"] },
    { name: '🥟 菜肉大馄饨', materials: ['馄饨皮', '猪肉馅', '青菜', '蛋皮丝'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["汤水", "饱腹"] },
    { name: '🍞 烧饼夹油条', materials: ['烧饼', '油条', '榨菜'], nutrition: { calorie: "高", protein: "中", fat: "高" }, tags: ["传统", "油炸"] },
    { name: '🥣 小笼包', materials: ['面皮', '猪肉馅', '姜丝醋'], nutrition: { calorie: "高", protein: "中", fat: "中" }, tags: ["小吃", "汤包"] },
    { name: '🍚 泡饭配酱瓜腐乳', materials: ['白米饭', '热水', '酱瓜', '腐乳'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["清淡", "简易"] },
    { name: '🍚 粢饭团/粢饭糕', materials: ['糯米饭', '油条', '肉松', '咸蛋黄'], nutrition: { calorie: "极高", protein: "中", fat: "高" }, tags: ["饱腹", "油炸"] },
    { name: '🥣 咸豆浆', materials: ['豆浆', '油条碎', '虾皮', '榨菜', '葱花'], nutrition: { calorie: "低", protein: "中", fat: "低" }, tags: ["清淡", "汤水"] },
    { name: '🥟 生煎/葱煎馒头', materials: ['馒头/包子', '葱花', '猪肉馅'], nutrition: { calorie: "高", protein: "中", fat: "高" }, tags: ["老底子", "油煎"] },
    { name: '🍜 葱油拌面', materials: ['面条', '葱油', '酱油', '麻油'], nutrition: { calorie: "中", protein: "低", fat: "中" }, tags: ["快手", "面食"] },
    { name: '🥣 酒酿圆子', materials: ['糯米圆子', '酒酿', '鸡蛋', '桂花'], nutrition: { calorie: "中", protein: "低", fat: "低" }, tags: ["甜品", "暖身"] },
  ],
  lunch: [
    { name: '🍜 雪菜笋片肉丝面', materials: ['面条', '雪菜', '笋片', '猪肉丝'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["春季", "杭帮", "面食"] },
    { name: '🍜 青菜肉丝年糕', materials: ['年糕', '猪肉丝', '青菜', '雪菜'], nutrition: { calorie: "高", protein: "中", fat: "中" }, tags: ["冬季", "饱腹"] },
    { name: '🍚 菜肉泡饭', materials: ['剩饭', '青菜', '咸肉', '高汤'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["简易", "剩菜妙用"] },
    { name: '🍜 冷淘（凉面）', materials: ['面条', '黄瓜丝', '豆芽', '花生酱', '醋'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["夏季", "清淡", "冷食"] },
    { name: '🍚 蟹肉炒饭', materials: ['米饭', '蟹肉', '鸡蛋', '葱花'], nutrition: { calorie: "高", protein: "高", fat: "中" }, tags: ["秋季", "丰腴"] },
    { name: '🍜 前日汤下面', materials: ['面条', '腌笃鲜汤底/羊肉汤底', '青菜'], nutrition: { calorie: "中", "中": "中", fat: "低" }, tags: ["剩菜妙用", "汤面"] },
    { name: '🍛 日式咖喱饭', materials: ['鸡肉/牛肉', '土豆', '胡萝卜', '洋葱', '咖喱块', '米饭'], nutrition: { calorie: "高", protein: "中", fat: "中" }, tags: ["浓郁", "日式"] },
    { name: '🥗 鸡胸肉沙拉', materials: ['鸡胸肉', '混合生菜', '小番茄', '低脂油醋汁'], nutrition: { calorie: "低", protein: "高", fat: "低" }, tags: ["健身", "低卡"] },
  ],
  dinner: [
    { name: '🍲 腌笃鲜', materials: ['咸肉', '新鲜五花肉', '春笋', '百叶结', '高汤'], nutrition: { calorie: "高", protein: "高", fat: "高" }, tags: ["春季", "汤煲", "经典"] },
    { name: '🍄 油焖春笋', materials: ['春笋', '酱油', '白糖'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["春季", "时令", "素食"] },
    { name: '🍳 香椿炒蛋', materials: ['香椿芽', '鸡蛋'], nutrition: { calorie: "中", protein: "中", fat: "低" }, tags: ["春季", "野菜"] },
    { name: '🐟 清蒸步鱼', materials: ['步鱼', '葱丝', '姜片', '蒸鱼豉油'], nutrition: { calorie: "低", protein: "高", fat: "低" }, tags: ["春季", "江鲜", "清淡"] },
    { name: '🐚 酱爆螺蛳', materials: ['螺蛳', '葱姜蒜', '酱油', '辣椒'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["春季", "小炒"] },
    { name: '🥩 荷叶粉蒸肉', materials: ['五花肉', '米粉', '荷叶', '土豆/芋头'], nutrition: { calorie: "极高", protein: "高", fat: "极高" }, tags: ["夏季", "特色", "香糯"] },
    { name: '🦐 盐水河虾', materials: ['新鲜河虾', '葱姜', '盐水'], nutrition: { calorie: "低", protein: "高", fat: "低" }, tags: ["夏季", "清淡", "水产"] },
    { name: '🥒 蒜泥空心菜', materials: ['空心菜', '蒜蓉', '蚝油'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["夏季", "时蔬"] },
    { name: '🐟 清蒸白丝鱼', materials: ['白丝鱼', '葱姜', '蒸鱼豉油'], nutrition: { calorie: "低", protein: "高", fat: "低" }, tags: ["夏季", "清淡"] },
    { name: '🥣 冬瓜海带汤', materials: ['冬瓜', '海带', '排骨/虾皮'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["夏季", "汤水", "低卡"] },
    { name: '🦀 清蒸大闸蟹', materials: ['大闸蟹', '姜片', '黄酒', '姜茶'], nutrition: { calorie: "高", protein: "高", fat: "高" }, tags: ["秋季", "湖鲜", "大餐"] },
    { name: '🌰 栗子烧鸡', materials: ['鸡块', '栗子', '酱油', '冰糖'], nutrition: { calorie: "高", protein: "高", fat: "中" }, tags: ["秋季", "滋补", "浓郁"] },
    { name: '🦑 雪菜炒鱿鱼', materials: ['鱿鱼', '雪菜', '笋片', '猪肉丝'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["家常", "海鲜"] },
    { name: '🧅 葱油芋艿', materials: ['芋艿', '葱花', '猪油/色拉油'], nutrition: { calorie: "中", protein: "低", fat: "中" }, tags: ["秋季", "时令", "香糯"] },
    { name: '🐟 鱼头豆腐汤', materials: ['鱼头', '豆腐', '葱姜', '白胡椒'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["滋补", "汤水", "杭帮"] },
    { name: '🔥 羊肉煲', materials: ['羊肉', '白萝卜', '葱姜', '黄酒'], nutrition: { calorie: "极高", protein: "高", fat: "极高" }, tags: ["冬季", "滋补", "暖锅"] },
    { name: '🦆 酱鸭', materials: ['鸭子', '酱油', '黄酒', '冰糖'], nutrition: { calorie: "高", protein: "高", fat: "高" }, tags: ["冬季", "腌腊", "特色"] },
    { name: '🥩 笋干烧肉', materials: ['五花肉', '笋干', '酱油', '冰糖'], nutrition: { calorie: "极高", protein: "高", fat: "极高" }, tags: ["冬季", "浓郁", "下饭"] },
    { name: '🐟 红烧带鱼', materials: ['带鱼', '葱姜蒜', '酱油', '糖'], nutrition: { calorie: "高", protein: "高", fat: "高" }, tags: ["海鲜", "浓郁"] },
    { name: '🥬 冬腌菜炒肉片', materials: ['冬腌菜', '猪肉片', '辣椒'], nutrition: { calorie: "中", protein: "中", fat: "低" }, tags: ["冬季", "家常"] },
    { name: '🍲 火锅/暖锅', materials: ['牛羊肉', '丸子', '蔬菜', '豆腐', '粉丝'], nutrition: { calorie: "极高", protein: "高", fat: "极高" }, tags: ["冬季", "聚餐", "大餐"] },
  ],
}

const initialMenu = _loadMenuFromStorage() || defaultMenu;
const initialHistory = JSON.parse(storage.getItem('today-food-history') || '[]');
// 【新增】加载历史菜单记录
const initialDailyHistory = JSON.parse(storage.getItem('daily-menu-history') || '[]');


// Pinia Store 定义
export const useFoodStore = defineStore('food', {
  state: () => ({
    menu: initialMenu,
    history: initialHistory, // 存储所有被选过的菜名（用于去重）
    recentHistory: [], // 存储最近被随机到的菜名（用于短期去重）
    todayPlan: JSON.parse(storage.getItem('today-plan') || '{"breakfast":[], "lunch":[], "dinner":[]}'),
    // 【新增状态】: 存储每日已确定的菜单历史记录
    dailyMenuHistory: initialDailyHistory, 
  }),

  actions: {
    // 【修改】: 将菜品数组添加到今日菜单计划，并同步保存到历史记录
    addFoodToPlan(type, foodItems) {
        if (Array.isArray(foodItems) && this.menu[type]) {
            this.todayPlan[type] = foodItems; // 存储数组
            storage.setItem('today-plan', this.todayPlan);
            
            // 每次更新 plan 时，同步更新 dailyMenuHistory
            this.saveDailyPlanToHistory();
        }
    },
    
    // 【新增 Action】: 将 todayPlan 存入 dailyMenuHistory
    saveDailyPlanToHistory() {
        const dateKey = _getCurrentDateKey();
        
        // 检查今日菜单是否为空
        const hasFood = this.todayPlan.breakfast.length > 0 || 
                        this.todayPlan.lunch.length > 0 || 
                        this.todayPlan.dinner.length > 0;
        
        if (!hasFood) {
            // 如果今日计划为空，则从历史中删除该日记录（如果存在）
            this.dailyMenuHistory = this.dailyMenuHistory.filter(item => item.date !== dateKey);
        } else {
            // 构造或更新今日的菜单记录
            const existingIndex = this.dailyMenuHistory.findIndex(item => item.date === dateKey);
            
            // 创建一个只包含菜品名称的纯净对象用于存储
            const todayRecord = {
                date: dateKey,
                plan: {
                    breakfast: this.todayPlan.breakfast.map(d => d.name),
                    lunch: this.todayPlan.lunch.map(d => d.name),
                    dinner: this.todayPlan.dinner.map(d => d.name),
                }
            };

            if (existingIndex > -1) {
                // 更新现有记录
                this.dailyMenuHistory.splice(existingIndex, 1, todayRecord);
            } else {
                // 添加新记录，放在最前面
                this.dailyMenuHistory.unshift(todayRecord);
            }
        }
        
        // 保存历史记录到本地存储
        storage.setItem('daily-menu-history', this.dailyMenuHistory);
    },
    
    // 【新增 Action】: 从历史记录中复用某一天的菜单
    reuseDailyPlan(dateKey) {
        const record = this.dailyMenuHistory.find(item => item.date === dateKey);
        if (record) {
            const newPlan = { breakfast: [], lunch: [], dinner: [] };

            // 遍历历史记录中的菜名，从主菜单中找到完整的菜品对象
            const menuLookup = (name) => {
                for (const type in this.menu) {
                    const dish = this.menu[type].find(d => d.name === name);
                    if (dish) return dish;
                }
                return null;
            };

            for (const type of ['breakfast', 'lunch', 'dinner']) {
                record.plan[type].forEach(dishName => {
                    const dish = menuLookup(dishName);
                    if (dish) {
                        newPlan[type].push(dish);
                    }
                });
            }

            this.todayPlan = newPlan;
            storage.setItem('today-plan', this.todayPlan);
            return true;
        }
        return false;
    },

    // 【修改】：抽取多个菜品，并接受 count 参数
    pickFood(type, count = 1) {
      const list = this.menu[type] || []
      if (list.length === 0) return []
      
      const picked = [];
      const usedNames = new Set(this.recentHistory); 
      
      const actualCount = Math.min(count, list.length);
      let masterList = [...list];
      
      while (picked.length < actualCount && masterList.length > 0) {
          // 尝试从未被最近随机到的菜品中选择
          let availableCandidates = masterList.filter(item => !usedNames.has(item.name));
          let choice;

          if (availableCandidates.length > 0) {
             // 从可选项中随机选择
             const randomIndex = Math.floor(Math.random() * availableCandidates.length);
             choice = availableCandidates[randomIndex];
             // 从 masterList 中移除已选中的菜品，确保不重复
             masterList.splice(masterList.findIndex(i => i.name === choice.name), 1);
          } else {
             // 如果所有菜品都在 recentHistory 中，则从剩余的 masterList 中随机选择
             const tempIndex = Math.floor(Math.random() * masterList.length);
             choice = masterList[tempIndex];
             masterList.splice(tempIndex, 1);
          }
          
          if (choice) {
              picked.push(choice);
          } else {
              // 理论上不会发生，但以防万一
              break; 
          }
      }

      picked.forEach(choice => {
          this.recentHistory.push(choice.name);
          if (this.recentHistory.length > 5) { 
              this.recentHistory.shift();
          }
          if (!this.history.includes(choice.name)) {
              this.history.push(choice.name);
              storage.setItem('today-food-history', this.history);
          }
      });
      
      return picked
    },
    
    // 【修改】清空历史记录：清空历史、今日计划，并同步历史记录
    clearHistory() {
      this.history = []
      this.recentHistory = []
      storage.removeItem('today-food-history')
      
      this.todayPlan = {"breakfast":[], "lunch":[], "dinner":[]};
      storage.removeItem('today-plan');
      
      // 清空今日计划后，更新历史记录 (如果清空的是当日记录)
      this.saveDailyPlanToHistory(); 
    },
    
    // 添加菜品到菜单
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

    // 从菜单中删除菜品
    removeFoodItem(type, name) {
      if (this.menu[type]) {
        this.menu[type] = this.menu[type].filter(item => item.name !== name);
        _saveMenuToStorage(this.menu);
      }
    },
    
    // 重置菜单为默认菜单
    resetMenu() {
      this.menu = defaultMenu;
      _saveMenuToStorage(this.menu);
    },
  },
})