console.log("running main.js");
var db="jiangkangyur";
var name="head";
var uti="1.1a";
var timer1,timer2,tf1,tf2;
var toputi,bottomuti;
var prevbatch=0;
var batchstart=0;
var BATCHSIZE=30;
var searchresult;
var E=null;
var fetched=false;

var kdbArray=["jiangkangyur","tengyur","tibetan-masterpiece"];

var changeKdb=function(kdb){
    db=kdbArray[kdb];
    //$("#navbar").aria-expanded=false;
    systemReady();
    search();
}

var onSelect=function(e,treenode,seq,toc){
    console.log("fetching by vpos",treenode.vpos);
    fetchText(treenode.vpos);
    /*console.log(arguments)*/
}

var onHitClick=function(e,treenode,seq,toc){
    console.log("onHitClick:" + treenode.firstvpos);
    fetchText(treenode.firstvpos);
}
var reloadBreadcrumb=function(vpos){
    setTimeout(function(){
        displaybreadcrumb(vpos);
    },100);
}
var reloadToc=function(cb){
    ksa.toc({db:db,q:tf2},function(err,data){
        ReactDOM.render(
            E(
                ksana2015treetoc.Component,
                {toc:data.toc,hits:data.hits,treename:db
                    ,opened:openicon
                    ,closed:closeicon
                    ,nodeicons:nodeicons
                    ,onSelect:onSelect
                    ,captionClass:"sutra"
                    ,onHitClick:onHitClick}
            ),
            document.getElementById("tree")
        );
    });
    cb();
}

var showtotal=function(total){
    document.getElementById("totalfound").innerHTML=total;
}

var showprevbatch=function(){
    console.log("showprevbatch match count",searchresult.length)
    if(tf2){//有全文摘要
        if(prevbatch-BATCHSIZE>=0){//如果有上一頁內容
            tf2Batch(prevbatch-BATCHSIZE);
        }
    }
    else{//無全文，只列目錄
        displaytitles(searchresult);
    };
    updateControls();
}

var showbatch=function(){
    console.log("showbatch match count",searchresult.length)
    if(tf2){//有全文摘要
        if((searchresult.length-batchstart)>0){//如果下一頁內容
            tf2Batch(batchstart);
            /*
            var uti=[];
            for (var i=batchstart;i<searchresult.length;i++) {
                uti.push(searchresult[i].uti);
                if (uti.length>=BATCHSIZE) break;
            }
            ksa.fetch({db:db,q:tf2,uti:uti},function(err,res){
                displayresult(res);
            });
            prevbatch=batchstart;
            batchstart+=uti.length;*/
        }
    }
    else{//無全文，只列目錄
        displaytitles(searchresult);
    };
    updateControls();
}

var tf2Batch=function(batch){
    console.log("batch:"+batch);
    var uti=[];
    for (var i=batch;i<searchresult.length;i++) {
        uti.push(searchresult[i].uti);
        if (uti.length>=BATCHSIZE) break;
    }
    ksa.fetch({db:db,q:tf2,uti:uti},function(err,res){
        displayresult(res);
    });
    prevbatch=batch;
    console.log("prevbatch:"+prevbatch);
    batchstart=batch+uti.length;
}

var updateControls=function(){
    console.log("left : " + (searchresult.length-batchstart));
    document.getElementById("btnnext").style.visibility=(tf2 && searchresult.length>BATCHSIZE && (searchresult.length-batchstart)>0)?'visible':'hidden';
    document.getElementById("btnprev").style.visibility=(tf2 && searchresult.length>BATCHSIZE && (prevbatch-BATCHSIZE)>=0)?'visible':'hidden';
}

var filter=function(ranges,regex){
    ksa.filter({db:db,regex:regex,q:tf2,field:"head",ranges:ranges},function(err,data){
        prevbatch=0;
        batchstart=0;
        searchresult=data||[];
        showbatch(searchresult);
        console.log(searchresult.length);
        showtotal(searchresult.length);
        reloadToc(function(){});
        //updateControls();
    });
};

/* 使用單經搜尋 */
var searchSid=function(tofind1){
    var sid=["J"+tofind1];
    console.log("searching sid :"+sid);
    ksa.getFieldRange({db:db,field:"sutra",values:sid},function(err,ranges){
        console.log("ranges:"+ranges);
        filter(ranges,"");
    });
}

/* 使用頁碼搜尋 */
var searchUti=function(tofind1){
    var searchUti = tofind1;
    var isLong = tofind1.match(/(\d{1,3}[a-z]?)\.(\d{1,3}[ab]$)/);
    if(!isLong)searchUti=searchUti+"a";//如果不是完整頁碼則補a

    ksa.fetch({db:db,uti:searchUti,q:tf2},function(err,data){
        if(data.length>0){
            console.log("isUti uti:" + searchUti + " vpos:" + data[0].vpos);
            if(data[0].vpos!=undefined){
                fetchText(data[0].vpos);
            }
            else{
                console.log("invalidUti");
            }
        }
        else{
            console.log("invalidUti");
        }
    });
}

/* 搜尋總函式 */
var search=function() {
    var tofind1=document.getElementById("tofind1").value;
    var tofind2=document.getElementById("tofind2").value;
    tf1=wylie.fromWylieWithWildcard(tofind1);
    tf2=wylie.fromWylieWithWildcard(tofind2);

    console.log("tf2:" + tf2);

    var isUti = tofind1.match(/^(\d{1,3}[a-z]?)\.(\d{1,3}[ab]?$)/);//確認是否以頁碼搜尋
    var isSid = tofind1.match(/^(\d{1,4})([a-z]?)$/);//確認是否為單經搜尋

    if(isSid){//如果是單經搜尋
        searchSid(tofind1);
        return;
    }

    if(isUti){//如果是輸入頁碼
        searchUti(tofind1);
        return;
    }

    fetched=false;
    //如果都不是則為一般搜尋
    var ffield="";
    if(!tf2)ffield="head";
    ksa.filter({db:db,regex:tf1,q:tf2,field:ffield},function(err,data){
        prevbatch=0;
        batchstart=0;
        searchresult=data||[];
        showbatch(searchresult);
        console.log(searchresult.length);
        console.log("searchresult.length:"+searchresult.length);
        showtotal(searchresult.length);
        reloadToc(function(){});
        reloadBreadcrumb(0);
        //updateControls();
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

var nextMatch=function(currentvpos){
    console.log("this vpos :"+currentvpos);
    for(var i=0;i<searchresult.length;i++)
    {
        if(searchresult[i].vpos>currentvpos && i+1<searchresult.length){
            console.log(i+" vpos :"+searchresult[i].vpos);
            console.log("next vpos :"+searchresult[i+1].vpos);
            fetchText(searchresult[i+1].vpos);
            return;
        }
    }
    console.log("next vpos :"+searchresult[0].vpos);
    fetchText(searchresult[0].vpos);
    return;
};

var highlightText2=function(text,hits,currentvpos){
    console.log("highlightText");
    if(!hits || !hits.length)return text;
    console.log("hits:",hits);
    return ksa.renderHits(text,hits,function(obj,text){
        //this is for React.js , convert to HTML
        return obj.className?"<span onClick='nextMatch(\""+currentvpos+"\")' class='highlight'>"+text+"</span>":text;
    }).join("");
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
var fetchText=function(vpos){
    ksa.sibling({db:db,vpos:vpos},function(err,res){
        console.log("fetchText:" + vpos);
        var currentuti=res.sibling[res.idx];
        if(toputi==res.sibling[0] && fetched){
            scrollTo(currentuti);
            reloadBreadcrumb(vpos+300);//vpos為此頁起點，但目錄的vpos在起點之後 為避免麵包屑誤差而補充300
            return;
        }
        ksa.fetch({db:db,uti:res.sibling,q:tf2,fields:"sutra"},function(err,data){
            var output="";
            var vposend = data[res.idx].vpos_end;
            /*var currentSutraID = "J1";//經號
            if(data[0].values[0]!=undefined)currentSutraID=data[0].values[0];
            output+="<h1 id='sutraid'>"+currentSutraID+"</h1>";*/
            //output+="<h1 id='sutraid'>"+(data[0].values[0]==undefined?"J1":data[0].values[0])+"</h1>";//經號
            for(var i=0;i<data.length;i++){
                output+="<div class='head-content'>";
                output+="<h2 style='cursor:pointer' onClick='text4image(event)' id='uti_" + (data[i].uti).replace(".","_") + "'>"  + data[i].uti   + "</h2>";
                //output+="<p>" + data[i].text  + "</p>";
                output+="<p>" + highlightText2(data[i].text,data[i].hits,data[i].vpos)  + "</p>";
                output+="<a class=\"btn-modal pic\" id='btn_" + (data[i].uti).replace(".","_") + "' onClick=\"text4image(event)\" title=\"open " + data[i].uti + " images\">image icon</a>";
                output+="</div>";
            }
            output=output.replace(/[\r\n]/g,"");
            document.getElementById('contents').innerHTML=output;/* innerHTML是很慢的動作，盡量避免執行多次 */
            toputi=res.sibling[0];
            bottomuti=res.sibling[res.sibling.length-1];
            console.log("vposend:"+vposend);
            reloadBreadcrumb(vposend);
            scrollTo(currentuti);
            //$("#bSutraID").html(currentSutraID);
            fetched=true;
        });
    });
}
var openicion,closeicon,nodeicons;
var systemReady=function(){
    E = React.createElement;
    openicon=E("img",{src:"images/tree-open.png"});
    closeicon=E("img",{src:"images/tree-close.png"});
    nodeicons=[
        "images/tree-lv0.png",
        "images/tree-lv1.png",
        "images/tree-lv2.png",
        "images/tree-lv3.png",
        "images/tree-lv4.png"
    ]
    reloadToc(function(){
        setTimeout(function(){
            fetchText(20);
        },500);
    });
    initialAdvSearch();
}



