// import ApiList from  '../../config/api';
// import request from '../../utils/request.js';
//获取应用实例  
var app = getApp();
Page({
    data: {
        // types: null,
        typeTree: {}, // 数据缓存
        currType: 0 ,
        // 当前类型
        "types": [
        ],
        typeTree: [],
    },
        
    onLoad: function (option){
        var that = this;
        
    },    
 
    clickchoose( e ) {
      console.log('e: ', e)
      let type = e.currentTarget.id
        if (type == "0") {
            wx.chooseVideo({
              sourceType: ['album', 'camera'],
              maxDuration: 20,
              camera: 'back',
              success(res) {
      
                if (parseFloat(res.size / 1024 / 1024) > 50) {
                  $Toast({
                    content: '选择的视频最大30兆',
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
    }
})