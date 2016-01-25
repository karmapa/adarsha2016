var fontSize=parseInt(localStorage.getItem("fontsize")||17);
var lineheight=parseInt(localStorage.getItem("lineheight")||2);
var sheet=document.getElementsByTagName("STYLE")[0].sheet;

var setFont=function(sChange,hChange){
    fontSize+=sChange;
    if(lineheight>3.5)lineheight=3.5;
    if(lineheight<1.5)lineheight=1.5;
    if((lineheight+hChange)<=3.5&&(lineheight+hChange)>=1.5)lineheight+=hChange;
    sheet.insertRule(".head-content p {line-height:"+(fontSize*lineheight)+"pt;font-size:"+fontSize+"pt}",sheet.cssRules.length);
    localStorage.setItem("fontsize",fontSize);
    localStorage.setItem("lineheight",lineheight);
}
