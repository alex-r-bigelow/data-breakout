/*globals XJSON*/
XJSON.Value = function (value, parent, root) {
    "use strict";
    var self = this;
    XJSON.Thing.call(self, value, parent, root);
    
    self.payload = value;
};
XJSON.Value.prototype = Object.create(XJSON.Thing.prototype);
XJSON.Value.prototype.constructor = XJSON.Value;