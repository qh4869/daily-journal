# Daily Journal WeChat Mini Program Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a WeChat Mini Program for daily work journaling with minimalist paper-style UI, supporting task tracking and 30-day data retention.

**Architecture:** WeChat Mini Program native framework with WeChat Cloud Development for data persistence. Client-side pages for UI, cloud functions for database operations.

**Tech Stack:** WeChat Mini Program, WeChat Cloud Development (Cloud Database, Cloud Functions)

---

## File Structure

```
daily-journal/
├── app.json                 # App configuration (pages, window style)
├── app.js                   # App entry point (cloud init)
├── app.wxss                 # Global styles (paper background, colors)
├── project.config.json      # Cloud development settings
├── cloudfunctions/
│   └── cleanup/             # Clean records older than 30 days
│       ├── index.js
│       └── package.json
├── pages/
│   ├── index/               # Main journal page
│   │   ├── index.wxml       # UI layout
│   │   ├── index.wxss       # Page styles
│   │   ├── index.js         # Page logic
│   │   └── index.json       # Page config
│   └── add/                 # Add item modal page
│       ├── add.wxml
│       ├── add.wxss
│       ├── add.js
│       └── add.json
└── utils/
    ├── date.js              # Date formatting utilities
    └── db.js                # Database helper functions
```

---

## Task 1: Initialize Project Structure

**Files:**
- Create: `app.json`
- Create: `app.js`
- Create: `app.wxss`
- Create: `project.config.json`

- [ ] **Step 1: Create app.json**

```json
{
  "pages": [
    "pages/index/index",
    "pages/add/add"
  ],
  "window": {
    "navigationBarTitleText": "每日手账",
    "navigationBarBackgroundColor": "#FDFBF7",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#FDFBF7"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json",
  "cloud": true
}
```

- [ ] **Step 2: Create app.js**

```javascript
App({
  onLaunch() {
    // Initialize cloud development
    if (!wx.cloud) {
      console.error('Please use WeChat base library 2.2.3 or above');
    } else {
      wx.cloud.init({
        env: 'your-env-id', // Replace with actual env ID
        traceUser: true
      });
    }
  }
});
```

- [ ] **Step 3: Create app.wxss (global paper style)**

```css
/* Global paper style */
page {
  background-color: #FDFBF7;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', STHeiti, 'Microsoft Yahei', Tahoma, Simsun, sans-serif;
}

/* Paper texture effect */
page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0.03;
  z-index: 0;
}
```

- [ ] **Step 4: Create project.config.json**

```json
{
  "cloudfunctionRoot": "cloudfunctions/",
  "cloudbaseRoot": "",
  "miniprogramRoot": "./",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "minified": true
  },
  "appid": "your-appid",
  "projectname": "daily-journal",
  "libVersion": "2.19.4",
  "compileType": "miniprogram",
  "cloudfunctionTemplateRoot": "cloudfunctionTemplate/"
}
```

- [ ] **Step 5: Create sitemap.json**

```json
{
  "desc": "关于本文件的更多信息，请参考文档 https://developers.weixin.qq.com/miniprogram/dev/framework/sitemap.html",
  "rules": [{
    "action": "allow",
    "page": "*"
  }]
}
```

- [ ] **Step 6: Commit**

```bash
git add app.json app.js app.wxss project.config.json sitemap.json
git commit -m "feat: initialize WeChat Mini Program project structure"
```

---

## Task 2: Create Date Utility Functions

**Files:**
- Create: `utils/date.js`

- [ ] **Step 1: Write date utility functions**

```javascript
/**
 * Format date to YYYY-MM-DD string
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as YYYY-MM-DD
 */
function getTodayDate() {
  return formatDate(new Date());
}

/**
 * Get date that is n days before/after a date
 */
function getDateOffset(baseDate, offsetDays) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + offsetDays);
  return formatDate(date);
}

/**
 * Get date that is 30 days before today
 */
function getThirtyDaysAgoDate() {
  return getDateOffset(new Date(), -30);
}

/**
 * Format date for display (e.g., "2026年5月22日 周四")
 */
function formatDateDisplay(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
}

/**
 * Check if date is today
 */
function isToday(dateStr) {
  return dateStr === getTodayDate();
}

module.exports = {
  formatDate,
  getTodayDate,
  getDateOffset,
  getThirtyDaysAgoDate,
  formatDateDisplay,
  isToday
};
```

- [ ] **Step 2: Commit**

```bash
git add utils/date.js
git commit -m "feat: add date utility functions"
```

---

## Task 3: Create Database Helper Functions

**Files:**
- Create: `utils/db.js`

- [ ] **Step 1: Write database helper functions**

```javascript
const db = wx.cloud.database();

/**
 * Get all items for a specific date
 */
function getItemsByDate(date, callback) {
  const userId = wx.getStorageSync('userId') || 'default';
  db.collection('items')
    .where({
      date: date,
      userId: userId
    })
    .orderBy('createdAt', 'asc')
    .get({
      success: callback.success,
      fail: callback.fail
    });
}

/**
 * Add a new item
 */
function addItem(content, date, callback) {
  const userId = wx.getStorageSync('userId') || 'default';
  db.collection('items').add({
    data: {
      content: content,
      status: 'pending',
      date: date,
      userId: userId,
      createdAt: Date.now()
    },
    success: callback.success,
    fail: callback.fail
  });
}

/**
 * Update item status to completed
 */
function markAsCompleted(itemId, callback) {
  db.collection('items').doc(itemId).update({
    data: {
      status: 'completed'
    },
    success: callback.success,
    fail: callback.fail
  });
}

/**
 * Reschedule item to a new date
 */
function rescheduleItem(itemId, newDate, callback) {
  db.collection('items').doc(itemId).update({
    data: {
      date: newDate,
      status: 'pending'
    },
    success: callback.success,
    fail: callback.fail
  });
}

/**
 * Delete items older than 30 days
 */
function deleteOldItems(cutoffDate, callback) {
  const userId = wx.getStorageSync('userId') || 'default';
  db.collection('items')
    .where({
      date: db.command.lt(cutoffDate),
      userId: userId
    })
    .remove({
      success: callback.success,
      fail: callback.fail
    });
}

module.exports = {
  getItemsByDate,
  addItem,
  markAsCompleted,
  rescheduleItem,
  deleteOldItems
};
```

- [ ] **Step 2: Commit**

```bash
git add utils/db.js
git commit -m "feat: add database helper functions"
```

---

## Task 4: Create Index Page (Main Journal UI)

**Files:**
- Create: `pages/index/index.wxml`
- Create: `pages/index/index.wxss`
- Create: `pages/index/index.js`
- Create: `pages/index/index.json`

- [ ] **Step 1: Create index.wxml**

```xml
<view class="container">
  <!-- Date navigation -->
  <view class="date-nav">
    <view class="date-btn prev" bindtap="onPrevDay">
      <text>&lt;</text>
    </view>
    <view class="date-display">{{displayDate}}</view>
    <view class="date-btn next" bindtap="onNextDay">
      <text>&gt;</text>
    </view>
  </view>

  <!-- Items list -->
  <view class="items-list">
    <view class="item" wx:for="{{items}}" wx:key="_id">
      <text class="item-content">{{item.content}}</text>
      <view wx:if="{{item.status === 'pending'}}" class="pending-tag" bindtap="onPendingTagTap" data-id="{{item._id}}">
        待完成
      </view>
    </view>
    <view wx:if="{{items.length === 0}}" class="empty-state">
      今天还没有记录事项
    </view>
  </view>

  <!-- Add button -->
  <view class="add-btn" bindtap="onAddItem">
    <text class="add-icon">+</text>
    <text class="add-text">添加事项</text>
  </view>
</view>

<!-- Complete confirmation modal -->
<view wx:if="{{showCompleteModal}}" class="modal-mask">
  <view class="modal-content">
    <view class="modal-title">确认完成？</view>
    <view class="modal-actions">
      <view class="modal-btn cancel" bindtap="onCompleteModalCancel">取消</view>
      <view class="modal-btn confirm" bindtap="onCompleteModalConfirm">确认完成</view>
    </view>
  </view>
</view>

<!-- Reschedule modal -->
<view wx:if="{{showRescheduleModal}}" class="modal-mask">
  <view class="modal-content">
    <view class="modal-title">选择延期日期</view>
    <picker mode="date" value="{{rescheduleDate}}" end="{{maxDate}}" bindchange="onDateChange">
      <view class="picker-view">{{rescheduleDate || '请选择日期'}}</view>
    </picker>
    <view class="modal-actions">
      <view class="modal-btn cancel" bindtap="onRescheduleModalCancel">取消</view>
      <view class="modal-btn confirm" bindtap="onRescheduleModalConfirm">确定</view>
    </view>
  </view>
</view>
```

- [ ] **Step 2: Create index.wxss**

```css
.container {
  min-height: 100vh;
  padding: 20rpx;
  box-sizing: border-box;
}

/* Date navigation */
.date-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  margin-bottom: 30rpx;
  border-bottom: 1px solid #E5E0D8;
}

.date-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #666;
}

.date-display {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

/* Items list */
.items-list {
  min-height: 60vh;
}

.item {
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.item-content {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.pending-tag {
  padding: 8rpx 20rpx;
  background: #FFE4D0;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #8B5A2B;
  white-space: nowrap;
  margin-left: 20rpx;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* Add button */
.add-btn {
  position: fixed;
  bottom: 40rpx;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  border-radius: 50rpx;
  padding: 24rpx 60rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.add-icon {
  font-size: 40rpx;
  color: #fff;
  margin-right: 12rpx;
}

.add-text {
  font-size: 28rpx;
  color: #fff;
}

/* Modal */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 40rpx;
  width: 560rpx;
}

.modal-title {
  text-align: center;
  font-size: 32rpx;
  color: #333;
  margin-bottom: 40rpx;
}

.picker-view {
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 40rpx;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}

.modal-btn {
  width: 240rpx;
  height: 72rpx;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.modal-btn.cancel {
  background: #F5F5F5;
  color: #666;
}

.modal-btn.confirm {
  background: #333;
  color: #fff;
}
```

- [ ] **Step 3: Create index.js**

```javascript
const dateUtil = require('../../utils/date.js');
const dbUtil = require('../../utils/db.js');

Page({
  data: {
    currentDate: dateUtil.getTodayDate(),
    displayDate: '',
    items: [],
    showCompleteModal: false,
    showRescheduleModal: false,
    currentItemId: null,
    rescheduleDate: '',
    maxDate: ''
  },

  onLoad() {
    this.updateDisplayDate();
    this.loadItems();
    this.cleanupOldItems();
    this.setMaxDate();
  },

  // Update display date
  updateDisplayDate() {
    this.setData({
      displayDate: dateUtil.formatDateDisplay(this.data.currentDate)
    });
  },

  // Set max date for picker (today + 30 days)
  setMaxDate() {
    const maxDate = dateUtil.getDateOffset(new Date(), 30);
    this.setData({
      maxDate: maxDate
    });
  },

  // Load items for current date
  loadItems() {
    dbUtil.getItemsByDate(this.data.currentDate, {
      success: (res) => {
        this.setData({
          items: res.data
        });
      },
      fail: (err) => {
        console.error('Failed to load items:', err);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    });
  },

  // Clean up items older than 30 days
  cleanupOldItems() {
    const cutoffDate = dateUtil.getThirtyDaysAgoDate();
    dbUtil.deleteOldItems(cutoffDate, {
      success: () => {
        console.log('Cleaned up old items');
      },
      fail: (err) => {
        console.error('Failed to cleanup:', err);
      }
    });
  },

  // Navigate to previous day
  onPrevDay() {
    const prevDate = dateUtil.getDateOffset(this.data.currentDate, -1);
    // Don't allow going past 30 days ago
    const cutoffDate = dateUtil.getThirtyDaysAgoDate();
    if (prevDate < cutoffDate) {
      wx.showToast({
        title: '只能查看最近30天',
        icon: 'none'
      });
      return;
    }
    this.setData({ currentDate: prevDate });
    this.updateDisplayDate();
    this.loadItems();
  },

  // Navigate to next day
  onNextDay() {
    const nextDate = dateUtil.getDateOffset(this.data.currentDate, 1);
    // Don't allow going more than 30 days ahead
    const maxDate = dateUtil.getDateOffset(new Date(), 30);
    if (nextDate > maxDate) {
      wx.showToast({
        title: '最多提前30天',
        icon: 'none'
      });
      return;
    }
    this.setData({ currentDate: nextDate });
    this.updateDisplayDate();
    this.loadItems();
  },

  // Add new item
  onAddItem() {
    wx.navigateTo({
      url: `/pages/add/add?date=${this.data.currentDate}`
    });
  },

  // Tap on pending tag
  onPendingTagTap(e) {
    const itemId = e.currentTarget.dataset.id;
    this.setData({
      currentItemId: itemId,
      showCompleteModal: true
    });
  },

  // Cancel complete modal
  onCompleteModalCancel() {
    this.setData({
      showCompleteModal: false,
      currentItemId: null
    });
  },

  // Confirm complete
  onCompleteModalConfirm() {
    dbUtil.markAsCompleted(this.data.currentItemId, {
      success: () => {
        this.setData({
          showCompleteModal: false,
          currentItemId: null
        });
        this.loadItems();
        wx.showToast({
          title: '已完成',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('Failed to mark as completed:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    });
  },

  // Cancel reschedule modal
  onRescheduleModalCancel() {
    this.setData({
      showRescheduleModal: false,
      currentItemId: null,
      rescheduleDate: ''
    });
  },

  // Date picker change
  onDateChange(e) {
    this.setData({
      rescheduleDate: e.detail.value
    });
  },

  // Confirm reschedule
  onRescheduleModalConfirm() {
    if (!this.data.rescheduleDate) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return;
    }
    dbUtil.rescheduleItem(this.data.currentItemId, this.data.rescheduleDate, {
      success: () => {
        this.setData({
          showRescheduleModal: false,
          currentItemId: null,
          rescheduleDate: ''
        });
        this.loadItems();
        wx.showToast({
          title: '已延期',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('Failed to reschedule:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    });
  },

  // After adding item comes back
  onShow() {
    this.loadItems();
  }
});
```

- [ ] **Step 4: Create index.json**

```json
{
  "navigationBarTitleText": "每日手账",
  "enablePullDownRefresh": false
}
```

- [ ] **Step 5: Commit**

```bash
git add pages/index/
git commit -m "feat: create index page with journal UI"
```

---

## Task 5: Create Add Item Page

**Files:**
- Create: `pages/add/add.wxml`
- Create: `pages/add/add.wxss`
- Create: `pages/add/add.js`
- Create: `pages/add/add.json`

- [ ] **Step 1: Create add.wxml**

```xml
<view class="container">
  <view class="form">
    <textarea
      class="input"
      placeholder="输入事项内容..."
      value="{{content}}"
      bindinput="onInput"
      auto-height
      maxlength="500"
      show-confirm-bar="{{false}}"
    />
  </view>
  <view class="actions">
    <view class="btn cancel" bindtap="onCancel">取消</view>
    <view class="btn confirm" bindtap="onConfirm">确定</view>
  </view>
</view>
```

- [ ] **Step 2: Create add.wxss**

```css
.container {
  min-height: 100vh;
  padding: 40rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.form {
  flex: 1;
}

.input {
  width: 100%;
  min-height: 200rpx;
  padding: 24rpx;
  background: #FFFFFF;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  box-sizing: border-box;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.actions {
  display: flex;
  justify-content: space-between;
  padding-top: 40rpx;
  gap: 20rpx;
}

.btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.btn.cancel {
  background: #F5F5F5;
  color: #666;
}

.btn.confirm {
  background: #333;
  color: #fff;
}
```

- [ ] **Step 3: Create add.js**

```javascript
const dbUtil = require('../../utils/db.js');

Page({
  data: {
    date: '',
    content: ''
  },

  onLoad(options) {
    if (options.date) {
      this.setData({
        date: options.date
      });
    }
  },

  onInput(e) {
    this.setData({
      content: e.detail.value
    });
  },

  onCancel() {
    wx.navigateBack();
  },

  onConfirm() {
    const content = this.data.content.trim();
    if (!content) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '保存中...'
    });

    dbUtil.addItem(content, this.data.date, {
      success: () => {
        wx.hideLoading();
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('Failed to add item:', err);
        wx.showToast({
          title: '添加失败',
          icon: 'none'
        });
      }
    });
  }
});
```

- [ ] **Step 4: Create add.json**

```json
{
  "navigationBarTitleText": "添加事项",
  "enablePullDownRefresh": false
}
```

- [ ] **Step 5: Commit**

```bash
git add pages/add/
git commit -m "feat: create add item page"
```

---

## Task 6: Create Cleanup Cloud Function

**Files:**
- Create: `cloudfunctions/cleanup/index.js`
- Create: `cloudfunctions/cleanup/package.json`

- [ ] **Step 1: Create cleanup index.js**

```javascript
const cloud = require('wx-server-sdk');
const dateUtil = require('../../utils/date.js');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const userId = wxContext.OPENID || 'default';

  // Calculate 30 days ago
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const year = thirtyDaysAgo.getFullYear();
  const month = String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0');
  const day = String(thirtyDaysAgo.getDate()).padStart(2, '0');
  const cutoffDate = `${year}-${month}-${day}`;

  try {
    const result = await db.collection('items')
      .where({
        date: db.command.lt(cutoffDate),
        userId: userId
      })
      .remove();

    return {
      success: true,
      deleted: result.stats.removed
    };
  } catch (err) {
    return {
      success: false,
      error: err
    };
  }
};
```

- [ ] **Step 2: Create cleanup package.json**

```json
{
  "name": "cleanup",
  "version": "1.0.0",
  "description": "Clean up items older than 30 days",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add cloudfunctions/cleanup/
git commit -m "feat: add cleanup cloud function"
```

---

## Task 7: Update Workflow to Show Reschedule Option

**Files:**
- Modify: `pages/index/index.wxml`
- Modify: `pages/index/index.js`

- [ ] **Step 1: Update index.wxml modal to show reschedule option**

Replace the complete confirmation modal section with:

```xml
<!-- Complete confirmation modal -->
<view wx:if="{{showCompleteModal}}" class="modal-mask">
  <view class="modal-content">
    <view class="modal-title">此事项已完成了吗？</view>
    <view class="modal-actions">
      <view class="modal-btn reschedule" bindtap="onRescheduleClick">未完成，延期</view>
      <view class="modal-btn confirm" bindtap="onCompleteModalConfirm">已完成</view>
    </view>
  </view>
</view>
```

- [ ] **Step 2: Update index.wxss to style reschedule button**

Add to modal-actions section:

```css
.modal-btn.reschedule {
  background: #FFE4D0;
  color: #8B5A2B;
}
```

- [ ] **Step 3: Update index.js to handle reschedule click**

Add this method after `onCompleteModalCancel`:

```javascript
  // Click reschedule option
  onRescheduleClick() {
    this.setData({
      showCompleteModal: false,
      showRescheduleModal: true,
      rescheduleDate: this.data.currentDate // Default to same date
    });
  },
```

And update `onCompleteModalConfirm` to close reschedule modal if needed:

```javascript
  onCompleteModalConfirm() {
    dbUtil.markAsCompleted(this.data.currentItemId, {
      success: () => {
        this.setData({
          showCompleteModal: false,
          showRescheduleModal: false,
          currentItemId: null
        });
        this.loadItems();
        wx.showToast({
          title: '已完成',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('Failed to mark as completed:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    });
  },
```

- [ ] **Step 4: Commit**

```bash
git add pages/index/
git commit -m "feat: add reschedule option to complete modal"
```

---

## Task 8: Cloud Database Setup

**Files:** (WeChat Developer Console action, no code files)

- [ ] **Step 1: Set up WeChat Cloud Development**

In WeChat Developer Tools:
1. Click "云开发" (Cloud Development) button
2. Create a new cloud environment or use existing one
3. Note the environment ID

- [ ] **Step 2: Create database collection**

In WeChat Cloud Console:
1. Go to Database (数据库)
2. Create a new collection named `items`
3. No need to set indexes for MVP

- [ ] **Step 3: Update app.js with environment ID**

Replace `your-env-id` in `app.js` with actual environment ID from Step 1.

- [ ] **Step 4: Update project.config.json with appid**

Replace `your-appid` in `project.config.json` with actual appid.

- [ ] **Step 5: Commit**

```bash
git add app.js project.config.json
git commit -m "chore: update cloud environment ID and appid"
```

---

## Task 9: Deploy Cloud Function

**Files:** (WeChat Developer Tools action)

- [ ] **Step 1: Right-click cleanup folder in WeChat Developer Tools**
- [ ] **Step 2: Select "上传并部署：云端安装依赖" (Upload and deploy: Install dependencies)**
- [ ] **Step 3: Wait for deployment to complete**

---

## Task 10: Manual Testing Checklist

**Files:** None (testing)

- [ ] **Step 1: Test basic app launch**
- Open WeChat Developer Tools
- Compile and run the mini program
- Verify: Page loads, shows today's date

- [ ] **Step 2: Test adding an item**
- Click "添加事项" button
- Enter text and click "确定"
- Verify: Item appears in list, shows "待完成" tag

- [ ] **Step 3: Test marking as completed**
- Click "待完成" tag
- Click "已完成" in modal
- Verify: Tag disappears, toast shows "已完成"

- [ ] **Step 4: Test rescheduling**
- Click "待完成" tag
- Click "未完成，延期"
- Select a future date
- Click "确定"
- Verify: Item moves to selected date

- [ ] **Step 5: Test date navigation**
- Click "<" to go to previous day
- Click ">" to go to next day
- Verify: Date changes correctly, items load for that date

- [ ] **Step 6: Test date limits**
- Try to go beyond 30 days past
- Try to go beyond 30 days future
- Verify: Toast message appears, cannot navigate

- [ ] **Step 7: Test future item addition**
- Navigate to a future date
- Add an item
- Navigate to today
- Navigate back to that future date
- Verify: Item persists

- [ ] **Step 8: Verify cleanup** (optional, requires waiting 30 days or manual trigger)
- Can manually call cleanup cloud function via console
- Verify: Old items are deleted

---

## Task 11: Final Polish

**Files:**
- Modify: `pages/index/index.wxss`
- Modify: `pages/add/add.wxss`

- [ ] **Step 1: Add subtle paper texture to items**

Add to index.wxss:

```css
.item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%);
  pointer-events: none;
  border-radius: 12rpx;
}

.item {
  /* add position relative */
  position: relative;
}
```

- [ ] **Step 2: Add placeholder image placeholder** (if needed for paper texture)

In app.wxss, after page::before:

```css
/* Optional: Add subtle paper texture using CSS pattern */
page::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0.5;
  z-index: 0;
  background-image: repeating-linear-gradient(
    transparent,
    transparent 29px,
    rgba(0, 0, 0, 0.02) 30px
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add pages/index/index.wxss pages/add/add.wxss app.wxss
git commit -m "style: add paper texture effects"
```

---

## Task 12: Documentation and Deployment

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md**

```markdown
# 每日手账

一个简洁的微信小程序，用于记录每日工作事项。

## 功能

- 记录每日工作事项（纯文本）
- 标记事项完成状态
- 未完成事项可延期到指定日期
- 只保留最近30天的记录
- 简约手账风格UI

## 技术栈

- 微信小程序原生开发
- 微信云开发

## 开发

1. 在 `app.js` 中配置云环境ID
2. 在 `project.config.json` 中配置小程序appid
3. 在微信开发者工具中打开项目
4. 点击"云开发"按钮初始化云环境
5. 创建数据库集合 `items`
6. 上传并部署云函数 `cleanup`

## 云数据库结构

### items 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 自动生成 |
| content | String | 事项内容 |
| status | String | "pending" 或 "completed" |
| date | String | 日期 "YYYY-MM-DD" |
| userId | String | 用户openid |
| createdAt | Number | 创建时间戳 |

## 数据保留策略

只保留最近30天的记录，超过30天的记录会被自动清理。
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

- [ ] **Step 3: Push to remote repository**

```bash
git remote add origin <your-repo-url>
git push -u origin main
```

---

## Spec Coverage Checklist

- [x] 微信小程序平台 - Task 1, Task 8
- [x] 云开发免费额度 - Task 8
- [x] 简约纸质手账风格UI - Task 4, Task 11
- [x] 单日视图 - Task 4
- [x] 纯文本事项 - Task 4, Task 5
- [x] 待完成标签 - Task 4
- [x] 点击待完成标签弹出确认 - Task 4, Task 7
- [x] 确认已完成移除标签 - Task 4, Task 7
- [x] 未完成可选择延期日期 - Task 4, Task 7
- [x] 只保存最近30天记录 - Task 4, Task 6

All spec requirements covered.