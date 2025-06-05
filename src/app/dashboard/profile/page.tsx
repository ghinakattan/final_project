"use client";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");
  const [editing, setEditing] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (!token) return setError("Not authenticated");
      try {
        const res = await fetch("https://file-managment-javz.onrender.com/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to fetch profile");
          return;
        }
        const data = await res.json();
        setUser(data.user || data);
        setEditName(data.user?.fullName || data.fullName || "");
        setEditPhone(data.user?.phone || data.phone || "");
        setUsers(data.users || data || []);
      } catch (err) {
        setError("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg("");
    const token = getToken();
    if (!token) return setUpdateMsg("Not authenticated");
    try {
      const res = await fetch("https://file-managment-javz.onrender.com/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: editName,
          phone: editPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUpdateMsg(data.error || "Update failed");
        return;
      }
      setUpdateMsg("Profile updated!");
      setUser(data.user || data);
      setEditing(false);
    } catch (err) {
      setUpdateMsg("Update failed");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10"
      >
        <h1 className="text-3xl font-bold text-white mb-8 text-center">My Profile</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {user && !editing && (
          <div className="bg-white/10 rounded-xl p-6 text-white mb-6">
            <div><b>ID:</b> {user.id}</div>
            <div><b>Full Name:</b> {user.fullName}</div>
            <div><b>Phone:</b> {user.phone}</div>
            <button
              onClick={() => setEditing(true)}
              className="mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
            >
              Edit Profile
            </button>
          </div>
        )}
        {editing && (
          <form onSubmit={handleUpdate} className="bg-white/10 rounded-xl p-6 text-white space-y-4 mb-6">
            <div>
              <label className="block mb-1">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Phone</label>
              <input
                type="text"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-white/20 text-white px-6 py-2 rounded-xl font-semibold border border-white/10 hover:bg-white/30 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
            {updateMsg && <div className="text-white mt-2">{updateMsg}</div>}
          </form>
        )}
      </motion.div>
    </div>
  );
} 