import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getUserErrorMessage(error) {
  if (!error) return 'เกิดข้อผิดพลาด';
  if (typeof error === 'string') return error;
  if (error.error === 'database_not_configured') {
    return 'ยังไม่ได้ตั้งค่า Azure SQL connection string ใน server/.env';
  }
  if (error.error === 'invalid_id') return 'รหัสนัดไม่ถูกต้อง';
  if (error.error === 'appointment_not_found') return 'ไม่พบนัดที่ต้องการยกเลิก';
  if (error.error === 'failed_to_cancel') return 'ยกเลิกนัดไม่สำเร็จ';
  return error.error || 'เกิดข้อผิดพลาด';
}

export default function App() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ doctor_id: '', patient_name: '', slot: '' });
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  async function load() {
    try {
      setError(null);
      const [d, a] = await Promise.all([
        fetch(`${API_BASE}/doctors`).then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e))),
        fetch(`${API_BASE}/appointments`).then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e))),
      ]);
      setDoctors(d);
      setAppointments(a);
      if (d.length && !form.doctor_id) setForm(f => ({ ...f, doctor_id: d[0].id }));
    } catch (e) {
      setError(getUserErrorMessage(e));
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
      const r = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({ error: 'http_error' }));
        throw e;
      }
      setForm({ doctor_id: doctors[0]?.id || '', patient_name: '', slot: '' });
      await load();
    } catch (e) {
      setError(getUserErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function onCancel(id) {
    if (!confirm('ยกเลิกนัดนี้จริงไหม?')) return;
    setCancellingId(id);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' });
      if (!r.ok) {
        const e = await r.json().catch(() => ({ error: 'http_error' }));
        throw e;
      }
      await load();
    } catch (e) {
      setError(getUserErrorMessage(e));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Bangkok Hospital — Clinic Appointments</h1>
      <p style={{ color: '#666' }}>225381 · W13 starter</p>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: '#c00' }}>Error: {error}</p>}

      <section>
        <h2>Doctors</h2>
        {doctors.length === 0
          ? <p>(no doctors — load schema.sql + seed-data.sql first)</p>
          : <ul>{doctors.map(d => <li key={d.id}>{d.name} — <em>{d.specialty}</em></li>)}</ul>}
      </section>

      <section>
        <h2>Book an appointment</h2>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.5rem', maxWidth: 360 }}>
          <label>
            Doctor
            <select
              value={form.doctor_id}
              onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))}
              required
            >
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
            </select>
          </label>
          <label>
            Patient name
            <input
              type="text"
              value={form.patient_name}
              onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))}
              required
            />
          </label>
          <label>
            Slot (ISO datetime)
            <input
              type="datetime-local"
              value={form.slot}
              onChange={e => setForm(f => ({ ...f, slot: e.target.value }))}
              required
            />
          </label>
          <button type="submit" disabled={submitting || !doctors.length}>
            {submitting ? 'Booking…' : 'Book'}
          </button>
        </form>
      </section>

      <section>
        <h2>Appointments</h2>
        {appointments.length === 0
          ? <p>(none yet)</p>
          : (
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                  <th style={{ padding: '0.25rem' }}>Slot</th>
                  <th style={{ padding: '0.25rem' }}>Patient</th>
                  <th style={{ padding: '0.25rem' }}>Doctor</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.25rem' }}>{new Date(a.slot).toLocaleString()}</td>
                    <td style={{ padding: '0.25rem' }}>{a.patient_name}</td>
                    <td style={{ padding: '0.25rem' }}>{a.doctor_name} <em>({a.specialty})</em></td>
                    <td style={{ padding: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => onCancel(a.id)}
                        disabled={cancellingId === a.id}
                        style={{
                          color: '#c00',
                          padding: '0.35rem 0.7rem',
                          border: '1px solid #c00',
                          borderRadius: 6,
                          background: cancellingId === a.id ? '#f5d5d5' : '#fff',
                          cursor: cancellingId === a.id ? 'wait' : 'pointer',
                        }}
                      >
                        {cancellingId === a.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </section>
    </main>
  );
}
