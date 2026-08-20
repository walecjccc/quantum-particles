import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { BaseScene } from "./scenes/BaseScene";
import { GalaxyScene } from "./scenes/GalaxyScene";
import { NebulaScene } from "./scenes/NebulaScene";
import { DNAScene } from "./scenes/DNAScene";
import { BlackholeScene } from "./scenes/BlackholeScene";
import { WaveScene } from "./scenes/WaveScene";

type SceneConstructor = new () => BaseScene;

const SCENES: Record<string, SceneConstructor> = {
  galaxy: GalaxyScene,
  nebula: NebulaScene,
  dna: DNAScene,
  blackhole: BlackholeScene,
  wave: WaveScene,
};

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x050510, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050510, 0.018);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 14);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 3;
controls.maxDistance = 40;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;

let current: BaseScene | null = null;
let currentKey = "";

function loadScene(key: string): void {
  if (currentKey === key && current) return;
  if (current) {
    scene.remove(current.object3D);
    current.dispose();
  }
  const Ctor = SCENES[key];
  if (!Ctor) return;
  current = new Ctor();
  current.init();
  scene.add(current.object3D);
  currentKey = key;
  updateParticleCount(current.count);
}

function updateParticleCount(n: number): void {
  const el = document.getElementById("particle-count");
  if (el) el.textContent = n.toLocaleString();
}

loadScene("galaxy");

const buttons = document.querySelectorAll<HTMLButtonElement>(".mode-btn");
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const mode = btn.dataset.mode!;
    loadScene(mode);
  });
});

window.addEventListener("keydown", (e) => {
  const keys = Object.keys(SCENES);
  const idx = parseInt(e.key, 10) - 1;
  if (idx >= 0 && idx < keys.length) {
    const btn = document.querySelector<HTMLButtonElement>(`.mode-btn[data-mode="${keys[idx]}"]`);
    btn?.click();
  }
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
let frames = 0;
let fpsTimer = 0;
const fpsEl = document.getElementById("fps");

function animate(): void {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  current?.update(elapsed, delta);
  controls.update();
  renderer.render(scene, camera);

  frames++;
  fpsTimer += delta;
  if (fpsTimer >= 1) {
    if (fpsEl) fpsEl.textContent = `${frames}`;
    frames = 0;
    fpsTimer = 0;
  }
}

animate();
