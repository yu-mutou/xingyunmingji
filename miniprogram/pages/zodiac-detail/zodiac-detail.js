const { ZODIAC_SIGNS } = require('../../utils/constants');

Page({
  data: {
    allSigns: ZODIAC_SIGNS,
    currentKey: '',
    data: null,
    compatibleList: [],
  },

  onLoad(options) {
    const key = options.key || 'aries';
    this.loadZodiacData(key);
  },

  onSwitchSign(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.currentKey) return;
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
    this.loadZodiacData(key);
  },

  async loadZodiacData(key) {
    this.setData({ currentKey: key });
    try {
      const db = wx.cloud.database();
      const res = await db.collection('encyclopedia_zodiac').where({ key }).get();
      if (res.data && res.data.length > 0) {
        this.renderData(res.data[0]);
        return;
      }
    } catch (e) {
      console.error('Load zodiac data error:', e);
    }
    // Fallback to static data
    const zodiac = ZODIAC_SIGNS.find(z => z.key === key);
    if (zodiac) {
      this.renderData({ ...zodiac, personality: '', loveStyle: '', careerStyle: '', strengths: [], weaknesses: [], compatibleZodiacs: [], ruler: '' });
    }
  },

  renderData(data) {
    const compatList = (data.compatibleZodiacs || []).map(k => {
      const z = ZODIAC_SIGNS.find(z => z.key === k);
      return z || { key: k, name: k, icon: '' };
    });
    wx.setNavigationBarTitle({ title: data.name });
    this.setData({ data, compatibleList: compatList, currentKey: data.key });
  },
});
