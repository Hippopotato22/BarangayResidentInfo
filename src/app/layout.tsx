// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from '@/components/UserContext'; // ✅ make sure the path is correct

export const metadata: Metadata = {
  title: 'Barangay Resident Info System',
  description: 'Manage barangay residents efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <UserProvider>
          <Navbar />
          <Toaster position="top-center" reverseOrder={false} />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
