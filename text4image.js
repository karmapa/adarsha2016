var text4imagestyles={
    text:{fontSize:"28px",whiteSpace: "pre"}
}

var imgFromuti=function(uti)
{
    var utiParts = uti.split('.');
    return (pad(utiParts[0],3)+"/"+pad(utiParts[0],3)+"-"+pad(utiParts[1],4)+".jpg");
}
var pad=function (num, size) {//000000000108e 13 3
    var s = "000000000" + num;
    if(s[s.length-size-1]!="0"){
        return s.substr(s.length-size-1);
    }
    else
    {
        return s.substr(s.length-size);
    }
}

var Text4ImageComponent=null;

var systemReady2=function() {
 Text4ImageComponent=React.createClass({
    prevImage:function(event){
        console.log("prevImage");
        ksa.prev({db:db,uti:this.props.uti,count:1},function(err,res){
            if(!err)text4imageFetch(res[0].uti);
        });
    },

    nextImage:function(event){
        console.log("nextImage");
        ksa.next({db:db,uti:this.props.uti,count:1},function(err,res){
            if(!err)text4imageFetch(res[0].uti);
        });
    },
    imagefilename:function(){
        return image_url_prefix + imgFromuti(this.props.uti);
        //this.props.uti
        //return "../adarsha_img/lijiang/001/001-127b.jpg";
        //return "images/001-001b.jpg";
    }
    ,resize:function(domnode){
        setTimeout(function(){
            domnode.iviewer("set_zoom", 100);
        },200)
    }
    ,componentDidMount:function() {
        var domnode=$(this.refs.imageviewer);
        domnode.iviewer({src:this.imagefilename(),zoom_max :1000,zoom_min:50,mousewheel: true});
        this.resize(domnode);
    }
    ,componentDidUpdate:function(){
        var domnode=$(this.refs.imageviewer);
        domnode.iviewer("loadImage",this.imagefilename());
        this.resize(domnode);
    }
    ,render:function(){
        return E("div",{},
            E("button",{className:"prevImage",onClick:this.prevImage},"prev"),
            E("button",{className:"nextImage",onClick:this.nextImage},"next"),
            E("br"),
            E("div",{className:"container viewBox"},
                E("div",{className:"viewer"},
                    E("div",{className:"showBox",ref:"imageviewer"})
                )
            ),
          //  E("image",{src:this.imagefilename()}),
            //E("div",{style:text4imagestyles.text},this.props.uti,"\n",this.props.text)
            E("div",{className:"textBox container"},E("span",{className:"title"},this.props.uti),"\n",this.props.text)
        );
    }
});
};

var text4imageFetch=function(uti){
    ksa.fetch({db:db,uti:uti},function(err,data){
        ReactDOM.render(
            React.createElement(
                Text4ImageComponent,{text:data[0].text,uti:uti}
            ),
            document.getElementById("text4image")
        );

        $('#text4imagemodal').modal({
            show: 'true'
        });
    })
}

var text4image=function(e) {
    var uti=e.target.id.substr(4).replace("_",".");
    text4imageFetch(uti);
}
