// app/admin/reservations/page.tsx
'use client';

import { useState, useEffect } from 'react';

type Reservation = {
  id: number;
  name: string;
  phone: string;
  date: string;
  guests: string;
  notes: string;
  status: string;
  createdAt: string;
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      setReservations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch('/api/reservations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    if (res.ok) await fetchReservations();
  };

  const deleteReservation = async (id: number) => {
    if (!confirm('حذف شود؟')) return;
    const res = await fetch(`/api/reservations?id=${id}`, { method: 'DELETE' });
    if (res.ok) await fetchReservations();
  };

  const statusColors: Record<string, string> = {
    pending: '#fbbf24',
    confirmed: '#22c55e',
    completed: '#6b7280',
    cancelled: '#ef4444'
  };

  const statusPersian: Record<string, string> = {
    pending: 'در انتظار',
    confirmed: 'تایید شده',
    completed: 'انجام شده',
    cancelled: 'لغو شده'
  };

  if (loading) return <div className="text-center py-10">در حال بارگذاری...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📅 مدیریت رزروها</h1>
      <div className="grid gap-4">
        {reservations.map(res => (
          <div key={res.id} className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex justify-between flex-wrap">
              <div>
                <h3 className="font-bold">#{res.id} - {res.name}</h3>
                <p className="text-gray-400 text-sm">📞 {res.phone}</p>
                <p className="text-gray-400 text-sm">👥 {res.guests} نفر</p>
                {res.notes && <p className="text-yellow-400 text-sm mt-2">📝 {res.notes}</p>}
              </div>
              <div className="text-left">
                <p className="text-red-500">📅 {res.date}</p>
                <p className="text-gray-500 text-xs">{new Date(res.createdAt).toLocaleString('fa-IR')}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <select value={res.status} onChange={(e) => updateStatus(res.id, e.target.value)} className="bg-gray-700 rounded-lg px-3 py-1 text-sm">
                <option value="pending">در انتظار</option>
                <option value="confirmed">تایید</option>
                <option value="completed">انجام شد</option>
                <option value="cancelled">لغو</option>
              </select>
              <button onClick={() => deleteReservation(res.id)} className="bg-red-600 px-3 py-1 rounded-lg text-sm">🗑️ حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}