var util = require('../../utils/util.js')

Component({

  properties: {
    isCheck:{
      type:Boolean,
      observer: function (val) {
       if(!val){
         this.setData({
          nowDate:''
         })
       }
      }
    },
    newDay: {
      type: Array,
      value: '',
      observer: function (newVal, oldVal, changedPath) {
        this.getAllArr();
        this.dataData()
        this.cheched()
      }
    },
    currentYear: { // 当前显示的年
      type: Number,
      value: new Date().getFullYear()
    },
    currentMonth: { //当前显示的月
      type: Number,
      value: new Date().getMonth() + 1
    },
    nowYear: { //当前显示的月
      type: Number,
      value: new Date().getFullYear()
    },
    nowMonth: { //当前显示的月
      type: Number,
      value: new Date().getMonth() + 1
    },
    nowDate: { //当前显示的日
      type: Number,
      value: ''
    }
  },

  data: {
    currentMonthDateLen: 0, // 当月天数
    preMonthDateLen: 0, // 当月中，上月多余天数
    allArr: [], // 
    nowData: ""
  },
  ready() {
    // this.getAllArr()
  },

  onLoad: function () {
    var time = util.formatTime(new Date());
    this.setData({
      nowData: time
    });
  },


  methods: {

    // 获取时间
    dataData: function () {
      let time = new Date();
      let year = time.getFullYear();
      let mouth = time.getMonth() + 1
      this.updateDays(year, mouth)
    },

    cheched: function () {
      let allArr = this.data.allArr;
      let newDay = this.data.newDay;
      let year = this.data.nowYear;
      let month = this.data.nowMonth;

      for (var i = 1; i < allArr.length; i++) {
        let a = year + '-' + month + '-' + allArr[i]['date']
        allArr[i]['checked'] = this.inArray(newDay, a)
      }
      this.setData({
        allArr
      })
    },

    inArray: function (arr = [], val = '') {
      for (let k in arr) {
        if (val == arr[k]) {
          return true;
        }
      }
      return false;
    },

    updateDays: function (year, mouth) {
      let days = [];
      let dateDay = '';
      let dateWeek = '';

      // 根据日期获取每个月有多少天    例如：new Date(2019, 7, 0).getDate();   最后一个参数默认为日，当写为0时，代表获取上个月的最后一天，所以月份不用减一
      var getDateDay = function (year, mouth) {
        return new Date(year, mouth, 0).getDate();
      }

      //根据日期 获取当月的1号是周几
      var getDateWeek = function (year, mouth) {
        return new Date(year, mouth - 1, 1).getDay();
      }

      dateDay = getDateDay(year, mouth)
      dateWeek = getDateWeek(year, mouth)

      //向数组中添加天
      for (let index = 1; index <= dateDay; index++) {
        let a = {
          checked: false,
          index: index
        };
        days.push(a)
      }
      //向数组中添加一号之前应该空出的空格
      for (let index = 1; index <= dateWeek; index++) {
        let a = {
          checked: false,
          index: 0
        };
        days.unshift(a)
      }


      this.setData({
        days: days,
        year: year,
        mouth: mouth,
      })
    },

    // 获取某年某月总共多少天
    getDateLen(year, month) {
      let actualMonth = month - 1;
      let timeDistance = +new Date(year, month) - +new Date(year, actualMonth);
      return timeDistance / (1000 * 60 * 60 * 24);
    },

    // 获取某月1号是周几
    getFirstDateWeek(year, month) {
      return new Date(year, month - 1, 1).getDay()
    },

    // 上月 年、月
    preMonth(year, month) {
      if (month == 1) {
        return {
          year: --year,
          month: 12
        }
      } else {
        return {
          year: year,
          month: --month
        }
      }
    },

    // 下月 年、月
    nextMonth(year, month) {
      if (month == 12) {
        return {
          year: ++year,
          month: 1
        }
      } else {
        return {
          year: year,
          month: ++month
        }
      }
    },
    // 获取当月数据，返回数组
    getCurrentArr() {
      let currentMonthDateLen = this.getDateLen(this.data.currentYear, this.data.currentMonth) // 获取当月天数
      let currentMonthDateArr = [] // 定义空数组
      if (currentMonthDateLen > 0) {
        for (let i = 1; i <= currentMonthDateLen; i++) {
          // if (i >= 0 && i <= 9) {
          //   i = "0" + i;
          // }
          currentMonthDateArr.push({
            month: 'current', // 只是为了增加标识，区分上下月
            date: i
          })
        }
      }
      this.setData({
        currentMonthDateLen
      })
      return currentMonthDateArr
    },
    // 获取当月中，上月多余数据，返回数组
    getPreArr() {
      let preMonthDateLen = this.getFirstDateWeek(this.data.currentYear, this.data.currentMonth) // 当月1号是周几 == 上月残余天数）
      let preMonthDateArr = [] // 定义空数组
      if (preMonthDateLen > 0) {
        let {
          year,
          month
        } = this.preMonth(this.data.currentYear, this.data.currentMonth) // 获取上月 年、月
        let date = this.getDateLen(year, month) // 获取上月天数
        for (let i = 0; i < preMonthDateLen; i++) {
          preMonthDateArr.unshift({ // 尾部追加
            month: 'pre', // 只是为了增加标识，区分当、下月
            date: date
          })
          date--
        }
      }
      this.setData({
        preMonthDateLen
      })
      return preMonthDateArr
    },
    // 获取当月中，下月多余数据，返回数组
    getNextArr() {
      let nextMonthDateLen = 35 - this.data.preMonthDateLen - this.data.currentMonthDateLen // 下月多余天数
      let nextMonthDateArr = [] // 定义空数组
      if (nextMonthDateLen > 0) {
        for (let i = 1; i <= nextMonthDateLen; i++) {
          nextMonthDateArr.push({
            month: 'next', // 只是为了增加标识，区分当、上月
            date: i
          })
        }
      }
      return nextMonthDateArr
    },
    // 整合当月所有数据
    getAllArr() {
      let preArr = this.getPreArr()
      let currentArr = this.getCurrentArr()
      let nextArr = this.getNextArr()
      let allArr = [...preArr, ...currentArr, ...nextArr]

      let newDay = this.data.newDay;
      let year = this.data.nowYear;
      let month = this.data.nowMonth;

      for (var i = 1; i < allArr.length; i++) {
        let a = year + '-' + month + '-' + allArr[i]['date']
        allArr[i]['checked'] = this.inArray(newDay, a)
      }

      this.setData({ allArr })


      let currentMonth = this.data.currentMonth;
      if (currentMonth >= 0 && currentMonth <= 9) {
        currentMonth = "0" +currentMonth;
      }
   
      let sendObj = {
        currentYear: this.data.currentYear,
        currentMonth: currentMonth,
        nowYear: this.data.nowYear,
        nowMonth: this.data.nowMonth,
        nowDate: this.data.nowDate,
        allArr: allArr
      }

      this.triggerEvent('sendObj', sendObj)
    },
    // 点击 上月
    gotoPreMonth() {
      let {
        year,
        month
      } = this.preMonth(this.data.currentYear, this.data.currentMonth)

      // if (month >= 1 && month <= 9) {
      //   month = "0" + month;
      // }
   
      this.setData({
        currentYear: year,
        currentMonth: month
      })
      this.getAllArr()
    },
    // 点击 下月
    gotoNextMonth() {
      let {
        year,
        month
      } = this.nextMonth(this.data.currentYear, this.data.currentMonth)
     
      // if (month >= 1 && month <= 9) {
      //   month = "0" + month;
      // }
     
      this.setData({
        currentYear: year,
        currentMonth: month
      })
      this.getAllArr()
    },

    getNowData(e) {
      var data = e.currentTarget.dataset.day;
      var currency = e.currentTarget.dataset.currency;
      if (currency == 1) {
        this.setData({
          nowYear: this.data.currentYear,
          nowMonth: this.data.currentMonth,
          nowDate: data
        })
      }
      this.getAllArr()
    }
  }
})