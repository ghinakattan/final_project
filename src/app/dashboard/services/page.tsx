"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { motion } from "framer-motion";
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProgressIndicator from "@/components/ProgressIndicator";
import ConfirmationModal from "@/components/ConfirmationModal";

interface Service {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
  createdAt: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addPrice, setAddPrice] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [editName, setEditName] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const fetchServices = async () => {
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
      const res = await fetch("https://file-managment-javz.onrender.com/api/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data.data)) {
        setServices(data.data);
      } else if (Array.isArray(data)) {
        setServices(data);
      } else {
        setServices([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load services. Please try again later.");
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    const token = getToken();
    if (!token) {
      setAddError("Authentication token not found.");
      return;
    }
    if (!addName || !addImageFile || !addPrice || !addDescription) {
      setAddError("Please fill in all fields and select an image.");
      return;
    }
    if (isNaN(Number(addPrice))) {
      setAddError("Price must be a valid number.");
      return;
    }
    const formData = new FormData();
    formData.append("name", addName);
    formData.append("image", addImageFile);
    formData.append("price", addPrice);
    formData.append("description", addDescription);
    try {
      const res = await fetch("https://file-managment-javz.onrender.com/api/services", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Failed to add service");
        return;
      }
      setAddSuccess("Service added successfully!");
      setAddName("");
      setAddImageFile(null);
      setAddPrice("");
      setAddDescription("");
      setShowAddForm(false);
      fetchServices();
    } catch (err) {
      setAddError("Failed to add service");
    }
  };

  const openEditForm = (service: Service) => {
    setEditService(service);
    setEditName(service.name);
    setEditImageFile(null);
    setEditPrice(service.price.toString());
    setEditDescription(service.description);
    setEditError("");
    setEditSuccess("");
    setShowEditForm(true);
  };

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editService) return;
    setEditError("");
    setEditSuccess("");
    const token = getToken();
    if (!token) {
      setEditError("Authentication token not found.");
      return;
    }
    if (!editName || !editPrice || !editDescription) {
      setEditError("Please fill in all fields.");
      return;
    }
    if (isNaN(Number(editPrice))) {
      setEditError("Price must be a valid number.");
      return;
    }
    const formData = new FormData();
    formData.append("name", editName);
    if (editImageFile) formData.append("image", editImageFile);
    formData.append("price", String(Number(editPrice)));
    formData.append("description", editDescription);
    try {
      const res = await fetch(`https://file-managment-javz.onrender.com/api/services/${editService.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to update service");
        return;
      }
      setEditSuccess("Service updated successfully!");
      setShowEditForm(false);
      setEditService(null);
      fetchServices();
    } catch (err) {
      setEditError("Failed to update service");
    }
  };

  const openDeleteModal = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    const token = getToken();
    if (!token) {
      setError("Authentication token not found.");
      setIsDeleteModalOpen(false);
      return;
    }
    try {
      const res = await fetch(`https://file-managment-javz.onrender.com/api/services/${serviceToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete service");
        setIsDeleteModalOpen(false);
        return;
      }
      setIsDeleteModalOpen(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (err) {
      setError("Failed to delete service");
      setIsDeleteModalOpen(false);
    }
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
        className="w-full max-w-5xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10"
      >
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Services</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-6 bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 transition-colors duration-300"
        >
          {showAddForm ? "Cancel Add" : "Add New Service"}
        </button>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            onSubmit={handleAddService}
            className="bg-white/10 rounded-xl p-6 mb-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-white">Add New Service</h2>
            {addError && <div className="text-red-500">{addError}</div>}
            {addSuccess && <div className="text-green-500">{addSuccess}</div>}
            <div>
              <label className="block text-white mb-1">Name</label>
              <input
                type="text"
                value={addName}
                onChange={e => setAddName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-1">Image</label>
              <input
                type="file"
                onChange={e => setAddImageFile(e.target.files ? e.target.files[0] : null)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
                accept="image/*"
              />
            </div>
            <div>
              <label className="block text-white mb-1">Price</label>
              <input
                type="number"
                value={addPrice}
                onChange={e => setAddPrice(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-white mb-1">Description</label>
              <textarea
                value={addDescription}
                onChange={e => setAddDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                required
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-300"
            >
              Add Service
            </button>
          </motion.form>
        )}
        {showEditForm && editService && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            onSubmit={handleEditService}
            className="bg-white/10 rounded-xl p-6 mb-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-white">Edit Service</h2>
            {editError && <div className="text-red-500">{editError}</div>}
            {editSuccess && <div className="text-green-500">{editSuccess}</div>}
            <div>
              <label className="block text-white mb-1">Name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-1">Image (leave blank to keep current)</label>
              <input
                type="file"
                onChange={e => setEditImageFile(e.target.files ? e.target.files[0] : null)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept="image/*"
              />
            </div>
            <div>
              <label className="block text-white mb-1">Price</label>
              <input
                type="number"
                value={editPrice}
                onChange={e => setEditPrice(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-white mb-1">Description</label>
              <textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                required
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-300"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              className="ml-4 bg-gray-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-300"
            >
              Cancel
            </button>
          </motion.form>
        )}
        {services.length === 0 ? (
          <div className="text-white/70 text-center">No services found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 rounded-xl overflow-hidden shadow-lg border border-white/10 flex flex-col"
              >
                <div className="relative w-full aspect-video">
                  {service.image && (
                    <Image
                      src={service.image}
                      alt={service.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-xl"
                    />
                  )}
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2 truncate">{service.name}</h3>
                    <p className="text-white/70 text-sm mb-2">{service.description}</p>
                    <p className="text-blue-300 font-bold text-lg mb-2">${service.price.toFixed(2)}</p>
                    <p className="text-xs text-white/50 mt-1">Created: {new Date(service.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openEditForm(service)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-yellow-600 transition-colors duration-300 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(service)}
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
          isOpen={isDeleteModalOpen}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteService}
          message="Are you sure you want to delete this service? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </motion.div>
    </div>
  );
} 