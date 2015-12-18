
var displayresult=function(result){
    var out="";
    for (var i=0;i<result.length;i++) {


    var t=ksa.renderHits(result[i].text,result[i].hits,function(obj,text){
        //this is for React.js , convert to HTML
        return obj.className?"<span style='background:red;color:yellow'>"+text+"</span>":trimtext(text);
    }).join("");

        out+="<h5 onClick='fetchText(" + result[i].vpos + ")'>"+result[i].uti+"<br>"+t+"</h5>";
    }
    document.getElementById("searchres").innerHTML=out;
}
var displaytitles=function(titles){
    var out="";
    for(var i=0;i<titles.length;i++){
        if(i>100)break;
        out+="<h2 onClick='fetchText(" + titles[i].vpos + ")'>" + titles[i].uti + ":" +titles[i].text+"/<h2>";
    }
    document.getElementById("searchres").innerHTML=out;
};

var onBreadcrumbSelect=function(itemidx,vpos){
    fetchText(vpos);
}

var displaybreadcrumb=function(vpos){
    ksa.toc({db:db},function(err,data){
        ReactDOM.render(
            React.createElement(
                ksana2015breadcrumbtoc.Component,
                {toc:data.toc,treename:"jiangkangyur",onSelect:onBreadcrumbSelect,theme:theme_bootstrap,vpos:vpos}
            ),
            document.getElementById("breadcrumb")
        );
    });
};
