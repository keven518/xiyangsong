// pages/user/user.js
var app = getApp()
Page({
  data: {
    userInfo: {},
    userName: 'kv',
    orderInfo: {},
    projectSource: 'https://github.com/liuxuanqiang/wechat-weapp-mall',
    userListInfo: [{
      icon: 'http://lizmedia.cn/Public/Home/default/xcx/iconfont-dingdan.png',
      text: '我的订单',
      isunread: true,
      unreadNum: 2
    }, {
      icon: 'http://lizmedia.cn/Public/Home/default/xcx/iconfont-card.png',
      text: '我的代金券',
      isunread: false,
      unreadNum: 2
    }, {
      icon: 'http://lizmedia.cn/Public/Home/default/xcx/iconfont-icontuan.png',
      text: '我的拼团',
      isunread: true,
      unreadNum: 1
    }, {
      icon: 'http://lizmedia.cn/Public/Home/default/xcx/iconfont-shouhuodizhi.png',
      text: '收货地址管理'
    }, {
      icon: 'http://lizmedia.cn/Public/Home/default/xcx/iconfont-kefu.png',
      text: '联系客服'
    }, {
      icon: 'http://lizmedia.cn/Public/Home/default/xcx/iconfont-help.png',
      text: '常见问题'
    }],
    loadingText: '加载中...',
    loadingHidden: false,
  },
  toKejiao() {
    console.log('kj')
    let userName = 'kejiao'
    wx.navigateTo({
      url: "/pages/articledetail/detail",
    })
  },
  onLoad: function() {
    var userName = this.options.userName
    if (userName) {
      this.setData({
        userName
      })
    }
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        loadingHidden: true
      })
    });

    this.loadOrderStatus();
  },
  onShow: function() {
    this.loadOrderStatus();
  },
  loadOrderStatus: function() {
    //获取用户订单数据
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/User/getorder',
      method: 'post',
      data: {
        userId: app.d.userId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        //--init data        
        var status = res.data.status;
        if (status == 1) {
          var orderInfo = res.data.orderInfo;
          that.setData({
            orderInfo: orderInfo
          });
        } else {
          wx.showToast({
            title: '非法操作.',
            duration: 2000
          });
        }
      },
      error: function(e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },
  onShareAppMessage: function() {
    return {
      title: '宠物美容学校',
      path: '/pages/index/index',
      success: function(res) {
        // 分享成功
      },
      fail: function(res) {
        // 分享失败
      }
    }
  },
  kzb() {
    wx.navigateTo({
      url: '/pages/webrtc/webrtc-room/index/index',
    })
  }
})