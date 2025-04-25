'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.data()?.role;

        if (role === 'admin') router.replace('/admin/dashboard');
        else router.replace('/user/dashboard');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const role = userDoc.data()?.role;

      if (role === 'admin') router.push('/admin/dashboard');
      else router.push('/user/dashboard');
    } catch (error: any) {
      alert(error.message || 'Login failed');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <form onSubmit={handleLogin} className="flex flex-col w-full max-w-sm gap-4 p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
