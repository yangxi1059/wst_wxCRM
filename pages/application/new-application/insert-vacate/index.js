var app = getApp()
var myRequest = require("../../../../api/myRequest.js");
import { uploadFile } from '../../../../utils/alioss.js';
var ossObj;
var fileList = [];

Page({
  data: {
    startCurrentDate: new Date().getTime(),
    endCurrentDate: new Date().getTime(),
    minHour: 10,
    maxHour: 20,
    typesShow: false,
    startOverTime: false,
    endOverTime: false,
    copyShow: false,
    showConfirm: false,
    showCopy: false,
    vacateType: '',
    imgList: [],
    howlong: 0
  },

  onLoad() {
    let types = ["病假", "事假", "年假", "产假", "陪产假", "调休", "其他假"];
    this.setData({ types })
    this.queryData();
    this.queryCopyTo();
    this.getOss();
  },

  queryData() {
    myRequest.http_getData_new('/apply/confirmor?applyType=vacate', 'GET').then(res => {
      let man = [];
      if (res[0].confirmorArr.length > 0) {
        man.push(res[0].confirmorArr[0].confirmorName);
      }
      this.setData({
        confirmor: res,
        result: man
      })
    })
  },

  queryCopyTo() {
    myRequest.http_getData_new('/apply/copyto', 'GET').then(res => {
      this.setData({
        copyTo: res
      })
    })
  },

  onConfirm(e) {
    let index = e.detail.index;
    this.setData({
      vacateType: this.data.types[index],
      typesShow: false
    })
  },

  dropDownList() {
    this.setData({
      typesShow: !this.data.typesShow
    })
  },

  showStartTime() {
    this.setData({
      startOverTime: true
    })
  },

  showEndTime() {
    this.setData({
      endOverTime: true
    })
  },

  onClose() {
    this.setData({
      typesShow: false,
      startOverTime: false,
      endOverTime: false,
      showConfirm: false,
      showCopy: false
    })
  },

  onInputStart(event) {
    this.setData({
      startCurrentDate: event.detail
    });
  },

  onConfirmStart(e) {
    let that = this;
    let time = that.getdate(e.detail);
    let diff = that.getDiffByDay(time, that.data.endTimeText);
    that.setData({
      startCurrentDate: e.detail,
      starTimeText: time,
      howlong: diff
    }, function () {
      that.onClose()
    })
  },

  onInputEnd(event) {
    this.setData({
      endCurrentDate: event.detail
    })
  },

  onConfirmEnd(e) {
    let that = this;
    let time = that.getdate(e.detail);
    let diff = that.getDiffByDay(that.data.starTimeText, time);
    that.setData({
      endCurrentDate: e.detail,
      endTimeText: time,
      howlong: diff
    }, function () {
      that.onClose()
    })
  },

  onCancel() {
    this.onClose();
  },

  onChange(event) {},

  addConfirm() {
    this.setData({
      showConfirm: true
    })
  },

  addCopy() {
    this.setData({
      showCopy: true
    })
  },

  toggle(event) {
    const {
      index
    } = event.currentTarget.dataset;
    const checkbox = this.selectComponent(`.checkboxes-${index}`);
    checkbox.toggle();
  },

  toggles(event) {
    const {
      index
    } = event.currentTarget.dataset;
    const checkbox = this.selectComponent(`.checkbox-${index}`);
    checkbox.toggle();
  },

  noop() {},

  onChanges(event) {
    this.setData({
      result: event.detail
    });
  },

  onChanges_(event) {
    this.setData({
      results: event.detail
    });
  },

  submit() {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (that.data.vacateType == '' || that.data.vacateType == undefined) {
      wx.showToast({
        title: '请选择请假类型',
        icon: 'none'
      })
      return false
    }

    if (that.data.starTimeText == '' || that.data.starTimeText == undefined) {
      wx.showToast({
        title: '请选择开始时间',
        icon: 'none'
      })
      return false
    }

    if (that.data.endTimeText == '' || that.data.endTimeText == undefined) {
      wx.showToast({
        title: '请选择结束时间',
        icon: 'none'
      })
      return false
    }

    if (that.data.howlong == '' || that.data.howlong == undefined) {
      wx.showToast({
        title: '请选择请假时长',
        icon: 'none'
      })
      return false
    }

    let applyTitle = '[' + userInfo.userName + ']的[' + that.data.vacateType + ']申请';

   
    let approvalArr = that.data.confirmor[0].confirmorArr;
    let approval = [];
    var result = approvalArr.filter(function (v) {
      return that.data.result.indexOf(v.confirmorName) !== -1 // 利用filter方法来遍历是否有相同的元素
    })
    result.forEach(item => {
      let obj = {
        'approverId': item.confirmorId
      }
      approval.push(obj);
    })

    let copytoArr = that.data.copyTo;
    let copyTo = [];
    copytoArr.forEach(item => {
      for (let i in that.data.results) {
        if (item.userName == that.data.results[i]) {
          let obj = {
            'copyTo': copytoArr[i].userId
          }
          copyTo.push(obj);
        }
      }
    })

    let content = {
      file: fileList,
      text: [{
          label: "请假类型",
          value: that.data.vacateType
        },
        {
          label: "开始时间",
          value: that.data.starTimeText
        },
        {
          label: "结束时间",
          value: that.data.endTimeText
        },
        {
          label: "请假时长(天)",
          value: that.data.howlong
        },
        {
          label: "请假事由",
          value: that.data.reason
        }
      ],
      info: {
        vacateType: that.data.vacateType,
        vacateBegin: that.data.starTimeText,
        vacateEnd: that.data.endTimeText,
        vacateDay: parseInt(that.data.howlong),
        reason: that.data.reason,
        voucher: ""
      }
    }


    myRequest.http_post('/apply/commApply', 'POST', {
      applyType: 'vacate',
      applyTitle: applyTitle,
      copyTo: JSON.stringify(copyTo),
      approval: JSON.stringify(approval),
      content: JSON.stringify(content),
    }).then(res => {
      if (res) {
        let id = res;
        that.subscribeMessage(id);
      }
    })
  },

  subscribeMessage(id) {
    var tmpId = ['mDvuVq9CLHQ99VCupBcJHlGN1Nld-TUasRspnZgQzW4'];
    var allowTmpId = [];

    wx.requestSubscribeMessage({
      tmplIds: tmpId,
      success(res) {
        for (let item in res) {
          if (res[item] == 'accept') {
            allowTmpId.push(item);
          }
        }
        console.log(allowTmpId);
        if (allowTmpId.length > 0) {
          var openId = wx.getStorageSync('openId');
          var dataArr = [];

          for (let i = 0; i < tmpId.length; i++) {
            for (let j = 0; j < allowTmpId.length; j++) {
              if (tmpId[i] == allowTmpId[j]) {
                let obj = {
                  openId: openId,
                  templateId: tmpId[i],
                  subscribeFor: 'apply',
                  subscribeKey: id
                }
                dataArr.push(obj);
              }
            }
          }
          console.log(dataArr);

          let userInfo = wx.getStorageSync('userInfo');
          wx.request({
            url: app.globalData.serverURLNew + '/msg/mpapp/subscribe',
            method: 'POST',
            dataType: 'application/json',
            data: dataArr,
            header: {
              'appId': 'mp_wst_career',
              'appVersion': app.globalData.version,
              'Authorization': userInfo.token,
              'version': 'common'
            },
            success: function (res) {
              let resData = JSON.parse(res.data);
              if (resData.code == 200) {
                wx.showToast({
                  title: '订阅成功',
                  icon: 'success',
                  duration: 1000,
                  success: function () {
                    setTimeout(function () {
                      wx.reLaunch({
                        url: '/pages/application/detail/index?applyId=' + id
                      })
                    }, 1000);
                  }
                })
              }
            }
          })
        }
      },
      fail(res) {
        console.log("消息订阅失败：");
        console.log(res);
        wx.reLaunch({
          url: '/pages/application/detail/index?applyId=' + id
        })
      }
    })
  },

  getHowlong(e) {
    this.setData({
      howlong: e.detail.value
    })
  },

  onInput(e) {
    this.setData({
      reason: e.detail.value
    })
  },

  afterRead(event) {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let img = res.tempFilePaths[0];
        let allImgList = that.data.imgList;
        allImgList.push(img);
        that.setData({
          imgList: allImgList
        })
        let fileName = that.randomString(6);
        uploadFile(res.tempFilePaths[0], ossObj, fileName).then(function (res) {
          let fileUrl = res.data.url;
          for (let i in that.data.imgList) {
            let obj = {
              name: fileName + '.png',
              url: fileUrl
            }
            fileList.push(obj)
          }
        }, function (res) {
          console.log(res);
        })
      }
    })
  },

  toPreview(e) {
    let url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.imgList
    })
  },

  deleteImg(e) {
    let index = e.currentTarget.dataset.index;
    let imgList = this.data.imgList;
    imgList.splice(index, 1);
    fileList.splice(index, 1);
    this.setData({
      imgList: imgList
    })
  },

  getdate(now) {
    let y, m, d;
    now = new Date(now),
      y = now.getFullYear(),
      m = now.getMonth() + 1,
      d = now.getDate();
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substr(0, 8);
  },

  randomString(e) {
    e = e || 32;
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
      a = t.length,
      n = "";
    for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
  },

  getOss() {
    myRequest.http_getData_new('/system/ossStsToken', 'GET').then(res => {
      ossObj = res;
    })
  },


  getDiffByDay(start, end) {
    var s = Date.parse(start),
      e = Date.parse(end);
    var diff = Math.abs(e - s);
    var result = 0,
      hour = Math.floor(diff / (1000 * 60 * 60)),
      day = Math.floor(diff / (1000 * 60 * 60 * 24));

    result = day;
    if (day > 0) {
      hour -= day * 24;
    }
    if (hour > 5) {
      result += 0.5;
      hour = Math.floor((diff - (day * 24 + 5) * 1000 * 60 * 60) / (1000 * 60 * 60));
    }
    if (hour > 1) {
      result += hour * 0.1;
    }
    return parseInt(result);
  }
})