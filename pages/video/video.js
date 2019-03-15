const api = getApp().api;
const { $Toast } = require('./../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isfollow: 0,
    showbox: false,
    visible1: false,
    showMd: false,
    count: 0,
    page: 1,
    actions1: [
      {
        name: '上传视频',
      },
      {
        name: '上传图文'
      },
    ],
  },
  scroll: function (e) {
    this.setData({ scrollTop: e.detail.scrollTop })
  },
  choose() {
    this.setData({
      visible1: true
    })
  },
  changemenu(e) {
    var statu = e.currentTarget.dataset.statu;
    var { openid, classify_id, isfollow, page } = this.data;
    if (statu == isfollow) {
      return;
    }
    if (statu == 1) {
      api.follow_list({ openid, classify_id, p: page }).then(res => {
        console.log(res)
        var { code, msg, count } = res;
        if (code != 1){
          $Toast({
            content: msg,
            type: 'warning'
          });
          return;
        }
        this.setData({
          arrlist: msg,
          isfollow: statu,
          count,
          page: 1
        })
      })
    } else {
      api.list_info({ classify_id, p: page}).then(res => {
        console.log(res)
        var { code, msg, count } = res;
        if (code != 1) return false;
        this.setData({
          arrlist: msg,
          isfollow: statu,
          count,
          page: 1
        })
      })

    }
  },
  scrollbottom(){
    var { isfollow, arrlist, count, page, classify_id, openid } = this.data
    page++
    console.log(page, count)
   
    if (classify_id == 0){

      api.getinfos({ openid, p: page }).then(res => {
          var { code, data, count } = res;
          this.setData({
            arrlist: arrlist.concat(data),
            count,
            page
          })
        })
  
    } else {
      if (page > count) {
        $Toast({
          content: '到底了！',
          type: 'warning'
        });
        return
      }
      if (isfollow == 1) {
      
        api.follow_list({ openid, classify_id, p: page }).then(res => {
          console.log(res)
          var { code, msg } = res;
          if (code != 1) {
            $Toast({
              content: msg,
              type: 'warning'
            });
            return;
          }
          this.setData({
            arrlist: arrlist.concat(msg),
            page: page
          })
        })
      } else {
        api.list_info({ classify_id, p: page }).then(res => {

          var { code, msg, count } = res;
          if (code != 1) return false;
          this.setData({
            arrlist: arrlist.concat(msg),
            page: page
          })
        })

      }
    }

    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.sendinfo();
    api.getOpenId().then(res => {
      let openid = res.openid;
      wx.setStorageSync('openids', openid);
      api.getinfos({ openid }).then(res => {
        console.log('onLoad - res: ', res);
        var { code, data, count } = res;
        this.setData({
          arrlist: data,
          classify_id: 0,
          count,
          openid
        })
      })
    })
    

  },
  sendinfo(){
    wx.getUserInfo({
      success: res => {
        var userinfo = res.userInfo;
        this.setData({
          userinfo,
          showMd: false,
        })
        var openid = wx.getStorageSync('openids');
        if (openid) {
          let { nickName, avatarUrl } = userinfo;
          api.add_user({ openid, name: nickName, image: avatarUrl })
          this.setData({
            openid
          })
        } else {
          api.getOpenId().then(res => {
            let openid = res.openid;
            wx.setStorageSync('openids', openid);
            this.setData({ openid })
            let { nickName, avatarUrl } = userinfo;
            api.add_user({ openid, name: nickName, image: avatarUrl })
          })
        }
      },
      fail: ()=>{
        this.setData({
          showMd: true,
        })
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
          that.sendinfo();
          that.setData({
            userinfo: suc.userInfo
          })
        }
      })

    }

  },
  showbox() {
    this.setData({
      showbox: !this.data.showbox
    })
  },
  hidechoose() {
    this.setData({
      visible1: false
    })
  },
  clickchoose({ detail }) {
    console.log(detail.index)
    if (detail.index == 0) {
      wx.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 20,
        camera: 'back',
        success(res) {

          if (parseFloat(res.size / 1024 / 1024) > 20) {
            $Toast({
              content: '选择的视频最大20兆',
              type: 'warning'
            });
          } else {
            wx.navigateTo({
              url: `/pages/upload/index?tempurl=${res.tempFilePath}`
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: `/pages/uploadimgs/index`
      })
    }
    this.setData({
      visible1: false
    })
  },
  turndetail(e) {
    var types = e.currentTarget.dataset;
    if (types.type == 1) {
      wx.navigateTo({
        url: '/pages/play/video/index?id=' + types.id,
      })
    } else {
      wx.navigateTo({
        url: '/pages/play/index?id=' + types.id,
      })
    }
  },
  goprofile() {
    wx.navigateTo({
      url: '/pages/profile/index?openid=' + this.data.openid,
    })
  },
  mywork(){
    wx.navigateTo({
      url: '../../mywork/index',
    })
  },
  /**
   * 用户点击右上角分享
   */
  /*onShareAppMessage: function () {
    var pages = getCurrentPages();
    var page = pages[pages.length - 1]
    return {
      path: '/pages/match/category/index?classify_id=' + page.options.classify_id
    }
  }*/
})