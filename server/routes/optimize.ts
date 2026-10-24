import { Router, Request, Response } from 'express';
import { getDb, queryAll, executeRun } from '../db.ts';
import { getHaversineDistanceKm, calculateTotalDistanceKm, optimizeNearestNeighbor } from '../utils/geo.ts';

export const optimizeRouter = Router();

// Optimize itinerary route based on time and distance
optimizeRouter.post('/trips/:id/optimize', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { day_id } = req.body;

    if (!day_id) {
      return res.status(400).json({ error: 'day_id diperlukan untuk optimasi rute per hari.' });
    }

    const db = await getDb();
    const destinations = queryAll(
      db,
      'SELECT * FROM destinations WHERE day_id = ? ORDER BY visit_order ASC',
      [day_id]
    );

    if (destinations.length <= 1) {
      return res.json({
        message: 'Destinasi sudah optimal (minimal 2 destinasi untuk optimasi rute).',
        destinations,
        distanceSavedKm: 0,
      });
    }

    // Initial total distance
    const initialDistanceKm = calculateTotalDistanceKm(destinations as any);

    // Nearest Neighbor TSP optimization
    const optimized = optimizeNearestNeighbor(destinations as any);

    // Optimized total distance
    const optimizedDistanceKm = calculateTotalDistanceKm(optimized);

    // Readjust visit times chronologically starting at 09:00 with ~1.5h spend per spot + transit
    let currentHour = 9;
    let currentMinute = 0;

    for (let i = 0; i < optimized.length; i++) {
      const startStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      let endHour = currentHour + 1;
      let endMinute = currentMinute + 30;
      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }
      const endStr = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

      optimized[i].visit_order = i + 1;
      optimized[i].time_start = startStr;
      optimized[i].time_end = endStr;

      executeRun(
        db,
        'UPDATE destinations SET visit_order = ?, time_start = ?, time_end = ? WHERE id = ?',
        [i + 1, startStr, endStr, optimized[i].id]
      );

      // Add transit time (30 mins) for next stop
      currentHour = endHour;
      currentMinute = endMinute + 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
    }

    const savedKm = Math.max(0, Number((initialDistanceKm - optimizedDistanceKm).toFixed(2)));
    const percentSavings = initialDistanceKm > 0 ? Math.round((savedKm / initialDistanceKm) * 100) : 0;

    return res.json({
      message: `Rute berhasil diurutkan! Menghemat ${savedKm} km perjalanan (${percentSavings}% lebih efisien).`,
      destinations: optimized,
      initialDistanceKm,
      optimizedDistanceKm,
      distanceSavedKm: savedKm,
      percentSavings,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
