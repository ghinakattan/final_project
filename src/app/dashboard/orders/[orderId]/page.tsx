"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

interface Order {
  user: {
    fullName: string;
    phone: string;
    password?: string;
    role: string;
    cars?: any[];
    orders?: string[];
    id: number;
    createdAt: string;
  };
  items: string[];
  totalPrice: number;
  id: number;
  createdAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      const token = getToken();
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }
      try {
        const apiUrl = `https://file-managment-javz.onrender.com/api/orders/${orderId}`;
        const res = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to fetch order details");
          setLoading(false);
          return;
        }
        const data = await res.json();
        // Assuming the API returns the order object directly or in a data property
        setOrder(data.data || data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch order details");
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10 text-white/70 text-center animate-pulse">
        Loading order details...
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10 text-red-500 text-center">
        {error}
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10 text-white/60 text-center">
        Order not found.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10 text-white"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Order Details</h1>

        <div className="space-y-4">
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}</p>
          <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>

          <div className="pt-4 border-t border-white/20">
            <h3 className="text-xl font-semibold mb-2">Customer Info:</h3>
            <p><strong>Name:</strong> {order.user?.fullName}</p>
            <p><strong>Phone:</strong> {order.user?.phone}</p>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="pt-4 border-t border-white/20">
              <h3 className="text-xl font-semibold mb-2">Items:</h3>
              <ul className="list-disc list-inside">
                {order.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Add more detailed order information here as needed */}

        </div>
      </motion.div>
    </div>
  );
} 