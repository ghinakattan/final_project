"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { useRouter } from 'next/navigation';
import LoadingSpinner from "@/components/LoadingSpinner";
import ProgressIndicator from "@/components/ProgressIndicator";

export default function DashboardHome() {
  const [user, setUser] = useState<{ fullName: string } | null>(null);
  const [localName, setLocalName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Get the name from localStorage as a fallback
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('user_fullName');
      if (name) setLocalName(name);
    }

    const fetchUser = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        const res = await fetch("https://file-managment-javz.onrender.com/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user_fullName');
          }
        }
      } catch (err) {
        // Handle error
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => setLoading(false), 500); // Small delay for smooth transition
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <LoadingSpinner
          variant="pulse"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10"
      >
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Welcome, <span className="text-blue-300">{user ? user.fullName : (localName || "...")}</span>!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/70"
          >
            Here's your HondaAide dashboard.
          </motion.p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { value: "3", label: "Upcoming Services" },
            { value: "12", label: "Total Bookings" },
            { value: "2024-06-01", label: "Last Service" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white/10 rounded-xl p-6 text-center border border-white/10 shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <div className="text-2xl font-bold text-blue-300 mb-2">{stat.value}</div>
              <div className="text-white/80">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { href: "/dashboard/book", label: "Book Service", gradient: true },
            { href: "/dashboard/appointments", label: "My Appointments" },
            { href: "/dashboard/profile", label: "Profile" },
            { href: "/dashboard/users", label: "Manage Users" },
          ].map((link, index) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Link
                href={link.href}
                className={`block ${
                  link.gradient
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    : "bg-white/10 hover:bg-white/20"
                } text-white rounded-xl p-6 text-center font-semibold shadow-xl hover:scale-105 transition-all duration-300 border border-white/10`}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 