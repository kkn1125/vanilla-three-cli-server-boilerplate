import THREE from "three.js";
import dev from "../../model/devConsole";
import options from "../options";

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
    this.#resizeEvent();
    this.#setupOrbitController();
  }

  #resizeEvent() {
    window.addEventListener("resize", (e) => {
      this.#camera.aspect = innerWidth / innerHeight;
      this.#camera.updateProjectionMatrix();
      this.#renderer.setSize(innerWidth, innerHeight);
    });
  }
  #setupScene() {
    const scene = new THREE.Scene();

    this.#scene = scene;
  }
  #setupCamera() {
    const camera = new THREE.PerspectiveCamera(
      options.camera.FOV,
      options.camera.INNER_WIDTH,
      options.camera.INNER_HEIGHT,
      options.camera.NEAR,
      options.camera.FAR
    );
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
