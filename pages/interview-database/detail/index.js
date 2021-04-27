var app = getApp();
var myRequest = require("../../../api/myRequest.js")
var english = require("../../../utils/English.js")
var chinese = require("../../../utils/Chinese.js")

Page({

  data: {
    isLoading: true,
    interviewInfo: {}
  },

  onLoad: function (options) {
    this.initData(options.pkId);
  },

  toAll(){
    wx.navigateTo({
      url: '/pages/interview-database/index'
    })
  },

  toDetail(e) {
    this.initData(e.currentTarget.dataset.pkid);
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  onShow() {
    let languageApp = app.globalData.language;
    let interviewDatabasePage = languageApp == 'english' ? english.Content.interviewDatabasePage : chinese.Content.interviewDatabasePage;
    this.setData({ interviewDatabasePage })
  },

  initData(pkId) {
    let that = this;
    myRequest.http_getData('/mentee/interview/online/detail?pkId=' + pkId, 'GET').then(res => {
      let moreList =  res.moreList;
      res.detail.difficultyLevel = parseInt(res.detail.difficultyLevel);
      if(moreList.length >0 ){
        moreList.forEach(element => {
          element.difficultyLevel = parseInt(element.difficultyLevel);
        });
      }
      that.setData({
        interviewInfo: res.detail,
        interviewList: moreList,
        isLoading: false
      })
    })
  }
})