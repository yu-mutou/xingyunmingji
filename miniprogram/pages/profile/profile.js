const { ZODIAC_SIGNS, CHINESE_ZODIACS, FORTUNE_LEVELS } = require('../../utils/constants');
const { clearCache } = require('../../utils/storage-helper');

const TREND_ICONS = ['📉', '📈', '➡️'];

Page({
  data: {
    userInfo: {},
    zodiacName: '',
    chineseZodiacName: '',
    weekReport: null,
  },

  onShow() {
    const app = getApp();
    const profile = app.globalData.userProfile;
    if (profile) {
      const zodiac = ZODIAC_SIGNS.find(z => z.key === profile.zodiac);
      const cz = CHINESE_ZODIACS.find(z => z.key === profile.chineseZodiac);

      this.setData({
        userInfo: profile,
        zodiacName: zodiac ? zodiac.name : '',
        chineseZodiacName: cz ? `属${cz.name}` : '',
      });
    }
    this.loadWeekReport();
  },

  async loadWeekReport() {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('fortunes')
        .orderBy('date', 'desc')
        .limit(7)
        .get();

      if (res.data && res.data.length > 0) {
        this.buildReport(res.data);
        return;
      }
    } catch (e) {
      console.warn('Load week report failed (CF not deployed yet):', e.message);
    }
    this.setData({ weekReport: null });
  },

  buildReport(fortunes) {
    if (!fortunes.length) return;

    const scores = fortunes.map(f => f.overallScore);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    // Build trend: compare each day to previous
    const trend = scores.slice().reverse(); // oldest first
    const trendItems = [];
    for (let i = 0; i < trend.length; i++) {
      if (i === 0) {
        trendItems.push({ icon: '●', color: '#9CA3AF' });
      } else {
        const diff = trend[i] - trend[i - 1];
        if (diff > 5) trendItems.push({ icon: '▲', color: '#52C41A' });
        else if (diff < -5) trendItems.push({ icon: '▼', color: '#F53F3F' });
        else trendItems.push({ icon: '─', color: '#9CA3AF' });
      }
    }

    this.setData({
      weekReport: { avg, max, min, trend: trendItems },
    });
  },

  onEditProfile() {
    wx.navigateTo({ url: '/pages/onboarding/onboarding' });
  },

  onNavHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  },

  onNavFavorites() {
    wx.navigateTo({ url: '/pages/history/history?filter=bookmarked' });
  },

  onNavFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  },

  onClearCache() {
    wx.showModal({
      title: '确认清除',
      content: '清除缓存后需要重新完善个人信息',
      success: (res) => {
        if (res.confirm) {
          clearCache();
          const app = getApp();
          app.globalData.userProfile = null;
          app.globalData.isOnboarded = false;
          app.globalData.todayFortune = null;
          wx.showToast({ title: '已清除', icon: 'success' });
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/splash/splash' });
          }, 800);
        }
      },
    });
  },

  onNavAbout() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  onNavPrivacy() {
    wx.showToast({ title: '隐私政策页面待完善', icon: 'none' });
  },

  onNavTerms() {
    wx.showToast({ title: '服务协议页面待完善', icon: 'none' });
  },
});
