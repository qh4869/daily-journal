const dateUtil = require('../../utils/date.js');
const dbUtil = require('../../utils/db.js');

Page({
  data: {
    currentDate: dateUtil.getTodayDate(),
    displayDate: '',
    items: [],
    showCompleteModal: false,
    showRescheduleModal: false,
    showDeleteModal: false,
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
        this.loadItems();
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

  // After adding item comes back
  onShow() {
    this.loadItems();
  }
});