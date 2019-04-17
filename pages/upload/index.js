const api = getApp().api;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classify: [],
    selectId: 0,
    selectindex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      tempurl: options.tempurl
    })
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
      }
    })
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          sysinfo: res
        })
      },
    })
  },
  upload(url) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: 'https://lizmedia.cn/works/public/index/index/uploads',
        filePath: url,
        name: 'file',
        formData: {
          'file': 'file'
        },
        success(res) {
          resolve(res.data)
        }
      })
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
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({
          cover_image: res.tempFilePaths[0]
        })
      }
    })
  },
  shangchuan() {
    var {
      selectId,
      userinfo,
      tempurl,
      cover_image,
      content
    } = this.data;

    if (!cover_image) {
      wx.showModal({
        title: '提示',
        content: '请选择封面图',
        showCancel: false
      })
      return;
    }
    if (!content) {
      wx.showModal({
        title: '提示',
        content: '请填写描述!',
        showCancel: false
      })
      return false
    }
    wx.showLoading({
      title: '上传中',
      mask: true
    })
    this.upload(cover_image).then(res => {
      if (res) {
        this.upload(tempurl).then(vid => {

          let data = {
            classify_id: selectId,
            openid: wx.getStorageSync('openids'),
            name: userinfo.nickName,
            image: userinfo.avatarUrl,
            cover_image: res,
            content,
            video: vid,
            'type': 1
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

        })
      }
    })

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
  detail({ detail }) {
    this.setData({
      content: detail.detail.value
    })
  }
})