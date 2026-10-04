import { PickupRequest } from '../types';

/**
 * Calculates Haversine distance in kilometers between two lat/lng points.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface OptimizedStop {
  request: PickupRequest;
  stopSequence: number; // 1, 2, 3...
  distanceFromPreviousKm: number;
}

export interface RouteOptimizationResult {
  orderedRequests: PickupRequest[];
  stops: OptimizedStop[];
  totalDistanceKm: number;
}

/**
 * Nearest Neighbor + 2-opt Heuristic for Traveling Salesperson Problem (TSP)
 * Minimizes total driver transit distance without back-and-forth crisscrossing.
 * Starts from driver current location (startLocation).
 */
export function optimizeDriverRoute(
  startLocation: { lat: number; lng: number },
  requests: PickupRequest[]
): RouteOptimizationResult {
  if (!requests || requests.length === 0) {
    return { orderedRequests: [], stops: [], totalDistanceKm: 0 };
  }

  if (requests.length === 1) {
    const d = calculateHaversineDistanceKm(
      startLocation.lat,
      startLocation.lng,
      requests[0].address.lat,
      requests[0].address.lng
    );
    return {
      orderedRequests: [requests[0]],
      stops: [
        {
          request: requests[0],
          stopSequence: 1,
          distanceFromPreviousKm: Math.round(d * 10) / 10
        }
      ],
      totalDistanceKm: Math.round(d * 10) / 10
    };
  }

  // --- Step 1: Nearest Neighbor Heuristic ---
  const unvisited = [...requests];
  const tour: PickupRequest[] = [];
  let currentLocation = { ...startLocation };

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateHaversineDistanceKm(
        currentLocation.lat,
        currentLocation.lng,
        unvisited[i].address.lat,
        unvisited[i].address.lng
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const nextStop = unvisited.splice(nearestIndex, 1)[0];
    tour.push(nextStop);
    currentLocation = { lat: nextStop.address.lat, lng: nextStop.address.lng };
  }

  // --- Step 2: 2-opt Improvement (Untangling Crossings) ---
  let improved = true;
  let iterations = 0;
  const maxIterations = 50;

  const calculateTourDistance = (route: PickupRequest[]): number => {
    if (route.length === 0) return 0;
    let sum = calculateHaversineDistanceKm(
      startLocation.lat,
      startLocation.lng,
      route[0].address.lat,
      route[0].address.lng
    );
    for (let i = 0; i < route.length - 1; i++) {
      sum += calculateHaversineDistanceKm(
        route[i].address.lat,
        route[i].address.lng,
        route[i + 1].address.lat,
        route[i + 1].address.lng
      );
    }
    return sum;
  };

  let bestTour = [...tour];
  let bestDistance = calculateTourDistance(bestTour);

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < bestTour.length - 1; i++) {
      for (let k = i + 1; k < bestTour.length; k++) {
        // 2-opt swap: reverse segment between i and k
        const newTour: PickupRequest[] = [
          ...bestTour.slice(0, i),
          ...bestTour.slice(i, k + 1).reverse(),
          ...bestTour.slice(k + 1)
        ];

        const newDistance = calculateTourDistance(newTour);
        // Small threshold to avoid micro-float oscillations
        if (newDistance < bestDistance - 0.001) {
          bestTour = newTour;
          bestDistance = newDistance;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  // Build final stops with sequential numbering
  const stops: OptimizedStop[] = [];
  let prevPos = startLocation;
  let totalDist = 0;

  bestTour.forEach((req, idx) => {
    const dist = calculateHaversineDistanceKm(
      prevPos.lat,
      prevPos.lng,
      req.address.lat,
      req.address.lng
    );
    totalDist += dist;
    stops.push({
      request: req,
      stopSequence: idx + 1,
      distanceFromPreviousKm: Math.round(dist * 10) / 10
    });
    prevPos = { lat: req.address.lat, lng: req.address.lng };
  });

  return {
    orderedRequests: bestTour,
    stops,
    totalDistanceKm: Math.round(totalDist * 10) / 10
  };
}
