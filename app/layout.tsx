import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ClientOnly } from '@/components/ClientOnly';
import { BottomNav } from '@/components/BottomNav';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Stash - Your savings, earning more',
  description: 'Open a savings account in 30 seconds. Earn competitive interest rates, automatically.',
  keywords: ['savings', 'interest', 'earn', 'money', 'finance'],
  authors: [{ name: 'Stash Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Stash',
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
  themeColor: '#F8FAFC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body style={{ minHeight: '100vh' }}>
        <ClientOnly>
          <Providers>
            <div className="min-h-screen pb-20 lg:pb-0">
              <main className="container mx-auto px-4 py-6 max-w-md lg:max-w-2xl">
                {children}
              </main>
              <BottomNav />
            </div>
          </Providers>
        </ClientOnly>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Recover from chunk load failures (stale cache or adblocker)
            window.addEventListener('error', function(e) {
              if (e.message && (e.message.includes('ChunkLoadError') || e.message.includes('Failed to load chunk') || e.message.includes('Loading chunk'))) {
                if (!sessionStorage.getItem('chunk_reload')) {
                  sessionStorage.setItem('chunk_reload', '1');
                  window.location.reload();
                }
              }
            });
            // Register service worker
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) {
                  // Force update check on page load
                  reg.update();
                })
                .catch(function() {});
            }
          `
        }} />
      </body>
    </html>
  );
}