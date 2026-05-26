Page({
  data: {
    content: '',
    contact: '',
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value });
  },

  async onSubmit() {
    const content = this.data.content.trim();
    if (!content) return;

    try {
      const db = wx.cloud.database();
      await db.collection('feedbacks').add({
        data: {
          content,
          contact: this.data.contact.trim(),
          createdAt: new Date(),
        },
      });
      wx.showToast({ title: '感谢您的反馈！', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1200);
    } catch (e) {
      console.error('Submit feedback error:', e);
      wx.showToast({ title: '提交失败，请重试', icon: 'none' });
    }
  },
});
