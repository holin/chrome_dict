/**
 * @author Dongxu Huang
 * @date   2010-2-21
 */

var Options =
{
    "dict_disable": ["checked", false],
    "ctrl_only": ["checked", false],
    "english_only": ["checked", false]
};
function close()
{
	window.self.close();
}
var retphrase = "";
var basetrans = "";
var webtrans = "";
var noBaseTrans = false;
var noWebTrans = false;
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
var langType = '';
function translateXML(xmlnode){
	var translate = "<strong>��ѯ:</strong><br/>";
	var root = xmlnode.getElementsByTagName("yodaodict")[0];
	
	if ("" + root.getElementsByTagName("return-phrase")[0].childNodes[0] != "undefined") 
		retphrase = root.getElementsByTagName("return-phrase")[0].childNodes[0].nodeValue;
	
	
	
	if ("" + root.getElementsByTagName("lang")[0]  != "undefined") {
		langType = root.getElementsByTagName("lang")[0].childNodes[0].nodeValue;
	}
	var strpho = "";
 
	if (""+ root.getElementsByTagName("phonetic-symbol")[0] != "undefined" ) {
		if(""+ root.getElementsByTagName("phonetic-symbol")[0].childNodes[0] != "undefined")
			var pho = root.getElementsByTagName("phonetic-symbol")[0].childNodes[0].nodeValue;
		
		if (pho != null) {
			strpho = "&nbsp;[" + pho + "]";
		}
	}
	
	if (""+ root.getElementsByTagName("translation")[0] == "undefined")
	{
		 noBaseTrans = true;
	}
	if (""+ root.getElementsByTagName("web-translation")[0] == "undefined")
	{
		 noWebTrans = true;
	}
	
	
	if (noBaseTrans == false) {
		translate += retphrase + "<br/><br/><strong>��������:</strong><br/>";
		
		if ("" + root.getElementsByTagName("translation")[0].childNodes[0] != "undefined") 
			var translations = root.getElementsByTagName("translation");
		else {
			basetrans += 'δ�ҵ���������';
		}
		
		for (var i = 0; i < translations.length; i++) {
			var line = translations[i].getElementsByTagName("content")[0].childNodes[0].nodeValue + "<br/>";
			if (line.length > 50) {
				var reg = /[;��]/;
				var childs = line.split(reg);
				line = '';
				for (var i = 0; i < childs.length; i++) 
					line += childs[i] + "<br/>";
			}
			basetrans += line;
			
		}
	}
	if (noWebTrans == false) {
		if ("" + root.getElementsByTagName("web-translation")[0].childNodes[0] != "undefined") 
			var webtranslations = root.getElementsByTagName("web-translation");
		else {
			webtrans += 'δ�ҵ���������';
		}
		
		for (var i = 0; i < webtranslations.length; i++) {
			webtrans += webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue + ":  ";
			webtrans += webtranslations[i].getElementsByTagName("trans")[0].getElementsByTagName("value")[0].childNodes[0].nodeValue + "<br/>";
		}
	}
	mainFrameQuery();
	return ;
}
var _word;

function mainQuery(word,callback) {
		var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(data) {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              var dataText = translateXML(xhr.responseXML);
			  if(dataText != null)
              	callback(dataText);
            }
          }
        }
		_word = word;
        var url = 'http://dict.youdao.com/fsearch?client=deskdict&keyfrom=chrome.extension&q='+encodeURIComponent(word)+'&pos=-1&doctype=xml&xmlVersion=3.2&dogVersion=1.0&vendor=unknown&appVer=3.1.17.4208&le=eng'
		xhr.open('GET', url, true);
        xhr.send();
}
function removeDiv(divname)
{
	var div=document.getElementById(divname);
	if(div == null) return;
	div.parentNode.removeChild(div);
}
function mainFrameQuery(){
	removeDiv('opt_text');
	removeDiv('opt_text');
	removeDiv('opt_text');
	removeDiv('opt_text');
	var lan = '';
	if(isContainKoera(_word))
	{
		lan = "&le=ko";
	}
	if(isContainJapanese(_word))
	{
		lan = "&le=jap";
	}
	if(langType == 'fr')
	{
		lan = "&le=fr";
	}
	var res = document.getElementById('result');
	res.innerHTML = '';
	if (noBaseTrans == false) {
		if(langType=='ko')
			basetrans = "<strong>��������:</strong><br/>" + basetrans;
		else if (langType == 'jap')
			basetrans = "<strong>�պ�����:</strong><br/>" + basetrans;
		else if (langType == 'fr')
			basetrans = "<strong>��������:</strong><br/>" + basetrans;
		else basetrans = "<strong>Ӣ������:</strong><br/>" + basetrans;
    	res.innerHTML = basetrans;
	}
	if (noWebTrans == false) {
		webtrans = "<strong>��������:</strong><br/>" + webtrans;
		res.innerHTML += webtrans;
	}
	if(noBaseTrans == false || noWebTrans == false)
	{
		res.innerHTML +="<a href ='http://dict.youdao.com/search?q="+encodeURIComponent(_word)+"&ue=utf8&keyfrom=chrome.extension"+lan+"' target=_blank>��� �鿴��ϸ����</a>";
	}
	if(noBaseTrans && noWebTrans)
	{
		res.innerHTML = "δ�ҵ�Ӣ������!";
		res.innerHTML +="<br><a href ='http://www.youdao.com/search?q="+encodeURIComponent(_word)+"&ue=utf8&keyfrom=chrome.extension' target=_blank>�������е�����</a>";
	}
	retphrase='';
	webtrans = '';
	basetrans = '';
	_word ='';
	langType='';
	noBaseTrans = false;
	noWebTrans = false;
	document.getElementsByName('word').focus();
}
function save_options()
{
	changeIcon();
	for (key in Options)
    {
        if (Options[key][0] == "checked")
        {
            Options[key][1] = document.getElementById(key).checked;
        }
    }
	localStorage["ColorOptions"] = JSON.stringify(Options);
}
function goFeedback()
{
	window.open("http://feedback.youdao.com/deskapp_report.jsp?prodtype=deskdict&ver=chrome.extension");
}
function goAbout()
{
	window.open("http://cidian.youdao.com/chromeplus");
}
function initIcon()
{
	var localOptions = JSON.parse(localStorage["ColorOptions"]);
	if(localOptions['dict_disable'][1] == true) {
		chrome.browserAction.setIcon({
			path: "icon_nodict.gif"
		})
	}
}
function changeIcon()
{
	
	if (document.getElementById('dict_disable').checked) {
		
		var a = document.getElementById('ctrl_only');
		a.disabled = true;
		
		a = document.getElementById('english_only');
		a.disabled = true;
		
		chrome.browserAction.setIcon({
			path: "icon_nodict.gif"
		})
	}
	else {
		var a = document.getElementById('ctrl_only');
		a.disabled = false;
		
		a = document.getElementById('english_only');
		a.disabled = false;
		
		chrome.browserAction.setIcon({
			path: "icon_dict.gif"
		})
	}
}

function check()
{
   var word = document.getElementsByName("word")[0].value;
   window.open("http://dict.youdao.com/search?q="+encodeURI(word)+"&ue=utf8&keyfrom=chrome.index");
}
function restore_options()
{
    var localOptions = JSON.parse(localStorage["ColorOptions"]);
    
    for (key in localOptions)
    {
        optionValue = localOptions[key];
        if (!optionValue) return;
        var element = document.getElementById(key);
        if (element)
        {
            element.value = localOptions[key][1];
            switch (localOptions[key][0])
            {
            case "checked":
                if (localOptions[key][1]) element.checked = true;
                else element.checked = false;
                break;
            }
        }
    }
    
}
