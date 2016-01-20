var batchStart = 0;
var batchSize = 5;
var advResult;

var systemReady=function(){
	creatDivisionDDL();
}
var systemReady2=function(){

}

var creatDivisionDDL=function(){
	var options = "<option value='-1'>-- ALL --</option>";
	var divisions=biography.divisions;
	for (var i=0;i<divisions.length;i+=1) {
		options += "<option value='"+i+"'>"+divisions[i].divisionName+"</option>";
	}
	$("#s_division").html(options);
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

var filter=function(field,val,previousresult) { //field 欄位名, val 欄位值
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

var filterDiv=function(division){
	var out=[];
	var sDivision=biography.divisions[division];
	for (var j=0;j<sDivision.sutras.length;j+=1) {
		var sutra=sDivision.sutras[j];
		out.push(sutra);
	}
	return out;
}

var goPage=function(page){
	batchStart = page;
	$("#result").html( showPage());
	showPagination();
}

var showPagination=function(){
	if(advResult.length==0)$("#batches").html("");
	var batch=Math.floor((advResult.length-1)/batchSize)+1;
	var html = "";
	for(var i=0;i<batch;i+=1){
		var active = "";
		if(i==batchStart)active="active";
		html += "<li class='"+active+"'><a onClick='goPage("+i+")' href='#'>" + (i+1) + "</a><li>";
	}
	$("#batches").html(html);
}

var showPage=function(){
	var Rtn="";
	var names=$("#names").val();
	/*var tname=$("#tname").val();
	var aname=$("#aname").val();
	var author=$("#author").val();*/

	for(var i=batchStart*batchSize;i<advResult.length;i+=1){
		if(i==batchStart*batchSize+batchSize)break;
		Rtn+="<br/>sutraid"+advResult[i].sutraid
		+",page"+advResult[i].page
		+",tname:"+advResult[i].tname.replace(names,"<span class='hl'>"+names+"</span>")
		+",aname:"+advResult[i].aname.replace(names,"<span class='hl'>"+names+"</span>")
		+",sname:"+advResult[i].aname.replace(names,"<span class='hl'>"+names+"</span>")
		+",cname:"+advResult[i].aname.replace(names,"<span class='hl'>"+names+"</span>");
		//+advResult[i].author.replace(author,"<span class='hl'>"+author+"</span>");
	}
	return Rtn;
}

var doAdvSearch=function(){
	var namesC = ["tname","aname","sname","cname"];
	var singleFilters = ["yana","chakra","location","translator","reviser"];
	//var tname=$("#tname").val();
	//var aname=$("#aname").val();
	//var author=$("#author").val();
	var division=$("#s_division").val();
	var names=$("#names").val();

	//var res=filter("tname",names);
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
			res=filter(column,$("#"+column).val(),res);
		}
	}
	//var res=filter("tname",tname);
	//if (aname) res=filter("aname",aname,res);
	//if (author) res=filter("author",author,res);
	//輸出陣列

	advResult=res;

	batchStart = 0;
	//陣列轉為 html
	var out=showPage();
	/*var out=res.map(function(item){
		return "<br/>sutraid"+item.sutraid+",page"+item.page+",tname"+
		item.tname.replace(tname,"<span class='hl'>"+tname+"</span>")+
		item.author.replace(author,"<span class='hl'>"+author+"</span>");

	})*/
	showPagination();
	$("#result").html( out);
}
