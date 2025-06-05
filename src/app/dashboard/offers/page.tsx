"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { motion } from "framer-motion";
import Image from "next/image";
import ConfirmationModal from "@/components/ConfirmationModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProgressIndicator from "@/components/ProgressIndicator";

interface Offer {
  id: number;
  title: string;
  image: string;
  createdAt: string; // Assuming creation date is a string
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offerToDeleteId, setOfferToDeleteId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>("newest");

  useEffect(() => {
    const fetchOffers = async () => {
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
        const apiUrl = `https://file-managment-javz.onrender.com/api/offers`;
        const res = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setOffers(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch offers:", err);
        setError(err.message || "Failed to load offers. Please try again later.");
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchOffers();
  }, []);

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    const token = getToken();
    if (!token) {
      setAddError("Not authenticated");
      return;
    }

    if (!newTitle || !newImageFile) {
        setAddError("Please provide both title and an image.");
        return;
    }

    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("image", newImageFile);

    try {
      const res = await fetch("https://file-managment-javz.onrender.com/api/offers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setAddError(data.error || "Failed to add offer");
        return;
      }

      setAddSuccess("Offer added successfully!");
      // Re-fetch offers to update the list
      const fetchRes = await fetch(`https://file-managment-javz.onrender.com/api/offers?timestamp=${new Date().getTime()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const fetchData = await fetchRes.json();
      setOffers(Array.isArray(fetchData.data) ? fetchData.data : Array.isArray(fetchData) ? fetchData : []);

      setNewTitle("");
      setNewImageFile(null);
      setShowAddForm(false);

    } catch (err) {
      setAddError("Failed to add offer");
    }
  };

  const handleDeleteOfferClick = (offerId: number) => {
    setOfferToDeleteId(offerId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (offerToDeleteId === null) return;

    const token = getToken();
    if (!token) {
      setDeleteError("Not authenticated");
      setIsModalOpen(false);
      return;
    }

    setDeleteError("");
    setDeleteSuccess("");

    try {
      const res = await fetch(`https://file-managment-javz.onrender.com/api/offers/${offerToDeleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Failed to delete offer");
        setIsModalOpen(false);
        return;
      }

      setOffers(offers.filter((offer: Offer) => offer.id !== offerToDeleteId));
      setDeleteSuccess("Offer deleted successfully!");

    } catch (err) {
      setDeleteError("Failed to delete offer");
    }

    setIsModalOpen(false);
    setOfferToDeleteId(null);
    setTimeout(() => setDeleteSuccess(""), 3000);
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setOfferToDeleteId(null);
    setDeleteError("");
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
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300">Hot Offers</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">Showcase time‑limited deals with eye‑catching cards and clear calls to action.</p>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-900/20 transition-colors duration-300"
          >
            {showAddForm ? "Cancel Add" : "Add New Offer"}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/10 text-white text-sm px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            onSubmit={handleAddOffer}
            className="bg-white/10 rounded-xl p-6 mb-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-white">Add New Offer</h2>
            {addError && <div className="text-red-500">{addError}</div>}
            {addSuccess && <div className="text-green-500">{addSuccess}</div>}
            <div>
              <label className="block text-white mb-1">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-1">Image</label>
              <input
                type="file"
                onChange={(e) => setNewImageFile(e.target.files ? e.target.files[0] : null)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
                accept="image/*"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-300"
            >
              Add Offer
            </button>
          </motion.form>
        )}

        {deleteError && <div className="text-red-500">{deleteError}</div>}
        {deleteSuccess && <div className="text-green-500">{deleteSuccess}</div>}

        {offers.length === 0 && !loading && !error ? (
          <div className="text-white/70 text-center">No offers found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...offers]
              .sort((a, b) => sortBy === 'newest' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((offer) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl overflow-hidden flex flex-col bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-2xl"
              >
                <div className="relative w-full aspect-video overflow-hidden">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-80"></div>
                  {/* New badge / date */}
                  <div className="absolute top-3 left-3">
                    {(() => {
                      const created = new Date(offer.createdAt);
                      const isNew = Date.now() - created.getTime() < 1000 * 60 * 60 * 24 * 7;
                      const label = isNew ? 'New' : created.toISOString().slice(0,10);
                      return (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/90 text-white shadow-md">
                          {label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                    {offer.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleDeleteOfferClick(offer.id)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 transition-colors shadow-md"
                    >
                      Delete
                    </button>
                    {/* <span className="text-white/60 text-xs">Tap card for details</span> */}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <ConfirmationModal
          isOpen={isModalOpen}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          message="Are you sure you want to delete this offer? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </motion.div>
    </div>
  );
} 