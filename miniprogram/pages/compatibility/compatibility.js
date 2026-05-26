const { ZODIAC_SIGNS, CHINESE_ZODIACS, ELEMENT_COMPATIBILITY, WUXING_COMPATIBILITY } = require('../../utils/constants');

// Simple hash for compatibility score
function pairHash(a, b) {
  let h = 0;
  const s = a < b ? a + b : b + a;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 100;
}

function getLevel(score) {
  if (score >= 85) return { level: '天作之合', color: '#FFD700' };
  if (score >= 70) return { level: '相得益彰', color: '#52C41A' };
  if (score >= 50) return { level: '平平淡淡', color: '#8C8C8C' };
  return { level: '需要磨合', color: '#F53F3F' };
}

Page({
  data: {
    mode: 'zodiac',
    item1: {},
    item2: {},
    selectingIndex: 0,
    showPicker: false,
    pickerOptions: [],
    canMatch: false,
    result: null,
  },

  onLoad(options) {
    const mode = options.mode || 'zodiac';
    this.setData({ mode });
    if (options.key1 && options.key2) {
      const list = mode === 'zodiac' ? ZODIAC_SIGNS : CHINESE_ZODIACS;
      const i1 = list.find(i => i.key === options.key1);
      const i2 = list.find(i => i.key === options.key2);
      if (i1 && i2) {
        this.setData({
          item1: { key: i1.key, name: i1.name, emoji: i1.emoji },
          item2: { key: i2.key, name: i2.name, emoji: i2.emoji },
          canMatch: true,
        });
        this.doMatch(i1, i2);
      }
    }
  },

  onModeSwitch(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ mode, item1: {}, item2: {}, canMatch: false, result: null });
  },

  onSelect1() { this.setData({ showPicker: true, selectingIndex: 0, pickerOptions: this.getOptions() }); },
  onSelect2() { this.setData({ showPicker: true, selectingIndex: 1, pickerOptions: this.getOptions() }); },

  getOptions() {
    return this.data.mode === 'zodiac'
      ? ZODIAC_SIGNS.map(z => ({ key: z.key, name: z.name, emoji: z.emoji, element: z.element }))
      : CHINESE_ZODIACS.map(z => ({ key: z.key, name: z.name, emoji: z.emoji, wuxing: z.wuxing }));
  },

  onPickItem(e) {
    const { key, name, icon } = e.currentTarget.dataset;
    const newItem = { key, name, emoji: icon };
    const updates = { showPicker: false };
    if (this.data.selectingIndex === 0) {
      updates.item1 = newItem;
    } else {
      updates.item2 = newItem;
    }
    updates.canMatch = !!(updates.item1 || this.data.item1).key && !!(updates.item2 || this.data.item2).key;
    this.setData(updates);
  },

  onPickerClose() { this.setData({ showPicker: false }); },

  onMatch() {
    const { item1, item2 } = this.data;
    const opts = this.getOptions();
    const i1 = opts.find(i => i.key === item1.key);
    const i2 = opts.find(i => i.key === item2.key);
    if (i1 && i2) this.doMatch(i1, i2);
  },

  doMatch(i1, i2) {
    const baseScore = pairHash(i1.key, i2.key);
    let bonus = 0;

    if (this.data.mode === 'zodiac') {
      bonus = ELEMENT_COMPATIBILITY[i1.element] && ELEMENT_COMPATIBILITY[i1.element][i2.element]
        ? ELEMENT_COMPATIBILITY[i1.element][i2.element] : 0;
    } else {
      bonus = WUXING_COMPATIBILITY[i1.wuxing] && WUXING_COMPATIBILITY[i1.wuxing][i2.wuxing]
        ? WUXING_COMPATIBILITY[i1.wuxing][i2.wuxing] : 0;
    }

    const score = Math.max(1, Math.min(100, baseScore + bonus));
    const levelObj = getLevel(score);

    const descriptions = {
      '天作之合': `${i1.emoji}${i2.emoji} 你们的组合堪称完美！彼此相互理解、相互成就，是让人羡慕的一对。`,
      '相得益彰': `${i1.emoji}${i2.emoji} 你们在一起会碰撞出奇妙的火花，互相补充、共同成长。`,
      '平平淡淡': `${i1.emoji}${i2.emoji} 你们的关系没有太多波澜，但只要用心经营，也能细水长流。`,
      '需要磨合': `${i1.emoji}${i2.emoji} 你们的性格差异较大，需要更多的包容和理解，但并非不可能。`,
    };

    this.setData({
      result: {
        score,
        level: levelObj.level,
        levelColor: levelObj.color,
        description: descriptions[levelObj.level] || '',
        advice: '无论配对结果如何，真心才是最重要的。星座生肖只是参考，经营感情靠自己！',
      },
    });
  },
});
