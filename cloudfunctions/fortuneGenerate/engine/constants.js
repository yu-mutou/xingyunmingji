const LUCKY_COLORS = [
  { name: '星云紫', hex: '#7B61FF' },
  { name: '星空蓝', hex: '#4A80F0' },
  { name: '玫瑰红', hex: '#E84855' },
  { name: '暖阳橙', hex: '#FF8C42' },
  { name: '薄荷绿', hex: '#3CB371' },
  { name: '樱花粉', hex: '#FFB7C5' },
  { name: '大地棕', hex: '#8B6914' },
  { name: '深海蓝', hex: '#1E3A5F' },
  { name: '鹅黄', hex: '#FFF4C2' },
  { name: '纯白', hex: '#FFFFFF' },
  { name: '墨绿', hex: '#2E4A3A' },
  { name: '银灰', hex: '#C0C0C0' },
];

const DIRECTIONS = ['东', '东南', '南', '西南', '西', '西北', '北', '东北'];

const ZODIAC_KEYS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const ZODIAC_NAMES = {
  aries: '白羊座', taurus: '金牛座', gemini: '双子座', cancer: '巨蟹座',
  leo: '狮子座', virgo: '处女座', libra: '天秤座', scorpio: '天蝎座',
  sagittarius: '射手座', capricorn: '摩羯座', aquarius: '水瓶座', pisces: '双鱼座',
};

const DIMENSION_KEYS = ['career', 'wealth', 'love', 'health', 'academics', 'interpersonal'];

const BASE_WEIGHTS = {
  career: 1.2, wealth: 1.0, love: 1.1, health: 1.0, academics: 0.9, interpersonal: 0.9,
};

const FORTUNE_LEVELS = [
  { label: '大吉', color: '#FFD700', minScore: 90 },
  { label: '吉', color: '#52C41A', minScore: 70 },
  { label: '平', color: '#8C8C8C', minScore: 50 },
  { label: '凶', color: '#F53F3F', minScore: 30 },
  { label: '大凶', color: '#F53F3F', minScore: 0 },
];

const CATEGORIES = ['life', 'work', 'social', 'travel'];

const CATEGORY_LABELS = { life: '生活', work: '工作', social: '社交', travel: '出行' };
const CATEGORY_ICONS = { life: '🏠', work: '💻', social: '💬', travel: '✈️' };

module.exports = {
  LUCKY_COLORS,
  DIRECTIONS,
  ZODIAC_KEYS,
  ZODIAC_NAMES,
  DIMENSION_KEYS,
  BASE_WEIGHTS,
  FORTUNE_LEVELS,
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
};
