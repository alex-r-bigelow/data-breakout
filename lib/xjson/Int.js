/*globals XJSON*/
XJSON.Int = function (value, index, parent, root) {
    "use strict";
    var self = this;
    XJSON.Value.call(self, value, index, parent, root);
};
XJSON.Int.prototype = Object.create(XJSON.Value.prototype);
XJSON.Int.prototype.constructor = XJSON.Int;