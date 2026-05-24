let wasmModule = null;
let ready = false;
let pending = [];

function init() {
  return new Promise((resolve, reject) => {
    if (ready) return resolve(wasmModule);
    pending.push(resolve);

    if (!ready && !wasmModule) {
      Module = {
        onRuntimeInitialized() {
          wasmModule = Module;
          ready = true;
          pending.forEach(r => r(wasmModule));
          pending = [];
        },
        locateFile(path) {
          if (path.endsWith('.wasm')) return '/wasm/dist/geo.wasm';
          return '/wasm/dist/' + path;
        },
      };

      const script = document.createElement('script');
      script.src = '/wasm/dist/geo.js';
      script.onerror = () => reject(new Error('Failed to load WASM'));
      document.head.appendChild(script);
    }
  });
}

export async function haversine(lat1, lng1, lat2, lng2) {
  const mod = await init();
  return mod.ccall('haversine', 'double', ['double', 'double', 'double', 'double'], [lat1, lng1, lat2, lng2]);
}

export async function totalDistance(coords) {
  const mod = await init();
  const buf = mod._malloc(coords.length * 8);
  for (let i = 0; i < coords.length; i++) {
    mod.setValue(buf + i * 8, coords[i], 'double');
  }
  const result = mod.ccall('totalDistance', 'double', ['number', 'int'], [buf, coords.length / 2]);
  mod._free(buf);
  return result;
}

export async function nearestBakery(userLat, userLng, bakeries) {
  const mod = await init();
  const count = bakeries.length;
  const latBuf = mod._malloc(count * 8);
  const lngBuf = mod._malloc(count * 8);
  bakeries.forEach((b, i) => {
    mod.setValue(latBuf + i * 8, b.lat, 'double');
    mod.setValue(lngBuf + i * 8, b.lng, 'double');
  });
  const idx = mod.ccall('nearestBakery', 'int', ['double', 'double', 'number', 'number', 'int'],
    [userLat, userLng, latBuf, lngBuf, count]);
  mod._free(latBuf);
  mod._free(lngBuf);
  return idx;
}

export async function sortBakeriesByDistance(userLat, userLng, bakeries) {
  const mod = await init();
  const count = bakeries.length;
  const latBuf = mod._malloc(count * 8);
  const lngBuf = mod._malloc(count * 8);
  const idxBuf = mod._malloc(count * 4);
  bakeries.forEach((b, i) => {
    mod.setValue(latBuf + i * 8, b.lat, 'double');
    mod.setValue(lngBuf + i * 8, b.lng, 'double');
  });
  mod.ccall('sortBakeriesByDistance', 'void', ['double', 'double', 'number', 'number', 'number', 'int'],
    [userLat, userLng, latBuf, lngBuf, idxBuf, count]);
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(mod.getValue(idxBuf + i * 4, 'i32'));
  }
  mod._free(latBuf);
  mod._free(lngBuf);
  mod._free(idxBuf);
  return result;
}

export async function calculateDeliveryFee(distanceMeters) {
  const mod = await init();
  return mod.ccall('calculateDeliveryFee', 'int', ['double'], [distanceMeters]);
}

export async function optimizeRoute(driver, bakery, customer) {
  const mod = await init();
  const buf = mod._malloc(4);
  const dist = mod.ccall('optimizeRoute', 'int',
    ['number', 'number', 'number', 'number', 'number', 'number', 'number'],
    [mod._malloc(8), mod._malloc(8), mod._malloc(8), mod._malloc(8), mod._malloc(8), mod._malloc(8), buf]);
  // Simplified: use arrays
  return { distance: dist };
}

export async function matchDriver(drivers, bakeryLat, bakeryLng) {
  const mod = await init();
  const count = drivers.length;
  const latBuf = mod._malloc(count * 8);
  const lngBuf = mod._malloc(count * 8);
  const scoreBuf = mod._malloc(count * 8);
  drivers.forEach((d, i) => {
    mod.setValue(latBuf + i * 8, d.lat, 'double');
    mod.setValue(lngBuf + i * 8, d.lng, 'double');
    mod.setValue(scoreBuf + i * 8, d.score || 1, 'double');
  });
  const idx = mod.ccall('matchDriver', 'int', ['number', 'number', 'number', 'int', 'double', 'double'],
    [latBuf, lngBuf, scoreBuf, count, bakeryLat, bakeryLng]);
  mod._free(latBuf);
  mod._free(lngBuf);
  mod._free(scoreBuf);
  return idx;
}

export { init as wasmReady };
