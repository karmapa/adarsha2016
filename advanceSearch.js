var advBatchStart = 0;
var advBatchSize = 5;
var advResult;

var advanceSearch=function(){
    console.log("advanceSearch");

    $('#advSearchmodal').modal({
        show: 'true'
    });
}

var filterDiv=function(division){
    var out=[];
    var sDivision=biography.divisions[division];
    for (var j=0;j<sDivision.sutras.length;j+=1) {
        var sutra=sDivision.sutras[j];
        out.push(sutra);
    }
    return out;
}

var firstpass=function(field,val){
    var divisions=biography.divisions;

    var out=[];
    for (var i=0;i<divisions.length;i+=1) {
        for (var j=0;j<divisions[i].sutras.length;j+=1) {
            var sutra=divisions[i].sutras[j];
            if (sutra[field].indexOf(val)>-1) {
                out.push(sutra);
            }
        }
    }
    return out;
}

var filterS=function(field,val,previousresult) { //field 欄位名, val 欄位值
    var out=[]
    if (!previousresult) {
        return firstpass(field,val);
    } else {
        for (var i=0;i<previousresult.length;i++) { //other pass
            if (previousresult[i][field].indexOf(val)>-1) {
                out.push(previousresult[i]);
            }
        }
        return out;
    }
}

var filterOr=function(field,val,previousresult) { //field 欄位名, val 欄位值
    var out=[]
    if (!previousresult) {
        return firstpass(field,val);
    } else {
        for (var i=0;i<previousresult.length;i++) { //other pass
            for(var j=0;j<field.length;j+=1){
                if (previousresult[i][field[j]].indexOf(val)>-1) {
                    out.push(previousresult[i]);
                    break;
                }
            }
        }
        return out;
    }
}

var initialRes=function(){
    var divisions=biography.divisions;
    var out=[];
    for (var i=0;i<divisions.length;i+=1) {
        for (var j=0;j<divisions[i].sutras.length;j+=1) {
            var sutra=divisions[i].sutras[j];
            out.push(sutra);
        }
    }
    return out;
}

var creatDivisionDDL=function(){
    var options = "<option value='-1'>-- ALL --</option>";
    var divisions=biography.divisions;
    for (var i=0;i<divisions.length;i+=1) {
        options += "<option value='"+i+"'>"+divisions[i].divisionName+"</option>";
    }
    $("#s_division").html(options);
}

var initialAdvSearch=function(){
    console.log("initialAdvSearch");
    creatDivisionDDL();
}

var showPagination=function(){
    if(advResult.length==0)$("#batches").html("");
    var batch=Math.floor((advResult.length-1)/advBatchSize)+1;
    var html = "";
    if(advBatchStart!=0){
        html += "<li><a onClick='goRefPage(-1)' href='#' aria-label='Previous'><span aria-hidden='true'>«</span></a></li>";
    }
    for(var i=0;i<batch;i+=1){
        var active = "";
        if(i==advBatchStart)active="active";
        html += "<li class='"+active+"'><a onClick='goPage("+i+")' href='#'>" + (i+1) + "</a><li>";
    }
    if(advBatchStart+1<batch){
        html += "<li><a onClick='goRefPage(1)' href='#' aria-label='Previous'><span aria-hidden='true'>»</span></a></li>";
    }
    $("#advPag").html(html);
}

var goRefPage=function(ref){
    advBatchStart += ref;
    $("#advResult").html( showPage());
    showPagination();
}

var goPage=function(page){
    advBatchStart = page;
    $("#advResult").html( showPage());
    showPagination();
}

var advGoSid=function(Sid){
    gotoSid(Sid);
    $('#advSearchmodal').modal('hide');
}

var showPage=function(){
    var Rtn="";
    var names=wylie.fromWylieWithWildcard($("#names").val());
    /*var tname=$("#tname").val();
    var aname=$("#aname").val();
    var author=$("#author").val();*/

    for(var i=advBatchStart*advBatchSize;i<advResult.length;i+=1){
        if(i==advBatchStart*advBatchSize+advBatchSize)break;
        Rtn+="<li>"
        + "<span>"+advResult[i].sutraid+"</span>"
        +"<a onClick=\"advGoSid('"+advResult[i].sutraid+"')\" href='#'>"+advResult[i].tname.replace(names,"<span class='highlight'>"+names+"</span>")+"</a>"
        +"</li>";
        /*+",tname:"+advResult[i].tname.replace(names,"<span class='hl'>"+names+"</span>")
        +",aname:"+advResult[i].aname.replace(names,"<span class='hl'>"+names+"</span>")
        +",sname:"+advResult[i].aname.replace(names,"<span class='hl'>"+names+"</span>")
        +",cname:"+advResult[i].aname.replace(names,"<span class='hl'>"+names+"</span>");*/
        //+advResult[i].author.replace(author,"<span class='hl'>"+author+"</span>");
    }
    return Rtn;
}

var doAdvSearch=function(){
    var namesC = ["tname","aname","sname","cname"];
    var singleFilters = ["yana","chakra","location","translator","reviser"];

    var division=$("#s_division").val();
    var names=wylie.fromWylieWithWildcard($("#names").val());

    var res;

    if(division>=0){
        res=filterDiv(division);
    }else{
        res=initialRes();
    }

    if(names){
        res=filterOr(namesC,names,res);
    }
    for(var i=0;i<singleFilters.length;i+=1){
        var column=singleFilters[i];
        if(column){
            res=filterS(column, wylie.fromWylieWithWildcard($("#"+column).val()),res);
        }
    }

    advResult=res;

    advBatchStart = 0;

    var out=showPage();

    showPagination();
    $("#advResult").html( out);
}
