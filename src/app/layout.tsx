import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CampaignProvider } from '@/context/CampaignContext';
import { AgeGateModal } from '@/components/AgeGateModal';
import { AuthModal } from '@/components/AuthModal';
import { LightboxModal } from '@/components/LightboxModal';
import { VoteConfirmDialog } from '@/components/VoteConfirmDialog';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jwlimited.manila-wine.com';

export const metadata: Metadata = {
  title: "Manila Wine Collector's Choice | 100-Bottle Philippines Edition Vote",
  description: 'Help choose the design for a proposed 100-bottle Johnnie Walker Blue Label Philippines limited edition. Cast your vote and register your priority interest.',
  keywords: [
    'Manila Wine',
    'Collector Choice',
    'Johnnie Walker Blue Label Philippines',
    'Whisky Collector',
    'Philippines Limited Edition',
    'Numbered Bottles',
  ],
  authors: [{ name: 'Manila Wine' }],
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: "Manila Wine Collector's Choice | 100-Bottle Philippines Edition",
    description: '100 numbered bottles. One winning design. Vote for the design you would be proud to collect, display, or give.',
    url: APP_URL,
    siteName: 'Manila Wine',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: "Manila Wine Collector's Choice — Proposed Philippines Edition",
      },
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: "Manila Wine Collector's Choice — Proposed Philippines Edition",
      },
    ],
    locale: 'en_PH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Manila Wine Collector's Choice | 100-Bottle Philippines Edition",
    description: '100 numbered bottles. One winning design. Vote for the Philippines limited edition.',
    images: [`${APP_URL}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#141414',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Oswald:wght@500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
      </head>
      <body className="min-h-screen bg-ink text-ivory font-sans antialiased selection:bg-gold selection:text-ink">
        <CampaignProvider>
          {children}
          <AgeGateModal />
          <AuthModal />
          <LightboxModal />
          <VoteConfirmDialog />
        </CampaignProvider>
      </body>
    </html>
  );
}
