var app = getApp();
var myRequest = require("../../api/myRequest.js");
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var fenyepage = 1;
var isRefresh = 0; //是否需要上拉加载
var paramObj = {};
var myoffsetW;

Page({
  data: {
    isLoading: true,
    referralsPage: {},
    winWidth: 0,
    winHeight: 0,
    slideOffset: 32,
    activeIndex: 0,
    currentTab: 0,
    showDeliveryStatus: false,
    currentSelect: 5,
    select: false,
    selected: false,
    iconSelected: false,
    jobList: [],
    hasLimit: true,
    showLimitModal: false,
    showOrder: false,
    selectOrder: 0,
    orderList: ["默认排序", "截止日期"],
    language: 'english',
    isShowAdvisory: false,
    searchValue: '',
    selectData: [{
        selectName: 'Apply Season',
        selectList: [],
        status: false
      },
      {
        selectName: 'Country',
        selectList: [],
        status: false
      },
      {
        selectName: 'Location Type',
        selectList: [],
        status: false
      },
      {
        selectName: 'Job Type',
        selectList: [],
        status: false
      },
      {
        selectName: 'Track',
        selectList: [],
        status: false
      }
    ]
  },

  onLoad: function (options) {
    let that = this;

    that.initDropdownbox();

    if (options.searchkey) {
      let currentTab = options.currentTab;
      that.initSelectData('', '', currentTab, '', '', '', '', '', options.searchkey);
      that.setData({
        searchValue: options.searchkey,
        currentTab: currentTab,
        slideOffset: myoffsetW
      })
    } else {
      that.initSelectData('', '', 0, '', '', '', '', '', '');
    }
  },

  toDetail(e) {
    let jid = e.currentTarget.dataset.jid;
    wx.navigateTo({
      url: '/pages/referral-application/details/index?jid=' + jid,
    })

  },

  clearInput() { //清空输入框
    this.initSelectData('', '', 0, '', '', '', '', '', '');
    this.setData({
      searchValue: ''
    })
  },

  toSearch(e) {
    let value = e.detail;
    let currentTab = this.data.currentTab;
    this.initSelectData('', '', currentTab, '', '', '', '', '', value);
  },

  hideMask() {
    this.setData({
      showLimitModal: false
    })
  },

  showOrder() {
    this.setData({
      showOrder: !(this.data.showOrder)
    })
  },

  orderData(e) {
    let that = this;
    let oid = e.currentTarget.dataset.oid;
    if (oid == 0) {
      that.initSelectData('', '', that.data.currentTab, '', '', '', '', '', that.data.searchValue);
    } else {
      that.initSelectData("deadline", "asc", that.data.currentTab, '', '', '', '', '', that.data.searchValue);
    }
    that.setData({
      showOrder: false,
      selectOrder: oid
    })
  },

  initSelectData(deadline, order, recordStatus, applySeason, country, locationType, jobType, track, searchValue) {
    paramObj = {
      deadline: deadline,
      order: order,
      recordStatus: recordStatus,
      jobType: jobType,
      country: country,
      track: track,
      applySeason: applySeason,
      locationType: locationType
    }

    var language = app.globalData.language;
    var that = this;
    myRequest.http_getData('/mentee/internalJob/list?pageNum=1&pageSize=6&sortCol=' + deadline + '&sort=' + order + '&recordStatus=' + recordStatus + '&jobType=' + jobType + '&country=' + country + '&track=' + track + '&applySeason=' + applySeason + '&locationType=' + locationType + '&search=' + searchValue, 'GET').then(res => {
      let data = res.rows;
      for (let i = 0; i < data.length; i++) {
        let timeS = data[i].updateTime;
        let time = data[i].deadLine;
        if (data[i].hasDeadLine == 0) {
          data[i].deadLine = language == 'english' ? 'Unspecified' : "公司官方未注明";
        } else {
          if (time != '' && time != null && time != undefined) {
            data[i].deadLine = app.formatDeadline(time);
          } else {
            data[i].deadLine = language == 'english' ? 'Unspecified' : "公司官方未注明";
          }
        }

        if (timeS != '' && timeS != null && timeS != undefined) {
          let date = timeS.split(" ");
          data[i].createTime = app.dateDiff("", date[0]);
        } else {
          data[i].createTime = language == 'english' ? 'Unspecified' : "公司官方未注明";
        }

        // data[i].logo = data[i].logo.replace(/\s/g,"");
      }

      if (data.length >= 6) {
        isRefresh = 1;
      } else {
        isRefresh = 0;
      }

      that.setData({
        jobList: data,
        isLoading: false
      })
    })
  },

  //显示投递状态
  showDeliveryStatus() {
    this.setData({
      showDeliveryStatus: !this.data.showDeliveryStatus
    })
  },

  //切换tabbar
  swichNav: function (e) {
    let that = this;
    let offsetW = e.currentTarget.offsetLeft;
    let index = e.target.dataset.current;
    fenyepage = 1;
    myoffsetW = offsetW;
    that.clearDrop();
    that.initSelectData('', '', index, '', '', '', '', '', that.data.searchValue);
    if (that.data.currentTab === index) {
      return false;
    } else {
      that.setData({
        currentTab: index,
        slideOffset: offsetW,
        selectOrder: 0,
        searchValue: ''
      })
    }
  },

  //清空筛选框
  clearDrop() {
    let that = this;
    let data = that.data.selectData;
    for (let i in data) {
      switch (i) {
        case "0":
          data[i].selectName = "Apply Season";
          break;
        case "1":
          data[i].selectName = "Country";
          break;
        case "2":
          data[i].selectName = "Location Type";
          break;
        case "3":
          data[i].selectName = "Job Type";
          break;
        case "4":
          data[i].selectName = "Track";
          break;
        default:
          break;
      }
      data[i].status = false;
    }
    that.setData({
      selectData: data
    })
  },

  bindShowMsg(e) {
    let that = this;
    that.setData({
      currentSelect: e.currentTarget.dataset.select,
      select: !that.data.select,
      iconSelected: !that.data.select
    })
  },

  mySelect(e) {
    let that = this;
    let order = that.data.selectOrder == 0 ? '' : 'desc';
    let deadline = that.data.selectOrder == 0 ? '' : 'deadline';
    let name = e.currentTarget.dataset.name;
    let value = e.currentTarget.dataset.value == 'unlimited' ? '' : e.currentTarget.dataset.value;
    let index = e.currentTarget.dataset.id;
    let list = that.data.selectData;
    let searchValue = that.data.searchValue;

    for (let i = 0; i < list.length; i++) {
      if (i == index) {
        list[i].selectName = name;
        list[i].selectValue = value;
        list[i].status = true;
      }
    }

    let v0 = list[0].selectName != 'Apply Season' && list[0].selectName != '不限' ? list[0].selectValue : '';
    let v1 = list[1].selectName != 'Country' && list[1].selectName != '不限' ? list[1].selectValue : '';
    let v2 = list[2].selectName != 'Location Type' && list[2].selectName != '不限' ? list[2].selectValue : '';
    let v3 = list[3].selectName != 'Job Type' && list[3].selectName != '不限' ? list[3].selectValue : '';
    let v4 = list[4].selectName != 'Track' && list[4].selectName != '不限' ? list[4].selectValue : '';
    let applyType = that.data.currentTab;

    switch (index) {
      case 0:
        that.initSelectData(deadline, order, applyType, value, v1, v2, v3, v4, searchValue);
        break;
      case 1:
        that.initSelectData(deadline, order, applyType, v0, value, v2, v3, v4, searchValue);
        break;
      case 2:
        that.initSelectData(deadline, order, applyType, v0, v1, value, v3, v4, searchValue);
        break;
      case 3:
        that.initSelectData(deadline, order, applyType, v0, v1, v2, value, v4, searchValue);
        break;
      case 4:
        that.initSelectData(deadline, order, applyType, v0, v1, v2, v3, value, searchValue);
        break;
    }

    that.setData({
      selectData: list,
      select: false
    })
  },

  //初始化下拉框
  initDropdownbox() {
    let that = this;
    myRequest.http_getData('/mentee/internalJob/init', 'GET').then(res => {
      let data = res;
      let selectData = that.data.selectData;
      for (let i = 0; i < selectData.length; i++) {
        let selectArr = [];
        switch (i) {
          case 0:
            selectArr = data.applySeasonDic;
            break;
          case 1:
            selectArr = data.countryDic;
            break;
          case 2:
            selectArr = data.locationTypeDic;
            break;
          case 3:
            selectArr = data.jobTypeDic;
            break;
          case 4:
            selectArr = data.trackDic;
            break;
          default:
            break;
        }
        let obj = {
          itemName: '不限',
          itemValue: 'unlimited'
        };
        selectArr.unshift(obj);
        selectData[i].selectList = selectArr;
      }
      that.setData({
        selectData: selectData
      })
    })
  },

  onReachBottom() {
    var that = this;
    var language = app.globalData.language;
    if (isRefresh == 0) {
      return false;
    }

    if (that.data.hasLimit == true) {
      var recordStatus = that.data.currentTab;
      fenyepage = fenyepage + 1;
      myRequest.http_getData('/mentee/internalJob/list?pageNum=' + fenyepage + '&pageSize=10&sortCol=' + paramObj.deadline + '&sort=' + paramObj.order + '&recordStatus=' + recordStatus + '&jobType=' + paramObj.jobType + '&country=' + paramObj.country + '&track=' + paramObj.track + '&applySeason=' + paramObj.applySeason + '&locationType=' + paramObj.locationType, 'GET').then(res => {
        var data = res.rows;
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            let timeS = data[i].updateTime;
            let time = data[i].deadLine;
            if (data[i].hasDeadLine == 0) {
              data[i].deadLine = language == 'english' ? 'Unspecified' : "公司官方未注明";
            } else {
              if (time != '' && time != null && time != undefined) {
                data[i].deadLine = app.formatDeadline(time);
              } else {
                data[i].deadLine = language == 'english' ? 'Unspecified' : "公司官方未注明";
              }
            }

            if (timeS != '' && timeS != null && timeS != undefined) {
              let date = timeS.split(" ");
              data[i].createTime = app.dateDiff("", date[0]);
            } else {
              data[i].createTime = language == 'english' ? 'Unspecified' : "公司官方未注明";
            }
          }
          let olddata = that.data.jobList;
          olddata = olddata.concat(data);
          that.setData({
            jobList: olddata
          })
          isRefresh = 1;
        } else {
          isRefresh = 0;
        }
      })
    }
  },

  onShow() {
    let that = this;
    let languageApp = app.globalData.language == '' ? lan : app.globalData.language;
    let referralsPage = languageApp == 'english' ? english.Content.referralsPage : chinese.Content.referralsPage;

    that.setData({
      referralsPage: referralsPage,
      language: languageApp
    })
    wx.setNavigationBarTitle({
      title: referralsPage.pageTitle
    })
  },

  onUnload() {
    fenyepage = 1;
  },


  imageError(e) {
    console.log(e);
  }
})