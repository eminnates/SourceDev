export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/settings/',
          '/create-post/',
          '/drafts/',
          '/change-password/',
          '/forgot-password/',
        ],
      },
    ],
    sitemap: 'https://sourcedev.tr/sitemap.xml',
  };
}
