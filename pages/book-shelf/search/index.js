var app = getApp()
var myRequest = require("../../../api/myRequest.js");

Page({
  data: {
    value: '',
    bookList: [],
    emptyImageUrl: app.globalData.serverImgUrl + 'icon-empty.png',
    searchFlag: false
  },

  onLoad: function () {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          phoneModel: res.platform
        })
      }
    })
  },

  onShow() {},

  showDetail(e) {
    let that = this;
    let bookList = that.data.bookList;
    let booId = e.currentTarget.dataset.bid;
    let phoneModel = that.data.phoneModel;
    let bookObj = '';
    for (let item in bookList) {
      if (bookList[item].bookId == booId) {
        bookObj = bookList[item];
      }
    }

    let type = bookObj.fileType;
    type = type.replace(".", "");

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
        wx.setStorageSync('previewurl', bookObj.previewUrl);
        wx.navigateTo({
          url: '/pages/resume/preview/index?showWaterMark=true'
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
  },

  showMore(e) {
    let dataList = this.data.bookList;
    let index = e.currentTarget.dataset.fid;
    for (let i = 0; i < dataList.length; i++) {
      if (index == i) {
        dataList[i].showMoreFlag = !(dataList[i].showMoreFlag);
      }
    }
    this.setData({
      bookList: dataList
    })
  },

  onChange(e) {
    this.setData({
      value: e.detail
    });
  },

  searchFile(e) {
    this.selectFile(e.detail);
  },

  clickCancel() {
    wx.navigateBack({
      delta: 1
    })
  },

  toShelf(e) {
    let shelfId = e.currentTarget.dataset.sid;
    wx.redirectTo({
      url: '/pages/book-shelf/index?shelfId=' + shelfId
    })
  },

  selectFile(searchValue) {
    let that = this;
    myRequest.http_getData('/book/search', 'POST', {
      search: searchValue
    }).then(res => {
      if (res.length > 0) {
        if (res.length > 40) {
          wx.showModal({
            content: '搜索结果过多，建议在官网上查看~',
            confirmText: '确定',
            success(res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
          return false;
        }
        res.forEach(element => {
          element.showMoreFlag = false;
          element.bookNameLight = that.heightLight(element.bookName,searchValue);
          element.fileSizeNew = app.change(element.fileSize);
          element.fileCover = app.getFileType(element.fileType);
          let shelfPathArr = element.shelfPathArr;
          for (let i = 0; i < shelfPathArr.length; i++) {
            let filePathArr = shelfPathArr[i];
            var filePathList = [];
            let pathArr = [];
            for (let i = 0; i < filePathArr.length; i++) {
              let shelfObj = {};
              shelfObj = {
                shelfId: filePathArr[i].shelfId,
                shelfName: filePathArr[i].shelfName
              }
              pathArr.push(shelfObj)
            }
            pathArr = pathArr.reverse();
            filePathList.push(pathArr)
          }
          element.filePathList = filePathList;
        })
        that.setData({
          bookList: res,
          searchFlag: true
        })
      } else {
        that.setData({
          bookList: [],
          searchFlag: true
        })
      }
    })
  },

  //不区分大小写匹配并代码高亮，且不改变原来文本大小写格式
  heightLight(string, keyword) {
    var reg = new RegExp(keyword, "gi");
    string = string.replace(reg, function (txt) {
      return "<span style='display: inline-block;background-color: rgba(255,215,0,0.6);text-indent: 0px !important;'>" + txt + "</span>";
    })
    return string;
  }
})