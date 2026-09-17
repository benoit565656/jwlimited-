import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CampaignProvider } from '@/context/CampaignContext';
import { AgeGateModal } from '@/components/AgeGateModal';
import { AuthModal } from '@/components/AuthModal';
import { LightboxModal } from '@/components/LightboxModal';
import { VoteConfirmDialog } from '@/components/VoteConfirmDialog';

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://collectors.manila-wine.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Manila Wine Collector's Choice: A Philippines Edition, Chosen by You",
    description: '100 numbered bottles. One winning design. Vote for the design you would be proud to collect, display, or give.',
    url: '/',
    siteName: 'Manila Wine',
    images: [
      {
        url: '/concepts/full/concept-11.webp',
        width: 1536,
        height: 1024,
        alt: 'Johnnie Walker Blue Label Philippines Collector Edition Concept Preview',
      },
    ],
    locale: 'en_PH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Manila Wine Collector's Choice",
    description: '100 numbered bottles. One winning design. Vote for the Philippines limited edition.',
    images: ['/concepts/full/concept-11.webp'],
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
      <body className="min-h-screen bg-ink text-ivory antialiased selection:bg-wine selection:text-white">
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
