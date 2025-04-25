'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        nickname: nickname.charAt(0).toUpperCase() + nickname.slice(1),
        role: 'user', // default role is always "user"
      });

      router.push('/auth/login');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('That email is already registered. Try logging in instead.');
      } else {
        setErrorMsg('Registration failed. Please try again.');
        console.error(error);
      }
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-orange-200 to-yellow-100">
      <form onSubmit={handleRegister} className="flex flex-col w-full max-w-sm gap-4 p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Register</h2>

        {errorMsg && <p className="text-red-600 text-center">{errorMsg}</p>}

        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-black"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-black"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nickname"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-black"
          onChange={(e) => setNickname(e.target.value)}
          required
        />

        {/* No role selection shown here */}

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
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
