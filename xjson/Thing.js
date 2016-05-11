import Tuple from './Tuple';

class Thing {
  consructor (value, index, parent, root) {
    if (parent === undefined && root === undefined) {
      this.parent = null;
      this.index = null;
      this.root = this;
      this.ALL_THINGS = [];
    } else {
      this.index = index;
      this.parent = parent;
      this.root = root;
    }
  }
  postInit () {
    // Do nothing; this is for subclasses to override
  }
  iterRoutes (config, callback) {
    config.routes.forEach(route => {
      if (route === 'children') {
        if (this.eachChild) {
          this.eachChild(callback);
        }
      } else {
        throw new Error('Sorry, I don\'t know how to traverse "' + route + '" routes.');
      }
    });
  }
  postOrderDfs (config, callback, depth) {
    depth = depth === undefined ? 0 : depth;

    if (this.root._traversalStart === undefined) {
      // The first traversed thing needs to clean up afterward
      this.root._traversalStart = this;
    }
    if (this._traversalFlag === true) {
      // already visited this element
      return;
    }
    this._traversalFlag = true;
    try {
      if (config.hasOwnProperty('maxDepth') === false || depth < config.maxDepth) {
        this.iterRoutes(config, function (d) {
          d.postOrderDfs(config, callback, depth + 1);
        });
      }
      callback(this, depth);
    } finally {
      // Always clean up traversal flags, even if there was an error
      if (this.root._traversalStart === this) {
        delete this.root._traversalStart;
        this.root.ALL_THINGS.forEach(d => {
          delete d._traversalFlag;
        });
      }
    }
  }
  bfs (config, callback) {
    let queue = [[this, 0]];
    let temp;
    let depth;
    let node;

    function pushNode (n) {
      queue.push([n, depth + 1]);
    }

    try {
      while (queue.length > 0) {
        temp = queue.splice(0, 1)[0];
        node = temp[0];
        depth = temp[1];

        if (node._traversalFlag === true) {
          // already visited this element
          continue;
        }
        callback(node, depth);
        node._traversalFlag = true;

        if (config.hasOwnProperty('maxDepth') === false || depth < config.maxDepth) {
          node.iterRoutes(config, pushNode);
        }
      }
    } finally {
      // Always clean up traversal flags, even if there was an error
      this.root.ALL_THINGS.forEach(function (d) {
        delete d._traversalFlag;
      });
    }
  }
  getReferenceChain () {
    let chain = [];
    let temp = this;
    while (temp !== null) {
      chain.splice(0, 0, temp);
      temp = temp.parent;
    }
    return chain;
  }
  getReferenceString () {
    let chain;
    let result;
    let key;
    let i;

    if (this.hasOwnProperty('_cachedRefString')) {
      return this._cachedRefString;
    }

    chain = this.getReferenceChain();
    result = '@root';

    for (i = 1; i < chain.length; i += 1) {
      result += '[';
      if (chain[i] instanceof Tuple) {
        // Tuples are weird... we actually want to
        // skip over them in the reference
        // string by using the key... however,
        // if we want to refer to the tuple itself,
        // my lazy syntax forces us to do this:
        //    someDict['key']@parent
        // Or, in a really weird world, if we
        // want to refer to the key object itself,
        // we have to do this:
        //    someDict['key']@parent[0]
        key = chain[i].payload[0].payload;
        result += "'" + key + "']";

        if (i === chain.length - 1) {
          // refer to the tuple itself
          result += '@parent';
        } else if (chain[i + 1] === chain[i].payload[0]) {
          // refer to the key itself
          result += '@parent[0]';
        }

        // Regardless of the above scenarios, we want i
        // to skip the next round, as we've already figured
        // out the next step
        i += 1;
      } else {
        result += chain[i].index + ']';
      }
    }
    this._cachedRefString = result;
    return result;
  }
  getStyles () {
    let myRefString = this.getReferenceString();
    if (this.root.stylesheet.hasOwnProperty(myRefString)) {
      return this.root.stylesheet[myRefString];
    } else {
      return {};
    }
  }
  setStyles (styles) {
    let self = this;
    let myRefString = self.getReferenceString();
    let existingStyles = {};
    let style;

    this.root.stylesheet[myRefString] = styles;
    if (this.root.stylesheet.hasOwnProperty(myRefString)) {
      existingStyles = self.root.stylesheet[myRefString];
    }
    for (style in styles) {
      if (styles.hasOwnProperty(style)) {
        existingStyles[style] = styles[style];
      }
    }
    self.root.stylesheet[myRefString] = existingStyles;
  }
  getStyle (styleName, defaultValue) {
    let myRefString = this.getReferenceString();
    if (this.root.stylesheet.hasOwnProperty(myRefString) === false) {
      this.root.stylesheet[myRefString] = {};
    }
    if (this.root.stylesheet[myRefString].hasOwnProperty(styleName) === false) {
      this.root.stylesheet[myRefString][styleName] = defaultValue;
    }
    return this.root.stylesheet[myRefString][styleName];
  }
  setStyle (styleName, value) {
    let myRefString = this.getReferenceString();
    if (this.root.stylesheet.hasOwnProperty(myRefString) === false) {
      this.root.stylesheet[myRefString] = {};
    }
    this.root.stylesheet[myRefString][styleName] = value;
  }
}

export default Thing;
