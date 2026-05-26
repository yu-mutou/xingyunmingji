const { CHINESE_ZODIACS } = require('../../utils/constants');

Page({
  data: {
    allSigns: CHINESE_ZODIACS,
    currentKey: '',
    data: null,
    compatibleList: [],
  },

  onLoad(options) {
    const key = options.key || 'rat';
    this.loadData(key);
  },

  onSwitchSign(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.currentKey) return;
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
    this.loadData(key);
  },

  async loadData(key) {
    this.setData({ currentKey: key });
    try {
      const db = wx.cloud.database();
      const res = await db.collection('encyclopedia_chinese_zodiac').where({ key }).get();
      if (res.data && res.data.length > 0) {
        this.renderData(res.data[0]);
        return;
      }
    } catch (e) {
      console.error('Load chinese zodiac data error:', e);
    }
    const cz = CHINESE_ZODIACS.find(z => z.key === key);
    if (cz) {
      this.renderData({ ...cz, personality: '', strengths: [], weaknesses: [], compatibleZodiacs: [], years: [] });
    }
  },

  renderData(data) {
    const compatList = (data.compatibleZodiacs || []).map(k => {
      const z = CHINESE_ZODIACS.find(z => z.key === k);
      return z || { key: k, name: k, icon: '' };
    });
    wx.setNavigationBarTitle({ title: `属${data.name}详解` });
    this.setData({ data, compatibleList: compatList, currentKey: data.key });
  },
});
