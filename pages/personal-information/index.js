var app = getApp();

Page({
  data: {
    avatarUrl: '',
    gender: '',
    nickName: '',
    birthday: ''
  },

  // 退出登录
  loginout() {
    var that = this;
    if (that.data.nickName != '未知') {
      wx.showModal({
        content: '确定要退出登录吗？',
        confirmText: '确定',
        success(res) {
          if (res.confirm) {
            wx.removeStorageSync('userInfo');
            wx.removeStorageSync('userinfo');
            wx.removeStorageSync('avatarUrl');
            wx.removeStorageSync('openId');
            app.globalData.isLogin = 0;
            app.globalData.isBindingwst = 0;
            app.globalData.userInfo = null;
            that.onShow();
            that.setData({
              avatarUrl: '',
              gender: '未知',
              nickName: '未知',
            })
            wx.navigateBack({
              delta: 1
            })
          } else if (res.cancel) {}
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo') || 0;
    let userinfo = wx.getStorageSync('userinfo') || 0;
    let avatarUrl = wx.getStorageSync('avatarUrl') || 0;
    
    if (userInfo != 0) {
      if (userInfo.token) {
        let nickName = userInfo.userName;
        let gender = userInfo.sex == '2' ? '女' : '男';
        let isBinding = userInfo.userType == 'mentee' ? true : false;
        that.setData({
          avatarUrl: userinfo.avatarUrl ? userinfo.avatarUrl : avatarUrl,
          gender: gender,
          nickName: nickName,
          birthday: userInfo.loginTime,
          isBinding: isBinding,
          refCode: userInfo.refCode
        })
      } else {
        let gender = userinfo.gender == '2' ? '女' : '男';
        that.setData({
          avatarUrl: userinfo.avatarUrl ? userinfo.avatarUrl : avatarUrl,
          gender: gender,
          nickName: userinfo.nickName,
        })
      }
    }
  },

  copy(e) {
    let text = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: text,
      success: function (res) {
        wx.showToast({
          title: '内容已复制到粘贴板上',
          icon:'none'
        })
      }
    })
  },

  formatNumber(n) {

    n = n.toString()

    return n[1] ? n : '0' + n;

  },


  formatTime(number, format) {

    var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];

    var returnArr = [];

    var date = new Date(number * 1000);

    returnArr.push(date.getFullYear());

    returnArr.push(this.formatNumber(date.getMonth() + 1));

    returnArr.push(this.formatNumber(date.getDate()));

    returnArr.push(this.formatNumber(date.getHours()));

    returnArr.push(this.formatNumber(date.getMinutes()));

    returnArr.push(this.formatNumber(date.getSeconds()));

    for (var i in returnArr)

    {

      format = format.replace(formateArr[i], returnArr[i]);

    }

    return format;

  }
})