const { callCloudFunction } = require('../../utils/request');
const { getLunarDate, getTodayDateStr, formatDate } = require('../../utils/date-utils');
const {
  ZODIAC_SIGNS, CHINESE_ZODIACS, DIMENSION_KEYS, DIMENSION_LABELS, DIMENSION_ICONS,
} = require('../../utils/constants');

function getBarColor(score) {
  if (score >= 70) return '#52C41A';
  if (score >= 50) return '#FFD700';
  return '#F53F3F';
}

// Lucky item pool
const LUCKY_ITEMS = [
  { emoji: '☕', name: '一杯热咖啡', tip: '午后喝杯咖啡，灵感会悄然而至' },
  { emoji: '📖', name: '一本好书', tip: '今天翻开的那一页，藏着给你的答案' },
  { emoji: '🌹', name: '一朵玫瑰', tip: '送自己一朵花，今天的心情会很美' },
  { emoji: '🕯️', name: '一支蜡烛', tip: '点燃它，让温暖的烛光照亮你的思绪' },
  { emoji: '🎵', name: '一首老歌', tip: '随机播放到的旋律，会让你想起美好时光' },
  { emoji: '🍀', name: '一片四叶草', tip: '留意路边的小幸运，今天会遇到惊喜' },
  { emoji: '🧸', name: '一只玩偶', tip: '抱抱柔软的玩偶，给内心小孩一点温柔' },
  { emoji: '💌', name: '一封手写信', tip: '提笔写几个字，文字的力量会让今天更温暖' },
  { emoji: '🌻', name: '一株向日葵', tip: '不管有没有太阳，今天你都要向阳而生' },
  { emoji: '🍵', name: '一杯清茶', tip: '慢慢品味，平静的心态是最好的运势' },
  { emoji: '🎐', name: '一只风铃', tip: '微风吹过时，清脆的声音会带走你的烦恼' },
  { emoji: '🧤', name: '一副手套', tip: '保护好自己的双手，今天你是被呵护的' },
  { emoji: '🔮', name: '一颗水晶球', tip: '今天你的直觉格外准确，多听听内心声音' },
  { emoji: '🕶️', name: '一副墨镜', tip: '换个角度看世界，会看到不一样的风景' },
  { emoji: '🧩', name: '一块拼图', tip: '今天做的一件小事，会是完整拼图的重要一块' },
];

// Daily quotes by fortune level
const QUOTES = {
  '大吉': [
    '当你在追光的时候，你也在发光。',
    '好运不是等来的，是你准备好的时候恰好出现的。',
    '今天的你，值得世界上所有的美好。',
    '每一个不曾起舞的日子，都是对生命的辜负。',
    '相信奇迹的人，本身就和奇迹一样了不起。',
    '今天没有什么事能难倒你，冲就对了。',
  ],
  '吉': [
    '万物皆有裂痕，那是光照进来的地方。',
    '走得慢不要紧，只要方向对了，每一步都算数。',
    '你今天遇到的每一个人，都是恰到好处的安排。',
    '生活不会辜负每一个认真生活的人。',
    '最温柔的力量，是水滴石穿的坚持。',
    '做好手头的每一件小事，幸运会不请自来。',
  ],
  '平': [
    '平静的日子，是生活给你充电的机会。',
    '不急不躁，今天适合做自己。',
    '日复一日的平凡里，藏着最真实的幸福。',
    '有时候，停下来也是一种前进。',
    '花朵不必急着盛开，属于你的季节会到来。',
    '简单的日子，用心过就是最好的生活。',
  ],
  '凶': [
    '今天的坎坷，是明天故事的素材。',
    '没有永远的雨天，乌云后面藏着阳光。',
    '外界的声音只是参考，你不开心就不参考。',
    '今天的退一步，是为了明天跨得更远。',
    '有些日子看起来灰暗，但它是为了让你更珍惜晴天的美好。',
    '你不是在后退，你是在助跑。',
  ],
  '大凶': [
    '最深的夜里，才能看到最亮的星星。',
    '今天或许很难，但你不是一个人。',
    '无论今天多糟糕，明天都会是新的一天。',
    '人生没有过不去的坎，只有过不完的坎——但你会越来越强。',
    '有时候觉得自己不够好，其实是你低估了自己的韧性。',
  ],
};

// Simple hash for deterministic daily selection
function dailyHash(seed, poolLen) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % poolLen;
}

// Check-in helpers
function getCheckinKey() {
  return 'checkin_data';
}

function loadCheckin() {
  try {
    const raw = wx.getStorageSync(getCheckinKey());
    return raw ? JSON.parse(raw) : { dates: [] };
  } catch (e) {
    return { dates: [] };
  }
}

function saveCheckin(data) {
  wx.setStorageSync(getCheckinKey(), JSON.stringify(data));
}

Page({
  data: {
    loading: true,
    fortune: null,
    displayDate: '',
    lunarMonth: '',
    lunarDay: '',
    zodiacName: '',
    zodiacIcon: '',
    chineseZodiacName: '',
    userProfile: null,
    dimensionList: [],
    showRefreshModal: false,
    showPosterModal: false,
    canRefresh: true,
    luckyItem: null,
    dailyQuote: '',
    checkedToday: false,
    checkinStreak: 0,
    checkinWeek: [],
  },

  onLoad() {
    this.loadCheckinData();
    this.loadFortune();
  },

  onShow() {
    const app = getApp();
    if (!app.globalData.isOnboarded) {
      wx.reLaunch({ url: '/pages/onboarding/onboarding' });
      return;
    }

    const profile = app.globalData.userProfile;
    if (profile) {
      this.setupProfileInfo(profile);
    }

    this.loadCheckinData();

    const today = getTodayDateStr();
    if (app.globalData.todayFortune && app.globalData.fortuneDate === today) {
      this.renderFortune(app.globalData.todayFortune);
      this.setData({ loading: false });
    } else if (!this.data.fortune) {
      this.loadFortune();
    }
  },

  onPullDownRefresh() {
    this.loadFortune().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  setupProfileInfo(profile) {
    const zodiac = ZODIAC_SIGNS.find(z => z.key === profile.zodiac);
    const cz = CHINESE_ZODIACS.find(z => z.key === profile.chineseZodiac);
    this.setData({
      userProfile: profile,
      zodiacName: zodiac ? zodiac.name : '',
      zodiacIcon: zodiac ? zodiac.emoji : '',
      chineseZodiacName: cz ? cz.name : '',
    });
  },

  loadCheckinData() {
    const today = getTodayDateStr();
    const data = loadCheckin();
    const dates = data.dates || [];

    // Calc streak
    let streak = 0;
    const now = new Date();
    for (let i = dates.length - 1; i >= 0; i--) {
      const d = new Date(dates[i]);
      const expected = new Date(now);
      expected.setDate(expected.getDate() - streak);
      if (d.toDateString() === expected.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    const checkedToday = dates.length > 0 && dates[dates.length - 1] === today;

    // Last 7 days
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      week.push({
        day: String(d.getDate()),
        checked: dates.includes(ds),
      });
    }

    this.setData({ checkedToday, checkinStreak: streak, checkinWeek: week });
  },

  onCheckin() {
    const today = getTodayDateStr();
    const data = loadCheckin();
    const dates = data.dates || [];

    if (dates[dates.length - 1] === today) {
      wx.showToast({ title: '今日已打卡 ✓', icon: 'none' });
      return;
    }

    dates.push(today);
    // Keep only last 365 days
    if (dates.length > 365) dates.shift();
    saveCheckin({ dates });
    this.loadCheckinData();

    wx.vibrateShort();
    wx.showToast({ title: `已连续打卡 ${this.data.checkinStreak + 1} 天 🔥`, icon: 'none' });
  },

  async loadFortune() {
    this.setData({ loading: true });

    try {
      const result = await callCloudFunction('fortuneGenerate', {
        action: 'getToday',
      }, { loadingText: '运势加载中...' });

      if (result.success) {
        this.renderFortune(result.data);

        const app = getApp();
        app.globalData.todayFortune = result.data;
        app.globalData.fortuneDate = result.data.date;

        this.setData({ canRefresh: result.data.refreshCount < 1 });
      } else if (result.errMsg === 'NO_USER_PROFILE') {
        wx.reLaunch({ url: '/pages/onboarding/onboarding' });
      }
    } catch (err) {
      // Error toast already handled by request.js
    }

    this.setData({ loading: false });
  },

  renderFortune(fortune) {
    const today = new Date();
    const lunar = getLunarDate(today);
    const dims = fortune.dimensions || {};

    const dimensionList = DIMENSION_KEYS.map(key => ({
      key,
      name: DIMENSION_LABELS[key],
      icon: DIMENSION_ICONS[key],
      score: dims[key] ? dims[key].score : 0,
      comment: dims[key] ? dims[key].comment : '',
      barColor: getBarColor(dims[key] ? dims[key].score : 0),
    }));

    // Pick lucky item based on today's date
    const todayStr = getTodayDateStr();
    const itemIdx = dailyHash(todayStr, LUCKY_ITEMS.length);
    const luckyItem = LUCKY_ITEMS[itemIdx];

    // Pick daily quote based on fortune level
    const quotePool = QUOTES[fortune.level] || QUOTES['平'];
    const quoteIdx = dailyHash(todayStr + fortune.level, quotePool.length);
    const dailyQuote = quotePool[quoteIdx];

    this.setData({
      fortune,
      displayDate: formatDate(fortune.date),
      lunarMonth: lunar.monthName,
      lunarDay: lunar.dayName,
      dimensionList,
      luckyItem,
      dailyQuote,
      canRefresh: fortune.refreshCount < 1,
    });
  },

  // Refresh flow
  onRefreshTap() {
    if (!this.data.canRefresh) {
      wx.showToast({ title: '今日刷新次数已用完，明日再来哦', icon: 'none' });
      return;
    }
    this.setData({ showRefreshModal: true });
  },

  onRefreshConfirm() {
    this.setData({ showRefreshModal: false });
    this.doRefresh();
  },

  onRefreshCancel() {
    this.setData({ showRefreshModal: false });
  },

  async doRefresh() {
    this.setData({ loading: true });
    try {
      const result = await callCloudFunction('fortuneGenerate', {
        action: 'refresh',
      }, { loadingText: '正在刷新运势...' });

      if (result.success) {
        this.renderFortune(result.data);
        const app = getApp();
        app.globalData.todayFortune = result.data;
        wx.showToast({ title: '运势已刷新', icon: 'success' });
      } else if (result.errMsg === 'REFRESH_LIMIT_REACHED') {
        wx.showToast({ title: '今日刷新次数已用完，明日再来哦', icon: 'none' });
      }
    } catch (err) {
      // handled by request.js
    }
    this.setData({ loading: false });
  },

  // Poster flow
  onPosterTap() {
    this.setData({ showPosterModal: true });
  },

  onPosterClose() {
    this.setData({ showPosterModal: false });
  },

  // Share
  onShareAppMessage() {
    const f = this.data.fortune || {};
    const app = getApp();
    return {
      title: `今日星运 | ${f.level || '吉'} — 星运铭记`,
      path: '/pages/home/home',
      imageUrl: app.globalData.posterShareUrl || '',
    };
  },

  onShareTimeline() {
    const f = this.data.fortune || {};
    return {
      title: `今日星运 · ${f.level || '吉'} — 星运铭记`,
      query: '',
    };
  },
});
