 <%@Page language="C#" Inherits="Exobo.Web.API.WeiXin.AuthUser"%>
  <%  
 int wxpid = XLJ.UtilityLibrary.StringHelper.ToInt32(Request["wxpid"],2);
Exobo.DAL.WXOpen _WeiXin=Exobo.Web.BLL.WeiXin.GetWXOpen(wxpid);
if(_WeiXin==null) {Response.Write(wxpid);Response.End();}
LOG_DUserID=_WeiXin.UserID; 
if(LOG_CCustomerID<1){
  Response.End();
}
%>
 <!doctype html>
<html>
<head>
    <meta charset="UTF-8"> 
    <title>微信授权</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	  <script type="text/javascript" src="/static/js/jquery.js"></script>
 
 </head>
 
 <body>

	<script>
	   var ContactID=<%=LOG_CCustomer.ContactID%>;
var info = <%=_UserStr%>;
    delete info["privilege"];
var infoStr=JSON.stringify(info);
infoStr=infoStr.replace(/"(\w+)"(\s*:\s*)/g, "$1$2");

var info2=eval('(' +infoStr+')');
//alert(info2.headimgurl);
   var info3 = {Contact_FirstName:info2.nickname,Contact_Country:info2.country,Contact_Province:info2.province,Contact_City:info2.city,Contact_avatar:info2.headimgurl,Contact_sex:info2.sex};
 //alert( JSON.stringify(info3))
info3.log_duserid=<%=_WeiXin.UserID%>;
console.log(info3);
try 
{

	$.ajax({
	   url:"/handler/customer.ashx?act=ContactEdit&contactid="+ContactID,
      type:"post",
	dataType: 'json',
	data: info3,
	success:function(a){
		if(a.status=="0")
		{ 
		  alert('同步资料成功');
		  location.href='/index.aspx?wxpid=<%=wxpid%>';  
		}
	else{
	 alert(a.msg);
	location.href='/index.aspx?wxpid=<%=wxpid%>';  
	}	
	},
	error:function(a){},
		//alert('error')
//alert(JSON.stringify(a));}
});
} 
catch (e) 
{ 
// alert('catch '+e); 

} 
 
	</script>
