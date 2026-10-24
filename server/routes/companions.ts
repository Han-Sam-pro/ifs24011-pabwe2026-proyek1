import { Router, Request, Response } from 'express';
import { getDb, queryAll, queryOne, executeRun } from '../db.ts';

export const companionsRouter = Router();

// Add Companion to Trip
companionsRouter.post('/trips/:id/companions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { emailOrUsername, role } = req.body;

    if (!emailOrUsername) {
      return res.status(400).json({ error: 'Email atau nama pengguna teman wajib diisi.' });
    }

    const db = await getDb();
    const query = emailOrUsername.trim().toLowerCase();
    const targetUser = queryOne(
      db,
      'SELECT id, name, email, avatar FROM users WHERE LOWER(email) = ? OR LOWER(name) LIKE ?',
      [query, `%${query}%`]
    );

    if (!targetUser) {
      return res.status(404).json({ error: 'Pengguna dengan email/nama tersebut belum terdaftar di RoamPlan.' });
    }

    const companionUserId = (targetUser as any).id;
    const trip = queryOne(db, 'SELECT user_id FROM trips WHERE id = ?', [id]);
    if ((trip as any)?.user_id === companionUserId) {
      return res.status(400).json({ error: 'Pemilik rencana tidak dapat ditambahkan sebagai teman seperjalanan.' });
    }

    const existing = queryOne(db, 'SELECT id FROM trip_companions WHERE trip_id = ? AND user_id = ?', [id, companionUserId]);
    if (existing) {
      return res.status(409).json({ error: 'Teman ini sudah tergabung dalam rencana perjalanan ini.' });
    }

    const compId = `comp_${Date.now()}`;
    const now = new Date().toISOString();

    executeRun(
      db,
      'INSERT INTO trip_companions (id, trip_id, user_id, role, added_at) VALUES (?, ?, ?, ?, ?)',
      [compId, id, companionUserId, role || 'editor', now]
    );

    return res.status(201).json({
      message: `${(targetUser as any).name} berhasil diundang sebagai teman seperjalanan!`,
      companion: {
        id: compId,
        user_id: companionUserId,
        name: (targetUser as any).name,
        email: (targetUser as any).email,
        avatar: (targetUser as any).avatar,
        role: role || 'editor',
        added_at: now,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Remove Companion
companionsRouter.delete('/trips/:id/companions/:companionId', async (req: Request, res: Response) => {
  try {
    const { companionId } = req.params;
    const db = await getDb();
    executeRun(db, 'DELETE FROM trip_companions WHERE id = ?', [companionId]);
    return res.json({ message: 'Teman seperjalanan berhasil dihapus.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get Trip by Share Code (for companion sharing link)
companionsRouter.get('/share/:shareCode', async (req: Request, res: Response) => {
  try {
    const { shareCode } = req.params;
    const db = await getDb();

    const trip = queryOne(
      db,
      `SELECT t.*, u.name as owner_name, u.avatar as owner_avatar, u.home_city as owner_city
       FROM trips t
       JOIN users u ON t.user_id = u.id
       WHERE t.share_code = ?`,
      [shareCode.toUpperCase()]
    );

    if (!trip) {
      return res.status(404).json({ error: 'Kode rencana perjalanan tidak valid atau telah kedaluwarsa.' });
    }

    const tripId = (trip as any).id;
    const days = queryAll(db, 'SELECT * FROM trip_days WHERE trip_id = ? ORDER BY day_number ASC', [tripId]);
    const destinations = queryAll(db, 'SELECT * FROM destinations WHERE trip_id = ? ORDER BY visit_order ASC', [tripId]);
    const companions = queryAll(
      db,
      `SELECT tc.id, tc.role, u.name, u.avatar
       FROM trip_companions tc
       JOIN users u ON tc.user_id = u.id
       WHERE tc.trip_id = ?`,
      [tripId]
    );

    return res.json({ trip, days, destinations, companions });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
