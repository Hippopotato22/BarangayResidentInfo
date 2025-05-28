'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.data()?.role;
        router.replace(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading('Logging in...');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const role = userDoc.data()?.role;

      toast.success('Login successful!', { id: toastId });
      router.push(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (error: any) {
      toast.dismiss(toastId);
      const errorCode = error.code;
      const messageMap: Record<string, string> = {
        'auth/invalid-credential': 'Invalid email or password',
        'auth/user-not-found': 'Invalid email or password',
        'auth/wrong-password': 'Invalid email or password',
        'auth/too-many-requests': 'Too many failed attempts. Try again later.',
        'auth/network-request-failed': 'Network error. Check your connection.',
      };
      const msg = messageMap[errorCode] || 'Login failed. Please try again.';
      toast.error(msg);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Please enter your email to reset password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Please check your inbox.');
      setForgotPasswordMode(false);
    } catch (error: any) {
      const errorCode = error.code;
      if (errorCode === 'auth/user-not-found') {
        toast.error('No user found with this email.');
      } else if (errorCode === 'auth/invalid-email') {
        toast.error('Invalid email address.');
      } else {
        toast.error('Failed to send reset email. Try again later.');
      }
      console.error(error);
    }
  };

  const handleCancel = () => router.push('/');

  if (loading) return <div className="text-center py-8 text-lg font-medium">Checking session...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 px-4">
      <form
        onSubmit={forgotPasswordMode ? (e) => e.preventDefault() : handleLogin}
        className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-lg space-y-5"
      >
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-blue-700">{forgotPasswordMode ? 'Reset Password' : 'Login'}</h2>
          <p className="text-sm text-gray-500">
            {forgotPasswordMode
              ? 'Enter your email and we will send you a link to reset your password.'
              : 'Welcome back! Please enter your credentials.'}
          </p>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="mt-1 w-full px-4 py-2 border rounded-md shadow-sm text-black focus:ring-2 focus:ring-blue-400 outline-none"
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            value={email}
            required
          />
        </div>

        {!forgotPasswordMode && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-4 py-2 pr-10 border rounded-md shadow-sm text-black focus:ring-2 focus:ring-blue-400 outline-none"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                value={password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-blue-600 mt-1">
          {forgotPasswordMode ? (
            <>
              <button
                type="button"
                onClick={handleResetPassword}
                className="font-semibold hover:underline"
              >
                Send reset email
              </button>
              <button
                type="button"
                onClick={() => setForgotPasswordMode(false)}
                className="hover:underline"
              >
                Back to login
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setForgotPasswordMode(true)}
                className="hover:underline"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => router.push('/auth/register')}
                className="hover:underline"
              >
                Create account
              </button>
            </>
          )}
        </div>

        <div className="flex justify-between pt-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition"
          >
            Cancel
          </button>
          {!forgotPasswordMode && (
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-md bg-blue-600 text-white transition hover:bg-blue-700 ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
