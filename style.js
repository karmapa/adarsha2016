var fontSize=parseInt(localStorage.getItem("fontsize")||17);
var lineheight=parseInt(localStorage.getItem("lineheight")||25);
var sheet=document.getElementsByTagName("STYLE")[0].sheet;

var setFont=function(sChange,hChange){
    fontSize+=sChange;
    lineheight+=hChange;
    sheet.insertRule(".head-content p {line-height:"+lineheight+"pt;font-size:"+fontSize+"pt}",sheet.cssRules.length);
    localStorage.setItem("fontsize",fontSize);
    localStorage.setItem("lineheight",lineheight);
}
