import Thing from './Thing';

class Value extends Thing {
  constructor (value, index, parent, root) {
    super(value, index, parent, root);
    this.payload = value;
  }
  stringify () {
    return JSON.stringify(this.payload);
  }
}

export default Value;
