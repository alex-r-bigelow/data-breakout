/*globals XJSON*/
XJSON.String = function (value, parent, root) {
    "use strict";
    var self = this;
    XJSON.Value.call(self, value, parent, root);
};
XJSON.String.prototype = Object.create(XJSON.Value.prototype);
XJSON.String.prototype.constructor = XJSON.String;