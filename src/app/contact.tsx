// pages/contact.js

import Link from 'next/link';

export default function Contact() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-lg mb-6">
        If you have any questions or feedback, feel free to reach out to us at:
      </p>
      <p className="text-lg mb-4">Email: support@bris.com</p>
      <p className="text-lg mb-6">Phone: (123) 456-7890</p>
      <Link href="/" className="text-purple-500 hover:underline">
        Go back to Home
      </Link>
    </main>
  );
}
