import type { Metadata, Viewport } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ClientOnly } from '@/components/ClientOnly';
import { BottomNav } from '@/components/BottomNav';
import { Bootstrap } from '@/components/Bootstrap';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Yo Savings - Your savings, earning more',
  description: 'Open a savings account in 30 seconds. Earn competitive interest rates, automatically.',
  keywords: ['savings', 'interest', 'earn', 'money', 'finance'],
  authors: [{ name: 'Yo Protocol' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Yo Savings',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable}`}>
      <body style={{ minHeight: '100vh' }} className="bg-white">
        <ClientOnly>
          <Providers>
            <Bootstrap />
            <div className="min-h-screen pb-20 lg:pb-0">
              <main className="container mx-auto px-4 py-6 max-w-md lg:max-w-2xl">
                {children}
              </main>
              <BottomNav />
            </div>
          </Providers>
        </ClientOnly>
      </body>
    </html>
  );
}
