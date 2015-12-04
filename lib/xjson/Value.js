/*globals XJSON*/
XJSON.Value = function (value, index, parent, root) {
    "use strict";
    var self = this;
    XJSON.Thing.call(self, value, index, parent, root);
    
    self.payload = value;
};
XJSON.Value.prototype = Object.create(XJSON.Thing.prototype);
XJSON.Value.prototype.constructor = XJSON.Value;

XJSON.Value.prototype.stringify = function () {
    "use strict";
    var self = this;
    return JSON.stringify(self.payload);
};