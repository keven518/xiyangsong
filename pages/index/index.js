//index.js
//获取应用实例
const app = getApp()
let data = []
let index = 0

Page({
  data: {
    newList: [{id: 0, name:'推荐'}],
    articles: null,
    location: {},
    artId: 0,
    showMd:false,
    count:0,
    page: 1,
    weatherDate: {}
  },
  scl(res) {
    res.data.data.map((data) => {
      data.click = data.click * 10 + Math.floor(Math.random() * 10)
    })
    console.log('scl-res: ', res);
    return res;
  },
  onArticleClicked(e) {
    // 点击文章列表，跳转详情页面
    let aid = e.currentTarget.dataset.aid;
    console.log('aid: ', aid)
    // return

    wx.navigateTo({
      url: '/pages/articledetail/detail?art_id=' + aid + '&cid=' +  this.data.artId,
    })
  },
  onSectionClicked(e) {
    // 点击文章类别
    let id = e.currentTarget.dataset.id;

    index =  e.currentTarget.dataset.index;
    this.setData({
      artId: id,
      articles: [],
      page: 1
    })
    if (id == 0){
      this.tuijian()
    } else {

      this.loadArticles()
    }
    
  },
  //事件处理函数
  bindViewTap: function () {

  },
  tuijian(){
    wx.request({
      url: 'https://lizmedia.cn/xyhcms/index.php?s=/kv/getinfos/openid/' + wx.getStorageSync('openid'),
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: (res)=>{
        console.log('tj-res: ', res)
        
        this.scl(res);
        // res.data.data.map((data) => {
        //   data.click = data.click * 10 + Math.floor(Math.random() * 10)
        // })
        console.log('tj-res3: ', res)
        this.setData({
          articles: res.data.data
        })
      }
    })
  },
  onLoad: function () {
    wx.getLocation({
      type: 'gcj02', // 返回坐标的格式
      success: res => {
        // 此处只能获取到当前位置的经纬度（坐标）
        console.log('zb-res: ', res);
        that.setData({
          location: res
        })
        wx.request({
          url: 'https://free-api.heweather.net/s6/weather/now',
          header: {
            'Content-Type': 'application/json'
          },
          data: {
            location: `${res.latitude},${res.longitude}`,
            lang: 'zh',
            unit: 'm',
            key: '3d4e825b909a479ba0e176db28937466'
          },
          success: wRes => {
            console.log('wRes: ', wRes.data.HeWeather6[0])
            that.setData({
              weatherDate: wRes.data.HeWeather6[0]
            })
          }
        })
      },
    })
    wx.showShareMenu();  // 新增分享功能
    var that= this;
    this.tuijian();
    that.checkUser();
    // wx.request({
    //   url: 'https://lizmedia.cn/xyhcms/index.php?s=/kv',
    //   data: {},
    //   method: 'GET',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   success: function (res) {
    //     that.setData({
    //       articles: res.data.data
    //     })
    //   }
    // })

    wx.request({
      url: 'https://lizmedia.cn/xyhcms/index.php?s=/kv/getNewsCategory',
      data: {},
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log('res: ', res)
        that.setData({
          newList: that.data.newList.concat(res.data.data),
        })
      //  that.loadArticles(res.data.data[0].id)
      }
    })
    interval = setInterval(() =>{
      let openid = wx.getStorageSync('openid')
      if(openid){
        wx.request({
          url: 'https://lizmedia.cn/xyhcms/index.php?s=/kv/getinfos/openid/' +openid,
          method: 'GET',
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            that.setData({
              articles: res.data.data
            })
          }
        })
        clearInterval(interval)
      }
          
          
       
     
    },100)
   
  },
  loadArticles() {
    
    var that = this;
    wx.request({
      url: 'https://lizmedia.cn/xyhcms/index.php?s=/kv/getClassNews/cid/' + this.data.artId + '/p/1',
      data: {},
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          articles: res.data.data,
          count: res.data.count
        })
      }
    })
  },
  getUserInfo: function (e) {

  },
  checkUser: function () {
    var that = this;

    wx.getSetting({
      success: function (setting) {

        if (setting.authSetting["scope.userInfo"]) {

          that.setData({
            showMd: false,
          })
          wx.getUserInfo({
            success: function (suc) {
              getApp().globalData.userInfo = suc.userInfo;
            }
          })
        } else {
          that.setData({
            showMd: true,
          })

        }
      }
    })

  },
  check: function (e) {
    var that = this;
   
    var sta = e.detail.userInfo || 0;
    if (sta == 0) {
      wx.showModal({
        title: '提示',
        content: '授权失败！',
      })
    } else {
      this.setData({
        showMd: false,
      })
      wx.getUserInfo({
        success: function (suc) {
          wx.setStorageSync("username", suc.userInfo.nickName);
          getApp().globalData.userInfo = suc.userInfo;
          getApp().getUserInfo();
        }
      })

    }

  },
  close: function () {
    this.setData({
      showMd: false,
    })
  },
  onPullDownRefresh() {

  },
  scroll(e){
    console.log('e: ', e)
    var pg = ++this.data.page
    var count = this.data.count
    var articles = this.data.articles
    var ispg = pg > count ? count : pg
    if (this.data.artId != 0){
      wx.request({
        url: 'https://lizmedia.cn/xyhcms/index.php?s=/kv/getClassNews/cid/' + this.data.artId + '/p/' + ispg,
        data: {},
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: (res) => {
          if (pg <= count) {
            this.scl(res);
            this.setData({
              articles: articles.concat(res.data.data),
              count: res.data.count
            })
          } else {
            wx.showToast({
              title: '到底了!',
              icon: 'none',
              duration: 2000
            })
          }

        }
      })
    } else {
      wx.request({
        url: 'https://lizmedia.cn/xyhcms/index.php?s=/kv/getinfos/openid/' + getApp().globalData.userInfo['openid'],
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: (res) => {
          this.scl(res);          
          this.setData({
            articles: articles.concat(res.data.data)
          })
        }
      })
    }
    
  },
})
var interval;