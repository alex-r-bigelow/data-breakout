import XJSON from './index';
import Thing from './Thing';

class List extends Thing {
  constructor (value, index, parent, root) {
    super(value, index, parent, root);

    this.payload = [];
    value.forEach((c, i) => {
      this.payload.push(XJSON.generateThing(c, i, this, this.root));
    });
  }
  getChildChain (key) {
    return [this.payload[key]];
  }
  eachChild (callback) {
    this.payload.forEach(callback);
  }
  stringify () {
    let result = '[';
    this.eachChild((c, i) => {
      if (i > 0) {
        result += ', ';
      }
      result += c.stringify();
    });
    return result + ']';
  }
}

export default List;
