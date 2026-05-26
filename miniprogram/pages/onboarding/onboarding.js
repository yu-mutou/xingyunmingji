const { ZODIAC_SIGNS, CHINESE_ZODIACS } = require('../../utils/constants');
const { callCloudFunction } = require('../../utils/request');
const { setCache } = require('../../utils/storage-helper');

// Inline policy texts (same as settings page, for the privacy notice)
const PRIVACY_BRIEF = `
星运铭记小程序隐私政策

更新日期：2026年5月24日

【引言】
星运铭记（以下简称"我们"）深知个人信息对您的重要性。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。

【一、我们收集的信息】
1. 微信头像和昵称：通过微信chooseAvatar和nickname接口获取，仅用于小程序内展示。
2. 个人设置信息：您主动填写的星座、生肖、出生年份、性别，用于生成专属运势内容。
3. 运势记录：每日运势评分、宜忌内容、幸运信息等，用于历史记录查看。

【二、信息的使用】
- 为您生成和展示个性化的每日运势内容
- 保存运势历史记录，方便回溯查看
- 生成运势分享海报

【三、信息的存储与保护】
您的个人信息存储在微信云开发平台，采用微信云开发安全机制保护。我们不会主动将您的个人信息提供给任何第三方。

【四、您的权利】
您可以在个人中心清除缓存来删除本地信息。

【五、联系我们】
如有任何问题，请通过小程序内的"意见反馈"功能联系我们。
`;

const TERMS_BRIEF = `
星运铭记小程序用户服务协议

更新日期：2026年5月24日

【一、服务说明】
本小程序是一款提供每日运势参考内容的娱乐性质小程序。所有运势内容均为基于算法的内容生成结果，仅供用户日常娱乐和参考，不构成任何实质性建议或承诺。

【二、免责声明】
本小程序的运势内容由算法自动生成，我们不对内容的准确性、完整性做任何保证。用户因依赖本小程序内容而产生的任何损失，我们不承担责任。

【三、知识产权】
本小程序的所有内容知识产权归开发者所有。

【四、争议解决】
本协议适用中华人民共和国法律。
`;

Page({
  data: {
    zodiacOptions: ZODIAC_SIGNS,
    chineseZodiacOptions: CHINESE_ZODIACS,
    userInfo: { nickname: '', avatarUrl: '' },
    formData: {
      zodiac: '',
      chineseZodiac: '',
      birthYear: '',
      gender: '',
    },
    birthYearValue: '2000',
    canSubmit: false,
    showPolicy: false,
    policyTitle: '',
    policyContent: '',
  },

  checkCanSubmit() {
    const f = this.data.formData;
    const can = !!f.zodiac && !!f.chineseZodiac && !!f.birthYear;
    // nickname is optional: use default if not set
    this.setData({ canSubmit: can });
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl;
    if (avatarUrl) {
      this.setData({ 'userInfo.avatarUrl': avatarUrl });
      this.checkCanSubmit();
    }
  },

  onNicknameBlur(e) {
    const nickname = e.detail.value;
    if (nickname && nickname.trim()) {
      this.setData({ 'userInfo.nickname': nickname.trim() });
      this.checkCanSubmit();
    }
  },

  onPickSelect(e) {
    const { key, value } = e.currentTarget.dataset;
    this.setData({ [`formData.${key}`]: value });
    this.checkCanSubmit();
  },

  onYearChange(e) {
    const year = e.detail.value;
    this.setData({
      formData: { ...this.data.formData, birthYear: parseInt(year) },
      birthYearValue: year,
    });
    this.checkCanSubmit();
  },

  async onSubmit() {
    if (!this.data.canSubmit) return;

    wx.showLoading({ title: '保存中...', mask: true });

    // Upload avatar to cloud storage if it's a temp file
    let avatarUrl = this.data.userInfo.avatarUrl || '';
    if (avatarUrl && avatarUrl.startsWith('http://tmp/') || avatarUrl.startsWith('wxfile://')) {
      try {
        const cloudPath = `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: avatarUrl,
        });
        avatarUrl = uploadRes.fileID;
      } catch (e) {
        console.warn('Avatar upload failed, using empty:', e);
        avatarUrl = '';
      }
    }

    try {
      const result = await callCloudFunction('userManager', {
        action: 'saveProfile',
        data: {
          nickname: this.data.userInfo.nickname || '星运用户',
          avatarUrl,
          zodiac: this.data.formData.zodiac,
          chineseZodiac: this.data.formData.chineseZodiac,
          birthYear: this.data.formData.birthYear,
          gender: this.data.formData.gender,
        },
      }, { showLoading: false });

      if (result.success) {
        const app = getApp();
        app.globalData.userProfile = result.data;
        app.globalData.isOnboarded = true;
        setCache('userProfile', result.data);
        wx.switchTab({ url: '/pages/home/home' });
      }
    } catch (err) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  },

  onPrivacyTap() {
    this.setData({ showPolicy: true, policyTitle: '隐私政策', policyContent: PRIVACY_BRIEF });
  },

  onTermsTap() {
    this.setData({ showPolicy: true, policyTitle: '用户服务协议', policyContent: TERMS_BRIEF });
  },

  onPolicyClose() {
    this.setData({ showPolicy: false });
  },
});
