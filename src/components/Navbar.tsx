'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser  } from './UserContext';
import { Pencil, Save, X, Loader2 } from 'lucide-react';

export default function Navbar() {
  const { nickname, setNickname, user, setUser  } = useUser ();
  const [saving, setSaving] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      setUser (null);
      setNickname(null);
      setShowModal(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const cancelLogout = () => setShowModal(false);

  // Start editing nickname
  const startEditing = () => {
    setNicknameInput(nickname || '');
    setEditingNickname(true);
  };

  // Cancel editing nickname
  const cancelEditing = () => {
    setEditingNickname(false);
    setNicknameInput('');
  };

  // Save new nickname to Firestore
  const saveNickname = async () => {
    if (!nicknameInput.trim()) {
      alert('Nickname cannot be empty');
      return;
    }
    if (!user || saving) return;  // prevent double saving

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { nickname: nicknameInput.trim() });
      setNickname(nicknameInput.trim());
      setEditingNickname(false);
    } catch (error) {
      console.error('Failed to update nickname:', error);
      alert('Failed to update nickname. Please try again.');
    }
    setSaving(false);
  };

  if (pathname === '/' || pathname.includes('/residents')) return null;

  return (
    <>
      <nav
        className={`bg-gradient-to-b from-black/40 to-black/10 text-white p-4 fixed top-0 left-0 w-full z-50 shadow-lg transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap">
          <h1
            className="text-4xl md:text-6xl font-bold animated-gradient-text"
            style={{ fontFamily: 'AdoriaDemo', letterSpacing: '0.1em' }}
          >
            B.R.I.S
          </h1>

          <div className="flex gap-4 items-center">
            {user && nickname && (
              <div
                className="text-xl md:text-3xl text-white font-semibold hidden md:flex items-center gap-2"
                style={{ fontFamily: 'hellonewyork', letterSpacing: '0.1em' }}
              >
                {!editingNickname ? (
                  <>
                    <span>Hello, {nickname}</span>
                    <button
                      onClick={startEditing}
                      className="p-1 hover:bg-blue-600 hover:bg-opacity-40 rounded transition"
                      aria-label="Edit nickname"
                    >
                      <Pencil size={16} className="text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      className="px-2 py-1 rounded text-white"
                      maxLength={20}
                      aria-label="Edit nickname input"
                    />
                    <button
                      onClick={saveNickname}
                      className="p-1 bg-green-600 hover:bg-green-700 rounded transition disabled:opacity-50"
                      aria-label="Save nickname"
                      disabled={saving}
                    >
                      {saving ? <Loader2 size={16} className="animate-spin text-white" /> : <Save size={16} className="text-white" />}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 bg-gray-400 hover:bg-gray-500 rounded transition"
                      aria-label="Cancel editing nickname"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </>
                )}
              </div>
            )}
            {user ? (
              <>
                <Link
                  href={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
                  className="bg-orange-600 px-4 py-2 rounded hover:bg-orange-700 transition"
                  aria-label="Dashboard"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-transparent text-white px-4 py-2 rounded hover:bg-red-600 hover:text-white transition"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:underline px-4 py-2 rounded" aria-label="Login">
                  Login
                </Link>
                <Link href="/auth/register" className="hover:underline px-4 py-2 rounded" aria-label="Register">
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
                  disabled={isLoggingOut}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-70"
                >
                  {isLoggingOut && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                  )}
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
