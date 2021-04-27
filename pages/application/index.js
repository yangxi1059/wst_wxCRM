var app = getApp();
var myRequest = require("../../api/myRequest.js");
var pageNum = 1;
var isRefresh = 0;
var applyType = [];
Page({
  data: {
    isLoading: true,
    pullUpOn: false,
    applyList: []
  },

  onLoad: function () {
    let that = this;
    myRequest.http_getData_new('/dic/apply_type/item', 'GET').then(res => {
      applyType = res;
      that.queryData(pageNum).then(function (res) {
        let applyData = res.rows;
        if (applyData.length > 0) {
          applyData.forEach(element => {
            element.content = JSON.parse(element.content);
            element.applyTypeName = that.getApplyName(element.applyType);
          })
        }
        that.setData({
          applyList: applyData,
          isLoading: false
        })
        if (applyData.length >= 10) {
          isRefresh = 1;
        } else {
          isRefresh = 0;
        }
      })
    })
  },

  toDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/application/detail/index?applyId=' + id
    })
  },

  onReachBottom() {
    let that = this;
    if (isRefresh == 0) {
      return false;
    }
    pageNum += 1;
    that.queryData(pageNum).then(function (res) {
      let applyData = res.rows;
      if (applyData.length > 0) {
        applyData.forEach(element => {
          element.content = JSON.parse(element.content);
          element.applyTypeName = that.getApplyName(element.applyType);
        });
        let oldData = that.data.applyList;
        oldData = oldData.concat(applyData);
        that.setData({
          applyList: oldData
        })
        isRefresh = 1;
      } else {
        isRefresh = 0;
      }
    })
  },

  toInsert() {
    wx.navigateTo({
      url: '/pages/application/new-application/index'
    })
  },

  queryData(pageNum) {
    return new Promise(function (resolve, reject) {
      var userInfo = wx.getStorageSync('userInfo') || 0;
      if (userInfo != 0) {
        myRequest.http_getData_new('/apply/' + userInfo.userId + '/applyList?pageNum=' + pageNum + '&pageSize=10', 'GET').then(res => {
          if (res.rows) {
            resolve(res);
          }
        })
      }
    })
  },

  getApplyName(type){
    var applyName = '';
    applyType.forEach(element =>{
      if(element.itemValue == type){
        applyName = element.itemName;
      }
    })
    return applyName;
  },

  onUnload() {
    pageNum = 1;
  }
})