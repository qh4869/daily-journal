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