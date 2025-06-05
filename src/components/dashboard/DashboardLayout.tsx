'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      <Sidebar />
      <main className="flex-1 min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 overflow-y-auto">
        {children}
      </main>
    </div>
  );
} 