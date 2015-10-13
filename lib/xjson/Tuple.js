/*globals XJSON*/
XJSON.Tuple = function (value, parent, root) {
    "use strict";
    var self = this;
    XJSON.Thing.call(self, value, parent, root);
    
    self.payload = [];
    value.forEach(function (c) {
        self.payload.push(XJSON.generateThing(c, self, self.root));
    });
};
XJSON.Tuple.prototype = Object.create(XJSON.Thing.prototype);
XJSON.Tuple.prototype.constructor = XJSON.Tuple;

XJSON.Tuple.prototype.eachChild = function (callback) {
    "use strict";
    var self = this;
    self.payload.forEach(callback);
};