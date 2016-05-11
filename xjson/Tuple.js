import XJSON from './index';
import Thing from './Thing';

class Tuple extends Thing {
  constructor (value, index, parent, root) {
    super(value, index, parent, root);

    this.payload = [];
    value.forEach((c, i) => {
      this.payload.push(XJSON.generateThing(c, i, this, this.root));
    });
  }
  eachChild (callback) {
    this.payload.forEach(callback);
  }
  stringify () {
    return this.payload[0].stringify() + ': ' + this.payload[1].stringify();
  }
}

export default Tuple;
