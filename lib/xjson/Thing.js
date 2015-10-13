/*globals XJSON*/
XJSON.Thing = function (value, index, parent, root) {
    "use strict";
    var self = this;
    
    if (parent === undefined && root === undefined) {
        self.parent = null;
        self.index = null;
        self.root = self;
        self.ALL_THINGS = [];
    } else {
        self.index = index;
        self.parent = parent;
        self.root = root;
    }
};
XJSON.Thing.prototype.postInit = function () {
    "use strict";
    var self = this;
    // Do nothing; this is for subclasses to override
};
XJSON.Thing.prototype.postOrderDfs = function (config, callback, depth) {
    "use strict";
    var self = this;
    
    depth = depth === undefined ? 0 : depth;
    
    if (self.root._traversalStart === undefined) {
        // The first traversed thing needs to clean up afterward
        self.root._traversalStart = self;
    }
    if (self._traversalFlag === true) {
        // already visited this element
        return;
    }
    self._traversalFlag = true;
    try {
        if (config.hasOwnProperty('maxDepth') === false || depth < config.maxDepth) {
            self.iterRoutes(config, function (d) {
                d.postOrderDfs(config, callback, depth + 1);
            });
        }
        callback(self, depth);
    } finally {
        // Always clean up traversal flags, even if there was an error
        if (self.root._traversalStart === self) {
            delete self.root._traversalStart;
            self.root.ALL_THINGS.forEach(function (d) {
                delete d._traversalFlag;
            });
        }
    }
};
XJSON.Thing.prototype.bfs = function (config, callback) {
    "use strict";
    var self = this,
        queue = [[self, 0]],
        temp,
        depth,
        node;
    
    function pushNode(n) {
        queue.push([n, depth + 1]);
    }
    
    try {
        while (queue.length > 0) {
            temp = queue.splice(0,1)[0];
            node = temp[0];
            depth = temp[1];

            if (node._traversalFlag === true) {
                // already visited this element
                continue;
            }
            callback(node, depth);
            node._traversalFlag = true;

            if (config.hasOwnProperty('maxDepth') === false || depth < config.maxDepth) {
                node.iterRoutes(config, pushNode);
            }
        }
    } finally {
        // Always clean up traversal flags, even if there was an error
        self.root.ALL_THINGS.forEach(function (d) {
            delete d._traversalFlag;
        });
    }
};
XJSON.Thing.prototype.iterRoutes = function (config, callback) {
    "use strict";
    var self = this;
    config.routes.forEach(function (route) {
        if (route === 'children') {
            if (self.eachChild) {
                self.eachChild(callback, config.skipTuples);
            }
        } else {
            throw new Error("Sorry, I don't know how to traverse \"" + route + "\" routes.");
        }
    });
};
XJSON.Thing.prototype.getReferenceChain = function () {
    "use strict";
    var self = this,
        chain = [],
        temp = self;
    while (temp !== null) {
        chain.splice(0,0,temp);
        temp = temp.parent;
    }
    return chain;
};
XJSON.Thing.prototype.getReferenceString = function () {
    "use strict";
    var self = this,
        chain = self.getReferenceChain(),
        result = "@root",
        key,
        i;
    for (i = 1; i < chain.length; i += 1) {
        result += "[";
        if (chain[i] instanceof XJSON.Tuple) {
            // Tuples are weird... we actually want to
            // skip over them in the reference
            // string by using the key... however,
            // if we want to refer to the tuple itself,
            // my lazy syntax forces us to do this:
            //    someDict['key']@parent
            // Or, in a really weird world, if we
            // want to refer to the key object itself,
            // we have to do this:
            //    someDict['key']@parent[0]
            key = chain[i].payload[0].payload;
            result += "'" + key + "']";
            
            if (i === chain.length - 1) {
                // refer to the tuple itself
                result += '@parent';
            } else if (chain[i+1] === chain[i].payload[0]) {
                // refer to the key itself
                result += '@parent[0]';
            }
            
            // Regardless of the above scenarios, we want i
            // to skip the next round, as we've already figured
            // out the next step
            i += 1;
        } else {
            result += chain[i].index + ']';
        }
    }
    return result;
};
XJSON.Thing.prototype.getStyle = function (styleName, defaultValue) {
    "use strict";
    var self = this,
        myRefString = self.getReferenceString(),
        result;
    if (self.root.stylesheet.hasOwnProperty(myRefString)) {
        result = self.root.stylesheet[myRefString][styleName];
        if (result === undefined) {
            self.root.stylesheet[myRefString][styleName] = defaultValue;
            return defaultValue;
        }
    } else {
        return defaultValue;
    }
};
XJSON.Thing.prototype.setStyle = function (styleName, value) {
    "use strict";
    var self = this,
        myRefString = self.getReferenceString();
    if (!self.root.stylesheet.hasOwnProperty(myRefString)) {
        self.root.stylesheet[myRefString] = {};
    }
    self.root.stylesheet[myRefString][styleName] = value;
};