"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import ConfirmationModal from "@/components/ConfirmationModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProgressIndicator from "@/components/ProgressIndicator";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  image: string;
  products: string[];
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
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
        const apiUrl = `https://file-managment-javz.onrender.com/api/categories?timestamp=${new Date().getTime()}`;
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
        console.log("Categories API response data:", data);
        // Assuming the API returns an array of categories directly or in a data property
        if (Array.isArray(data.data)) {
            setCategories(data.data);
        } else if (Array.isArray(data)) {
            setCategories(data);
        } else {
            console.error("API did not return an array for categories:", data);
            setError("Received unexpected data format for categories.");
            setCategories([]); // Set to empty array to prevent errors
        }
        setError(null);

      } catch (err: any) {
        console.error("Failed to fetch categories:", err);
        setError(err.message || "Failed to load categories. Please try again later.");
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    const token = getToken();
    if (!token) {
      setAddError("Not authenticated");
      return;
    }

    if (!newName || !newImageFile) {
        setAddError("Please provide both name and an image.");
        return;
    }

    const formData = new FormData();
    formData.append("name", newName);
    formData.append("image", newImageFile);

    try {
      const res = await fetch("https://file-managment-javz.onrender.com/api/categories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setAddError(data.error || "Failed to add category");
        return;
      }

      setAddSuccess("Category added successfully!");
      const fetchRes = await fetch(`https://file-managment-javz.onrender.com/api/categories?timestamp=${new Date().getTime()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const fetchData = await fetchRes.json();
      setCategories(Array.isArray(fetchData.data) ? fetchData.data : Array.isArray(fetchData) ? fetchData : []);

      setNewName("");
      setNewImageFile(null);
      setShowAddForm(false);

    } catch (err) {
      setAddError("Failed to add category");
    }
  };

  const handleDeleteCategoryClick = (categoryId: number) => {
    setCategoryToDeleteId(categoryId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDeleteId === null) return;

    const token = getToken();
    if (!token) {
      setDeleteError("Not authenticated");
      setIsModalOpen(false);
      return;
    }

    setDeleteError("");
    setDeleteSuccess("");

    try {
      const res = await fetch(`https://file-managment-javz.onrender.com/api/categories/${categoryToDeleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Failed to delete category");
        setIsModalOpen(false);
        return;
      }

      setCategories(categories.filter((category: Category) => category.id !== categoryToDeleteId));
      setDeleteSuccess("Category deleted successfully!");

    } catch (err) {
      setDeleteError("Failed to delete category");
    }

    setIsModalOpen(false);
    setCategoryToDeleteId(null);
    setTimeout(() => setDeleteSuccess(""), 3000);
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setCategoryToDeleteId(null);
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

  const totalProducts = categories.reduce((sum, category) => sum + category.products.length, 0);

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
            Categories Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-lg"
          >
            Organize and manage your product categories
          </motion.p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Categories</p>
                <p className="text-3xl font-bold text-white">{categories.length}</p>
              </div>
              <div className="text-3xl">📁</div>
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
                <p className="text-green-200 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-white">{totalProducts}</p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Avg Products/Category</p>
                <p className="text-3xl font-bold text-white">
                  {categories.length > 0 ? Math.round(totalProducts / categories.length) : 0}
                </p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </motion.div> */}
        </div>

        {/* Add Category Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Add New Category</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                showAddForm 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              }`}
            >
              {showAddForm ? "Cancel" : "➕ Add Category"}
            </button>
          </div>

          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              onSubmit={handleAddCategory}
              className="space-y-6"
            >
              {addError && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl"
                >
                  ⚠️ {addError}
                </motion.div>
              )}
              {addSuccess && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl"
                >
                  ✅ {addSuccess}
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Category Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter category name..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Category Image</label>
                  <input
                    type="file"
                    onChange={(e) => setNewImageFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                    required
                    accept="image/*"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  🚀 Create Category
                </button>
              </div>
            </motion.form>
          )}
        </motion.div>

        {/* Success/Error Messages */}
        {deleteError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl mb-6 text-center"
          >
            ⚠️ {deleteError}
          </motion.div>
        )}
        {deleteSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/30 text-green-300 px-6 py-4 rounded-xl mb-6 text-center"
          >
            ✅ {deleteSuccess}
          </motion.div>
        )}

        {/* Categories Grid */}
        {!loading && !error && categories.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center"
          >
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Categories Found</h3>
            <p className="text-white/60">Start by creating your first category to organize your products.</p>
          </motion.div>
        ) : (
          !loading && !error && categories.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {categories.map((category: Category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <Link href={`/dashboard/categories/${category.id}/products`} className="block focus:outline-none">
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-300 hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                          <span className="text-4xl">📁</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {category.products.length} Products
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-2 truncate">
                        {category.name}
                      </h3>
                      <p className="text-white/60 text-sm mb-4">
                        Created {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                  <div className="px-6 pb-6">
                    <button
                      onClick={() => handleDeleteCategoryClick(category.id)}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
                    >
                      🗑️ Delete Category
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        )}

        <ConfirmationModal
          isOpen={isModalOpen}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          message="Are you sure you want to delete this category? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </motion.div>
    </div>
  );
} 