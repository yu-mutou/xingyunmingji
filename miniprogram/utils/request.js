function callCloudFunction(name, data, options) {
  const opts = options || {};
  const showLoading = opts.showLoading !== false;
  const loadingText = opts.loadingText || '加载中...';

  if (showLoading) {
    wx.showLoading({ title: loadingText, mask: true });
  }

  return wx.cloud
    .callFunction({
      name,
      data,
    })
    .then((res) => {
      if (showLoading) wx.hideLoading();
      const result = res.result;
      if (result && result.success === false) {
        wx.showToast({ title: result.message || '请求失败', icon: 'none' });
        return Promise.reject(result);
      }
      return result;
    })
    .catch((err) => {
      if (showLoading) wx.hideLoading();
      console.error(`Cloud function [${name}] error:`, err);
      wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
      return Promise.reject(err);
    });
}

module.exports = {
  callCloudFunction,
};
