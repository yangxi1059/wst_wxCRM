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
    types:["日常加班", "调休加班"],
    imgList: [],
    howlong: 0
  },

  onLoad() {
    this.queryData();
    this.queryCopyTo();
    this.getOss();
  },

  queryData() {
    myRequest.http_getData_new('/apply/confirmor?applyType=overtime_working', 'GET').then(res => {
     console.log(res);
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
    })
  },

  onConfirmStart(e) {
    let that = this;
    let time = that.getdate(e.detail);
    that.setData({
      startCurrentDate: e.detail,
      starTimeText: time,
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
    that.setData({
      endCurrentDate: e.detail,
      endTimeText: time
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
    const { index } = event.currentTarget.dataset;
    const checkbox = this.selectComponent(`.checkboxes-${index}`);
    checkbox.toggle();
  },

  toggles(event) {
    const { index } = event.currentTarget.dataset;
    const checkbox = this.selectComponent(`.checkbox-${index}`);
    checkbox.toggle();
  },

  noop() {},

  onChanges(event) {
    this.setData({
      result: event.detail
    })
  },

  onChanges_(event) {
    this.setData({
      results: event.detail
    })
  },

  submit() {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (that.data.vacateType == '' || that.data.vacateType == undefined) {
      wx.showToast({
        title: '请选择加班类型',
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
        title: '请选择加班时长',
        icon: 'none'
      })
      return false
    }

    if (that.data.reason == '' || that.data.reason == undefined) {
      wx.showToast({
        title: '请输入加班事由',
        icon: 'none'
      })
      return false
    }

    let applyTitle = '[' + userInfo.userName + ']的加班申请';

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
          label: "加班类型",
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
          label: "加班时长(小时)",
          value: that.data.howlong
        },
        {
          label: "加班事由",
          value: that.data.reason
        }
      ],
      info: {
        workType: that.data.vacateType == '日常加班' ? 0 : 1,
        beginTime: that.data.starTimeText,
        endTime: that.data.endTimeText,
        workHours: parseInt(that.data.howlong),
        workReason: that.data.reason,
        note: ""
      }
    }

    console.log(applyTitle);
    console.log(copyTo);
    console.log(approval);
    console.log(content);

    myRequest.http_post('/apply/commApply', 'POST', {
      applyType: 'overtime_working',
      applyTitle: applyTitle,
      copyTo: JSON.stringify(copyTo),
      approval: JSON.stringify(approval),
      content: JSON.stringify(content),
    }).then(res => {
      console.log(res);
      if(res){
        let id = res;
        wx.showToast({
          title: '提交成功',
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
  }
})