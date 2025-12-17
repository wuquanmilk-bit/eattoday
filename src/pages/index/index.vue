<style>
/* 容器和基础样式 */
.container {
  max-width: 420px; 
  /* 移动端通常不需要固定 max-width，但在H5模式下保持居中 */
  margin: 0 auto; 
  /* 调整内边距，统一使用 rpx */
  padding: 0 30rpx 60rpx; 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  min-height: 100vh; /* 确保最小高度，避免底部按钮跑到屏幕外 */
}

/* 标题/日期居中区域 */
.h1 { 
    font-size: 56rpx; /* 字体加大，适应手机 */
    font-weight: 700; 
    color: #ff69b4; 
    margin-bottom: 10rpx; 
    text-align: center;
}
.current-date { 
    font-size: 28rpx; /* 字体加大 */
    color: #666; 
    text-align: center;
    margin-bottom: 20rpx; 
}


/* 【核心调整】管理菜单和历史菜单按钮组容器 */
.header-controls {
    display: flex;
    justify-content: center;
    gap: 20rpx; /* 增加间隔 */
    margin-bottom: 30rpx;
}
.manage-menu, .history-menu {
    flex-basis: 45%; 
    border: none; 
    padding: 10rpx 20rpx; 
    border-radius: 40rpx; /* 圆角增加 */
    font-size: 24rpx; /* 字体调整 */
    margin: 0; 
    line-height: 1; /* 核心修复：重置 button 的行高，避免高度异常 */
    height: 60rpx; /* 明确高度 */
    display: flex; /* 使用 Flex 确保内容居中 */
    justify-content: center;
    align-items: center;
}
.manage-menu {
    background: #fff0f5; color: #ff69b4;
    border: 1rpx solid #ff69b4; /* 增加边框，更明显 */
}
.history-menu {
    background: #e0f7fa; color: #00bcd4;
    border: 1rpx solid #00bcd4;
}
.manage-menu[disabled], .history-menu[disabled] {
    background: #eee !important;
    color: #999 !important;
}

/* 今日计划区域样式 */
.section-card {
    background-color: #f7f7f7;
    padding: 20rpx; 
    border-radius: 16rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
}
.h2-plan {
    font-size: 32rpx; 
    font-weight: bold;
    color: #444;
    margin-bottom: 20rpx; 
    display: flex;
    justify-content: space-between; /* 确保标题和按钮分开 */
    align-items: center;
}
.total-shopping-btn {
    background: #ff9800;
    color: white;
    font-size: 20rpx; 
    padding: 8rpx 16rpx; 
    border-radius: 30rpx;
    line-height: 1; 
    height: 48rpx;
    margin: 0; /* 移除默认 margin */
    display: flex;
    align-items: center;
}
.total-shopping-btn[disabled] {
    background: #ccc !important;
}

.plan-list {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
}
.plan-item {
    display: flex;
    align-items: center;
    padding: 10rpx 15rpx;
    background: white;
    border-radius: 8rpx;
    border: 1rpx solid #eee;
}
.plan-type {
    font-size: 26rpx;
    font-weight: 500;
    color: #777;
    margin-right: 20rpx;
    min-width: 100rpx; /* 确保类型宽度一致 */
}
.plan-name {
    font-size: 30rpx;
    color: #999;
    font-style: italic;
    flex-grow: 1;
}
.plan-name.selected {
    color: #333;
    font-weight: bold;
    font-style: normal;
}


/* Tabs 切换样式 */
.tabs {
  display: flex;
  justify-content: center; gap: 20rpx; margin: 40rpx 0;
}
.tabs button {
  flex: 1; 
  border: none; padding: 16rpx 32rpx; border-radius: 40rpx;
  background: #ffd1dc; color: #333; transition: background 0.2s, transform 0.1s;
  line-height: 1; /* 核心修复：重置 button 的行高 */
  font-size: 28rpx;
}
.tabs button.active { background: #ff69b4; color: white; }
.tabs button:active { transform: scale(0.98); }
.tabs button[disabled] { background: #eee; color: #999; }


/* 菜品卡片样式 */
.card-wrapper {
    position: relative;
    min-height: 500rpx; /* 适应手机高度 */
}
.card {
    position: relative; 
    margin-bottom: 30rpx; 
    display: flex;
    flex-direction: column; 
    justify-content: center;
    min-height: 450rpx; 
    background: white; 
    border-radius: 30rpx; 
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
    padding: 40rpx; 
    text-align: center;
}
.food-name { font-size: 56rpx; font-weight: bold; color: #333; margin-bottom: 30rpx; transition: color 0.3s; }
.shuffling-card .food-name { color: #ff69b4; animation: blink 1s step-end infinite; }
@keyframes blink { 50% { opacity: 0.5; } }

.nutrition-indicators {
    display: flex; justify-content: space-around;
    padding: 20rpx 0; border-top: 1rpx solid #eee; border-bottom: 1rpx solid #eee; margin-bottom: 30rpx;
}
.indicator-item { text-align: center; flex: 1; }
.icon-label { font-size: 24rpx; color: #999; margin-bottom: 10rpx; }
.icon-display { font-size: 36rpx; }
.materials-title { font-size: 28rpx; font-weight: bold; color: #ff69b4; margin-bottom: 16rpx; }
.materials-list { display: flex; flex-wrap: wrap; justify-content: center; }
.materials-item { font-size: 26rpx; color: #666; margin: 6rpx 10rpx; background: #f5f5f5; padding: 4rpx 12rpx; border-radius: 8rpx; }


/* 按钮组样式 */
.btn-group {
  display: flex;
  flex-wrap: wrap; 
  justify-content: space-between;
  gap: 16rpx; 
  margin-top: 40rpx;
}
.btn-group button {
  flex: 1 1 48%; /* 保持一行两个 */
  border: none; 
  padding: 24rpx 0; 
  border-radius: 20rpx;
  color: white; 
  font-size: 26rpx; 
  font-weight: bold; 
  transition: transform 0.1s ease;
  line-height: 1; /* 核心修复：重置 button 的行高 */
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.btn-group button:active { transform: scale(0.98); }
.btn-group button[disabled] { background: #ccc !important; }

/* 按钮颜色 */
.btn-group .pick { background: #4caf50; } 
.btn-group .add-to-plan { background: #1e90ff; } 
.btn-group .shopping { background: #ff9800; } 
.btn-group .clear-history { background: #f44336; } 

/* 模态框通用样式 */
.shopping-modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
}
.shopping-modal {
  background: white; padding: 40rpx; border-radius: 20rpx; max-width: 90%; /* 增加最大宽度 */
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.3); text-align: left;
  max-height: 80vh; 
  overflow-y: auto; 
}
.shopping-modal .h3 { font-size: 36rpx; font-weight: bold; color: #ff69b4; margin-bottom: 20rpx; }
.shopping-modal .materials-list { justify-content: flex-start; margin-bottom: 30rpx; }
.shopping-modal .materials-item { 
    margin: 10rpx 0; 
    background: #eee; 
    padding: 8rpx 16rpx; 
    border-radius: 8rpx;
    font-size: 28rpx;
}
.close-modal { 
    background: #ff69b4; color: white; border: none; padding: 16rpx 30rpx; 
    border-radius: 10rpx; font-size: 30rpx; width: 100%; margin-top: 30rpx;
    line-height: 1; /* 修复 button 行高 */
}
</style>