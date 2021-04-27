var app = getApp();
Component({
  data: {
    // 这里是一些组件内部数据
    watermarkText: ''
  },
  attached() {
    var userInfo = wx.getStorageSync('userInfo') || 0;
    this.setData({
      watermarkText:  userInfo.userName + userInfo.userAcc
    })
    console.log(this.data.watermarkText);
  }
})