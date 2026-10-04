import { CityId } from '../types';
import { CITIES } from '../data/cities';
import { calculateHaversineDistanceKm } from './routeOptimizer';

export type CoordinatePair = [number, number]; // [lat, lng]

/**
 * Initial municipal polygon boundary for Noorabad Mamasani.
 * Covers downtown, Kuye Golestan, Eskan, Farhangshahr, Farmandari, etc.
 */
export const DEFAULT_NOORABAD_POLYGON: CoordinatePair[] = [
  [30.1320, 51.5120], // North-West (بلوار خلیج فارس)
  [30.1340, 51.5280], // North (کوی دانشگاه و بیمارستان ولیعصر)
  [30.1280, 51.5420], // North-East (شهرک اسکان و دادگستری)
  [30.1160, 51.5460], // East (انتهای بلوار امام خمینی شرق)
  [30.1020, 51.5360], // South-East (پلیس راه و ورودی شیراز)
  [30.0980, 51.5180], // South (کوی فرهنگیان فاز ۲)
  [30.1040, 51.5020], // South-West (روبروی ترمینال و باغات)
  [30.1180, 51.5040], // West (میدان امام و باقرآباد)
  [30.1280, 51.5080]  // West-North connection
];

/**
 * Initial municipal polygon boundary for Kazeroon.
 * Covers Shohada, Salman Farsi, Artesh, Pardis, Natanz, etc.
 */
export const DEFAULT_KAZEROON_POLYGON: CoordinatePair[] = [
  [29.6380, 51.6420], // North (تنگ چوگان / ورودی شمالی دانشگاه پیام نور)
  [29.6420, 51.6620], // North-East (شهرک پردیس و دانشگاه آزاد)
  [29.6310, 51.6780], // East (بلوار ارتش و بیمارستان ولیعصر)
  [29.6140, 51.6840], // East-South (خیابان نطنج و نطنج بالا)
  [29.5980, 51.6710], // South-East (میدان امام حسین و کوی علیا)
  [29.5940, 51.6520], // South (شهرک انتظام و میدان بعثت)
  [29.6020, 51.6340], // South-West (خیابان قدمگاه و باغات غربی)
  [29.6180, 51.6310], // West (میدان فلسطین و کوی مصلی)
  [29.6320, 51.6360]  // North-West
];

const STORAGE_KEY_PREFIX = 'pakino_geofence_polygon_';

/**
 * Load polygon from storage or default
 */
export function getCityPolygon(cityId: CityId): CoordinatePair[] {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${cityId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed;
      }
    }
  } catch {}

  return cityId === 'kazeroon' ? DEFAULT_KAZEROON_POLYGON : DEFAULT_NOORABAD_POLYGON;
}

/**
 * Save custom polygon edited by manager
 */
export function saveCityPolygon(cityId: CityId, polygon: CoordinatePair[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${cityId}`, JSON.stringify(polygon));
  } catch {}
}

/**
 * Reset polygon to official default
 */
export function resetCityPolygon(cityId: CityId): CoordinatePair[] {
  const def = cityId === 'kazeroon' ? DEFAULT_KAZEROON_POLYGON : DEFAULT_NOORABAD_POLYGON;
  saveCityPolygon(cityId, def);
  return def;
}

/**
 * Ray-Casting Algorithm for Point-in-Polygon (PIP)
 * Determines if [lat, lng] is inside a polygon defined by coordinate pairs.
 */
export function isPointInPolygon(point: CoordinatePair, polygon: CoordinatePair[]): boolean {
  if (!polygon || polygon.length < 3) return false;

  const [lat, lng] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    // Check if ray crosses the line segment (xi, yi) -> (xj, yj)
    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Boundary checker using the polygon geofence
 */
export function checkInsideCityPolygon(
  cityId: CityId,
  lat: number,
  lng: number
): {
  isInside: boolean;
  distanceToCenterKm: number;
  polygon: CoordinatePair[];
} {
  const city = CITIES[cityId] || CITIES.noorabad;
  const polygon = getCityPolygon(cityId);
  const isInside = isPointInPolygon([lat, lng], polygon);
  const distanceToCenterKm = Math.round(
    calculateHaversineDistanceKm(lat, lng, city.center.lat, city.center.lng) * 10
  ) / 10;

  return {
    isInside,
    distanceToCenterKm,
    polygon
  };
}
