import 'babel/polyfill';
import MicroEmitter from './MicroEmitter';

const EVENT_CHANGE = 'CHANGE_STORE';
// FIXME: for test...
// let localStorage, window; if (!window) localStorage = localStorage || {getItem: () => { return '{}'; }, setItem: () => {}};

export default class MicroStore extends MicroEmitter {
  constructor(options = { localStorage: true }) {
    super();
    this._localStorage = options.localStorage;
    this._data = (this._localStorage) ? this._load() || {} : {};
    this._tmp = [];
    this._filtering = false;
    this.defaults = {};
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
    return this._getAll();
  }

  _getAll() {
    let data = [];
    let targetData;

    if (this._filtering) {
      this._filtering = false;
      targetData = this._tmp;
    } else {
      targetData = this._data;
    }
    data = this._o2a(targetData);
    return data;
  }

  _save() {
    const key = this.constructor.name;

    localStorage.setItem(key, JSON.stringify(this._data));
  }

  _load() {
    const key = this.constructor.name;

    return JSON.parse(localStorage.getItem(key));
  }

  order(key, reverse) {
    if (!this._filtering) {
      this._filtering = true;
      this._tmp = this._o2a(this._data);
    }

    this._tmp.sort((itemA, itemB) => {
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
      this._tmp = this._o2a(this._data);
    }

    const data = [];
    for (const id in this._tmp) {
      if (!id) break;
      const _data = this._tmp[id];

      for (const key in statement) {
        if (!key) break;
        const value = statement[key];
        if (_data[key] === value) data.push(_data);
      }
    }
    this._tmp = data;
    return this;
  }

  limit(num) {
    if (!this._filtering) {
      this._filtering = true;
      this._tmp = this._o2a(this._data);
    }

    const data = [];
    for (let index = 0; index < num; index++) {
      data.push(this._tmp[index]);
    }
    this._tmp = data;
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
