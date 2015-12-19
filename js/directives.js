var shopDirectives = angular.module('starter.directives', [])
	.directive("uiSet", [
		function() {
			return {
				restrict: "EA",
				link: function(scope, elm, iAttrs) {
					scope.$watch(iAttrs.expression, function(val) {
						scope[iAttrs.var] = val;
						var apply = !scope.$$phase ? scope.$apply : angular.noop;
						apply();
					});
				}
			};
		}  
	])          
	.directive('hideTabs', function($rootScope) {
		return {
			restrict: 'A',
			link: function(scope, element, attributes) {
				scope.$watch(attributes.hideTabs, function(value) {
					$rootScope.hideTabs = value; 
				});
 
				scope.$on('$destroy', function() {
					$rootScope.hideTabs = false;
				});
			}
		}; 
	})  
    
.directive('fixHistory', function() {
		return {
			restrict: 'A',
			scope: {
				boolIf: "=",
				where: "@",
				params: '='
			},
			controller: function($scope, $ionicHistory, $state) {
				window.ih = $ionicHistory;
				$scope.boolIf = ($ionicHistory.currentView().index === 0);
				$scope.goRoot = function() {

 
					$ionicHistory.nextViewOptions({
						disableAnimate: true,
						disableBack: true,
						historyRoot: true
					});
					$scope.params = $scope.params || {};
					$state.go($scope.where, $scope.params);
				}
			}, 
			link: function($scope, element, attributes) {
				element.bind('click', $scope.goRoot);
			}

		};
	})
	.directive('regionSelect', function() {
		return {
			restrict: 'E',
			scope: {
				wrapRegion: "=",
				auto: "@",
				result: "=",
				initRegion: "=",
				force: "@"
			},
			controller: function($scope, Region, geo) {
				$scope.getIntKeys = function(obj) {
					return _.map(_.keys(obj), function(str) {
						return parseInt(str);
					});
				}

				$scope.Region = Region;
				if (!$scope.wrapRegion) {
					$scope.wrapRegion = {};
				}
				var wrapRegion = $scope.wrapRegion;
				if (!$scope.force) $scope.force = 'false';
				$scope.$watch('wrapRegion', function(newV, oldV) {
					//什么都没选中..
					if (!wrapRegion.province) return false;
					//ng-option help to clear under selected region 
					//1-3级全部选中
					if ($scope.force === 'false') {
						//直辖 
						if (Region.isDirect($scope.regions[wrapRegion.province])) {
							$scope.result = wrapRegion.province;
						}
						//3级
						else {
							$scope.result = wrapRegion.district;
						}
					}
					//选中什么算什么..
					else {
						$scope.result = wrapRegion.district || wrapRegion.city || wrapRegion.province;
					}

				}, true);



				Region.getRegion().then(function(data) {
					$scope.regions = data;
					if (!$scope.auto) {
						geo.getIPGeo().then(function(rcity) {
							console.log(rcity);
						})
					}
					if ($scope.initRegion) {
						var parents = Region.getParents($scope.initRegion);
						wrapRegion.province = parents[5];
						wrapRegion.city = parents[7];
						wrapRegion.district = parents[9];

					}
				});
				//				$scope.cityComp = function(city, i) {
				//					if (!wrapRegion.province) {
				//						return false;
				//					}
				//					return wrapRegion.province.toString() === String.prototype.substring.apply(city.RegionNo, [0, 5]);
				//				};
				//				$scope.districtComp = function(district, i) {
				//					if (!wrapRegion.city) {
				//						return false;
				//					}
				//					return wrapRegion.city.toString() === String.prototype.substring.apply(district.RegionNo, [0, 7]);
				//				};
			},
			templateUrl: 'region-select.html'
		};
	})

.directive('phoneBinding', function() {
	return {
		restrict: 'E',
		scope: {
			span: "@"
		},
		controller: function($scope, $http, $q, $timeout, Profile) {
			$scope.coolDown = false;

			$scope.codeSrc = '/handler/VerifyCode.ashx?t=' + Math.random();;
			$scope.refreshCodeSrc = function() {
				$scope.codeSrc = '/handler/VerifyCode.ashx?t=' + Math.random();
			};

			$scope.SMSVerifyCode = function() {
				var dfd = $q.defer();

				$http.post("/handler/actions.ashx?act=SMSVerifyCode", {
						CellPhone: $scope.cellPhone,
						verifycode: $scope.verifyCode,
						vtype: 'bind'
					})
					.then(function(r) {
						var result = r.data;
						if (result.status === "0") {
							alert('短信验证码已发送,请留意你手机短信');
							$scope.coolDown = true;
							$timeout(function() {
								$scope.coolDown = false;
							}, 1000 * ($scope.span || 60));
							dfd.resolve();
						} else {
							dfd.reject();
							$scope.refreshCodeSrc();
							alert(result.msg);
						}
					});
				return dfd.promise;
			};
			$scope.bindPhone = function() {
				Profile.bindPhone({
					CellPhone: $scope.cellPhone,
					vCode: $scope.vCode
				}).then(function() {
					alert('绑定成功');
					$scope.$parent.closeModal();
				});
			};



		},
		templateUrl: 'phone-binding.html'
	};
})

.directive('timeFix', function() {
		return {
			restrict: 'A',
			link: function($scope, element, attributes) {
				//element.prop.('value')
			}

		};
	})
	.directive('onFinishRender', function($timeout) {
		return {
			restrict: 'A',
			link: function(scope, element, attr) {
				if (scope.$last === true) {
					$timeout(function() {
						scope.$emit('ngRepeatFinished');
					});
				}
			}
		}
	})
	.directive('tabSlideBox', ['$timeout', '$window', '$ionicSlideBoxDelegate', '$ionicScrollDelegate',
		function($timeout, $window, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
			'use strict';

			return {
				restrict: 'A, E, C',
				link: function(scope, element, attrs, ngModel) {

					var ta = element[0],
						$ta = element;
					$ta.addClass("tabbed-slidebox");
					if (attrs.tabsPosition === "bottom") {
						$ta.addClass("btm");
					}

					//Handle multiple slide/scroll boxes
					var handle = ta.querySelector('.slider').getAttribute('delegate-handle');

					var ionicSlideBoxDelegate = $ionicSlideBoxDelegate;
					if (handle) {
						ionicSlideBoxDelegate = ionicSlideBoxDelegate.$getByHandle(handle);
					}

					var ionicScrollDelegate = $ionicScrollDelegate;
					if (handle) {
						ionicScrollDelegate = ionicScrollDelegate.$getByHandle(handle);
					}

					function renderScrollableTabs() {
						var iconsDiv = angular.element(ta.querySelector(".tsb-icons")),
							icons = iconsDiv.find("a"),
							wrap = iconsDiv[0].querySelector(".tsb-ic-wrp"),
							totalTabs = icons.length;
						var scrollDiv = wrap.querySelector(".scroll");

						angular.forEach(icons, function(value, key) {
							var a = angular.element(value);
							a.on('click', function() {
								ionicSlideBoxDelegate.slide(key);
							});

							if (a.attr('icon-off')) {
								a.attr("class", a.attr('icon-off'));
							}
						});

						var initialIndex = attrs.tab;
						//Initializing the middle tab
						if (typeof attrs.tab === 'undefined' || (totalTabs <= initialIndex) || initialIndex < 0) {
							initialIndex = Math.floor(icons.length / 2);
						}

						//If initial element is 0, set position of the tab to 0th tab 
						if (initialIndex == 0) {
							setPosition(0);
						}

						$timeout(function() {
							ionicSlideBoxDelegate.slide(initialIndex);
						}, 0);
					}

					function setPosition(index) {
						var iconsDiv = angular.element(ta.querySelector(".tsb-icons")),
							icons = iconsDiv.find("a"),
							wrap = iconsDiv[0].querySelector(".tsb-ic-wrp"),
							totalTabs = icons.length;
						var scrollDiv = wrap.querySelector(".scroll");

						var middle = iconsDiv[0].offsetWidth / 2;
						var curEl = angular.element(icons[index]);
						var prvEl = angular.element(iconsDiv[0].querySelector(".active"));
						if (curEl && curEl.length) {
							var curElWidth = curEl[0].offsetWidth,
								curElLeft = curEl[0].offsetLeft;

							if (prvEl.attr('icon-off')) {
								prvEl.attr("class", prvEl.attr('icon-off'));
							} else {
								prvEl.removeClass("active");
							}
							if (curEl.attr('icon-on')) {
								curEl.attr("class", curEl.attr('icon-on'));
							}
							curEl.addClass("active");

							var leftStr = (middle - (curElLeft) - curElWidth / 2 + 5);
							//If tabs are not scrollable
							if (!scrollDiv) {
								var leftStr = (middle - (curElLeft) - curElWidth / 2 + 5) + "px";
								wrap.style.webkitTransform = "translate3d(" + leftStr + ",0,0)";
							} else {
								//If scrollable tabs
								var wrapWidth = wrap.offsetWidth;
								var currentX = Math.abs(getX(scrollDiv.style.webkitTransform));
								var leftOffset = 100;
								var elementOffset = 40;
								//If tabs are reaching right end or left end
								if (((currentX + wrapWidth) < (curElLeft + curElWidth + elementOffset)) || (currentX > (curElLeft - leftOffset))) {
									if (leftStr > 0) {
										leftStr = 0;
									}
									//Use this scrollTo, so when scrolling tab manually will not flicker
									ionicScrollDelegate.scrollTo(Math.abs(leftStr), 0, true);
								}
							}
						}
					};

					function getX(matrix) {
						matrix = matrix.replace("translate3d(", "");
						matrix = matrix.replace("translate(", "");
						return (parseInt(matrix));
					}
					var events = scope.events;
					events.on('slideChange', function(data) {
						setPosition(data.index);
					});
					events.on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
						renderScrollableTabs();
					});

					renderScrollableTabs();
				},
				controller: function($scope, $attrs, $element) {
					$scope.events = new SimplePubSub();

					$scope.slideHasChanged = function(index) {
						$scope.events.trigger("slideChange", {
							"index": index
						});
						$timeout(function() {
							if ($scope.onSlideMove) $scope.onSlideMove({
								"index": eval(index)
							});
						}, 100);
					};

					$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
						$scope.events.trigger("ngRepeatFinished", {
							"event": ngRepeatFinishedEvent
						});
					});
				}
			};

		}
	])

.directive('myTagsInput', function() {
	return {
		restrict: 'E',
		scope: {
			tags: "=",
			maxTagNum:"@"
		},
		controller: function($scope) {
			var eofs = [',', '，', '.', '　', ' '];
			$scope.maxTagNum=$scope.maxTagNum||8;
			$scope.$watch('cand', function(newV) {
				if (newV) {
					var end = newV[newV.length - 1];
					if (_.contains(eofs, end)) {
						var real = newV.substring(0, newV.length - 1).replace(/\s+/g, "");
						if (real) {
							if (!isRepeat(real)) {
								$scope.tags.push({
									text: real
								});
							}
						}
						$scope.cand = null;
					}
				}
			});
			$scope.removeTag = function(i) {
				$scope.tags.splice(i, 1);
			}

			function isRepeat(tag) {
				var tagsText = _.pluck($scope.tags, 'text');
				return _.contains(tagsText, tag);
			} 
		},
		templateUrl: 'my-tags-input.html'
	};
});



function SimplePubSub() {
	var events = {};
	return {
		on: function(names, handler) {
			names.split(' ').forEach(function(name) {
				if (!events[name]) {
					events[name] = [];
				}
				events[name].push(handler);
			});
			return this;
		},
		trigger: function(name, args) {
			angular.forEach(events[name], function(handler) {
				handler.call(null, args);
			});
			return this;
		}
	};
};