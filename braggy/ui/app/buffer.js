export class ImageBuffer {
  constructor(size = 20) {
    this.buffer = {};
    this.keys = [];
    this.size = size;
    this.add = this.add.bind(this);
    this.del = this.del.bind(this);
    this.get = this.get.bind(this);
    this.pop = this.pop.bind(this);
    this.has = this.has.bind(this);
    this.onOverflow = null;
    this.onMiss = null;
  }

  has(key) {
    return key in this.buffer;
  }

  add(key, prop, value) {
    if (this.keys.length < this.size) {
      const o = (key in this.buffer) ? this.buffer[key] : {};
      o[prop] = value;
      this.buffer[key] = o;

      if (!(key in this.buffer)) {
        this.keys.push(key);
      }
    } else if (this.onOverflow !== null) {
      this.onOverflow(key, value);
    }
  }

  del(key) {
    this.keys = this.keys.filter(item => (item !== key));
    delete this.buffer[key];
  }

  get(key) {
    const value = this.buffer[key];

    if (value === undefined && this.onMiss !== null) {
      this.onMiss(key);
    }

    return value;
  }

  pop() {
    if (Object.keys(this.buffer).length === this.size) {
      const key = this.keys[0];
      this.del(key);
    }
  }
}

export default new ImageBuffer();
