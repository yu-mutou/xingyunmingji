const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { ZODIAC_DATA } = require('./data/zodiac-data');
const { CHINESE_ZODIAC_DATA } = require('./data/chinese-zodiac-data');

exports.main = async (event, context) => {
  const action = event.action || 'seedAll';
  const results = { zodiac: 0, chineseZodiac: 0 };

  if (action === 'seedAll' || action === 'seedZodiac') {
    for (const item of ZODIAC_DATA) {
      const existing = await db
        .collection('encyclopedia_zodiac')
        .where({ key: item.key })
        .count();
      if (existing.total === 0) {
        await db.collection('encyclopedia_zodiac').add({ data: item });
        results.zodiac++;
      }
    }
  }

  if (action === 'seedAll' || action === 'seedChineseZodiac') {
    for (const item of CHINESE_ZODIAC_DATA) {
      const existing = await db
        .collection('encyclopedia_chinese_zodiac')
        .where({ key: item.key })
        .count();
      if (existing.total === 0) {
        await db.collection('encyclopedia_chinese_zodiac').add({ data: item });
        results.chineseZodiac++;
      }
    }
  }

  return {
    success: true,
    message: `Seeded ${results.zodiac} zodiac records, ${results.chineseZodiac} chinese zodiac records`,
    results,
  };
};
