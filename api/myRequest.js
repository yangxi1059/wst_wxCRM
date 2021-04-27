var app = getApp()
var aes = require("../utils/aes.js");

function http_post(url, method, data) { //post 提交数据
  var userInfo = wx.getStorageSync('userInfo');
  wx.showLoading({
    title: '加载中...',
    icon: 'none',
    mask: true,
    duration: 1000
  })
  data = aes.encrypt(data);
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.serverURLNew + url,
      method: method,
      dataType: 'application/json',
      header: {
        'appId': 'mp_wst_career',
        'appVersion': app.globalData.version,
        'Authorization': userInfo.token,
        'version': 'common'
      },
      data: data,
      success: function (res) {
        let dataS = JSON.parse(res.data);
        if (dataS.code == 200) {
          let res_data = aes.decrypt(dataS.data, dataS.key) || {}; //解密
          resolve(res_data);
        } else {
          wx.redirectTo({
            url: '/pages/login/index'
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
  })
}

function http_postData_new(url, method, data) { //post 提交数据
  var userInfo = wx.getStorageSync('userInfo');
  wx.showLoading({
    title: '加载中...',
    icon: 'none',
    mask: true,
    duration: 1000
  })
  data = aes.encrypt(data);
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.serverURLNew + url,
      method: method,
      dataType: 'application/json',
      header: {
        'appId': 'mp_wst_career',
        'appVersion': app.globalData.version,
        'Authorization': userInfo.token,
        'version': 'common'
      },
      data: data,
      success: function (res) {
        resolve(res);
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
  })
}

function http_getData(url, method, data) {
  var dataList = [];
  var userInfo = wx.getStorageSync('userInfo');

  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '加载中...',
      icon: 'none',
      mask: true,
      duration: 1000
    })
    wx.request({
      url: app.globalData.serverURL + url,
      data: data,
      method: method,
      header: {
        'appId': 'mp_wst_career',
        'appVersion': app.globalData.version,
        'Authorization': userInfo.token
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 200) {
          let res_data = aes.decrypt(res.data.data, res.data.key) || {}; //解密
          dataList = res_data;
          resolve(dataList);
        } else {
          wx.redirectTo({
            url: '/pages/login/index'
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
  })
}


function http_getData_new(url, method, data) {
  var dataList = [];
  var userInfo = wx.getStorageSync('userInfo');

  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '加载中...',
      icon: 'none',
      mask: true,
      duration: 1000
    })
    wx.request({
      url: app.globalData.serverURLNew + url,
      data: data,
      method: method,
      header: {
        'appId': 'mp_wst_career',
        'appVersion': app.globalData.version,
        'Authorization': userInfo.token,
        'version': 'common'
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 200) {
          let res_data = aes.decrypt(res.data.data, res.data.key) || {}; //解密
          dataList = res_data;
          resolve(dataList);
        } else {
          wx.redirectTo({
            url: '/pages/login/index'
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
  })
}

function http_getData_noload(url, method, data) {
  var dataList = [];
  var userInfo = wx.getStorageSync('userInfo');

  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.serverURL + url,
      data: data,
      method: method,
      header: {
        'appId': 'mp_wst_career',
        'appVersion': app.globalData.version,
        'Authorization': userInfo.token
      },
      success: function (res) {
        if (res.data.code == 200) {
          let res_data = aes.decrypt(res.data.data, res.data.key) || {}; //解密
          dataList = res_data; //解密后数据，数据应用
          resolve(dataList);
        } else {
          wx.redirectTo({
            url: '/pages/login/index'
          })
        }
      }
    })
  })
}


module.exports = {
  http_getData: http_getData, //get请求
  http_getData_noload: http_getData_noload,
  http_getData_new: http_getData_new,
  http_postData_new:http_postData_new,
  http_post:http_post
}