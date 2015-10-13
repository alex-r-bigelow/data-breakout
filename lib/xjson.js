/*globals console, jQuery*/
var XJSON;
(function () {
    XJSON = {
        WARN_ON_PARSE_FAILURE: true,
        generateThing: function (obj, parent, root) {
            var objType = typeof obj,
                newThing;

            if (obj === null || obj === undefined) {
                newThing = new XJSON.Null(obj, parent, root);
            } else if (objType === 'object') {
                if (obj.hasOwnProperty('XJSON_TUPLE')) {
                    newThing = new XJSON.Tuple([obj.key, obj.value], parent, root);
                } else if (obj instanceof Array) {
                    newThing = new XJSON.List(obj, parent, root);
                } else {
                    newThing = new XJSON.Dict(obj, parent, root);
                }
            } else if (objType === 'string') {
                // First, check if we're encountering one of our
                // special XJSON objects (links, formulas, tables)
                if (obj.length > 0) {
                    try {
                        if (obj[0] === '@') {
                            newThing = new XJSON.Link(obj, parent, root);
                        } else if (obj[0] === '=') {
                            newThing = new XJSON.Formula(obj, parent, root);
                        } else if (obj[0] === '$') {
                            newThing = new XJSON.Table(obj, parent, root);
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
                    newThing = new XJSON.String(obj, parent, root);
                }
            } else if (objType === 'number') {
                if (parseInt(obj) === obj) {
                    newThing = new XJSON.Int(obj, parent, root);
                } else {
                    newThing = new XJSON.Float(obj, parent, root);
                }
            } else if (objType === 'boolean') {
                newThing = new XJSON.Boolean(obj, parent, root);
            } else {
                throw new XJSON.ParseError("Can't parse object of type: " + objType);
            }
            
            if (root === undefined) {
                root = newThing;
            }
            
            // store pointers to all objects at the root:
            newThing.descendantIndex = root.ALL_THINGS.length;
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
                routes : ['children'],
                skipTuples : false,
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