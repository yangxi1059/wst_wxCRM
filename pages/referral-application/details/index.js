var app = getApp();
var aes = require("../../../utils/aes.js");
var myRequest = require("../../../api/myRequest.js")
var chinese = require("../../../utils/Chinese.js")
var english = require("../../../utils/English.js")
const country = require('../../../utils/country.js')
const province = require('../../../utils/province.js')

var jid;
Page({
  data: {
    isLoading: true,
    referralsDetailPage: {},
    jobInfo: {}, //详细信息
    applyInfo: {},
    collect: false, //收藏按钮
    delivery: false, //投递按钮
    toudi: false, //是否显示投递弹窗
    progress: false, //是否显示投递状态弹窗
    radio: '1',
    lableList: [{
        name: 'Apply Season：',
        value: '',
      },
      {
        name: 'Job Count：',
        value: '',
      },
      {
        name: 'Job Type：',
        value: '',
      },
      {
        name: 'Location Type：',
        value: '',
      },
    ],
    //初始化下拉框
    array: ["随时","1周内","15天内","1个月内","3个月内","6个月内","1年内"],
    entryTimeIndex: 0,
    startDate: '请选择',
    endDate: '请选择',
    graduationYear: [
      '2018年初', '2018年中', '2018年末',
      '2019年初', '2019年中', '2019年末',
      '2020年初', '2020年中', '2020年末',
      '2021年初', '2021年中', '2021年末',
      '2022年初', '2022年中', '2022年末',
      '2023年初', '2023年中', '2023年末',
      '2024年初', '2024年中', '2024年末',
    ],
    graduationYearIndex: 0,
    currentResume: '',
    resumeList: [{
      fileName:'Test.pdf',
      type:'pdf',
      createTime:'2021-01-05'
    }],
    contryValue: '请选择',
    country: [],
    showCountryContent: false,
    provinceValue: '请选择',
    province: [],
    showProvinceContent: false,
    areaValue: '请选择',
    area: [],
    showAreaContent: false,
    cid: 0,
    pid: '',
    ischecked: true,
    countryIndex: 0,
    provinceIndex: 0,
    areaIndex: 0,
  },

  onLoad: function (options) {
    var that = this;
    jid = options.jid;
    that.queryData();
  },

  //初始化数据
  queryData() {
    var that = this;
    var language = app.globalData.language;
    myRequest.http_getData('/mentee/internalJob/' + jid + '/info', 'GET').then(res => {

      console.log(res);
      var applyInfo = res.applyInfo;
      if (applyInfo != null && applyInfo != undefined) {
        var fileName = applyInfo.fileArr[0].fileName;
        var nameArr = fileName.split(".");
        applyInfo.fileType = nameArr[1];
      }

      var data = res.jobInfo;

      let timeS = data.updateTime;
      let time = data.deadLine;
      var lableData = that.data.lableList;
      lableData[0].value = data.applySeason;
      lableData[1].value = data.jobCount == undefined ? '暂无' : data.jobCount;
      lableData[2].value = data.jobTypeName;
      lableData[3].value = data.locationTypeName;
      if (data.hasDeadLine == 0) {
        data.deadLine = language == 'english' ? 'Unspecified' : "公司官方未注明";
      } else {
        if (time != '' && time != null && time != undefined) {
          data.deadLine = app.formatDeadline(time) + ' 截止';
        } else {
          data.deadLine = language == 'english' ? 'Unspecified' : "公司官方未注明";
        }
      }

      if (timeS != '' && timeS != null && timeS != undefined) {
        let date = timeS.split(" ");
        if (language == 'english') {
          data.createTime = "Published " + app.dateDiff("", date[0]);
        } else {
          data.createTime = app.dateDiff("", date[0]) + ' 发布';
        }
      } else {
        data.createTime = language == 'english' ? 'Unspecified' : "公司官方未注明";
      }

      var delivery = false;
      console.log(applyInfo);
      if (applyInfo != '' && applyInfo != null && applyInfo != undefined) {
        delivery = true;
        that.setData({
          delivery: delivery,
          applyInfo: applyInfo
        })
      }
 
      that.setData({
        jobInfo: data,
        lableList: lableData,
        country: country.country,
        isLoading: false
      })
    })
  },


  //投递
  delivery() {
    wx.showToast({
      title: '功能暂不支持',
      icon: 'none'
    })
  },

  //弹窗-取消
  cancle() {
    let that = this;
    that.setData({
      toudi: false,
      progress: false,
    })
  },

  //弹窗-投递 提交数据
  toudi() {
    var that = this;
    if (that.data.startDate == '请选择' || that.data.endDate == '请选择') {
      wx.showToast({
        title: '可工作时长不能为空',
        icon: 'none'
      })
      return false;
    }

    if (that.data.contryValue == '请选择' || that.data.areaValue == '请选择') {
      wx.showToast({
        title: '当前所在城市不能为空',
        icon: 'none'
      })
      return false;
    }

    // if (that.data.resumeList.length == 0) {
    //   wx.showToast({
    //     title: '简历为必选项',
    //     icon: 'none'
    //   })
    //   return false;
    // }

    that.setData({
      toudi:false
    })
  
  },

  previewResume(e) {
    let url = e.currentTarget.dataset.url;
    wx.setStorageSync('previewurl', url);
    wx.navigateTo({
      url: '/pages/resume/preview/index',
    })
  },

  //弹窗-是否同意
  onChange(event) {
    this.setData({
      ischecked: event.detail
    })
  },

  //切换简历
  checkResume(e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    that.setData({
      currentResume: index
    })
  },

  pickerEntrytime(e) {
    this.setData({
      entryTimeIndex: e.detail.value
    })
  },

  pickerGraduationTime(e) {
    this.setData({
      graduationYearIndex: e.detail.value
    })
  },
  pickerStarttime(e) {
    this.setData({
      startDate: e.detail.value
    })
  },

  pickerEndtime(e) {
    this.setData({
      endDate: e.detail.value
    })
  },

  bindDateChange(e) {
    this.setData({
      graduationYearIndex: e.detail.value
    })
  },

  bindDateChange1(e) {
    this.setData({
      graduationYearsIndex: e.detail.value
    })
  },

  //选择国家
  pickerCountry: function (e) {
    var that = this;
    let index = e.currentTarget.dataset.index;
    var cvalue = e.currentTarget.dataset.cvalue;
    var id = index * 1 + 1;

    var provincelist = [];
    for (var item in province.province[id]) {
      if (province.province[id][item].n) {
        provincelist.push(province.province[id][item])
      }
    }
    if (provincelist.length) {
      that.setData({
        province: province.province[id],
      })
    } else {
      var citylist = []
      for (var item in province.province[id][0]) {
        if (province.province[id][0][item].n) {
          citylist.push(province.province[id][0][item])
        }
      }
      if (citylist.length) {
        that.setData({
          area: province.province[id][0],
          province: []
        })
      }
    }
    that.setData({
      index: index,
      contryValue: cvalue,
      provinceValue: '请选择',
      areaValue: '请选择',
      showCountryContent: false,
      cid: id,
    })
  },

  //选择省份
  pickerProvince: function (e) {
    var that = this;
    var id = that.data.cid;
    var cityid = e.currentTarget.dataset.cityid;
    var pvalue = e.currentTarget.dataset.pvalue;
    that.setData({
      area: province.province[id][cityid],
      provinceValue: pvalue,
      showProvinceContent: false
    })
  },

  //选择区域
  pickerArea: function (e) {
    var that = this;
    var avalue = e.currentTarget.dataset.avalue;
    that.setData({
      areaValue: avalue,
      showAreaContent: false
    })
  },

  showCountryContent() {
    var that = this;
    that.setData({
      showCountryContent: !(that.data.showCountryContent),
      showProvinceContent: false,
      showAreaContent: false
    })
  },

  showProvinceContent() {
    var that = this;
    that.setData({
      showProvinceContent: !(that.data.showProvinceContent),
      showCountryContent: false,
      showAreaContent: false
    })
  },

  showAreaContent() {
    var that = this;
    that.setData({
      showAreaContent: !(that.data.showAreaContent),
      showCountryContent: false,
      showProvinceContent: false
    })
  },

  onShow: function () {
    let that = this;
    let languageApp = app.globalData.language == '' ? lan : app.globalData.language;
    let referralsDetailPage = languageApp == 'english' ? english.Content.referralsDetailPage : chinese.Content.referralsDetailPage;
    wx.setNavigationBarTitle({
      title: referralsDetailPage.pageName,
    })
    this.setData({
      referralsDetailPage: referralsDetailPage
    })
  }
})