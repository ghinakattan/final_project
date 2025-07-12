'use client';

import React, { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useParams } from 'next/navigation';

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
    return <div>Loading products...</div>;
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
        className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10"
      >
        <h1 className="text-3xl font-bold text-white mb-8 text-center">{categoryName ? `${categoryName} Products` : 'Products'}</h1>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-4 bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 transition-colors duration-300"
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
          <div className="text-white/60 text-center">No products found for this category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                className="relative bg-white/10 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-white/10 dark:border-gray-700 cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Optional: Link to a product detail page */}
                {/* <Link href={`/dashboard/products/${product.id}`}> */}
                  <div className="relative w-full h-48 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                     {product.image ? (
                      <Image
                         src={product.image}
                         alt={product.name}
                         layout="fill"
                         objectFit="cover"
                         className="transition-opacity duration-500"
                      />
                     ) : (
                      <div className="text-gray-500 dark:text-gray-400">No Image</div>
                     )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                    {/* Display price */}
                    <p className="text-gray-700 dark:text-gray-300 mt-2">Price: ${product.price.toFixed(2)}</p>
                    {/* Display category name if available */}
                    {product.category && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Category: {product.category.name}</p>
                    )}
                  </div>
                {/* </Link> */}

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteClick(product.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200 focus:outline-none"
                  aria-label="Delete product"
                >
                  {/* Simple X icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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