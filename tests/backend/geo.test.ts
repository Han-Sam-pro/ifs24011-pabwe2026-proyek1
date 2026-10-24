import { describe, it, expect } from 'bun:test';
import { getHaversineDistanceKm, calculateTotalDistanceKm, optimizeNearestNeighbor } from '../../server/utils/geo.ts';

describe('Backend Geo Utilities & Route Optimization', () => {
  it('calculates accurate Haversine distance between Tokyo and Shibuya', () => {
    // Tokyo Station: 35.6812, 139.7671
    // Shibuya Station: 35.6580, 139.7016
    const dist = getHaversineDistanceKm(35.6812, 139.7671, 35.6580, 139.7016);
    expect(dist).toBeGreaterThan(6);
    expect(dist).toBeLessThan(8);
  });

  it('calculates zero distance for identical coordinates', () => {
    const dist = getHaversineDistanceKm(-8.5188, 115.2587, -8.5188, 115.2587);
    expect(dist).toBe(0);
  });

  it('computes total distance along a multi-stop path', () => {
    const points = [
      { lat: 35.7148, lng: 139.7967 }, // Senso-ji
      { lat: 35.7100, lng: 139.8107 }, // Skytree (~1.4km)
      { lat: 35.7140, lng: 139.7741 }, // Ueno (~3.4km)
    ];
    const totalDist = calculateTotalDistanceKm(points);
    expect(totalDist).toBeGreaterThan(4);
    expect(totalDist).toBeLessThan(6);
  });

  it('optimizes visit order using nearest neighbor heuristic', () => {
    // Deliberately zig-zagged spots
    const spots = [
      { id: '1', lat: 35.7148, lng: 139.7967 }, // Asakusa
      { id: '2', lat: 35.6595, lng: 139.7005 }, // Shibuya (Far away)
      { id: '3', lat: 35.7100, lng: 139.8107 }, // Skytree (Near Asakusa)
    ];

    const initialDist = calculateTotalDistanceKm(spots);
    const optimized = optimizeNearestNeighbor(spots);
    const optimizedDist = calculateTotalDistanceKm(optimized);

    expect(optimized[0].id).toBe('1');
    expect(optimized[1].id).toBe('3'); // Skytree should come next!
    expect(optimized[2].id).toBe('2'); // Shibuya should come last!
    expect(optimizedDist).toBeLessThan(initialDist);
  });
});
