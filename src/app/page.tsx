// frontend/src/app/page.tsx

"use client"; // This is a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/api'; 
import toast from 'react-hot-toast'; // For notifications

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // You might want to add some logic here to check if the user is actually authenticated
  // For now, we're assuming they are if they landed on this page.
  // In a real app, you'd fetch user data or validate session/cookie.
  useEffect(() => {
    // Example: Potentially redirect if no token/session is found (though HttpOnly makes this harder client-side)
    // This typically happens on the server-side with middleware or a session check.
    // For now, this page is assumed to be accessible after successful login.
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser(); // Call the logout API
      toast.success("Logged out successfully!");
      router.push('/login'); // Redirect to the login page after logout
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Logout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900 text-white font-inter">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-red-600 mb-4">Welcome to Cloneflix!</h1>
        <p className="text-xl text-gray-300 mb-8">
          You are now logged in. Enjoy your personalized recommendations!
        </p>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="px-6 py-3 text-lg font-semibold rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
}
