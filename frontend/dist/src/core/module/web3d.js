import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import dev from "../../model/devConsole";
import options from "../options";
import sockets from "./socket";

class Web3D {
  #canvas;
  #renderer;
  #scene;
  #camera;
  #orbitController;
  #plane;
  #lights = {};

  constructor() {
    dev.log("init");
    this.#initialize();

    this.#activateEvents();

    requestAnimationFrame(this.#render.bind(this));
  }

  #initialize() {
    // setup
    this.#setupRenderer();
    this.#setupScene();
    this.#setupCamera();
    this.#setupOrbitController();

    // lights
    this.#createAmbientLight();
    this.#createDirectionalLight();

    // generate geometry
    this.#createPlane();
  }

  #activateEvents() {
    this.#resizeEvent();
  }

  #resizeEvent() {
    window.addEventListener("resize", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.#camera.aspect = window.innerWidth / window.innerHeight;
      this.#camera.updateProjectionMatrix();
      this.#renderer.setSize(window.innerWidth, window.innerHeight);
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

    const cameraHelper = new THREE.CameraHelper(camera);
    this.#scene.add(cameraHelper);

    camera.position.set(1, 1, 1);
    camera.lookAt(0, 0, 0);

    this.#camera = camera;
  }

  #setupRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    this.#canvas = renderer.domElement;
    this.#renderer = renderer;
  }

  #setupOrbitController() {
    const orbitController = new OrbitControls(this.#camera, this.#canvas);

    orbitController.update();

    this.#orbitController = orbitController;
  }

  #createPlane() {
    const planeGeometry = new THREE.PlaneGeometry(1, 1);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;

    this.#plane = plane;
    this.#scene.add(this.#plane);
  }

  #createAmbientLight() {
    const light = new THREE.AmbientLight(0x404040); // soft white light
    light.position.set(0, 2, 0);

    this.#scene.add(light);
    this.#lights.ambientLight = light;
  }

  #createDirectionalLight() {
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    const helper = new THREE.DirectionalLightHelper(light, 1);
    light.position.set(2, 2, 0);
    light.lookAt(0, 0, 0);
    light.castShadow = true;

    this.#scene.add(light);
    this.#scene.add(helper);
    this.#lights.directionalLight = light;
  }

  #render(frame) {
    this.#orbitController.update();

    this.#renderer.render(this.#scene, this.#camera);
    // this.#plane.rotation.x += 0.01;
    // this.#plane.rotation.z += 0.01;

    requestAnimationFrame(this.#render.bind(this));
  }
}

export default Web3D;
