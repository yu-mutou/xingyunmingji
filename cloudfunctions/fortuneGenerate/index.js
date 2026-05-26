const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const { generateFortune } = require('./engine/generator');

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action || 'getToday';

  // Get user profile
  const userRes = await db
    .collection('users')
    .where({ _openid: OPENID })
    .get();

  if (!userRes.data || userRes.data.length === 0) {
    return { success: false, errMsg: 'NO_USER_PROFILE', message: '请先完善个人信息' };
  }

  const profile = userRes.data[0];

  // Get today's date in China timezone
  const now = new Date();
  const today = new Date(now.getTime() + 8 * 3600000);
  const dateStr = today.toISOString().slice(0, 10);

  // Check existing fortune for today
  const fortuneRes = await db
    .collection('fortunes')
    .where({ _openid: OPENID, date: dateStr })
    .get();

  const existingFortune = fortuneRes.data && fortuneRes.data.length > 0 ? fortuneRes.data[0] : null;

  // Return existing fortune if just getting today's
  if (existingFortune && action !== 'refresh') {
    return { success: true, data: existingFortune, generated: false };
  }

  // Handle refresh request
  if (existingFortune && action === 'refresh') {
    if (existingFortune.refreshCount >= 1) {
      return {
        success: false,
        errMsg: 'REFRESH_LIMIT_REACHED',
        message: '今日刷新次数已用完，明日再来哦',
      };
    }
    // Generate new fortune with next round (produces different result)
    const newRound = existingFortune.refreshCount + 1;
    const newFortune = generateFortune(OPENID, dateStr, profile, newRound);
    newFortune.refreshCount = newRound;
    newFortune.isBookmarked = existingFortune.isBookmarked;

    await db
      .collection('fortunes')
      .doc(existingFortune._id)
      .update({
        data: {
          ...newFortune,
          updatedAt: db.serverDate(),
        },
      });

    newFortune._id = existingFortune._id;
    return { success: true, data: newFortune, generated: true };
  }

  // No existing fortune: generate new one (round 0)
  const fortune = generateFortune(OPENID, dateStr, profile, 0);
  const insertRes = await db.collection('fortunes').add({
    data: {
      ...fortune,
      _openid: OPENID,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    },
  });

  fortune._id = insertRes._id;
  return { success: true, data: fortune, generated: true };
};
