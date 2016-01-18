var fieldNames={
    sname:"མདོ་མིང་།"
}

var getInfo=function(sutraid){
    for(var i=0;i<biography.divisions.length;i++){
        console.log("i:"+i);
        for(var j=0;j<biography.divisions[i].sutras.length;j++){
            if(biography.divisions[i].sutras[j].sutraid==sutraid)return biography.divisions[i].sutras[j];
        }
    }
    return "";
}

var showSutraInfo=function(){
    //取得目前畫面之經號
    //根據經號 抓sutra info
    var out = "";
    out = "<table class=\"table table-condensed\">";
    //var sutrainfo=biography.divisions[0].sutras[0];
    var sutrainfo = getInfo(document.getElementById('sutraid').innerHTML);
    for(var i in sutrainfo){
        if(sutrainfo[i]){
            out += "<tr><th>"+(fieldNames[i]||i)+"</th><td>"+sutrainfo[i]+"</td></tr>";
        }
    }
    out+= "</table>";
    //out = biography.divisions[0].sutras[0].cname;
    $("#sutrainfo").html(out);
    console.log("show sutra info");
}
