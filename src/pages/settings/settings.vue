<template>
  <view class="container">
    <view class="h1">⚙️ 菜单管理</view>
    <view class="h3-tip">在此页面您可以查看、添加、删除菜品，并重置为默认菜单。</view>

    <view class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        :class="{ active: current === t.key }"
        @click="switchTab(t.key)"
      >
        {{ t.label }}
      </button>
    </view>
    
    <view class="menu-list-section">
      <view class="h2">{{ currentLabel }} 菜品列表 ({{ currentMenu.length }} 道)</view>
      
      <view class="food-item" v-for="(food, index) in currentMenu" :key="index">
        <text class="food-name">{{ food.name }}</text>
        <button class="delete-btn" @click="deleteFood(food.name)">删除</button>
      </view>
      
      <view class="no-data" v-if="currentMenu.length === 0">
          该餐次下暂无菜品，请添加。
      </view>
    </view>

    <view class="add-section">
      <view class="h2">➕ 添加新菜品</view>
      <input v-model="newItem.name" placeholder="菜品名称 (如：红烧肉)" class="input-field" />
      <input v-model="newItem.materials" placeholder="主要食材 (如：五花肉, 酱油)" class="input-field" />
      
      <view class="select-row">
          <view>热量:</view>
          <picker @change="bindPickerChange('calorie', $event)" :value="nutritionIndex.calorie" :range="nutritionLevels">
              <view class="picker">{{ nutritionLevels[nutritionIndex.calorie] }}</view>
          </picker>
          <view>蛋白:</view>
          <picker @change="bindPickerChange('protein', $event)" :value="nutritionIndex.protein" :range="nutritionLevels">
              <view class="picker">{{ nutritionLevels[nutritionIndex.protein] }}</view>
          </picker>
      </view>
      <input v-model="newItem.tags" placeholder="标签 (如：家常, 杭帮, 用逗号分隔)" class="input-field" />
      
      <button class="add-btn" @click="addFoodItem">添加菜品到 {{ currentLabel }}</button>
    </view>
    
    <button class="reset-btn" @click="resetMenu">
      ♻️ 重置菜单为默认 (⚠️ 将删除所有自定义添加的菜品)
    </button>
  </view>
</template>

<script>
import { useFoodStore } from '../../stores/food';

export default {
  setup() {
    const foodStore = useFoodStore();
    return { foodStore };
  },
  data() {
    return {
      tabs: [
        { key: 'breakfast', label: '早餐' },
        { key: 'lunch', label: '午餐' },
        { key: 'dinner', label: '晚餐' }
      ],
      current: 'breakfast',
      nutritionLevels: ['低', '中', '高', '极高'],
      nutritionIndex: { calorie: 1, protein: 1, fat: 1 }, // 默认选中'中'
      newItem: {
        name: '',
        materials: '', // 逗号分隔字符串
        tags: '',     // 逗号分隔字符串
        nutrition: { calorie: '中', protein: '中', fat: '中' }
      }
    };
  },
  computed: {
    currentMenu() {
      return this.foodStore.menu[this.current] || [];
    },
    currentLabel() {
      return this.tabs.find(t => t.key === this.current)?.label || '';
    }
  },
  methods: {
    switchTab(key) {
      this.current = key;
    },
    bindPickerChange(type, e) {
      this.nutritionIndex[type] = e.detail.value;
      this.newItem.nutrition[type] = this.nutritionLevels[e.detail.value];
    },
    deleteFood(name) {
      if (confirm(`确定要删除 ${name} 吗？`)) {
        this.foodStore.removeFoodItem(this.current, name);
        uni.showToast({ title: '删除成功', icon: 'success' });
      }
    },
    addFoodItem() {
      if (!this.newItem.name || !this.newItem.materials) {
        uni.showToast({ title: '请填写完整的菜品信息', icon: 'none' });
        return;
      }

      // 处理材料和标签为数组
      const materialsArray = this.newItem.materials.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const tagsArray = this.newItem.tags.split(',').map(s => s.trim()).filter(s => s.length > 0);

      this.foodStore.addFoodItem(
        this.current,
        this.newItem.name,
        materialsArray,
        this.newItem.nutrition,
        tagsArray
      );
      
      uni.showToast({ title: `${this.newItem.name} 添加成功`, icon: 'success' });
      
      // 清空表单
      this.newItem.name = '';
      this.newItem.materials = '';
      this.newItem.tags = '';
    },
    resetMenu() {
      if (confirm('⚠️ 警告！确定要重置菜单吗？所有自定义菜品将被删除，恢复为默认的杭州四季菜单。')) {
        this.foodStore.resetMenu();
        uni.showToast({ title: '菜单已重置为默认', icon: 'success' });
      }
    }
  }
};
</script>

<style scoped>
.container { padding: 20px 15px; max-width: 420px; margin: 0 auto; }
.h1 { font-size: 24px; font-weight: bold; color: #ff69b4; margin-bottom: 5px; text-align: center; }
.h3-tip { font-size: 12px; color: #999; text-align: center; margin-bottom: 20px; }
.h2 { font-size: 16px; font-weight: bold; color: #333; margin: 15px 0 10px; border-left: 4px solid #ff69b4; padding-left: 8px; }

/* Tabs 样式 */
.tabs { display: flex; justify-content: space-around; margin-bottom: 15px; }
.tabs button {
  flex: 1; border: none; padding: 8px 10px; border-radius: 20px;
  background: #eee; color: #666; transition: background 0.2s;
  font-size: 13px; margin: 0 4px;
}
.tabs button.active { background: #ff69b4; color: white; }

/* 列表样式 */
.menu-list-section { background: #fff; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); }
.food-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px dashed #eee;
}
.food-item:last-child { border-bottom: none; }
.food-name { font-size: 14px; color: #333; flex-grow: 1; }
.delete-btn {
  background: #f44336; color: white; border: none; padding: 4px 8px;
  border-radius: 5px; font-size: 12px; margin-left: 10px;
  line-height: normal; /* 修复 uni-app 默认行高 */
  height: 28px;
}
.no-data { text-align: center; color: #999; padding: 10px; font-size: 13px; }

/* 添加菜品表单 */
.add-section { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px; }
.input-field {
  width: 100%; height: 36px; line-height: 36px; padding: 0 10px;
  border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px;
  font-size: 14px; box-sizing: border-box;
}
.add-btn {
  background: #4caf50; color: white; border: none; padding: 10px;
  border-radius: 5px; font-size: 15px; font-weight: bold; margin-top: 10px;
}
.reset-btn {
  background: #ccc; color: #333; border: none; padding: 10px;
  border-radius: 5px; font-size: 14px; margin-top: 20px;
}
.select-row {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
    font-size: 14px; color: #666;
}
.picker {
    border: 1px solid #ddd; border-radius: 5px; padding: 5px 10px; min-width: 60px; text-align: center;
    color: #333;
}
</style>