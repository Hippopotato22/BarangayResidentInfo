'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  // Check if the user has a saved theme preference in localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }

    // Check if the user is already logged in and redirect them
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const role = localStorage.getItem('role');
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user/dashboard');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setDarkMode(!darkMode);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-100 dark:bg-gray-800">
      {/* Animated Logo */}
      <motion.div
        className="w-32 h-32 relative mb-6"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        whileHover={{ scale: 1.1 }} // Hover effect on logo
      >
        <Image src="/house.png" alt="Barangay Logo" layout="fill" objectFit="contain" />
      </motion.div>

      <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white">Welcome to Barangay Info System</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Please login or register to continue.</p>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Login Button with Animation */}
        <motion.div
          whileHover={{ scale: 1.05, backgroundColor: '#2563EB' }} // Change background color on hover
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Link href="/auth/login">
            <button className="bg-blue-600 text-white px-6 py-2 rounded transition duration-300 hover:bg-blue-700">
              Login
            </button>
          </Link>
        </motion.div>

        {/* Register Button with Animation */}
        <motion.div
          whileHover={{ scale: 1.05, backgroundColor: '#10B981' }} // Change background color on hover
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Link href="/auth/register">
            <button className="bg-green-600 text-white px-6 py-2 rounded transition duration-300 hover:bg-green-700">
              Register
            </button>
          </Link>
        </motion.div>
      </div>

     
    </main>
      
  );
}


