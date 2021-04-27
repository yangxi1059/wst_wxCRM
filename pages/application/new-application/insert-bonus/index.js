var app = getApp()
var myRequest = require("../../../../api/myRequest.js");
import {
  uploadFile
} from '../../../../utils/alioss.js';
var ossObj;
var fileList = [];
var bonus, referrer, detail, remark;

Page({
  data: {
    typesShow: false,
    copyShow: false,
    showConfirm: false,
    showCopy: false,
    vacateType: '',
    types: ["人民币", "美金", "英镑", "加币", "港币", "新加坡元", "澳币"],
    imgList: []
  },

  onLoad() {
    this.queryData();
    this.queryCopyTo();
    this.getOss();
  },

  queryData() {
    myRequest.http_getData_new('/apply/confirmor?applyType=recommend_bonus', 'GET').then(res => {
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
    console.log(event);
    this.setData({
      result: event.detail
    })
  },

  onChanges_(event) {
    this.setData({
      results: event.detail
    })
  },

  getBonus(e) {
    bonus = e.detail.value
  },

  getReferrer(e) {
    referrer = e.detail.value
  },

  getDetail(e) {
    detail = e.detail.value
  },

  getRemark(e) {
    remark = e.detail.value
  },

  submit() {
    let that = this;
    if (that.data.vacateType == '' || that.data.vacateType == undefined) {
      wx.showToast({
        title: '请选择货币类型',
        icon: 'none'
      })
      return false
    }

    if (bonus == '' || bonus == undefined) {
      wx.showToast({
        title: '请输入奖励金额',
        icon: 'none'
      })
      return false
    }

    if (referrer == '' || referrer == undefined) {
      wx.showToast({
        title: '请输入推荐人',
        icon: 'none'
      })
      return false
    }

    if (detail == '' || detail == undefined) {
      wx.showToast({
        title: '请输入收款人账号详情',
        icon: 'none'
      })
      return false
    }

    let applyTitle = '[' + referrer + ']的奖励推荐申请';
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
          label: "货币类型",
          value: that.changeType(that.data.vacateType)
        },
        {
          label: "奖励金额",
          value: that.changeType(that.data.vacateType) + bonus,
        },
        {
          label: "系统汇率",
          value: 7.5
        },
        {
          label: "推荐人",
          value: referrer
        },
        {
          label: "收款人账号详情",
          value: detail
        },
        {
          label: "备注",
          value: remark
        }
      ],
      info: {
        fundType: that.changeType(that.data.vacateType),
        fundWage: that.changeType(that.data.vacateType) + bonus,
        exchangeRate: 7.5,
        payAccount: detail,
        recommendUser: referrer,
        note: remark
      }
    }

    console.log(applyTitle);
    console.log(copyTo);
    console.log(approval);
    console.log(content);

    myRequest.http_post('/apply/commApply', 'POST', {
      applyType: 'recommend_bonus',
      applyTitle: applyTitle,
      copyTo: JSON.stringify(copyTo),
      approval: JSON.stringify(approval),
      content: JSON.stringify(content),
    }).then(res => {
      console.log(res);
      if (res) {
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

  changeType(type) {
    let engType = '';
    switch (type) {
      case '人民币':
        engType = 'cny';
        break;
      case '美金':
        engType = 'usd';
        break;
      case '英镑':
        engType = 'gbp';
        break;
      case '加币':
        engType = 'cad';
        break;
      case '港币':
        engType = 'hkd';
        break;
      case '新加坡元':
        engType = 'sgd';
        break;
      case '澳币':
        engType = 'aud';
        break;
    }
    return engType;
  }
})