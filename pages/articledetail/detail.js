// pages/detail/detail.js
const app = getApp()
var WxParse = require('wxParse/wxParse.js');
var Util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    detail: '',
    date: '',
    artId: '',
    cnt: 0,
    author: '',
    copyfrom: '',
    comments: true,
    commentsList: [],
    commentContent: '',
    nickName: '',
    openId: '',
    avatarUrl: '',
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openid: '',
    showMd: false,
  },
  searchSubmit: function (e) {
  },

  // 新增评论
  addComment: function (pid) {
    var that = this;
    wx.request({
      url: 'https://lizmedia.cn/xyhcms/index.php?s=/kv/getComment/pid/' + pid,
      data: {},
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
       
        that.setData({
          commentsList: res.data.data
        })

      }
    })
  },

  // 评论提交
  formBindsubmit: function (e) {
    
    let that = this;
    wx.request({
      url: 'https://lizmedia.cn/xyhcms/index.php?s=/Kv/addComment/',
      data: {
        post_id: that.data.artId,
        content: e.detail.value.content,
        username: this.data.nickName,
        openId: this.data.openId,
        avatarUrl: this.data.avatarUrl
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
       
        that.setData({
          commentContent: ''
        })
        that.addComment(that.data.artId)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    var time = Util.getDate(1521457093);
    
    var that = this;
    // 
    wx.getUserInfo({
      success: r => {
        if (app.globalData.userInfo) {

          this.setData({
            nickName: app.globalData.userInfo.nickName,
            avatarUrl: app.globalData.userInfo.avatarUrl,
            hasUserInfo: true,
            openid: app.globalData.userInfo.openid
          })
        } else if (this.data.canIUse) {
          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况

          app.userInfoReadyCallback = res => {
            this.setData({
              nickName: res.userInfo.nickName,
              avatarUrl: res.userInfo.avatarUrl,
              hasUserInfo: true
            })
          }
        } else {
          // 在没有 open-type=getUserInfo 版本的兼容处理
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo

              this.setData({
                nickName: res.userInfo.nickName,
                avatarUrl: res.userInfo.avatarUrl,
                hasUserInfo: true
              })
            }
          })
        }
        // 加载文章
        wx.request({
          url: 'https://lizmedia.cn/xyhcms/index.php?s=/kv/showArticle/id/' + options.art_id,
          data: { open_id: app.globalData.userInfo.openid },
          method: 'GET',
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {

            // 记录阅读量
            that.addReadNum(app.globalData.userInfo.openid, options.art_id);
            that.setData({
              artId: res.data.data.id,
              title: res.data.data.title,
              detail: res.data.data.content,
              date: res.data.data.update_time,
              cnt: res.data.data.click,
              video: res.data.data.video,
              audio: res.data.data.audio,
              author: res.data.data.author,
              openId: app.globalData.userInfo.openid,
              copyfrom: res.data.data.copyfrom,
            })
            WxParse.wxParse('detail', 'html', res.data.data.content, that, 5);
          }
        })

        // 加载评论
        that.addComment(options.art_id)
      },
      fail: f =>{
        this.setData({
          showMd: true
        })
      }
    })
    
    
  },
  check(e){
    let userinfo = e.detail.userInfo || 0
    if(userinfo){
      app.getUserInfo(r =>{
        this.setData({
          showMd: false
        })
        this.onLoad(this.options)
      })
    }
  },
  /**
   * 记录阅读量
   */
  addReadNum: function (open_id, article_id) {
    
    wx.request({
      url: 'https://lizmedia.cn/xyhcms/index.php?s=/Kv/addReadNum/',
      data: {
        open_id: open_id,
        article_id: article_id
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
      return {
        path: 'pages/articledetail/detail?art_id=' + this.options.art_id
      }
  }
})