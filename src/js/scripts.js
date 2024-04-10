import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import nebulaTexture from "../img/nebula.jpg";
import starsTexture from "../img/stars.jpg";

// Define the URL for the 3D model
const monkeyModelURL = new URL("../assets/monkey.glb", import.meta.url);

// Initialize WebGL renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a new scene
const scene = new THREE.Scene();

// Create a new perspective camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Initialize OrbitControls to control the camera
const orbitControls = new OrbitControls(camera, renderer.domElement);

// Add axes helper to visualize orientation
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Set initial camera position and update OrbitControls
camera.position.set(-10, 30, 30);
orbitControls.update();

// Define basic geometry and materials
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(boxMesh);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);
planeMesh.rotation.x = -0.5 * Math.PI;
planeMesh.receiveShadow = true;

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0x0000ff,
  wireframe: false,
});
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphereMesh);
sphereMesh.position.set(-10, 10, 0);
sphereMesh.castShadow = true;

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// Define and add spot light to the scene
const spotLight = new THREE.SpotLight(0xffffff);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2;

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

// Add fog to the scene
scene.fog = new THREE.FogExp2(0xffffff, 0.01);

// Load textures for the cube background
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  nebulaTexture,
  nebulaTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
]);

// Create a textured box
const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
const box2Material = new THREE.MeshBasicMaterial({});
const box2MultiMaterial = [
  new THREE.MeshBasicMaterial({ map: textureLoader.load(starsTexture) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(starsTexture) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebulaTexture) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(starsTexture) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebulaTexture) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(starsTexture) }),
];
const box2Mesh = new THREE.Mesh(box2Geometry, box2MultiMaterial);
scene.add(box2Mesh);
box2Mesh.position.set(0, 15, 10);

// Create wireframe plane
const plane2Geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const plane2Material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
});
const plane2Mesh = new THREE.Mesh(plane2Geometry, plane2Material);
scene.add(plane2Mesh);
plane2Mesh.position.set(10, 10, 15);

// Randomize positions of vertices
plane2Mesh.geometry.attributes.position.array[0] -= 10 * Math.random();
plane2Mesh.geometry.attributes.position.array[1] -= 10 * Math.random();
plane2Mesh.geometry.attributes.position.array[2] -= 10 * Math.random();
const lastPointZ = plane2Mesh.geometry.attributes.position.array.length - 1;
plane2Mesh.geometry.attributes.position.array[lastPointZ] -= 10 * Math.random();

// Create a shader material sphere
const sphere2Geometry = new THREE.SphereGeometry(4);
const sphere2Material = new THREE.ShaderMaterial({
  vertexShader: document.getElementById("vertexShader").textContent,
  fragmentShader: document.getElementById("fragmentShader").textContent,
});
const sphere2Mesh = new THREE.Mesh(sphere2Geometry, sphere2Material);
scene.add(sphere2Mesh);
sphere2Mesh.position.set(-5, 10, 10);

// Load GLTF model
const modelLoader = new GLTFLoader();
let mixer;
modelLoader.load(
  monkeyModelURL.href,
  function (gltf) {
    const monkeyModel = gltf.scene;
    console.log(monkeyModel.children[1].material.opacity);
    scene.add(monkeyModel);
    monkeyModel.position.set(-12, 4, 10);

    mixer = new THREE.AnimationMixer(monkeyModel);
    const clips = gltf.animations;

    const clip = THREE.AnimationClip.findByName(clips, "myAnimation");
    const action = mixer.clipAction(clip);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Initialize dat.GUI for GUI controls
const gui = new dat.GUI();

// Define GUI options
const options = {
  sphereColor: "#ffea00",
  wireframe: false,
  speed: 0.01,
  angle: 0.2,
  penumbra: 0,
  intensity: 1,
};

// Add GUI controls
gui.addColor(options, "sphereColor").onChange(function (color) {
  sphereMesh.material.color.set(color);
});

gui.add(options, "wireframe").onChange(function (value) {
  sphereMesh.material.wireframe = value;
});

gui.add(options, "speed", 0, 0.1);
gui.add(options, "angle", 0, 1);
gui.add(options, "penumbra", 0, 1);
gui.add(options, "intensity", 0, 1);

// Initialize variables for raycasting
let step = 0;
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const sphereMeshId = sphereMesh.id;
box2Mesh.name = "theBox";

// Animation loop
const clock = new THREE.Clock();
function animate(time) {
  // Update the mixer if it exists
  if (mixer) mixer.update(clock.getDelta());

  // Rotate the box
  boxMesh.rotation.x = time / 1000;
  boxMesh.rotation.y = time / 1000;

  // Move the sphere up and down
  step += options.speed;
  sphereMesh.position.y = 10 * Math.abs(Math.sin(step));

  // Update spotlight parameters
  spotLight.angle = options.angle;
  spotLight.penumbra = options.penumbra;
  spotLight.intensity = options.intensity;
  spotLightHelper.update();

  // Perform raycasting to detect intersections
  raycaster.setFromCamera(mousePosition, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  // Handle intersections
  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.id === sphereMeshId)
      intersects[i].object.material.color.set(0xff0000);

    if (intersects[i].object.name === "theBox") {
      intersects[i].object.rotation.x = time / 1000;
      intersects[i].object.rotation.y = time / 1000;
    }
  }

  // Randomize positions of wireframe plane vertices
  plane2Mesh.geometry.attributes.position.array[0] = 10 * Math.random();
  plane2Mesh.geometry.attributes.position.array[1] = 10 * Math.random();
  plane2Mesh.geometry.attributes.position.array[2] = 10 * Math.random();
  plane2Mesh.geometry.attributes.position.array[lastPointZ] =
    10 * Math.random();
  plane2Mesh.geometry.attributes.position.needsUpdate = true;

  // Render the scene
  renderer.render(scene, camera);
}

// Start the animation loop
renderer.setAnimationLoop(animate);

// Adjust camera aspect ratio and renderer size on window resize
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
