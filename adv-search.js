var batchStart = 0;
var batchSize = 5;
var advResult;


var systemReady=function(){

}
var systemReady2=function(){

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
	var tname=$("#tname").val();
	var aname=$("#aname").val();
	var author=$("#author").val();

	for(var i=batchStart*batchSize;i<advResult.length;i+=1){
		if(i==batchStart*batchSize+batchSize)break;
		Rtn+="<br/>sutraid"+advResult[i].sutraid+",page"+advResult[i].page+",tname"+
		advResult[i].tname.replace(tname,"<span class='hl'>"+tname+"</span>")+
		advResult[i].author.replace(author,"<span class='hl'>"+author+"</span>");;
	}
	return Rtn;
}

var doAdvSearch=function(){
	var tname=$("#tname").val();
	var aname=$("#aname").val();
	var author=$("#author").val();

	var res=filter("tname",tname);
	if (aname) res=filter("aname",aname,res);
	if (author) res=filter("author",author,res);
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
