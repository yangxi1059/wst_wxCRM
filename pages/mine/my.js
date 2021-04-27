var app = getApp();
var myRequest = require("../../api/myRequest.js");
Page({
  data: {
    isLogin: 0,
    showHistory: false
  },

  onShow: function () {
    app.updateTabbar();
    let userInfo = wx.getStorageSync('userInfo') || 0;
    let userinfo = wx.getStorageSync('userinfo') || 0;
    let avatarUrl = wx.getStorageSync('avatarUrl') || 0;
    let menuList = [{
        name: app.globalData.language == 'english' ? 'Play History' : '播放历史',
        url: 'playHistory',
        icon: 'playHistory',
        isShow: true
      },
      {
        name: app.globalData.language == 'english' ? 'Application Reminder' : '网申提醒',
        url: 'online-application',
        icon: 'icon-wstx',
        // hasNew: true,
        // newNum: 4,
        isShow: userInfo.netApplicationCenterFlag ? userInfo.netApplicationCenterFlag : false
      },
      {
        name: app.globalData.language == 'english' ? 'Referrals' : '内推申请',
        url: 'referral-application',
        icon: 'icon-ntsq',
        isShow: userInfo.internalPushCenterFlag ? userInfo.internalPushCenterFlag : false
      },
      {
        name: app.globalData.language == 'english' ? 'Interview Database' : '面试题库',
        url: 'interview-database',
        icon: 'icon-mstk',
        isShow: userInfo.hasInterviewFlag ? userInfo.hasInterviewFlag : false
      },
      {
        name: app.globalData.language == 'english' ? 'Seminar Bootcamps' : '面试训练营',
        url: 'onsite-seminar',
        icon: 'icon-ns',
        isShow: userInfo.hasSeminarsFlag ? userInfo.hasSeminarsFlag : false
      }, {
        name: app.globalData.language == 'english' ? 'Digital Academy' : '电子书架',
        url: 'book-shelf',
        icon: 'icon-book',
        isShow: userInfo.bookShelfFlag ? userInfo.bookShelfFlag : false
      },
      {
        name: app.globalData.language == 'english' ? 'Language' : '语言',
        url: 'choose-language',
        icon: 'language',
        right: app.globalData.language == 'english' ? 'English' : '中文',
        isShow: true
      }
    ]
    if (userInfo != 0) {
      if (userInfo.token) {
        this.setData({
          isLogin: 1,
          avatarUrl: userinfo.avatarUrl ? userinfo.avatarUrl : avatarUrl,
          userInfo: userInfo,
        })
      } else {
        this.setData({
          isLogin: 1,
          avatarUrl: userinfo.avatarUrl ? userinfo.avatarUrl : avatarUrl,
          userInfo: userinfo,
        })
      }
    } else {
      this.setData({
        isLogin: 0,
        userInfo: null,
        avatarUrl: ''
      })
    }
    this.setData({
      language: app.globalData.language,
      version: app.globalData.version,
      menuList
    })
    wx.setNavigationBarTitle({
      title: app.globalData.language == 'english' ? 'Mine' : '我的账户',
    })

    /*设置小红点 */
    // wx.showTabBarRedDot({
    //   index: 3
    // })
  },

  detail(e) {
    console.log(e);
    let url = e.currentTarget.dataset.url;
    let index = e.currentTarget.dataset.index;
    let userInfo = wx.getStorageSync('userInfo') || 0;
    if (url == 'playHistory') {
      if (userInfo.token) {
        this.getPlayHistory();
        this.setData({
          showHistory: true
        })
      } else {
        wx.showToast({
          title: '此功能暂未开放',
          icon: 'none'
        })
      }
    } else {
      wx.navigateTo({
        url: '/pages/' + url + '/index'
      })
    }
  },

  toVideoDetail(e) {
    let cid = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/recording-lesson/detail/index?cid=' + cid
    })
  },

  toLogin() {
    if (this.data.isLogin == 1) {
      wx.navigateTo({
        url: '/pages/personal-information/index'
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
  },

  closeHistory() {
    this.setData({
      showHistory: false
    })
    wx.showTabBar();
  },

  copy(e) {
    let text = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: text
    })
  },

  getPlayHistory() {
    let that = this;
    myRequest.http_getData('/mentee/course/playHis', 'GET').then(res => {
      for (let item in res) {
        let num = (res[item].timeNode / res[item].videoDuration).toFixed(2)
        res[item].schedule = num * 100 + '%';
      }
      that.setData({
        historyList: res
      }, function () {
        wx.hideTabBar();
      })
    })
  },

  onShareAppMessage: function (event) {}

})