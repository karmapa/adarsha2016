var E=React.createElement;
var text4imagestyles={
    text:{fontSize:"28px",whiteSpace: "pre"}
}
var Text4ImageComponent=React.createClass({
    imagefilename:function(){
        return "images/001-001b.jpg";
    }
    ,render:function(){
        return E("div",{style:text4imagestyles.text},
            E("image",{src:this.imagefilename()}),

            this.props.uti,"\n",this.props.text)
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
