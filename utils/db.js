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
    .orderBy('order', 'asc')
    .get({
      success: callback.success,
      fail: callback.fail
    });
}

/**
 * Add a new item
 * Status defaults to 'completed' for today and past dates, 'pending' for future dates
 */
function addItem(content, date, order, callback) {
  const userId = wx.getStorageSync('userId') || 'default';
  const today = formatDate(new Date());
  const status = date <= today ? 'completed' : 'pending';
  db.collection('items').add({
    data: {
      content: content,
      status: status,
      date: date,
      userId: userId,
      order: order !== undefined ? order : Date.now(),
      createdAt: Date.now()
    },
    success: callback.success,
    fail: callback.fail
  });
}

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

/**
 * Update item order
 */
function updateItemOrder(itemId, order, callback) {
  db.collection('items').doc(itemId).update({
    data: {
      order: order
    },
    success: callback.success,
    fail: callback.fail
  });
}

/**
 * Batch update item orders
 */
function batchUpdateOrders(updates, callback) {
  const db = wx.cloud.database();
  const tasks = updates.map(update => {
    return db.collection('items').doc(update.id).update({
      data: { order: update.order }
    });
  });

  Promise.all(tasks)
    .then(() => callback.success && callback.success())
    .catch(err => callback.fail && callback.fail(err));
}

module.exports = {
  getItemsByDate,
  addItem,
  markAsCompleted,
  rescheduleItem,
  deleteItem,
  deleteOldItems,
  updateItemOrder,
  batchUpdateOrders
};