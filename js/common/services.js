//Please set step content to fixed width when complex content or dynamic loading.
angular.module('com.github.greengerong.backdrop', [])
	.directive('uiBackdrop', ['$document',
		function($document) {
			return {
				restrict: 'EA',
				replace: true,
				templateUrl: 'modal-backdrop.html',
				scope: {
					backdropClass: '=',
					zIndex: '='
				}
				/* ,link: function(){
				   $document.bind('keydown', function(evt){
				     evt.preventDefault();
				     evt.stopPropagation();
				   });
				   
				   scope.$on('$destroy', function(){
				     $document.unbind('keydown');
				   });
				 }*/
			};
		}
	])
	.service('modalBackdropService', ['$rootScope', '$compile', '$document',
		function($rootScope, $compile, $document) {
			var self = this;

			self.backdrop = function(backdropClass, zIndex) {
				var $backdrop = angular.element('<ui-backdrop ng-click="$root.removeFn()"></ui-backdrop>')
					.attr({
						'backdrop-class': 'backdropClass',
						'z-index': 'zIndex'
					});

				var backdropScope = $rootScope.$new(true);
				backdropScope.backdropClass = backdropClass;
				backdropScope.zIndex = zIndex;
				$document.find('body').append($compile($backdrop)(backdropScope));

				return function() {
					$backdrop.remove();
					backdropScope.$destroy();
				};
			};
		}
	]);

angular.module('com.github.greengerong.trainning', ['com.github.greengerong.backdrop', 'ui.bootstrap'])
	.directive('trainningStep', ['$timeout', '$http', '$templateCache', '$compile', '$position', '$injector', '$window', '$q', '$controller',
		function($timeout, $http, $templateCache, $compile, $position, $injector, $window, $q, $controller) {
			return {
				restrict: 'EA',
				replace: true,
				templateUrl: 'trainning-step.html',
				scope: {
					step: '=',
					trainnings: '=',
					nextStep: '&',
					cancel: '&'
				},
				link: function(stepPanelScope, elm) {
					var stepPanel = elm.find('.step-panel');
					stepPanelScope.$watch('step', function(step) {
						if (!step) {
							return;
						}

						stepPanelScope.currentTrainning = stepPanelScope.trainnings[stepPanelScope.step - 1];

						var contentScope = stepPanelScope.$new(false);
						loadStepContent(contentScope, {
							'currentStep': stepPanelScope.step,
							'trainnings': stepPanelScope.trainnings,
							'currentTrainning': stepPanelScope.currentTrainning,
							'trainningInstance': {
								'nextStep': stepPanelScope.nextStep,
								'cancel': stepPanelScope.cancel
							}
						}).then(function(tplAndVars) {
							elm.find('.popover-content').html($compile(tplAndVars[0])(contentScope));
						}).then(function() {
							var pos = stepPanelScope.currentTrainning.position;
							adjustPosition(stepPanelScope, stepPanel, pos);
						});

					});

					angular.element($window).bind('resize', function() {
						adjustPosition(stepPanelScope, stepPanel, stepPanelScope.currentTrainning.position);
					});

					stepPanelScope.$on('$destroy', function() {
						angular.element($window).unbind('resize');
					});

					function getPositionOnElement(stepScope, setpPos) {
						return $position.positionElements(angular.element(setpPos), stepPanel, stepScope.currentTrainning.placement, true);
					}

					function positionOnElement(stepScope, setpPos) {
						var targetPos = angular.isString(setpPos) ? getPositionOnElement(stepScope, setpPos) : setpPos;
						var positionStyle = stepScope.currentTrainning || {};
						positionStyle.top = targetPos.top + 'px';
						positionStyle.left = targetPos.left + 'px';
						stepScope.positionStyle = positionStyle;
					}

					function adjustPosition(stepScope, stepPanel, pos) {
						if (!pos) {
							return;
						}

						var setpPos = angular.isFunction(pos) || angular.isArray(pos) ? $injector.invoke(pos, null, {
							trainnings: stepScope.trainnings,
							step: stepScope.setp,
							currentTrainning: stepScope.currentTrainning,
							stepPanel: stepPanel
						}) : pos;

						//get postion should wait for content setup
						$timeout(function() {
							positionOnElement(stepScope, setpPos);
						});
					}



					function loadStepContent(contentScope, ctrlLocals) {
						var trainningOptions = contentScope.currentTrainning,
							getTemplatePromise = function(options) {
								return options.template ? $q.when(options.template) :
									$http.get(angular.isFunction(options.templateUrl) ? (options.templateUrl)() : options.templateUrl, {
										cache: $templateCache
									}).then(function(result) {
										return result.data;
									});
							},

							getResolvePromises = function(resolves) {
								var promisesArr = [];
								angular.forEach(resolves, function(value) {
									if (angular.isFunction(value) || angular.isArray(value)) {
										promisesArr.push($q.when($injector.invoke(value)));
									}
								});
								return promisesArr;
							},

							controllerLoader = function(trainningOptions, trainningScope, ctrlLocals, tplAndVars) {
								var ctrlInstance;
								ctrlLocals = angular.extend({}, ctrlLocals || {}, trainningOptions.locals || {});
								var resolveIter = 1;

								if (trainningOptions.controller) {
									ctrlLocals.$scope = trainningScope;
									angular.forEach(trainningOptions.resolve, function(value, key) {
										ctrlLocals[key] = tplAndVars[resolveIter++];
									});

									ctrlInstance = $controller(trainningOptions.controller, ctrlLocals);
									if (trainningOptions.controllerAs) {
										trainningScope[trainningOptions.controllerAs] = ctrlInstance;
									}
								}

								return trainningScope;
							};

						var templateAndResolvePromise = $q.all([getTemplatePromise(trainningOptions)].concat(getResolvePromises(trainningOptions.resolve || {})));
						return templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {
							controllerLoader(trainningOptions, contentScope, ctrlLocals, tplAndVars);
							return tplAndVars;
						});
					}

				}
			};
		}
	])
	.service('trainningService', ['$compile', '$rootScope', '$document', '$q',
		function($compile, $rootScope, $document, $q) {
			var self = this;

			self.trainning = function(trainnings) {
				var trainningScope = $rootScope.$new(true),
					defer = $q.defer(),
					$stepElm = angular.element('<trainning-step></trainning-step>')
					.attr({
						'step': 'step',
						'trainnings': 'trainnings',
						'next-step': 'nextStep($event, step);',
						'cancel': 'cancel($event, step)'
					}),
					destroyTrainningPanel = function() {
						if (trainningScope) {
							$stepElm.remove();
							trainningScope.$destroy();
						}
					};

				trainningScope.cancel = function($event, step) {
					defer.reject('cancel');
				};

				trainningScope.nextStep = function($event, step) {
					if (trainningScope.step === trainnings.length) {
						destroyTrainningPanel();
						return defer.resolve('done');
					}

					trainningScope.step++;
				};
				trainningScope.trainnings = trainnings;
				trainningScope.step = 1;

				$document.find('body').append($compile($stepElm)(trainningScope));
				$rootScope.$on('$locationChangeStart', destroyTrainningPanel);

				return {
					done: function(func) {
						defer.promise.then(func);
					},
					cancel: function(func) {
						defer.promise.then(null, func);
					}
				};
			};

		}
	]);
//'com.github.greengerong.trainning'
var commonServices = angular.module('common.services', [])
	.factory('SimpleCache', [

		function() {
			function SimpleCache() {
				this.data = [];
			}
			SimpleCache.prototype = {
				isCached: function(item) {
					return _.indexOf(this.data, item) > -1 ? true : false;
				},
				clearCaches: function() {
					this.data = []; //cause its pop contains nothing
				},
				setCache: function(item) {
					if (!this.isCached(item)) {
						this.data.push(item);
					}
				}
			};
			return SimpleCache;
		}
	])
	//e.x.  
	//root.=new product..
	//root.pagenation=new Pagenation(root,pagesize,isInfinite);

//Pagenation service-----------Infinite or not  
//qnd : turnTo=true means wait for broswer redraw ,solution 2: debounce it for 500+;
.factory('Pagenation', ['$q', 'SimpleCache', '$timeout',
	function($q, SimpleCache, $timeout) {
		var cache = new SimpleCache();

		function Pagenation(root, pageSize, isInfinite) {
			this.isInfinite = isInfinite;
			this.items = [];
			this.root = root;
			this.phase = root.phase;
			this.isLast = false;
			this.cache = cache;
			this.pageSize = pageSize ? pageSize : 20;
			//init
			this.pageCount = 99999; //should query pageCount in the initFn
			this.page = 0;
		}
		Pagenation.prototype = {
			testPage: function(num) {
				if (num < 1) {
					return 0;
				} else if (num > this.pageCount) {
					return 2;
				} else {
					return 1;
				}
			},
			params: {
				pageSize: this.pageSize,
				page: this.page
			},
			nextPage: function() {
				this.page += 1;
				this.turnTo(this.page); //patch for infiniteD
			},
			turnTo: function() {
				this.phase.turnTo = true;
				var dfd1 = $q.defer();
				if (!this.cache.isCached(this.page)) {
					var promise = this.queryPageChanged();
					promise.then(function() {
						this.cache.setCache(this.page);
						dfd1.resolve();
					}.bind(this), function() {
						dfd1.reject(body);
					});

				}
				//cached
				else {
					dfd1.resolve();
				}
				//all solved
				return dfd1.promise.then(function() {
					this.page === this.pageCount ? this.isLast = true : this.isLast = false;
					console.time('a');
					console.time('b');
					this.calcItems();
					console.timeEnd('b');
					$timeout(function() {
						console.timeEnd('a');
						this.phase.turnTo = false;
					}.bind(this), 0);
				}.bind(this), function(body) {
					alert('未知错误');
					console.log(body);
				});
			},
			queryPageChanged: function() {
				var params = _.extend({}, this.root.params, {
						pageSize: this.pageSize,
						page: this.page
					}),
					dfd = $q.defer();
				this.root.query(params).then(function(body) {
					this.pageCount = body.data.pageCount;
					_.each(body.data.data, function(item, i) {
						item.page = this.page;
					}, this);
					dfd.resolve();
				}.bind(this), function fail(body) {
					dfd.reject(body);
				});
				return dfd.promise;
			},
			calcItems: function() {
				if (this.isInfinite) {
					this.items = this.root.data;
				} else {
					this.items = _.filter(this.root.data, function(item) {
						return item.page === this.page;
					}.bind(this));
				}
			},
		};
		return Pagenation;
	}
])

// Create an AngularJS service called debounce
.factory('$debounceDef', ['$timeout', '$q',
	function($timeout, $q) {
		// The service is actually this function, which we call with the func
		// that should be debounced and how long to wait in between calls
		return function debounceDef(func, customWait, immediate) {
			// Create a deferred object that will be resolved when we need to
			// actually call the func
			var timeout, deferred = $q.defer();

			var later;

			function dedef() {
				var context = this,
					args = arguments;
				later = function() {
					timeout = null;
					if (!immediate) {
						deferred.resolve(func.apply(context, args));
						deferred = $q.defer();
					}
				};
				var callNow = immediate && !timeout; //first time
				if (timeout) { //already call in the waiting
					$timeout.cancel(timeout);
				}
				timeout = $timeout(later, customWait);
				if (callNow) {
					deferred.resolve(func.apply(context, args));
					deferred = $q.defer();
				}
				return deferred.promise;
			}

			dedef.exposed = {
				_cancel: function() {
					$timeout.cancel(timeout);
				},
				leaveCall: function() {
					if (timeout) {
						this._cancel();
						timeout = $timeout(later, 0);
						return deferred.promise;
					} else {
						var cdfd = $q.defer();
						$timeout(function() {
							cdfd.resolve('无需cancel');
						}, 0);


						return cdfd.promise;
					}
				},
			};
			return dedef;
		};
	}
])

//weixin http interceptor
//.factory('wxInterceptor', ['$q',  function($q) {
//  var requestInterceptor = {
//      request: function(config) {
//          var deferred = $q.defer();
//              deferred.resolve(config);
//        
//          return deferred.promise;
//      }
//  };
//
//  return requestInterceptor;
//}])

.service('typeWrap', function() {
	this.array = function(items) {
		if (items instanceof Array) {
			return items;
		} else {
			return [items];
		}
	};
})

.service('dialogTpls', function() {
		this.data = "";
	})
	.controller('dialogController', ['$scope', 'close', 'CartDir', 'dialogTpls',
		function($scope, close, CartDir, dialogTpls) {

			$scope.display = true;
			$scope.item = CartDir.cur;
			$scope.dialogTpls = dialogTpls;
			$scope.close = function() {
				$scope.display = false;
				close();
			};

		}
	])
	.factory('ModalService', ['$document', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateCache',
		function($document, $compile, $controller, $http, $rootScope, $q, $templateCache) {

			//  Get the body of the document, we'll add the modal to this.
			var body = $document.find('body');

			function ModalService() {

				var self = this;

				//  Returns a promise which gets the template, either
				//  from the template parameter or via a request to the
				//  template url parameter.
				var getTemplate = function(template, templateUrl) {
					var deferred = $q.defer();
					if (template) {
						deferred.resolve(template);
					} else if (templateUrl) {
						// check to see if the template has already been loaded
						var cachedTemplate = $templateCache.get(templateUrl);
						if (cachedTemplate !== undefined) {
							deferred.resolve(cachedTemplate);
						}
						// if not, let's grab the template for the first time
						else {
							$http({
									method: 'GET',
									url: templateUrl,
									cache: true
								})
								.then(function(result) {
									// save template into the cache and return the template
									$templateCache.put(templateUrl, result.data);
									deferred.resolve(result.data);
								}, function(error) {
									deferred.reject(error);
								});
						}
					} else {
						deferred.reject("No template or templateUrl has been specified.");
					}
					return deferred.promise;
				};

				self.showModal = function(options) {

					//  Create a deferred we'll resolve when the modal is ready.
					var deferred = $q.defer();

					//  Validate the input parameters.
					var controllerName = options.controller;
					if (!controllerName) {
						deferred.reject("No controller has been specified.");
						return deferred.promise;
					}

					//  If a 'controllerAs' option has been provided, we change the controller
					//  name to use 'as' syntax. $controller will automatically handle this.
					if (options.controllerAs) {
						controllerName = controllerName + " as " + options.controllerAs;
					}

					//  Get the actual html of the template.
					getTemplate(options.template, options.templateUrl)
						.then(function(template) {

							//  Create a new scope for the modal.
							var modalScope = $rootScope.$new();

							//  Create the inputs object to the controller - this will include
							//  the scope, as well as all inputs provided.
							//  We will also create a deferred that is resolved with a provided
							//  close function. The controller can then call 'close(result)'.
							//  The controller can also provide a delay for closing - this is
							//  helpful if there are closing animations which must finish first.
							var closeDeferred = $q.defer();
							var inputs = {
								$scope: modalScope,
								close: function(result, delay) {
									if (delay === undefined || delay === null) delay = 0;
									window.setTimeout(function() {
										//  Resolve the 'close' promise.
										closeDeferred.resolve(result);

										//  We can now clean up the scope and remove the element from the DOM.
										modalScope.$destroy();
										modalElement.remove();

										//  Unless we null out all of these objects we seem to suffer
										//  from memory leaks, if anyone can explain why then I'd 
										//  be very interested to know.
										inputs.close = null;
										deferred = null;
										closeDeferred = null;
										modal = null;
										inputs = null;
										modalElement = null;
										modalScope = null;
									}, delay);
								}
							};

							//  If we have provided any inputs, pass them to the controller.
							if (options.inputs) {
								for (var inputName in options.inputs) {
									inputs[inputName] = options.inputs[inputName];
								}
							}

							//  Parse the modal HTML into a DOM element (in template form).
							var modalElementTemplate = angular.element(template);

							//  Compile then link the template element, building the actual element.
							//  Set the $element on the inputs so that it can be injected if required.
							var linkFn = $compile(modalElementTemplate);
							var modalElement = linkFn(modalScope);
							inputs.$element = modalElement;

							//  Create the controller, explicitly specifying the scope to use.
							var modalController = $controller(controllerName, inputs);

							//  Finally, append the modal to the dom.
							if (options.appendElement) {
								// append to custom append element
								options.appendElement.append(modalElement);
							} else {
								// append to body when no custom append element is specified
								body.append(modalElement);
							}

							//  We now have a modal object...
							var modal = {
								controller: modalController,
								scope: modalScope,
								element: modalElement,
								close: closeDeferred.promise
							};

							//  ...which is passed to the caller via the promise.
							deferred.resolve(modal);

						})
						.then(null, function(error) { // 'catch' doesn't work in IE8.
							deferred.reject(error);
						});

					return deferred.promise;
				};

			}

			return new ModalService();
		}
	])






.service('ImageSelect', function($q) {
	var $this = this;
	this.getPics = function(arr, count, i) {

		$this.getPictures(count).then(function(r) {

			if (i && i >= 0) {
				arr[i] = r[0];
			}
			//push
			else if (i === -2) {
				_.each(r, function(val, index) {
					arr.push(val);
				});

			}
			//all the pics
			else {
				_.each(r, function(val, index) {
					arr[index] = val;
				});
			}

		});
	};

	this.getPictures = function(count, isOrg) {
		var dfd = $q.defer(); 
		wx.ready(function() {
				wx.chooseImage({
			count: count > 0 ? count : 9,
			sizeType: isOrg ? ['original', 'compressed'] : ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function(res) {
				dfd.resolve(res.localIds);
			},
			fail: function(e) {
				dfd.reject();
				alert(JSON.stringify(e));
			}
		});		 
				});
		return dfd.promise;
	}

	// 拍照添加图片分享
	this.getCameraPicture = function() {



		}
		// 从相册添加图片分享
	this.getGalleryPicture = function(multi) {
		var dfd = $q.defer();
		console.log("从相册添加分享图片：");

		return dfd.promise;
	};




})


.service('IO', function($q, $http) {
		var $this = this;
		this.LIDsToUri = function(LIDs) {
			var dfd = $q.defer();
			if (!LIDs.length) {
				dfd.resolve([]);
			} else {
				$this.arrToServerID(LIDs).then(function(SIDs) {
					$this.SIDsToUri(SIDs).then(function(uris) {
						dfd.resolve(uris);
					})
				});
			}
			return dfd.promise;
		};
		this.SIDsToUri2 = function(arr) {
			var promises = [];
			_.each(arr, function(sid, i) {
				promises.push($this.SIDtoUri(sid));
			});
			return $q.all(promises);
		};
		this.SIDsToUri = function(sids) {
			var dfd = $q.defer();
			if (sids) {
				$http({
						method: 'GET',
						url: '/Handler/JSSDK.ashx?act=DownloadImage',
						params: {
							wxpid: window.wxpid,
							serverId: sids
						}
					})
					.then(function(r) {
						if (r.data.status === '0') {
							dfd.resolve(JSON.parse(r.data.msg));
						} else {
							dfd.reject();
						}
					});
			} else {
				dfd.resolve();
			}

			return dfd.promise;
		};
		this.SIDtoUri = function(sid) {

			var dfd = $q.defer();
			if (sid) {
				$http({
						method: 'GET',
						url: '/Handler/JSSDK.ashx?act=DownloadImage',
						params: {
							wxpid: window.wxpid,
							serverId: sid
						}
					})
					.then(function(r) {
						if (r.data.status === '0') {
							dfd.resolve(r.data.msg);
						} else {
							dfd.reject();
						}
					});
			} else {
				dfd.resolve();
			}

			return dfd.promise;
		};
		this.arrToServerID = function(arr) {
			var dfd = $q.defer();
			var result = [];

			var selfFn = function(i) {
				$this.strToServerID(arr[i]).then(function(r) {
					result.push(r);
					if (i !== (arr.length - 1)) selfFn(++i);
					else {
						dfd.resolve(result);
					}
				})
			}
			selfFn(0);

			return dfd.promise;
		}

		this.strToServerID = function(str) {
			var dfd = $q.defer();
			if (str) {
				wx.uploadImage({
					localId: str, // 需要上传的图片的本地ID，由chooseImage接口获得
					isShowProgressTips: 1, // 默认为1，显示进度提示
					success: function(res) {
						dfd.resolve(res.serverId); // 返回图片的服务器端ID
					}
				});
			} else {
				dfd.resolve();
			}
			return dfd.promise;
		}

		this.toUri = function(base64Str) {
			//&dir=image_msg_thumb
			var url = '/Handler/Filer.ashx?act=Upload&log_duserid=100022',
				fd = new FormData(),
				base64Body, dfd = $q.defer();

			base64Body = base64Str.substr(base64Str.indexOf(',') + 1);
			fd.append("imgFile", base64Body);
			fd.append("inputName", "imgFile");
			var xhr = new XMLHttpRequest();
			if (xhr.upload) {
				// 上传中
				xhr.upload.addEventListener("progress", function(e) {

				}, false);

				// 文件上传成功或是失败
				xhr.onreadystatechange = function(e) {
					if (xhr.readyState == 4 && xhr.status == 200) {
						var data = JSON.parse(xhr.responseText);
						if (data.error == 1) {
							dfd.reject(data.message);
						} else {
							dfd.resolve(data.url)
						}
					}
				};

				// 开始上传
				xhr.open("POST", url, true);
				xhr.send(fd);
			}
			return dfd.promise;
		};


	})
	//scan
	.service('QR', function($q, $http) {
		var $this = this;

		this.scan = function() {
			var dfd = $q.defer();
			wx.scanQRCode({
				needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
				scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
				success: function(res) {
					var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
					dfd.resolve(result);
				},
				fail: function(e) {
					dfd.reject(e);
				}
			});

			return dfd.promise;
		}



	})
	//oauth 
	.service('oauth', function($q, principal, $http, SERVICE_CONFIG) {
		var $this = this;



		// 注销登录 
		this.logoutAll = function() {
			$http({
					method: 'GET',
					url: '/handler/customer.ashx?act=AjaxLogOut',
					params: {
						log_duserid: SERVICE_CONFIG.DUserID
					}
				})
				.success(function(data) {
					location.href = "index.aspx"
				});
		};

	})
	//principal
	.factory('principal', ['$q', '$http',
		function($q, $http) {
			var _identity = undefined,
				_authenticated = false;

			return {
				getID: function() {
					return _identity;
				},
				isIdentityResolved: function() {
					return angular.isDefined(_identity);
				},
				isAuthenticated: function() {
					return _authenticated;
				},
				isInRole: function(role) {
					if (!_authenticated || !_identity.roles) return false;

					return _identity.roles.indexOf(role) != -1;
				},
				isInAnyRole: function(roles) {
					if (!_authenticated || !_identity.roles) return false;

					for (var i = 0; i < roles.length; i++) {
						if (this.isInRole(roles[i])) return true;
					}

					return false;
				},
				//    authenticate: function(identity) {
				//      _identity = identity;
				//      _authenticated = identity != null;
				//    },
				identity: function(forceToUpdate, account) {
					var deferred = $q.defer();
					if (forceToUpdate) _identity = undefined;
					if (angular.isDefined(_identity)) {
						deferred.resolve(_identity);

						return deferred.promise;
					}
					$http.get('/static/test/principal/?fakeid=' + account, {
							params: {
								wxpid: window.wxpid
							}
						})
						.success(function(data) {
							//fix sex
							data.Sex = !!data.Sex;
							var __authenticated = true,
								__identity = data;
							if (data.UserID < 1) {

								__authenticated = false;
							}
							_identity = __identity;
							_authenticated = __authenticated;
							deferred.resolve(_identity);
						})
						.error(function() {
							_identity = null;
							_authenticated = false;
							deferred.resolve(_identity);
						});

					return deferred.promise;
				}
			};
		}
	])
	//authorization
	.factory('authorization', ['$rootScope', '$state', 'principal', 'Login2Initial',
		function($rootScope, $state, principal, Login2Initial) {
			return {
				authorize: function() {
					return principal.identity()
						.then(function(_identity) {
							var isAuthenticated = principal.isAuthenticated();
							//$rootScope.toState.data.roles&& $rootScope.toState.data.roles.length > 0&& !principal.isInAnyRole($rootScope.toState.data.roles)

							$rootScope.returnToState = $rootScope.toState;
							$rootScope.returnToStateParams = $rootScope.toStateParams;

							if (isAuthenticated) {
								//login success init
								return Login2Initial.init(_identity);
								//$state.go($rootScope.returnToState,$rootScope.returnToStateParams);
							} else {
								//if ($rootScope.returnToState.name !== 'tab.login') $state.go('tab.login');

								var url = encodeURIComponent(encodeURIComponent(location.href));
								console.log('未登录');
								//location.href = "AuthUser.aspx?wxpid=" + window.wxpid + "&fromurl=" + url;
								location.href = "/weixin/login_happy.aspx?wxpid=" + window.wxpid + " &tkid=" + window.tkid + " &fromurl=" + url;
							}

						});
				}
			};
		}
	])
	.service('bitOP', [

		function() {
			this.AND = function(num1, num2, careBits) {
				num1 = parseInt(num1);
				num2 = parseInt(num2);
				for (var i = 0, l = careBits.length; i < l; i++) {
					var bitIndexOffset = careBits[i] - 1;
					var tmp1 = num1 & (1 << bitIndexOffset);
					var tmp2 = num2 & (1 << bitIndexOffset);
					if (tmp1 !== tmp2)
						return false;

				}


				return true;
			};
		}
	])
	.service('geo', [
		'$q', '$http',
		function($q, $http) {
			var remote_ip_info;
			this.getIPGeo = function() {
				var dfd = $q.defer();
				if (!remote_ip_info) {
					var new_script = document.createElement("SCRIPT");
					new_script.src = "http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js";
					document.getElementsByTagName("body")[0].appendChild(new_script);
					new_script.onload = function() {
						var readyState = new_script.readyState;
						if ('undefined' == typeof readyState || readyState == "loaded" || readyState == "complete") {
							try {
								remote_ip_info = window.remote_ip_info
								dfd.resolve(remote_ip_info.city);
							} finally {
								new_script.onload = null;
							}
						}
					};
				} else {
					dfd.resolve(remote_ip_info.city);
				}

				return dfd.promise;
			};
		}
	])
	.service('Region', [
		'$q', '$http',
		function($q, $http) {
			var data, $this = this;
			this.orderHotkey = [10134, 10182, 10111, 10150, 10135, 10144, 10145, 10152, 10162, 10113, 10123, 10141, 10142, 10143, 10146, 10122, 10132, 10136, 10121, 10115, 10164, 10163, 10114, 10131, 10137, 10151, 10161, 10112, 10171, 10154, 10165, 10181, 10153, 10133];
			this.getParents = function(region) {
				if (!data) {
					return false;
				}
				var tmp = region + "",
					len = tmp.length,
					r = {};

				while (len >= 5) {
					var item = parseInt(tmp.substring(0, len));
					r[len] = item;
					len -= 2;
				}
				return r;
			};
			this.getRegion = function() {
				var dfd = $q.defer();
				if (!data) {
					$http({
							method: 'GET',
							url: "others/region.json",
						})
						.then(function(result) {
							data = result.data;
							dfd.resolve(data);
						});
				} else {
					dfd.resolve(data);
				}
				return dfd.promise;
			};
			this.getAny = function(id) {
				if (!id) return;
				var len = id.toString().length;
				if (len === 5) {
					return data[id];
				} else if (len === 7) {
					return data[String.prototype.substring.apply(id, [0, 5])].child[id];
				} else if (len === 9) {
					return data[String.prototype.substring.apply(id, [0, 5])].child[String.prototype.substring.apply(id, [0, 7])].child[id];
				}
			};
			this.getAll = function(id) {
				if (!id) return;
				var r = [],
					len = id.toString().length;

				while (len > 3) {
					var tmp = String.prototype.substring.apply(id, [0, len]);
					r.push($this.getAny(tmp));
					len -= 2;
				}
				return r;
			};
			this.getAllText = function(id, noReverse) {
				if (!id) return;
				var all = $this.getAll(id);
				return _.pluck(all.reverse(), 'RegionName');
			};


			//alias getChild
			this.isDirect = function(any) {
				return _.keys(any.child).length === 0;
			}


		}
	])
	.service('Time', [
		'$q',
		function($q) {
			var $this = this;
			this.buildDate = function(date, time) {
				return new Date(date.getFullYear(), date.getMonth() + 1, date.getDate(), time.getHours(), time.getMinutes()).getTime();
			};

		}
	])
	.service('WX', [
		'$q', '$filter',
		function($q, $filter) {
			var $this = this;
			this.share = function(shareData) {

				//	        imgUrl: "http://ycs.ohapp.com/weixin/Interaction/yb/fengmian.png",
				//	        link: "http://ycs.ohapp.com/weixin/Interaction/yb/index.aspx",
				//	        title: "中秋到了，友佳乐商城吃月饼大赛开始了！",
				//	        desc: "友佳乐商城邀请您一起来吃月饼！"
				if (shareData.imgUrl.indexOf('http') === -1) {
					shareData.imgUrl = location.origin + shareData.imgUrl;
				}
				shareData.success = shareData.success || function() {
					console.log('分享成功')
				};

				window.wx.ready(function() {
					window.wx.onMenuShareAppMessage(shareData);
					window.wx.onMenuShareTimeline(shareData);
				});
			};
			this.openCarousel = function(srcs) {
				var srcs2 = $filter('setOriginSuffix')(srcs);
				window.wx.previewImage({
					current: srcs2[0],
					urls: srcs2
				});
			};

		}
	])

.filter("chInt", function(principal) {
		var temp = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
		var filterfun = function(num) {
			//  	var newArr=[]; 
			//  	_.each(int+"",function(num,i){
			//  		newArr[i]=temp[num];
			//  	})

			return temp[num];
		}
		return filterfun;
	})
	.filter("setOriginSuffix", function() {
		var filterfun = function(srcs) {
			var srcs2 = _.clone(srcs);
			_.each(srcs2, function(src, i) {
				if (srcs2[i].indexOf('http') === -1) {
					srcs2[i] = location.origin + srcs2[i];
				}
			});
			return srcs2;
		}
		return filterfun;
	})
	.filter("setCSD", function(principal) {
		var filterfun = function(obj, newOBj) {
			var obj2;
			if (newOBj) {
				obj2 = _.clone(obj);
			} else {
				obj2 = obj;
			}
			var ID = principal.getID();
			obj2.SUserID = ID.SUserID;
			obj2.CUserID = ID.CUserID;
			obj2.DUserID = ID.DUserID;
			obj2.LOG_DUserID = ID.DUserID;
			//obj2.ContactID = ID.ContactID;

			return obj2;
		}
		return filterfun;
	})
	.filter("setSD", function(principal) {
		var filterfun = function(obj, newOBj) {
			var obj2;
			if (newOBj) {
				obj2 = _.clone(obj);
			} else {
				obj2 = obj;
			}
			var ID = principal.getID();
			obj2.SUserID = ID.SUserID;
			obj2.DUserID = ID.DUserID;
			obj2.LOG_DUserID = ID.DUserID;
			//obj2.ContactID = ID.ContactID;

			return obj2;
		}
		return filterfun;
	})

.filter("getKeyName", function() {
		var filterfun = function(obj, notDelZero) {
			obj2 = _.clone(obj);
			window.clearAllEmptyKeys(obj2, notDelZero);
			//window.pascalStyle(obj2); 
			var keyName = '';
			var arr = _.keys(obj2).sort();
			_.each(arr, function(item, i) {
				if (!obj2[item]) {
					return false;
				}
				if ((i + 1) === arr.length) {
					keyName += item + '=' + obj2[item];
				} else {
					keyName += item + '=' + obj2[item] + '&';
				}

			})
			return keyName || 'all';
		};
		return filterfun;
	})
	.filter("setMC", function(MODULECODE_CONFIG) {
		var filterfun = function(obj, className, publish) {
			obj2 = _.clone(obj);
			if (publish) {
				obj2.KeyValue = MODULECODE_CONFIG[className];
				obj2.KeyType = MODULECODE_CONFIG[className];
			} else {
				obj2.MCode = MODULECODE_CONFIG[className] + '=' + MODULECODE_CONFIG[className];
			}

			return obj2;
		}
		return filterfun;
	})
	.filter("setTableSuffix", function() {
		var filterfun = function(obj, str) {
			var tableObj = {};
			var str2 = str + '_';
			for (key in obj) {
				if (key.indexOf(str) === 0) {
					continue;
				}
				tableObj[str2 + key] = obj[key]
			}
			return tableObj;
		};
		return filterfun;
	});
window.clearEmptyKeys = function(obj) {
	for (var key in obj) {
		if (obj[key] === undefined) {
			delete obj[key]
		}
	}
};

window.clearAllEmptyKeys = function(obj, notDelZero) {
	for (var key in obj) {
		if (!obj[key]) {
			delete obj[key]
		}
	}
 
		for (var key in obj) {
			if( _.contains(notDelZero, key)) continue;
			if ( obj[key] * 1===0 ) {
				delete obj[key]
			}
		}
 
};
window.pascalStyle = function(obj) {
	for (var key in obj) {
		var v = obj[key];
		var nKey = key.replace(/\s[a-z]/g, function($1) {
			return $1.toLocaleUpperCase()
		}).replace(/^[a-z]/, function($1) {
			return $1.toLocaleUpperCase()
		});
		delete obj[key]
		obj[nKey] = v;
	}
};