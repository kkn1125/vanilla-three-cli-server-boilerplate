import PIPE from "./src/model/pipe.js";
import UWS from "./src/model/uws.js";

const app = UWS.initialize({
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
}).listen("localhost", 3000);

console.log(app.getApp());
