/*globals XJSON*/
XJSON.Table = function (value, index, parent, root) {
    "use strict";
    var self = this;
    XJSON.Thing.call(self, value, index, parent, root);
    
    throw new Error('TODO: unimplemented!');
};
XJSON.Table.prototype = Object.create(XJSON.Thing.prototype);
XJSON.Table.prototype.constructor = XJSON.Table;

XJSON.Table.prototype.stringify = function () {
    "use strict";
    var self = this;
    throw new Error("TODO: unimplemented!");
};