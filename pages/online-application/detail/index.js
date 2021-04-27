var app = getApp()
var myRequest = require("../../../api/myRequest.js")

Page({

  data: {
    isLoading: true,
    jobInfo: {},
    over: false,
    lableWidth: '320',
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
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var nid = options.nid;
    var language = app.globalData.language;
    myRequest.http_getData('/mentee/netJob/' + nid + '/info', 'GET').then(data => {
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
      that.setData({
        jobInfo: data,
        lableList: lableData,
        isLoading: false
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    setTimeout(function () {
      var query = wx.createSelectorQuery();
      query.select('.lable-three').boundingClientRect(function (rect) {
        if (rect.width > 165) {
          that.setData({
            over: true,
            lableWidth: '670'
          })
        }
      }).exec();
    }, 1000)
  },

  copy: function (e) {
    var code = e.currentTarget.dataset.copy;
    wx.setClipboardData({
      data: code,
      success: function (res) {
        wx.showToast({
          title: '复制成功'
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '复制失败'
        })
      }
    })
  }
})