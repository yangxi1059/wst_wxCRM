const app = getApp()

Page({
  data: {
    isLoading: true,
    autoplay: true,
    interval: 4000,
    duration: 1200,
    checkList: []
  },

  onLoad: function () {},

  onShow() {
    var that = this;
    var userInfo = wx.getStorageSync('userInfo');
    var data = {
      "datas": [{
          "id": 1,
          "imgurl": "cloud://wallstreettequila-hqja3.7761-wallstreettequila-hqja3-1304653337/a1.jpg"
        },
        {
          "id": 2,
          "imgurl": "cloud://wallstreettequila-hqja3.7761-wallstreettequila-hqja3-1304653337/a2.jpg"
        },
        {
          "id": 3,
          "imgurl": "cloud://wallstreettequila-hqja3.7761-wallstreettequila-hqja3-1304653337/a3.jpg"
        }
      ]
    };

    var checkList = [{
      name: "我的申请",
      src: "/images/menu-apply.png",
      url: "application"
    }, {
      name: "我的审核",
      src: "/images/menu-check.png",
      url: "check"
    }];

    var allManageList = [{
      name: "销售情况",
      src: "/images/sales.png",
      url: "sales-situation",
      isShow: userInfo.salesInfoFlag ? userInfo.salesInfoFlag : false
    }, {
      name: "人员管理",
      src: "/images/thorui.png",
      url: "application"
    }, {
      name: "成果展示",
      src: "/images/thorui.png",
      url: "check",
      isShow: true
    }, {
      name: "岗位资源",
      src: "/images/thorui.png",
      url: "check",
      isShow: true
    }, {
      name: "文件管理",
      src: "/images/thorui.png",
      url: "check",
      isShow: true
    }, {
      name: "项目管理",
      src: "/images/thorui.png",
      url: "check",
      isShow: true
    }, {
      name: "vip",
      src: "/images/thorui.png",
      url: "check",
      isShow: true
    }];

    that.setData({
      lunboData: data.datas,
      checkList,
      allManageList
    })
  },

  switchPage(e) {
    let url = e.currentTarget.dataset.url;
    let userInfo = wx.getStorageSync('userInfo');
    if (url == "sales-situation") {
      if (userInfo.token) {
        wx.navigateTo({
          url: '/pages/' + url + '/index'
        })
      } else {
        wx.navigateTo({
          url: '/pages/login/index'
        })
      }
    } else {
      wx.showToast({
        title: '此功能暂未开放',
        icon: 'none'
      })
    }
  },


  switchPages(e) {
    let url = e.currentTarget.dataset.url;
    let userInfo = wx.getStorageSync('userInfo') || 0;
    if (userInfo.token) {
      wx.navigateTo({
        url: '/pages/' + url + '/index'
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
  },

  onShareAppMessage: function (event) {}
})