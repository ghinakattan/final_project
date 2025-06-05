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

// Modal for order details
function OrderDetailsModal({ open, onClose, order }: { open: boolean, onClose: () => void, order: Order | null }) {
  if (!open || !order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Order Details</h2>
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
              <p className="text-white/60 text-sm">Order ID</p>
              <p className="font-semibold">#{order.id}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/60 text-sm">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                order.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                order.status === 'REJECTED' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-2">Customer Information</p>
            <p className="font-semibold">{order.user.fullName}</p>
            <p className="text-white/70">{order.user.phone}</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-2">Order Summary</p>
            <div className="flex justify-between items-center mb-2">
              <span>Total Price:</span>
              <span className="text-2xl font-bold text-green-400">${order.totalPrice}</span>
            </div>
            <p className="text-white/70 text-sm">Date: {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-3">Order Items</p>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-white/60">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-green-400 font-semibold">${item.priceAtOrderTime}</p>
                </div>
              ))}
            </div>
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

// Modal component for changing status
function ChangeStatusModal({ open, onClose, onSubmit, orderId, changing }: { open: boolean, onClose: () => void, onSubmit: (status: string, note: string) => void, orderId: number, changing: boolean }) {
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const statuses = [
    // "PENDING", 
    "ACCEPTED", "REJECTED", "COMPLETED"];

  useEffect(() => {
    if (open) {
      setStatus("");
      setNote("");
      setError("");
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
          <h2 className="text-xl font-bold text-white">Change Order Status</h2>
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
              onChange={e => { setNote(e.target.value); if (e.target.value) setError(""); }}
              placeholder="Enter a note (required)"
            />
            {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
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
            Update Status
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
      console.log("Orders API response:", data); // Debug log
      
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

  useEffect(() => {
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
      
      // Refresh all orders after status change
      console.log("Refreshing orders after status change..."); // Debug log
      await fetchOrders();
      
    } catch (err) {
      setToast({ message: "Error updating status. Please try again.", type: "error" });
      console.error("Error updating status:", err);
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
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 items-center justify-center p-4">
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

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
  const rejectingOrders = orders.filter(order => order.status === 'REJECTED').length;
  const acceptedOrders = orders.filter(order => order.status === 'ACCEPTED').length;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 p-6">
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
            Orders Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-lg"
          >
            Monitor and manage customer orders and their status
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
                <p className="text-blue-200 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-white">{orders.length}</p>
              </div>
              <div className="text-3xl">📦</div>
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
                <p className="text-purple-200 text-sm font-medium">Pending Orders</p>
                <p className="text-3xl font-bold text-white">{pendingOrders}</p>
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
              <label className="block text-white/90 text-sm font-medium mb-2">Search Orders</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by customer name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                {/* <option value="PENDING" className="bg-white text-black">Pending</option> */}
                <option value="REJECTED" className="bg-white text-black">Rejected</option>
                <option value="COMPLETED" className="bg-white text-black">Completed</option>
                {/* <option value="CANCELLED" className="bg-white text-black">Cancelled</option> */}
                <option value="ACCEPTED" className="bg-white text-black">Accepted</option>
                {/* <option value="REJECTED" className="bg-white text-black">Rejected</option> */}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center">
            <p className="text-white/60">
              Showing <span className="text-white font-semibold">{filteredOrders.length}</span> of <span className="text-white font-semibold">{orders.length}</span> orders
            </p>
          </div>
        </motion.div>

        {/* Orders Table */}
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
                  <th className="text-left text-white/80 uppercase text-sm font-semibold px-6 py-4">Customer</th>
                  <th className="text-left text-white/80 uppercase text-sm font-semibold px-6 py-4">Total Price</th>
                  <th className="text-left text-white/80 uppercase text-sm font-semibold px-6 py-4">Date</th>
                  <th className="text-left text-white/80 uppercase text-sm font-semibold px-6 py-4">Status</th>
                  <th className="text-right text-white/80 uppercase text-sm font-semibold px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr 
                    key={order.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b border-white/5 hover:bg-white/5 transition-all duration-300"
                  >
                    <td className="px-6 py-4 text-white/90">
                      <div>
                        <p className="font-medium">{order.user.fullName}</p>
                        <p className="text-sm text-white/60">{order.user.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/90">
                      <span className="text-green-400 font-bold text-lg">${order.totalPrice}</span>
                    </td>
                    <td className="px-6 py-4 text-white/90">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        order.status === 'REJECTING' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        order.status === 'COMPLETED' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl text-sm font-semibold transition-all duration-300 border border-blue-500/30"
                          onClick={() => handleViewDetails(order)}
                        >
                          👁️ Details
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-xl text-sm font-semibold transition-all duration-300 border border-green-500/30"
                          onClick={() => handleOpenModal(order.id)}
                          disabled={changing}
                        >
                          ✏️ Status
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredOrders.length === 0 && !loading && !error && (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {search || statusFilter ? "No orders found matching your criteria." : "No orders available."}
                      </h3>
                      <p className="text-white/60">
                        {search || statusFilter ? "Try adjusting your search or filter criteria." : "Orders will appear here once customers place them."}
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