
import XJSON from './index';
import Thing from './Thing';

class Dict extends Thing {
  constructor (value, index, parent, root) {
    super(value, index, parent, root);
    let key;
    let temp;

    this.keys = {};
    this.payload = [];
    for (key of Object.keys(value)) {
      temp = XJSON.generateThing({
        XJSON_TUPLE: true,
        key: key,
        value: value[key]
      }, this.payload.length, this, this.root);
      // temp could potentially be undefined if this was
      // the XJSON_STYLE object; if so, just ignore this
      // element
      if (temp !== undefined) {
        this.keys[key] = this.payload.length;
        this.payload.push(temp);
      }
    }
  }
  getChildChain (key) {
    let result = [this.payload[this.keys[key]]];
    result.push(result[0].payload[1]);
    return result;
  }
  eachChild (callback) {
    this.payload.forEach(callback);
  }
  stringify () {
    let result = '{';
    this.eachChild((c, i) => {
      if (i > 0) {
        result += ', ';
      }
      result += c.stringify();
    });
    return result + '}';
  }
}

export default Dict;
