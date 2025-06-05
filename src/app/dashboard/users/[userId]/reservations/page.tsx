"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getToken } from "@/lib/auth";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProgressIndicator from "@/components/ProgressIndicator";

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

export default function UserReservationsPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
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
        const res = await fetch(`https://file-managment-javz.onrender.com/api/reservations/by-user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          setReservations(data.data);
        } else if (Array.isArray(data)) {
          setReservations(data);
        } else {
          setReservations([]);
        }
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load reservations.");
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => setLoading(false), 500);
      }
    };

    if (userId) fetchReservations();
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

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-7xl mx-auto"
      >
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white mb-2"
          >
            User Reservations
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-lg"
          >
            Viewing reservations for user ID: {userId}
          </motion.p>
        </div>

        {reservations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center"
          >
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Reservations Found</h3>
            <p className="text-white/60">This user has no reservations yet.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((r, index) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Reservation #{r.id}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    r.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                    r.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                    r.status === 'CANCELLED' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}>
                    {r.status}
                  </span>
                </div>

                <p className="text-white/70 mb-2">Total: <span className="font-semibold text-green-300">${r.price}</span></p>
                <p className="text-white/50 text-sm mb-4">Date: {new Date(r.createdAt).toLocaleString()}</p>

                <div className="space-y-2">
                  {r.services.map(s => (
                    <div key={s.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-white/10 flex items-center justify-center">
                          {s.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white/50 text-sm">🛠️</span>
                          )}
                        </div>
                        <div>
                          <p className="text-white/90 font-medium">{s.name}</p>
                          <p className="text-white/60 text-sm line-clamp-1">{s.description}</p>
                        </div>
                      </div>
                      <p className="text-green-300 font-semibold">${s.price}</p>
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
