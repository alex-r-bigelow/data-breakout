/*globals XJSON*/
XJSON.Dict = function (value, parent, root) {
    "use strict";
    var self = this,
        key,
        temp;
    XJSON.Thing.call(self, value, parent, root);
    
    self.keys = {};
    self.payload = [];
    for (key in value) {
        if (value.hasOwnProperty(key)) {
            self.keys[key] = self.payload.length;
            temp = XJSON.generateThing({
                XJSON_TUPLE : true,
                key : key,
                value : value[key]
            }, self, self.root);
            self.payload.push(temp);
        }
    }
};
XJSON.Dict.prototype = Object.create(XJSON.Thing.prototype);
XJSON.Dict.prototype.constructor = XJSON.Dict;

XJSON.Dict.prototype.getChild = function (key) {
    "use strict";
    var self = this;
    return self.payload[self.keys[key]].payload[1];
};
XJSON.Dict.prototype.eachChild = function (callback, skipTuples) {
    "use strict";
    var self = this;
    if (skipTuples === true) {
        self.payload.forEach(function (tuple) {
            callback(tuple[1]);
        });
    } else {
        self.payload.forEach(callback);
    }
};