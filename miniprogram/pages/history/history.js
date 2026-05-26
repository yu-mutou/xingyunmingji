Page({
  data: {
    filter: 'all',
    list: [],
  },

  onLoad(options) {
    if (options.filter === 'bookmarked') {
      this.setData({ filter: 'bookmarked' });
    }
    this.loadList();
  },

  async loadList() {
    try {
      const db = wx.cloud.database();
      let query = db.collection('fortunes').orderBy('date', 'desc').limit(30);
      if (this.data.filter === 'bookmarked') {
        query = query.where({ isBookmarked: true });
      }
      const res = await query.get();
      this.setData({ list: res.data || [] });
    } catch (e) {
      console.error('Load history error:', e);
    }
  },

  onFilterTap(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ filter });
    this.loadList();
  },

  onTapItem(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/fortune-detail/fortune-detail?id=${id}` });
  },

  onGoHome() {
    wx.switchTab({ url: '/pages/home/home' });
  },
});
