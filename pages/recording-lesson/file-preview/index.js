var myRequest = require("../../../api/myRequest.js");

Page({
  data: {
    isLoading: true,
    imgSrc: [],
    currentPage: 0,
  },

  onLoad: function (options) {
    var windowHeight = wx.getSystemInfoSync().windowHeight;
    this.queryData(options.id);
    this.setData({
      windowHeight
    })

    if(options.pageTitle){
      wx.setNavigationBarTitle({
        title: options.pageTitle
      })
    }
  },

  previousPage() {
    let that = this;
    let num = that.data.currentPage;
    if (num == 0) {
      wx.showToast({
        title: '已经到第一页了',
        icon: 'none'
      })
      return false
    }
    num -= 1;
    that.setData({
      currentPage: num
    })
  },

  nextPage() {
    let that = this;
    let num = that.data.currentPage;
    if (num == that.data.docPageCount - 1) {
      wx.showToast({
        title: '已经是最后一页了',
        icon: 'none'
      })
      return false
    }
    num += 1;
    that.setData({
      currentPage: num
    })
  },

  queryData(lessonId) {
    let that = this;
    myRequest.http_getData_noload('/course/lesson/document/all?lessonId=' + lessonId + '&utmSource=wxamp', 'GET').then(data => {
      if (data) {
        that.setData({
          imgSrc: data,
          docPageCount: data.length,
          isLoading: false
        })
      }
    })
  },

  previewImage(e) {
    let that = this
    let imgList = that.data.imgSrc
    wx.previewImage({
      current: imgList[that.data.currentPage],
      urls: imgList,
      showmenu: false
    })
  },

  onChange(e) {
    this.setData({
      currentPage: e.detail.current
    })
  }
})