const dateUtil = require('../../utils/date.js');
const dbUtil = require('../../utils/db.js');

Page({
  data: {
    currentDate: dateUtil.getTodayDate(),
    displayDate: '',
    viewMode: 'day', // 'day' or 'week'
    items: [],
    pendingItems: [],
    weekDays: [],
    showCompleteModal: false,
    showRescheduleModal: false,
    showDeleteModal: false,
    showPendingModal: false,
    currentItemId: null,
    rescheduleDate: '',
    maxDate: ''
  },

  onLoad() {
    this.updateDisplayDate();
    this.loadItems();
    this.loadPendingItems();
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

  // Load items for current week
  loadWeekItems() {
    const weekDates = this.getWeekDates(this.data.currentDate);
    const weekDaysData = weekDates.map(date => {
      const dateObj = new Date(date);
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return {
        date: date,
        dayName: dayNames[dateObj.getDay()],
        dateStr: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
        isToday: date === dateUtil.getTodayDate(),
        items: []
      };
    });

    this.setData({ weekDays: weekDaysData });

    // Load items for each day in the week
    weekDates.forEach((date, index) => {
      dbUtil.getItemsByDate(date, {
        success: (res) => {
          const weekDays = this.data.weekDays;
          weekDays[index].items = res.data;
          this.setData({ weekDays });
        },
        fail: (err) => {
          console.error(`Failed to load items for ${date}:`, err);
        }
      });
    });
  },

  // Refresh data based on current view mode
  refreshData() {
    if (this.data.viewMode === 'day') {
      this.loadItems();
    }
    this.loadPendingItems();
  },

  // Load all pending items
  loadPendingItems() {
    dbUtil.getAllPendingItems({
      success: (res) => {
        const pendingItems = res.data.map(item => ({
          ...item,
          dateStr: this.formatPendingDate(item.date)
        }));
        this.setData({ pendingItems });
      },
      fail: (err) => {
        console.error('Failed to load pending items:', err);
      }
    });
  },

  // Format date for pending item display
  formatPendingDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    const today = dateUtil.getTodayDate();
    const tomorrow = dateUtil.getDateOffset(today, 1);

    if (dateStr === today) {
      return '今天';
    } else if (dateStr === tomorrow) {
      return '明天';
    } else {
      return `${month}月${day}日 ${weekday}`;
    }
  },

  // Click on pending item - jump to that date
  onPendingItemClick(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({ currentDate: date });
    this.updateDisplayDate();
    this.loadItems();
  },

  // Get dates for the week containing the given date
  getWeekDates(dateStr) {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - dayOfWeek); // Start from Sunday

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      dates.push(dateUtil.formatDate(d));
    }
    return dates;
  },

  // Update display date for week view
  updateWeekDisplayDate() {
    const weekDates = this.getWeekDates(this.data.currentDate);
    const startDate = new Date(weekDates[0]);
    const endDate = new Date(weekDates[6]);
    this.setData({
      displayDate: `${startDate.getMonth() + 1}月${startDate.getDate()}日 - ${endDate.getMonth() + 1}月${endDate.getDate()}日`
    });
  },

  // Switch to day view
  switchToDayView() {
    this.setData({ viewMode: 'day' });
    this.updateDisplayDate();
    this.loadItems();
    this.loadPendingItems();
  },

  // Switch to week view
  switchToWeekView() {
    this.setData({ viewMode: 'week' });
    this.updateWeekDisplayDate();
    this.loadWeekItems();
  },

  // Tap on week day header - jump to day view
  onWeekDayTap(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({
      currentDate: date,
      viewMode: 'day'
    });
    this.updateDisplayDate();
    this.loadItems();
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

  // Navigate to previous day/week
  onPrevDay() {
    const offset = this.data.viewMode === 'week' ? -7 : -1;
    const prevDate = dateUtil.getDateOffset(this.data.currentDate, offset);
    const cutoffDate = dateUtil.getThirtyDaysAgoDate();
    if (prevDate < cutoffDate) {
      wx.showToast({
        title: '只能查看最近30天',
        icon: 'none'
      });
      return;
    }
    this.setData({ currentDate: prevDate });
    if (this.data.viewMode === 'day') {
      this.updateDisplayDate();
      this.loadItems();
    } else {
      this.updateWeekDisplayDate();
      this.loadWeekItems();
    }
  },

  // Navigate to next day/week
  onNextDay() {
    const offset = this.data.viewMode === 'week' ? 7 : 1;
    const nextDate = dateUtil.getDateOffset(this.data.currentDate, offset);
    const maxDate = dateUtil.getDateOffset(new Date(), 30);
    if (nextDate > maxDate) {
      wx.showToast({
        title: '最多提前30天',
        icon: 'none'
      });
      return;
    }
    this.setData({ currentDate: nextDate });
    if (this.data.viewMode === 'day') {
      this.updateDisplayDate();
      this.loadItems();
    } else {
      this.updateWeekDisplayDate();
      this.loadWeekItems();
    }
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

  // Tap on completed tag
  onCompletedTagTap(e) {
    const itemId = e.currentTarget.dataset.id;
    this.setData({
      currentItemId: itemId,
      showPendingModal: true
    });
  },

  // Cancel pending modal
  onPendingModalCancel() {
    this.setData({
      showPendingModal: false,
      currentItemId: null
    });
  },

  // Confirm mark as pending
  onPendingModalConfirm() {
    const today = dateUtil.getTodayDate();
    const currentDate = this.data.currentDate;

    // If marking as pending on today or past date, change status only
    // If on future date, already pending, nothing to do
    dbUtil.markAsPending(this.data.currentItemId, {
      success: () => {
        this.setData({
          showPendingModal: false,
          currentItemId: null
        });
        this.refreshData();
        wx.showToast({
          title: '已标记为未完成',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('Failed to mark as pending:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    });
  },

  // Cancel complete modal
  onCompleteModalCancel() {
    this.setData({
      showCompleteModal: false,
      currentItemId: null
    });
  },

  // Click reschedule option
  onRescheduleClick() {
    this.setData({
      showCompleteModal: false,
      showRescheduleModal: true,
      rescheduleDate: this.data.currentDate // Default to same date
    });
  },

  // Confirm complete
  onCompleteModalConfirm() {
    dbUtil.markAsCompleted(this.data.currentItemId, {
      success: () => {
        this.setData({
          showCompleteModal: false,
          showRescheduleModal: false,
          currentItemId: null
        });
        this.refreshData();
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
        this.refreshData();
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

  // Tap on item (delete)
  onItemTap(e) {
    const itemId = e.currentTarget.dataset.id;
    this.setData({
      currentItemId: itemId,
      showDeleteModal: true
    });
  },

  // Cancel delete modal
  onDeleteModalCancel() {
    this.setData({
      showDeleteModal: false,
      currentItemId: null
    });
  },

  // Confirm delete
  onDeleteModalConfirm() {
    dbUtil.deleteItem(this.data.currentItemId, {
      success: () => {
        this.setData({
          showDeleteModal: false,
          currentItemId: null
        });
        this.refreshData();
        wx.showToast({
          title: '已删除',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('Failed to delete:', err);
        wx.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    });
  },

  // Start dragging
  onDragStart(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const startY = e.touches[0].clientY;
    this.dragState = {
      dragging: true,
      startIndex: index,
      currentIndex: index,
      startY: startY
    };
    wx.vibrateShort({ type: 'light' });
  },

  // Drag move
  onDragMove(e) {
    if (!this.dragState || !this.dragState.dragging) return;

    const touchY = e.touches[0].clientY;
    const deltaY = touchY - this.dragState.startY;
    const currentIndex = this.dragState.currentIndex;

    // Move threshold
    const threshold = 60; // rpx converted to px approximately

    if (Math.abs(deltaY) > threshold) {
      const newIndex = deltaY > 0 ? currentIndex + 1 : currentIndex - 1;
      const items = this.data.items;

      if (newIndex >= 0 && newIndex < items.length && newIndex !== currentIndex) {
        // Swap items
        const itemToMove = items[currentIndex];
        items.splice(currentIndex, 1);
        items.splice(newIndex, 0, itemToMove);

        this.setData({ items });
        this.dragState.currentIndex = newIndex;
        this.dragState.startY = touchY;
      }
    }
  },

  // End dragging
  onDragEnd(e) {
    if (!this.dragState || !this.dragState.dragging) return;

    const items = this.data.items;
    const updates = items.map((item, index) => ({
      id: item._id,
      order: index * 1000
    }));

    // Save order to database
    dbUtil.batchUpdateOrders(updates, {
      success: () => {
        console.log('Order saved');
      },
      fail: (err) => {
        console.error('Failed to save order:', err);
      }
    });

    this.dragState = {
      dragging: false,
      startIndex: -1,
      currentIndex: -1,
      startY: 0
    };
  },

  // After adding item comes back
  onShow() {
    if (this.data.viewMode === 'day') {
      this.loadItems();
    } else {
      this.loadWeekItems();
    }
  }
});