'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Users', href: '/dashboard/users', icon: '👥' },
  { name: 'Categories', href: '/dashboard/categories', icon: '📁' },
  { name: 'Products', href: '/dashboard/products', icon: '📦' },
  { name: 'Services', href: '/dashboard/services', icon: '🔧' },
  { name: 'Offers', href: '/dashboard/offers', icon: '🎁' },
  { name: 'Orders', href: '/dashboard/orders', icon: '📋' },
  { name: 'Reservations', href: '/dashboard/reservations', icon: '📅' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

const containerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-72 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl text-white flex flex-col p-6 shadow-2xl border-r border-white/10 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-50"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-2xl"></div>
      
      {/* Logo Section */}
      <motion.div 
        variants={itemVariants}
        className="relative z-10 mb-12"
      >
        <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 mb-2">
          Honda Aid
        </div>
        <div className="text-xs text-white/60 font-medium tracking-wider uppercase">
          Admin Dashboard
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-grow relative z-10">
        <motion.ul variants={containerVariants} className="space-y-2">
          {navigation.map((item, index) => (
            <motion.li key={item.name} variants={itemVariants}>
              <Link href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-out group relative overflow-hidden
                    ${pathname === item.href 
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white shadow-lg backdrop-blur-sm border border-blue-500/30'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20 border border-transparent'
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon */}
                  <span className="text-xl mr-3 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  
                  {/* Text */}
                  <span className="font-semibold text-sm tracking-wide group-hover:translate-x-1 transition-transform duration-200">
                    {item.name}
                  </span>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-300 rounded-xl"></div>
                </motion.div>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </nav>

      {/* Footer */}
      <motion.div 
        variants={itemVariants}
        className="relative z-10 mt-8 pt-6 border-t border-white/10"
      >
        <div className="text-center">
          <div className="text-white/60 text-xs font-medium tracking-wider uppercase mb-2">
            Version 2.0
          </div>
          <div className="text-white/40 text-xs">
            &copy; 2025 Honda Aid
          </div>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute bottom-4 right-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
    </motion.div>
  );
} 