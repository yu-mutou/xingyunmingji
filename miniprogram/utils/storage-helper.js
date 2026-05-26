function setCache(key, value) {
  try {
    wx.setStorageSync(key, JSON.stringify(value));
  } catch (e) {
    console.error('setCache error:', e);
  }
}

function getCache(key, defaultValue) {
  try {
    const raw = wx.getStorageSync(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('getCache error:', e);
  }
  return defaultValue !== undefined ? defaultValue : null;
}

function removeCache(key) {
  try {
    wx.removeStorageSync(key);
  } catch (e) {
    console.error('removeCache error:', e);
  }
}

function clearCache() {
  try {
    wx.clearStorageSync();
  } catch (e) {
    console.error('clearCache error:', e);
  }
}

module.exports = {
  setCache,
  getCache,
  removeCache,
  clearCache,
};
