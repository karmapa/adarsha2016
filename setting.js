//for server
var imagefolder={
	"jiangkangyur":"lijiang"
}
window.image_url_prefix=function(){
	return "http://res.cloudinary.com/www-dharma-treasure-org/image/upload/"+(imagefolder[db]||db)+"/";
}

//for local/USB
// window.image_url_prefix=function(){return "../adarsha_img/"+(imagefolder[db]||db)+"/";}

window.toWylie=parseInt(localStorage.getItem("toWylie"))===1;
var setWylie=function(onoff){
	window.toWylie=!!onoff;
	localStorage.setItem("toWylie", window.toWylie?"1":"0");
}
