'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';


export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState<string | null>(null);
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
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setNickname(null);
    router.push('/');
  };

  return (
    <nav className="bg-gradient-to-b from-black/40 to-black/10 text-white p-4 fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex-1 flex justify-center">
      {pathname !== '/' && (
        <Link 
        
        className="relative group flex items-center gap-2"
        href='/'>
           
        <Image
          src="/house.png"
          alt="Dashboard Icon"
          width={40}
          height={40}
          className="rounded"
          
        />
        </Link>
         )}
        </div>

        <div className="flex gap-6">
          {user ? (
            <>
              <Link
                href={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
                className="hover:underline"
              >
                
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
              
              </Link>
              <Link href="/auth/register" className="hover:underline">
                
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
