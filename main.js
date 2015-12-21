console.log("running main.js");
var db="jiangkangyur";
var name="head";
var uti="1.1a";
var timer1,timer2,tf1,tf2;
var toputi,bottomuti;
var batchstart=0;
var BATCHSIZE=30;
var searchresult;

var onSelect=function(e,treenode,seq,toc){
    console.log("fetching by vpos",treenode.vpos);
    fetchText(treenode.vpos);
    /*console.log(arguments)*/
}

ksa.toc({db:db},function(err,data){
    ReactDOM.render(
        React.createElement(
            ksana2015treetoc.Component,
            {toc:data.toc,treename:"jiangkangyur",onSelect:onSelect}
        ),
        document.getElementById("tree")
    );
});

var showtotal=function(total){
    document.getElementById("totalfound").innerHTML=total;
}

var showbatch=function(){
    console.log("match count",searchresult.length)
        if(tf2){//有全文摘要
            var uti=[];
            for (var i=batchstart;i<searchresult.length;i++) {
                uti.push(searchresult[i].uti);
                if (uti.length>BATCHSIZE) break;
            }
            ksa.fetch({db:db,q:tf2,uti:uti},function(err,res){
                displayresult(res);
            });
            batchstart+=uti.length;
        }
        else{//無全文，只列目錄
            displaytitles(searchresult);
        };
}

var updateControls=function(){
    document.getElementById("btnnext").style.visibility=(tf2 && searchresult.length>BATCHSIZE)?'visible':'hidden';
}

var search=function() {
    var tofind1=document.getElementById("tofind1").value;
    var tofind2=document.getElementById("tofind2").value;
    tf1=wylie.fromWylie(tofind1);
    tf2=wylie.fromWylie(tofind2);


    ksa.filter({db:db,regex:tf1,q:tf2,field:"head"},function(err,data){
        batchstart=0;
        searchresult=data||[];
        showbatch(searchresult);
        console.log(searchresult.length);
        showtotal(searchresult.length);
        updateControls();
    });
}

var tofind1input=function(e){
    clearTimeout(timer1);
    timer1=setTimeout(function(){
        search();
    },300);
};
var tofind2input=function(e){
    clearTimeout(timer2);
    timer2=setTimeout(function(){
        search();
    },300);
};

var scrollTo=function(uti){
    $("#mainContent").scrollTop(0);
    console.log("scrollingTo:" + uti);
    /*$("#uti_" + uti.replace(".","_")).scrollTop();*/
    var to=$("#uti_" + uti.replace(".","_")).offset().top;
    console.log(to);
    $("#mainContent").scrollTop(to-250);
};

var highlightText=function(text,hits){
    console.log("highlightText");
    if(!hits || !hits.length)return text;
    console.log("hits:",hits);
    return ksa.renderHits(text,hits,function(obj,text){
        //this is for React.js , convert to HTML
        return obj.className?"<span style='background:red;color:yellow'>"+text+"</span>":text;
    }).join("");
}
var text4image=function(e) {
    var uti=e.target.id.substr(4).replace("_",".");
    $('#text4imagemodal').modal({
        show: 'true'
    });
}
var fetchText=function(vpos){
    ksa.sibling({db:db,vpos:vpos},function(err,res){
        var currentuti=res.sibling[res.idx];
        if(toputi==res.sibling[0]){
            scrollTo(currentuti);
            return;
        }
        ksa.fetch({db:db,uti:res.sibling,q:tf2},function(err,data){
            var output="";
            for(var i=0;i<data.length;i++){
                output+="<div class='head-content'>";
                output+="<h2 style='cursor:pointer' onClick='text4image(event)' id='uti_" + (data[i].uti).replace(".","_") + "'>"  + data[i].uti   + "</h2>";
                //output+="<p>" + data[i].text  + "</p>";
                output+="<p>" + highlightText(data[i].text,data[i].hits)  + "</p>";
                output+="</div>";
            }
            document.getElementById('contents').innerHTML=output;/* innerHTML是很慢的動作，盡量避免執行多次 */
            toputi=res.sibling[0];
            bottomuti=res.sibling[res.sibling.length-1];
            scrollTo(currentuti);
            setTimeout(function(){
                displaybreadcrumb(vpos);
            },100);
        });
    });
}

fetchText(1);


