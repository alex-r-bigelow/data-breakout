/*globals XJSON*/
XJSON.Dict = function (value, index, parent, root) {
    "use strict";
    var self = this,
        key,
        temp;
    XJSON.Thing.call(self, value, index, parent, root);
    
    self.keys = {};
    self.payload = [];
    for (key in value) {
        if (value.hasOwnProperty(key)) {
            temp = XJSON.generateThing({
                XJSON_TUPLE : true,
                key : key,
                value : value[key]
            }, self.payload.length, self, self.root);
            // temp could potentially be undefined if this was
            // the XJSON_STYLE object; if so, just ignore this
            // element
            if (temp !== undefined) {
                self.keys[key] = self.payload.length;
                self.payload.push(temp);
            }
        }
    }
};
XJSON.Dict.prototype = Object.create(XJSON.Thing.prototype);
XJSON.Dict.prototype.constructor = XJSON.Dict;

XJSON.Dict.prototype.getChildChain = function (key) {
    "use strict";
    var self = this,
        result = [self.payload[self.keys[key]]];
    result.push(result[0].payload[1]);
    return result;
};
XJSON.Dict.prototype.eachChild = function (callback) {
    "use strict";
    var self = this;
    self.payload.forEach(callback);
};
XJSON.Dict.prototype.stringify = function () {
    "use strict";
    var self = this,
        result = "{";
    self.eachChild(function (c, i) {
        if (i > 0) {
            result += ", ";
        }
        result += c.stringify();
    });
    return result + "}";
};