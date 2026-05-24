#include <emscripten/emscripten.h>
#include <cmath>
#include <vector>
#include <algorithm>
#include <cstring>

extern "C" {

EMSCRIPTEN_KEEPALIVE
double haversine(double lat1, double lng1, double lat2, double lng2) {
  const double R = 6371000.0;
  double dLat = (lat2 - lat1) * M_PI / 180.0;
  double dLng = (lng2 - lng1) * M_PI / 180.0;
  double a = sin(dLat / 2) * sin(dLat / 2) +
             cos(lat1 * M_PI / 180.0) * cos(lat2 * M_PI / 180.0) *
             sin(dLng / 2) * sin(dLng / 2);
  double c = 2 * atan2(sqrt(a), sqrt(1 - a));
  return R * c;
}

EMSCRIPTEN_KEEPALIVE
double totalDistance(double* coords, int count) {
  double total = 0;
  for (int i = 1; i < count; i++) {
    total += haversine(coords[(i-1)*2], coords[(i-1)*2+1],
                       coords[i*2], coords[i*2+1]);
  }
  return total;
}

EMSCRIPTEN_KEEPALIVE
int nearestBakery(double userLat, double userLng,
                  double* bakeryLats, double* bakeryLngs,
                  int count) {
  int nearest = -1;
  double minDist = 1e18;
  for (int i = 0; i < count; i++) {
    double d = haversine(userLat, userLng, bakeryLats[i], bakeryLngs[i]);
    if (d < minDist) {
      minDist = d;
      nearest = i;
    }
  }
  return nearest;
}

EMSCRIPTEN_KEEPALIVE
void sortBakeriesByDistance(double userLat, double userLng,
                            double* bakeryLats, double* bakeryLngs,
                            int* indices, int count) {
  std::vector<std::pair<double, int>> dists;
  for (int i = 0; i < count; i++) {
    double d = haversine(userLat, userLng, bakeryLats[i], bakeryLngs[i]);
    dists.push_back({d, i});
  }
  std::sort(dists.begin(), dists.end());
  for (int i = 0; i < count; i++) {
    indices[i] = dists[i].second;
  }
}

EMSCRIPTEN_KEEPALIVE
int calculateDeliveryFee(double distanceMeters) {
  double km = distanceMeters / 1000.0;
  if (km <= 1.0) return 5000;
  if (km <= 3.0) return 8000;
  if (km <= 5.0) return 12000;
  if (km <= 10.0) return 18000;
  return 25000;
}

EMSCRIPTEN_KEEPALIVE
int optimizeRoute(double* driverLat, double* driverLng,
                  double* bakeryLat, double* bakeryLng,
                  double* customerLat, double* customerLng,
                  int* bestOrder) {
  double d1 = haversine(driverLat[0], driverLng[0],
                         bakeryLat[0], bakeryLng[0]) +
              haversine(bakeryLat[0], bakeryLng[0],
                         customerLat[0], customerLng[0]);

  double d2 = haversine(driverLat[0], driverLng[0],
                         customerLat[0], customerLng[0]) +
              haversine(customerLat[0], customerLng[0],
                         bakeryLat[0], bakeryLng[0]);

  if (d1 < d2) {
    bestOrder[0] = 0; // bakery first
    return (int)d1;
  } else {
    bestOrder[0] = 1; // customer first
    return (int)d2;
  }
}

EMSCRIPTEN_KEEPALIVE
int matchDriver(double* driverLats, double* driverLngs,
                double* driverScores, int driverCount,
                double bakeryLat, double bakeryLng) {
  int bestIdx = -1;
  double bestScore = -1;
  for (int i = 0; i < driverCount; i++) {
    double dist = haversine(bakeryLat, bakeryLng,
                            driverLats[i], driverLngs[i]);
    double score = driverScores[i] / (dist + 100);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx;
}

} // extern "C"
