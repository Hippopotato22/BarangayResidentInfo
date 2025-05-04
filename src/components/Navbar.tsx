'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setNickname(userData.nickname || null);
        }
      } else {
        setUser(null);
        setNickname(null);
        setShowModal(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setNickname(null);
    setShowModal(false);
    router.push('/');
  };

  const cancelLogout = () => setShowModal(false);

  if (pathname === '/') return null;

  return (
    <>
      <nav className="bg-gradient-to-b from-black/40 to-black/10 text-white p-4 fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex-1 flex justify-center">
            <Link href="/" className="relative group flex left-26 gap-2 ">
              <Image
                src="/house.png"
                alt="Dashboard Icon"
                width={48}
                height={48}
                className="rounded"
                
              />
            </Link>
          </div>

          <div className="flex gap-4 items-center">
          {user && nickname && (
              <span className="text-sm text-white font-semibold hidden md:block">
                Hello, {nickname}
              </span>
            )}
            {user ? (
              <>
                <Link
                  href={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
                  className="bg-orange-600 px-4 py-2 rounded hover:bg-orange-700 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => setShowModal(true)}
                  className="hover:bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:underline px-4 py-2 rounded">
                  Login
                </Link>
                <Link href="/auth/register" className="hover:underline px-4 py-2 rounded">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-6 rounded-md shadow-md w-80 text-center"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Logout</h2>
              <p className="text-gray-700 mb-6">Are you sure you want to log out?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={cancelLogout}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
