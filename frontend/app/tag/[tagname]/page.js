import TagPageClient from './TagPageClient';
import InternalPostLinks from '@/components/SEO/InternalPostLinks';
import { buildLocalizedMetadata, resolveLang } from '@/utils/seo';

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

async function getTagPosts(tagname, page = 1, pageSize = 20) {
  try {
    const res = await fetch(`${API_URL}/post/tag/${encodeURIComponent(tagname)}?page=${page}&pageSize=${pageSize}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  } catch (error) {
    console.error('Error fetching tag posts for SEO links:', error);
    return [];
  }
}

export async function generateMetadata({ params, searchParams }) {
  const { tagname } = await params;
  const tag = await getTag(tagname);
  const lang = await resolveLang(searchParams);
  
  const displayName = tag?.name || tagname;
  const description = tag?.description || (lang === 'tr'
    ? `#${displayName} etiketindeki yazılım makalelerini, kaynakları ve topluluk tartışmalarını keşfedin.`
    : `Explore the software articles, resources, and community discussions tagged #${displayName}.`);

  return buildLocalizedMetadata({
    searchParams,
    pathname: `/tag/${tagname}`,
    titleEn: `#${displayName} posts and resources`,
    titleTr: `#${displayName} yazıları ve kaynakları`,
    descriptionEn: description,
    descriptionTr: description,
    canonicalParams: {},
  });
}

export default async function TagPage({ params }) {
  const { tagname } = await params;
  const initialTag = await getTag(tagname);
  const tagPosts = await getTagPosts(tagname, 1, 20);

  const displayName = initialTag?.name || tagname;
  const description = initialTag?.description || `#${displayName} etiketindeki yazılım makalelerini, kaynakları ve topluluk tartışmalarını keşfedin.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `#${displayName} yazıları ve kaynakları`,
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
      <InternalPostLinks
        title={`#${displayName} sayfasındaki yazılar`}
        posts={tagPosts}
        maxLinks={12}
      />
    </>
  );
}

