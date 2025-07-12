"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProgressIndicator from "@/components/ProgressIndicator";

// Define the Order interface
interface Order {
  id: string;
  user: { // Assuming user details are nested like this
    fullName: string;
    phone: string; // Assuming phone is part of user details
  };
  items: Array<{ // Assuming items is an array of some sort
    name: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  createdAt: string; // Assuming creation date is a string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

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
        const res = await fetch("https://file-managment-javz.onrender.com/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        if (Array.isArray(data)) {
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
    const filtered = Array.isArray(orders) ? orders.filter(
      (order) =>
        order.user.fullName.toLowerCase().includes(lowerCaseSearch) ||
        order.user.phone.toLowerCase().includes(lowerCaseSearch)
    ) : [];
    setFilteredOrders(filtered);
  }, [search, orders]);

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-5xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10"
      >
        <h1 className="text-3xl font-bold text-white mb-6">Orders</h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/70"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/10 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-white/20">
                <th className="text-left text-white/80 uppercase text-sm px-4 py-3">Order ID</th>
                <th className="text-left text-white/80 uppercase text-sm px-4 py-3">Customer</th>
                <th className="text-left text-white/80 uppercase text-sm px-4 py-3">Total Price</th>
                <th className="text-left text-white/80 uppercase text-sm px-4 py-3">Date</th>
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
                  <td className="px-4 py-3 text-right">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-blue-300 hover:underline text-sm font-semibold"
                      // Implement view details logic here
                    >
                      View Details
                    </motion.button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && !loading && !error && (
                 <tr>
                   <td colSpan={5} className="px-4 py-6 text-center text-white/70">
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