const { ZODIAC_SIGNS, CHINESE_ZODIACS, DIMENSION_KEYS, DIMENSION_LABELS, DIMENSION_ICONS } = require('../../utils/constants');
const { getLunarDate, formatDate } = require('../../utils/date-utils');

function getBarColor(score) {
  if (score >= 70) return '#52C41A';
  if (score >= 50) return '#FFD700';
  return '#F53F3F';
}

Page({
  data: {
    fortune: null,
    displayDate: '',
    lunarMonth: '',
    lunarDay: '',
    zodiacName: '',
    zodiacIcon: '',
    chineseZodiacName: '',
    dimensionList: [],
  },

  onLoad(options) {
    const id = options.id;
    if (id) this.loadFortune(id);
  },

  async loadFortune(id) {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('fortunes').doc(id).get();
      if (res.data) {
        this.renderFortune(res.data);
      }
    } catch (e) {
      console.error('Load fortune detail error:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  renderFortune(fortune) {
    const app = getApp();
    const profile = app.globalData.userProfile || {};

    const zodiac = ZODIAC_SIGNS.find(z => z.key === profile.zodiac);
    const cz = CHINESE_ZODIACS.find(z => z.key === profile.chineseZodiac);

    const dateParts = fortune.date.split('-');
    const lunar = getLunarDate(new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2]));

    const dims = fortune.dimensions || {};
    const dimensionList = DIMENSION_KEYS.map(key => ({
      key,
      name: DIMENSION_LABELS[key],
      icon: DIMENSION_ICONS[key],
      score: dims[key] ? dims[key].score : 0,
      comment: dims[key] ? dims[key].comment : '',
      barColor: getBarColor(dims[key] ? dims[key].score : 0),
    }));

    this.setData({
      fortune,
      displayDate: formatDate(fortune.date),
      lunarMonth: lunar.monthName,
      lunarDay: lunar.dayName,
      zodiacName: zodiac ? zodiac.name : '',
      zodiacIcon: zodiac ? zodiac.emoji : '',
      chineseZodiacName: cz ? cz.name : '',
      dimensionList,
    });
  },

  async onToggleBookmark() {
    const fortune = this.data.fortune;
    if (!fortune || !fortune._id) return;

    const newVal = !fortune.isBookmarked;
    try {
      const db = wx.cloud.database();
      await db.collection('fortunes').doc(fortune._id).update({
        data: { isBookmarked: newVal },
      });
      this.setData({ 'fortune.isBookmarked': newVal });
      wx.showToast({ title: newVal ? '已收藏' : '已取消收藏', icon: 'success' });
    } catch (e) {
      console.error('Toggle bookmark error:', e);
    }
  },
});
