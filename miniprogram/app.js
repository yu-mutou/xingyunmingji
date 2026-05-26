App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-d4g950ijp19c78ca6',
        traceUser: true,
      });
    }

    const profile = wx.getStorageSync('userProfile') || null;
    this.globalData.userProfile = profile;
    this.globalData.isOnboarded = !!profile;
  },

  globalData: {
    userProfile: null,
    isOnboarded: false,
    todayFortune: null,
    fortuneDate: null,
  },
});
