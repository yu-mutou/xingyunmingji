// 农历数据：2024-2030 年每月初一对应的公历日期 (year: [month1_day, month2_day, ...])
const LUNAR_INFO = {
  2024: [2, 10, 3, 10, 4, 9, 5, 8, 6, 6, 7, 6, 8, 4, 9, 3, 10, 3, 11, 1, 12, 1, 12, 31],
  2025: [1, 29, 2, 28, 3, 29, 4, 28, 5, 28, 6, 26, 7, 25, 8, 23, 9, 22, 10, 22, 11, 20, 12, 20],
  2026: [1, 18, 2, 17, 3, 19, 4, 17, 5, 17, 6, 15, 7, 14, 8, 13, 9, 11, 10, 10, 11, 9, 12, 9],
  2027: [1, 7, 2, 6, 3, 8, 4, 7, 5, 6, 6, 5, 7, 4, 8, 2, 9, 1, 9, 30, 10, 29, 11, 28],
  2028: [1, 27, 2, 25, 3, 26, 4, 25, 5, 24, 6, 23, 7, 22, 8, 21, 9, 19, 10, 19, 11, 17, 12, 16],
  2029: [1, 15, 2, 14, 3, 15, 4, 14, 5, 13, 6, 12, 7, 11, 8, 10, 9, 8, 10, 8, 11, 6, 12, 6],
  2030: [1, 4, 2, 3, 3, 4, 4, 3, 5, 2, 6, 1, 6, 30, 7, 29, 8, 27, 9, 26, 10, 26, 11, 24],
};

const LUNAR_MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const LUNAR_DAY_NAMES = [
  '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
];

// 公历日期一年中的第几天
function dayOfYear(year, month, day) {
  const m = month - 1;
  return Math.floor((new Date(year, month - 1, day) - new Date(year, 0, 0)) / 86400000);
}

// 获取农历日期 (返回格式: { year, month, day, monthName, dayName })
function getLunarDate(date) {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const doy = dayOfYear(year, month, day);

  const info = LUNAR_INFO[year];
  if (!info) return { year, month, day, monthName: '', dayName: '' };

  // 找出当前公历日期之前的最后一个初一
  let lunarMonth = -1;
  let lunarDay = -1;
  for (let i = 0; i < 12; i++) {
    const firstDayMonth = info[i * 2];
    const firstDayDay = info[i * 2 + 1];
    const firstDayDOY = dayOfYear(year, firstDayMonth, firstDayDay);
    if (doy >= firstDayDOY) {
      lunarMonth = i;
      lunarDay = doy - firstDayDOY + 1;
    } else {
      break;
    }
  }

  if (lunarMonth === -1) {
    // 当前日期在正月之前，属于上一年的腊月
    const prevInfo = LUNAR_INFO[year - 1];
    if (prevInfo) {
      const lastMonth = 11;
      const firstDayMonth = prevInfo[lastMonth * 2];
      const firstDayDay = prevInfo[lastMonth * 2 + 1];
      const prevYearLastDay = new Date(year - 1, 11, 31);
      const firstDayDOY = dayOfYear(year - 1, firstDayMonth, firstDayDay);
      const totalDays = Math.floor((new Date(year, 0, 0) - new Date(year - 1, 0, 0)) / 86400000);
      const firstDayAbs = dayOfYear(year - 1, firstDayMonth, firstDayDay);
      const doyAbs = totalDays - (dayOfYear(year, 1, 1) - doy);
      // Simplified: approximate
      return { year: year - 1, month: 12, day: doy + 30 - firstDayAbs + 1, monthName: '腊', dayName: LUNAR_DAY_NAMES[Math.min(doy + 30 - firstDayAbs + 1, 30)] || '' };
    }
    return { year, month, day, monthName: '', dayName: '' };
  }

  return {
    year,
    month: lunarMonth + 1,
    day: lunarDay,
    monthName: LUNAR_MONTH_NAMES[lunarMonth] || '',
    dayName: LUNAR_DAY_NAMES[Math.min(lunarDay, 30)] || '',
  };
}

// 获取今日日期字符串 YYYY-MM-DD
function getTodayDateStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 获取最近 N 天的日期字符串数组
function getRecentDateStrs(days) {
  const result = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    result.push(`${y}-${m}-${day}`);
  }
  return result;
}

// 格式化日期为中文显示
function formatDate(dateStr) {
  const parts = dateStr.split('-');
  return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`;
}

module.exports = {
  getLunarDate,
  getTodayDateStr,
  getRecentDateStrs,
  formatDate,
};
