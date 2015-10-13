/*globals XJSON*/
XJSON.Formula = function (value, parent, root) {
    "use strict";
    var self = this;
    XJSON.Thing.call(self, value, parent, root);
    
    throw new Error('TODO: unimplemented!');
};
XJSON.Formula.prototype = Object.create(XJSON.Thing.prototype);
XJSON.Formula.prototype.constructor = XJSON.Formula;