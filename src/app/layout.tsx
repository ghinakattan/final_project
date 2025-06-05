import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Outfit } from "next/font/google";
import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Honda Aid Dashboard",
  description: "Dashboard for managing Honda car repair and maintenance services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
          {children}
        </div>
      </body>
    </html>
  );
}
