'use client';

import { useState, useCallback } from 'react';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const formatNickname = (name: string) =>
    name
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  const isNicknameValid = (name: string) => /^[a-zA-Z ]+$/.test(name.trim());

  const clearErrorOnChange = (value: string, setter: (v: string) => void) => {
    setter(value);
    if (errorMsg) setErrorMsg('');
  };

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg('');

      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const trimmedNickname = nickname.trim();

      if (!isNicknameValid(trimmedNickname)) {
        setErrorMsg('Nickname can only contain letters and spaces.');
        return;
      }

      setLoading(true);
      const toastId = toast.loading('Creating account...');

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: trimmedEmail,
          nickname: formatNickname(trimmedNickname),
          role: 'user',
        });

        await signOut(auth);

        toast.success('Registration successful! Redirecting to login...', { id: toastId });

        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } catch (error: any) {
        toast.dismiss(toastId);
        setLoading(false);

        if (error.code === 'auth/email-already-in-use') {
          setErrorMsg('That email is already registered. Try logging in instead.');
          toast.error('Email is already in use.');
        } else if (error.code === 'auth/weak-password') {
          setErrorMsg('Password should be at least 6 characters.');
          toast.error('Weak password. Must be at least 6 characters.');
        } else if (error.code === 'auth/invalid-email') {
          setErrorMsg('Invalid email address.');
          toast.error('Invalid email address.');
        } else {
          setErrorMsg('Registration failed. Please try again.');
          toast.error('Registration failed.');
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    },
    [email, password, nickname, router, errorMsg]
  );

  const handleCancel = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleNavigateToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-orange-200 to-yellow-100 px-4">
      <form
        onSubmit={handleRegister}
        className="flex flex-col w-full max-w-sm gap-4 p-6 bg-white shadow-md rounded-md"
        aria-label="Registration form"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800">Register</h2>

        {errorMsg && (
          <p
            className="text-red-600 text-center"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            {errorMsg}
          </p>
        )}

        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-black"
          onChange={(e) => clearErrorOnChange(e.target.value.trim(), setEmail)}
          value={email}
          required
          disabled={loading}
          aria-required="true"
          aria-invalid={!!errorMsg}
          autoComplete="email"
        />

        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-400 text-black"
            onChange={(e) => clearErrorOnChange(e.target.value, setPassword)}
            value={password}
            required
            disabled={loading}
            aria-required="true"
            aria-invalid={!!errorMsg}
            minLength={6}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-2 text-gray-600 hover:text-orange-600 transition focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
            disabled={loading}
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>

        <label htmlFor="nickname" className="sr-only">
          Nickname
        </label>
        <input
          id="nickname"
          type="text"
          placeholder="Nickname"
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-black"
          onChange={(e) => clearErrorOnChange(e.target.value, setNickname)}
          value={nickname}
          required
          disabled={loading}
          aria-required="true"
          aria-invalid={!!errorMsg}
          autoComplete="nickname"
        />

        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>

        <hr className="my-6" />

        <div className="text-center">
          <p className="text-sm text-gray-700 mb-2">Already have an account?</p>
          <button
            type="button"
            onClick={handleNavigateToLogin}
            className="text-orange-500 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-orange-400 rounded"
            disabled={loading}
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
