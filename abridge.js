
var abridgeText=function(t){
    if (t.length<10) return t;
    else return t.substr(0,5)+"..."+t.substr(t.length-5);
}
