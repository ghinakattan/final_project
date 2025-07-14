'use client';

import React, { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

interface Service {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface Reservation {
  id: number;
  createdAt: string;
  status: string;
  price: number;
  note: string | null;
  services: Service[];
}

function ReservationDetailsModal({ open, onClose, reservation }: { open: boolean, onClose: () => void, reservation: Reservation | null }) {
  if (!open || !reservation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Reservation Details</h2>
        <div className="mb-2 text-slate-800"><b>ID:</b> {reservation.id}</div>
        <div className="mb-2 text-slate-800"><b>Status:</b> {reservation.status}</div>
        <div className="mb-2 text-slate-800"><b>Date:</b> {new Date(reservation.createdAt).toLocaleString()}</div>
        <div className="mb-2 text-slate-800"><b>Price:</b> {reservation.price.toLocaleString()}</div>
        <div className="mb-2 text-slate-800"><b>Note:</b> {reservation.note || '-'}</div>
        <div className="mb-2 text-slate-800"><b>Services:</b>
          {reservation.services.length === 0 ? (
            <div className="text-gray-500">No services</div>
          ) : (
            <ul className="list-disc ml-6">
              {reservation.services.map(service => (
                <li key={service.id}>
                  <div className="flex items-center gap-2">
                    <img src={service.image} alt={service.name} className="w-8 h-8 rounded object-cover border" />
                    <span className="font-semibold">{service.name}</span> - {service.price.toLocaleString()}<br />
                  </div>
                  <span className="text-gray-600 text-sm">{service.description}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <button className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </div>
  );
}

function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-semibold ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{message}</div>
  );
}

function ChangeStatusModal({ open, onClose, onSubmit, reservationId, changing }: { open: boolean, onClose: () => void, onSubmit: (status: string, note: string) => void, reservationId: number, changing: boolean }) {
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const statuses = ['PENDING', 'COMPLETED', 'CANCELLED'];

  useEffect(() => {
    if (open) {
      setStatus('');
      setNote('');
      setError('');
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-slate-900">Change Reservation Status</h2>
        <div className="mb-4">
          <label className="block mb-1 text-slate-700">Status</label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="" className="bg-white text-slate-900">Select status</option>
            {statuses.map(s => <option key={s} value={s} className="bg-white text-slate-900">{s}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-slate-700">Note</label>
          <input
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            value={note}
            onChange={e => { setNote(e.target.value); if (e.target.value) setError(''); }}
            placeholder="Enter a note (required)"
          />
          {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
            onClick={onClose}
          >Cancel</button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={!status || !note || changing}
            onClick={() => {
              if (!note) {
                setError('Note is required.');
                return;
              }
              onSubmit(status, note);
            }}
          >
            {changing && <LoadingSpinner size="sm" />}
            Change
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [detailsReservation, setDetailsReservation] = useState<Reservation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [changing, setChanging] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch('https://file-managment-javz.onrender.com/api/reservations/all', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.statusCode === 200 && Array.isArray(data.data)) {
        setReservations(data.data);
      } else {
        setError(data.message || 'Failed to fetch reservations');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const filteredReservations = reservations.filter(r => {
    const matchesSearch =
      r.id.toString().includes(search) ||
      r.status.toLowerCase().includes(search.toLowerCase()) ||
      r.services.some(s => s.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? r.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (reservation: Reservation) => {
    setDetailsReservation(reservation);
    setShowDetails(true);
  };
  const handleCloseDetails = () => {
    setShowDetails(false);
    setDetailsReservation(null);
  };

  const handleOpenModal = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReservationId(null);
  };

  const handleChangeStatus = async (status: string, note: string) => {
    if (!selectedReservationId) return;
    setChanging(true);
    const token = getToken();
    try {
      const res = await fetch('https://file-managment-javz.onrender.com/api/reservations/change-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status,
          id: selectedReservationId,
          note,
        }),
      });
      if (!res.ok) throw new Error('Failed to change status');
      setToast({ message: 'Reservation status updated!', type: 'success' });
      setShowModal(false);
      setSelectedReservationId(null);
      await fetchReservations();
    } catch (err) {
      setToast({ message: 'Error updating status. Please try again.', type: 'error' });
      setError('Error updating status. Please try again.');
    } finally {
      setChanging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <LoadingSpinner variant="dots" size="lg" className="mb-8" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-center">{error}</motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <AnimatePresence>
        <ReservationDetailsModal open={showDetails} onClose={handleCloseDetails} reservation={detailsReservation} />
        <ChangeStatusModal
          open={showModal}
          onClose={handleCloseModal}
          onSubmit={handleChangeStatus}
          reservationId={selectedReservationId ?? 0}
          changing={changing}
        />
      </AnimatePresence>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-5xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10"
      >
        <h1 className="text-3xl font-bold text-white mb-6">Reservations</h1>
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <input
            type="text"
            placeholder="Search by ID, status, or service name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/70"
          />
          <select
            className="w-full md:w-48 px-4 py-2 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <table className="min-w-full bg-white/10 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-white/20">
              <th className="text-left text-white/80 uppercase text-sm px-4 py-3">ID</th>
              <th className="text-left text-white/80 uppercase text-sm px-4 py-3">Created At</th>
              <th className="text-left text-white/80 uppercase text-sm px-4 py-3">Status</th>
              <th className="text-left text-white/80 uppercase text-sm px-4 py-3">Price</th>
              <th className="text-left text-white/80 uppercase text-sm px-4 py-3">Services</th>
              <th className="text-right text-white/80 uppercase text-sm px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map(r => (
              <tr key={r.id} className="border-t border-white/10 hover:bg-white/10">
                <td className="px-4 py-3 text-white/90">{r.id}</td>
                <td className="px-4 py-3 text-white/90">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-white/90">{r.status}</td>
                <td className="px-4 py-3 text-white/90">{r.price.toLocaleString()}</td>
                <td className="px-4 py-3 text-white/90">{r.services.length}</td>
                <td className="px-4 py-3 text-right flex gap-2 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-blue-300 hover:underline text-sm font-semibold"
                    onClick={() => handleViewDetails(r)}
                  >
                    View Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-green-300 hover:underline text-sm font-semibold"
                    onClick={() => handleOpenModal(r.id)}
                    disabled={changing}
                  >
                    Change Status
                  </motion.button>
                </td>
              </tr>
            ))}
            {filteredReservations.length === 0 && !loading && !error && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-white/70">
                  {search ? 'No reservations found matching your search.' : 'No reservations available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
} 