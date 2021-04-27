var myRequest = require("../../../api/myRequest.js");
var aes = require("../../../utils/aes.js");
var app = getApp()
Page({

  data: {
    avatarUrl: ''
  },

  onLoad: function (options) {
    this.queryData(options.applyId)
    // setTimeout(function () {
    //   wx.showModal({
    //     content: '审核操作请登录CRM后台管理',
    //     confirmText: '暂不',
    //     showCancel: false
    //   })
    // }, 2000)
  },

  queryData(id) {
    let that = this;
    let avatarUrl = wx.getStorageSync('avatarUrl') || 0;
    myRequest.http_getData_new('/apply/' + id, 'GET').then(res => {
      console.log(res);
      let apply = res.apply;
      let content = apply.content;
      let copyTo = res.copyTo;
      let approval = res.approval;
      approval.forEach(element => {
        element.approveStatusName = that.changeStatus(element.approveStatus);
      })
      content = JSON.parse(content);
      that.setData({
        avatarUrl: avatarUrl,
        apply,
        content,
        copyTo,
        approval
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

  onRefuse() {
    console.log("onRefuse");
    this.apply(2);
  },

  onConfirm() {
    console.log("onConfirm");
    this.apply(1);
  },

  apply(status) { //审核状态,1通过，2拒绝
    let applyId = this.data.apply.applyId;
    let dataObj = {
      applyId: applyId,
      approveStatus: status
    }
    myRequest.http_postData_new('/apply/commAudit', 'PUT', dataObj).then(res => {
      console.log(res)
      let data = JSON.parse(res.data)
      if (data.code == 200) {
        wx.showToast({
          title: data.message ? data.message : '成功',
          icon: 'success',
          duration: 1000,
          success: function () {
            setTimeout(function () {
              wx.reLaunch({
                url: '/pages/check/index'
              })
            }, 1000);
          }
        })
      }
    })
  },

  changeStatus(status) {
    switch (status) {
      case '0':
        return '待审核';
        break;
      case '1':
        return '审核中';
        break;
      case '2':
        return '已通过';
        break;
      case '3':
        return '已拒绝';
        break;
      case '4':
        return '未支付';
        break;
      case '5':
        return '已支付';
        break;
      case '6':
        return '已取消';
        break;
    }
  }
})