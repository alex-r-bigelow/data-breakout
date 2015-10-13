/*globals XJSON*/

var DRAWING_DEFAULTS = {
    BASIC_SIZE : 45,
    MIN_SIZE : 25
};

var LAYOUT = {
    'VERTICAL' : 1,
    'HORIZONTAL' : 2,
    'FORCE' : 3,
    'RADIAL' : 4
};

XJSON.Thing.prototype.postInit = function () {
    "use strict";
    var self = this;
    
    self.layout = LAYOUT.VERTICAL;
};