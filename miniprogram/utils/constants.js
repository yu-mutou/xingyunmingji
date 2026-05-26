// 星座枚举
const ZODIAC_SIGNS = [
  { key: 'aries', name: '白羊座', dateRange: '3.21-4.19', element: '火象', emoji: '♈' },
  { key: 'taurus', name: '金牛座', dateRange: '4.20-5.20', element: '土象', emoji: '♉' },
  { key: 'gemini', name: '双子座', dateRange: '5.21-6.21', element: '风象', emoji: '♊' },
  { key: 'cancer', name: '巨蟹座', dateRange: '6.22-7.22', element: '水象', emoji: '♋' },
  { key: 'leo', name: '狮子座', dateRange: '7.23-8.22', element: '火象', emoji: '♌' },
  { key: 'virgo', name: '处女座', dateRange: '8.23-9.22', element: '土象', emoji: '♍' },
  { key: 'libra', name: '天秤座', dateRange: '9.23-10.23', element: '风象', emoji: '♎' },
  { key: 'scorpio', name: '天蝎座', dateRange: '10.24-11.22', element: '水象', emoji: '♏' },
  { key: 'sagittarius', name: '射手座', dateRange: '11.23-12.21', element: '火象', emoji: '♐' },
  { key: 'capricorn', name: '摩羯座', dateRange: '12.22-1.19', element: '土象', emoji: '♑' },
  { key: 'aquarius', name: '水瓶座', dateRange: '1.20-2.18', element: '风象', emoji: '♒' },
  { key: 'pisces', name: '双鱼座', dateRange: '2.19-3.20', element: '水象', emoji: '♓' },
];

// 生肖枚举
const CHINESE_ZODIACS = [
  { key: 'rat', name: '鼠', wuxing: '水', emoji: '🐭' },
  { key: 'ox', name: '牛', wuxing: '土', emoji: '🐮' },
  { key: 'tiger', name: '虎', wuxing: '木', emoji: '🐯' },
  { key: 'rabbit', name: '兔', wuxing: '木', emoji: '🐰' },
  { key: 'dragon', name: '龙', wuxing: '土', emoji: '🐲' },
  { key: 'snake', name: '蛇', wuxing: '火', emoji: '🐍' },
  { key: 'horse', name: '马', wuxing: '火', emoji: '🐴' },
  { key: 'goat', name: '羊', wuxing: '土', emoji: '🐑' },
  { key: 'monkey', name: '猴', wuxing: '金', emoji: '🐵' },
  { key: 'rooster', name: '鸡', wuxing: '金', emoji: '🐔' },
  { key: 'dog', name: '狗', wuxing: '土', emoji: '🐶' },
  { key: 'pig', name: '猪', wuxing: '水', emoji: '🐷' },
];

// 六大维度
const DIMENSION_KEYS = ['career', 'wealth', 'love', 'health', 'academics', 'interpersonal'];
const DIMENSION_LABELS = {
  career: '事业',
  wealth: '财运',
  love: '感情',
  health: '健康',
  academics: '学业',
  interpersonal: '人际',
};
const DIMENSION_ICONS = {
  career: '💼',
  wealth: '💰',
  love: '💕',
  health: '🏃',
  academics: '📚',
  interpersonal: '🤝',
};

// 运势等级
const FORTUNE_LEVELS = [
  { label: '大吉', color: '#FFD700', minScore: 90 },
  { label: '吉', color: '#52C41A', minScore: 70 },
  { label: '平', color: '#8C8C8C', minScore: 50 },
  { label: '凶', color: '#F53F3F', minScore: 30 },
  { label: '大凶', color: '#F53F3F', minScore: 0 },
];

// 宜忌分类
const CATEGORY_LABELS = {
  life: '生活',
  work: '工作',
  social: '社交',
  travel: '出行',
};

const CATEGORY_ICONS = {
  life: '🏠',
  work: '💻',
  social: '💬',
  travel: '✈️',
};

// 幸运色色板
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

// 幸运方位
const DIRECTIONS = ['东', '东南', '南', '西南', '西', '西北', '北', '东北'];

// 元素兼容性矩阵 (火/土/风/水)
const ELEMENT_COMPATIBILITY = {
  '火象': { '火象': 10, '风象': 15, '土象': 0, '水象': -10 },
  '土象': { '土象': 10, '水象': 15, '风象': 0, '火象': 0 },
  '风象': { '风象': 10, '火象': 15, '水象': 0, '土象': -10 },
  '水象': { '水象': 10, '土象': 15, '火象': -10, '风象': 0 },
};

// 生肖五行兼容矩阵
const WUXING_COMPATIBILITY = {
  '金': { '水': 15, '土': 10, '金': 5, '木': -5, '火': -10 },
  '木': { '火': 15, '水': 10, '木': 5, '土': -5, '金': -10 },
  '水': { '木': 15, '金': 10, '水': 5, '火': -5, '土': -10 },
  '火': { '土': 15, '木': 10, '火': 5, '金': -5, '水': -10 },
  '土': { '金': 15, '火': 10, '土': 5, '水': -5, '木': -10 },
};

module.exports = {
  ZODIAC_SIGNS,
  CHINESE_ZODIACS,
  DIMENSION_KEYS,
  DIMENSION_LABELS,
  DIMENSION_ICONS,
  FORTUNE_LEVELS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  LUCKY_COLORS,
  DIRECTIONS,
  ELEMENT_COMPATIBILITY,
  WUXING_COMPATIBILITY,
};
