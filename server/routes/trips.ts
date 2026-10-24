import { Router, Request, Response } from 'express';
import { getDb, queryAll, queryOne, executeRun } from '../db.ts';

export const tripsRouter = Router();

// List trips
tripsRouter.get('/trips', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    const db = await getDb();

    const trips = queryAll(
      db,
      `SELECT t.*, u.name as owner_name, u.avatar as owner_avatar,
              (SELECT COUNT(*) FROM trip_days td WHERE td.trip_id = t.id) as total_days,
              (SELECT COUNT(*) FROM destinations d WHERE d.trip_id = t.id) as total_destinations,
              (SELECT COALESCE(SUM(d.estimated_cost), 0) FROM destinations d WHERE d.trip_id = t.id) as total_spent,
              (SELECT COUNT(*) FROM trip_companions tc WHERE tc.trip_id = t.id) as companion_count,
              EXISTS(SELECT 1 FROM trip_companions tc WHERE tc.trip_id = t.id AND tc.user_id = ?) as is_collaborator
       FROM trips t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`,
      [userId || '']
    );

    return res.json({ trips });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Create new Trip
tripsRouter.post('/trips', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.user_id || 'usr_sarah';
    const { title, destination_name, start_date, end_date, total_budget, currency, cover_image, is_public } = req.body;

    if (!title || !destination_name || !start_date || !end_date) {
      return res.status(400).json({ error: 'Judul, nama destinasi, tanggal mulai, dan tanggal selesai wajib diisi.' });
    }

    const db = await getDb();
    const tripId = `trip_${Date.now()}`;
    const shareCode = `${destination_name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'TRIP')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    executeRun(
      db,
      `INSERT INTO trips (id, user_id, title, destination_name, start_date, end_date, total_budget, currency, cover_image, is_public, share_code, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tripId,
        userId,
        title,
        destination_name,
        start_date,
        end_date,
        Number(total_budget) || 0,
        currency || 'IDR',
        cover_image || '/src/assets/images/hero_trip_planner_1792859921527.jpg',
        is_public !== undefined ? (is_public ? 1 : 0) : 1,
        shareCode,
        now,
      ]
    );

    // Generate days
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    for (let i = 0; i < Math.min(diffDays, 30); i++) {
      const curDate = new Date(start);
      curDate.setDate(start.getDate() + i);
      const dateStr = curDate.toISOString().split('T')[0];
      const dayId = `day_${tripId}_${i + 1}`;

      executeRun(
        db,
        'INSERT INTO trip_days (id, trip_id, day_number, date, title, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [dayId, tripId, i + 1, dateStr, `Hari ${i + 1}`, '']
      );
    }

    const trip = queryOne(db, 'SELECT * FROM trips WHERE id = ?', [tripId]);
    return res.status(201).json({ message: 'Rencana perjalanan berhasil dibuat.', trip });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get Trip by ID
tripsRouter.get('/trips/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const trip = queryOne(
      db,
      `SELECT t.*, u.name as owner_name, u.avatar as owner_avatar, u.email as owner_email
       FROM trips t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [id]
    );

    if (!trip) {
      return res.status(404).json({ error: 'Itinerary tidak ditemukan.' });
    }

    const days = queryAll(
      db,
      'SELECT * FROM trip_days WHERE trip_id = ? ORDER BY day_number ASC',
      [id]
    );

    const destinations = queryAll(
      db,
      'SELECT * FROM destinations WHERE trip_id = ? ORDER BY visit_order ASC',
      [id]
    );

    const companions = queryAll(
      db,
      `SELECT tc.id, tc.role, tc.added_at, u.id as user_id, u.name, u.email, u.avatar
       FROM trip_companions tc
       JOIN users u ON tc.user_id = u.id
       WHERE tc.trip_id = ?`,
      [id]
    );

    const totalSpent = destinations.reduce((sum, d: any) => sum + (Number(d.estimated_cost) || 0), 0);
    const categoryBreakdown: Record<string, number> = {};
    destinations.forEach((d: any) => {
      const cat = d.category || 'attraction';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (Number(d.estimated_cost) || 0);
    });

    return res.json({
      trip,
      days,
      destinations,
      companions,
      stats: {
        totalSpent,
        totalBudget: (trip as any).total_budget,
        remainingBudget: Math.max(0, (trip as any).total_budget - totalSpent),
        categoryBreakdown,
        totalDestinations: destinations.length,
        totalDays: days.length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update Trip
tripsRouter.put('/trips/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, destination_name, start_date, end_date, total_budget, currency, is_public, cover_image } = req.body;
    const db = await getDb();

    executeRun(
      db,
      `UPDATE trips
       SET title = COALESCE(?, title),
           destination_name = COALESCE(?, destination_name),
           start_date = COALESCE(?, start_date),
           end_date = COALESCE(?, end_date),
           total_budget = COALESCE(?, total_budget),
           currency = COALESCE(?, currency),
           is_public = COALESCE(?, is_public),
           cover_image = COALESCE(?, cover_image)
       WHERE id = ?`,
      [title, destination_name, start_date, end_date, total_budget, currency, is_public !== undefined ? (is_public ? 1 : 0) : null, cover_image, id]
    );

    return res.json({ message: 'Itinerary berhasil diperbarui.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete Trip
tripsRouter.delete('/trips/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    executeRun(db, 'DELETE FROM destinations WHERE trip_id = ?', [id]);
    executeRun(db, 'DELETE FROM trip_days WHERE trip_id = ?', [id]);
    executeRun(db, 'DELETE FROM trip_companions WHERE trip_id = ?', [id]);
    executeRun(db, 'DELETE FROM trips WHERE id = ?', [id]);

    return res.json({ message: 'Itinerary berhasil dihapus.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Days CRUD
tripsRouter.post('/trips/:id/days', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, title, notes } = req.body;
    const db = await getDb();

    const maxDay = queryOne(db, 'SELECT MAX(day_number) as max_day FROM trip_days WHERE trip_id = ?', [id]);
    const nextDayNum = ((maxDay as any)?.max_day || 0) + 1;
    const dayId = `day_${id}_${nextDayNum}_${Date.now()}`;

    executeRun(
      db,
      'INSERT INTO trip_days (id, trip_id, day_number, date, title, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [dayId, id, nextDayNum, date || new Date().toISOString().split('T')[0], title || `Hari ${nextDayNum}`, notes || '']
    );

    const newDay = queryOne(db, 'SELECT * FROM trip_days WHERE id = ?', [dayId]);
    return res.status(201).json({ message: 'Hari berhasil ditambahkan.', day: newDay });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

tripsRouter.delete('/trips/:id/days/:dayId', async (req: Request, res: Response) => {
  try {
    const { dayId } = req.params;
    const db = await getDb();

    executeRun(db, 'DELETE FROM destinations WHERE day_id = ?', [dayId]);
    executeRun(db, 'DELETE FROM trip_days WHERE id = ?', [dayId]);

    return res.json({ message: 'Hari berhasil dihapus.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Destinations CRUD
tripsRouter.post('/trips/:id/destinations', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { day_id, name, address, lat, lng, time_start, time_end, estimated_cost, category, notes } = req.body;

    if (!day_id || !name || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Nama tempat, koordinat latitude, dan longitude wajib diisi.' });
    }

    const db = await getDb();
    const maxOrder = queryOne(db, 'SELECT MAX(visit_order) as max_order FROM destinations WHERE day_id = ?', [day_id]);
    const nextOrder = ((maxOrder as any)?.max_order || 0) + 1;
    const destId = `dest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    executeRun(
      db,
      `INSERT INTO destinations (id, day_id, trip_id, name, address, lat, lng, time_start, time_end, estimated_cost, category, visit_order, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        destId,
        day_id,
        id,
        name.trim(),
        address || '',
        Number(lat),
        Number(lng),
        time_start || '10:00',
        time_end || '12:00',
        Number(estimated_cost) || 0,
        category || 'attraction',
        nextOrder,
        notes || '',
      ]
    );

    const destination = queryOne(db, 'SELECT * FROM destinations WHERE id = ?', [destId]);
    return res.status(201).json({ message: 'Destinasi berhasil ditambahkan ke peta dan jadwal.', destination });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

tripsRouter.put('/trips/:id/destinations/:destId', async (req: Request, res: Response) => {
  try {
    const { destId } = req.params;
    const { name, address, lat, lng, time_start, time_end, estimated_cost, category, visit_order, notes } = req.body;
    const db = await getDb();

    executeRun(
      db,
      `UPDATE destinations
       SET name = COALESCE(?, name),
           address = COALESCE(?, address),
           lat = COALESCE(?, lat),
           lng = COALESCE(?, lng),
           time_start = COALESCE(?, time_start),
           time_end = COALESCE(?, time_end),
           estimated_cost = COALESCE(?, estimated_cost),
           category = COALESCE(?, category),
           visit_order = COALESCE(?, visit_order),
           notes = COALESCE(?, notes)
       WHERE id = ?`,
      [name, address, lat, lng, time_start, time_end, estimated_cost, category, visit_order, notes, destId]
    );

    const destination = queryOne(db, 'SELECT * FROM destinations WHERE id = ?', [destId]);
    return res.json({ message: 'Destinasi berhasil diperbarui.', destination });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

tripsRouter.delete('/trips/:id/destinations/:destId', async (req: Request, res: Response) => {
  try {
    const { destId } = req.params;
    const db = await getDb();
    executeRun(db, 'DELETE FROM destinations WHERE id = ?', [destId]);
    return res.json({ message: 'Destinasi berhasil dihapus.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
