import uWs from "uWebSockets.js";
import dev from "../frontend/dist/src/model/devConsole";

const sockets = new Map();
const host = process.env.HOST;
const port = process.env.PORT;
let isDisableKeepAlive = false;

const app = uWs
  .App({})
  .ws("/*", {
    idleTimeout: 10,
    maxPayloadLength: 16 * 1024 * 1024,
    compression: uWs.SHARED_COMPRESSOR,
    upgrade(res, req, context) {
      const params = Object.fromEntries(
        req
          .getQuery()
          .slice(1)
          .split("&")
          .map((param) => param.split("="))
      );
      res.upgrade(
        {
          space: params.sp || "a",
        },
        /* Spell these correctly */
        req.getHeader("sec-websocket-key"),
        req.getHeader("sec-websocket-protocol"),
        req.getHeader("sec-websocket-extensions"),
        context
      );
    },
    open: function (ws) {
      dev.log("소켓 연결 됨");
    },
    message: function (ws, message, isBinary) {
      ws.send(message, isBinary);
      dev.log(message);
    },
    drain: function (ws) {
      dev.log("WebSocket backpressure: ", ws.getBufferedAmount());
    },
    close: function (ws, code, message) {
      if (isDisableKeepAlive) {
        ws.close();
      }
      dev.log("WebSocket closed");
    },
  })
  .listen(Number(port), (token) => {
    if (token) {
      process.send("ready");
      dev.log(`WebSocket Listening on ws://${host}:${port}`);
    } else {
      console.log("Failed to listen to port " + port);
    }
  });

process.on("SIGINT", function () {
  isDisableKeepAlive = true;
  process.exit(0);
});
