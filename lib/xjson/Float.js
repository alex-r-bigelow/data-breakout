/*globals XJSON*/
XJSON.Float = function (value, index, parent, root) {
    "use strict";
    var self = this;
    XJSON.Value.call(self, value, index, parent, root);
};
XJSON.Float.prototype = Object.create(XJSON.Value.prototype);
XJSON.Float.prototype.constructor = XJSON.Float;