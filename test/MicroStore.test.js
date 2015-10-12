import assert from 'power-assert';
import MicroStore from '../src/MicroStore';
import MicroEmitter from 'micro-emitter';

const emitter = new MicroEmitter();

class SampleTodoStore extends MicroStore {
  constructor() {
    super();
    this.defaults = { text: '', completed: false };
    this.register(emitter, {
      'TODO_CREATE': () => {
        this.create({ text: 'created an item via register' });
      }
    });
  }
}

describe('MicroStore', () => {
  let sampleTodoStore;
  let sampleTodos;
  let sampleTodo;


  describe('create/update/delete', () => {
    beforeEach(() => {
      sampleTodoStore = new SampleTodoStore({ localStorage: false });
      sampleTodoStore.create();
      sampleTodos = sampleTodoStore.all();
      sampleTodo = sampleTodos[0];
    });

    describe('create', () => {
      it('when create an item', () => {
        assert(sampleTodos.length === 1);
        assert(sampleTodos[0].text === '');
        assert(sampleTodos[0].completed === false);
      });
    });

    describe('update', () => {
      it('when update an item', () => {
        sampleTodoStore.update(sampleTodo.id, { text: 'update an item' });

        sampleTodos = sampleTodoStore.all();

        assert(sampleTodos.length === 1);
        assert(sampleTodos[0].text === 'update an item');
        assert(sampleTodos[0].completed === false);
      });
    });

    describe('destroy', () => {
      it('when destroy an item', () => {
        sampleTodoStore.destroy(sampleTodo.id);

        sampleTodos = sampleTodoStore.all();
        sampleTodo = sampleTodos[0];

        assert(sampleTodos.length === 0);
        assert(sampleTodo === undefined);
      });
    });
  });

  describe('get/all', () => {
    let sampleTodos;
    let sampleTodo;

    beforeEach(() => {
      sampleTodoStore = new SampleTodoStore({ localStorage: false });
      sampleTodoStore.create({ text: 'sample todo 0' });
      sampleTodoStore.create({ text: 'sample todo 1' });
      sampleTodoStore.create({ text: 'sample todo 2' });
      sampleTodoStore.create({ text: 'sample todo 3' });
      sampleTodoStore.create({ text: 'sample todo 4' });
      sampleTodos = sampleTodoStore.all();
    });

    describe('get', () => {
      it('when get an item', () => {
        let sampleTodoByGetMethod;

        sampleTodo = sampleTodos[2];
        sampleTodoByGetMethod = sampleTodoStore.get(sampleTodo.id);

        assert(sampleTodo.id === sampleTodoByGetMethod.id);
        assert(sampleTodo.text === sampleTodoByGetMethod.text);
        assert(sampleTodo.completed === sampleTodoByGetMethod.completed);
        assert(sampleTodo === sampleTodoByGetMethod);
      });

      it('when call get method without args', () => {
        let sampleTodoByGetMethod;

        sampleTodoByGetMethod = sampleTodoStore.get();

        assert(sampleTodoByGetMethod.length === 0);
      });
    });

    describe('all', () => {
      it('when get all items', () => {
        assert(sampleTodos.length === 5);
      });
    });
  });


  describe('order/where/limit', () => {
    let sampleTodos;
    let sampleTodo;

    beforeEach(() => {
      sampleTodoStore = new SampleTodoStore({ localStorage: false });
      sampleTodoStore.create({ text: 'sample todo 1', completed: true });
      sampleTodoStore.create({ text: 'sample todo 0', completed: false });
      sampleTodoStore.create({ text: 'sample todo 2', completed: true });
      sampleTodoStore.create({ text: 'sample todo 4', completed: false });
      sampleTodoStore.create({ text: 'sample todo 3', completed: true });
      sampleTodos = sampleTodoStore.all();
    });

    it('when call order', () => {
      sampleTodos = sampleTodoStore.order('text').get();

      assert(sampleTodos[0].text === 'sample todo 0');
      assert(sampleTodos[4].text === 'sample todo 4');
    });

    it('when call order with reverse', () => {
      sampleTodos = sampleTodoStore.order('text', true).get();

      assert(sampleTodos[0].text === 'sample todo 4');
      assert(sampleTodos[4].text === 'sample todo 0');
    });

    it('when call where', () => {
      let sampleTodos1 = sampleTodoStore.where({ text: 'sample todo 0' }).get();
      let sampleTodos2 = sampleTodoStore.where({ completed: true }).get();

      assert(sampleTodos1.length === 1);
      assert(sampleTodos1[0].text === 'sample todo 0');
      assert(sampleTodos2.length === 3);
      assert(sampleTodos2[0].text === 'sample todo 1');
    });

    it('when call limit', () => {
      sampleTodos = sampleTodoStore.limit(3).get();

      assert(sampleTodos.length === 3);
      assert(sampleTodos[0].text === 'sample todo 1');
      assert(sampleTodos[1].text === 'sample todo 0');
      assert(sampleTodos[2].text === 'sample todo 2');
    });

    it('when call where, order and limit', () => {
      sampleTodos = sampleTodoStore.where({ completed: true }).order('text').limit(2).get();

      assert(sampleTodos.length === 2);
      assert(sampleTodos[0].text === 'sample todo 1');
      assert(sampleTodos[1].text === 'sample todo 2');
      assert(sampleTodos[2] === undefined);
    });

  });

  describe('register', () => {
    beforeEach(() => {
      sampleTodoStore = new SampleTodoStore({ localStorage: false });
    });

    it ('when todo create', () => {
      emitter.emit('TODO_CREATE');

      sampleTodos = sampleTodoStore.all();

      assert(sampleTodos.length === 1);
      assert(sampleTodos[0].text === 'created an item via register');
    });
  });

  describe('setData/getData', () => {
    beforeEach(() => {
      sampleTodoStore = new SampleTodoStore({ localStorage: false });
    });

    it ('when call setData and getData', () => {
      sampleTodoStore.setData('isCreateModalShowing', true);
      let isCreateModalShowing = sampleTodoStore.getData('isCreateModalShowing');

      assert(isCreateModalShowing === true);
    });
  });
});
