const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action || 'getProfile';

  if (action === 'getProfile') {
    const res = await db
      .collection('users')
      .where({ _openid: OPENID })
      .get();

    if (res.data && res.data.length > 0) {
      return { success: true, data: res.data[0] };
    }
    return { success: true, data: null };
  }

  if (action === 'saveProfile') {
    const { nickname, avatarUrl, zodiac, chineseZodiac, birthYear, gender } = event.data || {};

    if (!nickname || !zodiac || !chineseZodiac || !birthYear) {
      return { success: false, errMsg: 'MISSING_FIELDS', message: '请填写完整信息' };
    }

    // Check if user already has a profile
    const existing = await db
      .collection('users')
      .where({ _openid: OPENID })
      .get();

    const profileData = {
      nickname,
      avatarUrl: avatarUrl || '',
      zodiac,
      chineseZodiac,
      birthYear,
      gender: gender || '',
      updatedAt: db.serverDate(),
    };

    if (existing.data && existing.data.length > 0) {
      await db
        .collection('users')
        .doc(existing.data[0]._id)
        .update({ data: profileData });
      profileData._id = existing.data[0]._id;
    } else {
      profileData._openid = OPENID;
      profileData.createdAt = db.serverDate();
      const addRes = await db.collection('users').add({ data: profileData });
      profileData._id = addRes._id;
    }

    return { success: true, data: profileData };
  }

  if (action === 'updateProfile') {
    const updateData = {};
    const fields = ['nickname', 'avatarUrl', 'zodiac', 'chineseZodiac', 'birthYear', 'gender'];
    for (const f of fields) {
      if (event.data && event.data[f] !== undefined) {
        updateData[f] = event.data[f];
      }
    }
    updateData.updatedAt = db.serverDate();

    const existing = await db
      .collection('users')
      .where({ _openid: OPENID })
      .get();

    if (!existing.data || existing.data.length === 0) {
      return { success: false, errMsg: 'NO_PROFILE', message: '用户档案不存在' };
    }

    await db
      .collection('users')
      .doc(existing.data[0]._id)
      .update({ data: updateData });

    const updated = await db
      .collection('users')
      .doc(existing.data[0]._id)
      .get();

    return { success: true, data: updated.data };
  }

  return { success: false, errMsg: 'UNKNOWN_ACTION', message: '未知操作' };
};
