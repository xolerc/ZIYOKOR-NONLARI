import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const ThreeMap = {
  scene: null, camera: null, renderer: null, labelRenderer: null, controls: null,
  buildings: [], deliveryCars: [], bakeryLabels: [], animationId: null, isVisible: false,

  async init(container) {
    if (!container) return;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0806);
    this.scene.fog = new THREE.Fog(0x0a0806, 300, 600);

    this.camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 1, 1000);
    this.camera.position.set(80, 100, 150);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(container.clientWidth, container.clientHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.left = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(this.labelRenderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 350;
    this.controls.target.set(0, 0, 0);

    this._setupLights();
    this._setupGround();
    this._generateCity();
    this._animate();
    this.isVisible = true;

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.labelRenderer.setSize(w, h);
    };
    window.addEventListener('resize', resize);
  },

  _setupLights() {
    this.scene.add(new THREE.AmbientLight(0x404060, 0.4));
    const sun = new THREE.DirectionalLight(0xffd4a5, 1.5);
    sun.position.set(100, 150, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 400;
    sun.shadow.camera.left = -200;
    sun.shadow.camera.right = 200;
    sun.shadow.camera.top = 200;
    sun.shadow.camera.bottom = -200;
    this.scene.add(sun);
    this.scene.add(new THREE.DirectionalLight(0x8888ff, 0.3).position.set(-50, 80, -100));
    this.scene.add(new THREE.HemisphereLight(0x443366, 0x111111, 0.6));
  },

  _setupGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 500),
      new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(500, 50, 0x2a2510, 0x1a1515);
    grid.position.y = -0.4;
    this.scene.add(grid);
  },

  _generateCity() {
    let seed = 42;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 50; i++) {
      const x = (rand() - 0.5) * 280;
      const z = (rand() - 0.5) * 280;
      const w = 2 + rand() * 5;
      const h = 2 + rand() * 8;
      const d = w * (0.6 + rand() * 0.8);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: 0x2a2520 + Math.floor(rand() * 0x111111), roughness: 0.8 })
      );
      mesh.position.set(x, h / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.buildings.push(mesh);
    }
  },

  addBakery(lat, lng, name) {
    const x = (lng / 180) * 200;
    const z = (lat / 90) * -200;
    const group = new THREE.Group();

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(7, 3.5, 7),
      new THREE.MeshStandardMaterial({ color: 0x3a3025, roughness: 0.7 })
    );
    base.position.y = 1.75;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(5, 2, 4),
      new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 })
    );
    roof.position.y = 4.5;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 0.8),
      new THREE.MeshBasicMaterial({ color: 0xd4a574, transparent: true, opacity: 0.9 })
    );
    sign.position.set(0, 3, 3.6);
    group.add(sign);

    group.position.set(x, 0, z);
    this.scene.add(group);

    const div = document.createElement('div');
    div.textContent = name || 'Nonvoyxona';
    div.style.cssText = 'color:#d4a574;font:bold 13px system-ui;background:rgba(10,8,6,0.8);padding:3px 10px;border-radius:10px;border:1px solid rgba(212,165,116,0.3);backdrop-filter:blur(4px);white-space:nowrap';
    const label = new CSS2DObject(div);
    label.position.set(x, 6.5, z);
    this.scene.add(label);

    this.bakeryLabels.push({ group, label });
    return { x, z, group };
  },

  addCar(lat, lng, color = 0xff6600) {
    const x = (lng / 180) * 200;
    const z = (lat / 90) * -200;
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.8, 1),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
    );
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.5, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x444466, roughness: 0.4 })
    );
    cabin.position.set(-0.5, 1.05, 0);
    group.add(cabin);

    const wMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    for (const [wx, wz] of [[-0.7, 0.6], [-0.7, -0.6], [0.7, 0.6], [0.7, -0.6]]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.12, 8), wMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(wx, 0.12, wz);
      group.add(w);
    }

    group.position.set(x, 0, z);
    this.scene.add(group);

    const car = { group, data: { id: this.deliveryCars.length, lat, lng } };
    this.deliveryCars.push(car);
    return car;
  },

  moveCar(id, lat, lng) {
    const x = (lng / 180) * 200;
    const z = (lat / 90) * -200;
    const car = this.deliveryCars[id];
    if (car) {
      car.group.position.x = x;
      car.group.position.z = z;
    }
  },

  clear() {
    [...this.buildings, ...this.bakeryLabels.flatMap(b => [b.group, b.label])].forEach(o => this.scene.remove(o));
    this.deliveryCars.forEach(c => this.scene.remove(c.group));
    this.buildings = [];
    this.bakeryLabels = [];
    this.deliveryCars = [];
  },

  destroy() {
    this.isVisible = false;
    cancelAnimationFrame(this.animationId);
    this.clear();
    this.renderer?.dispose();
    this.renderer?.domElement?.remove();
    this.labelRenderer?.domElement?.remove();
  },

  _animate() {
    if (!this.isVisible) return;
    this.animationId = requestAnimationFrame(() => this._animate());
    this.controls?.update();
    const t = Date.now() / 1000;
    this.deliveryCars.forEach((c, i) => {
      c.group.position.y = 0.5 + Math.sin(t * 2 + i) * 0.15;
    });
    this.renderer?.render(this.scene, this.camera);
    this.labelRenderer?.render(this.scene, this.camera);
  }
};

window.ThreeMap = ThreeMap;
