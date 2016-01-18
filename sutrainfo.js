var fieldNames={
    sname:"མདོ་མིང་།"
}

var getInfo=function(sutraid){

}

var showSutraInfo=function(){
    //取得目前畫面之經號
    //根據經號 抓sutra info
    var out = "";
    out = "<table class=\"table table-condensed\">";
    var sutrainfo=biography.divisions[0].sutras[0];
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
