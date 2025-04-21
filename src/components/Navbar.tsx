'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/');
  };

 return (
  <nav className="bg-gradient-to-b from-black/40 to-black/10 text-white p-4 fixed top-0 left-0 w-full z-50">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">
        Barangay Info System
      </Link>
      <div className="flex gap-6">
        {user ? (
          <>
            <Link
              href={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
              className="hover:underline"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="hover:underline">
              Login
            </Link>
            <Link href="/auth/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  </nav>
);

}
