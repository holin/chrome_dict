
/**
 * @author Dongxu Huang
 * @date   2010-2-21
 */


var body =  document.getElementsByTagName("body")[0];
var g_bDisable = false;
var Options = null;
var last_frame = null;
var last_div = null;
var div_num = 0;
var xx,yy,sx,sy; 
var list = new Array();
var last_time = 0;
var last_request_time = 0;

var styleInsert = document.createElement("style"),
styleContent = document.createTextNode("#yddContainer{display:block;font-family:Microsoft YaHei;position:relative;width:100%;height:100%;top:-4px;left:-4px;font-size:12px;border:1px solid}#yddTop{display:block;height:22px}#yddTopBorderlr{display:block;position:static;height:17px;padding:2px 28px;line-height:17px;font-size:12px;color:#5079bb;font-weight:bold;border-style:none solid;border-width:1px}#yddTopBorderlr .ydd-sp{position:absolute;top:2px;height:0;overflow:hidden}.ydd-icon{left:5px;width:17px;padding:0px 0px 0px 0px;padding-top:17px;background-position:-16px -44px}.ydd-close{right:5px;width:16px;padding-top:16px;background-position:left -44px}#yddKeyTitle{float:left;text-decoration:none}#yddMiddle{display:block;margin-bottom:10px}.ydd-tabs{display:block;margin:5px 0;padding:0 5px;height:18px;border-bottom:1px solid}.ydd-tab{display:block;float:left;height:18px;margin:0 5px -1px 0;padding:0 4px;line-height:18px;border:1px solid;border-bottom:none}.ydd-trans-container{display:block;line-height:160%}.ydd-trans-container a{text-decoration:none;}#yddBottom{position:absolute;bottom:0;left:0;width:100%;height:22px;line-height:22px;overflow:hidden;background-position:left -22px}.ydd-padding010{padding:0 10px}#yddWrapper{color:#252525;z-index:10001;background:url("+chrome.extension.getURL("ab20.png")+");}#yddContainer{background:#fff;border-color:#4b7598}#yddTopBorderlr{border-color:#f0f8fc}#yddWrapper .ydd-sp{background-image:url("+chrome.extension.getURL("ydd-sprite.png")+")}#yddWrapper a,#yddWrapper a:hover,#yddWrapper a:visited{color:#50799b}#yddWrapper .ydd-tabs{color:#959595}.ydd-tabs,.ydd-tab{background:#fff;border-color:#d5e7f3}#yddBottom{color:#363636}#yddWrapper{min-width:250px;max-width:400px;}");
styleInsert.type = "text/css";
if (styleInsert.styleSheet) styleInsert.styleSheet.cssText = styleContent.nodeValue;
else {
  styleInsert.appendChild(styleContent);
  document.getElementsByTagName("head")[0].appendChild(styleInsert)
}

chrome.extension.sendRequest(
    {
        init: "init"
    },
    function(response)
    {
        if (response.ColorOptions)
        {
            Options = JSON.parse(response.ColorOptions);
        }
    }
);
body.addEventListener("mouseup",OnDictEvent, false);
body.addEventListener("click",OnWordReaperEvent, false);

function OnWordReaperEvent(e) {
	try{
		var t = e.target;
		if (t.tagName == "A") {
			if(t.id == "wordreaper_holin_info") {
				wordReaper(t);
			}
		}
	} catch(e){}
}
 
function optVal(strKey)
{
	 
    if (Options !== null)
    {
		
        return Options[strKey][1];
    }
}

function tool_disable() 
{
  g_bDisable = true;
}
function isEnglish(s)
{  
    for(var i=0;i<s.length;i++)
    {
        if(s.charCodeAt(i)>126)
        {
            return false;
        }
    }
    return true; 
}
document.onkeydown=function(e) {
   
  if(optVal("ctrl_only"))  
  {
    return;
  }
  e=e || window.event;
  var key=e.keyCode || e.which;
  OnCheckCloseWindow();
}
function isChinese(temp) 
{ 
	var re = /[^\u4e00-\u9fa5]/; 
	if(re.test(temp)) return false; 
	return true; 
}
function isJapanese(temp) 
{ 
	var re = /[^\u0800-\u4e00]/; 
	if(re.test(temp)) return false; 
	return true; 
}

function isKoera(str) {
	for(i=0; i<str.length; i++) {
	if(((str.charCodeAt(i) > 0x3130 && str.charCodeAt(i) < 0x318F) || (str.charCodeAt(i) >= 0xAC00 && str.charCodeAt(i) <= 0xD7A3))) {
		return true;
		}
	}
	return false;
}
function isContainKoera(temp)
{
	var cnt = 0;
	for(var i=0;i < temp.length ; i++)
	{
		if(isKoera(temp.charAt(i)))
			cnt++;
	}
	if (cnt > 0) return true;
	return false;
}
function isContainChinese(temp)
{
	var cnt = 0;
	for(var i=0;i < temp.length ; i++)
	{
		if(isChinese(temp.charAt(i)))
			cnt++;
	}
	if (cnt > 5) return true;
	return false;
}
function isContainChinese2(temp)
{
	var cnt = 0;
	for(var i=0;i < temp.length ; i++)
	{
		if(isChinese(temp.charAt(i)))
			cnt++;
	}
	if (cnt > 0 && temp.length<=3) return true;
	return false;
}
function isContainJapanese(temp)
{
	var cnt = 0;
	for(var i=0;i < temp.length ; i++)
	{
		if(isJapanese(temp.charAt(i)))
			cnt++;
	}
	if (cnt > 2) return true;
	return false;
}

function spaceCount(temp)
{
	var cnt=0;
	for (var i=0;i<temp.length ; i++)
	{
		if(temp.charAt(i) == ' ')
			cnt++;
	}	
	return cnt;
}
function OnDictEvent(e) {

  /*read options*/
  chrome.extension.sendRequest(
	    {
	        init: "init"
	    },
	    function(response)
	    {
	        if (response.ColorOptions)
	        {
	            Options = JSON.parse(response.ColorOptions);
	        }
	    }
  );
  if(in_div) return;
  OnCheckCloseWindow();
  
  if(optVal("dict_disable"))
    return;
  if(!optVal("ctrl_only") && e.ctrlKey)
    return;
  if(optVal("ctrl_only") && !e.ctrlKey)
    return;
  if(g_bDisable)
    return;
  var word = String(window.getSelection());
  word = word.replace(/^\s*/, "").replace(/\s*$/, "");
 
  if(word=="") return;
   
  if (  (optVal("english_only") && isContainChinese2(word)) || 
  		(optVal("english_only") && isContainChinese(word)) || 
  		(optVal("english_only") && isContainJapanese(word)) ||
		(optVal("english_only") && isContainKoera(word)) )
  	return ;
  if(word.length > 2000) 
  	return;
  if( 	(!isContainChinese(word) && spaceCount(word) >= 3) 
        || (isContainChinese(word) && word.length >4) 
		|| isContainJapanese(word) && word.length >4)
  {
  	xx = e.pageX,yy = e.pageY, sx = e.screenX, sy = e.screenY;
	getYoudaoTrans(word,e.pageX,e.pageY,e.screenX,e.screenY);
    return;
  }
  
  // TODO: add isEnglish function
  if (word != '') {
  	xx = e.pageX,yy = e.pageY, sx = e.screenX, sy = e.screenY;
	getYoudaoDict(word,e.pageX,e.pageY,e.screenX,e.screenY);
	return;
  }
}


function OnCheckCloseWindow() {
   isDrag =false;
   if(in_div) return;
   if (last_frame != null) {
  	var cur = Math.round(new Date().getTime());
	if (cur - last_time < 500) {
	 
		return;
	}
	while (list.length != 0) {
		body.removeChild(list.pop());
	}
    last_frame = null;
    last_div = null;
    return true;
  }
  return false
}
function OnCheckCloseWindowForce() {
  in_div = false;
  if (last_frame != null) {
  	var cur = Math.round(new Date().getTime());
	if (cur - last_time < 500) {
	 
		return;
	}
    while(list.length !=0)
    	body.removeChild(list.pop());
    
    last_frame = null;
    last_div = null;
 
    return true;
  }
  return false
}
function createPopUpEx(word,x,y,screenx, screeny)
{
	createPopUp(word,window.getSelection().getRangeAt(0).startContainer.nodeValue, x, y, screenx, screeny)
}
var in_div = false;
function createPopUp(word,senctence, x, y, screenX, screenY) {
 
  if (OnCheckCloseWindow()) {
      return;
  }
  last_word = word;
  
  var frame_height = 150;
  var frame_width = 300;
  var padding = 10;
  
  var frame_left = 0;
  var frame_top = 0;
  var frame = document.createElement('div');
   
  frame.id = 'yddWrapper';
 
  var screen_width = screen.availWidth;
  var screen_height = screen.availHeight;
  
  if (screenX + frame_width < screen_width) {
  	 
    frame_left = x;
  } else {
    frame_left = (x - frame_width - 2 * padding);
  }
  frame.style.left = frame_left  + 'px';
  
  if (screenY + frame_height + 20 < screen_height) {
    frame_top = y;
  } else {
	frame_top = (y - frame_height - 2 * padding);
  }
 
  frame.style.top = frame_top + 10 + 'px';
  frame.style.position = 'absolute';
   
  if (frame.style.left + frame_width > screen_width)
  {
  	frame.style.left -=  frame.style.left +frame_width - screen_width;
  }
  frame.innerHTML += word ;
  frame.onmouseover = function(e){in_div = true;};
  frame.onmouseout = function(e){in_div = false;};
  body.style.position = "static";
  body.appendChild(frame);
  document.getElementById("test").onclick = function(e){ OnCheckCloseWindowForce();};
  document.getElementById("test").onmousemove = function(e){frame.style.cursor='default';};
  document.getElementById("yddTop").onmousedown = dragDown;
  document.getElementById("yddTop").onmouseup = dragUp;
  document.getElementById("yddTop").onmousemove = dragMove;
  document.getElementById("yddTop").onmouseover = function(e){frame.style.cursor='move';};
  document.getElementById("yddTop").onmouseout = function(e){frame.style.cursor='default';};
  
  if (document.getElementById("voice") != null) {
  	var speach_swf = document.getElementById("voice");
  	if (speach_swf.innerHTML != '') {
		speach_swf.innerHTML = insertaudio("http://dict.youdao.com/speech?audio=" + speach_swf.innerHTML, "test", "CLICK", "dictcn_speech");
		var speach_flash = document.getElementById("speach_flash");
		if(speach_flash != null)
		{
			try {
				speach_flash.StopPlay();
			}
			catch(err)
			{
				;
			}
		}
	}
  }
  list.push(frame);
  var leftbottom = frame_top + 10 + document.getElementById("yddWrapper").clientHeight;
 
  if( leftbottom  < y)
  {
  	 var newtop = y - document.getElementById("yddWrapper").clientHeight;
  	 frame.style.top = newtop + 'px';
  }
  if(last_frame!=null)
  {
  	if (last_frame.style.top == frame.style.top && last_frame.style.left == frame.style.left) {
		body.removeChild(frame);
		list.pop();
		return;
	}
  }
  last_time = Math.round(new Date().getTime());
  last_frame = frame; 
  div_num++;
}

function insertaudio(a, query, action, type){  
return  '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" width="15px" height="15px" align="absmiddle" id="speach_flash">' +'<param name="allowScriptAccess" value="sameDomain" />' +'<param name="movie" value="http://cidian.youdao.com/chromeplus/voice.swf" />' +'<param name="loop" value="false" />' +'<param name="menu" value="false" />' +'<param name="quality" value="high" />' +'<param name="wmode"  value="transparent">'+'<param name="FlashVars" value="audio=' + a + '">' +'<embed wmode="transparent" src="http://cidian.youdao.com/chromeplus/voice.swf" loop="false" menu="false" quality="high" bgcolor="#ffffff" width="15" height="15" align="absmiddle" allowScriptAccess="sameDomain" FlashVars="audio=' + a + '" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />' +'</object>' ;
}
var isDrag =false;
var px = 0;
var py=0;

function dragMove(e)
{
	
	if(isDrag)
	{ 
		var myDragDiv = last_frame;
		myDragDiv.style.pixelLeft = px + e.x;
        myDragDiv.style.pixelTop = py + e.y;
	}
}
function dragDown(e)
{
	var oDiv = last_frame;
	 
	px = oDiv.style.pixelLeft - e.x;
    py = oDiv.style.pixelTop - e.y;
	isDrag = true;
}
function dragUp(e)
{
	var oDiv = last_frame;
	 
	isDrag = false;
}
function onText(data)
{
	createPopUpEx(data,xx,yy,sx,sy);
}
function getYoudaoDict(word,x,y,screenx,screeny){
	
	chrome.extension.sendRequest({'action' : 'dict' , 'word': word , 'x' : x, 'y':y , 'screenX' : screenx, 'screenY': screeny}, onText);
}
function getYoudaoTrans(word,x,y,screenx,screeny){
	chrome.extension.sendRequest({'action' : 'translate' , 'word': word , 'x' : x, 'y':y , 'screenX' : screenx, 'screenY': screeny}, onText);
} 

function wordReaper(a) {
		a.style.color = "red";
		a.innerHTML = "Saving...";
		chrome.extension.sendRequest({'action' : 'reaper_word' , 'word': a.className}, function(msg){a.innerHTML = msg;});
		
}

