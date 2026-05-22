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
 * Delete a specific item
 */
function deleteItem(itemId, callback) {
  db.collection('items').doc(itemId).remove({
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
  deleteItem,
  deleteOldItems
};