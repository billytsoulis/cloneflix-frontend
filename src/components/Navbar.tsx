// frontend/src/app/components/Navbar.tsx

"use client"; // This is a client component as it uses hooks

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/api'; // Import the logout API function
import toast from 'react-hot-toast'; // For notifications

export default function Navbar() {
  const router = useRouter();
  const [loadingLogout, setLoadingLogout] = useState(false);

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await logoutUser(); // Call the logout API
      toast.success("Logged out successfully!");
      router.push('/login'); // Redirect to the login page after logout
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Logout failed.");
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand */}
        <Link href="/" passHref>
          <div className="text-red-600 text-3xl font-bold cursor-pointer hover:text-red-500 transition-colors duration-200">
            Cloneflix
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link href="/" passHref>
            <div className="text-gray-300 hover:text-white text-lg font-medium transition-colors duration-200 cursor-pointer">
              Home
            </div>
          </Link>
          <Link href="/profile" passHref>
            <div className="text-gray-300 hover:text-white text-lg font-medium transition-colors duration-200 cursor-pointer">
              Profile
            </div>
          </Link>
          {/* New: Link to the Watchlist page */}
          <Link href="/watchlist" passHref>
            <div className="text-gray-300 hover:text-white text-lg font-medium transition-colors duration-200 cursor-pointer">
              My Watchlist
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className="px-4 py-2 text-md font-semibold rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingLogout ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </nav>
  );
}
