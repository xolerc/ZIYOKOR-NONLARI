import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const CITY_BOUNDS = { minX: -200, maxX: 200, minZ: -200, maxZ: 200 };

export function createScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0806);
  scene.fog = new THREE.Fog(0x0a0806, 300, 600);

  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 1000);
  camera.position.set(100, 120, 180);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(container.clientWidth, container.clientHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.left = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  container.appendChild(labelRenderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.minDistance = 30;
  controls.maxDistance = 400;
  controls.target.set(0, 0, 0);

  // Lights
  const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffd4a5, 1.5);
  sunLight.position.set(100, 150, 50);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 400;
  sunLight.shadow.camera.left = -200;
  sunLight.shadow.camera.right = 200;
  sunLight.shadow.camera.top = 200;
  sunLight.shadow.camera.bottom = -200;
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
  fillLight.position.set(-50, 80, -100);
  scene.add(fillLight);

  const hemiLight = new THREE.HemisphereLight(0x443366, 0x111111, 0.6);
  scene.add(hemiLight);

  // Ground
  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1a1510,
    roughness: 0.9,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid
  const gridHelper = new THREE.GridHelper(500, 50, 0x2a2510, 0x1a1515);
  gridHelper.position.y = -0.4;
  scene.add(gridHelper);

  return { scene, camera, renderer, labelRenderer, controls };
}

export function createGroundMarker(x, z, color = 0xd4a574) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2, 2.5, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
  );
  ring.position.set(x, 0.01, z);
  ring.rotation.x = -Math.PI / 2;
  return ring;
}

export function createBuilding(x, z, width, depth, height, color = 0x2a2520) {
  const geo = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    metalness: 0.1,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, height / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createBakeryBuilding(x, z) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(8, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x3a3025, roughness: 0.7, metalness: 0.1 })
  );
  base.position.y = 2;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(6, 2, 4),
    new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 })
  );
  roof.position.y = 5;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 1),
    new THREE.MeshStandardMaterial({ color: 0xd4a574, emissive: 0xd4a574, emissiveIntensity: 0.3 })
  );
  sign.position.set(0, 3.5, 4.1);
  group.add(sign);

  group.position.set(x, 0, z);
  return group;
}

export function makeBreadModel(type = 'round', color = 0xd4a574) {
  let geo;
  switch (type) {
    case 'round':
      geo = new THREE.SphereGeometry(1.2, 16, 12);
      geo.scale(1, 0.6, 1);
      break;
    case 'baguette':
      geo = new THREE.CylinderGeometry(0.4, 0.5, 3, 8);
      geo.rotateX(Math.PI / 2);
      break;
    case 'flat':
      geo = new THREE.CylinderGeometry(1.8, 1.5, 0.4, 16);
      break;
    default:
      geo = new THREE.SphereGeometry(1, 16, 12);
  }
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.9,
    metalness: 0.0,
  });
  return new THREE.Mesh(geo, mat);
}

export function createDeliveryCar(x, z, color = 0xff6600) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 1, 1.2),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  );
  body.position.y = 0.7;
  body.castShadow = true;
  group.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.7, 1.1),
    new THREE.MeshStandardMaterial({ color: 0x444466, roughness: 0.4 })
  );
  cabin.position.set(-0.6, 1.2, 0);
  group.add(cabin);

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  for (const [wx, wz] of [[-0.8, 0.8], [-0.8, -0.8], [0.8, 0.8], [0.8, -0.8]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.15, 8), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, 0.15, wz);
    group.add(wheel);
  }

  group.position.set(x, 0, z);
  return group;
}

export function createLabel(text, x, z, yOffset = 6) {
  const div = document.createElement('div');
  div.textContent = text;
  div.style.color = '#d4a574';
  div.style.fontFamily = 'system-ui, sans-serif';
  div.style.fontSize = '14px';
  div.style.fontWeight = 'bold';
  div.style.textShadow = '0 2px 8px rgba(0,0,0,0.8)';
  div.style.background = 'rgba(10,8,6,0.7)';
  div.style.padding = '4px 12px';
  div.style.borderRadius = '12px';
  div.style.border = '1px solid rgba(212,165,116,0.3)';
  div.style.backdropFilter = 'blur(4px)';
  const label = new CSS2DObject(div);
  label.position.set(x, yOffset, z);
  return label;
}
