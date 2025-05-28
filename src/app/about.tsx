// pages/about.js

import Link from 'next/link';

export default function About() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">About Us</h1>
      <p className="text-lg mb-6">
        Welcome to the Barangay Resident Information System (BRIS). Our mission is to empower communities with efficient and modern services.
      </p>
      <Link href="/" className="text-purple-500 hover:underline">
        Go back to Home
      </Link>
    </main>
  );
}
