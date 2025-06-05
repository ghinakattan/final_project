"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getToken } from "@/lib/auth";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProgressIndicator from "@/components/ProgressIndicator";

interface OrderItem {
  id: number;
  quantity: number;
  priceAtOrderTime: number;
  product: { id: number; name: string; image?: string; price: number; carType?: number | null };
}

interface Order {
  id: number;
  user: { id: number; fullName: string; phone: string; role: string };
  items: OrderItem[];
  totalPrice: number;
  createdAt: string;
  status: string;
}

// دالة لتحويل رقم CarType إلى نص
function getCarTypeName(carType: number | null | undefined) {
  switch (carType) {
    case 1:
      return "Gasoline";
    case 2:
      return "Electric";
    case 3:
      return "Hybrid";
    case null:
    case undefined:
      return "All Types(Gasoline, Electric, Hybrid) ";
    default:
      return "Unknown";
  }
}

export default function UserOrdersPage() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
        const res = await fetch(`https://file-managment-javz.onrender.com/api/orders/by-user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setOrders(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load orders.");
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => setLoading(false), 500);
      }
    };
    if (userId) fetchOrders();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 items-center justify-center p-4">
        <LoadingSpinner size="lg" className="mb-8" />
        <ProgressIndicator progress={progress} className="max-w-md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 items-center justify-center p-4">
        <motion.div className="w-full max-w-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-red-500/20 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-red-300 text-2xl font-semibold mb-4">{error}</div>
          <div className="text-red-200/80">Please check your authentication and try again.</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">User Orders</h1>
         
        </div>

        {orders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Orders Found</h3>
            <p className="text-white/60">This user has no orders yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order, index) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Order {order.id}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                    order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                    order.status === 'CANCELED' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-white/70 mb-2">Total: <span className="font-semibold text-green-300">${order.totalPrice}</span></p>
                <p className="text-white/50 text-sm mb-4">
  Date : {new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',  // اسم يوم الأسبوع كامل
    year: 'numeric',
    month: 'long',    // اسم الشهر كامل
    day: 'numeric',
  })} - {new Date(order.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true      // لتكون AM/PM
  })}
</p>
                
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex flex-col bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-white/90 font-medium">{item.product.name}</p>
                      <p className="text-white/60 text-sm">Quantity: {item.quantity}</p>
                      <p className="text-white/60 text-sm">Car Type: {getCarTypeName(item.product.carType)}</p>
                      <p className="text-green-300 font-semibold">${item.priceAtOrderTime}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
