import TagPageClient from './TagPageClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sourcedev-production.up.railway.app/api';

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
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `#${displayName} | SourceDev`,
      description: description,
    },
  };
}

export default async function TagPage({ params }) {
  const { tagname } = await params;
  const initialTag = await getTag(tagname);

  return <TagPageClient tagname={tagname} initialTag={initialTag} />;
}

