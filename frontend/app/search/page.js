import SearchClient from './SearchClient';

export const metadata = {
  title: 'Arama',
  description: 'SourceDev\'de yazı, etiket ve kullanıcı ara.',
  robots: { index: false, follow: false },
};

export default function SearchPage() {
  return <SearchClient />;
}
