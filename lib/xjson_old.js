/*globals console*/
var XJSON,
    Thing,
    NullThing,
    ValueThing,
    TupleThing,
    ArrayThing,
    ObjectThing,
    LinkThing,
    FormulaThing,
    MultiArrayThing;
(function () {
    XJSON = {
        WARN_ON_PARSE_FAILURE : true,
        /*jslint evil:true*/
        INDIRECT_EVAL : eval,
        /*jslint evil:false*/
        generateThing : function (value, parent, root) {
            var temp = null;
            if (typeof(value) === 'string' && value.length > 0) {
                try {
                    if (value[0] === '@') {
                        temp = new Link(value, parent, root);
                    } else if (value[0] === '=') {
                        temp = new Formula(value, parent, root);
                    } else if (value[0] === '$') {
                        temp = new MultiArray(value, parent, root);
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
            if (temp === null) {
                temp = new Thing(value, parent, root);
            }
            if (root === undefined) {
                root = temp;
            }
            temp.descendantIndex = root.ALL_THINGS.length;
            root.ALL_THINGS.push(temp);
            return temp;
        },
        parse : function (string) {
            var obj = JSON.parse(string),
                root = XJSON.generateThing(obj);
            
            // Let special Things finish initializing
            // themselves (resolve internal references,
            // etc)
            root.ALL_THINGS.forEach(function (t) {
                t.postInit();
            });
            return root;
        },
        stringify : function (obj) {
            if (obj instanceof Thing) {
                return obj.stringify();
            } else {
                return JSON.stringify(obj);
            }
        }
    };
    
    Thing = function (payload, parent, root) {
        var self = this,
            temp = typeof payload,
            key;
        
        if (parent === undefined && root === undefined) {
            self.parent = null;
            self.root = self;
            self.ALL_THINGS = [];
        } else {
            self.parent = parent;
            self.root = root;
        }
        
        if (temp === "object") {
            if (payload === null) {
                payload = undefined;
            } else if (payload.hasOwnProperty('XJSON_TUPLE')) {
                self.payload = [
                    XJSON.generateThing(payload.key, self, self.root),
                    XJSON.generateThing(payload.value, self, self.root)
                ];
                self.payloadType = XJSON.PAYLOADS.TUPLE;
            } else if (payload instanceof Array) {
                if (payload.length === 0) {
                    payload = undefined;
                } else {
                    self.payload = [];
                    payload.forEach(function (c) {
                        self.payload.push(XJSON.generateThing(c, self, self.root));
                    });
                    self.payloadType = XJSON.PAYLOADS.ARRAY;
                }
            } else {
                if (Object.keys(payload).length === 0) {
                    payload = undefined;
                } else {
                    self.payload = [];
                    for (key in payload) {
                        if (payload.hasOwnProperty(key)) {
                            self.payload.push(XJSON.generateThing({
                                XJSON_TUPLE : true,
                                key : key,
                                value : payload[key]
                            }, self, self.root));
                        }
                    }
                    self.payloadType = XJSON.PAYLOADS.OBJECT;
                }
            }
        } else if (temp !== "undefined") {
            self.payloadType = XJSON.PAYLOADS.VALUE;
            self.payload = payload;
        }

        if (temp === "undefined") {
            self.payloadType = XJSON.PAYLOADS.NULL;
            self.payload = payload;
        }
    };
    
    Link = function (stringDef, parent, root) {
        var self = this;
        self.parent = parent;
        self.root = root;
        self.payloadType = XJSON.PAYLOADS.LINK;
        self.payload = undefined;
        self._stringDef = stringDef;
    };
    Link.prototype = Object.create(Thing);
    Link.prototype.constructor = Link;
    
    Formula = function (stringDef, parent, root) {
        var self = this;
        self.parent = parent;
        self.root = root;
        self.payloadType = XJSON.PAYLOADS.FORMULA;
        self.payload = undefined;
        self._stringDef = stringDef;
    };
    Formula.prototype = Object.create(Thing);
    Formula.prototype.constructor = Formula;
    
    MultiArray = function (stringDef, parent, root) {
        var self = this;
        
        self.parent = parent;
        self.root = root;
        
        var arrayStart = stringDef.indexOf('[');
        if (stringDef.length === 0 || stringDef[0] !== '$') {
            throw new ParseError("MultiArray definitions must start with \"$\"");
        }
        if (arrayStart === -1 || stringDef[stringDef.length - 1] !== ']') {
            throw new ParseError("MultiArray data must be wrapped in \"[\" and \"]\" characters");
        }
        self.dimensions = stringDef
            .substring(1, arrayStart - 1)
            .split(',')
            .map(function (d) {
                d = Number(d);
                if (isNaN(d)) {
                    throw new ParseError("MultiArray dimensions must be comma-separated integers");
                }
                return d;
            });
        
        self.payloadType = XJSON.PAYLOADS.MULTIARRAY;
        self.payload = stringDef.substring(arrayStart + 1, stringDef.length - 1)
            .split(',')
            .map(function (c) {
                return XJSON.generateThing(JSON.parse(c), self, self.root);
            });
        
        self._stringDef = stringDef;
    };
    MultiArray.prototype = Object.create(Thing);
    MultiArray.prototype.constructor = MultiArray;
    
    var ParseError = function (message, badString) {
        var self = this;
        self.name = "ParseError";
        self.message = (message || "");
        self.message += '\nOffending string: ' + badString;
    };
    ParseError.prototype = Object.create(Error);
    ParseError.prototype.constructor = ParseError;
    
    
    // Pseudo-constructor functions
    Thing.prototype.postInit = function () {
        "use strict";
        var self = this;
        // This function does nothing in its vanilla state;
        // it's mainly for overriding!
    };
    Link.prototype.postInit = function () {
        "use strict";
        var self = this;
        self.payload = self.getReferenceChain(self._stringDef).chain;
        delete self._stringDef;
    };
    Formula.prototype.postInit = function () {
        "use strict";
        var self = this;
        throw new Error("TODO: unimplemented!");
        //self.payload = self.extractReferenceChains(self._stringDef);
        //delete self._stringDef;
    };
    
    
    // Member functions
    Thing.prototype.getChild = function (key) {
        "use strict";
        var self = this;
        if (self.payloadType === XJSON.PAYLOADS.ARRAY ||
            self.payloadType === XJSON.PAYLOADS.OBJECT) {
            return self.payload[key];
        } else {
            throw new Error("Tried to get a payload using: " + key + " from a Thing of type: " + self.payloadType);
        }
    };
    MultiArray.prototype.getChild = function (key) {
        "use strict";
        var self = this;
        throw new Error("TODO: unimplemented!");
    };
    Thing.prototype.eachChild = function (callback) {
        "use strict";
        var self = this,
            temp;
        if (self.payloadType === XJSON.PAYLOADS.ARRAY ||
            self.payloadType === XJSON.PAYLOADS.MULTIARRAY) {
            self.payload.forEach(callback);
        } else if (self.payloadType === XJSON.PAYLOADS.OBJECT) {
            for (temp in self.payload) {
                if (self.payload.hasOwnProperty(temp)) {
                    callback(self.payload[temp]);
                }
            }
        }
    };
    Thing.prototype.pointChildrenToMe = function () {
        "use strict";
        var self = this,
            temp;
        self.eachChild(function (c) {
            c.parent = self;
        });
    };
    Thing.prototype.postOrderDfs = function (routes, callback) {
        "use strict";
        var self = this;
        if (self.root._traversalStart === undefined) {
            // The first traversed thing needs to clean up afterward
            self.root._traversalStart = self;
        }
        if (self._traversalFlag === true) {
            // already visited this element
            return;
        }
        self._traversalFlag = true;
        try {
            routes.forEach(function (route) {
                if (route === 'children') {
                    self.eachChild(function (d) {
                        d.postOrderDfs(routes, callback);
                    });
                } else {
                    throw new Error("Sorry, I don't know how to traverse \"" + route + "\" routes.");
                }
            });
            callback(self);
        } finally {
            // Always clean up traversal flags, even if there was an error
            if (self.root._traversalStart === self) {
                delete self.root._traversalStart;
                self.root.ALL_DESCENDANTS.forEach(function (d) {
                    delete d._traversalStart;
                });
            }
        }
    };
    Thing.prototype.stringify = function () {
        "use strict";
        var self = this,
            result,
            temp;
        if (self.payloadType === XJSON.PAYLOADS.ARRAY) {
            result = [];
            self.payload.forEach(function (d) {
                result.push(d.stringify());
            });
        } else if (self.payloadType === XJSON.PAYLOADS.OBJECT) {
            result = {};
            for (temp in self.payload) {
                if (self.payload.hasOwnProperty(temp)) {
                    result[temp] = self.payload[temp].stringify();
                }
            }
        } else {
            result = self.payload;
        }
        return JSON.stringify(result);
    };
    MultiArray.prototype.stringify = Link.prototype.stringify = Formula.prototype.stringify = function () {
        "use strict";
        var self = this;
        throw new Error("TODO: unimplemented!");
    };
    
    Thing.prototype.evaluate = function () {
        "use strict";
        var self = this;
        return self.payload;
    };
    Link.prototype.getReferenceChain = Formula.prototype.getReferenceChain = function (pathDef, i) {
        "use strict";
        var self = this,
            chain = [],
            token,
            temp,
            j,
            extractMultiArrayKeys = function (s) {
                return s.split(',').map(function (d) {
                    d = Number(d);
                    if (isNaN(d)) {
                        throw new XJSON.ParseError('NaN index encountered', s);
                    }
                    return d;
                });
            };
        
        i = i === undefined ? 0 : i;
        
        // Start off with self, root, or parent
        temp = pathDef.substring(i,7);
        if (temp.startsWith('@self')) {
            chain.push(self);
            i += 5;
        } else if (temp.startsWith('@root')) {
            chain.push(self.root);
            i += 5;
        } else if (temp === '@parent') {
            chain.push(self.parent);
            i += 7;
        } else {
            throw new XJSON.ParseError('Reference must start with "@self", "@root", or "@parent"', pathDef.substr(i));
        }
        
        while (i < pathDef.length) {
            // Next, we expect @parent, dot notation, or an opening bracket
            if (pathDef[i] === '@' && pathDef.substring(i, 7) === '@parent') {
                chain.push(chain[chain.length - 1].parent);
                i += 7;
            } else if (pathDef[i] === '[') {
                // Parse out the next token
                j = i + 1;
                token = "";
                while (j < pathDef.length && pathDef[j] !== ']') {
                    token += pathDef[j];
                    j += 1;
                }
                if (pathDef[j] !== ']') {
                    throw new XJSON.ParseError('"]" expected', pathDef.substr(i));
                }
                // Point i to the next token
                i = j + 2;
                
                // Now handle the token:
                if (self.payloadType === XJSON.PAYLOADS.FORMULA) {
                    // Formulas can have dynamic keys that are eval()ed
                    
                    // First, check if this is a MultiArray key
                    try {
                        token = extractMultiArrayKeys(token);
                    } catch (e) {
                        if (e instanceof XJSON.ParseError) {
                            // Okay, this must be a string or dynamic key
                            token = XJSON.INDIRECT_EVAL(token);
                        } else {
                            throw e;
                        }
                    }
                    // Okay, make sure the child/property actually exists,
                    // and add it to our chain
                    chain.push(chain[chain.length - 1].getChild(token));
                } else if (self.payloadType === XJSON.PAYLOADS.LINK) {
                    // Links only support string keys or int indices (may be more than one in index for MultiArrays)
                    if ((token[0] !== '"' && token[0] !== "'") ||
                        (token[token.length - 1] !== '"' && token[token.length - 1] !== "'")) {
                        try {
                            token = extractMultiArrayKeys(token);
                        } catch (e) {
                            if (e instanceof XJSON.ParseError) {
                                throw new XJSON.ParseError('Link keys must be integers, strings, or lists of integer indices (to compute dynamic keys, use a Formula)', pathDef.substr(i));
                            } else {
                                throw e;
                            }
                        }
                    } else {
                        // This was a simple string key... remove the quotes
                        token = token.substring(1,token.length - 1);
                    }
                    // If we survived that gauntlet, make sure the
                    // child / property actually exists, and add it to our
                    // chain
                    chain.push(chain[chain.length - 1].getChild(token));
                } else {
                    throw new Error("Attempted to parse a reference chain for a non-Link or non-Formula payload", pathDef.substr(i));
                }
            } else if (pathDef[i] === '.') {
                j = i + 1;
                throw new Error("TODO: unimplemented!");
            } else {
                // We encountered a character that we didn't recognize,
                // so we're done parsing
                return {
                    charactersParsed : i - 1,
                    chain : chain
                };
            }
        }
        // We ran out of string to parse... so we're done
        return {
            charactersParsed : i - 1,
            chain : chain
        };
    };
    Link.prototype.evaluate = function () {
        "use strict";
        var self = this,
            path = self.payload.substring(1),
            root = self.root;
        
        // This is kind of bizarre... we want the
        // actual payload of the thing that we're pointing
        // to. eval(path) will point to the Thing
        // object, and evaluate() will get us that
        // payload (or follow the corresponding link)
        
        /*jslint evil:true*/
        return eval(path).evaluate();
        /*jslint evil:false*/
    };
    Formula.prototype.evaluate = function () {
        "use strict";
        var self = this;
        throw new Error("TODO: unimplemented!");
    };
})();