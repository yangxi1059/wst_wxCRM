var Chinese = {

    tabbar: ["首页", "主题系列", "我的"],

    //首页-页面
    indexPage: {
        news: '职场故事',
        more: '查看更多',
        chapter: '章节',
        class: '课',
        length: '长度',
        series: '主题系列',
        vipOnly: 'VIP权限',
        publicAccess: '游客可观看',
        trialClassAvailable: '部分可试听',
    },

    //视频课程-页面
    seriesPage: {
        pageName: '主题系列',
        search: '搜索内容',
        selectCurrent: {
            id: 0,
            name: '全部'
        },
        selectMenu: [{
                id: 1,
                name: "基石技能"
            },
            {
                id: 2,
                name: "编程技能"
            },
            {
                id: 3,
                name: "金融"
            },
            {
                id: 4,
                name: "咨询技能"
            },
            {
                id: 5,
                name: "公司资讯"
            }
        ],
        vipOnly: 'VIP权限',
        publicAccess: '游客可观看',
        trialClassAvailable: '部分可试听',
        level: '难度',
        chapter: '章节',
        class: '课',
        length: '长度',
        subscribe: '订阅',
        subscribed: '已订阅',
        courseIntroduction: '课程介绍',
        mentor: '导师背景',
        list: '课程内容',
        requiresSpendTime: '需花费',
        stoppedAt: '观看至 ',
        viewed: '已看完',
        noStart: '未观看',
        start: '去完成',
        completed: '已完成',
        noData: '暂无内容~'
    },

    //搜索-页面
    searchPage: {
        search: '搜索内容',
        popularTopics: '热门话题'
    },

    //直播课程-页面
    streamingPage: {
        pageName: '实时',
        current: '当前周期',
        past: '往期',
        next: '下一周期',
        viewAll: '查看全部',
        webinars: '线上分享课',
        nodata: '暂无内容~',
        noStart: '未开始',
        ended: '已结束',
        more: '查看更多',
    },

    //直播课程详情-页面
    streamingDetailPage: {
        pageName: '实时',
        noStart: '未开始',
        ended: '已结束',
        introduction: '介绍',
        questions: '全部提问',
        subscribe: '订阅',
        subscribed: '已订阅',
        mentor: '直播导师',
        type: '直播类型',
        tags: '直播标签',
        diffcultyLevel: '直播难度',
        viewQuestions: '订阅后才可查看哦~',
        requiresSpendTime: '需花费',
        start: '去完成',
        completed: '已完成',
        getCertificateText: '恭喜你，你已经完成证书项目内的所有课程，特此颁发此证书',
        noQuestions: '暂时还没有人提问哦',
        askQuestion: '提问',
        inputPlaceHolderText: '请输入你想向导师提出的问题（200字以内）',
        cancel: '取消',
        send: '发送',
        subscribeText: '订阅此直播需花费您 1 课时',
        loginText: '请登录WST账号或咨询导师',
    },

    //网申提醒-页面
    applicationReminderPage: {
        pageTitle: '网申提醒',
        tabList: ["招聘中", "已过期"],
        pageTip: '公司申请状态变化频繁，请同学们参考官网页面为准',
        publish: '发布日期',
        deadline: '截止日期',
        sortName: '排序',
        sortList: ['默认排序', '截止日期'],
        noData: '当前暂无相匹配的网申～',
        nolimit: '请登录VIP账户查看'
    },

    //内推申请-页面
    referralsPage: {
        pageTitle: '内推申请',
        tabList: ["招聘中", "已过期"],
        sortName: '排序',
        sortList: ['默认排序', '截止日期'],
        publish: '发布日期',
        deadline: '截止日期',
        delivered: '已投递',
        closed: '已截止',
        noData: '当前暂无内推申请～',
        noDataOut: '当前暂无过期内推申请～',
        nolimit: '请登录VIP账户查看'
    },

    //内推详情-页面
    referralsDetailPage: {
        pageName: '内推详情',
        jobRequirements: '岗位要求',
        jobDescriptions: '岗位信息',
        toudiTitle: '简历投递',
        toudiJianLi: '投递简历',
        availableDuration: '可入职时间',
        availablePeriod: '可工作时长',
        currentlyResidein: '当前所在城市',
        graduationYear: '毕业年份',
        isYes: '可完全根据公司安排调整工作时长',
        selectResume: '可选简历',
        submit: '投递简历',
        send: '确认投递',
        preview: '预览'
    },

    //线下课-页面
    onsiteSeminarPage: {
        pageTitle: '面试训练营',
        allSeminars: '所有活动',
        signedUpSeminars: '我的报名',
        applicationInProgress: '报名进行中',
        applicationClosed: '报名已结束',
        live: '直播中',
        replay: '查看回放',
        noData: '当前暂无相匹配的信息',
        nolimit: '请登录VIP账户查看'
    },

    //面经
    interviewDatabasePage: {
        pageName: '面试题库',
        search: '搜索内容',
        recruitingSeason: '申请季',
        jobFunction: '工作职能',
        difficulty: '面试难度',
        location: '地区',
        university: '学校',
        interviewDate: '面试日期',
        nolimit: '请登录VIP账户查看'
    }
}

module.exports = {
    Content: Chinese
}