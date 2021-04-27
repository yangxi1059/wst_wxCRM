var app = getApp();
var myRequest = require("../../../../api/myRequest.js");
import { uploadFile } from '../../../../utils/alioss.js';
var moneyCount, reason, remarks;
var ossObj;
var fileList = [];
Page({

  data: {
    typesShow: false,
    copyShow: false,
    showConfirm: false,
    showCopy: false,
    isBD: false,
    vacateType: '',
    imgList: []
  },

  onLoad() {
    let types = ["差旅费", "交通费", "招待费", "办公室费用", "快递费", "活动费", "其他"];
    this.setData({ types })
    this.queryData();
    this.queryCopyTo();
    this.getOss();
  },

  showTypeList() {
    this.setData({
      typesShow: !this.data.typesShow
    })
  },

  onConfirm(e) {
    let index = e.detail.index;
    this.setData({
      vacateType: this.data.types[index],
      typesShow: false
    })
  },

  getMoney(e) {
    moneyCount = e.detail.value
  },

  getReason(e) {
    reason = e.detail.value
  },

  getRemarks(e) {
    remarks = e.detail.value
  },

  onClose() {
    this.setData({
      typesShow: false,
      showConfirm: false,
      showCopy: false
    })
  },

  onCancel() {
    this.onClose();
  },

  onChange(event) {
  },

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
    });
  },

  onChanges_(event) {
    this.setData({
      results: event.detail
    })
  },

  deleteImg(e) {
    let index = e.currentTarget.dataset.index;
    let imgList = this.data.imgList;
    imgList.splice(index, 1);
    fileList.splice(index,1);
    this.setData({
      imgList: imgList
    })
  },

  submit() {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (that.data.vacateType == '' || that.data.vacateType == undefined) {
      wx.showToast({
        title: '请选择报销类型',
        icon: 'none'
      })
      return false
    }

    if (moneyCount == '' || moneyCount == undefined) {
      wx.showToast({
        title: '请输入费用金额',
        icon: 'none'
      })
      return false
    }

    if (reason == '' || reason == undefined) {
      wx.showToast({
        title: '请输入报销事由',
        icon: 'none'
      })
      return false
    }


    if (that.data.imgList.length == 0) {
      wx.showToast({
        title: '请上传凭证',
        icon: 'none'
      })
      return false
    }

    let applyTitle = '[' + userInfo.userName + ']的[' + that.data.vacateType + ']报销申请';

    let voucher = [];
    for (let i in that.data.imgList) {
      let auto_key = that.randomString(6);
      let obj = {
        voucherName: auto_key,
        voucherPath: that.data.imgList[i]
      }
      voucher.push(obj)
    }

   
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
          label: "报销类型",
          value: that.data.vacateType
        },
        {
          label: "费用金额",
          value: moneyCount
        },
        {
          label: "报销事由",
          value: reason
        },
        {
          label: "费用说明",
          value: remarks
        }
      ],
      info: {
        reimbursementType: that.data.vacateType,
        reimbursementReason: reason,
        reimbursementTotalWage: moneyCount,
        reimbursementBy: userInfo.userId,
        note: remarks,
        infoArray: []
      }
    }

    let dataInfo = {
      applyType: 'reimbursement',
      applyTitle: applyTitle,
      voucher: voucher,
      copyTo: copyTo,
      approval: approval,
      content: content
    }

  //  let myData = JSON.stringify(dataInfo);
    myRequest.http_post('/apply/commApply', 'POST', {
      applyType: 'reimbursement',
      applyTitle: applyTitle,
      voucher: JSON.stringify(voucher),
      copyTo: JSON.stringify(copyTo),
      approval: JSON.stringify(approval),
      content: JSON.stringify(content)
    }).then(res => {
      if(res){
        let id  = res;
        that.subscribeMessage(id);
        // wx.reLaunch({
        //   url: '/pages/application/detail/index?applyId=' + id
        // })
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


  queryData() {
    myRequest.http_getData_new('/apply/confirmor?applyType=reimbursement', 'GET').then(res => {
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