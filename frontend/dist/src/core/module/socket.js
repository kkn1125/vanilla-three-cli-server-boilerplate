import dev from "../../model/devConsole";
import { options } from "../options";

class Socket {
  #sockets = new Map();
	#users = [];

  constructor() {
    this.#initialize();
  }

  #initialize() {
    this.#ws = new WebSocket("ws://localhost:5000/?sp=A");
    dev.log("ws initialized");
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
}

export default new Socket();
