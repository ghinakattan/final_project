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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10"
      >
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Offers</h1>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-4 bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 transition-colors duration-300"
        >
          {showAddForm ? "Cancel Add" : "Add New Offer"}
        </button>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 rounded-xl overflow-hidden shadow-lg border border-white/10 flex flex-col"
              >
                <div className="relative w-full aspect-video">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-xl"
                  />
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {offer.title}
                    </h3>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleDeleteOfferClick(offer.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-600 transition-colors duration-300 text-sm"
                    >
                      Delete
                    </button>
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