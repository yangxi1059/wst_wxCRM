Page({

  data: {
    showWaterMark:false
  },
  
  onLoad: function (options) {
    let that = this;
    let url = wx.getStorageSync('previewurl');
    if(options.showWaterMark){
      that.setData({
        showWaterMark: true
      })
    }
    if(options.pageTitle){
      wx.setNavigationBarTitle({
        title: options.pageTitle
      })
    }
    that.setData({
      url: url
    })
  },

  onUnload() {
    wx.removeStorageSync('previewurl')
  }
})