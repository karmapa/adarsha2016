
var displayresult=function(result){
    if(!result){
        document.getElementById("searchres").innerHTML="";
        return;
    }
    var out="";
    for (var i=0;i<result.length;i++) {
        var t=ksa.renderHits(result[i].text,result[i].hits,function(obj,text){
            if(toWylie)text=wylie.toWylie(text);
            //this is for React.js , convert to HTML
            return obj.className?"<span class='highlight'>"+text+"</span>":abridgeText(text);
        }).join("");

            out+="<h5 onClick='fetchText(" + result[i].vpos + ")'>"+result[i].uti+"<br>"+t+"</h5>";
    }
    //if(toWylie)out=wylie.toWylie(out);
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

var renderBreadcrumb=function(data,vpos,sid){
    var sutraid=function(){
        return React.createElement("span",{key:sid,id:"bSutraID"},sid);
    }
    var conv=null;
    if(toWylie)conv=wylie.toWylie;
    ReactDOM.render(
        React.createElement(
            ksana2015breadcrumbtoc.Component,
            {toc:data.toc,treename:db,onSelect:onBreadcrumbSelect,
             hits:data.vhits,treenodeHits:ksa.treenodehits,vpos:vpos,
             separator:">",
             append:sutraid(),
             conv:conv,
             buttonClass:"btn btn-link"}
        ),
        document.getElementById("breadcrumb")
    );
}

var displaybreadcrumb=function(vpos){

    vpos += 300;
    ksa.toc({db:db,q:tf2},function(err,data){
        ksa.fetch({db:db,vpos:(vpos),fields:"sutra"},function(err,res){
            sutraid=res[0].values[0];

            updateHashTag(sutraid);
            if(res[0].values[0]!=undefined)sutraid=res[0].values[0];
            renderBreadcrumb(data,vpos,sutraid);
        });
    });
};
