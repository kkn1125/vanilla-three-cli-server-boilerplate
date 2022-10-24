import dev from "../../model/devConsole";
import options from "../options";

class Socket {
  #sockets = new Map();
  #users = [];
  #ws = null;
  #requestWebSocketUri = null;

  constructor() {
    this.#initialize();
  }

  #initialize() {
    dev.log("ws initialized");
    this.#requestWebSocketUri = `ws://${options.socket.host}:${options.socket.port}/${options.socket.query}`;
    this.#ws = new WebSocket(this.#requestWebSocketUri);
    this.#ws.binaryType = "arraybuffer";
    dev.log(`connecting on ${this.#requestWebSocketUri}`);
  }

  #options() {
    this.#ws.onopen = this.#open;
    this.#ws.message = this.#message;
    this.#ws.error = this.#error;
    this.#ws.close = this.#close;
  }

  #open(e) {
    dev.log("소켓이 연결되었습니다.");
  }
  #message(message) {
    dev.log(message);
  }
  #error(e) {
    dev.log(e);
  }
  #close(e) {
    dev.log(e);
  }

  send(message) {
    this.#ws.send(message);
  }

  sendStringify(message) {
    this.#ws.send(JSON.stringify(message));
  }

  sendBinaryData(binaries) {
    this.#ws.send(
      protobuf.Message.encode(
        new protobuf.Message(JSON.stringify(binaries))
      ).finish()
    );
  }
}

export default new Socket();
