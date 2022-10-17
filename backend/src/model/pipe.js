const PIPE = (function () {
  function Controller() {
    let model = null;
    this.init = (_model) => {
      model = _model;
    };

    this.add = (name, func) => model.add(name, func);
    this.consumer = (name) => model.consumer(name);
    this.promiseAllConsumer = (name) => model.promiseAllConsumer(name);
    this.get = (name) => model.get(name);
    this.size = (name) => model.size(name);
    this.clear = (name) => model.clear(name);
    this.clearAll = () => model.clearAll();
  }

  function Model() {
    let pipe = null;

    this.init = (_pipe) => {
      pipe = _pipe;
    };

    this.add = (name, func) => pipe.add(name, func);
    this.consumer = (name) => pipe.consumer(name);
    this.promiseAllConsumer = (name) => pipe.promiseAllConsumer(name);
    this.get = (name) => pipe.get(name);
    this.size = (name) => pipe.size(name);
    this.clear = (name) => pipe.clear(name);
    this.clearAll = () => pipe.clearAll();
  }

  function Pipe() {
    let options = null;
    const pipe = new Map();

    this.init = (_options) => {
      options = _options;
    };

    this.add = (name, func) => {
      if (!Boolean(this._isExists(name))) {
        this._initializePipe(name);
      }
      this._producer(name, func);
      return this;
    };

    this._producer = (name, func) => {
      this.get(name).push(func.bind(func));
    };

    this.consumer = (name) => {
      const first = this.get(name).shift();

      if (Boolean(first)) {
        first();
      }

      return first && this;
    };

    this.promiseAllConsumer = (name) => {
      const consumeList = pipe.get(name).map((func) => Promise.resolve(func()));
      this.clear(name);
      return Promise.all(consumeList);
    };

    this.get = (name) => {
      return pipe.get(name);
    };

    this.size = (name) => {
      return pipe.get(name).length;
    };

    this.clear = (name) => {
      this._initializePipe(name);
    };

    this.clearAll = () => {
      pipe.clear();
    };

    this._isExists = (name) => {
      return pipe.has(name);
    };

    this._isEmpty = (name) => {
      return this.get(name).length === 0;
    };

    this._initializePipe = (name) => {
      pipe.set(name, new Array(0));
    };
  }

  return {
    init(options) {
      const controller = new Controller();
      const model = new Model();
      const pipe = new Pipe();

      controller.init(model);
      model.init(pipe);
      pipe.init(options);

      return {
        controller,
      };
    },
  };
})();

export default PIPE;

/* 예시 코드
const pipeController = PIPE.init({}).controller;

pipeController.add("test", () => {
  console.log("1");
});

pipeController.add("test", () => {
  console.log("wow");
});

pipeController.promiseAllConsumer("test").then((result) => {
  console.log(result);
});

console.log(pipeController.size("test"));
 */