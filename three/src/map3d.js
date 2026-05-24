import { createScene, createBuilding, createBakeryBuilding, createDeliveryCar, createGroundMarker, createLabel, makeBreadModel } from './scene.js';

let scene, camera, renderer, labelRenderer, controls;
let buildings = [];
let deliveryCars = [];
let customerMarkers = [];
let animationId = null;
let isVisible = false;

export function initThreeMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const ctx = createScene(container);
  scene = ctx.scene;
  camera = ctx.camera;
  renderer = ctx.renderer;
  labelRenderer = ctx.labelRenderer;
  controls = ctx.controls;

  // Generate random city buildings
  generateCity();

  // Handle resize
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
  };
  window.addEventListener('resize', resize);

  animate();
  isVisible = true;
  return { scene, camera, controls };
}

function generateCity() {
  const seed = 42;
  let rng = seed;
  const rand = () => { rng = (rng * 16807) % 2147483647; return (rng - 1) / 2147483646; };

  // Generate grid of buildings
  for (let i = 0; i < 60; i++) {
    const x = (rand() - 0.5) * 300;
    const z = (rand() - 0.5) * 300;
    const w = 2 + rand() * 6;
    const d = 2 + rand() * 6;
    const h = 2 + rand() * 12;
    const color = rand() > 0.5 ? 0x2a2520 : 0x1e1a15;
    const building = createBuilding(x, z, w, d, h, color);
    scene.add(building);
  }
}

export function addBakery(data) {
  const x = (data.lng / 180) * 200;
  const z = (data.lat / 90) * -200;
  const bakery = createBakeryBuilding(x, z);
  scene.add(bakery);
  buildings.push({ mesh: bakery, data });

  const label = createLabel(data.bakeryName || data.name || 'Nonvoy', x, z, 7);
  scene.add(label);

  return { x, z };
}

export function addDeliveryDriver(data) {
  const x = (data.lng / 180) * 200;
  const z = (data.lat / 90) * -200;
  const car = createDeliveryCar(x, z, 0xff6600);
  scene.add(car);
  deliveryCars.push({ mesh: car, data });
  return car;
}

export function addCustomerMarker(data) {
  const x = (data.lng / 180) * 200;
  const z = (data.lat / 90) * -200;
  const marker = createGroundMarker(x, z, 0x44ff88);
  scene.add(marker);
  customerMarkers.push({ mesh: marker, data });
  return marker;
}

export function moveDeliveryCar(driverId, lat, lng) {
  const car = deliveryCars.find(c => c.data.id === driverId);
  if (!car) return;
  const x = (lng / 180) * 200;
  const z = (lat / 90) * -200;
  car.mesh.position.x = x;
  car.mesh.position.z = z;
}

export function clearAll() {
  buildings.forEach(b => scene.remove(b.mesh));
  deliveryCars.forEach(c => scene.remove(c.mesh));
  customerMarkers.forEach(m => scene.remove(m.mesh));
  buildings = [];
  deliveryCars = [];
  customerMarkers = [];
}

export function destroyThreeMap() {
  if (animationId) cancelAnimationFrame(animationId);
  isVisible = false;
  clearAll();
  if (renderer) {
    renderer.dispose();
    renderer.domElement.remove();
    labelRenderer.domElement.remove();
  }
}

function animate() {
  if (!isVisible) return;
  animationId = requestAnimationFrame(animate);
  controls?.update();

  // Animate delivery cars with slight bounce
  const time = Date.now() / 1000;
  deliveryCars.forEach((c, i) => {
    c.mesh.position.y = 0.5 + Math.sin(time * 2 + i) * 0.15;
  });

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
