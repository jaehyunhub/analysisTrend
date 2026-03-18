import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://analysistrend.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/community`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/magazine`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  return staticRoutes;
}
