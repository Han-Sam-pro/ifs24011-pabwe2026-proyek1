import { Router, Request, Response } from 'express';
import { getDb, queryAll, queryOne, executeRun } from '../db.ts';

export const usersRouter = Router();

// List all users
usersRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const users = queryAll(
      db,
      `SELECT u.id, u.name, u.email, u.avatar, u.bio, u.home_city, u.created_at,
              (SELECT COUNT(*) FROM trips t WHERE t.user_id = u.id) as trip_count,
              (SELECT COUNT(*) FROM trip_companions tc WHERE tc.user_id = u.id) as shared_count
       FROM users u
       ORDER BY u.created_at DESC`
    );
    return res.json({ users });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get single user profile with their public trips
usersRouter.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const user = queryOne(
      db,
      `SELECT id, name, email, avatar, bio, home_city, created_at FROM users WHERE id = ?`,
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }

    const trips = queryAll(
      db,
      `SELECT t.*,
              (SELECT COUNT(*) FROM trip_days td WHERE td.trip_id = t.id) as total_days,
              (SELECT COUNT(*) FROM destinations d WHERE d.trip_id = t.id) as total_destinations,
              (SELECT COALESCE(SUM(d.estimated_cost), 0) FROM destinations d WHERE d.trip_id = t.id) as total_spent
       FROM trips t
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [req.params.id]
    );

    return res.json({ user, trips });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update profile
usersRouter.put('/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.id;
    const { name, bio, home_city, avatar } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User ID diperlukan.' });
    }

    const db = await getDb();
    executeRun(
      db,
      'UPDATE users SET name = COALESCE(?, name), bio = COALESCE(?, bio), home_city = COALESCE(?, home_city), avatar = COALESCE(?, avatar) WHERE id = ?',
      [name, bio, home_city, avatar, userId]
    );

    const updatedUser = queryOne(
      db,
      'SELECT id, name, email, avatar, bio, home_city, created_at FROM users WHERE id = ?',
      [userId]
    );
    return res.json({ message: 'Profil berhasil diperbarui.', user: updatedUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
