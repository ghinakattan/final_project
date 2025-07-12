"use client";
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { auth, storeToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await auth.signup(phone, password, fullName, "");
      console.log("Signup API response:", response);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_fullName', fullName);
        if (response.data && response.data.access_token) {
          console.log("Storing token:", response.data.access_token);
          storeToken(response.data.access_token);
        } else {
          console.log("Signup response did not contain a token in data.access_token.", response);
        }
      }
      setSuccess('Signup successful!');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="backdrop-blur-lg bg-white/5 rounded-3xl shadow-2xl p-8 border border-white/10"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Honda</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">Aide</span>
              </h1>
              <p className="text-white/60">Create your account</p>
            </div>
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-white/80 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300"
              >
                Sign Up
              </motion.button>
              {error && <div className="text-red-500 text-center">{error}</div>}
              {success && <div className="text-green-500 text-center">{success}</div>}
            </form>
            <div className="mt-8 text-center">
              <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
                Already have an account? Login
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 