var app = getApp();
var myRequest = require("../../api/myRequest.js")
var english = require("../../utils/English.js")
var chinese = require("../../utils/Chinese.js")
var isSelectAll = true;
var isRefresh = 0;
var searchKey = '';
var trackArr = [];
var pageNum = 1,
  pageSize = 10;
var paramObj = {};


Page({

  data: {
    isLoading: true,
    isBinding: true, //判断是否绑定wst账户
    interviewList: [],
    selectData: [{
      selectName: 'Apply Season', //申请季
      selectList: [],
      status: false
    },
    {
      selectName: 'Country', //国家
      selectList: [],
      status: false
    },
    {
      selectName: 'Track', //行业
      selectList: [],
      status: false
    },
    {
      selectName: 'Company Name', //公司名
      selectList: [],
      status: false
    },
    {
      selectName: 'Job Type', //岗位类型
      selectList: [],
      status: false
    }
  ]
  
  },

  onLoad: function () {
    let that = this;
    let menuButtonWidth = wx.getMenuButtonBoundingClientRect().width;
    let menuButtonHeight = wx.getMenuButtonBoundingClientRect().height;
    that.setData({
      navHeight: app.globalData.navHeight,
      navTop: app.globalData.navTop,
      menuButtonWidth: menuButtonWidth,
      menuButtonHeight: menuButtonHeight
    })
    that.queryData(pageNum, pageSize, '', '', '', '', '', '');
    that.initDropdownbox();
  },

  onSearch(e) {
    searchKey = e.detail;
    this.queryData(pageNum, pageSize, '', '', '', '', '', searchKey);
  },

  onClear() {
    searchKey = '';
    this.queryData(pageNum, pageSize, '', '', '', '', '', '');
  },

  onChange(e) {
    if (e.detail == '') {
      searchKey = '';
      this.queryData(pageNum, pageSize, '', '', '', '', '', '');
    }
  },

  toDetail(e) {
    if(this.data.isBinding == 1){
      let pkId = e.currentTarget.dataset.pkid;
      wx.navigateTo({
        url: '/pages/interview-database/detail/index?pkId=' + pkId
      })
    }else{
      return false
    }
  },

  onShow() {
    var languageApp = app.globalData.language;
    var interviewDatabasePage = languageApp == 'english' ? english.Content.interviewDatabasePage : chinese.Content.interviewDatabasePage;
    this.setData({ interviewDatabasePage })
  },

  
  mySelect(e) {
    let that = this;
    let name = e.currentTarget.dataset.name;
    let value = e.currentTarget.dataset.value == 'unlimited' ? '' : e.currentTarget.dataset.value;
    let index = e.currentTarget.dataset.id;
    let list = that.data.selectData;
    if (index == 2 && value != '') {
      var companyArr = [];
      trackArr.forEach(element => {
        if (element.value == value) {
          element.children.forEach(child => {
            let obj = {
              itemName: child.label,
              itemValue: child.value
            }
            companyArr.push(obj);
          })
        }
      });
      let obj = {
        itemName: '不限',
        itemValue: 'unlimited'
      };
      companyArr.unshift(obj);
      list[3].selectList = companyArr;
    }
    for (let i = 0; i < list.length; i++) {
      if (i == index) {
        list[i].selectName = name;
        list[i].selectValue = value;
        list[i].status = true
      }
    }

    let v0 = list[0].selectName != 'Apply Season' && list[0].selectName != '不限' ? list[0].selectValue : '';
    let v1 = list[1].selectName != 'Country' && list[1].selectName != '不限' ? list[1].selectValue : '';
    let v2 = list[2].selectName != 'Track' && list[2].selectName != '不限' ? list[2].selectValue : '';
    let v3 = list[3].selectName != 'Company Name' && list[3].selectName != '不限' ? list[3].selectValue : '';
    let v4 = list[4].selectName != 'Job Type' && list[4].selectName != '不限' ? list[4].selectValue : '';
    switch (index) {
      case 0:
        that.queryData(pageNum, pageSize, value, v1, v2, v3, v4, searchKey);
        break;
      case 1:
        that.queryData(pageNum, pageSize, v0, value, v2, v3, v4, searchKey);
        break;
      case 2:
        that.queryData(pageNum, pageSize, v0, v1, value, v3, v4, searchKey);
        break;
      case 3:
        that.queryData(pageNum, pageSize, v0, v1, v2, value, v4, searchKey);
        break;
      case 4:
        that.queryData(pageNum, pageSize, v0, v1, v2, v3, value, searchKey);
        break;
    }
    isSelectAll = false;
    that.setData({
      selectData: list,
      select: false
    })
  },

  //初始化下拉框
  initDropdownbox() {
    var that = this;
    myRequest.http_getData('/mentee/interview/online/search/init', 'GET').then(res => {
      var data = res;
      trackArr = data.track;
      var trackList = [];
      data.track.forEach(element => {
        let obj = {
          itemName: element.label,
          itemValue: element.value
        }
        trackList.push(obj);
      });

      var selectData = that.data.selectData;
      for (let i = 0; i < selectData.length; i++) {
        var selectArr = [];
        switch (i) {
          case 0:
            selectArr = that.getSeasonYear();
            break;
          case 1:
            selectArr = data.country;
            break;
          case 2:
            selectArr = trackList;
            break;
          case 3:
            selectArr = [];
            break;
          case 4:
            selectArr = data.internship_or_full_time;
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

  queryData(pageNum, pageSize, applySeason, country, track, companyId, resultApply, search) {
    paramObj = {
      applySeason: applySeason,
      country: country,
      track: track,
      companyId: companyId,
      resultApply: resultApply
    }
    let that = this;
    myRequest.http_getData(`/mentee/interview/online/list?pageNum=${pageNum}&pageSize=${pageSize}&applySeason=${applySeason}&country=${country}&track=${track}&companyId=${companyId}&resultApply=${resultApply}&search=${search}`, 'GET').then(res => {
      let interviewList = res.rows;
      interviewList.forEach(element => {
        element.difficultyLevel = parseInt(element.difficultyLevel);
      });
      that.setData({
        interviewList,
        isLoading: false
      })

      if (interviewList.length >= 10) {
        isRefresh = 1;
      } else {
        isRefresh = 0;
      }
    })
  },

  onReachBottom() {
    let that = this;

    if (isRefresh == 0) return false;

    pageNum = pageNum + 1;
    myRequest.http_getData(`/mentee/interview/online/list?pageNum=${pageNum}&pageSize=${pageSize}&applySeason=${paramObj.applySeason}&country=${paramObj.country}&track=${paramObj.track}&companyId=${paramObj.applySeason}&country=${paramObj.country}&track=${paramObj.companyId}&resultApply=${paramObj.applySeason}&country=${paramObj.country}&track=${paramObj.resultApply}&search=${searchKey}`, 'GET').then(res => {
      let interviewList = res.rows;
      if (interviewList.length > 0) {
        interviewList.forEach(element => {
          element.difficultyLevel = parseInt(element.difficultyLevel);
        });
        var olddata = that.data.interviewList;
        olddata = olddata.concat(interviewList);
        that.setData({
          interviewList: olddata
        })
        isRefresh = 1;
      } else {
        isRefresh = 0;
      }
    })
  },

  navBack: function () {
    wx.switchTab({
      url: '/pages/mine/my'
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

  
  //获取申请季的年份
  getSeasonYear() {
    var yearArr = [];
    var myDate = new Date();
    var nowYear = myDate.getFullYear();
    for (let i = 2015; i <= nowYear + 1; i++) {
      let obj = {
        itemName: i,
        itemValue: i
      }
      yearArr.push(obj);
    }
    yearArr.reverse();
    return yearArr;
  }
})