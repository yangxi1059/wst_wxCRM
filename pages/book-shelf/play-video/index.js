var app = getApp()
var myRequest = require("../../../api/myRequest.js");
Page({
  data: {
    value: '',
    bookList: [],
    emptyImageUrl: app.globalData.serverImgUrl + 'icon-empty.png',
    searchFlag: false,
    setInter: '', //计时器
    randomHeight: 90,
    waterMarkText: '',
    isFullscreen: false,
    marqueePace: 1, //滚动速度
    marqueeDistance: 0, //初始滚动距离
    size: 10,
    orientation: 'left', //滚动方向
    interval: 20 // 时间间隔
  },


  onLoad: function (options) {
    let that = this;
    let bookInfo = wx.getStorageSync('bookInfo');
    let length = that.data.waterMarkText.length * that.data.size; //文字长度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          phoneModel: res.platform,
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          marqueeDistance: res.windowWidth,
          length: length
        })
      }
    })
    that.getPreviewUrl(bookInfo.bookId);
    that.setData({
      bookObj: bookInfo
    })
  },

  getPreviewUrl(bookId) {
    let that = this;
    myRequest.http_getData('/book/' + bookId + '/preview', 'GET').then(res => {
      that.setData({
        getPreviewUrlInfo: res
      })
    })
  },

  onShow() {
    var waterMarkText = '';
    let userInfo = wx.getStorageSync('userInfo') || 0;
    if (userInfo.token) {
      waterMarkText = userInfo.userName + userInfo.userAcc;
    } else {
      waterMarkText = userInfo.nickName;
    }
    this.setData({
      waterMarkText: waterMarkText,
    })
  },

  run: function () {
    var vm = this;
    vm.data.setInter = setInterval(function () {
      if (-vm.data.marqueeDistance < vm.data.length) {
        vm.setData({
          marqueeDistance: vm.data.marqueeDistance - vm.data.marqueePace,
        });
      } else {
        clearInterval(vm.data.setInter);
        if (vm.data.isFullscreen) {
          let windowWidth = wx.getSystemInfoSync().windowWidth;
          vm.setData({
            marqueeDistance: windowWidth
          });
        } else {
          vm.setData({
            marqueeDistance: vm.data.windowWidth
          });
        }
        setTimeout(() => {
          let value = app.random(90, 250);
          vm.setData({
            randomHeight: value
          })
          vm.run();
        }, 5000);
      }
    }, vm.data.interval);
  },

  playStart(e) {
    let that = this;
    let type = e.currentTarget.dataset.type;
    type = type.replace(".", "");
    if (type != 'mp3') { //若文件类型不为音频则显示水印
      that.setData({
        marqueeDistance: that.data.marqueeDistance
      })
      that.run();
    }
  },

  playPause() {
    let that = this;
    clearInterval(that.data.setInter);
  },

  fullscreen(e) {
    let that = this;
    let type = e.currentTarget.dataset.type;
    type = type.replace(".", "");
    if (type != 'mp3') { //若文件类型不为音频则显示水印
      let windowWidth = wx.getSystemInfoSync().windowWidth;
      if (e.detail.direction == "vertical") {
        that.setData({
          marqueeDistance: windowWidth,
          isFullscreen: false
        })
      } else {
        that.setData({
          marqueeDistance: windowWidth,
          isFullscreen: true
        })
      }
    }
  },

  videoError(e) {
    var videoContext = wx.createVideoContext('myVideo');
    videoContext.stop();
    clearInterval(this.data.setInter);
    clearInterval(this.data.interval);
    this.setData({ marqueeDistance: -1000 })
    wx.showModal({
      title: '视频流获取失败',
      content: e.detail.errMsg,
      showCancel: false,
      success(res) {
        if (res.confirm) {
          wx.navigateBack({
            delta: 1
          })
        }
      }
    })
  },

  onUnload: function () {
    let that = this;
    clearInterval(that.data.setInter);
    clearInterval(that.data.interval);
    wx.removeStorageSync('bookInfo');
  }
})