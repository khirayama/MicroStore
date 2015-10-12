import 'babel/polyfill';
import MicroEmitter from 'micro-emitter';

const EVENT_CHANGE = 'CHANGE_STORE';

if (global) global.localStorage = global.localStorage || { getItem: () => { return '{}'; }, setItem: () => {} };

export default class MicroStore extends MicroEmitter {
  constructor(options = { localStorage: true }) {
    super();
    this._localStorage = options.localStorage;
    this._data = (this._localStorage) ? this._load() || {} : {};
    this._filteredData = [];
    this._filtering = false;
    this.defaults = {};
  }

  setData(key, value) {
    if (
      key === 'data' ||
      key === 'localStorage' ||
      key === 'filteredData' ||
      key === 'filtering' ||
      key === 'defaults'
    ) {
      console.warn('Cant set value with this key. This key is reserved word in MicroStore.');
      return;
    }
    this[`_${key}`] = value;
    this.dispatchChange();
    if (this._localStorage) this._save();
  }

  getData(key) {
    if (
      key === 'data' ||
      key === 'localStorage' ||
      key === 'filteredData' ||
      key === 'filtering' ||
      key === 'defaults'
    ) {
      console.warn('Cant get data by this key. This key is reserved word in MicroStore');
      return;
    }
    return this._loadValue(key) || this[`_${key}`];
  }

  // CRUD method
  create(entity) {
    const now = new Date();
    const id = (+now + Math.floor(Math.random() * 999999)).toString(36);

    this._data[id] = Object.assign({}, { id: id, createdAt: now, updatedAt: now }, this.defaults, entity);
    this.dispatchChange();
    if (this._localStorage) this._save();
  }

  update(id, updates) {
    const now = new Date();
    this._data[id] = Object.assign({ updatedAt: now }, this._data[id], updates);
    this.dispatchChange();
    if (this._localStorage) this._save();
  }

  destroy(id) {
    delete this._data[id];
    this.dispatchChange();
    if (this._localStorage) this._save();
  }

  get(id) {
    if (id) return this._data[id];
    this._filtering = false;
    return this._o2a(this._filteredData);
  }

  all() {
    return this._o2a(this._data);
  }

  _save() {
    const key = this.constructor.name;

    localStorage.setItem(key, JSON.stringify(this._data));
  }

  _saveValue(key) {
    localStorage.setItem(`${this.constructor.name}_${key}`, JSON.stringify(this._data));
  }

  _load() {
    const key = this.constructor.name;

    return JSON.parse(localStorage.getItem(key));
  }

  _loadValue(key) {
    localStorage.getItem(`${this.constructor.name}_${key}`);
  }

  order(key, reverse) {
    if (!this._filtering) {
      this._filtering = true;
      this._filteredData = this._o2a(this._data);
    }

    this._filteredData.sort((itemA, itemB) => {
      const valueX = itemA[key];
      const valueY = itemB[key];

      if (reverse) {
        if (valueX > valueY) return -1;
        if (valueX < valueY) return 1;
        return 0;
      }
      if (valueX > valueY) return 1;
      if (valueX < valueY) return -1;
      return 0;
    });
    return this;
  }

  where(statement) {
    if (!this._filtering) {
      this._filtering = true;
      this._filteredData = this._o2a(this._data);
    }

    const data = [];
    for (const id in this._filteredData) {
      if (!id) break;
      const _data = this._filteredData[id];

      for (const key in statement) {
        if (!key) break;
        const value = statement[key];
        if (_data[key] === value) data.push(_data);
      }
    }
    this._filteredData = data;
    return this;
  }

  limit(num) {
    if (!this._filtering) {
      this._filtering = true;
      this._filteredData = this._o2a(this._data);
    }

    const data = [];
    for (let index = 0; index < num; index++) {
      data.push(this._filteredData[index]);
    }
    this._filteredData = data;
    return this;
  }

  _o2a(obj) {
    const arr = [];

    for (const key in obj) {
      if (!key) break;
      arr.push(obj[key]);
    }
    return arr;
  }

  _checkType(target) {
    const _type = toString.call(target);

    switch (_type) {
    case '[object Object]':
      return 'Object';
    case '[object Array]':
      return 'Array';
    case '[object Boolean]':
      return 'Boolean';
    case '[object Function]':
      return 'Function';
    case '[object Date]':
      return 'Date';
    case '[object JSON]':
      return 'JSON';
    case '[object String]':
      return 'String';
    case '[object Number]':
      return 'Number';
    default:
      break;
    }
  }

  // basic method
  dispatchChange() {
    this.emit(EVENT_CHANGE);
  }

  dispatchCustomEvent(type) {
    this.emit(type);
  }

  addChangeListener(listener) {
    this.addListener(EVENT_CHANGE, listener);
  }

  removeChangeListener(listener) {
    this.removeListener(EVENT_CHANGE, listener);
  }

  addCustomEventListener(type, listener) {
    this.addListener(type, listener);
  }

  removeCustomEventListener(type, listener) {
    this.removeListener(type, listener);
  }

  register(dispatcher, actions) {
    for (const key in actions) {
      if (!key) break;
      const action = actions[key];

      dispatcher.addListener(key, (data) => {
        action(data);
      });
    }
  }
}
