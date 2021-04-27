var app = getApp()
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var myRequest = require("../../api/myRequest.js");
var mtabW;
var fenyepage = 1;
var isRefresh = 0;
var currentItem = '';
var liveTypeF = '',
  sortColF = '',
  sortF = '';
var topicsF = '',typesF = '',industriesF = '',locationsF = '';
Page({
  data: {
    dateArr: [],
    winHeight: 0,
    isLoading: true,
    hasLimited: true,
    showMyCourse: false,
    showSelectList: false,
    showslideOffset: true,
    showCalender: false,
    streamingPage: {},
    selectItemList: [],
    currentTab: 0,
    currentDate: 0,
    currentDateLive: '',
    slideOffset: 0,
    applyTotalNum: 0, //累计已报名
    applyInMonthNum: 0, //本月已报名
    officeHourNum: 0, //本月可报名
    searchValue: '',
    newDay: [],
    isCheckDate: false
  },

  onLoad(options) {
    let that = this;
    if (options.searchkey) {
      that.initLiveList('', '', '', '', '', '', '', options.searchkey);
      that.setData({
        searchValue: options.searchkey
      })
    } else {
      that.initLiveList('', '', '', '', '', '', '', '');
    }
    that.initLabel();
  },

  onShow() {
    let that = this;
    let languageApp = app.globalData.language == '' ? lan : app.globalData.language;
    let streamingPage = languageApp == 'english' ? english.Content.streamingPage : chinese.Content.streamingPage;
    let userInfo = wx.getStorageSync(app.globalData.version + '_userInfo');
    mtabW = 210 / 2;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          language: languageApp,
          streamingPage: streamingPage,
          winHeight: res.windowHeight,
          isShowAdvisory: userInfo.userType == 'mentee' ? false : true,
        })
      }
    })
  },

  switchTab(e) {
    let that = this;
    let tab = e.currentTarget.dataset.tab;
    let offsetW = tab * mtabW;
    that.initSixDay();
    that.initMyCourse();

    if (tab == 2) {
      that.setData({
        currentTab: tab,
        showslideOffset: false
      })
      return false
    }
    that.setData({
      currentTab: tab,
      slideOffset: offsetW,
      showslideOffset: true
    }, function () {
      var query = wx.createSelectorQuery();
      query.select('#index-pageTop').boundingClientRect(function (rect) {
        wx.getSystemInfo({
          success: function (res) {
            let top = res.windowHeight - rect.height - 20 - 130;
            that.setData({
              centerHeight: top
            })
          }
        })
      }).exec()
    })
  },

  clearInput() { //清空输入框
    this.initLiveList('', '', '', '', '', '', '', '');
    this.setData({
      searchValue: ''
    })
  },

  bindChange: function (e) {
    let that = this;
    let index = e.detail.current;
    let scrollToValue = 't' + index;
    let dateValue = that.data.dateArr[index].dateValue;
    that.setData({
      currentDate: index,
      scrollTo: scrollToValue
    })
    that.initClassList(dateValue, index)
  },

  switchDate(e) {
    this.setData({
      currentDate: e.currentTarget.dataset.date,
    })
  },

  showSelectList() {
    this.setData({
      showSelectList: !(this.data.showSelectList)
    })

    if (this.data.showSelectList) {
      wx.hideTabBar();
    } else {
      wx.showTabBar();
    }
  },

  onClose() {
    this.setData({
      showSelectList: false,
      showCalender: false
    })
  },

  showCalender() {
    this.setData({
      showCalender: !(this.data.showCalender)
    })

    if (this.data.showCalender) {
      wx.hideTabBar();
    } else {
      wx.showTabBar();
    }
  },

  showMyCourse() {
    this.setData({
      showMyCourse: true
    })
  },

  toDetail(e) {
    let userInfo = wx.getStorageSync('userInfo') || 0;
    let liveId = e.currentTarget.dataset.liveid;
    if (userInfo.token) {
      wx.navigateTo({
        url: '/pages/live-lesson/detail/index?liveId=' + liveId,
      })
    } else {
      wx.setStorageSync('previewurl', 'https://www.wallstreettequila.com/')
      wx.navigateTo({
        url: '/pages/preview-file/index',
      })
    }
  },

  toSearch() {
    let value = this.data.searchValue;
    wx.navigateTo({
      url: '/pages/search/index?type=live&searchValue=' + value,
    })
  },

  toOrderDetail(e) {
    let lid = e.currentTarget.dataset.lid;
    wx.navigateTo({
      url: '/pages/live-lesson/schedule/index?lid=' + lid
    })
  },

  initMyCourse() {
    myRequest.http_getData('/oneOnOne/my/courses', 'GET').then(res => {
      this.setData({
        applyTotalNum: res.applyTotalNum,
        officeHourNum: res.officeHourNum,
        applyInMonthNum: res.applyInMonthNum,
        myCourseList: res.applyList
      })
    })
  },

  initSixDay() {
    var monthEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var dayEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var that = this;
    var dateArr = [];
    var now = new Date();
    var nowTime = now.getTime();
    var myDate = new Date(nowTime);
    var currentYear = myDate.getFullYear();
    var currentMonth = myDate.getMonth() + 1;
    var oneDayTime = 24 * 60 * 60 * 1000;
    for (var i = 0; i < 13; i++) {
      var ShowTime = nowTime + (i) * oneDayTime;
      var myDate = new Date(ShowTime);
      var year = myDate.getFullYear();
      var month = myDate.getMonth() + 1;
      var date = myDate.getDate();
      if (date >= 1 && date <= 9) {
        date = "0" + date;
      }
      var dateText = date;
      var dayText = dayEn[myDate.getDay()];
      var monthNew = month < 10 ? '0' + month : month;
      var dateValue = year + '-' + monthNew + '-' + date;

      let dateObj = {
        dateText: dateText,
        dayText: dayText,
        dateValue: dateValue,
        classList: []
      }
      if (i == 0) {
        that.initClassList(dateValue, i);
      }
      dateArr.push(dateObj);
    }
    currentMonth = monthEn[currentMonth - 1];
    that.setData({
      dateArr,
      currentYear,
      currentMonth

    })
  },

  initClassList(dateValue, index) {
    let that = this;
    myRequest.http_getData_noload('/oneOnOne/day', 'GET', {
      lessonDate: dateValue
    }).then(res => {
      for (var item in res) {
        let applyStatus;
        let allNum = parseInt(res[item].applyLimit / 2);
        if (res[item].applyNum == res[item].applyLimit) {
          applyStatus = '满员'
        } else {
          if (res[item].applyNum > allNum) {
            applyStatus = '紧张'
          } else {
            applyStatus = ''
          }
        }
        res[item].applyStatus = applyStatus;
      }
      var dateArr = that.data.dateArr;
      dateArr[index].classList = res;
      that.setData({
        dateArr
      })
    })
  },


  //初始化数据
  initLiveList(types, industries, locations, liveDate, liveGroup, sortCol, sort, search) {
    let that = this;
    if (this.data.dateObj != undefined) {
      liveDate = this.data.dateObj.nowDate == '' ? '' : this.data.currentDateLive;
    } else {
      liveDate = '';
    }

    liveGroup = liveTypeF;
    let url = `/live/online/list?pageNum=1&pageSize=10&types=${types}&industries=${industries}&locations=${locations}&liveDate=${liveDate}&liveGroup=${liveGroup}&sortCol=${sortCol}&sort=${sort}&search=${search}`;
    myRequest.http_getData(url, 'GET').then(res => {

      let dataList = res.rows
      for (let item in dataList) {
        let tags = dataList[item].tags;
        let tagsArray = [];
        if (tags != null && tags != undefined && tags != "") {
          tagsArray = tags.split(";");
        }
        dataList[item].tags = tagsArray;
        dataList[item].planTime = app.formatTime(dataList[item].planTime);
      }
      that.setData({
        liveList: dataList,
        isLoading: false,
        showSelectList:false
      })
      if (dataList.length >= 10) {
        isRefresh = 1;
      } else {
        isRefresh = 0;
      }
      wx.showTabBar();
    })
  },

  initLabel() {
    myRequest.http_getData('/live/list/init', 'GET').then(res => {
      let obj1 = {
        itemName: 'All',
        itemValue: 'allTypes',
        active: true
      }
      let typesList = res.typesList;
      typesList.unshift(obj1);
      let types = {
        name: 'Types',
        list: typesList
      }

      let obj2 = {
        itemName: 'All',
        itemValue: 'allIndustries',
        active: true
      }
      let industriesList = res.industriesList;
      industriesList.unshift(obj2);
      let industries = {
        name: 'Industries',
        list: industriesList
      }

      let obj3 = {
        itemName: 'All',
        itemValue: 'allLocations',
        active: true
      }
      let locationsList = res.locationsList;
      locationsList.unshift(obj3);
      let locations = {
        name: 'Locations',
        list: locationsList
      }

      let obj4 = {
        itemName: 'All',
        itemValue: 'allTopics',
        active: true
      }
      let topicList = [];
      topicList.unshift(obj4);
      res.groupList.forEach(element => {
        let obj = {
          itemName: element.liveGroup,
          itemValue: element.liveGroup
        }
        topicList.push(obj);
      });

      let topic = {
        name: 'Topics',
        list: topicList
      }

      let labelist = {
        Types: types,
        Industries: industries,
        Locations: locations,
        Topics: topic
      }
      this.setData({
        labelist
      })
    })
  },

  clickLabel(e) {
    let type = e.currentTarget.dataset.type;
    let value = e.currentTarget.dataset.value;
    let labelist = this.data.labelist;
    let list = labelist['' + type + ''].list;

    list.forEach(element => {
      if (value == 'all' + type) {
        element.active = false;
        list[0].active= true;
      } else {
        if (value == element.itemValue) {
          labelist['' + type + ''].list[0].active = false;
          if (element.active) {
            element.active = false
          } else {
            element.active = true
          }
        }
      }
    });
    labelist['' + type + ''].list = list
    this.setData({ labelist })
  },

  resetLabel() {
    let labelist = this.data.labelist;
    for (let item in labelist) {
      let list = labelist['' + item + ''].list;
      list.forEach(element => {
        element.active = false;
        list[0].active = true;
      });
      labelist['' + item + ''].list = list
    }
    topicsF = '';
    typesF = '';
    industriesF = '';
    locationsF = '';
    this.initLiveList('', '', '', '', '', '', '', '');
    this.setData({
      labelist,
      showSelectList: false
    })
  },

  comfirmLabel() {
    let labelist = this.data.labelist;
    let types = [];
    let list1 = labelist['Types'].list;
    list1.forEach(element => {
      if (element.active && element.itemName != "All") {
        types.push(element.itemValue)
      }
    });

    let topics = [];
    let list2 = labelist['Topics'].list;
    list2.forEach(element => {
      if (element.active  && element.itemName != "All") {
        topics.push(element.itemValue)
      }
    });

    let industries = [];
    let list3 = labelist['Industries'].list;
    list3.forEach(element => {
      if (element.active  && element.itemName != "All") {
        industries.push(element.itemValue)
      }
    });

    let locations = [];
    let list4 = labelist['Locations'].list;
    list4.forEach(element => {
      if (element.active  && element.itemName != "All") {
        locations.push(element.itemValue)
      }
    });
    topicsF = topics = topics.join(",");
    typesF = types = types.join(",");
    industriesF = industries = industries.join(",");
    locationsF = locations = locations.join(",");

    this.initLiveList(types, industries, locations, this.data.currentDateLive, topics, '', '', this.data.searchValue);
  },

  onReachBottom() {
    let that = this;

    if (that.data.currentTab != 0) return false;

    if (currentItem != '') return false;

    if (isRefresh == 0) return false;

    fenyepage = fenyepage + 1;

    let liveDate = '';

    if (this.data.dateObj != undefined) {
      liveDate = this.data.dateObj.nowDate == '' ? '' : this.data.currentDateLive;
    } else {
      liveDate = '';
    }

    let search = this.data.searchValue;

    myRequest.http_getData(`/live/online/list?pageNum=${fenyepage}&pageSize=10&types=${typesF}&industries=${industriesF}&locations=${locationsF}&liveDate=${liveDate}&liveGroup=${topicsF}&sortCol=${sortColF}&sort=${sortF}&search=${search}`, 'GET').then(res => {
      let dataList = res.rows;
      if (dataList.length > 0) {
        for (let item in dataList) {
          let tags = dataList[item].tags;
          let tagsArray = [];
          if (tags != null && tags != undefined && tags != "") {
            tagsArray = tags.split(";");
          }
          dataList[item].tags = tagsArray;
          dataList[item].planTime = app.formatTime(dataList[item].planTime);
        }
        var olddata = that.data.liveList;
        olddata = olddata.concat(dataList);
        that.setData({
          liveList: olddata
        })
        isRefresh = 1;
      } else {
        isRefresh = 0;
      }
    })
  },

  getCalendarData(e) { // 监听日历数据
    let obj = e.detail;
    let month = obj.nowMonth;
    let day = obj.nowDate;
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (day >= 1 && day <= 9) {
      day = "0" + day;
    }
    let currentDateLive = obj.nowYear + '-' + month + '-' + day;

    this.setData({
      currentDateLive,
      dateObj: obj,
      isOk: day == '' ? true : false
    })
  },

  resetData() {
    liveTypeF = '';
    sortColF = '';
    sortF = '';
    currentItem = '';
    this.setData({
      isLivetypeHot_active: false,
      isOk: false,
      showCalender: false,
      isCheckDate: false,
      currentDateLive: '',
      currentLivetype: 100,
      isOk: true
    }, function () {
      this.initLiveList('', '', '', '', '', '', '', '');
      wx.showTabBar();
    })
  },

  filterByDate(e) {
    let date = e.currentTarget.dataset.date;
    let day = this.data.currentDateLive;
    this.initLiveList(typesF,industriesF,locationsF, date, '', '', '', '');
    this.setData({
      showCalender: false,
      isCheckDate: day == '' ? false : true
    }, function () {
      wx.showTabBar();
    })
  },

  onShareAppMessage: function (event) {}
})