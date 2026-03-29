import TagPageClient from './TagPageClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sourcedev-production.up.railway.app/api';
const SITE_URL = 'https://sourcedev.tr';

async function getTag(tagname) {
  try {
    const res = await fetch(`${API_URL}/tag/${encodeURIComponent(tagname)}`, {
      next: { revalidate: 60 },
    });
    
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error('Error fetching tag for metadata:', error);
  }
  return null;
}

export async function generateMetadata({ params }) {
  const { tagname } = await params;
  const tag = await getTag(tagname);
  
  const displayName = tag?.name || tagname;
  const description = tag?.description || `#${displayName} etiketli yazılım makaleleri ve tartışmaları`;

  return {
    title: `#${displayName}`,
    description: description,
    openGraph: {
      title: `#${displayName} | SourceDev`,
      description: description,
      url: `${SITE_URL}/tag/${tagname}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `#${displayName} | SourceDev`,
      description: description,
    },
    alternates: {
      canonical: `${SITE_URL}/tag/${tagname}`,
    },
  };
}

export default async function TagPage({ params }) {
  const { tagname } = await params;
  const initialTag = await getTag(tagname);

  const displayName = initialTag?.name || tagname;
  const description = initialTag?.description || `#${displayName} etiketli yazılım makaleleri ve tartışmaları`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `#${displayName} makaleleri`,
    description: description,
    url: `${SITE_URL}/tag/${tagname}`,
    isPartOf: { '@id': SITE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TagPageClient tagname={tagname} initialTag={initialTag} />
    </>
  );
}

