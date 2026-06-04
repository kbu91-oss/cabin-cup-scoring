import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { CountdownBanner } from '@/components/CountdownBanner';
import { StoreProvider } from '@/lib/store';

export const metadata: Metadata = {
  metadataBase: new URL('https://cabin-cup-scoring.vercel.app'),
  title: 'Cabin Cup 2026',
  description: 'Live scoreboard for the Cabin Cup — Pour It On',
  openGraph: {
    title: 'Cabin Cup 2026',
    description: 'Live scoreboard · Pour It On · June 11–14',
    url: 'https://cabin-cup-scoring.vercel.app',
    siteName: 'Cabin Cup',
    images: [
      {
        url: '/cabin-cup-og.png',
        width: 512,
        height: 512,
        alt: 'Cabin Cup logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary', // square thumbnail (iMessage uses this style)
    title: 'Cabin Cup 2026',
    description: 'Live scoreboard · Pour It On · June 11–14',
    images: ['/cabin-cup-og.png'],
  },
  // favicon comes from src/app/favicon.ico automatically (25KB).
  // apple-touch-icon for iOS bookmarks; fine to use the 1024x1024 since it's only
  // fetched when a user adds the site to their home screen.
  icons: {
    apple: '/cabin-cup-logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // respect iPhone notch / safe areas
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Inter via Google Fonts <link> — avoids any next/font runtime fetch issues */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <SiteHeader />
          <CountdownBanner />
          <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
            {children}
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
