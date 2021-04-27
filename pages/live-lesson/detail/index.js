var app = getApp()
var aes = require("../../../utils/aes.js")
var chinese = require("../../../utils/Chinese.js")
var english = require("../../../utils/English.js");
var myRequest = require("../../../api/myRequest.js");
var userInfo = wx.getStorageSync('userInfo') || 0;
var liveId;
var videoId;
var flag = 0;

Page({
  data: {
    isLoading: true,
    streamingDetailPage: {},
    vedioType: '',
    liveInfo: {},
    showPopup: false,
    showSubscribe: false,
    noData: false,
    currentTab: 0,
    slideOffset: 0,
    isBinding: false,
    isLog: false,
    isSubscribe: false,
    questionList: [],
    playType: '',
    playUrl: '',
    inputValue: '',
    pkId: '',
    isWriting: false,
    versionFlag: 0,
    taskList: [],
    conditionInfo: {},
    userInfo: {},
    spotCurrent: 0,
    getCertificateList: [],
    willshowSubscribe: true,
    otheMsgOndispaly: [],
    showBinding: false,
    setInter: '',
    randomHeight: 90,
    waterMarkText: '1',
    isFullscreen: false,
    marqueePace: 1,
    marqueeDistance: 0,
    size: 10,
    orientation: 'left',
    interval: 20,
    //倍速
    showBeisuMask: false,
    rateArr: [1.0, 1.25, 1.5, 2.0],
    currentRate: 0,
    currentRateValue: 1,
    isRate: false,
    rateHeight: 230
  },

  onLoad: function (options) {
    let that = this;
    var userInfo = wx.getStorageSync('userInfo');
    var length = that.data.waterMarkText.length * that.data.size;
    var windowWidth = wx.getSystemInfoSync().windowWidth;
    liveId = options.liveId ? options.liveId : undefined;
    if (options.liveId != undefined) {
      if (userInfo.token) {
        that.setData({
          versionFlag: 1,
          userInfo: userInfo,
          length: length,
          windowWidth: windowWidth,
          marqueeDistance: windowWidth,
        })
      } else {
        that.setData({
          versionFlag: 0
        })
      }
    } else {
      wx.showModal({
        title: '提示',
        content: '此页面已禁用，若要访问请去官网'
      })
    }
  },

  onShow: function () {
    var that = this;
    var waterMarkText = '';
    if (app.globalData.isLogin == 1) {
      that.queryData(liveId);
      var userInfo = wx.getStorageSync('userInfo') || 0;
      var languageApp = app.globalData.language == '' ? lan : app.globalData.language;
      var streamingDetailPage = languageApp == 'english' ? english.Content.streamingDetailPage : chinese.Content.streamingDetailPage;
      if (userInfo != 0) {
        waterMarkText = userInfo.userName + userInfo.userAcc;
        that.setData({
          streamingDetailPage: streamingDetailPage,
          language: languageApp,
          waterMarkText: waterMarkText
        })
      }
    } else {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
  },

  queryData(id) {
    var that = this;
    var vedioType = '';
    myRequest.http_getData('/live/' + id + '/info', 'GET').then(data => {
      data.planTime = app.formatTime(data.planTime);
      if (data.liveStatus == 2 && data.videoList) { //有录播回放
        if (data.videoList.length > 0) {
          videoId = data.videoList[0].videoId;
          vedioType = 'video';
          that.getVideoSrc(id, videoId);
          that.run();
        } else {
          vedioType = 'living';
        }
      } else { //直播
        vedioType = 'living';
        that.getPlaySrc(id);
        that.run();
      }

      if (data.coursewareList) {
        for (let i = 0; i < data.coursewareList.length; i++) {
          let type = data.coursewareList[i].fileName.split(".");
          if (type[1] == "doc" || type[1] == "docx") {
            data.coursewareList[i].type = "word";
          } else if (type[1] == "pdf") {
            data.coursewareList[i].type = "pdf";
          } else if (type[1] == "ppt" || type[1] == 'pptx') {
            data.coursewareList[i].type = "ppt";
          } else {
            data.coursewareList[i].type = "ppt";
          }
        }
      }
      that.setData({
        liveInfo: data,
        isSubscribe: data.isBand ? data.isBand : false,
        vedioType: vedioType,
        isLoading: false
      })
    })
  },

  getPlaySrc(id) {
    var that = this;
    var userInfo = wx.getStorageSync('userInfo');
    wx.request({
      url: app.globalData.serverURL + '/live/' + id + '/playAuth?utmSource=mp_wst_career',
      method: 'GET',
      header: {
        'appId': 'mp_wst_career',
        'appVersion': app.globalData.version,
        'Authorization': userInfo.token
      },
      success: function (res) {
        if (res.data.code == 200) {
          if (res.data.data) {
            let res_data = aes.decrypt(res.data.data, res.data.key) || {};
            var data = res_data;
            if (data.playType == 'live') {
              that.setData({
                playUrl: data.playUrl.m3u8,
                playType: data.playType
              })
            } else if (data.playType == 'video') {
              if (data.playUrl.length > 0) {
                that.setData({
                  playUrl: data.playUrl[0].playURL,
                  playType: data.playType
                })
              }
            }
          } else {
            that.setData({
              noData: true
            })
          }
        } else if (res.data.code == 401) {
          wx.switchTab({
            url: '/pages/mine/index'
          })
        }
      }
    })
  },

  getVideoSrc(liveId, videoId) {
    let that = this;
    myRequest.http_getData('/live/' + liveId + '/video/' + videoId + '/playAuth?utmSource=mp_wst_career', 'GET').then(data => {
      if (data.playUrl.length > 0) {
        that.setData({
          playUrl: data.playUrl[0].playURL,
          playType: data.playType
        })
      }
    })
  },

  onOpenQuestionInput() {
    this.setData({
      showQuestionInput: true
    })
  },

  onClose() {
    this.setData({
      showSubscribe: false
    })
  },

  onClosePopup() {
    this.setData({
      showPopup: false
    })
  },

  previewFile(e) {
    if (this.data.isSubscribe) {
      let url = e.currentTarget.dataset.url;
      console
      wx.setStorageSync('previewurl', url);
      wx.navigateTo({
        url: '/pages/preview-file/index'
      })
    } else {
      this.setData({
        showPopup: true
      })
    }
  },

  //是否订阅弹窗
  subscribe() {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo') || 0;
    if (userInfo.token) {
      that.setData({
        showSubscribe: true
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
  },

  //订阅
  dingyue() {
    var that = this;
    let userInfo = wx.getStorageSync('userInfo');

    let datas = {
      liveId: liveId
    }

    let data = aes.encrypt(datas);
    wx.request({
      url: app.globalData.serverURL + '/live/subscribe',
      method: 'POST',
      dataType: 'json',
      header: {
        'appId': 'mp_wst_career',
        'appVersion': app.globalData.version,
        'Authorization': userInfo.token
      },
      data: data,
      success: function (res) {
        if (res.data.code == 200) {
          wx.showToast({
            title: '订阅成功',
            icon: 'success',
            duration: 1000,
            success: function () {
              that.setData({
                showModal: false,
                showSubscribe: false
              })
              that.onShow();
            }
          })
        } else {
          if (res.data.message) {
            that.setData({
              showModal: false
            }, function () {
              wx.showModal({
                content: res.data.message,
                confirmText: '确定',
              })
            })
          } else {
            that.setData({
              showModal: false
            }, function () {
              wx.showToast({
                title: '订阅失败',
                icon: 'none'
              })
            })
          }
        }
      },
      fail: function () {}
    })
  },



  hideModal() {
    this.setData({
      showSubscribe: false
    })
  },

  swichNav(e) {
    var that = this;
    var offsetW = e.currentTarget.offsetLeft;
    var index = e.target.dataset.current;
    if (that.data.currentTab === index) {
      return false;
    } else {
      that.setData({
        currentTab: index,
        slideOffset: offsetW
      })
    }
  },

  showPopup() {
    let that = this;
    if (userInfo != 0) {
      that.setData({
        showPopup: true
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    // if (that.data.willshowSubscribe) {
    //   if (userInfo != 0) {
    //     that.setData({
    //       showPopup: true
    //     })
    //   } else {
    //     wx.navigateTo({
    //       url: '/pages/login/index',
    //     })
    //   }
    // }
  },

  hidePopup() {
    this.setData({
      showPopup: false
    })
  },

  //输入聚焦
  foucus: function (e) {
    var that = this;
    that.setData({
      inputBottom: e.detail.height,
    })
  },

  //失去聚焦
  blur: function (e) {
    var that = this;
    that.setData({
      inputBottom: 0,
    })
  },


  checkSome(arr, pkId) {
    var result = arr.some(item => {
      if (item.pkId == pkId) {
        return true
      }
    })
    return result;
  },

  onShareAppMessage() {
    let liveInfo = this.data.liveInfo;
    return {
      title: liveInfo.liveTitle,
      imageUrl: liveInfo.liveCover,
    }
  },


  run: function () {
    var vm = this;
    vm.data.setInter = setInterval(function () {
      if (-vm.data.marqueeDistance < vm.data.length) {
        vm.setData({
          marqueeDistance: vm.data.marqueeDistance - vm.data.marqueePace,
        })
      } else {
        clearInterval(vm.data.setInter);
        if (vm.data.isFullscreen) {
          let windowWidth = wx.getSystemInfoSync().windowWidth;
          vm.setData({
            marqueeDistance: windowWidth
          })
        } else {
          vm.setData({
            marqueeDistance: vm.data.windowWidth
          })
        }
        setTimeout(() => {
          let value = app.random(90, 250);
          vm.setData({
            randomHeight: value
          })
          vm.run();
        }, 10000)
      }
    }, vm.data.interval)
  },


  //视频播放错误
  playError(e) {
    var videoContext = wx.createVideoContext('myVideo');
    videoContext.stop();
    clearInterval(this.data.setInter);
    clearInterval(this.data.interval);
    this.setData({
      marqueeDistance: -1000
    })
    wx.showToast({
      title: '直播流获取失败',
      icon: 'none',
      duration: 5000
    })
  },

  playStart(e) {
    let that = this;
    that.setData({
      marqueeDistance: that.data.marqueeDistance
    })
    that.run();
  },

  playPause() {
    let that = this;
    clearInterval(that.data.setInter);
  },


  fullscreen(e) {
    let that = this;
    let windowWidth = wx.getSystemInfoSync().windowWidth;
    let windowHeight = wx.getSystemInfoSync().windowHeight;
    if (e.detail.direction == "vertical") {
      that.setData({
        marqueeDistance: windowWidth,
        isFullscreen: false,
        rateHeight:230
      })
    } else {
      that.setData({
        marqueeDistance: windowWidth,
        isFullscreen: true,
        rateHeight:windowHeight
      })
    }
  },
  
  clickVideo(){
    this.setData({
      showBeisuMask:false
    })
  },


  onChangeRate({
    detail
  }) {
    let videoContext = wx.createVideoContext('video');
    if (detail) {
      this.setData({
        showBeisuMask: true
      })
      videoContext.pause()
    } else {
      this.setData({
        showBeisuMask: false,
        currentRate: 0,
        currentRateValue: this.data.rateArr[0],
      })
      videoContext.playbackRate(1);
      videoContext.play();
    }
    this.setData({
      isRate: detail
    })
  },

  closeBeisuMask() {
    let videoContext = wx.createVideoContext('video');
    this.setData({
      showBeisuMask: false
    })
    videoContext.play();
  },

  beisu() {
    this.setData({
      showBeisuMask: true
    })
    let videoContext = wx.createVideoContext('video');
    videoContext.pause()
  },

  // 选择倍速播放
  chooseRatePlay(e) {
    let rate = e.currentTarget.dataset.rate;
    let index = e.currentTarget.dataset.index;
    let videoContext = wx.createVideoContext('video');
    if (index == 0) {
      this.setData({ isRate: false })
    } else {
      this.setData({ isRate: true })
    }
    this.setData({
      currentRateValue: this.data.rateArr[index],
      currentRate: index,
      showBeisuMask: false
    })
    videoContext.playbackRate(rate);
    videoContext.play();
  },
  
  
  //生命周期函数--监听页面卸载
  onUnload: function () {
    let that = this;
    clearInterval(that.data.setInter);
    clearInterval(that.data.interval);
  }
})