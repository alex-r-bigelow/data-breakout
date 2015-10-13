/*globals XJSON*/
XJSON.Thing = function (value, parent, root) {
    "use strict";
    var self = this;
    
    if (parent === undefined && root === undefined) {
        self.parent = null;
        self.root = self;
        self.ALL_THINGS = [];
    } else {
        self.parent = parent;
        self.root = root;
    }
};
XJSON.Thing.prototype.postInit = function () {
    "use strict";
    var self = this;
    // Do nothing; this is for subclasses to override
};
XJSON.Thing.prototype.postOrderDfs = function (config, callback) {
    "use strict";
    var self = this;
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
        config.routes.forEach(function (route) {
            if (route === 'children') {
                if (self.eachChild) {
                    self.eachChild(function (d) {
                        d.postOrderDfs(config, callback);
                    }, config.skipTuples);
                }
            } else {
                throw new Error("Sorry, I don't know how to traverse \"" + route + "\" routes.");
            }
        });
        callback(self);
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