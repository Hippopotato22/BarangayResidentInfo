// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';


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
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
