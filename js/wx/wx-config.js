				//wx config  
			wx.config({
				//debug: false,
				appId: window.jssdk.appId,
				timestamp: window.jssdk.timestamp, // 必填，生成签名的时间戳
				nonceStr: window.jssdk.nonceStr, // 必填，生成签名的随机串
				signature: window.jssdk.signature, // 必填，签名，见附录1
				jsApiList: [ 
					'checkJsApi',
					'onMenuShareTimeline',
					'onMenuShareAppMessage',
					'onMenuShareQQ',
					'onMenuShareWeibo',
					'onMenuShareQZone',
					'hideMenuItems',
					'showMenuItems',
					'hideAllNonBaseMenuItem',
					'showAllNonBaseMenuItem',
					'translateVoice',
					'startRecord',
					'stopRecord',
					'onVoiceRecordEnd',
					'playVoice',
					'onVoicePlayEnd',
					'pauseVoice',
					'stopVoice',
					'uploadVoice',
					'downloadVoice',
					'chooseImage',
					'previewImage',
					'uploadImage',
					'downloadImage',
					'getNetworkType',
					'openLocation',
					'getLocation',
					'hideOptionMenu',
					'showOptionMenu',
					'closeWindow',
					'scanQRCode',
					'chooseWXPay',
					'openProductSpecificView',
					'addCard',
					'chooseCard',
					'openCard'
				]
			});
			wx.error(function(res) {
				console.log(res.errMsg);
			});