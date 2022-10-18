import THREE from "three.js";
import dev from "../../model/devConsole";

class Web3D {
  #renderer;
  #scene;
  #camera;
  #orbitController;

  constructor() {
    dev.log("init");
    this.#initialize();
  }

  #initialize() {
    this.#setupScene();
    this.#setupCamera();
    this.#setupRenderer();
    this.#setupOrbitController();
  }
  #setupScene() {
    const scene = new THREE.Scene();

    this.#scene = scene;
  }
  #setupCamera() {
    const camera = new THREE.Scene();
    this.#scene.add(camera);

    this.#camera = camera;
  }
  #setupRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    this.#renderer = renderer;
  }
  #setupOrbitController() {
    const orbitController = new THREE.Scene();

    this.#orbitController = orbitController;
  }
}

export default new Web3D();
