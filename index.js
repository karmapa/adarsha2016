if (typeof window!=="undefined"){
    runtime=require("ksana2015-webruntime");
    runtime.boot("adarsha2016",function(){

        window.kde=require("ksana-database");
        window.kse=require("ksana-search");
        window.ksa=require("ksana-simple-api");

        window.React=require("react");
        window.ReactDOM=require("react-dom");
        window.ksana2015treetoc=require("ksana2015-treetoc");
        window.ksana2015breadcrumbtoc=require("ksana2015-breadcrumbtoc");

        //window.theme_bootstrap=require("ksana2015-breadcrumbtoc/theme_bootstrap");

        window.wylie=require("tibetan/wylie");        

        systemReady();
        systemReady2();
    });

} else if (typeof module!=="undefined") {
    module.exports={kse:require("ksana-search"),kde:require("ksana-database"),ksa:require("ksana-simple-api")}
}
