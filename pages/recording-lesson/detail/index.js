var app = getApp();
var myRequest = require("../../../api/myRequest.js");
var chinese = require("../../../utils/Chinese.js")
var english = require("../../../utils/English.js")
var aes = require("../../../utils/aes.js");

var cid;
var lessonId;
var timeNode;
var lessonList = [];
var playVideoIndex = 1000;
var currentProgress;
var cnt = 0;
var t;
var timer_is_on = 0;
var count = 0;
var durationQJ = 0;
var flag = 0;
Page({
  data: {
    seriesPage: {},
    language: 'english',
    menuTop: 0,
    isLoading: true,
    isLogin: false,
    courseInfo: {},
    sectionList: [],
    showVideo: false,
    isShowList: true,
    classCount: 0,
    activeName: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    status: '',
    statusName: '',
    videoSrc: '',
    videoTitle: '',
    lessionId: '',
    hasTimeNode: false,
    showNosubscribe: false,
    showTimeNode: 0,
    timeNode: 0,
    navHeight: 0,
    spotCurrent: 0,
    setInter: '', 
    randomHeight: 90,
    waterMarkText: '',
    isFullscreen: false,
    marqueePace: 1, 
    marqueeDistance: 0, 
    size: 10,
    orientation: 'left',
    interval: 20, 
    sectionList: [],
    //倍速
    showBeisuMask:false,
    rateArr: [1.0, 1.25, 1.5, 2.0],
    currentRate: 0,
    currentRateValue: 1,
    isRate: false,
    rateHeight:230
  },

  onLoad: function (options) {
    playVideoIndex = 1000;
    lessonList = [];
    cid = options.cid;
    let that = this;
    let userInfo = wx.getStorageSync('userInfo') || 0;
    let windowWidth = wx.getSystemInfoSync().windowWidth; 
    that.setData({
      status: options.status ? options.status : '',
      statusName: options.statusName ? options.statusName : '',
      userInfo: userInfo,
      windowWidth: windowWidth,
      marqueeDistance: windowWidth
    })
    that.initData(cid);
  },

  onShow() {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo') || 0;
    let languageApp = app.globalData.language;
    let seriesPage = languageApp == 'english' ? english.Content.seriesPage : chinese.Content.seriesPage;
    let waterMarkText = userInfo.userName + userInfo.userAcc;
    let length = waterMarkText.length * that.data.size; //文字长度

    let statusObj = {};
    switch (that.data.status) {
      case 'vip':
        statusObj.imgSrc = '编组 18@2x';
        statusObj.name = seriesPage.vipOnly;
        break;
      case 'bufen':
        statusObj.imgSrc = 'bfkst';
        statusObj.name = seriesPage.trialClassAvailable;
        break;
      case 'visitor':
        statusObj.imgSrc = 'ykkgk';
        statusObj.name = seriesPage.publicAccess;
        break;
      default:
        break;
    }
    that.setData({
      isLogin: true,
      seriesPage: seriesPage,
      waterMarkText: waterMarkText,
      length: length,
      language: languageApp,
      statusObj
    })
  },


  initData(cid) {
    var that = this;
    var language = app.globalData.language;
    myRequest.http_getData('/course/' + cid + '/detailForCrm', 'GET').then(data => {
      var courseInfo = data;
      var tags = courseInfo.tags;
      var tagArr = [];
      if (tags != null && tags != "") {
        tagArr = tags.split(';');
      }
      let courseDuration = app.formatSeconds(courseInfo.courseDuration, language);
      let classCount = 0;
      for (var i = 0; i < courseInfo.sectionList.length; i++) {
        let videoTimeCount = 0;
        for (var j = 0; j < courseInfo.sectionList[i].lessonList.length; j++) {
          videoTimeCount = videoTimeCount + courseInfo.sectionList[i].lessonList[j].videoDuration;
          lessonList.push(courseInfo.sectionList[i].lessonList[j]);
          classCount++;
          let videoDuration = courseInfo.sectionList[i].lessonList[j].videoDuration;
          courseInfo.sectionList[i].lessonList[j].videoDuration = app.formatSecond(videoDuration);
          if (courseInfo.sectionList[i].lessonList[j].finishPlay == 0) {
            if (courseInfo.sectionList[i].lessonList[j].timeNode) {
              courseInfo.sectionList[i].lessonList[j].timeNode = app.formatSecond(courseInfo.sectionList[i].lessonList[j].timeNode);
            }
          }
        }
        courseInfo.sectionList[i].videoTimeCount = app.formatSecond(videoTimeCount);
        courseInfo.sectionList[i].currentTimeCount = 100;
      }
      if (courseInfo.authorList) {
        var authorList = courseInfo.authorList;
        for (var i = 0; i < authorList.length; i++) {
          if (authorList[i].introduce) {
            var intro = authorList[i].introduce;
            var introArr = intro.split(/[\n,]/g);
            authorList[i].introArr = introArr;
          }
        }
        courseInfo.authorList = authorList;
      }
      courseInfo.tags = tagArr;
      courseInfo.courseDuration = courseDuration;
      that.setData({
        isLoading: false,
        courseInfo: courseInfo,
        sectionList: courseInfo.sectionList,
        classCount: classCount
      })
    })
  },

  nosubscribe() {
    this.setData({
      showNosubscribe: true
    })
  },

  run1: function (flag) {
    if(!flag){
      return false
    }
    var vm = this;
    vm.data.setInter = setInterval(function () {
      if (-vm.data.marqueeDistance < vm.data.length) {
        vm.setData({
          marqueeDistance: vm.data.marqueeDistance - vm.data.marqueePace,
        });
      } else {
        clearInterval(vm.data.setInter);
        if (vm.data.isFullscreen) {
          let windowWidth = wx.getSystemInfoSync().windowWidth;
          vm.setData({
            marqueeDistance: windowWidth
          });
        } else {
          vm.setData({
            marqueeDistance: vm.data.windowWidth
          });
        }
        setTimeout(() => {
          let value = app.random(90, 250);
          vm.setData({
            randomHeight: value
          })
          vm.run1(true);
        }, 10000);
      }
    }, vm.data.interval);
  },

  clickVideo(){
    this.setData({
      showBeisuMask:false
    })
  },

  playStart(e) {
    let that = this;
    flag = flag + 1;
    if (flag == 1) {
      return false;
    }
    that.setData({
      marqueeDistance: that.data.marqueeDistance
    })
    that.run1(true);
  },

  playPause() {
    let that = this;
    clearInterval(that.data.setInter);
  },

  onChange(event) {
    this.setData({
      activeName: event.detail
    })
  },

  onCloseModal() {
    this.setData({
      showModal: false
    })
  },

  onClose(e) {
    let sectionList = this.data.sectionList;
    for (var i = 0; i < sectionList.length; i++) {
      if (i == e.detail) {
        sectionList[i].currentTimeCount = e.detail
      }
    }
    this.setData({
      sectionList: sectionList
    })
  },

  onOpen(e) {
    let sectionList = this.data.sectionList;
    for (var i = 0; i < sectionList.length; i++) {
      if (i == e.detail) {
        sectionList[i].currentTimeCount = 100;
      }
    }
    this.setData({
      sectionList: sectionList
    })
  },

  hideVideo() {
    this.setData({
      showVideo: false
    })
  },

  //播放视频
  canplay(e, qxFlag) {
    var lid = '';
    var that = this;
    if (qxFlag != undefined) {
      lid = qxFlag;
    } else {
      lid = e.currentTarget.dataset.lid;
    }
    if (app.globalData.isLogin == 1) {
      that.goTop();
      for (var i = 0; i < lessonList.length; i++) {
        if (lessonList[i].lessonId == lid) {
          playVideoIndex = i;
        }
      }
      that.setData({
        showVideo: true,
        lessionId: lid
      }, function () {
        that.getVideoSrc();
      })

      setTimeout(function () { //十秒后关闭播放提示
        that.setData({
          hasTimeNode: false
        })
      }, 10000);
      that.run1(true);
    }
  },

   //回到顶部
   goTop: function (e) { 
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  },

  hideModal() {
    var that = this;
    that.setData({
      showModal: false,
      showNosubscribe: false
    })
  },

  //获取视频的url
  getVideoSrc() {
    var that = this;
    var id = that.data.lessionId;
    myRequest.http_getData('/course/lesson/playAuth?lessonId=' + id + '&utmSource=mp_wst_career', 'GET').then(data => {
      if (data.playUrl) {
        let videoSrc = data.playUrl[data.playUrl.length - 1].playURL;
        let videoTitle = data.videoTitle;
        that.setData({
          videoSrc: videoSrc,
          videoTitle: videoTitle,
          lessionId: id
        })
      }
      if (data.timeNode) { //有视频保存进度
        timeNode = data.timeNode;
        let time = app.formatSecond(timeNode);
        that.setData({
          hasTimeNode: true,
          showTimeNode: time
        })
      }
    })
  },

  //list的显示隐藏
  showList() {
    let that = this;
    let isShow = !(that.data.isShowList);
    let sectionList = that.data.sectionList;
    if (!isShow) {
      for (var i = 0; i < sectionList.length; i++) {
        sectionList[i].currentTimeCount = i;
      }
    } else {
      for (var i = 0; i < sectionList.length; i++) {
        sectionList[i].currentTimeCount = 100;
      }
    }
    that.setData({
      isShowList: isShow,
      sectionList: sectionList
    })
    if (!isShow) {
      that.setData({
        activeName: ''
      })
    } else {
      that.setData({
        activeName: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      })
    }
  },

  closePlayTip() {
    this.setData({
      hasTimeNode: false
    })
  },

  //跳转播放
  jumpPlay() {
    let videoContext = wx.createVideoContext('myVideo');
    videoContext.seek(timeNode);
    this.setData({
      timeNode: timeNode,
      videoSrc: this.data.videoSrc,
      videoTitle: this.data.videoTitle
    })
  },

  timeUpdate(e) {
    let that = this;
    let duration = e.detail.duration;
    let current = e.detail.currentTime;
    durationQJ = e.detail.duration;
    currentProgress = parseInt(current); //当前播放进度
    let cha = parseInt(duration) - parseInt(current);
    if (playVideoIndex + 1 <= lessonList.length - 1 && lessonList[playVideoIndex + 1].videoPublic && lessonList[playVideoIndex + 1].videoPublic != 0) {
      if (cha <= 10) {
        wx.showToast({
          title: '即将播放下一个视频',
          icon: 'none',
          duration: 2000
        })
      }
    }
    count++;
    that.startCount(count, currentProgress, duration);
  },

  //保存播放进度
  savePlayProgress(timeNode, finishPlay) {
    let timeNodes = timeNode.toFixed();
    let that = this;
    let userInfo = wx.getStorageSync('userInfo') || 0;
    let datas = {
      lessonId: that.data.lessionId,
      timeNode: timeNodes,
      finishPlay: finishPlay
    }
    let data = aes.encrypt(datas);
    wx.request({
      url: app.globalData.serverURL + '/course/play/log',
      header: {
        'Authorization': userInfo.token
      },
      method: 'POST',
      dataType: 'json',
      data: data,
      success: function (res) {
        if (res.data.code == 200) {
          if (res.data.data) {
            let res_data = aes.decrypt(res.data.data, res.data.key) || {};
          }
        }
      }
    })
  },

  playEnd(e) {
    let that = this;
    let sectionList = that.data.sectionList;
    that.savePlayProgress(durationQJ, 1);
    if (playVideoIndex + 1 <= lessonList.length - 1) {
      if (lessonList[playVideoIndex + 1].videoPublic != 0) {
        playVideoIndex++;
        for (let item in sectionList) {
          for (let i in sectionList[item].lessonList) {
            if (sectionList[item].lessonList[i].lessonId == that.data.lessionId) {
              sectionList[item].lessonList[i].finishPlay = 1;
            }
          }
        }
        that.setData({ sectionList  })

        if (playVideoIndex <= lessonList.length - 1) {
          if (lessonList.length > 1) {
            that.setData({
              lessionId: lessonList[playVideoIndex].lessonId
            })
            if (lessonList[playVideoIndex].videoPublic != 0) {
              //that.getVideoSrc();
              if (lessonList[playVideoIndex].lessonType == 'video') {
                that.getVideoSrc();
              } else if (lessonList[playVideoIndex].lessonType == 'document') {
                that.previewFile(lessonList[playVideoIndex].lessonId,lessonList[playVideoIndex].videoTitle);
              }
            } else {
              let videoContext = wx.createVideoContext('myVideo');
              videoContext.pause();
            }
          }
        } else {
          let videoContext = wx.createVideoContext('myVideo');
          videoContext.pause();
          wx.showToast({
            title: "该课程已全部播放完毕",
            icon: 'none'
          })
        }
      } else {
        let videoContext = wx.createVideoContext('myVideo');
        videoContext.pause();
        clearInterval(that.data.setInter);
        clearInterval(that.data.interval);
      }
    } else {
      let videoContext = wx.createVideoContext('myVideo');
      videoContext.pause();
      clearInterval(that.data.setInter);
      clearInterval(that.data.interval);
    }
  },

  //计数器
  timedCount(currentProgress, duration) {
    let that = this;
    if (currentProgress != undefined) {
      cnt = cnt + 1;
      t = setTimeout(function () {
        let durations = parseInt(duration);
        let currentProgresss = parseInt(currentProgress);
        if (currentProgresss < durations) {
          that.savePlayProgress(currentProgress, "");
        }
        that.timedCount();
      }, 1000)
    }
  },

  startCount(count, currentProgress, duration) {
    if (count % 4 == 0) {
      if (currentProgress != undefined) {
        this.timedCount(currentProgress, duration);
      }
    }
  },

  stopCount() {
    timer_is_on = 0;
  },

  fullscreen(e) {
    let that = this;
    let windowWidth = wx.getSystemInfoSync().windowWidth;
    let windowHeight = wx.getSystemInfoSync().windowHeight;
    if (e.detail.direction == "vertical") {
      that.setData({
        marqueeDistance: windowWidth,
        isFullscreen: false,
        rateHeight:230
      })
    } else {
      that.setData({
        marqueeDistance: windowWidth,
        isFullscreen: true,
        rateHeight:windowHeight
      })
    }
  },

  subscribe() { 
    var that = this;
    that.setData({
      showModal: true
    })
  },

  subscribeBind() {
    wx.showToast({
      title: '该课程已订阅',
      icon: 'none'
    })
  },

  //订阅
  dingyue() {
    var that = this;
    let userInfo = wx.getStorageSync('userInfo');
    let courseId = courseId;
    let datas = {
      lessonId: lessonId,
      courseId: cid
    }
    let data = aes.encrypt(datas);

    wx.request({
      url: app.globalData.serverURL + '/course/subscribeForCrm',
      method: 'POST',
      dataType: 'json',
      header: {
        'appId': 'mp_wst_career',
        'appVersion': app.globalData.version,
        'Authorization': userInfo.token
      },
      data: data,
      success: function (res) {
        if (res.data.code == 200) {
          wx.showToast({
            title: '订阅成功',
            icon: 'success',
            duration: 1000,
            success: function () {
              setTimeout(function () {
                that.setData({
                  showModal: false
                })
                that.initData(cid);
                that.canplay('', lessonId);
              }, 1000);
            }
          })
        } else {
          if (res.data.message) {
            that.setData({
              showModal: false
            }, function () {
              wx.showModal({
                content: res.data.message,
                confirmText: '确定'
              })
            })
          } else {
            that.setData({
              showModal: false
            }, function () {
              wx.showToast({
                title: '订阅失败',
                icon: 'none'
              })
            })
          }
        }
      },
      fail: function () {},
    })
  },

  quanxian(e) {
    lessonId = e.currentTarget.dataset.lid;
    this.setData({
      showModal: true
    })
  },

  openFile(e){
    let id = e.currentTarget.dataset.id
    let pageTitle = e.currentTarget.dataset.title
    this.previewFile(id,pageTitle);
  },

  //文档预览
  previewFile(id,pageTitle) {
    let videoContext = wx.createVideoContext('myVideo');
    videoContext.stop();
    wx.navigateTo({
      url: '/pages/recording-lesson/file-preview/index?id=' + id + '&pageTitle=' + pageTitle
    })
  },
  
  onChangeRate({
    detail
  }) {
    let videoContext = wx.createVideoContext('myVideo');
    if (detail) {
      this.setData({
        showBeisuMask: true
      })
      videoContext.pause()
    } else {
      this.setData({
        showBeisuMask: false,
        currentRate: 0,
        currentRateValue: this.data.rateArr[0],
      })
      videoContext.playbackRate(1);
      videoContext.play();
    }
    this.setData({
      isRate: detail
    })
  },

  closeBeisuMask() {
    let videoContext = wx.createVideoContext('myVideo');
    this.setData({
      showBeisuMask: false
    })
    videoContext.play();
  },

  beisu() {
    this.setData({
      showBeisuMask: true
    })
    let videoContext = wx.createVideoContext('myVideo');
    videoContext.pause()
  },

  // 选择倍速播放
  chooseRatePlay(e) {
    let rate = e.currentTarget.dataset.rate;
    let index = e.currentTarget.dataset.index;
    let videoContext = wx.createVideoContext('myVideo');
    if (index == 0) {
      this.setData({ isRate: false })
    } else {
      this.setData({ isRate: true })
    }
    this.setData({
      currentRateValue: this.data.rateArr[index],
      currentRate: index,
      showBeisuMask: false
    })
    videoContext.playbackRate(rate);
    videoContext.play();
  },


  onShareAppMessage: function (event) {
    let that = this;
    let courseInfo = that.data.courseInfo;
    return {
      title: courseInfo.courseTitle,
      imageUrl: courseInfo.coverUrl,
      path: '/pages/recordin-lesson/detail/index?cid=' + courseInfo.courseId
    }
  },


  onUnload: function () {
    let that = this;
    clearInterval(that.data.setInter);
    clearInterval(that.data.interval);
  }
})