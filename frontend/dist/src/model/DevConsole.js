class DevConsole {
  #SIGN = "[DEV]";
  #BRIDGE = " ::";

  assert(condition, ...data) {
    console.assert(condition, `${this.#SIGN}${this.#BRIDGE}`, ...data);
  }
  log(...data) {
    console.log(`${this.#SIGN}${this.#BRIDGE}`, ...data);
  }
  debug(...data) {
    console.debug(`${this.#SIGN}${this.#BRIDGE}`, ...data);
  }
  warn(...data) {
    console.warn(`${this.#SIGN}${this.#BRIDGE}`, ...data);
  }
  error(...data) {
    console.error(`${this.#SIGN}${this.#BRIDGE}`, ...data);
  }
  time(label) {
    console.time(label);
  }
  timeEnd(label) {
    console.timeEnd(label);
  }
}

const dev = new DevConsole();

export default dev;
