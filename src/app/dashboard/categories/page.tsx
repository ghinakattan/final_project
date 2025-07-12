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
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Categories</h1>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-4 bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 transition-colors duration-300"
        >
          {showAddForm ? "Cancel Add" : "Add New Category"}
        </button>

        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            onSubmit={handleAddCategory}
            className="bg-white/10 rounded-xl p-6 mb-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-white">Add New Category</h2>
            {addError && <div className="text-red-500">{addError}</div>}
            {addSuccess && <div className="text-green-500">{addSuccess}</div>}
            <div>
              <label className="block text-white mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
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
              Add Category
            </button>
          </motion.form>
        )}

        {deleteError && <div className="text-red-500">{deleteError}</div>}
        {deleteSuccess && <div className="text-green-500">{deleteSuccess}</div>}

        {!loading && !error && categories.length === 0 ? (
          <div className="text-white/70 text-center">No categories found.</div>
        ) : (
          !loading && !error && categories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category: Category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/10 rounded-xl overflow-hidden shadow-lg border border-white/10 flex flex-col"
                >
                  <Link href={`/dashboard/categories/${category.id}/products`} className="block focus:outline-none">
                    <div className="relative w-full aspect-[3/2]">
                       {category.image && (
                          <Image
                             src={category.image}
                             alt={category.name}
                             layout="fill"
                             objectFit="cover"
                             className="rounded-t-xl"
                          />
                       )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                       <div>
                          <h3 className="text-xl font-semibold text-white mb-2 truncate">
                             {category.name}
                          </h3>
                          <p className="text-white/70 text-sm">{category.products.length} Products</p>
                       </div>
                    </div>
                  </Link>
                  <div className="p-4 pt-0 flex justify-end">
                    <button
                       onClick={() => handleDeleteCategoryClick(category.id)}
                       className="bg-red-500 text-white px-3 py-1 rounded-xl font-semibold hover:bg-red-600 transition-colors duration-300 text-xs"
                    >
                       Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
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