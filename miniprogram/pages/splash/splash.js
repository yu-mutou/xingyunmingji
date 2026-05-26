Page({
  data: {
    showPrivacy: false,
  },

  onLoad() {
    // Check if privacy was already agreed
    const agreed = wx.getStorageSync('__privacy_agreed__');
    if (agreed) {
      this.startFlow();
    } else {
      // Show privacy modal after brief delay
      setTimeout(() => {
        this.setData({ showPrivacy: true });
      }, 600);
    }
  },

  startFlow() {
    // Seed encyclopedia data on first launch (idempotent)
    this.seedDataIfNeeded();

    setTimeout(() => {
      const app = getApp();
      if (app.globalData.isOnboarded) {
        wx.switchTab({ url: '/pages/home/home' });
      } else {
        wx.reLaunch({ url: '/pages/onboarding/onboarding' });
      }
    }, 1200);
  },

  onPrivacyAgree() {
    this.setData({ showPrivacy: false });
    this.startFlow();
  },

  seedDataIfNeeded() {
    const seeded = wx.getStorageSync('__encyclopedia_seeded__');
    if (seeded) return;

    wx.cloud
      .callFunction({
        name: 'dataSeeder',
        data: { action: 'seedAll' },
      })
      .then((res) => {
        if (res.result && res.result.success) {
          wx.setStorageSync('__encyclopedia_seeded__', true);
          console.log('Encyclopedia seeded:', res.result.message);
        }
      })
      .catch((err) => {
        console.warn('Seed encyclopedia failed, will retry next launch:', err);
      });
  },
});
