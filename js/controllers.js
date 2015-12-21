angular.module('starter.controllers', [])



.controller('TabsCtrl', function($scope, $rootScope, $timeout, $ionicLoading, $ionicHistory, $ionicSlideBoxDelegate, $ionicModal, $ionicBackdrop, $ionicPopup, $filter, QR, WX, ImageSelect, Region,
	$state, MsgBoard, Msg, CustomerEx, Fav, Profile, PayAccount, PaidRecord, Adv) {
	//main
	$scope.MsgBoard = MsgBoard;
	$scope.Msg = Msg;
	$scope.Adv = Adv;
	$scope.CustomerEx = CustomerEx;
	$scope.PayAccount = PayAccount;
	$scope.PaidRecord = PaidRecord;
	$scope.Profile = Profile;
	$scope.Fav = Fav;
	//third
	$scope.$filter = $filter;
	$scope.QR = QR;
	$scope.Math = window.Math;
	$scope.$ionicModal = $ionicModal;
	$scope.ImageSelect = ImageSelect;
	$scope.Region = Region;
	$scope.$state = $state;
	//$scope.choose=window.choose;
	$scope.getArr = _.range;
	$scope.compact = _.compact;
	$scope.getPics = ImageSelect.getPics;
	$scope.fullWidth = $(window).width();
	$scope.isWX = navigator.userAgent.indexOf('MicroMessenge') > -1;
	$scope.isAndroid = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1; //android
	$scope.onSwipeRight = function() {
		console.log("right");
		$ionicHistory.goBack();
	};
	$scope.goto = function(tab, p, $event, hash) {

		$ionicHistory.nextViewOptions({
			disableAnimate: true,
			disableBack: true,
			historyRoot: true
		});

		if ('tab.publish' === tab) {

			if (!Profile.info.Subscribe) {
				$scope.bigIMG('images/qrcode.300.400.jpg');
				$state.go('tab.profile');
				$event.preventDefault();
				return false;
			}


			var RP = $rootScope.toStateParams;
			var BoardNo = RP.BoardNo > 10000 ? RP.BoardNo : 10092;
			var Sub = RP.Sub > 10000 ? RP.Sub : 0;
			p = {
				BoardNo: BoardNo,
				Sub: Sub
			};
			hash = '#/publish/' + BoardNo + '/' + Sub;
		}
		if ($scope.isAndroid) {
			$state.go(tab, p);
		} else {
			history.replaceState(null, "页面标题", "index.aspx" + hash);
			$event.preventDefault();
		}

	};

	$scope.loadingShow = function() {
		$ionicLoading.show();
	};
	$scope.loadingHideDelay = function() {
		$timeout(function() {
			$ionicLoading.hide();
		}, 300, false);
	};
	$scope.initCommonModal = function(theScope) {
		theScope.$ionicModal.fromTemplateUrl('my-modal.html', {
			scope: theScope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			theScope.modal = modal;
		});
		theScope.openModal = function(url, title) {
			theScope.modal.url = url;
			theScope.modal.title = title;
			theScope.modal.show();
		};
		theScope.openCarousel = function(srcs) {
			theScope.modal.isCarousel = true;
			theScope.modal.carouselSrcs = srcs;
			//$ionicSlideBoxDelegate.$getByHandle('my-carousel').update();
			theScope.modal.url = 'carousel.html';
			theScope.modal.show();
		};
		if (navigator.userAgent.indexOf('MicroMessenge') > -1) {
			theScope.openCarousel = WX.openCarousel;
		}
		theScope.closeCarousel = function() {
			if (!theScope.modal.isCarousel) {
				return false;
			}
			theScope.modal.hide();
			$timeout(function() {
				theScope.modal.isCarousel = false;
				theScope.modal.carouselSrcs = [];
				$ionicSlideBoxDelegate.$getByHandle('my-carousel').slide(0, 17);
			}, 600);
		};
		theScope.$on('$stateChangeStart', function(event) {
			if (theScope.modal.isShown()) {
				theScope.modal.hide();
				event.preventDefault();
				return false;
			}
		});
		theScope.$on('$stateChangeSuccess', function() {
			theScope.closeModal();
		});
		theScope.closeModal = function() {
			if (theScope.modal) {
				theScope.modal.hide();
				$timeout(function() {
					theScope.modal.url = "";
				}, 600)
			}
		};
		// clean it up and avoid memory leaks
		theScope.$on('$destroy', function() {
			theScope.modal.remove();
		});

	};
	$scope.showVIP = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: '你还不是高级会员',
			template: '请成为高级会员才能继续享受其他各项服务',
			buttons: [{
				text: '返回继续'
			}, {
				text: '成为会员',
				type: 'button-positive',
				onTap: function(e) {
					return true;
				}
			}]
		});
		confirmPopup.then(function(res) {
			if (res) {
				location.href = $scope.Profile.czPage;
			} else {}
		});
	};
	$scope.showVIP2 = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: '你还不是高级会员',
			template: '成为高级会员即可领取红包',
			buttons: [{
				text: '返回继续'
			}, {
				text: '成为会员',
				type: 'button-positive',
				onTap: function(e) {
					return true;
				}
			}]
		});
		confirmPopup.then(function(res) {
			if (res) {
				location.href = $scope.Profile.czPage;
			}
		});
	};

	$scope.showInfo = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: '二维码未上传',
			template: '上传二维码,让更多的人认识你,并可获得5元红包',
			buttons: [{
				text: '返回继续'
			}, {
				text: '前去填写',
				type: 'button-positive',
				onTap: function(e) {
					return true;
				}
			}]
		});
		confirmPopup.then(function(res) {
			if (res) {
				$state.go('tab.profile', {
					V3: Math.random()
				}).then(function() {
					//$scope.openModal('up.html','上传微信二维码');
				});
			}
		});
	};

	WX.share({
		link: location.origin + location.pathname + '?tkid=' + $scope.Profile.info.UserID + location.hash,
		title: '美奇酷来玩吧',
		desc: '',
		imgUrl: 'http://www.weemaa.com/upfiles/10/04/33/20150528/20150528100005_3089.jpg'
	});
	var ccb = function() {
		$ionicBackdrop._element.html('');
		$ionicBackdrop.release();
	};
	$ionicBackdrop._element.bind('click', function() {
		ccb();
	});
	$scope.bigIMG = function(src) {
		$ionicBackdrop._element.append('<i class="ion-close-circled ion" style="font-size: 32px;z-index:999;right: 15px;top:15px; position: absolute;"></i><img  style="max-height:95vh;width:100%;margin: auto;top: 0; left: 0; bottom: 0; right: 0; position: absolute;   "    src="' + src + '">');
		$ionicBackdrop.retain();
	};
	$scope.shareBackdrop = function() {
		$ionicBackdrop._element.append('<img style=" right: 0;top: 0;position: absolute; max-width: 280px;"    src="images/2000.png">');
		$ionicBackdrop.retain();
	};
	$scope.deleteMsg = function(ID, subject) {
		var confirmPopup = $ionicPopup.confirm({
			title: '一旦删除不可恢复',
			template: '确认删除<strong style="color:red">' + subject + '</strong>吗',
			buttons: [{
				text: '返回继续'
			}, {
				text: '确认删除',
				type: 'button-positive',
				onTap: function(e) {
					return true;
				}
			}]
		});
		confirmPopup.then(function(res) {
			if (res) {
				$scope.Msg.delete(ID).then(function() {
					$ionicHistory.nextViewOptions({
						disableAnimate: true,
						disableBack: true
					});

					$state.go('tab.customerExView', {
						CustomerID: $scope.Profile.info.UserID
					});
				});
			}
		});
	};

	$scope.testViewFn = function(evt, src) {
		if (!$scope.Profile.isVIP()) {
			$scope.showVIP();
			evt.preventDefault();

		} else {
			$scope.bigIMG(src);
		}
	};
	$scope.testViewFn2 = function(evt, msg) {
		if (!$scope.Profile.info.Subscribe) {
			$scope.bigIMG('images/qrcode.300.400.jpg');
			evt.preventDefault();
		} else {
			$scope.Fav.add2MsgFav(msg);
		}
		//
	};
	$scope.addC = function(item) {
		if (!$scope.Profile.info.Subscribe) {
			$scope.bigIMG('images/qrcode.300.400.jpg');
		} else {
			$scope.CustomerEx.add2Fav(item);
		}
	};

})

.controller('GalleryCtrl', function($scope, $ionicScrollDelegate, $location, $timeout) {
		var vm = $scope.vm = {};
		//window.de=$ionicScrollDelegate;
		//window.ll=$location;
		var SCFN = function(r) {
			//tongxin absulute
			var id = 'board-' + r.BoardNo;

			$location.hash(id);
			var lll = "#" + id;
			$ionicScrollDelegate.$getByHandle('boardsScroll').anchorScroll(lll);
		};

		var enter = function(e, r) {
			$location.hash('');

			vm.p = r;

			//			$timeout(function(){
			//					$ionicScrollDelegate.$getByHandle('boardsScroll').resize();
			//			$ionicScrollDelegate.$getByHandle('boardsScroll').scrollTo(0,0,false);
			//				
			//SCFN(r);
			//},2000)

		};
		var enterOnce = _.once(enter);
		$scope.$on('galleryListEnter', enter);
		$scope.$on('galleryListChange', function(e, r) {
			vm.p = r;
			vm.navs ? vm.navs = false : 0;
			SCFN(r);
		})
	})
	.controller('GalleryListCtrl', function($scope, $stateParams, $ionicScrollDelegate, $location, $timeout) {
		$scope.initCommonModal($scope);
		$scope.params = $stateParams;
		var vm = $scope.vm = {};
		$scope.$emit('galleryListEnter', $scope.params);
		$scope.$on('$stateChangeSuccess', function(e, toState) {
			$scope.keyName = $scope.$filter('getKeyName')($scope.params);
			if (toState.name === 'tab.gallery.galleryList')
				$scope.$emit('galleryListChange', $scope.params);
		});
		$scope.loadMore = function(paramsCe) {
			$scope.loadingShow();
			$scope.keyName = $scope.$filter('getKeyName')($scope.params);
			if ($scope.Msg.IsLast[$scope.keyName]) {
				$scope.loadingHideDelay();
				return false;
			}
			$scope.Msg.nextPage($scope.params)
				.then(function() {

				})
				.finally(function() {
					$scope.$broadcast("scroll.infiniteScrollComplete");
					$scope.loadingHideDelay();
				});
		};


		$scope.getHeight = function(msg) {
			//base 229 
			var tag = msg.tags.length || msg.Sub.length ? 30 : 0,
				img = msg.fstScale * ($scope.fullWidth - 20);
			return (229 + tag + img);
		};

	})

.controller('TopicListCtrl', function($scope, $stateParams, WX) {
	$scope.initCommonModal($scope);
	$scope.params = $stateParams;
	$scope.myComp = function(msg, i) {
		return !!_.find(msg.Sub, function(sub) {
			return sub.boardNo === $stateParams.Sub * 1;
		});
	};

	$scope.MsgBoard.get($stateParams.Sub * 1).then(function(sub) {
		$scope.sub = sub;
		document.title = sub.BoardName;
		setTimeout(function() {
			var link = location.origin + location.pathname + '?tkid=' + $scope.Profile.info.UserID + location.hash;
			WX.share({
				link: link,
				title: '快来参与话题 #' + sub.BoardName + ',一起互动吧',
				desc: '快来参与话题 #' + sub.BoardName + ',一起互动吧',
				imgUrl: ''
			});
		}, 0);
	})
	$scope.$on('$stateChangeSuccess', function() {
		$scope.keyName = $scope.$filter('getKeyName')($scope.params);
	});
	$scope.loadMore = function(paramsCe) {
		$scope.loadingShow();
		$scope.keyName = $scope.$filter('getKeyName')($scope.params);
		if ($scope.Msg.IsLast[$scope.keyName]) {
			$scope.loadingHideDelay();
			return false;
		}
		$scope.Msg.nextPage($scope.params)
			.then(function() {

			})
			.finally(function() {
				$scope.$broadcast("scroll.infiniteScrollComplete");
				$scope.loadingHideDelay();
			});
	};

	$scope.getHeight = function(msg) {
		//base 229 
		var tag = msg.tags.length || msg.Sub.length ? 30 : 0,
			img = msg.fstScale * ($scope.fullWidth - 20);
		return (229 + tag + img);
	};

})

.controller('TagNameListCtrl', function($scope, $stateParams) {
	$scope.initCommonModal($scope);
	$scope.params = $stateParams;
	$scope.myComp = function(msg, i) {
		return !!_.find(msg.tags, function(tag) {
			return tag.text === $stateParams.TagName;
		});
	};

	$scope.$on('$stateChangeSuccess', function() {
		$scope.keyName = $scope.$filter('getKeyName')($scope.params);
	});
	$scope.loadMore = function(paramsCe) {
		$scope.loadingShow();
		$scope.keyName = $scope.$filter('getKeyName')($scope.params);
		if ($scope.Msg.IsLast[$scope.keyName]) {
			$scope.loadingHideDelay();
			return false;
		}
		$scope.Msg.nextPage($scope.params)
			.then(function() {

			})
			.finally(function() {
				$scope.$broadcast("scroll.infiniteScrollComplete");
				$scope.loadingHideDelay();
			});
	};

	$scope.getHeight = function(msg) {
		//base 229 
		var tag = msg.tags.length || msg.Sub.length ? 30 : 0,
			img = msg.fstScale * ($scope.fullWidth - 20);
		return (229 + tag + img);
	};
	document.title = $stateParams.TagName;
})

.filter('filter2', function() {
		return function(msgs, num) {
			var newArr = [];
			_.each(msgs, function(msg) {
				if (_.find(msg.Sub, function(sub) {
						return sub.boardNo === num;
					}))
					newArr.push(msg);
			})
			return newArr;
		}
	})
	.controller('SubListCtrl', function($scope, $stateParams) {
		$scope.initCommonModal($scope);
		$scope.params = $stateParams;
		$scope.myComp = function(msg, i, de) {
			console.log(de);
			return !!_.find(msg.Sub, function(sub) {
				return sub.boardNo === $stateParams.Sub * 1;
			});
		};
	})


.controller('SystemListCtrl', function($scope, $stateParams) {
		$scope.initCommonModal($scope);
		$scope.params = $stateParams;
		$scope.loadMore = function(paramsCe) {
			$scope.loadingShow();
			$scope.keyName = $scope.$filter('getKeyName')($scope.params);
			if ($scope.Msg.IsLast[$scope.keyName]) {
				$scope.loadingHideDelay();
				return false;
			}
			$scope.Msg.nextPage($scope.params)
				.then(function() {

				})
				.finally(function() {
					$scope.$broadcast("scroll.infiniteScrollComplete");
					$scope.loadingHideDelay();
				});
		};



	})
	.controller('CustomerExListCtrl', function($scope, $stateParams) {
		$scope.initCommonModal($scope);
		$scope.params = $stateParams;
		//		$scope.myComp = function(c, i) {
		//			return !!c.V3;
		//		};


		$scope.CustomerEx.favFixOnce();
		$scope.$on('$stateChangeSuccess', function() {
			$scope.keyName = $scope.$filter('getKeyName')($scope.params);
		});
		$scope.loadMore = function(paramsCe) {
			$scope.loadingShow();
			$scope.keyName = $scope.$filter('getKeyName')($scope.params);
			if ($scope.CustomerEx.IsLast[$scope.keyName]) {
				$scope.loadingHideDelay();
				return false;
			}
			$scope.CustomerEx.nextPage($scope.params)
				.then(function() {

				})
				.finally(function() {
					$scope.$broadcast("scroll.infiniteScrollComplete");
					$scope.loadingHideDelay()
				});
		};


	})
	.controller('CustomerTkListCtrl', function($scope, $stateParams) {
		$scope.initCommonModal($scope);
		$scope.params = $stateParams;
		//$scope.CustomerEx.queryTkOnce();

		var p = _.clone($scope.params);
		p.UserTypes = $scope.params.isTeam * 1 ? '404101' : '400001';
		p.ReferID = $scope.Profile.info.UserID;
		$scope.$on('$stateChangeSuccess', function() {
			p.UserTypes = $scope.params.isTeam * 1 ? '404101' : '400001';
			p.ReferID = $scope.Profile.info.UserID;
			$scope.keyName = $scope.$filter('getKeyName')(p);
		});
		$scope.loadMore = function(paramsCe) {
			$scope.loadingShow();
			$scope.keyName = $scope.$filter('getKeyName')(p);
			if ($scope.CustomerEx.IsLast[$scope.keyName]) {
				$scope.loadingHideDelay();
				return false;
			}
			$scope.CustomerEx.nextPage(p)
				.then(function() {

				})
				.finally(function() {
					$scope.$broadcast("scroll.infiniteScrollComplete");
					$scope.loadingHideDelay()
				});
		};
	})





.controller('GalleryViewCtrl', function($scope, $stateParams, WX, $timeout, $rootScope, $ionicBackdrop) {
	$scope.initCommonModal($scope);
	$scope.params = $stateParams;
	$scope.Msg.get($stateParams.MsgID * 1).then(function(msg) {
		$scope.msg = msg;
		var title = msg.Subject + ',已经获得' + msg.Star + '个赞,为他点个赞吧';
		if (msg.Star < 10) {
			title = msg.Subject + '期待你的点赞';
		}
		setTimeout(function() {
			var link = location.origin + location.pathname + '?tkid=' + $scope.Profile.info.UserID + location.hash;
			WX.share({
				link: link,
				title: title,
				desc: msg.Detail,
				imgUrl: msg.AttachFiles[0]
			});
		}, 0);

		$scope.Fav.getMsgFavs(msg);
		$scope.Msg.getsOnes(msg.CUserID, 6).then(function(myMsgs) {
			$scope.myMsgs = myMsgs;
		})
		$scope.CustomerEx.getByCUID(msg.CUserID).then(function(r) {
			$scope.customer = r;
		});
	});


})

.controller('TopicViewCtrl', function($scope, $stateParams, WX, $timeout, $rootScope, $ionicBackdrop) {
	$scope.initCommonModal($scope);
	$scope.params = $stateParams;
	$scope.Msg.get($stateParams.MsgID * 1).then(function(msg) {
		$scope.msg = msg;
		var title = msg.Subject + ',已经获得' + msg.Star + '个赞,为他点个赞吧';
		if (msg.Star < 10) {
			title = msg.Subject + '期待你的点赞';
		}
		setTimeout(function() {
			var link = location.origin + location.pathname + '?tkid=' + $scope.Profile.info.UserID + location.hash;
			WX.share({
				link: link,
				title: title,
				desc: msg.Detail,
				imgUrl: msg.AttachFiles[0]
			});
		}, 0);

		$scope.Fav.getMsgFavs(msg);
		$scope.Msg.getsOnes(msg.CUserID, 6).then(function(myMsgs) {
			$scope.myMsgs = myMsgs;
		})
		$scope.CustomerEx.getByCUID(msg.CUserID).then(function(r) {
			$scope.customer = r;
		});
	});


})

.controller('CustomerExViewCtrl', function($scope, $stateParams, WX, $timeout) {



	$scope.params = $stateParams;
	$scope.CustomerEx.get({
		CustomerID: $scope.params.CustomerID * 1,
		CUserID: $scope.params.CUserID * 1
	}).then(function(r) {
		$scope.customer = r;
		$scope.loadMore = function(paramsCe) {
			$scope.loadingShow();
			var p = {
				CUserID: r.CUserID
			}
			$scope.keyName = $scope.$filter('getKeyName')(p);
			if ($scope.Msg.IsLast[$scope.keyName]) {
				$scope.loadingHideDelay();
				return false;
			}
			$scope.Msg.nextPage(p)
				.then(function() {

				})
				.finally(function() {
					$scope.$broadcast("scroll.infiniteScrollComplete");
					$scope.loadingHideDelay();
				});
		};


	});

})

.controller('PublishCtrl', function($scope, IO, $timeout, $stateParams, $rootScope) {
	var vm = $scope.vm = {};
	$scope.initCommonModal($scope);
	$scope.params = $stateParams;
	var msgDetail = $scope.msgDetail = {};
	var subItem = $stateParams.Sub * 1;
	var boardNo = $stateParams.BoardNo * 1;
	subItem ? $scope.MsgBoard.get(subItem).then(function(sub) {
		vm.subName = sub.BoardName;
	}) : 0;
	$scope.formData = {};
	$scope.formData.submit = function() {
		if (!$scope.Profile.info.Subscribe) {
			$scope.bigIMG('images/qrcode.300.400.jpg');
			return false;
		}
		$scope.loadingShow();
		IO.LIDsToUri(this.$$srcsTemp).then(function(uris) {
			msgDetail.AttachFiles = uris;
			msgDetail.Subject = msgDetail.Subject ? msgDetail.Subject : msgDetail.Detail.substring(0, 8);
			msgDetail.tags = vm.tags || [];
			msgDetail.subItem = subItem;
			msgDetail.BoardNo = boardNo;
			return $scope.Msg.publish(msgDetail).then(function() {
				var no = msgDetail.BoardNo;
				alert('发布成功');
				$scope.$state.go('tab.gallery.galleryList', {
					BoardNo: boardNo,
					CUserID: 0
				});
			});
		}).finally(function() {
			$scope.loadingHideDelay();
		});

	};

	var maxTags = 8;
	var RP = $rootScope.returnToStateParams;
	vm.tags = [];
	RP.TagName ? vm.tags.push({
		text: RP.TagName
	}) : '';
	RP.MsgID * 1 ? $scope.Msg.get(RP.MsgID * 1).then(function(lastMsg) {
		lastMsg.Sub.length ? subItem = lastMsg.Sub[0].boardNo :
			boardNo = lastMsg.BoardNo || boardNo;
		subItem ? $scope.MsgBoard.get(subItem).then(function(sub) {
			vm.subName = sub.BoardName;
		}) : 0;
	}) : 0;
	$scope.$watch('vm.tags.length', function(value) {
		if (value < maxTags)
			$scope.placeholder = '还可增加 ' + (maxTags - value) + ' 个标签';
		else
			$scope.placeholder = '添加些标签吧';
	});




})

.controller('MsgEditCtrl', function($scope, IO, $timeout, $stateParams) {
	var vm = $scope.vm = {};
	$scope.formData = {};
	$scope.initCommonModal($scope);
	$scope.Msg.get($stateParams.MsgID * 1).then(function(msg) {
		var msgDetail = $scope.msgDetail = msg;

		vm.tags = msgDetail.tags;



		var maxTags = 8;
		$scope.$watch('vm.tags.length', function(value) {
			if (value < maxTags)
				$scope.placeholder = '还可增加 ' + (maxTags - value) + ' 个标签';
			else
				$scope.placeholder = '添加些标签吧';
		});
		var dels = "";
		$scope.delSum = function(oldSrc, i) {
			dels = dels + oldSrc + ',';
			msgDetail.AttachFiles.splice(i, 1);
		};
		$scope.formData.submit = function() {
			$scope.loadingShow();
			IO.LIDsToUri(this.$$srcsTemp).then(function(uris) {
				_.each(uris, function(src, i) {
					msgDetail.AttachFiles.push(src);
				});
				dels ? msgDetail.DelAttachFiles = dels.substring(0, dels.length - 1) : '';
				msgDetail.Subject = msgDetail.Subject ? msgDetail.Subject : msgDetail.Detail.substring(0, 8);
				msgDetail.tags = vm.tags || [];

				return $scope.Msg.edit(msgDetail).then(function() {
					alert('编辑成功');

					$scope.$state.go('tab.galleryView', {
						MsgID: msgDetail.MsgID,
					}).then(function() {
						//window.location.reload();
					});
				});
			}).finally(function() {
				$scope.loadingHideDelay();
			});

		};


	});






})


.controller('AccountCtrl', function($scope, $ionicActionSheet, principal, oauth) {
	$scope.principal = principal;
	$scope.oauth = oauth;


	$scope.initCommonModal($scope);



})

.controller('ProfileCtrl', function($scope, IO, $q, $timeout, $stateParams) {
		$scope.formData = {};
		var vm = $scope.vm = {};
		var profileDetail = $scope.profileDetail = {};

		$scope.formData.submit = function() {
			$scope.loadingShow();
			window.clearEmptyKeys(profileDetail);
			if (this.$$EWMSrcsTemp[0]) {
				var LIDs = [this.$$EWMSrcsTemp[0]];
				IO.LIDsToUri(LIDs).then(function(uris) {
					profileDetail.V3 = uris[0];
					//update 
					return $scope.Profile.edit(profileDetail).then(function() {
						alert("编辑成功");
						_.extendOwn($scope.Profile.info, profileDetail);
						$scope.closeModal();
						$scope.$state.go('tab.profile');
					});
				}).finally(function() {
					$scope.loadingHideDelay();
				});
			} else {
				//update 
				$scope.Profile.edit(profileDetail).then(function() {
					alert("编辑成功");
					_.extendOwn($scope.Profile.info, profileDetail);
					$scope.closeModal();
					$scope.$state.go('tab.profile', {});
				}).finally(function() {
					vm.buttonD = false;
				});
			}

		};
		$scope.initCommonModal($scope);
		$scope.Adv.query({
			CategoryNo: 'ycs'
		});

		$scope.$watch('formData.$$EWMSrcsTemp[0]', function(newV, oldV) {
			if (newV) {
				$scope.formData.submit();
			}
		});


	})
	.controller('WalletCtrl', function($scope) {
		var vm = $scope.vm = {};
		$scope.initCommonModal($scope);
		$scope.loadingShow();
		$scope.PayAccount.getAllOnce({}).then(function() {
			$scope.loadingHideDelay();
		});
$scope.editModal=function(ac){
	$scope.editAccount = _.clone(ac); 
	$scope.openModal('wallet-edit.html','编辑帐号');
};
$scope.editWallet=function(){
	//editAccount
	//all shuaxin
	$scope.PayAccount.editCard($scope.editAccount).then(function(){
		alert('编辑成功');
		$scope.closeModal();
		//window.location.reload();
	});
};
	})
	.controller('WithdrawCtrl', function($scope, $stateParams, $ionicPopup, $q, $timeout, $ionicHistory, $ionicActionSheet) {
		$scope.params = $stateParams;
		$scope.loadingShow();
		$ionicHistory.nextViewOptions({
			disableAnimate: true,
			disableBack: true,
			historyRoot: true
		});

		var vm = $scope.vm = {};
		$scope.buttonD = false;
		$scope.PayAccount.getAllOnce({}).then(function() {
			$scope.loadingHideDelay();
			if (this.data.length) {
				if ($scope.isWX) {
					var ac = _.find(this.data, function(ac) {
						return ac.PayWayNo == this.payWayNoCode.Wx;
					}.bind($scope.PayAccount));
					ac ? $scope.vm.payAccount = ac : alert('微信钱包出错');
					console.log($scope.vm.payAccount);
				} else {
					$scope.vm.payAccount = this.data[0];
				}
			}
		}.bind($scope.PayAccount));

		$scope.selectPACT = function() {
			var buttons = [];
			_.each($scope.PayAccount.data, function(ac, i) {
				var obj = {};
				obj.text = '<p class="dark">' +
					'<span class="positive">' +
					$scope.PayAccount.getWayName(ac.PayWayNo) +
					'</span>' +
					'<span class="positive">' + ac.FullName +
					'</span>' +
					'<br>' +
					'<span>' +
					ac.CardNo +
					'</span>' +
					'</p>'
				buttons.push(obj);
			});


			$ionicActionSheet.show({
				titleText: '选择收款帐号<a href="#/wallet/" class="pull-right positive">管理钱包</a>',
				buttons: buttons,
				//destructiveText: 'Delete',
				cancelText: '返回',
				cancel: function() {
					//console.log('CANCELLED');
				},
				buttonClicked: function(i) {
					$scope.vm.payAccount = $scope.PayAccount.data[i];
					return true;
				},
			});

		};
		$scope.withdraw = function() {
			var dfd = $q.defer();
			if (false) {
				$scope.showVIP2();
				dfd.resolve();

			} else {
				$scope.loadingShow();
				$scope.buttonD = true;
				$scope.PayAccount.withdraw.apply(this, arguments).then(function() {
					alert($scope.Profile.isVIP() ? '已发放到您的微信钱包' : '将在1-3天内发放到微信钱包,请耐心等待');
					$scope.buttonD = false;
					window.location.reload();
				}, function() {
					$scope.buttonD = false;
				}).finally(function() {
					$scope.loadingHideDelay();
				});
			}


			return dfd.promise;
		};
	})
	.controller('PaidListCtrl', function($scope, $stateParams) {
		$scope.initCommonModal($scope);
		$scope.params = $stateParams;
		$scope.$on('$stateChangeSuccess', function() {
			$scope.keyName = $scope.$filter('getKeyName')($scope.params, ['PayType']);
		});
		$scope.loadMore = function(paramsCe) {
			$scope.keyName = $scope.$filter('getKeyName')($scope.params, ['PayType']);
			if ($scope.PaidRecord.IsLast[$scope.keyName]) return false;
			$scope.loadingShow();
			$scope.PaidRecord.nextPage($scope.params)
				.then(function() {

				})
				.finally(function() {
					$scope.loadingHideDelay();
					$scope.$broadcast("scroll.infiniteScrollComplete");
				});
		};


	})
	.controller('LoginCtrl', function($scope, $state, $ionicHistory) {
		//	$ionicHistory.nextViewOptions({
		//disableAnimate: true,
		//disableBack: true
		//});
		//
		//
		//
		//$scope.login=function(i){
		//	oauth.login(i).then(function(r){
		//		console.log(r);
		//		$state.go('tab.account');
		//	});
		//}

	});