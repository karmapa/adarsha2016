$(function () {

// popover
  // $('[data-toggle="popover"]').popover();
});

//Tooltip, activated by hover event
  $(".head-content").tooltip({   
    selector: "[data-toggle='tooltip']",
    container: ".head-content"
  });

//Popover, activated by clicking
  //    $(".note").popover({
  //   selector: "[data-toggle='popover']",
  //   container: ".head-content",
  //   html: true
  // });


// treeview
	$('.branch').click(function(){
     $(this).children().toggleClass('fa-folder-open-o');
		$(this).next().slideToggle();
    
	});


//modal
	$('a.btn-modal').on('click', function(e) {
	    e.preventDefault();
	    var url = $(this).attr('data-url');
	    $(".modal-body").html('<iframe width="100%" frameborder="0" scrolling="yes" allowtransparency="true" src="'+url+'"></iframe>');
  });


//fullPage
  $(".fullPage").click(function(){
    
    $("#mainContent").toggleClass("full");
    $(".tool").toggleClass("full");
    return false;
  });

//btnHide
  $(".btnHide").click(function(){
    $(".viewBox").toggleClass("hide");
    return false;
  });

//zoomImg
  var $ = jQuery;
    $(document).ready(function(){
          if ( $("#001-001a").length )
          {
            var iv1 = $("#001-001a").iviewer({
                 src: "Adarsha img/001-001a.jpg"
            });
            var iv2 = $("#001-001a-D").iviewer({
                 src: "Adarsha img/001-001a.jpg"
            });
            var iv3 = $("#001-001a-L").iviewer({
                 src: "Adarsha img/001-001a.jpg"
            });


            var iv4 = $("#001-001b").iviewer({
                src: "Adarsha img/001-001b.jpg"
            });
            var iv5 = $("#001-001b-D").iviewer({
                src: "Adarsha img/001-001b.jpg"
            });
            var iv6 = $("#001-001b-L").iviewer({
                src: "Adarsha img/001-001b.jpg"
            });


            var iv7 = $("#001-002a").iviewer({
                src: "Adarsha img/001-002a.jpg"
            });
            var iv8 = $("#001-002a-D").iviewer({
                src: "Adarsha img/001-002a.jpg"
            });
            var iv9 = $("#001-002a-L").iviewer({
                src: "Adarsha img/001-002a.jpg"
            });

             $("#in").click(function(){ iv1.iviewer('zoom_by', 1); }); 
             $("#out").click(function(){ iv1.iviewer('zoom_by', -1); }); 
             $("#fit").click(function(){ iv1.iviewer('fit'); }); 
             $("#orig").click(function(){ iv1.iviewer('set_zoom', 100); }); 
             $("#update").click(function(){ iv1.iviewer('update_container_info'); });
          };
          
    });

//zoomImg2
//$('.zoom').elevateZoom({zoomType:"inner"});


//fontSize
  $('.head-content p').jfontsize({
      btnMinusClasseId: '#jfontsize-m',
      btnDefaultClasseId: '#jfontsize-d',
      btnPlusClasseId: '#jfontsize-p'
  });
  $('.head-content span').jfontsize({
      btnMinusClasseId: '#jfontsize-m',
      btnDefaultClasseId: '#jfontsize-d',
      btnPlusClasseId: '#jfontsize-p'
  });


//fontToggle
  
  $('.fontToggle').on('click',function(){
   
  if($(this).attr('data-click-state') == 1) {
   $(this).attr('data-click-state', 0);
   $('#menu_font').slideDown(300);
  } else {
   $(this).attr('data-click-state', 1)
   $('#menu_font').slideUp(300);
   
  }
   
  });

  $(".fontToggle").click(function(){
    $(this).toggleClass("open");
    return false;
  });


//fullScreen
function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {  
      document.documentElement.requestFullScreen();  
    } else if (document.documentElement.mozRequestFullScreen) {  
      document.documentElement.mozRequestFullScreen();  
    } else if (document.documentElement.webkitRequestFullScreen) {  
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
    }  
  } else {  
    if (document.cancelFullScreen) {  
      document.cancelFullScreen();  
    } else if (document.mozCancelFullScreen) {  
      document.mozCancelFullScreen();  
    } else if (document.webkitCancelFullScreen) {  
      document.webkitCancelFullScreen();  
    }  
  }  
}


/*
 * complex.html
 *
 * This is a demonstration page for the jQuery layout widget
 *
 *  NOTE: For best code readability, view this with a fixed-space font and tabs equal to 4-chars
 */

    var outerLayout, innerLayout;

    /*
    *#######################
    *     ON PAGE LOAD
    *#######################
    */
    $(document).ready( function() {
        // create the OUTER LAYOUT
        outerLayout = $(".inner-Content").layout( layoutSettings_Outer );

        /*******************************
         ***  CUSTOM LAYOUT BUTTONS  ***
         *******************************
         *
         * Add SPANs to the east/west panes for customer "close" and "pin" buttons
         *
         * COULD have hard-coded span, div, button, image, or any element to use as a 'button'...
         * ... but instead am adding SPANs via script - THEN attaching the layout-events to them
         *
         * CSS will size and position the spans, as well as set the background-images
         */

        // BIND events to hard-coded buttons in the NORTH toolbar
        outerLayout.addPinBtn( "#tbarPinWest", "west" );

        // save selector strings to vars so we don't have to repeat it
        // must prefix paneClass with ".inner-Content > " to target ONLY the outerLayout panes
        var westSelector = ".inner-Content > .ui-layout-west"; // outer-west pane

         // CREATE SPANs for pin-buttons - using a generic class as identifiers
        $("<span></span>").addClass("pin-button").prependTo( westSelector );

        // BIND events to pin-buttons to make them functional
        outerLayout.addPinBtn( westSelector +" .pin-button", "west");

         // CREATE SPANs for close-buttons - using unique IDs as identifiers
        $("<span></span>").attr("id", "west-closer" ).prependTo( westSelector );

        // BIND layout events to close-buttons to make them functional
        outerLayout.addCloseBtn("#west-closer", "west");


        /* Create the INNER LAYOUT - nested inside the 'center pane' of the outer layout
         * Inner Layout is create by createInnerLayout() function - on demand
         *
            innerLayout = $("div.pane-center").layout( layoutSettings_Inner );
         *
         */


        // DEMO HELPER: prevent hyperlinks from reloading page when a 'base.href' is set
        $("a").each(function () {
            var path = document.location.href;
            if (path.substr(path.length-1)=="#") path = path.substr(0,path.length-1);
            if (this.href.substr(this.href.length-1) == "#") this.href = path +"#";
        });

    });


    /*
    *#######################
    * INNER LAYOUT SETTINGS
    *#######################
    *
    * These settings are set in 'list format' - no nested data-structures
    * Default settings are specified with just their name, like: fxName:"slide"
    * Pane-specific settings are prefixed with the pane name + 2-underscores: north__fxName:"none"
    */
    layoutSettings_Inner = {
        applyDefaultStyles:             true // basic styling for testing & demo purposes
    ,   minSize:                        20 // TESTING ONLY
    ,   spacing_closed:                 14
    ,   north__spacing_closed:          8
    ,   south__spacing_closed:          8
    ,   north__togglerLength_closed:    -1 // = 100% - so cannot 'slide open'
    ,   south__togglerLength_closed:    -1
    ,   fxName:                         "slide" // do not confuse with "slidable" option!
    ,   fxSpeed_open:                   1000
    ,   fxSpeed_close:                  2500
    ,   fxSettings_open:                { easing: "easeInQuint" }
    ,   fxSettings_close:               { easing: "easeOutQuint" }
    
    //, initClosed:                     true
    ,   center__minWidth:               200
    ,   center__minHeight:              200
    };


    /*
    *#######################
    * OUTER LAYOUT SETTINGS
    *#######################
    *
    * This configuration illustrates how extensively the layout can be customized
    * ALL SETTINGS ARE OPTIONAL - and there are more available than shown below
    *
    * These settings are set in 'sub-key format' - ALL data must be in a nested data-structures
    * All default settings (applied to all panes) go inside the defaults:{} key
    * Pane-specific settings go inside their keys: north:{}, south:{}, center:{}, etc
    */
    var layoutSettings_Outer = {
        name: "outerLayout" // NO FUNCTIONAL USE, but could be used by custom code to 'identify' a layout
        // options.defaults apply to ALL PANES - but overridden by pane-specific settings
    ,   defaults: {
            size:                   "auto"
        ,   minSize:                300
        ,   maxSize:                450
        ,   paneClass:              "pane"      // default = 'ui-layout-pane'
        ,   resizerClass:           "resizer"   // default = 'ui-layout-resizer'
        ,   togglerClass:           "toggler"   // default = 'ui-layout-toggler'
        ,   buttonClass:            "button"    // default = 'ui-layout-button'
        ,   contentSelector:        ".content"  // inner div to auto-size so only it scrolls, not the entire pane!
        ,   contentIgnoreSelector:  "span"      // 'paneSelector' for content to 'ignore' when measuring room for content
        ,   togglerLength_open:     35          // WIDTH of toggler on north/south edges - HEIGHT on east/west edges
        ,   togglerLength_closed:   35          // "100%" OR -1 = full height
        ,   hideTogglerOnSlide:     true        // hide the toggler when pane is 'slid open'
        ,   togglerTip_open:        "Close This Pane"
        ,   togglerTip_closed:      "Open This Pane"
        ,   resizerTip:             "Resize This Pane"
        //  effect defaults - overridden on some panes
        ,   fxName:                 "slide"     // none, slide, drop, scale
        ,   fxSpeed_open:           750
        ,   fxSpeed_close:          1500
        ,   fxSettings_open:        { easing: "easeInQuint" }
        ,   fxSettings_close:       { easing: "easeOutQuint" }
    }
    
    ,   west: {
            size:                   300
        ,   spacing_closed:         21          // wider space when closed
        ,   togglerLength_closed:   21          // make toggler 'square' - 21x21
        ,   togglerAlign_closed:    "top"       // align to top of resizer
        ,   togglerLength_open:     0           // NONE - using custom togglers INSIDE west-pane
        ,   togglerTip_open:        "Close Sidebar"
        ,   togglerTip_closed:      "Open Sidebar"
        ,   resizerTip_open:        "Resize Sidebar"
        ,   slideTrigger_open:      "click"     // default
        ,   initClosed:             false
        //  add 'Cubic' option to default 'slide' effect
        ,   fxSettings_open:        { easing: "easeOutCubic" }
        }
    
    ,   center: {
            paneSelector:           "#mainContent"          // sample: use an ID to select pane instead of a class
        ,   minWidth:               200
        ,   minHeight:              200
        }
    };
