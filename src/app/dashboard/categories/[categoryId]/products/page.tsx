'use client';

import React, { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Category {
  id: number;
  createdAt: string;
  name: string;
  image?: string;
}

interface Product {
  id: string;
  createdAt: string;
  name: string;
  image?: string;
  price: number;
  category?: Category;
  carType?: number;
}

const ProductsByCategoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  // State for Add Product Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newCarType, setNewCarType] = useState<number | ''>('');
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // State for Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const params = useParams();
  const categoryId = params.categoryId as string; // Get categoryId from URL

  useEffect(() => {
    const fetchCategory = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`https://file-managment-javz.onrender.com/api/categories/${categoryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && (data.name || (data.data && data.data.name))) {
            setCategoryName(data.name || data.data.name);
          }
        }
      } catch {}
    };
    if (categoryId) fetchCategory();
  }, [categoryId]);

  useEffect(() => {
    const fetchProducts = async () => {
      const token = getToken();
      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`https://file-managment-javz.onrender.com/api/products?categoryId=${categoryId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          setProducts(result.data);
        } else if (result && Array.isArray(result)) {
          setProducts(result);
        } else {
          throw new Error('Invalid API response format.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (categoryId) {
        fetchProducts();
    }
  }, [categoryId]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);

    if (!newName) {
      setAddError('Product name is required.');
      return;
    }

    if (!newImage) {
        setAddError('Product image is required.');
        return;
    }

    if (newPrice === '' || isNaN(newPrice)) {
        setAddError('Product price is required and must be a number.');
        return;
    }

    const token = getToken();
    if (!token) {
      setAddError('Authentication token not found.');
      return;
    }

    try {
             const formData = new FormData();
       formData.append('name', newName);
       if(newImage) {
         formData.append('image', newImage);
       }
       formData.append('price', newPrice.toString());
       formData.append('categoryId', categoryId); // Link product to current category
       if(newCarType !== '') {
         formData.append('carType', newCarType.toString());
       }

      const response = await fetch('https://file-managment-javz.onrender.com/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newProduct = await response.json();
             setAddSuccess('Product added successfully!');
       setNewName('');
       setNewImage(null);
       setNewPrice('');
       setNewCarType('');
       setShowAddForm(false);

      // Assuming the API returns the new product data directly or within 'data'
      if (newProduct && newProduct.data) {
        setProducts([...products, newProduct.data]); // Add the new product to state
      } else if (newProduct) {
         setProducts([...products, newProduct]);
      }
      // Or refetch products to be sure:
      // fetchProducts();

    } catch (err: any) {
      setAddError(err.message);
    } finally {
        // Clear success/error messages after a few seconds
        setTimeout(() => {
            setAddError(null);
            setAddSuccess(null);
        }, 3000);
    }
  };

  // Handlers for delete modal
  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return; // Should not happen if modal is opened correctly

    const token = getToken();
    if (!token) {
      console.error('Authentication token not found.');
      setShowDeleteModal(false);
      setProductToDelete(null);
      setError('Authentication token not found.');
      return;
    }

    try {
      const response = await fetch(`https://file-managment-javz.onrender.com/api/products/${productToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Remove the deleted product from the state
      setProducts(products.filter(product => product.id !== productToDelete));
      console.log('Product deleted successfully:', productToDelete);

    } catch (err: any) {
      console.error('Failed to delete product:', err);
      setError(`Failed to delete product: ${err.message}`);
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
       // Clear error message after a few seconds
       setTimeout(() => {
           setError(null);
       }, 3000);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Filter products to only those with the current categoryId
  const filteredProducts = products.filter(
    (product) => product.category && String(product.category.id) === String(categoryId)
  );

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 items-center justify-center p-4">
        <LoadingSpinner
          size="lg"
          className="mb-8"
        />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
             <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.8 }}
         className="w-full max-w-6xl bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10"
       >
                                   <h1 className="text-4xl font-bold text-white mb-8 text-center">
            {categoryName ? categoryName : 'Products'}
          </h1>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          {showAddForm ? 'Cancel Add Product' : 'Add New Product'}
        </button>

        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            onSubmit={handleAddProduct}
            className="bg-white/10 rounded-xl p-6 mb-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-white mb-4">Add New Product</h2>
            {addError && <div className="text-red-500">{addError}</div>}
            {addSuccess && <div className="text-green-500">{addSuccess}</div>}
            <div>
              <label htmlFor="name" className="block text-white mb-1">Product Name</label>
              <input
                type="text"
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                required
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-white mb-1">Image</label>
              <input
                type="file"
                id="image"
                onChange={(e) => setNewImage(e.target.files ? e.target.files[0] : null)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
                accept="image/*"
              />
            </div>
             <div>
              <label htmlFor="price" className="block text-white mb-1">Price</label>
              <input
                type="number"
                id="price"
                value={newPrice}
                onChange={(e) => setNewPrice(parseFloat(e.target.value) || '')}
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                required
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="carType" className="block text-white mb-1">Car Type</label>
                             <select
                 id="carType"
                 value={newCarType}
                 onChange={(e) => setNewCarType(e.target.value ? parseInt(e.target.value) : '')}
                 className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
               >
                 <option value="" className="bg-slate-800 text-white">Select Car Type</option>
                 <option value="1" className="bg-slate-800 text-white">Gasoline</option>
                 <option value="2" className="bg-slate-800 text-white">Electric</option>
                 <option value="3" className="bg-slate-800 text-white">Hybrid</option>
               </select>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-300"
            >
              Add Product
            </button>
          </motion.form>
        )}

        {loading && <div className="text-white/70 text-center">Loading products...</div>}
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {/* Add delete success/error messages if needed */}
        {/* {deleteError && <div className="text-red-500">{deleteError}</div>} */}
        {/* {deleteSuccess && <div className="text-green-500">{deleteSuccess}</div>} */}

        {filteredProducts.length === 0 ? (
          <div className="text-white/60 text-center text-lg">No products found for this category.</div>
        ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
                             <motion.div
                 key={product.id}
                 className="relative bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: index * 0.1 }}
                 whileHover={{ y: -5, scale: 1.05 }}
               >
                 <div className="relative w-full aspect-[4/3] overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                                     ) : (
                     <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                       <span className="text-4xl text-blue-300">📦</span>
                     </div>
                   )}
                  
                                     {/* Price Badge */}
                   <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full font-semibold">
                     ${product.price}
                   </div>

                                     {/* Category Badge */}
                   {product.category && (
                     <div className="absolute top-3 left-3 bg-blue-500/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                       {product.category.name}
                     </div>
                   )}

                                     {/* Delete Button Overlay */}
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                     <button
                       onClick={() => handleDeleteClick(product.id)}
                       className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                       aria-label="Delete product"
                     >
                       🗑️ Delete
                     </button>
                   </div>
                </div>

                                 <div className="p-4">
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                     {product.name}
                   </h3>
                   
                                       <div className="space-y-2">
                      <p className="text-gray-700 dark:text-gray-300 mt-2">Price: ${product.price}</p>
                      
                      {product.category && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Category: {product.category.name}</p>
                      )}
                      
                      {product.carType && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Car Type: {product.carType === 1 ? 'Gasoline' : product.carType === 2 ? 'Electric' : 'Hybrid'}
                        </p>
                      )}
                    </div>
                 </div>
              </motion.div>
            ))}
          </div>
        )}

        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Confirm Deletion"
          message="Are you sure you want to delete this product?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </motion.div>
    </div>
  );
};

export default ProductsByCategoryPage; 