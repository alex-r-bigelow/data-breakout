/*globals window, console, jQuery, d3, XJSON*/
var root,
    svg = d3.select('svg'),
    MAX_DEPTH = 2,
    LAYOUTS = {
        'HORIZONTAL' : 0,
        'VERTICAL' : 1,
        'CIRCULAR' : 2,
        'FORCE' : 3
    };

function redraw() {
    root.bfs({
        routes : ['children'],
        maxDepth : MAX_DEPTH
    }, function (node, depth) {
        console.log(node, depth);
    });
    return {
        width : 100,
        height : 100
    };
}

function resize() {
    var bounds = redraw();
    
    bounds = {
        width : Math.max(window.innerWidth - 20, bounds.width),
        height : Math.max(window.innerHeight - 20, bounds.height)
    };
    
    svg.attr(bounds);
}

window.onresize = resize;

window.onload = function () {
    jQuery.ajax({
        url : 'test.xjson',
        success : function (data) {
            root = XJSON.parse(data);
            resize();
        }
    });
};