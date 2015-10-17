/*globals window, console, jQuery, d3, XJSON*/
var root,
    visibleRoot,
    svg,
    visibleNodes = [],
    visibleLookup = {},
    MAX_DEPTH = 10;

var DRAWING_DEFAULTS = {
    FIELD_WIDTH: 100,
    FIELD_HEIGHT: 25,
    ICON_SIZE: 50,
    PADDING: 10
};

var LAYOUTS = {
    'HORIZONTAL': 0,
    'VERTICAL': 1,
    'CIRCULAR': 2,
    'FORCE': 3
};
var LAYOUT_NAMES = [
    'HORIZONTAL',
    'VERTICAL',
    'CIRCULAR',
    'FORCE'
];

var LAYOUT_FUNCTIONS = {
    /**** For the bottom-up layout step, each child's width
      and height will already be set.
      Each layout function must compute each child's
      x and y coordinates, and set the width and height of
      the parent element. Some parents may already have their
      width and height fixed; in this case, any children reaching
      beyond those bounds will be clipped. ****/
    BOTTOM_UP : {
        HORIZONTAL : function (parentId, childIds) {
            var parent = visibleNodes[visibleLookup[parentId]],
                child,
                xPosition = DRAWING_DEFAULTS.PADDING,
                maxHeight = 0;
            if (parent.hasOwnProperty('bounds')) {
                // The parent's layout has been fixed
                throw new Error("TODO: unimplemented!");
            } else {
                childIds.forEach(function (cid) {
                    child = visibleNodes[visibleLookup[cid]];
                    if (child.hasOwnProperty('bounds') === false) {
                        console.log(child);
                        throw new Error('no bounds');
                    }
                    child.bounds.x = xPosition + child.bounds.width / 2;
                    xPosition += child.bounds.width + DRAWING_DEFAULTS.PADDING;
                    maxHeight = Math.max(child.bounds.height, maxHeight);
                });
                maxHeight += 2 * DRAWING_DEFAULTS.PADDING;
                childIds.forEach(function (cid) {
                    child = visibleNodes[visibleLookup[cid]];
                    child.bounds.y = maxHeight / 2;
                });
                parent.bounds = {
                    width : xPosition,
                    height : maxHeight
                };
            }
        },
        VERTICAL : function (parentId, childIds) {
            var parent = visibleNodes[visibleLookup[parentId]],
                child,
                yPosition = DRAWING_DEFAULTS.PADDING,
                maxWidth = 0;
            if (parent.hasOwnProperty('bounds')) {
                // The parent's layout has been fixed
                throw new Error("TODO: unimplemented!");
            } else {
                childIds.forEach(function (cid) {
                    child = visibleNodes[visibleLookup[cid]];
                    if (child.hasOwnProperty('bounds') === false) {
                        console.log(child);
                        throw new Error('no bounds');
                    }
                    child.bounds.y = yPosition + child.bounds.height / 2;
                    yPosition += child.bounds.height + DRAWING_DEFAULTS.PADDING;
                    maxWidth = Math.max(child.bounds.width, maxWidth);
                });
                maxWidth += 2 * DRAWING_DEFAULTS.PADDING;
                childIds.forEach(function (cid) {
                    child = visibleNodes[visibleLookup[cid]];
                    child.bounds.x = maxWidth / 2;
                });
                parent.bounds = {
                    height : yPosition,
                    width : maxWidth
                };
            }
        },
        CIRCULAR : function (parentId, childIds) {
            throw new Error("TODO: unimplemented!");
        },
        FORCE : function (parentId, childIds) {
            throw new Error("TODO: unimplemented!");
        }
    },
    /**** The top-down layout step now needs
      to add parents' positions to the child positions
      (we're not doing nested SVG groups to make things
      a little more free-form - for things like animated
      hierarchy changes, etc) ****/
    TOP_DOWN : {
        HORIZONTAL : function (parentId, childIds) {
            var parent = visibleNodes[visibleLookup[parentId]],
                child,
                xPosition = parent.bounds.x - parent.bounds.width / 2,
                yPosition = parent.bounds.y - parent.bounds.height / 2;
            childIds.forEach(function (cid) {
                child = visibleNodes[visibleLookup[cid]];
                child.bounds.x += xPosition;
                child.bounds.y += yPosition;
            });
        },
        VERTICAL : function (parentId, childIds) {
            var parent = visibleNodes[visibleLookup[parentId]],
                child,
                xPosition = parent.bounds.x - parent.bounds.width / 2,
                yPosition = parent.bounds.y - parent.bounds.height / 2;
            
            childIds.forEach(function (cid) {
                child = visibleNodes[visibleLookup[cid]];
                child.bounds.x += xPosition;
                child.bounds.y += yPosition;
            });
        },
        CIRCULAR : function (parentId, childIds) {
            throw new Error("TODO: unimplemented!");
        },
        FORCE : function (parentId, childIds) {
            throw new Error("TODO: unimplemented!");
        }
    }
};

function relayout() {
    var iterConfig = {
            routes : ['children'],
            maxDepth : MAX_DEPTH
        },
        visibleChildIds = [],
        containerLeaves = {},
        style,
        layout,
        i, d,
        svgBounds;
    
    /**** Compute the layout! ****/
    
    visibleNodes = [];
    visibleLookup = {};
    
    // First, collect all the visible nodes in a BFS order,
    // and determine the size if possible
    visibleRoot.bfs(iterConfig, function (node, depth) {
        var nodeWrapper = {
            node : node,
            depth : depth
        };
        
        style = node.getStyles();
        
        // If this node's size is fixed, an instance of
        // XJSON.Value, or something at MAX_DEPTH, we can
        // already set the width and height
        if (style.hasOwnProperty('fixedSize')) {
            nodeWrapper.bounds = style.fixedSize;
        } else if (node instanceof XJSON.Value) {
            nodeWrapper.bounds = {
                width : DRAWING_DEFAULTS.FIELD_WIDTH,
                height : DRAWING_DEFAULTS.FIELD_HEIGHT
            };
        } else if (depth === MAX_DEPTH) {
            containerLeaves[nodeWrapper.node.id] =
                nodeWrapper.node instanceof XJSON.Tuple ? 'Tuple' :
                    nodeWrapper.node instanceof XJSON.List ? 'List' :
                        nodeWrapper.node instanceof XJSON.Dict ? 'Dict' :
                            nodeWrapper.node instanceof XJSON.Table ? 'Table' : null;
            nodeWrapper.bounds = {
                width : DRAWING_DEFAULTS.ICON_SIZE,
                height : DRAWING_DEFAULTS.ICON_SIZE
            };
        }
        
        visibleLookup[node.id] = visibleNodes.length;
        visibleNodes.push(nodeWrapper);
    });
    
    // Next, we want to do the bottom-up layout
    // (calculate each node's local position and size)
    function collectChildren(c) {
        if (visibleLookup.hasOwnProperty(c.id)) {
            visibleChildIds.push(c.id);
        }
    }
    for (i = visibleNodes.length - 1; i >= 0; i -= 1) {
        // We want REVERSE bfs order - this way,
        // all node's children will have their dimensions set,
        // and we can just worry about laying them out
        d = visibleNodes[i];
        
        if (d.hasOwnProperty('bounds')) {
            // width and height are already set, and x and y
            // will be set by the parent node
            continue;
        }
        
        visibleChildIds = [];
        d.node.iterRoutes(iterConfig, collectChildren);
        
        layout = d.node.getStyle('layout', LAYOUTS.HORIZONTAL);
        LAYOUT_FUNCTIONS.BOTTOM_UP[LAYOUT_NAMES[layout]](d.node.id, visibleChildIds);
    }
    
    // Next, we need to set the x and y position of
    // of the visible root, and scale the svg element appropriately
    visibleNodes[0].bounds.x = visibleNodes[0].bounds.width / 2;
    visibleNodes[0].bounds.y = visibleNodes[0].bounds.height / 2;
    
    svgBounds = {
        width: Math.max(window.innerWidth - 20, visibleNodes[0].bounds.width),
        height: Math.max(window.innerHeight - 20, visibleNodes[0].bounds.height)
    };
    svg.attr(svgBounds);
    
    // Finally, do the top-down layout
    // (move the local results relative to the parents)
    visibleNodes.forEach(function (d) {
        visibleChildIds = [];
        d.node.iterRoutes(iterConfig, collectChildren);
        
        layout = d.node.getStyle('layout', LAYOUTS.HORIZONTAL);
        LAYOUT_FUNCTIONS.TOP_DOWN[LAYOUT_NAMES[layout]](d.node.id, visibleChildIds);
    });
    
    /**** Draw the frames ****/
    
    var depthColorScale = d3.scale.linear()
        .domain([0, MAX_DEPTH])
        .range([d3.hsl(163,0.0,1.0),d3.hsl(163,1.0,0.85)]);
    
    var nodeGroups = svg.select('#nodes').selectAll('g.node')
        .data(visibleNodes, function (d) { return d.node.id; });
    nodeGroups.enter().append('g')
        .attr('class','node')
            .append('rect')
            .attr('class', 'frame');
    nodeGroups.exit().remove();
    
    nodeGroups.attr('transform', function (d) {
        return 'translate(' + d.bounds.x + ',' + d.bounds.y + ')';
    });
    nodeGroups.selectAll('rect.frame').attr({
        x : function (d) { return -d.bounds.width / 2; },
        y : function (d) { return -d.bounds.height / 2; },
        width : function (d) { return d.bounds.width; },
        height : function (d) { return d.bounds.height; },
        fill : function (d) { return depthColorScale(d.depth); },
        stroke : d3.hsl(163,0.5,0.25).toString()
    });
    
    /**** Draw the node contents ****/
    
    // Draw any icons
    var icons = nodeGroups.selectAll('image.icon').data(function (d) {
        // return a "dataset" if this thing should be an icon
        if (containerLeaves.hasOwnProperty(d.node.id)) {
            return [containerLeaves[d.node.id]];
        } else {
            return [];
        }
    });
    icons.enter().append('image').attr('class', 'icon');
    icons.exit().remove();
    icons.attr('xlink:href', function (d) {
        return 'img/' + d + '.png';
    });
    icons.attr({
        'width' : DRAWING_DEFAULTS.ICON_SIZE,
        'height' : DRAWING_DEFAULTS.ICON_SIZE,
        'x' : -DRAWING_DEFAULTS.ICON_SIZE / 2,
        'y' : -DRAWING_DEFAULTS.ICON_SIZE / 2
    });
    
    // Create any text fields
    var valueFields = nodeGroups.selectAll('foreignobject.field').data(function (d) {
        // return a "dataset" if this thing should be a field
        if (d.node instanceof XJSON.Value) {
            return [d.node.payload];
        } else {
            return [];
        }
    });
    valueFields.enter()
        .append('foreignObject')
        .attr({
            class : 'field',
            width : DRAWING_DEFAULTS.FIELD_WIDTH,
            height : DRAWING_DEFAULTS.FIELD_HEIGHT,
            transform : 'translate(' + (-DRAWING_DEFAULTS.FIELD_WIDTH / 2) +
                        ',' + (-DRAWING_DEFAULTS.FIELD_HEIGHT / 2) + ')'
        
        });
    valueFields.exit().remove();
    
    valueFields.html(function (d) {
        return '<input value="' + d + '" ' +
                      'style="width:' + DRAWING_DEFAULTS.FIELD_WIDTH +
                         'px;height:' + DRAWING_DEFAULTS.FIELD_HEIGHT +
                         'px"/>';
    });
    
    /**** TODO: Draw any visible links ****/
}

window.onresize = relayout;

window.onload = function () {
    svg = d3.select('svg');
    jQuery.ajax({
        url: 'test.xjson',
        success: function (data) {
            visibleRoot = root = XJSON.parse(data);
            relayout();
        }
    });
};