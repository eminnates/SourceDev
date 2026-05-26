import UserProfileClient from './UserProfileClient';
import { buildLocalizedMetadata, resolveLang } from '@/utils/seo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sourcedev-production.up.railway.app/api';
const SITE_URL = 'https://sourcedev.tr';

async function getUser(username) {
  try {
    // Search for user
    const res = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(username)}`, {
      next: { revalidate: 60 },
    });
    
    if (res.ok) {
      const users = await res.json();
      const user = users?.find(u => u.username?.toLowerCase() === username.toLowerCase());
      if (user) return user;
    }

    // Fallback to all users
    const allRes = await fetch(`${API_URL}/users`, {
      next: { revalidate: 60 },
    });
    
    if (allRes.ok) {
      const allUsers = await allRes.json();
      return allUsers?.find(u => u.username?.toLowerCase() === username.toLowerCase()) || null;
    }
  } catch (error) {
    console.error('Error fetching user for metadata:', error);
  }
  return null;
}

export async function generateMetadata({ params, searchParams }) {
  const { username } = await params;
  const user = await getUser(username);
  const lang = await resolveLang(searchParams);
  
  if (!user) {
    return {
      title: lang === 'tr' ? 'Kullanıcı bulunamadı' : 'User not found',
      description: lang === 'tr' ? 'Aradığınız kullanıcı bulunamadı.' : 'The user you are looking for could not be found.',
    };
  }

  const displayName = user.displayName || user.username;
  const bio = user.bio || (lang === 'tr'
    ? `${displayName}, SourceDev üzerinde yazı paylaşan ve topluluk tartışmalarına katkı sunan bir üye.`
    : `${displayName} is a SourceDev member who shares posts and contributes to community discussions.`);

  return buildLocalizedMetadata({
    searchParams,
    pathname: `/user/${user.username}`,
    titleEn: `${displayName} (@${user.username}) profile`,
    titleTr: `${displayName} (@${user.username}) profil sayfası`,
    descriptionEn: bio,
    descriptionTr: bio,
    type: 'profile',
    images: user.profilePictureUrl ? [{ url: user.profilePictureUrl, alt: displayName }] : [],
    extra: {
      openGraph: {
        profile: {
          username: user.username,
        },
      },
    },
  });
}

// JSON-LD Structured Data for Person
function generatePersonJsonLd(user) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.displayName || user.username,
    alternateName: user.username,
    description: user.bio || undefined,
    image: user.profilePictureUrl || undefined,
    url: `${SITE_URL}/user/${user.username}`,
    sameAs: [
      user.githubUrl,
      user.twitterUrl,
      user.linkedinUrl,
      user.websiteUrl,
    ].filter(Boolean),
    jobTitle: user.work || undefined,
    worksFor: user.company ? {
      '@type': 'Organization',
      name: user.company,
    } : undefined,
    knowsAbout: user.skills?.split(',').map(s => s.trim()).filter(Boolean) || undefined,
  };
}

export default async function UserProfilePage({ params }) {
  const { username } = await params;
  const initialUser = await getUser(username);

  const jsonLd = initialUser ? generatePersonJsonLd(initialUser) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <UserProfileClient username={username} initialUser={initialUser} />
    </>
  );
}

