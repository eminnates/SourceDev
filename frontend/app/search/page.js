import SearchClient from './SearchClient';
import { buildLocalizedMetadata } from '@/utils/seo';

export async function generateMetadata({ searchParams }) {
  const query = String(searchParams?.q || '').trim();
  const category = searchParams?.category || 'posts';

  return buildLocalizedMetadata({
    searchParams,
    pathname: '/search',
    titleEn: query ? `Search results for ${query}` : 'Search posts, tags, and users',
    titleTr: query ? `${query} için arama sonuçları` : 'Yazıları, etiketleri ve kullanıcıları ara',
    descriptionEn: query
      ? `Search SourceDev for ${query} across ${category}.`
      : 'Search SourceDev posts, tags, comments, and users.',
    descriptionTr: query
      ? `SourceDev üzerinde ${query} ile ilgili ${category} sonuçlarını arayın.`
      : 'SourceDev üzerinde yazılar, etiketler, yorumlar ve kullanıcılar arasında arama yapın.',
    noindex: true,
    canonicalParams: query ? { q: query, category } : {},
  });
}

export default function SearchPage() {
  return <SearchClient />;
}
