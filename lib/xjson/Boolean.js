/*globals XJSON*/
XJSON.Boolean = function (value, parent, root) {
    "use strict";
    var self = this;
    XJSON.Value.call(self, value, parent, root);
};
XJSON.Boolean.prototype = Object.create(XJSON.Value.prototype);
XJSON.Boolean.prototype.constructor = XJSON.Boolean;