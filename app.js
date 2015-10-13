/*globals window, console, jQuery, d3, XJSON*/
var root,
    MAX_DEPTH = 2,
    LAYOUTS = {
        'HORIZONTAL' : 0,
        'VERTICAL' : 1,
        'CIRCULAR' : 2,
        'FORCE' : 3
    };

function redraw() {
    root.postOrderDfs({
        routes : ['children'],
        maxDepth : MAX_DEPTH
    }, function (d) {
        
    });
}

function resize() {
    var bounds = redraw();
    
    bounds = {
        width : Math.max(window.innerWidth - 20, bounds.width),
        height : Math.max(window.innerHeight - 20, bounds.height)
    };
    
    jQuery('svg').attr(bounds);
}

window.onresize = resize;

window.onload = function () {
    jQuery.ajax({
        url : 'test.xjson',
        success : function (data) {
            root = XJSON.parse(data);
            console.log(root);
            
            resize();
        }
    });
};