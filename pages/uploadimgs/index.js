var api = getApp().api;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classify: [],
    selectId: 0,
    selectimgs: [],
    choosecount: 9,
    selectindex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    api.all_classify().then(res => {
      let {
        code,
        msg
      } = res;
      if (code == 1) {
        let obj = {
          classify: [],
          classify_id: []
        };
        msg.forEach(item => {
          obj.classify.push(item.classify_name)
          obj.classify_id.push(item.id)
        })

        this.setData({
          classify: obj,
          selectId: msg[0].id
        })
      }

    })
    wx.getUserInfo({
      success: res => {
        this.setData({
          userinfo: res.userInfo
        })
      },
      fail: () => {
        wx.navigateBack()
      }
    })
  },
  bindPickerChange: function ({
    detail
  }) {
    this.setData({
      selectId: this.data.classify.classify_id[detail.value - 0],
      selectindex: detail.value - 0
    })
  },
  chooseimg() {
    var imgs = this.data.selectimgs
    wx.chooseImage({
      count: this.data.choosecount - imgs.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        res.tempFilePaths.forEach(item => {
          imgs.push(item)
        })
        this.setData({
          selectimgs: imgs
        })
      }
    })
  },
  chooseCoverImg() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {

        this.setData({
          cover_img: res.tempFilePaths[0]
        })
      }
    })
  },
  delimg(e) {
    var index = e.currentTarget.dataset.index;
    var imgs = this.data.selectimgs;
    imgs.splice(index, 1)
    this.setData({
      selectimgs: imgs
    })

  },
  detail({ detail }) {
    this.setData({
      content: detail.detail.value
    })
  },
  upload(num = 0, imgarr = []) {
    var imgs = this.data.selectimgs;
    wx.uploadFile({
      url: 'https://lizmedia.cn/works/public/index/index/uploads',
      filePath: imgs[num],
      name: 'file',
      formData: {
        'file': 'file'
      },
      success: res => {
        if (res.statusCode != 200) return;
        if (num < imgs.length - 1) {
          num++;
          imgarr.push(res.data)
          this.upload(num, imgarr)
        } else {
          imgarr.push(res.data)
          this.subdata(imgarr)
          wx.hideLoading();
        }

      }
    })
  },
  shangchuan() {
    var cover_image = this.data.cover_img;
    var imgs = this.data.selectimgs;
    var content = this.data.content;
    if (!cover_image || imgs.length < 1) {
      wx.showModal({
        title: '提示',
        content: '请选择图片！',
        showCancel: false
      })
      return false;
    }
    if (!content) {
      wx.showModal({
        title: '提示',
        content: '请填写描述',
        showCancel: false
      })
      return false;
    }
    wx.showLoading({
      title: '图片上传中',
      mask:true
    })
    wx.uploadFile({
      url: 'https://lizmedia.cn/works/public/index/index/uploads',
      filePath: cover_image,
      name: 'file',
      formData: {
        'file': 'file'
      },
      success: res => {
        if (res.statusCode != 200) return;
        this.upload();
        this.setData({
          cover_image: res.data
        })
      }
    })

  },
  //提交数据
  subdata(image_arr) {
    var {
      selectId,
      userinfo,
      cover_image,
      content,
    } = this.data;

    let data = {
      classify_id: selectId,
      openid: wx.getStorageSync('openids'),
      name: userinfo.nickName,
      image: userinfo.avatarUrl,
      cover_image,
      content,
      image_arr,
      'type': 2
    }

    if (!data.openid) {
      api.getOpenId().then(openid => {
        if (!openid.openid) {
          wx.showToast({
            title: 'openid获取失败',
          })
        } else {
          data.openid = openid.openid;
          subdata(data)
        }
      })
    } else {
      subdata(data)
    }

    function subdata(data) {
      api.add_works(data).then(res => {
        if (res.code == 1) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '信息上传完成！请耐心等待审核',
            showCancel: false,
            success: function (res) {
              wx.navigateBack();
            }
          })
        }
      })
    }
  },

})