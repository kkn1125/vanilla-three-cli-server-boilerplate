import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import dev from "../../model/devConsole";
import options from "../options";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class Web3D {
  /* private fields settings */
  #canvas;
  #renderer;
  #scene;
  #camera;
  #orbitController;
  #plane;
  #box;
  #model;
  #skeleton;
  #lights = {};
  #system;
  #earthOrbit;
  #moonOrbit;

  joystick = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

  characterSpeed = 1;
  grow = 0;
  isRun = false;
  run = 0;

  /* solar system object settings */
  clock;
  mixer;
  baseActions = {
    idle: { weight: 1 },
    walk: { weight: 0 },
    run: { weight: 0 },
  };
  additiveActions = {
    sneak_pose: { weight: 0 },
    sad_pose: { weight: 0 },
    agree: { weight: 0 },
    headShake: { weight: 0 },
  };
  allActions = [];
  numAnimations;

  /* constructor settings */
  constructor() {
    dev.log("init");
    this.clock = new THREE.Clock();

    // setup listener
    this.#addListeners();

    this.#setupRenderer();
    this.#setupScene();
    this.#setupCamera();
    this.#setupOrbitController();
    this.#setupResizable();

    this.#setupLight();
    this.#setupAmbientLight();

    // 도형 추가
    // this.#createBox();
    this.#createPlane();

    // Model loader
    this.#loadModels();

    this.#createObject3D();

    requestAnimationFrame(this.#render.bind(this));
  }

  #addListeners() {
    window.addEventListener("keydown", this.#startMove.bind(this));
    window.addEventListener("keyup", this.#endMove.bind(this));
  }

  #startMove(e) {
    if (e.key.match(/w|a|s|d/)) {
      console.log(this.joystick);
      this.joystick[e.key] = true;
    } else if (e.shiftKey) {
      this.isRun = true;
    } else {
      return;
    }
  }

  #endMove(e) {
    if (e.key.match(/w|a|s|d/)) {
      this.joystick[e.key] = false;
    } else if (e.shiftKey) {
      this.isRun = false;
    } else {
      return;
    }
  }

  #setupRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x555555, 1);
    renderer.shadowMap.enabled = true;
    // renderer.shadowMap.needsUpdate = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // element 추가
    document.body.appendChild(renderer.domElement);

    this.#renderer = renderer;
    this.#canvas = renderer.domElement;
  }

  #setupScene() {
    const scene = new THREE.Scene();

    this.#scene = scene;
  }

  #setupCamera() {
    const { FOV, INNER_WIDTH, INNER_HEIGHT, NEAR, FAR } = options.camera;
    const ASPECT = INNER_WIDTH / INNER_HEIGHT;

    const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
    camera.position.y = 5;
    camera.position.z = 5;

    this.#camera = camera;
  }

  #setupResizable() {
    window.addEventListener("resize", this.#resize.bind(this), false);
    this.#resize();
  }

  #resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.#camera.aspect = width / height;
    this.#camera.updateProjectionMatrix();

    this.#renderer.setSize(width, height);
  }

  #setupOrbitController() {
    const orbitController = new OrbitControls(this.#camera, this.#canvas);
    orbitController.enablePan = false;
    orbitController.enableZoom = false;
    orbitController.target.set(0, 1, 0);
    orbitController.update();

    this.#orbitController = orbitController;
  }

  /* Light 설정 */
  #setupLight() {
    const color = 0xffffff;
    const intensity = 0.8;
    const helperSize = 1;

    const light = new THREE.DirectionalLight(color, intensity);
    const lightHelper = new THREE.DirectionalLightHelper(light, helperSize);
    light.position.set(-1, 5, 4);
    light.lookAt(new THREE.Vector3(-1, 5, 4));
    light.castShadow = true;

    this.#scene.add(light);
    this.#scene.add(lightHelper);
    this.#lights.direct = light;
  }

  #setupAmbientLight() {
    const skyColor = 0xffffff;
    const groundColor = 0x080820;
    const intensity = 0.2;
    const helperSize = 1;

    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    const lightHelper = new THREE.HemisphereLightHelper(light, helperSize);

    light.position.y = 3;

    this.#scene.add(light);
    this.#scene.add(lightHelper);
    this.#lights.hemisphere = light;
  }

  #createBox() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x0fffff,
      emissive: true,
      flatShading: true,
    });
    const box = new THREE.Mesh(geometry, material);
    box.castShadow = true;

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
    const line = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      lineMaterial
    );

    const group = new THREE.Group();
    group.add(box);
    group.add(line);

    group.position.set(0, 0.5, 0);

    this.#scene.add(group);
    this.#box = group;
  }

  #createPlane() {
    const geometry = new THREE.PlaneGeometry(5, 5);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.rotation.x = Math.PI / 2;

    this.#scene.add(plane);
    this.#plane = plane;
  }

  #createObject3D() {
    const system = new THREE.Object3D();
    this.#scene.add(system);

    const radius = 1;
    const widhtSegments = 48;
    const heightSegments = 48;
    const sphereGeometry = new THREE.SphereGeometry(
      radius,
      widhtSegments,
      heightSegments
    );
    const material = new THREE.MeshPhongMaterial({
      emissive: 0xffff00,
      flatShading: true,
    });

    const mesh = new THREE.Mesh(sphereGeometry, material);
    mesh.scale.set(1, 1, 1);
    system.position.set(-3, 0, -3);

    system.add(mesh);

    // earth
    const earthOrbit = new THREE.Object3D();
    system.add(earthOrbit);

    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      emissive: 0x112244,
      flatShading: true,
    });

    const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
    earthOrbit.position.x = 7;
    earthOrbit.add(earthMesh);

    const moonOrbit = new THREE.Object3D();
    moonOrbit.position.x = 3;
    earthOrbit.add(moonOrbit);

    const moonMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888,
      emissive: 0x222222,
      flatShading: true,
    });

    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.scale.set(0.5, 0.5, 0.5);
    moonOrbit.add(moonMesh);

    this.#system = system;
    this.#earthOrbit = earthOrbit;
    this.#moonOrbit = moonOrbit;
  }

  #loadModels() {
    const loader = new GLTFLoader();
    loader.load("dist/src/gltf/Xbot.glb", (gltf) => {
      const model = gltf.scene;
      this.#model = model;
      this.#scene.add(model);
      model.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true;
        }
      });

      const skeleton = new THREE.SkeletonHelper(model);
      skeleton.visible = false;
      this.#skeleton = skeleton;

      this.#scene.add(skeleton);

      const animations = gltf.animations;
      this.mixer = new THREE.AnimationMixer(model);

      this.numAnimations = animations.length;

      for (let i = 0; i < this.numAnimations; i++) {
        let clip = animations[i];
        const name = clip.name;
        if (this.baseActions[name]) {
          const action = this.mixer.clipAction(clip);
          this.activateAction(action);
          this.baseActions[name].action = action;
          this.allActions.push(action);
        } else if (this.additiveActions[name]) {
          THREE.AnimationUtils.makeClipAdditive(clip);

          if (clip.name.endsWith("_pose")) {
            clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);
          }

          const action = this.mixer.clipAction(clip);
          this.activateAction(action);
          this.additiveActions[name].action = action;
          this.allActions.push(action);
        }
      }
    });
  }

  activateAction(action) {
    const clip = action.getClip();
    const settings =
      this.baseActions[clip.name] || this.additiveActions[clip.name];
    this.setWeight(action, settings.weight);
    action.play();
  }

  setWeight(action, weight) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
  }

  #render(frame) {
    this.#renderer.render(this.#scene, this.#camera);

    this.#update(frame);
    this.#characterMove(frame);

    requestAnimationFrame(this.#render.bind(this));
  }

  #update(frame) {
    frame *= 0.001;

    // for (let i = 0; i < this.numAnimations; ++i) {
    // if (this.allActions[1]) {
    //   const action = this.allActions[3];
    //   const clip = action.getClip();
    //   // const settings =
    //   // this.baseActions[clip.name] || this.additiveActions[clip.name];
    //   // console.log(settings);
    //   this.allActions[0].setEffectiveWeight(0);
    //   action.setEffectiveWeight(5);
    //   this.baseActions["run"].weight = action.getEffectiveWeight();
    // }
    // }
    // if (this.allActions.length > 0) {
    //   const action = this.allActions[6];
    //   // const clip = action.getClip();
    //   this.allActions[0].setEffectiveWeight(0);
    //   action.setEffectiveWeight(5);
    //   this.baseActions["run"].weight = action.getEffectiveWeight();
    // }
    const mixerUpdateDelta = this.clock.getDelta();
    this.mixer?.update(mixerUpdateDelta);

    this.#system.rotation.y = frame / 2;
    this.#earthOrbit.rotation.y = frame;
    // this.#moonOrbit.rotation.y = frame;

    // this.#box.rotation.x = frame;
    // this.#box.rotation.y = frame;
  }

  #characterMove(frame) {
    if (this.joystick.w) {
      this.#animationCharacter(6);
    } else if (this.joystick.s) {
      this.#animationCharacter(6);
    } else if (this.joystick.a) {
      this.#animationCharacter(6);
    } else if (this.joystick.d) {
      this.#animationCharacter(6);
    } else {
      this.#animationCharacter(2);
    }
  }

  #animationCharacter(num) {
    const action = this.allActions[num];
    if (!action) return;

    if (num === 2) {
      if (this.grow > 0) this.grow -= 0.04;
      if (this.run > 0) this.run -= 0.04;
      this.allActions[2].setEffectiveWeight(1 - this.grow);
      this.allActions[2].setEffectiveWeight(1 - this.grow);
    } else {
      if (this.grow < this.characterSpeed && !this.isRun) {
        this.run -= 0.02;
        this.allActions[3].setEffectiveWeight(1 - this.run);
        this.grow += 0.02;
      } else if (this.grow < this.characterSpeed && this.isRun) {
        this.grow -= 0.02;
        this.allActions[6].setEffectiveWeight(1 - this.grow);
        this.run += 0.02;
      }

      this.allActions[6].setEffectiveWeight(this.grow);
    }

    // action.setEffectiveWeight(this.grow);
    // this.allActions[0].setEffectiveWeight(0);
    // action.setEffectiveWeight(3);
    // this.baseActions["run"].weight = action.getEffectiveWeight();
  }
}

export default new Web3D();
