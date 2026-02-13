const SITE_URL = 'https://sourcedev.tr';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sourcedev-production.up.railway.app/api';

/**
 * RSS Feed Route Handler
 * 
 * Bu dosya https://sourcedev.tr/feed.xml adresinde bir RSS 2.0 feed'i sunar.
 * 
 * RSS Nasıl Çalışır?
 * ─────────────────
 * 1. Bu endpoint, backend API'den son yayınlanan postları çeker
 * 2. Onları RSS 2.0 XML formatına dönüştürür
 * 3. RSS okuyucuları (Feedly, Inoreader, Thunderbird vb.) bu URL'yi
 *    periyodik olarak kontrol eder ve yeni içerikleri kullanıcıya gösterir
 * 
 * Neden Önemli?
 * ────────────
 * - SEO: Google ve diğer arama motorları RSS feed'lerini indexler
 * - Kullanıcı bağlılığı: Okuyucular yeni yazıları kaçırmaz
 * - Erişilebilirlik: Kullanıcılar siteye girmeden içerikleri takip edebilir
 * - Entegrasyon: Başka siteler/uygulamalar içeriklerini embed edebilir
 * - Standart: Dev.to, Medium, Hashnode gibi tüm büyük platformlar sunar
 */

// XML özel karakterlerini escape etme (güvenlik için zorunlu)
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')    // & → &amp;  (bu HER ZAMAN ilk yapılmalı)
    .replace(/</g, '&lt;')     // < → &lt;
    .replace(/>/g, '&gt;')     // > → &gt;
    .replace(/"/g, '&quot;')   // " → &quot;
    .replace(/'/g, '&apos;');  // ' → &apos;
}

// Markdown'dan düz metin çıkarma (RSS description'ları için)
function stripMarkdown(md) {
  if (!md) return '';
  return md
    .replace(/#{1,6}\s/g, '')           // Başlıklar: ## Başlık → Başlık
    .replace(/\*\*(.+?)\*\*/g, '$1')    // Kalın: **metin** → metin
    .replace(/\*(.+?)\*/g, '$1')        // İtalik: *metin* → metin
    .replace(/`(.+?)`/g, '$1')          // Kod: `kod` → kod
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Linkler: [metin](url) → metin
    .replace(/!\[.*?\]\(.+?\)/g, '')    // Görseller: ![alt](url) → kaldır
    .replace(/\n{2,}/g, '\n')           // Fazla boş satırları temizle
    .trim();
}

export async function GET() {
  let posts = [];

  try {
    // Backend API'den son 50 postu çek (sitemap.js ile aynı pattern)
    const res = await fetch(`${API_URL}/post/latest?page=1&pageSize=50`, {
      next: { revalidate: 1800 }, // 30 dakika cache (RSS okuyucuları zaten sık sık kontrol eder)
    });

    if (res.ok) {
      posts = await res.json();
    }
  } catch (error) {
    console.error('RSS feed fetch error:', error);
  }

  // ─────────────────────────────────────────────
  // RSS 2.0 XML Yapısı
  // ─────────────────────────────────────────────
  // <rss>              → Kök element, versiyon belirtir
  //   <channel>        → Feed hakkında bilgi (başlık, açıklama, link)
  //     <item>         → Her bir post/makale
  //       <title>      → Post başlığı
  //       <link>       → Post URL'i
  //       <description>→ Post özeti (ilk 300 karakter)
  //       <pubDate>    → Yayınlanma tarihi (RFC 2822 formatında)
  //       <guid>       → Benzersiz tanımlayıcı (genellikle URL)
  //       <category>   → Etiketler/taglar
  //     </item>
  //   </channel>
  // </rss>

  const itemsXml = posts
    .filter((post) => post.slug) // Slug'ı olmayan postları atla
    .map((post) => {
      const title = escapeXml(post.title || 'Untitled');
      const link = `${SITE_URL}/post/${encodeURIComponent(post.slug)}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()  // RFC 2822: "Thu, 13 Feb 2026 10:00:00 GMT"
        : new Date().toUTCString();

      // Excerpt'i temizle ve 300 karakterle sınırla
      const rawExcerpt = post.excerpt || '';
      const cleanExcerpt = stripMarkdown(rawExcerpt);
      const description = escapeXml(
        cleanExcerpt.length > 300
          ? cleanExcerpt.substring(0, 300) + '...'
          : cleanExcerpt
      );

      // Post'un etiketlerini <category> olarak ekle
      const tagsXml = (post.tags || [])
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n');

      // Yazar bilgisi
      const author = post.authorDisplayName
        ? `      <dc:creator>${escapeXml(post.authorDisplayName)}</dc:creator>`
        : '';

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${link}</guid>
${tagsXml}
${author}
    </item>`;
    })
    .join('\n');

  // Son build tarihi
  const lastBuildDate = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SourceDev</title>
    <link>${SITE_URL}</link>
    <description>Yazılımcılar için bilgi paylaşım ve networking platformu. Makaleler yaz, projelerini paylaş, topluluğa katıl.</description>
    <language>tr</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  // Response: Content-Type olarak "application/rss+xml" döndürüyoruz
  // Bu, tarayıcıların ve RSS okuyucularının bu dosyayı doğru tanımasını sağlar
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600', // 30dk client cache, 1 saat CDN cache
    },
  });
}
