import "@/styles/globals.css";
import NavbarWrapper from "@/components/Navbar/NavbarWrapper";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

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
    creator: '@sourcedev',
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  verification: {

    google: 'verification-code',
  },
};

export const viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
};

// JSON-LD Structured Data for SEO
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SourceDev',
  alternateName: 'SourceDev - Yazılımcı Topluluğu',
  url: SITE_URL,
  description: 'Yazılımcılar için bilgi paylaşım ve networking platformu. Makaleler yaz, projelerini paylaş, topluluğa katıl.',
  inLanguage: 'tr-TR',
  publisher: {
    '@type': 'Organization',
    name: 'SourceDev',
    url: SITE_URL,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SourceDev',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/icon-512x512.png`,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://sourcedev-production.up.railway.app" />
        <link rel="dns-prefetch" href="https://sourcedev-production.up.railway.app" />
        <link rel="alternate" type="application/rss+xml" title="SourceDev RSS Feed" href="/feed.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`antialiased bg-brand-background`}>
        <LanguageProvider>
          <AuthProvider>
            <NavbarWrapper />
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
