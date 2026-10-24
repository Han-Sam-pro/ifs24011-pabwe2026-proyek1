/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { optimizeDayRoute } from '../utils/geo';
import { encodeTripToUrl, decodeTripFromUrl } from '../utils/share';
import { PRESET_TRIPS } from '../data/presetTrips';

describe('Geo & Share Utils', () => {
  it('optimizes day route destinations', () => {
    const dests = PRESET_TRIPS[0].days[0].destinations;
    const { optimizedDestinations, distanceSavedKm } = optimizeDayRoute(dests);
    expect(Array.isArray(optimizedDestinations)).toBe(true);
    expect(typeof distanceSavedKm).toBe('number');
  });

  it('encodes and decodes trip for sharing', () => {
    const trip = PRESET_TRIPS[0];
    const encoded = encodeTripToUrl(trip);
    expect(typeof encoded).toBe('string');
    const decoded = decodeTripFromUrl(encoded);
    expect(decoded).toEqual(trip);
  });
});
