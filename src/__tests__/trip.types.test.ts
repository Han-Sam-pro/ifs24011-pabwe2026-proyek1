import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  Destination,
  DestinationCategory,
  DayPlan,
  TripPlan,
  RouteSegment,
  DayRouteStats,
} from '../types/trip';
import * as tripTypes from '../types/trip';

describe('Trip type contracts (src/types/trip.ts)', () => {
  it('is a type-only module that exports no runtime values', () => {
    expect(Object.keys(tripTypes)).toEqual([]);
  });

  it('restricts destination categories to the supported set', () => {
    expectTypeOf<DestinationCategory>().toEqualTypeOf<
      'sightseeing' | 'culinary' | 'hotel' | 'shopping' | 'transit' | 'nature'
    >();
  });

  it('restricts trip currency to IDR, USD, EUR, SGD, MYR and JPY', () => {
    expectTypeOf<TripPlan['currency']>().toEqualTypeOf<
      'IDR' | 'USD' | 'EUR' | 'SGD' | 'MYR' | 'JPY'
    >();
  });

  it('accepts a fully populated trip structure with optional fields omitted', () => {
    const destination: Destination = {
      id: 'd1',
      title: 'Keraton Yogyakarta',
      category: 'sightseeing',
      startTime: '09:00',
      durationMinutes: 90,
      cost: 50000,
      lat: -7.8052,
      lng: 110.3642,
    };
    const day: DayPlan = {
      id: 'day1',
      dayNumber: 1,
      date: '2026-11-10',
      destinations: [destination],
    };
    const trip: TripPlan = {
      id: 't1',
      title: 'Jogja Trip',
      destinationCity: 'Yogyakarta',
      startDate: '2026-11-10',
      endDate: '2026-11-12',
      currency: 'IDR',
      totalBudget: 4500000,
      days: [day],
    };

    expect(trip.days[0].destinations[0].title).toBe('Keraton Yogyakarta');
    expect(destination.address).toBeUndefined();
    expect(day.themeTitle).toBeUndefined();
  });

  it('describes route segments and day route stats', () => {
    const segment: RouteSegment = {
      fromId: 'a',
      toId: 'b',
      fromTitle: 'Keraton',
      toTitle: 'Malioboro',
      distanceKm: 2.4,
      estimatedMinutes: 12,
    };
    const stats: DayRouteStats = {
      totalDistanceKm: 2.4,
      totalTravelMinutes: 12,
      segments: [segment],
    };

    expect(stats.segments).toHaveLength(1);
    expectTypeOf(stats.segments[0]).toEqualTypeOf<RouteSegment>();
  });
});
