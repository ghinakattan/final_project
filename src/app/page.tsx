'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function EnterPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        <div className="max-w-6xl w-full">
          {/* Hero Section */}
          <div className="backdrop-blur-lg bg-white/5 rounded-3xl shadow-2xl p-8 md:p-12 border border-white/10">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Honda</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400"> Aid</span>
                </h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto font-light">
                  Expert care for your Honda's performance and reliability
                </p>
              </motion.div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="backdrop-blur-md bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="text-cyan-400 text-2xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-white mb-3">Premium Service</h3>
                <p className="text-white/70">State-of-the-art diagnostics and repairs</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="backdrop-blur-md bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="text-cyan-400 text-2xl mb-4">🔧</div>
                <h3 className="text-xl font-semibold text-white mb-3">Expert Team</h3>
                <p className="text-white/70">Certified technicians with premium training</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="backdrop-blur-md bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="text-cyan-400 text-2xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-white mb-3">Quick Service</h3>
                <p className="text-white/70">Efficient diagnostics and rapid repairs</p>
              </motion.div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  <Link 
    href="/login" 
    className="min-w-[200px] px-20 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 text-center text-lg"
  >
    Sign in
  </Link>
</motion.div>


              {/* <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link 
                  href="/login" 
                  className="px-8 py-4 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 text-center block border border-white/10"
                >
                  Sign In
                </Link>
              </motion.div>  */}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🔧', name: 'Engine Tuning' },
                { icon: '🛠️', name: 'Brake Service' },
                { icon: '⚡', name: 'Performance' },
                { icon: '🔍', name: 'Diagnostics' },
                { icon: '🛢️', name: 'Oil Change' },
                { icon: '🚗', name: 'Tire Service' },
                { icon: '🔋', name: 'Battery' },
                { icon: '💨', name: 'AC Service' }
              ].map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-4 backdrop-blur-md bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300"
                >
                  <div className="text-cyan-400 text-2xl mb-2">{service.icon}</div>
                  <div className="text-white/90 font-medium">{service.name}</div>
                </motion.div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '24/7', label: 'Service' },
                { value: '1000+', label: 'Happy Clients' },
                { value: '15+', label: 'Experts' },
                { value: '100%', label: 'Satisfaction' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="text-white/80"
                >
                  <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
