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