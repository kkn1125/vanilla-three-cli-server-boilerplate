import uWs from "uWebSockets.js";
// import pm2 from "pm2";

const UWS = (function () {
  function Controller() {
    let model = null;

    this.init = (_model) => {
      model = _model;
      this.listen();
    };

    this.getApp = () => model.getApp();
    this.getVars = () => model.getVars();
    this.listen = () => model.listen();
    this.DEDICATED_COMPRESSOR_3KB = uWs.DEDICATED_COMPRESSOR_3KB;
  }

  function Model() {
    let app = null;

    this.init = (_app) => {
      app = _app;
    };

    this.getApp = () => app.getApp();
    this.getVars = () => app.getVars();
    this.listen = () => app.listen();
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
      const {
        __socketOption,
        __ssl,
        __listenUrl,
        __query,
        __methods,
        __host,
        __port,
      } = _initiOption;
      const { upgrade, open, message, drain, close } = __methods;
      socketOption = __socketOption;
      ssl = __ssl;
      host = __host;
      port = __port;
      query = __query;
      methods = __methods;
      listenUrl = (param) => `ws://${host}:${port}` + "/" + param;

      app = uWs.App(ssl).ws(listenUrl(query), {
        ...socketOption,
        upgrade:
          upgrade ||
          ((res, req) => {
            query = req.getQuery() || query;
          }),
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
            console.log(message);
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

    this.listen = () => {
      app.listen(port, (token) => {
        console.log(`WebSocket Listening on ${listenUrl(query)}`);
        if (token) {
        }
      });
    };

    this.getApp = () => {
      return app;
    };

    this.getVars = () => ({
      app,
      socketOption,
      ssl,
      listenUrl,
      query,
      methods,
      host,
      port,
    });
  }

  return {
    initialize(option) {
      const app = new App();
      const model = new Model();
      const controller = new Controller();

      app.init(option);
      model.init(app);
      controller.init(model);

      return { ...controller.getVars(), getApp: controller.getApp };
    },
  };
})();

export default UWS;

const APP = UWS.initialize({
  __socketOption: {
    idleTimeout: 32,
    maxBackpressure: 1024,
    maxPayloadLength: 512,
    compression: UWS.DEDICATED_COMPRESSOR_3KB,
  },
  __ssl: {},
  __listenUrl: (host, port) => `ws://${host}:${port}`,
  __query: "?sp=A",
  __methods: {},
  __host: "localhost",
  __port: String(3000),
});

export { APP as uWs };

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
