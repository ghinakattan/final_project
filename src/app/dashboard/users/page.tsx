"use client";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProgressIndicator from "@/components/ProgressIndicator";
import Link from "next/link";

interface User {
  id: number;
  fullName: string;
  phone: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
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
        console.log("Fetching users...");
        
        const res = await fetch("https://file-managment-javz.onrender.com/api/users/all", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
        }
        
        const responseData = await res.json();
        console.log("API Response:", responseData);
        
        // The API returns { statusCode, message, data: [...] }
        if (responseData.data && Array.isArray(responseData.data)) {
          setUsers(responseData.data);
          setError(null);
        } else {
          console.error("Unexpected API response format:", responseData);
          setError("Received unexpected data format from API.");
          setUsers([]);
        }
        
      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        setError(err.message || "Failed to load users. Please try again later.");
        setUsers([]);
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => setLoading(false), 500);
      }
    };
    
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    user.phone?.toLowerCase().includes(search.toLowerCase()) ||
    user.role?.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white mb-2"
          >
            Users Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-lg"
          >
            Manage and monitor all registered users in your system
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
                <p className="text-blue-200 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </div>
              <div className="text-3xl">👥</div>
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
                <p className="text-green-200 text-sm font-medium">Regular Users</p>
                <p className="text-3xl font-bold text-white">{users.filter(u => u.role === 'User').length}</p>
              </div>
              <div className="text-3xl">👤</div>
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
                <p className="text-purple-200 text-sm font-medium">Administrators</p>
                <p className="text-3xl font-bold text-white">{users.filter(u => u.role === 'Admin').length}</p>
              </div>
              <div className="text-3xl">👑</div>
            </div>
          </motion.div>
        </div>

        {/* Search and Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Search Users
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, phone, or role..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50">
                  🔍
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-white/60 text-sm">Showing</p>
                <p className="text-2xl font-bold text-white">{filteredUsers.length}</p>
                <p className="text-white/60 text-sm">of {users.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-b border-white/10">
                  <th className="px-6 py-4 text-left text-white font-semibold text-lg">Name</th>
                  <th className="px-6 py-4 text-left text-white font-semibold text-lg">Phone</th>
                  <th className="px-6 py-4 text-left text-white font-semibold text-lg">Role</th>
                  <th className="px-6 py-4 text-left text-white font-semibold text-lg">Created Date</th>
                  <th className="px-6 py-4 text-left text-white font-semibold text-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-white/60 text-lg">
                        {search ? `No users found matching "${search}"` : "No users found in the system."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="hover:bg-white/5 transition-all duration-300 border-b border-white/5 last:border-b-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-3">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium text-lg">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-cyan-300 font-mono text-lg">{user.phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          user.role === 'Admin' 
                            ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/40' 
                            : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/40'
                        }`}>
                          {user.role === 'Admin' ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/70 text-lg">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/users/${user.id}/orders`}
                          className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
                        >
                          View Orders
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 