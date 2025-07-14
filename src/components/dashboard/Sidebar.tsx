'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Users', href: '/dashboard/users' },
  { name: 'Categories', href: '/dashboard/categories' },
  { name: 'Products', href: '/dashboard/products' },
  { name: 'Services', href: '/dashboard/services' },
  { name: 'Offers', href: '/dashboard/offers' },
  { name: 'Orders', href: '/dashboard/orders' },
  { name: 'Reservations', href: '/dashboard/reservations' },
  { name: 'Analytics', href: '/dashboard/analytics' },
  { name: 'Settings', href: '/dashboard/settings' },
  
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gradient-to-br from-slate-900 to-gray-900 text-white flex flex-col p-6 shadow-2xl border-r border-white/10">
      <div className="text-3xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">HondaAide</div>
      <nav className="flex-grow">
        <ul>
          {navigation.map((item) => (
            <li key={item.name} className="mb-3">
              <Link href={item.href} className={
                `flex items-center px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${pathname === item.href 
                  ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/20'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`
              }>
                <span className="font-semibold text-lg">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-8 pt-4 border-t border-white/10 text-center text-white/50 text-sm">
        &copy; 2025 HondaAide
      </div>
    </div>
  );
} 