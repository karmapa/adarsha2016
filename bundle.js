(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ec2-user/ksana2015/adarsha2016/index.js":[function(require,module,exports){
if (typeof window!=="undefined"){
    window.kde=require("ksana-database");
    window.kse=require("ksana-search");
    window.ksa=require("ksana-simple-api");

    window.React=require("react");
    window.ReactDOM=require("react-dom");
    window.ksana2015treetoc=require("ksana2015-treetoc");
    window.ksana2015breadcrumbtoc=require("ksana2015-breadcrumbtoc");
    window.wylie=require("tibetan/wylie");        

    systemReady();
    systemReady2();
} else if (typeof module!=="undefined") {
    module.exports={kse:require("ksana-search"),kde:require("ksana-database"),ksa:require("ksana-simple-api")}
}

},{"ksana-database":"/home/ec2-user/ksana2015/node_modules/ksana-database/index.js","ksana-search":"/home/ec2-user/ksana2015/node_modules/ksana-search/index.js","ksana-simple-api":"/home/ec2-user/ksana2015/node_modules/ksana-simple-api/index.js","ksana2015-breadcrumbtoc":"/home/ec2-user/ksana2015/node_modules/ksana2015-breadcrumbtoc/index.js","ksana2015-treetoc":"/home/ec2-user/ksana2015/node_modules/ksana2015-treetoc/index.js","react":"/home/ec2-user/ksana2015/node_modules/react/react.js","react-dom":"/home/ec2-user/ksana2015/node_modules/react-dom/index.js","tibetan/wylie":"/home/ec2-user/ksana2015/node_modules/tibetan/wylie.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-analyzer/configs.js":[function(require,module,exports){
var tokenizers=require('./tokenizers');
var normalizeTbl=null;
var setNormalizeTable=function(tbl,obj) {
	if (!obj) {
		obj={};
		for (var i=0;i<tbl.length;i++) {
			var arr=tbl[i].split("=");
			obj[arr[0]]=arr[1];
		}
	}
	normalizeTbl=obj;
	return obj;
}
var normalize1=function(token) {
	if (!token) return "";
	token=token.replace(/[ \n\.,，。！．「」：；、]/g,'').trim();
	if (!normalizeTbl) return token;
	if (token.length==1) {
		return normalizeTbl[token] || token;
	} else {
		for (var i=0;i<token.length;i++) {
			token[i]=normalizeTbl[token[i]] || token[i];
		}
		return token;
	}
}
var isSkip1=function(token) {
	var t=token.trim();
	return (t=="" || t=="　" || t=="※" || t=="\n");
}
var normalize_tibetan=function(token) {
	return token.replace(/[།་ ]/g,'').trim();
}

var isSkip_tibetan=function(token) {
	var t=token.trim();
	return (t=="" || t=="　" ||  t=="\n");	
}
var simple1={
	func:{
		tokenize:tokenizers.simple
		,setNormalizeTable:setNormalizeTable
		,normalize: normalize1
		,isSkip:	isSkip1
	}
	
}
var tibetan1={
	func:{
		tokenize:tokenizers.tibetan
		,setNormalizeTable:setNormalizeTable
		,normalize:normalize_tibetan
		,isSkip:isSkip_tibetan
	}
}
module.exports={"simple1":simple1,"tibetan1":tibetan1}
},{"./tokenizers":"/home/ec2-user/ksana2015/node_modules/ksana-analyzer/tokenizers.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-analyzer/index.js":[function(require,module,exports){
/* 
  custom func for building and searching ydb

  keep all version
  
  getAPI(version); //return hash of functions , if ver is omit , return lastest
	
  postings2Tree      // if version is not supply, get lastest
  tokenize(text,api) // convert a string into tokens(depends on other api)
  normalizeToken     // stemming and etc
  isSpaceChar        // not a searchable token
  isSkipChar         // 0 vpos

  for client and server side
  
*/
var configs=require("./configs");
var config_simple="simple1";
var optimize=function(json,config) {
	config=config||config_simple;
	return json;
}

var getAPI=function(config) {
	config=config||config_simple;
	var func=configs[config].func;
	func.optimize=optimize;
	if (config=="simple1") {
		//add common custom function here
	} else if (config=="tibetan1") {

	} else throw "config "+config +"not supported";

	return func;
}

module.exports={getAPI:getAPI};
},{"./configs":"/home/ec2-user/ksana2015/node_modules/ksana-analyzer/configs.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-analyzer/tokenizers.js":[function(require,module,exports){
var tibetan =function(s) {
	//continuous tsheg grouped into same token
	//shad and space grouped into same token
	if (!s) return {tokens:[],offsets:[]};
	var offset=0;
	var tokens=[],offsets=[];
	s=s.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
	var arr=s.split('\n');

	for (var i=0;i<arr.length;i++) {
		var last=0;
		var str=arr[i];
		str.replace(/[།་ ]+/g,function(m,m1){
			tokens.push(str.substring(last,m1)+m);
			offsets.push(offset+last);
			last=m1+m.length;
		});
		if (last<str.length) {
			tokens.push(str.substring(last));
			offsets.push(offset+last);
		}
		if (i===arr.length-1) break;
		tokens.push('\n');
		offsets.push(offset+last);
		offset+=str.length+1;
	}

	return {tokens:tokens,offsets:offsets};
};
var isSpace=function(c) {
	return (c==" ") ;//|| (c==",") || (c==".");
}
var isCJK =function(c) {return ((c>=0x3000 && c<=0x9FFF) 
|| (c>=0xD800 && c<0xDC00) || (c>=0xFF00) ) ;}
var simple1=function(s) {
	if (!s) return {tokens:[],offsets:[]};
	var offset=0;
	var tokens=[],offsets=[];
	s=s.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
	var arr=s.split('\n');

	var pushtoken=function(t,off) {
		var i=0;
		if (t.charCodeAt(0)>255) {
			while (i<t.length) {
				var c=t.charCodeAt(i);
				offsets.push(off+i);
				tokens.push(t[i]);
				if (c>=0xD800 && c<=0xDFFF) {
					tokens[tokens.length-1]+=t[i]; //extension B,C,D
				}
				i++;
			}
		} else {
			tokens.push(t);
			offsets.push(off);	
		}
	}
	for (var i=0;i<arr.length;i++) {
		var last=0,sp="";
		str=arr[i];
		str.replace(/[_0-9A-Za-z]+/g,function(m,m1){
			while (isSpace(sp=str[last]) && last<str.length) {
				tokens[tokens.length-1]+=sp;
				last++;
			}
			pushtoken(str.substring(last,m1)+m , offset+last);
			offsets.push(offset+last);
			last=m1+m.length;
		});

		if (last<str.length) {
			while (isSpace(sp=str[last]) && last<str.length) {
				tokens[tokens.length-1]+=sp;
				last++;
			}
			pushtoken(str.substring(last), offset+last);
			
		}		
		offsets.push(offset+last);
		offset+=str.length+1;
		if (i===arr.length-1) break;
		tokens.push('\n');
	}

	return {tokens:tokens,offsets:offsets};

};

var simple=function(s) {
	var token='';
	var tokens=[], offsets=[] ;
	var i=0; 
	var lastspace=false;
	var addtoken=function() {
		if (!token) return;
		tokens.push(token);
		offsets.push(i);
		token='';
	}
	while (i<s.length) {
		var c=s.charAt(i);
		var code=s.charCodeAt(i);
		if (isCJK(code)) {
			addtoken();
			token=c;
			if (code>=0xD800 && code<0xDC00) { //high sorragate
				token+=s.charAt(i+1);i++;
			}
			addtoken();
		} else {
			if (c=='&' || c=='<' || c=='?' || c=="," || c=="."
			|| c=='|' || c=='~' || c=='`' || c==';' 
			|| c=='>' || c==':' 
			|| c=='=' || c=='@'  || c=="-" 
			|| c==']' || c=='}'  || c==")" 
			//|| c=='{' || c=='}'|| c=='[' || c==']' || c=='(' || c==')'
			|| code==0xf0b || code==0xf0d // tibetan space
			|| (code>=0x2000 && code<=0x206f)) {
				addtoken();
				if (c=='&' || c=='<'){ // || c=='{'|| c=='('|| c=='[') {
					var endchar='>';
					if (c=='&') endchar=';'
					//else if (c=='{') endchar='}';
					//else if (c=='[') endchar=']';
					//else if (c=='(') endchar=')';

					while (i<s.length && s.charAt(i)!=endchar) {
						token+=s.charAt(i);
						i++;
					}
					token+=endchar;
					addtoken();
				} else {
					token=c;
					addtoken();
				}
				token='';
			} else {
				if (c==" ") {
					token+=c;
					lastspace=true;
				} else {
					if (lastspace) addtoken();
					lastspace=false;
					token+=c;
				}
			}
		}
		i++;
	}
	addtoken();
	return {tokens:tokens,offsets:offsets};
}
module.exports={simple:simple,tibetan:tibetan};
},{}],"/home/ec2-user/ksana2015/node_modules/ksana-database/bsearch.js":[function(require,module,exports){
'use strict';
var indexOfSorted = function (array, obj, near) {
  var low = 0, high = array.length, mid;
  while (low < high) {
    mid = (low + high) >> 1;
    if (array[mid] === obj) return mid;
    array[mid] < obj ? low = mid + 1 : high = mid;
  }
  if (near) return low;
  else if (array[low] === obj) return low;else return -1;
};
var indexOfSorted_str = function (array, obj, near) { 
  var low = 0,
  high = array.length;
  while (low < high) {
    var mid = (low + high) >> 1;
    if (array[mid]===obj) return mid;
    //(array[mid].localeCompare(obj)<0) ? low = mid + 1 : high = mid;
    array[mid]<obj ? low=mid+1 : high=mid;
  }
  if (near) return low;
  else if (array[low]===obj) return low;else return -1;
};


var bsearch=function(array,value,near) {
	var func=indexOfSorted;
	if (typeof array[0]=="string") func=indexOfSorted_str;
	return func(array,value,near);
}
var bsearchNear=function(array,value) {
	return bsearch(array,value,true);
}

module.exports=bsearch;
},{}],"/home/ec2-user/ksana2015/node_modules/ksana-database/index.js":[function(require,module,exports){
module.exports=require("./kde");
},{"./kde":"/home/ec2-user/ksana2015/node_modules/ksana-database/kde.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-database/kde.js":[function(require,module,exports){
// Ksana Database Engine

//   2015/1/2 , 
//   move to ksana-database
//   simplified by removing document support and socket.io support
//   2015/5/18 , add RPC support, move common method to method.js

var localPool={};
var apppath="";
var bsearch=require("./bsearch");
var Kdb=require('ksana-jsonrom');
var kdbs=[]; //available kdb , id and absolute path
var strsep="\uffff";
var kdblisted=false;

var method=require("./method");
var analyzer=require("ksana-analyzer");

var opening="";

var createLocalEngine=function(kdb,opts,cb,context) {

	var engine={kdb:kdb, queryCache:{}, postingCache:{}, cache:{}, TOC:{} , timing:{}};
	if (typeof context=="object") engine.context=context;
	method.setup(engine);
	//speedy native functions
	if (kdb.fs.mergePostings) {
		engine.mergePostings=kdb.fs.mergePostings.bind(kdb.fs);
	}
	var setPreload=function(res) {
		engine.dbname=res[0].name;
		engine.ready=true;
		var meta = engine.get("meta");
		if ((meta.indexer||10)<16) {
			require("./method10").setup(engine);
		}

		var config=meta.config;
		engine.sidsep=meta.sidsep||"@";
		if (config) engine.analyzer=analyzer.getAPI(config);
		if (opts.metaonly) engine.meta=engine.get("meta");// kdb will be closed soon, getSync is not available
	}

	var t=new Date();
	var preload=method.getPreloadField(opts.preload);
	if (opts.metaonly) {
			preload=["meta"];
	}

	method.gets.apply(engine,[ preload, {recursive:true},function(res){
		setPreload(res);
		engine.timing.preload=new Date()-t;
		//console.log(engine.timing.preload,preload)
		cb.apply(engine.context,[engine]);
	}]);
	return engine;
}

 //TODO delete directly from kdb instance
 //kdb.free();
var closeLocal=function(kdbid) {
	var engine=localPool[kdbid];
	if (engine) {
		engine.kdb.free();
		delete localPool[kdbid];
	}
}


var getLocalTries=function(kdbfn,cb) {
	kdbid=kdbfn.replace('.kdb','');
	var tries= ["./"+kdbid+".kdb"
	           ,"../"+kdbid+".kdb"
	];

	for (var i=0;i<kdbs.length;i++) {
		if (kdbs[i][0]==kdbid) {
			tries.push(kdbs[i][1]);
		}
	}
	return tries;;
}

var openLocalReactNative=function(kdbid,opts,cb,context) {
	if (kdbid.indexOf(".kdb")==-1) kdbid+=".kdb";

	var engine=localPool[kdbid];
	if (engine) {
		cb.apply(context||engine.context,[0,engine]);
		return;
	}

	if (kdbid==opening) {
		throw "nested open kdb!! "+kdbid;
	}
	opening=kdbid;
	new Kdb.open(kdbid,function(err,kdb){
		if (err) {
			cb.apply(context,[err]);
		} else {
			createLocalEngine(kdb,opts,function(engine){
				engine.dbname=kdbid.replace(".kdb","");
				if (opts.metaonly) { //free the file handle, and do not add to localPool
					engine.kdb.free();
				} else {
					localPool[kdbid]=engine;
				}

				opening='';
				cb.apply(context||engine.context,[0,engine]);
			},context);
		}
	});
}


var openLocalKsanagap=function(kdbid,opts,cb,context) {
	var kdbfn=kdbid;


	var engine=localPool[kdbid];
	if (engine) {
		cb.apply(context||engine.context,[0,engine]);
		return;
	}
	var tries=getLocalTries(kdbfn);

	for (var i=0;i<tries.length;i++) {
		if (fs.existsSync(tries[i])) {
			//console.log("kdb path: "+nodeRequire('path').resolve(tries[i]));
			var kdb=new Kdb.open(tries[i],function(err,kdb){
				if (err) {
					cb.apply(context,[err]);
				} else {
					createLocalEngine(kdb,opts,function(engine){
						localPool[kdbid]=engine;
						cb.apply(context||engine.context,[0,engine]);
					},context);
				}
			});
			return null;
		}
	}
	if (cb) cb.apply(context,[kdbid+" not found"]);
	return null;
}
var openLocalNode=function(kdbid,opts,cb,context) {
	var fs=require('fs');

	var engine=localPool[kdbid];
	if (engine) {
		cb.apply(context||engine.context,[0,engine]);
		return;
	}

	if (kdbid==opening) {
		throw "nested open kdb!! "+kdbid;
	}
	opening=kdbid;

	var tries=getLocalTries(kdbid);
	for (var i=0;i<tries.length;i++) {
		if (fs.existsSync(tries[i])) {

			new Kdb.open(tries[i],function(err,kdb){
				if (err) {
					cb.apply(context||engine.content,[err]);
				} else {
					createLocalEngine(kdb,opts,function(engine){
						engine.dbname=kdbid.replace(".kdb","");
						if (opts.metaonly) { //free the file handle, and do not add to localPool
							engine.kdb.free();
						} else {
							localPool[kdbid]=engine;
						}
						opening="";
						cb.apply(context||engine.context,[0,engine]);
					},context);
				}
			});
			return null;
		}
	}
	if (cb) cb.apply(context,[kdbid+" not found"]);
	return null;
}
var openLocalFile=function(file,opts,cb,context) {	
    var kdbid=file.name.substr(0,file.name.length-4);

		if (kdbid===opening) {
			throw "nested open kdb!! "+kdbid;
		}
		opening=kdbid;

		var engine=localPool[kdbid];
		if (engine) {
			cb.apply(context||engine.context,[0,engine]);
			return;
		}

		new Kdb.open(file,function(err,handle){
			createLocalEngine(handle,opts,function(engine){
				engine.dbname=kdbid.replace(".kdb","");
				localPool[kdbid]=engine;
				opening="";
				cb.apply(context||engine.context,[0,engine]);
			},context);
		});
}

var openLocalHtml5=function(kdbid,opts,cb,context) {	
	var engine=localPool[kdbid];
	var kdbfn=kdbid;
	if (kdbfn.indexOf(".kdb")==-1) kdbfn+=".kdb";

	if (kdbid==opening) {
		throw "nested open kdb!! "+kdbid;
	}
	opening=kdbid;

	new Kdb.open(kdbfn,function(err,handle){
		if (err) {
			opening="";
			var remoteurl=window.location.origin+window.location.pathname+kdbid;
			if (kdbid.indexOf("/")>-1) remoteurl=window.location.origin+'/'+kdbid;
			return kde_remote(remoteurl,opts,cb,context);
			//cb.apply(context,[err]);
		} else {
			createLocalEngine(handle,opts,function(engine){
				engine.dbname=kdbid.replace(".kdb","");
				localPool[kdbid]=engine;
				opening="";
				cb.apply(context||engine.context,[0,engine]);
			},context);
		}
	});
}

var kde_remote=require("./kde_remote");
//omit cb for syncronize open

var _open=function(kdbid,opts,cb,context)  {
	if (typeof opts=="function") { //no opts
		if (typeof cb=="object") context=cb;
		cb=opts;
		opts={};
	}

	if (typeof File!=="undefined" && kdbid.constructor===File) {
		return openLocalFile(kdbid,opts,cb,context);
	}

	if (kdbid.indexOf("http")==0) {
		return kde_remote(kdbid,opts,cb,context);
	}
	
	var engine=localPool[kdbid];
	if (engine) {
		if (cb) cb.apply(context||engine.context,[0,engine]);
		return engine;
	}

	var platform=require("./platform").getPlatform();
	if (platform=="node-webkit" || platform=="node") {
		openLocalNode(kdbid,opts,cb,context);
	} else if (platform=="html5" || platform=="chrome"){
		openLocalHtml5(kdbid,opts,cb,context);		
	} else if (platform.substr(0,12)=="react-native") {
		openLocalReactNative(kdbid,opts,cb,context);	
	} else {
		openLocalKsanagap(kdbid,opts,cb,context);	
	}
}
var open=function(kdbid,opts,cb,context) {
	if (!opening) _open(kdbid,opts,cb,context);
	else {
		if (typeof opts==="function") {
			cb=opts;
		}
		cb("opening "+opening);
	}
}
var setPath=function(path) {
	apppath=path;
	console.log("set path",path)
}
//return kdb names in array of string
var enumKdb=function(opts,cb,context){
	if (typeof opts==="function") {
		context=cb;
		cb=opts;
		opts={};
	}	
	require("./listkdb")(opts,function(files){
		kdbs=files;
		if (cb) cb.call(context, kdbs.map(function(k){return k[0]}) );
	});
}

//return object for each kdb
var listKdb=function(cb,context){

	if (API.rpc) {
		API.rpc.list({},function(databases){
			cb.call(context,databases);
		});
	} else {
		require("./listkdb")(function(files){
			var databases=files.map(function(k){
				var relpath=k[1].match( /([^\/]+?\/[^\/]+?)\.kdb/)[1];
				return {shortname:k[0],folder:relpath.split("/")[0],fullname:relpath};
			});
			cb.call(context,databases);
		});
	}
}

var API={open:open,setPath:setPath, close:closeLocal, enumKdb:enumKdb, bsearch:bsearch,
kdbs:kdbs,listKdb:listKdb};

var platform=require("./platform").getPlatform();
if (platform=="node-webkit" || platform=="node" || platform.substr(0,12)=="react-native") {
	enumKdb();
} else if (typeof io!=="undefined") {
	API.rpc=require("./rpc_kde"); //for browser only
}
module.exports=API;
},{"./bsearch":"/home/ec2-user/ksana2015/node_modules/ksana-database/bsearch.js","./kde_remote":"/home/ec2-user/ksana2015/node_modules/ksana-database/kde_remote.js","./listkdb":"/home/ec2-user/ksana2015/node_modules/ksana-database/listkdb.js","./method":"/home/ec2-user/ksana2015/node_modules/ksana-database/method.js","./method10":"/home/ec2-user/ksana2015/node_modules/ksana-database/method10.js","./platform":"/home/ec2-user/ksana2015/node_modules/ksana-database/platform.js","./rpc_kde":"/home/ec2-user/ksana2015/node_modules/ksana-database/rpc_kde.js","fs":false,"ksana-analyzer":"/home/ec2-user/ksana2015/node_modules/ksana-analyzer/index.js","ksana-jsonrom":"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/index.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-database/kde_remote.js":[function(require,module,exports){
var pool={};
var strsep="\uffff";
var method=require("./method");
var verbose=false;
var analyzer=require("ksana-analyzer");

var getRemote=function(path,opts,cb) {

	if (typeof opts==="function") {
		cb=opts;
		opts={};
	}

	opts=opts||{};
	
	var $kde=require("./rpc_kde");

	var engine=this;
	var kdbid=engine.kdb;
	kdbid=kdbid.substr(window.location.origin.length+1).replace(".kdb","");	

	if (typeof opts=="function") {
		cb=opts;
		opts={recursive:false};
	}
	opts.recursive=opts.recursive||false;
	if (typeof path=="string") path=[path];

	if (path[0] instanceof Array) { //multiple paths
		var paths=[],output=[];
		for (var i=0;i<path.length;i++) {
			var cachepath=path[i].join(strsep);
			var data=engine.cache[cachepath];
			if (typeof data!="undefined") {
				paths.push(null);//  place holder for LINE 28
				output.push(data); //put cached data into output
			} else{
				engine.fetched++;
				paths.push(path[i]); //need to ask server
				output.push(null); //data is unknown yet
			}
		}
		//now ask server for unknown datum
		engine.traffic++;
		var newopts={recursive:!!opts.recursive, address:opts.address,
			key:paths,db:kdbid};
		$kde.get(newopts,function(datum){
			//merge the server result with cached 
			for (var i=0;i<output.length;i++) {
				if (datum[i] && paths[i]) {
					var cachekey=paths[i].join(strsep);
					engine.cache[cachekey]=datum[i];
					output[i]=datum[i];
				}
			}
			if (cb) cb.apply(engine.context,[output]);	
		});
	} else { //single path
		var cachepath=path.join(strsep);
		var data=engine.cache[cachepath];
		if (typeof data!="undefined") {
			if (cb) cb.apply(engine.context,[data]);
			return data;//in cache , return immediately
		} else {
			engine.traffic++;
			engine.fetched++;
			var opts={key:path,recursive:!!opts.recursive,db:kdbid};
			$kde.get(opts,function(data){
				engine.cache[cachepath]=data;
				if (cb) cb.apply(engine.context,[data]);	
			});
		}
	}
}

var createRemoteEngine=function(kdb,opts,cb,context) {

	var engine={kdb:kdb, queryCache:{}, postingCache:{}, cache:{}, TOC:{}, fetched:0, traffic:0, timing:{}};
	if (typeof context=="object") engine.context=context;
	method.setup(engine);
	engine.get=getRemote;

	var setPreload=function(res) {
		engine.dbname=res[0].name;
		//engine.customfunc=customfunc.getAPI(res[0].config);
		engine.ready=true;
		var meta=engine.get("meta");
		if ((meta.indexer||10)<16) {
			require("./method10").setup(engine);
		}

		var config=meta.config;
		if (config) engine.analyzer=analyzer.getAPI(config);

		engine.sidsep=meta.sidsep||"@";
	}
	var preload=method.getPreloadField(opts.preload);
	var opts={recursive:true};
	if (verbose) console.time("preload Remote");
	method.gets.apply(engine,[ preload, opts,function(res){
		setPreload(res);
		if (verbose) console.timeEnd("preload Remote");
		cb.apply(engine.context,[engine]);
	}]);
	return engine;
}

var openRemote=function(kdbid,opts,cb,context) {
	if (typeof opts=="function") {
		cb=opts;
		context=cb;
		opts={};
	}

	var engine=pool[kdbid];
	if (engine) {
		if (cb) cb.apply(context||engine.context,[0,engine]);
		return engine;
	}
	if (verbose) console.log("open remote",kdbid);

	createRemoteEngine(kdbid,opts,function(engine){
		pool[kdbid]=engine;
		cb.apply(context||engine.context,[0,engine]);
	},context);

	pool[kdbid]=engine;
}

var close=function(kdbid) {
	var engine=pool[kdbid];
	if (engine) {
		delete pool[kdbid];
	}
}

module.exports=openRemote;
},{"./method":"/home/ec2-user/ksana2015/node_modules/ksana-database/method.js","./method10":"/home/ec2-user/ksana2015/node_modules/ksana-database/method10.js","./rpc_kde":"/home/ec2-user/ksana2015/node_modules/ksana-database/rpc_kde.js","ksana-analyzer":"/home/ec2-user/ksana2015/node_modules/ksana-analyzer/index.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-database/listkdb.js":[function(require,module,exports){
/* return array of dbid and absolute path*/
//var html5fs=require("./html5fs");

var listkdb_html5=function(cb,context) {
	kfs.readDir(function(kdbs){
			cb.call(this,kdbs);
	},context||this);		
}
var listkdb_rn_ios=function(opts,cb,context) {
	var kfs=require("react-native").NativeModules.KsanaFileSystem;
	var list=kfs.listKdb;
	if (opts&&opts.stock) {
		list=kfs.listStockKdb;
	}
	list(function(kdbs){
		if (kdbs) {
			cb.call(context||this,kdbs.split("\uffff").map(function(item){return [item]}));	
		} else {
			cb.call(context||this,[]);
		}
	});
}
var listkdb_rn_android=function(opts,cb,context) {
	var kfs=require("react-native").NativeModules.KsanaFileSystem;
	var list=kfs.listKdb;
	if (opts&&opts.stock) {
		list=kfs.listStockKdb;
	}	
	list(function(kdbs){
		if (kdbs) {
			cb.call(context||this,kdbs.split("\uffff").map(function(item){return [item]}));	
		} else {
			cb.call(context||this,[]);
		}
	});
}


var listkdb_rpc=function() {
	var fs=require("fs");
	var path=require("path");
	var dir=process.cwd();
	var files=fs.readdirSync(dir);
	var output=filterkdb(files,dir);
	return output;
}
var filterkdb=function(files,parent){
	var output=[];
	var fs=require("fs");
	var path=require("path");
	if (parent.length==3 && parent[1]==":") {
		return output;
	}
	files.map(function(f){
		var subdir=parent+path.sep+f;
		var stat=fs.statSync(subdir);
		if (stat.isDirectory()) {
			var subfiles=fs.readdirSync(subdir);
			for (var i=0;i<subfiles.length;i++) {
				var file=subfiles[i];
				var idx=file.indexOf(".kdb");
				if (idx>-1&&idx==file.length-4) {
					var fn=subdir+path.sep+file;
					fn=fn.replace(/\\/g,"/");
					output.push([ file.substr(0,file.length-4), fn]);
				}
			}
		}
	});
	return output;
}	


var listkdb_node=function(cb,context){
	var fs=require("fs");
	var path=require("path")
	var parent=path.resolve(process.cwd(),"..");
	var files=fs.readdirSync(parent);
	var output=filterkdb(files,parent);

	if (cb) cb.call(context,output);
	return output;
}
var fileNameOnly=function(fn) {
	var at=fn.lastIndexOf("/");
	if (at>-1) return fn.substr(at+1);
	return fn;
}
var listkdb_ksanagap=function(cb,context) {
	var output=[];

	var formatoutput=function(apps) {
		for (var i=0;i<apps.length;i++) {
			var app=apps[i];
			if (app.files) for (var j=0;j<app.files.length;j++) {
				var file=app.files[j];
				if (file.substr(file.length-4)==".kdb") {
					output.push([app.dbid,fileNameOnly(file)]);
				}
			}
		};	
		cb.call(context,output);	
	}
	if (kfs.listApps.length==1) {
		formatoutput(JSON.parse(kfs.listApps()));
	} else {
		kfs.listApps(function(apps){
			formatoutput(JSON.parse(apps));
		});
	}
}
var listkdb=function(opts,cb,context) {
	if (typeof opts==="function") {
		context=cb;
		cb=opts;
		opts={};
	}

	var platform=require("./platform").getPlatform();
	var files=[];
	if (platform=="node" || platform=="node-webkit") {
		listkdb_node(cb,context);
	} else if (platform=="chrome") {
		listkdb_html5(cb,context);
	} else if (platform=="react-native-android"){
		listkdb_rn_android(opts,cb,context);
	} else if (platform=="react-native-ios"){
		listkdb_rn_ios(opts,cb,context);
	} else {
		listkdb_ksanagap(cb,context);
	}
}

listkdb.sync=listkdb_rpc;
module.exports=listkdb;
},{"./platform":"/home/ec2-user/ksana2015/node_modules/ksana-database/platform.js","fs":false,"path":false,"react-native":"react-native"}],"/home/ec2-user/ksana2015/node_modules/ksana-database/method.js":[function(require,module,exports){
var bsearch=require("./bsearch");
var verbose=false;

var gets=function(paths,opts,cb) { //get many data with one call

	if (!paths) return ;
	if (typeof paths=='string') {
		paths=[paths];
	}
	var engine=this, output=[];

	var makecb=function(path){
		return function(data){
				if (!(data && typeof data =='object' && data.__empty)) output.push(data);
				engine.get(path,opts,taskqueue.shift());
		};
	};

	var taskqueue=[];
	for (var i=0;i<paths.length;i++) {
		if (typeof paths[i]=="null") { //this is only a place holder for key data already in client cache
			output.push(null);
		} else {
			taskqueue.push(makecb(paths[i]));
		}
	};

	taskqueue.push(function(data){
		output.push(data);
		cb.apply(engine.context||engine,[output,paths]); //return to caller
	});

	taskqueue.shift()({__empty:true}); //run the task
}


var localengine_get=function(path,opts,cb,context) {
	var engine=this;

	if (typeof opts=="function") {
		context=cb;
		cb=opts;
		opts={recursive:false};
	}
	if (!path) {
		if (cb) cb.apply(context,[null]);
		return null;
	}

	if (typeof cb!="function") {
		return engine.kdb.get(path,opts);
	}

	//if (engine.busy) {
	//	var msg="engine is busy, getting "+JSON.stringify(this.busy)+" cuurent path"+JSON.stringify(path);
	//	cb(msg);
	//}

	if (typeof path==="string") {
		path=[path];
	}

	if (typeof path[0] =="string") {
		//engine.busy=path;
		return engine.kdb.get(path,opts,function(data){
			//engine.busy=null;
			cb.call(context,data);//return top level keys
		},context);
	} else if (typeof path[0] =="object") {
		return gets.call(engine,path,opts,function(data){
			cb.call(context,data);//return top level keys
		},context);
	} else {
		//engine.busy=path;
		engine.kdb.get([],opts,function(data){
			//engine.busy=null;
			cb.call(context,data);//return top level keys
		},context);
	}
};	
var getFileRange=function(i) {
	var engine=this;

	var filesegcount=engine.get(["filesegcount"]);

	if (filesegcount) {
		if (i==0) {
			return {start:0,end:filesegcount[0]-1};
		} else {
			return {start:filesegcount[i-1],end:filesegcount[i]-1};
		}
	}
	//old buggy code
	//var filenames=engine.get(["filenames"]);
	var fileoffsets=engine.get(["fileoffsets"]);
	var segoffsets=engine.get(["segoffsets"]);
	var filestart=fileoffsets[i], fileend=fileoffsets[i+1]-1;

	var start=bsearch(segoffsets,filestart,true);

	var end=bsearch(segoffsets,fileend,true);
	return {start:start,end:end};
}

var absSegToFileSeg=function(absoluteseg) {
	var filesegcount=this.get("filesegcount");
	var s=absoluteseg;
	var file=0;
	while (s>=filesegcount[file]) {
		file++;
	}
	if (file) {
		s=Math.abs(filesegcount[file-1]-s);	
	} else {
		s=absoluteseg;
	}
	
	return {file:file,seg:s};
}

var fileSegToAbsSeg=function(file,seg) {
	if (file==0)return seg;
	return this.get("filesegcount")[file-1]+(seg);
}

//var vposToFileSeg=function(engine,vpos) {
//    var segoffsets=engine.get("segoffsets");
//    var fileoffsets=engine.get(["fileoffsets"]);
//    var segnames=engine.get("segnames");
//    var fileid=bsearch(fileoffsets,vpos+1,true);
//    fileid--;
//    var segid=bsearch(segoffsets,vpos+1,true);
//	var range=engine.getFileRange(fileid);
//	segid-=range.start;
//    return {file:fileid,seg:segid};
//}

/*
var searchSeg=function(segname,near) {
	var i=bsearch(this.get("segnames"),segname,near);
	if (i>-1) {
		var fileseg=absSegToFileSeg.apply(this,[i]);
		return {file:fileseg.file,seg:fileseg.seg,absseg:i};
	}
	return null;
}

//return array of object of nfile nseg given segname
var findSeg=function(segname,max) {
	meta=this.get("meta");
	if (meta.sortedSegNames) {
		return findSeg_sorted(segname);
	}
	var segnames=this.get("segnames");
	var out=[];
	for (var i=0;i<segnames.length;i++) {
		if (segnames[i]==segname) {
			var fileseg=absSegToFileSeg.apply(this,[i]);
			out.push({file:fileseg.file,seg:fileseg.seg,absseg:i});
			if (out.length>=max) break;
		}
	}
	return out;
}
*/
/*
var findFile=function(filename) {
	var filenames=this.get("filenames");
	for (var i=0;i<filenames.length;i++) {
		if (filenames[i]===filename) return i;
	}
	return -1;
}
*/

var getFileSegOffsets=function(i) {
	var segoffsets=this.get("segoffsets");
	var range=getFileRange.apply(this,[i]);
	return segoffsets.slice(range.start,range.end+1);	
}
var absSegFromVpos=function(vpos) { 
	var segoffsets=this.get(["segoffsets"]);
	var i=bsearch(segoffsets,vpos,true);
	if (segoffsets[i]>vpos && segoffsets[i-1]<vpos) {
		return i-1;
	}
	return i;
}

//accept vpos or [vpos]
var fileSegFromVpos=function(vpos) { 
	var one=false;
	if (typeof vpos==="number") {
		vpos=[vpos];
		one=true;
	}
	var out=[],i;
	for (i=0;i<vpos.length;i++) {
		out.push(absSegToFileSeg.call(this,absSegFromVpos.call(this,vpos[i])));
	}

	if (one)return out[0];
	return out;
}
var fileSegToVpos=function(f,s) {
	var segoffsets=this.get(["segoffsets"]);
	var seg=fileSegToAbsSeg.call(this,f,s);
	return segoffsets[seg]||0;
}
var absSegToVpos=function(seg) {
	var segoffsets=this.get("segoffsets");
	return segoffsets[seg]||0;	
}

/*
var getFileSegNames=function(i) {
	var range=getFileRange.apply(this,[i]);
	var segnames=this.get("segnames");
	return segnames.slice(range.start,range.end+1);
}
*/



var getPreloadField=function(user) {
	var preload=[["meta"],["filenames"],["fileoffsets"],["segoffsets"],["filesegcount"],["segnames"]];

	if (user && user.length) { //user supply preload
		for (var i=0;i<user.length;i++) {
			if (users[i]) {
				if (preload.indexOf(user[i])==-1) {
					preload.push(user[i]);
				}				
			}
		}
	}
	return preload;
}

/*
var segOffset=function(segname) {
	var engine=this;
	if (arguments.length>1) throw "argument : segname ";

	var segNames=engine.get("segnames");
	var segOffsets=engine.get("segoffsets");

	var i=segNames.indexOf(segname);
	return (i>-1)?segOffsets[i]:0;
}
*/
/*
var fileOffset=function(fn) {
	var engine=this;
	var filenames=engine.get("filenames");
	var offsets=engine.get("fileoffsets");
	var i=filenames.indexOf(fn);
	if (i==-1) return null;
	return {start: offsets[i], end:offsets[i+1]};
}

var folderOffset=function(folder) {
	var engine=this;
	var start=0,end=0;
	var filenames=engine.get("filenames");
	var offsets=engine.get("fileoffsets");
	for (var i=0;i<filenames.length;i++) {
		if (filenames[i].substring(0,folder.length)==folder) {
			if (!start) start=offsets[i];
			end=offsets[i];
		} else if (start) break;
	}
	return {start:start,end:end};
}
*/
var getTOCNames=function() {
	return engine.get("meta").tocs;
}

var buildToc = function(toc) {
	if (!toc || !toc.length || toc.built) return;
	var depths=[];
 	var prev=0;
 	if (toc.length>1) {
 		toc[0].o=true;//opened
 	}
 	for (var i=0;i<toc.length;i++) delete toc[i].n;
	for (var i=0;i<toc.length;i++) {
	    var depth=toc[i].d||toc[i].depth;
	    if (prev>depth) { //link to prev sibling
	      if (depths[depth]) toc[depths[depth]].n = i;
	      for (var j=depth;j<prev;j++) depths[j]=0;
	    }
    	depths[depth]=i;
    	prev=depth;
	}
	toc.built=true;
	return toc;
}
/*
var getDefaultTOC=function(opts,cb,context) {
	var toc=this.TOC["_"];
	if (toc) {
		cb.call(context,toc);
		return toc;
	}

	var out=[{t:"root",d:0,vpos:1}];
	var fileoffsets=this.get("fileoffsets");
	var segoffsets=this.get("segoffsets");
	var segnames=this.get("segnames");
	var filenames=this.get("filenames");
	var depth=1;
	//TODO , convert file folder structure to depth
	for (var i=0;i<filenames.length;i++){
		var fn=filenames[i];
		fn=fn.substr(0,fn.lastIndexOf("."));
		out.push({t:fn,d:depth, vpos:fileoffsets[i]});
		var range=getFileRange.apply(this,[i]);
		for (var j=range.start;j<range.end+1;j++) {
			out.push({t:segnames[j],d:depth+1, vpos:segoffsets[j]||1});
		}
	}
	this.TOC["_"]=out;
  cb.call(context,out);
	return out;		
}
*/
var getTOC=function(opts,cb,context) {
	var engine=this;
	opts=opts||{};
	var tocname=opts.tocname;
	var rootname=opts.rootname||opts.tocname;

	if (!tocname) {
		cb("tocname cannot be empty");
		return;
			//return getDefaultTOC.call(this,opts,cb,context);
	}
	

	var toc=engine.TOC[tocname];
	if (toc) {
		cb.call(context,toc);
		return toc;
	}

	var keys=[["fields",tocname],["fields",tocname+"_depth"],["fields",tocname+"_vpos"]];
	engine.get(keys,{recursive:true},function(){
	  var texts=engine.get(["fields",tocname]);
	  var depths=engine.get(["fields",tocname+"_depth"]);
	  var vpos=engine.get(["fields",tocname+"_vpos"]);

	  var out=[{d:0,t:rootname}];
	  if (texts) for (var i=0;i<texts.length;i++) {
	    out.push({t:texts[i],d:depths[i], vpos:vpos[i]});
	  }

	  engine.TOC[tocname]=out;
	  out=buildToc(out);
	  cb.call(context,out);
	  return out; 		
	});
}


var parseUti=function(uti){
	//uti = filename@sid , nfile@sid
	
	//return [nfile, sid];

	var isFileNumber=function(f){
		var r=f.match(/\d+/);
		return (r&&(r[0]===f));
	}


	var one=false,out=[];
	if (typeof uti==="string") {
		uti=[uti];
		one=true;
	}
	var filenames=this.get("filenames");
	out=uti.map(function(u){
		var r=u.split(this.sidsep);
		if (isFileNumber(r[0])) {
			return [parseInt(r[0]),r[1],filenames[parseInt(r[0])]];
		} else {
			var nfile=filenames.indexOf(r[0]);
			return [nfile,r[1], filenames[nfile]];
		}
		
	}.bind(this));

	if (one) return out[0];
	return out;
}

var getFileSegFromUti=function(uti,cb){
	if (typeof uti==="string") uti=[uti];
	//get file segments from uti
	//break uti to nfile@sid
	//get all files
	//load segment id of files
	//get nseg by indexOf sid
	var nfile_sid=uti.map(parseUti.bind(this));
	var nfiles=nfile_sid.map(function(item){return item[0]});
	this.loadSegmentId(nfiles,function(){
		var out=nfile_sid.map(function(ns){
			var segments=this.get(["segments",ns[0]]);
			if (!segments) {
				return {file:-1,seg:-1}	;
			}
			seg=segments.indexOf(ns[1]);
			return {file:ns[0],seg:seg};
		}.bind(this));
		cb(out);
	});
}

// make sure segments of nfiles in loaded 
var loadSegmentId=function(nfiles,cb){ //nfiles can be [nfile,nfile] or [ {file,seg},{file,seg}]
	var files={},db=this;

	nfiles.map(function(nfile){
		if (typeof nfile.file==="number") {
			files[nfile.file]=true;
		} else if (typeof nfile[0]==="number") {
			files[nfiles[0]]=true;
		} else if (typeof nfile==="number"){
			files[nfile]=true;
		}
	});

	var files=Object.keys(files).map(function(item){return parseInt(item)});
	var keys=files.map(function(file){
		return ['segments',file];
	});
	

	db.get(keys,function(data){
		cb.call(this,data);
	}.bind(this));
}

var vpos2uti=function(vpos,cb){
	//if cb is not supply , assuming segments already loaded
	var fileseg=this.fileSegFromVpos(vpos);
	var filenames=this.get("filenames");
	if (cb) {
		if (!(fileseg instanceof Array)) {
			fileseg=[fileseg];
		}

		var keys=fileseg.map(function(fseg){return ["segments",fseg.file]});

		this.get(keys,function(res){
				var out=fileseg.map(function(fseg,idx){
				return filenames[fseg.file]+this.sidsep+res[idx][fseg.seg];
			}.bind(this));
			cb(out);
		}.bind(this));

	} else {
		//support multiple convert
		var fseg=fileseg,one=false;
		if (typeof fileseg.file!=="undefined") {
			fseg=[fileseg]
			one=true;
		}

		var r=fseg.map(function(item){
			var segments=this.get(["segments",item.file]);
			return filenames[fileseg.file]+this.sidsep+segments[fileseg.seg];		
		}.bind(this));
		if (one) r=r[0];
		return r;
	}
}
var uti2vpos=function(uti,cb){ //sync function, ensure segment id is in memory
	//if cb is not supply , assuming segments already loaded	
	var one=false;
	var nfile_sid=this.parseUti(uti),i;
	var segoffsets=this.get("segoffsets");
	if (typeof uti==="string") {
		nfile_sid=[nfile_sid];
		one=true;
	}

	var getvpos=function(){
		var out=[],nfile,p;
		for (i=0;i<nfile_sid.length;i+=1) {
			nfile=nfile_sid[i][0];
			if (nfile>-1) {
				var segments=this.get(["segments",nfile]);
				var sid=nfile_sid[i][1];
				p=segments.indexOf(sid);
				var absseg=this.fileSegToAbsSeg(nfile,p);

				out.push(segoffsets[absseg]);
				
			}
		}		
		return out;
	}

	var nfiles=nfile_sid.map(function(item){return item[0]});
	if (cb) {
		this.loadSegmentId(nfiles,function(){

			out=getvpos.call(this);
			if (one) out=out[0];
			cb(out);
		}.bind(this));
	} else {
		out=getvpos.call(this);
		if (one) out=out[0];
		return out;
	}	
}

var fileSeg2uti=function(fseg,cb){
	var filenames=this.get("filenames");
	if (cb) {
		this.get(["segments",fseg.file],function(segments){
			cb(filenames[fseg.file]+this.sidsep+segments[fset.seg]);
		}.bind(this));
	} else {
		var segments=this.get(["segments",fseg.file]);
		return filenames[fseg.file]+this.sidsep+segments[fseg.seg];		
	}
}

var uti2fileSeg=function(uti,cb) {
	var fseg=this.parseUti(uti);
	var filenames=this.get("filenames");
	if (cb) {
		this.get(["segments",fseg[0]],function(segments){
			var seg=segments.indexOf(fseg[1]);
			cb({file:fseg[0],seg:seg});
		}.bind(this));
	} else {
		var segments=this.get(["segments",fseg[0]]);
		var seg=segments.indexOf(fseg[1]);
		return {file:fseg[0],seg:seg};
	}
}
var setup=function(engine) {
	engine.get=localengine_get;
	engine.getFileSegOffsets=getFileSegOffsets;
	engine.getFileRange=getFileRange;
	engine.absSegToFileSeg=absSegToFileSeg;
	engine.fileSegToAbsSeg=fileSegToAbsSeg;
	engine.fileSegFromVpos=fileSegFromVpos;
	engine.absSegFromVpos=absSegFromVpos;
	engine.absSegToVpos=absSegToVpos;
	engine.fileSegToVpos=fileSegToVpos;

	engine.getFileSegFromUti=getFileSegFromUti;
	engine.getTOC=getTOC;
	engine.getTOCNames=getTOCNames;

	engine.vpos2uti=vpos2uti;
	engine.uti2vpos=uti2vpos;
	engine.fileSeg2uti=fileSeg2uti;
	engine.uti2fileSeg=uti2fileSeg;
	engine.loadSegmentId=loadSegmentId;
	engine.parseUti=parseUti;
}

module.exports={setup:setup,getPreloadField:getPreloadField,gets:gets};

},{"./bsearch":"/home/ec2-user/ksana2015/node_modules/ksana-database/bsearch.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-database/method10.js":[function(require,module,exports){
/* old method for kdb has segnames but not segments */
var verbose=false;
var txt2absseg=function(txtid) {
	var absseg=this.txtid[txtid];
	if (isNaN(absseg)) return null;
	if (typeof absseg[0]==="number") absseg=absseg[0];
	return absseg;
}

var vpos2uti=function(vpos,cb){
	var segnames=this.get("segnames"),r;
	if (vpos instanceof Array) {
		r=	vpos.map(function(vp){
				return segnames[this.absSegFromVpos(vp)];
			}.bind(this))
	} else {
		var absseg=this.absSegFromVpos(vpos);
		r=segnames[absseg];
	}
	if (cb) cb(r);
	else return r;
}
var absSegToFileSeg=function(absoluteseg) {
	var filesegcount=this.get("filesegcount");
	var s=absoluteseg;
	var file=0;
	while (s>=filesegcount[file]) {
		file++;
	}
	if (file) {
		s=Math.abs(filesegcount[file-1]-s);	
	} else {
		s=absoluteseg;
	}
	
	return {file:file,seg:s};
}
var getFileRange=function(i) {
	var engine=this;
	var filesegcount=engine.get(["filesegcount"]);
	if (filesegcount) {
		if (i==0) {
			return {start:0,end:filesegcount[0]-1};
		} else {
			return {start:filesegcount[i-1],end:filesegcount[i]-1};
		}
	}
	var filenames=engine.get(["filenames"]);
	var fileoffsets=engine.get(["fileoffsets"]);
	var segoffsets=engine.get(["segoffsets"]);
	var filestart=fileoffsets[i], fileend=fileoffsets[i+1]-1;

	var start=bsearch(segoffsets,filestart,true);
	var end=bsearch(segoffsets,fileend,true);
	return {start:start,end:end};
}

var getFileSegNames=function(i) {
	var range=getFileRange.apply(this,[i]);
	var segnames=this.get("segnames");
	return segnames.slice(range.start,range.end+1);
}


var uti2absseg=function(uti) {
	var absseg=this.txtid[uti];
	if (isNaN(absseg)) return null;
	if (typeof absseg[0]==="number") absseg=absseg[0];
	return absseg;
}
var uti2fileSeg=function(uti) {
	var absseg=uti2absseg.call(this,uti);
	if (isNaN(absseg)) return;
	return absSegToFileSeg.call(this,absseg);
}

var uti2vpos=function(uti,cb){
	var segoffsets=this.get("segoffsets");
	var r;
	if (uti instanceof Array) {
		r=uti.map(function(u){
				var absseg=txt2absseg.call(this,u);
				return segoffsets[absseg];
			}.bind(this))
	} else {
		var absseg=txt2absseg.call(this,uti);
		r=segoffsets[absseg];
	}

	if (cb) cb(r);
	else return r;	
}
var buildSegnameIndex=function(engine){
	/* replace txtid,txtid_idx, txtid_invert , save 400ms load time */
	var segnames=engine.get("segnames");
	if (!segnames) {
		console.log("missing segnames, cannot build uti");
		return;
	}
	var segindex={};
	if (verbose) console.time("build segname index");
	for (var i=0;i<segnames.length;i++) {
		var segname=segnames[i];
		segindex[segname]=i;
	}
	if (verbose) console.timeEnd("build segname index");
	engine.txtid=segindex;
}

var nextTxtid=function(txtid) {
	var absseg=txt2absseg.call(this,txtid);
	if (isNaN(absseg)) return;
	var segnames=this.get("segnames");
	return segnames[absseg+1];
}
var prevTxtid=function(txtid) {
	var absseg=txt2absseg.call(this,txtid);
	if (isNaN(absseg)) return;
	var segnames=this.get("segnames");
	return segnames[absseg-1];
}
var setup=function(engine) {
	engine.vpos2uti=vpos2uti;
	engine.uti2vpos=uti2vpos;
	engine.uti2fileSeg=uti2fileSeg;
	engine.getFileSegNames=getFileSegNames;
	engine.nextTxtid=nextTxtid;
	engine.prevTxtid=prevTxtid;
	buildSegnameIndex(engine);
}
module.exports={setup:setup,buildSegnameIndex};
},{}],"/home/ec2-user/ksana2015/node_modules/ksana-database/platform.js":[function(require,module,exports){
var getPlatform=function() {
	if (typeof ksanagap=="undefined") {
		try {
			var react_native=require("react-native");
			try {
				var OS=react_native.Platform.OS;
				if (OS==='android') {
					platform="react-native-android";					
				} else {
					platform="react-native-ios";	
				}
			} catch (e) {
				platform='chrome';
			}
		} catch (e) {
			if (typeof process=="undefined") {
				platform="chrome";
			} else {
				platform="node";		
			}
		}
	} else {
		platform=ksanagap.platform;
	}
	return platform;
}
module.exports={getPlatform:getPlatform};
},{"react-native":"react-native"}],"/home/ec2-user/ksana2015/node_modules/ksana-database/rpc.js":[function(require,module,exports){
/*
	this is for browser, a simple wrapper for socket.io rpc
	
	for each call to server, create a unique id
	when server return, get the slot by unique id, and invoke callbacks.
*/
function GUID () {
  var S4 = function ()    {    return Math.floor(        Math.random() * 0x10000  ).toString(16);  };
  return (   S4() + S4() + "-" + S4() + "-" +  S4() + "-" + S4() + "-" +S4() + S4() + S4()    );
}

var RPCs={}; //*  key: unique calling id  */

var socket = io.connect(window.location.host);

var returnfromserver=function(res) {
	var slot=RPCs[res.fid];
	
	if (!slot) {
		throw "invalid fid "+res.fid;
		return;
	}
	
	if (res.success) {
		if (slot.successCB)  slot.successCB(res.err,res.response);
	} else {
		if (slot.errorCB)  slot.errorCB(res.err,res.response);
	}
	delete RPCs[res.fid]; //drop the slot
}

var pchost={
	exec: function(successCB, errorCB, service, action, params) {
		var fid=GUID();
		//create a slot to hold
		var slot={  fid:fid, successCB:successCB, errorCB:errorCB ,params:params, action:action, service:service};
		RPCs[fid]=slot;
		socket.emit('rpc',  { service: service, action:action, params: params , fid:fid });
	}
}

socket.on( 'rpc', returnfromserver );	 
window.host=pchost;
module.exports=pchost;
},{}],"/home/ec2-user/ksana2015/node_modules/ksana-database/rpc_kde.js":[function(require,module,exports){
var host=require("./rpc");

var makeinf=function(name) {
	return (
		function(opts,callback) {
			host.exec(callback,0,"kde",name,opts);
		});
}

var API={};
//TODO , create a cache object on client side to save network trafic on
//same getRaw
API.get=makeinf("get");
API.list=makeinf("list");

//API.closeAll=makeinf("closeAll");
//exports.version='0.0.13'; //this is a quick hack

host.exec(function(err,data){
	//console.log('version',err,data)
	exports.version=data;
},0,"kde","version",{});


module.exports=API;
},{"./rpc":"/home/ec2-user/ksana2015/node_modules/ksana-database/rpc.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/html5read.js":[function(require,module,exports){

/* emulate filesystem on html5 browser */
/* emulate filesystem on html5 browser */

var getFileSize=function(fn,cb) {
	var reader = new FileReader();
	reader.onload = function(){
		cb(reader.result.length);
	};
	reader.readAsDataURL(fn);
}
var read=function(handle,buffer,offset,length,position,cb) {//buffer and offset is not used
	var xhr = new XMLHttpRequest();
	xhr.open('GET', handle.url , true);
	var range=[position,length+position-1];
	xhr.setRequestHeader('Range', 'bytes='+range[0]+'-'+range[1]);
	xhr.responseType = 'arraybuffer';
	xhr.send();
	xhr.onload = function(e) {
		var that=this;
		setTimeout(function(){
			cb(0,that.response.byteLength,that.response);
		},0);
	}; 
}
var close=function(handle) {}
var fstatSync=function(handle) {
	throw "not implement yet";
}
var fstat=function(handle,cb) {
	throw "not implement yet";
}
var _openLocal=function(file,cb) {
	var handle={};
	handle.url=URL.createObjectURL(file);
	handle.fn=file.name.substr(file.name.indexOf("#")+1);
	handle.file=file;
	cb(handle);
}
var _open=function(fn_url,cb) {
		var handle={};
		if (fn_url.indexOf("filesystem:")==0){
			handle.url=fn_url;
			handle.fn=fn_url.substr( fn_url.lastIndexOf("/")+1);
		} else {
			handle.fn=fn_url;
			var url=API.files.filter(function(f){ return (f[0]==fn_url)});
			if (url.length) handle.url=url[0][1];
			else cb(null);
		}
		cb(handle);
}
var open=function(fn_url,cb) {
	if (typeof File !=="undefined" && fn_url.constructor ===File) {
		_openLocal.call(this,fn_url,cb);
		return;
	}

	if (!API.initialized) {init(1024*1024,function(bytes,fs){
		if (!fs) {
			cb(null);//cannot open , htmlfs is not available
			return;
		}
		_open.apply(this,[fn_url,cb]);
	},this)} else _open.apply(this,[fn_url,cb]);
}
var load=function(filename,mode,cb) {
	open(filename,mode,cb,true);
}
function errorHandler(e) {
	console.error('Error: ' +e.name+ " "+e.message);
}
var readdir=function(cb,context) {
	 var dirReader = API.fs.root.createReader();
	 var out=[],that=this;
		dirReader.readEntries(function(entries) {
			if (entries.length) {
				for (var i = 0, entry; entry = entries[i]; ++i) {
					if (entry.isFile) {
						out.push([entry.name,entry.toURL ? entry.toURL() : entry.toURI()]);
					}
				}
			}
			API.files=out;
			if (cb) cb.apply(context,[out]);
		}, function(){
			if (cb) cb.apply(context,[null]);
		});
}
var initfs=function(grantedBytes,cb,context) {
	webkitRequestFileSystem(PERSISTENT, grantedBytes,  function(fs) {
		API.fs=fs;
		API.quota=grantedBytes;
		readdir(function(){
			API.initialized=true;
			cb.apply(context,[grantedBytes,fs]);
		},context);
	}, errorHandler);
}
var init=function(quota,cb,context) {
	if (!navigator.webkitPersistentStorage) {
		cb.apply(context,[0,null]);
		return;
	}
	navigator.webkitPersistentStorage.requestQuota(quota, 
			function(grantedBytes) {
				initfs(grantedBytes,cb,context);
		}, errorHandler 
	);
}


var API={
	read:read
	,readdir:readdir
	,open:open
	,close:close
	,fstatSync:fstatSync
	,fstat:fstat
	,getFileSize:getFileSize
}
module.exports=API;
},{}],"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/index.js":[function(require,module,exports){
module.exports={
	open:require("./kdb")
}

},{"./kdb":"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/kdb.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/kdb.js":[function(require,module,exports){
/*
	KDB version 3.0 GPL
	yapcheahshen@gmail.com
	2013/12/28
	asyncronize version of yadb

  remove dependency of Q, thanks to
  http://stackoverflow.com/questions/4234619/how-to-avoid-long-nesting-of-asynchronous-functions-in-node-js

  2015/1/2
  moved to ksanaforge/ksana-jsonrom
  add err in callback for node.js compliant
*/
var Kfs=null;

if (typeof ksanagap=="undefined") {
	try {
		var react_native=require("react-native");
		var OS=react_native.Platform.OS;
		if (OS=='android') {
			Kfs=require("./kdbfs_rn_android");
		} else {
			Kfs=require("./kdbfs_ios");
		}
	} catch(e) {
		Kfs=require('./kdbfs');	
	}			
} else {
	if (ksanagap.platform=="ios") {
		Kfs=require("./kdbfs_ios");
	} else if (ksanagap.platform=="node-webkit") {
		Kfs=require("./kdbfs");
	} else if (ksanagap.platform=="chrome") {
		Kfs=require("./kdbfs");
	} else {
		Kfs=require("./kdbfs_android");
	}
		
}


var DT={
	uint8:'1', //unsigned 1 byte integer
	int32:'4', // signed 4 bytes integer
	utf8:'8',  
	ucs2:'2',
	bool:'^', 
	blob:'&',
	utf8arr:'*', //shift of 8
	ucs2arr:'@', //shift of 2
	uint8arr:'!', //shift of 1
	int32arr:'$', //shift of 4
	vint:'`',
	pint:'~',	

	array:'\u001b',
	object:'\u001a' 
	//ydb start with object signature,
	//type a ydb in command prompt shows nothing
}
var verbose=0, read32=function(){};
var _readLog=function(readtype,bytes) {
	console.log(readtype,bytes,"bytes");
}
if (verbose) readLog=_readLog;
var strsep="\uffff";
var Create=function(path,opts,cb) {
	/* loadxxx functions move file pointer */
	// load variable length int
	if (typeof opts=="function") {
		cb=opts;
		opts={};
	}

	
	var loadVInt =function(opts,blocksize,count,cb) {
		//if (count==0) return [];
		var that=this;

		this.fs.readBuf_packedint(opts.cur,blocksize,count,true,function(o){
			//console.log("vint");
			opts.cur+=o.adv;
			cb.apply(that,[o.data]);
		});
	}
	var loadVInt1=function(opts,cb) {
		var that=this;
		loadVInt.apply(this,[opts,6,1,function(data){
			//console.log("vint1");
			cb.apply(that,[data[0]]);
		}])
	}
	//for postings
	var loadPInt =function(opts,blocksize,count,cb) {
		var that=this;
		this.fs.readBuf_packedint(opts.cur,blocksize,count,false,function(o){
			//console.log("pint");
			opts.cur+=o.adv;
			cb.apply(that,[o.data]);
		});
	}
	// item can be any type (variable length)
	// maximum size of array is 1TB 2^40
	// structure:
	// signature,5 bytes offset, payload, itemlengths
	var getArrayLength=function(opts,cb) {
		var that=this;
		var dataoffset=0;

		this.fs.readUI8(opts.cur,function(len){
			var lengthoffset=len*4294967296;
			opts.cur++;
			that.fs.readUI32(opts.cur,function(len){
				opts.cur+=4;
				dataoffset=opts.cur; //keep this
				lengthoffset+=len;
				opts.cur+=lengthoffset;

				loadVInt1.apply(that,[opts,function(count){
					loadVInt.apply(that,[opts,count*6,count,function(sz){						
						cb({count:count,sz:sz,offset:dataoffset});
					}]);
				}]);
				
			});
		});
	}

	var loadArray = function(opts,blocksize,cb) {
		var that=this;
		getArrayLength.apply(this,[opts,function(L){
				var o=[];
				var endcur=opts.cur;
				opts.cur=L.offset;

				if (opts.lazy) { 
						var offset=L.offset;
						for (var i=0;i<L.sz.length;i++) {
							var sz=L.sz[i];
							o[o.length]=strsep+offset.toString(16)
								   +strsep+sz.toString(16);
							offset+=sz;
						};
				} else {
					var taskqueue=[];
					for (var i=0;i<L.count;i++) {
						taskqueue.push(
							(function(sz){
								return (
									function(data){
										if (typeof data=='object' && data.__empty) {
											 //not pushing the first call
										}	else o.push(data);
										opts.blocksize=sz;
										load.apply(that,[opts, taskqueue.shift()]);
									}
								);
							})(L.sz[i])
						);
					}
					//last call to child load
					taskqueue.push(function(data){
						o.push(data);
						opts.cur=endcur;
						cb.apply(that,[o]);
					});
				}

				if (opts.lazy) cb.apply(that,[o]);
				else {
					taskqueue.shift()({__empty:true});
				}
			}
		])
	}		
	// item can be any type (variable length)
	// support lazy load
	// structure:
	// signature,5 bytes offset, payload, itemlengths, 
	//                    stringarray_signature, keys
	var loadObject = function(opts,blocksize,cb) {
		var that=this;
		var start=opts.cur;
		getArrayLength.apply(this,[opts,function(L) {
			opts.blocksize=blocksize-opts.cur+start;
			load.apply(that,[opts,function(keys){ //load the keys
				if (opts.keys) { //caller ask for keys
					keys.map(function(k) { opts.keys.push(k)});
				}

				var o={};
				var endcur=opts.cur;
				opts.cur=L.offset;
				if (opts.lazy) { 
					var offset=L.offset;
					for (var i=0;i<L.sz.length;i++) {
						//prefix with a \0, impossible for normal string
						o[keys[i]]=strsep+offset.toString(16)
							   +strsep+L.sz[i].toString(16);
						offset+=L.sz[i];
					}
				} else {
					var taskqueue=[];
					for (var i=0;i<L.count;i++) {
						taskqueue.push(
							(function(sz,key){
								return (
									function(data){
										if (typeof data=='object' && data.__empty) {
											//not saving the first call;
										} else {
											o[key]=data; 
										}
										opts.blocksize=sz;
										if (verbose) readLog("key",key);
										load.apply(that,[opts, taskqueue.shift()]);
									}
								);
							})(L.sz[i],keys[i-1])

						);
					}
					//last call to child load
					taskqueue.push(function(data){
						o[keys[keys.length-1]]=data;
						opts.cur=endcur;
						cb.apply(that,[o]);
					});
				}
				if (opts.lazy) cb.apply(that,[o]);
				else {
					taskqueue.shift()({__empty:true});
				}
			}]);
		}]);
	}

	//item is same known type
	var loadStringArray=function(opts,blocksize,encoding,cb) {
		var that=this;
		this.fs.readStringArray(opts.cur,blocksize,encoding,function(o){
			opts.cur+=blocksize;
			cb.apply(that,[o]);
		});
	}
	var loadIntegerArray=function(opts,blocksize,unitsize,cb) {
		var that=this;
		loadVInt1.apply(this,[opts,function(count){
			var o=that.fs.readFixedArray(opts.cur,count,unitsize,function(o){
				opts.cur+=count*unitsize;
				cb.apply(that,[o]);
			});
		}]);
	}
	var loadBlob=function(blocksize,cb) {
		var o=this.fs.readBuf(this.cur,blocksize);
		this.cur+=blocksize;
		return o;
	}	
	var loadbysignature=function(opts,signature,cb) {
		  var blocksize=opts.blocksize||this.fs.size; 
			opts.cur+=this.fs.signature_size;
			var datasize=blocksize-this.fs.signature_size;
			//basic types
			if (signature===DT.int32) {
				opts.cur+=4;
				this.fs.readI32(opts.cur-4,cb);
			} else if (signature===DT.uint8) {
				opts.cur++;
				this.fs.readUI8(opts.cur-1,cb);
			} else if (signature===DT.utf8) {
				var c=opts.cur;opts.cur+=datasize;
				this.fs.readString(c,datasize,'utf8',cb);
			} else if (signature===DT.ucs2) {
				var c=opts.cur;opts.cur+=datasize;
				this.fs.readString(c,datasize,'ucs2',cb);	
			} else if (signature===DT.bool) {
				opts.cur++;
				this.fs.readUI8(opts.cur-1,function(data){cb(!!data)});
			} else if (signature===DT.blob) {
				loadBlob(datasize,cb);
			}
			//variable length integers
			else if (signature===DT.vint) {
				loadVInt.apply(this,[opts,datasize,datasize,cb]);
			}
			else if (signature===DT.pint) {
				loadPInt.apply(this,[opts,datasize,datasize,cb]);
			}
			//simple array
			else if (signature===DT.utf8arr) {
				loadStringArray.apply(this,[opts,datasize,'utf8',cb]);
			}
			else if (signature===DT.ucs2arr) {
				loadStringArray.apply(this,[opts,datasize,'ucs2',cb]);
			}
			else if (signature===DT.uint8arr) {
				loadIntegerArray.apply(this,[opts,datasize,1,cb]);
			}
			else if (signature===DT.int32arr) {
				loadIntegerArray.apply(this,[opts,datasize,4,cb]);
			}
			//nested structure
			else if (signature===DT.array) {
				loadArray.apply(this,[opts,datasize,cb]);
			}
			else if (signature===DT.object) {
				loadObject.apply(this,[opts,datasize,cb]);
			}
			else {
				console.error('unsupported type',signature,opts)
				cb.apply(this,[null]);//make sure it return
				//throw 'unsupported type '+signature;
			}
	}

	var load=function(opts,cb) {
		opts=opts||{}; // this will served as context for entire load procedure
		opts.cur=opts.cur||0;
		var that=this;
		this.fs.readSignature(opts.cur, function(signature){
			loadbysignature.apply(that,[opts,signature,cb])
		});
		return this;
	}
	var CACHE=null;
	var KEY={};
	var ADDRESS={};
	var reset=function(cb) {
		if (!CACHE) {
			load.apply(this,[{cur:0,lazy:true},function(data){
				CACHE=data;
				cb.call(this);
			}]);	
		} else {
			cb.call(this);
		}
	}

	var exists=function(path,cb) {
		if (path.length==0) return true;
		var key=path.pop();
		var that=this;
		get.apply(this,[path,false,function(data){
			if (!path.join(strsep)) return (!!KEY[key]);
			var keys=KEY[path.join(strsep)];
			path.push(key);//put it back
			if (keys) cb.apply(that,[keys.indexOf(key)>-1]);
			else cb.apply(that,[false]);
		}]);
	}

	var getSync=function(path) {
		if (!CACHE) return undefined;	
		var o=CACHE;
		for (var i=0;i<path.length;i++) {
			var r=o[path[i]];
			if (typeof r=="undefined") return null;
			o=r;
		}
		return o;
	}
	var get=function(path,opts,cb,context) {
		if (typeof path=='undefined') path=[];
		if (typeof path=="string") path=[path];
		//opts.recursive=!!opts.recursive;
		if (typeof opts=="function") {
			context=cb;
			cb=opts;
			opts={};
		}
		var context=context||this;
		var that=this;
		if (typeof cb!='function') return getSync(path);

		reset.apply(this,[function(){
			var o=CACHE;
			if (path.length==0) {
				if (opts.address) {
					cb.apply(context,[[0,that.fs.size]]);
				} else {
					cb.apply(context,[Object.keys(CACHE)]);
				}
				return;
			} 
			
			var pathnow="",taskqueue=[],newopts={},r=null;
			var lastkey="";

			for (var i=0;i<path.length;i++) {
				var task=(function(key,k){

					return (function(data){
						if (!(typeof data=='object' && data.__empty)) {
							if (typeof o[lastkey]=='string' && o[lastkey][0]==strsep) o[lastkey]={};
							o[lastkey]=data; 
							o=o[lastkey];
							r=data[key];
							KEY[pathnow]=opts.keys;								
						} else {
							data=o[key];
							r=data;
						}

						if (typeof r==="undefined") {
							taskqueue=null;
							cb.apply(context,[r]); //return empty value
						} else {							
							if (parseInt(k)) pathnow+=strsep;
							pathnow+=key;
							if (typeof r=='string' && r[0]==strsep) { //offset of data to be loaded
								var p=r.substring(1).split(strsep).map(function(item){return parseInt(item,16)});
								var cur=p[0],sz=p[1];
								newopts.lazy=!opts.recursive || (k<path.length-1) ;
								newopts.blocksize=sz;newopts.cur=cur,newopts.keys=[];
								lastkey=key; //load is sync in android
								if (opts.address && taskqueue.length==1) {
									ADDRESS[pathnow]=[cur,sz];
									taskqueue.shift()(null,ADDRESS[pathnow]);
								} else {
									load.apply(that,[newopts, taskqueue.shift()]);
								}
							} else {
								if (opts.address && taskqueue.length==1) {
									taskqueue.shift()(null,ADDRESS[pathnow]);
								} else {
									taskqueue.shift().apply(that,[r]);
								}
							}
						}
					})
				})
				(path[i],i);
				
				taskqueue.push(task);
			}

			if (taskqueue.length==0) {
				cb.apply(context,[o]);
			} else {
				//last call to child load
				taskqueue.push(function(data,cursz){
					if (opts.address) {
						cb.apply(context,[cursz]);
					} else{
						var key=path[path.length-1];
						o[key]=data; KEY[pathnow]=opts.keys;
						cb.apply(context,[data]);
					}
				});
				taskqueue.shift()({__empty:true});			
			}

		}]); //reset
	}
	// get all keys in given path
	var getkeys=function(path,cb) {
		if (!path) path=[]
		var that=this;

		get.apply(this,[path,false,function(){
			if (path && path.length) {
				cb.apply(that,[KEY[path.join(strsep)]]);
			} else {
				cb.apply(that,[Object.keys(CACHE)]); 
				//top level, normally it is very small
			}
		}]);
	}

	var setupapi=function() {
		this.load=load;
//		this.cur=0;
		this.cache=function() {return CACHE};
		this.key=function() {return KEY};
		this.free=function() {
			CACHE=null;
			KEY=null;
			this.fs.free();
		}
		this.setCache=function(c) {CACHE=c};
		this.keys=getkeys;
		this.get=get;   // get a field, load if needed
		this.exists=exists;
		this.DT=DT;
		
		//install the sync version for node
		//if (typeof process!="undefined") require("./kdb_sync")(this);
		//if (cb) setTimeout(cb.bind(this),0);
		var that=this;
		var err=0;
		if (cb) {
			setTimeout(function(){
				cb(err,that);	
			},0);
		}
	}
	var that=this;
	var kfs=new Kfs(path,opts,function(err){
		if (err) {
			setTimeout(function(){
				cb(err,0);
			},0);
			return null;
		} else {
			that.size=this.size;
			setupapi.call(that);			
		}
	});
	this.fs=kfs;
	return this;
}

Create.datatypes=DT;

if (module) module.exports=Create;
//return Create;

},{"./kdbfs":"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/kdbfs.js","./kdbfs_android":"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/kdbfs_android.js","./kdbfs_ios":"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/kdbfs_ios.js","./kdbfs_rn_android":"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/kdbfs_rn_android.js","react-native":"react-native"}],"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/kdbfs.js":[function(require,module,exports){
/* node.js and html5 file system abstraction layer*/
try {
	var fs=require("fs");
	var Buffer=require("buffer").Buffer;
} catch (e) {
	var fs=require('./html5read');
	var Buffer=function(){ return ""};
	var html5fs=true; 	
}
var signature_size=1;
var verbose=0, readLog=function(){};
var _readLog=function(readtype,bytes) {
	console.log(readtype,bytes,"bytes");
}
if (verbose) readLog=_readLog;

var unpack_int = function (ar, count , reset) {
   count=count||ar.length;
  var r = []
  //var r=new Uint32Array(count);
  var i = 0, v = 0,n=0;
  do {
	var shift = 0;
	do {
	  v += ((ar[i] & 0x7F) << shift);
	  shift += 7;	  
	} while (ar[++i] & 0x80);
	r.push(v);
	//r[n++]=v;
	if (reset) v=0;
	count--;
  } while (i<ar.length && count);

  //var rr=r.subarray(0,n);
  return {data:r, adv:i };
}
var Open=function(path,opts,cb) {
	opts=opts||{};

	var readSignature=function(pos,cb) {
		var buf=new Buffer(signature_size);
		var that=this;
		fs.read(this.handle,buf,0,signature_size,pos,function(err,len,buffer){
			if (html5fs) var signature=String.fromCharCode((new Uint8Array(buffer))[0])
			else var signature=buffer.toString('utf8',0,signature_size);
			cb.apply(that,[signature]);
		});
	}

	//this is quite slow
	//wait for StringView +ArrayBuffer to solve the problem
	//https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/ylgiNY_ZSV0
	//if the string is always ucs2
	//can use Uint16 to read it.
	//http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String

	var decodeutf8 = function (utftext) {
		var string = "";
		var i = 0;
		var c=0,c1 = 0, c2 = 0 , c3=0;
		for (var i=0;i<utftext.length;i++) {
			if (utftext.charCodeAt(i)>127) break;
		}
		if (i>=utftext.length) return utftext;

		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += utftext[i];
				i++;
			} else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}

	var decodeule16buffer=function(buf) {
		if (typeof TextDecoder!=="undefined") {
			var decoder=new TextDecoder("utf-16le");
			return decoder.decode(buf)
		} else {
			return String.fromCharCode.apply(null, new Uint16Array(buffer));
		}
	}
	var readString= function(pos,blocksize,encoding,cb) {
		encoding=encoding||'utf8';
		var buffer=new Buffer(blocksize);
		var that=this;
		fs.read(this.handle,buffer,0,blocksize,pos,function(err,len,buffer){
			readLog("string",len);
			if (html5fs) {
				if (encoding=='utf8') {
					var str=decodeutf8(String.fromCharCode.apply(null, new Uint8Array(buffer)))
				} else { //ucs2 is 3 times faster
					var str=decodeule16buffer(buffer);
				}
				cb.apply(that,[str]);
			} 
			else cb.apply(that,[buffer.toString(encoding)]);	
		});
	}

	//work around for chrome fromCharCode cannot accept huge zarray
	//https://code.google.com/p/chromium/issues/detail?id=56588
	var buf2stringarr=function(buf,enc) {
		if (typeof TextDecoder!=="undefined") {
			//TextDecoder is two times faster
			if (enc==="ucs2") enc="utf-16le";
			var decoder=new TextDecoder(enc);
			return decoder.decode(buf).split("\0");
		} else{
			if (enc=="utf8") 	var arr=new Uint8Array(buf);
			else var arr=new Uint16Array(buf);
			var i=0,codes=[],out=[],s="";
			while (i<arr.length) {
				if (arr[i]) {
					codes[codes.length]=arr[i];
				} else {
					s=String.fromCharCode.apply(null,codes);
					if (enc=="utf8") out[out.length]=decodeutf8(s);
					else out[out.length]=s;
					codes=[];				
				}
				i++;
			}
			
			s=String.fromCharCode.apply(null,codes);
			if (enc=="utf8") out[out.length]=decodeutf8(s);
			else out[out.length]=s;

			return out;			
		}
	}
	var readStringArray = function(pos,blocksize,encoding,cb) {
		var that=this,out=null;
		if (blocksize==0) return [];
		encoding=encoding||'utf8';
		var buffer=new Buffer(blocksize);

		//if (blocksize>1000000) console.time("readstringarray");
		fs.read(this.handle,buffer,0,blocksize,pos,function(err,len,buffer){
			if (html5fs) {
				readLog("stringArray",buffer.byteLength);

				if (encoding=='utf8') {
					out=buf2stringarr(buffer,"utf8");
				} else { //ucs2 is 3 times faster
					out=buf2stringarr(buffer,"ucs2");
				}
			} else {
				readLog("stringArray",buffer.length);
				out=buffer.toString(encoding).split('\0');
			}
			//if (blocksize>1000000) console.timeEnd("readstringarray");
			cb.apply(that,[out]);
		});
	}
	var readUI32=function(pos,cb) {
		var buffer=new Buffer(4);
		var that=this;
		fs.read(this.handle,buffer,0,4,pos,function(err,len,buffer){
			readLog("ui32",len);
			if (html5fs){
				//v=(new Uint32Array(buffer))[0];
				var v=new DataView(buffer).getUint32(0, false)
				cb(v);
			}
			else cb.apply(that,[buffer.readInt32BE(0)]);	
		});		
	}

	var readI32=function(pos,cb) {
		var buffer=new Buffer(4);
		var that=this;
		fs.read(this.handle,buffer,0,4,pos,function(err,len,buffer){
			readLog("i32",len);
			if (html5fs){
				var v=new DataView(buffer).getInt32(0, false)
				cb(v);
			}
			else  	cb.apply(that,[buffer.readInt32BE(0)]);	
		});
	}
	var readUI8=function(pos,cb) {
		var buffer=new Buffer(1);
		var that=this;

		fs.read(this.handle,buffer,0,1,pos,function(err,len,buffer){
			readLog("ui8",len);
			if (html5fs)cb( (new Uint8Array(buffer))[0]) ;
			else  			cb.apply(that,[buffer.readUInt8(0)]);	
			
		});
	}
	var readBuf=function(pos,blocksize,cb) {
		var that=this;
		var buf=new Buffer(blocksize);
		fs.read(this.handle,buf,0,blocksize,pos,function(err,len,buffer){
			readLog("buf",len);
			var buff=new Uint8Array(buffer)
			cb.apply(that,[buff]);
		});
	}
	var readBuf_packedint=function(pos,blocksize,count,reset,cb) {
		var that=this;
		readBuf.apply(this,[pos,blocksize,function(buffer){
			cb.apply(that,[unpack_int(buffer,count,reset)]);	
		}]);
		
	}
	var readFixedArray_html5fs=function(pos,count,unitsize,cb) {
		var func=null;
		if (unitsize===1) {
			func='getUint8';//Uint8Array;
		} else if (unitsize===2) {
			func='getUint16';//Uint16Array;
		} else if (unitsize===4) {
			func='getUint32';//Uint32Array;
		} else throw 'unsupported integer size';

		fs.read(this.handle,null,0,unitsize*count,pos,function(err,len,buffer){
			readLog("fix array",len);
			var out=[];
			if (unitsize==1) {
				out=new Uint8Array(buffer);
			} else {
				for (var i = 0; i < len / unitsize; i++) { //endian problem
				//	out.push( func(buffer,i*unitsize));
					out.push( v=new DataView(buffer)[func](i,false) );
				}
			}

			cb.apply(that,[out]);
		});
	}
	// signature, itemcount, payload
	var readFixedArray = function(pos ,count, unitsize,cb) {
		var func=null;
		var that=this;
		
		if (unitsize* count>this.size && this.size)  {
			console.log("array size exceed file size",this.size)
			return;
		}
		
		if (html5fs) return readFixedArray_html5fs.apply(this,[pos,count,unitsize,cb]);

		var items=new Buffer( unitsize* count);
		if (unitsize===1) {
			func=items.readUInt8;
		} else if (unitsize===2) {
			func=items.readUInt16BE;
		} else if (unitsize===4) {
			func=items.readUInt32BE;
		} else throw 'unsupported integer size';
		//console.log('itemcount',itemcount,'buffer',buffer);

		fs.read(this.handle,items,0,unitsize*count,pos,function(err,len,buffer){
			readLog("fix array",len);
			var out=[];
			for (var i = 0; i < items.length / unitsize; i++) {
				out.push( func.apply(items,[i*unitsize]));
			}
			cb.apply(that,[out]);
		});
	}

	var free=function() {
		//console.log('closing ',handle);
		fs.closeSync(this.handle);
	}
	var setupapi=function() {
		var that=this;
		this.readSignature=readSignature;
		this.readI32=readI32;
		this.readUI32=readUI32;
		this.readUI8=readUI8;
		this.readBuf=readBuf;
		this.readBuf_packedint=readBuf_packedint;
		this.readFixedArray=readFixedArray;
		this.readString=readString;
		this.readStringArray=readStringArray;
		this.signature_size=signature_size;
		this.free=free;

		if (html5fs) {
			var fn=path;
			if (this.handle.file) {
				//local file
				fs.getFileSize(this.handle.file,function(size){
					that.size=size;
					if (cb) setTimeout(cb.bind(that),0);
				})
			} else if (fs&& fs.fs && fs.fs.root) {
				if (path.indexOf("filesystem:")==0) fn=path.substr(path.lastIndexOf("/"));
				//Google File system
				fs.fs.root.getFile(fn,{},function(entry){
				  entry.getMetadata(function(metadata) { 
					that.size=metadata.size;
					if (cb) setTimeout(cb.bind(that),0);
					});
				});				
			}
		} else {
			var stat=fs.fstatSync(this.handle);
			this.stat=stat;
			this.size=stat.size;		
			if (cb)	setTimeout(cb.bind(this,0),0);	
		}
	}

	var that=this;
	if (html5fs && opts.webStorage) {
		fs.open(path,function(h){
			if (!h) {
				cb("file not found:"+path);	
				return;
			} else {
				that.handle=h;
				that.html5fs=true;
				setupapi.call(that);
				that.opened=true;				
			}
		})
	} else {
		if (fs.existsSync && fs.existsSync(path)){
			this.handle=fs.openSync(path,'r');//,function(err,handle){
			this.opened=true;
			setupapi.call(this);
		} else {
			cb("file not found:"+path);	
			return null;
		}
	}
	return this;
}
module.exports=Open;
},{"./html5read":"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/html5read.js","buffer":false,"fs":false}],"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/kdbfs_android.js":[function(require,module,exports){
/*
  JAVA can only return Number and String
	array and buffer return in string format
	need JSON.parse
*/
var verbose=0;

'use strict';

var readSignature=function(pos,cb) {
	if (verbose) console.debug("read signature");
	var signature=kfs.readUTF8String(this.handle,pos,1);
	if (verbose) console.debug(signature,signature.charCodeAt(0));
	cb.apply(this,[signature]);
}
var readI32=function(pos,cb) {
	if (verbose) console.debug("read i32 at "+pos);
	var i32=kfs.readInt32(this.handle,pos);
	if (verbose) console.debug(i32);
	cb.apply(this,[i32]);	
}
var readUI32=function(pos,cb) {
	if (verbose) console.debug("read ui32 at "+pos);
	var ui32=kfs.readUInt32(this.handle,pos);
	if (verbose) console.debug(ui32);
	cb.apply(this,[ui32]);
}
var readUI8=function(pos,cb) {
	if (verbose) console.debug("read ui8 at "+pos); 
	var ui8=kfs.readUInt8(this.handle,pos);
	if (verbose) console.debug(ui8);
	cb.apply(this,[ui8]);
}
var readBuf=function(pos,blocksize,cb) {
	if (verbose) console.debug("read buffer at "+pos+ " blocksize "+blocksize);
	var buf=kfs.readBuf(this.handle,pos,blocksize);
	var buff=JSON.parse(buf);
	if (verbose) console.debug("buffer length"+buff.length);
	cb.apply(this,[buff]);	
}
var readBuf_packedint=function(pos,blocksize,count,reset,cb) {
	if (verbose) console.debug("read packed int at "+pos+" blocksize "+blocksize+" count "+count);
	var buf=kfs.readBuf_packedint(this.handle,pos,blocksize,count,reset);
	var adv=parseInt(buf);
	var buff=JSON.parse(buf.substr(buf.indexOf("[")));
	if (verbose) console.debug("packedInt length "+buff.length+" first item="+buff[0]);
	cb.apply(this,[{data:buff,adv:adv}]);	
}


var readString= function(pos,blocksize,encoding,cb) {
	if (verbose) console.debug("readstring at "+pos+" blocksize " +blocksize+" enc:"+encoding);
	if (encoding=="ucs2") {
		var str=kfs.readULE16String(this.handle,pos,blocksize);
	} else {
		var str=kfs.readUTF8String(this.handle,pos,blocksize);	
	}	 
	if (verbose) console.debug(str);
	cb.apply(this,[str]);	
}

var readFixedArray = function(pos ,count, unitsize,cb) {
	if (verbose) console.debug("read fixed array at "+pos+" count "+count+" unitsize "+unitsize); 
	var buf=kfs.readFixedArray(this.handle,pos,count,unitsize);
	var buff=JSON.parse(buf);
	if (verbose) console.debug("array length"+buff.length);
	cb.apply(this,[buff]);	
}
var readStringArray = function(pos,blocksize,encoding,cb) {
	if (verbose) console.log("read String array at "+pos+" blocksize "+blocksize +" enc "+encoding); 
	encoding = encoding||"utf8";
	var buf=kfs.readStringArray(this.handle,pos,blocksize,encoding);
	//var buff=JSON.parse(buf);
	if (verbose) console.debug("read string array");
	var buff=buf.split("\uffff"); //cannot return string with 0
	if (verbose) console.debug("array length"+buff.length);
	cb.apply(this,[buff]);	
}
var mergePostings=function(positions,cb) {
	var buf=kfs.mergePostings(this.handle,JSON.stringify(positions));
	if (!buf || buf.length==0) return cb([]);
	else return cb(JSON.parse(buf));
}

var free=function() {
	//console.log('closing ',handle);
	kfs.close(this.handle);
}
var Open=function(path,opts,cb) {
	opts=opts||{};
	var signature_size=1;
	var setupapi=function() { 
		this.readSignature=readSignature;
		this.readI32=readI32;
		this.readUI32=readUI32;
		this.readUI8=readUI8;
		this.readBuf=readBuf;
		this.readBuf_packedint=readBuf_packedint;
		this.readFixedArray=readFixedArray;
		this.readString=readString;
		this.readStringArray=readStringArray;
		this.signature_size=signature_size;
		this.mergePostings=mergePostings;
		this.free=free;
		this.size=kfs.getFileSize(this.handle);
		if (verbose) console.log("filesize  "+this.size);
		if (cb)	cb.call(this);
	}

	this.handle=kfs.open(path);
	this.opened=true;
	setupapi.call(this);
	return this;
}

module.exports=Open;
},{}],"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/kdbfs_ios.js":[function(require,module,exports){
/*
  JSContext can return all Javascript types.
*/
'use strict';
var kfs = require('react-native').NativeModules.KsanaFileSystem;
var verbose=0,async=!!kfs.async;

var readSignature=function(pos,cb) {
	if (verbose)  ksanagap.log("read signature at "+pos);
	if (async) {
		var that=this;
		kfs.readUTF8String(this.handle,pos,1,function(signature){
			cb.call(that,signature);
		});
	} else {
		
		var signature=kfs.readUTF8String(this.handle,pos,1);
		if (verbose)  ksanagap.log(signature+" "+signature.charCodeAt(0));
		cb.apply(this,[signature]);
	}
}
var readI32=function(pos,cb) {
	if (async) {
		var that=this;
		kfs.readInt32(this.handle,pos,function(i32){
			cb.call(that,i32);
		});
	} else {	
		if (verbose)  ksanagap.log("read i32 at "+pos);
		var i32=kfs.readInt32(this.handle,pos);
		if (verbose)  ksanagap.log(i32);
		cb.apply(this,[i32]);	
	}
}
var readUI32=function(pos,cb) {
	if (async) {
		var that=this;
		kfs.readUInt32(this.handle,pos,function(ui32){
			cb.call(that,ui32);
		});
	} else {	
		if (verbose)  ksanagap.log("read ui32 at "+pos);
		var ui32=kfs.readUInt32(this.handle,pos);
		if (verbose)  ksanagap.log(ui32);
		cb.apply(this,[ui32]);
	}
}
var readUI8=function(pos,cb) {
	if (async) {
		var that=this;
		kfs.readUInt8(this.handle,pos,function(ui8){
			cb.call(that,ui8);
		});
	} else {
		if (verbose)  ksanagap.log("read ui8 at "+pos); 
		var ui8=kfs.readUInt8(this.handle,pos);
		if (verbose)  ksanagap.log(ui8);
		cb.apply(this,[ui8]);
	}
}
var readBuf=function(pos,blocksize,cb) {
	if (async) {
		var that=this;
		kfs.readBuf(this.handle,pos,blocksize,function(buf){
			cb.call(that,buf);
		});
	} else {

		if (verbose)  ksanagap.log("read buffer at "+pos);
		var buf=kfs.readBuf(this.handle,pos,blocksize);
		if (verbose)  ksanagap.log("buffer length"+buf.length);
		cb.apply(this,[buf]);	
	}
}
var readBuf_packedint=function(pos,blocksize,count,reset,cb) {
	if (async) {
		var that=this;
		kfs.readBuf_packedint(this.handle,pos,blocksize,count,reset,function(buf){
			if (typeof buf.data=="string") {
				buf.data=eval("["+buf.data.substr(0,buf.data.length-1)+"]");
			}			
			cb.call(that,buf);
		});
	} else {

		if (verbose)  ksanagap.log("read packed int fast, blocksize "+blocksize+" at "+pos);var t=new Date();
		var buf=kfs.readBuf_packedint(this.handle,pos,blocksize,count,reset);
		if (verbose)  ksanagap.log("return from packedint, time" + (new Date()-t));
		if (typeof buf.data=="string") {
			buf.data=eval("["+buf.data.substr(0,buf.data.length-1)+"]");
		}
		if (verbose)  ksanagap.log("unpacked length"+buf.data.length+" time" + (new Date()-t) );
		cb.apply(this,[buf]);
	}
}


var readString= function(pos,blocksize,encoding,cb) {
	if (verbose)  ksanagap.log("readstring at "+pos+" blocksize "+blocksize+" "+encoding);var t=new Date();
	if (encoding=="ucs2") {
		if (async) {
			var that=this;
			kfs.readULE16String(this.handle,pos,blocksize,function(str){
				cb.call(that,str);
			});
			return;
		} else {
			var str=kfs.readULE16String(this.handle,pos,blocksize);
		}
		
	} else {
		if (async) {
			var that=this;
			kfs.readUTF8String(this.handle,pos,blocksize,function(str){
				cb.call(that,str);
			});
			return;	
		} else {
			var str=kfs.readUTF8String(this.handle,pos,blocksize);	
		}
	}
	if (verbose)  ksanagap.log(str+" time"+(new Date()-t));
	cb.apply(this,[str]);	
}

var readFixedArray = function(pos ,count, unitsize,cb) {
	if (async) {
		var that=this;
		kfs.readFixedArray(this.handle,pos,count,unitsize,function(buf){
			cb.call(that,buf);
		});
	} else {

		if (verbose)  ksanagap.log("read fixed array at "+pos); var t=new Date();
		var buf=kfs.readFixedArray(this.handle,pos,count,unitsize);
		if (verbose)  ksanagap.log("array length "+buf.length+" time"+(new Date()-t));
		cb.apply(this,[buf]);		
	}

}
var readStringArray = function(pos,blocksize,encoding,cb) {
	//if (verbose)  ksanagap.log("read String array "+blocksize +" "+encoding); 
	encoding = encoding||"utf8";

	if (async) {
		var that=this;
		kfs.readStringArray(this.handle,pos,blocksize,encoding,function(buf){
			if (typeof buf=="string") buf=buf.split("\0");
			cb.call(that,buf);
		});
	} else {
		if (verbose)  ksanagap.log("read string array at "+pos);var t=new Date();
		var buf=kfs.readStringArray(this.handle,pos,blocksize,encoding);
		if (typeof buf=="string") buf=buf.split("\0");
		//var buff=JSON.parse(buf);
		//var buff=buf.split("\uffff"); //cannot return string with 0
		if (verbose)  ksanagap.log("string array length"+buf.length+" time"+(new Date()-t));
		cb.apply(this,[buf]);
	}
}

var mergePostings=function(positions,cb) {
	if (kfs.async) {
		kfs.mergePostings(this.handle,positions,function(buf){
			if (typeof buf=="string") {
				buf=eval("["+buf.substr(0,buf.length-1)+"]");
			}
			cb(buf);
		});
	} else {
		var buf=kfs.mergePostings(this.handle,positions,cb);
		if (typeof buf=="string") {
			buf=eval("["+buf.substr(0,buf.length-1)+"]");
		}
		cb(buf);
	}		
	
}
var free=function() {
	////if (verbose)  ksanagap.log('closing ',handle);
	kfs.close(this.handle,function(){});
}
var Open=function(path,opts,cb) {
	opts=opts||{};
	var signature_size=1;
	var setupapi=function() { 
		this.readSignature=readSignature;
		this.readI32=readI32;
		this.readUI32=readUI32;
		this.readUI8=readUI8;
		this.readBuf=readBuf;
		this.readBuf_packedint=readBuf_packedint;
		this.readFixedArray=readFixedArray;
		this.readString=readString;
		this.readStringArray=readStringArray;
		this.signature_size=signature_size;
		this.mergePostings=mergePostings;
		this.free=free;
		if (kfs.getFileSize.length==1) {
			this.size=kfs.getFileSize(this.handle);
			if (cb)	cb.call(this);	
		} else {
			var that=this;
			kfs.getFileSize(this.handle,function(size){
				that.size=size;
				if (cb)	cb.call(that);
			});
		}		
	}

	if (kfs.open.length==1) {
		this.handle=kfs.open(path);
		this.opened=true;
		setupapi.call(this);
		return this;		
	} else { //react-native
		var that=this;
		this.async=true;
		kfs.open(path,function(handle){
			if (!handle){
				cb.call(null,"File not file:"+path);
				return;
			}
			that.opened=true;
			that.handle=handle;
			setupapi.call(that);
		});
	}
}

module.exports=Open;
},{"react-native":"react-native"}],"/home/ec2-user/ksana2015/node_modules/ksana-jsonrom/kdbfs_rn_android.js":[function(require,module,exports){
/*
  binding for react native android
  JAVA can only return Number and String
	array and buffer return in string format
	need JSON.parse
*/
var kfs=require("react-native").NativeModules.KsanaFileSystem;

var verbose=0;

var readSignature=function(pos,cb) {
	if (verbose) console.debug("read signature");
	kfs.readUTF8String(this.handle,pos,1,function(signature){
		if (verbose) console.debug(signature,signature.charCodeAt(0));
		cb.apply(this,[signature]);	
	});
}
var readI32=function(pos,cb) {
	if (verbose) console.debug("read i32 at "+pos);
	kfs.readInt32(this.handle,pos,function(i32){
		if (verbose) console.debug(i32);
		cb.apply(this,[i32]);	
	});
}
var readUI32=function(pos,cb) {
	if (verbose) console.debug("read ui32 at "+pos);
	kfs.readUInt32(this.handle,pos,function(ui32){
		if (verbose) console.debug(ui32);
		cb.apply(this,[ui32]);
	});
}
var readUI8=function(pos,cb) {
	if (verbose) console.debug("read ui8 at "+pos); 
	kfs.readUInt8(this.handle,pos,function(ui8){
		if (verbose) console.debug(ui8);
		cb.apply(this,[ui8]);
	});
}
var readBuf=function(pos,blocksize,cb) {
	if (verbose) console.debug("read buffer at "+pos+ " blocksize "+blocksize);
	kfs.readBuf(this.handle,pos,blocksize,function(buff){
		//var buff=JSON.parse(buf);
		if (verbose) console.debug("buffer length"+buff.length);
		cb.apply(this,[buff]);
	});
}
var readBuf_packedint=function(pos,blocksize,count,reset,cb) {
	if (verbose) console.debug("read packed int at "+pos+" blocksize "+blocksize+" count "+count);
	kfs.readBuf_packedint(this.handle,pos,blocksize,count,reset,function(buf){
		var adv=parseInt(buf);
		var buff=JSON.parse(buf.substr(buf.indexOf("[")));
		if (verbose) console.debug("packedInt length "+buff.length+" first item="+buff[0]);
		cb.apply(this,[{data:buff,adv:adv}]);	
	});	
}


var readString= function(pos,blocksize,encoding,cb) {
	if (verbose) console.debug("readstring at "+pos+" blocksize " +blocksize+" enc:"+encoding);
	if (encoding=="ucs2") {
		var func=kfs.readULE16String;
	} else {
		var func=kfs.readUTF8String
	}	 
	func(this.handle,pos,blocksize,function(str){
		if (verbose) console.debug(str);
		cb.apply(this,[str]);	
	})
}

var readFixedArray = function(pos ,count, unitsize,cb) {
	if (verbose) console.debug("read fixed array at "+pos+" count "+count+" unitsize "+unitsize); 
	kfs.readFixedArray(this.handle,pos,count,unitsize,function(buf){
		var buff=JSON.parse(buf);
		if (verbose) console.debug("array length"+buff.length);
		cb.apply(this,[buff]);	
	});
}
var readStringArray = function(pos,blocksize,encoding,cb) {
	if (verbose) console.log("read String array at "+pos+" blocksize "+blocksize +" enc "+encoding); 
	encoding = encoding||"utf8";
	kfs.readStringArray(this.handle,pos,blocksize,encoding,function(buf){
		//var buff=JSON.parse(buf);
		if (verbose) console.debug("read string array");
		var buff=buf.split("\uffff"); //cannot return string with 0
		if (verbose) console.debug("array length"+buff.length);
		cb.apply(this,[buff]);			
	});
}
var mergePostings=function(positions,cb) {
	kfs.mergePostings(this.handle,JSON.stringify(positions),function(buf){
		if (!buf || buf.length==0) return cb([]);
		else return cb(JSON.parse(buf));
	});
}

var free=function() {
	//console.log('closing ',handle);
	kfs.close(this.handle,function(){});
}
var Open=function(path,opts,cb) {
	opts=opts||{};
	var signature_size=1;
	var setupapi=function() { 
		this.readSignature=readSignature;
		this.readI32=readI32;
		this.readUI32=readUI32;
		this.readUI8=readUI8;
		this.readBuf=readBuf;
		this.readBuf_packedint=readBuf_packedint;
		this.readFixedArray=readFixedArray;
		this.readString=readString;
		this.readStringArray=readStringArray;
		this.signature_size=signature_size;
		this.mergePostings=mergePostings;
		this.free=free;
		kfs.getFileSize(this.handle,function(size){
			this.size=size;
		}.bind(this));
		if (verbose) console.log("filesize  "+this.size);
		if (cb)	cb.call(this);
	}

	kfs.open(path,function(handle){
		if (!handle) {
		cb.call(null,"File not found:"+path);
			return;
		}
		this.handle=handle;
		this.opened=true;
		setupapi.call(this);
	}.bind(this));

	return this;
}

module.exports=Open;
},{"react-native":"react-native"}],"/home/ec2-user/ksana2015/node_modules/ksana-search/boolsearch.js":[function(require,module,exports){
/*
  TODO
  and not

*/

// http://jsfiddle.net/neoswf/aXzWw/
var plist=require('./plist');
function intersect(I, J) {
  var i = j = 0;
  var result = [];

  while( i < I.length && j < J.length ){
     if      (I[i] < J[j]) i++; 
     else if (I[i] > J[j]) j++; 
     else {
       result[result.length]=l[i];
       i++;j++;
     }
  }
  return result;
}

/* return all items in I but not in J */
function subtract(I, J) {
  var i = j = 0;
  var result = [];

  while( i < I.length && j < J.length ){
    if (I[i]==J[j]) {
      i++;j++;
    } else if (I[i]<J[j]) {
      while (I[i]<J[j]) result[result.length]= I[i++];
    } else {
      while(J[j]<I[i]) j++;
    }
  }

  if (j==J.length) {
    while (i<I.length) result[result.length]=I[i++];
  }

  return result;
}

var union=function(a,b) {
	if (!a || !a.length) return b;
	if (!b || !b.length) return a;
    var result = [];
    var ai = 0;
    var bi = 0;
    while (true) {
        if ( ai < a.length && bi < b.length) {
            if (a[ai] < b[bi]) {
                result[result.length]=a[ai];
                ai++;
            } else if (a[ai] > b[bi]) {
                result[result.length]=b[bi];
                bi++;
            } else {
                result[result.length]=a[ai];
                result[result.length]=b[bi];
                ai++;
                bi++;
            }
        } else if (ai < a.length) {
            result.push.apply(result, a.slice(ai, a.length));
            break;
        } else if (bi < b.length) {
            result.push.apply(result, b.slice(bi, b.length));
            break;
        } else {
            break;
        }
    }
    return result;
}
var OPERATION={'include':intersect, 'union':union, 'exclude':subtract};

var boolSearch=function(opts) {
  opts=opts||{};
  ops=opts.op||this.opts.op;
  this.docs=[];
	if (!this.phrases.length) return;
	var r=this.phrases[0].docs;
  /* ignore operator of first phrase */
	for (var i=1;i<this.phrases.length;i++) {
		var op= ops[i] || 'union';
		r=OPERATION[op](r,this.phrases[i].docs);
	}
	this.docs=plist.unique(r);
	return this;
}
module.exports={search:boolSearch}
},{"./plist":"/home/ec2-user/ksana2015/node_modules/ksana-search/plist.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-search/excerpt.js":[function(require,module,exports){
var plist=require("./plist");
var fetchtext=require("./fetchtext");
var getPhraseWidths=function (Q,phraseid,vposs) {
	var res=[];
	for (var i in vposs) {
		res.push(getPhraseWidth(Q,phraseid,vposs[i]));
	}
	return res;
}
var getPhraseWidth=function (Q,phraseid,vpos) {
	var P=Q.phrases[phraseid];
	var width=0,varwidth=false;
	if (P.width) return P.width; // no wildcard
	if (P.termid.length<2) return P.termlength[0];
	var lasttermposting=Q.terms[P.termid[P.termid.length-1]].posting;

	for (var i in P.termid) {
		var T=Q.terms[P.termid[i]];
		if (T.op=='wildcard') {
			width+=T.width;
			if (T.wildcard=='*') varwidth=true;
		} else {
			width+=P.termlength[i];
		}
	}
	if (varwidth) { //width might be smaller due to * wildcard
		var at=plist.indexOfSorted(lasttermposting,vpos);
		var endpos=lasttermposting[at];
		if (endpos-vpos<width) width=endpos-vpos+1;
	}

	return width;
}
/* return [vpos, phraseid, phrasewidth, optional_tagname] by slot range*/
var hitInRange=function(Q,startvpos,endvpos) {
	var res=[];
	if (!Q || !Q.rawresult || !Q.rawresult.length) return res;
	for (var i=0;i<Q.phrases.length;i++) {
		var P=Q.phrases[i];
		if (!P.posting) continue;
		var s=plist.indexOfSorted(P.posting,startvpos);
		var e=plist.indexOfSorted(P.posting,endvpos);
		//work around to include last item
		if (s===e&& e==P.posting.length-1) e++;
		var r=P.posting.slice(s,e);
		//console.log("s,e",s,e,"r",r)
		var width=getPhraseWidths(Q,i,r);

		res=res.concat(r.map(function(vpos,idx){ return [vpos,width[idx],i] }));
	}
	// order by vpos, if vpos is the same, larger width come first.
	// so the output will be
	// <tag1><tag2>one</tag2>two</tag1>
	//TODO, might cause overlap if same vpos and same width
	//need to check tag name
	res.sort(function(a,b){return a[0]==b[0]? b[1]-a[1] :a[0]-b[0]});

	return res;
}
var realHitInRange=function(Q,startvpos,endvpos,text){
}
var realHitInRange=function(Q,startvpos,endvpos,text){
	var hits=hitInRange(Q,startvpos,endvpos);
	return calculateRealPos(Q.tokenize,Q.isSkip,startvpos,text,hits);
}
var tagsInRange=function(Q,renderTags,startvpos,endvpos) {
	var res=[];
	if (typeof renderTags=="string") renderTags=[renderTags];

	renderTags.map(function(tag){
		var starts=Q.engine.get(["fields",tag+"_start"]);
		var ends=Q.engine.get(["fields",tag+"_end"]);
		if (!starts) return;

		var s=plist.indexOfSorted(starts,startvpos);
		var e=s;
		while (e<starts.length && starts[e]<endvpos) e++;
		var opentags=starts.slice(s,e);

		s=plist.indexOfSorted(ends,startvpos);
		e=s;
		while (e<ends.length && ends[e]<endvpos) e++;
		var closetags=ends.slice(s,e);

		opentags.map(function(start,idx) {
			res.push([start,closetags[idx]-start,tag]);
		})
	});
	// order by vpos, if vpos is the same, larger width come first.
	res.sort(function(a,b){return a[0]==b[0]? b[1]-a[1] :a[0]-b[0]});

	return res;
}

/*
given a vpos range start, file, convert to filestart, fileend
   filestart : starting file
   start   : vpos start
   showfile: how many files to display
   showpage: how many pages to display

output:
   array of fileid with hits
*/
var getFileWithHits=function(engine,Q,range) {
	var fileOffsets=engine.get("fileoffsets");
	var out=[],filecount=100;
	var start=0 , end=Q.byFile.length;
	Q.excerptOverflow=false;
	if (range.start) {
		var first=range.start ;
		var last=range.end;
		if (!last) last=Number.MAX_SAFE_INTEGER;
		for (var i=0;i<fileOffsets.length;i++) {
			//if (fileOffsets[i]>first) break;
			if (fileOffsets[i]>last) {
				end=i;
				break;
			}
			if (fileOffsets[i]<first) start=i;
		}		
	} else {
		start=range.filestart || 0;
		if (range.maxfile) {
			filecount=range.maxfile;
		} else if (range.showseg) {
			throw "not implement yet"
		}
	}

	var fileWithHits=[],totalhit=0;
	range.maxhit=range.maxhit||1000;

	for (var i=start;i<end;i++) {
		if(Q.byFile[i].length>0) {
			totalhit+=Q.byFile[i].length;
			fileWithHits.push(i);
			range.nextFileStart=i;
			if (fileWithHits.length>=filecount) {
				Q.excerptOverflow=true;
				break;
			}
			if (totalhit>range.maxhit) {
				Q.excerptOverflow=true;
				break;
			}
		}
	}
	if (i>=end) { //no more file
		Q.excerptStop=true;
	}
	return fileWithHits;
}

var calculateRealPos=function(_tokenize,_isSkip,vpos,text,hits) {

	var out=[];
	if (!text)return out;
	var tokenized=_tokenize(text);
	var tokens=tokenized.tokens;
	var offsets=tokenized.offsets;
	var i=0,j=0,end=0, hit;
	var hitstart=0,hitend=0,textnow=0;
	//console.log("text",text,'len',text.length,"hits",hits)

	while (i<tokens.length) {
		//console.log("textnow",textnow,"token",tokens[i],"vpos",vpos)
		if (vpos===end && out.length) {
			var len=textnow-out[out.length-1][0];
			out[out.length-1][1]=len;
		}

		var skip=_isSkip(tokens[i]);
		if (!skip && j<hits.length && vpos===hits[j][0]) {
			hit=[textnow, null];
			(typeof hits[j][2]!=="undefined") && hit.push(hits[j][2]);
			out.push( hit);//len will be resolve later
			end=vpos+hits[j][1];
			j++;
		}
		textnow+=tokens[i].length;
		if (!skip) vpos++;
		i++;
	}
	if (vpos===end && out.length) {
		var len=textnow-out[out.length-1][0];
		out[out.length-1][1]=textnow-out[out.length-1][0];
	}
	
	return out;
}
var resultlist=function(engine,Q,opts,cb) {
	var output=[];
	if (!Q.rawresult || !Q.rawresult.length) {
		cb(output);
		return;
	}
	if (opts.range) {
		if (opts.range.maxhit && !opts.range.maxfile) {
			opts.range.maxfile=opts.range.maxhit;
			opts.range.maxseg=opts.range.maxhit;
		}
		if (!opts.range.maxseg) opts.range.maxseg=100;
		if (!opts.range.end) {
			opts.range.end=Number.MAX_SAFE_INTEGER;
		}
		if (opts.range.from) { //convert to vpos
			opts.range.start=engine.uti2vpos(opts.range.from)+1;//make sure loadSegments is called
		}
	}

	var fileWithHits=getFileWithHits(engine,Q,opts.range);
	if (!fileWithHits.length) {
		cb(output);
		return;
	}

	var output=[],files=[];//temporary holder for segnames
	for (var i=0;i<fileWithHits.length;i++) {
		var nfile=fileWithHits[i];
		var segoffsets=engine.getFileSegOffsets(nfile);
		//console.log("file",nfile,"segoffsets",segoffsets)
		
		files[nfile]={segoffsets:segoffsets};

		var segwithhit=plist.groupbyposting2(Q.byFile[ nfile ],  segoffsets);
		segwithhit.shift();
		//if (segoffsets[0]==1)
		//segwithhit.shift(); //the first item is not used (0~Q.byFile[0] )
		for (var j=0; j<segwithhit.length;j++) {
			var segoffset=segoffsets[j];
			if (!segwithhit[j].length) continue;
			//var offsets=segwithhit[j].map(function(p){return p- fileOffsets[i]});
			
			if (segoffset<opts.range.start) continue;
			if (segoffset>opts.range.end) break;

			output.push(  {file: nfile, seg:j});
			if (output.length>=opts.range.maxseg) break;
		}
		if (output.length>=opts.range.maxseg) break;
	}
	var segpaths=output.map(function(p){
		return ["filecontents",p.file,p.seg];
	});
	//prepare the text
	engine.get(segpaths,function(segs){
		var seq=0;
		if (segs) for (var i=0;i<segs.length;i++) {

			var startvpos=files[output[i].file].segoffsets[output[i].seg];
			var endvpos=files[output[i].file].segoffsets[output[i].seg+1]||engine.get("meta").vsize;
			//console.log(startvpos,endvpos)
			var hl={};

			if (opts.nohighlight) {
				hl.text=segs[i];
				hl.hits=hitInRange(Q,startvpos,endvpos);
				hl.realHits=calculateRealPos(Q.tokenize,Q.isSkip,startvpos,hl.text,hl.hits);
			} else {
				var o={nocrlf:true,nospan:true,
					text:segs[i],startvpos:startvpos, endvpos: endvpos, 
					Q:Q,fulltext:opts.fulltext};
				hl=highlight(Q,o);
			}
			if (hl.text) {
				output[i].text=hl.text;
				output[i].hits=hl.hits;
				output[i].realHits=hl.realHits;
				output[i].seq=seq;
				seq+=hl.hits.length;

				output[i].start=startvpos;				
			} else {
				output[i]=null; //remove item vpos less than opts.range.start
			}
		} 
		output=output.filter(function(o){return o!=null});
		cb(output);
	});
}
var injectTag=function(Q,opts){
	var hits=opts.hits;
	var tags=opts.tags;
	if (!tags) tags=[];
	var hitclass=opts.hitclass||'hl';
	var output='',O=[],j=0,k=0;
	var surround=opts.surround||5;

	var tokens=Q.tokenize(opts.text).tokens;
	var vpos=opts.vpos;
	var i=0,previnrange=!!opts.fulltext ,inrange=!!opts.fulltext;
	var hitstart=0,hitend=0,tagstart=0,tagend=0,tagclass="";
	while (i<tokens.length) {
		var skip=Q.isSkip(tokens[i]);
		var hashit=false;
		inrange=opts.fulltext || (j<hits.length && vpos+surround>=hits[j][0] ||
				(j>0 && j<=hits.length &&  hits[j-1][0]+surround*2>=vpos));	

		if (previnrange!=inrange) {
			output+=opts.abridge||"...";
		}
		previnrange=inrange;
		var token=tokens[i];
		if (opts.nocrlf && token=="\n") token="";

		if (inrange && i<tokens.length) {
			if (skip) {
				output+=token;
			} else {
				var classes="";	

				//check hit
				if (j<hits.length && vpos==hits[j][0]) {
					var nphrase=hits[j][2] % 10, width=hits[j][1];
					hitstart=hits[j][0];
					hitend=hitstart+width;
					j++;
				}

				//check tag
				if (k<tags.length && vpos==tags[k][0]) {
					var width=tags[k][1];
					tagstart=tags[k][0];
					tagend=tagstart+width;
					tagclass=tags[k][2];
					k++;
				}

				if (vpos>=hitstart && vpos<hitend) classes=hitclass+" "+hitclass+nphrase;
				if (vpos>=tagstart && vpos<tagend) classes+=" "+tagclass;

				if (classes || !opts.nospan) {
					output+='<span vpos="'+vpos+'"';
					if (classes) {
						classes+= (tagstart==vpos)?" "+tagclass+"-first":"";
						classes+= (tagend-1==vpos)?" "+tagclass+"-last":"";
						classes=' class="'+classes+'"';
					}
						
					output+=classes+'>';
					output+=token+'</span>';
				} else {
					output+=token;
				}
			}
		}
		if (!skip) vpos++;
		i++; 
	}

	O.push(output);
	output="";

	return O.join("");
}
var highlight=function(Q,opts) {
	if (!opts.text) return {text:"",hits:[]};
	var opt={text:opts.text,
		hits:null,abridge:opts.abridge,vpos:opts.startvpos,
		fulltext:opts.fulltext,renderTags:opts.renderTags,nospan:opts.nospan,nocrlf:opts.nocrlf,
	};

	opt.hits=hitInRange(opts.Q,opts.startvpos,opts.endvpos);
	return {text:injectTag(Q,opt),hits:opt.hits};
}

var addspan=function(text,startvpos){
	engine=this;
	var output="";
	var tokens=engine.analyzer.tokenize(text).tokens;
	var isSkip=engine.analyzer.isSkip;
	var vpos=startvpos;
	for (var i=0;i<tokens.length;i++) {
		output+='<span vpos="'+(vpos)+'">'+tokens[i]+"</span>";
		if (!isSkip(tokens[i])) vpos++;
	}		
	return output;
}
var addtoken=function(text,startvpos) {
	engine=this;
	var output=[];
	var tokens=engine.analyzer.tokenize(text).tokens;
	var isSkip=engine.analyzer.isSkip;
	var vpos=startvpos;
	for (var i=0;i<tokens.length;i++) {
		output.push([tokens[i],vpos]);
		if (!isSkip(tokens[i])) vpos++;
	}		
	return output;
}


var highlightFile=function(Q,fileid,opts,cb) {
	if (typeof opts=="function") {
		cb=opts;
	}

	if (!Q || !Q.engine) return cb(null);

	var segoffsets=Q.engine.getFileSegOffsets(fileid);
	var output=[];	
	//console.log(startvpos,endvpos)
	Q.engine.get(["filecontents",fileid],true,function(data){
		if (!data) {
			console.error("wrong file id",fileid);
		} else {
			for (var i=0;i<data.length-1;i++ ){
				var startvpos=segoffsets[i];
				var endvpos=segoffsets[i+1];
				var segnames=Q.engine.getFileSegNames(fileid);
				var seg=fetchtext.segSync(Q.engine, fileid,i+1);
				var opt={text:seg.text,hits:null,tag:'hl',vpos:startvpos,
					fulltext:true,nospan:opts.nospan,nocrlf:opts.nocrlf};
				var segname=segnames[i+1];
				opt.hits=hitInRange(Q,startvpos,endvpos);
				var pb='<pb n="'+segname+'"></pb>';
				var withtag=injectTag(Q,opt);
				output.push(pb+withtag);
			}			
		}

		cb.apply(Q.engine.context,[{text:output.join(""),file:fileid}]);
	})
}
var highlightSeg=function(Q,fileid,segid,opts,cb,context) {
	if (typeof opts=="function") {
		cb=opts;
	}

	if (!Q || !Q.engine) return cb.apply(context,[null]);
	var segoffsets=Q.engine.getFileSegOffsets(fileid);
	var startvpos=segoffsets[segid];
	var endvpos=segoffsets[segid+1];
	var segnames=Q.engine.getFileSegNames(fileid);

	fetchtext.seg(Q.engine,fileid,segid,function(res){
		var opt={text:res.text,hits:null,vpos:startvpos,fulltext:true,
			nospan:opts.nospan,nocrlf:opts.nocrlf};
			opt.hits=hitInRange(Q,startvpos,endvpos);
			if (opts.renderTags) {
				opt.tags=tagsInRange(Q,opts.renderTags,startvpos,endvpos);
			}

		var segname=segnames[segid];
		cb.apply(context||Q.engine.context,[{text:injectTag(Q,opt),rawtext:res.text,
			tags:opt.tags,seg:segid,file:fileid,hits:opt.hits,segname:segname}]);
	});
}

var highlightRange=function(Q,start,end,opts,cb,context){
	fetchtext.range.call(Q.engine,start,end,function(text){
		var opt={text:text,fulltext:true,nospan:true};
		opt.hits=hitInRange(Q,start,end);

		if (opts.renderTags) {
			opt.tags=tagsInRange(Q,opts.renderTags,start,end);
		}
		opt.vpos=start-1; //getPageRange +1 , 
		var highlighted=injectTag(Q,opt);
		//console.log(highlighted)
		cb.apply(context||Q.engine.context,[{text:highlighted,rawtext:text,tags:opt.tags,hits:opt.hits}]);
	})
}


module.exports={resultlist:resultlist, 
	hitInRange:hitInRange, 
	realHitInRange:realHitInRange, 
	highlightSeg:highlightSeg,
	highlightFile:highlightFile,
	highlightRange:highlightRange,
	calculateRealPos:calculateRealPos
};
},{"./fetchtext":"/home/ec2-user/ksana2015/node_modules/ksana-search/fetchtext.js","./plist":"/home/ec2-user/ksana2015/node_modules/ksana-search/plist.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-search/fetchtext.js":[function(require,module,exports){
var indexOfSorted=require("./plist").indexOfSorted;

var getSeg=function(engine,fileid,segid,opts,cb,context) {
	if (typeof opts=="function") {
		context=cb;
		cb=opts;
		opts={};
	}

	var fileOffsets=engine.get("fileoffsets");
	var segpaths=["filecontents",fileid,segid];
	var segnames=engine.getFileSegNames(fileid);
	var vpos=engine.fileSegToVpos(fileid,segid);

	engine.get(segpaths,function(text){
		var out=text;
		if (opts.span) out=addspan.apply(engine,[text,vpos]);
		else if(opts.token) out=addtoken.apply(engine,[text,vpos]);
		cb.apply(context||engine.context,[{text:out,file:fileid,seg:segid,segname:segnames[segid]}]);
	});
}

var getSegSync=function(engine,fileid,segid) {
	var fileOffsets=engine.get("fileoffsets");
	var segpaths=["filecontents",fileid,segid];
	var segnames=engine.getFileSegNames(fileid);

	var text=engine.get(segpaths);
	return {text:text,file:fileid,seg:segid,segname:segnames[segid]};
}

var getKeyByTagName=function(tagname) {
	var out=[];
	out.push(["fields",tagname]);
	out.push(["fields",tagname+"_vpos"]);
	out.push(["fields",tagname+"_sorted"]);
	out.push(["fields",tagname+"_sorted_idx"]);
	return out;
}
var getPage=function(engine,pageid,cb,context) {
	getPageRange(engine,pageid,function(res){
		getRange.call(engine,res.start,res.end,function(pagetext){
			res.text=pagetext;
			cb.call(context,res);
		});
	})
}
var getPageRange=function(engine,pageid,cb,context) {
	var keys=getKeyByTagName("pb");
	engine.get(keys,function(data){
		var vals=data[0], vpos=data[1], sorted=data[2],sorted_idx=data[3];
		var i=indexOfSorted(sorted,pageid);
		var idx=sorted_idx[i];
		var res={start:vpos[idx]+1,end:vpos[idx+1],text:""};
		if (vals[idx]==pageid) {
			var nextpageid=vals[idx+1];
			if (!nextpageid) res.end=engine.get("meta").vsize;
		} else {//always return top page
			res={start:0,end:vpos[0],text:""};
		}
		cb.call(context,res);
	})
}

var getRange=function(start,end,cb,context){
	var fseg=this.fileSegFromVpos(start);
	var fseg_end=this.fileSegFromVpos(end);
	var keys=[];
	for (var f=fseg.file;f<fseg_end.file+1;f++){
		var range=this.getFileRange(f);

		var from=0, to=range.end-range.start;
		if (f===fseg.file) from=fseg.seg;
		if (f===fseg_end.file) to=fseg_end.seg;
		
		for (var s=from;s<to+1;s++){
			keys.push(["filecontents",f,s]);
		}
	}
	var startsegvpos=this.fileSegToVpos(fseg.file,fseg.seg);
	var endsegvpos=this.fileSegToVpos(fseg_end.file,fseg_end.seg);
	//console.log(fseg,startsegvpos,endsegvpos);
	var startvpos=start-startsegvpos;
	var lastvpos=end-endsegvpos;

	//console.log(start,end,startvpos,lastvpos);
	var combinetext=function(text,idx,texts) {
		var out=text;
		if (idx==0 || idx===texts.length-1) {
			var tokenized=this.analyzer.tokenize(text);
			var now=0;
			out=tokenized.tokens.map(function(t){
				if (!this.analyzer.isSkip(t))now++;
				if (now<startvpos && idx===0) return "";
				else if (now>lastvpos && idx===texts.length-1) return "";
				else return t;
			}.bind(this)).join("");
		}
		return out;
	}
	this.get(keys,function(data){
		cb(data.map(combinetext.bind(this)).join(""));
	}.bind(this));
}

var getFile=function(engine,fileid,cb) {
	var filename=engine.get("filenames")[fileid];
	var segnames=engine.getFileSegNames(fileid);
	var filestart=engine.get("fileoffsets")[fileid];
	var offsets=engine.getFileSegOffsets(fileid);
	var pc=0;
	engine.get(["filecontents",fileid],true,function(data){
		var text=data.map(function(t,idx) {
			if (idx==0) return ""; 
			var pb='<pb n="'+segnames[idx]+'"></pb>';
			return pb+t;
		});
		cb({texts:data,text:text.join(""),segnames:segnames,filestart:filestart,offsets:offsets,file:fileid,filename:filename}); //force different token
	});
}

module.exports=	{file:getFile,seg:getSeg,segSync:getSegSync,range:getRange,page:getPage,pageRange:getPageRange};
},{"./plist":"/home/ec2-user/ksana2015/node_modules/ksana-search/plist.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-search/index.js":[function(require,module,exports){
//
// Ksana Search Engine.

//  need a KDE instance to be functional

var mainsearch=require("./search");
var _excerpt=require("./excerpt")	;
var prepareEngineForSearch=function(engine,cb){
	var t=new Date();
	engine.get([["tokens"],["postingslength"],["search"]],{recursive:true},function(){
		if (!engine.timing.gettokens) engine.timing.gettokens=new Date()-t;
			var meta=engine.get("meta");
			var normalize=engine.get(["search","normalize"]);
			if (normalize && engine.analyzer.setNormalizeTable) {
				//normalized object will be combined in analyzer
				meta.normalizeObj=engine.analyzer.setNormalizeTable(normalize,meta.normalizeObj);
			}
		cb();
	});
}

var openEngine=function(dbid_or_engine,cb,context) {
	var localfile=(typeof File!=="undefined" && dbid_or_engine.constructor==File);
	if (typeof dbid_or_engine=="string" || localfile) {//browser only
		var kde=require("ksana-database");

		kde.open(dbid_or_engine,function(err,engine){

			if (!err) {
				prepareEngineForSearch(engine,function(){
					cb.call(context,engine);
				});
			} else throw err;
		});
	} else {
		prepareEngineForSearch(dbid_or_engine,function(){
			cb.call(context,dbid_or_engine);
		});
	}
}
var _search=function(engine,q,opts,cb,context) {

	openEngine(engine,function(engine){

		if (typeof opts=="function") { //user didn't supply options
			if (typeof cb=="object")context=cb;
			cb=opts;
			opts={};
		}
		if (!opts) opts={};
		opts.q=q;
		opts.dbid=engine;
		return mainsearch(engine,q,opts,cb);
	});
}
var fetchtext=require("./fetchtext");
var _highlightSeg=function(engine,fileid,segid,opts,cb,context){
	openEngine(engine,function(engine){
		/*
		if (!opts.q) {
			if (!engine.analyzer) {
				var analyzer=require("ksana-analyzer");
				var config=engine.get("meta").config;
				engine.analyzer=analyzer.getAPI(config);			
			}
			fetchtext.seg(engine,fileid,segid,opts,cb,context);
		} else {
		*/
			_search(engine,opts.q,opts,function(err,Q){
				api.excerpt.highlightSeg(Q,fileid,segid,opts,cb,context);
			});			
		//}		
	});
}


var _highlightRange=function(engine,opts,cb,context){
	openEngine(engine,function(engine){
		if (opts.q) {
			_search(engine,opts.q,opts,function(err,Q){
				api.excerpt.highlightRange(Q,opts.start,opts.end,opts,cb,context);
			});
		} else {
			fetchtext.range.call(engine,opts.start,opts.end,cb,context);
		}		
	})
}

var _highlightPage=function(_engine,opts,cb,context){
	openEngine(_engine,function(engine){
		fetchtext.pageRange(engine,opts.id,function(res){
			if (!res) {
				console.error("error page",opts.page)
				return;
			}
			if (opts.q) {
				_search(engine,opts.q,opts,function(err,Q){
					api.excerpt.highlightRange(Q,res.start,res.end,opts,cb,context);
				});
			} else {
				fetchtext.range.call(engine,res.start,res.end,cb,context);
			}					
		})
	})
}

var _highlightFile=function(engine,fileid,opts,cb,context){
	openEngine(engine,function(engine){
		if (!opts.q) opts.q=""; 
		_search(engine,opts.q,opts,function(err,Q){
			api.excerpt.highlightFile(Q,fileid,opts,cb,context);
		});		
	})
}

var _searchInTag=function(engine,opts,cb,context){

}

//similar to calculateRealPos, for converting markup
var vpos2pos=function(db, textvpos , text, vpos_end ) {
	var tokenize=db.analyzer.tokenize;
	var isSkip=db.analyzer.isSkip;
	return _excerpt.calculateRealPos(tokenize,isSkip,textvpos,text,vpos_end);
}


var api={
	search:_search
	,highlightSeg:_highlightSeg
	,highlightFile:_highlightFile
	,highlightPage:_highlightPage
	,highlightRange:_highlightRange
	,searchInTag:_searchInTag
	,excerpt:_excerpt
	,vpos2pos:vpos2pos
	,open:openEngine
	,_search:mainsearch//for testing only
}
module.exports=api;
},{"./excerpt":"/home/ec2-user/ksana2015/node_modules/ksana-search/excerpt.js","./fetchtext":"/home/ec2-user/ksana2015/node_modules/ksana-search/fetchtext.js","./search":"/home/ec2-user/ksana2015/node_modules/ksana-search/search.js","ksana-database":"/home/ec2-user/ksana2015/node_modules/ksana-database/index.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-search/plist.js":[function(require,module,exports){

var unpack = function (ar) { // unpack variable length integer list
  var r = [],
  i = 0,
  v = 0;
  do {
	var shift = 0;
	do {
	  v += ((ar[i] & 0x7F) << shift);
	  shift += 7;
	} while (ar[++i] & 0x80);
	r[r.length]=v;
  } while (i < ar.length);
  return r;
}

/*
   arr:  [1,1,1,1,1,1,1,1,1]
   levels: [0,1,1,2,2,0,1,2]
   output: [5,1,3,1,1,3,1,1]
*/

var groupsum=function(arr,levels) {
  if (arr.length!=levels.length+1) return null;
  var stack=[];
  var output=new Array(levels.length);
  for (var i=0;i<levels.length;i++) output[i]=0;
  for (var i=1;i<arr.length;i++) { //first one out of toc scope, ignored
    if (stack.length>levels[i-1]) {
      while (stack.length>levels[i-1]) stack.pop();
    }
    stack.push(i-1);
    for (var j=0;j<stack.length;j++) {
      output[stack[j]]+=arr[i];
    }
  }
  return output;
}
/* arr= 1 , 2 , 3 ,4 ,5,6,7 //token posting
  posting= 3 , 5  //tag posting
  out = 3 , 2, 2
*/
var countbyposting = function (arr, posting) {
  if (!posting.length) return [arr.length];
  var out=[];
  for (var i=0;i<posting.length;i++) out[i]=0;
  out[posting.length]=0;
  var p=0,i=0,lasti=0;
  while (i<arr.length && p<posting.length) {
    if (arr[i]<=posting[p]) {
      while (p<posting.length && i<arr.length && arr[i]<=posting[p]) {
        out[p]++;
        i++;
      }      
    } 
    p++;
  }
  out[posting.length] = arr.length-i; //remaining
  return out;
}

var groupbyposting=function(arr,gposting) { //relative vpos
  if (!gposting.length) return [arr.length];
  var out=[];
  for (var i=0;i<=gposting.length;i++) out[i]=[];
  
  var p=0,i=0,lasti=0;
  while (i<arr.length && p<gposting.length) {
    if (arr[i]<gposting[p]) {
      while (p<gposting.length && i<arr.length && arr[i]<gposting[p]) {
        var start=0;
        if (p>0) start=gposting[p-1];
        out[p].push(arr[i++]-start);  // relative
      }      
    } 
    p++;
  }
  //remaining
  while(i<arr.length) out[out.length-1].push(arr[i++]-gposting[gposting.length-1]);
  return out;
}
var groupbyposting2=function(arr,gposting) { //absolute vpos
  if (!arr || !arr.length) return [];
  if (!gposting || !gposting.length) return [arr.length];
  var out=[];
  for (var i=0;i<=gposting.length;i++) out[i]=[];
  
  var p=0,i=0,lasti=0;
  while (i<arr.length && p<gposting.length) {
    if (arr[i]<gposting[p]) {
      while (p<gposting.length && i<arr.length && arr[i]<gposting[p]) {
        var start=0;
        if (p>0) start=gposting[p-1]; //absolute
        out[p].push(arr[i++]);
      }      
    } 
    p++;
  }
  //remaining
  while(i<arr.length) out[out.length-1].push(arr[i++]);
  return out;
}
var groupbyblock2 = function(ar, ntoken,slotshift,opts) {
  if (!ar.length) return [{},{}];
  
  slotshift = slotshift || 16;
  var g = Math.pow(2,slotshift);
  var i = 0;
  var r = {}, ntokens={};
  var groupcount=0;
  do {
    var group = Math.floor(ar[i] / g) ;
    if (!r[group]) {
      r[group] = [];
      ntokens[group]=[];
      groupcount++;
    }
    r[group].push(ar[i] % g);
    ntokens[group].push(ntoken[i]);
    i++;
  } while (i < ar.length);
  if (opts) opts.groupcount=groupcount;
  return [r,ntokens];
}
var groupbyslot = function (ar, slotshift, opts) {
  if (!ar.length)
	return {};
  
  slotshift = slotshift || 16;
  var g = Math.pow(2,slotshift);
  var i = 0;
  var r = {};
  var groupcount=0;
  do {
	var group = Math.floor(ar[i] / g) ;
	if (!r[group]) {
	  r[group] = [];
	  groupcount++;
	}
	r[group].push(ar[i] % g);
	i++;
  } while (i < ar.length);
  if (opts) opts.groupcount=groupcount;
  return r;
}
/*
var identity = function (value) {
  return value;
};
var sortedIndex = function (array, obj, iterator) { //taken from underscore
  iterator || (iterator = identity);
  var low = 0,
  high = array.length;
  while (low < high) {
	var mid = (low + high) >> 1;
	iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
  }
  return low;
};*/

var indexOfSorted = function (array, obj) { 
  var low = 0,
  high = array.length-1;
  while (low < high) {
    var mid = (low + high) >> 1;
    array[mid] < obj ? low = mid + 1 : high = mid;
  }
  return low;
};
var plhead=function(pl, pltag, opts) {
  opts=opts||{};
  opts.max=opts.max||1;
  var out=[];
  if (pltag.length<pl.length) {
    for (var i=0;i<pltag.length;i++) {
       k = indexOfSorted(pl, pltag[i]);
       if (k>-1 && k<pl.length) {
        if (pl[k]==pltag[i]) {
          out[out.length]=pltag[i];
          if (out.length>=opts.max) break;
        }
      }
    }
  } else {
    for (var i=0;i<pl.length;i++) {
       k = indexOfSorted(pltag, pl[i]);
       if (k>-1 && k<pltag.length) {
        if (pltag[k]==pl[i]) {
          out[out.length]=pltag[k];
          if (out.length>=opts.max) break;
        }
      }
    }
  }
  return out;
}
/*
 pl2 occur after pl1, 
 pl2>=pl1+mindis
 pl2<=pl1+maxdis
*/
var plfollow2 = function (pl1, pl2, mindis, maxdis) {
  var r = [],i=0;
  var swap = 0;
  
  while (i<pl1.length){
    var k = indexOfSorted(pl2, pl1[i] + mindis);
    var t = (pl2[k] >= (pl1[i] +mindis) && pl2[k]<=(pl1[i]+maxdis)) ? k : -1;
    if (t > -1) {
      r[r.length]=pl1[i];
      i++;
    } else {
      if (k>=pl2.length) break;
      var k2=indexOfSorted (pl1,pl2[k]-maxdis);
      if (k2>i) {
        var t = (pl2[k] >= (pl1[i] +mindis) && pl2[k]<=(pl1[i]+maxdis)) ? k : -1;
        if (t>-1) r[r.length]=pl1[k2];
        i=k2;
      } else break;
    }
  }
  return r;
}

var plnotfollow2 = function (pl1, pl2, mindis, maxdis) {
  var r = [],i=0;
  
  while (i<pl1.length){
    var k = indexOfSorted(pl2, pl1[i] + mindis);
    var t = (pl2[k] >= (pl1[i] +mindis) && pl2[k]<=(pl1[i]+maxdis)) ? k : -1;
    if (t > -1) {
      i++;
    } else {
      if (k>=pl2.length) {
        r=r.concat(pl1.slice(i));
        break;
      } else {
        var k2=indexOfSorted (pl1,pl2[k]-maxdis);
        if (k2>i) {
          r=r.concat(pl1.slice(i,k2));
          i=k2;
        } else break;
      }
    }
  }
  return r;
}
/* this is incorrect */
var plfollow = function (pl1, pl2, distance) {
  var r = [],i=0;

  while (i<pl1.length){
    var k = indexOfSorted(pl2, pl1[i] + distance);
    var t = (pl2[k] === (pl1[i] + distance)) ? k : -1;
    if (t > -1) {
      r.push(pl1[i]);
      i++;
    } else {
      if (k>=pl2.length) break;
      var k2=indexOfSorted (pl1,pl2[k]-distance);
      if (k2>i) {
        t = (pl2[k] === (pl1[k2] + distance)) ? k : -1;
        if (t>-1) {
           r.push(pl1[k2]);
           k2++;
        }
        i=k2;
      } else break;
    }
  }
  return r;
}
var plnotfollow = function (pl1, pl2, distance) {
  var r = [];
  var r = [],i=0;
  var swap = 0;
  
  while (i<pl1.length){
    var k = indexOfSorted(pl2, pl1[i] + distance);
    var t = (pl2[k] === (pl1[i] + distance)) ? k : -1;
    if (t > -1) { 
      i++;
    } else {
      if (k>=pl2.length) {
        r=r.concat(pl1.slice(i));
        break;
      } else {
        var k2=indexOfSorted (pl1,pl2[k]-distance);
        if (k2>i) {
          r=r.concat(pl1.slice(i,k2));
          i=k2;
        } else break;
      }
    }
  }
  return r;
}
var pland = function (pl1, pl2, distance) {
  var r = [];
  var swap = 0;
  
  if (pl1.length > pl2.length) { //swap for faster compare
    var t = pl2;
    pl2 = pl1;
    pl1 = t;
    swap = distance;
    distance = -distance;
  }
  for (var i = 0; i < pl1.length; i++) {
    var k = indexOfSorted(pl2, pl1[i] + distance);
    var t = (pl2[k] === (pl1[i] + distance)) ? k : -1;
    if (t > -1) {
      r.push(pl1[i] - swap);
    }
  }
  return r;
}
var combine=function (postings) {
  var out=[];
  for (var i in postings) {
    out=out.concat(postings[i]);
  }
  out.sort(function(a,b){return a-b});
  return out;
}

var unique = function(ar){
   if (!ar || !ar.length) return [];
   var u = {}, a = [];
   for(var i = 0, l = ar.length; i < l; ++i){
    if(u.hasOwnProperty(ar[i])) continue;
    a.push(ar[i]);
    u[ar[i]] = 1;
   }
   return a;
}



var plphrase = function (postings,ops) {
  var r = [];
  for (var i=0;i<postings.length;i++) {
  	if (!postings[i])  return [];
  	if (0 === i) {
  	  r = postings[0];
  	} else {
      if (ops[i]=='andnot') {
        r = plnotfollow(r, postings[i], i);  
      }else {
        r = pland(r, postings[i], i);  
      }
  	}
  }
  
  return r;
}
//return an array of group having any of pl item
var matchPosting=function(pl,gupl,start,end) {
  start=start||0;
  end=end||-1;
  if (end==-1) end=Math.pow(2, 53); // max integer value

  var count=0, i = j= 0,  result = [] ,v=0;
  var docs=[], freq=[];
  if (!pl) return {docs:[],freq:[]};
  while( i < pl.length && j < gupl.length ){
     if (pl[i] < gupl[j] ){ 
       count++;
       v=pl[i];
       i++; 
     } else {
       if (count) {
        if (v>=start && v<end) {
          docs.push(j);
          freq.push(count);          
        }
       }
       j++;
       count=0;
     }
  }
  if (count && j<gupl.length && v>=start && v<end) {
    docs.push(j);
    freq.push(count);
    count=0;
  }
  else {
    while (j==gupl.length && i<pl.length && pl[i] >= gupl[gupl.length-1]) {
      i++;
      count++;
    }
    if (v>=start && v<end) {
      docs.push(j);
      freq.push(count);      
    }
  } 
  return {docs:docs,freq:freq};
}

var trim=function(arr,start,end) {
  var s=indexOfSorted(arr,start);
  var e=indexOfSorted(arr,end);
  return arr.slice(s,e+1);
}
var plist={};
plist.unpack=unpack;
plist.plphrase=plphrase;
plist.plhead=plhead;
plist.plfollow2=plfollow2;
plist.plnotfollow2=plnotfollow2;
plist.plfollow=plfollow;
plist.plnotfollow=plnotfollow;
plist.unique=unique;
plist.indexOfSorted=indexOfSorted;
plist.matchPosting=matchPosting;
plist.trim=trim;

plist.groupbyslot=groupbyslot;
plist.groupbyblock2=groupbyblock2;
plist.countbyposting=countbyposting;
plist.groupbyposting=groupbyposting;
plist.groupbyposting2=groupbyposting2;
plist.groupsum=groupsum;
plist.combine=combine;
module.exports=plist;
},{}],"/home/ec2-user/ksana2015/node_modules/ksana-search/search.js":[function(require,module,exports){
/*
var dosearch2=function(engine,opts,cb,context) {
	opts
		nfile,npage  //return a highlighted page
		nfile,[pages] //return highlighted pages 
		nfile        //return entire highlighted file
		abs_npage
		[abs_pages]  //return set of highlighted pages (may cross file)

		filename, pagename
		filename,[pagenames]

		excerpt      //
	    sortBy       //default natural, sortby by vsm ranking

	//return err,array_of_string ,Q  (Q contains low level search result)
}

*/
/* TODO sorted tokens */
var plist=require("./plist");
var boolsearch=require("./boolsearch");
var excerpt=require("./excerpt");
var parseTerm = function(engine,raw,opts) {
	if (!raw) return;
	var res={raw:raw,variants:[],term:'',op:''};
	var term=raw, op=0;
	var firstchar=term[0];
	var termregex="";
	if (firstchar=='-') {
		term=term.substring(1);
		firstchar=term[0];
		res.exclude=true; //exclude
	}
	term=term.trim();
	var lastchar=term[term.length-1];
	term=engine.analyzer.normalize(term);
	
	if (term.indexOf("%")>-1) {
		var termregex="^"+term.replace(/%+/g,".+")+"$";
		if (firstchar=="%") 	termregex=".+"+termregex.substr(1);
		if (lastchar=="%") 	termregex=termregex.substr(0,termregex.length-1)+".+";
	}

	if (termregex) {
		res.variants=expandTerm(engine,termregex);
	}

	res.key=term;
	return res;
}
var expandTerm=function(engine,regex) {
	var r=new RegExp(regex);
	var tokens=engine.get("tokens");
	var postingsLength=engine.get("postingslength");
	if (!postingsLength) postingsLength=[];
	var out=[];
	for (var i=0;i<tokens.length;i++) {
		var m=tokens[i].match(r);
		if (m) {
			out.push([m[0],postingsLength[i]||1]);
		}
	}
	out.sort(function(a,b){return b[1]-a[1]});
	return out;
}
var isWildcard=function(raw) {
	return !!raw.match(/[\*\?]/);
}
var hasWildcard=function(raw) {
	return ~raw.indexOf("?") || ~raw.indexOf("*");
}

var isOrTerm=function(term) {
	term=term.trim();
	return (term[term.length-1]===',');
}
var orterm=function(engine,term,key) {
		var t={text:key};
		if (engine.analyzer.simplifiedToken) {
			t.simplified=engine.analyzer.simplifiedToken(key);
		}
		term.variants.push(t);
}
var orTerms=function(engine,tokens,now) {
	var raw=tokens[now];
	var term=parseTerm(engine,raw);
	if (!term) return;
	orterm(engine,term,term.key);
	while (isOrTerm(raw))  {
		raw=tokens[++now];
		var term2=parseTerm(engine,raw);
		orterm(engine,term,term2.key);
		for (var i in term2.variants){
			term.variants[i]=term2.variants[i];
		}
		term.key+=','+term2.key;
	}
	return term;
}

var getOperator=function(raw) {
	var op='';
	if (raw[0]=='+') op='include';
	if (raw[0]=='-') op='exclude';
	return op;
}
var parsePhrase=function(q) {
	var match=q.match(/(".+?"|'.+?'|\S+)/g)
	match=match.map(function(str){
		var n=str.length, h=str.charAt(0), t=str.charAt(n-1)
		if (h===t&&(h==='"'|h==="'")) str=str.substr(1,n-2)
		return str;
	})
	return match;
}
var tibetanNumber={
	"\u0f20":"0","\u0f21":"1","\u0f22":"2",	"\u0f23":"3",	"\u0f24":"4",
	"\u0f25":"5","\u0f26":"6","\u0f27":"7","\u0f28":"8","\u0f29":"9"
}
var parseNumber=function(raw) {
	var n=parseInt(raw,10);
	if (isNaN(n)){
		var converted=[];
		for (var i=0;i<raw.length;i++) {
			var nn=tibetanNumber[raw[i]];
			if (typeof nn !="undefined") converted[i]=nn;
			else break;
		}
		return parseInt(converted,10);
	} else {
		return n;
	}
}
var parseWildcard=function(raw) {
	var n=parseNumber(raw.substr(1)) || 1;
	var qcount=raw.split('?').length-1;
	var scount=raw.split('*').length-1;
	var type='';
	if (qcount) type='?';
	else if (scount) type='*';
	return {wildcard:type, width: n , op:'wildcard'};
}

var newPhrase=function() {
	return {termid:[],posting:[],raw:'',termlength:[]};
} 
var parseQuery=function(q,sep) {
	if (sep && q.indexOf(sep)>-1) {
		var match=q.split(sep);
	} else {
		var match=q.match(/(".+?"|'.+?'|\S+)/g)
		match=match.map(function(str){
			var n=str.length, h=str.charAt(0), t=str.charAt(n-1)
			if (h===t&&(h==='"'|h==="'")) str=str.substr(1,n-2)
			return str
		})
		//console.log(input,'==>',match)		
	}
	return match;
}
var loadPhrase=function(phrase) {
	/* remove leading and ending wildcard */
	var Q=this;
	var cache=Q.engine.postingCache;
	if (cache[phrase.key]) {
		phrase.posting=cache[phrase.key];
		return Q;
	}
	if (phrase.termid.length==1) {
		if (!Q.terms.length){
			phrase.posting=[];
		} else {
			cache[phrase.key]=phrase.posting=Q.terms[phrase.termid[0]].posting;	
		}
		return Q;
	}

	var i=0, r=[],dis=0;
	while(i<phrase.termid.length) {
	  var T=Q.terms[phrase.termid[i]];
		if (0 === i) {
			r = T.posting;
		} else {
		    if (T.op=='wildcard') {
		    	T=Q.terms[phrase.termid[i++]];
		    	var width=T.width;
		    	var wildcard=T.wildcard;
		    	T=Q.terms[phrase.termid[i]];
		    	var mindis=dis;
		    	if (wildcard=='?') mindis=dis+width;
		    	if (T.exclude) r = plist.plnotfollow2(r, T.posting, mindis, dis+width);
		    	else r = plist.plfollow2(r, T.posting, mindis, dis+width);		    	
		    	dis+=(width-1);
		    }else {
		    	if (T.posting) {
		    		if (T.exclude) r = plist.plnotfollow(r, T.posting, dis);
		    		else r = plist.plfollow(r, T.posting, dis);
		    	}
		    }
		}
		dis += phrase.termlength[i];
		i++;
		if (!r) return Q;
  }
  phrase.posting=r;
  cache[phrase.key]=r;
  return Q;
}
var trimSpace=function(engine,query) {
	if (!query) return "";
	var i=0;
	var isSkip=engine.analyzer.isSkip;
	while (i<query.length && isSkip(query[i])) i++;
	return query.substring(i);
}
var getSegWithHit=function(fileid,offsets) {
	var Q=this,engine=Q.engine;
	var segWithHit=plist.groupbyposting2(Q.byFile[fileid ], offsets);
	if (segWithHit.length) segWithHit.shift(); //the first item is not used (0~Q.byFile[0] )
	var out=[];
	segWithHit.map(function(p,idx){if (p.length) out.push(idx)});
	return out;
}
var segWithHit=function(fileid) {
	var Q=this,engine=Q.engine;
	var offsets=engine.getFileSegOffsets(fileid);
	return getSegWithHit.apply(this,[fileid,offsets]);
}
var isSimplePhrase=function(phrase) {
	var m=phrase.match(/[\?%^]/);
	return !m;
}

// 發菩提心   ==> 發菩  提心       2 2   
// 菩提心     ==> 菩提  提心       1 2
// 劫劫       ==> 劫    劫         1 1   // invalid
// 因緣所生道  ==> 因緣  所生   道   2 2 1
var splitPhrase=function(engine,simplephrase,bigram) {
	var bigram=bigram||engine.get(["search","bigram"])||[];

	var tokens=engine.analyzer.tokenize(simplephrase).tokens;
	var loadtokens=[],lengths=[],j=0,lastbigrampos=-1;
	while (j+1<tokens.length) {
		var token=engine.analyzer.normalize(tokens[j]);
		var nexttoken=engine.analyzer.normalize(tokens[j+1]);
		var bi=token+nexttoken;
		var i=plist.indexOfSorted(bigram,bi);
		if (bigram[i]===bi) {
			loadtokens.push(bi);
			if (j+3<tokens.length) {
				lastbigrampos=j;
				j++;
			} else {
				if (j+2==tokens.length){ 
					if (lastbigrampos+1==j ) {
						lengths[lengths.length-1]--;
					}
					lastbigrampos=j;
					j++;
				}else {
					lastbigrampos=j;	
				}
			}
			lengths.push(2);
		} else {
			if (!bigram || lastbigrampos==-1 || lastbigrampos+1!=j) {
				loadtokens.push(token);
				lengths.push(1);				
			}
		}
		j++;
	}
	while (j<tokens.length) {
		var token=engine.analyzer.normalize(tokens[j]);
		loadtokens.push(token);
		lengths.push(1);
		j++;
	}

	return {tokens:loadtokens, lengths: lengths , tokenlength: tokens.length};
}
/* host has fast native function */
var fastPhrase=function(engine,phrase,cb) {
	var phrase_term=newPhrase();

	if (!phrase.trim()) {
		cb(phrase_term);
		return;
	}
	//var tokens=engine.analyzer.tokenize(phrase).tokens;
	var splitted=splitPhrase(engine,phrase);

	var paths=postingPathFromTokens(engine,splitted.tokens);
//create wildcard

	phrase_term.width=splitted.tokenlength; //for excerpt.js to getPhraseWidth

	engine.get(paths,{address:true},function(postingAddress){ //this is sync
		phrase_term.key=phrase;
		var postingAddressWithWildcard=[];
		for (var i=0;i<postingAddress.length;i++) {
			postingAddressWithWildcard.push(postingAddress[i]);
			if (splitted.lengths[i]>1) {
				postingAddressWithWildcard.push([splitted.lengths[i],0]); //wildcard has blocksize==0 
			}
		};
		engine.mergePostings(postingAddressWithWildcard,function(r){
			engine.postingCache[phrase]=r;
			cb(phrase_term);
		});
		
	});
}
var slowPhrase=function(engine,terms,phrase) {
	var parts=[],lastidx=0;
	phrase.replace(/[ ་]?([\?\*]\d?)[ ་]?/g,function(m,m1,idx){
		s=phrase.substring(lastidx,idx);
		parts.push(s);
		parts.push(m1);
		lastidx=idx+m.length;
	});

	parts.push(phrase.substring(lastidx));
	
	var j=0;//,tokens=engine.analyzer.tokenize(phrase).tokens;
	var phrase_term=newPhrase();
	var termid=0;
	while (j<parts.length) {
		var raw=parts[j], termlength=1;
		if (isWildcard(raw)) {
			if (phrase_term.termid.length==0)  { //skip leading wild card
				j++
				continue;
			}
			terms.push(parseWildcard(raw));
			termid=terms.length-1;
			phrase_term.termid.push(termid);
			phrase_term.termlength.push(termlength);
		} else if (isOrTerm(raw)){
			var term=orTerms.apply(this,[parts,j]);
			if (term) {
				terms.push(term);
				termid=terms.length-1;
				j+=term.key.split(',').length-1;					
			}
			j++;
			phrase_term.termid.push(termid);
			phrase_term.termlength.push(termlength);
		} else {

			var splitted=splitPhrase(engine,parts[j]);
			for (var i=0;i<splitted.tokens.length;i++) {
				var term=parseTerm(engine,splitted.tokens[i]);
				if (!term) continue;
				var termidx=terms.map(function(a){return a.key}).indexOf(term.key);
				if (termidx==-1) {
					terms.push(term);
					termid=terms.length-1;
				} else {
					termid=termidx;
				}				
				phrase_term.termid.push(termid);
				phrase_term.termlength.push(splitted.lengths[i]);
			}
		}
		j++;
	}
	phrase_term.key=phrase;
	//remove ending wildcard
	var P=phrase_term , T=null;
	do {
		T=terms[P.termid[P.termid.length-1]];
		if (!T) break;
		if (T.wildcard) P.termid.pop(); else break;
	} while(T);		
	return phrase_term;
}


var newQuery =function(engine,query,opts,cb) {
	var Q=engine.queryCache[query];
	if (Q) {
		cb(Q);
		return;
	}

	opts=opts||{};
	query=trimSpace(engine,query);

	var phrases=query,phrases=[];
	if (typeof query=='string' && query) {
		phrases=parseQuery(query,opts.phrase_sep || "");
	}
	
	var phrase_terms=[], terms=[],variants=[],operators=[];
	var pc=0;//phrase count
	var that=this,taskqueue=[];
	for  (var i=0;i<phrases.length;i++) {
		var op=getOperator(phrases[pc]);
		if (op) phrases[pc]=phrases[pc].substring(1);

		/* auto add + for natural order ?*/
		//if (!opts.rank && op!='exclude' &&i) op='include';
		operators.push(op);

		taskqueue.push(function(data){

			if (typeof data=='object' && data.__empty) {
				//not pushing the first call
			} else {
				if (engine.mergePostings || data.termid.length!=0) {
					phrase_terms.push(data);
					pc++;
				}
			}

			if (isSimplePhrase(phrases[pc]) && engine.mergePostings && !hasWildcard(phrases[pc]) ) {
				fastPhrase(engine,phrases[pc],function(res){
					taskqueue.shift()(res);
				});
			} else {
				taskqueue.shift()(slowPhrase(engine,terms,phrases[pc] ));
			}
		});
	}

	//last call to child load
	taskqueue.push(function(data){
		if (engine.mergePostings || (data.termid && data.termid.length!=0))  {
			phrase_terms.push(data);
			pc++;
		}
		opts.op=operators;
		cb.call(that,Q);
	});


	var Q={dbname:engine.dbname,engine:engine,opts:opts,query:query,
		phrases:phrase_terms,terms:terms,segWithHit:segWithHit,rawresult:[]};
	Q.tokenize=function() {return engine.analyzer.tokenize.apply(engine,arguments);}
	Q.isSkip=function() {return engine.analyzer.isSkip.apply(engine,arguments);}
	Q.normalize=function() {return engine.analyzer.normalize.apply(engine,arguments);}	

	//invoke task queue
	taskqueue.shift()({__empty:true});
}
var postingPathFromTokens=function(engine,tokens) {
	var alltokens=engine.get("tokens");
	var meta=engine.get("meta");
	
	var tokenIds=tokens.map(function(t){ 
		if (meta.indexer && meta.indexer>=16) {
			return 1+plist.indexOfSorted(alltokens,tokens[0]);
		}
		return 1+alltokens.indexOf(t)
	});
	var postingid=[];
	for (var i=0;i<tokenIds.length;i++) {
		postingid.push( tokenIds[i]); // tokenId==0 , empty token
	}
	return postingid.map(function(t){return ["postings",t]});
}
var loadPostings=function(engine,tokens,cb) {
	var toloadtokens=tokens.filter(function(t){
		return !engine.postingCache[t.key]; //already in cache
	});
	if (toloadtokens.length==0) {
		cb();
		return;
	}
	var postingPaths=postingPathFromTokens(engine,tokens.map(function(t){return t.key}));
	var t=new Date();
	engine.get(postingPaths,function(postings){
		engine.timing.loadPostings=new Date()-t;
		postings.map(function(p,i) { tokens[i].posting=p });
		if (cb) cb();
	});
}
var groupBy=function(Q,posting) {
	phrases.forEach(function(P){
		var key=P.key;
		var docfreq=docfreqcache[key];
		if (!docfreq) docfreq=docfreqcache[key]={};
		if (!docfreq[that.groupunit]) {
			docfreq[that.groupunit]={doclist:null,freq:null};
		}		
		if (P.posting) {
			var res=matchPosting(engine,P.posting);
			P.freq=res.freq;
			P.docs=res.docs;
		} else {
			P.docs=[];
			P.freq=[];
		}
		docfreq[that.groupunit]={doclist:P.docs,freq:P.freq};
	});
	return this;
}
var groupByFolder=function(engine,filehits) {
	var files=engine.get("filenames");
	var prevfolder="",hits=0,out=[];
	for (var i=0;i<filehits.length;i++) {
		var fn=files[i];
		var folder=fn.substring(0,fn.indexOf('/'));
		if (prevfolder && prevfolder!=folder) {
			out.push(hits);
			hits=0;
		}
		hits+=filehits[i].length;
		prevfolder=folder;
	}
	out.push(hits);
	return out;
}
var phrase_intersect=function(engine,Q) {
	var intersected=null;
	var fileoffsets=Q.engine.get("fileoffsets");
	var empty=[],emptycount=0,hashit=0;
	for (var i=0;i<Q.phrases.length;i++) {
		var byfile=plist.groupbyposting2(Q.phrases[i].posting,fileoffsets);
		if (byfile.length) byfile.shift();
		if (byfile.length) byfile.pop();
		byfile.pop();
		if (intersected==null) {
			intersected=byfile;
		} else {
			for (var j=0;j<byfile.length;j++) {
				if (!(byfile[j].length && intersected[j] && intersected[j].length)) {
					intersected[j]=empty; //reuse empty array
					emptycount++;
				} else hashit++;
			}
		}
	}

	Q.byFile=intersected;
	//Q.byFolder=groupByFolder(engine,Q.byFile);
	var out=[];
	//calculate new rawposting
	for (var i=0;i<Q.byFile.length;i++) {
		if (Q.byFile[i].length) out=out.concat(Q.byFile[i]);
	}
	Q.rawresult=out;
	//countFolderFile(Q);
}
/*
var countFolderFile=function(Q) {
	Q.fileWithHitCount=0;
	Q.byFile.map(function(f){if (f.length) Q.fileWithHitCount++});
			
	Q.folderWithHitCount=0;
	Q.byFolder.map(function(f){if (f) Q.folderWithHitCount++});
}
*/
var main=function(engine,q,opts,cb){

	var starttime=new Date();

	if (typeof opts=="function") cb=opts;
	opts=opts||{};


	var generateResult=function(Q){
		var t=new Date();
		excerpt.resultlist(engine,Q,opts,function(data) { 
			//console.log("excerpt ok");
			Q.excerpt=data;
			engine.timing.excerpt=new Date()-t;
			cb.apply(engine.context,[0,Q]);
		});		
	}
	
	newQuery(engine,q,opts,function(Q){ 
		if (!Q) {
			engine.timing.search=new Date()-starttime;

			if (engine.context) cb.apply(engine.context,["empty result",{rawresult:[]}]);
			else cb("empty result",{rawresult:[]});
			return;
		};
		engine.queryCache[q]=Q;
		if (Q.phrases.length) {
			
			loadPostings(engine,Q.terms,function(){
				if (!Q.phrases[0].posting) {
					engine.timing.search=new Date()-starttime;
					Q.rawresult=[];
					cb.apply(engine.context,["no such posting",Q]);
					return;			
				}
				
				var startsearch=new Date();
				if (!Q.phrases[0].posting.length) { //
					Q.phrases.forEach(loadPhrase.bind(Q));
				}
				if (Q.phrases.length==1) {
					Q.rawresult=Q.phrases[0].posting;
				} else {
					phrase_intersect(engine,Q);
				}
				var fileoffsets=Q.engine.get("fileoffsets");
				//console.log("search opts "+JSON.stringify(opts));	
				
				if (opts.range) {
					if (!Q.byFile && Q.rawresult && Q.rawresult.length) {
						//console.log("grouping",Q.rawresult.length,fileoffsets.length)
						Q.byFile=plist.groupbyposting2(Q.rawresult, fileoffsets);
						Q.byFile.shift();Q.byFile.pop();
						//Q.byFolder=groupByFolder(engine,Q.byFile);
						//countFolderFile(Q);
					}

					engine.timing.search=new Date()-startsearch;
					if (opts.range.from && typeof opts.range.from==="string") {
						var nfile_sid=engine.parseUti(opts.range.from);
						var nfile=nfile_sid[0];
						if (nfile>-1) {
							engine.loadSegmentId([nfile],function(){
								generateResult(Q);
							});
							return ;
						}
					}
					generateResult(Q);
				} else {
					engine.timing.search=new Date()-startsearch;
					cb.apply(engine.context,[0,Q]);
				}
			});
		} else { //empty search
			engine.timing.search=new Date()-starttime;
			cb.apply(engine.context,[0,Q]);
		};
	});
}

main.splitPhrase=splitPhrase; //just for debug
main.slowPhrase=slowPhrase;
module.exports=main;
},{"./boolsearch":"/home/ec2-user/ksana2015/node_modules/ksana-search/boolsearch.js","./excerpt":"/home/ec2-user/ksana2015/node_modules/ksana-search/excerpt.js","./plist":"/home/ec2-user/ksana2015/node_modules/ksana-search/plist.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-simple-api/highlight.js":[function(require,module,exports){
/*
	combine hits and tags, for full text mode
*/
var applyMarkups=function(text,opts){
	var hits=opts.vhits||[];
	var markups=opts.markups;
	
	var hitclass=opts.hitclass||'hl';
	var output='',O=[],j=0,m=0,k,M;

	var tokens=opts.tokenize(text).tokens;
	var vpos=opts.vpos;
	var i=0,str=[];
	var hitstart=0,hitend=0;
	var tagn={},tagstart={},tagend={},tagclass="",lastclasses="";
	var para=[],classes;
	for (m in markups) {
		tagn[m]=0;
		tagstart[m]=0;
		tagend[m]=0;
	} 
	
	var breakat=[],start=0;

	while (i<tokens.length) {
		var skip=opts.isSkip(tokens[i]);		
		var token=tokens[i];
		if (opts.isBreaker) {
			if (opts.isBreaker( token, i,tokens)){
				breakat.push(i);
			}
		}
		i++;
	}
	
	i=0,nbreak=0;
	while (i<tokens.length) {
		var skip=opts.isSkip(tokens[i]);
		var hashit=false;
		
		var token=tokens[i];

		if (opts.isBreaker && para.length) {
			if (opts.isBreaker( token, i,tokens)){
				O.push(opts.createPara(para,O.length));
				para=[];
			}
		}
		if (i<tokens.length) {
			if (skip) {
				str.push(token);
			} else {
				classes="";	
				//check hit
				if (j<hits.length && vpos==hits[j][0]) {
					var nphrase=hits[j][2] % 10, width=hits[j][1];
					hitstart=hits[j][0];
					hitend=hitstart+width;
					j++;
				}
				if (vpos>=hitstart && vpos<hitend) {
					classes=hitclass+" "+hitclass+nphrase;
				}
				for (m in markups) {
					M=markups[m].vpos;
					k=tagn[m];
					if (k<M.length && vpos===M[k][0]) {
						var width=M[k][1];
						tagstart[m]=M[k][0];
						tagend[m]=tagstart[m]+width;
						tagclass=m+M[k][2];
						k++;
					}
					tagn[m]=k;
					if (vpos>=tagstart[m]&& vpos<tagend[m]) classes+=" "+tagclass;
				}

				if (classes!==lastclasses) {
					para.push(opts.createToken(str,{className:lastclasses,vpos:vpos,key:start}));
					lastclasses=classes;
					start=i;
					str=[token];
				} else {
					str.push(token);
				}
			}
		}

		if (nbreak<breakat.length && breakat[nbreak]===i) {
			para.push(opts.createToken(str,{className:classes,vpos:vpos,key:start}));
			O.push(opts.createPara(para,O.length));
			para=[];
			str=[];
			start=i;
			nbreak++;
		}

		if (!skip) vpos++;
		i++; 
	}

	if (str.length) {
		para.push(opts.createToken(str,{className:classes,vpos:vpos,key:start}));
		O.push(opts.createPara(para,O.length));	
	}

	return O;
}

module.exports={applyMarkups:applyMarkups}
},{}],"/home/ec2-user/ksana2015/node_modules/ksana-simple-api/index.js":[function(require,module,exports){
"use strict";
var kse=require("ksana-search");
var plist=require("ksana-search/plist");
var kde=require("ksana-database");
var bsearch=kde.bsearch;
var treenodehits=require("./treenodehits");
var createTask=require("./taskqueue").createTask;
var indexer10=require("./indexer10"); //old format

var nextUti=function(opts,cb){
	kde.open(opts.db,function(err,db){
		if (err) {
			cb(err);
		} else {
			if ((db.get("meta").indexer||10)<16) {
				indexer10.nextUti(opts,cb);
				return;
			}
			db.uti2fileSeg(opts.uti,function(fseg){
				var segments=db.get(["segments",fseg.file]);
				if (fseg.seg-1<segments.length) {
					fseg.seg+=1;
					var uti=db.fileSeg2uti(fseg);
					cb(0, uti );
				} else {
					cb("last uti "+opts.uti+" cannot next");
				}
			});
		}
	});
};
//make sure db is opened
var prevUti=function(opts,cb){
	kde.open(opts.db,function(err,db){
		if (err) {
			cb(err);
		} else {
			if (indexer10.valid(db)) {
				indexer10.prevUti(opts,cb);
				return;
			}
			db.uti2fileSeg(opts.uti,function(fseg){
				var segments=db.get(["segments",fseg.file]);
				if (fseg.seg>0) {
					fseg.seg-=1;
					var uti=db.fileSeg2uti(fseg);
					cb(0,uti);	
				} else {
					cb("first uti "+opts.uti+" cannot prev");
				}
			});
		}
	});
};
//return next hit vpos and uti
var nextHit=function(opts,cb){
	kse.search(opts.db,opts.q,opts,function(err,res){
		if (err) {
			cb(err);
			return;
		}
		var i=bsearch(res.rawresult,opts.vpos,true);
		if (i===-1 || i===res.rawresult.length-1) {
			cb("cannot find next hit");
			return;
		}
		var nextvpos=res.rawresult[i+1];

		res.engine.vpos2uti(nextvpos+1,function(uti){
			cb(0,{uti:uti,vpos:nextvpos});	
		}); //nextvpos is the first character
		
	});
}
//return prev hit vpos and uti
var prevHit=function(opts,cb){
	kse.search(opts.db,opts.q,opts,function(err,res){
		if (err) {
			cb(err);
			return;
		}
		var i=bsearch(res.rawresult,opts.vpos,true);
		if (i===-1 || i===0) {
			cb("cannot find prev hit");
			return;
		}
		var prevvpos=res.rawresult[i-1];
		//var uti=res.engine.vpos2txtid(prevvpos+1);
		res.engine.vpos2uti(prevvpos+1,function(uti){
			cb(0,{uti:uti,vpos:prevvpos});
		});
		
	});
}


var clearHits=function(toc){
	var i;
	for (i=0;i<toc.length;i+=1) {
		//remove the field, make sure treenodehits will calculate new value.
		if (toc[i].hit!==undefined) {
			delete toc[i].hit;
		}
	}
};

var bsearchVposInToc = function (toc, obj, near) { 
  var mid,low = 0,
  high = toc.length;
  while (low < high) {
    mid = (low + high) >> 1;
    if (toc[mid].vpos===obj) {
    	return mid-1;
    }
    if (toc[mid].vpos < obj) {
    	low = mid + 1;
    } else {
    	high = mid;
    } 
  }
  if (near) {
  	return low-1;
  } 
  if (toc[low].vpos===obj) {
  	return low;
  }
  return -1;
};
var enumAncestors=function(toc,n) {
	var parents=[0], cur=toc[n],depth=0, now=0,next;
	while ( toc[now+1]&&toc[now+1].vpos<= cur.vpos ) {
		now+=1;
		next=toc[now].n;
		//jump to sibling which has closest vpos
		while ((next && toc[next].vpos<=cur.vpos) || (toc[now+1] && toc[now+1].d===toc[now].d)) {
			if (next) {
				now=next;
				next=toc[now].n;				
			} else {
				next=now+1; //next row is sibling
			}
		}
		if (toc[now].d>depth && toc[now].d<cur.d) {
			parents.push(now);
			depth=toc[now].d;
		} else {
			break;
		}
	}
	return parents;
};

var breadcrumb=function(db,opts,toc,tocname){
	var nodeseq,breadcrumb,out,p,vpos=opts.vpos;
	if (opts.uti && opts.vpos===undefined) {
			vpos=db.uti2vpos(opts.uti);
	}
	p=bsearchVposInToc(toc,vpos,true);
	if (p===-1) {
		out={nodeseq:[0],breadcrumb:[toc[0]]};
	}  else {
		nodeseq=enumAncestors(toc,p);
		nodeseq.push(p);
		breadcrumb=nodeseq.map(function(n){return toc[n];});
		out={ nodeseq: nodeseq, breadcrumb:breadcrumb};
	}
	if (tocname) {
		out.name=tocname;
		out.tocname=tocname; //legacy code
		out.toc=toc;
	}

	return out;
};
var toc=function(opts,cb,context) {
	if (!opts.q) {
		kde.open(opts.db,function(err,db){
			if (err) {
				cb(err);
				return;
			}
			var tocname=opts.name||opts.tocname||db.get("meta").toc;
			db.getTOC({tocname:tocname},function(toc){
				if (opts.vpos||opts.uti) {
					cb(0,breadcrumb(db,opts,toc,tocname));
				} else {
					cb(0,{name:tocname,toc:toc,tocname:tocname});	
				}
			});
		},context);
		return;
	}

	kse.search(opts.db,opts.q,opts,function(err,res){
		if (err || !res) {
			throw "cannot open database "+opts.db;
		}
		var tocname=opts.name||opts.tocname||res.engine.get("meta").toc,db=res.engine;
		res.engine.getTOC({tocname:tocname},function(toc){
			clearHits(toc);
			if (opts.vpos||opts.uti) {
					var out=breadcrumb(db,opts,toc,tocname);
					out.nodeseq.map(function(seq){
						//console.log(seq)
						treenodehits(toc,res.rawresult,seq);
					});
					cb(0,out);
			} else {
				cb(0,{name:tocname,toc:toc,vhits:res.rawresult,tocname:tocname});	
			}
		});
	});
};

var getFieldByVpos=function(db,field,vpos) {
	//make sure field already in cache
	var i,fieldvpos=db.get(["fields",field+"_vpos"]),
	fieldvalue=db.get(["fields",field]);
	if (!fieldvpos || !fieldvalue) {
		return null;
	}

	i=bsearch(fieldvpos,vpos,true);
	
	if (i>-1) {
		return fieldvalue[i-1];
	}
};

var getFieldsInRange=function(db,fieldtext,fieldvpos,fieldlen,fielddepth,from,to,text) {
	var out=[],hits=[],texts=[],depth,vlen,vp,i=bsearch(fieldvpos,from,true);
	var ft,s,l,previ;

	while (i>-1) {
		vp=fieldvpos[i];
		vlen=fieldlen[i];
		if (vp>=to) break;

		ft=fieldtext[i];
		vlen=fieldlen[i];
		depth=fielddepth[i];
		hits.push([ vp, vlen , depth]);
		texts.push(ft);
		if (fieldvpos[i+1]>=to)break;
		previ=i;
		i=bsearch(fieldvpos,fieldvpos[i+1],true);
		if (i===previ) break;
	}

	var out=kse.vpos2pos(db, from , text,  hits);

	return {texts:texts, vpos: hits, realpos: out};
}
var field2markup = function(db,markupfields,from,to,text) {
	var i,field,out={},fieldtext,fieldvpos,fieldlen,fielddepth,markups;
	if (typeof markupfields=='string') {
		markupfields=[markupfields];
	}

	for (i=0;i<markupfields.length;i++) {
		field=markupfields[i];
		fieldtext=db.get(['fields',field]);
		fieldvpos=db.get(['fields',field+'_vpos']);
		fieldlen=db.get(['fields',field+'_len']);
		fielddepth=db.get(['fields',field+'_depth']);

		if (!fieldlen) return out;
		markups=getFieldsInRange(db,fieldtext,fieldvpos,fieldlen,fielddepth,from,to,text);
		out[field]=markups;
	}
	return out;
}

var getFileSeg=function(db,opts,cb){
	var vpos=opts.vpos,uti=opts.uti,fileseg,one=false;
	if (vpos) {
		if (typeof vpos==="number") {
			vpos=[vpos];
		}

		fileseg=vpos.map(function(vp){ return db.fileSegFromVpos(vp)});
		
		db.loadSegmentId(fileseg,function(){
			cb(fileseg);	
		});
		
	} else if (uti) {
		if (typeof uti==="string") uti=[uti];
		//convert uti to filecontents,file,seg
		db.getFileSegFromUti(uti,cb);
	}
}

var fetchcontent=function(keys,db,Q,opts,cb){
	db.get(keys,function(data){
			var fields,item,out=[],i,j,k,vhits=null,hits=null,seg1,vp,vp_end;
			for (j=0;j<keys.length;j+=1) {
				hits=null;
				seg1=db.fileSegToAbsSeg(keys[j][1],keys[j][2]);
				vp=db.absSegToVpos(seg1);
				vp_end=db.absSegToVpos(seg1+1);
				if (Q) {
					vhits=kse.excerpt.hitInRange(Q,vp,vp_end,data[j]);
					hits=kse.excerpt.calculateRealPos(Q.tokenize,Q.isSkip,vp,data[j],vhits);
				}

				item={uti:opts.uti[j],text:data[j],hits:hits,vhits:vhits,vpos:vp,vpos_end:vp_end};
				if (opts.fields) {
					fields=opts.fields;
					if (typeof fields=='boolean') {
						fields=db.get('meta').toc;
					}

					if (typeof fields==="string") {
						fields=[fields];
					}

					if (fields) {
						item.values=[];
						for (k=0;k<fields.length;k+=1) {
							item.values.push(getFieldByVpos(db,fields[k],vp_end));
						}					
					}
				}

				if (opts.asMarkup) { 
					var asMarkup=opts.asMarkup;
					if (typeof asMarkup=='boolean') {
						asMarkup=db.get('meta').toc;
					}
					if (asMarkup) item.markups=field2markup(db,asMarkup,vp,vp_end,data[j]);
				}
				out.push(item);
			}
			var tocname=opts.breadcrumb;
			if (tocname && typeof tocname!="string") tocname=db.get("meta").toc;
			if (tocname!==undefined) {
				db.getTOC({tocname:tocname},function(toc){
					var oo;
					for (i=0;i<out.length;i+=1) {
						oo=breadcrumb(db,{uti:out[i].uti},toc);
						out[i].breadcrumb=oo.breadcrumb;
						out[i].nodeseq=oo.nodeseq;
					}
					cb(0,out);
				});
			} else {
				cb(0,out);
			}
		});
}

var fetch_res=function(db,Q,opts,cb){
	if (indexer10.valid(db)) {
		var keys=indexer10.fetch_res_prepare_keys(db,opts);
		fetchcontent(keys,db,Q,opts,cb);
	} else {
		getFileSeg(db,opts,function(file_segments){
			var uti=opts.uti;
			if (typeof uti==="undefined" && opts.vpos) {
				uti=db.vpos2uti(opts.vpos);
			} 
			if (typeof uti==="string") uti=[uti];
			opts.uti=uti;
			var keys=file_segments.map(function(fseg){return ["filecontents",fseg.file,fseg.seg]});
			fetchcontent(keys,db,Q,opts,cb);				
		});
	}
};
var fetchfields=function(opts,db,cb1){
	var i,fields=opts.fields,fieldskey=[];
	if (typeof fields==="boolean") {
		fields=db.get('meta').toc;
	}

	if (typeof fields==="string") {
		fields=[fields];
	}
	if (!fields) {
		cb1();
		return;
	}

	for (i=0;i<fields.length;i+=1) {
		fieldskey.push(["fields",fields[i]]);
		fieldskey.push(["fields",fields[i]+"_vpos"]);
		fieldskey.push(["fields",fields[i]+"_len"]);
		fieldskey.push(["fields",fields[i]+"_depth"]);
	}
	//console.log("fetching",fieldskey)
	db.get(fieldskey,cb1);
};

var fetch=function(opts,cb) {
	if (!opts.uti && !opts.vpos) {
		cb("missing uti or vpos");
		return;
	}

	if (!opts.q) {
			kde.open(opts.db,function(err,db){
				if (err) {
					cb(err);
				} else {
					if (opts.fields) {
						fetchfields(opts,db,function(a,b){
							fetch_res(db,null,opts,cb);		
						});
					} else {
						fetch_res(db,null,opts,cb);	
					}
				}
			});
	} else {
		kse.search(opts.db,opts.q,opts,function(err,res){
			if (err) {
				cb(err);
			} else {
					var fres=fetch_res;

					if (opts.fields) {
						fetchfields(opts,res.engine,function(){
							fetch_res(res.engine,res,opts,cb);
						});
					} else {
						fetch_res(res.engine,res,opts,cb);
					}
			}
		});		
	}
};

var excerpt2defaultoutput=function(excerpt,cb) {
	var out=[],i,ex,vpos,txtid;
	var sidsep=this.sidsep;
	//loadSegmentId

	var nfiles=excerpt.map(function(ex){return ex.file});

	this.loadSegmentId(nfiles,function(){
		for (i=0;i<excerpt.length;i+=1) {
			ex=excerpt[i];
			var uti=this.fileSeg2uti(ex);
			out.push({uti:uti,text:ex.text,hits:ex.realHits,vhits:ex.hits,vpos:ex.start});
		}

		cb(out);
	}.bind(this))
};
//use startfrom to specifiy starting posting
var excerpt=function(opts,cb) {
	var i,range={},newopts={};
	if (!opts.q) {
		cb("missing q");
		return;
	}

	if (opts.from) {
		range.from=opts.from;
	}
	if (opts.count) {
		range.maxseg=opts.count;
	}
	for (i in opts) {
		if (opts.hasOwnProperty(i)){
			newopts[i]=opts[i];	
		}
	}
	newopts.nohighlight=true;
	newopts.range=range;

	kse.search(opts.db,opts.q,newopts,
		function(err,res){
		if (err) {
			cb(err);
		} else {
			//console.log(res.rawresult)
			excerpt2defaultoutput.call(res.engine,res.excerpt,function(out){
				cb(0,out);	
			})
		}
	});	
};

var beginWith=function(s,txtids) {
	var out=[],i,tofind,idx;
	for (i=1;i<s.length;i+=1) {
		tofind=s.substr(0,i);
		idx=bsearch(txtids,tofind);
		if (idx>-1) {
			out.push(txtids[idx]);
		}
	}
	return out;
};

var filterField=function(items,regex,filterfunc) {
	if (!regex) {
		return [];
	}
	var i, item,reg=new RegExp(regex), out=[];
	filterfunc=filterfunc|| reg.test.bind(reg);
	for (i=0;i<items.length;i+=1) {
		item=items[i];
		if (filterfunc(item,regex)) {
			out.push({text:item,idx:i});
		}
	}
	return out;
};

var groupByField=function(db,rawresult,field,regex,filterfunc,postfunc,cb) {
	db.get(["fields",field],function(fields){
		if (!fields) {
			cb("field "+field+" not found");
			return;
		}

		db.get([["fields",field+"_vpos"],["fields",field+"_depth"]],function(res){
			var fieldhit,reg,i,item,matches,items=[], fieldsvpos=res[0],fieldsdepth=res[1],
			prevdepth=65535,inrange=false, fieldhits ,filesegs,vposs=[],uti;
			if (!rawresult||!rawresult.length) {
				matches=filterField(fields,regex,filterfunc);
				for (i=0;i<matches.length;i+=1) {
					item=matches[i];
					items.push({text:item.text , vpos:fieldsvpos[item.idx]});
				}
				cb(0,items,db);
			} else {
				var t=new Date();
				fieldhits = plist.groupbyposting2(rawresult, fieldsvpos);
				reg =new RegExp(regex);

				fieldhits.shift();

		    filterfunc=filterfunc|| reg.test.bind(reg);
		    for (i=0;i<fieldhits.length;i+=1) {
		      fieldhit=fieldhits[i];
		      item=fields[i];

		      //all depth less than prevdepth will considered in range.
		      if (filterfunc(item,regex)) {
		      	inrange=true;
		      	if (prevdepth>fieldsdepth[i]) {
		      		prevdepth=fieldsdepth[i];
		      	}
		      } else if (inrange) {
		      	if (fieldsdepth[i]===prevdepth) {//turn off inrange
		      		inrange=false;
		      		prevdepth=65535;
		      	}
		      }
		      //uti is not available yet db.vpos2uti(fieldhit[0])
		      if (inrange && fieldhits && fieldhit.length) {
		      	item={text: item, vpos: fieldhit[0] , vhits:fieldhit};
		      	if (postfunc) {
		      		postfunc(item);
		      	}
		      	items.push(item);
		      }
		    }		
				cb(0,items,db);
			}
		});
	});
};
/*
*/

var trimResult=function(rawresult,rs) {
	//assume ranges not overlap, todo :combine continuous range
	var start,end,s,e,r,i,res=[],
	  ranges=JSON.parse(JSON.stringify(rs));
	ranges.sort(function(a,b){return a[0]-b[0];});
	for (i=0;i<ranges.length;i+=1) {
		start=ranges[i][0];
		end=ranges[i][1];
		s=bsearch(rawresult,start,true);
		e=bsearch(rawresult,end,true);
		r=rawresult.slice(s,e);
		res=res.concat(r);
	}
	return res;
};
var groupInner=function(db,opts,res,cb){
	var filterfunc=opts.filterfunc||null,
	rawresult=res.rawresult;

  var field=opts.field;

  if (typeof field==="boolean" && opts.field) {
  	field=db.get("meta").toc;	
  }

	if (field) {
		if (opts.ranges) {
			rawresult=trimResult(rawresult,opts.ranges);
		}
		groupByField(db,rawresult,field,opts.regex,filterfunc,null,cb);
	} else {
		//TODO , groupBySegments 
		if (indexer10.valid(db)) {
			indexer10.groupByUti(db,rawresult,opts.regex,filterfunc,cb);
		} else {
			throw "field is not specified";
		}
	}
};
var filter=function(opts,cb) {
	if (!opts.q){
		if (!opts.regex) {
			cb(0,[]);
			return;
		}
		kde.open(opts.db,function(err,db){
			if (err) {
				cb(err);
				return;
			}
			groupInner(db,opts,{rawresult:null},cb);
		});
	} else {
		kse.search(opts.db,opts.q,opts,function(err,res){
			if (err) {
				cb(err);
				return;
			}
			groupInner(res.engine,opts,res,cb);
		});
	}
};


var task=function(dbname,searchable,taskqueue,tofind){
		taskqueue.push(function(err,data){
			if (!err && !(typeof data==='object' && data.empty)) {
				searchable.map(function(db){
					if (db.shortname===data.dbname) {
						db.hits=data.rawresult.length;
					}
				});
			}
			kse.search(dbname,tofind,taskqueue.shift(0,data));
		});
};

var fillHits=function(searchable,tofind,cb) {
	var i,taskqueue=[];
	for (i=0;i<searchable.length;i+=1) {
		task(searchable[i].fullname,searchable,taskqueue,tofind);
	}

	taskqueue.push(function(){
		searchable.sort(function(a,b){
			return b.hits-a.hits;
		});
		cb(searchable);			
	});
	taskqueue.shift()(0,{empty:true});
};

var tryOpen=function(kdbid,opts,cb){
	if (typeof opts=="function") {
		cb=opts;
		opts={};
	}

	if (typeof window!=='undefined') {
		var nw=window.process!==undefined && window.process.__node_webkit;
		var protocol='';
		if (window.location) protocol=window.location.protocol;
		var socketio= window.io!==undefined;
 
		if ( (protocol==="http:" || protocol==="https:") && !socketio) {
			cb("http+local file mode");
			return;
		}

		if (protocol==="file:" && !nw) {
			cb("local file mode");
		}
	}

	kde.open(kdbid,opts,function(err,db){
		cb(err,db);
	});
};
var applyMarkups=function(text,opts,func) {
	var r=require("./highlight").applyMarkups.apply(this,arguments);
	return r;
}

var getMarkupPainter=function(db) {
	return {tokenize:db.analyzer.tokenize, isSkip:db.analyzer.isSkip, applyMarkups:applyMarkups};
}
var renderHits=function(text,hits,func){
	if (!text) return [];
  var i, ex=0,out=[],now;
  hits=hits||[];
  for (i=0;i<hits.length;i+=1) {
    now=hits[i][0];
    if (now>ex) {
      out.push(func({key:i},text.substring(ex,now)));
    }
    out.push(func({key:"h"+i, className:"hl"+hits[i][2]},text.substr(now,hits[i][1])));
    ex = now+hits[i][1];
  }
  out.push(func({key:i+1},text.substr(ex)));
  return out;
};

var get=function(dbname,key,cb) { //low level get
	kde.open(dbname,function(err,db){
		if (err) {
			cb(err);
		} else {
			db.get(key,cb);
		}
	});
};

var vpos2uti=function(opts,cb){
	kde.open(opts.db,function(err,db){
		if (err) {
			cb(err);
		} else {
			if (cb) {
				db.vpos2uti(opts.vpos,function(uti){
					cb(0,uti);
				});	
			} else {
				return db.vpos2uti(opts.vpos);
			}
		}
	});
};

var uti2vpos=function(opts,cb){
	kde.open(opts.db,function(err,db){
		if (err) {
			cb(err);
		} else {
			if (cb) {
				db.uti2vpos(opts.uti,function(vpos){
					cb(0,vpos);
				});
			} else {
				return db.uti2vpos(opts.uti);
			}
		}
	});
};



var sibling=function(opts,cb) {
	/*
	  specify opts.nfile 
	  or use uti format "nfile@sid"
	*/
	var uti=opts.uti,keys,segs,idx,nfile;

	kde.open(opts.db,function(err,db){
		if (err) {
			cb(err);
			return;
		}

		if (indexer10.valid(db)){
			indexer10.sibling(opts,cb);
			return;
		}

		if (typeof uti==="string") {
			var file_sid=uti.split(db.sidsep);
			nfile=parseInt(file_sid[0]);
		}		
		if ( opts.vpos !==undefined && opts.uti===undefined) {
			//uti=db.vpos2txtid(opts.vpos);
			nfile=db.fileSegFromVpos(opts.vpos).file;
		}

		if (isNaN(nfile)) {
			if (typeof opts.nfile === undefined) {
				cb("must specify file");
				return;
			} else {
				nfile=opts.nfile;
			}		
		}

		db.get(["segments",nfile],function(segs){
			if (!segs) {
				cb("invalid nfile: "+nfile);
				return;			
			}
			var offsets=db.getFileSegOffsets(nfile);
			if (uti) {
				idx=segs.indexOf(uti);
			} else {
				idx=bsearch(offsets,opts.vpos,true);
				if(idx>0) idx--;
			}
			
			cb(0,{sibling:segs,idx:idx,offsets:offsets});
		});

	});
};



var getFieldRange=function(opts,cb){
	var findField=function(array,item) {
		var i;
		for(i=0;i<array.length;i+=1){
			if (array[i]===item) {
				return i;
			}
		}
		return -1;
	};	

	var i,v,p,start,end,vsize,fieldcaption,fieldvpos,out,error=null,values=opts.values;
	if (!opts.field) {
		error="missing field";
	}
	if (!opts.values) {
		error="missing value";
	}
	if (!opts.db) {
		error="missing db";
	}

	if (typeof opts.values==="string"){
		values=[opts.values];
	}
	if (error) {
		cb(error);
		return;
	}
	get(opts.db,[["meta","vsize"],["fields",opts.field],["fields",opts.field+"_vpos"]],function(data){
		if (!data) {
			cb("error loading field "+opts.field);
			return;
		}
		vsize=data[0];
		fieldcaption=data[1];
		fieldvpos=data[2];
		out=[];
		for (i=0;i<values.length;i+=1) {
			v=values[i];
			p=findField(fieldcaption,v);
			start=vsize;
			end=vsize;
			if (p>-1) {
				start=fieldvpos[p];
			}
			if (p<fieldvpos.length-1) {
				end=fieldvpos[p+1];
			}
			out.push([start,end]);
		}
		cb(0,out);
	});
};

var iterateInner=function(db,action,opts,cb,context){
	var out=[], next=opts.uti,  count=opts.count||10;

	var nfile_sid=db.parseUti(opts.uti);
	var nfile=nfile_sid[0],sid=nfile_sid[1];
	var filename=nfile_sid[2];

	db.loadSegmentId([nfile_sid[0]],function(){
		var segments=this.get(["segments",nfile]),i;

		var now=segments.indexOf(sid);
		if (now==-1) {
			cb("segment not found in the file"+opts.uti);
			return;
		}

		for (i=1;i<count+1;i+=1) {
			if (action=="next") {
				if (now+i<segments.length) out.push(filename+db.sidsep+segments[now+i]);
				else break;
			} else {
				if (now-i>=0) out.unshift(filename+db.sidsep+segments[now-i]);
				else break;
			}
		}		

		opts.uti=out;
		fetch(opts,cb,context);
	});
};

var iterate=function(action,opts,cb,context) {
	if (typeof opts.uti!=="string") {
		cb("uti must be a string");
		return;
	}
	if (!opts.q) {
		kde.open(opts.db,function(err,db){
			if (!err) {
				if (indexer10.valid(db)) {
					indexer10.iterateInner(db,action,opts,cb,context);
					fetch(opts,cb,context);
				} else {
					iterateInner(db,action,opts,cb,context);					
				}
			}
			else {
				cb(err);
			}
		},context);
		return;
	}
	kse.search(opts.db,opts.q,opts,function(err,res){
		if (!err) {
			if (indexer10.valid(db)) {
				indexer10.iterateInner(db,action,opts,cb,context);
				fetch(opts,cb,context);
			}else {				
				iterateInner(res.engine,action,opts,cb,context);
			}
		} else {
			cb(err);
		}
	},context);
};

var search=function(opts,cb,context){
	kse.search(opts.db,opts.q,opts,function(err,res){
		cb(err,res);
	},context);
};

var next=function(opts,cb,context) {
	iterate("next",opts,cb,context);
};

var prev=function(opts,cb,context) {
	iterate("prev",opts,cb,context);
};
var open=function(opts,cb){
	var db=opts.db;
	if (typeof opts=="string") db=opts; //accept open("dbname")
	kde.open(db,opts,cb);
}
var enumKdb=function(opts,cb,context) {
	if (typeof opts==="function") {
		cb=opts;
		opts={};
	}

	var taskqueue=[],out=[];
	var enumTask=function(dbname){
		taskqueue.push(function(err,data){
			if (!err && !(typeof data==='object' && data.empty)) {
				out.push([data.dbname,data.meta]);
			}
			kde.open(dbname,{metaonly:true},taskqueue.shift(0,data));
		});
	};

	kde.enumKdb(opts,function(kdbs){
		kdbs.forEach(enumTask);
		taskqueue.push(function(err,data){
			if (!err && !(typeof data==='object' && data.empty)) {
				out.push([data.dbname,data.meta]);
			}	
			cb(out);
		});
		taskqueue.shift()(0,{empty:true});
	});
}
var API={
	next:createTask(next),
	prev:createTask(prev),
	nextUti:createTask(nextUti),
	prevUti:createTask(prevUti),
	nextHit:createTask(nextHit),
	prevHit:createTask(prevHit),
	vpos2uti:createTask(vpos2uti),
	uti2vpos:createTask(uti2vpos),	
	toc:createTask(toc),
	fetch:createTask(fetch),
	sibling:createTask(sibling),
	excerpt:createTask(excerpt),
	filter:createTask(filter),
	enumKdb:createTask(enumKdb),
	getFieldRange:createTask(getFieldRange),
	search:createTask(search),	
	open:createTask(open),

	fillHits:fillHits,
	renderHits:renderHits,
	applyMarkups:applyMarkups,
	tryOpen:tryOpen,
	get:get,
	treenodehits:treenodehits,
	getMarkupPainter:getMarkupPainter
};
module.exports=API;
},{"./highlight":"/home/ec2-user/ksana2015/node_modules/ksana-simple-api/highlight.js","./indexer10":"/home/ec2-user/ksana2015/node_modules/ksana-simple-api/indexer10.js","./taskqueue":"/home/ec2-user/ksana2015/node_modules/ksana-simple-api/taskqueue.js","./treenodehits":"/home/ec2-user/ksana2015/node_modules/ksana-simple-api/treenodehits.js","ksana-database":"/home/ec2-user/ksana2015/node_modules/ksana-database/index.js","ksana-search":"/home/ec2-user/ksana2015/node_modules/ksana-search/index.js","ksana-search/plist":"/home/ec2-user/ksana2015/node_modules/ksana-search/plist.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-simple-api/indexer10.js":[function(require,module,exports){
/* legacy code for indexer==10, all segnames are loaded when kdb is opened*/
var kde=require("ksana-database");
var kse=require("ksana-search");
var plist=require("ksana-search/plist");

var txtids2key=function(txtids) {
	if (typeof txtids!=="object") {
		txtids=[txtids];
	}
	var i,fseg,out=[];
	for (i=0;i<txtids.length;i+=1) {
		fseg=this.uti2fileSeg(txtids[i]);
		if (!fseg) {
			out.push(["filecontents",0,0]);
		} else {
			out.push(["filecontents",fseg.file,fseg.seg]);
		}
	}
	return out;
};
var _sibling=function(db,uti,cb){
		var keys=txtids2key.call(db,uti);
		
		if (!keys) {
			cb("invalid uti: "+uti);
			return;
		}
		var segs=db.getFileSegNames(keys[0][1]);
		if (!segs) {
			cb("invalid file id: "+keys[0][1]);
			return;			
		}
		var idx=segs.indexOf(uti);
		cb(0,{sibling:segs,idx:idx});
}
var sibling=function(opts,cb) {
	var uti=opts.uti;

	kde.open(opts.db,function(err,db){
		if (err) {
			cb(err);
			return;
		}
		if ( opts.vpos !==undefined && opts.uti===undefined) {
			db.vpos2uti(opts.vpos,function(uti){
				_sibling(db,uti,cb);
			});
		} else {
			_sibling(db,opts.uti,cb);
		}
	});
};
var nextUti=function(opts,cb){
	kde.open(opts.db,function(err,db){
		if (err) {
			cb(err);
		} else {
			cb(0,db.nextTxtid(opts.uti));
		}
	});
};
//make sure db is opened
var prevUti=function(opts,cb){
	kde.open(opts.db,function(err,db){
		if (err) {
			cb(err);
		} else {
			cb(0,db.prevTxtid(opts.uti));
		}
	});
};

var iterateInner=function(db,funcname,opts,cb,context){
	var out=[], next=opts.uti,  count=opts.count||10,  func=db[funcname+"Txtid"], i;

	for (i=0;i<count;i+=1) {
		next=func.call(db,next);
		if (!next) {
			break;
		}

		if (funcname==="nextTxtid") {
			out.push(next);
		} else {
			out.unshift(next);
		}
	}

	opts.uti=out;
	
};

var fetch_res_prepare_keys=function(db,opts){
	var i,u,keys,vpos,uti=opts.uti;
	if (!uti) {
		uti=[];
		vpos=opts.vpos;
		if (typeof vpos!=="object") {
			vpos=[vpos];
		}
		for (i=0;i<vpos.length;i+=1) {
			u=db.vpos2uti(vpos[i]);
			uti.push(u);
		}
	}
	if (typeof uti!=="object") {
		uti=[uti];
	}
	keys=txtids2key.call(db,uti);
	if (!keys || !keys.length || keys[0][1]===undefined) {
		cb("uti not found: "+uti+" in "+opts.db);
		return;
	}
	opts.uti=uti;
	return keys;
}

var groupByUti=function(db,rawresult,regex,filterfunc,cb) {
	var i,matches,seghits,items=[],out=[],item,vpos,seghit,reg,
	  segnames=db.get("segnames"),segoffsets=db.get("segoffsets");

	if (!rawresult||!rawresult.length) {
		//no q , filter all field
		matches=filterField(segnames,regex,filterfunc);

		items=matches.map(function(item){
			return {text:item.text, uti:item.text, vpos:segoffsets[item.idx]};
		});
		cb(0,items);

	} else {
    seghits= plist.groupbyposting2(rawresult, segoffsets);
    reg=new RegExp(regex);

		filterfunc=filterfunc|| reg.test.bind(reg);
    for (i=0;i<seghits.length;i+=1) {
      seghit=seghits[i];
      if (seghit &&seghit.length) {
	      item=segnames[i-1];
	      vpos=segoffsets[i-1];
			  if (filterfunc(item,regex)) {
			  	out.push({text:item,uti:item,hits:seghit,vpos:vpos});
	      }      	
      }
    }
    cb(0,out,db);
	}
};
var valid=function(db){
	return (db.get("meta").indexer||10)<16;
}
module.exports={sibling:sibling,nextUti:nextUti,prevUti:prevUti,iterateInner:iterateInner
,groupByUti:groupByUti,fetch_res_prepare_keys:fetch_res_prepare_keys,valid:valid};
},{"ksana-database":"/home/ec2-user/ksana2015/node_modules/ksana-database/index.js","ksana-search":"/home/ec2-user/ksana2015/node_modules/ksana-search/index.js","ksana-search/plist":"/home/ec2-user/ksana2015/node_modules/ksana-search/plist.js"}],"/home/ec2-user/ksana2015/node_modules/ksana-simple-api/taskqueue.js":[function(require,module,exports){
var taskqueue=[];
var running=false;

var runtask=function(){
	if (taskqueue.length===0) {
		running=false;
		return;
	}
	running=true;

	var task=taskqueue.pop();
	var func=task[0], opts=task[1], cb=task[2];

	func(opts,function(err,res,res2){
		cb(err,res,res2);
		setTimeout(runtask,0);
	});
}

var createTask=function(func) {
	return function(opts,cb){
		if (typeof opts==="function") {
			cb=opts;
			opts={};
		}
		taskqueue.unshift([func,opts,cb]);
		if (!running) setTimeout(runtask,0);
	}
}
module.exports={createTask:createTask};
},{}],"/home/ec2-user/ksana2015/node_modules/ksana-simple-api/treenodehits.js":[function(require,module,exports){
"use strict";
var rangeOfTreeNode=function(toc,n) {
  //setting the ending vpos of a treenode
  //this value is fixed when hits is changed, but not saved in kdb
  if (toc[n].end!==undefined) {
    return;
  }

  if (n+1>=toc.length) {
    return;
  }
  var depth=toc[n].d , nextdepth=toc[n+1].d ,next;
  if (n===toc.length-1 || n===0) {
      toc[n].end=Math.pow(2, 48);
      return;
  } 

  if (nextdepth>depth){
    if (toc[n].n) {
    	if (toc[toc[n].n]) {
        toc[n].end=toc[toc[n].n].vpos;
      } else {
        toc[n].end= Number.MAX_VALUE;  
      }
    } else { //last sibling
      next=n+1;
      while (next<toc.length && toc[next].d>depth) {
        next+=1;
      }
      if (next===toc.length) {
        toc[n].end=Math.pow(2,48);
      } else {
        toc[n].end=toc[next].voff;
      }
    }
  } else { //same level or end of sibling
    toc[n].end=toc[n+1].vpos;
  }
};

var calculateHit=function(toc,hits,n) {
  var i, start=toc[n].vpos, end=toc[n].end,hitcount=0,firstvpos=toc[n].vpos;
  if (n===0) {
    return hits.length;
  }
  for (i=0;i<hits.length;i+=1) {
    if (hits[i]>=start && hits[i]<end) {
      if (hitcount===0){
        firstvpos=hits[i];
      }
      hitcount+=1;
    }
  }
  return {hitcount:hitcount,firstvpos:firstvpos};
};

var treenodehits=function(toc,hits,n) {
  if (!hits || !hits.length) {
    return 0;
  }

  if (toc.length<2) {
    return 0 ;
  }

  //need to clear toc[n].hit when hits is changed.
  //see index.js clearHits()
   if (!toc[n]) {
    return 0;
  }

  if (toc[n].hit!==undefined) {
    return toc[n].hit;
  }

  rangeOfTreeNode(toc,n);
  var res=calculateHit(toc,hits,n);
  toc[n].hit=res.hitcount;
  toc[n].firstvpos=res.firstvpos;
  return res.hitcount;
};

module.exports=treenodehits;
},{}],"/home/ec2-user/ksana2015/node_modules/ksana2015-breadcrumbtoc/breadcrumbtoc.js":[function(require,module,exports){
var React,Dropdown,View;
var pc=function(){
	React=require("react");	
	Dropdown=require("./dropdown_bs");
	View="span"; 
}

try {
	React=require("react-native");
	Dropdown=require("./dropdown");//dropdown.android.js or dropdown.ios.js
	View=React.View;
	if (!View) pc();
} catch(e) {
	pc();
}


var E=React.createElement;
var PT=React.PropTypes;
var buildToc = function(toc) {
	if (!toc || !toc.length || toc.built) return;
	var depths=[];
 	var prev=0,j=0;
 	for (var i=0;i<toc.length;i++) delete toc[i].n;
	for (var i=0;i<toc.length;i++) {
	    var depth=toc[i].d||toc[i].depth;
	    if (prev>depth) { //link to prev sibling
	      if (depths[depth]) toc[depths[depth]].n = i;
	      for (j=depth;j<prev;j++) depths[j]=0;
	    }
    	depths[depth]=i;
    	prev=depth;
	}
	toc.built=true;
	return toc;
}
var getChildren = function(toc,n) {
 
	if (!toc[n]||!toc[n+1] ||toc[n+1].d!==toc[n].d+1) return [];
	var out=[],next=n+1;

	while (next) {
		out.push(next);
		if (!toc[next+1])break;
		if (toc[next].d==toc[next+1].d) {
			next++;
		} else if (toc[next].n){
			next=toc[next].n;			
		} else {
			next=0;
		}
	}
	return out;
}
var BreadcrumbTOC=React.createClass({
	propTypes:{
		toc:PT.array.isRequired
		,hits:PT.array
		,onSelect:PT.func
		,vpos:PT.number  //jump with vpos
		,keyword:PT.string
		,treenodeHits:PT.func
		,buttonClass:PT.string
		,separator:PT.node
		,append:PT.node
		,prepend:PT.node
		,conv:PT.func
	}
	,componentWillReceiveProps:function(nextProps,nextState) {
		if (nextProps.toc && !nextProps.toc.built) {
			buildToc(nextProps.toc);
		}
		if (nextProps.hits!==this.props.hits) {
			this.clearHits();
		}
	}
	,componentWillMount:function(){
		buildToc(this.props.toc);
	}
	,getInitialState:function(){
		return {};
	}
	,clearHits:function() {
		for (var i=0;i<this.props.toc;i++) {
			if (this.props.toc[i].hit) delete this.props.toc[i].hit;
		}
	}
	,onSelect:function(idx,children,level) {
		this.props.onSelect && this.props.onSelect(idx, children[idx].vpos+1);//don't know why???
	}
	,closestItem:function(tocitems,vpos) {
		for (i=1;i<tocitems.length;i++) {
			if (this.props.toc[tocitems[i]].vpos>=vpos) return i-1;
		}

		return tocitems.length-1;
	}
	,renderCrumbs:function() {
		
		var cur=0,toc=this.props.toc,out=[],level=0,dropdowns=[];
		var children=getChildren(toc,cur),nextchildren;
		do {
				var selected = this.closestItem(children,this.props.vpos) ;
				cur=children[selected];
			
				var items=children.map(function(child){
				var hit=toc[child].hit;
				if (this.props.hits && isNaN(hit) && this.props.treenodeHits) {
					hit=this.props.treenodeHits( toc,this.props.hits,child);
				}
				var t=toc[child].t;
				if(this.props.conv) t=this.props.conv(t)||t;
				return {t:t,idx:child,hit:hit,vpos:toc[child].vpos};

			}.bind(this));

			nextchildren=getChildren(toc,cur);
			dropdowns.push({level:level,items:items,selected:selected,nextchildren:nextchildren});

			//if (out.length>5) break;
			level++;
			if (!nextchildren.length) break;
			children=nextchildren;
		} while (true);

		out=dropdowns.map(function(d,idx){
			return	E(View,{key:idx,style:{marginTop:4,marginBottom:4}},
					E(Dropdown,{n:idx,total:dropdowns.length,onSelect:this.onSelect,level:d.level,
					separator:this.props.separator,
					buttonClass:this.props.buttonClass,
					selected:d.selected,items:d.items,keyword:this.props.keyword})
				)
		}.bind(this));
		this.props.append&& out.push(this.props.append);
		this.props.prepend&& out.unshift(this.props.prepend);
		return out;
	}
	,render:function(){
		if (View==="span") {
			return E(View,null,this.renderCrumbs());
		} else {

			return E(View,{style:{flex:1,flexDirection:'row',flexWrap:'wrap'}},this.renderCrumbs());
		}
	}
})
module.exports=BreadcrumbTOC;
},{"./dropdown":"/home/ec2-user/ksana2015/node_modules/ksana2015-breadcrumbtoc/dropdown.js","./dropdown_bs":"/home/ec2-user/ksana2015/node_modules/ksana2015-breadcrumbtoc/dropdown_bs.js","react":"/home/ec2-user/ksana2015/node_modules/react/react.js","react-native":"react-native"}],"/home/ec2-user/ksana2015/node_modules/ksana2015-breadcrumbtoc/dropdown.js":[function(require,module,exports){
/* empty stub for browserify*/
},{}],"/home/ec2-user/ksana2015/node_modules/ksana2015-breadcrumbtoc/dropdown_bs.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;

var BreadCrumbDropdown=React.createClass({
	propTypes:{
		items:PT.array.isRequired
		,selected:PT.number
		,onSelect:PT.func
		,level:PT.number.isRequired //which level
		,keyword:PT.string
	}
	,getDefaultProp:function(){
		return {items:[]}
	}
	,onSelect:function(e) {
		domnode=e.target.parentElement;
		var idx=-1;
		while (domnode) {
			if (domnode.classList.contains("open")) domnode.classList.remove("open");
			if (domnode.dataset && domnode.dataset.idx) idx=parseInt(domnode.dataset.idx);
			domnode=domnode.parentElement;
		}
		this.props.onSelect&&this.props.onSelect(idx,this.props.items,this.props.level);
	}
	,renderKeyword:function(t) {
		if (this.props.keyword) {
			var o=[],lastidx=0;
			t.replace(new RegExp(this.props.keyword,"g"),function(m,idx){
				o.push(t.substr(lastidx,idx));
				o.push(E("span",{key:idx,style:{color:"red"}},m));
				lastidx=idx+m.length;
			});
			o.push(t.substr(lastidx));
			t=o;
		}
		return t;
	}
	,renderItem:function(item,idx) {
		var hit=null;
		var style={cursor:"pointer"};
		if (this.props.selected==idx) style.background="highlight"
		item.hit&&(hit=E("span",{style:{color:"red"},className:"pull-right"},item.hit));
		var t=this.renderKeyword(item.t);
		return E("li",{key:idx,"data-idx":idx},E("a",{style:style,onClick:this.onSelect},t,hit));
	}

	,open:function(e){
		e.target.parentElement.classList.add("open");
	}
	,render:function(){
		var item=this.props.items[this.props.selected];
		if (!item)return E("span");
		var title=this.renderKeyword(item.t);

		item.hit&&(title=[E("span",{key:1},item.t),E("span",{key:2,className:"hl0 pull-right"},item.hit||"")]);
		return E("span",{className:"dropdown"},
				E("button",{key:"drop","data-toggle":"dropdown",className:this.props.buttonClass||"btn btn-default",
					onClick:this.open}, this.renderKeyword(this.props.items[this.props.selected].t) ),
				this.props.separator,
				E("ul",{className:"dropdown-menu open",id:"for_shutting_warning_up",title:title},
			this.props.items.map(this.renderItem)));
	}
});
module.exports=BreadCrumbDropdown;
},{"react":"/home/ec2-user/ksana2015/node_modules/react/react.js"}],"/home/ec2-user/ksana2015/node_modules/ksana2015-breadcrumbtoc/index.js":[function(require,module,exports){
module.exports={Component:require("./breadcrumbtoc")};
},{"./breadcrumbtoc":"/home/ec2-user/ksana2015/node_modules/ksana2015-breadcrumbtoc/breadcrumbtoc.js"}],"/home/ec2-user/ksana2015/node_modules/ksana2015-treetoc/addnode.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var styles={
	textarea:{fontSize:"100%"}
}
var linecount=function(t) {
	var lcount=0;
	t.replace(/\n/g,function(){
		lcount++;
	})
	return lcount+2;
}
var AddNode=React.createClass({
	propTypes:{
		action: React.PropTypes.func.isRequired
	}
	,addingkeydown:function(e) {
		var t=e.target.value;
		if (e.key=="Enter" && t.charCodeAt(t.length-1)===10) {
			this.props.action("addnode",t.split("\n"),this.props.insertBefore);
		}
		var lc=linecount(t);
		e.target.rows=lc;
	}
	,componentDidMount:function() {
		this.refs.adding.focus();
	}
	,render:function(){
		return E("div", {}, 
			E("textarea",
				{style:styles.textarea,onKeyDown:this.addingkeydown,ref:"adding"
				 ,placeholder:"leading space to create child node",defaultValue:""}
		));
	}

})

module.exports=AddNode;
},{"react":"/home/ec2-user/ksana2015/node_modules/react/react.js"}],"/home/ec2-user/ksana2015/node_modules/ksana2015-treetoc/controls.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;

var Controls=React.createClass({
	propTypes:{
		enabled:React.PropTypes.array.isRequired
		,action:React.PropTypes.func.isRequired
	}
	,getDefaultProps:function(){
		return {enabled:[]};
	}
	,enb:function(name) {
		return this.props.enabled.indexOf(name)===-1;		
	}
	,act:function(name) {
		var that=this;
		return function(e){
			that.props.action(name,e.ctrlKey);
		}
	}
	,render:function() {
		return E("span",{},
			E("button" ,{onClick:this.act("addingnode"),title:"Create a new node below, press Ctrl to above here."},"＋"),
			E("button" ,{style:{visibility:"hidden"}}," "),
			E("button" ,{onClick:this.act("levelup"),title:"level -1",disabled:this.enb("levelup")},"⇠"),
			E("button" ,{onClick:this.act("leveldown"),title:"level +1",disabled:this.enb("leveldown")},"⇢")
		);
	}
})

module.exports=Controls;
},{"react":"/home/ec2-user/ksana2015/node_modules/react/react.js"}],"/home/ec2-user/ksana2015/node_modules/ksana2015-treetoc/index.js":[function(require,module,exports){
/*
   toc data format
   array of { d:depth, o:opened, t:text, n:next_same_level ]

   only first level can be 0

   TODO, do not write directly to props.toc
*/
var React=require("react");
var TreeNode=require("./treenode");
var E=React.createElement;
var manipulate=require("./manipulate");

var buildToc = function(toc) {
	if (!toc || !toc.length || toc.built) return;
	var depths=[];
 	var prev=0;
 	if (toc.length>1) {
 		toc[0].o=true;//opened
 	}
 	for (var i=0;i<toc.length;i++) delete toc[i].n;
	for (var i=0;i<toc.length;i++) {
	    var depth=toc[i].d||toc[i].depth;
	    if (prev>depth) { //link to prev sibling
	      if (depths[depth]) toc[depths[depth]].n = i;
	      for (var j=depth;j<prev;j++) depths[j]=0;
	    }
    	depths[depth]=i;
    	prev=depth;
	}
	toc.built=true;
	return toc;
}
var genToc=function(toc,title) {
    var out=[{depth:0,text:title||ksana.js.title}];
    if (toc.texts) for (var i=0;i<toc.texts.length;i++) {
      out.push({t:toc.texts[i],d:toc.depths[i], vpos:toc.vpos[i]});
    }
    return out;
}

var TreeToc=React.createClass({
	propTypes:{
		toc:React.PropTypes.array.isRequired  //core toc dataset
		,opts:React.PropTypes.object    
		,onSelect:React.PropTypes.func  //user select a treenode
		,tocid:React.PropTypes.string  //toc view 
		,styles:React.PropTypes.object //custom styles
		,conv:React.PropTypes.func //custom converter for each item
	}
	,getInitialState:function(){
		return {editcaption:-1,selected:[]};
	}
	,clearHits:function() {
		for (var i=0;i<this.props.toc.length;i++) {
			if (this.props.toc[i].hit) delete this.props.toc[i].hit;
		}
	}
	,componentDidMount:function() {
		buildToc(this.props.toc);
	}
	,componentWillReceiveProps:function(nextProps) {
		if (nextProps.toc && !nextProps.toc.built) {
			buildToc(nextProps.toc);
		}
		if (nextProps.hits!==this.props.hits) {
			this.clearHits();
		}
		this.action("updateall");
	}
	,getDefaultProps:function() {
		return {opts:{}};
	}
	,markDirty:function() {
		this.props.onChanged&&this.props.onChanged();
	}
	,action:function() {
		var args=Array.prototype.slice.apply(arguments);
		var act=args.shift();
		var p1=args[0];
		var p2=args[1];
		var sels=this.state.selected;
		var toc=this.props.toc;
		var r=false;
		if (act==="updateall") {
			this.setState({editcaption:-1,deleting:-1});
		} else if (act==="editcaption") {
			var n=parseInt(p1);
			this.setState({editcaption:n,selected:[n]});
		} else if (act==="deleting") {
			this.setState({deleting:this.state.editcaption});
		} else if (act==="changecaption") {
			if (!this.state.editcaption===-1) return;
			if (!p1) {
				this.action("deleting");
			} else {
				this.props.toc[this.state.editcaption].t=p1;
				this.setState({editcaption:-1});
				this.markDirty();
			}
		} else if (act==="select") {
			var selected=this.state.selected;
			if (!(this.props.opts.multiselect && p2)) {
				selected=[];
			}
			var n=parseInt(p1);
			if (!isNaN(n)) {
				selected.push(n);
				this.props.onSelect&&this.props.onSelect(this.props.tocid,this.props.toc[n],n,this.props.toc);
			}
			this.setState({selected:selected,editcaption:-1,deleting:-1,adding:0});
		} else if (act==="addingnode") {
			var insertAt=sels[0];
			if (p1) {
				insertAt=-insertAt; //ctrl pressed insert before
			}
			this.setState({adding:insertAt,editcaption:-1});
		} else if (act=="addnode") {
			var n=this.state.selected[0];
			r=manipulate.addNode(toc,n,p1,p2)
		}else if (act==="levelup") r=manipulate.levelUp(sels,toc);
		else if (act==="leveldown") r=manipulate.levelDown(sels,toc);
		else if (act==="deletenode") r=manipulate.deleteNode(sels,toc);
		else if (act==="hitclick") {
			this.props.onHitClick&&this.props.onHitClick(this.props.tocid,this.props.toc[p1],p1,this.props.toc);
		}
		if (r) {
			toc.built=false;//force rebuild
			buildToc(toc);
			this.setState({editcaption:-1,deleting:-1,adding:0});
			if (act==="deletenode") this.setState({selected:[]});
			this.markDirty();
		}
	}
	,render:function() {
		return E("div",{},
			E(TreeNode,{toc:this.props.toc,
				editcaption:this.state.editcaption,
				deleting:this.state.deleting,
				selected:this.state.selected,
				treename:this.props.treename,
				styles:this.props.styles,
				adding:this.state.adding,
				opened:this.props.opened,
				closed:this.props.closed,
				captionClass:this.props.captionClass,
				nodeicons:this.props.nodeicons,
				action:this.action,opts:this.props.opts,cur:0,
				hits:this.props.hits,
				conv:this.props.conv
			}));
	}
})
module.exports={Component:TreeToc,genToc:genToc,buildToc:buildToc};

},{"./manipulate":"/home/ec2-user/ksana2015/node_modules/ksana2015-treetoc/manipulate.js","./treenode":"/home/ec2-user/ksana2015/node_modules/ksana2015-treetoc/treenode.js","react":"/home/ec2-user/ksana2015/node_modules/react/react.js"}],"/home/ec2-user/ksana2015/node_modules/ksana2015-treetoc/manipulate.js":[function(require,module,exports){
var descendantOf=function(n,toc) { /* returning all descendants */
	var d=toc[n].d;
	n++;
	while (n<toc.length) {
		if (toc[n].d<=d) return n;
		n++;
	}
	return toc.length-1;
}
var levelUp =function(sels,toc) { //move select node and descendants one level up
	if (!canLevelup(sels,toc))return;
	var n=sels[0];
	var cur=toc[n];
	var next=toc[n+1];
	var nextsib=cur.n||descendantOf(n,toc);
	if (next && next.d>cur.d) { //has child
		for (var i=n+1;i<nextsib;i++) {
			toc[i].d--;
		}
	}
	cur.d--;
	cur.o=true;//force open this node , so that sibling is visible
	return true;
}
var levelDown =function(sels,toc) {
	if (!canLeveldown(sels,toc))return; //move select node descendants one level down
	var n=sels[0];
	var cur=toc[n];
	var next=toc[n+1];

	//force open previous node as it becomes parent of this node
	var p=prevSibling(n,toc);
	if (p) toc[p].o=true;

	if (!cur.o) { //do no move descendants if opened
		if (next && next.d>cur.d) { //has child
			for (var i=n+1;i<cur.n;i++) {
				toc[i].d++;
			}
		}		
	}
	cur.d++;
	return true;
}
var parseDepth=function(s,basedepth,dnow) {
	var d=0;
	
	while (s[0]===" ") {
		s=s.substr(1);
		d++;
	}
	if (basedepth+d>dnow+1) d=dnow+1-basedepth;

	return {d:basedepth+d,t:s.trim()};
}
var addNode =function(toc,n,newnodes,insertbefore) {
	var d=toc[n].d, basedepth=d, dnow=d;
	if (!insertbefore) {
		//toc[n].o=true;
		if (toc[n].n)	n=toc[n].n ;
		else (n++);
	}
	

	var args=[n,0];

	for (var i=0;i<newnodes.length;i++) {
		var r=parseDepth(newnodes[i],basedepth,dnow);
		if (r.t) {
			args.push(r);
			dnow=r.d;
		}
	}
	toc.splice.apply(toc,args);
	return true;
}
var deleteNode =function(sels,toc) {
	if (!canDeleteNode(sels,toc))return; //move select node descendants one level down
	var n=sels[0];
	var to=descendantOf(n,toc);
	var del=to-n;
	if (n==toc.length-1) del++;
	toc.splice(n,del);
	return true;
}

var canDeleteNode=function(sels,toc) {
	if (sels.length==0) return false;
	var n=sels[0];
	return (sels.length==1 && toc[n].d>0 && toc.length>2);
}
var canLevelup=function(sels,toc) {
	if (sels.length==0) return false;
	var n=sels[0];
	return (sels.length==1 && toc[n].d>1);
}
var prevSibling=function(n,toc) {
	var p=n-1;
	var d=toc[n].d;
	while (p>0) {
		if (toc[p].d<d) return 0;
		if (toc[p].d==d) return p;
		p--;
	}
}
var canLeveldown=function(sels,toc) {
	if (sels.length==0) return false;
	var n=sels[0];
	return (sels.length==1 && prevSibling(n,toc));
}
var enabled=function(sels,toc) {
	var enabled=[];
	if (canLeveldown(sels,toc)) enabled.push("leveldown");
	if (canLevelup(sels,toc)) enabled.push("levelup");
	if (canDeleteNode(sels,toc)) enabled.push("deletenode");
	return enabled;
}
module.exports={enabled:enabled,levelUp:levelUp,levelDown:levelDown,
	addNode:addNode,deleteNode:deleteNode,descendantOf:descendantOf};
},{}],"/home/ec2-user/ksana2015/node_modules/ksana2015-treetoc/treenode.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;

var manipulate=require("./manipulate");
var Controls=require("./controls");
var AddNode=require("./addnode");
var treenodehits=require("ksana-simple-api").treenodehits;
var defaultstyles={
	selectedcaption:{borderBottom:"1px solid blue",cursor:"pointer",borderRadius:"5px"}
	,caption:{cursor:"pointer"}
	,childnode:{left:"0.7em",position:"relative"}
	,rootnode:{position:"relative"}
	,folderbutton: {cursor:"pointer",borderRadius:"50%"}
	,closed:{cursor:"pointer",fontSize:"75%"}
	,opened:{cursor:"pointer",fontSize:"75%"}	
	,leaf:{fontSize:"75%"}	
	,hiddenleaf:{visibility:"hidden"}	
	,deletebutton:{background:"red",color:"yellow"}
	,nodelink:{fontSize:"65%",cursor:"pointer"}
	,hit:{color:"red",fontSize:"65%",cursor:"pointer"}
	,input:{fontSize:"100%"}
};
var styles={};

var TreeNode=React.createClass({
	propTypes:{
		toc:React.PropTypes.array.isRequired
		,opts:React.PropTypes.object
		,action:React.PropTypes.func.isRequired 
		,selected:React.PropTypes.array         //selected treenode (multiple)
		,cur:React.PropTypes.number.isRequired //current active treenode
		,styles:React.PropTypes.object  //custom style
		,nodeicons:React.PropTypes.node
	}
	,getDefaultProps:function() {
		return {cur:0,opts:{},toc:[]};
	}
	,componentWillMount:function(){
		this.cloneStyle();
	}
	,click:function(e) {
		ele=e.target;
		while (ele && !ele.attributes['data-n']) {
			ele=ele.parentElement;
		}
		var n=parseInt(ele.attributes['data-n'].value);
		this.props.toc[n].o=!this.props.toc[n].o;
		this.forceUpdate();
		e.preventDefault();
    e.stopPropagation();
	}
	,select:function(e){
		if (e.target.nodeName!=="SPAN") return;
		var datan=e.target.parentElement.attributes['data-n'];
		if (!datan) return;
		var n=parseInt(datan.value);
		var selected=this.props.selected.indexOf(n)>-1;
		if (selected && this.props.opts.editable) {
			this.props.action("editcaption",n);
		} else {
			this.props.action("select",n,e.ctrlKey);
		}
		e.preventDefault();
    e.stopPropagation();
	}
	,cloneStyle:function(newstyles) {
		styles={};
		for (var i in defaultstyles) styles[i]=defaultstyles[i];
		if (newstyles) for (var i in newstyles) styles[i]=newstyles[i];
	}

	,componentWillReceiveProps:function(nextProps) {
		if (nextProps.styles && nextProps.styles!==this.props.styles) this.cloneStyle(nextProps.styles)
	}
	,componentDidUpdate:function() {
		if (this.refs.editcaption) {
			var dom=this.refs.editcaption;
			dom.focus();
			dom.selectionStart=dom.value.length;
		}
	}
	,oninput:function(e) {
		var size=e.target.value.length+2;;
		if (size<5) size=5;
		e.target.size=size;
	}

	,editingkeydown:function(e) {
		if (e.key=="Enter") {
			this.props.action("changecaption",e.target.value);	
			e.stopPropagation();
		} else this.oninput(e);
	}
	,deleteNodes:function() {
		this.props.action("deletenode");
	}
	,renderDeleteButton:function(n) {
		var childnode=null;
		var children=manipulate.descendantOf(n,this.props.toc);
		if (children>n+1) childnode=E("span",{}," "+(children-n)+" nodes");
		var out=E("button",{onClick:this.deleteNodes,style:styles.deletebutton},"Delete",childnode);
		return out;
	}
	,mouseenter:function(e) {
		//e.target.style.background="highlight";
		e.target.style.oldcolor=e.target.style.color;
		//e.target.style.color="HighlightText";
		e.target.style.borderRadius="5px";
		this.lasttarget=e.target;
	}
	,mouseleave:function(e) {
		if (!this.lasttarget)return;
		//this.lasttarget.style.background="none";
		this.lasttarget.style.color=this.lasttarget.style.oldcolor;
	}
	,renderFolderButton:function(n) {
		var next=this.props.toc[n+1];
		var cur=this.props.toc[n];
		var folderbutton=null;
		var props={style:styles.closed, onClick:this.click, onMouseEnter:this.mouseenter,onMouseLeave:this.mouseleave};
		if (cur.o) props.style=styles.opened;
		if (next && next.d>cur.d && cur.d) { 
			if (cur.o) folderbutton=E("a",props,this.props.opened||"－");//"▼"
			else       folderbutton=E("a",props,this.props.closed||"＋");//"▷"
		} else {
			folderbutton=E("a",{ style:styles.hiddenleaf},"＊");
		}
		return folderbutton;
	}
	,renderCaption:function(n,depth) {
		var cur=this.props.toc[n];
		var stylename="caption";
		var defaultCaption="";
		var t=cur.t;
		if (this.props.conv) t=this.props.conv(t)||t;
		if (n==0) defaultCaption=this.props.treename;

		if (this.props.selected.indexOf(n)>-1) stylename="selectedcaption";
		var caption=null;
		if (this.props.deleting===n) {
			caption=this.renderDeleteButton(n);
		} else if (this.props.editcaption===n) {
			var size=cur.t.length+2;
			if (size<5) size=5;
			caption=E("input",{onKeyDown:this.editingkeydown,style:styles.input,
				               size:size,ref:"editcaption",defaultValue:t});
		} else {
			if (t.length<5) t=t+"  ";
			var style=JSON.parse(JSON.stringify(styles[stylename]));

			if (this.props.nodeicons) {
				var nodeicon=getNodeIcon(depth,this.props.nodeicons);
				if (typeof nodeicon=="string") style.backgroundImage="url("+nodeicon+")";
				style.backgroundRepeat="no-repeat";
			}

			caption=E("span",{onMouseEnter:this.mouseenter,onMouseLeave:this.mouseleave,
				className:this.props.captionClass,style:style,title:n},(defaultCaption||t)+(cur.o?" ":""));
			//force caption to repaint by appending extra space at the end
		}
		return caption;
	}
	,renderAddingNode:function(n,above) {
		if (this.props.adding===n && n) { 
			return E(AddNode,{insertBefore:above,action:this.props.action});
		}
	}
	,renderEditControls:function(n) {
		if (!this.props.opts.editable) return;
		if (this.props.editcaption===n && n>0) {	
			var enabled=manipulate.enabled([n],this.props.toc);
			return E(Controls,{action:this.props.action,enabled:enabled});
		} 
	}
	,renderItem:function(e,idx){
		var t=this.props.toc[e];
		var props={};
		for (var i in this.props) {
			props[i]=this.props[i];
		}
		var opened=t.o?"o":"";
		props.key="k"+e;
		props.cur=e;
		return E(TreeNode,props);
	}
	,clickhit:function(e) {
		var n=parseInt(e.target.dataset.n);
		this.props.action("hitclick",n);
		e.preventDefault();
		e.stopPropagation();
	}
	,renderHit:function(hit,n) {
		if (!hit) return;
		return E("span",{onClick:this.clickhit,style:styles.hit,"data-n":n,className:"treenode_hit",
			onMouseEnter:this.mouseenter,onMouseLeave:this.mouseleave},hit);
	}
	,render:function() {
		if (this.props.toc.length===0) return E("span",{},"");
		var n=this.props.cur;
		var cur=this.props.toc[n];
		var stylename="childnode",children=[];
		var selected=this.props.selected.indexOf(n)>-1;
		var nodeicon="";
		if (this.props.nodeicons&&typeof this.props.nodeicons[0]!=="string"){
			var nodeicon=getNodeIcon(cur.d,this.props.nodeicons);	
		}
		
		var depthdeco=renderDepth(cur.d,this.props.opts)
		if (cur.d==0) stylename="rootnode";
		var adding_before_controls=this.renderAddingNode(-n,true);
		var adding_after_controls=this.renderAddingNode(n);
		var editcontrols=this.renderEditControls(n);
		var folderbutton=this.renderFolderButton(n);
		var caption=this.renderCaption(n,cur.d);

		if (cur.o) children=enumChildren(this.props.toc,n);

		var extracomponent=this.props.opts.onNode&& this.props.opts.onNode(cur,selected,n,this.props.editcaption);
		if (this.props.deleting>-1) extracomponent=null;
		if (this.props.deleting>-1) editcontrols=null;
		var hitcount=treenodehits(this.props.toc,this.props.hits,n);

		return E("div",{onClick:this.select,"data-n":n,style:styles[stylename],className:"treenode_lv"+cur.d},

			   adding_before_controls,
			   folderbutton,nodeicon,depthdeco,
			   editcontrols,
			   caption,
			   this.renderHit(hitcount,n),
			   extracomponent,
			   adding_after_controls,
			   children.map(this.renderItem));
	}
});

var getNodeIcon=function(depth,nodeicons) {
	if (!nodeicons) return;
	if (!nodeicons[depth]) return nodeicons[nodeicons.length-1];//return last icon
	return nodeicons[depth];
}
var ganzhi="　甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥";

var renderDepth=function(depth,opts) {
  var out=[];
  if (opts&&opts.tocstyle=="ganzhi") {
    return E("span", null, ganzhi[depth].trim()+" ");
  } else {
    if (opts&&opts.numberDepth && depth) return E("span", null, depth, ".")
    else return null;
  }
  return null;
};


var enumChildren=function(toc,cur) {
    var children=[];
    if (!toc || !toc.length || toc.length==1) return children;
    thisdepth=toc[cur].d||toc[cur].depth;
    if (cur==0) thisdepth=0;
    if (cur+1>=toc.length) return children;
    if ((toc[cur+1].d||toc[cur+1].depth)!= 1+thisdepth) {
    	return children;  // no children node
    }
    var n=cur+1;
    var child=toc[n];
    
    while (child) {
      children.push(n);
      var next=toc[n+1];
      if (!next) break;
      if ((next.d||next.depth)==(child.d||child.depth)) {
        n++;
      } else if ((next.d||next.depth)>(child.d||child.depth)) {
        n=child.n||child.next;
      } else break;
      if (n) child=toc[n];else break;
    }
    return children;
}
module.exports=TreeNode;
},{"./addnode":"/home/ec2-user/ksana2015/node_modules/ksana2015-treetoc/addnode.js","./controls":"/home/ec2-user/ksana2015/node_modules/ksana2015-treetoc/controls.js","./manipulate":"/home/ec2-user/ksana2015/node_modules/ksana2015-treetoc/manipulate.js","ksana-simple-api":"/home/ec2-user/ksana2015/node_modules/ksana-simple-api/index.js","react":"/home/ec2-user/ksana2015/node_modules/react/react.js"}],"/home/ec2-user/ksana2015/node_modules/react-dom/index.js":[function(require,module,exports){
'use strict';

module.exports = require('react/lib/ReactDOM');

},{"react/lib/ReactDOM":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOM.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/AutoFocusUtils.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule AutoFocusUtils
 * @typechecks static-only
 */

'use strict';

var ReactMount = require('./ReactMount');

var findDOMNode = require('./findDOMNode');
var focusNode = require('fbjs/lib/focusNode');

var Mixin = {
  componentDidMount: function () {
    if (this.props.autoFocus) {
      focusNode(findDOMNode(this));
    }
  }
};

var AutoFocusUtils = {
  Mixin: Mixin,

  focusDOMComponent: function () {
    focusNode(ReactMount.getNode(this._rootNodeID));
  }
};

module.exports = AutoFocusUtils;
},{"./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js","./findDOMNode":"/home/ec2-user/ksana2015/node_modules/react/lib/findDOMNode.js","fbjs/lib/focusNode":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/focusNode.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/BeforeInputEventPlugin.js":[function(require,module,exports){
/**
 * Copyright 2013-2015 Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule BeforeInputEventPlugin
 * @typechecks static-only
 */

'use strict';

var EventConstants = require('./EventConstants');
var EventPropagators = require('./EventPropagators');
var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');
var FallbackCompositionState = require('./FallbackCompositionState');
var SyntheticCompositionEvent = require('./SyntheticCompositionEvent');
var SyntheticInputEvent = require('./SyntheticInputEvent');

var keyOf = require('fbjs/lib/keyOf');

var END_KEYCODES = [9, 13, 27, 32]; // Tab, Return, Esc, Space
var START_KEYCODE = 229;

var canUseCompositionEvent = ExecutionEnvironment.canUseDOM && 'CompositionEvent' in window;

var documentMode = null;
if (ExecutionEnvironment.canUseDOM && 'documentMode' in document) {
  documentMode = document.documentMode;
}

// Webkit offers a very useful `textInput` event that can be used to
// directly represent `beforeInput`. The IE `textinput` event is not as
// useful, so we don't use it.
var canUseTextInputEvent = ExecutionEnvironment.canUseDOM && 'TextEvent' in window && !documentMode && !isPresto();

// In IE9+, we have access to composition events, but the data supplied
// by the native compositionend event may be incorrect. Japanese ideographic
// spaces, for instance (\u3000) are not recorded correctly.
var useFallbackCompositionData = ExecutionEnvironment.canUseDOM && (!canUseCompositionEvent || documentMode && documentMode > 8 && documentMode <= 11);

/**
 * Opera <= 12 includes TextEvent in window, but does not fire
 * text input events. Rely on keypress instead.
 */
function isPresto() {
  var opera = window.opera;
  return typeof opera === 'object' && typeof opera.version === 'function' && parseInt(opera.version(), 10) <= 12;
}

var SPACEBAR_CODE = 32;
var SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE);

var topLevelTypes = EventConstants.topLevelTypes;

// Events and their corresponding property names.
var eventTypes = {
  beforeInput: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onBeforeInput: null }),
      captured: keyOf({ onBeforeInputCapture: null })
    },
    dependencies: [topLevelTypes.topCompositionEnd, topLevelTypes.topKeyPress, topLevelTypes.topTextInput, topLevelTypes.topPaste]
  },
  compositionEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onCompositionEnd: null }),
      captured: keyOf({ onCompositionEndCapture: null })
    },
    dependencies: [topLevelTypes.topBlur, topLevelTypes.topCompositionEnd, topLevelTypes.topKeyDown, topLevelTypes.topKeyPress, topLevelTypes.topKeyUp, topLevelTypes.topMouseDown]
  },
  compositionStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onCompositionStart: null }),
      captured: keyOf({ onCompositionStartCapture: null })
    },
    dependencies: [topLevelTypes.topBlur, topLevelTypes.topCompositionStart, topLevelTypes.topKeyDown, topLevelTypes.topKeyPress, topLevelTypes.topKeyUp, topLevelTypes.topMouseDown]
  },
  compositionUpdate: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onCompositionUpdate: null }),
      captured: keyOf({ onCompositionUpdateCapture: null })
    },
    dependencies: [topLevelTypes.topBlur, topLevelTypes.topCompositionUpdate, topLevelTypes.topKeyDown, topLevelTypes.topKeyPress, topLevelTypes.topKeyUp, topLevelTypes.topMouseDown]
  }
};

// Track whether we've ever handled a keypress on the space key.
var hasSpaceKeypress = false;

/**
 * Return whether a native keypress event is assumed to be a command.
 * This is required because Firefox fires `keypress` events for key commands
 * (cut, copy, select-all, etc.) even though no character is inserted.
 */
function isKeypressCommand(nativeEvent) {
  return (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) &&
  // ctrlKey && altKey is equivalent to AltGr, and is not a command.
  !(nativeEvent.ctrlKey && nativeEvent.altKey);
}

/**
 * Translate native top level events into event types.
 *
 * @param {string} topLevelType
 * @return {object}
 */
function getCompositionEventType(topLevelType) {
  switch (topLevelType) {
    case topLevelTypes.topCompositionStart:
      return eventTypes.compositionStart;
    case topLevelTypes.topCompositionEnd:
      return eventTypes.compositionEnd;
    case topLevelTypes.topCompositionUpdate:
      return eventTypes.compositionUpdate;
  }
}

/**
 * Does our fallback best-guess model think this event signifies that
 * composition has begun?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackCompositionStart(topLevelType, nativeEvent) {
  return topLevelType === topLevelTypes.topKeyDown && nativeEvent.keyCode === START_KEYCODE;
}

/**
 * Does our fallback mode think that this event is the end of composition?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackCompositionEnd(topLevelType, nativeEvent) {
  switch (topLevelType) {
    case topLevelTypes.topKeyUp:
      // Command keys insert or clear IME input.
      return END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1;
    case topLevelTypes.topKeyDown:
      // Expect IME keyCode on each keydown. If we get any other
      // code we must have exited earlier.
      return nativeEvent.keyCode !== START_KEYCODE;
    case topLevelTypes.topKeyPress:
    case topLevelTypes.topMouseDown:
    case topLevelTypes.topBlur:
      // Events are not possible without cancelling IME.
      return true;
    default:
      return false;
  }
}

/**
 * Google Input Tools provides composition data via a CustomEvent,
 * with the `data` property populated in the `detail` object. If this
 * is available on the event object, use it. If not, this is a plain
 * composition event and we have nothing special to extract.
 *
 * @param {object} nativeEvent
 * @return {?string}
 */
function getDataFromCustomEvent(nativeEvent) {
  var detail = nativeEvent.detail;
  if (typeof detail === 'object' && 'data' in detail) {
    return detail.data;
  }
  return null;
}

// Track the current IME composition fallback object, if any.
var currentComposition = null;

/**
 * @param {string} topLevelType Record from `EventConstants`.
 * @param {DOMEventTarget} topLevelTarget The listening component root node.
 * @param {string} topLevelTargetID ID of `topLevelTarget`.
 * @param {object} nativeEvent Native browser event.
 * @return {?object} A SyntheticCompositionEvent.
 */
function extractCompositionEvent(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
  var eventType;
  var fallbackData;

  if (canUseCompositionEvent) {
    eventType = getCompositionEventType(topLevelType);
  } else if (!currentComposition) {
    if (isFallbackCompositionStart(topLevelType, nativeEvent)) {
      eventType = eventTypes.compositionStart;
    }
  } else if (isFallbackCompositionEnd(topLevelType, nativeEvent)) {
    eventType = eventTypes.compositionEnd;
  }

  if (!eventType) {
    return null;
  }

  if (useFallbackCompositionData) {
    // The current composition is stored statically and must not be
    // overwritten while composition continues.
    if (!currentComposition && eventType === eventTypes.compositionStart) {
      currentComposition = FallbackCompositionState.getPooled(topLevelTarget);
    } else if (eventType === eventTypes.compositionEnd) {
      if (currentComposition) {
        fallbackData = currentComposition.getData();
      }
    }
  }

  var event = SyntheticCompositionEvent.getPooled(eventType, topLevelTargetID, nativeEvent, nativeEventTarget);

  if (fallbackData) {
    // Inject data generated from fallback path into the synthetic event.
    // This matches the property of native CompositionEventInterface.
    event.data = fallbackData;
  } else {
    var customData = getDataFromCustomEvent(nativeEvent);
    if (customData !== null) {
      event.data = customData;
    }
  }

  EventPropagators.accumulateTwoPhaseDispatches(event);
  return event;
}

/**
 * @param {string} topLevelType Record from `EventConstants`.
 * @param {object} nativeEvent Native browser event.
 * @return {?string} The string corresponding to this `beforeInput` event.
 */
function getNativeBeforeInputChars(topLevelType, nativeEvent) {
  switch (topLevelType) {
    case topLevelTypes.topCompositionEnd:
      return getDataFromCustomEvent(nativeEvent);
    case topLevelTypes.topKeyPress:
      /**
       * If native `textInput` events are available, our goal is to make
       * use of them. However, there is a special case: the spacebar key.
       * In Webkit, preventing default on a spacebar `textInput` event
       * cancels character insertion, but it *also* causes the browser
       * to fall back to its default spacebar behavior of scrolling the
       * page.
       *
       * Tracking at:
       * https://code.google.com/p/chromium/issues/detail?id=355103
       *
       * To avoid this issue, use the keypress event as if no `textInput`
       * event is available.
       */
      var which = nativeEvent.which;
      if (which !== SPACEBAR_CODE) {
        return null;
      }

      hasSpaceKeypress = true;
      return SPACEBAR_CHAR;

    case topLevelTypes.topTextInput:
      // Record the characters to be added to the DOM.
      var chars = nativeEvent.data;

      // If it's a spacebar character, assume that we have already handled
      // it at the keypress level and bail immediately. Android Chrome
      // doesn't give us keycodes, so we need to blacklist it.
      if (chars === SPACEBAR_CHAR && hasSpaceKeypress) {
        return null;
      }

      return chars;

    default:
      // For other native event types, do nothing.
      return null;
  }
}

/**
 * For browsers that do not provide the `textInput` event, extract the
 * appropriate string to use for SyntheticInputEvent.
 *
 * @param {string} topLevelType Record from `EventConstants`.
 * @param {object} nativeEvent Native browser event.
 * @return {?string} The fallback string for this `beforeInput` event.
 */
function getFallbackBeforeInputChars(topLevelType, nativeEvent) {
  // If we are currently composing (IME) and using a fallback to do so,
  // try to extract the composed characters from the fallback object.
  if (currentComposition) {
    if (topLevelType === topLevelTypes.topCompositionEnd || isFallbackCompositionEnd(topLevelType, nativeEvent)) {
      var chars = currentComposition.getData();
      FallbackCompositionState.release(currentComposition);
      currentComposition = null;
      return chars;
    }
    return null;
  }

  switch (topLevelType) {
    case topLevelTypes.topPaste:
      // If a paste event occurs after a keypress, throw out the input
      // chars. Paste events should not lead to BeforeInput events.
      return null;
    case topLevelTypes.topKeyPress:
      /**
       * As of v27, Firefox may fire keypress events even when no character
       * will be inserted. A few possibilities:
       *
       * - `which` is `0`. Arrow keys, Esc key, etc.
       *
       * - `which` is the pressed key code, but no char is available.
       *   Ex: 'AltGr + d` in Polish. There is no modified character for
       *   this key combination and no character is inserted into the
       *   document, but FF fires the keypress for char code `100` anyway.
       *   No `input` event will occur.
       *
       * - `which` is the pressed key code, but a command combination is
       *   being used. Ex: `Cmd+C`. No character is inserted, and no
       *   `input` event will occur.
       */
      if (nativeEvent.which && !isKeypressCommand(nativeEvent)) {
        return String.fromCharCode(nativeEvent.which);
      }
      return null;
    case topLevelTypes.topCompositionEnd:
      return useFallbackCompositionData ? null : nativeEvent.data;
    default:
      return null;
  }
}

/**
 * Extract a SyntheticInputEvent for `beforeInput`, based on either native
 * `textInput` or fallback behavior.
 *
 * @param {string} topLevelType Record from `EventConstants`.
 * @param {DOMEventTarget} topLevelTarget The listening component root node.
 * @param {string} topLevelTargetID ID of `topLevelTarget`.
 * @param {object} nativeEvent Native browser event.
 * @return {?object} A SyntheticInputEvent.
 */
function extractBeforeInputEvent(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
  var chars;

  if (canUseTextInputEvent) {
    chars = getNativeBeforeInputChars(topLevelType, nativeEvent);
  } else {
    chars = getFallbackBeforeInputChars(topLevelType, nativeEvent);
  }

  // If no characters are being inserted, no BeforeInput event should
  // be fired.
  if (!chars) {
    return null;
  }

  var event = SyntheticInputEvent.getPooled(eventTypes.beforeInput, topLevelTargetID, nativeEvent, nativeEventTarget);

  event.data = chars;
  EventPropagators.accumulateTwoPhaseDispatches(event);
  return event;
}

/**
 * Create an `onBeforeInput` event to match
 * http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105/#events-inputevents.
 *
 * This event plugin is based on the native `textInput` event
 * available in Chrome, Safari, Opera, and IE. This event fires after
 * `onKeyPress` and `onCompositionEnd`, but before `onInput`.
 *
 * `beforeInput` is spec'd but not implemented in any browsers, and
 * the `input` event does not provide any useful information about what has
 * actually been added, contrary to the spec. Thus, `textInput` is the best
 * available event to identify the characters that have actually been inserted
 * into the target node.
 *
 * This plugin is also responsible for emitting `composition` events, thus
 * allowing us to share composition fallback code for both `beforeInput` and
 * `composition` event types.
 */
var BeforeInputEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function (topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
    return [extractCompositionEvent(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget), extractBeforeInputEvent(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget)];
  }
};

module.exports = BeforeInputEventPlugin;
},{"./EventConstants":"/home/ec2-user/ksana2015/node_modules/react/lib/EventConstants.js","./EventPropagators":"/home/ec2-user/ksana2015/node_modules/react/lib/EventPropagators.js","./FallbackCompositionState":"/home/ec2-user/ksana2015/node_modules/react/lib/FallbackCompositionState.js","./SyntheticCompositionEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticCompositionEvent.js","./SyntheticInputEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticInputEvent.js","fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js","fbjs/lib/keyOf":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyOf.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/CSSProperty.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CSSProperty
 */

'use strict';

/**
 * CSS properties which accept numbers but are not in units of "px".
 */
var isUnitlessNumber = {
  animationIterationCount: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,

  // SVG-related properties
  fillOpacity: true,
  stopOpacity: true,
  strokeDashoffset: true,
  strokeOpacity: true,
  strokeWidth: true
};

/**
 * @param {string} prefix vendor-specific prefix, eg: Webkit
 * @param {string} key style name, eg: transitionDuration
 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
 * WebkitTransitionDuration
 */
function prefixKey(prefix, key) {
  return prefix + key.charAt(0).toUpperCase() + key.substring(1);
}

/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 */
var prefixes = ['Webkit', 'ms', 'Moz', 'O'];

// Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
// infinite loop, because it iterates over the newly added props too.
Object.keys(isUnitlessNumber).forEach(function (prop) {
  prefixes.forEach(function (prefix) {
    isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
  });
});

/**
 * Most style properties can be unset by doing .style[prop] = '' but IE8
 * doesn't like doing that with shorthand properties so for the properties that
 * IE8 breaks on, which are listed here, we instead unset each of the
 * individual properties. See http://bugs.jquery.com/ticket/12385.
 * The 4-value 'clock' properties like margin, padding, border-width seem to
 * behave without any problems. Curiously, list-style works too without any
 * special prodding.
 */
var shorthandPropertyExpansions = {
  background: {
    backgroundAttachment: true,
    backgroundColor: true,
    backgroundImage: true,
    backgroundPositionX: true,
    backgroundPositionY: true,
    backgroundRepeat: true
  },
  backgroundPosition: {
    backgroundPositionX: true,
    backgroundPositionY: true
  },
  border: {
    borderWidth: true,
    borderStyle: true,
    borderColor: true
  },
  borderBottom: {
    borderBottomWidth: true,
    borderBottomStyle: true,
    borderBottomColor: true
  },
  borderLeft: {
    borderLeftWidth: true,
    borderLeftStyle: true,
    borderLeftColor: true
  },
  borderRight: {
    borderRightWidth: true,
    borderRightStyle: true,
    borderRightColor: true
  },
  borderTop: {
    borderTopWidth: true,
    borderTopStyle: true,
    borderTopColor: true
  },
  font: {
    fontStyle: true,
    fontVariant: true,
    fontWeight: true,
    fontSize: true,
    lineHeight: true,
    fontFamily: true
  },
  outline: {
    outlineWidth: true,
    outlineStyle: true,
    outlineColor: true
  }
};

var CSSProperty = {
  isUnitlessNumber: isUnitlessNumber,
  shorthandPropertyExpansions: shorthandPropertyExpansions
};

module.exports = CSSProperty;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/CSSPropertyOperations.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CSSPropertyOperations
 * @typechecks static-only
 */

'use strict';

var CSSProperty = require('./CSSProperty');
var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');
var ReactPerf = require('./ReactPerf');

var camelizeStyleName = require('fbjs/lib/camelizeStyleName');
var dangerousStyleValue = require('./dangerousStyleValue');
var hyphenateStyleName = require('fbjs/lib/hyphenateStyleName');
var memoizeStringOnly = require('fbjs/lib/memoizeStringOnly');
var warning = require('fbjs/lib/warning');

var processStyleName = memoizeStringOnly(function (styleName) {
  return hyphenateStyleName(styleName);
});

var hasShorthandPropertyBug = false;
var styleFloatAccessor = 'cssFloat';
if (ExecutionEnvironment.canUseDOM) {
  var tempStyle = document.createElement('div').style;
  try {
    // IE8 throws "Invalid argument." if resetting shorthand style properties.
    tempStyle.font = '';
  } catch (e) {
    hasShorthandPropertyBug = true;
  }
  // IE8 only supports accessing cssFloat (standard) as styleFloat
  if (document.documentElement.style.cssFloat === undefined) {
    styleFloatAccessor = 'styleFloat';
  }
}

if (process.env.NODE_ENV !== 'production') {
  // 'msTransform' is correct, but the other prefixes should be capitalized
  var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;

  // style values shouldn't contain a semicolon
  var badStyleValueWithSemicolonPattern = /;\s*$/;

  var warnedStyleNames = {};
  var warnedStyleValues = {};

  var warnHyphenatedStyleName = function (name) {
    if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
      return;
    }

    warnedStyleNames[name] = true;
    process.env.NODE_ENV !== 'production' ? warning(false, 'Unsupported style property %s. Did you mean %s?', name, camelizeStyleName(name)) : undefined;
  };

  var warnBadVendoredStyleName = function (name) {
    if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
      return;
    }

    warnedStyleNames[name] = true;
    process.env.NODE_ENV !== 'production' ? warning(false, 'Unsupported vendor-prefixed style property %s. Did you mean %s?', name, name.charAt(0).toUpperCase() + name.slice(1)) : undefined;
  };

  var warnStyleValueWithSemicolon = function (name, value) {
    if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
      return;
    }

    warnedStyleValues[value] = true;
    process.env.NODE_ENV !== 'production' ? warning(false, 'Style property values shouldn\'t contain a semicolon. ' + 'Try "%s: %s" instead.', name, value.replace(badStyleValueWithSemicolonPattern, '')) : undefined;
  };

  /**
   * @param {string} name
   * @param {*} value
   */
  var warnValidStyle = function (name, value) {
    if (name.indexOf('-') > -1) {
      warnHyphenatedStyleName(name);
    } else if (badVendoredStyleNamePattern.test(name)) {
      warnBadVendoredStyleName(name);
    } else if (badStyleValueWithSemicolonPattern.test(value)) {
      warnStyleValueWithSemicolon(name, value);
    }
  };
}

/**
 * Operations for dealing with CSS properties.
 */
var CSSPropertyOperations = {

  /**
   * Serializes a mapping of style properties for use as inline styles:
   *
   *   > createMarkupForStyles({width: '200px', height: 0})
   *   "width:200px;height:0;"
   *
   * Undefined values are ignored so that declarative programming is easier.
   * The result should be HTML-escaped before insertion into the DOM.
   *
   * @param {object} styles
   * @return {?string}
   */
  createMarkupForStyles: function (styles) {
    var serialized = '';
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      var styleValue = styles[styleName];
      if (process.env.NODE_ENV !== 'production') {
        warnValidStyle(styleName, styleValue);
      }
      if (styleValue != null) {
        serialized += processStyleName(styleName) + ':';
        serialized += dangerousStyleValue(styleName, styleValue) + ';';
      }
    }
    return serialized || null;
  },

  /**
   * Sets the value for multiple styles on a node.  If a value is specified as
   * '' (empty string), the corresponding style property will be unset.
   *
   * @param {DOMElement} node
   * @param {object} styles
   */
  setValueForStyles: function (node, styles) {
    var style = node.style;
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      if (process.env.NODE_ENV !== 'production') {
        warnValidStyle(styleName, styles[styleName]);
      }
      var styleValue = dangerousStyleValue(styleName, styles[styleName]);
      if (styleName === 'float') {
        styleName = styleFloatAccessor;
      }
      if (styleValue) {
        style[styleName] = styleValue;
      } else {
        var expansion = hasShorthandPropertyBug && CSSProperty.shorthandPropertyExpansions[styleName];
        if (expansion) {
          // Shorthand property that IE8 won't like unsetting, so unset each
          // component to placate it
          for (var individualStyleName in expansion) {
            style[individualStyleName] = '';
          }
        } else {
          style[styleName] = '';
        }
      }
    }
  }

};

ReactPerf.measureMethods(CSSPropertyOperations, 'CSSPropertyOperations', {
  setValueForStyles: 'setValueForStyles'
});

module.exports = CSSPropertyOperations;
},{"./CSSProperty":"/home/ec2-user/ksana2015/node_modules/react/lib/CSSProperty.js","./ReactPerf":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPerf.js","./dangerousStyleValue":"/home/ec2-user/ksana2015/node_modules/react/lib/dangerousStyleValue.js","fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js","fbjs/lib/camelizeStyleName":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/camelizeStyleName.js","fbjs/lib/hyphenateStyleName":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/hyphenateStyleName.js","fbjs/lib/memoizeStringOnly":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/memoizeStringOnly.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/CallbackQueue.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CallbackQueue
 */

'use strict';

var PooledClass = require('./PooledClass');

var assign = require('./Object.assign');
var invariant = require('fbjs/lib/invariant');

/**
 * A specialized pseudo-event module to help keep track of components waiting to
 * be notified when their DOM representations are available for use.
 *
 * This implements `PooledClass`, so you should never need to instantiate this.
 * Instead, use `CallbackQueue.getPooled()`.
 *
 * @class ReactMountReady
 * @implements PooledClass
 * @internal
 */
function CallbackQueue() {
  this._callbacks = null;
  this._contexts = null;
}

assign(CallbackQueue.prototype, {

  /**
   * Enqueues a callback to be invoked when `notifyAll` is invoked.
   *
   * @param {function} callback Invoked when `notifyAll` is invoked.
   * @param {?object} context Context to call `callback` with.
   * @internal
   */
  enqueue: function (callback, context) {
    this._callbacks = this._callbacks || [];
    this._contexts = this._contexts || [];
    this._callbacks.push(callback);
    this._contexts.push(context);
  },

  /**
   * Invokes all enqueued callbacks and clears the queue. This is invoked after
   * the DOM representation of a component has been created or updated.
   *
   * @internal
   */
  notifyAll: function () {
    var callbacks = this._callbacks;
    var contexts = this._contexts;
    if (callbacks) {
      !(callbacks.length === contexts.length) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Mismatched list of contexts in callback queue') : invariant(false) : undefined;
      this._callbacks = null;
      this._contexts = null;
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i].call(contexts[i]);
      }
      callbacks.length = 0;
      contexts.length = 0;
    }
  },

  /**
   * Resets the internal queue.
   *
   * @internal
   */
  reset: function () {
    this._callbacks = null;
    this._contexts = null;
  },

  /**
   * `PooledClass` looks for this.
   */
  destructor: function () {
    this.reset();
  }

});

PooledClass.addPoolingTo(CallbackQueue);

module.exports = CallbackQueue;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./PooledClass":"/home/ec2-user/ksana2015/node_modules/react/lib/PooledClass.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ChangeEventPlugin.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ChangeEventPlugin
 */

'use strict';

var EventConstants = require('./EventConstants');
var EventPluginHub = require('./EventPluginHub');
var EventPropagators = require('./EventPropagators');
var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');
var ReactUpdates = require('./ReactUpdates');
var SyntheticEvent = require('./SyntheticEvent');

var getEventTarget = require('./getEventTarget');
var isEventSupported = require('./isEventSupported');
var isTextInputElement = require('./isTextInputElement');
var keyOf = require('fbjs/lib/keyOf');

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  change: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onChange: null }),
      captured: keyOf({ onChangeCapture: null })
    },
    dependencies: [topLevelTypes.topBlur, topLevelTypes.topChange, topLevelTypes.topClick, topLevelTypes.topFocus, topLevelTypes.topInput, topLevelTypes.topKeyDown, topLevelTypes.topKeyUp, topLevelTypes.topSelectionChange]
  }
};

/**
 * For IE shims
 */
var activeElement = null;
var activeElementID = null;
var activeElementValue = null;
var activeElementValueProp = null;

/**
 * SECTION: handle `change` event
 */
function shouldUseChangeEvent(elem) {
  var nodeName = elem.nodeName && elem.nodeName.toLowerCase();
  return nodeName === 'select' || nodeName === 'input' && elem.type === 'file';
}

var doesChangeEventBubble = false;
if (ExecutionEnvironment.canUseDOM) {
  // See `handleChange` comment below
  doesChangeEventBubble = isEventSupported('change') && (!('documentMode' in document) || document.documentMode > 8);
}

function manualDispatchChangeEvent(nativeEvent) {
  var event = SyntheticEvent.getPooled(eventTypes.change, activeElementID, nativeEvent, getEventTarget(nativeEvent));
  EventPropagators.accumulateTwoPhaseDispatches(event);

  // If change and propertychange bubbled, we'd just bind to it like all the
  // other events and have it go through ReactBrowserEventEmitter. Since it
  // doesn't, we manually listen for the events and so we have to enqueue and
  // process the abstract event manually.
  //
  // Batching is necessary here in order to ensure that all event handlers run
  // before the next rerender (including event handlers attached to ancestor
  // elements instead of directly on the input). Without this, controlled
  // components don't work properly in conjunction with event bubbling because
  // the component is rerendered and the value reverted before all the event
  // handlers can run. See https://github.com/facebook/react/issues/708.
  ReactUpdates.batchedUpdates(runEventInBatch, event);
}

function runEventInBatch(event) {
  EventPluginHub.enqueueEvents(event);
  EventPluginHub.processEventQueue(false);
}

function startWatchingForChangeEventIE8(target, targetID) {
  activeElement = target;
  activeElementID = targetID;
  activeElement.attachEvent('onchange', manualDispatchChangeEvent);
}

function stopWatchingForChangeEventIE8() {
  if (!activeElement) {
    return;
  }
  activeElement.detachEvent('onchange', manualDispatchChangeEvent);
  activeElement = null;
  activeElementID = null;
}

function getTargetIDForChangeEvent(topLevelType, topLevelTarget, topLevelTargetID) {
  if (topLevelType === topLevelTypes.topChange) {
    return topLevelTargetID;
  }
}
function handleEventsForChangeEventIE8(topLevelType, topLevelTarget, topLevelTargetID) {
  if (topLevelType === topLevelTypes.topFocus) {
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForChangeEventIE8();
    startWatchingForChangeEventIE8(topLevelTarget, topLevelTargetID);
  } else if (topLevelType === topLevelTypes.topBlur) {
    stopWatchingForChangeEventIE8();
  }
}

/**
 * SECTION: handle `input` event
 */
var isInputEventSupported = false;
if (ExecutionEnvironment.canUseDOM) {
  // IE9 claims to support the input event but fails to trigger it when
  // deleting text, so we ignore its input events
  isInputEventSupported = isEventSupported('input') && (!('documentMode' in document) || document.documentMode > 9);
}

/**
 * (For old IE.) Replacement getter/setter for the `value` property that gets
 * set on the active element.
 */
var newValueProp = {
  get: function () {
    return activeElementValueProp.get.call(this);
  },
  set: function (val) {
    // Cast to a string so we can do equality checks.
    activeElementValue = '' + val;
    activeElementValueProp.set.call(this, val);
  }
};

/**
 * (For old IE.) Starts tracking propertychange events on the passed-in element
 * and override the value property so that we can distinguish user events from
 * value changes in JS.
 */
function startWatchingForValueChange(target, targetID) {
  activeElement = target;
  activeElementID = targetID;
  activeElementValue = target.value;
  activeElementValueProp = Object.getOwnPropertyDescriptor(target.constructor.prototype, 'value');

  // Not guarded in a canDefineProperty check: IE8 supports defineProperty only
  // on DOM elements
  Object.defineProperty(activeElement, 'value', newValueProp);
  activeElement.attachEvent('onpropertychange', handlePropertyChange);
}

/**
 * (For old IE.) Removes the event listeners from the currently-tracked element,
 * if any exists.
 */
function stopWatchingForValueChange() {
  if (!activeElement) {
    return;
  }

  // delete restores the original property definition
  delete activeElement.value;
  activeElement.detachEvent('onpropertychange', handlePropertyChange);

  activeElement = null;
  activeElementID = null;
  activeElementValue = null;
  activeElementValueProp = null;
}

/**
 * (For old IE.) Handles a propertychange event, sending a `change` event if
 * the value of the active element has changed.
 */
function handlePropertyChange(nativeEvent) {
  if (nativeEvent.propertyName !== 'value') {
    return;
  }
  var value = nativeEvent.srcElement.value;
  if (value === activeElementValue) {
    return;
  }
  activeElementValue = value;

  manualDispatchChangeEvent(nativeEvent);
}

/**
 * If a `change` event should be fired, returns the target's ID.
 */
function getTargetIDForInputEvent(topLevelType, topLevelTarget, topLevelTargetID) {
  if (topLevelType === topLevelTypes.topInput) {
    // In modern browsers (i.e., not IE8 or IE9), the input event is exactly
    // what we want so fall through here and trigger an abstract event
    return topLevelTargetID;
  }
}

// For IE8 and IE9.
function handleEventsForInputEventIE(topLevelType, topLevelTarget, topLevelTargetID) {
  if (topLevelType === topLevelTypes.topFocus) {
    // In IE8, we can capture almost all .value changes by adding a
    // propertychange handler and looking for events with propertyName
    // equal to 'value'
    // In IE9, propertychange fires for most input events but is buggy and
    // doesn't fire when text is deleted, but conveniently, selectionchange
    // appears to fire in all of the remaining cases so we catch those and
    // forward the event if the value has changed
    // In either case, we don't want to call the event handler if the value
    // is changed from JS so we redefine a setter for `.value` that updates
    // our activeElementValue variable, allowing us to ignore those changes
    //
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForValueChange();
    startWatchingForValueChange(topLevelTarget, topLevelTargetID);
  } else if (topLevelType === topLevelTypes.topBlur) {
    stopWatchingForValueChange();
  }
}

// For IE8 and IE9.
function getTargetIDForInputEventIE(topLevelType, topLevelTarget, topLevelTargetID) {
  if (topLevelType === topLevelTypes.topSelectionChange || topLevelType === topLevelTypes.topKeyUp || topLevelType === topLevelTypes.topKeyDown) {
    // On the selectionchange event, the target is just document which isn't
    // helpful for us so just check activeElement instead.
    //
    // 99% of the time, keydown and keyup aren't necessary. IE8 fails to fire
    // propertychange on the first input event after setting `value` from a
    // script and fires only keydown, keypress, keyup. Catching keyup usually
    // gets it and catching keydown lets us fire an event for the first
    // keystroke if user does a key repeat (it'll be a little delayed: right
    // before the second keystroke). Other input methods (e.g., paste) seem to
    // fire selectionchange normally.
    if (activeElement && activeElement.value !== activeElementValue) {
      activeElementValue = activeElement.value;
      return activeElementID;
    }
  }
}

/**
 * SECTION: handle `click` event
 */
function shouldUseClickEvent(elem) {
  // Use the `click` event to detect changes to checkbox and radio inputs.
  // This approach works across all browsers, whereas `change` does not fire
  // until `blur` in IE8.
  return elem.nodeName && elem.nodeName.toLowerCase() === 'input' && (elem.type === 'checkbox' || elem.type === 'radio');
}

function getTargetIDForClickEvent(topLevelType, topLevelTarget, topLevelTargetID) {
  if (topLevelType === topLevelTypes.topClick) {
    return topLevelTargetID;
  }
}

/**
 * This plugin creates an `onChange` event that normalizes change events
 * across form elements. This event fires at a time when it's possible to
 * change the element's value without seeing a flicker.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - select
 */
var ChangeEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function (topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {

    var getTargetIDFunc, handleEventFunc;
    if (shouldUseChangeEvent(topLevelTarget)) {
      if (doesChangeEventBubble) {
        getTargetIDFunc = getTargetIDForChangeEvent;
      } else {
        handleEventFunc = handleEventsForChangeEventIE8;
      }
    } else if (isTextInputElement(topLevelTarget)) {
      if (isInputEventSupported) {
        getTargetIDFunc = getTargetIDForInputEvent;
      } else {
        getTargetIDFunc = getTargetIDForInputEventIE;
        handleEventFunc = handleEventsForInputEventIE;
      }
    } else if (shouldUseClickEvent(topLevelTarget)) {
      getTargetIDFunc = getTargetIDForClickEvent;
    }

    if (getTargetIDFunc) {
      var targetID = getTargetIDFunc(topLevelType, topLevelTarget, topLevelTargetID);
      if (targetID) {
        var event = SyntheticEvent.getPooled(eventTypes.change, targetID, nativeEvent, nativeEventTarget);
        event.type = 'change';
        EventPropagators.accumulateTwoPhaseDispatches(event);
        return event;
      }
    }

    if (handleEventFunc) {
      handleEventFunc(topLevelType, topLevelTarget, topLevelTargetID);
    }
  }

};

module.exports = ChangeEventPlugin;
},{"./EventConstants":"/home/ec2-user/ksana2015/node_modules/react/lib/EventConstants.js","./EventPluginHub":"/home/ec2-user/ksana2015/node_modules/react/lib/EventPluginHub.js","./EventPropagators":"/home/ec2-user/ksana2015/node_modules/react/lib/EventPropagators.js","./ReactUpdates":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdates.js","./SyntheticEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticEvent.js","./getEventTarget":"/home/ec2-user/ksana2015/node_modules/react/lib/getEventTarget.js","./isEventSupported":"/home/ec2-user/ksana2015/node_modules/react/lib/isEventSupported.js","./isTextInputElement":"/home/ec2-user/ksana2015/node_modules/react/lib/isTextInputElement.js","fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js","fbjs/lib/keyOf":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyOf.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ClientReactRootIndex.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ClientReactRootIndex
 * @typechecks
 */

'use strict';

var nextReactRootIndex = 0;

var ClientReactRootIndex = {
  createReactRootIndex: function () {
    return nextReactRootIndex++;
  }
};

module.exports = ClientReactRootIndex;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/DOMChildrenOperations.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DOMChildrenOperations
 * @typechecks static-only
 */

'use strict';

var Danger = require('./Danger');
var ReactMultiChildUpdateTypes = require('./ReactMultiChildUpdateTypes');
var ReactPerf = require('./ReactPerf');

var setInnerHTML = require('./setInnerHTML');
var setTextContent = require('./setTextContent');
var invariant = require('fbjs/lib/invariant');

/**
 * Inserts `childNode` as a child of `parentNode` at the `index`.
 *
 * @param {DOMElement} parentNode Parent node in which to insert.
 * @param {DOMElement} childNode Child node to insert.
 * @param {number} index Index at which to insert the child.
 * @internal
 */
function insertChildAt(parentNode, childNode, index) {
  // By exploiting arrays returning `undefined` for an undefined index, we can
  // rely exclusively on `insertBefore(node, null)` instead of also using
  // `appendChild(node)`. However, using `undefined` is not allowed by all
  // browsers so we must replace it with `null`.

  // fix render order error in safari
  // IE8 will throw error when index out of list size.
  var beforeChild = index >= parentNode.childNodes.length ? null : parentNode.childNodes.item(index);

  parentNode.insertBefore(childNode, beforeChild);
}

/**
 * Operations for updating with DOM children.
 */
var DOMChildrenOperations = {

  dangerouslyReplaceNodeWithMarkup: Danger.dangerouslyReplaceNodeWithMarkup,

  updateTextContent: setTextContent,

  /**
   * Updates a component's children by processing a series of updates. The
   * update configurations are each expected to have a `parentNode` property.
   *
   * @param {array<object>} updates List of update configurations.
   * @param {array<string>} markupList List of markup strings.
   * @internal
   */
  processUpdates: function (updates, markupList) {
    var update;
    // Mapping from parent IDs to initial child orderings.
    var initialChildren = null;
    // List of children that will be moved or removed.
    var updatedChildren = null;

    for (var i = 0; i < updates.length; i++) {
      update = updates[i];
      if (update.type === ReactMultiChildUpdateTypes.MOVE_EXISTING || update.type === ReactMultiChildUpdateTypes.REMOVE_NODE) {
        var updatedIndex = update.fromIndex;
        var updatedChild = update.parentNode.childNodes[updatedIndex];
        var parentID = update.parentID;

        !updatedChild ? process.env.NODE_ENV !== 'production' ? invariant(false, 'processUpdates(): Unable to find child %s of element. This ' + 'probably means the DOM was unexpectedly mutated (e.g., by the ' + 'browser), usually due to forgetting a <tbody> when using tables, ' + 'nesting tags like <form>, <p>, or <a>, or using non-SVG elements ' + 'in an <svg> parent. Try inspecting the child nodes of the element ' + 'with React ID `%s`.', updatedIndex, parentID) : invariant(false) : undefined;

        initialChildren = initialChildren || {};
        initialChildren[parentID] = initialChildren[parentID] || [];
        initialChildren[parentID][updatedIndex] = updatedChild;

        updatedChildren = updatedChildren || [];
        updatedChildren.push(updatedChild);
      }
    }

    var renderedMarkup;
    // markupList is either a list of markup or just a list of elements
    if (markupList.length && typeof markupList[0] === 'string') {
      renderedMarkup = Danger.dangerouslyRenderMarkup(markupList);
    } else {
      renderedMarkup = markupList;
    }

    // Remove updated children first so that `toIndex` is consistent.
    if (updatedChildren) {
      for (var j = 0; j < updatedChildren.length; j++) {
        updatedChildren[j].parentNode.removeChild(updatedChildren[j]);
      }
    }

    for (var k = 0; k < updates.length; k++) {
      update = updates[k];
      switch (update.type) {
        case ReactMultiChildUpdateTypes.INSERT_MARKUP:
          insertChildAt(update.parentNode, renderedMarkup[update.markupIndex], update.toIndex);
          break;
        case ReactMultiChildUpdateTypes.MOVE_EXISTING:
          insertChildAt(update.parentNode, initialChildren[update.parentID][update.fromIndex], update.toIndex);
          break;
        case ReactMultiChildUpdateTypes.SET_MARKUP:
          setInnerHTML(update.parentNode, update.content);
          break;
        case ReactMultiChildUpdateTypes.TEXT_CONTENT:
          setTextContent(update.parentNode, update.content);
          break;
        case ReactMultiChildUpdateTypes.REMOVE_NODE:
          // Already removed by the for-loop above.
          break;
      }
    }
  }

};

ReactPerf.measureMethods(DOMChildrenOperations, 'DOMChildrenOperations', {
  updateTextContent: 'updateTextContent'
});

module.exports = DOMChildrenOperations;
},{"./Danger":"/home/ec2-user/ksana2015/node_modules/react/lib/Danger.js","./ReactMultiChildUpdateTypes":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMultiChildUpdateTypes.js","./ReactPerf":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPerf.js","./setInnerHTML":"/home/ec2-user/ksana2015/node_modules/react/lib/setInnerHTML.js","./setTextContent":"/home/ec2-user/ksana2015/node_modules/react/lib/setTextContent.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/DOMProperty.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DOMProperty
 * @typechecks static-only
 */

'use strict';

var invariant = require('fbjs/lib/invariant');

function checkMask(value, bitmask) {
  return (value & bitmask) === bitmask;
}

var DOMPropertyInjection = {
  /**
   * Mapping from normalized, camelcased property names to a configuration that
   * specifies how the associated DOM property should be accessed or rendered.
   */
  MUST_USE_ATTRIBUTE: 0x1,
  MUST_USE_PROPERTY: 0x2,
  HAS_SIDE_EFFECTS: 0x4,
  HAS_BOOLEAN_VALUE: 0x8,
  HAS_NUMERIC_VALUE: 0x10,
  HAS_POSITIVE_NUMERIC_VALUE: 0x20 | 0x10,
  HAS_OVERLOADED_BOOLEAN_VALUE: 0x40,

  /**
   * Inject some specialized knowledge about the DOM. This takes a config object
   * with the following properties:
   *
   * isCustomAttribute: function that given an attribute name will return true
   * if it can be inserted into the DOM verbatim. Useful for data-* or aria-*
   * attributes where it's impossible to enumerate all of the possible
   * attribute names,
   *
   * Properties: object mapping DOM property name to one of the
   * DOMPropertyInjection constants or null. If your attribute isn't in here,
   * it won't get written to the DOM.
   *
   * DOMAttributeNames: object mapping React attribute name to the DOM
   * attribute name. Attribute names not specified use the **lowercase**
   * normalized name.
   *
   * DOMAttributeNamespaces: object mapping React attribute name to the DOM
   * attribute namespace URL. (Attribute names not specified use no namespace.)
   *
   * DOMPropertyNames: similar to DOMAttributeNames but for DOM properties.
   * Property names not specified use the normalized name.
   *
   * DOMMutationMethods: Properties that require special mutation methods. If
   * `value` is undefined, the mutation method should unset the property.
   *
   * @param {object} domPropertyConfig the config as described above.
   */
  injectDOMPropertyConfig: function (domPropertyConfig) {
    var Injection = DOMPropertyInjection;
    var Properties = domPropertyConfig.Properties || {};
    var DOMAttributeNamespaces = domPropertyConfig.DOMAttributeNamespaces || {};
    var DOMAttributeNames = domPropertyConfig.DOMAttributeNames || {};
    var DOMPropertyNames = domPropertyConfig.DOMPropertyNames || {};
    var DOMMutationMethods = domPropertyConfig.DOMMutationMethods || {};

    if (domPropertyConfig.isCustomAttribute) {
      DOMProperty._isCustomAttributeFunctions.push(domPropertyConfig.isCustomAttribute);
    }

    for (var propName in Properties) {
      !!DOMProperty.properties.hasOwnProperty(propName) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'injectDOMPropertyConfig(...): You\'re trying to inject DOM property ' + '\'%s\' which has already been injected. You may be accidentally ' + 'injecting the same DOM property config twice, or you may be ' + 'injecting two configs that have conflicting property names.', propName) : invariant(false) : undefined;

      var lowerCased = propName.toLowerCase();
      var propConfig = Properties[propName];

      var propertyInfo = {
        attributeName: lowerCased,
        attributeNamespace: null,
        propertyName: propName,
        mutationMethod: null,

        mustUseAttribute: checkMask(propConfig, Injection.MUST_USE_ATTRIBUTE),
        mustUseProperty: checkMask(propConfig, Injection.MUST_USE_PROPERTY),
        hasSideEffects: checkMask(propConfig, Injection.HAS_SIDE_EFFECTS),
        hasBooleanValue: checkMask(propConfig, Injection.HAS_BOOLEAN_VALUE),
        hasNumericValue: checkMask(propConfig, Injection.HAS_NUMERIC_VALUE),
        hasPositiveNumericValue: checkMask(propConfig, Injection.HAS_POSITIVE_NUMERIC_VALUE),
        hasOverloadedBooleanValue: checkMask(propConfig, Injection.HAS_OVERLOADED_BOOLEAN_VALUE)
      };

      !(!propertyInfo.mustUseAttribute || !propertyInfo.mustUseProperty) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'DOMProperty: Cannot require using both attribute and property: %s', propName) : invariant(false) : undefined;
      !(propertyInfo.mustUseProperty || !propertyInfo.hasSideEffects) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'DOMProperty: Properties that have side effects must use property: %s', propName) : invariant(false) : undefined;
      !(propertyInfo.hasBooleanValue + propertyInfo.hasNumericValue + propertyInfo.hasOverloadedBooleanValue <= 1) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'DOMProperty: Value can be one of boolean, overloaded boolean, or ' + 'numeric value, but not a combination: %s', propName) : invariant(false) : undefined;

      if (process.env.NODE_ENV !== 'production') {
        DOMProperty.getPossibleStandardName[lowerCased] = propName;
      }

      if (DOMAttributeNames.hasOwnProperty(propName)) {
        var attributeName = DOMAttributeNames[propName];
        propertyInfo.attributeName = attributeName;
        if (process.env.NODE_ENV !== 'production') {
          DOMProperty.getPossibleStandardName[attributeName] = propName;
        }
      }

      if (DOMAttributeNamespaces.hasOwnProperty(propName)) {
        propertyInfo.attributeNamespace = DOMAttributeNamespaces[propName];
      }

      if (DOMPropertyNames.hasOwnProperty(propName)) {
        propertyInfo.propertyName = DOMPropertyNames[propName];
      }

      if (DOMMutationMethods.hasOwnProperty(propName)) {
        propertyInfo.mutationMethod = DOMMutationMethods[propName];
      }

      DOMProperty.properties[propName] = propertyInfo;
    }
  }
};
var defaultValueCache = {};

/**
 * DOMProperty exports lookup objects that can be used like functions:
 *
 *   > DOMProperty.isValid['id']
 *   true
 *   > DOMProperty.isValid['foobar']
 *   undefined
 *
 * Although this may be confusing, it performs better in general.
 *
 * @see http://jsperf.com/key-exists
 * @see http://jsperf.com/key-missing
 */
var DOMProperty = {

  ID_ATTRIBUTE_NAME: 'data-reactid',

  /**
   * Map from property "standard name" to an object with info about how to set
   * the property in the DOM. Each object contains:
   *
   * attributeName:
   *   Used when rendering markup or with `*Attribute()`.
   * attributeNamespace
   * propertyName:
   *   Used on DOM node instances. (This includes properties that mutate due to
   *   external factors.)
   * mutationMethod:
   *   If non-null, used instead of the property or `setAttribute()` after
   *   initial render.
   * mustUseAttribute:
   *   Whether the property must be accessed and mutated using `*Attribute()`.
   *   (This includes anything that fails `<propName> in <element>`.)
   * mustUseProperty:
   *   Whether the property must be accessed and mutated as an object property.
   * hasSideEffects:
   *   Whether or not setting a value causes side effects such as triggering
   *   resources to be loaded or text selection changes. If true, we read from
   *   the DOM before updating to ensure that the value is only set if it has
   *   changed.
   * hasBooleanValue:
   *   Whether the property should be removed when set to a falsey value.
   * hasNumericValue:
   *   Whether the property must be numeric or parse as a numeric and should be
   *   removed when set to a falsey value.
   * hasPositiveNumericValue:
   *   Whether the property must be positive numeric or parse as a positive
   *   numeric and should be removed when set to a falsey value.
   * hasOverloadedBooleanValue:
   *   Whether the property can be used as a flag as well as with a value.
   *   Removed when strictly equal to false; present without a value when
   *   strictly equal to true; present with a value otherwise.
   */
  properties: {},

  /**
   * Mapping from lowercase property names to the properly cased version, used
   * to warn in the case of missing properties. Available only in __DEV__.
   * @type {Object}
   */
  getPossibleStandardName: process.env.NODE_ENV !== 'production' ? {} : null,

  /**
   * All of the isCustomAttribute() functions that have been injected.
   */
  _isCustomAttributeFunctions: [],

  /**
   * Checks whether a property name is a custom attribute.
   * @method
   */
  isCustomAttribute: function (attributeName) {
    for (var i = 0; i < DOMProperty._isCustomAttributeFunctions.length; i++) {
      var isCustomAttributeFn = DOMProperty._isCustomAttributeFunctions[i];
      if (isCustomAttributeFn(attributeName)) {
        return true;
      }
    }
    return false;
  },

  /**
   * Returns the default property value for a DOM property (i.e., not an
   * attribute). Most default values are '' or false, but not all. Worse yet,
   * some (in particular, `type`) vary depending on the type of element.
   *
   * TODO: Is it better to grab all the possible properties when creating an
   * element to avoid having to create the same element twice?
   */
  getDefaultValueForProperty: function (nodeName, prop) {
    var nodeDefaults = defaultValueCache[nodeName];
    var testElement;
    if (!nodeDefaults) {
      defaultValueCache[nodeName] = nodeDefaults = {};
    }
    if (!(prop in nodeDefaults)) {
      testElement = document.createElement(nodeName);
      nodeDefaults[prop] = testElement[prop];
    }
    return nodeDefaults[prop];
  },

  injection: DOMPropertyInjection
};

module.exports = DOMProperty;
},{"fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/DOMPropertyOperations.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DOMPropertyOperations
 * @typechecks static-only
 */

'use strict';

var DOMProperty = require('./DOMProperty');
var ReactPerf = require('./ReactPerf');

var quoteAttributeValueForBrowser = require('./quoteAttributeValueForBrowser');
var warning = require('fbjs/lib/warning');

// Simplified subset
var VALID_ATTRIBUTE_NAME_REGEX = /^[a-zA-Z_][\w\.\-]*$/;
var illegalAttributeNameCache = {};
var validatedAttributeNameCache = {};

function isAttributeNameSafe(attributeName) {
  if (validatedAttributeNameCache.hasOwnProperty(attributeName)) {
    return true;
  }
  if (illegalAttributeNameCache.hasOwnProperty(attributeName)) {
    return false;
  }
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
    validatedAttributeNameCache[attributeName] = true;
    return true;
  }
  illegalAttributeNameCache[attributeName] = true;
  process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid attribute name: `%s`', attributeName) : undefined;
  return false;
}

function shouldIgnoreValue(propertyInfo, value) {
  return value == null || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && isNaN(value) || propertyInfo.hasPositiveNumericValue && value < 1 || propertyInfo.hasOverloadedBooleanValue && value === false;
}

if (process.env.NODE_ENV !== 'production') {
  var reactProps = {
    children: true,
    dangerouslySetInnerHTML: true,
    key: true,
    ref: true
  };
  var warnedProperties = {};

  var warnUnknownProperty = function (name) {
    if (reactProps.hasOwnProperty(name) && reactProps[name] || warnedProperties.hasOwnProperty(name) && warnedProperties[name]) {
      return;
    }

    warnedProperties[name] = true;
    var lowerCasedName = name.toLowerCase();

    // data-* attributes should be lowercase; suggest the lowercase version
    var standardName = DOMProperty.isCustomAttribute(lowerCasedName) ? lowerCasedName : DOMProperty.getPossibleStandardName.hasOwnProperty(lowerCasedName) ? DOMProperty.getPossibleStandardName[lowerCasedName] : null;

    // For now, only warn when we have a suggested correction. This prevents
    // logging too much when using transferPropsTo.
    process.env.NODE_ENV !== 'production' ? warning(standardName == null, 'Unknown DOM property %s. Did you mean %s?', name, standardName) : undefined;
  };
}

/**
 * Operations for dealing with DOM properties.
 */
var DOMPropertyOperations = {

  /**
   * Creates markup for the ID property.
   *
   * @param {string} id Unescaped ID.
   * @return {string} Markup string.
   */
  createMarkupForID: function (id) {
    return DOMProperty.ID_ATTRIBUTE_NAME + '=' + quoteAttributeValueForBrowser(id);
  },

  setAttributeForID: function (node, id) {
    node.setAttribute(DOMProperty.ID_ATTRIBUTE_NAME, id);
  },

  /**
   * Creates markup for a property.
   *
   * @param {string} name
   * @param {*} value
   * @return {?string} Markup string, or null if the property was invalid.
   */
  createMarkupForProperty: function (name, value) {
    var propertyInfo = DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;
    if (propertyInfo) {
      if (shouldIgnoreValue(propertyInfo, value)) {
        return '';
      }
      var attributeName = propertyInfo.attributeName;
      if (propertyInfo.hasBooleanValue || propertyInfo.hasOverloadedBooleanValue && value === true) {
        return attributeName + '=""';
      }
      return attributeName + '=' + quoteAttributeValueForBrowser(value);
    } else if (DOMProperty.isCustomAttribute(name)) {
      if (value == null) {
        return '';
      }
      return name + '=' + quoteAttributeValueForBrowser(value);
    } else if (process.env.NODE_ENV !== 'production') {
      warnUnknownProperty(name);
    }
    return null;
  },

  /**
   * Creates markup for a custom property.
   *
   * @param {string} name
   * @param {*} value
   * @return {string} Markup string, or empty string if the property was invalid.
   */
  createMarkupForCustomAttribute: function (name, value) {
    if (!isAttributeNameSafe(name) || value == null) {
      return '';
    }
    return name + '=' + quoteAttributeValueForBrowser(value);
  },

  /**
   * Sets the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   * @param {*} value
   */
  setValueForProperty: function (node, name, value) {
    var propertyInfo = DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;
    if (propertyInfo) {
      var mutationMethod = propertyInfo.mutationMethod;
      if (mutationMethod) {
        mutationMethod(node, value);
      } else if (shouldIgnoreValue(propertyInfo, value)) {
        this.deleteValueForProperty(node, name);
      } else if (propertyInfo.mustUseAttribute) {
        var attributeName = propertyInfo.attributeName;
        var namespace = propertyInfo.attributeNamespace;
        // `setAttribute` with objects becomes only `[object]` in IE8/9,
        // ('' + value) makes it output the correct toString()-value.
        if (namespace) {
          node.setAttributeNS(namespace, attributeName, '' + value);
        } else if (propertyInfo.hasBooleanValue || propertyInfo.hasOverloadedBooleanValue && value === true) {
          node.setAttribute(attributeName, '');
        } else {
          node.setAttribute(attributeName, '' + value);
        }
      } else {
        var propName = propertyInfo.propertyName;
        // Must explicitly cast values for HAS_SIDE_EFFECTS-properties to the
        // property type before comparing; only `value` does and is string.
        if (!propertyInfo.hasSideEffects || '' + node[propName] !== '' + value) {
          // Contrary to `setAttribute`, object properties are properly
          // `toString`ed by IE8/9.
          node[propName] = value;
        }
      }
    } else if (DOMProperty.isCustomAttribute(name)) {
      DOMPropertyOperations.setValueForAttribute(node, name, value);
    } else if (process.env.NODE_ENV !== 'production') {
      warnUnknownProperty(name);
    }
  },

  setValueForAttribute: function (node, name, value) {
    if (!isAttributeNameSafe(name)) {
      return;
    }
    if (value == null) {
      node.removeAttribute(name);
    } else {
      node.setAttribute(name, '' + value);
    }
  },

  /**
   * Deletes the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   */
  deleteValueForProperty: function (node, name) {
    var propertyInfo = DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;
    if (propertyInfo) {
      var mutationMethod = propertyInfo.mutationMethod;
      if (mutationMethod) {
        mutationMethod(node, undefined);
      } else if (propertyInfo.mustUseAttribute) {
        node.removeAttribute(propertyInfo.attributeName);
      } else {
        var propName = propertyInfo.propertyName;
        var defaultValue = DOMProperty.getDefaultValueForProperty(node.nodeName, propName);
        if (!propertyInfo.hasSideEffects || '' + node[propName] !== defaultValue) {
          node[propName] = defaultValue;
        }
      }
    } else if (DOMProperty.isCustomAttribute(name)) {
      node.removeAttribute(name);
    } else if (process.env.NODE_ENV !== 'production') {
      warnUnknownProperty(name);
    }
  }

};

ReactPerf.measureMethods(DOMPropertyOperations, 'DOMPropertyOperations', {
  setValueForProperty: 'setValueForProperty',
  setValueForAttribute: 'setValueForAttribute',
  deleteValueForProperty: 'deleteValueForProperty'
});

module.exports = DOMPropertyOperations;
},{"./DOMProperty":"/home/ec2-user/ksana2015/node_modules/react/lib/DOMProperty.js","./ReactPerf":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPerf.js","./quoteAttributeValueForBrowser":"/home/ec2-user/ksana2015/node_modules/react/lib/quoteAttributeValueForBrowser.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/Danger.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Danger
 * @typechecks static-only
 */

'use strict';

var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');

var createNodesFromMarkup = require('fbjs/lib/createNodesFromMarkup');
var emptyFunction = require('fbjs/lib/emptyFunction');
var getMarkupWrap = require('fbjs/lib/getMarkupWrap');
var invariant = require('fbjs/lib/invariant');

var OPEN_TAG_NAME_EXP = /^(<[^ \/>]+)/;
var RESULT_INDEX_ATTR = 'data-danger-index';

/**
 * Extracts the `nodeName` from a string of markup.
 *
 * NOTE: Extracting the `nodeName` does not require a regular expression match
 * because we make assumptions about React-generated markup (i.e. there are no
 * spaces surrounding the opening tag and there is at least one attribute).
 *
 * @param {string} markup String of markup.
 * @return {string} Node name of the supplied markup.
 * @see http://jsperf.com/extract-nodename
 */
function getNodeName(markup) {
  return markup.substring(1, markup.indexOf(' '));
}

var Danger = {

  /**
   * Renders markup into an array of nodes. The markup is expected to render
   * into a list of root nodes. Also, the length of `resultList` and
   * `markupList` should be the same.
   *
   * @param {array<string>} markupList List of markup strings to render.
   * @return {array<DOMElement>} List of rendered nodes.
   * @internal
   */
  dangerouslyRenderMarkup: function (markupList) {
    !ExecutionEnvironment.canUseDOM ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyRenderMarkup(...): Cannot render markup in a worker ' + 'thread. Make sure `window` and `document` are available globally ' + 'before requiring React when unit testing or use ' + 'ReactDOMServer.renderToString for server rendering.') : invariant(false) : undefined;
    var nodeName;
    var markupByNodeName = {};
    // Group markup by `nodeName` if a wrap is necessary, else by '*'.
    for (var i = 0; i < markupList.length; i++) {
      !markupList[i] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyRenderMarkup(...): Missing markup.') : invariant(false) : undefined;
      nodeName = getNodeName(markupList[i]);
      nodeName = getMarkupWrap(nodeName) ? nodeName : '*';
      markupByNodeName[nodeName] = markupByNodeName[nodeName] || [];
      markupByNodeName[nodeName][i] = markupList[i];
    }
    var resultList = [];
    var resultListAssignmentCount = 0;
    for (nodeName in markupByNodeName) {
      if (!markupByNodeName.hasOwnProperty(nodeName)) {
        continue;
      }
      var markupListByNodeName = markupByNodeName[nodeName];

      // This for-in loop skips the holes of the sparse array. The order of
      // iteration should follow the order of assignment, which happens to match
      // numerical index order, but we don't rely on that.
      var resultIndex;
      for (resultIndex in markupListByNodeName) {
        if (markupListByNodeName.hasOwnProperty(resultIndex)) {
          var markup = markupListByNodeName[resultIndex];

          // Push the requested markup with an additional RESULT_INDEX_ATTR
          // attribute.  If the markup does not start with a < character, it
          // will be discarded below (with an appropriate console.error).
          markupListByNodeName[resultIndex] = markup.replace(OPEN_TAG_NAME_EXP,
          // This index will be parsed back out below.
          '$1 ' + RESULT_INDEX_ATTR + '="' + resultIndex + '" ');
        }
      }

      // Render each group of markup with similar wrapping `nodeName`.
      var renderNodes = createNodesFromMarkup(markupListByNodeName.join(''), emptyFunction // Do nothing special with <script> tags.
      );

      for (var j = 0; j < renderNodes.length; ++j) {
        var renderNode = renderNodes[j];
        if (renderNode.hasAttribute && renderNode.hasAttribute(RESULT_INDEX_ATTR)) {

          resultIndex = +renderNode.getAttribute(RESULT_INDEX_ATTR);
          renderNode.removeAttribute(RESULT_INDEX_ATTR);

          !!resultList.hasOwnProperty(resultIndex) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Danger: Assigning to an already-occupied result index.') : invariant(false) : undefined;

          resultList[resultIndex] = renderNode;

          // This should match resultList.length and markupList.length when
          // we're done.
          resultListAssignmentCount += 1;
        } else if (process.env.NODE_ENV !== 'production') {
          console.error('Danger: Discarding unexpected node:', renderNode);
        }
      }
    }

    // Although resultList was populated out of order, it should now be a dense
    // array.
    !(resultListAssignmentCount === resultList.length) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Danger: Did not assign to every index of resultList.') : invariant(false) : undefined;

    !(resultList.length === markupList.length) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Danger: Expected markup to render %s nodes, but rendered %s.', markupList.length, resultList.length) : invariant(false) : undefined;

    return resultList;
  },

  /**
   * Replaces a node with a string of markup at its current position within its
   * parent. The markup must render into a single root node.
   *
   * @param {DOMElement} oldChild Child node to replace.
   * @param {string} markup Markup to render in place of the child node.
   * @internal
   */
  dangerouslyReplaceNodeWithMarkup: function (oldChild, markup) {
    !ExecutionEnvironment.canUseDOM ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyReplaceNodeWithMarkup(...): Cannot render markup in a ' + 'worker thread. Make sure `window` and `document` are available ' + 'globally before requiring React when unit testing or use ' + 'ReactDOMServer.renderToString() for server rendering.') : invariant(false) : undefined;
    !markup ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyReplaceNodeWithMarkup(...): Missing markup.') : invariant(false) : undefined;
    !(oldChild.tagName.toLowerCase() !== 'html') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyReplaceNodeWithMarkup(...): Cannot replace markup of the ' + '<html> node. This is because browser quirks make this unreliable ' + 'and/or slow. If you want to render to the root you must use ' + 'server rendering. See ReactDOMServer.renderToString().') : invariant(false) : undefined;

    var newChild;
    if (typeof markup === 'string') {
      newChild = createNodesFromMarkup(markup, emptyFunction)[0];
    } else {
      newChild = markup;
    }
    oldChild.parentNode.replaceChild(newChild, oldChild);
  }

};

module.exports = Danger;
},{"fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js","fbjs/lib/createNodesFromMarkup":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/createNodesFromMarkup.js","fbjs/lib/emptyFunction":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyFunction.js","fbjs/lib/getMarkupWrap":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/getMarkupWrap.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/DefaultEventPluginOrder.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DefaultEventPluginOrder
 */

'use strict';

var keyOf = require('fbjs/lib/keyOf');

/**
 * Module that is injectable into `EventPluginHub`, that specifies a
 * deterministic ordering of `EventPlugin`s. A convenient way to reason about
 * plugins, without having to package every one of them. This is better than
 * having plugins be ordered in the same order that they are injected because
 * that ordering would be influenced by the packaging order.
 * `ResponderEventPlugin` must occur before `SimpleEventPlugin` so that
 * preventing default on events is convenient in `SimpleEventPlugin` handlers.
 */
var DefaultEventPluginOrder = [keyOf({ ResponderEventPlugin: null }), keyOf({ SimpleEventPlugin: null }), keyOf({ TapEventPlugin: null }), keyOf({ EnterLeaveEventPlugin: null }), keyOf({ ChangeEventPlugin: null }), keyOf({ SelectEventPlugin: null }), keyOf({ BeforeInputEventPlugin: null })];

module.exports = DefaultEventPluginOrder;
},{"fbjs/lib/keyOf":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyOf.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/EnterLeaveEventPlugin.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EnterLeaveEventPlugin
 * @typechecks static-only
 */

'use strict';

var EventConstants = require('./EventConstants');
var EventPropagators = require('./EventPropagators');
var SyntheticMouseEvent = require('./SyntheticMouseEvent');

var ReactMount = require('./ReactMount');
var keyOf = require('fbjs/lib/keyOf');

var topLevelTypes = EventConstants.topLevelTypes;
var getFirstReactDOM = ReactMount.getFirstReactDOM;

var eventTypes = {
  mouseEnter: {
    registrationName: keyOf({ onMouseEnter: null }),
    dependencies: [topLevelTypes.topMouseOut, topLevelTypes.topMouseOver]
  },
  mouseLeave: {
    registrationName: keyOf({ onMouseLeave: null }),
    dependencies: [topLevelTypes.topMouseOut, topLevelTypes.topMouseOver]
  }
};

var extractedEvents = [null, null];

var EnterLeaveEventPlugin = {

  eventTypes: eventTypes,

  /**
   * For almost every interaction we care about, there will be both a top-level
   * `mouseover` and `mouseout` event that occurs. Only use `mouseout` so that
   * we do not extract duplicate events. However, moving the mouse into the
   * browser from outside will not fire a `mouseout` event. In this case, we use
   * the `mouseover` top-level event.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function (topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
    if (topLevelType === topLevelTypes.topMouseOver && (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
      return null;
    }
    if (topLevelType !== topLevelTypes.topMouseOut && topLevelType !== topLevelTypes.topMouseOver) {
      // Must not be a mouse in or mouse out - ignoring.
      return null;
    }

    var win;
    if (topLevelTarget.window === topLevelTarget) {
      // `topLevelTarget` is probably a window object.
      win = topLevelTarget;
    } else {
      // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
      var doc = topLevelTarget.ownerDocument;
      if (doc) {
        win = doc.defaultView || doc.parentWindow;
      } else {
        win = window;
      }
    }

    var from;
    var to;
    var fromID = '';
    var toID = '';
    if (topLevelType === topLevelTypes.topMouseOut) {
      from = topLevelTarget;
      fromID = topLevelTargetID;
      to = getFirstReactDOM(nativeEvent.relatedTarget || nativeEvent.toElement);
      if (to) {
        toID = ReactMount.getID(to);
      } else {
        to = win;
      }
      to = to || win;
    } else {
      from = win;
      to = topLevelTarget;
      toID = topLevelTargetID;
    }

    if (from === to) {
      // Nothing pertains to our managed components.
      return null;
    }

    var leave = SyntheticMouseEvent.getPooled(eventTypes.mouseLeave, fromID, nativeEvent, nativeEventTarget);
    leave.type = 'mouseleave';
    leave.target = from;
    leave.relatedTarget = to;

    var enter = SyntheticMouseEvent.getPooled(eventTypes.mouseEnter, toID, nativeEvent, nativeEventTarget);
    enter.type = 'mouseenter';
    enter.target = to;
    enter.relatedTarget = from;

    EventPropagators.accumulateEnterLeaveDispatches(leave, enter, fromID, toID);

    extractedEvents[0] = leave;
    extractedEvents[1] = enter;

    return extractedEvents;
  }

};

module.exports = EnterLeaveEventPlugin;
},{"./EventConstants":"/home/ec2-user/ksana2015/node_modules/react/lib/EventConstants.js","./EventPropagators":"/home/ec2-user/ksana2015/node_modules/react/lib/EventPropagators.js","./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js","./SyntheticMouseEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticMouseEvent.js","fbjs/lib/keyOf":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyOf.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/EventConstants.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EventConstants
 */

'use strict';

var keyMirror = require('fbjs/lib/keyMirror');

var PropagationPhases = keyMirror({ bubbled: null, captured: null });

/**
 * Types of raw signals from the browser caught at the top level.
 */
var topLevelTypes = keyMirror({
  topAbort: null,
  topBlur: null,
  topCanPlay: null,
  topCanPlayThrough: null,
  topChange: null,
  topClick: null,
  topCompositionEnd: null,
  topCompositionStart: null,
  topCompositionUpdate: null,
  topContextMenu: null,
  topCopy: null,
  topCut: null,
  topDoubleClick: null,
  topDrag: null,
  topDragEnd: null,
  topDragEnter: null,
  topDragExit: null,
  topDragLeave: null,
  topDragOver: null,
  topDragStart: null,
  topDrop: null,
  topDurationChange: null,
  topEmptied: null,
  topEncrypted: null,
  topEnded: null,
  topError: null,
  topFocus: null,
  topInput: null,
  topKeyDown: null,
  topKeyPress: null,
  topKeyUp: null,
  topLoad: null,
  topLoadedData: null,
  topLoadedMetadata: null,
  topLoadStart: null,
  topMouseDown: null,
  topMouseMove: null,
  topMouseOut: null,
  topMouseOver: null,
  topMouseUp: null,
  topPaste: null,
  topPause: null,
  topPlay: null,
  topPlaying: null,
  topProgress: null,
  topRateChange: null,
  topReset: null,
  topScroll: null,
  topSeeked: null,
  topSeeking: null,
  topSelectionChange: null,
  topStalled: null,
  topSubmit: null,
  topSuspend: null,
  topTextInput: null,
  topTimeUpdate: null,
  topTouchCancel: null,
  topTouchEnd: null,
  topTouchMove: null,
  topTouchStart: null,
  topVolumeChange: null,
  topWaiting: null,
  topWheel: null
});

var EventConstants = {
  topLevelTypes: topLevelTypes,
  PropagationPhases: PropagationPhases
};

module.exports = EventConstants;
},{"fbjs/lib/keyMirror":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyMirror.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/EventPluginHub.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EventPluginHub
 */

'use strict';

var EventPluginRegistry = require('./EventPluginRegistry');
var EventPluginUtils = require('./EventPluginUtils');
var ReactErrorUtils = require('./ReactErrorUtils');

var accumulateInto = require('./accumulateInto');
var forEachAccumulated = require('./forEachAccumulated');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

/**
 * Internal store for event listeners
 */
var listenerBank = {};

/**
 * Internal queue of events that have accumulated their dispatches and are
 * waiting to have their dispatches executed.
 */
var eventQueue = null;

/**
 * Dispatches an event and releases it back into the pool, unless persistent.
 *
 * @param {?object} event Synthetic event to be dispatched.
 * @param {boolean} simulated If the event is simulated (changes exn behavior)
 * @private
 */
var executeDispatchesAndRelease = function (event, simulated) {
  if (event) {
    EventPluginUtils.executeDispatchesInOrder(event, simulated);

    if (!event.isPersistent()) {
      event.constructor.release(event);
    }
  }
};
var executeDispatchesAndReleaseSimulated = function (e) {
  return executeDispatchesAndRelease(e, true);
};
var executeDispatchesAndReleaseTopLevel = function (e) {
  return executeDispatchesAndRelease(e, false);
};

/**
 * - `InstanceHandle`: [required] Module that performs logical traversals of DOM
 *   hierarchy given ids of the logical DOM elements involved.
 */
var InstanceHandle = null;

function validateInstanceHandle() {
  var valid = InstanceHandle && InstanceHandle.traverseTwoPhase && InstanceHandle.traverseEnterLeave;
  process.env.NODE_ENV !== 'production' ? warning(valid, 'InstanceHandle not injected before use!') : undefined;
}

/**
 * This is a unified interface for event plugins to be installed and configured.
 *
 * Event plugins can implement the following properties:
 *
 *   `extractEvents` {function(string, DOMEventTarget, string, object): *}
 *     Required. When a top-level event is fired, this method is expected to
 *     extract synthetic events that will in turn be queued and dispatched.
 *
 *   `eventTypes` {object}
 *     Optional, plugins that fire events must publish a mapping of registration
 *     names that are used to register listeners. Values of this mapping must
 *     be objects that contain `registrationName` or `phasedRegistrationNames`.
 *
 *   `executeDispatch` {function(object, function, string)}
 *     Optional, allows plugins to override how an event gets dispatched. By
 *     default, the listener is simply invoked.
 *
 * Each plugin that is injected into `EventsPluginHub` is immediately operable.
 *
 * @public
 */
var EventPluginHub = {

  /**
   * Methods for injecting dependencies.
   */
  injection: {

    /**
     * @param {object} InjectedMount
     * @public
     */
    injectMount: EventPluginUtils.injection.injectMount,

    /**
     * @param {object} InjectedInstanceHandle
     * @public
     */
    injectInstanceHandle: function (InjectedInstanceHandle) {
      InstanceHandle = InjectedInstanceHandle;
      if (process.env.NODE_ENV !== 'production') {
        validateInstanceHandle();
      }
    },

    getInstanceHandle: function () {
      if (process.env.NODE_ENV !== 'production') {
        validateInstanceHandle();
      }
      return InstanceHandle;
    },

    /**
     * @param {array} InjectedEventPluginOrder
     * @public
     */
    injectEventPluginOrder: EventPluginRegistry.injectEventPluginOrder,

    /**
     * @param {object} injectedNamesToPlugins Map from names to plugin modules.
     */
    injectEventPluginsByName: EventPluginRegistry.injectEventPluginsByName

  },

  eventNameDispatchConfigs: EventPluginRegistry.eventNameDispatchConfigs,

  registrationNameModules: EventPluginRegistry.registrationNameModules,

  /**
   * Stores `listener` at `listenerBank[registrationName][id]`. Is idempotent.
   *
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {?function} listener The callback to store.
   */
  putListener: function (id, registrationName, listener) {
    !(typeof listener === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Expected %s listener to be a function, instead got type %s', registrationName, typeof listener) : invariant(false) : undefined;

    var bankForRegistrationName = listenerBank[registrationName] || (listenerBank[registrationName] = {});
    bankForRegistrationName[id] = listener;

    var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];
    if (PluginModule && PluginModule.didPutListener) {
      PluginModule.didPutListener(id, registrationName, listener);
    }
  },

  /**
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @return {?function} The stored callback.
   */
  getListener: function (id, registrationName) {
    var bankForRegistrationName = listenerBank[registrationName];
    return bankForRegistrationName && bankForRegistrationName[id];
  },

  /**
   * Deletes a listener from the registration bank.
   *
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   */
  deleteListener: function (id, registrationName) {
    var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];
    if (PluginModule && PluginModule.willDeleteListener) {
      PluginModule.willDeleteListener(id, registrationName);
    }

    var bankForRegistrationName = listenerBank[registrationName];
    // TODO: This should never be null -- when is it?
    if (bankForRegistrationName) {
      delete bankForRegistrationName[id];
    }
  },

  /**
   * Deletes all listeners for the DOM element with the supplied ID.
   *
   * @param {string} id ID of the DOM element.
   */
  deleteAllListeners: function (id) {
    for (var registrationName in listenerBank) {
      if (!listenerBank[registrationName][id]) {
        continue;
      }

      var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];
      if (PluginModule && PluginModule.willDeleteListener) {
        PluginModule.willDeleteListener(id, registrationName);
      }

      delete listenerBank[registrationName][id];
    }
  },

  /**
   * Allows registered plugins an opportunity to extract events from top-level
   * native browser events.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @internal
   */
  extractEvents: function (topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
    var events;
    var plugins = EventPluginRegistry.plugins;
    for (var i = 0; i < plugins.length; i++) {
      // Not every plugin in the ordering may be loaded at runtime.
      var possiblePlugin = plugins[i];
      if (possiblePlugin) {
        var extractedEvents = possiblePlugin.extractEvents(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget);
        if (extractedEvents) {
          events = accumulateInto(events, extractedEvents);
        }
      }
    }
    return events;
  },

  /**
   * Enqueues a synthetic event that should be dispatched when
   * `processEventQueue` is invoked.
   *
   * @param {*} events An accumulation of synthetic events.
   * @internal
   */
  enqueueEvents: function (events) {
    if (events) {
      eventQueue = accumulateInto(eventQueue, events);
    }
  },

  /**
   * Dispatches all synthetic events on the event queue.
   *
   * @internal
   */
  processEventQueue: function (simulated) {
    // Set `eventQueue` to null before processing it so that we can tell if more
    // events get enqueued while processing.
    var processingEventQueue = eventQueue;
    eventQueue = null;
    if (simulated) {
      forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseSimulated);
    } else {
      forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);
    }
    !!eventQueue ? process.env.NODE_ENV !== 'production' ? invariant(false, 'processEventQueue(): Additional events were enqueued while processing ' + 'an event queue. Support for this has not yet been implemented.') : invariant(false) : undefined;
    // This would be a good time to rethrow if any of the event handlers threw.
    ReactErrorUtils.rethrowCaughtError();
  },

  /**
   * These are needed for tests only. Do not use!
   */
  __purge: function () {
    listenerBank = {};
  },

  __getListenerBank: function () {
    return listenerBank;
  }

};

module.exports = EventPluginHub;
},{"./EventPluginRegistry":"/home/ec2-user/ksana2015/node_modules/react/lib/EventPluginRegistry.js","./EventPluginUtils":"/home/ec2-user/ksana2015/node_modules/react/lib/EventPluginUtils.js","./ReactErrorUtils":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactErrorUtils.js","./accumulateInto":"/home/ec2-user/ksana2015/node_modules/react/lib/accumulateInto.js","./forEachAccumulated":"/home/ec2-user/ksana2015/node_modules/react/lib/forEachAccumulated.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/EventPluginRegistry.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EventPluginRegistry
 * @typechecks static-only
 */

'use strict';

var invariant = require('fbjs/lib/invariant');

/**
 * Injectable ordering of event plugins.
 */
var EventPluginOrder = null;

/**
 * Injectable mapping from names to event plugin modules.
 */
var namesToPlugins = {};

/**
 * Recomputes the plugin list using the injected plugins and plugin ordering.
 *
 * @private
 */
function recomputePluginOrdering() {
  if (!EventPluginOrder) {
    // Wait until an `EventPluginOrder` is injected.
    return;
  }
  for (var pluginName in namesToPlugins) {
    var PluginModule = namesToPlugins[pluginName];
    var pluginIndex = EventPluginOrder.indexOf(pluginName);
    !(pluginIndex > -1) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Cannot inject event plugins that do not exist in ' + 'the plugin ordering, `%s`.', pluginName) : invariant(false) : undefined;
    if (EventPluginRegistry.plugins[pluginIndex]) {
      continue;
    }
    !PluginModule.extractEvents ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Event plugins must implement an `extractEvents` ' + 'method, but `%s` does not.', pluginName) : invariant(false) : undefined;
    EventPluginRegistry.plugins[pluginIndex] = PluginModule;
    var publishedEvents = PluginModule.eventTypes;
    for (var eventName in publishedEvents) {
      !publishEventForPlugin(publishedEvents[eventName], PluginModule, eventName) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.', eventName, pluginName) : invariant(false) : undefined;
    }
  }
}

/**
 * Publishes an event so that it can be dispatched by the supplied plugin.
 *
 * @param {object} dispatchConfig Dispatch configuration for the event.
 * @param {object} PluginModule Plugin publishing the event.
 * @return {boolean} True if the event was successfully published.
 * @private
 */
function publishEventForPlugin(dispatchConfig, PluginModule, eventName) {
  !!EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginHub: More than one plugin attempted to publish the same ' + 'event name, `%s`.', eventName) : invariant(false) : undefined;
  EventPluginRegistry.eventNameDispatchConfigs[eventName] = dispatchConfig;

  var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
  if (phasedRegistrationNames) {
    for (var phaseName in phasedRegistrationNames) {
      if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
        var phasedRegistrationName = phasedRegistrationNames[phaseName];
        publishRegistrationName(phasedRegistrationName, PluginModule, eventName);
      }
    }
    return true;
  } else if (dispatchConfig.registrationName) {
    publishRegistrationName(dispatchConfig.registrationName, PluginModule, eventName);
    return true;
  }
  return false;
}

/**
 * Publishes a registration name that is used to identify dispatched events and
 * can be used with `EventPluginHub.putListener` to register listeners.
 *
 * @param {string} registrationName Registration name to add.
 * @param {object} PluginModule Plugin publishing the event.
 * @private
 */
function publishRegistrationName(registrationName, PluginModule, eventName) {
  !!EventPluginRegistry.registrationNameModules[registrationName] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginHub: More than one plugin attempted to publish the same ' + 'registration name, `%s`.', registrationName) : invariant(false) : undefined;
  EventPluginRegistry.registrationNameModules[registrationName] = PluginModule;
  EventPluginRegistry.registrationNameDependencies[registrationName] = PluginModule.eventTypes[eventName].dependencies;
}

/**
 * Registers plugins so that they can extract and dispatch events.
 *
 * @see {EventPluginHub}
 */
var EventPluginRegistry = {

  /**
   * Ordered list of injected plugins.
   */
  plugins: [],

  /**
   * Mapping from event name to dispatch config
   */
  eventNameDispatchConfigs: {},

  /**
   * Mapping from registration name to plugin module
   */
  registrationNameModules: {},

  /**
   * Mapping from registration name to event name
   */
  registrationNameDependencies: {},

  /**
   * Injects an ordering of plugins (by plugin name). This allows the ordering
   * to be decoupled from injection of the actual plugins so that ordering is
   * always deterministic regardless of packaging, on-the-fly injection, etc.
   *
   * @param {array} InjectedEventPluginOrder
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginOrder}
   */
  injectEventPluginOrder: function (InjectedEventPluginOrder) {
    !!EventPluginOrder ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Cannot inject event plugin ordering more than ' + 'once. You are likely trying to load more than one copy of React.') : invariant(false) : undefined;
    // Clone the ordering so it cannot be dynamically mutated.
    EventPluginOrder = Array.prototype.slice.call(InjectedEventPluginOrder);
    recomputePluginOrdering();
  },

  /**
   * Injects plugins to be used by `EventPluginHub`. The plugin names must be
   * in the ordering injected by `injectEventPluginOrder`.
   *
   * Plugins can be injected as part of page initialization or on-the-fly.
   *
   * @param {object} injectedNamesToPlugins Map from names to plugin modules.
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginsByName}
   */
  injectEventPluginsByName: function (injectedNamesToPlugins) {
    var isOrderingDirty = false;
    for (var pluginName in injectedNamesToPlugins) {
      if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
        continue;
      }
      var PluginModule = injectedNamesToPlugins[pluginName];
      if (!namesToPlugins.hasOwnProperty(pluginName) || namesToPlugins[pluginName] !== PluginModule) {
        !!namesToPlugins[pluginName] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Cannot inject two different event plugins ' + 'using the same name, `%s`.', pluginName) : invariant(false) : undefined;
        namesToPlugins[pluginName] = PluginModule;
        isOrderingDirty = true;
      }
    }
    if (isOrderingDirty) {
      recomputePluginOrdering();
    }
  },

  /**
   * Looks up the plugin for the supplied event.
   *
   * @param {object} event A synthetic event.
   * @return {?object} The plugin that created the supplied event.
   * @internal
   */
  getPluginModuleForEvent: function (event) {
    var dispatchConfig = event.dispatchConfig;
    if (dispatchConfig.registrationName) {
      return EventPluginRegistry.registrationNameModules[dispatchConfig.registrationName] || null;
    }
    for (var phase in dispatchConfig.phasedRegistrationNames) {
      if (!dispatchConfig.phasedRegistrationNames.hasOwnProperty(phase)) {
        continue;
      }
      var PluginModule = EventPluginRegistry.registrationNameModules[dispatchConfig.phasedRegistrationNames[phase]];
      if (PluginModule) {
        return PluginModule;
      }
    }
    return null;
  },

  /**
   * Exposed for unit testing.
   * @private
   */
  _resetEventPlugins: function () {
    EventPluginOrder = null;
    for (var pluginName in namesToPlugins) {
      if (namesToPlugins.hasOwnProperty(pluginName)) {
        delete namesToPlugins[pluginName];
      }
    }
    EventPluginRegistry.plugins.length = 0;

    var eventNameDispatchConfigs = EventPluginRegistry.eventNameDispatchConfigs;
    for (var eventName in eventNameDispatchConfigs) {
      if (eventNameDispatchConfigs.hasOwnProperty(eventName)) {
        delete eventNameDispatchConfigs[eventName];
      }
    }

    var registrationNameModules = EventPluginRegistry.registrationNameModules;
    for (var registrationName in registrationNameModules) {
      if (registrationNameModules.hasOwnProperty(registrationName)) {
        delete registrationNameModules[registrationName];
      }
    }
  }

};

module.exports = EventPluginRegistry;
},{"fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/EventPluginUtils.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EventPluginUtils
 */

'use strict';

var EventConstants = require('./EventConstants');
var ReactErrorUtils = require('./ReactErrorUtils');

var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

/**
 * Injected dependencies:
 */

/**
 * - `Mount`: [required] Module that can convert between React dom IDs and
 *   actual node references.
 */
var injection = {
  Mount: null,
  injectMount: function (InjectedMount) {
    injection.Mount = InjectedMount;
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(InjectedMount && InjectedMount.getNode && InjectedMount.getID, 'EventPluginUtils.injection.injectMount(...): Injected Mount ' + 'module is missing getNode or getID.') : undefined;
    }
  }
};

var topLevelTypes = EventConstants.topLevelTypes;

function isEndish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseUp || topLevelType === topLevelTypes.topTouchEnd || topLevelType === topLevelTypes.topTouchCancel;
}

function isMoveish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseMove || topLevelType === topLevelTypes.topTouchMove;
}
function isStartish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseDown || topLevelType === topLevelTypes.topTouchStart;
}

var validateEventDispatches;
if (process.env.NODE_ENV !== 'production') {
  validateEventDispatches = function (event) {
    var dispatchListeners = event._dispatchListeners;
    var dispatchIDs = event._dispatchIDs;

    var listenersIsArr = Array.isArray(dispatchListeners);
    var idsIsArr = Array.isArray(dispatchIDs);
    var IDsLen = idsIsArr ? dispatchIDs.length : dispatchIDs ? 1 : 0;
    var listenersLen = listenersIsArr ? dispatchListeners.length : dispatchListeners ? 1 : 0;

    process.env.NODE_ENV !== 'production' ? warning(idsIsArr === listenersIsArr && IDsLen === listenersLen, 'EventPluginUtils: Invalid `event`.') : undefined;
  };
}

/**
 * Dispatch the event to the listener.
 * @param {SyntheticEvent} event SyntheticEvent to handle
 * @param {boolean} simulated If the event is simulated (changes exn behavior)
 * @param {function} listener Application-level callback
 * @param {string} domID DOM id to pass to the callback.
 */
function executeDispatch(event, simulated, listener, domID) {
  var type = event.type || 'unknown-event';
  event.currentTarget = injection.Mount.getNode(domID);
  if (simulated) {
    ReactErrorUtils.invokeGuardedCallbackWithCatch(type, listener, event, domID);
  } else {
    ReactErrorUtils.invokeGuardedCallback(type, listener, event, domID);
  }
  event.currentTarget = null;
}

/**
 * Standard/simple iteration through an event's collected dispatches.
 */
function executeDispatchesInOrder(event, simulated) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchIDs = event._dispatchIDs;
  if (process.env.NODE_ENV !== 'production') {
    validateEventDispatches(event);
  }
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and IDs are two parallel arrays that are always in sync.
      executeDispatch(event, simulated, dispatchListeners[i], dispatchIDs[i]);
    }
  } else if (dispatchListeners) {
    executeDispatch(event, simulated, dispatchListeners, dispatchIDs);
  }
  event._dispatchListeners = null;
  event._dispatchIDs = null;
}

/**
 * Standard/simple iteration through an event's collected dispatches, but stops
 * at the first dispatch execution returning true, and returns that id.
 *
 * @return {?string} id of the first dispatch execution who's listener returns
 * true, or null if no listener returned true.
 */
function executeDispatchesInOrderStopAtTrueImpl(event) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchIDs = event._dispatchIDs;
  if (process.env.NODE_ENV !== 'production') {
    validateEventDispatches(event);
  }
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and IDs are two parallel arrays that are always in sync.
      if (dispatchListeners[i](event, dispatchIDs[i])) {
        return dispatchIDs[i];
      }
    }
  } else if (dispatchListeners) {
    if (dispatchListeners(event, dispatchIDs)) {
      return dispatchIDs;
    }
  }
  return null;
}

/**
 * @see executeDispatchesInOrderStopAtTrueImpl
 */
function executeDispatchesInOrderStopAtTrue(event) {
  var ret = executeDispatchesInOrderStopAtTrueImpl(event);
  event._dispatchIDs = null;
  event._dispatchListeners = null;
  return ret;
}

/**
 * Execution of a "direct" dispatch - there must be at most one dispatch
 * accumulated on the event or it is considered an error. It doesn't really make
 * sense for an event with multiple dispatches (bubbled) to keep track of the
 * return values at each dispatch execution, but it does tend to make sense when
 * dealing with "direct" dispatches.
 *
 * @return {*} The return value of executing the single dispatch.
 */
function executeDirectDispatch(event) {
  if (process.env.NODE_ENV !== 'production') {
    validateEventDispatches(event);
  }
  var dispatchListener = event._dispatchListeners;
  var dispatchID = event._dispatchIDs;
  !!Array.isArray(dispatchListener) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'executeDirectDispatch(...): Invalid `event`.') : invariant(false) : undefined;
  var res = dispatchListener ? dispatchListener(event, dispatchID) : null;
  event._dispatchListeners = null;
  event._dispatchIDs = null;
  return res;
}

/**
 * @param {SyntheticEvent} event
 * @return {boolean} True iff number of dispatches accumulated is greater than 0.
 */
function hasDispatches(event) {
  return !!event._dispatchListeners;
}

/**
 * General utilities that are useful in creating custom Event Plugins.
 */
var EventPluginUtils = {
  isEndish: isEndish,
  isMoveish: isMoveish,
  isStartish: isStartish,

  executeDirectDispatch: executeDirectDispatch,
  executeDispatchesInOrder: executeDispatchesInOrder,
  executeDispatchesInOrderStopAtTrue: executeDispatchesInOrderStopAtTrue,
  hasDispatches: hasDispatches,

  getNode: function (id) {
    return injection.Mount.getNode(id);
  },
  getID: function (node) {
    return injection.Mount.getID(node);
  },

  injection: injection
};

module.exports = EventPluginUtils;
},{"./EventConstants":"/home/ec2-user/ksana2015/node_modules/react/lib/EventConstants.js","./ReactErrorUtils":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactErrorUtils.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/EventPropagators.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EventPropagators
 */

'use strict';

var EventConstants = require('./EventConstants');
var EventPluginHub = require('./EventPluginHub');

var warning = require('fbjs/lib/warning');

var accumulateInto = require('./accumulateInto');
var forEachAccumulated = require('./forEachAccumulated');

var PropagationPhases = EventConstants.PropagationPhases;
var getListener = EventPluginHub.getListener;

/**
 * Some event types have a notion of different registration names for different
 * "phases" of propagation. This finds listeners by a given phase.
 */
function listenerAtPhase(id, event, propagationPhase) {
  var registrationName = event.dispatchConfig.phasedRegistrationNames[propagationPhase];
  return getListener(id, registrationName);
}

/**
 * Tags a `SyntheticEvent` with dispatched listeners. Creating this function
 * here, allows us to not have to bind or create functions for each event.
 * Mutating the event's members allows us to not have to create a wrapping
 * "dispatch" object that pairs the event with the listener.
 */
function accumulateDirectionalDispatches(domID, upwards, event) {
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_ENV !== 'production' ? warning(domID, 'Dispatching id must not be null') : undefined;
  }
  var phase = upwards ? PropagationPhases.bubbled : PropagationPhases.captured;
  var listener = listenerAtPhase(domID, event, phase);
  if (listener) {
    event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
    event._dispatchIDs = accumulateInto(event._dispatchIDs, domID);
  }
}

/**
 * Collect dispatches (must be entirely collected before dispatching - see unit
 * tests). Lazily allocate the array to conserve memory.  We must loop through
 * each event and perform the traversal for each one. We cannot perform a
 * single traversal for the entire collection of events because each event may
 * have a different target.
 */
function accumulateTwoPhaseDispatchesSingle(event) {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    EventPluginHub.injection.getInstanceHandle().traverseTwoPhase(event.dispatchMarker, accumulateDirectionalDispatches, event);
  }
}

/**
 * Same as `accumulateTwoPhaseDispatchesSingle`, but skips over the targetID.
 */
function accumulateTwoPhaseDispatchesSingleSkipTarget(event) {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    EventPluginHub.injection.getInstanceHandle().traverseTwoPhaseSkipTarget(event.dispatchMarker, accumulateDirectionalDispatches, event);
  }
}

/**
 * Accumulates without regard to direction, does not look for phased
 * registration names. Same as `accumulateDirectDispatchesSingle` but without
 * requiring that the `dispatchMarker` be the same as the dispatched ID.
 */
function accumulateDispatches(id, ignoredDirection, event) {
  if (event && event.dispatchConfig.registrationName) {
    var registrationName = event.dispatchConfig.registrationName;
    var listener = getListener(id, registrationName);
    if (listener) {
      event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
      event._dispatchIDs = accumulateInto(event._dispatchIDs, id);
    }
  }
}

/**
 * Accumulates dispatches on an `SyntheticEvent`, but only for the
 * `dispatchMarker`.
 * @param {SyntheticEvent} event
 */
function accumulateDirectDispatchesSingle(event) {
  if (event && event.dispatchConfig.registrationName) {
    accumulateDispatches(event.dispatchMarker, null, event);
  }
}

function accumulateTwoPhaseDispatches(events) {
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
}

function accumulateTwoPhaseDispatchesSkipTarget(events) {
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingleSkipTarget);
}

function accumulateEnterLeaveDispatches(leave, enter, fromID, toID) {
  EventPluginHub.injection.getInstanceHandle().traverseEnterLeave(fromID, toID, accumulateDispatches, leave, enter);
}

function accumulateDirectDispatches(events) {
  forEachAccumulated(events, accumulateDirectDispatchesSingle);
}

/**
 * A small set of propagation patterns, each of which will accept a small amount
 * of information, and generate a set of "dispatch ready event objects" - which
 * are sets of events that have already been annotated with a set of dispatched
 * listener functions/ids. The API is designed this way to discourage these
 * propagation strategies from actually executing the dispatches, since we
 * always want to collect the entire set of dispatches before executing event a
 * single one.
 *
 * @constructor EventPropagators
 */
var EventPropagators = {
  accumulateTwoPhaseDispatches: accumulateTwoPhaseDispatches,
  accumulateTwoPhaseDispatchesSkipTarget: accumulateTwoPhaseDispatchesSkipTarget,
  accumulateDirectDispatches: accumulateDirectDispatches,
  accumulateEnterLeaveDispatches: accumulateEnterLeaveDispatches
};

module.exports = EventPropagators;
},{"./EventConstants":"/home/ec2-user/ksana2015/node_modules/react/lib/EventConstants.js","./EventPluginHub":"/home/ec2-user/ksana2015/node_modules/react/lib/EventPluginHub.js","./accumulateInto":"/home/ec2-user/ksana2015/node_modules/react/lib/accumulateInto.js","./forEachAccumulated":"/home/ec2-user/ksana2015/node_modules/react/lib/forEachAccumulated.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/FallbackCompositionState.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule FallbackCompositionState
 * @typechecks static-only
 */

'use strict';

var PooledClass = require('./PooledClass');

var assign = require('./Object.assign');
var getTextContentAccessor = require('./getTextContentAccessor');

/**
 * This helper class stores information about text content of a target node,
 * allowing comparison of content before and after a given event.
 *
 * Identify the node where selection currently begins, then observe
 * both its text content and its current position in the DOM. Since the
 * browser may natively replace the target node during composition, we can
 * use its position to find its replacement.
 *
 * @param {DOMEventTarget} root
 */
function FallbackCompositionState(root) {
  this._root = root;
  this._startText = this.getText();
  this._fallbackText = null;
}

assign(FallbackCompositionState.prototype, {
  destructor: function () {
    this._root = null;
    this._startText = null;
    this._fallbackText = null;
  },

  /**
   * Get current text of input.
   *
   * @return {string}
   */
  getText: function () {
    if ('value' in this._root) {
      return this._root.value;
    }
    return this._root[getTextContentAccessor()];
  },

  /**
   * Determine the differing substring between the initially stored
   * text content and the current content.
   *
   * @return {string}
   */
  getData: function () {
    if (this._fallbackText) {
      return this._fallbackText;
    }

    var start;
    var startValue = this._startText;
    var startLength = startValue.length;
    var end;
    var endValue = this.getText();
    var endLength = endValue.length;

    for (start = 0; start < startLength; start++) {
      if (startValue[start] !== endValue[start]) {
        break;
      }
    }

    var minEnd = startLength - start;
    for (end = 1; end <= minEnd; end++) {
      if (startValue[startLength - end] !== endValue[endLength - end]) {
        break;
      }
    }

    var sliceTail = end > 1 ? 1 - end : undefined;
    this._fallbackText = endValue.slice(start, sliceTail);
    return this._fallbackText;
  }
});

PooledClass.addPoolingTo(FallbackCompositionState);

module.exports = FallbackCompositionState;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./PooledClass":"/home/ec2-user/ksana2015/node_modules/react/lib/PooledClass.js","./getTextContentAccessor":"/home/ec2-user/ksana2015/node_modules/react/lib/getTextContentAccessor.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/HTMLDOMPropertyConfig.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule HTMLDOMPropertyConfig
 */

'use strict';

var DOMProperty = require('./DOMProperty');
var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');

var MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;
var MUST_USE_PROPERTY = DOMProperty.injection.MUST_USE_PROPERTY;
var HAS_BOOLEAN_VALUE = DOMProperty.injection.HAS_BOOLEAN_VALUE;
var HAS_SIDE_EFFECTS = DOMProperty.injection.HAS_SIDE_EFFECTS;
var HAS_NUMERIC_VALUE = DOMProperty.injection.HAS_NUMERIC_VALUE;
var HAS_POSITIVE_NUMERIC_VALUE = DOMProperty.injection.HAS_POSITIVE_NUMERIC_VALUE;
var HAS_OVERLOADED_BOOLEAN_VALUE = DOMProperty.injection.HAS_OVERLOADED_BOOLEAN_VALUE;

var hasSVG;
if (ExecutionEnvironment.canUseDOM) {
  var implementation = document.implementation;
  hasSVG = implementation && implementation.hasFeature && implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
}

var HTMLDOMPropertyConfig = {
  isCustomAttribute: RegExp.prototype.test.bind(/^(data|aria)-[a-z_][a-z\d_.\-]*$/),
  Properties: {
    /**
     * Standard Properties
     */
    accept: null,
    acceptCharset: null,
    accessKey: null,
    action: null,
    allowFullScreen: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    allowTransparency: MUST_USE_ATTRIBUTE,
    alt: null,
    async: HAS_BOOLEAN_VALUE,
    autoComplete: null,
    // autoFocus is polyfilled/normalized by AutoFocusUtils
    // autoFocus: HAS_BOOLEAN_VALUE,
    autoPlay: HAS_BOOLEAN_VALUE,
    capture: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    cellPadding: null,
    cellSpacing: null,
    charSet: MUST_USE_ATTRIBUTE,
    challenge: MUST_USE_ATTRIBUTE,
    checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    classID: MUST_USE_ATTRIBUTE,
    // To set className on SVG elements, it's necessary to use .setAttribute;
    // this works on HTML elements too in all browsers except IE8. Conveniently,
    // IE8 doesn't support SVG and so we can simply use the attribute in
    // browsers that support SVG and the property in browsers that don't,
    // regardless of whether the element is HTML or SVG.
    className: hasSVG ? MUST_USE_ATTRIBUTE : MUST_USE_PROPERTY,
    cols: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    colSpan: null,
    content: null,
    contentEditable: null,
    contextMenu: MUST_USE_ATTRIBUTE,
    controls: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    coords: null,
    crossOrigin: null,
    data: null, // For `<object />` acts as `src`.
    dateTime: MUST_USE_ATTRIBUTE,
    'default': HAS_BOOLEAN_VALUE,
    defer: HAS_BOOLEAN_VALUE,
    dir: null,
    disabled: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    download: HAS_OVERLOADED_BOOLEAN_VALUE,
    draggable: null,
    encType: null,
    form: MUST_USE_ATTRIBUTE,
    formAction: MUST_USE_ATTRIBUTE,
    formEncType: MUST_USE_ATTRIBUTE,
    formMethod: MUST_USE_ATTRIBUTE,
    formNoValidate: HAS_BOOLEAN_VALUE,
    formTarget: MUST_USE_ATTRIBUTE,
    frameBorder: MUST_USE_ATTRIBUTE,
    headers: null,
    height: MUST_USE_ATTRIBUTE,
    hidden: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    high: null,
    href: null,
    hrefLang: null,
    htmlFor: null,
    httpEquiv: null,
    icon: null,
    id: MUST_USE_PROPERTY,
    inputMode: MUST_USE_ATTRIBUTE,
    integrity: null,
    is: MUST_USE_ATTRIBUTE,
    keyParams: MUST_USE_ATTRIBUTE,
    keyType: MUST_USE_ATTRIBUTE,
    kind: null,
    label: null,
    lang: null,
    list: MUST_USE_ATTRIBUTE,
    loop: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    low: null,
    manifest: MUST_USE_ATTRIBUTE,
    marginHeight: null,
    marginWidth: null,
    max: null,
    maxLength: MUST_USE_ATTRIBUTE,
    media: MUST_USE_ATTRIBUTE,
    mediaGroup: null,
    method: null,
    min: null,
    minLength: MUST_USE_ATTRIBUTE,
    multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    name: null,
    nonce: MUST_USE_ATTRIBUTE,
    noValidate: HAS_BOOLEAN_VALUE,
    open: HAS_BOOLEAN_VALUE,
    optimum: null,
    pattern: null,
    placeholder: null,
    poster: null,
    preload: null,
    radioGroup: null,
    readOnly: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    rel: null,
    required: HAS_BOOLEAN_VALUE,
    reversed: HAS_BOOLEAN_VALUE,
    role: MUST_USE_ATTRIBUTE,
    rows: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    rowSpan: null,
    sandbox: null,
    scope: null,
    scoped: HAS_BOOLEAN_VALUE,
    scrolling: null,
    seamless: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    shape: null,
    size: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    sizes: MUST_USE_ATTRIBUTE,
    span: HAS_POSITIVE_NUMERIC_VALUE,
    spellCheck: null,
    src: null,
    srcDoc: MUST_USE_PROPERTY,
    srcLang: null,
    srcSet: MUST_USE_ATTRIBUTE,
    start: HAS_NUMERIC_VALUE,
    step: null,
    style: null,
    summary: null,
    tabIndex: null,
    target: null,
    title: null,
    type: null,
    useMap: null,
    value: MUST_USE_PROPERTY | HAS_SIDE_EFFECTS,
    width: MUST_USE_ATTRIBUTE,
    wmode: MUST_USE_ATTRIBUTE,
    wrap: null,

    /**
     * RDFa Properties
     */
    about: MUST_USE_ATTRIBUTE,
    datatype: MUST_USE_ATTRIBUTE,
    inlist: MUST_USE_ATTRIBUTE,
    prefix: MUST_USE_ATTRIBUTE,
    // property is also supported for OpenGraph in meta tags.
    property: MUST_USE_ATTRIBUTE,
    resource: MUST_USE_ATTRIBUTE,
    'typeof': MUST_USE_ATTRIBUTE,
    vocab: MUST_USE_ATTRIBUTE,

    /**
     * Non-standard Properties
     */
    // autoCapitalize and autoCorrect are supported in Mobile Safari for
    // keyboard hints.
    autoCapitalize: MUST_USE_ATTRIBUTE,
    autoCorrect: MUST_USE_ATTRIBUTE,
    // autoSave allows WebKit/Blink to persist values of input fields on page reloads
    autoSave: null,
    // color is for Safari mask-icon link
    color: null,
    // itemProp, itemScope, itemType are for
    // Microdata support. See http://schema.org/docs/gs.html
    itemProp: MUST_USE_ATTRIBUTE,
    itemScope: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    itemType: MUST_USE_ATTRIBUTE,
    // itemID and itemRef are for Microdata support as well but
    // only specified in the the WHATWG spec document. See
    // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
    itemID: MUST_USE_ATTRIBUTE,
    itemRef: MUST_USE_ATTRIBUTE,
    // results show looking glass icon and recent searches on input
    // search fields in WebKit/Blink
    results: null,
    // IE-only attribute that specifies security restrictions on an iframe
    // as an alternative to the sandbox attribute on IE<10
    security: MUST_USE_ATTRIBUTE,
    // IE-only attribute that controls focus behavior
    unselectable: MUST_USE_ATTRIBUTE
  },
  DOMAttributeNames: {
    acceptCharset: 'accept-charset',
    className: 'class',
    htmlFor: 'for',
    httpEquiv: 'http-equiv'
  },
  DOMPropertyNames: {
    autoComplete: 'autocomplete',
    autoFocus: 'autofocus',
    autoPlay: 'autoplay',
    autoSave: 'autosave',
    // `encoding` is equivalent to `enctype`, IE8 lacks an `enctype` setter.
    // http://www.w3.org/TR/html5/forms.html#dom-fs-encoding
    encType: 'encoding',
    hrefLang: 'hreflang',
    radioGroup: 'radiogroup',
    spellCheck: 'spellcheck',
    srcDoc: 'srcdoc',
    srcSet: 'srcset'
  }
};

module.exports = HTMLDOMPropertyConfig;
},{"./DOMProperty":"/home/ec2-user/ksana2015/node_modules/react/lib/DOMProperty.js","fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/LinkedValueUtils.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule LinkedValueUtils
 * @typechecks static-only
 */

'use strict';

var ReactPropTypes = require('./ReactPropTypes');
var ReactPropTypeLocations = require('./ReactPropTypeLocations');

var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

var hasReadOnlyValue = {
  'button': true,
  'checkbox': true,
  'image': true,
  'hidden': true,
  'radio': true,
  'reset': true,
  'submit': true
};

function _assertSingleLink(inputProps) {
  !(inputProps.checkedLink == null || inputProps.valueLink == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Cannot provide a checkedLink and a valueLink. If you want to use ' + 'checkedLink, you probably don\'t want to use valueLink and vice versa.') : invariant(false) : undefined;
}
function _assertValueLink(inputProps) {
  _assertSingleLink(inputProps);
  !(inputProps.value == null && inputProps.onChange == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Cannot provide a valueLink and a value or onChange event. If you want ' + 'to use value or onChange, you probably don\'t want to use valueLink.') : invariant(false) : undefined;
}

function _assertCheckedLink(inputProps) {
  _assertSingleLink(inputProps);
  !(inputProps.checked == null && inputProps.onChange == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Cannot provide a checkedLink and a checked property or onChange event. ' + 'If you want to use checked or onChange, you probably don\'t want to ' + 'use checkedLink') : invariant(false) : undefined;
}

var propTypes = {
  value: function (props, propName, componentName) {
    if (!props[propName] || hasReadOnlyValue[props.type] || props.onChange || props.readOnly || props.disabled) {
      return null;
    }
    return new Error('You provided a `value` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultValue`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
  },
  checked: function (props, propName, componentName) {
    if (!props[propName] || props.onChange || props.readOnly || props.disabled) {
      return null;
    }
    return new Error('You provided a `checked` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultChecked`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
  },
  onChange: ReactPropTypes.func
};

var loggedTypeFailures = {};
function getDeclarationErrorAddendum(owner) {
  if (owner) {
    var name = owner.getName();
    if (name) {
      return ' Check the render method of `' + name + '`.';
    }
  }
  return '';
}

/**
 * Provide a linked `value` attribute for controlled forms. You should not use
 * this outside of the ReactDOM controlled form components.
 */
var LinkedValueUtils = {
  checkPropTypes: function (tagName, props, owner) {
    for (var propName in propTypes) {
      if (propTypes.hasOwnProperty(propName)) {
        var error = propTypes[propName](props, propName, tagName, ReactPropTypeLocations.prop);
      }
      if (error instanceof Error && !(error.message in loggedTypeFailures)) {
        // Only monitor this failure once because there tends to be a lot of the
        // same error.
        loggedTypeFailures[error.message] = true;

        var addendum = getDeclarationErrorAddendum(owner);
        process.env.NODE_ENV !== 'production' ? warning(false, 'Failed form propType: %s%s', error.message, addendum) : undefined;
      }
    }
  },

  /**
   * @param {object} inputProps Props for form component
   * @return {*} current value of the input either from value prop or link.
   */
  getValue: function (inputProps) {
    if (inputProps.valueLink) {
      _assertValueLink(inputProps);
      return inputProps.valueLink.value;
    }
    return inputProps.value;
  },

  /**
   * @param {object} inputProps Props for form component
   * @return {*} current checked status of the input either from checked prop
   *             or link.
   */
  getChecked: function (inputProps) {
    if (inputProps.checkedLink) {
      _assertCheckedLink(inputProps);
      return inputProps.checkedLink.value;
    }
    return inputProps.checked;
  },

  /**
   * @param {object} inputProps Props for form component
   * @param {SyntheticEvent} event change event to handle
   */
  executeOnChange: function (inputProps, event) {
    if (inputProps.valueLink) {
      _assertValueLink(inputProps);
      return inputProps.valueLink.requestChange(event.target.value);
    } else if (inputProps.checkedLink) {
      _assertCheckedLink(inputProps);
      return inputProps.checkedLink.requestChange(event.target.checked);
    } else if (inputProps.onChange) {
      return inputProps.onChange.call(undefined, event);
    }
  }
};

module.exports = LinkedValueUtils;
},{"./ReactPropTypeLocations":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPropTypeLocations.js","./ReactPropTypes":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPropTypes.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js":[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Object.assign
 */

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign

'use strict';

function assign(target, sources) {
  if (target == null) {
    throw new TypeError('Object.assign target cannot be null or undefined');
  }

  var to = Object(target);
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
    var nextSource = arguments[nextIndex];
    if (nextSource == null) {
      continue;
    }

    var from = Object(nextSource);

    // We don't currently support accessors nor proxies. Therefore this
    // copy cannot throw. If we ever supported this then we must handle
    // exceptions and side-effects. We don't support symbols so they won't
    // be transferred.

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
  }

  return to;
}

module.exports = assign;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/PooledClass.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule PooledClass
 */

'use strict';

var invariant = require('fbjs/lib/invariant');

/**
 * Static poolers. Several custom versions for each potential number of
 * arguments. A completely generic pooler is easy to implement, but would
 * require accessing the `arguments` object. In each of these, `this` refers to
 * the Class itself, not an instance. If any others are needed, simply add them
 * here, or in their own files.
 */
var oneArgumentPooler = function (copyFieldsFrom) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, copyFieldsFrom);
    return instance;
  } else {
    return new Klass(copyFieldsFrom);
  }
};

var twoArgumentPooler = function (a1, a2) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2);
    return instance;
  } else {
    return new Klass(a1, a2);
  }
};

var threeArgumentPooler = function (a1, a2, a3) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3);
    return instance;
  } else {
    return new Klass(a1, a2, a3);
  }
};

var fourArgumentPooler = function (a1, a2, a3, a4) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3, a4);
    return instance;
  } else {
    return new Klass(a1, a2, a3, a4);
  }
};

var fiveArgumentPooler = function (a1, a2, a3, a4, a5) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3, a4, a5);
    return instance;
  } else {
    return new Klass(a1, a2, a3, a4, a5);
  }
};

var standardReleaser = function (instance) {
  var Klass = this;
  !(instance instanceof Klass) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Trying to release an instance into a pool of a different type.') : invariant(false) : undefined;
  instance.destructor();
  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance);
  }
};

var DEFAULT_POOL_SIZE = 10;
var DEFAULT_POOLER = oneArgumentPooler;

/**
 * Augments `CopyConstructor` to be a poolable class, augmenting only the class
 * itself (statically) not adding any prototypical fields. Any CopyConstructor
 * you give this may have a `poolSize` property, and will look for a
 * prototypical `destructor` on instances (optional).
 *
 * @param {Function} CopyConstructor Constructor that can be used to reset.
 * @param {Function} pooler Customizable pooler.
 */
var addPoolingTo = function (CopyConstructor, pooler) {
  var NewKlass = CopyConstructor;
  NewKlass.instancePool = [];
  NewKlass.getPooled = pooler || DEFAULT_POOLER;
  if (!NewKlass.poolSize) {
    NewKlass.poolSize = DEFAULT_POOL_SIZE;
  }
  NewKlass.release = standardReleaser;
  return NewKlass;
};

var PooledClass = {
  addPoolingTo: addPoolingTo,
  oneArgumentPooler: oneArgumentPooler,
  twoArgumentPooler: twoArgumentPooler,
  threeArgumentPooler: threeArgumentPooler,
  fourArgumentPooler: fourArgumentPooler,
  fiveArgumentPooler: fiveArgumentPooler
};

module.exports = PooledClass;
},{"fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/React.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule React
 */

'use strict';

var ReactDOM = require('./ReactDOM');
var ReactDOMServer = require('./ReactDOMServer');
var ReactIsomorphic = require('./ReactIsomorphic');

var assign = require('./Object.assign');
var deprecated = require('./deprecated');

// `version` will be added here by ReactIsomorphic.
var React = {};

assign(React, ReactIsomorphic);

assign(React, {
  // ReactDOM
  findDOMNode: deprecated('findDOMNode', 'ReactDOM', 'react-dom', ReactDOM, ReactDOM.findDOMNode),
  render: deprecated('render', 'ReactDOM', 'react-dom', ReactDOM, ReactDOM.render),
  unmountComponentAtNode: deprecated('unmountComponentAtNode', 'ReactDOM', 'react-dom', ReactDOM, ReactDOM.unmountComponentAtNode),

  // ReactDOMServer
  renderToString: deprecated('renderToString', 'ReactDOMServer', 'react-dom/server', ReactDOMServer, ReactDOMServer.renderToString),
  renderToStaticMarkup: deprecated('renderToStaticMarkup', 'ReactDOMServer', 'react-dom/server', ReactDOMServer, ReactDOMServer.renderToStaticMarkup)
});

React.__SECRET_DOM_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactDOM;
React.__SECRET_DOM_SERVER_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactDOMServer;

module.exports = React;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactDOM":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOM.js","./ReactDOMServer":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMServer.js","./ReactIsomorphic":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactIsomorphic.js","./deprecated":"/home/ec2-user/ksana2015/node_modules/react/lib/deprecated.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactBrowserComponentMixin.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactBrowserComponentMixin
 */

'use strict';

var ReactInstanceMap = require('./ReactInstanceMap');

var findDOMNode = require('./findDOMNode');
var warning = require('fbjs/lib/warning');

var didWarnKey = '_getDOMNodeDidWarn';

var ReactBrowserComponentMixin = {
  /**
   * Returns the DOM node rendered by this component.
   *
   * @return {DOMElement} The root node of this component.
   * @final
   * @protected
   */
  getDOMNode: function () {
    process.env.NODE_ENV !== 'production' ? warning(this.constructor[didWarnKey], '%s.getDOMNode(...) is deprecated. Please use ' + 'ReactDOM.findDOMNode(instance) instead.', ReactInstanceMap.get(this).getName() || this.tagName || 'Unknown') : undefined;
    this.constructor[didWarnKey] = true;
    return findDOMNode(this);
  }
};

module.exports = ReactBrowserComponentMixin;
},{"./ReactInstanceMap":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInstanceMap.js","./findDOMNode":"/home/ec2-user/ksana2015/node_modules/react/lib/findDOMNode.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactBrowserEventEmitter.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactBrowserEventEmitter
 * @typechecks static-only
 */

'use strict';

var EventConstants = require('./EventConstants');
var EventPluginHub = require('./EventPluginHub');
var EventPluginRegistry = require('./EventPluginRegistry');
var ReactEventEmitterMixin = require('./ReactEventEmitterMixin');
var ReactPerf = require('./ReactPerf');
var ViewportMetrics = require('./ViewportMetrics');

var assign = require('./Object.assign');
var isEventSupported = require('./isEventSupported');

/**
 * Summary of `ReactBrowserEventEmitter` event handling:
 *
 *  - Top-level delegation is used to trap most native browser events. This
 *    may only occur in the main thread and is the responsibility of
 *    ReactEventListener, which is injected and can therefore support pluggable
 *    event sources. This is the only work that occurs in the main thread.
 *
 *  - We normalize and de-duplicate events to account for browser quirks. This
 *    may be done in the worker thread.
 *
 *  - Forward these native events (with the associated top-level type used to
 *    trap it) to `EventPluginHub`, which in turn will ask plugins if they want
 *    to extract any synthetic events.
 *
 *  - The `EventPluginHub` will then process each event by annotating them with
 *    "dispatches", a sequence of listeners and IDs that care about that event.
 *
 *  - The `EventPluginHub` then dispatches the events.
 *
 * Overview of React and the event system:
 *
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .
 *       |           .
 *       v           .
 * +------------+    .
 * | ReactEvent |    .
 * |  Listener  |    .
 * +------------+    .                         +-----------+
 *       |           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.--->|              |                    +------------+
 * |     |      |    .    +--------------+
 * +-----|------+    .                ^        +-----------+
 *       |           .                |        |Enter/Leave|
 *       +           .                +-------+|Plugin     |
 * +-------------+   .                         +-----------+
 * | application |   .
 * |-------------|   .
 * |             |   .
 * |             |   .
 * +-------------+   .
 *                   .
 *    React Core     .  General Purpose Event Plugin System
 */

var alreadyListeningTo = {};
var isMonitoringScrollValue = false;
var reactTopListenersCounter = 0;

// For events like 'submit' which don't consistently bubble (which we trap at a
// lower node than `document`), binding at `document` would cause duplicate
// events so we don't include them here
var topEventMapping = {
  topAbort: 'abort',
  topBlur: 'blur',
  topCanPlay: 'canplay',
  topCanPlayThrough: 'canplaythrough',
  topChange: 'change',
  topClick: 'click',
  topCompositionEnd: 'compositionend',
  topCompositionStart: 'compositionstart',
  topCompositionUpdate: 'compositionupdate',
  topContextMenu: 'contextmenu',
  topCopy: 'copy',
  topCut: 'cut',
  topDoubleClick: 'dblclick',
  topDrag: 'drag',
  topDragEnd: 'dragend',
  topDragEnter: 'dragenter',
  topDragExit: 'dragexit',
  topDragLeave: 'dragleave',
  topDragOver: 'dragover',
  topDragStart: 'dragstart',
  topDrop: 'drop',
  topDurationChange: 'durationchange',
  topEmptied: 'emptied',
  topEncrypted: 'encrypted',
  topEnded: 'ended',
  topError: 'error',
  topFocus: 'focus',
  topInput: 'input',
  topKeyDown: 'keydown',
  topKeyPress: 'keypress',
  topKeyUp: 'keyup',
  topLoadedData: 'loadeddata',
  topLoadedMetadata: 'loadedmetadata',
  topLoadStart: 'loadstart',
  topMouseDown: 'mousedown',
  topMouseMove: 'mousemove',
  topMouseOut: 'mouseout',
  topMouseOver: 'mouseover',
  topMouseUp: 'mouseup',
  topPaste: 'paste',
  topPause: 'pause',
  topPlay: 'play',
  topPlaying: 'playing',
  topProgress: 'progress',
  topRateChange: 'ratechange',
  topScroll: 'scroll',
  topSeeked: 'seeked',
  topSeeking: 'seeking',
  topSelectionChange: 'selectionchange',
  topStalled: 'stalled',
  topSuspend: 'suspend',
  topTextInput: 'textInput',
  topTimeUpdate: 'timeupdate',
  topTouchCancel: 'touchcancel',
  topTouchEnd: 'touchend',
  topTouchMove: 'touchmove',
  topTouchStart: 'touchstart',
  topVolumeChange: 'volumechange',
  topWaiting: 'waiting',
  topWheel: 'wheel'
};

/**
 * To ensure no conflicts with other potential React instances on the page
 */
var topListenersIDKey = '_reactListenersID' + String(Math.random()).slice(2);

function getListeningForDocument(mountAt) {
  // In IE8, `mountAt` is a host object and doesn't have `hasOwnProperty`
  // directly.
  if (!Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey)) {
    mountAt[topListenersIDKey] = reactTopListenersCounter++;
    alreadyListeningTo[mountAt[topListenersIDKey]] = {};
  }
  return alreadyListeningTo[mountAt[topListenersIDKey]];
}

/**
 * `ReactBrowserEventEmitter` is used to attach top-level event listeners. For
 * example:
 *
 *   ReactBrowserEventEmitter.putListener('myID', 'onClick', myFunction);
 *
 * This would allocate a "registration" of `('onClick', myFunction)` on 'myID'.
 *
 * @internal
 */
var ReactBrowserEventEmitter = assign({}, ReactEventEmitterMixin, {

  /**
   * Injectable event backend
   */
  ReactEventListener: null,

  injection: {
    /**
     * @param {object} ReactEventListener
     */
    injectReactEventListener: function (ReactEventListener) {
      ReactEventListener.setHandleTopLevel(ReactBrowserEventEmitter.handleTopLevel);
      ReactBrowserEventEmitter.ReactEventListener = ReactEventListener;
    }
  },

  /**
   * Sets whether or not any created callbacks should be enabled.
   *
   * @param {boolean} enabled True if callbacks should be enabled.
   */
  setEnabled: function (enabled) {
    if (ReactBrowserEventEmitter.ReactEventListener) {
      ReactBrowserEventEmitter.ReactEventListener.setEnabled(enabled);
    }
  },

  /**
   * @return {boolean} True if callbacks are enabled.
   */
  isEnabled: function () {
    return !!(ReactBrowserEventEmitter.ReactEventListener && ReactBrowserEventEmitter.ReactEventListener.isEnabled());
  },

  /**
   * We listen for bubbled touch events on the document object.
   *
   * Firefox v8.01 (and possibly others) exhibited strange behavior when
   * mounting `onmousemove` events at some node that was not the document
   * element. The symptoms were that if your mouse is not moving over something
   * contained within that mount point (for example on the background) the
   * top-level listeners for `onmousemove` won't be called. However, if you
   * register the `mousemove` on the document object, then it will of course
   * catch all `mousemove`s. This along with iOS quirks, justifies restricting
   * top-level listeners to the document object only, at least for these
   * movement types of events and possibly all events.
   *
   * @see http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
   *
   * Also, `keyup`/`keypress`/`keydown` do not bubble to the window on IE, but
   * they bubble to document.
   *
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {object} contentDocumentHandle Document which owns the container
   */
  listenTo: function (registrationName, contentDocumentHandle) {
    var mountAt = contentDocumentHandle;
    var isListening = getListeningForDocument(mountAt);
    var dependencies = EventPluginRegistry.registrationNameDependencies[registrationName];

    var topLevelTypes = EventConstants.topLevelTypes;
    for (var i = 0; i < dependencies.length; i++) {
      var dependency = dependencies[i];
      if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
        if (dependency === topLevelTypes.topWheel) {
          if (isEventSupported('wheel')) {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topWheel, 'wheel', mountAt);
          } else if (isEventSupported('mousewheel')) {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topWheel, 'mousewheel', mountAt);
          } else {
            // Firefox needs to capture a different mouse scroll event.
            // @see http://www.quirksmode.org/dom/events/tests/scroll.html
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topWheel, 'DOMMouseScroll', mountAt);
          }
        } else if (dependency === topLevelTypes.topScroll) {

          if (isEventSupported('scroll', true)) {
            ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(topLevelTypes.topScroll, 'scroll', mountAt);
          } else {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topScroll, 'scroll', ReactBrowserEventEmitter.ReactEventListener.WINDOW_HANDLE);
          }
        } else if (dependency === topLevelTypes.topFocus || dependency === topLevelTypes.topBlur) {

          if (isEventSupported('focus', true)) {
            ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(topLevelTypes.topFocus, 'focus', mountAt);
            ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(topLevelTypes.topBlur, 'blur', mountAt);
          } else if (isEventSupported('focusin')) {
            // IE has `focusin` and `focusout` events which bubble.
            // @see http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topFocus, 'focusin', mountAt);
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topBlur, 'focusout', mountAt);
          }

          // to make sure blur and focus event listeners are only attached once
          isListening[topLevelTypes.topBlur] = true;
          isListening[topLevelTypes.topFocus] = true;
        } else if (topEventMapping.hasOwnProperty(dependency)) {
          ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(dependency, topEventMapping[dependency], mountAt);
        }

        isListening[dependency] = true;
      }
    }
  },

  trapBubbledEvent: function (topLevelType, handlerBaseName, handle) {
    return ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelType, handlerBaseName, handle);
  },

  trapCapturedEvent: function (topLevelType, handlerBaseName, handle) {
    return ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(topLevelType, handlerBaseName, handle);
  },

  /**
   * Listens to window scroll and resize events. We cache scroll values so that
   * application code can access them without triggering reflows.
   *
   * NOTE: Scroll events do not bubble.
   *
   * @see http://www.quirksmode.org/dom/events/scroll.html
   */
  ensureScrollValueMonitoring: function () {
    if (!isMonitoringScrollValue) {
      var refresh = ViewportMetrics.refreshScrollValues;
      ReactBrowserEventEmitter.ReactEventListener.monitorScrollValue(refresh);
      isMonitoringScrollValue = true;
    }
  },

  eventNameDispatchConfigs: EventPluginHub.eventNameDispatchConfigs,

  registrationNameModules: EventPluginHub.registrationNameModules,

  putListener: EventPluginHub.putListener,

  getListener: EventPluginHub.getListener,

  deleteListener: EventPluginHub.deleteListener,

  deleteAllListeners: EventPluginHub.deleteAllListeners

});

ReactPerf.measureMethods(ReactBrowserEventEmitter, 'ReactBrowserEventEmitter', {
  putListener: 'putListener',
  deleteListener: 'deleteListener'
});

module.exports = ReactBrowserEventEmitter;
},{"./EventConstants":"/home/ec2-user/ksana2015/node_modules/react/lib/EventConstants.js","./EventPluginHub":"/home/ec2-user/ksana2015/node_modules/react/lib/EventPluginHub.js","./EventPluginRegistry":"/home/ec2-user/ksana2015/node_modules/react/lib/EventPluginRegistry.js","./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactEventEmitterMixin":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactEventEmitterMixin.js","./ReactPerf":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPerf.js","./ViewportMetrics":"/home/ec2-user/ksana2015/node_modules/react/lib/ViewportMetrics.js","./isEventSupported":"/home/ec2-user/ksana2015/node_modules/react/lib/isEventSupported.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactChildReconciler.js":[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactChildReconciler
 * @typechecks static-only
 */

'use strict';

var ReactReconciler = require('./ReactReconciler');

var instantiateReactComponent = require('./instantiateReactComponent');
var shouldUpdateReactComponent = require('./shouldUpdateReactComponent');
var traverseAllChildren = require('./traverseAllChildren');
var warning = require('fbjs/lib/warning');

function instantiateChild(childInstances, child, name) {
  // We found a component instance.
  var keyUnique = childInstances[name] === undefined;
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_ENV !== 'production' ? warning(keyUnique, 'flattenChildren(...): Encountered two children with the same key, ' + '`%s`. Child keys must be unique; when two children share a key, only ' + 'the first child will be used.', name) : undefined;
  }
  if (child != null && keyUnique) {
    childInstances[name] = instantiateReactComponent(child, null);
  }
}

/**
 * ReactChildReconciler provides helpers for initializing or updating a set of
 * children. Its output is suitable for passing it onto ReactMultiChild which
 * does diffed reordering and insertion.
 */
var ReactChildReconciler = {
  /**
   * Generates a "mount image" for each of the supplied children. In the case
   * of `ReactDOMComponent`, a mount image is a string of markup.
   *
   * @param {?object} nestedChildNodes Nested child maps.
   * @return {?object} A set of child instances.
   * @internal
   */
  instantiateChildren: function (nestedChildNodes, transaction, context) {
    if (nestedChildNodes == null) {
      return null;
    }
    var childInstances = {};
    traverseAllChildren(nestedChildNodes, instantiateChild, childInstances);
    return childInstances;
  },

  /**
   * Updates the rendered children and returns a new set of children.
   *
   * @param {?object} prevChildren Previously initialized set of children.
   * @param {?object} nextChildren Flat child element maps.
   * @param {ReactReconcileTransaction} transaction
   * @param {object} context
   * @return {?object} A new set of child instances.
   * @internal
   */
  updateChildren: function (prevChildren, nextChildren, transaction, context) {
    // We currently don't have a way to track moves here but if we use iterators
    // instead of for..in we can zip the iterators and check if an item has
    // moved.
    // TODO: If nothing has changed, return the prevChildren object so that we
    // can quickly bailout if nothing has changed.
    if (!nextChildren && !prevChildren) {
      return null;
    }
    var name;
    for (name in nextChildren) {
      if (!nextChildren.hasOwnProperty(name)) {
        continue;
      }
      var prevChild = prevChildren && prevChildren[name];
      var prevElement = prevChild && prevChild._currentElement;
      var nextElement = nextChildren[name];
      if (prevChild != null && shouldUpdateReactComponent(prevElement, nextElement)) {
        ReactReconciler.receiveComponent(prevChild, nextElement, transaction, context);
        nextChildren[name] = prevChild;
      } else {
        if (prevChild) {
          ReactReconciler.unmountComponent(prevChild, name);
        }
        // The child must be instantiated before it's mounted.
        var nextChildInstance = instantiateReactComponent(nextElement, null);
        nextChildren[name] = nextChildInstance;
      }
    }
    // Unmount children that are no longer present.
    for (name in prevChildren) {
      if (prevChildren.hasOwnProperty(name) && !(nextChildren && nextChildren.hasOwnProperty(name))) {
        ReactReconciler.unmountComponent(prevChildren[name]);
      }
    }
    return nextChildren;
  },

  /**
   * Unmounts all rendered children. This should be used to clean up children
   * when this component is unmounted.
   *
   * @param {?object} renderedChildren Previously initialized set of children.
   * @internal
   */
  unmountChildren: function (renderedChildren) {
    for (var name in renderedChildren) {
      if (renderedChildren.hasOwnProperty(name)) {
        var renderedChild = renderedChildren[name];
        ReactReconciler.unmountComponent(renderedChild);
      }
    }
  }

};

module.exports = ReactChildReconciler;
},{"./ReactReconciler":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactReconciler.js","./instantiateReactComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/instantiateReactComponent.js","./shouldUpdateReactComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/shouldUpdateReactComponent.js","./traverseAllChildren":"/home/ec2-user/ksana2015/node_modules/react/lib/traverseAllChildren.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactChildren.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactChildren
 */

'use strict';

var PooledClass = require('./PooledClass');
var ReactElement = require('./ReactElement');

var emptyFunction = require('fbjs/lib/emptyFunction');
var traverseAllChildren = require('./traverseAllChildren');

var twoArgumentPooler = PooledClass.twoArgumentPooler;
var fourArgumentPooler = PooledClass.fourArgumentPooler;

var userProvidedKeyEscapeRegex = /\/(?!\/)/g;
function escapeUserProvidedKey(text) {
  return ('' + text).replace(userProvidedKeyEscapeRegex, '//');
}

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * traversal. Allows avoiding binding callbacks.
 *
 * @constructor ForEachBookKeeping
 * @param {!function} forEachFunction Function to perform traversal with.
 * @param {?*} forEachContext Context to perform context with.
 */
function ForEachBookKeeping(forEachFunction, forEachContext) {
  this.func = forEachFunction;
  this.context = forEachContext;
  this.count = 0;
}
ForEachBookKeeping.prototype.destructor = function () {
  this.func = null;
  this.context = null;
  this.count = 0;
};
PooledClass.addPoolingTo(ForEachBookKeeping, twoArgumentPooler);

function forEachSingleChild(bookKeeping, child, name) {
  var func = bookKeeping.func;
  var context = bookKeeping.context;

  func.call(context, child, bookKeeping.count++);
}

/**
 * Iterates through children that are typically specified as `props.children`.
 *
 * The provided forEachFunc(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} forEachFunc
 * @param {*} forEachContext Context for forEachContext.
 */
function forEachChildren(children, forEachFunc, forEachContext) {
  if (children == null) {
    return children;
  }
  var traverseContext = ForEachBookKeeping.getPooled(forEachFunc, forEachContext);
  traverseAllChildren(children, forEachSingleChild, traverseContext);
  ForEachBookKeeping.release(traverseContext);
}

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * mapping. Allows avoiding binding callbacks.
 *
 * @constructor MapBookKeeping
 * @param {!*} mapResult Object containing the ordered map of results.
 * @param {!function} mapFunction Function to perform mapping with.
 * @param {?*} mapContext Context to perform mapping with.
 */
function MapBookKeeping(mapResult, keyPrefix, mapFunction, mapContext) {
  this.result = mapResult;
  this.keyPrefix = keyPrefix;
  this.func = mapFunction;
  this.context = mapContext;
  this.count = 0;
}
MapBookKeeping.prototype.destructor = function () {
  this.result = null;
  this.keyPrefix = null;
  this.func = null;
  this.context = null;
  this.count = 0;
};
PooledClass.addPoolingTo(MapBookKeeping, fourArgumentPooler);

function mapSingleChildIntoContext(bookKeeping, child, childKey) {
  var result = bookKeeping.result;
  var keyPrefix = bookKeeping.keyPrefix;
  var func = bookKeeping.func;
  var context = bookKeeping.context;

  var mappedChild = func.call(context, child, bookKeeping.count++);
  if (Array.isArray(mappedChild)) {
    mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, emptyFunction.thatReturnsArgument);
  } else if (mappedChild != null) {
    if (ReactElement.isValidElement(mappedChild)) {
      mappedChild = ReactElement.cloneAndReplaceKey(mappedChild,
      // Keep both the (mapped) and old keys if they differ, just as
      // traverseAllChildren used to do for objects as children
      keyPrefix + (mappedChild !== child ? escapeUserProvidedKey(mappedChild.key || '') + '/' : '') + childKey);
    }
    result.push(mappedChild);
  }
}

function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
  var escapedPrefix = '';
  if (prefix != null) {
    escapedPrefix = escapeUserProvidedKey(prefix) + '/';
  }
  var traverseContext = MapBookKeeping.getPooled(array, escapedPrefix, func, context);
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
  MapBookKeeping.release(traverseContext);
}

/**
 * Maps children that are typically specified as `props.children`.
 *
 * The provided mapFunction(child, key, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} func The map function.
 * @param {*} context Context for mapFunction.
 * @return {object} Object containing the ordered map of results.
 */
function mapChildren(children, func, context) {
  if (children == null) {
    return children;
  }
  var result = [];
  mapIntoWithKeyPrefixInternal(children, result, null, func, context);
  return result;
}

function forEachSingleChildDummy(traverseContext, child, name) {
  return null;
}

/**
 * Count the number of children that are typically specified as
 * `props.children`.
 *
 * @param {?*} children Children tree container.
 * @return {number} The number of children.
 */
function countChildren(children, context) {
  return traverseAllChildren(children, forEachSingleChildDummy, null);
}

/**
 * Flatten a children object (typically specified as `props.children`) and
 * return an array with appropriately re-keyed children.
 */
function toArray(children) {
  var result = [];
  mapIntoWithKeyPrefixInternal(children, result, null, emptyFunction.thatReturnsArgument);
  return result;
}

var ReactChildren = {
  forEach: forEachChildren,
  map: mapChildren,
  mapIntoWithKeyPrefixInternal: mapIntoWithKeyPrefixInternal,
  count: countChildren,
  toArray: toArray
};

module.exports = ReactChildren;
},{"./PooledClass":"/home/ec2-user/ksana2015/node_modules/react/lib/PooledClass.js","./ReactElement":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js","./traverseAllChildren":"/home/ec2-user/ksana2015/node_modules/react/lib/traverseAllChildren.js","fbjs/lib/emptyFunction":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyFunction.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactClass.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactClass
 */

'use strict';

var ReactComponent = require('./ReactComponent');
var ReactElement = require('./ReactElement');
var ReactPropTypeLocations = require('./ReactPropTypeLocations');
var ReactPropTypeLocationNames = require('./ReactPropTypeLocationNames');
var ReactNoopUpdateQueue = require('./ReactNoopUpdateQueue');

var assign = require('./Object.assign');
var emptyObject = require('fbjs/lib/emptyObject');
var invariant = require('fbjs/lib/invariant');
var keyMirror = require('fbjs/lib/keyMirror');
var keyOf = require('fbjs/lib/keyOf');
var warning = require('fbjs/lib/warning');

var MIXINS_KEY = keyOf({ mixins: null });

/**
 * Policies that describe methods in `ReactClassInterface`.
 */
var SpecPolicy = keyMirror({
  /**
   * These methods may be defined only once by the class specification or mixin.
   */
  DEFINE_ONCE: null,
  /**
   * These methods may be defined by both the class specification and mixins.
   * Subsequent definitions will be chained. These methods must return void.
   */
  DEFINE_MANY: null,
  /**
   * These methods are overriding the base class.
   */
  OVERRIDE_BASE: null,
  /**
   * These methods are similar to DEFINE_MANY, except we assume they return
   * objects. We try to merge the keys of the return values of all the mixed in
   * functions. If there is a key conflict we throw.
   */
  DEFINE_MANY_MERGED: null
});

var injectedMixins = [];

var warnedSetProps = false;
function warnSetProps() {
  if (!warnedSetProps) {
    warnedSetProps = true;
    process.env.NODE_ENV !== 'production' ? warning(false, 'setProps(...) and replaceProps(...) are deprecated. ' + 'Instead, call render again at the top level.') : undefined;
  }
}

/**
 * Composite components are higher-level components that compose other composite
 * or native components.
 *
 * To create a new type of `ReactClass`, pass a specification of
 * your new class to `React.createClass`. The only requirement of your class
 * specification is that you implement a `render` method.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return <div>Hello World</div>;
 *     }
 *   });
 *
 * The class specification supports a specific protocol of methods that have
 * special meaning (e.g. `render`). See `ReactClassInterface` for
 * more the comprehensive protocol. Any other properties and methods in the
 * class specification will be available on the prototype.
 *
 * @interface ReactClassInterface
 * @internal
 */
var ReactClassInterface = {

  /**
   * An array of Mixin objects to include when defining your component.
   *
   * @type {array}
   * @optional
   */
  mixins: SpecPolicy.DEFINE_MANY,

  /**
   * An object containing properties and methods that should be defined on
   * the component's constructor instead of its prototype (static methods).
   *
   * @type {object}
   * @optional
   */
  statics: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of prop types for this component.
   *
   * @type {object}
   * @optional
   */
  propTypes: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of context types for this component.
   *
   * @type {object}
   * @optional
   */
  contextTypes: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of context types this component sets for its children.
   *
   * @type {object}
   * @optional
   */
  childContextTypes: SpecPolicy.DEFINE_MANY,

  // ==== Definition methods ====

  /**
   * Invoked when the component is mounted. Values in the mapping will be set on
   * `this.props` if that prop is not specified (i.e. using an `in` check).
   *
   * This method is invoked before `getInitialState` and therefore cannot rely
   * on `this.state` or use `this.setState`.
   *
   * @return {object}
   * @optional
   */
  getDefaultProps: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * Invoked once before the component is mounted. The return value will be used
   * as the initial value of `this.state`.
   *
   *   getInitialState: function() {
   *     return {
   *       isOn: false,
   *       fooBaz: new BazFoo()
   *     }
   *   }
   *
   * @return {object}
   * @optional
   */
  getInitialState: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * @return {object}
   * @optional
   */
  getChildContext: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * Uses props from `this.props` and state from `this.state` to render the
   * structure of the component.
   *
   * No guarantees are made about when or how often this method is invoked, so
   * it must not have side effects.
   *
   *   render: function() {
   *     var name = this.props.name;
   *     return <div>Hello, {name}!</div>;
   *   }
   *
   * @return {ReactComponent}
   * @nosideeffects
   * @required
   */
  render: SpecPolicy.DEFINE_ONCE,

  // ==== Delegate methods ====

  /**
   * Invoked when the component is initially created and about to be mounted.
   * This may have side effects, but any external subscriptions or data created
   * by this method must be cleaned up in `componentWillUnmount`.
   *
   * @optional
   */
  componentWillMount: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component has been mounted and has a DOM representation.
   * However, there is no guarantee that the DOM node is in the document.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been mounted (initialized and rendered) for the first time.
   *
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
  componentDidMount: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked before the component receives new props.
   *
   * Use this as an opportunity to react to a prop transition by updating the
   * state using `this.setState`. Current props are accessed via `this.props`.
   *
   *   componentWillReceiveProps: function(nextProps, nextContext) {
   *     this.setState({
   *       likesIncreasing: nextProps.likeCount > this.props.likeCount
   *     });
   *   }
   *
   * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
   * transition may cause a state change, but the opposite is not true. If you
   * need it, you are probably looking for `componentWillUpdate`.
   *
   * @param {object} nextProps
   * @optional
   */
  componentWillReceiveProps: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked while deciding if the component should be updated as a result of
   * receiving new props, state and/or context.
   *
   * Use this as an opportunity to `return false` when you're certain that the
   * transition to the new props/state/context will not require a component
   * update.
   *
   *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
   *     return !equal(nextProps, this.props) ||
   *       !equal(nextState, this.state) ||
   *       !equal(nextContext, this.context);
   *   }
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @param {?object} nextContext
   * @return {boolean} True if the component should update.
   * @optional
   */
  shouldComponentUpdate: SpecPolicy.DEFINE_ONCE,

  /**
   * Invoked when the component is about to update due to a transition from
   * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
   * and `nextContext`.
   *
   * Use this as an opportunity to perform preparation before an update occurs.
   *
   * NOTE: You **cannot** use `this.setState()` in this method.
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @param {?object} nextContext
   * @param {ReactReconcileTransaction} transaction
   * @optional
   */
  componentWillUpdate: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component's DOM representation has been updated.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been updated.
   *
   * @param {object} prevProps
   * @param {?object} prevState
   * @param {?object} prevContext
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
  componentDidUpdate: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component is about to be removed from its parent and have
   * its DOM representation destroyed.
   *
   * Use this as an opportunity to deallocate any external resources.
   *
   * NOTE: There is no `componentDidUnmount` since your component will have been
   * destroyed by that point.
   *
   * @optional
   */
  componentWillUnmount: SpecPolicy.DEFINE_MANY,

  // ==== Advanced methods ====

  /**
   * Updates the component's currently mounted DOM representation.
   *
   * By default, this implements React's rendering and reconciliation algorithm.
   * Sophisticated clients may wish to override this.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   * @overridable
   */
  updateComponent: SpecPolicy.OVERRIDE_BASE

};

/**
 * Mapping from class specification keys to special processing functions.
 *
 * Although these are declared like instance properties in the specification
 * when defining classes using `React.createClass`, they are actually static
 * and are accessible on the constructor instead of the prototype. Despite
 * being static, they must be defined outside of the "statics" key under
 * which all other static methods are defined.
 */
var RESERVED_SPEC_KEYS = {
  displayName: function (Constructor, displayName) {
    Constructor.displayName = displayName;
  },
  mixins: function (Constructor, mixins) {
    if (mixins) {
      for (var i = 0; i < mixins.length; i++) {
        mixSpecIntoComponent(Constructor, mixins[i]);
      }
    }
  },
  childContextTypes: function (Constructor, childContextTypes) {
    if (process.env.NODE_ENV !== 'production') {
      validateTypeDef(Constructor, childContextTypes, ReactPropTypeLocations.childContext);
    }
    Constructor.childContextTypes = assign({}, Constructor.childContextTypes, childContextTypes);
  },
  contextTypes: function (Constructor, contextTypes) {
    if (process.env.NODE_ENV !== 'production') {
      validateTypeDef(Constructor, contextTypes, ReactPropTypeLocations.context);
    }
    Constructor.contextTypes = assign({}, Constructor.contextTypes, contextTypes);
  },
  /**
   * Special case getDefaultProps which should move into statics but requires
   * automatic merging.
   */
  getDefaultProps: function (Constructor, getDefaultProps) {
    if (Constructor.getDefaultProps) {
      Constructor.getDefaultProps = createMergedResultFunction(Constructor.getDefaultProps, getDefaultProps);
    } else {
      Constructor.getDefaultProps = getDefaultProps;
    }
  },
  propTypes: function (Constructor, propTypes) {
    if (process.env.NODE_ENV !== 'production') {
      validateTypeDef(Constructor, propTypes, ReactPropTypeLocations.prop);
    }
    Constructor.propTypes = assign({}, Constructor.propTypes, propTypes);
  },
  statics: function (Constructor, statics) {
    mixStaticSpecIntoComponent(Constructor, statics);
  },
  autobind: function () {} };

// noop
function validateTypeDef(Constructor, typeDef, location) {
  for (var propName in typeDef) {
    if (typeDef.hasOwnProperty(propName)) {
      // use a warning instead of an invariant so components
      // don't show up in prod but not in __DEV__
      process.env.NODE_ENV !== 'production' ? warning(typeof typeDef[propName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', Constructor.displayName || 'ReactClass', ReactPropTypeLocationNames[location], propName) : undefined;
    }
  }
}

function validateMethodOverride(proto, name) {
  var specPolicy = ReactClassInterface.hasOwnProperty(name) ? ReactClassInterface[name] : null;

  // Disallow overriding of base class methods unless explicitly allowed.
  if (ReactClassMixin.hasOwnProperty(name)) {
    !(specPolicy === SpecPolicy.OVERRIDE_BASE) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClassInterface: You are attempting to override ' + '`%s` from your class specification. Ensure that your method names ' + 'do not overlap with React methods.', name) : invariant(false) : undefined;
  }

  // Disallow defining methods more than once unless explicitly allowed.
  if (proto.hasOwnProperty(name)) {
    !(specPolicy === SpecPolicy.DEFINE_MANY || specPolicy === SpecPolicy.DEFINE_MANY_MERGED) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClassInterface: You are attempting to define ' + '`%s` on your component more than once. This conflict may be due ' + 'to a mixin.', name) : invariant(false) : undefined;
  }
}

/**
 * Mixin helper which handles policy validation and reserved
 * specification keys when building React classses.
 */
function mixSpecIntoComponent(Constructor, spec) {
  if (!spec) {
    return;
  }

  !(typeof spec !== 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You\'re attempting to ' + 'use a component class as a mixin. Instead, just use a regular object.') : invariant(false) : undefined;
  !!ReactElement.isValidElement(spec) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You\'re attempting to ' + 'use a component as a mixin. Instead, just use a regular object.') : invariant(false) : undefined;

  var proto = Constructor.prototype;

  // By handling mixins before any other properties, we ensure the same
  // chaining order is applied to methods with DEFINE_MANY policy, whether
  // mixins are listed before or after these methods in the spec.
  if (spec.hasOwnProperty(MIXINS_KEY)) {
    RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
  }

  for (var name in spec) {
    if (!spec.hasOwnProperty(name)) {
      continue;
    }

    if (name === MIXINS_KEY) {
      // We have already handled mixins in a special case above.
      continue;
    }

    var property = spec[name];
    validateMethodOverride(proto, name);

    if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
      RESERVED_SPEC_KEYS[name](Constructor, property);
    } else {
      // Setup methods on prototype:
      // The following member methods should not be automatically bound:
      // 1. Expected ReactClass methods (in the "interface").
      // 2. Overridden methods (that were mixed in).
      var isReactClassMethod = ReactClassInterface.hasOwnProperty(name);
      var isAlreadyDefined = proto.hasOwnProperty(name);
      var isFunction = typeof property === 'function';
      var shouldAutoBind = isFunction && !isReactClassMethod && !isAlreadyDefined && spec.autobind !== false;

      if (shouldAutoBind) {
        if (!proto.__reactAutoBindMap) {
          proto.__reactAutoBindMap = {};
        }
        proto.__reactAutoBindMap[name] = property;
        proto[name] = property;
      } else {
        if (isAlreadyDefined) {
          var specPolicy = ReactClassInterface[name];

          // These cases should already be caught by validateMethodOverride.
          !(isReactClassMethod && (specPolicy === SpecPolicy.DEFINE_MANY_MERGED || specPolicy === SpecPolicy.DEFINE_MANY)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: Unexpected spec policy %s for key %s ' + 'when mixing in component specs.', specPolicy, name) : invariant(false) : undefined;

          // For methods which are defined more than once, call the existing
          // methods before calling the new property, merging if appropriate.
          if (specPolicy === SpecPolicy.DEFINE_MANY_MERGED) {
            proto[name] = createMergedResultFunction(proto[name], property);
          } else if (specPolicy === SpecPolicy.DEFINE_MANY) {
            proto[name] = createChainedFunction(proto[name], property);
          }
        } else {
          proto[name] = property;
          if (process.env.NODE_ENV !== 'production') {
            // Add verbose displayName to the function, which helps when looking
            // at profiling tools.
            if (typeof property === 'function' && spec.displayName) {
              proto[name].displayName = spec.displayName + '_' + name;
            }
          }
        }
      }
    }
  }
}

function mixStaticSpecIntoComponent(Constructor, statics) {
  if (!statics) {
    return;
  }
  for (var name in statics) {
    var property = statics[name];
    if (!statics.hasOwnProperty(name)) {
      continue;
    }

    var isReserved = (name in RESERVED_SPEC_KEYS);
    !!isReserved ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You are attempting to define a reserved ' + 'property, `%s`, that shouldn\'t be on the "statics" key. Define it ' + 'as an instance property instead; it will still be accessible on the ' + 'constructor.', name) : invariant(false) : undefined;

    var isInherited = (name in Constructor);
    !!isInherited ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You are attempting to define ' + '`%s` on your component more than once. This conflict may be ' + 'due to a mixin.', name) : invariant(false) : undefined;
    Constructor[name] = property;
  }
}

/**
 * Merge two objects, but throw if both contain the same key.
 *
 * @param {object} one The first object, which is mutated.
 * @param {object} two The second object
 * @return {object} one after it has been mutated to contain everything in two.
 */
function mergeIntoWithNoDuplicateKeys(one, two) {
  !(one && two && typeof one === 'object' && typeof two === 'object') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.') : invariant(false) : undefined;

  for (var key in two) {
    if (two.hasOwnProperty(key)) {
      !(one[key] === undefined) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'mergeIntoWithNoDuplicateKeys(): ' + 'Tried to merge two objects with the same key: `%s`. This conflict ' + 'may be due to a mixin; in particular, this may be caused by two ' + 'getInitialState() or getDefaultProps() methods returning objects ' + 'with clashing keys.', key) : invariant(false) : undefined;
      one[key] = two[key];
    }
  }
  return one;
}

/**
 * Creates a function that invokes two functions and merges their return values.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createMergedResultFunction(one, two) {
  return function mergedResult() {
    var a = one.apply(this, arguments);
    var b = two.apply(this, arguments);
    if (a == null) {
      return b;
    } else if (b == null) {
      return a;
    }
    var c = {};
    mergeIntoWithNoDuplicateKeys(c, a);
    mergeIntoWithNoDuplicateKeys(c, b);
    return c;
  };
}

/**
 * Creates a function that invokes two functions and ignores their return vales.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createChainedFunction(one, two) {
  return function chainedFunction() {
    one.apply(this, arguments);
    two.apply(this, arguments);
  };
}

/**
 * Binds a method to the component.
 *
 * @param {object} component Component whose method is going to be bound.
 * @param {function} method Method to be bound.
 * @return {function} The bound method.
 */
function bindAutoBindMethod(component, method) {
  var boundMethod = method.bind(component);
  if (process.env.NODE_ENV !== 'production') {
    boundMethod.__reactBoundContext = component;
    boundMethod.__reactBoundMethod = method;
    boundMethod.__reactBoundArguments = null;
    var componentName = component.constructor.displayName;
    var _bind = boundMethod.bind;
    /* eslint-disable block-scoped-var, no-undef */
    boundMethod.bind = function (newThis) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      // User is trying to bind() an autobound method; we effectively will
      // ignore the value of "this" that the user is trying to use, so
      // let's warn.
      if (newThis !== component && newThis !== null) {
        process.env.NODE_ENV !== 'production' ? warning(false, 'bind(): React component methods may only be bound to the ' + 'component instance. See %s', componentName) : undefined;
      } else if (!args.length) {
        process.env.NODE_ENV !== 'production' ? warning(false, 'bind(): You are binding a component method to the component. ' + 'React does this for you automatically in a high-performance ' + 'way, so you can safely remove this call. See %s', componentName) : undefined;
        return boundMethod;
      }
      var reboundMethod = _bind.apply(boundMethod, arguments);
      reboundMethod.__reactBoundContext = component;
      reboundMethod.__reactBoundMethod = method;
      reboundMethod.__reactBoundArguments = args;
      return reboundMethod;
      /* eslint-enable */
    };
  }
  return boundMethod;
}

/**
 * Binds all auto-bound methods in a component.
 *
 * @param {object} component Component whose method is going to be bound.
 */
function bindAutoBindMethods(component) {
  for (var autoBindKey in component.__reactAutoBindMap) {
    if (component.__reactAutoBindMap.hasOwnProperty(autoBindKey)) {
      var method = component.__reactAutoBindMap[autoBindKey];
      component[autoBindKey] = bindAutoBindMethod(component, method);
    }
  }
}

/**
 * Add more to the ReactClass base class. These are all legacy features and
 * therefore not already part of the modern ReactComponent.
 */
var ReactClassMixin = {

  /**
   * TODO: This will be deprecated because state should always keep a consistent
   * type signature and the only use case for this, is to avoid that.
   */
  replaceState: function (newState, callback) {
    this.updater.enqueueReplaceState(this, newState);
    if (callback) {
      this.updater.enqueueCallback(this, callback);
    }
  },

  /**
   * Checks whether or not this composite component is mounted.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function () {
    return this.updater.isMounted(this);
  },

  /**
   * Sets a subset of the props.
   *
   * @param {object} partialProps Subset of the next props.
   * @param {?function} callback Called after props are updated.
   * @final
   * @public
   * @deprecated
   */
  setProps: function (partialProps, callback) {
    if (process.env.NODE_ENV !== 'production') {
      warnSetProps();
    }
    this.updater.enqueueSetProps(this, partialProps);
    if (callback) {
      this.updater.enqueueCallback(this, callback);
    }
  },

  /**
   * Replace all the props.
   *
   * @param {object} newProps Subset of the next props.
   * @param {?function} callback Called after props are updated.
   * @final
   * @public
   * @deprecated
   */
  replaceProps: function (newProps, callback) {
    if (process.env.NODE_ENV !== 'production') {
      warnSetProps();
    }
    this.updater.enqueueReplaceProps(this, newProps);
    if (callback) {
      this.updater.enqueueCallback(this, callback);
    }
  }
};

var ReactClassComponent = function () {};
assign(ReactClassComponent.prototype, ReactComponent.prototype, ReactClassMixin);

/**
 * Module for creating composite components.
 *
 * @class ReactClass
 */
var ReactClass = {

  /**
   * Creates a composite component class given a class specification.
   *
   * @param {object} spec Class specification (which must define `render`).
   * @return {function} Component constructor function.
   * @public
   */
  createClass: function (spec) {
    var Constructor = function (props, context, updater) {
      // This constructor is overridden by mocks. The argument is used
      // by mocks to assert on what gets mounted.

      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(this instanceof Constructor, 'Something is calling a React component directly. Use a factory or ' + 'JSX instead. See: https://fb.me/react-legacyfactory') : undefined;
      }

      // Wire up auto-binding
      if (this.__reactAutoBindMap) {
        bindAutoBindMethods(this);
      }

      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;

      this.state = null;

      // ReactClasses doesn't have constructors. Instead, they use the
      // getInitialState and componentWillMount methods for initialization.

      var initialState = this.getInitialState ? this.getInitialState() : null;
      if (process.env.NODE_ENV !== 'production') {
        // We allow auto-mocks to proceed as if they're returning null.
        if (typeof initialState === 'undefined' && this.getInitialState._isMockFunction) {
          // This is probably bad practice. Consider warning here and
          // deprecating this convenience.
          initialState = null;
        }
      }
      !(typeof initialState === 'object' && !Array.isArray(initialState)) ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s.getInitialState(): must return an object or null', Constructor.displayName || 'ReactCompositeComponent') : invariant(false) : undefined;

      this.state = initialState;
    };
    Constructor.prototype = new ReactClassComponent();
    Constructor.prototype.constructor = Constructor;

    injectedMixins.forEach(mixSpecIntoComponent.bind(null, Constructor));

    mixSpecIntoComponent(Constructor, spec);

    // Initialize the defaultProps property after all mixins have been merged.
    if (Constructor.getDefaultProps) {
      Constructor.defaultProps = Constructor.getDefaultProps();
    }

    if (process.env.NODE_ENV !== 'production') {
      // This is a tag to indicate that the use of these method names is ok,
      // since it's used with createClass. If it's not, then it's likely a
      // mistake so we'll warn you to use the static property, property
      // initializer or constructor respectively.
      if (Constructor.getDefaultProps) {
        Constructor.getDefaultProps.isReactClassApproved = {};
      }
      if (Constructor.prototype.getInitialState) {
        Constructor.prototype.getInitialState.isReactClassApproved = {};
      }
    }

    !Constructor.prototype.render ? process.env.NODE_ENV !== 'production' ? invariant(false, 'createClass(...): Class specification must implement a `render` method.') : invariant(false) : undefined;

    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(!Constructor.prototype.componentShouldUpdate, '%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', spec.displayName || 'A component') : undefined;
      process.env.NODE_ENV !== 'production' ? warning(!Constructor.prototype.componentWillRecieveProps, '%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', spec.displayName || 'A component') : undefined;
    }

    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in ReactClassInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }

    return Constructor;
  },

  injection: {
    injectMixin: function (mixin) {
      injectedMixins.push(mixin);
    }
  }

};

module.exports = ReactClass;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactComponent.js","./ReactElement":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js","./ReactNoopUpdateQueue":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactNoopUpdateQueue.js","./ReactPropTypeLocationNames":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPropTypeLocationNames.js","./ReactPropTypeLocations":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPropTypeLocations.js","fbjs/lib/emptyObject":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyObject.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/keyMirror":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyMirror.js","fbjs/lib/keyOf":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyOf.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactComponent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactComponent
 */

'use strict';

var ReactNoopUpdateQueue = require('./ReactNoopUpdateQueue');

var canDefineProperty = require('./canDefineProperty');
var emptyObject = require('fbjs/lib/emptyObject');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

/**
 * Base class helpers for the updating state of a component.
 */
function ReactComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}

ReactComponent.prototype.isReactComponent = {};

/**
 * Sets a subset of the state. Always use this to mutate
 * state. You should treat `this.state` as immutable.
 *
 * There is no guarantee that `this.state` will be immediately updated, so
 * accessing `this.state` after calling this method may return the old value.
 *
 * There is no guarantee that calls to `setState` will run synchronously,
 * as they may eventually be batched together.  You can provide an optional
 * callback that will be executed when the call to setState is actually
 * completed.
 *
 * When a function is provided to setState, it will be called at some point in
 * the future (not synchronously). It will be called with the up to date
 * component arguments (state, props, context). These values can be different
 * from this.* because your function may be called after receiveProps but before
 * shouldComponentUpdate, and this new state, props, and context will not yet be
 * assigned to this.
 *
 * @param {object|function} partialState Next partial state or function to
 *        produce next partial state to be merged with current state.
 * @param {?function} callback Called after state is updated.
 * @final
 * @protected
 */
ReactComponent.prototype.setState = function (partialState, callback) {
  !(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'setState(...): takes an object of state variables to update or a ' + 'function which returns an object of state variables.') : invariant(false) : undefined;
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_ENV !== 'production' ? warning(partialState != null, 'setState(...): You passed an undefined or null state object; ' + 'instead, use forceUpdate().') : undefined;
  }
  this.updater.enqueueSetState(this, partialState);
  if (callback) {
    this.updater.enqueueCallback(this, callback);
  }
};

/**
 * Forces an update. This should only be invoked when it is known with
 * certainty that we are **not** in a DOM transaction.
 *
 * You may want to call this when you know that some deeper aspect of the
 * component's state has changed but `setState` was not called.
 *
 * This will not invoke `shouldComponentUpdate`, but it will invoke
 * `componentWillUpdate` and `componentDidUpdate`.
 *
 * @param {?function} callback Called after update is complete.
 * @final
 * @protected
 */
ReactComponent.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this);
  if (callback) {
    this.updater.enqueueCallback(this, callback);
  }
};

/**
 * Deprecated APIs. These APIs used to exist on classic React classes but since
 * we would like to deprecate them, we're not going to move them over to this
 * modern base class. Instead, we define a getter that warns if it's accessed.
 */
if (process.env.NODE_ENV !== 'production') {
  var deprecatedAPIs = {
    getDOMNode: ['getDOMNode', 'Use ReactDOM.findDOMNode(component) instead.'],
    isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
    replaceProps: ['replaceProps', 'Instead, call render again at the top level.'],
    replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).'],
    setProps: ['setProps', 'Instead, call render again at the top level.']
  };
  var defineDeprecationWarning = function (methodName, info) {
    if (canDefineProperty) {
      Object.defineProperty(ReactComponent.prototype, methodName, {
        get: function () {
          process.env.NODE_ENV !== 'production' ? warning(false, '%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]) : undefined;
          return undefined;
        }
      });
    }
  };
  for (var fnName in deprecatedAPIs) {
    if (deprecatedAPIs.hasOwnProperty(fnName)) {
      defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
    }
  }
}

module.exports = ReactComponent;
},{"./ReactNoopUpdateQueue":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactNoopUpdateQueue.js","./canDefineProperty":"/home/ec2-user/ksana2015/node_modules/react/lib/canDefineProperty.js","fbjs/lib/emptyObject":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyObject.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactComponentBrowserEnvironment.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactComponentBrowserEnvironment
 */

'use strict';

var ReactDOMIDOperations = require('./ReactDOMIDOperations');
var ReactMount = require('./ReactMount');

/**
 * Abstracts away all functionality of the reconciler that requires knowledge of
 * the browser context. TODO: These callers should be refactored to avoid the
 * need for this injection.
 */
var ReactComponentBrowserEnvironment = {

  processChildrenUpdates: ReactDOMIDOperations.dangerouslyProcessChildrenUpdates,

  replaceNodeWithMarkupByID: ReactDOMIDOperations.dangerouslyReplaceNodeWithMarkupByID,

  /**
   * If a particular environment requires that some resources be cleaned up,
   * specify this in the injected Mixin. In the DOM, we would likely want to
   * purge any cached node ID lookups.
   *
   * @private
   */
  unmountIDFromEnvironment: function (rootNodeID) {
    ReactMount.purgeID(rootNodeID);
  }

};

module.exports = ReactComponentBrowserEnvironment;
},{"./ReactDOMIDOperations":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMIDOperations.js","./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactComponentEnvironment.js":[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactComponentEnvironment
 */

'use strict';

var invariant = require('fbjs/lib/invariant');

var injected = false;

var ReactComponentEnvironment = {

  /**
   * Optionally injectable environment dependent cleanup hook. (server vs.
   * browser etc). Example: A browser system caches DOM nodes based on component
   * ID and must remove that cache entry when this instance is unmounted.
   */
  unmountIDFromEnvironment: null,

  /**
   * Optionally injectable hook for swapping out mount images in the middle of
   * the tree.
   */
  replaceNodeWithMarkupByID: null,

  /**
   * Optionally injectable hook for processing a queue of child updates. Will
   * later move into MultiChildComponents.
   */
  processChildrenUpdates: null,

  injection: {
    injectEnvironment: function (environment) {
      !!injected ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactCompositeComponent: injectEnvironment() can only be called once.') : invariant(false) : undefined;
      ReactComponentEnvironment.unmountIDFromEnvironment = environment.unmountIDFromEnvironment;
      ReactComponentEnvironment.replaceNodeWithMarkupByID = environment.replaceNodeWithMarkupByID;
      ReactComponentEnvironment.processChildrenUpdates = environment.processChildrenUpdates;
      injected = true;
    }
  }

};

module.exports = ReactComponentEnvironment;
},{"fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactCompositeComponent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactCompositeComponent
 */

'use strict';

var ReactComponentEnvironment = require('./ReactComponentEnvironment');
var ReactCurrentOwner = require('./ReactCurrentOwner');
var ReactElement = require('./ReactElement');
var ReactInstanceMap = require('./ReactInstanceMap');
var ReactPerf = require('./ReactPerf');
var ReactPropTypeLocations = require('./ReactPropTypeLocations');
var ReactPropTypeLocationNames = require('./ReactPropTypeLocationNames');
var ReactReconciler = require('./ReactReconciler');
var ReactUpdateQueue = require('./ReactUpdateQueue');

var assign = require('./Object.assign');
var emptyObject = require('fbjs/lib/emptyObject');
var invariant = require('fbjs/lib/invariant');
var shouldUpdateReactComponent = require('./shouldUpdateReactComponent');
var warning = require('fbjs/lib/warning');

function getDeclarationErrorAddendum(component) {
  var owner = component._currentElement._owner || null;
  if (owner) {
    var name = owner.getName();
    if (name) {
      return ' Check the render method of `' + name + '`.';
    }
  }
  return '';
}

function StatelessComponent(Component) {}
StatelessComponent.prototype.render = function () {
  var Component = ReactInstanceMap.get(this)._currentElement.type;
  return Component(this.props, this.context, this.updater);
};

/**
 * ------------------ The Life-Cycle of a Composite Component ------------------
 *
 * - constructor: Initialization of state. The instance is now retained.
 *   - componentWillMount
 *   - render
 *   - [children's constructors]
 *     - [children's componentWillMount and render]
 *     - [children's componentDidMount]
 *     - componentDidMount
 *
 *       Update Phases:
 *       - componentWillReceiveProps (only called if parent updated)
 *       - shouldComponentUpdate
 *         - componentWillUpdate
 *           - render
 *           - [children's constructors or receive props phases]
 *         - componentDidUpdate
 *
 *     - componentWillUnmount
 *     - [children's componentWillUnmount]
 *   - [children destroyed]
 * - (destroyed): The instance is now blank, released by React and ready for GC.
 *
 * -----------------------------------------------------------------------------
 */

/**
 * An incrementing ID assigned to each component when it is mounted. This is
 * used to enforce the order in which `ReactUpdates` updates dirty components.
 *
 * @private
 */
var nextMountID = 1;

/**
 * @lends {ReactCompositeComponent.prototype}
 */
var ReactCompositeComponentMixin = {

  /**
   * Base constructor for all composite component.
   *
   * @param {ReactElement} element
   * @final
   * @internal
   */
  construct: function (element) {
    this._currentElement = element;
    this._rootNodeID = null;
    this._instance = null;

    // See ReactUpdateQueue
    this._pendingElement = null;
    this._pendingStateQueue = null;
    this._pendingReplaceState = false;
    this._pendingForceUpdate = false;

    this._renderedComponent = null;

    this._context = null;
    this._mountOrder = 0;
    this._topLevelWrapper = null;

    // See ReactUpdates and ReactUpdateQueue.
    this._pendingCallbacks = null;
  },

  /**
   * Initializes the component, renders markup, and registers event listeners.
   *
   * @param {string} rootID DOM ID of the root node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {?string} Rendered markup to be inserted into the DOM.
   * @final
   * @internal
   */
  mountComponent: function (rootID, transaction, context) {
    this._context = context;
    this._mountOrder = nextMountID++;
    this._rootNodeID = rootID;

    var publicProps = this._processProps(this._currentElement.props);
    var publicContext = this._processContext(context);

    var Component = this._currentElement.type;

    // Initialize the public class
    var inst;
    var renderedElement;

    // This is a way to detect if Component is a stateless arrow function
    // component, which is not newable. It might not be 100% reliable but is
    // something we can do until we start detecting that Component extends
    // React.Component. We already assume that typeof Component === 'function'.
    var canInstantiate = ('prototype' in Component);

    if (canInstantiate) {
      if (process.env.NODE_ENV !== 'production') {
        ReactCurrentOwner.current = this;
        try {
          inst = new Component(publicProps, publicContext, ReactUpdateQueue);
        } finally {
          ReactCurrentOwner.current = null;
        }
      } else {
        inst = new Component(publicProps, publicContext, ReactUpdateQueue);
      }
    }

    if (!canInstantiate || inst === null || inst === false || ReactElement.isValidElement(inst)) {
      renderedElement = inst;
      inst = new StatelessComponent(Component);
    }

    if (process.env.NODE_ENV !== 'production') {
      // This will throw later in _renderValidatedComponent, but add an early
      // warning now to help debugging
      if (inst.render == null) {
        process.env.NODE_ENV !== 'production' ? warning(false, '%s(...): No `render` method found on the returned component ' + 'instance: you may have forgotten to define `render`, returned ' + 'null/false from a stateless component, or tried to render an ' + 'element whose type is a function that isn\'t a React component.', Component.displayName || Component.name || 'Component') : undefined;
      } else {
        // We support ES6 inheriting from React.Component, the module pattern,
        // and stateless components, but not ES6 classes that don't extend
        process.env.NODE_ENV !== 'production' ? warning(Component.prototype && Component.prototype.isReactComponent || !canInstantiate || !(inst instanceof Component), '%s(...): React component classes must extend React.Component.', Component.displayName || Component.name || 'Component') : undefined;
      }
    }

    // These should be set up in the constructor, but as a convenience for
    // simpler class abstractions, we set them up after the fact.
    inst.props = publicProps;
    inst.context = publicContext;
    inst.refs = emptyObject;
    inst.updater = ReactUpdateQueue;

    this._instance = inst;

    // Store a reference from the instance back to the internal representation
    ReactInstanceMap.set(inst, this);

    if (process.env.NODE_ENV !== 'production') {
      // Since plain JS classes are defined without any special initialization
      // logic, we can not catch common errors early. Therefore, we have to
      // catch them here, at initialization time, instead.
      process.env.NODE_ENV !== 'production' ? warning(!inst.getInitialState || inst.getInitialState.isReactClassApproved, 'getInitialState was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Did you mean to define a state property instead?', this.getName() || 'a component') : undefined;
      process.env.NODE_ENV !== 'production' ? warning(!inst.getDefaultProps || inst.getDefaultProps.isReactClassApproved, 'getDefaultProps was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Use a static property to define defaultProps instead.', this.getName() || 'a component') : undefined;
      process.env.NODE_ENV !== 'production' ? warning(!inst.propTypes, 'propTypes was defined as an instance property on %s. Use a static ' + 'property to define propTypes instead.', this.getName() || 'a component') : undefined;
      process.env.NODE_ENV !== 'production' ? warning(!inst.contextTypes, 'contextTypes was defined as an instance property on %s. Use a ' + 'static property to define contextTypes instead.', this.getName() || 'a component') : undefined;
      process.env.NODE_ENV !== 'production' ? warning(typeof inst.componentShouldUpdate !== 'function', '%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', this.getName() || 'A component') : undefined;
      process.env.NODE_ENV !== 'production' ? warning(typeof inst.componentDidUnmount !== 'function', '%s has a method called ' + 'componentDidUnmount(). But there is no such lifecycle method. ' + 'Did you mean componentWillUnmount()?', this.getName() || 'A component') : undefined;
      process.env.NODE_ENV !== 'production' ? warning(typeof inst.componentWillRecieveProps !== 'function', '%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', this.getName() || 'A component') : undefined;
    }

    var initialState = inst.state;
    if (initialState === undefined) {
      inst.state = initialState = null;
    }
    !(typeof initialState === 'object' && !Array.isArray(initialState)) ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s.state: must be set to an object or null', this.getName() || 'ReactCompositeComponent') : invariant(false) : undefined;

    this._pendingStateQueue = null;
    this._pendingReplaceState = false;
    this._pendingForceUpdate = false;

    if (inst.componentWillMount) {
      inst.componentWillMount();
      // When mounting, calls to `setState` by `componentWillMount` will set
      // `this._pendingStateQueue` without triggering a re-render.
      if (this._pendingStateQueue) {
        inst.state = this._processPendingState(inst.props, inst.context);
      }
    }

    // If not a stateless component, we now render
    if (renderedElement === undefined) {
      renderedElement = this._renderValidatedComponent();
    }

    this._renderedComponent = this._instantiateReactComponent(renderedElement);

    var markup = ReactReconciler.mountComponent(this._renderedComponent, rootID, transaction, this._processChildContext(context));
    if (inst.componentDidMount) {
      transaction.getReactMountReady().enqueue(inst.componentDidMount, inst);
    }

    return markup;
  },

  /**
   * Releases any resources allocated by `mountComponent`.
   *
   * @final
   * @internal
   */
  unmountComponent: function () {
    var inst = this._instance;

    if (inst.componentWillUnmount) {
      inst.componentWillUnmount();
    }

    ReactReconciler.unmountComponent(this._renderedComponent);
    this._renderedComponent = null;
    this._instance = null;

    // Reset pending fields
    // Even if this component is scheduled for another update in ReactUpdates,
    // it would still be ignored because these fields are reset.
    this._pendingStateQueue = null;
    this._pendingReplaceState = false;
    this._pendingForceUpdate = false;
    this._pendingCallbacks = null;
    this._pendingElement = null;

    // These fields do not really need to be reset since this object is no
    // longer accessible.
    this._context = null;
    this._rootNodeID = null;
    this._topLevelWrapper = null;

    // Delete the reference from the instance to this internal representation
    // which allow the internals to be properly cleaned up even if the user
    // leaks a reference to the public instance.
    ReactInstanceMap.remove(inst);

    // Some existing components rely on inst.props even after they've been
    // destroyed (in event handlers).
    // TODO: inst.props = null;
    // TODO: inst.state = null;
    // TODO: inst.context = null;
  },

  /**
   * Filters the context object to only contain keys specified in
   * `contextTypes`
   *
   * @param {object} context
   * @return {?object}
   * @private
   */
  _maskContext: function (context) {
    var maskedContext = null;
    var Component = this._currentElement.type;
    var contextTypes = Component.contextTypes;
    if (!contextTypes) {
      return emptyObject;
    }
    maskedContext = {};
    for (var contextName in contextTypes) {
      maskedContext[contextName] = context[contextName];
    }
    return maskedContext;
  },

  /**
   * Filters the context object to only contain keys specified in
   * `contextTypes`, and asserts that they are valid.
   *
   * @param {object} context
   * @return {?object}
   * @private
   */
  _processContext: function (context) {
    var maskedContext = this._maskContext(context);
    if (process.env.NODE_ENV !== 'production') {
      var Component = this._currentElement.type;
      if (Component.contextTypes) {
        this._checkPropTypes(Component.contextTypes, maskedContext, ReactPropTypeLocations.context);
      }
    }
    return maskedContext;
  },

  /**
   * @param {object} currentContext
   * @return {object}
   * @private
   */
  _processChildContext: function (currentContext) {
    var Component = this._currentElement.type;
    var inst = this._instance;
    var childContext = inst.getChildContext && inst.getChildContext();
    if (childContext) {
      !(typeof Component.childContextTypes === 'object') ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s.getChildContext(): childContextTypes must be defined in order to ' + 'use getChildContext().', this.getName() || 'ReactCompositeComponent') : invariant(false) : undefined;
      if (process.env.NODE_ENV !== 'production') {
        this._checkPropTypes(Component.childContextTypes, childContext, ReactPropTypeLocations.childContext);
      }
      for (var name in childContext) {
        !(name in Component.childContextTypes) ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s.getChildContext(): key "%s" is not defined in childContextTypes.', this.getName() || 'ReactCompositeComponent', name) : invariant(false) : undefined;
      }
      return assign({}, currentContext, childContext);
    }
    return currentContext;
  },

  /**
   * Processes props by setting default values for unspecified props and
   * asserting that the props are valid. Does not mutate its argument; returns
   * a new props object with defaults merged in.
   *
   * @param {object} newProps
   * @return {object}
   * @private
   */
  _processProps: function (newProps) {
    if (process.env.NODE_ENV !== 'production') {
      var Component = this._currentElement.type;
      if (Component.propTypes) {
        this._checkPropTypes(Component.propTypes, newProps, ReactPropTypeLocations.prop);
      }
    }
    return newProps;
  },

  /**
   * Assert that the props are valid
   *
   * @param {object} propTypes Map of prop name to a ReactPropType
   * @param {object} props
   * @param {string} location e.g. "prop", "context", "child context"
   * @private
   */
  _checkPropTypes: function (propTypes, props, location) {
    // TODO: Stop validating prop types here and only use the element
    // validation.
    var componentName = this.getName();
    for (var propName in propTypes) {
      if (propTypes.hasOwnProperty(propName)) {
        var error;
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          !(typeof propTypes[propName] === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s: %s type `%s` is invalid; it must be a function, usually ' + 'from React.PropTypes.', componentName || 'React class', ReactPropTypeLocationNames[location], propName) : invariant(false) : undefined;
          error = propTypes[propName](props, propName, componentName, location);
        } catch (ex) {
          error = ex;
        }
        if (error instanceof Error) {
          // We may want to extend this logic for similar errors in
          // top-level render calls, so I'm abstracting it away into
          // a function to minimize refactoring in the future
          var addendum = getDeclarationErrorAddendum(this);

          if (location === ReactPropTypeLocations.prop) {
            // Preface gives us something to blacklist in warning module
            process.env.NODE_ENV !== 'production' ? warning(false, 'Failed Composite propType: %s%s', error.message, addendum) : undefined;
          } else {
            process.env.NODE_ENV !== 'production' ? warning(false, 'Failed Context Types: %s%s', error.message, addendum) : undefined;
          }
        }
      }
    }
  },

  receiveComponent: function (nextElement, transaction, nextContext) {
    var prevElement = this._currentElement;
    var prevContext = this._context;

    this._pendingElement = null;

    this.updateComponent(transaction, prevElement, nextElement, prevContext, nextContext);
  },

  /**
   * If any of `_pendingElement`, `_pendingStateQueue`, or `_pendingForceUpdate`
   * is set, update the component.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  performUpdateIfNecessary: function (transaction) {
    if (this._pendingElement != null) {
      ReactReconciler.receiveComponent(this, this._pendingElement || this._currentElement, transaction, this._context);
    }

    if (this._pendingStateQueue !== null || this._pendingForceUpdate) {
      this.updateComponent(transaction, this._currentElement, this._currentElement, this._context, this._context);
    }
  },

  /**
   * Perform an update to a mounted component. The componentWillReceiveProps and
   * shouldComponentUpdate methods are called, then (assuming the update isn't
   * skipped) the remaining update lifecycle methods are called and the DOM
   * representation is updated.
   *
   * By default, this implements React's rendering and reconciliation algorithm.
   * Sophisticated clients may wish to override this.
   *
   * @param {ReactReconcileTransaction} transaction
   * @param {ReactElement} prevParentElement
   * @param {ReactElement} nextParentElement
   * @internal
   * @overridable
   */
  updateComponent: function (transaction, prevParentElement, nextParentElement, prevUnmaskedContext, nextUnmaskedContext) {
    var inst = this._instance;

    var nextContext = this._context === nextUnmaskedContext ? inst.context : this._processContext(nextUnmaskedContext);
    var nextProps;

    // Distinguish between a props update versus a simple state update
    if (prevParentElement === nextParentElement) {
      // Skip checking prop types again -- we don't read inst.props to avoid
      // warning for DOM component props in this upgrade
      nextProps = nextParentElement.props;
    } else {
      nextProps = this._processProps(nextParentElement.props);
      // An update here will schedule an update but immediately set
      // _pendingStateQueue which will ensure that any state updates gets
      // immediately reconciled instead of waiting for the next batch.

      if (inst.componentWillReceiveProps) {
        inst.componentWillReceiveProps(nextProps, nextContext);
      }
    }

    var nextState = this._processPendingState(nextProps, nextContext);

    var shouldUpdate = this._pendingForceUpdate || !inst.shouldComponentUpdate || inst.shouldComponentUpdate(nextProps, nextState, nextContext);

    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(typeof shouldUpdate !== 'undefined', '%s.shouldComponentUpdate(): Returned undefined instead of a ' + 'boolean value. Make sure to return true or false.', this.getName() || 'ReactCompositeComponent') : undefined;
    }

    if (shouldUpdate) {
      this._pendingForceUpdate = false;
      // Will set `this.props`, `this.state` and `this.context`.
      this._performComponentUpdate(nextParentElement, nextProps, nextState, nextContext, transaction, nextUnmaskedContext);
    } else {
      // If it's determined that a component should not update, we still want
      // to set props and state but we shortcut the rest of the update.
      this._currentElement = nextParentElement;
      this._context = nextUnmaskedContext;
      inst.props = nextProps;
      inst.state = nextState;
      inst.context = nextContext;
    }
  },

  _processPendingState: function (props, context) {
    var inst = this._instance;
    var queue = this._pendingStateQueue;
    var replace = this._pendingReplaceState;
    this._pendingReplaceState = false;
    this._pendingStateQueue = null;

    if (!queue) {
      return inst.state;
    }

    if (replace && queue.length === 1) {
      return queue[0];
    }

    var nextState = assign({}, replace ? queue[0] : inst.state);
    for (var i = replace ? 1 : 0; i < queue.length; i++) {
      var partial = queue[i];
      assign(nextState, typeof partial === 'function' ? partial.call(inst, nextState, props, context) : partial);
    }

    return nextState;
  },

  /**
   * Merges new props and state, notifies delegate methods of update and
   * performs update.
   *
   * @param {ReactElement} nextElement Next element
   * @param {object} nextProps Next public object to set as properties.
   * @param {?object} nextState Next object to set as state.
   * @param {?object} nextContext Next public object to set as context.
   * @param {ReactReconcileTransaction} transaction
   * @param {?object} unmaskedContext
   * @private
   */
  _performComponentUpdate: function (nextElement, nextProps, nextState, nextContext, transaction, unmaskedContext) {
    var inst = this._instance;

    var hasComponentDidUpdate = Boolean(inst.componentDidUpdate);
    var prevProps;
    var prevState;
    var prevContext;
    if (hasComponentDidUpdate) {
      prevProps = inst.props;
      prevState = inst.state;
      prevContext = inst.context;
    }

    if (inst.componentWillUpdate) {
      inst.componentWillUpdate(nextProps, nextState, nextContext);
    }

    this._currentElement = nextElement;
    this._context = unmaskedContext;
    inst.props = nextProps;
    inst.state = nextState;
    inst.context = nextContext;

    this._updateRenderedComponent(transaction, unmaskedContext);

    if (hasComponentDidUpdate) {
      transaction.getReactMountReady().enqueue(inst.componentDidUpdate.bind(inst, prevProps, prevState, prevContext), inst);
    }
  },

  /**
   * Call the component's `render` method and update the DOM accordingly.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  _updateRenderedComponent: function (transaction, context) {
    var prevComponentInstance = this._renderedComponent;
    var prevRenderedElement = prevComponentInstance._currentElement;
    var nextRenderedElement = this._renderValidatedComponent();
    if (shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement)) {
      ReactReconciler.receiveComponent(prevComponentInstance, nextRenderedElement, transaction, this._processChildContext(context));
    } else {
      // These two IDs are actually the same! But nothing should rely on that.
      var thisID = this._rootNodeID;
      var prevComponentID = prevComponentInstance._rootNodeID;
      ReactReconciler.unmountComponent(prevComponentInstance);

      this._renderedComponent = this._instantiateReactComponent(nextRenderedElement);
      var nextMarkup = ReactReconciler.mountComponent(this._renderedComponent, thisID, transaction, this._processChildContext(context));
      this._replaceNodeWithMarkupByID(prevComponentID, nextMarkup);
    }
  },

  /**
   * @protected
   */
  _replaceNodeWithMarkupByID: function (prevComponentID, nextMarkup) {
    ReactComponentEnvironment.replaceNodeWithMarkupByID(prevComponentID, nextMarkup);
  },

  /**
   * @protected
   */
  _renderValidatedComponentWithoutOwnerOrContext: function () {
    var inst = this._instance;
    var renderedComponent = inst.render();
    if (process.env.NODE_ENV !== 'production') {
      // We allow auto-mocks to proceed as if they're returning null.
      if (typeof renderedComponent === 'undefined' && inst.render._isMockFunction) {
        // This is probably bad practice. Consider warning here and
        // deprecating this convenience.
        renderedComponent = null;
      }
    }

    return renderedComponent;
  },

  /**
   * @private
   */
  _renderValidatedComponent: function () {
    var renderedComponent;
    ReactCurrentOwner.current = this;
    try {
      renderedComponent = this._renderValidatedComponentWithoutOwnerOrContext();
    } finally {
      ReactCurrentOwner.current = null;
    }
    !(
    // TODO: An `isValidNode` function would probably be more appropriate
    renderedComponent === null || renderedComponent === false || ReactElement.isValidElement(renderedComponent)) ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s.render(): A valid ReactComponent must be returned. You may have ' + 'returned undefined, an array or some other invalid object.', this.getName() || 'ReactCompositeComponent') : invariant(false) : undefined;
    return renderedComponent;
  },

  /**
   * Lazily allocates the refs object and stores `component` as `ref`.
   *
   * @param {string} ref Reference name.
   * @param {component} component Component to store as `ref`.
   * @final
   * @private
   */
  attachRef: function (ref, component) {
    var inst = this.getPublicInstance();
    !(inst != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Stateless function components cannot have refs.') : invariant(false) : undefined;
    var publicComponentInstance = component.getPublicInstance();
    if (process.env.NODE_ENV !== 'production') {
      var componentName = component && component.getName ? component.getName() : 'a component';
      process.env.NODE_ENV !== 'production' ? warning(publicComponentInstance != null, 'Stateless function components cannot be given refs ' + '(See ref "%s" in %s created by %s). ' + 'Attempts to access this ref will fail.', ref, componentName, this.getName()) : undefined;
    }
    var refs = inst.refs === emptyObject ? inst.refs = {} : inst.refs;
    refs[ref] = publicComponentInstance;
  },

  /**
   * Detaches a reference name.
   *
   * @param {string} ref Name to dereference.
   * @final
   * @private
   */
  detachRef: function (ref) {
    var refs = this.getPublicInstance().refs;
    delete refs[ref];
  },

  /**
   * Get a text description of the component that can be used to identify it
   * in error messages.
   * @return {string} The name or null.
   * @internal
   */
  getName: function () {
    var type = this._currentElement.type;
    var constructor = this._instance && this._instance.constructor;
    return type.displayName || constructor && constructor.displayName || type.name || constructor && constructor.name || null;
  },

  /**
   * Get the publicly accessible representation of this component - i.e. what
   * is exposed by refs and returned by render. Can be null for stateless
   * components.
   *
   * @return {ReactComponent} the public component instance.
   * @internal
   */
  getPublicInstance: function () {
    var inst = this._instance;
    if (inst instanceof StatelessComponent) {
      return null;
    }
    return inst;
  },

  // Stub
  _instantiateReactComponent: null

};

ReactPerf.measureMethods(ReactCompositeComponentMixin, 'ReactCompositeComponent', {
  mountComponent: 'mountComponent',
  updateComponent: 'updateComponent',
  _renderValidatedComponent: '_renderValidatedComponent'
});

var ReactCompositeComponent = {

  Mixin: ReactCompositeComponentMixin

};

module.exports = ReactCompositeComponent;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactComponentEnvironment":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactComponentEnvironment.js","./ReactCurrentOwner":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactCurrentOwner.js","./ReactElement":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js","./ReactInstanceMap":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInstanceMap.js","./ReactPerf":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPerf.js","./ReactPropTypeLocationNames":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPropTypeLocationNames.js","./ReactPropTypeLocations":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPropTypeLocations.js","./ReactReconciler":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactReconciler.js","./ReactUpdateQueue":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdateQueue.js","./shouldUpdateReactComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/shouldUpdateReactComponent.js","fbjs/lib/emptyObject":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyObject.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactCurrentOwner.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactCurrentOwner
 */

'use strict';

/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 */
var ReactCurrentOwner = {

  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null

};

module.exports = ReactCurrentOwner;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOM.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOM
 */

/* globals __REACT_DEVTOOLS_GLOBAL_HOOK__*/

'use strict';

var ReactCurrentOwner = require('./ReactCurrentOwner');
var ReactDOMTextComponent = require('./ReactDOMTextComponent');
var ReactDefaultInjection = require('./ReactDefaultInjection');
var ReactInstanceHandles = require('./ReactInstanceHandles');
var ReactMount = require('./ReactMount');
var ReactPerf = require('./ReactPerf');
var ReactReconciler = require('./ReactReconciler');
var ReactUpdates = require('./ReactUpdates');
var ReactVersion = require('./ReactVersion');

var findDOMNode = require('./findDOMNode');
var renderSubtreeIntoContainer = require('./renderSubtreeIntoContainer');
var warning = require('fbjs/lib/warning');

ReactDefaultInjection.inject();

var render = ReactPerf.measure('React', 'render', ReactMount.render);

var React = {
  findDOMNode: findDOMNode,
  render: render,
  unmountComponentAtNode: ReactMount.unmountComponentAtNode,
  version: ReactVersion,

  /* eslint-disable camelcase */
  unstable_batchedUpdates: ReactUpdates.batchedUpdates,
  unstable_renderSubtreeIntoContainer: renderSubtreeIntoContainer
};

// Inject the runtime into a devtools global hook regardless of browser.
// Allows for debugging when the hook is injected on the page.
/* eslint-enable camelcase */
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.inject === 'function') {
  __REACT_DEVTOOLS_GLOBAL_HOOK__.inject({
    CurrentOwner: ReactCurrentOwner,
    InstanceHandles: ReactInstanceHandles,
    Mount: ReactMount,
    Reconciler: ReactReconciler,
    TextComponent: ReactDOMTextComponent
  });
}

if (process.env.NODE_ENV !== 'production') {
  var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');
  if (ExecutionEnvironment.canUseDOM && window.top === window.self) {

    // First check if devtools is not installed
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
      // If we're in Chrome or Firefox, provide a download link if not installed.
      if (navigator.userAgent.indexOf('Chrome') > -1 && navigator.userAgent.indexOf('Edge') === -1 || navigator.userAgent.indexOf('Firefox') > -1) {
        console.debug('Download the React DevTools for a better development experience: ' + 'https://fb.me/react-devtools');
      }
    }

    // If we're in IE8, check to see if we are in compatibility mode and provide
    // information on preventing compatibility mode
    var ieCompatibilityMode = document.documentMode && document.documentMode < 8;

    process.env.NODE_ENV !== 'production' ? warning(!ieCompatibilityMode, 'Internet Explorer is running in compatibility mode; please add the ' + 'following tag to your HTML to prevent this from happening: ' + '<meta http-equiv="X-UA-Compatible" content="IE=edge" />') : undefined;

    var expectedFeatures = [
    // shims
    Array.isArray, Array.prototype.every, Array.prototype.forEach, Array.prototype.indexOf, Array.prototype.map, Date.now, Function.prototype.bind, Object.keys, String.prototype.split, String.prototype.trim,

    // shams
    Object.create, Object.freeze];

    for (var i = 0; i < expectedFeatures.length; i++) {
      if (!expectedFeatures[i]) {
        console.error('One or more ES5 shim/shams expected by React are not available: ' + 'https://fb.me/react-warning-polyfills');
        break;
      }
    }
  }
}

module.exports = React;
},{"./ReactCurrentOwner":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactCurrentOwner.js","./ReactDOMTextComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMTextComponent.js","./ReactDefaultInjection":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDefaultInjection.js","./ReactInstanceHandles":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInstanceHandles.js","./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js","./ReactPerf":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPerf.js","./ReactReconciler":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactReconciler.js","./ReactUpdates":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdates.js","./ReactVersion":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactVersion.js","./findDOMNode":"/home/ec2-user/ksana2015/node_modules/react/lib/findDOMNode.js","./renderSubtreeIntoContainer":"/home/ec2-user/ksana2015/node_modules/react/lib/renderSubtreeIntoContainer.js","fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMButton.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMButton
 */

'use strict';

var mouseListenerNames = {
  onClick: true,
  onDoubleClick: true,
  onMouseDown: true,
  onMouseMove: true,
  onMouseUp: true,

  onClickCapture: true,
  onDoubleClickCapture: true,
  onMouseDownCapture: true,
  onMouseMoveCapture: true,
  onMouseUpCapture: true
};

/**
 * Implements a <button> native component that does not receive mouse events
 * when `disabled` is set.
 */
var ReactDOMButton = {
  getNativeProps: function (inst, props, context) {
    if (!props.disabled) {
      return props;
    }

    // Copy the props, except the mouse listeners
    var nativeProps = {};
    for (var key in props) {
      if (props.hasOwnProperty(key) && !mouseListenerNames[key]) {
        nativeProps[key] = props[key];
      }
    }

    return nativeProps;
  }
};

module.exports = ReactDOMButton;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMComponent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMComponent
 * @typechecks static-only
 */

/* global hasOwnProperty:true */

'use strict';

var AutoFocusUtils = require('./AutoFocusUtils');
var CSSPropertyOperations = require('./CSSPropertyOperations');
var DOMProperty = require('./DOMProperty');
var DOMPropertyOperations = require('./DOMPropertyOperations');
var EventConstants = require('./EventConstants');
var ReactBrowserEventEmitter = require('./ReactBrowserEventEmitter');
var ReactComponentBrowserEnvironment = require('./ReactComponentBrowserEnvironment');
var ReactDOMButton = require('./ReactDOMButton');
var ReactDOMInput = require('./ReactDOMInput');
var ReactDOMOption = require('./ReactDOMOption');
var ReactDOMSelect = require('./ReactDOMSelect');
var ReactDOMTextarea = require('./ReactDOMTextarea');
var ReactMount = require('./ReactMount');
var ReactMultiChild = require('./ReactMultiChild');
var ReactPerf = require('./ReactPerf');
var ReactUpdateQueue = require('./ReactUpdateQueue');

var assign = require('./Object.assign');
var canDefineProperty = require('./canDefineProperty');
var escapeTextContentForBrowser = require('./escapeTextContentForBrowser');
var invariant = require('fbjs/lib/invariant');
var isEventSupported = require('./isEventSupported');
var keyOf = require('fbjs/lib/keyOf');
var setInnerHTML = require('./setInnerHTML');
var setTextContent = require('./setTextContent');
var shallowEqual = require('fbjs/lib/shallowEqual');
var validateDOMNesting = require('./validateDOMNesting');
var warning = require('fbjs/lib/warning');

var deleteListener = ReactBrowserEventEmitter.deleteListener;
var listenTo = ReactBrowserEventEmitter.listenTo;
var registrationNameModules = ReactBrowserEventEmitter.registrationNameModules;

// For quickly matching children type, to test if can be treated as content.
var CONTENT_TYPES = { 'string': true, 'number': true };

var CHILDREN = keyOf({ children: null });
var STYLE = keyOf({ style: null });
var HTML = keyOf({ __html: null });

var ELEMENT_NODE_TYPE = 1;

function getDeclarationErrorAddendum(internalInstance) {
  if (internalInstance) {
    var owner = internalInstance._currentElement._owner || null;
    if (owner) {
      var name = owner.getName();
      if (name) {
        return ' This DOM node was rendered by `' + name + '`.';
      }
    }
  }
  return '';
}

var legacyPropsDescriptor;
if (process.env.NODE_ENV !== 'production') {
  legacyPropsDescriptor = {
    props: {
      enumerable: false,
      get: function () {
        var component = this._reactInternalComponent;
        process.env.NODE_ENV !== 'production' ? warning(false, 'ReactDOMComponent: Do not access .props of a DOM node; instead, ' + 'recreate the props as `render` did originally or read the DOM ' + 'properties/attributes directly from this node (e.g., ' + 'this.refs.box.className).%s', getDeclarationErrorAddendum(component)) : undefined;
        return component._currentElement.props;
      }
    }
  };
}

function legacyGetDOMNode() {
  if (process.env.NODE_ENV !== 'production') {
    var component = this._reactInternalComponent;
    process.env.NODE_ENV !== 'production' ? warning(false, 'ReactDOMComponent: Do not access .getDOMNode() of a DOM node; ' + 'instead, use the node directly.%s', getDeclarationErrorAddendum(component)) : undefined;
  }
  return this;
}

function legacyIsMounted() {
  var component = this._reactInternalComponent;
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_ENV !== 'production' ? warning(false, 'ReactDOMComponent: Do not access .isMounted() of a DOM node.%s', getDeclarationErrorAddendum(component)) : undefined;
  }
  return !!component;
}

function legacySetStateEtc() {
  if (process.env.NODE_ENV !== 'production') {
    var component = this._reactInternalComponent;
    process.env.NODE_ENV !== 'production' ? warning(false, 'ReactDOMComponent: Do not access .setState(), .replaceState(), or ' + '.forceUpdate() of a DOM node. This is a no-op.%s', getDeclarationErrorAddendum(component)) : undefined;
  }
}

function legacySetProps(partialProps, callback) {
  var component = this._reactInternalComponent;
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_ENV !== 'production' ? warning(false, 'ReactDOMComponent: Do not access .setProps() of a DOM node. ' + 'Instead, call ReactDOM.render again at the top level.%s', getDeclarationErrorAddendum(component)) : undefined;
  }
  if (!component) {
    return;
  }
  ReactUpdateQueue.enqueueSetPropsInternal(component, partialProps);
  if (callback) {
    ReactUpdateQueue.enqueueCallbackInternal(component, callback);
  }
}

function legacyReplaceProps(partialProps, callback) {
  var component = this._reactInternalComponent;
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_ENV !== 'production' ? warning(false, 'ReactDOMComponent: Do not access .replaceProps() of a DOM node. ' + 'Instead, call ReactDOM.render again at the top level.%s', getDeclarationErrorAddendum(component)) : undefined;
  }
  if (!component) {
    return;
  }
  ReactUpdateQueue.enqueueReplacePropsInternal(component, partialProps);
  if (callback) {
    ReactUpdateQueue.enqueueCallbackInternal(component, callback);
  }
}

function friendlyStringify(obj) {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return '[' + obj.map(friendlyStringify).join(', ') + ']';
    } else {
      var pairs = [];
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          var keyEscaped = /^[a-z$_][\w$_]*$/i.test(key) ? key : JSON.stringify(key);
          pairs.push(keyEscaped + ': ' + friendlyStringify(obj[key]));
        }
      }
      return '{' + pairs.join(', ') + '}';
    }
  } else if (typeof obj === 'string') {
    return JSON.stringify(obj);
  } else if (typeof obj === 'function') {
    return '[function object]';
  }
  // Differs from JSON.stringify in that undefined becauses undefined and that
  // inf and nan don't become null
  return String(obj);
}

var styleMutationWarning = {};

function checkAndWarnForMutatedStyle(style1, style2, component) {
  if (style1 == null || style2 == null) {
    return;
  }
  if (shallowEqual(style1, style2)) {
    return;
  }

  var componentName = component._tag;
  var owner = component._currentElement._owner;
  var ownerName;
  if (owner) {
    ownerName = owner.getName();
  }

  var hash = ownerName + '|' + componentName;

  if (styleMutationWarning.hasOwnProperty(hash)) {
    return;
  }

  styleMutationWarning[hash] = true;

  process.env.NODE_ENV !== 'production' ? warning(false, '`%s` was passed a style object that has previously been mutated. ' + 'Mutating `style` is deprecated. Consider cloning it beforehand. Check ' + 'the `render` %s. Previous style: %s. Mutated style: %s.', componentName, owner ? 'of `' + ownerName + '`' : 'using <' + componentName + '>', friendlyStringify(style1), friendlyStringify(style2)) : undefined;
}

/**
 * @param {object} component
 * @param {?object} props
 */
function assertValidProps(component, props) {
  if (!props) {
    return;
  }
  // Note the use of `==` which checks for null or undefined.
  if (process.env.NODE_ENV !== 'production') {
    if (voidElementTags[component._tag]) {
      process.env.NODE_ENV !== 'production' ? warning(props.children == null && props.dangerouslySetInnerHTML == null, '%s is a void element tag and must not have `children` or ' + 'use `props.dangerouslySetInnerHTML`.%s', component._tag, component._currentElement._owner ? ' Check the render method of ' + component._currentElement._owner.getName() + '.' : '') : undefined;
    }
  }
  if (props.dangerouslySetInnerHTML != null) {
    !(props.children == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Can only set one of `children` or `props.dangerouslySetInnerHTML`.') : invariant(false) : undefined;
    !(typeof props.dangerouslySetInnerHTML === 'object' && HTML in props.dangerouslySetInnerHTML) ? process.env.NODE_ENV !== 'production' ? invariant(false, '`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' + 'Please visit https://fb.me/react-invariant-dangerously-set-inner-html ' + 'for more information.') : invariant(false) : undefined;
  }
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_ENV !== 'production' ? warning(props.innerHTML == null, 'Directly setting property `innerHTML` is not permitted. ' + 'For more information, lookup documentation on `dangerouslySetInnerHTML`.') : undefined;
    process.env.NODE_ENV !== 'production' ? warning(!props.contentEditable || props.children == null, 'A component is `contentEditable` and contains `children` managed by ' + 'React. It is now your responsibility to guarantee that none of ' + 'those nodes are unexpectedly modified or duplicated. This is ' + 'probably not intentional.') : undefined;
  }
  !(props.style == null || typeof props.style === 'object') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'The `style` prop expects a mapping from style properties to values, ' + 'not a string. For example, style={{marginRight: spacing + \'em\'}} when ' + 'using JSX.%s', getDeclarationErrorAddendum(component)) : invariant(false) : undefined;
}

function enqueuePutListener(id, registrationName, listener, transaction) {
  if (process.env.NODE_ENV !== 'production') {
    // IE8 has no API for event capturing and the `onScroll` event doesn't
    // bubble.
    process.env.NODE_ENV !== 'production' ? warning(registrationName !== 'onScroll' || isEventSupported('scroll', true), 'This browser doesn\'t support the `onScroll` event') : undefined;
  }
  var container = ReactMount.findReactContainerForID(id);
  if (container) {
    var doc = container.nodeType === ELEMENT_NODE_TYPE ? container.ownerDocument : container;
    listenTo(registrationName, doc);
  }
  transaction.getReactMountReady().enqueue(putListener, {
    id: id,
    registrationName: registrationName,
    listener: listener
  });
}

function putListener() {
  var listenerToPut = this;
  ReactBrowserEventEmitter.putListener(listenerToPut.id, listenerToPut.registrationName, listenerToPut.listener);
}

// There are so many media events, it makes sense to just
// maintain a list rather than create a `trapBubbledEvent` for each
var mediaEvents = {
  topAbort: 'abort',
  topCanPlay: 'canplay',
  topCanPlayThrough: 'canplaythrough',
  topDurationChange: 'durationchange',
  topEmptied: 'emptied',
  topEncrypted: 'encrypted',
  topEnded: 'ended',
  topError: 'error',
  topLoadedData: 'loadeddata',
  topLoadedMetadata: 'loadedmetadata',
  topLoadStart: 'loadstart',
  topPause: 'pause',
  topPlay: 'play',
  topPlaying: 'playing',
  topProgress: 'progress',
  topRateChange: 'ratechange',
  topSeeked: 'seeked',
  topSeeking: 'seeking',
  topStalled: 'stalled',
  topSuspend: 'suspend',
  topTimeUpdate: 'timeupdate',
  topVolumeChange: 'volumechange',
  topWaiting: 'waiting'
};

function trapBubbledEventsLocal() {
  var inst = this;
  // If a component renders to null or if another component fatals and causes
  // the state of the tree to be corrupted, `node` here can be null.
  !inst._rootNodeID ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Must be mounted to trap events') : invariant(false) : undefined;
  var node = ReactMount.getNode(inst._rootNodeID);
  !node ? process.env.NODE_ENV !== 'production' ? invariant(false, 'trapBubbledEvent(...): Requires node to be rendered.') : invariant(false) : undefined;

  switch (inst._tag) {
    case 'iframe':
      inst._wrapperState.listeners = [ReactBrowserEventEmitter.trapBubbledEvent(EventConstants.topLevelTypes.topLoad, 'load', node)];
      break;
    case 'video':
    case 'audio':

      inst._wrapperState.listeners = [];
      // create listener for each media event
      for (var event in mediaEvents) {
        if (mediaEvents.hasOwnProperty(event)) {
          inst._wrapperState.listeners.push(ReactBrowserEventEmitter.trapBubbledEvent(EventConstants.topLevelTypes[event], mediaEvents[event], node));
        }
      }

      break;
    case 'img':
      inst._wrapperState.listeners = [ReactBrowserEventEmitter.trapBubbledEvent(EventConstants.topLevelTypes.topError, 'error', node), ReactBrowserEventEmitter.trapBubbledEvent(EventConstants.topLevelTypes.topLoad, 'load', node)];
      break;
    case 'form':
      inst._wrapperState.listeners = [ReactBrowserEventEmitter.trapBubbledEvent(EventConstants.topLevelTypes.topReset, 'reset', node), ReactBrowserEventEmitter.trapBubbledEvent(EventConstants.topLevelTypes.topSubmit, 'submit', node)];
      break;
  }
}

function mountReadyInputWrapper() {
  ReactDOMInput.mountReadyWrapper(this);
}

function postUpdateSelectWrapper() {
  ReactDOMSelect.postUpdateWrapper(this);
}

// For HTML, certain tags should omit their close tag. We keep a whitelist for
// those special cased tags.

var omittedCloseTags = {
  'area': true,
  'base': true,
  'br': true,
  'col': true,
  'embed': true,
  'hr': true,
  'img': true,
  'input': true,
  'keygen': true,
  'link': true,
  'meta': true,
  'param': true,
  'source': true,
  'track': true,
  'wbr': true
};

// NOTE: menuitem's close tag should be omitted, but that causes problems.
var newlineEatingTags = {
  'listing': true,
  'pre': true,
  'textarea': true
};

// For HTML, certain tags cannot have children. This has the same purpose as
// `omittedCloseTags` except that `menuitem` should still have its closing tag.

var voidElementTags = assign({
  'menuitem': true
}, omittedCloseTags);

// We accept any tag to be rendered but since this gets injected into arbitrary
// HTML, we want to make sure that it's a safe tag.
// http://www.w3.org/TR/REC-xml/#NT-Name

var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/; // Simplified subset
var validatedTagCache = {};
var hasOwnProperty = ({}).hasOwnProperty;

function validateDangerousTag(tag) {
  if (!hasOwnProperty.call(validatedTagCache, tag)) {
    !VALID_TAG_REGEX.test(tag) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Invalid tag: %s', tag) : invariant(false) : undefined;
    validatedTagCache[tag] = true;
  }
}

function processChildContextDev(context, inst) {
  // Pass down our tag name to child components for validation purposes
  context = assign({}, context);
  var info = context[validateDOMNesting.ancestorInfoContextKey];
  context[validateDOMNesting.ancestorInfoContextKey] = validateDOMNesting.updatedAncestorInfo(info, inst._tag, inst);
  return context;
}

function isCustomComponent(tagName, props) {
  return tagName.indexOf('-') >= 0 || props.is != null;
}

/**
 * Creates a new React class that is idempotent and capable of containing other
 * React components. It accepts event listeners and DOM properties that are
 * valid according to `DOMProperty`.
 *
 *  - Event listeners: `onClick`, `onMouseDown`, etc.
 *  - DOM properties: `className`, `name`, `title`, etc.
 *
 * The `style` property functions differently from the DOM API. It accepts an
 * object mapping of style properties to values.
 *
 * @constructor ReactDOMComponent
 * @extends ReactMultiChild
 */
function ReactDOMComponent(tag) {
  validateDangerousTag(tag);
  this._tag = tag.toLowerCase();
  this._renderedChildren = null;
  this._previousStyle = null;
  this._previousStyleCopy = null;
  this._rootNodeID = null;
  this._wrapperState = null;
  this._topLevelWrapper = null;
  this._nodeWithLegacyProperties = null;
  if (process.env.NODE_ENV !== 'production') {
    this._unprocessedContextDev = null;
    this._processedContextDev = null;
  }
}

ReactDOMComponent.displayName = 'ReactDOMComponent';

ReactDOMComponent.Mixin = {

  construct: function (element) {
    this._currentElement = element;
  },

  /**
   * Generates root tag markup then recurses. This method has side effects and
   * is not idempotent.
   *
   * @internal
   * @param {string} rootID The root DOM ID for this node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {object} context
   * @return {string} The computed markup.
   */
  mountComponent: function (rootID, transaction, context) {
    this._rootNodeID = rootID;

    var props = this._currentElement.props;

    switch (this._tag) {
      case 'iframe':
      case 'img':
      case 'form':
      case 'video':
      case 'audio':
        this._wrapperState = {
          listeners: null
        };
        transaction.getReactMountReady().enqueue(trapBubbledEventsLocal, this);
        break;
      case 'button':
        props = ReactDOMButton.getNativeProps(this, props, context);
        break;
      case 'input':
        ReactDOMInput.mountWrapper(this, props, context);
        props = ReactDOMInput.getNativeProps(this, props, context);
        break;
      case 'option':
        ReactDOMOption.mountWrapper(this, props, context);
        props = ReactDOMOption.getNativeProps(this, props, context);
        break;
      case 'select':
        ReactDOMSelect.mountWrapper(this, props, context);
        props = ReactDOMSelect.getNativeProps(this, props, context);
        context = ReactDOMSelect.processChildContext(this, props, context);
        break;
      case 'textarea':
        ReactDOMTextarea.mountWrapper(this, props, context);
        props = ReactDOMTextarea.getNativeProps(this, props, context);
        break;
    }

    assertValidProps(this, props);
    if (process.env.NODE_ENV !== 'production') {
      if (context[validateDOMNesting.ancestorInfoContextKey]) {
        validateDOMNesting(this._tag, this, context[validateDOMNesting.ancestorInfoContextKey]);
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      this._unprocessedContextDev = context;
      this._processedContextDev = processChildContextDev(context, this);
      context = this._processedContextDev;
    }

    var mountImage;
    if (transaction.useCreateElement) {
      var ownerDocument = context[ReactMount.ownerDocumentContextKey];
      var el = ownerDocument.createElement(this._currentElement.type);
      DOMPropertyOperations.setAttributeForID(el, this._rootNodeID);
      // Populate node cache
      ReactMount.getID(el);
      this._updateDOMProperties({}, props, transaction, el);
      this._createInitialChildren(transaction, props, context, el);
      mountImage = el;
    } else {
      var tagOpen = this._createOpenTagMarkupAndPutListeners(transaction, props);
      var tagContent = this._createContentMarkup(transaction, props, context);
      if (!tagContent && omittedCloseTags[this._tag]) {
        mountImage = tagOpen + '/>';
      } else {
        mountImage = tagOpen + '>' + tagContent + '</' + this._currentElement.type + '>';
      }
    }

    switch (this._tag) {
      case 'input':
        transaction.getReactMountReady().enqueue(mountReadyInputWrapper, this);
      // falls through
      case 'button':
      case 'select':
      case 'textarea':
        if (props.autoFocus) {
          transaction.getReactMountReady().enqueue(AutoFocusUtils.focusDOMComponent, this);
        }
        break;
    }

    return mountImage;
  },

  /**
   * Creates markup for the open tag and all attributes.
   *
   * This method has side effects because events get registered.
   *
   * Iterating over object properties is faster than iterating over arrays.
   * @see http://jsperf.com/obj-vs-arr-iteration
   *
   * @private
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {object} props
   * @return {string} Markup of opening tag.
   */
  _createOpenTagMarkupAndPutListeners: function (transaction, props) {
    var ret = '<' + this._currentElement.type;

    for (var propKey in props) {
      if (!props.hasOwnProperty(propKey)) {
        continue;
      }
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      if (registrationNameModules.hasOwnProperty(propKey)) {
        if (propValue) {
          enqueuePutListener(this._rootNodeID, propKey, propValue, transaction);
        }
      } else {
        if (propKey === STYLE) {
          if (propValue) {
            if (process.env.NODE_ENV !== 'production') {
              // See `_updateDOMProperties`. style block
              this._previousStyle = propValue;
            }
            propValue = this._previousStyleCopy = assign({}, props.style);
          }
          propValue = CSSPropertyOperations.createMarkupForStyles(propValue);
        }
        var markup = null;
        if (this._tag != null && isCustomComponent(this._tag, props)) {
          if (propKey !== CHILDREN) {
            markup = DOMPropertyOperations.createMarkupForCustomAttribute(propKey, propValue);
          }
        } else {
          markup = DOMPropertyOperations.createMarkupForProperty(propKey, propValue);
        }
        if (markup) {
          ret += ' ' + markup;
        }
      }
    }

    // For static pages, no need to put React ID and checksum. Saves lots of
    // bytes.
    if (transaction.renderToStaticMarkup) {
      return ret;
    }

    var markupForID = DOMPropertyOperations.createMarkupForID(this._rootNodeID);
    return ret + ' ' + markupForID;
  },

  /**
   * Creates markup for the content between the tags.
   *
   * @private
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {object} props
   * @param {object} context
   * @return {string} Content markup.
   */
  _createContentMarkup: function (transaction, props, context) {
    var ret = '';

    // Intentional use of != to avoid catching zero/false.
    var innerHTML = props.dangerouslySetInnerHTML;
    if (innerHTML != null) {
      if (innerHTML.__html != null) {
        ret = innerHTML.__html;
      }
    } else {
      var contentToUse = CONTENT_TYPES[typeof props.children] ? props.children : null;
      var childrenToUse = contentToUse != null ? null : props.children;
      if (contentToUse != null) {
        // TODO: Validate that text is allowed as a child of this node
        ret = escapeTextContentForBrowser(contentToUse);
      } else if (childrenToUse != null) {
        var mountImages = this.mountChildren(childrenToUse, transaction, context);
        ret = mountImages.join('');
      }
    }
    if (newlineEatingTags[this._tag] && ret.charAt(0) === '\n') {
      // text/html ignores the first character in these tags if it's a newline
      // Prefer to break application/xml over text/html (for now) by adding
      // a newline specifically to get eaten by the parser. (Alternately for
      // textareas, replacing "^\n" with "\r\n" doesn't get eaten, and the first
      // \r is normalized out by HTMLTextAreaElement#value.)
      // See: <http://www.w3.org/TR/html-polyglot/#newlines-in-textarea-and-pre>
      // See: <http://www.w3.org/TR/html5/syntax.html#element-restrictions>
      // See: <http://www.w3.org/TR/html5/syntax.html#newlines>
      // See: Parsing of "textarea" "listing" and "pre" elements
      //  from <http://www.w3.org/TR/html5/syntax.html#parsing-main-inbody>
      return '\n' + ret;
    } else {
      return ret;
    }
  },

  _createInitialChildren: function (transaction, props, context, el) {
    // Intentional use of != to avoid catching zero/false.
    var innerHTML = props.dangerouslySetInnerHTML;
    if (innerHTML != null) {
      if (innerHTML.__html != null) {
        setInnerHTML(el, innerHTML.__html);
      }
    } else {
      var contentToUse = CONTENT_TYPES[typeof props.children] ? props.children : null;
      var childrenToUse = contentToUse != null ? null : props.children;
      if (contentToUse != null) {
        // TODO: Validate that text is allowed as a child of this node
        setTextContent(el, contentToUse);
      } else if (childrenToUse != null) {
        var mountImages = this.mountChildren(childrenToUse, transaction, context);
        for (var i = 0; i < mountImages.length; i++) {
          el.appendChild(mountImages[i]);
        }
      }
    }
  },

  /**
   * Receives a next element and updates the component.
   *
   * @internal
   * @param {ReactElement} nextElement
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {object} context
   */
  receiveComponent: function (nextElement, transaction, context) {
    var prevElement = this._currentElement;
    this._currentElement = nextElement;
    this.updateComponent(transaction, prevElement, nextElement, context);
  },

  /**
   * Updates a native DOM component after it has already been allocated and
   * attached to the DOM. Reconciles the root DOM node, then recurses.
   *
   * @param {ReactReconcileTransaction} transaction
   * @param {ReactElement} prevElement
   * @param {ReactElement} nextElement
   * @internal
   * @overridable
   */
  updateComponent: function (transaction, prevElement, nextElement, context) {
    var lastProps = prevElement.props;
    var nextProps = this._currentElement.props;

    switch (this._tag) {
      case 'button':
        lastProps = ReactDOMButton.getNativeProps(this, lastProps);
        nextProps = ReactDOMButton.getNativeProps(this, nextProps);
        break;
      case 'input':
        ReactDOMInput.updateWrapper(this);
        lastProps = ReactDOMInput.getNativeProps(this, lastProps);
        nextProps = ReactDOMInput.getNativeProps(this, nextProps);
        break;
      case 'option':
        lastProps = ReactDOMOption.getNativeProps(this, lastProps);
        nextProps = ReactDOMOption.getNativeProps(this, nextProps);
        break;
      case 'select':
        lastProps = ReactDOMSelect.getNativeProps(this, lastProps);
        nextProps = ReactDOMSelect.getNativeProps(this, nextProps);
        break;
      case 'textarea':
        ReactDOMTextarea.updateWrapper(this);
        lastProps = ReactDOMTextarea.getNativeProps(this, lastProps);
        nextProps = ReactDOMTextarea.getNativeProps(this, nextProps);
        break;
    }

    if (process.env.NODE_ENV !== 'production') {
      // If the context is reference-equal to the old one, pass down the same
      // processed object so the update bailout in ReactReconciler behaves
      // correctly (and identically in dev and prod). See #5005.
      if (this._unprocessedContextDev !== context) {
        this._unprocessedContextDev = context;
        this._processedContextDev = processChildContextDev(context, this);
      }
      context = this._processedContextDev;
    }

    assertValidProps(this, nextProps);
    this._updateDOMProperties(lastProps, nextProps, transaction, null);
    this._updateDOMChildren(lastProps, nextProps, transaction, context);

    if (!canDefineProperty && this._nodeWithLegacyProperties) {
      this._nodeWithLegacyProperties.props = nextProps;
    }

    if (this._tag === 'select') {
      // <select> value update needs to occur after <option> children
      // reconciliation
      transaction.getReactMountReady().enqueue(postUpdateSelectWrapper, this);
    }
  },

  /**
   * Reconciles the properties by detecting differences in property values and
   * updating the DOM as necessary. This function is probably the single most
   * critical path for performance optimization.
   *
   * TODO: Benchmark whether checking for changed values in memory actually
   *       improves performance (especially statically positioned elements).
   * TODO: Benchmark the effects of putting this at the top since 99% of props
   *       do not change for a given reconciliation.
   * TODO: Benchmark areas that can be improved with caching.
   *
   * @private
   * @param {object} lastProps
   * @param {object} nextProps
   * @param {ReactReconcileTransaction} transaction
   * @param {?DOMElement} node
   */
  _updateDOMProperties: function (lastProps, nextProps, transaction, node) {
    var propKey;
    var styleName;
    var styleUpdates;
    for (propKey in lastProps) {
      if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey)) {
        continue;
      }
      if (propKey === STYLE) {
        var lastStyle = this._previousStyleCopy;
        for (styleName in lastStyle) {
          if (lastStyle.hasOwnProperty(styleName)) {
            styleUpdates = styleUpdates || {};
            styleUpdates[styleName] = '';
          }
        }
        this._previousStyleCopy = null;
      } else if (registrationNameModules.hasOwnProperty(propKey)) {
        if (lastProps[propKey]) {
          // Only call deleteListener if there was a listener previously or
          // else willDeleteListener gets called when there wasn't actually a
          // listener (e.g., onClick={null})
          deleteListener(this._rootNodeID, propKey);
        }
      } else if (DOMProperty.properties[propKey] || DOMProperty.isCustomAttribute(propKey)) {
        if (!node) {
          node = ReactMount.getNode(this._rootNodeID);
        }
        DOMPropertyOperations.deleteValueForProperty(node, propKey);
      }
    }
    for (propKey in nextProps) {
      var nextProp = nextProps[propKey];
      var lastProp = propKey === STYLE ? this._previousStyleCopy : lastProps[propKey];
      if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp) {
        continue;
      }
      if (propKey === STYLE) {
        if (nextProp) {
          if (process.env.NODE_ENV !== 'production') {
            checkAndWarnForMutatedStyle(this._previousStyleCopy, this._previousStyle, this);
            this._previousStyle = nextProp;
          }
          nextProp = this._previousStyleCopy = assign({}, nextProp);
        } else {
          this._previousStyleCopy = null;
        }
        if (lastProp) {
          // Unset styles on `lastProp` but not on `nextProp`.
          for (styleName in lastProp) {
            if (lastProp.hasOwnProperty(styleName) && (!nextProp || !nextProp.hasOwnProperty(styleName))) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = '';
            }
          }
          // Update styles that changed since `lastProp`.
          for (styleName in nextProp) {
            if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = nextProp[styleName];
            }
          }
        } else {
          // Relies on `updateStylesByID` not mutating `styleUpdates`.
          styleUpdates = nextProp;
        }
      } else if (registrationNameModules.hasOwnProperty(propKey)) {
        if (nextProp) {
          enqueuePutListener(this._rootNodeID, propKey, nextProp, transaction);
        } else if (lastProp) {
          deleteListener(this._rootNodeID, propKey);
        }
      } else if (isCustomComponent(this._tag, nextProps)) {
        if (!node) {
          node = ReactMount.getNode(this._rootNodeID);
        }
        if (propKey === CHILDREN) {
          nextProp = null;
        }
        DOMPropertyOperations.setValueForAttribute(node, propKey, nextProp);
      } else if (DOMProperty.properties[propKey] || DOMProperty.isCustomAttribute(propKey)) {
        if (!node) {
          node = ReactMount.getNode(this._rootNodeID);
        }
        // If we're updating to null or undefined, we should remove the property
        // from the DOM node instead of inadvertantly setting to a string. This
        // brings us in line with the same behavior we have on initial render.
        if (nextProp != null) {
          DOMPropertyOperations.setValueForProperty(node, propKey, nextProp);
        } else {
          DOMPropertyOperations.deleteValueForProperty(node, propKey);
        }
      }
    }
    if (styleUpdates) {
      if (!node) {
        node = ReactMount.getNode(this._rootNodeID);
      }
      CSSPropertyOperations.setValueForStyles(node, styleUpdates);
    }
  },

  /**
   * Reconciles the children with the various properties that affect the
   * children content.
   *
   * @param {object} lastProps
   * @param {object} nextProps
   * @param {ReactReconcileTransaction} transaction
   * @param {object} context
   */
  _updateDOMChildren: function (lastProps, nextProps, transaction, context) {
    var lastContent = CONTENT_TYPES[typeof lastProps.children] ? lastProps.children : null;
    var nextContent = CONTENT_TYPES[typeof nextProps.children] ? nextProps.children : null;

    var lastHtml = lastProps.dangerouslySetInnerHTML && lastProps.dangerouslySetInnerHTML.__html;
    var nextHtml = nextProps.dangerouslySetInnerHTML && nextProps.dangerouslySetInnerHTML.__html;

    // Note the use of `!=` which checks for null or undefined.
    var lastChildren = lastContent != null ? null : lastProps.children;
    var nextChildren = nextContent != null ? null : nextProps.children;

    // If we're switching from children to content/html or vice versa, remove
    // the old content
    var lastHasContentOrHtml = lastContent != null || lastHtml != null;
    var nextHasContentOrHtml = nextContent != null || nextHtml != null;
    if (lastChildren != null && nextChildren == null) {
      this.updateChildren(null, transaction, context);
    } else if (lastHasContentOrHtml && !nextHasContentOrHtml) {
      this.updateTextContent('');
    }

    if (nextContent != null) {
      if (lastContent !== nextContent) {
        this.updateTextContent('' + nextContent);
      }
    } else if (nextHtml != null) {
      if (lastHtml !== nextHtml) {
        this.updateMarkup('' + nextHtml);
      }
    } else if (nextChildren != null) {
      this.updateChildren(nextChildren, transaction, context);
    }
  },

  /**
   * Destroys all event registrations for this instance. Does not remove from
   * the DOM. That must be done by the parent.
   *
   * @internal
   */
  unmountComponent: function () {
    switch (this._tag) {
      case 'iframe':
      case 'img':
      case 'form':
      case 'video':
      case 'audio':
        var listeners = this._wrapperState.listeners;
        if (listeners) {
          for (var i = 0; i < listeners.length; i++) {
            listeners[i].remove();
          }
        }
        break;
      case 'input':
        ReactDOMInput.unmountWrapper(this);
        break;
      case 'html':
      case 'head':
      case 'body':
        /**
         * Components like <html> <head> and <body> can't be removed or added
         * easily in a cross-browser way, however it's valuable to be able to
         * take advantage of React's reconciliation for styling and <title>
         * management. So we just document it and throw in dangerous cases.
         */
        !false ? process.env.NODE_ENV !== 'production' ? invariant(false, '<%s> tried to unmount. Because of cross-browser quirks it is ' + 'impossible to unmount some top-level components (eg <html>, ' + '<head>, and <body>) reliably and efficiently. To fix this, have a ' + 'single top-level component that never unmounts render these ' + 'elements.', this._tag) : invariant(false) : undefined;
        break;
    }

    this.unmountChildren();
    ReactBrowserEventEmitter.deleteAllListeners(this._rootNodeID);
    ReactComponentBrowserEnvironment.unmountIDFromEnvironment(this._rootNodeID);
    this._rootNodeID = null;
    this._wrapperState = null;
    if (this._nodeWithLegacyProperties) {
      var node = this._nodeWithLegacyProperties;
      node._reactInternalComponent = null;
      this._nodeWithLegacyProperties = null;
    }
  },

  getPublicInstance: function () {
    if (!this._nodeWithLegacyProperties) {
      var node = ReactMount.getNode(this._rootNodeID);

      node._reactInternalComponent = this;
      node.getDOMNode = legacyGetDOMNode;
      node.isMounted = legacyIsMounted;
      node.setState = legacySetStateEtc;
      node.replaceState = legacySetStateEtc;
      node.forceUpdate = legacySetStateEtc;
      node.setProps = legacySetProps;
      node.replaceProps = legacyReplaceProps;

      if (process.env.NODE_ENV !== 'production') {
        if (canDefineProperty) {
          Object.defineProperties(node, legacyPropsDescriptor);
        } else {
          // updateComponent will update this property on subsequent renders
          node.props = this._currentElement.props;
        }
      } else {
        // updateComponent will update this property on subsequent renders
        node.props = this._currentElement.props;
      }

      this._nodeWithLegacyProperties = node;
    }
    return this._nodeWithLegacyProperties;
  }

};

ReactPerf.measureMethods(ReactDOMComponent, 'ReactDOMComponent', {
  mountComponent: 'mountComponent',
  updateComponent: 'updateComponent'
});

assign(ReactDOMComponent.prototype, ReactDOMComponent.Mixin, ReactMultiChild.Mixin);

module.exports = ReactDOMComponent;
},{"./AutoFocusUtils":"/home/ec2-user/ksana2015/node_modules/react/lib/AutoFocusUtils.js","./CSSPropertyOperations":"/home/ec2-user/ksana2015/node_modules/react/lib/CSSPropertyOperations.js","./DOMProperty":"/home/ec2-user/ksana2015/node_modules/react/lib/DOMProperty.js","./DOMPropertyOperations":"/home/ec2-user/ksana2015/node_modules/react/lib/DOMPropertyOperations.js","./EventConstants":"/home/ec2-user/ksana2015/node_modules/react/lib/EventConstants.js","./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactBrowserEventEmitter":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactBrowserEventEmitter.js","./ReactComponentBrowserEnvironment":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactComponentBrowserEnvironment.js","./ReactDOMButton":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMButton.js","./ReactDOMInput":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMInput.js","./ReactDOMOption":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMOption.js","./ReactDOMSelect":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMSelect.js","./ReactDOMTextarea":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMTextarea.js","./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js","./ReactMultiChild":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMultiChild.js","./ReactPerf":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPerf.js","./ReactUpdateQueue":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdateQueue.js","./canDefineProperty":"/home/ec2-user/ksana2015/node_modules/react/lib/canDefineProperty.js","./escapeTextContentForBrowser":"/home/ec2-user/ksana2015/node_modules/react/lib/escapeTextContentForBrowser.js","./isEventSupported":"/home/ec2-user/ksana2015/node_modules/react/lib/isEventSupported.js","./setInnerHTML":"/home/ec2-user/ksana2015/node_modules/react/lib/setInnerHTML.js","./setTextContent":"/home/ec2-user/ksana2015/node_modules/react/lib/setTextContent.js","./validateDOMNesting":"/home/ec2-user/ksana2015/node_modules/react/lib/validateDOMNesting.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/keyOf":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyOf.js","fbjs/lib/shallowEqual":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/shallowEqual.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMFactories.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMFactories
 * @typechecks static-only
 */

'use strict';

var ReactElement = require('./ReactElement');
var ReactElementValidator = require('./ReactElementValidator');

var mapObject = require('fbjs/lib/mapObject');

/**
 * Create a factory that creates HTML tag elements.
 *
 * @param {string} tag Tag name (e.g. `div`).
 * @private
 */
function createDOMFactory(tag) {
  if (process.env.NODE_ENV !== 'production') {
    return ReactElementValidator.createFactory(tag);
  }
  return ReactElement.createFactory(tag);
}

/**
 * Creates a mapping from supported HTML tags to `ReactDOMComponent` classes.
 * This is also accessible via `React.DOM`.
 *
 * @public
 */
var ReactDOMFactories = mapObject({
  a: 'a',
  abbr: 'abbr',
  address: 'address',
  area: 'area',
  article: 'article',
  aside: 'aside',
  audio: 'audio',
  b: 'b',
  base: 'base',
  bdi: 'bdi',
  bdo: 'bdo',
  big: 'big',
  blockquote: 'blockquote',
  body: 'body',
  br: 'br',
  button: 'button',
  canvas: 'canvas',
  caption: 'caption',
  cite: 'cite',
  code: 'code',
  col: 'col',
  colgroup: 'colgroup',
  data: 'data',
  datalist: 'datalist',
  dd: 'dd',
  del: 'del',
  details: 'details',
  dfn: 'dfn',
  dialog: 'dialog',
  div: 'div',
  dl: 'dl',
  dt: 'dt',
  em: 'em',
  embed: 'embed',
  fieldset: 'fieldset',
  figcaption: 'figcaption',
  figure: 'figure',
  footer: 'footer',
  form: 'form',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  head: 'head',
  header: 'header',
  hgroup: 'hgroup',
  hr: 'hr',
  html: 'html',
  i: 'i',
  iframe: 'iframe',
  img: 'img',
  input: 'input',
  ins: 'ins',
  kbd: 'kbd',
  keygen: 'keygen',
  label: 'label',
  legend: 'legend',
  li: 'li',
  link: 'link',
  main: 'main',
  map: 'map',
  mark: 'mark',
  menu: 'menu',
  menuitem: 'menuitem',
  meta: 'meta',
  meter: 'meter',
  nav: 'nav',
  noscript: 'noscript',
  object: 'object',
  ol: 'ol',
  optgroup: 'optgroup',
  option: 'option',
  output: 'output',
  p: 'p',
  param: 'param',
  picture: 'picture',
  pre: 'pre',
  progress: 'progress',
  q: 'q',
  rp: 'rp',
  rt: 'rt',
  ruby: 'ruby',
  s: 's',
  samp: 'samp',
  script: 'script',
  section: 'section',
  select: 'select',
  small: 'small',
  source: 'source',
  span: 'span',
  strong: 'strong',
  style: 'style',
  sub: 'sub',
  summary: 'summary',
  sup: 'sup',
  table: 'table',
  tbody: 'tbody',
  td: 'td',
  textarea: 'textarea',
  tfoot: 'tfoot',
  th: 'th',
  thead: 'thead',
  time: 'time',
  title: 'title',
  tr: 'tr',
  track: 'track',
  u: 'u',
  ul: 'ul',
  'var': 'var',
  video: 'video',
  wbr: 'wbr',

  // SVG
  circle: 'circle',
  clipPath: 'clipPath',
  defs: 'defs',
  ellipse: 'ellipse',
  g: 'g',
  image: 'image',
  line: 'line',
  linearGradient: 'linearGradient',
  mask: 'mask',
  path: 'path',
  pattern: 'pattern',
  polygon: 'polygon',
  polyline: 'polyline',
  radialGradient: 'radialGradient',
  rect: 'rect',
  stop: 'stop',
  svg: 'svg',
  text: 'text',
  tspan: 'tspan'

}, createDOMFactory);

module.exports = ReactDOMFactories;
},{"./ReactElement":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js","./ReactElementValidator":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElementValidator.js","fbjs/lib/mapObject":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/mapObject.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMFeatureFlags.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMFeatureFlags
 */

'use strict';

var ReactDOMFeatureFlags = {
  useCreateElement: false
};

module.exports = ReactDOMFeatureFlags;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMIDOperations.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMIDOperations
 * @typechecks static-only
 */

'use strict';

var DOMChildrenOperations = require('./DOMChildrenOperations');
var DOMPropertyOperations = require('./DOMPropertyOperations');
var ReactMount = require('./ReactMount');
var ReactPerf = require('./ReactPerf');

var invariant = require('fbjs/lib/invariant');

/**
 * Errors for properties that should not be updated with `updatePropertyByID()`.
 *
 * @type {object}
 * @private
 */
var INVALID_PROPERTY_ERRORS = {
  dangerouslySetInnerHTML: '`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.',
  style: '`style` must be set using `updateStylesByID()`.'
};

/**
 * Operations used to process updates to DOM nodes.
 */
var ReactDOMIDOperations = {

  /**
   * Updates a DOM node with new property values. This should only be used to
   * update DOM properties in `DOMProperty`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} name A valid property name, see `DOMProperty`.
   * @param {*} value New value of the property.
   * @internal
   */
  updatePropertyByID: function (id, name, value) {
    var node = ReactMount.getNode(id);
    !!INVALID_PROPERTY_ERRORS.hasOwnProperty(name) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'updatePropertyByID(...): %s', INVALID_PROPERTY_ERRORS[name]) : invariant(false) : undefined;

    // If we're updating to null or undefined, we should remove the property
    // from the DOM node instead of inadvertantly setting to a string. This
    // brings us in line with the same behavior we have on initial render.
    if (value != null) {
      DOMPropertyOperations.setValueForProperty(node, name, value);
    } else {
      DOMPropertyOperations.deleteValueForProperty(node, name);
    }
  },

  /**
   * Replaces a DOM node that exists in the document with markup.
   *
   * @param {string} id ID of child to be replaced.
   * @param {string} markup Dangerous markup to inject in place of child.
   * @internal
   * @see {Danger.dangerouslyReplaceNodeWithMarkup}
   */
  dangerouslyReplaceNodeWithMarkupByID: function (id, markup) {
    var node = ReactMount.getNode(id);
    DOMChildrenOperations.dangerouslyReplaceNodeWithMarkup(node, markup);
  },

  /**
   * Updates a component's children by processing a series of updates.
   *
   * @param {array<object>} updates List of update configurations.
   * @param {array<string>} markup List of markup strings.
   * @internal
   */
  dangerouslyProcessChildrenUpdates: function (updates, markup) {
    for (var i = 0; i < updates.length; i++) {
      updates[i].parentNode = ReactMount.getNode(updates[i].parentID);
    }
    DOMChildrenOperations.processUpdates(updates, markup);
  }
};

ReactPerf.measureMethods(ReactDOMIDOperations, 'ReactDOMIDOperations', {
  dangerouslyReplaceNodeWithMarkupByID: 'dangerouslyReplaceNodeWithMarkupByID',
  dangerouslyProcessChildrenUpdates: 'dangerouslyProcessChildrenUpdates'
});

module.exports = ReactDOMIDOperations;
},{"./DOMChildrenOperations":"/home/ec2-user/ksana2015/node_modules/react/lib/DOMChildrenOperations.js","./DOMPropertyOperations":"/home/ec2-user/ksana2015/node_modules/react/lib/DOMPropertyOperations.js","./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js","./ReactPerf":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPerf.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMInput.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMInput
 */

'use strict';

var ReactDOMIDOperations = require('./ReactDOMIDOperations');
var LinkedValueUtils = require('./LinkedValueUtils');
var ReactMount = require('./ReactMount');
var ReactUpdates = require('./ReactUpdates');

var assign = require('./Object.assign');
var invariant = require('fbjs/lib/invariant');

var instancesByReactID = {};

function forceUpdateIfMounted() {
  if (this._rootNodeID) {
    // DOM component is still mounted; update
    ReactDOMInput.updateWrapper(this);
  }
}

/**
 * Implements an <input> native component that allows setting these optional
 * props: `checked`, `value`, `defaultChecked`, and `defaultValue`.
 *
 * If `checked` or `value` are not supplied (or null/undefined), user actions
 * that affect the checked state or value will trigger updates to the element.
 *
 * If they are supplied (and not null/undefined), the rendered element will not
 * trigger updates to the element. Instead, the props must change in order for
 * the rendered element to be updated.
 *
 * The rendered element will be initialized as unchecked (or `defaultChecked`)
 * with an empty value (or `defaultValue`).
 *
 * @see http://www.w3.org/TR/2012/WD-html5-20121025/the-input-element.html
 */
var ReactDOMInput = {
  getNativeProps: function (inst, props, context) {
    var value = LinkedValueUtils.getValue(props);
    var checked = LinkedValueUtils.getChecked(props);

    var nativeProps = assign({}, props, {
      defaultChecked: undefined,
      defaultValue: undefined,
      value: value != null ? value : inst._wrapperState.initialValue,
      checked: checked != null ? checked : inst._wrapperState.initialChecked,
      onChange: inst._wrapperState.onChange
    });

    return nativeProps;
  },

  mountWrapper: function (inst, props) {
    if (process.env.NODE_ENV !== 'production') {
      LinkedValueUtils.checkPropTypes('input', props, inst._currentElement._owner);
    }

    var defaultValue = props.defaultValue;
    inst._wrapperState = {
      initialChecked: props.defaultChecked || false,
      initialValue: defaultValue != null ? defaultValue : null,
      onChange: _handleChange.bind(inst)
    };
  },

  mountReadyWrapper: function (inst) {
    // Can't be in mountWrapper or else server rendering leaks.
    instancesByReactID[inst._rootNodeID] = inst;
  },

  unmountWrapper: function (inst) {
    delete instancesByReactID[inst._rootNodeID];
  },

  updateWrapper: function (inst) {
    var props = inst._currentElement.props;

    // TODO: Shouldn't this be getChecked(props)?
    var checked = props.checked;
    if (checked != null) {
      ReactDOMIDOperations.updatePropertyByID(inst._rootNodeID, 'checked', checked || false);
    }

    var value = LinkedValueUtils.getValue(props);
    if (value != null) {
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
      ReactDOMIDOperations.updatePropertyByID(inst._rootNodeID, 'value', '' + value);
    }
  }
};

function _handleChange(event) {
  var props = this._currentElement.props;

  var returnValue = LinkedValueUtils.executeOnChange(props, event);

  // Here we use asap to wait until all updates have propagated, which
  // is important when using controlled components within layers:
  // https://github.com/facebook/react/issues/1698
  ReactUpdates.asap(forceUpdateIfMounted, this);

  var name = props.name;
  if (props.type === 'radio' && name != null) {
    var rootNode = ReactMount.getNode(this._rootNodeID);
    var queryRoot = rootNode;

    while (queryRoot.parentNode) {
      queryRoot = queryRoot.parentNode;
    }

    // If `rootNode.form` was non-null, then we could try `form.elements`,
    // but that sometimes behaves strangely in IE8. We could also try using
    // `form.getElementsByName`, but that will only return direct children
    // and won't include inputs that use the HTML5 `form=` attribute. Since
    // the input might not even be in a form, let's just use the global
    // `querySelectorAll` to ensure we don't miss anything.
    var group = queryRoot.querySelectorAll('input[name=' + JSON.stringify('' + name) + '][type="radio"]');

    for (var i = 0; i < group.length; i++) {
      var otherNode = group[i];
      if (otherNode === rootNode || otherNode.form !== rootNode.form) {
        continue;
      }
      // This will throw if radio buttons rendered by different copies of React
      // and the same name are rendered into the same form (same as #1939).
      // That's probably okay; we don't support it just as we don't support
      // mixing React with non-React.
      var otherID = ReactMount.getID(otherNode);
      !otherID ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactDOMInput: Mixing React and non-React radio inputs with the ' + 'same `name` is not supported.') : invariant(false) : undefined;
      var otherInstance = instancesByReactID[otherID];
      !otherInstance ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactDOMInput: Unknown radio button ID %s.', otherID) : invariant(false) : undefined;
      // If this is a controlled radio button group, forcing the input that
      // was previously checked to update will cause it to be come re-checked
      // as appropriate.
      ReactUpdates.asap(forceUpdateIfMounted, otherInstance);
    }
  }

  return returnValue;
}

module.exports = ReactDOMInput;
},{"./LinkedValueUtils":"/home/ec2-user/ksana2015/node_modules/react/lib/LinkedValueUtils.js","./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactDOMIDOperations":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMIDOperations.js","./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js","./ReactUpdates":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdates.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMOption.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMOption
 */

'use strict';

var ReactChildren = require('./ReactChildren');
var ReactDOMSelect = require('./ReactDOMSelect');

var assign = require('./Object.assign');
var warning = require('fbjs/lib/warning');

var valueContextKey = ReactDOMSelect.valueContextKey;

/**
 * Implements an <option> native component that warns when `selected` is set.
 */
var ReactDOMOption = {
  mountWrapper: function (inst, props, context) {
    // TODO (yungsters): Remove support for `selected` in <option>.
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(props.selected == null, 'Use the `defaultValue` or `value` props on <select> instead of ' + 'setting `selected` on <option>.') : undefined;
    }

    // Look up whether this option is 'selected' via context
    var selectValue = context[valueContextKey];

    // If context key is null (e.g., no specified value or after initial mount)
    // or missing (e.g., for <datalist>), we don't change props.selected
    var selected = null;
    if (selectValue != null) {
      selected = false;
      if (Array.isArray(selectValue)) {
        // multiple
        for (var i = 0; i < selectValue.length; i++) {
          if ('' + selectValue[i] === '' + props.value) {
            selected = true;
            break;
          }
        }
      } else {
        selected = '' + selectValue === '' + props.value;
      }
    }

    inst._wrapperState = { selected: selected };
  },

  getNativeProps: function (inst, props, context) {
    var nativeProps = assign({ selected: undefined, children: undefined }, props);

    // Read state only from initial mount because <select> updates value
    // manually; we need the initial state only for server rendering
    if (inst._wrapperState.selected != null) {
      nativeProps.selected = inst._wrapperState.selected;
    }

    var content = '';

    // Flatten children and warn if they aren't strings or numbers;
    // invalid types are ignored.
    ReactChildren.forEach(props.children, function (child) {
      if (child == null) {
        return;
      }
      if (typeof child === 'string' || typeof child === 'number') {
        content += child;
      } else {
        process.env.NODE_ENV !== 'production' ? warning(false, 'Only strings and numbers are supported as <option> children.') : undefined;
      }
    });

    if (content) {
      nativeProps.children = content;
    }

    return nativeProps;
  }

};

module.exports = ReactDOMOption;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactChildren":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactChildren.js","./ReactDOMSelect":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMSelect.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMSelect.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMSelect
 */

'use strict';

var LinkedValueUtils = require('./LinkedValueUtils');
var ReactMount = require('./ReactMount');
var ReactUpdates = require('./ReactUpdates');

var assign = require('./Object.assign');
var warning = require('fbjs/lib/warning');

var valueContextKey = '__ReactDOMSelect_value$' + Math.random().toString(36).slice(2);

function updateOptionsIfPendingUpdateAndMounted() {
  if (this._rootNodeID && this._wrapperState.pendingUpdate) {
    this._wrapperState.pendingUpdate = false;

    var props = this._currentElement.props;
    var value = LinkedValueUtils.getValue(props);

    if (value != null) {
      updateOptions(this, Boolean(props.multiple), value);
    }
  }
}

function getDeclarationErrorAddendum(owner) {
  if (owner) {
    var name = owner.getName();
    if (name) {
      return ' Check the render method of `' + name + '`.';
    }
  }
  return '';
}

var valuePropNames = ['value', 'defaultValue'];

/**
 * Validation function for `value` and `defaultValue`.
 * @private
 */
function checkSelectPropTypes(inst, props) {
  var owner = inst._currentElement._owner;
  LinkedValueUtils.checkPropTypes('select', props, owner);

  for (var i = 0; i < valuePropNames.length; i++) {
    var propName = valuePropNames[i];
    if (props[propName] == null) {
      continue;
    }
    if (props.multiple) {
      process.env.NODE_ENV !== 'production' ? warning(Array.isArray(props[propName]), 'The `%s` prop supplied to <select> must be an array if ' + '`multiple` is true.%s', propName, getDeclarationErrorAddendum(owner)) : undefined;
    } else {
      process.env.NODE_ENV !== 'production' ? warning(!Array.isArray(props[propName]), 'The `%s` prop supplied to <select> must be a scalar ' + 'value if `multiple` is false.%s', propName, getDeclarationErrorAddendum(owner)) : undefined;
    }
  }
}

/**
 * @param {ReactDOMComponent} inst
 * @param {boolean} multiple
 * @param {*} propValue A stringable (with `multiple`, a list of stringables).
 * @private
 */
function updateOptions(inst, multiple, propValue) {
  var selectedValue, i;
  var options = ReactMount.getNode(inst._rootNodeID).options;

  if (multiple) {
    selectedValue = {};
    for (i = 0; i < propValue.length; i++) {
      selectedValue['' + propValue[i]] = true;
    }
    for (i = 0; i < options.length; i++) {
      var selected = selectedValue.hasOwnProperty(options[i].value);
      if (options[i].selected !== selected) {
        options[i].selected = selected;
      }
    }
  } else {
    // Do not set `select.value` as exact behavior isn't consistent across all
    // browsers for all cases.
    selectedValue = '' + propValue;
    for (i = 0; i < options.length; i++) {
      if (options[i].value === selectedValue) {
        options[i].selected = true;
        return;
      }
    }
    if (options.length) {
      options[0].selected = true;
    }
  }
}

/**
 * Implements a <select> native component that allows optionally setting the
 * props `value` and `defaultValue`. If `multiple` is false, the prop must be a
 * stringable. If `multiple` is true, the prop must be an array of stringables.
 *
 * If `value` is not supplied (or null/undefined), user actions that change the
 * selected option will trigger updates to the rendered options.
 *
 * If it is supplied (and not null/undefined), the rendered options will not
 * update in response to user actions. Instead, the `value` prop must change in
 * order for the rendered options to update.
 *
 * If `defaultValue` is provided, any options with the supplied values will be
 * selected.
 */
var ReactDOMSelect = {
  valueContextKey: valueContextKey,

  getNativeProps: function (inst, props, context) {
    return assign({}, props, {
      onChange: inst._wrapperState.onChange,
      value: undefined
    });
  },

  mountWrapper: function (inst, props) {
    if (process.env.NODE_ENV !== 'production') {
      checkSelectPropTypes(inst, props);
    }

    var value = LinkedValueUtils.getValue(props);
    inst._wrapperState = {
      pendingUpdate: false,
      initialValue: value != null ? value : props.defaultValue,
      onChange: _handleChange.bind(inst),
      wasMultiple: Boolean(props.multiple)
    };
  },

  processChildContext: function (inst, props, context) {
    // Pass down initial value so initial generated markup has correct
    // `selected` attributes
    var childContext = assign({}, context);
    childContext[valueContextKey] = inst._wrapperState.initialValue;
    return childContext;
  },

  postUpdateWrapper: function (inst) {
    var props = inst._currentElement.props;

    // After the initial mount, we control selected-ness manually so don't pass
    // the context value down
    inst._wrapperState.initialValue = undefined;

    var wasMultiple = inst._wrapperState.wasMultiple;
    inst._wrapperState.wasMultiple = Boolean(props.multiple);

    var value = LinkedValueUtils.getValue(props);
    if (value != null) {
      inst._wrapperState.pendingUpdate = false;
      updateOptions(inst, Boolean(props.multiple), value);
    } else if (wasMultiple !== Boolean(props.multiple)) {
      // For simplicity, reapply `defaultValue` if `multiple` is toggled.
      if (props.defaultValue != null) {
        updateOptions(inst, Boolean(props.multiple), props.defaultValue);
      } else {
        // Revert the select back to its default unselected state.
        updateOptions(inst, Boolean(props.multiple), props.multiple ? [] : '');
      }
    }
  }
};

function _handleChange(event) {
  var props = this._currentElement.props;
  var returnValue = LinkedValueUtils.executeOnChange(props, event);

  this._wrapperState.pendingUpdate = true;
  ReactUpdates.asap(updateOptionsIfPendingUpdateAndMounted, this);
  return returnValue;
}

module.exports = ReactDOMSelect;
},{"./LinkedValueUtils":"/home/ec2-user/ksana2015/node_modules/react/lib/LinkedValueUtils.js","./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js","./ReactUpdates":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdates.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMSelection.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMSelection
 */

'use strict';

var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');

var getNodeForCharacterOffset = require('./getNodeForCharacterOffset');
var getTextContentAccessor = require('./getTextContentAccessor');

/**
 * While `isCollapsed` is available on the Selection object and `collapsed`
 * is available on the Range object, IE11 sometimes gets them wrong.
 * If the anchor/focus nodes and offsets are the same, the range is collapsed.
 */
function isCollapsed(anchorNode, anchorOffset, focusNode, focusOffset) {
  return anchorNode === focusNode && anchorOffset === focusOffset;
}

/**
 * Get the appropriate anchor and focus node/offset pairs for IE.
 *
 * The catch here is that IE's selection API doesn't provide information
 * about whether the selection is forward or backward, so we have to
 * behave as though it's always forward.
 *
 * IE text differs from modern selection in that it behaves as though
 * block elements end with a new line. This means character offsets will
 * differ between the two APIs.
 *
 * @param {DOMElement} node
 * @return {object}
 */
function getIEOffsets(node) {
  var selection = document.selection;
  var selectedRange = selection.createRange();
  var selectedLength = selectedRange.text.length;

  // Duplicate selection so we can move range without breaking user selection.
  var fromStart = selectedRange.duplicate();
  fromStart.moveToElementText(node);
  fromStart.setEndPoint('EndToStart', selectedRange);

  var startOffset = fromStart.text.length;
  var endOffset = startOffset + selectedLength;

  return {
    start: startOffset,
    end: endOffset
  };
}

/**
 * @param {DOMElement} node
 * @return {?object}
 */
function getModernOffsets(node) {
  var selection = window.getSelection && window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  var anchorNode = selection.anchorNode;
  var anchorOffset = selection.anchorOffset;
  var focusNode = selection.focusNode;
  var focusOffset = selection.focusOffset;

  var currentRange = selection.getRangeAt(0);

  // In Firefox, range.startContainer and range.endContainer can be "anonymous
  // divs", e.g. the up/down buttons on an <input type="number">. Anonymous
  // divs do not seem to expose properties, triggering a "Permission denied
  // error" if any of its properties are accessed. The only seemingly possible
  // way to avoid erroring is to access a property that typically works for
  // non-anonymous divs and catch any error that may otherwise arise. See
  // https://bugzilla.mozilla.org/show_bug.cgi?id=208427
  try {
    /* eslint-disable no-unused-expressions */
    currentRange.startContainer.nodeType;
    currentRange.endContainer.nodeType;
    /* eslint-enable no-unused-expressions */
  } catch (e) {
    return null;
  }

  // If the node and offset values are the same, the selection is collapsed.
  // `Selection.isCollapsed` is available natively, but IE sometimes gets
  // this value wrong.
  var isSelectionCollapsed = isCollapsed(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset);

  var rangeLength = isSelectionCollapsed ? 0 : currentRange.toString().length;

  var tempRange = currentRange.cloneRange();
  tempRange.selectNodeContents(node);
  tempRange.setEnd(currentRange.startContainer, currentRange.startOffset);

  var isTempRangeCollapsed = isCollapsed(tempRange.startContainer, tempRange.startOffset, tempRange.endContainer, tempRange.endOffset);

  var start = isTempRangeCollapsed ? 0 : tempRange.toString().length;
  var end = start + rangeLength;

  // Detect whether the selection is backward.
  var detectionRange = document.createRange();
  detectionRange.setStart(anchorNode, anchorOffset);
  detectionRange.setEnd(focusNode, focusOffset);
  var isBackward = detectionRange.collapsed;

  return {
    start: isBackward ? end : start,
    end: isBackward ? start : end
  };
}

/**
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setIEOffsets(node, offsets) {
  var range = document.selection.createRange().duplicate();
  var start, end;

  if (typeof offsets.end === 'undefined') {
    start = offsets.start;
    end = start;
  } else if (offsets.start > offsets.end) {
    start = offsets.end;
    end = offsets.start;
  } else {
    start = offsets.start;
    end = offsets.end;
  }

  range.moveToElementText(node);
  range.moveStart('character', start);
  range.setEndPoint('EndToStart', range);
  range.moveEnd('character', end - start);
  range.select();
}

/**
 * In modern non-IE browsers, we can support both forward and backward
 * selections.
 *
 * Note: IE10+ supports the Selection object, but it does not support
 * the `extend` method, which means that even in modern IE, it's not possible
 * to programatically create a backward selection. Thus, for all IE
 * versions, we use the old IE API to create our selections.
 *
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setModernOffsets(node, offsets) {
  if (!window.getSelection) {
    return;
  }

  var selection = window.getSelection();
  var length = node[getTextContentAccessor()].length;
  var start = Math.min(offsets.start, length);
  var end = typeof offsets.end === 'undefined' ? start : Math.min(offsets.end, length);

  // IE 11 uses modern selection, but doesn't support the extend method.
  // Flip backward selections, so we can set with a single range.
  if (!selection.extend && start > end) {
    var temp = end;
    end = start;
    start = temp;
  }

  var startMarker = getNodeForCharacterOffset(node, start);
  var endMarker = getNodeForCharacterOffset(node, end);

  if (startMarker && endMarker) {
    var range = document.createRange();
    range.setStart(startMarker.node, startMarker.offset);
    selection.removeAllRanges();

    if (start > end) {
      selection.addRange(range);
      selection.extend(endMarker.node, endMarker.offset);
    } else {
      range.setEnd(endMarker.node, endMarker.offset);
      selection.addRange(range);
    }
  }
}

var useIEOffsets = ExecutionEnvironment.canUseDOM && 'selection' in document && !('getSelection' in window);

var ReactDOMSelection = {
  /**
   * @param {DOMElement} node
   */
  getOffsets: useIEOffsets ? getIEOffsets : getModernOffsets,

  /**
   * @param {DOMElement|DOMTextNode} node
   * @param {object} offsets
   */
  setOffsets: useIEOffsets ? setIEOffsets : setModernOffsets
};

module.exports = ReactDOMSelection;
},{"./getNodeForCharacterOffset":"/home/ec2-user/ksana2015/node_modules/react/lib/getNodeForCharacterOffset.js","./getTextContentAccessor":"/home/ec2-user/ksana2015/node_modules/react/lib/getTextContentAccessor.js","fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMServer.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMServer
 */

'use strict';

var ReactDefaultInjection = require('./ReactDefaultInjection');
var ReactServerRendering = require('./ReactServerRendering');
var ReactVersion = require('./ReactVersion');

ReactDefaultInjection.inject();

var ReactDOMServer = {
  renderToString: ReactServerRendering.renderToString,
  renderToStaticMarkup: ReactServerRendering.renderToStaticMarkup,
  version: ReactVersion
};

module.exports = ReactDOMServer;
},{"./ReactDefaultInjection":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDefaultInjection.js","./ReactServerRendering":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactServerRendering.js","./ReactVersion":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactVersion.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMTextComponent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMTextComponent
 * @typechecks static-only
 */

'use strict';

var DOMChildrenOperations = require('./DOMChildrenOperations');
var DOMPropertyOperations = require('./DOMPropertyOperations');
var ReactComponentBrowserEnvironment = require('./ReactComponentBrowserEnvironment');
var ReactMount = require('./ReactMount');

var assign = require('./Object.assign');
var escapeTextContentForBrowser = require('./escapeTextContentForBrowser');
var setTextContent = require('./setTextContent');
var validateDOMNesting = require('./validateDOMNesting');

/**
 * Text nodes violate a couple assumptions that React makes about components:
 *
 *  - When mounting text into the DOM, adjacent text nodes are merged.
 *  - Text nodes cannot be assigned a React root ID.
 *
 * This component is used to wrap strings in elements so that they can undergo
 * the same reconciliation that is applied to elements.
 *
 * TODO: Investigate representing React components in the DOM with text nodes.
 *
 * @class ReactDOMTextComponent
 * @extends ReactComponent
 * @internal
 */
var ReactDOMTextComponent = function (props) {
  // This constructor and its argument is currently used by mocks.
};

assign(ReactDOMTextComponent.prototype, {

  /**
   * @param {ReactText} text
   * @internal
   */
  construct: function (text) {
    // TODO: This is really a ReactText (ReactNode), not a ReactElement
    this._currentElement = text;
    this._stringText = '' + text;

    // Properties
    this._rootNodeID = null;
    this._mountIndex = 0;
  },

  /**
   * Creates the markup for this text node. This node is not intended to have
   * any features besides containing text content.
   *
   * @param {string} rootID DOM ID of the root node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {string} Markup for this text node.
   * @internal
   */
  mountComponent: function (rootID, transaction, context) {
    if (process.env.NODE_ENV !== 'production') {
      if (context[validateDOMNesting.ancestorInfoContextKey]) {
        validateDOMNesting('span', null, context[validateDOMNesting.ancestorInfoContextKey]);
      }
    }

    this._rootNodeID = rootID;
    if (transaction.useCreateElement) {
      var ownerDocument = context[ReactMount.ownerDocumentContextKey];
      var el = ownerDocument.createElement('span');
      DOMPropertyOperations.setAttributeForID(el, rootID);
      // Populate node cache
      ReactMount.getID(el);
      setTextContent(el, this._stringText);
      return el;
    } else {
      var escapedText = escapeTextContentForBrowser(this._stringText);

      if (transaction.renderToStaticMarkup) {
        // Normally we'd wrap this in a `span` for the reasons stated above, but
        // since this is a situation where React won't take over (static pages),
        // we can simply return the text as it is.
        return escapedText;
      }

      return '<span ' + DOMPropertyOperations.createMarkupForID(rootID) + '>' + escapedText + '</span>';
    }
  },

  /**
   * Updates this component by updating the text content.
   *
   * @param {ReactText} nextText The next text content
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  receiveComponent: function (nextText, transaction) {
    if (nextText !== this._currentElement) {
      this._currentElement = nextText;
      var nextStringText = '' + nextText;
      if (nextStringText !== this._stringText) {
        // TODO: Save this as pending props and use performUpdateIfNecessary
        // and/or updateComponent to do the actual update for consistency with
        // other component types?
        this._stringText = nextStringText;
        var node = ReactMount.getNode(this._rootNodeID);
        DOMChildrenOperations.updateTextContent(node, nextStringText);
      }
    }
  },

  unmountComponent: function () {
    ReactComponentBrowserEnvironment.unmountIDFromEnvironment(this._rootNodeID);
  }

});

module.exports = ReactDOMTextComponent;
},{"./DOMChildrenOperations":"/home/ec2-user/ksana2015/node_modules/react/lib/DOMChildrenOperations.js","./DOMPropertyOperations":"/home/ec2-user/ksana2015/node_modules/react/lib/DOMPropertyOperations.js","./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactComponentBrowserEnvironment":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactComponentBrowserEnvironment.js","./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js","./escapeTextContentForBrowser":"/home/ec2-user/ksana2015/node_modules/react/lib/escapeTextContentForBrowser.js","./setTextContent":"/home/ec2-user/ksana2015/node_modules/react/lib/setTextContent.js","./validateDOMNesting":"/home/ec2-user/ksana2015/node_modules/react/lib/validateDOMNesting.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMTextarea.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMTextarea
 */

'use strict';

var LinkedValueUtils = require('./LinkedValueUtils');
var ReactDOMIDOperations = require('./ReactDOMIDOperations');
var ReactUpdates = require('./ReactUpdates');

var assign = require('./Object.assign');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

function forceUpdateIfMounted() {
  if (this._rootNodeID) {
    // DOM component is still mounted; update
    ReactDOMTextarea.updateWrapper(this);
  }
}

/**
 * Implements a <textarea> native component that allows setting `value`, and
 * `defaultValue`. This differs from the traditional DOM API because value is
 * usually set as PCDATA children.
 *
 * If `value` is not supplied (or null/undefined), user actions that affect the
 * value will trigger updates to the element.
 *
 * If `value` is supplied (and not null/undefined), the rendered element will
 * not trigger updates to the element. Instead, the `value` prop must change in
 * order for the rendered element to be updated.
 *
 * The rendered element will be initialized with an empty value, the prop
 * `defaultValue` if specified, or the children content (deprecated).
 */
var ReactDOMTextarea = {
  getNativeProps: function (inst, props, context) {
    !(props.dangerouslySetInnerHTML == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, '`dangerouslySetInnerHTML` does not make sense on <textarea>.') : invariant(false) : undefined;

    // Always set children to the same thing. In IE9, the selection range will
    // get reset if `textContent` is mutated.
    var nativeProps = assign({}, props, {
      defaultValue: undefined,
      value: undefined,
      children: inst._wrapperState.initialValue,
      onChange: inst._wrapperState.onChange
    });

    return nativeProps;
  },

  mountWrapper: function (inst, props) {
    if (process.env.NODE_ENV !== 'production') {
      LinkedValueUtils.checkPropTypes('textarea', props, inst._currentElement._owner);
    }

    var defaultValue = props.defaultValue;
    // TODO (yungsters): Remove support for children content in <textarea>.
    var children = props.children;
    if (children != null) {
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(false, 'Use the `defaultValue` or `value` props instead of setting ' + 'children on <textarea>.') : undefined;
      }
      !(defaultValue == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'If you supply `defaultValue` on a <textarea>, do not pass children.') : invariant(false) : undefined;
      if (Array.isArray(children)) {
        !(children.length <= 1) ? process.env.NODE_ENV !== 'production' ? invariant(false, '<textarea> can only have at most one child.') : invariant(false) : undefined;
        children = children[0];
      }

      defaultValue = '' + children;
    }
    if (defaultValue == null) {
      defaultValue = '';
    }
    var value = LinkedValueUtils.getValue(props);

    inst._wrapperState = {
      // We save the initial value so that `ReactDOMComponent` doesn't update
      // `textContent` (unnecessary since we update value).
      // The initial value can be a boolean or object so that's why it's
      // forced to be a string.
      initialValue: '' + (value != null ? value : defaultValue),
      onChange: _handleChange.bind(inst)
    };
  },

  updateWrapper: function (inst) {
    var props = inst._currentElement.props;
    var value = LinkedValueUtils.getValue(props);
    if (value != null) {
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
      ReactDOMIDOperations.updatePropertyByID(inst._rootNodeID, 'value', '' + value);
    }
  }
};

function _handleChange(event) {
  var props = this._currentElement.props;
  var returnValue = LinkedValueUtils.executeOnChange(props, event);
  ReactUpdates.asap(forceUpdateIfMounted, this);
  return returnValue;
}

module.exports = ReactDOMTextarea;
},{"./LinkedValueUtils":"/home/ec2-user/ksana2015/node_modules/react/lib/LinkedValueUtils.js","./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactDOMIDOperations":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMIDOperations.js","./ReactUpdates":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdates.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDefaultBatchingStrategy.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultBatchingStrategy
 */

'use strict';

var ReactUpdates = require('./ReactUpdates');
var Transaction = require('./Transaction');

var assign = require('./Object.assign');
var emptyFunction = require('fbjs/lib/emptyFunction');

var RESET_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: function () {
    ReactDefaultBatchingStrategy.isBatchingUpdates = false;
  }
};

var FLUSH_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)
};

var TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];

function ReactDefaultBatchingStrategyTransaction() {
  this.reinitializeTransaction();
}

assign(ReactDefaultBatchingStrategyTransaction.prototype, Transaction.Mixin, {
  getTransactionWrappers: function () {
    return TRANSACTION_WRAPPERS;
  }
});

var transaction = new ReactDefaultBatchingStrategyTransaction();

var ReactDefaultBatchingStrategy = {
  isBatchingUpdates: false,

  /**
   * Call the provided function in a context within which calls to `setState`
   * and friends are batched such that components aren't updated unnecessarily.
   */
  batchedUpdates: function (callback, a, b, c, d, e) {
    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;

    ReactDefaultBatchingStrategy.isBatchingUpdates = true;

    // The code is written this way to avoid extra allocations
    if (alreadyBatchingUpdates) {
      callback(a, b, c, d, e);
    } else {
      transaction.perform(callback, null, a, b, c, d, e);
    }
  }
};

module.exports = ReactDefaultBatchingStrategy;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactUpdates":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdates.js","./Transaction":"/home/ec2-user/ksana2015/node_modules/react/lib/Transaction.js","fbjs/lib/emptyFunction":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyFunction.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDefaultInjection.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultInjection
 */

'use strict';

var BeforeInputEventPlugin = require('./BeforeInputEventPlugin');
var ChangeEventPlugin = require('./ChangeEventPlugin');
var ClientReactRootIndex = require('./ClientReactRootIndex');
var DefaultEventPluginOrder = require('./DefaultEventPluginOrder');
var EnterLeaveEventPlugin = require('./EnterLeaveEventPlugin');
var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');
var HTMLDOMPropertyConfig = require('./HTMLDOMPropertyConfig');
var ReactBrowserComponentMixin = require('./ReactBrowserComponentMixin');
var ReactComponentBrowserEnvironment = require('./ReactComponentBrowserEnvironment');
var ReactDefaultBatchingStrategy = require('./ReactDefaultBatchingStrategy');
var ReactDOMComponent = require('./ReactDOMComponent');
var ReactDOMTextComponent = require('./ReactDOMTextComponent');
var ReactEventListener = require('./ReactEventListener');
var ReactInjection = require('./ReactInjection');
var ReactInstanceHandles = require('./ReactInstanceHandles');
var ReactMount = require('./ReactMount');
var ReactReconcileTransaction = require('./ReactReconcileTransaction');
var SelectEventPlugin = require('./SelectEventPlugin');
var ServerReactRootIndex = require('./ServerReactRootIndex');
var SimpleEventPlugin = require('./SimpleEventPlugin');
var SVGDOMPropertyConfig = require('./SVGDOMPropertyConfig');

var alreadyInjected = false;

function inject() {
  if (alreadyInjected) {
    // TODO: This is currently true because these injections are shared between
    // the client and the server package. They should be built independently
    // and not share any injection state. Then this problem will be solved.
    return;
  }
  alreadyInjected = true;

  ReactInjection.EventEmitter.injectReactEventListener(ReactEventListener);

  /**
   * Inject modules for resolving DOM hierarchy and plugin ordering.
   */
  ReactInjection.EventPluginHub.injectEventPluginOrder(DefaultEventPluginOrder);
  ReactInjection.EventPluginHub.injectInstanceHandle(ReactInstanceHandles);
  ReactInjection.EventPluginHub.injectMount(ReactMount);

  /**
   * Some important event plugins included by default (without having to require
   * them).
   */
  ReactInjection.EventPluginHub.injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin,
    EnterLeaveEventPlugin: EnterLeaveEventPlugin,
    ChangeEventPlugin: ChangeEventPlugin,
    SelectEventPlugin: SelectEventPlugin,
    BeforeInputEventPlugin: BeforeInputEventPlugin
  });

  ReactInjection.NativeComponent.injectGenericComponentClass(ReactDOMComponent);

  ReactInjection.NativeComponent.injectTextComponentClass(ReactDOMTextComponent);

  ReactInjection.Class.injectMixin(ReactBrowserComponentMixin);

  ReactInjection.DOMProperty.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
  ReactInjection.DOMProperty.injectDOMPropertyConfig(SVGDOMPropertyConfig);

  ReactInjection.EmptyComponent.injectEmptyComponent('noscript');

  ReactInjection.Updates.injectReconcileTransaction(ReactReconcileTransaction);
  ReactInjection.Updates.injectBatchingStrategy(ReactDefaultBatchingStrategy);

  ReactInjection.RootIndex.injectCreateReactRootIndex(ExecutionEnvironment.canUseDOM ? ClientReactRootIndex.createReactRootIndex : ServerReactRootIndex.createReactRootIndex);

  ReactInjection.Component.injectEnvironment(ReactComponentBrowserEnvironment);

  if (process.env.NODE_ENV !== 'production') {
    var url = ExecutionEnvironment.canUseDOM && window.location.href || '';
    if (/[?&]react_perf\b/.test(url)) {
      var ReactDefaultPerf = require('./ReactDefaultPerf');
      ReactDefaultPerf.start();
    }
  }
}

module.exports = {
  inject: inject
};
},{"./BeforeInputEventPlugin":"/home/ec2-user/ksana2015/node_modules/react/lib/BeforeInputEventPlugin.js","./ChangeEventPlugin":"/home/ec2-user/ksana2015/node_modules/react/lib/ChangeEventPlugin.js","./ClientReactRootIndex":"/home/ec2-user/ksana2015/node_modules/react/lib/ClientReactRootIndex.js","./DefaultEventPluginOrder":"/home/ec2-user/ksana2015/node_modules/react/lib/DefaultEventPluginOrder.js","./EnterLeaveEventPlugin":"/home/ec2-user/ksana2015/node_modules/react/lib/EnterLeaveEventPlugin.js","./HTMLDOMPropertyConfig":"/home/ec2-user/ksana2015/node_modules/react/lib/HTMLDOMPropertyConfig.js","./ReactBrowserComponentMixin":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactBrowserComponentMixin.js","./ReactComponentBrowserEnvironment":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactComponentBrowserEnvironment.js","./ReactDOMComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMComponent.js","./ReactDOMTextComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMTextComponent.js","./ReactDefaultBatchingStrategy":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDefaultBatchingStrategy.js","./ReactDefaultPerf":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDefaultPerf.js","./ReactEventListener":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactEventListener.js","./ReactInjection":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInjection.js","./ReactInstanceHandles":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInstanceHandles.js","./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js","./ReactReconcileTransaction":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactReconcileTransaction.js","./SVGDOMPropertyConfig":"/home/ec2-user/ksana2015/node_modules/react/lib/SVGDOMPropertyConfig.js","./SelectEventPlugin":"/home/ec2-user/ksana2015/node_modules/react/lib/SelectEventPlugin.js","./ServerReactRootIndex":"/home/ec2-user/ksana2015/node_modules/react/lib/ServerReactRootIndex.js","./SimpleEventPlugin":"/home/ec2-user/ksana2015/node_modules/react/lib/SimpleEventPlugin.js","fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDefaultPerf.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultPerf
 * @typechecks static-only
 */

'use strict';

var DOMProperty = require('./DOMProperty');
var ReactDefaultPerfAnalysis = require('./ReactDefaultPerfAnalysis');
var ReactMount = require('./ReactMount');
var ReactPerf = require('./ReactPerf');

var performanceNow = require('fbjs/lib/performanceNow');

function roundFloat(val) {
  return Math.floor(val * 100) / 100;
}

function addValue(obj, key, val) {
  obj[key] = (obj[key] || 0) + val;
}

var ReactDefaultPerf = {
  _allMeasurements: [], // last item in the list is the current one
  _mountStack: [0],
  _injected: false,

  start: function () {
    if (!ReactDefaultPerf._injected) {
      ReactPerf.injection.injectMeasure(ReactDefaultPerf.measure);
    }

    ReactDefaultPerf._allMeasurements.length = 0;
    ReactPerf.enableMeasure = true;
  },

  stop: function () {
    ReactPerf.enableMeasure = false;
  },

  getLastMeasurements: function () {
    return ReactDefaultPerf._allMeasurements;
  },

  printExclusive: function (measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getExclusiveSummary(measurements);
    console.table(summary.map(function (item) {
      return {
        'Component class name': item.componentName,
        'Total inclusive time (ms)': roundFloat(item.inclusive),
        'Exclusive mount time (ms)': roundFloat(item.exclusive),
        'Exclusive render time (ms)': roundFloat(item.render),
        'Mount time per instance (ms)': roundFloat(item.exclusive / item.count),
        'Render time per instance (ms)': roundFloat(item.render / item.count),
        'Instances': item.count
      };
    }));
    // TODO: ReactDefaultPerfAnalysis.getTotalTime() does not return the correct
    // number.
  },

  printInclusive: function (measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getInclusiveSummary(measurements);
    console.table(summary.map(function (item) {
      return {
        'Owner > component': item.componentName,
        'Inclusive time (ms)': roundFloat(item.time),
        'Instances': item.count
      };
    }));
    console.log('Total time:', ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms');
  },

  getMeasurementsSummaryMap: function (measurements) {
    var summary = ReactDefaultPerfAnalysis.getInclusiveSummary(measurements, true);
    return summary.map(function (item) {
      return {
        'Owner > component': item.componentName,
        'Wasted time (ms)': item.time,
        'Instances': item.count
      };
    });
  },

  printWasted: function (measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    console.table(ReactDefaultPerf.getMeasurementsSummaryMap(measurements));
    console.log('Total time:', ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms');
  },

  printDOM: function (measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getDOMSummary(measurements);
    console.table(summary.map(function (item) {
      var result = {};
      result[DOMProperty.ID_ATTRIBUTE_NAME] = item.id;
      result.type = item.type;
      result.args = JSON.stringify(item.args);
      return result;
    }));
    console.log('Total time:', ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms');
  },

  _recordWrite: function (id, fnName, totalTime, args) {
    // TODO: totalTime isn't that useful since it doesn't count paints/reflows
    var writes = ReactDefaultPerf._allMeasurements[ReactDefaultPerf._allMeasurements.length - 1].writes;
    writes[id] = writes[id] || [];
    writes[id].push({
      type: fnName,
      time: totalTime,
      args: args
    });
  },

  measure: function (moduleName, fnName, func) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var totalTime;
      var rv;
      var start;

      if (fnName === '_renderNewRootComponent' || fnName === 'flushBatchedUpdates') {
        // A "measurement" is a set of metrics recorded for each flush. We want
        // to group the metrics for a given flush together so we can look at the
        // components that rendered and the DOM operations that actually
        // happened to determine the amount of "wasted work" performed.
        ReactDefaultPerf._allMeasurements.push({
          exclusive: {},
          inclusive: {},
          render: {},
          counts: {},
          writes: {},
          displayNames: {},
          totalTime: 0,
          created: {}
        });
        start = performanceNow();
        rv = func.apply(this, args);
        ReactDefaultPerf._allMeasurements[ReactDefaultPerf._allMeasurements.length - 1].totalTime = performanceNow() - start;
        return rv;
      } else if (fnName === '_mountImageIntoNode' || moduleName === 'ReactBrowserEventEmitter' || moduleName === 'ReactDOMIDOperations' || moduleName === 'CSSPropertyOperations' || moduleName === 'DOMChildrenOperations' || moduleName === 'DOMPropertyOperations') {
        start = performanceNow();
        rv = func.apply(this, args);
        totalTime = performanceNow() - start;

        if (fnName === '_mountImageIntoNode') {
          var mountID = ReactMount.getID(args[1]);
          ReactDefaultPerf._recordWrite(mountID, fnName, totalTime, args[0]);
        } else if (fnName === 'dangerouslyProcessChildrenUpdates') {
          // special format
          args[0].forEach(function (update) {
            var writeArgs = {};
            if (update.fromIndex !== null) {
              writeArgs.fromIndex = update.fromIndex;
            }
            if (update.toIndex !== null) {
              writeArgs.toIndex = update.toIndex;
            }
            if (update.textContent !== null) {
              writeArgs.textContent = update.textContent;
            }
            if (update.markupIndex !== null) {
              writeArgs.markup = args[1][update.markupIndex];
            }
            ReactDefaultPerf._recordWrite(update.parentID, update.type, totalTime, writeArgs);
          });
        } else {
          // basic format
          var id = args[0];
          if (typeof id === 'object') {
            id = ReactMount.getID(args[0]);
          }
          ReactDefaultPerf._recordWrite(id, fnName, totalTime, Array.prototype.slice.call(args, 1));
        }
        return rv;
      } else if (moduleName === 'ReactCompositeComponent' && (fnName === 'mountComponent' || fnName === 'updateComponent' || // TODO: receiveComponent()?
      fnName === '_renderValidatedComponent')) {

        if (this._currentElement.type === ReactMount.TopLevelWrapper) {
          return func.apply(this, args);
        }

        var rootNodeID = fnName === 'mountComponent' ? args[0] : this._rootNodeID;
        var isRender = fnName === '_renderValidatedComponent';
        var isMount = fnName === 'mountComponent';

        var mountStack = ReactDefaultPerf._mountStack;
        var entry = ReactDefaultPerf._allMeasurements[ReactDefaultPerf._allMeasurements.length - 1];

        if (isRender) {
          addValue(entry.counts, rootNodeID, 1);
        } else if (isMount) {
          entry.created[rootNodeID] = true;
          mountStack.push(0);
        }

        start = performanceNow();
        rv = func.apply(this, args);
        totalTime = performanceNow() - start;

        if (isRender) {
          addValue(entry.render, rootNodeID, totalTime);
        } else if (isMount) {
          var subMountTime = mountStack.pop();
          mountStack[mountStack.length - 1] += totalTime;
          addValue(entry.exclusive, rootNodeID, totalTime - subMountTime);
          addValue(entry.inclusive, rootNodeID, totalTime);
        } else {
          addValue(entry.inclusive, rootNodeID, totalTime);
        }

        entry.displayNames[rootNodeID] = {
          current: this.getName(),
          owner: this._currentElement._owner ? this._currentElement._owner.getName() : '<root>'
        };

        return rv;
      } else {
        return func.apply(this, args);
      }
    };
  }
};

module.exports = ReactDefaultPerf;
},{"./DOMProperty":"/home/ec2-user/ksana2015/node_modules/react/lib/DOMProperty.js","./ReactDefaultPerfAnalysis":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDefaultPerfAnalysis.js","./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js","./ReactPerf":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPerf.js","fbjs/lib/performanceNow":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/performanceNow.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDefaultPerfAnalysis.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultPerfAnalysis
 */

'use strict';

var assign = require('./Object.assign');

// Don't try to save users less than 1.2ms (a number I made up)
var DONT_CARE_THRESHOLD = 1.2;
var DOM_OPERATION_TYPES = {
  '_mountImageIntoNode': 'set innerHTML',
  INSERT_MARKUP: 'set innerHTML',
  MOVE_EXISTING: 'move',
  REMOVE_NODE: 'remove',
  SET_MARKUP: 'set innerHTML',
  TEXT_CONTENT: 'set textContent',
  'setValueForProperty': 'update attribute',
  'setValueForAttribute': 'update attribute',
  'deleteValueForProperty': 'remove attribute',
  'setValueForStyles': 'update styles',
  'replaceNodeWithMarkup': 'replace',
  'updateTextContent': 'set textContent'
};

function getTotalTime(measurements) {
  // TODO: return number of DOM ops? could be misleading.
  // TODO: measure dropped frames after reconcile?
  // TODO: log total time of each reconcile and the top-level component
  // class that triggered it.
  var totalTime = 0;
  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    totalTime += measurement.totalTime;
  }
  return totalTime;
}

function getDOMSummary(measurements) {
  var items = [];
  measurements.forEach(function (measurement) {
    Object.keys(measurement.writes).forEach(function (id) {
      measurement.writes[id].forEach(function (write) {
        items.push({
          id: id,
          type: DOM_OPERATION_TYPES[write.type] || write.type,
          args: write.args
        });
      });
    });
  });
  return items;
}

function getExclusiveSummary(measurements) {
  var candidates = {};
  var displayName;

  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var allIDs = assign({}, measurement.exclusive, measurement.inclusive);

    for (var id in allIDs) {
      displayName = measurement.displayNames[id].current;

      candidates[displayName] = candidates[displayName] || {
        componentName: displayName,
        inclusive: 0,
        exclusive: 0,
        render: 0,
        count: 0
      };
      if (measurement.render[id]) {
        candidates[displayName].render += measurement.render[id];
      }
      if (measurement.exclusive[id]) {
        candidates[displayName].exclusive += measurement.exclusive[id];
      }
      if (measurement.inclusive[id]) {
        candidates[displayName].inclusive += measurement.inclusive[id];
      }
      if (measurement.counts[id]) {
        candidates[displayName].count += measurement.counts[id];
      }
    }
  }

  // Now make a sorted array with the results.
  var arr = [];
  for (displayName in candidates) {
    if (candidates[displayName].exclusive >= DONT_CARE_THRESHOLD) {
      arr.push(candidates[displayName]);
    }
  }

  arr.sort(function (a, b) {
    return b.exclusive - a.exclusive;
  });

  return arr;
}

function getInclusiveSummary(measurements, onlyClean) {
  var candidates = {};
  var inclusiveKey;

  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var allIDs = assign({}, measurement.exclusive, measurement.inclusive);
    var cleanComponents;

    if (onlyClean) {
      cleanComponents = getUnchangedComponents(measurement);
    }

    for (var id in allIDs) {
      if (onlyClean && !cleanComponents[id]) {
        continue;
      }

      var displayName = measurement.displayNames[id];

      // Inclusive time is not useful for many components without knowing where
      // they are instantiated. So we aggregate inclusive time with both the
      // owner and current displayName as the key.
      inclusiveKey = displayName.owner + ' > ' + displayName.current;

      candidates[inclusiveKey] = candidates[inclusiveKey] || {
        componentName: inclusiveKey,
        time: 0,
        count: 0
      };

      if (measurement.inclusive[id]) {
        candidates[inclusiveKey].time += measurement.inclusive[id];
      }
      if (measurement.counts[id]) {
        candidates[inclusiveKey].count += measurement.counts[id];
      }
    }
  }

  // Now make a sorted array with the results.
  var arr = [];
  for (inclusiveKey in candidates) {
    if (candidates[inclusiveKey].time >= DONT_CARE_THRESHOLD) {
      arr.push(candidates[inclusiveKey]);
    }
  }

  arr.sort(function (a, b) {
    return b.time - a.time;
  });

  return arr;
}

function getUnchangedComponents(measurement) {
  // For a given reconcile, look at which components did not actually
  // render anything to the DOM and return a mapping of their ID to
  // the amount of time it took to render the entire subtree.
  var cleanComponents = {};
  var dirtyLeafIDs = Object.keys(measurement.writes);
  var allIDs = assign({}, measurement.exclusive, measurement.inclusive);

  for (var id in allIDs) {
    var isDirty = false;
    // For each component that rendered, see if a component that triggered
    // a DOM op is in its subtree.
    for (var i = 0; i < dirtyLeafIDs.length; i++) {
      if (dirtyLeafIDs[i].indexOf(id) === 0) {
        isDirty = true;
        break;
      }
    }
    // check if component newly created
    if (measurement.created[id]) {
      isDirty = true;
    }
    if (!isDirty && measurement.counts[id] > 0) {
      cleanComponents[id] = true;
    }
  }
  return cleanComponents;
}

var ReactDefaultPerfAnalysis = {
  getExclusiveSummary: getExclusiveSummary,
  getInclusiveSummary: getInclusiveSummary,
  getDOMSummary: getDOMSummary,
  getTotalTime: getTotalTime
};

module.exports = ReactDefaultPerfAnalysis;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js":[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactElement
 */

'use strict';

var ReactCurrentOwner = require('./ReactCurrentOwner');

var assign = require('./Object.assign');
var canDefineProperty = require('./canDefineProperty');

// The Symbol used to tag the ReactElement type. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol['for'] && Symbol['for']('react.element') || 0xeac7;

var RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
};

/**
 * Base constructor for all React elements. This is only used to make this
 * work with a dynamic instanceof check. Nothing should live on this prototype.
 *
 * @param {*} type
 * @param {*} key
 * @param {string|object} ref
 * @param {*} self A *temporary* helper to detect places where `this` is
 * different from the `owner` when React.createElement is called, so that we
 * can warn. We want to get rid of owner and replace string `ref`s with arrow
 * functions, and as long as `this` and owner are the same, there will be no
 * change in behavior.
 * @param {*} source An annotation object (added by a transpiler or otherwise)
 * indicating filename, line number, and/or other information.
 * @param {*} owner
 * @param {*} props
 * @internal
 */
var ReactElement = function (type, key, ref, self, source, owner, props) {
  var element = {
    // This tag allow us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner
  };

  if (process.env.NODE_ENV !== 'production') {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    element._store = {};

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
    if (canDefineProperty) {
      Object.defineProperty(element._store, 'validated', {
        configurable: false,
        enumerable: false,
        writable: true,
        value: false
      });
      // self and source are DEV only properties.
      Object.defineProperty(element, '_self', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: self
      });
      // Two elements created in two different places should be considered
      // equal for testing purposes and therefore we hide it from enumeration.
      Object.defineProperty(element, '_source', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: source
      });
    } else {
      element._store.validated = false;
      element._self = self;
      element._source = source;
    }
    Object.freeze(element.props);
    Object.freeze(element);
  }

  return element;
};

ReactElement.createElement = function (type, config, children) {
  var propName;

  // Reserved names are extracted
  var props = {};

  var key = null;
  var ref = null;
  var self = null;
  var source = null;

  if (config != null) {
    ref = config.ref === undefined ? null : config.ref;
    key = config.key === undefined ? null : '' + config.key;
    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (config.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (typeof props[propName] === 'undefined') {
        props[propName] = defaultProps[propName];
      }
    }
  }

  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
};

ReactElement.createFactory = function (type) {
  var factory = ReactElement.createElement.bind(null, type);
  // Expose the type on the factory and the prototype so that it can be
  // easily accessed on elements. E.g. `<Foo />.type === Foo`.
  // This should not be named `constructor` since this may not be the function
  // that created the element, and it may not even be a constructor.
  // Legacy hook TODO: Warn if this is accessed
  factory.type = type;
  return factory;
};

ReactElement.cloneAndReplaceKey = function (oldElement, newKey) {
  var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);

  return newElement;
};

ReactElement.cloneAndReplaceProps = function (oldElement, newProps) {
  var newElement = ReactElement(oldElement.type, oldElement.key, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, newProps);

  if (process.env.NODE_ENV !== 'production') {
    // If the key on the original is valid, then the clone is valid
    newElement._store.validated = oldElement._store.validated;
  }

  return newElement;
};

ReactElement.cloneElement = function (element, config, children) {
  var propName;

  // Original props are copied
  var props = assign({}, element.props);

  // Reserved names are extracted
  var key = element.key;
  var ref = element.ref;
  // Self is preserved since the owner is preserved.
  var self = element._self;
  // Source is preserved since cloneElement is unlikely to be targeted by a
  // transpiler, and the original source is probably a better indicator of the
  // true owner.
  var source = element._source;

  // Owner will be preserved, unless ref is overridden
  var owner = element._owner;

  if (config != null) {
    if (config.ref !== undefined) {
      // Silently steal the ref from the parent.
      ref = config.ref;
      owner = ReactCurrentOwner.current;
    }
    if (config.key !== undefined) {
      key = '' + config.key;
    }
    // Remaining properties override existing props
    for (propName in config) {
      if (config.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return ReactElement(element.type, key, ref, self, source, owner, props);
};

/**
 * @param {?object} object
 * @return {boolean} True if `object` is a valid component.
 * @final
 */
ReactElement.isValidElement = function (object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
};

module.exports = ReactElement;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactCurrentOwner":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactCurrentOwner.js","./canDefineProperty":"/home/ec2-user/ksana2015/node_modules/react/lib/canDefineProperty.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElementValidator.js":[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactElementValidator
 */

/**
 * ReactElementValidator provides a wrapper around a element factory
 * which validates the props passed to the element. This is intended to be
 * used only in DEV and could be replaced by a static type checker for languages
 * that support it.
 */

'use strict';

var ReactElement = require('./ReactElement');
var ReactPropTypeLocations = require('./ReactPropTypeLocations');
var ReactPropTypeLocationNames = require('./ReactPropTypeLocationNames');
var ReactCurrentOwner = require('./ReactCurrentOwner');

var canDefineProperty = require('./canDefineProperty');
var getIteratorFn = require('./getIteratorFn');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

function getDeclarationErrorAddendum() {
  if (ReactCurrentOwner.current) {
    var name = ReactCurrentOwner.current.getName();
    if (name) {
      return ' Check the render method of `' + name + '`.';
    }
  }
  return '';
}

/**
 * Warn if there's no key explicitly set on dynamic arrays of children or
 * object keys are not valid. This allows us to keep track of children between
 * updates.
 */
var ownerHasKeyUseWarning = {};

var loggedTypeFailures = {};

/**
 * Warn if the element doesn't have an explicit key assigned to it.
 * This element is in an array. The array could grow and shrink or be
 * reordered. All children that haven't already been validated are required to
 * have a "key" property assigned to it.
 *
 * @internal
 * @param {ReactElement} element Element that requires a key.
 * @param {*} parentType element's parent's type.
 */
function validateExplicitKey(element, parentType) {
  if (!element._store || element._store.validated || element.key != null) {
    return;
  }
  element._store.validated = true;

  var addenda = getAddendaForKeyUse('uniqueKey', element, parentType);
  if (addenda === null) {
    // we already showed the warning
    return;
  }
  process.env.NODE_ENV !== 'production' ? warning(false, 'Each child in an array or iterator should have a unique "key" prop.' + '%s%s%s', addenda.parentOrOwner || '', addenda.childOwner || '', addenda.url || '') : undefined;
}

/**
 * Shared warning and monitoring code for the key warnings.
 *
 * @internal
 * @param {string} messageType A key used for de-duping warnings.
 * @param {ReactElement} element Component that requires a key.
 * @param {*} parentType element's parent's type.
 * @returns {?object} A set of addenda to use in the warning message, or null
 * if the warning has already been shown before (and shouldn't be shown again).
 */
function getAddendaForKeyUse(messageType, element, parentType) {
  var addendum = getDeclarationErrorAddendum();
  if (!addendum) {
    var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;
    if (parentName) {
      addendum = ' Check the top-level render call using <' + parentName + '>.';
    }
  }

  var memoizer = ownerHasKeyUseWarning[messageType] || (ownerHasKeyUseWarning[messageType] = {});
  if (memoizer[addendum]) {
    return null;
  }
  memoizer[addendum] = true;

  var addenda = {
    parentOrOwner: addendum,
    url: ' See https://fb.me/react-warning-keys for more information.',
    childOwner: null
  };

  // Usually the current owner is the offender, but if it accepts children as a
  // property, it may be the creator of the child that's responsible for
  // assigning it a key.
  if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
    // Give the component that originally created this child.
    addenda.childOwner = ' It was passed a child from ' + element._owner.getName() + '.';
  }

  return addenda;
}

/**
 * Ensure that every element either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {ReactNode} node Statically passed child of any type.
 * @param {*} parentType node's parent's type.
 */
function validateChildKeys(node, parentType) {
  if (typeof node !== 'object') {
    return;
  }
  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) {
      var child = node[i];
      if (ReactElement.isValidElement(child)) {
        validateExplicitKey(child, parentType);
      }
    }
  } else if (ReactElement.isValidElement(node)) {
    // This element was passed in a valid location.
    if (node._store) {
      node._store.validated = true;
    }
  } else if (node) {
    var iteratorFn = getIteratorFn(node);
    // Entry iterators provide implicit keys.
    if (iteratorFn) {
      if (iteratorFn !== node.entries) {
        var iterator = iteratorFn.call(node);
        var step;
        while (!(step = iterator.next()).done) {
          if (ReactElement.isValidElement(step.value)) {
            validateExplicitKey(step.value, parentType);
          }
        }
      }
    }
  }
}

/**
 * Assert that the props are valid
 *
 * @param {string} componentName Name of the component for error messages.
 * @param {object} propTypes Map of prop name to a ReactPropType
 * @param {object} props
 * @param {string} location e.g. "prop", "context", "child context"
 * @private
 */
function checkPropTypes(componentName, propTypes, props, location) {
  for (var propName in propTypes) {
    if (propTypes.hasOwnProperty(propName)) {
      var error;
      // Prop type validation may throw. In case they do, we don't want to
      // fail the render phase where it didn't fail before. So we log it.
      // After these have been cleaned up, we'll let them throw.
      try {
        // This is intentionally an invariant that gets caught. It's the same
        // behavior as without this statement except with a better message.
        !(typeof propTypes[propName] === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', ReactPropTypeLocationNames[location], propName) : invariant(false) : undefined;
        error = propTypes[propName](props, propName, componentName, location);
      } catch (ex) {
        error = ex;
      }
      process.env.NODE_ENV !== 'production' ? warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', ReactPropTypeLocationNames[location], propName, typeof error) : undefined;
      if (error instanceof Error && !(error.message in loggedTypeFailures)) {
        // Only monitor this failure once because there tends to be a lot of the
        // same error.
        loggedTypeFailures[error.message] = true;

        var addendum = getDeclarationErrorAddendum();
        process.env.NODE_ENV !== 'production' ? warning(false, 'Failed propType: %s%s', error.message, addendum) : undefined;
      }
    }
  }
}

/**
 * Given an element, validate that its props follow the propTypes definition,
 * provided by the type.
 *
 * @param {ReactElement} element
 */
function validatePropTypes(element) {
  var componentClass = element.type;
  if (typeof componentClass !== 'function') {
    return;
  }
  var name = componentClass.displayName || componentClass.name;
  if (componentClass.propTypes) {
    checkPropTypes(name, componentClass.propTypes, element.props, ReactPropTypeLocations.prop);
  }
  if (typeof componentClass.getDefaultProps === 'function') {
    process.env.NODE_ENV !== 'production' ? warning(componentClass.getDefaultProps.isReactClassApproved, 'getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.') : undefined;
  }
}

var ReactElementValidator = {

  createElement: function (type, props, children) {
    var validType = typeof type === 'string' || typeof type === 'function';
    // We warn in this case but don't throw. We expect the element creation to
    // succeed and there will likely be errors in render.
    process.env.NODE_ENV !== 'production' ? warning(validType, 'React.createElement: type should not be null, undefined, boolean, or ' + 'number. It should be a string (for DOM elements) or a ReactClass ' + '(for composite components).%s', getDeclarationErrorAddendum()) : undefined;

    var element = ReactElement.createElement.apply(this, arguments);

    // The result can be nullish if a mock or a custom function is used.
    // TODO: Drop this when these are no longer allowed as the type argument.
    if (element == null) {
      return element;
    }

    // Skip key warning if the type isn't valid since our key validation logic
    // doesn't expect a non-string/function type and can throw confusing errors.
    // We don't want exception behavior to differ between dev and prod.
    // (Rendering will throw with a helpful message and as soon as the type is
    // fixed, the key warnings will appear.)
    if (validType) {
      for (var i = 2; i < arguments.length; i++) {
        validateChildKeys(arguments[i], type);
      }
    }

    validatePropTypes(element);

    return element;
  },

  createFactory: function (type) {
    var validatedFactory = ReactElementValidator.createElement.bind(null, type);
    // Legacy hook TODO: Warn if this is accessed
    validatedFactory.type = type;

    if (process.env.NODE_ENV !== 'production') {
      if (canDefineProperty) {
        Object.defineProperty(validatedFactory, 'type', {
          enumerable: false,
          get: function () {
            process.env.NODE_ENV !== 'production' ? warning(false, 'Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.') : undefined;
            Object.defineProperty(this, 'type', {
              value: type
            });
            return type;
          }
        });
      }
    }

    return validatedFactory;
  },

  cloneElement: function (element, props, children) {
    var newElement = ReactElement.cloneElement.apply(this, arguments);
    for (var i = 2; i < arguments.length; i++) {
      validateChildKeys(arguments[i], newElement.type);
    }
    validatePropTypes(newElement);
    return newElement;
  }

};

module.exports = ReactElementValidator;
},{"./ReactCurrentOwner":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactCurrentOwner.js","./ReactElement":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js","./ReactPropTypeLocationNames":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPropTypeLocationNames.js","./ReactPropTypeLocations":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPropTypeLocations.js","./canDefineProperty":"/home/ec2-user/ksana2015/node_modules/react/lib/canDefineProperty.js","./getIteratorFn":"/home/ec2-user/ksana2015/node_modules/react/lib/getIteratorFn.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactEmptyComponent.js":[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactEmptyComponent
 */

'use strict';

var ReactElement = require('./ReactElement');
var ReactEmptyComponentRegistry = require('./ReactEmptyComponentRegistry');
var ReactReconciler = require('./ReactReconciler');

var assign = require('./Object.assign');

var placeholderElement;

var ReactEmptyComponentInjection = {
  injectEmptyComponent: function (component) {
    placeholderElement = ReactElement.createElement(component);
  }
};

var ReactEmptyComponent = function (instantiate) {
  this._currentElement = null;
  this._rootNodeID = null;
  this._renderedComponent = instantiate(placeholderElement);
};
assign(ReactEmptyComponent.prototype, {
  construct: function (element) {},
  mountComponent: function (rootID, transaction, context) {
    ReactEmptyComponentRegistry.registerNullComponentID(rootID);
    this._rootNodeID = rootID;
    return ReactReconciler.mountComponent(this._renderedComponent, rootID, transaction, context);
  },
  receiveComponent: function () {},
  unmountComponent: function (rootID, transaction, context) {
    ReactReconciler.unmountComponent(this._renderedComponent);
    ReactEmptyComponentRegistry.deregisterNullComponentID(this._rootNodeID);
    this._rootNodeID = null;
    this._renderedComponent = null;
  }
});

ReactEmptyComponent.injection = ReactEmptyComponentInjection;

module.exports = ReactEmptyComponent;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactElement":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js","./ReactEmptyComponentRegistry":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactEmptyComponentRegistry.js","./ReactReconciler":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactReconciler.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactEmptyComponentRegistry.js":[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactEmptyComponentRegistry
 */

'use strict';

// This registry keeps track of the React IDs of the components that rendered to
// `null` (in reality a placeholder such as `noscript`)
var nullComponentIDsRegistry = {};

/**
 * @param {string} id Component's `_rootNodeID`.
 * @return {boolean} True if the component is rendered to null.
 */
function isNullComponentID(id) {
  return !!nullComponentIDsRegistry[id];
}

/**
 * Mark the component as having rendered to null.
 * @param {string} id Component's `_rootNodeID`.
 */
function registerNullComponentID(id) {
  nullComponentIDsRegistry[id] = true;
}

/**
 * Unmark the component as having rendered to null: it renders to something now.
 * @param {string} id Component's `_rootNodeID`.
 */
function deregisterNullComponentID(id) {
  delete nullComponentIDsRegistry[id];
}

var ReactEmptyComponentRegistry = {
  isNullComponentID: isNullComponentID,
  registerNullComponentID: registerNullComponentID,
  deregisterNullComponentID: deregisterNullComponentID
};

module.exports = ReactEmptyComponentRegistry;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactErrorUtils.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactErrorUtils
 * @typechecks
 */

'use strict';

var caughtError = null;

/**
 * Call a function while guarding against errors that happens within it.
 *
 * @param {?String} name of the guard to use for logging or debugging
 * @param {Function} func The function to invoke
 * @param {*} a First argument
 * @param {*} b Second argument
 */
function invokeGuardedCallback(name, func, a, b) {
  try {
    return func(a, b);
  } catch (x) {
    if (caughtError === null) {
      caughtError = x;
    }
    return undefined;
  }
}

var ReactErrorUtils = {
  invokeGuardedCallback: invokeGuardedCallback,

  /**
   * Invoked by ReactTestUtils.Simulate so that any errors thrown by the event
   * handler are sure to be rethrown by rethrowCaughtError.
   */
  invokeGuardedCallbackWithCatch: invokeGuardedCallback,

  /**
   * During execution of guarded functions we will capture the first error which
   * we will rethrow to be handled by the top level error handler.
   */
  rethrowCaughtError: function () {
    if (caughtError) {
      var error = caughtError;
      caughtError = null;
      throw error;
    }
  }
};

if (process.env.NODE_ENV !== 'production') {
  /**
   * To help development we can get better devtools integration by simulating a
   * real browser event.
   */
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof document !== 'undefined' && typeof document.createEvent === 'function') {
    var fakeNode = document.createElement('react');
    ReactErrorUtils.invokeGuardedCallback = function (name, func, a, b) {
      var boundFunc = func.bind(null, a, b);
      var evtType = 'react-' + name;
      fakeNode.addEventListener(evtType, boundFunc, false);
      var evt = document.createEvent('Event');
      evt.initEvent(evtType, false, false);
      fakeNode.dispatchEvent(evt);
      fakeNode.removeEventListener(evtType, boundFunc, false);
    };
  }
}

module.exports = ReactErrorUtils;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactEventEmitterMixin.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactEventEmitterMixin
 */

'use strict';

var EventPluginHub = require('./EventPluginHub');

function runEventQueueInBatch(events) {
  EventPluginHub.enqueueEvents(events);
  EventPluginHub.processEventQueue(false);
}

var ReactEventEmitterMixin = {

  /**
   * Streams a fired top-level event to `EventPluginHub` where plugins have the
   * opportunity to create `ReactEvent`s to be dispatched.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {object} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native environment event.
   */
  handleTopLevel: function (topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
    var events = EventPluginHub.extractEvents(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget);
    runEventQueueInBatch(events);
  }
};

module.exports = ReactEventEmitterMixin;
},{"./EventPluginHub":"/home/ec2-user/ksana2015/node_modules/react/lib/EventPluginHub.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactEventListener.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactEventListener
 * @typechecks static-only
 */

'use strict';

var EventListener = require('fbjs/lib/EventListener');
var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');
var PooledClass = require('./PooledClass');
var ReactInstanceHandles = require('./ReactInstanceHandles');
var ReactMount = require('./ReactMount');
var ReactUpdates = require('./ReactUpdates');

var assign = require('./Object.assign');
var getEventTarget = require('./getEventTarget');
var getUnboundedScrollPosition = require('fbjs/lib/getUnboundedScrollPosition');

var DOCUMENT_FRAGMENT_NODE_TYPE = 11;

/**
 * Finds the parent React component of `node`.
 *
 * @param {*} node
 * @return {?DOMEventTarget} Parent container, or `null` if the specified node
 *                           is not nested.
 */
function findParent(node) {
  // TODO: It may be a good idea to cache this to prevent unnecessary DOM
  // traversal, but caching is difficult to do correctly without using a
  // mutation observer to listen for all DOM changes.
  var nodeID = ReactMount.getID(node);
  var rootID = ReactInstanceHandles.getReactRootIDFromNodeID(nodeID);
  var container = ReactMount.findReactContainerForID(rootID);
  var parent = ReactMount.getFirstReactDOM(container);
  return parent;
}

// Used to store ancestor hierarchy in top level callback
function TopLevelCallbackBookKeeping(topLevelType, nativeEvent) {
  this.topLevelType = topLevelType;
  this.nativeEvent = nativeEvent;
  this.ancestors = [];
}
assign(TopLevelCallbackBookKeeping.prototype, {
  destructor: function () {
    this.topLevelType = null;
    this.nativeEvent = null;
    this.ancestors.length = 0;
  }
});
PooledClass.addPoolingTo(TopLevelCallbackBookKeeping, PooledClass.twoArgumentPooler);

function handleTopLevelImpl(bookKeeping) {
  // TODO: Re-enable event.path handling
  //
  // if (bookKeeping.nativeEvent.path && bookKeeping.nativeEvent.path.length > 1) {
  //   // New browsers have a path attribute on native events
  //   handleTopLevelWithPath(bookKeeping);
  // } else {
  //   // Legacy browsers don't have a path attribute on native events
  //   handleTopLevelWithoutPath(bookKeeping);
  // }

  void handleTopLevelWithPath; // temporarily unused
  handleTopLevelWithoutPath(bookKeeping);
}

// Legacy browsers don't have a path attribute on native events
function handleTopLevelWithoutPath(bookKeeping) {
  var topLevelTarget = ReactMount.getFirstReactDOM(getEventTarget(bookKeeping.nativeEvent)) || window;

  // Loop through the hierarchy, in case there's any nested components.
  // It's important that we build the array of ancestors before calling any
  // event handlers, because event handlers can modify the DOM, leading to
  // inconsistencies with ReactMount's node cache. See #1105.
  var ancestor = topLevelTarget;
  while (ancestor) {
    bookKeeping.ancestors.push(ancestor);
    ancestor = findParent(ancestor);
  }

  for (var i = 0; i < bookKeeping.ancestors.length; i++) {
    topLevelTarget = bookKeeping.ancestors[i];
    var topLevelTargetID = ReactMount.getID(topLevelTarget) || '';
    ReactEventListener._handleTopLevel(bookKeeping.topLevelType, topLevelTarget, topLevelTargetID, bookKeeping.nativeEvent, getEventTarget(bookKeeping.nativeEvent));
  }
}

// New browsers have a path attribute on native events
function handleTopLevelWithPath(bookKeeping) {
  var path = bookKeeping.nativeEvent.path;
  var currentNativeTarget = path[0];
  var eventsFired = 0;
  for (var i = 0; i < path.length; i++) {
    var currentPathElement = path[i];
    if (currentPathElement.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE) {
      currentNativeTarget = path[i + 1];
    }
    // TODO: slow
    var reactParent = ReactMount.getFirstReactDOM(currentPathElement);
    if (reactParent === currentPathElement) {
      var currentPathElementID = ReactMount.getID(currentPathElement);
      var newRootID = ReactInstanceHandles.getReactRootIDFromNodeID(currentPathElementID);
      bookKeeping.ancestors.push(currentPathElement);

      var topLevelTargetID = ReactMount.getID(currentPathElement) || '';
      eventsFired++;
      ReactEventListener._handleTopLevel(bookKeeping.topLevelType, currentPathElement, topLevelTargetID, bookKeeping.nativeEvent, currentNativeTarget);

      // Jump to the root of this React render tree
      while (currentPathElementID !== newRootID) {
        i++;
        currentPathElement = path[i];
        currentPathElementID = ReactMount.getID(currentPathElement);
      }
    }
  }
  if (eventsFired === 0) {
    ReactEventListener._handleTopLevel(bookKeeping.topLevelType, window, '', bookKeeping.nativeEvent, getEventTarget(bookKeeping.nativeEvent));
  }
}

function scrollValueMonitor(cb) {
  var scrollPosition = getUnboundedScrollPosition(window);
  cb(scrollPosition);
}

var ReactEventListener = {
  _enabled: true,
  _handleTopLevel: null,

  WINDOW_HANDLE: ExecutionEnvironment.canUseDOM ? window : null,

  setHandleTopLevel: function (handleTopLevel) {
    ReactEventListener._handleTopLevel = handleTopLevel;
  },

  setEnabled: function (enabled) {
    ReactEventListener._enabled = !!enabled;
  },

  isEnabled: function () {
    return ReactEventListener._enabled;
  },

  /**
   * Traps top-level events by using event bubbling.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} handle Element on which to attach listener.
   * @return {?object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
  trapBubbledEvent: function (topLevelType, handlerBaseName, handle) {
    var element = handle;
    if (!element) {
      return null;
    }
    return EventListener.listen(element, handlerBaseName, ReactEventListener.dispatchEvent.bind(null, topLevelType));
  },

  /**
   * Traps a top-level event by using event capturing.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} handle Element on which to attach listener.
   * @return {?object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
  trapCapturedEvent: function (topLevelType, handlerBaseName, handle) {
    var element = handle;
    if (!element) {
      return null;
    }
    return EventListener.capture(element, handlerBaseName, ReactEventListener.dispatchEvent.bind(null, topLevelType));
  },

  monitorScrollValue: function (refresh) {
    var callback = scrollValueMonitor.bind(null, refresh);
    EventListener.listen(window, 'scroll', callback);
  },

  dispatchEvent: function (topLevelType, nativeEvent) {
    if (!ReactEventListener._enabled) {
      return;
    }

    var bookKeeping = TopLevelCallbackBookKeeping.getPooled(topLevelType, nativeEvent);
    try {
      // Event queue being processed in the same cycle allows
      // `preventDefault`.
      ReactUpdates.batchedUpdates(handleTopLevelImpl, bookKeeping);
    } finally {
      TopLevelCallbackBookKeeping.release(bookKeeping);
    }
  }
};

module.exports = ReactEventListener;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./PooledClass":"/home/ec2-user/ksana2015/node_modules/react/lib/PooledClass.js","./ReactInstanceHandles":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInstanceHandles.js","./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js","./ReactUpdates":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdates.js","./getEventTarget":"/home/ec2-user/ksana2015/node_modules/react/lib/getEventTarget.js","fbjs/lib/EventListener":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/EventListener.js","fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js","fbjs/lib/getUnboundedScrollPosition":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/getUnboundedScrollPosition.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInjection.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactInjection
 */

'use strict';

var DOMProperty = require('./DOMProperty');
var EventPluginHub = require('./EventPluginHub');
var ReactComponentEnvironment = require('./ReactComponentEnvironment');
var ReactClass = require('./ReactClass');
var ReactEmptyComponent = require('./ReactEmptyComponent');
var ReactBrowserEventEmitter = require('./ReactBrowserEventEmitter');
var ReactNativeComponent = require('./ReactNativeComponent');
var ReactPerf = require('./ReactPerf');
var ReactRootIndex = require('./ReactRootIndex');
var ReactUpdates = require('./ReactUpdates');

var ReactInjection = {
  Component: ReactComponentEnvironment.injection,
  Class: ReactClass.injection,
  DOMProperty: DOMProperty.injection,
  EmptyComponent: ReactEmptyComponent.injection,
  EventPluginHub: EventPluginHub.injection,
  EventEmitter: ReactBrowserEventEmitter.injection,
  NativeComponent: ReactNativeComponent.injection,
  Perf: ReactPerf.injection,
  RootIndex: ReactRootIndex.injection,
  Updates: ReactUpdates.injection
};

module.exports = ReactInjection;
},{"./DOMProperty":"/home/ec2-user/ksana2015/node_modules/react/lib/DOMProperty.js","./EventPluginHub":"/home/ec2-user/ksana2015/node_modules/react/lib/EventPluginHub.js","./ReactBrowserEventEmitter":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactBrowserEventEmitter.js","./ReactClass":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactClass.js","./ReactComponentEnvironment":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactComponentEnvironment.js","./ReactEmptyComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactEmptyComponent.js","./ReactNativeComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactNativeComponent.js","./ReactPerf":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPerf.js","./ReactRootIndex":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactRootIndex.js","./ReactUpdates":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdates.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInputSelection.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactInputSelection
 */

'use strict';

var ReactDOMSelection = require('./ReactDOMSelection');

var containsNode = require('fbjs/lib/containsNode');
var focusNode = require('fbjs/lib/focusNode');
var getActiveElement = require('fbjs/lib/getActiveElement');

function isInDocument(node) {
  return containsNode(document.documentElement, node);
}

/**
 * @ReactInputSelection: React input selection module. Based on Selection.js,
 * but modified to be suitable for react and has a couple of bug fixes (doesn't
 * assume buttons have range selections allowed).
 * Input selection module for React.
 */
var ReactInputSelection = {

  hasSelectionCapabilities: function (elem) {
    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
    return nodeName && (nodeName === 'input' && elem.type === 'text' || nodeName === 'textarea' || elem.contentEditable === 'true');
  },

  getSelectionInformation: function () {
    var focusedElem = getActiveElement();
    return {
      focusedElem: focusedElem,
      selectionRange: ReactInputSelection.hasSelectionCapabilities(focusedElem) ? ReactInputSelection.getSelection(focusedElem) : null
    };
  },

  /**
   * @restoreSelection: If any selection information was potentially lost,
   * restore it. This is useful when performing operations that could remove dom
   * nodes and place them back in, resulting in focus being lost.
   */
  restoreSelection: function (priorSelectionInformation) {
    var curFocusedElem = getActiveElement();
    var priorFocusedElem = priorSelectionInformation.focusedElem;
    var priorSelectionRange = priorSelectionInformation.selectionRange;
    if (curFocusedElem !== priorFocusedElem && isInDocument(priorFocusedElem)) {
      if (ReactInputSelection.hasSelectionCapabilities(priorFocusedElem)) {
        ReactInputSelection.setSelection(priorFocusedElem, priorSelectionRange);
      }
      focusNode(priorFocusedElem);
    }
  },

  /**
   * @getSelection: Gets the selection bounds of a focused textarea, input or
   * contentEditable node.
   * -@input: Look up selection bounds of this input
   * -@return {start: selectionStart, end: selectionEnd}
   */
  getSelection: function (input) {
    var selection;

    if ('selectionStart' in input) {
      // Modern browser with input or textarea.
      selection = {
        start: input.selectionStart,
        end: input.selectionEnd
      };
    } else if (document.selection && (input.nodeName && input.nodeName.toLowerCase() === 'input')) {
      // IE8 input.
      var range = document.selection.createRange();
      // There can only be one selection per document in IE, so it must
      // be in our element.
      if (range.parentElement() === input) {
        selection = {
          start: -range.moveStart('character', -input.value.length),
          end: -range.moveEnd('character', -input.value.length)
        };
      }
    } else {
      // Content editable or old IE textarea.
      selection = ReactDOMSelection.getOffsets(input);
    }

    return selection || { start: 0, end: 0 };
  },

  /**
   * @setSelection: Sets the selection bounds of a textarea or input and focuses
   * the input.
   * -@input     Set selection bounds of this input or textarea
   * -@offsets   Object of same form that is returned from get*
   */
  setSelection: function (input, offsets) {
    var start = offsets.start;
    var end = offsets.end;
    if (typeof end === 'undefined') {
      end = start;
    }

    if ('selectionStart' in input) {
      input.selectionStart = start;
      input.selectionEnd = Math.min(end, input.value.length);
    } else if (document.selection && (input.nodeName && input.nodeName.toLowerCase() === 'input')) {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveStart('character', start);
      range.moveEnd('character', end - start);
      range.select();
    } else {
      ReactDOMSelection.setOffsets(input, offsets);
    }
  }
};

module.exports = ReactInputSelection;
},{"./ReactDOMSelection":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMSelection.js","fbjs/lib/containsNode":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/containsNode.js","fbjs/lib/focusNode":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/focusNode.js","fbjs/lib/getActiveElement":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/getActiveElement.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInstanceHandles.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactInstanceHandles
 * @typechecks static-only
 */

'use strict';

var ReactRootIndex = require('./ReactRootIndex');

var invariant = require('fbjs/lib/invariant');

var SEPARATOR = '.';
var SEPARATOR_LENGTH = SEPARATOR.length;

/**
 * Maximum depth of traversals before we consider the possibility of a bad ID.
 */
var MAX_TREE_DEPTH = 10000;

/**
 * Creates a DOM ID prefix to use when mounting React components.
 *
 * @param {number} index A unique integer
 * @return {string} React root ID.
 * @internal
 */
function getReactRootIDString(index) {
  return SEPARATOR + index.toString(36);
}

/**
 * Checks if a character in the supplied ID is a separator or the end.
 *
 * @param {string} id A React DOM ID.
 * @param {number} index Index of the character to check.
 * @return {boolean} True if the character is a separator or end of the ID.
 * @private
 */
function isBoundary(id, index) {
  return id.charAt(index) === SEPARATOR || index === id.length;
}

/**
 * Checks if the supplied string is a valid React DOM ID.
 *
 * @param {string} id A React DOM ID, maybe.
 * @return {boolean} True if the string is a valid React DOM ID.
 * @private
 */
function isValidID(id) {
  return id === '' || id.charAt(0) === SEPARATOR && id.charAt(id.length - 1) !== SEPARATOR;
}

/**
 * Checks if the first ID is an ancestor of or equal to the second ID.
 *
 * @param {string} ancestorID
 * @param {string} descendantID
 * @return {boolean} True if `ancestorID` is an ancestor of `descendantID`.
 * @internal
 */
function isAncestorIDOf(ancestorID, descendantID) {
  return descendantID.indexOf(ancestorID) === 0 && isBoundary(descendantID, ancestorID.length);
}

/**
 * Gets the parent ID of the supplied React DOM ID, `id`.
 *
 * @param {string} id ID of a component.
 * @return {string} ID of the parent, or an empty string.
 * @private
 */
function getParentID(id) {
  return id ? id.substr(0, id.lastIndexOf(SEPARATOR)) : '';
}

/**
 * Gets the next DOM ID on the tree path from the supplied `ancestorID` to the
 * supplied `destinationID`. If they are equal, the ID is returned.
 *
 * @param {string} ancestorID ID of an ancestor node of `destinationID`.
 * @param {string} destinationID ID of the destination node.
 * @return {string} Next ID on the path from `ancestorID` to `destinationID`.
 * @private
 */
function getNextDescendantID(ancestorID, destinationID) {
  !(isValidID(ancestorID) && isValidID(destinationID)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'getNextDescendantID(%s, %s): Received an invalid React DOM ID.', ancestorID, destinationID) : invariant(false) : undefined;
  !isAncestorIDOf(ancestorID, destinationID) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'getNextDescendantID(...): React has made an invalid assumption about ' + 'the DOM hierarchy. Expected `%s` to be an ancestor of `%s`.', ancestorID, destinationID) : invariant(false) : undefined;
  if (ancestorID === destinationID) {
    return ancestorID;
  }
  // Skip over the ancestor and the immediate separator. Traverse until we hit
  // another separator or we reach the end of `destinationID`.
  var start = ancestorID.length + SEPARATOR_LENGTH;
  var i;
  for (i = start; i < destinationID.length; i++) {
    if (isBoundary(destinationID, i)) {
      break;
    }
  }
  return destinationID.substr(0, i);
}

/**
 * Gets the nearest common ancestor ID of two IDs.
 *
 * Using this ID scheme, the nearest common ancestor ID is the longest common
 * prefix of the two IDs that immediately preceded a "marker" in both strings.
 *
 * @param {string} oneID
 * @param {string} twoID
 * @return {string} Nearest common ancestor ID, or the empty string if none.
 * @private
 */
function getFirstCommonAncestorID(oneID, twoID) {
  var minLength = Math.min(oneID.length, twoID.length);
  if (minLength === 0) {
    return '';
  }
  var lastCommonMarkerIndex = 0;
  // Use `<=` to traverse until the "EOL" of the shorter string.
  for (var i = 0; i <= minLength; i++) {
    if (isBoundary(oneID, i) && isBoundary(twoID, i)) {
      lastCommonMarkerIndex = i;
    } else if (oneID.charAt(i) !== twoID.charAt(i)) {
      break;
    }
  }
  var longestCommonID = oneID.substr(0, lastCommonMarkerIndex);
  !isValidID(longestCommonID) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'getFirstCommonAncestorID(%s, %s): Expected a valid React DOM ID: %s', oneID, twoID, longestCommonID) : invariant(false) : undefined;
  return longestCommonID;
}

/**
 * Traverses the parent path between two IDs (either up or down). The IDs must
 * not be the same, and there must exist a parent path between them. If the
 * callback returns `false`, traversal is stopped.
 *
 * @param {?string} start ID at which to start traversal.
 * @param {?string} stop ID at which to end traversal.
 * @param {function} cb Callback to invoke each ID with.
 * @param {*} arg Argument to invoke the callback with.
 * @param {?boolean} skipFirst Whether or not to skip the first node.
 * @param {?boolean} skipLast Whether or not to skip the last node.
 * @private
 */
function traverseParentPath(start, stop, cb, arg, skipFirst, skipLast) {
  start = start || '';
  stop = stop || '';
  !(start !== stop) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'traverseParentPath(...): Cannot traverse from and to the same ID, `%s`.', start) : invariant(false) : undefined;
  var traverseUp = isAncestorIDOf(stop, start);
  !(traverseUp || isAncestorIDOf(start, stop)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'traverseParentPath(%s, %s, ...): Cannot traverse from two IDs that do ' + 'not have a parent path.', start, stop) : invariant(false) : undefined;
  // Traverse from `start` to `stop` one depth at a time.
  var depth = 0;
  var traverse = traverseUp ? getParentID : getNextDescendantID;
  for (var id = start;; /* until break */id = traverse(id, stop)) {
    var ret;
    if ((!skipFirst || id !== start) && (!skipLast || id !== stop)) {
      ret = cb(id, traverseUp, arg);
    }
    if (ret === false || id === stop) {
      // Only break //after// visiting `stop`.
      break;
    }
    !(depth++ < MAX_TREE_DEPTH) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'traverseParentPath(%s, %s, ...): Detected an infinite loop while ' + 'traversing the React DOM ID tree. This may be due to malformed IDs: %s', start, stop, id) : invariant(false) : undefined;
  }
}

/**
 * Manages the IDs assigned to DOM representations of React components. This
 * uses a specific scheme in order to traverse the DOM efficiently (e.g. in
 * order to simulate events).
 *
 * @internal
 */
var ReactInstanceHandles = {

  /**
   * Constructs a React root ID
   * @return {string} A React root ID.
   */
  createReactRootID: function () {
    return getReactRootIDString(ReactRootIndex.createReactRootIndex());
  },

  /**
   * Constructs a React ID by joining a root ID with a name.
   *
   * @param {string} rootID Root ID of a parent component.
   * @param {string} name A component's name (as flattened children).
   * @return {string} A React ID.
   * @internal
   */
  createReactID: function (rootID, name) {
    return rootID + name;
  },

  /**
   * Gets the DOM ID of the React component that is the root of the tree that
   * contains the React component with the supplied DOM ID.
   *
   * @param {string} id DOM ID of a React component.
   * @return {?string} DOM ID of the React component that is the root.
   * @internal
   */
  getReactRootIDFromNodeID: function (id) {
    if (id && id.charAt(0) === SEPARATOR && id.length > 1) {
      var index = id.indexOf(SEPARATOR, 1);
      return index > -1 ? id.substr(0, index) : id;
    }
    return null;
  },

  /**
   * Traverses the ID hierarchy and invokes the supplied `cb` on any IDs that
   * should would receive a `mouseEnter` or `mouseLeave` event.
   *
   * NOTE: Does not invoke the callback on the nearest common ancestor because
   * nothing "entered" or "left" that element.
   *
   * @param {string} leaveID ID being left.
   * @param {string} enterID ID being entered.
   * @param {function} cb Callback to invoke on each entered/left ID.
   * @param {*} upArg Argument to invoke the callback with on left IDs.
   * @param {*} downArg Argument to invoke the callback with on entered IDs.
   * @internal
   */
  traverseEnterLeave: function (leaveID, enterID, cb, upArg, downArg) {
    var ancestorID = getFirstCommonAncestorID(leaveID, enterID);
    if (ancestorID !== leaveID) {
      traverseParentPath(leaveID, ancestorID, cb, upArg, false, true);
    }
    if (ancestorID !== enterID) {
      traverseParentPath(ancestorID, enterID, cb, downArg, true, false);
    }
  },

  /**
   * Simulates the traversal of a two-phase, capture/bubble event dispatch.
   *
   * NOTE: This traversal happens on IDs without touching the DOM.
   *
   * @param {string} targetID ID of the target node.
   * @param {function} cb Callback to invoke.
   * @param {*} arg Argument to invoke the callback with.
   * @internal
   */
  traverseTwoPhase: function (targetID, cb, arg) {
    if (targetID) {
      traverseParentPath('', targetID, cb, arg, true, false);
      traverseParentPath(targetID, '', cb, arg, false, true);
    }
  },

  /**
   * Same as `traverseTwoPhase` but skips the `targetID`.
   */
  traverseTwoPhaseSkipTarget: function (targetID, cb, arg) {
    if (targetID) {
      traverseParentPath('', targetID, cb, arg, true, true);
      traverseParentPath(targetID, '', cb, arg, true, true);
    }
  },

  /**
   * Traverse a node ID, calling the supplied `cb` for each ancestor ID. For
   * example, passing `.0.$row-0.1` would result in `cb` getting called
   * with `.0`, `.0.$row-0`, and `.0.$row-0.1`.
   *
   * NOTE: This traversal happens on IDs without touching the DOM.
   *
   * @param {string} targetID ID of the target node.
   * @param {function} cb Callback to invoke.
   * @param {*} arg Argument to invoke the callback with.
   * @internal
   */
  traverseAncestors: function (targetID, cb, arg) {
    traverseParentPath('', targetID, cb, arg, true, false);
  },

  getFirstCommonAncestorID: getFirstCommonAncestorID,

  /**
   * Exposed for unit testing.
   * @private
   */
  _getNextDescendantID: getNextDescendantID,

  isAncestorIDOf: isAncestorIDOf,

  SEPARATOR: SEPARATOR

};

module.exports = ReactInstanceHandles;
},{"./ReactRootIndex":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactRootIndex.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInstanceMap.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactInstanceMap
 */

'use strict';

/**
 * `ReactInstanceMap` maintains a mapping from a public facing stateful
 * instance (key) and the internal representation (value). This allows public
 * methods to accept the user facing instance as an argument and map them back
 * to internal methods.
 */

// TODO: Replace this with ES6: var ReactInstanceMap = new Map();
var ReactInstanceMap = {

  /**
   * This API should be called `delete` but we'd have to make sure to always
   * transform these to strings for IE support. When this transform is fully
   * supported we can rename it.
   */
  remove: function (key) {
    key._reactInternalInstance = undefined;
  },

  get: function (key) {
    return key._reactInternalInstance;
  },

  has: function (key) {
    return key._reactInternalInstance !== undefined;
  },

  set: function (key, value) {
    key._reactInternalInstance = value;
  }

};

module.exports = ReactInstanceMap;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactIsomorphic.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactIsomorphic
 */

'use strict';

var ReactChildren = require('./ReactChildren');
var ReactComponent = require('./ReactComponent');
var ReactClass = require('./ReactClass');
var ReactDOMFactories = require('./ReactDOMFactories');
var ReactElement = require('./ReactElement');
var ReactElementValidator = require('./ReactElementValidator');
var ReactPropTypes = require('./ReactPropTypes');
var ReactVersion = require('./ReactVersion');

var assign = require('./Object.assign');
var onlyChild = require('./onlyChild');

var createElement = ReactElement.createElement;
var createFactory = ReactElement.createFactory;
var cloneElement = ReactElement.cloneElement;

if (process.env.NODE_ENV !== 'production') {
  createElement = ReactElementValidator.createElement;
  createFactory = ReactElementValidator.createFactory;
  cloneElement = ReactElementValidator.cloneElement;
}

var React = {

  // Modern

  Children: {
    map: ReactChildren.map,
    forEach: ReactChildren.forEach,
    count: ReactChildren.count,
    toArray: ReactChildren.toArray,
    only: onlyChild
  },

  Component: ReactComponent,

  createElement: createElement,
  cloneElement: cloneElement,
  isValidElement: ReactElement.isValidElement,

  // Classic

  PropTypes: ReactPropTypes,
  createClass: ReactClass.createClass,
  createFactory: createFactory,
  createMixin: function (mixin) {
    // Currently a noop. Will be used to validate and trace mixins.
    return mixin;
  },

  // This looks DOM specific but these are actually isomorphic helpers
  // since they are just generating DOM strings.
  DOM: ReactDOMFactories,

  version: ReactVersion,

  // Hook for JSX spread, don't use this for anything else.
  __spread: assign
};

module.exports = React;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactChildren":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactChildren.js","./ReactClass":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactClass.js","./ReactComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactComponent.js","./ReactDOMFactories":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMFactories.js","./ReactElement":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js","./ReactElementValidator":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElementValidator.js","./ReactPropTypes":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPropTypes.js","./ReactVersion":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactVersion.js","./onlyChild":"/home/ec2-user/ksana2015/node_modules/react/lib/onlyChild.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMarkupChecksum.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactMarkupChecksum
 */

'use strict';

var adler32 = require('./adler32');

var TAG_END = /\/?>/;

var ReactMarkupChecksum = {
  CHECKSUM_ATTR_NAME: 'data-react-checksum',

  /**
   * @param {string} markup Markup string
   * @return {string} Markup string with checksum attribute attached
   */
  addChecksumToMarkup: function (markup) {
    var checksum = adler32(markup);

    // Add checksum (handle both parent tags and self-closing tags)
    return markup.replace(TAG_END, ' ' + ReactMarkupChecksum.CHECKSUM_ATTR_NAME + '="' + checksum + '"$&');
  },

  /**
   * @param {string} markup to use
   * @param {DOMElement} element root React element
   * @returns {boolean} whether or not the markup is the same
   */
  canReuseMarkup: function (markup, element) {
    var existingChecksum = element.getAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);
    existingChecksum = existingChecksum && parseInt(existingChecksum, 10);
    var markupChecksum = adler32(markup);
    return markupChecksum === existingChecksum;
  }
};

module.exports = ReactMarkupChecksum;
},{"./adler32":"/home/ec2-user/ksana2015/node_modules/react/lib/adler32.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactMount
 */

'use strict';

var DOMProperty = require('./DOMProperty');
var ReactBrowserEventEmitter = require('./ReactBrowserEventEmitter');
var ReactCurrentOwner = require('./ReactCurrentOwner');
var ReactDOMFeatureFlags = require('./ReactDOMFeatureFlags');
var ReactElement = require('./ReactElement');
var ReactEmptyComponentRegistry = require('./ReactEmptyComponentRegistry');
var ReactInstanceHandles = require('./ReactInstanceHandles');
var ReactInstanceMap = require('./ReactInstanceMap');
var ReactMarkupChecksum = require('./ReactMarkupChecksum');
var ReactPerf = require('./ReactPerf');
var ReactReconciler = require('./ReactReconciler');
var ReactUpdateQueue = require('./ReactUpdateQueue');
var ReactUpdates = require('./ReactUpdates');

var assign = require('./Object.assign');
var emptyObject = require('fbjs/lib/emptyObject');
var containsNode = require('fbjs/lib/containsNode');
var instantiateReactComponent = require('./instantiateReactComponent');
var invariant = require('fbjs/lib/invariant');
var setInnerHTML = require('./setInnerHTML');
var shouldUpdateReactComponent = require('./shouldUpdateReactComponent');
var validateDOMNesting = require('./validateDOMNesting');
var warning = require('fbjs/lib/warning');

var ATTR_NAME = DOMProperty.ID_ATTRIBUTE_NAME;
var nodeCache = {};

var ELEMENT_NODE_TYPE = 1;
var DOC_NODE_TYPE = 9;
var DOCUMENT_FRAGMENT_NODE_TYPE = 11;

var ownerDocumentContextKey = '__ReactMount_ownerDocument$' + Math.random().toString(36).slice(2);

/** Mapping from reactRootID to React component instance. */
var instancesByReactRootID = {};

/** Mapping from reactRootID to `container` nodes. */
var containersByReactRootID = {};

if (process.env.NODE_ENV !== 'production') {
  /** __DEV__-only mapping from reactRootID to root elements. */
  var rootElementsByReactRootID = {};
}

// Used to store breadth-first search state in findComponentRoot.
var findComponentRootReusableArray = [];

/**
 * Finds the index of the first character
 * that's not common between the two given strings.
 *
 * @return {number} the index of the character where the strings diverge
 */
function firstDifferenceIndex(string1, string2) {
  var minLen = Math.min(string1.length, string2.length);
  for (var i = 0; i < minLen; i++) {
    if (string1.charAt(i) !== string2.charAt(i)) {
      return i;
    }
  }
  return string1.length === string2.length ? -1 : minLen;
}

/**
 * @param {DOMElement|DOMDocument} container DOM element that may contain
 * a React component
 * @return {?*} DOM element that may have the reactRoot ID, or null.
 */
function getReactRootElementInContainer(container) {
  if (!container) {
    return null;
  }

  if (container.nodeType === DOC_NODE_TYPE) {
    return container.documentElement;
  } else {
    return container.firstChild;
  }
}

/**
 * @param {DOMElement} container DOM element that may contain a React component.
 * @return {?string} A "reactRoot" ID, if a React component is rendered.
 */
function getReactRootID(container) {
  var rootElement = getReactRootElementInContainer(container);
  return rootElement && ReactMount.getID(rootElement);
}

/**
 * Accessing node[ATTR_NAME] or calling getAttribute(ATTR_NAME) on a form
 * element can return its control whose name or ID equals ATTR_NAME. All
 * DOM nodes support `getAttributeNode` but this can also get called on
 * other objects so just return '' if we're given something other than a
 * DOM node (such as window).
 *
 * @param {?DOMElement|DOMWindow|DOMDocument|DOMTextNode} node DOM node.
 * @return {string} ID of the supplied `domNode`.
 */
function getID(node) {
  var id = internalGetID(node);
  if (id) {
    if (nodeCache.hasOwnProperty(id)) {
      var cached = nodeCache[id];
      if (cached !== node) {
        !!isValid(cached, id) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactMount: Two valid but unequal nodes with the same `%s`: %s', ATTR_NAME, id) : invariant(false) : undefined;

        nodeCache[id] = node;
      }
    } else {
      nodeCache[id] = node;
    }
  }

  return id;
}

function internalGetID(node) {
  // If node is something like a window, document, or text node, none of
  // which support attributes or a .getAttribute method, gracefully return
  // the empty string, as if the attribute were missing.
  return node && node.getAttribute && node.getAttribute(ATTR_NAME) || '';
}

/**
 * Sets the React-specific ID of the given node.
 *
 * @param {DOMElement} node The DOM node whose ID will be set.
 * @param {string} id The value of the ID attribute.
 */
function setID(node, id) {
  var oldID = internalGetID(node);
  if (oldID !== id) {
    delete nodeCache[oldID];
  }
  node.setAttribute(ATTR_NAME, id);
  nodeCache[id] = node;
}

/**
 * Finds the node with the supplied React-generated DOM ID.
 *
 * @param {string} id A React-generated DOM ID.
 * @return {DOMElement} DOM node with the suppled `id`.
 * @internal
 */
function getNode(id) {
  if (!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)) {
    nodeCache[id] = ReactMount.findReactNodeByID(id);
  }
  return nodeCache[id];
}

/**
 * Finds the node with the supplied public React instance.
 *
 * @param {*} instance A public React instance.
 * @return {?DOMElement} DOM node with the suppled `id`.
 * @internal
 */
function getNodeFromInstance(instance) {
  var id = ReactInstanceMap.get(instance)._rootNodeID;
  if (ReactEmptyComponentRegistry.isNullComponentID(id)) {
    return null;
  }
  if (!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)) {
    nodeCache[id] = ReactMount.findReactNodeByID(id);
  }
  return nodeCache[id];
}

/**
 * A node is "valid" if it is contained by a currently mounted container.
 *
 * This means that the node does not have to be contained by a document in
 * order to be considered valid.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @param {string} id The expected ID of the node.
 * @return {boolean} Whether the node is contained by a mounted container.
 */
function isValid(node, id) {
  if (node) {
    !(internalGetID(node) === id) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactMount: Unexpected modification of `%s`', ATTR_NAME) : invariant(false) : undefined;

    var container = ReactMount.findReactContainerForID(id);
    if (container && containsNode(container, node)) {
      return true;
    }
  }

  return false;
}

/**
 * Causes the cache to forget about one React-specific ID.
 *
 * @param {string} id The ID to forget.
 */
function purgeID(id) {
  delete nodeCache[id];
}

var deepestNodeSoFar = null;
function findDeepestCachedAncestorImpl(ancestorID) {
  var ancestor = nodeCache[ancestorID];
  if (ancestor && isValid(ancestor, ancestorID)) {
    deepestNodeSoFar = ancestor;
  } else {
    // This node isn't populated in the cache, so presumably none of its
    // descendants are. Break out of the loop.
    return false;
  }
}

/**
 * Return the deepest cached node whose ID is a prefix of `targetID`.
 */
function findDeepestCachedAncestor(targetID) {
  deepestNodeSoFar = null;
  ReactInstanceHandles.traverseAncestors(targetID, findDeepestCachedAncestorImpl);

  var foundNode = deepestNodeSoFar;
  deepestNodeSoFar = null;
  return foundNode;
}

/**
 * Mounts this component and inserts it into the DOM.
 *
 * @param {ReactComponent} componentInstance The instance to mount.
 * @param {string} rootID DOM ID of the root node.
 * @param {DOMElement} container DOM element to mount into.
 * @param {ReactReconcileTransaction} transaction
 * @param {boolean} shouldReuseMarkup If true, do not insert markup
 */
function mountComponentIntoNode(componentInstance, rootID, container, transaction, shouldReuseMarkup, context) {
  if (ReactDOMFeatureFlags.useCreateElement) {
    context = assign({}, context);
    if (container.nodeType === DOC_NODE_TYPE) {
      context[ownerDocumentContextKey] = container;
    } else {
      context[ownerDocumentContextKey] = container.ownerDocument;
    }
  }
  if (process.env.NODE_ENV !== 'production') {
    if (context === emptyObject) {
      context = {};
    }
    var tag = container.nodeName.toLowerCase();
    context[validateDOMNesting.ancestorInfoContextKey] = validateDOMNesting.updatedAncestorInfo(null, tag, null);
  }
  var markup = ReactReconciler.mountComponent(componentInstance, rootID, transaction, context);
  componentInstance._renderedComponent._topLevelWrapper = componentInstance;
  ReactMount._mountImageIntoNode(markup, container, shouldReuseMarkup, transaction);
}

/**
 * Batched mount.
 *
 * @param {ReactComponent} componentInstance The instance to mount.
 * @param {string} rootID DOM ID of the root node.
 * @param {DOMElement} container DOM element to mount into.
 * @param {boolean} shouldReuseMarkup If true, do not insert markup
 */
function batchedMountComponentIntoNode(componentInstance, rootID, container, shouldReuseMarkup, context) {
  var transaction = ReactUpdates.ReactReconcileTransaction.getPooled(
  /* forceHTML */shouldReuseMarkup);
  transaction.perform(mountComponentIntoNode, null, componentInstance, rootID, container, transaction, shouldReuseMarkup, context);
  ReactUpdates.ReactReconcileTransaction.release(transaction);
}

/**
 * Unmounts a component and removes it from the DOM.
 *
 * @param {ReactComponent} instance React component instance.
 * @param {DOMElement} container DOM element to unmount from.
 * @final
 * @internal
 * @see {ReactMount.unmountComponentAtNode}
 */
function unmountComponentFromNode(instance, container) {
  ReactReconciler.unmountComponent(instance);

  if (container.nodeType === DOC_NODE_TYPE) {
    container = container.documentElement;
  }

  // http://jsperf.com/emptying-a-node
  while (container.lastChild) {
    container.removeChild(container.lastChild);
  }
}

/**
 * True if the supplied DOM node has a direct React-rendered child that is
 * not a React root element. Useful for warning in `render`,
 * `unmountComponentAtNode`, etc.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @return {boolean} True if the DOM element contains a direct child that was
 * rendered by React but is not a root element.
 * @internal
 */
function hasNonRootReactChild(node) {
  var reactRootID = getReactRootID(node);
  return reactRootID ? reactRootID !== ReactInstanceHandles.getReactRootIDFromNodeID(reactRootID) : false;
}

/**
 * Returns the first (deepest) ancestor of a node which is rendered by this copy
 * of React.
 */
function findFirstReactDOMImpl(node) {
  // This node might be from another React instance, so we make sure not to
  // examine the node cache here
  for (; node && node.parentNode !== node; node = node.parentNode) {
    if (node.nodeType !== 1) {
      // Not a DOMElement, therefore not a React component
      continue;
    }
    var nodeID = internalGetID(node);
    if (!nodeID) {
      continue;
    }
    var reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(nodeID);

    // If containersByReactRootID contains the container we find by crawling up
    // the tree, we know that this instance of React rendered the node.
    // nb. isValid's strategy (with containsNode) does not work because render
    // trees may be nested and we don't want a false positive in that case.
    var current = node;
    var lastID;
    do {
      lastID = internalGetID(current);
      current = current.parentNode;
      if (current == null) {
        // The passed-in node has been detached from the container it was
        // originally rendered into.
        return null;
      }
    } while (lastID !== reactRootID);

    if (current === containersByReactRootID[reactRootID]) {
      return node;
    }
  }
  return null;
}

/**
 * Temporary (?) hack so that we can store all top-level pending updates on
 * composites instead of having to worry about different types of components
 * here.
 */
var TopLevelWrapper = function () {};
TopLevelWrapper.prototype.isReactComponent = {};
if (process.env.NODE_ENV !== 'production') {
  TopLevelWrapper.displayName = 'TopLevelWrapper';
}
TopLevelWrapper.prototype.render = function () {
  // this.props is actually a ReactElement
  return this.props;
};

/**
 * Mounting is the process of initializing a React component by creating its
 * representative DOM elements and inserting them into a supplied `container`.
 * Any prior content inside `container` is destroyed in the process.
 *
 *   ReactMount.render(
 *     component,
 *     document.getElementById('container')
 *   );
 *
 *   <div id="container">                   <-- Supplied `container`.
 *     <div data-reactid=".3">              <-- Rendered reactRoot of React
 *       // ...                                 component.
 *     </div>
 *   </div>
 *
 * Inside of `container`, the first element rendered is the "reactRoot".
 */
var ReactMount = {

  TopLevelWrapper: TopLevelWrapper,

  /** Exposed for debugging purposes **/
  _instancesByReactRootID: instancesByReactRootID,

  /**
   * This is a hook provided to support rendering React components while
   * ensuring that the apparent scroll position of its `container` does not
   * change.
   *
   * @param {DOMElement} container The `container` being rendered into.
   * @param {function} renderCallback This must be called once to do the render.
   */
  scrollMonitor: function (container, renderCallback) {
    renderCallback();
  },

  /**
   * Take a component that's already mounted into the DOM and replace its props
   * @param {ReactComponent} prevComponent component instance already in the DOM
   * @param {ReactElement} nextElement component instance to render
   * @param {DOMElement} container container to render into
   * @param {?function} callback function triggered on completion
   */
  _updateRootComponent: function (prevComponent, nextElement, container, callback) {
    ReactMount.scrollMonitor(container, function () {
      ReactUpdateQueue.enqueueElementInternal(prevComponent, nextElement);
      if (callback) {
        ReactUpdateQueue.enqueueCallbackInternal(prevComponent, callback);
      }
    });

    if (process.env.NODE_ENV !== 'production') {
      // Record the root element in case it later gets transplanted.
      rootElementsByReactRootID[getReactRootID(container)] = getReactRootElementInContainer(container);
    }

    return prevComponent;
  },

  /**
   * Register a component into the instance map and starts scroll value
   * monitoring
   * @param {ReactComponent} nextComponent component instance to render
   * @param {DOMElement} container container to render into
   * @return {string} reactRoot ID prefix
   */
  _registerComponent: function (nextComponent, container) {
    !(container && (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE || container.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE)) ? process.env.NODE_ENV !== 'production' ? invariant(false, '_registerComponent(...): Target container is not a DOM element.') : invariant(false) : undefined;

    ReactBrowserEventEmitter.ensureScrollValueMonitoring();

    var reactRootID = ReactMount.registerContainer(container);
    instancesByReactRootID[reactRootID] = nextComponent;
    return reactRootID;
  },

  /**
   * Render a new component into the DOM.
   * @param {ReactElement} nextElement element to render
   * @param {DOMElement} container container to render into
   * @param {boolean} shouldReuseMarkup if we should skip the markup insertion
   * @return {ReactComponent} nextComponent
   */
  _renderNewRootComponent: function (nextElement, container, shouldReuseMarkup, context) {
    // Various parts of our code (such as ReactCompositeComponent's
    // _renderValidatedComponent) assume that calls to render aren't nested;
    // verify that that's the case.
    process.env.NODE_ENV !== 'production' ? warning(ReactCurrentOwner.current == null, '_renderNewRootComponent(): Render methods should be a pure function ' + 'of props and state; triggering nested component updates from ' + 'render is not allowed. If necessary, trigger nested updates in ' + 'componentDidUpdate. Check the render method of %s.', ReactCurrentOwner.current && ReactCurrentOwner.current.getName() || 'ReactCompositeComponent') : undefined;

    var componentInstance = instantiateReactComponent(nextElement, null);
    var reactRootID = ReactMount._registerComponent(componentInstance, container);

    // The initial render is synchronous but any updates that happen during
    // rendering, in componentWillMount or componentDidMount, will be batched
    // according to the current batching strategy.

    ReactUpdates.batchedUpdates(batchedMountComponentIntoNode, componentInstance, reactRootID, container, shouldReuseMarkup, context);

    if (process.env.NODE_ENV !== 'production') {
      // Record the root element in case it later gets transplanted.
      rootElementsByReactRootID[reactRootID] = getReactRootElementInContainer(container);
    }

    return componentInstance;
  },

  /**
   * Renders a React component into the DOM in the supplied `container`.
   *
   * If the React component was previously rendered into `container`, this will
   * perform an update on it and only mutate the DOM as necessary to reflect the
   * latest React component.
   *
   * @param {ReactComponent} parentComponent The conceptual parent of this render tree.
   * @param {ReactElement} nextElement Component element to render.
   * @param {DOMElement} container DOM element to render into.
   * @param {?function} callback function triggered on completion
   * @return {ReactComponent} Component instance rendered in `container`.
   */
  renderSubtreeIntoContainer: function (parentComponent, nextElement, container, callback) {
    !(parentComponent != null && parentComponent._reactInternalInstance != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'parentComponent must be a valid React Component') : invariant(false) : undefined;
    return ReactMount._renderSubtreeIntoContainer(parentComponent, nextElement, container, callback);
  },

  _renderSubtreeIntoContainer: function (parentComponent, nextElement, container, callback) {
    !ReactElement.isValidElement(nextElement) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactDOM.render(): Invalid component element.%s', typeof nextElement === 'string' ? ' Instead of passing an element string, make sure to instantiate ' + 'it by passing it to React.createElement.' : typeof nextElement === 'function' ? ' Instead of passing a component class, make sure to instantiate ' + 'it by passing it to React.createElement.' :
    // Check if it quacks like an element
    nextElement != null && nextElement.props !== undefined ? ' This may be caused by unintentionally loading two independent ' + 'copies of React.' : '') : invariant(false) : undefined;

    process.env.NODE_ENV !== 'production' ? warning(!container || !container.tagName || container.tagName.toUpperCase() !== 'BODY', 'render(): Rendering components directly into document.body is ' + 'discouraged, since its children are often manipulated by third-party ' + 'scripts and browser extensions. This may lead to subtle ' + 'reconciliation issues. Try rendering into a container element created ' + 'for your app.') : undefined;

    var nextWrappedElement = new ReactElement(TopLevelWrapper, null, null, null, null, null, nextElement);

    var prevComponent = instancesByReactRootID[getReactRootID(container)];

    if (prevComponent) {
      var prevWrappedElement = prevComponent._currentElement;
      var prevElement = prevWrappedElement.props;
      if (shouldUpdateReactComponent(prevElement, nextElement)) {
        var publicInst = prevComponent._renderedComponent.getPublicInstance();
        var updatedCallback = callback && function () {
          callback.call(publicInst);
        };
        ReactMount._updateRootComponent(prevComponent, nextWrappedElement, container, updatedCallback);
        return publicInst;
      } else {
        ReactMount.unmountComponentAtNode(container);
      }
    }

    var reactRootElement = getReactRootElementInContainer(container);
    var containerHasReactMarkup = reactRootElement && !!internalGetID(reactRootElement);
    var containerHasNonRootReactChild = hasNonRootReactChild(container);

    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(!containerHasNonRootReactChild, 'render(...): Replacing React-rendered children with a new root ' + 'component. If you intended to update the children of this node, ' + 'you should instead have the existing children update their state ' + 'and render the new components instead of calling ReactDOM.render.') : undefined;

      if (!containerHasReactMarkup || reactRootElement.nextSibling) {
        var rootElementSibling = reactRootElement;
        while (rootElementSibling) {
          if (internalGetID(rootElementSibling)) {
            process.env.NODE_ENV !== 'production' ? warning(false, 'render(): Target node has markup rendered by React, but there ' + 'are unrelated nodes as well. This is most commonly caused by ' + 'white-space inserted around server-rendered markup.') : undefined;
            break;
          }
          rootElementSibling = rootElementSibling.nextSibling;
        }
      }
    }

    var shouldReuseMarkup = containerHasReactMarkup && !prevComponent && !containerHasNonRootReactChild;
    var component = ReactMount._renderNewRootComponent(nextWrappedElement, container, shouldReuseMarkup, parentComponent != null ? parentComponent._reactInternalInstance._processChildContext(parentComponent._reactInternalInstance._context) : emptyObject)._renderedComponent.getPublicInstance();
    if (callback) {
      callback.call(component);
    }
    return component;
  },

  /**
   * Renders a React component into the DOM in the supplied `container`.
   *
   * If the React component was previously rendered into `container`, this will
   * perform an update on it and only mutate the DOM as necessary to reflect the
   * latest React component.
   *
   * @param {ReactElement} nextElement Component element to render.
   * @param {DOMElement} container DOM element to render into.
   * @param {?function} callback function triggered on completion
   * @return {ReactComponent} Component instance rendered in `container`.
   */
  render: function (nextElement, container, callback) {
    return ReactMount._renderSubtreeIntoContainer(null, nextElement, container, callback);
  },

  /**
   * Registers a container node into which React components will be rendered.
   * This also creates the "reactRoot" ID that will be assigned to the element
   * rendered within.
   *
   * @param {DOMElement} container DOM element to register as a container.
   * @return {string} The "reactRoot" ID of elements rendered within.
   */
  registerContainer: function (container) {
    var reactRootID = getReactRootID(container);
    if (reactRootID) {
      // If one exists, make sure it is a valid "reactRoot" ID.
      reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(reactRootID);
    }
    if (!reactRootID) {
      // No valid "reactRoot" ID found, create one.
      reactRootID = ReactInstanceHandles.createReactRootID();
    }
    containersByReactRootID[reactRootID] = container;
    return reactRootID;
  },

  /**
   * Unmounts and destroys the React component rendered in the `container`.
   *
   * @param {DOMElement} container DOM element containing a React component.
   * @return {boolean} True if a component was found in and unmounted from
   *                   `container`
   */
  unmountComponentAtNode: function (container) {
    // Various parts of our code (such as ReactCompositeComponent's
    // _renderValidatedComponent) assume that calls to render aren't nested;
    // verify that that's the case. (Strictly speaking, unmounting won't cause a
    // render but we still don't expect to be in a render call here.)
    process.env.NODE_ENV !== 'production' ? warning(ReactCurrentOwner.current == null, 'unmountComponentAtNode(): Render methods should be a pure function ' + 'of props and state; triggering nested component updates from render ' + 'is not allowed. If necessary, trigger nested updates in ' + 'componentDidUpdate. Check the render method of %s.', ReactCurrentOwner.current && ReactCurrentOwner.current.getName() || 'ReactCompositeComponent') : undefined;

    !(container && (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE || container.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'unmountComponentAtNode(...): Target container is not a DOM element.') : invariant(false) : undefined;

    var reactRootID = getReactRootID(container);
    var component = instancesByReactRootID[reactRootID];
    if (!component) {
      // Check if the node being unmounted was rendered by React, but isn't a
      // root node.
      var containerHasNonRootReactChild = hasNonRootReactChild(container);

      // Check if the container itself is a React root node.
      var containerID = internalGetID(container);
      var isContainerReactRoot = containerID && containerID === ReactInstanceHandles.getReactRootIDFromNodeID(containerID);

      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(!containerHasNonRootReactChild, 'unmountComponentAtNode(): The node you\'re attempting to unmount ' + 'was rendered by React and is not a top-level container. %s', isContainerReactRoot ? 'You may have accidentally passed in a React root node instead ' + 'of its container.' : 'Instead, have the parent component update its state and ' + 'rerender in order to remove this component.') : undefined;
      }

      return false;
    }
    ReactUpdates.batchedUpdates(unmountComponentFromNode, component, container);
    delete instancesByReactRootID[reactRootID];
    delete containersByReactRootID[reactRootID];
    if (process.env.NODE_ENV !== 'production') {
      delete rootElementsByReactRootID[reactRootID];
    }
    return true;
  },

  /**
   * Finds the container DOM element that contains React component to which the
   * supplied DOM `id` belongs.
   *
   * @param {string} id The ID of an element rendered by a React component.
   * @return {?DOMElement} DOM element that contains the `id`.
   */
  findReactContainerForID: function (id) {
    var reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(id);
    var container = containersByReactRootID[reactRootID];

    if (process.env.NODE_ENV !== 'production') {
      var rootElement = rootElementsByReactRootID[reactRootID];
      if (rootElement && rootElement.parentNode !== container) {
        process.env.NODE_ENV !== 'production' ? warning(
        // Call internalGetID here because getID calls isValid which calls
        // findReactContainerForID (this function).
        internalGetID(rootElement) === reactRootID, 'ReactMount: Root element ID differed from reactRootID.') : undefined;
        var containerChild = container.firstChild;
        if (containerChild && reactRootID === internalGetID(containerChild)) {
          // If the container has a new child with the same ID as the old
          // root element, then rootElementsByReactRootID[reactRootID] is
          // just stale and needs to be updated. The case that deserves a
          // warning is when the container is empty.
          rootElementsByReactRootID[reactRootID] = containerChild;
        } else {
          process.env.NODE_ENV !== 'production' ? warning(false, 'ReactMount: Root element has been removed from its original ' + 'container. New container: %s', rootElement.parentNode) : undefined;
        }
      }
    }

    return container;
  },

  /**
   * Finds an element rendered by React with the supplied ID.
   *
   * @param {string} id ID of a DOM node in the React component.
   * @return {DOMElement} Root DOM node of the React component.
   */
  findReactNodeByID: function (id) {
    var reactRoot = ReactMount.findReactContainerForID(id);
    return ReactMount.findComponentRoot(reactRoot, id);
  },

  /**
   * Traverses up the ancestors of the supplied node to find a node that is a
   * DOM representation of a React component rendered by this copy of React.
   *
   * @param {*} node
   * @return {?DOMEventTarget}
   * @internal
   */
  getFirstReactDOM: function (node) {
    return findFirstReactDOMImpl(node);
  },

  /**
   * Finds a node with the supplied `targetID` inside of the supplied
   * `ancestorNode`.  Exploits the ID naming scheme to perform the search
   * quickly.
   *
   * @param {DOMEventTarget} ancestorNode Search from this root.
   * @pararm {string} targetID ID of the DOM representation of the component.
   * @return {DOMEventTarget} DOM node with the supplied `targetID`.
   * @internal
   */
  findComponentRoot: function (ancestorNode, targetID) {
    var firstChildren = findComponentRootReusableArray;
    var childIndex = 0;

    var deepestAncestor = findDeepestCachedAncestor(targetID) || ancestorNode;

    if (process.env.NODE_ENV !== 'production') {
      // This will throw on the next line; give an early warning
      process.env.NODE_ENV !== 'production' ? warning(deepestAncestor != null, 'React can\'t find the root component node for data-reactid value ' + '`%s`. If you\'re seeing this message, it probably means that ' + 'you\'ve loaded two copies of React on the page. At this time, only ' + 'a single copy of React can be loaded at a time.', targetID) : undefined;
    }

    firstChildren[0] = deepestAncestor.firstChild;
    firstChildren.length = 1;

    while (childIndex < firstChildren.length) {
      var child = firstChildren[childIndex++];
      var targetChild;

      while (child) {
        var childID = ReactMount.getID(child);
        if (childID) {
          // Even if we find the node we're looking for, we finish looping
          // through its siblings to ensure they're cached so that we don't have
          // to revisit this node again. Otherwise, we make n^2 calls to getID
          // when visiting the many children of a single node in order.

          if (targetID === childID) {
            targetChild = child;
          } else if (ReactInstanceHandles.isAncestorIDOf(childID, targetID)) {
            // If we find a child whose ID is an ancestor of the given ID,
            // then we can be sure that we only want to search the subtree
            // rooted at this child, so we can throw out the rest of the
            // search state.
            firstChildren.length = childIndex = 0;
            firstChildren.push(child.firstChild);
          }
        } else {
          // If this child had no ID, then there's a chance that it was
          // injected automatically by the browser, as when a `<table>`
          // element sprouts an extra `<tbody>` child as a side effect of
          // `.innerHTML` parsing. Optimistically continue down this
          // branch, but not before examining the other siblings.
          firstChildren.push(child.firstChild);
        }

        child = child.nextSibling;
      }

      if (targetChild) {
        // Emptying firstChildren/findComponentRootReusableArray is
        // not necessary for correctness, but it helps the GC reclaim
        // any nodes that were left at the end of the search.
        firstChildren.length = 0;

        return targetChild;
      }
    }

    firstChildren.length = 0;

    !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'findComponentRoot(..., %s): Unable to find element. This probably ' + 'means the DOM was unexpectedly mutated (e.g., by the browser), ' + 'usually due to forgetting a <tbody> when using tables, nesting tags ' + 'like <form>, <p>, or <a>, or using non-SVG elements in an <svg> ' + 'parent. ' + 'Try inspecting the child nodes of the element with React ID `%s`.', targetID, ReactMount.getID(ancestorNode)) : invariant(false) : undefined;
  },

  _mountImageIntoNode: function (markup, container, shouldReuseMarkup, transaction) {
    !(container && (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE || container.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'mountComponentIntoNode(...): Target container is not valid.') : invariant(false) : undefined;

    if (shouldReuseMarkup) {
      var rootElement = getReactRootElementInContainer(container);
      if (ReactMarkupChecksum.canReuseMarkup(markup, rootElement)) {
        return;
      } else {
        var checksum = rootElement.getAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);
        rootElement.removeAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);

        var rootMarkup = rootElement.outerHTML;
        rootElement.setAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME, checksum);

        var normalizedMarkup = markup;
        if (process.env.NODE_ENV !== 'production') {
          // because rootMarkup is retrieved from the DOM, various normalizations
          // will have occurred which will not be present in `markup`. Here,
          // insert markup into a <div> or <iframe> depending on the container
          // type to perform the same normalizations before comparing.
          var normalizer;
          if (container.nodeType === ELEMENT_NODE_TYPE) {
            normalizer = document.createElement('div');
            normalizer.innerHTML = markup;
            normalizedMarkup = normalizer.innerHTML;
          } else {
            normalizer = document.createElement('iframe');
            document.body.appendChild(normalizer);
            normalizer.contentDocument.write(markup);
            normalizedMarkup = normalizer.contentDocument.documentElement.outerHTML;
            document.body.removeChild(normalizer);
          }
        }

        var diffIndex = firstDifferenceIndex(normalizedMarkup, rootMarkup);
        var difference = ' (client) ' + normalizedMarkup.substring(diffIndex - 20, diffIndex + 20) + '\n (server) ' + rootMarkup.substring(diffIndex - 20, diffIndex + 20);

        !(container.nodeType !== DOC_NODE_TYPE) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'You\'re trying to render a component to the document using ' + 'server rendering but the checksum was invalid. This usually ' + 'means you rendered a different component type or props on ' + 'the client from the one on the server, or your render() ' + 'methods are impure. React cannot handle this case due to ' + 'cross-browser quirks by rendering at the document root. You ' + 'should look for environment dependent code in your components ' + 'and ensure the props are the same client and server side:\n%s', difference) : invariant(false) : undefined;

        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_ENV !== 'production' ? warning(false, 'React attempted to reuse markup in a container but the ' + 'checksum was invalid. This generally means that you are ' + 'using server rendering and the markup generated on the ' + 'server was not what the client was expecting. React injected ' + 'new markup to compensate which works but you have lost many ' + 'of the benefits of server rendering. Instead, figure out ' + 'why the markup being generated is different on the client ' + 'or server:\n%s', difference) : undefined;
        }
      }
    }

    !(container.nodeType !== DOC_NODE_TYPE) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'You\'re trying to render a component to the document but ' + 'you didn\'t use server rendering. We can\'t do this ' + 'without using server rendering due to cross-browser quirks. ' + 'See ReactDOMServer.renderToString() for server rendering.') : invariant(false) : undefined;

    if (transaction.useCreateElement) {
      while (container.lastChild) {
        container.removeChild(container.lastChild);
      }
      container.appendChild(markup);
    } else {
      setInnerHTML(container, markup);
    }
  },

  ownerDocumentContextKey: ownerDocumentContextKey,

  /**
   * React ID utilities.
   */

  getReactRootID: getReactRootID,

  getID: getID,

  setID: setID,

  getNode: getNode,

  getNodeFromInstance: getNodeFromInstance,

  isValid: isValid,

  purgeID: purgeID
};

ReactPerf.measureMethods(ReactMount, 'ReactMount', {
  _renderNewRootComponent: '_renderNewRootComponent',
  _mountImageIntoNode: '_mountImageIntoNode'
});

module.exports = ReactMount;
},{"./DOMProperty":"/home/ec2-user/ksana2015/node_modules/react/lib/DOMProperty.js","./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactBrowserEventEmitter":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactBrowserEventEmitter.js","./ReactCurrentOwner":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactCurrentOwner.js","./ReactDOMFeatureFlags":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMFeatureFlags.js","./ReactElement":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js","./ReactEmptyComponentRegistry":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactEmptyComponentRegistry.js","./ReactInstanceHandles":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInstanceHandles.js","./ReactInstanceMap":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInstanceMap.js","./ReactMarkupChecksum":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMarkupChecksum.js","./ReactPerf":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPerf.js","./ReactReconciler":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactReconciler.js","./ReactUpdateQueue":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdateQueue.js","./ReactUpdates":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdates.js","./instantiateReactComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/instantiateReactComponent.js","./setInnerHTML":"/home/ec2-user/ksana2015/node_modules/react/lib/setInnerHTML.js","./shouldUpdateReactComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/shouldUpdateReactComponent.js","./validateDOMNesting":"/home/ec2-user/ksana2015/node_modules/react/lib/validateDOMNesting.js","fbjs/lib/containsNode":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/containsNode.js","fbjs/lib/emptyObject":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyObject.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMultiChild.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactMultiChild
 * @typechecks static-only
 */

'use strict';

var ReactComponentEnvironment = require('./ReactComponentEnvironment');
var ReactMultiChildUpdateTypes = require('./ReactMultiChildUpdateTypes');

var ReactCurrentOwner = require('./ReactCurrentOwner');
var ReactReconciler = require('./ReactReconciler');
var ReactChildReconciler = require('./ReactChildReconciler');

var flattenChildren = require('./flattenChildren');

/**
 * Updating children of a component may trigger recursive updates. The depth is
 * used to batch recursive updates to render markup more efficiently.
 *
 * @type {number}
 * @private
 */
var updateDepth = 0;

/**
 * Queue of update configuration objects.
 *
 * Each object has a `type` property that is in `ReactMultiChildUpdateTypes`.
 *
 * @type {array<object>}
 * @private
 */
var updateQueue = [];

/**
 * Queue of markup to be rendered.
 *
 * @type {array<string>}
 * @private
 */
var markupQueue = [];

/**
 * Enqueues markup to be rendered and inserted at a supplied index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {string} markup Markup that renders into an element.
 * @param {number} toIndex Destination index.
 * @private
 */
function enqueueInsertMarkup(parentID, markup, toIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.INSERT_MARKUP,
    markupIndex: markupQueue.push(markup) - 1,
    content: null,
    fromIndex: null,
    toIndex: toIndex
  });
}

/**
 * Enqueues moving an existing element to another index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {number} fromIndex Source index of the existing element.
 * @param {number} toIndex Destination index of the element.
 * @private
 */
function enqueueMove(parentID, fromIndex, toIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.MOVE_EXISTING,
    markupIndex: null,
    content: null,
    fromIndex: fromIndex,
    toIndex: toIndex
  });
}

/**
 * Enqueues removing an element at an index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {number} fromIndex Index of the element to remove.
 * @private
 */
function enqueueRemove(parentID, fromIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.REMOVE_NODE,
    markupIndex: null,
    content: null,
    fromIndex: fromIndex,
    toIndex: null
  });
}

/**
 * Enqueues setting the markup of a node.
 *
 * @param {string} parentID ID of the parent component.
 * @param {string} markup Markup that renders into an element.
 * @private
 */
function enqueueSetMarkup(parentID, markup) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.SET_MARKUP,
    markupIndex: null,
    content: markup,
    fromIndex: null,
    toIndex: null
  });
}

/**
 * Enqueues setting the text content.
 *
 * @param {string} parentID ID of the parent component.
 * @param {string} textContent Text content to set.
 * @private
 */
function enqueueTextContent(parentID, textContent) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.TEXT_CONTENT,
    markupIndex: null,
    content: textContent,
    fromIndex: null,
    toIndex: null
  });
}

/**
 * Processes any enqueued updates.
 *
 * @private
 */
function processQueue() {
  if (updateQueue.length) {
    ReactComponentEnvironment.processChildrenUpdates(updateQueue, markupQueue);
    clearQueue();
  }
}

/**
 * Clears any enqueued updates.
 *
 * @private
 */
function clearQueue() {
  updateQueue.length = 0;
  markupQueue.length = 0;
}

/**
 * ReactMultiChild are capable of reconciling multiple children.
 *
 * @class ReactMultiChild
 * @internal
 */
var ReactMultiChild = {

  /**
   * Provides common functionality for components that must reconcile multiple
   * children. This is used by `ReactDOMComponent` to mount, update, and
   * unmount child components.
   *
   * @lends {ReactMultiChild.prototype}
   */
  Mixin: {

    _reconcilerInstantiateChildren: function (nestedChildren, transaction, context) {
      if (process.env.NODE_ENV !== 'production') {
        if (this._currentElement) {
          try {
            ReactCurrentOwner.current = this._currentElement._owner;
            return ReactChildReconciler.instantiateChildren(nestedChildren, transaction, context);
          } finally {
            ReactCurrentOwner.current = null;
          }
        }
      }
      return ReactChildReconciler.instantiateChildren(nestedChildren, transaction, context);
    },

    _reconcilerUpdateChildren: function (prevChildren, nextNestedChildrenElements, transaction, context) {
      var nextChildren;
      if (process.env.NODE_ENV !== 'production') {
        if (this._currentElement) {
          try {
            ReactCurrentOwner.current = this._currentElement._owner;
            nextChildren = flattenChildren(nextNestedChildrenElements);
          } finally {
            ReactCurrentOwner.current = null;
          }
          return ReactChildReconciler.updateChildren(prevChildren, nextChildren, transaction, context);
        }
      }
      nextChildren = flattenChildren(nextNestedChildrenElements);
      return ReactChildReconciler.updateChildren(prevChildren, nextChildren, transaction, context);
    },

    /**
     * Generates a "mount image" for each of the supplied children. In the case
     * of `ReactDOMComponent`, a mount image is a string of markup.
     *
     * @param {?object} nestedChildren Nested child maps.
     * @return {array} An array of mounted representations.
     * @internal
     */
    mountChildren: function (nestedChildren, transaction, context) {
      var children = this._reconcilerInstantiateChildren(nestedChildren, transaction, context);
      this._renderedChildren = children;
      var mountImages = [];
      var index = 0;
      for (var name in children) {
        if (children.hasOwnProperty(name)) {
          var child = children[name];
          // Inlined for performance, see `ReactInstanceHandles.createReactID`.
          var rootID = this._rootNodeID + name;
          var mountImage = ReactReconciler.mountComponent(child, rootID, transaction, context);
          child._mountIndex = index++;
          mountImages.push(mountImage);
        }
      }
      return mountImages;
    },

    /**
     * Replaces any rendered children with a text content string.
     *
     * @param {string} nextContent String of content.
     * @internal
     */
    updateTextContent: function (nextContent) {
      updateDepth++;
      var errorThrown = true;
      try {
        var prevChildren = this._renderedChildren;
        // Remove any rendered children.
        ReactChildReconciler.unmountChildren(prevChildren);
        // TODO: The setTextContent operation should be enough
        for (var name in prevChildren) {
          if (prevChildren.hasOwnProperty(name)) {
            this._unmountChild(prevChildren[name]);
          }
        }
        // Set new text content.
        this.setTextContent(nextContent);
        errorThrown = false;
      } finally {
        updateDepth--;
        if (!updateDepth) {
          if (errorThrown) {
            clearQueue();
          } else {
            processQueue();
          }
        }
      }
    },

    /**
     * Replaces any rendered children with a markup string.
     *
     * @param {string} nextMarkup String of markup.
     * @internal
     */
    updateMarkup: function (nextMarkup) {
      updateDepth++;
      var errorThrown = true;
      try {
        var prevChildren = this._renderedChildren;
        // Remove any rendered children.
        ReactChildReconciler.unmountChildren(prevChildren);
        for (var name in prevChildren) {
          if (prevChildren.hasOwnProperty(name)) {
            this._unmountChildByName(prevChildren[name], name);
          }
        }
        this.setMarkup(nextMarkup);
        errorThrown = false;
      } finally {
        updateDepth--;
        if (!updateDepth) {
          if (errorThrown) {
            clearQueue();
          } else {
            processQueue();
          }
        }
      }
    },

    /**
     * Updates the rendered children with new children.
     *
     * @param {?object} nextNestedChildrenElements Nested child element maps.
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
    updateChildren: function (nextNestedChildrenElements, transaction, context) {
      updateDepth++;
      var errorThrown = true;
      try {
        this._updateChildren(nextNestedChildrenElements, transaction, context);
        errorThrown = false;
      } finally {
        updateDepth--;
        if (!updateDepth) {
          if (errorThrown) {
            clearQueue();
          } else {
            processQueue();
          }
        }
      }
    },

    /**
     * Improve performance by isolating this hot code path from the try/catch
     * block in `updateChildren`.
     *
     * @param {?object} nextNestedChildrenElements Nested child element maps.
     * @param {ReactReconcileTransaction} transaction
     * @final
     * @protected
     */
    _updateChildren: function (nextNestedChildrenElements, transaction, context) {
      var prevChildren = this._renderedChildren;
      var nextChildren = this._reconcilerUpdateChildren(prevChildren, nextNestedChildrenElements, transaction, context);
      this._renderedChildren = nextChildren;
      if (!nextChildren && !prevChildren) {
        return;
      }
      var name;
      // `nextIndex` will increment for each child in `nextChildren`, but
      // `lastIndex` will be the last index visited in `prevChildren`.
      var lastIndex = 0;
      var nextIndex = 0;
      for (name in nextChildren) {
        if (!nextChildren.hasOwnProperty(name)) {
          continue;
        }
        var prevChild = prevChildren && prevChildren[name];
        var nextChild = nextChildren[name];
        if (prevChild === nextChild) {
          this.moveChild(prevChild, nextIndex, lastIndex);
          lastIndex = Math.max(prevChild._mountIndex, lastIndex);
          prevChild._mountIndex = nextIndex;
        } else {
          if (prevChild) {
            // Update `lastIndex` before `_mountIndex` gets unset by unmounting.
            lastIndex = Math.max(prevChild._mountIndex, lastIndex);
            this._unmountChild(prevChild);
          }
          // The child must be instantiated before it's mounted.
          this._mountChildByNameAtIndex(nextChild, name, nextIndex, transaction, context);
        }
        nextIndex++;
      }
      // Remove children that are no longer present.
      for (name in prevChildren) {
        if (prevChildren.hasOwnProperty(name) && !(nextChildren && nextChildren.hasOwnProperty(name))) {
          this._unmountChild(prevChildren[name]);
        }
      }
    },

    /**
     * Unmounts all rendered children. This should be used to clean up children
     * when this component is unmounted.
     *
     * @internal
     */
    unmountChildren: function () {
      var renderedChildren = this._renderedChildren;
      ReactChildReconciler.unmountChildren(renderedChildren);
      this._renderedChildren = null;
    },

    /**
     * Moves a child component to the supplied index.
     *
     * @param {ReactComponent} child Component to move.
     * @param {number} toIndex Destination index of the element.
     * @param {number} lastIndex Last index visited of the siblings of `child`.
     * @protected
     */
    moveChild: function (child, toIndex, lastIndex) {
      // If the index of `child` is less than `lastIndex`, then it needs to
      // be moved. Otherwise, we do not need to move it because a child will be
      // inserted or moved before `child`.
      if (child._mountIndex < lastIndex) {
        enqueueMove(this._rootNodeID, child._mountIndex, toIndex);
      }
    },

    /**
     * Creates a child component.
     *
     * @param {ReactComponent} child Component to create.
     * @param {string} mountImage Markup to insert.
     * @protected
     */
    createChild: function (child, mountImage) {
      enqueueInsertMarkup(this._rootNodeID, mountImage, child._mountIndex);
    },

    /**
     * Removes a child component.
     *
     * @param {ReactComponent} child Child to remove.
     * @protected
     */
    removeChild: function (child) {
      enqueueRemove(this._rootNodeID, child._mountIndex);
    },

    /**
     * Sets this text content string.
     *
     * @param {string} textContent Text content to set.
     * @protected
     */
    setTextContent: function (textContent) {
      enqueueTextContent(this._rootNodeID, textContent);
    },

    /**
     * Sets this markup string.
     *
     * @param {string} markup Markup to set.
     * @protected
     */
    setMarkup: function (markup) {
      enqueueSetMarkup(this._rootNodeID, markup);
    },

    /**
     * Mounts a child with the supplied name.
     *
     * NOTE: This is part of `updateChildren` and is here for readability.
     *
     * @param {ReactComponent} child Component to mount.
     * @param {string} name Name of the child.
     * @param {number} index Index at which to insert the child.
     * @param {ReactReconcileTransaction} transaction
     * @private
     */
    _mountChildByNameAtIndex: function (child, name, index, transaction, context) {
      // Inlined for performance, see `ReactInstanceHandles.createReactID`.
      var rootID = this._rootNodeID + name;
      var mountImage = ReactReconciler.mountComponent(child, rootID, transaction, context);
      child._mountIndex = index;
      this.createChild(child, mountImage);
    },

    /**
     * Unmounts a rendered child.
     *
     * NOTE: This is part of `updateChildren` and is here for readability.
     *
     * @param {ReactComponent} child Component to unmount.
     * @private
     */
    _unmountChild: function (child) {
      this.removeChild(child);
      child._mountIndex = null;
    }

  }

};

module.exports = ReactMultiChild;
},{"./ReactChildReconciler":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactChildReconciler.js","./ReactComponentEnvironment":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactComponentEnvironment.js","./ReactCurrentOwner":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactCurrentOwner.js","./ReactMultiChildUpdateTypes":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMultiChildUpdateTypes.js","./ReactReconciler":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactReconciler.js","./flattenChildren":"/home/ec2-user/ksana2015/node_modules/react/lib/flattenChildren.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMultiChildUpdateTypes.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactMultiChildUpdateTypes
 */

'use strict';

var keyMirror = require('fbjs/lib/keyMirror');

/**
 * When a component's children are updated, a series of update configuration
 * objects are created in order to batch and serialize the required changes.
 *
 * Enumerates all the possible types of update configurations.
 *
 * @internal
 */
var ReactMultiChildUpdateTypes = keyMirror({
  INSERT_MARKUP: null,
  MOVE_EXISTING: null,
  REMOVE_NODE: null,
  SET_MARKUP: null,
  TEXT_CONTENT: null
});

module.exports = ReactMultiChildUpdateTypes;
},{"fbjs/lib/keyMirror":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyMirror.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactNativeComponent.js":[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactNativeComponent
 */

'use strict';

var assign = require('./Object.assign');
var invariant = require('fbjs/lib/invariant');

var autoGenerateWrapperClass = null;
var genericComponentClass = null;
// This registry keeps track of wrapper classes around native tags.
var tagToComponentClass = {};
var textComponentClass = null;

var ReactNativeComponentInjection = {
  // This accepts a class that receives the tag string. This is a catch all
  // that can render any kind of tag.
  injectGenericComponentClass: function (componentClass) {
    genericComponentClass = componentClass;
  },
  // This accepts a text component class that takes the text string to be
  // rendered as props.
  injectTextComponentClass: function (componentClass) {
    textComponentClass = componentClass;
  },
  // This accepts a keyed object with classes as values. Each key represents a
  // tag. That particular tag will use this class instead of the generic one.
  injectComponentClasses: function (componentClasses) {
    assign(tagToComponentClass, componentClasses);
  }
};

/**
 * Get a composite component wrapper class for a specific tag.
 *
 * @param {ReactElement} element The tag for which to get the class.
 * @return {function} The React class constructor function.
 */
function getComponentClassForElement(element) {
  if (typeof element.type === 'function') {
    return element.type;
  }
  var tag = element.type;
  var componentClass = tagToComponentClass[tag];
  if (componentClass == null) {
    tagToComponentClass[tag] = componentClass = autoGenerateWrapperClass(tag);
  }
  return componentClass;
}

/**
 * Get a native internal component class for a specific tag.
 *
 * @param {ReactElement} element The element to create.
 * @return {function} The internal class constructor function.
 */
function createInternalComponent(element) {
  !genericComponentClass ? process.env.NODE_ENV !== 'production' ? invariant(false, 'There is no registered component for the tag %s', element.type) : invariant(false) : undefined;
  return new genericComponentClass(element.type, element.props);
}

/**
 * @param {ReactText} text
 * @return {ReactComponent}
 */
function createInstanceForText(text) {
  return new textComponentClass(text);
}

/**
 * @param {ReactComponent} component
 * @return {boolean}
 */
function isTextComponent(component) {
  return component instanceof textComponentClass;
}

var ReactNativeComponent = {
  getComponentClassForElement: getComponentClassForElement,
  createInternalComponent: createInternalComponent,
  createInstanceForText: createInstanceForText,
  isTextComponent: isTextComponent,
  injection: ReactNativeComponentInjection
};

module.exports = ReactNativeComponent;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactNoopUpdateQueue.js":[function(require,module,exports){
/**
 * Copyright 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactNoopUpdateQueue
 */

'use strict';

var warning = require('fbjs/lib/warning');

function warnTDZ(publicInstance, callerName) {
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_ENV !== 'production' ? warning(false, '%s(...): Can only update a mounted or mounting component. ' + 'This usually means you called %s() on an unmounted component. ' + 'This is a no-op. Please check the code for the %s component.', callerName, callerName, publicInstance.constructor && publicInstance.constructor.displayName || '') : undefined;
  }
}

/**
 * This is the abstract API for an update queue.
 */
var ReactNoopUpdateQueue = {

  /**
   * Checks whether or not this composite component is mounted.
   * @param {ReactClass} publicInstance The instance we want to test.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function (publicInstance) {
    return false;
  },

  /**
   * Enqueue a callback that will be executed after all the pending updates
   * have processed.
   *
   * @param {ReactClass} publicInstance The instance to use as `this` context.
   * @param {?function} callback Called after state is updated.
   * @internal
   */
  enqueueCallback: function (publicInstance, callback) {},

  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @internal
   */
  enqueueForceUpdate: function (publicInstance) {
    warnTDZ(publicInstance, 'forceUpdate');
  },

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} completeState Next state.
   * @internal
   */
  enqueueReplaceState: function (publicInstance, completeState) {
    warnTDZ(publicInstance, 'replaceState');
  },

  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialState Next partial state to be merged with state.
   * @internal
   */
  enqueueSetState: function (publicInstance, partialState) {
    warnTDZ(publicInstance, 'setState');
  },

  /**
   * Sets a subset of the props.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialProps Subset of the next props.
   * @internal
   */
  enqueueSetProps: function (publicInstance, partialProps) {
    warnTDZ(publicInstance, 'setProps');
  },

  /**
   * Replaces all of the props.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} props New props.
   * @internal
   */
  enqueueReplaceProps: function (publicInstance, props) {
    warnTDZ(publicInstance, 'replaceProps');
  }

};

module.exports = ReactNoopUpdateQueue;
},{"fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactOwner.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactOwner
 */

'use strict';

var invariant = require('fbjs/lib/invariant');

/**
 * ReactOwners are capable of storing references to owned components.
 *
 * All components are capable of //being// referenced by owner components, but
 * only ReactOwner components are capable of //referencing// owned components.
 * The named reference is known as a "ref".
 *
 * Refs are available when mounted and updated during reconciliation.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return (
 *         <div onClick={this.handleClick}>
 *           <CustomComponent ref="custom" />
 *         </div>
 *       );
 *     },
 *     handleClick: function() {
 *       this.refs.custom.handleClick();
 *     },
 *     componentDidMount: function() {
 *       this.refs.custom.initialize();
 *     }
 *   });
 *
 * Refs should rarely be used. When refs are used, they should only be done to
 * control data that is not handled by React's data flow.
 *
 * @class ReactOwner
 */
var ReactOwner = {

  /**
   * @param {?object} object
   * @return {boolean} True if `object` is a valid owner.
   * @final
   */
  isValidOwner: function (object) {
    return !!(object && typeof object.attachRef === 'function' && typeof object.detachRef === 'function');
  },

  /**
   * Adds a component by ref to an owner component.
   *
   * @param {ReactComponent} component Component to reference.
   * @param {string} ref Name by which to refer to the component.
   * @param {ReactOwner} owner Component on which to record the ref.
   * @final
   * @internal
   */
  addComponentAsRefTo: function (component, ref, owner) {
    !ReactOwner.isValidOwner(owner) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'addComponentAsRefTo(...): Only a ReactOwner can have refs. You might ' + 'be adding a ref to a component that was not created inside a component\'s ' + '`render` method, or you have multiple copies of React loaded ' + '(details: https://fb.me/react-refs-must-have-owner).') : invariant(false) : undefined;
    owner.attachRef(ref, component);
  },

  /**
   * Removes a component by ref from an owner component.
   *
   * @param {ReactComponent} component Component to dereference.
   * @param {string} ref Name of the ref to remove.
   * @param {ReactOwner} owner Component on which the ref is recorded.
   * @final
   * @internal
   */
  removeComponentAsRefFrom: function (component, ref, owner) {
    !ReactOwner.isValidOwner(owner) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'removeComponentAsRefFrom(...): Only a ReactOwner can have refs. You might ' + 'be removing a ref to a component that was not created inside a component\'s ' + '`render` method, or you have multiple copies of React loaded ' + '(details: https://fb.me/react-refs-must-have-owner).') : invariant(false) : undefined;
    // Check that `component` is still the current ref because we do not want to
    // detach the ref if another component stole it.
    if (owner.getPublicInstance().refs[ref] === component.getPublicInstance()) {
      owner.detachRef(ref);
    }
  }

};

module.exports = ReactOwner;
},{"fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPerf.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPerf
 * @typechecks static-only
 */

'use strict';

/**
 * ReactPerf is a general AOP system designed to measure performance. This
 * module only has the hooks: see ReactDefaultPerf for the analysis tool.
 */
var ReactPerf = {
  /**
   * Boolean to enable/disable measurement. Set to false by default to prevent
   * accidental logging and perf loss.
   */
  enableMeasure: false,

  /**
   * Holds onto the measure function in use. By default, don't measure
   * anything, but we'll override this if we inject a measure function.
   */
  storedMeasure: _noMeasure,

  /**
   * @param {object} object
   * @param {string} objectName
   * @param {object<string>} methodNames
   */
  measureMethods: function (object, objectName, methodNames) {
    if (process.env.NODE_ENV !== 'production') {
      for (var key in methodNames) {
        if (!methodNames.hasOwnProperty(key)) {
          continue;
        }
        object[key] = ReactPerf.measure(objectName, methodNames[key], object[key]);
      }
    }
  },

  /**
   * Use this to wrap methods you want to measure. Zero overhead in production.
   *
   * @param {string} objName
   * @param {string} fnName
   * @param {function} func
   * @return {function}
   */
  measure: function (objName, fnName, func) {
    if (process.env.NODE_ENV !== 'production') {
      var measuredFunc = null;
      var wrapper = function () {
        if (ReactPerf.enableMeasure) {
          if (!measuredFunc) {
            measuredFunc = ReactPerf.storedMeasure(objName, fnName, func);
          }
          return measuredFunc.apply(this, arguments);
        }
        return func.apply(this, arguments);
      };
      wrapper.displayName = objName + '_' + fnName;
      return wrapper;
    }
    return func;
  },

  injection: {
    /**
     * @param {function} measure
     */
    injectMeasure: function (measure) {
      ReactPerf.storedMeasure = measure;
    }
  }
};

/**
 * Simply passes through the measured function, without measuring it.
 *
 * @param {string} objName
 * @param {string} fnName
 * @param {function} func
 * @return {function}
 */
function _noMeasure(objName, fnName, func) {
  return func;
}

module.exports = ReactPerf;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPropTypeLocationNames.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPropTypeLocationNames
 */

'use strict';

var ReactPropTypeLocationNames = {};

if (process.env.NODE_ENV !== 'production') {
  ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context'
  };
}

module.exports = ReactPropTypeLocationNames;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPropTypeLocations.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPropTypeLocations
 */

'use strict';

var keyMirror = require('fbjs/lib/keyMirror');

var ReactPropTypeLocations = keyMirror({
  prop: null,
  context: null,
  childContext: null
});

module.exports = ReactPropTypeLocations;
},{"fbjs/lib/keyMirror":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyMirror.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPropTypes.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPropTypes
 */

'use strict';

var ReactElement = require('./ReactElement');
var ReactPropTypeLocationNames = require('./ReactPropTypeLocationNames');

var emptyFunction = require('fbjs/lib/emptyFunction');
var getIteratorFn = require('./getIteratorFn');

/**
 * Collection of methods that allow declaration and validation of props that are
 * supplied to React components. Example usage:
 *
 *   var Props = require('ReactPropTypes');
 *   var MyArticle = React.createClass({
 *     propTypes: {
 *       // An optional string prop named "description".
 *       description: Props.string,
 *
 *       // A required enum prop named "category".
 *       category: Props.oneOf(['News','Photos']).isRequired,
 *
 *       // A prop named "dialog" that requires an instance of Dialog.
 *       dialog: Props.instanceOf(Dialog).isRequired
 *     },
 *     render: function() { ... }
 *   });
 *
 * A more formal specification of how these methods are used:
 *
 *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
 *   decl := ReactPropTypes.{type}(.isRequired)?
 *
 * Each and every declaration produces a function with the same signature. This
 * allows the creation of custom validation functions. For example:
 *
 *  var MyLink = React.createClass({
 *    propTypes: {
 *      // An optional string or URI prop named "href".
 *      href: function(props, propName, componentName) {
 *        var propValue = props[propName];
 *        if (propValue != null && typeof propValue !== 'string' &&
 *            !(propValue instanceof URI)) {
 *          return new Error(
 *            'Expected a string or an URI for ' + propName + ' in ' +
 *            componentName
 *          );
 *        }
 *      }
 *    },
 *    render: function() {...}
 *  });
 *
 * @internal
 */

var ANONYMOUS = '<<anonymous>>';

var ReactPropTypes = {
  array: createPrimitiveTypeChecker('array'),
  bool: createPrimitiveTypeChecker('boolean'),
  func: createPrimitiveTypeChecker('function'),
  number: createPrimitiveTypeChecker('number'),
  object: createPrimitiveTypeChecker('object'),
  string: createPrimitiveTypeChecker('string'),

  any: createAnyTypeChecker(),
  arrayOf: createArrayOfTypeChecker,
  element: createElementTypeChecker(),
  instanceOf: createInstanceTypeChecker,
  node: createNodeChecker(),
  objectOf: createObjectOfTypeChecker,
  oneOf: createEnumTypeChecker,
  oneOfType: createUnionTypeChecker,
  shape: createShapeTypeChecker
};

function createChainableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location, propFullName) {
    componentName = componentName || ANONYMOUS;
    propFullName = propFullName || propName;
    if (props[propName] == null) {
      var locationName = ReactPropTypeLocationNames[location];
      if (isRequired) {
        return new Error('Required ' + locationName + ' `' + propFullName + '` was not specified in ' + ('`' + componentName + '`.'));
      }
      return null;
    } else {
      return validate(props, propName, componentName, location, propFullName);
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}

function createPrimitiveTypeChecker(expectedType) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== expectedType) {
      var locationName = ReactPropTypeLocationNames[location];
      // `propValue` being instance of, say, date/regexp, pass the 'object'
      // check, but we can offer a more precise error message here rather than
      // 'of type `object`'.
      var preciseType = getPreciseType(propValue);

      return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createAnyTypeChecker() {
  return createChainableTypeChecker(emptyFunction.thatReturns(null));
}

function createArrayOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    if (!Array.isArray(propValue)) {
      var locationName = ReactPropTypeLocationNames[location];
      var propType = getPropType(propValue);
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
    }
    for (var i = 0; i < propValue.length; i++) {
      var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']');
      if (error instanceof Error) {
        return error;
      }
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createElementTypeChecker() {
  function validate(props, propName, componentName, location, propFullName) {
    if (!ReactElement.isValidElement(props[propName])) {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a single ReactElement.'));
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createInstanceTypeChecker(expectedClass) {
  function validate(props, propName, componentName, location, propFullName) {
    if (!(props[propName] instanceof expectedClass)) {
      var locationName = ReactPropTypeLocationNames[location];
      var expectedClassName = expectedClass.name || ANONYMOUS;
      var actualClassName = getClassName(props[propName]);
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createEnumTypeChecker(expectedValues) {
  if (!Array.isArray(expectedValues)) {
    return createChainableTypeChecker(function () {
      return new Error('Invalid argument supplied to oneOf, expected an instance of array.');
    });
  }

  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    for (var i = 0; i < expectedValues.length; i++) {
      if (propValue === expectedValues[i]) {
        return null;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    var valuesString = JSON.stringify(expectedValues);
    return new Error('Invalid ' + locationName + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
  }
  return createChainableTypeChecker(validate);
}

function createObjectOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
    }
    for (var key in propValue) {
      if (propValue.hasOwnProperty(key)) {
        var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key);
        if (error instanceof Error) {
          return error;
        }
      }
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createUnionTypeChecker(arrayOfTypeCheckers) {
  if (!Array.isArray(arrayOfTypeCheckers)) {
    return createChainableTypeChecker(function () {
      return new Error('Invalid argument supplied to oneOfType, expected an instance of array.');
    });
  }

  function validate(props, propName, componentName, location, propFullName) {
    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (checker(props, propName, componentName, location, propFullName) == null) {
        return null;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
  }
  return createChainableTypeChecker(validate);
}

function createNodeChecker() {
  function validate(props, propName, componentName, location, propFullName) {
    if (!isNode(props[propName])) {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createShapeTypeChecker(shapeTypes) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
    }
    for (var key in shapeTypes) {
      var checker = shapeTypes[key];
      if (!checker) {
        continue;
      }
      var error = checker(propValue, key, componentName, location, propFullName + '.' + key);
      if (error) {
        return error;
      }
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function isNode(propValue) {
  switch (typeof propValue) {
    case 'number':
    case 'string':
    case 'undefined':
      return true;
    case 'boolean':
      return !propValue;
    case 'object':
      if (Array.isArray(propValue)) {
        return propValue.every(isNode);
      }
      if (propValue === null || ReactElement.isValidElement(propValue)) {
        return true;
      }

      var iteratorFn = getIteratorFn(propValue);
      if (iteratorFn) {
        var iterator = iteratorFn.call(propValue);
        var step;
        if (iteratorFn !== propValue.entries) {
          while (!(step = iterator.next()).done) {
            if (!isNode(step.value)) {
              return false;
            }
          }
        } else {
          // Iterator will provide entry [k,v] tuples rather than values.
          while (!(step = iterator.next()).done) {
            var entry = step.value;
            if (entry) {
              if (!isNode(entry[1])) {
                return false;
              }
            }
          }
        }
      } else {
        return false;
      }

      return true;
    default:
      return false;
  }
}

// Equivalent of `typeof` but with special handling for array and regexp.
function getPropType(propValue) {
  var propType = typeof propValue;
  if (Array.isArray(propValue)) {
    return 'array';
  }
  if (propValue instanceof RegExp) {
    // Old webkits (at least until Android 4.0) return 'function' rather than
    // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
    // passes PropTypes.object.
    return 'object';
  }
  return propType;
}

// This handles more types than `getPropType`. Only used for error messages.
// See `createPrimitiveTypeChecker`.
function getPreciseType(propValue) {
  var propType = getPropType(propValue);
  if (propType === 'object') {
    if (propValue instanceof Date) {
      return 'date';
    } else if (propValue instanceof RegExp) {
      return 'regexp';
    }
  }
  return propType;
}

// Returns class name of the object, if any.
function getClassName(propValue) {
  if (!propValue.constructor || !propValue.constructor.name) {
    return '<<anonymous>>';
  }
  return propValue.constructor.name;
}

module.exports = ReactPropTypes;
},{"./ReactElement":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js","./ReactPropTypeLocationNames":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPropTypeLocationNames.js","./getIteratorFn":"/home/ec2-user/ksana2015/node_modules/react/lib/getIteratorFn.js","fbjs/lib/emptyFunction":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyFunction.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactReconcileTransaction.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactReconcileTransaction
 * @typechecks static-only
 */

'use strict';

var CallbackQueue = require('./CallbackQueue');
var PooledClass = require('./PooledClass');
var ReactBrowserEventEmitter = require('./ReactBrowserEventEmitter');
var ReactDOMFeatureFlags = require('./ReactDOMFeatureFlags');
var ReactInputSelection = require('./ReactInputSelection');
var Transaction = require('./Transaction');

var assign = require('./Object.assign');

/**
 * Ensures that, when possible, the selection range (currently selected text
 * input) is not disturbed by performing the transaction.
 */
var SELECTION_RESTORATION = {
  /**
   * @return {Selection} Selection information.
   */
  initialize: ReactInputSelection.getSelectionInformation,
  /**
   * @param {Selection} sel Selection information returned from `initialize`.
   */
  close: ReactInputSelection.restoreSelection
};

/**
 * Suppresses events (blur/focus) that could be inadvertently dispatched due to
 * high level DOM manipulations (like temporarily removing a text input from the
 * DOM).
 */
var EVENT_SUPPRESSION = {
  /**
   * @return {boolean} The enabled status of `ReactBrowserEventEmitter` before
   * the reconciliation.
   */
  initialize: function () {
    var currentlyEnabled = ReactBrowserEventEmitter.isEnabled();
    ReactBrowserEventEmitter.setEnabled(false);
    return currentlyEnabled;
  },

  /**
   * @param {boolean} previouslyEnabled Enabled status of
   *   `ReactBrowserEventEmitter` before the reconciliation occurred. `close`
   *   restores the previous value.
   */
  close: function (previouslyEnabled) {
    ReactBrowserEventEmitter.setEnabled(previouslyEnabled);
  }
};

/**
 * Provides a queue for collecting `componentDidMount` and
 * `componentDidUpdate` callbacks during the the transaction.
 */
var ON_DOM_READY_QUEUEING = {
  /**
   * Initializes the internal `onDOMReady` queue.
   */
  initialize: function () {
    this.reactMountReady.reset();
  },

  /**
   * After DOM is flushed, invoke all registered `onDOMReady` callbacks.
   */
  close: function () {
    this.reactMountReady.notifyAll();
  }
};

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
var TRANSACTION_WRAPPERS = [SELECTION_RESTORATION, EVENT_SUPPRESSION, ON_DOM_READY_QUEUEING];

/**
 * Currently:
 * - The order that these are listed in the transaction is critical:
 * - Suppresses events.
 * - Restores selection range.
 *
 * Future:
 * - Restore document/overflow scroll positions that were unintentionally
 *   modified via DOM insertions above the top viewport boundary.
 * - Implement/integrate with customized constraint based layout system and keep
 *   track of which dimensions must be remeasured.
 *
 * @class ReactReconcileTransaction
 */
function ReactReconcileTransaction(forceHTML) {
  this.reinitializeTransaction();
  // Only server-side rendering really needs this option (see
  // `ReactServerRendering`), but server-side uses
  // `ReactServerRenderingTransaction` instead. This option is here so that it's
  // accessible and defaults to false when `ReactDOMComponent` and
  // `ReactTextComponent` checks it in `mountComponent`.`
  this.renderToStaticMarkup = false;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.useCreateElement = !forceHTML && ReactDOMFeatureFlags.useCreateElement;
}

var Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array<object>} List of operation wrap procedures.
   *   TODO: convert to array<TransactionWrapper>
   */
  getTransactionWrappers: function () {
    return TRANSACTION_WRAPPERS;
  },

  /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   */
  getReactMountReady: function () {
    return this.reactMountReady;
  },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be reused.
   */
  destructor: function () {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;
  }
};

assign(ReactReconcileTransaction.prototype, Transaction.Mixin, Mixin);

PooledClass.addPoolingTo(ReactReconcileTransaction);

module.exports = ReactReconcileTransaction;
},{"./CallbackQueue":"/home/ec2-user/ksana2015/node_modules/react/lib/CallbackQueue.js","./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./PooledClass":"/home/ec2-user/ksana2015/node_modules/react/lib/PooledClass.js","./ReactBrowserEventEmitter":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactBrowserEventEmitter.js","./ReactDOMFeatureFlags":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDOMFeatureFlags.js","./ReactInputSelection":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInputSelection.js","./Transaction":"/home/ec2-user/ksana2015/node_modules/react/lib/Transaction.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactReconciler.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactReconciler
 */

'use strict';

var ReactRef = require('./ReactRef');

/**
 * Helper to call ReactRef.attachRefs with this composite component, split out
 * to avoid allocations in the transaction mount-ready queue.
 */
function attachRefs() {
  ReactRef.attachRefs(this, this._currentElement);
}

var ReactReconciler = {

  /**
   * Initializes the component, renders markup, and registers event listeners.
   *
   * @param {ReactComponent} internalInstance
   * @param {string} rootID DOM ID of the root node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {?string} Rendered markup to be inserted into the DOM.
   * @final
   * @internal
   */
  mountComponent: function (internalInstance, rootID, transaction, context) {
    var markup = internalInstance.mountComponent(rootID, transaction, context);
    if (internalInstance._currentElement && internalInstance._currentElement.ref != null) {
      transaction.getReactMountReady().enqueue(attachRefs, internalInstance);
    }
    return markup;
  },

  /**
   * Releases any resources allocated by `mountComponent`.
   *
   * @final
   * @internal
   */
  unmountComponent: function (internalInstance) {
    ReactRef.detachRefs(internalInstance, internalInstance._currentElement);
    internalInstance.unmountComponent();
  },

  /**
   * Update a component using a new element.
   *
   * @param {ReactComponent} internalInstance
   * @param {ReactElement} nextElement
   * @param {ReactReconcileTransaction} transaction
   * @param {object} context
   * @internal
   */
  receiveComponent: function (internalInstance, nextElement, transaction, context) {
    var prevElement = internalInstance._currentElement;

    if (nextElement === prevElement && context === internalInstance._context) {
      // Since elements are immutable after the owner is rendered,
      // we can do a cheap identity compare here to determine if this is a
      // superfluous reconcile. It's possible for state to be mutable but such
      // change should trigger an update of the owner which would recreate
      // the element. We explicitly check for the existence of an owner since
      // it's possible for an element created outside a composite to be
      // deeply mutated and reused.

      // TODO: Bailing out early is just a perf optimization right?
      // TODO: Removing the return statement should affect correctness?
      return;
    }

    var refsChanged = ReactRef.shouldUpdateRefs(prevElement, nextElement);

    if (refsChanged) {
      ReactRef.detachRefs(internalInstance, prevElement);
    }

    internalInstance.receiveComponent(nextElement, transaction, context);

    if (refsChanged && internalInstance._currentElement && internalInstance._currentElement.ref != null) {
      transaction.getReactMountReady().enqueue(attachRefs, internalInstance);
    }
  },

  /**
   * Flush any dirty changes in a component.
   *
   * @param {ReactComponent} internalInstance
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  performUpdateIfNecessary: function (internalInstance, transaction) {
    internalInstance.performUpdateIfNecessary(transaction);
  }

};

module.exports = ReactReconciler;
},{"./ReactRef":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactRef.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactRef.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRef
 */

'use strict';

var ReactOwner = require('./ReactOwner');

var ReactRef = {};

function attachRef(ref, component, owner) {
  if (typeof ref === 'function') {
    ref(component.getPublicInstance());
  } else {
    // Legacy ref
    ReactOwner.addComponentAsRefTo(component, ref, owner);
  }
}

function detachRef(ref, component, owner) {
  if (typeof ref === 'function') {
    ref(null);
  } else {
    // Legacy ref
    ReactOwner.removeComponentAsRefFrom(component, ref, owner);
  }
}

ReactRef.attachRefs = function (instance, element) {
  if (element === null || element === false) {
    return;
  }
  var ref = element.ref;
  if (ref != null) {
    attachRef(ref, instance, element._owner);
  }
};

ReactRef.shouldUpdateRefs = function (prevElement, nextElement) {
  // If either the owner or a `ref` has changed, make sure the newest owner
  // has stored a reference to `this`, and the previous owner (if different)
  // has forgotten the reference to `this`. We use the element instead
  // of the public this.props because the post processing cannot determine
  // a ref. The ref conceptually lives on the element.

  // TODO: Should this even be possible? The owner cannot change because
  // it's forbidden by shouldUpdateReactComponent. The ref can change
  // if you swap the keys of but not the refs. Reconsider where this check
  // is made. It probably belongs where the key checking and
  // instantiateReactComponent is done.

  var prevEmpty = prevElement === null || prevElement === false;
  var nextEmpty = nextElement === null || nextElement === false;

  return(
    // This has a few false positives w/r/t empty components.
    prevEmpty || nextEmpty || nextElement._owner !== prevElement._owner || nextElement.ref !== prevElement.ref
  );
};

ReactRef.detachRefs = function (instance, element) {
  if (element === null || element === false) {
    return;
  }
  var ref = element.ref;
  if (ref != null) {
    detachRef(ref, instance, element._owner);
  }
};

module.exports = ReactRef;
},{"./ReactOwner":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactOwner.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactRootIndex.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRootIndex
 * @typechecks
 */

'use strict';

var ReactRootIndexInjection = {
  /**
   * @param {function} _createReactRootIndex
   */
  injectCreateReactRootIndex: function (_createReactRootIndex) {
    ReactRootIndex.createReactRootIndex = _createReactRootIndex;
  }
};

var ReactRootIndex = {
  createReactRootIndex: null,
  injection: ReactRootIndexInjection
};

module.exports = ReactRootIndex;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactServerBatchingStrategy.js":[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactServerBatchingStrategy
 * @typechecks
 */

'use strict';

var ReactServerBatchingStrategy = {
  isBatchingUpdates: false,
  batchedUpdates: function (callback) {
    // Don't do anything here. During the server rendering we don't want to
    // schedule any updates. We will simply ignore them.
  }
};

module.exports = ReactServerBatchingStrategy;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactServerRendering.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks static-only
 * @providesModule ReactServerRendering
 */
'use strict';

var ReactDefaultBatchingStrategy = require('./ReactDefaultBatchingStrategy');
var ReactElement = require('./ReactElement');
var ReactInstanceHandles = require('./ReactInstanceHandles');
var ReactMarkupChecksum = require('./ReactMarkupChecksum');
var ReactServerBatchingStrategy = require('./ReactServerBatchingStrategy');
var ReactServerRenderingTransaction = require('./ReactServerRenderingTransaction');
var ReactUpdates = require('./ReactUpdates');

var emptyObject = require('fbjs/lib/emptyObject');
var instantiateReactComponent = require('./instantiateReactComponent');
var invariant = require('fbjs/lib/invariant');

/**
 * @param {ReactElement} element
 * @return {string} the HTML markup
 */
function renderToString(element) {
  !ReactElement.isValidElement(element) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'renderToString(): You must pass a valid ReactElement.') : invariant(false) : undefined;

  var transaction;
  try {
    ReactUpdates.injection.injectBatchingStrategy(ReactServerBatchingStrategy);

    var id = ReactInstanceHandles.createReactRootID();
    transaction = ReactServerRenderingTransaction.getPooled(false);

    return transaction.perform(function () {
      var componentInstance = instantiateReactComponent(element, null);
      var markup = componentInstance.mountComponent(id, transaction, emptyObject);
      return ReactMarkupChecksum.addChecksumToMarkup(markup);
    }, null);
  } finally {
    ReactServerRenderingTransaction.release(transaction);
    // Revert to the DOM batching strategy since these two renderers
    // currently share these stateful modules.
    ReactUpdates.injection.injectBatchingStrategy(ReactDefaultBatchingStrategy);
  }
}

/**
 * @param {ReactElement} element
 * @return {string} the HTML markup, without the extra React ID and checksum
 * (for generating static pages)
 */
function renderToStaticMarkup(element) {
  !ReactElement.isValidElement(element) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'renderToStaticMarkup(): You must pass a valid ReactElement.') : invariant(false) : undefined;

  var transaction;
  try {
    ReactUpdates.injection.injectBatchingStrategy(ReactServerBatchingStrategy);

    var id = ReactInstanceHandles.createReactRootID();
    transaction = ReactServerRenderingTransaction.getPooled(true);

    return transaction.perform(function () {
      var componentInstance = instantiateReactComponent(element, null);
      return componentInstance.mountComponent(id, transaction, emptyObject);
    }, null);
  } finally {
    ReactServerRenderingTransaction.release(transaction);
    // Revert to the DOM batching strategy since these two renderers
    // currently share these stateful modules.
    ReactUpdates.injection.injectBatchingStrategy(ReactDefaultBatchingStrategy);
  }
}

module.exports = {
  renderToString: renderToString,
  renderToStaticMarkup: renderToStaticMarkup
};
},{"./ReactDefaultBatchingStrategy":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactDefaultBatchingStrategy.js","./ReactElement":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js","./ReactInstanceHandles":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInstanceHandles.js","./ReactMarkupChecksum":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMarkupChecksum.js","./ReactServerBatchingStrategy":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactServerBatchingStrategy.js","./ReactServerRenderingTransaction":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactServerRenderingTransaction.js","./ReactUpdates":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdates.js","./instantiateReactComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/instantiateReactComponent.js","fbjs/lib/emptyObject":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyObject.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactServerRenderingTransaction.js":[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactServerRenderingTransaction
 * @typechecks
 */

'use strict';

var PooledClass = require('./PooledClass');
var CallbackQueue = require('./CallbackQueue');
var Transaction = require('./Transaction');

var assign = require('./Object.assign');
var emptyFunction = require('fbjs/lib/emptyFunction');

/**
 * Provides a `CallbackQueue` queue for collecting `onDOMReady` callbacks
 * during the performing of the transaction.
 */
var ON_DOM_READY_QUEUEING = {
  /**
   * Initializes the internal `onDOMReady` queue.
   */
  initialize: function () {
    this.reactMountReady.reset();
  },

  close: emptyFunction
};

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
var TRANSACTION_WRAPPERS = [ON_DOM_READY_QUEUEING];

/**
 * @class ReactServerRenderingTransaction
 * @param {boolean} renderToStaticMarkup
 */
function ReactServerRenderingTransaction(renderToStaticMarkup) {
  this.reinitializeTransaction();
  this.renderToStaticMarkup = renderToStaticMarkup;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.useCreateElement = false;
}

var Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array} Empty list of operation wrap procedures.
   */
  getTransactionWrappers: function () {
    return TRANSACTION_WRAPPERS;
  },

  /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   */
  getReactMountReady: function () {
    return this.reactMountReady;
  },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be reused.
   */
  destructor: function () {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;
  }
};

assign(ReactServerRenderingTransaction.prototype, Transaction.Mixin, Mixin);

PooledClass.addPoolingTo(ReactServerRenderingTransaction);

module.exports = ReactServerRenderingTransaction;
},{"./CallbackQueue":"/home/ec2-user/ksana2015/node_modules/react/lib/CallbackQueue.js","./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./PooledClass":"/home/ec2-user/ksana2015/node_modules/react/lib/PooledClass.js","./Transaction":"/home/ec2-user/ksana2015/node_modules/react/lib/Transaction.js","fbjs/lib/emptyFunction":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyFunction.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdateQueue.js":[function(require,module,exports){
/**
 * Copyright 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactUpdateQueue
 */

'use strict';

var ReactCurrentOwner = require('./ReactCurrentOwner');
var ReactElement = require('./ReactElement');
var ReactInstanceMap = require('./ReactInstanceMap');
var ReactUpdates = require('./ReactUpdates');

var assign = require('./Object.assign');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

function enqueueUpdate(internalInstance) {
  ReactUpdates.enqueueUpdate(internalInstance);
}

function getInternalInstanceReadyForUpdate(publicInstance, callerName) {
  var internalInstance = ReactInstanceMap.get(publicInstance);
  if (!internalInstance) {
    if (process.env.NODE_ENV !== 'production') {
      // Only warn when we have a callerName. Otherwise we should be silent.
      // We're probably calling from enqueueCallback. We don't want to warn
      // there because we already warned for the corresponding lifecycle method.
      process.env.NODE_ENV !== 'production' ? warning(!callerName, '%s(...): Can only update a mounted or mounting component. ' + 'This usually means you called %s() on an unmounted component. ' + 'This is a no-op. Please check the code for the %s component.', callerName, callerName, publicInstance.constructor.displayName) : undefined;
    }
    return null;
  }

  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_ENV !== 'production' ? warning(ReactCurrentOwner.current == null, '%s(...): Cannot update during an existing state transition ' + '(such as within `render`). Render methods should be a pure function ' + 'of props and state.', callerName) : undefined;
  }

  return internalInstance;
}

/**
 * ReactUpdateQueue allows for state updates to be scheduled into a later
 * reconciliation step.
 */
var ReactUpdateQueue = {

  /**
   * Checks whether or not this composite component is mounted.
   * @param {ReactClass} publicInstance The instance we want to test.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function (publicInstance) {
    if (process.env.NODE_ENV !== 'production') {
      var owner = ReactCurrentOwner.current;
      if (owner !== null) {
        process.env.NODE_ENV !== 'production' ? warning(owner._warnedAboutRefsInRender, '%s is accessing isMounted inside its render() function. ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', owner.getName() || 'A component') : undefined;
        owner._warnedAboutRefsInRender = true;
      }
    }
    var internalInstance = ReactInstanceMap.get(publicInstance);
    if (internalInstance) {
      // During componentWillMount and render this will still be null but after
      // that will always render to something. At least for now. So we can use
      // this hack.
      return !!internalInstance._renderedComponent;
    } else {
      return false;
    }
  },

  /**
   * Enqueue a callback that will be executed after all the pending updates
   * have processed.
   *
   * @param {ReactClass} publicInstance The instance to use as `this` context.
   * @param {?function} callback Called after state is updated.
   * @internal
   */
  enqueueCallback: function (publicInstance, callback) {
    !(typeof callback === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'enqueueCallback(...): You called `setProps`, `replaceProps`, ' + '`setState`, `replaceState`, or `forceUpdate` with a callback that ' + 'isn\'t callable.') : invariant(false) : undefined;
    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance);

    // Previously we would throw an error if we didn't have an internal
    // instance. Since we want to make it a no-op instead, we mirror the same
    // behavior we have in other enqueue* methods.
    // We also need to ignore callbacks in componentWillMount. See
    // enqueueUpdates.
    if (!internalInstance) {
      return null;
    }

    if (internalInstance._pendingCallbacks) {
      internalInstance._pendingCallbacks.push(callback);
    } else {
      internalInstance._pendingCallbacks = [callback];
    }
    // TODO: The callback here is ignored when setState is called from
    // componentWillMount. Either fix it or disallow doing so completely in
    // favor of getInitialState. Alternatively, we can disallow
    // componentWillMount during server-side rendering.
    enqueueUpdate(internalInstance);
  },

  enqueueCallbackInternal: function (internalInstance, callback) {
    !(typeof callback === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'enqueueCallback(...): You called `setProps`, `replaceProps`, ' + '`setState`, `replaceState`, or `forceUpdate` with a callback that ' + 'isn\'t callable.') : invariant(false) : undefined;
    if (internalInstance._pendingCallbacks) {
      internalInstance._pendingCallbacks.push(callback);
    } else {
      internalInstance._pendingCallbacks = [callback];
    }
    enqueueUpdate(internalInstance);
  },

  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @internal
   */
  enqueueForceUpdate: function (publicInstance) {
    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'forceUpdate');

    if (!internalInstance) {
      return;
    }

    internalInstance._pendingForceUpdate = true;

    enqueueUpdate(internalInstance);
  },

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} completeState Next state.
   * @internal
   */
  enqueueReplaceState: function (publicInstance, completeState) {
    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'replaceState');

    if (!internalInstance) {
      return;
    }

    internalInstance._pendingStateQueue = [completeState];
    internalInstance._pendingReplaceState = true;

    enqueueUpdate(internalInstance);
  },

  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialState Next partial state to be merged with state.
   * @internal
   */
  enqueueSetState: function (publicInstance, partialState) {
    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'setState');

    if (!internalInstance) {
      return;
    }

    var queue = internalInstance._pendingStateQueue || (internalInstance._pendingStateQueue = []);
    queue.push(partialState);

    enqueueUpdate(internalInstance);
  },

  /**
   * Sets a subset of the props.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialProps Subset of the next props.
   * @internal
   */
  enqueueSetProps: function (publicInstance, partialProps) {
    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'setProps');
    if (!internalInstance) {
      return;
    }
    ReactUpdateQueue.enqueueSetPropsInternal(internalInstance, partialProps);
  },

  enqueueSetPropsInternal: function (internalInstance, partialProps) {
    var topLevelWrapper = internalInstance._topLevelWrapper;
    !topLevelWrapper ? process.env.NODE_ENV !== 'production' ? invariant(false, 'setProps(...): You called `setProps` on a ' + 'component with a parent. This is an anti-pattern since props will ' + 'get reactively updated when rendered. Instead, change the owner\'s ' + '`render` method to pass the correct value as props to the component ' + 'where it is created.') : invariant(false) : undefined;

    // Merge with the pending element if it exists, otherwise with existing
    // element props.
    var wrapElement = topLevelWrapper._pendingElement || topLevelWrapper._currentElement;
    var element = wrapElement.props;
    var props = assign({}, element.props, partialProps);
    topLevelWrapper._pendingElement = ReactElement.cloneAndReplaceProps(wrapElement, ReactElement.cloneAndReplaceProps(element, props));

    enqueueUpdate(topLevelWrapper);
  },

  /**
   * Replaces all of the props.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} props New props.
   * @internal
   */
  enqueueReplaceProps: function (publicInstance, props) {
    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'replaceProps');
    if (!internalInstance) {
      return;
    }
    ReactUpdateQueue.enqueueReplacePropsInternal(internalInstance, props);
  },

  enqueueReplacePropsInternal: function (internalInstance, props) {
    var topLevelWrapper = internalInstance._topLevelWrapper;
    !topLevelWrapper ? process.env.NODE_ENV !== 'production' ? invariant(false, 'replaceProps(...): You called `replaceProps` on a ' + 'component with a parent. This is an anti-pattern since props will ' + 'get reactively updated when rendered. Instead, change the owner\'s ' + '`render` method to pass the correct value as props to the component ' + 'where it is created.') : invariant(false) : undefined;

    // Merge with the pending element if it exists, otherwise with existing
    // element props.
    var wrapElement = topLevelWrapper._pendingElement || topLevelWrapper._currentElement;
    var element = wrapElement.props;
    topLevelWrapper._pendingElement = ReactElement.cloneAndReplaceProps(wrapElement, ReactElement.cloneAndReplaceProps(element, props));

    enqueueUpdate(topLevelWrapper);
  },

  enqueueElementInternal: function (internalInstance, newElement) {
    internalInstance._pendingElement = newElement;
    enqueueUpdate(internalInstance);
  }

};

module.exports = ReactUpdateQueue;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactCurrentOwner":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactCurrentOwner.js","./ReactElement":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js","./ReactInstanceMap":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInstanceMap.js","./ReactUpdates":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdates.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactUpdates.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactUpdates
 */

'use strict';

var CallbackQueue = require('./CallbackQueue');
var PooledClass = require('./PooledClass');
var ReactPerf = require('./ReactPerf');
var ReactReconciler = require('./ReactReconciler');
var Transaction = require('./Transaction');

var assign = require('./Object.assign');
var invariant = require('fbjs/lib/invariant');

var dirtyComponents = [];
var asapCallbackQueue = CallbackQueue.getPooled();
var asapEnqueued = false;

var batchingStrategy = null;

function ensureInjected() {
  !(ReactUpdates.ReactReconcileTransaction && batchingStrategy) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactUpdates: must inject a reconcile transaction class and batching ' + 'strategy') : invariant(false) : undefined;
}

var NESTED_UPDATES = {
  initialize: function () {
    this.dirtyComponentsLength = dirtyComponents.length;
  },
  close: function () {
    if (this.dirtyComponentsLength !== dirtyComponents.length) {
      // Additional updates were enqueued by componentDidUpdate handlers or
      // similar; before our own UPDATE_QUEUEING wrapper closes, we want to run
      // these new updates so that if A's componentDidUpdate calls setState on
      // B, B will update before the callback A's updater provided when calling
      // setState.
      dirtyComponents.splice(0, this.dirtyComponentsLength);
      flushBatchedUpdates();
    } else {
      dirtyComponents.length = 0;
    }
  }
};

var UPDATE_QUEUEING = {
  initialize: function () {
    this.callbackQueue.reset();
  },
  close: function () {
    this.callbackQueue.notifyAll();
  }
};

var TRANSACTION_WRAPPERS = [NESTED_UPDATES, UPDATE_QUEUEING];

function ReactUpdatesFlushTransaction() {
  this.reinitializeTransaction();
  this.dirtyComponentsLength = null;
  this.callbackQueue = CallbackQueue.getPooled();
  this.reconcileTransaction = ReactUpdates.ReactReconcileTransaction.getPooled( /* forceHTML */false);
}

assign(ReactUpdatesFlushTransaction.prototype, Transaction.Mixin, {
  getTransactionWrappers: function () {
    return TRANSACTION_WRAPPERS;
  },

  destructor: function () {
    this.dirtyComponentsLength = null;
    CallbackQueue.release(this.callbackQueue);
    this.callbackQueue = null;
    ReactUpdates.ReactReconcileTransaction.release(this.reconcileTransaction);
    this.reconcileTransaction = null;
  },

  perform: function (method, scope, a) {
    // Essentially calls `this.reconcileTransaction.perform(method, scope, a)`
    // with this transaction's wrappers around it.
    return Transaction.Mixin.perform.call(this, this.reconcileTransaction.perform, this.reconcileTransaction, method, scope, a);
  }
});

PooledClass.addPoolingTo(ReactUpdatesFlushTransaction);

function batchedUpdates(callback, a, b, c, d, e) {
  ensureInjected();
  batchingStrategy.batchedUpdates(callback, a, b, c, d, e);
}

/**
 * Array comparator for ReactComponents by mount ordering.
 *
 * @param {ReactComponent} c1 first component you're comparing
 * @param {ReactComponent} c2 second component you're comparing
 * @return {number} Return value usable by Array.prototype.sort().
 */
function mountOrderComparator(c1, c2) {
  return c1._mountOrder - c2._mountOrder;
}

function runBatchedUpdates(transaction) {
  var len = transaction.dirtyComponentsLength;
  !(len === dirtyComponents.length) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Expected flush transaction\'s stored dirty-components length (%s) to ' + 'match dirty-components array length (%s).', len, dirtyComponents.length) : invariant(false) : undefined;

  // Since reconciling a component higher in the owner hierarchy usually (not
  // always -- see shouldComponentUpdate()) will reconcile children, reconcile
  // them before their children by sorting the array.
  dirtyComponents.sort(mountOrderComparator);

  for (var i = 0; i < len; i++) {
    // If a component is unmounted before pending changes apply, it will still
    // be here, but we assume that it has cleared its _pendingCallbacks and
    // that performUpdateIfNecessary is a noop.
    var component = dirtyComponents[i];

    // If performUpdateIfNecessary happens to enqueue any new updates, we
    // shouldn't execute the callbacks until the next render happens, so
    // stash the callbacks first
    var callbacks = component._pendingCallbacks;
    component._pendingCallbacks = null;

    ReactReconciler.performUpdateIfNecessary(component, transaction.reconcileTransaction);

    if (callbacks) {
      for (var j = 0; j < callbacks.length; j++) {
        transaction.callbackQueue.enqueue(callbacks[j], component.getPublicInstance());
      }
    }
  }
}

var flushBatchedUpdates = function () {
  // ReactUpdatesFlushTransaction's wrappers will clear the dirtyComponents
  // array and perform any updates enqueued by mount-ready handlers (i.e.,
  // componentDidUpdate) but we need to check here too in order to catch
  // updates enqueued by setState callbacks and asap calls.
  while (dirtyComponents.length || asapEnqueued) {
    if (dirtyComponents.length) {
      var transaction = ReactUpdatesFlushTransaction.getPooled();
      transaction.perform(runBatchedUpdates, null, transaction);
      ReactUpdatesFlushTransaction.release(transaction);
    }

    if (asapEnqueued) {
      asapEnqueued = false;
      var queue = asapCallbackQueue;
      asapCallbackQueue = CallbackQueue.getPooled();
      queue.notifyAll();
      CallbackQueue.release(queue);
    }
  }
};
flushBatchedUpdates = ReactPerf.measure('ReactUpdates', 'flushBatchedUpdates', flushBatchedUpdates);

/**
 * Mark a component as needing a rerender, adding an optional callback to a
 * list of functions which will be executed once the rerender occurs.
 */
function enqueueUpdate(component) {
  ensureInjected();

  // Various parts of our code (such as ReactCompositeComponent's
  // _renderValidatedComponent) assume that calls to render aren't nested;
  // verify that that's the case. (This is called by each top-level update
  // function, like setProps, setState, forceUpdate, etc.; creation and
  // destruction of top-level components is guarded in ReactMount.)

  if (!batchingStrategy.isBatchingUpdates) {
    batchingStrategy.batchedUpdates(enqueueUpdate, component);
    return;
  }

  dirtyComponents.push(component);
}

/**
 * Enqueue a callback to be run at the end of the current batching cycle. Throws
 * if no updates are currently being performed.
 */
function asap(callback, context) {
  !batchingStrategy.isBatchingUpdates ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactUpdates.asap: Can\'t enqueue an asap callback in a context where' + 'updates are not being batched.') : invariant(false) : undefined;
  asapCallbackQueue.enqueue(callback, context);
  asapEnqueued = true;
}

var ReactUpdatesInjection = {
  injectReconcileTransaction: function (ReconcileTransaction) {
    !ReconcileTransaction ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactUpdates: must provide a reconcile transaction class') : invariant(false) : undefined;
    ReactUpdates.ReactReconcileTransaction = ReconcileTransaction;
  },

  injectBatchingStrategy: function (_batchingStrategy) {
    !_batchingStrategy ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactUpdates: must provide a batching strategy') : invariant(false) : undefined;
    !(typeof _batchingStrategy.batchedUpdates === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactUpdates: must provide a batchedUpdates() function') : invariant(false) : undefined;
    !(typeof _batchingStrategy.isBatchingUpdates === 'boolean') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactUpdates: must provide an isBatchingUpdates boolean attribute') : invariant(false) : undefined;
    batchingStrategy = _batchingStrategy;
  }
};

var ReactUpdates = {
  /**
   * React references `ReactReconcileTransaction` using this property in order
   * to allow dependency injection.
   *
   * @internal
   */
  ReactReconcileTransaction: null,

  batchedUpdates: batchedUpdates,
  enqueueUpdate: enqueueUpdate,
  flushBatchedUpdates: flushBatchedUpdates,
  injection: ReactUpdatesInjection,
  asap: asap
};

module.exports = ReactUpdates;
},{"./CallbackQueue":"/home/ec2-user/ksana2015/node_modules/react/lib/CallbackQueue.js","./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./PooledClass":"/home/ec2-user/ksana2015/node_modules/react/lib/PooledClass.js","./ReactPerf":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactPerf.js","./ReactReconciler":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactReconciler.js","./Transaction":"/home/ec2-user/ksana2015/node_modules/react/lib/Transaction.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ReactVersion.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactVersion
 */

'use strict';

module.exports = '0.14.7';
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/SVGDOMPropertyConfig.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SVGDOMPropertyConfig
 */

'use strict';

var DOMProperty = require('./DOMProperty');

var MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;

var NS = {
  xlink: 'http://www.w3.org/1999/xlink',
  xml: 'http://www.w3.org/XML/1998/namespace'
};

var SVGDOMPropertyConfig = {
  Properties: {
    clipPath: MUST_USE_ATTRIBUTE,
    cx: MUST_USE_ATTRIBUTE,
    cy: MUST_USE_ATTRIBUTE,
    d: MUST_USE_ATTRIBUTE,
    dx: MUST_USE_ATTRIBUTE,
    dy: MUST_USE_ATTRIBUTE,
    fill: MUST_USE_ATTRIBUTE,
    fillOpacity: MUST_USE_ATTRIBUTE,
    fontFamily: MUST_USE_ATTRIBUTE,
    fontSize: MUST_USE_ATTRIBUTE,
    fx: MUST_USE_ATTRIBUTE,
    fy: MUST_USE_ATTRIBUTE,
    gradientTransform: MUST_USE_ATTRIBUTE,
    gradientUnits: MUST_USE_ATTRIBUTE,
    markerEnd: MUST_USE_ATTRIBUTE,
    markerMid: MUST_USE_ATTRIBUTE,
    markerStart: MUST_USE_ATTRIBUTE,
    offset: MUST_USE_ATTRIBUTE,
    opacity: MUST_USE_ATTRIBUTE,
    patternContentUnits: MUST_USE_ATTRIBUTE,
    patternUnits: MUST_USE_ATTRIBUTE,
    points: MUST_USE_ATTRIBUTE,
    preserveAspectRatio: MUST_USE_ATTRIBUTE,
    r: MUST_USE_ATTRIBUTE,
    rx: MUST_USE_ATTRIBUTE,
    ry: MUST_USE_ATTRIBUTE,
    spreadMethod: MUST_USE_ATTRIBUTE,
    stopColor: MUST_USE_ATTRIBUTE,
    stopOpacity: MUST_USE_ATTRIBUTE,
    stroke: MUST_USE_ATTRIBUTE,
    strokeDasharray: MUST_USE_ATTRIBUTE,
    strokeLinecap: MUST_USE_ATTRIBUTE,
    strokeOpacity: MUST_USE_ATTRIBUTE,
    strokeWidth: MUST_USE_ATTRIBUTE,
    textAnchor: MUST_USE_ATTRIBUTE,
    transform: MUST_USE_ATTRIBUTE,
    version: MUST_USE_ATTRIBUTE,
    viewBox: MUST_USE_ATTRIBUTE,
    x1: MUST_USE_ATTRIBUTE,
    x2: MUST_USE_ATTRIBUTE,
    x: MUST_USE_ATTRIBUTE,
    xlinkActuate: MUST_USE_ATTRIBUTE,
    xlinkArcrole: MUST_USE_ATTRIBUTE,
    xlinkHref: MUST_USE_ATTRIBUTE,
    xlinkRole: MUST_USE_ATTRIBUTE,
    xlinkShow: MUST_USE_ATTRIBUTE,
    xlinkTitle: MUST_USE_ATTRIBUTE,
    xlinkType: MUST_USE_ATTRIBUTE,
    xmlBase: MUST_USE_ATTRIBUTE,
    xmlLang: MUST_USE_ATTRIBUTE,
    xmlSpace: MUST_USE_ATTRIBUTE,
    y1: MUST_USE_ATTRIBUTE,
    y2: MUST_USE_ATTRIBUTE,
    y: MUST_USE_ATTRIBUTE
  },
  DOMAttributeNamespaces: {
    xlinkActuate: NS.xlink,
    xlinkArcrole: NS.xlink,
    xlinkHref: NS.xlink,
    xlinkRole: NS.xlink,
    xlinkShow: NS.xlink,
    xlinkTitle: NS.xlink,
    xlinkType: NS.xlink,
    xmlBase: NS.xml,
    xmlLang: NS.xml,
    xmlSpace: NS.xml
  },
  DOMAttributeNames: {
    clipPath: 'clip-path',
    fillOpacity: 'fill-opacity',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    gradientTransform: 'gradientTransform',
    gradientUnits: 'gradientUnits',
    markerEnd: 'marker-end',
    markerMid: 'marker-mid',
    markerStart: 'marker-start',
    patternContentUnits: 'patternContentUnits',
    patternUnits: 'patternUnits',
    preserveAspectRatio: 'preserveAspectRatio',
    spreadMethod: 'spreadMethod',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    strokeDasharray: 'stroke-dasharray',
    strokeLinecap: 'stroke-linecap',
    strokeOpacity: 'stroke-opacity',
    strokeWidth: 'stroke-width',
    textAnchor: 'text-anchor',
    viewBox: 'viewBox',
    xlinkActuate: 'xlink:actuate',
    xlinkArcrole: 'xlink:arcrole',
    xlinkHref: 'xlink:href',
    xlinkRole: 'xlink:role',
    xlinkShow: 'xlink:show',
    xlinkTitle: 'xlink:title',
    xlinkType: 'xlink:type',
    xmlBase: 'xml:base',
    xmlLang: 'xml:lang',
    xmlSpace: 'xml:space'
  }
};

module.exports = SVGDOMPropertyConfig;
},{"./DOMProperty":"/home/ec2-user/ksana2015/node_modules/react/lib/DOMProperty.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/SelectEventPlugin.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SelectEventPlugin
 */

'use strict';

var EventConstants = require('./EventConstants');
var EventPropagators = require('./EventPropagators');
var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');
var ReactInputSelection = require('./ReactInputSelection');
var SyntheticEvent = require('./SyntheticEvent');

var getActiveElement = require('fbjs/lib/getActiveElement');
var isTextInputElement = require('./isTextInputElement');
var keyOf = require('fbjs/lib/keyOf');
var shallowEqual = require('fbjs/lib/shallowEqual');

var topLevelTypes = EventConstants.topLevelTypes;

var skipSelectionChangeEvent = ExecutionEnvironment.canUseDOM && 'documentMode' in document && document.documentMode <= 11;

var eventTypes = {
  select: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onSelect: null }),
      captured: keyOf({ onSelectCapture: null })
    },
    dependencies: [topLevelTypes.topBlur, topLevelTypes.topContextMenu, topLevelTypes.topFocus, topLevelTypes.topKeyDown, topLevelTypes.topMouseDown, topLevelTypes.topMouseUp, topLevelTypes.topSelectionChange]
  }
};

var activeElement = null;
var activeElementID = null;
var lastSelection = null;
var mouseDown = false;

// Track whether a listener exists for this plugin. If none exist, we do
// not extract events.
var hasListener = false;
var ON_SELECT_KEY = keyOf({ onSelect: null });

/**
 * Get an object which is a unique representation of the current selection.
 *
 * The return value will not be consistent across nodes or browsers, but
 * two identical selections on the same node will return identical objects.
 *
 * @param {DOMElement} node
 * @return {object}
 */
function getSelection(node) {
  if ('selectionStart' in node && ReactInputSelection.hasSelectionCapabilities(node)) {
    return {
      start: node.selectionStart,
      end: node.selectionEnd
    };
  } else if (window.getSelection) {
    var selection = window.getSelection();
    return {
      anchorNode: selection.anchorNode,
      anchorOffset: selection.anchorOffset,
      focusNode: selection.focusNode,
      focusOffset: selection.focusOffset
    };
  } else if (document.selection) {
    var range = document.selection.createRange();
    return {
      parentElement: range.parentElement(),
      text: range.text,
      top: range.boundingTop,
      left: range.boundingLeft
    };
  }
}

/**
 * Poll selection to see whether it's changed.
 *
 * @param {object} nativeEvent
 * @return {?SyntheticEvent}
 */
function constructSelectEvent(nativeEvent, nativeEventTarget) {
  // Ensure we have the right element, and that the user is not dragging a
  // selection (this matches native `select` event behavior). In HTML5, select
  // fires only on input and textarea thus if there's no focused element we
  // won't dispatch.
  if (mouseDown || activeElement == null || activeElement !== getActiveElement()) {
    return null;
  }

  // Only fire when selection has actually changed.
  var currentSelection = getSelection(activeElement);
  if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
    lastSelection = currentSelection;

    var syntheticEvent = SyntheticEvent.getPooled(eventTypes.select, activeElementID, nativeEvent, nativeEventTarget);

    syntheticEvent.type = 'select';
    syntheticEvent.target = activeElement;

    EventPropagators.accumulateTwoPhaseDispatches(syntheticEvent);

    return syntheticEvent;
  }

  return null;
}

/**
 * This plugin creates an `onSelect` event that normalizes select events
 * across form elements.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - contentEditable
 *
 * This differs from native browser implementations in the following ways:
 * - Fires on contentEditable fields as well as inputs.
 * - Fires for collapsed selection.
 * - Fires after user input.
 */
var SelectEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function (topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
    if (!hasListener) {
      return null;
    }

    switch (topLevelType) {
      // Track the input node that has focus.
      case topLevelTypes.topFocus:
        if (isTextInputElement(topLevelTarget) || topLevelTarget.contentEditable === 'true') {
          activeElement = topLevelTarget;
          activeElementID = topLevelTargetID;
          lastSelection = null;
        }
        break;
      case topLevelTypes.topBlur:
        activeElement = null;
        activeElementID = null;
        lastSelection = null;
        break;

      // Don't fire the event while the user is dragging. This matches the
      // semantics of the native select event.
      case topLevelTypes.topMouseDown:
        mouseDown = true;
        break;
      case topLevelTypes.topContextMenu:
      case topLevelTypes.topMouseUp:
        mouseDown = false;
        return constructSelectEvent(nativeEvent, nativeEventTarget);

      // Chrome and IE fire non-standard event when selection is changed (and
      // sometimes when it hasn't). IE's event fires out of order with respect
      // to key and input events on deletion, so we discard it.
      //
      // Firefox doesn't support selectionchange, so check selection status
      // after each key entry. The selection changes after keydown and before
      // keyup, but we check on keydown as well in the case of holding down a
      // key, when multiple keydown events are fired but only one keyup is.
      // This is also our approach for IE handling, for the reason above.
      case topLevelTypes.topSelectionChange:
        if (skipSelectionChangeEvent) {
          break;
        }
      // falls through
      case topLevelTypes.topKeyDown:
      case topLevelTypes.topKeyUp:
        return constructSelectEvent(nativeEvent, nativeEventTarget);
    }

    return null;
  },

  didPutListener: function (id, registrationName, listener) {
    if (registrationName === ON_SELECT_KEY) {
      hasListener = true;
    }
  }
};

module.exports = SelectEventPlugin;
},{"./EventConstants":"/home/ec2-user/ksana2015/node_modules/react/lib/EventConstants.js","./EventPropagators":"/home/ec2-user/ksana2015/node_modules/react/lib/EventPropagators.js","./ReactInputSelection":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInputSelection.js","./SyntheticEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticEvent.js","./isTextInputElement":"/home/ec2-user/ksana2015/node_modules/react/lib/isTextInputElement.js","fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js","fbjs/lib/getActiveElement":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/getActiveElement.js","fbjs/lib/keyOf":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyOf.js","fbjs/lib/shallowEqual":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/shallowEqual.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ServerReactRootIndex.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ServerReactRootIndex
 * @typechecks
 */

'use strict';

/**
 * Size of the reactRoot ID space. We generate random numbers for React root
 * IDs and if there's a collision the events and DOM update system will
 * get confused. In the future we need a way to generate GUIDs but for
 * now this will work on a smaller scale.
 */
var GLOBAL_MOUNT_POINT_MAX = Math.pow(2, 53);

var ServerReactRootIndex = {
  createReactRootIndex: function () {
    return Math.ceil(Math.random() * GLOBAL_MOUNT_POINT_MAX);
  }
};

module.exports = ServerReactRootIndex;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/SimpleEventPlugin.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SimpleEventPlugin
 */

'use strict';

var EventConstants = require('./EventConstants');
var EventListener = require('fbjs/lib/EventListener');
var EventPropagators = require('./EventPropagators');
var ReactMount = require('./ReactMount');
var SyntheticClipboardEvent = require('./SyntheticClipboardEvent');
var SyntheticEvent = require('./SyntheticEvent');
var SyntheticFocusEvent = require('./SyntheticFocusEvent');
var SyntheticKeyboardEvent = require('./SyntheticKeyboardEvent');
var SyntheticMouseEvent = require('./SyntheticMouseEvent');
var SyntheticDragEvent = require('./SyntheticDragEvent');
var SyntheticTouchEvent = require('./SyntheticTouchEvent');
var SyntheticUIEvent = require('./SyntheticUIEvent');
var SyntheticWheelEvent = require('./SyntheticWheelEvent');

var emptyFunction = require('fbjs/lib/emptyFunction');
var getEventCharCode = require('./getEventCharCode');
var invariant = require('fbjs/lib/invariant');
var keyOf = require('fbjs/lib/keyOf');

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  abort: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onAbort: true }),
      captured: keyOf({ onAbortCapture: true })
    }
  },
  blur: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onBlur: true }),
      captured: keyOf({ onBlurCapture: true })
    }
  },
  canPlay: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onCanPlay: true }),
      captured: keyOf({ onCanPlayCapture: true })
    }
  },
  canPlayThrough: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onCanPlayThrough: true }),
      captured: keyOf({ onCanPlayThroughCapture: true })
    }
  },
  click: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onClick: true }),
      captured: keyOf({ onClickCapture: true })
    }
  },
  contextMenu: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onContextMenu: true }),
      captured: keyOf({ onContextMenuCapture: true })
    }
  },
  copy: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onCopy: true }),
      captured: keyOf({ onCopyCapture: true })
    }
  },
  cut: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onCut: true }),
      captured: keyOf({ onCutCapture: true })
    }
  },
  doubleClick: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onDoubleClick: true }),
      captured: keyOf({ onDoubleClickCapture: true })
    }
  },
  drag: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onDrag: true }),
      captured: keyOf({ onDragCapture: true })
    }
  },
  dragEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onDragEnd: true }),
      captured: keyOf({ onDragEndCapture: true })
    }
  },
  dragEnter: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onDragEnter: true }),
      captured: keyOf({ onDragEnterCapture: true })
    }
  },
  dragExit: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onDragExit: true }),
      captured: keyOf({ onDragExitCapture: true })
    }
  },
  dragLeave: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onDragLeave: true }),
      captured: keyOf({ onDragLeaveCapture: true })
    }
  },
  dragOver: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onDragOver: true }),
      captured: keyOf({ onDragOverCapture: true })
    }
  },
  dragStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onDragStart: true }),
      captured: keyOf({ onDragStartCapture: true })
    }
  },
  drop: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onDrop: true }),
      captured: keyOf({ onDropCapture: true })
    }
  },
  durationChange: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onDurationChange: true }),
      captured: keyOf({ onDurationChangeCapture: true })
    }
  },
  emptied: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onEmptied: true }),
      captured: keyOf({ onEmptiedCapture: true })
    }
  },
  encrypted: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onEncrypted: true }),
      captured: keyOf({ onEncryptedCapture: true })
    }
  },
  ended: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onEnded: true }),
      captured: keyOf({ onEndedCapture: true })
    }
  },
  error: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onError: true }),
      captured: keyOf({ onErrorCapture: true })
    }
  },
  focus: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onFocus: true }),
      captured: keyOf({ onFocusCapture: true })
    }
  },
  input: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onInput: true }),
      captured: keyOf({ onInputCapture: true })
    }
  },
  keyDown: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onKeyDown: true }),
      captured: keyOf({ onKeyDownCapture: true })
    }
  },
  keyPress: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onKeyPress: true }),
      captured: keyOf({ onKeyPressCapture: true })
    }
  },
  keyUp: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onKeyUp: true }),
      captured: keyOf({ onKeyUpCapture: true })
    }
  },
  load: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onLoad: true }),
      captured: keyOf({ onLoadCapture: true })
    }
  },
  loadedData: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onLoadedData: true }),
      captured: keyOf({ onLoadedDataCapture: true })
    }
  },
  loadedMetadata: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onLoadedMetadata: true }),
      captured: keyOf({ onLoadedMetadataCapture: true })
    }
  },
  loadStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onLoadStart: true }),
      captured: keyOf({ onLoadStartCapture: true })
    }
  },
  // Note: We do not allow listening to mouseOver events. Instead, use the
  // onMouseEnter/onMouseLeave created by `EnterLeaveEventPlugin`.
  mouseDown: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onMouseDown: true }),
      captured: keyOf({ onMouseDownCapture: true })
    }
  },
  mouseMove: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onMouseMove: true }),
      captured: keyOf({ onMouseMoveCapture: true })
    }
  },
  mouseOut: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onMouseOut: true }),
      captured: keyOf({ onMouseOutCapture: true })
    }
  },
  mouseOver: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onMouseOver: true }),
      captured: keyOf({ onMouseOverCapture: true })
    }
  },
  mouseUp: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onMouseUp: true }),
      captured: keyOf({ onMouseUpCapture: true })
    }
  },
  paste: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onPaste: true }),
      captured: keyOf({ onPasteCapture: true })
    }
  },
  pause: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onPause: true }),
      captured: keyOf({ onPauseCapture: true })
    }
  },
  play: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onPlay: true }),
      captured: keyOf({ onPlayCapture: true })
    }
  },
  playing: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onPlaying: true }),
      captured: keyOf({ onPlayingCapture: true })
    }
  },
  progress: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onProgress: true }),
      captured: keyOf({ onProgressCapture: true })
    }
  },
  rateChange: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onRateChange: true }),
      captured: keyOf({ onRateChangeCapture: true })
    }
  },
  reset: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onReset: true }),
      captured: keyOf({ onResetCapture: true })
    }
  },
  scroll: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onScroll: true }),
      captured: keyOf({ onScrollCapture: true })
    }
  },
  seeked: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onSeeked: true }),
      captured: keyOf({ onSeekedCapture: true })
    }
  },
  seeking: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onSeeking: true }),
      captured: keyOf({ onSeekingCapture: true })
    }
  },
  stalled: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onStalled: true }),
      captured: keyOf({ onStalledCapture: true })
    }
  },
  submit: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onSubmit: true }),
      captured: keyOf({ onSubmitCapture: true })
    }
  },
  suspend: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onSuspend: true }),
      captured: keyOf({ onSuspendCapture: true })
    }
  },
  timeUpdate: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onTimeUpdate: true }),
      captured: keyOf({ onTimeUpdateCapture: true })
    }
  },
  touchCancel: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onTouchCancel: true }),
      captured: keyOf({ onTouchCancelCapture: true })
    }
  },
  touchEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onTouchEnd: true }),
      captured: keyOf({ onTouchEndCapture: true })
    }
  },
  touchMove: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onTouchMove: true }),
      captured: keyOf({ onTouchMoveCapture: true })
    }
  },
  touchStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onTouchStart: true }),
      captured: keyOf({ onTouchStartCapture: true })
    }
  },
  volumeChange: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onVolumeChange: true }),
      captured: keyOf({ onVolumeChangeCapture: true })
    }
  },
  waiting: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onWaiting: true }),
      captured: keyOf({ onWaitingCapture: true })
    }
  },
  wheel: {
    phasedRegistrationNames: {
      bubbled: keyOf({ onWheel: true }),
      captured: keyOf({ onWheelCapture: true })
    }
  }
};

var topLevelEventsToDispatchConfig = {
  topAbort: eventTypes.abort,
  topBlur: eventTypes.blur,
  topCanPlay: eventTypes.canPlay,
  topCanPlayThrough: eventTypes.canPlayThrough,
  topClick: eventTypes.click,
  topContextMenu: eventTypes.contextMenu,
  topCopy: eventTypes.copy,
  topCut: eventTypes.cut,
  topDoubleClick: eventTypes.doubleClick,
  topDrag: eventTypes.drag,
  topDragEnd: eventTypes.dragEnd,
  topDragEnter: eventTypes.dragEnter,
  topDragExit: eventTypes.dragExit,
  topDragLeave: eventTypes.dragLeave,
  topDragOver: eventTypes.dragOver,
  topDragStart: eventTypes.dragStart,
  topDrop: eventTypes.drop,
  topDurationChange: eventTypes.durationChange,
  topEmptied: eventTypes.emptied,
  topEncrypted: eventTypes.encrypted,
  topEnded: eventTypes.ended,
  topError: eventTypes.error,
  topFocus: eventTypes.focus,
  topInput: eventTypes.input,
  topKeyDown: eventTypes.keyDown,
  topKeyPress: eventTypes.keyPress,
  topKeyUp: eventTypes.keyUp,
  topLoad: eventTypes.load,
  topLoadedData: eventTypes.loadedData,
  topLoadedMetadata: eventTypes.loadedMetadata,
  topLoadStart: eventTypes.loadStart,
  topMouseDown: eventTypes.mouseDown,
  topMouseMove: eventTypes.mouseMove,
  topMouseOut: eventTypes.mouseOut,
  topMouseOver: eventTypes.mouseOver,
  topMouseUp: eventTypes.mouseUp,
  topPaste: eventTypes.paste,
  topPause: eventTypes.pause,
  topPlay: eventTypes.play,
  topPlaying: eventTypes.playing,
  topProgress: eventTypes.progress,
  topRateChange: eventTypes.rateChange,
  topReset: eventTypes.reset,
  topScroll: eventTypes.scroll,
  topSeeked: eventTypes.seeked,
  topSeeking: eventTypes.seeking,
  topStalled: eventTypes.stalled,
  topSubmit: eventTypes.submit,
  topSuspend: eventTypes.suspend,
  topTimeUpdate: eventTypes.timeUpdate,
  topTouchCancel: eventTypes.touchCancel,
  topTouchEnd: eventTypes.touchEnd,
  topTouchMove: eventTypes.touchMove,
  topTouchStart: eventTypes.touchStart,
  topVolumeChange: eventTypes.volumeChange,
  topWaiting: eventTypes.waiting,
  topWheel: eventTypes.wheel
};

for (var type in topLevelEventsToDispatchConfig) {
  topLevelEventsToDispatchConfig[type].dependencies = [type];
}

var ON_CLICK_KEY = keyOf({ onClick: null });
var onClickListeners = {};

var SimpleEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function (topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
    var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
    if (!dispatchConfig) {
      return null;
    }
    var EventConstructor;
    switch (topLevelType) {
      case topLevelTypes.topAbort:
      case topLevelTypes.topCanPlay:
      case topLevelTypes.topCanPlayThrough:
      case topLevelTypes.topDurationChange:
      case topLevelTypes.topEmptied:
      case topLevelTypes.topEncrypted:
      case topLevelTypes.topEnded:
      case topLevelTypes.topError:
      case topLevelTypes.topInput:
      case topLevelTypes.topLoad:
      case topLevelTypes.topLoadedData:
      case topLevelTypes.topLoadedMetadata:
      case topLevelTypes.topLoadStart:
      case topLevelTypes.topPause:
      case topLevelTypes.topPlay:
      case topLevelTypes.topPlaying:
      case topLevelTypes.topProgress:
      case topLevelTypes.topRateChange:
      case topLevelTypes.topReset:
      case topLevelTypes.topSeeked:
      case topLevelTypes.topSeeking:
      case topLevelTypes.topStalled:
      case topLevelTypes.topSubmit:
      case topLevelTypes.topSuspend:
      case topLevelTypes.topTimeUpdate:
      case topLevelTypes.topVolumeChange:
      case topLevelTypes.topWaiting:
        // HTML Events
        // @see http://www.w3.org/TR/html5/index.html#events-0
        EventConstructor = SyntheticEvent;
        break;
      case topLevelTypes.topKeyPress:
        // FireFox creates a keypress event for function keys too. This removes
        // the unwanted keypress events. Enter is however both printable and
        // non-printable. One would expect Tab to be as well (but it isn't).
        if (getEventCharCode(nativeEvent) === 0) {
          return null;
        }
      /* falls through */
      case topLevelTypes.topKeyDown:
      case topLevelTypes.topKeyUp:
        EventConstructor = SyntheticKeyboardEvent;
        break;
      case topLevelTypes.topBlur:
      case topLevelTypes.topFocus:
        EventConstructor = SyntheticFocusEvent;
        break;
      case topLevelTypes.topClick:
        // Firefox creates a click event on right mouse clicks. This removes the
        // unwanted click events.
        if (nativeEvent.button === 2) {
          return null;
        }
      /* falls through */
      case topLevelTypes.topContextMenu:
      case topLevelTypes.topDoubleClick:
      case topLevelTypes.topMouseDown:
      case topLevelTypes.topMouseMove:
      case topLevelTypes.topMouseOut:
      case topLevelTypes.topMouseOver:
      case topLevelTypes.topMouseUp:
        EventConstructor = SyntheticMouseEvent;
        break;
      case topLevelTypes.topDrag:
      case topLevelTypes.topDragEnd:
      case topLevelTypes.topDragEnter:
      case topLevelTypes.topDragExit:
      case topLevelTypes.topDragLeave:
      case topLevelTypes.topDragOver:
      case topLevelTypes.topDragStart:
      case topLevelTypes.topDrop:
        EventConstructor = SyntheticDragEvent;
        break;
      case topLevelTypes.topTouchCancel:
      case topLevelTypes.topTouchEnd:
      case topLevelTypes.topTouchMove:
      case topLevelTypes.topTouchStart:
        EventConstructor = SyntheticTouchEvent;
        break;
      case topLevelTypes.topScroll:
        EventConstructor = SyntheticUIEvent;
        break;
      case topLevelTypes.topWheel:
        EventConstructor = SyntheticWheelEvent;
        break;
      case topLevelTypes.topCopy:
      case topLevelTypes.topCut:
      case topLevelTypes.topPaste:
        EventConstructor = SyntheticClipboardEvent;
        break;
    }
    !EventConstructor ? process.env.NODE_ENV !== 'production' ? invariant(false, 'SimpleEventPlugin: Unhandled event type, `%s`.', topLevelType) : invariant(false) : undefined;
    var event = EventConstructor.getPooled(dispatchConfig, topLevelTargetID, nativeEvent, nativeEventTarget);
    EventPropagators.accumulateTwoPhaseDispatches(event);
    return event;
  },

  didPutListener: function (id, registrationName, listener) {
    // Mobile Safari does not fire properly bubble click events on
    // non-interactive elements, which means delegated click listeners do not
    // fire. The workaround for this bug involves attaching an empty click
    // listener on the target node.
    if (registrationName === ON_CLICK_KEY) {
      var node = ReactMount.getNode(id);
      if (!onClickListeners[id]) {
        onClickListeners[id] = EventListener.listen(node, 'click', emptyFunction);
      }
    }
  },

  willDeleteListener: function (id, registrationName) {
    if (registrationName === ON_CLICK_KEY) {
      onClickListeners[id].remove();
      delete onClickListeners[id];
    }
  }

};

module.exports = SimpleEventPlugin;
},{"./EventConstants":"/home/ec2-user/ksana2015/node_modules/react/lib/EventConstants.js","./EventPropagators":"/home/ec2-user/ksana2015/node_modules/react/lib/EventPropagators.js","./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js","./SyntheticClipboardEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticClipboardEvent.js","./SyntheticDragEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticDragEvent.js","./SyntheticEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticEvent.js","./SyntheticFocusEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticFocusEvent.js","./SyntheticKeyboardEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticKeyboardEvent.js","./SyntheticMouseEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticMouseEvent.js","./SyntheticTouchEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticTouchEvent.js","./SyntheticUIEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticUIEvent.js","./SyntheticWheelEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticWheelEvent.js","./getEventCharCode":"/home/ec2-user/ksana2015/node_modules/react/lib/getEventCharCode.js","fbjs/lib/EventListener":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/EventListener.js","fbjs/lib/emptyFunction":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyFunction.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/keyOf":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyOf.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticClipboardEvent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticClipboardEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticEvent = require('./SyntheticEvent');

/**
 * @interface Event
 * @see http://www.w3.org/TR/clipboard-apis/
 */
var ClipboardEventInterface = {
  clipboardData: function (event) {
    return 'clipboardData' in event ? event.clipboardData : window.clipboardData;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticClipboardEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticEvent.augmentClass(SyntheticClipboardEvent, ClipboardEventInterface);

module.exports = SyntheticClipboardEvent;
},{"./SyntheticEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticEvent.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticCompositionEvent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticCompositionEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticEvent = require('./SyntheticEvent');

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#events-compositionevents
 */
var CompositionEventInterface = {
  data: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticCompositionEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticEvent.augmentClass(SyntheticCompositionEvent, CompositionEventInterface);

module.exports = SyntheticCompositionEvent;
},{"./SyntheticEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticEvent.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticDragEvent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticDragEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticMouseEvent = require('./SyntheticMouseEvent');

/**
 * @interface DragEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var DragEventInterface = {
  dataTransfer: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticDragEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticMouseEvent.augmentClass(SyntheticDragEvent, DragEventInterface);

module.exports = SyntheticDragEvent;
},{"./SyntheticMouseEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticMouseEvent.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticEvent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticEvent
 * @typechecks static-only
 */

'use strict';

var PooledClass = require('./PooledClass');

var assign = require('./Object.assign');
var emptyFunction = require('fbjs/lib/emptyFunction');
var warning = require('fbjs/lib/warning');

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var EventInterface = {
  type: null,
  target: null,
  // currentTarget is set when dispatching; no use in copying it here
  currentTarget: emptyFunction.thatReturnsNull,
  eventPhase: null,
  bubbles: null,
  cancelable: null,
  timeStamp: function (event) {
    return event.timeStamp || Date.now();
  },
  defaultPrevented: null,
  isTrusted: null
};

/**
 * Synthetic events are dispatched by event plugins, typically in response to a
 * top-level event delegation handler.
 *
 * These systems should generally use pooling to reduce the frequency of garbage
 * collection. The system should check `isPersistent` to determine whether the
 * event should be released into the pool after being dispatched. Users that
 * need a persisted event should invoke `persist`.
 *
 * Synthetic events (and subclasses) implement the DOM Level 3 Events API by
 * normalizing browser quirks. Subclasses do not necessarily have to implement a
 * DOM interface; custom application-specific events can also subclass this.
 *
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 */
function SyntheticEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  this.dispatchConfig = dispatchConfig;
  this.dispatchMarker = dispatchMarker;
  this.nativeEvent = nativeEvent;

  var Interface = this.constructor.Interface;
  for (var propName in Interface) {
    if (!Interface.hasOwnProperty(propName)) {
      continue;
    }
    var normalize = Interface[propName];
    if (normalize) {
      this[propName] = normalize(nativeEvent);
    } else {
      if (propName === 'target') {
        this.target = nativeEventTarget;
      } else {
        this[propName] = nativeEvent[propName];
      }
    }
  }

  var defaultPrevented = nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false;
  if (defaultPrevented) {
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  } else {
    this.isDefaultPrevented = emptyFunction.thatReturnsFalse;
  }
  this.isPropagationStopped = emptyFunction.thatReturnsFalse;
}

assign(SyntheticEvent.prototype, {

  preventDefault: function () {
    this.defaultPrevented = true;
    var event = this.nativeEvent;
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(event, 'This synthetic event is reused for performance reasons. If you\'re ' + 'seeing this, you\'re calling `preventDefault` on a ' + 'released/nullified synthetic event. This is a no-op. See ' + 'https://fb.me/react-event-pooling for more information.') : undefined;
    }
    if (!event) {
      return;
    }

    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  },

  stopPropagation: function () {
    var event = this.nativeEvent;
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(event, 'This synthetic event is reused for performance reasons. If you\'re ' + 'seeing this, you\'re calling `stopPropagation` on a ' + 'released/nullified synthetic event. This is a no-op. See ' + 'https://fb.me/react-event-pooling for more information.') : undefined;
    }
    if (!event) {
      return;
    }

    if (event.stopPropagation) {
      event.stopPropagation();
    } else {
      event.cancelBubble = true;
    }
    this.isPropagationStopped = emptyFunction.thatReturnsTrue;
  },

  /**
   * We release all dispatched `SyntheticEvent`s after each event loop, adding
   * them back into the pool. This allows a way to hold onto a reference that
   * won't be added back into the pool.
   */
  persist: function () {
    this.isPersistent = emptyFunction.thatReturnsTrue;
  },

  /**
   * Checks if this event should be released back into the pool.
   *
   * @return {boolean} True if this should not be released, false otherwise.
   */
  isPersistent: emptyFunction.thatReturnsFalse,

  /**
   * `PooledClass` looks for `destructor` on each instance it releases.
   */
  destructor: function () {
    var Interface = this.constructor.Interface;
    for (var propName in Interface) {
      this[propName] = null;
    }
    this.dispatchConfig = null;
    this.dispatchMarker = null;
    this.nativeEvent = null;
  }

});

SyntheticEvent.Interface = EventInterface;

/**
 * Helper to reduce boilerplate when creating subclasses.
 *
 * @param {function} Class
 * @param {?object} Interface
 */
SyntheticEvent.augmentClass = function (Class, Interface) {
  var Super = this;

  var prototype = Object.create(Super.prototype);
  assign(prototype, Class.prototype);
  Class.prototype = prototype;
  Class.prototype.constructor = Class;

  Class.Interface = assign({}, Super.Interface, Interface);
  Class.augmentClass = Super.augmentClass;

  PooledClass.addPoolingTo(Class, PooledClass.fourArgumentPooler);
};

PooledClass.addPoolingTo(SyntheticEvent, PooledClass.fourArgumentPooler);

module.exports = SyntheticEvent;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./PooledClass":"/home/ec2-user/ksana2015/node_modules/react/lib/PooledClass.js","fbjs/lib/emptyFunction":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyFunction.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticFocusEvent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticFocusEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticUIEvent = require('./SyntheticUIEvent');

/**
 * @interface FocusEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var FocusEventInterface = {
  relatedTarget: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticFocusEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticUIEvent.augmentClass(SyntheticFocusEvent, FocusEventInterface);

module.exports = SyntheticFocusEvent;
},{"./SyntheticUIEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticUIEvent.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticInputEvent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticInputEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticEvent = require('./SyntheticEvent');

/**
 * @interface Event
 * @see http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105
 *      /#events-inputevents
 */
var InputEventInterface = {
  data: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticInputEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticEvent.augmentClass(SyntheticInputEvent, InputEventInterface);

module.exports = SyntheticInputEvent;
},{"./SyntheticEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticEvent.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticKeyboardEvent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticKeyboardEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticUIEvent = require('./SyntheticUIEvent');

var getEventCharCode = require('./getEventCharCode');
var getEventKey = require('./getEventKey');
var getEventModifierState = require('./getEventModifierState');

/**
 * @interface KeyboardEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var KeyboardEventInterface = {
  key: getEventKey,
  location: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  repeat: null,
  locale: null,
  getModifierState: getEventModifierState,
  // Legacy Interface
  charCode: function (event) {
    // `charCode` is the result of a KeyPress event and represents the value of
    // the actual printable character.

    // KeyPress is deprecated, but its replacement is not yet final and not
    // implemented in any major browser. Only KeyPress has charCode.
    if (event.type === 'keypress') {
      return getEventCharCode(event);
    }
    return 0;
  },
  keyCode: function (event) {
    // `keyCode` is the result of a KeyDown/Up event and represents the value of
    // physical keyboard key.

    // The actual meaning of the value depends on the users' keyboard layout
    // which cannot be detected. Assuming that it is a US keyboard layout
    // provides a surprisingly accurate mapping for US and European users.
    // Due to this, it is left to the user to implement at this time.
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  },
  which: function (event) {
    // `which` is an alias for either `keyCode` or `charCode` depending on the
    // type of the event.
    if (event.type === 'keypress') {
      return getEventCharCode(event);
    }
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticKeyboardEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticUIEvent.augmentClass(SyntheticKeyboardEvent, KeyboardEventInterface);

module.exports = SyntheticKeyboardEvent;
},{"./SyntheticUIEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticUIEvent.js","./getEventCharCode":"/home/ec2-user/ksana2015/node_modules/react/lib/getEventCharCode.js","./getEventKey":"/home/ec2-user/ksana2015/node_modules/react/lib/getEventKey.js","./getEventModifierState":"/home/ec2-user/ksana2015/node_modules/react/lib/getEventModifierState.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticMouseEvent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticMouseEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticUIEvent = require('./SyntheticUIEvent');
var ViewportMetrics = require('./ViewportMetrics');

var getEventModifierState = require('./getEventModifierState');

/**
 * @interface MouseEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var MouseEventInterface = {
  screenX: null,
  screenY: null,
  clientX: null,
  clientY: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  getModifierState: getEventModifierState,
  button: function (event) {
    // Webkit, Firefox, IE9+
    // which:  1 2 3
    // button: 0 1 2 (standard)
    var button = event.button;
    if ('which' in event) {
      return button;
    }
    // IE<9
    // which:  undefined
    // button: 0 0 0
    // button: 1 4 2 (onmouseup)
    return button === 2 ? 2 : button === 4 ? 1 : 0;
  },
  buttons: null,
  relatedTarget: function (event) {
    return event.relatedTarget || (event.fromElement === event.srcElement ? event.toElement : event.fromElement);
  },
  // "Proprietary" Interface.
  pageX: function (event) {
    return 'pageX' in event ? event.pageX : event.clientX + ViewportMetrics.currentScrollLeft;
  },
  pageY: function (event) {
    return 'pageY' in event ? event.pageY : event.clientY + ViewportMetrics.currentScrollTop;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticMouseEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticUIEvent.augmentClass(SyntheticMouseEvent, MouseEventInterface);

module.exports = SyntheticMouseEvent;
},{"./SyntheticUIEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticUIEvent.js","./ViewportMetrics":"/home/ec2-user/ksana2015/node_modules/react/lib/ViewportMetrics.js","./getEventModifierState":"/home/ec2-user/ksana2015/node_modules/react/lib/getEventModifierState.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticTouchEvent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticTouchEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticUIEvent = require('./SyntheticUIEvent');

var getEventModifierState = require('./getEventModifierState');

/**
 * @interface TouchEvent
 * @see http://www.w3.org/TR/touch-events/
 */
var TouchEventInterface = {
  touches: null,
  targetTouches: null,
  changedTouches: null,
  altKey: null,
  metaKey: null,
  ctrlKey: null,
  shiftKey: null,
  getModifierState: getEventModifierState
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticTouchEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticUIEvent.augmentClass(SyntheticTouchEvent, TouchEventInterface);

module.exports = SyntheticTouchEvent;
},{"./SyntheticUIEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticUIEvent.js","./getEventModifierState":"/home/ec2-user/ksana2015/node_modules/react/lib/getEventModifierState.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticUIEvent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticUIEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticEvent = require('./SyntheticEvent');

var getEventTarget = require('./getEventTarget');

/**
 * @interface UIEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var UIEventInterface = {
  view: function (event) {
    if (event.view) {
      return event.view;
    }

    var target = getEventTarget(event);
    if (target != null && target.window === target) {
      // target is a window object
      return target;
    }

    var doc = target.ownerDocument;
    // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
    if (doc) {
      return doc.defaultView || doc.parentWindow;
    } else {
      return window;
    }
  },
  detail: function (event) {
    return event.detail || 0;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
function SyntheticUIEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticEvent.augmentClass(SyntheticUIEvent, UIEventInterface);

module.exports = SyntheticUIEvent;
},{"./SyntheticEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticEvent.js","./getEventTarget":"/home/ec2-user/ksana2015/node_modules/react/lib/getEventTarget.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticWheelEvent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticWheelEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticMouseEvent = require('./SyntheticMouseEvent');

/**
 * @interface WheelEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var WheelEventInterface = {
  deltaX: function (event) {
    return 'deltaX' in event ? event.deltaX :
    // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
    'wheelDeltaX' in event ? -event.wheelDeltaX : 0;
  },
  deltaY: function (event) {
    return 'deltaY' in event ? event.deltaY :
    // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
    'wheelDeltaY' in event ? -event.wheelDeltaY :
    // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
    'wheelDelta' in event ? -event.wheelDelta : 0;
  },
  deltaZ: null,

  // Browsers without "deltaMode" is reporting in raw wheel delta where one
  // notch on the scroll is always +/- 120, roughly equivalent to pixels.
  // A good approximation of DOM_DELTA_LINE (1) is 5% of viewport size or
  // ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5% of viewport size.
  deltaMode: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticMouseEvent}
 */
function SyntheticWheelEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticMouseEvent.augmentClass(SyntheticWheelEvent, WheelEventInterface);

module.exports = SyntheticWheelEvent;
},{"./SyntheticMouseEvent":"/home/ec2-user/ksana2015/node_modules/react/lib/SyntheticMouseEvent.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/Transaction.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Transaction
 */

'use strict';

var invariant = require('fbjs/lib/invariant');

/**
 * `Transaction` creates a black box that is able to wrap any method such that
 * certain invariants are maintained before and after the method is invoked
 * (Even if an exception is thrown while invoking the wrapped method). Whoever
 * instantiates a transaction can provide enforcers of the invariants at
 * creation time. The `Transaction` class itself will supply one additional
 * automatic invariant for you - the invariant that any transaction instance
 * should not be run while it is already being run. You would typically create a
 * single instance of a `Transaction` for reuse multiple times, that potentially
 * is used to wrap several different methods. Wrappers are extremely simple -
 * they only require implementing two methods.
 *
 * <pre>
 *                       wrappers (injected at creation time)
 *                                      +        +
 *                                      |        |
 *                    +-----------------|--------|--------------+
 *                    |                 v        |              |
 *                    |      +---------------+   |              |
 *                    |   +--|    wrapper1   |---|----+         |
 *                    |   |  +---------------+   v    |         |
 *                    |   |          +-------------+  |         |
 *                    |   |     +----|   wrapper2  |--------+   |
 *                    |   |     |    +-------------+  |     |   |
 *                    |   |     |                     |     |   |
 *                    |   v     v                     v     v   | wrapper
 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | +---+ +---+   +---------+   +---+ +---+ |
 *                    |  initialize                    close    |
 *                    +-----------------------------------------+
 * </pre>
 *
 * Use cases:
 * - Preserving the input selection ranges before/after reconciliation.
 *   Restoring selection even in the event of an unexpected error.
 * - Deactivating events while rearranging the DOM, preventing blurs/focuses,
 *   while guaranteeing that afterwards, the event system is reactivated.
 * - Flushing a queue of collected DOM mutations to the main UI thread after a
 *   reconciliation takes place in a worker thread.
 * - Invoking any collected `componentDidUpdate` callbacks after rendering new
 *   content.
 * - (Future use case): Wrapping particular flushes of the `ReactWorker` queue
 *   to preserve the `scrollTop` (an automatic scroll aware DOM).
 * - (Future use case): Layout calculations before and after DOM updates.
 *
 * Transactional plugin API:
 * - A module that has an `initialize` method that returns any precomputation.
 * - and a `close` method that accepts the precomputation. `close` is invoked
 *   when the wrapped process is completed, or has failed.
 *
 * @param {Array<TransactionalWrapper>} transactionWrapper Wrapper modules
 * that implement `initialize` and `close`.
 * @return {Transaction} Single transaction for reuse in thread.
 *
 * @class Transaction
 */
var Mixin = {
  /**
   * Sets up this instance so that it is prepared for collecting metrics. Does
   * so such that this setup method may be used on an instance that is already
   * initialized, in a way that does not consume additional memory upon reuse.
   * That can be useful if you decide to make your subclass of this mixin a
   * "PooledClass".
   */
  reinitializeTransaction: function () {
    this.transactionWrappers = this.getTransactionWrappers();
    if (this.wrapperInitData) {
      this.wrapperInitData.length = 0;
    } else {
      this.wrapperInitData = [];
    }
    this._isInTransaction = false;
  },

  _isInTransaction: false,

  /**
   * @abstract
   * @return {Array<TransactionWrapper>} Array of transaction wrappers.
   */
  getTransactionWrappers: null,

  isInTransaction: function () {
    return !!this._isInTransaction;
  },

  /**
   * Executes the function within a safety window. Use this for the top level
   * methods that result in large amounts of computation/mutations that would
   * need to be safety checked. The optional arguments helps prevent the need
   * to bind in many cases.
   *
   * @param {function} method Member of scope to call.
   * @param {Object} scope Scope to invoke from.
   * @param {Object?=} a Argument to pass to the method.
   * @param {Object?=} b Argument to pass to the method.
   * @param {Object?=} c Argument to pass to the method.
   * @param {Object?=} d Argument to pass to the method.
   * @param {Object?=} e Argument to pass to the method.
   * @param {Object?=} f Argument to pass to the method.
   *
   * @return {*} Return value from `method`.
   */
  perform: function (method, scope, a, b, c, d, e, f) {
    !!this.isInTransaction() ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Transaction.perform(...): Cannot initialize a transaction when there ' + 'is already an outstanding transaction.') : invariant(false) : undefined;
    var errorThrown;
    var ret;
    try {
      this._isInTransaction = true;
      // Catching errors makes debugging more difficult, so we start with
      // errorThrown set to true before setting it to false after calling
      // close -- if it's still set to true in the finally block, it means
      // one of these calls threw.
      errorThrown = true;
      this.initializeAll(0);
      ret = method.call(scope, a, b, c, d, e, f);
      errorThrown = false;
    } finally {
      try {
        if (errorThrown) {
          // If `method` throws, prefer to show that stack trace over any thrown
          // by invoking `closeAll`.
          try {
            this.closeAll(0);
          } catch (err) {}
        } else {
          // Since `method` didn't throw, we don't want to silence the exception
          // here.
          this.closeAll(0);
        }
      } finally {
        this._isInTransaction = false;
      }
    }
    return ret;
  },

  initializeAll: function (startIndex) {
    var transactionWrappers = this.transactionWrappers;
    for (var i = startIndex; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];
      try {
        // Catching errors makes debugging more difficult, so we start with the
        // OBSERVED_ERROR state before overwriting it with the real return value
        // of initialize -- if it's still set to OBSERVED_ERROR in the finally
        // block, it means wrapper.initialize threw.
        this.wrapperInitData[i] = Transaction.OBSERVED_ERROR;
        this.wrapperInitData[i] = wrapper.initialize ? wrapper.initialize.call(this) : null;
      } finally {
        if (this.wrapperInitData[i] === Transaction.OBSERVED_ERROR) {
          // The initializer for wrapper i threw an error; initialize the
          // remaining wrappers but silence any exceptions from them to ensure
          // that the first error is the one to bubble up.
          try {
            this.initializeAll(i + 1);
          } catch (err) {}
        }
      }
    }
  },

  /**
   * Invokes each of `this.transactionWrappers.close[i]` functions, passing into
   * them the respective return values of `this.transactionWrappers.init[i]`
   * (`close`rs that correspond to initializers that failed will not be
   * invoked).
   */
  closeAll: function (startIndex) {
    !this.isInTransaction() ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Transaction.closeAll(): Cannot close transaction when none are open.') : invariant(false) : undefined;
    var transactionWrappers = this.transactionWrappers;
    for (var i = startIndex; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];
      var initData = this.wrapperInitData[i];
      var errorThrown;
      try {
        // Catching errors makes debugging more difficult, so we start with
        // errorThrown set to true before setting it to false after calling
        // close -- if it's still set to true in the finally block, it means
        // wrapper.close threw.
        errorThrown = true;
        if (initData !== Transaction.OBSERVED_ERROR && wrapper.close) {
          wrapper.close.call(this, initData);
        }
        errorThrown = false;
      } finally {
        if (errorThrown) {
          // The closer for wrapper i threw an error; close the remaining
          // wrappers but silence any exceptions from them to ensure that the
          // first error is the one to bubble up.
          try {
            this.closeAll(i + 1);
          } catch (e) {}
        }
      }
    }
    this.wrapperInitData.length = 0;
  }
};

var Transaction = {

  Mixin: Mixin,

  /**
   * Token to look for to determine if an error occurred.
   */
  OBSERVED_ERROR: {}

};

module.exports = Transaction;
},{"fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/ViewportMetrics.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ViewportMetrics
 */

'use strict';

var ViewportMetrics = {

  currentScrollLeft: 0,

  currentScrollTop: 0,

  refreshScrollValues: function (scrollPosition) {
    ViewportMetrics.currentScrollLeft = scrollPosition.x;
    ViewportMetrics.currentScrollTop = scrollPosition.y;
  }

};

module.exports = ViewportMetrics;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/accumulateInto.js":[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule accumulateInto
 */

'use strict';

var invariant = require('fbjs/lib/invariant');

/**
 *
 * Accumulates items that must not be null or undefined into the first one. This
 * is used to conserve memory by avoiding array allocations, and thus sacrifices
 * API cleanness. Since `current` can be null before being passed in and not
 * null after this function, make sure to assign it back to `current`:
 *
 * `a = accumulateInto(a, b);`
 *
 * This API should be sparingly used. Try `accumulate` for something cleaner.
 *
 * @return {*|array<*>} An accumulation of items.
 */

function accumulateInto(current, next) {
  !(next != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'accumulateInto(...): Accumulated items must not be null or undefined.') : invariant(false) : undefined;
  if (current == null) {
    return next;
  }

  // Both are not empty. Warning: Never call x.concat(y) when you are not
  // certain that x is an Array (x could be a string with concat method).
  var currentIsArray = Array.isArray(current);
  var nextIsArray = Array.isArray(next);

  if (currentIsArray && nextIsArray) {
    current.push.apply(current, next);
    return current;
  }

  if (currentIsArray) {
    current.push(next);
    return current;
  }

  if (nextIsArray) {
    // A bit too dangerous to mutate `next`.
    return [current].concat(next);
  }

  return [current, next];
}

module.exports = accumulateInto;
},{"fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/adler32.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule adler32
 */

'use strict';

var MOD = 65521;

// adler32 is not cryptographically strong, and is only used to sanity check that
// markup generated on the server matches the markup generated on the client.
// This implementation (a modified version of the SheetJS version) has been optimized
// for our use case, at the expense of conforming to the adler32 specification
// for non-ascii inputs.
function adler32(data) {
  var a = 1;
  var b = 0;
  var i = 0;
  var l = data.length;
  var m = l & ~0x3;
  while (i < m) {
    for (; i < Math.min(i + 4096, m); i += 4) {
      b += (a += data.charCodeAt(i)) + (a += data.charCodeAt(i + 1)) + (a += data.charCodeAt(i + 2)) + (a += data.charCodeAt(i + 3));
    }
    a %= MOD;
    b %= MOD;
  }
  for (; i < l; i++) {
    b += a += data.charCodeAt(i);
  }
  a %= MOD;
  b %= MOD;
  return a | b << 16;
}

module.exports = adler32;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/canDefineProperty.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule canDefineProperty
 */

'use strict';

var canDefineProperty = false;
if (process.env.NODE_ENV !== 'production') {
  try {
    Object.defineProperty({}, 'x', { get: function () {} });
    canDefineProperty = true;
  } catch (x) {
    // IE will fail on defineProperty
  }
}

module.exports = canDefineProperty;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/dangerousStyleValue.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule dangerousStyleValue
 * @typechecks static-only
 */

'use strict';

var CSSProperty = require('./CSSProperty');

var isUnitlessNumber = CSSProperty.isUnitlessNumber;

/**
 * Convert a value into the proper css writable value. The style name `name`
 * should be logical (no hyphens), as specified
 * in `CSSProperty.isUnitlessNumber`.
 *
 * @param {string} name CSS property name such as `topMargin`.
 * @param {*} value CSS property value such as `10px`.
 * @return {string} Normalized style value with dimensions applied.
 */
function dangerousStyleValue(name, value) {
  // Note that we've removed escapeTextForBrowser() calls here since the
  // whole string will be escaped when the attribute is injected into
  // the markup. If you provide unsafe user data here they can inject
  // arbitrary CSS which may be problematic (I couldn't repro this):
  // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
  // http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
  // This is not an XSS hole but instead a potential CSS injection issue
  // which has lead to a greater discussion about how we're going to
  // trust URLs moving forward. See #2115901

  var isEmpty = value == null || typeof value === 'boolean' || value === '';
  if (isEmpty) {
    return '';
  }

  var isNonNumeric = isNaN(value);
  if (isNonNumeric || value === 0 || isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name]) {
    return '' + value; // cast to string
  }

  if (typeof value === 'string') {
    value = value.trim();
  }
  return value + 'px';
}

module.exports = dangerousStyleValue;
},{"./CSSProperty":"/home/ec2-user/ksana2015/node_modules/react/lib/CSSProperty.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/deprecated.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule deprecated
 */

'use strict';

var assign = require('./Object.assign');
var warning = require('fbjs/lib/warning');

/**
 * This will log a single deprecation notice per function and forward the call
 * on to the new API.
 *
 * @param {string} fnName The name of the function
 * @param {string} newModule The module that fn will exist in
 * @param {string} newPackage The module that fn will exist in
 * @param {*} ctx The context this forwarded call should run in
 * @param {function} fn The function to forward on to
 * @return {function} The function that will warn once and then call fn
 */
function deprecated(fnName, newModule, newPackage, ctx, fn) {
  var warned = false;
  if (process.env.NODE_ENV !== 'production') {
    var newFn = function () {
      process.env.NODE_ENV !== 'production' ? warning(warned,
      // Require examples in this string must be split to prevent React's
      // build tools from mistaking them for real requires.
      // Otherwise the build tools will attempt to build a '%s' module.
      'React.%s is deprecated. Please use %s.%s from require' + '(\'%s\') ' + 'instead.', fnName, newModule, fnName, newPackage) : undefined;
      warned = true;
      return fn.apply(ctx, arguments);
    };
    // We need to make sure all properties of the original fn are copied over.
    // In particular, this is needed to support PropTypes
    return assign(newFn, fn);
  }

  return fn;
}

module.exports = deprecated;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/escapeTextContentForBrowser.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule escapeTextContentForBrowser
 */

'use strict';

var ESCAPE_LOOKUP = {
  '&': '&amp;',
  '>': '&gt;',
  '<': '&lt;',
  '"': '&quot;',
  '\'': '&#x27;'
};

var ESCAPE_REGEX = /[&><"']/g;

function escaper(match) {
  return ESCAPE_LOOKUP[match];
}

/**
 * Escapes text to prevent scripting attacks.
 *
 * @param {*} text Text value to escape.
 * @return {string} An escaped string.
 */
function escapeTextContentForBrowser(text) {
  return ('' + text).replace(ESCAPE_REGEX, escaper);
}

module.exports = escapeTextContentForBrowser;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/findDOMNode.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule findDOMNode
 * @typechecks static-only
 */

'use strict';

var ReactCurrentOwner = require('./ReactCurrentOwner');
var ReactInstanceMap = require('./ReactInstanceMap');
var ReactMount = require('./ReactMount');

var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

/**
 * Returns the DOM node rendered by this element.
 *
 * @param {ReactComponent|DOMElement} componentOrElement
 * @return {?DOMElement} The root node of this element.
 */
function findDOMNode(componentOrElement) {
  if (process.env.NODE_ENV !== 'production') {
    var owner = ReactCurrentOwner.current;
    if (owner !== null) {
      process.env.NODE_ENV !== 'production' ? warning(owner._warnedAboutRefsInRender, '%s is accessing getDOMNode or findDOMNode inside its render(). ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', owner.getName() || 'A component') : undefined;
      owner._warnedAboutRefsInRender = true;
    }
  }
  if (componentOrElement == null) {
    return null;
  }
  if (componentOrElement.nodeType === 1) {
    return componentOrElement;
  }
  if (ReactInstanceMap.has(componentOrElement)) {
    return ReactMount.getNodeFromInstance(componentOrElement);
  }
  !(componentOrElement.render == null || typeof componentOrElement.render !== 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'findDOMNode was called on an unmounted component.') : invariant(false) : undefined;
  !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Element appears to be neither ReactComponent nor DOMNode (keys: %s)', Object.keys(componentOrElement)) : invariant(false) : undefined;
}

module.exports = findDOMNode;
},{"./ReactCurrentOwner":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactCurrentOwner.js","./ReactInstanceMap":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInstanceMap.js","./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/flattenChildren.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule flattenChildren
 */

'use strict';

var traverseAllChildren = require('./traverseAllChildren');
var warning = require('fbjs/lib/warning');

/**
 * @param {function} traverseContext Context passed through traversal.
 * @param {?ReactComponent} child React child component.
 * @param {!string} name String name of key path to child.
 */
function flattenSingleChildIntoContext(traverseContext, child, name) {
  // We found a component instance.
  var result = traverseContext;
  var keyUnique = result[name] === undefined;
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_ENV !== 'production' ? warning(keyUnique, 'flattenChildren(...): Encountered two children with the same key, ' + '`%s`. Child keys must be unique; when two children share a key, only ' + 'the first child will be used.', name) : undefined;
  }
  if (keyUnique && child != null) {
    result[name] = child;
  }
}

/**
 * Flattens children that are typically specified as `props.children`. Any null
 * children will not be included in the resulting object.
 * @return {!object} flattened children keyed by name.
 */
function flattenChildren(children) {
  if (children == null) {
    return children;
  }
  var result = {};
  traverseAllChildren(children, flattenSingleChildIntoContext, result);
  return result;
}

module.exports = flattenChildren;
},{"./traverseAllChildren":"/home/ec2-user/ksana2015/node_modules/react/lib/traverseAllChildren.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/forEachAccumulated.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule forEachAccumulated
 */

'use strict';

/**
 * @param {array} arr an "accumulation" of items which is either an Array or
 * a single item. Useful when paired with the `accumulate` module. This is a
 * simple utility that allows us to reason about a collection of items, but
 * handling the case when there is exactly one item (and we do not need to
 * allocate an array).
 */
var forEachAccumulated = function (arr, cb, scope) {
  if (Array.isArray(arr)) {
    arr.forEach(cb, scope);
  } else if (arr) {
    cb.call(scope, arr);
  }
};

module.exports = forEachAccumulated;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/getEventCharCode.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventCharCode
 * @typechecks static-only
 */

'use strict';

/**
 * `charCode` represents the actual "character code" and is safe to use with
 * `String.fromCharCode`. As such, only keys that correspond to printable
 * characters produce a valid `charCode`, the only exception to this is Enter.
 * The Tab-key is considered non-printable and does not have a `charCode`,
 * presumably because it does not produce a tab-character in browsers.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {number} Normalized `charCode` property.
 */
function getEventCharCode(nativeEvent) {
  var charCode;
  var keyCode = nativeEvent.keyCode;

  if ('charCode' in nativeEvent) {
    charCode = nativeEvent.charCode;

    // FF does not set `charCode` for the Enter-key, check against `keyCode`.
    if (charCode === 0 && keyCode === 13) {
      charCode = 13;
    }
  } else {
    // IE8 does not implement `charCode`, but `keyCode` has the correct value.
    charCode = keyCode;
  }

  // Some non-printable keys are reported in `charCode`/`keyCode`, discard them.
  // Must not discard the (non-)printable Enter-key.
  if (charCode >= 32 || charCode === 13) {
    return charCode;
  }

  return 0;
}

module.exports = getEventCharCode;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/getEventKey.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventKey
 * @typechecks static-only
 */

'use strict';

var getEventCharCode = require('./getEventCharCode');

/**
 * Normalization of deprecated HTML5 `key` values
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var normalizeKey = {
  'Esc': 'Escape',
  'Spacebar': ' ',
  'Left': 'ArrowLeft',
  'Up': 'ArrowUp',
  'Right': 'ArrowRight',
  'Down': 'ArrowDown',
  'Del': 'Delete',
  'Win': 'OS',
  'Menu': 'ContextMenu',
  'Apps': 'ContextMenu',
  'Scroll': 'ScrollLock',
  'MozPrintableKey': 'Unidentified'
};

/**
 * Translation from legacy `keyCode` to HTML5 `key`
 * Only special keys supported, all others depend on keyboard layout or browser
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var translateToKey = {
  8: 'Backspace',
  9: 'Tab',
  12: 'Clear',
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  19: 'Pause',
  20: 'CapsLock',
  27: 'Escape',
  32: ' ',
  33: 'PageUp',
  34: 'PageDown',
  35: 'End',
  36: 'Home',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  45: 'Insert',
  46: 'Delete',
  112: 'F1', 113: 'F2', 114: 'F3', 115: 'F4', 116: 'F5', 117: 'F6',
  118: 'F7', 119: 'F8', 120: 'F9', 121: 'F10', 122: 'F11', 123: 'F12',
  144: 'NumLock',
  145: 'ScrollLock',
  224: 'Meta'
};

/**
 * @param {object} nativeEvent Native browser event.
 * @return {string} Normalized `key` property.
 */
function getEventKey(nativeEvent) {
  if (nativeEvent.key) {
    // Normalize inconsistent values reported by browsers due to
    // implementations of a working draft specification.

    // FireFox implements `key` but returns `MozPrintableKey` for all
    // printable characters (normalized to `Unidentified`), ignore it.
    var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
    if (key !== 'Unidentified') {
      return key;
    }
  }

  // Browser does not implement `key`, polyfill as much of it as we can.
  if (nativeEvent.type === 'keypress') {
    var charCode = getEventCharCode(nativeEvent);

    // The enter-key is technically both printable and non-printable and can
    // thus be captured by `keypress`, no other non-printable key should.
    return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
  }
  if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
    // While user keyboard layout determines the actual meaning of each
    // `keyCode` value, almost all function keys have a universal value.
    return translateToKey[nativeEvent.keyCode] || 'Unidentified';
  }
  return '';
}

module.exports = getEventKey;
},{"./getEventCharCode":"/home/ec2-user/ksana2015/node_modules/react/lib/getEventCharCode.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/getEventModifierState.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventModifierState
 * @typechecks static-only
 */

'use strict';

/**
 * Translation from modifier key to the associated property in the event.
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#keys-Modifiers
 */

var modifierKeyToProp = {
  'Alt': 'altKey',
  'Control': 'ctrlKey',
  'Meta': 'metaKey',
  'Shift': 'shiftKey'
};

// IE8 does not implement getModifierState so we simply map it to the only
// modifier keys exposed by the event itself, does not support Lock-keys.
// Currently, all major browsers except Chrome seems to support Lock-keys.
function modifierStateGetter(keyArg) {
  var syntheticEvent = this;
  var nativeEvent = syntheticEvent.nativeEvent;
  if (nativeEvent.getModifierState) {
    return nativeEvent.getModifierState(keyArg);
  }
  var keyProp = modifierKeyToProp[keyArg];
  return keyProp ? !!nativeEvent[keyProp] : false;
}

function getEventModifierState(nativeEvent) {
  return modifierStateGetter;
}

module.exports = getEventModifierState;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/getEventTarget.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventTarget
 * @typechecks static-only
 */

'use strict';

/**
 * Gets the target node from a native browser event by accounting for
 * inconsistencies in browser DOM APIs.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {DOMEventTarget} Target node.
 */
function getEventTarget(nativeEvent) {
  var target = nativeEvent.target || nativeEvent.srcElement || window;
  // Safari may fire events on text nodes (Node.TEXT_NODE is 3).
  // @see http://www.quirksmode.org/js/events_properties.html
  return target.nodeType === 3 ? target.parentNode : target;
}

module.exports = getEventTarget;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/getIteratorFn.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getIteratorFn
 * @typechecks static-only
 */

'use strict';

/* global Symbol */
var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

/**
 * Returns the iterator method function contained on the iterable object.
 *
 * Be sure to invoke the function with the iterable as context:
 *
 *     var iteratorFn = getIteratorFn(myIterable);
 *     if (iteratorFn) {
 *       var iterator = iteratorFn.call(myIterable);
 *       ...
 *     }
 *
 * @param {?object} maybeIterable
 * @return {?function}
 */
function getIteratorFn(maybeIterable) {
  var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}

module.exports = getIteratorFn;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/getNodeForCharacterOffset.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getNodeForCharacterOffset
 */

'use strict';

/**
 * Given any node return the first leaf node without children.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {DOMElement|DOMTextNode}
 */
function getLeafNode(node) {
  while (node && node.firstChild) {
    node = node.firstChild;
  }
  return node;
}

/**
 * Get the next sibling within a container. This will walk up the
 * DOM if a node's siblings have been exhausted.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {?DOMElement|DOMTextNode}
 */
function getSiblingNode(node) {
  while (node) {
    if (node.nextSibling) {
      return node.nextSibling;
    }
    node = node.parentNode;
  }
}

/**
 * Get object describing the nodes which contain characters at offset.
 *
 * @param {DOMElement|DOMTextNode} root
 * @param {number} offset
 * @return {?object}
 */
function getNodeForCharacterOffset(root, offset) {
  var node = getLeafNode(root);
  var nodeStart = 0;
  var nodeEnd = 0;

  while (node) {
    if (node.nodeType === 3) {
      nodeEnd = nodeStart + node.textContent.length;

      if (nodeStart <= offset && nodeEnd >= offset) {
        return {
          node: node,
          offset: offset - nodeStart
        };
      }

      nodeStart = nodeEnd;
    }

    node = getLeafNode(getSiblingNode(node));
  }
}

module.exports = getNodeForCharacterOffset;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/getTextContentAccessor.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getTextContentAccessor
 */

'use strict';

var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');

var contentKey = null;

/**
 * Gets the key used to access text content on a DOM node.
 *
 * @return {?string} Key used to access text content.
 * @internal
 */
function getTextContentAccessor() {
  if (!contentKey && ExecutionEnvironment.canUseDOM) {
    // Prefer textContent to innerText because many browsers support both but
    // SVG <text> elements don't support innerText even when <div> does.
    contentKey = 'textContent' in document.documentElement ? 'textContent' : 'innerText';
  }
  return contentKey;
}

module.exports = getTextContentAccessor;
},{"fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/instantiateReactComponent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule instantiateReactComponent
 * @typechecks static-only
 */

'use strict';

var ReactCompositeComponent = require('./ReactCompositeComponent');
var ReactEmptyComponent = require('./ReactEmptyComponent');
var ReactNativeComponent = require('./ReactNativeComponent');

var assign = require('./Object.assign');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

// To avoid a cyclic dependency, we create the final class in this module
var ReactCompositeComponentWrapper = function () {};
assign(ReactCompositeComponentWrapper.prototype, ReactCompositeComponent.Mixin, {
  _instantiateReactComponent: instantiateReactComponent
});

function getDeclarationErrorAddendum(owner) {
  if (owner) {
    var name = owner.getName();
    if (name) {
      return ' Check the render method of `' + name + '`.';
    }
  }
  return '';
}

/**
 * Check if the type reference is a known internal type. I.e. not a user
 * provided composite type.
 *
 * @param {function} type
 * @return {boolean} Returns true if this is a valid internal type.
 */
function isInternalComponentType(type) {
  return typeof type === 'function' && typeof type.prototype !== 'undefined' && typeof type.prototype.mountComponent === 'function' && typeof type.prototype.receiveComponent === 'function';
}

/**
 * Given a ReactNode, create an instance that will actually be mounted.
 *
 * @param {ReactNode} node
 * @return {object} A new instance of the element's constructor.
 * @protected
 */
function instantiateReactComponent(node) {
  var instance;

  if (node === null || node === false) {
    instance = new ReactEmptyComponent(instantiateReactComponent);
  } else if (typeof node === 'object') {
    var element = node;
    !(element && (typeof element.type === 'function' || typeof element.type === 'string')) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Element type is invalid: expected a string (for built-in components) ' + 'or a class/function (for composite components) but got: %s.%s', element.type == null ? element.type : typeof element.type, getDeclarationErrorAddendum(element._owner)) : invariant(false) : undefined;

    // Special case string values
    if (typeof element.type === 'string') {
      instance = ReactNativeComponent.createInternalComponent(element);
    } else if (isInternalComponentType(element.type)) {
      // This is temporarily available for custom components that are not string
      // representations. I.e. ART. Once those are updated to use the string
      // representation, we can drop this code path.
      instance = new element.type(element);
    } else {
      instance = new ReactCompositeComponentWrapper();
    }
  } else if (typeof node === 'string' || typeof node === 'number') {
    instance = ReactNativeComponent.createInstanceForText(node);
  } else {
    !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Encountered invalid React node of type %s', typeof node) : invariant(false) : undefined;
  }

  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_ENV !== 'production' ? warning(typeof instance.construct === 'function' && typeof instance.mountComponent === 'function' && typeof instance.receiveComponent === 'function' && typeof instance.unmountComponent === 'function', 'Only React Components can be mounted.') : undefined;
  }

  // Sets up the instance. This can probably just move into the constructor now.
  instance.construct(node);

  // These two fields are used by the DOM and ART diffing algorithms
  // respectively. Instead of using expandos on components, we should be
  // storing the state needed by the diffing algorithms elsewhere.
  instance._mountIndex = 0;
  instance._mountImage = null;

  if (process.env.NODE_ENV !== 'production') {
    instance._isOwnerNecessary = false;
    instance._warnedAboutRefsInRender = false;
  }

  // Internal instances should fully constructed at this point, so they should
  // not get any new fields added to them at this point.
  if (process.env.NODE_ENV !== 'production') {
    if (Object.preventExtensions) {
      Object.preventExtensions(instance);
    }
  }

  return instance;
}

module.exports = instantiateReactComponent;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","./ReactCompositeComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactCompositeComponent.js","./ReactEmptyComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactEmptyComponent.js","./ReactNativeComponent":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactNativeComponent.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/isEventSupported.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isEventSupported
 */

'use strict';

var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');

var useHasFeature;
if (ExecutionEnvironment.canUseDOM) {
  useHasFeature = document.implementation && document.implementation.hasFeature &&
  // always returns true in newer browsers as per the standard.
  // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
  document.implementation.hasFeature('', '') !== true;
}

/**
 * Checks if an event is supported in the current execution environment.
 *
 * NOTE: This will not work correctly for non-generic events such as `change`,
 * `reset`, `load`, `error`, and `select`.
 *
 * Borrows from Modernizr.
 *
 * @param {string} eventNameSuffix Event name, e.g. "click".
 * @param {?boolean} capture Check if the capture phase is supported.
 * @return {boolean} True if the event is supported.
 * @internal
 * @license Modernizr 3.0.0pre (Custom Build) | MIT
 */
function isEventSupported(eventNameSuffix, capture) {
  if (!ExecutionEnvironment.canUseDOM || capture && !('addEventListener' in document)) {
    return false;
  }

  var eventName = 'on' + eventNameSuffix;
  var isSupported = (eventName in document);

  if (!isSupported) {
    var element = document.createElement('div');
    element.setAttribute(eventName, 'return;');
    isSupported = typeof element[eventName] === 'function';
  }

  if (!isSupported && useHasFeature && eventNameSuffix === 'wheel') {
    // This is the only way to test support for the `wheel` event in IE9+.
    isSupported = document.implementation.hasFeature('Events.wheel', '3.0');
  }

  return isSupported;
}

module.exports = isEventSupported;
},{"fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/isTextInputElement.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isTextInputElement
 */

'use strict';

/**
 * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary
 */
var supportedInputTypes = {
  'color': true,
  'date': true,
  'datetime': true,
  'datetime-local': true,
  'email': true,
  'month': true,
  'number': true,
  'password': true,
  'range': true,
  'search': true,
  'tel': true,
  'text': true,
  'time': true,
  'url': true,
  'week': true
};

function isTextInputElement(elem) {
  var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
  return nodeName && (nodeName === 'input' && supportedInputTypes[elem.type] || nodeName === 'textarea');
}

module.exports = isTextInputElement;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/onlyChild.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule onlyChild
 */
'use strict';

var ReactElement = require('./ReactElement');

var invariant = require('fbjs/lib/invariant');

/**
 * Returns the first child in a collection of children and verifies that there
 * is only one child in the collection. The current implementation of this
 * function assumes that a single child gets passed without a wrapper, but the
 * purpose of this helper function is to abstract away the particular structure
 * of children.
 *
 * @param {?object} children Child collection structure.
 * @return {ReactComponent} The first and only `ReactComponent` contained in the
 * structure.
 */
function onlyChild(children) {
  !ReactElement.isValidElement(children) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'onlyChild must be passed a children with exactly one child.') : invariant(false) : undefined;
  return children;
}

module.exports = onlyChild;
},{"./ReactElement":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/quoteAttributeValueForBrowser.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule quoteAttributeValueForBrowser
 */

'use strict';

var escapeTextContentForBrowser = require('./escapeTextContentForBrowser');

/**
 * Escapes attribute value to prevent scripting attacks.
 *
 * @param {*} value Value to escape.
 * @return {string} An escaped string.
 */
function quoteAttributeValueForBrowser(value) {
  return '"' + escapeTextContentForBrowser(value) + '"';
}

module.exports = quoteAttributeValueForBrowser;
},{"./escapeTextContentForBrowser":"/home/ec2-user/ksana2015/node_modules/react/lib/escapeTextContentForBrowser.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/renderSubtreeIntoContainer.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
* @providesModule renderSubtreeIntoContainer
*/

'use strict';

var ReactMount = require('./ReactMount');

module.exports = ReactMount.renderSubtreeIntoContainer;
},{"./ReactMount":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactMount.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/setInnerHTML.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule setInnerHTML
 */

/* globals MSApp */

'use strict';

var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');

var WHITESPACE_TEST = /^[ \r\n\t\f]/;
var NONVISIBLE_TEST = /<(!--|link|noscript|meta|script|style)[ \r\n\t\f\/>]/;

/**
 * Set the innerHTML property of a node, ensuring that whitespace is preserved
 * even in IE8.
 *
 * @param {DOMElement} node
 * @param {string} html
 * @internal
 */
var setInnerHTML = function (node, html) {
  node.innerHTML = html;
};

// Win8 apps: Allow all html to be inserted
if (typeof MSApp !== 'undefined' && MSApp.execUnsafeLocalFunction) {
  setInnerHTML = function (node, html) {
    MSApp.execUnsafeLocalFunction(function () {
      node.innerHTML = html;
    });
  };
}

if (ExecutionEnvironment.canUseDOM) {
  // IE8: When updating a just created node with innerHTML only leading
  // whitespace is removed. When updating an existing node with innerHTML
  // whitespace in root TextNodes is also collapsed.
  // @see quirksmode.org/bugreports/archives/2004/11/innerhtml_and_t.html

  // Feature detection; only IE8 is known to behave improperly like this.
  var testElement = document.createElement('div');
  testElement.innerHTML = ' ';
  if (testElement.innerHTML === '') {
    setInnerHTML = function (node, html) {
      // Magic theory: IE8 supposedly differentiates between added and updated
      // nodes when processing innerHTML, innerHTML on updated nodes suffers
      // from worse whitespace behavior. Re-adding a node like this triggers
      // the initial and more favorable whitespace behavior.
      // TODO: What to do on a detached node?
      if (node.parentNode) {
        node.parentNode.replaceChild(node, node);
      }

      // We also implement a workaround for non-visible tags disappearing into
      // thin air on IE8, this only happens if there is no visible text
      // in-front of the non-visible tags. Piggyback on the whitespace fix
      // and simply check if any non-visible tags appear in the source.
      if (WHITESPACE_TEST.test(html) || html[0] === '<' && NONVISIBLE_TEST.test(html)) {
        // Recover leading whitespace by temporarily prepending any character.
        // \uFEFF has the potential advantage of being zero-width/invisible.
        // UglifyJS drops U+FEFF chars when parsing, so use String.fromCharCode
        // in hopes that this is preserved even if "\uFEFF" is transformed to
        // the actual Unicode character (by Babel, for example).
        // https://github.com/mishoo/UglifyJS2/blob/v2.4.20/lib/parse.js#L216
        node.innerHTML = String.fromCharCode(0xFEFF) + html;

        // deleteData leaves an empty `TextNode` which offsets the index of all
        // children. Definitely want to avoid this.
        var textNode = node.firstChild;
        if (textNode.data.length === 1) {
          node.removeChild(textNode);
        } else {
          textNode.deleteData(0, 1);
        }
      } else {
        node.innerHTML = html;
      }
    };
  }
}

module.exports = setInnerHTML;
},{"fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/setTextContent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule setTextContent
 */

'use strict';

var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');
var escapeTextContentForBrowser = require('./escapeTextContentForBrowser');
var setInnerHTML = require('./setInnerHTML');

/**
 * Set the textContent property of a node, ensuring that whitespace is preserved
 * even in IE8. innerText is a poor substitute for textContent and, among many
 * issues, inserts <br> instead of the literal newline chars. innerHTML behaves
 * as it should.
 *
 * @param {DOMElement} node
 * @param {string} text
 * @internal
 */
var setTextContent = function (node, text) {
  node.textContent = text;
};

if (ExecutionEnvironment.canUseDOM) {
  if (!('textContent' in document.documentElement)) {
    setTextContent = function (node, text) {
      setInnerHTML(node, escapeTextContentForBrowser(text));
    };
  }
}

module.exports = setTextContent;
},{"./escapeTextContentForBrowser":"/home/ec2-user/ksana2015/node_modules/react/lib/escapeTextContentForBrowser.js","./setInnerHTML":"/home/ec2-user/ksana2015/node_modules/react/lib/setInnerHTML.js","fbjs/lib/ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/shouldUpdateReactComponent.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule shouldUpdateReactComponent
 * @typechecks static-only
 */

'use strict';

/**
 * Given a `prevElement` and `nextElement`, determines if the existing
 * instance should be updated as opposed to being destroyed or replaced by a new
 * instance. Both arguments are elements. This ensures that this logic can
 * operate on stateless trees without any backing instance.
 *
 * @param {?object} prevElement
 * @param {?object} nextElement
 * @return {boolean} True if the existing instance should be updated.
 * @protected
 */
function shouldUpdateReactComponent(prevElement, nextElement) {
  var prevEmpty = prevElement === null || prevElement === false;
  var nextEmpty = nextElement === null || nextElement === false;
  if (prevEmpty || nextEmpty) {
    return prevEmpty === nextEmpty;
  }

  var prevType = typeof prevElement;
  var nextType = typeof nextElement;
  if (prevType === 'string' || prevType === 'number') {
    return nextType === 'string' || nextType === 'number';
  } else {
    return nextType === 'object' && prevElement.type === nextElement.type && prevElement.key === nextElement.key;
  }
  return false;
}

module.exports = shouldUpdateReactComponent;
},{}],"/home/ec2-user/ksana2015/node_modules/react/lib/traverseAllChildren.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule traverseAllChildren
 */

'use strict';

var ReactCurrentOwner = require('./ReactCurrentOwner');
var ReactElement = require('./ReactElement');
var ReactInstanceHandles = require('./ReactInstanceHandles');

var getIteratorFn = require('./getIteratorFn');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

var SEPARATOR = ReactInstanceHandles.SEPARATOR;
var SUBSEPARATOR = ':';

/**
 * TODO: Test that a single child and an array with one item have the same key
 * pattern.
 */

var userProvidedKeyEscaperLookup = {
  '=': '=0',
  '.': '=1',
  ':': '=2'
};

var userProvidedKeyEscapeRegex = /[=.:]/g;

var didWarnAboutMaps = false;

function userProvidedKeyEscaper(match) {
  return userProvidedKeyEscaperLookup[match];
}

/**
 * Generate a key string that identifies a component within a set.
 *
 * @param {*} component A component that could contain a manual key.
 * @param {number} index Index that is used if a manual key is not provided.
 * @return {string}
 */
function getComponentKey(component, index) {
  if (component && component.key != null) {
    // Explicit key
    return wrapUserProvidedKey(component.key);
  }
  // Implicit key determined by the index in the set
  return index.toString(36);
}

/**
 * Escape a component key so that it is safe to use in a reactid.
 *
 * @param {*} text Component key to be escaped.
 * @return {string} An escaped string.
 */
function escapeUserProvidedKey(text) {
  return ('' + text).replace(userProvidedKeyEscapeRegex, userProvidedKeyEscaper);
}

/**
 * Wrap a `key` value explicitly provided by the user to distinguish it from
 * implicitly-generated keys generated by a component's index in its parent.
 *
 * @param {string} key Value of a user-provided `key` attribute
 * @return {string}
 */
function wrapUserProvidedKey(key) {
  return '$' + escapeUserProvidedKey(key);
}

/**
 * @param {?*} children Children tree container.
 * @param {!string} nameSoFar Name of the key path so far.
 * @param {!function} callback Callback to invoke with each child found.
 * @param {?*} traverseContext Used to pass information throughout the traversal
 * process.
 * @return {!number} The number of children in this subtree.
 */
function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
  var type = typeof children;

  if (type === 'undefined' || type === 'boolean') {
    // All of the above are perceived as null.
    children = null;
  }

  if (children === null || type === 'string' || type === 'number' || ReactElement.isValidElement(children)) {
    callback(traverseContext, children,
    // If it's the only child, treat the name as if it was wrapped in an array
    // so that it's consistent if the number of children grows.
    nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
    return 1;
  }

  var child;
  var nextName;
  var subtreeCount = 0; // Count of children found in the current subtree.
  var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      nextName = nextNamePrefix + getComponentKey(child, i);
      subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
    }
  } else {
    var iteratorFn = getIteratorFn(children);
    if (iteratorFn) {
      var iterator = iteratorFn.call(children);
      var step;
      if (iteratorFn !== children.entries) {
        var ii = 0;
        while (!(step = iterator.next()).done) {
          child = step.value;
          nextName = nextNamePrefix + getComponentKey(child, ii++);
          subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_ENV !== 'production' ? warning(didWarnAboutMaps, 'Using Maps as children is not yet fully supported. It is an ' + 'experimental feature that might be removed. Convert it to a ' + 'sequence / iterable of keyed ReactElements instead.') : undefined;
          didWarnAboutMaps = true;
        }
        // Iterator will provide entry [k,v] tuples rather than values.
        while (!(step = iterator.next()).done) {
          var entry = step.value;
          if (entry) {
            child = entry[1];
            nextName = nextNamePrefix + wrapUserProvidedKey(entry[0]) + SUBSEPARATOR + getComponentKey(child, 0);
            subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
          }
        }
      }
    } else if (type === 'object') {
      var addendum = '';
      if (process.env.NODE_ENV !== 'production') {
        addendum = ' If you meant to render a collection of children, use an array ' + 'instead or wrap the object using createFragment(object) from the ' + 'React add-ons.';
        if (children._isReactElement) {
          addendum = ' It looks like you\'re using an element created by a different ' + 'version of React. Make sure to use only one copy of React.';
        }
        if (ReactCurrentOwner.current) {
          var name = ReactCurrentOwner.current.getName();
          if (name) {
            addendum += ' Check the render method of `' + name + '`.';
          }
        }
      }
      var childrenString = String(children);
      !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Objects are not valid as a React child (found: %s).%s', childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString, addendum) : invariant(false) : undefined;
    }
  }

  return subtreeCount;
}

/**
 * Traverses children that are typically specified as `props.children`, but
 * might also be specified through attributes:
 *
 * - `traverseAllChildren(this.props.children, ...)`
 * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
 *
 * The `traverseContext` is an optional argument that is passed through the
 * entire traversal. It can be used to store accumulations or anything else that
 * the callback might find relevant.
 *
 * @param {?*} children Children tree object.
 * @param {!function} callback To invoke upon traversing each child.
 * @param {?*} traverseContext Context for traversal.
 * @return {!number} The number of children in this subtree.
 */
function traverseAllChildren(children, callback, traverseContext) {
  if (children == null) {
    return 0;
  }

  return traverseAllChildrenImpl(children, '', callback, traverseContext);
}

module.exports = traverseAllChildren;
},{"./ReactCurrentOwner":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactCurrentOwner.js","./ReactElement":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactElement.js","./ReactInstanceHandles":"/home/ec2-user/ksana2015/node_modules/react/lib/ReactInstanceHandles.js","./getIteratorFn":"/home/ec2-user/ksana2015/node_modules/react/lib/getIteratorFn.js","fbjs/lib/invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/lib/validateDOMNesting.js":[function(require,module,exports){
/**
 * Copyright 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule validateDOMNesting
 */

'use strict';

var assign = require('./Object.assign');
var emptyFunction = require('fbjs/lib/emptyFunction');
var warning = require('fbjs/lib/warning');

var validateDOMNesting = emptyFunction;

if (process.env.NODE_ENV !== 'production') {
  // This validation code was written based on the HTML5 parsing spec:
  // https://html.spec.whatwg.org/multipage/syntax.html#has-an-element-in-scope
  //
  // Note: this does not catch all invalid nesting, nor does it try to (as it's
  // not clear what practical benefit doing so provides); instead, we warn only
  // for cases where the parser will give a parse tree differing from what React
  // intended. For example, <b><div></div></b> is invalid but we don't warn
  // because it still parses correctly; we do warn for other cases like nested
  // <p> tags where the beginning of the second element implicitly closes the
  // first, causing a confusing mess.

  // https://html.spec.whatwg.org/multipage/syntax.html#special
  var specialTags = ['address', 'applet', 'area', 'article', 'aside', 'base', 'basefont', 'bgsound', 'blockquote', 'body', 'br', 'button', 'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dir', 'div', 'dl', 'dt', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'iframe', 'img', 'input', 'isindex', 'li', 'link', 'listing', 'main', 'marquee', 'menu', 'menuitem', 'meta', 'nav', 'noembed', 'noframes', 'noscript', 'object', 'ol', 'p', 'param', 'plaintext', 'pre', 'script', 'section', 'select', 'source', 'style', 'summary', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul', 'wbr', 'xmp'];

  // https://html.spec.whatwg.org/multipage/syntax.html#has-an-element-in-scope
  var inScopeTags = ['applet', 'caption', 'html', 'table', 'td', 'th', 'marquee', 'object', 'template',

  // https://html.spec.whatwg.org/multipage/syntax.html#html-integration-point
  // TODO: Distinguish by namespace here -- for <title>, including it here
  // errs on the side of fewer warnings
  'foreignObject', 'desc', 'title'];

  // https://html.spec.whatwg.org/multipage/syntax.html#has-an-element-in-button-scope
  var buttonScopeTags = inScopeTags.concat(['button']);

  // https://html.spec.whatwg.org/multipage/syntax.html#generate-implied-end-tags
  var impliedEndTags = ['dd', 'dt', 'li', 'option', 'optgroup', 'p', 'rp', 'rt'];

  var emptyAncestorInfo = {
    parentTag: null,

    formTag: null,
    aTagInScope: null,
    buttonTagInScope: null,
    nobrTagInScope: null,
    pTagInButtonScope: null,

    listItemTagAutoclosing: null,
    dlItemTagAutoclosing: null
  };

  var updatedAncestorInfo = function (oldInfo, tag, instance) {
    var ancestorInfo = assign({}, oldInfo || emptyAncestorInfo);
    var info = { tag: tag, instance: instance };

    if (inScopeTags.indexOf(tag) !== -1) {
      ancestorInfo.aTagInScope = null;
      ancestorInfo.buttonTagInScope = null;
      ancestorInfo.nobrTagInScope = null;
    }
    if (buttonScopeTags.indexOf(tag) !== -1) {
      ancestorInfo.pTagInButtonScope = null;
    }

    // See rules for 'li', 'dd', 'dt' start tags in
    // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody
    if (specialTags.indexOf(tag) !== -1 && tag !== 'address' && tag !== 'div' && tag !== 'p') {
      ancestorInfo.listItemTagAutoclosing = null;
      ancestorInfo.dlItemTagAutoclosing = null;
    }

    ancestorInfo.parentTag = info;

    if (tag === 'form') {
      ancestorInfo.formTag = info;
    }
    if (tag === 'a') {
      ancestorInfo.aTagInScope = info;
    }
    if (tag === 'button') {
      ancestorInfo.buttonTagInScope = info;
    }
    if (tag === 'nobr') {
      ancestorInfo.nobrTagInScope = info;
    }
    if (tag === 'p') {
      ancestorInfo.pTagInButtonScope = info;
    }
    if (tag === 'li') {
      ancestorInfo.listItemTagAutoclosing = info;
    }
    if (tag === 'dd' || tag === 'dt') {
      ancestorInfo.dlItemTagAutoclosing = info;
    }

    return ancestorInfo;
  };

  /**
   * Returns whether
   */
  var isTagValidWithParent = function (tag, parentTag) {
    // First, let's check if we're in an unusual parsing mode...
    switch (parentTag) {
      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inselect
      case 'select':
        return tag === 'option' || tag === 'optgroup' || tag === '#text';
      case 'optgroup':
        return tag === 'option' || tag === '#text';
      // Strictly speaking, seeing an <option> doesn't mean we're in a <select>
      // but
      case 'option':
        return tag === '#text';

      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intd
      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incaption
      // No special behavior since these rules fall back to "in body" mode for
      // all except special table nodes which cause bad parsing behavior anyway.

      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intr
      case 'tr':
        return tag === 'th' || tag === 'td' || tag === 'style' || tag === 'script' || tag === 'template';

      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intbody
      case 'tbody':
      case 'thead':
      case 'tfoot':
        return tag === 'tr' || tag === 'style' || tag === 'script' || tag === 'template';

      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incolgroup
      case 'colgroup':
        return tag === 'col' || tag === 'template';

      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intable
      case 'table':
        return tag === 'caption' || tag === 'colgroup' || tag === 'tbody' || tag === 'tfoot' || tag === 'thead' || tag === 'style' || tag === 'script' || tag === 'template';

      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inhead
      case 'head':
        return tag === 'base' || tag === 'basefont' || tag === 'bgsound' || tag === 'link' || tag === 'meta' || tag === 'title' || tag === 'noscript' || tag === 'noframes' || tag === 'style' || tag === 'script' || tag === 'template';

      // https://html.spec.whatwg.org/multipage/semantics.html#the-html-element
      case 'html':
        return tag === 'head' || tag === 'body';
    }

    // Probably in the "in body" parsing mode, so we outlaw only tag combos
    // where the parsing rules cause implicit opens or closes to be added.
    // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody
    switch (tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return parentTag !== 'h1' && parentTag !== 'h2' && parentTag !== 'h3' && parentTag !== 'h4' && parentTag !== 'h5' && parentTag !== 'h6';

      case 'rp':
      case 'rt':
        return impliedEndTags.indexOf(parentTag) === -1;

      case 'caption':
      case 'col':
      case 'colgroup':
      case 'frame':
      case 'head':
      case 'tbody':
      case 'td':
      case 'tfoot':
      case 'th':
      case 'thead':
      case 'tr':
        // These tags are only valid with a few parents that have special child
        // parsing rules -- if we're down here, then none of those matched and
        // so we allow it only if we don't know what the parent is, as all other
        // cases are invalid.
        return parentTag == null;
    }

    return true;
  };

  /**
   * Returns whether
   */
  var findInvalidAncestorForTag = function (tag, ancestorInfo) {
    switch (tag) {
      case 'address':
      case 'article':
      case 'aside':
      case 'blockquote':
      case 'center':
      case 'details':
      case 'dialog':
      case 'dir':
      case 'div':
      case 'dl':
      case 'fieldset':
      case 'figcaption':
      case 'figure':
      case 'footer':
      case 'header':
      case 'hgroup':
      case 'main':
      case 'menu':
      case 'nav':
      case 'ol':
      case 'p':
      case 'section':
      case 'summary':
      case 'ul':

      case 'pre':
      case 'listing':

      case 'table':

      case 'hr':

      case 'xmp':

      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return ancestorInfo.pTagInButtonScope;

      case 'form':
        return ancestorInfo.formTag || ancestorInfo.pTagInButtonScope;

      case 'li':
        return ancestorInfo.listItemTagAutoclosing;

      case 'dd':
      case 'dt':
        return ancestorInfo.dlItemTagAutoclosing;

      case 'button':
        return ancestorInfo.buttonTagInScope;

      case 'a':
        // Spec says something about storing a list of markers, but it sounds
        // equivalent to this check.
        return ancestorInfo.aTagInScope;

      case 'nobr':
        return ancestorInfo.nobrTagInScope;
    }

    return null;
  };

  /**
   * Given a ReactCompositeComponent instance, return a list of its recursive
   * owners, starting at the root and ending with the instance itself.
   */
  var findOwnerStack = function (instance) {
    if (!instance) {
      return [];
    }

    var stack = [];
    /*eslint-disable space-after-keywords */
    do {
      /*eslint-enable space-after-keywords */
      stack.push(instance);
    } while (instance = instance._currentElement._owner);
    stack.reverse();
    return stack;
  };

  var didWarn = {};

  validateDOMNesting = function (childTag, childInstance, ancestorInfo) {
    ancestorInfo = ancestorInfo || emptyAncestorInfo;
    var parentInfo = ancestorInfo.parentTag;
    var parentTag = parentInfo && parentInfo.tag;

    var invalidParent = isTagValidWithParent(childTag, parentTag) ? null : parentInfo;
    var invalidAncestor = invalidParent ? null : findInvalidAncestorForTag(childTag, ancestorInfo);
    var problematic = invalidParent || invalidAncestor;

    if (problematic) {
      var ancestorTag = problematic.tag;
      var ancestorInstance = problematic.instance;

      var childOwner = childInstance && childInstance._currentElement._owner;
      var ancestorOwner = ancestorInstance && ancestorInstance._currentElement._owner;

      var childOwners = findOwnerStack(childOwner);
      var ancestorOwners = findOwnerStack(ancestorOwner);

      var minStackLen = Math.min(childOwners.length, ancestorOwners.length);
      var i;

      var deepestCommon = -1;
      for (i = 0; i < minStackLen; i++) {
        if (childOwners[i] === ancestorOwners[i]) {
          deepestCommon = i;
        } else {
          break;
        }
      }

      var UNKNOWN = '(unknown)';
      var childOwnerNames = childOwners.slice(deepestCommon + 1).map(function (inst) {
        return inst.getName() || UNKNOWN;
      });
      var ancestorOwnerNames = ancestorOwners.slice(deepestCommon + 1).map(function (inst) {
        return inst.getName() || UNKNOWN;
      });
      var ownerInfo = [].concat(
      // If the parent and child instances have a common owner ancestor, start
      // with that -- otherwise we just start with the parent's owners.
      deepestCommon !== -1 ? childOwners[deepestCommon].getName() || UNKNOWN : [], ancestorOwnerNames, ancestorTag,
      // If we're warning about an invalid (non-parent) ancestry, add '...'
      invalidAncestor ? ['...'] : [], childOwnerNames, childTag).join(' > ');

      var warnKey = !!invalidParent + '|' + childTag + '|' + ancestorTag + '|' + ownerInfo;
      if (didWarn[warnKey]) {
        return;
      }
      didWarn[warnKey] = true;

      if (invalidParent) {
        var info = '';
        if (ancestorTag === 'table' && childTag === 'tr') {
          info += ' Add a <tbody> to your code to match the DOM tree generated by ' + 'the browser.';
        }
        process.env.NODE_ENV !== 'production' ? warning(false, 'validateDOMNesting(...): <%s> cannot appear as a child of <%s>. ' + 'See %s.%s', childTag, ancestorTag, ownerInfo, info) : undefined;
      } else {
        process.env.NODE_ENV !== 'production' ? warning(false, 'validateDOMNesting(...): <%s> cannot appear as a descendant of ' + '<%s>. See %s.', childTag, ancestorTag, ownerInfo) : undefined;
      }
    }
  };

  validateDOMNesting.ancestorInfoContextKey = '__validateDOMNesting_ancestorInfo$' + Math.random().toString(36).slice(2);

  validateDOMNesting.updatedAncestorInfo = updatedAncestorInfo;

  // For testing
  validateDOMNesting.isTagValidInContext = function (tag, ancestorInfo) {
    ancestorInfo = ancestorInfo || emptyAncestorInfo;
    var parentInfo = ancestorInfo.parentTag;
    var parentTag = parentInfo && parentInfo.tag;
    return isTagValidWithParent(tag, parentTag) && !findInvalidAncestorForTag(tag, ancestorInfo);
  };
}

module.exports = validateDOMNesting;
},{"./Object.assign":"/home/ec2-user/ksana2015/node_modules/react/lib/Object.assign.js","fbjs/lib/emptyFunction":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyFunction.js","fbjs/lib/warning":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js"}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/EventListener.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventListener
 * @typechecks
 */

'use strict';

var emptyFunction = require('./emptyFunction');

/**
 * Upstream version of event listener. Does not take into account specific
 * nature of platform.
 */
var EventListener = {
  /**
   * Listen to DOM events during the bubble phase.
   *
   * @param {DOMEventTarget} target DOM element to register listener on.
   * @param {string} eventType Event type, e.g. 'click' or 'mouseover'.
   * @param {function} callback Callback function.
   * @return {object} Object with a `remove` method.
   */
  listen: function (target, eventType, callback) {
    if (target.addEventListener) {
      target.addEventListener(eventType, callback, false);
      return {
        remove: function () {
          target.removeEventListener(eventType, callback, false);
        }
      };
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, callback);
      return {
        remove: function () {
          target.detachEvent('on' + eventType, callback);
        }
      };
    }
  },

  /**
   * Listen to DOM events during the capture phase.
   *
   * @param {DOMEventTarget} target DOM element to register listener on.
   * @param {string} eventType Event type, e.g. 'click' or 'mouseover'.
   * @param {function} callback Callback function.
   * @return {object} Object with a `remove` method.
   */
  capture: function (target, eventType, callback) {
    if (target.addEventListener) {
      target.addEventListener(eventType, callback, true);
      return {
        remove: function () {
          target.removeEventListener(eventType, callback, true);
        }
      };
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Attempted to listen to events during the capture phase on a ' + 'browser that does not support the capture phase. Your application ' + 'will not receive some events.');
      }
      return {
        remove: emptyFunction
      };
    }
  },

  registerDefault: function () {}
};

module.exports = EventListener;
},{"./emptyFunction":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyFunction.js"}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ExecutionEnvironment
 */

'use strict';

var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

/**
 * Simple, lightweight module assisting with the detection and context of
 * Worker. Helps avoid circular dependencies and allows code to reason about
 * whether or not they are in a Worker, even if they never include the main
 * `ReactWorker` dependency.
 */
var ExecutionEnvironment = {

  canUseDOM: canUseDOM,

  canUseWorkers: typeof Worker !== 'undefined',

  canUseEventListeners: canUseDOM && !!(window.addEventListener || window.attachEvent),

  canUseViewport: canUseDOM && !!window.screen,

  isInWorker: !canUseDOM // For now, this is true - might change in the future.

};

module.exports = ExecutionEnvironment;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/camelize.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule camelize
 * @typechecks
 */

"use strict";

var _hyphenPattern = /-(.)/g;

/**
 * Camelcases a hyphenated string, for example:
 *
 *   > camelize('background-color')
 *   < "backgroundColor"
 *
 * @param {string} string
 * @return {string}
 */
function camelize(string) {
  return string.replace(_hyphenPattern, function (_, character) {
    return character.toUpperCase();
  });
}

module.exports = camelize;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/camelizeStyleName.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule camelizeStyleName
 * @typechecks
 */

'use strict';

var camelize = require('./camelize');

var msPattern = /^-ms-/;

/**
 * Camelcases a hyphenated CSS property name, for example:
 *
 *   > camelizeStyleName('background-color')
 *   < "backgroundColor"
 *   > camelizeStyleName('-moz-transition')
 *   < "MozTransition"
 *   > camelizeStyleName('-ms-transition')
 *   < "msTransition"
 *
 * As Andi Smith suggests
 * (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
 * is converted to lowercase `ms`.
 *
 * @param {string} string
 * @return {string}
 */
function camelizeStyleName(string) {
  return camelize(string.replace(msPattern, 'ms-'));
}

module.exports = camelizeStyleName;
},{"./camelize":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/camelize.js"}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/containsNode.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule containsNode
 * @typechecks
 */

'use strict';

var isTextNode = require('./isTextNode');

/*eslint-disable no-bitwise */

/**
 * Checks if a given DOM node contains or is another DOM node.
 *
 * @param {?DOMNode} outerNode Outer DOM node.
 * @param {?DOMNode} innerNode Inner DOM node.
 * @return {boolean} True if `outerNode` contains or is `innerNode`.
 */
function containsNode(_x, _x2) {
  var _again = true;

  _function: while (_again) {
    var outerNode = _x,
        innerNode = _x2;
    _again = false;

    if (!outerNode || !innerNode) {
      return false;
    } else if (outerNode === innerNode) {
      return true;
    } else if (isTextNode(outerNode)) {
      return false;
    } else if (isTextNode(innerNode)) {
      _x = outerNode;
      _x2 = innerNode.parentNode;
      _again = true;
      continue _function;
    } else if (outerNode.contains) {
      return outerNode.contains(innerNode);
    } else if (outerNode.compareDocumentPosition) {
      return !!(outerNode.compareDocumentPosition(innerNode) & 16);
    } else {
      return false;
    }
  }
}

module.exports = containsNode;
},{"./isTextNode":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/isTextNode.js"}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/createArrayFromMixed.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createArrayFromMixed
 * @typechecks
 */

'use strict';

var toArray = require('./toArray');

/**
 * Perform a heuristic test to determine if an object is "array-like".
 *
 *   A monk asked Joshu, a Zen master, "Has a dog Buddha nature?"
 *   Joshu replied: "Mu."
 *
 * This function determines if its argument has "array nature": it returns
 * true if the argument is an actual array, an `arguments' object, or an
 * HTMLCollection (e.g. node.childNodes or node.getElementsByTagName()).
 *
 * It will return false for other array-like objects like Filelist.
 *
 * @param {*} obj
 * @return {boolean}
 */
function hasArrayNature(obj) {
  return(
    // not null/false
    !!obj && (
    // arrays are objects, NodeLists are functions in Safari
    typeof obj == 'object' || typeof obj == 'function') &&
    // quacks like an array
    'length' in obj &&
    // not window
    !('setInterval' in obj) &&
    // no DOM node should be considered an array-like
    // a 'select' element has 'length' and 'item' properties on IE8
    typeof obj.nodeType != 'number' && (
    // a real array
    Array.isArray(obj) ||
    // arguments
    'callee' in obj ||
    // HTMLCollection/NodeList
    'item' in obj)
  );
}

/**
 * Ensure that the argument is an array by wrapping it in an array if it is not.
 * Creates a copy of the argument if it is already an array.
 *
 * This is mostly useful idiomatically:
 *
 *   var createArrayFromMixed = require('createArrayFromMixed');
 *
 *   function takesOneOrMoreThings(things) {
 *     things = createArrayFromMixed(things);
 *     ...
 *   }
 *
 * This allows you to treat `things' as an array, but accept scalars in the API.
 *
 * If you need to convert an array-like object, like `arguments`, into an array
 * use toArray instead.
 *
 * @param {*} obj
 * @return {array}
 */
function createArrayFromMixed(obj) {
  if (!hasArrayNature(obj)) {
    return [obj];
  } else if (Array.isArray(obj)) {
    return obj.slice();
  } else {
    return toArray(obj);
  }
}

module.exports = createArrayFromMixed;
},{"./toArray":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/toArray.js"}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/createNodesFromMarkup.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createNodesFromMarkup
 * @typechecks
 */

/*eslint-disable fb-www/unsafe-html*/

'use strict';

var ExecutionEnvironment = require('./ExecutionEnvironment');

var createArrayFromMixed = require('./createArrayFromMixed');
var getMarkupWrap = require('./getMarkupWrap');
var invariant = require('./invariant');

/**
 * Dummy container used to render all markup.
 */
var dummyNode = ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;

/**
 * Pattern used by `getNodeName`.
 */
var nodeNamePattern = /^\s*<(\w+)/;

/**
 * Extracts the `nodeName` of the first element in a string of markup.
 *
 * @param {string} markup String of markup.
 * @return {?string} Node name of the supplied markup.
 */
function getNodeName(markup) {
  var nodeNameMatch = markup.match(nodeNamePattern);
  return nodeNameMatch && nodeNameMatch[1].toLowerCase();
}

/**
 * Creates an array containing the nodes rendered from the supplied markup. The
 * optionally supplied `handleScript` function will be invoked once for each
 * <script> element that is rendered. If no `handleScript` function is supplied,
 * an exception is thrown if any <script> elements are rendered.
 *
 * @param {string} markup A string of valid HTML markup.
 * @param {?function} handleScript Invoked once for each rendered <script>.
 * @return {array<DOMElement|DOMTextNode>} An array of rendered nodes.
 */
function createNodesFromMarkup(markup, handleScript) {
  var node = dummyNode;
  !!!dummyNode ? process.env.NODE_ENV !== 'production' ? invariant(false, 'createNodesFromMarkup dummy not initialized') : invariant(false) : undefined;
  var nodeName = getNodeName(markup);

  var wrap = nodeName && getMarkupWrap(nodeName);
  if (wrap) {
    node.innerHTML = wrap[1] + markup + wrap[2];

    var wrapDepth = wrap[0];
    while (wrapDepth--) {
      node = node.lastChild;
    }
  } else {
    node.innerHTML = markup;
  }

  var scripts = node.getElementsByTagName('script');
  if (scripts.length) {
    !handleScript ? process.env.NODE_ENV !== 'production' ? invariant(false, 'createNodesFromMarkup(...): Unexpected <script> element rendered.') : invariant(false) : undefined;
    createArrayFromMixed(scripts).forEach(handleScript);
  }

  var nodes = createArrayFromMixed(node.childNodes);
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }
  return nodes;
}

module.exports = createNodesFromMarkup;
},{"./ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js","./createArrayFromMixed":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/createArrayFromMixed.js","./getMarkupWrap":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/getMarkupWrap.js","./invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyFunction.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule emptyFunction
 */

"use strict";

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
function emptyFunction() {}

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyObject.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule emptyObject
 */

'use strict';

var emptyObject = {};

if (process.env.NODE_ENV !== 'production') {
  Object.freeze(emptyObject);
}

module.exports = emptyObject;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/focusNode.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule focusNode
 */

'use strict';

/**
 * @param {DOMElement} node input/textarea to focus
 */
function focusNode(node) {
  // IE8 can throw "Can't move focus to the control because it is invisible,
  // not enabled, or of a type that does not accept the focus." for all kinds of
  // reasons that are too expensive and fragile to test.
  try {
    node.focus();
  } catch (e) {}
}

module.exports = focusNode;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/getActiveElement.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getActiveElement
 * @typechecks
 */

/* eslint-disable fb-www/typeof-undefined */

/**
 * Same as document.activeElement but wraps in a try-catch block. In IE it is
 * not safe to call document.activeElement if there is nothing focused.
 *
 * The activeElement will be null only if the document or document body is not
 * yet defined.
 */
'use strict';

function getActiveElement() /*?DOMElement*/{
  if (typeof document === 'undefined') {
    return null;
  }
  try {
    return document.activeElement || document.body;
  } catch (e) {
    return document.body;
  }
}

module.exports = getActiveElement;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/getMarkupWrap.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getMarkupWrap
 */

/*eslint-disable fb-www/unsafe-html */

'use strict';

var ExecutionEnvironment = require('./ExecutionEnvironment');

var invariant = require('./invariant');

/**
 * Dummy container used to detect which wraps are necessary.
 */
var dummyNode = ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;

/**
 * Some browsers cannot use `innerHTML` to render certain elements standalone,
 * so we wrap them, render the wrapped nodes, then extract the desired node.
 *
 * In IE8, certain elements cannot render alone, so wrap all elements ('*').
 */

var shouldWrap = {};

var selectWrap = [1, '<select multiple="true">', '</select>'];
var tableWrap = [1, '<table>', '</table>'];
var trWrap = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

var svgWrap = [1, '<svg xmlns="http://www.w3.org/2000/svg">', '</svg>'];

var markupWrap = {
  '*': [1, '?<div>', '</div>'],

  'area': [1, '<map>', '</map>'],
  'col': [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  'legend': [1, '<fieldset>', '</fieldset>'],
  'param': [1, '<object>', '</object>'],
  'tr': [2, '<table><tbody>', '</tbody></table>'],

  'optgroup': selectWrap,
  'option': selectWrap,

  'caption': tableWrap,
  'colgroup': tableWrap,
  'tbody': tableWrap,
  'tfoot': tableWrap,
  'thead': tableWrap,

  'td': trWrap,
  'th': trWrap
};

// Initialize the SVG elements since we know they'll always need to be wrapped
// consistently. If they are created inside a <div> they will be initialized in
// the wrong namespace (and will not display).
var svgElements = ['circle', 'clipPath', 'defs', 'ellipse', 'g', 'image', 'line', 'linearGradient', 'mask', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'stop', 'text', 'tspan'];
svgElements.forEach(function (nodeName) {
  markupWrap[nodeName] = svgWrap;
  shouldWrap[nodeName] = true;
});

/**
 * Gets the markup wrap configuration for the supplied `nodeName`.
 *
 * NOTE: This lazily detects which wraps are necessary for the current browser.
 *
 * @param {string} nodeName Lowercase `nodeName`.
 * @return {?array} Markup wrap configuration, if applicable.
 */
function getMarkupWrap(nodeName) {
  !!!dummyNode ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Markup wrapping node not initialized') : invariant(false) : undefined;
  if (!markupWrap.hasOwnProperty(nodeName)) {
    nodeName = '*';
  }
  if (!shouldWrap.hasOwnProperty(nodeName)) {
    if (nodeName === '*') {
      dummyNode.innerHTML = '<link />';
    } else {
      dummyNode.innerHTML = '<' + nodeName + '></' + nodeName + '>';
    }
    shouldWrap[nodeName] = !dummyNode.firstChild;
  }
  return shouldWrap[nodeName] ? markupWrap[nodeName] : null;
}

module.exports = getMarkupWrap;
},{"./ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js","./invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/getUnboundedScrollPosition.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getUnboundedScrollPosition
 * @typechecks
 */

'use strict';

/**
 * Gets the scroll position of the supplied element or window.
 *
 * The return values are unbounded, unlike `getScrollPosition`. This means they
 * may be negative or exceed the element boundaries (which is possible using
 * inertial scrolling).
 *
 * @param {DOMWindow|DOMElement} scrollable
 * @return {object} Map with `x` and `y` keys.
 */
function getUnboundedScrollPosition(scrollable) {
  if (scrollable === window) {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop
    };
  }
  return {
    x: scrollable.scrollLeft,
    y: scrollable.scrollTop
  };
}

module.exports = getUnboundedScrollPosition;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/hyphenate.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule hyphenate
 * @typechecks
 */

'use strict';

var _uppercasePattern = /([A-Z])/g;

/**
 * Hyphenates a camelcased string, for example:
 *
 *   > hyphenate('backgroundColor')
 *   < "background-color"
 *
 * For CSS style names, use `hyphenateStyleName` instead which works properly
 * with all vendor prefixes, including `ms`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenate(string) {
  return string.replace(_uppercasePattern, '-$1').toLowerCase();
}

module.exports = hyphenate;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/hyphenateStyleName.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule hyphenateStyleName
 * @typechecks
 */

'use strict';

var hyphenate = require('./hyphenate');

var msPattern = /^ms-/;

/**
 * Hyphenates a camelcased CSS property name, for example:
 *
 *   > hyphenateStyleName('backgroundColor')
 *   < "background-color"
 *   > hyphenateStyleName('MozTransition')
 *   < "-moz-transition"
 *   > hyphenateStyleName('msTransition')
 *   < "-ms-transition"
 *
 * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
 * is converted to `-ms-`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenateStyleName(string) {
  return hyphenate(string).replace(msPattern, '-ms-');
}

module.exports = hyphenateStyleName;
},{"./hyphenate":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/hyphenate.js"}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

function invariant(condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/isNode.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isNode
 * @typechecks
 */

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM node.
 */
'use strict';

function isNode(object) {
  return !!(object && (typeof Node === 'function' ? object instanceof Node : typeof object === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string'));
}

module.exports = isNode;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/isTextNode.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isTextNode
 * @typechecks
 */

'use strict';

var isNode = require('./isNode');

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM text node.
 */
function isTextNode(object) {
  return isNode(object) && object.nodeType == 3;
}

module.exports = isTextNode;
},{"./isNode":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/isNode.js"}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyMirror.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule keyMirror
 * @typechecks static-only
 */

'use strict';

var invariant = require('./invariant');

/**
 * Constructs an enumeration with keys equal to their value.
 *
 * For example:
 *
 *   var COLORS = keyMirror({blue: null, red: null});
 *   var myColor = COLORS.blue;
 *   var isColorValid = !!COLORS[myColor];
 *
 * The last line could not be performed if the values of the generated enum were
 * not equal to their keys.
 *
 *   Input:  {key1: val1, key2: val2}
 *   Output: {key1: key1, key2: key2}
 *
 * @param {object} obj
 * @return {object}
 */
var keyMirror = function (obj) {
  var ret = {};
  var key;
  !(obj instanceof Object && !Array.isArray(obj)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'keyMirror(...): Argument must be an object.') : invariant(false) : undefined;
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = key;
  }
  return ret;
};

module.exports = keyMirror;
},{"./invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/keyOf.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule keyOf
 */

/**
 * Allows extraction of a minified key. Let's the build system minify keys
 * without losing the ability to dynamically use key strings as values
 * themselves. Pass in an object with a single key/val pair and it will return
 * you the string key of that single record. Suppose you want to grab the
 * value for a key 'className' inside of an object. Key/val minification may
 * have aliased that key to be 'xa12'. keyOf({className: null}) will return
 * 'xa12' in that case. Resolve keys you want to use once at startup time, then
 * reuse those resolutions.
 */
"use strict";

var keyOf = function (oneKeyObj) {
  var key;
  for (key in oneKeyObj) {
    if (!oneKeyObj.hasOwnProperty(key)) {
      continue;
    }
    return key;
  }
  return null;
};

module.exports = keyOf;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/mapObject.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule mapObject
 */

'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Executes the provided `callback` once for each enumerable own property in the
 * object and constructs a new object from the results. The `callback` is
 * invoked with three arguments:
 *
 *  - the property value
 *  - the property name
 *  - the object being traversed
 *
 * Properties that are added after the call to `mapObject` will not be visited
 * by `callback`. If the values of existing properties are changed, the value
 * passed to `callback` will be the value at the time `mapObject` visits them.
 * Properties that are deleted before being visited are not visited.
 *
 * @grep function objectMap()
 * @grep function objMap()
 *
 * @param {?object} object
 * @param {function} callback
 * @param {*} context
 * @return {?object}
 */
function mapObject(object, callback, context) {
  if (!object) {
    return null;
  }
  var result = {};
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result[name] = callback.call(context, object[name], name, object);
    }
  }
  return result;
}

module.exports = mapObject;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/memoizeStringOnly.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule memoizeStringOnly
 * @typechecks static-only
 */

'use strict';

/**
 * Memoizes the return value of a function that accepts one string argument.
 *
 * @param {function} callback
 * @return {function}
 */
function memoizeStringOnly(callback) {
  var cache = {};
  return function (string) {
    if (!cache.hasOwnProperty(string)) {
      cache[string] = callback.call(this, string);
    }
    return cache[string];
  };
}

module.exports = memoizeStringOnly;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/performance.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule performance
 * @typechecks
 */

'use strict';

var ExecutionEnvironment = require('./ExecutionEnvironment');

var performance;

if (ExecutionEnvironment.canUseDOM) {
  performance = window.performance || window.msPerformance || window.webkitPerformance;
}

module.exports = performance || {};
},{"./ExecutionEnvironment":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/ExecutionEnvironment.js"}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/performanceNow.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule performanceNow
 * @typechecks
 */

'use strict';

var performance = require('./performance');

var performanceNow;

/**
 * Detect if we can use `window.performance.now()` and gracefully fallback to
 * `Date.now()` if it doesn't exist. We need to support Firefox < 15 for now
 * because of Facebook's testing infrastructure.
 */
if (performance.now) {
  performanceNow = function () {
    return performance.now();
  };
} else {
  performanceNow = function () {
    return Date.now();
  };
}

module.exports = performanceNow;
},{"./performance":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/performance.js"}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/shallowEqual.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule shallowEqual
 * @typechecks
 * 
 */

'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  var bHasOwnProperty = hasOwnProperty.bind(objB);
  for (var i = 0; i < keysA.length; i++) {
    if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}

module.exports = shallowEqual;
},{}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/toArray.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule toArray
 * @typechecks
 */

'use strict';

var invariant = require('./invariant');

/**
 * Convert array-like objects to arrays.
 *
 * This API assumes the caller knows the contents of the data type. For less
 * well defined inputs use createArrayFromMixed.
 *
 * @param {object|function|filelist} obj
 * @return {array}
 */
function toArray(obj) {
  var length = obj.length;

  // Some browse builtin objects can report typeof 'function' (e.g. NodeList in
  // old versions of Safari).
  !(!Array.isArray(obj) && (typeof obj === 'object' || typeof obj === 'function')) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'toArray: Array-like object expected') : invariant(false) : undefined;

  !(typeof length === 'number') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'toArray: Object needs a length property') : invariant(false) : undefined;

  !(length === 0 || length - 1 in obj) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'toArray: Object should have keys for indices') : invariant(false) : undefined;

  // Old IE doesn't give collections access to hasOwnProperty. Assume inputs
  // without method will throw during the slice call and skip straight to the
  // fallback.
  if (obj.hasOwnProperty) {
    try {
      return Array.prototype.slice.call(obj);
    } catch (e) {
      // IE < 9 does not support Array#slice on collections objects
    }
  }

  // Fall back to copying key by key. This assumes all keys have a value,
  // so will not preserve sparsely populated inputs.
  var ret = Array(length);
  for (var ii = 0; ii < length; ii++) {
    ret[ii] = obj[ii];
  }
  return ret;
}

module.exports = toArray;
},{"./invariant":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/invariant.js"}],"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/warning.js":[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule warning
 */

'use strict';

var emptyFunction = require('./emptyFunction');

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if (process.env.NODE_ENV !== 'production') {
  warning = function (condition, format) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
    }

    if (format.indexOf('Failed Composite propType: ') === 0) {
      return; // Ignore CompositeComponent proptype check.
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    }
  };
}

module.exports = warning;
},{"./emptyFunction":"/home/ec2-user/ksana2015/node_modules/react/node_modules/fbjs/lib/emptyFunction.js"}],"/home/ec2-user/ksana2015/node_modules/react/react.js":[function(require,module,exports){
'use strict';

module.exports = require('./lib/React');

},{"./lib/React":"/home/ec2-user/ksana2015/node_modules/react/lib/React.js"}],"/home/ec2-user/ksana2015/node_modules/tibetan/wylie.js":[function(require,module,exports){
var opt = { check:false, check_strict:false, print_warnings:false, fix_spacing:false }

function setopt(arg_opt) {
	for (i in arg_opt) opt[i] = arg_opt[i]
	if (opt.check_strict && !opt.check) { 
		throw 'check_strict requires check.'
	}
}

function newHashSet() {
	var x = []
	x.add = function (K) {
		if (this.indexOf(K) < 0) this.push(K)
	}
	x.contains = function (K) {
		return this.indexOf(K) >= 0
	}
	return x
}

function newHashMap() {
	var x = {}
	x.k = [], x.v = []
	x.put = function (K, V) {
		var i = this.k.indexOf(K)
		if (i < 0) this.k.push(K), this.v.push(V); else this.v[i] = V
	}
	x.containsKey = function (K) {
		return this.k.indexOf(K) >= 0
	}
	x.get = function (K) {
		var i = this.k.indexOf(K)
		if (i >= 0) return this.v[i]
	}
	return x
}
var tmpSet;
// mappings are ported from Java code
// *** Wylie to Unicode mappings ***
// list of wylie consonant => unicode
var m_consonant = new newHashMap();
m_consonant.put("k", 	"\u0f40");
m_consonant.put("kh", 	"\u0f41");
m_consonant.put("g", 	"\u0f42");
m_consonant.put("gh", 	"\u0f42\u0fb7");
m_consonant.put("g+h", 	"\u0f42\u0fb7");
m_consonant.put("ng", 	"\u0f44");
m_consonant.put("c", 	"\u0f45");
m_consonant.put("ch", 	"\u0f46");
m_consonant.put("j", 	"\u0f47");
m_consonant.put("ny", 	"\u0f49");
m_consonant.put("T", 	"\u0f4a");
m_consonant.put("-t", 	"\u0f4a");
m_consonant.put("Th", 	"\u0f4b");
m_consonant.put("-th", 	"\u0f4b");
m_consonant.put("D", 	"\u0f4c");
m_consonant.put("-d", 	"\u0f4c");
m_consonant.put("Dh", 	"\u0f4c\u0fb7");
m_consonant.put("D+h", 	"\u0f4c\u0fb7");
m_consonant.put("-dh", 	"\u0f4c\u0fb7");
m_consonant.put("-d+h", "\u0f4c\u0fb7");
m_consonant.put("N", 	"\u0f4e");
m_consonant.put("-n", 	"\u0f4e");
m_consonant.put("t", 	"\u0f4f");
m_consonant.put("th", 	"\u0f50");
m_consonant.put("d", 	"\u0f51");
m_consonant.put("dh", 	"\u0f51\u0fb7");
m_consonant.put("d+h", 	"\u0f51\u0fb7");
m_consonant.put("n", 	"\u0f53");
m_consonant.put("p", 	"\u0f54");
m_consonant.put("ph", 	"\u0f55");
m_consonant.put("b", 	"\u0f56");
m_consonant.put("bh", 	"\u0f56\u0fb7");
m_consonant.put("b+h", 	"\u0f56\u0fb7");
m_consonant.put("m", 	"\u0f58");
m_consonant.put("ts", 	"\u0f59");
m_consonant.put("tsh", 	"\u0f5a");
m_consonant.put("dz", 	"\u0f5b");
m_consonant.put("dzh", 	"\u0f5b\u0fb7");
m_consonant.put("dz+h", "\u0f5b\u0fb7");
m_consonant.put("w", 	"\u0f5d");
m_consonant.put("zh", 	"\u0f5e");
m_consonant.put("z", 	"\u0f5f");
m_consonant.put("'", 	"\u0f60");
m_consonant.put("\u2018", 	"\u0f60");	// typographic quotes
m_consonant.put("\u2019", 	"\u0f60");
m_consonant.put("y", 	"\u0f61");
m_consonant.put("r", 	"\u0f62");
m_consonant.put("l", 	"\u0f63");
m_consonant.put("sh", 	"\u0f64");
m_consonant.put("Sh", 	"\u0f65");
m_consonant.put("-sh", 	"\u0f65");
m_consonant.put("s", 	"\u0f66");
m_consonant.put("h", 	"\u0f67");
m_consonant.put("W", 	"\u0f5d");
m_consonant.put("Y", 	"\u0f61");
m_consonant.put("R", 	"\u0f6a");
m_consonant.put("f", 	"\u0f55\u0f39");
m_consonant.put("v", 	"\u0f56\u0f39");

// subjoined letters
var m_subjoined = new newHashMap();
m_subjoined.put("k", 	"\u0f90");
m_subjoined.put("kh", 	"\u0f91");
m_subjoined.put("g", 	"\u0f92");
m_subjoined.put("gh", 	"\u0f92\u0fb7");
m_subjoined.put("g+h", 	"\u0f92\u0fb7");
m_subjoined.put("ng", 	"\u0f94");
m_subjoined.put("c", 	"\u0f95");
m_subjoined.put("ch", 	"\u0f96");
m_subjoined.put("j", 	"\u0f97");
m_subjoined.put("ny", 	"\u0f99");
m_subjoined.put("T", 	"\u0f9a");
m_subjoined.put("-t", 	"\u0f9a");
m_subjoined.put("Th", 	"\u0f9b");
m_subjoined.put("-th", 	"\u0f9b");
m_subjoined.put("D", 	"\u0f9c");
m_subjoined.put("-d", 	"\u0f9c");
m_subjoined.put("Dh", 	"\u0f9c\u0fb7");
m_subjoined.put("D+h", 	"\u0f9c\u0fb7");
m_subjoined.put("-dh", 	"\u0f9c\u0fb7");
m_subjoined.put("-d+h",	"\u0f9c\u0fb7");
m_subjoined.put("N", 	"\u0f9e");
m_subjoined.put("-n", 	"\u0f9e");
m_subjoined.put("t", 	"\u0f9f");
m_subjoined.put("th", 	"\u0fa0");
m_subjoined.put("d", 	"\u0fa1");
m_subjoined.put("dh", 	"\u0fa1\u0fb7");
m_subjoined.put("d+h", 	"\u0fa1\u0fb7");
m_subjoined.put("n", 	"\u0fa3");
m_subjoined.put("p", 	"\u0fa4");
m_subjoined.put("ph", 	"\u0fa5");
m_subjoined.put("b", 	"\u0fa6");
m_subjoined.put("bh", 	"\u0fa6\u0fb7");
m_subjoined.put("b+h", 	"\u0fa6\u0fb7");
m_subjoined.put("m", 	"\u0fa8");
m_subjoined.put("ts", 	"\u0fa9");
m_subjoined.put("tsh", 	"\u0faa");
m_subjoined.put("dz", 	"\u0fab");
m_subjoined.put("dzh", 	"\u0fab\u0fb7");
m_subjoined.put("dz+h",	"\u0fab\u0fb7");
m_subjoined.put("w", 	"\u0fad");
m_subjoined.put("zh", 	"\u0fae");
m_subjoined.put("z", 	"\u0faf");
m_subjoined.put("'", 	"\u0fb0");
m_subjoined.put("\u2018", 	"\u0fb0");	// typographic quotes
m_subjoined.put("\u2019", 	"\u0fb0");
m_subjoined.put("y", 	"\u0fb1");
m_subjoined.put("r", 	"\u0fb2");
m_subjoined.put("l", 	"\u0fb3");
m_subjoined.put("sh", 	"\u0fb4");
m_subjoined.put("Sh", 	"\u0fb5");
m_subjoined.put("-sh", 	"\u0fb5");
m_subjoined.put("s", 	"\u0fb6");
m_subjoined.put("h", 	"\u0fb7");
m_subjoined.put("a", 	"\u0fb8");
m_subjoined.put("W", 	"\u0fba");
m_subjoined.put("Y", 	"\u0fbb");
m_subjoined.put("R", 	"\u0fbc");

// vowels
var m_vowel = new newHashMap();
m_vowel.put("a", 	"\u0f68");
m_vowel.put("A", 	"\u0f71");
m_vowel.put("i", 	"\u0f72");
m_vowel.put("I", 	"\u0f71\u0f72");
m_vowel.put("u", 	"\u0f74");
m_vowel.put("U", 	"\u0f71\u0f74");
m_vowel.put("e", 	"\u0f7a");
m_vowel.put("ai", 	"\u0f7b");
m_vowel.put("o", 	"\u0f7c");
m_vowel.put("au", 	"\u0f7d");
m_vowel.put("-i", 	"\u0f80");
m_vowel.put("-I", 	"\u0f71\u0f80");

// final symbols to unicode
var m_final_uni = new newHashMap();
m_final_uni.put("M", 	"\u0f7e");
m_final_uni.put("~M`", 	"\u0f82");
m_final_uni.put("~M", 	"\u0f83");
m_final_uni.put("X", 	"\u0f37");
m_final_uni.put("~X", 	"\u0f35");
m_final_uni.put("H", 	"\u0f7f");
m_final_uni.put("?", 	"\u0f84");
m_final_uni.put("^", 	"\u0f39");

// final symbols organized by class
var m_final_class = new newHashMap();
m_final_class.put("M", 	"M");
m_final_class.put("~M`", "M");
m_final_class.put("~M",  "M");
m_final_class.put("X", 	"X");
m_final_class.put("~X", "X");
m_final_class.put("H", 	"H");
m_final_class.put("?", 	"?");
m_final_class.put("^", 	"^");

// other stand-alone symbols
var m_other = new newHashMap();
m_other.put("0", 	"\u0f20");
m_other.put("1", 	"\u0f21");
m_other.put("2", 	"\u0f22");
m_other.put("3", 	"\u0f23");
m_other.put("4", 	"\u0f24");
m_other.put("5", 	"\u0f25");
m_other.put("6", 	"\u0f26");
m_other.put("7", 	"\u0f27");
m_other.put("8", 	"\u0f28");
m_other.put("9", 	"\u0f29");
m_other.put(" ", 	"\u0f0b");
m_other.put("*", 	"\u0f0c");
m_other.put("/", 	"\u0f0d");
m_other.put("//", 	"\u0f0e");
m_other.put(";", 	"\u0f0f");
m_other.put("|", 	"\u0f11");
m_other.put("!", 	"\u0f08");
m_other.put(":", 	"\u0f14");
m_other.put("_", 	" ");
m_other.put("=", 	"\u0f34");
m_other.put("<", 	"\u0f3a");
m_other.put(">", 	"\u0f3b");
m_other.put("(", 	"\u0f3c");
m_other.put(")", 	"\u0f3d");
m_other.put("@", 	"\u0f04");
m_other.put("#", 	"\u0f05");
m_other.put("$", 	"\u0f06");
m_other.put("%", 	"\u0f07");

// special characters: flag those if they occur out of context
var m_special = new newHashSet();
m_special.add(".");
m_special.add("+");
m_special.add("-");
m_special.add("~");
m_special.add("^");
m_special.add("?");
m_special.add("`");
m_special.add("]");

// superscripts: hashmap of superscript => set of letters or stacks below
var m_superscripts = new newHashMap();
tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("g");
tmpSet.add("ng");
tmpSet.add("j");
tmpSet.add("ny");
tmpSet.add("t");
tmpSet.add("d");
tmpSet.add("n");
tmpSet.add("b");
tmpSet.add("m");
tmpSet.add("ts");
tmpSet.add("dz");
tmpSet.add("k+y");
tmpSet.add("g+y");
tmpSet.add("m+y");
tmpSet.add("b+w");
tmpSet.add("ts+w");
tmpSet.add("g+w");
m_superscripts.put("r", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("g");
tmpSet.add("ng");
tmpSet.add("c");
tmpSet.add("j");
tmpSet.add("t");
tmpSet.add("d");
tmpSet.add("p");
tmpSet.add("b");
tmpSet.add("h");
m_superscripts.put("l", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("g");
tmpSet.add("ng");
tmpSet.add("ny");
tmpSet.add("t");
tmpSet.add("d");
tmpSet.add("n");
tmpSet.add("p");
tmpSet.add("b");
tmpSet.add("m");
tmpSet.add("ts");
tmpSet.add("k+y");
tmpSet.add("g+y");
tmpSet.add("p+y");
tmpSet.add("b+y");
tmpSet.add("m+y");
tmpSet.add("k+r");
tmpSet.add("g+r");
tmpSet.add("p+r");
tmpSet.add("b+r");
tmpSet.add("m+r");
tmpSet.add("n+r");
m_superscripts.put("s", tmpSet);

// subscripts => set of letters above
var m_subscripts = new newHashMap();
tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("kh");
tmpSet.add("g");
tmpSet.add("p");
tmpSet.add("ph");
tmpSet.add("b");
tmpSet.add("m");
tmpSet.add("r+k");
tmpSet.add("r+g");
tmpSet.add("r+m");
tmpSet.add("s+k");
tmpSet.add("s+g");
tmpSet.add("s+p");
tmpSet.add("s+b");
tmpSet.add("s+m");
m_subscripts.put("y", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("kh");
tmpSet.add("g");
tmpSet.add("t");
tmpSet.add("th");
tmpSet.add("d");
tmpSet.add("n");
tmpSet.add("p");
tmpSet.add("ph");
tmpSet.add("b");
tmpSet.add("m");
tmpSet.add("sh");
tmpSet.add("s");
tmpSet.add("h");
tmpSet.add("dz");
tmpSet.add("s+k");
tmpSet.add("s+g");
tmpSet.add("s+p");
tmpSet.add("s+b");
tmpSet.add("s+m");
tmpSet.add("s+n");
m_subscripts.put("r", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("g");
tmpSet.add("b");
tmpSet.add("r");
tmpSet.add("s");
tmpSet.add("z");
m_subscripts.put("l", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("kh");
tmpSet.add("g");
tmpSet.add("c");
tmpSet.add("ny");
tmpSet.add("t");
tmpSet.add("d");
tmpSet.add("ts");
tmpSet.add("tsh");
tmpSet.add("zh");
tmpSet.add("z");
tmpSet.add("r");
tmpSet.add("l");
tmpSet.add("sh");
tmpSet.add("s");
tmpSet.add("h");
tmpSet.add("g+r");
tmpSet.add("d+r");
tmpSet.add("ph+y");
tmpSet.add("r+g");
tmpSet.add("r+ts");
m_subscripts.put("w", tmpSet);

// prefixes => set of consonants or stacks after
var m_prefixes = new newHashMap();
tmpSet = new newHashSet();
tmpSet.add("c");
tmpSet.add("ny");
tmpSet.add("t");
tmpSet.add("d");
tmpSet.add("n");
tmpSet.add("ts");
tmpSet.add("zh");
tmpSet.add("z");
tmpSet.add("y");
tmpSet.add("sh");
tmpSet.add("s");
m_prefixes.put("g", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("g");
tmpSet.add("ng");
tmpSet.add("p");
tmpSet.add("b");
tmpSet.add("m");
tmpSet.add("k+y");
tmpSet.add("g+y");
tmpSet.add("p+y");
tmpSet.add("b+y");
tmpSet.add("m+y");
tmpSet.add("k+r");
tmpSet.add("g+r");
tmpSet.add("p+r");
tmpSet.add("b+r");
m_prefixes.put("d", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("g");
tmpSet.add("c");
tmpSet.add("t");
tmpSet.add("d");
tmpSet.add("ts");
tmpSet.add("zh");
tmpSet.add("z");
tmpSet.add("sh");
tmpSet.add("s");
tmpSet.add("r");
tmpSet.add("l");
tmpSet.add("k+y");
tmpSet.add("g+y");
tmpSet.add("k+r");
tmpSet.add("g+r");
tmpSet.add("r+l");
tmpSet.add("s+l");
tmpSet.add("r+k");
tmpSet.add("r+g");
tmpSet.add("r+ng");
tmpSet.add("r+j");
tmpSet.add("r+ny");
tmpSet.add("r+t");
tmpSet.add("r+d");
tmpSet.add("r+n");
tmpSet.add("r+ts");
tmpSet.add("r+dz");
tmpSet.add("s+k");
tmpSet.add("s+g");
tmpSet.add("s+ng");
tmpSet.add("s+ny");
tmpSet.add("s+t");
tmpSet.add("s+d");
tmpSet.add("s+n");
tmpSet.add("s+ts");
tmpSet.add("r+k+y");
tmpSet.add("r+g+y");
tmpSet.add("s+k+y");
tmpSet.add("s+g+y");
tmpSet.add("s+k+r");
tmpSet.add("s+g+r");
tmpSet.add("l+d");
tmpSet.add("l+t");
tmpSet.add("k+l");
tmpSet.add("s+r");
tmpSet.add("z+l");
tmpSet.add("s+w");
m_prefixes.put("b", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("kh");
tmpSet.add("g");
tmpSet.add("ng");
tmpSet.add("ch");
tmpSet.add("j");
tmpSet.add("ny");
tmpSet.add("th");
tmpSet.add("d");
tmpSet.add("n");
tmpSet.add("tsh");
tmpSet.add("dz");
tmpSet.add("kh+y");
tmpSet.add("g+y");
tmpSet.add("kh+r");
tmpSet.add("g+r");
m_prefixes.put("m", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("kh");
tmpSet.add("g");
tmpSet.add("ch");
tmpSet.add("j");
tmpSet.add("th");
tmpSet.add("d");
tmpSet.add("ph");
tmpSet.add("b");
tmpSet.add("tsh");
tmpSet.add("dz");
tmpSet.add("kh+y");
tmpSet.add("g+y");
tmpSet.add("ph+y");
tmpSet.add("b+y");
tmpSet.add("kh+r");
tmpSet.add("g+r");
tmpSet.add("d+r");
tmpSet.add("ph+r");
tmpSet.add("b+r");
m_prefixes.put("'", tmpSet);
m_prefixes.put("\u2018", tmpSet);
m_prefixes.put("\u2019", tmpSet);

// set of suffix letters
// also included are some Skt letters b/c they occur often in suffix position in Skt words
var m_suffixes = new newHashSet();
m_suffixes.add("'");
m_suffixes.add("\u2018");
m_suffixes.add("\u2019");
m_suffixes.add("g");
m_suffixes.add("ng");
m_suffixes.add("d");
m_suffixes.add("n");
m_suffixes.add("b");
m_suffixes.add("m");
m_suffixes.add("r");
m_suffixes.add("l");
m_suffixes.add("s");
m_suffixes.add("N");
m_suffixes.add("T");
m_suffixes.add("-n");
m_suffixes.add("-t");

// suffix2 => set of letters before
var m_suff2 = new newHashMap();
tmpSet = new newHashSet();
tmpSet.add("g");
tmpSet.add("ng");
tmpSet.add("b");
tmpSet.add("m");
m_suff2.put("s", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("n");
tmpSet.add("r");
tmpSet.add("l");
m_suff2.put("d", tmpSet);

// root letter index for very ambiguous three-stack syllables
var m_ambiguous_key = new newHashMap();
m_ambiguous_key.put("dgs", 	1);
m_ambiguous_key.put("dms", 	1);
m_ambiguous_key.put("'gs", 	1);
m_ambiguous_key.put("mngs", 	0);
m_ambiguous_key.put("bgs", 	0);
m_ambiguous_key.put("dbs", 	1);

var m_ambiguous_wylie = new newHashMap();
m_ambiguous_wylie.put("dgs", 	"dgas");
m_ambiguous_wylie.put("dms", 	"dmas");
m_ambiguous_wylie.put("'gs", 	"'gas");
m_ambiguous_wylie.put("mngs", 	"mangs");
m_ambiguous_wylie.put("bgs", 	"bags");
m_ambiguous_wylie.put("dbs", 	"dbas");

// *** Unicode to Wylie mappings ***

// top letters
var m_tib_top = new newHashMap();
m_tib_top.put('\u0f40', 	"k");
m_tib_top.put('\u0f41', 	"kh");
m_tib_top.put('\u0f42', 	"g");
m_tib_top.put('\u0f43', 	"g+h");
m_tib_top.put('\u0f44', 	"ng");
m_tib_top.put('\u0f45', 	"c");
m_tib_top.put('\u0f46', 	"ch");
m_tib_top.put('\u0f47', 	"j");
m_tib_top.put('\u0f49', 	"ny");
m_tib_top.put('\u0f4a', 	"T");
m_tib_top.put('\u0f4b', 	"Th");
m_tib_top.put('\u0f4c', 	"D");
m_tib_top.put('\u0f4d', 	"D+h");
m_tib_top.put('\u0f4e', 	"N");
m_tib_top.put('\u0f4f', 	"t");
m_tib_top.put('\u0f50', 	"th");
m_tib_top.put('\u0f51', 	"d");
m_tib_top.put('\u0f52', 	"d+h");
m_tib_top.put('\u0f53', 	"n");
m_tib_top.put('\u0f54', 	"p");
m_tib_top.put('\u0f55', 	"ph");
m_tib_top.put('\u0f56', 	"b");
m_tib_top.put('\u0f57', 	"b+h");
m_tib_top.put('\u0f58', 	"m");
m_tib_top.put('\u0f59', 	"ts");
m_tib_top.put('\u0f5a', 	"tsh");
m_tib_top.put('\u0f5b', 	"dz");
m_tib_top.put('\u0f5c', 	"dz+h");
m_tib_top.put('\u0f5d', 	"w");
m_tib_top.put('\u0f5e', 	"zh");
m_tib_top.put('\u0f5f', 	"z");
m_tib_top.put('\u0f60', 	"'");
m_tib_top.put('\u0f61', 	"y");
m_tib_top.put('\u0f62', 	"r");
m_tib_top.put('\u0f63', 	"l");
m_tib_top.put('\u0f64', 	"sh");
m_tib_top.put('\u0f65', 	"Sh");
m_tib_top.put('\u0f66', 	"s");
m_tib_top.put('\u0f67', 	"h");
m_tib_top.put('\u0f68', 	"a");
m_tib_top.put('\u0f69', 	"k+Sh");
m_tib_top.put('\u0f6a', 	"R");

// subjoined letters
var m_tib_subjoined = new newHashMap();
m_tib_subjoined.put('\u0f90', 	"k");
m_tib_subjoined.put('\u0f91', 	"kh");
m_tib_subjoined.put('\u0f92', 	"g");
m_tib_subjoined.put('\u0f93', 	"g+h");
m_tib_subjoined.put('\u0f94', 	"ng");
m_tib_subjoined.put('\u0f95', 	"c");
m_tib_subjoined.put('\u0f96', 	"ch");
m_tib_subjoined.put('\u0f97', 	"j");
m_tib_subjoined.put('\u0f99', 	"ny");
m_tib_subjoined.put('\u0f9a', 	"T");
m_tib_subjoined.put('\u0f9b', 	"Th");
m_tib_subjoined.put('\u0f9c', 	"D");
m_tib_subjoined.put('\u0f9d', 	"D+h");
m_tib_subjoined.put('\u0f9e', 	"N");
m_tib_subjoined.put('\u0f9f', 	"t");
m_tib_subjoined.put('\u0fa0', 	"th");
m_tib_subjoined.put('\u0fa1', 	"d");
m_tib_subjoined.put('\u0fa2', 	"d+h");
m_tib_subjoined.put('\u0fa3', 	"n");
m_tib_subjoined.put('\u0fa4', 	"p");
m_tib_subjoined.put('\u0fa5', 	"ph");
m_tib_subjoined.put('\u0fa6', 	"b");
m_tib_subjoined.put('\u0fa7', 	"b+h");
m_tib_subjoined.put('\u0fa8', 	"m");
m_tib_subjoined.put('\u0fa9', 	"ts");
m_tib_subjoined.put('\u0faa', 	"tsh");
m_tib_subjoined.put('\u0fab', 	"dz");
m_tib_subjoined.put('\u0fac', 	"dz+h");
m_tib_subjoined.put('\u0fad', 	"w");
m_tib_subjoined.put('\u0fae', 	"zh");
m_tib_subjoined.put('\u0faf', 	"z");
m_tib_subjoined.put('\u0fb0', 	"'");
m_tib_subjoined.put('\u0fb1', 	"y");
m_tib_subjoined.put('\u0fb2', 	"r");
m_tib_subjoined.put('\u0fb3', 	"l");
m_tib_subjoined.put('\u0fb4', 	"sh");
m_tib_subjoined.put('\u0fb5', 	"Sh");
m_tib_subjoined.put('\u0fb6', 	"s");
m_tib_subjoined.put('\u0fb7', 	"h");
m_tib_subjoined.put('\u0fb8', 	"a");
m_tib_subjoined.put('\u0fb9', 	"k+Sh");
m_tib_subjoined.put('\u0fba', 	"W");
m_tib_subjoined.put('\u0fbb', 	"Y");
m_tib_subjoined.put('\u0fbc', 	"R");

// vowel signs:
// a-chen is not here because that's a top character, not a vowel sign.
// pre-composed "I" and "U" are dealt here; other pre-composed Skt vowels are more
// easily handled by a global replace in toWylie(), b/c they turn into subjoined "r"/"l".

var m_tib_vowel = new newHashMap();
m_tib_vowel.put('\u0f71', 	"A");
m_tib_vowel.put('\u0f72', 	"i");
m_tib_vowel.put('\u0f73', 	"I");
m_tib_vowel.put('\u0f74', 	"u");
m_tib_vowel.put('\u0f75', 	"U");
m_tib_vowel.put('\u0f7a', 	"e");
m_tib_vowel.put('\u0f7b', 	"ai");
m_tib_vowel.put('\u0f7c', 	"o");
m_tib_vowel.put('\u0f7d', 	"au");
m_tib_vowel.put('\u0f80', 	"-i");

// long (Skt) vowels
var m_tib_vowel_long = new newHashMap();
m_tib_vowel_long.put("i", 	"I");
m_tib_vowel_long.put("u", 	"U");
m_tib_vowel_long.put("-i", 	"-I");

// final symbols => wylie
var m_tib_final_wylie = new newHashMap();
m_tib_final_wylie.put('\u0f7e', 	"M");
m_tib_final_wylie.put('\u0f82', 	"~M`");
m_tib_final_wylie.put('\u0f83', 	"~M");
m_tib_final_wylie.put('\u0f37', 	"X");
m_tib_final_wylie.put('\u0f35', 	"~X");
m_tib_final_wylie.put('\u0f39', 	"^");
m_tib_final_wylie.put('\u0f7f', 	"H");
m_tib_final_wylie.put('\u0f84', 	"?");

// final symbols by class
var m_tib_final_class = new newHashMap();
m_tib_final_class.put('\u0f7e', 	"M");
m_tib_final_class.put('\u0f82', 	"M");
m_tib_final_class.put('\u0f83', 	"M");
m_tib_final_class.put('\u0f37', 	"X");
m_tib_final_class.put('\u0f35', 	"X");
m_tib_final_class.put('\u0f39', 	"^");
m_tib_final_class.put('\u0f7f', 	"H");
m_tib_final_class.put('\u0f84', 	"?");

// special characters introduced by ^
var m_tib_caret = new newHashMap();
m_tib_caret.put("ph", 	"f");
m_tib_caret.put("b", 	"v");

// other stand-alone characters
var m_tib_other = new newHashMap();
m_tib_other.put(' ', 		"_");
m_tib_other.put('\u0f04', 	"@");
m_tib_other.put('\u0f05', 	"#");
m_tib_other.put('\u0f06', 	"$");
m_tib_other.put('\u0f07', 	"%");
m_tib_other.put('\u0f08', 	"!");
m_tib_other.put('\u0f0b', 	" ");
m_tib_other.put('\u0f0c', 	"*");
m_tib_other.put('\u0f0d', 	"/");
m_tib_other.put('\u0f0e', 	"//");
m_tib_other.put('\u0f0f', 	";");
m_tib_other.put('\u0f11', 	"|");
m_tib_other.put('\u0f14', 	":");
m_tib_other.put('\u0f20', 	"0");
m_tib_other.put('\u0f21', 	"1");
m_tib_other.put('\u0f22', 	"2");
m_tib_other.put('\u0f23', 	"3");
m_tib_other.put('\u0f24', 	"4");
m_tib_other.put('\u0f25', 	"5");
m_tib_other.put('\u0f26', 	"6");
m_tib_other.put('\u0f27', 	"7");
m_tib_other.put('\u0f28', 	"8");
m_tib_other.put('\u0f29', 	"9");
m_tib_other.put('\u0f34', 	"=");
m_tib_other.put('\u0f3a', 	"<");
m_tib_other.put('\u0f3b', 	">");
m_tib_other.put('\u0f3c', 	"(");
m_tib_other.put('\u0f3d', 	")");

// all these stacked consonant combinations don't need "+"s in them
var m_tib_stacks = new newHashSet();
m_tib_stacks.add("b+l");
m_tib_stacks.add("b+r");
m_tib_stacks.add("b+y");
m_tib_stacks.add("c+w");
m_tib_stacks.add("d+r");
m_tib_stacks.add("d+r+w");
m_tib_stacks.add("d+w");
m_tib_stacks.add("dz+r");
m_tib_stacks.add("g+l");
m_tib_stacks.add("g+r");
m_tib_stacks.add("g+r+w");
m_tib_stacks.add("g+w");
m_tib_stacks.add("g+y");
m_tib_stacks.add("h+r");
m_tib_stacks.add("h+w");
m_tib_stacks.add("k+l");
m_tib_stacks.add("k+r");
m_tib_stacks.add("k+w");
m_tib_stacks.add("k+y");
m_tib_stacks.add("kh+r");
m_tib_stacks.add("kh+w");
m_tib_stacks.add("kh+y");
m_tib_stacks.add("l+b");
m_tib_stacks.add("l+c");
m_tib_stacks.add("l+d");
m_tib_stacks.add("l+g");
m_tib_stacks.add("l+h");
m_tib_stacks.add("l+j");
m_tib_stacks.add("l+k");
m_tib_stacks.add("l+ng");
m_tib_stacks.add("l+p");
m_tib_stacks.add("l+t");
m_tib_stacks.add("l+w");
m_tib_stacks.add("m+r");
m_tib_stacks.add("m+y");
m_tib_stacks.add("n+r");
m_tib_stacks.add("ny+w");
m_tib_stacks.add("p+r");
m_tib_stacks.add("p+y");
m_tib_stacks.add("ph+r");
m_tib_stacks.add("ph+y");
m_tib_stacks.add("ph+y+w");
m_tib_stacks.add("r+b");
m_tib_stacks.add("r+d");
m_tib_stacks.add("r+dz");
m_tib_stacks.add("r+g");
m_tib_stacks.add("r+g+w");
m_tib_stacks.add("r+g+y");
m_tib_stacks.add("r+j");
m_tib_stacks.add("r+k");
m_tib_stacks.add("r+k+y");
m_tib_stacks.add("r+l");
m_tib_stacks.add("r+m");
m_tib_stacks.add("r+m+y");
m_tib_stacks.add("r+n");
m_tib_stacks.add("r+ng");
m_tib_stacks.add("r+ny");
m_tib_stacks.add("r+t");
m_tib_stacks.add("r+ts");
m_tib_stacks.add("r+ts+w");
m_tib_stacks.add("r+w");
m_tib_stacks.add("s+b");
m_tib_stacks.add("s+b+r");
m_tib_stacks.add("s+b+y");
m_tib_stacks.add("s+d");
m_tib_stacks.add("s+g");
m_tib_stacks.add("s+g+r");
m_tib_stacks.add("s+g+y");
m_tib_stacks.add("s+k");
m_tib_stacks.add("s+k+r");
m_tib_stacks.add("s+k+y");
m_tib_stacks.add("s+l");
m_tib_stacks.add("s+m");
m_tib_stacks.add("s+m+r");
m_tib_stacks.add("s+m+y");
m_tib_stacks.add("s+n");
m_tib_stacks.add("s+n+r");
m_tib_stacks.add("s+ng");
m_tib_stacks.add("s+ny");
m_tib_stacks.add("s+p");
m_tib_stacks.add("s+p+r");
m_tib_stacks.add("s+p+y");
m_tib_stacks.add("s+r");
m_tib_stacks.add("s+t");
m_tib_stacks.add("s+ts");
m_tib_stacks.add("s+w");
m_tib_stacks.add("sh+r");
m_tib_stacks.add("sh+w");
m_tib_stacks.add("t+r");
m_tib_stacks.add("t+w");
m_tib_stacks.add("th+r");
m_tib_stacks.add("ts+w");
m_tib_stacks.add("tsh+w");
m_tib_stacks.add("z+l");
m_tib_stacks.add("z+w");
m_tib_stacks.add("zh+w");

// a map used to split the input string into tokens for fromWylie().
// all letters which start tokens longer than one letter are mapped to the max length of
// tokens starting with that letter.  
var m_tokens_start = new newHashMap();
m_tokens_start.put('S', 2);
m_tokens_start.put('/', 2);
m_tokens_start.put('d', 4);
m_tokens_start.put('g', 3);
m_tokens_start.put('b', 3);
m_tokens_start.put('D', 3);
m_tokens_start.put('z', 2);
m_tokens_start.put('~', 3);
m_tokens_start.put('-', 4);
m_tokens_start.put('T', 2);
m_tokens_start.put('a', 2);
m_tokens_start.put('k', 2);
m_tokens_start.put('t', 3);
m_tokens_start.put('s', 2);
m_tokens_start.put('c', 2);
m_tokens_start.put('n', 2);
m_tokens_start.put('p', 2);
m_tokens_start.put('\r', 2);

// also for tokenization - a set of tokens longer than one letter
var m_tokens = new newHashSet();
m_tokens.add("-d+h");
m_tokens.add("dz+h");
m_tokens.add("-dh");
m_tokens.add("-sh");
m_tokens.add("-th");
m_tokens.add("D+h");
m_tokens.add("b+h");
m_tokens.add("d+h");
m_tokens.add("dzh");
m_tokens.add("g+h");
m_tokens.add("tsh");
m_tokens.add("~M`");
m_tokens.add("-I");
m_tokens.add("-d");
m_tokens.add("-i");
m_tokens.add("-n");
m_tokens.add("-t");
m_tokens.add("//");
m_tokens.add("Dh");
m_tokens.add("Sh");
m_tokens.add("Th");
m_tokens.add("ai");
m_tokens.add("au");
m_tokens.add("bh");
m_tokens.add("ch");
m_tokens.add("dh");
m_tokens.add("dz");
m_tokens.add("gh");
m_tokens.add("kh");
m_tokens.add("ng");
m_tokens.add("ny");
m_tokens.add("ph");
m_tokens.add("sh");
m_tokens.add("th");
m_tokens.add("ts");
m_tokens.add("zh");
m_tokens.add("~M");
m_tokens.add("~X");
m_tokens.add("\r\n");

// A class to encapsulate the return value of fromWylieOneStack.
var WylieStack = function() {
	this.uni_string = ''
	this.tokens_used = 0
	this.single_consonant = ''
	this.single_cons_a = ''
	this.warns = []
	this.visarga = false
	return this
}

// Looking from i onwards within tokens, returns as many consonants as it finds,
// up to and not including the next vowel or punctuation.  Skips the caret "^".
// Returns: a string of consonants joined by "+" signs.
function consonantString(tokens, i) { // strings, int
	var out = [];
	var t = '';
	while (tokens[i] != null) {
		t = tokens[i++];
		if (t == '+' || t == '^') continue;
		if (consonant(t) == null) break;
		out.push(t);
	}
	return out.join("+");
}

// Looking from i backwards within tokens, at most up to orig_i, returns as 
// many consonants as it finds, up to and not including the next vowel or
// punctuation.  Skips the caret "^".
// Returns: a string of consonants (in forward order) joined by "+" signs.
function consonantStringBackwards(tokens, i, orig_i) {
	var out = [];
	var t = '';
	while (i >= orig_i && tokens[i] != null) {
		t = tokens[i--];
		if (t == '+' || t == '^') continue;
		if (consonant(t) == null) break;
		out.unshift(t);
	}
	return out.join("+");
}

// A class to encapsulate the return value of fromWylieOneTsekbar.
var WylieTsekbar = function() {
	this.uni_string = ''
	this.tokens_used = 0
	this.warns = []
	return this
}
// A class to encapsulate an analyzed tibetan stack, while converting Unicode to Wylie.
var ToWylieStack = function() {
	this.top = ''
	this.stack = []
	this.caret = false
	this.vowels = []
	this.finals = []
	this.finals_found = newHashMap()
	this.visarga = false
	this.cons_str = ''
	this.single_cons = ''
	this.prefix = false
	this.suffix = false
	this.suff2 = false
	this.dot = false
	this.tokens_used = 0
	this.warns = []
	return this
}

// A class to encapsulate the return value of toWylieOneTsekbar.
var ToWylieTsekbar = function() {
	this.wylie = ''
	this.tokens_used = 0
	this.warns = []
	return this
}

// Converts successive stacks of Wylie into unicode, starting at the given index
// within the array of tokens. 
// 
// Assumes that the first available token is valid, and is either a vowel or a consonant.
// Returns a WylieTsekbar object
// HELPER CLASSES AND STRUCTURES
var State = { PREFIX: 0, MAIN: 1, SUFF1: 2, SUFF2: 3, NONE: 4 }
	// split a string into Wylie tokens; 
	// make sure there is room for at least one null element at the end of the array
var splitIntoTokens = function(str) {
	var tokens = [] // size = str.length + 2
	var i = 0;
	var maxlen = str.length;
	TOKEN:
	while (i < maxlen) {
		var c = str.charAt(i);
		var mlo = m_tokens_start.get(c);
		// if there are multi-char tokens starting with this char, try them
		if (mlo != null) {
			for (var len = mlo; len > 1; len--) {
				if (i <= maxlen - len) {
					var tr = str.substring(i, i + len);
					if (m_tokens.contains(tr)) {
						tokens.push(tr);
						i += len;
						continue TOKEN;
					}
				}
			}
		}
		// things starting with backslash are special
		if (c == '\\' && i <= maxlen - 2) {
			if (str.charAt(i + 1) == 'u' && i <= maxlen - 6) {
				tokens.push(str.substring(i, i + 6));		// \\uxxxx
				i += 6;
			} else if (str.charAt(i + 1) == 'U' && i <= maxlen - 10) {
				tokens.push(str.substring(i, i + 10));		// \\Uxxxxxxxx
				i += 10;
			} else {
				tokens.push(str.substring(i, i + 2));		// \\x
				i += 2;
			}
			continue TOKEN;
		}
		// otherwise just take one char
		tokens.push(c.toString());
		i += 1;
	}
	return tokens;
}

// helper functions to access the various hash tables
var consonant = function(s) { return m_consonant.get(s) }
var subjoined = function(s) { return m_subjoined.get(s) }
var vowel = function(s) { return m_vowel.get(s) }
var final_uni = function(s) { return m_final_uni.get(s) }
var final_class = function(s) { return m_final_class.get(s) }
var other = function(s) { return m_other.get(s) }
var isSpecial = function(s) { return m_special.contains(s) }
var isSuperscript = function(s) { return m_superscripts.containsKey(s) }
var superscript = function(sup, below) {
	var tmpSet = m_superscripts.get(sup);
	if (tmpSet == null) return false;
	return tmpSet.contains(below);
}
var isSubscript = function(s) { return m_subscripts.containsKey(s) }
var subscript = function(sub, above) {
	var tmpSet = m_subscripts.get(sub);
	if (tmpSet == null) return false;
	return tmpSet.contains(above);
}
var isPrefix = function(s) { return m_prefixes.containsKey(s) }
var prefix = function(pref, after) {
	var tmpSet = m_prefixes.get(pref);
	if (tmpSet == null) return false;
	return tmpSet.contains(after);
}
var isSuffix = function(s) { return m_suffixes.contains(s) }
var isSuff2 = function(s) { return m_suff2.containsKey(s) }
var suff2 = function(suff, before) {
	var tmpSet = m_suff2.get(suff);
	if (tmpSet == null) return false;
	return tmpSet.contains(before);
}
var ambiguous_key = function(syll) { return m_ambiguous_key.get(syll) }
var ambiguous_wylie = function(syll) { return m_ambiguous_wylie.get(syll) }
var tib_top = function(c) { return m_tib_top.get(c) }
var tib_subjoined = function(c) { return m_tib_subjoined.get(c) }
var tib_vowel = function(c) { return m_tib_vowel.get(c) }
var tib_vowel_long = function(s) { return m_tib_vowel_long.get(s) }
var tib_final_wylie = function(c) { return m_tib_final_wylie.get(c) }
var tib_final_class = function(c) { return m_tib_final_class.get(c) }
var tib_caret = function(s) { return m_tib_caret.get(s) }
var tib_other = function(c) { return m_tib_other.get(c) }
var tib_stack = function(s) { return m_tib_stacks.contains(s) }

// does this string consist of only hexadecimal digits?
function validHex(t) {
	for (var i = 0; i < t.length; i++) {
		var c = t.charAt(i);
		if (!((c >= 'a' && c <= 'f') || (c >= '0' && c <= '9'))) return false;
	}
	return true;
}

// generate a warning if we are keeping them; prints it out if we were asked to
// handle a Wylie unicode escape, \\uxxxx or \\Uxxxxxxxx
function unicodeEscape (warns, line, t) { // [], int, str
	var hex = t.substring(2);
	if (hex == '') return null;
	if (!validHex(hex)) {
		warnl(warns, line, "\"" + t + "\": invalid hex code.");
		return "";
	}
	return String.fromCharCode(parseInt(hex, 16))
}

function warn(warns, str) {
	if (warns != null) warns.push(str);
	if (opt.print_warnings) console.log(str);
}

// warn with line number
function warnl(warns, line, str) {
	warn(warns, "line " + line + ": " + str);
}

function fromWylieOneTsekbar(tokens, i) { // (str, int)
	var orig_i = i
	var t = tokens[i]
	// variables for tracking the state within the syllable as we parse it
	var stack = null
	var prev_cons = ''
	var visarga = false
	// variables for checking the root letter, after parsing a whole tsekbar made of only single
	// consonants and one consonant with "a" vowel
	var check_root = true
	var consonants = [] // strings
	var root_idx = -1
	var out = ''
	var warns = []
	// the type of token that we are expecting next in the input stream
	//   - PREFIX : expect a prefix consonant, or a main stack
	//   - MAIN   : expect only a main stack
	//   - SUFF1  : expect a 1st suffix 
	//   - SUFF2  : expect a 2nd suffix
	//   - NONE   : expect nothing (after a 2nd suffix)
	//
	// the state machine is actually more lenient than this, in that a "main stack" is allowed
	// to come at any moment, even after suffixes.  this is because such syllables are sometimes
	// found in abbreviations or other places.  basically what we check is that prefixes and 
	// suffixes go with what they are attached to.
	//
	// valid tsek-bars end in one of these states: SUFF1, SUFF2, NONE
	var state = State.PREFIX;

	// iterate over the stacks of a tsek-bar
	STACK:
	while (t != null && (vowel(t) != null || consonant(t) != null) && !visarga) {
		// translate a stack
		if (stack != null) prev_cons = stack.single_consonant;
		stack = fromWylieOneStack(tokens, i);
		i += stack.tokens_used;
		t = tokens[i];
		out += stack.uni_string;
		warns = warns.concat(stack.warns);
		visarga = stack.visarga;
		if (!opt.check) continue;
		// check for syllable structure consistency by iterating a simple state machine
		// - prefix consonant
		if (state == State.PREFIX && stack.single_consonant != null) {
			consonants.push(stack.single_consonant);
			if (isPrefix(stack.single_consonant)) {
			var next = t;
			if (opt.check_strict) next = consonantString(tokens, i);
			if (next != null && !prefix(stack.single_consonant, next)) {
				next = next.replace(/\+/g, "");
				warns.push("Prefix \"" + stack.single_consonant + "\" does not occur before \"" + next + "\".");
			}
		} else {
			warns.push("Invalid prefix consonant: \"" + stack.single_consonant + "\".");
		}
		state = State.MAIN;
		// - main stack with vowel or multiple consonants
		} else if (stack.single_consonant == null) {
		state = State.SUFF1;
		// keep track of the root consonant if it was a single cons with an "a" vowel
		if (root_idx >= 0) {
			check_root = false;
		} else if (stack.single_cons_a != null) {
			consonants.push(stack.single_cons_a);
			root_idx = consonants.length - 1;
		}
		// - unexpected single consonant after prefix
		} else if (state == State.MAIN) {
			warns.push("Expected vowel after \"" + stack.single_consonant + "\".");
			// - 1st suffix
		} else if (state == State.SUFF1) {
			consonants.push(stack.single_consonant);
			// check this one only in strict mode b/c it trips on lots of Skt stuff
			if (opt.check_strict) {
				if (!isSuffix(stack.single_consonant)) {
					warns.push("Invalid suffix consonant: \"" + stack.single_consonant + "\".");
				}
			}
			state = State.SUFF2;
			// - 2nd suffix
		} else if (state == State.SUFF2) {
			consonants.push(stack.single_consonant);
			if (isSuff2(stack.single_consonant)) {
				if (!suff2(stack.single_consonant, prev_cons)) {
					warns.push("Second suffix \"" + stack.single_consonant 
					+ "\" does not occur after \"" + prev_cons + "\".");
				}
			} else {
				warns.push("Invalid 2nd suffix consonant: \"" + stack.single_consonant  + "\".");
			}
			state = State.NONE;
			// - more crap after a 2nd suffix
		} else if (state == State.NONE) {
			warns.push("Cannot have another consonant \"" + stack.single_consonant + "\" after 2nd suffix.");
		}
	}

	if (state == State.MAIN && stack.single_consonant != null && isPrefix(stack.single_consonant)) {
	warns.push("Vowel expected after \"" + stack.single_consonant + "\".");
	}

	// check root consonant placement only if there were no warnings so far, and the syllable 
	// looks ambiguous.  not many checks are needed here because the previous state machine 
	// already takes care of most illegal combinations.
	if (opt.check && warns.length == 0 && check_root && root_idx >= 0) {
		// 2 letters where each could be prefix/suffix: root is 1st
		if (consonants.length == 2 && root_idx != 0 
		&& prefix(consonants[0], consonants[1]) && isSuffix(consonants[1]))
		{
			warns.push("Syllable should probably be \"" + consonants[0] + "a" + consonants[1] + "\".");

			// 3 letters where 1st can be prefix, 2nd can be postfix before "s" and last is "s":
			// use a lookup table as this is completely ambiguous.
		} else if (consonants.length == 3 && isPrefix(consonants[0]) &&
			suff2("s", consonants[1]) && consonants[2] == "s")
		{
			var cc = consonants.join("");
			cc = cc.replace(/\u2018/g, '\'');
			cc = cc.replace(/\u2019/g, '\'');	// typographical quotes
			var expect_key = ambiguous_key(cc);
	//		console.log('typeof expect_key', typeof expect_key)
			if (expect_key != null && expect_key != root_idx) {
				warns.push("Syllable should probably be \"" + ambiguous_wylie(cc) + "\".");
			}
		}
	}
	// return the stuff as a WylieTsekbar struct
	var ret = new WylieTsekbar();
	ret.uni_string = out;
	ret.tokens_used = i - orig_i;
	ret.warns = warns;
	return ret;
}

    // Converts one stack's worth of Wylie into unicode, starting at the given index
    // within the array of tokens.
    // Assumes that the first available token is valid, and is either a vowel or a consonant.
    // Returns a WylieStack object.
function fromWylieOneStack(tokens, i) {
	var orig_i = i
	var t = '', t2 = '', o = ''
	var out = ''
	var warns = []
	var consonants = 0		// how many consonants found
	var vowel_found = null; // any vowels (including a-chen)
	var vowel_sign = null; // any vowel signs (that go under or above the main stack)
	var single_consonant = null; // did we find just a single consonant?
	var plus = false;		// any explicit subjoining via '+'?
	var caret = 0;			// find any '^'?
	var final_found = new newHashMap(); // keep track of finals (H, M, etc) by class

	// do we have a superscript?
	t = tokens[i]
	t2 = tokens[i + 1]
	if (t2 != null && isSuperscript(t) && superscript(t, t2)) {
		if (opt.check_strict) {
			var next = consonantString(tokens, i + 1);
			if (!superscript(t, next)) {
				next = next.replace(/\+/g, '')
				warns.push("Superscript \"" + t + "\" does not occur above combination \"" + next + "\".");
			}
		}
		out += consonant(t);
		consonants++;
		i++;
		while (tokens[i] != null && tokens[i] == ("^")) { caret++; i++; }
	}
	// main consonant + stuff underneath.
	// this is usually executed just once, but the "+" subjoining operator makes it come back here
	MAIN: 
	while (true) {
		// main consonant (or a "a" after a "+")
		t = tokens[i];
		if (consonant(t) != null || (out.length > 0 && subjoined(t) != null)) {
			if (out.length > 0) {
				out += (subjoined(t));
			} else {
				out += (consonant(t));
			}
			i++;

			if (t == "a") {
				vowel_found = "a";
			} else {
				consonants++;
				single_consonant = t;
			}

			while (tokens[i] != null && tokens[i] == "^") {
				caret++;
				i++;
			}
			// subjoined: rata, yata, lata, wazur.  there can be up two subjoined letters in a stack.
			for (var z = 0; z < 2; z++) {
				t2 = tokens[i];
				if (t2 != null && isSubscript(t2)) {
					// lata does not occur below multiple consonants 
					// (otherwise we mess up "brla" = "b.r+la")
					if (t2 == "l" && consonants > 1) break;
					// full stack checking (disabled by "+")
					if (opt.check_strict && !plus) {
						var prev = consonantStringBackwards(tokens, i-1, orig_i);
						if (!subscript(t2, prev)) {
							prev = prev.replace(/\+/g, "");
							warns.push("Subjoined \"" + t2 + "\" not expected after \"" + prev + "\".");
						}
						// simple check only
					} else if (opt.check) {
						if (!subscript(t2, t) && !(z == 1 && t2 == ("w") && t == ("y"))) {
							warns.push("Subjoined \"" + t2 + "\"not expected after \"" + t + "\".");
						}
					}
					out += subjoined(t2);
					i++;
					consonants++;
					while (tokens[i] != null && tokens[i] == ("^")) { caret++; i++; }
					t = t2;
				} else {
					break;
				}
			}
		}

		// caret (^) can come anywhere in Wylie but in Unicode we generate it at the end of 
		// the stack but before vowels if it came there (seems to be what OpenOffice expects),
		// or at the very end of the stack if that's how it was in the Wylie.
		if (caret > 0) {
			if (caret > 1) {
				warns.push("Cannot have more than one \"^\" applied to the same stack.");
			}
			final_found.put(final_class("^"), "^");
			out += (final_uni("^"));
			caret = 0;
		}
		// vowel(s)
		t = tokens[i];
		if (t != null && vowel(t) != null) {
			if (out.length == 0) out += (vowel("a"));
			if (t != "a") out += (vowel(t));
			i++;
			vowel_found = t;
			if (t != "a") vowel_sign = t;
		}
		// plus sign: forces more subjoining
		t = tokens[i];
		if (t != null && t == ("+")) {
			i++;
			plus = true;
			// sanity check: next token must be vowel or subjoinable consonant.  
			t = tokens[i];
			if (t == null || (vowel(t) == null && subjoined(t) == null)) {
				if (opt.check) warns.push("Expected vowel or consonant after \"+\".");
				break MAIN;
			}
			// consonants after vowels doesn't make much sense but process it anyway
			if (opt.check) {
				if (vowel(t) == null && vowel_sign != null) {
					warns.push("Cannot subjoin consonant (" + t + ") after vowel (" + vowel_sign + ") in same stack.");
				} else if (t == ("a") && vowel_sign != null) {
					warns.push("Cannot subjoin a-chen (a) after vowel (" + vowel_sign + ") in same stack.");
				}
			}
			continue MAIN;
		}
		break MAIN;
	}
	// final tokens
	t = tokens[i];
	while (t != null && final_class(t) != null) {
		var uni = final_uni(t);
		var klass = final_class(t);
		// check for duplicates
		if (final_found.containsKey(klass)) {
			if (final_found.get(klass) == t) {
				warns.push("Cannot have two \"" + t + "\" applied to the same stack.");
			} else {
				warns.push("Cannot have \"" + t + "\" and \"" + final_found.get(klass)
					+ "\" applied to the same stack.");
			}
		} else {
			final_found.put(klass, t);
			out += (uni);
		}
		i++;
		single_consonant = null;
		t = tokens[i];
	}
	// if next is a dot "." (stack separator), skip it.
	if (tokens[i] != null && tokens[i] == (".")) i++;
	// if we had more than a consonant and no vowel, and no explicit "+" joining, backtrack and 
	// return the 1st consonant alone
	if (consonants > 1 && vowel_found == null) {
		if (plus) {
			if (opt.check) warns.push("Stack with multiple consonants should end with vowel.");
		} else {
			i = orig_i + 1;
			consonants = 1;
			single_consonant = tokens[orig_i];
			out = '';
			out += (consonant(single_consonant));
		}
	}
	// calculate "single consonant"
	if (consonants != 1 || plus) {
		single_consonant = null;
	}
	// return the stuff as a WylieStack struct
	var ret = new WylieStack();
	ret.uni_string = out;
	ret.tokens_used = i - orig_i;
	if (vowel_found != null) {
		ret.single_consonant = null;
	} else {
		ret.single_consonant = single_consonant;
	}

	if (vowel_found != null && vowel_found == ("a")) {
		ret.single_cons_a = single_consonant;
	} else {
		ret.single_cons_a = null;
	}
	ret.warns = warns;
	ret.visarga = final_found.containsKey("H");
	return ret;
}

	// Converts a Wylie (EWTS) string to unicode.  If 'warns' is not 'null', puts warnings into it.
function fromWylie(str, warns) {
		var out = '', line = 1, units = 0, i = 0
		if (opt.fix_spacing) { str = str.replace(/^\s+/, '') }
		var tokens = splitIntoTokens(str);
		ITER:while (tokens[i] != null) {
			var t = tokens[i], o = null
			// [non-tibetan text] : pass through, nesting brackets
			if (t == "[") {
				var nesting = 1;
				i++;
					ESC:while (tokens[i] != null) {
					t = tokens[i++];
					if (t == "[") nesting++;
					if (t == "]") nesting--;
					if (nesting == 0) continue ITER;
					// handle unicode escapes and \1-char escapes within [comments]...
					if (t.charAt(0) == '\\' && (t.charAt(1) == 'u' || t.charAt(1) == 'U')) {
						o = unicodeEscape(warns, line, t);
						if (o != null) {
							out += o;
							continue ESC;
						}
					}
					if (t.charAt(0) == '\\') {
						o = t.substring(1);
					} else {
						o = t;
					}
					out += o;
				}
				warnl(warns, line, "Unfinished [non-Wylie stuff].");
				break ITER;
			}
			// punctuation, numbers, etc
			o = other(t);
			if (o != null) {
				out += o;
				i++;
				units++;
				// collapse multiple spaces?
				if (t == " " && opt.fix_spacing) {
					while (tokens[i] != null && tokens[i] == " ") i++;
				}
				continue ITER;
			}
			// vowels & consonants: process tibetan script up to a tsek, punctuation or line noise
			if (vowel(t) != null || consonant(t) != null) {
				var tb = fromWylieOneTsekbar(tokens, i);
				var word = '';
				for (var j = 0; j < tb.tokens_used; j++) {
					word += (tokens[i+j]);
				}
				out += tb.uni_string;
				i += tb.tokens_used;
				units++;
				for (var w = 0; w < tb.warns.length; w++) {
					warnl(warns, line, "\"" + word + "\": " + tb.warns[w]);
				}
				continue ITER;
			}
			// *** misc unicode and line handling stuff ***
			// ignore BOM and zero-width space
			if (t == "\ufeff" || t == "\u200b") {
				i++;
				continue ITER;
			}
			// \\u, \\U unicode characters
			if (t.charAt(0) == '\\' && (t.charAt(1) == 'u' || t.charAt(1) == 'U')) {
				o = unicodeEscape(warns, line, t);
				if (o != null) {
					i++;
					out += o;
					continue ITER;
				}
			}
			// backslashed characters
			if (t.charAt(0) == '\\') {
				out += t.substring(1);
				i++;
				continue ITER;
			}
			// count lines
			if (t == "\r\n" || t == "\n" || t == "\r") {
				line++;
				out += t;
				i++;
				// also eat spaces after newlines (optional)
				if (opt.fix_spacing) {
					while (tokens[i] != null && tokens[i] == " ") i++;
				}
				continue ITER;
			}
			// stuff that shouldn't occur out of context: special chars and remaining [a-zA-Z]
			var c = t.charAt(0);
			if (isSpecial(t) || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
				warnl(warns, line, "Unexpected character \"" + t + "\".");
			}
			// anything else: pass through
			out += t;
			i++;
		}
		if (units == 0) warn(warns, "No Tibetan characters found!");
		return out
	}
	
	// given a character, return a string like "\\uxxxx", with its code in hex
function formatHex(t) { //char
		// not compatible with GWT...
		// return String.format("\\u%04x", (int)t);
		var sb = '';
		sb += '\\u';
		var s = t.charCodeAt(0).toString(16);
		for (var i = s.length; i < 4; i++) sb += '0';
		sb += s;
		return sb;
	}

	// handles spaces (if any) in the input stream, turning them into '_'.
	// this is abstracted out because in non-escaping mode, we only want to turn spaces into _
	// when they come in the middle of Tibetan script.
function handleSpaces(str, i, out) { //return int
	var found = 0;
	var orig_i = i;
	while (i < str.length && str.charAt(i) == ' ') {
		i++;
		found++;
	}
	if (found == 0 || i == str.length) return 0;
	var t = str.charAt(i);
	if (tib_top(t) == null && tib_other(t) == null) return 0;
	// found 'found' spaces between two tibetan bits; generate the same number of '_'s
	for (i = 0; i < found; i++) out += '_';
	return found;
}

// for space-handling in escaping mode: is the next thing coming (after a number of spaces)
// some non-tibetan bit, within the same line?
function followedByNonTibetan(str, i) {
	var len = str.length;
	while (i < len && str.charAt(i) == ' ') i++;
	if (i == len) return false;
	var t = str.charAt(i);
	return tib_top(t) == null && tib_other(t) == null && t != '\r' && t != '\n';
}

// Convert Unicode to Wylie: one tsekbar
function toWylieOneTsekbar(str, len, i) {
	var orig_i = i;
	var warns = [];
	var stacks = [];// ArrayList<ToWylieStack>;
	ITER: 
	while (true) {
		var st = toWylieOneStack(str, len, i);
		stacks.push(st);
		warns = warns.concat(st.warns);
		i += st.tokens_used;
		if (st.visarga) break ITER;
		if (i >= len || tib_top(str.charAt(i)) == null) break ITER;
	}
	// figure out if some of these stacks can be prefixes or suffixes (in which case
	// they don't need their "a" vowels)
	var last = stacks.length - 1;
	if (stacks.length > 1 && stacks[0].single_cons != null) {
		// we don't count the wazur in the root stack, for prefix checking
		var cs = stacks[1].cons_str.replace(/\+w/g, "")
		if (prefix(stacks[0].single_cons, cs)) stacks[0].prefix = true;
	}
	if (stacks.length > 1 && stacks[last].single_cons != null 
	&& isSuffix(stacks[last].single_cons)) {
		stacks[last].suffix = true;
	}
	if (stacks.length > 2 && stacks[last].single_cons != null 
	&& stacks[last - 1].single_cons != null
	&& isSuffix(stacks[last - 1].single_cons)
	&& suff2(stacks[last].single_cons, stacks[last - 1].single_cons)) {
		stacks[last].suff2 = true;
		stacks[last - 1].suffix = true;
	}
	// if there are two stacks and both can be prefix-suffix, then 1st is root
	if (stacks.length == 2 && stacks[0].prefix && stacks[1].suffix) {
	    stacks[0].prefix = false;
	}
	// if there are three stacks and they can be prefix, suffix and suff2, then check w/ a table
	if (stacks.length == 3 && stacks[0].prefix && stacks[1].suffix && stacks[2].suff2) {
		var strb = []
		for (var si = 0; si < stacks.length; si++) strb.push(stacks[si].single_cons)
		var ztr = strb.join('')
		var root = ambiguous_key(ztr)
		if (root == null) {
			warns.push("Ambiguous syllable found: root consonant not known for \"" + ztr + "\".")
			// make it up...  (ex. "mgas" for ma, ga, sa)
			root = 1
		}
		stacks[root].prefix = stacks[root].suffix = false
		stacks[root + 1].suff2 = false
	}
	// if the prefix together with the main stack could be mistaken for a single stack, add a "."
	if (stacks[0].prefix && tib_stack(stacks[0].single_cons + "+" + stacks[1].cons_str)) 
		stacks[0].dot = true;
	// put it all together
	var out = ''
	for (var si = 0; si < stacks.length; si++) out += putStackTogether(stacks[si])
	var ret = new ToWylieTsekbar();
	ret.wylie = out;
	ret.tokens_used = i - orig_i;
	ret.warns = warns;
	return ret;
}
	 
// Unicode to Wylie: one stack at a time
function toWylieOneStack(str, len, i) {
	var orig_i = i;
	var ffinal = null, vowel = null, klass = null;
	// split the stack into a ToWylieStack object:
	//   - top symbol
	//   - stacked signs (first is the top symbol again, then subscribed main characters...)
	//   - caret (did we find a stray tsa-phru or not?)
	//   - vowel signs (including small subscribed a-chung, "-i" Skt signs, etc)
	//   - final stuff (including anusvara, visarga, halanta...)
	//   - and some more variables to keep track of what has been found
	var st = new ToWylieStack();
	// assume: tib_top(t) exists
	var t = str.charAt(i++);
	st.top = tib_top(t);
	st.stack.push(tib_top(t));
	// grab everything else below the top sign and classify in various categories
	while (i < len) {
		t = str.charAt(i);
		var o;
		if ((o = tib_subjoined(t)) != null) {
			i++;
			st.stack.push(o);
			// check for bad ordering
			if (st.finals.length > 0) {
				st.warns.push("Subjoined sign \"" + o + "\" found after final sign \"" + ffinal + "\".");
			} else if (st.vowels.length > 0) {
				st.warns.push("Subjoined sign \"" + o + "\" found after vowel sign \"" + vowel + "\".");
			}
		} else if ((o = tib_vowel(t)) != null) {
			i++;
			st.vowels.push(o);
			if (vowel == null) vowel = o;
			// check for bad ordering
			if (st.finals.length > 0) {
				st.warns.push("Vowel sign \"" + o + "\" found after final sign \"" + ffinal + "\".");
			}
		} else if ((o = tib_final_wylie(t)) != null) {
			i++;
			klass = tib_final_class(t);
			if (o == "^") {
				st.caret = true;
			} else {
				if (o == "H") st.visarga = true;
				st.finals.push(o);
				if (ffinal == null) ffinal = o;
				// check for invalid combinations
				if (st.finals_found.containsKey(klass)) {
					st.warns.push("Final sign \"" + o 
					+ "\" should not combine with found after final sign \"" + ffinal + "\".");
				} else {
					st.finals_found.put(klass, o);
				}
			}
		} else break;
	}
	// now analyze the stack according to various rules
	// a-chen with vowel signs: remove the "a" and keep the vowel signs
	if (st.top == "a" && st.stack.length == 1 && st.vowels.length > 0) st.stack.shift();
	// handle long vowels: A+i becomes I, etc.
	if (st.vowels.length > 1 && st.vowels[0] == "A" && tib_vowel_long(st.vowels[1]) != null) {
		var l = tib_vowel_long(st.vowels[1]);
		st.vowels.shift();
		st.vowels.shift();
		st.vowels.unshift(l);
	}
	// special cases: "ph^" becomes "f", "b^" becomes "v"
	if (st.caret && st.stack.length == 1 && tib_caret(st.top) != null) {
		var l = tib_caret(st.top);
		st.top = l;
		st.stack.shift();
		st.stack.unshift(l);
		st.caret = false;
	}
	st.cons_str = st.stack.join("+");
	// if this is a single consonant, keep track of it (useful for prefix/suffix analysis)
	if (st.stack.length == 1 && st.stack[0] != ("a") && !st.caret 
	&& st.vowels.length == 0 && st.finals.length == 0) {
		st.single_cons = st.cons_str;
	}
	// return the analyzed stack
	st.tokens_used = i - orig_i;
	return st;
}

// Puts an analyzed stack together into Wylie output, adding an implicit "a" if needed.
function putStackTogether(st) {
	var out = '';
	// put the main elements together... stacked with "+" unless it's a regular stack
	if (tib_stack(st.cons_str)) {
	    out += st.stack.join("");
	} else out += (st.cons_str);
	// caret (tsa-phru) goes here as per some (halfway broken) Unicode specs...
	if (st.caret) out += ("^");
	// vowels...
	if (st.vowels.length > 0) {
		out += st.vowels.join("+");
	} else if (!st.prefix && !st.suffix && !st.suff2
	&& (st.cons_str.length == 0 || st.cons_str.charAt(st.cons_str.length - 1) != 'a')) {
		out += "a"
	}
	// final stuff
	out += st.finals.join("");
	if (st.dot) out += ".";
	return out;
}

	// Converts from Unicode strings to Wylie (EWTS) transliteration.
	//
	// Arguments are:
	//    str   : the unicode string to be converted
	//    escape: whether to escape non-tibetan characters according to Wylie encoding.
	//            if escape == false, anything that is not tibetan will be just passed through.
	//
	// Returns: the transliterated string.
	//
	// To get the warnings, call getWarnings() afterwards.

function toWylie(str, warns, escape) {
	if (escape == undefined) escape = true
	var out = ''
	var line = 1
	var units = 0
	// globally search and replace some deprecated pre-composed Sanskrit vowels
	str = str.replace(/\u0f76/g, "\u0fb2\u0f80")
	str = str.replace(/\u0f77/g, "\u0fb2\u0f71\u0f80")
	str = str.replace(/\u0f78/g, "\u0fb3\u0f80")
	str = str.replace(/\u0f79/g, "\u0fb3\u0f71\u0f80")
	str = str.replace(/\u0f81/g, "\u0f71\u0f80")
	var i = 0
	var len = str.length
	// iterate over the string, codepoint by codepoint
	ITER:
	while (i < len) {
		var t = str.charAt(i);
		// found tibetan script - handle one tsekbar
		if (tib_top(t) != null) {
			var tb = toWylieOneTsekbar(str, len, i);
			out += tb.wylie;
			i += tb.tokens_used;
			units++;
			for (var w = 0; w < tb.warns.length; w++) warnl(warns, line, tb.warns[w]);
			if (!escape) i += handleSpaces(str, i, out);
			continue ITER;
		}
		// punctuation and special stuff. spaces are tricky:
		// - in non-escaping mode: spaces are not turned to '_' here (handled by handleSpaces)
		// - in escaping mode: don't do spaces if there is non-tibetan coming, so they become part
		//   of the [escaped block].
		var o = tib_other(t);
		if (o != null && (t != ' ' || (escape && !followedByNonTibetan(str, i)))) {
			out += o;
			i++;
			units++;
			if (!escape) i += handleSpaces(str, i, out);
			continue ITER;
		}
		// newlines, count lines.  "\r\n" together count as one newline.
		if (t == '\r' || t == '\n') {
			line++;
			i++;
			out += t;
			if (t == '\r' && i < len && str.charAt(i) == '\n') {
				i++;
				out += ('\n');
			}
			continue ITER;
		}
		// ignore BOM and zero-width space
		if (t == '\ufeff' || t == '\u200b') {
			i++;
			continue ITER;
		}
		// anything else - pass along?
		if (!escape) {
			out += (t);
			i++;
			continue ITER;
		}
		// other characters in the tibetan plane, escape with \\u0fxx
		if (t >= '\u0f00' && t <= '\u0fff') {
			var c = formatHex(t);
			out += c;
			i++;
			// warn for tibetan codepoints that should appear only after a tib_top
			if (tib_subjoined(t) != null || tib_vowel(t) != null || tib_final_wylie(t) != null) {
				warnl(warns, line, "Tibetan sign " + c + " needs a top symbol to attach to.");
			}
			continue ITER;
		}
		// ... or escape according to Wylie:
		// put it in [comments], escaping [] sequences and closing at line ends
		out += "[";
		while (tib_top(t) == null && (tib_other(t) == null || t == ' ') && t != '\r' && t != '\n') {
			// \escape [opening and closing] brackets
			if (t == '[' || t == ']') {
				out += "\\";
				out += t;
			// unicode-escape anything in the tibetan plane (i.e characters not handled by Wylie)
			} else if (t >= '\u0f00' && t <= '\u0fff') {
				out += formatHex(t);
				// and just pass through anything else!
			} else {
				out += t;
			}
			if (++i >= len) break;
			t = str.charAt(i);
		}
		 out += "]";
	}
	return out;
}
var fromWylieWithWildcard=function(wy) {
	wy=wy.replace(/\./g,"．");
	wy=wy.replace(/\*/g,"※");
	var r=fromWylie(wy);
	r=r.replace(/※/g,"*");
	r=r.replace(/．/g,"?");
	r=r.replace(/([\*\?])([༠༡༢༣༤༥༦༧༨༩])/g,function(m,m1,m2){
		return m1+String.fromCharCode(m2.charCodeAt(0)-0x0EF0);
	});
	return r;
}

module.exports= {
		fromWylie: fromWylie,
		fromWylieWithWildcard: fromWylieWithWildcard,
		toWylie: toWylie,
		setopt: setopt,
		getopt: function() { return opt },
}



},{}]},{},["/home/ec2-user/ksana2015/adarsha2016/index.js"])
//# sourceMappingURL=bundle.js.map
