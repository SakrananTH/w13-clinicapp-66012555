import { useEffect, useState } from 'react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const ROOM_IMAGE = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85';

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ room_id: '', guest_name: '', check_in: '', check_out: '' });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      setError(null);
      const [r, b] = await Promise.all([
        fetch(`${API_BASE}/rooms`).then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e))),
        fetch(`${API_BASE}/bookings`).then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e))),
      ]);
      setRooms(r);
      setBookings(b);
      if (r.length && !form.room_id) setForm(f => ({ ...f, room_id: r[0].id }));
    } catch (e) {
      setError(e.error || 'failed_to_load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({ error: 'http_error' }));
        throw e;
      }
      setForm({ room_id: rooms[0]?.id || '', guest_name: '', check_in: '', check_out: '' });
      await load();
    } catch (e) {
      setError(e.error || 'failed_to_book');
    } finally {
      setSubmitting(false);
    }
  }

  const startingPrice = rooms.length
    ? Math.min(...rooms.map(room => Number(room.price)))
    : 0;

  function formatDate(value) {
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">BH</span>
          <div>
            หอพักตุ้ยนุ้ย
            <small>ระบบจองห้องพัก</small>
          </div>
        </div>
        <nav className="topnav" aria-label="เมนูหลัก">
          <a href="#rooms">ห้องพัก</a>
          <a href="#booking">การจอง</a>
          <a href="#recent">รายการล่าสุด</a>
        </nav>
        <span className="topbar-badge">ระบบจองที่พัก</span>
      </header>

      <section className="hero">
        <div className="hero-image" style={{ backgroundImage: `url(${ROOM_IMAGE})` }} aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">หอพักตุ้ยนุ้ย · กรุงเทพฯ</p>
          <h1>ค้นหาห้องพักที่เหมาะกับคุณ</h1>
          <p>เลือกห้องพักและจัดการการเข้าพักได้จากหน้าจอเดียว</p>
        </div>
      </section>

      {loading && <p className="loading-line">กำลังโหลดข้อมูลห้องพัก...</p>}
      {error && <p className="status-message">เกิดข้อผิดพลาด: {error}</p>}

      <section className="stat-grid" aria-label="สรุปข้อมูลการจอง">
        <div className="stat">
          <span className="stat-label">ห้องพักทั้งหมด</span>
          <strong className="stat-value">{rooms.length}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">รายการจอง</span>
          <strong className="stat-value">{bookings.length}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">ราคาเริ่มต้น / คืน</span>
          <strong className="stat-value">{startingPrice ? `${startingPrice.toLocaleString()} ฿` : '—'}</strong>
        </div>
      </section>

      <div className="content-grid">
        <section className="panel" id="rooms">
          <div className="panel-heading">
            <div>
              <h2>ห้องพักที่เปิดให้จอง</h2>
              <p>เลือกห้องพักตามรูปแบบและงบประมาณของคุณ</p>
            </div>
          </div>
          {rooms.length === 0
            ? <p className="empty-state">ยังไม่มีข้อมูลห้องพัก กรุณาโหลด schema.sql และ seed-data.sql ก่อน</p>
            : (
              <div className="room-list">
                {rooms.map(room => (
                  <article className="room-item" key={room.id}>
                    <div className="room-image" style={{ backgroundImage: `url(${ROOM_IMAGE})` }} aria-hidden="true" />
                    <div>
                      <span className="room-name">{room.name}</span>
                      <span className="room-type">ห้องประเภท {room.type}</span>
                    </div>
                    <span className="room-price">
                      {Number(room.price).toLocaleString()} ฿
                      <small>ต่อคืน</small>
                    </span>
                  </article>
                ))}
              </div>
            )}
        </section>

        <section className="panel booking-panel" id="booking">
          <div className="panel-heading">
            <div>
              <h2>จองห้องพัก</h2>
              <p>กรอกข้อมูลการเข้าพักของคุณ</p>
            </div>
          </div>
          <form className="booking-form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="room">ห้องพัก</label>
              <select
                id="room"
                value={form.room_id}
                onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))}
                required
              >
                {rooms.map(room => <option key={room.id} value={room.id}>{room.name} — {room.type}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="guest-name">ชื่อผู้เข้าพัก</label>
              <input
                id="guest-name"
                type="text"
                placeholder="เช่น ณัฐยา เพชรรุ่ง"
                value={form.guest_name}
                onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))}
                required
              />
            </div>
            <div className="date-grid">
              <div className="field">
                <label htmlFor="check-in">วันเช็กอิน</label>
                <input
                  id="check-in"
                  type="date"
                  value={form.check_in}
                  onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="check-out">วันเช็กเอาต์</label>
                <input
                  id="check-out"
                  type="date"
                  value={form.check_out}
                  onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))}
                  required
                />
              </div>
            </div>
            <button className="primary-button" type="submit" disabled={submitting || !rooms.length}>
              {submitting ? 'กำลังจอง...' : 'ยืนยันการจอง'}
            </button>
          </form>
        </section>

        <section className="panel table-panel" id="recent">
          <div className="panel-heading">
            <div>
              <h2>รายการจองล่าสุด</h2>
              <p>ตรวจสอบข้อมูลการเข้าพักของผู้เข้าพัก</p>
            </div>
          </div>
          {bookings.length === 0
            ? <p className="empty-state">ยังไม่มีรายการจอง</p>
            : (
              <div className="booking-table-wrap">
                <table className="booking-table">
                  <thead>
                    <tr>
                      <th>วันเช็กอิน</th>
                      <th>วันเช็กเอาต์</th>
                      <th>ผู้เข้าพัก</th>
                      <th>ห้องพัก</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id}>
                        <td>{formatDate(booking.check_in)}</td>
                        <td>{formatDate(booking.check_out)}</td>
                        <td>{booking.guest_name}</td>
                        <td>{booking.room_name} <span className="room-type">{booking.room_type}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}
