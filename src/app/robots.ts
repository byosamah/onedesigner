import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/blog/admin/',
          '/client/dashboard/',
          '/designer/dashboard/',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/blog/admin/',
        ],
      },
    ],
    sitemap: 'https://onedesigner.app/sitemap.xml',
    host: 'https://onedesigner.app',
  };
}