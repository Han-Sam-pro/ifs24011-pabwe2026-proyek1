import initSqlJs, { Database } from 'sql.js';
import fs from 'node:fs';
import path from 'node:path';

const DB_FILE = path.resolve(process.cwd(), 'roamplan.sqlite');

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      return dbInstance;
    } catch (err) {
      console.warn('Could not read existing SQLite file, creating fresh DB:', err);
    }
  }

  dbInstance = new SQL.Database();
  initializeSchema(dbInstance);
  saveDb(dbInstance);
  return dbInstance;
}

export function saveDb(db: Database) {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to persist SQLite DB to file:', err);
  }
}

function initializeSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      home_city TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      destination_name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      total_budget REAL DEFAULT 0,
      currency TEXT DEFAULT 'IDR',
      cover_image TEXT,
      is_public INTEGER DEFAULT 1,
      share_code TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS trip_days (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      day_number INTEGER NOT NULL,
      date TEXT NOT NULL,
      title TEXT,
      notes TEXT,
      FOREIGN KEY (trip_id) REFERENCES trips(id)
    );

    CREATE TABLE IF NOT EXISTS destinations (
      id TEXT PRIMARY KEY,
      day_id TEXT NOT NULL,
      trip_id TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      time_start TEXT,
      time_end TEXT,
      estimated_cost REAL DEFAULT 0,
      category TEXT DEFAULT 'attraction',
      visit_order INTEGER NOT NULL,
      notes TEXT,
      FOREIGN KEY (day_id) REFERENCES trip_days(id),
      FOREIGN KEY (trip_id) REFERENCES trips(id)
    );

    CREATE TABLE IF NOT EXISTS trip_companions (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT DEFAULT 'viewer',
      added_at TEXT NOT NULL,
      FOREIGN KEY (trip_id) REFERENCES trips(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Seed sample data
  seedInitialData(db);
}

function seedInitialData(db: Database) {
  // Check if users exist
  const res = db.exec("SELECT count(*) as count FROM users;");
  const count = res[0]?.values[0]?.[0] as number;
  if (count > 0) return;

  const now = new Date().toISOString();

  // Seed Users
  db.run(`
    INSERT INTO users (id, name, email, password, avatar, bio, home_city, created_at) VALUES
    ('usr_sarah', 'Sarah Jenkins', 'sarah@roamplan.app', 'pass123', '/src/assets/images/avatar_traveler_sarah_1792859921688.jpg', 'Fotografer perjalanan & penikmat budaya lokal. Suka menjelajahi lorong tersembunyi dan kuliner otentik.', 'Jakarta, Indonesia', '${now}'),
    ('usr_alex', 'Alex Rivera', 'alex@roamplan.app', 'pass123', '/src/assets/images/avatar_traveler_alex_1792859921669.jpg', 'Backpacker petualang, hiking enthusiast, dan spesialis rute hemat waktu.', 'Bandung, Indonesia', '${now}'),
    ('usr_galon', 'Galon Samosir', 'galonsamosir1976@gmail.com', 'pass123', '', 'Travel curator & trip architect. Fokus pada warisan dunia dan keindahan alam.', 'Medan, Indonesia', '${now}'),
    ('usr_maya', 'Maya Prameswari', 'maya@roamplan.app', 'pass123', '', 'Penulis travel blog dan pemburu kafe estetik di Asia Tenggara.', 'Surabaya, Indonesia', '${now}');
  `);

  // Seed Trip 1: Tokyo & Kyoto Explorer
  db.run(`
    INSERT INTO trips (id, user_id, title, destination_name, start_date, end_date, total_budget, currency, cover_image, is_public, share_code, created_at) VALUES
    ('trip_tokyo', 'usr_sarah', 'Tokyo Urban & Cultural Heritage', 'Tokyo, Jepang', '2026-11-10', '2026-11-14', 28500000, 'IDR', '/src/assets/images/trip_cover_tokyo_1792859921427.jpg', 1, 'TOKYO-2026-ROAM', '${now}'),
    ('trip_bali', 'usr_alex', 'Bali Tropical & Temple Journey', 'Bali, Indonesia', '2026-12-05', '2026-12-08', 9500000, 'IDR', '/src/assets/images/trip_cover_bali_1792859921485.jpg', 1, 'BALI-SERENITY-26', '${now}');
  `);

  // Seed Companions
  db.run(`
    INSERT INTO trip_companions (id, trip_id, user_id, role, added_at) VALUES
    ('comp_1', 'trip_tokyo', 'usr_alex', 'editor', '${now}'),
    ('comp_2', 'trip_tokyo', 'usr_galon', 'viewer', '${now}'),
    ('comp_3', 'trip_bali', 'usr_sarah', 'editor', '${now}');
  `);

  // Seed Trip 1 Days
  db.run(`
    INSERT INTO trip_days (id, trip_id, day_number, date, title, notes) VALUES
    ('day_tokyo_1', 'trip_tokyo', 1, '2026-11-10', 'Asakusa & Skytree Area', 'Eksplorasi kuil tertua dan panorama kota dari ketinggian'),
    ('day_tokyo_2', 'trip_tokyo', 2, '2026-11-11', 'Shibuya & Harajuku Vibe', 'Pusat tren, Shibuya Crossing, Meiji Shrine & kafe kucing'),
    ('day_tokyo_3', 'trip_tokyo', 3, '2026-11-12', 'Akihabara & Ginza Elegance', 'Surga pop culture, belanja suvenir, dan fine dining');
  `);

  // Seed Trip 1 Destinations
  db.run(`
    INSERT INTO destinations (id, day_id, trip_id, name, address, lat, lng, time_start, time_end, estimated_cost, category, visit_order, notes) VALUES
    ('dest_t1', 'day_tokyo_1', 'trip_tokyo', 'Kuil Senso-ji', '2 Chome-3-1 Asakusa, Taito City, Tokyo', 35.7148, 139.7967, '08:30', '10:30', 150000, 'attraction', 1, 'Mencoba ramalan omikuji dan belanja dango di Nakamise Street'),
    ('dest_t2', 'day_tokyo_1', 'trip_tokyo', 'Tokyo Skytree', '1 Chome-1-2 Oshiage, Sumida City, Tokyo', 35.7100, 139.8107, '11:00', '13:00', 420000, 'attraction', 2, 'Melihat panorama Gunung Fuji dari dek observasi 350m'),
    ('dest_t3', 'day_tokyo_1', 'trip_tokyo', 'Ueno Onshi Park & Museum', 'Uenokoen, Taito City, Tokyo', 35.7140, 139.7741, '14:00', '16:30', 200000, 'attraction', 3, 'Jalan santai di sekitar kolam teratai Shinobazu'),
    ('dest_t4', 'day_tokyo_1', 'trip_tokyo', 'Ameyoko Shopping Street', '4 Chome Ueno, Taito City, Tokyo', 35.7102, 139.7747, '17:00', '19:30', 650000, 'food', 4, 'Makan malam yakitori dan street food otentik');
  `);

  db.run(`
    INSERT INTO destinations (id, day_id, trip_id, name, address, lat, lng, time_start, time_end, estimated_cost, category, visit_order, notes) VALUES
    ('dest_t5', 'day_tokyo_2', 'trip_tokyo', 'Kuil Meiji Jingu', '1-1 Yoyogikamizonoocho, Shibuya City, Tokyo', 35.6764, 139.6993, '09:00', '11:00', 80000, 'attraction', 1, 'Suasana hutan asri di tengah metropolitan'),
    ('dest_t6', 'day_tokyo_2', 'trip_tokyo', 'Takeshita Street Harajuku', '1 Chome Jingumae, Shibuya City, Tokyo', 35.6715, 139.7032, '11:30', '13:30', 250000, 'food', 2, 'Mencoba crepe legendaris dan fashion unik Harajuku'),
    ('dest_t7', 'day_tokyo_2', 'trip_tokyo', 'Shibuya Scramble Crossing & Hachiko', '2 Chome Dogenzaka, Shibuya City, Tokyo', 35.6595, 139.7005, '14:30', '17:00', 300000, 'activity', 3, 'Foto di patung Hachiko dan menyeberang persimpangan tersibuk'),
    ('dest_t8', 'day_tokyo_2', 'trip_tokyo', 'Shibuya Sky Observatory', '2 Chome-24-12 Shibuya, Tokyo', 35.6580, 139.7017, '17:30', '19:30', 380000, 'attraction', 4, 'Golden hour & sunset view memukau dari rooftop');
  `);

  db.run(`
    INSERT INTO destinations (id, day_id, trip_id, name, address, lat, lng, time_start, time_end, estimated_cost, category, visit_order, notes) VALUES
    ('dest_t9', 'day_tokyo_3', 'trip_tokyo', 'Akihabara Electric Town', 'Sotokanda, Chiyoda City, Tokyo', 35.6983, 139.7731, '10:00', '13:00', 500000, 'activity', 1, 'Eksplorasi Radio Kaikan & Mandarake'),
    ('dest_t10', 'day_tokyo_3', 'trip_tokyo', 'Ginza Shopping District', 'Ginza, Chuo City, Tokyo', 35.6719, 139.7640, '14:00', '17:00', 1200000, 'food', 2, 'Kopi sore di Ginza Six & toko kue wagashi legendaris');
  `);

  // Seed Trip 2 Days & Destinations (Bali)
  db.run(`
    INSERT INTO trip_days (id, trip_id, day_number, date, title, notes) VALUES
    ('day_bali_1', 'trip_bali', 1, '2026-12-05', 'Jantung Ubud & Hutan Monyet', 'Sensasi seni, alam hijau, dan kuliner khas Bali'),
    ('day_bali_2', 'trip_bali', 2, '2026-12-06', 'Terasering & Kintamani', 'Pemandangan sawah berundak dan Gunung Batur'),
    ('day_bali_3', 'trip_bali', 3, '2026-12-07', 'Tebing Uluwatu & Sunset Tari Kecak', 'Pesisir selatan Bali dan kebudayaan spektakuler');
  `);

  db.run(`
    INSERT INTO destinations (id, day_id, trip_id, name, address, lat, lng, time_start, time_end, estimated_cost, category, visit_order, notes) VALUES
    ('dest_b1', 'day_bali_1', 'trip_bali', 'Sacred Monkey Forest Sanctuary', 'Jl. Monkey Forest, Ubud, Gianyar, Bali', -8.5188, 115.2587, '09:00', '11:00', 120000, 'attraction', 1, 'Interaksi ramah dengan satwa kera ekor panjang dan pohon beringin purba'),
    ('dest_b2', 'day_bali_1', 'trip_bali', 'Campuhan Ridge Walk', 'Kelusa, Payangan, Gianyar, Bali', -8.5037, 115.2547, '11:30', '13:00', 50000, 'activity', 2, 'Trekking santai bukit hijau dengan angin sepoi-sepoi'),
    ('dest_b3', 'day_bali_1', 'trip_bali', 'Pasar Seni Tradisional Ubud', 'Jl. Raya Ubud No.35, Ubud, Gianyar, Bali', -8.5069, 115.2625, '13:30', '15:30', 250000, 'food', 3, 'Makan siang bebek bengil dan belanja kerajinan rotan Bali'),
    ('dest_b4', 'day_bali_1', 'trip_bali', 'Puri Saren Agung (Istana Ubud)', 'Jl. Raya Ubud, Ubud, Gianyar, Bali', -8.5065, 115.2623, '16:00', '17:30', 80000, 'attraction', 4, 'Mengagumi ukiran batu khas arsitektur istana kerajaan Bali');
  `);

  db.run(`
    INSERT INTO destinations (id, day_id, trip_id, name, address, lat, lng, time_start, time_end, estimated_cost, category, visit_order, notes) VALUES
    ('dest_b5', 'day_bali_2', 'trip_bali', 'Tegallalang Rice Terrace', 'Jl. Raya Tegallalang, Gianyar, Bali', -8.4326, 115.2786, '08:30', '11:00', 150000, 'attraction', 1, 'Spot foto sawah bertingkat subak UNESCO dan ayunan Bali'),
    ('dest_b6', 'day_bali_2', 'trip_bali', 'Pura Tirta Empul Tampaksiring', 'Jl. Tirta, Manukaya, Tampaksiring, Gianyar, Bali', -8.4150, 115.3150, '11:30', '13:30', 100000, 'attraction', 2, 'Melihat ritual pembersihan mata air suci kuno abad ke-10'),
    ('dest_b7', 'day_bali_2', 'trip_bali', 'Kintamani Coffee with Batur View', 'Penelokan Main Rd, Kintamani, Bangli, Bali', -8.2862, 115.3488, '14:30', '17:00', 180000, 'food', 3, 'Kopi Arabika Kintamani dengan lanskap danau & kawah Batur');
  `);

  db.run(`
    INSERT INTO destinations (id, day_id, trip_id, name, address, lat, lng, time_start, time_end, estimated_cost, category, visit_order, notes) VALUES
    ('dest_b8', 'day_bali_3', 'trip_bali', 'Pantai Melasti Ungasan', 'Jl. Melasti, Ungasan, Kuta Selatan, Badung, Bali', -8.8471, 115.1672, '13:00', '16:00', 150000, 'activity', 1, 'Pasir putih diapit tebing kapur megah dan air laut toska jernih'),
    ('dest_b9', 'day_bali_3', 'trip_bali', 'Pura Luhur Uluwatu', 'Pecatu, Kuta Selatan, Badung, Bali', -8.8291, 115.0849, '16:30', '18:00', 100000, 'attraction', 2, 'Pura agung di ujung tebing karang 70 meter menghadap Samudra Hindia'),
    ('dest_b10', 'day_bali_3', 'trip_bali', 'Pertunjukan Tari Kecak & Api Uluwatu', 'Pecatu Amphitheatre, Uluwatu, Badung, Bali', -8.8285, 115.0840, '18:00', '19:15', 200000, 'activity', 3, 'Pertunjukan seni kecak dramatis berlatar senja matahari terbenam');
  `);
}

// Helper utility to convert SQL query result to JS objects
export function queryAll<T = Record<string, any>>(db: Database, sql: string, params: any[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

export function queryOne<T = Record<string, any>>(db: Database, sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function executeRun(db: Database, sql: string, params: any[] = []): void {
  db.run(sql, params);
  saveDb(db);
}
