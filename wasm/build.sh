#!/bin/bash
# WASM build script using Emscripten
# Install emsdk first: https://emscripten.org/docs/getting_started/downloads.html

set -e

SRC_DIR="src"
DIST_DIR="dist"
OPTIMIZATION="-O3"

# Check for emcc
if ! command -v emcc &> /dev/null; then
  echo "Emscripten not found. Install via:"
  echo "  git clone https://github.com/emscripten-core/emsdk.git"
  echo "  cd emsdk && ./emsdk install latest && ./emsdk activate latest"
  echo "  source ./emsdk_env.sh"
  exit 1
fi

mkdir -p $DIST_DIR

echo "Building WASM modules..."

# Compile geo.cc to WASM
emcc $SRC_DIR/geo.cc \
  $OPTIMIZATION \
  -s WASM=1 \
  -s EXPORTED_FUNCTIONS='["_haversine","_totalDistance","_nearestBakery","_sortBakeriesByDistance","_calculateDeliveryFee","_optimizeRoute","_matchDriver","_malloc","_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","getValue","setValue"]' \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s FILESYSTEM=0 \
  -o $DIST_DIR/geo.js

echo "Done! WASM modules in $DIST_DIR/"
echo "Files:"
ls -lh $DIST_DIR/
