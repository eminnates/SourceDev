const SITE_URL = 'https://sourcedev.tr';

export { SITE_URL };

export async function resolveLang(searchParamsPromise, fallback = 'en') {
  // Unwrap searchParams if it's a promise to fix dynamic API warnings
  const searchParams = await searchParamsPromise;
  const rawLang = searchParams?.lang;
  const lang = Array.isArray(rawLang) ? rawLang[0] : rawLang;

  if (lang === 'tr' || lang === 'en') {
    return lang;
  }

  return fallback === 'tr' ? 'tr' : 'en';
}

export function buildLocalizedUrl(pathname, lang = 'en', params = {}) {
  const url = new URL(pathname.startsWith('http') ? pathname : `${SITE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`);

  if (lang === 'tr') {
    url.searchParams.set('lang', 'tr');
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export function buildLocalizedHref(pathname, lang = 'en', params = {}) {
  const url = new URL(pathname.startsWith('http') ? pathname : `${SITE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`);

  if (lang === 'tr') {
    url.searchParams.set('lang', 'tr');
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return `${url.pathname}${url.search}${url.hash}`;
}

export async function buildLocalizedMetadata({
  searchParams,
  pathname,
  titleEn,
  titleTr,
  descriptionEn,
  descriptionTr,
  type = 'website',
  noindex = false,
  images = [],
  canonicalParams = {},
  fallbackLang = 'en',
  extra = {},
}) {
  const lang = await resolveLang(searchParams, fallbackLang);
  const title = lang === 'tr' ? titleTr : titleEn;
  const description = lang === 'tr' ? descriptionTr : descriptionEn;
  const canonical = buildLocalizedUrl(pathname, lang, canonicalParams);

  return {
    title,
    description,
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      locale: lang === 'tr' ? 'tr_TR' : 'en_US',
      title,
      description,
      url: canonical,
      images,
      ...extra.openGraph,
    },
    twitter: {
      card: images.length > 0 ? 'summary_large_image' : 'summary',
      title,
      description,
      images: images.map((image) => (typeof image === 'string' ? image : image.url)),
      ...extra.twitter,
    },
    alternates: {
      canonical,
      languages: {
        en: buildLocalizedUrl(pathname, 'en', canonicalParams),
        tr: buildLocalizedUrl(pathname, 'tr', canonicalParams),
      },
      ...extra.alternates,
    },
    ...extra.metadata,
  };
}
