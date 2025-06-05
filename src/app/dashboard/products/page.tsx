'use client';

import React, { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import ConfirmationModal from '@/components/ConfirmationModal';
import LoadingSpinner from "@/components/LoadingSpinner";
import ProgressIndicator from "@/components/ProgressIndicator";

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

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      const token = getToken();
      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        const response = await fetch('https://file-managment-javz.onrender.com/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Products API response:', result);
        // Assuming the API returns data in a similar structure to categories
         if (result && Array.isArray(result.data)) {
           setProducts(result.data);
           setFilteredProducts(result.data);
         } else if (result && Array.isArray(result)) {
            setProducts(result);
            setFilteredProducts(result);
         } else {
           console.error("API did not return an array for products:", result);
           setError("Received unexpected data format for products.");
           setProducts([]);
           setFilteredProducts([]);
         }
        setError(null);

      } catch (err: any) {
        console.error("Failed to fetch products:", err);
        setError(err.message || "Failed to load products. Please try again later.");
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder]);

  const getUniqueCategories = () => {
    const categories = products.map(p => p.category?.name).filter(Boolean);
    return [...new Set(categories)];
  };

  const formatPrice = (price: number) => {
    return `$${price}`;
  };

  const handleDeleteProductClick = (productId: string) => {
    setProductToDeleteId(productId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDeleteId === null) return;

    const token = getToken();
    if (!token) {
      setDeleteError('Not authenticated');
      setIsModalOpen(false);
      return;
    }

    setDeleteError('');
    setDeleteSuccess('');

    try {
      console.log('Attempting to delete product with ID:', productToDeleteId);
      console.log('Using token:', token.substring(0, 20) + '...');
      
      // Try different delete approaches
      const deleteUrl = `https://file-managment-javz.onrender.com/api/products/${productToDeleteId}`;
      console.log('Delete URL:', deleteUrl);

      // Approach 1: Standard DELETE with ID in URL
      let res = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', res.status);
      console.log('Delete response headers:', Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        let errorMessage = 'Failed to delete product';
        try {
          const data = await res.json();
          console.log('Delete error response data:', data);
          errorMessage = data.error || data.message || `HTTP ${res.status}: ${res.statusText}`;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }

        // If it's an internal server error, try alternative approaches
        if (res.status === 500) {
          console.log('Internal Server Error detected, trying alternative approaches...');
          
          // Approach 2: DELETE with ID in request body
          try {
            console.log('Trying DELETE with ID in request body...');
            res = await fetch('https://file-managment-javz.onrender.com/api/products', {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id: productToDeleteId }),
            });
            
            console.log('Alternative approach response status:', res.status);
            
            if (res.ok) {
              console.log('Alternative approach succeeded!');
            } else {
              // Approach 3: POST to delete endpoint
              console.log('Trying POST to delete endpoint...');
              res = await fetch('https://file-managment-javz.onrender.com/api/products/delete', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: productToDeleteId }),
              });
              
              console.log('POST delete response status:', res.status);
            }
          } catch (altError) {
            console.log('Alternative approaches failed:', altError);
          }
        }
        
        // Check if any approach worked
        if (!res.ok) {
          setDeleteError(errorMessage);
          setIsModalOpen(false);
          return;
        }
      }

      // Try to get response data even on success
      let responseData;
      try {
        responseData = await res.json();
        console.log('Delete success response data:', responseData);
      } catch (parseError) {
        console.log('No response body to parse (this is normal for DELETE)');
      }

      // Remove the deleted product from both arrays
      setProducts(products.filter(product => product.id !== productToDeleteId));
      setFilteredProducts(filteredProducts.filter(product => product.id !== productToDeleteId));
      setDeleteSuccess('Product deleted successfully!');

    } catch (err) {
      console.error('Delete operation failed with error:', err);
      setDeleteError(`Failed to delete product: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    setIsModalOpen(false);
    setProductToDeleteId(null);
    setTimeout(() => setDeleteSuccess(''), 3000);
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setProductToDeleteId(null);
    setDeleteError('');
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

  const totalValue = products.reduce((sum, product) => sum + product.price, 0);
  const avgPrice = products.length > 0 ? totalValue / products.length : 0;
  const categories = getUniqueCategories();

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
            Products Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-lg"
          >
            Browse and manage your product catalog
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
                <p className="text-blue-200 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-white">{products.length}</p>
              </div>
              <div className="text-3xl">📦</div>
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

          {/* <motion.div
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
          </motion.div> */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">Categories</p>
                <p className="text-3xl font-bold text-white">{categories.length}</p>
              </div>
              <div className="text-3xl">🏷️</div>
            </div>
          </motion.div>
        </div>

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

        {/* Search and Filter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Search Products</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                  🔍
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'date')}
                className="w-full px-4 py-3 rounded-xl bg-black/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="date">Date</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-4 py-3 rounded-xl bg-black/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center">
            <p className="text-white/60">
              Showing <span className="text-white font-semibold">{filteredProducts.length}</span> of <span className="text-white font-semibold">{products.length}</span> products
            </p>
          </div>
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center"
          >
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Products Found</h3>
            <p className="text-white/60">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by adding your first product to the catalog.'
              }
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                  
                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full font-semibold">
                    {formatPrice(product.price)}
                  </div>

                  {/* Category Badge */}
                  {product.category && (
                    <div className="absolute top-3 left-3 bg-blue-500/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      {product.category.name}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2 truncate">
                    {product.name}
                  </h3>
                  
                  <div className="space-y-2">
                    <p className="text-white/80 text-lg font-medium">
                      {formatPrice(product.price)}
                    </p>
                    
                    {product.category && (
                      <p className="text-white/60 text-sm">
                        Category: <span className="text-blue-300">{product.category.name}</span>
                      </p>
                    )}
                    
                    {product.carType && (
                      <p className="text-white/60 text-sm">
                        Car Type: <span className="text-green-300">
                          {product.carType === 1 ? 'Gasoline' : product.carType === 2 ? 'Electric' : 'Hybrid'}
                        </span>
                      </p>
                    )}
                    
                    <p className="text-white/50 text-xs">
                      Added {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Delete Button Only */}
                <div className="px-6 pb-6">
                  <button 
                    onClick={() => handleDeleteProductClick(product.id)}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
                  >
                    🗑️ Delete Product
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={isModalOpen}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          message="Are you sure you want to delete this product? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </motion.div>
    </div>
  );
};

export default ProductsPage; 