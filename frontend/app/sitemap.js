const SITE_URL = 'https://sourcedev.tr';

export default async function sitemap() {
  // Static pages
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/latest`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/hot`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ];

  // Fetch dynamic content from API
  let postPages = [];
  let tagPages = [];
  let userPages = [];

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sourcedev-production.up.railway.app/api';

    // Fetch posts for sitemap
    const postsRes = await fetch(`${API_URL}/post/latest?page=1&pageSize=500`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (postsRes.ok) {
      const posts = await postsRes.json();
      postPages = (posts || []).map((post) => ({
        url: `${SITE_URL}/post/${post.id}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.createdAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }

    // Fetch tags for sitemap
    const tagsRes = await fetch(`${API_URL}/tag`, {
      next: { revalidate: 3600 },
    });
    
    if (tagsRes.ok) {
      const tags = await tagsRes.json();
      tagPages = (tags || []).map((tag) => ({
        url: `${SITE_URL}/tag/${tag.name}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      }));
    }

    // Fetch users for sitemap
    const usersRes = await fetch(`${API_URL}/users?page=1&pageSize=500`, {
      next: { revalidate: 3600 },
    });
    
    if (usersRes.ok) {
      const users = await usersRes.json();
      userPages = (users || []).map((user) => ({
        url: `${SITE_URL}/user/${user.username}`,
        lastModified: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Sitemap fetch error:', error);
  }

  return [...staticPages, ...postPages, ...tagPages, ...userPages];
}
