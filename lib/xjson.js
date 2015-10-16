/*globals console, jQuery*/
var XJSON;
(function () {
    XJSON = {
        WARN_ON_PARSE_FAILURE: true,
        generateThing: function (obj, index, parent, root) {
            var objType = typeof obj,
                newThing;
            
            if (obj === null || obj === undefined) {
                newThing = new XJSON.Null(obj, index, parent, root);
            } else if (objType === 'object') {
                if (obj.hasOwnProperty('XJSON_TUPLE')) {
                    // This is where the XJSON_STYLE key will crop up,
                    // if it does
                    if (obj.key === 'XJSON_STYLE' && parent === root) {
                        root.stylesheet = obj.value;
                        return;
                    } else {
                        newThing = new XJSON.Tuple([obj.key, obj.value], index, parent, root);
                    }
                } else if (obj instanceof Array) {
                    newThing = new XJSON.List(obj, index, parent, root);
                } else {
                    newThing = new XJSON.Dict(obj, index, parent, root);
                }
            } else if (objType === 'string') {
                // First, check if we're encountering one of our
                // special XJSON objects (links, formulas, tables)
                if (obj.length > 0) {
                    try {
                        if (obj[0] === '@') {
                            newThing = new XJSON.Link(obj, index, parent, root);
                        } else if (obj[0] === '=') {
                            newThing = new XJSON.Formula(obj, index, parent, root);
                        } else if (obj[0] === '$') {
                            newThing = new XJSON.Table(obj, index, parent, root);
                        }
                    } catch (error) {
                        if (error instanceof XJSON.ParseError) {
                            if (XJSON.WARN_ON_PARSE_FAILURE === true) {
                                console.warn(error.message);
                            }
                            // As the string couldn't be parsed, just keep the string value
                        } else {
                            throw error;
                        }
                    }
                }
                if (newThing === undefined) {
                    newThing = new XJSON.String(obj, index, parent, root);
                }
            } else if (objType === 'number') {
                if (parseInt(obj) === obj) {
                    newThing = new XJSON.Int(obj, index, parent, root);
                } else {
                    newThing = new XJSON.Float(obj, index, parent, root);
                }
            } else if (objType === 'boolean') {
                newThing = new XJSON.Boolean(obj, index, parent, root);
            } else {
                throw new XJSON.ParseError("Can't parse object of type: " + objType);
            }
            
            if (root === undefined) {
                root = newThing;
            }
            
            // store pointers to all objects at the root:
            newThing.id = root.ALL_THINGS.length;
            root.ALL_THINGS.push(newThing);
            
            return newThing;
        },
        parse: function (string) {
            var obj = JSON.parse(string),
                root = XJSON.generateThing(obj);

            // Let special Things finish initializing
            // themselves (resolve internal references,
            // etc)
            /*root.ALL_THINGS.forEach(function (t) {
                t.postInit();
            });*/
            root.postOrderDfs({
                routes : ['children']
            }, function (t) {
                t.postInit();
            });
            return root;
        },
        stringify: function (obj) {
            if (obj instanceof XJSON.Thing) {
                return obj.stringify();
            } else {
                return JSON.stringify(obj);
            }
        },
        ParseError : function (message, badString) {
            var self = this;
            self.name = "ParseError";
            self.message = (message || "");
            self.message += '\nOffending string: ' + badString;
        }
    };
    XJSON.ParseError.prototype = Object.create(Error.prototype);
    XJSON.ParseError.prototype.constructor = XJSON.ParseError;
})();