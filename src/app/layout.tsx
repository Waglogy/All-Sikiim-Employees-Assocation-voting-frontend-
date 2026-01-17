import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ASGEA Voting Platform',
  description: 'Official Voting Platform for Sikkim Government Employees Association',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ flex: 1, padding: '2rem 0' }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
