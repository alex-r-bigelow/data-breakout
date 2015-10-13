/*globals XJSON*/
XJSON.Table = function (value, parent, root) {
    "use strict";
    var self = this;
    XJSON.Thing.call(self, value, parent, root);
    
    throw new Error('TODO: unimplemented!');
};
XJSON.Table.prototype = Object.create(XJSON.Thing.prototype);
XJSON.Table.prototype.constructor = XJSON.Table;