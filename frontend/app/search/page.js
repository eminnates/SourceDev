import SearchClient from './SearchClient';

export const metadata = {
  title: 'Search Posts, Tags and Users',
  description: 'Search for posts, tags, and developers on SourceDev. Find the software content and people you are looking for.',
  robots: { index: false, follow: false },
};

export default function SearchPage() {
  return <SearchClient />;
}
