import { describe, it, expect } from 'bun:test';
import { getDb, queryAll, queryOne } from '../../server/db.ts';

describe('Backend SQLite Database Engine', () => {
  it('initializes database and creates core tables', async () => {
    const db = await getDb();
    expect(db).toBeDefined();

    const tables = queryAll(db, "SELECT name FROM sqlite_master WHERE type='table';");
    const tableNames = tables.map((t: any) => t.name);

    expect(tableNames).toContain('users');
    expect(tableNames).toContain('trips');
    expect(tableNames).toContain('trip_days');
    expect(tableNames).toContain('destinations');
    expect(tableNames).toContain('trip_companions');
  });

  it('contains seeded initial users', async () => {
    const db = await getDb();
    const users = queryAll(db, 'SELECT id, email, name FROM users;');
    expect(users.length).toBeGreaterThanOrEqual(4);

    const sarah = queryOne(db, "SELECT * FROM users WHERE id = 'usr_sarah';");
    expect(sarah).toBeDefined();
    expect((sarah as any).name).toBe('Sarah Jenkins');
    expect((sarah as any).email).toBe('sarah@roamplan.app');
  });

  it('contains seeded itineraries with days and destinations', async () => {
    const db = await getDb();
    const tokyoTrip = queryOne(db, "SELECT * FROM trips WHERE id = 'trip_tokyo';");
    expect(tokyoTrip).toBeDefined();
    expect((tokyoTrip as any).destination_name).toBe('Tokyo, Jepang');

    const days = queryAll(db, "SELECT * FROM trip_days WHERE trip_id = 'trip_tokyo';");
    expect(days.length).toBe(3);

    const destinations = queryAll(db, "SELECT * FROM destinations WHERE trip_id = 'trip_tokyo';");
    expect(destinations.length).toBeGreaterThan(5);
  });
});
