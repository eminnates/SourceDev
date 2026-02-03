import UserProfileClient from './UserProfileClient';

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

export async function generateMetadata({ params }) {
  const { username } = await params;
  const user = await getUser(username);
  
  if (!user) {
    return {
      title: 'Kullanıcı Bulunamadı',
      description: 'Aradığınız kullanıcı bulunamadı.',
    };
  }

  const displayName = user.displayName || user.username;
  const bio = user.bio || `${displayName} - SourceDev üyesi`;

  return {
    title: `${displayName} (@${user.username})`,
    description: bio,
    openGraph: {
      title: `${displayName} (@${user.username}) | SourceDev`,
      description: bio,
      url: `${SITE_URL}/user/${user.username}`,
      type: 'profile',
      images: user.profilePictureUrl ? [user.profilePictureUrl] : [],
      profile: {
        username: user.username,
      },
    },
    twitter: {
      card: 'summary',
      title: `${displayName} (@${user.username})`,
      description: bio,
      images: user.profilePictureUrl ? [user.profilePictureUrl] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/user/${user.username}`,
    },
  };
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

