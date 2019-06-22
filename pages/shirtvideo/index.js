/**
 * 此处为配置项
 */
const xMarginError = 100; // x轴允许的误差
const yMarginError = 50; // y轴允许的误差
const xDistance = 50; // x轴滚动多少距离视为滑动
const yDistance = 30; // y轴滚动多少距离视为滑动
const computedTime = 1000; // 手指在屏幕滑动多少时间内，记做滑动

//index.js
//获取应用实例
const app = getApp();
var startXPoint = 0;
var startYPoint = 0;
var startTimeStamp = 0;
Page({
  data: {
    resources: ['../../resource/1.jpg', '../../resource/2.jpg'],
    videos: [
        {
          videoUrl: "https://aweme.snssdk.com/aweme/v1/playwm/?video_id=v0200faf0000bg5joco1ahq89k7ik9j0&line=0",
          durations: 10,
          poster: "https://p3.pstatp.com/large/131040001488de047292a.jpg"
        },
        {
          videoUrl: "https://aweme.snssdk.com/aweme/v1/playwm/?video_id=v0200f2f0000bg2dbhb6j2qj3mr8pa9g&line=0",
          durations: 10,
          poster: "https://p1.pstatp.com/large/12bea0008f8a226fc53c3.jpg"
        },
        {
          videoUrl: "https://aweme.snssdk.com/aweme/v1/playwm/?video_id=v0200fce0000bg36q72j2boojh1t030g&line=0",
          durations: 10,
          poster: "https://p99.pstatp.com/large/12c5c0009891b32e947b7.jpg"
        },
        {
          videoUrl: "https://aweme.snssdk.com/aweme/v1/playwm/?video_id=v0300fd10000bfrb9mlpimm72a92fsj0&line=0",
          durations: 10,
          poster: "https://p99.pstatp.com/large/12246000525d4c87900e7.jpg"
        },
      {
        videoUrl: "http://guke.liztrip.cn/b1e42423f840377985598745a34ecb9f.mp4",
        durations: 10,
        poster: "https://p99.pstatp.com/large/12246000525d4c87900e7.jpg"
      },
      {
        videoUrl: "http://guke.liztrip.cn/bc341a3d7fe3b32256f93824011ddbd0.mp4",
        durations: 10,
        poster: "https://p99.pstatp.com/large/12246000525d4c87900e7.jpg"
      }
      ],
    height: 0,
    width: 0,
    transformHeight: 0,
    current: 1,
    currentY: 0,
    isShow: true
  },
  onLoad: function() {
    this.setData({
      height: wx.getSystemInfoSync().windowHeight,
      width: wx.getSystemInfoSync().windowWidth,
    });
    wx.createVideoContext(`vId-${this.data.currentY}`).play()
  },
  touchStart: e => {
    const touch = e.touches[0];
    startXPoint = touch.pageX;
    startYPoint = touch.pageY;
    startTimeStamp = Date.now();
  },
  touchEnd(e) {
    console.log('touchEnd: ', e);
    const now = Date.now();
    const diff = now - startTimeStamp;
    startTimeStamp = 0;
    const { pageX, pageY } = e.changedTouches[0];
    console.log(pageX, pageY);
    if (diff < computedTime) {
      const diffX = Math.abs(pageX - startXPoint);
      const diffY = Math.abs(pageY - startYPoint);
      // 水平滑动
      if (diffX > xDistance && diffY < yMarginError) {
        // // 手指从左往右滑
        console.log('this.data.current: ', this.data.current)
        if (pageX > startXPoint) {
          if (this.data.current > 0) {
            this.setData({ current: this.data.current - 1 });
            if (this.data.current == 1){
              wx.createVideoContext(`vId-${this.data.currentY}`).play()
              this.setData({ isShow: true });
            }else{
              wx.createVideoContext(`vId-${this.data.currentY}`).pause()
              this.setData({ isShow: false });
            }            
          }    
          // wx.navigateTo({
          //   url: leftUrl,
          // });
        } else {
          if (this.data.current < 2) {
            this.setData({ current: this.data.current + 1 });
            if (this.data.current == 1) {
              wx.createVideoContext(`vId-${this.data.currentY}`).play();
              this.setData({ isShow: true });
            } else {
              wx.createVideoContext(`vId-${this.data.currentY}`).pause();
              this.setData({ isShow: false });
            }  
          }
          // 手指从右往左滑
          // wx.navigateTo({
          //   url: rightUrl,
          // });
        }
      }
      // 垂直滑动
      else if (
        this.data.current === 1 &&
        diffY > yDistance &&
        diffX < xMarginError
      ) {
        // 手指从下往上滑
        if (pageY < startYPoint) {
          const newResources = this.data.resources.slice(0);
          // 这里用来追加资源
          newResources.push(
            `../../resource/${Math.ceil(Math.random() * 5)}.jpg`
          );
          this.setData({ resources: newResources });
          const transformHeight = this.data.transformHeight - this.data.height;
          const currentY = this.data.currentY + 1
          this.setData({ transformHeight, currentY});
          wx.createVideoContext(`vId-${this.data.currentY - 1}`).pause()
          wx.createVideoContext(`vId-${this.data.currentY}`).play()
        } else {
          if (this.data.transformHeight < 0) {
            const transformHeight = this.data.transformHeight + this.data.height;
            const currentY = this.data.currentY - 1
            this.setData({ transformHeight, currentY });
            wx.createVideoContext(`vId-${this.data.currentY + 1}`).pause()
            wx.createVideoContext(`vId-${this.data.currentY}`).play()
          }
        }
        console.log(this.resources);
      }
    }
  },
});
