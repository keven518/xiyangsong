const api = getApp().api;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images: [],
    isfocus: false,
    showMd: false,
    currentImg:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#2D2E33',
    })
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

    function getdetail(openids){
      api.list_detail({
        id: options.id,
        openid: openids
      }).then(res => {
        console.log(res)
        var {
          code,
          msg
        } = res;
        if (code == 1) {
          msg.image_arr = msg.image_arr.split(',');
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

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sysheight: res.windowHeight
        })
      },
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
      fail: () => {
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
  goprofile() {
    wx.navigateTo({
      url: '/pages/profile/index?openid=' + this.data.data_info.openid,
    })
  },
  imgload(e) {
    wx.showLoading({
      title: '图片加载中',
    })
    var $width = e.detail.width, //获取图片真实宽度
      $height = e.detail.height,
      ratio = $width / $height; //图片的真实宽高比例
    var viewWidth = 750, //设置图片显示宽度，左右留有16rpx边距
      viewHeight = 750 / ratio; //计算的高度值
    var { images, data_info} = this.data;
    var heightarr = [];
    var maxHeight = 0;
    //将图片的datadata-index作为image对象的key,然后存储图片的宽高值
    images[e.target.dataset.index] = {
      width: viewWidth,
      height: viewHeight
    }
    if (images.length == data_info.image_arr.length) {
      images.forEach(item => {
        heightarr.push(item.height);
      })
      wx.hideLoading();
      maxHeight = Math.max.apply(null, heightarr);
    }
    this.setData({
      images,
      maxHeight
    })
  },
  clickimg(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.data_info.image_arr
    })
  },
  delzp(e){
    wx.showModal({
      title: '提示',
      content: '确定删除此作品吗？',
      success: md => {
        if (md.confirm) {
          api.works_del({ id: e.currentTarget.dataset.id }).then(res => {
            var { code, msg } = res;
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
  jubao() {
    wx.navigateTo({
      url: '../report/index?works_id=' + this.data.works_id,
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
    var { id, index } = e.currentTarget.dataset;
    var { data_info } = this.data;
    wx.showModal({
      title: '提示',
      content: '确定删除此评论吗？',
      success: suc=>{
        if(!suc.confirm){
          return;
        }
        api.comment_del({
          comment_id: id
        }).then(res => {
          var { code, msg } = res;
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
  inputcomm(e){
    this.setData({
      inputtxt: e.detail.value
    })
  },
  keysend(e){
    var { inputtxt } = this.data;
    if (inputtxt){
    this.sendcomm(inputtxt)
    }
  },
  sendcomm(content){
    var { works_id, openid, userinfo, data_info, inputtxt } = this.data;
    var data = {
      works_id,
      openid,
      name: userinfo.nickName,
      image: userinfo.avatarUrl,
      content
    }
    api.comment(data).then(res =>{
      var { code, msg, time} = res;
      if(code === 1){
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
  commfocus(){
    this.setData({
      isfocus: true
    })
  },
  commblur(){
    this.setData({
      isfocus: false
    })
  },
  onPageScroll: function (e) {
    this.setData({ scrollTop: e.scrollTop })
  },
  changeImg({ detail }){
    this.setData({
      currentImg: detail.current
    })
  },
  beforeImg(){
    console.log('before')
    var { currentImg } = this.data
    currentImg = currentImg == 0 ? 0 : --currentImg
    this.setData({
      currentImg
    })
  },
  nextImg(){
    var { currentImg, data_info } = this.data;
    var imglen = data_info.image_arr.length - 1;
    currentImg = currentImg < imglen ? ++currentImg : imglen
    this.setData({
      currentImg
    })
    console.log('next')
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      path: '/pages/play/index?id=' + this.data.works_id
    }
  }
})