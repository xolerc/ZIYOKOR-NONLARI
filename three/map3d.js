// Three.js 3D City Map — ZIYOKOR NONLARI
// Loaded as regular script (non-module), uses Three.js from CDN

const ThreeMap = (() => {
  let scene, camera, renderer, labelRenderer, controls;
  let buildings = [];
  let deliveryCars = [];
  let animationId;
  let isVisible = false;

  function init(container) {
    if (!container || !THREE) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0806);
    scene.fog = new THREE.Fog(0x0a0806, 300, 600);

    camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(80, 100, 150);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // OrbitControls from CDN
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 20;
    controls.maxDistance = 350;
    controls.target.set(0, 0, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0x404060, 0.4));

    const sun = new THREE.DirectionalLight(0xffd4a5, 1.5);
    sun.position.set(100, 150, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 400;
    sun.shadow.camera.left = -200;
    sun.shadow.camera.right = 200;
    sun.shadow.camera.top = 200;
    sun.shadow.camera.bottom = -200;
    scene.add(sun);

    scene.add(new THREE.DirectionalLight(0x8888ff, 0.3).position.set(-50, 80, -100));
    scene.add(new THREE.HemisphereLight(0x443366, 0x111111, 0.6));

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 500),
      new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(500, 50, 0x2a2510, 0x1a1515);
    grid.position.y = -0.4;
    scene.add(grid);

    generateCity();
    animate();
    isVisible = true;

    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  function generateCity() {
    let seed = 42;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 50; i++) {
      const x = (rand() - 0.5) * 280;
      const z = (rand() - 0.5) * 280;
      addBuilding(x, z, 2 + rand() * 5, 2 + rand() * 8, 0x2a2520 + Math.floor(rand() * 0x111111));
    }
  }

  function addBuilding(x, z, w, h, color) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, w * (0.6 + Math.random() * 0.8)),
      new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1 })
    );
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    buildings.push(mesh);
  }

  function addBakery(lat, lng, name) {
    const x = (lng / 180) * 200;
    const z = (lat / 90) * -200;
    const group = new THREE.Group();

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(7, 3.5, 7),
      new THREE.MeshStandardMaterial({ color: 0x3a3025, roughness: 0.7, metalness: 0.1 })
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

    // Glow sign
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 0.8),
      new THREE.MeshBasicMaterial({ color: 0xd4a574, transparent: true, opacity: 0.9 })
    );
    glow.position.set(0, 3, 3.6);
    group.add(glow);

    group.position.set(x, 0, z);
    scene.add(group);

    // Label
    const label = document.createElement('div');
    label.textContent = name || 'Nonvoyxona';
    label.style.cssText = 'color:#d4a574;font:bold 13px system-ui;background:rgba(10,8,6,0.8);padding:3px 10px;border-radius:10px;border:1px solid rgba(212,165,116,0.3);backdrop-filter:blur(4px);white-space:nowrap';
    const labelObj = new THREE.CSS2DObject(label);
    labelObj.position.set(x, 6.5, z);
    scene.add(labelObj);

    return { x, z, group };
  }

  function addCar(lat, lng, color) {
    const x = (lng / 180) * 200;
    const z = (lat / 90) * -200;
    color = color || 0xff6600;
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
    scene.add(group);

    const idx = deliveryCars.length;
    deliveryCars.push({ group, data: { id: idx, lat, lng } });
    return group;
  }

  function moveCar(id, lat, lng) {
    const car = deliveryCars[id];
    if (!car) return;
    const x = (lng / 180) * 200;
    const z = (lat / 90) * -200;
    car.group.position.x = x;
    car.group.position.z = z;
  }

  function destroy() {
    isVisible = false;
    cancelAnimationFrame(animationId);
    while (scene.children.length > 0) {
      const child = scene.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      scene.remove(child);
    }
    renderer?.dispose();
    renderer?.domElement?.remove();
    labelRenderer?.domElement?.remove();
  }

  function animate() {
    if (!isVisible) return;
    animationId = requestAnimationFrame(animate);
    controls?.update();
    const t = Date.now() / 1000;
    deliveryCars.forEach((c, i) => {
      c.group.position.y = 0.5 + Math.sin(t * 2 + i) * 0.15;
    });
    renderer?.render(scene, camera);
    labelRenderer?.render(scene, camera);
  }

  return { init, addBakery, addCar, moveCar, destroy };
})();
