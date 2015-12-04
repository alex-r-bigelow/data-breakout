/*globals XJSON*/
XJSON.Tuple = function (value, index, parent, root) {
    "use strict";
    var self = this;
    XJSON.Thing.call(self, value, index, parent, root);
    
    self.payload = [];
    value.forEach(function (c, i) {
        self.payload.push(XJSON.generateThing(c, i, self, self.root));
    });
};
XJSON.Tuple.prototype = Object.create(XJSON.Thing.prototype);
XJSON.Tuple.prototype.constructor = XJSON.Tuple;

XJSON.Tuple.prototype.eachChild = function (callback) {
    "use strict";
    var self = this;
    self.payload.forEach(callback);
};

XJSON.Tuple.prototype.stringify = function () {
    "use strict";
    var self = this;
    return self.payload[0].stringify() + ": " + self.payload[1].stringify();
};