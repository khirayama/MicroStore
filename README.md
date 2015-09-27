# MicroStore
micro store in es6 for client.

## Motivation
I need micro store for learning some apps.

## Getting Started

```
$ npm install micro-store
```

```es6.js
import MicroStore from 'micro-store';
```

## API

- defaults
- create
- update
- destroy
- get
- order
- where
- limit
- dispatchChange
- dispatchCustomEvent
- addChangeListener
- removeChangeListener
- addCustomEventListener
- removeCustomEventListener
- register

## Options

```
let options = {
  localStorage: ture, // bool(default: true)
};

new SomeStore(options);
```

- localStorage

## Example
```TodoStore.es6.js
import MicroStore from 'micro-store';
import { EventEmitter } from 'events';


let AppDispatcher = new EventEmitter(); // singleton

class TodoStore extends MicroStore {
  constructor() {
    super();
    this.defaults = {
      text: '',
      completed: false,
    };
    this.register(AppDispatcher, {
      'TODO_CREATE': (payload) => {
        this.create(payload.entity);
      },
      'TODO_UPDATE': (payload) => {
        this.update(payload.id, payload.updates);
      },
      'TODO_DESTROY': (payload) => {
        this.destroy(payload.id);
      },
    });
  }
}
export default new TodoStore();

class TodoItemComponent {
  constructor() {
    this.todos = TodoStore.get();

    // when TodoStore updated, call this.
    TodoStore.addChangeListener(this.render());

    // when TodoStore emit custom event(ex: PASS_VALIDATION), call this.
    TodoStore.addCustomEventListener('PASS_VALIDATION', this.fetch());
  }
  /* ... */
  onClick() {

    // if you don't use actions or dispatcher
    TodoStore.create({ text: 'Hello MicroStore' });

    // if you use action or dispatcher
    AppDispatcher.emit('TODO_CREATE', { text: 'Hello MicroStore' });
  }
}
```

```sample.es6.js
TodoStore.get(); // get all data
TodoStore.get(id); // get an item
TodoStore.order('text').get();
TodoStore.order('text', true).get(); // reverse
TodoStore.where({ completed: true }).get();
TodoStore.limit(3).get();
TodoStore.where({ completed: true }).order('text').limit(5).get();
```
