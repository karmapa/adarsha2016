var fieldNames={
    division:"སྡེ་ཚན།",
    tname:"མདོ་མིང་།",
    aname:"མདོ་མིང་གཞན།",
    sname:"རྒྱ་གར་མདོ་མིང་།",
    cname:"རྒྱ་ནག་མདོ་མིང་།",
    subject:"བརྗོད་བྱ།",
    yana:"ཐེག་པ།",
    chakra:"འཁོར་ལོ།",
    location:"གནས་ཕུན་སུམ་ཚོགས་པ།",
    purpose:"ཆོས་ཀྱི་དགོས་དོན།",
    collect:"བསྡུས་པའི་དོན། ལེའུ།",
    relation:"མཚམས་སྦྱར་བའི་གོ་རིམ།",
    debate:"རྒལ་ལན།",
    translator:"ལོ་ཙཱ་བ།",
    reviser:"ཞུ་དག་པ།"
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
    var sutrainfo = getInfo(document.getElementById('bSutraID').innerHTML);
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
