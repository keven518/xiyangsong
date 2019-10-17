const app = getApp()
const account = require('../account');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		roomNo: '',
		userName: '',
		tapTime: '',
		template: 'bigsmall',
		users: account.users,
		index: 0
	},

	// 绑定输房间号入框
	bindRoomNo: function (e) {
		var self = this;
		self.setData({
			roomNo: e.detail.value
		});
	},
	userChange: function (e) {
		this.setData({
			index: e.detail.value
		})
	},
	radioChange: function (e) {
		this.setData({
			template: e.detail.value
		})
		console.log('this.data.template', this.data.template)
	},


	// 进入rtcroom页面
	joinRoom: function () {

		var self = this;
		var userID = this.data.users[this.data.index]['userId'];
		var userSig = this.data.users[this.data.index]['userToken'];

    var url = `../room/room?roomID=11&template=bigsmall&userId=${userID}&userSig=${userSig}`;

		wx.navigateTo({
			url: url
		});

		wx.showToast({
			title: '进入房间',
			icon: 'success',
			duration: 1000
		})

		self.setData({
			'tapTime': nowTime
		});
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {

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
			path: '/pages/webrtc-room/index/index',
			imageUrl: 'https://mc.qcloudimg.com/static/img/dacf9205fe088ec2fef6f0b781c92510/share.png'
		}
	}
})