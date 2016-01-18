angular.module('starter.services', [])

.service('Profile', function($http, $q, principal, $filter, USER_CONFIG) {
	var $this = this;
	this.phase = {};
	this.czPage = "/pay/wx_cz_person.aspx?wxpid=" + window.wxpid;
	this.synPage = "others/getWXInfo.aspx?scope=snsapi_userinfo&wxpid=" + window.wxpid;
	this.isVIP = function() {
		if (this.info.UserTypes === ',' || this.info.UserTypes === '') {
			return false;
		}
		return this.info.UserTypes && (this.info.UserTypes.indexOf(USER_CONFIG.BS) > -1);
		//return true; 
	}; 
	this.isV3 = function() {
		return  !!this.info.V3;
	}; 
	this.edit = function(detail) {
		var p = $filter('setTableSuffix')(detail, 'Contact');
		var p2 = $filter('setCSD')(p, 'new');
		p2.ContactID = $this.info.ContactID;
		var dfd = $q.defer();
		$http.post("/handler/customer.ashx?&act=ContactEdit", p2)
			.then(function(r) {
				var result = r.data;
				if (result.status === "0") {
					dfd.resolve();
				} else {
					dfd.reject();
					alert(result.msg);
				}
			});
		return dfd.promise;
	};
	this.bindPhone = function(params) {
		params.vtype = 'bind';
		var p2 = $filter('setSD')(params);
		var dfd = $q.defer();
		$http.post("/handler/exbcustomer.ashx?act=BindCellPhone", p2)
			.then(function(r) {
				var result = r.data;
				if (result.status === "0") {
					$this.info.CellPhone = params.CellPhone;
					dfd.resolve();
				} else {
					dfd.reject();
					alert(result.msg);
				}
			});
		return dfd.promise;
	};
	this._getInfo = function() {
		$this.info = principal.getID();
	};




})

.service('MsgBoard', function($q, $timeout, $http, MSGBOARD_CONFIG) {
	this.data = MSGBOARD_CONFIG.data;
	var allBoards = this.data.subs.concat(this.data.boards);
	this.get = function(boardNo) {
		var dfd = $q.defer();
		var r = _.find(allBoards, function(b) {
			return b.BoardNo === boardNo;
		});
		dfd.resolve(r)
		return dfd.promise;
	};
})


.service('Fav', function($q, $http, $timeout, $filter, TYPE_CONFIG, Profile) {
		var $this = this;
		this.phase = {};
		this.data = [];

		function _setData(items) {
			if (items.length) {

				_.each(items, function(item, index, list) {
					if (!!_.findWhere($this.data, {
							FavID: item.FavID
						})) {
						return false;
					} else {
						$this.data.push(item);
					}
				});
			}


			return $this.data;
		}
		this.add2MsgFav = function(msg) {
			if (msg.IsFav) {
				return false;
			} else {
				msg.IsFav = true;
				msg.Star += 1;
				msg.favs && msg.favs.push({
					Title: Profile.info.FirstName,
					Pic: Profile.info.Avatar
				});
				var params = {
					ObjectID: msg.MsgID,
					Title: Profile.info.FirstName,
					Pic: Profile.info.Avatar,
					TypeID: TYPE_CONFIG.Fav.Msg
				};
				$http({
						method: 'GET',
						url: "/Handler/Actions.ashx?act=Add2Fav2" + '&t=' + Math.random(),
						params: $filter('setCSD')(params, 'new')
					})
					.then(function(response) {
						var result = response.data;
						//	alert(JSON.stringify(result)); 
						if (result.status !== '0') {
							msg.favs && msg.favs.splice(-1, 1);
							msg.Star -= 1;
							//msg.IsFav = false;
							if (result.status == 593503)
								alert('已经点过赞了');
							else
								alert(result.msg);

						} else {
							var score = result.code * 1;
							if (score) {
								Profile.info.Score2 += score;
								var newPoint = Profile.info.Score2 + Profile.info.Score3 + Profile.info.Score4 + (Profile.info.V3 ? 5 : 0);
								alert('获得' + score + '点积分,当前总计' + newPoint + '点');

							} else {
								alert('多多点赞，一大堆红包等你拿');
							}
						}

					});
			}
		};
		this.getMsgFavs = function(msg) {
			var dfd = $q.defer();
			if (msg.favs) {
				dfd.resolve();
			} else {
				$this.query({
					pageSize: 20,
					typeID: TYPE_CONFIG.Fav['Msg'],
					ObjectID: msg.MsgID
				}, true).then(function() {
					msg.favs = _.filter($this.data, function(fav) {
						return fav.TypeID === TYPE_CONFIG.Fav['Msg'] && fav.ObjectID === msg.MsgID;
					});
					//is fav
					msg.IsFav = _.find(msg.favs, function(fav) {
						return fav.UserID === Profile.info.CUserID;
					});
					dfd.resolve();
				});
			}
			return dfd.promise;
		};
		this.getAllFavs = function(className) {
			return $this.query({
				pageSize: 1000,
				typeID: TYPE_CONFIG.Fav[className],
				userid: Profile.info.CUserID
			}, true);
		};
		this.get = function(ID) {
			var dfd = $q.defer();
			var r = _.findWhere($this.data, {
				FavID: ID
			});
			if (r) dfd.resolve(r)

			else {
				$this.query({
					FavID: ID
				}, true).then(function() {
					var r = _.findWhere($this.data, {
						FavID: ID
					});
					if (r) dfd.resolve(r)
				});
			}
			return dfd.promise;
		};
		this.query = function(params, force) {
			var dfd = $q.defer();
			if ((!force) && $this.phase.query && $this.phase.query.state === 0) {
				dfd.reject();
			} else {
				$this.phase.query = dfd.promise;
				$http({
						method: 'GET',
						url: "/static/test/Fav/",
						params: $filter('setCSD')(params, 'new')
					})
					.then(function(result) {
						dfd.resolve(_setData(result.data.data));
					});

			}

			return dfd.promise;
		};
	})
	.service('CustomerEx', function($q, $http, $filter, Fav, TYPE_CONFIG, Profile, USER_CONFIG) {

		var $this = this,
			allFavs, PageNum = {};
		this.phase = {};
		this.data = [];
		this.pageData={};
		this.IsLast = {};

		function _getFav() {
			allFavs = allFavs || _.filter(Fav.data, function(fav) {
				return fav.TypeID === TYPE_CONFIG.Fav.Customer && fav.UserID === Profile.info.CUserID;
			});
		}

		function _bindFav(customer) {
			_getFav();
			customer.IsFav = !!_.find(allFavs, function(fav) {
				return customer.CustomerID === fav.ObjectID;
			});
		}

		function _setData(items) {
			if (items.length) {
				var thePage=[];
				_.each(items, function(item, index, list) {
					var tmp;
					if (tmp = _.findWhere($this.data, {
							CustomerID: item.CustomerID
						})   ) {
							if(!(item.FirstName || item.Avatar)){
								return false;
							} 
							thePage.push(tmp);
					} else {
						//fix Sex
						item.Sex = !!item.Sex;
						item.Avatar = item.Avatar || 'http://c.hiphotos.baidu.com/zhidao/pic/item/e850352ac65c1038d99c2ffbb1119313b07e892d.jpg';
						//add isTeam
						item.isTeam = item.UserTypes.indexOf(USER_CONFIG.BS) > -1;
						// bind fav key
						_bindFav(item);
						$this.data.push(item);
						thePage.push(item);
					}
				});
			}

			return thePage;
		}

		this.nextPage = function(paramsCe) {
			var keyName = $filter('getKeyName')(paramsCe),
				paramsCe = _.clone(paramsCe),
				next_page = PageNum[keyName] ? ++PageNum[keyName] : PageNum[keyName] = 1,
				params = _.extendOwn(paramsCe, {
					page: next_page
				});

			return $this.query(params).then(function(thePage) {
				$this.pageData[keyName]=$this.pageData[keyName]||[]; 
				$this.pageData[keyName]=$this.pageData[keyName].concat(thePage); 
			}, function() {
				$this.IsLast[keyName] = true;
				PageNum[keyName] -= 1;
			})

		};
		this.get = function(param) {
			window.clearAllEmptyKeys(param);
			var dfd = $q.defer();
			var r = _.findWhere($this.data, param);

			if (r) dfd.resolve(r)

			else {
				console.log('没data');
				$this.query(param, true).then(function() {
					var r = _.findWhere($this.data, param);
					if (r) dfd.resolve(r)
				});
			}
			return dfd.promise;
		};
		this.getByCUID = function(id) {
			return $this.get({
				CUserID: id
			});
		};
		this.getByCMID = function(id) {
			return $this.get({
				CustomerID: id
			});
		};
		this.query = function(params, force) {
			var dfd = $q.defer();
			if ((!force) && $this.phase.query && $this.phase.query.state === 0) {
				dfd.reject();
			} else {
				$this.phase.query = dfd.promise;
				var newParams = $filter('setSD')(params, 'new');
				$http({
						method: 'GET',
						url: "/static/test/Customer/",
						params: newParams
					})
					.then(function(result) {
						var r = result.data;
						if (r.Count) {
							dfd.resolve(_setData(r.data));
						} else {
							dfd.reject(r);
						}
					});

			}

			return dfd.promise;
		};
		this.add2Fav = function(customer) {
			customer.IsFav = true;
			var params = {
				ObjectID: customer.CustomerID,
				TypeID: TYPE_CONFIG.Fav.Customer
			};
			$http({
					method: 'GET',
					url: "/Handler/Actions.ashx?act=Add2Fav2" + '&t' + Math.random(),
					params: $filter('setCSD')(params)
				})
				.then(function(response) {
					var result = response.data;
					if (result.status !== '0') {
						if (result.status !== '593503') {
							customer.IsFav = false;
						}
						if (result.status == 593503)
							alert('他已经是你的好友了');
						else
							alert(result.msg);
					} else {
						alert('添加好友成功');
					}

				});
		};
		this.queryTkOnce = (function() {
			var OnceFN = function() {
				return $this.query({
					ReferID: Profile.info.UserID,
					PageSize: 1000
				});
			};
			return _.once(OnceFN)
		}());
		this.getsByC = function(cids) {
			var dfd = $q.defer(),
				old = _.pluck($this.data, 'CUserID'),
				cids2 = _.difference(cids, old);
			if (cids2.length) {
				$http.get('/static/test/customer/getsByC.aspx', {
						params: {
							CUserID: cids2
						}
					})
					.then(function(response) {
						var result = response.data;
						if (result.data) {
							dfd.resolve(_setData(result.data));
						}
					});
			} else {
				dfd.resolve();
			}

			return dfd.promise;
		}
		this._favFix = function() {
			_getFav();
			var cmids = _.pluck(allFavs, 'ObjectID');
			var dfd = $q.defer();

			$http.get('/static/test/customer/favFix.aspx', {
					params: {
						CustomerID: cmids
					}
				})
				.then(function(response) {
					var result = response.data;
					if (result.data) {
						dfd.resolve(_setData(result.data));
					}
				});
			return dfd.promise;
		};
		this.favFixOnce = _.once($this._favFix);
	})





.service('Msg', function($q, $timeout, $http, MsgBoard, $filter, TYPE_CONFIG, Profile, CustomerEx) {
	var $this = this,
		PageNum = {};
	this.phase = {};
	this.data = [];
	this.IsLast = {};

	function _setData(items, unshift) {
		var promises = [];
		if (items.length) {
			promises.push($this._getsMsgsC(items));

			_.each(items, function(item, index, list) {
				if (!!_.findWhere($this.data, {
						MsgID: item.MsgID
					}) || item.CUserID === 0) {
					return false;
				} else {
					//fix files , isMine
					item.isMine = item.CUserID === Profile.info.CUserID;
					item.Remark = [];
					item.Sub = [];
					item.tags = [];
					try {
						//[{t:'text',v:妹纸}，｛t:boardno,v:12345｝] 
						item.Tags = JSON.parse(item.Tags) || [];
						_.each(item.Tags, function(obj, i) {
							if (obj.t === 'text') {
								var tag = {
									"text": obj.v
								};
								item.tags.push(tag);
							} else {
								var board = {
									"boardNo": obj.v * 1
								};
								MsgBoard.get(obj.v * 1).then(function(r) {
									board.BoardName = r.BoardName;
								});
								item.Sub.push(board);
							}
						});
					} catch (e) {
						item.Tags = [];
						item.Sub = [];
						item.tags = [];
					}
					if (item.Subject) {
						item.Subject = item.Subject.split('||')[0];
					} else {
						item.Subject = item.Detail.substring(0, 8);
					}
					try {
						var start = item.AttachFiles.indexOf('['),
							end = item.AttachFiles.indexOf(']');
						item.AttachFiles = JSON.parse(item.AttachFiles.substring(start, end + 1));
					} catch (e) {
						console.log(e);
						item.AttachFiles = ['images/zanwu.jpg'];

					}

					if (item.AttachFiles.length) {
						var qq = $('<img/>'),
							dfd = $q.defer();
						promises.push(dfd.promise);
						qq.attr('src', item.AttachFiles[0]).load(function() {
							item.fstScale = (qq[0].height / qq[0].width) || 0;
							if (!_.findWhere($this.data, {
									MsgID: item.MsgID
								})) {
								unshift ? $this.data.unshift(item) : $this.data.push(item);
							}
							dfd.resolve();
						}).error(function() {
							item.fstScale = 0;
							unshift ? $this.data.unshift(item) : $this.data.push(item);
							dfd.resolve();
						});
					} else {
						item.fstScale = 0;
						unshift ? $this.data.unshift(item) : $this.data.push(item);
					}


				}
			});
		}


		return $q.all(promises);
	}
	this.nextPage = function(paramsCe, pageSize) {
		var keyName = $filter('getKeyName')(paramsCe),
			paramsCe = _.clone(paramsCe),
			next_page = PageNum[keyName] ? ++PageNum[keyName] : PageNum[keyName] = 1,
			params = _.extendOwn(paramsCe, {
				page: next_page,
				//pageSize: pageSize || 18
				pageSize: 18
			});

		return $this.query(params).then(function() {}, function() {
			$this.IsLast[keyName] = true;
			PageNum[keyName] -= 1;
		})

	};
	this.get = function(ID) {
		var dfd = $q.defer();
		var r = _.findWhere($this.data, {
			MsgID: ID
		});
		if (r) dfd.resolve(r)

		else {
			$this.query({
				MsgID: ID
			}, true).then(function() {
				var r = _.findWhere($this.data, {
					MsgID: ID
				});
				if (r) dfd.resolve(r)
			});
		}
		return dfd.promise;
	};
	this.query = function(params, force, noPage) {
		var dfd = $q.defer();
		if ((!force) && $this.phase.query && $this.phase.query.state === 0) {
			dfd.reject();
		} else {
			params = _.clone(params);
			params.TagName ? params.Tag = params.TagName :
				params.Sub ? params.Tag = params.Sub : 0;
			delete params.Sub;
			delete params.TagName;
			if (!(params.BoardNo * 1)) {
				params.BoardNo = -1;
			} 
			var params2 = $filter('setSD')(params);

			$this.phase.query = dfd.promise;
			$http({
					method: 'GET',
					url: noPage ?"/static/test/Msg/noPage.aspx" : "/static/test/Msg/",
					params: params2
				})
				.then(function(result) {
					var r = result.data;
					if (r.data.length) {
						_setData(r.data).then(function() {
							dfd.resolve();
						});

					} else {
						dfd.reject(r);
					}
				});

		}

		return dfd.promise;
	};
	this.delete = function(ID) {
		var p = {
				MsgID: ID
			},
			CSD = $filter('setCSD')(p, 'new'),
			msgIndex = _.findIndex($this.data, {
				MsgID: ID
			});
		var dfd = $q.defer();
		if (msgIndex === -1) {
			alert('处理中');
			dfd.reject();
		} else {
			$this.data.splice(msgIndex, 1);
			$http.post('/handler/exbCustomer.ashx?act=MsgDestroy', CSD)
				.then(function(response) {
					var result = response.data;
					if (result.status === '0') {
						alert('删除成功');
						dfd.resolve();
					} else {
						alert(result.msg);
						dfd.reject();
					}
				});
		}


		return dfd.promise;
	};

	this._getsMsgsC = function(msgs) {
		var cids = _.uniq(_.pluck(msgs, 'CUserID'));
		return CustomerEx.getsByC(cids);
	};
	this.getsOnes = function(cid, pageSize) {
		var dfd = $q.defer();
		var r = $filter('filter')($this.data, function(msg) {
			return msg.CUserID === cid;
		}).slice(0, pageSize);
		if (r.length < pageSize) {
			
			$this.query({
				CUserID: cid,
				top:6
			}, true,true).then(function() {
				var r2 = $filter('filter')($this.data, function(msg) {
					return msg.CUserID === cid;
				}).slice(0, pageSize);
				dfd.resolve(r2);
			});


		} else {
			dfd.resolve(r);
		}
		return dfd.promise;
	};
	this.getsSubs = function(subNo, pageSize) {
		var dfd = $q.defer();
		var r = $filter('filter')($this.data, function(msg) {
			return msg.BoardNo === subNo;
		}).slice(0, pageSize);
		if (r.length < pageSize) {
			$this.query({
				Sub: subNo,
				top:6
			}, true,true);
		} else {
			dfd.resolve(r);
		}
		return dfd.promise;
	};
	this.edit = function(msgDetail0) {
		var msgDetail = _.clone(msgDetail0);
		delete msgDetail.Star;
		delete msgDetail.isMine;
		delete msgDetail.avatar;
		delete msgDetail.fstScale;
		//construct Tags
		msgDetail.Tags = [];
		//sub 
		_.each(msgDetail.Sub, function(sub) {
			msgDetail.Tags.push({
				t: 'boardNo',
				v: sub.boardNo
			});
		});
		delete msgDetail.Sub;
		//tags
		_.each(msgDetail.tags, function(tag, i) {
			msgDetail.Tags.push({
				t: 'text',
				v: tag.text
			});
		});
		delete msgDetail.tags;
		msgDetail.Tags = JSON.stringify(msgDetail.Tags);
		var dfd = $q.defer(); 
		msgDetail.AttachFiles = JSON.stringify(msgDetail.AttachFiles);

		var CSDMC = $filter('setCSD')($filter('setMC')(msgDetail, 'Gallery', 'publish'), 'new');
		var msgDetailSuffix = $filter('setTableSuffix')(CSDMC, 'msg');
		msgDetailSuffix.LOG_DUserID = msgDetailSuffix.msg_LOG_DUserID;
		msgDetailSuffix.MsgID = msgDetailSuffix.msg_MsgID;
		delete  msgDetailSuffix.msg_MsgID;
		$http.post('/handler/exbCustomer.ashx?act=MsgEdit', msgDetailSuffix)
			.then(function(response) {
				var result = response.data;
				if (result.status === '0') {
					dfd.resolve();
				} else {
					alert(result.msg);
					dfd.reject();
				}
			});
		return dfd.promise;
	};

	this.publish = function(msgDetail0) {
		var msgDetail = _.clone(msgDetail0);
		var dfd = $q.defer();

		msgDetail.AttachFiles = JSON.stringify(msgDetail.AttachFiles);

		msgDetail.Tags = [];
		//subItem
		if (msgDetail.subItem)
			msgDetail.Tags.push({
				t: 'boardNo',
				v: msgDetail.subItem
			});
		delete msgDetail.subItem;
		//tags
		_.each(msgDetail.tags, function(tag, i) {
			msgDetail.Tags.push({
				t: 'text',
				v: tag.text
			});
		});
		delete msgDetail.tags;
		msgDetail.Tags = JSON.stringify(msgDetail.Tags);


		var CSDMC = $filter('setCSD')($filter('setMC')(msgDetail, 'Gallery', 'publish'), 'new');
		var msgDetailSuffix = $filter('setTableSuffix')(CSDMC, 'msg');

		$http.post('/handler/actions.ashx?act=LeaveMsg', msgDetailSuffix)
			.then(function(response) {
				var result = response.data;
				if (result.status === '0') {
					msgDetail.MsgID = result.code * 1;
					msgDetail.Star = 0;
					msgDetail.CUserID = Profile.info.CUserID;
					_setData([msgDetail], true).then(function() {
						dfd.resolve();
					});

				} else {
					alert(result.msg);
					dfd.reject();
				}
			});
		return dfd.promise;
	};
})

.service('Adv', function($q, $timeout, $http, $filter, TYPE_CONFIG, Profile) {
	var $this = this,
		PageNum = {};
	this.phase = {};
	this.data = window.indexAdvs;
	this.IsLast = {};

	function _setData(items, unshift) {
		if (items.length) {

			_.each(items, function(item, index, list) {
				if (!!_.findWhere($this.data, {
						AdvID: item.AdvID
					})) {
					return false;
				} else {
					unshift ? $this.data.unshift(item) : $this.data.push(item);
				}
			});
		}


		return $this.data;
	}
	this.nextPage = function(paramsCe) {
		var keyName = $filter('getKeyName')(paramsCe),
			paramsCe = _.clone(paramsCe),
			next_page = PageNum[keyName] ? ++PageNum[keyName] : PageNum[keyName] = 1,
			params = _.extendOwn(paramsCe, {
				page: next_page
			});

		return $this.query(params).then(function() {}, function() {
			$this.IsLast[keyName] = true;
			PageNum[keyName] -= 1;
		})

	};
	this.get = function(ID) {
		var dfd = $q.defer();
		var r = _.findWhere($this.data, {
			AdvID: ID
		});
		if (r) dfd.resolve(r)

		else {
			$this.query({
				AdvID: ID
			}, true).then(function() {
				var r = _.findWhere($this.data, {
					AdvID: ID
				});
				if (r) dfd.resolve(r)
			});
		}
		return dfd.promise;
	};
	this.query = function(params, force) {
		var dfd = $q.defer();
		if ((!force) && $this.phase.query && $this.phase.query.state === 0) {
			dfd.reject();
		} else {
			var params2 = $filter('setSD')(params);
			$this.phase.query = dfd.promise;
			$http({
					method: 'GET',
					url: "/static/test/Adv/",
					params: params2
				})
				.then(function(result) {
					var r = result.data;
					if (r.data.length) {
						dfd.resolve(_setData(r.data));
					} else {
						dfd.reject(r);
					}
				});

		}

		return dfd.promise;
	};



})


.service('PayAccount', function($q, $timeout, $http, $filter, principal, Profile, PAYWAYNO_CONFIG) {
		var $this = this;
		this.data = [];
		this.payWayNoCode = PAYWAYNO_CONFIG;

		function _setData(items) {
			if (items.length) {
				_.each(items, function(item, index, list) {
					if (!!_.findWhere($this.data, {
							PAID: item.PAID
						})) {
						return false;
					} else {
						$this.data.push(item);
					}

				});
			}
			return $this.data;
		}

		this.get = function(ID) {
			var dfd = $q.defer();
			var r = _.findWhere($this.data, {
				PAID: ID
			});
			if (r) dfd.resolve(r)

			else {
				dfd.reject(r)
			}
			return dfd.promise;
		};
		this.query = function(params, force) {
			var dfd = $q.defer();
			var params2 = $filter('setSD')(params);
			$http({
					method: 'GET',
					url: "/static/test/payAccount/",
					params: params2
				})
				.then(function(result) {
					var r = result.data;
					dfd.resolve(_setData(r.data));
				});


			return dfd.promise;
		};
		this.getAll = function(params, force) {
			return this.query(params, false).then(function() {
				var r = _.find($this.data, function(ac) {
					return ac.PayWayNo == $this.payWayNoCode.Wx;
				});
				if (!r) {
					return $this.newWX();
				}
			});
		};
		this.getAllOnce = _.once(this.getAll);
		this.newWX = function() {
			var account = {}
			account.CardNo = Profile.info.FUserID;
			account.Outeruser = Profile.info.FUserID;
			account.PayWayNo = $this.payWayNoCode.Wx;
			account.Bank = "微信支付";
			account.Title = Profile.info.FirstName || Profile.info.LastName || 'FLNull';
			account.FullName = Profile.info.FirstName || Profile.info.LastName || 'FLNull';
			return $this.editCard(account).then(function() {
				console.log('自动新增微信payaccount');
				console.log($this.data);
			});
		}
		this.editCard = function(account) {
			var dfd = $q.defer();

			var fixID = account.PAID,
				accountSuffix = $filter('setTableSuffix')(account, 'payAccount'),
				params2 = $filter('setCSD')(accountSuffix, 'new');
			if (fixID) {
				params2.PAID = fixID
			}
			$http.post("/handler/customer.ashx?act=PayAccountEdit", params2)
				.then(function(result) {
					var r = result.data;
					if (r.status === '0') {
						if (account.PAID) { 
							var old=  _.find($this.data,{PAID:account.PAID});
							if(old){
							angular.extend(old,account);
							dfd.resolve();
							}else{
								alert('更新出错,稍后再试');
								dfd.reject();
							}
						} else {
							$this._PAIDFix().then(function(id) {
								account.UserID = Profile.info.UserID;
								account.PAID = id;
								dfd.resolve(_setData([account]));
							});
						}
					} else {
						alert(r.msg);
						dfd.reject();
					}

				});
			return dfd.promise;
		};
		this._PAIDFix = function() {
			var params2 = $filter('setSD')({});
			var dfd = $q.defer();
			$http({
					method: 'GET',
					url: "/static/test/payAccount/",
					params: params2
				})
				.then(function(result) {
					var r = result.data;
					dfd.resolve(r.data[0].PAID);
				});
			return dfd.promise;
		};
		this.withdrawWx = function(id, amount) {
			var ac = _.find($this.data, function(ac) {
				return ac.PayWayNo == $this.payWayNoCode.Wx;
			});
			return $this.withdraw(ac.PAID, amount);
		};
		this.withdraw = function(id, amount) {
			var dfd = $q.defer();
			//var back = Profile.consume(amount, 'Deposit');
			//	if (back) {
			var param = $filter('setTableSuffix')({
				PAID: id,
				SPAID: 46,
				safepwd: Profile.info.Cipher2,
				amount: amount
			}, 'withdraw');
			var params2 = $filter('setSD')(param);

			$http.post("/handler/exbcustomer.ashx?act=Withdraw", params2)
				.then(function(result) {
					var r = result.data;
					console.log(JSON.stringify(r));
					if (r.status === '0') {
						//Profile.info.Deposit-=amount;
						dfd.resolve();
					} else {
						//back
						//back();  
						alert(r.msg);

						dfd.reject();
					}
				});
			//		} else {
			//			alert('金额不足');
			//			dfd.reject();
			//		}

			return dfd.promise;
		};
		this.getWayName=function(wayNo){
			if(wayNo===50025){
				return "微信钱包";
			}else{
				return "支付宝钱包";
			}
		};
	})
	.service('PaidRecord', function($q, $http, $filter, Profile) {

		var $this = this,
			PageNum = {};
		this.phase = {};
		this.data = [];
		this.IsLast = {};


		function _setData(items) {
			if (items.length) {
				_.each(items, function(item, index, list) {
					if (!!_.findWhere($this.data, {
							PaidID: item.PaidID
						})) {
						return false;
					} else {
						$this.data.push(item);
					}
				});
			}
			return $this.data;
		}

		this.get = function(ID) {
			var dfd = $q.defer();
			var r = _.findWhere($this.data, {
				PaidID: ID
			});
			if (r) dfd.resolve(r)

			else {
				dfd.reject(r)
			}
			return dfd.promise;
		};
		this.nextPage = function(paramsCe) {


			var keyName = $filter('getKeyName')(paramsCe, ['PayType']),
				paramsCe = _.clone(paramsCe),
				next_page = PageNum[keyName] ? ++PageNum[keyName] : PageNum[keyName] = 1,
				params = _.extendOwn(paramsCe, {
					page: next_page
				});

			return $this.query(params).then(function() {}, function() {
				$this.IsLast[keyName] = true;
				PageNum[keyName] -= 1;
			})

		};
		this.query = function(params, force) {
			var dfd = $q.defer();
			if ((!force) && $this.phase.query && $this.phase.query.state === 0) {
				dfd.reject();
			} else {
				$this.phase.query = dfd.promise;
				$http({
						method: 'GET',
						url: "/static/test/PaidRecord/",
						params: params
					})
					.then(function(result) {
						var r = result.data;
						if (r.data.length) {
							dfd.resolve(_setData(r.data));
						} else {
							dfd.reject(r);
						}
					});

			}

			return dfd.promise;
		};




	})
	.service('Login2Initial', function($q, $timeout, Fav, Adv, Profile, PayAccount, Region) {
		var initialize = _.once(function(data) {
			//alert('loginit')
			var secondP = [];
			//info 
			Profile._getInfo();
			window.info = Profile.info;
			secondP.push(Fav.getAllFavs('Customer'));
			//secondP.push(PayAccount.getAll({}));
			secondP.push(Region.getRegion());
			return $q.all(secondP);
		});
		this.init = initialize;


	})
	.factory("tabsCtrlInitialData", function($q, authorization, oauth, Msg, CustomerEx) {

		return function() {
			var authorize = authorization.authorize();


			return $q.all([authorize]).then(function(results) {
				return {
					authorize: 1
				};
			});
		}
	});