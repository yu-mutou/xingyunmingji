const { ZODIAC_SIGNS, CHINESE_ZODIACS } = require('../../utils/constants');

const ALL_TIPS = [
  '清晨面向东方深呼吸三分钟，可以提升一天的能量场。',
  '今天适合穿暖色系衣服，能增强你的自信和魅力。',
  '办公桌上放一盆绿植，可以提升工作效率和创造力。',
  '出门前照镜子微笑一下，好运会跟着你的笑容来。',
  '整理钱包和包包，整洁的环境会吸引财运。',
  '今天适合喝一杯热茶，静下心来感受生活。',
  '对遇到的第一个人说声谢谢，感恩会带来好运。',
  '今天走路时抬头挺胸，好的姿态会吸引好的能量。',
  '睡前写下今天三件开心的事，养成积极心态。',
  '把手机屏幕亮度调低一档，给眼睛一点温柔。',
  '今天给家人发一条问候消息，亲情是最好的幸运符。',
  '遇到困难时深呼吸三次，冷静下来再出发。',
  '今天适合听一首新歌，音乐能抚慰心灵。',
  '饭后散步十五分钟，身心都会感到轻松。',
  '给自己买一朵花，生活需要小小的仪式感。',
  '和朋友分享一件开心事，快乐会加倍。',
  '把不需要的东西整理出来，断舍离能清理负能量。',
  '今天遇到好事就记录下来，形成正能量的习惯。',
  '对身边的人多说鼓励的话，温暖会双向流动。',
  '保持桌面的整洁，清爽的环境带来清爽的心情。',
  '午后闭目养神十分钟，下午的精力会更好。',
  '今天尝试走一条平时不走的路，换个视角看世界。',
  '自己动手做一顿饭，用心生活本身就是好运。',
  '主动向身边的人伸出援手，善缘会带来好运。',
];

// Shake divination results
const SHAKE_RESULTS = [
  { emoji: '🌟', title: '今天你是幸运星', text: '今天无论走到哪里，都会有人对你微笑。你的存在本身就是一种光芒。' },
  { emoji: '🌈', title: '惊喜在转角等你', text: '今天可能会收到一个意想不到的好消息，保持期待，但不执着。' },
  { emoji: '🦋', title: '蝴蝶效应日', text: '今天做的一件小事，会在未来引发美好的连锁反应。不妨多行动。' },
  { emoji: '🌙', title: '月亮的悄悄话', text: '今天适合独处和反思，一些困扰你的问题，会在安静中找到答案。' },
  { emoji: '🔥', title: '点燃热情的一天', text: '今天你对某件事会产生强烈的兴趣，抓住这个信号，它可能改变什么。' },
  { emoji: '🐱', title: '猫的幸运日', text: '像猫一样慵懒地度过今天吧——休息也是一种策略，不急不躁。' },
  { emoji: '🌊', title: '顺其自然', text: '今天不用刻意强求任何事情，顺势而为，一切都是最好的安排。' },
  { emoji: '🎪', title: '喜剧演员附体', text: '今天你的幽默感格外在线，一句玩笑可能会化解一个尴尬的局面。' },
  { emoji: '🧲', title: '吸引力法则', text: '今天你散发的能量特别强，想什么来什么——请多想好事。' },
  { emoji: '🎯', title: '一箭中的', text: '今天适合做重要决定，你的判断力比平时更敏锐。相信你的直觉。' },
  { emoji: '🌱', title: '种下一颗种子', text: '今天开始的某件事，会在不知不觉中发芽成长。不一定很快看到结果。' },
  { emoji: '🕊️', title: '和平使者', text: '今天适合修复一段关系，主动迈出第一步，对方也在等着。' },
  { emoji: '🎨', title: '艺术家时刻', text: '今天你的创造力旺盛，适合做一些有创意的事，哪怕只是摆盘。' },
  { emoji: '🗝️', title: '钥匙在你手中', text: '你一直在寻找的答案，其实你早就知道了。今天只是确认一下而已。' },
  { emoji: '💎', title: '发现宝藏', text: '今天你会在平凡中发现不平凡——一本好书、一个好想法、或一段有趣的对话。' },
  { emoji: '🚀', title: '准备起飞', text: '酝酿已久的计划，今天适合迈出第一步。不需要完美，只需要开始。' },
  { emoji: '🎵', title: '旋律日', text: '今天最好有音乐相伴。随机播放到的那首歌，歌词可能刚好在说你的故事。' },
  { emoji: '☕', title: '慢慢来', text: '今天不必赶时间，慢一点反而效率更高。享受过程，而不只是结果。' },
  { emoji: '🧩', title: '拼图完成时', text: '今天某个一直想不通的问题会豁然开朗。注意身边人随口说的话。' },
  { emoji: '🌻', title: '向阳而生', text: '今天你就是小太阳，不仅自己开心，还能照亮身边的人。主动关心一个人吧。' },
];

let lastShakeTime = 0;

Page({
  data: {
    zodiacList: ZODIAC_SIGNS,
    chineseZodiacList: CHINESE_ZODIACS,
    userZodiac: '',
    userChineseZodiac: '',
    dailyTips: [],
    shakeResult: null,
  },

  onShow() {
    const app = getApp();
    const profile = app.globalData.userProfile || {};
    this.setData({
      userZodiac: profile.zodiac || '',
      userChineseZodiac: profile.chineseZodiac || '',
    });
    this.pickTips();
    this.startShakeListen();
  },

  onHide() {
    this.stopShakeListen();
  },

  onUnload() {
    this.stopShakeListen();
  },

  pickTips() {
    const today = new Date();
    const doy = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const tips = [];
    for (let i = 0; i < 4; i++) {
      tips.push(ALL_TIPS[(doy + i * 7 + 3) % ALL_TIPS.length]);
    }
    this.setData({ dailyTips: tips });
  },

  // ===== Shake Detection =====
  startShakeListen() {
    let lastX = 0, lastY = 0, lastZ = 0;
    const threshold = 1.8; // shake sensitivity

    wx.onAccelerometerChange((res) => {
      const { x, y, z } = res;
      const delta = Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ);
      lastX = x; lastY = y; lastZ = z;

      if (delta > threshold) {
        const now = Date.now();
        if (now - lastShakeTime > 2000) {
          lastShakeTime = now;
          wx.vibrateShort();
          this.doShake();
        }
      }
    });
    wx.startAccelerometer({ interval: 'ui' });
  },

  stopShakeListen() {
    wx.stopAccelerometer();
  },

  onShakeTap() {
    wx.vibrateShort();
    this.doShake();
  },

  doShake() {
    const idx = Math.floor(Math.random() * SHAKE_RESULTS.length);
    this.setData({ shakeResult: SHAKE_RESULTS[idx] });

    // Auto-clear after 6 seconds
    clearTimeout(this._shakeTimer);
    this._shakeTimer = setTimeout(() => {
      this.setData({ shakeResult: null });
    }, 6000);
  },

  // ===== Navigation =====
  onTapZodiac(e) {
    const key = e.currentTarget.dataset.key;
    wx.navigateTo({ url: `/pages/zodiac-detail/zodiac-detail?key=${key}` });
  },

  onTapChineseZodiac(e) {
    const key = e.currentTarget.dataset.key;
    wx.navigateTo({ url: `/pages/chinese-zodiac-detail/chinese-zodiac-detail?key=${key}` });
  },

  onViewAllZodiac() {
    const key = this.data.userZodiac || 'aries';
    wx.navigateTo({ url: `/pages/zodiac-detail/zodiac-detail?key=${key}` });
  },

  onViewAllChineseZodiac() {
    const key = this.data.userChineseZodiac || 'rat';
    wx.navigateTo({ url: `/pages/chinese-zodiac-detail/chinese-zodiac-detail?key=${key}` });
  },

  onNavCompatibility() {
    wx.navigateTo({ url: '/pages/compatibility/compatibility' });
  },
});
