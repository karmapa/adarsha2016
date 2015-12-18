var prevfile=function(){
    ksa.prev({db:db,uti:toputi,count:1},function(err,res){
        fetchText(res[0].vpos);
    });
}

var nextfile=function(){
    ksa.next({db:db,uti:bottomuti,count:1},function(err,res){
        fetchText(res[0].vpos);
    });
}
