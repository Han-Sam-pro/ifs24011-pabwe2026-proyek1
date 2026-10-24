import { Router, Request, Response } from 'express';
import { getDb, queryOne, executeRun } from '../db.ts';

export const authRouter = Router();

// Register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, home_city, bio } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan kata sandi wajib diisi.' });
    }

    const db = await getDb();
    const existing = queryOne(db, 'SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(409).json({ error: 'Email sudah terdaftar. Silakan login.' });
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    executeRun(
      db,
      'INSERT INTO users (id, name, email, password, avatar, bio, home_city, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        name.trim(),
        email.toLowerCase().trim(),
        password,
        '',
        bio || 'Travel enthusiast exploring the world with RoamPlan.',
        home_city || 'Jakarta, Indonesia',
        now,
      ]
    );

    const user = queryOne(
      db,
      'SELECT id, name, email, avatar, bio, home_city, created_at FROM users WHERE id = ?',
      [id]
    );
    return res.status(201).json({ message: 'Pendaftaran berhasil.', user });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message || 'Gagal mendaftarkan pengguna.' });
  }
});

// Login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
    }

    const db = await getDb();
    const user = queryOne(
      db,
      'SELECT id, name, email, avatar, bio, home_city, created_at, password FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!user || (user as any).password !== password) {
      return res.status(401).json({ error: 'Email atau kata sandi tidak sesuai.' });
    }

    const { password: _, ...safeUser } = user as any;
    return res.json({ message: 'Login berhasil.', user: safeUser });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Gagal memproses login.' });
  }
});

// Get current user session
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    const db = await getDb();
    if (!userId) {
      const defaultUser = queryOne(db, 'SELECT id, name, email, avatar, bio, home_city, created_at FROM users LIMIT 1');
      return res.json({ user: defaultUser });
    }

    const user = queryOne(db, 'SELECT id, name, email, avatar, bio, home_city, created_at FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }
    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
