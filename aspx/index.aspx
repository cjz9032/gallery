<%@ Page Language="C#"  Inherits="Exobo.Web.UI.BasePage"%>
	<%
  int wxpid = XLJ.UtilityLibrary.StringHelper.ToInt32(Request["wxpid"],104915);
  int tkid = XLJ.UtilityLibrary.StringHelper.ToInt32(Request["tkid"],0);
Exobo.DAL.WXOpen _WeiXin=Exobo.Web.BLL.WeiXin.GetWXOpen(wxpid);
if(_WeiXin==null) {Response.End();} 
Exobo.WeiXin.JSSDK jssdk=new Exobo.WeiXin.JSSDK(_WeiXin.APPNo,_WeiXin.APPKey);

 
LOG_DUserID=_WeiXin.UserID;
int _SUserID=_WeiXin.UserID;
 //if(LOG_CUserID<1){Response.Redirect("/weixin/login_happy.aspx?wxpid=104915");}

 List<Exobo.DAL.MsgBoard> Subs = Exobo.Web.BLL.Msg.GetBoards(0,_SUserID,700001);
 List<Exobo.DAL.MsgBoard> Boards =Exobo.Web.BLL.Msg.GetBoards(0,_SUserID,700002);
 	

%>
<!DOCTYPE html>

<html>

	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
		<meta name="full-screen" content="yes">
		<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
		<meta http-equiv="Pragma" content="no-cache" />
		<meta http-equiv="Expires" content="0" />
		<title ng-bind="$rootScope.toState.name"></title>

		<link href="//cdn.bootcss.com/ionic/1.1.0/css/ionic.min.css" rel="stylesheet"> 
		<link href="css/style.css" rel="stylesheet">	
	</head>

	<body>
		<ion-nav-bar class="bar-stable" ng-class="{'hide': $root.hideNavs}">
			<ion-nav-back-button>
			</ion-nav-back-button>
		</ion-nav-bar>
		<ion-nav-view></ion-nav-view>
	</body>

	<!-- third party js -->
	<script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
	<script src="//cdn.bootcss.com/underscore.js/1.8.3/underscore-min.js"></script>
	<script src="//cdn.bootcss.com/jquery/2.1.4/jquery.min.js"></script>
	<!-- ionic/angularjs js -->

	<script src="//cdn.bootcss.com/ionic/1.1.0/js/ionic.bundle.min.js"></script>
	
 
	<script type="text/javascript">
		window.wxpid=<%=wxpid%>;
		window.tkid=<%=tkid%>;
		window.indexAdvs= <%=LitJson.JsonMapper.ToJson( Exobo.Web.BLL.Adv.Gets(20,900001,_SUserID,0,"index") )%>  ; 
 		window.Subs=<%=LitJson.JsonMapper.ToJson(Subs)%>;
 		window.Boards=<%=LitJson.JsonMapper.ToJson(Boards)%>;
		window.Boards.unshift({BoardName:"全部",BoardNo:0,TypeID:700002});
	 
 
			angular.element(document).ready(function() {
				angular.bootstrap(document.body, ["starter"]);
			});
	 
			 window.jssdk={
			 	appId: "<%=jssdk.appid%>",
				timestamp: <%=jssdk.timestamp%>, 
				nonceStr: "<%=jssdk.noncestr%>", 
				signature: "<%=jssdk.signature%>", 
			 }

		 
	</script>  
  	<!-- your app's js -->
 	<script type="text/javascript" src="js/all.min.js"></script> 

 
 
 
 

</html>