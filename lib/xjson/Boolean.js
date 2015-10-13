/*globals XJSON*/
XJSON.Boolean = function (value, index, parent, root) {
    "use strict";
    var self = this;
    XJSON.Value.call(self, value, index, parent, root);
};
XJSON.Boolean.prototype = Object.create(XJSON.Value.prototype);
XJSON.Boolean.prototype.constructor = XJSON.Boolean;