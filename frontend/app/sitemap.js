const SITE_URL = 'https://sourcedev.tr';
const SITEMAP_REVALIDATE_SECONDS = 3600;
const PAGINATION_PAGE_SIZE = 200;
const MAX_PAGES = 100;

// Safe date parser - returns current date if invalid
function safeDate(dateString) {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
}

async function fetchAllPaginatedItems(buildUrl) {
  const allItems = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await fetch(buildUrl(page, PAGINATION_PAGE_SIZE), {
      next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    });

    if (!response.ok) break;

    const data = await response.json();
    const pageItems = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

    if (pageItems.length === 0) break;

    allItems.push(...pageItems);

    if (pageItems.length < PAGINATION_PAGE_SIZE) break;
  }

  return allItems;
}

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
    const posts = await fetchAllPaginatedItems(
      (page, pageSize) => `${API_URL}/post/latest?page=${page}&pageSize=${pageSize}`
    );

    if (posts.length > 0) {
      const seenSlugs = new Set();
      postPages = posts
        .filter((post) => post.slug) // Only include posts with slugs
        .filter((post) => {
          if (seenSlugs.has(post.slug)) return false;
          seenSlugs.add(post.slug);
          return true;
        })
        .map((post) => ({
          url: `${SITE_URL}/post/${post.slug}`,
          lastModified: safeDate(post.updatedAt || post.createdAt),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
    }

    // Fetch tags for sitemap
    const tagsRes = await fetch(`${API_URL}/tag`, {
      next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    });
    
    if (tagsRes.ok) {
      const tags = await tagsRes.json();
      tagPages = (tags || []).map((tag) => ({
        url: `${SITE_URL}/tag/${tag.slug || encodeURIComponent(tag.name)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      }));
    }

    // Fetch users for sitemap
    const users = await fetchAllPaginatedItems(
      (page, pageSize) => `${API_URL}/users?page=${page}&pageSize=${pageSize}`
    );

    if (users.length > 0) {
      const seenUsers = new Set();
      userPages = users
        .filter((user) => user.username)
        .filter((user) => {
          if (seenUsers.has(user.username)) return false;
          seenUsers.add(user.username);
          return true;
        })
        .map((user) => ({
        url: `${SITE_URL}/user/${encodeURIComponent(user.username)}`,
        lastModified: safeDate(user.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Sitemap fetch error:', error);
  }

  return [...staticPages, ...postPages, ...tagPages, ...userPages];
}
