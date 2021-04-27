var app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var myRequest = require("../../api/myRequest.js")
var pageType = '';
var courseType = '';

Page({
  data: {
    searchPage: {},
    hotTags: [],
    historyTags: [],
    key: ''
  },

  onLoad: function (options) {
    let that = this;
    pageType = options.type;
    if (options.searchValue) {
      if (options.searchValue != '') {
        that.setData({
          searchValue: options.searchValue
        })
      }
    }
    if (options.courseType) {
      courseType = options.courseType;
      that.queryHotTagType(options.courseType);
    } else {
      that.queryHotTag(pageType);
    }
  },

  onShow() {
    var historyTags = wx.getStorageSync(pageType + 'HistoryTags') || [];
    let languageApp = app.globalData.language == '' ? lan : app.globalData.language;
    let searchPage = languageApp == 'english' ? english.Content.searchPage : chinese.Content.searchPage;
    this.setData({
      historyTags: historyTags.reverse(),
      searchPage
    })
  },

  input: function (e) {
    let key = e.detail.value;
    key = key.trim();
    this.setData({
      key: key
    })
  },

  cleanKey: function () {
    this.setData({
      key: ''
    });
  },

  onSearch(e) {
    let value = e.detail.value;
    var historyTags = wx.getStorageSync(pageType + 'HistoryTags') || [];
    if (historyTags.indexOf(value) === -1) {
      historyTags.push(value);
      if (historyTags.length > 10) {
        historyTags.shift();
      }
    }
    wx.setStorageSync(pageType + 'HistoryTags', historyTags)

    this.setData({
      searchValue: value
    })

    if (pageType == 'live') {
      wx.reLaunch({
        url: '/pages/live-lesson/index?searchkey=' + value
      })
    } else if (pageType == 'course') {
      wx.reLaunch({
        url: '/pages/recording-lesson/index?courseType='+ courseType + '&searchkey=' + value
      })
    }
  },

  deleteHistoty() {
    wx.removeStorageSync(pageType + 'HistoryTags');
    this.setData({
      historyTags: []
    })
  },

  searchHot(e) {
    let value = e.currentTarget.dataset.key;
    this.setData({
      searchValue: value
    })

    if (pageType == 'live') {
      wx.reLaunch({
        url: '/pages/live-lesson/index?searchkey=' + value
      })
    } else if (pageType == 'course') {
      wx.reLaunch({
        url: '/pages/recording-lesson/index?courseType=' + courseType + '&searchkey=' + value
      })
    }
  },

  queryHotTag(type) { //搜索热门词
    let that = this;
    myRequest.http_getData('/' + type + '/search/init', 'GET').then(res => {
      that.setData({
        hotTags: res.hotTags
      })
    })
  },

  queryHotTagType(courseType) {
    let that = this;

    switch (courseType) {
      case '0':
        courseType = "recruiting";
        break;
      case '1':
        courseType = "cfa";
        break;
      case '2':
        courseType = "other";
        break;
    }
    myRequest.http_getData('/course/search/init?courseType=' + courseType, 'GET').then(res => {
      that.setData({
        hotTags: res.hotTags
      })
    })
  }
})