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
const defaultMenu = {
  breakfast: [
    // 原始早餐
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
    
    // 第一次扩充
    { name: '🍚 白粥配小菜', materials: ['大米', '榨菜', '肉松', '花生米'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["传统", "养胃"] },
    { name: '🥚 水煮蛋+牛奶', materials: ['鸡蛋', '牛奶', '全麦面包'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["营养", "快捷"] },
    { name: '🥟 锅贴', materials: ['饺子皮', '猪肉馅', '白菜', '葱花'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["煎制", "香脆"] },
    { name: '🍙 饭团', materials: ['米饭', '肉松', '油条', '榨菜'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["便携", "快手"] },
    { name: '🍜 番茄鸡蛋面', materials: ['面条', '番茄', '鸡蛋', '青菜'], nutrition: { calorie: "中", protein: "中", fat: "低" }, tags: ["家常", "营养"] },
    { name: '🥣 芝麻糊/藕粉', materials: ['芝麻糊粉', '热水', '坚果碎'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["甜品", "暖胃"] },
    { name: '🥪 三明治', materials: ['吐司', '火腿', '鸡蛋', '生菜'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["快手", "西式"] },
    
    // 第二次扩充
    { name: '🥣 咸豆腐脑', materials: ['豆腐脑', '虾皮', '紫菜', '葱花', '酱油'], nutrition: { calorie: "低", protein: "中", fat: "低" }, tags: ["传统", "汤水"] },
    { name: '🥐 可颂+咖啡', materials: ['可颂面包', '咖啡', '黄油', '果酱'], nutrition: { calorie: "中", protein: "低", fat: "中" }, tags: ["西式", "快捷"] },
    { name: '🍳 蛋饼卷', materials: ['鸡蛋', '面粉', '生菜', '火腿', '甜面酱'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["街头", "便携"] },
    { name: '🍙 紫菜包饭', materials: ['米饭', '紫菜', '黄瓜', '胡萝卜', '火腿'], nutrition: { calorie: "中", protein: "中", fat: "低" }, tags: ["日式", "冷食"] },
    { name: '🥣 小米粥', materials: ['小米', '红枣', '枸杞'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["养胃", "养生"] },
    { name: '🥚 茶叶蛋', materials: ['鸡蛋', '茶叶', '酱油', '香料'], nutrition: { calorie: "低", protein: "中", fat: "低" }, tags: ["方便", "街边"] },
    { name: '🍜 热干面', materials: ['碱水面', '芝麻酱', '萝卜丁', '葱花'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["武汉", "浓香"] },
    { name: '🥟 煎饺', materials: ['饺子', '面粉水', '油', '醋'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["煎制", "香脆"] },
    { name: '🥣 黑米粥', materials: ['黑米', '糯米', '花生', '红枣'], nutrition: { calorie: "中", protein: "中", fat: "低" }, tags: ["养生", "滋补"] },
    { name: '🥪 鸡蛋灌饼', materials: ['饼皮', '鸡蛋', '生菜', '甜面酱'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["街头", "快捷"] },
  ],
  lunch: [
    // 原始午餐
    { name: '🍜 雪菜笋片肉丝面', materials: ['面条', '雪菜', '笋片', '猪肉丝'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["春季", "杭帮", "面食"] },
    { name: '🍜 青菜肉丝年糕', materials: ['年糕', '猪肉丝', '青菜', '雪菜'], nutrition: { calorie: "高", protein: "中", fat: "中" }, tags: ["冬季", "饱腹"] },
    { name: '🍚 菜肉泡饭', materials: ['剩饭', '青菜', '咸肉', '高汤'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["简易", "剩菜妙用"] },
    { name: '🍜 冷淘（凉面）', materials: ['面条', '黄瓜丝', '豆芽', '花生酱', '醋'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["夏季", "清淡", "冷食"] },
    { name: '🍚 蟹肉炒饭', materials: ['米饭', '蟹肉', '鸡蛋', '葱花'], nutrition: { calorie: "高", protein: "高", fat: "中" }, tags: ["秋季", "丰腴"] },
    { name: '🍜 前日汤下面', materials: ['面条', '腌笃鲜汤底/羊肉汤底', '青菜'], nutrition: { calorie: "中", protein: "中", fat: "低" }, tags: ["剩菜妙用", "汤面"] },
    { name: '🍛 日式咖喱饭', materials: ['鸡肉/牛肉', '土豆', '胡萝卜', '洋葱', '咖喱块', '米饭'], nutrition: { calorie: "高", protein: "中", fat: "中" }, tags: ["浓郁", "日式"] },
    { name: '🥗 鸡胸肉沙拉', materials: ['鸡胸肉', '混合生菜', '小番茄', '低脂油醋汁'], nutrition: { calorie: "低", protein: "高", fat: "低" }, tags: ["健身", "低卡"] },
    
    // 第一次扩充
    { name: '🍅 番茄炒蛋盖饭', materials: ['米饭', '番茄', '鸡蛋', '葱花'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["经典", "下饭"] },
    { name: '🥔 青椒土豆丝盖饭', materials: ['米饭', '土豆', '青椒', '肉丝'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["家常", "爽口"] },
    { name: '🍆 鱼香茄子煲', materials: ['茄子', '肉末', '豆瓣酱', '米饭'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["下饭", "浓郁"] },
    { name: '🍖 红烧排骨饭', materials: ['米饭', '排骨', '土豆', '青红椒'], nutrition: { calorie: "高", protein: "高", fat: "高" }, tags: ["荤菜", "满足"] },
    { name: '🍄 香菇滑鸡饭', materials: ['米饭', '鸡腿肉', '香菇', '青菜'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["鲜嫩", "滋补"] },
    { name: '🥬 麻婆豆腐饭', materials: ['米饭', '嫩豆腐', '肉末', '豆瓣酱'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["川味", "麻辣"] },
    { name: '🥩 回锅肉', materials: ['五花肉', '蒜苗', '豆瓣酱', '米饭'], nutrition: { calorie: "高", protein: "中", fat: "高" }, tags: ["川菜", "下饭"] },
    { name: '🥦 蚝油生菜', materials: ['生菜', '蚝油', '蒜蓉', '米饭'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["清淡", "快捷"] },
    { name: '🍤 宫保鸡丁', materials: ['鸡胸肉', '花生', '黄瓜', '胡萝卜'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["经典", "酸甜"] },
    { name: '🍗 可乐鸡翅', materials: ['鸡翅', '可乐', '姜片', '米饭'], nutrition: { calorie: "高", protein: "中", fat: "中" }, tags: ["甜口", "孩子爱"] },
    { name: '🥒 木须肉', materials: ['猪肉', '黄瓜', '木耳', '鸡蛋'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["营养均衡", "家常"] },
    
    // 第二次扩充
    { name: '🥔 土豆烧鸡块', materials: ['鸡块', '土豆', '青红椒', '米饭'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["下饭", "浓郁"] },
    { name: '🍄 平菇炒肉片', materials: ['平菇', '猪肉', '青椒', '米饭'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["家常", "鲜嫩"] },
    { name: '🍅 西红柿鸡蛋面', materials: ['面条', '西红柿', '鸡蛋', '青菜'], nutrition: { calorie: "中", protein: "中", fat: "低" }, tags: ["面食", "简单"] },
    { name: '🥬 蒜蓉西兰花', materials: ['西兰花', '蒜蓉', '胡萝卜', '米饭'], nutrition: { calorie: "低", protein: "中", fat: "低" }, tags: ["健康", "清淡"] },
    { name: '🍆 红烧茄子', materials: ['茄子', '蒜末', '青红椒', '米饭'], nutrition: { calorie: "中", protein: "低", fat: "中" }, tags: ["下饭", "素菜"] },
    { name: '🍄 杏鲍菇炒牛肉', materials: ['杏鲍菇', '牛肉', '洋葱', '米饭'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["营养", "美味"] },
    { name: '🥒 西葫芦炒蛋', materials: ['西葫芦', '鸡蛋', '木耳', '米饭'], nutrition: { calorie: "低", protein: "中", fat: "低" }, tags: ["清淡", "快手"] },
    { name: '🍄 香菇油菜', materials: ['香菇', '小油菜', '蚝油', '米饭'], nutrition: { calorie: "低", protein: "中", fat: "低" }, tags: ["清淡", "健康"] },
    { name: '🥩 酱爆鸡丁', materials: ['鸡胸肉', '黄瓜', '花生', '甜面酱'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["京味", "下饭"] },
    { name: '🍅 罗宋汤配面包', materials: ['牛肉', '番茄', '卷心菜', '土豆', '面包'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["西式", "汤品"] },
    { name: '🍄 金针菇肥牛', materials: ['肥牛', '金针菇', '粉丝', '米饭'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["下饭", "浓郁"] },
    { name: '🥬 酸辣白菜', materials: ['白菜', '干辣椒', '醋', '米饭'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["开胃", "快手"] },
    { name: '🦐 虾仁炒饭', materials: ['米饭', '虾仁', '鸡蛋', '青豆'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["炒饭", "丰盛"] },
    { name: '🍄 口蘑炒肉', materials: ['口蘑', '猪肉', '青椒', '米饭'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["鲜香", "家常"] },
    { name: '🥩 梅菜扣肉', materials: ['五花肉', '梅干菜', '米饭'], nutrition: { calorie: "高", protein: "中", fat: "高" }, tags: ["下饭", "经典"] },
  ],
  dinner: [
    // 原始晚餐
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
    
    // 第一次扩充
    { name: '🐔 三杯鸡', materials: ['鸡腿', '九层塔', '姜蒜', '米酒'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["台湾菜", "香浓"] },
    { name: '🐷 糖醋里脊', materials: ['猪里脊', '番茄酱', '糖醋汁'], nutrition: { calorie: "高", protein: "中", fat: "中" }, tags: ["酸甜", "开胃"] },
    { name: '🍆 地三鲜', materials: ['土豆', '茄子', '青椒'], nutrition: { calorie: "中", protein: "低", fat: "中" }, tags: ["东北菜", "素菜"] },
    { name: '🦐 蒜蓉粉丝蒸虾', materials: ['虾', '粉丝', '蒜蓉', '葱花'], nutrition: { calorie: "中", protein: "高", fat: "低" }, tags: ["清淡", "鲜嫩"] },
    { name: '🥩 水煮肉片', materials: ['猪里脊', '豆芽', '青菜', '花椒'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["川菜", "麻辣"] },
    { name: '🍄 干锅花菜', materials: ['花菜', '五花肉', '干辣椒', '蒜苗'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["干锅", "下饭"] },
    { name: '🥒 黄瓜炒肉片', materials: ['黄瓜', '猪肉', '木耳', '胡萝卜'], nutrition: { calorie: "低", protein: "中", fat: "低" }, tags: ["清爽", "快手"] },
    { name: '🍅 番茄牛腩', materials: ['牛腩', '番茄', '土豆', '胡萝卜'], nutrition: { calorie: "高", protein: "高", fat: "中" }, tags: ["滋补", "汤菜"] },
    { name: '🦴 黄豆炖猪蹄', materials: ['猪蹄', '黄豆', '姜片', '料酒'], nutrition: { calorie: "高", protein: "高", fat: "高" }, tags: ["滋补", "美容"] },
    { name: '🥬 上汤娃娃菜', materials: ['娃娃菜', '皮蛋', '咸蛋', '高汤'], nutrition: { calorie: "低", protein: "中", fat: "低" }, tags: ["清淡", "汤菜"] },
    { name: '🐟 酸菜鱼', materials: ['鱼片', '酸菜', '豆芽', '粉丝'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["川菜", "开胃"] },
    { name: '🥚 肉末蒸蛋', materials: ['鸡蛋', '肉末', '葱花', '生抽'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["嫩滑", "下饭"] },
    { name: '🍲 白菜豆腐煲', materials: ['白菜', '豆腐', '五花肉', '粉丝'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["冬季", "暖身"] },
    { name: '🍄 茶树菇炒肉', materials: ['茶树菇', '五花肉', '青红椒'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["干香", "下饭"] },
    { name: '🥦 西兰花炒虾仁', materials: ['西兰花', '虾仁', '胡萝卜', '蒜片'], nutrition: { calorie: "低", protein: "高", fat: "低" }, tags: ["清淡", "健康"] },
    { name: '🥩 京酱肉丝', materials: ['猪里脊', '甜面酱', '豆腐皮', '黄瓜丝'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["京菜", "卷饼"] },
    { name: '🐂 葱爆牛肉', materials: ['牛肉', '大葱', '生抽', '料酒'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["快手", "下饭"] },
    { name: '🍳 韭菜炒蛋', materials: ['韭菜', '鸡蛋', '盐'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["简单", "时令"] },
    { name: '🍆 肉末茄子', materials: ['茄子', '肉末', '蒜蓉', '豆瓣酱'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["下饭", "家常"] },
    { name: '🦪 蛤蜊蒸蛋', materials: ['蛤蜊', '鸡蛋', '葱花', '生抽'], nutrition: { calorie: "低", protein: "高", fat: "低" }, tags: ["鲜嫩", "清淡"] },
    { name: '🥔 干煸豆角', materials: ['豆角', '肉末', '干辣椒', '花椒'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["川菜", "下饭"] },
    
    // 第二次扩充
    { name: '🐟 红烧鲫鱼', materials: ['鲫鱼', '葱姜蒜', '酱油', '糖'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["家常", "鲜美"] },
    { name: '🥩 粉蒸排骨', materials: ['排骨', '蒸肉粉', '土豆', '红薯'], nutrition: { calorie: "高", protein: "高", fat: "高" }, tags: ["软糯", "入味"] },
    { name: '🥬 白灼菜心', materials: ['菜心', '蚝油', '蒜蓉', '生抽'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["清淡", "健康"] },
    { name: '🍄 茶树菇老鸭汤', materials: ['老鸭', '茶树菇', '姜片', '枸杞'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["滋补", "汤品"] },
    { name: '🥩 孜然羊肉', materials: ['羊肉', '洋葱', '孜然', '辣椒面'], nutrition: { calorie: "高", protein: "高", fat: "高" }, tags: ["烧烤味", "下饭"] },
    { name: '🥒 凉拌黄瓜', materials: ['黄瓜', '蒜泥', '醋', '香油'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["凉菜", "开胃"] },
    { name: '🍲 毛血旺', materials: ['鸭血', '毛肚', '豆芽', '午餐肉', '花椒'], nutrition: { calorie: "高", protein: "高", fat: "高" }, tags: ["川菜", "麻辣"] },
    { name: '🐔 黄焖鸡米饭', materials: ['鸡腿', '土豆', '青椒', '香菇', '米饭'], nutrition: { calorie: "高", protein: "高", fat: "中" }, tags: ["快餐", "下饭"] },
    { name: '🥬 手撕包菜', materials: ['包菜', '干辣椒', '蒜片', '五花肉'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["爽脆", "下饭"] },
    { name: '🦀 香辣蟹', materials: ['螃蟹', '干辣椒', '花椒', '葱姜蒜'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["麻辣", "海鲜"] },
    { name: '🥩 菠萝咕咾肉', materials: ['猪肉', '菠萝', '青红椒', '番茄酱'], nutrition: { calorie: "高", protein: "中", fat: "中" }, tags: ["酸甜", "开胃"] },
    { name: '🍄 小鸡炖蘑菇', materials: ['鸡块', '干蘑菇', '粉条', '土豆'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["东北菜", "暖身"] },
    { name: '🥒 苦瓜炒蛋', materials: ['苦瓜', '鸡蛋', '豆豉'], nutrition: { calorie: "低", protein: "中", fat: "低" }, tags: ["清热", "夏季"] },
    { name: '🐟 豆瓣鱼', materials: ['鱼', '豆瓣酱', '葱姜蒜', '泡椒'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["川味", "下饭"] },
    { name: '🥩 椒盐排骨', materials: ['排骨', '椒盐', '蒜末', '青红椒'], nutrition: { calorie: "高", protein: "高", fat: "高" }, tags: ["香脆", "下酒"] },
    { name: '🥬 蒜蓉空心菜', materials: ['空心菜', '蒜蓉', '腐乳', '蚝油'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["清淡", "夏季"] },
    { name: '🦐 油焖大虾', materials: ['大虾', '葱姜', '料酒', '酱油'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["鲜美", "下饭"] },
    { name: '🥩 土豆炖牛肉', materials: ['牛肉', '土豆', '胡萝卜', '番茄'], nutrition: { calorie: "高", protein: "高", fat: "中" }, tags: ["滋补", "浓郁"] },
    { name: '🍄 蚝油杏鲍菇', materials: ['杏鲍菇', '蚝油', '青红椒', '蒜片'], nutrition: { calorie: "低", protein: "中", fat: "低" }, tags: ["素菜", "下饭"] },
    { name: '🥩 蚂蚁上树', materials: ['粉丝', '肉末', '豆瓣酱', '葱花'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["川菜", "下饭"] },
    { name: '🐔 辣子鸡丁', materials: ['鸡丁', '干辣椒', '花椒', '花生'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["麻辣", "下酒"] },
    { name: '🥬 蚝油生菜', materials: ['生菜', '蚝油', '蒜蓉', '生抽'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["快手", "清淡"] },
    { name: '🥩 洋葱炒肉', materials: ['洋葱', '猪肉', '青椒', '生抽'], nutrition: { calorie: "中", protein: "中", fat: "中" }, tags: ["家常", "下饭"] },
    { name: '🦪 蒜蓉扇贝', materials: ['扇贝', '粉丝', '蒜蓉', '葱花'], nutrition: { calorie: "中", protein: "高", fat: "低" }, tags: ["海鲜", "鲜美"] },
    { name: '🥩 红烧肉', materials: ['五花肉', '冰糖', '料酒', '生抽'], nutrition: { calorie: "高", protein: "中", fat: "高" }, tags: ["经典", "下饭"] },
    { name: '🍄 清炒荷兰豆', materials: ['荷兰豆', '腊肠', '蒜片', '胡萝卜'], nutrition: { calorie: "低", protein: "中", fat: "低" }, tags: ["清淡", "爽口"] },
    { name: '🥩 啤酒鸭', materials: ['鸭肉', '啤酒', '姜蒜', '香料'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["酒香", "浓郁"] },
    { name: '🥬 清炒莴笋', materials: ['莴笋', '胡萝卜', '蒜片'], nutrition: { calorie: "低", protein: "低", fat: "低" }, tags: ["清淡", "爽脆"] },
    { name: '🦀 葱姜炒蟹', materials: ['螃蟹', '葱姜', '料酒', '生抽'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["鲜香", "海鲜"] },
    { name: '🥩 水煮牛肉', materials: ['牛肉', '豆芽', '青菜', '花椒'], nutrition: { calorie: "中", protein: "高", fat: "中" }, tags: ["川菜", "麻辣"] },
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