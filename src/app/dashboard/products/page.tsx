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
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
         } else if (result && Array.isArray(result)) {
            setProducts(result);
         } else {
           console.error("API did not return an array for products:", result);
           setError("Received unexpected data format for products.");
           setProducts([]);
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
        <h1 className="text-3xl font-bold text-white mb-8 text-center">All Products</h1>

        {/* {loading && <div className="text-white/70 text-center">Loading products...</div>} */}
        {/* {error && <div className="text-red-500 mb-4 text-center">{error}</div>} */}

        {products.length === 0 && !loading && !error ? (
          <div className="text-white/60 text-center">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
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
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProductsPage; 