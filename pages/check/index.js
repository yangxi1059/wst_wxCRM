var myRequest = require("../../api/myRequest.js");
var pageNum = 1;
var isRefresh = 0;
Page({

  data: {
    isLoading: false
  },

  onLoad() {
    let that = this;
    that.queryData(pageNum).then(function (res) {
      that.setData({
        applyList: res.rows,
        isLoading: false
      })
      if (res.rows.length >= 10) {
        isRefresh = 1
      } else {
        isRefresh = 0
      }
    })
  },

  toDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/check/detail/index?applyId=' + id
    })
  },

  queryData(pageNum) {
    return new Promise(function (resolve, reject) {
      var userInfo = wx.getStorageSync('userInfo') || 0;
      if (userInfo != 0) {
        myRequest.http_getData_new('/apply/' + userInfo.userId + '/approveList?pageNum=' + pageNum + '&pageSize=10&search=&applyType=&approveStatus=0&applyStatus=', 'GET').then(res => {
          if (res.rows) {
            resolve(res);
          }
        })
      }
    })
  },

  onReachBottom() {
    if (isRefresh == 0) {
      return false;
    }
    pageNum += 1;
    var that = this;

    that.queryData(pageNum).then(function (res) {
      let data = res.rows;
      if (data.length > 0) {
        let oldData = that.data.applyList;
        oldData = oldData.concat(data);
        that.setData({
          applyList: oldData
        })
        isRefresh = 1;
      } else {
        isRefresh = 0;
      }
    })
  },

  onUnload(){
    pageNum = 1;
  }
})