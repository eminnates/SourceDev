import "@/styles/globals.css";
import NavbarWrapper from "@/components/Navbar/NavbarWrapper";
import { AuthProvider } from "@/context/AuthContext";

const SITE_URL = 'https://sourcedev.tr';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SourceDev - Yazılımcı Topluluğu',
    template: '%s | SourceDev',
  },
  description: 'Yazılımcılar için bilgi paylaşım ve networking platformu. Makaleler yaz, projelerini paylaş, topluluğa katıl.',
  keywords: ['yazılım', 'programlama', 'developer', 'geliştirici', 'blog', 'teknoloji', 'kodlama', 'web development'],
  authors: [{ name: 'SourceDev Team' }],
  creator: 'SourceDev',
  publisher: 'SourceDev',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_URL,
    siteName: 'SourceDev',
    title: 'SourceDev - Yazılımcı Topluluğu',
    description: 'Yazılımcılar için bilgi paylaşım ve networking platformu.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SourceDev - Yazılımcı Topluluğu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SourceDev - Yazılımcı Topluluğu',
    description: 'Yazılımcılar için bilgi paylaşım ve networking platformu.',
    images: ['/og-image.png'],
    creator: '@soucedev',
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  verification: {
    // Google Search Console verification (kullanıcı ekleyecek)
    // google: 'verification-code',
  },
};

export const viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased bg-brand-background`}>
        <AuthProvider>
          <NavbarWrapper />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
