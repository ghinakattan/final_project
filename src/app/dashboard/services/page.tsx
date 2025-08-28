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
  carType?: number;
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

  const sanitizeDescription = (text: string) => {
    if (!text) return text;
    return text.replace(/Car\s*Type:[^\n]*/gi, '').trim();
  };

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
    if (Number(addPrice) < 0) {
      setAddError("Price cannot be negative.");
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
    if (Number(editPrice) < 0) {
      setEditError("Price cannot be negative.");
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

  const formatPrice = (price: number) => {
    const num = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    return `$${num}`;
  };

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

  const totalValue = services.reduce((sum, service) => sum + service.price, 0);
  const avgPrice = services.length > 0 ? totalValue / services.length : 0;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white mb-2"
          >
            Services Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-lg"
          >
            Manage your service offerings and pricing
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
                <p className="text-blue-200 text-sm font-medium">Total Services</p>
                <p className="text-3xl font-bold text-white">{services.length}</p>
              </div>
              <div className="text-3xl">🔧</div>
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
                <p className="text-green-200 text-sm font-medium">Total Value</p>
                <p className="text-3xl font-bold text-white">{formatPrice(totalValue)}</p>
              </div>
              <div className="text-3xl">💰</div>
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
                <p className="text-purple-200 text-sm font-medium">Avg Price</p>
                <p className="text-3xl font-bold text-white">{formatPrice(avgPrice)}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </motion.div>
        </div>

        {/* Success/Error Messages */}
        {addSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/30 text-green-300 px-6 py-4 rounded-xl mb-6 text-center"
          >
            ✅ {addSuccess}
          </motion.div>
        )}
        {editSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/30 text-green-300 px-6 py-4 rounded-xl mb-6 text-center"
          >
            ✅ {editSuccess}
          </motion.div>
        )}

        {/* Add Service Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 transform hover:scale-105"
          >
            {showAddForm ? "✕ Cancel" : "➕ Add New Service"}
          </button>
        </motion.div>

        {/* Add Service Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Add New Service</h2>
            {addError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 text-center"
              >
                ⚠️ {addError}
              </motion.div>
            )}
            
            <form onSubmit={handleAddService} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Service Name</label>
                  <input
                    type="text"
                    value={addName}
                    onChange={e => setAddName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter service name..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Price</label>
                  <input
                    type="number"
                    value={addPrice}
                    onChange={e => setAddPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={addDescription}
                  onChange={e => setAddDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  placeholder="Describe your service..."
                  required
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Service Image</label>
                <input
                  type="file"
                  onChange={e => setAddImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                  required
                  accept="image/*"
                />
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                >
                  ✨ Add Service
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Edit Service Form */}
        {showEditForm && editService && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Edit Service</h2>
            {editError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 text-center"
              >
                ⚠️ {editError}
              </motion.div>
            )}
            
            <form onSubmit={handleEditService} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Service Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Price</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  required
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">New Image (optional)</label>
                <input
                  type="file"
                  onChange={e => setEditImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                  accept="image/*"
                />
                <p className="text-white/60 text-sm mt-1">Leave blank to keep the current image</p>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                >
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Services Grid */}
        {services.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center"
          >
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Services Found</h3>
            <p className="text-white/60">
              Start by adding your first service to showcase your offerings.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt={service.name}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                      <span className="text-4xl">🔧</span>
                    </div>
                  )}
                  
                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full font-semibold">
                    {formatPrice(service.price)}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-3 truncate">
                    {service.name}
                  </h3>
                  
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {sanitizeDescription(service.description)}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-blue-300 font-bold text-lg">
                      {formatPrice(service.price)}
                    </p>
                    <p className="text-white/50 text-xs">
                      Added {new Date(service.createdAt).toLocaleDateString()}
                    </p>
                    {service.carType ? (
                      <p className="text-white/60 text-sm">
                        Car Type: <span className="text-green-300">{service.carType === 1 ? 'Gasoline' : service.carType === 2 ? 'Electric' : 'Hybrid'}</span>
                      </p>
                    ) : (
                      <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-3 py-2 rounded-lg text-sm">
                        ⚡ Compatible with all car types (Gasoline, Electric, Hybrid)
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => openDeleteModal(service)}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Confirmation Modal */}
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