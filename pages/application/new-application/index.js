Page({

  data: {

  },

  onLoad(){
    let menuList = [
      {
        icon:'/images/qingjia.png',
        text: '请假',
        url: 'vacate'
      },
      {
        icon:'/images/baoxiao.png',
        text: '报销',
        url: 'reimbursement'
      },
      {
        icon:'/images/jiaban.png',
        text: '加班',
        url: 'overtime'
      },
      {
        icon:'/images/caigou.png',
        text: '采购',
        url: 'purchase'
      },
      {
        icon:'/images/jiangjin.png',
        text: '推荐奖金',
        url: 'bonus'
      }
    ]

    let renshi = [
      {
        text:'外出',
        icon:'/images/thorui.png'
      },
      {
        text:'入职',
        icon:'/images/thorui.png'
      },
      {
        text:'离职',
        icon:'/images/thorui.png'
      },
      {
        text:'绩效',
        icon:'/images/thorui.png'
      },
      {
        text:'转正',
        icon:'/images/thorui.png'
      },
      {
        text:'招聘需求',
        icon:'/images/thorui.png'
      }
    ]
    this.setData({ menuList,renshi})
  },
 

  switchPage(){
    wx.showToast({
      title: '此功能暂未开放',
      icon: 'none'
    })
  }
})