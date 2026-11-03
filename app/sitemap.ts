import { MetadataRoute } from 'next'
import { guides } from "@/lib/guides"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://securityx.in' // Your actual domain
  
  return [
  {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${baseUrl}/guides`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  ...guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  })),
  {
    url: `${baseUrl}/legal`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${baseUrl}/support`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
]
}