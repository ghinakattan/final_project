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
  const [upcomingServicesCount, setUpcomingServicesCount] = useState<number>(0);
  const [totalBookingsCount, setTotalBookingsCount] = useState<number>(0);
  const [lastServiceDate, setLastServiceDate] = useState<string>("-");
  const [pipelineCounts, setPipelineCounts] = useState<{ pending: number; inProgress: number; completed: number; cancelled: number}>({ pending: 0, inProgress: 0, completed: 0, cancelled: 0 });
  const [newUsersThisWeek, setNewUsersThisWeek] = useState<number>(0);
  const [returningUsers, setReturningUsers] = useState<number>(0);
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

  // Fetch dashboard stats (reservations, orders)
  useEffect(() => {
    const fetchStats = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const [reservationsRes, ordersRes, usersRes] = await Promise.all([
          fetch('https://file-managment-javz.onrender.com/api/reservations/all', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('https://file-managment-javz.onrender.com/api/orders/all', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('https://file-managment-javz.onrender.com/api/users/all', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (reservationsRes.ok) {
          const reservationsJson = await reservationsRes.json();
          const reservations = Array.isArray(reservationsJson?.data) ? reservationsJson.data : (Array.isArray(reservationsJson) ? reservationsJson : []);
          setTotalBookingsCount(reservations.length);
          const upcoming = reservations.filter((r: any) => {
            const status = (r?.status || '').toString().toUpperCase();
            return status !== 'COMPLETED' && status !== 'CANCELLED';
          });
          setUpcomingServicesCount(upcoming.length);
        }

        if (ordersRes.ok) {
          const ordersJson = await ordersRes.json();
          const orders = Array.isArray(ordersJson?.data) ? ordersJson.data : (Array.isArray(ordersJson) ? ordersJson : []);
          const completed = orders.filter((o: any) => (o?.status || '').toString().toUpperCase() === 'COMPLETED');
          const latest = completed
            .map((o: any) => new Date(o?.createdAt || o?.updatedAt || 0).getTime())
            .filter((t: number) => !isNaN(t))
            .sort((a: number, b: number) => b - a)[0];
          if (latest) {
            const d = new Date(latest);
            setLastServiceDate(d.toISOString().slice(0, 10));
          }

          const toKey = (s: string) => s.toUpperCase();
          const counts = { pending: 0, inProgress: 0, completed: 0, cancelled: 0 };
          for (const o of orders) {
            const status = toKey((o?.status || '') as string);
            if (status === 'PENDING') counts.pending += 1;
            else if (status === 'IN_PROGRESS' || status === 'INPROGRESS') counts.inProgress += 1;
            else if (status === 'COMPLETED') counts.completed += 1;
            else if (status === 'CANCELLED' || status === 'CANCELED') counts.cancelled += 1;
          }
          setPipelineCounts(counts);
        }

        if (usersRes.ok) {
          const usersJson = await usersRes.json();
          const users = Array.isArray(usersJson?.data) ? usersJson.data : (Array.isArray(usersJson) ? usersJson : []);
          const now = Date.now();
          const weekMs = 7 * 24 * 60 * 60 * 1000;
          const newThisWeek = users.filter((u: any) => {
            const t = new Date(u?.createdAt || 0).getTime();
            return !isNaN(t) && now - t <= weekMs;
          }).length;
          setNewUsersThisWeek(newThisWeek);
          setReturningUsers(Math.max(users.length - newThisWeek, 0));
        }
      } catch (err) {
        // ignore network errors here; UI remains functional
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 items-center justify-center p-4">
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 min-h-screen p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-7xl mx-auto"
      >
        {/* Enhanced Header Section */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-3xl">🚗</span>
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4"
          >
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {user ? user.fullName : (localName || "...")}
            </span>
            !
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xl text-white/70 max-w-2xl mx-auto"
          >
            Your Honda Aid dashboard is ready. Manage your services, track bookings, and stay updated with everything.
          </motion.p>
        </motion.div>

        

        {/* Service Pipeline */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-12"
        >
          <h3 className="text-xl font-bold text-white mb-4">Service Pipeline</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pending', value: pipelineCounts.pending, href: '/dashboard/orders?status=PENDING', color: 'from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30' },
              { label: 'In-Progress', value: pipelineCounts.inProgress, href: '/dashboard/orders?status=IN_PROGRESS', color: 'from-blue-500/20 to-cyan-500/20 text-cyan-300 border-cyan-500/30' },
              { label: 'Completed', value: pipelineCounts.completed, href: '/dashboard/orders?status=COMPLETED', color: 'from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30' },
              { label: 'Cancelled', value: pipelineCounts.cancelled, href: '/dashboard/orders?status=CANCELLED', color: 'from-rose-500/20 to-red-500/20 text-rose-300 border-rose-500/30' },
            ].map((s) => (
              <Link key={s.label} href={s.href} className={`block rounded-xl p-4 border bg-gradient-to-br ${s.color} hover:opacity-90 transition`}>
                <div className="flex items-center justify-between">
                  <span className="text-white/90 font-medium">{s.label}</span>
                  <span className="text-2xl font-bold">{s.value}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Customer Insights */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
            <div className="text-white/80 text-sm">New users this week</div>
            <div className="text-3xl font-bold text-white">{newUsersThisWeek}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30">
            <div className="text-white/80 text-sm">Returning users</div>
            <div className="text-3xl font-bold text-white">{returningUsers}</div>
          </div>
        </motion.div>

        {/* Enhanced Navigation Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-16 max-w-4xl mx-auto"
        >
          {[
            // { 
            //   href: "/dashboard/book", 
            //   label: "Book Service", 
            //   icon: "🔧",
            //   description: "Schedule a new service appointment",
            //   gradient: "from-blue-500 to-cyan-500",
            //   hoverGradient: "from-blue-600 to-cyan-600"
            // },
            // { 
            //   href: "/dashboard/appointments", 
            //   label: "My Appointments", 
            //   icon: "📅",
            //   description: "View and manage your appointments",
            //   gradient: "from-green-500 to-emerald-500",
            //   hoverGradient: "from-green-600 to-emerald-600"
            // },
            { 
              href: "/dashboard/profile", 
              label: "Profile", 
              icon: "👤",
              description: "Update your profile information",
              gradient: "from-sky-500 via-blue-600 to-indigo-600",
              hoverGradient: "from-sky-600 via-blue-700 to-indigo-700"
            },
            
            { 
              href: "/dashboard/users", 
              label: "Manage Users", 
              icon: "👥",
              description: "Admin user management",
              gradient: "from-emerald-500 via-teal-500 to-cyan-500",
              hoverGradient: "from-emerald-600 via-teal-600 to-cyan-600"
            },
          ].map((link, index) => (
            <motion.div
              key={link.label}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
            >
              <Link
                href={link.href}
                className={`block bg-gradient-to-r ${link.gradient} hover:${link.hoverGradient} text-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/10 group`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {link.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{link.label}</h3>
                  <p className="text-white/80 text-sm">{link.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "View Orders", href: "/dashboard/orders", icon: "📦" },
              { label: "Check Reservations", href: "/dashboard/reservations", icon: "📋" },
              { label: "Manage Services", href: "/dashboard/services", icon: "⚙️" },
            ].map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link
                  href={action.href}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all duration-300 border border-white/10"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-white font-medium">{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 