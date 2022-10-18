import PIPE from "./src/model/pipe.js";
import { uWs } from "./src/model/uws.js";

const app = uWs.getApp();

app.publish(
  "test",
  JSON.stringify({
    data: {
      test: 123,
    },
  })
);
