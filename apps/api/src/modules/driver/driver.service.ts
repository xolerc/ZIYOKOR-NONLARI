import { Injectable, NotFoundException } from '@nestjs/common';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  isAvailable: boolean;
  vehicleType: string;
}

const drivers: Driver[] = [
  { id: 'driver-1', name: 'Akmal Karimov', phone: '+998901112233', lat: 41.2995, lng: 69.2401, isAvailable: true, vehicleType: 'motorbike' },
  { id: 'driver-2', name: 'Botirjon Rahimov', phone: '+998902223344', lat: 41.3115, lng: 69.2797, isAvailable: true, vehicleType: 'car' },
  { id: 'driver-3', name: 'Dilmurod Sattorov', phone: '+998903334455', lat: 41.2895, lng: 69.2897, isAvailable: false, vehicleType: 'motorbike' },
  { id: 'driver-4', name: 'Eldor Toshmatov', phone: '+998904445566', lat: 41.3315, lng: 69.2101, isAvailable: true, vehicleType: 'bicycle' },
  { id: 'driver-5', name: 'Farruh Iskandarov', phone: '+998905556677', lat: 41.2695, lng: 69.2601, isAvailable: true, vehicleType: 'car' },
];

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

@Injectable()
export class DriverService {
  findAll(): Driver[] {
    return drivers;
  }

  findNearby(lat: number, lng: number, radius: number): Driver[] {
    return drivers.filter((d) => {
      const distance = haversineDistance(lat, lng, d.lat, d.lng);
      return distance <= radius && d.isAvailable;
    });
  }

  updateLocation(id: string, lat: number, lng: number): Driver {
    const driver = drivers.find((d) => d.id === id);
    if (!driver) {
      throw new NotFoundException(`Driver with id ${id} not found`);
    }
    driver.lat = lat;
    driver.lng = lng;
    return driver;
  }
}
