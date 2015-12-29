var E=React.createElement;
var text4imagestyles={
    text:{fontSize:"28px",whiteSpace: "pre"}
}

var imgFromuti=function(uti)
{
    var utiParts = uti.split('.');
    return (pad(utiParts[0],3)+"/"+pad(utiParts[0],3)+"-"+pad(utiParts[1],4)+".jpg");
}
var pad=function (num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

var Text4ImageComponent=React.createClass({
    imagefilename:function(){
        return "../adarsha_img/lijiang/" + imgFromuti(this.props.uti);
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
        domnode.iviewer({src:this.imagefilename(),zoom_max :1000,zoom_min:100,mousewheel: true});
        this.resize(domnode);
    }
    ,componentDidUpdate:function(){
        var domnode=$(this.refs.imageviewer);
        domnode.iviewer("loadImage",this.imagefilename());
        this.resize(domnode);
    }
    ,render:function(){
        return E("div",{},
            E("div",{className:"viewer",style:{height:"330px",width:"1280px"},ref:"imageviewer"}),
          //  E("image",{src:this.imagefilename()}),
            E("div",{style:text4imagestyles.text},this.props.uti,"\n",this.props.text)
        );
    }
});

var text4image=function(e) {
    var uti=e.target.id.substr(4).replace("_",".");

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
