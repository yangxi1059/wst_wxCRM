var app = getApp();
var aes = require("../../utils/aes.js")
var myRequest = require("../../api/myRequest.js");
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")

var mtabW;
var sessionId;
var fenyePage = 1;
var isRefresh = 0; //是否需要上拉加载

Page({
  data: {
    isLoading: true,
    onsiteSeminarPage: {},
    show: false,
    showModalContent: "",
    showCancle: false,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0, // tab切换 
    currentLesson: 0,
    slideOffset: 0,
    activeIndex: 0,
    activeNames: '',
    activeFinishNames: '',
    myActiveNames: '',
    activeList: [], //线下课活动-进行中
    activeFinishList: [], //线下课活动-已结束
    myActivityList: [], //我的报名
    hasLimit: true,
    showSubscribeModal: false,
    needHour: 0,
    language: 'english',
    isShowAdvisory: false

  },

  onLoad: function () {
    let that = this;

    that.queryActive(0);
    wx.getSystemInfo({
      success: function (res) {
        mtabW = res.windowWidth / 2;
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        })
      }
    })
  },

  onChange1(event) {
    this.setData({
      activeNames: event.detail
    });
  },
  onChange2(event) {
    this.setData({
      activeFinishNames: event.detail
    });
  },
  onChange3(event) {
    this.setData({
      myActiveNames: event.detail
    });
  },

  //初始化数据-报名进行中
  queryActive(seminarStatus) {
    var that = this;
    myRequest.http_getData('/mentee/seminar/list?pageNum=1&pageSize=5&seminarStatus=' + seminarStatus, 'GET').then(res => {
      var data = res.rows;
      if (data.length > 0) {
        for (var item in data) {
          var sessinList = data[item].sessionList;
          for (var i in sessinList) {
            sessinList[i].sessionTime = app.formatAm(sessinList[i].sessionTime);
            sessinList[i].sessionEndTime = app.formatAm(sessinList[i].sessionEndTime);
          }
          data[item].formatSeminarStartTime = app.formatDate(data[item].seminarStartTime);
          data[item].sessionList = sessinList;
        }
        var activeNames = data[0].sessionList[0].sessionId;
        if (that.data.currentLesson == 0) {
          that.setData({
            activeList: data,
            activeNames: activeNames
          })
        } else {
          that.setData({
            activeFinishList: data,
            activeFinishNames: activeNames
          })
        }
      }
      if (data.length >= 5) {
        isRefresh = 1;
      } else {
        isRefresh = 0
      }
      that.setData({
        isLoading: false
      })
    })
  },

  //弹窗-取消
  cancel(e) {
    sessionId = e.currentTarget.dataset.sid;
    this.setData({
      showCancle: true
    })
  },


  hideMask() {
    this.setData({
      show: false,
      showCancle: false,
      showSubscribeModal: false
    })
  },


  hideSubscribeModal() {
    this.setData({
      showSubscribeModal: false
    })
  },


  lookRepaly() {
    wx.showToast({
      title: '功能暂不支持',
      icon: 'none'
    })
  },

  //滑动切换tab 
  bindChange: function (e) {
    var that = this;
    var current = e.detail.current;

    if ((current + 1) % 2 == 0) {}
    var offsetW = current * mtabW;
    that.setData({
      currentTab: e.detail.current,
      slideOffset: offsetW
    });
  },

  swichNav: function (e) {
    var that = this;
    var offsetW = e.currentTarget.offsetLeft;
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
        slideOffset: offsetW
      })
    }
  },

  swichLesson: function (e) {
    var that = this;
    that.queryActive(e.target.dataset.current);
    if (that.data.currentLesson === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentLesson: e.target.dataset.current
      })
    }
  },


  onShow() {
    var that = this;
    var languageApp = app.globalData.language == '' ? lan : app.globalData.language;
    var onsiteSeminarPage = languageApp == 'english' ? english.Content.onsiteSeminarPage : chinese.Content.onsiteSeminarPage;
    that.setData({
      onsiteSeminarPage: onsiteSeminarPage,
      language: languageApp,
    })
    wx.setNavigationBarTitle({
      title: onsiteSeminarPage.pageTitle
    })
  },

  myFunction() {
    this.onReachBottom();
  },

  onReachBottom() {
    var that = this;

    if (isRefresh == 0) {
      return false;
    }
    var seminarStatus = that.data.currentLesson == 0 ? 0 : 1;

    fenyePage = fenyePage + 1;

    myRequest.http_getData('/mentee/seminar/list?pageNum=' + fenyePage + '&pageSize=4&seminarStatus=' + seminarStatus, 'GET').then(res => {
      var data = res.rows;
      if (data.length > 0) {
        for (var item in data) {
          var sessinList = data[item].sessionList;
          for (var i in sessinList) {
            sessinList[i].sessionTime = app.formatAm(sessinList[i].sessionTime);
            sessinList[i].sessionEndTime = app.formatAm(sessinList[i].sessionEndTime);
          }
          data[item].formatSeminarStartTime = app.formatDate(data[item].seminarStartTime);
          data[item].sessionList = sessinList;
        }
        var activeNames = data[0].sessionList[0].sessionId;
        if (that.data.currentLesson == 0) {
          var oldData = that.data.activeList;
          oldData = oldData.concat(data);
          that.setData({
            activeList: oldData,
            activeNames: activeNames
          })
        } else {
          var oldData = that.data.activeList;
          oldData = oldData.concat(data);
          that.setData({
            activeFinishList: oldData,
            activeFinishNames: activeNames
          })
        }
        isRefresh = 1;
      } else {
        isRefresh = 0
      }
    })
  },

  onUnload() {
    fenyePage = 1;
  }

})