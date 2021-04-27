const app = getApp();
var aes = require("../../utils/aes.js");
var toast;
Page({
  data: {

  },



  onShow() {
    let canUseProfile = wx.canIUse('wx.getUserProfile') ? true : false;
    this.setData({
      canUseProfile
    })
  },

  onReady: function (options) {
    toast = this.selectComponent("#toast")
  },

  showTips(content) {
    let options = {
      msg: content,
      duration: 5000
    };
    toast.showTips(options);
  },


  huoquUserInfo(e) {
    console.log(e);
    var that = this;
    if (e.detail.userInfo) {
      wx.setStorageSync('avatarUrl', e.detail.userInfo.avatarUrl);
      wx.login({
        success: function (result) {
          let datas = {
            code: result.code
          }
          let data = aes.encrypt(datas);
          wx.request({
            url: app.globalData.serverURLNew + '/login/wechat/session',
            method: 'POST',
            data: data,
            header: {
              'version': 'common'
            },
            success: function (res) {
              if (res.data.code == 200) {
                wx.getUserInfo({
                  success: function (resu) {
                    let encryptedData = resu.encryptedData;
                    let iv = resu.iv;
                    let openId = aes.decrypt(res.data.data, res.data.key);
                    that.decode(encryptedData, iv, openId);
                  }
                })
              } else {
                wx.setStorageSync('userInfo', e.detail.userInfo);
                app.globalData.isLogin = 1;
                app.globalData.userInfo =  e.detail.userInfo;
                wx.switchTab({
                  url: '/pages/index/index'
                })
              }
            },
            fail: function () {
              wx.showModal({
                title: '提示',
                content: '网络异常！重新登录',
              })
            }
          })
        },
        fail: function (e) {
          wx.showModal({
            title: '提示',
            content: '登录失败',
          })
          return false;
        }
      })
    } else {
      if (e.detail.errMsg != "getUserInfo:fail auth deny") {
        that.onLoad();
        wx.showToast({
          title: e.detail.errMsg,
          icon: 'none'
        })
      }
    }
  },

  getUserInfo() {
    console.log("2");
    let that = this;
    wx.getUserProfile({
      desc: "获取你的昵称、头像、地区及性别",
      success: res => {
        wx.setStorageSync('userinfo', res.userInfo);
        app.globalData.userInfo = res.userInfo;
        wx.login({
          success: function (result) {
            let datas = {
              code: result.code
            }
            let data = aes.encrypt(datas);
            wx.request({
              url: app.globalData.serverURLNew + '/login/wechat/session',
              method: 'POST',
              data: data,
              header: {
                'version': 'common'
              },
              success: function (res) {
                if (res.data.code == 200) {
                  wx.getUserInfo({
                    success: function (resu) {
                      let encryptedData = resu.encryptedData;
                      let iv = resu.iv;
                      let openId = aes.decrypt(res.data.data, res.data.key);
                      that.decode(encryptedData, iv, openId);
                    }
                  })
                } else {
                  app.globalData.isLogin = 1;
                  wx.switchTab({
                    url: '/pages/index/index'
                  })
                }
              },
              fail: function () {
                wx.showModal({
                  title: '提示',
                  content: '网络异常！重新登录',
                })
              }
            })
          },
          fail: function (e) {
            wx.showModal({
              title: '提示',
              content: '登录失败',
            })
            return false;
          }
        })
      }
    })
  },

 

  decode(encryptedData, iv, openId) {
    let that = this;
    let datas = {
      encryptedData: encryptedData,
      iv: iv,
      openId: openId
    }
    let data = aes.encrypt(datas);
    wx.showLoading({
      title: '获取信息中',
      icon: 'none',
      mask: true,
      duration: 1000
    })
    wx.request({
      url: app.globalData.serverURLNew + '/login/wechat/user/decode',
      method: 'POST',
      dataType: 'json',
      data: data,
      header: {
        'version': 'common'
      },
      success: function (res) {
        wx.hideLoading();

        if (res.data.code == 200) {
          that.showTips(res.data.message);
          let res_data = aes.decrypt(res.data.data, res.data.key);
          wx.setStorageSync('userInfo', res_data);
          wx.setStorageSync('openId', openId);

          let userInfo = res_data;
          app.globalData.isLogin = 1;
          app.globalData.userInfo = userInfo;
          wx.switchTab({
            url: '/pages/index/index'
          })
        } else {
          that.showTips(res.data.message);
        }
      }
    })
  },
})