// frontend/src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter font
import "./globals.css"; // Your global CSS file (e.g., Tailwind CSS output)
import { Toaster } from 'react-hot-toast'; // Import Toaster from react-hot-toast
import Navbar from '@/components/Navbar'; // Import the Navbar component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cloneflix",
  description: "A Netflix-like movie recommendation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the Inter font to the body */}
      <body className={inter.className}>
        {/* Navbar component will appear at the top of every page */}
        <Navbar />
        {children}
        {/* Toaster component for displaying notifications throughout the app */}
        <Toaster
          position="top-right" // You can change the position
          reverseOrder={false}
          toastOptions={{
            // Define default options for all toasts
            className: '',
            duration: 3000, // Duration in milliseconds
            style: {
              background: '#333',
              color: '#fff',
            },
            // Options for specific types of toasts
            success: {
              duration: 3000,
            },
            error: {
                duration: 5000,
            },
          }}
        />
      </body>
    </html>
  );
}
