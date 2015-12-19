				//wx config  
			wx.config({
				//debug: false,
				appId: window.jssdk.appId,
				timestamp: window.jssdk.timestamp, // �������ǩ����ʱ���
				nonceStr: window.jssdk.nonceStr, // �������ǩ���������
				signature: window.jssdk.signature, // ���ǩ��������¼1
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