var app = getApp()
var myRequest = require("../../../api/myRequest.js");

Page({
  data: {
    bookDetail: {},
  },

  onLoad: function (options) {
    let bid = options.bid;
    myRequest.http_getData('/book/' + bid + '/info', 'GET').then(res => {
      this.setData({
        bookDetail: res
      })
    })
  },

  toPreview(e){
    let url = e.currentTarget.dataset.url;
    wx.setStorageSync('previewurl', url);
    wx.navigateTo({
      url: '/pages/resume/preview/index'
    })
  }
})