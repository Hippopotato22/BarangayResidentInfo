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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const role = localStorage.getItem('role');
        router.push(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-900 dark:bg-gray-900 text-white">
        <div className="text-center">
          <svg className="animate-spin mx-auto mb-4 h-12 w-12 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <p className="text-lg font-semibold">Checking authentication...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-bg {
          background: linear-gradient(-45deg, #2C003E, #5A001F, #003B46, #001F27);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }
      `}</style>

      <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-900 dark:bg-gray-900 animated-bg">
       
        {/* SVG App Name with merged background shape */}
        <div className="mb-6 w-full max-w-4xl px-4">
        <svg
          viewBox="0 0 800 280"
          width="100%"
          height="auto"
          preserveAspectRatio="xMidYMid meet"
          aria-label="App name BRIS"
          role="img"
        >

<defs>
  {/* Vibrant animated gradient */}
  <linearGradient id="brisGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stopColor="#FF5733">
      <animate attributeName="offset" values="0;1;0" dur="6s" repeatCount="indefinite" />
    </stop>
    <stop offset="50%" stopColor="#FFC300">
      <animate attributeName="offset" values="0.5;1.5;0.5" dur="6s" repeatCount="indefinite" />
    </stop>
    <stop offset="100%" stopColor="#DAF7A6">
      <animate attributeName="offset" values="1;2;1" dur="6s" repeatCount="indefinite" />
    </stop>
  </linearGradient>
</defs>
 
  <defs>
    <linearGradient id="animatedTextGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#FF5733">
        <animate attributeName="offset" values="0;1;0" dur="8s" repeatCount="indefinite" />
      </stop>
      <stop offset="25%" stopColor="#7B1FA2">
        <animate attributeName="offset" values="0.25;1.25;0.25" dur="8s" repeatCount="indefinite" />
      </stop>
      <stop offset="50%" stopColor="#FFC300">
        <animate attributeName="offset" values="0.5;1.5;0.5" dur="8s" repeatCount="indefinite" />
      </stop>
      <stop offset="75%" stopColor="#7B1FA2">
        <animate attributeName="offset" values="0.75;1.75;0.75" dur="8s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stopColor="#DAF7A6">
        <animate attributeName="offset" values="1;2;1" dur="8s" repeatCount="indefinite" />
      </stop>
    </linearGradient>

    <mask id="text-mask" maskUnits="userSpaceOnUse">
      <text
          x="50%"
          y="70%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontFamily="AdoriaDemo"
          fontWeight="1200"
          fontSize="200"
          letterSpacing="10"
          fill="url(#brisGradient)"
          stroke="#000"
          strokeWidth="2"
          paintOrder="stroke"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.7))',
          }}
      >
        B.R.I.S
      </text>
    </mask>
  </defs>

  <defs>
  {/* Gradient that moves left to right */}
  <linearGradient id="gradientLeftToRight" x1="0%" y1="0%" x2="100%" y2="0%" spreadMethod="reflect">
    <stop offset="0%" stopColor="#7B1FA2" />
    <stop offset="33%" stopColor="#AB47BC" />
    <stop offset="66%" stopColor="#7B1FA2" />
    <stop offset="100%" stopColor="#AB47BC" />
    <animate attributeName="x1" values="0%;100%;0%" dur="10s" repeatCount="indefinite" />
    <animate attributeName="x2" values="100%;200%;100%" dur="10s" repeatCount="indefinite" />
  </linearGradient>

  {/* Diagonal gradient that moves diagonally for the shoulders */}
  <linearGradient id="gradientDiagonal" x1="0%" y1="0%" x2="100%" y2="100%" spreadMethod="reflect">
    <stop offset="0%" stopColor="#FF6F61" />    
    <stop offset="30%" stopColor="#FFB88C" />
    <stop offset="70%" stopColor="#FFD58C" />     
    <stop offset="100%" stopColor="#FF6F61" />     
    <animate attributeName="x1" values="0%;100%;0%" dur="12s" repeatCount="indefinite" />
    <animate attributeName="y1" values="0%;100%;0%" dur="12s" repeatCount="indefinite" />
    <animate attributeName="x2" values="100%;200%;100%" dur="12s" repeatCount="indefinite" />
    <animate attributeName="y2" values="100%;200%;100%" dur="12s" repeatCount="indefinite" />
  </linearGradient>
</defs>



<g transform="translate(280, 30) scale(1.6)">
  <circle
    cx="60"
    cy="40"
    r="50"
    fill="url(#gradientLeftToRight)"
    opacity="0.7"
    style={{
      animation: 'moveUpDown 6s ease-in-out infinite',
      transformOrigin: 'center',
    }}
  />
  <path
    d="M10 90 q80 70 110 0 q-10 -120 -110 0"
    fill="url(#gradientDiagonal)"
    opacity="0.7"
    style={{
      animation: 'moveLeftRight 8s ease-in-out infinite',
      transformOrigin: 'center',
    }}
  />
</g>

<style>{`
  @keyframes moveUpDown {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes moveLeftRight {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(10px); }
  }
`}</style>



  <text
    x="50%"
    y="70%"
    dominantBaseline="middle"
    textAnchor="middle"
    fontFamily="AdoriaDemo"
    fontWeight="1200"
    fontSize="200"
    letterSpacing="10"
    fill="url(#animatedTextGradient)"
    stroke="#000"
    strokeWidth="2"
    paintOrder="stroke"
    style={{
      filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.7))',
    }}
  >
    B.R.I.S
  </text>

  <rect
    x="50"
    y="70"
    width="800"
    height="200"
    fill="#FF4081"
    mask="url(#text-mask)"
    opacity="0.85"
  />
</svg>


          {/* Subtitle */}
          <h2
  style={{ fontFamily: 'AdoriaDemo', letterSpacing: '0.1em' }} // Adjust the value as needed
  className="text-2xl font-semibold text-white mt-4 mb-6"
>
  Barangay Resident Information System
</h2>

<p className=" text-xl text-white/80 mb-8 italic drop-shadow-md"
 style={{ fontFamily: 'qurovaBold', letterSpacing: '0.1em' }}>
          AURORA
        </p>

{/* <p className=" text-xl text-white/80 mb-8 italic drop-shadow-md"
 style={{ fontFamily: 'Breathing', letterSpacing: '0.1em' }}>
          Empowering community services with a modern and efficient system.
        </p> */}

        </div>

        <p className="text-lg font-semibold mb-2 drop-shadow-md max-w-md animated-gradient-text">
  Please login or register to continue.
</p>


 {/* Buttons for Login and Register */}
        <div className="flex flex-col sm:flex-row gap-5">
          <motion.div
            whileHover={{ scale: 1.07, boxShadow: '0 0 15px #7B1FA2' }}
            whileTap={{ scale: 0.95, boxShadow: '0 0 8px #6A1B9A' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <Link href="/auth/login">
              <button className="bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300 hover:bg-purple-800 shadow-md">
                Login
              </button>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.07, boxShadow: '0 0 15px #00796b' }}
            whileTap={{ scale: 0.95, boxShadow: '0 0 8px #004d40' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <Link href="/auth/register">
              <button className="bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300 hover:bg-teal-800 shadow-md">
                Register
              </button>
            </Link>
          </motion.div>
        </div>

        <footer className="mt-12 text-white/50 text-xs select-none">
          &copy; 2025 BRIS. All rights reserved.
        </footer>
      </main>
    </>
  );
}

