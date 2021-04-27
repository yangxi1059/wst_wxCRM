var app = getApp()
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var http_getData = require("../../api/myRequest.js");
var fenyepage = 1;
var isRefresh = 0; //是否需要上拉加载
var mtabW = 0;

Page({
  data: {
    seriesPage: {},
    language: '',
    isLoading: true,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    dataList: [],
    showMoreLesson: true,
    isShowList: true,
    activeNames: 1,
    showSelectList: false,
    searchValue: '',
    slideOffset: 0,
    tabData: [{
        name: 'Tequila Shot™',
        icon: '/images/tequli2.png',
        iconFill: '/images/tequali.png',
        iconClass: 'icon-orange',
      },
      {
        name: 'CFA Coaching',
        icon: '/images/purple.png',
        iconFill: '/images/purple-fill.png',
        iconClass: 'icon-purple',

      },
      {
        name: 'Other',
        icon: '/images/green.png',
        iconFill: '/images/green-fill.png',
        iconClass: 'icon-green',
      }
    ],

    itemTab: [{
        id: 1,
        name: 'Fundamentals',
        icon: '/images/icon-1.png',
        iconClass: 'icon1',
      },
      {
        id: 2,
        name: 'Coding',
        icon: '/images/icon-2.png',
        iconClass: 'icon2',
      },
      {
        id: 3,
        name: 'Finance',
        icon: '/images/icon-3.png',
        iconClass: 'icon3',
      },
      {
        id: 4,
        name: 'Consulting',
        icon: '/images/icon-4.png',
        iconClass: 'icon4',
      },
      {
        id: 5,
        name: 'Company Insights',
        icon: '/images/icon-5.png',
        iconClass: 'icon5',
      }
    ],
    selectCurrentObj: {
      id: 0,
      name: 'All',
      icon: '/images/all.png',
      iconClass: 'icon0',
    },
  },

  onLoad: function (options) {
    var that = this;
    that.app = getApp();
    if (options.searchkey) {
      that.queryData("recruiting", "", 7, options.searchkey);
      that.setData({
        searchValue: options.searchkey,
        currentTab: options.courseType
      })
    } else {
      that.queryData("recruiting", "", 7, '');
    }

    mtabW = 690 / 3;
  },

  btn() {},

  toSearch() {
    let value = this.data.searchValue;
    let courseType = this.data.currentTab;
    wx.navigateTo({
      url: '/pages/search/index?type=course&courseType=' + courseType + '&searchValue=' + value,
    })
  },

  showSelectList() {
    this.setData({
      showSelectList: !(this.data.showSelectList)
    })
  },

  //查询数据
  queryData(courseType, courseGroup, pageSize, searchKey) {
    let that = this;
    var language = app.globalData.language;
    http_getData.http_getData('/course/list?pageNum=1&pageSize=' + pageSize + '&search=' + searchKey, 'GET', {
      courseType: courseType,
      courseGroup: courseGroup
    }).then(res => {
      var data = res.rows;
      if (data.length >= 0) {
        for (var i = 0; i < data.length; i++) {
          var vdt = app.formatSeconds(data[i].videoDurationTotal, language);
          var tags = data[i].tags;
          var tagArr = [];
          if (tags != null && tags != "") {
            tagArr = tags.split(';');
          }
          data[i].tags = tagArr;
          data[i].videoDurationTotal = vdt;
          if (data[i].videoCount > data[i].publicVideoCount && data[i].publicVideoCount > 0) {
            data[i].status = 'bufen';
          } else if (data[i].publicVideoCount == 0) {
            data[i].status = 'vip';
          } else if (data[i].videoCount == data[i].publicVideoCount && data[i].publicVideoCount > 0) {
            data[i].status = 'visitor';
          }
        }
        that.setData({
          isLoading: false,
          dataList: data,
        })

        if (data.length >= pageSize) {
          isRefresh = 1;
        } else {
          isRefresh = 0;
        }
      }
    })
  },

  //点击tab切换
  swichNav: function (e) {
    var that = this;
    let currentItem = {
      id: 0,
      name: 'All',
      icon: '/images/all.png',
      iconClass: 'icon0'
    };
    let itemList = [{
        id: 1,
        name: 'Fundamentals',
        icon: '/images/icon-1.png',
        iconClass: 'icon1'
      },
      {
        id: 2,
        name: 'Coding',
        icon: '/images/icon-2.png',
        iconClass: 'icon2'
      },
      {
        id: 3,
        name: 'Finance',
        icon: '/images/icon-3.png',
        iconClass: 'icon3'
      },
      {
        id: 4,
        name: 'Consulting',
        icon: '/images/icon-4.png',
        iconClass: 'icon4'
      },
      {
        id: 5,
        name: 'Company Insights',
        icon: '/images/icon-5.png',
        iconClass: 'icon5'
      }
    ];

    var offsetW = e.currentTarget.offsetLeft;
    if (e.currentTarget.dataset.current == 0) {
      that.queryData("recruiting", "", 7, '');
      that.setData({
        selectCurrentObj: currentItem,
        itemTab: itemList
      })
    } else if (e.currentTarget.dataset.current == 1) {
      that.queryData("cfa", "", 7, '');
    } else {
      that.queryData("other", "", 7, '');
    }
    if (that.data.currentTab === e.currentTarget.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.currentTarget.dataset.current,
        showSelectList: false,
        searchValue: '',
        slideOffset: offsetW,
      })
    }
  },

  // 点击Item切换
  swichItem(e) {
    var that = this;
    var id = e.currentTarget.dataset.item;
    var name = e.currentTarget.dataset.name;
    var selectList = that.data.itemTab;
    let currentItem = {};
    let allObj = that.data.selectCurrentObj;
    switch (id) {
      case 0:
        that.queryData("recruiting", "", 100, that.data.searchValue);
        break;
      case 1:
        that.queryData("recruiting", "Fundamentals", 100, that.data.searchValue);
        break;
      case 2:
        that.queryData("recruiting", "Coding", 100, that.data.searchValue);
        break;
      case 3:
        that.queryData("recruiting", "Finance", 100, that.data.searchValue);
        break;
      case 4:
        that.queryData("recruiting", "consulting", 100, that.data.searchValue);
        break;
      case 5:
        that.queryData("recruiting", "miscellaneous", 100, that.data.searchValue);
        break;
    }

    for (let i in selectList) {
      if (selectList[i].name == name) {
        currentItem = selectList[i];
        selectList.splice(i, 1, allObj);
      }
    }
    var dataList = selectList.sort(that.compare('id'));
    that.setData({
      selectCurrentObj: currentItem,
      showSelectList: false,
      itemTab: dataList
    })
  },

  compare(property) {
    return function (a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value1 - value2;
    }
  },

  //进入详情页
  switchDetail(e) {
    let userInfo = wx.getStorageSync('userInfo') || 0;
    if (userInfo.token) {
      let cid = e.currentTarget.dataset.cid;
      let status = e.currentTarget.dataset.status;
      let name = e.currentTarget.dataset.statusname;
      wx.navigateTo({
        url: '/pages/recording-lesson/detail/index?cid=' + cid + '&status=' + status + '&statusName=' + name,
      })
    } else {
      wx.setStorageSync('previewurl', 'https://www.wallstreettequila.com/')
      wx.navigateTo({
        url: '/pages/preview-file/index',
      })
    }

  },

  //用户点击右上角分享
  onShareAppMessage: function (event) {
    if (event.from === 'button') {
      var cid = event.target.dataset.cid;
      var imgUrl = event.target.dataset.img;
      var title = event.target.dataset.title;
      return {
        title: title,
        imageUrl: imgUrl,
        path: '/pages/recordingclass/detail/index?cid=' + cid,
      }
    } else {
      return {
        title: 'WST视频课程'
      }
    }
  },

  onShow() {
    var that = this;
    var selectCurrentObj = that.data.selectCurrentObj;
    var languageApp = app.globalData.language;
    var seriesPage = languageApp == 'english' ? english.Content.seriesPage : chinese.Content.seriesPage;
    selectCurrentObj.name = seriesPage.selectCurrent.name;
    var itemTab = that.data.itemTab;
    var itemApp = seriesPage.selectMenu;
    for (var i in itemTab) {
      if (itemTab[i].id == itemApp[i].id) {
        itemTab[i].name = itemApp[i].name;
      }
    }

    for (var i in itemApp) {
      if (itemApp[i].id == selectCurrentObj.id) {
        selectCurrentObj.name = itemApp[i].name;
      }
    }

    that.setData({
      itemTab: itemTab,
      language: languageApp,
      selectCurrentObj: selectCurrentObj,
      seriesPage: seriesPage,
    })

    wx.setNavigationBarTitle({
      title: seriesPage.pageName
    })
  },


  onReachBottom() {
    var that = this;
    var language = app.globalData.language;
    var courseType = '';

    if (isRefresh == 0) {
      return false;
    }
    switch (that.data.currentTab) {
      case 0:
        courseType = 'recruiting';
        break;
      case 1:
        courseType = 'cfa';
        break;
      case 2:
        courseType = 'other';
        break;
      default:
        break;
    }

    var courseGroup = '';
    if (that.data.currentTab == 0) {
      switch (that.data.selectCurrentObj.id) {
        case 0:
          courseGroup = '';
          break;
        case 1:
          courseGroup = 'Fundamentals';
          break;
        case 2:
          courseGroup = 'Coding';
          break;
        case 3:
          courseGroup = 'Finance';
          break;
        case 4:
          courseGroup = 'consulting';
          break;
        case 5:
          courseGroup = 'miscellaneous';
          break;
      }
    }

    fenyepage = fenyepage + 1;
    http_getData.http_getData_noload('/course/list?pageNum=' + fenyepage + '&pageSize=7', 'GET', {
      courseType: courseType,
      courseGroup: courseGroup
    }).then(res => {
      var data = res.rows;
      if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          var vdt = app.formatSeconds(data[i].videoDurationTotal, language);
          var tags = data[i].tags;
          var tagArr = [];
          if (tags != null && tags != "") {
            tagArr = tags.split(';');
          }
          data[i].tags = tagArr;
          data[i].videoDurationTotal = vdt;
          if (data[i].videoCount > data[i].publicVideoCount && data[i].publicVideoCount > 0) {
            data[i].status = 'bufen';
          } else if (data[i].publicVideoCount == 0) {
            data[i].status = 'vip';
          } else if (data[i].videoCount == data[i].publicVideoCount && data[i].publicVideoCount > 0) {
            data[i].status = 'visitor';
          }
        }
        var olddata = that.data.dataList;
        olddata = olddata.concat(data);
        that.setData({
          dataList: olddata,
        })
        isRefresh = 1;
      } else {
        isRefresh = 0;
      }
    })
  }
})