import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/'], // Don't let Google scan private areas
    },
    sitemap: 'https://securityx.in/sitemap.xml',
  }
}