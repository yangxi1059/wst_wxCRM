var app = getApp()
var myRequest = require("../../../api/myRequest.js");
var aes = require("../../../utils/aes.js")
var lid;
var cancelId;
var qid;

Page({
  data: {
    isLoading: true,
    menteeId: '',
    lessonInfo: {},
    showMentorInfo: false,
    showSignup: false,
    showMessage: false,
    showCancleMessage: false,
    messageContent: '',
    currentNav: 0,
    slideOffset: 0,
    currentPeriod: 0,
  },

  onLoad: function (options) {
    lid = options.lid;
  },

  onShow() {
    if (app.globalData.isLogin == 1) {
      let userInfo = wx.getStorageSync(app.globalData.version + '_userInfo') || 0;
      this.initData(lid);
      this.setData({
        menteeId: userInfo.menteeId
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/index',
      })
    }
  },

  subscibe() {
    this.setData({
      showSignup: false,
    })
    // let that = this;
    // console.log(qid);
    // myRequest.http_post('/oneOnOne/subscribe', 'POST', {
    //   qaId: qid
    // }).then(data => {
    //   console.log(data);
    //   let res = JSON.parse(data.data);
    //   that.setData({
    //     messageContent: res.message ? res.message : '预约失败！',
    //     showSignup: false,
    //     showMessage: true,
    //   }, function () {
    //     that.initData(lid);
    //   })

    //   if (res.code == 200) {
    //     let res_data = aes.decrypt(res.data, res.key) || {}; //解密
    //     if (res_data.mpappMsgTemplateArr.length > 0) {
    //       that.subscribeMessage(res_data.mpappMsgTemplateArr);
    //     }
    //   }
    // })
  },

  //消息订阅
  // subscribeMessage(tmpArr) {
  //   var tmpId = [];
  //   var allowTmpId = [];
  //   var subscribeFor = [];
  //   for (let item in tmpArr) {
  //     tmpId.push(tmpArr[item].templateId)
  //   }

  //   wx.requestSubscribeMessage({
  //     tmplIds: tmpId,
  //     success(res) {
  //       for (let item in res) {
  //         if (res[item] == 'accept') {
  //           allowTmpId.push(item);
  //         }
  //       }
  //       if (allowTmpId.length > 0) {
  //         var userInfo = wx.getStorageSync(app.globalData.version + '_userInfo');
  //         var dataArr = [];
  //         for (let i = 0; i < tmpArr.length; i++) {
  //           for (let j = 0; j < allowTmpId.length; j++) {
  //             if (tmpArr[i].templateId == allowTmpId[j]) {
  //               subscribeFor.push(tmpArr[i].subscribeFor);
  //               let obj = {
  //                 openId: userInfo.mpOpenId,
  //                 templateId: tmpArr[i].templateId,
  //                 subscribeFor: tmpArr[i].subscribeFor,
  //                 subscribeKey: qid
  //               }
  //               dataArr.push(obj);
  //             }
  //           }
  //         }
  //         myRequest.http_post('/message/mpapp/subscribe', 'POST', dataArr).then(data => {
  //           if (data.data) {
  //             var json = JSON.parse(data.data);
  //             if (json.code == 200) {
  //               wx.showToast({
  //                 title: '订阅成功'
  //               })
  //             }
  //           }
  //         })
  //       }
  //     },
  //     fail(res) {
  //       console.log(res);
  //       wx.showToast({
  //         title: '消息订阅失败',
  //         icon: 'fail'
  //       })
  //     }
  //   })
  // },

  unSubscibe() {
    this.setData({
      showSignup: false
    })
  },

  toOrder(e) {
    let that = this;
    qid = e.currentTarget.dataset.qid;
    that.setData({
      showSignup: true
    })
  },

  toCancel(e) {
    let that = this;
    cancelId = e.currentTarget.dataset.qid;
    that.setData({
      showCancleMessage: true
    })
  },

  cancel() {
    let that = this;
    myRequest.http_post('/oneOnOne/unsubscribe', 'POST', {
      qaId: cancelId
    }).then(data => {
      let res = JSON.parse(data.data);
      if (res.code != 500) {
        that.setData({
          messageContent: res.message,
          showCancleMessage: false,
          showMessage: true
        }, function () {
          that.initData(lid);
        })
      } else {
        that.setData({
          messageContent: "取消失败",
          showCancleMessage: false,
          showMessage: true
        }, function () {
          that.initData(lid);
        })
      }
    })
  },

  onClose() {
    this.setData({
      showMessage: false
    })
  },

  cancleMessage() {
    this.setData({
      showCancleMessage: false
    })
  },

  showMentorInfo() {
    this.setData({
      showMentorInfo: !(this.data.showMentorInfo)
    })
  },

  copy: function (e) {
    var code = e.currentTarget.dataset.copy;
    wx.setClipboardData({
      data: code,
      success: function (res) {
        wx.showToast({
          title: '复制成功'
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '复制失败',
        })
      }
    })
  },

  initData(lid) {
    let that = this;
    myRequest.http_getData('/oneOnOne/' + lid + '/lesson/detail', 'GET').then(res => {
      let data = res.qaArr;
      for (let item in data) {

        if (data[item].startTime.indexOf(" ") != -1) {
          let startTimeArr = data[item].startTime.split(" ");
          let sTimeArr = startTimeArr[1].split(":");
          data[item].startTime = sTimeArr[0] + ":" + sTimeArr[1];
        }

        if (data[item].endTime.indexOf(" ") != -1) {
          let endTimeArr = data[item].endTime.split(" ");
          let eTimeArr = endTimeArr[1].split(":");
          data[item].endTime = eTimeArr[0] + ":" + eTimeArr[1];
        }
      }
      let allEndTime = data[data.length - 1].endTime;
      let allEndTimeArr = allEndTime.split(":");
      let getTime = res.summaryLength * 60000;
      let newTime = getTime + that.miner(allEndTimeArr[0], allEndTimeArr[1]);
      let eTimeAll = data[data.length - 1].endTime.split(":");
      res.allStartTime = eTimeAll[0] + ":" + eTimeAll[1];
      res.allEndTime = that.formatDuring(newTime);
      let isShowMore = false;
      if (res.mentorIntroduce.length >= 21) {
        isShowMore = true
      }
      that.setData({
        lessonInfo: res,
        isLoading: false,
        isShowMore
      })
    })
  },

  miner(hour, min) {
    var miner;
    miner = hour * (60 * 60 * 1000) + min * (60 * 1000);
    return miner;
  },

  formatDuring(mss) {
    var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ":" + minutes;
  },

  switchNav(e) {
    let offsetW = e.currentTarget.offsetLeft;
    this.setData({
      currentNav: e.currentTarget.dataset.key,
      slideOffset: offsetW,
    })
  },

  switchPeriod(e) {
    this.setData({
      currentPeriod: e.currentTarget.dataset.index
    })
  }
})