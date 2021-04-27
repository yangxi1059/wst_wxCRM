var app = getApp();
var aes = require("../../utils/aes.js");


Page({

  data: {
    isLoading: true,
    info: {}
  },

  onLoad: function (options) {
    this.initData();
  },

  initData() {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    wx.request({
      header: {
        'appId': 'mp_wst_career',
        'appVersion': app.globalData.version,
        'Authorization': userInfo.token,
        'version': 'common'
      },
      url: app.globalData.serverURLNew + '/kpi/sales2021',
      method: 'get',
      success: function (res) {
        if (res.data.code == 200) {
          let res_data = aes.decrypt(res.data.data, res.data.key) || {}; //解密
          res_data.kpiPercent = that.getPercent(res_data.kpi, res_data.kpiTarget);
          res_data.ruzhangPercent = that.getPercent(res_data.monthlyRevenueKpi, res_data.monthlyRevenueKpiTarget);
          that.setData({
            info: res_data,
            isLoading: false
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message ? res.data.message : '暂无权限',
            showCancel:false,
            success (e) {
              if (e.confirm) {
                wx.switchTab({
                  url: '/pages/index/index'
                })
              } 
            }
          })
        }
      }
    })
  },

  getPercent(num, count) {
    if (count <= 0) {
      return 100;
    }
    let percent = parseInt(num / count * 100);
    return percent;
  }
})