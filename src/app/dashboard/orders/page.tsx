"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProgressIndicator from "@/components/ProgressIndicator";

// Define the Order interface
interface Order {
  id: number;
  user: {
    id: number;
    fullName: string;
    phone: string;
    role: string;
  };
  items: Array<{
    id: number;
    quantity: number;
    priceAtOrderTime: number;
    product: {
      id: number;
      name: string;
      image: string;
      price: number;
    };
  }>;
  totalPrice: number;
  createdAt: string;
  status: string; // Added status to the interface
}

// Toast component
function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-semibold ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{message}</div>
  );
}

// Modal for order details
function OrderDetailsModal({ open, onClose, order }: { open: boolean, onClose: () => void, order: Order | null }) {
  if (!open || !order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Order Details</h2>
        <div className="mb-2 text-slate-800"><b>Order ID:</b> {order.id}</div>
        <div className="mb-2 text-slate-800"><b>Status:</b> {order.status}</div>
        <div className="mb-2 text-slate-800"><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</div>
        <div className="mb-2 text-slate-800"><b>Customer:</b> {order.user.fullName} ({order.user.phone})</div>
        <div className="mb-2 text-slate-800"><b>Total Price:</b> ${order.totalPrice.toFixed(2)}</div>
        <div className="mb-2 text-slate-800"><b>Items:</b>
          <ul className="list-disc ml-6">
            {order.items.map(item => (
              <li key={item.id}>
                {item.product.name} x{item.quantity} @ ${item.priceAtOrderTime.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end mt-6">
          <button className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </div>
  );
}

// Modal component for changing status
function ChangeStatusModal({ open, onClose, onSubmit, orderId, changing }: { open: boolean, onClose: () => void, onSubmit: (status: string, note: string) => void, orderId: number, changing: boolean }) {
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const statuses = ["PENDING", "ACCEPTED", "REJECTED", "CANCELED", "COMPLETED"];

  useEffect(() => {
    if (open) {
      setStatus("");
      setNote("");
      setError("");
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
        <h2 className="text-xl font-bold mb-4 text-slate-900">Change Order Status</h2>
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
            onChange={e => { setNote(e.target.value); if (e.target.value) setError(""); }}
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
                setError("Note is required.");
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [changing, setChanging] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = getToken();
      if (!token) {
        setError("Authentication token not found.");
        setLoading(false);
        return;
      }

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        const res = await fetch("https://file-managment-javz.onrender.com/api/orders/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        if (data && data.data && Array.isArray(data.data)) {
          setOrders(data.data);
        } else if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("API did not return an array for orders:", data);
          setError("Received unexpected data format for orders.");
          setOrders([]);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const lowerCaseSearch = search.toLowerCase();
    let filtered = Array.isArray(orders) ? orders.filter(
      (order) =>
        order.user.fullName.toLowerCase().includes(lowerCaseSearch) ||
        order.user.phone.toLowerCase().includes(lowerCaseSearch)
    ) : [];
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    setFilteredOrders(filtered);
  }, [search, orders, statusFilter]);

  const handleOpenModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrderId(null);
  };

  const handleChangeStatus = async (status: string, note: string) => {
    if (!selectedOrderId) return;
    setChanging(true);
    const token = getToken();
    try {
      const res = await fetch("https://file-managment-javz.onrender.com/api/orders/change-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          id: selectedOrderId,
          note,
        }),
      });
      if (!res.ok) throw new Error("Failed to change status");
      setToast({ message: "Order status updated!", type: "success" });
      setShowModal(false);
      setSelectedOrderId(null);
      setLoading(true);
      setProgress(0);
      setError(null);
      // Call fetchOrders again
      const fetchOrders = async () => {
        const token = getToken();
        if (!token) {
          setError("Authentication token not found.");
          setLoading(false);
          return;
        }
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90));
        }, 200);
        try {
          const res = await fetch("https://file-managment-javz.onrender.com/api/orders", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          if (data && data.data && Array.isArray(data.data)) {
            setOrders(data.data);
          } else if (Array.isArray(data)) {
            setOrders(data);
          } else {
            setError("Received unexpected data format for orders.");
            setOrders([]);
          }
          setError(null);
        } catch (err) {
          setError("Failed to load orders. Please try again later.");
        } finally {
          clearInterval(progressInterval);
          setProgress(100);
          setTimeout(() => setLoading(false), 500);
        }
      };
      await fetchOrders();
    } catch (err) {
      setToast({ message: "Error updating status. Please try again.", type: "error" });
      setError("Error updating status. Please try again.");
    } finally {
      setChanging(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setDetailsOrder(order);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setDetailsOrder(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <LoadingSpinner
          variant="dots"
          size="lg"
          className="mb-8"
        />
        <ProgressIndicator
          progress={progress}
          className="max-w-md"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-center"
        >
          {error}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <AnimatePresence>
        <ChangeStatusModal
          open={showModal}
          onClose={handleCloseModal}
          onSubmit={handleChangeStatus}
          orderId={selectedOrderId ?? 0}
          changing={changing}
        />
        <OrderDetailsModal
          open={showDetails}
          onClose={handleCloseDetails}
          order={detailsOrder}
        />
      </AnimatePresence>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-5xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10"
      >
        <h1 className="text-3xl font-bold text-white mb-6">Orders</h1>
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/10 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-white/20">
                <th className="text-left text-white/80 uppercase text-sm px-4 py-3">Order ID</th>
                <th className="text-left text-white/80 uppercase text-sm px-4 py-3">Customer</th>
                <th className="text-left text-white/80 uppercase text-sm px-4 py-3">Total Price</th>
                <th className="text-left text-white/80 uppercase text-sm px-4 py-3">Date</th>
                <th className="text-left text-white/80 uppercase text-sm px-4 py-3">Status</th>
                <th className="text-right text-white/80 uppercase text-sm px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-white/10 hover:bg-white/10">
                  <td className="px-4 py-3 text-white/90">{order.id}</td>
                  <td className="px-4 py-3 text-white/90">{order.user.fullName} ({order.user.phone})</td>
                  <td className="px-4 py-3 text-white/90">${order.totalPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-white/90">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-white/90">{order.status}</td>
                  <td className="px-4 py-3 text-right flex gap-2 justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-blue-300 hover:underline text-sm font-semibold"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-green-300 hover:underline text-sm font-semibold"
                      onClick={() => handleOpenModal(order.id)}
                      disabled={changing}
                    >
                      Change Status
                    </motion.button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && !loading && !error && (
                 <tr>
                   <td colSpan={6} className="px-4 py-6 text-center text-white/70">
                     {search ? "No orders found matching your search." : "No orders available."}
                   </td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
} 