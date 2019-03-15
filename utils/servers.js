
const mainUrl = 'https://lizmedia.cn/works/public/index/index/';
module.exports = {

  //获取会员信息
  add_user: (parm) => wxGet("add_user", parm),
  //获取分类
  all_classify: () => wxGet('all_classify'),
  //获取分类列表
  list_info: (parm) => wxGet('list_info', parm),
  //提交视频信息
  add_works: (parm) => wxPost('add_works', parm),
  //视频详情
  list_detail: (parm) => wxGet('list_detail', parm),
  //举报
  report: (parm) => wxPost('report', parm),
  //赞
  support: (parm) => wxGet('support', parm),
  //删除评论
  comment_del: (parm) => wxPost('comment_del', parm),
  //评论
  comment: (parm) => wxPost('comment', parm),
  //获取用户关注信息
  user_info: (parm) => wxGet('user_info', parm),
  //获取作品
  user_works: (parm) => wxGet('user_works', parm),
  //获取自己的作品
  works_list: (parm) => wxGet('works_list', parm),
  //关注
  follow: (parm) => wxPost('follow', parm),
  //删除
  works_del: (parm) => wxPost('works_del', parm),
  //获取关注的作品
  follow_list: (parm) => wxGet('follow_list', parm),
  //获取openId
  getOpenId: function() {
    //获取code
    return new Promise((resolve) => {
      wx.login({
        success: res => {
          let code = res.code;
          let data = {
            code
          };
          resolve(wxPost('login', data));
        }
      });
    });
  },
  add_number: (parm) => wxGet('add_number', parm),
  getinfos: (parm) => wxGet('getinfos', parm)
}

function str(parms) {
  let str = "?",
    first = true;
  for (let key in parms) {
    if (first) {
      str += key + "=" + parms[key];
      first = !first;
    } else {
      str += "&" + key + "=" + parms[key];
    }
  }
  return str;
}

function wxGet(url, parm = {}) {
  wx.showNavigationBarLoading();
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  return new Promise((resolve, reject) => {
    wx.request({
      url: mainUrl + url + str(parm),
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function(res) {
        wx.hideNavigationBarLoading();
        wx.hideLoading();
        resolve(res.data);
      },
      error: function(res) {
        wx.hideNavigationBarLoading();
        if (reject) reject(res.data);
      }
    })
  });
}

function wxPost(url, data = {}) {
  wx.showNavigationBarLoading();
  wx.showLoading({
    title: '加载中',
    mask: 'true'
  })
  return new Promise((resolve, reject) => {
    wx.request({
      url: mainUrl + url,
      method: 'POST',
      data: data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        wx.hideNavigationBarLoading();
        wx.hideLoading();
        resolve(res.data);
      },
      error: function(res) {
        wx.hideNavigationBarLoading();
        if (reject) reject(res.data);
      }
    })
  });
}