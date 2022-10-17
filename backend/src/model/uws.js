import uWs from "uWebSockets.js";
// import pm2 from "pm2";

const UWS = (function () {
  function Controller() {
    let model = null;

    this.init = (_model) => {
      model = _model;
    };

    this.listen = (host, port) => model.listen(host, port);

    this.DEDICATED_COMPRESSOR_3KB = uWs.DEDICATED_COMPRESSOR_3KB;
  }

  function Model() {
    let app = null;

    this.init = (_app) => {
      app = _app;
    };

    this.listen = (host, port) => app.listen(host, port);
  }

  function App() {
    let app = null;
    let socketOption = null;
    let ssl = null;
    let listenUrl = null;
    let query = null;
    let methods = null;
    let host = null;
    let port = null;

    this.init = (_initiOption) => {
      const { __socketOption, __ssl, __listenUrl, __query, __methods } =
        _initiOption;
      const { upgrade, open, message, drain, close } = __methods;
      socketOption = __socketOption;
      ssl = __ssl;
      listenUrl = __listenUrl;
      query = __query;
      methods = __methods;

      app = uWs.App(ssl).ws(listenUrl + query, {
        ...socketOption,
        upgrade: upgrade || (() => {}),
        open:
          open ||
          ((ws) => {
            console.log("A WebSocket connected!");
            ws.subscribe("server");
            // pm2;
          }),
        message:
          message ||
          ((ws, message, isBinary) => {
            /* Ok is false if backpressure was built up, wait for drain */
            let ok = ws.send(message, isBinary);
          }),
        drain:
          drain ||
          ((ws) => {
            console.log("WebSocket backpressure: " + ws.getBufferedAmount());
          }),
        close:
          close ||
          ((ws, code, message) => {
            console.log("WebSocket closed");
          }),
      });
    };

    this.listen = (host, port) => {
      app.listen(port, (token) => {
        console.log(`WebSocket Listening on ws://${host}:${port}`);
        if (token) {
        }
      });
      return this;
    };

    this.getApp = () => {
      return app;
    };
  }

  return {
    initialize(option) {
      const app = new App();
      const model = new Model();
      const controller = new Controller();

      app.init(option);
      model.init(app);
      controller.init(model);

      return controller;
    },
  };
})();

export default UWS;

// 소켓 옵션
/* There are many common helper features */
// idleTimeout: 32,
// maxBackpressure: 1024,
// maxPayloadLength: 512,
// compression: DEDICATED_COMPRESSOR_3KB,

// 소켓 메서드
// upgrade
// open
// message
// drain
// close
