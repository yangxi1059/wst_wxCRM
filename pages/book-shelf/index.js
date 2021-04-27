var app = getApp()
var myRequest = require("../../api/myRequest.js");
var currentShelfId = '';
var shelfId = '';
Page({
  data: {
    isPlaying: false,
    currentShelfName: 'Digital Academy',
    bookShelfFlag: false,
    isLoading: true,
    showShelf: false,
    showMenu: false,
    showOrderBy: false,
    folderList: [],
    bookList: [],
    parentMenu: [],
    emptyImageUrl: app.globalData.serverImgUrl + 'icon-empty.png',
    getPreviewUrlInfo: {}
  },

  onLoad: function (options) {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          phoneModel: res.platform
        })
      }
    })

    if (options.shelfId) {
      shelfId = options.shelfId;
    }
  },

  onShow() {
    if (shelfId == '' && currentShelfId == '') {
      this.initShelf();
      return false;
    }
    if (shelfId != '') {
      this.selectShelf(shelfId);
      return false;
    }

    if (currentShelfId != '') {
      this.selectShelf(currentShelfId);
    }
  },

  //回退
  navBack: function (e) {
    let dataArr = this.data.shelfPathArr;
    if (dataArr[dataArr.length - 1].shelfId == 'root') {
      currentShelfId = '';
      shelfId = '';
      wx.navigateBack({
        delta: 1,
        success: function (res) {},
        fail: function (e) {
          wx.reLaunch({
            url: '/pages/mine/index'
          })
        }
      })
    } else {
      let shelfId = dataArr[dataArr.length - 2].shelfId;
      this.selectShelf(shelfId);
    }
  },

  //回主页
  toIndex: function () {
    currentShelfId = '';
    shelfId = '';
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  searchFile() {
    wx.navigateTo({
      url: '/pages/book-shelf/search/index'
    })
  },

  clickMenu(e) {
    // let that = this;
    // let fileName = e.currentTarget.dataset.name;
    // let fileCover = e.currentTarget.dataset.cover;
    // let shelfId = e.currentTarget.dataset.sid;
    // let fileObj = {
    //   fileName: fileName,
    //   fileCover: fileCover,
    //   shelfId: shelfId
    // }
    // that.setData({
    //   showMenu: true,
    //   fileObj: fileObj
    // })
  },

  closeMenu() {
    this.setData({
      showMenu: false
    })
  },

  showOrderBy() {
    this.setData({
      showOrderBy: true
    })
  },

  closeOrderBy() {
    this.setData({
      showOrderBy: false
    })
  },

  clickSubMenu(e) {
    let that = this;
    let sid = e.currentTarget.dataset.sub;
    currentShelfId = sid;
    that.selectShelf(sid);
  },

  hideVideoBox() {
    this.setData({
      showVideoBox: false,
      showAudioBox: false
    })
  },

  //预览文件
  showDetail(e) {
    var that = this;
    var bookList = that.data.bookList;
    var phoneModel = that.data.phoneModel;
    var bookId = e.currentTarget.dataset.bid;
    var bookObj = '';
    for (let item in bookList) {
      if (bookList[item].bookId == bookId) {
        bookObj = bookList[item];
      }
    }

    var type = bookObj.fileType;
    type = type.replace(".", "");
    myRequest.http_getData('/book/' + bookId + '/preview', 'GET').then(res => {
      var preview = res;
      if (type == 'ppt' || type == 'pptx' || type == 'pptm' || type == 'ppsx' ||
        type == 'ppsm' || type == 'pps' || type == 'potx' || type == 'potm' || type == 'dpt' || type == 'dps' ||
        type == 'et' || type == 'xls' || type == 'xlt' || type == 'xlsx' || type == 'xlsm' || type == 'xltx' ||
        type == 'xltm' || type == 'csv' || type == 'doc' || type == 'docx' || type == 'txt' || type == 'dot' ||
        type == 'wps' || type == 'wpt' || type == 'dotx' || type == 'docm' || type == 'dotm' || type == 'pdf') {
        if (bookObj.fileSize >= 209715200) {
          wx.showToast({
            title: '该文件过大不支持预览',
            icon: 'none'
          })
        } else {
          if (preview.previewUrl) {
            wx.setStorageSync('previewurl', preview.previewUrl);
          } else if (preview.fileUrl) {
            wx.setStorageSync('previewurl', preview.fileUrl);
          }
          wx.navigateTo({
            url: '/pages/preview-file/index?showWaterMark=true',
          })
        }
      } else if (type == 'mp4' || type == 'mov' || type == 'm4v' || type == '3gp' || type == 'avi' || type == 'm3u8' || type == 'webm' || type == 'mp3') {
        //devtools支持的类型
        if (phoneModel == 'devtools') {
          wx.setStorageSync('bookInfo', bookObj);
          wx.navigateTo({
            url: '/pages/book-shelf/play-video/index'
          })
          return false;
        }

        //android支持的类型
        if (phoneModel == 'android') {
          if (type == 'mp3' || type == 'mp4' || type == '3gp' || type == 'm3u8' || type == 'webm') {
            wx.setStorageSync('bookInfo', bookObj);
            wx.navigateTo({
              url: '/pages/book-shelf/play-video/index'
            })
          } else {
            wx.showToast({
              title: '该设备暂不支持预览此类型的文件',
              icon: 'none',
              duration: 4000
            })
          }
          return false;
        }

        //ios支持的类型
        if (phoneModel == 'ios') {
          if (type == 'mp3' || type == 'mp4' || type == 'mov' || type == 'm4v' || type == '3gp' || type == 'avi' || type == 'm3u8') {
            wx.setStorageSync('bookInfo', bookObj);
            wx.navigateTo({
              url: '/pages/book-shelf/play-video/index'
            })
          } else {
            wx.showToast({
              title: '该设备暂不支持预览此类型的文件',
              icon: 'none',
              duration: 4000
            })
          }
          return false;
        }
      } else {
        wx.showToast({
          title: '该文件暂不支持预览',
          icon: 'none'
        })
      }
    })
  },


  initShelf() {
    let that = this;
    myRequest.http_getData('/book/shelf/detail', 'GET').then(res => {
      if (res.shelfPathArr) {
        let menuArr = res.shelfPathArr.reverse()
        let data = res.subShelfArr;
        let bookList = res.subBookArr;
        data.forEach(element => {
          element.fileCover = app.globalData.serverImgUrl + 'icon-folder.png';
        });

        bookList.forEach(element => {
          element.fileSizeNew = app.change(element.fileSize);
          element.fileCover = app.getFileType(element.fileType);
        })
        that.setData({
          shelfPathArr: menuArr,
          folderList: res.subShelfArr,
          bookList: bookList,
          isLoading: false
        })
      }
    })
  },

  selectShelf(sid) {
    let that = this;
    myRequest.http_getData('/book/shelf/detail', 'GET', {
      shelfId: sid
    }).then(res => {
      if (res.shelfPathArr) {
        let menuArr = res.shelfPathArr.reverse()
        let bookList = res.subBookArr ? res.subBookArr : []
        let subShelfArr = res.subShelfArr;
        subShelfArr.forEach(element => {
          element.fileCover = app.globalData.serverImgUrl + 'icon-folder.png';
        });
        that.setData({
          currentShelfName: res.shelfName,
          shelfPathArr: menuArr,
          folderList: subShelfArr,
          bookList: bookList,
          isLoading: false
        })
      }
      if (res.subBookArr.length > 0) {
        let data = res.subBookArr;
        data.forEach(element => {
          element.fileCover = app.getFileType(element.fileType);
          element.fileSizeNew = app.change(element.fileSize);
        });
        that.setData({
          currentShelfName: res.shelfName,
          bookList: data
        })
      }
    })
  },

  // onShareAppMessage: function (event) {
  //   let fileObj = this.data.fileObj;
  //   this.setData({ showMenu: false })
  //   if (event.from === 'button') {
  //     return {
  //       title: fileObj.fileName,
  //       path: '/pages/book-shelf/index?shelfId=' + fileObj.shelfId
  //     }
  //   } else {
  //     return {
  //       title: 'WST Academy',
  //       path: '/pages/book-shelf/index?shelfId=' + currentShelfId
  //     }
  //   }
  // }
})