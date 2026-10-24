// Helper functions for geospatial calculations and TSP route optimization

export function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(4));
}

export function calculateTotalDistanceKm(points: Array<{ lat: number; lng: number }>): number {
  if (points.length <= 1) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += getHaversineDistanceKm(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
  }
  return Number(total.toFixed(2));
}

export function optimizeNearestNeighbor<T extends { lat: number; lng: number }>(items: T[]): T[] {
  if (items.length <= 2) return [...items];

  const unvisited = [...items];
  const route: T[] = [];

  // Start with the first spot as fixed morning origin
  const start = unvisited.shift()!;
  route.push(start);

  while (unvisited.length > 0) {
    const current = route[route.length - 1];
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = getHaversineDistanceKm(current.lat, current.lng, unvisited[i].lat, unvisited[i].lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    route.push(unvisited.splice(nearestIdx, 1)[0]);
  }

  return route;
}
