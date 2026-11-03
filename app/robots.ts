import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
  "/api/",
  "/auth/",
  "/dashboard/",
  "/scan/",
  "/osint/",
  "/gamezone/",
  "/profile/",
  "/roadmap/",
  "/directory/",
  "/learn/",
], // Don't let Google scan private areas
    },
    sitemap: 'https://securityx.in/sitemap.xml',
  }
}