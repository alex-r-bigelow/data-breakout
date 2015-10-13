/*globals XJSON*/
XJSON.Link = function (value, parent, root) {
    "use strict";
    var self = this;
    XJSON.Thing.call(self, value, parent, root);
    
    self.payload = undefined;
    self._pathDef = value;
};
XJSON.Link.prototype = Object.create(XJSON.Thing.prototype);
XJSON.Link.prototype.constructor = XJSON.Link;

XJSON.Link.prototype.postInit = function () {
    "use strict";
    var self = this;
    self.payload = self.parseReferenceChain(self._pathDef);
    delete self._pathDef;
};
XJSON.Link.prototype.parseReferenceChain = function (pathDef) {
        "use strict";
        var self = this,
            chain = [],
            token,
            temp,
            i,
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
            throw new XJSON.ParseError('Reference must start with "@self", "@root", or "@parent"', pathDef);
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
                    throw new XJSON.ParseError('"]" expected', pathDef);
                }
                // Point i to the next token
                i = j + 1;
                
                // Now handle the token:
                // Links only support string keys or int indices (may be more than one in index for Tables)
                if ((token[0] !== '"' && token[0] !== "'") ||
                    (token[token.length - 1] !== '"' && token[token.length - 1] !== "'")) {
                    try {
                        token = extractMultiArrayKeys(token);
                    } catch (e) {
                        if (e instanceof XJSON.ParseError) {
                            throw new XJSON.ParseError('Link keys must be integers, strings, or lists of integer indices (to compute dynamic keys, use a Formula)', pathDef);
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
            } else if (pathDef[i] === '.') {
                j = i + 1;
                throw new Error("TODO: unimplemented!");
            } else {
                throw new XJSON.ParseError("Unexpected: \"" + pathDef[i] + "\"", pathDef);
            }
        }
        // We ran out of string to parse... so we're done
        return chain;
    };