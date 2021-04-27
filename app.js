var chinese = require("./utils/Chinese.js")
var english = require("./utils/English.js")

// serverURLNew: 'https://pageguo.com/api-test',
// serverURL: 'https://pageguo.com/wb-api-test',

// serverURLNew:https://www.wallstreettequila.com/api-prod
// serverURL:https://www.wallstreettequila.com/wb-api-prod


App({
  globalData: {
    serverURLNew: 'https://www.wallstreettequila.com/api-prod',
    serverURL: 'https://www.wallstreettequila.com/wb-api-prod',
    serverImgUrl: 'cloud://wallstreettequila-hqja3.7761-wallstreettequila-hqja3-1304653337/',
    userInfo: null,
    version: '1.1.5',
    isLogin: 0,
    language: 'english'
  },

  onHide(){
    console.log("onHide");
  },

  onShow() {
    let that = this;

    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    wx.getSystemInfo({
      success: res => {
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top, //胶囊按钮与顶部的距离
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2; //导航高度
        that.globalData.navHeight = navHeight;
        that.globalData.navTop = navTop;
        that.globalData.windowHeight = res.windowHeight;
      }
    })

    let userInfo = wx.getStorageSync('userInfo') || 0;
    if (userInfo != 0) {
      that.globalData.isLogin = 1;
    }

    
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          //清空当前缓存
          //wx.clearStorageSync();
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                console.log(res);
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            })
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  updateTabbar() {
    var language = this.globalData.language;
    var tabbar = [];
    if (language == 'english') {
      tabbar = english.Content.tabbar;
    } else {
      tabbar = chinese.Content.tabbar;
    }
    for (let i in tabbar) {
      wx.setTabBarItem({
        index: parseInt(i),
        text: tabbar[i]
      })
    }
  },

  formatSeconds(value, languageType) {
    var secondTime = parseInt(value); // 秒
    var minuteTime = 0; // 分
    var hourTime = 0; // 小时
    if (secondTime > 60) {
      minuteTime = parseInt(secondTime / 60);
      secondTime = parseInt(secondTime % 60);
      if (minuteTime > 60) {
        hourTime = parseInt(minuteTime / 60);
        minuteTime = parseInt(minuteTime % 60);
      }
    }
    var result = '';
    if (hourTime <= 1) {
      if (minuteTime > 0 && minuteTime < 2) {
        result = "" + parseInt(minuteTime) + (languageType == 'english' ? 'min' : '分钟') + result;
      }

      if (minuteTime >= 2) {
        result = "" + parseInt(minuteTime) + (languageType == 'english' ? 'mins' : '分钟') + result;
      }

      if (hourTime > 0 && hourTime < 2) {
        result = "" + parseInt(hourTime) + (languageType == 'english' ? 'hr' : '小时') + result;
      }
    } else {
      if (minuteTime >= 2) {
        result = "" + parseInt(minuteTime) + (languageType == 'english' ? 'mins' : '分钟') + result;
      }
      if (hourTime >= 2) {
        result = "" + parseInt(hourTime) + (languageType == 'english' ? 'hrs' : '小时') + result;
      }
    }
    return result;
  },
  //格式化时间 几天前
  dateDiff(sDate1, sDate2) {
    var timeText;
    if (sDate1 == sDate2) {
      timeText = "today";
      return timeText;
    }
    if (!sDate1) {
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      sDate1 = year + "-" + month + "-" + day;
    }
    var aDate, oDate1, oDate2, iDays;

    aDate = sDate1.split("-");
    oDate1 = new Date(aDate[1] + '/' + aDate[2] + '/' + aDate[0]); //转换为Mm-dd-yyyy格式,这种date的构造方式在苹果手机会报错，见解释
    aDate = sDate2.split("-");
    oDate2 = new Date(aDate[1] + '/' + aDate[2] + '/' + aDate[0]);
    iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数  
    if (iDays >= 2) {
      timeText = iDays + " days ago";
    } else if (iDays == 1) {
      timeText = iDays + " day ago";
    } else if (iDays == 0) {
      timeText = "today";
    }
    return timeText;
  },

  //格式化时间
  formatSecond(seconds) {
    var min = 0,
      second = 0,
      hour = 0,
      newMin = 0,
      time = 0;
    if ((seconds / 60) > 1) {
      min = (Math.floor(seconds / 60));
    }
    if (seconds > 0) {
      second = Math.ceil(seconds % 60);
    }
    if (min > 60) {
      hour = (Math.floor(min / 60));
      newMin = Math.floor(min % 60);
    }
    if (second < 10) {
      second = '0' + second;
    }
    if (min < 10) {
      min = '0' + min;
    }
    time = hour != '00' ? (hour + ':' + newMin + ':' + second) : (min + ':' + second);

    return time;
  },


  //生成随机数
  random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  formatTime(time) {
    var timeArr = time.split(" ");
    if (timeArr[1] != undefined) {
      var date = this.formatDatedd(timeArr[0]);
      var newTime = date + ' ' + timeArr[1] + ' 东八区';
      return newTime;
    } else {
      var date = this.formatDatedd(timeArr[0]);
      var newTime = date + ' 东八区';
      return newTime;
    }
  },
  //格式化
  formatDatedd(date) {
    var m = new Array("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC");
    var time = date.split("-");
    var dd = time[2];
    var mm = time[1];
    var yy = time[0];
    var newData = m[mm - 1] + " " + dd + ", " + yy;
    return newData;
  },

  change(limit) {
    let size = "";
    if (limit < 0.1 * 1024) {
      size = limit.toFixed(2) + "B"
    } else if (limit < 0.1 * 1024 * 1024) {
      size = (limit / 1024).toFixed(2) + "KB"
    } else if (limit < 0.1 * 1024 * 1024 * 1024) {
      size = (limit / (1024 * 1024)).toFixed(2) + "MB"
    } else {
      size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB"
    }
    let sizeStr = size + "";
    let index = sizeStr.indexOf(".");
    let dou = sizeStr.substr(index + 1, 2)
    if (dou == "00") {
      return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
    }
    return size;
  },

 getFileType(fileType) {
    let type = '';
    let that = this;
    if (fileType == '.xls' || fileType == '.xlsx' || fileType == '.xlsm') {
      type = that.globalData.serverImgUrl + 'icon-exe.png';
    } else if (fileType == '.word' || fileType == '.docx' || fileType == '.doc') {
      type = that.globalData.serverImgUrl + 'icon-word.png';
    } else if (fileType == '.pdf' || fileType == '.PDF') {
      type = that.globalData.serverImgUrl + 'icon-pdf.png';
    } else if (fileType == '.ppt' || fileType == '.pptx' || fileType == '.PPT') {
      type = that.globalData.serverImgUrl + 'icon-ppt.png';
    } else if (fileType == '.mp3'){
      type = that.globalData.serverImgUrl + 'icon-mp3.png';
    } else if (fileType == '.mp4'){
      type = that.globalData.serverImgUrl + 'icon-mp4.png';
    } else if (fileType == '.mov'){
      type = that.globalData.serverImgUrl + 'icon-mov.png';
    } else if (fileType == '.avi'  || fileType == '.mkv' || fileType == '.flv' || fileType == '.m4a' || fileType == '.wmv') {
      type = that.globalData.serverImgUrl + 'icon-music.png';
    } else if (fileType == '.txt') {
      type = that.globalData.serverImgUrl + 'icon-text.png';
    } else if (fileType == '.jpg' || fileType == '.png' || fileType == 'gif' || fileType == 'JPEG' || fileType == 'jpeg' || fileType == 'PSD' || fileType == 'psd') {
      type = that.globalData.serverImgUrl + 'icon-image.png';
    } else {
      type = that.globalData.serverImgUrl + 'icon-folder.png';
    }
    return type;
  },

  //格式化截止日期
  formatDeadline(date) {
    var m = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec");
    var time = date.split("-");
    var dd = time[2].replace(/\b(0+)/gi, "");
    var mm = time[1].replace(/\b(0+)/gi, "");
    var yy = time[0].replace(/\b(0+)/gi, "");
    var newData = m[mm - 1] + " " + dd + "," + yy;
    return newData
  },

  formatAm(date) {
    var newTime;
    if (date != null && date != undefined && date != '') {
      var time = date.split(" ");
      if (time[1] != undefined) {
        var timeArr = time[1].split(":");
        var hour = timeArr[0];
     
        if (hour > 12) {
          hour = hour - 12;
          newTime = hour + ":" + timeArr[1] + " PM";
        } else {
          newTime = timeArr[0] + ":" + timeArr[1] + " AM";
        }
        return newTime;
       
      } else {
        return  '0 AM';
      }
    } else {
      return '';
    }
  },

  
  formatDate(date) {
    var m = new Array("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC");
    var dates = date.split(" ");
    var time = dates[0].split("-");
    var dd = time[2];
    var mm = time[1];
    var yy = time[0];
    var newData = m[mm - 1] + " " + dd + ", " + yy;
    return newData;
  },
})