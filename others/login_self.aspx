 <%@Page language="C#" Inherits="Exobo.Web.UI.BasePage"%>
 <% 
  int wxpid = XLJ.UtilityLibrary.StringHelper.ToInt32(Request["wxpid"],104915);
    int p = XLJ.UtilityLibrary.StringHelper.ToInt32(Request["p"],0);
  string fromurl=Request.QueryString["fromurl"];
Exobo.DAL.WXOpen _WeiXin=Exobo.Web.BLL.WeiXin.GetWXOpen(wxpid);
if(_WeiXin==null) {Response.Write(wxpid);Response.End();}
LOG_DUserID=_WeiXin.UserID;
 %>
 <!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <title>微信授权</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	  <script type="text/javascript" src="/static/js/jquery.js"></script>
	 <script type="text/javascript">

	 </script>
 </head>
 
 
 <%
 

//reg end
 
 		
 	List<Exobo.DAL.WXFake> fakes= Exobo.Web.BLL.WeiXin.GetWXFakes(100,0,100022,0,"","");
 		
 		
 		

 //登陆
	%>

	<script type="text/javascript">
//alert("<%=fakes[p].UserID%>");
 	$.ajax({
	url: '/handler/wxaction.ashx?act=LoginByToken',
	type: 'POST',
	dataType: 'json',
	data: {fakeid:"o-RoWsxTX4t0kBTBWhyDIn9cWYDM",log_duserid:<%=LOG_DUserID%>,tkid:'<%=TuikeID%>'},
	success:function(a){
		if(a.status==0){
		var enUrl='<%=fromurl%>';
		enUrl=enUrl|| ('/weixin/galleryselection/index.aspx');
	    location.href=decodeURIComponent(enUrl);
		}
		else{
		alert(a.msg);
		}
	},
	error:function(a){
	//alert(JSON.stringify(a));
	},
	complete:function(a){
		//alert(JSON.stringify(a))
	}
});
	</script>
 
