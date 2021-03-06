/*globals XJSON*/
XJSON.List = function (value, index, parent, root) {
    "use strict";
    var self = this;
    XJSON.Thing.call(self, value, index, parent, root);
    
    self.payload = [];
    value.forEach(function (c, i) {
        self.payload.push(XJSON.generateThing(c, i, self, self.root));
    });
};
XJSON.List.prototype = Object.create(XJSON.Thing.prototype);
XJSON.List.prototype.constructor = XJSON.List;

XJSON.List.prototype.getChildChain = function (key) {
    "use strict";
    var self = this;
    return [self.payload[key]];
};
XJSON.List.prototype.eachChild = function (callback) {
    "use strict";
    var self = this;
    self.payload.forEach(callback);
};

XJSON.List.prototype.stringify = function () {
    "use strict";
    var self = this,
        result = "[";
    self.eachChild(function (c, i) {
        if (i > 0) {
            result += ", ";
        }
        result += c.stringify();
    });
    return result + "]";
};