import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import { getSqlPool } from './db.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true, service: 'accommodation-api' }));

app.get('/rooms', async (_req, res, next) => {
  try {
    const pool = await getSqlPool();
    const r = await pool.request()
      .query('SELECT id, name, type, price FROM rooms ORDER BY name');
    res.json(r.recordset);
  } catch (e) { next(e); }
});

app.get('/bookings', async (_req, res, next) => {
  try {
    const pool = await getSqlPool();
    const r = await pool.request().query(`
      SELECT b.id, b.guest_name, b.check_in, b.check_out,
             r.name AS room_name, r.type AS room_type, r.price
      FROM bookings b JOIN rooms r ON b.room_id = r.id
      ORDER BY b.check_in
    `);
    res.json(r.recordset);
  } catch (e) { next(e); }
});

app.post('/bookings', async (req, res, next) => {
  const { room_id, guest_name, check_in, check_out } = req.body || {};
  if (!room_id || !guest_name || !check_in || !check_out) {
    return res.status(400).json({ error: 'room_id, guest_name, check_in, check_out are required' });
  }
  try {
    const pool = await getSqlPool();
    const r = await pool.request()
      .input('room_id', sql.Int, Number(room_id))
      .input('guest_name', sql.NVarChar(200), String(guest_name))
      .input('check_in', sql.DateTime2, new Date(check_in))
      .input('check_out', sql.DateTime2, new Date(check_out))
      .query(`
        INSERT INTO bookings (room_id, guest_name, check_in, check_out)
        OUTPUT INSERTED.id, INSERTED.room_id, INSERTED.guest_name,
               INSERTED.check_in, INSERTED.check_out
        VALUES (@room_id, @guest_name, @check_in, @check_out)
      `);
    res.status(201).json(r.recordset[0]);
  } catch (e) { next(e); }
});

app.use((err, _req, res, _next) => {
  if (err.code === 'NO_DB_CONFIG') {
    return res.status(503).json({
      error: 'database_not_configured',
      hint: 'Set AZURE_SQL_CONNECTION_STRING environment variable'
    });
  }
  console.error('unhandled', err);
  res.status(500).json({ error: 'internal_error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`accommodation-api listening on :${PORT}`);
});
