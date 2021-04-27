var app = getApp();
Page({
  data: {
    language: 'english'
  },


  onShow: function () {
    let languageApp = app.globalData.language;
    let pageTitle = languageApp == 'english' ? 'Language' : '语言';
    wx.setNavigationBarTitle({
      title: pageTitle
    });
    this.setData({
      language: languageApp
    })
  },

  choose(e) {
    let type = e.currentTarget.dataset.type;
    app.globalData.language = type;
    this.setData({ language: type })
    wx.navigateBack({ delta: 1 })
  },


})