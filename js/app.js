
// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
		'ionic', 'starter.controllers', 'starter.services', 'starter.directives', 'common.services', 'ngTagsInput','starter.tpl'
	], function($provide) {
		$provide.factory('myHttpInterceptor', function($q) {
			return {
				// optional method
				'request': function(config) {
					// do something on success
					return config;
				},

				// optional method
				'requestError': function(rejection) {
					// do something on error
					console.log('requestError');
					console.log(rejection);
					rejection.config ? document.write(JSON.stringify(rejection.config.params) + rejection.data)
					:document.write(JSON.stringify(rejection));
					return $q.reject(rejection);
				},



				// optional method
				'response': function(response) {
					// do something on success
					return response;
				},

				// optional method
				'responseError': function(rejection) {
					// do something on error 
					//if (rejection.status === 0) alert('0');
					if (rejection.status !== 0) {
						console.log('responseError');
						console.log(rejection);
						rejection.config ? document.write(JSON.stringify(rejection.config.params) + rejection.data)
					:document.write(JSON.stringify(rejection));
						alert('远程服务器错误,请稍候再试试......' + rejection.status);
						return $q.reject(rejection);
					} else {
						return rejection;
					}



				}
			};
		});
	})
	.filter('range', [

		function() {
			return function(len) {
				return _.range(1, len + 1);
			};
		}
	])
	.controller('StepPanelController', ['currentStep', 'trainnings', 'trainningInstance',
		function(currentStep, trainnings, trainningInstance) {
			var vm = this;
			vm.currentStep = currentStep;
			vm.trainningInstance = trainningInstance;
			vm.trainnings = trainnings;
			vm.texts = ['Write your own sort blog.', 'All trainnings done!'];
			return vm;
		}
	])
	.constant('trainningCourses', {
		courses: [{
			title: 'Step 1:',
			templateUrl: 'trainning-content.html',
			controller: 'StepPanelController',
			controllerAs: 'stepPanel',
			placement: 'right',
			position: '#text'
		}, {
			stepClass: 'last-step',
			backdropClass: 'last-backdrop',
			templateUrl: 'trainning-content-done.html',
			controller: 'StepPanelController',
			controllerAs: 'stepPanel',
			position: ['$window', 'stepPanel',
				function($window, stepPanel) {
					console.log(stepPanel);
					xxxxxx = stepPanel;
					var win = angular.element($window);
					console.log(win.width());
					console.log(stepPanel.width());
					return {
						top: (win.height() - stepPanel.height()) / 2,
						left: (win.width() - stepPanel.width()) / 2
					}
				}
			]
		}]
	})
	.constant('USER_CONFIG', {
		Normal: "400001",
		BS: "404101",
		Proxy: "403201",
	})
	.constant('TYPE_CONFIG', {
		Product: 100001,
		Category: 102002,
		Fav: {
			Customer: 407141,
			Msg: 701112
		},
	})
	.constant('MODULECODE_CONFIG', {
		Gallery: 'g',
		ProductCe: 'p'
	})
	.constant('MSGBOARD_CONFIG', {
		data: {
			boards: window.Boards,
			subs: window.Subs
		},
		BoardNos: [10066, 10067, 10068, 10076]
	})
	.constant('PAYWAYNO_CONFIG', {
		Wx: 50025,
		Ali: 50012,
		PayWayNos: [{
			FullName: "支付宝支付",
			PayWayNo: 50012
		}, {
			FullName: "微信支付",
			PayWayNo: 50025
		}]
	})
	.constant('$ionicLoadingConfig', {
		template: '加载中...'
	})


.constant('SERVICE_CONFIG', {
	UserID: 104915,
	DUserID: 100022
})


.run(function($rootScope, $http, MSGBOARD_CONFIG, $state, Profile, authorization, $timeout, $ionicNavBarDelegate, $ionicBackdrop,$ionicHistory,$ionicLoading) {
	//var hideList=['tab.publish','tab.msgEdit'],
	var hideList = ['tab.publish', 'tab.msgEdit'],
		hideList2 = ['tab.gallery.galleryList', 'tab.customerExList', 'tab.customerTkList'],
		subList = ['tab.publish'];
	$rootScope.$on('$stateChangeStart', function(event, toState, toStateParams, fromState, returnToStateParams) {
	//	if ($ionicBackdrop._element.hasClass('active')) {
		//	$ionicBackdrop._element.html('');
		//	$ionicBackdrop.release();
			//event.preventDefault();
			//return false;
	//	}   
//$ionicLoading.show();
	
		$rootScope.toState = toState;
		$rootScope.toStateParams = toStateParams;
		document.title=toState.t||'美奇酷';   
		$rootScope.returnToStateParams = returnToStateParams;
		// 		 if(_.contains(subList, toState.name )){
		//	 		 if(!Profile.info.Subscribe){
		//	 		 	alert('关注我们后才能享受更多服务');
		//	 		 	$state.go('tab.profile');
		//	 		 	event.preventDefault();
		//	 		 	return false;
		//	 		 }
		//	 }



		if (_.contains(hideList2, toState.name)) {
			$rootScope.hideNavs = true;
		} else {
			$rootScope.hideNavs = false;
		}
		if (_.contains(hideList, toState.name)) {
			$rootScope.hideTabs = true;
		} else {
			$rootScope.hideTabs = false;
		}


		// alert('start'+fromState.name+'--' +toState.name);
	});


	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		//	alert('ss'+fromState.name+'--' +toState.name); 
		console.log($rootScope.$$watchersCount)
		//window.qqqq = $rootScope;
			//document.title=toState.t||'美奇酷';   
//var cur=$ionicHistory.currentView();

	//$ionicLoading.hide();

	});


	$rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
		console.log(arguments);
		$ionicLoading.hide();
		alert(error);
	});


})



.config(function(tagsInputConfigProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider, $compileProvider, MSGBOARD_CONFIG) {
	tagsInputConfigProvider.setDefaults('tagsInput', {
			allowLeftoverText: true,
			addOnComma: true,
			addOnBlur: true,
			addOnSpace: true,
			addOnEnter: true,
			spellcheck: false,
			maxTags: 8,
			minLength: 1,
			maxLength: 10,
			removeTagSymbol: "X"
		})
		.setActiveInterpolation('tagsInput', {
			placeholder: true
		});
	//unsafe
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|wxlocalresource|wxLocalResource|ftp|weixin|mailto|tel|file|sms):/);
	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|wxlocalresource|wxLocalResource|file|weixin|chrome-extension):|data:image\//);
	$ionicConfigProvider.platform.ios.tabs.style('standard');
	$ionicConfigProvider.platform.ios.tabs.position('bottom');
	$ionicConfigProvider.platform.android.tabs.style('standard');
	$ionicConfigProvider.platform.android.tabs.position('bottom');

	$ionicConfigProvider.platform.ios.navBar.alignTitle('center');
	$ionicConfigProvider.platform.android.navBar.alignTitle('center');

	$ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
	$ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

	$ionicConfigProvider.platform.ios.views.transition('none');
	$ionicConfigProvider.platform.android.views.transition('none');
	// Learn more here: https://github.com/angular-ui/ui-routerv 
	$ionicConfigProvider.backButton.previousTitleText(false);
	$ionicConfigProvider.views.maxCache(7);
	$ionicConfigProvider.views.forwardCache(true);
	$stateProvider

		.state('tab', {
			url: '/tab',
			abstract: true,
			resolve: {
				initialData: function(tabsCtrlInitialData) {
					return tabsCtrlInitialData();
				}
			},
			templateUrl: 'tabs.html',
			controller: 'TabsCtrl'
		})
		.state('tab.gallery', {
			url: '^/gallery',
			abstract: true,
			views: {
				'tab-gallery': {
					templateUrl: 'tab-gallery.html',
					controller: 'GalleryCtrl'
				}
			}
		})
		.state('tab.gallery.galleryList', {
			url: '^/galleryList/:BoardNo/:CUserID',
			views: {
				'tab-gallery': {
					templateUrl: 'tab-gallery-list.html',
					controller: 'GalleryListCtrl'
				}
			},
			t:"美奇酷首页"
		})
		.state('tab.subList', {
			url: '^/subList',
			views: {
				'tab-sub': {
					templateUrl: 'tab-sub-list.html',
					controller: 'SubListCtrl'
				}
			},
			t:"话题列表"
		})
		.state('tab.topicList', {
			cache: false,
			url: '^/topicList/:Sub',
			views: {
				'tab-sub': {
					templateUrl: 'tab-topic-list.html',
					controller: 'TopicListCtrl'
				}
			},
			t:"话题"
		})
		.state('tab.tagNameList', {
			cache: false,
			url: '^/tagNameList/:TagName',
			views: {
				'tab-sub': {
					templateUrl: 'tab-tag-name-list.html',
					controller: 'TagNameListCtrl'
				}
			},
			t:"话题"
		})
		.state('tab.systemList', {
			url: '^/systemList/:BoardNo/:CUserID',
			views: {
				'tab-account': {
					templateUrl: 'tab-system-list.html',
					controller: 'SystemListCtrl'
				}
			},
			t:"通知"
		})

	.state('tab.customerExList', {
			url: '^/customerExList/:IsFav',
			views: {
				'tab-customerEx': {
					templateUrl: 'tab-customerEx-list.html',
					controller: 'CustomerExListCtrl'
				}
			},
			t:"交友"
		})
		.state('tab.customerTkList', {
			url: '^/customerTkList/:isTeam',
			views: {
				'tab-account': {
					templateUrl: 'tab-customerTk-list.html',
					controller: 'CustomerTkListCtrl'
				}
			},
			t:"团队"
		})



	.state('tab.customerExView', {
			cache: false,
			url: '^/customerExView/:CustomerID/:CUserID',
			views: {
				'tab-customerEx': {
					templateUrl: 'tab-customerEx-view.html',
					controller: 'CustomerExViewCtrl'
				}
			}
		})
		.state('tab.galleryView', {
			cache: false,
			url: '^/galleryView/:MsgID',
			views: {
				'tab-gallery': {
					templateUrl: 'tab-gallery-view.html',
					controller: 'GalleryViewCtrl'
				}
			}
		})
		.state('tab.topicView', {
			cache: false,
			url: '^/topicView/:MsgID',
			views: {
				'tab-sub': {
					templateUrl: 'tab-topic-view.html',
					controller: 'TopicViewCtrl'
				}
			}
		})
		.state('tab.account', {
			url: '^/account',
			views: {
				'tab-account': {
					templateUrl: 'tab-account.html',
					controller: 'AccountCtrl'
				}
			}
		})
		.state('tab.profile', {
			url: '^/account/profile',
			views: {
				'tab-account': {
					templateUrl: 'tab-profile.html',
					controller: 'ProfileCtrl'
				}
			},
			t:"个人资料" 
		
		})
		.state('tab.publish', {
			cache: false,
			url: '^/publish/:BoardNo/:Sub',
			views: {
				'tab-publish': {
					templateUrl: 'tab-publish.html',
					controller: 'PublishCtrl'
				}
			},
			t:"发布"
		})
		.state('tab.msgEdit', {
			cache: false,
			url: '^/msgEdit/:MsgID',
			views: {
				'tab-account': {
					templateUrl: 'tab-msg-edit.html',
					controller: 'MsgEditCtrl'
				}
			},
			t:"编辑"
		})
		.state('tab.withdraw', {
			cache: false,
			url: '^/withdraw/',
			views: {
				'tab-account': {
					templateUrl: 'tab-withdraw.html',
					controller: 'WithdrawCtrl'
				}
			},
			t:"提现" 
		})
		.state('tab.wallet', {
			cache: false,
			url: '^/wallet/',
			views: {
				'tab-account': {
					templateUrl: 'tab-wallet.html',
					controller: 'WalletCtrl'
				}
			},
			t:"钱包" 
		})
		.state('tab.paidList', {
			url: '^/paidList/:PayType/:CUserID/:SUserID/:AccountType',
			views: {
				'tab-account': {
					templateUrl: 'tab-paid-list.html',
					controller: 'PaidListCtrl'
				}
			}
		})

	.state('tab.login', {
		url: '^/account/login',
		views: {
			'tab-account': {
				templateUrl: 'tab-login.html',
				controller: 'LoginCtrl'
			}
		}
	});

	//		.state('tab.restricted', {
	//  url: '/restricted',
	//  data: {
	//    roles: ['Admin']
	//  },
	//  views: {
	//    'content@': {
	//      templateUrl: 'restricted.html'
	//    }
	//  }
	//})

	$httpProvider.interceptors.push('myHttpInterceptor');
	$urlRouterProvider.otherwise('/galleryList/' + MSGBOARD_CONFIG.data.boards[0].BoardNo + '/0');


	$httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

	// Override $http service's default transformRequest
	$httpProvider.defaults.transformRequest = [

		function(data) {
			/**
			 * The workhorse; converts an object to x-www-form-urlencoded serialization.
			 * @param {Object} obj
			 * @return {String}
			 */
			var param = function(obj) {
				var query = '';
				var name, value, fullSubName, subName, subValue, innerObj, i;

				for (name in obj) {
					value = obj[name];

					if (value instanceof Array) {
						for (i = 0; i < value.length; ++i) {
							subValue = value[i];
							fullSubName = name + '[' + i + ']';
							innerObj = {};
							innerObj[fullSubName] = subValue;
							query += param(innerObj) + '&';
						}
					} else if (value instanceof Object) {
						for (subName in value) {
							subValue = value[subName];
							fullSubName = name + '[' + subName + ']';
							innerObj = {};
							innerObj[fullSubName] = subValue;
							query += param(innerObj) + '&';
						}
					} else if (value !== undefined && value !== null) {
						query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
					}
				}

				return query.length ? query.substr(0, query.length - 1) : query;
			};

			return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
		}
	];

});