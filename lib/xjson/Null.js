/*globals XJSON*/
XJSON.Null = function (value, index, parent, root) {
    "use strict";
    var self = this;
    XJSON.Value.call(self, value, index, parent, root);
};
XJSON.Null.prototype = Object.create(XJSON.Value.prototype);
XJSON.Null.prototype.constructor = XJSON.Null;