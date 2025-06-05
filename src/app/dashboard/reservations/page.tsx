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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Reservation Details</h2>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4 text-white/90">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/60 text-sm">Reservation ID</p>
              <p className="font-semibold">#{reservation.id}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/60 text-sm">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                reservation.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                reservation.status === 'REJECTED' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                reservation.status === 'COMPLETED' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {reservation.status}
              </span>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-2">Reservation Summary</p>
            <div className="flex justify-between items-center mb-2">
              <span>Total Price:</span>
              <span className="text-2xl font-bold text-green-400">${reservation.price}</span>
            </div>
            <p className="text-white/70 text-sm">Date: {new Date(reservation.createdAt).toLocaleString()}</p>
            {reservation.note && (
              <p className="text-white/70 text-sm mt-2">Note: {reservation.note}</p>
            )}
          </div>
          
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-3">Services ({reservation.services.length})</p>
            {reservation.services.length === 0 ? (
              <div className="text-white/50 text-center py-4">No services selected</div>
            ) : (
              <div className="space-y-3">
                {reservation.services.map(service => (
                  <div key={service.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <img src={service.image} alt={service.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                    <div className="flex-1">
                      <p className="font-medium text-white">{service.name}</p>
                      <p className="text-sm text-white/60">{service.description}</p>
                    </div>
                    <p className="text-green-400 font-semibold">${service.price}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button 
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
            onClick={onClose}
          >
            Close
          </button>
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
    <motion.div 
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-semibold backdrop-blur-xl ${
        type === 'success' 
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 border border-green-400/30' 
          : 'bg-gradient-to-r from-red-500 to-pink-500 border border-red-400/30'
      }`}
    >
      {message}
    </motion.div>
  );
}

function ChangeStatusModal({ open, onClose, onSubmit, reservationId, changing }: { open: boolean, onClose: () => void, onSubmit: (status: string, note: string, date: string, time: string) => void, reservationId: number, changing: boolean }) {
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const statuses = ['REJECTED', 'ACCEPTED', 'COMPLETED'];

  useEffect(() => {
    if (open) {
      setStatus('');
      setNote('');
      setError('');
      setDate('');
      setTime('');
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Change Reservation Status</h2>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-white/80 text-sm font-medium">Status</label>
            <select
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white transition-all duration-300"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="" className="bg-slate-800 text-white">Select status</option>
              {statuses.map(s => <option key={s} value={s} className="bg-slate-800 text-white">{s}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block mb-2 text-white/80 text-sm font-medium">Note</label>
            <input
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white placeholder-white/50 transition-all duration-300"
              value={note}
              onChange={e => { setNote(e.target.value); if (e.target.value) setError(''); }}
              placeholder="Enter a note (required)"
            />
            {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-white/80 text-sm font-medium">Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white placeholder-white/50 transition-all duration-300"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-white/80 text-sm font-medium">Time</label>
              <input
                type="time"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white placeholder-white/50 transition-all duration-300"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300 border border-white/20"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={!status || !note || !date || !time || changing}
            onClick={() => {
              if (!note) {
                setError('Note is required.');
                return;
              }
              if (!date || !time) {
                setError('Date and time are required.');
                return;
              }
              onSubmit(status, note, date, time);
            }}
          >
            {changing && <LoadingSpinner size="sm" />}
            Update Status
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

  const handleChangeStatus = async (status: string, note: string, date: string, time: string) => {
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
          date,
          time,
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
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 items-center justify-center p-4">
        <LoadingSpinner variant="dots" size="lg" className="mb-8" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-red-500/20 text-center"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-red-300 text-2xl font-semibold mb-4">{error}</div>
          <div className="text-red-200/80">
            <p>Please check your authentication and try again.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalRevenue = reservations.reduce((sum, r) => sum + r.price, 0);
  const rejectingReservations = reservations.filter(r => r.status === 'REJECTED').length;
  const acceptedReservations = reservations.filter(r => r.status === 'ACCEPTED').length;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 p-6">
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
        className="w-full max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white mb-2"
          >
            Reservations Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-lg"
          >
            Manage customer service reservations and appointments
          </motion.p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Reservations</p>
                <p className="text-3xl font-bold text-white">{reservations.length}</p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-white">${totalRevenue}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Accepting</p>
                <p className="text-3xl font-bold text-white">{acceptedReservations}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Search Reservations</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by status, or service name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-white/50 transition-all duration-300"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                  🔍
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Filter by Status</label>
              <select
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="" className="bg-white text-black">All Statuses</option>
                <option value="REJECTED" className="bg-white text-black">REJECTED</option>
                <option value="ACCEPTED" className="bg-white text-black">ACCEPTED</option>
                <option value="COMPLETED" className="bg-white text-black">COMPLETED</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center">
            <p className="text-white/60">
              Showing <span className="text-white font-semibold">{filteredReservations.length}</span> of <span className="text-white font-semibold">{reservations.length}</span> reservations
            </p>
          </div>
        </motion.div>

        {/* Reservations Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-white/10 border-b border-white/10">
                  <th className="text-left text-white/80 uppercase text-sm font-semibold px-6 py-4">Created At</th>
                  <th className="text-left text-white/80 uppercase text-sm font-semibold px-6 py-4">Status</th>
                  <th className="text-left text-white/80 uppercase text-sm font-semibold px-6 py-4">Price</th>
                  <th className="text-left text-white/80 uppercase text-sm font-semibold px-6 py-4">Services</th>
                  <th className="text-right text-white/80 uppercase text-sm font-semibold px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((r, index) => (
                  <motion.tr 
                    key={r.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b border-white/5 hover:bg-white/5 transition-all duration-300"
                  >
                    <td className="px-6 py-4 text-white/90">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        r.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        r.status === 'REJECTED' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        r.status === 'COMPLETED' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/90">
                      <span className="text-green-400 font-bold text-lg">${r.price}</span>
                    </td>
                    <td className="px-6 py-4 text-white/90">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                          {r.services.length} services
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl text-sm font-semibold transition-all duration-300 border border-blue-500/30"
                          onClick={() => handleViewDetails(r)}
                        >
                          👁️ Details
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-xl text-sm font-semibold transition-all duration-300 border border-green-500/30"
                          onClick={() => handleOpenModal(r.id)}
                          disabled={changing}
                        >
                          ✏️ Status
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredReservations.length === 0 && !loading && !error && (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-6xl mb-4">📅</div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {search || statusFilter ? "No reservations found matching your criteria." : "No reservations available."}
                      </h3>
                      <p className="text-white/60">
                        {search || statusFilter ? "Try adjusting your search or filter criteria." : "Reservations will appear here once customers book services."}
                      </p>
                    </td>
                  </motion.tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}