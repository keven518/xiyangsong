const api = getApp().api;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isfocus: false,
    showMd: false,
    chooseSize: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var openid = wx.getStorageSync('openids');
    var that = this;

    if (openid) {
      getdetail(openid)
    } else {
      api.getOpenId().then(res => {
        if (!res.openid) {
          wx.showToast({
            title: '获取openid失败',
          })
        } else {
          wx.setStorageSync('openids', res.openid)
          getdetail(res.openid)
        }
      })
    }

    function getdetail(openids) {
      console.log('options: ', options)
      api.list_detail({
        id: options.id || '964',
        openid: openids
      }).then(res => {
        console.log(res)
        var {
          code,
          msg
        } = res;
        if (code == 1) {
          var ismy = openids == msg.openid ? 1 : 0;
          that.setData({
            data_info: msg,
            works_id: options.id,
            openid: openids,
            ismy
          })

        }
      })
      var pg = getCurrentPages()
      var pgs = pg[pg.length - 2]
      api.add_number({
        openid: openids,
        classify_id: pgs.options.classify_id
      })
    }
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          sysheight: res.windowHeight
        })
      },
    })
    wx.getUserInfo({
      success: res => {
        this.sendinfo();
        this.setData({
          showMd: false,
          userinfo: res.userInfo
        })
      },
      fail: () => {
        that.setData({
          showMd: true,
        })
      }
    })
  },
  sendinfo() {
    wx.getUserInfo({
      success: res => {
        var userinfo = res.userInfo;
        this.setData({
          userinfo,
          showMd: false,
        })
        var openid = wx.getStorageSync('openids');
        if (openid) {
          let {
            nickName,
            avatarUrl
          } = userinfo;
          api.add_user({
            openid,
            name: nickName,
            image: avatarUrl
          })
          this.setData({
            openid
          })
        } else {
          api.getOpenId().then(res => {
            let openid = res.openid;
            wx.setStorageSync('openids', openid);
            this.setData({
              openid
            })
            let {
              nickName,
              avatarUrl
            } = userinfo;
            api.add_user({
              openid,
              name: nickName,
              image: avatarUrl
            })
          })
        }
      },
      fail: () => {
        this.setData({
          showMd: true,
        })
      }
    })
  },
  check: function(e) {
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
        success: function(suc) {
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
  goprofile() {
    wx.navigateTo({
      url: '/pages/profile/index?openid=' + this.data.data_info.openid,
    })
  },
  jubao() {
    wx.navigateTo({
      url: '../../report/index?works_id=' + this.data.works_id,
    })
  },
  delzp(e) {
    wx.showModal({
      title: '提示',
      content: '确定删除此作品吗？',
      success: md => {
        if (md.confirm) {
          api.works_del({
            id: e.currentTarget.dataset.id
          }).then(res => {
            var {
              code,
              msg
            } = res;
            if (code === 1) {
              wx.showToast({
                title: msg,
                duration: 1500
              })
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            }
          })
        }
      }
    })
  },
  support(e) {
    var statu = +e.currentTarget.dataset.statu;
    var {
      data_info,
      works_id
    } = this.data;
    statu === 1 ? data_info.is_support = 0 : data_info.is_support = 1;
    statu === 1 ? data_info.support-- : data_info.support++;
    this.setData({
      data_info
    })
    let openid = wx.getStorageSync('openids');
    api.support({
      openid,
      works_id
    })
  },
  delcommom(e) {
    var {
      id,
      index
    } = e.currentTarget.dataset;
    var {
      data_info
    } = this.data;
    wx.showModal({
      title: '提示',
      content: '确定删除此评论吗？',
      success: suc => {
        if (!suc.confirm) {
          return;
        }
        api.comment_del({
          comment_id: id
        }).then(res => {
          var {
            code,
            msg
          } = res;
          if (code === 1) {
            console.log(data_info)
            data_info.comment.splice(index, 1)
            data_info.comment_num--;
            this.setData({
              data_info
            })
            wx.showToast({
              title: msg,
            })
          } else {
            wx.showToast({
              title: msg,
            })
          }
        })
      }
    })

  },
  keysend(e) {
    var {
      inputtxt
    } = this.data;
    if (inputtxt) {
      this.sendcomm(inputtxt)
    }
  },
  sendcomm(content) {
    var {
      works_id,
      openid,
      userinfo,
      data_info,
      inputtxt
    } = this.data;
    var data = {
      works_id,
      openid,
      name: userinfo.nickName,
      image: userinfo.avatarUrl,
      content
    }
    api.comment(data).then(res => {
      var {
        code,
        msg,
        time
      } = res;
      if (code === 1) {
        data.id = msg;
        data.time = time
        data_info.comment_num++;
        data_info.comment.push(data);
        this.setData({
          data_info,
          inputtxt: ''
        })
      } else {
        wx.showToast({
          title: msg,
        })
      }
    })
  },
  inputcomm(e) {
    console.log(e)
    this.setData({
      inputtxt: e.detail.value
    })
  },
  commfocus() {
    this.setData({
      isfocus: true
    })
  },
  commblur() {
    this.setData({
      isfocus: false
    })
  },
  onPageScroll: function(e) {
    this.setData({
      scrollTop: e.scrollTop
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      path: '/pages/play/video/index?id=' + this.data.works_id
    }
  },

  showshadow: function (e) {
    if (this.data.chooseSize == false) {
      this.chooseSezi()
    } else {
      this.hideModal()
    }
  },

  // 动画函数
  chooseSezi: function (e) {
    // 用that取代this，防止不必要的情况发生
    var that = this;
    // 创建一个动画实例
    var animation = wx.createAnimation({
      // 动画持续时间
      duration: 500,
      // 定义动画效果，当前是匀速
      timingFunction: 'linear'
    })
    // 将该变量赋值给当前动画
    that.animation = animation
    // 先在y轴偏移，然后用step()完成一个动画
    animation.translateY(1000).step()
    // 用setData改变当前动画
    that.setData({
      // 通过export()方法导出数据
      animationData: animation.export(),
      // 改变view里面的Wx：if
      chooseSize: true
    })
    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动 滑动时间
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        clearcart: false
      })
    }, 100)
  },
  // 隐藏
  hideModal: function (e) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateY(700).step()
    that.setData({
      animationData: animation.export()
    })
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        chooseSize: false
      })
    }, 500)
  }
})