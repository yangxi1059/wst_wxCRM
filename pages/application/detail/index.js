var app = getApp()
var aes = require("../../../utils/aes.js");
var myRequest = require("../../../api/myRequest.js");
var applyId;

Page({

  data: {
    avatarUrl: '',
    showPop: false
  },

  onLoad: function (options) {
    applyId = options.applyId;
    this.queryData(applyId)
  },

  queryData(id) {
    let that = this;
    let avatarUrl = wx.getStorageSync('avatarUrl') || 0;
    myRequest.http_getData_new('/apply/' + id, 'GET').then(res => {
      console.log(res);
      let content = res.apply.content;
      content = JSON.parse(content);
      that.setData({
        avatarUrl: avatarUrl,
        apply: res.apply,
        copyTo: res.copyTo,
        approval: res.approval,
        content
      })
    })
  },

  toPreview(e) {
    let urls = e.currentTarget.dataset.url;
    let userInfo = wx.getStorageSync('userInfo');
    wx.request({
      url: app.globalData.serverURLNew + '/file/previewUrl',
      method: 'GET',
      dataType: 'application/json',
      data: {
        objectKey: urls
      },
      header: {
        'appId': 'mp_wst_career',
        'appVersion': app.globalData.version,
        'Authorization': userInfo.token,
        'version': 'common'
      },
      success: function (res) {
        let resData = JSON.parse(res.data);
        if (resData.code == 200) {
          let res_data = aes.decrypt(resData.data, resData.key);
          wx.setStorageSync('previewurl', res_data);
          wx.navigateTo({
            url: '/pages/preview-file/index'
          })
        } else {
          wx.showToast({
            title: '文件预览失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '请求超时',
          icon: 'loading',
          duration: 2000
        })
      }
    })
  },

  revoke(e) {
    this.setData({
      showPop: true
    })
  },

  hidePop(){
    this.setData({
      showPop: false
    })
  },

  handleClick() {
    myRequest.http_postData_new('/apply/' + applyId, 'PUT').then(res => {
      let data = JSON.parse(res.data)
      if (data.code == 200) {
        wx.reLaunch({
          url: '/pages/application/index'
        })
      }
    })
  }
})